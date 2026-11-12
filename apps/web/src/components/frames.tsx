// Every video on the site sits in an object (visual §1.2): a phone, a card, a chat-reply bubble, a polaroid or a story ring. The poster comes first.
// A muted preview plays only on desktop, one at a time, under one rule (usePreview, V2-SPEC 3.4). (pub8) A MEGA entry never streams through this
// site: its only preview is its stored hover clip (`previewUrl`, a few seconds, small, made in the founder's browser by the admin's
// "Thumbnails & previews" pass), looped. No clip: the poster stays (no <video> at all). A bundled file with `previewOk` still
// previews itself, as in v1. Paths come from the API (shared previewSrc), never from this file.

import { formatViews, previewSrc, type Video } from '@kreators/shared';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { m, useMotionValue, useSpring, type PanInfo } from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Link } from 'react-router';
import { brandLogo } from '../lib/content';
import { posterFirst, randomPool, shuffleForLoad, uploadMonth } from '../lib/videoFind';
import { canAutoplay, finePointer, motionOk, useMotionOk, useRunning } from '../lib/motionOk';
import { warmClip } from '../lib/previewWarm';
import { spring } from '../lib/spring';
import { useStill } from '../lib/store';
import { RollNumber, whenSeen } from './ui';

// ---------- One playing video at a time ----------

type Owner = object;
let holder: { owner: Owner; lose: () => void } | null = null;
const freeListeners = new Set<() => void>();

/**
 * The one slot for a playing video (V2-SPEC 3.7: one playing video per page, desktop only). Previews that start by themselves (the hero deck, the thread,
 * the work reel, the coverflow centre) take it only when it is free; a hover or the player is the visitor's own choice and takes it from whoever has it,
 * whose `lose` callback then stops that video.
 */
export const videoToken = {
  take(owner: Owner, lose: () => void, force = false): boolean {
    if (holder?.owner === owner) {
      holder.lose = lose;
      return true;
    }
    if (holder && !force) return false;
    const previous = holder;
    holder = { owner, lose };
    previous?.lose();
    return true;
  },
  release(owner: Owner) {
    if (holder?.owner !== owner) return;
    holder = null;
    for (const fn of [...freeListeners]) fn();
  },
  holds: (owner: Owner) => holder?.owner === owner,
  free: () => holder === null,
  /** Called each time the slot frees up. Returns the unsubscribe. */
  onFree(fn: () => void): () => void {
    freeListeners.add(fn);
    return () => freeListeners.delete(fn);
  },
};

// ---------- Brand art shared by every frame ----------

const TONES = ['sochu', 'bolu', 'gola', 'tiko'] as const;

/** A stable cast colour for a brand, for posterless frames and letter discs. */
export function toneOf(brand: string): (typeof TONES)[number] {
  let hash = 0;
  for (const ch of brand) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length] ?? 'tiko';
}

/** What a video with no poster shows, in the frame and in the player, so the morph has something real to carry. */
export function TileEmpty({ video }: { video: Pick<Video, 'brand'> }) {
  return (
    <span className="tile-empty" data-tone={toneOf(video.brand)}>
      <span>{video.brand}</span>
    </span>
  );
}

/** The brand's logo (or its first letter) and name, white on any picture. */
export function BrandPill({ brand }: { brand: string }) {
  const logo = brandLogo(brand);
  return (
    <span className="pill">
      {logo ? <img src={logo} alt="" loading="lazy" /> : <span className="pill-letter">{brand.charAt(0)}</span>}
      <span className="truncate">{brand}</span>
    </span>
  );
}

/** Instagram's camera glyph, drawn here (no brand icons ship in lucide). */
export function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** YouTube's play-button glyph. */
export function YouTubeGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
      <rect x="2" y="5" width="20" height="14" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
    </svg>
  );
}

/**
 * Small marks for where else a video is posted (content §3.6): "Also on Instagram", "Also on YouTube". Inside a frame that is a button they are part
 * of its picture (decorative, the frame has its own label); pass `labelled` where they stand alone and should be read.
 */
export function PostedOn({ links, labelled = false, className }: { links: Video['links']; labelled?: boolean; className?: string }) {
  if (!links.instagram && !links.youtube) return null;
  return (
    <span className={`posted-on ${className ?? ''}`} aria-hidden={labelled ? undefined : true}>
      {links.instagram && (
        <span className="posted-on-mark" title={labelled ? 'Also on Instagram' : undefined}>
          <InstagramGlyph />
          {labelled && <span className="sr-only">Also on Instagram</span>}
        </span>
      )}
      {links.youtube && (
        <span className="posted-on-mark" title={labelled ? 'Also on YouTube' : undefined}>
          <YouTubeGlyph />
          {labelled && <span className="sr-only">Also on YouTube</span>}
        </span>
      )}
    </span>
  );
}

// ---------- The views sticker (M8) ----------

/**
 * "{n} views" as a sticker: white with an edge, tilted, popping from scale .3 the first time it is seen (`pop="view"`), at once (`"mount"`, the hero
 * deck's new front card) or not at all. Real numbers only: nothing renders when views is 0. Under Pause animations it is simply there.
 */
export function ViewsSticker({ views, tilt = -4, pop = 'view', className }: { views: number; tilt?: number; pop?: 'view' | 'mount' | 'none'; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || pop === 'none') return;
    if (pop === 'mount') {
      const t = window.setTimeout(() => (el.dataset.in = ''), 30);
      return () => window.clearTimeout(t);
    }
    return whenSeen(el, () => {
      el.dataset.in = '';
    });
  }, [pop]);
  if (!(views > 0)) return null;
  const text = formatViews(views);
  return (
    <span ref={ref} className={`vsticker ${className ?? ''}`} data-pop={pop === 'none' ? undefined : ''} style={{ '--tilt': `${tilt}deg` } as CSSProperties} aria-hidden>
      <b>{text}</b> views
    </span>
  );
}

// ---------- Previews (V2-SPEC 3.4) ----------

const HOVER_DELAY = 300; // R6
// A stored clip is small and usually already in the cache (previewWarm), so it needs only enough of a wait to ignore a pointer sweeping
// across the grid: with the first frame decoded in about 40 ms it starts within ~150 ms of the hover.
const CLIP_HOVER_DELAY = 100;
const LOOP_AT = 5; // seconds (C12): a bundled file previews its first 5 s, looped
const STALL_LIMIT = 1500;

const idle = (fn: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
};

export interface PreviewOptions {
  /**
   * 'hover': a mouse resting on the frame (100 ms for a stored clip, 300 ms for the bounded stream) starts it, leaving stops it. 'active': it runs while
   * `active` is true and the frame is at least half in view, after the browser is idle (the hero's front card, the thread's newest reply, the work
   * reel), and a hover starts it too (hover7: every video on the site plays on hover). 'none': never.
   */
  mode: 'hover' | 'active' | 'none';
  active?: boolean;
  /** The frame. Its leaving the viewport stops the preview. */
  root: RefObject<HTMLElement | null>;
}

export interface Preview {
  /** Spread onto the frame (hover mode). */
  bind: { onPointerEnter: (e: ReactPointerEvent) => void; onPointerLeave: () => void; onFocus: (e: ReactFocusEvent) => void; onBlur: () => void };
  /** The muted <video>, to render inside the frame's media box, or null. */
  node: ReactNode;
  /** True once a frame is really playing. */
  playing: boolean;
  /** Stop now (a press that opens the player). */
  stop: () => void;
}

/** What a muted preview of `video` plays: its stored clip, else a bundled file when the API allows it, else nothing (never MEGA, never an embed). */
export function previewSource(video: Video): { src: string; clip: boolean } | null {
  if (video.previewUrl) return { src: video.previewUrl, clip: true };
  const stream = video.previewOk && video.source !== 'mega' ? previewSrc(video) : null;
  return stream ? { src: stream, clip: false } : null;
}

/** Whether `video` may preview here at all: a stored clip or an allowed stream, and the device may autoplay. */
export const previewAllowed = (video: Video | null | undefined): video is Video => Boolean(video && previewSource(video) && canAutoplay());

/**
 * The one rule for every video that plays by itself:
 * 1. only with canAutoplay() (fine pointer, motion allowed, no Save-Data), a stored clip or a bundled file with `previewOk`, and the video token;
 * 2. a muted, inline <video> shown only once it is `playing`, so the poster never blinks;
 * 3. a stored clip loops by itself (it is made to loop); a bundled file loops at 5 s by seeking to 0;
 * 4. a `waiting` that lasts 1.5 s, or an error, ends it (and it does not try again in this mount);
 * 5. leaving, scrolling out, Pause animations or another video taking the token: pause(), drop the src, load() to abort the fetch, unmount.
 */
export function usePreview(video: Video | null | undefined, { mode, active = false, root }: PreviewOptions): Preview {
  const owner = useRef<Owner>({});
  const el = useRef<HTMLVideoElement | null>(null);
  const [on, setOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const wait = useRef(0);
  const stall = useRef(0);
  const failed = useRef(false);
  // A mouse is resting on the frame: an 'active' frame that is no longer `active` keeps a preview the visitor asked for.
  const hovering = useRef(false);
  const still = useStill((s) => s.still);
  const source = video ? previewSource(video) : null;
  const src = source?.src ?? null;
  const clip = Boolean(source?.clip);

  const stop = useCallback(() => {
    window.clearTimeout(wait.current);
    window.clearTimeout(stall.current);
    const v = el.current;
    if (v) {
      v.pause();
      v.removeAttribute('src');
      v.load();
    }
    setOn(false);
    setPlaying(false);
    videoToken.release(owner.current);
  }, []);

  const start = useCallback(
    (force: boolean) => {
      if (failed.current || !previewAllowed(video)) return false;
      if (!videoToken.take(owner.current, stop, force)) return false;
      setOn(true);
      return true;
    },
    [video, stop],
  );

  // A different video in the same frame starts from nothing.
  useEffect(() => {
    failed.current = false;
    return stop;
  }, [src, stop]);

  useEffect(() => {
    if (still) stop();
  }, [still, stop]);

  // In view: about half the frame, for 'active' (0.45, so a frame cut exactly in half by a mask, like the middle vox pop photo on
  // /why-kreators at a ratio of 0.4998, still counts); any of it, to keep a hover preview alive.
  useEffect(() => {
    const node = root.current;
    if (!node || mode === 'none' || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(Boolean(e && e.intersectionRatio >= (mode === 'active' ? 0.45 : 0.01))), { threshold: [0, 0.01, 0.45] });
    io.observe(node);
    return () => io.disconnect();
  }, [root, mode]);

  // A stored clip on screen is fetched ahead of a hover (a few per page view, two at a time, once the visitor moves a mouse).
  useEffect(() => {
    if (clip && inView && mode !== 'none' && !still) warmClip(src, 'near');
  }, [clip, inView, mode, still, src]);

  useEffect(() => {
    if (!inView && on) stop();
  }, [inView, on, stop]);

  // 'active': after idle, when the slot is free; retry whenever it frees up.
  useEffect(() => {
    if (mode !== 'active' || !active || !inView || still || !previewAllowed(video)) {
      if (mode === 'active' && videoToken.holds(owner.current) && !(hovering.current && inView && !still)) stop();
      return;
    }
    let cancelIdle = idle(() => start(false));
    const off = videoToken.onFree(() => {
      cancelIdle();
      cancelIdle = idle(() => start(false));
    });
    const onTab = () => document.visibilityState === 'hidden' && stop();
    document.addEventListener('visibilitychange', onTab);
    return () => {
      cancelIdle();
      off();
      document.removeEventListener('visibilitychange', onTab);
    };
  }, [mode, active, inView, still, video, start, stop]);

  useEffect(() => () => window.clearTimeout(wait.current), []);

  // An 'active' frame that is playing by itself goes on playing when the pointer leaves it.
  const keepsRunning = () => mode === 'active' && active && inView && !still;
  const hoverable = mode === 'hover' || mode === 'active';
  const bind = {
    onPointerEnter: (e: ReactPointerEvent) => {
      if (!hoverable || e.pointerType !== 'mouse' || !previewAllowed(video)) return;
      hovering.current = true;
      if (clip) warmClip(src, 'hover');
      window.clearTimeout(wait.current);
      wait.current = window.setTimeout(() => start(true), clip ? CLIP_HOVER_DELAY : HOVER_DELAY);
    },
    onPointerLeave: () => {
      if (!hoverable) return;
      hovering.current = false;
      window.clearTimeout(wait.current);
      // A frame that still has the keyboard's focus keeps its preview.
      if (root.current?.matches(':focus-visible') || keepsRunning()) return;
      if (on || videoToken.holds(owner.current)) stop();
    },
    // (pv) Keyboard focus previews like a hover (focus-visible only: a click's focus is followed by the player).
    onFocus: (e: ReactFocusEvent) => {
      if (!hoverable || !previewAllowed(video) || !e.currentTarget.matches(':focus-visible')) return;
      if (clip) warmClip(src, 'hover');
      window.clearTimeout(wait.current);
      wait.current = window.setTimeout(() => start(true), clip ? CLIP_HOVER_DELAY : HOVER_DELAY);
    },
    onBlur: () => {
      if (!hoverable) return;
      window.clearTimeout(wait.current);
      if (root.current?.matches(':hover') || keepsRunning()) return;
      if (on || videoToken.holds(owner.current)) stop();
    },
  };

  const node =
    on && src ? (
      <video
        ref={el}
        className="frame-preview"
        src={src}
        muted
        autoPlay
        loop={clip}
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden
        data-on={playing ? '' : undefined}
        onPlaying={() => {
          window.clearTimeout(stall.current);
          setPlaying(true);
        }}
        data-clip={clip ? '' : undefined}
        onTimeUpdate={(e) => {
          if (!clip && e.currentTarget.currentTime >= LOOP_AT) e.currentTarget.currentTime = 0;
        }}
        onWaiting={() => {
          window.clearTimeout(stall.current);
          stall.current = window.setTimeout(() => {
            failed.current = true;
            stop();
          }, STALL_LIMIT);
        }}
        onError={() => {
          failed.current = true;
          stop();
        }}
      />
    ) : null;

  return { bind, node, playing, stop };
}

// ---------- VideoFrame ----------

export type FrameVariant = 'phone' | 'card' | 'bubble' | 'polaroid' | 'ring';

export interface VideoFrameProps {
  /** The public Video: reads posterUrl, previewUrl, streamUrl (through previewSrc, bundled files only), previewOk, links, views, brand, title. */
  video: Video;
  variant: FrameVariant;
  /** Sets --fw. Height follows the shape: 9:16 (phone 280:580), 16:9 for a landscape card, a circle for a ring. */
  width?: number | string;
  /** Makes the frame a <button> that opens the player (with the tile-to-player morph). Without it the frame is decorative and aria-hidden. */
  onOpen?: (v: Video) => void;
  /** Default 'hover' when the frame opens the player, else 'none'. 'active' plays while `active` is true (one at a time, desktop only). */
  preview?: 'hover' | 'active' | 'none';
  active?: boolean;
  /** The tilted "{n} views" sticker (only when views > 0). */
  sticker?: boolean;
  /** Static rotation in degrees. Media-only variants (polaroid ±3 to 6°, deck slots); never on anything carrying reading text. */
  tilt?: number;
  /** Pointer tilt up to 3° (phone and polaroid only, fine pointer, motion allowed). */
  lean?: boolean;
  /** Load the poster at once (first screen). */
  eager?: boolean;
  /** Show the "Also on" marks (card only). Default true. */
  postedOn?: boolean;
  /** Non-interactive even with onOpen: the admin's "How the tile looks". */
  still?: boolean;
  /** The upload month as a small chip ("Nov 2026"), card only, when the video has a date. */
  date?: boolean;
  /** Overrides the accessible name ("Play {title} by {brand}, {views} views"). */
  label?: string;
  /** v1 tile variants for the card: 'bento' fills its cell, 'rail' is a card in a horizontal rail (data-variant). */
  tileVariant?: string;
  className?: string;
  style?: CSSProperties;
  /** Extra overlay inside the picture: a chip such as "For evaluation". */
  children?: ReactNode;
}

/** The accessible name of a frame that opens the player (v1's wording). */
export const playLabel = (video: Video) => (video.views > 0 ? `Play ${video.title} by ${video.brand}, ${formatViews(video.views)} views` : `Play ${video.title} by ${video.brand}`);

/** Pointer tilt for media-only frames: rotateX and rotateY up to 3° on spring.follow, through motion values. */
function useLean(enabled: boolean) {
  const ok = useMotionOk();
  const rx = useSpring(0, spring.follow);
  const ry = useSpring(0, spring.follow);
  const box = useRef<DOMRect | null>(null);
  const on = enabled && ok;
  const handlers = on
    ? {
        onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
          if (e.pointerType === 'mouse' && finePointer()) box.current = e.currentTarget.getBoundingClientRect();
        },
        onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
          const r = box.current;
          if (!r) return;
          ry.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 3);
          rx.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -3);
        },
        onPointerLeave: () => {
          box.current = null;
          rx.set(0);
          ry.set(0);
        },
      }
    : {};
  return { on, style: on ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined, handlers };
}

/**
 * A video in its frame. Poster first; the preview (when allowed) fades in over it once it really plays. A frame that opens the player carries
 * `data-video-tile` on its picture so the player's frame can fly from it and back.
 */
export function VideoFrame({
  video,
  variant,
  width,
  onOpen,
  preview,
  active,
  sticker = false,
  tilt,
  lean = false,
  eager,
  postedOn = true,
  date = false,
  still = false,
  label,
  tileVariant,
  className,
  style,
  children,
}: VideoFrameProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const interactive = Boolean(onOpen) && !still;
  const mode = still ? 'none' : (preview ?? (interactive ? 'hover' : 'none'));
  const pv = usePreview(video, { mode, active, root: rootRef });
  // What a hover plays here (hover7): 'clip', 'stream', or 'none' (no clip yet and no safe stream: the frame only lifts and shows a small play glyph,
  // so a hover never feels broken). Unset when the frame never previews.
  const pvSource = mode === 'none' ? null : previewSource(video);
  const pvKind = mode === 'none' ? undefined : pvSource ? (pvSource.clip ? 'clip' : 'stream') : 'none';
  // Phones and polaroids carry no play disc of their own unless they open the player (the deck's "Watch with sound"): a small glyph says "this plays".
  const hint = pvKind && (variant === 'polaroid' || (variant === 'phone' && !interactive)) ? (
    <span className="vframe-hint" aria-hidden>
      <Play className="size-3.5 fill-current" />
    </span>
  ) : null;
  const leanable = lean && (variant === 'phone' || variant === 'polaroid');
  const tiltFx = useLean(leanable && !still);
  const poster = video.posterUrl;

  const vars = {
    ...style,
    '--fw': typeof width === 'number' ? `${width}px` : width,
    '--tilt': tilt !== undefined ? `${tilt}deg` : undefined,
  } as CSSProperties;

  const img = poster ? <img src={poster} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} /> : <TileEmpty video={video} />;
  const views = video.views > 0 ? formatViews(video.views) : null;
  const month = date && variant === 'card' ? uploadMonth(video.uploadDate) : null;
  const open = () => {
    pv.stop();
    if (onOpen) launchFrom(video.id, rootRef.current);
    onOpen?.(video);
  };

  const outer = (inner: ReactNode, cls: string, tileAttr: boolean) => {
    const common = {
      className: `vframe ${cls} ${className ?? ''}`,
      style: vars,
      'data-frame': variant,
      'data-shape': video.aspect,
      'data-playing': pv.playing ? '' : undefined,
      'data-video-tile': tileAttr && interactive ? video.id : undefined,
      'data-variant': tileVariant,
      'data-pv': pvKind,
      ...pv.bind,
    };
    if (interactive) {
      return (
        <button
          type="button"
          ref={(n) => {
            rootRef.current = n;
          }}
          {...common}
          onClick={open}
          aria-label={label ?? (month ? `${playLabel(video)}, uploaded ${month}` : playLabel(video))}
          onPointerEnter={(e) => {
            e.currentTarget.style.setProperty('--tile-w', String(e.currentTarget.offsetWidth));
            pv.bind.onPointerEnter(e);
          }}
        >
          {inner}
        </button>
      );
    }
    return (
      <div
        ref={(n) => {
          rootRef.current = n;
        }}
        {...common}
        aria-hidden={still ? undefined : true}
        inert={still || undefined}
      >
        {inner}
      </div>
    );
  };

  if (variant === 'card') {
    // v1's tile, unchanged in structure: `.tile > img` and `.tile > video` stay child combinators.
    return outer(
      <>
        {img}
        {pv.node}
        <span className="tile-scrim" aria-hidden />
        <span className="tile-play" aria-hidden>
          <Play className="size-5 fill-current" />
        </span>
        {sticker ? <ViewsSticker views={video.views} className="tile-sticker" /> : views && <span className="chip tile-views">{views} views</span>}
        {month && (
          <span className="chip tile-date" aria-hidden>
            {month}
          </span>
        )}
        <span className="tile-brand">
          <BrandPill brand={video.brand} />
          {postedOn && <PostedOn links={video.links} />}
        </span>
        {children}
      </>,
      'tile',
      true,
    );
  }

  if (variant === 'bubble') {
    return outer(
      <>
        {img}
        {pv.node}
        <span className="vframe-scrim" aria-hidden />
        {views && <span className="chip vframe-chip">{views} views</span>}
        <span className="vframe-foot">
          <BrandPill brand={video.brand} />
        </span>
        <span className="vframe-play" aria-hidden>
          <Play className="size-4 fill-current" />
        </span>
        {children}
      </>,
      'vframe-bubble',
      true,
    );
  }

  if (variant === 'ring') {
    return outer(
      <>
        <span className="vframe-ring-art" aria-hidden />
        <span className="vframe-ring-media">{poster ? <img src={poster} alt="" loading="lazy" decoding="async" /> : <TileEmpty video={video} />}</span>
      </>,
      'vframe-ring',
      false,
    );
  }

  // phone and polaroid hold their picture in an inner box: that box is what the player flies from.
  const media =
    variant === 'phone' ? (
      <span className="vframe-screen" data-video-tile={interactive ? video.id : undefined}>
        {img}
        {pv.node}
        <span className="vframe-scrim" aria-hidden />
        <span className="vframe-island" aria-hidden />
        <span className="vframe-foot">
          <BrandPill brand={video.brand} />
        </span>
        {hint}
        {children}
      </span>
    ) : (
      <span className="vframe-polaroid-media" data-video-tile={interactive ? video.id : undefined}>
        {img}
        {pv.node}
        {hint}
        {children}
      </span>
    );

  const body = (
    <>
      {media}
      {sticker && <ViewsSticker views={video.views} tilt={variant === 'phone' ? -6 : -4} />}
    </>
  );

  if (tiltFx.on) {
    return outer(
      <m.span className="vframe-lean" style={tiltFx.style} {...tiltFx.handlers}>
        {body}
      </m.span>,
      variant === 'phone' ? 'vframe-phone' : 'vframe-polaroid',
      false,
    );
  }
  return outer(body, variant === 'phone' ? 'vframe-phone' : 'vframe-polaroid', false);
}

// The player reads this to know a press came from a frame (and so may fly from it). Kept here so every frame can set it.
let launch: { id: string; at: number; el: HTMLElement | null } | null = null;
/** Record that a frame showing `id` was just pressed, and which one (`el`). */
export function launchFrom(id: string, el?: HTMLElement | null) {
  launch = { id, at: performance.now(), el: el ?? null };
}
/** True for 1.5 s after a frame showing `id` was pressed. A time, not a flag: a route change can commit a moment later, and strict mode runs twice. */
export const launched = (id: string) => launch?.id === id && performance.now() - launch.at < 1500;
/**
 * The frame that was pressed for `id`, while it is still in the page. The player flies from it and gives focus back to it, even when the same video has
 * another frame on screen (the library's featured coverflow repeats grid videos).
 */
export const launchedEl = (id: string): HTMLElement | null => (launch?.id === id && launch.el?.isConnected ? launch.el : null);

// ---------- ReelPause and the hero's playback switch (moved from site/home/shared.tsx) ----------

/**
 * Whether a self-running reel runs, and the control that says so. Normally that control is Pause animations itself (R11), so the reel's button and the
 * footer switch are one setting. When the OS asks for reduced motion or the browser refuses autoplay, the global switch cannot help, so the button acts
 * on this reel alone.
 */
export function usePlayback() {
  const { still, locked, toggle } = useStill();
  const [here, setHere] = useState<boolean | null>(null);
  const [refused, setRefused] = useState(false);
  const local = locked || refused;
  const wanted = here ?? (!still && !refused);
  return {
    wanted,
    label: `${wanted ? 'Pause' : 'Play'} ${local ? 'video' : 'animations'}`,
    toggle: () => (local ? setHere(!wanted) : toggle()),
    refuse: () => {
      setRefused(true);
      setHere(false);
    },
  };
}

/** The pause control on a self-running reel (WCAG 2.2.2). Over-video glass, 44 px, primary icon only. */
export function ReelPause({ wanted, label, onToggle, className }: { wanted: boolean; label: string; onToggle: () => void; className?: string }) {
  const Icon = wanted ? Pause : Play;
  return (
    <button type="button" className={`reel-pause glass-media ${className ?? ''}`} onClick={onToggle} aria-label={label}>
      <Icon className="size-[18px] fill-current" aria-hidden />
    </button>
  );
}

// ---------- FrameDeck: the hero's reel deck (M1) ----------

const SLOTS = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: -64, y: 18, rotate: -6, scale: 0.9, opacity: 1 },
  { x: 70, y: 30, rotate: 6.5, scale: 0.86, opacity: 1 },
  { x: 0, y: 40, rotate: 0, scale: 0.8, opacity: 0 },
] as const;
const EXIT = { x: 150, y: -12, rotate: 14, scale: 0.96, opacity: 0 };
// (hero15) Phones: one flat card. The ones behind wait unseen right under it; the front slides off to the left (the way a swipe to the next one goes)
// while the next rises into its place, so the screen is never empty.
const FLAT_SLOTS = [SLOTS[0], { x: 0, y: 0, rotate: 0, scale: 0.94, opacity: 0 }] as const;
const FLAT_EXIT = { x: -170, y: 0, rotate: 0, scale: 0.96, opacity: 0 };
const PHONE = '(max-width: 734px)';
const onPhoneChange = (cb: () => void) => {
  const q = matchMedia(PHONE);
  q.addEventListener('change', cb);
  return () => q.removeEventListener('change', cb);
};
const usePhone = () => useSyncExternalStore(onPhoneChange, () => matchMedia(PHONE).matches, () => false);
const DWELL = 4500;

/**
 * The deck's videos (V2-SPEC 3.4; r18: random on every page load, so each reel gets its turn at the front): `count` videos in this load's order
 * (lib/videoFind shuffleForLoad, the same order on every render and route change of the visit). Videos with a thumbnail lead (the founder's
 * imported library starts without them, and a deck of blank cards reads as broken), vertical before landscape within each group.
 * `firstId` (the kit's fixed sample) still puts that video first when it is live. (r19) Only brands with 2 or more videos are dealt (lib/videoFind
 * randomPool); a brand's only video fills in just when fewer than `count` are left.
 */
export function deckOrder(videos: Video[], firstId?: string, count = 4): Video[] {
  const first = firstId ? videos.find((v) => v.id === firstId) : undefined;
  const tier = (v: Video) => posterFirst(v) * 2 + (v.aspect === 'landscape' ? 1 : 0);
  const rest = randomPool(videos.filter((v) => v !== first), count - (first ? 1 : 0), 'hero-deck', videos, tier);
  const ordered = shuffleForLoad(rest, 'hero-deck', { tier });
  return (first ? [first, ...ordered] : ordered).slice(0, count);
}

export interface FrameDeckProps {
  /** The deck, in order (see deckOrder). Undefined while /api/videos is on its way: the front card paints `poster` alone. */
  videos: Video[] | undefined;
  /** The first paint: HERO.poster, the image theme.js preloads. */
  poster: string;
  onOpen: (v: Video) => void;
  /** Hold the deck, e.g. while the player is open. */
  paused?: boolean;
  /** The views card with the brand, the rolling count and the step buttons. Default true. */
  viewsCard?: boolean;
  className?: string;
}

/**
 * Three phones fanned (a fourth waits behind), the front one previewing on desktop. It advances every 4.5 s while in view, the tab is visible, nothing
 * holds it (pointer over it, focus inside, a drag, the pause button, the player, Pause animations), with story progress across the front card and a
 * views sticker on each arrival. Arrows and swipe step it by hand, still or not.
 */
export function FrameDeck({ videos, poster, onOpen, paused = false, viewsCard = true, className }: FrameDeckProps) {
  const box = useRef<HTMLDivElement>(null);
  const ok = useMotionOk();
  const onScreen = useRunning(box);
  const { wanted, label, toggle } = usePlayback();
  const [order, setOrder] = useState<string[]>([]);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [held, setHeld] = useState(false);
  const [arrived, setArrived] = useState(0);
  const [armed, setArmed] = useState(false);
  const [cover, setCover] = useState<'on' | 'leaving' | 'off'>('on');
  const flat = usePhone();
  const list = videos ?? [];
  const key = list.map((v) => v.id).join('|');

  useEffect(() => {
    setOrder(key ? key.split('|') : []);
    setLeaving(null);
  }, [key]);

  // Poster first: the front card's video waits for the fonts and an idle moment (v1's rule), so the preloaded poster stays the LCP.
  useEffect(() => {
    let alive = true;
    void document.fonts.ready.then(() => idle(() => alive && setArmed(true)));
    return () => {
      alive = false;
    };
  }, []);

  const run = ok && wanted && onScreen && !held && !paused && !leaving && order.length > 1;
  // The front card may preview while the deck is merely held (a pointer resting on it); it stops when the deck is off screen, paused or still.
  const live = armed && ok && wanted && onScreen && !paused;

  // The dwell resumes where it was held, as the CSS progress fill does (its animation pauses with data-run).
  const remaining = useRef(DWELL);
  const frontId = order[0];
  useEffect(() => {
    remaining.current = DWELL;
  }, [frontId, arrived]);
  useEffect(() => {
    if (!run) return;
    const began = performance.now();
    const t = window.setTimeout(() => setLeaving(frontId ?? null), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current = Math.max(0, remaining.current - (performance.now() - began));
    };
  }, [run, frontId, arrived]);

  const landed = (id: string) => {
    setOrder((o) => [...o.filter((x) => x !== id), id]);
    setLeaving(null);
    setArrived((n) => n + 1);
  };

  const step = (dir: 1 | -1) => {
    if (order.length < 2) return;
    if (dir === 1) {
      const front = order[0];
      if (!front) return;
      if (ok) setLeaving(front);
      else landed(front);
    } else {
      setLeaving(null);
      setOrder((o) => [o[o.length - 1] as string, ...o.slice(0, -1)]);
      setArrived((n) => n + 1);
    }
  };

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else return;
    e.preventDefault();
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -500) step(1);
    else if (info.offset.x > 80 || info.velocity.x > 500) step(-1);
  };

  const byId = new Map(list.map((v) => [v.id, v]));
  const cards = order.map((id) => byId.get(id)).filter((v): v is Video => Boolean(v));
  const front = cards[0];
  // Story progress: one segment per card in the deck's own order; those before the front are full.
  const position = front ? Math.max(0, list.findIndex((v) => v.id === front.id)) : 0;

  // (r18) The deck's order is random per load, so its front is rarely the poster's video. The poster card stays on top until the front's picture
  // has decoded (no blank card behind it), then leaves the way any card leaves the deck (still: at once). The same picture: it simply gives way.
  const frontPicture = front ? (front.posterUrl ?? poster) : null;
  useEffect(() => {
    if (cover !== 'on' || !frontPicture) return;
    if (frontPicture === poster) {
      setCover('off');
      return;
    }
    let alive = true;
    const go = () => alive && setCover(ok ? 'leaving' : 'off');
    const img = new Image();
    img.src = frontPicture;
    img.decode().then(go, go);
    return () => {
      alive = false;
    };
  }, [cover, frontPicture, poster, ok]);

  return (
    <div className={`vdeck-wrap ${className ?? ''}`}>
      <div
        ref={box}
        className="vdeck"
        data-run={run ? '' : undefined}
        role="group"
        aria-roledescription="carousel"
        aria-label="Our reels"
        onKeyDown={onKey}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
      >
        {(cover !== 'off' || cards.length === 0) && (
          // The first paint (the preloaded poster), kept as its own card on top until the random front's picture is ready (r18); the same element
          // throughout, so the LCP image is never swapped. Once cards are under it, it is decoration: hidden and inert (clicks reach the front).
          <m.div
            key="cover"
            className="vdeck-card"
            data-slot="0"
            data-cover=""
            style={{ zIndex: 9 }}
            initial={false}
            animate={cover === 'leaving' ? (flat ? FLAT_EXIT : EXIT) : SLOTS[0]}
            transition={spring.glide}
            onAnimationComplete={() => cover === 'leaving' && setCover('off')}
            aria-hidden={cards.length > 0 || undefined}
            inert={cards.length > 0 || undefined}
          >
            <div className="vframe vframe-phone" data-frame="phone">
              <span className="vframe-screen">
                <img src={poster} alt="" fetchPriority="high" decoding="async" />
                <span className="vframe-scrim" aria-hidden />
                <span className="vframe-island" aria-hidden />
              </span>
            </div>
          </m.div>
        )}
        {cards.map((v, slot) => {
            const out = v.id === leaving;
            const isFront = slot === 0 && !out;
            // (hover7) The two back cards you can see play on hover too: decorative frames (no button, nothing focusable), so they are only
            // aria-hidden, not inert, which would also drop their pointer events. The leaving card and the hidden fourth stay inert.
            const peek = !flat && !isFront && !out && slot > 0 && slot < 3;
            // Flat: while the front leaves, the card behind it already takes the front's place.
            const at = flat && leaving && !out ? Math.max(0, slot - 1) : slot;
            const target = flat ? (out ? FLAT_EXIT : FLAT_SLOTS[Math.min(at, 1)]) : out ? EXIT : SLOTS[Math.min(slot, 3)];
            return (
              <m.div
                key={v.id}
                className="vdeck-card"
                data-slot={Math.min(at, 3)}
                style={{ zIndex: out ? 9 : 8 - slot }}
                initial={false}
                animate={target}
                transition={out ? spring.glide : spring.smooth}
                onAnimationComplete={() => out && landed(v.id)}
                drag={isFront && !finePointer() ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragStart={() => setHeld(true)}
                onDragEnd={(e, info) => {
                  setHeld(false);
                  onDragEnd(e, info);
                }}
                aria-hidden={isFront ? undefined : true}
                inert={isFront || peek ? undefined : true}
              >
                <VideoFrame
                  video={v.id === front?.id && !v.posterUrl ? { ...v, posterUrl: poster } : v}
                  variant="phone"
                  onOpen={isFront ? onOpen : undefined}
                  preview={!armed ? 'none' : isFront ? 'active' : 'hover'}
                  active={isFront && live}
                  eager={slot < 2}
                  label={`Watch the ${v.brand} street interview with sound`}
                >
                  {isFront && (
                    <>
                      <span className="vdeck-progress" aria-hidden>
                        {list.slice(0, cards.length).map((c, i) => (
                          <span key={i === position ? `${c.id}-${arrived}` : c.id} data-now={i === position ? '' : undefined} data-done={i < position ? '' : undefined} />
                        ))}
                      </span>
                      <span className="vdeck-watch glass-media" aria-hidden>
                        <Play className="size-4 fill-current" /> Watch with sound
                      </span>
                    </>
                  )}
                </VideoFrame>
                {isFront && cover === 'off' && <ViewsSticker key={`${v.id}-${arrived}`} views={v.views} tilt={-6} pop={arrived > 0 ? 'mount' : 'view'} className="vdeck-sticker" />}
              </m.div>
            );
          })}
        {cards.length > 1 && <ReelPause wanted={wanted} label={label} onToggle={toggle} className="vdeck-pause" />}
      </div>
      {viewsCard && front && (
        <div className="vdeck-views">
          <BrandPill brand={front.brand} />
          {front.views > 0 && (
            <span className="vdeck-count" key={front.id}>
              <RollNumber {...compactViews(front.views)} countUp={false} pop className="vdeck-count-n" /> views
            </span>
          )}
          {cards.length > 1 && (
            <span className="vdeck-steps">
              <button type="button" className="rail-paddle" onClick={() => step(-1)} aria-label="Previous reel">
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button type="button" className="rail-paddle" onClick={() => step(1)} aria-label="Next reel">
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** "11M", "210K" as a rolling number: the value in millions or thousands (one decimal at most) and its suffix, the way formatViews writes it. */
function compactViews(views: number): { value: number; suffix: string } {
  if (views >= 1_000_000) return { value: Math.round(views / 100_000) / 10, suffix: 'M' };
  if (views >= 1_000) return { value: Math.round(views / 100) / 10, suffix: 'K' };
  return { value: views, suffix: '' };
}

// ---------- DeckCard (M8) ----------

export interface DeckCardProps {
  /** Up to three posters, front first. Fewer is fine; none shows tone plates. */
  videos: Video[];
  /** The card is a link (a route)... */
  to?: string;
  /** ...or a button. */
  onClick?: () => void;
  /** Accessible name when the text below is not enough. */
  label?: string;
  /** A small chip that pops at the top left on hover, from real data only ("12 videos"). */
  stat?: ReactNode;
  /** 'card' (default): posters as 9:16 cards. 'polaroid': white-framed. */
  frame?: 'card' | 'polaroid';
  /** The words, below the frame and never tilted. */
  children?: ReactNode;
  className?: string;
}

/** Three posters stacked in a plate: the back two at ±6°, opening to ±11° on hover. Text sits below the stack, so nothing with words tilts. */
export function DeckCard({ videos, to, onClick, label, stat, frame = 'card', children, className }: DeckCardProps) {
  const posters = videos.slice(0, 3);
  while (posters.length < 3 && posters.length > 0) posters.push(posters[posters.length - 1] as Video);
  const stack = (
    <span className="deckcard-stack" data-frame={frame} aria-hidden>
      {[2, 1, 0].map((i) => {
        const v = posters[i];
        return (
          <span key={i} className="deckcard-sheet" data-i={i}>
            {v?.posterUrl ? <img src={v.posterUrl} alt="" loading="lazy" decoding="async" /> : v ? <TileEmpty video={v} /> : <span className="tile-empty" data-tone={TONES[i]} />}
          </span>
        );
      })}
      {stat && <span className="chip deckcard-stat">{stat}</span>}
    </span>
  );
  const body = (
    <>
      {stack}
      {children && <span className="deckcard-text">{children}</span>}
    </>
  );
  const cls = `deckcard plate ${to || onClick ? 'deckcard-link' : ''} ${className ?? ''}`;
  if (to)
    return (
      <Link to={to} className={cls} aria-label={label}>
        {body}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" className={cls} onClick={onClick} aria-label={label}>
        {body}
      </button>
    );
  return <div className={cls}>{body}</div>;
}

// ---------- StoryRing (M6) ----------

const SEEN_KEY = 'kreators-seen-brands';
const seenListeners = new Set<() => void>();
let seenCache: string | null = null;

function readSeen(): string {
  if (seenCache !== null) return seenCache;
  try {
    seenCache = localStorage.getItem(SEEN_KEY) ?? '[]';
  } catch {
    seenCache = '[]';
  }
  return seenCache;
}

/** Remember that a video of this brand has been opened (its story ring turns grey). A per-browser convenience; storage may refuse. */
export function markBrandSeen(brand: string) {
  let list: string[] = [];
  try {
    const parsed: unknown = JSON.parse(readSeen());
    if (Array.isArray(parsed)) list = parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    list = [];
  }
  if (list.includes(brand)) return;
  list.push(brand);
  seenCache = JSON.stringify(list.slice(-100));
  try {
    localStorage.setItem(SEEN_KEY, seenCache);
  } catch {
    // only this visit remembers it
  }
  seenListeners.forEach((fn) => fn());
}

/** The brands whose videos this browser has opened. */
export function useSeenBrands(): ReadonlySet<string> {
  const raw = useSyncExternalStore(
    (fn) => {
      seenListeners.add(fn);
      return () => seenListeners.delete(fn);
    },
    readSeen,
    () => '[]',
  );
  const [set, setSet] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(raw);
      setSet(new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []));
    } catch {
      setSet(new Set());
    }
  }, [raw]);
  return set;
}

export interface StoryRingProps {
  /** The brand's name: the ring's label and, by default, its caption. */
  brand: string;
  /** Defaults to the brand's logo from BRANDS; a letter disc otherwise. */
  logo?: string;
  /** A video of this brand has been opened: the ring goes grey. */
  seen?: boolean;
  /** The filter is on: a thicker ring and a check badge. */
  selected?: boolean;
  /** A filter toggle (a button with aria-pressed). */
  onSelect?: () => void;
  /** A link instead (the dashed "Your brand" ring). */
  to?: string;
  /** The dashed outline of an empty ring. */
  dashed?: boolean;
  /** The caption under the ring. Defaults to `brand`. */
  caption?: ReactNode;
  /** Circle size in px. Default 64. */
  size?: number;
  /** Just the picture, no caption, no control (the Home proof row): aria-hidden. */
  decorative?: boolean;
  className?: string;
}

/** A brand in a story ring: a static four-colour conic ring that turns as a whole on hover, grey once seen. A filter, not a player shortcut. */
export function StoryRing({ brand, logo, seen = false, selected = false, onSelect, to, dashed = false, caption, size = 64, decorative = false, className }: StoryRingProps) {
  const art = logo ?? brandLogo(brand);
  const circle = (
    <span className="story-ring-circle" aria-hidden>
      <span className="story-ring-art" />
      <span className="story-ring-face">{dashed ? <span className="story-ring-plus">+</span> : art ? <img src={art} alt="" loading="lazy" /> : <span className="story-ring-letter" data-tone={toneOf(brand)}>{brand.charAt(0)}</span>}</span>
      {selected && (
        <span className="story-ring-check">
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  );
  const attrs = {
    className: `story-ring ${className ?? ''}`,
    style: { '--ring': `${size}px` } as CSSProperties,
    'data-seen': seen && !selected ? '' : undefined,
    'data-selected': selected ? '' : undefined,
    'data-dashed': dashed ? '' : undefined,
  };
  if (decorative) return <span {...attrs} aria-hidden>{circle}</span>;
  const text = <span className="story-ring-caption">{caption ?? brand}</span>;
  if (to)
    return (
      <Link to={to} {...attrs}>
        {circle}
        {text}
      </Link>
    );
  return (
    <button type="button" {...attrs} aria-pressed={onSelect ? selected : undefined} onClick={onSelect}>
      {circle}
      {text}
    </button>
  );
}

// ---------- Coverflow (M14) ----------

export interface CoverflowProps {
  videos: Video[];
  onOpen: (v: Video) => void;
  /** The row's accessible name, e.g. "Featured videos". */
  label: string;
  /** The centre card previews (one at a time, desktop only). Default true. */
  preview?: boolean;
  className?: string;
}

/**
 * A row with one card in the centre, flat and previewing; neighbours turn away at ±24° and step down in scale behind a dark veil. Arrows, arrow keys
 * and a drag (touch) step it on spring.smooth. Under Pause animations it is a flat row with the active card outlined.
 */
export function Coverflow({ videos, onOpen, label, preview = true, className }: CoverflowProps) {
  const [index, setIndex] = useState(0);
  const ok = useMotionOk();
  const drag = useMotionValue(0);
  const count = videos.length;
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));
  const go = (i: number) => setIndex(clamp(i));
  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else return;
    e.preventDefault();
  };

  if (count === 0) return null;

  return (
    <div className={`coverflow ${className ?? ''}`} role="group" aria-roledescription="carousel" aria-label={label} onKeyDown={onKey} data-still={ok ? undefined : ''}>
      <m.div
        className="coverflow-track"
        style={{ x: drag }}
        drag={finePointer() ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1);
          else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1);
        }}
      >
        {videos.map((v, i) => {
          const d = i - index;
          const a = Math.abs(d);
          const hidden = a > 3;
          const target = ok
            ? { x: `${d * 62}%`, rotateY: d === 0 ? 0 : d < 0 ? 24 : -24, scale: a === 0 ? 1 : a === 1 ? 0.84 : 0.68, opacity: hidden ? 0 : 1 }
            : { x: `${d * 104}%`, rotateY: 0, scale: 1, opacity: hidden ? 0 : 1 };
          return (
            <m.div
              key={v.id}
              className="coverflow-item"
              data-centre={d === 0 ? '' : undefined}
              style={{ zIndex: 10 - a, transformPerspective: 1200 }}
              initial={false}
              animate={target}
              transition={spring.smooth}
              aria-hidden={hidden ? true : undefined}
              inert={hidden || undefined}
              onClickCapture={(e) => {
                if (d !== 0) {
                  e.preventDefault();
                  e.stopPropagation();
                  go(i);
                }
              }}
            >
              <VideoFrame video={v} variant="card" onOpen={onOpen} preview={preview ? 'active' : 'none'} active={d === 0} sticker />
              <span className="coverflow-veil" aria-hidden style={{ opacity: ok ? Math.min(a, 2) * 0.2 : 0 }} />
            </m.div>
          );
        })}
      </m.div>
      {count > 1 && (
        <div className="coverflow-steps">
          <button type="button" className="nav-icon" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous featured video">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <span className="coverflow-count" aria-live="polite">
            {index + 1} of {count}
          </span>
          <button type="button" className="nav-icon" onClick={() => go(index + 1)} disabled={index === count - 1} aria-label="Next featured video">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
