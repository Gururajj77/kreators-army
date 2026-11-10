// Owner: A4 Admin. The add and edit drawer (admin brief 5.4, V2-SPEC 4.2 and 4.3): a native <dialog> sliding in from the right (960 px; full screen under
// 900 px; a fade under data-still). Left: the preview (an unsaved link streams through its handle address (MegaInspect.previewUrl) for the admin, a saved one through its
// streamUrl), the poster frame and "How the tile looks". Right: Stream, Details, Posted on, Visibility. Footer: Delete, Cancel, Save and Save and publish
// (published: Hide from the site and Save). A dirty guard on close, a 409 stale with Load latest / Overwrite, and a session sheet that keeps the values.
import {
  formatViews,
  parseInstagram,
  parseViews,
  parseYouTube,
  type AdminVideo,
  type AdminVideoList,
  type MegaInspect,
  type SaveWarning,
  type Video,
  type VideoAspect,
  type VideoProblem,
  type VideoWrite,
} from '@kreators/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { VideoFrame } from '../components/frames';
import { Segment } from '../components/tabs';
import { Seo } from '../components/ui';
import { motionOk } from '../lib/motionOk';
import { AdminApiError, adminApi, keys } from './api';
import { ConfirmDialog, Modal, Switch, type CloseReason } from './bits';
import { MegaField, type MegaCheck } from './MegaField';
import { PosterPicker } from './PosterPicker';
import { posterNote, type EncodedPoster } from './posterEncode';
import { toast } from './Toasts';
import { deleteWithUndo, mergeVideo } from './videoCache';
import { PROBLEM_WORDS } from './VideoRow';

interface Form {
  title: string;
  brand: string;
  category: string;
  platform: string;
  aspect: VideoAspect;
  views: string;
  uploadDate: string;
  featured: boolean;
  published: boolean;
  mega: string;
  instagram: string;
  youtube: string;
}

type Field = keyof Form;
type SaveKind = 'save' | 'publish' | 'hide';

const toForm = (v: AdminVideo | null): Form => ({
  title: v?.title ?? '',
  brand: v?.brand ?? '',
  category: v?.category ?? '',
  platform: v?.platform ?? '',
  aspect: v?.aspect ?? 'vertical',
  views: v ? String(v.views) : '',
  uploadDate: v?.uploadDate ?? '',
  featured: v?.featured ?? false,
  published: v?.published ?? false,
  mega: v?.mega?.url ?? '',
  instagram: v?.instagramUrl ?? '',
  youtube: v?.youtubeUrl ?? '',
});

const sameForm = (a: Form, b: Form) => (Object.keys(a) as Field[]).every((k) => a[k] === b[k]);

/** The drawer's route element: loads the video (or starts a new one) and mounts the form once it is known. */
export function VideoDrawer({ id, closeTo }: { id: string | null; closeTo: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fromList = () => {
    for (const bin of [false, true]) {
      const hit = qc.getQueryData<AdminVideoList>(keys.videos(bin))?.videos.find((v) => v.id === id);
      if (hit) return hit;
    }
    return undefined;
  };
  const q = useQuery({
    queryKey: keys.video(id ?? 'new'),
    queryFn: () => adminApi.video(id!),
    enabled: !!id,
    initialData: id ? fromList : undefined,
    staleTime: 0,
    retry: false,
  });

  if (id && q.isPending) {
    return (
      <Modal onClose={() => navigate(closeTo)} label="Loading the video" className="adm-drawer">
        <div className="adm-drawer-in adm-drawer-loading" aria-busy="true">
          <span className="skeleton adm-skel-line" />
          <span className="skeleton adm-skel-block" />
        </div>
      </Modal>
    );
  }
  if (id && (q.isError || !q.data)) {
    return (
      <Modal onClose={() => navigate(closeTo)} label="Video not found" className="adm-confirm">
        <div className="adm-confirm-in">
          <h2 className="adm-confirm-title">{q.error instanceof AdminApiError && q.error.status === 404 ? 'This video is gone.' : "This video didn't load."}</h2>
          <div className="adm-confirm-actions">
            <button type="button" className="btn btn-sm btn-ink" onClick={() => navigate(closeTo)} autoFocus>
              Back to the list
            </button>
          </div>
        </div>
      </Modal>
    );
  }
  return <DrawerForm video={id ? q.data ?? null : null} closeTo={closeTo} />;
}

/** The label of a save button rolls to "Saved" (or "Published") with a check that pops (visual §1.4). */
function SaveLabel({ label, done, doneLabel }: { label: string; done: boolean; doneLabel: string }) {
  return (
    <span className="adm-save-roll" data-done={done ? '' : undefined}>
      <span>{label}</span>
      <span aria-hidden>
        <Check className="adm-save-check size-4" /> {doneLabel}
      </span>
    </span>
  );
}

function DrawerForm({ video, closeTo }: { video: AdminVideo | null; closeTo: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const uid = useId();
  const titleId = `${uid}-title`;
  const [base, setBase] = useState<AdminVideo | null>(video);
  const [initial, setInitial] = useState<Form>(() => toForm(video));
  const [form, setForm] = useState<Form>(() => toForm(video));
  const [errors, setErrors] = useState<Partial<Record<Field, ReactNode>>>({});
  const [notes, setNotes] = useState<Partial<Record<Field, string>>>({});
  const [check, setCheck] = useState<MegaCheck>(() => (video?.mega ? { kind: 'saved' } : { kind: 'empty' }));
  const [titleFromFile, setTitleFromFile] = useState(false);
  const [aspectTouched, setAspectTouched] = useState(!!video);
  const [pending, setPending] = useState<EncodedPoster | null>(null);
  const [posterBusy, setPosterBusy] = useState(false);
  const [posterNoteText, setPosterNoteText] = useState<string | null>(null);
  const [saving, setSaving] = useState<SaveKind | null>(null);
  const [done, setDone] = useState<SaveKind | null>(null);
  const [warnings, setWarnings] = useState<SaveWarning[]>([]);
  const [serverBlocked, setServerBlocked] = useState<VideoProblem[] | null>(null);
  const [stale, setStale] = useState<AdminVideo | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [megaBusy, setMegaBusy] = useState<'adopt' | 'recheck' | null>(null);
  const [closing, setClosing] = useState(false);
  const lastWrite = useRef<{ kind: SaveKind; write: VideoWrite } | null>(null);
  const leaving = useRef(false);
  const preview = useRef<HTMLVideoElement>(null);
  const doneTimer = useRef(0);

  const list = qc.getQueryData<AdminVideoList>(keys.videos(false));
  const options = useMemo(() => {
    const pick = (f: (v: AdminVideo) => string | null) => [...new Set((list?.videos ?? []).map(f).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b));
    return { brands: pick((v) => v.brand), categories: pick((v) => v.category), platforms: pick((v) => v.platform) };
  }, [list]);

  const dirty = !sameForm(form, initial) || !!pending;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const set = <K extends Field>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
    setServerBlocked(null);
  };

  useEffect(() => () => window.clearTimeout(doneTimer.current), []);
  useEffect(
    () => () => {
      if (pending) URL.revokeObjectURL(pending.url);
    },
    [pending],
  );

  // ---------- Closing: the dirty guard, and the slide out ----------

  const leave = useCallback(() => {
    leaving.current = true;
    if (!motionOk()) {
      navigate(closeTo);
      return;
    }
    setClosing(true);
    window.setTimeout(() => navigate(closeTo), 170);
  }, [closeTo, navigate]);

  const askClose = (_reason?: CloseReason) => {
    if (saving || deleting) return;
    if (dirtyRef.current) setConfirmClose(true);
    else leave();
  };

  // Leaving by the browser's back button (or anything else) with unsaved changes asks too.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !leaving.current && dirtyRef.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state === 'blocked') setConfirmClose(true);
  }, [blocker.state]);

  // ---------- MEGA ----------

  const inspect: MegaInspect | null = check.kind === 'done' ? check.inspect : null;
  const megaChanged = form.mega.trim() !== initial.mega.trim();

  const formRef = useRef(form);
  formRef.current = form;
  const aspectTouchedRef = useRef(aspectTouched);
  aspectTouchedRef.current = aspectTouched;

  const onCheck = useCallback((c: MegaCheck) => {
    setCheck(c);
    setErrors((e) => (e.mega ? { ...e, mega: undefined } : e));
    if (c.kind !== 'done' || !c.inspect.ok) return;
    const ins = c.inspect;
    // The title fills from the file name when it is empty; the shape follows the file until the founder changes it.
    if (!formRef.current.title.trim() && ins.suggestedTitle) {
      setForm((f) => ({ ...f, title: ins.suggestedTitle }));
      setTitleFromFile(true);
    }
    const shape = ins.suggestedAspect;
    if (shape && !aspectTouchedRef.current) {
      setForm((f) => (f.aspect === shape ? f : { ...f, aspect: shape }));
      setNotes((n) => ({ ...n, aspect: `Set to ${shape} from the file` }));
    }
  }, []);

  const replaceBase = (v: AdminVideo, keepForm = true) => {
    setBase(v);
    mergeVideo(qc, v);
    if (!keepForm) {
      const f = toForm(v);
      setInitial(f);
      setForm(f);
    }
  };

  const adopt = async () => {
    setMegaBusy('adopt');
    try {
      await adminApi.adoptSecret();
      await qc.invalidateQueries({ queryKey: keys.videos(false) });
      if (base) {
        const fresh = await adminApi.video(base.id);
        setBase(fresh);
        mergeVideo(qc, fresh);
        const f = toForm(fresh);
        setInitial((i) => ({ ...i, mega: f.mega }));
        setForm((cur) => ({ ...cur, mega: f.mega }));
        setCheck({ kind: 'saved' });
      }
      toast('Moved into the library. You can delete the old secret now.');
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setMegaBusy(null);
    }
  };

  const recheck = async () => {
    if (!base) return;
    setMegaBusy('recheck');
    try {
      const r = await adminApi.megaCheck(base.id);
      setBase(r.video);
      mergeVideo(qc, r.video);
      setCheck({ kind: 'saved' });
      toast(r.inspect.ok ? 'Checked. MEGA has the file.' : r.inspect.message, { tone: r.inspect.ok ? 'info' : 'error' });
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setMegaBusy(null);
    }
  };

  const openDuplicate = async (id: string, inBin: boolean) => {
    if (dirtyRef.current) {
      setConfirmClose(true);
      return;
    }
    if (inBin) {
      try {
        const back = await adminApi.restoreVideo(id);
        mergeVideo(qc, back);
        await qc.invalidateQueries({ queryKey: keys.videos(false) });
        toast(`Restored “${back.title}” as a draft.`);
      } catch (e) {
        if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
        return;
      }
    }
    leaving.current = true;
    navigate(`/admin/videos/${encodeURIComponent(id)}`);
  };

  // ---------- Posters ----------

  const savedPosterUrl = base?.poster?.url ?? null;
  const posterUrl = pending?.url ?? savedPosterUrl;

  const onPicked = async (p: EncodedPoster) => {
    if (!base) {
      // A new video: the poster waits in memory and uploads straight after create.
      setPending((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return p;
      });
      setPosterNoteText(`${posterNote(p)} · uploads when you save`);
      return;
    }
    setPosterBusy(true);
    try {
      const r = await adminApi.uploadPoster(base.id, p.blob, { width: p.width, height: p.height, timeMs: p.timeMs });
      // The upload bumps updated_at: take the new row as the base so the next save is not refused as stale.
      setBase(r.video);
      mergeVideo(qc, r.video);
      setPosterNoteText(posterNote(p));
      toast('Poster saved');
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      URL.revokeObjectURL(p.url);
      setPosterBusy(false);
    }
  };

  const removePoster = async () => {
    if (!base) return;
    setPosterBusy(true);
    try {
      await adminApi.removePoster(base.id);
      const fresh = await adminApi.video(base.id);
      setBase(fresh);
      mergeVideo(qc, fresh);
      setPosterNoteText(null);
      toast('Poster removed');
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setPosterBusy(false);
    }
  };

  // ---------- Links and views, cleaned on blur ----------

  const cleanSocial = (k: 'instagram' | 'youtube') => {
    const v = form[k].trim();
    if (!v) {
      setNotes((n) => ({ ...n, [k]: undefined }));
      return;
    }
    const r = k === 'instagram' ? parseInstagram(v) : parseYouTube(v);
    if (r.ok) {
      if (r.url !== v) {
        set(k, r.url);
        setNotes((n) => ({ ...n, [k]: 'Cleaned up the link' }));
      }
      setErrors((e) => ({ ...e, [k]: undefined }));
    } else setErrors((e) => ({ ...e, [k]: k === 'instagram' ? "That isn't an Instagram link." : "That isn't a YouTube link." }));
  };

  const viewsValue = parseViews(form.views);
  const checkViews = () => {
    if (viewsValue === undefined) setErrors((e) => ({ ...e, views: 'Write the views as a number, like 60000, 60K or 1.2M.' }));
  };

  // ---------- What blocks publishing, in plain words ----------

  const checking = check.kind === 'checking';
  const blockers: string[] = [];
  if (!form.title.trim()) blockers.push('Add a title to publish');
  if (!form.brand.trim()) blockers.push('Add a brand to publish');
  const hasMega = !!form.mega.trim();
  const otherStream = !!(base?.fileRef || base?.waveRef) || !!form.youtube.trim();
  if (!hasMega && !otherStream && !(base?.mega && !megaChanged)) blockers.push('Add a MEGA link to publish');
  if (checking) blockers.push('Wait for the MEGA check');
  if (megaChanged && hasMega) {
    if (check.kind === 'problem' || check.kind === 'error' || (inspect && !inspect.ok && !['busy', 'over-quota', 'upstream'].includes(inspect.problem))) blockers.push('Fix the MEGA link to publish');
  } else if (base?.mega && !megaChanged) {
    if (base.problems.includes('mega-unreachable')) blockers.push('The MEGA link no longer works');
  }
  if (serverBlocked) for (const p of serverBlocked) if (PROBLEM_WORDS[p]) blockers.push(`${PROBLEM_WORDS[p]} to publish`);
  const uniqueBlockers = [...new Set(blockers)];
  const megaUnsettled = megaChanged && hasMega && (checking || check.kind === 'problem' || (inspect && !inspect.ok && !['busy', 'over-quota', 'upstream'].includes(inspect.problem)));

  // ---------- Saving ----------

  const buildWrite = (kind: SaveKind): VideoWrite | null => {
    const errs: Partial<Record<Field, ReactNode>> = {};
    const title = form.title.trim();
    if (!title) errs.title = 'Add a title.';
    if (viewsValue === undefined) errs.views = 'Write the views as a number, like 60000, 60K or 1.2M.';
    if (form.uploadDate && form.uploadDate > new Date().toISOString().slice(0, 10)) errs.uploadDate = 'The upload date cannot be in the future.';
    for (const k of ['instagram', 'youtube'] as const) {
      const v = form[k].trim();
      if (v && !(k === 'instagram' ? parseInstagram(v) : parseYouTube(v)).ok) errs[k] = k === 'instagram' ? "That isn't an Instagram link." : "That isn't a YouTube link.";
    }
    if (Object.keys(errs).length) {
      setErrors((e) => ({ ...e, ...errs }));
      return null;
    }
    const published = kind === 'publish' ? true : kind === 'hide' ? false : form.published;
    const full: VideoWrite = {
      title,
      brand: form.brand.trim(),
      category: form.category.trim() || null,
      platform: form.platform.trim() || null,
      aspect: form.aspect,
      views: viewsValue ?? 0,
      uploadDate: form.uploadDate || null,
      featured: form.featured,
      published,
    };
    if (!base) {
      return {
        ...full,
        ...(form.mega.trim() ? { mega: form.mega.trim() } : {}),
        ...(form.instagram.trim() ? { instagram: form.instagram.trim() } : {}),
        ...(form.youtube.trim() ? { youtube: form.youtube.trim() } : {}),
      };
    }
    const w: VideoWrite = { expectUpdatedAt: base.updatedAt };
    if (title !== initial.title) w.title = title;
    if (full.brand !== initial.brand.trim()) w.brand = full.brand;
    if ((full.category ?? '') !== initial.category.trim()) w.category = full.category;
    if ((full.platform ?? '') !== initial.platform.trim()) w.platform = full.platform;
    if (form.aspect !== initial.aspect) w.aspect = form.aspect;
    if (String(full.views) !== initial.views) w.views = full.views;
    if (form.uploadDate !== initial.uploadDate) w.uploadDate = form.uploadDate || null;
    if (form.featured !== initial.featured) w.featured = form.featured;
    if (published !== base.published) w.published = published;
    if (megaChanged) w.mega = form.mega.trim() || null;
    if (form.instagram.trim() !== initial.instagram.trim()) w.instagram = form.instagram.trim() || null;
    if (form.youtube.trim() !== initial.youtube.trim()) w.youtube = form.youtube.trim() || null;
    return w;
  };

  const send = async (kind: SaveKind, write: VideoWrite) => {
    setSaving(kind);
    setServerBlocked(null);
    lastWrite.current = { kind, write };
    try {
      const r = base ? await adminApi.updateVideo(base.id, write) : await adminApi.createVideo(write);
      let saved = r.video;
      const isNew = !base;
      if (isNew && pending) {
        try {
          const up = await adminApi.uploadPoster(saved.id, pending.blob, { width: pending.width, height: pending.height, timeMs: pending.timeMs });
          saved = up.video;
          setPosterNoteText(posterNote(pending));
        } catch (e) {
          toast(e instanceof AdminApiError ? `Saved, but the poster didn't upload: ${e.message}` : "Saved, but the poster didn't upload.", { tone: 'error' });
        }
        setPending(null);
      }
      setBase(saved);
      mergeVideo(qc, saved);
      const f = toForm(saved);
      setInitial(f);
      setForm(f);
      setCheck(saved.mega ? { kind: 'saved' } : { kind: 'empty' });
      setWarnings(r.warnings.filter((w) => !['no-header-info'].includes(w.code)));
      setErrors({});
      setDone(kind);
      window.clearTimeout(doneTimer.current);
      doneTimer.current = window.setTimeout(() => setDone(null), 1800);
      toast(kind === 'publish' ? 'Published' : kind === 'hide' ? 'Hidden from the site' : 'Saved');
      if (isNew) {
        leaving.current = true;
        navigate(`/admin/videos/${encodeURIComponent(saved.id)}${window.location.search}`, { replace: true, state: { drawerKey: 'new' } });
        // The drawer stays open on the new address; from here the dirty guard applies again.
        window.setTimeout(() => {
          leaving.current = false;
        }, 0);
      }
    } catch (e) {
      if (!(e instanceof AdminApiError)) throw e;
      const field = e.body.field as Field | undefined;
      if (e.code === 'stale') setStale(e.body.video ?? null);
      else if (e.code === 'duplicate') {
        setErrors((x) => ({
          ...x,
          mega: (
            <>
              {e.message}.{' '}
              {e.body.existingId && (
                <button type="button" className="adm-link-btn" onClick={() => void openDuplicate(e.body.existingId!, !!e.body.inBin)}>
                  {e.body.inBin ? 'Restore it' : 'Open it'}
                </button>
              )}
            </>
          ),
        }));
      } else if (e.code === 'mega-unusable') setErrors((x) => ({ ...x, mega: e.message }));
      else if (e.code === 'cannot-publish') setServerBlocked(e.body.problems ?? []);
      else if (e.code === 'bad-request' && field && field in form) setErrors((x) => ({ ...x, [field]: e.message }));
      else if (e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const save = (kind: SaveKind) => {
    if (saving) return;
    const w = buildWrite(kind);
    if (w) void send(kind, w);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save('save');
  };

  // ---------- What the preview plays ----------

  const previewSrc = megaChanged ? (inspect?.ok ? inspect.previewUrl : null) : (base?.streamUrl ?? null);
  const tile: Video = {
    id: base?.id ?? 'new',
    title: form.title || 'Untitled video',
    brand: form.brand || 'Brand',
    category: form.category || null,
    platform: form.platform || null,
    aspect: form.aspect,
    views: viewsValue ?? 0,
    uploadDate: form.uploadDate || null,
    featured: form.featured,
    streamUrl: null,
    fallbackUrl: null,
    embedUrl: null,
    posterUrl,
    previewOk: false,
    durationMs: null,
    links: { instagram: parseInstagram(form.instagram).ok ? form.instagram : null, youtube: parseYouTube(form.youtube).ok ? form.youtube : null },
    source: 'file',
    ref: '',
  };

  const isPublished = !!base?.published;
  const publishBlocked = uniqueBlockers.length > 0;
  const fieldErr = (k: Field) =>
    errors[k] ? (
      <p className="adm-error" id={`${uid}-${k}-err`} role="alert">
        {errors[k]}
      </p>
    ) : null;
  const described = (k: Field, help?: string) => [errors[k] ? `${uid}-${k}-err` : '', help ?? ''].filter(Boolean).join(' ') || undefined;

  return (
    <Modal onClose={askClose} labelledBy={titleId} className="adm-drawer" backdropCloses>
      <Seo title={`${base ? 'Edit video' : 'New video'} · Library admin`} description="Library admin" noindex />
      <form className="adm-drawer-in" data-closing={closing ? '' : undefined} onSubmit={onSubmit} noValidate>
        <header className="adm-drawer-head">
          <h2 id={titleId} className="adm-drawer-title">
            {base ? 'Edit video' : 'New video'}
          </h2>
          {base && <span className="adm-drawer-sub">{base.published ? 'Published' : base.deletedAt ? 'In the bin' : 'Draft'}</span>}
          <button type="button" className="adm-icon-btn adm-drawer-x" aria-label="Close" onClick={() => askClose('button')}>
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="adm-drawer-body">
          <div className="adm-drawer-media">
            <p className="adm-section-label">Preview</p>
            <div className="adm-preview" data-shape={form.aspect}>
              {previewSrc ? (
                // #t=0.001 makes the browser paint the first frame instead of a black box (a fragment: the address the server sees is unchanged).
                <video ref={preview} key={previewSrc} className="adm-preview-video" controls playsInline preload="metadata" src={posterUrl ? previewSrc : `${previewSrc}#t=0.001`} poster={posterUrl ?? undefined} />
              ) : (
                <div className="adm-preview-empty">
                  {posterUrl ? <img src={posterUrl} alt="" /> : <p>The preview shows here once the MEGA link checks out.</p>}
                </div>
              )}
            </div>
            <PosterPicker
              video={preview}
              canPick={!!previewSrc}
              hasPoster={!!posterUrl}
              storedPoster={!!base?.poster?.stored && !pending}
              note={posterNoteText}
              busy={posterBusy}
              onPicked={onPicked}
              onRemove={() => void removePoster()}
            />
            <p className="adm-section-label">How the tile looks</p>
            <div className="adm-tile-preview" style={{ width: form.aspect === 'landscape' ? 240 : 150 }}>
              <VideoFrame video={tile} variant="card" still width={form.aspect === 'landscape' ? 240 : 150} />
            </div>
          </div>

          <div className="adm-drawer-fields">
            <fieldset className="adm-group">
              <legend className="adm-group-title">Stream</legend>
              <MegaField
                id={`${uid}-mega`}
                value={form.mega}
                onChange={(v) => set('mega', v)}
                savedUrl={initial.mega || null}
                saved={base?.mega ?? null}
                videoId={base?.id ?? null}
                hasFile={!!base?.fileRef}
                check={check}
                onCheck={onCheck}
                serverError={errors.mega}
                onUseTitle={(t) => {
                  set('title', t);
                  setTitleFromFile(true);
                }}
                onAdopt={() => void adopt()}
                onRecheck={() => void recheck()}
                busy={megaBusy}
                onOpenDuplicate={(id, inBin) => void openDuplicate(id, inBin)}
              />
            </fieldset>

            <fieldset className="adm-group">
              <legend className="adm-group-title">Details</legend>
              <div className="adm-field">
                <label className="adm-label" htmlFor={`${uid}-t`}>
                  Title
                </label>
                <input
                  id={`${uid}-t`}
                  name="title"
                  className="field"
                  value={form.title}
                  maxLength={140}
                  onChange={(e) => {
                    set('title', e.target.value);
                    setTitleFromFile(false);
                  }}
                  aria-invalid={!!errors.title || undefined}
                  aria-describedby={described('title', titleFromFile ? `${uid}-t-note` : undefined)}
                />
                {titleFromFile && (
                  <p className="adm-help" id={`${uid}-t-note`}>
                    From the file name
                  </p>
                )}
                {fieldErr('title')}
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`${uid}-b`}>
                    Brand
                  </label>
                  <input id={`${uid}-b`} name="brand" className="field" list={`${uid}-brands`} value={form.brand} maxLength={60} onChange={(e) => set('brand', e.target.value)} aria-describedby={described('brand')} />
                  <datalist id={`${uid}-brands`}>
                    {options.brands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  {fieldErr('brand')}
                </div>
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`${uid}-c`}>
                    Category <span className="adm-optional">(optional)</span>
                  </label>
                  <input id={`${uid}-c`} name="category" className="field" list={`${uid}-cats`} value={form.category} maxLength={40} onChange={(e) => set('category', e.target.value)} aria-describedby={described('category')} />
                  <datalist id={`${uid}-cats`}>
                    {options.categories.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  {fieldErr('category')}
                </div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`${uid}-p`}>
                    Platform <span className="adm-optional">(optional)</span>
                  </label>
                  <input id={`${uid}-p`} name="platform" className="field" list={`${uid}-plats`} value={form.platform} maxLength={40} onChange={(e) => set('platform', e.target.value)} aria-describedby={described('platform')} />
                  <datalist id={`${uid}-plats`}>
                    {options.platforms.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  {fieldErr('platform')}
                </div>
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`${uid}-v`}>
                    Views
                  </label>
                  <div className="adm-views-row">
                    <input
                      id={`${uid}-v`}
                      name="views"
                      className="field"
                      inputMode="numeric"
                      value={form.views}
                      placeholder="0"
                      onChange={(e) => set('views', e.target.value)}
                      onBlur={checkViews}
                      aria-invalid={!!errors.views || undefined}
                      aria-describedby={described('views', `${uid}-v-read`)}
                    />
                    <span className="adm-views-read" id={`${uid}-v-read`}>
                      {typeof viewsValue === 'number' && viewsValue > 0 ? formatViews(viewsValue) : ''}
                    </span>
                  </div>
                  {fieldErr('views')}
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor={`${uid}-ud`}>
                  Upload date
                </label>
                <input
                  id={`${uid}-ud`}
                  name="uploadDate"
                  className="field"
                  type="date"
                  min="2000-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.uploadDate}
                  onChange={(e) => set('uploadDate', e.target.value)}
                  aria-invalid={!!errors.uploadDate || undefined}
                  aria-describedby={described('uploadDate')}
                />
                <p className="adm-help">The day this video went up. Optional.</p>
                {fieldErr('uploadDate')}
              </div>
              <div className="adm-field">
                <span className="adm-label" id={`${uid}-shape`}>
                  Shape
                </span>
                <Segment
                  label="Shape"
                  size="sm"
                  className="adm-shape"
                  value={form.aspect}
                  onChange={(v) => {
                    set('aspect', v);
                    setAspectTouched(true);
                    setNotes((n) => ({ ...n, aspect: undefined }));
                  }}
                  options={[
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'landscape', label: 'Landscape' },
                  ]}
                />
                {notes.aspect && <p className="adm-help">{notes.aspect}</p>}
              </div>
            </fieldset>

            <fieldset className="adm-group">
              <legend className="adm-group-title">Posted on</legend>
              {(['instagram', 'youtube'] as const).map((k) => {
                const parsed = form[k].trim() ? (k === 'instagram' ? parseInstagram(form[k]) : parseYouTube(form[k])) : null;
                // Only the canonical address, rebuilt from the parsed id, ever becomes a link.
                const openHref = parsed?.ok ? parsed.url : null;
                return (
                  <div className="adm-field" key={k}>
                    <label className="adm-label" htmlFor={`${uid}-${k}`}>
                      {k === 'instagram' ? 'Instagram link' : 'YouTube link'} <span className="adm-optional">(optional)</span>
                    </label>
                    <div className="adm-link-row">
                      <input
                        id={`${uid}-${k}`}
                        name={k}
                        className="field"
                        inputMode="url"
                        spellCheck={false}
                        autoCapitalize="off"
                        value={form[k]}
                        placeholder={k === 'instagram' ? 'https://www.instagram.com/reel/…' : 'https://www.youtube.com/shorts/…'}
                        onChange={(e) => {
                          set(k, e.target.value);
                          setNotes((n) => ({ ...n, [k]: undefined }));
                        }}
                        onBlur={() => cleanSocial(k)}
                        aria-invalid={!!errors[k] || undefined}
                        aria-describedby={described(k, `${uid}-${k}-help`)}
                      />
                      {openHref && (
                        <a className="adm-open-link" href={openHref} target="_blank" rel="noopener noreferrer">
                          Open <ExternalLink className="size-3.5" aria-hidden />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                    <p className="adm-help" id={`${uid}-${k}-help`}>
                      {notes[k] ?? (k === 'instagram' ? 'Where this video is posted on Instagram.' : 'Where this video is posted on YouTube.')}
                    </p>
                    {fieldErr(k)}
                  </div>
                );
              })}
            </fieldset>

            <fieldset className="adm-group">
              <legend className="adm-group-title">Visibility</legend>
              <div className="adm-switches">
                <Switch checked={form.featured} onChange={(v) => set('featured', v)} label="Featured" visibleLabel="Featured" />
                <Switch checked={form.published} onChange={(v) => set('published', v)} label="Published" visibleLabel="Published" />
              </div>
              {form.published && publishBlocked && !isPublished && <p className="adm-help">Saving keeps it a draft until: {uniqueBlockers.join(', ').toLowerCase()}.</p>}
            </fieldset>

            {warnings.length > 0 && (
              <ul className="adm-save-warnings" aria-label="Notes from the last save">
                {warnings.map((w) => (
                  <li key={w.code + w.message}>{w.message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="adm-drawer-foot">
          {base && (
            <button type="button" className="btn btn-sm btn-ghost adm-danger-text adm-delete-btn" onClick={() => setConfirmDelete(true)} disabled={!!saving}>
              <Trash2 className="size-4" aria-hidden /> Delete
            </button>
          )}
          <div className="adm-foot-actions">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => askClose('button')} disabled={!!saving}>
              Cancel
            </button>
            {isPublished ? (
              <>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => save('hide')} disabled={!!saving} data-hide>
                  <SaveLabel label={saving === 'hide' ? 'Hiding…' : 'Hide from the site'} done={done === 'hide'} doneLabel="Hidden" />
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-accent"
                  data-save
                  disabled={!!saving || !!megaUnsettled || (form.published && publishBlocked)}
                  aria-describedby={publishBlocked ? `${uid}-why` : undefined}
                >
                  <SaveLabel label={saving === 'save' ? 'Saving…' : 'Save'} done={done === 'save'} doneLabel="Saved" />
                </button>
              </>
            ) : (
              <>
                <button type="submit" className="btn btn-sm btn-ghost" disabled={!!saving || !!megaUnsettled} data-save>
                  <SaveLabel label={saving === 'save' ? 'Saving…' : 'Save'} done={done === 'save'} doneLabel="Saved" />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-accent"
                  onClick={() => save('publish')}
                  disabled={!!saving || publishBlocked}
                  aria-describedby={publishBlocked ? `${uid}-why` : undefined}
                  data-publish
                >
                  <SaveLabel label={saving === 'publish' ? 'Publishing…' : 'Save and publish'} done={done === 'publish'} doneLabel="Published" />
                </button>
              </>
            )}
          </div>
          {publishBlocked && (
            <p className="adm-why" id={`${uid}-why`} data-why>
              {uniqueBlockers.join(' · ')}
            </p>
          )}
        </footer>
      </form>

      {confirmClose && (
        <ConfirmDialog
          title="Discard changes?"
          body="Your changes to this video haven't been saved."
          cancelLabel="Keep editing"
          confirmLabel="Discard"
          danger
          onCancel={() => {
            setConfirmClose(false);
            if (blocker.state === 'blocked') blocker.reset();
          }}
          onConfirm={() => {
            setConfirmClose(false);
            leaving.current = true;
            if (blocker.state === 'blocked') blocker.proceed();
            else leave();
          }}
        />
      )}
      {stale && (
        <ConfirmDialog
          title="This video changed in another tab."
          body="Load the latest version, or save yours over it."
          cancelLabel="Load latest"
          confirmLabel="Overwrite"
          onCancel={() => {
            replaceBase(stale, false);
            setCheck(stale.mega ? { kind: 'saved' } : { kind: 'empty' });
            setStale(null);
            toast('Loaded the latest version');
          }}
          onConfirm={() => {
            const last = lastWrite.current;
            setStale(null);
            setBase(stale);
            if (last) {
              const { expectUpdatedAt: _drop, ...rest } = last.write;
              void send(last.kind, rest);
            }
          }}
        />
      )}
      {confirmDelete && base && (
        <ConfirmDialog
          title="Delete this video?"
          body="It goes to the bin, and you can restore it for 30 days."
          confirmLabel="Delete"
          danger
          busy={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            setDeleting(true);
            const ok = await deleteWithUndo(qc, base);
            setDeleting(false);
            setConfirmDelete(false);
            if (ok) {
              leaving.current = true;
              navigate(closeTo);
            }
          }}
        />
      )}
    </Modal>
  );
}
