import type { Video } from '@kreators/shared';
import { ArrowRight, ChevronLeft, ChevronRight, Mic, Pause, Play } from 'lucide-react';
import { AnimatePresence, m, type Variants } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Character } from '../../cast';
import { HeroCopy, PrimaryCta, Reveal, SectionHead, Seo, Tile } from '../../components/ui';
import { VideoTile } from '../../components/video';
import { FORMATS } from '../../lib/content';
import { useMotionOk, useRunning } from '../../lib/motionOk';
import { spring } from '../../lib/spring';
import { useStill } from '../../lib/store';
import { FormatActions, FormatTitle, Reel, useFormat } from './FormatPage';

// Portrait-led: one large video opens the page, a second carries the argument, and the question-of-the-week idea is a deck you flick through.

const content = FORMATS.founders;

/** A reel opens on its hook, and edits cut away to film clips later on. Looping only the opening keeps a large portrait on real people, in any video. */
const LOOP_SECONDS = 3.3;

/** Worded from topics already in the video library, so nothing here is a made-up campaign. */
const QUESTIONS = ['New phone or a Goa trip?', 'Worst thing you ever bought second-hand?', 'Hot take on Valentine’s Day?', 'What does AI change about design?'];

type Card = { week: string; question: string; action?: boolean };
// Labelled as examples, not weeks: these are topics from the library, not a weekly series that has run.
const CARDS: Card[] = [...QUESTIONS.map((question, i) => ({ week: `Example ${i + 1}`, question })), { week: 'Next week', question: 'Your category, your question.', action: true }];

// ---------- The large portrait ----------

/** True while any <dialog> is open. Only the `open` attribute is watched, so this costs nothing the rest of the time. */
function useDialogOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => setOpen(document.querySelector('dialog[open]') !== null);
    const watcher = new MutationObserver(check);
    watcher.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    return () => watcher.disconnect();
  }, []);
  return open;
}

/**
 * The large video: a real VideoTile, so it gets the tile-to-player morph, with a muted loop inside it. The one thing on this page that moves on its own.
 * Starts after fonts and idle, and stops off screen, in hidden tabs, behind the player and under Pause animations.
 */
function Portrait({ video, onOpen }: { video: Video; onOpen: (video: Video) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLVideoElement>(null);
  const running = useRunning(frame);
  const behindPlayer = useDialogOpen();
  const still = useStill((s) => s.still);
  const locked = useStill((s) => s.locked);
  const toggleStill = useStill((s) => s.toggle);
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const loops = video.source === 'file' && !still && !saveData;
  const [tile, setTile] = useState<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useLayoutEffect(() => {
    setTile(frame.current?.querySelector<HTMLElement>('.tile') ?? null);
  }, [video.id]);

  useEffect(() => {
    if (!loops) return;
    let on = true;
    let cancel = () => undefined as void;
    void document.fonts.ready.then(() => {
      if (!on) return;
      const go = () => setArmed(true);
      // Safari has no requestIdleCallback.
      const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      if (idle) {
        const id = idle(go, { timeout: 2000 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(go, 400);
        cancel = () => window.clearTimeout(id);
      }
    });
    return () => {
      on = false;
      cancel();
      setPlaying(false);
    };
  }, [loops]);

  const showLoop = Boolean(tile) && loops && armed;

  const restartLoop = (e: SyntheticEvent<HTMLVideoElement>) => {
    if (e.currentTarget.currentTime >= LOOP_SECONDS) e.currentTarget.currentTime = 0;
  };

  useEffect(() => {
    const el = clip.current;
    if (!el) return;
    if (running && !behindPlayer) void el.play().catch(() => undefined);
    else el.pause();
  }, [running, behindPlayer, showLoop]);

  return (
    <div ref={frame} className="fp-frame" data-playing={playing ? '' : undefined}>
      <VideoTile video={video} onOpen={onOpen} eager variant="bento" />
      {tile && showLoop && createPortal(<video ref={clip} className="fp-loop" src={video.ref} muted loop playsInline preload="metadata" tabIndex={-1} aria-hidden data-on={playing ? '' : undefined} onPlaying={() => setPlaying(true)} onTimeUpdate={restartLoop} />, tile)}
      {video.source === 'file' && !saveData && !locked && (
        <button type="button" className="nav-icon glass-media fp-pause" onClick={toggleStill} aria-label="Pause animations" aria-pressed={still}>
          {still ? <Play className="size-4 fill-current" aria-hidden /> : <Pause className="size-4 fill-current" aria-hidden />}
        </button>
      )}
    </div>
  );
}

// ---------- Question of the week: a deck of cue cards ----------

type Flick = { dir: number; side: number };

const cardVariants: Variants = {
  enter: ({ dir }: Flick) => (dir > 0 ? { x: 0, y: 64, scale: 0.84, rotate: 0, opacity: 0 } : { x: '130%', y: 8, scale: 1, rotate: 9, opacity: 1 }),
  at0: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  at1: { x: 10, y: 15, scale: 0.955, rotate: 2.4, opacity: 1 },
  at2: { x: -8, y: 30, scale: 0.91, rotate: -2.2, opacity: 1 },
  exit: ({ dir, side }: Flick) => (dir > 0 ? { x: `${side * 130}%`, y: 8, scale: 1, rotate: side * 9, opacity: 0.4, zIndex: 5 } : { x: 0, y: 64, scale: 0.84, rotate: 0, opacity: 0, zIndex: 0 }),
};

function QuestionOfTheWeek({ name, body }: { name: string; body: string }) {
  // A position on an endless tape, not an index: a card can leave and come round again while its last exit is still running, so each pass needs its own key.
  const [pos, setPos] = useState(0);
  const [flick, setFlick] = useState<Flick>({ dir: 1, side: 1 });
  const ok = useMotionOk();
  const count = CARDS.length;
  const cardAt = (tape: number) => CARDS[((tape % count) + count) % count] as Card;
  const current = cardAt(pos);
  const transition = ok ? spring.snappy : { duration: 0 };

  const go = (dir: number, side = 1) => {
    setFlick({ dir, side });
    setPos((p) => p + dir);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  const shown = [2, 1, 0].map((depth) => ({ depth, tape: pos + depth }));

  return (
    <div role="group" aria-roledescription="carousel" aria-label={name} onKeyDown={onKey}>
    <Tile tone="bolu" className="fp-qotw">
      <div className="fp-qotw-copy">
        <SectionHead center={false} title={name} />
        <p className="lead">{body}</p>
      </div>

      <div className="fp-stack">
        <AnimatePresence initial={false} custom={flick}>
          {shown.map(({ depth, tape }) => {
            const card = cardAt(tape);
            const front = depth === 0;
            return (
              <m.article
                key={tape}
                className="fp-card"
                custom={flick}
                variants={cardVariants}
                initial="enter"
                animate={`at${depth}`}
                exit="exit"
                transition={transition}
                style={{ zIndex: 3 - depth }}
                aria-hidden={!front}
                inert={!front}
                drag={front && ok ? 'x' : false}
                dragSnapToOrigin
                dragElastic={0.7}
                onDragEnd={(_, info) => {
                  const away = Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500;
                  if (away) go(1, info.offset.x < 0 ? -1 : 1);
                }}
              >
                <span className="fp-card-week">
                  <Mic className="size-4" aria-hidden />
                  {card.week}
                </span>
                <p className="fp-card-q">{card.question}</p>
                {card.action ? <PrimaryCta className="self-start" /> : <span className="fp-card-hint">Asked again and again.</span>}
              </m.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="fp-qotw-nav">
        <div className="flex gap-2">
          <button type="button" className="nav-icon fp-deck-btn" onClick={() => go(-1)} aria-label="Previous question">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" className="nav-icon fp-deck-btn" onClick={() => go(1)} aria-label="Next question">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <p className="small m-0 text-muted">Example questions, from topics we have filmed.</p>
      </div>

      <p className="sr-only" aria-live="polite">
        {current.week}: {current.question}
      </p>
    </Tile>
    </div>
  );
}

// ---------- Page ----------

export default function Founders() {
  const { picks, player, pending } = useFormat(content);
  const [lead, second] = picks;
  const [withMic, inHand, qotw] = content.cards as [(typeof content.cards)[number], (typeof content.cards)[number], (typeof content.cards)[number]];

  return (
    <>
      <Seo title={content.eyebrow} description={content.metaDescription} />

      <section className="fp-hero">
        <div className="ground" aria-hidden />
        <div className="wrap fp-hero-in">
          <div className="fp-hero-media">
            {lead ? (
              <Portrait video={lead} onOpen={player.open} />
            ) : pending ? (
              <div className="fp-frame skeleton" aria-hidden />
            ) : (
              <Link to="/video-library" className="fp-frame fp-frame-empty">
                <span>See the work in the video library</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
            <Character who="bolu" size="clamp(104px, 27vw, 150px)" prop expression="happy" className="fp-bolu" />
          </div>
          <HeroCopy eyebrow={content.eyebrow} title={<FormatTitle content={content} />} lead={content.lead} titleClass="display">
            <FormatActions />
          </HeroCopy>
        </div>
      </section>

      <section className="section fp-why">
        <div className="wrap fp-why-in">
          <div className="fp-why-words">
            <Reveal variant="rise" className="fp-statement">
              <h2>{content.whyTitle.join('')}.</h2> <p>{content.whyBody}</p>
            </Reveal>
            <Reveal className="fp-ways">
              <h3 className="eyebrow">{content.cardsTitle}</h3>
              <ul>
                {[withMic, inHand].map((way) => (
                  <li key={way.name}>
                    <h4 className="h4">{way.name}</h4>
                    <p>{way.body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal className="fp-why-media">
            <Reel video={second} pending={pending} onOpen={player.open} />
          </Reveal>
        </div>
      </section>

      <section className="fp-deck-section">
        <div className="wrap">
          <Reveal>
            <QuestionOfTheWeek name={qotw.name} body={qotw.body} />
          </Reveal>
        </div>
      </section>

      {player.dialog}
    </>
  );
}
