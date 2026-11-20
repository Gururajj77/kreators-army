// (r21) The public MEGA bridge, imported into the site's own service worker (vite.config.ts, workbox.importScripts). The admin has its own
// (admin-mega-sw.js, scope /admin) and this one never answers there.
//
// Why: MEGA's embed player streams with MediaSource, which iPhone Safari does not have; without it MEGA's play button opens the file on
// mega.nz (the website, or the MEGA app). On phones the player reads the file itself instead (apps/web/src/lib/megaPlay.ts): a <video>
// asks for GET /__mega/<token> with a Range, this worker hands the range to the page that holds the token (postMessage with a MessageChannel,
// message kind 'mega-play-range'), and the page fetches the bytes from MEGA, decrypts them with Web Crypto and sends them back in pieces.
// It holds no keys and fetches nothing itself. Every other request is left alone (no respondWith).
'use strict';

(() => {
  const PREFIX = '/__mega/';
  const ANSWER_MS = 60000;

  const fail = (status, text) => new Response(text, { status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });

  /** The pages that may own the token: the asking page first, then every other window of the site. */
  async function candidates(event) {
    const out = [];
    if (event.clientId) {
      const c = await self.clients.get(event.clientId);
      if (c) out.push(c);
    }
    for (const c of await self.clients.matchAll({ type: 'window' })) if (!out.some((x) => x.id === c.id)) out.push(c);
    return out;
  }

  /** Asks one page for the range; resolves with a Response, or null when that page does not hold the token. */
  function ask(client, token, range) {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      const port = channel.port1;
      let controller = null;
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          port.close();
          resolve(fail(504, 'The page did not answer.'));
        }
      }, ANSWER_MS);
      port.onmessage = (e) => {
        const m = e.data || {};
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          if (m.t === 'unknown') {
            port.close();
            resolve(null);
            return;
          }
          if (m.t !== 'head') {
            port.close();
            resolve(fail(502, m.message || 'The page could not read MEGA.'));
            return;
          }
          if (m.status < 200 || m.status >= 300) {
            port.close();
            resolve(new Response(m.text || null, { status: m.status, headers: m.headers }));
            return;
          }
          const body = new ReadableStream({
            start(c) {
              controller = c;
            },
            cancel() {
              try {
                port.postMessage({ t: 'cancel' });
              } catch (_) {
                /* the page is gone */
              }
              port.close();
            },
          });
          resolve(new Response(body, { status: m.status, headers: m.headers }));
          return;
        }
        if (!controller) return;
        try {
          if (m.t === 'data') controller.enqueue(new Uint8Array(m.buf));
          else if (m.t === 'end') {
            controller.close();
            port.close();
          } else if (m.t === 'error') {
            controller.error(new Error(m.message || 'MEGA read failed'));
            port.close();
          }
        } catch (_) {
          port.close();
        }
      };
      port.start();
      client.postMessage({ kx: 'mega-play-range', token, range }, [channel.port2]);
    });
  }

  async function answer(event, token) {
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return fail(404, 'Unknown source.');
    const range = event.request.headers.get('Range');
    for (const client of await candidates(event)) {
      const res = await ask(client, token, range);
      if (res) return res;
    }
    return fail(404, 'No open page holds this video. Reload the page.');
  }

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin || !url.pathname.startsWith(PREFIX) || event.request.method !== 'GET') return;
    const token = url.pathname.slice(PREFIX.length);
    if (token === 'ping') {
      event.respondWith(new Response(null, { status: 204, headers: { 'X-Kx-Mega': '1', 'Cache-Control': 'no-store' } }));
      return;
    }
    event.respondWith(answer(event, token));
  });
})();
