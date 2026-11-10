/**
 * What the admin video routes share: loading a row, validating a VideoWrite (admin brief 4.4), the publish check, warnings,
 * and the column writes. Column names here are fixed strings from this file; values are always bound.
 */
import {
  BLOCKING_PROBLEMS,
  cleanText,
  isValidPosterUrl,
  parseInstagram,
  parseMegaLink,
  parseVideoRef,
  parseYouTube,
  VIDEO_ASPECTS,
  type AdminVideo,
  type ParsedMegaLink,
  type SaveWarning,
  type VideoAspect,
  type VideoProblem,
  type VideoSource,
} from '@kreators/shared';
import type { Context } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError } from '../../http';
import { forgetRows } from '../../mega/lookup';
import { ADMIN_COLUMNS, ADMIN_FROM, problemsFor, toAdminVideo, type VideoRow } from '../../videoRows';
import { PROBLEM_MESSAGES } from '../../mega/inspect';

/** updated_at with milliseconds, so two saves in one second still tell apart (409 stale). */
export const NOW_SQL = "strftime('%Y-%m-%d %H:%M:%f', 'now')";

export async function loadRow(db: D1Database, id: string): Promise<VideoRow | null> {
  return db.prepare(`SELECT ${ADMIN_COLUMNS} ${ADMIN_FROM} WHERE v.id = ?`).bind(id).first<VideoRow>();
}

export async function loadVideo(db: D1Database, id: string): Promise<AdminVideo | null> {
  const row = await loadRow(db, id);
  return row ? toAdminVideo(row) : null;
}

export async function mustLoad(db: D1Database, id: string): Promise<VideoRow> {
  const row = await loadRow(db, id);
  if (!row) throw new HttpError(404, 'not-found', 'No video with that id.');
  return row;
}

/** The plain (non-MEGA) columns a write may set. */
export interface PlainColumns {
  title?: string;
  brand?: string;
  category?: string | null;
  platform?: string | null;
  aspect?: VideoAspect;
  views?: number;
  upload_date?: string | null;
  featured?: number;
  published?: number;
  sort_order?: number;
  file_ref?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  poster_url?: string | null;
}

export interface ParsedWrite {
  columns: PlainColumns;
  /** undefined: unchanged; null: clear every mega_* column; a link: inspect and write. */
  mega: ParsedMegaLink | null | undefined;
  expectUpdatedAt?: string;
}

const bad = (message: string, field: string): never => {
  throw new HttpError(400, 'bad-request', message, { field });
};

function str(body: Record<string, unknown>, field: string): string | null | undefined {
  const v = body[field];
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== 'string') bad(`${field} must be text.`, field);
  return v as string;
}

function megaFrom(value: string, field: string): ParsedMegaLink {
  const r = parseMegaLink(value);
  if (!r.ok) bad(r.problem === 'not-mega' || r.problem === 'bad-link' ? PROBLEM_MESSAGES['not-mega'] : PROBLEM_MESSAGES[r.problem], field);
  const link = (r as { ok: true; link: ParsedMegaLink }).link;
  if (link.kind === 'folder') bad(PROBLEM_MESSAGES.folder, field);
  return link;
}

/** Validates a VideoWrite body. Unknown fields are ignored; a bad value is a 400 naming its field. */
export function parseWrite(body: Record<string, unknown>, { create }: { create: boolean }): ParsedWrite {
  const columns: PlainColumns = {};
  let mega: ParsedMegaLink | null | undefined;

  // v1 CLI alias: routed by host.
  const url = str(body, 'url');
  if (url) {
    if (parseMegaLink(url).ok || /mega\.(nz|co\.nz|io|app)\//i.test(url)) mega = megaFrom(url, 'url');
    else if (parseYouTube(url).ok) columns.youtube_url = (parseYouTube(url) as { url: string }).url;
    else {
      const v1 = parseVideoRef(url);
      if (v1?.source === 'wave') throw new HttpError(400, 'wave-retired', 'wave.video links can no longer be added. Use a MEGA link.', { field: 'url' });
      if (v1?.source === 'file') columns.file_ref = v1.ref;
      else bad('url must be a MEGA link, a YouTube link or a /media/ path.', 'url');
    }
  }

  const title = str(body, 'title');
  if (title !== undefined) {
    const t = cleanText(title ?? '');
    if (!t || t.length > 140) bad('Add a title (at most 140 characters).', 'title');
    columns.title = t;
  } else if (create) bad('Add a title.', 'title');

  const brand = str(body, 'brand');
  if (brand !== undefined) {
    const b = cleanText(brand ?? '');
    if (b.length > 60) bad('The brand is too long (at most 60 characters).', 'brand');
    columns.brand = b;
  }

  for (const field of ['category', 'platform'] as const) {
    const v = str(body, field);
    if (v === undefined) continue;
    const t = cleanText(v ?? '');
    if (t.length > 40) bad(`${field} is too long (at most 40 characters).`, field);
    columns[field] = t || null;
  }

  if (body.aspect !== undefined) {
    if (!VIDEO_ASPECTS.includes(body.aspect as VideoAspect)) bad('aspect must be vertical or landscape.', 'aspect');
    columns.aspect = body.aspect as VideoAspect;
  }
  if (body.views !== undefined) {
    if (typeof body.views !== 'number' || !Number.isSafeInteger(body.views) || body.views < 0) bad('views must be a whole number, zero or more.', 'views');
    columns.views = body.views as number;
  }
  if (body.uploadDate !== undefined) {
    if (body.uploadDate === null || body.uploadDate === '') columns.upload_date = null;
    else {
      const d = typeof body.uploadDate === 'string' ? body.uploadDate : '';
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
      const t = m ? Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!) : NaN;
      const ok = m && new Date(t).toISOString().slice(0, 10) === d && +m[1]! >= 2000;
      if (!ok) bad('uploadDate must be a real day written YYYY-MM-DD.', 'uploadDate');
      if (t > Date.now() + 36 * 3600 * 1000) bad('uploadDate cannot be in the future.', 'uploadDate');
      columns.upload_date = d;
    }
  }
  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== 'number' || !Number.isInteger(body.sortOrder) || Math.abs(body.sortOrder) > 1e9) bad('sortOrder must be a whole number.', 'sortOrder');
    columns.sort_order = body.sortOrder as number;
  }
  for (const field of ['featured', 'published'] as const) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'boolean') bad(`${field} must be true or false.`, field);
    columns[field] = body[field] ? 1 : 0;
  }

  if (body.mega !== undefined) {
    if (body.mega === null || body.mega === '') mega = null;
    else if (typeof body.mega !== 'string') bad('mega must be a MEGA link.', 'mega');
    else mega = megaFrom(body.mega, 'mega');
  }

  const ig = str(body, 'instagram');
  if (ig !== undefined) {
    if (!ig) columns.instagram_url = null;
    else {
      const r = parseInstagram(ig);
      if (!r.ok) bad("That isn't an Instagram post or reel.", 'instagram');
      columns.instagram_url = (r as { url: string }).url;
    }
  }
  const yt = str(body, 'youtube');
  if (yt !== undefined) {
    if (!yt) columns.youtube_url = null;
    else {
      const r = parseYouTube(yt);
      if (!r.ok) bad("That isn't a YouTube video link.", 'youtube');
      columns.youtube_url = (r as { url: string }).url;
    }
  }
  const file = str(body, 'file');
  if (file !== undefined) {
    if (!file) columns.file_ref = null;
    else if (!/^\/media\/[\w.-]+\.mp4$/.test(file) || file.includes('..') || file.startsWith('/media/mega-')) bad('file must be /media/<name>.mp4.', 'file');
    else columns.file_ref = file;
  }
  const poster = str(body, 'posterUrl');
  if (poster !== undefined) {
    if (!poster) columns.poster_url = null;
    else if (poster.length > 500 || !isValidPosterUrl(poster)) bad('posterUrl must be an https image or a /media/ image.', 'posterUrl');
    else columns.poster_url = poster;
  }
  const expect = str(body, 'expectUpdatedAt');
  return { columns, mega, ...(expect ? { expectUpdatedAt: expect } : {}) };
}

/** The `source` a row would compute (the generated column's CASE, for checks before a write). */
export function sourceOf(row: Pick<VideoRow, 'mega_handle' | 'file_ref' | 'wave_ref' | 'youtube_url'>): VideoSource {
  return row.mega_handle ? 'mega' : row.file_ref ? 'file' : row.wave_ref ? 'wave' : row.youtube_url ? 'youtube' : 'none';
}

/** Blocking problems of a row as it would be after a write. */
export function blockingProblems(row: VideoRow): VideoProblem[] {
  const merged = { ...row, source: sourceOf(row) };
  return problemsFor(merged).filter((p) => BLOCKING_PROBLEMS.includes(p));
}

export function cannotPublish(problems: VideoProblem[]): HttpError {
  return new HttpError(422, 'cannot-publish', 'This video cannot go live yet.', { problems });
}

/** A link already used by another entry is allowed, with a warning naming that entry. */
export async function socialWarnings(db: D1Database, id: string, row: Pick<VideoRow, 'instagram_url' | 'youtube_url'>): Promise<SaveWarning[]> {
  const out: SaveWarning[] = [];
  for (const [col, code, label] of [
    ['instagram_url', 'instagram-in-use', 'Instagram'],
    ['youtube_url', 'youtube-in-use', 'YouTube'],
  ] as const) {
    const value = row[col];
    if (!value) continue;
    const other = await db.prepare(`SELECT id, title FROM videos WHERE ${col} = ? AND id <> ? LIMIT 1`).bind(value, id).first<{ id: string; title: string }>();
    if (other) out.push({ code, message: `This ${label} link is also on "${other.title}".` });
  }
  return out;
}

/** Runs an UPDATE of the given columns (names from this module only) and bumps updated_at. */
export function updateStatement(db: D1Database, id: string, cols: Record<string, unknown>, expectUpdatedAt?: string): D1PreparedStatement {
  const names = Object.keys(cols);
  for (const n of names) if (!/^[a-z_]+$/.test(n)) throw new Error(`bad column ${n}`);
  const set = [...names.map((n) => `${n} = ?`), `updated_at = ${NOW_SQL}`].join(', ');
  const where = expectUpdatedAt ? 'WHERE id = ? AND updated_at = ?' : 'WHERE id = ?';
  return db.prepare(`UPDATE videos SET ${set} ${where}`).bind(...names.map((n) => cols[n]), id, ...(expectUpdatedAt ? [expectUpdatedAt] : []));
}

export function isUniqueError(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed: videos\.mega_handle/.test(err.message);
}

export function isCheckError(err: unknown): boolean {
  return err instanceof Error && /CHECK constraint failed/.test(err.message);
}

/** Every admin write ends here: the stream's row cache in this isolate forgets, other isolates within 60 s. */
export function wrote(): void {
  forgetRows();
}

export const origin = (c: Context<AppEnv>) => new URL(c.req.url).origin;
