// The card ring (library-slider-cta-spec §1): tall rounded portrait cards on the inside of a slowly turning cylinder, seen from just outside it, so
// the far wall faces you and the cards grow and bend toward both edges. Pure CSS 3D: the stage holds the camera (perspective), the ring turns
// (rotateY, written straight to its style every frame, never through React state) and each slot pushes its card out to the wall. Backface culling
// hides the near half. Used twice: the brand filter at the top of /video-library (interactive) and the footer CTA (decorative).
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
  const owner = useRef<object>({});
  const failed = useRef(new Set<string>());
  const clipsOn = interactive && Boolean(clipOf || streamOf) && canAutoplay();

  const write = useCallback((v: number) => {
    if (ring.current) ring.current.style.transform = `rotateY(${v.toFixed(3)}deg)`;
  }, []);
  useEffect(() => a.on('change', write), [a, write]);

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
    reevaluate();
    tickRef.current();
  };
  const onPointerOver = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const k = slotOf(e.target);
    const next = k ?? -1;
    window.clearTimeout(hoverWait.current);
    if (next === hoverK.current) return;
    // (hover7) A short rest before a hovered card plays (100 ms for a stored clip, 300 ms for the stream), so a pointer sweeping across the ring
    // starts nothing; moving off the cards stops at once.
    const item = next >= 0 ? real[ringItem(next, len, n)] : undefined;
    const delay = next < 0 ? 0 : item !== undefined && clipOf?.(item) ? CLIP_HOVER_MS : STREAM_HOVER_MS;
    const apply = () => {
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
  };
  const onBlur = (e: ReactFocusEvent) => {
    const into = e.relatedTarget;
    if (into instanceof Node && e.currentTarget.contains(into)) return;
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
      onPointerOver={onPointerOver}
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
