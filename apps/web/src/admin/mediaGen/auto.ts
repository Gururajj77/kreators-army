// (admin7) Thumbnails and hover previews made by themselves. On an unlocked admin in a desktop browser that can encode video (WebCodecs, a
// fine pointer, no Save-Data, not a phone or a tablet), about 3 s after the admin opens, every video still missing a thumbnail or a preview goes
// into the runner's queue (runner.ts: one at a time, only while the tab is visible, Pause, MEGA's limit, one tab). Videos added later join it
// when the list changes. Never a hand-set poster: 'missing' only asks for a poster where there is none, and the server keeps one set by hand.
// An automated browser (navigator.webdriver: the harness) is left alone unless the page has ?auto=1, so the existing flows still drive it by hand.
import type { AdminVideoList } from '@kreators/shared';
import type { QueryClient } from '@tanstack/react-query';
import { adminApi, keys, retryOnce } from '../api';
import { chooseCodec } from './clip';
import { attachQueryClient, autoSkips, enqueue, needsPreview, needsThumb, useMediaGen, whenResumed } from './runner';

const DELAY_MS = 3000;

type Nav = Navigator & { connection?: { saveData?: boolean }; userAgentData?: { mobile?: boolean } };

/** Can this browser make them by itself without hurting anyone: a desktop with a video encoder, not on a metered connection. */
export async function autoCapable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const force = new URLSearchParams(location.search).get('auto');
  if (force === '0') return false;
  const nav = navigator as Nav;
  if (nav.webdriver && force !== '1') return false;
  if (!('VideoEncoder' in window) || !('VideoFrame' in window)) return false;
  if (nav.connection?.saveData) return false;
  if (nav.userAgentData?.mobile) return false;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent)) return false;
  // iPadOS says "Macintosh": a Mac has no touch points.
  if (/Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1) return false;
  if (!matchMedia('(pointer: fine)').matches) return false;
  try {
    return !!(await chooseCodec());
  } catch {
    return false;
  }
}

/** Queues what is missing, unless paused, waiting out MEGA's limit, or the video failed for good in this browser. */
function fill(qc: QueryClient) {
  const st = useMediaGen.getState();
  if (!st.auto || st.paused || st.quotaUntil > Date.now()) return;
  const list = qc.getQueryData<AdminVideoList>(keys.videos(false))?.videos;
  if (!list) return;
  const skip = autoSkips();
  enqueue(list.filter((v) => (needsThumb(v) || needsPreview(v)) && !skip(v)), { mode: 'missing' });
}

/** Starts it for this admin session; the returned function undoes it (lock, or the shell unmounting). */
export function startAuto(qc: QueryClient): () => void {
  attachQueryClient(qc);
  let gone = false;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let unsubscribe: (() => void) | undefined;
  let offResume: (() => void) | undefined;
  const timer = setTimeout(async () => {
    if (gone || !(await autoCapable()) || gone) return;
    useMediaGen.setState({ auto: true });
    try {
      // The same query, key and options as the Videos screen, so it shares its cache.
      await qc.fetchQuery({ queryKey: keys.videos(false), queryFn: () => adminApi.videos(false), staleTime: 15_000, retry: retryOnce });
    } catch {
      /* the list will come; the cache subscription below picks it up */
    }
    if (gone) return;
    fill(qc);
    // A video added or changed later (New video, an import, a new MEGA link) joins the queue when the list updates.
    const key = JSON.stringify(keys.videos(false));
    unsubscribe = qc.getQueryCache().subscribe((e) => {
      if (e.type !== 'updated' || JSON.stringify(e.query.queryKey) !== key) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => fill(qc), 1500);
    });
    offResume = whenResumed(() => fill(qc));
  }, DELAY_MS);
  return () => {
    gone = true;
    clearTimeout(timer);
    clearTimeout(debounce);
    unsubscribe?.();
    offResume?.();
    useMediaGen.setState({ auto: false });
  };
}
