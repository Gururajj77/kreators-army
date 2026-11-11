// (pv) The "Thumbnails & previews" queue. It lives outside React (a zustand store at module level), so it keeps going while the admin
// works on the Videos screen, re-renders, opens the drawer or another admin screen; it stops when the admin tab is closed or reloaded.
// One video at a time: two at once shared the same MEGA stream bandwidth and each took twice as long (measured), so there was nothing to gain.
// (admin7) It also starts by itself (auto.ts) and so it has: Pause (persisted: "paused by the founder" holds until Resume, on any visit), work only
// while the tab is visible (a hidden tab stops presenting frames, so the current video goes back in the queue and starts again on return), MEGA's
// transfer limit (stop, wait an hour, persisted, then go on by itself) and one tab at a time (a Web Lock; a localStorage heartbeat where there is none).
// Every upload goes through the admin API (cookie session, Origin checked); the answers update the list's cache in place.
// (admin10) One video's "Regenerate thumbnail & preview" (the drawer, the row's menu, the bulk bar): regenerateNow() puts it at the front of the
// queue as a `manual` job, which runs even while the run is paused (Pause itself still stops it) and after the video being made now; MEGA's
// transfer limit still holds it back (shown where it was asked for). The answers update the list's cache, so the drawer and the row show the new
// thumbnail and clip without a reload; their addresses carry the sha, so no cache serves the old ones.
// (admin8) A MEGA video is read by this browser from MEGA itself (megaSource.ts), never through the Worker: MEGA's errors arrive here directly
// (transfer limit: wait an hour; busy: retried inside mega.ts with backoff; gone, removed, blocked or a wrong key: this video fails).
import type { AdminPoster, AdminPreview, AdminVideo } from '@kreators/shared';
import type { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { AdminApiError, adminFetch, keys } from '../api';
import { encodePoster } from '../posterEncode';
import { mergeVideo } from '../videoCache';
import { ClipError, clipErrorFromMega, makeMedia, type CaptureMode } from './clip';
import { MegaError } from './mega';
import { BridgeError, openSource, sourceRefusal, type PlayableSource } from './megaSource';

export type JobStatus = 'queued' | 'running' | 'done' | 'failed' | 'stopped';

export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  step: string;
  progress: number;
  wantClip: boolean;
  wantThumb: boolean;
  /** The video as it was queued; the list's newer copy wins when there is one. */
  video: AdminVideo;
  /** "Regenerate": remake what exists too. */
  regenerate: boolean;
  /** Replace a poster set by hand ("Regenerate", with the box ticked). */
  replaceHandPoster: boolean;
  /** (admin10) Asked for this one video by hand: it goes first, and runs while the run is paused. Pause clears it. */
  manual?: boolean;
  /** (admin10) Asked for by hand (kept after a Pause): the row shows its state. */
  asked?: boolean;
  error?: string;
  /** What was made: clip KB and seconds taken, and whether the poster was made or kept. */
  result?: { clipKb?: number; clipMime?: string; posterKept?: boolean; posterMade?: boolean; ms: number; timing?: unknown };
}

interface State {
  jobs: Job[];
  /** The loop is on (working, or waiting for another tab to finish). */
  running: boolean;
  current: string | null;
  /** Paused by the founder: nothing starts until Resume, on this visit or the next (localStorage). */
  paused: boolean;
  /** MEGA's transfer limit was reached: nothing runs before this time (ms since the epoch; 0 = none). Persisted. */
  quotaUntil: number;
  /** Another admin tab holds the lock and does the work; this one waits. */
  elsewhere: boolean;
  /** This browser makes them by itself (auto.ts decided). */
  auto: boolean;
  /** The full panel is open (it lives in the admin shell, so the header chip opens it from any screen). */
  panelOpen: boolean;
}

// ---------- What is kept between visits ----------

const PREF = 'kx-admin-mediagen';
export const QUOTA_WAIT_MS = 60 * 60 * 1000;

interface Prefs {
  paused?: boolean;
  quotaUntil?: number;
  /** Videos that failed for a reason another try in this browser won't fix (HEVC, undecodable, too large, gone from MEGA), by id -> the source it failed on (sourceKey). */
  skip?: Record<string, string>;
}

export function readPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(PREF) ?? '{}') as unknown;
    return raw && typeof raw === 'object' ? (raw as Prefs) : {};
  } catch {
    return {};
  }
}

function writePrefs(p: Partial<Prefs>) {
  try {
    localStorage.setItem(PREF, JSON.stringify({ ...readPrefs(), ...p }));
  } catch {
    /* private mode: it just isn't remembered */
  }
}

const initial = typeof window === 'undefined' ? {} : readPrefs();
export const useMediaGen = create<State>(() => ({
  jobs: [],
  running: false,
  current: null,
  paused: !!initial.paused,
  quotaUntil: (initial.quotaUntil ?? 0) > Date.now() ? (initial.quotaUntil as number) : 0,
  elsewhere: false,
  auto: false,
  panelOpen: false,
}));

export const openPanel = () => useMediaGen.setState({ panelOpen: true });
export const closePanel = () => useMediaGen.setState({ panelOpen: false });

let qc: QueryClient | null = null;
let abort: AbortController | null = null;
let loop: Promise<void> | null = null;
/** Why the running loop was aborted: 'stop' marks what was waiting as stopped; the others leave it queued to go on later. */
let reason: 'stop' | 'pause' | 'hidden' | 'quota' | null = null;
/** start() was asked for while an aborted loop was still winding down. */
let restart = false;
let resumeTimer: ReturnType<typeof setTimeout> | undefined;
let wired = false;
/** For the harness: 'play2' (default), 'play' or 'seek', read from ?capture= on the admin page. */
let captureMode: CaptureMode | undefined;

export function attachQueryClient(client: QueryClient) {
  qc = client;
  wire();
  if (typeof location !== 'undefined') {
    // The harness's measurements (play against seek on one video): ?capture=play|seek on an admin page exposes the queue on window.
    const m = new URLSearchParams(location.search).get('capture');
    if (m === 'play' || m === 'play2' || m === 'seek') {
      captureMode = m;
      (window as unknown as { __mediaGen?: unknown }).__mediaGen = {
        enqueue: (ids: string[], mode: 'missing' | 'regenerate', capture?: CaptureMode) => {
          if (capture) captureMode = capture;
          const all = qc?.getQueryData<{ videos: AdminVideo[] }>(keys.videos(false))?.videos ?? [];
          return enqueue(all.filter((v) => ids.includes(v.id)), { mode });
        },
        state: () => useMediaGen.getState(),
      };
    }
  }
}

/** A video that can be worked on at all: a MEGA file (read by this browser) or a bundled file, not in the bin. */
export const canMake = (v: AdminVideo) => (!!v.mega || !!v.streamUrl) && !v.deletedAt;

/** Which file a video's media come from: changes when its MEGA link (or bundled file) changes, so a new file is made again. */
export const sourceKey = (v: AdminVideo): string => (v.mega ? `mega:${v.mega.tag ?? v.mega.url ?? v.mega.handle}` : (v.streamUrl ?? ''));
export const needsPreview = (v: AdminVideo) => canMake(v) && !v.preview;
export const needsThumb = (v: AdminVideo) => canMake(v) && !v.poster;

function latest(id: string): AdminVideo | null {
  const list = qc?.getQueryData<{ videos: AdminVideo[] }>(keys.videos(false));
  return list?.videos.find((v) => v.id === id) ?? null;
}

const patch = (id: string, p: Partial<Job>) => useMediaGen.setState((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...p } : j)) }));

/**
 * Adds videos to the queue. `mode: 'missing'` asks only for what is missing; 'regenerate' remakes every clip and every automatic
 * poster (and hand-set ones too with `replaceHandPosters`). A video already waiting or running is not added twice.
 */
export function enqueue(videos: AdminVideo[], { mode = 'missing', replaceHandPosters = false }: { mode?: 'missing' | 'regenerate'; replaceHandPosters?: boolean } = {}): number {
  const state = useMediaGen.getState();
  const busy = new Set(state.jobs.filter((j) => j.status === 'queued' || j.status === 'running').map((j) => j.id));
  const add: Job[] = [];
  for (const v of videos) {
    if (!canMake(v) || busy.has(v.id)) continue;
    const wantClip = mode === 'regenerate' || needsPreview(v);
    const wantThumb = mode === 'regenerate' ? !v.poster || !!v.poster.auto || replaceHandPosters : needsThumb(v);
    if (!wantClip && !wantThumb) continue;
    add.push({ id: v.id, video: v, title: v.title || 'Untitled video', status: 'queued', step: 'Waiting', progress: 0, wantClip, wantThumb, regenerate: mode === 'regenerate', replaceHandPoster: mode === 'regenerate' && replaceHandPosters });
  }
  if (!add.length) return 0;
  const ids = new Set(add.map((j) => j.id));
  useMediaGen.setState((s) => ({ jobs: [...s.jobs.filter((j) => !ids.has(j.id)), ...add] }));
  start();
  return add.length;
}

/**
 * (admin10) "Regenerate thumbnail & preview" for these videos, now: each goes to the front of the queue (in the order given) as a manual job,
 * replacing a finished, failed or waiting job for it. A video being made right now is left to finish (it is making them already). The poster is
 * remade where it was made here or is missing, and a hand-set one only with `replaceHandPoster`. Answers how many were queued.
 */
export function regenerateNow(videos: AdminVideo[], { replaceHandPoster = false }: { replaceHandPoster?: boolean } = {}): number {
  const running = new Set(useMediaGen.getState().jobs.filter((j) => j.status === 'running').map((j) => j.id));
  const add: Job[] = [];
  for (const v of videos) {
    if (!canMake(v) || running.has(v.id)) continue;
    add.push({
      id: v.id,
      video: v,
      title: v.title || 'Untitled video',
      status: 'queued',
      step: 'Waiting',
      progress: 0,
      wantClip: true,
      wantThumb: !v.poster || !!v.poster.auto || replaceHandPoster,
      regenerate: true,
      replaceHandPoster,
      manual: true,
      asked: true,
    });
  }
  if (!add.length) return 0;
  const ids = new Set(add.map((j) => j.id));
  useMediaGen.setState((s) => ({ jobs: [...add, ...s.jobs.filter((j) => !ids.has(j.id))] }));
  start();
  return add.length;
}

/** A poster the admin set by hand (picked or uploaded, or a v1 address): "Regenerate" asks before replacing it. */
export const handPoster = (v: AdminVideo) => !!v.poster && !v.poster.auto;

/** The next job: a manual one first; while paused, only a manual one. */
function nextJob(): Job | undefined {
  const s = useMediaGen.getState();
  const queued = s.jobs.filter((j) => j.status === 'queued');
  return queued.find((j) => j.manual) ?? (s.paused ? undefined : queued[0]);
}

export function stop() {
  if (loop) reason = 'stop';
  abort?.abort();
  useMediaGen.setState((s) => ({ jobs: s.jobs.map((j) => (j.status === 'queued' ? { ...j, status: 'stopped', step: 'Stopped' } : j)) }));
}

/** Pause: the video being made goes back in the queue; nothing starts again, here or on the next visit, until resume(). */
export function pause(persist = true) {
  useMediaGen.setState((s) => ({ paused: true, jobs: s.jobs.map((j) => (j.manual && (j.status === 'queued' || j.status === 'running') ? { ...j, manual: false } : j)) }));
  if (persist) writePrefs({ paused: true });
  if (loop) {
    reason = 'pause';
    abort?.abort();
  }
}

/** Resume after a pause (or the founder asked for a run by hand): go on with the queue; auto.ts adds what is missing. */
export function resume(persist = true) {
  useMediaGen.setState({ paused: false });
  if (persist) writePrefs({ paused: false });
  for (const fn of onResume) fn();
  start();
}

/** auto.ts listens here to fill the queue again on Resume and when the hour's wait is over. */
const onResume = new Set<() => void>();
export function whenResumed(fn: () => void): () => void {
  onResume.add(fn);
  return () => onResume.delete(fn);
}

/** Videos auto.ts must not queue again: failed this visit, or failed before for a reason that another try won't fix. */
export function autoSkips(): (v: AdminVideo) => boolean {
  const failed = new Set(useMediaGen.getState().jobs.filter((j) => j.status === 'failed').map((j) => j.id));
  const skip = readPrefs().skip ?? {};
  return (v) => failed.has(v.id) || (!!skip[v.id] && skip[v.id] === sourceKey(v));
}

export function retry(ids?: string[]) {
  if (useMediaGen.getState().paused) resume();
  useMediaGen.setState((s) => ({
    jobs: s.jobs.map((j) => ((ids ? ids.includes(j.id) : j.status === 'failed' || j.status === 'stopped') && j.status !== 'running' && j.status !== 'done' ? { ...j, status: 'queued', step: 'Waiting', progress: 0, error: undefined } : j)),
  }));
  start();
}

export function clearFinished() {
  useMediaGen.setState((s) => ({ jobs: s.jobs.filter((j) => j.status === 'queued' || j.status === 'running') }));
}

function start() {
  if (loop) {
    if (abort?.signal.aborted) restart = true;
    return;
  }
  const s = useMediaGen.getState();
  if (s.quotaUntil > Date.now() || !nextJob()) return;
  // A hidden tab waits; the visibility listener starts it when the admin comes back.
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
  abort = new AbortController();
  reason = null;
  const signal = abort.signal;
  useMediaGen.setState({ running: true });
  loop = (async () => {
    let release: (() => void) | null = null;
    try {
      for (;;) {
        if (signal.aborted) break;
        const job = nextJob();
        if (!job) break;
        if (!release) {
          const got = await takeLock(signal);
          if (!got) break;
          release = got.release;
          // Another tab worked meanwhile: read the list again so nothing it made is made twice.
          if (got.waited && qc) await qc.refetchQueries({ queryKey: keys.videos(false) }).catch(() => undefined);
          continue;
        }
        await runJob(job, signal);
      }
    } finally {
      release?.();
      loop = null;
      abort = null;
      const keep = reason !== null && reason !== 'stop';
      useMediaGen.setState((st) => ({
        running: false,
        current: null,
        elsewhere: false,
        jobs: st.jobs.map((j) => (j.status === 'running' ? { ...j, ...(keep ? { status: 'queued' as const, step: 'Waiting', progress: 0 } : { status: 'stopped' as const, step: 'Stopped' }) } : j)),
      }));
      if (restart) {
        restart = false;
        start();
      }
    }
  })();
}

// ---------- One tab at a time ----------

const LOCK = 'kx-admin-mediagen';
const HEARTBEAT = 'kx-admin-mediagen-tab';
const TAB = Math.random().toString(36).slice(2);

/** The lock, or null when the run was aborted while waiting for it. `waited`: another tab had it first. */
async function takeLock(signal: AbortSignal): Promise<{ release: () => void; waited: boolean } | null> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    const now = await new Promise<boolean>((resolve) => {
      navigator.locks
        .request(LOCK, { ifAvailable: true }, async (lock) => {
          resolve(!!lock);
          if (lock) await held;
        })
        .catch(() => resolve(false));
    });
    if (now) return { release, waited: false };
    useMediaGen.setState({ elsewhere: true });
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.locks
          .request(LOCK, { signal }, async () => {
            resolve();
            await held;
          })
          .catch(reject);
      });
      return { release, waited: true };
    } catch {
      return null;
    } finally {
      useMediaGen.setState({ elsewhere: false });
    }
  }
  // No Web Locks: a heartbeat in localStorage that goes stale 15 s after its tab stops writing it.
  const owner = (): string | null => {
    try {
      const v = JSON.parse(localStorage.getItem(HEARTBEAT) ?? 'null') as { tab?: string; at?: number } | null;
      return v?.tab && Date.now() - (v.at ?? 0) < 15_000 ? v.tab : null;
    } catch {
      return null;
    }
  };
  let waited = false;
  for (let o = owner(); o && o !== TAB; o = owner()) {
    waited = true;
    useMediaGen.setState({ elsewhere: true });
    await new Promise((r) => setTimeout(r, 5000));
    if (signal.aborted) {
      useMediaGen.setState({ elsewhere: false });
      return null;
    }
  }
  useMediaGen.setState({ elsewhere: false });
  const beat = () => {
    try {
      localStorage.setItem(HEARTBEAT, JSON.stringify({ tab: TAB, at: Date.now() }));
    } catch {
      /* nothing to share it with */
    }
  };
  beat();
  const t = setInterval(beat, 5000);
  return {
    waited,
    release: () => {
      clearInterval(t);
      try {
        if (owner() === TAB) localStorage.removeItem(HEARTBEAT);
      } catch {
        /* ignore */
      }
    },
  };
}

// ---------- MEGA's transfer limit ----------

function coolDown() {
  const until = Date.now() + QUOTA_WAIT_MS;
  useMediaGen.setState({ quotaUntil: until });
  writePrefs({ quotaUntil: until });
  if (loop) {
    reason = 'quota';
    abort?.abort();
  }
  scheduleResume();
}

/** When the wait is over, go on by itself (and at once if the tab was asleep past it). */
function scheduleResume() {
  clearTimeout(resumeTimer);
  const until = useMediaGen.getState().quotaUntil;
  if (!until) return;
  const ms = until - Date.now();
  if (ms <= 0) {
    useMediaGen.setState({ quotaUntil: 0 });
    writePrefs({ quotaUntil: 0 });
    for (const fn of onResume) fn();
    start();
    return;
  }
  resumeTimer = setTimeout(scheduleResume, Math.min(ms, 2 ** 31 - 1));
}

/** Once per page: visibility, other tabs' Pause/Resume and limit, and a wait left over from the last visit. */
function wire() {
  if (wired || typeof window === 'undefined') return;
  wired = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (loop) {
        reason = 'hidden';
        abort?.abort();
      }
    } else {
      scheduleResume();
      start();
    }
  });
  window.addEventListener('storage', (e) => {
    if (e.key !== PREF) return;
    const p = readPrefs();
    const st = useMediaGen.getState();
    if (!!p.paused !== st.paused) {
      if (p.paused) pause(false);
      else resume(false);
    }
    const q = (p.quotaUntil ?? 0) > Date.now() ? (p.quotaUntil as number) : 0;
    if (q !== st.quotaUntil) {
      useMediaGen.setState({ quotaUntil: q });
      if (q && loop) {
        reason = 'quota';
        abort?.abort();
      }
      if (q) scheduleResume();
      else {
        // The other tab's wait ended: go on here too (the lock lets only one of them work).
        clearTimeout(resumeTimer);
        for (const fn of onResume) fn();
        start();
      }
    }
  });
  scheduleResume();
}

/** A tab in the background stops presenting frames: wait until the admin comes back. */
function visible(signal: AbortSignal): Promise<void> {
  if (document.visibilityState === 'visible') return Promise.resolve();
  return new Promise((resolve) => {
    const on = () => {
      if (document.visibilityState === 'visible' || signal.aborted) {
        document.removeEventListener('visibilitychange', on);
        signal.removeEventListener('abort', on);
        resolve();
      }
    };
    document.addEventListener('visibilitychange', on);
    signal.addEventListener('abort', on);
  });
}

function message(e: unknown): string {
  if (e instanceof ClipError || e instanceof AdminApiError || e instanceof BridgeError) return e.message;
  if (e instanceof Error) return e.message || 'It failed.';
  return 'It failed.';
}

async function runJob(job: Job, signal: AbortSignal) {
  const t0 = performance.now();
  useMediaGen.setState({ current: job.id });
  patch(job.id, { status: 'running', step: 'Starting', progress: 0.01 });
  const v = latest(job.id) ?? job.video;
  if (!v || !canMake(v)) {
    patch(job.id, { status: 'failed', step: 'Failed', error: v?.deletedAt ? 'It is in the bin.' : 'It has no video to work from.' });
    return;
  }
  // Something made meanwhile (another tab, the drawer) is not made again.
  const wantClip = job.wantClip && (job.regenerate || needsPreview(v));
  const wantThumb = job.wantThumb && (job.regenerate ? job.replaceHandPoster || !v.poster || !!v.poster.auto : needsThumb(v));
  if (!wantClip && !wantThumb) {
    patch(job.id, { status: 'done', step: 'Already made', progress: 1, result: { ms: 0 } });
    return;
  }
  let source: PlayableSource | null = null;
  try {
    await visible(signal);
    let url = v.streamUrl;
    if (v.mega) {
      patch(job.id, { step: 'Opening the MEGA file', progress: 0.02 });
      source = await openSource({ video: v.id }, { signal, allowBlob: true, onProgress: (done, total) => patch(job.id, { step: 'Downloading from MEGA', progress: 0.02 + (0.1 * done) / Math.max(1, total) }) });
      url = source.url;
    }
    if (!url) throw new ClipError('It has no video to work from.', 'no-stream');
    const made = await makeMedia(url, {
      signal,
      wantClip,
      wantThumb,
      mode: captureMode,
      codecHint: v.mega?.meta?.codec ?? null,
      why: source ? source.why : undefined,
      onStep: (step, progress) => patch(job.id, { step, progress }),
    });
    source?.release();
    source = null;
    let latestVideo: AdminVideo = v;
    const result: NonNullable<Job['result']> = { ms: 0 };
    if (made.clip) {
      patch(job.id, { step: 'Uploading the preview', progress: 0.9 });
      const c = made.clip;
      const r = await adminFetch<{ preview: AdminPreview; video: AdminVideo }>(`/videos/${encodeURIComponent(v.id)}/preview`, {
        method: 'PUT',
        body: c.blob,
        headers: { 'Content-Type': c.mime, 'X-Preview-Width': String(c.width), 'X-Preview-Height': String(c.height), 'X-Preview-Duration-Ms': String(c.durationMs), 'X-Preview-Start-Ms': String(c.startMs) },
        signal,
      });
      latestVideo = r.video;
      // Kept at once: if the poster step is interrupted (Pause, a hidden tab), the next try doesn't make this clip again.
      if (qc) mergeVideo(qc, latestVideo);
      result.clipKb = Math.round(c.blob.size / 1024);
      result.clipMime = c.mime;
      result.timing = c.timing;
    }
    if (made.thumb) {
      patch(job.id, { step: 'Uploading the thumbnail', progress: 0.95 });
      const p = await encodePoster(made.thumb.canvas, made.thumb.width, made.thumb.height, made.thumb.timeMs);
      URL.revokeObjectURL(p.url);
      const q = job.replaceHandPoster ? '?replace=1' : '';
      const r = await adminFetch<{ kept: boolean; poster: AdminPoster | null; video: AdminVideo }>(`/videos/${encodeURIComponent(v.id)}/auto-poster${q}`, {
        method: 'PUT',
        body: p.blob,
        headers: { 'Content-Type': p.blob.type || 'image/webp', 'X-Poster-Width': String(p.width), 'X-Poster-Height': String(p.height), 'X-Poster-Time-Ms': String(p.timeMs ?? 0) },
        signal,
      });
      latestVideo = r.video;
      result.posterKept = r.kept;
      result.posterMade = !r.kept;
    }
    if (qc) mergeVideo(qc, latestVideo);
    result.ms = Math.round(performance.now() - t0);
    patch(job.id, { status: 'done', step: 'Done', progress: 1, result });
  } catch (caught) {
    source?.release();
    // MEGA's own errors (from opening the file) in the runner's terms; the API refusing a source (no usable key) fails this video.
    let e: unknown = caught instanceof MegaError ? clipErrorFromMega(caught) : caught;
    const refused = sourceRefusal(caught);
    if (refused) e = new ClipError(refused, 'gone');
    if (signal.aborted || (e instanceof ClipError && e.code === 'stopped') || (e instanceof DOMException && e.name === 'AbortError')) {
      // Paused, hidden or the limit: it goes back in the queue. Stop: it stays stopped.
      patch(job.id, reason && reason !== 'stop' ? { status: 'queued', step: 'Waiting', progress: 0 } : { status: 'stopped', step: 'Stopped', progress: 0 });
      return;
    }
    if (overQuota(e, source)) {
      patch(job.id, { status: 'queued', step: 'Waiting', progress: 0 });
      coolDown();
      return;
    }
    if (e instanceof ClipError && (e.code === 'hevc' || e.code === 'decode' || e.code === 'too-large' || e.code === 'gone')) {
      const skip = readPrefs().skip ?? {};
      skip[v.id] = sourceKey(v);
      const ids = Object.keys(skip);
      for (const id of ids.slice(0, Math.max(0, ids.length - 300))) delete skip[id];
      writePrefs({ skip });
    }
    patch(job.id, { status: 'failed', step: 'Failed', error: message(e) });
  }
}

/** MEGA's transfer limit: said by MEGA when the file was opened, or a video that stopped loading whose source last heard it from MEGA. */
function overQuota(e: unknown, source: PlayableSource | null): boolean {
  if (e instanceof ClipError && e.code === 'quota') return true;
  if (e instanceof AdminApiError) return e.status === 509;
  if (e instanceof ClipError && (e.code === 'load' || e.code === 'timeout')) return source?.why()?.kind === 'over-quota';
  return false;
}
