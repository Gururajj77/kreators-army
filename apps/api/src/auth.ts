/**
 * Unlocking /admin (admin brief 1). There are no accounts: the passkey is the ADMIN_KEY secret. A browser exchanges it for a
 * signed, expiring session in an HttpOnly cookie; scripts send `Authorization: Bearer <ADMIN_KEY>`.
 *
 *  - Keys: HKDF-SHA-256 from ADMIN_KEY (salt "kreators.army/admin"; info "session v1" signs tokens, "ip v1" hashes
 *    addresses). Rotating the secret ends every session and changes every address hash, without touching D1.
 *  - Token: v1.<sid22>.<exp10>.<sig43>; the D1 row (admin_sessions) lets "Lock" really revoke it. 7 days absolute, 24 hours
 *    idle, seen_at refreshed at most every 10 minutes.
 *  - Limits: 5 failures in 15 minutes and 20 in a day per address (an IPv6 address counts as its /64), 100 an hour
 *    site-wide unless the address has a success in the last 30 days. A refused try is not counted.
 * Nothing here logs a passkey, a token or a raw address.
 */
import type { MiddlewareHandler } from 'hono';
import type { AdminContext, AppEnv, Env } from './env';
import { originAllowed } from './headers';
import { adminError } from './http';

const enc = new TextEncoder();
const SALT = enc.encode('kreators.army/admin');

export const COOKIE = '__Host-ka_admin';
export const SESSION_TTL_S = 7 * 24 * 3600;
export const IDLE_MS = 24 * 3600 * 1000;
export const SEEN_REFRESH_MS = 10 * 60 * 1000;
export const LIMITS = { per15m: 5, perDay: 20, global1h: 100 } as const;
const MIN = 60_000;

// ---------------------------------------------------------------- keys and tokens

const keyCache = new Map<string, Promise<{ session: CryptoKey; ip: CryptoKey }>>();

async function derive(adminKey: string, info: string): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey('raw', enc.encode(adminKey), 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: SALT, info: enc.encode(info) }, ikm, { name: 'HMAC', hash: 'SHA-256', length: 256 }, false, ['sign', 'verify']);
}

/** The two HMAC keys for this ADMIN_KEY, cached per isolate (a rotated key simply misses the cache). */
export function adminKeys(adminKey: string): Promise<{ session: CryptoKey; ip: CryptoKey }> {
  const k = adminKey.trim();
  let p = keyCache.get(k);
  if (!p) {
    if (keyCache.size > 4) keyCache.clear();
    p = Promise.all([derive(k, 'session v1'), derive(k, 'ip v1')]).then(([session, ip]) => ({ session, ip }));
    keyCache.set(k, p);
  }
  return p;
}

const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));

export function newSessionId(): string {
  return b64u(crypto.getRandomValues(new Uint8Array(16)));
}

export async function signToken(adminKey: string, sid: string, exp: number): Promise<string> {
  const body = `v1.${sid}.${exp}`;
  const sig = await crypto.subtle.sign('HMAC', (await adminKeys(adminKey)).session, enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

const TOKEN = /^v1\.([A-Za-z0-9_-]{22})\.(\d{10})\.([A-Za-z0-9_-]{43})$/;

/** The session id and expiry of a well-formed token whose signature verifies (constant time), else null. Expiry is not checked here. */
export async function verifyToken(adminKey: string, token: string): Promise<{ sid: string; exp: number } | null> {
  const m = TOKEN.exec(token);
  if (!m) return null;
  const ok = await crypto.subtle.verify('HMAC', (await adminKeys(adminKey)).session, unb64u(m[3]!), enc.encode(`v1.${m[1]}.${m[2]}`));
  return ok ? { sid: m[1]!, exp: Number(m[2]) } : null;
}

/** SHA-256 of both sides, then a timing-safe compare of the digests, so nothing leaks through the passkey's length. Both trimmed. */
export async function keysMatch(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(given.trim())), crypto.subtle.digest('SHA-256', enc.encode(expected.trim()))]);
  return crypto.subtle.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------- addresses

/** IPv4 whole; IPv6 reduced to its /64 (one person controls a whole /64). Zone ids and IPv4-mapped forms are handled. */
export function normIp(raw: string): string {
  const ip = raw.trim().toLowerCase().replace(/%.*$/, '');
  if (!ip.includes(':')) return ip || 'local';
  const mapped = /(?:^|:)ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(ip);
  if (mapped) return mapped[1]!;
  const [head = '', tail] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail === undefined ? null : tail ? tail.split(':') : [];
  const groups = t === null ? h : [...h, ...Array<string>(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  return `${groups
    .slice(0, 4)
    .map((g) => g.replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}

/** HMAC of the normalised address under the "ip v1" key, hex, first 32 characters. No raw address is stored. */
export async function ipHash(adminKey: string, req: Request): Promise<string> {
  const ip = normIp(req.headers.get('CF-Connecting-IP') ?? 'local');
  const sig = await crypto.subtle.sign('HMAC', (await adminKeys(adminKey)).ip, enc.encode(ip));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/** "Chrome on macOS": a short label for the list of unlocked browsers. Never the full user agent. */
export function agentLabel(headers: Headers): string {
  const ua = headers.get('User-Agent') ?? '';
  const ch = (headers.get('Sec-CH-UA-Platform') ?? '').replace(/"/g, '').trim();
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /curl|node|undici/i.test(ua) ? 'Script' : 'Browser';
  const platform =
    ch ||
    (/iPhone/.test(ua) ? 'iOS' : /iPad/.test(ua) ? 'iPadOS' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '');
  return (platform ? `${browser} on ${platform}` : browser).slice(0, 60);
}

// ---------------------------------------------------------------- cookies

export function readCookie(header: string | null | undefined, name: string): string | null {
  for (const part of (header ?? '').split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

export const sessionCookie = (token: string) => `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_S}; HttpOnly; Secure; SameSite=Strict`;
export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

// ---------------------------------------------------------------- limits

export interface LimitState {
  over: boolean;
  retryAfter: number;
  /** Failures in the last 15 minutes for this address (including the try just recorded, when there is one). */
  count15: number;
}

/**
 * Reads the three windows in one batch. `recorded` says whether the current try is already in the table (passkey: inserted
 * first, so the 6th try sees 6) or not (Bearer: checked before anything is written, so the 6th sees 5).
 */
export async function limitState(db: D1Database, hash: string, now: number, recorded: boolean): Promise<LimitState> {
  const [a, b, g, k] = await db.batch<{ n: number; oldest: number | null; known?: number }>([
    db.prepare('SELECT COUNT(*) AS n, MIN(at) AS oldest FROM admin_attempts WHERE ip_hash = ? AND ok = 0 AND at > ?').bind(hash, now - 15 * MIN),
    db.prepare('SELECT COUNT(*) AS n, MIN(at) AS oldest FROM admin_attempts WHERE ip_hash = ? AND ok = 0 AND at > ?').bind(hash, now - 24 * 60 * MIN),
    db.prepare('SELECT COUNT(*) AS n, MIN(at) AS oldest FROM admin_attempts WHERE ok = 0 AND at > ?').bind(now - 60 * MIN),
    db.prepare('SELECT EXISTS (SELECT 1 FROM admin_attempts WHERE ok = 1 AND ip_hash = ? AND at > ?) AS known, 0 AS n, NULL AS oldest').bind(hash, now - 30 * 24 * 60 * MIN),
  ]);
  const row = (r: D1Result<{ n: number; oldest: number | null; known?: number }> | undefined) => r?.results[0] ?? { n: 0, oldest: null };
  const c15 = row(a);
  const cDay = row(b);
  const cG = row(g);
  const known = (row(k).known ?? 0) === 1;
  const tripped = (n: number, limit: number) => (recorded ? n > limit : n >= limit);
  const waits: number[] = [];
  if (tripped(c15.n, LIMITS.per15m)) waits.push((c15.oldest ?? now) + 15 * MIN - now);
  if (tripped(cDay.n, LIMITS.perDay)) waits.push((cDay.oldest ?? now) + 24 * 60 * MIN - now);
  if (!known && tripped(cG.n, LIMITS.global1h)) waits.push((cG.oldest ?? now) + 60 * MIN - now);
  return { over: waits.length > 0, retryAfter: Math.max(1, Math.ceil(Math.max(0, ...waits) / 1000)), count15: c15.n };
}

// ---------------------------------------------------------------- the guard

const JSON_TYPE = /^application\/json\s*(;|$)/i;
const IMAGE_TYPE = /^image\/(webp|jpeg|png)\s*(;|$)/i;
const isWrite = (method: string) => method !== 'GET' && method !== 'HEAD';

function hasBody(req: Request): boolean {
  const len = req.headers.get('Content-Length');
  return (len !== null && len !== '0') || req.headers.has('Transfer-Encoding') || req.headers.has('Content-Type');
}

/** JSON routes take application/json; the poster route takes an image type. A body-less write needs neither. */
export function contentTypeOk(req: Request, pathname: string): boolean {
  if (!isWrite(req.method) || req.method === 'DELETE' || !hasBody(req)) return true;
  const type = req.headers.get('Content-Type') ?? '';
  if (/\/videos\/[^/]+\/poster$/.test(pathname) && req.method === 'PUT') return IMAGE_TYPE.test(type);
  return JSON_TYPE.test(type);
}

export interface SessionRow {
  expires_at: number;
  seen_at: number;
  created_at?: number;
}

/**
 * Every /api/admin request except POST and DELETE /session (admin brief 1.4): admin-off, Bearer (limits, compare, an attempt
 * row on failure), cookie (signature and expiry), the session row (expiry and idle), CSRF for cookie writes (Origin and
 * Sec-Fetch-Site), content type. Then refreshes seen_at in waitUntil when it is over 10 minutes old.
 */
export const guard: MiddlewareHandler<AppEnv> = async (c, next) => {
  const key = c.env.ADMIN_KEY?.trim();
  if (!key) return adminError(c, 503, 'admin-off', 'The passkey is not set up on the server yet.');
  const now = Date.now();
  const path = new URL(c.req.url).pathname;

  const auth = c.req.header('Authorization');
  if (auth !== undefined && /^Bearer\s/i.test(auth)) {
    const hash = await ipHash(key, c.req.raw);
    const limit = await limitState(c.env.DB, hash, now, false);
    if (limit.over) return adminError(c, 429, 'too-many', 'Too many failed keys from this address. Try again later.', { retryAfter: limit.retryAfter }, { 'Retry-After': String(limit.retryAfter) });
    if (!(await keysMatch(auth.replace(/^Bearer\s+/i, ''), key))) {
      await c.env.DB.prepare("INSERT INTO admin_attempts (ip_hash, ok, via, at) VALUES (?, 0, 'bearer', ?)").bind(hash, now).run();
      return adminError(c, 401, 'wrong-passkey', 'That key did not work.', { triesLeft: Math.max(0, LIMITS.per15m - (limit.count15 + 1)) });
    }
    if (!contentTypeOk(c.req.raw, path)) return adminError(c, 415, 'unsupported-type', 'Send JSON (or an image for a poster).');
    c.set('admin', { via: 'bearer' });
    return next();
  }

  const token = readCookie(c.req.header('Cookie'), COOKIE);
  if (!token) return adminError(c, 401, 'locked', 'Enter the passkey.');
  const verified = await verifyToken(key, token);
  if (!verified || verified.exp * 1000 <= now) {
    c.header('Set-Cookie', clearCookie());
    return adminError(c, 401, 'expired', 'Your session ended. Enter the passkey to carry on.');
  }
  const row = await c.env.DB.prepare('SELECT expires_at, seen_at FROM admin_sessions WHERE id = ?').bind(verified.sid).first<SessionRow>();
  if (!row || row.expires_at <= now || row.seen_at < now - IDLE_MS) {
    c.header('Set-Cookie', clearCookie());
    return adminError(c, 401, 'expired', 'Your session ended. Enter the passkey to carry on.');
  }
  if (isWrite(c.req.method)) {
    const origin = c.req.header('Origin');
    const site = c.req.header('Sec-Fetch-Site');
    if (!origin || !originAllowed(origin, c.req.url, c.env.PUBLIC_URL) || (site !== undefined && site !== 'same-origin')) {
      return adminError(c, 403, 'forbidden', 'That change has to come from the admin page itself.');
    }
  }
  if (!contentTypeOk(c.req.raw, path)) return adminError(c, 415, 'unsupported-type', 'Send JSON (or an image for a poster).');
  if (now - row.seen_at > SEEN_REFRESH_MS) {
    const touch = c.env.DB.prepare('UPDATE admin_sessions SET seen_at = ? WHERE id = ?').bind(now, verified.sid).run().catch(() => undefined);
    try {
      c.executionCtx.waitUntil(touch);
    } catch {
      await touch;
    }
    row.seen_at = now;
  }
  c.set('admin', { via: 'cookie', sid: verified.sid });
  c.set('session', { expiresAt: row.expires_at, seenAt: row.seen_at });
  return next();
};

/**
 * The same question for /media/v/, /media/mega- and /media/p/ (GET and HEAD only): a valid cookie session or a matching
 * Bearer. It never writes an attempt row; a failed check simply means "not an admin".
 */
export async function adminFromRequest(req: Request, env: Env): Promise<AdminContext | null> {
  const key = env.ADMIN_KEY?.trim();
  if (!key || (req.method !== 'GET' && req.method !== 'HEAD')) return null;
  const auth = req.headers.get('Authorization');
  if (auth && /^Bearer\s/i.test(auth)) return (await keysMatch(auth.replace(/^Bearer\s+/i, ''), key)) ? { via: 'bearer' } : null;
  const token = readCookie(req.headers.get('Cookie'), COOKIE);
  if (!token) return null;
  const verified = await verifyToken(key, token);
  const now = Date.now();
  if (!verified || verified.exp * 1000 <= now) return null;
  const row = await env.DB.prepare('SELECT expires_at, seen_at FROM admin_sessions WHERE id = ?').bind(verified.sid).first<SessionRow>();
  if (!row || row.expires_at <= now || row.seen_at < now - IDLE_MS) return null;
  return { via: 'cookie', sid: verified.sid };
}
