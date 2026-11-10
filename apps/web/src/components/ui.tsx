import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { m, useMotionValueEvent, useSpring } from 'motion/react';
import { createElement, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ElementType, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from 'react';
import { Link } from 'react-router';
import { PRIMARY_ACTION, contactHref, type PlanSlug, type Stat } from '../lib/content';
import { finePointer, useMotionOk, useRunning } from '../lib/motionOk';
import { spring } from '../lib/spring';
import { WORDMARK } from './wordmark';

const SITE_TITLE = 'Kreators.Army';

/** Adds a tag to <head> for as long as the page that asked for it is showing, so the next route never inherits it. */
function useHeadTag(tag: 'meta' | 'link', attrs: Record<string, string> | null) {
  const key = attrs ? JSON.stringify(attrs) : '';
  useEffect(() => {
    if (!key) return;
    const el = document.createElement(tag);
    for (const [name, value] of Object.entries(JSON.parse(key) as Record<string, string>)) el.setAttribute(name, value);
    document.head.appendChild(el);
    return () => el.remove();
  }, [tag, key]);
}

/**
 * Sets the page's title and description. `noindex` keeps a page out of search (the 404, which the Worker serves with a 200), and `canonical` names the one
 * address a page with an alias should be indexed under.
 */
export function Seo({ title, description, noindex, canonical }: { title?: string; description: string; noindex?: boolean; canonical?: string }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_TITLE}` : 'Vox Pop Street Interview Agency for D2C Brands | Kreators.Army';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
  useHeadTag('meta', noindex ? { name: 'robots', content: 'noindex' } : null);
  useHeadTag('link', canonical ? { rel: 'canonical', href: new URL(canonical, window.location.origin).href } : null);
  return null;
}

// ---------- Reveal: CSS plus one shared observer. Nothing here depends on the Motion chunk. ----------

let seenObserver: IntersectionObserver | null = null;
const seenCallbacks = new Map<Element, () => void>();

/** Run `callback` the first time `el` enters the viewport. Every reveal, roll and "seen once" on the site shares one observer. */
export function whenSeen(el: Element, callback: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    callback();
    return () => undefined;
  }
  seenObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        seenObserver?.unobserve(entry.target);
        seenCallbacks.get(entry.target)?.();
        seenCallbacks.delete(entry.target);
      }
    },
    { rootMargin: '0px 0px -60px' },
  );
  seenCallbacks.set(el, callback);
  seenObserver.observe(el);
  return () => {
    seenObserver?.unobserve(el);
    seenCallbacks.delete(el);
  };
}

export interface RevealProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  as?: ElementType;
  /** Stagger position: 50 ms a step, capped at 8. */
  i?: number;
  /** Extra delay in seconds. */
  delay?: number;
  /** "rise" translates without fading: use it for headings. */
  variant?: 'fade' | 'rise';
}

/** Content settles in as it arrives. Hidden only after theme.js has run, and never under data-still or without JS. */
export function Reveal({ children, className, style, id, as = 'div', i, delay, variant = 'fade' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenSeen(el, () => {
      el.dataset.in = '';
    });
  }, []);
  const vars = { ...style, '--i': i, '--reveal-delay': delay ? `${delay}s` : undefined } as CSSProperties;
  return createElement(as, { ref, id, className, style: vars, 'data-reveal': variant }, children);
}

/** A section's heading block. The heading translates only, so it never reads as half-faded. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  center = true,
  action,
  size = 'h2',
  as: Tag = 'h2',
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  /** A link or button set to the right of the heading (below it when centred). */
  action?: ReactNode;
  size?: 'h2' | 'h2-sm' | 'h3';
  as?: 'h2' | 'h3';
  className?: string;
}) {
  const head = (
    <div className={`flex flex-col gap-4 ${center ? 'items-center text-center' : 'items-start'}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Tag className={size}>{title}</Tag>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
  return (
    <Reveal variant="rise" className={className}>
      {action ? (
        <div className={`flex flex-col gap-6 ${center ? 'items-center' : 'md:flex-row md:items-end md:justify-between'}`}>
          {head}
          <div className="flex-none">{action}</div>
        </div>
      ) : (
        head
      )}
    </Reveal>
  );
}

// ---------- Heroes ----------

export interface HeroCopyProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Actions, set in a row. */
  children?: ReactNode;
  /** Type class for the H1: display-xl, display (default), display-md, h2 or h2-sm. */
  titleClass?: string;
}

/** The hero's words without its layout. Use this inside a signature layout that is not the standard PageHero. */
export function HeroCopy({ eyebrow, title, lead, children, titleClass = 'display' }: HeroCopyProps) {
  return (
    <div className="page-hero-copy">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className={titleClass}>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children && <div className="page-hero-actions">{children}</div>}
    </div>
  );
}

/**
 * The top of an inner page: padded for the nav, optional G0 wash. align="left", or `aside` for a split layout, or skip it entirely and
 * compose HeroCopy into something else. It holds no opinion about what comes next.
 */
export function PageHero({
  align = 'center',
  aside,
  ground = true,
  className,
  ...copy
}: HeroCopyProps & { align?: 'center' | 'left'; aside?: ReactNode; ground?: boolean; className?: string }) {
  return (
    <section className={`page-hero ${className ?? ''}`} data-align={align} data-split={aside ? '' : undefined}>
      {ground && <div className="ground" aria-hidden />}
      <div className="wrap page-hero-in">
        <HeroCopy {...copy} />
        {aside && <div className="page-hero-aside">{aside}</div>}
      </div>
    </section>
  );
}

// ---------- Actions ----------

/** The wordmark's Funnel Display outlines. */
export function Wordmark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox={WORDMARK.viewBox} className={className} style={style} fill="currentColor" aria-hidden focusable="false">
      <path d={WORDMARK.d} />
    </svg>
  );
}

const BUTTON_SIZE = { sm: 'btn-sm', md: '', lg: 'btn-lg' } as const;
type ButtonSize = keyof typeof BUTTON_SIZE;

/** Leans toward the mouse. Three layers: the outer span catches the pointer, the inner moves, and the button inside keeps its own press. Off on touch and under data-still. */
export function Magnet({ children }: { children: ReactNode }) {
  const ok = useMotionOk();
  const x = useSpring(0, spring.follow);
  const y = useSpring(0, spring.follow);
  const box = useRef<DOMRect | null>(null);
  if (!ok) return <>{children}</>;

  const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
  const onEnter = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === 'mouse' && finePointer()) box.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const r = box.current;
    if (!r) return;
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * 0.28, 10));
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * 0.28, 6));
  };
  const onLeave = () => {
    box.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <span className="magnet" onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave} onPointerCancel={onLeave}>
      <m.span className="magnet-inner" style={{ x, y }}>
        {children}
      </m.span>
    </span>
  );
}

// The page's own copies of the primary action that are on screen right now. The phone's action bar steps aside while any is, rather than parking on top of
// an identical red button (and dropping the plan it carries). Each copy registers itself while mounted, so a route change never leaves a stale node behind.
const actionsInView = new Set<Element>();
const actionListeners = new Set<() => void>();
let actionObserver: IntersectionObserver | null = null;

function watchAction(el: Element): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => undefined;
  actionObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) actionsInView.add(entry.target);
      else actionsInView.delete(entry.target);
    }
    actionListeners.forEach((l) => l());
  });
  actionObserver.observe(el);
  return () => {
    actionObserver?.unobserve(el);
    if (actionsInView.delete(el)) actionListeners.forEach((l) => l());
  };
}

function subscribeActions(listener: () => void) {
  actionListeners.add(listener);
  return () => actionListeners.delete(listener);
}

/** True while any in-page copy of the primary action is on screen. */
export const useActionInView = () =>
  useSyncExternalStore(
    subscribeActions,
    () => actionsInView.size > 0,
    () => false,
  );

/**
 * The one primary action: same words, same red, everywhere. `plan` carries intent to the form as /contact?plan=startups. `chrome` marks the copies in the
 * nav, the menu, the footer, the player and the phone bar itself; every other copy counts as the page's own.
 */
export function PrimaryCta({ plan, size = 'md', magnet = false, className, chrome = false }: { plan?: PlanSlug; size?: ButtonSize; magnet?: boolean; className?: string; chrome?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!chrome && ref.current) return watchAction(ref.current);
  }, [chrome]);
  const link = (
    <Link ref={ref} to={contactHref(plan)} className={`btn btn-accent ${BUTTON_SIZE[size]} ${className ?? ''}`}>
      {PRIMARY_ACTION.label}
    </Link>
  );
  return magnet ? <Magnet>{link}</Magnet> : link;
}

/**
 * A button-shaped link. `to` for a route, `href` for mailto or an outside site, neither for a real <button>. Press and hover are CSS. Ink by default: red
 * belongs to the one primary action (PrimaryCta) alone. The arrow points across for a link that stays on the site, and up and out for one that opens a new tab.
 */
export function Cta({
  to,
  href,
  children,
  kind = 'ink',
  size = 'md',
  arrow,
  className,
  onClick,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  kind?: 'accent' | 'ink' | 'ghost' | 'light';
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const classes = `btn btn-${kind} ${BUTTON_SIZE[size]} ${className ?? ''}`;
  const external = Boolean(href && /^https?:/.test(href));
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const inner = (
    <>
      {children}
      {arrow && <Arrow className={`btn-arrow size-4 ${external ? 'btn-arrow-out' : ''}`} aria-hidden />}
    </>
  );
  if (to)
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={classes} onClick={onClick} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={classes} onClick={onClick}>
      {inner}
    </button>
  );
}

// ---------- Numbers ----------

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ d }: { d: number }) {
  const ok = useMotionOk();
  const col = useRef<HTMLSpanElement>(null);
  const spin = useSpring(d, spring.roll);
  useMotionValueEvent(spin, 'change', (v) => {
    if (col.current) col.current.style.transform = `translateY(${-v * 10}%)`;
  });
  useEffect(() => {
    if (ok) spin.set(d);
    else spin.jump(d);
  }, [d, ok, spin]);
  return (
    <span className="roll-window">
      <span ref={col} className="roll-col" style={{ transform: `translateY(${-spin.get() * 10}%)` }}>
        {DIGITS.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * A number that rolls digit by digit, like an odometer. The real value is sr-only text; the digits are decoration on a physics spring,
 * so a value that changes mid-roll keeps its velocity. `countUp` rolls in from zero the first time it enters the viewport.
 */
export function RollNumber({ value, prefix = '', suffix = '', locale = 'en-IN', countUp = true, className }: { value: number; prefix?: string; suffix?: string; locale?: string; countUp?: boolean; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const ok = useMotionOk();
  const [seen, setSeen] = useState(!countUp);
  useEffect(() => {
    if (seen || !ok || !root.current) return;
    return whenSeen(root.current, () => setSeen(true));
  }, [seen, ok]);

  const text = new Intl.NumberFormat(locale).format(value);
  const chars = [...text];
  const rolled = seen || !ok;

  return (
    <span ref={root} className={className}>
      <span className="sr-only">
        {prefix}
        {text}
        {suffix}
      </span>
      <span className="roll" aria-hidden>
        {prefix && <span className="roll-char">{prefix}</span>}
        {chars.map((c, i) =>
          /\d/.test(c) ? (
            <Digit key={chars.length - i} d={rolled ? Number(c) : 0} />
          ) : (
            <span key={chars.length - i} className="roll-char">
              {c}
            </span>
          ),
        )}
        {suffix && <span className="roll-char">{suffix}</span>}
      </span>
    </span>
  );
}

/** Three big numbers on plates. `big` for the headline set. */
export function StatRow({ stats, big, className }: { stats: Stat[]; big?: boolean; className?: string }) {
  return (
    <dl className={`stat-row ${className ?? ''}`}>
      {stats.map((s) => (
        <div key={s.label} className="stat" data-big={big ? '' : undefined}>
          <dt>{s.label}</dt>
          <dd>
            <RollNumber value={s.end} suffix={s.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Marquee ----------

/**
 * A slow strip of logos or names. One copy is real and is the only copy assistive tech and keyboards can reach; the rest are clones.
 * Paused (data-still) it stops being a marquee: the clones go and the row scrolls by hand, so nothing is trapped.
 */
export function Marquee<T>({ items, render, speed, gap, label }: { items: T[]; render: (item: T, i: number) => ReactNode; speed?: string; gap?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const running = useRunning(ref);
  const style = { '--speed': speed, '--gap-m': gap } as CSSProperties;
  const clones = (copy: number) =>
    items.map((item, i) => (
      <li key={`${copy}-${i}`} className="marquee-clone flex-none" aria-hidden inert>
        {render(item, i)}
      </li>
    ));
  return (
    <div ref={ref} className="marquee" style={style} data-run={running}>
      <ul className="marquee-track" aria-label={label}>
        {items.map((item, i) => (
          <li key={i} className="flex-none">
            {render(item, i)}
          </li>
        ))}
        {clones(1)}
        {clones(2)}
      </ul>
      <ul className="marquee-track marquee-clone" aria-hidden inert>
        {clones(3)}
        {clones(4)}
        {clones(5)}
      </ul>
    </div>
  );
}

// ---------- Segment ----------

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

/** A segmented control: equal columns and one thumb on a physics spring, so a quick flick across it keeps its speed. Arrow keys move the choice. */
export function Segment<T extends string>({ options, value, onChange, label, className }: { options: SegmentOption<T>[]; value: T; onChange: (value: T) => void; label: string; className?: string }) {
  const ok = useMotionOk();
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const thumb = useRef<HTMLSpanElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const pos = useSpring(index, spring.snappy);

  useMotionValueEvent(pos, 'change', (v) => {
    if (thumb.current) thumb.current.style.transform = `translateX(${v * 100}%)`;
  });
  useEffect(() => {
    if (ok) pos.set(index);
    else pos.jump(index);
  }, [index, ok, pos]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? index + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? index - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const wrapped = (next + options.length) % options.length;
    const option = options[wrapped];
    if (option) onChange(option.value);
    buttons.current[wrapped]?.focus();
  };

  return (
    <div className={`segment ${className ?? ''}`} role="radiogroup" aria-label={label} style={{ '--n': options.length } as CSSProperties} onKeyDown={onKey}>
      <span ref={thumb} className="segment-thumb" aria-hidden style={{ transform: `translateX(${pos.get() * 100}%)` }} />
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
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Bento ----------

let tileObserver: ResizeObserver | null = null;

/** Linked tiles need their own width in CSS, as a plain number, for R20's fixed +6px grow. One shared observer. Mouse only. */
function observeTile(el: HTMLElement): () => void {
  if (typeof ResizeObserver === 'undefined' || !finePointer()) return () => undefined;
  tileObserver ??= new ResizeObserver((entries) => {
    for (const entry of entries) (entry.target as HTMLElement).style.setProperty('--tile-w', String(Math.round(entry.contentRect.width)));
  });
  tileObserver.observe(el);
  return () => tileObserver?.unobserve(el);
}

export type TileTone = 'plate' | 'sochu' | 'bolu' | 'gola' | 'tiko' | 'ink' | 'media';

export interface TileProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Plain plate by default. The colour tones are G1: once per bento (except Meet the Army). */
  tone?: TileTone;
  /** Tile becomes a route link, and gets the linked hover. */
  to?: string;
  /** Tile becomes an outside link, and gets the linked hover. */
  href?: string;
  /** Tile becomes a real button, and gets the linked hover. */
  onClick?: () => void;
  /** Accessible name when the tile's own text is not enough. */
  label?: string;
}

/**
 * The bento plate. Opaque, 28 radius, flat at rest, on the surface opposite its section. Linked (to, href or onClick) it grows 6px of width and
 * gains a tinted outline; a tile with no action does nothing, on purpose.
 */
export function Tile({ children, className, style, tone = 'plate', to, href, onClick, label }: TileProps) {
  const linked = Boolean(to || href || onClick);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (linked && ref.current) return observeTile(ref.current);
  }, [linked]);
  const shared = {
    className: `plate ${linked ? 'plate-link' : ''} ${className ?? ''}`,
    style,
    'data-tone': tone === 'plate' ? undefined : tone,
    'aria-label': label,
  };
  if (to)
    return (
      <Link to={to} {...shared} ref={ref as Ref<HTMLAnchorElement>}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a href={href} {...shared} ref={ref as Ref<HTMLAnchorElement>} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} {...shared} ref={ref as Ref<HTMLButtonElement>}>
        {children}
      </button>
    );
  return (
    <div {...shared} ref={ref as Ref<HTMLDivElement>}>
      {children}
    </div>
  );
}

/** The 4-column grid, gap 20, rows of 260. Spans use Tailwind: lg:col-span-2 lg:row-span-2. */
export function Bento({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`bento ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}

/** Media that bleeds to the tile's edges. Put <img> or <video> directly inside (the zoom selector uses a child combinator). `scrim` lays G4 over it. */
export function TileMedia({ children, scrim, className }: { children: ReactNode; scrim?: boolean; className?: string }) {
  return (
    <div className={`plate-media ${className ?? ''}`}>
      {children}
      {scrim && <span className="scrim" aria-hidden />}
    </div>
  );
}

/** The words of a tile: padded, stacked, foot pinned with .plate-foot. */
export function TileBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`plate-body ${className ?? ''}`}>{children}</div>;
}
