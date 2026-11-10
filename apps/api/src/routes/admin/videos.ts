/**
 * Admin videos (admin brief 4.3 V1 to V12 with V2-SPEC 2.7). Registered so /videos/order and /videos/adopt-secret come
 * before /videos/:id. Every write ends with forgetRows().
 */
import { megaStreamHandle, parseMegaLink, type AdminPoster, type AdminVideo, type AdminVideoList, type MegaInspect, type ParsedMegaLink, type SaveWarning, type VideoSaved } from '@kreators/shared';
import { Hono, type Context } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, LIMITS, readBody, readJson } from '../../http';
import { gradeWarning, inspect, inspectParsed, megaColumns, NO_MEGA, sqlTime, UNUSABLE, type MegaColumns } from '../../mega/inspect';
import { keyFromSecret } from '../../mega/lookup';
import { evictPoster, posterSha, sniffImage } from '../../posters';
import { ADMIN_COLUMNS, ADMIN_FROM, megaMetaFromRow, toAdminVideo, type VideoRow } from '../../videoRows';
import { blockingProblems, cannotPublish, isCheckError, isUniqueError, loadVideo, mustLoad, NOW_SQL, origin, parseWrite, socialWarnings, updateStatement, wrote, type PlainColumns } from './common';

export const videos = new Hono<AppEnv>();

const BIN_DAYS = 30;

/** Inspects a link for a save and returns its mega_* columns, or throws 422 mega-unusable. Reuses a fresh check. */
async function megaForSave(c: Context<AppEnv>, link: Exclude<ParsedMegaLink, { kind: 'folder' }>, videoId?: string): Promise<{ cols: MegaColumns; inspect: MegaInspect }> {
  const out = await inspectParsed(c.env, c.executionCtx, link, { videoId });
  const ins = out.inspect;
  if (!ins.ok && UNUSABLE.has(ins.problem)) throw new HttpError(422, 'mega-unusable', ins.message, { field: 'mega', megaProblem: ins.problem });
  return { cols: megaColumns(link, out.probe), inspect: ins };
}

async function duplicateOf(db: D1Database, handle: string, id: string): Promise<void> {
  const dup = await db.prepare('SELECT id, title, deleted_at FROM videos WHERE mega_handle = ? AND id <> ?').bind(handle, id).first<{ id: string; title: string; deleted_at: string | null }>();
  if (dup) throw new HttpError(409, 'duplicate', dup.deleted_at ? `In the bin: ${dup.title}` : `Already in the library: ${dup.title}`, { existingId: dup.id, inBin: !!dup.deleted_at, field: 'mega' });
}

function warningsFor(row: VideoRow, ins: MegaInspect | null): SaveWarning[] {
  const out: SaveWarning[] = [];
  if (ins?.ok) out.push(...ins.warnings);
  else if (row.mega_handle) {
    const meta = megaMetaFromRow(row);
    if (row.mega_error && !meta) out.push({ code: row.mega_error, message: "Couldn't reach MEGA. Check again" });
  }
  const g = gradeWarning(row.mega_handle ? megaMetaFromRow(row) : null);
  if (g) out.push(g);
  if (!row.mega_handle && (row.youtube_url || row.wave_ref) && !row.file_ref) out.push({ code: 'no-mega', message: 'This entry plays the YouTube embed. Add a MEGA link to stream it from the site.' });
  return out;
}

/** The row as it would be after these columns (for the publish check before writing). */
function merged(base: VideoRow, plain: PlainColumns, mega: MegaColumns | null): VideoRow {
  return { ...base, ...(plain as Partial<VideoRow>), ...(mega ? (mega as unknown as Partial<VideoRow>) : {}) } as VideoRow;
}

// ---------------------------------------------------------------- V1 list

videos.get('/videos', async (c) => {
  const db = c.env.DB;
  const bin = c.req.query('bin') === '1';
  // The bin keeps a video for 30 days; its poster goes with it (FK cascade).
  c.executionCtx.waitUntil(db.prepare(`DELETE FROM videos WHERE deleted_at IS NOT NULL AND deleted_at < datetime('now', '-${BIN_DAYS} days')`).run().catch(() => undefined));
  const where = bin ? 'WHERE v.deleted_at IS NOT NULL ORDER BY v.deleted_at DESC' : 'WHERE v.deleted_at IS NULL ORDER BY v.sort_order ASC, v.views DESC';
  const [list, counts] = await db.batch<VideoRow | { legacy: number; bin: number }>([
    db.prepare(`SELECT ${ADMIN_COLUMNS} ${ADMIN_FROM} ${where} LIMIT 2000`),
    db.prepare('SELECT SUM(CASE WHEN mega_handle IS NOT NULL AND mega_url IS NULL AND deleted_at IS NULL THEN 1 ELSE 0 END) AS legacy, SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) AS bin FROM videos'),
  ]);
  const n = (counts!.results[0] ?? { legacy: 0, bin: 0 }) as { legacy: number | null; bin: number | null };
  return c.json<AdminVideoList>({ videos: await Promise.all((list!.results as VideoRow[]).map(toAdminVideo)), legacySecretCount: n.legacy ?? 0, binCount: n.bin ?? 0 });
});

// ---------------------------------------------------------------- V8 order (before /videos/:id)

videos.put('/videos/order', async (c) => {
  const db = c.env.DB;
  const body = await readJson<{ ids?: unknown }>(c.req.raw);
  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length > 1000 || !ids.every((x) => typeof x === 'string')) throw new HttpError(400, 'bad-request', 'ids must be a list of at most 1000 video ids.', { field: 'ids' });
  const { results } = await db.prepare('SELECT id, sort_order FROM videos WHERE deleted_at IS NULL ORDER BY sort_order ASC, views DESC').all<{ id: string; sort_order: number }>();
  const current = new Map(results.map((r) => [r.id, r.sort_order]));
  const same = ids.length === current.size && new Set(ids).size === ids.length && (ids as string[]).every((id) => current.has(id));
  if (!same) throw new HttpError(409, 'order-stale', 'The list changed in another tab.', { order: results.map((r) => ({ id: r.id, sortOrder: r.sort_order })) });
  const stmts = (ids as string[])
    .map((id, i) => ({ id, to: (i + 1) * 10 }))
    .filter((x) => current.get(x.id) !== x.to)
    .map((x) => db.prepare(`UPDATE videos SET sort_order = ?, updated_at = ${NOW_SQL} WHERE id = ? AND deleted_at IS NULL`).bind(x.to, x.id));
  if (stmts.length) await db.batch(stmts);
  wrote();
  return c.json({ order: (ids as string[]).map((id, i) => ({ id, sortOrder: (i + 1) * 10 })) });
});

// ---------------------------------------------------------------- V12 adopt the legacy secret (before /videos/:id)

videos.post('/videos/adopt-secret', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare('SELECT id, mega_handle FROM videos WHERE mega_handle IS NOT NULL AND mega_url IS NULL').all<{ id: string; mega_handle: string }>();
  const adopted: AdminVideo[] = [];
  const missing: string[] = [];
  for (const row of results) {
    const key = keyFromSecret(row.mega_handle, c.env.MEGA_LINKS);
    if (!key) {
      missing.push(row.mega_handle);
      continue;
    }
    const link = { kind: 'file' as const, handle: row.mega_handle, key43: key };
    const out = await inspectParsed(c.env, c.executionCtx, link, { videoId: row.id });
    const cols = megaColumns(link, out.probe);
    await updateStatement(db, row.id, { ...cols }).run();
    adopted.push((await loadVideo(db, row.id))!);
  }
  wrote();
  return c.json({ adopted, missing });
});

// ---------------------------------------------------------------- V2 one

videos.get('/videos/:id', async (c) => {
  const video = await loadVideo(c.env.DB, c.req.param('id'));
  if (!video) throw new HttpError(404, 'not-found', 'No video with that id.');
  return c.json({ video });
});

// ---------------------------------------------------------------- V3 create

videos.post('/videos', async (c) => {
  const db = c.env.DB;
  const write = parseWrite(await readJson(c.req.raw), { create: true });
  const id = crypto.randomUUID();
  let mega: MegaColumns | null = null;
  let ins: MegaInspect | null = null;
  if (write.mega) {
    await duplicateOf(db, megaStreamHandle(write.mega)!, id);
    ({ cols: mega, inspect: ins } = await megaForSave(c, write.mega as Exclude<ParsedMegaLink, { kind: 'folder' }>));
  }
  const top = await db.prepare('SELECT MIN(sort_order) AS m FROM videos').first<{ m: number | null }>();
  const plain: PlainColumns = { brand: '', aspect: 'vertical', views: 0, featured: 0, published: 0, sort_order: (top?.m ?? 10) - 10, ...write.columns };
  if (ins?.ok && write.columns.aspect === undefined && ins.suggestedAspect) plain.aspect = ins.suggestedAspect;
  const base = { id, title: '', brand: '', category: null, platform: null, file_ref: null, wave_ref: null, instagram_url: null, youtube_url: null, poster_url: null, poster_sha: null, poster_mime: null, deleted_at: null, ...NO_MEGA } as unknown as VideoRow;
  const next = merged(base, plain, mega);
  if (next.published === 1) {
    const problems = blockingProblems(next);
    if (problems.length) throw cannotPublish(problems);
  }
  const cols: Record<string, unknown> = { id, ...plain, ...(mega ?? {}) };
  const names = Object.keys(cols);
  try {
    await db.prepare(`INSERT INTO videos (${names.join(', ')}, updated_at) VALUES (${names.map(() => '?').join(', ')}, ${NOW_SQL})`).bind(...names.map((n) => cols[n])).run();
  } catch (err) {
    if (isUniqueError(err)) await duplicateOf(db, next.mega_handle!, id);
    if (isCheckError(err)) throw new HttpError(400, 'bad-request', 'That combination is not allowed.');
    throw err;
  }
  wrote();
  const row = await mustLoad(db, id);
  return c.json<VideoSaved>({ video: await toAdminVideo(row), warnings: [...warningsFor(row, ins), ...(await socialWarnings(db, id, row))] }, 201);
});

// ---------------------------------------------------------------- V4 update

videos.patch('/videos/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const write = parseWrite(await readJson(c.req.raw), { create: false });
  const row = await mustLoad(db, id);
  if (write.expectUpdatedAt && write.expectUpdatedAt !== row.updated_at) throw new HttpError(409, 'stale', 'This video changed in another tab.', { video: await toAdminVideo(row) });
  if (row.deleted_at && write.columns.published === 1) throw new HttpError(400, 'bad-request', 'Restore the video from the bin first.', { field: 'published' });

  let mega: MegaColumns | null = null;
  let ins: MegaInspect | null = null;
  if (write.mega === null) mega = { ...NO_MEGA };
  else if (write.mega) {
    const handle = megaStreamHandle(write.mega)!;
    await duplicateOf(db, handle, id);
    ({ cols: mega, inspect: ins } = await megaForSave(c, write.mega as Exclude<ParsedMegaLink, { kind: 'folder' }>, id));
  }
  const next = merged(row, write.columns, mega);
  if (next.published === 1 && !next.deleted_at) {
    const problems = blockingProblems(next);
    if (problems.length) throw cannotPublish(problems);
  }
  const cols: Record<string, unknown> = { ...write.columns, ...(mega ?? {}) };
  if (Object.keys(cols).length) {
    let changes = 0;
    try {
      changes = (await updateStatement(db, id, cols, write.expectUpdatedAt).run()).meta.changes;
    } catch (err) {
      if (isUniqueError(err)) await duplicateOf(db, next.mega_handle!, id);
      if (isCheckError(err)) throw new HttpError(400, 'bad-request', 'That combination is not allowed.');
      throw err;
    }
    if (!changes) throw new HttpError(409, 'stale', 'This video changed in another tab.', { video: (await loadVideo(db, id)) ?? undefined });
  }
  // Unpublished: its poster must not stay in this location's edge cache.
  if (row.published === 1 && next.published !== 1) await evictPoster(origin(c), id, row.poster_sha, row.poster_mime);
  wrote();
  const after = await mustLoad(db, id);
  return c.json<VideoSaved>({ video: await toAdminVideo(after), warnings: [...warningsFor(after, ins), ...(await socialWarnings(db, id, after))] });
});

// ---------------------------------------------------------------- V5 bin, V7 purge

videos.delete('/videos/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const row = await mustLoad(db, id);
  if (c.req.query('purge') === '1') {
    if (!row.deleted_at) throw new HttpError(409, 'not-in-bin', 'Only a video in the bin can be deleted for good.');
    await db.prepare('DELETE FROM videos WHERE id = ? AND deleted_at IS NOT NULL').bind(id).run();
    await evictPoster(origin(c), id, row.poster_sha, row.poster_mime);
    wrote();
    return c.body(null, 204);
  }
  if (!row.deleted_at) await db.prepare(`UPDATE videos SET published = 0, deleted_at = datetime('now'), updated_at = ${NOW_SQL} WHERE id = ?`).bind(id).run();
  await evictPoster(origin(c), id, row.poster_sha, row.poster_mime);
  wrote();
  return c.json({ video: await loadVideo(db, id) });
});

// ---------------------------------------------------------------- V6 restore

videos.post('/videos/:id/restore', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = await readJson<{ published?: unknown }>(c.req.raw);
  if (body.published !== undefined && typeof body.published !== 'boolean') throw new HttpError(400, 'bad-request', 'published must be true or false.', { field: 'published' });
  const row = await mustLoad(db, id);
  const publish = body.published === true;
  if (publish) {
    const problems = blockingProblems({ ...row, deleted_at: null, published: 1 });
    if (problems.length) throw cannotPublish(problems);
  }
  await db.prepare(`UPDATE videos SET deleted_at = NULL, published = ?, updated_at = ${NOW_SQL} WHERE id = ?`).bind(publish ? 1 : 0, id).run();
  wrote();
  return c.json({ video: await loadVideo(db, id) });
});

// ---------------------------------------------------------------- V9 / V10 poster

videos.put('/videos/:id/poster', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const row = await mustLoad(db, id);
  const bytes = await readBody(c.req.raw, LIMITS.poster);
  if (!bytes.length) throw new HttpError(400, 'bad-request', 'Send the image.');
  const mime = sniffImage(bytes);
  if (!mime) throw new HttpError(415, 'unsupported-type', 'Use a JPEG, PNG or WebP image.');
  const dim = (h: string) => {
    const v = c.req.header(h);
    if (v === undefined) return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 4096 ? n : null;
  };
  const tRaw = c.req.header('X-Poster-Time-Ms');
  const timeMs = tRaw !== undefined && /^\d{1,9}$/.test(tRaw) ? Number(tRaw) : null;
  const sha = await posterSha(bytes);
  await db.batch([
    db
      .prepare(
        `INSERT INTO posters (video_id, sha, mime, width, height, time_ms, bytes) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(video_id) DO UPDATE SET sha = excluded.sha, mime = excluded.mime, width = excluded.width, height = excluded.height,
           time_ms = excluded.time_ms, created_at = datetime('now'), bytes = excluded.bytes`,
      )
      .bind(id, sha, mime, dim('X-Poster-Width'), dim('X-Poster-Height'), timeMs, bytes),
    db.prepare(`UPDATE videos SET updated_at = ${NOW_SQL} WHERE id = ?`).bind(id),
  ]);
  if (row.poster_sha && row.poster_sha !== sha) await evictPoster(origin(c), id, row.poster_sha, row.poster_mime);
  wrote();
  const video = (await loadVideo(db, id))!;
  return c.json<{ poster: AdminPoster; video: AdminVideo }>({ poster: video.poster!, video });
});

videos.delete('/videos/:id/poster', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const row = await mustLoad(db, id);
  await db.batch([db.prepare('DELETE FROM posters WHERE video_id = ?').bind(id), db.prepare(`UPDATE videos SET updated_at = ${NOW_SQL} WHERE id = ?`).bind(id)]);
  await evictPoster(origin(c), id, row.poster_sha, row.poster_mime);
  wrote();
  return c.body(null, 204);
});

// ---------------------------------------------------------------- V11 check the stored link again

videos.post('/videos/:id/mega-check', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const row = await mustLoad(db, id);
  if (!row.mega_handle) throw new HttpError(400, 'bad-request', 'This video has no MEGA link.', { field: 'mega' });
  const link = row.mega_url ?? (keyFromSecret(row.mega_handle, c.env.MEGA_LINKS) ? `https://mega.nz/file/${row.mega_handle}#${keyFromSecret(row.mega_handle, c.env.MEGA_LINKS)}` : null);
  if (!link) throw new HttpError(400, 'bad-request', "This video's key is not in the library or the old secret.", { field: 'mega' });
  const out = await inspect(c.env, c.executionCtx, link, { refresh: true, videoId: id });
  const ins = out.inspect;
  let cols: Record<string, unknown>;
  if (ins.ok) {
    const parsed = parseMegaLink(link);
    const full = megaColumns((parsed as { ok: true; link: Exclude<ParsedMegaLink, { kind: 'folder' }> }).link, out.probe);
    // A legacy row keeps its key in the secret until "Move it into the library"; only the facts are refreshed here.
    cols = row.mega_url ? { ...full } : { ...full, mega_url: null, mega_key: null };
  } else {
    cols = { mega_error: ins.problem === 'folder' || ins.problem === 'no-key' || ins.problem === 'not-mega' ? 'bad-key' : ins.problem === 'bad-link' ? 'bad-key' : ins.problem, mega_checked_at: sqlTime(Date.now()) };
  }
  await updateStatement(db, id, cols).run();
  wrote();
  return c.json({ video: await loadVideo(db, id), inspect: ins });
});
