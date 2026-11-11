import { Suspense, lazy, useEffect, type ComponentType, type LazyExoticComponent } from 'react';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';
import { Backdrop } from './components/backdrop/Backdrop';
import { NotFound } from './screens/NotFound';
import { Home } from './site/Home';
import { Layout, RouteError } from './site/Layout';
import { LibraryShell } from './site/LibraryShell';

type PageModule = { default: ComponentType };

// Every public route but Home and the 404 is its own chunk. One list, so they can all be fetched after first paint. The admin is never in it: it is not
// prefetched, not precached and not linked (V2-SPEC 2.13 item 7).
export const ROUTE_LOADERS = {
  VideoLibrary: () => import('./site/VideoLibrary').then((m) => ({ default: m.VideoLibrary })),
  HowWeWork: () => import('./site/pages/HowWeWork'),
  Trial: () => import('./site/pages/Trial'),
  Pricing: () => import('./site/pages/Pricing'),
  WhyKreators: () => import('./site/pages/WhyKreators'),
  WhyVoxpop: () => import('./site/pages/WhyVoxpop'),
  Testimonials: () => import('./site/pages/Testimonials'),
  Founders: () => import('./site/pages/Founders'),
  Events: () => import('./site/pages/Events'),
  Retail: () => import('./site/pages/Retail'),
  Numbers: () => import('./site/pages/Numbers'),
  Blog: () => import('./site/pages/Blog'),
  BlogPost: () => import('./site/pages/BlogPost'),
  Careers: () => import('./site/pages/Careers'),
  Contact: () => import('./site/pages/Contact'),
  FaqPage: () => import('./site/pages/FaqPage'),
  FaqAnswer: () => import('./site/pages/FaqAnswer'),
  Privacy: () => import('./site/pages/Privacy'),
  Terms: () => import('./site/pages/Terms'),
} satisfies Record<string, () => Promise<PageModule>>;

const pages = Object.fromEntries(Object.entries(ROUTE_LOADERS).map(([name, load]) => [name, lazy(load)])) as Record<keyof typeof ROUTE_LOADERS, LazyExoticComponent<ComponentType>>;

const page = (name: keyof typeof ROUTE_LOADERS) => {
  const Component = pages[name];
  return <Component />;
};

// The component kit (site/Kit.tsx, A3) exists only in a kit build: `VITE_KIT=1 vite build`. Vite replaces the env value at build time, so in a normal
// build this branch is dead and neither the route nor the chunk is emitted (scripts/perf-budget.mjs fails on `__kit` in dist).
type KitModule = { Kit?: ComponentType; default?: ComponentType };
const kitRoutes: RouteObject[] =
  import.meta.env.VITE_KIT === '1'
    ? Object.values(import.meta.glob<KitModule>('./site/Kit.tsx')).map((load) => ({
        path: '/__kit',
        lazy: () => load().then((m) => ({ Component: m.Kit ?? m.default ?? null })),
      }))
    : [];

const router = createBrowserRouter([
  {
    // Outside Layout: no public nav, footer, cast or street. One lazy chunk; its own error boundary reloads once on a stale chunk.
    path: '/admin/*',
    lazy: () => import('./admin/AdminApp').then((m) => ({ Component: m.AdminApp })),
    errorElement: <RouteError />,
  },
  {
    // The one continuous background (components/backdrop) sits under every public page, mounted once here beside the layout; never on /admin.
    element: (
      <>
        <Backdrop />
        <Layout />
      </>
    ),
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { path: '/', element: <Home /> },
          // Its own fallback, the library's shell: the generic skeleton is shorter than the library, so the footer jumped when the chunk landed.
          { path: '/video-library', element: <Suspense fallback={<LibraryShell />}>{page('VideoLibrary')}</Suspense> },
          { path: '/how-we-work', element: page('HowWeWork') },
          { path: '/trial', element: page('Trial') },
          { path: '/pricing', element: page('Pricing') },
          { path: '/why-kreators', element: page('WhyKreators') },
          { path: '/why-voxpop', element: page('WhyVoxpop') },
          { path: '/testimonials', element: page('Testimonials') },
          { path: '/founders', element: page('Founders') },
          { path: '/events', element: page('Events') },
          { path: '/retail', element: page('Retail') },
          { path: '/numbers', element: page('Numbers') },
          { path: '/blog', element: page('Blog') },
          { path: '/blog/:slug', element: page('BlogPost') },
          { path: '/careers', element: page('Careers') },
          { path: '/contact', element: page('Contact') },
          { path: '/contact-us', element: page('Contact') },
          { path: '/faq', element: page('FaqPage') },
          { path: '/faq/:slug', element: page('FaqAnswer') },
          { path: '/legal/privacy', element: page('Privacy') },
          { path: '/legal/terms', element: page('Terms') },
          ...kitRoutes,
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

/** After the first paint, fetch the other routes one at a time, so a click lands at once and a view transition never waits on the network. Never on /admin. */
function prefetchRoutes() {
  if (window.location.pathname.startsWith('/admin')) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return;
  const queue = Object.values(ROUTE_LOADERS);
  const next = () => {
    const load = queue.shift();
    if (load) void load().then(next, next);
  };
  next();
}

export function App() {
  useEffect(() => {
    const whenIdle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200));
    const start = () => void whenIdle(prefetchRoutes);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  return <RouterProvider router={router} />;
}
