/** M1 POST /api/admin/mega/inspect { link, refresh?, videoId? } -> MegaInspect (admin brief 4.4). MEGA's own problems are a 200 with ok: false. */
import type { MegaInspect } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, readJson } from '../../http';
import { inspect } from '../../mega/inspect';

export const mega = new Hono<AppEnv>();

mega.post('/mega/inspect', async (c) => {
  const body = await readJson<{ link?: unknown; refresh?: unknown; videoId?: unknown }>(c.req.raw);
  if (typeof body.link !== 'string' || !body.link.trim() || body.link.length > 4000) throw new HttpError(400, 'bad-request', 'Paste a MEGA link.', { field: 'link' });
  const out = await inspect(c.env, c.executionCtx, body.link, { refresh: body.refresh === true, videoId: typeof body.videoId === 'string' ? body.videoId : undefined });
  return c.json<MegaInspect>(out.inspect);
});
