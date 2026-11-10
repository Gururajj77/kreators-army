/**
 * The session endpoints (admin brief 1.10):
 *   POST   /api/admin/session    { passkey }  -> AdminSession + cookie     (outside the guard; limits of 1.5)
 *   GET    /api/admin/session                 -> AdminSession              (guarded)
 *   DELETE /api/admin/session                 -> 204, clears the cookie    (outside the guard; "Lock")
 *   DELETE /api/admin/sessions                -> 204, every session ends   (guarded; "Lock everywhere")
 */
import type { AdminSession } from '@kreators/shared';
import { Hono, type Context } from 'hono';
import { agentLabel, clearCookie, COOKIE, IDLE_MS, ipHash, keysMatch, limitState, LIMITS, newSessionId, readCookie, sessionCookie, SESSION_TTL_S, signToken, verifyToken } from '../../auth';
import type { AppEnv } from '../../env';
import { adminError, HttpError, readJson } from '../../http';

export const session = new Hono<AppEnv>();

const iso = (ms: number) => new Date(ms).toISOString();

function sessionBody(c: Context<AppEnv>, via: 'cookie' | 'bearer', expiresAt: number | null, seenAt: number | null): AdminSession {
  const key = c.env.ADMIN_KEY?.trim() ?? '';
  return {
    via,
    expiresAt: expiresAt ? iso(expiresAt) : null,
    idleExpiresAt: seenAt ? iso(Math.min(seenAt + IDLE_MS, expiresAt ?? Infinity)) : null,
    weakPasskey: key.length < 16,
    legacySecret: !!c.env.MEGA_LINKS?.trim(),
  };
}

session.post('/session', async (c) => {
  const key = c.env.ADMIN_KEY?.trim();
  if (!key) return adminError(c, 503, 'admin-off', 'The passkey is not set up on the server yet.');
  if (!/^application\/json\s*(;|$)/i.test(c.req.header('Content-Type') ?? '')) return adminError(c, 415, 'unsupported-type', 'Send JSON.');
  let passkey: unknown;
  try {
    passkey = (await readJson<{ passkey?: unknown }>(c.req.raw)).passkey;
  } catch (err) {
    if (err instanceof HttpError) return adminError(c, err.status, err.code, err.message);
    throw err;
  }
  if (typeof passkey !== 'string' || passkey.length < 1 || passkey.length > 512) return adminError(c, 400, 'bad-request', 'Enter the passkey.', { field: 'passkey' });

  const db = c.env.DB;
  const now = Date.now();
  const hash = await ipHash(key, c.req.raw);
  // The attempt exists before anything is counted, so two tries at once cannot both slip under the limit.
  const attempt = await db.prepare("INSERT INTO admin_attempts (ip_hash, ok, via, at) VALUES (?, 0, 'passkey', ?) RETURNING id").bind(hash, now).first<{ id: number }>();
  const limit = await limitState(db, hash, now, true);
  if (limit.over) {
    // A refused try is not counted, so the wait ends when the window clears.
    await db.prepare('DELETE FROM admin_attempts WHERE id = ?').bind(attempt!.id).run();
    return adminError(c, 429, 'too-many', 'Too many tries. Wait a few minutes and try again.', { retryAfter: limit.retryAfter }, { 'Retry-After': String(limit.retryAfter) });
  }
  if (!(await keysMatch(passkey, key))) {
    return adminError(c, 401, 'wrong-passkey', "That passkey didn't work.", { triesLeft: Math.max(0, LIMITS.per15m - limit.count15) });
  }

  const sid = newSessionId();
  const exp = Math.floor(now / 1000) + SESSION_TTL_S;
  const token = await signToken(key, sid, exp);
  await db.batch([
    db.prepare('UPDATE admin_attempts SET ok = 1 WHERE id = ?').bind(attempt!.id),
    db.prepare('INSERT INTO admin_sessions (id, created_at, expires_at, seen_at, ip_hash, agent) VALUES (?, ?, ?, ?, ?, ?)').bind(sid, now, exp * 1000, now, hash, agentLabel(c.req.raw.headers)),
    db.prepare('DELETE FROM admin_attempts WHERE at < ?').bind(now - 30 * 24 * 3600 * 1000),
    db.prepare('DELETE FROM admin_sessions WHERE expires_at < ? OR seen_at < ?').bind(now, now - IDLE_MS),
  ]);
  c.header('Set-Cookie', sessionCookie(token));
  return c.json<AdminSession>(sessionBody(c, 'cookie', exp * 1000, now));
});

session.get('/session', (c) => {
  const admin = c.get('admin');
  const s = c.get('session');
  return c.json<AdminSession>(sessionBody(c, admin?.via ?? 'bearer', s?.expiresAt ?? null, s?.seenAt ?? null));
});

session.delete('/session', async (c) => {
  const key = c.env.ADMIN_KEY?.trim();
  const token = readCookie(c.req.header('Cookie'), COOKIE);
  if (key && token) {
    const v = await verifyToken(key, token);
    if (v) await c.env.DB.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(v.sid).run();
  }
  c.header('Set-Cookie', clearCookie());
  return c.body(null, 204);
});

session.delete('/sessions', async (c) => {
  await c.env.DB.prepare('DELETE FROM admin_sessions').run();
  c.header('Set-Cookie', clearCookie());
  return c.body(null, 204);
});
