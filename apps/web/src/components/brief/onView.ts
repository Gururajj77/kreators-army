import { useEffect, useRef, useState, type RefObject } from 'react';

// Owner: A6 Pages B. One IntersectionObserver per call: "do this once, when this much of it is on screen". Used for the cast's lines on How we work,
// the trial and the contact page, which each fire once per page view.

/** Runs `fn` once, the first time `ratio` of `el` (or that share of the viewport's height, for tall elements) is on screen. Returns a disconnect. */
export function onView(el: Element, ratio: number, fn: () => void, rootMargin = '0px'): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    fn();
    return () => undefined;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting && (e.intersectionRatio >= ratio || e.intersectionRect.height >= window.innerHeight * ratio))) {
        io.disconnect();
        fn();
      }
    },
    { threshold: [0, ratio, 1], rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** The hook form of onView: `fn` runs once when `ref` is in view, `delay` ms later. The latest `fn` is used. */
export function useOnView(ref: RefObject<Element | null>, ratio: number, fn: () => void, delay = 0) {
  const latest = useRef(fn);
  latest.current = fn;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const stop = onView(el, ratio, () => {
      timer = window.setTimeout(() => latest.current(), delay);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [ref, ratio, delay]);
}

/**
 * Which section a sticky index marks: the first at the top of the page, then the last one whose top has passed a line a third of the way down the
 * window. One passive scroll listener, read once a frame.
 */
export function useSectionAt(ids: readonly string[]): string {
  const [current, setCurrent] = useState(ids[0] ?? '');
  const key = ids.join('|');
  useEffect(() => {
    const list = key.split('|');
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let at = list[0] ?? '';
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
 * Says a cast line, trying again a little later while the one bubble belongs to someone else (a line waits only 600 ms for the token, then gives
 * up). Stops at the first success; a line already said, or a speaker off screen, simply never shows.
 */
export async function sayPatiently(say: () => Promise<boolean>, tries = 3, gap = 1500): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    if (await say()) return true;
    if (i < tries - 1) await new Promise((r) => window.setTimeout(r, gap));
  }
  return false;
}
