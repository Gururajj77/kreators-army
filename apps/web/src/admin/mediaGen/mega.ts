// (admin8) MEGA's public-file protocol in the admin's browser: the Worker no longer touches video bytes (the Free plan's 10 ms CPU limit cut
// about one cold range in five). The admin API hands this page one file's address and key (GET /api/admin/mega/source, passkey session only);
// this module asks MEGA's API for a storage URL, fetches the encrypted bytes and decrypts them with Web Crypto. It is part of the admin chunk
// only (lazy), so the public bundle never carries it.
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
 * 5xx are retried here with a short backoff; every other error number throws.
 */
async function apiCall(command: Record<string, unknown>, query: Record<string, string>, signal?: AbortSignal): Promise<any> {
  let hashcash: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const qs = new URLSearchParams({ id: String(++seq), ...query });
    let res: Response;
    try {
      res = await fetch(`${apiBase()}cs?${qs}`, {
        method: 'POST',
        body: JSON.stringify([command]),
        headers: hashcash ? { 'X-Hashcash': hashcash } : undefined,
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        signal,
      });
    } catch (e) {
      if (isAbort(e)) throw e;
      if (attempt < 4) {
        await sleep(1000 * 2 ** attempt, signal);
        continue;
      }
      throw new MegaError('busy', 'MEGA API did not answer');
    }
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
      throw new MegaError('upstream', 'MEGA API answered something that is not JSON');
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
async function getFile(src: MegaFileSource, aes: Uint8Array<ArrayBuffer>, signal?: AbortSignal): Promise<Resolved> {
  const cmd: Record<string, unknown> = { a: 'g', g: 1, ssl: 2 };
  let query: Record<string, string> = {};
  if (src.kind === 'file') cmd.p = src.handle;
  else {
    cmd.n = src.node;
    query = { n: src.folder };
  }
  const r = await apiCall(cmd, query, signal);
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

  constructor(readonly src: MegaFileSource) {
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
    const p = this.cipher.then((c) => getFile(this.src, c.aes, signal));
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
      let res: Response;
      try {
        res = await fetch(`${url}/${start}-${end}`, { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal });
      } catch (e) {
        if (isAbort(e)) throw e;
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', 'MEGA storage did not answer');
      }
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
      let buf: Uint8Array<ArrayBuffer>;
      try {
        buf = new Uint8Array(await res.arrayBuffer());
      } catch (e) {
        if (isAbort(e) || signal?.aborted) throw e;
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', 'MEGA storage stopped sending');
      }
      if (buf.length !== end - start + 1) {
        if (attempt < 4) {
          await sleep(1000 * 2 ** attempt, signal);
          continue;
        }
        throw new MegaError('busy', `storage sent ${buf.length} of ${end - start + 1} bytes`);
      }
      this.fetched += buf.length;
      return buf;
    }
  }

  /** Decrypts ciphertext whose first byte is at `offset` (a multiple of 16 here: runs start on chunk bounds). */
  private async decrypt(data: Uint8Array<ArrayBuffer>, offset: number): Promise<Uint8Array<ArrayBuffer>> {
    const c = await this.cipher;
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CTR', counter: counterBlock(c.nonce, offset), length: 64 }, c.key, data));
  }

  private keep(i: number, bytes: Uint8Array<ArrayBuffer>) {
    this.chunks.delete(i);
    this.chunks.set(i, bytes);
    while (this.chunks.size > KEEP_CHUNKS) this.chunks.delete(this.chunks.keys().next().value!);
  }

  /** Chunks [first, last] fetched in one storage request; each chunk's promise is shared with any concurrent reader. */
  private fetchRun(first: number, last: number, size: number) {
    const run = (async () => {
      const start = first * CHUNK;
      const end = Math.min(size, (last + 1) * CHUNK) - 1;
      const plain = await this.decrypt(await this.cipherRange(start, end), start);
      for (let i = first; i <= last; i++) this.keep(i, plain.slice((i - first) * CHUNK, Math.min(plain.length, (i - first + 1) * CHUNK)));
    })();
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
      // Every missing run is asked for at once, so the next chunk is on its way while this one is sent.
      for (let i = first; i <= last; ) {
        if (this.chunks.has(i) || this.inflight.has(i)) {
          i++;
          continue;
        }
        let j = i;
        while (j + 1 <= last && !this.chunks.has(j + 1) && !this.inflight.has(j + 1)) j++;
        this.fetchRun(i, j, size);
        i = j + 1;
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

  /** The whole file, decrypted (the fallback when no service worker can serve ranges). */
  async whole(signal?: AbortSignal, onProgress?: (done: number, total: number) => void): Promise<Blob> {
    const { size } = await this.info(signal);
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
