/**
 * The admin router, mounted at /api/admin (admin brief 1 and 4, V2-SPEC 2.6 to 2.9). Every answer carries
 * X-Robots-Tag: noindex, nofollow and keeps Cache-Control: no-store (set by the app for any answer without one).
 * Order: the session routes that sit outside the guard, the guard, then the rest. Within videos, /videos/order and
 * /videos/adopt-secret come before /videos/:id; within leads, /leads.csv before /leads/:id.
 */
import { Hono } from 'hono';
import { guard } from '../../auth';
import type { AppEnv } from '../../env';
import { errorBody, HttpError } from '../../http';
import { bulk } from './bulk';
import { imports } from './import';
import { leads } from './leads';
import { mega } from './mega';
import { previews } from './previews';
import { session } from './session';
import { storage } from './storage';
import { videos } from './videos';

export const admin = new Hono<AppEnv>();

admin.use('*', async (c, next) => {
  await next();
  c.res.headers.set('X-Robots-Tag', 'noindex, nofollow');
});

admin.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  // POST (unlock) and DELETE (lock) of /session are the only routes outside the guard.
  if (path === '/api/admin/session' && (c.req.method === 'POST' || c.req.method === 'DELETE')) return next();
  return guard(c, next);
});

admin.onError((err, c) => {
  if (err instanceof HttpError) {
    for (const [k, v] of Object.entries(err.headers)) c.header(k, v);
    return c.json(errorBody(c, err), err.status);
  }
  const requestId = c.get('requestId');
  // Never the error's text in the answer, and never a body, link or key in the log: the id is enough to trace it.
  console.error(requestId, err instanceof Error ? `${err.name}: ${err.message.replace(/https?:\/\/\S+/g, '<url>')}` : 'error');
  return c.json({ error: 'Something broke on our side.', requestId }, 500);
});

admin.route('/', session);
admin.route('/', bulk);
admin.route('/', videos);
admin.route('/', previews);
admin.route('/', mega);
admin.route('/', imports);
admin.route('/', leads);
admin.route('/', storage);

admin.notFound((c) => c.json({ error: 'not found', code: 'not-found', requestId: c.get('requestId') }, 404));
