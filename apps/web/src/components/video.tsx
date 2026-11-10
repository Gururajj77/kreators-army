import { formatViews, videoEmbedUrl, videoPoster, type Video } from '@kreators/shared';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { AnimatePresence, PresenceContext, m, useIsPresent } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { brandLogo } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { spring } from '../lib/spring';
import { PrimaryCta } from './ui';

// The signature moment: a tile's poster lifts off the page and becomes the player, and goes home again on close.
//
// `layoutId` is shared between the player's frame and an empty anchor the player mounts inside the tile. The tile itself never holds a Motion node, so
// a page with a hundred tiles measures nothing, and only the video on screen in the player has a shared id at all. Motion cannot change a layoutId once
// mounted and promotes whichever element mounted last, so the order matters: anchor first, one commit later the frame. See VideoPlayerDialog.

const PREVIEW_DELAY = 300; // R6.

// The glide spring, with an end point. A spring's long tail is invisible, but the dialog stays modal and the embed waits until it is over,
// so "landed" is declared when what's left is under a couple of pixels. Going home can stop far earlier: the frame has already faded by then.
const GLIDE_OUT = { ...spring.glide, restDelta: 2, restSpeed: 25 };
const GLIDE_HOME = { ...spring.glide, restDelta: 20, restSpeed: 150 };

/** The tile that was just pressed. A time, not a flag: a route transition can commit a moment later, and strict mode runs initialisers twice. */
let launch: { id: string; at: number } | null = null;
const launched = (id: string) => launch?.id === id && performance.now() - launch.at < 1500;

function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

function tileFor(id: string, visibleOnly: boolean): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-video-tile="${CSS.escape(id)}"]`);
  for (const el of all) if (onScreen(el)) return el;
  return visibleOnly ? null : (all[0] ?? null);
}

const TONES = ['sochu', 'bolu', 'gola', 'tiko'] as const;

function toneOf(brand: string): (typeof TONES)[number] {
  let hash = 0;
  for (const ch of brand) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length] ?? 'tiko';
}

/** What a video with no poster shows, in the tile and in the player, so the morph has something real to carry. */
function TileEmpty({ video }: { video: Video }) {
  return (
    <span className="tile-empty" data-tone={toneOf(video.brand)}>
      <span>{video.brand}</span>
    </span>
  );
}

export function BrandPill({ brand }: { brand: string }) {
  const logo = brandLogo(brand);
  return (
    <span className="pill">
      {logo ? <img src={logo} alt="" loading="lazy" /> : <span className="pill-letter">{brand.charAt(0)}</span>}
      <span className="truncate">{brand}</span>
    </span>
  );
}

export interface VideoTileProps {
  video: Video;
  onOpen: (video: Video) => void;
  eager?: boolean;
  className?: string;
  /** "bento" fills its cell instead of keeping 9:16. "rail" is a card in a horizontal rail. Default is the library grid tile. */
  variant?: 'bento' | 'rail' | (string & {});
}

export function VideoTile({ video, onOpen, eager, className, variant }: VideoTileProps) {
  const poster = videoPoster(video);
  const [preview, setPreview] = useState(false);
  const wait = useRef<number | undefined>(undefined);

  const stopPreview = () => {
    window.clearTimeout(wait.current);
    setPreview(false);
  };
  useEffect(() => () => window.clearTimeout(wait.current), []);

  const onEnter = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--tile-w', String(e.currentTarget.offsetWidth));
    // Only real file videos preview, and only for a mouse that stays. Embeds never get a muted loop.
    if (e.pointerType !== 'mouse' || video.source !== 'file' || !motionOk()) return;
    window.clearTimeout(wait.current);
    wait.current = window.setTimeout(() => setPreview(true), PREVIEW_DELAY);
  };

  const label = video.views > 0 ? `Play ${video.title} by ${video.brand}, ${formatViews(video.views)} views` : `Play ${video.title} by ${video.brand}`;

  return (
    <button
      type="button"
      className={`tile ${className ?? ''}`}
      data-variant={variant}
      data-video-tile={video.id}
      onClick={() => {
        stopPreview();
        launch = { id: video.id, at: performance.now() };
        onOpen(video);
      }}
      onPointerEnter={onEnter}
      onPointerLeave={stopPreview}
      aria-label={label}
    >
      {poster ? <img src={poster} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" /> : <TileEmpty video={video} />}
      {preview && (
        <video
          className="tile-preview"
          src={video.ref}
          muted
          autoPlay
          loop
          playsInline
          preload="none"
          aria-hidden
          // Shown only once it is really playing, so the poster never blinks.
          onPlaying={(e) => {
            e.currentTarget.dataset.on = '';
          }}
        />
      )}
      <span className="tile-scrim" aria-hidden />
      <span className="tile-play" aria-hidden>
        <Play className="size-5 fill-current" />
      </span>
      {video.views > 0 && <span className="chip tile-views">{formatViews(video.views)} views</span>}
      <span className="tile-brand">
        <BrandPill brand={video.brand} />
      </span>
    </button>
  );
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

/** The player itself. Mounted only once the frame has landed: an iframe under a scaling transform is heavy and distorts. */
function PlayerMedia({ video }: { video: Video }) {
  const embed = videoEmbedUrl(video);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!embed) return;
    // An embed whose load event never comes (blocked, offline) must not leave the poster standing in for it forever.
    const t = window.setTimeout(() => setReady(true), 2000);
    return () => window.clearTimeout(t);
  }, [embed]);

  if (embed) {
    return (
      <iframe
        className="player-embed"
        data-ready={ready ? '' : undefined}
        src={embed}
        title={`${video.title}, ${video.brand}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setReady(true)}
      />
    );
  }
  return <video className="player-video" src={video.ref} poster={video.posterUrl ?? undefined} controls autoPlay playsInline />;
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
  const facts = [video.category && { label: 'Category', value: video.category }, video.platform && { label: 'Platform', value: video.platform }].filter((f): f is { label: string; value: string } => Boolean(f));
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
      {upNext && upNext.length > 0 && (
        <nav className="player-next" aria-label="Up next">
          <h3>Up next</h3>
          {upNext.map(({ video: v, onSelect }) => {
            const poster = videoPoster(v);
            return (
              <button key={v.id} type="button" className="player-next-row" onClick={onSelect}>
                <span className="player-next-thumb">{poster ? <img src={poster} alt="" loading="lazy" /> : <TileEmpty video={v} />}</span>
                <span className="player-next-text">
                  <span className="player-next-title">{v.title}</span>
                  <span className="player-next-brand">{v.views > 0 ? `${v.brand} · ${formatViews(v.views)} views` : v.brand}</span>
                </span>
              </button>
            );
          })}
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
  const [settled, setSettled] = useState(false);
  const poster = videoPoster(video);

  // No flight means nothing will report landing: reduced motion, a deep link, prev and next. The timer is a net under the callback, not the plan.
  useEffect(() => {
    if (!fromTile || !motionOk()) {
      setSettled(true);
      return;
    }
    const t = window.setTimeout(() => setSettled(true), 1100);
    return () => window.clearTimeout(t);
  }, [fromTile]);

  // A shared-element move only runs between two different dependencies. So the frame matches its anchor at rest, and differs only while leaving it or going back.
  const dependency = closing ? 'home' : fromTile && !settled ? 'out' : 'tile';
  // Never morph a live iframe, and stop the sound the moment the viewer leaves.
  const showMedia = settled && !closing;

  // Deep links and prev/next have no tile to come from; they arrive in place.
  const enter = fromTile ? false : dir === 0 ? { opacity: 0, scale: 0.97 } : { opacity: 0, x: dir * 24 };

  return (
    <m.div className="player-page" data-shape={video.aspect} initial={enter} animate={{ opacity: 1, x: 0, scale: 1 }} exit={flying ? undefined : { opacity: 0, scale: 0.97 }} transition={pageTransition}>
      <div className="player-stage">
        <m.div className="player-frame" layoutId={`video-${video.id}`} layoutDependency={dependency} layoutCrossfade={false} transition={GLIDE_OUT} style={{ borderRadius: radius }} onLayoutAnimationComplete={() => setSettled(true)}>
          {poster ? <m.img layout layoutDependency={dependency} src={poster} alt="" draggable={false} transition={GLIDE_OUT} /> : <TileEmpty video={video} />}
          {showMedia && <PlayerMedia video={video} />}
        </m.div>
      </div>
      <m.div className="player-info band-dark" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: fromTile ? { duration: 0.2, ease: 'easeOut', delay: 0.14 } : { duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
        <PlayerDetails video={video} position={position} upNext={upNext} onPrev={onPrev} onNext={onNext} />
      </m.div>
    </m.div>
  );
}

/** The page being left behind while the next one slides in. A picture of it, with no shared id and no player. */
function PlayerGhost({ video, radius, dir, onDone }: { video: Video; radius: number; dir: number; onDone: () => void }) {
  const poster = videoPoster(video);
  return (
    <m.div className="player-page" data-shape={video.aspect} aria-hidden inert initial={{ opacity: 1, x: 0 }} animate={{ opacity: 0, x: dir * -24 }} transition={pageTransition} onAnimationComplete={onDone}>
      <div className="player-stage">
        <div className="player-frame" style={{ borderRadius: radius }}>
          {poster ? <img src={poster} alt="" /> : <TileEmpty video={video} />}
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
  // Prev and next live on the page that is about to be replaced, so the focus has to be carried across by hand.
  const refocus = useRef<'Next video' | 'Previous video' | 'close' | null>(null);

  // In a layout effect, because a closed dialog is display:none and has nothing to measure, and because this runs inside React Router's transition (R5).
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      // The dialog is unmounted rather than closed by hand, so the browser cannot be relied on to give focus back.
      const home = tileFor(currentId.current, false) ?? opener.current;
      home?.focus({ preventScroll: true });
    };
  }, []);

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

/** One open video at a time, and stepping through the list it came from. */
export function useVideoPlayer(list: Video[]) {
  const [openId, setOpenId] = useState<string | null>(null);
  const index = list.findIndex((v) => v.id === openId);
  const video = index >= 0 ? list[index] : undefined;
  const prev = index > 0 ? list[index - 1] : undefined;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : undefined;
  const upNext = index >= 0 ? list.slice(index + 1, index + 4).map((v) => ({ video: v, onSelect: () => setOpenId(v.id) })) : undefined;

  return {
    open: (v: Video) => setOpenId(v.id),
    dialog: (
      <AnimatePresence>
        {video && <VideoPlayerDialog key="player" video={video} position={list.length > 1 ? { index, total: list.length } : undefined} upNext={upNext} onClose={() => setOpenId(null)} onPrev={prev && (() => setOpenId(prev.id))} onNext={next && (() => setOpenId(next.id))} />}
      </AnimatePresence>
    ),
  };
}
