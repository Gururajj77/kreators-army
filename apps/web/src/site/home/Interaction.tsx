import type { Video } from '@kreators/shared';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ChatThread, ChatThreadSkeleton } from '../../components/chat';
import { SectionHead } from '../../components/ui';
import { InteractionChain, type ChainHandle } from '../../components/visuals';
import { resolveThread, THREAD_CAST } from '../../lib/thread';
import { TextArrow } from '../../components/TextArrow';

// #interaction (V2-SPEC 5.2 row 5, content §3.1.5): the chain of six, then the four characters each asking a real question we have filmed, each
// answered by its real video. Every bubble and every answer shows from the start; as the thread comes into view all four questions type out together,
// and the typing lights the chain. A candidate whose video is not live is skipped (lib/thread.ts); with none left, the chain lights by itself and the
// copy stays. No invented participant words anywhere: the reply is always the video.

export function Interaction({ videos, onOpen }: { videos: Video[] | undefined; onOpen: (v: Video) => void }) {
  const chain = useRef<ChainHandle>(null);
  const pairs = useMemo(() => (videos ? resolveThread(videos) : null), [videos]);
  // While the library loads, the thread's place shows the four characters' bubbles with outlined placeholders and the chain waits for it; with no pairs at all the chain
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
        {pairs === null && <ChatThreadSkeleton askers={THREAD_CAST} className="ix-thread" />}
        <div className="ix-foot">
          <p className="ix-caption">Real questions we've filmed. The answers are in the videos.</p>
          <Link to="/how-we-work" className="ix-link">
            How we work<TextArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
