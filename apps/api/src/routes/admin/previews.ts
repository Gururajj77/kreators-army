/**
 * (pv) Hover previews and automatic posters, written by the admin's "Thumbnails & previews" pass (apps/web/src/admin/mediaGen).
 * Behind the same guard as every admin route (index.ts): a cookie session with Origin and Sec-Fetch-Site checks for writes, or
 * the Bearer key; the body type is checked there too (contentTypeOk: video/mp4 or video/webm here, an image for auto-poster).
 *
 *   PUT    /videos/:id/preview        raw MP4 or WebM, at most 600 KiB, sniffed by magic bytes; X-Preview-Width, -Height,
 *                                     -Duration-Ms, -Start-Ms. Answers { preview, video }.
 *   DELETE /videos/:id/preview        204.
 *   PUT    /videos/:id/auto-poster    an image like PUT /poster, stored with auto = 1. A poster set by hand is kept (kept: true)
 *                                     unless ?replace=1. Answers { kept, poster, video }.
 */
import type { AdminPoster, AdminPreview, AdminVideo } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, LIMITS, readBody } from '../../http';
import { evictPoster, posterSha, sniffImage } from '../../posters';
import { clipSha, evictPreview, PREVIEW_MAX, sniffClip } from '../../previews';
import { loadVideo, mustLoad, NOW_SQL, origin, wrote } from './common';

export const previews = new Hono<AppEnv>();

/** A whole-number header within [min, max], else null. */
function intHeader(value: string | undefined, min: number, max: number): number | null {
  if (value === undefined || !/^\d{1,9}$/.test(value)) return null;
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

previews.put('/videos/:id/preview', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  await mustLoad(db, id);
  const bytes = await readBody(c.req.raw, PREVIEW_MAX);
  if (!bytes.length) throw new HttpError(400, 'bad-request', 'Send the clip.');
  const mime = sniffClip(bytes);
  if (!mime) throw new HttpError(415, 'unsupported-type', 'Send an MP4 or WebM clip.');
  const old = await db.prepare('SELECT sha, mime FROM video_previews WHERE video_id = ?').bind(id).first<{ sha: string; mime: string }>();
  const sha = await clipSha(bytes);
  await db.batch([
    db
      .prepare(
        `INSERT INTO video_previews (video_id, sha, mime, size, width, height, duration_ms, start_ms, bytes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(video_id) DO UPDATE SET sha = excluded.sha, mime = excluded.mime, size = excluded.size, width = excluded.width,
           height = excluded.height, duration_ms = excluded.duration_ms, start_ms = excluded.start_ms, made_at = datetime('now'), bytes = excluded.bytes`,
      )
      .bind(
        id,
        sha,
        mime,
        bytes.length,
        intHeader(c.req.header('X-Preview-Width'), 1, 4096),
        intHeader(c.req.header('X-Preview-Height'), 1, 4096),
        intHeader(c.req.header('X-Preview-Duration-Ms'), 1, 60000),
        intHeader(c.req.header('X-Preview-Start-Ms'), 0, 1e9),
        bytes,
      ),
    // (pvv) No updated_at bump: it is the edit drawer's and the bulk route's 409 guard, and this write comes from the background pass,
    // so bumping it made the admin's own next save in the drawer (or another tab) fail as "changed in another tab".
  ]);
  if (old && old.sha !== sha) await evictPreview(origin(c), id, old.sha, old.mime);
  wrote();
  const video = (await loadVideo(db, id))!;
  return c.json<{ preview: AdminPreview; video: AdminVideo }>({ preview: video.preview!, video });
});

previews.delete('/videos/:id/preview', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  await mustLoad(db, id);
  const old = await db.prepare('SELECT sha, mime FROM video_previews WHERE video_id = ?').bind(id).first<{ sha: string; mime: string }>();
  if (old) {
    await db.batch([db.prepare('DELETE FROM video_previews WHERE video_id = ?').bind(id), db.prepare(`UPDATE videos SET updated_at = ${NOW_SQL} WHERE id = ?`).bind(id)]);
    await evictPreview(origin(c), id, old.sha, old.mime);
    wrote();
  }
  return c.body(null, 204);
});

previews.put('/videos/:id/auto-poster', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const row = await mustLoad(db, id);
  const replace = c.req.query('replace') === '1';
  const bytes = await readBody(c.req.raw, LIMITS.poster);
  if (!bytes.length) throw new HttpError(400, 'bad-request', 'Send the image.');
  const mime = sniffImage(bytes);
  if (!mime) throw new HttpError(415, 'unsupported-type', 'Use a JPEG, PNG or WebP image.');
  const current = await db.prepare('SELECT auto FROM posters WHERE video_id = ?').bind(id).first<{ auto: number }>();
  // A poster the admin chose (or any poster that predates this pass, or a v1 poster address) stays unless asked.
  const handSet = (current && current.auto !== 1) || (!current && !!row.poster_url);
  if (handSet && !replace) {
    const video = (await loadVideo(db, id))!;
    return c.json<{ kept: true; poster: AdminPoster | null; video: AdminVideo }>({ kept: true, poster: video.poster, video });
  }
  const dim = (h: string) => intHeader(c.req.header(h), 1, 4096);
  const timeMs = intHeader(c.req.header('X-Poster-Time-Ms'), 0, 1e9);
  const sha = await posterSha(bytes);
  // Delete and insert rather than upsert: the posters_set_by_hand trigger (0008) only sees updates, which are the hand-set path.
  await db.batch([
    db.prepare('DELETE FROM posters WHERE video_id = ?').bind(id),
    db.prepare('INSERT INTO posters (video_id, sha, mime, width, height, time_ms, bytes, auto) VALUES (?, ?, ?, ?, ?, ?, ?, 1)').bind(id, sha, mime, dim('X-Poster-Width'), dim('X-Poster-Height'), timeMs, bytes),
    // (pvv) No updated_at bump, as for the clip above.
  ]);
  if (row.poster_sha && row.poster_sha !== sha) await evictPoster(origin(c), id, row.poster_sha, row.poster_mime);
  wrote();
  const video = (await loadVideo(db, id))!;
  return c.json<{ kept: false; poster: AdminPoster; video: AdminVideo }>({ kept: false, poster: video.poster!, video });
});
