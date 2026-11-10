import { Pause, Play } from 'lucide-react';
import { useEffect, useState, type RefObject } from 'react';
import { useStill } from '../../lib/store';

const saveData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/** True while at least `threshold` of the element is on screen and the tab is visible. A reel only runs while someone can see it. */
export function useVisible(ref: RefObject<Element | null>, threshold: number): boolean {
  const [inView, setInView] = useState(false);
  const [tab, setTab] = useState(() => document.visibilityState !== 'hidden');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry && entry.intersectionRatio >= threshold)), { threshold: [0, threshold] });
    io.observe(el);
    const onTab = () => setTab(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onTab);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onTab);
    };
  }, [ref, threshold]);

  return inView && tab;
}

/**
 * Whether a reel runs, and the one control that says so. Normally that control is Pause animations itself (R11), so the reel and the footer switch are the same setting.
 * When the OS asks for reduced motion, the visitor is saving data, or the browser refuses to autoplay (Low Power Mode), the global switch cannot help, so the button plays this reel alone.
 */
function usePlayback() {
  const { still, locked, toggle } = useStill();
  const [here, setHere] = useState<boolean | null>(null);
  const [refused, setRefused] = useState(false);
  const local = locked || refused || saveData();
  const wanted = here ?? (!still && !saveData() && !refused);
  return {
    wanted,
    label: `${wanted ? 'Pause' : 'Play'} ${local ? 'video' : 'animations'}`,
    toggle: () => (local ? setHere(!wanted) : toggle()),
    refuse: () => {
      setRefused(true);
      setHere(false);
    },
  };
}

/**
 * Drives one looping reel: poster first, no bytes until it should run, runs only while `threshold` of `box` is in view, the tab is visible and nothing else (the player) asks it to rest.
 * `armed` holds the first start back, which is how the hero waits for the fonts and an idle moment.
 */
export function useReel(box: RefObject<Element | null>, clip: RefObject<HTMLVideoElement | null>, { threshold, paused, armed = true }: { threshold: number; paused: boolean; armed?: boolean }) {
  const { wanted, label, toggle, refuse } = usePlayback();
  const visible = useVisible(box, threshold);
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = clip.current;
    if (!el || !armed) return;
    if (!wanted || !visible || paused) {
      el.pause();
    } else if (!started) {
      setStarted(true); // src goes in with this, so the play below has something to play on the next run
    } else {
      void el.play().catch((e: DOMException) => {
        if (e.name === 'NotAllowedError') refuse();
      });
    }
    // refuse is stable in effect: it only sets state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, wanted, visible, paused, started]);

  return { wanted, label, toggle, started, shown, onPlaying: () => setShown(true) };
}

/** The pause control on a reel. Over-video glass, 44 px, primary icon only. */
export function ReelPause({ wanted, label, onToggle, className }: { wanted: boolean; label: string; onToggle: () => void; className?: string }) {
  const Icon = wanted ? Pause : Play;
  return (
    <button type="button" className={`reel-pause glass-media ${className ?? ''}`} onClick={onToggle} aria-label={label}>
      <Icon className="size-[18px] fill-current" aria-hidden />
    </button>
  );
}
