import type { Video } from '@kreators/shared';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Seo } from '../components/ui';
import { useVideoPlayer } from '../components/video';
import { useVideos } from '../lib/queries';
import { Faq } from './home/Faq';
import { Hero } from './home/Hero';
import { Interaction } from './home/Interaction';
import { Pricing } from './home/Pricing';
import { Process } from './home/Process';
import { Testimonials } from './home/Testimonials';
import { WhyUs } from './home/WhyUs';
import { Work } from './home/Work';

// Home (V2-SPEC 5.2). Bands: page (the street), page, alt, dark, page, alt, page, alt, then the footer. One video plays at a time on the whole page:
// the deck's front card, else Reel 1, else the newest thread reply (the video token decides; the player takes it by force).

/** True while any <dialog> is open (the player). Only the `open` attribute is watched. */
function useDialogOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => setOpen(document.querySelector('dialog[open]') !== null);
    const watcher = new MutationObserver(check);
    watcher.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'], childList: true });
    return () => watcher.disconnect();
  }, []);
  return open;
}

export function Home() {
  const { data, isPending, isError, refetch } = useVideos();
  const videos = data ?? [];
  const player = useVideoPlayer(videos);
  const viewing = useDialogOpen();
  const { hash } = useLocation();
  const open = (video: Video) => player.open(video);

  // Sections below the work grid move once the videos arrive, so a link to one of them lands after that.
  useEffect(() => {
    if (!isPending && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, [isPending, hash]);

  return (
    <>
      <Seo description="Street interview (vox pop) videos for D2C brands. We take your question to the street and turn real reactions into short videos for Reels, Shorts and more." />
      <Hero videos={data} onOpen={open} paused={viewing} />
      <Work videos={videos} loading={isPending} failed={isError} onRetry={() => void refetch()} onOpen={open} />
      <WhyUs />
      <Process />
      <Interaction videos={isError ? [] : data} onOpen={open} />
      <Testimonials />
      <Pricing />
      <Faq />
      {player.dialog}
    </>
  );
}
