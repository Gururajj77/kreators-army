import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { Seo, Tile } from '../../components/ui';
import { POSTS } from '../../lib/content';
import { NotFound } from '../../screens/NotFound';
import { PostCover, ReadingProgress, readingTime } from './Reading';

export default function BlogPost() {
  const { slug } = useParams();
  const article = useRef<HTMLElement>(null);
  const index = POSTS.findIndex((p) => p.slug === slug);
  const post = POSTS[index];
  if (!post) return <NotFound />;

  const nextIndex = (index + 1) % POSTS.length;
  const next = POSTS[nextIndex];

  return (
    <>
      <Seo title={post.title} description={post.summary} />
      <ReadingProgress target={article} />
      <article ref={article} className="read">
        <Link to="/blog" className="read-back">
          <ArrowLeft className="size-4" aria-hidden />
          Blog
        </Link>
        <h1 className="h2">{post.title}</h1>
        <p className="read-lead">{post.summary}</p>
        <p className="read-meta small">{readingTime(post)}</p>
        <div className="read-prose read-prose-post">
          {post.sections.map((s, i) => (
            <section key={s.heading ?? i}>
              {s.heading && <h2>{s.heading}</h2>}
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      </article>

      {next && next !== post && (
        <nav className="read-next" aria-label="Next post">
          <Tile to={`/blog/${next.slug}`} className="next-tile">
            <PostCover index={nextIndex} className="next-cover" />
            <div className="next-body">
              <span className="eyebrow">Next post</span>
              <h2 className="h4">{next.title}</h2>
              <p className="m-0 small text-muted">{next.summary}</p>
            </div>
            <ArrowRight className="next-arrow size-5" aria-hidden />
          </Tile>
        </nav>
      )}
    </>
  );
}
