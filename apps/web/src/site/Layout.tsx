import { Suspense, ViewTransition, useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, isRouteErrorResponse, useLocation, useRouteError, type Location } from 'react-router';
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';
import { Cta } from '../components/ui';

function ScrollToHash() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    // Instant on purpose: a long jump that travels is worse than one that lands.
    // Focus follows the scroll, so the next Tab continues from the section the visitor chose, not from the link that took them there.
    const land = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'instant' });
      if (!el.hasAttribute('tabindex') && el.tabIndex < 0) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      return true;
    };
    if (land()) return;

    // A lazy page's chunk is still on its way. Wait for the target to appear, but give up the moment the visitor starts moving: never pull a page out from under someone.
    const main = document.getElementById('main');
    if (!main) return;
    const stop = () => {
      watch.disconnect();
      window.clearTimeout(limit);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    };
    const watch = new MutationObserver(() => {
      if (land()) stop();
    });
    watch.observe(main, { childList: true, subtree: true });
    const limit = window.setTimeout(stop, 8000);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    return stop;
  }, [pathname, hash, key]);
  return null;
}

/** Shaped like the page it stands in for, so the swap does not jump. Shown only on a cold load: after the first paint every route is prefetched. */
function PageSkeleton() {
  return (
    <div className="page-skeleton wrap" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="page-skeleton-title skeleton" />
      <div className="page-skeleton-lead skeleton" />
      <div className="page-skeleton-grid">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </div>
  );
}

const RELOAD_KEY = 'kreators-chunk-reload';
const RELOAD_WINDOW_MS = 30_000;
const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload CSS/i;

// A timestamp rather than a flag that something has to clear: the error boundary sits inside the Outlet, so anything that could clear a flag still mounts
// when the chunk has failed, and one reload becomes an endless loop. This cannot loop whatever renders.
function reloadedRecently(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(RELOAD_KEY) ?? 0) < RELOAD_WINDOW_MS;
  } catch {
    // With no storage we cannot tell a loop from a retry, so we do not retry.
    return true;
  }
}

/** After a deploy, an open tab can ask for a chunk that no longer exists. Reload once to pick up the new build; if that fails, say so plainly. */
export function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : String(error);
  const stale = CHUNK_ERROR.test(message);
  // Decided once: the timestamp written below must not flip this while the reload is under way.
  const [willReload] = useState(() => stale && !reloadedRecently());

  useEffect(() => {
    if (!willReload) return;
    try {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      return;
    }
    window.location.reload();
  }, [willReload]);

  if (willReload) return <PageSkeleton />;

  return (
    <section className="wrap route-error">
      <h1 className="h2">This page did not load</h1>
      <p className="lead">{stale ? 'The site has just been updated. A fresh load should fix it.' : 'Something went wrong on our side. Please try again.'}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Cta onClick={() => window.location.reload()}>Reload</Cta>
        <Cta to="/" kind="ghost">
          Go home
        </Cta>
      </div>
    </section>
  );
}

// React Router keys a tab's first page 'default' whatever its address, so a page loaded afresh opened at the scroll of the last page loaded in this tab.
// Keyed by path instead. A fresh load (an address typed, a link from another site) also forgets that path's place and starts at the top, as any page does;
// Reload and Back still return the visitor to where they were.
const SCROLL_STORE = 'kreators-scroll';
const scrollKey = (loc: Location) => (loc.key === 'default' ? `default:${loc.pathname}` : loc.key);
try {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const saved: unknown = nav?.type === 'navigate' ? JSON.parse(sessionStorage.getItem(SCROLL_STORE) ?? 'null') : null;
  if (saved && typeof saved === 'object') {
    delete (saved as Record<string, number>)[`default:${window.location.pathname}`];
    sessionStorage.setItem(SCROLL_STORE, JSON.stringify(saved));
  }
} catch {
  // No storage: nothing is restored either.
}

/** A new page starts keyboard focus at its top, the way a full page load does. The first paint is left alone, and a link with a hash is ScrollToHash's to handle. */
function FocusOnRouteChange() {
  const { pathname, hash } = useLocation();
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (hash) return;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  const { pathname } = useLocation();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageSkeleton />}>
          {/* Keyed by path: leaving a page cross-fades to the next. default="none" keeps every other update, filters included, out of it. */}
          <ViewTransition key={pathname} default="none" enter="page-in" exit="page-out">
            <div>
              <Outlet />
            </div>
          </ViewTransition>
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration getKey={scrollKey} storageKey={SCROLL_STORE} />
      <ScrollToHash />
      <FocusOnRouteChange />
    </>
  );
}
