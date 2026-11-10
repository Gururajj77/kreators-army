import type { Video } from '@kreators/shared';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { FaqSection } from '../components/FaqItem';
import { Seo } from '../components/ui';
import { useVideoPlayer } from '../components/video';
import { useVideos } from '../lib/queries';
import { Hero } from './home/Hero';
import { Pricing } from './home/Pricing';
import { Process } from './home/Process';
import { Testimonials } from './home/Testimonials';
import { WhyUs } from './home/WhyUs';
import { Work } from './home/Work';

export function Home() {
  const { data: videos = [], isPending, isError, refetch } = useVideos();
  const player = useVideoPlayer(videos);
  const { hash } = useLocation();

  // The reels rest while the player is open. The dialog is the player's own, so this just watches for it to go.
  const [viewing, setViewing] = useState(false);
  const open = (video: Video) => {
    setViewing(true);
    player.open(video);
  };
  useEffect(() => {
    if (!viewing) return;
    const check = setInterval(() => {
      if (!document.querySelector('dialog[open]')) setViewing(false);
    }, 400);
    return () => clearInterval(check);
  }, [viewing]);

  // Sections below the work grid move once the videos arrive, so a link to one of them lands after that.
  useEffect(() => {
    if (!isPending && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, [isPending, hash]);

  return (
    <>
      <Seo description="Tired of scripted influencer content? Voxpop video production for D2C brands. Street interview videos designed for Instagram Reels, YouTube Shorts, and TikTok to create authentic engagement." />
      <Hero videos={videos} onOpen={open} paused={viewing} />
      <Work videos={videos} loading={isPending} failed={isError} onRetry={() => void refetch()} onOpen={open} paused={viewing} />
      <WhyUs />
      <Process />
      <Testimonials />
      <Pricing />
      <FaqSection />
      {player.dialog}
    </>
  );
}
