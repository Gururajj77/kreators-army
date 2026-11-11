import { SITE } from '../../lib/content';
import { GradientTail, LegalPage, type LegalSection } from './Reading';

// content §3.15. The YouTube and wave.video paragraph stays while any embedded player remains in the library: a YouTube-only entry can still publish
// (V2-SPEC C20), so it stays.

const UPDATED = '11 November 2026';

const SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    body: (
      <p>
        When you send the form we receive your name, email address, phone number if you give it, and what you choose to share about your brand and the trial:
        brand name, website, whether you're an agency, the package you're interested in, your answers to the brief, reference links, a brand guide link or file,
        and your message. Once you add an email address or phone number, the form saves your answers as you go, so we receive what you have entered
        even if you stop before sending. We also keep a one-way hash of your IP address to limit abuse of the form.
      </p>
    ),
  },
  {
    heading: 'How we use it',
    body: <p>We use what you send only to reply to you, prepare your trial and discuss your project. We do not sell it.</p>,
  },
  {
    heading: 'Videos',
    body: (
      <>
        <p>
          Videos on this site are streamed from our own server. Some entries link to the same video on Instagram or YouTube; those open on their own sites,
          which handle data under their own policies.
        </p>
        <p>
          Some videos are played through YouTube or wave.video. Those players load from their own services, which may process data under their own privacy
          policies. YouTube videos use its privacy-enhanced mode. Thumbnails for YouTube videos, and video posters hosted elsewhere, load from those services
          when a page shows them.
        </p>
      </>
    ),
  },
  {
    heading: 'Stored in your browser',
    body: (
      <p>
        The site remembers your light or dark mode choice and whether you paused animations in your browser, and stores site files so it loads quickly on later
        visits. It also remembers which brands' videos you have opened in the video library, so their rings show as seen. For the current visit only, it
        also notes whether the home page intro has played. If you start the trial brief and leave, your answers are kept in this browser until you send or
        clear them.
      </p>
    ),
  },
  {
    heading: 'Your choices',
    body: (
      <p>
        To see, correct or delete what you sent us, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    ),
  },
];

const TITLE = 'Privacy Policy';

export default function Privacy() {
  return (
    <LegalPage
      title={TITLE}
      heading={<GradientTail text={TITLE} />}
      description="How Kreators.Army handles the information you share with us."
      updated={UPDATED}
      intro={
        <>
          {SITE.name} is managed and owned by {SITE.owner.name}, Bengaluru, India. This page explains what information this website collects and how it is used.
        </>
      }
      sections={SECTIONS}
    />
  );
}
