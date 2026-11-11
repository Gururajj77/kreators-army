// The five v1 posts (lib/content.ts POSTS) in the blog's format, so one renderer and one prerender serve them until their rewrites land. A rewrite is
// a file in ./posts named by the same slug; the registry (./registry.ts) then takes the file and drops the entry here. When all five files exist,
// nothing reads POSTS any more: delete it from content.ts, and this file with it (the registry imports LEGACY_POSTS only).

import { POSTS, type Post as V1Post } from '../lib/content';
import type { Block, BlogCategory, Post, PostMeta } from './types';

/** PLAN.md section 2's cluster for each v1 slug, and the two that are their cluster's hub. */
const PLACE: Record<string, { category: BlogCategory; hub?: true }> = {
  'what-is-vox-pop-content': { category: 'Understand', hub: true },
  'how-a-vox-pop-shoot-works': { category: 'Shoot', hub: true },
  'where-to-post-vox-pop-videos': { category: 'Edit and publish' },
  'what-goes-in-a-vox-pop-brief': { category: 'Plan' },
  'eleven-ways-to-vary-a-vox-pop-batch': { category: 'Edit and publish' },
};

/** v1 text is plain: escape the characters the inline markup reads. */
const plain = (s: string) => s.replace(/[\\*_[\]]/g, (c) => `\\${c}`);

const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function toBody(v1: V1Post): Block[] {
  const body: Block[] = [];
  const used = new Set<string>();
  for (const s of v1.sections) {
    if (s.heading) {
      let id = anchor(s.heading) || 'section';
      while (used.has(id)) id = `${id}-2`;
      used.add(id);
      body.push({ type: 'h2', id, text: s.heading });
    }
    body.push(...s.body.map(plain));
    if (s.list) body.push(s.figure === 'mechanisms' ? { type: 'mechanisms' } : { type: 'list', items: s.list.map(plain) });
  }
  if (v1.next) body.push(`[${plain(v1.next.label)}](${v1.next.to})`);
  return body;
}

/** A v1 post has no dates, answer, takeaways, FAQ or sources: those stay empty, and the renderer and the prerender leave their parts out. */
function toPost(v1: V1Post): Post {
  const place = PLACE[v1.slug] ?? { category: 'Understand' as const };
  const meta: PostMeta = {
    slug: v1.slug,
    title: v1.title,
    // v1's Seo appended the site name; kept, so these pages' titles do not change until their rewrites.
    metaTitle: `${v1.title} | Kreators.Army`,
    description: v1.summary,
    primaryQuery: '',
    secondaryQueries: [],
    datePublished: '',
    dateModified: '',
    readingMinutes: 0,
    author: { kind: 'organization', name: 'Kreators.Army' },
    category: place.category,
    tags: [],
    ...(place.hub ? { hub: true } : {}),
  };
  return { meta, answer: '', takeaways: [], body: toBody(v1), faqs: [], sources: [], related: [] };
}

export const LEGACY_POSTS: readonly Post[] = POSTS.map(toPost);
