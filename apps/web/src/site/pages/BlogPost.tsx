import type { Video } from '@kreators/shared';
import { ArrowRight } from 'lucide-react';
import { use, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import { ENTRIES, entryBySlug, LIVE_SLUGS, nextEntry, relatedEntries, type BlogEntry } from '../../blog/registry';
import { Inline } from '../../blog/render/Inline';
import { PostView, tocItems } from '../../blog/render/PostView';
import type { Post, VideoBlock, VideoRef } from '../../blog/types';
import { matchVideo } from '../../blog/videoRef';
import { MechanismChip, toneAt } from '../../components/demos';
import { Seo } from '../../components/ui';
import { VideoTile, useVideoPlayer } from '../../components/video';
import { MECHANISMS } from '../../lib/content';
import { useVideos } from '../../lib/queries';
import { NotFound } from '../../screens/NotFound';
import '../../styles/blog.css';
import { useBlogLinks } from './blogLinks';
import { TileVideo } from './blogTileMedia';
import { ReadingProgress, useActiveSection } from './Reading';

// A post (blog/render/PostView.tsx, the same markup the build prerenders) with what only the browser adds: the head tags, the reading progress, the
// section the reader is in, library videos resolved against /api/videos and played in the site's player, and the mechanism chips' demos.
// A quiet reading layout: no cast, no bubbles (content §9.1).

const refsOf = (post: Post): VideoRef[] => [
  ...(post.meta.hero ? [post.meta.hero] : []),
  ...post.body.flatMap((b) => (typeof b !== 'string' && b.type === 'video' ? [b] : [])),
];

const refKey = (r: VideoRef) => `${r.brand}|${r.title}|${r.nth ?? 1}`;

function LibraryVideo({ b, video, pending, onOpen }: { b: VideoBlock; video: Video | null; pending: boolean; onOpen: (v: Video) => void }) {
  const caption = b.caption ? (
    <figcaption>
      <Inline text={b.caption} />
    </figcaption>
  ) : null;
  if (video)
    return (
      <figure className="bp-video" data-state="live" data-aspect={video.aspect}>
        <div className="bp-video-tile">
          <VideoTile video={video} onOpen={onOpen} />
        </div>
        {caption}
      </figure>
    );
  if (pending)
    return (
      <figure className="bp-video" data-state="loading">
        <div className="bp-video-tile">
          <div className="skeleton bp-video-skeleton" />
        </div>
        {caption}
      </figure>
    );
  // No live video by that name (or the library did not answer): the caption alone, and the way to the library.
  if (!caption) return null;
  return (
    <figure className="bp-video" data-state="missing">
      {caption}
      <a className="bp-video-more small" href={`/video-library?q=${encodeURIComponent(b.brand)}`}>
        More from {b.brand} in the video library
        <ArrowRight className="size-4" aria-hidden />
      </a>
    </figure>
  );
}

function Mechanisms({ caption }: { caption?: string }) {
  return (
    <figure className="bp-mechs">
      <ul className="read-mechs" aria-label={caption ?? 'The eleven mechanisms'}>
        {MECHANISMS.map((m, i) => (
          <MechanismChip key={m} as="li" name={m} tone={toneAt(i)} />
        ))}
      </ul>
      {caption && <figcaption className="small">{caption}</figcaption>}
    </figure>
  );
}

function Loaded({ entry }: { entry: BlogEntry }) {
  const post = use(entry.load());
  const { meta } = post;
  const box = useRef<HTMLDivElement>(null);
  const article = useRef<HTMLElement>(null);
  useBlogLinks(box);

  const toc = useMemo(() => tocItems(post), [post]);
  const active = useActiveSection(toc.map((t) => t.id));

  const { data: videos, isPending } = useVideos();
  const resolved = useMemo(() => {
    const map = new Map<string, Video | null>();
    for (const ref of refsOf(post)) map.set(refKey(ref), videos ? matchVideo(ref, videos) : null);
    return map;
  }, [post, videos]);
  const playlist = useMemo(
    () => [...new Map([...resolved.values()].filter((v): v is Video => Boolean(v)).map((v) => [v.id, v])).values()],
    [resolved],
  );
  const player = useVideoPlayer(playlist);

  const related = useMemo(() => relatedEntries(meta, post.related).map((e) => e.meta), [meta, post.related]);
  const summaries = useMemo(() => new Map(ENTRIES.map((e) => [e.slug, e.summary])), []);
  const next = nextEntry(meta.slug)?.meta;

  return (
    <div ref={box}>
      <Seo fullTitle={meta.metaTitle} description={meta.description} canonical={`/blog/${meta.slug}`} noindex={Boolean(meta.draft)} />
      <ReadingProgress target={article} />
      <PostView
        post={post}
        mode="live"
        liveSlugs={LIVE_SLUGS}
        related={related}
        summaries={summaries}
        tileMedia={(m) => <TileVideo video={m.hero && videos ? matchVideo(m.hero, videos) : null} />}
        next={next}
        active={active}
        articleRef={article}
        video={(b) => <LibraryVideo b={b} video={resolved.get(refKey(b)) ?? null} pending={isPending} onOpen={player.open} />}
        mechanisms={(caption) => <Mechanisms caption={caption} />}
      />
      {player.dialog}
    </div>
  );
}

export default function BlogPost() {
  const { slug = '' } = useParams();
  const entry = entryBySlug(slug);
  if (!entry) return <NotFound />;
  return <Loaded key={entry.slug} entry={entry} />;
}
