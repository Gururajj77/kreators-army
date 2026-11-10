import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, MotionConfig } from 'motion/react';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ApiError } from './lib/api';
import { spring } from './lib/spring';
import { useStill } from './lib/store';
import './app.css';

// Read data counts as fresh for 30 seconds. One retry, and none for a refusal such as 401, 403 or 404, which a second try would only repeat.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => count < 1 && !(err instanceof ApiError && err.status >= 400 && err.status < 500),
    },
  },
});

// Motion's animation code is fetched as the app starts rather than with the first download (lib/motionFeatures.ts).
const motionFeatures = import('./lib/motionFeatures').then((r) => r.default);

/** The Pause animations control feeds Motion here; useSpring, animate(motionValue) and CSS check it for themselves (lib/motionOk.ts). */
function Motion({ children }: { children: ReactNode }) {
  const still = useStill((s) => s.still);
  return (
    <LazyMotion strict features={() => motionFeatures}>
      <MotionConfig reducedMotion={still ? 'always' : 'user'} transition={spring.smooth}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Motion>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Motion>
  </StrictMode>,
);
