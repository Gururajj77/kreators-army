/**
 * Port of the prototype's serve.ts (.work/tools/v2/mega/src). Serves a MEGA file as an ordinary, seekable, same-origin video: 200 / 206 / 416 with Accept-Ranges, Content-Range and
 * Content-Length, decrypted in the Worker.
 *
 * Caching (Cache API, per colo): plaintext in aligned CHUNK-byte pieces keyed by file + key tag + size + chunk index, so
 * repeat plays, seeks and hover previews do not reach MEGA. A response never spans more than MAX_CHUNKS chunks. Each run
 * of missing chunks is one MEGA range request; the answer closes as soon as its last byte is out and the rest of the last
 * chunk is fetched in waitUntil so the whole chunk can be stored.
 *
 * The resolved storage URL ('g') is kept per isolate and in the Cache API for G_TTL. An over-quota answer trips a
 * per-isolate breaker so later misses fail fast with 503 + Retry-After instead of waiting on MEGA.
 */
import { decryptAt, fetchCipher, fileCipher, getFile, MegaError, sha256Hex, type FileAddr, type FileCipher, type MegaClient, type Resolved } from './protocol';

export const CHUNK = 1024 * 1024; // multiple of 16
export const MAX_CHUNKS = 4; // at most 4 MiB per answer, like the live route
const G_TTL_S = 600;
/** Never serve more than this in preview mode, whatever the file. */
export const PREVIEW_MAX = 8 * 1024 * 1024;
/** Preview bound when the file was never sniffed: about 6 s of a 720p file at 4 Mbps. */
export const PREVIEW_UNKNOWN = 3 * 1024 * 1024;

/** What the Worker needs to stream one file. Built from a D1 row (or a MEGA_LINKS line). The key never leaves the Worker. */
export interface StreamSource {
  /** Non-secret file name for logs and cache keys: the file handle, or "<folder>.<node>". */
  tag: string;
  addr: FileAddr;
  /** 32-byte file key. */
  fileKey: Uint8Array;
  /** Bytes, from D1. 0 when unknown (legacy MEGA_LINKS entries): then 'g' supplies it. */
  size: number;
  /** Byte bound for ?preview=<s>, from the sniffed sample tables (videos.mega_meta.prev). */
  previewEnds?: Record<string, number>;
  /** The stream version tag (lookup.streamTag) used in the ETag; defaults to `tag`. */
  etagTag?: string;
}

/** Optional second tier (R2 mirror). Off by default; see v2/mega.md "R2 mirror". */
export interface ChunkStore {
  get(key: string): Promise<Uint8Array | null>;
  put(key: string, bytes: Uint8Array): Promise<void>;
}

export interface ServeDeps {
  client: MegaClient;
  /** Cache API cache for chunks and resolved URLs. Omit to disable. */
  cache?: Cache;
  mirror?: ChunkStore;
  waitUntil?: (p: Promise<unknown>) => void;
  /** Synthetic origin for cache keys; never fetched. */
  cacheOrigin?: string;
  chunkSize?: number;
  maxChunks?: number;
  log?: (event: string, data: Record<string, unknown>) => void;
}

export interface ServeOptions {
  /** Seconds of preview (3, 6 or 10): bytes past the bound answer 416. */
  preview?: number;
  /** Cache-Control for successful answers (the route decides: versioned URL, unpublished, ...). */
  cacheControl?: string;
  /** The row has a bundled copy (file_ref): failures point the player there first (V2-SPEC C10). */
  fileFallback?: boolean;
}

/** What a failure answer tells the player to do next (V2-SPEC 2.4.5). */
export interface FallbackInfo {
  fileFallback?: boolean;
  /** A plain file link (MEGA's embed player takes file links only). */
  fileLink?: boolean;
}

// ---------------------------------------------------------------- range header

export type RangeAsk = { kind: 'none' } | { kind: 'range'; start: number; end: number } | { kind: 'unsatisfiable' };

/** RFC 9110 14.1.2 single byte range. Multiple ranges and bad syntax are ignored (a full answer), as RFC 9110 14.2 allows. */
export function parseRange(header: string | null, size: number): RangeAsk {
  if (!header) return { kind: 'none' };
  const m = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(header);
  if (!m || (!m[1] && !m[2])) return { kind: 'none' };
  if (!m[1]) {
    const n = Number(m[2]);
    if (n === 0 || size === 0) return { kind: 'unsatisfiable' };
    return { kind: 'range', start: Math.max(0, size - n), end: size - 1 };
  }
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (start >= size || (m[2] && Number(m[2]) < start)) return { kind: 'unsatisfiable' };
  return { kind: 'range', start, end };
}

// ---------------------------------------------------------------- per-isolate state

const resolvedUrls = new Map<string, { r: Resolved; at: number }>();
const ciphers = new Map<string, Promise<FileCipher>>();
const keyTags = new Map<string, Promise<string>>();
let quotaUntil = 0;

export const counters = { gApi: 0, gCacheHit: 0, megaFetches: 0, megaBytes: 0, chunkHits: 0, chunkMisses: 0, chunkPuts: 0, mirrorHits: 0 };

export function resetIsolateState(): void {
  resolvedUrls.clear();
  ciphers.clear();
  keyTags.clear();
  quotaUntil = 0;
  for (const k of Object.keys(counters) as (keyof typeof counters)[]) counters[k] = 0;
}

const origin = (deps: ServeDeps) => deps.cacheOrigin ?? 'https://mega-cache.invalid';

/** First 12 hex characters of SHA-256(file key): changes when the file is replaced, reveals nothing. */
function keyTag(src: StreamSource): Promise<string> {
  const id = `${src.tag}`;
  let p = keyTags.get(id);
  if (!p) keyTags.set(id, (p = sha256Hex(src.fileKey, 12)));
  return p;
}

async function getResolved(src: StreamSource, deps: ServeDeps, fresh = false): Promise<Resolved> {
  const hit = resolvedUrls.get(src.tag);
  if (!fresh && hit && Date.now() - hit.at < G_TTL_S * 1000) return hit.r;
  const gKey = `${origin(deps)}/__mega/g/${src.tag}/${await keyTag(src)}`;
  if (!fresh && deps.cache) {
    const cached = await deps.cache.match(gKey).catch(() => undefined);
    if (cached) {
      const r = (await cached.json()) as Resolved;
      counters.gCacheHit++;
      resolvedUrls.set(src.tag, { r, at: Date.now() });
      return r;
    }
  }
  const t0 = Date.now();
  counters.gApi++;
  const r = await getFile(deps.client, src.addr, src.fileKey);
  deps.log?.('mega.resolve', { tag: src.tag, ms: Date.now() - t0, size: r.size });
  resolvedUrls.set(src.tag, { r, at: Date.now() });
  if (deps.cache) {
    const put = deps.cache.put(gKey, new Response(JSON.stringify(r), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${G_TTL_S}` } })).catch(() => undefined);
    deps.waitUntil ? deps.waitUntil(put) : await put;
  }
  return r;
}

function getCipher(src: StreamSource): Promise<FileCipher> {
  let p = ciphers.get(src.tag);
  if (!p) {
    p = fileCipher(src.fileKey);
    ciphers.set(src.tag, p);
    p.catch(() => ciphers.delete(src.tag));
  }
  return p;
}

function tripQuota(err: MegaError): void {
  if (err.kind === 'over-quota') quotaUntil = Date.now() + Math.min(3600, Math.max(60, err.retryAfter ?? 300)) * 1000;
}

// ---------------------------------------------------------------- MEGA reads

/** Ciphertext [from, to] from MEGA, decrypted, as pieces. Re-resolves once when the storage URL went stale. */
async function* megaPlain(src: StreamSource, deps: ServeDeps, from: number, to: number, signal: AbortSignal): AsyncGenerator<Uint8Array> {
  if (quotaUntil > Date.now()) throw new MegaError('over-quota', 'MEGA quota breaker is open', 509, Math.ceil((quotaUntil - Date.now()) / 1000));
  const cipher = await getCipher(src);
  let res: Response;
  try {
    counters.megaFetches++;
    res = await fetchCipher(deps.client, (await getResolved(src, deps)).url, from, to, signal);
  } catch (err) {
    if (!(err instanceof MegaError)) throw err;
    tripQuota(err);
    if (err.kind === 'over-quota') throw err;
    try {
      counters.megaFetches++;
      res = await fetchCipher(deps.client, (await getResolved(src, deps, true)).url, from, to, signal);
    } catch (again) {
      if (again instanceof MegaError) tripQuota(again);
      throw again;
    }
  }
  const reader = res.body!.getReader();
  let pos = from;
  let carry = new Uint8Array(0);
  let finished = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      counters.megaBytes += value.length;
      let buf = value;
      if (carry.length) {
        buf = new Uint8Array(carry.length + value.length);
        buf.set(carry);
        buf.set(value, carry.length);
      }
      // Decrypt whole 16-byte blocks as they arrive; a short tail waits for the rest of its block.
      const whole = buf.length - ((pos + buf.length) % 16);
      if (whole > 0) {
        yield await decryptAt(cipher, buf.subarray(0, whole), pos);
        pos += whole;
        carry = buf.slice(whole);
      } else carry = buf.slice();
    }
    finished = true;
    if (carry.length) {
      yield await decryptAt(cipher, carry, pos);
      pos += carry.length;
    }
  } finally {
    // Stopped early (viewer gone, error): drop the MEGA connection instead of draining it.
    if (!finished) await reader.cancel().catch(() => undefined);
    else reader.releaseLock();
  }
  if (pos !== to + 1) throw new MegaError('busy', `storage stream ended early at ${pos} of ${to + 1}`);
}

function chunkKey(deps: ServeDeps, src: StreamSource, tag: string, size: number, C: number, index: number): string {
  return `${origin(deps)}/__mega/c/${src.tag}/${tag}/${size}/${C}/${index}`;
}

/**
 * Plaintext [start, end] as pieces. Cached chunks come from the cache (or the mirror); each run of missing chunks is one
 * MEGA request. Whole chunks that pass through are stored. After `end`, the generator keeps going (yielding nothing) to
 * finish the chunk it is filling; the caller closes the answer first and drives the rest in waitUntil.
 */
async function* plainRange(src: StreamSource, deps: ServeDeps, size: number, start: number, end: number, signal: AbortSignal, puts: Promise<unknown>[]): AsyncGenerator<Uint8Array> {
  const C = deps.chunkSize ?? CHUNK;
  const first = Math.floor(start / C);
  const last = Math.floor(end / C);
  const tag = await keyTag(src);
  const cache = deps.cache;
  const chunkLen = (i: number) => Math.min(C, size - i * C);
  // Cached chunks stay as unread Response bodies and are streamed in order, so an answer never holds 4 MiB in memory.
  type Hit = { res: Response } | { bytes: Uint8Array } | null;
  const hits: Hit[] = await Promise.all(
    Array.from({ length: last - first + 1 }, async (_, k): Promise<Hit> => {
      const i = first + k;
      if (cache) {
        const r = await cache.match(chunkKey(deps, src, tag, size, C, i)).catch(() => undefined);
        if (r && r.body && Number(r.headers.get('Content-Length')) === chunkLen(i)) return { res: r };
        if (r?.body) await r.body.cancel().catch(() => undefined);
      }
      if (deps.mirror) {
        const b = await deps.mirror.get(`${src.tag}/${tag}/${size}/${C}/${i}`).catch(() => null);
        if (b && b.length === chunkLen(i)) {
          counters.mirrorHits++;
          if (cache) puts.push(storeChunk(deps, chunkKey(deps, src, tag, size, C, i), b, null));
          return { bytes: b };
        }
      }
      return null;
    }),
  );
  const hitCount = hits.filter(Boolean).length;
  counters.chunkHits += hitCount;
  counters.chunkMisses += hits.length - hitCount;
  deps.log?.('mega.chunks', { tag: src.tag, first, last, hits: hitCount });

  let i = first;
  try {
    while (i <= last) {
      const hit = hits[i - first];
      const cStart = i * C;
      if (hit) {
        const a = Math.max(start, cStart) - cStart;
        const b = Math.min(end, cStart + chunkLen(i) - 1) - cStart;
        if ('bytes' in hit) yield hit.bytes.subarray(a, b + 1);
        else {
          const reader = hit.res.body!.getReader();
          let pos = 0;
          let got = 0;
          try {
            while (pos <= b) {
              const { done, value } = await reader.read();
              if (done) break;
              const s = Math.max(a - pos, 0);
              const e = Math.min(value.length, b + 1 - pos);
              if (e > s) {
                yield value.subarray(s, e);
                got += e - s;
              }
              pos += value.length;
            }
          } finally {
            if (pos < chunkLen(i)) await reader.cancel().catch(() => undefined);
          }
          if (got !== b - a + 1) throw new MegaError('busy', `cached chunk ${i} was short`);
        }
        hits[i - first] = null;
        i++;
        continue;
      }
      let j = i;
      while (j + 1 <= last && !hits[j + 1 - first]) j++;
      // Start on the chunk boundary when that costs little, so this chunk can be stored too; else start at the asked block.
      const fromBoundary = i !== first || start - cStart <= C / 4;
      const from = fromBoundary ? cStart : start - (start % 16);
      // Whole chunks, so they can be stored; but no point reading past `end` for a chunk that cannot be stored.
      const to = !fromBoundary && j === i ? end : Math.min(size, (j + 1) * C) - 1;

      let fill: { index: number; buf: Uint8Array; n: number } | null = null;
      let pos = from;
      for await (const piece of megaPlain(src, deps, from, to, signal)) {
        const a = Math.max(pos, start);
        const b = Math.min(pos + piece.length - 1, end);
        if (a <= b) yield piece.subarray(a - pos, b - pos + 1);
        if (cache || deps.mirror) {
          let off = 0;
          while (off < piece.length) {
            const abs = pos + off;
            const k = Math.floor(abs / C);
            const inChunk = abs - k * C;
            const n = Math.min(chunkLen(k) - inChunk, piece.length - off);
            if (!fill && inChunk === 0) fill = { index: k, buf: new Uint8Array(chunkLen(k)), n: 0 };
            if (fill && fill.index === k) {
              fill.buf.set(piece.subarray(off, off + n), inChunk);
              fill.n += n;
              if (fill.n === fill.buf.length) {
                const key = chunkKey(deps, src, tag, size, C, k);
                puts.push(storeChunk(deps, cache ? key : null, fill.buf, deps.mirror ? `${src.tag}/${tag}/${size}/${C}/${k}` : null));
                fill = null;
              }
            }
            off += n;
          }
        }
        pos += piece.length;
      }
      i = j + 1;
    }
  } finally {
    // Stopped early: release cached bodies that were matched but never read.
    for (const h of hits) if (h && 'res' in h) await h.res.body?.cancel().catch(() => undefined);
  }
}

function storeChunk(deps: ServeDeps, cacheKey: string | null, bytes: Uint8Array, mirrorKey: string | null): Promise<unknown> {
  counters.chunkPuts++;
  const jobs: Promise<unknown>[] = [];
  if (cacheKey && deps.cache)
    jobs.push(
      deps.cache
        .put(cacheKey, new Response(bytes, { headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes.length), 'Cache-Control': 'public, max-age=31536000, immutable' } }))
        .catch(() => undefined),
    );
  if (mirrorKey && deps.mirror) jobs.push(deps.mirror.put(mirrorKey, bytes).catch(() => undefined));
  return Promise.all(jobs);
}

// ---------------------------------------------------------------- answers

const PLAIN_ERROR: Record<string, string> = {
  'over-quota': 'MEGA is out of transfer quota for now',
  busy: 'MEGA is busy',
  'not-found': 'the MEGA file is gone',
  removed: 'the MEGA file was removed',
  blocked: 'the MEGA file was taken down',
  'bad-key': 'the MEGA link no longer opens this file',
  'bad-link': 'the stored MEGA link is not valid',
  upstream: 'MEGA answered strangely',
};

/**
 * What a player (or the probe) can act on (V2-SPEC 2.4.5):
 *  503 + X-Mega-Error: over-quota | busy, Retry-After (30 to 3600)  -> bundled copy, else the MEGA embed (file links)
 *  404 + X-Mega-Error: not-found | removed | blocked                -> bundled copy, else "can't play here"
 *  502 + X-Mega-Error: bad-key | bad-link | upstream                -> same as 404 for viewers; the admin list shows it
 * The body is JSON: { error, message, retryAfter?, fallback: 'file' | 'embed' | 'none' }. Never cached.
 */
export function errorResponse(err: unknown, fb: FallbackInfo = {}): Response {
  const e = err instanceof MegaError ? err : new MegaError('upstream', String(err));
  const status = e.kind === 'over-quota' || e.kind === 'busy' ? 503 : e.kind === 'not-found' || e.kind === 'removed' || e.kind === 'blocked' ? 404 : 502;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Mega-Error': e.kind };
  let retryAfter: number | undefined;
  if (status === 503) {
    retryAfter = Math.min(3600, Math.max(30, e.retryAfter ?? (e.kind === 'busy' ? 30 : 300)));
    headers['Retry-After'] = String(retryAfter);
  }
  const fallback = fb.fileFallback ? 'file' : status === 503 && fb.fileLink ? 'embed' : 'none';
  const body = { error: e.kind, message: PLAIN_ERROR[e.kind] ?? 'unavailable', ...(retryAfter ? { retryAfter } : {}), fallback };
  return new Response(JSON.stringify(body), { status, headers });
}

/** Asks MEGA directly (bypassing the chunk cache) whether this file can be streamed right now. For the player's fallback. */
export async function probe(src: StreamSource, deps: ServeDeps, fb: FallbackInfo = {}): Promise<Response> {
  try {
    if (quotaUntil > Date.now()) throw new MegaError('over-quota', 'breaker open', 509, Math.ceil((quotaUntil - Date.now()) / 1000));
    const r = await getResolved(src, deps);
    const ctl = new AbortController();
    try {
      const res = await fetchCipher(deps.client, r.url, 0, 15, ctl.signal);
      await res.arrayBuffer();
    } catch (err) {
      if (err instanceof MegaError) tripQuota(err);
      if (!(err instanceof MegaError) || err.kind === 'over-quota') throw err;
      const again = await getResolved(src, deps, true);
      await (await fetchCipher(deps.client, again.url, 0, 15)).arrayBuffer();
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof MegaError) tripQuota(err);
    deps.log?.('mega.probe', { tag: src.tag, error: err instanceof MegaError ? err.kind : 'internal' });
    return errorResponse(err, fb);
  }
}

function fixedLength(length: number): { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> } {
  // workerd: FixedLengthStream keeps Content-Length on a streamed answer (Safari's player relies on it). Node: identity.
  const F = (globalThis as any).FixedLengthStream;
  return F ? new F(length) : new TransformStream<Uint8Array, Uint8Array>();
}

export async function serveStream(request: Request, src: StreamSource, deps: ServeDeps, opts: ServeOptions = {}): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });
  const fb: FallbackInfo = { fileFallback: opts.fileFallback, fileLink: 'p' in src.addr };
  let size = src.size;
  if (!(size > 0)) {
    try {
      size = (await getResolved(src, deps)).size;
    } catch (err) {
      if (err instanceof MegaError) tripQuota(err);
      return errorResponse(err, fb);
    }
  }
  const etag = `"m-${src.etagTag ?? src.tag}-${size}"`;
  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    ETag: etag,
    'Cache-Control': opts.cacheControl ?? 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  });

  // Preview: only the bytes that hold the first N seconds of every track.
  let limit = size;
  if (opts.preview) {
    const known = src.previewEnds?.[String(opts.preview)];
    limit = Math.min(size, PREVIEW_MAX, known ? known + 64 * 1024 : PREVIEW_UNKNOWN);
    headers.set('X-Preview-Bytes', String(limit));
  }

  let ask = parseRange(request.headers.get('Range'), size);
  const ifRange = request.headers.get('If-Range');
  if (ask.kind === 'range' && ifRange && ifRange !== etag) ask = { kind: 'none' };
  if (ask.kind === 'range' && ask.start >= limit) ask = { kind: 'unsatisfiable' };
  if (ask.kind === 'unsatisfiable') {
    headers.set('Content-Range', `bytes */${size}`);
    headers.set('Cache-Control', 'no-store');
    return new Response(null, { status: 416, headers });
  }

  const C = deps.chunkSize ?? CHUNK;
  const max = deps.maxChunks ?? MAX_CHUNKS;
  let start = 0;
  let end = limit - 1;
  let partial = limit < size;
  if (ask.kind === 'range') {
    start = ask.start;
    end = Math.min(ask.end, limit - 1);
    partial = true;
  }
  // Never more than `max` chunks in one answer. A request with no Range still gets a 206 for its first part, which every
  // player accepts (the live route does the same).
  const capEnd = (Math.floor(start / C) + max) * C - 1;
  if (end > capEnd) {
    end = capEnd;
    partial = true;
  }
  const length = end - start + 1;
  headers.set('Content-Length', String(length));
  if (partial) headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  const status = partial ? 206 : 200;
  if (request.method === 'HEAD' || length === 0) return new Response(null, { status, headers });

  const ctl = new AbortController();
  const puts: Promise<unknown>[] = [];
  const it = plainRange(src, deps, size, start, end, ctl.signal, puts);
  // Pull the first piece before answering, so a MEGA failure becomes a status code and not a broken stream.
  let first: IteratorResult<Uint8Array>;
  try {
    first = await it.next();
  } catch (err) {
    if (err instanceof MegaError) tripQuota(err);
    deps.log?.('mega.error', { tag: src.tag, start, error: err instanceof MegaError ? err.kind : 'internal' });
    return errorResponse(err, fb);
  }

  const { readable, writable } = fixedLength(length);
  const pump = (async () => {
    const w = writable.getWriter();
    let sent = 0;
    try {
      for (let r = first; !r.done; r = await it.next()) {
        if (sent >= length) continue; // filling the cache after the answer is complete
        await w.write(r.value);
        sent += r.value.length;
        if (sent >= length) await w.close();
      }
      if (sent < length) throw new Error(`short body: ${sent} of ${length}`);
    } catch (err) {
      // The viewer went away (seek, hover ended) or MEGA failed mid-stream: stop reading MEGA.
      ctl.abort();
      await it.return(undefined).catch(() => undefined);
      if (sent < length) await w.abort(err).catch(() => undefined);
      deps.log?.('mega.stream-end', { tag: src.tag, start, sent, length, error: err instanceof MegaError ? err.kind : 'closed' });
    } finally {
      await Promise.all(puts);
    }
  })();
  deps.waitUntil ? deps.waitUntil(pump) : void pump;
  return new Response(readable, { status, headers });
}

/** The optional R2 mirror (V2-SPEC 2.4.3, D10: off). Read order: Cache API, then R2, then MEGA. */
export class R2ChunkStore implements ChunkStore {
  constructor(private bucket: R2Bucket) {}
  async get(key: string): Promise<Uint8Array | null> {
    const o = await this.bucket.get(`mega/${key}`);
    return o ? new Uint8Array(await o.arrayBuffer()) : null;
  }
  async put(key: string, bytes: Uint8Array): Promise<void> {
    await this.bucket.put(`mega/${key}`, bytes, { httpMetadata: { contentType: 'application/octet-stream' } });
  }
}
