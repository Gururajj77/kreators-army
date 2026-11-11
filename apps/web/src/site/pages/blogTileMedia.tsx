import type { Video } from '@kreators/shared';
import { useEffect, useLayoutEffect, useMemo, useRef, type FocusEvent as ReactFocusEvent, type PointerEvent as ReactPointerEvent } from 'react';
import type { PostMeta } from '../../blog/types';
import { matchVideo } from '../../blog/videoRef';
import { usePreview } from '../../components/frames';
import { useVideos } from '../../lib/queries';

// (bento10) A blog tile's library video, live pages only: the post's hero video (meta.hero, resolved against /api/videos as the post page does) as a
// phone standing in the tile's art. Its stored hover clip plays under the site's one preview rule (usePreview: a fine pointer resting on the tile or
// keyboard focus, motion allowed, no Save-Data, one video at a time); otherwise the poster stays. No poster, no phone: the art alone, as statically.

export function useHeroVideos(): { find: (meta: PostMeta) => Video | null } {
  const { data: videos } = useVideos();
  return useMemo(
    () => ({
      find: (meta: PostMeta) => (meta.hero && videos ? matchVideo(meta.hero, videos) : null),
    }),
    [videos],
  );
}

export function TileVideo({ video }: { video: Video | null }) {
  return video?.posterUrl ? <Phone key={video.id} video={video} poster={video.posterUrl} /> : null;
}

function Phone({ video, poster }: { video: Video; poster: string }) {
  const box = useRef<HTMLSpanElement>(null);
  // The preview listens on the whole tile (the link), not just the phone.
  const root = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    root.current = box.current?.closest<HTMLElement>('.bb-tile') ?? null;
  }, []);
  const preview = usePreview(video, { mode: 'hover', root });

  const bind = useRef(preview.bind);
  bind.current = preview.bind;
  const { stop } = preview;
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const enter = (e: PointerEvent) => bind.current.onPointerEnter(e as unknown as ReactPointerEvent);
    const leave = () => bind.current.onPointerLeave();
    const focus = () => bind.current.onFocus({ currentTarget: el } as unknown as ReactFocusEvent);
    const blur = () => bind.current.onBlur();
    const press = () => stop();
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focus', focus);
    el.addEventListener('blur', blur);
    el.addEventListener('click', press);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focus', focus);
      el.removeEventListener('blur', blur);
      el.removeEventListener('click', press);
    };
  }, [stop]);

  return (
    <span ref={box} className="bb-phone" data-playing={preview.playing ? '' : undefined}>
      <img src={poster} alt="" loading="lazy" decoding="async" draggable={false} />
      {preview.node}
    </span>
  );
}
