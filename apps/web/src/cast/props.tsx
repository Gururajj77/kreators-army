import type { CastId } from '../lib/content';

// The four job props and the parcel, drawn in the stage's coordinates. Each sits inside one group the director can move, and the moving parts carry a data-part name.
// A prop is held by a single floating mitt in the body's colour: no arms, so the silhouette stays the logo's.

export type PropKind = 'mic' | 'camera' | 'clapper' | 'clipboard' | 'parcel';

export const PROP_OF: Record<CastId, PropKind> = { bolu: 'mic', tiko: 'camera', gola: 'clapper', sochu: 'clipboard' };

/** Where a prop pivots when it pops in, waves or lifts: the mitt, or the base of the camera. */
export const PROP_PIVOT: Record<PropKind, [number, number]> = {
  mic: [382, 354],
  camera: [240, 136],
  clapper: [342, 386],
  clipboard: [354, 382],
  parcel: [372, 382],
};

/** A free mitt for waving, used when no prop is in hand: where it rests and where its wrist pivots. */
export const HAND: Record<CastId, { x: number; y: number; px: number; py: number }> = {
  bolu: { x: 402, y: 246, px: 372, py: 292 },
  tiko: { x: 366, y: 232, px: 338, py: 284 },
  gola: { x: 410, y: 234, px: 378, py: 282 },
  sochu: { x: 408, y: 226, px: 374, py: 274 },
};

const mittStops: Record<CastId, [string, string, string]> = {
  bolu: ['#b4f0a6', '#47c349', '#1c7f33'],
  tiko: ['#b9b4ff', '#6d61fe', '#3a2bc4'],
  gola: ['#ffd9a8', '#ff8d3a', '#c44e14'],
  sochu: ['#fff3b0', '#fbd43f', '#d98e12'],
};

const mittGradient = (who: CastId) => {
  const [a, b, c] = mittStops[who];
  return `<radialGradient id="k-mitt-${who}" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
};

const lidStops: Record<CastId, [string, string]> = {
  bolu: ['#74dd6e', '#37ae3f'],
  tiko: ['#8e84ff', '#5a4cf0'],
  gola: ['#ffae66', '#f47424'],
  sochu: ['#ffe376', '#f5bf2a'],
};

const lidGradient = (who: CastId) => {
  const [a, b] = lidStops[who];
  return `<linearGradient id="k-lid-${who}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
};

export const PROP_DEFS = [
  ...(['bolu', 'tiko', 'gola', 'sochu'] as CastId[]).flatMap((w) => [mittGradient(w), lidGradient(w)]),
  '<linearGradient id="k-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3843"/><stop offset="1" stop-color="#121016"/></linearGradient>',
  '<radialGradient id="k-foam" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#55525f"/><stop offset="1" stop-color="#17151c"/></radialGradient>',
  '<linearGradient id="k-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a4c"/><stop offset="1" stop-color="#c81616"/></linearGradient>',
  '<radialGradient id="k-glass" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#b9c3ff"/><stop offset=".45" stop-color="#3a3f7c"/><stop offset="1" stop-color="#0d0e1f"/></radialGradient>',
  '<linearGradient id="k-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#eae6dc"/></linearGradient>',
  '<linearGradient id="k-board" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b98a58"/><stop offset="1" stop-color="#7f5429"/></linearGradient>',
  '<linearGradient id="k-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5f4f8"/><stop offset="1" stop-color="#9c9aa8"/></linearGradient>',
].join('');

function Mitt({ who, x, y }: { who: CastId; x: number; y: number }) {
  return (
    <g>
      <circle cx={x - 19} cy={y - 9} r="9.5" fill={`url(#k-mitt-${who})`} />
      <circle cx={x} cy={y} r="24" fill={`url(#k-mitt-${who})`} />
    </g>
  );
}

function Mic({ who }: { who: CastId }) {
  return (
    <>
      <g transform="translate(396 318) rotate(24)">
        <rect x="-11" y="-30" width="22" height="118" rx="11" fill="url(#k-dark)" />
        <rect x="-37" y="-92" width="74" height="66" rx="15" fill="url(#k-red)" />
        <g transform="translate(0 -59) scale(.86)">
          <circle cx="-13" cy="-13" r="10" fill="#fbd43f" />
          <path d="M13-24L24-5H2Z" fill="#6d61fe" stroke="#6d61fe" strokeWidth="4" strokeLinejoin="round" />
          <rect x="-23" y="4" width="20" height="20" rx="4" fill="#47c349" />
          <circle cx="13" cy="14" r="10" fill="#ff8d3a" />
        </g>
        <circle cy="-124" r="40" fill="url(#k-foam)" />
        <ellipse cx="-13" cy="-140" rx="10" ry="7" fill="#fff" opacity=".16" transform="rotate(-30 -13 -140)" />
      </g>
      <Mitt who={who} x={382} y={354} />
    </>
  );
}

function Camera() {
  return (
    <g transform="translate(240 70)">
      <path d="M-16 44h32l14 16H-30Z" fill="#26242b" />
      <rect x="-62" y="-30" width="108" height="76" rx="16" fill="url(#k-dark)" />
      <rect x="44" y="-14" width="26" height="46" rx="8" fill="#17151c" />
      <circle cx="-2" cy="8" r="28" fill="#0f0e13" />
      <circle cx="-2" cy="8" r="21" fill="url(#k-glass)" />
      <circle cx="-11" cy="-1" r="5" fill="#fff" opacity=".78" />
      <circle cx="36" cy="-18" r="5" fill="#561e1b" />
      <circle data-part="tally-glow" cx="36" cy="-18" r="13" fill="#ff4b3e" opacity="0" />
      <circle data-part="tally" cx="36" cy="-18" r="5" fill="#ff5a4c" opacity="0" />
      <rect x="-30" y="-42" width="40" height="16" rx="6" fill="#26242b" />
      <g transform="translate(-40 -45)">
        <g fill="#55525f">
          <circle cx="-14" cy="0" r="12" />
          <circle cx="4" cy="-2" r="13" />
          <circle cx="23" cy="-2" r="13" />
          <circle cx="42" cy="-2" r="13" />
          <circle cx="58" cy="0" r="12" />
          <rect x="-24" y="-4" width="92" height="15" rx="7.5" />
        </g>
        <path d="M-20-4c6-8 12-8 18-3s12-8 20-3 12-6 20-1 12-6 22 0" fill="none" stroke="#7b7786" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Clapper({ who }: { who: CastId }) {
  const stripes = ['#fbd43f', '#6d61fe', '#47c349', '#ff8d3a'];
  return (
    <>
      <g transform="translate(404 322) rotate(-6)">
        <rect x="-64" y="-2" width="128" height="90" rx="11" fill="url(#k-dark)" />
        <path d="M-50 24h100M-50 46h60M-50 66h82" stroke="#f3f0ea" strokeWidth="5.5" strokeLinecap="round" opacity=".82" />
        <g data-part="arm" transform="rotate(-20 -64 -2)">
          <rect x="-64" y="-24" width="128" height="24" rx="6" fill="#121016" />
          {stripes.map((c, i) => (
            <path key={c} d={`M${-58 + i * 30}-22h18l-12 22h-18Z`} fill={c} />
          ))}
        </g>
      </g>
      <Mitt who={who} x={342} y={386} />
    </>
  );
}

function Clipboard({ who }: { who: CastId }) {
  return (
    <>
      <g transform="translate(392 318) rotate(9)">
        <rect x="-58" y="-74" width="116" height="150" rx="15" fill="url(#k-board)" />
        <rect x="-47" y="-58" width="94" height="124" rx="7" fill="url(#k-paper)" />
        <rect x="-24" y="-86" width="48" height="26" rx="8" fill="url(#k-metal)" />
        <path d="M-30-30l6 6 11-14" fill="none" stroke="#37ae3f" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2-29h28" stroke="#3b3843" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M-30 2l6 6 11-14" fill="none" stroke="#37ae3f" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 3h28" stroke="#3b3843" strokeWidth="5.5" strokeLinecap="round" />
        <circle data-part="todo" cx="-23" cy="38" r="7.5" fill="none" stroke="#3b3843" strokeWidth="5" />
        <path data-part="tick" d="M-31 37l6 6 11-14" fill="none" stroke="#37ae3f" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path d="M2 38h28" stroke="#3b3843" strokeWidth="5.5" strokeLinecap="round" opacity=".5" />
      </g>
      <Mitt who={who} x={354} y={382} />
    </>
  );
}

function Parcel({ who }: { who: CastId }) {
  return (
    <>
      <g transform="translate(404 330)">
        <rect x="-44" y="-40" width="88" height="74" rx="12" fill="url(#k-red)" />
        <rect x="-9" y="-40" width="18" height="74" fill="#ffc2b8" opacity=".9" />
        <path d="M-44-22h34M10-22h34" stroke="#ffffff" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
      </g>
      <Mitt who={who} x={368} y={382} />
    </>
  );
}

/** The art for one prop, inside the group the director moves. */
export function PropArt({ kind, who }: { kind: PropKind; who: CastId }) {
  return (
    <g data-part="prop">
      {kind === 'mic' && <Mic who={who} />}
      {kind === 'camera' && <Camera />}
      {kind === 'clapper' && <Clapper who={who} />}
      {kind === 'clipboard' && <Clipboard who={who} />}
      {kind === 'parcel' && <Parcel who={who} />}
    </g>
  );
}

/** The free mitt that pops in only to wave. */
export function HandArt({ who }: { who: CastId }) {
  const h = HAND[who];
  return (
    <g data-part="hand">
      <Mitt who={who} x={h.x} y={h.y} />
    </g>
  );
}
