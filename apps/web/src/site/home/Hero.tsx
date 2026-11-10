import { formatViews, type Video } from '@kreators/shared';
import { Play, Star } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Character, castLookAt, type CharacterHandle } from '../../cast';
import { Cta, PrimaryCta } from '../../components/ui';
import { BrandPill } from '../../components/video';
import { BRANDS, IMPACT, SITE } from '../../lib/content';
import { ReelPause, useReel } from './shared';

const INTRO_KEY = 'kreators-hero-seen';

// The reel is fixed so it can paint from the preloaded poster, before the API answers. Its id ties it to the player once the API has.
const REEL = { id: 'seed-fyndflow', src: '/media/fyndflow.mp4', poster: '/media/fyndflow.jpg', brand: 'FyndFlow', views: 11_000_000 };

const figure = IMPACT[0];

// Real logos first and letter discs after them, so the row reads as clients, not initials. Stable, so the order in content.ts holds within each group.
const PROOF_BRANDS = [...BRANDS].sort((a, b) => Number(!a.logo) - Number(!b.logo));
// A logo that is a full-width wordmark rather than a symbol: it sits above its neighbour, so the next disc's overlap does not cover its last letters.
const WORDMARK_LOGOS = new Set(['Rode Mic India']);

function firstVisit() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === null;
  } catch {
    return false;
  }
}

/** Poster first. The video only asks for its bytes once the fonts have landed and the browser is idle, then fades in over the poster when it really has a frame. */
function Reel({ video, onOpen, paused }: { video: Video | undefined; onOpen: (v: Video) => void; paused: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const { wanted, label, toggle, started, shown, onPlaying } = useReel(box, clip, { threshold: 0.25, paused, armed });

  useEffect(() => {
    let alive = true;
    const go = () => {
      if (alive) setArmed(true);
    };
    void document.fonts.ready.then(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 2500 });
      else setTimeout(go, 300);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div ref={box} className="reel">
      <div className="reel-screen">
        <img src={REEL.poster} alt="" fetchPriority="high" decoding="async" />
        {/* src arrives with `started`, so preload="none" really means no bytes before the fonts are in. */}
        <video ref={clip} src={started ? REEL.src : undefined} muted loop playsInline preload="none" data-shown={shown ? '' : undefined} onPlaying={onPlaying} />
        <span className="scrim reel-scrim" aria-hidden />
        {video && (
          <button type="button" className="reel-open" onClick={() => onOpen(video)} aria-label={`Watch the ${video.brand} street interview with sound`}>
            <span className="reel-watch glass-media" aria-hidden>
              <Play className="size-4 fill-current" /> Watch with sound
            </span>
          </button>
        )}
        <span className="reel-bar">
          <BrandPill brand={REEL.brand} />
          <span className="chip">{formatViews(video?.views ?? REEL.views)} views</span>
        </span>
        <ReelPause wanted={wanted} label={label} onToggle={toggle} className="reel-pause-corner" />
      </div>
    </div>
  );
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
          <span className="proof-logos" aria-hidden>
            {PROOF_BRANDS.map((b) =>
              b.logo ? <img key={b.name} src={b.logo} alt="" width={32} height={32} className={WORDMARK_LOGOS.has(b.name) ? 'proof-wordmark' : undefined} /> : <span key={b.name}>{b.name.charAt(0)}</span>,
            )}
          </span>
        </dd>
      </div>
    </dl>
  );
}

const rise = (n: number) => ({ '--n': n }) as CSSProperties;

export function Hero({ videos, onOpen, paused }: { videos: Video[]; onOpen: (v: Video) => void; paused: boolean }) {
  // Read once on the first render, written after it, so a strict-mode double render agrees with itself.
  const [intro] = useState(firstVisit);
  const bolu = useRef<CharacterHandle>(null);

  useEffect(() => {
    if (!intro) return;
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // only costs a repeated intro
    }
    // After the four have landed, one wave. The cue is held until the rig has arrived, if it is late.
    const wave = setTimeout(() => bolu.current?.play('wave'), 1500);
    return () => clearTimeout(wave);
  }, [intro]);

  const lookAtCta = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') castLookAt(e.currentTarget.querySelector('.btn-accent') ?? e.currentTarget, 1200);
  };

  // 70 ms apart, starting just after the headline has settled.
  const cue = (i: number) => (intro ? 620 + i * 70 : undefined);

  return (
    <section className="hero" data-intro={intro ? '' : undefined}>
      <div className="ground" aria-hidden />
      <div className="wrap hero-in">
        <div className="hero-copy">
          <span className="eyebrow" style={rise(0)}>
            Street interview videos for D2C brands
          </span>
          <h1 className="display-md" style={rise(1)}>
            Turning real <span className="g-word">reactions</span> into viral brand content
          </h1>
          <p className="lead hero-lead" style={rise(2)}>
            We capture authentic emotions through street interviews and turn them into short-form videos for D2C brands.
          </p>
          <div className="hero-actions" style={rise(3)} onPointerEnter={lookAtCta}>
            <PrimaryCta size="lg" magnet className="hero-cta" />
            <Cta to="/video-library" kind="ghost" size="lg" arrow className="hero-cta">
              Browse video library
            </Cta>
          </div>
          <div className="hero-proof" style={rise(4)}>
            <Proof />
          </div>
        </div>

        <div className="reel-stage">
          <Character who="sochu" size="var(--c-sochu)" intro={cue(3)} interactive chip className="hero-char hero-sochu" />
          <Character who="gola" size="var(--c-gola)" intro={cue(2)} interactive chip className="hero-char hero-gola" />
          <Reel video={videos.find((v) => v.id === REEL.id)} onOpen={onOpen} paused={paused} />
          <Character ref={bolu} who="bolu" size="var(--c-bolu)" prop intro={cue(0)} interactive chip className="hero-char hero-bolu" />
          <Character who="tiko" size="var(--c-tiko)" intro={cue(1)} interactive chip className="hero-char hero-tiko" />
        </div>
      </div>
    </section>
  );
}
