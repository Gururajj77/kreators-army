// (admin10) "Regenerate thumbnail & preview" for one video (the drawer, the row's "…" menu) or the selected rows (the bulk bar's "More").
// It goes to the front of the runner's queue (runner.ts regenerateNow), runs even while the run is paused, and waits out MEGA's transfer limit.
// A thumbnail the founder picked or uploaded is only replaced after asking: replace it, or keep it and remake the preview alone.
// The drawer and the row show the job's state (waiting, making, done, failed with its reason and Retry); the answers update the list's cache,
// so the new thumbnail and clip show at once (their addresses carry the sha, so no cache serves the old ones).
import type { AdminVideo } from '@kreators/shared';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { keys } from '../api';
import { Modal } from '../bits';
import { toast } from '../Toasts';
import { attachQueryClient, canMake, handPoster, regenerateNow, useMediaGen, type Job } from './runner';
import './mediaGen.css';

export const REGEN_LABEL = 'Regenerate thumbnail & preview';

/** This video's job in the runner, if any. */
export function useMediaJob(id: string | null | undefined): Job | undefined {
  return useMediaGen((s) => (id ? s.jobs.find((j) => j.id === id) : undefined));
}

/** "Regenerate" for some videos: asks first when any has a hand-set thumbnail. `dialog` goes in the caller's tree. */
export function useRegenerate(): { request: (videos: AdminVideo[]) => void; dialog: ReactNode } {
  const qc = useQueryClient();
  useEffect(() => attachQueryClient(qc), [qc]);
  const [ask, setAsk] = useState<AdminVideo[] | null>(null);

  const go = (videos: AdminVideo[], replaceHandPoster: boolean) => {
    const n = regenerateNow(videos, { replaceHandPoster });
    const st = useMediaGen.getState();
    if (!n) {
      toast(videos.length === 1 ? 'It is being made right now.' : 'Those are being made right now.');
      return;
    }
    const what = n === 1 ? `Remaking the thumbnail and preview for “${videos.find(canMake)?.title || 'this video'}”` : `Remaking ${n} thumbnails and previews`;
    const when = st.quotaUntil > Date.now() ? ': it starts when MEGA’s transfer limit lifts' : st.running && st.current && !videos.some((v) => v.id === st.current) ? ': first in line, after the one being made now' : '';
    toast(`${what}${when}.`);
  };

  const request = (videos: AdminVideo[]) => {
    const can = videos.filter(canMake);
    if (!can.length) {
      toast(videos.length === 1 ? 'This video has no MEGA or bundled file to make them from.' : 'None of these has a MEGA or bundled file to make them from.', { tone: 'error' });
      return;
    }
    if (can.some(handPoster)) setAsk(can);
    else go(can, false);
  };

  const dialog = ask ? (
    <HandPosterAsk
      videos={ask}
      onCancel={() => setAsk(null)}
      onChoose={(replace) => {
        const list = ask;
        setAsk(null);
        go(list, replace);
      }}
    />
  ) : null;
  return { request, dialog };
}

function HandPosterAsk({ videos, onCancel, onChoose }: { videos: AdminVideo[]; onCancel: () => void; onChoose: (replace: boolean) => void }) {
  const id = useId();
  const hand = videos.filter(handPoster).length;
  const one = videos.length === 1;
  return (
    <Modal onClose={onCancel} labelledBy={id} className="adm-confirm">
      <div className="adm-confirm-in" data-regen-ask>
        <h2 id={id} className="adm-confirm-title">
          {one || hand === 1 ? 'Replace the thumbnail you picked?' : `Replace ${hand} thumbnails you picked?`}
        </h2>
        <div className="adm-confirm-body">
          {one
            ? `“${videos[0]!.title || 'This video'}” has a thumbnail you picked or uploaded yourself. A new preview is made either way.`
            : `${hand} of these ${videos.length} have a thumbnail you picked or uploaded yourself. Every one gets a new preview either way.`}
        </div>
        <div className="adm-confirm-actions mg-ask-actions">
          <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChoose(false)} data-regen-keep autoFocus>
            {one || hand === 1 ? 'Keep mine, remake the preview' : 'Keep mine, remake previews'}
          </button>
          <button type="button" className="btn btn-sm btn-ink" onClick={() => onChoose(true)} data-regen-replace>
            Replace {one || hand === 1 ? 'it' : 'them'} too
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** "in 42 min" for MEGA's wait. */
function waitLeft(until: number): string {
  const min = Math.ceil((until - Date.now()) / 60_000);
  return min >= 59 ? 'in about an hour' : min > 1 ? `in ${min} min` : 'in a moment';
}

/** What the job is doing, in words, and a tone for the chip. */
function describe(job: Job, st: { paused: boolean; quotaUntil: number; elsewhere: boolean; current: string | null }): { text: string; tone: 'busy' | 'ok' | 'err' | 'wait' } {
  if (job.status === 'running') return { text: `${job.step}…`, tone: 'busy' };
  if (job.status === 'done') {
    const r = job.result;
    const bits = [r?.clipKb !== undefined && 'new preview', r?.posterMade && 'new thumbnail', r?.posterKept && 'your thumbnail kept'].filter(Boolean);
    return { text: bits.length ? `Done: ${bits.join(', ')}` : 'Done', tone: 'ok' };
  }
  if (job.status === 'failed') return { text: job.error || 'It failed.', tone: 'err' };
  if (job.status === 'stopped') return { text: 'Stopped', tone: 'wait' };
  if (st.quotaUntil > Date.now()) return { text: `Waiting: MEGA’s transfer limit, retrying ${waitLeft(st.quotaUntil)}`, tone: 'wait' };
  if (st.elsewhere) return { text: 'Waiting: another admin tab is making them', tone: 'wait' };
  if (st.paused && !job.manual) return { text: 'Waiting: paused', tone: 'wait' };
  if (st.current && st.current !== job.id) return { text: 'Waiting: first in line', tone: 'wait' };
  return { text: 'Waiting', tone: 'wait' };
}

/** The job's state for a row: only for a video asked for by hand (the background run shows in its own panel), and "done" for a few seconds. */
export function RegenBadge({ video }: { video: AdminVideo }) {
  const job = useMediaJob(video.id);
  const st = useMediaGen();
  const [hideDone, setHideDone] = useState(false);
  const status = job?.status;
  useEffect(() => {
    setHideDone(false);
    if (status !== 'done') return;
    const t = setTimeout(() => setHideDone(true), 8000);
    return () => clearTimeout(t);
  }, [status]);
  if (!job || !job.asked || (status === 'done' && hideDone)) return null;
  const d = describe(job, st);
  return (
    <span className="mg-regen-badge" data-tone={d.tone} data-regen-status={job.status} title={d.text}>
      {job.status === 'running' && <span className="mg-regen-spin" aria-hidden />}
      <span className="mg-regen-text">{job.status === 'running' ? `Remaking · ${Math.round(job.progress * 100)}%` : d.text}</span>
      {job.status === 'failed' && (
        <button type="button" className="adm-link-btn" onClick={() => regenerateNow([job.video], { replaceHandPoster: job.replaceHandPoster })}>
          Retry
        </button>
      )}
    </span>
  );
}

/**
 * The drawer's section: the stored thumbnail and hover clip, the button and the job's state. `onMade` hands the drawer the video as the
 * runner left it, so its own copy (and the poster above) show the new ones without a reload.
 */
export function RegenSection({ video, onMade, request }: { video: AdminVideo; onMade: (v: AdminVideo) => void; request: (videos: AdminVideo[]) => void }) {
  const qc = useQueryClient();
  const job = useMediaJob(video.id);
  const st = useMediaGen();
  const status = job?.status;
  const was = useRef(status);
  useEffect(() => {
    if (status === 'done' && was.current !== 'done') {
      const fresh = qc.getQueryData<AdminVideo>(keys.video(video.id));
      if (fresh) onMade(fresh);
    }
    was.current = status;
  }, [status, qc, video.id, onMade]);

  const can = canMake(video);
  const busy = status === 'queued' || status === 'running';
  const d = job ? describe(job, st) : null;
  const clip = video.preview?.url ?? null;
  const thumb = video.poster?.url ?? null;

  return (
    <div className="mg-regen" data-regen>
      <p className="adm-section-label">Thumbnail &amp; hover preview</p>
      <div className="mg-regen-media" data-shape={video.aspect}>
        <figure>
          {thumb ? <img src={thumb} alt="" /> : <span className="mg-regen-none">None yet</span>}
          <figcaption>Thumbnail{video.poster ? (video.poster.auto ? ' · made here' : ' · picked by you') : ''}</figcaption>
        </figure>
        <figure>
          {clip ? <video key={clip} src={clip} muted loop autoPlay playsInline preload="metadata" aria-label="Hover preview" /> : <span className="mg-regen-none">None yet</span>}
          <figcaption>Hover preview{video.preview?.size ? ` · ${Math.round(video.preview.size / 1024)} KB` : ''}</figcaption>
        </figure>
      </div>
      <div className="mg-regen-row">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => request([video])} disabled={!can || busy} data-regen-btn>
          <RefreshCw className="size-4" aria-hidden /> {REGEN_LABEL}
        </button>
        {!can && <span className="adm-help">{video.deletedAt ? 'Restore it first.' : 'It needs a MEGA or bundled file.'}</span>}
      </div>
      {job && d && (
        <div className="mg-regen-state" data-tone={d.tone} data-regen-status={job.status} role="status" aria-live="polite">
          <span>{d.text}</span>
          {job.status === 'running' && (
            <span className="mg-bar" role="progressbar" aria-label={job.step} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(job.progress * 100)}>
              <span style={{ width: `${Math.round(Math.max(0, Math.min(1, job.progress)) * 100)}%` }} />
            </span>
          )}
          {(job.status === 'failed' || job.status === 'stopped') && (
            <button type="button" className="adm-link-btn" onClick={() => regenerateNow([video], { replaceHandPoster: job.replaceHandPoster })} data-regen-retry>
              Retry
            </button>
          )}
          {status === 'queued' && st.paused && !job.manual && (
            <button type="button" className="adm-link-btn" onClick={() => regenerateNow([video], { replaceHandPoster: job.replaceHandPoster })}>
              Make it now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
