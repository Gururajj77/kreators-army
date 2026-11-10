import type { VideoListResponse } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { PUBLIC_COLUMNS, toPublicVideo, type PublicRow } from '../videoRows';

export const videos = new Hono<AppEnv>();

// Filtering happens in the browser: the catalogue is small, and it makes every filter instant and every filtered view a
// shareable address. Explicit columns, never SELECT *: no key or import id is read into the listing (V2-SPEC 2.10).
videos.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${PUBLIC_COLUMNS}
     FROM videos v LEFT JOIN posters p ON p.video_id = v.id
     WHERE v.published = 1 AND v.deleted_at IS NULL
     ORDER BY v.sort_order ASC, v.views DESC LIMIT 500`,
  ).all<PublicRow>();
  c.header('Cache-Control', 'public, max-age=60');
  return c.json<VideoListResponse>({ videos: await Promise.all(results.map(toPublicVideo)) });
});
