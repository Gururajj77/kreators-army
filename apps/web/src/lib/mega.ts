// (admin8) MEGA's public-file protocol in the browser: the Worker never touches video bytes (the Free plan's 10 ms CPU limit cut about one cold
// range in five). It asks MEGA's API for a storage URL, fetches the encrypted bytes and decrypts them with Web Crypto. Two users, both lazy, so
// the main bundle never carries it: the admin (a file's address and key from GET /api/admin/mega/source, passkey session only, to make posters
// and hover clips) and, since r21, the public player on phones (lib/megaPlay.ts: the key from the video's public MEGA embed link), because
// MEGA's own embed player cannot stream on an iPhone and sends the visitor to mega.nz instead.
//
// A careful port of the browser-safe parts of apps/api/src/mega/protocol.ts (keep the two in step): the 'g' command (p=<handle> for a file
// link, n=<node> with ?n=<folder> for a file in a shared folder, g:1, ssl:2), the error numbers, the AES-CTR counter (nonce || block index,
// 64-bit big-endian), hashcash (HTTP 402 + X-Hashcash) and the storage rules (ranges as a '/<start>-<end>' path suffix, 509 = transfer quota).
// The attributes check uses AES-CBC with a zero IV and no padding, which Web Crypto lacks, so a valid PKCS#7 block is appended (see cbcNoPad).

import type { MegaFileSource } from '@kreators/shared';

/** MEGA's API. The storage hosts it hands out are *.userstorage.mega.co.nz (CSP connect-src lists both). */
const MEGA_API = 'https://g.api.mega.co.nz/';
const STORAGE = /^https?:\/\/[a-z0-9-]+\.userstorage\.mega\.co\.nz(:\d+)?\//;

/**
 * Tests only: a build made with VITE_MEGA_TEST_API=http://127.0.0.1:<port> talks to a local mock instead of MEGA (API and storage on that
 * origin). Anything that is not a loopback http origin is ignored, and a production build never sets it, so the bundler folds this to null.
 */
const TEST_ORIGIN: string | null = (() => {
  const raw = import.meta.env.VITE_MEGA_TEST_API as string | undefined;
  if (!raw) return null;
  const m = /^(http:\/\/(?:127\.0\.0\.1|localhost):\d{1,5})\/?$/.exec(raw.trim());
  return m ? m[1]! : null;
})();

const apiBase = () => (TEST_ORIGIN ? `${TEST_ORIGIN}/` : MEGA_API);

// ---------------------------------------------------------------- bytes

export function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const clean = s.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '');
  const pad = clean.length % 4 === 0 ? '' : '='.repeat(4 - (clean.length % 4));
  const bin = atob(clean + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ---------------------------------------------------------------- errors

export type MegaErrorKind = 'not-found' | 'removed' | 'blocked' | 'over-quota' | 'busy' | 'bad-key' | 'upstream';

/** MEGA API error numbers (megajs ERRORS; meganz/sdk types.h), as in protocol.ts. */
const API_ERRORS: Record<number, [string, MegaErrorKind]> = {
  [-2]: ['EARGS', 'not-found'],
  [-3]: ['EAGAIN', 'busy'],
  [-4]: ['ERATELIMIT', 'busy'],
  [-6]: ['ETOOMANY', 'removed'],
  [-9]: ['ENOENT', 'not-found'],
  [-11]: ['EACCESS', 'removed'],
  [-14]: ['EKEY', 'bad-key'],
  [-16]: ['EBLOCKED', 'blocked'],
  [-17]: ['EOVERQUOTA', 'over-quota'],
  [-18]: ['ETEMPUNAVAIL', 'busy'],
  [-401]: ['ESHAREROVERQUOTA', 'over-quota'],
};

export class MegaError extends Error {
  constructor(
    readonly kind: MegaErrorKind,
    message: string,
    readonly code?: number,
    /** Seconds until the transfer quota frees up, when MEGA says. */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'MegaError';
  }
}

function apiError(code: number, tl?: number): MegaError {
  const [name, kind] = API_ERRORS[code] ?? [`E${-code}`, 'upstream' as MegaErrorKind];
  return new MegaError(kind, `MEGA API ${name} (${code})`, code, tl);
}

/** What the admin reads for each kind. */
export const MEGA_SAYS: Record<MegaErrorKind, string> = {
  'over-quota': "MEGA's transfer quota is used up for now. Retry in an hour or two.",
  busy: 'MEGA is busy. Retry in a minute.',
  'not-found': 'MEGA says this file is gone.',
  removed: 'MEGA says this file was removed.',
  blocked: 'MEGA has blocked this file.',
  'bad-key': "The MEGA link's key doesn't open this file.",
  upstream: "MEGA didn't answer properly. Retry later.",
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', on);
      resolve();
    }, ms);
    const on = () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', on, { once: true });
  });

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

interface Watchdog {
  readonly signal?: AbortSignal;
  /** The timer ended the request (a silent connection), not the caller. */
  idle: boolean;
  /** Something arrived: the timer starts again. */
  poke(): void;
  done(): void;
}

/**
 * (r21) One request's abort, linked to the caller's `signal`, that also fires after `idleMs` with nothing arriving. Neither WebKit nor Chromium
 * ever times a fetch out, so a MEGA connection that goes silent without closing would hang its read, and the player's spinner, for good; ended
 * here, it is retried like a dropped connection. idleMs 0 (the admin) adds nothing.
 */
function watchdog(idleMs: number, signal?: AbortSignal): Watchdog {
  const none = () => undefined;
  if (!idleMs) return { signal, idle: false, poke: none, done: none };
  const ctl = new AbortController();
  const cancel = () => ctl.abort();
  let t: ReturnType<typeof setTimeout> | undefined;
  const w: Watchdog = {
    signal: ctl.signal,
    idle: false,
    poke: () => {
      clearTimeout(t);
      t = setTimeout(() => {
        w.idle = true;
        ctl.abort();
      }, idleMs);
    },
    done: () => {
      clearTimeout(t);
      signal?.removeEventListener('abort', cancel);
    },
  };
  if (signal?.aborted) ctl.abort();
  else {
    signal?.addEventListener('abort', cancel, { once: true });
    w.poke();
  }
  return w;
}

// ---------------------------------------------------------------- ciphers

function xor16(a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = a[i]! ^ b[i]!;
  return out;
}

/** A file key is 8 x 32-bit words: AES key = k[0..3] xor k[4..7]; CTR nonce = k[4..5]. */
function splitFileKey(key: Uint8Array): { aes: Uint8Array<ArrayBuffer>; nonce: Uint8Array } {
  if (key.length !== 32) throw new MegaError('bad-key', 'a file key is 32 bytes');
  return { aes: xor16(key.subarray(0, 16), key.subarray(16, 32)), nonce: key.slice(16, 24) };
}

/** The 16-byte counter block for a byte offset: nonce (8 bytes) then the block index, 64-bit big-endian. */
export function counterBlock(nonce: Uint8Array, byteOffset: number): Uint8Array<ArrayBuffer> {
  const iv = new Uint8Array(16);
  iv.set(nonce, 0);
  const block = Math.floor(byteOffset / 16);
  const dv = new DataView(iv.buffer);
  dv.setUint32(8, Math.floor(block / 0x100000000), false);
  dv.setUint32(12, block >>> 0, false);
  return iv;
}

/**
 * AES-128-CBC decrypt, zero IV, no padding (MEGA's attributes). Web Crypto insists on PKCS#7, so one block X is appended whose decryption under
 * CBC is sixteen 0x10 bytes: X = E(0x10^16 xor C_last), and E of one block is the first block of a CBC encryption with a zero IV.
 */
async function cbcNoPad(aes: Uint8Array<ArrayBuffer>, data: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  if (!data.length || data.length % 16) throw new MegaError('bad-key', 'ciphertext is not whole AES blocks');
  const key = await crypto.subtle.importKey('raw', aes, 'AES-CBC', false, ['encrypt', 'decrypt']);
  const zero = new Uint8Array(16);
  const last = data.subarray(data.length - 16);
  const p = new Uint8Array(16);
  for (let i = 0; i < 16; i++) p[i] = 0x10 ^ last[i]!;
  const x = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv: zero }, key, p)).subarray(0, 16);
  const all = new Uint8Array(data.length + 16);
  all.set(data);
  all.set(x, data.length);
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: zero }, key, all));
}

/** 'at' is AES-CBC of 'MEGA{...json}' under the file's AES key. Null when the key does not open it. */
async function decryptAttributes(at: string, aes: Uint8Array<ArrayBuffer>): Promise<Record<string, unknown> | null> {
  let plain: Uint8Array;
  try {
    plain = await cbcNoPad(aes, b64urlDecode(at));
  } catch {
    return null;
  }
  let end = plain.indexOf(0);
  if (end < 0) end = plain.length;
  const text = new TextDecoder().decode(plain.subarray(0, end));
  if (!text.startsWith('MEGA{"')) return null;
  try {
    return JSON.parse(text.slice(4)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- hashcash

/** The browser can afford more rounds than the Worker could (each hashes 12 MB, about 10 ms). */
const HASHCASH_ROUNDS = 256;

async function solveHashcash(header: string, maxRounds = HASHCASH_ROUNDS): Promise<string> {
  const parts = header.split(':');
  if (parts.length !== 4 || parts[0] !== '1') throw new MegaError('upstream', 'unknown hashcash challenge');
  const easiness = Number(parts[1]);
  const threshold = ((((easiness & 63) << 1) + 1) << ((easiness >> 6) * 7 + 3)) >>> 0;
  const token = b64urlDecode(parts[3]!);
  const buffer = new Uint8Array(4 + 262144 * 48);
  for (let i = 0; i < 262144; i++) buffer.set(token, 4 + i * 48);
  for (let round = 0; round < maxRounds; round++) {
    const view = new DataView(await crypto.subtle.digest('SHA-256', buffer));
    if (view.getUint32(0) <= threshold) return `1:${parts[3]}:${b64urlEncode(buffer.slice(0, 4))}`;
    for (let j = 0; ; j++) {
      buffer[j] = (buffer[j]! + 1) & 255;
      if (buffer[j]) break;
    }
  }
  throw new MegaError('busy', 'hashcash not solved within budget');
}

// ---------------------------------------------------------------- the API

let seq = Math.floor(Math.random() * 1e9);

/**
 * One command to /cs. The body goes as text/plain (a CORS "simple" request, no preflight); MEGA reads it as JSON either way. EAGAIN and a
 * 5xx are retried here with a short backoff; every other error number throws. (r21) With `idleMs` (the public player), an attempt with no
 * answer by then counts as a dropped connection (watchdog).
 */
async function apiCall(command: Record<string, unknown>, query: Record<string, string>, signal?: AbortSignal, idleMs = 0): Promise<any> {
  let hashcash: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const qs = new URLSearchParams({ id: String(++seq), ...query });
    const live = watchdog(idleMs, signal);
    let res: Response;
    try {
      res = await fetch(`${apiBase()}cs?${qs}`, {
        method: 'POST',
        body: JSON.stringify([command]),
        headers: hashcash ? { 'X-Hashcash': hashcash } : undefined,
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        signal: live.signal,
      });
    } catch (e) {
      live.done();
      if (isAbort(e) && !live.idle) throw e;
      if (attempt < 4) {
        await sleep(1000 * 2 ** attempt, signal);
        continue;
      }
      throw new MegaError('busy', 'MEGA API did not answer');
    }
    if (res.ok) live.poke();
    else live.done();
    const challenge = res.headers.get('X-Hashcash');
    if (res.status === 402 && challenge) {
      await res.body?.cancel().catch(() => undefined);
      hashcash = await solveHashcash(challenge);
      continue;
    }
    if (res.status >= 500) {
      await res.body?.cancel().catch(() => undefined);
      if (attempt < 4) {
        await sleep(1000 * 2 ** attempt, signal);
        continue;
      }
      throw new MegaError('busy', `MEGA API answered ${res.status}`);
    }
    if (!res.ok) throw new MegaError('upstream', `MEGA API answered ${res.status}`);
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      if (live.idle) {
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', 'MEGA API did not answer');
      }
      throw new MegaError('upstream', 'MEGA API answered something that is not JSON');
    } finally {
      live.done();
    }
    const result = Array.isArray(body) ? body[0] : body;
    if (typeof result === 'number' && result < 0) {
      if ((result === -3 || result === -4) && attempt < 4) {
        await sleep(1000 * 2 ** attempt, signal);
        continue;
      }
      throw apiError(result);
    }
    return result;
  }
  throw new MegaError('busy', 'MEGA API kept asking to retry');
}

interface Resolved {
  url: string;
  size: number;
  name: string | null;
  at: number;
}

function storageUrl(url: string): string {
  if (STORAGE.test(url)) return url.replace(/^http:/, 'https:');
  if (TEST_ORIGIN && url.startsWith(`${TEST_ORIGIN}/`)) return url;
  throw new MegaError('upstream', 'MEGA gave a storage address outside its own hosts');
}

/** The 'g' command: a storage URL (valid for a while), the size, and the attributes, which prove the key (a wrong one is caught here). */
async function getFile(src: MegaFileSource, aes: Uint8Array<ArrayBuffer>, signal?: AbortSignal, idleMs = 0): Promise<Resolved> {
  const cmd: Record<string, unknown> = { a: 'g', g: 1, ssl: 2 };
  let query: Record<string, string> = {};
  if (src.kind === 'file') cmd.p = src.handle;
  else {
    cmd.n = src.node;
    query = { n: src.folder };
  }
  const r = await apiCall(cmd, query, signal, idleMs);
  if (typeof r !== 'object' || r === null) throw new MegaError('upstream', 'MEGA API gave no file details');
  if (typeof r.e === 'number' && r.e < 0) throw apiError(r.e, typeof r.tl === 'number' ? r.tl : undefined);
  if (r.d) throw new MegaError('removed', 'MEGA marks this file as unavailable');
  let g = r.g;
  if (Array.isArray(g) || (g && typeof g === 'object')) g = Object.values(g)[0];
  if (typeof g === 'number' && g < 0) throw apiError(g);
  if (typeof g !== 'string' || !/^https?:\/\//.test(g)) throw new MegaError('upstream', 'MEGA API gave no download URL');
  if (typeof r.s !== 'number' || r.s < 0) throw new MegaError('upstream', 'MEGA API gave no size');
  const attrs = typeof r.at === 'string' ? await decryptAttributes(r.at, aes) : null;
  if (typeof r.at === 'string' && !attrs) throw new MegaError('bad-key', 'the key does not open this file');
  return { url: storageUrl(g), size: r.s, name: typeof attrs?.n === 'string' ? attrs.n : null, at: Date.now() };
}

// ---------------------------------------------------------------- one file

/** Decrypted pieces are kept in aligned chunks, so the player's repeated and overlapping ranges cost MEGA's quota once. */
export const CHUNK = 1024 * 1024;
/** At most this many chunks per answer (a short 206; the player asks for the rest). */
export const MAX_CHUNKS = 4;
/** Decrypted chunks kept per file (MiB). */
const KEEP_CHUNKS = 48;
/** A storage URL is used for this long before 'g' is asked again. */
const URL_TTL_MS = 8 * 60 * 1000;

export interface MegaFileInfo {
  size: number;
  name: string | null;
}

/**
 * (r21) How a reader fetches. The defaults are the admin's (one storage request per run of missing chunks, nothing read ahead: a clip needs a few
 * seconds and MEGA's quota is precious). The public player on phones asks for `parallel` single-chunk requests at once and reads `ahead` chunks
 * past every range: MEGA's free downloads are slow per connection (measured 0.25 to 1.3 MB/s) and about three times faster over four.
 */
export interface MegaReadOptions {
  /** Storage requests in flight at once, each one chunk; 0 keeps one request per run. */
  parallel?: number;
  /** Chunks fetched past each range read, at low priority (what is asked for always goes first). */
  ahead?: number;
  /** (r21) A MEGA request with nothing arriving for this long is ended and retried as a dropped connection (watchdog); 0 never ends one. */
  idleMs?: number;
}

interface Waiter {
  urgent: boolean;
  go: () => void;
  stop: (e: unknown) => void;
}

/**
 * One MEGA file, read by range: resolve once, fetch runs of missing chunks with one storage request each, decrypt, keep. Busy answers and
 * dropped connections are retried with backoff; an expired storage URL is resolved again once; over quota and the per-file errors throw.
 * `lastError` keeps the latest MEGA failure, so a <video> that only says "error" can be told why.
 */
export class MegaFile {
  lastError: MegaError | null = null;
  private resolved: Promise<Resolved> | null = null;
  private cipher: Promise<{ key: CryptoKey; nonce: Uint8Array; aes: Uint8Array<ArrayBuffer> }>;
  private chunks = new Map<number, Uint8Array<ArrayBuffer>>();
  private inflight = new Map<number, Promise<Uint8Array<ArrayBuffer>>>();
  /** Bytes fetched from MEGA (the harness reads it). */
  fetched = 0;
  /** (r21) Bytes received from MEGA as they arrive, failed requests included: `fetched` grows only by whole requests (1 MiB and up), so on a
   *  slow link the player's stall check would take a running download for a stalled one. */
  received = 0;
  private readonly parallel: number;
  private readonly ahead: number;
  private readonly idleMs: number;
  private active = 0;
  /** (r21) Urgent requests in flight: read-ahead waits for them. */
  private urgentActive = 0;
  private waiting: Waiter[] = [];
  /** The queued (not yet started) request of a chunk read ahead, so a reader that needs it can move it to the front. */
  private queued = new Map<number, Waiter>();
  private disposed = false;

  constructor(
    readonly src: MegaFileSource,
    opts: MegaReadOptions = {},
  ) {
    this.parallel = Math.max(0, Math.floor(opts.parallel ?? 0));
    this.ahead = Math.max(0, Math.floor(opts.ahead ?? 0));
    this.idleMs = Math.max(0, Math.floor(opts.idleMs ?? 0));
    this.cipher = (async () => {
      const { aes, nonce } = splitFileKey(b64urlDecode(src.key));
      return { key: await crypto.subtle.importKey('raw', aes, 'AES-CTR', false, ['decrypt']), nonce, aes };
    })();
    this.cipher.catch(() => undefined);
  }

  private fail(e: unknown): never {
    if (e instanceof MegaError) this.lastError = e;
    throw e;
  }

  private resolve(fresh = false, signal?: AbortSignal): Promise<Resolved> {
    const r = this.resolved;
    if (r && !fresh) {
      return r.then((x) => (Date.now() - x.at < URL_TTL_MS ? x : this.resolve(true, signal)));
    }
    const p = this.cipher.then((c) => getFile(this.src, c.aes, signal, this.idleMs));
    this.resolved = p;
    p.catch(() => {
      if (this.resolved === p) this.resolved = null;
    });
    return p;
  }

  /** Size and name from MEGA ('g'). */
  async info(signal?: AbortSignal): Promise<MegaFileInfo> {
    try {
      const r = await this.resolve(false, signal);
      return { size: r.size, name: r.name };
    } catch (e) {
      return this.fail(e);
    }
  }

  /** Ciphertext [start, end] (inclusive), as bytes; retried when MEGA is busy, re-resolved once when the URL went stale. */
  private async cipherRange(start: number, end: number, signal?: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
    let fresh = false;
    for (let attempt = 0; ; attempt++) {
      const { url } = await this.resolve(fresh, signal);
      fresh = false;
      // (r21) The player's requests end after idleMs with nothing arriving, as a dropped connection (not once the player has closed).
      const live = watchdog(this.idleMs, signal);
      const cancelled = (e: unknown) => isAbort(e) && (!live.idle || this.disposed);
      let res: Response;
      try {
        res = await fetch(`${url}/${start}-${end}`, { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: live.signal });
      } catch (e) {
        live.done();
        if (cancelled(e)) throw e;
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', 'MEGA storage did not answer');
      }
      if (res.ok) live.poke();
      else live.done();
      if (res.status === 509) {
        await res.body?.cancel().catch(() => undefined);
        const left = Number(res.headers.get('x-mega-time-left'));
        throw new MegaError('over-quota', 'MEGA transfer quota exceeded', 509, Number.isFinite(left) && left > 0 ? left : undefined);
      }
      if (res.status === 403 || res.status === 404 || res.status === 410) {
        await res.body?.cancel().catch(() => undefined);
        if (attempt < 1) {
          fresh = true;
          continue;
        }
        throw new MegaError('upstream', `storage URL refused (${res.status})`, res.status);
      }
      if (!res.ok) {
        await res.body?.cancel().catch(() => undefined);
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', `storage answered ${res.status}`, res.status);
      }
      // (r21) Read piece by piece: `received` counts bytes as they arrive, and each piece restarts the watchdog.
      const buf = new Uint8Array(end - start + 1);
      let got = 0;
      try {
        const reader = res.body?.getReader();
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          live.poke();
          this.received += value.byteLength;
          if (got + value.byteLength <= buf.length) buf.set(value, got);
          got += value.byteLength;
        }
      } catch (e) {
        if (cancelled(e) || signal?.aborted) throw e;
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', 'MEGA storage stopped sending');
      } finally {
        live.done();
      }
      if (got !== buf.length) {
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', `storage sent ${got} of ${buf.length} bytes`);
      }
      this.fetched += got;
      return buf;
    }
  }

  /** Decrypts ciphertext whose first byte is at `offset` (a multiple of 16 here: runs start on chunk bounds). */
  private async decrypt(data: Uint8Array<ArrayBuffer>, offset: number): Promise<Uint8Array<ArrayBuffer>> {
    const c = await this.cipher;
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CTR', counter: counterBlock(c.nonce, offset), length: 64 }, c.key, data));
  }

  /** (admin10) Bytes of decrypted chunks kept in memory. */
  keptBytes(): number {
    let n = 0;
    for (const c of this.chunks.values()) n += c.byteLength;
    return n;
  }

  /** (admin10) "Clear unused cache": drops the kept chunks, unless a read is on its way (it would need them); answers the bytes dropped. */
  dropChunks(): number {
    if (this.inflight.size) return 0;
    const n = this.keptBytes();
    this.chunks.clear();
    return n;
  }

  private keep(i: number, bytes: Uint8Array<ArrayBuffer>) {
    this.chunks.delete(i);
    this.chunks.set(i, bytes);
    while (this.chunks.size > KEEP_CHUNKS) this.chunks.delete(this.chunks.keys().next().value!);
  }

  /**
   * (r21) A storage request slot (MegaReadOptions.parallel); urgent waiters go before read-ahead ones, and read-ahead starts only while no urgent
   * request is in flight: on a slow link it would split the bandwidth with the chunk the player is waiting for. Free when parallel is 0.
   */
  private slot(urgent: boolean, chunk?: number): Promise<() => void> {
    if (!this.parallel) return Promise.resolve(() => undefined);
    if (this.disposed) return Promise.reject(new DOMException('Aborted', 'AbortError'));
    return new Promise<() => void>((resolve, reject) => {
      const w: Waiter = {
        urgent,
        go: () => {
          if (chunk !== undefined && this.queued.get(chunk) === w) this.queued.delete(chunk);
          const wanted = w.urgent; // promoted while it waited, it counts as urgent
          this.active++;
          if (wanted) this.urgentActive++;
          let freed = false;
          resolve(() => {
            if (freed) return;
            freed = true;
            this.active--;
            if (wanted) this.urgentActive--;
            this.pump();
          });
        },
        stop: reject,
      };
      if (chunk !== undefined && !urgent) this.queued.set(chunk, w);
      this.enqueue(w);
      this.pump();
    });
  }

  /** Starts waiters while slots are free; read-ahead (always behind the urgent ones) waits for the urgent requests in flight. */
  private pump() {
    while (this.active < this.parallel && this.waiting.length) {
      if (!this.waiting[0]!.urgent && this.urgentActive) return;
      this.waiting.shift()!.go();
    }
  }

  private enqueue(w: Waiter) {
    if (!w.urgent) return void this.waiting.push(w);
    const at = this.waiting.findIndex((x) => !x.urgent);
    if (at < 0) this.waiting.push(w);
    else this.waiting.splice(at, 0, w);
  }

  /** A chunk read ahead is now wanted: its queued request moves up with the urgent ones. */
  private promote(i: number) {
    const w = this.queued.get(i);
    if (!w || w.urgent) return;
    const at = this.waiting.indexOf(w);
    if (at < 0) return;
    this.waiting.splice(at, 1);
    w.urgent = true;
    this.enqueue(w);
    this.pump();
  }

  /** (r21) The player closed: queued requests are dropped (those on their way finish), and nothing new starts. */
  dispose() {
    this.disposed = true;
    const left = this.waiting;
    this.waiting = [];
    this.queued.clear();
    for (const w of left) w.stop(new DOMException('Aborted', 'AbortError'));
  }

  /** Chunks [first, last] fetched in one storage request; each chunk's promise is shared with any concurrent reader. */
  private fetchRun(first: number, last: number, size: number, urgent = true) {
    const run = (async () => {
      const free = await this.slot(urgent, first === last ? first : undefined);
      try {
        await this.fetchRunNow(first, last, size);
      } finally {
        free();
      }
    })();
    this.track(run, first, last);
  }

  private async fetchRunNow(first: number, last: number, size: number) {
    const start = first * CHUNK;
    const end = Math.min(size, (last + 1) * CHUNK) - 1;
    const plain = await this.decrypt(await this.cipherRange(start, end), start);
    for (let i = first; i <= last; i++) this.keep(i, plain.slice((i - first) * CHUNK, Math.min(plain.length, (i - first + 1) * CHUNK)));
  }

  private track(run: Promise<void>, first: number, last: number) {
    for (let i = first; i <= last; i++) {
      const p = run.then((): Uint8Array<ArrayBuffer> => {
        const c = this.chunks.get(i);
        if (!c) throw new MegaError('busy', 'chunk dropped');
        return c;
      });
      p.catch(() => undefined);
      this.inflight.set(i, p);
      p.finally(() => {
        if (this.inflight.get(i) === p) this.inflight.delete(i);
      }).catch(() => undefined);
    }
  }

  /** One chunk: kept (and marked as recently used), or on its way. */
  private async chunk(i: number, size: number): Promise<Uint8Array<ArrayBuffer>> {
    const kept = this.chunks.get(i);
    if (kept) {
      this.keep(i, kept);
      return kept;
    }
    // Dropped from the memory since this read began (many reads at once): fetched again.
    if (!this.inflight.has(i)) this.fetchRun(i, i, size);
    return this.inflight.get(i)!;
  }

  /**
   * Plaintext [start, end] (inclusive) in order, chunk by chunk. The MEGA requests themselves are not tied to `signal`: a player that drops a
   * range and asks for an overlapping one at once (a seek) shares the chunks already on their way instead of failing with the first one.
   */
  async *read(start: number, end: number, signal?: AbortSignal): AsyncGenerator<Uint8Array<ArrayBuffer>> {
    try {
      const { size } = await this.info();
      const first = Math.floor(start / CHUNK);
      const last = Math.floor(Math.min(end, size - 1) / CHUNK);
      // Every missing run is asked for at once, so the next chunk is on its way while this one is sent. (r21) In parallel mode each chunk is
      // its own request (several connections at once), a chunk already queued as read-ahead moves to the front, and the chunks after this
      // range are read ahead at low priority.
      for (let i = first; i <= last; ) {
        if (this.chunks.has(i) || this.inflight.has(i)) {
          if (this.parallel) this.promote(i);
          i++;
          continue;
        }
        let j = i;
        if (!this.parallel) while (j + 1 <= last && !this.chunks.has(j + 1) && !this.inflight.has(j + 1)) j++;
        this.fetchRun(i, j, size);
        i = j + 1;
      }
      if (this.parallel && this.ahead) {
        const lastChunk = Math.floor((size - 1) / CHUNK);
        for (let i = last + 1; i <= Math.min(lastChunk, last + this.ahead); i++) {
          if (!this.chunks.has(i) && !this.inflight.has(i)) this.fetchRun(i, i, size, false);
        }
      }
      for (let i = first; i <= last; i++) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const bytes = await this.chunk(i, size);
        const from = i === first ? start - i * CHUNK : 0;
        const to = i === last ? Math.min(end, size - 1) - i * CHUNK + 1 : bytes.length;
        yield from === 0 && to === bytes.length ? bytes : bytes.slice(from, to);
      }
    } catch (e) {
      if (isAbort(e)) throw e;
      this.fail(e);
    }
  }

  /** The whole file, decrypted (the fallback when no service worker can serve ranges). (r21) In parallel mode, one-chunk requests, several at once. */
  async whole(signal?: AbortSignal, onProgress?: (done: number, total: number) => void): Promise<Blob> {
    const { size } = await this.info(signal);
    if (this.parallel) {
      const count = Math.ceil(size / CHUNK);
      const parts: Uint8Array<ArrayBuffer>[] = new Array(count);
      let next = 0;
      let done = 0;
      const worker = async () => {
        while (next < count) {
          const i = next++;
          const start = i * CHUNK;
          const end = Math.min(size, start + CHUNK) - 1;
          try {
            parts[i] = await this.decrypt(await this.cipherRange(start, end, signal), start);
          } catch (e) {
            next = count; // the other connections stop after their current chunk
            if (isAbort(e)) throw e;
            this.fail(e);
          }
          done += end - start + 1;
          onProgress?.(done, size);
        }
      };
      await Promise.all(Array.from({ length: Math.min(this.parallel, count) }, worker));
      return new Blob(parts, { type: 'video/mp4' });
    }
    const parts: Uint8Array<ArrayBuffer>[] = [];
    const step = 8 * CHUNK;
    for (let start = 0; start < size; start += step) {
      const end = Math.min(size, start + step) - 1;
      try {
        parts.push(await this.decrypt(await this.cipherRange(start, end, signal), start));
      } catch (e) {
        if (isAbort(e)) throw e;
        this.fail(e);
      }
      onProgress?.(end + 1, size);
    }
    return new Blob(parts, { type: 'video/mp4' });
  }
}

/** RFC 9110 single byte range, as the Worker's stream parsed it. Anything else is a full answer. */
export function parseRange(header: string | null, size: number): { start: number; end: number } | 'unsatisfiable' | null {
  if (!header) return null;
  const m = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(header);
  if (!m || (!m[1] && !m[2])) return null;
  if (!m[1]) {
    const n = Number(m[2]);
    if (n === 0 || size === 0) return 'unsatisfiable';
    return { start: Math.max(0, size - n), end: size - 1 };
  }
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (start >= size || (m[2] && Number(m[2]) < start)) return 'unsatisfiable';
  return { start, end };
}
