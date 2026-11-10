// Owner: A4 Admin. One row of the videos list (admin brief 5.3, V2-SPEC 4.2): handle, poster, title and brand, the Published switch, the stream chip,
// posted-on glyphs, views, the updated time and the row menu. A click anywhere but the handle, the switch, the links and the menu opens the drawer.
import { formatViews, gradeLabel, resolutionLabel, type AdminVideo, type VideoProblem } from '@kreators/shared';
import { Ellipsis, GripVertical, RotateCcw, Star, Trash2 } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { InstagramGlyph, YouTubeGlyph, toneOf } from '../components/frames';
import { spring } from '../lib/spring';
import { MenuButton, StatusChip, Switch, When, usePopover, type ChipTone, type MenuItem } from './bits';
import type { ReorderApi } from './useReorder';

/** The stream chip: what the site plays for this entry, and whether it needs a look. Red stays for actions, so problems are amber. */
export function streamChip(v: AdminVideo): { tone: ChipTone; text: string; title?: string } {
  if (v.source === 'mega' && v.mega) {
    const mg = v.mega;
    if (mg.keyIn === 'secret') return { tone: 'amber', text: 'MEGA key in old secret', title: 'Move it into the library from the banner above.' };
    if (v.problems.includes('hevc')) return { tone: 'amber', text: "HEVC · can't publish", title: 'Export it as H.264 to publish.' };
    if (v.problems.includes('video-codec')) return { tone: 'amber', text: "Codec · can't publish", title: 'Export it as H.264 to publish.' };
    if (v.problems.includes('mega-unreachable')) return { tone: 'amber', text: 'MEGA · link broken', title: 'The MEGA link no longer works.' };
    if (mg.error && !mg.meta) return { tone: 'amber', text: "MEGA · couldn't check", title: "Couldn't reach MEGA. Open the video and check again." };
    const res = resolutionLabel(mg.meta?.width ?? null, mg.meta?.height ?? null);
    if (mg.grade === 'ready') return { tone: 'green', text: `MEGA · ${res ?? 'ready'}`, title: gradeLabel(mg.grade, mg.meta) };
    if (mg.grade === 'heavy' || mg.grade === 'too-heavy') return { tone: 'amber', text: `MEGA · ${res ?? 'heavy'} ⚠`, title: gradeLabel(mg.grade, mg.meta) };
    return { tone: 'grey', text: 'MEGA', title: gradeLabel('unknown', mg.meta) };
  }
  if (v.source === 'file') return { tone: 'grey', text: 'Bundled file' };
  if (v.source === 'youtube') return { tone: 'amber', text: 'YouTube embed · no MEGA', title: 'Add a MEGA link to stream it from the site.' };
  if (v.source === 'wave') return { tone: 'amber', text: 'wave.video · no MEGA', title: 'Add a MEGA link to stream it from the site.' };
  return { tone: 'amber', text: 'No stream', title: 'Add a MEGA link.' };
}

/** Blocking problems in plain words (the inline switch's popover and the drawer's disabled publish button). */
export const PROBLEM_WORDS: Partial<Record<VideoProblem, string>> = {
  'no-title': 'Add a title',
  'no-brand': 'Add a brand',
  'no-stream': 'Add a MEGA link or a bundled file',
  'mega-unreachable': 'The MEGA link no longer works',
  hevc: 'Export it as H.264 (this file is HEVC)',
  'video-codec': 'Export it as H.264',
};

export function Thumb({ video, className }: { video: Pick<AdminVideo, 'poster' | 'aspect' | 'brand'>; className?: string }) {
  return (
    <span className={`adm-thumb ${className ?? ''}`} data-shape={video.aspect} data-tone={toneOf(video.brand || 'x')} aria-hidden>
      {video.poster ? <img src={video.poster.url} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </span>
  );
}

export function PostedGlyphs({ instagram, youtube }: { instagram: string | null; youtube: string | null }) {
  return (
    <span className="adm-posted">
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Also on Instagram" title="Also on Instagram" className="adm-glyph">
          <InstagramGlyph className="size-4" />
        </a>
      )}
      {youtube && (
        <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="Also on YouTube" title="Also on YouTube" className="adm-glyph">
          <YouTubeGlyph className="size-4" />
        </a>
      )}
    </span>
  );
}

export function VideoRow({
  video,
  index,
  reorder,
  reorderOn,
  hintId,
  bin,
  to,
  onOpen,
  publishBusy,
  blocked,
  onTogglePublish,
  onDismissBlocked,
  menuItems,
  onRestore,
  onPurge,
}: {
  video: AdminVideo;
  index: number;
  reorder: ReorderApi;
  reorderOn: boolean;
  hintId: string;
  bin: boolean;
  to: string;
  onOpen: () => void;
  publishBusy?: boolean;
  blocked?: VideoProblem[] | null;
  onTogglePublish?: (next: boolean) => void;
  onDismissBlocked?: () => void;
  menuItems?: MenuItem[];
  onRestore?: () => void;
  onPurge?: () => void;
}) {
  const { pop, anchor, show, hide } = usePopover('start');
  const isActive = reorder.active === video.id;
  const isLifted = reorder.lifted === video.id;
  const chip = streamChip(video);

  useEffect(() => {
    if (blocked?.length) show();
    else hide();
  }, [blocked, show, hide]);

  useEffect(() => {
    const el = pop.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === 'closed') onDismissBlocked?.();
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, [pop, onDismissBlocked]);

  const openUnlessControl = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, [role="menu"], [popover]')) return;
    onOpen();
  };

  return (
    <m.li
      ref={reorder.rowRef(video.id)}
      className="adm-row"
      data-id={video.id}
      data-lifted={isLifted ? reorder.mode ?? '' : undefined}
      data-active={isActive ? '' : undefined}
      layout={isActive ? false : 'position'}
      animate={{ scale: isLifted ? 1.02 : 1 }}
      transition={{ layout: spring.snappy, scale: spring.follow }}
      style={{ y: isActive ? reorder.y : 0, zIndex: isActive ? 5 : undefined }}
      onClick={openUnlessControl}
    >
      {bin ? (
        <span className="adm-handle" aria-hidden />
      ) : (
        <button
          ref={reorder.handleRef(video.id)}
          type="button"
          className="adm-handle"
          aria-label={`Reorder ${video.title}`}
          aria-describedby={hintId}
          aria-disabled={!reorderOn || undefined}
          aria-pressed={reorder.mode === 'keyboard' ? isLifted : undefined}
          title={reorderOn ? undefined : 'Clear filters to reorder'}
          data-index={index}
          onPointerDown={(e) => reorder.onHandlePointerDown(video.id, e)}
          onKeyDown={(e) => reorder.onHandleKeyDown(video.id, e)}
          onBlur={() => reorder.onHandleBlur(video.id)}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      )}

      <Thumb video={video} />

      <div className="adm-row-main">
        <Link to={to} className="adm-row-title" draggable={false}>
          {video.title || 'Untitled video'}
        </Link>
        <span className="adm-row-brand">{video.brand.trim() ? video.brand : <StatusChip tone="amber">Brand needed</StatusChip>}</span>
      </div>

      <div className="adm-row-status">
        {bin ? (
          <StatusChip tone="grey">In the bin</StatusChip>
        ) : (
          <>
            <Switch
              switchRef={anchor}
              checked={video.published}
              busy={publishBusy}
              label={`Published: ${video.title}`}
              visibleLabel={video.published ? 'Published' : 'Draft'}
              onChange={(next) => onTogglePublish?.(next)}
              className="adm-row-switch"
            />
            {video.featured && (
              <StatusChip tone="blue" className="adm-featured">
                <Star className="size-3" aria-hidden /> Featured
              </StatusChip>
            )}
          </>
        )}
        <div ref={pop} popover="auto" className="adm-pop adm-blocked" role="dialog" aria-label="Why it can't go live">
          <p className="adm-pop-title">This video can't go live yet:</p>
          <ul>{blocked?.map((p) => <li key={p}>{PROBLEM_WORDS[p] ?? p}</li>)}</ul>
          <button
            type="button"
            className="btn btn-sm btn-ink"
            onClick={() => {
              hide();
              onOpen();
            }}
          >
            Open it
          </button>
        </div>
      </div>

      <span className="adm-row-stream">
        <StatusChip tone={chip.tone} title={chip.title}>
          {chip.text}
        </StatusChip>
      </span>

      <PostedGlyphs instagram={video.instagramUrl} youtube={video.youtubeUrl} />

      <span className="adm-row-views">{formatViews(video.views)}</span>

      <span className="adm-row-time">{bin ? <When value={video.deletedAt} /> : <When value={video.updatedAt} />}</span>

      <span className="adm-row-menu">
        {bin ? (
          <span className="adm-bin-actions">
            <button type="button" className="btn btn-sm btn-ghost" onClick={onRestore}>
              <RotateCcw className="size-4" aria-hidden /> Restore
            </button>
            <button type="button" className="btn btn-sm btn-ghost adm-danger-text" onClick={onPurge}>
              <Trash2 className="size-4" aria-hidden /> Delete forever
            </button>
          </span>
        ) : (
          <MenuButton label={`More for ${video.title}`} items={menuItems ?? []}>
            <Ellipsis className="size-5" aria-hidden />
          </MenuButton>
        )}
      </span>
    </m.li>
  );
}
