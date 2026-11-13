import { finePointer, motionOk } from './motionOk';
import { spring } from './spring';

/**
 * Every control that takes the liquid fill, the press ripple and the magnet (styles/buttons.css draws them all as frosted glass, with the liquid
 * inside and a hover outline over it). Keep this list and the CSS one in step.
 * Tabs, chips and the segment kit are not here: they have their own sliding thumb.
 */
export const FX_BUTTONS =
  '.btn, .bf-add, .bf-edit, .calc-snap, .lib-btn, .nav-menu-btn, .nav-icon, .rail-paddle, .copy-btn, .reel-pause, .player-close, .calc-step, .bw-round, .lib-search-clear';

/** How far a button leans per pixel the pointer is off its centre, before the --pull cap. The label leans a little more, in CSS. */
const LEAN = 0.32;
/** Leave after the fill has had this long, and it drains toward where the pointer left; sooner, it drains back where it came in. */
const FILLED_MS = 420;

type Pull = { x: number; y: number; vx: number; vy: number; tx: number; ty: number };
type Hover = { el: HTMLElement; rect: DOMRect | null; reach: number; at: number };

let hover: Hover | null = null;
let pointer: { x: number; y: number } | null = null;
const pulls = new Map<HTMLElement, Pull>();
let frame = 0;
let last = 0;

// (r20admbtn) The admin takes the same effects as the public site (the founder): the liquid's entry point, the ripple and the magnet run there too.
const off = (el: Element) => el.matches(':disabled, [aria-disabled="true"]');
const fx = (target: EventTarget | null) => (target instanceof Element ? (target.closest(FX_BUTTONS) as HTMLElement | null) : null);
const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

/** Where the liquid starts or drains to (l), or the ripple starts (p), and how big the drop must grow to cover the button from that point. */
function setOrigin(el: HTMLElement, rect: DOMRect, x: number, y: number, prefix: 'l' | 'p') {
  // Kept on the button's edge: a pointer that has already left reports a point outside, and a drop moved out there would uncover the far side at once.
  el.style.setProperty(`--${prefix}x`, `${Math.round(Math.max(0, Math.min(rect.width, x - rect.left)))}px`);
  el.style.setProperty(`--${prefix}y`, `${Math.round(Math.max(0, Math.min(rect.height, y - rect.top)))}px`);
  el.style.setProperty('--blob', `${Math.ceil(2.4 * Math.hypot(rect.width, rect.height))}px`);
}

function aim() {
  if (!hover || !pointer) return;
  // The one layout read: on enter, and again only after a scroll has moved the button under a still pointer.
  hover.rect ??= hover.el.getBoundingClientRect();
  const r = hover.rect;
  let pull = pulls.get(hover.el);
  if (!pull) pulls.set(hover.el, (pull = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }));
  pull.tx = clamp((pointer.x - (r.left + r.width / 2)) * LEAN, hover.reach);
  pull.ty = clamp((pointer.y - (r.top + r.height / 2)) * LEAN, hover.reach * 0.8);
}

const { stiffness, damping, mass } = spring.follow;

/** One rAF loop for every button that is leaning or springing back. It writes two numbers per button per frame and stops when all have settled. */
function tick(now: number) {
  frame = 0;
  const still = !motionOk();
  const dt = Math.min(0.034, last ? (now - last) / 1000 : 1 / 60);
  last = now;
  if (hover && !hover.el.isConnected) hover = null;
  aim();
  let moving = false;
  for (const [el, p] of pulls) {
    if (hover?.el !== el) p.tx = p.ty = 0;
    if (still) {
      p.x = p.y = p.vx = p.vy = p.tx = p.ty = 0;
    } else {
      // Semi-implicit Euler in two half steps: stable for this spring at any frame rate down to 30.
      for (let i = 0; i < 2; i++) {
        const h = dt / 2;
        p.vx += ((-stiffness * (p.x - p.tx) - damping * p.vx) / mass) * h;
        p.vy += ((-stiffness * (p.y - p.ty) - damping * p.vy) / mass) * h;
        p.x += p.vx * h;
        p.y += p.vy * h;
      }
    }
    const settled = Math.abs(p.x - p.tx) + Math.abs(p.y - p.ty) < 0.05 && Math.abs(p.vx) + Math.abs(p.vy) < 0.5;
    if (!settled) moving = true;
    if ((settled && hover?.el !== el) || still) {
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
      pulls.delete(el);
    } else {
      el.style.setProperty('--mx', `${p.x.toFixed(2)}px`);
      el.style.setProperty('--my', `${p.y.toFixed(2)}px`);
    }
  }
  // A button held still under a still pointer costs nothing: the next pointermove starts the loop again.
  if (moving) frame = requestAnimationFrame(tick);
  else last = 0;
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(tick);
};

function release(x?: number, y?: number) {
  if (!hover) return;
  const { el, rect, at } = hover;
  if (rect && x !== undefined && y !== undefined && performance.now() - at > FILLED_MS) setOrigin(el, rect, x, y, 'l');
  hover = null;
  if (pulls.has(el)) schedule();
}

function onOver(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  const el = fx(e.target);
  if (el && el === hover?.el) return;
  release();
  if (!el || !motionOk() || !finePointer() || off(el)) return;
  const rect = el.getBoundingClientRect();
  setOrigin(el, rect, e.clientX, e.clientY, 'l');
  // --pull is the button's own reach, set per size in buttons.css: about 10 px for a large action, 4 px for an icon.
  const reach = parseFloat(getComputedStyle(el).getPropertyValue('--pull')) || 4;
  hover = { el, rect, reach, at: performance.now() };
  pointer = { x: e.clientX, y: e.clientY };
  schedule();
}

function onMove(e: PointerEvent) {
  if (!hover || e.pointerType !== 'mouse') return;
  pointer = { x: e.clientX, y: e.clientY };
  schedule();
}

function onOut(e: PointerEvent) {
  if (!hover || (e.relatedTarget instanceof Node && hover.el.contains(e.relatedTarget))) return;
  if (fx(e.target) !== hover.el) return;
  release(e.clientX, e.clientY);
}

/** The press: a ripple from the finger or the pointer, on touch as well. Two keyframe names, so a second press restarts it. */
function onDown(e: PointerEvent) {
  const el = fx(e.target);
  if (!el || !motionOk() || off(el)) return;
  setOrigin(el, el.getBoundingClientRect(), e.clientX, e.clientY, 'p');
  el.dataset.ripple = el.dataset.ripple === 'a' ? 'b' : 'a';
}

let installed = false;

/**
 * Buttons: one delegated set of listeners for the whole site, so no button needs its own code. The frosted body, the liquid fill, the press ripple
 * and the hover outline are CSS (styles/buttons.css), fed the pointer's entry and press points; the magnet is a physics spring (spring.follow) that
 * runs only for a mouse, only with motion allowed, and only while a button is leaning or settling. Touch gets the ripple and the press, never the
 * magnet.
 */
export function installButtonFx() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const opts = { passive: true } as const;
  document.addEventListener('pointerover', onOver, opts);
  document.addEventListener('pointermove', onMove, opts);
  document.addEventListener('pointerout', onOut, opts);
  document.addEventListener('pointerdown', onDown, opts);
  window.addEventListener(
    'scroll',
    () => {
      if (hover) hover.rect = null;
    },
    { passive: true, capture: true },
  );
}
