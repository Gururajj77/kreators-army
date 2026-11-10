import type { Video } from '@kreators/shared';
import { useCallback, useEffect, useInsertionEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router';
import { bubbleToken, Character, type CastId, type CharacterHandle, type Expression, type TokenOwner } from '../cast';
import { BODY_COLOR, RestFace, insertCoreDefs } from '../cast/rest';
import { CAST_LINES, castById, faqBySlug, type CastLineKey } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { VideoFrame } from './frames';
import type { ChainHandle } from './visuals';

// The speech-bubble family (visual §1.1, motion M3): one look for everything that talks. Thread and FAQ bubbles are real content, in the DOM from the
// first paint and read once by screen readers. Cast bubbles are aria-hidden flavour: one on screen site-wide, through the token the director's
// performances share (cast/stage.ts). Red never appears in a bubble.

export type Speaker = CastId | 'you' | 'company';

const LABEL: Record<Speaker, string> = { bolu: 'Bolu', tiko: 'Tiko', gola: 'Gola', sochu: 'Sochu', you: 'You', company: 'Kreators.Army' };

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

// ---------- ChatBubble ----------

export interface ChatBubbleProps {
  who: Speaker;
  /** The name row. Default: the cast name, 'You' or 'Kreators.Army'. false hides it. */
  label?: ReactNode | false;
  /** The words: real text. */
  children: ReactNode;
  /** 'md' 17/23 600 for the thread and the visitor; 'sm' 15/20 600 for cast bubbles. Company answers are always 17/25 400. */
  size?: 'md' | 'sm';
  /** 'p' for a one-line bubble; 'div' when the words hold blocks (a paragraph and a link). */
  as?: 'p' | 'div';
  className?: string;
  /** Hidden from screen readers (a repeated question whose button already says it). */
  hidden?: boolean;
}

/** A speech bubble: the speaker's colour, radius 22 with a 6 px tucked corner on the speaker's side. */
export function ChatBubble({ who, label, children, size = 'md', as: Tag = 'p', className, hidden }: ChatBubbleProps) {
  const Text = Tag === 'p' ? 'span' : 'div';
  return (
    <Tag className={className ? `bubble ${className}` : 'bubble'} data-who={who} data-size={size} aria-hidden={hidden || undefined}>
      {label !== false && <span className="bubble-label">{label ?? LABEL[who]}</span>}
      <Text className="bubble-text">{children}</Text>
    </Tag>
  );
}

// ---------- ChatAvatar ----------

export type ChatAvatarProps = ({ who: CastId | 'mark'; poster?: undefined } | { poster: string | null; who?: undefined }) & { size?: 28 | 36 | 44; className?: string };

/**
 * A disc beside a bubble. A cast member's plate and rest face cropped to the face; the Kreators.Army mark; or a reply's own poster (the participant, not a
 * mascot). Always aria-hidden. Sets --k-ink itself: the rest face's strokes read it, and only .k-char defines it otherwise.
 */
export function ChatAvatar(props: ChatAvatarProps) {
  useInsertionEffect(insertCoreDefs, []);
  const size = props.size ?? 36;
  const style = { '--av': `${size}px` } as CSSProperties;
  const cls = props.className ? `chat-avatar ${props.className}` : 'chat-avatar';
  if (props.who === undefined) {
    return (
      <span className={cls} data-who="poster" style={style} aria-hidden>
        {props.poster ? <img className="chat-avatar-photo" src={props.poster} alt="" width={size} height={size} loading="lazy" decoding="async" draggable={false} /> : null}
      </span>
    );
  }
  if (props.who === 'mark') {
    return (
      <span className={cls} data-who="mark" style={style} aria-hidden>
        <img src="/logo.png" alt="" width={size} height={size} decoding="async" draggable={false} />
      </span>
    );
  }
  return (
    <span className={cls} data-who={props.who} style={style} aria-hidden>
      <span className="chat-avatar-art">
        <img src={`/cast/${props.who}.svg`} alt="" width={480} height={480} decoding="async" draggable={false} />
        <RestFace who={props.who} gloss={false} />
      </span>
    </span>
  );
}

// ---------- Typing ----------

/** Three dots in the speaker's bubble, only where a bubble is about to arrive. They move only under an ancestor with [data-run], and never under still. */
export function Typing({ who }: { who: Speaker }) {
  return (
    <span className="bubble typing" data-who={who} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

// ---------- CastBubble ----------

export interface CastBubbleProps {
  who: CastId;
  /** At most 60 characters, from CAST_LINES. */
  line: string;
  /** Controlled. useCastLine().bubble(key) gives who, line and show. */
  show: boolean;
  /** 'center' (default) sits over the head; 'start' and 'end' anchor to the character's left or right edge. */
  side?: 'center' | 'start' | 'end';
  /** 'plate' forces the plate style. It is automatic inside a [data-tone] tile of the speaker's own colour. */
  tone?: 'speaker' | 'plate';
  className?: string;
}

const TAIL_SHARE = { center: 0.5, start: 0.28, end: 0.72 } as const;
const GUTTER = 12;

/**
 * Keeps a bubble inside its bounds: the nearest [data-bubble-bounds] ancestor, else the viewport, with a 12 px gutter. It shifts the bubble by the
 * overflow (the `translate` property, through --shift) and moves the tail back so it still points at the head, 18 px from either end at most.
 * Measured from layout (offsetLeft, offsetWidth), not from the box, which is mid-transition when this runs.
 */
function place(b: HTMLElement, side: keyof typeof TAIL_SHARE) {
  b.style.removeProperty('--shift');
  b.style.removeProperty('--tail-x');
  const parent = b.offsetParent as HTMLElement | null;
  if (!parent) return;
  const w = b.offsetWidth;
  const pr = parent.getBoundingClientRect();
  const left = pr.left + b.offsetLeft - (side === 'center' ? w / 2 : 0);
  const host = b.closest('[data-bubble-bounds]');
  const box = host ? host.getBoundingClientRect() : { left: 0, right: document.documentElement.clientWidth };
  let shift = 0;
  if (left < box.left + GUTTER) shift = box.left + GUTTER - left;
  else if (left + w > box.right - GUTTER) shift = box.right - GUTTER - (left + w);
  if (!shift) return;
  const tail = Math.max(18, Math.min(w - 18, TAIL_SHARE[side] * w - shift));
  b.style.setProperty('--shift', `${Math.round(shift)}px`);
  b.style.setProperty('--tail-x', `${Math.round(tail)}px`);
}

/** A line over a character's head, inside its .k-char box (render it as the Character's child). aria-hidden, never focusable, pointer-events none. */
export function CastBubble({ who, line, show, side = 'center', tone, className }: CastBubbleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const was = useRef(show);
  const [leaving, setLeaving] = useState(false);
  useLayoutEffect(() => {
    if (show && ref.current) place(ref.current, side);
  }, [show, side, line]);
  // The leave lifts 4 px while it fades; the next arrival starts from below again.
  useEffect(() => {
    const left = was.current && !show;
    was.current = show;
    if (!left) return;
    setLeaving(true);
    const t = window.setTimeout(() => setLeaving(false), 220);
    return () => window.clearTimeout(t);
  }, [show]);
  return (
    <span
      ref={ref}
      data-out={leaving && !show ? '' : undefined}
      className={className ? `cast-bubble bubble ${className}` : 'cast-bubble bubble'}
      data-who={who}
      data-side={side === 'center' ? undefined : side}
      data-plate={tone === 'plate' ? '' : undefined}
      data-show={show ? '' : undefined}
      style={{ '--dot': BODY_COLOR[who] } as CSSProperties}
      aria-hidden
    >
      <span className="bubble-label">{castById(who).name}</span>
      <span className="bubble-text">{line}</span>
    </span>
  );
}

// ---------- useCastLine ----------

/** How long a line stays up: about 900 ms plus 45 ms a character, between 1.8 and 4 s (C18). */
export const dwellOf = (line: string) => Math.max(1800, Math.min(4000, 900 + 45 * line.length));

// Each key shows once per page view. A new path is a new page view.
const said = new Set<CastLineKey>();
let saidPath = '';
const alreadySaid = (key: CastLineKey) => {
  const path = typeof location === 'undefined' ? '' : location.pathname;
  if (path !== saidPath) {
    said.clear();
    saidPath = path;
  }
  return said.has(key);
};

const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
};

export interface SayOptions {
  /** The speaking character: its handle (for the expression) or its element. It must be on screen, and its own performance shares the token with it. */
  by?: CharacterHandle | HTMLElement | null;
  /** The face that goes with the line, held for the dwell. Default 'talking' for Bolu, none for the others. null for none. */
  expression?: Expression | null;
  /** A sequence's own token owner (the 404 interview takes the token once for its whole run and says each line under it). */
  owner?: TokenOwner;
  /** Resolve when the bubble has gone, not when it appears (for sequences). */
  untilGone?: boolean;
  /** Show it again even if it was said on this page view (the kit only). */
  again?: boolean;
}

export interface CastLine {
  /** Shows a line. Resolves false if it was said before on this page view, the speaker is off screen, a dialog is open, or the token stays busy for 600 ms. */
  say: (key: CastLineKey, options?: SayOptions) => Promise<boolean>;
  /** Props for the bubble of `key`: spread into <CastBubble {...cast.bubble(key)} />. */
  bubble: (key: CastLineKey) => Pick<CastBubbleProps, 'who' | 'line' | 'show'>;
  /** The key on screen now, if any. */
  shown: CastLineKey | null;
  /** Takes the bubble down now. */
  hide: () => void;
}

/**
 * The cast's lines for one component. Render each bubble as <CastBubble {...cast.bubble(key)} /> inside its Character, and call cast.say(key, { by })
 * on the trigger (hover, focus, tap, view). One bubble on screen site-wide; each line once per page view; the dwell from dwellOf. Under still the
 * bubble shows and hides with opacity only, for the same dwell.
 */
export function useCastLine(): CastLine {
  const [shown, setShown] = useState<CastLineKey | null>(null);
  const self = useRef<TokenOwner>({ cast: true });
  const live = useRef<{ mounted: boolean; timer: number; owner: TokenOwner | null; done: (() => void) | null }>({ mounted: true, timer: 0, owner: null, done: null });

  const takeDown = useCallback(() => {
    const l = live.current;
    window.clearTimeout(l.timer);
    if (l.owner) bubbleToken.release(l.owner);
    l.owner = null;
    const done = l.done;
    l.done = null;
    done?.();
  }, []);

  useEffect(() => {
    const l = live.current;
    l.mounted = true;
    return () => {
      l.mounted = false;
      takeDown();
    };
  }, [takeDown]);

  const say = useCallback(
    async (key: CastLineKey, options: SayOptions = {}) => {
      const { who, line } = CAST_LINES[key];
      if (!options.again && alreadySaid(key)) return false;
      if (document.visibilityState === 'hidden' || document.querySelector('dialog[open]')) return false;
      const by = options.by ?? null;
      const handle = by && !(by instanceof HTMLElement) ? by : null;
      const el = by instanceof HTMLElement ? by : (handle?.el() ?? null);
      if (el && !onScreen(el)) return false;
      const owner = options.owner ?? el ?? self.current;
      if (!(await bubbleToken.wait(owner, 600))) return false;
      if (!live.current.mounted) {
        bubbleToken.release(owner);
        return false;
      }
      // One bubble per component: a new line replaces this component's last one.
      takeDown();
      said.add(key);
      const ms = dwellOf(line);
      const l = live.current;
      l.owner = owner;
      setShown(key);
      const expression = options.expression === undefined ? (who === 'bolu' ? 'talking' : null) : options.expression;
      if (handle && expression) handle.setExpression(expression, { hold: ms });
      const gone = new Promise<void>((resolve) => {
        l.done = resolve;
      });
      l.timer = window.setTimeout(() => {
        setShown((s) => (s === key ? null : s));
        takeDown();
      }, ms);
      if (options.untilGone) await gone;
      return true;
    },
    [takeDown],
  );

  const hide = useCallback(() => {
    setShown(null);
    takeDown();
  }, [takeDown]);

  const bubble = useCallback((key: CastLineKey) => ({ who: CAST_LINES[key].who as CastId, line: CAST_LINES[key].line as string, show: shown === key }), [shown]);

  return useMemo(() => ({ say, bubble, shown, hide }), [say, bubble, shown, hide]);
}

// ---------- ChatThread (Home #interaction) ----------

export interface ChatThreadProps {
  /** INTERACTION_THREAD resolved against the library; a missing video drops its pair. */
  pairs: { question: string; video: Video }[];
  /** Default 'bolu'. */
  asker?: CastId;
  /** Lights the chain in step with the thread: the six chips spread evenly from 150 ms to the last answer (chainAt). */
  chain?: RefObject<ChainHandle | null>;
  /** useVideoPlayer().open */
  onOpen: (v: Video) => void;
  /** "Real questions we've filmed". */
  label: string;
  className?: string;
}

/** The thread's cadence in ms: typing dots, then the question; the answer after it; the pause before the next pair. About 1 s a pair. */
export const THREAD_BEAT = { typing: 350, answer: 350, next: 350 } as const;
const PAIR_MS = THREAD_BEAT.typing + THREAD_BEAT.answer + THREAD_BEAT.next;
/** When the last answer of an n-pair thread arrives, from the start: 3.85 s for four pairs. */
export const threadSpan = (n: number) => Math.max(0, n - 1) * PAIR_MS + THREAD_BEAT.typing + THREAD_BEAT.answer;
/** When chip k (0 to 5) of the chain lights for an n-pair thread: evenly from 150 ms to the last answer. */
export const chainAt = (k: number, n: number) => Math.round(150 + ((threadSpan(n) - 150) * k) / 5);

/**
 * Four real questions, each answered by its real video. Every bubble is in the DOM, visible, from the first paint; an effect marks the ones still to
 * come (data-wait) only when motion is allowed, so no JS, a failed chunk or still mode shows the whole thread. A waiting bubble is a faint outline of
 * itself, holding its place, never a blank. It plays once per page view, starting as the thread's top enters the lower 85% of the viewport (at every
 * width), about 1 s a pair, and completes at once if the thread leaves the viewport mid-way or a reply takes keyboard focus. No live region.
 */
export function ChatThread({ pairs, asker = 'bolu', chain, onOpen, label, className }: ChatThreadProps) {
  const list = useRef<HTMLOListElement>(null);
  const n = pairs.length;
  // How far the sequence has got: questions shown, answers shown, the pair whose typing dots are up. Armed means "ghost what has not arrived yet".
  const [armed, setArmed] = useState(false);
  const [asked, setAsked] = useState(n);
  const [answered, setAnswered] = useState(n);
  const [typing, setTyping] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const run = useRef({ started: false, finished: false, cancel: false });

  const finish = useCallback(() => {
    const r = run.current;
    r.cancel = true;
    r.finished = true;
    setTyping(null);
    setAsked(n);
    setAnswered(n);
    setRunning(false);
    for (let k = 0; k < 6; k++) chain?.current?.light(k);
  }, [n, chain]);

  // Arm before the first paint, so nothing flashes, and only when motion is allowed.
  useLayoutEffect(() => {
    if (!motionOk() || n === 0) return;
    run.current = { started: false, finished: false, cancel: false };
    setArmed(true);
    setAsked(0);
    setAnswered(0);
  }, [n]);

  useEffect(() => {
    const el = list.current;
    if (!armed || !el) return;
    const r = run.current;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const play = async () => {
      if (r.started || r.finished) return;
      r.started = true;
      setRunning(true);
      for (let k = 0; k < 6; k++) later(chainAt(k, n), () => !r.finished && chain?.current?.light(k));
      for (let i = 0; i < n; i++) {
        if (r.cancel) return;
        setTyping(i);
        await wait(THREAD_BEAT.typing);
        if (r.cancel) return;
        setTyping(null);
        setAsked(i + 1);
        await wait(THREAD_BEAT.answer);
        if (r.cancel) return;
        setAnswered(i + 1);
        if (i < n - 1) await wait(THREAD_BEAT.next);
      }
      if (!r.cancel) finish();
    };

    // Starts as the thread's top comes 15% above the viewport's bottom edge: the first dots show while the visitor is still scrolling towards it.
    const start = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) void play();
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0 },
    );
    start.observe(el);
    // Once started, leaving the viewport completes it at once (nobody comes back to a half-played thread).
    const leave = new IntersectionObserver(
      ([e]) => {
        if (e && !e.isIntersecting && r.started && !r.finished) finish();
      },
      { threshold: 0 },
    );
    leave.observe(el);
    // Still switched on mid-way: everything arrives.
    const mo = new MutationObserver(() => {
      if (!motionOk()) finish();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-still'] });
    return () => {
      start.disconnect();
      leave.disconnect();
      mo.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      r.cancel = true;
    };
  }, [armed, n, chain, finish]);

  const newest = answered > 0 ? answered - 1 : -1;
  // A keyboard visitor tabbing into a reply that has not arrived gets the whole thread at once.
  const onFocus = () => {
    if (armed && !run.current.finished) finish();
  };

  return (
    <ol ref={list} className={className ? `chat-thread ${className}` : 'chat-thread'} aria-label={label} data-run={running ? '' : undefined} onFocus={onFocus}>
      {pairs.map((p, i) => (
        <li key={p.video.id} className="chat-pair">
          <div className="chat-q">
            {/* data-wait="typing": the dots stand in its cell, so its outline steps aside. */}
            <div className="chat-row" data-side="left" data-arrive="" data-wait={armed && i >= asked ? (typing === i ? 'typing' : '') : undefined}>
              <ChatAvatar who={asker} />
              <ChatBubble
                who={asker}
                label={
                  <>
                    {castById(asker).name}
                    <span className="sr-only"> asks</span>
                  </>
                }
              >
                {p.question}
              </ChatBubble>
            </div>
            {typing === i && (
              <div className="chat-row chat-typing" data-side="left" aria-hidden>
                <ChatAvatar who={asker} />
                <Typing who={asker} />
              </div>
            )}
          </div>
          <div className="chat-row chat-a" data-side="right" data-arrive="slide" data-wait={armed && i >= answered ? '' : undefined}>
            <ChatAvatar poster={p.video.posterUrl} />
            <VideoFrame video={p.video} variant="bubble" width="var(--reply-w)" onOpen={onOpen} preview={i === newest ? 'active' : 'hover'} active={i === newest && answered > i} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * The thread's place while the library loads: the same grid of pairs, each Bolu's face beside the outline of the question to come (its real words,
 * invisible, so the outline is the bubble's own size) and the outline of a video reply, with a slow shimmer (none under still). aria-hidden: the
 * thread itself is what screen readers get.
 */
export function ChatThreadSkeleton({ questions, asker = 'bolu', className }: { questions: readonly string[]; asker?: CastId; className?: string }) {
  return (
    <ol className={className ? `chat-skeleton ${className}` : 'chat-skeleton'} aria-hidden>
      {questions.map((q) => (
        <li key={q} className="chat-pair">
          <div className="chat-q">
            <div className="chat-row" data-side="left" data-ghost="">
              <ChatAvatar who={asker} />
              <ChatBubble who={asker}>{q}</ChatBubble>
            </div>
          </div>
          <div className="chat-row chat-a" data-side="right" data-ghost="">
            <ChatAvatar poster={null} />
            <span className="chat-ghost-reply" />
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- FaqChat (Home #faq) ----------

export interface FaqChatProps {
  /** HOME_FAQ_SLUGS. */
  slugs: readonly string[];
  /** The link under every answer. Default "All questions →" to /faq. */
  foot?: ReactNode;
  className?: string;
}

/** The FAQ chat's play-in in ms: the visitor's bubble, then the typing dots, then the answer (650 ms after the press). */
const FAQ_BEAT = { you: 250, typing: 400 } as const;

const PLUS = (
  <svg className="faqchat-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * The Home FAQ as a chat: six disclosure buttons, each followed by its own answer region. At 1068 and wider every region is placed in one side panel;
 * narrower, the open one sits under its question. One DOM and one set of semantics at every width. The first answer is open and complete on load;
 * opening another plays the visitor's bubble, typing (400 ms), then the answer. The company answers with its mark, never a mascot.
 */
export function FaqChat({ slugs, foot, className }: FaqChatProps) {
  const faqs = useMemo(() => slugs.map((s) => faqBySlug(s)).filter((f): f is NonNullable<typeof f> => Boolean(f)), [slugs]);
  const [open, setOpen] = useState(0);
  // The answer being played in: the visitor's bubble arrives, then typing (FAQ_BEAT), then the answer.
  const [phase, setPhase] = useState<'done' | 'armed' | 'you' | 'typing' | 'answer'>('done');
  const timers = useRef<number[]>([]);
  const id = useRef(`faqchat-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const choose = (i: number) => {
    if (i === open) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setOpen(i);
    if (!motionOk()) {
      setPhase('done');
      return;
    }
    setPhase('armed');
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    // Two frames so the visitor's bubble starts from its hidden state, then it pops in from its tucked corner.
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('you')));
    at(FAQ_BEAT.you, () => setPhase('typing'));
    at(FAQ_BEAT.you + FAQ_BEAT.typing, () => setPhase('answer'));
    at(FAQ_BEAT.you + FAQ_BEAT.typing + 700, () => setPhase('done'));
  };

  const anchor = foot ?? <Link to="/faq">All questions →</Link>;

  return (
    <div className={className ? `faqchat ${className}` : 'faqchat'} style={{ '--faq-rows': faqs.length } as CSSProperties}>
      {faqs.map((f, i) => {
        const on = i === open;
        const playing = on && phase !== 'done';
        return (
          <FaqChatItem
            key={f.slug}
            id={`${id}-${f.slug}`}
            row={i + 1}
            q={f.q}
            a={f.a}
            slug={f.slug}
            open={on}
            youWait={playing && phase === 'armed'}
            typing={playing && phase === 'typing'}
            answerWait={playing && (phase === 'armed' || phase === 'you' || phase === 'typing')}
            run={playing}
            onOpen={() => choose(i)}
            foot={anchor}
          />
        );
      })}
    </div>
  );
}

function FaqChatItem({
  id,
  row,
  q,
  a,
  slug,
  open,
  youWait,
  typing,
  answerWait,
  run,
  onOpen,
  foot,
}: {
  id: string;
  row: number;
  q: string;
  a: string;
  slug: string;
  open: boolean;
  youWait: boolean;
  typing: boolean;
  answerWait: boolean;
  run: boolean;
  onOpen: () => void;
  foot: ReactNode;
}) {
  return (
    <>
      <button type="button" className="faqchat-q" id={`${id}-q`} aria-expanded={open} aria-controls={`${id}-a`} onClick={onOpen} style={{ '--row': row } as CSSProperties}>
        <span>{q}</span>
        {PLUS}
      </button>
      <div className="faqchat-a" id={`${id}-a`} role="region" aria-labelledby={`${id}-q`} hidden={!open} data-run={run ? '' : undefined} data-bubble-bounds="">
        <div className="chat-row" data-side="right" data-arrive="" data-wait={youWait ? '' : undefined}>
          <ChatBubble who="you" hidden>
            {q}
          </ChatBubble>
        </div>
        <div className="faqchat-reply">
          <div className="chat-row" data-side="left" data-arrive="" data-wait={answerWait ? '' : undefined}>
            <ChatAvatar who="mark" />
            <ChatBubble who="company" as="div">
              <p>{a}</p>
              <Link className="bubble-more" to={`/faq/${slug}`}>
                Read the full answer →
              </Link>
            </ChatBubble>
          </div>
          {typing && (
            <div className="chat-row chat-typing" data-side="left" aria-hidden>
              <ChatAvatar who="mark" />
              <Typing who="company" />
            </div>
          )}
        </div>
        <p className="faqchat-foot">{foot}</p>
        {open && (
          <span className="faqchat-peek" aria-hidden>
            <Character who="sochu" size={120} expression="thinking" peek />
          </span>
        )}
      </div>
    </>
  );
}
