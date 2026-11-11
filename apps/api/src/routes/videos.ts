import type { VideoListResponse } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { PUBLIC_COLUMNS, PUBLIC_FROM, toPublicVideo, type PublicRow } from '../videoRows';

export const videos = new Hono<AppEnv>();

// Filtering happens in the browser: the catalogue is small, and it makes every filter instant and every filtered view a
// shareable address. Explicit columns, never SELECT *: no key or import id is read into the listing (V2-SPEC 2.10).
const WHERE = 'WHERE v.published = 1 AND v.deleted_at IS NULL ORDER BY v.sort_order ASC, v.views DESC LIMIT 500';

videos.get('/', async (c) => {
  let results: PublicRow[];
  try {
    ({ results } = await c.env.DB.prepare(`SELECT ${PUBLIC_COLUMNS} ${PUBLIC_FROM} ${WHERE}`).all<PublicRow>());
  } catch (err) {
    // (pv) Deployed before migration 0008 reached this database: list without the clips rather than fail the whole library.
    if (!(err instanceof Error && /no such table: video_previews/.test(err.message))) throw err;
    const cols = PUBLIC_COLUMNS.replace(', pv.sha AS preview_sha, pv.mime AS preview_mime', '');
    ({ results } = await c.env.DB.prepare(`SELECT ${cols} FROM videos v LEFT JOIN posters p ON p.video_id = v.id ${WHERE}`).all<PublicRow>());
  }
  c.header('Cache-Control', 'public, max-age=60');
  return c.json<VideoListResponse>({ videos: await Promise.all(results.map((r) => toPublicVideo(r, c.env.MEGA_LINKS))) });
});
