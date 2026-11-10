import { REST, WINK, lips, restMouth, type CastId, type LineEye } from './rest';

// Every expression is numbers on one rig. A pose holds the targets for the eyes, the mouth, the brows and the body lean, and the director springs toward them.

export const EXPRESSIONS = ['idle', 'happy', 'surprised', 'thinking', 'sleepy', 'wink', 'confused', 'celebrating', 'talking'] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** Used only by Sochu's signature: eyes open, smiling, nothing else moves. */
export type InternalExpression = Expression | 'open';

export const LEVELS = ['flat', 'small', 'full'] as const;
export type Lod = (typeof LEVELS)[number];

export interface EyePose {
  kind: 'ball' | 'line';
  /** Ball: size, pupil scale, lid (0 open, 1 shut), resting pupil offset. */
  s: number;
  pr: number;
  lid: number;
  px: number;
  py: number;
  /** Line: the stroke's numbers and its width. */
  line?: LineEye;
  w?: number;
  /** A wink holds through blinks. */
  wink?: boolean;
}

export interface BrowPose {
  on: 0 | 1;
  /** M x0 y0 Q qx qy x1 y1 */
  d: [number, number, number, number, number, number];
}

export interface Pose {
  eyes: [EyePose, EyePose];
  /** Mouth numbers plus stroke width. */
  mouth: number[];
  brows: [BrowPose, BrowPose];
  z: 0 | 1;
  /** Body lean in degrees and stretch from the feet. */
  rot: number;
  sx: number;
  sy: number;
}

const BALL: EyePose = { kind: 'ball', s: 1, pr: 1, lid: 0, px: 0, py: 0 };
const ball = (o: Partial<EyePose> = {}): EyePose => ({ ...BALL, ...o });
const stroke = (line: LineEye, w: number, wink?: boolean): EyePose => ({ ...BALL, kind: 'line', line, w, wink });

const arch = (cx: number, cy: number, hw: number, k: number): LineEye => {
  const c = [cx - hw, cy, cx - hw, cy + k, cx + hw, cy + k, cx + hw, cy];
  return [...c, ...c];
};

/** The logo's wink, moved to any eye. */
const wedge = (cx: number, cy: number): LineEye => {
  const dx = cx - WINK.at[0]!;
  const dy = cy - WINK.at[1]!;
  return [...WINK.upper, ...WINK.lower].map((v, i) => v + (i % 2 ? dy : dx));
};

/** Tiko's eyes sit low, just over the mouth, so its arched eyes rise to keep clear of a wide smile. */
const archY = (who: CastId, y: number) => y + (who === 'tiko' ? 1 : 11);

/** Straight edges exaggerate a tilt, so the square and the triangle lean less than the round pair. */
const leanOf: Record<CastId, number> = { bolu: 0.6, tiko: 0.7, gola: 1, sochu: 1 };

const restEyes = (who: CastId): [EyePose, EyePose] => {
  const [a, b] = REST[who].eyes;
  const of = (e: typeof a) => (e.line ? stroke(e.line, e.w!, e.wink) : ball());
  return [of(a), of(b)];
};

const NO_BROWS: [BrowPose, BrowPose] = [
  { on: 0, d: [0, 0, 0, 0, 0, 0] },
  { on: 0, d: [0, 0, 0, 0, 0, 0] },
];

const brow = (cx: number, cy: number, tilt = 0, arc = -6, hw = 17): BrowPose['d'] => [cx - hw, cy + tilt, cx, cy + arc, cx + hw, cy - tilt];

/** The mouth for depths given as multiples of this character's own reference depth. */
const mouthOf = (who: CastId, kt: number, kb: number, hw: number, dx = 0, dy = 0) => {
  const r = REST[who].mouth;
  const m = r.alt ? { ...r, ...r.alt } : r;
  return lips(m.cx + dx, m.y + m.ref * dy, m.hw * hw, m.ref * kt, m.ref * kb, m.w);
};

/** The wavy mouth is a line drawn twice, so its area is zero and the path keeps the shape every other mouth has. */
const wavy = (who: CastId, amount: number, hw: number) => {
  const r = REST[who].mouth;
  const m = r.alt ? { ...r, ...r.alt } : r;
  const k = m.ref * amount;
  const w = m.hw * hw;
  const left = m.cx - w;
  const right = m.cx + w;
  const c1x = m.cx - 0.4 * w;
  const c1y = m.y - 0.3 * k;
  const c2x = m.cx + 0.3 * w;
  const c2y = m.y + 0.9 * k;
  return [left, m.y + 0.55 * k, c1x, c1y, c2x, c2y, right, m.y + 0.2 * k, c2x, c2y, c1x, c1y, m.w];
};

/** One beat of the talking mouth, a cycle of three shapes. */
export const TALK_BEATS: [number, number][] = [
  [0.1, 0.85],
  [0.05, 0.45],
  [0.15, 1],
];
export const talkMouth = (who: CastId, beat: number) => {
  const [kt, kb] = TALK_BEATS[beat % TALK_BEATS.length] as [number, number];
  return mouthOf(who, kt, kb, 0.68);
};

/** The full set of targets for one expression. Smaller sizes lose the brows and the sleeping z. */
export function poseOf(who: CastId, name: InternalExpression, lod: Lod): Pose {
  const [L, R] = REST[who].eyes;
  const pose: Pose = { eyes: restEyes(who), mouth: restMouth(who), brows: NO_BROWS, z: 0, rot: 0, sx: 1, sy: 1 };
  switch (name) {
    case 'idle':
      break;
    case 'open':
      pose.eyes = [ball(), ball()];
      break;
    case 'happy':
      pose.eyes = [stroke(arch(L.x, archY(who, L.y), 20, -30), 8.3), stroke(arch(R.x, archY(who, R.y), 20, -30), 8.3)];
      pose.mouth = mouthOf(who, 0.3, 1.2, 1);
      pose.rot = 2;
      break;
    case 'surprised':
      pose.eyes = [ball({ s: 1.2, pr: 0.72 }), ball({ s: 1.2, pr: 0.72 })];
      pose.mouth = mouthOf(who, -0.42, 0.42, 0.27, 0, 0.28);
      pose.brows = [
        { on: 1, d: brow(L.x, L.y - 38) },
        { on: 1, d: brow(R.x, R.y - 38) },
      ];
      pose.sy = 1.06;
      pose.sx = 0.98;
      break;
    case 'thinking':
      pose.eyes = [ball({ px: 5, py: -6 }), ball({ px: 5, py: -6 })];
      pose.mouth = mouthOf(who, 0.14, 0.14, 0.46, 16);
      pose.brows = [
        { on: 0, d: brow(L.x, L.y - 32) },
        { on: 1, d: brow(R.x, R.y - 32, 3, -9) },
      ];
      pose.rot = -4;
      break;
    case 'sleepy':
      pose.eyes = [ball({ lid: 0.6, py: 3 }), ball({ lid: 0.6, py: 3 })];
      pose.mouth = mouthOf(who, 0.2, 0.2, 0.42);
      pose.z = 1;
      pose.sy = 0.97;
      pose.sx = 1.02;
      break;
    case 'wink':
      pose.eyes = [stroke(wedge(L.x, L.y), WINK.w, true), ball()];
      pose.mouth = mouthOf(who, 1, 1, 1);
      pose.rot = 3;
      break;
    case 'confused':
      pose.eyes = [ball({ s: 1.12, px: 3 }), ball({ s: 0.84, px: -2 })];
      pose.mouth = wavy(who, 0.36, 0.55);
      pose.brows = [
        { on: 1, d: brow(L.x, L.y - 36, 7) },
        { on: 1, d: brow(R.x, R.y - 36, 7) },
      ];
      pose.rot = 3.5;
      break;
    case 'celebrating':
      pose.eyes = [stroke(arch(L.x, archY(who, L.y), 22, -34), 8.3), stroke(arch(R.x, archY(who, R.y), 22, -34), 8.3)];
      pose.mouth = mouthOf(who, 0, 1.65, 1.08);
      break;
    case 'talking':
      pose.mouth = talkMouth(who, 0);
      break;
  }
  pose.rot *= leanOf[who];
  if (lod !== 'full') {
    pose.brows = NO_BROWS;
    pose.z = 0;
  }
  return pose;
}
