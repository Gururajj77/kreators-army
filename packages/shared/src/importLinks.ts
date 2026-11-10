/**
 * The bulk import parser (admin brief 3.3; port of .work/tools/v2/admin/proof/import/parse.mjs). Pure and synchronous: the
 * admin page runs it for an instant first paint, and the Worker runs it for the authoritative dry run. Whatever the founder
 * pastes or uploads (a list, blocks, a spreadsheet as CSV or TSV, JSON), it never refuses the whole file: each candidate
 * video becomes a row with a status.
 *
 * Differences from the reference, both safer for real files: a comma, semicolon or pipe ends a link (so "link1,link2" with
 * no space is two links), and a keyless folder-file link keeps its node handle when its key is joined from the same line.
 */
import type { ImportStatus, MegaInspect } from './admin.ts';
import { canonicalMegaLink, decodeHtmlEntities, parseMegaUrl, type MegaLinkResult, type ParsedMegaLink } from './megaLinks.ts';
import { parseInstagram, parseYouTube } from './socialLinks.ts';
import { cleanText, isFutureDay, parseUploadDate, parseViews } from './text.ts';
import type { VideoAspect } from './videos.ts';

export type ParsedImportStatus = 'ok' | 'no-key' | 'invalid' | 'folder' | 'needs-mega' | 'duplicate-in-file';

export interface ParsedImportRow {
  rowId: string;
  /** 1-based line of the source text (for a table, the data row's line). */
  line: number;
  status: ParsedImportStatus;
  /** Canonical MEGA link; for a 'no-key' row the link without its key, so a key pasted later can be appended after '#'. */
  mega: string | null;
  /** The handle a library row stores: a file's own, or a folder file's node handle. Null for folders and problem rows. */
  handle: string | null;
  megaKind: 'file' | 'folder' | 'folder-file' | null;
  instagram: string | null;
  youtube: string | null;
  title: string;
  titleFrom: 'column' | 'text' | 'none';
  brand: string;
  category: string | null;
  platform: string | null;
  views: number;
  uploadDate: string | null;
  aspect: VideoAspect | null;
  notes: string[];
  /** For 'duplicate-in-file': the rowId of the first row with the same MEGA file, Instagram or YouTube link. */
  duplicateOf: string | null;
}

export interface ParsedImport {
  format: 'line' | 'block' | 'table' | 'json';
  rows: ParsedImportRow[];
  ignored: { line: number; link: string; reason: string }[];
  /** N MEGA-only rows and N rows with only an Instagram (or YouTube) link, N >= 2: offered as a button, never done silently. */
  pairable: { instagram?: number; youtube?: number };
}

export const IMPORT_LIMITS = { chars: 1_000_000, rows: 500, folders: 5, filesPerFolder: 200, commitRows: 50, inlineInspects: 5 } as const;

// ---------------------------------------------------------------- text helpers

// A comma, semicolon or pipe ends a link: MEGA, Instagram and YouTube links never contain one, and lists often use them.
const URL_RE = /\bhttps?:\/\/[^\s"'<>`,;|]+/gi;
const BARE_RE = /(^|[\s,;|(\[])((?:www\.)?(?:mega\.(?:nz|io|app|co\.nz)|instagram\.com|instagr\.am|youtube\.com|m\.youtube\.com|youtu\.be)\/[^\s"'<>`,;|]+)/gi;

const trimUrl = (u: string) => {
  let out = u.replace(/[.,;:'"\]}>]+$/, '');
  while (out.endsWith(')') && (out.match(/\(/g) ?? []).length < (out.match(/\)/g) ?? []).length) out = out.slice(0, -1);
  return out;
};

/** Every link in a piece of text, in order, plus the text left once links, embed codes, labels and list markers are removed. */
export function extractLinks(text: string): { urls: string[]; rest: string } {
  const t = decodeHtmlEntities(text);
  const found: { url: string; at: number }[] = [];
  for (const m of t.matchAll(URL_RE)) found.push({ url: trimUrl(m[0]), at: m.index! });
  for (const m of t.matchAll(BARE_RE)) {
    const at = m.index! + m[1]!.length;
    if (!found.some((f) => at >= f.at && at < f.at + f.url.length + 8)) found.push({ url: trimUrl('https://' + m[2]!), at });
  }
  found.sort((a, b) => a.at - b.at);
  const rest = t
    .replace(/<iframe\b[\s\S]*?(?:<\/iframe>|$)/gi, ' ')
    .replace(URL_RE, ' ')
    .replace(BARE_RE, '$1 ')
    .replace(/\b(?:mega|instagram|insta|ig|youtube|yt|shorts|reel|link|links|url|embed|decryption key|key)\s*[:=-]\s*/gi, ' ')
    .replace(/^\s*(?:\d{1,3}[.)]|[-*•–])\s+/, '')
    .replace(/[\s|,;:–—-]+$/g, '')
    .replace(/^[\s|,;:–—-]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { urls: found.map((f) => f.url), rest };
}

// ---------------------------------------------------------------- columns

const ALIASES: Record<string, string[]> = {
  title: ['title', 'name', 'videotitle', 'videoname', 'video', 'caption', 'headline', 'topic'],
  brand: ['brand', 'brandname', 'client', 'company', 'customer'],
  category: ['category', 'niche', 'industry', 'vertical', 'type'],
  platform: ['platform', 'postedon'],
  views: ['views', 'viewcount', 'totalviews', 'plays', 'reach'],
  uploadDate: ['uploaddate', 'dateuploaded', 'uploadedon', 'uploadedat', 'dateposted', 'posteddate', 'postdate', 'publishdate', 'publisheddate', 'date'],
  aspect: ['aspect', 'orientation', 'shape', 'format'],
  mega: ['mega', 'megalink', 'megaurl', 'stream', 'file', 'filelink', 'videolink', 'link', 'url', 'embed', 'embedcode', 'source'],
  instagram: ['instagram', 'instagramlink', 'ig', 'iglink', 'insta', 'reel', 'reellink'],
  youtube: ['youtube', 'youtubelink', 'yt', 'ytlink', 'shorts', 'short'],
};
const normHeader = (h: string) => String(h).toLowerCase().replace(/[^a-z0-9]/g, '');
const fieldFor = (header: string): string | null => Object.entries(ALIASES).find(([, list]) => list.includes(normHeader(header)))?.[0] ?? null;

/** RFC 4180 rows with the given delimiter: quotes, doubled quotes, newlines inside quotes. */
export function splitDelimited(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell.trim() === '') {
      quoted = true;
      cell = '';
    } else if (ch === delim) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

interface TableShape {
  header: (string | null)[];
  rows: string[][];
}

function detectTable(text: string): TableShape | null {
  const first = text.split('\n').find((l) => l.trim());
  if (!first) return null;
  for (const delim of ['\t', ',', ';', '|']) {
    if (!first.includes(delim)) continue;
    const rows = splitDelimited(text, delim).filter((r) => r.some((c) => c.trim()));
    const header = rows[0]!.map(fieldFor);
    if (header.filter(Boolean).length >= 2) return { header, rows: rows.slice(1) };
  }
  return null;
}

// ---------------------------------------------------------------- grouping

type MegaCand = { type: 'mega'; mega: MegaLinkResult; raw: string };
type SocialCand = { type: 'instagram' | 'youtube'; url: string; raw: string };
type IgnoredCand = { type: 'ignored'; raw: string; why: string };
type Cand = MegaCand | SocialCand | IgnoredCand;

function classify(url: string): Cand {
  const mega = parseMegaUrl(url);
  if (mega.ok || mega.problem !== 'not-mega') return { type: 'mega', mega, raw: url };
  const ig = parseInstagram(url);
  if (ig.ok) return { type: 'instagram', url: ig.url, raw: url };
  if (ig.problem === 'not-a-post') return { type: 'ignored', raw: url, why: 'Instagram link that is not a post or reel' };
  const yt = parseYouTube(url);
  if (yt.ok) return { type: 'youtube', url: yt.url, raw: url };
  if (yt.problem === 'not-a-video') return { type: 'ignored', raw: url, why: 'YouTube link that is not a video' };
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    // not a link at all
  }
  return { type: 'ignored', raw: url, why: `not MEGA, Instagram or YouTube (${host || 'not a link'})` };
}

/** A keyless MEGA link plus a bare key elsewhere on the same line ("send the key separately") become one link. */
function joinSeparateKey(links: Cand[], rest: string): string {
  const keyless = links.find((l): l is MegaCand => l.type === 'mega' && !l.mega.ok && l.mega.problem === 'no-key');
  if (!keyless || keyless.mega.ok) return rest;
  const r = keyless.mega;
  const folder = r.kind === 'folder' || r.kind === 'folder-file';
  const m = (folder ? /(?<![\w-])[\w-]{22}(?![\w-])/ : /(?<![\w-])[\w-]{43}(?![\w-])/).exec(rest);
  if (!m || !r.handle) return rest;
  let link: ParsedMegaLink;
  if (r.kind === 'file') link = { kind: 'file', handle: r.handle, key43: m[0] };
  else if (r.kind === 'folder-file' && r.nodeHandle) link = { kind: 'folder-file', folderHandle: r.handle, folderKey22: m[0], nodeHandle: r.nodeHandle };
  else link = { kind: 'folder', folderHandle: r.handle, folderKey22: m[0] };
  keyless.mega = { ok: true, link };
  return rest.replace(m[0], ' ').replace(/\s{2,}/g, ' ').trim();
}

interface RawRow {
  line: number;
  mega: MegaLinkResult | null;
  instagram: string | null;
  youtube: string | null;
  label: string;
  fields: Record<string, string>;
  notes: string[];
}

const blankRow = (line: number): RawRow => ({ line, mega: null, instagram: null, youtube: null, label: '', fields: {}, notes: [] });

function attachSocial(row: RawRow, link: SocialCand): void {
  const k = link.type;
  if (row[k] && row[k] !== link.url) {
    row.notes.push(`extra ${k === 'instagram' ? 'Instagram' : 'YouTube'} link ignored: ${link.url}`);
    return;
  }
  row[k] = link.url;
}

interface Grouped {
  mode: ParsedImport['format'];
  rows: RawRow[];
  ignored: ParsedImport['ignored'];
}

function fromLines(lines: string[]): Grouped {
  const parsed = lines.map((text, i) => {
    const { urls, rest } = extractLinks(text);
    const links = urls.map(classify);
    const restAfterKey = joinSeparateKey(links, rest);
    return { n: i + 1, links, rest: restAfterKey, blank: !text.trim() };
  });
  const hasMega = (p: (typeof parsed)[number]) => p.links.some((l) => l.type === 'mega');
  const hasSocial = (p: (typeof parsed)[number]) => p.links.some((l) => l.type === 'instagram' || l.type === 'youtube');
  const sameLine = parsed.filter((p) => hasMega(p) && hasSocial(p)).length;
  const loneSocial = parsed.filter((p) => !hasMega(p) && hasSocial(p)).length;
  const mode = sameLine >= loneSocial ? 'line' : 'block';

  const rows: RawRow[] = [];
  const ignored: ParsedImport['ignored'] = [];
  let open: RawRow | null = null;
  let pendingLabel = '';
  let pendingSocial: { n: number; link: SocialCand }[] = [];

  const flushPending = () => {
    for (const s of pendingSocial) {
      const orphan = blankRow(s.n);
      attachSocial(orphan, s.link);
      rows.push(orphan);
    }
    pendingSocial = [];
    if (pendingLabel && open && !open.label) open.label = pendingLabel;
    pendingLabel = '';
  };

  for (const p of parsed) {
    for (const l of p.links) if (l.type === 'ignored') ignored.push({ line: p.n, link: l.raw, reason: l.why });
    if (p.blank) {
      if (mode === 'block') {
        flushPending();
        open = null;
      }
      continue;
    }
    const megas = p.links.filter((l): l is MegaCand => l.type === 'mega');
    const socials = p.links.filter((l): l is SocialCand => l.type === 'instagram' || l.type === 'youtube');

    if (megas.length) {
      // One row per MEGA link on the line; social links pair in order only when the counts allow it.
      const lineRows: RawRow[] = megas.map((m) => ({ ...blankRow(p.n), mega: m.mega }));
      for (const kind of ['instagram', 'youtube'] as const) {
        const ofKind = socials.filter((s) => s.type === kind);
        if (ofKind.length === lineRows.length) ofKind.forEach((s, i) => attachSocial(lineRows[i]!, s));
        else if (lineRows.length === 1) ofKind.forEach((s) => attachSocial(lineRows[0]!, s));
        else ofKind.forEach((s) => lineRows[0]!.notes.push(`could not tell which video this ${kind} link belongs to: ${s.url}`));
      }
      if (p.rest && lineRows.length === 1) lineRows[0]!.label = p.rest;
      else if (pendingLabel && lineRows.length === 1) lineRows[0]!.label = pendingLabel;
      pendingLabel = '';
      if (mode === 'block') for (const s of pendingSocial) attachSocial(lineRows[0]!, s.link);
      pendingSocial = [];
      rows.push(...lineRows);
      open = mode === 'line' || lineRows.length !== 1 ? null : lineRows[0]!;
      continue;
    }

    if (socials.length) {
      if (mode === 'line') {
        const orphan = blankRow(p.n);
        socials.forEach((s) => attachSocial(orphan, s));
        orphan.label = p.rest;
        rows.push(orphan);
      } else {
        for (const s of socials) {
          if (open && !open[s.type]) attachSocial(open, s);
          else pendingSocial.push({ n: p.n, link: s });
        }
      }
      continue;
    }

    // A line of text only: the title of the next video (or of the open one, at the end of a block).
    if (p.rest) {
      if (mode === 'line') pendingLabel = p.rest;
      else if (pendingLabel && open && !open.label) {
        open.label = pendingLabel;
        pendingLabel = p.rest;
      } else pendingLabel = p.rest;
    }
  }
  flushPending();
  return { mode, rows, ignored };
}

function fromTable({ header, rows: cells }: TableShape, firstLine = 2): Grouped {
  const rows: RawRow[] = [];
  const ignored: ParsedImport['ignored'] = [];
  cells.forEach((cellsOfRow, i) => {
    const n = i + firstLine;
    const row = blankRow(n);
    const megas: MegaCand[] = [];
    cellsOfRow.forEach((cell, c) => {
      const field = header[c] ?? null;
      const { urls, rest } = extractLinks(cell);
      const links = urls.map(classify);
      const restAfterKey = joinSeparateKey(links, rest);
      for (const l of links) {
        if (l.type === 'mega') megas.push(l);
        else if (l.type === 'ignored') ignored.push({ line: n, link: l.raw, reason: l.why });
        else attachSocial(row, l);
      }
      if (!urls.length && field && !['mega', 'instagram', 'youtube'].includes(field) && cell.trim()) row.fields[field] = cell.trim();
      else if (urls.length && restAfterKey && field === 'title') row.fields.title = restAfterKey;
    });
    if (megas.length) {
      row.mega = megas[0]!.mega;
      for (const extra of megas.slice(1)) row.notes.push(`extra MEGA link ignored: ${extra.raw}`);
    }
    if (row.mega || row.instagram || row.youtube) rows.push(row);
  });
  return { mode: 'table', rows, ignored };
}

function fromJson(text: string): Grouped | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    data = o.videos ?? o.items ?? o.rows ?? o.data ?? null;
  }
  if (!Array.isArray(data)) return null;
  if (data.every((x) => typeof x === 'string')) return fromLines(data as string[]);
  const keys = [...new Set(data.flatMap((o) => (o && typeof o === 'object' ? Object.keys(o) : [])))];
  const header = keys.map(fieldFor);
  const table = fromTable({ header, rows: data.map((o) => keys.map((k) => (o?.[k] == null ? '' : String(o[k])))) });
  return { ...table, mode: 'json' };
}

// ---------------------------------------------------------------- entry point

function keylessLink(r: Extract<MegaLinkResult, { ok: false }>): string | null {
  if (r.problem !== 'no-key' || !r.handle) return null;
  if (r.kind === 'file') return `https://mega.nz/file/${r.handle}`;
  if (r.kind === 'folder-file' && r.nodeHandle) return `https://mega.nz/folder/${r.handle}#/file/${r.nodeHandle}`;
  return `https://mega.nz/folder/${r.handle}`;
}

function aspectFrom(value: string | undefined): VideoAspect | null {
  if (!value) return null;
  if (/land|horiz|16:9|wide/i.test(value)) return 'landscape';
  if (/vert|port|9:16|reel|short/i.test(value)) return 'vertical';
  return null;
}

/**
 * Parses whatever the founder pastes or uploads. Returns one candidate row per MEGA file link, MEGA folder link (expanded
 * later by the server) or unpaired Instagram/YouTube link, with every problem as a status, never as an exception.
 */
export function parseImport(input: string): ParsedImport {
  const text = String(input ?? '')
    .replace(/^﻿/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/^sep=.\n/i, '');
  const trimmed = text.trim();
  const table = detectTable(text);
  const result: Grouped = (trimmed.startsWith('[') || trimmed.startsWith('{') ? fromJson(trimmed) : null) ?? (table ? fromTable(table) : null) ?? fromLines(text.split('\n'));

  const seen = new Map<string, string>();
  let megaOnly = 0;
  const rows: ParsedImportRow[] = result.rows.map((r, i) => {
    const row: ParsedImportRow = {
      rowId: `r${i + 1}`,
      line: r.line,
      status: 'ok',
      mega: null,
      handle: null,
      megaKind: null,
      instagram: r.instagram,
      youtube: r.youtube,
      title: '',
      titleFrom: 'none',
      brand: '',
      category: null,
      platform: null,
      views: 0,
      uploadDate: null,
      aspect: null,
      notes: r.notes,
      duplicateOf: null,
    };
    if (r.mega) {
      if (r.mega.ok) {
        row.megaKind = r.mega.link.kind;
        row.mega = canonicalMegaLink(r.mega.link);
        if (r.mega.link.kind === 'folder') row.status = 'folder';
        else row.handle = r.mega.link.kind === 'file' ? r.mega.link.handle : r.mega.link.nodeHandle;
        if (!row.instagram && !row.youtube) megaOnly++;
      } else {
        row.megaKind = r.mega.kind ?? null;
        row.status = r.mega.problem === 'no-key' ? 'no-key' : 'invalid';
        row.mega = keylessLink(r.mega);
      }
    } else row.status = 'needs-mega';

    const f = r.fields;
    if (f.title) {
      row.title = cleanText(f.title).slice(0, 140);
      row.titleFrom = 'column';
    } else if (r.label) {
      row.title = cleanText(r.label).slice(0, 140);
      row.titleFrom = 'text';
    }
    row.brand = cleanText(f.brand ?? '').slice(0, 60);
    row.category = f.category ? cleanText(f.category).slice(0, 40) || null : null;
    row.platform = f.platform ? cleanText(f.platform).slice(0, 40) || null : null;
    if (f.views !== undefined) {
      const v = parseViews(f.views);
      if (v === undefined) row.notes.push(`views "${f.views}" is not a number; left at 0`);
      row.views = v ?? 0;
    }
    if (f.uploadDate !== undefined) {
      const ud = parseUploadDate(f.uploadDate);
      if (ud === undefined) row.notes.push(`upload date "${f.uploadDate}" is not a date; left blank (write it as 2026-11-10 or 10/11/2026)`);
      else if (ud && isFutureDay(ud)) row.notes.push(`upload date "${f.uploadDate}" is in the future; left blank`);
      row.uploadDate = ud && !isFutureDay(ud) ? ud : null;
    }
    row.aspect = aspectFrom(f.aspect);

    for (const key of [row.handle && `m:${row.handle}`, row.instagram && `i:${row.instagram}`, row.youtube && `y:${row.youtube}`]) {
      if (!key) continue;
      if (seen.has(key) && row.status !== 'duplicate-in-file') {
        row.status = 'duplicate-in-file';
        row.duplicateOf = seen.get(key)!;
      } else if (!seen.has(key)) seen.set(key, row.rowId);
    }
    return row;
  });

  // Two lists one after the other (all MEGA links, then all Instagram links): offered as a button, never done silently.
  const pairable: ParsedImport['pairable'] = {};
  for (const kind of ['instagram', 'youtube'] as const) {
    const other = kind === 'instagram' ? 'youtube' : 'instagram';
    const orphans = rows.filter((r) => r.status === 'needs-mega' && r[kind] && !r[other]).length;
    if (orphans >= 2 && orphans === megaOnly) pairable[kind] = orphans;
  }
  return { format: result.mode, rows, ignored: result.ignored, pairable };
}

/**
 * "Pair the N Instagram links with the N MEGA links in order": the i-th row with a MEGA link and no social link takes the
 * i-th row that has only that kind of link, and those rows go. Returns the rows unchanged when the counts differ.
 */
export function pairInOrder<T extends { mega: string | null; instagram: string | null; youtube: string | null; status: string; handle?: string | null }>(rows: T[], kind: 'instagram' | 'youtube'): T[] {
  const other = kind === 'instagram' ? 'youtube' : 'instagram';
  const targets = rows.filter((r) => r.mega && r.status !== 'no-key' && r.status !== 'invalid' && r.status !== 'needs-mega' && !r.instagram && !r.youtube);
  const sources = rows.filter((r) => r.status === 'needs-mega' && r[kind] && !r[other]);
  if (!targets.length || targets.length !== sources.length) return rows;
  const take = new Map(targets.map((t, i) => [t, sources[i]![kind]]));
  const drop = new Set<T>(sources);
  return rows.filter((r) => !drop.has(r)).map((r) => (take.has(r) ? { ...r, [kind]: take.get(r) } : r));
}

/**
 * The import status a MEGA check gives a row (admin brief 3.5, V2-SPEC 2.8): ready, heavy, too-heavy, unknown-quality,
 * unplayable (HEVC or an unknown video codec), busy (over quota, busy, upstream), unreachable, not-video or invalid.
 */
export function importStatusOf(check: MegaInspect): ImportStatus {
  if (!check.ok) {
    if (check.problem === 'busy' || check.problem === 'over-quota' || check.problem === 'upstream') return 'busy';
    if (check.problem === 'not-video') return 'not-video';
    if (check.problem === 'no-key') return 'no-key';
    if (check.problem === 'not-mega' || check.problem === 'bad-link' || check.problem === 'folder') return 'invalid';
    return 'unreachable';
  }
  if (!check.playable) return 'unplayable';
  if (check.grade === 'ready') return 'ready';
  if (check.grade === 'heavy') return 'heavy';
  if (check.grade === 'too-heavy') return 'too-heavy';
  return 'unknown-quality';
}

/** Ticked by default: every row MEGA could read, whatever its weight or codec (those are warnings, not blocks). */
export function isDefaultSelected(status: ImportStatus): boolean {
  return status === 'ready' || status === 'heavy' || status === 'too-heavy' || status === 'unknown-quality' || status === 'unplayable';
}

/** Statuses whose row can never be ticked (admin brief 3.5: "no, and disabled"). */
export const IMPORT_DISABLED_STATUSES: readonly ImportStatus[] = ['unreachable', 'not-video', 'invalid', 'duplicate-in-file', 'folder-limit'];
