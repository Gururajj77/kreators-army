import { describe, expect, it } from 'vitest';
import { agentLabel, contentTypeOk, ipHash, keysMatch, newSessionId, normIp, readCookie, sessionCookie, clearCookie, signToken, verifyToken } from '../src/auth';

const KEY = 'amber-basil-cedar-delta-1234';

describe('session token (admin brief 1.2)', () => {
  it('signs and verifies: v1.<sid22>.<exp10>.<sig43>, 80 characters', async () => {
    const sid = newSessionId();
    expect(sid).toMatch(/^[A-Za-z0-9_-]{22}$/);
    const exp = Math.floor(Date.now() / 1000) + 604800;
    const token = await signToken(KEY, sid, exp);
    expect(token).toMatch(/^v1\.[A-Za-z0-9_-]{22}\.\d{10}\.[A-Za-z0-9_-]{43}$/);
    expect(token.length).toBe(80);
    expect(await verifyToken(KEY, token)).toEqual({ sid, exp });
  });

  it('refuses a tampered signature, sid or expiry, and anything malformed', async () => {
    const sid = newSessionId();
    const exp = Math.floor(Date.now() / 1000) + 60;
    const token = await signToken(KEY, sid, exp);
    const [v, s, e, sig] = token.split('.');
    // Change a middle character: every bit of it is data. The last character of a 43- or 22-character base64url string carries padding bits, so
    // swapping A and B there can decode to the same bytes and the "tampered" token would still verify (about 1 run in 16).
    const flip = (x: string) => `${x.slice(0, 10)}${x[10] === 'A' ? 'B' : 'A'}${x.slice(11)}`;
    expect(await verifyToken(KEY, `${v}.${s}.${e}.${flip(sig!)}`)).toBeNull();
    expect(await verifyToken(KEY, `${v}.${flip(s!)}.${e}.${sig}`)).toBeNull();
    expect(await verifyToken(KEY, `${v}.${s}.${Number(e) + 1}.${sig}`)).toBeNull();
    for (const bad of ['', 'v1.abc', `v2.${s}.${e}.${sig}`, `${token}x`]) expect(await verifyToken(KEY, bad)).toBeNull();
  });

  it('a past expiry still verifies its signature; the guard compares it with the clock', async () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    const t = await signToken(KEY, newSessionId(), past);
    expect((await verifyToken(KEY, t))?.exp).toBe(past);
  });

  it('rotating ADMIN_KEY ends every session; surrounding spaces do not', async () => {
    const t = await signToken(KEY, newSessionId(), Math.floor(Date.now() / 1000) + 60);
    expect(await verifyToken('a-different-admin-key-after-rotation', t)).toBeNull();
    expect(await verifyToken(`  ${KEY}\n`, t)).not.toBeNull();
  });
});

describe('cookie', () => {
  it('is __Host-, Path=/, HttpOnly, Secure, SameSite=Strict, 7 days; cleared with Max-Age=0', () => {
    expect(sessionCookie('T')).toBe('__Host-ka_admin=T; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict');
    expect(clearCookie()).toBe('__Host-ka_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');
    expect(readCookie('a=1; __Host-ka_admin=v1.x; b=2', '__Host-ka_admin')).toBe('v1.x');
    expect(readCookie('ka_admin=v1.x', '__Host-ka_admin')).toBeNull();
    expect(readCookie(null, '__Host-ka_admin')).toBeNull();
  });
});

describe('addresses (admin brief 1.5)', () => {
  it.each([
    ['203.0.113.7', '203.0.113.7'],
    ['2001:db8:85a3:1:8a2e:370:7334:1', '2001:db8:85a3:1::/64'],
    ['2001:db8:85a3:1::99', '2001:db8:85a3:1::/64'],
    ['2001:DB8:85A3:0001:ffff:ffff:ffff:ffff', '2001:db8:85a3:1::/64'],
    ['2001:db8::1', '2001:db8:0:0::/64'],
    ['::1', '0:0:0:0::/64'],
    ['::ffff:198.51.100.4', '198.51.100.4'],
    ['fe80::1%en0', 'fe80:0:0:0::/64'],
    ['local', 'local'],
  ])('%s -> %s', (raw, norm) => {
    expect(normIp(raw)).toBe(norm);
  });

  it('one hash per /64, 32 hex characters, and a different key gives a different hash', async () => {
    const req = (ip: string) => new Request('https://x.test', { headers: { 'CF-Connecting-IP': ip } });
    const a = await ipHash(KEY, req('2001:db8:85a3:1::1'));
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(await ipHash(KEY, req('2001:db8:85a3:1:ffff::2'))).toBe(a);
    expect(await ipHash(KEY, req('2001:db8:85a3:2::1'))).not.toBe(a);
    expect(await ipHash('another-key-entirely-123', req('2001:db8:85a3:1::1'))).not.toBe(a);
    expect(await ipHash(KEY, new Request('https://x.test'))).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('keysMatch (admin brief 1.6)', () => {
  it('constant-time compare of digests, trimmed both sides', async () => {
    expect(await keysMatch(KEY, KEY)).toBe(true);
    expect(await keysMatch(`${KEY}\n`, `  ${KEY}`)).toBe(true);
    expect(await keysMatch(KEY.toUpperCase(), KEY)).toBe(false);
    expect(await keysMatch('', KEY)).toBe(false);
    expect(await keysMatch('a'.repeat(5000), KEY)).toBe(false);
  });
});

describe('content types and agent labels', () => {
  const r = (method: string, type?: string, body = '{}') => new Request('https://x.test/api/admin/videos', { method, headers: type ? { 'Content-Type': type } : {}, body: method === 'GET' ? undefined : body });
  it('JSON routes take application/json; the poster route takes an image; a body-less write needs neither', () => {
    expect(contentTypeOk(r('POST', 'application/json'), '/api/admin/videos')).toBe(true);
    expect(contentTypeOk(r('POST', 'application/json; charset=utf-8'), '/api/admin/videos')).toBe(true);
    expect(contentTypeOk(r('POST', 'text/plain'), '/api/admin/videos')).toBe(false);
    expect(contentTypeOk(r('POST', 'application/x-www-form-urlencoded', 'a=1'), '/api/admin/videos')).toBe(false);
    expect(contentTypeOk(r('PUT', 'image/webp', 'x'), '/api/admin/videos/abc/poster')).toBe(true);
    expect(contentTypeOk(r('PUT', 'application/json'), '/api/admin/videos/abc/poster')).toBe(false);
    expect(contentTypeOk(r('PUT', 'image/svg+xml', 'x'), '/api/admin/videos/abc/poster')).toBe(false);
    expect(contentTypeOk(new Request('https://x.test', { method: 'POST' }), '/api/admin/videos/adopt-secret')).toBe(true);
    expect(contentTypeOk(r('GET'), '/api/admin/videos')).toBe(true);
  });

  it('labels a browser without keeping its user agent', () => {
    const h = (ua: string, platform?: string) => new Headers({ 'User-Agent': ua, ...(platform ? { 'Sec-CH-UA-Platform': platform } : {}) });
    expect(agentLabel(h('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '"macOS"'))).toBe('Chrome on macOS');
    expect(agentLabel(h('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'))).toBe('Safari on iOS');
    expect(agentLabel(h('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0'))).toBe('Firefox on Windows');
    expect(agentLabel(h('curl/8.7.1'))).toBe('Script');
  });
});

describe('the guard with no ADMIN_KEY (admin brief 1.4 step 1)', () => {
  it('every admin route, and unlocking, answer 503 admin-off with X-Robots-Tag', async () => {
    const { default: worker } = await import('../src/index');
    const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;
    const env = { DB: {} as D1Database, ADMIN_KEY: '  ' };
    for (const [method, path, body] of [
      ['GET', '/api/admin/videos', undefined],
      ['GET', '/api/admin/session', undefined],
      ['POST', '/api/admin/session', '{"passkey":"x"}'],
    ] as const) {
      const res = await worker.fetch(new Request(`https://x.test${path}`, { method, body, headers: body ? { 'Content-Type': 'application/json' } : {} }), env, ctx);
      expect(res.status, path).toBe(503);
      expect(((await res.json()) as { code: string }).code).toBe('admin-off');
      expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    }
  });
});
