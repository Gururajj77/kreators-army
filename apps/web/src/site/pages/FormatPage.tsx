import { formatViews, type Video } from '@kreators/shared';
import { ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router';
import { type CharacterHandle } from '../../cast';
import { useCastLine } from '../../components/chat';
import { MechanismChip, toneAt } from '../../components/demos';
import { DeckCard, playLabel } from '../../components/frames';
import { Cta, PrimaryCta, Reveal, whenSeen } from '../../components/ui';
import { VideoTile, useVideoPlayer } from '../../components/video';
import { IDEAS_CAPTION, formatVideos, type CastLineKey, type FormatPageContent, type FormatSlug } from '../../lib/content';
import { useVideos } from '../../lib/queries';
import { posterFirst, shuffleForLoad } from '../../lib/videoFind';
import { TextArrow } from '../../components/TextArrow';

// What Founders, Events and Retail share. Only the small parts: each page owns its own layout.

/** The format's slug, from its path. */
export const formatSlug = (content: FormatPageContent) => content.path.replace('/', '') as FormatSlug;

/** The format's own videos, and one player that steps through them. (r18) In this page load's random order, posters first: the format's own list
 *  shuffled, or, when none of them is live, four drawn at random from the whole library (not always the same top four). */
export function useFormat(content: FormatPageContent) {
  const { data: videos = [], isPending } = useVideos();
  const picks = useMemo(() => {
    const salt = `format:${content.path}`;
    return shuffleForLoad(formatVideos(content, shuffleForLoad(videos, salt, { tier: posterFirst })), salt, { tier: posterFirst });
  }, [content, videos]);
  const player = useVideoPlayer(picks);
  return { picks, player, pending: isPending };
}

/** The page headline, with its one gradient word. */
export function FormatTitle({ content }: { content: FormatPageContent }): ReactNode {
  const [start, middle, end] = content.title;
  return (
    <>
      {start}
      {middle} <span className="g-word">{end.trim()}</span>
    </>
  );
}

/** The hero's two actions. The primary carries the format, so the form opens knowing it (?format=founders). */
export function FormatActions({ content }: { content: FormatPageContent }) {
  return (
    <>
      <PrimaryCta size="lg" intent={{ format: formatSlug(content) }} />
      <Cta to="/video-library" kind="ghost" size="lg" arrow>
        See the work
      </Cta>
    </>
  );
}

/** A reel slot that keeps its 9:16 shape through loading, and still leads somewhere if the videos could not be fetched. */
export function Reel({ video, pending, onOpen, eager, className }: { video?: Video; pending: boolean; onOpen: (video: Video) => void; eager?: boolean; className?: string }) {
  return (
    <div className={`fmt-reel ${className ?? ''}`}>
      {video ? (
        <VideoTile video={video} onOpen={onOpen} eager={eager} sticker />
      ) : pending ? (
        <div className="skeleton" aria-hidden />
      ) : (
        <Link to="/video-library" className="fmt-reel-empty">
          See the work in the video library <ArrowRight className="inline size-4 align-[-2px]" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/**
 * A video as a deck of three posters (M8): the video in front, two more of the format's behind it. The words sit under the stack, untilted. Pressing it
 * opens the player on the front video.
 */
export function VideoDeck({ video, others, pending, onOpen }: { video?: Video; others: Video[]; pending: boolean; onOpen: (video: Video) => void }) {
  if (!video) return <Reel pending={pending} onOpen={onOpen} />;
  return (
    <DeckCard videos={[video, ...others.filter((v) => v.id !== video.id)]} onClick={() => onOpen(video)} label={playLabel(video)} className="fmt-deck">
      <span className="fmt-deck-title">{video.title}</span>
      <span className="fmt-deck-meta">
        {video.brand}
        {video.views > 0 && ` · ${formatViews(video.views)} views`}
      </span>
    </DeckCard>
  );
}

/** "Ideas that suit this format" (content §3.11): four mechanism chips whose demo plays on hover or focus, the caption and the link to How we work. */
export function FormatIdeas({ content }: { content: FormatPageContent }) {
  return (
    <section className="section fmt-ideas-section">
      <div className="wrap fmt-ideas">
        <Reveal variant="rise">
          <h2 className="h3">Ideas that suit this format</h2>
        </Reveal>
        <Reveal as="ul" className="fmt-ideas-list">
          {content.ideas.map((name, i) => (
            <MechanismChip key={name} as="li" name={name} tone={toneAt(i)} />
          ))}
        </Reveal>
        <p className="fmt-ideas-caption">
          {IDEAS_CAPTION}{' '}
          <Link to="/how-we-work" className="fmt-ideas-link">
            <TextArrow lead />How we work
          </Link>
        </p>
      </div>
    </section>
  );
}

/** A character's line, said once when `el` first comes into view (and after `delay`). */
export function useLineOnView(key: CastLineKey, actor: RefObject<CharacterHandle | null>, el: RefObject<HTMLElement | null>, delay = 600) {
  const cast = useCastLine();
  const { say } = cast;
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let t = 0;
    const stop = whenSeen(node, () => {
      t = window.setTimeout(() => void say(key, { by: actor.current }), delay);
    });
    return () => {
      stop();
      window.clearTimeout(t);
    };
  }, [key, actor, el, delay, say]);
  return cast;
}

/** A plain ref for useLineOnView's element, for pages that need one. */
export const useNodeRef = <T extends HTMLElement>() => useRef<T>(null);
