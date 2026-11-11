/**
 * (sel, round 4) POST /api/admin/videos/bulk: one action on up to BULK_MAX videos at once, from the list's multi-select. Each video gets the
 * rule its single route applies (publish blockers as V4, bin as V5, purge only from the bin as V7, restore as a draft as V6), every write bumps
 * updated_at and is guarded by the updated_at it was checked against (a row changed meanwhile fails as 'stale', never half-applied), all
 * writes go in one D1 batch, and forgetRows() runs once. Behind the admin guard (session or Bearer, CSRF for cookie writes) like every admin route.
 * A video that cannot take the action is listed in `failed` with its reason; the others go ahead.
 */
import { BULK_ACTIONS, BULK_FIELDS, BULK_MAX, type AdminErrorCode, type BulkAction, type BulkFailure, type BulkResult, type VideoProblem } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, readJson } from '../../http';
import { evictPoster } from '../../posters';
import { ADMIN_COLUMNS, ADMIN_FROM, toAdminVideo, type VideoRow } from '../../videoRows';
import { blockingProblems, isCheckError, NOW_SQL, origin, parseWrite, updateStatement, wrote, type PlainColumns } from './common';

export const bulk = new Hono<AppEnv>();

const bad = (message: string, field: string): never => {
  throw new HttpError(400, 'bad-request', message, { field });
};

/** Validates the request: ids (1 to BULK_MAX distinct strings), the action, and for 'set' the fields (only BULK_FIELDS, the PATCH rules). */
export function parseBulk(body: Record<string, unknown>): { ids: string[]; action: BulkAction; columns: PlainColumns } {
  const raw = body.ids;
  if (!Array.isArray(raw) || !raw.length || !raw.every((x) => typeof x === 'string' && x.length > 0 && x.length <= 100)) bad('ids must be a list of video ids.', 'ids');
  const ids = [...new Set(raw as string[])];
  if (ids.length > BULK_MAX) bad(`At most ${BULK_MAX} videos at once.`, 'ids');
  const action = body.action as BulkAction;
  if (typeof action !== 'string' || !BULK_ACTIONS.includes(action)) bad(`action must be one of ${BULK_ACTIONS.join(', ')}.`, 'action');
  let columns: PlainColumns = {};
  if (action === 'set') {
    const f = body.fields;
    if (!f || typeof f !== 'object' || Array.isArray(f)) bad('Send the fields to set.', 'fields');
    const keys = Object.keys(f as object);
    const other = keys.find((k) => !(BULK_FIELDS as readonly string[]).includes(k));
    if (other) bad(`${other} can't be set for several videos at once.`, other);
    if (!keys.length) bad('Send the fields to set.', 'fields');
    columns = parseWrite(f as Record<string, unknown>, { create: false }).columns;
  } else if (body.fields !== undefined) bad('fields is only for set.', 'fields');
  return { ids, action, columns };
}

const fail = (id: string, code: AdminErrorCode, message: string, problems?: VideoProblem[]): BulkFailure => ({ id, code, message, ...(problems ? { problems } : {}) });

bulk.post('/videos/bulk', async (c) => {
  const db = c.env.DB;
  const { ids, action, columns } = parseBulk(await readJson(c.req.raw));

  // One read for every row (json_each keeps it to one bound parameter, under D1's limit of 100).
  const { results } = await db.prepare(`SELECT ${ADMIN_COLUMNS} ${ADMIN_FROM} WHERE v.id IN (SELECT value FROM json_each(?))`).bind(JSON.stringify(ids)).all<VideoRow>();
  const rows = new Map(results.map((r) => [r.id, r]));

  const failed: BulkFailure[] = [];
  /** The rows that reach the database, each with its statement. */
  const plan: { row: VideoRow; stmt: D1PreparedStatement; evict: boolean }[] = [];
  /** Rows already as asked (publish a live one, bin a binned one): done without a write. */
  const already: string[] = [];

  const guarded = (row: VideoRow, cols: Record<string, unknown>) => updateStatement(db, row.id, cols, row.updated_at);

  for (const id of ids) {
    const row = rows.get(id);
    if (!row) {
      failed.push(fail(id, 'not-found', 'No video with that id.'));
      continue;
    }
    const binned = !!row.deleted_at;
    switch (action) {
      case 'publish': {
        if (binned) {
          failed.push(fail(id, 'bad-request', 'Restore the video from the bin first.'));
          break;
        }
        if (row.published === 1) {
          already.push(id);
          break;
        }
        const problems = blockingProblems({ ...row, published: 1 });
        if (problems.length) failed.push(fail(id, 'cannot-publish', 'This video cannot go live yet.', problems));
        else plan.push({ row, stmt: guarded(row, { published: 1 }), evict: false });
        break;
      }
      case 'unpublish':
      case 'feature':
      case 'unfeature': {
        if (binned) {
          failed.push(fail(id, 'bad-request', 'This video is in the bin.'));
          break;
        }
        const col = action === 'unpublish' ? 'published' : 'featured';
        const to = action === 'feature' ? 1 : 0;
        if (row[col] === to) already.push(id);
        else plan.push({ row, stmt: guarded(row, { [col]: to }), evict: action === 'unpublish' });
        break;
      }
      case 'set': {
        // As PATCH: a live video must still be publishable after the change (clearing the brand of a live one is refused).
        const next = { ...row, ...(columns as Partial<VideoRow>) } as VideoRow;
        if (row.published === 1 && !binned) {
          const problems = blockingProblems(next);
          if (problems.length) {
            failed.push(fail(id, 'cannot-publish', 'This video cannot go live yet.', problems));
            break;
          }
        }
        plan.push({ row, stmt: guarded(row, { ...columns }), evict: false });
        break;
      }
      case 'bin':
        if (binned) already.push(id);
        else
          plan.push({
            row,
            stmt: db.prepare(`UPDATE videos SET published = 0, deleted_at = datetime('now'), updated_at = ${NOW_SQL} WHERE id = ? AND deleted_at IS NULL AND updated_at = ?`).bind(id, row.updated_at),
            evict: true,
          });
        break;
      case 'restore':
        // As V6 without `published`: back as a draft. Only from the bin (a bulk restore never hides a live video).
        if (!binned) failed.push(fail(id, 'not-in-bin', 'This video is not in the bin.'));
        else plan.push({ row, stmt: db.prepare(`UPDATE videos SET deleted_at = NULL, published = 0, updated_at = ${NOW_SQL} WHERE id = ? AND deleted_at IS NOT NULL AND updated_at = ?`).bind(id, row.updated_at), evict: false });
        break;
      case 'purge':
        if (!binned) failed.push(fail(id, 'not-in-bin', 'Only a video in the bin can be deleted for good.'));
        else plan.push({ row, stmt: db.prepare('DELETE FROM videos WHERE id = ? AND deleted_at IS NOT NULL AND updated_at = ?').bind(id, row.updated_at), evict: true });
        break;
    }
  }

  // One batch (one transaction). If it throws, each write is tried on its own so one bad row cannot stop the rest.
  const changed: number[] = [];
  if (plan.length) {
    try {
      const out = await db.batch(plan.map((p) => p.stmt));
      out.forEach((r) => changed.push(r.meta?.changes ?? 0));
    } catch {
      for (const p of plan) {
        try {
          changed.push((await p.stmt.run()).meta.changes);
        } catch (err) {
          changed.push(isCheckError(err) ? -2 : -1);
        }
      }
    }
  }

  const doneIds = [...already];
  const evictions: Promise<void>[] = [];
  plan.forEach((p, i) => {
    const n = changed[i] ?? 0;
    if (n > 0) {
      doneIds.push(p.row.id);
      if (p.evict) evictions.push(evictPoster(origin(c), p.row.id, p.row.poster_sha, p.row.poster_mime));
    } else if (n === 0) failed.push(fail(p.row.id, 'stale', 'This video changed in another tab.'));
    else if (n === -2) failed.push(fail(p.row.id, 'bad-request', 'That combination is not allowed.'));
    else failed.push(fail(p.row.id, 'conflict', "Couldn't save this one. Try again."));
  });
  await Promise.all(evictions);
  if (plan.length) wrote();

  // The videos as they are now, in the order asked (purged ones are gone and stay only in doneIds).
  const order = new Map(ids.map((id, i) => [id, i]));
  const doneSet = new Set(doneIds);
  const after = doneIds.length
    ? (await db.prepare(`SELECT ${ADMIN_COLUMNS} ${ADMIN_FROM} WHERE v.id IN (SELECT value FROM json_each(?))`).bind(JSON.stringify(doneIds)).all<VideoRow>()).results
    : [];
  const done = await Promise.all(after.filter((r) => doneSet.has(r.id)).sort((x, y) => order.get(x.id)! - order.get(y.id)!).map(toAdminVideo));
  doneIds.sort((x, y) => order.get(x)! - order.get(y)!);
  failed.sort((x, y) => order.get(x.id)! - order.get(y.id)!);
  return c.json<BulkResult>({ done, doneIds, failed });
});
