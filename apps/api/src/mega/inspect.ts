/**
 * Checks a MEGA link the admin pasted (V2-SPEC 2.4.7, admin brief 4.4): parse, reuse a check under 24 hours old, resolve with
 * 'g' (a file in a folder lists the folder once for its key), allowlist the storage host, sniff the header, grade it, and
 * remember the result in mega_probes so the preview, a save and an import commit never ask MEGA again.
 *
 * `megaColumns` is the one writer of every mega_* column of `videos`.
 */
import {
  canonicalMegaLink,
  gradeLabel,
  isPlayable,
  megaStreamHandle,
  megaWarnings,
  parseMegaLink,
  streamGrade,
  titleFromFileName,
  type MegaInspect,
  type MegaMeta,
  type MegaProblem,
  type ParsedMegaLink,
  type VideoAspect,
} from '@kreators/shared';
import type { Env } from '../env';
import { previewOkFromMeta } from '../videoRows';
import { b64urlDecode, b64urlEncode, decryptAt, fetchCipher, fileCipher, folderFileKey, getFile, listFolder, megaClient, MegaError, videoFiles, type FileAddr, type MegaClient } from './protocol';
import { metaForD1, parseSniffMeta, sniff, type SniffMeta } from './sniff';

const DAY_MS = 24 * 3600 * 1000;
const TRANSIENT = new Set<string>(['busy', 'over-quota', 'upstream']);
/** Problems that make a link unusable: a save is refused with 422 mega-unusable. */
export const UNUSABLE = new Set<string>(['not-found', 'removed', 'blocked', 'bad-key', 'not-video', 'bad-link', 'no-key', 'not-mega', 'folder']);

export const PROBLEM_MESSAGES: Record<MegaProblem, string> = {
  'not-mega': "That isn't a MEGA file link.",
  'no-key': 'This link has no key. Copy it again from MEGA with the key included.',
  'bad-key': "This link's key doesn't open the file.",
  'bad-link': "That isn't a MEGA file link.",
  folder: "That's a folder. Use Import links to add every video in it.",
  'not-found': 'MEGA says this file is gone.',
  removed: 'MEGA says this file was removed.',
  blocked: 'MEGA has taken this file down.',
  'over-quota': "MEGA's transfer limit is used up for now. Try again later.",
  busy: 'MEGA is busy. Try again in a minute.',
  upstream: "Couldn't reach MEGA. Check again in a minute.",
  'not-video': "This file isn't an MP4 or MOV video.",
};

export interface ProbeRow {
  handle: string;
  link: string;
  file_key: string | null;
  name: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  bitrate: number | null;
  codec: string | null;
  fast_start: number | null;
  error: string | null;
  meta: string | null;
  checked_at: number;
}

/** The mega_* columns of `videos` for a link, as one object (null values clear a column). */
export interface MegaColumns {
  mega_handle: string | null;
  mega_url: string | null;
  mega_key: string | null;
  mega_name: string | null;
  mega_size: number | null;
  mega_width: number | null;
  mega_height: number | null;
  mega_duration_ms: number | null;
  mega_bitrate: number | null;
  mega_codec: string | null;
  mega_fast_start: number | null;
  mega_meta: string | null;
  mega_checked_at: string | null;
  mega_error: string | null;
}

export const NO_MEGA: MegaColumns = {
  mega_handle: null,
  mega_url: null,
  mega_key: null,
  mega_name: null,
  mega_size: null,
  mega_width: null,
  mega_height: null,
  mega_duration_ms: null,
  mega_bitrate: null,
  mega_codec: null,
  mega_fast_start: null,
  mega_meta: null,
  mega_checked_at: null,
  mega_error: null,
};

export interface InspectOutcome {
  inspect: MegaInspect;
  /** The probe row as stored (null for a link-level problem, which is never stored). */
  probe: ProbeRow | null;
}

/** SQLite's datetime('now') format, UTC. */
export const sqlTime = (ms: number) => new Date(ms).toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

const pos = (n: number | null | undefined, max = Number.MAX_SAFE_INTEGER) => (typeof n === 'number' && n > 0 && n <= max ? Math.round(n) : null);

function metaFromProbe(p: ProbeRow): MegaMeta {
  return {
    name: p.name,
    size: p.size ?? 0,
    width: p.width,
    height: p.height,
    durationMs: p.duration_ms,
    bitrate: p.bitrate,
    codec: p.codec,
    fastStart: p.fast_start === null ? null : p.fast_start === 1,
  };
}

function aspectOf(meta: MegaMeta): VideoAspect | null {
  if (!meta.width || !meta.height) return null;
  return meta.height >= meta.width ? 'vertical' : 'landscape';
}

/** Turns a stored probe row into the MegaInspect the admin sees (no D1 read: the duplicate is passed in). */
export function buildInspect(link: Exclude<ParsedMegaLink, { kind: 'folder' }>, p: ProbeRow, cached: boolean, duplicate: { id: string; title: string; inBin: boolean } | null): MegaInspect {
  const handle = megaStreamHandle(link)!;
  if (p.error) return { ok: false, problem: p.error as MegaProblem, message: PROBLEM_MESSAGES[p.error as MegaProblem] ?? 'MEGA refused this file.', handle };
  const meta = metaFromProbe(p);
  return {
    ok: true,
    handle,
    kind: link.kind,
    canonical: canonicalMegaLink(link),
    meta,
    grade: streamGrade(meta),
    warnings: megaWarnings(meta),
    playable: isPlayable(meta),
    previewOk: previewOkFromMeta(parseSniffMeta(p.meta)),
    suggestedTitle: titleFromFileName(meta.name),
    suggestedAspect: aspectOf(meta),
    previewUrl: `/media/mega-${handle}.mp4`,
    embedUrl: link.kind === 'file' ? `https://mega.nz/embed/${link.handle}#${link.key43}` : null,
    duplicate,
    checkedAt: new Date(p.checked_at).toISOString(),
    cached,
  };
}

async function fromProbe(db: D1Database, link: Exclude<ParsedMegaLink, { kind: 'folder' }>, p: ProbeRow, cached: boolean, videoId?: string): Promise<MegaInspect> {
  const handle = megaStreamHandle(link)!;
  const dup = p.error
    ? null
    : await db.prepare('SELECT id, title, deleted_at FROM videos WHERE mega_handle = ? AND id <> ?').bind(handle, videoId ?? '').first<{ id: string; title: string; deleted_at: string | null }>();
  return buildInspect(link, p, cached, dup ? { id: dup.id, title: dup.title, inBin: !!dup.deleted_at } : null);
}

/** A completed check that may be reused: facts, or a problem that is not MEGA being busy. */
export const reusable = (p: ProbeRow | null): p is ProbeRow => !!p && (p.meta !== null || (p.error !== null && !TRANSIENT.has(p.error)));

/** Reads plaintext [a, z] straight from MEGA storage (sniffing; never the chunk cache). */
function directReader(client: MegaClient, url: string, fileKey: Uint8Array) {
  const cipherP = fileCipher(fileKey);
  return async (a: number, z: number) => {
    const from = a - (a % 16);
    const res = await fetchCipher(client, url, from, z);
    const plain = await decryptAt(await cipherP, new Uint8Array(await res.arrayBuffer()), from);
    return plain.subarray(a - from);
  };
}

async function upsertProbe(db: D1Database, p: ProbeRow): Promise<void> {
  await db
    .prepare(
      `INSERT INTO mega_probes (handle, link, file_key, name, size, width, height, duration_ms, bitrate, codec, fast_start, error, meta, checked_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
       ON CONFLICT(handle) DO UPDATE SET link = excluded.link, file_key = excluded.file_key, name = excluded.name, size = excluded.size,
         width = excluded.width, height = excluded.height, duration_ms = excluded.duration_ms, bitrate = excluded.bitrate, codec = excluded.codec,
         fast_start = excluded.fast_start, error = excluded.error, meta = excluded.meta, checked_at = excluded.checked_at`,
    )
    .bind(p.handle, p.link, p.file_key, p.name, p.size, p.width, p.height, p.duration_ms, p.bitrate, p.codec, p.fast_start, p.error, p.meta, p.checked_at)
    .run();
}

function prune(db: D1Database, ctx: { waitUntil(p: Promise<unknown>): void } | undefined): void {
  const job = db.prepare('DELETE FROM mega_probes WHERE checked_at < ?').bind(Date.now() - DAY_MS).run().catch(() => undefined);
  if (ctx) ctx.waitUntil(job);
}

/** A fresh probe row for the same canonical link (under 24 hours), if there is one. */
export async function freshProbe(db: D1Database, handle: string, canonical: string): Promise<ProbeRow | null> {
  return db.prepare('SELECT * FROM mega_probes WHERE handle = ? AND link = ? AND checked_at > ?').bind(handle, canonical, Date.now() - DAY_MS).first<ProbeRow>();
}

/** A fresh probe row for a handle, whatever its link (the admin's unsaved preview at /media/mega-<h>.mp4). */
export async function probeForHandle(db: D1Database, handle: string): Promise<ProbeRow | null> {
  return db.prepare('SELECT * FROM mega_probes WHERE handle = ? AND checked_at > ?').bind(handle, Date.now() - DAY_MS).first<ProbeRow>();
}

/**
 * inspect(env, ctx, link, { refresh }): the admin's check of a link. A link-level problem answers at once (never stored); a
 * fresh check of the same canonical link is reused unless `refresh` (a transient MEGA error is never reused).
 */
export async function inspect(env: Env, ctx: { waitUntil(p: Promise<unknown>): void } | undefined, input: string, opts: { refresh?: boolean; videoId?: string; client?: MegaClient } = {}): Promise<InspectOutcome> {
  const parsed = parseMegaLink(input);
  if (!parsed.ok) return { inspect: { ok: false, problem: parsed.problem, message: PROBLEM_MESSAGES[parsed.problem], ...(parsed.handle ? { handle: parsed.handle } : {}) }, probe: null };
  const link = parsed.link;
  if (link.kind === 'folder') return { inspect: { ok: false, problem: 'folder', message: PROBLEM_MESSAGES.folder }, probe: null };
  return inspectParsed(env, ctx, link, opts);
}

export async function inspectParsed(env: Env, ctx: { waitUntil(p: Promise<unknown>): void } | undefined, link: Exclude<ParsedMegaLink, { kind: 'folder' }>, opts: { refresh?: boolean; videoId?: string; client?: MegaClient } = {}): Promise<InspectOutcome> {
  const db = env.DB;
  const canonical = canonicalMegaLink(link);
  const handle = megaStreamHandle(link)!;
  const existing = await freshProbe(db, handle, canonical);
  if (!opts.refresh && reusable(existing)) {
    return { inspect: await fromProbe(db, link, existing, true, opts.videoId), probe: existing };
  }

  const client = opts.client ?? megaClient(env);
  const now = Date.now();
  const probe: ProbeRow = { handle, link: canonical, file_key: null, name: null, size: null, width: null, height: null, duration_ms: null, bitrate: null, codec: null, fast_start: null, error: null, meta: null, checked_at: now };
  try {
    let fileKey: Uint8Array;
    let addr: FileAddr;
    if (link.kind === 'file') {
      fileKey = b64urlDecode(link.key43);
      addr = { p: link.handle };
    } else {
      const known = existing?.file_key ? b64urlDecode(existing.file_key) : null;
      fileKey = known && known.length === 32 ? known : (await folderFileKey(client, link.folderHandle, b64urlDecode(link.folderKey22), link.nodeHandle)).key;
      probe.file_key = b64urlEncode(fileKey);
      addr = { n: link.nodeHandle, folder: link.folderHandle };
    }
    const resolved = await getFile(client, addr, fileKey);
    probe.name = resolved.name ? resolved.name.slice(0, 255) : null;
    probe.size = resolved.size;
    const info = await sniff(directReader(client, resolved.url, fileKey), resolved.size);
    if (!info.isoBmff || (info.moov && !info.video)) {
      probe.error = 'not-video';
    } else {
      const sm: SniffMeta = metaForD1(info);
      probe.width = pos(info.width, 16384);
      probe.height = pos(info.height, 16384);
      probe.duration_ms = pos(info.durationS ? info.durationS * 1000 : null);
      probe.bitrate = pos(info.durationS ? (resolved.size * 8) / info.durationS : null);
      probe.codec = info.video ? `${info.video.fourcc}${info.audio ? `+${info.audio.fourcc}` : ''}`.slice(0, 40) : null;
      probe.fast_start = info.moov ? (info.moov.at === 'start' ? 1 : 0) : null;
      probe.meta = JSON.stringify(sm);
    }
  } catch (err) {
    if (!(err instanceof MegaError)) throw err;
    probe.error = err.kind;
    console.log('mega.inspect', JSON.stringify({ handle, error: err.kind, code: err.code ?? null }));
    if (TRANSIENT.has(err.kind)) {
      await upsertProbe(db, probe).catch(() => undefined);
      prune(db, ctx);
      const out: MegaInspect = { ok: false, problem: err.kind as MegaProblem, message: PROBLEM_MESSAGES[err.kind as MegaProblem], handle, ...(err.retryAfter ? { retryAfter: Math.min(3600, Math.max(30, err.retryAfter)) } : {}) };
      return { inspect: out, probe };
    }
  }
  await upsertProbe(db, probe);
  prune(db, ctx);
  return { inspect: await fromProbe(db, link, probe, false, opts.videoId), probe };
}

/**
 * The mega_* columns for a saved link, from its probe: the facts and sniff JSON for a check that worked, or only the link and
 * mega_error when MEGA could not be reached (V11 "Check again" fills them later). The caller refuses unusable links first.
 */
export function megaColumns(link: Exclude<ParsedMegaLink, { kind: 'folder' }>, probe: ProbeRow | null): MegaColumns {
  const handle = megaStreamHandle(link)!;
  const ok = probe && !probe.error;
  return {
    mega_handle: handle,
    mega_url: canonicalMegaLink(link),
    mega_key: link.kind === 'folder-file' ? (probe?.file_key ?? null) : null,
    mega_name: ok ? probe.name : null,
    mega_size: ok ? probe.size : null,
    mega_width: ok ? probe.width : null,
    mega_height: ok ? probe.height : null,
    mega_duration_ms: ok ? probe.duration_ms : null,
    mega_bitrate: ok ? probe.bitrate : null,
    mega_codec: ok ? probe.codec : null,
    mega_fast_start: ok ? probe.fast_start : null,
    mega_meta: ok ? probe.meta : null,
    mega_checked_at: probe ? sqlTime(probe.checked_at) : null,
    mega_error: probe?.error ?? null,
  };
}

/** The grade line for a saved warning list ("heavy" and "too-heavy" are warnings, never blocks). */
export function gradeWarning(meta: MegaMeta | null): { code: string; message: string } | null {
  if (!meta) return null;
  const grade = streamGrade(meta);
  return grade === 'heavy' || grade === 'too-heavy' ? { code: grade, message: gradeLabel(grade, meta) } : null;
}

export interface FolderFile {
  /** The node handle (what a row stores in mega_handle). */
  handle: string;
  name: string;
  size: number;
  path: string[];
  playable: 'video' | 'unsupported-container';
  /** Canonical folder-file link (admin only). */
  canonical: string;
}

/**
 * Lists a public folder for an import dry run: one 'f' call, files under the subfolder if one was given, natural name order,
 * at most `max` files. Each video's recovered key and canonical link go into mega_probes, so the per-row inspect skips the
 * listing. Unverified against a real MEGA folder (V2-SPEC 2.4.6).
 */
export async function expandFolder(env: Env, link: Extract<ParsedMegaLink, { kind: 'folder' }>, max = 200, client: MegaClient = megaClient(env)): Promise<{ root: string | null; files: FolderFile[]; truncated: number }> {
  const listing = await listFolder(client, link.folderHandle, b64urlDecode(link.folderKey22));
  const all = videoFiles(listing, link.subfolder);
  const files: FolderFile[] = all.slice(0, max).map((f) => ({
    handle: f.handle,
    name: f.name!,
    size: f.size,
    path: f.path,
    playable: f.playable,
    canonical: canonicalMegaLink({ kind: 'folder-file', folderHandle: link.folderHandle, folderKey22: link.folderKey22, nodeHandle: f.handle }),
  }));
  const keyOf = new Map(all.map((f) => [f.handle, f.key!]));
  const now = Date.now();
  const stmts = files
    .filter((f) => f.playable === 'video' && /^[\w-]{8}$/.test(f.handle))
    .map((f) =>
      env.DB.prepare(
        `INSERT INTO mega_probes (handle, link, file_key, name, size, checked_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(handle) DO UPDATE SET link = excluded.link, file_key = excluded.file_key, name = excluded.name, size = excluded.size,
           width = NULL, height = NULL, duration_ms = NULL, bitrate = NULL, codec = NULL, fast_start = NULL, error = NULL, meta = NULL,
           checked_at = excluded.checked_at
         WHERE mega_probes.link <> excluded.link OR (mega_probes.meta IS NULL AND mega_probes.error IS NULL) OR mega_probes.checked_at < ?7`,
      ).bind(f.handle, f.canonical, b64urlEncode(keyOf.get(f.handle)!), f.name.slice(0, 255), f.size, now, now - DAY_MS),
    );
  if (stmts.length) await env.DB.batch(stmts);
  return { root: listing.root.name, files, truncated: Math.max(0, all.length - max) };
}
