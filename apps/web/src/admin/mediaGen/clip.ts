// (pv) One video in, a hover clip and a thumbnail out, all in the admin's browser (the Worker has no ffmpeg).
//
// 1. The stream plays in one hidden <video> (same-origin, so the canvas is never tainted); Chrome and Safari on a Mac decode H.264
//    and HEVC in hardware.
// 2. A start is chosen about a quarter in (at least 2 s), skipping near-black, near-white and flat frames with a 48 px luma check.
// 3. Frames are taken at 15 fps for CLIP_S plus a short tail by playing at 2x and keeping presented frames (requestVideoFrameCallback):
//    one pass through the bytes. Measured on a 1440x2560 HEVC file at 20 Mbps with the index at the end, through the Worker and the
//    MEGA mock: 2x 4.7 s, 1x 8.6 s, seeking frame by frame 12.4 s (paced at 3 MB/s: 5.7, 9.6, 13.3 s). Seeking stays as the fallback
//    when frames stop arriving (a hidden tab, a stall), from the frame where playing stopped.
// 3b. Every frame is scored on a 48 px copy; a window that turns out more than a fifth dark, blown out or flat is recorded again once,
//    just after the bad stretch, and a file whose every frame comes out blank fails with a reason (a codec the browser can't decode).
// 4. Each frame is drawn at 360 px on the short edge; the tail is cross-faded into the head so the loop has no seam. The frame that
//    scores best (contrast and detail, not dark) is drawn once more at poster size for the thumbnail.
// 5. WebCodecs encodes H.264 (High, then Main, then Baseline) into an MP4 with the index first, keyframe at the start, no audio;
//    VP9 in WebM where the browser cannot encode H.264. Over the cap, it is encoded again at a lower bitrate.
// The muxers load here, in the admin chunk, only when the first clip is made.

export const FPS = 15;
/** Seconds of loop. */
export const CLIP_S = 3.6;
/** Extra frames captured after the loop and cross-faded into its first frames. */
const FADE_FRAMES = 5;
const SHORT_EDGE = 360;
const LONG_EDGE_MAX = 640;
const POSTER_LONG_EDGE = 1280;
export const CLIP_TARGET_BYTES = 400 * 1024;
export const CLIP_MAX_BYTES = 600 * 1024;
const BITRATES = [640_000, 420_000, 260_000];

export class ClipError extends Error {
  constructor(
    message: string,
    readonly code: 'no-webcodecs' | 'decode' | 'hevc' | 'timeout' | 'load' | 'encode' | 'too-large' | 'stopped' | 'no-stream',
  ) {
    super(message);
    this.name = 'ClipError';
  }
}

export interface ClipCodec {
  codec: string;
  mime: 'video/mp4' | 'video/webm';
}

export interface MadeClip {
  blob: Blob;
  mime: 'video/mp4' | 'video/webm';
  width: number;
  height: number;
  durationMs: number;
  startMs: number;
  codec: string;
  bitrate: number;
  /** Where the time went, for the harness and the report. */
  timing: { loadMs: number; pickMs: number; captureMs: number; encodeMs: number; totalMs: number; mode: CaptureMode; probes: number; recaptures: number };
}

export interface MadeThumb {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  timeMs: number;
}

export type CaptureMode = 'play' | 'play2' | 'seek';

// ---------------------------------------------------------------- codec choice

let codecChoice: Promise<ClipCodec | null> | null = null;

/** The first clip codec this browser can encode at 360 x 640, or null when it has no WebCodecs encoder at all. */
export function chooseCodec(): Promise<ClipCodec | null> {
  codecChoice ??= (async () => {
    if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return null;
    const tries: ClipCodec[] = [
      { codec: 'avc1.64001f', mime: 'video/mp4' },
      { codec: 'avc1.4d001f', mime: 'video/mp4' },
      { codec: 'avc1.42001f', mime: 'video/mp4' },
      { codec: 'vp09.00.10.08', mime: 'video/webm' },
      { codec: 'vp8', mime: 'video/webm' },
    ];
    for (const t of tries) {
      try {
        const r = await VideoEncoder.isConfigSupported({ codec: t.codec, width: SHORT_EDGE, height: LONG_EDGE_MAX, bitrate: BITRATES[0], framerate: FPS, ...(t.mime === 'video/mp4' ? { avc: { format: 'avc' } } : {}) });
        if (r.supported) return t;
      } catch {
        // try the next one
      }
    }
    return null;
  })();
  return codecChoice;
}

// ---------------------------------------------------------------- the hidden player

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** The clip size for a source of w x h: 360 on the short edge, at most 640 on the long edge, even numbers. */
export function clipSize(w: number, h: number): { width: number; height: number } {
  if (!w || !h) return { width: SHORT_EDGE, height: LONG_EDGE_MAX };
  const portrait = h >= w;
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  let s = Math.min(SHORT_EDGE, short);
  let l = (long * s) / short;
  if (l > LONG_EDGE_MAX) {
    l = LONG_EDGE_MAX;
    s = (short * l) / long;
  }
  return portrait ? { width: even(s), height: even(l) } : { width: even(l), height: even(s) };
}

function waitFor(el: HTMLVideoElement, ok: string[], ms: number, signal: AbortSignal, what: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fail = ['error'];
    const off = () => {
      for (const e of [...ok, ...fail]) el.removeEventListener(e, on);
      window.clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
    };
    const on = (e: Event) => {
      off();
      if (e.type === 'error') reject(mediaError(el));
      else resolve(e.type);
    };
    const onAbort = () => {
      off();
      reject(new ClipError('Stopped.', 'stopped'));
    };
    for (const e of [...ok, ...fail]) el.addEventListener(e, on);
    signal.addEventListener('abort', onAbort);
    const timer = window.setTimeout(() => {
      off();
      reject(new ClipError(`The stream timed out (${what}).`, 'timeout'));
    }, ms);
  });
}

let hevcHint = false;
function mediaError(el: HTMLVideoElement): ClipError {
  const code = el.error?.code;
  if (code === 3 || code === 4) {
    return hevcHint ? new ClipError("This browser couldn't decode this HEVC video. Try Safari on a Mac, or re-export it as H.264.", 'hevc') : new ClipError("This browser can't decode this video.", 'decode');
  }
  return new ClipError("The stream didn't load. MEGA may be busy or over its quota; try again later.", 'load');
}

const MEGA_SAYS: Record<string, string> = {
  'over-quota': "MEGA's transfer quota is used up for now. Retry in an hour or two.",
  busy: 'MEGA is busy. Retry in a minute.',
  'not-found': 'MEGA says this file is gone.',
  removed: 'MEGA says this file was removed.',
  blocked: 'MEGA has blocked this file.',
  'bad-key': "The MEGA link's key doesn't open this file.",
  'bad-link': "The MEGA link isn't valid.",
  upstream: "MEGA didn't answer properly. Retry later.",
};

/** The stream's own answer to ?probe=1 (MEGA streams only), as a failure with a reason, or null when it says the stream is fine. */
async function whyNot(streamUrl: string): Promise<ClipError | null> {
  if (!/^\/media\/v\//.test(new URL(streamUrl, location.href).pathname)) return null;
  try {
    const r = await fetch(`${streamUrl}${streamUrl.includes('?') ? '&' : '?'}probe=1`, { cache: 'no-store', credentials: 'same-origin' });
    if (r.ok) return null;
    const kind = r.headers.get('X-Mega-Error') ?? '';
    return new ClipError(MEGA_SAYS[kind] ?? `The stream didn't load (HTTP ${r.status}).`, 'load');
  } catch {
    return new ClipError("The stream didn't load. Check the connection and retry.", 'load');
  }
}

async function seek(el: HTMLVideoElement, t: number, signal: AbortSignal, ms = 30000): Promise<void> {
  const target = Math.max(0, Math.min(t, (el.duration || t) - 0.04));
  if (Math.abs(el.currentTime - target) > 0.0005 || el.readyState < 2) {
    const done = waitFor(el, ['seeked'], ms, signal, 'seek');
    el.currentTime = target;
    await done;
  }
  if (el.readyState < 2) await waitFor(el, ['loadeddata', 'canplay'], ms, signal, 'first frame');
  await presented(el);
}

/** The next presented frame (requestVideoFrameCallback), or a short wait where it never comes (hidden tab). */
function presented(el: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if ('requestVideoFrameCallback' in el) el.requestVideoFrameCallback(finish);
    window.setTimeout(finish, 120);
  });
}

// ---------------------------------------------------------------- scoring

const SCORE_W = 48;

interface Score {
  mean: number;
  sd: number;
  detail: number;
  value: number;
}

function scoreOf(ctx: CanvasRenderingContext2D, source: CanvasImageSource, sw: number, sh: number): Score {
  const w = SCORE_W;
  const h = Math.max(8, Math.round((SCORE_W * sh) / Math.max(1, sw)));
  if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
    ctx.canvas.width = w;
    ctx.canvas.height = h;
  }
  ctx.drawImage(source, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const n = w * h;
  const lum = new Float32Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const y = 0.2126 * d[i * 4]! + 0.7152 * d[i * 4 + 1]! + 0.0722 * d[i * 4 + 2]!;
    lum[i] = y;
    sum += y;
  }
  const mean = sum / n;
  let v = 0;
  let edge = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      v += (lum[i]! - mean) ** 2;
      if (x + 1 < w) edge += Math.abs(lum[i]! - lum[i + 1]!);
      if (y + 1 < h) edge += Math.abs(lum[i]! - lum[i + w]!);
    }
  }
  const sd = Math.sqrt(v / n);
  const detail = edge / n;
  // Dark, blown-out and flat frames (black, a fade, a white title card) score low; detail breaks ties toward sharp frames.
  const exposure = mean < 28 ? mean / 28 : mean > 232 ? Math.max(0, (255 - mean) / 23) : 1;
  return { mean, sd, detail, value: (sd + detail * 2.5) * exposure };
}

const usable = (s: Score) => s.mean >= 28 && s.mean <= 232 && s.sd >= 10;

// ---------------------------------------------------------------- make

export interface MakeOptions {
  signal: AbortSignal;
  /** Where the clip starts, ms. Default: chosen. */
  startMs?: number;
  mode?: CaptureMode;
  wantClip: boolean;
  wantThumb: boolean;
  /** The file's codec as MEGA's header said ('hvc1...'), for a clearer error. */
  codecHint?: string | null;
  onStep?: (step: string, progress: number) => void;
}

export interface Made {
  clip: MadeClip | null;
  thumb: MadeThumb | null;
}

/** A hidden <video> that stays laid out (Chrome stops presenting frames of a video it never paints). */
function hiddenVideo(): { el: HTMLVideoElement; remove: () => void } {
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.dataset.mediagen = '';
  holder.style.cssText = 'position:fixed;right:0;bottom:0;width:2px;height:2px;overflow:hidden;opacity:0.01;pointer-events:none;z-index:-1;contain:strict';
  const el = document.createElement('video');
  el.muted = true;
  el.playsInline = true;
  // 'metadata': the browser reads the index and the first frames, not as far ahead as it can (every byte comes from MEGA's quota).
  el.preload = 'metadata';
  el.disablePictureInPicture = true;
  el.style.cssText = 'width:2px;height:2px';
  holder.appendChild(el);
  document.body.appendChild(holder);
  return {
    el,
    remove: () => {
      el.pause();
      el.removeAttribute('src');
      el.load();
      holder.remove();
    },
  };
}

export async function makeMedia(streamUrl: string, opts: MakeOptions): Promise<Made> {
  const { signal } = opts;
  const step = opts.onStep ?? (() => undefined);
  const codec = opts.wantClip ? await chooseCodec() : null;
  if (opts.wantClip && !codec) throw new ClipError("This browser can't make preview clips (no video encoder). Use Chrome or Safari on a Mac.", 'no-webcodecs');
  hevcHint = /^(hvc1|hev1)/i.test(opts.codecHint ?? '');
  const t0 = performance.now();
  const { el, remove } = hiddenVideo();
  let frames: VideoFrame[] = [];
  try {
    step('Loading the video', 0.02);
    el.src = streamUrl;
    el.load();
    try {
      await waitFor(el, ['loadedmetadata'], 45000, signal, 'loading');
    } catch (e) {
      // An error answer (MEGA over quota, a removed file) reaches the element as "unsupported": ask the stream why.
      if (e instanceof ClipError && e.code !== 'stopped') throw (await whyNot(streamUrl)) ?? e;
      throw e;
    }
    const W = el.videoWidth;
    const H = el.videoHeight;
    const D = Number.isFinite(el.duration) ? el.duration : 0;
    if (!W || !H) throw new ClipError(hevcHint ? "This browser couldn't decode this HEVC video. Try Safari on a Mac, or re-export it as H.264." : "This browser can't decode this video.", hevcHint ? 'hevc' : 'decode');
    const loadMs = performance.now() - t0;

    // ---- start
    const fade = FADE_FRAMES;
    const loopFrames = Math.round(CLIP_S * FPS);
    const want = loopFrames + fade;
    const span = want / FPS;
    const scoreCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    let start = 0;
    let probes = 0;
    const tPick = performance.now();
    if (opts.startMs !== undefined) start = Math.max(0, Math.min(opts.startMs / 1000, Math.max(0, D - span - 0.05)));
    else if (D > span + 0.2) {
      const latest = Math.max(0, D - span - 0.1);
      const fractions = [0.25, 0.2, 0.33, 0.4, 0.15, 0.5];
      let best: { t: number; s: Score } | null = null;
      for (const f of fractions) {
        if (probes >= 3) break;
        const t = Math.min(latest, Math.max(Math.min(2, latest), D * f));
        if (best && Math.abs(best.t - t) < 0.5) continue;
        step('Choosing a moment', 0.05 + probes * 0.03);
        await seek(el, t, signal);
        probes++;
        const s = scoreOf(scoreCtx, el, W, H);
        if (!best || s.value > best.s.value) best = { t, s };
        if (usable(s)) {
          best = { t, s };
          break;
        }
      }
      start = best?.t ?? Math.min(latest, 2);
    }
    const pickMs = performance.now() - tPick;

    // ---- frames
    const size = clipSize(W, H);
    const clipCanvas = document.createElement('canvas');
    clipCanvas.width = size.width;
    clipCanvas.height = size.height;
    const cctx = clipCanvas.getContext('2d', { alpha: false })!;
    cctx.imageSmoothingQuality = 'high';
    const pscale = Math.min(1, POSTER_LONG_EDGE / Math.max(W, H));
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = Math.max(1, Math.round(W * pscale));
    posterCanvas.height = Math.max(1, Math.round(H * pscale));
    const pctx = posterCanvas.getContext('2d', { alpha: false })!;
    pctx.imageSmoothingQuality = 'high';
    let bestScore = -1;
    let bestTime = start;

    // VideoFrames copied from the canvas at once (synchronous), so a frame is never mixed up with the next one while playing.
    frames = [];
    let scores: { t: number; s: Score }[] = [];
    const take = (mediaTime: number) => {
      // Every frame is scored at 48 px (well under a millisecond): the best one becomes the thumbnail, and dark or blank stretches are seen.
      const s = scoreOf(scoreCtx, el, W, H);
      scores.push({ t: mediaTime, s });
      if (opts.wantThumb && s.value > bestScore) {
        bestScore = s.value;
        bestTime = mediaTime;
        pctx.drawImage(el, 0, 0, posterCanvas.width, posterCanvas.height);
      }
      if (opts.wantClip) {
        cctx.drawImage(el, 0, 0, size.width, size.height);
        frames.push(new VideoFrame(clipCanvas, { timestamp: Math.round((frames.length * 1e6) / FPS) }));
      }
    };

    const tCap = performance.now();
    let mode: CaptureMode = opts.mode ?? 'play2';
    const capture = async () => {
      if (!opts.wantClip) {
        // A thumbnail alone: the chosen moment and a few frames after it.
        for (const dt of [0, 0.4, 0.8, 1.2]) {
          await seek(el, Math.min(D - 0.05, start + dt), signal);
          take(el.currentTime);
        }
        return;
      }
      if (mode === 'play' || mode === 'play2') {
        try {
          await capturePlaying(el, start, want, mode === 'play2' ? 2 : 1, take, signal, (n) => step('Recording the preview', 0.15 + (0.6 * n) / want));
        } catch (e) {
          if (e instanceof ClipError && e.code === 'stopped') throw e;
          // Frames stopped arriving (a hidden tab, a stall): step through by seeking instead, from where it stopped.
          mode = 'seek';
        }
      }
      if (mode === 'seek') {
        for (let k = frames.length; k < want; k++) {
          await seek(el, start + k / FPS, signal);
          take(el.currentTime);
          step('Recording the preview', 0.15 + (0.6 * (k + 1)) / want);
        }
      }
    };
    let recaptures = 0;
    for (;;) {
      await capture();
      el.pause();
      // A decoder that "plays" but hands back nothing (an HEVC sample entry over H.264 data, a broken file): every frame black and flat.
      if (scores.length && scores.every((x) => x.s.mean < 4 && x.s.sd < 2)) {
        throw new ClipError(hevcHint ? "This browser couldn't decode this HEVC video. Try Safari on a Mac, or re-export it as H.264." : "This browser can't decode this video: every frame came out blank.", hevcHint ? 'hevc' : 'decode');
      }
      // A fade to black or a white card inside the window: start again just after it, once (only when the start was chosen here).
      const bad = scores.filter((x) => !usable(x.s));
      if (!opts.wantClip || opts.startMs !== undefined || recaptures >= 1 || bad.length / scores.length <= 0.2) break;
      const after = Math.max(...bad.map((x) => x.t)) + 0.3;
      const next = after + span <= D - 0.1 ? after : Math.max(Math.min(2, D - span - 0.1), Math.min(...bad.map((x) => x.t)) - span - 0.3);
      if (next < 0 || Math.abs(next - start) < 0.5) break;
      recaptures++;
      step('Skipping a dark stretch', 0.15);
      for (const f of frames) f.close();
      frames = [];
      scores = [];
      bestScore = -1;
      start = next;
      bestTime = start;
    }
    const captureMs = performance.now() - tCap;

    let clip: MadeClip | null = null;
    if (opts.wantClip && codec) {
      step('Encoding', 0.8);
      const tEnc = performance.now();
      const loop = crossfade(frames, loopFrames, fade, size);
      try {
        let out: Blob | null = null;
        let used = BITRATES[0]!;
        for (const bitrate of BITRATES) {
          if (signal.aborted) throw new ClipError('Stopped.', 'stopped');
          used = bitrate;
          out = await encode(loop, size, codec, bitrate);
          if (out.size <= CLIP_TARGET_BYTES || (bitrate === BITRATES[BITRATES.length - 1] && out.size <= CLIP_MAX_BYTES)) break;
          if (out.size <= CLIP_MAX_BYTES && bitrate !== BITRATES[0]) break;
        }
        if (!out || out.size > CLIP_MAX_BYTES) throw new ClipError(`The clip is still ${Math.round((out?.size ?? 0) / 1024)} KB after shrinking it.`, 'too-large');
        const encodeMs = performance.now() - tEnc;
        clip = {
          blob: out,
          mime: codec.mime,
          width: size.width,
          height: size.height,
          durationMs: Math.round((loopFrames * 1000) / FPS),
          startMs: Math.round(start * 1000),
          codec: codec.codec,
          bitrate: used,
          timing: { loadMs: Math.round(loadMs), pickMs: Math.round(pickMs), captureMs: Math.round(captureMs), encodeMs: Math.round(encodeMs), totalMs: Math.round(performance.now() - t0), mode, probes, recaptures },
        };
      } finally {
        for (const f of loop) f.close();
      }
    }
    for (const f of frames) f.close();
    const thumb: MadeThumb | null = opts.wantThumb && bestScore >= 0 ? { canvas: posterCanvas, width: posterCanvas.width, height: posterCanvas.height, timeMs: Math.round(bestTime * 1000) } : null;
    return { clip, thumb };
  } finally {
    // Closing a closed frame does nothing; this catches every early exit (a stop, a blank decode, an encoder error).
    for (const f of frames) f.close();
    remove();
  }
}

/** Plays from `start` and keeps the first presented frame at or after each 1/FPS step (a slow source repeats a frame). */
async function capturePlaying(el: HTMLVideoElement, start: number, want: number, rate: number, take: (t: number) => void, signal: AbortSignal, progress: (n: number) => void): Promise<void> {
  if (!('requestVideoFrameCallback' in el)) throw new ClipError('No frame callback.', 'decode');
  await seek(el, start, signal);
  const half = 0.5 / FPS;
  let k = 0;
  await new Promise<void>((resolve, reject) => {
    let last = performance.now();
    let finished = false;
    const end = (err?: unknown) => {
      if (finished) return;
      finished = true;
      window.clearInterval(watch);
      signal.removeEventListener('abort', onAbort);
      el.pause();
      if (err) reject(err);
      else resolve();
    };
    const onAbort = () => end(new ClipError('Stopped.', 'stopped'));
    signal.addEventListener('abort', onAbort);
    const onFrame = (_now: number, meta: VideoFrameCallbackMetadata) => {
      if (finished) return;
      last = performance.now();
      const t = meta.mediaTime;
      while (k < want && start + k / FPS <= t + half) {
        take(t);
        k++;
        progress(k);
      }
      if (k >= want) end();
      else el.requestVideoFrameCallback(onFrame);
    };
    // Nothing presented for 4 s (hidden tab, a stalled stream): give up on playing; the caller seeks the rest.
    const watch = window.setInterval(() => {
      if (performance.now() - last > 4000) end(new ClipError('Frames stopped arriving.', 'timeout'));
    }, 500);
    el.requestVideoFrameCallback(onFrame);
    el.playbackRate = rate;
    el.play().catch((e) => end(e instanceof DOMException && e.name === 'NotAllowedError' ? new ClipError('Playback was blocked.', 'decode') : mediaError(el)));
  });
}

/** The loop: frames N.. of the capture, with the last `fade` frames blended toward the first so the jump back is invisible. */
function crossfade(frames: VideoFrame[], loopFrames: number, fade: number, size: { width: number; height: number }): VideoFrame[] {
  const out: VideoFrame[] = [];
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const n = Math.min(loopFrames, Math.max(1, frames.length - fade));
  const f = Math.max(0, Math.min(fade, frames.length - n));
  // Output i shows capture i + f; across the last f outputs the capture that follows the loop's end (i + f) fades into the loop's
  // start (i + f - n), which is exactly what output 0 shows next.
  for (let i = 0; i < n; i++) {
    const src = frames[Math.min(frames.length - 1, i + f)]!;
    ctx.globalAlpha = 1;
    ctx.drawImage(src, 0, 0, size.width, size.height);
    const j = i - (n - f);
    if (f > 0 && j >= 0) {
      ctx.globalAlpha = (j + 1) / (f + 1);
      ctx.drawImage(frames[j]!, 0, 0, size.width, size.height);
    }
    out.push(new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) }));
  }
  return out;
}

async function encode(frames: VideoFrame[], size: { width: number; height: number }, codec: ClipCodec, bitrate: number): Promise<Blob> {
  if (codec.mime === 'video/mp4') {
    const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({ target, video: { codec: 'avc', width: size.width, height: size.height, frameRate: FPS }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
    await runEncoder(frames, size, codec.codec, bitrate, (chunk, meta) => muxer.addVideoChunk(chunk, meta));
    muxer.finalize();
    return new Blob([target.buffer], { type: 'video/mp4' });
  }
  const { Muxer, ArrayBufferTarget } = await import('webm-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: codec.codec.startsWith('vp09') ? 'V_VP9' : 'V_VP8', width: size.width, height: size.height, frameRate: FPS }, firstTimestampBehavior: 'offset' });
  await runEncoder(frames, size, codec.codec, bitrate, (chunk, meta) => muxer.addVideoChunk(chunk, meta));
  muxer.finalize();
  return new Blob([target.buffer], { type: 'video/webm' });
}

async function runEncoder(frames: VideoFrame[], size: { width: number; height: number }, codec: string, bitrate: number, onChunk: (c: EncodedVideoChunk, m?: EncodedVideoChunkMetadata) => void): Promise<void> {
  let failure: unknown = null;
  const enc = new VideoEncoder({
    output: (chunk, meta) => onChunk(chunk, meta),
    error: (e) => {
      failure = e;
    },
  });
  try {
    enc.configure({
      codec,
      width: size.width,
      height: size.height,
      bitrate,
      bitrateMode: 'variable',
      framerate: FPS,
      latencyMode: 'quality',
      ...(codec.startsWith('avc1') ? { avc: { format: 'avc' as const } } : {}),
    });
    frames.forEach((f, i) => enc.encode(f, { keyFrame: i === 0 }));
    await enc.flush();
  } catch (e) {
    throw new ClipError(`The encoder failed: ${e instanceof Error ? e.message : 'unknown'}`, 'encode');
  } finally {
    if (enc.state !== 'closed') enc.close();
  }
  if (failure) throw new ClipError(`The encoder failed: ${failure instanceof Error ? failure.message : 'unknown'}`, 'encode');
}
