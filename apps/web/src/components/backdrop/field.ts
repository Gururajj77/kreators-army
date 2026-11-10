// The field's moving parts, outside React (round 3, "one continuous background"). Nothing here re-renders anything: one rAF-throttled frame reads the
// scroll and the pointer and writes three things on the fixed .bd layer:
//   --sp        scroll progress down the page (0 to 1): the palette's slow shift, in backdrop.css
//   .bd-light   the soft light: follows a fine pointer; on touch it drifts gently with the scroll instead
//   .bd-halo    the focus light: sits behind the card, frame, CTA or control that is hovered or keyboard-focused, while .bd-veil calms the rest
// Only transform, opacity and one custom property change, on a handful of composited layers. Never started under still (Backdrop decides).

/** What lights up when hovered or keyboard-focused: cards, video frames, CTAs and form controls. */
const LIT = [
  '.btn',
  '.vframe',
  '.tile',
  '.plate',
  '.pkg',
  '.faqi',
  '.chip-opt',
  '.rail-item',
  'input:not([type="hidden"])',
  'select',
  'textarea',
].join(',');

/** Never lit: the footer is its own dark sheet, the nav and dialogs float above the field, and the admin is not public. */
const UNLIT = '.ft, dialog, .nav, [data-no-field]';

/** Focus without a visible ring (a script moving focus, a mouse click) is not a reason to light anything. */
const keyboardFocus = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

function litTarget(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const el = node.closest<HTMLElement>(LIT);
  if (!el || el.closest(UNLIT)) return null;
  return el;
}

export function startField(root: HTMLElement, { fine }: { fine: boolean }): () => void {
  const light = root.querySelector<HTMLElement>('.bd-light');
  const halo = root.querySelector<HTMLElement>('.bd-halo');
  if (!light || !halo) return () => undefined;

  let raf = 0;
  let px = -1;
  let py = -1;
  let lastSp = -1;
  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;
  let shown: HTMLElement | null = null;

  // The page's height, kept by a ResizeObserver (its callback runs after layout), so a scroll frame never reads layout to know it.
  let docH = document.documentElement.scrollHeight;
  const sizes = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    docH = document.documentElement.scrollHeight;
    schedule();
  }) : null;
  sizes?.observe(document.documentElement);

  const frame = () => {
    raf = 0;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const y = window.scrollY;
    const target = focused ?? hovered;

    // The one layout read, and only while something is lit: reads first, then writes, so the frame never forces a second layout.
    const rect = target && target.isConnected ? target.getBoundingClientRect() : null;
    const max = Math.max(1, docH - vh);

    const sp = Math.min(1, Math.max(0, y / max));
    if (Math.abs(sp - lastSp) > 0.002) {
      lastSp = sp;
      root.style.setProperty('--sp', sp.toFixed(3));
    }

    if (fine) {
      if (px >= 0) light.style.transform = `translate3d(${Math.round(px)}px, ${Math.round(py)}px, 0)`;
    } else {
      // Touch: no hover, so the light wanders slowly across the screen as the page scrolls.
      const lx = vw * (0.5 + 0.32 * Math.sin(y / 760));
      const ly = vh * (0.34 + 0.16 * Math.cos(y / 980));
      light.style.transform = `translate3d(${Math.round(lx)}px, ${Math.round(ly)}px, 0)`;
    }

    if (rect && rect.bottom > -200 && rect.top < vh + 200 && rect.width > 0) {
      const sx = (rect.width + 300) / 100;
      const sy = (rect.height + 260) / 100;
      halo.style.transform = `translate3d(${Math.round(rect.left + rect.width / 2)}px, ${Math.round(rect.top + rect.height / 2)}px, 0) scale(${sx.toFixed(2)}, ${sy.toFixed(2)})`;
      if (shown !== target) {
        shown = target;
        root.dataset.tone = target!.matches('.btn-accent') ? 'action' : 'light';
        root.setAttribute('data-focus', '');
      }
    } else if (shown) {
      shown = null;
      root.removeAttribute('data-focus');
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    px = e.clientX;
    py = e.clientY;
    if (!root.hasAttribute('data-light')) root.setAttribute('data-light', '');
    schedule();
  };
  const onLeaveWindow = (e: PointerEvent) => {
    if (e.relatedTarget === null && e.pointerType === 'mouse') {
      root.removeAttribute('data-light');
      hovered = null;
      schedule();
    }
  };
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const next = litTarget(e.target);
    if (next !== hovered) {
      hovered = next;
      schedule();
    }
  };
  const onFocusIn = (e: FocusEvent) => {
    const el = e.target instanceof Element && keyboardFocus(e.target) ? litTarget(e.target) : null;
    focused = el;
    schedule();
  };
  const onFocusOut = () => {
    focused = null;
    schedule();
  };
  const onVisibility = () => {
    root.toggleAttribute('data-paused', document.visibilityState === 'hidden');
  };

  const opts = { passive: true } as const;
  window.addEventListener('scroll', schedule, opts);
  window.addEventListener('resize', schedule, opts);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibility);
  if (fine) {
    document.addEventListener('pointermove', onMove, opts);
    document.addEventListener('pointerover', onOver, opts);
    document.addEventListener('pointerout', onLeaveWindow, opts);
  } else {
    root.setAttribute('data-light', '');
  }
  onVisibility();
  schedule();

  return () => {
    cancelAnimationFrame(raf);
    sizes?.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onLeaveWindow);
    for (const a of ['data-light', 'data-focus', 'data-paused', 'data-tone']) root.removeAttribute(a);
    root.style.removeProperty('--sp');
    light.style.transform = '';
    halo.style.transform = '';
  };
}
