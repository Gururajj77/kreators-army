import { useEffect, useLayoutEffect, useRef } from 'react';
import plateDarkAvif from '../../assets/field/plate-dark.avif';
import plateDarkWebp from '../../assets/field/plate-dark.webp';
import plateLightAvif from '../../assets/field/plate-light.avif';
import plateLightWebp from '../../assets/field/plate-light.webp';
import { finePointer, saveData, useMotionOk } from '../../lib/motionOk';
import { startField } from './field';

// One continuous background behind every public page: a fixed, full-viewport field mounted once in the app shell, under the nav, the page and the
// footer. Round 4: a plate of very dark forged metal (scripts/backdrop-art.mjs) that slides slowly as the page scrolls, its tint moving from navy
// through oxblood to green. A fine pointer carries a light across the metal (on touch it drifts with the scroll), and a hovered or keyboard-focused
// card, frame, CTA or control brightens the metal around it while the rest calms. Styles: styles/backdrop.css. Under still or reduced motion the
// plate stands still: no listeners. Decoration only: aria-hidden, never focusable, never takes the pointer.

/** After the page has loaded and gone idle: the art never competes with the hero for bandwidth or the main thread. */
function whenIdle(fn: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const go = () => {
    const ric = window.requestIdleCallback;
    if (ric) idle = ric(fn, { timeout: 2500 });
    else timer = window.setTimeout(fn, 400);
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
  return () => {
    window.removeEventListener('load', go);
    if (idle) window.cancelIdleCallback?.(idle);
    clearTimeout(timer);
  };
}

export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOk();

  // The body gives up its own colour while the field is mounted (it would cover a z-index -1 layer). Before paint, so nothing flashes.
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-field', '');
    return () => html.removeAttribute('data-field');
  }, []);

  // The metal itself. The current theme's plate is fetched once and decoded, then shown from that same copy (a blob: address, which the CSP allows
  // for images), so it fades in whole and is never requested twice. AVIF first (the smaller file at this detail); a browser that cannot decode it
  // gets the WebP. The other theme's plate is only an address, in the format that worked: CSS fetches it if the visitor switches. Save-Data keeps
  // the plain gradient.
  useEffect(() => {
    const el = ref.current;
    if (!el || saveData()) return;
    let live = true;
    let blobUrl = '';
    const load = async (url: string): Promise<string> => {
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      const own = URL.createObjectURL(blob);
      const img = new Image();
      img.src = own;
      try {
        await img.decode();
      } catch (e) {
        URL.revokeObjectURL(own);
        throw e;
      }
      return own;
    };
    const stop = whenIdle(() => {
      const dark = document.documentElement.dataset.theme === 'dark';
      const show = (own: string, avif: boolean) => {
        if (!live) return;
        const other = dark ? (avif ? plateLightAvif : plateLightWebp) : avif ? plateDarkAvif : plateDarkWebp;
        el.style.setProperty('--plate-dark', `url("${dark ? own : other}")`);
        el.style.setProperty('--plate-light', `url("${dark ? other : own}")`);
        el.setAttribute('data-art', '');
      };
      const [avif, webp] = dark ? [plateDarkAvif, plateDarkWebp] : [plateLightAvif, plateLightWebp];
      load(avif)
        .then((own) => [own, true] as const)
        .catch(() => load(webp).then((own) => [own, false] as const))
        .then(([own, isAvif]) => {
          if (!live) return URL.revokeObjectURL(own);
          blobUrl = own;
          show(own, isAvif);
        })
        .catch(() => show(webp, false));
    });
    return () => {
      live = false;
      stop();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!ok || !el) return;
    return startField(el, { fine: finePointer() });
  }, [ok]);

  return (
    <div ref={ref} className="bd" aria-hidden="true">
      <div className="bd-plate" />
      <div className="bd-light" />
      <div className="bd-veil" />
      <div className="bd-halo" />
    </div>
  );
}
