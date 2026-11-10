import { VIGNETTES, type VignetteName } from './vignettes';

/**
 * One of the five small street scenes for How we work, chapter 3: 'passerby' (Natural, not a pitch), 'intro' (Clear about who's asking), 'gift' (A
 * reason to stop), 'branch' (Room to follow a good moment), 'framing' (Professional, and varied). A 320 x 200 picture that fills its box (slice);
 * aria-hidden, since the tile's heading says it. Day and night follow the theme through the street's tokens. This module is small: the How we work
 * chunk never loads the whole street.
 */
export function Vignette({ name, className }: { name: VignetteName; className?: string }) {
  return (
    <span
      className={className ? `street-vignette-box ${className}` : 'street-vignette-box'}
      aria-hidden="true"
      // Static markup generated at build time by scripts/street-art.mjs; no visitor or admin text ever reaches it (V2-SPEC 8.4).
      dangerouslySetInnerHTML={{ __html: VIGNETTES[name] }}
    />
  );
}

export type { VignetteName };
