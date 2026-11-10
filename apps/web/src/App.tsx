import { lazy, useEffect, type ComponentType, type LazyExoticComponent } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { NotFound } from './screens/NotFound';
import { Home } from './site/Home';
import { Layout, RouteError } from './site/Layout';

type PageModule = { default: ComponentType };

// Every route but Home and the 404 is its own chunk. One list, so they can all be fetched after first paint.
export const ROUTE_LOADERS = {
  VideoLibrary: () => import('./site/VideoLibrary').then((m) => ({ default: m.VideoLibrary })),
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/video-library', element: page('VideoLibrary') },
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
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

/** After the first paint, fetch the other routes one at a time, so a click lands at once and a view transition never waits on the network. */
function prefetchRoutes() {
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
