// The tab kit (visual §1.4, motion M5). One engine, useThumb, drives every sliding highlight on the site: the nav, segments, chip rails, tab bars and
// the chapter index. Each component gets its own role: radio, tab, link with aria-current, or a pressed toggle.
//
// The thumb is one absolutely positioned span, 100 px along its axis, moved with translate and scaled to the target's size, its radius divided by the
// scale so the pill keeps its corners. Three physics springs, so a change of mind mid-flight keeps its speed, and nothing re-renders at 60 fps.

import { AnimatePresence, m, useMotionValueEvent, useSpring } from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Link, useLocation } from 'react-router';
import { motionOk } from '../lib/motionOk';
import { spring } from '../lib/spring';

// ---------- The engine ----------

export type ThumbAxis = 'x' | 'y';

export interface ThumbApi<E extends HTMLElement = HTMLSpanElement> {
  /** Render `<span ref={thumb} className="tab-thumb" aria-hidden />` inside the container (in a list, an `<li role="presentation">`). */
  thumb: RefObject<E | null>;
  /** Move the thumb onto an element, or the n-th `[data-thumb-item]` in the container. Null hides it. */
  go: (target: HTMLElement | number | null | undefined, instant?: boolean) => void;
  /** Back onto the active item (or hidden when there is none). */
  settle: (instant?: boolean) => void;
}

/**
 * The sliding highlight. `container` must be the thumb's offset parent (position: relative); items carry `data-thumb-item`; `active` is the index of the
 * one the thumb rests on, or null to hide it. It re-measures on resize and when the fonts land, and it jumps instead of sliding under Pause animations.
 * On the thumb, `--thumb-r` sets its corner radius (default: a pill) and `--thumb-inset` shrinks it across its axis.
 */
export function useThumb<E extends HTMLElement = HTMLSpanElement>(container: RefObject<HTMLElement | null>, active: number | null, axis: ThumbAxis = 'x'): ThumbApi<E> {
  const thumb = useRef<E>(null);
  const px = useSpring(0, spring.snappy);
  const py = useSpring(0, spring.snappy);
  const size = useSpring(100, spring.snappy);
  const shown = useRef(false);
  const radius = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const draw = useCallback(() => {
    const el = thumb.current;
    if (!el) return;
    const s = Math.max(size.get(), 1) / 100;
    const r = radius.current;
    if (axis === 'x') {
      el.style.transform = `translate(${px.get()}px, ${py.get()}px) scaleX(${s})`;
      el.style.borderRadius = `${r / s}px / ${r}px`;
    } else {
      el.style.transform = `translate(${px.get()}px, ${py.get()}px) scaleY(${s})`;
      el.style.borderRadius = `${r}px / ${r / s}px`;
    }
  }, [axis, px, py, size]);

  useMotionValueEvent(px, 'change', draw);
  useMotionValueEvent(py, 'change', draw);
  useMotionValueEvent(size, 'change', draw);

  const item = useCallback((i: number) => container.current?.querySelectorAll<HTMLElement>('[data-thumb-item]')[i] ?? null, [container]);

  const go = useCallback(
    (target: HTMLElement | number | null | undefined, instant = false) => {
      const el = thumb.current;
      const box = container.current;
      const node = typeof target === 'number' ? item(target) : target;
      if (!el || !box) return;
      if (!node || node.getClientRects().length === 0) {
        delete el.dataset.show;
        shown.current = false;
        return;
      }
      const b = box.getBoundingClientRect();
      const r = node.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // --thumb-inset (px) shrinks the thumb across its axis, as v1's nav highlight sat 4 px inside its item.
      const inset = parseFloat(cs.getPropertyValue('--thumb-inset')) || 0;
      const x = r.left - b.left + box.scrollLeft - box.clientLeft + (axis === 'y' ? inset : 0);
      const y = r.top - b.top + box.scrollTop - box.clientTop + (axis === 'x' ? inset : 0);
      const cross = (axis === 'x' ? r.height : r.width) - inset * 2;
      // The cross size never animates: it is set, not tweened.
      if (axis === 'x') el.style.height = `${cross}px`;
      else el.style.width = `${cross}px`;
      const custom = parseFloat(cs.getPropertyValue('--thumb-r'));
      radius.current = Number.isFinite(custom) ? custom : cross / 2;
      const main = axis === 'x' ? r.width : r.height;
      if (shown.current && !instant && motionOk()) {
        px.set(x);
        py.set(y);
        size.set(main);
      } else {
        px.jump(x);
        py.jump(y);
        size.jump(main);
        draw();
      }
      el.dataset.show = '';
      shown.current = true;
    },
    [axis, container, draw, item, px, py, size],
  );

  const settle = useCallback((instant = false) => go(activeRef.current === null ? null : item(activeRef.current), instant), [go, item]);

  useLayoutEffect(() => {
    settle();
  }, [active, settle]);

  // Fonts arriving, a rail wrapping or the window resizing all move the items: follow them without a slide.
  useEffect(() => {
    const box = container.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => settle(true));
    observer.observe(box);
    for (const child of box.querySelectorAll('[data-thumb-item]')) observer.observe(child);
    let alive = true;
    void document.fonts?.ready.then(() => alive && settle(true));
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [container, settle]);

  return { thumb, go, settle };
}

/** Roving focus for a row of buttons: arrows (and Home, End) return the next index, or null for any other key. */
function nextIndex(e: KeyboardEvent, index: number, count: number): number | null {
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (step) return (index + step + count) % count;
  if (e.key === 'Home') return 0;
  if (e.key === 'End') return count - 1;
  return null;
}

/** Scroll a horizontal rail so its item is in view, without ever moving the page itself. Instant under Pause animations. */
function revealInRail(rail: HTMLElement | null, item: HTMLElement | null | undefined) {
  if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return;
  const left = item.offsetLeft - rail.offsetLeft;
  const right = left + item.offsetWidth;
  const pad = 16;
  let to: number | null = null;
  if (left - pad < rail.scrollLeft) to = Math.max(0, left - pad);
  else if (right + pad > rail.scrollLeft + rail.clientWidth) to = right + pad - rail.clientWidth;
  if (to !== null) rail.scrollTo({ left: to, behavior: motionOk() ? 'smooth' : 'instant' });
}

// ---------- Segment: equal columns, one choice ----------

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

/** A segmented control: equal columns and one thumb. A radiogroup with roving focus; arrow keys move the choice. */
export function Segment<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = 'md',
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** The group's accessible name. */
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const box = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const { thumb } = useThumb(box, index);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = nextIndex(e, index, options.length);
    if (next === null) return;
    e.preventDefault();
    const option = options[next];
    if (option) onChange(option.value);
    buttons.current[next]?.focus();
  };

  return (
    <div ref={box} className={`segment ${className ?? ''}`} data-size={size} role="radiogroup" aria-label={label} style={{ '--n': options.length } as CSSProperties} onKeyDown={onKey}>
      <span ref={thumb} className="tab-thumb segment-thumb" aria-hidden />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          tabIndex={i === index ? 0 : -1}
          className="segment-opt"
          data-thumb-item
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- ChipRail: pills of unequal width ----------

export interface ChipOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** A small count after the label. */
  count?: number;
  disabled?: boolean;
}

export interface ChipLink {
  to: string;
  label: ReactNode;
  count?: number;
}

interface ChipRailBase {
  /** The group's accessible name. */
  label: string;
  className?: string;
  /** sm: 36 px pills (filter bars); md: 44 px (default). */
  size?: 'sm' | 'md';
  /** Wrap onto more rows instead of scrolling sideways. */
  wrap?: boolean;
}

export type ChipRailProps<T extends string = string> =
  | (ChipRailBase & {
      /** One choice, or none (the thumb hides when no chip matches `value`). */
      mode: 'radio';
      options: ChipOption<T>[];
      value: T | null;
      onChange: (value: T) => void;
    })
  | (ChipRailBase & {
      /** Any number of choices: aria-pressed toggles, a fill per chip, no thumb. */
      mode: 'multi';
      options: ChipOption<T>[];
      value: readonly T[];
      onChange: (value: T[]) => void;
    })
  | (ChipRailBase & {
      /** Navigation. The thumb sits on `current` (a link's `to`); by default the link matching the current path. */
      mode: 'links';
      links: ChipLink[];
      current?: string | null;
      /** aria-current value: 'page' for routes (default), 'location' for in-page chapters. */
      currentKind?: 'page' | 'location';
    });

function Count({ n }: { n?: number }) {
  return n === undefined ? null : <span className="chip-count">{n}</span>;
}

function CheckGlyph() {
  return (
    <svg className="chip-check" viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A row of chips. `radio` and `links` share the sliding ink thumb; `multi` fills each pressed chip instead. On a phone the row scrolls sideways with snap
 * and keeps the active chip in view.
 */
export function ChipRail<T extends string = string>(props: ChipRailProps<T>) {
  const { label, className, size = 'md', wrap = false } = props;
  const box = useRef<HTMLDivElement>(null);
  const { pathname, hash } = useLocation();
  const buttons = useRef<(HTMLElement | null)[]>([]);

  let active: number | null = null;
  if (props.mode === 'radio') {
    const i = props.options.findIndex((o) => o.value === props.value);
    active = i >= 0 ? i : null;
  } else if (props.mode === 'links') {
    const current =
      props.current !== undefined
        ? props.current
        : (props.links.find((l) => {
            const [path, fragment] = l.to.split('#');
            if (fragment) return pathname === (path || pathname) && hash === `#${fragment}`;
            return pathname === l.to || (l.to !== '/' && pathname.startsWith(`${l.to}/`));
          })?.to ?? null);
    const i = current === null ? -1 : props.links.findIndex((l) => l.to === current);
    active = i >= 0 ? i : null;
  }

  const { thumb } = useThumb(box, props.mode === 'multi' ? null : active);

  useEffect(() => {
    if (active !== null) revealInRail(box.current, buttons.current[active]);
  }, [active]);

  const common = {
    ref: box,
    className: `chip-rail ${className ?? ''}`,
    'data-size': size,
    'data-wrap': wrap ? '' : undefined,
    'data-mode': props.mode,
  };

  if (props.mode === 'links') {
    const kind = props.currentKind ?? 'page';
    return (
      <nav aria-label={label}>
        <div {...common}>
          <span ref={thumb} className="tab-thumb chip-thumb" aria-hidden />
          {props.links.map((l, i) => (
            <Link
              key={l.to}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              to={l.to}
              className="chip-opt"
              data-thumb-item
              aria-current={i === active ? kind : undefined}
              data-on={i === active ? '' : undefined}
            >
              <span className="chip-label">{l.label}</span>
              <Count n={l.count} />
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  if (props.mode === 'multi') {
    const set = new Set<T>(props.value);
    const toggle = (v: T) => props.onChange(set.has(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    return (
      <div {...common} role="group" aria-label={label}>
        {props.options.map((o) => {
          const on = set.has(o.value);
          return (
            <button key={o.value} type="button" className="chip-opt" aria-pressed={on} data-on={on ? '' : undefined} disabled={o.disabled} onClick={() => toggle(o.value)}>
              <CheckGlyph />
              <span className="chip-label">{o.label}</span>
              <Count n={o.count} />
            </button>
          );
        })}
      </div>
    );
  }

  // radio
  const { options, onChange } = props;
  const focusIndex = active ?? 0;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = nextIndex(e, focusIndex, options.length);
    if (next === null) return;
    e.preventDefault();
    const option = options[next];
    if (option && !option.disabled) onChange(option.value);
    buttons.current[next]?.focus();
  };
  return (
    <div {...common} role="radiogroup" aria-label={label} onKeyDown={onKey}>
      <span ref={thumb} className="tab-thumb chip-thumb" aria-hidden />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === active}
          tabIndex={i === focusIndex ? 0 : -1}
          className="chip-opt"
          data-thumb-item
          data-on={i === active ? '' : undefined}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          <span className="chip-label">{o.label}</span>
          <Count n={o.count} />
        </button>
      ))}
    </div>
  );
}

// ---------- TabBar: tabs that swap a panel ----------

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  /** A count badge, such as new enquiries. */
  count?: number;
}

/** The ids that tie a tab to its panel. */
export const tabIds = (idBase: string, id: string) => ({ tab: `${idBase}-tab-${id}`, panel: `${idBase}-panel-${id}` });

/**
 * A tablist with manual activation: arrows move the focus, Enter or Space (a click) chooses. Render the content in a `TabPanel` with the same `idBase`.
 */
export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idBase,
  className,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  /** Unique on the page; ties tabs to panels. */
  idBase: string;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );
  const { thumb } = useThumb(box, index);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = buttons.current.findIndex((b) => b === document.activeElement);
    const next = nextIndex(e, current < 0 ? index : current, tabs.length);
    if (next === null) return;
    e.preventDefault();
    buttons.current[next]?.focus();
  };

  return (
    <div ref={box} className={`tab-bar ${className ?? ''}`} role="tablist" aria-label={label} onKeyDown={onKey}>
      <span ref={thumb} className="tab-thumb tab-bar-thumb" aria-hidden />
      {tabs.map((t, i) => {
        const ids = tabIds(idBase, t.id);
        return (
          <button
            key={t.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            id={ids.tab}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-controls={ids.panel}
            tabIndex={i === index ? 0 : -1}
            className="tab-opt"
            data-thumb-item
            onClick={() => onChange(t.id)}
          >
            <span className="tab-label">{t.label}</span>
            {t.count !== undefined && t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The panel under a TabBar (motion M5h): the old content fades out in 120 ms, the new rises 8 px (and slides 16 px toward the tab that was chosen) on
 * spring.smooth. `order` is the tab's position, so the slide knows its direction.
 */
export function TabPanel({ idBase, id, order = 0, children, className }: { idBase: string; id: string; order?: number; children: ReactNode; className?: string }) {
  const ids = tabIds(idBase, id);
  const last = useRef(order);
  const dir = Math.sign(order - last.current);
  useEffect(() => {
    last.current = order;
  }, [order]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={id}
        id={ids.panel}
        role="tabpanel"
        aria-labelledby={ids.tab}
        tabIndex={0}
        className={`tab-panel ${className ?? ''}`}
        initial={{ opacity: 0, y: 8, x: dir * 16 }}
        animate={{ opacity: 1, y: 0, x: 0, transition: spring.smooth }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeOut' } }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

// ---------- IndexRail: a scroll-spied chapter index ----------

export interface IndexItem {
  /** The section's element id. */
  id: string;
  label: ReactNode;
}

/** Which of these sections the reader is in (one passive scroll listener, read once a frame). Null only for an empty list. */
export function useScrollSpy(ids: readonly string[]): string | null {
  // The first section at the top of the page, then the last one whose top has passed a line a third of the way down the window (A6's useSectionAt,
  // lifted here by A7). The earlier IntersectionObserver version kept its last answer after the page scrolled back above the first section.
  const key = ids.join('|');
  const [current, setCurrent] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (!key) return;
    const list = key.split('|');
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let at = list[0] ?? null;
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) at = id;
      }
      setCurrent(at);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [key]);
  return current;
}

/**
 * A sticky "On this page" list. Links carry aria-current="location"; the thumb is a tinted pill with a 3 px rail marker, sliding on the y axis.
 * Pass `active` to drive it yourself, or leave it out and it spies on the sections by id.
 */
export function IndexRail({ items, title = 'On this page', active, className }: { items: IndexItem[]; title?: string; active?: string | null; className?: string }) {
  // A page that drives `active` itself needs no second scroll listener.
  const spied = useScrollSpy(active !== undefined ? [] : items.map((i) => i.id));
  const current = active !== undefined ? active : spied;
  const index = items.findIndex((i) => i.id === current);
  const box = useRef<HTMLOListElement>(null);
  const { thumb } = useThumb<HTMLLIElement>(box, index >= 0 ? index : null, 'y');
  const headingId = useId();
  return (
    <nav className={`index-rail ${className ?? ''}`} aria-labelledby={headingId}>
      <p id={headingId} className="index-rail-title">
        {title}
      </p>
      <ol ref={box} className="index-rail-list">
        <li ref={thumb} className="tab-thumb index-rail-thumb" role="presentation" aria-hidden />
        {items.map((item, i) => (
          <li key={item.id} data-thumb-item>
            <Link to={`#${item.id}`} className="index-rail-link" aria-current={i === index ? 'location' : undefined} preventScrollReset>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ---------- Small pieces for actions ----------

/**
 * The label roll (M5b): on hover the label slides up and an identical copy rises from below. Whole label, never per letter; the copy is aria-hidden.
 * Put it directly inside the <a> or <button>; the hover rule keys off that parent. Primary action, nav top items, the footer action, Watch links.
 */
export function LabelRoll({ children, className }: { children: string; className?: string }) {
  return (
    <span className={`label-roll ${className ?? ''}`}>
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}

/**
 * The arrow disc (M5c): a 32 px disc beside an action's label. `go` (default) holds a ↗ that turns to → on hover, for links that stay on the site;
 * `out` keeps the ↗ and nudges it up and out, for links that open a new tab. Decoration: aria-hidden. Put it directly inside the <a> or <button>.
 */
export function ArrowDisc({ kind = 'go', className }: { kind?: 'go' | 'out'; className?: string }) {
  return (
    <span className={`arrow-disc ${className ?? ''}`} data-kind={kind} aria-hidden>
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
