// (admin10) "Clear unused cache": GET /api/admin/storage/unused (dry run) and POST /api/admin/storage/clear. The passkey is
// required, answers are no-store, the dry run deletes nothing, and clear removes only the unused groups: never a videos row,
// a lead (complete or partial), a live video's thumbnail or preview, or the session making the request.
import { beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';
import { COOKIE, newSessionId, signToken } from '../src/auth';
import { posterCacheKey } from '../src/posters';
import { previewCacheKey } from '../src/previews';
import { installFakeCache, makeD1 } from './d1-sqlite';

const KEY = 'amber-basil-cedar-delta-1234';
const ORIGIN = 'https://kreators.test';
const HOUR = 3600_000;
const DAY = 24 * HOUR;

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

const count = (sql: string) => (d1.db.prepare(sql).get() as { n: number }).n;
const blob = (n: number) => `zeroblob(${n})`;
const sha = (c: string) => c.repeat(16);

function addVideo(id: string, { binned = false, mega = '' } = {}) {
  d1.db.exec(
    `INSERT INTO videos (id, title, brand, published, ${mega ? 'mega_handle, mega_url' : 'file_ref'}${binned ? ', deleted_at' : ''})
     VALUES ('${id}', 'Title ${id}', 'Brand', ${binned ? 0 : 1}, ${mega ? `'${mega}', 'https://mega.nz/file/${mega}'` : `'/media/${id}.mp4'`}${binned ? ", datetime('now')" : ''})`,
  );
}
function addMedia(id: string, c: string, posterBytes = 1000, clipBytes = 5000) {
  d1.db.exec(`INSERT INTO posters (video_id, sha, mime, bytes, auto) VALUES ('${id}', '${sha(c)}', 'image/webp', ${blob(posterBytes)}, 1)`);
  d1.db.exec(`INSERT INTO video_previews (video_id, sha, mime, size, bytes) VALUES ('${id}', '${sha(c)}', 'video/mp4', ${clipBytes}, ${blob(clipBytes)})`);
}
function addProbe(handle: string, ageMs: number) {
  d1.db.exec(`INSERT INTO mega_probes (handle, link, checked_at) VALUES ('${handle}', 'https://mega.nz/file/${handle}', ${Date.now() - ageMs})`);
}
function addSession(id: string, { expired = false, idle = false } = {}) {
  const now = Date.now();
  d1.db.exec(`INSERT INTO admin_sessions (id, created_at, expires_at, seen_at, ip_hash, agent) VALUES ('${id}', ${now - 2 * DAY}, ${expired ? now - 1000 : now + DAY}, ${idle ? now - 2 * DAY : now}, 'x', '')`);
}
function addAttempt(ok: 0 | 1, ageMs: number) {
  d1.db.exec(`INSERT INTO admin_attempts (ip_hash, ok, via, at) VALUES ('h', ${ok}, 'passkey', ${Date.now() - ageMs})`);
}

async function cookieFor(sid: string): Promise<string> {
  const now = Date.now();
  d1.db.exec(`INSERT INTO admin_sessions (id, created_at, expires_at, seen_at, ip_hash, agent) VALUES ('${sid}', ${now}, ${now + HOUR}, ${now}, 'x', '')`);
  return `${COOKIE}=${await signToken(KEY, sid, Math.floor(now / 1000) + 3600)}`;
}

beforeEach(() => {
  d1 = makeD1();
  cache = installFakeCache();
  env = { DB: d1.d1, ADMIN_KEY: KEY, PUBLIC_URL: ORIGIN, ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } };
  addVideo('live', { mega: 'AAAAAAAA' });
  addMedia('live', 'a');
  addVideo('binned', { binned: true });
  addMedia('binned', 'b', 2000, 7000);
  addVideo('binned2', { binned: true });
  d1.db.exec(`INSERT INTO video_previews (video_id, sha, mime, size, bytes) VALUES ('binned2', '${sha('c')}', 'video/mp4', 3000, ${blob(3000)})`);
  addProbe('AAAAAAAA', 3 * HOUR); // used by "live": kept
  addProbe('BBBBBBBB', 3 * HOUR); // unused and old: goes
  addProbe('CCCCCCCC', 10 * 60_000); // unused but fresh: kept
  addSession(newSessionId(), { expired: true });
  addSession(newSessionId(), { idle: true });
  addSession(newSessionId());
  addAttempt(0, 2 * DAY); // goes
  addAttempt(0, HOUR); // kept: inside the day window
  addAttempt(1, 2 * DAY); // kept: still makes the address known
  addAttempt(1, 31 * DAY); // goes
  d1.db.exec(`INSERT INTO leads (id, name, email, ip_hash, kind) VALUES ('lead1', 'A', 'a@example.com', 'h', 'trial')`);
  d1.db.exec(`INSERT INTO leads (id, name, email, ip_hash, kind, completion, draft_id) VALUES ('lead2', '', '', 'h', 'trial', 'partial', 'draft-0123456789abcdef')`);
});

describe('GET /api/admin/storage/unused and POST /api/admin/storage/clear', () => {
  it('need the passkey', async () => {
    expect((await call('/api/admin/storage/unused')).status).toBe(401);
    expect((await call('/api/admin/storage/clear', { method: 'POST' })).status).toBe(401);
    expect(count('SELECT COUNT(*) AS n FROM posters')).toBe(2);
  });

  it('the dry run counts each group, is no-store, and deletes nothing', async () => {
    const before = ['posters', 'video_previews', 'mega_probes', 'admin_sessions', 'admin_attempts', 'leads', 'videos'].map((t) => count(`SELECT COUNT(*) AS n FROM ${t}`));
    const res = await call('/api/admin/storage/unused', { headers: bearer });
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const body = (await res.json()) as { groups: Record<string, { count: number; bytes: number | null; posters?: number; previews?: number; videos?: number }>; total: { count: number; bytes: number } };
    expect(body.groups.binMedia).toEqual({ count: 3, bytes: 2000 + 7000 + 3000, posters: 1, previews: 2, videos: 2 });
    expect(body.groups.orphanMedia).toMatchObject({ count: 0, bytes: 0 });
    expect(body.groups.megaChecks!.count).toBe(1);
    expect(body.groups.sessions).toEqual({ count: 2, bytes: null });
    expect(body.groups.attempts).toEqual({ count: 2, bytes: null });
    const after = ['posters', 'video_previews', 'mega_probes', 'admin_sessions', 'admin_attempts', 'leads', 'videos'].map((t) => count(`SELECT COUNT(*) AS n FROM ${t}`));
    expect(after).toEqual(before);
  });

  it('clear removes only the unused groups, evicts their edge copies, and leaves videos, leads, live media and the current session', async () => {
    const sid = newSessionId();
    const cookie = await cookieFor(sid);
    const videosBefore = d1.db.prepare('SELECT * FROM videos ORDER BY id').all();
    // Edge copies of the binned and the live media.
    for (const [id, c] of [['binned', 'b'], ['live', 'a']] as const) {
      await caches.default.put(new Request(posterCacheKey(ORIGIN, id, sha(c), 'image/webp')), new Response('p'));
      await caches.default.put(new Request(previewCacheKey(ORIGIN, id, sha(c), 'video/mp4')), new Response('v'));
    }
    const res = await call('/api/admin/storage/clear', { method: 'POST', headers: { Cookie: cookie, Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const body = (await res.json()) as { groups: Record<string, { count: number; bytes: number | null }>; total: { count: number } };
    expect(body.groups.binMedia).toMatchObject({ count: 3, bytes: 12000 });
    expect(body.groups.megaChecks!.count).toBe(1);
    expect(body.groups.sessions!.count).toBe(2);
    expect(body.groups.attempts!.count).toBe(2);

    expect(d1.db.prepare('SELECT video_id FROM posters').all()).toEqual([{ video_id: 'live' }]);
    expect(d1.db.prepare('SELECT video_id FROM video_previews').all()).toEqual([{ video_id: 'live' }]);
    expect((d1.db.prepare('SELECT handle FROM mega_probes ORDER BY handle').all() as { handle: string }[]).map((r) => r.handle)).toEqual(['AAAAAAAA', 'CCCCCCCC']);
    expect(count(`SELECT COUNT(*) AS n FROM admin_sessions WHERE id = '${sid}'`)).toBe(1);
    expect(count('SELECT COUNT(*) AS n FROM admin_sessions')).toBe(2);
    expect(count('SELECT COUNT(*) AS n FROM admin_attempts')).toBe(2);
    expect(count('SELECT COUNT(*) AS n FROM leads')).toBe(2);
    expect(d1.db.prepare('SELECT * FROM videos ORDER BY id').all()).toEqual(videosBefore);

    expect(await caches.default.match(new Request(posterCacheKey(ORIGIN, 'binned', sha('b'), 'image/webp')))).toBeUndefined();
    expect(await caches.default.match(new Request(previewCacheKey(ORIGIN, 'binned', sha('b'), 'video/mp4')))).toBeUndefined();
    expect(await caches.default.match(new Request(posterCacheKey(ORIGIN, 'live', sha('a'), 'image/webp')))).toBeDefined();
    expect(await caches.default.match(new Request(previewCacheKey(ORIGIN, 'live', sha('a'), 'video/mp4')))).toBeDefined();

    // The session that cleared still works, and a second dry run finds nothing left.
    const again = (await (await call('/api/admin/storage/unused', { headers: { Cookie: cookie } })).json()) as { total: { count: number } };
    expect(again.total.count).toBe(0);
    void cache;
  });

  it('a restored video then lists no thumbnail and no preview, so the maker remakes them', async () => {
    await call('/api/admin/storage/clear', { method: 'POST', headers: bearer });
    d1.db.exec("UPDATE videos SET deleted_at = NULL WHERE id = 'binned'");
    const list = (await (await call('/api/admin/videos', { headers: bearer })).json()) as { videos: { id: string; poster: unknown; preview: unknown }[] };
    const v = list.videos.find((x) => x.id === 'binned');
    expect(v?.poster ?? null).toBeNull();
    expect(v?.preview ?? null).toBeNull();
  });
});
