// (sel, round 4) POST /api/admin/videos/bulk end to end through the real Worker over the node:sqlite D1 stand-in: mixed success and failure
// with the single routes' rules, the limits, the guard (401, CSRF 403), bin, restore and purge only from the bin, and a row changed mid-way.
import { beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';
import { COOKIE, newSessionId, signToken } from '../src/auth';
import { installFakeCache, makeD1 } from './d1-sqlite';

const KEY = 'amber-basil-cedar-delta-1234';
const ORIGIN = 'https://kreators.test';

let d1: ReturnType<typeof makeD1>;
let env: Record<string, unknown>;
const pending: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => void pending.push(p), passThroughOnException: () => undefined } as unknown as ExecutionContext;

async function call(path: string, init: RequestInit & { headers?: Record<string, string> } = {}): Promise<Response> {
  const res = await worker.fetch(new Request(`${ORIGIN}${path}`, init), env as never, ctx);
  await Promise.all(pending.splice(0));
  return res;
}
const bearer = { Authorization: `Bearer ${KEY}`, 'CF-Connecting-IP': '203.0.113.9', 'Content-Type': 'application/json' };

interface Result {
  done: { id: string; published: boolean; featured: boolean; deletedAt: string | null; category: string | null; platform: string | null; uploadDate: string | null; aspect: string; brand: string; updatedAt: string }[];
  doneIds: string[];
  failed: { id: string; code: string; message: string; problems?: string[] }[];
}

async function bulk(body: unknown, headers: Record<string, string> = bearer) {
  const res = await call('/api/admin/videos/bulk', { method: 'POST', body: JSON.stringify(body), headers });
  return { status: res.status, body: (await res.json()) as Result & { code?: string; field?: string } };
}

const row = (id: string) => d1.db.prepare('SELECT * FROM videos WHERE id = ?').get(id) as Record<string, unknown> | undefined;

/** A video: by default a publishable draft streaming a bundled file. */
function add(id: string, o: { brand?: string; published?: 0 | 1; file?: string | null; mega?: string; megaError?: string; deleted?: boolean; featured?: 0 | 1 } = {}) {
  d1.db
    .prepare('INSERT INTO videos (id, title, brand, published, featured, file_ref, mega_handle, mega_error, deleted_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, `Title ${id}`, o.brand ?? 'Brand', o.published ?? 0, o.featured ?? 0, o.file === undefined ? `/media/${id}.mp4` : o.file, o.mega ?? null, o.megaError ?? null, o.deleted ? '2026-11-01 10:00:00' : null, '2026-11-01 10:00:00.000');
}

async function cookieFor(): Promise<string> {
  const sid = newSessionId();
  const now = Date.now();
  d1.db.exec(`INSERT INTO admin_sessions (id, created_at, expires_at, seen_at, ip_hash, agent) VALUES ('${sid}', ${now}, ${now + 3600_000}, ${now}, 'x', '')`);
  return `${COOKIE}=${await signToken(KEY, sid, Math.floor(now / 1000) + 3600)}`;
}

beforeEach(() => {
  d1 = makeD1();
  installFakeCache();
  env = { DB: d1.d1, ADMIN_KEY: KEY, PUBLIC_URL: ORIGIN, ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } };
});

describe('POST /api/admin/videos/bulk: publish and the blockers', () => {
  it('publishes the ones that can, lists the rest with their reason, in the order asked; never skips silently', async () => {
    add('ok1');
    add('ok2');
    add('live', { published: 1 });
    add('nobrand', { brand: '  ' });
    add('nostream', { file: null });
    add('broken', { file: null, mega: 'AbCdEf12', megaError: 'not-found' });
    add('binned', { deleted: true });
    const r = await bulk({ ids: ['ok1', 'nobrand', 'live', 'nostream', 'missing', 'ok2', 'broken', 'binned'], action: 'publish' });
    expect(r.status).toBe(200);
    expect(r.body.doneIds).toEqual(['ok1', 'live', 'ok2']);
    expect(r.body.done.map((v) => [v.id, v.published])).toEqual([
      ['ok1', true],
      ['live', true],
      ['ok2', true],
    ]);
    expect(r.body.failed.map((f) => [f.id, f.code, f.problems ?? null])).toEqual([
      ['nobrand', 'cannot-publish', ['no-brand']],
      ['nostream', 'cannot-publish', ['no-stream']],
      ['missing', 'not-found', null],
      ['broken', 'cannot-publish', ['mega-unreachable']],
      ['binned', 'bad-request', null],
    ]);
    // Every id is accounted for exactly once.
    expect(new Set([...r.body.doneIds, ...r.body.failed.map((f) => f.id)]).size).toBe(8);
    expect(row('ok1')!.published).toBe(1);
    expect(row('nobrand')!.published).toBe(0);
    // Written rows bump updated_at; the one already live is not rewritten.
    expect(row('ok1')!.updated_at).not.toBe('2026-11-01 10:00:00.000');
    expect(row('live')!.updated_at).toBe('2026-11-01 10:00:00.000');
  });

  it('unpublish, feature and unfeature; a binned row fails with its reason', async () => {
    add('a', { published: 1 });
    add('b', { published: 1, featured: 1 });
    add('c', { deleted: true });
    const un = await bulk({ ids: ['a', 'b', 'c'], action: 'unpublish' });
    expect(un.body.done.every((v) => !v.published)).toBe(true);
    expect(un.body.failed.map((f) => f.id)).toEqual(['c']);
    const fe = await bulk({ ids: ['a', 'b'], action: 'feature' });
    expect(fe.body.done.map((v) => v.featured)).toEqual([true, true]);
    expect(row('a')!.featured).toBe(1);
    const uf = await bulk({ ids: ['a', 'b'], action: 'unfeature' });
    expect(uf.body.done.map((v) => v.featured)).toEqual([false, false]);
  });
});

describe('set: the drawer rules for brand, category, platform, upload date and aspect', () => {
  it('sets and clears fields; a live video cannot lose its brand, a draft can', async () => {
    add('d1');
    add('d2');
    add('live', { published: 1 });
    const set = await bulk({ ids: ['d1', 'd2', 'live'], action: 'set', fields: { category: '  Audio  ', platform: 'Instagram', uploadDate: '2026-10-01', aspect: 'landscape' } });
    expect(set.status).toBe(200);
    expect(set.body.done.map((v) => [v.category, v.platform, v.uploadDate, v.aspect])).toEqual(Array(3).fill(['Audio', 'Instagram', '2026-10-01', 'landscape']));
    const clear = await bulk({ ids: ['d1', 'live'], action: 'set', fields: { category: null, platform: '', uploadDate: null } });
    expect(clear.body.done.map((v) => [v.category, v.platform, v.uploadDate])).toEqual(Array(2).fill([null, null, null]));
    const brand = await bulk({ ids: ['d1', 'live'], action: 'set', fields: { brand: '' } });
    expect(brand.body.doneIds).toEqual(['d1']);
    expect(brand.body.failed).toMatchObject([{ id: 'live', code: 'cannot-publish', problems: ['no-brand'] }]);
    expect(row('live')!.brand).toBe('Brand');
  });

  it('refuses a future day, a bad aspect, fields it may not set, an empty set, and fields on another action (400 naming the field)', async () => {
    add('d1');
    const future = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
    expect((await bulk({ ids: ['d1'], action: 'set', fields: { uploadDate: future } })).body).toMatchObject({ code: 'bad-request', field: 'uploadDate' });
    expect((await bulk({ ids: ['d1'], action: 'set', fields: { uploadDate: '2026-02-30' } })).body.field).toBe('uploadDate');
    expect((await bulk({ ids: ['d1'], action: 'set', fields: { aspect: 'square' } })).body.field).toBe('aspect');
    expect((await bulk({ ids: ['d1'], action: 'set', fields: { title: 'x' } })).body).toMatchObject({ code: 'bad-request', field: 'title' });
    expect((await bulk({ ids: ['d1'], action: 'set', fields: { published: true } })).body.field).toBe('published');
    expect((await bulk({ ids: ['d1'], action: 'set', fields: {} })).body.field).toBe('fields');
    expect((await bulk({ ids: ['d1'], action: 'set' })).body.field).toBe('fields');
    expect((await bulk({ ids: ['d1'], action: 'publish', fields: { brand: 'x' } })).body.field).toBe('fields');
    expect((await bulk({ ids: ['d1'], action: 'set', fields: { category: 'x'.repeat(41) } })).status).toBe(400);
    expect(row('d1')!.category).toBeNull();
  });
});

describe('bin, restore and purge', () => {
  it('bin unpublishes and bins; restore brings drafts back only from the bin; purge only from the bin', async () => {
    add('live', { published: 1 });
    add('draft');
    add('keep', { published: 1 });
    const bin = await bulk({ ids: ['live', 'draft'], action: 'bin' });
    expect(bin.body.done.map((v) => [v.id, v.published, !!v.deletedAt])).toEqual([
      ['live', false, true],
      ['draft', false, true],
    ]);
    // Binning again is fine (as DELETE /videos/:id), purge of a live video is not.
    expect((await bulk({ ids: ['live'], action: 'bin' })).body.doneIds).toEqual(['live']);
    const purgeLive = await bulk({ ids: ['keep', 'draft'], action: 'purge' });
    expect(purgeLive.body.doneIds).toEqual(['draft']);
    expect(purgeLive.body.done).toEqual([]);
    expect(purgeLive.body.failed).toMatchObject([{ id: 'keep', code: 'not-in-bin' }]);
    expect(row('draft')).toBeUndefined();
    expect(row('keep')!.published).toBe(1);
    const restore = await bulk({ ids: ['live', 'keep'], action: 'restore' });
    expect(restore.body.done.map((v) => [v.id, v.published, v.deletedAt])).toEqual([['live', false, null]]);
    expect(restore.body.failed).toMatchObject([{ id: 'keep', code: 'not-in-bin' }]);
    // Undo of a bin of a live video: restore, then publish again.
    expect((await bulk({ ids: ['live'], action: 'publish' })).body.done[0]!.published).toBe(true);
  });
});

describe('limits, the guard and a row changed meanwhile', () => {
  it('ids: 1 to 200 distinct strings; duplicates count once; a bad action is a 400', async () => {
    add('a');
    const many = Array.from({ length: 201 }, (_, i) => `id-${i}`);
    expect((await bulk({ ids: many, action: 'feature' })).body).toMatchObject({ code: 'bad-request', field: 'ids' });
    const max = await bulk({ ids: ['a', ...many.slice(0, 199)], action: 'feature' });
    expect(max.status).toBe(200);
    expect(max.body.doneIds).toEqual(['a']);
    expect(max.body.failed.length).toBe(199);
    expect((await bulk({ ids: ['a', 'a', 'a'], action: 'unfeature' })).body.doneIds).toEqual(['a']);
    expect((await bulk({ ids: [], action: 'feature' })).body.field).toBe('ids');
    expect((await bulk({ ids: 'a', action: 'feature' })).body.field).toBe('ids');
    expect((await bulk({ ids: [1, 2], action: 'feature' })).body.field).toBe('ids');
    expect((await bulk({ ids: ['a'], action: 'explode' })).body).toMatchObject({ code: 'bad-request', field: 'action' });
    expect((await bulk({ ids: ['a'] })).body.field).toBe('action');
  });

  it('needs the admin: 401 without credentials, 403 for a cookie write without Origin or from another site, 200 from this site', async () => {
    add('a');
    const body = JSON.stringify({ ids: ['a'], action: 'feature' });
    const none = await call('/api/admin/videos/bulk', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
    expect(none.status).toBe(401);
    const cookie = await cookieFor();
    expect((await call('/api/admin/videos/bulk', { method: 'POST', body, headers: { 'Content-Type': 'application/json', Cookie: cookie } })).status).toBe(403);
    expect((await call('/api/admin/videos/bulk', { method: 'POST', body, headers: { 'Content-Type': 'application/json', Cookie: cookie, Origin: 'https://evil.test' } })).status).toBe(403);
    expect((await call('/api/admin/videos/bulk', { method: 'POST', body, headers: { 'Content-Type': 'application/json', Cookie: cookie, Origin: ORIGIN, 'Sec-Fetch-Site': 'cross-site' } })).status).toBe(403);
    expect(row('a')!.featured).toBe(0);
    const ok = await call('/api/admin/videos/bulk', { method: 'POST', body, headers: { 'Content-Type': 'application/json', Cookie: cookie, Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin' } });
    expect(ok.status).toBe(200);
    expect(row('a')!.featured).toBe(1);
  });

  it('a row changed in another tab between the check and the write fails as stale; the others still go', async () => {
    add('a');
    add('b');
    const real = d1.d1.batch.bind(d1.d1);
    (d1.d1 as unknown as { batch: typeof real }).batch = async (stmts) => {
      if (stmts.some((s) => /^UPDATE videos SET published/.test((s as unknown as { sql: string }).sql))) d1.db.exec("UPDATE videos SET updated_at = '2026-11-02 00:00:00.000', brand = '' WHERE id = 'b'");
      return real(stmts);
    };
    const r = await bulk({ ids: ['a', 'b'], action: 'publish' });
    expect(r.body.doneIds).toEqual(['a']);
    expect(r.body.failed).toMatchObject([{ id: 'b', code: 'stale' }]);
    expect(row('b')!.published).toBe(0);
  });
});
