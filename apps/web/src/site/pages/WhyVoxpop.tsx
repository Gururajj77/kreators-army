import type { CSSProperties } from 'react';
import { Character } from '../../cast';
import { Cta, HeroCopy, PrimaryCta, Reveal, SectionHead, Seo } from '../../components/ui';
import { FEATURES, FOUNDER_QUOTE, SERVICES } from '../../lib/content';

// Editorial: left-aligned, photo-led. The photos are the reels' own frames (507 wide), so every full-bleed band is made of several, side by side, at or near
// their real size. One upscaled still would look soft at 1440.

// The band sits behind our own headline, so it uses frames whose burned-in title is only at the top, and `crop` (the share of the frame's height above the
// title's last line) keeps that title above the band at every width (pages-a.css). Frames with a caption lower down (8club, FyndFlow) would read as part of the H2.
const OPENING = [
  { src: '/media/circlestore-1.jpg', crop: 0.185, alt: 'Three people talking on the street in front of a shuttered shop.' },
  { src: '/media/circlestore-3.jpg', crop: 0.205, alt: 'Two people standing on a street corner, smiling as they listen to a question.' },
  { src: '/media/circlestore-2.jpg', crop: 0.15, alt: 'A host in a maroon blazer talking with a group of people on the street.' },
];

// Frames that are in neither the band above nor the spread below, so no photo shows twice within a screen or two. There are five such stills for six
// tiles: BrandingBum is the one repeat, placed where it sits over the spread's words (desktop) or a row away from its photo (phone). The strip shows each
// frame whole, captions and all; no headline sits over them and each tile carries its own label.
const STRIP = [
  { src: '/media/fyndflow.jpg', position: '50% 50%' },
  { src: '/media/8club.jpg', position: '50% 50%' },
  { src: '/media/ansh-mehra.jpg', position: '50% 50%' },
  { src: '/media/brandingbum.jpg', position: '50% 50%' },
  { src: '/media/rode.jpg', position: '50% 50%' },
  { src: '/media/waxys.jpg', position: '50% 50%' },
];

export default function WhyVoxpop() {
  return (
    <>
      <Seo title="Why vox pop" description="Vox pop means voice of the people. Real people answering real questions, built into short-form video." />

      <section className="vp-cover">
        <div className="ground" aria-hidden />
        <div className="wrap vp-cover-in">
          <HeroCopy
            eyebrow="Why vox pop"
            titleClass="display-xl"
            title={
              <>
                The voice of the <span className="g-word">people</span>
              </>
            }
            lead="We capture real people answering questions around your product category, creating natural reactions that feel more engaging than scripted ads."
          >
            <PrimaryCta size="lg" />
          </HeroCopy>
          <div className="vp-host">
            <Character who="bolu" size="clamp(112px, 12vw, 150px)" prop />
          </div>
        </div>
      </section>

      <section className="vp-band" aria-labelledby="vp-stop">
        <div className="vp-band-photos">
          {OPENING.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} loading="lazy" style={{ '--crop': p.crop } as CSSProperties} />
          ))}
        </div>
        <span className="scrim vp-band-scrim" aria-hidden />
        <div className="wrap vp-band-line">
          <h2 id="vp-stop" className="display">
            They skip ads. They stop for people.
          </h2>
        </div>
      </section>

      <section className="section">
        <div className="wrap vp-thesis">
          <Reveal as="p" variant="rise" className="vp-thesis-text">
            People scroll past ads. <b>But they stop when they see real people talking.</b>
          </Reveal>
        </div>
      </section>

      <section className="vp-strip" aria-label="What real people bring">
        <ul className="vp-strip-list">
          {FEATURES.map((f, i) => {
            const p = STRIP[i % STRIP.length] ?? STRIP[0];
            return (
              <Reveal as="li" key={f} i={i} className="vp-strip-item">
                <img src={p?.src} alt="" loading="lazy" style={{ objectPosition: p?.position }} />
                <span className="scrim" aria-hidden />
                <p className="h4 vp-strip-line">{f}</p>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className="band-dark vp-spread">
        <div className="vp-spread-photo">
          <img src="/media/brandingbum.jpg" alt="Three people on the street, one holding a gift box up to camera." loading="lazy" />
        </div>
        <div className="vp-spread-copy">
          <SectionHead center={false} size="h2" title="Best with a product in hand" lead="Voxpop works best for brands with physical products because real people can interact with the product and share honest reactions on camera." />
          <Reveal as="blockquote" className="vp-quote">
            <p>“{FOUNDER_QUOTE.quote}”</p>
            <footer>{FOUNDER_QUOTE.who}</footer>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap vp-feeds">
          <div className="vp-feeds-head">
            <SectionHead center={false} title="Made for every feed" />
            <Reveal className="vp-feeds-action">
              <Cta to="/video-library" kind="ghost" arrow>
                See the reactions
              </Cta>
            </Reveal>
          </div>
          <ul className="vp-feeds-list">
            {SERVICES.map((s, i) => (
              <Reveal as="li" key={s.name} i={i}>
                <h3 className="h3">{s.name}</h3>
                <p className="text-muted">{s.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
