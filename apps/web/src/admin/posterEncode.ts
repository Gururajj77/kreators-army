// Owner: A4 Admin. The poster encoder (admin brief 5.4): a frame or an uploaded image is drawn to a canvas with its long edge at most 1280 px and saved as
// WebP at 0.82 (JPEG at 0.85 where the browser cannot write WebP). Over 512 KiB the quality steps down to 0.72, then 0.62, then the long edge drops to
// 1080. Uploaded images go through createImageBitmap and the same canvas, which strips their metadata and anything hidden in the file. The stream is
// same-origin, so the canvas is never tainted.

export const POSTER_MAX_BYTES = 512 * 1024;

export interface EncodedPoster {
  blob: Blob;
  width: number;
  height: number;
  /** An object URL for the preview; revoke it when done. */
  url: string;
  /** Where in the video the frame came from, for X-Poster-Time-Ms. */
  timeMs?: number;
}

export class PosterError extends Error {}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob(resolve, type, quality);
    } catch {
      resolve(null);
    }
  });

/** Encodes any drawable (a video at a frame, an ImageBitmap) of the given size. */
export async function encodePoster(source: CanvasImageSource, width: number, height: number, timeMs?: number): Promise<EncodedPoster> {
  if (!width || !height) throw new PosterError("The video hasn't shown a frame yet. Play it for a moment, then try again.");
  const steps: [edge: number, quality: number][] = [
    [1280, 0.82],
    [1280, 0.72],
    [1280, 0.62],
    [1080, 0.62],
  ];
  let webp = true;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new PosterError("This browser can't make posters.");
  let last: Blob | null = null;
  for (const [edge, q] of steps) {
    const scale = Math.min(1, edge / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.drawImage(source, 0, 0, w, h);
    let blob = webp ? await toBlob(canvas, 'image/webp', q) : null;
    if (!blob || blob.type !== 'image/webp') {
      // Safari writes PNG when asked for WebP; it gets JPEG instead, 0.85 to start.
      webp = false;
      blob = await toBlob(canvas, 'image/jpeg', q === 0.82 ? 0.85 : q);
    }
    if (!blob) throw new PosterError("This browser can't make posters.");
    last = blob;
    if (blob.size <= POSTER_MAX_BYTES) return { blob, width: w, height: h, url: URL.createObjectURL(blob), timeMs };
  }
  throw new PosterError(`That image is still ${Math.round((last?.size ?? 0) / 1024)} KB after shrinking it. Try another frame.`);
}

/** After a seek: wait for the frame to be presented (requestVideoFrameCallback, or one animation frame). */
export function waitFrame(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const v = video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (typeof v.requestVideoFrameCallback === 'function') {
      v.requestVideoFrameCallback(finish);
      window.setTimeout(() => requestAnimationFrame(finish), 250);
    } else requestAnimationFrame(() => requestAnimationFrame(finish));
  });
}

function once(target: EventTarget, events: string[], ms: number, failOn: string[] = ['error']): Promise<string> {
  return new Promise((resolve, reject) => {
    const off = () => {
      for (const e of [...events, ...failOn]) target.removeEventListener(e, on);
      window.clearTimeout(timer);
    };
    const on = (e: Event) => {
      off();
      if (failOn.includes(e.type)) reject(new PosterError("The video didn't load."));
      else resolve(e.type);
    };
    for (const e of [...events, ...failOn]) target.addEventListener(e, on);
    const timer = window.setTimeout(() => {
      off();
      reject(new PosterError('The video took too long to answer.'));
    }, ms);
  });
}

/** Seeks (if needed) and waits until the frame at `t` seconds is on screen. */
export async function seekTo(video: HTMLVideoElement, t: number, ms = 20000): Promise<void> {
  if (video.readyState < 1) await once(video, ['loadedmetadata'], ms);
  const target = Math.max(0, Math.min(t, (video.duration || t) - 0.05));
  if (Math.abs(video.currentTime - target) > 0.001 || video.readyState < 2) {
    const seeked = once(video, ['seeked'], ms);
    video.currentTime = target;
    await seeked;
  }
  if (video.readyState < 2) await once(video, ['loadeddata', 'canplay'], ms);
  await waitFrame(video);
}

/** The frame the video shows now, encoded. */
export function captureFrame(video: HTMLVideoElement): Promise<EncodedPoster> {
  return encodePoster(video, video.videoWidth, video.videoHeight, Math.round(video.currentTime * 1000));
}

/** An uploaded image: any image the browser can decode except SVG and GIF, re-drawn and re-encoded. */
export async function encodeImageFile(file: File): Promise<EncodedPoster> {
  if (!file.type.startsWith('image/') || /svg|gif/i.test(file.type) || /\.(svg|gif)$/i.test(file.name)) {
    throw new PosterError('Use a JPEG, PNG or WebP image. SVG and GIF are not accepted.');
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PosterError("That file isn't an image this browser can read.");
  }
  try {
    return await encodePoster(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

/** "84 KB · 720×1280" */
export const posterNote = (p: Pick<EncodedPoster, 'blob' | 'width' | 'height'>) => `${Math.max(1, Math.round(p.blob.size / 1024))} KB · ${p.width}×${p.height}`;
