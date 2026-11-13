// (pv) "Thumbnails & previews" on the Videos screen: how many videos lack a thumbnail or a hover preview, "Make missing", progress per video,
// Pause, failures with their reason and Retry, and "Regenerate all" behind a confirm. The queue itself is runner.ts, so closing this panel
// or re-rendering the screen never stops a run.
// (admin7) The panel now lives in the admin shell (MediaGenPanel), opened from the Videos screen's button (MediaGenControl) or from the header
// chip (MediaGenChip) on any admin screen, which shows a run that started by itself (auto.ts), Pause and Resume, and MEGA's limit.
import type { AdminVideo } from '@kreators/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clapperboard, Eraser, Pause, Play, RefreshCw, RotateCcw } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { adminApi, keys, retryOnce } from '../api';
import { ConfirmDialog, Modal } from '../bits';
import { ClearCacheDialog } from './ClearCache';
import { attachQueryClient, canMake, clearFinished, closePanel, enqueue, needsPreview, needsThumb, openPanel, pause, resume, retry, useMediaGen, type Job } from './runner';
import './mediaGen.css';

const pct = (n: number) => `${Math.round(Math.max(0, Math.min(1, n)) * 100)}%`;

function JobLine({ job }: { job: Job }) {
  const kinds = [job.wantThumb && 'thumbnail', job.wantClip && 'preview'].filter(Boolean).join(' and ');
  let note: string = job.step;
  if (job.status === 'done' && job.result) {
    const bits = [job.result.clipKb !== undefined && `preview ${job.result.clipKb} KB`, job.result.posterMade && 'thumbnail made', job.result.posterKept && 'your thumbnail kept'].filter(Boolean);
    note = `${bits.join(', ') || job.step}${job.result.ms ? ` · ${Math.max(1, Math.round(job.result.ms / 1000))} s` : ''}`;
  }
  return (
    <li
      className="mg-job"
      data-status={job.status}
      data-job={job.id}
      data-kb={job.result?.clipKb}
      data-ms={job.result?.ms}
      data-timing={job.result?.timing ? JSON.stringify(job.result.timing) : undefined}
    >
      <span className="mg-job-title">{job.title}</span>
      <span className="mg-job-note">
        {job.status === 'failed' ? <span className="mg-job-error">{job.error}</span> : job.status === 'queued' ? `Waiting (${kinds})` : note}
      </span>
      {job.status === 'running' && (
        <span className="mg-bar" role="progressbar" aria-label={`${job.title}: ${job.step}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(job.progress * 100)}>
          <span style={{ width: pct(job.progress) }} />
        </span>
      )}
      {(job.status === 'failed' || job.status === 'stopped') && (
        <button type="button" className="adm-link-btn mg-retry" onClick={() => retry([job.id])}>
          Retry
        </button>
      )}
    </li>
  );
}

/** The same query as the Videos screen's list (same key and options), so it shares its cache and never fetches twice. */
function useVideos(): AdminVideo[] {
  const list = useQuery({ queryKey: keys.videos(false), queryFn: () => adminApi.videos(false), staleTime: 15_000, retry: retryOnce });
  return useMemo(() => list.data?.videos ?? [], [list.data]);
}

function useCounts(videos: AdminVideo[]) {
  return useMemo(
    () => ({
      noThumb: videos.filter(needsThumb).length,
      noPreview: videos.filter(needsPreview).length,
      noStream: videos.filter((v) => !canMake(v)).length,
      todo: videos.filter((v) => needsThumb(v) || needsPreview(v)).length,
    }),
    [videos],
  );
}

/** "12 of 88": finished (made or failed) of everything in this run that wasn't stopped. */
function useProgress() {
  const jobs = useMediaGen((s) => s.jobs);
  return useMemo(() => {
    const done = jobs.filter((j) => j.status === 'done').length;
    const failed = jobs.filter((j) => j.status === 'failed').length;
    const queued = jobs.filter((j) => j.status === 'queued' || j.status === 'running').length;
    return { jobs, done, failed, queued, finished: done + failed, total: jobs.filter((j) => j.status !== 'stopped').length };
  }, [jobs]);
}

/** "in 1 hour", "in 42 min", "in a moment", ticking once a minute while it waits. */
function useWaitLeft(until: number): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [until]);
  const min = Math.ceil((until - now) / 60_000);
  return min >= 59 ? 'in 1 hour' : min > 1 ? `in ${min} min` : 'in a moment';
}

export const QUOTA_TEXT = (left: string) => `MEGA's transfer limit was reached — retrying automatically ${left}`;

/** The Videos screen's button: what is missing, or the run's progress; it opens the panel. */
export function MediaGenControl() {
  const qc = useQueryClient();
  useEffect(() => attachQueryClient(qc), [qc]);
  const counts = useCounts(useVideos());
  const running = useMediaGen((s) => s.running);
  const { finished, total } = useProgress();
  return (
    <button type="button" className="btn btn-sm btn-ghost mg-open" onClick={openPanel} aria-haspopup="dialog" data-mediagen-open>
      <Clapperboard className="size-4" aria-hidden />
      {running ? (
        <span>
          Previews {finished} of {total}
        </span>
      ) : (
        <span>Thumbnails &amp; previews</span>
      )}
      {!running && counts.todo > 0 && <span className="mg-badge">{counts.todo}</span>}
    </button>
  );
}

/**
 * The header chip, on every admin screen, while there is something to say: making them (with Pause), paused (with Resume), waiting out MEGA's
 * limit, working in another tab, or some failed. The text opens the full panel.
 */
export function MediaGenChip() {
  const st = useMediaGen();
  const { finished, failed, queued, total } = useProgress();
  const counts = useCounts(useVideos());
  const left = useWaitLeft(st.quotaUntil);
  const [justDone, setJustDone] = useState(false);
  const [wasRunning, setWasRunning] = useState(false);
  if (st.running !== wasRunning) {
    setWasRunning(st.running);
    if (!st.running && !queued && total > 0 && !failed) setJustDone(true);
  }
  useEffect(() => {
    if (!justDone) return;
    const t = setTimeout(() => setJustDone(false), 6000);
    return () => clearTimeout(t);
  }, [justDone]);

  let state: 'quota' | 'elsewhere' | 'running' | 'paused' | 'failed' | 'done' | null = null;
  if (st.quotaUntil > 0 && (queued > 0 || counts.todo > 0)) state = 'quota';
  else if (st.elsewhere) state = 'elsewhere';
  else if (st.running) state = 'running';
  else if (st.paused && (queued > 0 || (st.auto && counts.todo > 0))) state = 'paused';
  else if (failed > 0 && !queued) state = 'failed';
  else if (justDone) state = 'done';
  if (!state) return null;

  const frac = total ? finished / total : 0;
  const text: Record<NonNullable<typeof state>, { long: string; short: string }> = {
    running: { long: `Making thumbnails & previews · ${finished} of ${total}`, short: `Previews ${finished} of ${total}` },
    paused: { long: 'Thumbnails & previews paused', short: 'Previews paused' },
    quota: { long: QUOTA_TEXT(left), short: `MEGA limit · retrying ${left}` },
    elsewhere: { long: 'Making thumbnails & previews in another tab', short: 'Previews: another tab' },
    failed: { long: `${failed} ${failed === 1 ? "preview couldn't" : "previews couldn't"} be made`, short: `${failed} failed` },
    done: { long: 'Thumbnails & previews made', short: 'Previews made' },
  };
  const t = text[state];
  return (
    <div className="mg-chip" data-mediagen-chip data-state={state}>
      <button type="button" className="mg-chip-main" onClick={openPanel} aria-haspopup="dialog" aria-label={`${t.long}. Open Thumbnails & previews`} title={t.long}>
        {state === 'running' ? (
          <svg className="mg-chip-ring" viewBox="0 0 20 20" aria-hidden>
            <circle cx="10" cy="10" r="8" pathLength="100" />
            <circle cx="10" cy="10" r="8" pathLength="100" strokeDasharray={`${Math.max(4, Math.round(frac * 100))} 100`} />
          </svg>
        ) : (
          <span className="mg-chip-dot" aria-hidden />
        )}
        <span className="mg-chip-long">{t.long}</span>
        <span className="mg-chip-short" aria-hidden>
          {t.short}
        </span>
      </button>
      {(state === 'running' || state === 'elsewhere') && (
        <button type="button" className="mg-chip-act" onClick={() => pause()} data-mediagen-pause>
          Pause
        </button>
      )}
      {state === 'paused' && (
        <button type="button" className="mg-chip-act" onClick={() => resume()} data-mediagen-resume>
          Resume
        </button>
      )}
    </div>
  );
}

/** The full panel, rendered once by the admin shell, open from the button or the chip. */
export function MediaGenPanel() {
  const qc = useQueryClient();
  useEffect(() => attachQueryClient(qc), [qc]);
  const videos = useVideos();
  const counts = useCounts(videos);
  const open = useMediaGen((s) => s.panelOpen);
  const running = useMediaGen((s) => s.running);
  const paused = useMediaGen((s) => s.paused);
  const auto = useMediaGen((s) => s.auto);
  const elsewhere = useMediaGen((s) => s.elsewhere);
  const quotaUntil = useMediaGen((s) => s.quotaUntil);
  const left = useWaitLeft(quotaUntil);
  const { jobs, done, failed: failedN, queued: active, total: liveTotal } = useProgress();
  const failed = jobs.filter((j) => j.status === 'failed');
  const [confirmAll, setConfirmAll] = useState(false);
  const [clearCache, setClearCache] = useState(false);
  const [replaceHand, setReplaceHand] = useState(false);
  const titleId = useId();

  const total = jobs.length;
  const current = jobs.find((j) => j.status === 'running');

  const makeMissing = () => {
    if (paused) resume();
    enqueue(videos, { mode: 'missing' });
  };

  return (
    <>
      {open && (
        <Modal onClose={closePanel} labelledBy={titleId} className="adm-sheet mg-sheet">
          <div className="adm-sheet-in mg-panel" data-mediagen>
            <h2 id={titleId} className="adm-sheet-title">
              Thumbnails &amp; previews
            </h2>
            <p className="mg-lede">
              Made here, in this browser, from each video's MEGA file (read straight from MEGA): a thumbnail from its best frame and a 3.6 s silent loop that plays when a visitor hovers over the tile.{' '}
              {auto ? 'It runs by itself while the admin is open on this computer, one video at a time, and only while this tab is in front.' : 'Keep this tab open and in front while it runs.'}
            </p>
            {quotaUntil > 0 && (
              <p className="mg-note" data-tone="amber" role="status" data-mediagen-quota>
                {QUOTA_TEXT(left)}.
              </p>
            )}
            {paused && quotaUntil === 0 && (active > 0 || (auto && counts.todo > 0)) && (
              <p className="mg-note" role="status">
                Paused. It won't start by itself until you press Resume.
              </p>
            )}
            {elsewhere && (
              <p className="mg-note" role="status">
                Another admin tab is making them. This one takes over if that tab closes.
              </p>
            )}
            <dl className="mg-counts">
              <div>
                <dt>Without a thumbnail</dt>
                <dd data-count="thumb">{counts.noThumb}</dd>
              </div>
              <div>
                <dt>Without a preview</dt>
                <dd data-count="preview">{counts.noPreview}</dd>
              </div>
              {counts.noStream > 0 && (
                <div>
                  <dt>No video file (YouTube only)</dt>
                  <dd>{counts.noStream}</dd>
                </div>
              )}
            </dl>

            <div className="mg-actions">
              {running ? (
                <button type="button" className="btn btn-sm btn-ink" onClick={() => pause()} data-mediagen-pause>
                  <Pause className="size-4" aria-hidden /> Pause
                </button>
              ) : paused && (active > 0 || (auto && counts.todo > 0)) ? (
                <button type="button" className="btn btn-sm btn-ink" data-intent="positive" data-fill="" onClick={() => resume()} data-mediagen-resume>
                  <Play className="size-4" aria-hidden /> Resume
                </button>
              ) : (
                <button type="button" className="btn btn-sm btn-ink" data-intent="positive" data-fill="" onClick={makeMissing} disabled={counts.todo === 0 || quotaUntil > 0} data-mediagen-make>
                  <Clapperboard className="size-4" aria-hidden />
                  {counts.todo === 0 ? 'Nothing missing' : `Make missing (${counts.todo})`}
                </button>
              )}
              {!running && failed.length > 0 && quotaUntil === 0 && (
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => retry()}>
                  <RotateCcw className="size-4" aria-hidden /> Retry {failed.length} failed
                </button>
              )}
              {!running && (
                <button type="button" className="adm-link-btn" onClick={() => setConfirmAll(true)}>
                  Regenerate all…
                </button>
              )}
              {!running && total > 0 && active === 0 && (
                <button type="button" className="adm-link-btn" onClick={clearFinished}>
                  Clear the list
                </button>
              )}
            </div>

            {total > 0 && (
              <p className="mg-status" aria-live="polite">
                {running && !elsewhere ? `Working on ${current ? `“${current.title}”` : 'the next video'}: ${done} of ${liveTotal} done` : `${done} done`}
                {failedN ? `, ${failedN} failed` : ''}
                {active ? `, ${active} to go` : ''}.
              </p>
            )}
            {total > 0 && (
              <ol className="mg-jobs" aria-label="Videos in this run">
                {[...jobs]
                  .sort((a, b) => order(a) - order(b))
                  .map((j) => (
                    <JobLine key={j.id} job={j} />
                  ))}
              </ol>
            )}
            <div className="mg-storage" data-mediagen-storage>
              <span>Storage: thumbnails and previews of binned videos, old link checks and sign-ins, old copies of the site in this browser.</span>
              <button type="button" className="adm-link-btn" data-intent="danger" onClick={() => setClearCache(true)} data-clear-cache>
                <Eraser className="size-3.5" aria-hidden />
                Clear unused cache…
              </button>
            </div>
            <div className="adm-confirm-actions">
              <button type="button" className="btn btn-sm btn-ghost" onClick={closePanel}>
                {running ? 'Hide (it keeps going)' : 'Close'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {clearCache && <ClearCacheDialog onClose={() => setClearCache(false)} />}
      {confirmAll && (
        <ConfirmDialog
          title="Regenerate every preview?"
          body="Every video with a MEGA or bundled file gets a new preview, and a new thumbnail where the last one was made here. This reads each video again, so it takes a while."
          confirmLabel="Regenerate all"
          icon={<RefreshCw className="size-4" aria-hidden />}
          onCancel={() => setConfirmAll(false)}
          onConfirm={() => {
            setConfirmAll(false);
            if (paused) resume();
            enqueue(videos, { mode: 'regenerate', replaceHandPosters: replaceHand });
          }}
        >
          <label className="mg-check">
            <input type="checkbox" checked={replaceHand} onChange={(e) => setReplaceHand(e.target.checked)} />
            Also replace the thumbnails you picked or uploaded yourself
          </label>
        </ConfirmDialog>
      )}
    </>
  );
}

/** Running first, then failures (to act on), waiting, stopped, done. */
function order(j: Job): number {
  return { running: 0, failed: 1, queued: 2, stopped: 3, done: 4 }[j.status];
}
