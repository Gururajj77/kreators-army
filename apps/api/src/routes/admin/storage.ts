/**
 * (admin10) "Clear unused cache": stored things nothing on the site uses any more. Behind the same guard as every admin route
 * (index.ts); every answer is Cache-Control: no-store.
 *
 *   GET  /storage/unused   a dry run: what would go, group by group, with counts and bytes. Deletes nothing.
 *   POST /storage/clear    deletes exactly those groups in one D1 batch, evicts the edge copies (this location) of the removed
 *                          thumbnails and previews, and answers what was freed.
 *
 * The groups:
 *   binMedia     thumbnails and previews of videos in the Bin (restoring one shows it as missing, so the maker remakes it);
 *   orphanMedia  a thumbnail or preview whose video row is gone (the FK cascade should leave none; this catches any);
 *   megaChecks   link checks (mega_probes) that no video row points at, all older than an hour (a check in progress is kept);
 *   sessions     admin sign-ins past their 7 days or their 24 hours idle, never the one making this request;
 *   attempts     failed passkey tries older than the longest lockout window (a day), and successful ones older than the 30 days
 *                that make an address "known" (auth.ts limitState), so no limit changes because of this.
 * Never a videos row, a lead (complete or partial), a live video's media, or the current session.
 */
import type { StorageGroup, StorageGroupCount, StorageReport } from '@kreators/shared';
import { Hono, type Context } from 'hono';
import { IDLE_MS } from '../../auth';
import type { AppEnv } from '../../env';
import { evictPoster } from '../../posters';
import { evictPreview } from '../../previews';
import { origin, wrote } from './common';

export const storage = new Hono<AppEnv>();

const HOUR = 3600_000;
const DAY = 24 * HOUR;
/** A link check younger than this may belong to a link being typed or imported right now. */
export const PROBE_KEEP_MS = HOUR;
/** The longest window a failed try counts in (auth.ts: 20 a day). */
export const FAILED_KEEP_MS = DAY;
/** How long a successful unlock makes an address "known" (auth.ts limitState). */
export const OK_KEEP_MS = 30 * DAY;

/** Where each group lives, as one WHERE clause per table and its parameters. */
function where(c: Context<AppEnv>, now: number) {
  const sid = c.get('admin')?.sid ?? '';
  return {
    binPosters: { sql: 'video_id IN (SELECT id FROM videos WHERE deleted_at IS NOT NULL)', args: [] as unknown[] },
    binPreviews: { sql: 'video_id IN (SELECT id FROM videos WHERE deleted_at IS NOT NULL)', args: [] as unknown[] },
    orphanPosters: { sql: 'video_id NOT IN (SELECT id FROM videos)', args: [] as unknown[] },
    orphanPreviews: { sql: 'video_id NOT IN (SELECT id FROM videos)', args: [] as unknown[] },
    megaChecks: { sql: 'checked_at < ? AND handle NOT IN (SELECT mega_handle FROM videos WHERE mega_handle IS NOT NULL)', args: [now - PROBE_KEEP_MS] },
    sessions: { sql: '(expires_at <= ? OR seen_at < ?) AND id <> ?', args: [now, now - IDLE_MS, sid] },
    attempts: { sql: '(ok = 0 AND at < ?) OR (ok = 1 AND at < ?)', args: [now - FAILED_KEEP_MS, now - OK_KEEP_MS] },
  };
}

const PROBE_SIZE = "length(handle) + length(link) + coalesce(length(file_key), 0) + coalesce(length(name), 0) + coalesce(length(codec), 0) + coalesce(length(error), 0) + coalesce(length(meta), 0) + 64";

interface MediaRow {
  video_id: string;
  sha: string;
  mime: string;
  size: number;
}

function report(parts: { binPosters: MediaRow[]; binPreviews: MediaRow[]; orphanPosters: MediaRow[]; orphanPreviews: MediaRow[]; probes: { n: number; bytes: number }; sessions: number; attempts: number }): StorageReport {
  const media = (posters: MediaRow[], clips: MediaRow[]): StorageGroupCount => ({
    count: posters.length + clips.length,
    bytes: [...posters, ...clips].reduce((n, r) => n + (Number(r.size) || 0), 0),
    posters: posters.length,
    previews: clips.length,
  });
  const groups: Record<StorageGroup, StorageGroupCount> = {
    binMedia: { ...media(parts.binPosters, parts.binPreviews), videos: new Set([...parts.binPosters, ...parts.binPreviews].map((r) => r.video_id)).size },
    orphanMedia: media(parts.orphanPosters, parts.orphanPreviews),
    megaChecks: { count: parts.probes.n, bytes: parts.probes.bytes },
    sessions: { count: parts.sessions, bytes: null },
    attempts: { count: parts.attempts, bytes: null },
  };
  const total = Object.values(groups).reduce<{ count: number; bytes: number }>((t, g) => ({ count: t.count + g.count, bytes: t.bytes + (g.bytes ?? 0) }), { count: 0, bytes: 0 });
  return { groups, total };
}

storage.use('/storage/*', async (c, next) => {
  await next();
  c.res.headers.set('Cache-Control', 'no-store');
});

storage.get('/storage/unused', async (c) => {
  const db = c.env.DB;
  const w = where(c, Date.now());
  const [bp, bv, op, ov, pr, se, at] = await db.batch<Record<string, unknown>>([
    db.prepare(`SELECT video_id, sha, mime, length(bytes) AS size FROM posters WHERE ${w.binPosters.sql}`).bind(...w.binPosters.args),
    db.prepare(`SELECT video_id, sha, mime, size FROM video_previews WHERE ${w.binPreviews.sql}`).bind(...w.binPreviews.args),
    db.prepare(`SELECT video_id, sha, mime, length(bytes) AS size FROM posters WHERE ${w.orphanPosters.sql}`).bind(...w.orphanPosters.args),
    db.prepare(`SELECT video_id, sha, mime, size FROM video_previews WHERE ${w.orphanPreviews.sql}`).bind(...w.orphanPreviews.args),
    db.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(${PROBE_SIZE}), 0) AS bytes FROM mega_probes WHERE ${w.megaChecks.sql}`).bind(...w.megaChecks.args),
    db.prepare(`SELECT COUNT(*) AS n FROM admin_sessions WHERE ${w.sessions.sql}`).bind(...w.sessions.args),
    db.prepare(`SELECT COUNT(*) AS n FROM admin_attempts WHERE ${w.attempts.sql}`).bind(...w.attempts.args),
  ]);
  const rows = (r: D1Result<Record<string, unknown>> | undefined) => (r?.results ?? []) as unknown as MediaRow[];
  const one = (r: D1Result<Record<string, unknown>> | undefined) => (r?.results[0] ?? {}) as { n?: number; bytes?: number };
  return c.json<StorageReport>(
    report({
      binPosters: rows(bp),
      binPreviews: rows(bv),
      orphanPosters: rows(op),
      orphanPreviews: rows(ov),
      probes: { n: Number(one(pr).n ?? 0), bytes: Number(one(pr).bytes ?? 0) },
      sessions: Number(one(se).n ?? 0),
      attempts: Number(one(at).n ?? 0),
    }),
  );
});

storage.post('/storage/clear', async (c) => {
  const db = c.env.DB;
  const w = where(c, Date.now());
  // One batch (one transaction); RETURNING says exactly what went, so the edge keys and the report match what was deleted.
  const [bp, bv, op, ov, pr, se, at] = await db.batch<Record<string, unknown>>([
    db.prepare(`DELETE FROM posters WHERE ${w.binPosters.sql} RETURNING video_id, sha, mime, length(bytes) AS size`).bind(...w.binPosters.args),
    db.prepare(`DELETE FROM video_previews WHERE ${w.binPreviews.sql} RETURNING video_id, sha, mime, size`).bind(...w.binPreviews.args),
    db.prepare(`DELETE FROM posters WHERE ${w.orphanPosters.sql} RETURNING video_id, sha, mime, length(bytes) AS size`).bind(...w.orphanPosters.args),
    db.prepare(`DELETE FROM video_previews WHERE ${w.orphanPreviews.sql} RETURNING video_id, sha, mime, size`).bind(...w.orphanPreviews.args),
    db.prepare(`DELETE FROM mega_probes WHERE ${w.megaChecks.sql} RETURNING ${PROBE_SIZE} AS size`).bind(...w.megaChecks.args),
    db.prepare(`DELETE FROM admin_sessions WHERE ${w.sessions.sql} RETURNING 1 AS n`).bind(...w.sessions.args),
    db.prepare(`DELETE FROM admin_attempts WHERE ${w.attempts.sql} RETURNING 1 AS n`).bind(...w.attempts.args),
  ]);
  const rows = (r: D1Result<Record<string, unknown>> | undefined) => (r?.results ?? []) as unknown as MediaRow[];
  const probes = rows(pr) as unknown as { size: number }[];
  const out = report({
    binPosters: rows(bp),
    binPreviews: rows(bv),
    orphanPosters: rows(op),
    orphanPreviews: rows(ov),
    probes: { n: probes.length, bytes: probes.reduce((n, r) => n + (Number(r.size) || 0), 0) },
    sessions: rows(se).length,
    attempts: rows(at).length,
  });
  const o = origin(c);
  await Promise.all([
    ...[...rows(bp), ...rows(op)].map((r) => evictPoster(o, r.video_id, r.sha, r.mime)),
    ...[...rows(bv), ...rows(ov)].map((r) => evictPreview(o, r.video_id, r.sha, r.mime)),
  ]);
  if (out.groups.binMedia.count || out.groups.orphanMedia.count) wrote();
  return c.json<StorageReport>(out);
});
