// The two things the whole stage shares, kept out of the rig chunk so speech bubbles and the street can use them from the first download:
// the one passive pointermove listener, and the one-speaker token that bubbles and the director's performances take turns with.
// director.ts re-exports both (V2-SPEC 3.3): import them from '../cast' in components, never from './director', which is the lazy rig.

type PointerFn = (x: number, y: number, e: PointerEvent) => void;

const pointerFns = new Set<PointerFn>();
let listening = false;

/** The last pointer position in viewport pixels, and whether one has been seen yet. */
export const pointer = { x: 0, y: 0, known: false, type: '' };

function onMove(e: PointerEvent) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.known = true;
  pointer.type = e.pointerType;
  for (const fn of pointerFns) fn(e.clientX, e.clientY, e);
}

/**
 * Hear the pointer through the one passive `pointermove` listener the site has (R10). Returns the unsubscribe. The listener is added on first use and
 * kept; it costs one assignment per move when nothing is subscribed.
 */
export function onPointer(fn: PointerFn): () => void {
  if (!listening && typeof window !== 'undefined') {
    listening = true;
    window.addEventListener('pointermove', onMove, { passive: true });
  }
  pointerFns.add(fn);
  return () => {
    pointerFns.delete(fn);
  };
}

/** Whoever speaks or performs: a character's root element, a sequence's own object, or the director's group. */
export type TokenOwner = object;

let holder: TokenOwner | null = null;
let holds = 0;
const freeFns = new Set<() => void>();

function free() {
  holder = null;
  holds = 0;
  for (const fn of [...freeFns]) fn();
}

/**
 * One speaker at a time, site-wide: a speech bubble and a character's performance share this token (visual §1.1, motion §7). The same owner may take it
 * again while it holds it (a character's signature and its own bubble), and must release it as many times; the token is free when the count is back at 0.
 */
export const bubbleToken = {
  /** Takes the token for `owner`. False when someone else holds it. */
  take(owner: TokenOwner): boolean {
    if (holder && holder !== owner) return false;
    holder = owner;
    holds++;
    return true;
  },
  /** Gives back one take. A release by an owner that does not hold the token does nothing. */
  release(owner: TokenOwner) {
    if (holder !== owner) return;
    holds--;
    if (holds <= 0) free();
  },
  /** Drops every take of `owner` at once, for an owner that is going away. */
  drop(owner: TokenOwner) {
    if (holder === owner) free();
  },
  holder(): TokenOwner | null {
    return holder;
  },
  /** True while anyone holds it. */
  busy(): boolean {
    return holder !== null;
  },
  /** Calls fn each time the token comes free. Returns the unsubscribe. */
  onFree(fn: () => void): () => void {
    freeFns.add(fn);
    return () => {
      freeFns.delete(fn);
    };
  },
  /** Takes the token for `owner`, waiting up to `ms` for it to come free (visual §1.1: 600 ms, then give up; never a queue). */
  wait(owner: TokenOwner, ms = 600): Promise<boolean> {
    if (bubbleToken.take(owner)) return Promise.resolve(true);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        off();
        resolve(false);
      }, ms);
      const off = bubbleToken.onFree(() => {
        if (!bubbleToken.take(owner)) return;
        clearTimeout(timer);
        off();
        resolve(true);
      });
    });
  },
};
