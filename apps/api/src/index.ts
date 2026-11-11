import type { ApiErrorBody } from '@kreators/shared';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import type { AppEnv, Env } from './env';
import { blockedPath, NOINDEX, originAllowed, PAGE_HEADERS } from './headers';
import { errorBody, HttpError } from './http';
import { serveMedia } from './media';
import { servePoster } from './posters';
import { servePreview } from './previews';
import { admin } from './routes/admin/index';
import { contact } from './routes/contact';
import { health } from './routes/health';
import { videos } from './routes/videos';

const app = new Hono<AppEnv>().basePath('/api');

// No CORS: the app and its API are one origin. A short id on every request goes back in X-Request-Id and in the body of an error, so a report can be traced.
app.use('*', async (c, next) => {
  c.set('requestId', Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join(''));
  await next();
  c.res.headers.set('X-Request-Id', c.get('requestId'));
});

// If a browser says which page a write comes from, the page must be this site. No Origin (scripts, webhooks) passes here;
// the admin guard is stricter for cookie writes (an Origin is required).
app.use('*', async (c, next) => {
  if (c.req.method === 'GET' || c.req.method === 'HEAD' || c.req.method === 'OPTIONS') return next();
  const origin = c.req.header('Origin');
  if (origin && !originAllowed(origin, c.req.url, c.env.PUBLIC_URL)) return c.json({ error: 'forbidden', code: 'forbidden', requestId: c.get('requestId') }, 403);
  return next();
});

app.use('*', secureHeaders());

app.use('*', async (c, next) => {
  await next();
  if (!c.res.headers.has('Cache-Control')) c.res.headers.set('Cache-Control', 'no-store');
});

app.route('/health', health);
app.route('/videos', videos);
app.route('/contact', contact);
app.route('/admin', admin);

app.notFound((c) => c.json<ApiErrorBody>({ error: 'not found', requestId: c.get('requestId') }, 404));

app.onError((err, c) => {
  const requestId = c.get('requestId');
  if (err instanceof HttpError) return c.json(errorBody(c, err), err.status);
  if (err instanceof HTTPException) return c.json<ApiErrorBody>({ error: err.message, requestId }, err.status);
  if (err instanceof SyntaxError) return c.json<ApiErrorBody>({ error: 'that request was not valid JSON', requestId }, 400);
  // Never a request body, a link or a key in the log; the id is enough to trace it.
  console.error(requestId, err instanceof Error ? `${err.name}: ${err.message.replace(/https?:\/\/\S+/g, '<url>')}` : 'error');
  // The answer never carries the error's text or a stack: only a plain line and the id to quote.
  return c.json<ApiErrorBody>({ error: 'something broke on our side', requestId }, 500);
});

function withPageHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(PAGE_HEADERS)) out.headers.set(k, v);
  return out;
}

/**
 * The two old MEGA stream addresses, with any query (?v=, ?preview=, ?probe=). The site plays MEGA's own embed now and the admin decrypts in
 * the founder's browser, so the Worker never touches a MEGA video (a decrypted range ran past the free plan's 10 ms CPU and died as a 503).
 * 410 rather than 404: a page or player cached from before learns at once that the address is gone for good, and nothing is read for it
 * (no D1, no MEGA, no secret), so it costs next to no CPU. A day's cache keeps repeat asks off the Worker.
 */
function gone(): Response {
  return new Response('gone', { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
}

const STREAM = /^\/media\/v\/([A-Za-z0-9_-]{1,64})\.mp4$/;
const LEGACY = /^\/media\/mega-([A-Za-z0-9_-]{8})\.mp4$/;
const POSTER = /^\/media\/p\/([A-Za-z0-9_-]{1,64})\/([0-9a-f]{16})\.(webp|jpg|png)$/;
const PREVIEW = /^\/media\/pv\/([A-Za-z0-9_-]{1,64})\/([0-9a-f]{16})\.(mp4|webm)$/;

/**
 * Everything the Worker sees, in the order of V2-SPEC 2.3:
 *  1. /api, /api/*            the Hono app (admin router at /api/admin)
 *  2. a path that holds nothing   404, never the app shell
 *  3. /admin, /admin/*        the app shell, never indexed or stored
 *  4. /media/v/<id>.mp4       410 Gone: the Worker no longer streams MEGA (see gone())
 *  5. /media/mega-<h>.mp4     410 Gone, the same (the v1.5 address)
 *  6. /media/p/<id>/<sha>.<ext>   stored posters
 *  6b. /media/pv/<id>/<sha>.<ext>  stored hover previews (src/previews.ts)
 *  7. /media/*                bundled files with ranges
 *  8. anything else           static assets
 */
async function handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { pathname } = new URL(req.url);
  if (pathname === '/api' || pathname.startsWith('/api/')) return app.fetch(req, env, ctx);
  if (blockedPath(pathname) || !env.ASSETS) {
    return withPageHeaders(new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }));
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const shell = withPageHeaders(await env.ASSETS.fetch(req));
    shell.headers.set('X-Robots-Tag', NOINDEX);
    shell.headers.set('Cache-Control', 'no-store');
    return shell;
  }
  let m: RegExpExecArray | null;
  if (STREAM.test(pathname) || LEGACY.test(pathname)) return withPageHeaders(gone());
  if ((m = POSTER.exec(pathname))) return withPageHeaders(await servePoster(req, env, ctx, m[1]!, m[2]!, m[3]!));
  if ((m = PREVIEW.exec(pathname))) return withPageHeaders(await servePreview(req, env, ctx, m[1]!, m[2]!, m[3]!));
  if (pathname.startsWith('/media/')) return withPageHeaders(await serveMedia(req, env.ASSETS));
  return withPageHeaders(await env.ASSETS.fetch(req));
}

export default { fetch: handle };
