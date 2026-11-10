import type { Video } from '@kreators/shared';
import { useRef } from 'react';
import { Link } from 'react-router';
import { ChatThread } from '../../components/chat';
import { SectionHead } from '../../components/ui';
import { InteractionChain, type ChainHandle } from '../../components/visuals';
import { INTERACTION_THREAD } from '../../lib/content';

// #interaction (V2-SPEC 5.2 row 5, content §3.1.5): the chain of six, then Bolu asking the four real questions we have filmed, each answered by its real
// video. The thread lights the chain as it plays. A question whose video is not live is dropped; with none left, the chain lights by itself and the
// copy stays. No invented participant words anywhere: the reply is always the video.

export function Interaction({ videos, onOpen }: { videos: Video[] | undefined; onOpen: (v: Video) => void }) {
  const chain = useRef<ChainHandle>(null);
  const pairs = videos ? INTERACTION_THREAD.flatMap(({ q, videoId }) => {
    const video = videos.find((v) => v.id === videoId);
    return video ? [{ question: q, video }] : [];
  }) : null;
  // While the library loads, the chain waits for the thread; with no pairs at all it lights itself.
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
        {pairs === null && <div className="ix-thread-wait" aria-hidden />}
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
