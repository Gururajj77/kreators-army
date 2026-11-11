// (admin8) A playable, same-origin source for one MEGA video, made in the admin's browser (the Worker never touches the bytes).
//
// Design: a small service worker (public/admin-mega-sw.js, scope /admin) answers GET /admin/__mega/<token> by asking this page for the range;
// this page reads it from MEGA (mega.ts: 'g', ranged storage fetches, AES-CTR in Web Crypto, chunks kept in memory) and streams it back. The
// <video> then seeks like on any server, only the ranges it reads leave MEGA's quota (the index and a few seconds for a clip), and the canvas
// stays untainted because the address is same-origin. The token is random and maps to a key held in this page only, so nothing secret is in
// a URL or reaches the server, and a request no page answers is a 404 from the worker.
// Fallback, where no service worker can run (a private window in some browsers, an insecure origin): the whole file is downloaded,
// decrypted and played from a blob: URL (CSP media-src blob:). The drawer never uses the fallback (it would download whole files to show a
// preview); the background maker does, for files up to BLOB_MAX.
import type { MegaFileSource } from '@kreators/shared';
import { AdminApiError, adminFetch } from '../api';
import { CHUNK, MAX_CHUNKS, MEGA_SAYS, MegaError, MegaFile, parseRange } from './mega';

const SW_URL = '/admin-mega-sw.js';
const SW_SCOPE = '/admin';
const VIRTUAL = '/admin/__mega/';
/** The biggest file the blob fallback downloads whole. */
export const BLOB_MAX = 600 * 1024 * 1024;

/** What to open: a saved video by id, or an unsaved link the drawer just checked (its probe, by handle). */
export type SourceRef = { video: string } | { probe: string };

export interface PlayableSource {
  /** Same-origin: '/admin/__mega/<token>' (service worker) or 'blob:...'. */
  url: string;
  mode: 'sw' | 'blob';
  file: MegaFile;
  /** The latest MEGA failure behind this source, if any (a <video> error says nothing more than "error"). */
  why(): MegaError | null;
  release(): void;
}

// ---------------------------------------------------------------- the bridge

const sources = new Map<string, MegaFile>();
let bridge: Promise<boolean> | null = null;
let listening = false;

/** ?megabridge=blob on an admin page forces the fallback (the harness tests it). */
const forcedBlob = () => typeof location !== 'undefined' && new URLSearchParams(location.search).get('megabridge') === 'blob';

function ours(sw: ServiceWorker | null | undefined): boolean {
  return !!sw && new URL(sw.scriptURL).pathname === SW_URL;
}

function listen() {
  if (listening) return;
  listening = true;
  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    const d = e.data as { kx?: string; token?: string; range?: string | null } | null;
    if (!d || d.kx !== 'mega-range' || !e.ports[0]) return;
    void serve(e.ports[0], String(d.token ?? ''), d.range ?? null);
  });
  navigator.serviceWorker.startMessages();
}

/** Registers the bridge and waits until it controls this page. False where it cannot (then the blob fallback is used). */
export function ensureBridge(): Promise<boolean> {
  bridge ??= (async () => {
    if (forcedBlob() || typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !window.isSecureContext) return false;
    try {
      listen();
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE, updateViaCache: 'none' });
      if (!ours(navigator.serviceWorker.controller)) {
        // The site's own worker (scope /) may control this page until ours claims it.
        await new Promise<void>((resolve, reject) => {
          const done = () => {
            if (!ours(navigator.serviceWorker.controller)) return;
            navigator.serviceWorker.removeEventListener('controllerchange', done);
            clearTimeout(t);
            resolve();
          };
          const t = setTimeout(() => {
            navigator.serviceWorker.removeEventListener('controllerchange', done);
            reject(new Error('the MEGA bridge did not take control'));
          }, 10000);
          navigator.serviceWorker.addEventListener('controllerchange', done);
          // A worker that is already active (installed on an earlier visit, page loaded outside its scope) claims on activation only.
          reg.active?.postMessage({ kx: 'claim' });
          done();
        });
      }
      const ping = await fetch(`${VIRTUAL}ping`, { cache: 'no-store' });
      return ping.status === 204 && ping.headers.get('X-Kx-Mega') === '1';
    } catch {
      return false;
    }
  })();
  return bridge;
}

function newToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

type Msg = { t: 'unknown' } | { t: 'head'; status: number; headers: Record<string, string>; text?: string } | { t: 'data'; buf: ArrayBuffer } | { t: 'end' } | { t: 'error'; message: string };

/** One range for the worker: a head (status and headers) once the first piece is decrypted, then the pieces, then 'end'. */
async function serve(port: MessagePort, token: string, rangeHeader: string | null) {
  const file = sources.get(token);
  const post = (m: Msg, transfer: Transferable[] = []) => {
    try {
      port.postMessage(m, transfer);
    } catch {
      /* the worker dropped the request */
    }
  };
  if (!file) {
    post({ t: 'unknown' });
    port.close();
    return;
  }
  const abort = new AbortController();
  port.onmessage = (e) => {
    if ((e.data as { t?: string })?.t === 'cancel') abort.abort();
  };
  port.start();
  const base = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
  let headSent = false;
  try {
    const { size } = await file.info();
    const r = parseRange(rangeHeader, size);
    if (r === 'unsatisfiable') {
      post({ t: 'head', status: 416, headers: { ...base, 'Content-Range': `bytes */${size}` } });
      return;
    }
    let start = 0;
    let end = size - 1;
    if (r) ({ start, end } = r);
    // At most MAX_CHUNKS chunks per answer, ending on a chunk bound: the player asks for the rest (the Worker did the same).
    const cap = (Math.floor(start / CHUNK) + MAX_CHUNKS) * CHUNK - 1;
    const partial = !!r || end > cap;
    end = Math.min(end, cap);
    const headers: Record<string, string> = { ...base, 'Content-Length': String(end - start + 1) };
    if (partial) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    for await (const piece of file.read(start, end, abort.signal)) {
      if (!headSent) {
        post({ t: 'head', status: partial ? 206 : 200, headers });
        headSent = true;
      }
      // A copy: the piece may be a chunk the file keeps, and a transfer would empty it.
      const copy = piece.slice();
      post({ t: 'data', buf: copy.buffer }, [copy.buffer]);
    }
    if (!headSent) post({ t: 'head', status: partial ? 206 : 200, headers });
    post({ t: 'end' });
  } catch (e) {
    if (abort.signal.aborted) return;
    const message = e instanceof MegaError ? MEGA_SAYS[e.kind] : 'The MEGA read failed.';
    if (headSent) post({ t: 'error', message });
    else {
      const quota = e instanceof MegaError && e.kind === 'over-quota';
      post({ t: 'head', status: quota ? 509 : 502, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store', ...(e instanceof MegaError ? { 'X-Mega-Error': e.kind } : {}) }, text: message });
    }
  } finally {
    port.close();
  }
}

// ---------------------------------------------------------------- opening a source

/** The file's address and key from the admin API (passkey session; never cached, never logged). */
export function fetchSource(ref: SourceRef, signal?: AbortSignal): Promise<MegaFileSource> {
  const q = 'video' in ref ? `video=${encodeURIComponent(ref.video)}` : `probe=${encodeURIComponent(ref.probe)}`;
  return adminFetch<MegaFileSource>(`/mega/source?${q}`, { signal, quiet: true });
}

/**
 * Opens a MEGA video for this page. Asks MEGA for the file first ('g'), so a removed file, a wrong key or the transfer limit fail here with
 * a MegaError instead of a silent <video> error. `allowBlob`: download the whole file where no service worker can serve ranges.
 */
export async function openSource(ref: SourceRef, opts: { signal?: AbortSignal; allowBlob?: boolean; onProgress?: (done: number, total: number) => void } = {}): Promise<PlayableSource> {
  const src = await fetchSource(ref, opts.signal);
  const file = new MegaFile(src);
  const info = await file.info(opts.signal);
  if (await ensureBridge()) {
    const token = newToken();
    sources.set(token, file);
    return { url: `${VIRTUAL}${token}`, mode: 'sw', file, why: () => file.lastError, release: () => sources.delete(token) };
  }
  if (!opts.allowBlob) throw new BridgeError('This browser cannot play MEGA videos here (no service worker). Use Chrome or Safari, not a private window.');
  if (info.size > BLOB_MAX) throw new BridgeError(`Without a service worker the whole file is downloaded, and this one is ${Math.round(info.size / 1048576)} MB. Use Chrome or Safari, not a private window.`);
  const blob = await file.whole(opts.signal, opts.onProgress);
  const url = URL.createObjectURL(blob);
  return { url, mode: 'blob', file, why: () => file.lastError, release: () => URL.revokeObjectURL(url) };
}

/** The page cannot serve MEGA ranges to a <video> (no service worker) and the fallback is not allowed or too big. */
export class BridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BridgeError';
  }
}

/** The admin API's refusal to hand out a source, as a sentence. */
export function sourceRefusal(e: unknown): string | null {
  if (e instanceof AdminApiError && (e.code === 'mega-unusable' || e.code === 'not-found')) return e.message;
  return null;
}
