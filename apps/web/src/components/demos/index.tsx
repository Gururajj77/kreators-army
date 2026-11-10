import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Character, type CastId, type CharacterHandle } from '../../cast';
import { LOOP, WE_CANNOT, WE_CONTROL, type Mechanism } from '../../lib/content';
import { finePointer, motionOk } from '../../lib/motionOk';
import { CastBubble, useCastLine } from '../chat';
import { MechanismArt } from './art';
import './demos.css';

// The How we work, format-page and blog visuals (visual §1.5): mechanism cards and chips with their tiny demos, the creative loop and the control
// split. Their code and CSS load with the pages that use them, never in the first download. Import from '../components/demos'.

export { MechanismArt } from './art';

export type CastTone = CastId;
const TONES: CastTone[] = ['sochu', 'bolu', 'tiko', 'gola'];

/** The tone a card takes by its place in a list: the four cast colours, cycling. */
export const toneAt = (i: number): CastTone => TONES[i % TONES.length] as CastTone;

const PLAY_MS = 1650;

function inView(el: Element, ratio: number, fn: () => void, rootMargin = '0px'): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.intersectionRatio >= ratio || (e.isIntersecting && e.intersectionRect.height >= window.innerHeight * ratio))) {
        io.disconnect();
        fn();
      }
    },
    { threshold: [0, ratio], rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

// On touch, one demo plays at a time: the card nearest the middle of the screen, once, as it arrives there.
let touchPlaying = false;

/** Plays a demo once on its host: sets data-play, then clears it after the demo, so the next hover can play it again. */
function useDemo(host: React.RefObject<HTMLElement | null>, touchOnView: boolean) {
  const timer = useRef(0);
  const play = useCallback(() => {
    const el = host.current;
    if (!el || !motionOk() || el.hasAttribute('data-play')) return;
    el.setAttribute('data-play', '');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => el.removeAttribute('data-play'), PLAY_MS);
  }, [host]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const el = host.current;
    if (!touchOnView || !el || finePointer() || !motionOk()) return;
    // The middle fifth of the screen: whichever card reaches it first plays, if nothing else is playing.
    return inView(
      el,
      0.01,
      () => {
        if (touchPlaying) return;
        touchPlaying = true;
        play();
        window.setTimeout(() => (touchPlaying = false), PLAY_MS);
      },
      '-40% 0px -40% 0px',
    );
  }, [host, touchOnView, play]);

  const hover = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') play();
    },
    onFocus: play,
  };
  return { play, hover };
}

export interface MechanismCardProps {
  name: Mechanism;
  /** The disc's colour. Default by nothing: pass toneAt(i) to cycle the four. */
  tone: CastTone;
  /** 'card' (How we work ch. 2): a plate with a 56 px disc and the name. 'chip' (format pages, blog): a pill with a 20 px frame. */
  size?: 'card' | 'chip';
  /** The element. Default 'div'; pass 'li' inside a list. */
  as?: 'div' | 'li';
  /** A chip that links (to /how-we-work) is focusable, and focus plays its demo too. */
  to?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A mechanism with its demo. Desktop: hover (and focus, for a linked chip) plays it once and the card lifts 2 px. Touch: cards play one at a time as
 * they reach the middle of the screen; chips stay still. Still: the static end frame.
 */
export function MechanismCard({ name, tone, size = 'card', as: Tag = 'div', to, className, style }: MechanismCardProps) {
  const host = useRef<HTMLElement | null>(null);
  const { hover } = useDemo(host, size === 'card');
  const cls = `${size === 'card' ? 'mech-card' : 'mech-chip'}${className ? ` ${className}` : ''}`;
  const inner =
    size === 'card' ? (
      <>
        <span className="mech-disc" aria-hidden>
          <MechanismArt name={name} />
        </span>
        <span className="mech-name h4">{name}</span>
      </>
    ) : (
      <>
        <span className="mech-frame" aria-hidden>
          <MechanismArt name={name} />
        </span>
        <span className="mech-name">{name}</span>
      </>
    );
  if (to)
    return (
      <Tag className="mech-item" style={style}>
        <Link ref={(el) => void (host.current = el)} to={to} className={cls} data-tone={tone} {...hover}>
          {inner}
        </Link>
      </Tag>
    );
  return (
    <Tag ref={(el: HTMLElement | null) => void (host.current = el)} className={cls} data-tone={tone} style={style} {...hover}>
      {inner}
    </Tag>
  );
}

/** The chip form of MechanismCard: a pill with a 20 px static frame; hover or focus plays the demo. */
export function MechanismChip(props: Omit<MechanismCardProps, 'size'>) {
  return <MechanismCard {...props} size="chip" />;
}

// ---------- CreativeLoop ----------

export interface CreativeLoopProps {
  /** Default LOOP: Hypothesis, Interaction, Production, Edit, Learn, Improve. */
  steps?: readonly string[];
  /** Under the ring: "Every batch teaches us what resonates, so the next one is stronger." (the page's own copy). */
  caption?: ReactNode;
  /** Sochu, in the middle, says this when the lap ends. Default 'hww.loop'; null for none. */
  line?: 'hww.loop' | null;
  className?: string;
}

// The dot's lap: 0 to 312 degrees in 3.6 s on an ease-in-out cubic, from Hypothesis round past Improve to the start of the way back, where it rests
// beside the arrow rather than on a label. Node k lights as the dot passes it (at k x 60 degrees).
const LAP_MS = 3600;
const LAP_DEG = 312;
const easeInverse = (f: number) => (f < 0.5 ? Math.cbrt(f / 4) : 1 - Math.cbrt(2 * (1 - f)) / 2);

/**
 * Six nodes on a ring, a static arrow from Improve back to Hypothesis, and a dot that travels the ring once on first view, tinting each node as it
 * passes. Sochu stands in the middle. Still: the end state, every node tinted. The SVG and the nodes are aria-hidden; a visually hidden list reads.
 */
export function CreativeLoop({ steps = LOOP, caption, line = 'hww.loop', className }: CreativeLoopProps) {
  const root = useRef<HTMLElement>(null);
  const sochu = useRef<CharacterHandle>(null);
  const [armed, setArmed] = useState(false);
  const [lit, setLit] = useState(steps.length);
  const [run, setRun] = useState(false);
  const cast = useCastLine();
  const n = steps.length;

  useLayoutEffect(() => {
    if (!motionOk()) return;
    setArmed(true);
    setLit(0);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!armed || !el) return;
    const timers: number[] = [];
    const stop = inView(el, 0.6, () => {
      setRun(true);
      for (let k = 0; k < n; k++) timers.push(window.setTimeout(() => setLit(k + 1), Math.round(easeInverse(((360 / n) * k) / LAP_DEG) * LAP_MS)));
      timers.push(
        window.setTimeout(() => {
          if (line) void cast.say(line, { by: sochu.current });
        }, LAP_MS + 150),
      );
    });
    return () => {
      stop();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [armed, n, line, cast]);

  // Still (or no motion): no lap, but the line still shows once on view, without movement (content §9.1), as ControlSplit's does.
  useEffect(() => {
    const el = root.current;
    if (armed || !line || !el) return;
    let timer = 0;
    const stop = inView(el, 0.6, () => {
      timer = window.setTimeout(() => void cast.say(line, { by: sochu.current }), 200);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [armed, line, cast]);

  return (
    <figure ref={root} className={className ? `loop ${className}` : 'loop'} data-armed={armed ? '' : undefined} data-run={run ? '' : undefined} style={{ '--n': n } as CSSProperties}>
      <div className="loop-ring" aria-hidden data-bubble-bounds="">
        <svg className="loop-svg" viewBox="-6 -6 212 212" focusable="false">
          <circle className="loop-track" cx="100" cy="100" r="100" />
          {/* The way back: Improve (300°) round to Hypothesis (360°), with its arrowhead. */}
          <path className="loop-back" d="M25.7 33.1 A100 100 0 0 1 59.3 8.6" />
          <path className="loop-back-head" d="M58.4 13.9 L63.6 6.7 L54.8 5.7 Z" />
        </svg>
        {steps.map((s, k) => (
          <span key={s} className="loop-node" data-lit={k < lit ? '' : undefined} style={{ '--a': `${(360 / n) * k}deg` } as CSSProperties}>
            <span className="loop-node-pill">{s}</span>
          </span>
        ))}
        <div className="loop-orbit">
          <span className="loop-dot" />
        </div>
        <span className="loop-centre">
          <Character ref={sochu} who="sochu" size="var(--loop-cast)" expression="happy">
            {line && <CastBubble {...cast.bubble(line)} />}
          </Character>
        </span>
      </div>
      <ol className="sr-only">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {caption && <figcaption className="loop-caption">{caption}</figcaption>}
    </figure>
  );
}

// ---------- ControlSplit ----------

export interface ControlSplitProps {
  /** Default WE_CONTROL (eight lines). */
  control?: readonly string[];
  /** Default WE_CANNOT. */
  cannot?: string;
  /** The line under both plates (the page's own copy). */
  foot?: ReactNode;
  /** Heading level of the two plate titles. Default 'h3'. */
  headingAs?: 'h3' | 'h4';
  className?: string;
}

/**
 * "We control" (eight lines whose checks pop in order on view, 60 ms apart) beside "We can't control" on an ink plate, where Bolu stands and says
 * "I can't script a stranger. I can set up a moment." once. Phones: stacked, Bolu at 80.
 */
export function ControlSplit({ control = WE_CONTROL, cannot = WE_CANNOT, foot, headingAs: Heading = 'h3', className }: ControlSplitProps) {
  const list = useRef<HTMLUListElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const bolu = useRef<CharacterHandle>(null);
  const [armed, setArmed] = useState(false);
  const [ticked, setTicked] = useState(true);
  const cast = useCastLine();

  useLayoutEffect(() => {
    if (!motionOk()) return;
    setArmed(true);
    setTicked(false);
  }, []);

  useEffect(() => {
    const el = list.current;
    if (!armed || !el) return;
    return inView(el, 0.5, () => setTicked(true));
  }, [armed]);

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    let timer = 0;
    const stop = inView(el, 0.6, () => {
      timer = window.setTimeout(() => void cast.say('hww.cannot', { by: bolu.current }), armed ? 60 * control.length + 500 : 200);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [armed, cast, control.length]);

  return (
    <div className={className ? `split ${className}` : 'split'}>
      <div className="split-plate split-control" data-armed={armed ? '' : undefined} data-ticked={ticked ? '' : undefined}>
        <Heading className="split-title">We control</Heading>
        <ul ref={list} className="split-list">
          {control.map((c, i) => (
            <li key={c} style={{ '--i': i } as CSSProperties}>
              <svg className="split-check" viewBox="0 0 24 24" aria-hidden focusable="false">
                <circle cx="12" cy="12" r="11" />
                <path d="M7 12.4l3.3 3.3L17 9" />
              </svg>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
      <div ref={plate} className="split-plate split-cannot" data-bubble-bounds="">
        <Heading className="split-title">We can't control</Heading>
        <p className="split-cannot-text h3">{cannot}</p>
        <span className="split-bolu">
          <Character ref={bolu} who="bolu" size="var(--split-cast)" expression="talking">
            <CastBubble {...cast.bubble('hww.cannot')} side="end" />
          </Character>
        </span>
      </div>
      {foot && <p className="split-foot">{foot}</p>}
    </div>
  );
}
