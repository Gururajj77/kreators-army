import { useEffect, useRef, type CSSProperties } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { Street } from '../../components/street';
import { Cta, HeroCopy, PrimaryCta, Reveal, SectionHead, Seo, whenSeen } from '../../components/ui';
import { FEATURES, FOUNDER_QUOTE, STILLS, type Still } from '../../lib/content';
import { PlatformStrip } from '../home/Platforms';

// Editorial: left-aligned, photo-led (V2-SPEC 5.8, visual §2.8). The hero's right side is the street in a 28-radius plate with Bolu holding the mic out.
// The photos are the reels' own frames (507 wide), so every full-bleed band is made of several, side by side, at or near their real size.

// The band sits behind our own headline, so it uses frames whose burned-in title is only at the top, and `crop` (the share of the frame's height above
// the title's last line) keeps that title above the band at every width (pages-a.css).
const OPENING: Still[] = [STILLS.streetTrio, STILLS.streetCorner, STILLS.hostGroup];

// Frames that are in neither the band above nor the spread below, so no photo shows twice within a screen or two. BrandingBum is the one repeat, placed
// where it sits over the spread's words (desktop) or a row away from its photo (phone). Each tile carries its own label.
const STRIP: Still[] = [STILLS.fyndflow, STILLS.eightClub, STILLS.anshMehra, STILLS.giftBox, STILLS.rode, STILLS.waxys];

/** Bolu on the street, mic out, says the band's line once the plate is in view. */
function StreetPlate() {
  const bolu = useRef<CharacterHandle>(null);
  const plate = useRef<HTMLDivElement>(null);
  const cast = useCastLine();
  const { say } = cast;
  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    let t = 0;
    const stop = whenSeen(el, () => {
      t = window.setTimeout(() => void say('whyVoxpop.hero', { by: bolu.current }), 700);
    });
    return () => {
      stop();
      window.clearTimeout(t);
    };
  }, [say]);
  return (
    <div ref={plate} className="vp-street" data-bubble-bounds="">
      <Street variant="band" height="300px">
        <Character ref={bolu} who="bolu" size="clamp(112px, 12vw, 150px)" prop className="vp-bolu">
          <CastBubble {...cast.bubble('whyVoxpop.hero')} side="end" />
        </Character>
      </Street>
    </div>
  );
}

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
          <StreetPlate />
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
          <SectionHead
            center={false}
            as="h2"
            className="vp-thesis-head"
            scrub
            title={
              <>
                <span className="sr-only">People scroll past ads. But they stop when they see real people talking.</span>
                <span aria-hidden className="vp-thesis-text" style={{ '--words': 13 } as CSSProperties}>
                  {'People scroll past ads.'.split(' ').map((w, i) => (
                    <span key={i} className="scrub-word" style={{ '--w': i } as CSSProperties}>
                      {w}{' '}
                    </span>
                  ))}
                  <b>
                    {'But they stop when they see real people talking.'.split(' ').map((w, i, all) => (
                      <span key={i} className="scrub-word" style={{ '--w': i + 4 } as CSSProperties}>
                        {w}
                        {i < all.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </b>
                </span>
              </>
            }
          />
        </div>
      </section>

      <section className="vp-strip" aria-label="What real people bring">
        <ul className="vp-strip-list">
          {FEATURES.map((f, i) => {
            const p = STRIP[i % STRIP.length] ?? STILLS.fyndflow;
            return (
              <Reveal as="li" key={f} i={i} className="vp-strip-item">
                <img src={p.src} alt="" loading="lazy" style={{ objectPosition: p.position }} />
                <span className="scrim" aria-hidden />
                <p className="h4 vp-strip-line">{f}</p>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className="band-dark vp-spread">
        <div className="vp-spread-photo">
          <img src={STILLS.giftBox.src} alt={STILLS.giftBox.alt} loading="lazy" />
        </div>
        <div className="vp-spread-copy">
          <SectionHead center={false} size="h2" title="Best with a product in hand" lead="Vox pop works best for brands with physical products, because real people can try the product and share honest reactions on camera." />
          <Reveal as="p" className="vp-spread-line">
            Your product can be part of the conversation. We just won't force a brand pitch onto a stranger.
          </Reveal>
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
          <PlatformStrip className="vp-platforms" />
        </div>
      </section>
    </>
  );
}
