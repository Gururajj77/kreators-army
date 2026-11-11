// The blog's prerender, as a step of every web build (`pnpm --filter @kreators/web build`, and so `pnpm deploy`; any `vite build --outDir` too).
// After the client bundle is written, it loads src/blog/prerender.tsx through Vite's SSR loader (no port, no watcher), renders every post and the
// index to static HTML from the built index.html, and writes them with sitemap.xml, /blog/rss.xml and /llms.txt into the same dist. Most AI
// crawlers do not run JavaScript; these files are what they read. A post that would ship a broken page fails the build (src/blog/check.ts).
//
// The service worker leaves these pages out of its precache (vite.config.ts globIgnores): they are fetched like any page, network first.

import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig, Rollup } from 'vite';
import { blogSummary } from './blogSummary';

const PAGES = { post: /\/src\/site\/pages\/BlogPost\.tsx$/, index: /\/src\/site\/pages\/Blog\.tsx$/ };
const BODY = /\/src\/blog\/posts\/([a-z0-9]+(?:-[a-z0-9]+)*)\.ts$/;

interface Graph {
  css: { index: string[]; post: string[] };
  preload: { index: string[]; post: string[]; bodies: Record<string, string[]> };
}

interface PrerenderModule {
  prerenderBlog(input: { template: string } & Graph): Promise<{ files: { path: string; content: string }[]; posts: number; warnings: string[] }>;
}

export function blogPrerender(): Plugin {
  let config: ResolvedConfig;
  let graph: Graph | null = null;

  return {
    name: 'kreators:blog-prerender',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },

    // Which scripts and stylesheets each blog page needs beyond the first download, read from the bundle itself.
    generateBundle(_options, bundle) {
      if (config.build.ssr) return;
      const chunks = Object.values(bundle).filter((c): c is Rollup.OutputChunk => c.type === 'chunk');
      const byFile = new Map(chunks.map((c) => [c.fileName, c]));
      const closure = (start: Rollup.OutputChunk | undefined) => {
        const seen = new Set<string>();
        const visit = (file: string) => {
          if (seen.has(file)) return;
          seen.add(file);
          for (const dep of byFile.get(file)?.imports ?? []) visit(dep);
        };
        if (start) visit(start.fileName);
        return seen;
      };
      const entry = chunks.find((c) => c.isEntry);
      const first = closure(entry);
      const firstCss = new Set([...first].flatMap((f) => [...(byFile.get(f)?.viteMetadata?.importedCss ?? [])]));
      const url = (file: string) => `${config.base}${file}`;
      const need = (start: Rollup.OutputChunk | undefined, skip: Set<string>) => {
        const files = [...closure(start)].filter((f) => !skip.has(f));
        const css = [...new Set(files.flatMap((f) => [...(byFile.get(f)?.viteMetadata?.importedCss ?? [])]))].filter((c) => !firstCss.has(c));
        return { js: files.map(url), css: css.map(url), files };
      };
      const find = (re: RegExp) => chunks.find((c) => c.facadeModuleId && re.test(c.facadeModuleId));
      const postPage = need(find(PAGES.post), first);
      const indexPage = need(find(PAGES.index), first);
      if (!postPage.files.length || !indexPage.files.length) this.error('blog prerender: could not find the Blog and BlogPost page chunks in the bundle');
      const shared = new Set([...first, ...postPage.files]);
      const bodies: Record<string, string[]> = {};
      for (const c of chunks) {
        const slug = c.facadeModuleId ? BODY.exec(c.facadeModuleId)?.[1] : undefined;
        if (slug && !slug.startsWith('_')) bodies[slug] = need(c, shared).js;
      }
      graph = { css: { index: indexPage.css, post: postPage.css }, preload: { index: indexPage.js, post: postPage.js, bodies } };
    },

    writeBundle: {
      sequential: true,
      async handler(options) {
        if (config.build.ssr || !graph) return;
        const outDir = options.dir ?? path.resolve(config.root, config.build.outDir);
        const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
        const { createServer } = await import('vite');
        const server = await createServer({
          configFile: false,
          root: config.root,
          logLevel: 'error',
          appType: 'custom',
          server: { middlewareMode: true, hmr: false, ws: false, watch: null },
          optimizeDeps: { noDiscovery: true, include: [] },
          esbuild: { jsx: 'automatic' },
          plugins: [blogSummary()],
        });
        try {
          const mod = (await server.ssrLoadModule('/src/blog/prerender.tsx')) as PrerenderModule;
          const { files, posts, warnings } = await mod.prerenderBlog({ template, ...graph });
          for (const w of warnings) config.logger.warn(`blog prerender: ${w}`);
          for (const f of files) {
            const dest = path.join(outDir, f.path);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, f.content);
          }
          config.logger.info(`blog prerender: ${posts} posts, ${files.length} files (blog.html, blog/*.html, blog/rss.xml, sitemap.xml, llms.txt)`);
        } finally {
          await server.close();
        }
      },
    },
  };
}
