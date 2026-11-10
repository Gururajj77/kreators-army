import type { Video } from '@kreators/shared';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Character } from '../../cast';
import { Cta, Reveal, RollNumber, SectionHead, Tile, type TileTone } from '../../components/ui';
import { TileSkeletons, VideoTile } from '../../components/video';
import { IMPACT, type Stat } from '../../lib/content';
import { motionOk } from '../../lib/motionOk';
import { ReelPause, useReel } from './shared';

/** The biggest tile: a muted loop while it is well in view, poster only for embeds, and always its own pause control. */
function LeadReel({ video, onOpen, paused }: { video: Video; onOpen: (v: Video) => void; paused: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLVideoElement>(null);
  const { wanted, label, toggle, started, shown, onPlaying } = useReel(box, clip, { threshold: 0.6, paused });
  const loops = video.source === 'file';

  return (
    <div ref={box} className="work-reel work-reel-lead" data-playing={shown ? '' : undefined}>
      {loops && <video ref={clip} src={started ? video.ref : undefined} muted loop playsInline preload="none" onPlaying={onPlaying} aria-hidden />}
      <VideoTile video={video} onOpen={onOpen} eager variant="bento" />
      {loops && <ReelPause wanted={wanted} label={label} onToggle={toggle} className="work-pause" />}
    </div>
  );
}

const STAT_TONES: TileTone[] = ['sochu', 'plate', 'plate'];

function StatTile({ stat, tone, i }: { stat: Stat; tone: TileTone; i: number }) {
  return (
    <Reveal i={i + 2} className="work-stat">
      <Tile tone={tone} className="h-full">
        <div className="work-stat-in">
          <p className="work-stat-label">{stat.label}</p>
          <p className="work-stat-figure">
            <RollNumber value={stat.end} suffix={stat.suffix} />
          </p>
        </div>
      </Tile>
    </Reveal>
  );
}

function Rail({ videos, onOpen, loading }: { videos: Video[]; onOpen: (v: Video) => void; loading: boolean }) {
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

  return (
    <div className="rail-wrap">
      <div ref={scroller} className="rail">
        {loading ? (
          <TileSkeletons count={6} className="rail-item" />
        ) : (
          <>
            {videos.map((v) => (
              <div key={v.id} className="rail-item">
                <VideoTile video={v} onOpen={onOpen} variant="rail" />
              </div>
            ))}
            <Tile to="/video-library" tone="ink" className="rail-end rail-item" label="View more work in the video library">
              <span className="h4">View more work</span>
              <ArrowUpRight className="size-6" aria-hidden />
            </Tile>
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

export function Work({ videos, loading, failed, onRetry, onOpen, paused }: { videos: Video[]; loading: boolean; failed: boolean; onRetry: () => void; onOpen: (v: Video) => void; paused: boolean }) {
  const byViews = [...videos].sort((a, b) => b.views - a.views);
  const [first, second, ...rest] = byViews;
  const empty = !loading && !first;

  return (
    <section id="work" className="band-alt">
      <div className="section">
        <div className="wrap work-head">
          <SectionHead
            center={false}
            eyebrow="Work"
            title="Content people actually watch"
            lead="Vox pop means “voice of the people”: short street interviews designed for Reels, Shorts and every short-form platform."
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
          {/* Always mounted, hidden until needed, so the cast's rig is ready for it the moment the request fails. */}
          <div className="work-empty plate" hidden={!empty}>
            <Character who="tiko" size={104} expression="confused" />
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
          {first && (
            <Reveal className="work-slot-lead">
              <LeadReel video={first} onOpen={onOpen} paused={paused} />
            </Reveal>
          )}
          {second && (
            <Reveal i={1} className="work-slot-next">
              <div className="work-reel work-reel-next">
                <VideoTile video={second} onOpen={onOpen} variant="bento" />
              </div>
            </Reveal>
          )}
          {IMPACT.map((stat, i) => (
            <StatTile key={stat.label} stat={stat} tone={STAT_TONES[i] ?? 'plate'} i={i} />
          ))}
        </div>

        {(loading || rest.length > 0) && <Rail videos={rest.slice(0, 6)} onOpen={onOpen} loading={loading} />}
      </div>
    </section>
  );
}
