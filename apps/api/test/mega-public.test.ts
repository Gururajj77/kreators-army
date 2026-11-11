// (pub8) The Worker no longer streams MEGA: the old stream addresses answer 410 without reading anything, and /api/videos hands out MEGA's own
// embed (or page) address instead. Synthetic handles and keys only.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';
import { makeD1 } from './d1-sqlite';

const ORIGIN = 'https://kreators.test';
const K = 'xAb8Winxbew-6pdl9CyAHKrBNegZbIL-l0uw6PrYs3w';
const K2 = 'Zz9y8XwVuTsRqPoNmLkJiHgFeDcBa_-0123456789ab';
const FK = 'AbCdEfGhIjKlMnOpQrStUv';

let d1: ReturnType<typeof makeD1>;
let env: Record<string, unknown>;
let assets: ReturnType<typeof vi.fn>;
let net: ReturnType<typeof vi.fn>;
const ctx = { waitUntil: () => undefined, passThroughOnException: () => undefined } as unknown as ExecutionContext;
const call = (path: string, init?: RequestInit) => worker.fetch(new Request(`${ORIGIN}${path}`, init), env as never, ctx);

beforeEach(() => {
  d1 = makeD1();
  assets = vi.fn(async () => new Response('asset', { status: 200 }));
  env = { DB: d1.d1, PUBLIC_URL: ORIGIN, ASSETS: { fetch: assets }, MEGA_LINKS: `https://mega.nz/file/SeCrEt01#${K2}` };
  // Any outgoing request (MEGA's API or storage) fails the test.
  net = vi.fn(async () => {
    throw new Error('no network in this test');
  });
  vi.stubGlobal('fetch', net);
  const add = (id: string, cols: string, vals: string) => d1.db.exec(`INSERT INTO videos (id, title, brand, published, ${cols}) VALUES ('${id}', 'Title ${id}', 'Brand', 1, ${vals})`);
  add('file', 'mega_handle, mega_url, file_ref', `'RoDe0001', 'https://mega.nz/file/RoDe0001#${K}', '/media/rode.mp4'`);
  add('secret', 'mega_handle', `'SeCrEt01'`);
  add('folder', 'mega_handle, mega_url', `'NoDe0001', 'https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001'`);
  add('bundled', 'file_ref', `'/media/brandingbum.mp4'`);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the old MEGA stream addresses', () => {
  it.each(['/media/v/file.mp4', '/media/v/file.mp4?v=0123abcd', '/media/v/file.mp4?v=0123abcd&preview=6', '/media/v/file.mp4?probe=1', '/media/v/nope.mp4', '/media/mega-RoDe0001.mp4', '/media/mega-RoDe0001.mp4?probe=1'])(
    '%s answers 410 Gone, cheaply: no D1, no MEGA, no asset',
    async (path) => {
      const spy = vi.spyOn(d1.d1, 'prepare');
      const res = await call(path, { headers: { Range: 'bytes=0-' } });
      expect(res.status).toBe(410);
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400');
      expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
      expect(spy).not.toHaveBeenCalled();
      expect(net).not.toHaveBeenCalled();
      expect(assets).not.toHaveBeenCalled();
    },
  );

  it('bundled files under /media/ still go to the assets', async () => {
    const res = await call('/media/brandingbum.mp4');
    expect(res.status).toBe(200);
    expect(assets).toHaveBeenCalled();
  });
});

describe('GET /api/videos with MEGA rows', () => {
  it('MEGA file link and secret key: MEGA embed; folder file: MEGA page; bundled: its own stream; no MEGA call', async () => {
    const res = await call('/api/videos');
    expect(res.status).toBe(200);
    const { videos } = (await res.json()) as { videos: { id: string; streamUrl: string | null; embedUrl: string | null; watchUrl: string | null; source: string; previewOk: boolean }[] };
    const by = Object.fromEntries(videos.map((v) => [v.id, v]));
    expect(by.file).toMatchObject({ streamUrl: null, embedUrl: `https://mega.nz/embed/RoDe0001#${K}`, watchUrl: null, source: 'mega', previewOk: false });
    expect(by.secret).toMatchObject({ streamUrl: null, embedUrl: `https://mega.nz/embed/SeCrEt01#${K2}`, watchUrl: null, source: 'mega' });
    expect(by.folder).toMatchObject({ streamUrl: null, embedUrl: null, watchUrl: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`, source: 'mega' });
    expect(by.bundled).toMatchObject({ streamUrl: '/media/brandingbum.mp4', embedUrl: null, watchUrl: null, source: 'file', previewOk: true });
    expect(JSON.stringify(videos)).not.toContain('/media/v/');
    expect(net).not.toHaveBeenCalled();
  });
});
