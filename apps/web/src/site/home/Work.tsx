import type { Video } from '@kreators/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { DeckCard, ReelPause, deckOrder, previewAllowed, usePlayback } from '../../components/frames';
import { Cta, Reveal, RollNumber, SectionHead, Tile, whenSeen } from '../../components/ui';
import { TileSkeletons, VideoTile } from '../../components/video';
import { IMPACT, RESULTS_NOTE, type Stat } from '../../lib/content';
import { posterFirst, randomPool, shuffleForLoad } from '../../lib/videoFind';
import { motionOk } from '../../lib/motionOk';

// Work (V2-SPEC 5.2 row 2): the three biggest reels as full 9:16 frames with stickers (home11: the lead used to be a near-square cell that cropped the
// vertical video; now every reel shows whole), three stat tiles with the odometer, then the rail, whose frames tip in (M10) and which ends on a deck of
// posters. Reel 1 previews by the one rule of 3.4 (desktop only, one video on the page at a time: the hero deck's
// front card has the token first, and Reel 1 takes it when the deck leaves the screen).

/** The biggest tile: a muted preview while it is well in view (where the device and the video allow it), and its own pause control then. */
function LeadReel({ video, onOpen }: { video: Video; onOpen: (v: Video) => void }) {
  const { wanted, label, toggle } = usePlayback();
  const [allowed, setAllowed] = useState(false);
  // Read after mount: the device's pointer and Save-Data are the browser's, not the first render's.
  useEffect(() => setAllowed(previewAllowed(video)), [video]);
  return (
    <div className="work-reel work-reel-lead">
      <VideoTile video={video} onOpen={onOpen} eager variant="bento" sticker preview="active" active={wanted} />
      {allowed && <ReelPause wanted={wanted} label={label} onToggle={toggle} className="work-pause" />}
    </div>
  );
}

// The stat cards are plain plates: the shared liquid glass (components.css, .lglass) with its hover ring.
function StatTile({ stat, i, last }: { stat: Stat; i: number; last: boolean }) {
  return (
    <Reveal i={i + 3} className="work-stat">
      <Tile className="h-full">
        <div className="work-stat-in">
          <p className="work-stat-label">{stat.label}</p>
          <p className="work-stat-figure">
            <RollNumber value={stat.end} suffix={stat.suffix} />
          </p>
          {last && <p className="work-stat-note">{RESULTS_NOTE.short}</p>}
        </div>
      </Tile>
    </Reveal>
  );
}

function Rail({ videos, all, onOpen, loading }: { videos: Video[]; all: Video[]; onOpen: (v: Video) => void; loading: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const start = el.scrollLeft < 8;
    const end = el.scrollLeft + el.clientWidth > el.scrollWidth - 8;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [measure, loading]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.72, behavior: motionOk() ? 'smooth' : 'auto' });
  };

  // The end deck shows three of the library's posters: the rail's own last ones, else any.
  const deck = [...videos.slice(-3).reverse(), ...all].filter((v, i, list) => list.findIndex((x) => x.id === v.id) === i).slice(0, 3);

  return (
    <div className="rail-wrap">
      <div ref={scroller} className="rail">
        {loading ? (
          <TileSkeletons count={6} className="rail-item" />
        ) : (
          <>
            {videos.map((v, i) => (
              <Reveal key={v.id} variant="tilt" i={i % 6} className="rail-item">
                <VideoTile video={v} onOpen={onOpen} variant="rail" sticker />
              </Reveal>
            ))}
            <div className="rail-item rail-end">
              <DeckCard videos={deck} to="/video-library" label="View more work in the video library">
                <span className="rail-end-title">View more work</span>
              </DeckCard>
            </div>
          </>
        )}
      </div>
      <div className="wrap rail-controls" data-off={loading || (edges.start && edges.end) ? '' : undefined}>
        <button type="button" className="rail-paddle" onClick={() => page(-1)} disabled={edges.start} aria-label="Previous videos">
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button type="button" className="rail-paddle" onClick={() => page(1)} disabled={edges.end} aria-label="More videos">
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** No reels: the empty library or a failed request. Tiko says the matching line once, when the plate comes into view. */
function WorkEmpty({ failed, onRetry, shown }: { failed: boolean; onRetry: () => void; shown: boolean }) {
  const tiko = useRef<CharacterHandle>(null);
  const plate = useRef<HTMLDivElement>(null);
  const cast = useCastLine();
  const { say } = cast;
  const key = failed ? 'home.work.error' : 'home.work.empty';

  useEffect(() => {
    const el = plate.current;
    if (!el || !shown) return;
    return whenSeen(el, () => void say(key, { by: tiko.current }));
  }, [shown, key, say]);

  return (
    // Always mounted, hidden until needed, so the cast's rig is ready for it the moment the request fails.
    <div ref={plate} className="work-empty plate" hidden={!shown} data-bubble-bounds="">
      <Character ref={tiko} who="tiko" size={104} expression="confused">
        <CastBubble {...cast.bubble(key)} />
      </Character>
      <p className="h4 m-0">{failed ? 'The reels did not load this time.' : 'New reels are on their way.'}</p>
      {failed ? (
        <Cta kind="ghost" size="sm" onClick={onRetry}>
          Try again
        </Cta>
      ) : (
        <Cta to="/contact" kind="ghost" size="sm">
          Ask us for examples
        </Cta>
      )}
    </div>
  );
}

const SLOTS = ['a', 'b', 'c'] as const;
/** The rail's own reels after the bento's (a phone's third pick leads it). */
const RAIL = 6;
/** The bento's frames are 9:16: vertical reels before landscape ones, posters first within each. */
const bentoTier = (v: Video) => (v.aspect === 'landscape' ? 2 : 0) + posterFirst(v);

// (work16) Phones show two reels in the bento and move the third to the head of the rail, and put the results note under the stats row.
const PHONE = '(max-width: 734px)';
const onPhoneChange = (cb: () => void) => {
  const q = matchMedia(PHONE);
  q.addEventListener('change', cb);
  return () => q.removeEventListener('change', cb);
};
const usePhone = () => useSyncExternalStore(onPhoneChange, () => matchMedia(PHONE).matches, () => false);

export function Work({ videos, loading, failed, onRetry, onOpen }: { videos: Video[]; loading: boolean; failed: boolean; onRetry: () => void; onOpen: (v: Video) => void }) {
  const phone = usePhone();
  const slots = phone ? 2 : SLOTS.length;
  // (r18) This page load's random order (the same on every render of the visit, new on each load), so every reel gets its turn here. The bento's
  // three frames are 9:16, so vertical reels with a poster take them first (a landscape one would be cropped, a posterless one is a blank card);
  // the rail gets the rest in the same order, posters first.
  // (r19) Only brands with 2 or more videos are dealt here (lib/videoFind randomPool); a brand's only video fills in just when the bento and the
  // rail would otherwise be short.
  // (r19fix) Top-ups follow the bento's own rule too: vertical reels with a poster first.
  const pool = useMemo(() => randomPool(videos, SLOTS.length + RAIL, 'work', videos, bentoTier), [videos]);
  const mixed = useMemo(() => shuffleForLoad(pool, 'work', { tier: bentoTier }), [pool]);
  const order = [...mixed];
  // The hero's front reel (the same random deck, deckOrder) never opens the bento. (homefix17) Phones: the hero has just shown it alone, so the two
  // bento reels are the next ones and that reel leads the rail; wider screens move it to the bento's second frame.
  const heroFront = deckOrder(videos)[0];
  const heroAt = heroFront ? order.indexOf(heroFront) : -1;
  if (phone && heroAt >= 0 && heroAt < slots && order.length > slots) order.splice(slots, 0, ...order.splice(heroAt, 1));
  else if (!phone && heroAt === 0 && order.length > 1) order.splice(1, 0, ...order.splice(0, 1));
  const picks = order.slice(0, SLOTS.length);
  const reels = picks.slice(0, slots);
  // Phones: the third pick (the hero's front reel, when it was moved) leads the rail, then the rail's usual six.
  const rest = useMemo(() => shuffleForLoad(pool, 'work', { tier: posterFirst }), [pool]);
  const rail = [...picks.slice(slots), ...rest.filter((v) => !picks.includes(v)).slice(0, RAIL)];
  const [first] = reels;
  const empty = !loading && !first;

  return (
    <section id="work" className="work-section">
      <div className="section">
        <div className="wrap work-head">
          <SectionHead
            center={false}
            eyebrow="Work"
            title="Content people actually watch"
            lead={'Vox pop means "voice of the people": short street interviews made for Reels, Shorts and every short-form feed.'}
            action={
              <Cta to="/video-library" kind="ghost" arrow>
                View more work
              </Cta>
            }
          />
        </div>

        <div className="wrap work-bento" data-reels={loading ? slots : empty ? undefined : reels.length}>
          {loading &&
            SLOTS.slice(0, slots).map((k) => (
              <div key={k} className={`work-slot work-slot-${k}`}>
                <div className="work-reel skeleton" />
              </div>
            ))}
          <WorkEmpty failed={failed} onRetry={onRetry} shown={empty} />
          {reels.map((v, i) => (
            <Reveal key={v.id} i={i} className={`work-slot work-slot-${SLOTS[i]}`}>
              {i === 0 ? (
                <LeadReel video={v} onOpen={onOpen} />
              ) : (
                <div className="work-reel">
                  <VideoTile video={v} onOpen={onOpen} variant="bento" sticker />
                </div>
              )}
            </Reveal>
          ))}
          {/* The stats share the bento's grid on tablets and desktops (display: contents) and make their own row of three on phones. */}
          <div className="work-stats">
            {IMPACT.map((stat, i) => (
              <StatTile key={stat.label} stat={stat} i={i} last={!phone && i === IMPACT.length - 1} />
            ))}
            {phone && <p className="work-stat-note work-stats-note">{RESULTS_NOTE.short}</p>}
          </div>
        </div>

        {(loading || rail.length > 0) && <Rail videos={rail} all={rest} onOpen={onOpen} loading={loading} />}
      </div>
    </section>
  );
}
