import { onPointer } from '../../cast';
import { finePointer, motionOk } from '../../lib/motionOk';
import { spring } from '../../lib/spring';

// The full street's motion (visual §1.3, motion M4), loaded with the full drawing (art-full re-exports it), never for the footer's skyline.
// It answers the pointer three ways, transform and opacity only: four layers drift on spring.drift, a warm glow follows the pointer, and the shop
// nearest the pointer rolls up its shutter. The pointer comes from the site's one listener (cast/stage). Everything stops off screen, in hidden tabs,
// once the springs settle after the pointer stops, and under still. Phones and touch get a still picture.

const W = 2400;
const H = 400;
const OVERSCAN = 24;
const WAKE_UNITS = 130;

/** Depth: pointer range in px and scroll lag, per layer (visual §1.3). */
const LAYERS = [
  { cls: 'street-celestial', rx: 6, ry: 3, lag: 0.15 },
  { cls: 'street-far', rx: 4, ry: 2, lag: 0.3 },
  { cls: 'street-mid', rx: 10, ry: 4, lag: 0.5 },
  { cls: 'street-near', rx: 18, ry: 6, lag: 0.8 },
] as const;

export interface Live {
  stop: () => void;
}

/** Pointer depth, glow, wake and scroll lag for one mounted scene. Returns the teardown. */
export function animate(el: HTMLElement, { wake }: { wake: boolean }): Live {
  const layers = LAYERS.map((l) => ({ ...l, node: el.querySelector<HTMLElement | SVGElement>(`.${l.cls}`) })).filter((l) => l.node);
  const glow = el.querySelector<HTMLElement>('.street-glow');
  const shops = [...el.querySelectorAll<SVGGElement>('.street-mid .s-shop')];
  const host = (el.closest('.street-host')?.parentElement ?? el) as HTMLElement;
  const K = spring.drift.stiffness / spring.drift.mass;
  const C = spring.drift.damping / spring.drift.mass;
  const st = { tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0, gtx: 0, gty: 0, gx: 0, gy: 0, gvx: 0, gvy: 0, scroll: 0, on: false, raf: 0, last: 0, placed: false };
  let awake: SVGGElement | null = null;
  let waitTimer = 0;
  let offPointer: (() => void) | null = null;

  const allowed = () => motionOk() && finePointer() && st.on && document.visibilityState !== 'hidden';

  const write = () => {
    for (const l of layers) l.node!.style.transform = `translate3d(${(st.x * l.rx).toFixed(2)}px, ${(st.y * l.ry + st.scroll * (1 - l.lag) * 0.3).toFixed(2)}px, 0)`;
    if (glow) glow.style.transform = `translate3d(${st.gx.toFixed(1)}px, ${st.gy.toFixed(1)}px, 0)`;
  };

  const frame = (t: number) => {
    st.raf = 0;
    const dt = Math.min(0.032, (t - (st.last || t)) / 1000) || 0.016;
    st.last = t;
    // Two drift springs, semi-implicit Euler: the scene's depth and the glow.
    st.vx += (K * (st.tx - st.x) - C * st.vx) * dt;
    st.vy += (K * (st.ty - st.y) - C * st.vy) * dt;
    st.x += st.vx * dt;
    st.y += st.vy * dt;
    st.gvx += (K * (st.gtx - st.gx) - C * st.gvx) * dt;
    st.gvy += (K * (st.gty - st.gy) - C * st.gvy) * dt;
    st.gx += st.gvx * dt;
    st.gy += st.gvy * dt;
    write();
    const moving = Math.abs(st.vx) + Math.abs(st.vy) + Math.abs(st.gvx) / 200 + Math.abs(st.gvy) / 200 > 0.002 || Math.abs(st.tx - st.x) + Math.abs(st.ty - st.y) > 0.001;
    if (moving && allowed()) st.raf = requestAnimationFrame(frame);
    else {
      st.last = 0;
      el.removeAttribute('data-live');
    }
  };

  const kick = () => {
    if (!allowed() || st.raf) return;
    el.setAttribute('data-live', '');
    st.raf = requestAnimationFrame(frame);
  };

  const setAwake = (shop: SVGGElement | null) => {
    if (awake === shop) return;
    awake?.removeAttribute('data-awake');
    awake = shop;
    shop?.setAttribute('data-awake', '');
  };

  const move = (x: number, y: number, e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !allowed()) return;
    const hb = host.getBoundingClientRect();
    const inside = y >= hb.top && y <= hb.bottom && x >= hb.left && x <= hb.right;
    st.tx = (x / window.innerWidth) * 2 - 1;
    st.ty = (y / window.innerHeight) * 2 - 1;
    const r = el.getBoundingClientRect();
    st.gtx = x - r.left;
    st.gty = y - r.top;
    if (!st.placed) {
      st.gx = st.gtx;
      st.gy = st.gty;
      st.placed = true;
    }
    el.toggleAttribute('data-pointer', inside);
    window.clearTimeout(waitTimer);
    if (wake && shops.length) {
      if (inside && y >= r.top) {
        // The pointer's x in scene units: the mid layer is an xMidYMax slice of the 2,400-unit drawing, overscanned 24 px a side and shifted by
        // its own drift and any breakpoint offset (the `translate` property).
        const scale = Math.max((r.width + 2 * OVERSCAN) / W, r.height / H);
        const mid = el.querySelector<SVGElement>('.street-mid');
        const shift = mid ? parseFloat(getComputedStyle(mid).translate) || 0 : 0;
        const sx = (x - r.left + OVERSCAN - st.x * 10 - shift - (r.width + 2 * OVERSCAN - W * scale) / 2) / scale;
        let best: SVGGElement | null = null;
        let bd = Infinity;
        for (const s of shops) {
          const d = Math.abs(Number(s.dataset.cx) - sx);
          if (d < bd) {
            bd = d;
            best = s;
          }
        }
        waitTimer = window.setTimeout(() => setAwake(bd < WAKE_UNITS ? best : null), 120);
      } else {
        waitTimer = window.setTimeout(() => setAwake(null), 200);
      }
    }
    kick();
  };

  const onScroll = () => {
    if (!allowed()) return;
    st.scroll = Math.max(0, -host.getBoundingClientRect().top);
    kick();
  };

  const settle = () => {
    // Still, touch or off screen: a still picture.
    window.cancelAnimationFrame(st.raf);
    st.raf = 0;
    st.last = 0;
    Object.assign(st, { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, scroll: 0, gvx: 0, gvy: 0 });
    for (const l of layers) l.node!.style.transform = '';
    el.removeAttribute('data-live');
    el.removeAttribute('data-pointer');
    setAwake(null);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      st.on = Boolean(entry?.isIntersecting);
      if (st.on && motionOk() && finePointer()) {
        offPointer ??= onPointer(move);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        offPointer?.();
        offPointer = null;
        window.removeEventListener('scroll', onScroll);
        if (!st.on) {
          window.cancelAnimationFrame(st.raf);
          st.raf = 0;
          el.removeAttribute('data-live');
        }
      }
    },
    { rootMargin: '80px' },
  );
  io.observe(el);

  const onVisible = () => {
    if (document.visibilityState === 'hidden') {
      window.cancelAnimationFrame(st.raf);
      st.raf = 0;
      el.removeAttribute('data-live');
    }
  };
  document.addEventListener('visibilitychange', onVisible);

  const mo = new MutationObserver(() => {
    if (!motionOk()) settle();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-still'] });

  return {
    stop: () => {
      io.disconnect();
      mo.disconnect();
      offPointer?.();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearTimeout(waitTimer);
      window.cancelAnimationFrame(st.raf);
    },
  };
}

