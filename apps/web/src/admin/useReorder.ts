// Owner: A4 Admin. Reordering the videos list by pointer and by keyboard (admin brief 5.3, V2-SPEC 4.2).
//
// Pointer: press on a row's handle and drag. The lifted row follows the pointer on spring.follow; the others make room with Motion `layout` on
// spring.snappy; the page scrolls near the edges. Motion's Reorder components are not used: they render `motion.*`, which LazyMotion strict forbids,
// so this is the same idea on `m.li`.
// Keyboard: Space or Enter on a handle lifts the row, ↑/↓ move it, Space or Enter drops it, Esc puts it back. Every step is announced in an assertive
// live region ("Picked up {title}. Position {i} of {n}.", "Moved to position {i}.", "Dropped at position {i}.", "Reorder cancelled.").
import { useMotionValue, useSpring, type MotionValue } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { motionOk } from '../lib/motionOk';
import { spring } from '../lib/spring';

interface Drag {
  id: string;
  pointerId: number;
  /** Page Y of the press. */
  startY: number;
  startIndex: number;
  index: number;
  /** Distance between two rows' tops. */
  slot: number;
  base: string[];
  lastClientY: number;
  raf: number;
  handle: HTMLElement;
}

export interface ReorderApi {
  /** The ids in their working order. */
  order: string[];
  /** The row being moved (scaled up, raised). */
  lifted: string | null;
  /** The row that carries the pointer offset (it stays set until the drop settles). */
  active: string | null;
  mode: 'pointer' | 'keyboard' | null;
  /** The pointer offset of the active row. */
  y: MotionValue<number>;
  rowRef: (id: string) => (el: HTMLElement | null) => void;
  handleRef: (id: string) => (el: HTMLElement | null) => void;
  onHandlePointerDown: (id: string, e: ReactPointerEvent<HTMLElement>) => void;
  onHandleKeyDown: (id: string, e: ReactKeyboardEvent<HTMLElement>) => void;
  onHandleBlur: (id: string) => void;
  /** Move to the top or the bottom (the row menu). */
  moveTo: (id: string, where: 'top' | 'bottom') => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function useReorder({
  ids,
  enabled,
  onCommit,
  announce,
  titleOf,
}: {
  ids: string[];
  enabled: boolean;
  onCommit: (ids: string[]) => void;
  announce: (text: string) => void;
  titleOf: (id: string) => string;
}): ReorderApi {
  const [order, setOrder] = useState(ids);
  const [lifted, setLifted] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<'pointer' | 'keyboard' | null>(null);
  const orderRef = useRef(order);
  orderRef.current = order;
  const moving = useRef(false);
  const rows = useRef(new Map<string, HTMLElement>());
  const handles = useRef(new Map<string, HTMLElement>());
  const drag = useRef<Drag | null>(null);
  const kb = useRef<{ id: string; start: string[] } | null>(null);
  const settle = useRef(0);
  const target = useMotionValue(0);
  const y = useSpring(target, spring.follow);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  // Follow the server's order whenever nothing is being moved.
  const key = ids.join('|');
  useEffect(() => {
    if (!moving.current) setOrder(key ? key.split('|') : []);
  }, [key]);

  const rowRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) rows.current.set(id, el);
      else rows.current.delete(id);
    },
    [],
  );
  const handleRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) handles.current.set(id, el);
      else handles.current.delete(id);
    },
    [],
  );

  const setY = (v: number, instant = false) => {
    target.set(v);
    if (instant || !motionOk()) y.jump(v);
  };

  const refocus = (id: string) => {
    const h = handles.current.get(id);
    if (h && document.activeElement !== h) h.focus({ preventScroll: true });
    h?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  };

  // ---------- Pointer ----------

  const update = useCallback(
    (clientY: number) => {
      const d = drag.current;
      if (!d) return;
      d.lastClientY = clientY;
      const n = d.base.length;
      const dy = clientY + window.scrollY - d.startY;
      const to = clamp(Math.round((d.startIndex * d.slot + dy) / d.slot), 0, n - 1);
      if (to !== d.index) {
        const next = d.base.filter((x) => x !== d.id);
        next.splice(to, 0, d.id);
        const shift = (to - d.index) * d.slot;
        d.index = to;
        flushSync(() => setOrder(next));
        // The row's own box moved by `shift`; take it out of the offset at once so it stays under the pointer.
        y.jump(y.get() - shift);
        target.jump(target.get() - shift);
      }
      setY(dy - (to - d.startIndex) * d.slot);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [y, target],
  );

  const finishPointer = useCallback(
    (cancelled: boolean) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      cancelAnimationFrame(d.raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      try {
        d.handle.releasePointerCapture(d.pointerId);
      } catch {
        // already released
      }
      if (cancelled) flushSync(() => setOrder(d.base));
      setY(0);
      setLifted(null);
      setMode(null);
      moving.current = false;
      window.clearTimeout(settle.current);
      settle.current = window.setTimeout(() => setActive(null), motionOk() ? 450 : 0);
      const final = orderRef.current;
      if (!cancelled && !same(final, d.base)) {
        announce(`Dropped at position ${final.indexOf(d.id) + 1}.`);
        commitRef.current(final);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [announce],
  );

  // Stable listeners that read the ref.
  const onMove = useRef((e: PointerEvent) => {
    if (drag.current && e.pointerId === drag.current.pointerId) updateRef.current(e.clientY);
  }).current;
  const onUp = useRef((e: PointerEvent) => {
    if (drag.current && e.pointerId === drag.current.pointerId) finishRef.current(false);
  }).current;
  const onCancel = useRef((e: PointerEvent) => {
    if (drag.current && e.pointerId === drag.current.pointerId) finishRef.current(true);
  }).current;
  const finishRef = useRef(finishPointer);
  finishRef.current = finishPointer;
  const updateRef = useRef(update);
  updateRef.current = update;

  const onHandlePointerDown = (id: string, e: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || e.button !== 0 || drag.current || kb.current) return;
    const base = orderRef.current;
    const startIndex = base.indexOf(id);
    if (startIndex < 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // capture is a nicety; window listeners still follow
    }
    const first = rows.current.get(base[0]!)?.getBoundingClientRect();
    const last = rows.current.get(base[base.length - 1]!)?.getBoundingClientRect();
    const own = rows.current.get(id)?.getBoundingClientRect();
    const slot = base.length > 1 && first && last ? (last.top - first.top) / (base.length - 1) : (own?.height ?? 72);
    drag.current = { id, pointerId: e.pointerId, startY: e.clientY + window.scrollY, startIndex, index: startIndex, slot: Math.max(slot, 1), base, lastClientY: e.clientY, raf: 0, handle };
    moving.current = true;
    window.clearTimeout(settle.current);
    y.jump(0);
    target.jump(0);
    setActive(id);
    setLifted(id);
    setMode('pointer');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    // Scroll the page while the pointer rests near the top or the bottom edge.
    const tick = () => {
      const d = drag.current;
      if (!d) return;
      const edge = 72;
      let v = 0;
      if (d.lastClientY < edge) v = -Math.ceil((edge - d.lastClientY) / 5);
      else if (d.lastClientY > window.innerHeight - edge) v = Math.ceil((d.lastClientY - (window.innerHeight - edge)) / 5);
      if (v) {
        window.scrollBy(0, v);
        updateRef.current(d.lastClientY);
      }
      d.raf = requestAnimationFrame(tick);
    };
    drag.current.raf = requestAnimationFrame(tick);
  };

  useEffect(
    () => () => {
      const d = drag.current;
      if (d) cancelAnimationFrame(d.raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.clearTimeout(settle.current);
    },
    [onMove, onUp, onCancel],
  );

  // ---------- Keyboard ----------

  const dropKeyboard = (id: string) => {
    const k = kb.current;
    if (!k || k.id !== id) return;
    kb.current = null;
    moving.current = false;
    setLifted(null);
    setActive(null);
    setMode(null);
    const final = orderRef.current;
    announce(`Dropped at position ${final.indexOf(id) + 1}.`);
    if (!same(final, k.start)) commitRef.current(final);
  };

  const onHandleKeyDown = (id: string, e: ReactKeyboardEvent<HTMLElement>) => {
    const k = kb.current;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!enabled) {
        announce('Clear filters to reorder.');
        return;
      }
      if (!k && !drag.current) {
        const cur = orderRef.current;
        kb.current = { id, start: cur };
        moving.current = true;
        setLifted(id);
        setMode('keyboard');
        announce(`Picked up ${titleOf(id)}. Position ${cur.indexOf(id) + 1} of ${cur.length}.`);
      } else if (k?.id === id) dropKeyboard(id);
      return;
    }
    if (!k || k.id !== id) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = orderRef.current;
      const i = cur.indexOf(id);
      const j = clamp(i + (e.key === 'ArrowUp' ? -1 : 1), 0, cur.length - 1);
      if (j === i) {
        announce(`Position ${i + 1} of ${cur.length}.`);
        return;
      }
      const next = cur.filter((x) => x !== id);
      next.splice(j, 0, id);
      flushSync(() => setOrder(next));
      refocus(id);
      announce(`Moved to position ${j + 1}.`);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      kb.current = null;
      moving.current = false;
      flushSync(() => setOrder(k.start));
      refocus(id);
      setLifted(null);
      setMode(null);
      announce('Reorder cancelled.');
    }
  };

  // React moves the focused handle when the order changes, which blurs it; only a real move of focus elsewhere drops the row.
  const onHandleBlur = (id: string) => {
    window.setTimeout(() => {
      const k = kb.current;
      if (k && k.id === id && document.activeElement !== handles.current.get(id)) dropKeyboard(id);
    }, 0);
  };

  const moveTo = (id: string, where: 'top' | 'bottom') => {
    const cur = orderRef.current;
    if (!cur.includes(id)) return;
    const next = cur.filter((x) => x !== id);
    if (where === 'top') next.unshift(id);
    else next.push(id);
    if (same(next, cur)) return;
    setOrder(next);
    commitRef.current(next);
  };

  return { order, lifted, active, mode, y, rowRef, handleRef, onHandlePointerDown, onHandleKeyDown, onHandleBlur, moveTo };
}
