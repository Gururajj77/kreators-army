import type { ReactNode } from 'react';
import type { Mechanism } from '../../lib/content';

// The eleven mechanism demos (visual §1.5): one tiny 40-unit drawing each. Each plays once, 1.2 to 1.6 s, when its host carries [data-play], with
// transform and opacity only (demos.css). The end frame is the rest frame, so a still page, a chip that never played and a card that did all look
// alike. Strokes are currentColor (ink in both themes); `.d-tone` takes the card's tone. aria-hidden: the mechanism's name is the text.

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ART: Record<Mechanism, ReactNode> = {
  'Guessing and reveals': (
    <g className="d-flip">
      <rect className="d-tone" x="10" y="6" width="20" height="28" rx="4" />
      <rect x="10" y="6" width="20" height="28" rx="4" {...S} />
      <text className="d-flip-q" x="20" y="25" textAnchor="middle">
        ?
      </text>
      <text className="d-flip-a" x="20" y="25" textAnchor="middle">
        !
      </text>
    </g>
  ),
  'A/B comparisons': (
    <g>
      <rect x="4" y="12" width="32" height="16" rx="8" {...S} />
      <rect className="d-tone d-ab-thumb" x="6" y="14" width="14" height="12" rx="6" />
      <text className="d-ab-txt" x="13" y="23.9" textAnchor="middle">
        A
      </text>
      <text className="d-ab-txt" x="27" y="23.9" textAnchor="middle">
        B
      </text>
    </g>
  ),
  Challenges: (
    <g>
      <g className="d-watch">
        <circle className="d-tone" cx="20" cy="22" r="12" />
        <circle cx="20" cy="22" r="12" {...S} />
        <path d="M17 6.5h6M20 6.5v3.5" {...S} />
      </g>
      <path className="d-hand" d="M20 22V14" {...S} />
      <circle cx="20" cy="22" r="1.8" fill="currentColor" />
    </g>
  ),
  Rankings: (
    <g>
      <g className="d-rank d-rank-1">
        <rect className="d-tone" x="6" y="7" width="28" height="7" rx="3.5" />
        <circle cx="10.5" cy="10.5" r="1.6" fill="currentColor" />
      </g>
      <g className="d-rank d-rank-2">
        <rect x="6" y="17" width="22" height="7" rx="3.5" {...S} strokeWidth={2} />
      </g>
      <g className="d-rank d-rank-3">
        <rect x="6" y="27" width="15" height="7" rx="3.5" {...S} strokeWidth={2} />
      </g>
    </g>
  ),
  'Debates and opposing opinions': (
    <g>
      <g className="d-say d-say-l">
        <path className="d-tone" d="M5 9h15a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-9l-4 4v-4h-2a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z" />
      </g>
      <g className="d-say d-say-r">
        <path d="M35 17H22a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h7l4 4v-4h2a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3z" {...S} strokeWidth={2} />
      </g>
    </g>
  ),
  'Personal experiences': (
    <g>
      <path d="M8 7h24a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H18l-6 6v-6H8a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4z" {...S} strokeWidth={2} />
      <path className="d-tone d-heart" d="M20 24.5s-6-3.6-6-7.6a3.2 3.2 0 0 1 6-1.6 3.2 3.2 0 0 1 6 1.6c0 4-6 7.6-6 7.6z" />
    </g>
  ),
  'Product reactions': (
    <g>
      <rect className="d-tone" x="9" y="20" width="22" height="14" rx="2" />
      <rect x="9" y="20" width="22" height="14" rx="2" {...S} strokeWidth={2} />
      <g className="d-lid">
        <rect x="7" y="15" width="26" height="6" rx="2" {...S} strokeWidth={2} />
      </g>
      <path className="d-spark" d="M30 4l1.4 3.2L34.6 8.6l-3.2 1.4L30 13.2l-1.4-3.2L25.4 8.6l3.2-1.4z" fill="currentColor" />
    </g>
  ),
  'Humour and playful interactions': (
    <g className="d-smile">
      <circle className="d-tone" cx="20" cy="20" r="14" />
      <circle cx="20" cy="20" r="14" {...S} strokeWidth={2} />
      <circle cx="15.5" cy="17" r="1.8" fill="currentColor" />
      <circle cx="24.5" cy="17" r="1.8" fill="currentColor" />
      <path d="M14 23c3.5 4 8.5 4 12 0" {...S} strokeWidth={2} />
    </g>
  ),
  'Unexpected questions': (
    <g>
      <circle className="d-tone" cx="20" cy="22" r="13" />
      <text className="d-jump-q" x="20" y="28" textAnchor="middle">
        ?
      </text>
      <text className="d-jump-a" x="20" y="28" textAnchor="middle">
        !
      </text>
    </g>
  ),
  'Audience participation': (
    <g>
      <path d="M4 34h32" {...S} strokeWidth={2} />
      {[10, 20, 30].map((x, i) => (
        <g key={x} className={`d-hand-up d-hand-up-${i}`}>
          <circle className={i === 1 ? 'd-tone' : undefined} cx={x} cy="14" r="4" fill={i === 1 ? undefined : 'currentColor'} />
          <path d={`M${x} 19v10`} {...S} />
        </g>
      ))}
    </g>
  ),
  'Different follow-up structures': (
    <g>
      <path className="d-seg d-seg-0" d="M5 20h13" {...S} />
      <g transform="rotate(-32 18 20)">
        <path className="d-seg d-seg-1" d="M18 20h17" {...S} />
      </g>
      <g transform="rotate(32 18 20)">
        <path className="d-seg d-seg-2" d="M18 20h17" {...S} />
      </g>
      <circle className="d-tone" cx="18" cy="20" r="3.4" />
      <circle className="d-seg-end d-seg-end-1" cx="32.5" cy="11" r="2.6" fill="currentColor" />
      <circle className="d-seg-end d-seg-end-2" cx="32.5" cy="29" r="2.6" fill="currentColor" />
    </g>
  ),
};

/** The drawing for one mechanism, in a 40-unit box. Plays when an ancestor has [data-play]. */
export function MechanismArt({ name, className }: { name: Mechanism; className?: string }) {
  return (
    <svg className={className ? `mech-art ${className}` : 'mech-art'} viewBox="0 0 40 40" aria-hidden focusable="false" data-mech={name}>
      {ART[name]}
    </svg>
  );
}
