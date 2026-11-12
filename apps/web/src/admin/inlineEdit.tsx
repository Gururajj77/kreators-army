// Owner: adm (round 3). Editing the videos list in place (desktop widths): a click, Enter or F2 on a cell turns it into an input; Enter or blur saves
// with PATCH /videos/:id and expectUpdatedAt, Esc cancels, Tab and Shift+Tab save and move to the next or previous cell. The change shows at once
// (optimistic) and rolls back on an error; a 409 stale keeps the other tab's value and says so. Saves of one row run one after another, so a second
// edit never trips over the first one's new updated_at. The validation wording is the drawer's.
import {
  formatViews,
  parseInstagram,
  parseMegaLink,
  parseViews,
  parseYouTube,
  VIDEO_ASPECTS,
  type AdminVideo,
  type AdminVideoList,
  type VideoAspect,
  type VideoProblem,
  type VideoWrite,
} from '@kreators/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AdminApiError, adminApi, keys } from './api';
import { Spinner } from './bits';
import { attachQueryClient, canMake, enqueue as makeMedia, sourceKey } from './mediaGen/runner';
import { toast } from './Toasts';
import { mergeVideo } from './videoCache';

/** Blocking problems in plain words (the row switch's popover, the drawer's disabled publish button, an inline save a live video refuses). */
export const PROBLEM_WORDS: Partial<Record<VideoProblem, string>> = {
  'no-title': 'Add a title',
  'no-brand': 'Add a brand',
  'no-stream': 'Add a MEGA link or a bundled file',
  'mega-unreachable': 'The MEGA link no longer works',
};

// (admin14) Also the aspect (a select), the site order (a number), Featured (a switch, saved at once) and the MEGA link (checked by the server on save).
export type CellField = 'title' | 'brand' | 'category' | 'platform' | 'uploadDate' | 'views' | 'instagram' | 'youtube' | 'aspect' | 'sortOrder' | 'featured' | 'mega';

/** The field's name in a sentence ("Edit upload date, …"). */
export const CELL_LABEL: Record<CellField, string> = {
  title: 'title',
  brand: 'brand',
  category: 'category',
  platform: 'platform',
  uploadDate: 'upload date',
  views: 'views',
  instagram: 'Instagram link',
  youtube: 'YouTube link',
  aspect: 'shape',
  sortOrder: 'site order',
  featured: 'featured',
  mega: 'MEGA link',
};

const INPUT_LABEL: Record<CellField, string> = {
  title: 'Title',
  brand: 'Brand',
  category: 'Category',
  platform: 'Platform',
  uploadDate: 'Upload date',
  views: 'Views',
  instagram: 'Instagram link',
  youtube: 'YouTube link',
  aspect: 'Shape',
  sortOrder: 'Site order',
  featured: 'Featured',
  mega: 'MEGA link',
};

const PROP = {
  title: 'title',
  brand: 'brand',
  category: 'category',
  platform: 'platform',
  uploadDate: 'uploadDate',
  views: 'views',
  instagram: 'instagramUrl',
  youtube: 'youtubeUrl',
  aspect: 'aspect',
  sortOrder: 'sortOrder',
  featured: 'featured',
  mega: 'mega',
} as const satisfies Record<CellField, keyof AdminVideo>;

type CellValue = string | number | boolean | null;

export const ASPECT_WORDS: Record<VideoAspect, string> = { vertical: 'Vertical', landscape: 'Landscape' };

/** The MEGA link problems in the drawer's words (MegaField). */
const MEGA_PARSE: Record<string, string> = {
  'not-mega': "That isn't a MEGA file link.",
  'bad-link': "That isn't a MEGA file link.",
  'no-key': 'This link has no key. Copy it again from MEGA with the key included.',
  'bad-key': "This link's key doesn't open the file.",
  folder: "That's a folder. Use Import links to add every video in it.",
};

const VIEWS_MESSAGE = 'Write the views as a number, like 60000, 60K or 1.2M.';
const today = () => new Date().toISOString().slice(0, 10);

/** 'YYYY-MM-DD' as "5 Nov 2026" (read as a calendar day, never shifted by the time zone). */
export function formatDay(day: string | null | undefined): string {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return '';
  const [y, mo, d] = day.split('-').map(Number) as [number, number, number];
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, mo - 1, d)));
}

/** What a cell shows as plain text; '' when the field is missing (views 0 counts as missing). */
export function cellDisplay(v: AdminVideo, f: CellField): string {
  switch (f) {
    case 'title':
      return v.title;
    case 'brand':
      return v.brand.trim();
    case 'category':
      return v.category?.trim() ?? '';
    case 'platform':
      return v.platform?.trim() ?? '';
    case 'uploadDate':
      return formatDay(v.uploadDate);
    case 'views':
      return v.views > 0 ? formatViews(v.views) : '';
    case 'instagram':
      return v.instagramUrl ?? '';
    case 'youtube':
      return v.youtubeUrl ?? '';
    case 'aspect':
      return ASPECT_WORDS[v.aspect] ?? v.aspect;
    case 'sortOrder':
      return String(v.sortOrder);
    case 'featured':
      return v.featured ? 'Featured' : '';
    case 'mega':
      return v.mega ? 'MEGA' : '';
  }
}

/** The editor's starting text. */
function cellText(v: AdminVideo, f: CellField): string {
  if (f === 'views') return v.views > 0 ? String(v.views) : '';
  if (f === 'uploadDate') return v.uploadDate ?? '';
  if (f === 'instagram') return v.instagramUrl ?? '';
  if (f === 'youtube') return v.youtubeUrl ?? '';
  if (f === 'sortOrder') return String(v.sortOrder);
  if (f === 'featured') return v.featured ? '1' : '';
  // The drawer's MEGA field shows the saved link (with its key) to the admin the same way; it never leaves this input.
  if (f === 'mega') return v.mega?.url ?? '';
  return (v[PROP[f]] as string | null) ?? '';
}

/** `raw` null: a date input holding a part-typed day. */
export function parseCell(f: CellField, raw: string | null): { ok: true; value: CellValue } | { ok: false; message: string } {
  if (raw === null) return { ok: false, message: 'Pick a whole day, or clear the date.' };
  const s = raw.trim();
  switch (f) {
    case 'title':
      return s ? { ok: true, value: s.slice(0, 140) } : { ok: false, message: 'Add a title.' };
    case 'brand':
      return { ok: true, value: s.slice(0, 60) };
    case 'category':
    case 'platform':
      return { ok: true, value: s.slice(0, 40) || null };
    case 'views': {
      const n = parseViews(s);
      return n === undefined ? { ok: false, message: VIEWS_MESSAGE } : { ok: true, value: n ?? 0 };
    }
    case 'uploadDate':
      if (!s) return { ok: true, value: null };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: false, message: 'Pick a whole day, or clear the date.' };
      return s > today() ? { ok: false, message: 'The upload date cannot be in the future.' } : { ok: true, value: s };
    case 'instagram':
    case 'youtube': {
      if (!s) return { ok: true, value: null };
      const r = f === 'instagram' ? parseInstagram(s) : parseYouTube(s);
      return r.ok ? { ok: true, value: r.url } : { ok: false, message: f === 'instagram' ? "That isn't an Instagram link." : "That isn't a YouTube link." };
    }
    case 'aspect':
      return (VIDEO_ASPECTS as readonly string[]).includes(s) ? { ok: true, value: s } : { ok: false, message: 'Pick Vertical or Landscape.' };
    case 'sortOrder': {
      const n = Number(s.replace(/[,\s]/g, ''));
      return s && Number.isInteger(n) && Math.abs(n) <= 1e9 ? { ok: true, value: n } : { ok: false, message: 'Write the order as a whole number, like 10.' };
    }
    case 'featured':
      return { ok: true, value: s === '1' || s === 'true' };
    case 'mega': {
      if (!s) return { ok: true, value: null };
      const r = parseMegaLink(s);
      if (!r.ok) return { ok: false, message: MEGA_PARSE[r.problem] ?? MEGA_PARSE['not-mega']! };
      if (r.link.kind === 'folder') return { ok: false, message: MEGA_PARSE.folder! };
      return { ok: true, value: s };
    }
  }
}

const sameValue = (v: AdminVideo, f: CellField, value: CellValue) => (f === 'mega' ? (v.mega?.url ?? null) === value : (v[PROP[f]] ?? null) === value);
/** The MEGA link is not shown optimistically (the server checks it first): the cell says "Checking MEGA…" until it answers. */
const withValue = (v: AdminVideo, f: CellField, value: CellValue): AdminVideo => (f === 'mega' ? v : { ...v, [PROP[f]]: value });

function saveError(e: unknown): string {
  if (!(e instanceof AdminApiError)) return "Couldn't save. Try again.";
  if (e.code === 'cannot-publish') {
    const words = (e.body.problems ?? []).map((p) => PROBLEM_WORDS[p]).filter(Boolean);
    return `${words[0] ?? 'Fix the video'} to keep it published, or hide it first.`;
  }
  if (e.code === 'server') return e.requestId ? `Something broke on our side. Request ${e.requestId}.` : 'Something broke on our side.';
  if (e.code === 'duplicate') return `${e.message}.`;
  return e.message;
}

// ---------------------------------------------------------------- the editor's state, one per list

export type CellState = { kind: 'saving' } | { kind: 'saved' } | { kind: 'error' | 'stale'; message: string };
type How = 'enter' | 'tab' | 'shift-tab' | 'blur';

export const cellKey = (id: string, f: CellField) => `${f}:${id}`;
const splitKey = (key: string) => {
  const i = key.indexOf(':');
  return { field: key.slice(0, i) as CellField, id: key.slice(i + 1) };
};
const cellEl = (key: string) => [...document.querySelectorAll<HTMLElement>('.adm-rows [data-cell]')].find((el) => el.dataset.cell === key) ?? null;

export interface InlineEditor {
  editing: { id: string; field: CellField; base: AdminVideo } | null;
  stateOf: (id: string, f: CellField) => CellState | undefined;
  start: (v: AdminVideo, f: CellField) => void;
  cancel: () => void;
  /** Returns the validation message when the editor must stay open, else null. */
  commit: (raw: string | null, how: How) => string | null;
  /** A cell editor closed by a click elsewhere in the last moment: that click must not also open the drawer. */
  justClosed: () => boolean;
  /** Another write (the Published switch) moved this row's updated_at: later inline saves expect the new one. */
  noteAdvance: (id: string, from: string, to: string) => void;
  /** (admin14) A save without an editor (the Featured switch): optimistic, queued behind the row's other saves, rolled back on an error. */
  saveNow: (v: AdminVideo, f: CellField, value: CellValue) => void;
  /** Datalist ids for brand, category and platform suggestions. */
  lists: { brand: string; category: string; platform: string };
}

export function useInlineEditor(lists: InlineEditor['lists'], announce: (text: string) => void): InlineEditor {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<InlineEditor['editing']>(null);
  const editingRef = useRef(editing);
  editingRef.current = editing;
  const [states, setStates] = useState<ReadonlyMap<string, CellState>>(new Map());
  const timers = useRef(new Map<string, number>());
  const focusAfter = useRef<string | null>(null);
  const closedAt = useRef(0);
  const chains = useRef(new Map<string, Promise<void>>());
  const advances = useRef(new Map<string, string>());
  /** Optimistic values still on their way, per row and field, with the token of the newest save. */
  const overlays = useRef(new Map<string, Map<CellField, { token: number; value: CellValue }>>());
  const confirmed = useRef(new Map<string, AdminVideo>());
  const seq = useRef(0);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const setState = useCallback((key: string, s: CellState | null, clearAfter?: number) => {
    window.clearTimeout(timers.current.get(key));
    timers.current.delete(key);
    setStates((old) => {
      const next = new Map(old);
      if (s) next.set(key, s);
      else next.delete(key);
      return next;
    });
    if (s && clearAfter) {
      timers.current.set(
        key,
        window.setTimeout(() => {
          timers.current.delete(key);
          setStates((old) => {
            if (old.get(key) !== s) return old;
            const next = new Map(old);
            next.delete(key);
            return next;
          });
        }, clearAfter),
      );
    }
  }, []);

  // Focus back on the cell after Enter or Esc, once the input is gone.
  useEffect(() => {
    const key = focusAfter.current;
    if (!key || editing) return;
    focusAfter.current = null;
    cellEl(key)?.querySelector<HTMLElement>('.adm-cell-btn')?.focus({ preventScroll: true });
  }, [editing]);

  const current = useCallback((id: string) => qc.getQueryData<AdminVideoList>(keys.videos(false))?.videos.find((v) => v.id === id), [qc]);

  const withOverlay = useCallback((v: AdminVideo) => {
    const o = overlays.current.get(v.id);
    if (!o) return v;
    let out = v;
    for (const [f, { value }] of o) out = withValue(out, f, value);
    return out;
  }, []);

  const noteAdvance = useCallback((id: string, from: string, to: string) => {
    if (from !== to) advances.current.set(`${id}|${from}`, to);
  }, []);

  const expectFor = (id: string, from: string) => {
    let at = from;
    for (let i = 0; i < 50 && advances.current.has(`${id}|${at}`); i++) at = advances.current.get(`${id}|${at}`)!;
    return at;
  };

  const save = (base: AdminVideo, field: CellField, value: CellValue) => {
    const { id } = base;
    const key = cellKey(id, field);
    const token = ++seq.current;
    let o = overlays.current.get(id);
    if (!o) overlays.current.set(id, (o = new Map()));
    o.set(field, { token, value });
    const now = current(id);
    const before = now ?? base;
    void qc.cancelQueries({ queryKey: keys.videos(false) });
    if (now) mergeVideo(qc, withValue(now, field, value));
    setState(key, { kind: 'saving' });
    const newest = () => overlays.current.get(id)?.get(field)?.token === token;
    const drop = () => {
      if (newest()) overlays.current.get(id)?.delete(field);
    };

    const run = async () => {
      const expect = expectFor(id, base.updatedAt);
      const write: VideoWrite = { [field]: value, expectUpdatedAt: expect };
      try {
        const r = await adminApi.updateVideo(id, write);
        noteAdvance(id, expect, r.video.updatedAt);
        confirmed.current.set(id, r.video);
        const mine = newest();
        drop();
        mergeVideo(qc, withOverlay(r.video));
        if (mine) {
          setState(key, { kind: 'saved' }, 1600);
          announce(`Saved the ${CELL_LABEL[field]}.`);
        }
        // Only the link just saved: every later save of the row would repeat it.
        for (const w of r.warnings) if (w.code === `${field}-in-use`) toast(w.message);
        if (field === 'mega') {
          // What the server's MEGA check said (heavy, HEVC, …), as the drawer shows it; then the hover preview and thumbnail for the new file.
          const notes = r.warnings.filter((w) => w.code !== 'no-header-info');
          if (mine) toast(notes.length ? notes.map((w) => w.message).join(' ') : r.video.mega ? 'MEGA link saved and checked.' : 'MEGA link removed.');
          if (canMake(r.video) && sourceKey(r.video) !== sourceKey(before)) {
            attachQueryClient(qc);
            makeMedia([r.video], { mode: r.video.preview ? 'regenerate' : 'missing' });
          }
        }
      } catch (e) {
        const mine = newest();
        drop();
        if (e instanceof AdminApiError && e.code === 'stale' && e.body.video) {
          const fresh = e.body.video;
          confirmed.current.set(id, fresh);
          mergeVideo(qc, withOverlay(fresh));
          const shown = cellDisplay(fresh, field);
          setState(key, { kind: 'stale', message: shown ? `Changed in another tab. It now reads “${shown}”.` : "Changed in another tab. It's empty there now." }, 12000);
          announce('Changed in another tab. Kept the other change.');
          return;
        }
        if (mine) {
          const back = confirmed.current.get(id) ?? base;
          const cur = current(id);
          if (cur) mergeVideo(qc, withValue(cur, field, back[PROP[field]] as CellValue));
          setState(key, { kind: 'error', message: saveError(e) }, 12000);
        }
      }
    };
    const chain = (chains.current.get(id) ?? Promise.resolve()).then(run, run);
    chains.current.set(id, chain);
  };

  const start = useCallback(
    (v: AdminVideo, f: CellField) => {
      const key = cellKey(v.id, f);
      setStates((old) => {
        const s = old.get(key);
        if (!s || s.kind === 'saving') return old;
        const next = new Map(old);
        next.delete(key);
        return next;
      });
      setEditing({ id: v.id, field: f, base: v });
    },
    [],
  );

  const cancel = useCallback(() => {
    const ed = editingRef.current;
    if (!ed) return;
    focusAfter.current = cellKey(ed.id, ed.field);
    setEditing(null);
  }, []);

  const commit = (raw: string | null, how: How): string | null => {
    const ed = editingRef.current;
    if (!ed) return null;
    const key = cellKey(ed.id, ed.field);
    const parsed = parseCell(ed.field, raw);
    if (!parsed.ok && how !== 'blur') return parsed.message;
    let next: string | null = null;
    if (how === 'tab' || how === 'shift-tab') {
      const cells = [...document.querySelectorAll<HTMLElement>('.adm-rows [data-cell]')];
      const i = cells.findIndex((el) => el.dataset.cell === key);
      next = cells[i + (how === 'tab' ? 1 : -1)]?.dataset.cell ?? null;
    }
    editingRef.current = null;
    if (!parsed.ok) {
      // Clicked away from a value that can't be saved: the old value stays, and the cell says why.
      closedAt.current = Date.now();
      setEditing(null);
      setState(key, { kind: 'error', message: parsed.message }, 12000);
      return null;
    }
    const now = current(ed.id) ?? ed.base;
    if (!sameValue(now, ed.field, parsed.value)) save(ed.base, ed.field, parsed.value);
    const target = next ? splitKey(next) : null;
    const nextVideo = target ? current(target.id) : undefined;
    if (target && nextVideo) {
      setEditing({ id: target.id, field: target.field, base: nextVideo });
      return null;
    }
    if (how === 'blur') closedAt.current = Date.now();
    else focusAfter.current = key;
    setEditing(null);
    return null;
  };

  const stateOf = useCallback((id: string, f: CellField) => states.get(cellKey(id, f)), [states]);
  const justClosed = useCallback(() => Date.now() - closedAt.current < 400, []);
  const saveNow = (v: AdminVideo, f: CellField, value: CellValue) => {
    const now = current(v.id) ?? v;
    if (!sameValue(now, f, value)) save(now, f, value);
  };

  return { editing, stateOf, start, cancel, commit, justClosed, noteAdvance, saveNow, lists };
}

// ---------------------------------------------------------------- one cell

const PLACEHOLDER: Partial<Record<CellField, string>> = {
  views: '60K',
  instagram: 'https://www.instagram.com/reel/…',
  youtube: 'https://www.youtube.com/shorts/…',
  mega: 'https://mega.nz/file/…#…',
  sortOrder: '10',
};
const MAX: Partial<Record<CellField, number>> = { title: 140, brand: 60, category: 40, platform: 40 };

function CellEditor({ video, field, inline }: { video: AdminVideo; field: CellField; inline: InlineEditor }) {
  const [text, setText] = useState(() => cellText(video, field));
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);
  const ref = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const setRef = (el: HTMLInputElement | HTMLSelectElement | null) => {
    ref.current = el;
  };
  const msgId = useId();
  const isLink = field === 'instagram' || field === 'youtube' || field === 'mega';
  const list = field === 'brand' || field === 'category' || field === 'platform' ? inline.lists[field] : undefined;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    if (el instanceof HTMLInputElement && el.type !== 'date') el.select();
  }, []);

  const read = () => {
    const el = ref.current;
    if (!el) return text;
    return field === 'uploadDate' && el instanceof HTMLInputElement && el.validity.badInput ? null : el.value;
  };

  const finish = (how: How) => {
    const msg = inline.commit(read(), how);
    if (msg) {
      setError(msg);
      return;
    }
    done.current = true;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finish('enter');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      done.current = true;
      inline.cancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      finish(e.shiftKey ? 'shift-tab' : 'tab');
    }
  };

  const parsed = isLink && field !== 'mega' && text.trim() ? (field === 'instagram' ? parseInstagram(text) : parseYouTube(text)) : null;
  const openHref = parsed?.ok ? parsed.url : null;
  const name = `${INPUT_LABEL[field]}, ${video.title || 'Untitled video'}`;

  if (field === 'aspect') {
    return (
      <span className="adm-cell-editor" data-field={field}>
        <select
          ref={setRef}
          className="adm-cell-input adm-cell-select"
          value={text}
          aria-label={name}
          onChange={(e) => {
            setText(e.target.value);
            // A pick saves at once, like a click on a menu item.
            done.current = true;
            const msg = inline.commit(e.target.value, 'enter');
            if (msg) {
              done.current = false;
              setError(msg);
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (done.current) return;
            done.current = true;
            inline.commit(read(), 'blur');
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {VIDEO_ASPECTS.map((a) => (
            <option key={a} value={a}>
              {ASPECT_WORDS[a]}
            </option>
          ))}
        </select>
      </span>
    );
  }

  return (
    <span className="adm-cell-editor" data-field={field}>
      <input
        ref={setRef}
        className="adm-cell-input"
        type={field === 'uploadDate' ? 'date' : field === 'sortOrder' ? 'number' : 'text'}
        step={field === 'sortOrder' ? 1 : undefined}
        value={text}
        min={field === 'uploadDate' ? '2000-01-01' : undefined}
        max={field === 'uploadDate' ? today() : undefined}
        maxLength={MAX[field]}
        list={list}
        placeholder={PLACEHOLDER[field]}
        inputMode={isLink ? 'url' : field === 'sortOrder' ? 'numeric' : undefined}
        spellCheck={isLink ? false : undefined}
        autoCapitalize={isLink ? 'off' : undefined}
        autoComplete="off"
        aria-label={name}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? msgId : undefined}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (done.current) return;
          done.current = true;
          inline.commit(read(), 'blur');
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {openHref && (
        // Keeps the focus in the input (no blur, no save) and opens the link.
        <a className="adm-cell-open" href={openHref} target="_blank" rel="noopener noreferrer" onMouseDown={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
          Open<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {field === 'mega' && !error && <span className="adm-cell-msg adm-cell-help" data-kind="help">Paste the file link with its key. Enter checks it with MEGA and saves.</span>}
      {error && (
        <span className="adm-cell-msg" id={msgId} role="alert" data-kind="error">
          {error}
        </span>
      )}
    </span>
  );
}

/**
 * A list cell. Editable: a button ("Edit title, {video title}") that becomes an input; read-only (phones, the bin): just the content.
 * An empty field shows nothing; a faint "Add" (or the faint glyph) appears on hover and focus so the cell is still found.
 */
export function EditCell({
  video,
  field,
  inline,
  children,
  tooltip,
  className,
}: {
  video: AdminVideo;
  field: CellField;
  inline: InlineEditor | null;
  /** What the cell shows; empty means missing. */
  children?: ReactNode;
  tooltip?: string;
  className?: string;
}) {
  const msgId = useId();
  const key = cellKey(video.id, field);
  const text = cellDisplay(video, field);
  const empty = !text && field !== 'brand' && field !== 'mega';
  const isGlyph = field === 'instagram' || field === 'youtube';
  const state = inline?.stateOf(video.id, field);
  const editing = !!inline && inline.editing?.id === video.id && inline.editing.field === field;
  const label = useMemo(() => {
    const name = video.title || 'Untitled video';
    const shown = field === 'title' || isGlyph ? '' : field === 'mega' ? (video.mega ? 'set' : 'none') : text || (field === 'brand' ? 'Brand needed' : 'empty');
    return `Edit ${CELL_LABEL[field]}, ${name}${shown ? `. ${shown}` : ''}`;
  }, [video.title, field, isGlyph, text]);

  if (!inline) {
    return (
      <span className={`adm-vcell ${className ?? ''}`} data-field={field}>
        {empty ? null : children}
      </span>
    );
  }

  const message = state && (state.kind === 'error' || state.kind === 'stale') ? state : null;
  return (
    <span className={`adm-vcell ${className ?? ''}`} data-cell={key} data-field={field} data-editing={editing ? '' : undefined} data-state={state?.kind} data-empty={empty ? '' : undefined}>
      {editing ? (
        <CellEditor video={video} field={field} inline={inline} />
      ) : (
        <button
          type="button"
          className="adm-cell-btn"
          aria-label={label}
          aria-describedby={message ? msgId : undefined}
          aria-busy={state?.kind === 'saving' || undefined}
          title={tooltip ?? (text && !isGlyph ? text : undefined)}
          onClick={(e) => {
            // (sel) Shift, Cmd or Ctrl + click selects the row instead (the row handles it); it never opens the editor.
            if (e.shiftKey || e.metaKey || e.ctrlKey) return;
            e.stopPropagation();
            inline.start(video, field);
          }}
          onKeyDown={(e) => {
            if (e.key === 'F2') {
              e.preventDefault();
              inline.start(video, field);
            }
          }}
        >
          {field === 'mega' && state?.kind === 'saving' ? null : empty && !isGlyph ? (
            <span className="adm-cell-add" aria-hidden>
              Add
            </span>
          ) : (
            children
          )}
          {state?.kind === 'saving' && field === 'mega' && <span className="adm-cell-checking">Checking MEGA…</span>}
          {state?.kind === 'saving' && <Spinner className="adm-spin-sm adm-cell-spin" />}
          {state?.kind === 'saved' && <Check className="adm-cell-tick" aria-hidden />}
        </button>
      )}
      {message && !editing && (
        <span className="adm-cell-msg" id={msgId} role="alert" data-kind={message.kind}>
          {message.message}
        </span>
      )}
    </span>
  );
}
