/**
 * Which MEGA file a /media URL streams (V2-SPEC 2.4.1).
 *  /media/v/<id>.mp4       the library row by id.
 *  /media/mega-<h>.mp4     the library row by handle (the live v1.5 address keeps working from the same row).
 * The key comes from the row's mega_url (file link), its mega_key (file in a folder) or, only while mega_url is NULL, the
 * MEGA_LINKS line with the same handle (the legacy row until the admin adopts its key). MEGA_LINKS is read for nothing else.
 * The browser only ever sees same-origin URLs; links and keys stay in D1 or the secret.
 */
import { findMegaLinks, parseMegaLink } from '@kreators/shared';
import { b64urlDecode, handleTag, sha256Hex } from './protocol';
import { parseSniffMeta } from './sniff';
import type { StreamSource } from './stream';

/** The columns the stream needs. */
export interface StreamRow {
  id: string;
  mega_handle: string | null;
  mega_url: string | null;
  /** base64url 32-byte node key of a file inside a shared folder (saved at add time so plays skip the listing). */
  mega_key: string | null;
  mega_size: number | null;
  /** JSON from sniff.metaForD1. */
  mega_meta: string | null;
  published: number;
  deleted_at: string | null;
  /** The bundled copy, for the failure answer's `fallback`. */
  file_ref: string | null;
}

const COLUMNS = 'id, mega_handle, mega_url, mega_key, mega_size, mega_meta, published, deleted_at, file_ref';
const ROW_TTL_MS = 60_000;
const MAX_ROWS = 500;
const rows = new Map<string, { row: StreamRow; at: number }>();
export const lookupCounters = { d1: 0, hit: 0 };

/** Every admin write in this isolate calls this; other isolates catch up within 60 s (the ?v tag protects browsers). */
export function forgetRows(): void {
  rows.clear();
}

const isPublic = (row: StreamRow) => row.published === 1 && !row.deleted_at;

/** Per isolate, 60 s, at most 500 entries, published rows only (a draft is always read fresh). */
async function cached(key: string, load: () => Promise<StreamRow | null>): Promise<StreamRow | null> {
  const hit = rows.get(key);
  if (hit && Date.now() - hit.at < ROW_TTL_MS) {
    lookupCounters.hit++;
    return hit.row;
  }
  lookupCounters.d1++;
  const row = await load();
  if (row && isPublic(row)) {
    if (rows.size >= MAX_ROWS) rows.clear();
    rows.set(key, { row, at: Date.now() });
  } else rows.delete(key);
  return row;
}

export function rowById(db: D1Database, id: string): Promise<StreamRow | null> {
  return cached(`id:${id}`, () => db.prepare(`SELECT ${COLUMNS} FROM videos WHERE id = ?`).bind(id).first<StreamRow>());
}

export function rowByHandle(db: D1Database, handle: string): Promise<StreamRow | null> {
  return cached(`h:${handle}`, () => db.prepare(`SELECT ${COLUMNS} FROM videos WHERE mega_handle = ?`).bind(handle).first<StreamRow>());
}

function previewEnds(meta: string | null): Record<string, number> | undefined {
  return parseSniffMeta(meta)?.prev;
}

/** The key of a legacy row from the MEGA_LINKS secret: only a plain file link whose handle matches. */
export function keyFromSecret(handle: string, links: string | undefined): string | null {
  if (!links) return null;
  for (const found of findMegaLinks(links)) if (found.ok && found.link.kind === 'file' && found.link.handle === handle) return found.link.key43;
  return null;
}

/** Builds the stream source of a row: null when its link does not parse, or a legacy key is missing from the secret. */
export function sourceFromRow(row: StreamRow, env: { MEGA_LINKS?: string }): StreamSource | null {
  if (!row.mega_handle) return null;
  const size = row.mega_size ?? 0;
  const prev = previewEnds(row.mega_meta);
  if (!row.mega_url) {
    const key = keyFromSecret(row.mega_handle, env.MEGA_LINKS);
    if (!key) return null;
    return { tag: row.mega_handle, addr: { p: row.mega_handle }, fileKey: b64urlDecode(key), size, previewEnds: prev };
  }
  const parsed = parseMegaLink(row.mega_url);
  if (!parsed.ok) return null;
  const link = parsed.link;
  if (link.kind === 'file' && link.handle === row.mega_handle) return { tag: handleTag(link), addr: { p: link.handle }, fileKey: b64urlDecode(link.key43), size, previewEnds: prev };
  if (link.kind === 'folder-file' && link.nodeHandle === row.mega_handle && row.mega_key) {
    const fileKey = b64urlDecode(row.mega_key);
    if (fileKey.length !== 32) return null;
    return { tag: handleTag(link), addr: { n: link.nodeHandle, folder: link.folderHandle }, fileKey, size, previewEnds: prev };
  }
  return null;
}

/** A probe row (an unsaved link the admin is previewing) as a stream source. */
export function sourceFromProbe(probe: { handle: string; link: string; file_key: string | null; size: number | null; meta: string | null }): StreamSource | null {
  const parsed = parseMegaLink(probe.link);
  if (!parsed.ok) return null;
  const link = parsed.link;
  const prev = previewEnds(probe.meta);
  if (link.kind === 'file' && link.handle === probe.handle) return { tag: handleTag(link), addr: { p: link.handle }, fileKey: b64urlDecode(link.key43), size: probe.size ?? 0, previewEnds: prev };
  if (link.kind === 'folder-file' && link.nodeHandle === probe.handle && probe.file_key) {
    return { tag: handleTag(link), addr: { n: link.nodeHandle, folder: link.folderHandle }, fileKey: b64urlDecode(probe.file_key), size: probe.size ?? 0, previewEnds: prev };
  }
  return null;
}

const tags = new Map<string, Promise<string>>();

/**
 * The ?v= version of a stream URL: the first 8 hex characters of SHA-256 of the canonical mega_url, or of
 * "secret:<handle>" while the key is still in MEGA_LINKS. It changes whenever the row points at another file.
 */
export function streamTag(row: Pick<StreamRow, 'mega_handle' | 'mega_url'>): Promise<string> {
  const basis = row.mega_url ?? `secret:${row.mega_handle ?? ''}`;
  let p = tags.get(basis);
  if (!p) {
    if (tags.size >= MAX_ROWS) tags.clear();
    p = sha256Hex(basis, 8);
    tags.set(basis, p);
  }
  return p;
}

/** The public stream URL of a MEGA row (the only MEGA address /api/videos ever returns). Null for a row without a handle. */
export async function streamUrl(row: Pick<StreamRow, 'id' | 'mega_handle' | 'mega_url'>): Promise<string | null> {
  if (!row.mega_handle) return null;
  return `/media/v/${encodeURIComponent(row.id)}.mp4?v=${await streamTag(row)}`;
}
