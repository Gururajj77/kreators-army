// One set of springs for the whole site. Every value is a SwiftUI spring converted to Motion's physics form (stiffness, damping, mass 1),
// because only physics springs keep velocity when something is interrupted. Never use visualDuration or duration on anything that can reverse.

export type SpringToken = { type: 'spring'; stiffness: number; damping: number; mass: number };

/** SwiftUI Spring(response:dampingRatio:) as a Motion physics spring. Mass is 1, as in SwiftUI. */
export const fromSwiftUI = (response: number, dampingFraction: number): SpringToken => {
  const omega = (2 * Math.PI) / response;
  return { type: 'spring', stiffness: omega * omega, damping: 2 * dampingFraction * omega, mass: 1 };
};

/** The spring's perceptual duration in seconds, for chaining phases. */
export const responseOf = (s: SpringToken) => (2 * Math.PI) / Math.sqrt(s.stiffness / s.mass);

export const spring = {
  /** Going down on a press. */
  press: fromSwiftUI(0.15, 0.85),
  /** Press release, hover lift and settle. */
  release: fromSwiftUI(0.3, 0.85),
  /** Segment thumb, toggles, menus, chips. */
  snappy: fromSwiftUI(0.35, 0.85),
  /** Digit columns. No overshoot, or the next digit would show. */
  roll: fromSwiftUI(0.4, 1),
  /** Panels and section-scale moves. The site default (MotionConfig). */
  smooth: fromSwiftUI(0.45, 1),
  /** Shared-element morphs, large moves. */
  glide: fromSwiftUI(0.5, 1),
  /** Character reactions, success moments. */
  bouncy: fromSwiftUI(0.4, 0.7),
  /** Characters only. */
  hop: fromSwiftUI(0.38, 0.55),

  /** Heavy things that trail the pointer: the street's depth layers and its glow (motion §3). Gate by hand, like every useSpring. */
  drift: fromSwiftUI(0.8, 1),

  /** Pointer followers (magnet). Judgement, tuned by feel. Always gate by hand: useSpring ignores reduced motion. */
  follow: { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 } as SpringToken,

  /** The cast's own: lids and blink. */
  kLid: fromSwiftUI(0.14, 1),
  /** The cast's own: expression morphs. */
  kFace: fromSwiftUI(0.28, 0.8),
  /** The cast's own: pop in, release, prop in. */
  kPop: fromSwiftUI(0.32, 0.62),
  /** The cast's own: peek, look around. */
  kSoft: fromSwiftUI(0.5, 0.85),
} as const;
