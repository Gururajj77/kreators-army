import type { ApiErrorBody } from '@kreators/shared';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import type { AppEnv, Env } from './env';
import { blockedPath, originAllowed, PAGE_HEADERS } from './headers';
import { serveMedia } from './media';
import { admin } from './routes/admin';
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

// If a browser says which page a write comes from, the page must be this site. No Origin (scripts, webhooks) passes.
app.use('*', async (c, next) => {
  if (c.req.method === 'GET' || c.req.method === 'HEAD' || c.req.method === 'OPTIONS') return next();
  const origin = c.req.header('Origin');
  if (origin && !originAllowed(origin, c.req.url, c.env.PUBLIC_URL)) return c.json<ApiErrorBody>({ error: 'forbidden', requestId: c.get('requestId') }, 403);
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

app.notFound((c) => c.json<ApiErrorBody>({ error: 'not found' }, 404));

app.onError((err, c) => {
  const requestId = c.get('requestId');
  if (err instanceof HTTPException) return c.json<ApiErrorBody>({ error: err.message, requestId }, err.status);
  if (err instanceof SyntaxError) return c.json<ApiErrorBody>({ error: 'that request was not valid JSON', requestId }, 400);
  console.error(requestId, err);
  // The answer never carries the error's text or a stack: only a plain line and the id to quote.
  return c.json<ApiErrorBody>({ error: 'something broke on our side', requestId }, 500);
});

function withPageHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(PAGE_HEADERS)) out.headers.set(k, v);
  return out;
}

/**
 * Everything the Worker sees. /api/* is the API. A path that holds nothing answers 404 and never the app shell.
 * Anything else that reached the Worker only because of a "run first" pattern is handed on to the static files.
 */
async function handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { pathname } = new URL(req.url);
  if (pathname === '/api' || pathname.startsWith('/api/')) return app.fetch(req, env, ctx);
  if (blockedPath(pathname) || !env.ASSETS) {
    return withPageHeaders(new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }));
  }
  if (pathname.startsWith('/media/')) return withPageHeaders(await serveMedia(req, env.ASSETS));
  return withPageHeaders(await env.ASSETS.fetch(req));
}

export default { fetch: handle };
