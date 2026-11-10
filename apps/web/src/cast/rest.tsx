import { useId, type ReactNode } from 'react';
import type { CastId } from '../lib/content';

// The cast at rest, with no rig: geometry fitted to the logo and the static faces that paint before any cast JavaScript has loaded.
// Everything is in one 480 x 480 stage, where 1 unit is 1 pixel of the 1000 x 1000 logo. Every body stands on y = 400, centred on x = 240.

export type { CastId };

export const INK = '#16131b';
/** Sclera radius of a ball eye, in stage units. */
export const EYE_R = 18.15;
/** Pupil radius of a ball eye, in stage units. */
export const PUPIL_R = 9.75;

export const BODY_COLOR: Record<CastId, string> = { bolu: '#47c349', tiko: '#6d61fe', gola: '#ff8d3a', sochu: '#fbd43f' };

export const BODY_PATH: Record<CastId, string> = {
  sochu: 'M240 142.79A83.35 83.35 0 1 1 361.69 256.31A83.35 83.35 0 1 1 240 369.82A83.35 83.35 0 1 1 118.31 256.31A83.35 83.35 0 1 1 240 142.79Z',
  tiko: 'M271.14 136.42L391.3 346.29A35.88 35.88 0 0 1 360.16 400L119.84 400A35.88 35.88 0 0 1 88.7 346.29L208.86 136.42A35.88 35.88 0 0 1 271.14 136.42Z',
  bolu: 'M135.58 130.43H344.42A30.37 30.37 0 0 1 374.79 160.8V369.63A30.37 30.37 0 0 1 344.42 400H135.58A30.37 30.37 0 0 1 105.21 369.63V160.8A30.37 30.37 0 0 1 135.58 130.43Z',
  gola: 'M240 112.51A143.74 143.74 0 1 1 240 400A143.74 143.74 0 1 1 240 112.51Z',
};

/** A line eye: two cubics as 16 numbers. A one-stroke eye draws the same cubic twice, so every line eye can tween to any other. */
export type LineEye = number[];

const one = (...cubic: number[]): LineEye => [...cubic, ...cubic];

/** Gola's wink as fitted, in its own coordinates around the eye centre (214, 231): an upper and a lower stroke meeting at a tip. */
export const WINK = {
  at: [214, 231],
  upper: [198.43, 220.77, 209.33, 220.07, 232.33, 227.87, 229.43, 230.67],
  lower: [198.53, 233.37, 213.93, 228.67, 228.13, 231.57, 229.43, 230.67],
  w: 7.17,
};

export interface RestEye {
  x: number;
  y: number;
  /** A closed or arched eye, drawn as a stroke. Without it the eye is a white ball with a pupil. */
  line?: LineEye;
  /** Stroke width of the line eye. */
  w?: number;
  /** The wink holds: it never blinks. */
  wink?: boolean;
}

export interface RestMouth {
  cx: number;
  y: number;
  hw: number;
  kt: number;
  kb: number;
  ref: number;
  w: number;
  /** Bolu's open D is small; every other expression of it uses these. */
  alt?: { hw: number; ref: number; w: number };
}

export const REST: Record<CastId, { eyes: [RestEye, RestEye]; mouth: RestMouth }> = {
  sochu: {
    eyes: [
      { x: 204.1, y: 231.5, line: one(218.64, 220.39, 224.34, 234.09, 195.24, 242.39, 189.14, 226.89), w: 8.2 },
      { x: 273.6, y: 231.5, line: one(258.74, 220.39, 253.04, 234.09, 282.14, 242.39, 288.24, 226.89), w: 8.2 },
    ],
    mouth: { cx: 238.54, y: 263.49, hw: 45.45, kt: 51.3, kb: 51.3, ref: 51.3, w: 11.08 },
  },
  tiko: {
    eyes: [
      { x: 220.3, y: 268.9 },
      { x: 266.99, y: 268.9 },
    ],
    mouth: { cx: 243.65, y: 294, hw: 66.55, kt: 52.9, kb: 52.9, ref: 52.9, w: 11.09 },
  },
  bolu: {
    eyes: [
      { x: 197.25, y: 246, line: one(177.1, 257.01, 177, 227.41, 217.1, 227.11, 217.4, 257.01), w: 8.31 },
      { x: 285.75, y: 246, line: one(265.6, 257.01, 265.7, 227.21, 305.8, 227.21, 305.9, 257.01), w: 8.31 },
    ],
    mouth: { cx: 240, y: 280.75, hw: 27.75, kt: 0, kb: 41.3, ref: 41.3, w: 5.5, alt: { hw: 38, ref: 44, w: 7.5 } },
  },
  gola: {
    eyes: [
      { x: 214, y: 231, line: [...WINK.upper, ...WINK.lower], w: WINK.w, wink: true },
      { x: 265.21, y: 231.07 },
    ],
    mouth: { cx: 241.78, y: 259.87, hw: 66.5, kt: 76.6, kb: 76.6, ref: 76.6, w: 12.39 },
  },
};

const fixed = (n: number) => (Math.round(n * 100) / 100).toString();

/** A line eye's two strokes as one path string. */
export const lineD = (a: LineEye) =>
  `M${fixed(a[0]!)} ${fixed(a[1]!)}C${fixed(a[2]!)} ${fixed(a[3]!)} ${fixed(a[4]!)} ${fixed(a[5]!)} ${fixed(a[6]!)} ${fixed(a[7]!)}` +
  `M${fixed(a[8]!)} ${fixed(a[9]!)}C${fixed(a[10]!)} ${fixed(a[11]!)} ${fixed(a[12]!)} ${fixed(a[13]!)} ${fixed(a[14]!)} ${fixed(a[15]!)}`;

/** The one mouth: a closed path with two lips, 12 numbers in the same order for every shape, so any mouth tweens to any other. */
export const mouthD = (m: number[]) =>
  `M${fixed(m[0]!)} ${fixed(m[1]!)}C${fixed(m[2]!)} ${fixed(m[3]!)} ${fixed(m[4]!)} ${fixed(m[5]!)} ${fixed(m[6]!)} ${fixed(m[7]!)}` +
  `C${fixed(m[8]!)} ${fixed(m[9]!)} ${fixed(m[10]!)} ${fixed(m[11]!)} ${fixed(m[0]!)} ${fixed(m[1]!)}Z`;

/** The two lips from a centre, half-width and lip depths, as the mouth numbers plus the stroke width at the end. */
export const lips = (cx: number, y: number, hw: number, kt: number, kb: number, w: number): number[] => {
  const a = cx - hw;
  const b = cx + hw;
  return [a, y, a, y + kt, b, y + kt, b, y, b, y + kb, a, y + kb, w];
};

export const restMouth = (who: CastId) => {
  const m = REST[who].mouth;
  return lips(m.cx, m.y, m.hw, m.kt, m.kb, m.w);
};

/** The soft white highlight that drifts against the pointer. It is painted in the rest pose too, so the rig's arrival changes no pixels. */
export const GLOSS: Record<CastId, { cx: number; cy: number; rx: number; ry: number; rot: number }> = {
  sochu: { cx: 176, cy: 162, rx: 26, ry: 16, rot: -34 },
  tiko: { cx: 212, cy: 176, rx: 13, ry: 22, rot: 30 },
  bolu: { cx: 158, cy: 168, rx: 28, ry: 16, rot: -28 },
  gola: { cx: 168, cy: 170, rx: 26, ry: 17, rot: -36 },
};

const uid = (raw: string) => `k${raw.replace(/[^a-zA-Z0-9]/g, '')}`;

/** The shared gradients. Live in a zero-size SVG: gradients inside `display: none` do not paint. Inserted once, outside the React tree. */
const CORE_DEFS =
  '<radialGradient id="k-sclera" cx=".42" cy=".34" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fbfaff"/><stop offset="1" stop-color="#d6d2e6"/></radialGradient>' +
  '<radialGradient id="k-gloss"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';

const inserted = new Set<string>();

export function insertDefs(name: string, markup: string) {
  if (inserted.has(name) || typeof document === 'undefined') return;
  inserted.add(name);
  const holder = document.createElement('div');
  holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${markup}</defs></svg>`;
  const svg = holder.firstElementChild;
  if (svg) document.body.appendChild(svg);
}

export const insertCoreDefs = () => insertDefs('core', CORE_DEFS);

function RestBall({ eye, clip }: { eye: RestEye; clip: string }) {
  return (
    <g transform={`translate(${eye.x} ${eye.y})`}>
      <circle r={EYE_R} fill="url(#k-sclera)" />
      <g clipPath={`url(#${clip})`}>
        <ellipse cy={-EYE_R * 0.92} rx={EYE_R * 1.1} ry={EYE_R * 0.55} fill="#3a3460" opacity=".14" />
        <circle r={PUPIL_R} className="k-if" />
        <circle cx="-3.1" cy="-3.5" r="3.1" fill="#fff" />
        <circle cx="3.3" cy="3.4" r="1.25" fill="#fff" opacity=".85" />
      </g>
    </g>
  );
}

/** A plain flat shape in the logo's fill, for the smallest sizes. */
export function FlatBody({ who }: { who: CastId }) {
  return (
    <svg className="k-body" viewBox="0 0 480 480" aria-hidden focusable="false">
      <path d={BODY_PATH[who]} fill={BODY_COLOR[who]} />
    </svg>
  );
}

/** The logo's face, as a single small inline SVG. No rig, no timers: this is what paints first, and stays if the rig never arrives. */
export function RestFace({ who, gloss = true }: { who: CastId; gloss?: boolean }) {
  const clip = uid(useId());
  const r = REST[who];
  const g = GLOSS[who];
  let body: ReactNode = null;
  if (gloss) {
    body = <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} transform={`rotate(${g.rot} ${g.cx} ${g.cy})`} fill="url(#k-gloss)" />;
  }
  return (
    <svg className="k-face" viewBox="0 0 480 480" aria-hidden focusable="false">
      <defs>
        <clipPath id={clip}>
          <circle r={EYE_R} />
        </clipPath>
      </defs>
      {body}
      {r.eyes.map((eye, i) =>
        eye.line ? (
          <path key={i} d={lineD(eye.line)} className="k-is" fill="none" strokeWidth={eye.w} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <RestBall key={i} eye={eye} clip={clip} />
        ),
      )}
      <path d={mouthD(restMouth(who))} className="k-if k-is" strokeWidth={r.mouth.w} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
