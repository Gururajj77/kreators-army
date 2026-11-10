import type { Video } from '@kreators/shared';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Cta, PrimaryCta } from '../../components/ui';
import { VideoTile, useVideoPlayer } from '../../components/video';
import { formatVideos, type FormatPageContent } from '../../lib/content';
import { useVideos } from '../../lib/queries';

// What Founders, Events and Retail share. Only the small parts: each page owns its own layout.

/** The format's own videos, and one player that steps through them. */
export function useFormat(content: FormatPageContent) {
  const { data: videos = [], isPending } = useVideos();
  const picks = formatVideos(content, videos);
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

export function FormatActions() {
  return (
    <>
      <PrimaryCta size="lg" magnet />
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
        <VideoTile video={video} onOpen={onOpen} eager={eager} />
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
