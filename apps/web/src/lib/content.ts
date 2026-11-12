// Everything the site says about Kreators.Army that more than one page uses. The words come from .work/v2/content.md, verbatim; change them here and every
// page follows. Wording that one page uses alone stays in that page's file. The founder's open questions each have one default here (V2-SPEC 1.5):
// ARMY_SENTENCE, STREET_SCENE, SITE.phones, SITE.email, BRANDS, BRAND_GUIDE_UPLOAD. Changing one of those is a one-line edit.

import { quoteBatch } from '@kreators/shared';

// ---------- The site, its people and how to reach them ----------

export interface Phone {
  /** As printed: '+91 90191 71505'. */
  display: string;
  /** For tel: links: '+919019171505'. */
  tel: string;
  /** This number takes WhatsApp (the footer and Contact show it as WhatsApp). */
  whatsapp: boolean;
  /** Shown on Contact only, never in the footer. */
  contactOnly: boolean;
}

export const SITE = {
  name: 'Kreators.Army',
  email: 'kreatorsarmy@gmail.com',
  /** Terms only: the proprietor's address for agreements and invoices (D4). */
  legalEmail: 'brandingbum@gmail.com',
  /**
   * D3. Delete an entry and it disappears everywhere (whatsappHref returns null without a WhatsApp line). The founder's one number takes
   * both WhatsApp and calls, so it is shown once, as "WhatsApp / Call".
   */
  phones: [{ display: '+91 90191 71505', tel: '+919019171505', whatsapp: true, contactOnly: false }] as Phone[],
  city: 'Bengaluru, India',
  owner: { name: 'BrandingBum', url: 'https://brandingbum.com/' },
  operatorLine: 'Managed and owned by BrandingBum, Bengaluru.',
  /** Live-site claim, kept (D6). */
  rating: { creators: '500+ Creators', score: '5/5 (440)' },
};

/** The WhatsApp line, or undefined when the founder has removed it. */
export const whatsappPhone = (): Phone | undefined => SITE.phones.find((p) => p.whatsapp);

/** The number to call where there is room for one (footer, FAQ, the form's thanks): the first not kept for Contact only. */
export const callPhone = (): Phone | undefined => SITE.phones.find((p) => !p.contactOnly);

export type FormatSlug = 'founders' | 'events' | 'retail';
const FORMAT_NAME: Record<FormatSlug, string> = { founders: 'Founders', events: 'Events', retail: 'Retail' };

/** A wa.me link with content §6.3's message, naming the format on a format page. Null when no number takes WhatsApp. Open it in a new tab, rel="noreferrer". */
export function whatsappHref(format?: FormatSlug): string | null {
  const phone = whatsappPhone();
  if (!phone) return null;
  const text = format ? `Hi Kreators.Army, I'd like to ask about a trial video for ${FORMAT_NAME[format]}.` : "Hi Kreators.Army, I'd like to ask about a trial video.";
  return `https://wa.me/${phone.tel.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

// ---------- The one primary action ----------

/** The one primary action, everywhere: same words, same red (content §6.1). Never "free". */
export const PRIMARY_ACTION = { label: 'Request a trial video', to: '/contact' } as const;

/** What the visitor already told us, carried to the form in the URL (content §2). */
export interface ContactIntent {
  package?: '5' | '10' | '20' | 'more';
  /** From the calculator: any whole number of videos. */
  videos?: number;
  brands?: number;
  format?: FormatSlug;
  /** Opens the form in question mode. */
  topic?: 'question';
}

/**
 * /contact with the intent in the URL: ?package=10, ?videos=25&brands=2, ?format=founders, ?topic=question. v1's ?plan=startups|d2c links still
 * prefill (the form reads them as packages 5 and 10); nothing on the site writes them any more.
 */
export function contactHref(it?: ContactIntent): string {
  if (!it) return PRIMARY_ACTION.to;
  const q = new URLSearchParams();
  if (it.package) q.set('package', it.package);
  if (it.videos !== undefined && Number.isInteger(it.videos) && it.videos > 0) q.set('videos', String(it.videos));
  if (it.brands !== undefined && Number.isInteger(it.brands) && it.brands > 0) q.set('brands', String(it.brands));
  if (it.format) q.set('format', it.format);
  if (it.topic) q.set('topic', it.topic);
  const s = q.toString();
  return s ? `${PRIMARY_ACTION.to}?${s}` : PRIMARY_ACTION.to;
}

/** Pages with their own one action (the form, the email for applicants, the admin): no phone action bar, no footer ask. */
export const OWN_ACTION_ROUTES: readonly string[] = ['/contact', '/contact-us', '/careers', '/admin'];

/** The footer ask (content §1.3). Hidden on OWN_ACTION_ROUTES, legal pages and the 404; the secondary is hidden on /video-library. */
export const CLOSING = {
  eyebrow: 'Get started',
  title: 'Start your vox pop journey',
  body: 'See the format on your own brand first. Scope, the number of trial videos and any fee are confirmed in writing.',
  secondary: 'Browse video library',
};

export const SOCIALS = [
  { label: 'Instagram', url: 'https://www.instagram.com/kreatorsdotagency' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/brandingbum' },
  { label: 'X', url: 'https://x.com/brandingbum' },
];

/** Each brand's one logo, keyed by its one exact name (the founder: one name per brand, no variants). Official marks, 256 px squares
 * (sources in .work/v2/logos/mapping.json). A brand not listed here, or spelled differently in the video rows, gets the letter disc. */
export const BRAND_LOGOS: Record<string, string> = {
  FyndFlow: '/logos/fyndflow.jpg',
  Offlyn: '/logos/offlyn.jpg',
  Waxys: '/logos/waxys.jpg',
  BreadBerry: '/logos/breadberry.jpg',
  Clotrio: '/logos/clotrio.jpg',
  Hackdaily: '/logos/hackdaily.jpg',
  Orgaheal: '/logos/orgaheal.jpg',
  CircleStore: '/logos/circlestore.jpg',
  '8Club': '/logos/8club.jpg',
  Rode: '/logos/rode.jpg',
  'Ansh Mehra': '/logos/ansh-mehra.jpg',
};

/** "Trusted by". Hackdaily is not added until the founder confirms it (D5). */
export const BRANDS: { name: string; logo?: string }[] = ['FyndFlow', 'CircleStore', 'Waxys', 'Rode', 'BrandingBum', 'Ansh Mehra', '8Club'].map((name) => ({
  name,
  logo: BRAND_LOGOS[name],
}));

export const brandLogo = (name: string): string | undefined => BRAND_LOGOS[name];

// ---------- Track record (live-site claims, kept with "Past results, not a promise.", D6) ----------

export interface Stat {
  end: number;
  suffix: string;
  label: string;
}

export const IMPACT: Stat[] = [
  { end: 100, suffix: 'M+', label: 'Views' },
  { end: 250, suffix: 'K+', label: 'Followers' },
  { end: 280, suffix: '%', label: 'Engagement' },
];

export const TEAM: Stat[] = [
  { end: 10, suffix: '+', label: 'Creative professionals' },
  { end: 100, suffix: '+', label: 'Projects completed' },
  { end: 99, suffix: '%', label: 'Client satisfaction' },
];

/** Beside every result the site shows (content §2.8). `short` for tight spots such as a stat tile caption. */
export const RESULTS_NOTE = {
  long: 'These are past results from our work. How a video does also depends on the platform, the audience, your account history, ad spend, the offer and how it gets shared. So we never promise views.',
  short: 'Past results, not a promise.',
};

export const FEATURES = ['Authentic reactions', 'Native feed content', 'Natural conversations', 'Built for attention', 'Content people trust', 'Short-form ready'];

/** The platform strip (content §2.7). */
export const PLATFORMS = [
  { name: 'Instagram Reels', body: 'Street interviews cut for Reels, with captions and pacing made for the feed.' },
  { name: 'YouTube Shorts', body: 'Vertical cuts sized and paced for Shorts.' },
  { name: 'Facebook Reels', body: "The same batch, ready for Facebook's Reels." },
  { name: 'Snapchat Spotlight', body: 'Short, vertical cuts for Spotlight.' },
];

/** The strip's two-tone heading: `strong` in ink, `rest` muted. */
export const PLATFORMS_HEAD = { strong: 'Vox pop as a service for brands.', rest: 'One shoot, cut for every short-form feed your customers already watch.' };

// ---------- The journey and the pilot ----------

/** Five steps, trial to batch (content §2.4). Home How it works, Why Kreators, Contact. */
export const JOURNEY = [
  { name: 'Send the brief', body: 'Tell us your goal, how your brand should show up and what every video must include.' },
  { name: 'The trial', body: 'We make a short trial on your brand, so you can see the format before you commit. Scope, the number of videos and any fee are confirmed in writing.' },
  { name: 'Feedback and a package', body: 'Send all your feedback through one contact. Then pick a 5, 10 or 20 video package for one brand.' },
  { name: 'Prepay and plan', body: 'Sign the pilot agreement and pay for the package up front. Before each shoot, we lock the goal, products, audience and must-haves.' },
  { name: 'Shoot, edit, deliver', body: 'We make the batch in one planned cycle, with check-ins where useful. Minor edits are included. Usage rights pass to you on full payment.' },
];

/** After the trial: the paid pilot, seven steps (content §2.5). /trial#after. */
export const PILOT_STEPS = [
  { name: 'Trial review', body: 'We share the trial videos for you to review.' },
  { name: 'Consolidated feedback', body: 'You send feedback through one main contact. Edit changes follow our rules on revisions.' },
  { name: 'Package selection', body: 'You choose a 5, 10 or 20 video package for a single brand.' },
  { name: 'Pilot agreement and prepayment', body: 'We sign a pilot agreement and send an invoice. You pay the full package fee up front. Work starts when the payment arrives.' },
  { name: 'Pre-production alignment', body: 'Before each shoot, we lock the goal, products, audience, message and must-haves. Your brief is where we start.' },
  { name: 'Shoot, edit and delivery', body: 'We make the agreed batch in one planned cycle, with check-ins where useful. Minor edits are included.' },
  { name: 'Usage rights', body: 'The rights to use the final videos pass to you on full payment, on the terms of the pilot agreement.' },
];

/** Always under the pilot steps, outside any animation. */
export const PILOT_FOOTNOTE = 'We confirm delivery dates in the pilot agreement, once planning for the shoot is done.';

// ---------- Packages and pricing (content §2.1 to §2.3, §3.4, §4) ----------

export const PACKAGES = [
  { videos: 5, fee: 50000, perVideo: 10000, name: '5 video package', line: 'A first batch to put the format to work.' },
  { videos: 10, fee: 85000, perVideo: 8500, name: '10 video package', line: 'More room for creative variety across the batch.' },
  { videos: 20, fee: 150000, perVideo: 7500, name: '20 video package', line: 'The lowest rate per video of the three.' },
] as const;

export type Package = (typeof PACKAGES)[number];

/** Beyond 20 videos: blocks of 5. */
export const ADD_ON = { blockOf: 5, fee: 35000, perVideo: 7000, after: 20 } as const;

/** The calculator's rule, exactly as content §4 (shared pricing.ts does the sums; total = fee × brands is the caller's). */
export const quote = (n: number) => quoteBatch(n, { PACKAGES, ADD_ON });

/** Every package includes the same things (content §2.2). Home shows the first five on phones. */
export const PACKAGE_INCLUDES = [
  'Ideas, questions and moments planned around your goal',
  'Creative variety across the batch, not one question repeated',
  'An interviewer, the right people and direction on the street',
  'A street shoot with pro framing and sound',
  'Editing for short-form: strong openings, tight pacing, captions, clean endings',
  'Planning together before each shoot',
  'Check-ins where useful',
  'Minor edit changes',
  'Vertical videos ready for Reels, Shorts and other short-form feeds',
  'Usage rights on full payment',
];

/**
 * The six lines that sit with every full price table (content §2.3). Each `title` is the bold lead-in exactly as written, punctuation included, and runs
 * into its `body`: render `<strong>{title}</strong> {body}`.
 */
export const PRICING_RULES = [
  { title: 'One brand per package.', body: "You can't combine, pool or split packages across brands. That goes for agencies too: each brand needs its own package." },
  { title: 'Beyond 20 videos,', body: 'add blocks of 5 at ₹35,000 a block (₹7,000 a video).' },
  { title: 'Quantities in between', body: 'the packages are quoted in writing before work begins.' },
  { title: 'Taxes:', body: 'GST and any other taxes that apply are extra.' },
  { title: 'Fully prepaid:', body: 'you pay the whole package fee up front, before planning starts.' },
  { title: 'Usage rights', body: 'for the final videos pass to you on full payment.' },
];

/** How payment works, four steps (content §3.4 #payment). */
export const PAYMENT_STEPS = [
  'You confirm the package and sign the pilot agreement.',
  'We send an invoice.',
  'You pay the full package fee up front, before planning or filming starts.',
  'Work starts when the payment arrives.',
];

/** The box under the payment steps. */
export const LATE_PAYMENT = {
  title: 'If a payment is late or partial',
  lines: ['Work may be paused', 'We may hold back edited videos or raw footage', 'Usage rights stay on hold'],
};

// ---------- The creative system (content §2.6) ----------

export const WE_CONTROL = [
  'The objective and creative direction',
  'How the idea and question are framed',
  'How we approach people',
  'How each moment is set up',
  'The interviewer and follow-up questions',
  'Direction on the street',
  'Who we pick to interview',
  'The edit, the pace and the final look',
];

export const WE_CANNOT = 'Exactly how a stranger will respond in the moment.';

/** The interaction chain, in order. */
export const INTERACTION = ['Setup', 'Question', 'Participant', 'Follow-up', 'Reaction', 'Edit'];

export const MECHANISMS = [
  'Guessing and reveals',
  'A/B comparisons',
  'Challenges',
  'Rankings',
  'Debates and opposing opinions',
  'Personal experiences',
  'Product reactions',
  'Humour and playful interactions',
  'Unexpected questions',
  'Audience participation',
  'Different follow-up structures',
] as const;

export type Mechanism = (typeof MECHANISMS)[number];

/** The four example cards beside the chain; `mechanism` names the demo each card plays (visual §2.2). */
export const INTERACTION_EXAMPLES: { text: string; mechanism: Mechanism }[] = [
  { text: 'A prediction creates curiosity.', mechanism: 'Guessing and reveals' },
  { text: 'An A/B choice creates debate.', mechanism: 'A/B comparisons' },
  { text: 'An unexpected challenge creates humour.', mechanism: 'Challenges' },
  { text: 'A reveal creates surprise.', mechanism: 'Guessing and reveals' },
];

export const VIDEO_JOBS = ['Create curiosity', 'Address a specific problem', 'Generate product interest', 'Demonstrate a benefit', 'Build social proof', 'Drive consideration'];

export const EDIT_PRIORITIES = ['Strong opening moments', 'No dead air or repeats', 'Clear context', 'Tight storytelling', 'Strong reaction moments', 'The right pace', 'Clean endings'];

export const QUALITY = ['Framing', 'Audio', 'Camera positioning', 'Lighting where possible', 'Participant presentation', 'Background distractions', 'Overall composition'];

export const LOCK_LIST = [
  'Main goal',
  'Product or products to feature',
  'Who the videos are for',
  'Core message or main selling point',
  'How you want viewers to react',
  'Brand and product facts we must get right',
  'Must-haves',
  'Things to avoid',
  'Any special shoot needs',
];

/** The creative loop; the last step arrows back to the first. */
export const LOOP = ['Hypothesis', 'Interaction', 'Production', 'Edit', 'Learn', 'Improve'];

/**
 * Home #interaction: real filmed questions, each answered by its real video, as an ordered list of candidates. The thread shows the first four that
 * match a live video (lib/thread.ts), asked in display order by Bolu, Tiko, Sochu and Gola; a candidate with no live video is skipped, and no video
 * answers twice. Each finds its video by id first, then by the live re-imported ids (alsoIds), then by brand and a title phrase, in the order listed
 * (so a re-import under a new id, e.g. from the admin CSV, still answers it). Brands match loosely: "Ansh" finds "Ansh Mehra". The `fallback` ones
 * are phrased straight from a live "X Vs Y" title and fill in only when the first four are not all live; the Founders page shows the others only.
 */
export const INTERACTION_THREAD: { q: string; videoId?: string; alsoIds?: string[]; brand: string; titles: string[]; fallback?: true }[] = [
  { q: 'New phone or a Goa trip?', videoId: 'seed-circlestore-2', alsoIds: ['70eee17b-a646-4e82-996e-1826a076544b'], brand: 'CircleStore', titles: ['goa'] },
  { q: "Hot take on Valentine's Day?", videoId: 'seed-brandingbum', brand: 'BrandingBum', titles: ['valentine'] },
  { q: 'Worst thing you ever bought second-hand?', videoId: 'seed-circlestore-1', alsoIds: ['6c83cda2-0905-466b-b504-b3779374263d'], brand: 'CircleStore', titles: ['bad second hand', 'bad second-hand', 'worst'] },
  { q: 'What does AI change about design?', videoId: 'seed-ansh-mehra', brand: 'Ansh Mehra', titles: ['ai and design', 'ai & design', 'design'] },
  { q: 'Salt or sweet?', brand: 'BreadBerry', titles: ['salt vs sweet'], fallback: true },
  { q: 'Plant protein or whey?', brand: 'Orgaheal', titles: ['plant vs whey'], fallback: true },
  { q: 'Branded or unbranded?', brand: 'CircleStore', titles: ['branded vs unbranded'], fallback: true },
];

// ---------- Testimonials ----------

export const TESTIMONIALS = [
  { metric: '100x', unit: 'Views', quote: 'We tried vox pop videos and they perform way better than our usual content.', who: 'D2C Founder' },
  { metric: '500K+', unit: 'Followers', quote: 'The videos feel natural. People actually stop and watch instead of scrolling past.', who: 'Marketing Lead' },
  { metric: '150%', unit: 'Engagement', quote: 'Honestly surprised by the engagement. The reactions make the content feel real.', who: 'Brand Manager' },
  { metric: '200K+', unit: 'Subscribers', quote: 'This format works well for social. It feels more like a conversation than an ad.', who: 'Content Lead' },
  { metric: '80x', unit: 'Reach', quote: 'Our videos started reaching new audiences once we switched to this style.', who: 'Startup CMO' },
  { metric: '1M+', unit: 'Views', quote: 'People love seeing real reactions. Our videos now just feel more intriguing.', who: 'Growth Head' },
];

export const FOUNDER_QUOTE = { quote: 'Our engagement rates multiplied and connected with the right audience without feeling salesy.', who: 'Founder of Startup' };

// ---------- FAQ (content §7.1): 25 questions in five groups, every v1 slug kept ----------

export const FAQ_GROUPS = [
  { label: 'The format', id: 'the-format' },
  { label: 'The trial', id: 'the-trial' },
  { label: 'Packages and pricing', id: 'packages-and-pricing' },
  { label: 'Production', id: 'production' },
  { label: 'Rights and results', id: 'rights-and-results' },
] as const;

export type FaqGroup = (typeof FAQ_GROUPS)[number]['label'];

export interface Faq {
  slug: string;
  group: FaqGroup;
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    slug: 'what-is-voxpop-content',
    group: 'The format',
    q: 'What is vox pop content?',
    a: 'Vox pop means "voice of the people". We take a question to the street, real people answer on camera, and we build the strongest reactions into short videos. The answers aren\'t scripted, and that\'s what makes the format work.',
  },
  {
    slug: 'will-this-work-for-my-brand',
    group: 'The format',
    q: 'Will this format work for my brand?',
    a: 'It works best for brands with physical products, because real people can try the product and react honestly on camera. Got several products? We can plan the batch across them, with one main goal per video.',
  },
  {
    slug: 'are-the-answers-scripted',
    group: 'The format',
    q: 'Are the answers scripted?',
    a: "No. We plan the objective, the questions, the setup and who we approach, but we don't script what strangers say. Your product can be part of the conversation; we just won't force a set brand pitch onto someone.",
  },
  {
    slug: 'who-asks-the-questions',
    group: 'The format',
    q: 'Who asks the questions?',
    a: "Our interviewer, or your founder if you'd like them on camera, with our team beside them. When the interviewer speaks for your brand, we agree how they introduce themselves before the shoot. That way, it's clear who they're speaking for.",
  },
  {
    slug: 'do-participants-get-anything',
    group: 'The format',
    q: 'Do the people you interview get anything?',
    a: 'Sometimes. A small thank-you helps people stop and spend time with us. It works best as something they can hold or use on the spot. It never decides what they say. We agree the exact gift before the shoot.',
  },
  {
    slug: 'is-the-trial-free',
    group: 'The trial',
    q: 'Is the trial free?',
    a: "The trial's scope, the number of trial videos and any trial fee are confirmed in writing between us. Ask us about a trial for your brand and we'll set it out.",
  },
  {
    slug: 'how-does-the-trial-work',
    group: 'The trial',
    q: 'How does the trial work?',
    a: 'You complete a short brief, we make the trial on your brand, and you review it. Nothing in the trial commits either of us to a paid pilot.',
  },
  {
    slug: 'what-do-you-need-for-the-trial',
    group: 'The trial',
    q: 'What do you need from me for the trial?',
    a: 'The brief. It covers your goal, how much the brand should show, what every video must include, and what viewers should think, feel or do. Add a simple brand guide and 3 to 5 reference videos. The request form walks you through it.',
  },
  {
    slug: 'can-i-post-the-trial-video',
    group: 'The trial',
    q: 'Can I post the trial video?',
    a: "No. Trial videos are for review only. They can't be posted, boosted, used in ads, reused or sublicensed unless a paid project is confirmed in writing. If we don't go ahead, unposted trial videos stay unused. Anything already posted must come down if we ask.",
  },
  {
    slug: 'how-much-does-it-cost',
    group: 'Packages and pricing',
    q: 'How much do the videos cost?',
    a: '5 videos for ₹50,000 (₹10,000 each), 10 for ₹85,000 (₹8,500 each), or 20 for ₹1,50,000 (₹7,500 each). Beyond 20, add blocks of 5 at ₹35,000 a block. GST is extra where it applies.',
  },
  {
    slug: 'is-this-a-monthly-plan',
    group: 'Packages and pricing',
    q: 'Is it a monthly plan?',
    a: 'No. You pay per package: one batch of videos for one brand, paid in full in advance.',
  },
  {
    slug: 'can-i-order-a-different-number',
    group: 'Packages and pricing',
    q: 'Can I order 7 or 15 videos?',
    a: 'We quote any number between the packages in writing before work begins. Beyond 20, you add videos in blocks of 5.',
  },
  {
    slug: 'can-an-agency-split-a-package',
    group: 'Packages and pricing',
    q: 'Can an agency split a package across brands?',
    a: "No. Each package is for one brand, and packages can't be combined, pooled or split, including for agencies working with several brands. Each brand needs its own package.",
  },
  {
    slug: 'are-taxes-included',
    group: 'Packages and pricing',
    q: 'Are taxes included?',
    a: "No. Fees don't include taxes. GST is added where it applies.",
  },
  {
    slug: 'how-does-payment-work',
    group: 'Packages and pricing',
    q: 'How does payment work?',
    a: 'Everything is prepaid. When you confirm the package and sign the pilot agreement, we send an invoice. You pay the full fee up front, and work starts when the payment arrives. If a payment is late or partial, work may pause, delivery may be held and usage rights stay on hold. Refund and delivery guarantee terms are in the pilot agreement.',
  },
  {
    slug: 'how-long-does-production-take',
    group: 'Production',
    q: 'How long does it take?',
    a: 'We confirm delivery dates in the pilot agreement, once planning for the shoot is done. Then we make the agreed batch in one planned cycle, not one video at a time.',
  },
  {
    slug: 'do-you-handle-the-shoot',
    group: 'Production',
    q: 'Do you handle the shoot as well as the edit?',
    a: 'Yes. We plan the ideas and questions, pick and approach the people, run the interviews and direct on the street. Then we shoot and edit.',
  },
  {
    slug: 'can-i-request-revisions',
    group: 'Production',
    q: 'Can I request revisions?',
    a: 'Yes. Minor edit changes are included, such as text, trims, clip order and captions. Bigger changes are discussed separately first. That means a whole new idea, format or setup, new footage or a reshoot. Please send feedback through one main contact.',
  },
  {
    slug: 'can-we-change-direction-after-the-shoot',
    group: 'Production',
    q: 'What if we change direction after the shoot?',
    a: "It's best to lock the creative direction, branding and must-haves before filming. New asks after the shoot may need extra editing, changed deliverables, or a reshoot if they need footage we didn't film.",
  },
  {
    slug: 'how-long-is-each-video',
    group: 'Production',
    q: 'How long is each video?',
    a: "As tight as the story allows. Every video is made for short-form viewing, but we won't cut to a fixed length if that loses the context or payoff that makes the interaction work.",
  },
  {
    slug: 'will-every-video-look-different',
    group: 'Production',
    q: 'Will every video look different?',
    a: 'Each video gets its own mechanism, such as a reveal, an A/B comparison or a challenge. The look changes too, with new people, backdrops, framing and places. We shoot in batches, so we agree any special place or big prop before the shoot.',
  },
  {
    slug: 'where-can-i-use-the-videos',
    group: 'Rights and results',
    q: 'Where can I use the videos?',
    a: 'On your own brand channels, across Instagram, YouTube Shorts and other platforms, including ads, on the terms of your pilot agreement. Usage rights transfer on full payment.',
  },
  {
    slug: 'do-i-post-on-your-channel',
    group: 'Rights and results',
    q: 'Do I need to post on your channel?',
    a: 'No. The videos are delivered to you, so they become long-term content assets for your own brand channels.',
  },
  {
    slug: 'do-you-guarantee-views',
    group: 'Rights and results',
    q: 'Do you guarantee views or sales?',
    a: "No. We build every video to grab attention, keep people watching and serve your goal. But results also hang on things we don't control. That means the platform, the people who see it, your account history, ad spend, the offer and how it gets shared. So we can't guarantee results. That covers views, virality, reach and engagement. It also covers sales, conversions, cost per customer and return on ad spend.",
  },
  {
    slug: 'will-you-keep-our-information-confidential',
    group: 'Rights and results',
    q: 'Will you keep our information confidential?',
    a: 'Yes. Our agreements keep non-public information private on both sides. That lasts for five years after our work together ends.',
  },
];

export const faqBySlug = (slug: string) => FAQS.find((f) => f.slug === slug);

/** Home #faq, as a chat (content §3.1 section 8). */
export const HOME_FAQ_SLUGS = ['is-the-trial-free', 'how-much-does-it-cost', 'is-this-a-monthly-plan', 'how-long-does-production-take', 'can-i-request-revisions', 'do-you-guarantee-views'];
/** Home #pricing's four objection links. */
export const OBJECTION_SLUGS = ['is-the-trial-free', 'can-an-agency-split-a-package', 'how-does-payment-work', 'where-can-i-use-the-videos'];
/** /pricing's four question links. */
export const PRICING_FAQ_SLUGS = ['is-this-a-monthly-plan', 'can-i-order-a-different-number', 'can-an-agency-split-a-package', 'are-taxes-included'];

// ---------- Format pages ----------

export interface FormatPageContent {
  path: string;
  eyebrow: string;
  title: [string, string, string];
  lead: string;
  whyTitle: [string, string];
  whyBody: string;
  cardsTitle: string;
  cards: { name: string; body: string }[];
  metaDescription: string;
  /** Videos that belong to this format, in order. Empty, or ids that are not live, falls back to the top four. */
  videoIds: string[];
  /** "Ideas that suit this format": four mechanisms (content §3.11). */
  ideas: Mechanism[];
  /** Founders only: the line under "Founder with the mic" ([8.8]). */
  introLine?: string;
}

/** The caption under every "Ideas that suit this format" row; it ends in a link "How we work" to /how-we-work. */
export const IDEAS_CAPTION = 'Every batch mixes mechanisms, and we take care not to repeat a question.';

export const FORMATS: Record<FormatSlug, FormatPageContent> = {
  founders: {
    path: '/founders',
    eyebrow: 'Vox pop for founders',
    title: ['Put the founder ', 'on the', ' street'],
    lead: 'Your founder takes the mic, asks real people about the problem your product solves, and hears the answers live on camera.',
    whyTitle: ['A founder asking beats ', 'a brand telling'],
    whyBody: 'People scroll past ads. They stop for a person they recognise having a real conversation. A founder on the street turns the story behind the product into content your channels can keep posting.',
    cardsTitle: 'Ways to put a founder on camera',
    cards: [
      { name: 'Founder with the mic', body: 'The founder runs the interviews with our anchors and crew beside them.' },
      { name: 'Product in hand', body: 'People try the product in front of the person who made it and say what they think.' },
      { name: 'Question of the week', body: 'One sharp question from your category, asked again and again, built into a repeatable series.' },
    ],
    metaDescription: 'Founder-led vox pop from Kreators.Army. Your founder takes the mic, asks real people about the problem you solve, and we cut it for Reels and Shorts.',
    videoIds: ['seed-fyndflow', 'seed-brandingbum'],
    ideas: ['Personal experiences', 'Product reactions', 'Debates and opposing opinions', 'Unexpected questions'],
    introLine: "We agree the introduction before the shoot, so people know who's asking.",
  },
  events: {
    path: '/events',
    eyebrow: 'Vox pop at events',
    title: ['The crowd is ', 'already', ' talking'],
    lead: 'Launches, pop-ups, meetups and conferences are full of people with opinions. We bring the mic and leave you with short-form videos.',
    whyTitle: ['Every event is ', 'a street interview'],
    whyBody: 'Your audience is standing in one place, already interested in the same thing. We plan the questions before the doors open, interview people on the floor, and edit the best reactions for your feeds.',
    cardsTitle: 'What we cover on the day',
    cards: [
      { name: 'Launches and pop-ups', body: 'First reactions from the first people to see or try what you made.' },
      { name: 'Meetups and community nights', body: 'Real conversations with the people who turned up, like our meetup work with Ansh Mehra.' },
      { name: 'Shows and tours', body: 'Short recaps that bring people who missed it into the room, like our work with Rode.' },
    ],
    metaDescription: 'Vox pop at launches, pop-ups, meetups and shows. Kreators.Army brings the mic, talks to the crowd and turns the best reactions into short-form video.',
    videoIds: ['seed-ansh-mehra', 'seed-rode'],
    ideas: ['Audience participation', 'Challenges', 'Rankings', 'Humour and playful interactions'],
  },
  retail: {
    path: '/retail',
    eyebrow: 'Vox pop for retail',
    title: ['From the street ', 'to the', ' shelf'],
    lead: 'Vox pop works best when people can hold the product. We put yours in their hands and film what happens next.',
    whyTitle: ['A reaction people can ', 'go and buy'],
    whyBody: 'Physical products are made for this format. Someone picks it up, tries it and says what they honestly think. Add where to find it, and the video tells people what to look for the next time they are in a store.',
    cardsTitle: 'Built for physical products',
    cards: [
      { name: 'First try on camera', body: 'Real people meet the product for the first time and react honestly.' },
      { name: 'Category questions', body: 'Questions about the category come first, so the product arrives as the answer.' },
      { name: 'Where to find it', body: 'Each edit can close on where your product is sold, in store or online.' },
    ],
    metaDescription: 'Street interviews for physical products. Real people try yours on camera, and each video can close on where to buy it. Vox pop by Kreators.Army.',
    videoIds: ['seed-circlestore-1', 'seed-circlestore-2', 'seed-circlestore-3', 'seed-waxys'],
    ideas: ['Product reactions', 'A/B comparisons', 'Guessing and reveals', 'Rankings'],
  },
};

/** The videos for a format page: its own, in the order listed, or the top four when none of them are live. */
export function formatVideos<V extends { id: string }>(content: FormatPageContent, videos: V[]): V[] {
  const own = content.videoIds.flatMap((id) => videos.find((v) => v.id === id) ?? []);
  return own.length > 0 ? own : videos.slice(0, 4);
}

// ---------- Blog (content §3.12) ----------

export interface PostSection {
  heading?: string;
  /** Paragraphs, in order. */
  body: string[];
  /** A plain list after the paragraphs. */
  list?: readonly string[];
  /** Draw this section's list as the eleven static MechanismChip figures (post 5). */
  figure?: 'mechanisms';
}

export interface Post {
  slug: string;
  title: string;
  summary: string;
  sections: PostSection[];
  /** A link after the last section. */
  next?: { label: string; to: string };
}

export const POSTS: Post[] = [
  {
    slug: 'what-is-vox-pop-content',
    title: 'What is vox pop content?',
    summary: 'The short version of a format built on real people and honest answers.',
    sections: [
      { body: ['Vox pop means "voice of the people". A host takes a question to the street, real people answer on camera, and the best reactions become short videos.'] },
      {
        heading: 'Why it holds attention',
        body: [
          "Most influencer and UGC videos today feel scripted. Vox pop does the opposite. The conversation is real, so it looks like something from a friend's feed and not like an ad.",
          'People scroll past ads. But they stop when they see real people talking.',
        ],
      },
      {
        heading: "Why the answers aren't scripted",
        body: ["The format works because the responses aren't scripted. So the craft is in engineering the interaction, not scripting the outcome: the question, the setup, who we approach, the follow-up and the edit."],
      },
      { heading: 'Who it works best for', body: ['It works best for brands with physical products, because real people can try the product and share honest reactions on camera.'] },
    ],
  },
  {
    slug: 'how-a-vox-pop-shoot-works',
    title: 'How a vox pop shoot works, step by step',
    summary: 'From the setup to the edit: the six parts of a street interaction that works.',
    sections: [
      { body: ["A question that looks interesting on paper doesn't automatically make an engaging video. The whole interaction matters."] },
      { heading: '1. Setup', body: ["How the moment is framed before the question lands, from where we stand to what's in shot."] },
      { heading: '2. Question', body: ['A prediction creates curiosity. An A/B choice creates debate. An unexpected challenge creates humour. A reveal creates surprise.'] },
      { heading: '3. Participant', body: ['Who we approach, and how. A small on-the-spot thank-you helps people stop, and never decides what they say.'] },
      { heading: '4. Follow-up', body: ["The interviewer is free to follow an interesting answer and go deeper. We'd rather follow a genuinely good moment than force a script."] },
      { heading: '5. Reaction', body: ["We can't guarantee any one stranger will be funny or surprised. We can create more chances for it to happen."] },
      { heading: '6. Edit', body: ['Strong openings, no dead air, clear context, tight storytelling, clean endings. As tight as the story allows.'] },
    ],
  },
  {
    slug: 'where-to-post-vox-pop-videos',
    title: 'Where to post your vox pop videos',
    summary: 'One shoot, cut for every short-form feed your customers already watch.',
    sections: [
      { body: ['Vertical street interviews travel well because they already look like what the feed is full of. You can post them across Instagram, YouTube Shorts and other platforms, including ads.'] },
      ...PLATFORMS.map((p) => ({ heading: p.name, body: [p.body] })),
      { heading: "They're yours to post", body: ['Once usage rights transfer, on full payment, the videos go out on your own brand channels as long-term content assets.'] },
    ],
  },
  {
    slug: 'what-goes-in-a-vox-pop-brief',
    title: 'What goes in a vox pop brief',
    summary: "The six things that steer every creative decision, and why they're locked before the shoot.",
    sections: [
      { body: ["Please complete the brief before the shoot. It's the starting point for every creative decision on the trial. The request form walks you through it."] },
      {
        heading: 'Objective',
        body: ['What are these videos mainly for?'],
        list: ['Organic content (value or entertainment first)', 'Organic content with subtle brand awareness', 'Paid ads or performance marketing', 'Something else'],
      },
      {
        heading: 'Brand integration',
        body: ['How prominently should the brand appear?'],
        list: ['Minimal (story first)', 'Subtle branding throughout', 'Product visible throughout', 'Product only in the intro or outro', 'Creator holding the product', 'Something else'],
      },
      { heading: 'Desired viewer response', body: ['After watching, what should people think, feel or do? (In your words.)'] },
      {
        heading: 'Non-negotiables',
        body: ['What must every video include?'],
        list: ['Product shots', 'Logo visible', 'Brand mention', 'Call to action', 'People trying the product', 'Intro hooks', 'Closing statements', 'Disclaimers', 'Something else'],
      },
      {
        heading: 'Brand guide',
        body: ['A simple guide to your brand, linked or attached. What a simple brand guide covers:'],
        list: [
          'Brand identity: personality in 3 to 5 words, positive keywords, negative keywords, things to avoid',
          'Editing and design: overall editing style (fast-paced, premium, cinematic, documentary, raw UGC and so on), typography, brand colours, motion graphics style, caption style, music direction, sound effects (minimal, energetic, meme-style and so on), transitions, pacing, logo usage, product shot guidelines',
        ],
      },
      { heading: 'References', body: ['3 to 5 videos that best show the direction you want.'] },
      {
        heading: 'Why lock it before filming',
        body: ["All creative direction, branding expectations and must-haves should be final before the shoot. New requirements or changes after filming may need extra editing, revised deliverables, or a reshoot if they depend on footage we didn't capture."],
      },
    ],
    next: { label: 'The trial', to: '/trial' },
  },
  {
    slug: 'eleven-ways-to-vary-a-vox-pop-batch',
    title: 'Eleven ways to vary a vox pop batch',
    summary: "Variety doesn't need a new set for every video. It needs a new mechanism.",
    sections: [
      {
        heading: 'Variety without a new set every time',
        body: [
          'For a batch of five videos, we actively avoid repeating the same question or interaction. Each video gets its own creative mechanism, so it has its own identity, while the production stays efficient and authentic.',
          "We've found this a far more sustainable way to create variety than treating every video as a separate production.",
        ],
      },
      { heading: 'The eleven mechanisms', body: [], list: MECHANISMS, figure: 'mechanisms' },
      {
        heading: 'One main job per video',
        body: ["If you're featuring several products, we're happy to plan the batch across them. We recommend each video has one primary creative objective, rather than trying to say every product, feature, benefit and call to action at once. A video might be built to:"],
        list: VIDEO_JOBS,
      },
      { body: ['Each video gets a clear purpose, and the batch still covers the wider range.'] },
    ],
  },
];

// ---------- The cast ----------

export type CastId = 'bolu' | 'tiko' | 'gola' | 'sochu';

/** The brand cast. Mascots, never staff: the real claim stays TEAM's "10+ creative professionals". */
export const CAST: { id: CastId; name: string; shape: string; colour: string; role: string; prop: string; signature: string }[] = [
  { id: 'bolu', name: 'Bolu', shape: 'green square', colour: '#47c349', role: 'Anchors', prop: 'mic', signature: 'Raises the mic and talks' },
  { id: 'tiko', name: 'Tiko', shape: 'purple triangle', colour: '#6d61fe', role: 'Camera and sound', prop: 'camera', signature: 'Tally light on, follows you' },
  { id: 'gola', name: 'Gola', shape: 'orange circle', colour: '#ff8d3a', role: 'Video editors', prop: 'clapperboard', signature: 'Claps the board' },
  { id: 'sochu', name: 'Sochu', shape: 'yellow flower', colour: '#fbd43f', role: 'Content strategists', prop: 'clipboard', signature: 'Opens its eyes and ticks a line' },
];

export const castById = (id: CastId) => CAST.find((c) => c.id === id) as (typeof CAST)[number];

/**
 * Every line a character says, verbatim from content §9.2 (keys from V2-SPEC 3.1.1). Bubbles are flavour (aria-hidden), one on screen site-wide, shown
 * once per key per page view. Never on Pricing, Testimonials, blog posts, FAQ answers, legal, the player or the admin.
 */
export const CAST_LINES = {
  'home.hero.intro': { who: 'bolu', line: 'Excuse me! Got a minute for one question?' },
  'home.hero.tiko': { who: 'tiko', line: 'Rolling. Act natural.' },
  'home.hero.gola': { who: 'gola', line: 'Pauses out. Payoff in.' },
  'home.hero.sochu': { who: 'sochu', line: 'Objective first. Questions second.' },
  'home.hero.cta': { who: 'bolu', line: 'Good choice. See it on your own brand.' },
  'home.army.bolu': { who: 'bolu', line: 'I ask. Strangers answer. Nobody reads a script.' },
  'home.army.tiko': { who: 'tiko', line: 'Framing, sound, background. I watch all three.' },
  'home.army.gola': { who: 'gola', line: 'As tight as the story allows. Not tighter.' },
  'home.army.sochu': { who: 'sochu', line: 'Clear goal. Right mechanism. Real people.' },
  'home.how.1': { who: 'sochu', line: 'What must every video include? Write it down.' },
  'home.how.2': { who: 'bolu', line: "Trial day. Let's see it on your brand." },
  'home.how.3': { who: 'sochu', line: 'One point of contact, one clear direction.' },
  'home.how.4': { who: 'sochu', line: 'Locked before the shoot. Tick, tick, tick.' },
  'home.how.5': { who: 'gola', line: 'Batch done. Minor trims are included.' },
  'home.work.empty': { who: 'tiko', line: 'New reels are on their way.' },
  'home.work.error': { who: 'tiko', line: "Hmm, the reels didn't load." },
  'hww.cannot': { who: 'bolu', line: "I can't script a stranger. I can set up a moment." },
  'hww.chain': { who: 'tiko', line: 'Setup. Question. Then I keep rolling.' },
  'hww.mechanisms': { who: 'sochu', line: 'Eleven ways in, so we rarely ask the same thing twice.' },
  'hww.reason': { who: 'bolu', line: 'A small thank-you helps. It never picks the answer.' },
  'hww.follow': { who: 'bolu', line: 'If a chat gets good, I follow it.' },
  'hww.varied': { who: 'tiko', line: 'New corner, new people, same day.' },
  'hww.edit': { who: 'gola', line: 'Strong open. Clean ending.' },
  'hww.lock': { who: 'sochu', line: 'You bring the product truth. We bring the street.' },
  'hww.loop': { who: 'sochu', line: 'Learn, improve, then round again.' },
  'trial.hero': { who: 'bolu', line: 'Your brand, our street. Shall we?' },
  'trial.brief': { who: 'sochu', line: 'Fill this in before the shoot. It steers everything.' },
  'trial.lock': { who: 'gola', line: "Changes after filming? I'd need new footage." },
  'trial.content': { who: 'tiko', line: 'Trial videos are for a look, not a post.' },
  'trial.after': { who: 'gola', line: 'Seven steps from here to your batch.' },
  'contact.step1': { who: 'bolu', line: "First up: who's asking?" },
  'contact.phone': { who: 'tiko', line: 'Not looking. Promise.' },
  'contact.email': { who: 'sochu', line: 'Perfect.' },
  'contact.agency': { who: 'sochu', line: 'One package per brand, so each client gets its own.' },
  'contact.step2': { who: 'sochu', line: "What's the main job of these videos?" },
  'contact.step3': { who: 'tiko', line: 'How much of the product should I see?' },
  'contact.step4': { who: 'gola', line: 'Tell me the must-haves before I start cutting.' },
  'contact.step5': { who: 'sochu', line: 'Three to five references help a lot.' },
  'contact.fiveRefs': { who: 'gola', line: "That's five. Perfect." },
  'contact.review': { who: 'bolu', line: "Looks good. Send it when you're ready." },
  'contact.error': { who: 'tiko', line: 'Hmm, one field needs a look.' },
  'contact.success': { who: 'bolu', line: "Brief received. That's my favourite kind." },
  'contact.question': { who: 'bolu', line: 'Ask away. I love a good question.' },
  'whyKreators.scripted': { who: 'tiko', line: 'Zzz. Another ad.' },
  'whyKreators.voxpop': { who: 'bolu', line: 'Real answers only.' },
  'whyVoxpop.hero': { who: 'bolu', line: 'They skip ads. They stop for people.' },
  'founders.hero': { who: 'bolu', line: "Your founder takes the mic. I'll hold the cable." },
  'events.hero': { who: 'tiko', line: 'Doors open. Tally light on.' },
  'retail.shelf': { who: 'gola', line: 'Fresh stock. Who wants to try it first?' },
  'numbers.count': { who: 'sochu', line: 'That many views? Past ones, mind you.' },
  'careers.hero': { who: 'bolu', line: 'Like talking to strangers? Same.' },
  'faq.open': { who: 'sochu', line: 'Good question.' },
  'library.empty': { who: 'tiko', line: 'Nothing in frame. Try fewer filters.' },
  'library.error': { who: 'tiko', line: "The reels didn't load. Try again?" },
  'notFound.ask': { who: 'bolu', line: 'Excuse me, have you seen this page?' },
  'notFound.sochu': { who: 'sochu', line: 'Never heard of it.' },
  'notFound.tiko': { who: 'tiko', line: 'Not in my footage.' },
  'notFound.gola': { who: 'gola', line: 'Cut from the edit, maybe?' },
} as const satisfies Record<string, { who: CastId; line: string }>;

export type CastLineKey = keyof typeof CAST_LINES;

/**
 * D1: the Army sentence on Home (motion M2). `parts` concatenated with spaces is `plain`; each part starts with its character's name, and the stage puts
 * that character's slot just before it. `null` removes the M2 stage and leaves the Meet the Army bento.
 */
export const ARMY_SENTENCE: { plain: string; parts: { who: CastId; text: string }[] } | null = {
  plain: 'Sochu plans the question, Bolu asks it on the street, Tiko films the reaction and Gola cuts it into your video.',
  parts: [
    { who: 'sochu', text: 'Sochu plans the question,' },
    { who: 'bolu', text: 'Bolu asks it on the street,' },
    { who: 'tiko', text: 'Tiko films the reaction and' },
    { who: 'gola', text: 'Gola cuts it into your video.' },
  ],
};

/** D2: the illustrated street under the heroes, the 404 and the footer. `null` falls back to v1's G0 wash and no street anywhere. */
export const STREET_SCENE: 'bengaluru' | null = 'bengaluru';

/** D7: the brief's brand guide is a link only. No upload control, no upload endpoint. */
export const BRAND_GUIDE_UPLOAD = false;

// ---------- Media the pages show (the only /media/ paths in src, V2-SPEC 3.5) ----------

/** Home hero first paint: the front card before /api/videos answers. `poster` must equal the preload in public/theme.js (copy lint). */
export const HERO = { firstId: 'seed-fyndflow', poster: '/media/fyndflow.jpg' } as const;

export interface Still {
  src: string;
  /** Empty for a still that only decorates. */
  alt: string;
  /** Share of the frame's height above the burned-in title's last line (Why vox pop's opening band). */
  crop?: number;
  /** object-position. */
  position?: string;
}

/** Editorial frames used by pages, by what they show. They are the reels' own 507-wide frames. */
export const STILLS = {
  streetTrio: { src: '/media/circlestore-1.jpg', alt: 'Three people talking on the street in front of a shuttered shop.', crop: 0.185, position: '50% 62%' },
  streetCorner: { src: '/media/circlestore-3.jpg', alt: 'Two people standing on a street corner, smiling as they listen to a question.', crop: 0.205, position: '50% 60%' },
  hostGroup: { src: '/media/circlestore-2.jpg', alt: 'A host in a maroon blazer talking with a group of people on the street.', crop: 0.15, position: '50% 18%' },
  giftBox: { src: '/media/brandingbum.jpg', alt: 'Three people on the street, one holding a gift box up to camera.', position: '50% 50%' },
  fyndflow: { src: '/media/fyndflow.jpg', alt: '', position: '50% 72%' },
  eightClub: { src: '/media/8club.jpg', alt: '', position: '50% 50%' },
  anshMehra: { src: '/media/ansh-mehra.jpg', alt: '', position: '50% 50%' },
  rode: { src: '/media/rode.jpg', alt: '', position: '50% 50%' },
  waxys: { src: '/media/waxys.jpg', alt: '', position: '50% 50%' },
} satisfies Record<string, Still>;

// ---------- Navigation and footer (content §1.2, §1.3) ----------

export const NAV_GROUPS = [
  { label: 'The work', links: [['Video library', '/video-library'], ['Testimonials', '/testimonials'], ['The numbers', '/numbers']] },
  { label: 'How we work', links: [['How we work', '/how-we-work'], ['The trial', '/trial'], ['Pricing', '/pricing'], ['Why Kreators', '/why-kreators'], ['Why vox pop', '/why-voxpop']] },
  { label: 'Formats', links: [['Founders', '/founders'], ['Events', '/events'], ['Retail', '/retail']] },
  { label: 'Company', links: [['Blog', '/blog'], ['Careers', '/careers'], ['FAQ', '/faq'], ['Contact', '/contact']] },
] as const;

/** The desktop nav: Work, How we work and Pricing go straight to a page (the first two also have a menu); Formats and Company open a menu only. */
export const NAV_TOP = [
  { label: 'Work', to: '/video-library', group: 'The work' },
  { label: 'How we work', to: '/how-we-work', group: 'How we work' },
  { label: 'Formats', group: 'Formats' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Company', group: 'Company' },
] as const;

/** The footer's link columns: the same four groups. */
export const FOOTER_GROUPS = NAV_GROUPS;

/** The cast member standing over each footer column, in column order. */
export const FOOTER_CAST_ORDER: CastId[] = ['tiko', 'sochu', 'bolu', 'gola'];
