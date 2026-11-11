// (pv) The "Thumbnails & previews" queue. It lives outside React (a zustand store at module level), so it keeps going while the admin
// works on the Videos screen, re-renders, opens the drawer or another admin screen; it stops when the admin tab is closed or reloaded.
// One video at a time: two at once shared the same MEGA stream bandwidth and each took twice as long (measured), so there was nothing to gain.
// Every upload goes through the admin API (cookie session, Origin checked); the answers update the list's cache in place.
import type { AdminPoster, AdminPreview, AdminVideo } from '@kreators/shared';
import type { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { AdminApiError, adminFetch, keys } from '../api';
import { encodePoster } from '../posterEncode';
import { mergeVideo } from '../videoCache';
import { ClipError, makeMedia, type CaptureMode } from './clip';

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
  error?: string;
  /** What was made: clip KB and seconds taken, and whether the poster was made or kept. */
  result?: { clipKb?: number; clipMime?: string; posterKept?: boolean; posterMade?: boolean; ms: number; timing?: unknown };
}

interface State {
  jobs: Job[];
  running: boolean;
  current: string | null;
}

export const useMediaGen = create<State>(() => ({ jobs: [], running: false, current: null }));

let qc: QueryClient | null = null;
let abort: AbortController | null = null;
let loop: Promise<void> | null = null;
/** For the harness: 'play2' (default), 'play' or 'seek', read from ?capture= on the admin page. */
let captureMode: CaptureMode | undefined;

export function attachQueryClient(client: QueryClient) {
  qc = client;
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

/** A video that can be worked on at all: it streams from this site. */
export const canMake = (v: AdminVideo) => !!v.streamUrl && !v.deletedAt;
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

export function stop() {
  abort?.abort();
  useMediaGen.setState((s) => ({ jobs: s.jobs.map((j) => (j.status === 'queued' ? { ...j, status: 'stopped', step: 'Stopped' } : j)) }));
}

export function retry(ids?: string[]) {
  useMediaGen.setState((s) => ({
    jobs: s.jobs.map((j) => ((ids ? ids.includes(j.id) : j.status === 'failed' || j.status === 'stopped') && j.status !== 'running' && j.status !== 'done' ? { ...j, status: 'queued', step: 'Waiting', progress: 0, error: undefined } : j)),
  }));
  start();
}

export function clearFinished() {
  useMediaGen.setState((s) => ({ jobs: s.jobs.filter((j) => j.status === 'queued' || j.status === 'running') }));
}

function start() {
  if (loop) return;
  abort = new AbortController();
  const signal = abort.signal;
  useMediaGen.setState({ running: true });
  loop = (async () => {
    try {
      for (;;) {
        if (signal.aborted) break;
        const job = useMediaGen.getState().jobs.find((j) => j.status === 'queued');
        if (!job) break;
        await runJob(job, signal);
      }
    } finally {
      loop = null;
      abort = null;
      useMediaGen.setState((s) => ({ running: false, current: null, jobs: s.jobs.map((j) => (j.status === 'running' ? { ...j, status: 'stopped', step: 'Stopped' } : j)) }));
    }
  })();
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
  if (e instanceof ClipError || e instanceof AdminApiError) return e.message;
  if (e instanceof Error) return e.message || 'It failed.';
  return 'It failed.';
}

async function runJob(job: Job, signal: AbortSignal) {
  const t0 = performance.now();
  useMediaGen.setState({ current: job.id });
  patch(job.id, { status: 'running', step: 'Starting', progress: 0.01 });
  const v = latest(job.id) ?? job.video;
  if (!v || !v.streamUrl || v.deletedAt) {
    patch(job.id, { status: 'failed', step: 'Failed', error: v?.deletedAt ? 'It is in the bin.' : 'It has no stream to work from.' });
    return;
  }
  // Something made meanwhile (another tab, the drawer) is not made again.
  const wantClip = job.wantClip && (job.regenerate || needsPreview(v));
  const wantThumb = job.wantThumb && (job.regenerate ? job.replaceHandPoster || !v.poster || !!v.poster.auto : needsThumb(v));
  if (!wantClip && !wantThumb) {
    patch(job.id, { status: 'done', step: 'Already made', progress: 1, result: { ms: 0 } });
    return;
  }
  try {
    await visible(signal);
    const made = await makeMedia(v.streamUrl, {
      signal,
      wantClip,
      wantThumb,
      mode: captureMode,
      codecHint: v.mega?.meta?.codec ?? null,
      onStep: (step, progress) => patch(job.id, { step, progress }),
    });
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
  } catch (e) {
    if (signal.aborted || (e instanceof ClipError && e.code === 'stopped') || (e instanceof DOMException && e.name === 'AbortError')) {
      patch(job.id, { status: 'stopped', step: 'Stopped', progress: 0 });
      return;
    }
    patch(job.id, { status: 'failed', step: 'Failed', error: message(e) });
  }
}
