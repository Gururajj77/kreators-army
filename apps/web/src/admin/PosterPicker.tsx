// Owner: A4 Admin. Poster frame (admin brief 5.4): "Pick a frame" pauses the preview and shows a scrubber (0 to the duration, step 1/30 s, a m:ss.ff
// label; ←/→ one frame, Shift+←/→ one second, Home and End); "Use this frame" waits for the frame, encodes it (posterEncode.ts) and hands it to the
// drawer, which uploads it at once for a saved video or after create for a new one. "Upload an image" runs the same encoder. "Remove poster" is V10.
import { Check, Ellipsis, ImagePlus, ScanLine, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { withArrows } from '../components/TextArrow';
import { MenuButton } from './bits';
import { captureFrame, encodeImageFile, PosterError, posterNote, seekTo, type EncodedPoster } from './posterEncode';

const FPS = 30;

/** m:ss.ff at 30 frames a second. */
export function frameClock(t: number): string {
  const whole = Math.floor(t);
  const ff = Math.min(FPS - 1, Math.floor((t - whole) * FPS + 1e-6));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}.${String(ff).padStart(2, '0')}`;
}

export function PosterPicker({
  video,
  canPick,
  hasPoster,
  storedPoster,
  note,
  busy,
  onPicked,
  onRemove,
}: {
  video: RefObject<HTMLVideoElement | null>;
  /** A stream is loaded in the preview. */
  canPick: boolean;
  hasPoster: boolean;
  /** A stored poster (V10 can remove it). */
  storedPoster: boolean;
  note: string | null;
  busy: boolean;
  onPicked: (p: EncodedPoster) => Promise<void> | void;
  onRemove: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const [t, setT] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const scrub = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (!picking) return;
    const v = video.current;
    if (!v) return;
    v.pause();
    const sync = () => {
      setDuration(Number.isFinite(v.duration) ? v.duration : 0);
      setT(v.currentTime);
    };
    sync();
    v.addEventListener('loadedmetadata', sync);
    v.addEventListener('durationchange', sync);
    window.setTimeout(() => scrub.current?.focus(), 0);
    return () => {
      v.removeEventListener('loadedmetadata', sync);
      v.removeEventListener('durationchange', sync);
    };
  }, [picking, video]);

  const go = (next: number) => {
    const v = video.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(next, duration || next));
    setT(clamped);
    v.pause();
    v.currentTime = clamped;
  };

  const onScrubKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 1 : 1 / FPS;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(t + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      go(t - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(Math.max(0, duration - 1 / FPS));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setPicking(false);
    }
  };

  const useFrame = async () => {
    const v = video.current;
    if (!v) return;
    setWorking(true);
    setError(null);
    try {
      await seekTo(v, t);
      const p = await captureFrame(v);
      await onPicked(p);
      setPicking(false);
    } catch (e) {
      setError(e instanceof PosterError ? e.message : "Couldn't make a poster from that frame.");
    } finally {
      setWorking(false);
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setWorking(true);
    setError(null);
    try {
      const p = await encodeImageFile(f);
      await onPicked(p);
    } catch (e) {
      setError(e instanceof PosterError ? e.message : "Couldn't use that image.");
    } finally {
      setWorking(false);
      if (file.current) file.current.value = '';
    }
  };

  return (
    <div className="adm-poster">
      {picking ? (
        <div className="adm-scrub" role="group" aria-labelledby={`${id}-scrub-label`}>
          <div className="adm-scrub-row">
            <label id={`${id}-scrub-label`} htmlFor={`${id}-scrub`} className="adm-label">
              Frame
            </label>
            <output className="adm-scrub-time" htmlFor={`${id}-scrub`}>
              {frameClock(t)}
            </output>
          </div>
          <input
            ref={scrub}
            id={`${id}-scrub`}
            type="range"
            className="adm-scrub-range"
            min={0}
            max={duration || 0}
            step={1 / FPS}
            value={Math.min(t, duration || t)}
            onChange={(e) => go(Number(e.target.value))}
            onKeyDown={onScrubKey}
            aria-valuetext={frameClock(t)}
            aria-describedby={`${id}-scrub-keys`}
          />
          <p id={`${id}-scrub-keys`} className="adm-help">
            {withArrows('← → one frame · Shift for a second')}
          </p>
          <div className="adm-poster-actions">
            <button type="button" className="btn btn-sm btn-ink" data-intent="positive" data-fill="" onClick={useFrame} disabled={working || busy}>
              <Check className="size-4" aria-hidden />
              {working ? 'Making the poster…' : 'Use this frame'}
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPicking(false)} disabled={working}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="adm-poster-actions">
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPicking(true)} disabled={!canPick || busy} title={canPick ? undefined : 'The preview needs a video first'}>
            <ScanLine className="size-4" aria-hidden /> Pick a frame
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => file.current?.click()} disabled={busy || working}>
            <ImagePlus className="size-4" aria-hidden /> Upload an image
          </button>
          {storedPoster && (
            <MenuButton label="Poster options" items={[{ label: 'Remove poster', icon: <Trash2 className="size-4" aria-hidden />, onSelect: onRemove, danger: true }]}>
              <Ellipsis className="size-5" aria-hidden />
            </MenuButton>
          )}
          <input ref={file} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        </div>
      )}
      <p className="adm-help adm-poster-note" aria-live="polite">
        {error ? <span className="adm-error-text">{error}</span> : note ?? (hasPoster ? null : 'No poster yet: tiles show the brand colour.')}
      </p>
    </div>
  );
}

export { posterNote };
