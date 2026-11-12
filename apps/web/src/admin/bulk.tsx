// Owner: sel (round 4). Selecting several videos in the list and acting on them at once: the selection (click, Shift+click ranges, Cmd/Ctrl+click,
// Space, Select all in the current view), the bulk bar (a toolbar, sticky above the list on desktop and a bottom sheet on phones), the "Set a
// field" popover with the drawer's validation, and the actions themselves over POST /videos/bulk: optimistic in the caches, rolled back per row on
// a failure, with a summary that names the videos that couldn't take the action and why. Export as CSV writes the import template's columns.
import { BLOCKING_PROBLEMS, VIDEO_ASPECTS, type AdminVideo, type BulkAction, type BulkFailure, type BulkField, type BulkFields, type BulkResult, type VideoProblem } from '@kreators/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, Check, ChevronDown, ChevronLeft, Clapperboard, Download, Ellipsis, Eye, EyeOff, Minus, RefreshCw, RotateCcw, Star, StarOff, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react';
import { AdminApiError, adminApi, keys } from './api';
import { MenuButton, Spinner, usePopover } from './bits';
import { TEMPLATE_CSV } from './importStore';
import type { InlineEditor } from './inlineEdit';
import { PROBLEM_WORDS } from './inlineEdit';
import { toast } from './Toasts';
import { forgetVideo, mergeVideo } from './videoCache';

// ---------------------------------------------------------------- the selection

export interface Selection {
  /** Selected ids, always inside the current view. */
  ids: ReadonlySet<string>;
  count: number;
  /** Rows in the current view. */
  total: number;
  has: (id: string) => boolean;
  /** A click (or Space) on a row's checkbox, or a Cmd/Ctrl/Shift click on the row. Shift selects (or clears) the range from the last pick. */
  pick: (id: string, how?: { shift?: boolean }) => void;
  selectAll: () => void;
  clear: () => void;
  replace: (ids: Iterable<string>) => void;
}

/** `view` is the ordered ids of the rows on screen (after search and filters); `resetKey` changes when the view itself changes (list or bin). */
export function useSelection(view: readonly string[], resetKey: string): Selection {
  const [raw, setRaw] = useState<ReadonlySet<string>>(() => new Set());
  const anchor = useRef<string | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const viewSet = useMemo(() => new Set(view), [view]);

  // Ids that left the view (deleted, binned, filtered out, gone after a refetch) drop out of the selection.
  const ids = useMemo(() => {
    for (const id of raw) if (!viewSet.has(id)) return new Set([...raw].filter((x) => viewSet.has(x))) as ReadonlySet<string>;
    return raw;
  }, [raw, viewSet]);
  useEffect(() => {
    if (ids !== raw) setRaw(ids);
  }, [ids, raw]);

  const lastKey = useRef(resetKey);
  useEffect(() => {
    if (lastKey.current === resetKey) return;
    lastKey.current = resetKey;
    anchor.current = null;
    setRaw(new Set());
  }, [resetKey]);

  const pick = useCallback((id: string, how: { shift?: boolean } = {}) => {
    const from = anchor.current;
    anchor.current = id;
    setRaw((old) => {
      const v = viewRef.current;
      const next = new Set(old);
      const on = !old.has(id);
      const i = from ? v.indexOf(from) : -1;
      const j = v.indexOf(id);
      if (how.shift && i >= 0 && j >= 0 && i !== j) {
        for (const x of v.slice(Math.min(i, j), Math.max(i, j) + 1)) {
          if (on) next.add(x);
          else next.delete(x);
        }
      } else if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const selectAll = useCallback(() => setRaw(new Set(viewRef.current)), []);
  const clear = useCallback(() => {
    anchor.current = null;
    setRaw((old) => (old.size ? new Set() : old));
  }, []);
  const replace = useCallback((next: Iterable<string>) => setRaw(new Set(next)), []);
  const has = useCallback((id: string) => ids.has(id), [ids]);

  return { ids, count: ids.size, total: view.length, has, pick, selectAll, clear, replace };
}

/** The 44 px checkbox (the real input covers the target; the box is drawn under it). A keyboard Space with Shift also selects a range. */
export function SelectBox({
  checked,
  indeterminate = false,
  label,
  onPick,
  inputRef,
  className,
  children,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onPick: (how: { shift: boolean }) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
  /** Visible text beside the box (the phones' "Select all 13"). */
  children?: ReactNode;
}) {
  const own = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? own;
  const shiftKey = useRef(false);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate, ref, checked]);
  return (
    <label className={`adm-tick adm-sel ${className ?? ''}`} title={label} onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        aria-label={children ? undefined : label}
        onChange={() => undefined}
        onKeyDown={(e) => {
          if (e.key === ' ') shiftKey.current = e.shiftKey;
        }}
        onClick={(e) => {
          e.stopPropagation();
          // A keyboard click (detail 0) carries no modifier keys: the Space press said whether Shift was down.
          const shift = e.shiftKey || (e.detail === 0 && shiftKey.current);
          shiftKey.current = false;
          onPick({ shift });
        }}
        onMouseDown={(e) => {
          // Shift+click: no text selection across the rows.
          if (e.shiftKey) e.preventDefault();
        }}
      />
      <span className="adm-tick-box" aria-hidden>
        <Check className="size-3.5 adm-sel-on" />
        <Minus className="size-3.5 adm-sel-mixed" />
      </span>
      {children && <span className="adm-sel-text">{children}</span>}
    </label>
  );
}

// ---------------------------------------------------------------- CSV, in the import template's columns

const csvCell = (value: string | number | null | undefined, text = true): string => {
  let s = value === null || value === undefined ? '' : String(value);
  // A spreadsheet must not run a cell as a formula.
  if (text && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Title,Brand,MEGA link,Instagram,YouTube,Views,Upload date,Category,Platform (TEMPLATE_CSV), so the file imports again as it is. */
export function videosCsv(videos: readonly AdminVideo[]): string {
  const lines = videos.map((v) =>
    [
      csvCell(v.title),
      csvCell(v.brand),
      // The admin's own canonical link (the admin API answers it to the admin only); empty while the key is still in the old secret.
      csvCell(v.mega?.url ?? '', false),
      csvCell(v.instagramUrl, false),
      csvCell(v.youtubeUrl, false),
      csvCell(v.views > 0 ? v.views : '', false),
      csvCell(v.uploadDate, false),
      csvCell(v.category),
      csvCell(v.platform),
    ].join(','),
  );
  return `${TEMPLATE_CSV}${lines.map((l) => `${l}\r\n`).join('')}`;
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------------------------------------------------------------- the actions

const SHORT: Partial<Record<VideoProblem, string>> = { 'no-title': 'no title', 'no-brand': 'no brand', 'no-stream': 'no stream', 'mega-unreachable': 'MEGA link broken' };

function reasonOf(f: BulkFailure): string {
  if (f.code === 'cannot-publish') return (f.problems ?? []).map((p) => SHORT[p] ?? p).join(', ') || "can't go live";
  if (f.code === 'stale') return 'changed in another tab';
  if (f.code === 'not-found') return 'no longer exists';
  if (f.code === 'not-in-bin') return 'not in the bin';
  return f.message.replace(/\.$/, '').toLowerCase();
}

/** The longer note a row shows after a failed bulk action. */
function noteOf(action: BulkAction, f: BulkFailure): string {
  if (f.code === 'cannot-publish') {
    const words = (f.problems ?? []).map((p) => PROBLEM_WORDS[p] ?? p);
    return `${action === 'publish' ? "Couldn't publish" : "Couldn't change it"}: ${words.join('. ') || 'fix the video first'}.`;
  }
  return `Couldn't ${action === 'publish' ? 'publish' : 'change'} it: ${reasonOf(f)}.`;
}

export const FIELD_LABEL: Record<BulkField, string> = { brand: 'Brand', category: 'Category', platform: 'Platform', uploadDate: 'Upload date', aspect: 'Aspect' };
const videosWord = (n: number) => `${n} video${n === 1 ? '' : 's'}`;

function doneText(action: BulkAction, n: number, fields?: BulkFields): string {
  const k = fields ? (Object.keys(fields)[0] as BulkField | undefined) : undefined;
  switch (action) {
    case 'publish':
      return `Published ${videosWord(n)}`;
    case 'unpublish':
      return `Moved ${videosWord(n)} to drafts`;
    case 'feature':
      return `Featured ${videosWord(n)}`;
    case 'unfeature':
      return `Took ${videosWord(n)} off featured`;
    case 'set': {
      const name = k ? FIELD_LABEL[k].toLowerCase() : 'fields';
      const cleared = k && k !== 'aspect' && (fields![k] === null || fields![k] === '');
      return `${cleared ? 'Cleared' : 'Set'} the ${name} of ${videosWord(n)}`;
    }
    case 'bin':
      return `Moved ${videosWord(n)} to the bin`;
    case 'restore':
      return `Restored ${videosWord(n)} as drafts`;
    case 'purge':
      return `Deleted ${videosWord(n)} for good`;
  }
}

/** What a row looks like at once, before the server answers. null: it leaves the caches (purge). */
function predict(v: AdminVideo, action: BulkAction, fields?: BulkFields): AdminVideo | null {
  switch (action) {
    case 'publish':
      return v.problems.some((p) => BLOCKING_PROBLEMS.includes(p)) ? v : { ...v, published: true };
    case 'unpublish':
      return { ...v, published: false };
    case 'feature':
    case 'unfeature':
      return { ...v, featured: action === 'feature' };
    case 'set': {
      const f = fields ?? {};
      const next = { ...v };
      if (f.brand !== undefined) next.brand = f.brand ?? '';
      if (f.category !== undefined) next.category = f.category || null;
      if (f.platform !== undefined) next.platform = f.platform || null;
      if (f.uploadDate !== undefined) next.uploadDate = f.uploadDate || null;
      if (f.aspect !== undefined) next.aspect = f.aspect;
      return next;
    }
    case 'bin':
      return { ...v, published: false, deletedAt: new Date().toISOString() };
    case 'restore':
      return { ...v, published: false, deletedAt: null };
    case 'purge':
      return null;
  }
}

export interface BulkSummary {
  key: number;
  text: string;
  /** The videos that couldn't take the action, in list order. */
  failed: { id: string; title: string; reason: string }[];
  /** Per-row notes while "Show them" is on. */
  notes: Map<string, string>;
}

export interface BulkApi {
  /** The action running, for the bar's spinner. */
  busy: BulkAction | 'recheck' | null;
  progress: { done: number; total: number } | null;
  run: (action: BulkAction, videos: AdminVideo[], fields?: BulkFields) => Promise<BulkResult | null>;
  recheck: (videos: AdminVideo[]) => Promise<void>;
  exportCsv: (videos: AdminVideo[]) => void;
}

export function useBulkActions({ inline, onSummary }: { inline: InlineEditor | null; onSummary: (s: BulkSummary | null) => void }): BulkApi {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<BulkApi['busy']>(null);
  const [progress, setProgress] = useState<BulkApi['progress']>(null);
  const seq = useRef(0);
  const summaryRef = useRef(onSummary);
  summaryRef.current = onSummary;

  const report = useCallback((head: string, failed: BulkSummary['failed'], notes: Map<string, string>, undo?: () => void) => {
    if (!failed.length) {
      summaryRef.current(null);
      toast(`${head}.`, undo ? { action: { label: 'Undo', run: undo } } : {});
      return;
    }
    const names = failed.slice(0, 3).map((f) => `${f.title} (${f.reason})`);
    const more = failed.length > 3 ? ` and ${failed.length - 3} more` : '';
    const text = `${head ? `${head} · ` : ''}${failed.length} couldn't: ${names.join(', ')}${more}`;
    summaryRef.current({ key: ++seq.current, text, failed, notes });
    if (undo) toast(`${head}.`, { action: { label: 'Undo', run: undo } });
  }, []);

  const send = useCallback(
    async (action: BulkAction, videos: AdminVideo[], fields?: BulkFields): Promise<BulkResult | null> => {
      const byId = new Map(videos.map((v) => [v.id, v]));
      await qc.cancelQueries({ queryKey: ['admin', 'videos'] });
      for (const v of videos) {
        const next = predict(v, action, fields);
        if (next === null) forgetVideo(qc, v.id);
        else if (next !== v) mergeVideo(qc, next);
      }
      let res: BulkResult;
      try {
        res = await adminApi.bulk({ ids: videos.map((v) => v.id), action, ...(fields ? { fields } : {}) });
      } catch (e) {
        for (const v of videos) mergeVideo(qc, v);
        toast(e instanceof AdminApiError && e.code !== 'server' ? e.message : "Couldn't do that. Nothing changed.", { tone: 'error' });
        return null;
      }
      for (const v of res.done) {
        const old = byId.get(v.id);
        if (old) inline?.noteAdvance(v.id, old.updatedAt, v.updatedAt);
        mergeVideo(qc, v);
      }
      const kept = new Set(res.done.map((v) => v.id));
      for (const id of res.doneIds) if (!kept.has(id)) forgetVideo(qc, id);
      for (const f of res.failed) {
        if (f.code === 'not-found') forgetVideo(qc, f.id);
        else {
          const v = byId.get(f.id);
          if (v) mergeVideo(qc, v);
        }
      }
      // The counts of the other list (bin and main) follow.
      if (action === 'bin' || action === 'restore' || action === 'purge') void qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
      if (res.failed.some((f) => f.code === 'stale')) void qc.invalidateQueries({ queryKey: keys.videos(false) });
      return res;
    },
    [qc, inline],
  );

  const run = useCallback(
    async (action: BulkAction, videos: AdminVideo[], fields?: BulkFields) => {
      if (!videos.length) return null;
      setBusy(action);
      try {
        const res = await send(action, videos, fields);
        if (!res) return null;
        const titleOf = new Map(videos.map((v) => [v.id, v.title || 'Untitled video']));
        const failed = res.failed.map((f) => ({ id: f.id, title: titleOf.get(f.id) ?? f.id, reason: reasonOf(f) }));
        const notes = new Map(res.failed.map((f) => [f.id, noteOf(action, f)]));
        const n = res.doneIds.length;
        const head = n ? doneText(action, n, fields) : action === 'publish' ? 'Published none' : '';
        let undo: (() => void) | undefined;
        if (action === 'bin' && n) {
          const binned = videos.filter((v) => res.doneIds.includes(v.id) && !v.deletedAt);
          undo = () => {
            void (async () => {
              const back = await send('restore', binned.map((v) => ({ ...v, deletedAt: new Date().toISOString(), published: false })));
              if (!back) return;
              const wasLive = binned.filter((v) => v.published && back.doneIds.includes(v.id));
              const fresh = wasLive.map((v) => back.done.find((d) => d.id === v.id) ?? v);
              const live = wasLive.length ? await send('publish', fresh) : null;
              const stayed = live ? live.failed.length : 0;
              toast(`Restored ${videosWord(back.doneIds.length)}${stayed ? ` · ${stayed} stayed a draft` : ''}.`);
            })();
          };
        }
        report(head, failed, notes, undo);
        return res;
      } finally {
        setBusy(null);
      }
    },
    [send, report],
  );

  const recheck = useCallback(
    async (videos: AdminVideo[]) => {
      const targets = videos.filter((v) => v.mega);
      const skipped = videos.length - targets.length;
      if (!targets.length) {
        toast(skipped === 1 ? 'That video has no MEGA link to check.' : 'None of these has a MEGA link to check.');
        return;
      }
      setBusy('recheck');
      setProgress({ done: 0, total: targets.length });
      const failed: BulkSummary['failed'] = [];
      const notes = new Map<string, string>();
      let i = 0;
      const worker = async () => {
        while (i < targets.length) {
          const v = targets[i++]!;
          try {
            const r = await adminApi.megaCheck(v.id);
            inline?.noteAdvance(v.id, v.updatedAt, r.video.updatedAt);
            mergeVideo(qc, r.video);
            if (!r.inspect.ok) {
              failed.push({ id: v.id, title: v.title || 'Untitled video', reason: r.inspect.message.replace(/\.$/, '') });
              notes.set(v.id, `MEGA: ${r.inspect.message}`);
            }
          } catch (e) {
            failed.push({ id: v.id, title: v.title || 'Untitled video', reason: e instanceof AdminApiError && e.code !== 'server' ? e.message.replace(/\.$/, '') : "couldn't check" });
          }
          setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
        }
      };
      try {
        await Promise.all([worker(), worker(), worker()]);
      } finally {
        setBusy(null);
        setProgress(null);
      }
      const order = new Map(videos.map((v, k) => [v.id, k]));
      failed.sort((x, y) => order.get(x.id)! - order.get(y.id)!);
      const head = `Checked ${targets.length} stream${targets.length === 1 ? '' : 's'}${skipped ? ` · ${skipped} without a MEGA link` : ''}`;
      report(head, failed, notes);
    },
    [qc, inline, report],
  );

  const exportCsv = useCallback((videos: AdminVideo[]) => {
    if (!videos.length) return;
    download(`kreators-videos-${new Date().toISOString().slice(0, 10)}.csv`, videosCsv(videos));
    toast(`Exported ${videosWord(videos.length)} as CSV.`);
  }, []);

  return { busy, progress, run, recheck, exportCsv };
}

// ---------------------------------------------------------------- the bar

const today = () => new Date().toISOString().slice(0, 10);

/** "Set a field": first the field, then its value, with the drawer's limits and wording. Clear where a field may be empty. */
function SetFieldPop({
  count,
  lists,
  disabled,
  onSet,
}: {
  count: number;
  lists: { brand: string; category: string; platform: string };
  disabled: boolean;
  onSet: (fields: BulkFields) => void;
}) {
  const { pop, anchor, open, toggle, hide } = usePopover('start');
  const [field, setField] = useState<BulkField | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const msgId = `${id}-msg`;

  useEffect(() => {
    if (!open) {
      setField(null);
      setText('');
      setError(null);
    } else if (!field) firstRef.current?.focus({ preventScroll: true });
  }, [open, field]);
  useEffect(() => {
    if (field && field !== 'aspect') inputRef.current?.focus({ preventScroll: true });
    if (field === 'aspect') pop.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus({ preventScroll: true });
  }, [field, pop]);

  const choose = (f: BulkField) => {
    setField(f);
    setText(f === 'aspect' ? 'vertical' : '');
    setError(null);
  };

  const apply = (value: string | null) => {
    if (!field) return;
    let v: string | null = value;
    if (field === 'aspect') v = value;
    else if (value === null) v = null;
    else {
      const s = value.trim();
      if (field === 'brand') {
        if (!s) return setError('Add a brand.');
        v = s.slice(0, 60);
      } else if (field === 'category' || field === 'platform') {
        if (!s) return setError(`Type a ${field}, or use Clear.`);
        v = s.slice(0, 40);
      } else if (field === 'uploadDate') {
        if (inputRef.current?.validity.badInput || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return setError('Pick a whole day, or clear the date.');
        if (s > today()) return setError('The upload date cannot be in the future.');
        if (s < '2000-01-01') return setError('Pick a day from 2000 on.');
        v = s;
      }
    }
    hide();
    onSet({ [field]: v } as BulkFields);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    apply(text);
  };

  const clearable = field === 'category' || field === 'platform' || field === 'uploadDate';
  const what = videosWord(count);

  return (
    <>
      <button ref={anchor} type="button" className="btn btn-sm btn-ghost adm-bulk-btn" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={toggle} disabled={disabled} data-bulk="set">
        <Lbl long="Set field" short="Set" />
        <ChevronDown className="size-4" aria-hidden />
      </button>
      <div ref={pop} id={id} popover="auto" role="dialog" aria-label={field ? `${FIELD_LABEL[field]} for ${what}` : `Set a field for ${what}`} className="adm-pop adm-bulk-pop">
        {!field ? (
          <>
            <p className="adm-pop-title">Set a field for {what}</p>
            <div className="adm-bulk-fields">
              {(Object.keys(FIELD_LABEL) as BulkField[]).map((f, i) => (
                <button key={f} ref={i === 0 ? firstRef : undefined} type="button" className="adm-menu-item" data-field={f} onClick={() => choose(f)}>
                  {FIELD_LABEL[f]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={submit} noValidate className="adm-bulk-form" data-field={field}>
            <button type="button" className="adm-link-btn adm-bulk-back" onClick={() => setField(null)}>
              <ChevronLeft className="size-4" aria-hidden /> Fields
            </button>
            {field === 'aspect' ? (
              <fieldset className="adm-bulk-aspect">
                <legend className="adm-pop-title">Aspect for {what}</legend>
                {VIDEO_ASPECTS.map((a) => (
                  <label key={a} className="adm-bulk-radio">
                    <input type="radio" name={`${id}-aspect`} value={a} checked={text === a} onChange={() => setText(a)} />
                    <span>{a === 'vertical' ? 'Vertical' : 'Landscape'}</span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <label className="adm-bulk-label">
                <span className="adm-pop-title">
                  {FIELD_LABEL[field]} for {what}
                </span>
                <input
                  ref={inputRef}
                  className="adm-bulk-input"
                  name={field}
                  type={field === 'uploadDate' ? 'date' : 'text'}
                  value={text}
                  min={field === 'uploadDate' ? '2000-01-01' : undefined}
                  max={field === 'uploadDate' ? today() : undefined}
                  maxLength={field === 'brand' ? 60 : field === 'uploadDate' ? undefined : 40}
                  list={field === 'brand' || field === 'category' || field === 'platform' ? lists[field] : undefined}
                  autoComplete="off"
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? msgId : undefined}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </label>
            )}
            {error && (
              <p className="adm-cell-msg adm-bulk-msg" id={msgId} role="alert" data-kind="error">
                {error}
              </p>
            )}
            <div className="adm-bulk-form-actions">
              {clearable && (
                <button type="button" className="btn btn-sm btn-ghost" data-clear onClick={() => apply(null)}>
                  {field === 'uploadDate' ? 'Clear date' : 'Clear field'}
                </button>
              )}
              <button type="submit" className="btn btn-sm btn-ink" data-apply>
                Set for {what}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

/** A bar label: the full words on desktop; on phones a short word shows and the full words stay the button's name. */
function Lbl({ long, short }: { long: string; short: string }) {
  return (
    <>
      <span className="adm-bulk-long">{long}</span>
      <span className="adm-bulk-short" aria-hidden>
        {short}
      </span>
    </>
  );
}

/** Arrow keys move between the toolbar's controls (Tab still reaches each). */
function onToolbarKey(e: ReactKeyboardEvent<HTMLDivElement>) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
  if ((e.target as HTMLElement).closest('[popover], [role="menu"]')) return;
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])')].filter((b) => !b.closest('[popover], [role="menu"]'));
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
  items[next]?.focus();
}

export function BulkBar({
  bin,
  sel,
  bulk,
  lists,
  onAction,
  onSet,
  onExport,
  onRecheck,
  onRegenerate,
  onPurge,
  allLabel,
}: {
  bin: boolean;
  sel: Selection;
  bulk: BulkApi;
  lists: { brand: string; category: string; platform: string };
  onAction: (action: BulkAction) => void;
  onSet: (fields: BulkFields) => void;
  onExport: () => void;
  onRecheck: () => void;
  /** (admin10) "Regenerate thumbnails & previews" for the selected rows. */
  onRegenerate?: () => void;
  onPurge: () => void;
  /** (admin14) "Select all 98 matching" when the list is in pages. */
  allLabel?: string;
}) {
  const busy = bulk.busy !== null;
  const spin = (a: BulkAction | 'recheck') => (bulk.busy === a ? <Spinner className="adm-spin-sm" /> : null);
  return (
    <div className="adm-bulk" role="toolbar" aria-label={`Actions for ${sel.count} selected`} aria-busy={busy || undefined} onKeyDown={onToolbarKey} data-bin={bin ? '' : undefined}>
      <div className="adm-bulk-sel">
        <span className="adm-bulk-count">{sel.count} selected</span>
        {sel.count < sel.total && (
          <button type="button" className="adm-link-btn" data-bulk="select-all" onClick={sel.selectAll}>
            {allLabel ?? `Select all ${sel.total}`}
          </button>
        )}
        <button type="button" className="adm-link-btn adm-bulk-clear" data-bulk="clear" onClick={sel.clear}>
          <X className="size-4" aria-hidden /> Clear
        </button>
      </div>
      <div className="adm-bulk-actions">
        {bulk.progress && (
          <span className="adm-bulk-progress">
            Checking {bulk.progress.done} of {bulk.progress.total}…
          </span>
        )}
        {bin ? (
          <>
            <button type="button" className="btn btn-sm btn-ghost adm-bulk-btn" data-bulk="restore" disabled={busy} onClick={() => onAction('restore')}>
              {spin('restore') ?? <RotateCcw className="size-4" aria-hidden />} <Lbl long="Restore" short="Restore" />
            </button>
            <button type="button" className="btn btn-sm btn-ghost adm-bulk-btn adm-danger-text" data-bulk="purge" disabled={busy} onClick={onPurge}>
              {spin('purge') ?? <Trash2 className="size-4" aria-hidden />} <Lbl long="Delete forever" short="Delete" />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-sm btn-ink adm-bulk-btn" data-bulk="publish" disabled={busy} onClick={() => onAction('publish')}>
              {spin('publish') ?? <Eye className="size-4" aria-hidden />} <Lbl long="Publish" short="Publish" />
            </button>
            <button type="button" className="btn btn-sm btn-ghost adm-bulk-btn" data-bulk="unpublish" disabled={busy} onClick={() => onAction('unpublish')}>
              {spin('unpublish') ?? <EyeOff className="size-4" aria-hidden />} <Lbl long="Move to drafts" short="Drafts" />
            </button>
            <SetFieldPop count={sel.count} lists={lists} disabled={busy} onSet={onSet} />
            <MenuButton
              label="More actions"
              buttonClass="btn btn-sm btn-ghost adm-bulk-btn adm-bulk-more"
              align="end"
              items={[
                { label: 'Feature', icon: <Star className="size-4" aria-hidden />, onSelect: () => onAction('feature'), disabled: busy },
                { label: 'Take off featured', icon: <StarOff className="size-4" aria-hidden />, onSelect: () => onAction('unfeature'), disabled: busy },
                { label: 'Export as CSV', icon: <Download className="size-4" aria-hidden />, onSelect: onExport },
                { label: 'Check streams again', icon: <RefreshCw className="size-4" aria-hidden />, onSelect: onRecheck, disabled: busy },
                ...(onRegenerate ? [{ label: 'Regenerate thumbnails & previews', icon: <Clapperboard className="size-4" aria-hidden />, onSelect: onRegenerate }] : []),
              ]}
            >
              {spin('feature') ?? spin('unfeature') ?? spin('recheck') ?? <Ellipsis className="size-4" aria-hidden />}
              <Lbl long="More" short="More" />
            </MenuButton>
            <button type="button" className="btn btn-sm btn-ghost adm-bulk-btn adm-danger-text" data-bulk="bin" disabled={busy} onClick={() => onAction('bin')}>
              {spin('bin') ?? <Archive className="size-4" aria-hidden />} <Lbl long="Move to bin" short="Bin" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** The summary after a bulk action some videos couldn't take: what happened, who didn't and why, and a way to see them. */
export function BulkNote({ summary, showing, onShow, onDismiss }: { summary: BulkSummary | null; showing: boolean; onShow: () => void; onDismiss: () => void }) {
  return (
    <div className="adm-bulk-note-wrap" role="status" aria-live="polite">
      {summary && (
        <div className="adm-bulk-note" key={summary.key}>
          <p className="adm-bulk-note-text">{summary.text}</p>
          <div className="adm-bulk-note-actions">
            {!showing && (
              <button type="button" className="btn btn-sm btn-ghost" data-show-failed onClick={onShow}>
                Show {summary.failed.length === 1 ? 'it' : `these ${summary.failed.length}`}
              </button>
            )}
            <button type="button" className="adm-icon-btn" aria-label="Dismiss" onClick={onDismiss}>
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
