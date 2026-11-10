import type { Video } from '@kreators/shared';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Character, type CastId } from '../cast';
import { CastBubble, ChatAvatar, ChatBubble, ChatThread, FaqChat, Typing, useCastLine } from '../components/chat';
import { ControlSplit, CreativeLoop, MechanismCard, MechanismChip, toneAt } from '../components/demos';
import { FaqItem } from '../components/FaqItem';
import { Coverflow, DeckCard, FrameDeck, StoryRing, VideoFrame, ViewsSticker, deckOrder } from '../components/frames';
import { AddOnRow, BatchStrip, PackageCards, PackageIncludes, PricingRules } from '../components/Packages';
import { Street } from '../components/street';
import { Vignette } from '../components/street/Vignette';
import { VIGNETTES, type VignetteName } from '../components/street/vignettes';
import { ArrowDisc, ChipRail, IndexRail, LabelRoll, Segment, TabBar, TabPanel } from '../components/tabs';
import { CopyButton, Cta, PrimaryCta, Reveal, ResultsNote, RollNumber, SectionHead, Seo } from '../components/ui';
import { BrandPill, PostedOn, TileSkeletons, VideoTile, WatchLinks, useVideoPlayer } from '../components/video';
import { EditTimeline, InteractionChain, type ChainHandle } from '../components/visuals';
import {
  CAST_LINES,
  EDIT_PRIORITIES,
  FAQS,
  HERO,
  HOME_FAQ_SLUGS,
  INTERACTION_THREAD,
  JOURNEY,
  MECHANISMS,
  PILOT_STEPS,
  quote,
  type CastLineKey,
} from '../lib/content';
import { useVideos } from '../lib/queries';

// The component kit (V2-SPEC 7.1): every shared component of A2 and A3 in its states, on one page, for kit.cjs to shoot at 1440 and 390, light and
// dark, moving and still. It exists only in a kit build (VITE_KIT=1): a normal build has neither the route nor this chunk. Each section is a
// [data-kit-section]; <html data-kit-ready> marks the moment the page has settled (videos in, fonts ready).
// Kit-only styles are inline below: this page never ships.

const KIT_CSS = `
.kit { padding: calc(var(--nav-offset) + 32px) 0 0; }
.kit-head { margin-bottom: 40px; }
.kit-head p { color: var(--muted); max-width: 60ch; }
.kit-section { padding: 48px 0; border-top: 1px solid var(--line); }
.kit-section > .wrap > h2 { margin: 0 0 6px; font-size: 28px; line-height: 32px; letter-spacing: -0.02em; }
.kit-section > .wrap > .kit-note { margin: 0 0 28px; color: var(--muted); font-size: 14px; }
.kit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 20px; align-items: start; }
.kit-grid-wide { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr)); gap: 20px; align-items: start; }
.kit-cell { position: relative; display: flex; flex-direction: column; gap: 10px; min-width: 0; padding: 18px; border-radius: 20px; background: var(--surface); box-shadow: var(--plate-edge); }
.kit-cell.band-dark { background: #15151a; }
.kit-cell.kit-alt { background: var(--sunken); }
.kit-label { color: var(--muted); font-size: 12px; font-weight: 600; letter-spacing: 0.02em; }
.kit-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; }
.kit-stage { position: relative; display: flex; align-items: flex-end; justify-content: center; gap: 16px; min-height: 260px; padding-top: 110px; }
.kit-tile { position: relative; min-height: 300px; padding: 20px; border-radius: var(--r-tile); overflow: clip; }
.kit-tile[data-tone='bolu'] { background: var(--g-bolu); }
.kit-tile[data-tone='tiko'] { background: var(--g-tiko); }
.kit-tile .k-char { position: absolute; bottom: 12px; left: 50%; translate: -50% 0; }
.kit-edge .k-char { left: 8px; translate: none; }
.kit-hero { position: relative; overflow: clip; min-height: 640px; container-type: inline-size; background: var(--bg); }
.kit-hero-copy { position: relative; z-index: 2; padding: 64px 0 0; }
.kit-hero-copy > * { max-width: 540px; }
.kit-band { position: relative; overflow: clip; padding: 72px 16px calc(var(--street-h, 300px) + 24px); text-align: center; container-type: inline-size; }
.kit-band .street-stage > .k-char { left: calc(50% + 150px); }
.kit-night { position: relative; overflow: clip; border-radius: var(--r-tile); padding: 72px 16px 330px; text-align: center; }
.kit-night .kit-lineup { position: absolute; inset: auto 0 var(--floor-front); display: flex; justify-content: center; align-items: flex-end; gap: clamp(8px, 4vw, 48px); }
.kit-hero .street-stage .kit-deck { position: absolute; bottom: var(--floor-back); left: 64%; translate: -50% 0; }
.kit-vg { aspect-ratio: 16 / 10; border-radius: 20px; overflow: clip; background: var(--sunken); }
.kit-strip { display: grid; gap: 12px; }
.kit-dummy { height: 120px; }
@media (max-width: 734px) {
  .kit-band .street-stage > .k-char { left: auto; right: 16px; }
  .kit-hero { min-height: 760px; }
  .kit-hero .street-stage .kit-deck { left: 64%; }
}
`;

function Section({ name, title, note, children, alt }: { name: string; title: string; note?: string; children: ReactNode; alt?: boolean }) {
  return (
    <section className={`kit-section ${alt ? 'band-alt' : ''}`} data-kit-section={name}>
      <div className="wrap">
        <h2>{title}</h2>
        {note && <p className="kit-note">{note}</p>}
        {children}
      </div>
    </section>
  );
}

function Cell({ label, children, className, style }: { label: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`kit-cell ${className ?? ''}`} style={style}>
      <span className="kit-label">{label}</span>
      {children}
    </div>
  );
}

const CAST: CastId[] = ['bolu', 'tiko', 'gola', 'sochu'];
const LINE_OF: Record<CastId, CastLineKey> = { bolu: 'home.army.bolu', tiko: 'home.army.tiko', gola: 'home.army.gola', sochu: 'home.army.sochu' };

/** A live bubble: says its line once the cell is on screen (the real useCastLine path, token and dwell included). */
function LiveLine({ who, lineKey }: { who: CastId; lineKey: CastLineKey }) {
  const cast = useCastLine();
  const ref = useRef<HTMLDivElement>(null);
  const [again, setAgain] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        io.disconnect();
        void cast.say(lineKey, { by: el.querySelector<HTMLElement>('.k-char'), again: true });
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [cast, lineKey, again]);
  return (
    <div ref={ref} className="kit-stage" data-bubble-bounds="">
      <Character who={who} size={120}>
        <CastBubble {...cast.bubble(lineKey)} />
      </Character>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAgain((n) => n + 1)}>
        Say it again
      </button>
    </div>
  );
}

export function Kit() {
  const { data, isSuccess } = useVideos();
  const videos = useMemo(() => data ?? [], [data]);
  const byId = (id: string) => videos.find((v) => v.id === id);
  const { open, dialog } = useVideoPlayer(videos);
  const chain = useRef<ChainHandle>(null);
  const pairs = INTERACTION_THREAD.map((p) => ({ question: p.q, video: byId(p.videoId) })).filter((p): p is { question: string; video: Video } => Boolean(p.video));
  const [seg, setSeg] = useState<'trial' | 'question'>('trial');
  const [chip, setChip] = useState<string | null>('10');
  const [multi, setMulti] = useState<string[]>(['product', 'logo']);
  const [tab, setTab] = useState<'new' | 'contacted' | 'archived'>('new');
  const [n, setN] = useState(25);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (!isSuccess) return;
    let on = true;
    void document.fonts.ready.then(() =>
      window.setTimeout(() => {
        if (on) document.documentElement.setAttribute('data-kit-ready', '');
      }, 1500),
    );
    return () => {
      on = false;
      document.documentElement.removeAttribute('data-kit-ready');
    };
  }, [isSuccess]);

  const v0 = byId('seed-fyndflow');
  const vLand = byId('seed-circlestore-2');
  const vNoPoster = byId('seed-waxys');
  const vStored = byId('seed-circlestore-1');
  const vNoViews = byId('fx-wave');

  return (
    <div className="kit">
      <Seo title="Component kit" description="Every shared component in its states, for review." noindex />
      <style>{KIT_CSS}</style>
      <div className="wrap kit-head">
        <h1 className="display-md">
          Component <span className="g-word">kit</span>
        </h1>
        <p>Every shared component of the v2 build in its states. Built only with VITE_KIT=1. {isSuccess ? `${videos.length} fixture videos.` : 'Loading videos.'}</p>
      </div>

      {/* ---------------- A3: speech ---------------- */}
      <Section name="bubbles" title="ChatBubble" note="Speaker colours are the same in both themes. Visitor and company are the FAQ chat's.">
        <div className="kit-grid">
          {(['bolu', 'tiko', 'gola', 'sochu'] as const).map((w) => (
            <Cell key={w} label={`${w}, md`}>
              <ChatBubble who={w}>{CAST_LINES[LINE_OF[w]].line}</ChatBubble>
              <ChatBubble who={w} size="sm" label={false}>
                {CAST_LINES[LINE_OF[w]].line}
              </ChatBubble>
            </Cell>
          ))}
          <Cell label="you (visitor)">
            <ChatBubble who="you">{FAQS[5]?.q}</ChatBubble>
          </Cell>
          <Cell label="company (FAQ answer)" className="kit-alt">
            <ChatBubble who="company" as="div">
              <p>{FAQS[5]?.a}</p>
            </ChatBubble>
          </Cell>
          <Cell label="company on dark" className="band-dark">
            <ChatBubble who="company" as="div">
              <p>{FAQS[10]?.a}</p>
            </ChatBubble>
          </Cell>
        </div>
      </Section>

      <Section name="avatars" title="ChatAvatar and Typing" note="Faces cropped to a disc (needs --k-ink), the mark, a poster, a missing poster. Typing moves only under [data-run].">
        <div className="kit-grid">
          <Cell label="28 / 36 / 44">
            <div className="kit-row">
              {CAST.map((w) => (
                <span key={w} className="kit-row" style={{ gap: 8 }}>
                  <ChatAvatar who={w} size={28} />
                  <ChatAvatar who={w} size={36} />
                  <ChatAvatar who={w} size={44} />
                </span>
              ))}
            </div>
          </Cell>
          <Cell label="mark, poster, no poster">
            <div className="kit-row">
              <ChatAvatar who="mark" size={44} />
              <ChatAvatar poster={v0?.posterUrl ?? null} size={44} />
              <ChatAvatar poster={null} size={44} />
            </div>
          </Cell>
          <Cell label="typing (running)">
            <div className="kit-row" data-run="">
              <Typing who="bolu" />
              <Typing who="tiko" />
              <Typing who="company" />
            </div>
          </Cell>
        </div>
      </Section>

      <Section name="cast-bubbles" title="CastBubble" note="Pinned on for review. Sides, the plate tone on the speaker's own tile, and the collision shift near an edge.">
        <div className="kit-grid">
          {CAST.map((w, i) => (
            <Cell key={w} label={`${w} ${i === 0 ? 'start' : i === 3 ? 'end' : 'center'}`}>
              <div className="kit-stage" data-bubble-bounds="">
                <Character who={w} size={110}>
                  <CastBubble who={w} line={CAST_LINES[LINE_OF[w]].line} show side={i === 0 ? 'start' : i === 3 ? 'end' : 'center'} />
                </Character>
              </div>
            </Cell>
          ))}
          <Cell label="plate tone (Bolu on Bolu's tile)">
            <div className="kit-tile" data-tone="bolu" data-bubble-bounds="">
              <Character who="bolu" size={120}>
                <CastBubble who="bolu" line={CAST_LINES['home.army.bolu'].line} show />
              </Character>
            </div>
          </Cell>
          <Cell label="collision: at the tile's left edge">
            <div className="kit-tile kit-edge" data-tone="tiko" data-bubble-bounds="">
              <Character who="tiko" size={110}>
                <CastBubble who="tiko" line={CAST_LINES['home.army.tiko'].line} show />
              </Character>
            </div>
          </Cell>
          <Cell label="live: useCastLine, once on view">
            <LiveLine who="gola" lineKey="home.army.gola" />
          </Cell>
        </div>
      </Section>

      <Section name="chain" title="InteractionChain" note="Auto (lights on view), controlled at 3, and all lit (still or no JS look like this).">
        <div className="kit-strip">
          <Cell label="auto">
            <InteractionChain mode="auto" />
          </Cell>
          <Cell label="controlled, lit = 3">
            <InteractionChain mode="controlled" lit={3} />
          </Cell>
        </div>
      </Section>

      <Section name="thread" title="ChatThread" note="Plays once, about 1 s a pair, as its top enters the lower 85% of the viewport; waiting bubbles show as outlines; completes at once if it leaves the viewport. Four columns, two, then one on phones.">
        <InteractionChain mode="controlled" ref={chain} />
        <div style={{ height: 40 }} />
        {pairs.length ? <ChatThread pairs={pairs} chain={chain} onOpen={open} label="Real questions we've filmed" /> : <TileSkeletons count={4} />}
      </Section>

      <Section name="faq" title="FaqChat" note="The first answer is open on load. Side panel at 1068 and wider; inline below." alt>
        <FaqChat slugs={HOME_FAQ_SLUGS} />
      </Section>

      {/* ---------------- A3: visuals ---------------- */}
      <Section name="timeline" title="EditTimeline" note="reveal (crosses once at 50% in view), the 7-step pilot, and the stage mode (160 vh, scroll-linked).">
        <div className="kit-strip" style={{ gap: 40 }}>
          <EditTimeline
            mode="reveal"
            steps={JOURNEY.map((s, i) => ({ ...s, who: (['sochu', 'bolu', 'sochu', 'sochu', 'gola'] as const)[i], lineKey: (['home.how.1', 'home.how.2', 'home.how.3', 'home.how.4', 'home.how.5'] as const)[i] }))}
            label="From trial to batch"
          />
          <EditTimeline mode="reveal" tone="plate" steps={PILOT_STEPS} label="After the trial" />
          <EditTimeline mode="reveal" steps={EDIT_PRIORITIES.map((p) => ({ name: p, body: '' }))} label="Edit priorities" />
          <EditTimeline mode="stage" steps={JOURNEY.map((s, i) => ({ ...s, who: (['sochu', 'bolu', 'sochu', 'sochu', 'gola'] as const)[i] }))} label="From trial to batch (stage)" />
        </div>
      </Section>

      <Section name="mechanisms" title="MechanismCard and MechanismChip" note="Hover plays a demo once (touch: the card in the middle of the screen). Still: the end frames.">
        <div className="kit-grid">
          {MECHANISMS.map((m, i) => (
            <MechanismCard key={m} name={m} tone={toneAt(i)} />
          ))}
        </div>
        <div className="kit-row" style={{ marginTop: 24 }}>
          {MECHANISMS.slice(0, 6).map((m, i) => (
            <MechanismChip key={m} name={m} tone={toneAt(i)} to="/how-we-work" />
          ))}
        </div>
      </Section>

      <Section name="loop" title="CreativeLoop" note="The dot travels the ring once on view; Sochu speaks when the lap ends." alt>
        <CreativeLoop caption="Every batch teaches us what resonates, so the next one is stronger." />
      </Section>

      <Section name="split" title="ControlSplit" note="Checks pop in order on view; Bolu says his line once.">
        <ControlSplit foot="Our job is to create the strongest possible conditions for interesting reactions, then find and build around the strongest moments in the edit." />
      </Section>

      {/* ---------------- A3: the street ---------------- */}
      <section className="kit-section" data-kit-section="street-hero" style={{ padding: 0 }}>
        <div className="kit-hero">
          <Street variant="hero">
            {v0 && (
              <div className="kit-deck">
                <VideoFrame video={v0} variant="phone" width={220} eager />
              </div>
            )}
            <span className="k-char-slot" style={{ position: 'absolute', left: '34%', bottom: 'var(--floor-back)' }}>
              <Character who="sochu" size={96} />
            </span>
            <span style={{ position: 'absolute', left: '48%', bottom: 'var(--floor-front)' }}>
              <Character who="bolu" size={150} prop>
                <CastBubble who="bolu" line={CAST_LINES['home.hero.intro'].line} show />
              </Character>
            </span>
            <span style={{ position: 'absolute', left: '74%', bottom: 'var(--floor-front)' }}>
              <Character who="tiko" size={160} />
            </span>
            <span style={{ position: 'absolute', left: '86%', bottom: 'var(--floor-back)' }}>
              <Character who="gola" size={104} />
            </span>
          </Street>
          <div className="wrap kit-hero-copy">
            <p className="eyebrow">Street interview videos for D2C brands</p>
            <p className="display-md" style={{ marginTop: 16 }}>
              Turning real reactions into brand content
            </p>
            <p className="lead" style={{ marginTop: 20 }}>
              We take your question to the street, real people answer on camera, and we build the strongest moments into short-form videos.
            </p>
          </div>
        </div>
      </section>

      <section className="kit-section" data-kit-section="street-band" style={{ padding: 0 }}>
        <div className="kit-band">
          <Street variant="band">
            <Character who="bolu" size={132}>
              <CastBubble who="bolu" line={CAST_LINES['trial.hero'].line} show side="end" />
            </Character>
          </Street>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p className="eyebrow">The trial</p>
            <p className="display-md" style={{ marginTop: 16 }}>
              See it on your own brand first
            </p>
          </div>
        </div>
      </section>

      <Section name="street-night" title="Street, band at night (the 404's card)" note="A .band-dark ancestor forces night in both themes.">
        <div className="kit-night band-dark" data-bubble-bounds="" style={{ background: '#121216', ['--street-h' as string]: '300px' }}>
          <Street variant="band" time="night">
            <div className="kit-lineup">
              <Character who="sochu" size={96} onDark />
              <Character who="bolu" size={132} onDark>
                <CastBubble who="bolu" line={CAST_LINES['notFound.ask'].line} show />
              </Character>
              <Character who="tiko" size={120} onDark />
              <Character who="gola" size={104} onDark />
            </div>
          </Street>
          <p className="display-md" style={{ position: 'relative', zIndex: 2 }}>
            Nobody on the street has heard of this page
          </p>
        </div>
      </Section>

      <Section name="vignettes" title="Street vignettes (How we work, chapter 3)" note="Static strings from scripts/street-art.mjs; day and night through the same tokens.">
        <div className="kit-grid">
          {(Object.keys(VIGNETTES) as VignetteName[]).map((k) => (
            <Cell key={k} label={k}>
              <div className="kit-vg">
                <Vignette name={k} />
              </div>
            </Cell>
          ))}
        </div>
      </Section>

      {/* ---------------- A2: tabs ---------------- */}
      <Section name="tabs" title="Tab kit (A2)" note="Segment, ChipRail radio, multi and links, TabBar with TabPanel, IndexRail, LabelRoll and ArrowDisc." alt>
        <div className="kit-grid-wide">
          <Cell label="Segment">
            <Segment
              label="Mode"
              value={seg}
              onChange={setSeg}
              options={[
                { value: 'trial', label: 'Plan a trial' },
                { value: 'question', label: 'Ask a question' },
              ]}
            />
          </Cell>
          <Cell label="ChipRail radio (quick picks)">
            <ChipRail mode="radio" label="Quick picks" value={chip} onChange={setChip} options={['5', '10', '20', '25', '30'].map((v) => ({ value: v, label: v }))} />
          </Cell>
          <Cell label="ChipRail multi (must-haves)">
            <ChipRail
              mode="multi"
              label="Must-haves"
              value={multi}
              onChange={setMulti}
              options={[
                { value: 'product', label: 'Product shots' },
                { value: 'logo', label: 'Logo visible' },
                { value: 'mention', label: 'Brand mention' },
                { value: 'cta', label: 'Call to action' },
              ]}
            />
          </Cell>
          <Cell label="ChipRail links">
            <ChipRail
              mode="links"
              label="Chapters"
              current="/__kit"
              links={[
                { to: '/__kit', label: 'Ch. 1 The idea' },
                { to: '/how-we-work', label: 'Ch. 2 Variety' },
                { to: '/trial', label: 'Ch. 3 Street' },
              ]}
            />
          </Cell>
          <Cell label="TabBar + TabPanel">
            <TabBar
              label="Enquiries"
              idBase="kit-tabs"
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'new', label: 'New', count: 3 },
                { id: 'contacted', label: 'Contacted' },
                { id: 'archived', label: 'Archived' },
              ]}
            />
            <TabPanel idBase="kit-tabs" id={tab} order={['new', 'contacted', 'archived'].indexOf(tab)}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>Panel: {tab}</p>
            </TabPanel>
          </Cell>
          <Cell label="IndexRail">
            <IndexRail
              active="kit-a"
              items={[
                { id: 'kit-a', label: 'The idea' },
                { id: 'kit-b', label: 'Variety' },
                { id: 'kit-c', label: 'On the street' },
              ]}
            />
          </Cell>
          <Cell label="LabelRoll and ArrowDisc">
            <div className="kit-row">
              <button type="button" className="btn btn-ink">
                <LabelRoll>Roll on hover</LabelRoll>
                <ArrowDisc />
              </button>
              <a className="btn btn-ghost" href="https://example.com" target="_blank" rel="noreferrer">
                <LabelRoll>Opens a tab</LabelRoll>
                <ArrowDisc kind="out" />
              </a>
            </div>
          </Cell>
        </div>
      </Section>

      {/* ---------------- A2: frames and video ---------------- */}
      <Section name="frames" title="VideoFrame (A2)" note="phone, card (vertical, landscape, posterless, stored poster), bubble, polaroid, ring; stickers.">
        {isSuccess && v0 && vLand && vNoPoster && vStored ? (
          <div className="kit-row" style={{ alignItems: 'flex-start' }}>
            <Cell label="phone, sticker" style={{ width: 240 }}>
              <VideoFrame video={v0} variant="phone" width={200} onOpen={open} sticker />
            </Cell>
            <Cell label="card, sticker" style={{ width: 240 }}>
              <VideoFrame video={v0} variant="card" onOpen={open} sticker />
            </Cell>
            <Cell label="card, landscape" style={{ width: 360 }}>
              <VideoFrame video={vLand} variant="card" onOpen={open} />
            </Cell>
            <Cell label="card, no poster" style={{ width: 240 }}>
              <VideoFrame video={vNoPoster} variant="card" onOpen={open} />
            </Cell>
            {vNoViews && (
              <Cell label="card, 0 views (no sticker)" style={{ width: 240 }}>
                <VideoFrame video={vNoViews} variant="card" onOpen={open} sticker />
              </Cell>
            )}
            <Cell label="bubble (thread reply)" style={{ width: 220 }}>
              <VideoFrame video={vStored} variant="bubble" width={176} onOpen={open} />
            </Cell>
            <Cell label="polaroid, tilt -4" style={{ width: 240 }}>
              <VideoFrame video={vStored} variant="polaroid" width={180} tilt={-4} />
            </Cell>
            <Cell label="ring, ViewsSticker" style={{ width: 240 }}>
              <div className="kit-row">
                <VideoFrame video={v0} variant="ring" />
                <ViewsSticker views={11000000} pop="none" />
              </div>
            </Cell>
          </div>
        ) : (
          <TileSkeletons count={4} />
        )}
      </Section>

      <Section name="decks" title="FrameDeck, DeckCard, StoryRing, Coverflow (A2)" alt>
        <div className="kit-grid-wide">
          <Cell label="FrameDeck (hero)" style={{ minHeight: 560 }}>
            <FrameDeck videos={isSuccess ? deckOrder(videos, HERO.firstId) : undefined} poster={HERO.poster} onOpen={open} />
          </Cell>
          <Cell label="DeckCard card and polaroid">
            <div className="kit-row">
              <DeckCard videos={videos.slice(0, 3)} to="/video-library" label="View more work">
                View more work
              </DeckCard>
              <DeckCard videos={videos.slice(3, 5)} frame="polaroid" label="Watch the videos">
                Watch the videos
              </DeckCard>
            </div>
          </Cell>
          <Cell label="StoryRing: unseen, seen, selected, dashed">
            <div className="kit-row">
              <StoryRing brand="FyndFlow" onSelect={() => setSelected((s) => !s)} selected={selected} />
              <StoryRing brand="CircleStore.in" seen onSelect={() => undefined} />
              <StoryRing brand="Waxys.in" selected onSelect={() => undefined} />
              <StoryRing brand="Your brand" dashed to="/contact" caption="Your brand" />
            </div>
          </Cell>
          <Cell label="Coverflow">{isSuccess && <Coverflow videos={videos.filter((v) => v.featured)} onOpen={open} label="Featured" />}</Cell>
        </div>
      </Section>

      <Section name="video" title="VideoTile, WatchLinks, BrandPill, PostedOn, player (A2)">
        <div className="kit-grid">
          {videos.slice(0, 4).map((v) => (
            <VideoTile key={v.id} video={v} onOpen={open} sticker />
          ))}
          <Cell label="WatchLinks, BrandPill, PostedOn">
            {v0 && (
              <>
                <WatchLinks links={v0.links} />
                <BrandPill brand={v0.brand} />
                <PostedOn links={v0.links} labelled />
              </>
            )}
          </Cell>
          <Cell label="Open the player">
            <div className="kit-row">
              {['seed-fyndflow', 'seed-brandingbum', 'seed-circlestore-3', 'seed-rode', 'fx-youtube'].map((id) => (
                <button key={id} type="button" className="btn btn-ghost btn-sm" onClick={() => open(id)}>
                  {id.replace('seed-', '')}
                </button>
              ))}
            </div>
          </Cell>
        </div>
        {dialog}
      </Section>

      {/* ---------------- A2: packages and ui ---------------- */}
      <Section name="packages" title="Packages (A2)" alt>
        <PackageCards compact />
        <div style={{ height: 20 }} />
        <AddOnRow />
        <div className="kit-grid" style={{ marginTop: 20 }}>
          {[5, 10, 25, 7, 3].map((q) => (
            <Cell key={q} label={`BatchStrip ${q}`}>
              <BatchStrip quote={quote(q)} />
            </Cell>
          ))}
          <Cell label="BatchStrip animate (stepper)">
            <div className="kit-row">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setN((x) => Math.max(1, x - 5))}>
                Fewer
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setN((x) => Math.min(70, x + 5))}>
                More
              </button>
            </div>
            <BatchStrip quote={quote(n)} animate />
          </Cell>
        </div>
        <div style={{ height: 20 }} />
        <PackageIncludes />
        <div style={{ height: 20 }} />
        <PricingRules />
      </Section>

      <Section name="ui" title="ui.tsx upgrades (A2)">
        <div className="kit-grid-wide">
          <Cell label="PrimaryCta sm / md / lg, Cta kinds">
            <div className="kit-row">
              <PrimaryCta size="sm" />
              <PrimaryCta />
              <PrimaryCta size="lg" />
            </div>
            <div className="kit-row">
              <Cta to="/video-library" kind="ghost" arrow>
                Browse video library
              </Cta>
              <Cta to="/pricing" kind="ink">
                See pricing
              </Cta>
            </div>
          </Cell>
          <Cell label="RollNumber with pop">
            <RollNumber value={n * 7400} prefix="₹" countUp={false} pop />
          </Cell>
          <Cell label="CopyButton, ResultsNote">
            <CopyButton text="kreatorsarmy@gmail.com" />
            <ResultsNote short />
            <ResultsNote />
          </Cell>
          <Cell label="Reveal fade, rise, tilt">
            <div className="kit-row">
              <Reveal>
                <div className="kit-cell kit-alt">fade</div>
              </Reveal>
              <Reveal variant="rise">
                <div className="kit-cell kit-alt">rise</div>
              </Reveal>
              <Reveal variant="tilt">{v0 && <VideoFrame video={v0} variant="card" width={120} />}</Reveal>
            </div>
          </Cell>
          <Cell label="SectionHead scrub">
            <SectionHead eyebrow="Why us" title="We build videos around real reactions." lead="Natural conversations with real people, made into native short-form content." scrub />
          </Cell>
          <Cell label="FaqItem closed and open">
            {FAQS[0] && <FaqItem faq={FAQS[0]} />}
            {FAQS[1] && <FaqItem faq={FAQS[1]} open />}
          </Cell>
        </div>
      </Section>
      <div className="kit-dummy" />
    </div>
  );
}

export default Kit;
