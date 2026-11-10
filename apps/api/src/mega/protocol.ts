/**
 * MEGA's public-link protocol, server side: call the API, list a shared folder, unwrap node keys, decrypt names and byte
 * ranges. Runs unchanged in workerd (nodejs_compat) and in Node (the tests). Link parsing lives in packages/shared
 * (megaLinks.ts); this module only ever receives a parsed handle and key, and never fetches an address an admin typed.
 *
 * Ciphers:
 *  - Content: AES-128-CTR through Web Crypto.
 *  - Node keys in a folder: AES-128-ECB; attributes: AES-128-CBC, zero IV, zero padding. Web Crypto has neither ECB nor
 *    unpadded CBC, so these use node:crypto, exactly as megajs does. workerd needs an empty-buffer IV for ECB (a null IV
 *    throws ERR_INVALID_ARG_TYPE, measured in the prototype).
 *
 * Protocol sources (fetched 2026-11-10, see .work/v2/mega.md section 13): meganz/sdk commands.cpp CommandGetFile ('g' with
 * "p" for a public handle or "n" plus ?n=<folder> for a node), meganz/webclient network.js (AES-CTR counter = nonce || offset
 * / 16, ranges as `${g}/${a}-${b}`), download2.js (fatal errors; storage 509 = over quota), megajs 1.3.10 (loadAttributes
 * 'f' listing, loadMetadata key alternatives, unmergeKeyMac, ERRORS).
 */
import { createDecipheriv } from 'node:crypto';
import type { ParsedMegaLink } from '@kreators/shared';

/** The one MEGA API address the Worker calls (V2-SPEC 2.4.8). Tests may point MEGA_API at a local mock. */
export const MEGA_API_BASE = 'https://g.api.mega.co.nz/';

// ---------------------------------------------------------------- bytes

export function b64urlDecode(s: string): Uint8Array {
  const clean = s.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '');
  const pad = clean.length % 4 === 0 ? '' : '='.repeat(4 - (clean.length % 4));
  const bin = atob(clean + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function xor16(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = a[i]! ^ b[i]!;
  return out;
}

export async function sha256Hex(data: Uint8Array | string, chars = 64): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(h, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, chars);
}

/** A short, non-secret name for the file a link points at (cache keys, logs): the file handle, or "<folder>.<node>". */
export function handleTag(link: ParsedMegaLink): string {
  if (link.kind === 'file') return link.handle;
  if (link.kind === 'folder-file') return `${link.folderHandle}.${link.nodeHandle}`;
  return link.folderHandle;
}

// ---------------------------------------------------------------- errors

export type MegaErrorKind = 'bad-link' | 'not-found' | 'removed' | 'blocked' | 'over-quota' | 'busy' | 'bad-key' | 'upstream';

/** MEGA API error numbers (megajs ERRORS; meganz/sdk include/mega/types.h). */
const API_ERRORS: Record<number, [string, MegaErrorKind]> = {
  [-2]: ['EARGS', 'not-found'],
  [-3]: ['EAGAIN', 'busy'],
  [-4]: ['ERATELIMIT', 'busy'],
  [-6]: ['ETOOMANY', 'removed'], // on 'g': the owner's account is suspended (webclient download2.js)
  [-9]: ['ENOENT', 'not-found'],
  [-11]: ['EACCESS', 'removed'],
  [-14]: ['EKEY', 'bad-key'],
  [-16]: ['EBLOCKED', 'blocked'], // taken down
  [-17]: ['EOVERQUOTA', 'over-quota'],
  [-18]: ['ETEMPUNAVAIL', 'busy'],
  [-401]: ['ESHAREROVERQUOTA', 'over-quota'],
};

export class MegaError extends Error {
  constructor(
    readonly kind: MegaErrorKind,
    message: string,
    readonly code?: number,
    /** Seconds until MEGA says the transfer quota frees up (509 x-mega-time-left, or the 'tl' field). */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'MegaError';
  }
}

export function apiError(code: number, tl?: number): MegaError {
  const [name, kind] = API_ERRORS[code] ?? [`E${-code}`, 'upstream' as MegaErrorKind];
  return new MegaError(kind, `MEGA API ${name} (${code})`, code, tl);
}

// ---------------------------------------------------------------- keys and ciphers

/** A file key is 8 x 32-bit words: AES key = k[0..3] xor k[4..7]; CTR nonce = k[4..5]; meta-MAC = k[6..7]. */
export function splitFileKey(key: Uint8Array): { aes: Uint8Array; nonce: Uint8Array; metaMac: Uint8Array } {
  if (key.length !== 32) throw new MegaError('bad-key', 'a file key is 32 bytes');
  return { aes: xor16(key.subarray(0, 16), key.subarray(16, 32)), nonce: key.slice(16, 24), metaMac: key.slice(24, 32) };
}

function joinBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

/** AES-128-ECB decrypt without padding (node keys wrapped with a folder key). The IV must be an empty buffer (workerd). */
export function ecbDecrypt(key16: Uint8Array, data: Uint8Array): Uint8Array {
  const d = createDecipheriv('aes-128-ecb', key16, new Uint8Array(0)).setAutoPadding(false);
  return joinBytes(d.update(data), d.final());
}

/** AES-128-CBC decrypt with a zero IV and no padding (MEGA pads with zeros, not PKCS#7). */
export function cbcDecryptNoPad(key16: Uint8Array, data: Uint8Array): Uint8Array {
  if (data.length === 0 || data.length % 16) throw new MegaError('bad-key', 'ciphertext is not whole AES blocks');
  const d = createDecipheriv('aes-128-cbc', key16, new Uint8Array(16)).setAutoPadding(false);
  return joinBytes(d.update(data), d.final());
}

/** 'at' is AES-CBC (zero IV, zero padded) of 'MEGA{...json}' under the AES key (a file key folded, or a 16-byte key). */
export function decryptAttributes(at: string, key: Uint8Array): Record<string, unknown> | null {
  let plain: Uint8Array;
  try {
    const aes = key.length === 32 ? splitFileKey(key).aes : key;
    plain = cbcDecryptNoPad(aes, b64urlDecode(at));
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

export interface FileCipher {
  key: CryptoKey;
  nonce: Uint8Array;
}

export async function fileCipher(fileKey: Uint8Array): Promise<FileCipher> {
  const { aes, nonce } = splitFileKey(fileKey);
  return { key: await crypto.subtle.importKey('raw', aes, 'AES-CTR', false, ['decrypt']), nonce };
}

/** The 16-byte counter block for a byte offset: nonce (8 bytes) then the block index, 64-bit big-endian. */
export function counterBlock(nonce: Uint8Array, byteOffset: number): Uint8Array {
  const iv = new Uint8Array(16);
  iv.set(nonce, 0);
  const block = Math.floor(byteOffset / 16);
  const dv = new DataView(iv.buffer);
  dv.setUint32(8, Math.floor(block / 0x100000000), false);
  dv.setUint32(12, block >>> 0, false);
  return iv;
}

/**
 * Decrypts ciphertext whose first byte sits at absolute file offset `offset` (any offset: a range may start mid-block).
 * CTR is a keystream xor, so the bytes before `offset` in its block are padded with zeros and dropped after.
 */
export async function decryptAt(cipher: FileCipher, data: Uint8Array, offset: number): Promise<Uint8Array> {
  const skip = offset % 16;
  let input = data;
  if (skip) {
    input = new Uint8Array(skip + data.length);
    input.set(data, skip);
  }
  const out = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CTR', counter: counterBlock(cipher.nonce, offset - skip), length: 64 }, cipher.key, input));
  return skip ? out.subarray(skip) : out;
}

// ---------------------------------------------------------------- hashcash (HTTP 402 + X-Hashcash; megajs generateHashcashToken)

/** Solves MEGA's hashcash challenge within `maxRounds` (each round hashes 12 MB). 0 rounds: busy at once (Free plan, D11). */
export async function solveHashcash(header: string, maxRounds: number): Promise<string> {
  const parts = header.split(':');
  if (parts.length !== 4 || parts[0] !== '1') throw new MegaError('upstream', 'unknown hashcash challenge');
  if (!(maxRounds > 0)) throw new MegaError('busy', 'hashcash asked; not solved (MEGA_HASHCASH_ROUNDS is 0)');
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

// ---------------------------------------------------------------- client

export interface MegaClient {
  fetch?: typeof fetch;
  /** With a trailing slash; 'cs?...' is appended. */
  apiBase?: string;
  /** Hashcash rounds allowed before giving up. */
  hashcashRounds?: number;
  /** 'ssl' sent with 'g': 1 as on mega.nz (webclient crypto.js), 2 as the SDK with forceSSL. Both return https URLs. */
  ssl?: 1 | 2;
  /** Tests only: the mock's origin, the one storage origin allowed besides MEGA's own (V2-SPEC 2.4.8). */
  testStorageOrigin?: string;
}

interface MegaEnv {
  MEGA_API?: string;
  MEGA_HASHCASH_ROUNDS?: string;
}

let warnedApi = false;

/** The client for this Worker's environment. MEGA_API is honoured only as http://127.0.0.1:<port> or http://localhost:<port>. */
export function megaClient(env: MegaEnv): MegaClient {
  const rounds = Math.min(16, Math.max(0, Math.floor(Number(env.MEGA_HASHCASH_ROUNDS ?? 0)) || 0));
  const client: MegaClient = { hashcashRounds: rounds };
  if (env.MEGA_API) {
    const m = /^(http:\/\/(?:127\.0\.0\.1|localhost):\d{1,5})\/?$/.exec(env.MEGA_API.trim());
    if (m) {
      client.apiBase = `${m[1]}/`;
      client.testStorageOrigin = m[1];
    } else if (!warnedApi) {
      warnedApi = true;
      console.warn('MEGA_API ignored: only http://127.0.0.1:<port> or http://localhost:<port> is honoured (tests)');
    }
  }
  return client;
}

const STORAGE = /^https?:\/\/[a-z0-9-]+\.userstorage\.mega\.co\.nz(:\d+)?\//;

/**
 * The storage address MEGA's 'g' gave, if it may be fetched: a *.userstorage.mega.co.nz host (rewritten to https), or, in
 * tests only, the mock's own origin. Anything else is 'upstream', so the Worker never fetches an address it was handed blindly.
 */
export function storageUrlAllowed(url: string, client: Pick<MegaClient, 'testStorageOrigin'>): string {
  if (STORAGE.test(url)) return url.replace(/^http:/, 'https:');
  if (client.testStorageOrigin && url.startsWith(`${client.testStorageOrigin}/`)) return url;
  throw new MegaError('upstream', 'MEGA gave a storage address outside its own hosts');
}

let seq = Math.floor(Math.random() * 1e9);

/** One command to /cs. Throws MegaError for an API error number; returns the command's result. */
export async function apiCall(client: MegaClient, command: Record<string, unknown>, query: Record<string, string> = {}): Promise<any> {
  const f = client.fetch ?? fetch;
  const base = client.apiBase ?? MEGA_API_BASE;
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  for (let attempt = 0; attempt < 4; attempt++) {
    const qs = new URLSearchParams({ id: String(++seq), ...query });
    let res: Response;
    try {
      res = await f(`${base}cs?${qs}`, { method: 'POST', headers, body: JSON.stringify([command]) });
    } catch {
      throw new MegaError('busy', 'MEGA API did not answer');
    }
    if (res.status === 402 && res.headers.get('X-Hashcash')) {
      await res.body?.cancel().catch(() => undefined);
      headers = { ...headers, 'X-Hashcash': await solveHashcash(res.headers.get('X-Hashcash')!, client.hashcashRounds ?? 0) };
      continue;
    }
    if (res.status >= 500) throw new MegaError('busy', `MEGA API answered ${res.status}`);
    if (!res.ok) throw new MegaError('upstream', `MEGA API answered ${res.status}`);
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      throw new MegaError('upstream', 'MEGA API answered something that is not JSON');
    }
    const result = Array.isArray(body) ? body[0] : body;
    if (typeof result === 'number' && result < 0) {
      if (result === -3 && attempt < 3) continue; // EAGAIN: retry at once (a viewer is waiting)
      throw apiError(result);
    }
    return result;
  }
  throw new MegaError('busy', 'MEGA API kept asking to retry');
}

/** Where a file is fetched from: a public file handle, or a node inside a public folder. */
export type FileAddr = { p: string } | { n: string; folder: string };

export interface Resolved {
  /** Storage URL for ciphertext; append /<start>-<end>. Expires; never sent to the browser. */
  url: string;
  size: number;
  /** File name from the attributes, when the 'g' answer carried them. */
  name: string | null;
}

/** The 'g' command: a storage URL, the size and the encrypted attributes (a wrong key is caught here). */
export async function getFile(client: MegaClient, addr: FileAddr, fileKey: Uint8Array): Promise<Resolved> {
  const cmd: Record<string, unknown> = { a: 'g', g: 1, ssl: client.ssl ?? 1 };
  let query: Record<string, string> = {};
  if ('p' in addr) cmd.p = addr.p;
  else {
    cmd.n = addr.n;
    query = { n: addr.folder };
  }
  const r = await apiCall(client, cmd, query);
  if (typeof r !== 'object' || r === null) throw new MegaError('upstream', 'MEGA API gave no file details');
  if (typeof r.e === 'number' && r.e < 0) throw apiError(r.e, typeof r.tl === 'number' ? r.tl : undefined);
  if (r.d) throw new MegaError('removed', 'MEGA marks this file as unavailable');
  let g = r.g;
  if (Array.isArray(g) || (g && typeof g === 'object')) g = Object.values(g)[0]; // only with v:2, which is never sent
  if (typeof g === 'number' && g < 0) throw apiError(g);
  if (typeof g !== 'string' || !/^https?:\/\//.test(g)) throw new MegaError('upstream', 'MEGA API gave no download URL');
  if (typeof r.s !== 'number' || r.s < 0) throw new MegaError('upstream', 'MEGA API gave no size');
  const attrs = typeof r.at === 'string' ? decryptAttributes(r.at, fileKey) : null;
  if (typeof r.at === 'string' && !attrs) throw new MegaError('bad-key', 'the key does not open this file');
  return { url: storageUrlAllowed(g, client), size: r.s, name: typeof attrs?.n === 'string' ? attrs.n : null };
}

// ---------------------------------------------------------------- folders (bulk import)

export interface FolderNode {
  handle: string;
  parent: string;
  type: 'file' | 'folder';
  name: string | null;
  size: number;
  /** Seconds since 1970, as MEGA stores it. */
  ts: number;
  /** The unwrapped node key: 32 bytes for a file, 16 for a folder. Null when no key alternative opened the node. */
  key: Uint8Array | null;
  /** Folder names from the shared root down to this node's parent. */
  path: string[];
}

export interface FolderListing {
  root: { handle: string; name: string | null };
  nodes: FolderNode[];
}

/**
 * Lists a public folder: 'f' with c:1, ca:1, r:1 and ?n=<folder handle> (megajs loadAttributes). Every node's k is one or
 * more "owner:base64(ECB_folderKey(nodeKey))" alternatives joined by '/'; the right one is the one whose attributes open.
 * Unverified against a real MEGA folder (V2-SPEC 2.4.6): check the founder's first folder link before importing it.
 */
export async function listFolder(client: MegaClient, folderHandle: string, folderKey: Uint8Array): Promise<FolderListing> {
  if (folderKey.length !== 16) throw new MegaError('bad-key', 'a folder key is 16 bytes');
  const listing = await apiCall(client, { a: 'f', c: 1, ca: 1, r: 1 }, { n: folderHandle });
  const raw: any[] = Array.isArray(listing?.f) ? listing.f : [];
  if (!raw.length) throw new MegaError('not-found', 'the folder is empty or gone');
  const rootRaw = raw.find((n) => typeof n.k === 'string' && n.k.split('/').some((alt: string) => alt.split(':')[0] === n.h)) ?? raw[0];

  const nodes: FolderNode[] = raw.map((n) => {
    let key: Uint8Array | null = null;
    let name: string | null = null;
    for (const alt of String(n.k ?? '').split('/')) {
      const enc = alt.slice(alt.lastIndexOf(':') + 1);
      let wrapped: Uint8Array;
      try {
        wrapped = b64urlDecode(enc);
      } catch {
        continue;
      }
      if (wrapped.length !== 16 && wrapped.length !== 32) continue; // longer ones are RSA-wrapped; never in a public link
      const k = ecbDecrypt(folderKey, wrapped);
      const attrs = typeof n.a === 'string' ? decryptAttributes(n.a, k) : null;
      if (attrs) {
        key = k;
        name = typeof attrs.n === 'string' ? attrs.n : null;
        break;
      }
    }
    return { handle: String(n.h), parent: String(n.p ?? ''), type: n.t === 1 ? 'folder' : 'file', name, size: Number(n.s ?? 0), ts: Number(n.ts ?? 0), key, path: [] };
  });

  const byHandle = new Map(nodes.map((n) => [n.handle, n]));
  for (const n of nodes) {
    const path: string[] = [];
    let p = byHandle.get(n.parent);
    for (let guard = 0; p && guard < 64; guard++) {
      if (p.handle !== rootRaw.h) path.unshift(p.name ?? p.handle);
      p = p.handle === rootRaw.h ? undefined : byHandle.get(p.parent);
    }
    n.path = path;
  }
  const root = byHandle.get(String(rootRaw.h))!;
  return { root: { handle: root.handle, name: root.name }, nodes: nodes.filter((n) => n !== root) };
}

const VIDEO_EXT = /\.(mp4|m4v|mov)$/i;
const OTHER_VIDEO_EXT = /\.(mkv|webm|avi|wmv|flv|3gp|mts|m2ts|hevc|ts)$/i;

/** Files under `under` (a subfolder handle, or the whole share), classed for the bulk import list, in natural name order. */
export function videoFiles(listing: FolderListing, under?: string): Array<FolderNode & { playable: 'video' | 'unsupported-container' }> {
  const byHandle = new Map(listing.nodes.map((x) => [x.handle, x]));
  const inside = (n: FolderNode): boolean => {
    if (!under) return true;
    for (let p: FolderNode | undefined = n, guard = 0; p && guard < 64; p = byHandle.get(p.parent), guard++) if (p.parent === under) return true;
    return false;
  };
  return listing.nodes
    .filter((n) => n.type === 'file' && n.name && n.key && inside(n) && (VIDEO_EXT.test(n.name) || OTHER_VIDEO_EXT.test(n.name)))
    .map((n) => ({ ...n, playable: VIDEO_EXT.test(n.name!) ? ('video' as const) : ('unsupported-container' as const) }))
    .sort((a, b) => (a.path.join('/') + '/' + a.name).localeCompare(b.path.join('/') + '/' + b.name, undefined, { numeric: true }));
}

/** The 32-byte key of one file in a public folder (from the listing). */
export async function folderFileKey(client: MegaClient, folderHandle: string, folderKey: Uint8Array, nodeHandle: string): Promise<{ key: Uint8Array; name: string | null; size: number }> {
  const listing = await listFolder(client, folderHandle, folderKey);
  const node = listing.nodes.find((n) => n.handle === nodeHandle);
  if (!node) throw new MegaError('not-found', 'that file is not in the shared folder');
  if (node.type !== 'file') throw new MegaError('bad-link', 'that link points at a folder, not a file');
  if (!node.key || node.key.length !== 32) throw new MegaError('bad-key', 'the folder key does not open this file');
  return { key: node.key, name: node.name, size: node.size };
}

// ---------------------------------------------------------------- storage

/** Fetches ciphertext [start, end] (inclusive) from a storage URL. Ranges are a path suffix, not a Range header. */
export async function fetchCipher(client: MegaClient, url: string, start: number, end: number, signal?: AbortSignal): Promise<Response> {
  const f = client.fetch ?? fetch;
  let res: Response;
  try {
    res = await f(`${url}/${start}-${end}`, { method: 'GET', signal });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new MegaError('busy', 'MEGA storage did not answer');
  }
  if (res.status === 509) {
    await res.body?.cancel().catch(() => undefined);
    const left = Number(res.headers.get('x-mega-time-left'));
    throw new MegaError('over-quota', 'MEGA transfer quota exceeded for this IP', 509, Number.isFinite(left) && left > 0 ? left : undefined);
  }
  if (res.status === 403 || res.status === 404 || res.status === 410) {
    await res.body?.cancel().catch(() => undefined);
    throw new MegaError('upstream', `storage URL refused (${res.status})`, res.status);
  }
  if (!res.ok || !res.body) {
    await res.body?.cancel().catch(() => undefined);
    throw new MegaError('busy', `storage answered ${res.status}`, res.status);
  }
  return res;
}
