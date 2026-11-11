// (admin8) GET /api/admin/mega/source's resolution: which key the admin's browser gets for a row (synthetic keys only).
import { beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';
import { megaFileSource } from '../src/routes/admin/mega';
import { installFakeCache, makeD1 } from './d1-sqlite';

const K43 = 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_AbCdE';
const NODE_KEY = 'ZyXwVuTsRqPoNmLkJiHgFeDcBa9876543210_-ZyXwV';
const FK = 'FoLdErKeY0123456789-_A';

describe('megaFileSource', () => {
  it('a file link gives its own key', () => {
    expect(megaFileSource({ mega_handle: 'FiLe0001', mega_url: `https://mega.nz/file/FiLe0001#${K43}`, mega_key: null, mega_size: 1234 }, undefined)).toEqual({ kind: 'file', handle: 'FiLe0001', key: K43, size: 1234 });
  });

  it('a file in a shared folder gives the saved node key, never the folder key', () => {
    const src = megaFileSource({ mega_handle: 'NoDe0001', mega_url: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`, mega_key: NODE_KEY, mega_size: null }, undefined);
    expect(src).toEqual({ kind: 'folder-file', folder: 'FoLdEr01', node: 'NoDe0001', key: NODE_KEY, size: null });
    expect(megaFileSource({ mega_handle: 'NoDe0001', mega_url: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`, mega_key: null, mega_size: null }, undefined)).toBeNull();
  });

  it('a legacy row reads MEGA_LINKS by handle only while mega_url is empty', () => {
    const secret = `one https://mega.nz/file/LeGa0001#${K43} two`;
    expect(megaFileSource({ mega_handle: 'LeGa0001', mega_url: null, mega_key: null, mega_size: 0 }, secret)).toEqual({ kind: 'file', handle: 'LeGa0001', key: K43, size: null });
    expect(megaFileSource({ mega_handle: 'OtHe0001', mega_url: null, mega_key: null, mega_size: 0 }, secret)).toBeNull();
  });

  it('a link that does not match the row handle gives nothing', () => {
    expect(megaFileSource({ mega_handle: 'FiLe0002', mega_url: `https://mega.nz/file/FiLe0001#${K43}`, mega_key: null, mega_size: 1 }, undefined)).toBeNull();
    expect(megaFileSource({ mega_handle: null, mega_url: null, mega_key: null, mega_size: null }, undefined)).toBeNull();
  });
});

describe('GET /api/admin/mega/source', () => {
  const ADMIN = 'amber-basil-cedar-delta-1234';
  const ORIGIN = 'https://kreators.test';
  let d1: ReturnType<typeof makeD1>;
  let env: Record<string, unknown>;
  const ctx = { waitUntil: () => undefined, passThroughOnException: () => undefined } as unknown as ExecutionContext;
  const call = (path: string, headers: Record<string, string> = { Authorization: `Bearer ${ADMIN}`, 'CF-Connecting-IP': '203.0.113.9' }) =>
    worker.fetch(new Request(`${ORIGIN}${path}`, { headers }), env as never, ctx);

  beforeEach(() => {
    d1 = makeD1();
    installFakeCache();
    env = { DB: d1.d1, ADMIN_KEY: ADMIN, PUBLIC_URL: ORIGIN, ASSETS: { fetch: async () => new Response('asset') } };
    d1.db.exec(`INSERT INTO videos (id, title, brand, published, mega_handle, mega_url, mega_size) VALUES ('m1', 'T', 'B', 1, 'FiLe0001', 'https://mega.nz/file/FiLe0001#${K43}', 99)`);
    d1.db.exec(`INSERT INTO videos (id, title, brand, published, file_ref) VALUES ('f1', 'T', 'B', 1, '/media/f1.mp4')`);
  });

  it('answers the key to the admin, no-store', async () => {
    const res = await call('/api/admin/mega/source?video=m1');
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({ kind: 'file', handle: 'FiLe0001', key: K43, size: 99 });
  });

  it('is locked without a session, 404 for no video, 409 for a row without MEGA, 400 without a question', async () => {
    expect((await call('/api/admin/mega/source?video=m1', {})).status).toBe(401);
    expect((await call('/api/admin/mega/source?video=nope')).status).toBe(404);
    expect((await call('/api/admin/mega/source?video=f1')).status).toBe(409);
    expect((await call('/api/admin/mega/source')).status).toBe(400);
  });
});
