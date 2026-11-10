import type { Video } from '@kreators/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { DeckCard, ReelPause, previewAllowed, usePlayback } from '../../components/frames';
import { Cta, Reveal, RollNumber, SectionHead, Tile, type TileTone, whenSeen } from '../../components/ui';
import { TileSkeletons, VideoTile } from '../../components/video';
import { IMPACT, RESULTS_NOTE, type Stat } from '../../lib/content';
import { motionOk } from '../../lib/motionOk';

// Work (V2-SPEC 5.2 row 2): the two biggest reels as card frames with stickers, three stat tiles with the odometer, then the rail, whose frames tip in
// (M10) and which ends on a deck of posters. Reel 1 previews by the one rule of 3.4 (desktop only, one video on the page at a time: the hero deck's
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

const STAT_TONES: TileTone[] = ['sochu', 'plate', 'plate'];

function StatTile({ stat, tone, i, last }: { stat: Stat; tone: TileTone; i: number; last: boolean }) {
  return (
    <Reveal i={i + 2} className="work-stat">
      <Tile tone={tone} className="h-full">
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

export function Work({ videos, loading, failed, onRetry, onOpen }: { videos: Video[]; loading: boolean; failed: boolean; onRetry: () => void; onOpen: (v: Video) => void }) {
  const byViews = [...videos].sort((a, b) => b.views - a.views);
  const [first, second, ...rest] = byViews;
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

        <div className="wrap work-bento" data-single={!second && !empty && !loading ? '' : undefined}>
          {loading && (
            <>
              <div className="work-slot-lead">
                <div className="work-reel skeleton" />
              </div>
              <div className="work-slot-next">
                <div className="work-reel skeleton" />
              </div>
            </>
          )}
          <WorkEmpty failed={failed} onRetry={onRetry} shown={empty} />
          {first && (
            <Reveal className="work-slot-lead">
              <LeadReel video={first} onOpen={onOpen} />
            </Reveal>
          )}
          {second && (
            <Reveal i={1} className="work-slot-next">
              <div className="work-reel work-reel-next">
                <VideoTile video={second} onOpen={onOpen} variant="bento" sticker />
              </div>
            </Reveal>
          )}
          {IMPACT.map((stat, i) => (
            <StatTile key={stat.label} stat={stat} tone={STAT_TONES[i] ?? 'plate'} i={i} last={i === IMPACT.length - 1} />
          ))}
        </div>

        {(loading || rest.length > 0) && <Rail videos={rest.slice(0, 6)} all={byViews} onOpen={onOpen} loading={loading} />}
      </div>
    </section>
  );
}
