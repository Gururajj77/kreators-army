// (admin8) The admin's MEGA bridge, registered by the admin page only (apps/web/src/admin/mediaGen/megaSource.ts) with scope /admin.
// It answers one kind of request: GET /admin/__mega/<token> from an admin page, with the Range the <video> asked for. It holds no keys and
// fetches nothing: it hands the range to the page that registered the token (postMessage with a MessageChannel), and the page fetches the
// bytes from MEGA, decrypts them with Web Crypto and sends them back in pieces. The answer is same-origin, so <video> can seek and the canvas
// that makes posters and hover clips stays untainted. Every other request is left alone (no respondWith), so the network answers it.
'use strict';

const PREFIX = '/admin/__mega/';
const ANSWER_MS = 60000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
// A page in scope that is not controlled yet (a hard reload) asks to be claimed.
self.addEventListener('message', (event) => {
  if (event.data && event.data.kx === 'claim') event.waitUntil(self.clients.claim());
});

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

const fail = (status, text) => new Response(text, { status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });

/** The clients that may own the token: the asking page first, then every other admin window. */
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
        resolve(fail(504, 'The admin page did not answer.'));
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
          resolve(fail(502, m.message || 'The admin page could not read MEGA.'));
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
    client.postMessage({ kx: 'mega-range', token, range }, [channel.port2]);
  });
}

async function answer(event, token) {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return fail(404, 'Unknown source.');
  const range = event.request.headers.get('Range');
  for (const client of await candidates(event)) {
    const res = await ask(client, token, range);
    if (res) return res;
  }
  return fail(404, 'No admin page holds this source. Reload the admin.');
}
