import type { ReactNode } from 'react';
import type { CastId } from '../../cast';
import { InstagramGlyph, YouTubeGlyph } from '../../components/frames';
import { Reveal } from '../../components/ui';
import { PLATFORMS } from '../../lib/content';

// The platform strip (content §2.7): Home #services and Why vox pop's "Made for every feed".

// Small glyphs for the five feeds: drawn marks, not the platforms' logos, at the size of the footer's social icons.
const FacebookGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden focusable="false">
    <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
  </svg>
);
const SpotlightGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden focusable="false">
    <path d="M12 2.8c3.3 0 5.6 2.5 5.6 5.7v2.1l1.6-.5c.5-.1.9.4.6.8-.4.6-1.2 1-2 1.3.5 1.7 1.9 3 3.4 3.5.4.2.4.7 0 .9-.8.4-1.7.5-2.4.7-.2.6-.3 1.2-.9 1.1-.8-.1-1.6-.2-2.4.1-.9.4-1.7 1.6-3.5 1.6s-2.6-1.2-3.5-1.6c-.8-.3-1.6-.2-2.4-.1-.6.1-.7-.5-.9-1.1-.7-.2-1.6-.3-2.4-.7-.4-.2-.4-.7 0-.9 1.5-.5 2.9-1.8 3.4-3.5-.8-.3-1.6-.7-2-1.3-.3-.4.1-.9.6-.8l1.6.5V8.5c0-3.2 2.3-5.7 5.6-5.7Z" />
  </svg>
);
const TikTokGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden focusable="false">
    <path d="M12.74 2h3.1c.17 1.6.74 2.74 1.74 3.57.82.68 1.86 1.12 3.2 1.24v3.13a8.5 8.5 0 0 1-4.78-1.47l-.03 6.84a6.4 6.4 0 0 1-1.92 4.73A6.5 6.5 0 0 1 9.32 22a6.38 6.38 0 0 1-4.64-1.97A6.47 6.47 0 0 1 2.9 15.2c.13-1.66.86-3.2 2.1-4.33A6.34 6.34 0 0 1 9.4 9.2c.5 0 .98.05 1.44.16l-.02 3.17a3.4 3.4 0 0 0-1.42-.3 3.3 3.3 0 0 0-3.32 3.1c-.06.96.26 1.84.9 2.5.62.65 1.46 1 2.36 1 .9.01 1.74-.34 2.37-.97.62-.62.97-1.46.97-2.36L12.74 2Z" />
  </svg>
);

const GLYPHS: Record<string, (p: { className?: string }) => ReactNode> = {
  'Instagram Reels': InstagramGlyph,
  'YouTube Shorts': YouTubeGlyph,
  'Facebook Reels': FacebookGlyph,
  'Snapchat Spotlight': SpotlightGlyph,
  TikTok: TikTokGlyph,
};
const TINTS: CastId[] = ['tiko', 'gola', 'bolu', 'sochu', 'tiko'];

/** The five feeds, each on a plate with its glyph, which pops on hover (the footer's dock pop). Shared with Why vox pop. */
export function PlatformStrip({ className }: { className?: string }) {
  return (
    <ul className={`platforms ${className ?? ''}`}>
      {PLATFORMS.map((p, i) => {
        const Glyph = GLYPHS[p.name];
        return (
          <Reveal as="li" key={p.name} i={i} className="platform">
            <span className="platform-glyph" data-who={TINTS[i]} aria-hidden>
              {Glyph && <Glyph className="size-5" />}
            </span>
            <h4 className="label">{p.name}</h4>
            <p>{p.body}</p>
          </Reveal>
        );
      })}
    </ul>
  );
}
