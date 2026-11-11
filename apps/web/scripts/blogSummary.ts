// (bento10) A post's summary for the blog index, read from its file at build time: which interactive widgets it holds and the names of its
// frameworks. The index loads every meta but no post body, so it cannot see these otherwise, and writers never have to keep a list in step.
//
//   import.meta.glob('./posts/*.ts', { query: '?summary', import: 'default', eager: true })   (src/blog/registry.ts)
//
// Each `<post>.ts?summary` module is a few bytes of JSON: { widgets: ['quiz', 'slides'], frameworks: ['PACE'] }. Vite watches the post file, so an
// edit refreshes it in dev. The prerender's SSR loader (scripts/blogPrerender.ts) adds this plugin too.

import fs from 'node:fs';
import type { Plugin } from 'vite';

const ID = /\/src\/blog\/posts\/[^/?]+\.ts\?summary$/;

export interface PostSummaryData {
  widgets: string[];
  frameworks: string[];
}

/** Widget kinds in order of first use, and framework names, from a post's source. Plain data files, so a pattern match is enough. */
export function summarizePost(src: string): PostSummaryData {
  const widgets = [...new Set([...src.matchAll(/\bwidget:\s*['"]([A-Za-z]+)['"]/g)].map((m) => m[1] as string))];
  const frameworks = [...src.matchAll(/\btype:\s*['"]framework['"][^{}]{0,240}?\bname:\s*['"]([^'"]+)['"]/g)].map((m) => m[1] as string);
  return { widgets, frameworks };
}

export function blogSummary(): Plugin {
  return {
    name: 'kreators:blog-summary',
    enforce: 'pre',
    load(id) {
      if (!ID.test(id)) return null;
      const file = id.slice(0, id.indexOf('?'));
      this.addWatchFile(file);
      return `export default ${JSON.stringify(summarizePost(fs.readFileSync(file, 'utf8')))};\n`;
    },
  };
}
