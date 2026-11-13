import { finePointer, motionOk } from '../lib/motionOk';
import { spring as S, type SpringToken } from '../lib/spring';
import { PROP_PIVOT, HAND, type PropKind } from './props';
import { EYE_R, PUPIL_R, GLOSS, REST, lineD, mouthD, type CastId, type RestEye } from './rest';
import { poseOf, talkMouth, type EyePose, type Expression, type InternalExpression, type Lod, type Pose } from './rig';
import { bubbleToken, onPointer } from './stage';

// The pointer and the one-speaker token live in ./stage, outside this lazy chunk, so speech bubbles and the street share them from the first download.
export { bubbleToken, onPointer };

// One director for the whole cast: one passive pointermove, one frame loop, one blink schedule, one performer at a time, and a quiet mode 5 s after the last input.
// Nothing here touches React. Every value is a spring or a smoothed number stepped in the same frame, written with setAttribute or a transform.
// The pause control (`data-still`) and reduced motion are gated by hand here, because MotionConfig covers none of it: while still, springs snap and nothing runs on its own.

/** Actions any character can play. */
export const ACTIONS = ['hop', 'wave', 'signature', 'peek', 'nod', 'shrug'] as const;
export type CastAction = (typeof ACTIONS)[number];

export interface PlayOptions {
  /** `hover` plays every time (once the last move has finished) and never waits for the token; `tap` and `event` (the default) wait 2.5 s. */
  source?: 'hover' | 'tap' | 'event';
  /** Skip the cool-down and the wait for the performer token. For the page's own moments, sparingly. */
  force?: boolean;
  /** A shorter hop. */
  small?: boolean;
}

/** A place to look: an element (its centre), a point in viewport pixels, or null to let go. */
export type LookTarget = Element | { x: number; y: number } | null;

const QUIET_MS = 5000;
const PUPIL_MAX = 7.2;
// Hover answers every time (the founder's call): the only wait is for the move already playing to end.
const COOLDOWN = { hover: 0, tap: 2500, event: 2500 };
const POINTER_TAU = 70;
const POINTER_TAU_CLOSE = 36;
const FACE_TAU = 160;
const FACE_MAX = 8;
const BLINK_REST = 4500;
const BLINK_TALK = 2600;
const STAGE_K = { left: 84 / 312, top: 112 / 288, width: 480 / 312 };
const HOP_HEIGHT = 46;
const SIZE_FLAT = 32;
const SIZE_SMALL = 79;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const approach = (cur: number, target: number, dt: number, tau: number) => cur + (target - cur) * (1 - Math.exp(-dt / tau));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const jitter = (base: number) => base * (0.7 + Math.random() * 0.6);
const fixed = (n: number, d = 2) => n.toFixed(d);
const STEP = 1 / 480;

let still = !motionOk();
let fine = finePointer();

/** A set of values each following its own target on one spring. Semi-implicit Euler at a fixed small step, so it is stable at any frame rate. */
class Spr {
  x: number[];
  v: number[];
  t: number[];
  constructor(
    init: number[],
    private eps = 0.01,
  ) {
    this.x = init.slice();
    this.t = init.slice();
    this.v = init.map(() => 0);
  }
  to(target: number[]) {
    for (let i = 0; i < target.length; i++) this.t[i] = target[i]!;
  }
  snap() {
    for (let i = 0; i < this.x.length; i++) {
      this.x[i] = this.t[i]!;
      this.v[i] = 0;
    }
  }
  jump(values: number[]) {
    for (let i = 0; i < values.length; i++) {
      this.x[i] = values[i]!;
      this.t[i] = values[i]!;
      this.v[i] = 0;
    }
  }
  /** Moves toward the targets and returns true while anything is still moving. */
  step(dtMs: number, s: SpringToken) {
    const dt = dtMs / 1000;
    const n = Math.max(1, Math.min(16, Math.ceil(dt / STEP)));
    const h = dt / n;
    const k = s.stiffness / s.mass;
    const c = s.damping / s.mass;
    let moving = false;
    for (let i = 0; i < this.x.length; i++) {
      const target = this.t[i]!;
      let x = this.x[i]!;
      let v = this.v[i]!;
      if (x === target && v === 0) continue;
      for (let j = 0; j < n; j++) {
        v += (-k * (x - target) - c * v) * h;
        x += v * h;
      }
      if (Math.abs(x - target) < this.eps && Math.abs(v) < this.eps * 8) {
        x = target;
        v = 0;
      } else {
        moving = true;
      }
      this.x[i] = x;
      this.v[i] = v;
    }
    return moving;
  }
}

interface EyeRig {
  at: RestEye;
  ballEl: SVGGElement;
  pupilEl: SVGGElement;
  lidEl: SVGGElement;
  lineEl: SVGPathElement;
  kind: 'ball' | 'line';
  ball: Spr; // size, pupil scale, lid, pupil x, pupil y
  line: Spr; // the 16 stroke numbers and the width
  open: Spr;
  gx: number;
  gy: number;
  wink: boolean;
  pending: EyePose | null;
  swapAt: number;
}

export interface ActorInit {
  who: CastId;
  root: HTMLElement;
  svg: SVGSVGElement;
  propSvg: SVGSVGElement | null;
  propKind: PropKind;
  expression: Expression;
  prop: boolean;
  track: boolean;
  peek: boolean;
  interactive: boolean;
}

type Later = { at: number; fn: () => void; tag?: string };

export class Actor {
  readonly who: CastId;
  readonly root: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly floor: HTMLElement | null;
  private readonly face: SVGGElement;
  private readonly gloss: SVGEllipseElement | null;
  private readonly mouthEl: SVGPathElement;
  private readonly browEls: [SVGPathElement, SVGPathElement];
  private readonly zEl: SVGGElement;
  private readonly propSvg: SVGSVGElement | null;
  private readonly propG: SVGGElement | null;
  private readonly armEl: SVGGElement | null;
  private readonly tallyEl: SVGCircleElement | null;
  private readonly tallyGlow: SVGCircleElement | null;
  private readonly tickEl: SVGPathElement | null;
  private readonly todoEl: SVGCircleElement | null;
  private readonly handG: SVGGElement | null;
  readonly propKind: PropKind;

  lod: Lod = 'full';
  visible = false;
  private box = { left: 0, top: 0, width: 150, height: 138 };
  /** Stage pixels per stage unit. */
  private k = 150 / 312;

  // expression layers: performance > setExpression > the prop
  private base: Expression;
  private override: InternalExpression | null = null;
  private temp: InternalExpression | null = null;
  private eyesClosed = false;

  private mouth: Spr;
  private body: Spr;
  private bodySpring: SpringToken = S.kFace;
  private brows: [Spr, Spr];
  private eyes: [EyeRig, EyeRig];
  private z = new Spr([0], 0.004);
  private propState = new Spr([0, 0, 0], 0.02); // show, lift, tilt
  private hand = new Spr([0], 0.004);
  private arm = new Spr([-20], 0.02);
  private armSpring: SpringToken = S.kPop;
  private tally = new Spr([0], 0.004);
  private tickMark = new Spr([0], 0.004);
  private waveAngle = 0;
  private waveAt = -1;
  private waveHand = false;

  private restRot = 0;
  private restSx = 1;
  private restSy = 1;
  private bodyY = 0;
  private hovered = false;
  private pressed = false;
  private hopAt = -1;
  private hopHeight = HOP_HEIGHT;
  private hopBaseRot = 0;

  private fx = 0;
  private fy = 0;
  private track: boolean;
  private tightUntil = 0;
  private focus: { target: Exclude<LookTarget, null>; until: number } | null = null;
  /** A look has just ended: the gaze is allowed to travel back once, even while the cast is asleep. */
  private settling = false;
  private idleGaze: { x: number; y: number; until: number } | null = null;
  private nextGlance = 0;
  private propWanted: boolean;
  private propLatch = false;
  private talking = false;
  private beat = 0;
  private nextBeat = 0;
  private nextBlink = 0;
  private peekWanted: boolean;
  private peeked = false;
  private readyAt = { hover: 0, tap: 0, event: 0 };
  private timeline: Later[] = [];
  private dirty = true;
  private interactive: boolean;
  private removers: (() => void)[] = [];

  constructor(init: ActorInit) {
    this.who = init.who;
    this.root = init.root;
    this.propKind = init.propKind;
    this.propSvg = init.propSvg;
    this.base = init.expression;
    this.track = init.track;
    this.propWanted = init.prop;
    this.peekWanted = init.peek;
    this.interactive = init.interactive;
    this.stage = init.root.querySelector('.k-stage') as HTMLElement;
    this.floor = init.root.querySelector('.k-floor');
    const q = <T extends Element>(name: string) => init.svg.querySelector(`[data-part="${name}"]`) as T;
    this.face = q('face');
    this.gloss = q<SVGEllipseElement>('gloss');
    this.mouthEl = q('mouth');
    this.browEls = [q('brow0'), q('brow1')];
    this.zEl = q('z');
    const pq = <T extends Element>(name: string) => (init.propSvg?.querySelector(`[data-part="${name}"]`) ?? null) as T | null;
    this.propG = pq('prop');
    this.armEl = pq('arm');
    this.tallyEl = pq('tally');
    this.tallyGlow = pq('tally-glow');
    this.tickEl = pq('tick');
    this.todoEl = pq('todo');
    this.handG = pq('hand');

    const r = REST[init.who];
    const pose = poseOf(init.who, this.exprNow(), 'full');
    this.mouth = new Spr(pose.mouth, 0.01);
    this.brows = [new Spr([...pose.brows[0].d, 0], 0.01), new Spr([...pose.brows[1].d, 0], 0.01)];
    this.body = new Spr([0, 1, 1, 0], 0.0006);
    const eyeOf = (i: 0 | 1): EyeRig => {
      const at = r.eyes[i];
      const pre = `eye${i}-`;
      return {
        at,
        ballEl: q(`${pre}ball`),
        pupilEl: q(`${pre}pupil`),
        lidEl: q(`${pre}lid`),
        lineEl: q(`${pre}line`),
        kind: pose.eyes[i].kind,
        ball: new Spr([1, 1, 0, 0, 0], 0.004),
        line: new Spr(new Array<number>(17).fill(0), 0.02),
        open: new Spr([1], 0.004),
        gx: 0,
        gy: 0,
        wink: !!pose.eyes[i].wink,
        pending: null,
        swapAt: 0,
      };
    };
    this.eyes = [eyeOf(0), eyeOf(1)];
    this.measure();
    this.nextBlink = performance.now() + Math.random() * BLINK_REST;

    this.applyExpression(true);
    this.syncProp(still);
    if (init.peek) {
      const inView = this.box.top < window.innerHeight && this.box.top + this.box.height > 0;
      if (still || inView) {
        this.peeked = true;
        this.settlePeek();
      } else {
        this.primePeek();
      }
    }
    if (this.interactive) this.attachPointer();
    // Paint now, in the same frame the rig arrives, so the swap from the rest face changes no pixels.
    this.flush();
  }

  /** Write every part once. */
  private flush() {
    for (const eye of this.eyes) this.writeEye(eye);
    this.writeMouth();
    this.writeBrows();
    this.writeZ();
    if (this.propG) this.writeProp();
    this.writeHand();
    this.writeBody();
    this.dirty = false;
  }

  private exprNow(): InternalExpression {
    return this.temp ?? this.override ?? this.base;
  }

  measure() {
    const b = this.root.getBoundingClientRect();
    this.box = { left: b.left, top: b.top, width: b.width, height: b.height };
    // The gaze maps stage units to screen pixels, so it keeps the transformed size. The detail level does not: a pop-in that starts at scale(0.6) is measured
    // mid-animation, and the size observer never hears about transforms, so a layout width is the only one that cannot stick at the small level.
    if (b.width > 0) this.k = (b.width * STAGE_K.width) / 480;
    const w = this.root.offsetWidth || b.width;
    const next: Lod = w <= SIZE_FLAT ? 'flat' : w <= SIZE_SMALL ? 'small' : 'full';
    if (next !== this.lod) {
      this.lod = next;
      this.root.dataset.lod = next;
      this.applyExpression(true);
      this.syncProp(true);
    }
  }


  private attachPointer() {
    const root = this.root;
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      this.hovered = true;
      this.bodySpring = S.kFace;
      this.updateBody();
    };
    const leave = () => {
      this.hovered = false;
      this.bodySpring = S.kFace;
      this.updateBody();
    };
    // A tap performs; a scroll or a drag that starts on the character only squashes it. The browser cancels the pointer when a touch turns into a scroll.
    const TAP_SLOP = 10;
    const down = (start: PointerEvent) => {
      this.setPressed(true);
      const done = () => {
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        this.setPressed(false);
      };
      const up = (e: PointerEvent) => {
        done();
        const tap = Math.hypot(e.clientX - start.clientX, e.clientY - start.clientY) < TAP_SLOP;
        if (tap && root.contains(e.target as Node)) perform(this, 'signature', { source: 'tap' });
      };
      const cancel = () => done();
      window.addEventListener('pointerup', up, { passive: true });
      window.addEventListener('pointercancel', cancel, { passive: true });
    };
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointerleave', leave);
    root.addEventListener('pointerdown', down);
    this.removers.push(() => {
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('pointerdown', down);
    });
  }

  destroy() {
    for (const off of this.removers) off();
    this.timeline = [];
  }

  /** Squash on press, and a springy rebound on release. */
  setPressed(on: boolean) {
    if (still) return;
    this.pressed = on;
    if (on) {
      this.bodySpring = S.press;
      this.updateBody();
    } else {
      this.bodySpring = S.kPop;
      this.body.to([this.bodyY, 0.95, 1.06, this.rotTarget()]);
      this.later(90, () => {
        this.bodySpring = S.kPop;
        this.updateBody();
      });
    }
    wake();
  }

  // ---------- commands ----------

  setBase(name: Expression) {
    if (name === this.base) return;
    this.base = name;
    this.applyExpression();
    if (name === 'celebrating') this.celebrate();
  }

  setOptions(track: boolean, prop: boolean) {
    this.track = track;
    if (prop !== this.propWanted) {
      this.propWanted = prop;
      this.syncProp();
    }
  }

  setExpression(name: InternalExpression | null, hold?: number) {
    this.override = name;
    this.applyExpression();
    if (name === 'celebrating') this.celebrate();
    if (name && hold) this.later(hold, () => {
      if (this.override === name) this.setExpression(null);
    }, 'hold');
  }

  /** The password gesture: lids fully shut, on any eye that has lids. */
  closeEyes(closed: boolean) {
    this.eyesClosed = closed;
    this.applyExpression();
  }

  lookAt(target: LookTarget, ms = 1200) {
    if (!target) {
      this.focus = null;
      return;
    }
    this.focus = { target, until: performance.now() + ms };
    wake();
    // The loop may be asleep when the look runs out: come back then, so the gaze returns.
    if (Number.isFinite(ms)) setTimeout(wake, ms + 20);
  }

  private celebrate() {
    perform(this, 'hop', { source: 'event' });
  }

  // ---------- performance ----------

  canPlay(source: keyof typeof COOLDOWN, t: number) {
    return t >= this.readyAt[source];
  }

  noteCooldown(source: keyof typeof COOLDOWN, t: number) {
    this.readyAt[source] = t + COOLDOWN[source];
  }

  /** Run a one-shot and return how long it takes in ms. */
  run(action: CastAction, opts: PlayOptions): number {
    if (this.lod === 'flat') return 0;
    const small = this.lod === 'small';
    switch (action) {
      case 'hop':
        if (still || this.box.width < 44) return 0;
        this.startHop(opts.small || small ? HOP_HEIGHT * 0.6 : HOP_HEIGHT);
        return 640;
      case 'wave':
        return still ? 0 : this.startWave();
      case 'nod':
        if (still) return 0;
        this.bodySpring = S.press;
        this.body.to([this.bodyY, this.restSx * 1.035, this.restSy * 0.94, this.rotTarget()]);
        this.later(120, () => {
          this.bodySpring = S.kPop;
          this.updateBody();
        });
        wake();
        return 420;
      case 'shrug':
        this.setTemp('confused', 1300);
        if (still) return 0;
        this.bodySpring = S.kFace;
        this.body.to([this.bodyY, this.restSx * 0.97, this.restSy * 1.05, this.rotTarget()]);
        this.later(320, () => {
          this.bodySpring = S.kFace;
          this.updateBody();
        });
        wake();
        return 1300;
      case 'peek':
        return this.startPeek();
      case 'signature':
        return this.startSignature();
    }
  }

  private startHop(height: number) {
    this.hopAt = performance.now();
    this.hopHeight = height;
    this.hopBaseRot = this.rotTarget();
    wake();
  }

  private startPeek() {
    if (still) return 0;
    this.peeked = false;
    this.primePeek();
    this.flush();
    this.peekIn();
    return 600;
  }

  private startWave() {
    if (this.lod !== 'full') return 0;
    this.waveHand = !this.propShown() || !this.propG || this.propKind === 'camera';
    if (this.waveHand) {
      if (!this.handG) return 0;
      this.hand.to([1]);
    }
    this.waveAt = performance.now() + (this.waveHand ? 130 : 0);
    wake();
    if (this.waveHand) this.later(1260, () => this.hand.to([0]));
    return 1400;
  }

  private propShown() {
    return this.propWanted || this.propLatch;
  }

  private startSignature(): number {
    if (this.lod !== 'full') {
      if (this.who === 'gola') this.setTemp('wink', 900);
      else if (this.who === 'bolu') this.setTemp('talking', 900);
      else if (this.who === 'sochu') this.setTemp('open', 900);
      else this.setTemp('happy', 900);
      return 900;
    }
    switch (this.who) {
      case 'bolu':
        this.latchProp(true);
        this.to(this.propState, [1, -34, -9]);
        this.setTemp('talking', 1250);
        this.later(1250, () => this.to(this.propState, [1, 0, 0]));
        this.later(1560, () => this.latchProp(false));
        return 1620;
      case 'tiko':
        this.latchProp(true);
        this.to(this.tally, [1]);
        this.tightUntil = performance.now() + 1700;
        wake();
        this.later(1700, () => this.to(this.tally, [0]));
        this.later(1980, () => this.latchProp(false));
        return 2040;
      case 'gola':
        if (this.propKind !== 'clapper') {
          this.setTemp('wink', 900);
          this.startHop(HOP_HEIGHT * 0.6);
          return 900;
        }
        this.latchProp(true);
        if (still) {
          this.setTemp('wink', 900);
          this.later(900, () => this.latchProp(false));
          return 900;
        }
        this.later(160, () => this.moveArm(-36, S.kPop));
        this.later(370, () => {
          this.moveArm(0, S.press);
          this.setTemp('wink', 620);
        });
        this.later(420, () => {
          this.bodySpring = S.press;
          this.body.to([this.bodyY, this.restSx * 1.05, this.restSy * 0.93, this.rotTarget()]);
          this.later(90, () => {
            this.bodySpring = S.kPop;
            this.updateBody();
          });
        });
        this.later(560, () => this.moveArm(-20, S.kFace));
        this.later(1120, () => this.latchProp(false));
        return 1200;
      case 'sochu':
        this.latchProp(true);
        this.setTemp('open', 1050);
        this.later(430, () => this.to(this.tickMark, [1]));
        this.later(2300, () => this.to(this.tickMark, [0]));
        this.later(2440, () => this.latchProp(false));
        return 2520;
    }
  }

  private moveArm(angle: number, spring: SpringToken) {
    this.armSpring = spring;
    this.to(this.arm, [angle]);
    wake();
  }

  private latchProp(on: boolean) {
    this.propLatch = on;
    this.syncProp();
  }

  private syncProp(instant = false) {
    const show = this.lod === 'full' && (this.propWanted || this.propLatch);
    const next = [show ? 1 : 0, this.propState.t[1]!, this.propState.t[2]!];
    if (instant) this.jumpSpr(this.propState, next);
    else this.to(this.propState, next);
    if (this.propSvg) this.propSvg.style.display = this.lod === 'full' ? '' : 'none';
    wake();
  }

  private jumpSpr(s: Spr, v: number[]) {
    s.jump(v);
    this.dirty = true;
  }

  /** Under still, every spring lands at once. */
  private to(s: Spr, v: number[]) {
    s.to(v);
    if (still) s.snap();
    this.dirty = true;
    wake();
  }

  private setTemp(name: InternalExpression, ms: number) {
    this.temp = name;
    this.applyExpression();
    this.later(ms, () => {
      if (this.temp === name) {
        this.temp = null;
        this.applyExpression();
      }
    }, 'temp');
  }

  private later(ms: number, fn: () => void, tag?: string) {
    if (tag) this.timeline = this.timeline.filter((l) => l.tag !== tag);
    this.timeline.push({ at: performance.now() + ms, fn, tag });
    wake();
  }

  private primePeek() {
    this.body.jump([PEEK_LOW, 1, 1, 0]);
    this.bodyY = PEEK_LOW;
    this.dirty = true;
  }

  settlePeek() {
    this.bodyY = PEEK_HIGH;
    this.body.jump([PEEK_HIGH, this.body.x[1]!, this.body.x[2]!, this.body.x[3]!]);
    this.dirty = true;
  }

  peekIn() {
    if (this.peeked) return;
    this.peeked = true;
    this.bodyY = PEEK_HIGH;
    if (still) {
      this.settlePeek();
      return;
    }
    this.bodySpring = S.kSoft;
    this.updateBody();
    wake();
  }

  onSeen() {
    if (this.peekWanted && !this.peeked) this.peekIn();
  }

  // ---------- pose ----------

  private applyExpression(instant = false) {
    const name = this.exprNow();
    const pose = poseOf(this.who, name, this.lod);
    this.talking = name === 'talking' && this.lod !== 'flat';
    if (this.talking) this.nextBeat = 0;
    this.applyPose(pose, instant || still);
    this.dirty = true;
  }

  private applyPose(p: Pose, instant: boolean) {
    this.mouth.to(p.mouth);
    if (instant) this.mouth.snap();
    p.brows.forEach((b, i) => {
      const s = this.brows[i as 0 | 1];
      if (b.on) {
        if (s.x[6]! < 0.02) s.jump([...b.d, 0]);
        s.to([...b.d, 1]);
      } else {
        s.t[6] = 0;
      }
      if (instant) s.snap();
    });
    this.z.to([p.z]);
    if (instant) this.z.snap();
    this.restRot = p.rot;
    this.restSx = p.sx;
    this.restSy = p.sy;
    p.eyes.forEach((target, i) => {
      const eye = this.eyes[i as 0 | 1];
      const t = this.eyesClosed && target.kind === 'ball' ? { ...target, lid: 1 } : target;
      if (t.kind !== eye.kind && !instant) {
        eye.pending = t;
        eye.swapAt = performance.now() + 70;
        eye.open.t[0] = 0.08;
      } else if (instant) {
        eye.pending = null;
        this.jumpEye(eye, t);
      } else {
        eye.pending = null;
        this.eyeTargets(eye, t);
      }
    });
    if (this.hopAt < 0) {
      if (instant) this.bodySpring = S.kFace;
      this.updateBody();
    }
  }

  private eyeTargets(eye: EyeRig, t: EyePose) {
    eye.ball.to([t.s, t.pr, t.lid, t.px, t.py]);
    if (t.kind === 'line' && t.line) eye.line.to([...t.line, t.w ?? 8]);
    eye.wink = !!t.wink;
    eye.open.t[0] = 1;
  }

  private jumpEye(eye: EyeRig, t: EyePose) {
    eye.kind = t.kind;
    eye.ball.jump([t.s, t.pr, t.lid, t.px, t.py]);
    if (t.line) eye.line.jump([...t.line, t.w ?? 8]);
    eye.wink = !!t.wink;
    eye.open.t[0] = 1;
    if (still) eye.open.snap();
    eye.ballEl.style.display = t.kind === 'ball' ? '' : 'none';
    eye.lineEl.style.display = t.kind === 'line' ? '' : 'none';
  }

  private rotTarget() {
    return this.restRot + (this.hovered ? -3 : 0);
  }

  private updateBody() {
    const sign = this.hovered ? 1.04 : 1;
    const sx = this.restSx * sign * (this.pressed ? 1.09 : 1);
    const sy = this.restSy * sign * (this.pressed ? 0.88 : 1);
    this.body.to([this.bodyY, sx, sy, this.rotTarget()]);
    if (still) this.body.snap();
    this.dirty = true;
  }

  // ---------- the frame ----------

  /** Returns true while this character needs another frame. */
  tick(t: number, dt: number, awake: boolean): boolean {
    let moving = false;

    if (this.timeline.length) {
      const due = this.timeline.filter((l) => l.at <= t);
      if (due.length) {
        this.timeline = this.timeline.filter((l) => l.at > t);
        for (const l of due) l.fn();
      }
      moving = true;
    }

    if (awake && !still) {
      this.ambient(t);
    }

    if (this.hopAt >= 0) {
      this.stepHop(t);
      moving = true;
    } else if (this.body.step(dt, this.bodySpring)) {
      this.writeBody();
      moving = true;
    } else if (this.dirty) {
      this.writeBody();
    }

    for (const eye of this.eyes) {
      if (eye.pending && t >= eye.swapAt) {
        const p = eye.pending;
        eye.pending = null;
        this.jumpEye(eye, p);
        eye.open.t[0] = 1;
        this.dirty = true;
        moving = true;
      }
      const a = eye.open.step(dt, S.kLid);
      const b = eye.ball.step(dt, S.kFace);
      const c = eye.line.step(dt, S.kFace);
      if (a || b || c || this.dirty) this.writeEye(eye);
      if (a || b || c || eye.pending) moving = true;
    }

    const mouthMoved = this.mouth.step(dt, S.kFace);
    if (mouthMoved || this.dirty) this.writeMouth();
    if (mouthMoved) moving = true;

    const brow0 = this.brows[0].step(dt, S.kFace);
    const brow1 = this.brows[1].step(dt, S.kFace);
    if (brow0 || brow1 || this.dirty) this.writeBrows();
    if (brow0 || brow1) moving = true;

    const zMoved = this.z.step(dt, S.kPop);
    if (zMoved || this.dirty) this.writeZ();
    if (zMoved) moving = true;

    const propMoving = this.propState.step(dt, S.kPop);
    const armMoving = this.arm.step(dt, this.armSpring);
    const tallyMoving = this.tally.step(dt, S.kFace);
    const tickMoving = this.tickMark.step(dt, S.kPop);
    const waving = this.waveAt >= 0;
    if (waving) {
      const e = t - this.waveAt;
      if (e >= 1140) {
        this.waveAt = -1;
        this.waveAngle = 0;
        this.dirty = true;
      } else if (e >= 0) {
        const envelope = Math.min(1, Math.min(e, 1140 - e) / 180);
        this.waveAngle = 18 * Math.sin((e / 360) * Math.PI * 2) * envelope;
      }
      moving = true;
    }
    const handMoving = this.hand.step(dt, S.kPop);
    if (propMoving || armMoving || tallyMoving || tickMoving || waving || handMoving || this.dirty) {
      if (this.propG) this.writeProp();
      this.writeHand();
    }
    if (propMoving || armMoving || tallyMoving || tickMoving || handMoving) moving = true;

    this.dirty = false;

    // A look keeps the loop running only while the gaze is still travelling: a long look at a fixed point (the phone field's turn-away) must not hold the
    // frames open for its whole length. lookAt wakes the loop again when the look runs out.
    if (this.followGaze(t, dt, awake)) moving = true;

    return moving;
  }

  private ambient(t: number) {
    if (this.nextBlink && t >= this.nextBlink) {
      this.blink();
      this.nextBlink = t + jitter(this.talking ? BLINK_TALK : BLINK_REST);
    }
    if (this.talking && t >= this.nextBeat) {
      this.beat = (this.beat + 1 + Math.floor(Math.random() * 2)) % 3;
      this.mouth.to(talkMouth(this.who, this.beat));
      this.nextBeat = t + 110 + Math.random() * 70;
      // A slight bob on each beat, so the mouth does not move alone.
      if (this.lod === 'full' && !this.hovered && !this.pressed && this.hopAt < 0) {
        const amount = [0.01, -0.006, 0.014][this.beat]!;
        this.bodySpring = S.kFace;
        this.body.t[1] = this.restSx * (1 - amount / 2);
        this.body.t[2] = this.restSy * (1 + amount);
      }
    }
    if (this.who === 'tiko' && !fine && t >= this.nextGlance) {
      this.nextGlance = t + 2200 + Math.random() * 3000;
      const a = this.box;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.idleGaze = { x: a.left + a.width / 2 + side * a.width * 2, y: a.top + a.height * (0.2 + Math.random() * 0.5), until: t + 700 };
    }
  }

  private blink() {
    if (this.who === 'sochu' || this.lod === 'flat') return;
    if (this.exprNow() === 'sleepy') return;
    const shut = () => {
      for (const e of this.eyes) if (!e.wink && !e.pending) e.open.t[0] = 0.08;
    };
    const open = () => {
      for (const e of this.eyes) if (!e.pending) e.open.t[0] = 1;
    };
    shut();
    this.later(70, open);
    if (Math.random() < 0.12) {
      this.later(230, shut);
      this.later(300, open);
    }
  }

  private stepHop(t: number) {
    const e = t - this.hopAt;
    const b = this.body;
    const y0 = this.bodyY;
    const sx0 = this.restSx;
    const sy0 = this.restSy;
    if (e < 90) {
      const p = easeOut(e / 90);
      b.x[0] = y0;
      b.x[1] = lerp(sx0, 1.07, p);
      b.x[2] = lerp(sy0, 0.9, p);
      b.x[3] = this.hopBaseRot;
    } else if (e < 345) {
      const q = (e - 90) / 255;
      const stretch = q < 0.5 ? 1 - q * 2 : (q - 0.5) * 2 * 0.45;
      b.x[0] = y0 - this.hopHeight * 4 * q * (1 - q);
      b.x[1] = 1 - 0.05 * stretch;
      b.x[2] = 1 + 0.07 * stretch;
    } else {
      b.x[0] = y0;
      b.x[1] = 1.1;
      b.x[2] = 0.88;
      b.v.fill(0);
      this.hopAt = -1;
      this.bodySpring = S.hop;
      this.updateBody();
    }
    this.writeBody();
  }

  private writeBody() {
    const [y, sx, sy, rot] = this.body.x as [number, number, number, number];
    this.stage.style.transform = `translate3d(0,${fixed(y * this.k)}px,0) rotate(${fixed(rot)}deg) scale(${fixed(sx, 4)},${fixed(sy, 4)})`;
    if (this.floor) {
      const lift = clamp(-y / HOP_HEIGHT, 0, 1);
      this.floor.style.transform = `scale(${fixed(1 - 0.38 * lift, 3)})`;
      this.floor.style.opacity = fixed(1 - 0.5 * lift, 3);
    }
  }

  private writeMouth() {
    this.mouthEl.setAttribute('d', mouthD(this.mouth.x));
    this.mouthEl.setAttribute('stroke-width', fixed(this.mouth.x[12]!));
  }

  private writeBrows() {
    for (let i = 0; i < 2; i++) {
      const s = this.brows[i as 0 | 1].x;
      const el = this.browEls[i as 0 | 1];
      el.setAttribute('d', `M${fixed(s[0]!)} ${fixed(s[1]!)}Q${fixed(s[2]!)} ${fixed(s[3]!)} ${fixed(s[4]!)} ${fixed(s[5]!)}`);
      el.setAttribute('opacity', fixed(s[6]!, 3));
    }
  }

  private writeZ() {
    const v = this.z.x[0]!;
    this.zEl.setAttribute('opacity', fixed(v, 3));
    this.zEl.style.display = v < 0.01 ? 'none' : '';
  }

  private writeEye(eye: EyeRig) {
    const o = eye.open.x[0]!;
    if (eye.kind === 'ball') {
      const s = eye.ball.x[0]!;
      const pr = eye.ball.x[1]!;
      const lid = eye.ball.x[2]!;
      const px = eye.ball.x[3]! + eye.gx;
      const py = eye.ball.x[4]! + eye.gy;
      eye.ballEl.setAttribute('transform', `translate(${fixed(eye.at.x)} ${fixed(eye.at.y)}) scale(${fixed(s, 3)} ${fixed(s * o, 3)})`);
      eye.pupilEl.setAttribute('transform', `translate(${fixed(px)} ${fixed(py)}) scale(${fixed(pr, 3)})`);
      if (lid > 0.005) {
        eye.lidEl.setAttribute('transform', `translate(0 ${fixed((lid - 1) * 2 * EYE_R)})`);
        eye.lidEl.setAttribute('opacity', '1');
      } else {
        eye.lidEl.setAttribute('opacity', '0');
      }
    } else {
      eye.lineEl.setAttribute('d', lineD(eye.line.x));
      eye.lineEl.setAttribute('stroke-width', fixed(eye.line.x[16]!));
      const baseline = Math.max(eye.line.x[1]!, eye.line.x[7]!);
      eye.lineEl.setAttribute('transform', `translate(0 ${fixed(baseline * (1 - o))}) scale(1 ${fixed(o, 3)})`);
    }
  }

  private writeProp() {
    const [show, lift, tilt] = this.propState.x as [number, number, number];
    const g = this.propG!;
    const [px, py] = PROP_PIVOT[this.propKind];
    const rot = tilt + (this.waveHand ? 0 : this.waveAngle);
    const s = fixed(0.6 + 0.4 * clamp(show, 0, 1.1), 3);
    g.setAttribute('transform', `translate(0 ${fixed(lift)}) rotate(${fixed(rot)} ${px} ${py}) translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})`);
    g.setAttribute('opacity', fixed(clamp(show, 0, 1), 3));
    g.style.display = show < 0.004 ? 'none' : '';
    this.armEl?.setAttribute('transform', `rotate(${fixed(this.arm.x[0]!)} -64 -2)`);
    if (this.tallyEl && this.tallyGlow) {
      const v = this.tally.x[0]!;
      this.tallyEl.setAttribute('opacity', fixed(v, 3));
      this.tallyGlow.setAttribute('opacity', fixed(v * 0.28, 3));
    }
    if (this.tickEl) {
      const v = clamp(this.tickMark.x[0]!, 0, 1.2);
      this.tickEl.setAttribute('opacity', fixed(clamp(v, 0, 1), 3));
      this.tickEl.setAttribute('transform', `translate(-23 37) scale(${fixed(0.5 + 0.5 * v, 3)}) translate(23 -37)`);
      this.todoEl?.setAttribute('opacity', fixed(1 - clamp(v, 0, 1), 3));
    }
  }

  private writeHand() {
    if (!this.handG) return;
    const v = this.hand.x[0]!;
    const h = HAND[this.who];
    const s = fixed(0.4 + 0.6 * clamp(v, 0, 1.15), 3);
    const rot = this.waveHand ? this.waveAngle : 0;
    this.handG.setAttribute('transform', `rotate(${fixed(rot)} ${h.px} ${h.py}) translate(${h.x} ${h.y}) scale(${s}) translate(${-h.x} ${-h.y})`);
    this.handG.setAttribute('opacity', fixed(clamp(v, 0, 1), 3));
    this.handG.style.display = v < 0.004 ? 'none' : '';
  }

  private currentGaze(t: number, fine: boolean): { x: number; y: number } | null {
    if (this.focus) {
      if (t < this.focus.until) {
        const target = this.focus.target;
        if (target instanceof Element) {
          const r = target.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return target;
      }
      this.focus = null;
      this.settling = true;
    }
    if (this.track && fine && pointer.known) return pointer;
    if (this.track && !fine && tapPoint && t < tapPoint.until) return tapPoint;
    if (this.idleGaze) {
      if (t < this.idleGaze.until) return this.idleGaze;
      this.idleGaze = null;
    }
    if (this.peekWanted) return { x: this.box.left + this.box.width / 2, y: this.box.top - 240 };
    return null;
  }

  private followGaze(t: number, dt: number, awake: boolean): boolean {
    if (still || this.lod === 'flat') return false;
    if (!awake && !this.focus && !this.settling) return false;
    const target = this.currentGaze(t, fine);
    const tight = t < this.tightUntil;
    const tau = tight ? POINTER_TAU_CLOSE : POINTER_TAU;
    const stageX = this.box.left - this.box.width * STAGE_K.left;
    const stageY = this.box.top - this.box.height * STAGE_K.top;
    const stageW = this.box.width * STAGE_K.width;
    let moving = false;
    for (const eye of this.eyes) {
      let tx = 0;
      let ty = 0;
      if (target && eye.kind === 'ball') {
        const ex = stageX + eye.at.x * this.k;
        const ey = stageY + eye.at.y * this.k;
        const dx = target.x - ex;
        const dy = target.y - ey;
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, d / (stageW * (tight ? 0.8 : 1.6)));
        const s = eye.ball.x[0]!;
        const pr = eye.ball.x[1]!;
        const max = Math.min(PUPIL_MAX, EYE_R * s - PUPIL_R * pr - 1.2);
        tx = (dx / d) * max * reach;
        ty = (dy / d) * max * reach;
      }
      const nx = approach(eye.gx, tx, dt, tau);
      const ny = approach(eye.gy, ty, dt, tau);
      if (Math.abs(nx - eye.gx) > 0.01 || Math.abs(ny - eye.gy) > 0.01) {
        eye.gx = nx;
        eye.gy = ny;
        eye.pupilEl.setAttribute('transform', `translate(${fixed(eye.ball.x[3]! + nx)} ${fixed(eye.ball.x[4]! + ny)}) scale(${fixed(eye.ball.x[1]!, 3)})`);
        moving = true;
      }
    }
    if (this.lod === 'full') {
      let fx = 0;
      let fy = 0;
      if (target) {
        const cx = stageX + stageW / 2;
        const cy = stageY + 260 * this.k;
        const dx = target.x - cx;
        const dy = target.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, d / (stageW * 1.6));
        fx = (dx / d) * FACE_MAX * reach;
        fy = (dy / d) * FACE_MAX * reach;
      }
      const nfx = approach(this.fx, fx, dt, FACE_TAU);
      const nfy = approach(this.fy, fy, dt, FACE_TAU);
      if (Math.abs(nfx - this.fx) > 0.01 || Math.abs(nfy - this.fy) > 0.01) {
        this.fx = nfx;
        this.fy = nfy;
        this.face.setAttribute('transform', `translate(${fixed(nfx)} ${fixed(nfy)})`);
        this.mouthEl.setAttribute('transform', `translate(${fixed(nfx * -0.3)} ${fixed(nfy * -0.3)})`);
        if (this.gloss) {
          const g = GLOSS[this.who];
          this.gloss.setAttribute('transform', `translate(${fixed(nfx * -0.4)} ${fixed(nfy * -0.4)}) rotate(${g.rot} ${g.cx} ${g.cy})`);
        }
        moving = true;
      }
    }
    if (!moving) this.settling = false;
    return moving;
  }

  setStill(on: boolean) {
    if (on) {
      this.hopAt = -1;
      this.waveAt = -1;
      this.waveAngle = 0;
      this.hovered = false;
      this.pressed = false;
      for (const eye of this.eyes) {
        eye.gx = 0;
        eye.gy = 0;
      }
      this.fx = 0;
      this.fy = 0;
      this.face.setAttribute('transform', '');
      this.mouthEl.setAttribute('transform', '');
      if (this.gloss) {
        const g = GLOSS[this.who];
        this.gloss.setAttribute('transform', `rotate(${g.rot} ${g.cx} ${g.cy})`);
      }
      this.applyExpression(true);
      this.updateBody();
      this.body.snap();
      this.propState.snap();
      this.arm.snap();
      this.tally.snap();
      this.tickMark.snap();
      this.hand.snap();
      this.z.snap();
      for (const eye of this.eyes) eye.open.snap();
      if (this.peekWanted) {
        this.peeked = true;
        this.settlePeek();
      }
      this.flush();
    }
  }
}

// Peek offsets in stage units: how far the body has dropped, as a share of the 288-unit box.
const PEEK_LOW = 0.62 * 288;
const PEEK_HIGH = 0.3 * 288;
export const PEEK_REST_PERCENT = (PEEK_HIGH / 480) * 100;

// ---------- the one director ----------

const actors = new Set<Actor>();
const pointer = { x: 0, y: 0, known: false };
let tapPoint: { x: number; y: number; until: number } | null = null;
let lastInput = -Infinity;
let running = false;
let raf = 0;
let lastFrame = 0;
let rectsDirty = false;
let paused = false;
let lastDialogCheck = 0;
let started = false;

type Queued = { actor: Actor; action: CastAction; opts: PlayOptions; at: number };
/** Actors mid-performance. The token itself is shared with speech bubbles (./stage): an actor holds it under its root element, a group under GROUP. */
const playing = new Set<Actor>();
const GROUP = { group: true };
let queued: Queued | null = null;

const root = document.documentElement;

function setQuiet(quiet: boolean) {
  if (quiet) root.dataset.castQuiet = '';
  else delete root.dataset.castQuiet;
}

function checkPaused(t: number) {
  if (t - lastDialogCheck < 240) return;
  lastDialogCheck = t;
  paused = document.visibilityState === 'hidden' || document.querySelector('dialog[open]') !== null;
}

/** Ask for frames. Internal changes call this; only real input extends the awake window. */
export function wake() {
  const t = performance.now();
  checkPaused(t);
  if (paused) return;
  if (!running && actors.size) {
    running = true;
    lastFrame = t;
    setQuiet(false);
    raf = requestAnimationFrame(frame);
  }
}

function frame(t: number) {
  raf = 0;
  const dt = Math.min(t - lastFrame, 34);
  lastFrame = t;
  checkPaused(t);
  if (paused) {
    running = false;
    return;
  }
  const awake = t - lastInput < QUIET_MS;
  if (rectsDirty) {
    rectsDirty = false;
    for (const a of actors) a.measure();
  }
  let active = false;
  for (const a of actors) {
    if (a.visible && a.tick(t, dt, awake)) active = true;
  }
  if (active || awake) {
    raf = requestAnimationFrame(frame);
  } else {
    running = false;
    setQuiet(true);
  }
}

const noteInput = () => {
  lastInput = performance.now();
  rectsDirty = true;
  wake();
};

function onMove(e: PointerEvent) {
  pointer.known = true;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  lastInput = performance.now();
  wake();
}

function onDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse') tapPoint = { x: e.clientX, y: e.clientY, until: performance.now() + 900 };
  noteInput();
}

function startDirector() {
  if (started) return;
  started = true;
  // The site's one passive pointermove (R10), shared with the street through ./stage.
  onPointer((_x, _y, e) => onMove(e));
  // A bubble or another performer has finished: the request that lost waits once and then runs.
  bubbleToken.onFree(() => {
    const next = queued;
    queued = null;
    if (next && actors.has(next.actor) && performance.now() - next.at < 1500) perform(next.actor, next.action, next.opts);
  });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('keydown', noteInput, { passive: true });
  window.addEventListener('scroll', noteInput, { passive: true, capture: true });
  window.addEventListener('resize', noteInput, { passive: true });
  document.addEventListener('visibilitychange', () => {
    lastDialogCheck = 0;
    if (document.visibilityState === 'hidden') {
      cancelAnimationFrame(raf);
      running = false;
    }
    wake();
  });
  matchMedia('(hover: hover) and (pointer: fine)').addEventListener('change', () => {
    fine = finePointer();
  });
  new MutationObserver(() => {
    const next = !motionOk();
    if (next === still) return;
    still = next;
    for (const a of actors) a.setStill(still);
    wake();
  }).observe(root, { attributes: true, attributeFilter: ['data-still'] });
}

const seen = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const actor = actorOf.get(entry.target);
      if (!actor) continue;
      actor.visible = entry.isIntersecting;
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).dataset.run = '';
        actor.measure();
        actor.onSeen();
        wake();
      } else {
        delete (entry.target as HTMLElement).dataset.run;
      }
    }
  },
  { rootMargin: '64px' },
);

const actorOf = new WeakMap<Element, Actor>();
const sized = new ResizeObserver((entries) => {
  for (const entry of entries) actorOf.get(entry.target)?.measure();
});

export function addActor(init: ActorInit): Actor {
  startDirector();
  const actor = new Actor(init);
  actors.add(actor);
  actorOf.set(init.root, actor);
  seen.observe(init.root);
  sized.observe(init.root);
  lastInput = performance.now();
  wake();
  return actor;
}

export function removeActor(actor: Actor) {
  actors.delete(actor);
  actorOf.delete(actor.root);
  seen.unobserve(actor.root);
  sized.unobserve(actor.root);
  delete actor.root.dataset.run;
  actor.destroy();
  if (playing.delete(actor)) bubbleToken.drop(actor.root);
  if (queued?.actor === actor) queued = null;
}

/** One performer at a time. A request that loses waits once, then gives up. */
export function perform(actor: Actor, action: CastAction, opts: PlayOptions = {}): boolean {
  if (paused) return false;
  const t = performance.now();
  const source = opts.source ?? 'event';
  if (!opts.force && !actor.canPlay(source, t)) return false;
  // Already performing: a click that follows the hover's run would start the move again over its own scheduled steps, and the first run's release would
  // hand the token on halfway through the second.
  if (playing.has(actor) && !opts.force) return false;
  // (r20bubbles) Off screen, a move is never seen, and it must not hold the site-wide token: How it works' first scene played Sochu's signature on
  // mount, far below the fold, and held the token for 2.5 s, so the hero's wave and Bolu's intro line (which waits 600 ms) never came.
  if (!actor.visible && !opts.force) return false;
  // The token is shared with speech bubbles. The actor's own bubble holds it under the same root, so a character can speak and move together.
  const took = actor.visible && bubbleToken.take(actor.root);
  // A hover is the visitor's own doing: it plays even while another character speaks, and it never queues behind one.
  if (!took && !opts.force && source !== 'hover') {
    queued ??= { actor, action, opts, at: t };
    return false;
  }
  actor.noteCooldown(source, t);
  playing.add(actor);
  let ms = actor.run(action, opts);
  // A hover's move starts with a small hop, so the answer reads at any size; the hop never plays under still.
  if (source === 'hover' && action === 'signature') ms = Math.max(ms, actor.run('hop', { small: true }));
  if (action === 'signature') glanceAt(actor);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    playing.delete(actor);
    if (took) bubbleToken.release(actor.root);
  };
  if (ms === 0) finish();
  else setTimeout(finish, ms);
  return true;
}

/** Let the others look at whoever is performing. */
function glanceAt(actor: Actor) {
  for (const a of actors) {
    if (a !== actor && a.visible && a.lod === 'full') a.lookAt(actor.root, 950);
  }
}

/** One group moment. The token is held for the group, so nothing interrupts it. */
export function ensemble(list: Actor[], action: CastAction, staggerMs: number, opts: PlayOptions = {}) {
  const took = bubbleToken.take(GROUP);
  if (!took && !opts.force) return false;
  let longest = 0;
  list.forEach((a, i) => {
    if (!a.visible) return;
    const delay = staggerMs * i;
    a.noteCooldown(opts.source ?? 'event', performance.now());
    const ms = delay + 650;
    longest = Math.max(longest, ms);
    if (delay === 0) a.run(action, opts);
    else setTimeout(() => a.run(action, opts), delay);
  });
  if (took) {
    if (longest === 0) bubbleToken.release(GROUP);
    else setTimeout(() => bubbleToken.release(GROUP), longest);
  }
  return true;
}

/** Have every visible character look at the same place. */
export function castLook(target: LookTarget, ms = 1200) {
  for (const a of actors) if (a.visible) a.lookAt(target, ms);
}

