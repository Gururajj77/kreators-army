// (r21) The player's one <video>, shared by every open, so a single press on a tile plays the video with its sound.
//
// Safari (iPhone and Mac) lets a <video> play with sound only after play() was called on that very element inside a tap or click. The player's
// source arrives later (the frame flies first, and a MEGA file is opened asynchronously), well outside the tap. So every press that opens the
// player calls primePlayer() synchronously in its handler: play() on this element, with no source yet, which WebKit counts as the gesture that
// lifts the element's restrictions for good (the empty play() itself rejects or never settles; that is ignored). The player (components/video.tsx
// PlayerMedia) then adopts the same element, sets its source and calls play() again, and the sound is allowed. Chrome and Firefox allow sound once
// the page has been interacted with, so this is what makes Safari behave like them.
//
// With no gesture at all (a deep link such as /video-library?v=<id>) play() with sound is refused; the player then plays muted and offers
// "Tap for sound".

let shared: HTMLVideoElement | null = null;

/** The one <video> the player plays in. Created on first use and kept for the page's life. */
export function playerVideo(): HTMLVideoElement {
  if (!shared) {
    shared = document.createElement('video');
    shared.className = 'player-video';
    shared.playsInline = true;
    shared.setAttribute('playsinline', '');
    shared.preload = 'metadata';
  }
  return shared;
}

/**
 * Call synchronously inside the press (click, Enter or Space, an arrow key) that opens the player or moves it to another video. An element that
 * is idle (no source) or already playing gets play(): idle, it unlocks; playing, it is a no-op that still counts as a gesture. A paused element
 * with a source is left alone: the visitor paused it, so it was already played or pressed by hand, and play() would sound it for a moment.
 */
export function primePlayer(): void {
  if (typeof document === 'undefined') return;
  try {
    const v = playerVideo();
    const idle = !v.getAttribute('src');
    if (!idle && v.paused) return;
    if (idle) v.muted = false;
    const p = v.play();
    if (p) p.catch(() => undefined);
  } catch {
    // An engine with no media support: nothing to unlock.
  }
}

/** Stops the element and lets go of its source (the network request, a blob: URL's memory), so the next open starts clean. */
export function releasePlayerVideo(v: HTMLVideoElement): void {
  try {
    v.pause();
  } catch {
    /* already gone */
  }
  v.removeAttribute('src');
  v.removeAttribute('poster');
  try {
    v.load();
  } catch {
    /* nothing loaded */
  }
  v.muted = false;
  v.remove();
}
