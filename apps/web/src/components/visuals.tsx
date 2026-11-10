import { useScroll } from 'motion/react';
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import type { CastId } from '../cast';
import { INTERACTION, type CastLineKey } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { CastBubble, ChatAvatar, useCastLine } from './chat';

// Content visuals used on Home (visual §1.5): the interaction chain and the edit timeline (M9). The How we work, format-page and blog pieces
// (MechanismCard, MechanismChip, CreativeLoop, ControlSplit) live in components/demos, so their code and CSS stay out of the first download:
// import them from '../components/demos'.

const PHONE = '(max-width: 734px)';

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
  /** 'stage': the playhead follows the scroll through a 160 vh pinned stage (Home #how-it-works). 'reveal': it crosses once, 600 ms a clip, at 50% in view. */
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
}

const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (k: number) => `00:${pad(k * 5)}`;

/**
 * An editing timeline: a ruler, one rounded clip per step on a single track with its character at the start, a yellow playhead (red stays for actions),
 * and the steps as captions under it. Phones: a vertical list with a rail that fills as the dot travels. Still, no JS or a failed chunk: the playhead is
 * parked at the end, every clip lit, every caption visible, nothing pinned.
 */
export function EditTimeline({ steps, mode, tone = 'ink', onStep, onDone, aside, scene, label, className }: EditTimelineProps) {
  const root = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const n = steps.length;
  const [armed, setArmed] = useState(false);
  // Read once: crossing the breakpoint later keeps the first layout's behaviour, which stays correct either way.
  const [phone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE).matches);
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

  // Stage: the playhead follows the scroll. Desktop pins it in a 160 vh stage; phones follow the list itself, unpinned.
  const { scrollYProgress } = useScroll({ target: stage, offset: phone ? ['start 75%', 'end 60%'] : ['start start', 'end end'] });
  useEffect(() => {
    if (!armed || mode !== 'stage') return;
    const apply = (v: number) => {
      const p = Math.min(1, Math.max(0, phone ? v : v * 1.12));
      setP(p);
      const k = p <= 0 ? -1 : Math.min(n - 1, Math.floor(p * n - 1e-6));
      if (k >= 0) land(k);
      else setActive(-1);
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on('change', apply);
  }, [armed, mode, phone, n, land, setP, scrollYProgress]);

  const lit = (k: number) => !armed || k <= active;

  return (
    <div
      ref={root}
      className={className ? `etl ${className}` : 'etl'}
      data-mode={mode}
      data-tone={tone}
      data-armed={armed ? '' : undefined}
      style={{ '--n': n, '--p': 1 } as CSSProperties}
    >
      <div ref={stage} className="etl-stage">
        <div className="etl-sticky">
          {scene && <div className="etl-scene">{scene(armed ? active : n - 1)}</div>}
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
                <span key={s.name} className="etl-clip" data-lit={lit(k) ? '' : undefined} data-now={armed && k === active ? '' : undefined} data-who={s.who}>
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
            <div className="etl-list">
              <span className="etl-rail" aria-hidden>
                <span className="etl-rail-fill" />
                <span className="etl-rail-dot-track">
                  <span className="etl-rail-dot" />
                </span>
              </span>
              <ol className="etl-steps" aria-label={label}>
                {steps.map((s, k) => (
                  <li key={s.name} className="etl-step" data-lit={lit(k) ? '' : undefined} data-now={armed && k === active ? '' : undefined}>
                    <span className="etl-step-num" aria-hidden>
                      {k + 1}
                    </span>
                    <h3 className="etl-step-name">{s.name}</h3>
                    <p className="etl-step-body">{s.body}</p>
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
