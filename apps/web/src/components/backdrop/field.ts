// The field's moving parts, outside React. Nothing here re-renders anything: one rAF-throttled frame reads the scroll and the pointer and writes
// transforms on the fixed .bd layer (styles/backdrop.css):
//   .bd-plate   the metal: slides up as the page scrolls (it is 2.5 screens tall), so the dominant hue shifts from navy to oxblood to green
//   .bd-light   the pointer light: a soft round window that brightens the metal behind it. It follows a fine pointer (on touch it drifts with the
//               scroll), so the light travels across the relief
//   .bd-halo    the focus light: the same kind of window, scaled to the card, frame, CTA or control that is hovered or keyboard-focused, while
//               .bd-veil calms the rest
// Only transforms and a few attributes change, on a handful of composited layers. Never started under still (Backdrop decides).

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

/** The halo window's size in CSS (.bd-halo), scaled to each element. */
const HALO = 100;

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

const px = (n: number) => `${Math.round(n)}px`;

export function startField(root: HTMLElement, { fine }: { fine: boolean }): () => void {
  const plate = root.querySelector<HTMLElement>('.bd-plate');
  const light = root.querySelector<HTMLElement>('.bd-light');
  const halo = root.querySelector<HTMLElement>('.bd-halo');
  if (!plate || !light || !halo) return () => undefined;

  let raf = 0;
  let mx = -1;
  let my = -1;
  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;
  let shown: HTMLElement | null = null;
  let lastPlate = NaN;
  let lastLx = NaN;
  let lastLy = NaN;
  // While the page scrolls the halo rests (no layout read on a scroll frame); it lights again once the scroll settles.
  let lastScroll = -1e9;
  let settle = 0;
  const SETTLE_MS = 160;

  // Sizes kept by a ResizeObserver (its callback runs after layout), so a scroll frame never reads layout to know them: the page's height, the
  // plate's height and the light window's size.
  let docH = document.documentElement.scrollHeight;
  let plateH = plate.offsetHeight;
  let lightS = light.offsetWidth;
  const sizes =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          docH = document.documentElement.scrollHeight;
          plateH = plate.offsetHeight;
          lightS = light.offsetWidth;
          lastPlate = NaN;
          lastLx = NaN;
          schedule();
        })
      : null;
  sizes?.observe(document.documentElement);
  sizes?.observe(plate);
  sizes?.observe(light);

  const frame = () => {
    raf = 0;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const y = window.scrollY;
    const target = focused ?? hovered;
    const still = performance.now() - lastScroll;
    const scrolling = still < SETTLE_MS;
    if (scrolling && target && !settle) {
      settle = window.setTimeout(() => {
        settle = 0;
        schedule();
      }, SETTLE_MS - still + 20);
    }

    // The one layout read, and only while something is lit and the page is still: reads first, then writes, so the frame never forces a second
    // layout.
    const rect = target && !scrolling && target.isConnected ? target.getBoundingClientRect() : null;

    // The plate slides from its top (navy) to its bottom (green) over the whole page.
    const sp = Math.min(1, Math.max(0, y / Math.max(1, docH - vh)));
    const py = Math.round(-sp * Math.max(0, plateH - vh));
    if (py !== lastPlate) {
      lastPlate = py;
      plate.style.transform = `translate3d(0, ${py}px, 0)`;
    }

    // The pointer light. Touch has no hover, so the light wanders slowly across the screen as the page scrolls.
    let lx = mx;
    let ly = my;
    if (!fine) {
      lx = vw * (0.5 + 0.3 * Math.sin(y / 760));
      ly = vh * (0.36 + 0.16 * Math.cos(y / 980));
    }
    if (lx >= 0) {
      const tx = Math.round(lx - lightS / 2);
      const ty = Math.round(ly - lightS / 2);
      if (tx !== lastLx || ty !== lastLy) {
        lastLx = tx;
        lastLy = ty;
        light.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    }

    if (rect && rect.bottom > -200 && rect.top < vh + 200 && rect.width > 0) {
      // The window grows past the element by a margin, so the lit metal shows around its edges.
      const sx = (rect.width + 320) / HALO;
      const sy = (rect.height + 280) / HALO;
      const tx = rect.left + rect.width / 2 - (HALO / 2) * sx;
      const ty = rect.top + rect.height / 2 - (HALO / 2) * sy;
      halo.style.transform = `translate3d(${px(tx)}, ${px(ty)}, 0) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
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

  const onScroll = () => {
    lastScroll = performance.now();
    schedule();
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX;
    my = e.clientY;
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
  // A hidden tab: nothing is drawn, and a frame queued now waits for the tab to come back.
  const onVisibility = () => {
    const hidden = document.visibilityState === 'hidden';
    root.toggleAttribute('data-paused', hidden);
    if (hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!hidden) schedule();
  };

  const opts = { passive: true } as const;
  window.addEventListener('scroll', onScroll, opts);
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
    window.removeEventListener('scroll', onScroll);
    clearTimeout(settle);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onLeaveWindow);
    for (const a of ['data-light', 'data-focus', 'data-paused', 'data-tone']) root.removeAttribute(a);
    for (const el of [plate, light, halo]) el.style.transform = '';
  };
}
