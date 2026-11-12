// Owner: adm (round 3); fluid widths by admin14. The videos list's columns: which show, and the grid they make. The founder can hide any optional
// column (kept in this browser). Every column has a floor and a share of the room left (fr), so the list fills the window at any width and the title
// grows most; when the chosen columns' floors are wider than the window, the list scrolls sideways with the Video column held at the left (admin.css).
// Under 861 px the phone layout in admin.css takes over.
import { Columns3 } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { usePopover } from './bits';

export type ColKey = 'status' | 'stream' | 'featured' | 'category' | 'platform' | 'aspect' | 'uploaded' | 'views' | 'order' | 'posted' | 'updated';

export const COLUMNS: { key: ColKey; label: string; min: number; fr: number; optional: boolean }[] = [
  { key: 'status', label: 'Status', min: 100, fr: 0.9, optional: false },
  { key: 'stream', label: 'Stream', min: 138, fr: 1.4, optional: true },
  { key: 'featured', label: 'Featured', min: 64, fr: 0.5, optional: true },
  { key: 'category', label: 'Category', min: 80, fr: 1, optional: true },
  { key: 'platform', label: 'Platform', min: 72, fr: 0.9, optional: true },
  { key: 'aspect', label: 'Shape', min: 88, fr: 0.7, optional: true },
  { key: 'uploaded', label: 'Uploaded', min: 88, fr: 0.8, optional: true },
  { key: 'views', label: 'Views', min: 60, fr: 0.6, optional: true },
  { key: 'order', label: 'Order', min: 56, fr: 0.5, optional: true },
  { key: 'posted', label: 'Posted', min: 60, fr: 0.5, optional: true },
  { key: 'updated', label: 'Updated', min: 68, fr: 0.6, optional: true },
];

/** Columns that start hidden (the founder can show them from Columns). */
const DEFAULT_HIDDEN: ColKey[] = ['aspect', 'order'];
const GAP = 8;
/** (sel) The multi-select checkbox column, first. */
const CHECK = 32;
const TITLE_MIN = 200;
const TITLE_FR = 4;
const STORE_OLD = 'ka-admin-hidden-columns';
const STORE = 'ka-admin-columns-v2';

function readHidden(): Set<ColKey> {
  const valid = (raw: unknown) => (Array.isArray(raw) ? (raw.filter((k) => COLUMNS.some((c) => c.optional && c.key === k)) as ColKey[]) : []);
  try {
    const now = localStorage.getItem(STORE);
    if (now !== null) return new Set(valid((JSON.parse(now) as { hidden?: unknown }).hidden));
    // First visit since admin14: the old choice, plus the new columns that start hidden.
    return new Set([...valid(JSON.parse(localStorage.getItem(STORE_OLD) ?? '[]')), ...DEFAULT_HIDDEN]);
  } catch {
    return new Set(DEFAULT_HIDDEN);
  }
}

export interface Columns {
  shown: ReadonlySet<ColKey>;
  hidden: ReadonlySet<ColKey>;
  toggle: (k: ColKey) => void;
  /** grid-template-columns for the head and the rows. */
  template: string;
  /** The narrowest the list can be before it scrolls sideways (px). */
  minWidth: number;
}

export function useColumns(bin: boolean): Columns {
  const [hidden, setHidden] = useState(readHidden);
  const shown = useMemo(() => new Set(COLUMNS.filter((c) => !c.optional || !hidden.has(c.key)).map((c) => c.key)), [hidden]);

  const { template, minWidth } = useMemo(() => {
    const cols = COLUMNS.filter((c) => shown.has(c.key));
    const menu = bin ? 'minmax(220px, 260px)' : '44px';
    const template = [`${CHECK}px`, '40px', '36px', `minmax(${TITLE_MIN}px, ${TITLE_FR}fr)`, ...cols.map((c) => `minmax(${c.min}px, ${c.fr}fr)`), menu].join(' ');
    // The list's own padding (6 + 6) and the row's (8 + 12).
    const minWidth = 32 + CHECK + 40 + 36 + TITLE_MIN + cols.reduce((s, c) => s + c.min, 0) + (bin ? 220 : 44) + GAP * (cols.length + 4);
    return { template, minWidth };
  }, [shown, bin]);

  const toggle = useCallback((k: ColKey) => {
    setHidden((old) => {
      const next = new Set(old);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      try {
        localStorage.setItem(STORE, JSON.stringify({ hidden: [...next] }));
      } catch {
        // private window: the choice lasts for this visit
      }
      return next;
    });
  }, []);

  return { shown, hidden, toggle, template, minWidth };
}

/** "Columns": a small popover of checkboxes, at the start of the toolbar. */
export function ColumnsMenu({ cols }: { cols: Columns }) {
  const { pop, anchor, open, toggle } = usePopover('start');
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
          </label>
        ))}
      </div>
    </span>
  );
}
