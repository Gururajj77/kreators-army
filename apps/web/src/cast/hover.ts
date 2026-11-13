import { CAST_LINES, type CastId, type CastLineKey } from '../lib/content';

// Every character, everywhere, opens a speech bubble on hover (a mouse or a pen), on keyboard focus of the control it stands in, and on a tap, every
// time, while its move plays. This is a layer over the scripted lines (useCastLine in components/chat.tsx): it never takes the one-speaker token, so a
// pointer resting on a character never blocks a page's own line, such as the contact form's step announcements.
//
// Which bubble: a scripted line already on screen is held open while hovered. Otherwise the character's own CastBubble children take turns (their words
// are in the DOM from the first paint), and a character with none uses its own bubble (rendered by Character, [data-own]) with its general lines.
// The bubble shows through [data-hover], an attribute React never writes, so a page re-rendering its CastBubble cannot fight it. One hover bubble on
// screen at a time, and one bubble site-wide, the newest winning: a hover hides any other character's line already up ([data-yield], which comes off with
// the hover), and a scripted line that starts while a hover bubble is up takes the hover bubble down. On the same character a scripted line wins
// (cast.css), and the hover bubble comes back when it has gone.

/** A character's general lines, for wherever it stands with no line of its own. */
export const HOVER_LINES: Record<CastId, readonly CastLineKey[]> = {
  bolu: ['home.army.bolu', 'home.hero.intro'],
  tiko: ['home.army.tiko', 'home.hero.tiko'],
  gola: ['home.army.gola', 'home.hero.gola'],
  sochu: ['home.army.sochu', 'home.hero.sochu'],
};

/** Places with lines of their own for the hover, found from the character's ancestors. The contact form's bubble child holds whatever was said last. */
const PLACE_LINES: { at: string; lines: Partial<Record<CastId, readonly CastLineKey[]>> }[] = [
  {
    at: '.cf',
    lines: {
      bolu: ['contact.step1', 'contact.question'],
      sochu: ['contact.step2', 'contact.step5'],
      tiko: ['contact.step3'],
      gola: ['contact.step4'],
    },
  },
];

const TAIL_SHARE = { center: 0.5, start: 0.28, end: 0.72 } as const;
const GUTTER = 12;
export type BubbleSide = keyof typeof TAIL_SHARE;

/** What a bubble must not cover: the nav, and anything a visitor can press. */
const BLOCKS = 'a[href], button, input, select, textarea, label, summary, [role="button"], [role="tab"], [role="link"], header, nav, dialog';

type Rect = { left: number; top: number; right: number; bottom: number };

/**
 * The screen scales a placement works in (r20bubbles): k, the character box's own scale on screen (an ancestor's transform, such as the Army
 * sentence's flyers, drawn at about a third of their size in the sentence), and v, the bubble's, which is k times its own `scale` (the flyers' bubbles
 * undo the flyer's scale so they stay readable). 1 and 1 everywhere else.
 */
function scalesOf(b: HTMLElement, parent: HTMLElement, pr: DOMRect) {
  const own = Number.parseFloat(getComputedStyle(b).scale);
  // Only a bubble that sets its own scale lives in a scaled box for good. Any other scale is a passing one (a character popping in on How it
  // works' stage, scale 0.6 to 1): it is placed for the size it lands at, from layout, as before.
  if (!Number.isFinite(own) || own <= 0 || own === 1) return { k: 1, v: 1 };
  const k = parent.offsetWidth ? pr.width / parent.offsetWidth : 1;
  return { k, v: k * own };
}

/** The viewport rect a bubble takes in its current placement, from layout, never from the box (it is mid-transition when this runs). */
function rectOf(b: HTMLElement, pr: DOMRect, shift: number, k = 1, v = 1): Rect {
  const w = b.offsetWidth;
  const h = b.offsetHeight;
  const beside = b.dataset.beside;
  const side = b.dataset.side;
  // Where the bubble's own scale is anchored (its transform-origin: the tail, or the side facing the head when it stands beside it).
  const tx = beside === 'end' ? 0 : beside === 'start' ? 1 : side === 'start' ? 0.28 : side === 'end' ? 0.72 : 0.5;
  const centered = !beside && side !== 'start' && side !== 'end';
  const layoutLeft = b.offsetLeft - (centered ? w / 2 : 0) + shift;
  const left = pr.left + k * (layoutLeft + tx * w) - tx * w * v;
  const top = beside ? pr.top + k * (b.offsetTop + h / 2) - (h * v) / 2 : pr.top + k * (b.offsetTop + h + 8) - 8 * v - h * v;
  return { left, top, right: left + w * v, bottom: top + h * v };
}

/**
 * The boxes that would cut the bubble off: every ancestor that clips its overflow, on the axes it clips (r20bubbles: a bubble above a character
 * near a card's top edge rose past the card and lost its top half to the card's overflow: hidden).
 */
function clipsOf(b: HTMLElement) {
  const list: { r: DOMRect; x: boolean; y: boolean }[] = [];
  for (let e = b.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
    const s = getComputedStyle(e);
    const x = s.overflowX !== 'visible';
    const y = s.overflowY !== 'visible';
    if (x || y) list.push({ r: e.getBoundingClientRect(), x, y });
  }
  return list;
}

/** True when the rect leaves the screen, is cut off by a clipping ancestor, slides under the nav, or covers a control that is not the character's own. */
function blocked(r: Rect, own: Element, clips: ReturnType<typeof clipsOf> = []) {
  const vw = document.documentElement.clientWidth;
  if (r.left < 0 || r.right > vw || r.top < 0 || r.bottom > window.innerHeight) return true;
  for (const c of clips) {
    if (c.x && (r.left < c.r.left - 0.5 || r.right > c.r.right + 0.5)) return true;
    if (c.y && (r.top < c.r.top - 0.5 || r.bottom > c.r.bottom + 0.5)) return true;
  }
  const pill = document.querySelector('.nav-pill')?.getBoundingClientRect();
  if (pill && pill.bottom > 0 && r.top < pill.bottom + 6 && r.right > pill.left && r.left < pill.right) return true;
  // Every control on the page, by its box: an exact answer for a link beside the bubble's edge, at a cost paid once per hover.
  for (const el of document.querySelectorAll<HTMLElement>(BLOCKS)) {
    if (own.contains(el) || el.contains(own)) continue;
    const q = el.getBoundingClientRect();
    if (!q.width || !q.height || q.right <= r.left || q.left >= r.right || q.bottom <= r.top || q.top >= r.bottom) continue;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    return true;
  }
  return false;
}

/**
 * Keeps a bubble inside its bounds: the nearest [data-bubble-bounds] ancestor, else the viewport, with a 12 px gutter. It shifts the bubble by the
 * overflow (the `translate` property, through --shift) and moves the tail back so it still points at the head, 18 px from either end at most.
 * Measured from layout (offsetLeft, offsetWidth), not from the box, which is mid-transition when this runs.
 * Above the head is the place; when that slides under the nav, leaves the screen, is cut off by a clipping ancestor or covers a link or a button,
 * the bubble stands beside the head instead ([data-beside], cast.css), on whichever side is clear, and stays above when neither is.
 */
export function placeBubble(b: HTMLElement, side: BubbleSide) {
  b.style.removeProperty('--shift');
  b.style.removeProperty('--tail-x');
  delete b.dataset.beside;
  const parent = b.offsetParent as HTMLElement | null;
  if (!parent) return;
  const w = b.offsetWidth;
  const pr = parent.getBoundingClientRect();
  const { k, v } = scalesOf(b, parent, pr);
  const at = rectOf(b, pr, 0, k, v);
  const host = b.closest('[data-bubble-bounds]');
  const box = host ? host.getBoundingClientRect() : { left: 0, right: document.documentElement.clientWidth };
  // The shift on screen, then in the parent's own units (a scaled parent scales the translate too).
  let moved = 0;
  if (at.left < box.left + GUTTER) moved = box.left + GUTTER - at.left;
  else if (at.right > box.right - GUTTER) moved = box.right - GUTTER - at.right;
  const shift = moved / k;
  const own = parent.closest('.k-char') ?? parent;
  const clips = clipsOf(b);
  if (blocked(rectOf(b, pr, shift, k, v), own, clips)) {
    for (const beside of ['end', 'start'] as const) {
      b.dataset.beside = beside;
      if (!blocked(rectOf(b, pr, 0, k, v), own, clips)) return;
    }
    delete b.dataset.beside;
  }
  if (!moved) return;
  // The tail, in the bubble's own units: a screen shift of `moved` is moved / v of them.
  const tail = Math.max(18, Math.min(w - 18, TAIL_SHARE[side] * w - moved / v));
  b.style.setProperty('--shift', `${Math.round(shift)}px`);
  b.style.setProperty('--tail-x', `${Math.round(tail)}px`);
}

const sideOf = (b: HTMLElement): BubbleSide => {
  const s = b.dataset.side;
  return s === 'start' || s === 'end' ? s : 'center';
};

/** How long a tapped line stays up: the scripted dwell, about 900 ms plus 45 ms a character, between 1.8 and 4 s. */
const dwell = (line: string) => Math.max(1800, Math.min(4000, 900 + 45 * line.length));

/** Wait this long after an enter before picking, so a page's own line started by the same hover is held rather than doubled. */
const PICK_MS = 70;
/** Stay this long after the pointer leaves: crossing a gap between a character and its bubble's neighbours does not flicker. */
const LEAVE_MS = 320;
const TAP_SLOP = 10;

interface Hover {
  hide: () => void;
}

let current: Hover | null = null;

export interface HoverInit {
  box: HTMLElement;
  who: CastId;
  /** Lines given by the page (Character's `lines`), read at each pick. */
  lines: () => readonly CastLineKey[] | undefined;
  /** Play the move that goes with the line. */
  react: () => void;
}

/** Wires a character's hover, focus and tap to its bubble. Returns the teardown. */
export function attachHover({ box, who, lines, react }: HoverInit): () => void {
  const own = box.querySelector<HTMLElement>(':scope > .cast-bubble[data-own]');
  // The control the character stands in (a tile, a card link), if any: its hover and keyboard focus count as the character's.
  const host = box.parentElement?.closest<HTMLElement>('a[href], button, [role="button"]') ?? null;
  const zone = host ?? box;
  let shown: HTMLElement | null = null;
  let turn = 0;
  let pickTimer = 0;
  let leaveTimer = 0;
  let tapTimer = 0;
  let tapStart: { x: number; y: number } | null = null;
  let yielded: HTMLElement[] = [];
  let watch: MutationObserver | null = null;

  const candidates = () => {
    const given = lines() ?? PLACE_LINES.find((p) => p.lines[who] && box.closest(p.at))?.lines[who];
    const list: { el: HTMLElement; text: string }[] = [];
    if (!given) {
      for (const el of box.querySelectorAll<HTMLElement>(':scope > .cast-bubble:not([data-own])')) {
        const text = el.querySelector('.bubble-text')?.textContent?.trim();
        if (text && !list.some((c) => c.text === text)) list.push({ el, text });
      }
    }
    if (!list.length && own) for (const key of given ?? HOVER_LINES[who]) list.push({ el: own, text: CAST_LINES[key].line });
    return list;
  };

  const clearTimers = () => {
    window.clearTimeout(pickTimer);
    window.clearTimeout(leaveTimer);
    window.clearTimeout(tapTimer);
  };

  const hide = () => {
    clearTimers();
    if (current === api) current = null;
    watch?.disconnect();
    watch = null;
    for (const b of yielded) b.removeAttribute('data-yield');
    yielded = [];
    const el = shown;
    shown = null;
    if (!el) return;
    el.removeAttribute('data-hover');
    // The leave lifts 4 px while it fades (chat.css). A scripted line still on screen stays up on its own timer.
    if (!el.hasAttribute('data-show')) {
      el.setAttribute('data-out', '');
      window.setTimeout(() => {
        if (el !== shown) el.removeAttribute('data-out');
      }, 220);
    }
  };

  const show = () => {
    if (shown) return;
    if (current && current !== api) current.hide();
    // A scripted line on screen now is held open; otherwise the next line in turn.
    let el = box.querySelector<HTMLElement>(':scope > .cast-bubble[data-show]');
    if (!el) {
      const list = candidates();
      if (!list.length) return;
      const pick = list[turn++ % list.length]!;
      el = pick.el;
      if (el === own) {
        const text = own?.querySelector('.bubble-text');
        if (text) text.textContent = pick.text;
      }
    }
    current = api;
    shown = el;
    el.removeAttribute('data-out');
    placeBubble(el, sideOf(el));
    el.setAttribute('data-hover', '');
    // The newest bubble wins: lines already up on other characters step aside while this one shows,
    yielded = [...document.querySelectorAll<HTMLElement>('.cast-bubble[data-show]')].filter((b) => !box.contains(b));
    for (const b of yielded) b.setAttribute('data-yield', '');
    // and a line that starts elsewhere while it shows takes it down.
    watch = new MutationObserver((records) => {
      if (records.some((r) => !box.contains(r.target) && (r.target as HTMLElement).hasAttribute('data-show'))) hide();
    });
    watch.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-show'] });
  };

  const enter = () => {
    window.clearTimeout(leaveTimer);
    window.clearTimeout(tapTimer);
    react();
    if (shown) return;
    window.clearTimeout(pickTimer);
    pickTimer = window.setTimeout(show, PICK_MS);
  };

  const leave = () => {
    window.clearTimeout(pickTimer);
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(hide, LEAVE_MS);
  };

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') enter();
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') leave();
  };
  const onDown = (e: PointerEvent) => {
    tapStart = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null;
  };
  // A tap shows the next line for its dwell. A scroll that starts on the character is cancelled by the browser and never gets here.
  const onUp = (e: PointerEvent) => {
    const start = tapStart;
    tapStart = null;
    if (e.pointerType !== 'touch' || !start || Math.hypot(e.clientX - start.x, e.clientY - start.y) >= TAP_SLOP) return;
    if (shown) hide();
    react();
    show();
    const el = shown as HTMLElement | null;
    if (el) tapTimer = window.setTimeout(hide, dwell(el.querySelector('.bubble-text')?.textContent ?? ''));
  };
  const onFocusIn = (e: FocusEvent) => {
    if (e.target === host && host?.matches(':focus-visible')) enter();
  };
  const onFocusOut = (e: FocusEvent) => {
    if (e.target === host) leave();
  };

  const api: Hover = { hide };

  zone.addEventListener('pointerenter', onEnter);
  zone.addEventListener('pointerleave', onLeave);
  zone.addEventListener('pointerdown', onDown, { passive: true });
  zone.addEventListener('pointerup', onUp, { passive: true });
  host?.addEventListener('focusin', onFocusIn);
  host?.addEventListener('focusout', onFocusOut);
  return () => {
    zone.removeEventListener('pointerenter', onEnter);
    zone.removeEventListener('pointerleave', onLeave);
    zone.removeEventListener('pointerdown', onDown);
    zone.removeEventListener('pointerup', onUp);
    host?.removeEventListener('focusin', onFocusIn);
    host?.removeEventListener('focusout', onFocusOut);
    hide();
  };
}
