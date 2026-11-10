import { ArrowRight } from 'lucide-react';
import { Reveal, Seo, Tile } from '../../components/ui';
import { POSTS, type Post } from '../../lib/content';
import { PostCover, readingTime } from './Reading';

function Story({ post, index, lead }: { post: Post; index: number; lead?: boolean }) {
  return (
    <Tile to={`/blog/${post.slug}`} className={`story h-full ${lead ? 'story-lead' : ''}`}>
      <PostCover index={index} className="story-cover" />
      <div className="story-body">
        {lead && <span className="eyebrow">Start here</span>}
        <h2 className={lead ? 'h2-sm' : 'h3'}>{post.title}</h2>
        <p className={lead ? 'lead' : 'story-summary'}>{post.summary}</p>
        <p className="story-meta small plate-foot">
          <span>{readingTime(post)}</span>
          <span className="story-go">
            Read
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </p>
      </div>
    </Tile>
  );
}

export default function Blog() {
  const [first, ...rest] = POSTS;
  return (
    <div className="blog">
      <Seo title="Blog" description="Notes on vox pop, street interviews and short-form video from Kreators.Army." />
      <div className="ground" aria-hidden />
      <div className="wrap blog-in">
        <header className="blog-mast">
          <h1 className="display">
            Word from the <span className="g-word">street</span>
          </h1>
          <p className="lead">Notes on vox pop, street interviews and short-form video.</p>
        </header>

        <div className="blog-grid">
          {first && (
            <Reveal className="blog-span">
              <Story post={first} index={0} lead />
            </Reveal>
          )}
          {rest.map((post, i) => (
            <Reveal key={post.slug} i={i}>
              <Story post={post} index={i + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
