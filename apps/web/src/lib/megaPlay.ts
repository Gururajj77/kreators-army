// (r21) MEGA videos played by the site itself, on every device.
//
// The problem: the player puts MEGA's own embed (mega.nz/embed/...) in an iframe. MEGA's embed streams with MediaSource, and iPhone Safari
// has none (Apple ships only ManagedMediaSource on iPhone). MEGA's player then leaves its play button on its default action, which opens the
// file on mega.nz in a new tab: the MEGA website, or the MEGA app when it is installed. On Android it streams, but its links still lead out.
//
// On desktops MEGA's embed streams, but Safari and Firefox stop on its big play button: a second press after the one on the tile.
//
// The fix: on every device (phones first, desktops since the one-press change) the page reads the file itself, as the admin does
// (lib/mega.ts: MEGA's 'g' command, ranged fetches from MEGA's storage, AES-CTR in Web Crypto), and plays it in the site's own <video>:
// - With the site's service worker in control (public/mega-bridge-sw.js imported into it), the <video> plays /__mega/<token>: the worker hands
//   each Range to this page, which answers it from MEGA (lib/megaBridge.ts). It starts in about a second and seeks like any file; only the
//   ranges watched are downloaded. The token is random and maps to the key held in this page, so no key is in a URL or reaches the server.
// - Without one (an in-app browser such as Instagram's, some private windows), the whole file is downloaded, decrypted and played from a
//   blob: URL, with progress (BLOB_MAX at most; the library's reels are about 10 to 30 MB).
// - If both fail, or bytes stop arriving before there is a picture, the player falls back to MEGA's embed (the old behaviour). A slow
//   download is never abandoned: on an iPhone MEGA's embed cannot play at all.
// The MEGA code is loaded only when a MEGA video is opened. The <video> is the player's shared element (lib/playerVideo.ts), unlocked by the
// press that opened the player, so it starts with sound by itself.
import { MEGA_EMBED_RE } from '@kreators/shared';
import type { MegaError, MegaFile } from './mega';

const VIRTUAL = '/__mega/';
/** The biggest file the no-worker fallback downloads whole and holds in memory (the library's reels are about 10 to 30 MB; a 4K master can be
 *  150 MB, too much for a phone to fetch before it plays). Bigger files go to MEGA's embed. */
const BLOB_MAX = 80 * 1024 * 1024;
/** How long to wait for the site's worker to take control of a fresh page before using the fallback. */
const CONTROL_MS = 2500;
/** (r21) A MEGA request with nothing arriving for this long is ended and retried (lib/mega.ts watchdog): neither iPhone Safari nor Chrome ever
 *  times a fetch out, so a silent connection would leave the spinner up for good. Under the player's 15 s stall check, so a retry can land first. */
const IDLE_MS = 10000;

/** (r21) Every browser plays MEGA itself: phones (no MediaSource on an iPhone, so MEGA's embed cannot stream) and desktops (MEGA's embed asks for
 *  a second press on Safari and Firefox). Only a page with no window (never the case in the browser) does not. */
export function playsMegaInPage(): boolean {
  return typeof window !== 'undefined';
}

export interface MegaPlayback {
  url: string;
  mode: 'sw' | 'blob';
  /** The latest MEGA failure, if any (a <video> error says nothing more than "error"). */
  why(): MegaError | null;
  /** Bytes received from MEGA so far, counted as they arrive (r21): still growing means slow, not broken. */
  fetched(): number;
  /** (r22) The share of the file (0 to 1) ready in one run from the share `from` (what the player has reached): all of it for a blob. */
  readyAhead(from: number): number;
  release(): void;
}

const sources = new Map<string, MegaFile>();
let bridge: Promise<boolean> | null = null;
let listening = false;

/** ?megabridge=blob forces the fallback (the harness tests it). */
const forcedBlob = () => new URLSearchParams(location.search).get('megabridge') === 'blob';

function listen() {
  if (listening) return;
  listening = true;
  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    const d = e.data as { kx?: string; token?: string; range?: string | null } | null;
    if (!d || d.kx !== 'mega-play-range' || !e.ports[0]) return;
    void import('./megaBridge').then(({ serveRange }) => serveRange(e.ports[0]!, sources.get(String(d.token ?? '')), d.range ?? null));
  });
  navigator.serviceWorker.startMessages();
}

/** Waits (briefly) for the site's worker to control this page, then checks that it is a version with the bridge. */
function ensureBridge(): Promise<boolean> {
  bridge ??= (async () => {
    if (forcedBlob() || !('serviceWorker' in navigator) || !window.isSecureContext) return false;
    try {
      listen();
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          const t = window.setTimeout(done, CONTROL_MS);
          function done() {
            window.clearTimeout(t);
            navigator.serviceWorker.removeEventListener('controllerchange', done);
            resolve();
          }
          navigator.serviceWorker.addEventListener('controllerchange', done);
        });
      }
      if (!navigator.serviceWorker.controller) return false;
      // A worker from an earlier deploy (no bridge yet) lets this through to the network, which does not answer 204 with the mark.
      const ping = await fetch(`${VIRTUAL}ping`, { cache: 'no-store' });
      return ping.status === 204 && ping.headers.get('X-Kx-Mega') === '1';
    } catch {
      return false;
    }
  })();
  // A "no" is not kept: the worker may take control later in the visit (the first visit installs it).
  void bridge.then((ok) => {
    if (!ok) bridge = null;
  });
  return bridge;
}

/**
 * Opens one MEGA embed link for the site's own <video>. Asks MEGA for the file first ('g'), so a removed file, a wrong key or the transfer
 * limit fail here (a MegaError) rather than as a silent <video> error. Throws when the link is not a MEGA file link, or when there is no
 * worker and the file is too big to download whole (kind 'no-bridge').
 */
export async function openMega(embedUrl: string, opts: { signal?: AbortSignal; onProgress?: (done: number, total: number) => void } = {}): Promise<MegaPlayback> {
  const m = /^https:\/\/mega\.nz\/embed\/([A-Za-z0-9_-]{8})#([A-Za-z0-9_-]{43})$/.exec(embedUrl);
  if (!MEGA_EMBED_RE.test(embedUrl) || !m) throw new Error('not a MEGA file link');
  const { MegaFile } = await import('./mega');
  // Four connections at once and 8 MB read ahead: MEGA's free downloads are slow per connection, about three times faster over four.
  const file = new MegaFile({ kind: 'file', handle: m[1]!, key: m[2]!, size: null }, { parallel: 4, ahead: 8, idleMs: IDLE_MS });
  const [info, viaWorker] = await Promise.all([file.info(opts.signal), ensureBridge()]);
  if (viaWorker) {
    const { newToken } = await import('./megaBridge');
    const token = newToken();
    sources.set(token, file);
    return {
      url: `${VIRTUAL}${token}`,
      mode: 'sw',
      why: () => file.lastError,
      fetched: () => file.received,
      readyAhead: (from) => file.readyFrom(Math.floor(Math.min(1, Math.max(0, from)) * info.size)) / info.size,
      release: () => {
        sources.delete(token);
        file.dispose();
      },
    };
  }
  // (r21) 'no-bridge': the page's state, not the video's (the worker may control the page by the next open), so the player does not keep it.
  if (info.size > BLOB_MAX) throw Object.assign(new Error('too big to download whole'), { kind: 'no-bridge' });
  const blob = await file.whole(opts.signal, opts.onProgress);
  const url = URL.createObjectURL(blob);
  return { url, mode: 'blob', why: () => file.lastError, fetched: () => file.received, readyAhead: (from) => 1 - from, release: () => URL.revokeObjectURL(url) };
}
