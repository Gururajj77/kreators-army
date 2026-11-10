import fs from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { b64urlDecode, type MegaClient } from '../../src/mega/protocol';
import { sniff } from '../../src/mega/sniff';
import { counters, errorResponse, parseRange, probe, resetIsolateState, serveStream, type StreamSource } from '../../src/mega/stream';
import { MegaError } from '../../src/mega/protocol';
import { MemCache, meta, startMock, type Mock } from './helpers';

const RODE = meta.files.RoDe0001;
const ANSH = meta.files.AnSh0001;
const rodePlain = fs.readFileSync(RODE.src);
const anshPlain = fs.readFileSync(ANSH.src);
const N = rodePlain.length;
const C = 1024 * 1024;

let mock: Mock;
let client: MegaClient;
beforeAll(async () => {
  mock = await startMock();
  client = { apiBase: mock.base, testStorageOrigin: mock.origin };
});
afterAll(() => mock?.stop());
beforeEach(async () => {
  await mock.ctl('__reset');
  resetIsolateState();
});

function src(over: Partial<StreamSource> = {}): StreamSource {
  return { tag: 'RoDe0001', addr: { p: 'RoDe0001' }, fileKey: b64urlDecode(RODE.fileKey), size: N, ...over };
}
async function get(s: StreamSource, range: string | null, cache: MemCache | undefined = new MemCache(), extra: Record<string, string> = {}, method = 'GET', opts: { preview?: number; maxChunks?: number; fileFallback?: boolean } = {}) {
  const headers: Record<string, string> = { ...extra };
  if (range) headers.Range = range;
  const waits: Promise<unknown>[] = [];
  const res = await serveStream(new Request('https://x.test/media/v/rode.mp4', { method, headers }), s, { client, cache: cache as unknown as Cache, chunkSize: C, maxChunks: opts.maxChunks, waitUntil: (p) => waits.push(p) }, { preview: opts.preview, fileFallback: opts.fileFallback });
  const body = method === 'HEAD' || !res.body ? Buffer.alloc(0) : Buffer.from(await res.arrayBuffer());
  await Promise.all(waits);
  return { res, body, cache };
}

describe('serveStream: Range semantics', () => {
  it('parseRange edge cases', () => {
    expect(parseRange('bytes=0-', 10)).toEqual({ kind: 'range', start: 0, end: 9 });
    expect(parseRange('bytes=5-100', 10)).toEqual({ kind: 'range', start: 5, end: 9 });
    expect(parseRange('bytes=-3', 10)).toEqual({ kind: 'range', start: 7, end: 9 });
    expect(parseRange('bytes=-30', 10)).toEqual({ kind: 'range', start: 0, end: 9 });
    expect(parseRange('bytes=-0', 10)).toEqual({ kind: 'unsatisfiable' });
    expect(parseRange('bytes=10-', 10)).toEqual({ kind: 'unsatisfiable' });
    expect(parseRange('bytes=6-5', 10)).toEqual({ kind: 'unsatisfiable' });
    expect(parseRange('bytes=0-1,4-5', 10)).toEqual({ kind: 'none' });
    expect(parseRange('items=0-1', 10)).toEqual({ kind: 'none' });
  });

  it('no Range on a file larger than the cap: 206 with the first 4 chunks; video/mp4, ETag, Accept-Ranges', async () => {
    const { res, body } = await get(src({ etagTag: 'abcd1234' }), null);
    expect(res.status).toBe(206);
    expect(res.headers.get('Content-Range')).toBe(`bytes 0-${4 * C - 1}/${N}`);
    expect(res.headers.get('Content-Type')).toBe('video/mp4');
    expect(res.headers.get('Accept-Ranges')).toBe('bytes');
    expect(res.headers.get('ETag')).toBe(`"m-abcd1234-${N}"`);
    expect(Buffer.compare(body, rodePlain.subarray(0, 4 * C))).toBe(0);
  });

  it('no Range on a small file: 200 whole', async () => {
    const { res, body } = await get(src(), null, new MemCache(), {}, 'GET', { maxChunks: 99 });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Range')).toBeNull();
    expect(Buffer.compare(body, rodePlain)).toBe(0);
  });

  it('Safari probe bytes=0-1', async () => {
    const { res, body } = await get(src(), 'bytes=0-1');
    expect(res.status).toBe(206);
    expect(res.headers.get('Content-Range')).toBe(`bytes 0-1/${N}`);
    expect(res.headers.get('Content-Length')).toBe('2');
    expect(Buffer.compare(body, rodePlain.subarray(0, 2))).toBe(0);
  });

  it.each([
    [1000003, 2000017],
    [C - 5, C + 5],
    [3 * C + 15, 3 * C + 16],
    [N - 17, N - 1],
    [C / 2 + 7, C + 100],
  ])('range %i-%i, byte exact', async (a, b) => {
    const { res, body } = await get(src(), `bytes=${a}-${b}`);
    expect(res.status).toBe(206);
    expect(res.headers.get('Content-Range')).toBe(`bytes ${a}-${b}/${N}`);
    expect(Number(res.headers.get('Content-Length'))).toBe(b - a + 1);
    expect(Buffer.compare(body, rodePlain.subarray(a, b + 1))).toBe(0);
  });

  it('open-ended range is capped at a chunk boundary', async () => {
    const r = await get(src(), 'bytes=100-');
    expect(r.res.headers.get('Content-Range')).toBe(`bytes 100-${4 * C - 1}/${N}`);
    expect(Buffer.compare(r.body, rodePlain.subarray(100, 4 * C))).toBe(0);
    const tail = await get(src(), `bytes=${5 * C + 3}-`);
    expect(tail.res.headers.get('Content-Range')).toBe(`bytes ${5 * C + 3}-${N - 1}/${N}`);
    expect(Buffer.compare(tail.body, rodePlain.subarray(5 * C + 3))).toBe(0);
  });

  it('suffix range', async () => {
    const r = await get(src(), 'bytes=-1234');
    expect(r.res.headers.get('Content-Range')).toBe(`bytes ${N - 1234}-${N - 1}/${N}`);
    expect(Buffer.compare(r.body, rodePlain.subarray(N - 1234))).toBe(0);
  });

  it.each([`bytes=${N}-`, `bytes=${N + 10}-${N + 20}`, 'bytes=-0', 'bytes=9-3'])('416 for %s, never cached', async (range) => {
    const { res, body } = await get(src(), range);
    expect(res.status).toBe(416);
    expect(res.headers.get('Content-Range')).toBe(`bytes */${N}`);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(body.length).toBe(0);
  });

  it('HEAD answers headers without touching MEGA', async () => {
    const { res } = await get(src(), 'bytes=0-', new MemCache(), {}, 'HEAD');
    expect(res.status).toBe(206);
    expect(res.headers.get('Content-Length')).toBe(String(4 * C));
    const s = await mock.stats();
    expect(s.api + s.storage).toBe(0);
  });

  it('a POST is 405', async () => {
    const { res } = await get(src(), null, new MemCache(), {}, 'POST');
    expect(res.status).toBe(405);
  });

  it('unknown size (legacy MEGA_LINKS row) costs one g call, then serves', async () => {
    const { res, body } = await get(src({ size: 0 }), 'bytes=10-20');
    expect(res.headers.get('Content-Range')).toBe(`bytes 10-20/${N}`);
    expect(Buffer.compare(body, rodePlain.subarray(10, 21))).toBe(0);
    expect(counters.gApi).toBe(1);
  });

  it('If-Range with a different ETag gets the start of the whole file', async () => {
    const { res } = await get(src(), 'bytes=5000-6000', new MemCache(), { 'If-Range': '"other"' });
    expect(res.headers.get('Content-Range')).toBe(`bytes 0-${4 * C - 1}/${N}`);
    const same = await get(src(), 'bytes=5000-6000', new MemCache(), { 'If-Range': `"m-RoDe0001-${N}"` });
    expect(same.res.headers.get('Content-Range')).toBe(`bytes 5000-6000/${N}`);
  });

  it('file inside a folder streams with its node key', async () => {
    const s: StreamSource = { tag: 'FoLdEr01.NoDe0001', addr: { n: 'NoDe0001', folder: 'FoLdEr01' }, fileKey: b64urlDecode(ANSH.fileKey), size: anshPlain.length };
    const { res, body } = await get(s, 'bytes=2000001-2100002');
    expect(res.status).toBe(206);
    expect(Buffer.compare(body, anshPlain.subarray(2000001, 2100003))).toBe(0);
  });
});

describe('serveStream: caching', () => {
  it('a second play of the same bytes never reaches MEGA (no API call, no storage fetch)', async () => {
    const cache = new MemCache();
    for (let a = 0; a < N; a += 4 * C) await get(src(), `bytes=${a}-`, cache);
    const before = await mock.stats();
    expect(before.storage).toBe(2); // two capped answers, one MEGA request each
    expect(cache.store.size).toBe(Math.ceil(N / C) + 1); // every chunk, plus the resolved g URL
    resetIsolateState(); // a new isolate: the g URL comes from the cache too
    const again = await get(src(), 'bytes=3000000-3999999', cache);
    expect(Buffer.compare(again.body, rodePlain.subarray(3000000, 4000000))).toBe(0);
    const after = await mock.stats();
    expect(after.storage - before.storage).toBe(0);
    expect(after.api - before.api).toBe(0);
    // Chunk keys name the file, never a query or a request header.
    for (const k of cache.store.keys()) expect(k).toMatch(/^https:\/\/mega-cache\.invalid\/__mega\/(c|g)\/RoDe0001\/[0-9a-f]{12}(\/\d+\/1048576\/\d+)?$/);
  });

  it('a partly cached range fetches only the missing run, in whole chunks', async () => {
    const cache = new MemCache();
    await get(src(), `bytes=0-${C - 1}`, cache);
    const s0 = await mock.stats();
    const r = await get(src(), `bytes=${C - 10}-${3 * C + 10}`, cache);
    expect(Buffer.compare(r.body, rodePlain.subarray(C - 10, 3 * C + 11))).toBe(0);
    const s1 = await mock.stats();
    expect(s1.storage - s0.storage).toBe(1);
    expect(s1.ranges.at(-1)).toBe(`${C}-${4 * C - 1}`);
  });

  it('Safari bytes=0-1 answers 2 bytes at once and fills chunk 0 in the background', async () => {
    const cache = new MemCache();
    const { body } = await get(src(), 'bytes=0-1', cache);
    expect(body.length).toBe(2);
    expect([...cache.store.keys()].some((k) => k.endsWith('/0'))).toBe(true);
  });

  it('a seek far into a cold chunk starts at the asked block and stores only whole chunks after it', async () => {
    const cache = new MemCache();
    const a = 2 * C + C / 2 + 3;
    await get(src(), `bytes=${a}-${4 * C + 5}`, cache);
    const s = await mock.stats();
    expect(s.ranges.at(-1)).toBe(`${a - (a % 16)}-${5 * C - 1}`);
    const chunks = [...cache.store.keys()].filter((k) => k.includes('/__mega/c/')).map((k) => Number(k.split('/').pop()));
    expect(chunks.sort()).toEqual([3, 4]);
  });

  it('an expired storage URL is re-resolved once, transparently', async () => {
    await get(src(), 'bytes=0-15', undefined);
    await mock.ctl('__expire');
    const { res, body } = await get(src(), 'bytes=2000000-2000100', undefined);
    expect(res.status).toBe(206);
    expect(Buffer.compare(body, rodePlain.subarray(2000000, 2000101))).toBe(0);
    expect((await mock.stats()).g).toBe(2);
  });

  it('a viewer who leaves mid-answer stops the MEGA download', async () => {
    await mock.ctl('__mode', { rateBps: 2_000_000 });
    const waits: Promise<unknown>[] = [];
    const res = await serveStream(new Request('https://x.test/v', { headers: { Range: 'bytes=0-' } }), src(), { client, chunkSize: C, waitUntil: (p) => waits.push(p) });
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();
    await Promise.all(waits);
    await new Promise((r) => setTimeout(r, 300));
    expect((await mock.stats()).sent).toBeLessThan(2 * C); // of the 4 MiB asked
  });
});

describe('serveStream: failures, probes and previews', () => {
  it('509 from storage -> 503 with Retry-After from x-mega-time-left; the breaker fails later misses fast; cached chunks still play', async () => {
    const cache = new MemCache();
    await get(src(), `bytes=0-${C - 1}`, cache);
    await mock.ctl('__mode', { quota509: true });
    const bad = await get(src(), `bytes=${2 * C}-${2 * C + 99}`, cache);
    expect(bad.res.status).toBe(503);
    expect(bad.res.headers.get('X-Mega-Error')).toBe('over-quota');
    expect(bad.res.headers.get('Retry-After')).toBe('1234');
    expect(bad.res.headers.get('Cache-Control')).toBe('no-store');
    expect(JSON.parse(bad.body.toString())).toMatchObject({ error: 'over-quota', fallback: 'embed', retryAfter: 1234 });
    const s0 = await mock.stats();
    const fast = await get(src(), `bytes=${3 * C}-${3 * C + 99}`, cache);
    expect(fast.res.status).toBe(503);
    expect((await mock.stats()).storage).toBe(s0.storage); // breaker: MEGA not asked again
    const good = await get(src(), 'bytes=100-200', cache);
    expect(good.res.status).toBe(206);
    expect(Buffer.compare(good.body, rodePlain.subarray(100, 201))).toBe(0);
  });

  it('a failure points at the bundled copy first, the embed only for a 503 on a file link, else none', async () => {
    const body = async (r: Response) => JSON.parse(await r.text());
    expect(await body(errorResponse(new MegaError('over-quota', 'x'), { fileLink: true }))).toMatchObject({ fallback: 'embed' });
    expect(await body(errorResponse(new MegaError('over-quota', 'x'), { fileLink: true, fileFallback: true }))).toMatchObject({ fallback: 'file' });
    expect(await body(errorResponse(new MegaError('busy', 'x'), { fileLink: false }))).toMatchObject({ fallback: 'none', retryAfter: 30 });
    expect(await body(errorResponse(new MegaError('not-found', 'x'), { fileLink: true }))).toMatchObject({ fallback: 'none' });
    const r = errorResponse(new MegaError('bad-key', 'x'), {});
    expect([r.status, r.headers.get('X-Mega-Error'), r.headers.get('Retry-After')]).toEqual([502, 'bad-key', null]);
    expect(errorResponse(new MegaError('over-quota', 'x', 509, 5)).headers.get('Retry-After')).toBe('30');
    expect(errorResponse(new MegaError('over-quota', 'x', 509, 99999)).headers.get('Retry-After')).toBe('3600');
    expect(errorResponse(new MegaError('over-quota', 'x')).headers.get('Retry-After')).toBe('300');
  });

  it('probe reports ok, gone and over quota (no embed here: the route adds it)', async () => {
    const ok = await probe(src(), { client });
    expect([ok.status, ok.headers.get('Cache-Control')]).toEqual([200, 'no-store']);
    expect(await ok.json()).toEqual({ ok: true });
    const gone = await probe(src({ tag: 'ENOENT09', addr: { p: 'ENOENT09' } }), { client }, { fileFallback: true });
    expect([gone.status, gone.headers.get('X-Mega-Error')]).toEqual([404, 'not-found']);
    expect(await gone.json()).toMatchObject({ fallback: 'file' });
    await mock.ctl('__mode', { quota509: true });
    resetIsolateState();
    const q = await probe(src(), { client }, { fileLink: true });
    expect([q.status, q.headers.get('X-Mega-Error'), q.headers.get('Retry-After')]).toEqual([503, 'over-quota', '1234']);
    const qb = await q.json();
    expect(qb).toMatchObject({ error: 'over-quota', fallback: 'embed' });
    expect(qb.embed).toBeUndefined();
  });

  it('a removed file -> 404; quota at the API -> 503 with its tl', async () => {
    const gone = await get(src({ tag: 'ENOENT09', addr: { p: 'ENOENT09' } }), 'bytes=0-1');
    expect(gone.res.status).toBe(404);
    const q = await get(src({ tag: 'EOVERQ17', addr: { p: 'EOVERQ17' } }), 'bytes=0-1');
    expect(q.res.status).toBe(503);
    expect(q.res.headers.get('Retry-After')).toBe('321');
  });

  it('preview: bytes past the bound answer 416; open ranges stop at it; unsniffed rows get 3 MiB', async () => {
    const info = await sniff(async (a, z) => new Uint8Array(rodePlain.subarray(a, z + 1)), N);
    const s = src({ previewEnds: info.previewEnds });
    const bound = Math.min(N, info.previewEnds[6]! + 64 * 1024);
    const first = await get(s, 'bytes=0-', new MemCache(), {}, 'GET', { preview: 6 });
    expect(first.res.headers.get('X-Preview-Bytes')).toBe(String(bound));
    expect(first.res.headers.get('Content-Range')).toBe(`bytes 0-${Math.min(bound, 4 * C) - 1}/${N}`);
    const crossing = await get(s, `bytes=${bound - 10}-${bound + 1000}`, new MemCache(), {}, 'GET', { preview: 6 });
    expect(crossing.res.headers.get('Content-Range')).toBe(`bytes ${bound - 10}-${bound - 1}/${N}`);
    const past = await get(s, `bytes=${bound}-`, new MemCache(), {}, 'GET', { preview: 6 });
    expect(past.res.status).toBe(416);
    const unknown = await get(src(), 'bytes=0-', new MemCache(), {}, 'GET', { preview: 6, maxChunks: 99 });
    expect(unknown.res.headers.get('Content-Range')).toBe(`bytes 0-${3 * C - 1}/${N}`);
  });
});
