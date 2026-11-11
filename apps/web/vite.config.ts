import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { blogPrerender } from './scripts/blogPrerender';
import { blogSummary } from './scripts/blogSummary';

// Lazy chunks with fixed names, keyed by the module that starts each one (see build.rollupOptions.output).
const NAMED_CHUNKS: [RegExp, string | ((m: RegExpExecArray) => string)][] = [
  [/\/src\/admin\/AdminApp\.tsx$/, 'admin'],
  [/\/src\/components\/street\/StreetScene\.tsx$/, 'street-far'],
  [/\/src\/components\/street\/art-full\.ts$/, 'street-full'],
  // (pv) The clip muxers, loaded by the admin's "Thumbnails & previews" only: admin-* names keep them out of the service worker's precache.
  [/\/node_modules\/mp4-muxer\//, 'admin-mp4-muxer'],
  [/\/node_modules\/webm-muxer\//, 'admin-webm-muxer'],
  // (blogcore10) Each blog post's body is its own chunk, post-<slug>-*.js: loaded when its page opens, and kept out of the precache below.
  [/\/src\/blog\/posts\/([a-z0-9-]+)\.ts$/, (m) => `post-${m[1]}`],
];
const namedChunk = (facade: string | null) => {
  if (!facade) return undefined;
  for (const [re, name] of NAMED_CHUNKS) {
    const m = re.exec(facade);
    if (m) return typeof name === 'string' ? name : name(m);
  }
  return undefined;
};
// Vite names a chunk's stylesheet after the chunk's own name (its entry file). The street's two paint sheets (paint-*.css, paint-full-*.css) are shared
// with How we work's vignettes, so they keep their own names; scripts/perf-budget.mjs counts them with the street chunks.
const NAMED_CSS: Record<string, string> = { AdminApp: 'admin', StreetScene: 'street-far', 'art-full': 'street-full' };

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // (blogcore10) After the client bundle: every blog post and the index as static HTML, sitemap.xml, /blog/rss.xml and /llms.txt (scripts/blogPrerender.ts).
    blogPrerender(),
    // (bento10) Each post's widgets and framework names for the index tiles, read from the post file (scripts/blogSummary.ts).
    blogSummary(),
    VitePWA({
      registerType: 'autoUpdate',
      // The nav logo and the hero's client logos (about 48 kB) keep the shell whole offline. The reels' posters stay out: their videos cannot play offline.
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'logo.png', 'logos/*.jpg'],
      manifest: {
        name: 'Kreators.Army',
        short_name: 'Kreators',
        theme_color: '#0e0e10',
        background_color: '#f7f5f2',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Pages come from the network first, so a deploy (a new price, FAQ or post) reaches a returning visitor on their next visit, not the one after.
        // The precached shell answers only when the network does not, within 3 s. No reload is forced mid-visit, so a half-filled form is never lost.
        navigateFallback: null,
        // Without this the precache answers '/' itself (as index.html), cache-first, and the home page would still arrive one visit late.
        directoryIndex: null,
        // No runtime route for /api/* or /media/* (a MEGA stream is ranged and private to the Worker's cache), and /admin is never served from here:
        // it is not precached and its navigations always go to the network (V2-SPEC 2.13 item 7).
        runtimeCaching: [
          // (blogcore10) A blog post's body chunk, once read, stays for offline reading. Names carry a content hash, so cache-first is safe.
          {
            urlPattern: ({ url }) => /^\/assets\/post-[a-z0-9-]+-[A-Za-z0-9_-]+\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'blog-posts', expiration: { maxEntries: 40 } },
          },
          {
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/media/') && !url.pathname.startsWith('/admin'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              precacheFallback: { fallbackURL: 'index.html' },
            },
          },
        ],
        // svg keeps the cast's plates available offline. The admin chunk is never precached.
        globPatterns: ['**/*.{js,css,html,woff2,svg}'],
        // (blogcore10) The blog's prerendered pages and post bodies are fetched when read, not installed with the app: 22 posts would add about 1 MB.
        globIgnores: ['**/admin-*.js', '**/admin-*.css', 'blog.html', 'blog/**', '**/post-*.js'],
      },
    }),
  ],
  build: {
    // The big libraries get their own files, which change rarely, so a new release re-downloads only the app's own code.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Lazy chunks named by the module that starts them, not with manualChunks: a manual chunk swallows its unassigned dependencies, which would pull
        // the app's own shared code into the admin chunk and the admin into the first download. admin-*.js and admin-*.css are never precached or
        // preloaded; the street splits into the skyline with the scene's code and styles (street-far) and the rest of the drawing (street-full).
        // (blogcore10) The blog's shared chunk (the registry, every post's meta and the renderer) and its stylesheet are blog-*.js and blog-*.css.
        chunkFileNames: (chunk) =>
          `assets/${namedChunk(chunk.facadeModuleId) ?? (chunk.moduleIds.some((id) => id.endsWith('/src/blog/registry.ts')) ? 'blog' : '[name]')}-[hash].js`,
        assetFileNames: (asset) => {
          const name = asset.names[0] ?? '';
          if (name.endsWith('.css') && typeof asset.source === 'string' && asset.source.includes('.post-toc')) return 'assets/blog-[hash][extname]';
          const named = NAMED_CSS[name.replace(/\.css$/, '')];
          return named && name.endsWith('.css') ? `assets/${named}-[hash][extname]` : 'assets/[name]-[hash][extname]';
        },
        manualChunks(id: string) {
          // The shared package's public parts get one small file. The parsers only the admin uses (links files, MEGA links, social links, grades, the
          // admin types) and the barrel that re-exports them stay unassigned, so they land in the admin chunk and never in a visitor's first download.
          if (id.includes('/packages/shared/src/')) {
            return /\/packages\/shared\/src\/(index|importLinks|megaLinks|socialLinks|grade|admin)\.ts$/.test(id) ? undefined : 'shared';
          }
          if (!id.includes('/node_modules/')) return undefined;
          // lucide-react's shared drawing code is one small file; each icon stays beside the screen that imports it.
          if (/\/node_modules\/lucide-react\/dist\/esm\/(Icon|createLucideIcon|defaultAttributes|context|shared\/)/.test(id)) return 'vendor-icons';
          if (/\/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'vendor-react';
          if (id.includes('/node_modules/@tanstack/')) return 'vendor-query';
          // Motion is not named: its animation code loads through import() in lib/motionFeatures.ts, and a name here would pull it all into one file.
          return undefined;
        },
      },
    },
  },
  // The founder's dev setup: the Worker on 8797 answers the API and the stream, poster and legacy MEGA paths. Bundled /media/*.mp4 stay with Vite.
  server: {
    proxy: {
      '/api': 'http://localhost:8797',
      '/media/v/': 'http://localhost:8797',
      '/media/mega-': 'http://localhost:8797',
      '/media/p/': 'http://localhost:8797',
      '/media/pv/': 'http://localhost:8797',
    },
  },
});
