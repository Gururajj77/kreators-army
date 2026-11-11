// (pv) Warms the browser's HTTP cache with stored hover clips (Video.previewUrl), so a hover starts from cache within a frame or two.
// A clip is a few hundred KB, immutable at its address (the server sends max-age one year, immutable), so a plain fetch fills the
// same cache the <video> then reads with its range requests.
//
// Two kinds of warming:
// - 'hover': the pointer entered a tile. Fetched at once (high priority); the hover delay covers most of the download.
// - 'near': a tile is on screen. Only after the visitor has moved a real mouse on the page, two at a time, low priority, and at most
//   NEAR_BUDGET clips per page view, so a library of a hundred videos never downloads a hundred clips.
// Never under Save-Data or Pause animations; never on touch (callers only warm where a preview could play: canAutoplay()).
import { canAutoplay } from './motionOk';

const NEAR_BUDGET = 8;
const NEAR_CONCURRENCY = 2;

const started = new Set<string>();
const queue: string[] = [];
let running = 0;
let budget = NEAR_BUDGET;
let engaged = false;
let listening = false;

function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    engaged = true;
    window.removeEventListener('pointermove', onMove);
    pump();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
}

function fetchClip(url: string, priority: 'high' | 'low'): Promise<void> {
  return fetch(url, { credentials: 'same-origin', priority } as RequestInit & { priority: 'high' | 'low' })
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then(
      () => undefined,
      () => {
        started.delete(url);
      },
    );
}

function pump() {
  if (!engaged) return;
  while (running < NEAR_CONCURRENCY && queue.length) {
    const url = queue.shift()!;
    running++;
    void fetchClip(url, 'low').finally(() => {
      running--;
      pump();
    });
  }
}

/** Starts filling the cache with `url` (once per page view). */
export function warmClip(url: string | null | undefined, why: 'hover' | 'near'): void {
  if (!url || started.has(url) || !canAutoplay()) return;
  if (why === 'hover') {
    const i = queue.indexOf(url);
    if (i >= 0) queue.splice(i, 1);
    started.add(url);
    void fetchClip(url, 'high');
    return;
  }
  if (budget <= 0 || queue.includes(url)) return;
  budget--;
  started.add(url);
  queue.push(url);
  listen();
  pump();
}

/** True once a fetch for `url` has been started (tests and the harness read it through the DOM, not this). */
export const clipWarmed = (url: string) => started.has(url);
