// Owner: A4 Admin. The bulk import's state and its work (admin brief 3 and 5.5, V2-SPEC 2.8): read the links (I1), check every MEGA row three at a time
// in row order (M1, statuses from shared importStatusOf so they match the server), let the founder edit and tick rows, then import the ticked rows as
// drafts in commits of 50 (I2), re-checking rows the server could not check inline and re-reading the rest once after a 409 conflict. Kept in a store
// outside React, so leaving the screen, or the session sheet, never loses an import in progress.
import {
  IMPORT_DISABLED_STATUSES,
  IMPORT_LIMITS,
  importStatusOf,
  isDefaultSelected,
  joinMegaKey,
  canonicalMegaLink,
  megaStreamHandle,
  pairInOrder,
  parseImport,
  parseUploadDate,
  parseViews,
  type AdminVideo,
  type AdminVideoList,
  type ImportCommitResponse,
  type ImportCommitRow,
  type ImportPreview,
  type ImportRow,
  type ImportStatus,
  type MegaInspect,
} from '@kreators/shared';
import type { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { AdminApiError, adminApi, keys } from './api';

export interface UIRow extends ImportRow {
  /** The founder ticked or unticked it themselves: a later check keeps their choice. */
  touched: boolean;
  /** For a duplicate: skip it (default) or add this row's links to the existing video. */
  dupAction: 'skip' | 'fill';
  keyDraft: string;
  keyError: string | null;
  /** An M1 call for this row is in flight. */
  inFlight: boolean;
  /** Views as typed in the table. */
  viewsText: string;
  uploadDateText: string;
}

export interface ImportResult {
  created: AdminVideo[];
  updated: AdminVideo[];
  skipped: ImportCommitResponse['skipped'];
}

interface ImportState {
  step: 'add' | 'review' | 'done';
  text: string;
  fileName: string | null;
  reading: boolean;
  /** Rows of the browser's own parse, for the skeleton while I1 answers. */
  draftCount: number;
  readError: string | null;
  importId: string | null;
  format: ImportPreview['format'] | null;
  ignored: ImportPreview['ignored'];
  pairable: ImportPreview['pairable'];
  rows: UIRow[];
  collapsed: Record<string, boolean>;
  checkTotal: number;
  checkDone: number;
  committing: { done: number; total: number } | null;
  commitError: string | null;
  result: ImportResult | null;
  posters: { done: number; total: number; made: number; failed: number; running: boolean; stopped: boolean } | null;
  undone: { binned: number; kept: number } | null;
}

const initial: ImportState = {
  step: 'add',
  text: '',
  fileName: null,
  reading: false,
  draftCount: 0,
  readError: null,
  importId: null,
  format: null,
  ignored: [],
  pairable: {},
  rows: [],
  collapsed: {},
  checkTotal: 0,
  checkDone: 0,
  committing: null,
  commitError: null,
  result: null,
  posters: null,
  undone: null,
};

export const useImport = create<ImportState>(() => ({ ...initial }));
const get = () => useImport.getState();
const patch = (p: Partial<ImportState>) => useImport.setState(p);
const patchRow = (rowId: string, fn: (r: UIRow) => UIRow) => useImport.setState((s) => ({ rows: s.rows.map((r) => (r.rowId === rowId ? fn(r) : r)) }));

export const isDisabled = (r: Pick<ImportRow, 'status'>) => IMPORT_DISABLED_STATUSES.includes(r.status);
/** A duplicate can be ticked only to add its links to the video already in the library. */
export const canTick = (r: Pick<ImportRow, 'status' | 'duplicate'>) => !isDisabled(r) && (r.status !== 'duplicate' || !!r.duplicate?.canFillLinks);
/** A row the Import button sends: ticked, not disabled, not still checking, and a duplicate only when its links are to be added. */
export const isImportable = (r: UIRow) => r.selected && !isDisabled(r) && r.status !== 'checking' && !r.inFlight && (r.status !== 'duplicate' || r.dupAction === 'fill');

let queryClient: QueryClient | null = null;
export const bindQueryClient = (qc: QueryClient) => {
  queryClient = qc;
};

function toUI(r: ImportRow): UIRow {
  return { ...r, touched: false, dupAction: 'skip', keyDraft: '', keyError: null, inFlight: false, viewsText: r.views ? String(r.views) : '', uploadDateText: r.uploadDate ?? '' };
}

// ---------- Step 1 ----------

export function setText(text: string, fileName: string | null = get().fileName) {
  patch({ text, fileName, readError: null });
}

export function reset(keepText = false) {
  checkRun++;
  const text = keepText ? get().text : '';
  useImport.setState({ ...initial, text, fileName: keepText ? get().fileName : null });
}

export async function readLinks() {
  const { text, fileName } = get();
  if (!text.trim()) {
    patch({ readError: 'Paste the links or choose a file first.' });
    return;
  }
  if (text.length > IMPORT_LIMITS.chars) {
    patch({ readError: 'That file is too large to import at once (at most 1,000,000 characters). Split it in two.' });
    return;
  }
  let draftCount = 0;
  try {
    draftCount = parseImport(text).rows.length;
  } catch {
    draftCount = 0;
  }
  patch({ reading: true, readError: null, draftCount, step: 'review', rows: [], result: null, undone: null, posters: null, commitError: null });
  try {
    const preview = await adminApi.dryRun({ text, ...(fileName ? { fileName } : {}) });
    applyPreview(preview);
  } catch (e) {
    patch({ reading: false, step: 'add', readError: e instanceof AdminApiError ? e.message : "Couldn't read the links. Try again." });
  }
}

function applyPreview(preview: ImportPreview) {
  const rows = preview.rows.map(toUI);
  const toCheck = rows.filter((r) => r.status === 'checking' && r.mega).length;
  checkRun++;
  patch({
    reading: false,
    importId: preview.importId,
    format: preview.format,
    ignored: preview.ignored,
    pairable: preview.pairable,
    rows,
    collapsed: {},
    checkTotal: toCheck,
    checkDone: 0,
    step: 'review',
  });
  void runChecks();
}

// ---------- Checking, three at a time ----------

let checkRun = 0;
let inFlight = 0;
let drained: (() => void)[] = [];

const existingVideos = (): AdminVideo[] => queryClient?.getQueryData<AdminVideoList>(keys.videos(false))?.videos ?? [];

function applyCheck(rowId: string, check: MegaInspect) {
  patchRow(rowId, (r) => {
    let status: ImportStatus = importStatusOf(check);
    let duplicate = r.duplicate;
    if (check.ok && check.duplicate && !r.duplicate) {
      const target = existingVideos().find((v) => v.id === check.duplicate!.id);
      const canFillLinks = !!target && ((!!r.instagram && !target.instagramUrl) || (!!r.youtube && !target.youtubeUrl));
      status = 'duplicate';
      duplicate = { ...check.duplicate, canFillLinks };
    }
    const next: UIRow = { ...r, check, status, duplicate, inFlight: false };
    if (check.ok) {
      next.fileName = check.meta.name ?? r.fileName;
      next.size = check.meta.size ?? r.size;
      next.handle = check.handle;
      next.mega = check.canonical;
      next.megaKind = check.kind;
      if (!r.title.trim() && check.suggestedTitle) {
        next.title = check.suggestedTitle;
        next.titleFrom = 'file-name';
      }
      next.aspect = r.aspect ?? check.suggestedAspect;
    }
    next.selected = r.touched ? r.selected && !isDisabled(next) : isDefaultSelected(status);
    return next;
  });
  useImport.setState((s) => ({ checkDone: Math.min(s.checkTotal, s.checkDone + 1) }));
}

/** Starts (or continues) the checks; resolves once no row is left checking. */
export function runChecks(): Promise<void> {
  const run = checkRun;
  const promise = new Promise<void>((resolve) => drained.push(resolve));
  const pump = () => {
    if (run !== checkRun) return;
    while (inFlight < 3) {
      const next = get().rows.find((r) => r.status === 'checking' && r.mega && !r.inFlight);
      if (!next) break;
      inFlight++;
      patchRow(next.rowId, (r) => ({ ...r, inFlight: true }));
      adminApi
        .inspect(next.mega!)
        .then((check) => {
          if (run === checkRun) applyCheck(next.rowId, check);
        })
        .catch((e: unknown) => {
          if (run !== checkRun) return;
          const message = e instanceof AdminApiError ? e.message : "Couldn't check this link.";
          applyCheck(next.rowId, { ok: false, problem: 'busy', message });
        })
        .finally(() => {
          inFlight--;
          pump();
        });
    }
    if (inFlight === 0 && !get().rows.some((r) => r.status === 'checking' && r.mega)) {
      const list = drained;
      drained = [];
      for (const fn of list) fn();
    }
  };
  pump();
  return promise;
}

function recheck(rowIds: string[]) {
  const set = new Set(rowIds);
  useImport.setState((s) => ({
    rows: s.rows.map((r) => (set.has(r.rowId) && r.mega ? { ...r, status: 'checking' as const, check: null, inFlight: false } : r)),
    checkTotal: (s.checkTotal === s.checkDone ? 0 : s.checkTotal) + rowIds.length,
    checkDone: s.checkTotal === s.checkDone ? 0 : s.checkDone,
  }));
  return runChecks();
}

export const retryRow = (rowId: string) => void recheck([rowId]);
export const retryAllBusy = () => void recheck(get().rows.filter((r) => r.status === 'busy').map((r) => r.rowId));

// ---------- Editing and ticking ----------

export function editRow(rowId: string, p: Partial<Pick<UIRow, 'title' | 'brand' | 'category' | 'viewsText' | 'uploadDateText' | 'keyDraft' | 'dupAction'>>) {
  patchRow(rowId, (r) => {
    const next = { ...r, ...p };
    if (p.title !== undefined) next.titleFrom = p.title.trim() ? 'text' : 'none';
    if (p.viewsText !== undefined) {
      const v = parseViews(p.viewsText);
      next.views = typeof v === 'number' ? v : 0;
    }
    if (p.uploadDateText !== undefined) next.uploadDate = parseUploadDate(p.uploadDateText) ?? null;
    if (p.category !== undefined) next.category = p.category || null;
    if (p.keyDraft !== undefined) next.keyError = null;
    if (p.dupAction === 'fill') {
      next.selected = true;
      next.touched = true;
    } else if (p.dupAction === 'skip') next.selected = false;
    return next;
  });
}

let lastClicked: string | null = null;

/** Tick or untick; with Shift, every row from the last one clicked takes the same state (disabled rows never). */
export function toggleRow(rowId: string, on: boolean, range: boolean, order: string[] = get().rows.map((r) => r.rowId)) {
  const ids = new Set<string>([rowId]);
  if (range && lastClicked) {
    const a = order.indexOf(lastClicked);
    const b = order.indexOf(rowId);
    if (a >= 0 && b >= 0) for (let i = Math.min(a, b); i <= Math.max(a, b); i++) ids.add(order[i]!);
  }
  lastClicked = rowId;
  useImport.setState((s) => ({
    rows: s.rows.map((r) => (ids.has(r.rowId) && canTick(r) ? { ...r, selected: on, touched: true, dupAction: r.status === 'duplicate' ? (on ? 'fill' : 'skip') : r.dupAction } : r)),
  }));
}

export function selectAllReady() {
  useImport.setState((s) => ({ rows: s.rows.map((r) => (r.status === 'ready' ? { ...r, selected: true, touched: true } : r)) }));
}

export function fileNamesAsTitles() {
  useImport.setState((s) => ({
    rows: s.rows.map((r) => {
      const t = r.check?.ok ? r.check.suggestedTitle : '';
      return t ? { ...r, title: t, titleFrom: 'file-name' as const } : r;
    }),
  }));
}

export function pair(kind: 'instagram' | 'youtube') {
  useImport.setState((s) => ({ rows: pairInOrder(s.rows, kind), pairable: { ...s.pairable, [kind]: undefined } }));
}

export function toggleFolder(handle: string) {
  useImport.setState((s) => ({ collapsed: { ...s.collapsed, [handle]: !s.collapsed[handle] } }));
}

/** The inline "Paste the key" field of a no-key row: join, re-parse, then check (a folder is read again from the server). */
export async function applyKey(rowId: string) {
  const row = get().rows.find((r) => r.rowId === rowId);
  if (!row?.mega) return;
  const joined = joinMegaKey(row.mega, row.keyDraft);
  if (!joined.ok) {
    patchRow(rowId, (r) => ({ ...r, keyError: joined.problem === 'bad-key' ? "That key doesn't look right. It is the part after # in the link." : 'Paste the key from MEGA.' }));
    return;
  }
  const link = joined.link;
  if (link.kind === 'folder') {
    try {
      const preview = await adminApi.dryRun({ rows: [{ rowId: row.rowId, mega: canonicalMegaLink(link), instagram: row.instagram, youtube: row.youtube, title: row.title, brand: row.brand }] });
      const fresh = preview.rows.map((r) => toUI({ ...r, rowId: `${row.rowId}${r.rowId.replace(/^r\d+/, '')}`, line: row.line }));
      useImport.setState((s) => {
        const i = s.rows.findIndex((r) => r.rowId === rowId);
        const rows = [...s.rows.slice(0, i), ...fresh, ...s.rows.slice(i + 1)];
        const add = fresh.filter((r) => r.status === 'checking').length;
        return { rows, checkTotal: s.checkTotal + add };
      });
      void runChecks();
    } catch (e) {
      patchRow(rowId, (r) => ({ ...r, keyError: e instanceof AdminApiError ? e.message : "Couldn't read that folder." }));
    }
    return;
  }
  const canonical = canonicalMegaLink(link);
  const handle = megaStreamHandle(link);
  const clash = get().rows.find((r) => r.rowId !== rowId && r.handle === handle && r.status !== 'duplicate-in-file');
  patchRow(rowId, (r) => ({ ...r, mega: canonical, handle, megaKind: link.kind, keyDraft: '', keyError: null }));
  if (clash) {
    patchRow(rowId, (r) => ({ ...r, status: 'duplicate-in-file', duplicateOfRow: clash.rowId, selected: false }));
    return;
  }
  await recheck([rowId]);
}

// ---------- Import (I2), in commits of 50 ----------

function toCommitRow(r: UIRow): ImportCommitRow {
  const fill = r.status === 'duplicate' && r.dupAction === 'fill' && r.duplicate;
  return {
    rowId: r.rowId,
    action: fill ? 'fill-links' : 'create',
    ...(fill ? { targetId: r.duplicate!.id } : {}),
    mega: fill ? null : r.mega,
    instagram: r.instagram,
    youtube: r.youtube,
    title: r.title.trim(),
    brand: r.brand.trim(),
    category: r.category?.trim() || null,
    platform: r.platform,
    views: r.views,
    uploadDate: r.uploadDate,
    aspect: r.aspect,
  };
}

async function sendAll(rows: ImportCommitRow[], into: ImportResult, progress: (n: number) => void): Promise<ImportCommitRow[]> {
  const importId = get().importId!;
  let queue = rows;
  while (queue.length) {
    const chunk = queue.slice(0, IMPORT_LIMITS.commitRows);
    try {
      const r = await adminApi.commit({ importId, rows: chunk });
      into.created.push(...r.created);
      into.updated.push(...r.updated);
      into.skipped.push(...r.skipped);
      queue = queue.slice(chunk.length);
      progress(chunk.length);
    } catch (e) {
      if (e instanceof AdminApiError && e.code === 'conflict') return queue;
      throw e;
    }
  }
  return [];
}

/** Re-reads rows after a 409 conflict (another tab added some of the same files): their statuses come back from the server. */
async function rereadRows(rowIds: string[]) {
  const rows = get().rows.filter((r) => rowIds.includes(r.rowId));
  const preview = await adminApi.dryRun({
    rows: rows.map((r) => ({ rowId: r.rowId, mega: r.mega, instagram: r.instagram, youtube: r.youtube, title: r.title, brand: r.brand, category: r.category, platform: r.platform, views: r.views, uploadDate: r.uploadDate, aspect: r.aspect })),
  });
  const byId = new Map(preview.rows.map((r) => [r.rowId, r]));
  useImport.setState((s) => ({
    rows: s.rows.map((r) => {
      const p = byId.get(r.rowId);
      if (!p) return r;
      const status = p.status;
      return { ...r, status, check: p.check ?? r.check, duplicate: p.duplicate, selected: r.selected && !isDisabled({ status }) && status !== 'duplicate' };
    }),
  }));
  if (get().rows.some((r) => rowIds.includes(r.rowId) && r.status === 'checking')) await runChecks();
}

export async function commitTicked() {
  const st = get();
  if (st.committing || !st.importId) return;
  if (st.rows.some((r) => r.selected && (r.status === 'checking' || r.inFlight))) return;
  let rows = st.rows.filter(isImportable).map(toCommitRow);
  if (!rows.length) return;
  const result: ImportResult = { created: [], updated: [], skipped: [] };
  let done = 0;
  const total = rows.length;
  patch({ committing: { done: 0, total }, commitError: null });
  const progress = (n: number) => {
    done += n;
    patch({ committing: { done, total } });
  };
  try {
    let left = await sendAll(rows, result, progress);
    if (left.length) {
      // A UNIQUE race: read the rest again once, check what needs it, and send what is still importable.
      await rereadRows(left.map((r) => r.rowId));
      const still = new Set(get().rows.filter(isImportable).map((r) => r.rowId));
      const retry = get().rows.filter((r) => left.some((l) => l.rowId === r.rowId) && still.has(r.rowId)).map(toCommitRow);
      for (const l of left) if (!still.has(l.rowId)) result.skipped.push({ rowId: l.rowId, reason: 'duplicate', message: 'Added meanwhile in another tab.' });
      left = await sendAll(retry, result, progress);
      if (left.length) throw new AdminApiError(409, 'conflict', 'Some of these videos keep changing in another tab. Try the import again.');
    }
    // Rows the server could not check inline: check them here, then send them once more.
    const needs = result.skipped.filter((s) => s.reason === 'needs-check').map((s) => s.rowId);
    if (needs.length) {
      result.skipped = result.skipped.filter((s) => s.reason !== 'needs-check');
      await recheck(needs);
      rows = get().rows.filter((r) => needs.includes(r.rowId) && isImportable(r)).map(toCommitRow);
      for (const id of needs) if (!rows.some((r) => r.rowId === id)) result.skipped.push({ rowId: id, reason: 'mega-unusable', message: get().rows.find((r) => r.rowId === id)?.check?.ok === false ? (get().rows.find((r) => r.rowId === id)!.check as { message: string }).message : 'MEGA could not check it.' });
      await sendAll(rows, result, () => undefined);
    }
    patch({ committing: null, result, step: 'done' });
  } catch (e) {
    patch({ committing: null, commitError: e instanceof AdminApiError ? e.message : "The import stopped. What was added is in the list; try the rest again." });
    if (result.created.length || result.updated.length) patch({ result });
  } finally {
    await queryClient?.invalidateQueries({ queryKey: ['admin', 'videos'] });
  }
}

export async function undoImport(): Promise<boolean> {
  const id = get().importId;
  if (!id) return false;
  try {
    const r = await adminApi.undoImport(id);
    patch({ undone: r });
    await queryClient?.invalidateQueries({ queryKey: ['admin', 'videos'] });
    return true;
  } catch {
    return false;
  }
}

// ---------- Read-outs ----------

export const STATUS_LABEL: Record<ImportStatus, string> = {
  checking: 'Checking',
  ready: 'Ready',
  heavy: 'Heavy',
  'too-heavy': 'Too heavy',
  'unknown-quality': 'Size unknown',
  unplayable: "Can't play",
  busy: 'MEGA busy',
  unreachable: "Can't reach",
  'not-video': 'Not a video',
  'no-key': 'Needs key',
  invalid: 'Bad link',
  duplicate: 'In the library',
  'duplicate-in-file': 'Repeat',
  'needs-mega': 'No MEGA link',
  'folder-limit': 'Too many folders',
};

export const STATUS_TONE: Record<ImportStatus, 'green' | 'amber' | 'grey' | 'blue' | 'ink'> = {
  checking: 'grey',
  ready: 'green',
  heavy: 'amber',
  'too-heavy': 'amber',
  'unknown-quality': 'amber',
  unplayable: 'amber',
  busy: 'amber',
  unreachable: 'grey',
  'not-video': 'grey',
  'no-key': 'amber',
  invalid: 'grey',
  duplicate: 'blue',
  'duplicate-in-file': 'grey',
  'needs-mega': 'blue',
  'folder-limit': 'grey',
};

/** "24 videos found · 18 ready · 3 heavy · 2 already in the library · 1 can't reach MEGA" */
export function countsLine(rows: UIRow[]): string {
  const n = (s: ImportStatus | ImportStatus[]) => rows.filter((r) => (Array.isArray(s) ? s : [s]).includes(r.status)).length;
  const parts: [number, string][] = [
    [n('ready'), 'ready'],
    [n(['heavy', 'too-heavy']), 'heavy'],
    [n('unknown-quality'), 'size unknown'],
    [n('unplayable'), "can't play in browsers"],
    [n('duplicate'), 'already in the library'],
    [n('duplicate-in-file'), 'repeated in the file'],
    [n('needs-mega'), 'without a MEGA link'],
    [n('no-key'), 'need a key'],
    [n('busy'), 'MEGA busy'],
    [n('unreachable'), "can't reach MEGA"],
    [n('not-video'), 'not videos'],
    [n('invalid'), 'bad links'],
    [n('folder-limit'), 'over the folder limit'],
    [n('checking'), 'checking'],
  ];
  const head = `${rows.length} ${rows.length === 1 ? 'video' : 'videos'} found`;
  return [head, ...parts.filter(([c]) => c > 0).map(([c, label]) => `${c} ${label}`)].join(' · ');
}

/** "1", "2", or "5a", "5b" for the files of the folder on line 5. */
export function rowNumber(rows: UIRow[], i: number): string {
  const r = rows[i]!;
  if (!r.folder) return String(r.line ?? i + 1);
  let k = 0;
  for (let j = i - 1; j >= 0 && rows[j]!.folder?.handle === r.folder.handle && rows[j]!.line === r.line; j--) k++;
  return `${r.line ?? ''}${k < 26 ? String.fromCharCode(97 + k) : `.${k + 1}`}`;
}

export const TEMPLATE_CSV = 'Title,Brand,MEGA link,Instagram,YouTube,Views,Upload date,Category,Platform\r\n';
