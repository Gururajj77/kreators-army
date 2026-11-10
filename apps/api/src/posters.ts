/**
 * Posters (admin brief 4.5): one frame picked from the stream or an uploaded image per video, stored in D1 as a BLOB of at
 * most 512 KiB, JPEG, PNG or WebP by magic bytes only, at a versioned public address /media/p/<id>/<sha16>.<ext>.
 *
 * The public route reads the edge cache first (only published posters are ever put there), then D1. A draft's or binned
 * video's poster is served to an admin only, never cached. A stale sha redirects to the current address.
 */
import { adminFromRequest } from './auth';
import type { Env } from './env';
import { posterExt } from './videoRows';

export { posterUrl } from './videoRows';

export const POSTER_MAX = 512 * 1024;

/** The image type from the first bytes, ignoring what the request declared: JPEG, PNG or WebP, else null (SVG, GIF, HTML...). */
export function sniffImage(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b.length >= 12 && String.fromCharCode(b[0]!, b[1]!, b[2]!, b[3]!) === 'RIFF' && String.fromCharCode(b[8]!, b[9]!, b[10]!, b[11]!) === 'WEBP') return 'image/webp';
  return null;
}

export async function posterSha(bytes: Uint8Array): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(h.subarray(0, 8), (x) => x.toString(16).padStart(2, '0')).join('');
}

/** The edge-cache key of a poster address (origin + pathname; never the query or a header). */
export const posterCacheKey = (origin: string, id: string, sha: string, mime: string) => `${origin}/media/p/${encodeURIComponent(id)}/${sha}.${posterExt(mime)}`;

/** Removes a poster's edge copy in this location (replace, remove, unpublish); other locations expire within a day. */
export async function evictPoster(origin: string, id: string, sha: string | null | undefined, mime: string | null | undefined): Promise<void> {
  if (!sha || !mime) return;
  try {
    await caches.default.delete(posterCacheKey(origin, id, sha, mime));
  } catch {
    // no edge cache (tests): nothing to evict
  }
}

const notFound = () => new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

interface PosterRow {
  sha: string;
  mime: string;
  bytes: number[] | ArrayBuffer | Uint8Array;
  published: number;
  deleted_at: string | null;
}

/** /media/p/<id>/<sha16>.<ext> */
export async function servePoster(req: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, id: string, sha: string, ext: string): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });
  const url = new URL(req.url);
  const key = `${url.origin}${url.pathname}`;
  const edge = await caches.default.match(new Request(key)).catch(() => undefined);
  if (edge) return edge;

  const row = await env.DB.prepare('SELECT p.sha, p.mime, p.bytes, v.published, v.deleted_at FROM posters p JOIN videos v ON v.id = p.video_id WHERE p.video_id = ?').bind(id).first<PosterRow>();
  if (!row) return notFound();
  const isPublic = row.published === 1 && !row.deleted_at;
  if (!isPublic && !(await adminFromRequest(req, env))) return notFound();

  if (row.sha !== sha || posterExt(row.mime) !== ext) {
    const to = `/media/p/${encodeURIComponent(id)}/${row.sha}.${posterExt(row.mime)}`;
    return new Response(null, { status: 307, headers: { Location: to, 'Cache-Control': isPublic ? 'public, max-age=300' : 'private, no-store' } });
  }
  // D1 hands a BLOB back as a plain array of numbers.
  const bytes = row.bytes instanceof Uint8Array ? row.bytes : new Uint8Array(row.bytes as ArrayLike<number>);
  const headers = {
    'Content-Type': row.mime,
    'Content-Length': String(bytes.length),
    ETag: `"${row.sha}"`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store',
  };
  if (req.headers.get('If-None-Match') === `"${row.sha}"`) return new Response(null, { status: 304, headers: { ETag: headers.ETag, 'Cache-Control': headers['Cache-Control'] } });
  if (isPublic) {
    // The edge copy lives a day at most, so a deleted poster cannot outlive its row by more than that anywhere.
    const copy = new Response(bytes, { headers: { ...headers, 'Cache-Control': 'public, s-maxage=86400, max-age=31536000, immutable' } });
    ctx.waitUntil(caches.default.put(new Request(key), copy).catch(() => undefined));
  }
  return new Response(req.method === 'HEAD' ? null : bytes, { status: 200, headers });
}
