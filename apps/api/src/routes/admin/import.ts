/**
 * Bulk import (admin brief 3, V2-SPEC 2.8):
 *   I1 POST /api/admin/import/dry-run   { text | rows, fileName? } -> ImportPreview   parse, expand folders, duplicates, cached checks
 *   I2 POST /api/admin/import/commit    { importId, rows (<= 50) } -> ImportCommitResponse   one atomic D1 batch per call
 *   I3 POST /api/admin/import/:id/undo  -> { binned, kept }
 * The browser inspects each 'checking' row with M1, three at a time, between I1 and I2. Every imported row is a draft.
 */
import {
  canonicalMegaLink,
  cleanText,
  importStatusOf,
  IMPORT_LIMITS,
  isDefaultSelected,
  megaStreamHandle,
  parseImport,
  parseInstagram,
  parseMegaLink,
  parseUploadDate,
  parseYouTube,
  titleFromFileName,
  VIDEO_ASPECTS,
  type AdminVideo,
  type ImportCommitResponse,
  type ImportCommitRow,
  type ImportPreview,
  type ImportRow,
  type ImportStatus,
  type ParsedImport,
  type ParsedImportRow,
  type ParsedMegaLink,
  type VideoAspect,
} from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, LIMITS, readJson } from '../../http';
import { buildInspect, expandFolder, inspectParsed, megaColumns, PROBLEM_MESSAGES, reusable, UNUSABLE, type ProbeRow } from '../../mega/inspect';
import { MegaError } from '../../mega/protocol';
import { toAdminVideo, type VideoRow } from '../../videoRows';
import { loadRow, NOW_SQL, wrote } from './common';

export const imports = new Hono<AppEnv>();

const IMPORT_ID = /^imp_\d{8}_[0-9a-z]{6}$/;
const DAY_MS = 24 * 3600 * 1000;
type FileLink = Exclude<ParsedMegaLink, { kind: 'folder' }>;

function newImportId(): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => (b % 36).toString(36)).join('');
  return `imp_${ymd}_${rand}`;
}

/** Rows sent back by the browser (format 'rows'): each re-parsed exactly as text would be. */
function fromRows(rows: unknown[]): ParsedImport {
  const lines = rows.map((r, i) => {
    const o = (r && typeof r === 'object' ? r : {}) as Partial<ImportRow>;
    return { o, i };
  });
  const out: ParsedImportRow[] = lines.map(({ o, i }) => {
    const parsed = parseImport([o.mega, o.instagram, o.youtube].filter((x): x is string => typeof x === 'string' && !!x).join(' '));
    const base: ParsedImportRow = parsed.rows[0] ?? {
      rowId: '',
      line: 0,
      status: 'needs-mega',
      mega: null,
      handle: null,
      megaKind: null,
      instagram: null,
      youtube: null,
      title: '',
      titleFrom: 'none',
      brand: '',
      category: null,
      platform: null,
      views: 0,
      uploadDate: null,
      aspect: null,
      notes: [],
      duplicateOf: null,
    };
    const title = typeof o.title === 'string' ? cleanText(o.title).slice(0, 140) : '';
    return {
      ...base,
      rowId: typeof o.rowId === 'string' && /^[\w-]{1,24}$/.test(o.rowId) ? o.rowId : `r${i + 1}`,
      line: typeof o.line === 'number' ? o.line : i + 1,
      status: base.status === 'duplicate-in-file' ? 'ok' : base.status,
      title,
      titleFrom: title ? (o.titleFrom === 'file-name' ? 'none' : 'text') : 'none',
      brand: typeof o.brand === 'string' ? cleanText(o.brand).slice(0, 60) : '',
      category: typeof o.category === 'string' ? cleanText(o.category).slice(0, 40) || null : null,
      platform: typeof o.platform === 'string' ? cleanText(o.platform).slice(0, 40) || null : null,
      views: typeof o.views === 'number' && Number.isSafeInteger(o.views) && o.views >= 0 ? o.views : 0,
      uploadDate: parseUploadDate(o.uploadDate) ?? null,
      aspect: VIDEO_ASPECTS.includes(o.aspect as VideoAspect) ? (o.aspect as VideoAspect) : null,
      notes: [],
      duplicateOf: null,
    };
  });
  return { format: 'json', rows: out, ignored: [], pairable: {} };
}

function emptyRow(p: ParsedImportRow): ImportRow {
  return {
    rowId: p.rowId,
    line: p.line,
    folder: null,
    mega: p.mega,
    handle: p.handle,
    megaKind: p.megaKind === 'folder' ? null : p.megaKind,
    fileName: null,
    size: null,
    instagram: p.instagram,
    youtube: p.youtube,
    title: p.title,
    titleFrom: p.titleFrom,
    brand: p.brand,
    category: p.category,
    platform: p.platform,
    views: p.views,
    uploadDate: p.uploadDate,
    aspect: p.aspect,
    status: 'checking',
    check: null,
    duplicate: null,
    duplicateOfRow: p.duplicateOf,
    notes: [...p.notes],
    selected: false,
  };
}

// ---------------------------------------------------------------- I1 dry run

imports.post('/import/dry-run', async (c) => {
  const db = c.env.DB;
  const body = await readJson<{ text?: unknown; rows?: unknown; fileName?: unknown }>(c.req.raw, LIMITS.dryRun);
  let parsed: ParsedImport;
  let format: ImportPreview['format'];
  if (typeof body.text === 'string') {
    if (body.text.length > IMPORT_LIMITS.chars) throw new HttpError(413, 'too-large', 'That file is too large to import at once (at most 1,000,000 characters).');
    parsed = parseImport(body.text);
    format = parsed.format;
  } else if (Array.isArray(body.rows)) {
    if (body.rows.length > IMPORT_LIMITS.rows) throw new HttpError(413, 'too-large', `At most ${IMPORT_LIMITS.rows} rows at a time.`);
    parsed = fromRows(body.rows);
    format = 'rows';
  } else throw new HttpError(400, 'bad-request', 'Paste the links or choose a file.', { field: 'text' });

  const rows: ImportRow[] = [];
  const ignored = [...parsed.ignored];
  let folders = 0;
  for (const p of parsed.rows) {
    if (rows.length >= IMPORT_LIMITS.rows) {
      ignored.push({ line: p.line, link: p.mega ?? p.instagram ?? p.youtube ?? '', reason: `More than ${IMPORT_LIMITS.rows} videos; import the rest separately.` });
      continue;
    }
    if (p.status !== 'folder') {
      const row = emptyRow(p);
      row.status = p.status === 'no-key' ? 'no-key' : p.status === 'invalid' ? 'invalid' : p.status === 'needs-mega' ? 'needs-mega' : p.status === 'duplicate-in-file' ? 'duplicate-in-file' : 'checking';
      rows.push(row);
      continue;
    }
    // A folder: one row per video file inside, after one listing (at most 5 folders a run).
    const link = parseMegaLink(p.mega!);
    folders++;
    if (folders > IMPORT_LIMITS.folders || !link.ok || link.link.kind !== 'folder') {
      const row = emptyRow(p);
      row.status = folders > IMPORT_LIMITS.folders ? 'folder-limit' : 'invalid';
      row.notes.push(folders > IMPORT_LIMITS.folders ? 'Import at most five folders at a time.' : 'That folder link did not parse.');
      rows.push(row);
      continue;
    }
    const folderLink = link.link;
    try {
      const listing = await expandFolder(c.env, folderLink, IMPORT_LIMITS.filesPerFolder);
      const name = listing.root;
      const videos = listing.files.filter((f) => f.playable === 'video');
      listing.files.forEach((f, i) => {
        if (rows.length >= IMPORT_LIMITS.rows) return;
        const row = emptyRow(p);
        row.rowId = `${p.rowId}-${i + 1}`;
        row.folder = { handle: folderLink.folderHandle, name };
        row.mega = f.canonical;
        row.handle = f.handle;
        row.megaKind = 'folder-file';
        row.fileName = f.name;
        row.size = f.size;
        row.title = titleFromFileName(f.name) || 'Untitled video';
        row.titleFrom = 'file-name';
        row.notes = f.path.length ? [`In ${f.path.join(' / ')}`] : [];
        // Social links on the folder's own line attach only when the folder holds one video.
        if (videos.length !== 1) {
          row.instagram = null;
          row.youtube = null;
        }
        if (f.playable !== 'video') {
          row.status = 'not-video';
          row.notes.push(`This is a ${f.name.split('.').pop()} file. The site plays MP4 or MOV in H.264.`);
        } else row.status = 'checking';
        rows.push(row);
      });
      if (listing.truncated) ignored.push({ line: p.line, link: p.mega!, reason: `The folder holds ${listing.truncated} more videos than the ${IMPORT_LIMITS.filesPerFolder} read at a time.` });
      if (!listing.files.length) ignored.push({ line: p.line, link: p.mega!, reason: 'The folder has no MP4 or MOV videos.' });
      if (videos.length !== 1 && (p.instagram || p.youtube)) ignored.push({ line: p.line, link: p.instagram ?? p.youtube ?? '', reason: 'could not tell which video in the folder this link belongs to' });
    } catch (err) {
      if (!(err instanceof MegaError)) throw err;
      const row = emptyRow(p);
      row.megaKind = null;
      row.status = err.kind === 'busy' || err.kind === 'over-quota' || err.kind === 'upstream' ? 'busy' : err.kind === 'bad-link' ? 'invalid' : 'unreachable';
      row.check = { ok: false, problem: err.kind, message: PROBLEM_MESSAGES[err.kind] };
      row.notes.push('The folder could not be listed.');
      rows.push(row);
    }
  }

  // The same MEGA file, Instagram or YouTube link twice in the file (also across folders).
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (row.status === 'duplicate-in-file' && row.duplicateOfRow) continue;
    for (const key of [row.handle && `m:${row.handle}`, row.instagram && `i:${row.instagram}`, row.youtube && `y:${row.youtube}`]) {
      if (!key) continue;
      const first = seen.get(key);
      if (first && row.status !== 'duplicate-in-file') {
        row.status = 'duplicate-in-file';
        row.duplicateOfRow = first;
      } else if (!first) seen.set(key, row.rowId);
    }
  }

  // Duplicates against the library, binned rows included: one query (JSON arrays, so no limit on bound parameters).
  const handles = [...new Set(rows.map((r) => r.handle).filter((h): h is string => !!h))];
  const igs = [...new Set(rows.map((r) => r.instagram).filter((h): h is string => !!h))];
  const yts = [...new Set(rows.map((r) => r.youtube).filter((h): h is string => !!h))];
  const { results: existing } = await db
    .prepare(
      `SELECT id, title, deleted_at, mega_handle, instagram_url, youtube_url FROM videos
       WHERE mega_handle IN (SELECT value FROM json_each(?1)) OR instagram_url IN (SELECT value FROM json_each(?2)) OR youtube_url IN (SELECT value FROM json_each(?3))`,
    )
    .bind(JSON.stringify(handles), JSON.stringify(igs), JSON.stringify(yts))
    .all<{ id: string; title: string; deleted_at: string | null; mega_handle: string | null; instagram_url: string | null; youtube_url: string | null }>();
  for (const row of rows) {
    const byHandle = row.handle ? existing.find((e) => e.mega_handle === row.handle) : undefined;
    if (byHandle && row.status !== 'duplicate-in-file') {
      const canFillLinks = (!!row.instagram && !byHandle.instagram_url) || (!!row.youtube && !byHandle.youtube_url);
      row.status = 'duplicate';
      row.duplicate = { id: byHandle.id, title: byHandle.title, inBin: !!byHandle.deleted_at, canFillLinks };
      continue;
    }
    for (const e of existing) {
      if (e.id === byHandle?.id) continue;
      if (row.instagram && e.instagram_url === row.instagram) row.notes.push(`This Instagram link is also on "${e.title}".`);
      if (row.youtube && e.youtube_url === row.youtube) row.notes.push(`This YouTube link is also on "${e.title}".`);
    }
  }

  // Checks from the last 24 hours fill in at once; every other MEGA row stays 'checking' for the browser's M1 calls.
  const checking = rows.filter((r) => r.status === 'checking' && r.mega);
  if (checking.length) {
    const { results: probes } = await db
      .prepare('SELECT * FROM mega_probes WHERE handle IN (SELECT value FROM json_each(?1)) AND checked_at > ?2')
      .bind(JSON.stringify(checking.map((r) => r.handle)), Date.now() - DAY_MS)
      .all<ProbeRow>();
    for (const row of checking) {
      const probe = probes.find((p) => p.handle === row.handle && p.link === row.mega);
      const link = parseMegaLink(row.mega!);
      if (!reusable(probe ?? null) || !link.ok || link.link.kind === 'folder') continue;
      row.check = buildInspect(link.link, probe!, true, null);
      row.status = importStatusOf(row.check);
      if (row.check.ok) {
        row.fileName = row.check.meta.name;
        row.size = row.check.meta.size;
        if (!row.title && row.check.suggestedTitle) {
          row.title = row.check.suggestedTitle;
          row.titleFrom = 'file-name';
        }
        row.aspect ??= row.check.suggestedAspect;
      }
    }
  }
  for (const row of rows) row.selected = isDefaultSelected(row.status);

  const counts: Partial<Record<ImportStatus, number>> = {};
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return c.json<ImportPreview>({ importId: newImportId(), format, rows, ignored, pairable: parsed.pairable, counts });
});

// ---------------------------------------------------------------- I2 commit

function validCommitRow(r: unknown): ImportCommitRow | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  if (typeof o.rowId !== 'string' || (o.action !== 'create' && o.action !== 'fill-links')) return null;
  return o as unknown as ImportCommitRow;
}

imports.post('/import/commit', async (c) => {
  const db = c.env.DB;
  const body = await readJson<{ importId?: unknown; rows?: unknown }>(c.req.raw, LIMITS.commit);
  const importId = body.importId;
  if (typeof importId !== 'string' || !IMPORT_ID.test(importId)) throw new HttpError(400, 'bad-request', 'Missing or bad importId.', { field: 'importId' });
  if (!Array.isArray(body.rows) || body.rows.length > IMPORT_LIMITS.commitRows) throw new HttpError(400, 'bad-request', `rows must be a list of at most ${IMPORT_LIMITS.commitRows}.`, { field: 'rows' });

  const skipped: ImportCommitResponse['skipped'] = [];
  const stmts: D1PreparedStatement[] = [];
  const createdIds: string[] = [];
  const updatedIds: string[] = [];
  const usedHandles = new Set<string>();
  let inline = 0;

  // In file order on top of the list. The first commit of an import reserves room for 1000 rows above everything; later
  // commits of the same import continue after the rows already in.
  const pos = await db
    .prepare('SELECT (SELECT MAX(sort_order) FROM videos WHERE import_id = ?1) AS last, (SELECT MIN(sort_order) FROM videos) AS top')
    .bind(importId)
    .first<{ last: number | null; top: number | null }>();
  let next = pos?.last !== null && pos?.last !== undefined ? pos.last + 10 : (pos?.top ?? 10) - 10 * 1000;

  for (const raw of body.rows) {
    const r = validCommitRow(raw);
    if (!r) {
      skipped.push({ rowId: String((raw as { rowId?: unknown })?.rowId ?? '?'), reason: 'invalid', message: 'That row is not complete.' });
      continue;
    }
    const ig = r.instagram ? parseInstagram(r.instagram) : null;
    const yt = r.youtube ? parseYouTube(r.youtube) : null;
    if ((ig && !ig.ok) || (yt && !yt.ok)) {
      skipped.push({ rowId: r.rowId, reason: 'invalid', message: "One of the row's links is not an Instagram or YouTube video." });
      continue;
    }
    const igUrl = ig?.ok ? ig.url : null;
    const ytUrl = yt?.ok ? yt.url : null;

    if (r.action === 'fill-links') {
      const target = typeof r.targetId === 'string' ? await loadRow(db, r.targetId) : null;
      if (!target) {
        skipped.push({ rowId: r.rowId, reason: 'invalid', message: 'The video to add the links to is gone.' });
        continue;
      }
      const cols: string[] = [];
      const vals: unknown[] = [];
      if (igUrl && !target.instagram_url) cols.push('instagram_url = ?') && vals.push(igUrl);
      if (ytUrl && !target.youtube_url) cols.push('youtube_url = ?') && vals.push(ytUrl);
      if (!cols.length) {
        skipped.push({ rowId: r.rowId, reason: 'duplicate', message: 'That video already has these links.' });
        continue;
      }
      stmts.push(db.prepare(`UPDATE videos SET ${cols.join(', ')}, updated_at = ${NOW_SQL} WHERE id = ?`).bind(...vals, target.id));
      updatedIds.push(target.id);
      continue;
    }

    // create
    let link: FileLink | null = null;
    if (r.mega) {
      const parsed = parseMegaLink(r.mega);
      if (!parsed.ok || parsed.link.kind === 'folder') {
        skipped.push({ rowId: r.rowId, reason: 'invalid', message: parsed.ok ? PROBLEM_MESSAGES.folder : PROBLEM_MESSAGES[parsed.problem] });
        continue;
      }
      link = parsed.link;
    }
    if (!link && !igUrl && !ytUrl) {
      skipped.push({ rowId: r.rowId, reason: 'invalid', message: 'The row has no link.' });
      continue;
    }
    let megaCols: Record<string, unknown> = {};
    let suggestedAspect: VideoAspect | null = null;
    let suggestedTitle = '';
    if (link) {
      const handle = megaStreamHandle(link)!;
      const dup = usedHandles.has(handle) ? { id: 'this import' } : await db.prepare('SELECT id FROM videos WHERE mega_handle = ?').bind(handle).first<{ id: string }>();
      if (dup) {
        skipped.push({ rowId: r.rowId, reason: 'duplicate', message: 'That MEGA file is already in the library.' });
        continue;
      }
      let probe = await db.prepare('SELECT * FROM mega_probes WHERE handle = ? AND link = ? AND checked_at > ?').bind(handle, canonicalMegaLink(link), Date.now() - DAY_MS).first<ProbeRow>();
      if (!reusable(probe)) {
        if (inline >= IMPORT_LIMITS.inlineInspects) {
          skipped.push({ rowId: r.rowId, reason: 'needs-check', message: 'Check this link again, then import it.' });
          continue;
        }
        inline++;
        probe = (await inspectParsed(c.env, c.executionCtx, link)).probe;
      }
      if (probe?.error && UNUSABLE.has(probe.error)) {
        skipped.push({ rowId: r.rowId, reason: 'mega-unusable', message: PROBLEM_MESSAGES[probe.error as keyof typeof PROBLEM_MESSAGES] ?? 'MEGA refused this file.' });
        continue;
      }
      megaCols = { ...megaColumns(link, probe) };
      if (probe && !probe.error && probe.width && probe.height) suggestedAspect = probe.height >= probe.width ? 'vertical' : 'landscape';
      suggestedTitle = titleFromFileName(probe?.name);
      usedHandles.add(handle);
    }
    const title = cleanText(r.title ?? '').slice(0, 140) || suggestedTitle || 'Untitled video';
    const views = typeof r.views === 'number' && Number.isSafeInteger(r.views) && r.views >= 0 ? r.views : 0;
    const aspect = VIDEO_ASPECTS.includes(r.aspect as VideoAspect) ? (r.aspect as VideoAspect) : (suggestedAspect ?? 'vertical');
    const id = crypto.randomUUID();
    const cols: Record<string, unknown> = {
      id,
      title,
      brand: cleanText(r.brand ?? '').slice(0, 60),
      category: cleanText(r.category ?? '').slice(0, 40) || null,
      platform: cleanText(r.platform ?? '').slice(0, 40) || null,
      aspect,
      views,
      upload_date: parseUploadDate(r.uploadDate) ?? null,
      featured: 0,
      published: 0,
      sort_order: next,
      import_id: importId,
      instagram_url: igUrl,
      youtube_url: ytUrl,
      ...megaCols,
    };
    next += 10;
    const names = Object.keys(cols);
    stmts.push(db.prepare(`INSERT INTO videos (${names.join(', ')}, updated_at) VALUES (${names.map(() => '?').join(', ')}, ${NOW_SQL})`).bind(...names.map((n) => cols[n])));
    createdIds.push(id);
  }

  if (stmts.length) {
    try {
      await db.batch(stmts); // one transaction: all of this call's rows, or none
    } catch (err) {
      if (err instanceof Error && /UNIQUE constraint failed/.test(err.message)) throw new HttpError(409, 'conflict', 'Some of these videos were added meanwhile. Reading the links again.');
      throw err;
    }
  }
  wrote();
  const load = async (ids: string[]) => {
    const out: AdminVideo[] = [];
    for (const id of ids) {
      const row = await loadRow(db, id);
      if (row) out.push(await toAdminVideo(row as VideoRow));
    }
    return out;
  };
  return c.json<ImportCommitResponse>({ importId, created: await load(createdIds), updated: await load([...new Set(updatedIds)]), skipped });
});

// ---------------------------------------------------------------- I3 undo

imports.post('/import/:importId/undo', async (c) => {
  const db = c.env.DB;
  const importId = c.req.param('importId');
  if (!IMPORT_ID.test(importId)) throw new HttpError(400, 'bad-request', 'Bad importId.', { field: 'importId' });
  const [binned, kept] = await db.batch<{ n: number }>([
    db.prepare(`UPDATE videos SET deleted_at = datetime('now'), updated_at = ${NOW_SQL} WHERE import_id = ? AND published = 0 AND deleted_at IS NULL`).bind(importId),
    db.prepare('SELECT COUNT(*) AS n FROM videos WHERE import_id = ? AND published = 1').bind(importId),
  ]);
  wrote();
  return c.json({ binned: binned!.meta.changes, kept: kept!.results[0]?.n ?? 0 });
});
