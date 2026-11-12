import type { Video } from '@kreators/shared';
import { Star } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { Character, castLookAt, type CastId, type CharacterHandle } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { FrameDeck, StoryRing, deckOrder } from '../../components/frames';
import { Street } from '../../components/street';
import { Cta, PrimaryCta } from '../../components/ui';
import { BRANDS, HERO, IMPACT, SITE, type CastLineKey } from '../../lib/content';

// The hero stands on the street (V2-SPEC 5.2, visual §1.3): the copy on the left, and on the right the reel deck on the footpath's back edge with the
// four around it, Sochu and Gola further back, Bolu and Tiko in front. The deck paints HERO.poster before /api/videos answers, so the preloaded poster
// stays the first paint; the street's art arrives after that, behind everything. Then the deck is this load's random order (deckOrder), and the
// poster leaves the way a card leaves the deck when its picture is not the first card's (FrameDeck).

const INTRO_KEY = 'kreators-hero-seen';

const figure = IMPACT[0];

// Real logos first and letter discs after them, so the row reads as clients, not initials. Stable, so the order in content.ts holds within each group.
const PROOF_BRANDS = [...BRANDS].sort((a, b) => Number(!a.logo) - Number(!b.logo));

function firstVisit() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === null;
  } catch {
    return false;
  }
}

function Proof() {
  return (
    <dl className="proof">
      {figure && (
        <div className="proof-item">
          <dt>{figure.label}</dt>
          <dd className="proof-figure">
            {figure.end}
            {figure.suffix}
          </dd>
        </div>
      )}
      <div className="proof-item">
        <dt>{SITE.rating.creators}</dt>
        <dd className="proof-figure">
          <Star className="proof-star" aria-hidden />
          {SITE.rating.score}
        </dd>
      </div>
      <div className="proof-item proof-brands">
        <dt>
          Trusted by<span className="proof-word"> brands</span>
        </dt>
        <dd>
          <span className="sr-only">{BRANDS.map((b) => b.name).join(', ')}</span>
          {/* Story rings (M6), decorative here: the brand names are the sentence above. */}
          <span className="proof-rings" aria-hidden>
            {PROOF_BRANDS.map((b) => (
              <StoryRing key={b.name} brand={b.name} logo={b.logo} size={36} decorative />
            ))}
          </span>
        </dd>
      </div>
    </dl>
  );
}

const rise = (n: number) => ({ '--n': n }) as CSSProperties;

/** A character on the street that answers a hover (mouse) or a tap with its line. */
function Talker({ who, line, cast, size, intro, className, children }: { who: CastId; line: CastLineKey; cast: ReturnType<typeof useCastLine>; size: string; intro?: number; className: string; children?: ReactNode }) {
  const actor = useRef<CharacterHandle>(null);
  const say = () => void cast.say(line, { by: actor.current });
  return (
    <span
      className={`hero-char ${className}`}
      onPointerEnter={(e: PointerEvent) => e.pointerType === 'mouse' && say()}
      onPointerUp={(e: PointerEvent) => e.pointerType !== 'mouse' && say()}
    >
      <Character ref={actor} who={who} size={size} intro={intro} interactive>
        <CastBubble {...cast.bubble(line)} />
        {children}
      </Character>
    </span>
  );
}

export function Hero({ videos, onOpen, paused }: { videos: Video[] | undefined; onOpen: (v: Video) => void; paused: boolean }) {
  // Read once on the first render, written after it, so a strict-mode double render agrees with itself.
  const [intro] = useState(firstVisit);
  const bolu = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  const { say } = cast;

  useEffect(() => {
    if (intro) {
      try {
        sessionStorage.setItem(INTRO_KEY, '1');
      } catch {
        // only costs a repeated intro
      }
    }
    // After the four have landed, one wave, then Bolu's question. The cue waits for the rig if it is late.
    const wave = intro ? window.setTimeout(() => bolu.current?.play('wave'), 1500) : 0;
    const ask = window.setTimeout(() => void say('home.hero.intro', { by: bolu.current }), intro ? 2100 : 1100);
    return () => {
      window.clearTimeout(wave);
      window.clearTimeout(ask);
    };
  }, [intro, say]);

  const onAction = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const target = (e.target as Element).closest('.btn-accent');
    if (!target) return;
    castLookAt(target, 1200);
    void cast.say('home.hero.cta', { by: bolu.current });
  };

  // 70 ms apart, starting just after the headline has settled.
  const cue = (i: number) => (intro ? 620 + i * 70 : undefined);

  return (
    <section className="hero" data-intro={intro ? '' : undefined}>
      <div className="ground" aria-hidden />
      <Street variant="hero" />
      <div className="wrap hero-in">
        <div className="hero-copy">
          <span className="eyebrow" style={rise(0)}>
            Street interview videos for D2C brands
          </span>
          <h1 className="display-md" style={rise(1)}>
            Turning real <span className="g-word">reactions</span> into brand content
          </h1>
          <p className="lead hero-lead" style={rise(2)}>
            We take your question to the street, real people answer on camera, and we build the strongest moments into short-form videos.
          </p>
          <div className="hero-actions" style={rise(3)} onPointerOver={onAction}>
            <PrimaryCta size="lg" className="hero-cta" />
            <Cta to="/video-library" kind="ghost" size="lg" arrow className="hero-cta">
              Browse video library
            </Cta>
          </div>
          <div className="hero-proof" style={rise(4)}>
            <Proof />
          </div>
        </div>

        {/* .street-floor: --floor-front and --floor-back, the footpath's edges, from the hero's own width (a container) and --street-h. */}
        <div className="hero-stage street-floor">
          <Talker who="sochu" line="home.hero.sochu" cast={cast} size="var(--c-sochu)" intro={cue(3)} className="hero-sochu" />
          <Talker who="gola" line="home.hero.gola" cast={cast} size="var(--c-gola)" intro={cue(2)} className="hero-gola" />
          <FrameDeck className="hero-deck" videos={videos && deckOrder(videos)} poster={HERO.poster} onOpen={onOpen} paused={paused} />
          <span className="hero-char hero-bolu">
            <Character ref={bolu} who="bolu" size="var(--c-bolu)" prop intro={cue(0)} interactive>
              <CastBubble {...cast.bubble('home.hero.intro')} />
              <CastBubble {...cast.bubble('home.hero.cta')} />
            </Character>
          </span>
          <Talker who="tiko" line="home.hero.tiko" cast={cast} size="var(--c-tiko)" intro={cue(1)} className="hero-tiko" />
        </div>
      </div>
    </section>
  );
}
