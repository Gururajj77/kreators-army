// (pv) Hover previews (migration 0008): the clip sniffer, the admin upload routes behind the guard, the public /media/pv/ route
// (ranges, cache rules, drafts, stale addresses), automatic posters that never replace a hand-set one, and /api/videos.
import { beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';
import { COOKIE, newSessionId, signToken } from '../src/auth';
import { clipSha, parseRange, sniffClip } from '../src/previews';
import { installFakeCache, makeD1 } from './d1-sqlite';

const KEY = 'amber-basil-cedar-delta-1234';
const ORIGIN = 'https://kreators.test';
const bytes = (...xs: (number | string)[]) => new Uint8Array(xs.flatMap((x) => (typeof x === 'string' ? [...x].map((c) => c.charCodeAt(0)) : [x])));

/** A plausible MP4 head (an ftyp box, then padding standing in for moov and mdat). */
function mp4(len = 2048, seed = 1): Uint8Array {
  const b = new Uint8Array(len);
  b.set(bytes(0, 0, 0, 24, 'ftypisom', 0, 0, 2, 0, 'isomavc1'));
  for (let i = 24; i < len; i++) b[i] = (i * 31 + seed) & 0xff;
  return b;
}
/** A WebM EBML header: EBMLVersion, ReadVersion, MaxIDLength, MaxSizeLength, DocType "webm". */
function webm(len = 1024): Uint8Array {
  const head = bytes(0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 1, 0x42, 0xf7, 0x81, 1, 0x42, 0xf2, 0x81, 4, 0x42, 0xf3, 0x81, 8, 0x42, 0x82, 0x84, 'webm', 0x42, 0x87, 0x81, 4, 0x42, 0x85, 0x81, 2);
  const b = new Uint8Array(len);
  b.set(head);
  return b;
}
const WEBP = bytes('RIFF', 0x24, 0, 0, 0, 'WEBPVP8 ', 0, 0, 0, 0, 1, 2, 3, 4);
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 'JFIF', 0, 9, 9, 9);

describe('clip magic bytes', () => {
  it('MP4 (ftyp first) and WebM (EBML with DocType webm) pass, whatever was declared', () => {
    expect(sniffClip(mp4())).toBe('video/mp4');
    expect(sniffClip(webm())).toBe('video/webm');
  });
  it.each([
    ['HTML', bytes('<!doctype html><script>alert(1)</script>')],
    ['a JPEG', JPEG],
    ['Matroska that is not WebM', bytes(0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x82, 0x88, 'matroska', 0, 0, 0, 0)],
    ['an mdat first', bytes(0, 0, 0, 16, 'mdat', 0, 0, 0, 0, 0, 0, 0, 0)],
    ['an ftyp with a silly size', bytes(0xff, 0xff, 0xff, 0xff, 'ftypisom', 0, 0, 0, 0)],
    ['nothing', bytes()],
  ])('%s is refused', (_, b) => {
    expect(sniffClip(b)).toBeNull();
  });
  it('ranges: a-b, a-, -n, and 416 cases', () => {
    expect(parseRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 });
    expect(parseRange('bytes=900-', 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange('bytes=0-5000', 1000)).toEqual({ start: 0, end: 999 });
    expect(parseRange('bytes=1000-', 1000)).toBe('bad');
    expect(parseRange('bytes=5-2', 1000)).toBe('bad');
    expect(parseRange(null, 1000)).toBeNull();
    expect(parseRange('items=0-1', 1000)).toBeNull();
  });
});

// ---------------------------------------------------------------- the Worker, end to end

let d1: ReturnType<typeof makeD1>;
let cache: ReturnType<typeof installFakeCache>;
let env: Record<string, unknown>;
const pending: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => void pending.push(p), passThroughOnException: () => undefined } as unknown as ExecutionContext;

async function call(path: string, init: RequestInit & { headers?: Record<string, string> } = {}): Promise<Response> {
  const res = await worker.fetch(new Request(`${ORIGIN}${path}`, init), env as never, ctx);
  await Promise.all(pending.splice(0));
  return res;
}
const bearer = { Authorization: `Bearer ${KEY}`, 'CF-Connecting-IP': '203.0.113.9' };

function addVideo(id: string, published: 0 | 1, extra = '') {
  d1.db.exec(`INSERT INTO videos (id, title, brand, published, file_ref${extra ? ', poster_url' : ''}) VALUES ('${id}', 'Title ${id}', 'Brand', ${published}, '/media/${id}.mp4'${extra ? `, '${extra}'` : ''})`);
}

async function upload(id: string, body: Uint8Array, type = 'video/mp4', more: Record<string, string> = {}) {
  return call(`/api/admin/videos/${id}/preview`, { method: 'PUT', body, headers: { ...bearer, 'Content-Type': type, 'X-Preview-Width': '360', 'X-Preview-Height': '640', 'X-Preview-Duration-Ms': '3600', 'X-Preview-Start-Ms': '9000', ...more } });
}

async function cookieFor(): Promise<string> {
  const sid = newSessionId();
  const now = Date.now();
  d1.db.exec(`INSERT INTO admin_sessions (id, created_at, expires_at, seen_at, ip_hash, agent) VALUES ('${sid}', ${now}, ${now + 3600_000}, ${now}, 'x', '')`);
  return `${COOKIE}=${await signToken(KEY, sid, Math.floor(now / 1000) + 3600)}`;
}

beforeEach(() => {
  d1 = makeD1();
  cache = installFakeCache();
  env = { DB: d1.d1, ADMIN_KEY: KEY, PUBLIC_URL: ORIGIN, ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } };
  addVideo('pub', 1);
  addVideo('draft', 0);
});

describe('PUT /api/admin/videos/:id/preview', () => {
  it('stores a clip and answers the video with its preview; /api/videos lists previewUrl', async () => {
    const clip = mp4(4096);
    const res = await upload('pub', clip);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { preview: { url: string; size: number; mime: string; width: number; startMs: number }; video: { preview: unknown } };
    const sha = await clipSha(clip);
    expect(body.preview).toMatchObject({ url: `/media/pv/pub/${sha}.mp4`, size: 4096, mime: 'video/mp4', width: 360, startMs: 9000 });
    expect(body.video.preview).toEqual(body.preview);
    const list = (await (await call('/api/videos')).json()) as { videos: { id: string; previewUrl: string | null }[] };
    expect(list.videos.find((v) => v.id === 'pub')?.previewUrl).toBe(`/media/pv/pub/${sha}.mp4`);
    expect(list.videos.some((v) => v.id === 'draft')).toBe(false);
  });

  it('WebM is stored as video/webm with a .webm address', async () => {
    const res = await upload('pub', webm(), 'video/webm');
    expect(res.status).toBe(200);
    expect(((await res.json()) as { preview: { url: string } }).preview.url).toMatch(/^\/media\/pv\/pub\/[0-9a-f]{16}\.webm$/);
  });

  it('refuses a body that is not a clip (415), the wrong declared type (415), an empty body (400) and over 600 KiB (413)', async () => {
    expect((await upload('pub', bytes('<!doctype html><p>hi</p>'))).status).toBe(415);
    expect((await upload('pub', mp4(), 'image/webp')).status).toBe(415);
    expect((await upload('pub', mp4(), 'application/json')).status).toBe(415);
    expect((await upload('pub', new Uint8Array(0))).status).toBe(400);
    expect((await upload('pub', mp4(600 * 1024 + 1))).status).toBe(413);
    expect((await upload('pub', mp4(600 * 1024))).status).toBe(200);
    expect((await upload('nope', mp4())).status).toBe(404);
  });

  it('needs the admin: no credentials 401, a wrong Bearer 401, a cookie write without Origin 403, with Origin 200', async () => {
    expect((await call('/api/admin/videos/pub/preview', { method: 'PUT', body: mp4(), headers: { 'Content-Type': 'video/mp4' } })).status).toBe(401);
    expect((await call('/api/admin/videos/pub/preview', { method: 'PUT', body: mp4(), headers: { 'Content-Type': 'video/mp4', Authorization: 'Bearer not-the-key-at-all-0000', 'CF-Connecting-IP': '203.0.113.10' } })).status).toBe(401);
    const cookie = await cookieFor();
    expect((await call('/api/admin/videos/pub/preview', { method: 'PUT', body: mp4(), headers: { 'Content-Type': 'video/mp4', Cookie: cookie } })).status).toBe(403);
    expect((await call('/api/admin/videos/pub/preview', { method: 'PUT', body: mp4(), headers: { 'Content-Type': 'video/mp4', Cookie: cookie, Origin: 'https://evil.test' } })).status).toBe(403);
    expect((await call('/api/admin/videos/pub/preview', { method: 'PUT', body: mp4(), headers: { 'Content-Type': 'video/mp4', Cookie: cookie, Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin' } })).status).toBe(200);
  });

  it('DELETE removes it (204), evicts its edge copy, and previewUrl goes back to null', async () => {
    const clip = mp4();
    await upload('pub', clip);
    const url = `/media/pv/pub/${await clipSha(clip)}.mp4`;
    expect((await call(url)).status).toBe(200);
    expect(cache.store.has(`${ORIGIN}${url}`)).toBe(true);
    expect((await call('/api/admin/videos/pub/preview', { method: 'DELETE', headers: bearer })).status).toBe(204);
    expect(cache.store.has(`${ORIGIN}${url}`)).toBe(false);
    expect((await call(url)).status).toBe(404);
    const list = (await (await call('/api/videos')).json()) as { videos: { id: string; previewUrl: string | null }[] };
    expect(list.videos.find((v) => v.id === 'pub')?.previewUrl).toBeNull();
  });

  it('removing the video removes its clip (ON DELETE CASCADE)', async () => {
    await upload('pub', mp4());
    d1.db.exec("DELETE FROM videos WHERE id = 'pub'");
    expect(d1.db.prepare('SELECT COUNT(*) AS n FROM video_previews').get()).toEqual({ n: 0 });
  });
});

describe('GET /api/videos before migration 0008 reached the database', () => {
  it('still lists the library, with previewUrl null, instead of failing', async () => {
    d1.db.exec('DROP TABLE video_previews');
    const res = await call('/api/videos');
    expect(res.status).toBe(200);
    const list = (await res.json()) as { videos: { id: string; previewUrl: string | null }[] };
    expect(list.videos.find((v) => v.id === 'pub')?.previewUrl).toBeNull();
  });
});

describe('GET /media/pv/<id>/<sha>.<ext>', () => {
  it('a published clip: 200 with type, length, ranges, nosniff, immutable; put in the edge cache once', async () => {
    const clip = mp4(5000);
    await upload('pub', clip);
    const url = `/media/pv/pub/${await clipSha(clip)}.mp4`;
    const res = await call(url);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('video/mp4');
    expect(res.headers.get('Content-Length')).toBe('5000');
    expect(res.headers.get('Accept-Ranges')).toBe('bytes');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(clip);
    expect(cache.puts).toEqual([`${ORIGIN}${url}`]);
    // The second answer comes from the edge copy, still checked against D1 first.
    const again = await call(url, { headers: { Range: 'bytes=0-1' } });
    expect(again.status).toBe(206);
    expect(again.headers.get('Content-Range')).toBe('bytes 0-1/5000');
    expect(cache.puts.length).toBe(1);
  });

  it('ranges: 206 with Content-Range for a-b, a-, -n; 416 past the end; HEAD has no body; 304 for the ETag', async () => {
    const clip = mp4(1000);
    await upload('pub', clip);
    const url = `/media/pv/pub/${await clipSha(clip)}.mp4`;
    const r1 = await call(url, { headers: { Range: 'bytes=10-19' } });
    expect(r1.status).toBe(206);
    expect(r1.headers.get('Content-Range')).toBe('bytes 10-19/1000');
    expect(r1.headers.get('Content-Length')).toBe('10');
    expect(new Uint8Array(await r1.arrayBuffer())).toEqual(clip.subarray(10, 20));
    expect((await call(url, { headers: { Range: 'bytes=990-' } })).headers.get('Content-Range')).toBe('bytes 990-999/1000');
    expect((await call(url, { headers: { Range: 'bytes=-5' } })).headers.get('Content-Range')).toBe('bytes 995-999/1000');
    const bad = await call(url, { headers: { Range: 'bytes=1000-' } });
    expect(bad.status).toBe(416);
    expect(bad.headers.get('Content-Range')).toBe('bytes */1000');
    const head = await call(url, { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect((await head.arrayBuffer()).byteLength).toBe(0);
    const etag = head.headers.get('ETag')!;
    expect((await call(url, { headers: { 'If-None-Match': etag } })).status).toBe(304);
    expect((await call(url, { method: 'POST' })).status).toBe(405);
  });

  it('a stale sha or extension redirects (307) to the current address', async () => {
    const first = mp4(800, 1);
    await upload('pub', first);
    const second = mp4(800, 2);
    await upload('pub', second);
    const old = `/media/pv/pub/${await clipSha(first)}.mp4`;
    const res = await call(old);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(`/media/pv/pub/${await clipSha(second)}.mp4`);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300');
    expect((await call(`/media/pv/pub/${await clipSha(second)}.webm`)).status).toBe(307);
  });

  it('a draft clip: 404 for visitors, private no-store for the admin, never in the edge cache', async () => {
    const clip = mp4();
    await upload('draft', clip);
    const url = `/media/pv/draft/${await clipSha(clip)}.mp4`;
    expect((await call(url)).status).toBe(404);
    const res = await call(url, { headers: { Cookie: await cookieFor() } });
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await call(`/media/pv/draft/${'0'.repeat(16)}.mp4`)).status).toBe(404);
    expect(cache.puts).toEqual([]);
  });

  it('unpublishing or binning takes effect at once, even with an edge copy in place', async () => {
    const clip = mp4();
    await upload('pub', clip);
    const url = `/media/pv/pub/${await clipSha(clip)}.mp4`;
    expect((await call(url)).status).toBe(200);
    d1.db.exec("UPDATE videos SET published = 0 WHERE id = 'pub'");
    expect((await call(url)).status).toBe(404);
    d1.db.exec("UPDATE videos SET published = 1 WHERE id = 'pub'");
    expect((await call(url)).status).toBe(200);
    d1.db.exec("UPDATE videos SET published = 0, deleted_at = datetime('now') WHERE id = 'pub'");
    expect((await call(url)).status).toBe(404);
  });

  it('no clip at all: 404; a malformed address is not this route', async () => {
    expect((await call(`/media/pv/pub/${'a'.repeat(16)}.mp4`)).status).toBe(404);
    expect((await call('/media/pv/pub/xyz.mp4')).status).toBe(200); // falls through to static assets (the stub)
  });
});

describe('PUT /api/admin/videos/:id/auto-poster', () => {
  const put = (id: string, body: Uint8Array, q = '') => call(`/api/admin/videos/${id}/auto-poster${q}`, { method: 'PUT', body, headers: { ...bearer, 'Content-Type': 'image/webp', 'X-Poster-Width': '720', 'X-Poster-Height': '1280', 'X-Poster-Time-Ms': '9400' } });
  const hand = (id: string, body: Uint8Array) => call(`/api/admin/videos/${id}/poster`, { method: 'PUT', body, headers: { ...bearer, 'Content-Type': 'image/jpeg' } });

  it('stores an automatic poster (auto: true), and replaces an automatic one', async () => {
    const r = (await (await put('pub', WEBP)).json()) as { kept: boolean; poster: { auto: boolean; timeMs: number; width: number } };
    expect(r).toMatchObject({ kept: false, poster: { auto: true, timeMs: 9400, width: 720 } });
    const again = (await (await put('pub', bytes('RIFF', 0x24, 0, 0, 0, 'WEBPVP8 ', 7, 7))).json()) as { kept: boolean };
    expect(again.kept).toBe(false);
  });

  it('never replaces a poster set by hand unless ?replace=1; a hand-set poster over an automatic one turns it into a hand-set one', async () => {
    await put('pub', WEBP);
    expect(((await (await hand('pub', JPEG)).json()) as { poster: { auto: boolean } }).poster.auto).toBe(false);
    const kept = (await (await put('pub', WEBP)).json()) as { kept: boolean; poster: { url: string; auto: boolean } };
    expect(kept.kept).toBe(true);
    expect(kept.poster.url).toMatch(/\.jpg$/);
    const replaced = (await (await put('pub', WEBP, '?replace=1')).json()) as { kept: boolean; poster: { auto: boolean } };
    expect(replaced).toMatchObject({ kept: false, poster: { auto: true } });
  });

  it('keeps a v1 poster address too, and refuses what is not an image', async () => {
    addVideo('v1poster', 1, '/media/v1poster.jpg');
    expect(((await (await put('v1poster', WEBP)).json()) as { kept: boolean }).kept).toBe(true);
    expect((await put('pub', mp4())).status).toBe(415);
  });
});
