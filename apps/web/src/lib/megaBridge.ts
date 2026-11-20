// (r21) The page's half of a MEGA bridge, shared by the admin (admin/mediaGen/megaSource.ts, worker public/admin-mega-sw.js, scope /admin)
// and the public player (lib/megaPlay.ts, worker public/mega-bridge-sw.js imported into the site's own worker). A <video> asks its worker for
// a same-origin address with a Range; the worker hands the range to the page that holds the token (a MessageChannel port); this answers it:
// a head (status and headers) once the first piece is decrypted, then the pieces, then 'end'. The key never leaves the page.
import { CHUNK, MAX_CHUNKS, MEGA_SAYS, MegaError, type MegaFile, parseRange } from './mega';

type Msg = { t: 'unknown' } | { t: 'head'; status: number; headers: Record<string, string>; text?: string } | { t: 'data'; buf: ArrayBuffer } | { t: 'end' } | { t: 'error'; message: string };

/** A random token for one open source: the only thing the worker and the URL ever see. */
export function newToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Answers one range on `port` from `file` ('unknown' when this page does not hold the token). */
export async function serveRange(port: MessagePort, file: MegaFile | undefined, rangeHeader: string | null): Promise<void> {
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
