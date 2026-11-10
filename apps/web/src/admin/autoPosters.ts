// Owner: A4 Admin. "Make posters from the first second" (admin brief 5.5): in the browser, one video at a time with a single hidden
// <video preload="metadata">: seek to 1.0 s, capture, run the poster encoder, upload with V9. Rows that already have a poster are skipped. At 720p each
// costs about the moov plus one 4 MiB range. Drafts stream for the admin through their own streamUrl (same-origin, so the canvas is clean).
import type { AdminVideo } from '@kreators/shared';
import { adminApi } from './api';
import { captureFrame, seekTo } from './posterEncode';

export interface PosterRun {
  made: number;
  skipped: number;
  failed: { id: string; title: string; message: string }[];
  stopped: boolean;
}

export async function makePosters(
  videos: AdminVideo[],
  { onProgress, onMade, signal }: { onProgress: (done: number, total: number) => void; onMade?: (v: AdminVideo) => void; signal: AbortSignal },
): Promise<PosterRun> {
  const run: PosterRun = { made: 0, skipped: 0, failed: [], stopped: false };
  const todo = videos.filter((v) => !v.poster?.stored && v.streamUrl);
  run.skipped = videos.length - todo.length;
  const total = todo.length;
  onProgress(0, total);
  if (!total) return run;

  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:4px;height:4px;overflow:hidden;opacity:0;pointer-events:none';
  const el = document.createElement('video');
  el.muted = true;
  el.playsInline = true;
  el.preload = 'metadata';
  el.crossOrigin = null;
  holder.appendChild(el);
  document.body.appendChild(holder);

  try {
    let done = 0;
    for (const v of todo) {
      if (signal.aborted) {
        run.stopped = true;
        break;
      }
      try {
        el.src = v.streamUrl!;
        el.load();
        await seekTo(el, 1.0, 45000);
        if (signal.aborted) {
          run.stopped = true;
          break;
        }
        const p = await captureFrame(el);
        try {
          const r = await adminApi.uploadPoster(v.id, p.blob, { width: p.width, height: p.height, timeMs: p.timeMs });
          run.made++;
          onMade?.(r.video);
        } finally {
          URL.revokeObjectURL(p.url);
        }
      } catch (e) {
        run.failed.push({ id: v.id, title: v.title, message: e instanceof Error ? e.message : 'failed' });
      } finally {
        el.pause();
        el.removeAttribute('src');
        el.load();
      }
      done++;
      onProgress(done, total);
    }
  } finally {
    holder.remove();
  }
  return run;
}
