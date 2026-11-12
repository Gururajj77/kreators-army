import { useScroll } from 'motion/react';
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref, type RefObject } from 'react';
import type { CastId } from '../cast';
import { INTERACTION, type CastLineKey } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { tieLastSpan } from '../lib/typo';
import { CastBubble, ChatAvatar, useCastLine } from './chat';

// Content visuals used on Home (visual §1.5): the interaction chain and the edit timeline (M9). The How we work, format-page and blog pieces
// (MechanismCard, MechanismChip, CreativeLoop, ControlSplit) live in components/demos, so their code and CSS stay out of the first download:
// import them from '../components/demos'.

function whenInView(el: Element, ratio: number, fn: () => void): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.intersectionRatio >= ratio || (e.isIntersecting && e.intersectionRect.height >= window.innerHeight * ratio))) {
        io.disconnect();
        fn();
      }
    },
    { threshold: [0, ratio] },
  );
  io.observe(el);
  return () => io.disconnect();
}

// ---------- InteractionChain ----------

export interface ChainHandle {
  /** Lights chip k and every chip before it. */
  light: (k: number) => void;
}

export interface InteractionChainProps {
  /** Default INTERACTION: Setup, Question, Participant, Follow-up, Reaction, Edit. */
  steps?: readonly string[];
  /** 'auto' lights left to right, 90 ms apart, when it enters view (How we work). 'controlled' waits for `lit` or ref.light(k) (Home: the thread drives it). */
  mode?: 'auto' | 'controlled';
  /** Controlled: how many chips are lit. */
  lit?: number;
  /** Auto: called once when the last chip lights (Tiko's "Setup. Question. Then I keep rolling." on How we work). */
  onLit?: () => void;
  /** An accessible name for the list, if the section needs one. */
  label?: string;
  className?: string;
  ref?: Ref<ChainHandle>;
}

const ARROW = (
  <svg className="chain-arrow" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Six pills with number discs, lit in order. All lit with no JS, a failed chunk or still; the effect only darkens them when motion is allowed.
 * Phones: no arrows, three to a row.
 */
export function InteractionChain({ steps = INTERACTION, mode = 'auto', lit, onLit, label, className, ref }: InteractionChainProps) {
  const list = useRef<HTMLOListElement>(null);
  const [count, setCount] = useState(steps.length);
  const [armed, setArmed] = useState(false);
  const done = useRef(onLit);
  done.current = onLit;

  useImperativeHandle(ref, () => ({ light: (k: number) => setCount((c) => Math.max(c, Math.min(steps.length, k + 1))) }), [steps.length]);

  useLayoutEffect(() => {
    if (!motionOk()) return;
    setArmed(true);
    setCount(0);
  }, []);

  useEffect(() => {
    const el = list.current;
    if (!armed || mode !== 'auto' || !el) return;
    const timers: number[] = [];
    const stop = whenInView(el, 0.6, () => {
      for (let k = 0; k < steps.length; k++) timers.push(window.setTimeout(() => setCount(k + 1), 90 * k));
      timers.push(window.setTimeout(() => done.current?.(), 90 * steps.length + 300));
    });
    return () => {
      stop();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [armed, mode, steps.length]);

  const shown = !armed ? steps.length : mode === 'controlled' && lit !== undefined ? Math.max(lit, count === steps.length ? 0 : count) : count;

  return (
    <ol ref={list} className={className ? `chain ${className}` : 'chain'} aria-label={label}>
      {steps.map((s, i) => (
        <li key={s} className="chain-step" data-lit={i < shown ? '' : undefined}>
          <span className="chain-pill">
            <span className="chain-num" aria-hidden>
              {i + 1}
            </span>
            <span className="chain-label">{s}</span>
          </span>
          {i < steps.length - 1 && ARROW}
        </li>
      ))}
    </ol>
  );
}

// ---------- EditTimeline (M9) ----------

export interface TimelineStep {
  name: string;
  body: string;
  /** The step's character, at 28 px at the clip's start. */
  who?: CastId;
  /** The line its character says as the playhead lands (once per page view). */
  lineKey?: CastLineKey;
}

export interface EditTimelineProps {
  steps: readonly TimelineStep[];
  /** 'stage': the playhead follows the scroll as the timeline passes up the screen, unpinned (Home #how-it-works). 'reveal': it crosses once, 600 ms a clip, at 50% in view. */
  mode: 'stage' | 'reveal';
  /** 'ink' is the dark editing plate (default); 'plate' sits on a light band. */
  tone?: 'ink' | 'plate';
  /** Called once as the playhead first lands on each clip (motion only). */
  onStep?: (k: number) => void;
  /** Called once when the playhead reaches the end, or, under still, when the timeline is first half in view. */
  onDone?: () => void;
  /** Stands on the plate's top edge, right: a character with its bubble (Gola on /trial#after). */
  aside?: ReactNode;
  /** Stage mode: drawn above the plate inside the pinned stage, given the active clip (Home's cast scenes). */
  scene?: (active: number) => ReactNode;
  /** Accessible name for the steps list. */
  label?: string;
  className?: string;
  /**
   * Stage mode (round 16): the scene walks left to right along the track as the page scrolls and stands over the active clip; scrolling back walks it
   * back. A click or tap on a clip or a step sends it there. Never pinned. Still: it stands on the active step, no walk.
   */
  travel?: boolean;
  /** With `travel`, phones only: the walker on a horizontal mini-track above the vertical list (the scene steps off there), given the active step. */
  mini?: (active: number) => ReactNode;
}

/**
 * Where the walker stands, in steps (0 to n - 1), for a scroll progress p. Each step owns 1/n of the scroll; the walker rests on a step for the middle
 * half of its share and walks the quarter either side of a boundary, so it settles on a step as that step lights. Monotonic in p.
 */
function travelAt(p: number, n: number): number {
  const u = p * n - 0.5;
  if (u <= 0) return 0;
  if (u >= n - 1) return n - 1;
  const k = Math.floor(u);
  const t = Math.min(1, Math.max(0, (u - k - 0.25) / 0.5));
  return k + t * t * t * (t * (t * 6 - 15) + 10);
}

interface Lane {
  box: HTMLElement;
  walker: HTMLElement;
  anchors: string;
  /** Anchor centres from the box's left edge, px. Empty while the lane is hidden. */
  c: number[];
  w: number;
  ww: number;
  /** The point of the walker that stands on the anchor: its `[data-lead]` figure's centre, else its own. */
  lead: number;
}

/** The lanes a travelling timeline walks: the scene over the clips (tablet and up), the mini-track over its dots (phones). */
const LANES: [box: string, walker: string, anchors: string][] = [
  ['.etl-scene', '.etl-walker', '.etl-track > .etl-clip'],
  ['.etl-mini-lane', '.etl-mini-walker', '.etl-mini-dot'],
];

/** Spring for the walk: SwiftUI response 0.55 s, damping 0.85 (a short settle onto the step). */
const WALK_K = (2 * Math.PI / 0.55) ** 2;
const WALK_C = 2 * 0.85 * (2 * Math.PI / 0.55);

/**
 * The walk itself: a spring on the walker's position in steps, painted as a translate per lane (transform only, no layout reads in the frame), with a
 * hop paced by the distance covered, a lean into the travel and a turn to face it. Measures on resize only. Returns `to(steps)`.
 */
function useTravel(on: boolean, root: RefObject<HTMLElement | null>) {
  const api = useRef<((s: number) => void) | null>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!on || !el) return;
    const lanes: Lane[] = [];
    for (const [b, w, anchors] of LANES) {
      const box = el.querySelector<HTMLElement>(b);
      const walker = el.querySelector<HTMLElement>(w);
      if (box && walker) lanes.push({ box, walker, anchors, c: [], w: 0, ww: 0, lead: 0 });
    }
    if (!lanes.length) return;
    let s = 0;
    let v = 0;
    let target = 0;
    let placed = false;
    let raf = 0;
    let last = 0;
    let phase = 0;
    let hop = 0;
    let lean = 0;
    let face = '';
    let turnBack = 0;

    const measure = () => {
      for (const l of lanes) {
        const r = l.box.getBoundingClientRect();
        l.w = r.width;
        l.ww = l.walker.offsetWidth;
        const lead = l.walker.querySelector('[data-lead]');
        l.lead = lead ? lead.getBoundingClientRect().left + lead.getBoundingClientRect().width / 2 - l.walker.getBoundingClientRect().left : l.ww / 2;
        l.c = r.width ? [...el.querySelectorAll<HTMLElement>(l.anchors)].map((a) => {
          const b = a.getBoundingClientRect();
          return b.left + b.width / 2 - r.left;
        }) : [];
      }
    };
    const setFace = (f: string) => {
      if (f === face) return;
      face = f;
      for (const l of lanes) {
        if (f) l.walker.dataset.face = f;
        else delete l.walker.dataset.face;
      }
    };
    const paint = () => {
      for (const l of lanes) {
        const n = l.c.length;
        if (!n) continue;
        const k = Math.min(n - 1, Math.max(0, Math.floor(s)));
        const k2 = Math.min(n - 1, k + 1);
        const centre = l.c[k]! + (l.c[k2]! - l.c[k]!) * Math.min(1, Math.max(0, s - k));
        const x = Math.max(0, Math.min(l.w - l.ww, centre - l.lead));
        l.walker.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        l.walker.style.setProperty('--etl-hop', hop.toFixed(3));
        l.walker.style.setProperty('--etl-lean', `${lean.toFixed(2)}deg`);
      }
    };
    const settle = () => {
      s = target;
      v = 0;
      hop = 0;
      lean = 0;
      paint();
      window.clearTimeout(turnBack);
      // At rest it turns back to face the visitor, so the pointer-following eyes read the right way round again.
      turnBack = window.setTimeout(() => setFace(''), motionOk() ? 520 : 0);
    };
    const frame = (now: number) => {
      raf = 0;
      if (!motionOk()) return settle();
      const dt = Math.min(0.034, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      v += (WALK_K * (target - s) - WALK_C * v) * dt;
      const ds = v * dt;
      s += ds;
      phase += Math.abs(ds);
      const speed = Math.abs(v);
      // Two hops a step, high only at walking pace, so it lands softly as it slows.
      hop = Math.abs(Math.sin(phase * 2 * Math.PI)) * Math.min(1, speed / 1.2);
      lean = Math.max(-7, Math.min(7, v * 5));
      if (speed > 0.08) {
        window.clearTimeout(turnBack);
        setFace(v > 0 ? 'right' : 'left');
      }
      if (Math.abs(target - s) < 0.0015 && speed < 0.02) return settle();
      paint();
      raf = requestAnimationFrame(frame);
    };
    api.current = (t: number) => {
      target = t;
      if (!placed || !motionOk()) {
        placed = true;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        return settle();
      }
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    measure();
    paint();
    const ro = new ResizeObserver(() => {
      measure();
      paint();
    });
    ro.observe(el);
    for (const l of lanes) ro.observe(l.walker);
    return () => {
      api.current = null;
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(turnBack);
    };
  }, [on, root]);
  return api;
}

const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (k: number) => `00:${pad(k * 5)}`;

/**
 * An editing timeline: a ruler, one rounded clip per step on a single track with its character at the start, a yellow playhead (red stays for actions),
 * and the steps as captions under it. Phones: a vertical list with a rail that fills as the dot travels. Still, no JS or a failed chunk: the playhead is
 * parked at the end, every clip lit, every caption visible, nothing pinned.
 */
export function EditTimeline({ steps, mode, tone = 'ink', onStep, onDone, aside, scene, label, className, travel = false, mini }: EditTimelineProps) {
  const root = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const n = steps.length;
  const [armed, setArmed] = useState(false);
  // Read once: crossing the breakpoint later keeps the first layout's behaviour, which stays correct either way.
  const [active, setActive] = useState(n - 1);
  const reached = useRef(new Set<number>());
  const finished = useRef(false);
  const cast = useCastLine();
  const whoRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cb = useRef({ onStep, onDone });
  cb.current = { onStep, onDone };

  const setP = useCallback((p: number) => {
    const el = root.current;
    if (el) el.style.setProperty('--p', p.toFixed(4));
  }, []);

  const land = useCallback(
    (k: number) => {
      setActive(k);
      if (reached.current.has(k)) return;
      reached.current.add(k);
      cb.current.onStep?.(k);
      const key = steps[k]?.lineKey;
      const by = whoRefs.current[k];
      if (key) void cast.say(key, { by });
      if (k === n - 1 && !finished.current) {
        finished.current = true;
        window.setTimeout(() => cb.current.onDone?.(), 400);
      }
    },
    [cast, n, steps],
  );

  useLayoutEffect(() => {
    if (!motionOk()) return;
    setArmed(true);
    setActive(-1);
    setP(0);
  }, [setP]);

  // Under still the end state shows; onDone still tells the page when the timeline is in view.
  useEffect(() => {
    const el = root.current;
    if (armed || !el) return;
    return whenInView(el, 0.5, () => {
      if (!finished.current) {
        finished.current = true;
        cb.current.onDone?.();
      }
    });
  }, [armed]);

  // Reveal: the playhead crosses once, clip by clip.
  useEffect(() => {
    const el = root.current;
    if (!armed || !el || mode !== 'reveal') return;
    const timers: number[] = [];
    const stop = whenInView(el, 0.5, () => {
      for (let k = 0; k < n; k++)
        timers.push(
          window.setTimeout(() => {
            setP((k + 1) / n);
            land(k);
          }, 600 * k + 120),
        );
    });
    return () => {
      stop();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [armed, mode, n, land, setP]);

  // Stage: the playhead follows the scroll as the timeline itself passes up the screen, at every width. Never pinned (home11): a pinned stage held the
  // page still under the visitor's scroll, which read as the page being stuck.
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start 75%', 'end 60%'] });
  const walking = travel && mode === 'stage';
  const walkTo = useTravel(walking, root);
  // A clicked step holds until the visitor scrolls on by more than a little; then the scroll leads again.
  const held = useRef<{ k: number; y: number } | null>(null);
  useEffect(() => {
    if (!armed || mode !== 'stage') return;
    const apply = (v: number) => {
      if (held.current) {
        if (Math.abs(window.scrollY - held.current.y) < 80) return;
        held.current = null;
      }
      const p = Math.min(1, Math.max(0, v));
      setP(p);
      const k = p <= 0 ? -1 : Math.min(n - 1, Math.floor(p * n - 1e-6));
      if (k >= 0) land(k);
      else setActive(-1);
      const at = travelAt(p, n);
      walkTo.current?.(at);
      // When the scroll comes to rest mid-walk, the walker finishes the walk onto the step that is lit (the nearer one: the boundary is the half-way point).
      window.clearTimeout(idle);
      if (at !== Math.round(at)) idle = window.setTimeout(() => walkTo.current?.(Math.round(at)), 180);
    };
    let idle = 0;
    apply(scrollYProgress.get());
    const stop = scrollYProgress.on('change', apply);
    return () => {
      stop();
      window.clearTimeout(idle);
    };
  }, [armed, mode, n, land, setP, scrollYProgress, walkTo]);

  // Still (or before arming): the walker stands on the step that shows, the last one.
  useEffect(() => {
    if (!walking || armed || motionOk()) return;
    walkTo.current?.(n - 1);
  }, [walking, armed, n, walkTo]);

  const goTo = useCallback(
    (k: number) => {
      if (!walking) return;
      if (armed) {
        held.current = { k, y: window.scrollY };
        setP((k + 0.5) / n);
        land(k);
      } else setActive(k);
      walkTo.current?.(k);
    },
    [walking, armed, n, land, setP, walkTo],
  );

  const lit = (k: number) => !armed || k <= active;
  const shown = armed || walking ? active : n - 1;

  return (
    <div
      ref={root}
      className={className ? `etl ${className}` : 'etl'}
      data-mode={mode}
      data-tone={tone}
      data-armed={armed ? '' : undefined}
      data-many={n >= 6 ? '' : undefined}
      data-travel={walking ? '' : undefined}
      style={{ '--n': n, '--cols': Math.ceil(n / 2), '--p': 1 } as CSSProperties}
    >
      <div ref={stage} className="etl-stage">
        <div className="etl-sticky">
          {scene && (
            <div className="etl-scene">
              {walking ? <div className="etl-walker">{scene(shown)}</div> : scene(shown)}
            </div>
          )}
          <div ref={plate} className="etl-plate" data-bubble-bounds="">
            {aside && <div className="etl-aside">{aside}</div>}
            <div className="etl-ruler" aria-hidden>
              {Array.from({ length: n + 1 }, (_, k) => (
                <span key={k} style={{ '--k': k / n } as CSSProperties}>
                  {timecode(k)}
                </span>
              ))}
            </div>
            <div className="etl-track" aria-hidden>
              {steps.map((s, k) => (
                <span
                  key={s.name}
                  className="etl-clip"
                  data-lit={lit(k) ? '' : undefined}
                  data-now={armed && k === active ? '' : undefined}
                  data-who={s.who}
                  onClick={walking ? () => goTo(k) : undefined}
                >
                  {s.who && (
                    <span className="etl-who" ref={(el) => void (whoRefs.current[k] = el)}>
                      <ChatAvatar who={s.who} size={28} />
                      {s.lineKey && <CastBubble {...cast.bubble(s.lineKey)} side={k === 0 ? 'start' : k === n - 1 ? 'end' : 'center'} />}
                    </span>
                  )}
                  <span className="etl-clip-name">{s.name}</span>
                </span>
              ))}
              <span className="etl-head">
                <span className="etl-cap" />
              </span>
            </div>
            {walking && mini && (
              <div className="etl-mini" aria-hidden>
                <div className="etl-mini-lane">
                  <span className="etl-mini-dots">
                    {steps.map((s, k) => (
                      <span key={s.name} className="etl-mini-dot" data-lit={lit(k) ? '' : undefined} onClick={() => goTo(k)} />
                    ))}
                  </span>
                  <div className="etl-mini-walker">{mini(shown)}</div>
                </div>
              </div>
            )}
            <div className="etl-list">
              <span className="etl-rail" aria-hidden>
                <span className="etl-rail-fill" />
                <span className="etl-rail-dot-track">
                  <span className="etl-rail-dot" />
                </span>
              </span>
              <ol className="etl-steps" aria-label={label}>
                {steps.map((s, k) => (
                  <li
                    key={s.name}
                    className="etl-step"
                    data-lit={lit(k) ? '' : undefined}
                    data-now={armed && k === active ? '' : undefined}
                    onClick={walking ? () => goTo(k) : undefined}
                  >
                    <span className="etl-step-num" aria-hidden>
                      {k + 1}
                    </span>
                    <h3 className="etl-step-name">{tieLastSpan(s.name)}</h3>
                    <p className="etl-step-body">{tieLastSpan(s.body)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
