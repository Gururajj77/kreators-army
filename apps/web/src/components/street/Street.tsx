import { useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { STREET_SCENE } from '../../lib/content';
import type { StreetArtProps, StreetTime, StreetVariant } from './StreetScene';

// The street's light half, in the first download (visual §1.3). It reserves the box (absolutely positioned, so the layout never shifts), renders the
// stage the cast and the deck stand on, and loads the art (./StreetScene, a lazy chunk) after the first paint and an idle moment. With
// STREET_SCENE null there is no art anywhere: the stage stays, on v1's .ground wash. The art is a quiet, still backdrop everywhere.

export interface StreetProps {
  /** 'hero' (Home), 'band' (/trial, /why-voxpop, 404), 'skyline' (the footer: the far layer only). */
  variant: StreetVariant;
  /** 'auto' follows the theme: day in light, night in dark. A .band-dark ancestor forces night (the 404 card, the footer). */
  time?: StreetTime;
  /** --street-h. Defaults in styles/cast.css (.street-host); the Home hero sets its own in styles/home.css. */
  height?: string;
  /** Skyline: the train crosses once each time this changes (the footer passes the path, so once per page view). */
  cue?: string;
  /**
   * The stage: things standing on the footpath. It fills the street's box; position children with `bottom: var(--floor-front)` (the front edge) or
   * `var(--floor-back)` (the back edge, where shopfronts stand). Characters and bubbles may rise above the box: the stage does not clip.
   */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

type Art = ComponentType<StreetArtProps>;
let art: Art | null = null;
let artLoad: Promise<Art> | null = null;
const loadArt = () => {
  artLoad ??= import('./StreetScene').then((m) => (art = m.StreetArt));
  return artLoad;
};

const whenIdle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(fn, 300);
  return () => clearTimeout(t);
};

/** The illustrated Bengaluru street behind a section. Put it inside a `position: relative; overflow: clip` section; it sits at the bottom, behind the content. */
export function Street({ variant, time = 'auto', height, cue, children, className, style }: StreetProps) {
  const [Art, setArt] = useState<Art | null>(() => art);

  useEffect(() => {
    if (Art || STREET_SCENE === null) return;
    let on = true;
    // After the first paint, then idle: the street never competes with the poster or the H1 for the first paint.
    let cancel = () => {};
    const raf = requestAnimationFrame(() => {
      cancel = whenIdle(() => {
        loadArt()
          .then((A) => on && setArt(() => A))
          .catch(() => {
            // A lost chunk leaves the wash and the stage; nothing depends on the art.
          });
      });
    });
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      cancel();
    };
  }, [Art]);

  return (
    <div
      className={className ? `street-host ${className}` : 'street-host'}
      data-variant={variant}
      data-street={STREET_SCENE ?? 'off'}
      style={{ ...(height ? { '--street-h': height } : null), ...style } as CSSProperties}
    >
      {STREET_SCENE !== null && (Art ? <Art variant={variant} time={time} cue={cue} /> : <div className="street" data-variant={variant} aria-hidden="true" />)}
      {children && <div className="street-stage">{children}</div>}
    </div>
  );
}
