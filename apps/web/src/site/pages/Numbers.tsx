import { formatViews, videoPoster, type Video } from '@kreators/shared';
import { Play } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { BrandPill, useVideoPlayer } from '../../components/video';
import { Bento, Cta, HeroCopy, Reveal, RollNumber, SectionHead, Seo, Tile, TileBody, whenSeen } from '../../components/ui';
import { IMPACT, TEAM, type Stat } from '../../lib/content';
import { useVideos } from '../../lib/queries';

const DOTS = Array.from({ length: 100 }, (_, i) => i);

/** One idea per tile: the number, what it counts. */
function Figure({ stat, big }: { stat: Stat; big?: boolean }) {
  return (
    <div className="nb-figure" data-big={big ? '' : undefined}>
      <p className="nb-label">{stat.label}</p>
      <p className="nb-value">
        <RollNumber value={stat.end} suffix={stat.suffix} />
      </p>
    </div>
  );
}

/** 99 of 100, drawn honestly: one dot left open. Decorative; the number beside it says the same. */
function DotField({ filled }: { filled: number }) {
  return (
    <div className="nb-dots" aria-hidden>
      {DOTS.map((i) => (
        <span key={i} data-on={i < filled ? '' : undefined} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  );
}

/** Sochu's one moment: the count lands, its eyes open once. Nothing else on this page performs. */
function ViewsTile({ stat }: { stat: Stat }) {
  const tile = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLDivElement>(null);
  const sochu = useRef<CharacterHandle>(null);

  useEffect(() => {
    const el = tile.current;
    if (!el) return;
    let timer = 0;
    // Sochu rests with drawn eyes, so it opens them to look, and the look runs on into 'surprised' rather than ending as the ball eyes arrive.
    const stop = whenSeen(el, () => {
      if (number.current) sochu.current?.lookAt(number.current, 2000);
      sochu.current?.setExpression('open', { hold: 900 });
      timer = window.setTimeout(() => sochu.current?.setExpression('surprised', { hold: 1200 }), 850);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Reveal className="nb-cell nb-wide">
      <Tile tone="ink" className="h-full">
        <div ref={tile} className="nb-hero-tile">
          <div ref={number}>
            <Figure stat={stat} big />
          </div>
          <div className="nb-sochu">
            <Character ref={sochu} who="sochu" size="clamp(112px, 12vw, 150px)" prop />
          </div>
        </div>
      </Tile>
    </Reveal>
  );
}

function Thumb({ video }: { video: Video }) {
  const poster = videoPoster(video);
  return <span className="nb-thumb">{poster ? <img src={poster} alt="" loading="lazy" /> : <span className="nb-thumb-empty">{video.brand.charAt(0)}</span>}</span>;
}

function Ranking() {
  const { data: videos, isLoading, isError, refetch } = useVideos();
  const ranked = [...(videos ?? [])].sort((a, b) => b.views - a.views);
  const player = useVideoPlayer(ranked);

  if (isLoading)
    return (
      <div className="frame nb-board" aria-busy="true">
        <span className="sr-only">Loading videos</span>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton nb-skeleton" />
        ))}
      </div>
    );

  if (isError)
    return (
      <div className="frame nb-board nb-state" role="status">
        <p className="h4">The ranking did not load</p>
        <p className="text-muted">Something went wrong on our side. The numbers above are still right.</p>
        <Cta kind="ghost" onClick={() => void refetch()}>
          Try again
        </Cta>
      </div>
    );

  if (!ranked.length)
    return (
      <div className="frame nb-board nb-state">
        <p className="h4">No videos in the ranking yet</p>
        <p className="text-muted">New street interviews appear here as soon as they go live.</p>
        <Cta to="/video-library" kind="ghost">
          Video library
        </Cta>
      </div>
    );

  // View counts run from 50K to 11M. One linear scale would leave every bar but the leader as a sliver, so when the leader is an outlier the others share a scale and the leader's bar runs off it, marked as such.
  const [first, second] = ranked;
  const leaderBreaks = Boolean(first && second && first.views > second.views * 3);
  const scale = (leaderBreaks ? second?.views : first?.views) ?? 1;
  const total = ranked.reduce((sum, v) => sum + v.views, 0);

  return (
    <>
      <p className="nb-selection">
        {ranked.length} {ranked.length === 1 ? 'video' : 'videos'}, {formatViews(total)} views between them
      </p>
      <Reveal as="ol" className="frame nb-board">
        {ranked.map((v, i) => {
          const off = leaderBreaks && i === 0;
          const pct = off ? 100 : Math.max(2, Math.round((v.views / scale) * 100));
          return (
            <li key={v.id} className="nb-row-wrap" style={{ '--i': i } as CSSProperties}>
              <button type="button" className="nb-row" data-lead={i === 0 ? '' : undefined} onClick={() => player.open(v)} aria-label={`Number ${i + 1}: ${v.title} by ${v.brand}. ${formatViews(v.views)} views. Play video.`}>
                <span className="nb-rank">{i + 1}</span>
                <Thumb video={v} />
                <span className="nb-info">
                  <span className="nb-title">{v.title}</span>
                  <span className="nb-brand">
                    <BrandPill brand={v.brand} />
                  </span>
                </span>
                <span className="nb-bar" aria-hidden>
                  <span className="nb-fill" data-off={off ? '' : undefined} style={{ width: `${pct}%` }} />
                </span>
                <span className="nb-views">{formatViews(v.views)}</span>
                <span className="nb-play" aria-hidden>
                  <Play className="size-3.5 fill-current" />
                </span>
              </button>
            </li>
          );
        })}
      </Reveal>
      {leaderBreaks && <p className="nb-note">Bars share one scale. The first video runs off the end of it.</p>}
      {player.dialog}
    </>
  );
}

export default function Numbers() {
  const views = IMPACT[0];
  const followers = IMPACT[1];
  const engagement = IMPACT[2];
  const people = TEAM[0];
  const projects = TEAM[1];
  const satisfaction = TEAM[2];

  return (
    <>
      <Seo title="The numbers" description="The reach behind Kreators.Army vox pop street interviews, video by video." />

      <section className="nb-top">
        <div className="ground" aria-hidden />
        <div className="wrap nb-top-in">
          <HeroCopy
            eyebrow="The numbers"
            titleClass="display"
            title={
              <>
                The work, <span className="g-word">counted</span>
              </>
            }
          />
          <p className="lead nb-top-lead">The reach behind the work, and a selection of videos ranked by the views they earned.</p>
        </div>
      </section>

      <section className="wrap">
        <Bento className="nb-bento">
          {views && <ViewsTile stat={views} />}
          {followers && (
            <Reveal i={1} className="nb-cell">
              <Tile className="h-full">
                <TileBody>
                  <Figure stat={followers} />
                </TileBody>
              </Tile>
            </Reveal>
          )}
          {engagement && (
            <Reveal i={2} className="nb-cell">
              <Tile className="h-full">
                <TileBody>
                  <Figure stat={engagement} />
                </TileBody>
              </Tile>
            </Reveal>
          )}
          {people && (
            <Reveal i={3} className="nb-cell">
              <Tile className="h-full">
                <TileBody>
                  <Figure stat={people} />
                </TileBody>
              </Tile>
            </Reveal>
          )}
          {projects && (
            <Reveal i={4} className="nb-cell">
              <Tile className="h-full">
                <TileBody>
                  <Figure stat={projects} />
                </TileBody>
              </Tile>
            </Reveal>
          )}
          {satisfaction && (
            <Reveal i={5} className="nb-cell nb-wide">
              <Tile tone="tiko" className="h-full">
                <div className="nb-sat">
                  <Figure stat={satisfaction} big />
                  <DotField filled={satisfaction.end} />
                </div>
              </Tile>
            </Reveal>
          )}
        </Bento>
      </section>

      <section className="section">
        <div className="wrap nb-rank-in">
          <SectionHead center={false} title="Video by video" lead={`A selection of our videos, ranked by the views each one earned. A sample of the work, not the whole ${views ? `${views.end}${views.suffix}` : 'library'}.`} />
          <Ranking />
        </div>
      </section>
    </>
  );
}
