// The post covers (G1: one hue each, art made only from the idea of a post, no characters) and the title's gradient word. Moved here from
// site/pages/Reading.tsx, which re-exports them, so the build's prerender can draw them without the site's browser-only modules.

import type { BlogCategory } from '../types';

/**
 * A title with its last word as the page's one gradient word (G3). Posts have no word marked, and every public page carries exactly one, so a post
 * takes the last word of its title. The words themselves are unchanged.
 */
export function GradientTail({ text }: { text: string }) {
  const m = /^(.*\s)?(\S+?)([?.!,:]*)$/.exec(text);
  if (!m) return <>{text}</>;
  const [, head = '', word = '', tail = ''] = m;
  return (
    <>
      {head}
      <span className="g-word">{word}</span>
      {tail}
    </>
  );
}

/** Voice of the people: a microphone and the sound coming off it. */
function Rings() {
  return (
    <g fill="#fff">
      {[390, 300, 214, 132].map((r) => (
        <circle key={r} cx="430" cy="226" r={r} opacity=".1" />
      ))}
      <rect x="412" y="250" width="36" height="300" rx="18" opacity=".92" />
      <circle cx="430" cy="226" r="74" />
    </g>
  );
}

/** Six parts of an interaction, setup to edit, climbing. */
function Stairs() {
  return (
    <g fill="#fff">
      {[0.2, 0.26, 0.32, 0.4, 0.5, 0.94].map((opacity, i) => {
        const h = 84 + i * 50;
        return <rect key={i} x={78 + i * 82} y={440 - h} width="64" height={h + 80} rx="18" opacity={opacity} />;
      })}
    </g>
  );
}

/** Five feeds: one shoot, cut for every phone. */
function Phones() {
  const fan = [
    [-27, 0.24],
    [-13.5, 0.36],
    [13.5, 0.36],
    [27, 0.24],
    [0, 0.94],
  ] as const;
  return (
    <g fill="#fff">
      {fan.map(([angle, opacity]) => (
        <rect key={angle} x="257" y="120" width="126" height="224" rx="26" opacity={opacity} transform={`rotate(${angle} 320 880)`} />
      ))}
    </g>
  );
}

/** The brief: six lines on a sheet, the ones already decided ticked. */
function Sheet() {
  const rows = [0, 1, 2, 3, 4, 5];
  return (
    <g fill="#fff" transform="translate(0 22)">
      <rect x="196" y="64" width="248" height="352" rx="30" opacity=".3" />
      <rect x="214" y="82" width="212" height="316" rx="22" opacity=".94" />
      <rect x="276" y="48" width="88" height="42" rx="21" opacity=".94" />
      {rows.map((i) => (
        <g key={i} opacity={i < 3 ? 1 : 0.55}>
          <circle
            cx="252"
            cy={132 + i * 46}
            r="12"
            fill={i < 3 ? 'var(--cover-ink)' : 'none'}
            stroke="var(--cover-ink)"
            strokeWidth="4"
            opacity={i < 3 ? 0.9 : 0.3}
          />
          <rect x="278" y={124 + i * 46} width={i % 2 ? 104 : 128} height="16" rx="8" fill="var(--cover-ink)" opacity=".22" />
        </g>
      ))}
    </g>
  );
}

/** Eleven ways in: one shape each, no two alike in size or weight. */
function Eleven() {
  const dots: [number, number, number, number][] = [
    [150, 140, 46, 0.94],
    [262, 118, 30, 0.4],
    [356, 150, 56, 0.6],
    [478, 128, 38, 0.3],
    [120, 270, 30, 0.34],
    [222, 250, 54, 0.7],
    [340, 282, 34, 0.92],
    [452, 256, 60, 0.46],
    [168, 380, 40, 0.5],
    [298, 384, 48, 0.3],
    [424, 384, 32, 0.8],
  ];
  return (
    <g fill="#fff">
      {dots.map(([cx, cy, r, opacity], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} opacity={opacity} />
      ))}
    </g>
  );
}

const ARTS = { Rings, Stairs, Phones, Sheet, Eleven } as const;
type ArtName = keyof typeof ARTS;
type Tone = 'tiko' | 'gola' | 'bolu' | 'sochu';

/** Each cluster keeps one hue, so the index reads by cluster; the five v1 slugs keep the art they launched with. */
const CLUSTER_TONE: Record<BlogCategory, Tone> = { Understand: 'tiko', Plan: 'sochu', Shoot: 'gola', 'Edit and publish': 'bolu' };
const SLUG_ART: Record<string, ArtName> = {
  'what-is-vox-pop-content': 'Rings',
  'how-a-vox-pop-shoot-works': 'Stairs',
  'where-to-post-vox-pop-videos': 'Phones',
  'what-goes-in-a-vox-pop-brief': 'Sheet',
  'eleven-ways-to-vary-a-vox-pop-batch': 'Eleven',
};
const ART_ORDER: ArtName[] = ['Rings', 'Stairs', 'Phones', 'Sheet', 'Eleven'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function Cover({ tone, art, className }: { tone: Tone; art: ArtName; className?: string }) {
  const Art = ARTS[art];
  return (
    <div className={`post-cover ${className ?? ''}`} data-tone={tone} aria-hidden>
      <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" focusable="false">
        <Art />
      </svg>
    </div>
  );
}

/** A post's cover: its cluster's hue, and its own art (a v1 slug's original, else one picked from the slug). */
export function PostCover({ slug, category, className }: { slug: string; category: BlogCategory; className?: string }) {
  const art = SLUG_ART[slug] ?? ART_ORDER[hash(slug) % ART_ORDER.length] ?? 'Rings';
  return <Cover tone={CLUSTER_TONE[category] ?? 'tiko'} art={art} className={className} />;
}
