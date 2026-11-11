// Owner: A4 Admin; inline editing by adm (round 3). One row of the videos list (admin brief 5.3, V2-SPEC 4.2): handle, poster, title and brand, the
// Published switch, the stream chip, category, platform, upload date, views, posted-on glyphs, the updated time and the row menu. On desktop widths
// the title, brand, category, platform, upload date, views and the two links edit in place (inlineEdit.tsx); a click anywhere else but the handle,
// the switch and the menu opens the drawer, as a tap anywhere on the row does on phones. A missing field shows nothing (views 0 included).
import { gradeLabel, resolutionLabel, type AdminVideo, type VideoProblem } from '@kreators/shared';
import { Ellipsis, GripVertical, RotateCcw, Star, Trash2 } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { InstagramGlyph, YouTubeGlyph, toneOf } from '../components/frames';
import { spring } from '../lib/spring';
import { MenuButton, StatusChip, Switch, When, usePopover, type ChipTone, type MenuItem } from './bits';
import { SelectBox } from './bulk';
import { EditCell, PROBLEM_WORDS, cellDisplay, type InlineEditor } from './inlineEdit';
import type { ColKey } from './listColumns';
import type { ReorderApi } from './useReorder';

export { PROBLEM_WORDS };

/** The stream chip: what the site plays for this entry, and whether it needs a look. Red stays for actions, so problems are amber. */
export function streamChip(v: AdminVideo): { tone: ChipTone; text: string; title?: string } {
  if (v.source === 'mega' && v.mega) {
    const mg = v.mega;
    if (mg.keyIn === 'secret') return { tone: 'amber', text: 'MEGA key in old secret', title: 'Move it into the library from the banner above.' };
    if (v.problems.includes('hevc')) return { tone: 'amber', text: 'MEGA · HEVC ⚠', title: "Some browsers can't play HEVC. It still streams; an H.264 export plays everywhere." };
    if (v.problems.includes('video-codec')) return { tone: 'amber', text: 'MEGA · codec ⚠', title: "Many browsers can't play this codec. It still streams; an H.264 export plays everywhere." };
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
  inline,
  cols,
  selected = false,
  onSelect,
  note,
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
  /** Editing in place (desktop widths, not the bin); null shows plain cells. */
  inline: InlineEditor | null;
  cols: ReadonlySet<ColKey>;
  /** (sel) Multi-select: the row's checkbox state, and a pick from the checkbox or a Shift/Cmd/Ctrl click on the row. */
  selected?: boolean;
  onSelect?: (how: { shift: boolean }) => void;
  /** (sel) Why a bulk action skipped this row, while the founder looks at those rows. */
  note?: string | null;
}) {
  const { pop, anchor, show, hide } = usePopover('start');
  const isActive = reorder.active === video.id;
  const isLifted = reorder.lifted === video.id;
  const chip = streamChip(video);
  const title = video.title || 'Untitled video';

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
    // (sel) Shift+click selects a range, Cmd/Ctrl+click toggles: anywhere but the controls that have their own job (the cells included).
    if (onSelect && (e.shiftKey || e.metaKey || e.ctrlKey)) {
      if ((e.target as HTMLElement).closest('.adm-sel, .adm-handle, [role="switch"], .adm-row-menu, a, input, [role="menu"], [popover]')) return;
      e.preventDefault();
      onSelect({ shift: e.shiftKey });
      return;
    }
    if ((e.target as HTMLElement).closest('button, a, input, [role="menu"], [popover]')) return;
    // The click that ended an edit in place is not a click on the row.
    if (inline?.justClosed()) return;
    onOpen();
  };

  const text = (f: 'category' | 'platform' | 'uploadDate') => cellDisplay(video, f);

  return (
    <m.li
      ref={reorder.rowRef(video.id)}
      className="adm-row"
      data-id={video.id}
      data-lifted={isLifted ? reorder.mode ?? '' : undefined}
      data-active={isActive ? '' : undefined}
      data-selected={selected ? '' : undefined}
      layout={isActive ? false : 'position'}
      animate={{ scale: isLifted ? 1.02 : 1 }}
      transition={{ layout: spring.snappy, scale: spring.follow }}
      style={{ y: isActive ? reorder.y : 0, zIndex: isActive ? 5 : undefined }}
      onClick={openUnlessControl}
      onMouseDown={(e) => {
        // A Shift+click selects rows, not the text between them.
        if (e.shiftKey && onSelect && !(e.target as HTMLElement).closest('input, textarea')) e.preventDefault();
      }}
    >
      {onSelect && <SelectBox checked={selected} label={`Select ${title}`} onPick={onSelect} className="adm-row-check" />}
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
        {inline ? (
          <>
            <EditCell video={video} field="title" inline={inline} className="adm-cell-title">
              <span className="adm-row-title">{title}</span>
            </EditCell>
            <EditCell video={video} field="brand" inline={inline} className="adm-cell-brand">
              <span className="adm-row-brand">{video.brand.trim() ? video.brand : <StatusChip tone="amber">Brand needed</StatusChip>}</span>
            </EditCell>
          </>
        ) : (
          <>
            {bin ? (
              <span className="adm-row-title" title={title}>
                {title}
              </span>
            ) : (
              <Link to={to} className="adm-row-title" draggable={false} title={title}>
                {title}
              </Link>
            )}
            <span className="adm-row-brand">{video.brand.trim() ? video.brand : <StatusChip tone="amber">Brand needed</StatusChip>}</span>
          </>
        )}
        {note && <span className="adm-row-note">{note}</span>}
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

      {cols.has('stream') && (
        <span className="adm-row-stream">
          <StatusChip tone={chip.tone} title={chip.title ? `${chip.text}. ${chip.title}` : chip.text}>
            {chip.text}
          </StatusChip>
        </span>
      )}

      {cols.has('category') && (
        <EditCell video={video} field="category" inline={inline} className="adm-row-cell adm-col-category">
          <span className="adm-cell-text">{text('category')}</span>
        </EditCell>
      )}
      {cols.has('platform') && (
        <EditCell video={video} field="platform" inline={inline} className="adm-row-cell adm-col-platform">
          <span className="adm-cell-text">{text('platform')}</span>
        </EditCell>
      )}
      {cols.has('uploaded') && (
        <EditCell video={video} field="uploadDate" inline={inline} className="adm-row-cell adm-col-uploaded" tooltip={video.uploadDate ? `Uploaded ${text('uploadDate')}` : undefined}>
          <span className="adm-cell-text">{text('uploadDate')}</span>
        </EditCell>
      )}
      {cols.has('views') && (
        <EditCell video={video} field="views" inline={inline} className="adm-row-views" tooltip={video.views > 0 ? `${video.views.toLocaleString('en-IN')} views` : undefined}>
          <span className="adm-cell-text">{cellDisplay(video, 'views')}</span>
        </EditCell>
      )}

      {cols.has('posted') &&
        (inline ? (
          <span className="adm-posted">
            <EditCell video={video} field="instagram" inline={inline} className="adm-cell-glyph" tooltip={video.instagramUrl ? `Instagram: ${video.instagramUrl}` : 'Add an Instagram link'}>
              <InstagramGlyph className="size-4" />
            </EditCell>
            <EditCell video={video} field="youtube" inline={inline} className="adm-cell-glyph" tooltip={video.youtubeUrl ? `YouTube: ${video.youtubeUrl}` : 'Add a YouTube link'}>
              <YouTubeGlyph className="size-4" />
            </EditCell>
          </span>
        ) : (
          <PostedGlyphs instagram={video.instagramUrl} youtube={video.youtubeUrl} />
        ))}

      {cols.has('updated') && <span className="adm-row-time">{bin ? <When value={video.deletedAt} /> : <When value={video.updatedAt} />}</span>}

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
