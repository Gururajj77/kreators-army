import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'kreators-theme';
const STILL_KEY = 'kreators-still';
const META_COLOR: Record<Theme, string> = { light: '#f7f5f2', dark: '#0b0b0d' };

const root = document.documentElement;

function applyTheme(theme: Theme) {
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private windows may refuse; the setting still works for this visit
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

// public/theme.js has already picked the theme before the first paint; this only reads what it chose.
const initialTheme: Theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
applyTheme(initialTheme);

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggle: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    save(THEME_KEY, theme);
    const flip = () => applyTheme(theme);
    if (typeof document.startViewTransition === 'function' && !('still' in root.dataset)) {
      // Only the attribute changes inside the transition, and the store follows, as React asks of hand-started transitions.
      root.dataset.vt = 'theme';
      const transition = document.startViewTransition(flip);
      void transition.finished.finally(() => delete root.dataset.vt);
      void transition.updateCallbackDone.finally(() => set({ theme }));
    } else {
      flip();
      set({ theme });
    }
  },
}));

interface StillState {
  /** True when nothing should move on its own: the visitor paused animations, or the OS asks for reduced motion. */
  still: boolean;
  /** True when the OS preference is on, so the footer switch cannot turn motion back on. */
  locked: boolean;
  toggle: () => void;
}

const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let userStill = false;
try {
  userStill = localStorage.getItem(STILL_KEY) === '1';
} catch {
  // storage may be refused; fall back to the OS preference alone
}

function applyStill(still: boolean) {
  if (still) root.dataset.still = '';
  else delete root.dataset.still;
}

const effectiveStill = () => userStill || reducedQuery.matches;
applyStill(effectiveStill());

export const useStill = create<StillState>((set) => {
  reducedQuery.addEventListener('change', () => {
    applyStill(effectiveStill());
    set({ still: effectiveStill(), locked: reducedQuery.matches });
  });
  return {
    still: effectiveStill(),
    locked: reducedQuery.matches,
    toggle: () => {
      userStill = !userStill;
      save(STILL_KEY, userStill ? '1' : '0');
      const still = effectiveStill();
      applyStill(still);
      set({ still });
    },
  };
});
