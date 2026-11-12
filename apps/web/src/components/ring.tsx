// The card ring (library-slider-cta-spec §1): tall rounded portrait cards on the inside of a slowly turning cylinder, seen from just outside it, so
// the far wall faces you and the cards grow and bend toward both edges. Pure CSS 3D: the stage holds the camera (perspective), the ring turns
// (rotateY, written straight to its style every frame, never through React state) and each slot pushes its card out to the wall. Backface culling
// hides the near half. Used twice, both interactive: the brand filter at the top of /video-library and the footer CTA (round 13: links to videos).
//
// Order: item 0 faces you first and item 1 sits to its right. The angle grows, so the wall drifts right to left and the items arrive at the centre
// in order. Fewer items than `minCards` are cycled into clones (aria-hidden, inert, never focusable). Under Pause animations or reduced motion the
// ring is not rendered: the interactive one becomes a flat row of the same real cards, the decorative one renders nothing.
//
// Seamless: the stage's height is fixed per breakpoint by the stylesheet (so the page reserves exactly that much before the data arrives), and the
// ring is sized to fit it. A card grows as it swings toward you, so on a wide stage the cards at the sides would run past its top and bottom. The
// slot count is therefore raised (with more clones) until the tallest visible part of any card, at any angle, with the hover lift, fits inside the
// stage with a small pad (ringReach / fitSlots, below). A bigger ring has a bigger radius, so the stage's edge meets it at a gentler angle. The
// far-centre card stays at about half size whatever the count (the camera is always 1.07 R away). Nothing is masked: the viewport crops the sides.
//
// Never put opacity < 1, filter, overflow, mask, clip-path or paint containment on .cring-ring or a .cring-slot: any of them flattens preserve-3d.
// Fades and dims go on the stage or on a card (a leaf).
//
// (noflip) Zoom: the hovered card (a fine pointer) or the keyboard-focused one grows where it stands. It never turns: it keeps its slot's place
// and angle on the wall, scales evenly about its own centre in its own plane to about ZOOM times its size on screen, and steps ZOOM_FWD px along
// its own normal (toward the ring's axis) so it draws above its neighbours. It is never taller than the stage less its PAD (checked every frame)
// and never past the stage's sides; a card with no room (the big ones at the far edges) only brightens. Its neighbours never shrink or turn: every
// card on each side of it turns a little further along the ring (one angle per side, just enough to clear the zoomed card by ZOOM_GAP), so the
// gaps between them stay what they were; the turn tapers off only behind the stage (past `back`), where nothing shows. One progress and one
// centre (motion springs, no overshoot) drive it, written straight to the slots' and cards' styles like the turn (renderZoom), so moving to the
// next card re-targets without a snap back. Hover is found from the geometry (hoverAt), not :hover, so a gap or a clone is handled the same on
// every frame and nothing flickers.

import { animate, type AnimationPlaybackControls, useMotionValue } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent as ReactFocusEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { canAutoplay, finePointer, useMotionOk, useRunning } from '../lib/motionOk';
import { spring } from '../lib/spring';
import { videoToken } from './frames';

/** Degrees a second at the base slot count, while nothing holds it: 60 s a turn at 12 cards, as the reference. When fitSlots adds slots the ring's
 *  radius grows with them, so the turn slows in step (SPEED * base / n) and the cards cross the front at the same pace on every width. */
const SPEED = 6;
/** Hold after a press, a focus-out or a touch (ms). */
const HOLD_PRESS = 3000;
const HOLD_TOUCH = 2000;
/** Degrees of turn per px of horizontal touch drag. */
const DRAG = 0.12;
/** The culling and clip tick (ms). */
const TICK = 250;
/** A clip plays only on a card this close to the front. */
const CLIP_ARC = 40;
const CLIP_HOVER_MS = 100;
const STREAM_HOVER_MS = 300;
const STREAM_LOOP_AT = 5; // seconds: a bundled file previews its first 5 s, looped
/** At most this many real items. */
const MAX_ITEMS = 18;
/** At most this many slots, clones included (a 2560 px stage needs about 25 at the library's size). */
const MAX_FIT = 64;
/** The camera's distance, in radii (the reference's 600 / 560): the far-centre card is at 1.07 / 2.07 = 0.517 scale. */
const CAMERA = 1.07;
/** Room kept between the tallest card and the stage's top and bottom (px). */
const PAD = 8;
/** (noflip) The zoomed card's height on screen (at its centre) against its height at rest, capped by the stage's height and sides. */
const ZOOM = 1.4;
/** Screen px kept between the zoomed card and a neighbour, and between it and the stage's sides. */
const ZOOM_GAP = 12;
const ZOOM_EDGE = 16;
/** (ringv9) How far beside the zoomed card the pointer may stray (in a gap, toward a neighbour) before the zoom lets go. */
const ZOOM_HOLD = 48;
/** How far the zoomed card steps along its own normal, toward the axis (px): its grown edges then stay in front of its neighbours' planes. Less
 *  than --lift (32), which fitSlots already counts, so the step alone never makes a card too tall. */
const ZOOM_FWD = 24;
/** About 400 ms, no overshoot (an overshoot would grow the card past the stage for a moment). */
const ZOOM_SPRING = spring.roll;
/** No hover change waiting. */
const NONE = -2;

/**
 * Which item slot `k` of `n` shows. The items first, in order. Then the clones: with fewer than twice as many slots as items, each extra slot
 * copies the item half a turn away from it, so a copy never sits near its original (a wide stage shows more than half the ring at once, so the
 * two copies may both show, but at opposite sides); with twice as many or more, the items repeat in whole rounds (n is then a multiple of the
 * item count, see cleanWrap), so every copy is exactly one round of items from the next.
 */
export function ringItem(k: number, len: number, n: number): number {
  if (k < len || len <= 0) return k;
  if (n < 2 * len) return k - Math.floor(n / 2);
  return k % len;
}

/** A slot count whose copies are spread evenly: the half-turn deal (n < 2 len) always is; the repeating deal only in whole rounds, since a partial
 *  last round brings an item back early across the wrap (5 items in 12 slots: ... D E A B | A B C ...). */
export const cleanWrap = (len: number, n: number) => n < 2 * len || len <= 1 || n % len === 0;

/** The number of slots for `len` items: the items alone when there are enough, else the smallest count >= min whose copies are evenly spread (cleanWrap). */
export function ringSlots(len: number, min: number): number {
  if (len <= 0) return 0;
  if (len >= min) return Math.min(len, MAX_ITEMS);
  let n = min;
  while (!cleanWrap(len, n)) n += 1;
  return n;
}

export interface RingFit {
  /** Card width, height and gap in card space (px). */
  cw: number;
  ch: number;
  gap: number;
  /** The hover lift toward the axis (px), 0 for a ring nobody hovers. */
  lift: number;
  /** The stage's width and height (px). */
  width: number;
  height: number;
}

/**
 * How far above (and below) the stage's middle the visible part of any card reaches, in px, at any angle, for `n` slots. Each card is a flat
 * rectangle on the wall; its projected top edge is a straight line between its two top corners, so the tallest visible point is one of those
 * corners or where that line meets the stage's left or right edge (the stage clips the rest). Sampled every 0.1°, both with and without the lift.
 */
export function ringReach(n: number, { cw, ch, gap, lift, width }: RingFit): number {
  if (n <= 0) return 0;
  const R = (n * (cw + gap)) / (2 * Math.PI);
  const P = R * CAMERA;
  const half = width / 2;
  let best = 0;
  for (let t = 0; t <= 1800; t++) {
    const rad = (t / 10) * (Math.PI / 180);
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    for (const d of lift > 0 ? [0, lift] : [0]) {
      const r = R - d;
      // Facing away from the camera: backface-visibility hides it.
      if (r + P * cos <= 0) continue;
      let x1 = 0;
      let y1 = 0;
      let x2 = 0;
      let y2 = 0;
      let ok = true;
      for (const s of [-1, 1]) {
        const u = (s * cw) / 2;
        const x = u * cos - r * sin;
        const z = -u * sin - r * cos;
        if (P - z <= 1) ok = false;
        const f = P / (P - z);
        if (s < 0) {
          x1 = x * f;
          y1 = (ch / 2) * f;
        } else {
          x2 = x * f;
          y2 = (ch / 2) * f;
        }
      }
      if (!ok) continue;
      if (x1 > x2) [x1, y1, x2, y2] = [x2, y2, x1, y1];
      const lo = Math.max(x1, -half);
      const hi = Math.min(x2, half);
      if (lo > hi) continue;
      const at = (x: number) => (x2 - x1 < 1e-6 ? Math.max(y1, y2) : y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
      best = Math.max(best, at(lo), at(hi));
    }
  }
  return best;
}

/** The fewest evenly spread slots (cleanWrap), from `base` up, for which every card shows whole on the stage at every angle (see ringReach).
 *  A stage not laid out yet (0 wide or high, e.g. inside display: none) keeps `base`; if nothing up to MAX_FIT fits, the largest clean count. */
export function fitSlots(len: number, base: number, fit: RingFit): number {
  if (len <= 0 || base <= 0) return 0;
  if (!(fit.width > 0 && fit.height > 0)) return base;
  for (let n = base; n <= MAX_FIT; n++) {
    if (!cleanWrap(len, n)) continue;
    if (2 * ringReach(n, fit) + 2 * PAD <= fit.height) return n;
  }
  for (let n = MAX_FIT; n > base; n--) if (cleanWrap(len, n)) return n;
  return base;
}

/** The angle equal to `target` (mod 360) that is nearest to `a`. */
export function shortestTo(a: number, target: number): number {
  return a + ((((target - a) % 360) + 540) % 360) - 180;
}

/** The ring's geometry for the zoom (px, deg). */
interface ZoomGeo {
  R: number;
  P: number;
  cw: number;
  ch: number;
  step: number;
  /** Half the stage's width, and the tallest a card may show (the stage's height less PAD at the top and bottom). */
  halfW: number;
  maxH: number;
  /** Past this wall angle (either way) no card shows on the stage: the neighbours' slide tapers off out there. */
  back: number;
}

/** A card's pose in stage space: its centre (x, z), its turn (deg, always its wall angle: a card never turns) and its scale. */
interface Pose {
  x: number;
  z: number;
  th: number;
  s: number;
}

const DEG = Math.PI / 180;
/** The card on the wall at angle psi, stepped dz along its own normal (toward the axis) and scaled s about its centre, in its own plane. */
const wallPose = (R: number, psi: number, s = 1, dz = 0): Pose => ({ x: -(R - dz) * Math.sin(psi * DEG), z: -(R - dz) * Math.cos(psi * DEG), th: psi, s });

/** A pose's two vertical edges on screen: x and half the height there; null when one is behind the camera. */
function edgesOf(g: ZoomGeo, p: Pose): [{ x: number; h: number }, { x: number; h: number }] | null {
  const cos = Math.cos(p.th * DEG);
  const sin = Math.sin(p.th * DEG);
  const out: { x: number; h: number }[] = [];
  for (const sg of [-1, 1]) {
    const u = (sg * p.s * g.cw) / 2;
    const x = p.x + u * cos;
    const z = p.z - u * sin;
    if (g.P - z <= 1) return null;
    const f = g.P / (g.P - z);
    out.push({ x: x * f, h: ((p.s * g.ch) / 2) * f });
  }
  const [a, b] = out as [{ x: number; h: number }, { x: number; h: number }];
  return a.x <= b.x ? [a, b] : [b, a];
}

/** Is the screen point (x, y), from the stage's centre, on the card in this pose? */
function poseHit(g: ZoomGeo, p: Pose, x: number, y: number): boolean {
  const e = edgesOf(g, p);
  if (!e) return false;
  const [l, r] = e;
  if (x < l.x || x > r.x) return false;
  const t = r.x - l.x < 1e-6 ? 0 : (x - l.x) / (r.x - l.x);
  return Math.abs(y) <= l.h + (r.h - l.h) * t;
}

/** Is a card front-facing at wall angle psi (backface-visibility hides the rest)? */
const facing = (g: ZoomGeo, psi: number) => g.R + g.P * Math.cos(psi * DEG) > 0;

/** Does the card at psi, stepped dz and scaled s, show no taller than the stage allows (and, with `sides`, inside its sides less ZOOM_EDGE)? */
function fitsAt(g: ZoomGeo, psi: number, s: number, dz: number, sides: boolean): boolean {
  const e = edgesOf(g, wallPose(g.R, psi, s, dz));
  if (!e) return false;
  if (2 * Math.max(e[0].h, e[1].h) > g.maxH + 0.01) return false;
  return !sides || (e[0].x >= -g.halfW + ZOOM_EDGE && e[1].x <= g.halfW - ZOOM_EDGE);
}

/** The largest scale in [lo, want] that fits (fitsAt), or lo. */
function capScale(g: ZoomGeo, psi: number, dz: number, want: number, lo: number, sides: boolean): number {
  if (want <= lo || fitsAt(g, psi, want, dz, sides)) return Math.max(want, lo);
  let a = lo;
  let b = want;
  for (let i = 0; i < 12; i++) {
    const m = (a + b) / 2;
    if (fitsAt(g, psi, m, dz, sides)) a = m;
    else b = m;
  }
  return a;
}

/** The zoom's full target for the card standing at wall angle psi: its in-plane scale and its step along its normal. No room (it is not wholly on
 *  the stage, or already as tall as the stage allows): no zoom, it only brightens. The step shrinks with the room, so nothing jumps near the edge. */
function zoomFor(g: ZoomGeo, psi: number): { s: number; dz: number } {
  if (!facing(g, psi) || !fitsAt(g, psi, 1, 0, true)) return { s: 1, dz: 0 };
  const cos = Math.cos(psi * DEG);
  // ZOOM on screen at the card's centre: the step toward the axis alone already grows it by (P + R cos) / (P + (R - dz) cos).
  const want = (dz: number) => (ZOOM * (g.P + (g.R - dz) * cos)) / (g.P + g.R * cos);
  const s0 = capScale(g, psi, 0, want(0), 1, true);
  const dz = ZOOM_FWD * Math.min(1, (s0 - 1) / 0.1);
  return { s: capScale(g, psi, dz, want(dz), 0.95, true), dz };
}

/** How far (deg) the cards on one side (+1: the right, toward smaller angles; -1: the left) must turn along the ring so the nearest one clears the
 *  zoomed card (`pose`, at psi) by ZOOM_GAP on screen. 0 when it already does, or when that neighbour does not show. */
function slideFor(g: ZoomGeo, psi: number, pose: Pose, side: 1 | -1): number {
  const z = edgesOf(g, pose);
  if (!z || pose.s <= 1.0001) return 0;
  const clear = (d: number) => {
    const at = psi - side * (g.step + d);
    if (!facing(g, at)) return true;
    const e = edgesOf(g, wallPose(g.R, at));
    if (!e) return true;
    return side > 0 ? e[0].x >= z[1].x + ZOOM_GAP : e[1].x <= z[0].x - ZOOM_GAP;
  };
  if (clear(0)) return 0;
  let a = 0;
  let b = 2 * g.step;
  if (!clear(b)) return b;
  for (let i = 0; i < 14; i++) {
    const m = (a + b) / 2;
    if (clear(m)) b = m;
    else a = m;
  }
  return b;
}

/** The last wall angle (0..180) at which a card at rest still shows on the stage, plus one step: past it, nothing does. */
function backOf(g: Omit<ZoomGeo, 'back'>): number {
  for (let deg = 179.5; deg > 0; deg -= 0.5) {
    if (g.R + g.P * Math.cos(deg * DEG) <= 0) continue;
    const e = edgesOf({ ...g, back: 180 }, wallPose(g.R, deg));
    if (e && e[0].x < g.halfW && e[1].x > -g.halfW) return Math.min(deg + g.step, 175);
  }
  return Math.min(g.step, 175);
}

/** How much of a side's slide a card at wall angle psi takes: all of it on the stage, tapering to none straight behind the camera. */
const taper = (g: ZoomGeo, psi: number) => {
  const at = Math.abs(wrap180(psi));
  return at <= g.back ? 1 : Math.max(0, (180 - at) / (180 - g.back));
};

/** An angle in (-180, 180]. */
const wrap180 = (deg: number) => {
  const d = (((deg + 180) % 360) + 360) % 360 - 180;
  return d === -180 ? 180 : d;
};

export interface CardRingState {
  /** A copy that fills the ring: aria-hidden and inert already, by the slot. */
  clone: boolean;
  /** The flat row (still): no 3D, no clip. */
  flat: boolean;
  /** Spread onto the card's own focusable element (interactive), or nothing. Carries the roving tabindex. */
  tabIndex: number | undefined;
  /** The box for the muted clip (its <video> exists only while it plays), to place between the poster and the label, or null. */
  clip: ReactNode;
  /** The card's place on the ring (or in the row) and the number of places, for anything dealt by position (colours). */
  slot: number;
  slots: number;
}

export interface CardRingProps<T> {
  /** The real items, in order. */
  items: T[];
  itemKey: (item: T) => string;
  /** The card: one element with className "cring-card" (a <button> when interactive; a link would need its own Space key in the toolbar). */
  renderCard: (item: T, state: CardRingState) => ReactNode;
  /** The toolbar's accessible name (interactive only). */
  label: string;
  /** False: aria-hidden, inert, no pointer, no keyboard; nothing under still. */
  interactive: boolean;
  /** Clones fill the ring up to this many. Default 12. */
  minCards?: number;
  /** An outside pause (the player dialog is open). */
  paused?: boolean;
  /** A stored hover clip for the item, played on the hovered card, else the front card (desktop, motion allowed, no Save-Data, one video on the page). */
  clipOf?: (item: T) => string | null | undefined;
  /**
   * (hover7) A muted bundled file for an item with no stored clip (only when the API allows it; never MEGA, which previews its stored clip only):
   * played on the hovered card only, after a 300 ms rest, never by itself on the front card. Looped at 5 s.
   */
  streamOf?: (item: T) => string | null | undefined;
  onItemFocus?: (item: T) => void;
  className?: string;
}

/** The ring. Returns the flat row under still (interactive) or nothing (decorative). */
export function CardRing<T>(props: CardRingProps<T>) {
  const ok = useMotionOk();
  if (!ok) return props.interactive ? <FlatRow {...props} /> : null;
  return <Ring3D {...props} />;
}

// ---------- Keyboard: one Tab stop, Left/Right/Home/End, the same for the ring and the row ----------

function useRoving(len: number, onMove: (k: number) => void) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (active > len - 1) setActive(Math.max(0, len - 1));
  }, [len, active]);
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    const k = slotOf(e.target);
    if (k === null || k >= len) return;
    let next = k;
    if (e.key === 'ArrowRight') next = (k + 1) % len;
    else if (e.key === 'ArrowLeft') next = (k - 1 + len) % len;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = len - 1;
    else return;
    e.preventDefault();
    setActive(next);
    const card = e.currentTarget.querySelector<HTMLElement>(`.cring-slot[data-k="${next}"] .cring-card`);
    card?.focus({ preventScroll: true });
    onMove(next);
  };
  return { active, setActive, onKeyDown };
}

const slotOf = (node: EventTarget | null): number | null => {
  if (!(node instanceof Element)) return null;
  const slot = node.closest<HTMLElement>('.cring-slot');
  const k = slot?.dataset.k;
  return k === undefined ? null : Number(k);
};

// ---------- Still: a flat row of the real cards ----------

function FlatRow<T>({ items, itemKey, renderCard, label, onItemFocus, className }: CardRingProps<T>) {
  const real = items.slice(0, MAX_ITEMS);
  const row = useRef<HTMLDivElement>(null);
  const scrollTo = (k: number) => row.current?.querySelector(`.cring-slot[data-k="${k}"]`)?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
  const { active, setActive, onKeyDown } = useRoving(real.length, scrollTo);
  return (
    <div className={`cring ${className ?? ''}`} data-flat="">
      <div
        ref={row}
        className="cring-row"
        role="toolbar"
        aria-label={label}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        onFocus={(e: ReactFocusEvent) => {
          const k = slotOf(e.target);
          if (k === null) return;
          setActive(k);
          const item = real[k];
          if (item !== undefined) onItemFocus?.(item);
        }}
      >
        {real.map((item, k) => (
          <div key={itemKey(item)} className="cring-slot" data-k={k}>
            {renderCard(item, { clone: false, flat: true, tabIndex: k === active ? 0 : -1, clip: null, slot: k, slots: real.length })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- The ring ----------

function Ring3D<T>({ items, itemKey, renderCard, label, interactive, minCards = 12, paused = false, clipOf, streamOf, onItemFocus, className }: CardRingProps<T>) {
  const real = items.slice(0, MAX_ITEMS);
  const len = real.length;
  const base = ringSlots(len, minCards);
  // The slot count that fits the stage (measured before the first paint, again on resize); until it is known, the base count.
  const [fitted, setFitted] = useState<{ len: number; base: number; n: number } | null>(null);
  const n = fitted && fitted.len === len && fitted.base === base ? fitted.n : base;
  const step = n > 0 ? 360 / n : 0;

  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const running = useRunning(stage);
  const a = useMotionValue(0);
  const speed = useMotionValue(1);
  const geo = useRef<RingFit>({ cw: 240, ch: 340, gap: 12, lift: 0, width: 1440, height: 500 });

  // Why the spin is held: each is a reason, and the speed eases to 0 while any is true.
  const why = useRef({ hover: false, focus: false, until: 0, drag: false });
  const seek = useRef<AnimationPlaybackControls | null>(null);
  const ease = useRef<AnimationPlaybackControls | null>(null);
  const held = useRef(false);
  const holdTimer = useRef(0);

  // The roving Tab stop, mirrored for the tick (the state lives in useRoving below).
  const stopK = useRef(0);
  const setStopRef = useRef<(k: number) => void>(() => undefined);
  const setStop = (k: number) => setStopRef.current(k);

  // Clips: which slot plays, the token's owner.
  /** Each clip-capable card's empty box; the <video> is created in it only while it plays, and removed after. */
  const clipEls = useRef(new Map<number, HTMLSpanElement>());
  const clipVideo = useRef<HTMLVideoElement | null>(null);
  const playingK = useRef(-1);
  const hoverK = useRef(-1);
  const hoverWait = useRef(0);
  /** The slot waiting out its rest before its clip plays (NONE: nothing waiting). */
  const pendingHover = useRef(NONE);
  const owner = useRef<object>({});
  const failed = useRef(new Set<string>());
  const clipsOn = interactive && Boolean(clipOf || streamOf) && canAutoplay();

  // (ring9) The zoom: its progress (0 rest, 1 zoomed) and its centre (a slot index, fractional while it moves to the next card).
  const zp = useMotionValue(0);
  const zc = useMotionValue(0);
  const zpAnim = useRef<AnimationPlaybackControls | null>(null);
  const zcAnim = useRef<AnimationPlaybackControls | null>(null);
  /** The slot the zoom is heading for (-1: none), and why: the pointer over it, or the keyboard on it. */
  const zoomTo = useRef(-1);
  const hoverZoom = useRef(-1);
  const focusZoom = useRef(-1);
  /** The slots whose styles the zoom wrote: the pose each card was given (for the hover's hit test) and the styles written (to skip rewrites). */
  const zoomed = useRef(new Map<number, { pose: Pose; slot: string; card: string }>());
  const backMemo = useRef({ key: '', back: 180 });

  const zoomGeo = useCallback((): ZoomGeo => {
    const { cw, ch, gap, width, height } = geo.current;
    const R = (n * (cw + gap)) / (2 * Math.PI);
    const g = { R, P: R * CAMERA, cw, ch, step, halfW: width / 2, maxH: height - 2 * PAD };
    const key = `${n}|${cw}|${ch}|${gap}|${width}`;
    if (backMemo.current.key !== key) backMemo.current = { key, back: backOf(g) };
    return { ...g, back: backMemo.current.back };
  }, [n, step]);

  const renderZoom = useCallback(() => {
    const ringEl = ring.current;
    if (!ringEl) return;
    const p = Math.min(Math.max(zp.get(), 0), 1);
    const was = zoomed.current;
    if (p < 0.002 && was.size === 0) return;
    const now = new Map<number, { pose: Pose; slot: string; card: string }>();
    const kids = ringEl.children;
    if (p >= 0.002 && n > 0 && kids.length === n) {
      const g = zoomGeo();
      const c = zc.get();
      const angle = a.get();
      // The zoom's centre lies between two cards (the same one twice at rest): each takes its share of the progress, and its full target and its
      // two sides' slides are found where it stands at rest.
      const j0 = Math.floor(c);
      const f = c - j0;
      const cands = [
        { k: ((j0 % n) + n) % n, w: p * (1 - f) },
        { k: (((j0 + 1) % n) + n) % n, w: p * f },
      ]
        .filter((x) => x.w > 0.0005)
        .map(({ k, w }) => {
          const psi = wrap180(angle - k * step);
          const t = zoomFor(g, psi);
          const pose = wallPose(g.R, psi, t.s, t.dz);
          return { k, w, psi, s: t.s, dz: t.dz, left: slideFor(g, psi, pose, -1), right: slideFor(g, psi, pose, 1) };
        });
      for (let j = 0; j < n; j++) {
        const slot = kids[j] as HTMLElement;
        const card = slot.firstElementChild as HTMLElement | null;
        if (!card) continue;
        const rest = wrap180(angle - j * step);
        // Every card on a side turns that side's way (the left toward larger angles, the right toward smaller), never more than it, never back.
        let d = 0;
        let s = 1;
        let dz = 0;
        for (const x of cands) {
          if (x.k === j) {
            s += (x.s - 1) * x.w;
            dz += x.dz * x.w;
          } else if (rest > x.psi) d += x.w * x.left * taper(g, rest);
          else d -= x.w * x.right * taper(g, rest);
        }
        const psi = rest + d;
        // Checked every frame: never taller than the stage allows nor past its sides, also between two targets or while the ring eases to a stop
        // (a card pushed toward a side by the other target gives up its zoom smoothly, down to none at the side).
        if (s > 1 && !fitsAt(g, psi, s, dz, true)) s = capScale(g, psi, dz, s, 1, true);
        const prev = was.get(j);
        // Untouched (the final loop clears what an earlier frame wrote).
        if (Math.abs(d) < 1e-4 && s === 1 && dz === 0) continue;
        const slotCss = `rotateY(${(d - j * step).toFixed(3)}deg) translateZ(${(-g.R).toFixed(2)}px)`;
        const cardCss = s !== 1 || dz !== 0 ? `translateZ(${dz.toFixed(2)}px) scale(${s.toFixed(4)})` : '';
        if (prev?.slot !== slotCss) slot.style.transform = slotCss;
        if (prev?.card !== cardCss) {
          if (cardCss) card.style.transform = cardCss;
          else card.style.removeProperty('transform');
        }
        now.set(j, { pose: wallPose(g.R, psi, s, dz), slot: slotCss, card: cardCss });
      }
    }
    for (const j of was.keys()) {
      if (now.has(j)) continue;
      const slot = kids[j] as HTMLElement | undefined;
      slot?.style.removeProperty('transform');
      (slot?.firstElementChild as HTMLElement | null | undefined)?.style.removeProperty('transform');
    }
    zoomed.current = now;
  }, [a, zp, zc, n, step, zoomGeo]);
  const renderZoomRef = useRef(renderZoom);
  renderZoomRef.current = renderZoom;

  const write = useCallback((v: number) => {
    if (ring.current) ring.current.style.transform = `rotateY(${v.toFixed(3)}deg)`;
    renderZoomRef.current();
  }, []);
  useEffect(() => a.on('change', write), [a, write]);
  useEffect(() => {
    const draw = () => renderZoomRef.current();
    const offP = zp.on('change', draw);
    const offC = zc.on('change', draw);
    return () => {
      offP();
      offC();
    };
  }, [zp, zc]);

  /** Head for the hovered card, else the focused one, else back to rest. A move to another card while zoomed slides the centre there. */
  const applyZoom = useCallback(() => {
    const k = hoverZoom.current >= 0 ? hoverZoom.current : focusZoom.current;
    if (k === zoomTo.current) return;
    zoomTo.current = k;
    const ringEl = ring.current;
    if (ringEl) for (let j = 0; j < ringEl.children.length; j++) (ringEl.children[j] as HTMLElement).toggleAttribute('data-zoomed', j === k);
    zpAnim.current?.stop();
    if (k < 0) {
      zpAnim.current = animate(zp, 0, ZOOM_SPRING);
      return;
    }
    zcAnim.current?.stop();
    if (zp.get() < 0.05) zc.jump(k);
    else {
      const c = zc.get();
      let t = k - c;
      t -= n * Math.round(t / n);
      zcAnim.current = animate(zc, c + t, ZOOM_SPRING);
    }
    zpAnim.current = animate(zp, 1, ZOOM_SPRING);
  }, [zp, zc, n]);

  // A new slot count (a resize) starts the zoom over: the old styles are for the old ring.
  useLayoutEffect(() => {
    hoverZoom.current = -1;
    focusZoom.current = -1;
    zoomTo.current = -1;
    zpAnim.current?.stop();
    zcAnim.current?.stop();
    zp.jump(0);
    const ringEl = ring.current;
    if (ringEl)
      for (const el of Array.from(ringEl.children) as HTMLElement[]) {
        el.style.removeProperty('transform');
        el.removeAttribute('data-zoomed');
        (el.firstElementChild as HTMLElement | null)?.style.removeProperty('transform');
      }
    zoomed.current = new Map();
  }, [n, zp]);
  useEffect(
    () => () => {
      zpAnim.current?.stop();
      zcAnim.current?.stop();
    },
    [],
  );

  /** (ring9) The slot under the pointer (x, y from the stage's centre), from the geometry: the zoomed card first, then any card facing you
   *  within 80 degrees of the front (as the tick's pointer rule). In a gap beside the zoomed card the zoom holds; above or below it, it lets go. */
  const hoverAt = (x: number, y: number): number => {
    const g = zoomGeo();
    const angle = a.get();
    const poseOf = (j: number) => zoomed.current.get(j)?.pose ?? wallPose(g.R, angle - j * step);
    const cur = zoomTo.current;
    if (cur >= 0 && poseHit(g, poseOf(cur), x, y)) return cur;
    let best = -1;
    let bestD = 999;
    for (let j = 0; j < n; j++) {
      if (j === cur) continue;
      const phi = Math.abs(wrap180(angle - j * step));
      if (phi > 80 || phi >= bestD) continue;
      if (poseHit(g, poseOf(j), x, y)) {
        best = j;
        bestD = phi;
      }
    }
    if (best >= 0 || cur < 0) return best;
    const edges = edgesOf(g, poseOf(cur));
    if (!edges || Math.abs(y) > Math.max(edges[0].h, edges[1].h)) return -1;
    // (ringv9) Hold only in the gaps up to its neighbours (at most ZOOM_HOLD px out): farther along the stage, over empty room or a card turned
    // past 80 degrees, it lets go, so the pointer at the stage's far side never keeps a card zoomed or its clip playing.
    let lo = edges[0].x - ZOOM_HOLD;
    let hi = edges[1].x + ZOOM_HOLD;
    for (const j of [cur - 1, cur + 1]) {
      const e = edgesOf(g, poseOf(((j % n) + n) % n));
      if (!e) continue;
      if (e[1].x <= edges[0].x) lo = Math.max(lo, e[1].x);
      else if (e[0].x >= edges[1].x) hi = Math.min(hi, e[0].x);
    }
    return x >= lo && x <= hi ? cur : -1;
  };

  // The card size, gap, lift and the stage's height come from the stylesheet (they change at the breakpoints); the radius and camera are CSS calc
  // from them and --n. The slot count is then chosen so every card fits the stage's height (fitSlots), before the first paint and on resize.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || base === 0) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const px = (name: string, fallback: number) => parseFloat(cs.getPropertyValue(name)) || fallback;
      const next: RingFit = { cw: px('--cw', 240), ch: px('--ch', 340), gap: px('--gap', 12), lift: interactive ? px('--lift', 32) : 0, width: el.clientWidth, height: el.clientHeight };
      geo.current = next;
      const fit = fitSlots(len, base, next);
      setFitted((f) => (f && f.len === len && f.base === base && f.n === fit ? f : { len, base, n: fit }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [len, base, interactive]);

  const reevaluate = useCallback(() => {
    const w = why.current;
    const hold = w.hover || w.focus || w.drag || performance.now() < w.until;
    if (hold === held.current) return;
    held.current = hold;
    ease.current?.stop();
    ease.current = hold ? animate(speed, 0, { duration: 0.4, ease: 'easeOut' }) : animate(speed, 1, { duration: 0.6, ease: 'easeInOut' });
  }, [speed]);

  const holdFor = useCallback(
    (ms: number) => {
      why.current.until = Math.max(why.current.until, performance.now() + ms);
      window.clearTimeout(holdTimer.current);
      holdTimer.current = window.setTimeout(reevaluate, why.current.until - performance.now() + 20);
      reevaluate();
    },
    [reevaluate],
  );
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  // ----- Culling, the front card, the clip: every TICK while running, and after any jump -----
  const stopClip = useCallback(() => {
    playingK.current = -1;
    const v = clipVideo.current;
    clipVideo.current = null;
    if (v) {
      v.onplaying = null;
      v.onerror = null;
      v.ontimeupdate = null;
      v.pause();
      v.removeAttribute('src');
      v.load();
      v.remove();
    }
  }, []);

  const lose = useCallback(() => stopClip(), [stopClip]);

  const tick = useCallback(() => {
    const ringEl = ring.current;
    if (!ringEl || n === 0) return;
    const { cw, gap, width } = geo.current;
    const R = (n * (cw + gap)) / (2 * Math.PI);
    const P = R * CAMERA;
    const half = width / 2 + width * 0.15;
    const angle = a.get();
    let frontK = -1;
    let frontD = 999;
    let realK = 0;
    let realD = 999;
    const slots = ringEl.children;
    for (let k = 0; k < slots.length; k++) {
      const slot = slots[k] as HTMLElement;
      const phi = wrap180(angle - k * step);
      const rad = (phi * Math.PI) / 180;
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);
      let shown = R + P * cos > 0;
      if (shown) {
        // The two vertical edges, projected: is either on the stage (with a margin, so a card coming in from the edge is already there)?
        shown = false;
        for (const s of [-1, 1]) {
          const x = -R * sin + s * (cw / 2) * cos;
          const z = -R * cos - s * (cw / 2) * sin;
          if (P - z <= 1) continue;
          if (Math.abs((x * P) / (P - z)) < half) shown = true;
        }
      }
      // Culled cards go transparent, not visibility: hidden, so every real card stays in the accessibility tree and the Tab stop stays focusable.
      slot.toggleAttribute('data-culled', !shown && k !== stopK.current);
      slot.style.pointerEvents = Math.abs(phi) > 80 ? 'none' : '';
      if (Math.abs(phi) < frontD) {
        frontD = Math.abs(phi);
        frontK = k;
      }
      if (k < len && Math.abs(phi) < realD) {
        realD = Math.abs(phi);
        realK = k;
      }
    }
    // While the keyboard is elsewhere, the ring's one Tab stop is the real card nearest the front (item 0 at first), so Tab lands on what you see.
    if (!ringEl.contains(document.activeElement) && realK !== stopK.current) {
      stopK.current = realK;
      setStop(realK);
    }
    for (let k = 0; k < slots.length; k++) (slots[k] as HTMLElement).toggleAttribute('data-front', k === frontK);

    // The clip: the hovered card, else the front card within ±CLIP_ARC, if it has a clip. One video on the page (videoToken).
    if (!clipsOn) return;
    const may = running && !paused && document.visibilityState !== 'hidden';
    // A stored clip for the hovered or the front card; a bundled file for the hovered card only.
    const sourceOf = (k: number, hovered: boolean) => {
      const item = real[ringItem(k, len, n)];
      if (item === undefined) return null;
      const clipUrl = clipOf?.(item);
      if (clipUrl && !failed.current.has(clipUrl)) return { url: clipUrl, stream: false };
      const streamUrl = hovered ? streamOf?.(item) : null;
      return streamUrl && !failed.current.has(streamUrl) ? { url: streamUrl, stream: true } : null;
    };
    let want = -1;
    let force = false;
    let source: { url: string; stream: boolean } | null = null;
    if (may) {
      const hovered = hoverK.current >= 0 ? sourceOf(hoverK.current, true) : null;
      const front = !hovered && frontK >= 0 && frontD <= CLIP_ARC ? sourceOf(frontK, false) : null;
      if (hovered) {
        want = hoverK.current;
        force = true;
        source = hovered;
      } else if (front) {
        want = frontK;
        source = front;
      }
    }
    if (want === playingK.current) return;
    stopClip();
    if (want < 0) {
      videoToken.release(owner.current);
      return;
    }
    const box = clipEls.current.get(want);
    const url = source?.url;
    if (!box || !url || !videoToken.take(owner.current, lose, force)) return;
    playingK.current = want;
    const v = document.createElement('video');
    v.className = 'cring-clip';
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = 'none';
    v.disablePictureInPicture = true;
    v.tabIndex = -1;
    v.setAttribute('aria-hidden', 'true');
    v.setAttribute('playsinline', '');
    v.onplaying = () => {
      if (clipVideo.current === v) v.dataset.on = '';
    };
    v.onerror = () => {
      failed.current.add(url);
      if (clipVideo.current === v) stopClip();
    };
    if (source?.stream) {
      v.ontimeupdate = () => {
        if (v.currentTime >= STREAM_LOOP_AT) v.currentTime = 0;
      };
    }
    v.src = url;
    box.append(v);
    clipVideo.current = v;
    void v.play().catch(() => {
      if (clipVideo.current === v) stopClip();
    });
  }, [a, n, step, clipsOn, running, paused, real, len, clipOf, streamOf, stopClip, lose]);

  const tickRef = useRef(tick);
  tickRef.current = tick;

  useLayoutEffect(() => {
    tickRef.current();
  }, [n]);

  useEffect(() => {
    if (!running) {
      tickRef.current();
      return;
    }
    tickRef.current();
    const id = window.setInterval(() => tickRef.current(), TICK);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    tickRef.current();
  }, [paused]);

  useEffect(
    () => () => {
      stopClip();
      videoToken.release(owner.current);
    },
    [stopClip],
  );

  // ----- The spin: SPEED °/s times `speed`, only while on screen and the tab is visible -----
  useEffect(() => {
    if (!running || n === 0) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const s = speed.get();
      if (!paused && !seek.current && !why.current.drag && s > 0.0005) a.set(a.get() + (SPEED * (base / n) * dt * s) / 1000);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, paused, n, base, a, speed]);

  // ----- Bring a card to the front -----
  const toFront = useCallback(
    (k: number) => {
      seek.current?.stop();
      const target = shortestTo(a.get(), k * step);
      const controls = animate(a, target, { ...spring.smooth, onComplete: () => tickRef.current() });
      seek.current = controls;
      void controls.finished.then(() => {
        if (seek.current === controls) seek.current = null;
      });
    },
    [a, step],
  );

  const roving = useRoving(len, (k) => {
    toFront(k);
  });
  setStopRef.current = roving.setActive;
  stopK.current = roving.active;

  // ----- Pointer: hover pause (fine pointer), touch drag -----
  const drag = useRef<{ id: number; x: number; y: number; a: number; moved: boolean; samples: { t: number; x: number }[] } | null>(null);
  const dragged = useRef(false);

  const onPointerEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || !finePointer()) return;
    why.current.hover = true;
    reevaluate();
  };
  const onPointerLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    why.current.hover = false;
    window.clearTimeout(hoverWait.current);
    hoverK.current = -1;
    pendingHover.current = NONE;
    hoverZoom.current = -1;
    applyZoom();
    reevaluate();
    tickRef.current();
  };
  /** The card under a moving mouse (from the geometry, so clones and the zoomed card's new size count): zoom it, and play its clip. */
  const onMouseMove = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || !finePointer()) return;
    const el = stage.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = hoverAt(e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2);
    if (next !== hoverZoom.current) {
      hoverZoom.current = next;
      applyZoom();
    }
    setHover(next);
  };
  const setHover = (next: number) => {
    if (next === hoverK.current) {
      window.clearTimeout(hoverWait.current);
      pendingHover.current = NONE;
      return;
    }
    if (next === pendingHover.current) return;
    window.clearTimeout(hoverWait.current);
    pendingHover.current = next;
    // (hover7) A short rest before a hovered card plays (100 ms for a stored clip, 300 ms for the stream), so a pointer sweeping across the ring
    // starts nothing; moving off the cards stops at once.
    const item = next >= 0 ? real[ringItem(next, len, n)] : undefined;
    const delay = next < 0 ? 0 : item !== undefined && clipOf?.(item) ? CLIP_HOVER_MS : STREAM_HOVER_MS;
    const apply = () => {
      pendingHover.current = NONE;
      hoverK.current = next;
      tickRef.current();
    };
    if (delay === 0) apply();
    else hoverWait.current = window.setTimeout(apply, delay);
  };
  useEffect(() => () => window.clearTimeout(hoverWait.current), []);
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'touch') return;
    dragged.current = false;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, a: a.get(), moved: false, samples: [{ t: performance.now(), x: e.clientX }] };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') {
      onMouseMove(e);
      return;
    }
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      d.moved = true;
      d.x = e.clientX;
      d.a = a.get();
      dragged.current = true;
      seek.current?.stop();
      seek.current = null;
      why.current.drag = true;
      speed.jump(0);
      held.current = true;
      ease.current?.stop();
    }
    a.set(d.a - (e.clientX - d.x) * DRAG);
    const now = performance.now();
    d.samples.push({ t: now, x: e.clientX });
    while (d.samples.length > 2 && now - (d.samples[0]?.t ?? now) > 100) d.samples.shift();
  };
  const endDrag = (e: ReactPointerEvent, cancelled: boolean) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.moved) return;
    why.current.drag = false;
    const first = d.samples[0];
    const lastS = d.samples[d.samples.length - 1];
    const dt = first && lastS ? (lastS.t - first.t) / 1000 : 0;
    const vx = dt > 0.008 && first && lastS ? (lastS.x - first.x) / dt : 0;
    if (!cancelled && Math.abs(vx) > 30) {
      const controls = animate(a, a.get(), { type: 'inertia', velocity: -vx * DRAG, power: 0.35, timeConstant: 450, onComplete: () => tickRef.current() });
      seek.current = controls;
      void controls.finished.then(() => {
        if (seek.current === controls) seek.current = null;
      });
    }
    holdFor(HOLD_TOUCH);
    tickRef.current();
  };
  const onClickCapture = (e: ReactMouseEvent) => {
    if (dragged.current) {
      // The end of a swipe is not a press.
      dragged.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const k = slotOf(e.target);
    if (k === null) return;
    toFront(k);
    holdFor(HOLD_PRESS);
  };

  // ----- Focus: hold while the keyboard is inside, bring the focused card round -----
  const onFocus = (e: ReactFocusEvent) => {
    const k = slotOf(e.target);
    if (k === null || k >= len) return;
    roving.setActive(k);
    const item = real[k];
    if (item !== undefined) onItemFocus?.(item);
    let keyboard = true;
    try {
      keyboard = (e.target as Element).matches(':focus-visible');
    } catch {
      keyboard = true;
    }
    if (!keyboard) return;
    why.current.focus = true;
    reevaluate();
    toFront(k);
    focusZoom.current = k;
    applyZoom();
  };
  const onBlur = (e: ReactFocusEvent) => {
    const into = e.relatedTarget;
    if (into instanceof Node && e.currentTarget.contains(into)) return;
    if (focusZoom.current >= 0) {
      focusZoom.current = -1;
      applyZoom();
    }
    if (!why.current.focus) return;
    why.current.focus = false;
    holdFor(HOLD_PRESS);
  };

  // Paused from outside: hold at once (nothing to see; the player covers it), let go gently.
  useEffect(() => {
    if (paused) {
      speed.jump(0);
      held.current = true;
      ease.current?.stop();
    } else {
      held.current = true;
      reevaluate();
    }
  }, [paused, speed, reevaluate]);

  if (n === 0) return null;

  const slots = Array.from({ length: n }, (_, k) => {
    const item = real[ringItem(k, len, n)] as T;
    const clone = k >= len;
    const url = clipsOn ? clipOf?.(item) || streamOf?.(item) : null;
    const clip = url ? (
      <span
        className="cring-clip-box"
        aria-hidden
        ref={(el) => {
          if (el) clipEls.current.set(k, el);
          else clipEls.current.delete(k);
        }}
      />
    ) : null;
    const state: CardRingState = { clone, flat: false, tabIndex: !interactive ? undefined : clone ? -1 : k === roving.active ? 0 : -1, clip, slot: k, slots: n };
    return (
      <div key={`${itemKey(item)}#${k}`} className="cring-slot" data-k={k} data-clone={clone ? '' : undefined} aria-hidden={clone ? true : undefined} inert={clone || undefined} style={{ '--i': k } as CSSProperties}>
        {renderCard(item, state)}
      </div>
    );
  });

  const vars = { '--n': n, '--step': `${step}deg` } as CSSProperties;

  if (!interactive)
    return (
      <div ref={stage} className={`cring ${className ?? ''}`} data-decorative="" aria-hidden inert style={vars}>
        <div ref={ring} className="cring-ring">
          {slots}
        </div>
      </div>
    );

  return (
    <div
      ref={stage}
      className={`cring ${className ?? ''}`}
      style={vars}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e, false)}
      onPointerCancel={(e) => endDrag(e, true)}
      onClickCapture={onClickCapture}
    >
      <div ref={ring} className="cring-ring" role="toolbar" aria-label={label} aria-orientation="horizontal" onKeyDown={roving.onKeyDown} onFocus={onFocus} onBlur={onBlur}>
        {slots}
      </div>
    </div>
  );
}
