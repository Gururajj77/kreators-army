import { SITE } from '../../lib/content';
import { LegalPage, type LegalSection } from './Reading';

const UPDATED = '10 November 2026';

const SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    body: <p>When you send the contact form we receive your name, email address, phone number if you give it, the service you selected and your message. We also keep a one-way hash of your IP address to limit abuse of the form.</p>,
  },
  {
    heading: 'How we use it',
    body: <p>We use what you send only to reply to you and to discuss your project. We do not sell it.</p>,
  },
  {
    heading: 'Videos and other services',
    body: (
      <p>
        Some videos are played through YouTube or wave.video. Those players load from their own services, which may process data under their own privacy policies. YouTube videos use its privacy-enhanced mode. Thumbnails for YouTube videos, and video posters hosted elsewhere, load from those services when a page shows them.
      </p>
    ),
  },
  {
    heading: 'Stored in your browser',
    body: <p>The site remembers your light or dark mode choice and whether you paused animations in your browser, and stores site files so it loads quickly on later visits. For the current visit only, it also notes whether the home page intro has played.</p>,
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

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Kreators.Army handles the information you share with us."
      updated={UPDATED}
      intro={
        <>
          {SITE.name} is managed and owned by {SITE.owner.name}. This page explains what information this website collects and how it is used.
        </>
      }
      sections={SECTIONS}
    />
  );
}
