import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/media/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              precacheFallback: { fallbackURL: 'index.html' },
            },
          },
        ],
        // svg keeps the cast's plates available offline.
        globPatterns: ['**/*.{js,css,html,woff2,svg}'],
      },
    }),
  ],
  build: {
    // The big libraries get their own files, which change rarely, so a new release re-downloads only the app's own code.
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/packages/shared/src/')) return 'shared';
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
  server: {
    proxy: { '/api': 'http://localhost:8797' },
  },
});
