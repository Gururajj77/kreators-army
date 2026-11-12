import { INTEGRATION_OPTIONS, MUST_HAVE_OPTIONS, OBJECTIVE_OPTIONS, type Video } from '@kreators/shared';
import { ArrowRight, DoorOpen, FileSignature, Frame, type LucideIcon } from 'lucide-react';
import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Character, type CharacterHandle } from '../../cast';
import { BRAND_GUIDE_COVERS, BRAND_GUIDE_TITLE } from '../../components/brief/copy';
import { sayPatiently, useOnView } from '../../components/brief/onView';
import { CastBubble, useCastLine } from '../../components/chat';
import { VideoFrame } from '../../components/frames';
import { Street } from '../../components/street';
import { Cta, HeroCopy, PrimaryCta, Reveal, SectionHead, Seo } from '../../components/ui';
import { EditTimeline } from '../../components/visuals';
import { HERO, PILOT_FOOTNOTE, PILOT_STEPS } from '../../lib/content';
import { useVideos } from '../../lib/queries';

// content §3.3; layout visual §2.3, V2-SPEC 5.4. The street under the hero with Bolu on its footpath; three plates; the brief's six cards with their
// options as display-only chips (labels from shared brief.ts, the same list the form and the inbox read); what trial videos may be used for, beside a
// decorative phone; and the seven pilot steps on the edit timeline. Each character says its line once, when its part of the page arrives.

/** (grpD13) Keeps "pre-production" on one line: at most widths the browser broke it at its hyphen ("pre- / production"). Text unchanged. */
function keepPre(s: string): ReactNode {
  return s.split('pre-production').flatMap((part, i) =>
    i
      ? [
          <span key={i} className="whitespace-nowrap">
            pre-production
          </span>,
          part,
        ]
      : [part],
  );
}

// ---------- Hero ----------

function Hero() {
  const root = useRef<HTMLElement>(null);
  const bolu = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  // After the first paint has settled: the line arrives as a greeting, not with the page.
  useOnView(root, 0.4, () => void sayPatiently(() => cast.say('trial.hero', { by: bolu.current })), 900);
  return (
    <section ref={root} className="tr-hero" data-bubble-bounds="">
      <div className="ground" aria-hidden />
      <div className="wrap tr-hero-in">
        <HeroCopy
          eyebrow="The trial"
          title={
            <>
              See it on your <span className="g-word">own</span> brand first
            </>
          }
          lead="The trial is a short test run. It lets you see our vox pop style on your own brand before you commit to a paid pilot."
        >
          <PrimaryCta size="lg" />
          <Cta to="#brief" kind="ghost" size="lg">
            What goes in the brief
          </Cta>
        </HeroCopy>
      </div>
      <Street variant="band" className="tr-street">
        <span className="street-stand tr-bolu">
          <Character ref={bolu} who="bolu" size="var(--tr-bolu)" prop>
            <CastBubble {...cast.bubble('trial.hero')} side="end" />
          </Character>
        </span>
      </Street>
    </section>
  );
}

// ---------- What the trial is ----------

const WHAT: { Glyph: LucideIcon; title: string; body: string }[] = [
  { Glyph: Frame, title: 'A short test run', body: 'A look at the format on your own brand, before any package.' },
  { Glyph: FileSignature, title: 'Agreed in writing', body: 'The scope, the number of trial videos and any trial fee are confirmed in writing between us.' },
  { Glyph: DoorOpen, title: 'No obligation either way', body: 'Nothing in the trial commits you, or us, to a pilot.' },
];

function WhatItIs() {
  return (
    <section className="section tr-what" aria-labelledby="tr-what-h">
      <div className="wrap">
        <h2 id="tr-what-h" className="eyebrow tr-what-h">
          What the trial is
        </h2>
        <ul className="tr-what-grid">
          {WHAT.map(({ Glyph, title, body }, i) => (
            <Reveal key={title} as="li" className="plate tr-what-tile" i={i}>
              <span className="tr-glyph" aria-hidden>
                <Glyph className="size-6" strokeWidth={1.6} />
              </span>
              <h3 className="h4">{title}</h3>
              <p className="tr-what-body">{body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- The brief ----------

interface BriefCard {
  title: string;
  question: string;
  options?: readonly { value: string; label: string }[];
  guide?: boolean;
  /** (grpD13) A drawn, decorative stand-in for a free answer: a write-in field or the reference reels. */
  drawn?: 'write' | 'refs';
}

const BRIEF_CARDS: BriefCard[] = [
  { title: 'Objective', question: 'What are these videos mainly for?', options: OBJECTIVE_OPTIONS },
  { title: 'Brand integration', question: 'How much should the brand show?', options: INTEGRATION_OPTIONS },
  { title: 'Desired viewer response', question: 'After watching, what should people think, feel or do? (In your words.)', drawn: 'write' },
  { title: 'Non-negotiables', question: 'What must every video include?', options: MUST_HAVE_OPTIONS },
  { title: 'Brand guide', question: 'A simple guide to your brand, linked or attached.', guide: true },
  { title: 'References', question: '3 to 5 videos that best show the direction you want.', drawn: 'refs' },
];

function Brief() {
  const grid = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const sochu = useRef<CharacterHandle>(null);
  const gola = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  useOnView(grid, 0.35, () => void sayPatiently(() => cast.say('trial.brief', { by: sochu.current })), 400);
  useOnView(note, 0.7, () => void sayPatiently(() => cast.say('trial.lock', { by: gola.current })), 300);

  return (
    <section id="brief" className="section band-alt tr-brief">
      <div className="wrap">
        <SectionHead
          title="The brief steers everything"
          lead="Please fill in the brief before the shoot. Every creative choice on the trial starts there. The request form walks you through it."
        />
        <div ref={grid} className="tr-brief-stage" data-bubble-bounds="">
          <span className="tr-sochu" aria-hidden>
            <Character ref={sochu} who="sochu" size="var(--tr-sochu)" expression="happy">
              <CastBubble {...cast.bubble('trial.brief')} side="end" />
            </Character>
          </span>
          <ol className="tr-brief-grid">
            {BRIEF_CARDS.map((c, i) => (
              <Reveal key={c.title} as="li" className="plate tr-card" i={i}>
                <span className="tr-card-n" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="h4 tr-card-title">{c.title}</h3>
                <p className="tr-card-q">{c.question}</p>
                {c.options && (
                  <ul className="tr-chips">
                    {c.options.map((o) => (
                      <li key={o.value} className="tr-chip">
                        {o.label}
                      </li>
                    ))}
                  </ul>
                )}
                {c.drawn === 'write' && (
                  <span className="tr-write" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                )}
                {c.drawn === 'refs' && (
                  <span className="tr-refs" aria-hidden>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <i key={n} data-opt={n > 2 ? '' : undefined} />
                    ))}
                  </span>
                )}
                {c.guide && (
                  <details className="tr-guide">
                    <summary>
                      <span>{BRAND_GUIDE_TITLE}</span>
                      <span className="tr-guide-icon" aria-hidden />
                    </summary>
                    <ul className="tr-guide-list">
                      {BRAND_GUIDE_COVERS.map((g) => (
                        <li key={g.lead}>
                          <strong>{g.lead}</strong> {g.rest}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </Reveal>
            ))}
          </ol>
        </div>

        <div ref={note} className="tr-note-row" data-bubble-bounds="">
          <div className="plate tr-note" data-tone="gola">
            <div className="tr-note-copy">
              <h3 className="h3">Lock it before we film</h3>
              <p>
                Lock the creative direction, branding and must-haves before the shoot. New asks or changes after filming may need extra editing, changed
                deliverables, or a reshoot if they need footage we didn't film.
              </p>
            </div>
            <span className="tr-note-gola" aria-hidden>
              <Character ref={gola} who="gola" size="var(--tr-gola)" prop>
                <CastBubble {...cast.bubble('trial.lock')} side="end" />
              </Character>
            </span>
          </div>
        </div>
        <div className="tr-brief-cta">
          <PrimaryCta size="lg" />
        </div>
      </div>
    </section>
  );
}

// ---------- Trial videos are for evaluation ----------

/** The decorative phone's picture: the hero poster (V2-SPEC 5.4), never a real library row. */
const SAMPLE = {
  id: 'trial-sample',
  title: '',
  brand: '',
  category: null,
  platform: null,
  aspect: 'vertical',
  views: 0,
  featured: false,
  streamUrl: null,
  fallbackUrl: null,
  embedUrl: null,
  posterUrl: HERO.poster,
  previewOk: false,
  previewUrl: null,
  durationMs: null,
  links: { instagram: null, youtube: null },
} as Video;

const RULES = [
  'Anything we make in the trial is for review and approval only.',
  "Trial videos can't be posted, shared, boosted, used in ads, reused, sublicensed or used for business in any other way, unless a paid project is confirmed in writing.",
  "If we don't go ahead, unposted trial videos stay unused. Anything already posted must come down if we ask.",
  "Unless we agree otherwise in writing, the trial alone doesn't give you ownership or usage rights. Commercial rights come from the final agreement.",
  'Either of us may step back if a conflict of interest or a clash with a competitor comes up. If we spot one, we may ask you to stop using the trial videos.',
];

/**
 * (hover7) The phone plays on hover like every video on the site: the poster's own reel (HERO.firstId), its stored clip only (pub8: a MEGA reel never
 * streams here; a bundled one may preview its own file). No clip: the poster stays. The frame stays the decorative sample (no brand, no links, no
 * player), so no real library row is presented as trial work.
 */
function useSample(): Video {
  const { data } = useVideos();
  const hero = data?.find((v) => v.id === HERO.firstId);
  return useMemo(() => (hero ? { ...SAMPLE, source: hero.source, streamUrl: hero.streamUrl, previewOk: hero.previewOk, previewUrl: hero.previewUrl } : SAMPLE), [hero]);
}

function TrialContent() {
  const sample = useSample();
  const side = useRef<HTMLDivElement>(null);
  const tiko = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  useOnView(side, 0.6, () => void sayPatiently(() => cast.say('trial.content', { by: tiko.current })), 300);
  return (
    <section id="trial-content" className="section tr-content">
      <div className="wrap tr-content-in">
        <div className="tr-content-copy">
          <SectionHead center={false} title="Trial videos are for a look, not a post" />
          <Reveal as="ul" className="tr-rules">
            {RULES.map((r, i) => (
              <li key={r} style={{ '--i': i } as CSSProperties}>
                {r}
              </li>
            ))}
          </Reveal>
        </div>
        <div ref={side} className="tr-content-side" data-bubble-bounds="">
          <VideoFrame video={sample} variant="phone" width="var(--tr-phone)" className="tr-phone" preview="hover">
            <span className="chip tr-eval">For evaluation</span>
          </VideoFrame>
          <span className="tr-tiko" aria-hidden>
            <Character ref={tiko} who="tiko" size="var(--tr-tiko)" prop>
              <CastBubble {...cast.bubble('trial.content')} side="start" />
            </Character>
          </span>
        </div>
      </div>
    </section>
  );
}

// ---------- After the trial ----------

function After() {
  const box = useRef<HTMLDivElement>(null);
  const gola = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  useOnView(box, 0.3, () => void sayPatiently(() => cast.say('trial.after', { by: gola.current })), 200);
  return (
    <section id="after" className="section band-dark tr-after">
      <div className="wrap">
        <SectionHead title="If you want to continue" lead="This is how the paid pilot runs." />
        <div ref={box} className="tr-after-tl">
          <EditTimeline
            mode="reveal"
            tone="plate"
            steps={PILOT_STEPS}
            label="After the trial"
            aside={
              <Character ref={gola} who="gola" size="var(--tr-aside)" onDark>
                <CastBubble {...cast.bubble('trial.after')} side="end" />
              </Character>
            }
          />
        </div>
        <p className="tr-footnote">{keepPre(PILOT_FOOTNOTE)}</p>
        <p className="tr-links">
          <Link to="/pricing" className="tr-link">
            See packages and pricing
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link to="/how-we-work" className="tr-link">
            How we work
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function Trial() {
  return (
    <div className="tr">
      <Seo
        title="The trial"
        description="See Kreators.Army's vox pop style on your own brand before you commit. What the trial is, the brief, how trial videos may be used, and what happens after."
      />
      <Hero />
      <WhatItIs />
      <Brief />
      <TrialContent />
      <After />
    </div>
  );
}
