import type { Video } from '@kreators/shared';
import { useRef } from 'react';
import { Link } from 'react-router';
import { ChatThread, ChatThreadSkeleton } from '../../components/chat';
import { SectionHead } from '../../components/ui';
import { InteractionChain, type ChainHandle } from '../../components/visuals';
import { INTERACTION_THREAD } from '../../lib/content';

// #interaction (V2-SPEC 5.2 row 5, content §3.1.5): the chain of six, then Bolu asking the four real questions we have filmed, each answered by its real
// video. The thread lights the chain as it plays. A question whose video is not live is dropped; with none left, the chain lights by itself and the
// copy stays. No invented participant words anywhere: the reply is always the video.

const QUESTIONS = INTERACTION_THREAD.map((t) => t.q);

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
/** Brand names compare without spaces, punctuation or a trailing domain ("CircleStore.in" = "Circle Store"). */
const brandKey = (s: string) => norm(s).replace(/\.(in|com|co|io|app|store|shop)$/, '').replace(/[^a-z0-9]/g, '');

/** The pair's video when its seed id is gone: same brand, the first title phrase that matches (in the order listed). */
function findByTitle(videos: Video[], brand: string, titles: string[]): Video | undefined {
  const own = videos.filter((v) => brandKey(v.brand) === brandKey(brand));
  for (const t of titles) {
    const hit = own.find((v) => norm(v.title).includes(norm(t)));
    if (hit) return hit;
  }
  return undefined;
}

export function Interaction({ videos, onOpen }: { videos: Video[] | undefined; onOpen: (v: Video) => void }) {
  const chain = useRef<ChainHandle>(null);
  const pairs = videos ? INTERACTION_THREAD.flatMap(({ q, videoId, alsoIds = [], brand, titles }) => {
    const video = [videoId, ...alsoIds].map((id) => videos.find((v) => v.id === id)).find(Boolean) ?? findByTitle(videos, brand, titles);
    return video ? [{ question: q, video }] : [];
  }) : null;
  // While the library loads, the thread's place shows as a chat already (outlined bubbles) and the chain waits for it; with no pairs at all the chain
  // lights itself.
  const thread = pairs === null || pairs.length > 0;

  return (
    <section id="interaction" className="section interaction-section">
      <div className="wrap">
        <SectionHead
          className="ix-head"
          center={false}
          eyebrow="The interaction"
          title="We engineer the interaction, not the outcome"
          lead="A question that looks good on paper doesn't make a good video by itself. The setup, the person, the follow-up and the edit all count."
        />
        <InteractionChain ref={chain} mode={thread ? 'controlled' : 'auto'} className="ix-chain" label="The interaction, in order" />
        {pairs && pairs.length > 0 && <ChatThread pairs={pairs} chain={chain} onOpen={onOpen} label="Real questions we've filmed" className="ix-thread" />}
        {pairs === null && <ChatThreadSkeleton questions={QUESTIONS} className="ix-thread" />}
        <div className="ix-foot">
          <p className="ix-caption">Real questions we've filmed. The answers are in the videos.</p>
          <Link to="/how-we-work" className="ix-link">
            How we work →
          </Link>
        </div>
      </div>
    </section>
  );
}
