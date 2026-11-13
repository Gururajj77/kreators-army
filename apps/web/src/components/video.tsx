// Tiles and the player. Tiles are `card` frames (frames.tsx); the player is v1's native <dialog> with the tile-to-player morph, prev and next and arrow
// keys (V1-SPEC 4 contract). (pub8) What it plays: a MEGA entry opens MEGA's own embed player straight away (the Worker never streams MEGA: on
// Cloudflare's free plan a decrypted range ran out of CPU and died as a 503); a MEGA file inside a shared folder has no embed, so it plays its bundled
// copy when it has one, else offers MEGA's own page in a new tab; a bundled file plays in the native <video>; YouTube and wave.video in their embeds.
//
// The morph: `layoutId` is shared between the player's frame and an empty anchor the player mounts inside the frame that was pressed. Frames never hold
// a Motion node, so a page with a hundred tiles measures nothing. Motion cannot change a layoutId once mounted and promotes whichever element mounted
// last, so the order matters: anchor first, one commit later the frame. See VideoPlayerDialog.

import { formatViews, isMegaEmbed, playerEmbedSrc, type Video } from '@kreators/shared';
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { AnimatePresence, PresenceContext, m, useIsPresent } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { motionOk } from '../lib/motionOk';
import { uploadMonth } from '../lib/videoFind';
import { spring } from '../lib/spring';
import { BrandPill, InstagramGlyph, PostedOn, TileEmpty, VideoFrame, YouTubeGlyph, launched, launchedEl, markBrandSeen, videoToken } from './frames';
import { ArrowDisc, LabelRoll } from './tabs';
import { PrimaryCta } from './ui';

export { BrandPill, PostedOn };

// The glide spring, with an end point. A spring's long tail is invisible, but the dialog stays modal and the media waits until it is over,
// so "landed" is declared when what's left is under a couple of pixels. Going home can stop far earlier: the frame has already faded by then.
const GLIDE_OUT = { ...spring.glide, restDelta: 2, restSpeed: 25 };
const GLIDE_HOME = { ...spring.glide, restDelta: 20, restSpeed: 150 };

function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

function tileFor(id: string, visibleOnly: boolean): HTMLElement | null {
  // The frame the visitor pressed wins over another copy of the same video (the library's coverflow and grid).
  const pressed = launchedEl(id);
  if (pressed && (!visibleOnly || onScreen(pressed))) return pressed;
  const all = document.querySelectorAll<HTMLElement>(`[data-video-tile="${CSS.escape(id)}"]`);
  for (const el of all) if (onScreen(el)) return el;
  return visibleOnly ? null : (all[0] ?? null);
}

// ---------- Tiles ----------

export interface VideoTileProps {
  video: Video;
  onOpen: (video: Video) => void;
  eager?: boolean;
  className?: string;
  /** "bento" fills its cell instead of keeping 9:16. "rail" is a card in a horizontal rail. Default is the library grid tile. */
  variant?: 'bento' | 'rail' | (string & {});
  /** The views chip as a tilted sticker that pops once on view (M8). Default false: v1's flat chip. */
  sticker?: boolean;
  /** Muted preview: 'hover' (default, desktop only, after 300 ms), 'active' with `active`, or 'none'. */
  preview?: 'hover' | 'active' | 'none';
  active?: boolean;
  /** A small "Nov 2026" chip when the video has an upload date (the library). Nothing when it has none. */
  date?: boolean;
}

/** A video as a `card` frame: poster, scrim, play disc, views, brand pill and "Also on" marks. Opens the player with the morph. */
export function VideoTile({ video, onOpen, eager, className, variant, sticker = false, preview = 'hover', active, date = false }: VideoTileProps) {
  return <VideoFrame video={video} variant="card" onOpen={onOpen} eager={eager} className={className} tileVariant={variant} sticker={sticker} preview={preview} active={active} date={date} />;
}

export function TileSkeletons({ count, className }: { count: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton tile-skeleton ${className ?? ''}`} />
      ))}
    </>
  );
}

// ---------- Watch links ----------

/**
 * "Watch on Instagram ↗" and "Watch on YouTube ↗" for the links that exist (content §3.6). New tab, rel="noopener noreferrer", label roll and an
 * arrow disc that carries the ↗. The addresses are the API's canonical ones, rebuilt from parsed ids.
 */
export function WatchLinks({ links, className }: { links: Video['links']; className?: string }) {
  const items = [
    links.instagram && { href: links.instagram, label: 'Watch on Instagram', Glyph: InstagramGlyph },
    links.youtube && { href: links.youtube, label: 'Watch on YouTube', Glyph: YouTubeGlyph },
  ].filter((x): x is { href: string; label: string; Glyph: typeof InstagramGlyph } => Boolean(x));
  if (items.length === 0) return null;
  return (
    <div className={`watch-links ${className ?? ''}`}>
      {items.map(({ href, label, Glyph }) => (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="watch-link">
          <Glyph className="watch-glyph" />
          <LabelRoll>{label}</LabelRoll>
          <ArrowDisc kind="out" />
        </a>
      ))}
    </div>
  );
}

// ---------- The player's media ----------

type Media =
  | { kind: 'stream'; src: string }
  | { kind: 'embed'; src: string; mega: boolean }
  /** MEGA's own page, opened in a new tab (a MEGA file inside a shared folder has no embed player). */
  | { kind: 'watch'; href: string }
  | { kind: 'failed' };

/** What a failing video settled on, so a second open in the same page view starts there (V2-SPEC 3.4: "once per video per page view"). */
const settled = new Map<string, Media>();

const NO_PLAY_MS = 8000;
/** An embed whose load event never comes (blocked, offline) still replaces the poster after this; MEGA's page does more before it paints. */
const EMBED_READY_MS = { mega: 4000, other: 2000 };

/** Where a MEGA entry with no embed goes when its bundled copy is missing or fails: MEGA's own page, else the message. */
const afterStream = (video: Video): Media => (video.watchUrl ? { kind: 'watch', href: video.watchUrl } : { kind: 'failed' });

function firstMedia(video: Video): Media {
  const known = settled.get(video.id);
  if (known) return known;
  // MEGA's embed, straight away: only a clean embed address (one public file) goes into the iframe, with MEGA's own autoplay option.
  if (isMegaEmbed(video.embedUrl)) return { kind: 'embed', src: playerEmbedSrc(video.embedUrl), mega: true };
  if (video.source === 'mega') return video.fallbackUrl ? { kind: 'stream', src: video.fallbackUrl } : afterStream(video);
  if (video.streamUrl) return { kind: 'stream', src: video.streamUrl };
  if (video.embedUrl) return { kind: 'embed', src: video.embedUrl, mega: false };
  return afterStream(video);
}

/** The player itself. Mounted only once the frame has landed: media under a scaling transform is heavy and distorts. */
function PlayerMedia({ video, onRetry }: { video: Video; onRetry: () => void }) {
  const [media, setMedia] = useState<Media>(() => firstMedia(video));
  const [embedReady, setEmbedReady] = useState(false);
  const el = useRef<HTMLVideoElement>(null);
  const playedOnce = useRef(false);

  const fail = () => {
    if (media.kind !== 'stream') return;
    const next = afterStream(video);
    settled.set(video.id, next);
    setMedia(next);
  };

  // No 'playing' and no picture within 8 s of opening counts as a failure. A paused stream that has data (autoplay refused) is not a failure.
  useEffect(() => {
    if (media.kind !== 'stream') return;
    playedOnce.current = false;
    const t = window.setTimeout(() => {
      const v = el.current;
      if (playedOnce.current || (v && v.readyState >= 2)) return;
      fail();
    }, NO_PLAY_MS);
    return () => window.clearTimeout(t);
    // fail reads the current media; the timer restarts with each new source
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  useEffect(() => {
    if (media.kind !== 'embed') return;
    // An embed whose load event never comes (blocked, offline) must not leave the poster standing in for it forever.
    const t = window.setTimeout(() => setEmbedReady(true), media.mega ? EMBED_READY_MS.mega : EMBED_READY_MS.other);
    return () => window.clearTimeout(t);
  }, [media]);

  if (media.kind === 'embed') {
    return (
      <>
        {!embedReady && <span className="player-loading" role="status" aria-label="Loading video" />}
        <iframe
          className="player-embed"
          data-ready={embedReady ? '' : undefined}
          src={media.src}
          title={`${video.title}, ${video.brand}`}
          allow={media.mega ? 'autoplay; fullscreen' : 'autoplay; encrypted-media; picture-in-picture; fullscreen'}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setEmbedReady(true)}
        />
      </>
    );
  }

  if (media.kind === 'watch') {
    return (
      <div className="player-failed player-watch-out" role="status">
        <p className="player-failed-text">This video opens in a new tab.</p>
        <div className="watch-links player-failed-links">
          <a href={media.href} target="_blank" rel="noopener noreferrer" className="watch-link">
            <LabelRoll>Watch the full video</LabelRoll>
            <ArrowDisc kind="out" />
          </a>
        </div>
      </div>
    );
  }

  if (media.kind === 'failed') {
    const hasLinks = Boolean(video.links.instagram || video.links.youtube);
    return (
      <div className="player-failed" role="status">
        <p className="player-failed-text">This video can't play here right now.</p>
        {hasLinks ? (
          <WatchLinks links={video.links} className="player-failed-links" />
        ) : (
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => {
              settled.delete(video.id);
              onRetry();
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <video
      key={media.src}
      ref={el}
      className="player-video"
      src={media.src}
      poster={video.posterUrl ?? undefined}
      controls
      autoPlay
      playsInline
      preload="metadata"
      onPlaying={() => {
        playedOnce.current = true;
      }}
      onError={fail}
    />
  );
}

const pageTransition = { x: spring.snappy, opacity: { duration: 0.18, ease: 'easeOut' }, scale: spring.snappy } as const;

export interface PlayerPosition {
  index: number;
  total: number;
}

interface UpNextItem {
  video: Video;
  onSelect: () => void;
}

function PlayerDetails({ video, position, upNext, onPrev, onNext }: { video: Video; position?: PlayerPosition; upNext?: UpNextItem[]; onPrev?: () => void; onNext?: () => void }) {
  // Only what the video has: no views, category, platform or date means no row for it, and no list at all when none is there.
  const uploaded = uploadMonth(video.uploadDate);
  const facts = [video.category && { label: 'Category', value: video.category }, video.platform && { label: 'Platform', value: video.platform }, uploaded && { label: 'Uploaded', value: uploaded }].filter(
    (f): f is { label: string; value: string } => Boolean(f),
  );
  return (
    <>
      <div className="player-head">
        <BrandPill brand={video.brand} />
        {position && (
          <span className="player-index">
            <span className="sr-only">Video </span>
            {position.index + 1} of {position.total}
          </span>
        )}
      </div>
      <h2 className="player-title">{video.title}</h2>
      {(video.views > 0 || facts.length > 0) && (
        <dl className="player-facts">
          {video.views > 0 && (
            <div className="player-views">
              <dt>Views</dt>
              <dd>{formatViews(video.views)}</dd>
            </div>
          )}
          {facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <WatchLinks links={video.links} className="player-watch" />
      {upNext && upNext.length > 0 && (
        <nav className="player-next" aria-label="Up next">
          <h3>Up next</h3>
          {upNext.map(({ video: v, onSelect }) => (
            <button key={v.id} type="button" className="player-next-row" onClick={onSelect}>
              <span className="player-next-thumb">{v.posterUrl ? <img src={v.posterUrl} alt="" loading="lazy" /> : <TileEmpty video={v} />}</span>
              <span className="player-next-text">
                <span className="player-next-title">{v.title}</span>
                <span className="player-next-brand">{v.views > 0 ? `${v.brand} · ${formatViews(v.views)} views` : v.brand}</span>
              </span>
            </button>
          ))}
        </nav>
      )}
      <div className="player-actions">
        <p className="player-ask">Want one for your brand?</p>
        {(onPrev || onNext) && (
          <div className="player-steps">
            <button type="button" className="nav-icon player-step" onClick={onPrev} disabled={!onPrev} aria-label="Previous video">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" className="nav-icon player-step" onClick={onNext} disabled={!onNext} aria-label="Next video">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        )}
        <PrimaryCta className="player-cta" chrome />
      </div>
    </>
  );
}

function PlayerPage({
  video,
  fromTile,
  radius,
  position,
  upNext,
  dir,
  closing,
  flying,
  onPrev,
  onNext,
}: {
  video: Video;
  fromTile: boolean;
  radius: number;
  position?: PlayerPosition;
  upNext?: UpNextItem[];
  dir: number;
  closing: boolean;
  flying: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const [landed, setLanded] = useState(false);
  const [retry, setRetry] = useState(0);
  const poster = video.posterUrl;

  // No flight means nothing will report landing: reduced motion, a deep link, prev and next. The timer is a net under the callback, not the plan.
  useEffect(() => {
    if (!fromTile || !motionOk()) {
      setLanded(true);
      return;
    }
    const t = window.setTimeout(() => setLanded(true), 1100);
    return () => window.clearTimeout(t);
  }, [fromTile]);

  // A shared-element move only runs between two different dependencies. So the frame matches its anchor at rest, and differs only while leaving it or going back.
  const dependency = closing ? 'home' : fromTile && !landed ? 'out' : 'tile';
  // Never morph live media, and stop the sound the moment the viewer leaves.
  const showMedia = landed && !closing;

  // Deep links and prev/next have no tile to come from; they arrive in place.
  const enter = fromTile ? false : dir === 0 ? { opacity: 0, scale: 0.97 } : { opacity: 0, x: dir * 24 };

  return (
    <m.div className="player-page" data-shape={video.aspect} initial={enter} animate={{ opacity: 1, x: 0, scale: 1 }} exit={flying ? undefined : { opacity: 0, scale: 0.97 }} transition={pageTransition}>
      <div className="player-stage">
        <m.div className="player-frame" layoutId={`video-${video.id}`} layoutDependency={dependency} layoutCrossfade={false} transition={GLIDE_OUT} style={{ borderRadius: radius }} onLayoutAnimationComplete={() => setLanded(true)}>
          {poster ? <m.img layout layoutDependency={dependency} src={poster} alt="" draggable={false} transition={GLIDE_OUT} /> : <TileEmpty video={video} />}
          {showMedia && <PlayerMedia key={retry} video={video} onRetry={() => setRetry((n) => n + 1)} />}
        </m.div>
      </div>
      <m.div className="player-info band-dark" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: fromTile ? { duration: 0.2, ease: 'easeOut', delay: 0.14 } : { duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
        <PlayerDetails video={video} position={position} upNext={upNext} onPrev={onPrev} onNext={onNext} />
      </m.div>
    </m.div>
  );
}

/** The page being left behind while the next one slides in. A picture of it, with no shared id and no media. */
function PlayerGhost({ video, radius, dir, onDone }: { video: Video; radius: number; dir: number; onDone: () => void }) {
  return (
    <m.div className="player-page" data-shape={video.aspect} aria-hidden inert initial={{ opacity: 1, x: 0 }} animate={{ opacity: 0, x: dir * -24 }} transition={pageTransition} onAnimationComplete={onDone}>
      <div className="player-stage">
        <div className="player-frame" style={{ borderRadius: radius }}>
          {video.posterUrl ? <img src={video.posterUrl} alt="" /> : <TileEmpty video={video} />}
        </div>
      </div>
      <div className="player-info band-dark">
        <PlayerDetails video={video} />
      </div>
    </m.div>
  );
}

export interface VideoPlayerDialogProps {
  video: Video;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Where this video sits in the list it came from, shown as "3 of 12". */
  position?: PlayerPosition;
  /** The next few in that list. On a large screen they fill the panel beside the video. */
  upNext?: UpNextItem[];
}

export function VideoPlayerDialog({ video, onClose, onPrev, onNext, position, upNext }: VideoPlayerDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const present = useIsPresent();
  const [step, setStep] = useState({ dir: 0, instant: false });
  const [anchor, setAnchor] = useState<{ id: string; tile: HTMLElement | null; radius: number } | null>(null);
  const [page, setPage] = useState<{ video: Video; fromTile: boolean; radius: number } | null>(null);
  const [ghost, setGhost] = useState<{ video: Video; radius: number; dir: number; key: number } | null>(null);
  const currentId = useRef(video.id);
  const opener = useRef<HTMLElement | null>(null);
  const isFirst = useRef(true);
  const owner = useRef({});
  // Prev and next live on the page that is about to be replaced, so the focus has to be carried across by hand.
  const refocus = useRef<'Next video' | 'Previous video' | 'close' | null>(null);

  // In a layout effect, because a closed dialog is display:none and has nothing to measure, and because this runs inside React Router's transition (R5).
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    // The player is the one playing video while it is open: every preview behind it stops.
    const me = owner.current;
    videoToken.take(me, () => undefined, true);
    return () => {
      videoToken.release(me);
      if (dialog.open) dialog.close();
      // The dialog is unmounted rather than closed by hand, so the browser cannot be relied on to give focus back.
      const home = tileFor(currentId.current, false) ?? opener.current;
      home?.focus({ preventScroll: true });
    };
  }, []);

  // A brand whose video has been opened: its story ring goes grey (M6).
  useEffect(() => {
    markBrandSeen(video.brand);
  }, [video.brand]);

  // Step one of a video change: the anchor moves to the new tile (only a tile on screen counts) a commit before the page does, so the frame mounts after it and leads.
  useLayoutEffect(() => {
    currentId.current = video.id;
    const tile = tileFor(video.id, true);
    setAnchor({ id: video.id, tile, radius: tile ? parseFloat(getComputedStyle(tile).borderTopLeftRadius) : 0 });
  }, [video.id]);

  // Step two: the page follows, in a microtask rather than a commit: Motion needs its own microtask to finish measuring the anchor before it will
  // take a clean snapshot of it (with the page's current scroll) when the frame mounts. flushSync keeps it all before the first paint.
  useLayoutEffect(() => {
    if (anchor?.id !== video.id) return;
    if (page?.video.id === video.id) {
      if (page.video !== video) setPage({ ...page, video });
      return;
    }
    const wasFirst = isFirst.current;
    isFirst.current = false;
    const next = { video, fromTile: wasFirst && Boolean(anchor.tile) && launched(video.id) && motionOk(), radius: matchMedia('(max-width: 734px)').matches ? 0 : 28 };
    const leaving = page && !step.instant && motionOk() ? { video: page.video, radius: page.radius, dir: step.dir, key: Date.now() } : null;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      flushSync(() => {
        if (leaving) setGhost(leaving);
        setPage(next);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [anchor, video, page, step]);

  // The tile the poster left stays empty until the poster comes back.
  useLayoutEffect(() => {
    const tile = anchor?.tile;
    if (!tile || !present) return;
    tile.dataset.lifted = '';
    return () => {
      delete tile.dataset.lifted;
    };
  }, [anchor, present]);

  const go = (dir: 1 | -1, instant = false) => {
    const fn = dir === 1 ? onNext : onPrev;
    if (!fn) return;
    if (document.activeElement instanceof HTMLElement && document.activeElement.classList.contains('player-step')) refocus.current = dir === 1 ? 'Next video' : 'Previous video';
    setStep({ dir, instant });
    fn();
  };

  const pick = (select: () => void) => {
    refocus.current = 'close';
    setStep({ dir: 1, instant: false });
    select();
  };

  // After the page swap, put the focus back where the keyboard left it. A disabled Next at the end of the list falls back to the close button.
  useLayoutEffect(() => {
    const target = refocus.current;
    if (!target || !page) return;
    refocus.current = null;
    const next = target === 'close' ? null : ref.current?.querySelector<HTMLButtonElement>(`.player-page:not([inert]) [aria-label="${target}"]:not(:disabled)`);
    (next ?? closeRef.current)?.focus({ preventScroll: true });
  }, [page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Arrow keys on a focused native player seek it.
      if (e.target instanceof HTMLVideoElement) return;
      if (e.key === 'ArrowLeft') go(-1, true);
      if (e.key === 'ArrowRight') go(1, true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const closing = !present;

  return (
    <dialog
      ref={ref}
      className="player"
      data-closing={closing ? '' : undefined}
      aria-label={video.title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {anchor?.id === video.id && anchor.tile && (
        // Outside the dialog's presence: it has to stay "present" so the frame can hand over to it on the way home.
        <PresenceContext.Provider value={null}>
          {createPortal(
            // The dependency changes in the commit the page lands: Motion only re-reads the page's scroll on an update, and a stale value here would launch the frame from the wrong place.
            <m.span className="tile-anchor" layoutId={`video-${anchor.id}`} layoutDependency={page?.video.id === anchor.id ? 'tile' : 'wait'} transition={GLIDE_HOME} style={{ borderRadius: anchor.radius }} aria-hidden />,
            anchor.tile,
            anchor.id,
          )}
        </PresenceContext.Provider>
      )}
      <div className="player-sheet">
        {ghost && <PlayerGhost key={ghost.key} video={ghost.video} radius={ghost.radius} dir={ghost.dir} onDone={() => setGhost(null)} />}
        {page && <PlayerPage key={page.video.id} video={page.video} fromTile={page.fromTile} radius={page.radius} position={page.video.id === video.id ? position : undefined} upNext={upNext?.map((u) => ({ video: u.video, onSelect: () => pick(u.onSelect) }))} dir={step.dir} closing={closing} flying={closing && Boolean(anchor?.tile)} onPrev={onPrev && (() => go(-1))} onNext={onNext && (() => go(1))} />}
        <button ref={closeRef} type="button" className="player-close glass-media" onClick={onClose} aria-label="Close video">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {step.dir !== 0 && (
        <p className="sr-only" aria-live="polite">
          Now playing: {video.title} by {video.brand}
        </p>
      )}
    </dialog>
  );
}

/** One open video at a time, and stepping through the list it came from. `open` also takes an id (the library's ?v= deep link). */
export function useVideoPlayer(list: Video[]) {
  const [openId, setOpenId] = useState<string | null>(null);
  const index = list.findIndex((v) => v.id === openId);
  const video = index >= 0 ? list[index] : undefined;
  const prev = index > 0 ? list[index - 1] : undefined;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : undefined;
  const upNext = index >= 0 ? list.slice(index + 1, index + 4).map((v) => ({ video: v, onSelect: () => setOpenId(v.id) })) : undefined;

  return {
    open: (v: Video | string) => setOpenId(typeof v === 'string' ? v : v.id),
    /** The open video's id, or null. */
    openId: video ? video.id : null,
    close: () => setOpenId(null),
    dialog: (
      <AnimatePresence>
        {video && <VideoPlayerDialog key="player" video={video} position={list.length > 1 ? { index, total: list.length } : undefined} upNext={upNext} onClose={() => setOpenId(null)} onPrev={prev && (() => setOpenId(prev.id))} onNext={next && (() => setOpenId(next.id))} />}
      </AnimatePresence>
    ),
  };
}
