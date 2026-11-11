/**
 * Hover previews (migration 0008): a short silent loop per video, made in the admin's browser and stored in D1 as a BLOB of at
 * most 600 KiB, MP4 or WebM by magic bytes only, at a versioned public address /media/pv/<id>/<sha16>.<mp4|webm>.
 *
 * Unlike the poster route, every request first reads the row's small columns from D1 (never the BLOB), so an unpublished or
 * binned video's clip stops being public at once without the admin routes having to evict anything; the edge cache then only
 * saves reading the BLOB. Published clips are immutable for browsers (the address changes with the bytes) and live a day at
 * the edge. A draft's or binned video's clip is served to an admin only, never cached. A stale sha redirects to the current
 * address. Byte ranges (200, 206, 416) are cut here: Safari will not play a video from a server that ignores them.
 */
import { adminFromRequest } from './auth';
import type { Env } from './env';

export const PREVIEW_MAX = 600 * 1024;

export type PreviewMime = 'video/mp4' | 'video/webm';

const EXT: Record<PreviewMime, 'mp4' | 'webm'> = { 'video/mp4': 'mp4', 'video/webm': 'webm' };
export const previewExt = (mime: string): 'mp4' | 'webm' => EXT[mime as PreviewMime] ?? 'mp4';

/** The public address of a stored clip. */
export const previewPath = (id: string, sha: string, mime: string) => `/media/pv/${encodeURIComponent(id)}/${sha}.${previewExt(mime)}`;

/**
 * The container from the first bytes, ignoring what the request declared: an ISO BMFF file whose first box is `ftyp` (MP4) or
 * an EBML header whose DocType is webm. Anything else (HTML, an image, a Matroska file that is not WebM, a bare `mdat`) is null.
 */
export function sniffClip(bytes: Uint8Array): PreviewMime | null {
  const b = bytes;
  if (b.length >= 12 && String.fromCharCode(b[4]!, b[5]!, b[6]!, b[7]!) === 'ftyp') {
    const size = ((b[0]! << 24) | (b[1]! << 16) | (b[2]! << 8) | b[3]!) >>> 0;
    if (size >= 16 && size <= 256 && size <= b.length) return 'video/mp4';
    return null;
  }
  if (b.length >= 16 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) {
    // The DocType element (0x42 0x82) sits inside the first few dozen bytes of the EBML header.
    const head = String.fromCharCode(...b.subarray(0, Math.min(64, b.length)));
    const at = head.indexOf('\x42\x82');
    if (at >= 0 && head.slice(at + 3, at + 7) === 'webm') return 'video/webm';
    return null;
  }
  return null;
}

export async function clipSha(bytes: Uint8Array): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(h.subarray(0, 8), (x) => x.toString(16).padStart(2, '0')).join('');
}

/** The edge-cache key of a clip address (origin + pathname; never the query, a Range or another header). */
export const previewCacheKey = (origin: string, id: string, sha: string, mime: string) => `${origin}${previewPath(id, sha, mime)}`;

/** Removes a clip's edge copy in this location (replace, remove); other locations expire within a day. */
export async function evictPreview(origin: string, id: string, sha: string | null | undefined, mime: string | null | undefined): Promise<void> {
  if (!sha || !mime) return;
  try {
    await caches.default.delete(previewCacheKey(origin, id, sha, mime));
  } catch {
    // no edge cache (tests): nothing to evict
  }
}

const notFound = () => new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

interface ClipHead {
  sha: string;
  mime: string;
  published: number;
  deleted_at: string | null;
}

/** One `bytes=a-b`, `bytes=a-` or `bytes=-n` range against `size`: the slice, 'bad' for a 416, or null for the whole file. */
export function parseRange(header: string | null, size: number): { start: number; end: number } | 'bad' | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header?.trim() ?? '');
  if (!m || (!m[1] && !m[2])) return null;
  let start: number;
  let end: number;
  if (!m[1]) {
    const n = Number(m[2]);
    if (n === 0) return 'bad';
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  }
  if (start >= size || start > end) return 'bad';
  return { start, end };
}

/** /media/pv/<id>/<sha16>.<ext> */
export async function servePreview(req: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, id: string, sha: string, ext: string): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });

  // Small columns only: the BLOB is read below, and only when the edge has no copy.
  const head = await env.DB.prepare('SELECT pv.sha, pv.mime, v.published, v.deleted_at FROM video_previews pv JOIN videos v ON v.id = pv.video_id WHERE pv.video_id = ?').bind(id).first<ClipHead>();
  if (!head) return notFound();
  const isPublic = head.published === 1 && !head.deleted_at;
  if (!isPublic && !(await adminFromRequest(req, env))) return notFound();

  if (head.sha !== sha || previewExt(head.mime) !== ext) {
    return new Response(null, { status: 307, headers: { Location: previewPath(id, head.sha, head.mime), 'Cache-Control': isPublic ? 'public, max-age=300' : 'private, no-store' } });
  }

  const etag = `"${head.sha}"`;
  const cacheControl = isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store';
  if (req.headers.get('If-None-Match') === etag) return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': cacheControl } });

  const url = new URL(req.url);
  const key = new Request(previewCacheKey(url.origin, id, head.sha, head.mime));
  let bytes: Uint8Array | null = null;
  if (isPublic) {
    const edge = await caches.default.match(key).catch(() => undefined);
    if (edge) bytes = new Uint8Array(await edge.arrayBuffer());
  }
  if (!bytes) {
    const row = await env.DB.prepare('SELECT bytes FROM video_previews WHERE video_id = ? AND sha = ?').bind(id, head.sha).first<{ bytes: number[] | ArrayBuffer | Uint8Array }>();
    if (!row) return notFound();
    // D1 hands a BLOB back as a plain array of numbers.
    bytes = row.bytes instanceof Uint8Array ? row.bytes : new Uint8Array(row.bytes as ArrayLike<number>);
    if (isPublic) {
      // The edge copy lives a day at most, and is only ever read after the D1 check above, so unpublishing takes effect at once.
      const copy = new Response(bytes.slice(), { headers: { 'Content-Type': head.mime, 'Cache-Control': 'public, s-maxage=86400' } });
      ctx.waitUntil(caches.default.put(key, copy).catch(() => undefined));
    }
  }

  const size = bytes.length;
  const headers: Record<string, string> = {
    'Content-Type': head.mime,
    'Accept-Ranges': 'bytes',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': cacheControl,
  };
  const range = parseRange(req.headers.get('Range'), size);
  if (range === 'bad') return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
  if (range) {
    const part = bytes.subarray(range.start, range.end + 1);
    return new Response(req.method === 'HEAD' ? null : part, {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${range.start}-${range.end}/${size}`, 'Content-Length': String(part.length) },
    });
  }
  return new Response(req.method === 'HEAD' ? null : bytes, { status: 200, headers: { ...headers, 'Content-Length': String(size) } });
}
