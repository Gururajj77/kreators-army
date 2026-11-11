import { Compass, Lightbulb, Package, ThumbsUp, Users, Wrench, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Character, type CastId, type CharacterHandle } from '../../cast';
import { onView, sayPatiently, useOnView, useSectionAt } from '../../components/brief/onView';
import { CastBubble, useCastLine } from '../../components/chat';
import { ControlSplit, CreativeLoop, MechanismArt, MechanismCard, toneAt, type CastTone } from '../../components/demos';
import { Vignette, type VignetteName } from '../../components/street/Vignette';
import { ChipRail, IndexRail } from '../../components/tabs';
import { Cta, HeroCopy, PrimaryCta, Reveal, Seo } from '../../components/ui';
import { EditTimeline, InteractionChain } from '../../components/visuals';
import { EDIT_PRIORITIES, INTERACTION_EXAMPLES, LOCK_LIST, MECHANISMS, VIDEO_JOBS, type CastLineKey } from '../../lib/content';
import { finePointer, motionOk } from '../../lib/motionOk';
import { tieLast } from '../../lib/typo';

// content §3.2; layout visual §2.2, V2-SPEC 5.3. Fifteen sections of the founder's doc read as six calm stops. Desktop: a sticky "On this page" index in a
// 240 px column (the page's one sticky element; no sticky stage). Phones: a sticky row of chapter chips under the nav with "Ch. n of 6". The cast
// appears chapter by chapter, each line once, on its own trigger. Chapters 2 and 6 sit on the alternate plate, chapter 4 on the dark one.

const CHAPTERS = [
  { id: 'the-idea', name: 'The idea' },
  { id: 'variety', name: 'Variety with a purpose' },
  { id: 'on-the-street', name: 'On the street' },
  { id: 'in-the-edit', name: 'In the edit' },
  { id: 'before-the-shoot', name: 'Before the shoot' },
  { id: 'results', name: 'Results' },
] as const;
const IDS = CHAPTERS.map((c) => c.id);

function Chapter({ n, band, title, children }: { n: number; band?: 'alt' | 'dark'; title: ReactNode; children: ReactNode }) {
  const c = CHAPTERS[n - 1]!;
  return (
    <section id={c.id} className={`hww-ch ${band ? `hww-panel band-${band}` : ''}`} aria-labelledby={`${c.id}-h`}>
      <Reveal variant="rise" className="hww-ch-head">
        <span className="eyebrow">Chapter {n}</span>
        <h2 id={`${c.id}-h`} className="h2-sm">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

// ---------- Chapter 1: the idea ----------

/** One of the four example cards beside the chain, with the mechanism's tiny demo. Desktop: hover plays it once; touch: still. */
function ExampleCard({ text, mechanism, tone }: { text: string; mechanism: (typeof INTERACTION_EXAMPLES)[number]['mechanism']; tone: CastTone }) {
  const ref = useRef<HTMLLIElement>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const play = () => {
    const el = ref.current;
    if (!el || !motionOk() || el.hasAttribute('data-play')) return;
    el.setAttribute('data-play', '');
    timer.current = window.setTimeout(() => el.removeAttribute('data-play'), 1650);
  };
  return (
    <li ref={ref} className="mech-card hww-example" data-tone={tone} onPointerEnter={(e) => e.pointerType === 'mouse' && play()}>
      <span className="mech-disc" aria-hidden>
        <MechanismArt name={mechanism} />
      </span>
      <p className="hww-example-text">{text}</p>
    </li>
  );
}

function TheIdea() {
  const chainBox = useRef<HTMLDivElement>(null);
  const tiko = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  const sayChain = () => void sayPatiently(() => cast.say('hww.chain', { by: tiko.current }));
  // Under Pause animations the chain is lit from the start and never "finishes": the line comes when the chain is in view instead.
  useEffect(() => {
    const el = chainBox.current;
    if (!el || motionOk()) return;
    return onView(el, 0.6, sayChain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Chapter n={1} title="What we control, and what we don't">
      <ControlSplit
        className="hww-split"
        foot="Our job is to create the strongest possible conditions for interesting reactions, then find and build around the strongest moments in the edit."
      />
      <div className="hww-sub">
        <h3 className="h3">The whole interaction counts</h3>
        <div ref={chainBox} className="hww-chain" data-bubble-bounds="">
          <span className="hww-chain-tiko" aria-hidden>
            <Character ref={tiko} who="tiko" size="var(--hww-k-sm)" prop>
              <CastBubble {...cast.bubble('hww.chain')} side="end" />
            </Character>
          </span>
          <InteractionChain mode="auto" onLit={sayChain} />
        </div>
        <ul className="hww-examples">
          {INTERACTION_EXAMPLES.map((e, i) => (
            <ExampleCard key={e.text} text={e.text} mechanism={e.mechanism} tone={toneAt(i)} />
          ))}
        </ul>
        <p className="hww-body">
          The interviewer is free to follow an interesting answer and go deeper. Because we work with real strangers, we cannot guarantee that a particular
          person will be funny, emotional, surprising or highly reactive. What we can do is deliberately create more chances for those moments to&nbsp;happen.
        </p>
      </div>
    </Chapter>
  );
}

// ---------- Chapter 2: variety with a purpose ----------

const JOB_GLYPHS: LucideIcon[] = [Lightbulb, Wrench, Package, ThumbsUp, Users, Compass];

function Variety() {
  const grid = useRef<HTMLUListElement>(null);
  const sochu = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  useOnView(grid, 0.5, () => void sayPatiently(() => cast.say('hww.mechanisms', { by: sochu.current })), 200);
  return (
    <Chapter n={2} band="alt" title="Variety without a new set every time">
      <div className="hww-lede-row" data-bubble-bounds="">
        <p className="hww-body">
          For a batch of five videos, we actively avoid repeating the same question or interaction. Each video gets its own creative mechanism, so it has its
          own identity, while the production stays efficient and authentic.
        </p>
        <span className="hww-mech-sochu" aria-hidden>
          <Character ref={sochu} who="sochu" size="var(--hww-k)" expression="happy" prop>
            <CastBubble {...cast.bubble('hww.mechanisms')} side="end" />
          </Character>
        </span>
      </div>
      <ul ref={grid} className="hww-mechs" aria-label="Mechanisms">
        {MECHANISMS.map((m, i) => (
          <MechanismCard key={m} as="li" name={m} tone={toneAt(i)} />
        ))}
        <li className="hww-mechs-note">We've found this a far more sustainable way to create variety than treating every video as a separate production.</li>
      </ul>

      <div className="hww-sub">
        <h3 className="h3">One main job per video</h3>
        <p className="hww-body">
          If you're featuring several products, we're happy to plan the batch across them. We recommend each video has one primary creative objective, rather
          than trying to say every product, feature, benefit and call to action at once. A video might be built to:
        </p>
        <ul className="hww-jobs">
          {VIDEO_JOBS.map((job, i) => {
            const Glyph = JOB_GLYPHS[i] ?? Lightbulb;
            return (
              <Reveal key={job} as="li" className="plate hww-job" i={i}>
                <span className="hww-job-glyph" aria-hidden>
                  <Glyph className="size-5" strokeWidth={1.8} />
                </span>
                <span className="hww-job-name">{job}</span>
              </Reveal>
            );
          })}
        </ul>
        <p className="hww-line">Each video gets a clear purpose, and the batch still covers the wider range.</p>
      </div>
    </Chapter>
  );
}

// ---------- Chapter 3: on the street ----------

interface StreetTile {
  vignette: VignetteName;
  title: string;
  body: string;
  wide?: boolean;
  who?: CastId;
  line?: CastLineKey;
}

const STREET: StreetTile[] = [
  {
    vignette: 'passerby',
    wide: true,
    title: 'Natural, not a pitch',
    body: "Vox pop feels different from a scripted ad, so we keep conversations spontaneous, natural and entertaining. Your product can be part of the conversation, but we won't push a set brand pitch onto a stranger. The brand becomes part of an interesting interaction, not an ad in disguise.",
  },
  {
    vignette: 'intro',
    title: "Clear about who's asking",
    body: "Where our interviewer represents your brand, we make the relationship clear. We agree the introduction and positioning before the shoot, so there's no doubt who they're speaking for.",
  },
  {
    vignette: 'gift',
    who: 'bolu',
    line: 'hww.reason',
    title: 'A reason to stop',
    body: "We approach people on the street, so a simple incentive helps them stop, take part and spend enough time with us. Rewards work best when they're physical or redeemable on the spot. They never decide what anyone says; they just widen the pool of genuine conversations. The exact incentive is agreed in pre-production.",
  },
  {
    vignette: 'branch',
    who: 'bolu',
    line: 'hww.follow',
    title: 'Room to follow a good moment',
    body: "Once the objective and direction are agreed, our team needs reasonable flexibility on the ground. If a conversation starts working, the interviewer may follow it, ask more or adapt. We'd rather follow a genuinely interesting moment than force someone back to a script.",
  },
  {
    vignette: 'framing',
    who: 'tiko',
    line: 'hww.varied',
    title: 'Professional, and varied',
    body: 'We hold professional standards on framing, audio, camera positioning, lighting where possible, participant presentation, background distractions and composition. We batch-shoot, and create visual variety through different people, backgrounds, framing, interaction styles, places and mechanisms. If a concept truly needs a special location, costume, tent, large prop or custom setup, we identify and agree it in pre-production so we can plan for it.',
  },
];

/** A tile of the street bento. With a speaker: hover says its line on desktop; on touch it speaks once as it reaches the middle of the screen. */
function StreetTileView({ tile, i }: { tile: StreetTile; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const who = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  const say = () => (tile.line ? cast.say(tile.line, { by: who.current }) : Promise.resolve(false));

  useEffect(() => {
    const el = ref.current;
    if (!el || !tile.line || finePointer()) return;
    // Touch: the tile in the middle band of the screen speaks; if another line is up, it tries again the next time it arrives.
    let alive = true;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        void say().then((ok) => {
          if (ok && alive) io.disconnect();
        });
      },
      { rootMargin: '-35% 0px -35% 0px' },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tile.line]);

  return (
    <Reveal as="li" className={`plate hww-tile ${tile.wide ? 'hww-tile-wide' : ''}`} i={i}>
      <div
        ref={ref}
        className="hww-tile-in"
        data-bubble-bounds=""
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') void say();
        }}
      >
        <div className="hww-vignette">
          <Vignette name={tile.vignette} />
          {tile.who && (
            <span className="hww-tile-who" aria-hidden>
              <Character ref={who} who={tile.who} size="var(--hww-k-xs)" prop={tile.who === 'tiko'}>
                {tile.line && <CastBubble {...cast.bubble(tile.line)} side="end" />}
              </Character>
            </span>
          )}
        </div>
        <div className="hww-tile-copy">
          <h3 className="h4">{tile.title}</h3>
          <p>{tieLast(tile.body, 18)}</p>
        </div>
      </div>
    </Reveal>
  );
}

function OnTheStreet() {
  return (
    <Chapter n={3} title="On the street">
      <ul className="hww-street">
        {STREET.map((t, i) => (
          <StreetTileView key={t.vignette} tile={t} i={i} />
        ))}
      </ul>
    </Chapter>
  );
}

// ---------- Chapter 4: in the edit ----------

function InTheEdit() {
  const gola = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  return (
    <Chapter n={4} band="dark" title="As tight as the story allows">
      <p className="hww-body">
        Every video is made for short-form viewing. We won't force one fixed length on every video if it cuts the context or payoff that makes an interaction
        work. The goal isn't just shorter. It's as tight and engaging as the story allows.
      </p>
      <div className="hww-edit-tl">
        <EditTimeline
          mode="reveal"
          tone="plate"
          steps={EDIT_PRIORITIES.map((name) => ({ name, body: '' }))}
          label="Edit priorities"
          onDone={() => void sayPatiently(() => cast.say('hww.edit', { by: gola.current }))}
          aside={
            <Character ref={gola} who="gola" size="var(--hww-k-sm)" onDark prop>
              <CastBubble {...cast.bubble('hww.edit')} side="end" />
            </Character>
          }
        />
      </div>
      <div className="hww-sub">
        <h3 className="h3">Feedback and revisions</h3>
        <div className="hww-two">
          <div className="plate hww-two-plate">
            <h4 className="hww-two-title">Included</h4>
            <p>Minor, edit-level revisions such as text changes, trims, sequencing adjustments and captions.</p>
          </div>
          <div className="plate hww-two-plate">
            <h4 className="hww-two-title">Discussed separately first</h4>
            <p>Requests that need a fundamentally different concept, format, production setup, new footage or a reshoot.</p>
          </div>
        </div>
        <p className="hww-line">
          Please send feedback through one main point of contact, so the team gets one clear direction rather than several overlapping ones.
        </p>
      </div>
      <div className="hww-sub">
        <h3 className="h3">One planned production cycle</h3>
        <p className="hww-body">
          We complete the agreed batch in one planned cycle rather than changing direction between individual videos. We can share work at agreed checkpoints,
          especially early on, while planning continues against the agreed batch direction. That efficiency is what keeps the pricing viable.
        </p>
      </div>
    </Chapter>
  );
}

// ---------- Chapter 5: before the shoot ----------

/** Nine rows whose checks pop in order on view (60 ms apart); Sochu speaks at the list's end. All ticked with no JS or under Pause animations. */
function LockList() {
  const list = useRef<HTMLUListElement>(null);
  const sochu = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  const [armed, setArmed] = useState(false);
  const [ticked, setTicked] = useState(true);

  useLayoutEffect(() => {
    if (!motionOk()) return;
    setArmed(true);
    setTicked(false);
  }, []);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let timer = 0;
    const stop = onView(el, 0.5, () => {
      setTicked(true);
      timer = window.setTimeout(() => void sayPatiently(() => cast.say('hww.lock', { by: sochu.current })), armed ? 60 * LOCK_LIST.length + 450 : 200);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [armed, cast]);

  return (
    <div className="plate hww-lock" data-armed={armed ? '' : undefined} data-ticked={ticked ? '' : undefined} data-bubble-bounds="">
      <ul ref={list} className="hww-lock-list">
        {LOCK_LIST.map((item, i) => (
          <li key={item} style={{ '--i': i } as CSSProperties}>
            <svg className="hww-lock-check" viewBox="0 0 24 24" aria-hidden focusable="false">
              <circle cx="12" cy="12" r="11" />
              <path d="M7 12.4l3.3 3.3L17 9" />
            </svg>
            <span>{tieLast(item, 18)}</span>
          </li>
        ))}
      </ul>
      <span className="hww-lock-sochu" aria-hidden>
        <Character ref={sochu} who="sochu" size="var(--hww-k)" prop>
          <CastBubble {...cast.bubble('hww.lock')} side="end" />
        </Character>
      </span>
    </div>
  );
}

function BeforeTheShoot() {
  return (
    <Chapter n={5} title="What we lock before each shoot">
      <LockList />
      <Reveal className="hww-split-line">
        <p className="two-tone hww-two-tone">
          <strong>You bring the objective, the product truth and the requirements.</strong> We own the creative execution: concepts, questions, interactions and
          what happens on the street.
        </p>
        <p className="hww-small">This split lets you give us the right context without having to manage how each interaction unfolds.</p>
      </Reveal>
    </Chapter>
  );
}

// ---------- Chapter 6: results ----------

function Results() {
  return (
    <Chapter n={6} band="alt" title="What we can promise, and what we can't">
      <p className="hww-body">
        We always optimise the content for attention, retention, engagement and your campaign objective. But vox pop is distributed content, and how it performs
        also depends on the platform, audience, account history, media spend, offer and distribution strategy.
      </p>
      <div className="plate hww-callout" data-tone="ink">
        <p>We cannot guarantee specific views, virality, reach, engagement, conversions, CAC, ROAS or sales outcomes.</p>
      </div>
      <div className="hww-sub">
        <h3 className="h3">What we do control: the creative system</h3>
        <CreativeLoop className="hww-loop" caption="Every batch teaches us what resonates, so the next one is stronger." />
      </div>
      <div className="hww-sub">
        <h3 className="h3">What we've learned</h3>
        <figure className="plate hww-quote" data-tone="sochu">
          <blockquote>
            <p>
              The strongest vox pop campaigns don't come from asking more questions or making every video look completely different. They come from a clear
              objective, the right reaction mechanism, strong interactions with real people, enough variety on the ground, and the strongest moments built in
              the&nbsp;edit.
            </p>
          </blockquote>
          <figcaption>From working with brands such as Hackdaily, CircleStore and others across consumer categories.</figcaption>
        </figure>
      </div>
    </Chapter>
  );
}

// ---------- The page ----------

function PhoneChapters({ spy }: { spy: string }) {
  const n = IDS.indexOf(spy as (typeof IDS)[number]) + 1 || 1;
  return (
    <div className="hww-chips">
      <p className="hww-chapnum" aria-hidden>
        Ch. {n} of {CHAPTERS.length}
      </p>
      <ChipRail mode="links" label="Chapters" currentKind="location" current={`#${spy}`} links={CHAPTERS.map((c) => ({ to: `#${c.id}`, label: c.name }))} />
    </div>
  );
}

export default function HowWeWork() {
  // The chapter the reader is in: the first at the top of the page, then the last whose heading has passed a third of the way down the window.
  const spy = useSectionAt(IDS);
  return (
    <div className="hww">
      <Seo
        title="How we work"
        description="How Kreators.Army plans, shoots and edits vox pop street interviews: the interaction, creative variety, pre-production, revisions, and what we can and can't promise."
      />
      <section className="page-hero hww-hero" data-align="center">
        <div className="ground" aria-hidden />
        <div className="wrap page-hero-in">
          <HeroCopy
            eyebrow="How we work"
            title={
              <>
                We engineer the <span className="g-word">interaction</span>, not the outcome
              </>
            }
            lead="We make authentic, reaction-led videos with real people and real conversations. The answers aren't scripted. That's the point, and it's why the craft is in everything around them."
            scrubLead
          >
            <PrimaryCta size="lg" />
            <Cta to="/pricing" kind="ghost" size="lg">
              See pricing
            </Cta>
          </HeroCopy>
        </div>
      </section>

      <div className="wrap hww-body-grid">
        <aside className="hww-index">
          <IndexRail active={spy} items={CHAPTERS.map((c) => ({ id: c.id, label: c.name }))} />
        </aside>
        <PhoneChapters spy={spy} />
        <div className="hww-chapters">
          <TheIdea />
          <Variety />
          <OnTheStreet />
          <InTheEdit />
          <BeforeTheShoot />
          <Results />
        </div>
      </div>
    </div>
  );
}
