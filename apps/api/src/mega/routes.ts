/**
 * The two MEGA stream addresses (V2-SPEC 2.4.1 to 2.4.5):
 *   /media/v/<id>.mp4?v=<tag>[&preview=6][&probe=1]   what /api/videos hands out
 *   /media/mega-<handle>.mp4                            the live v1.5 address, answered from the same row; for an admin it
 *                                                       also streams an unsaved link that was just checked (mega_probes)
 * A published row that is not in the bin streams for everyone; a draft, a binned row or a probe row only for an admin
 * (cookie session or Bearer). The row check always runs before any cache read.
 */
import { adminFromRequest } from '../auth';
import type { Env } from '../env';
import { b64urlEncode, megaClient, MegaError } from './protocol';
import { probeForHandle } from './inspect';
import { rowByHandle, rowById, sourceFromProbe, sourceFromRow, streamTag, type StreamRow } from './lookup';
import { errorResponse, probe, R2ChunkStore, serveStream, type ServeDeps, type StreamSource } from './stream';

type Ctx = { waitUntil(p: Promise<unknown>): void };

const notFound = () => new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

async function deps(env: Env, ctx: Ctx, url: URL): Promise<ServeDeps> {
  return {
    client: megaClient(env),
    cache: await caches.open('mega-v1'),
    mirror: env.MEDIA_MIRROR && env.MEGA_MIRROR === 'on' ? new R2ChunkStore(env.MEDIA_MIRROR) : undefined,
    cacheOrigin: url.origin,
    waitUntil: (p) => ctx.waitUntil(p),
    // Handles and byte offsets only: never a link, a key or a storage URL.
    log: (event, data) => console.log(event, JSON.stringify(data)),
  };
}

/** ?preview=3|6|10 (anything else that is set means 6). */
function previewOf(url: URL): number | undefined {
  const raw = url.searchParams.get('preview');
  if (raw === null) return undefined;
  const n = Number(raw);
  return [3, 6, 10].includes(n) ? n : 6;
}

/** Probe or stream one source, with the failure answer's fallback and the embed hand-over (503, file links, allowed callers). */
async function answer(req: Request, env: Env, ctx: Ctx, url: URL, src: StreamSource, cacheControl: string, fileFallback: boolean): Promise<Response> {
  const d = await deps(env, ctx, url);
  if (url.searchParams.has('probe')) {
    const res = await probe(src, d, { fileFallback, fileLink: 'p' in src.addr });
    // The MEGA embed (key included) leaves the server only here: a 503, a plain file link, a caller allowed to stream it (C3).
    if (res.status !== 503 || !('p' in src.addr)) return res;
    const body = { ...((await res.json()) as object), embed: `https://mega.nz/embed/${src.addr.p}#${b64urlEncode(src.fileKey)}` };
    return new Response(JSON.stringify(body), { status: 503, headers: res.headers });
  }
  return serveStream(req, src, d, { cacheControl, preview: previewOf(url), fileFallback });
}

async function streamRow(req: Request, env: Env, ctx: Ctx, url: URL, row: StreamRow, cacheFor: (isPublic: boolean) => string): Promise<Response> {
  const isPublic = row.published === 1 && !row.deleted_at;
  if (!isPublic && !(await adminFromRequest(req, env))) return notFound();
  const src = sourceFromRow(row, env);
  if (!src) return errorResponse(new MegaError(row.mega_url ? 'bad-link' : 'bad-key', 'stored link unusable'), { fileFallback: !!row.file_ref });
  src.etagTag = await streamTag(row);
  return answer(req, env, ctx, url, src, isPublic ? cacheFor(true) : 'private, no-store', !!row.file_ref);
}

/** /media/v/<id>.mp4 */
export async function serveVideo(req: Request, env: Env, ctx: Ctx, id: string): Promise<Response> {
  const url = new URL(req.url);
  const row = await rowById(env.DB, id);
  if (!row || !row.mega_handle) return notFound();
  const tag = await streamTag(row);
  const v = url.searchParams.get('v');
  return streamRow(req, env, ctx, url, row, () => (v === null ? 'public, max-age=300' : v === tag ? 'public, max-age=604800' : 'no-store'));
}

/** /media/mega-<handle>.mp4 */
export async function serveLegacy(req: Request, env: Env, ctx: Ctx, handle: string): Promise<Response> {
  const url = new URL(req.url);
  const row = await rowByHandle(env.DB, handle);
  if (row) return streamRow(req, env, ctx, url, row, () => 'public, max-age=3600');
  // No library row: an admin may preview a link checked in the last 24 hours (not saved yet).
  if (!(await adminFromRequest(req, env))) return notFound();
  const p = await probeForHandle(env.DB, handle);
  if (!p || p.error) return notFound();
  const src = sourceFromProbe(p);
  if (!src) return notFound();
  return answer(req, env, ctx, url, src, 'private, no-store', false);
}
