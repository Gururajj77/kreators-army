import type { PostMeta } from '../types';

// The format example's meta (FORMAT.md). A leading "_" keeps it out of the registry. A real post's meta file looks exactly like this: a type import and
// one default export, nothing else (the blog index loads every meta file).

const meta: PostMeta = {
  slug: 'example-post-format',
  title: 'How to write vox pop questions people actually answer',
  metaTitle: 'Vox pop questions: how to write ones people answer',
  description: 'How to write vox pop questions people stop for: the rules, a worked script, a question builder and a checklist you can take to your next street shoot.',
  primaryQuery: 'vox pop questions',
  secondaryQueries: ['how to write vox pop questions', 'street interview questions for brands', 'vox pop question ideas'],
  datePublished: '2026-11-11',
  dateModified: '2026-11-11',
  readingMinutes: 10,
  author: { kind: 'organization', name: 'Kreators.Army' },
  category: 'Shoot',
  tags: ['questions', 'scripts', 'street interviews'],
  hero: { brand: 'CircleStore', title: 'Guess The Price', nth: 2 },
};

export default meta;
