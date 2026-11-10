import { useEffect, useLayoutEffect, useRef } from 'react';
import { finePointer, useMotionOk } from '../../lib/motionOk';
import { startField } from './field';

// One continuous background behind every public page (round 3): a fixed, full-viewport field mounted once in the app shell, under the nav, the page
// and the footer. Slow gradient light drifts in it and its palette shifts with scroll progress, so sections sit on one surface with no band edges.
// A soft light follows a fine pointer (on touch it drifts with the scroll), and a hovered or keyboard-focused card, frame, CTA or control is lit from
// behind while the rest of the field calms. Styles: styles/backdrop.css. Under still or reduced motion the field is a still gradient: no listeners.
// Decoration only: aria-hidden, never focusable, never takes the pointer.

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
      <div className="bd-blob" data-b="1" />
      <div className="bd-blob" data-b="2" />
      <div className="bd-blob" data-b="3" />
      <div className="bd-blob" data-b="4" />
      <div className="bd-light" />
      <div className="bd-veil" />
      <div className="bd-halo" />
    </div>
  );
}
