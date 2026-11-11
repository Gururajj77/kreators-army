// (pv) "Thumbnails & previews" on the Videos screen: how many videos lack a thumbnail or a hover preview, "Make missing", progress per video,
// Stop, failures with their reason and Retry, and "Regenerate all" behind a confirm. The queue itself is runner.ts, so closing this panel
// or re-rendering the screen never stops a run.
import type { AdminVideo } from '@kreators/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clapperboard, RotateCcw, Square } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { adminApi, keys, retryOnce } from '../api';
import { ConfirmDialog, Modal } from '../bits';
import { attachQueryClient, canMake, clearFinished, enqueue, needsPreview, needsThumb, retry, stop, useMediaGen, type Job } from './runner';
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

export function MediaGenControl() {
  const qc = useQueryClient();
  useEffect(() => attachQueryClient(qc), [qc]);
  // The same query as the screen's list (same key and options), so it shares its cache and never fetches twice.
  const list = useQuery({ queryKey: keys.videos(false), queryFn: () => adminApi.videos(false), staleTime: 15_000, retry: retryOnce });
  const videos: AdminVideo[] = useMemo(() => list.data?.videos ?? [], [list.data]);
  const jobs = useMediaGen((s) => s.jobs);
  const running = useMediaGen((s) => s.running);
  const [open, setOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [replaceHand, setReplaceHand] = useState(false);
  const titleId = useId();

  const counts = useMemo(
    () => ({
      noThumb: videos.filter(needsThumb).length,
      noPreview: videos.filter(needsPreview).length,
      noStream: videos.filter((v) => !canMake(v)).length,
      todo: videos.filter((v) => needsThumb(v) || needsPreview(v)).length,
    }),
    [videos],
  );
  const done = jobs.filter((j) => j.status === 'done').length;
  const failed = jobs.filter((j) => j.status === 'failed');
  const active = jobs.filter((j) => j.status === 'queued' || j.status === 'running').length;
  const total = jobs.length;
  const current = jobs.find((j) => j.status === 'running');

  const makeMissing = () => enqueue(videos, { mode: 'missing' });

  return (
    <>
      <button type="button" className="btn btn-sm btn-ghost mg-open" onClick={() => setOpen(true)} aria-haspopup="dialog" data-mediagen-open>
        <Clapperboard className="size-4" aria-hidden />
        {running ? (
          <span>
            Previews {done + failed.length} of {total}
          </span>
        ) : (
          <span>Thumbnails &amp; previews</span>
        )}
        {!running && counts.todo > 0 && <span className="mg-badge">{counts.todo}</span>}
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy={titleId} className="adm-sheet mg-sheet">
          <div className="adm-sheet-in mg-panel" data-mediagen>
            <h2 id={titleId} className="adm-sheet-title">
              Thumbnails &amp; previews
            </h2>
            <p className="mg-lede">
              Made here, in this browser, from each video's stream: a thumbnail from its best frame and a 3.6 s silent loop that plays when a visitor hovers over the tile. Keep this tab open and in front while it runs.
            </p>
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
                  <dt>No stream (YouTube only)</dt>
                  <dd>{counts.noStream}</dd>
                </div>
              )}
            </dl>

            <div className="mg-actions">
              {running ? (
                <button type="button" className="btn btn-sm btn-ink" onClick={stop}>
                  <Square className="size-4" aria-hidden /> Stop
                </button>
              ) : (
                <button type="button" className="btn btn-sm btn-accent" onClick={makeMissing} disabled={counts.todo === 0} data-mediagen-make>
                  {counts.todo === 0 ? 'Nothing missing' : `Make missing (${counts.todo})`}
                </button>
              )}
              {!running && failed.length > 0 && (
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
                {running ? `Working on ${current ? `“${current.title}”` : 'the next video'}: ${done} done` : `${done} done`}
                {failed.length ? `, ${failed.length} failed` : ''}
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
            <div className="adm-confirm-actions">
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>
                {running ? 'Hide (it keeps going)' : 'Close'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmAll && (
        <ConfirmDialog
          title="Regenerate every preview?"
          body="Every video with a stream gets a new preview, and a new thumbnail where the last one was made here. This reads each video again, so it takes a while."
          confirmLabel="Regenerate all"
          onCancel={() => setConfirmAll(false)}
          onConfirm={() => {
            setConfirmAll(false);
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
