// Owner: A4 Admin; inline editing and columns by adm (round 3). The videos list (admin brief 5.3, V2-SPEC 4.3): search, filter chips with counts, rows
// with the Published switch, reorder by drag and by keyboard, the row menu, delete to the bin with Undo, the bin view, and the add and edit drawer on top
// (/admin/videos/new, /admin/videos/:id). On desktop widths the cells edit in place (inlineEdit.tsx) and the columns can be chosen (listColumns.tsx).
import { BLOCKING_PROBLEMS, type AdminVideo, type AdminVideoList, type VideoProblem } from '@kreators/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownToLine, ArrowUpToLine, Copy, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { ChipRail } from '../components/tabs';
import { Seo } from '../components/ui';
import { AdminApiError, adminApi, keys, retryOnce } from './api';
import { Announcer, ConfirmDialog, EmptyState, type MenuItem } from './bits';
import { useInlineEditor } from './inlineEdit';
import { COLUMNS, ColumnsMenu, useColumns } from './listColumns';
import { toast } from './Toasts';
import { useReorder } from './useReorder';
import { deleteWithUndo, mergeVideo } from './videoCache';
import { VideoDrawer } from './VideoDrawer';
import { VideoRow } from './VideoRow';

type Filter = 'all' | 'published' | 'drafts' | 'attention' | 'bin';

const ATTENTION = (v: AdminVideo) => v.problems.length > 0;

function matches(v: AdminVideo, q: string) {
  if (!q) return true;
  const hay = `${v.title} ${v.brand} ${v.mega?.meta?.name ?? ''}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

/** Desktop widths edit in place; under 861 px (the phone layout) a tap opens the drawer. */
const WIDE = '(min-width: 861px)';
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

function SkeletonRows() {
  return (
    <ul className="adm-rows" aria-busy="true" aria-label="Loading the videos">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="adm-row adm-row-skel">
          <span className="skeleton adm-skel-handle" />
          <span className="skeleton adm-skel-thumb" />
          <span className="adm-row-main">
            <span className="skeleton adm-skel-line" />
            <span className="skeleton adm-skel-line adm-skel-short" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function VideosScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const bin = params.get('bin') === '1';
  const importId = params.get('import');
  const [filter, setFilter] = useState<Exclude<Filter, 'bin'>>('all');
  const [q, setQ] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<{ id: string; problems: VideoProblem[] } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminVideo | null>(null);
  const [confirmPurge, setConfirmPurge] = useState<AdminVideo | null>(null);
  const [working, setWorking] = useState(false);
  const hintId = useId();
  const listId = useId();
  const saveTimer = useRef(0);
  const screenRef = useRef<HTMLElement>(null);
  const [saveNote, setSaveNote] = useState('');
  const wide = useWide();
  const cols = useColumns(screenRef, bin);

  const list = useQuery({ queryKey: keys.videos(false), queryFn: () => adminApi.videos(false), staleTime: 15_000, retry: retryOnce });
  const binList = useQuery({ queryKey: keys.videos(true), queryFn: () => adminApi.videos(true), enabled: bin, retry: retryOnce });

  const all = useMemo(() => list.data?.videos ?? [], [list.data]);
  const counts = useMemo(
    () => ({
      all: all.length,
      published: all.filter((v) => v.published).length,
      drafts: all.filter((v) => !v.published).length,
      attention: all.filter(ATTENTION).length,
      bin: binList.data?.videos.length ?? list.data?.binCount ?? 0,
    }),
    [all, binList.data, list.data],
  );

  // Suggestions for the brand, category and platform cells (the drawer's datalists, from the whole library).
  const options = useMemo(() => {
    const pick = (f: (v: AdminVideo) => string | null) => [...new Set(all.map(f).map((x) => x?.trim()).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b));
    return { brand: pick((v) => v.brand), category: pick((v) => v.category), platform: pick((v) => v.platform) };
  }, [all]);
  const lists = useMemo(() => ({ brand: `${listId}-brands`, category: `${listId}-cats`, platform: `${listId}-plats` }), [listId]);
  const politely = useCallback((text: string) => setSaveNote((prev) => (prev === text ? `${text} ` : text)), []);
  const inline = useInlineEditor(lists, politely);
  const editable = wide && !bin;

  const reorderOn = !bin && filter === 'all' && !q.trim() && !importId;
  const announce = useCallback((text: string) => setAnnouncement((prev) => (prev === text ? `${text} ` : text)), []);
  const titleOf = useCallback((id: string) => all.find((v) => v.id === id)?.title ?? 'this video', [all]);

  // Saving the order: optimistic at once, the PUT 600 ms after the last drop (V8). A 409 means another tab changed the list.
  const saveOrder = useCallback(
    (ids: string[]) => {
      qc.setQueryData<AdminVideoList>(keys.videos(false), (old) => {
        if (!old) return old;
        const byId = new Map(old.videos.map((v) => [v.id, v]));
        return { ...old, videos: ids.map((id, i) => ({ ...byId.get(id)!, sortOrder: (i + 1) * 10 })).filter((v) => v.id) };
      });
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        try {
          await adminApi.reorder(ids);
        } catch (e) {
          if (e instanceof AdminApiError && e.code === 'order-stale') toast('The order changed in another tab. Reloaded.');
          else if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
          await qc.invalidateQueries({ queryKey: keys.videos(false) });
        }
      }, 600);
    },
    [qc],
  );
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const ids = useMemo(() => all.map((v) => v.id), [all]);
  const reorder = useReorder({ ids, enabled: reorderOn, onCommit: saveOrder, announce, titleOf });

  const byId = useMemo(() => new Map(all.map((v) => [v.id, v])), [all]);
  const shown = useMemo(() => {
    if (bin) return (binList.data?.videos ?? []).filter((v) => matches(v, q.trim()));
    const ordered = reorder.order.map((id) => byId.get(id)).filter((v): v is AdminVideo => !!v);
    return ordered.filter(
      (v) =>
        matches(v, q.trim()) &&
        (!importId || v.importId === importId) &&
        (filter === 'all' || (filter === 'published' && v.published) || (filter === 'drafts' && !v.published) || (filter === 'attention' && ATTENTION(v))),
    );
  }, [bin, binList.data, reorder.order, byId, q, importId, filter]);

  const setBusy = (id: string, on: boolean) =>
    setBusyIds((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const togglePublish = async (v: AdminVideo, next: boolean) => {
    setBlocked(null);
    // Optimistic: the switch moves at once; a 422 puts it back and says why.
    mergeVideo(qc, { ...v, published: next });
    setBusy(v.id, true);
    try {
      const saved = await adminApi.updateVideo(v.id, { published: next });
      inline.noteAdvance(v.id, v.updatedAt, saved.video.updatedAt);
      mergeVideo(qc, saved.video);
      toast(next ? `Published “${saved.video.title}”` : `“${saved.video.title}” is hidden from the site`);
    } catch (e) {
      mergeVideo(qc, v);
      if (e instanceof AdminApiError && e.code === 'cannot-publish') {
        const problems = (e.body.problems ?? v.problems).filter((p) => BLOCKING_PROBLEMS.includes(p));
        setBlocked({ id: v.id, problems: problems.length ? problems : ['no-stream'] });
      } else if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setBusy(v.id, false);
    }
  };

  const remove = async (v: AdminVideo) => {
    setWorking(true);
    const ok = await deleteWithUndo(qc, v);
    setWorking(false);
    if (!ok) return;
    setConfirmDelete(null);
    if (location.pathname.endsWith(`/videos/${v.id}`)) navigate(`/admin/videos${location.search}`);
  };

  const restore = async (v: AdminVideo) => {
    try {
      const back = await adminApi.restoreVideo(v.id);
      mergeVideo(qc, back);
      await qc.invalidateQueries({ queryKey: keys.videos(false) });
      toast(`Restored “${v.title}” as a draft.`);
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    }
  };

  const purge = async (v: AdminVideo) => {
    setWorking(true);
    try {
      await adminApi.purgeVideo(v.id);
      qc.setQueryData<AdminVideoList>(keys.videos(true), (old) => (old ? { ...old, videos: old.videos.filter((x) => x.id !== v.id), binCount: Math.max(0, old.binCount - 1) } : old));
      qc.setQueryData<AdminVideoList>(keys.videos(false), (old) => (old ? { ...old, binCount: Math.max(0, old.binCount - 1) } : old));
      setConfirmPurge(null);
      toast(`Deleted “${v.title}” for good.`);
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const copyLink = async (v: AdminVideo) => {
    if (!v.streamUrl) return;
    try {
      await navigator.clipboard.writeText(new URL(v.streamUrl, window.location.origin).href);
      toast('Stream link copied');
    } catch {
      toast("Couldn't copy. Your browser blocked it.", { tone: 'error' });
    }
  };

  const menuFor = (v: AdminVideo): MenuItem[] => [
    { label: 'Edit', icon: <Pencil className="size-4" aria-hidden />, onSelect: () => navigate(`/admin/videos/${encodeURIComponent(v.id)}${location.search}`) },
    { label: 'Copy stream link', icon: <Copy className="size-4" aria-hidden />, onSelect: () => void copyLink(v), disabled: !v.streamUrl },
    { label: 'Move to top', icon: <ArrowUpToLine className="size-4" aria-hidden />, onSelect: () => reorder.moveTo(v.id, 'top'), disabled: !reorderOn },
    { label: 'Move to bottom', icon: <ArrowDownToLine className="size-4" aria-hidden />, onSelect: () => reorder.moveTo(v.id, 'bottom'), disabled: !reorderOn },
    { label: 'Delete', icon: <Trash2 className="size-4" aria-hidden />, onSelect: () => setConfirmDelete(v), danger: true },
  ];

  const clearFilters = () => {
    setFilter('all');
    setQ('');
    const p = new URLSearchParams(params);
    p.delete('import');
    p.delete('bin');
    setParams(p, { replace: true });
  };

  const chipValue: Filter = bin ? 'bin' : filter;
  const onChip = (value: Filter) => {
    const p = new URLSearchParams(params);
    if (value === 'bin') p.set('bin', '1');
    else {
      p.delete('bin');
      setFilter(value);
    }
    setParams(p, { replace: true });
  };

  const loading = bin ? binList.isPending : list.isPending;
  const failed = bin ? binList.error : list.error;
  const drawerBase = `/admin/videos${location.search}`;

  let body;
  if (loading) body = <SkeletonRows />;
  else if (failed) {
    body = (
      <div className="adm-state" role="alert">
        <p className="adm-state-title">The library didn't load.</p>
        <p className="adm-state-meta">{failed instanceof AdminApiError && failed.requestId ? `Request ${failed.requestId}` : failed instanceof Error ? failed.message : ''}</p>
        <button type="button" className="btn btn-sm btn-ink" onClick={() => void (bin ? binList.refetch() : list.refetch())}>
          Retry
        </button>
      </div>
    );
  } else if (!bin && all.length === 0) {
    body = (
      <EmptyState who="gola" size={100} title="No videos yet. Add the first one.">
        <div className="adm-empty-actions">
          <Link to="/admin/import" className="btn btn-sm btn-ghost">
            <Upload className="size-4" aria-hidden /> Import links
          </Link>
          <Link to="/admin/videos/new" className="btn btn-sm btn-accent">
            <Plus className="size-4" aria-hidden /> New video
          </Link>
        </div>
      </EmptyState>
    );
  } else if (bin && shown.length === 0 && !q) {
    body = (
      <div className="adm-state">
        <p className="adm-state-title">The bin is empty.</p>
      </div>
    );
  } else if (shown.length === 0) {
    body = (
      <div className="adm-state">
        <p className="adm-state-title">Nothing matches.</p>
        <button type="button" className="btn btn-sm btn-ghost" onClick={clearFilters}>
          Clear filters
        </button>
      </div>
    );
  } else {
    body = (
      <ul className="adm-rows" data-bin={bin ? '' : undefined} data-reorder={reorderOn ? '' : undefined} aria-label={bin ? 'Videos in the bin' : 'Videos, in the order the site shows them'}>
        {shown.map((v, i) => (
          <VideoRow
            key={v.id}
            video={v}
            index={i}
            reorder={reorder}
            reorderOn={reorderOn}
            hintId={hintId}
            bin={bin}
            to={`/admin/videos/${encodeURIComponent(v.id)}${location.search}`}
            onOpen={() => navigate(`/admin/videos/${encodeURIComponent(v.id)}${location.search}`)}
            publishBusy={busyIds.has(v.id)}
            blocked={blocked?.id === v.id ? blocked.problems : null}
            onDismissBlocked={() => setBlocked((b) => (b?.id === v.id ? null : b))}
            onTogglePublish={(next) => void togglePublish(v, next)}
            menuItems={menuFor(v)}
            onRestore={() => void restore(v)}
            onPurge={() => setConfirmPurge(v)}
            inline={editable ? inline : null}
            cols={cols.shown}
          />
        ))}
      </ul>
    );
  }

  return (
    <section ref={screenRef} className="adm-screen" aria-labelledby="adm-videos-title" style={{ '--adm-cols': cols.template } as CSSProperties}>
      <Seo title={bin ? 'Bin · Library admin' : 'Videos · Library admin'} description="Library admin" noindex />
      <div className="adm-head">
        <h1 id="adm-videos-title" className="adm-title">
          Videos
        </h1>
        <div className="adm-head-actions">
          <Link to="/admin/import" className="btn btn-sm btn-ghost">
            <Upload className="size-4" aria-hidden /> Import links
          </Link>
          <Link to="/admin/videos/new" className="btn btn-sm btn-accent" aria-keyshortcuts="n">
            <Plus className="size-4" aria-hidden /> New video
          </Link>
        </div>
      </div>

      <div className="adm-tools">
        <label className="adm-search">
          <Search className="size-4" aria-hidden />
          <span className="sr-only">Search title, brand or file name</span>
          <input
            type="search"
            data-admin-search
            placeholder="Search title, brand or file name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-keyshortcuts="/"
            onKeyDown={(e) => {
              if (e.key === 'Escape' && q) {
                e.preventDefault();
                setQ('');
              }
            }}
          />
          <kbd className="adm-kbd" aria-hidden>
            /
          </kbd>
        </label>
        <ChipRail
          mode="radio"
          size="sm"
          label="Show"
          className="adm-filters"
          value={chipValue}
          onChange={onChip}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'published', label: 'Published', count: counts.published },
            { value: 'drafts', label: 'Drafts', count: counts.drafts },
            { value: 'attention', label: 'Needs attention', count: counts.attention },
            { value: 'bin', label: 'Bin', count: counts.bin },
          ]}
        />
      </div>

      <div className="adm-subline">
        {importId && !bin && (
          <span className="adm-chip-filter">
            From this import
            <button type="button" aria-label="Show every video" onClick={() => setParams((p) => (p.delete('import'), p), { replace: true })}>
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        )}
        {bin ? (
          <p className="adm-hint">Videos in the bin are deleted for good after 30 days.</p>
        ) : reorderOn ? (
          <p className="adm-hint" id={hintId}>
            Drag to reorder. Or focus a handle and press Space.
          </p>
        ) : (
          <p className="adm-hint" id={hintId}>
            Clear filters to reorder.{' '}
            <button type="button" className="adm-link-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </p>
        )}
        {editable && <p className="adm-hint adm-edit-hint">Click a cell to edit it. Enter saves, Esc cancels.</p>}
        {wide && <ColumnsMenu cols={cols} />}
      </div>

      <div className="adm-list-head" aria-hidden>
        <span />
        <span />
        <span>Video</span>
        {COLUMNS.filter((c) => cols.shown.has(c.key)).map((c) => (
          <span key={c.key} data-col={c.key}>
            {c.key === 'updated' && bin ? 'Deleted' : c.label}
          </span>
        ))}
        <span />
      </div>
      {body}
      <Announcer text={announcement} assertive />
      <Announcer text={saveNote} />
      {(['brand', 'category', 'platform'] as const).map((k) => (
        <datalist key={k} id={lists[k]}>
          {options[k].map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      ))}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this video?"
          body="It goes to the bin, and you can restore it for 30 days."
          confirmLabel="Delete"
          danger
          busy={working}
          onConfirm={() => void remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmPurge && (
        <ConfirmDialog
          title="Delete this video for good?"
          body={`“${confirmPurge.title}” and its poster go for good. This can't be undone.`}
          confirmLabel="Delete forever"
          danger
          busy={working}
          onConfirm={() => void purge(confirmPurge)}
          onCancel={() => setConfirmPurge(null)}
        />
      )}

      <Routes>
        <Route path=":id" element={<DrawerById closeTo={drawerBase} />} />
      </Routes>
    </section>
  );
}

/** /admin/videos/new and /admin/videos/:id. After a create the URL moves to the new id with `drawerKey: 'new'`, so the drawer stays open as it is. */
function DrawerById({ closeTo }: { closeTo: string }) {
  const { id = '' } = useParams();
  const { state } = useLocation();
  const key = (state as { drawerKey?: string } | null)?.drawerKey ?? id;
  return <VideoDrawer key={key} id={id === 'new' ? null : id} closeTo={closeTo} />;
}
