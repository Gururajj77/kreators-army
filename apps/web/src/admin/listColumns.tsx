// Owner: adm (round 3). The videos list's columns: which show, and the grid they make. The founder can hide any optional column (kept in this
// browser); when the window is too narrow for the title to stay readable, the least useful ones step aside first (Updated, Platform, Category,
// Uploaded, Posted; in the bin the Deleted date goes last) and the Columns menu says so. Under 861 px the phone layout in admin.css takes over.
import { Columns3 } from 'lucide-react';
import { useCallback, useId, useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import { usePopover } from './bits';

export type ColKey = 'status' | 'stream' | 'category' | 'platform' | 'uploaded' | 'views' | 'posted' | 'updated';

export const COLUMNS: { key: ColKey; label: string; width: number; optional: boolean }[] = [
  { key: 'status', label: 'Status', width: 124, optional: false },
  { key: 'stream', label: 'Stream', width: 164, optional: true },
  { key: 'category', label: 'Category', width: 104, optional: true },
  { key: 'platform', label: 'Platform', width: 96, optional: true },
  { key: 'uploaded', label: 'Uploaded', width: 100, optional: true },
  { key: 'views', label: 'Views', width: 64, optional: true },
  { key: 'posted', label: 'Posted', width: 64, optional: true },
  { key: 'updated', label: 'Updated', width: 76, optional: true },
];

const DROP_FIRST: ColKey[] = ['updated', 'platform', 'category', 'uploaded', 'posted'];
/** In the bin the date is when it was deleted (the 30 days run from it): it goes last. */
const DROP_FIRST_BIN: ColKey[] = ['platform', 'category', 'uploaded', 'posted', 'updated'];
const GAP = 10;
const MIN_TITLE = 200;
const STORE = 'ka-admin-hidden-columns';

function readHidden(): Set<ColKey> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '[]') as unknown;
    return new Set(Array.isArray(raw) ? (raw.filter((k) => COLUMNS.some((c) => c.optional && c.key === k)) as ColKey[]) : []);
  } catch {
    return new Set();
  }
}

export interface Columns {
  shown: ReadonlySet<ColKey>;
  /** Wanted, but the window is too narrow for them. */
  squeezed: ReadonlySet<ColKey>;
  hidden: ReadonlySet<ColKey>;
  toggle: (k: ColKey) => void;
  /** grid-template-columns for the head and the rows. */
  template: string;
}

export function useColumns(ref: RefObject<HTMLElement | null>, bin: boolean): Columns {
  const [hidden, setHidden] = useState(readHidden);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => setWidth(Math.round(entries[0]?.contentRect.width ?? el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const { shown, squeezed } = useMemo(() => {
    const menu = bin ? 260 : 44;
    // The list's own padding (6 + 6) and the row's (8 + 12).
    const room = (ks: ColKey[]) => width - 32 - (40 + 36 + menu) - ks.reduce((s, k) => s + COLUMNS.find((c) => c.key === k)!.width, 0) - GAP * (ks.length + 3);
    let ks = COLUMNS.filter((c) => !hidden.has(c.key)).map((c) => c.key);
    const out = new Set<ColKey>();
    for (const k of bin ? DROP_FIRST_BIN : DROP_FIRST) {
      if (!width || room(ks) >= MIN_TITLE) break;
      if (ks.includes(k)) {
        ks = ks.filter((x) => x !== k);
        out.add(k);
      }
    }
    return { shown: new Set(ks), squeezed: out };
  }, [hidden, width, bin]);

  const template = useMemo(
    () => ['40px', '36px', 'minmax(0, 1fr)', ...COLUMNS.filter((c) => shown.has(c.key)).map((c) => `${c.width}px`), bin ? 'minmax(0, 260px)' : '44px'].join(' '),
    [shown, bin],
  );

  const toggle = useCallback((k: ColKey) => {
    setHidden((old) => {
      const next = new Set(old);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      try {
        localStorage.setItem(STORE, JSON.stringify([...next]));
      } catch {
        // private window: the choice lasts for this visit
      }
      return next;
    });
  }, []);

  return { shown, squeezed, hidden, toggle, template };
}

/** "Columns": a small popover of checkboxes. */
export function ColumnsMenu({ cols }: { cols: Columns }) {
  const { pop, anchor, open, toggle } = usePopover('end');
  const id = useId();
  return (
    <span className="adm-cols">
      <button ref={anchor} type="button" className="btn btn-sm btn-ghost adm-cols-btn" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <Columns3 className="size-4" aria-hidden /> Columns
      </button>
      <div ref={pop} id={id} popover="auto" role="dialog" aria-label="Columns" className="adm-pop adm-cols-pop">
        <p className="adm-pop-title">Columns</p>
        {COLUMNS.filter((c) => c.optional).map((c) => (
          <label key={c.key} className="adm-cols-opt">
            <input type="checkbox" checked={!cols.hidden.has(c.key)} onChange={() => cols.toggle(c.key)} />
            <span>{c.label}</span>
            {cols.squeezed.has(c.key) && <span className="adm-cols-note">Needs a wider window</span>}
          </label>
        ))}
      </div>
    </span>
  );
}
