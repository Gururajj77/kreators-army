import { useEffect, useState, type RefObject } from 'react';
import { useStill } from './store';

// One switch for everything that moves on its own or follows the pointer. `data-still` on <html> is set by theme.js (and the store) when the visitor
// asks for still, or when the OS asks for reduced motion, so a reduced-motion preference and the Pause animations control are the same thing here.
// MotionConfig does not cover animate(motionValue), useSpring, CSS keyframes or `d` tweens: gate those with this.

/** Reactive: true when motion is allowed. Use in components that re-render. */
export function useMotionOk(): boolean {
  return !useStill((s) => s.still);
}

/** Read once, for use outside React or in a callback that must not re-render. */
export const motionOk = (): boolean => typeof document === 'undefined' || !('still' in document.documentElement.dataset);

/** A real mouse or trackpad: the only place pointer-following effects (magnet, hover tracking) run. */
export const finePointer = (): boolean => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

/** The visitor's browser asked to save data (Chrome's Lite mode, Android Data Saver). */
export const saveData = (): boolean => typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/**
 * May a video play by itself here: a muted preview, the hero's front card, the thread's newest reply? Only with a fine pointer (so never on phones or
 * touch), motion allowed and no Save-Data (V2-SPEC 3.4, C13). The player dialog is user-initiated and does not ask.
 */
export const canAutoplay = (): boolean => finePointer() && motionOk() && !saveData();

/**
 * True only while the element is on screen and the tab is visible: the condition every endless animation runs under.
 * Publish it as `data-run` and pause in CSS, or test it in a loop.
 */
export function useRunning(ref: RefObject<Element | null>): boolean {
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), { rootMargin: '80px' });
    io.observe(el);
    const onVisible = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ref]);

  return onScreen && tabVisible;
}
