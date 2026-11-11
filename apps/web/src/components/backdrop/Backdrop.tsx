import { useEffect, useLayoutEffect, useRef } from 'react';
import { finePointer, useMotionOk } from '../../lib/motionOk';
import { startField } from './field';

// One continuous background behind every public page: a fixed, full-viewport field mounted once in the app shell, under the nav, the page and the
// footer. Round 7: fractal (reeded) glass, after kreators.app's closing card. A soft field of navy, oxblood and bottle green slides behind fixed,
// narrow upright flutes as the page scrolls, so the colour breaks into stripes that shimmer as it moves. A fine pointer carries a light behind the
// glass (on touch it drifts with the scroll), and a hovered or keyboard-focused card, frame, CTA or control is lit from behind while the rest calms.
// All CSS (styles/backdrop.css): no images to fetch. Under still or reduced motion the field stands still: no listeners. Decoration only:
// aria-hidden, never focusable, never takes the pointer.

export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOk();

  // The body gives up its own colour while the field is mounted (it would cover a z-index -1 layer). Before paint, so nothing flashes.
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-field', '');
    return () => html.removeAttribute('data-field');
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!ok || !el) return;
    return startField(el, { fine: finePointer() });
  }, [ok]);

  return (
    <div ref={ref} className="bd" aria-hidden="true">
      <div className="bd-plate" />
      <div className="bd-bloom" />
      <div className="bd-halo" />
      <div className="bd-ribs" />
      <div className="bd-shine" />
      <div className="bd-veil" />
    </div>
  );
}
