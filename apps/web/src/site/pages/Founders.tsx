import type { Video } from '@kreators/shared';
import { ArrowRight, ChevronLeft, ChevronRight, Mic } from 'lucide-react';
import { AnimatePresence, m, type Variants } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { Character, type CharacterHandle } from '../../cast';
import { CastBubble } from '../../components/chat';
import { ReelPause, VideoFrame, previewAllowed, usePlayback } from '../../components/frames';
import { HeroCopy, PrimaryCta, Reveal, SectionHead, Seo, Tile } from '../../components/ui';
import { VideoTile, useVideoPlayer } from '../../components/video';
import { FORMATS, INTERACTION_THREAD } from '../../lib/content';
import { useMotionOk } from '../../lib/motionOk';
import { useVideos } from '../../lib/queries';
import { spring } from '../../lib/spring';
import { FormatActions, FormatIdeas, FormatTitle, Reel, formatSlug, useFormat, useLineOnView } from './FormatPage';

// Portrait-led: one large video opens the page, a second carries the argument, and the question-of-the-week idea is a deck of polaroids you flick
// through, each a real question we have filmed with its real video.

const content = FORMATS.founders;

// ---------- The large portrait ----------

/**
 * The large video: a real VideoTile, so it gets the tile-to-player morph, playing its bounded muted preview while it is in view (desktop only, one video
 * on the page at a time, V2-SPEC 3.4), with its own pause control.
 */
function Portrait({ video, onOpen }: { video: Video; onOpen: (video: Video) => void }) {
  const { wanted, label, toggle } = usePlayback();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => setAllowed(previewAllowed(video)), [video]);
  return (
    <div className="fp-frame">
      <VideoTile video={video} onOpen={onOpen} eager variant="bento" sticker preview="active" active={wanted} />
      {allowed && <ReelPause wanted={wanted} label={label} onToggle={toggle} className="fp-pause" />}
    </div>
  );
}

// ---------- Question of the week: a deck of polaroids ----------

type Card = { week: string; question: string; video?: Video; action?: boolean };
type Flick = { dir: number; side: number };

// Polaroids tilt (media only); the front card is always level, and nothing with words ever tilts: the question sits under the deck.
const cardVariants: Variants = {
  enter: ({ dir }: Flick) => (dir > 0 ? { x: 0, y: 64, scale: 0.84, rotate: 0, opacity: 0 } : { x: '130%', y: 8, scale: 1, rotate: 9, opacity: 1 }),
  at0: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  at1: { x: 18, y: 12, scale: 0.94, rotate: 5, opacity: 1 },
  at2: { x: -16, y: 22, scale: 0.88, rotate: -4, opacity: 1 },
  exit: ({ dir, side }: Flick) => (dir > 0 ? { x: `${side * 130}%`, y: 8, scale: 1, rotate: side * 9, opacity: 0.4, zIndex: 5 } : { x: 0, y: 64, scale: 0.84, rotate: 0, opacity: 0, zIndex: 0 }),
};

function QuestionOfTheWeek({ name, body, videos, onOpen }: { name: string; body: string; videos: Video[]; onOpen: (video: Video) => void }) {
  // Worded from topics already in the video library, labelled as examples, not weeks: these are real questions we have filmed, not a series that has run.
  const cards: Card[] = [
    ...INTERACTION_THREAD.map((t, i) => ({ week: `Example ${i + 1}`, question: t.q, video: videos.find((v) => v.id === t.videoId) })),
    { week: 'Next week', question: 'Your category, your question.', action: true },
  ];
  // A position on an endless tape, not an index: a card can leave and come round again while its last exit is still running, so each pass needs its own key.
  const [pos, setPos] = useState(0);
  const [flick, setFlick] = useState<Flick>({ dir: 1, side: 1 });
  const ok = useMotionOk();
  const count = cards.length;
  const cardAt = (tape: number) => cards[((tape % count) + count) % count] as Card;
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

        <div className="fp-qotw-deck">
          <div className="fp-stack">
            <AnimatePresence initial={false} custom={flick}>
              {shown.map(({ depth, tape }) => {
                const card = cardAt(tape);
                const front = depth === 0;
                return (
                  <m.div
                    key={tape}
                    className="fp-card"
                    data-front={front ? '' : undefined}
                    data-action={card.action ? '' : undefined}
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
                    {card.action ? (
                      <div className="fp-card-action">
                        <p className="fp-card-q">{card.question}</p>
                        <PrimaryCta intent={{ format: formatSlug(content) }} className="self-start" />
                      </div>
                    ) : card.video ? (
                      <VideoFrame video={card.video} variant="polaroid" width="100%" onOpen={front ? onOpen : undefined} preview="none" />
                    ) : (
                      <div className="fp-card-blank" aria-hidden />
                    )}
                  </m.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="fp-qotw-caption" aria-hidden={current.action ? true : undefined}>
            <p className="fp-card-week">
              <Mic className="size-4" aria-hidden />
              {current.week}
            </p>
            {!current.action && (
              <>
                <p className="fp-card-q">{current.question}</p>
                <p className="fp-card-hint">Asked again and again.</p>
              </>
            )}
          </div>
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
          <p className="small m-0 fp-qotw-note">Example questions, from topics we have filmed.</p>
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
  const { data: library = [] } = useVideos();
  // The deck's videos are the library's, not only this format's, so they open in a player of their own.
  const deckPlayer = useVideoPlayer(library);
  const [lead, second] = picks;
  const [withMic, inHand, qotw] = content.cards as [(typeof content.cards)[number], (typeof content.cards)[number], (typeof content.cards)[number]];
  const bolu = useRef<CharacterHandle>(null);
  const hero = useRef<HTMLDivElement>(null);
  const cast = useLineOnView('founders.hero', bolu, hero, 900);

  return (
    <>
      <Seo title={content.eyebrow} description={content.metaDescription} />

      <section className="fp-hero">
        <div className="ground" aria-hidden />
        <div className="wrap fp-hero-in">
          <div ref={hero} className="fp-hero-media" data-bubble-bounds="">
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
            <Character ref={bolu} who="bolu" size="clamp(104px, 27vw, 150px)" prop expression="happy" className="fp-bolu">
              <CastBubble {...cast.bubble('founders.hero')} side="start" />
            </Character>
          </div>
          <HeroCopy eyebrow={content.eyebrow} title={<FormatTitle content={content} />} lead={content.lead} titleClass="display">
            <FormatActions content={content} />
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
                <li>
                  <h4 className="h4">{withMic.name}</h4>
                  <p>{withMic.body}</p>
                  {content.introLine && <p className="fp-intro">{content.introLine}</p>}
                </li>
                <li>
                  <h4 className="h4">{inHand.name}</h4>
                  <p>{inHand.body}</p>
                </li>
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
            <QuestionOfTheWeek name={qotw.name} body={qotw.body} videos={library} onOpen={deckPlayer.open} />
          </Reveal>
        </div>
      </section>

      <FormatIdeas content={content} />

      {player.dialog}
      {deckPlayer.dialog}
    </>
  );
}
