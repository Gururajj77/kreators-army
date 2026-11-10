import { APP_NAME, type ApiErrorBody, type HealthResponse } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';

export const health = new Hono<AppEnv>();

// Reads a table from the first migration, so a 200 means the Worker, the D1 binding and the migrations are all in place.
health.get('/', async (c) => {
  const requestId = c.get('requestId');
  try {
    await c.env.DB.prepare('SELECT 1 FROM app_meta LIMIT 1').first();
    return c.json<HealthResponse>({ ok: true, app: APP_NAME });
  } catch (err) {
    console.error(requestId, err);
    return c.json<ApiErrorBody>({ error: 'database not ready', requestId }, 503);
  }
});
