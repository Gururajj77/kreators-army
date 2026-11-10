// Everything the site says about Kreators. Facts here come from the current Kreators.Army website; change them here and every page follows.

export const SITE = {
  name: 'Kreators.Army',
  email: 'kreatorsdotagency@gmail.com',
  owner: { name: 'BrandingBum', url: 'https://brandingbum.com/' },
  rating: { creators: '500+ Creators', score: '5/5 (440)' },
};

/** The one primary action, everywhere: same words, same red. The plan travels in the URL so the form can prefill it. */
export const PRIMARY_ACTION = { label: 'Get a Free Trial Video', to: '/contact' } as const;
export type PlanSlug = 'startups' | 'd2c';
export const contactHref = (plan?: PlanSlug): string => (plan ? `${PRIMARY_ACTION.to}?plan=${plan}` : PRIMARY_ACTION.to);
/** Pages with their own one action (the form, the email for applicants), where asking for a trial video would be the wrong question: no phone bar, no footer ask. */
export const OWN_ACTION_ROUTES: readonly string[] = ['/contact', '/contact-us', '/careers'];

/** The closing lines of every page, which now live in the footer. */
export const CLOSING = {
  eyebrow: 'Get started',
  title: 'Start your vox pop journey',
  body: 'Start posting polished vox pop street interviews today with Kreators.Army and grow your audience faster.',
  badge: 'Get a free trial video',
};

export const SOCIALS = [
  { label: 'Instagram', url: 'https://www.instagram.com/kreatorsdotagency' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/brandingbum' },
  { label: 'X', url: 'https://x.com/brandingbum' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@brandingbum' },
];

export const BRANDS: { name: string; logo?: string }[] = [
  { name: 'FyndFlow', logo: '/logos/fyndflow.jpg' },
  { name: 'CircleStore.in', logo: '/logos/circlestore.jpg' },
  { name: 'Waxys.in' },
  { name: 'Rode Mic India', logo: '/logos/rode.jpg' },
  { name: 'BrandingBum' },
  { name: 'Ansh Mehra', logo: '/logos/ansh-mehra.jpg' },
  { name: '8Club', logo: '/logos/8club.jpg' },
];

export const brandLogo = (name: string) => BRANDS.find((b) => b.name === name)?.logo;

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

export const FEATURES = ['Authentic reactions', 'Native feed content', 'Natural conversations', 'High engagement', 'Content people trust', 'Short-form ready'];

export const SERVICES = [
  { name: 'YouTube Shorts', body: 'We create engaging Shorts that attract viewers and grow your audience.' },
  { name: 'Facebook Reels', body: 'We make effective Facebook reels that reach more people quickly.' },
  { name: 'Instagram Reels', body: 'We produce creative Reels that increase engagement and brand awareness fast.' },
  { name: 'Snapchat Spotlights', body: 'We capture Vox pop for Snapchat that tell stories and retain attention.' },
  { name: 'TikTok Clips', body: 'We craft viral TikTok clips that entertain and grow social followers.' },
];

export const STEPS = [
  { name: 'Strategy session', body: 'We start with a quick call to understand your product and plan interview questions that spark real reactions.' },
  { name: 'Interview questions', body: 'We design simple but powerful questions around your product category to trigger honest responses.' },
  { name: 'Street shoots', body: 'Our team goes out and captures real people answering those questions on camera.' },
  { name: 'Video editing', body: 'We turn the best reactions into short, engaging videos optimized for Reels, Shorts, and TikTok.' },
  { name: 'Finalize delivery', body: 'You receive ready-to-post videos you can publish across your brand channels.' },
];

export const PLANS = [
  {
    name: 'For Startups',
    slug: 'startups' as PlanSlug,
    body: 'Test street-interview content that feels real, gets attention, and actually keeps people watching.',
    price: '₹50,000',
    badge: null,
    items: ['5 street interview videos', 'Custom branded voxpop questions', 'In-house anchors & street interviews', 'Professional editing for Reels/Shorts', 'Ready-to-post vertical videos', '5 rounds of revisions per video'],
  },
  {
    name: 'For D2C Brands',
    slug: 'd2c' as PlanSlug,
    body: 'Turn voxpop interviews into a steady stream of engaging videos your brand can keep posting.',
    price: '₹85,000',
    badge: '2 slots open',
    items: ['10 street interview videos', 'Founder-led content strategy session', 'Custom interview hooks for your product', 'In-house anchors, shoot & editing', 'Reels / Shorts / TikTok ready formats', 'Priority production & unlimited revisions'],
  },
];

export const TESTIMONIALS = [
  { metric: '100x', unit: 'Views', quote: 'We tried vox pop videos and they perform way better than our usual content.', who: 'D2C Founder' },
  { metric: '500K+', unit: 'Followers', quote: 'The videos feel natural. People actually stop and watch instead of scrolling past.', who: 'Marketing Lead' },
  { metric: '150%', unit: 'Engagement', quote: 'Honestly surprised by the engagement. The reactions make the content feel real.', who: 'Brand Manager' },
  { metric: '200K+', unit: 'Subscribers', quote: 'This format works well for social. It feels more like a conversation than an ad.', who: 'Content Lead' },
  { metric: '80x', unit: 'Reach', quote: 'Our videos started reaching new audiences once we switched to this style.', who: 'Startup CMO' },
  { metric: '1M+', unit: 'Views', quote: 'People love seeing real reactions. Our videos now just feel more intriguing.', who: 'Growth Head' },
];

export const FOUNDER_QUOTE = { quote: 'Our engagement rates multiplied and connected with the right audience without feeling salesy.', who: 'Founder of Startup' };

export interface Faq {
  slug: string;
  group: string;
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  { slug: 'what-is-voxpop-content', group: 'The format', q: 'What exactly is voxpop content?', a: 'Voxpop means “voice of the people.” We capture real people answering questions around your product category, creating natural reactions that feel more engaging than scripted ads.' },
  { slug: 'will-this-work-for-my-brand', group: 'The format', q: 'Will this format work for my brand?', a: 'Voxpop works best for brands with physical products because real people can interact with the product and share honest reactions on camera.' },
  { slug: 'how-long-does-production-take', group: 'Production', q: 'How long does it take to produce the videos?', a: 'Our team usually plans, shoots, and edits voxpop interviews within a few days, delivering ready-to-post short videos that fit naturally into Reels, Shorts, and other platforms.' },
  { slug: 'do-you-handle-the-shoot', group: 'Production', q: 'Do you handle the shooting as well or only editing?', a: 'Yes, our team handles the entire process including interview planning, street shooting, and editing so you receive complete videos ready to publish.' },
  { slug: 'can-i-request-revisions', group: 'Production', q: 'Can I request revisions after the videos are delivered?', a: 'Yes, you can request revisions after delivery to make sure the final videos match your brand voice and feel exactly how you want them to.' },
  { slug: 'where-can-i-use-the-videos', group: 'After delivery', q: 'Where can I use the videos once they are delivered?', a: 'You can post the videos across Instagram, YouTube Shorts, TikTok, and other platforms, including ads, giving your brand authentic content that works across multiple channels.' },
  { slug: 'do-i-post-on-your-channel', group: 'After delivery', q: 'Do I need to post the videos on your channel?', a: 'No, the videos are delivered directly to you so they become long-term content assets for your own brand channels.' },
];

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
}

export const FORMATS: Record<'founders' | 'events' | 'retail', FormatPageContent> = {
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
    metaDescription: 'Founder-led vox pop street interviews from Kreators.Army, built for Reels, Shorts and TikTok.',
    videoIds: ['seed-fyndflow', 'seed-brandingbum'],
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
      { name: 'Shows and tours', body: 'Short recaps that bring people who missed it into the room, like our work with Rode Mic India.' },
    ],
    metaDescription: 'Vox pop interviews at launches, meetups and shows, turned into short-form video by Kreators.Army.',
    videoIds: ['seed-ansh-mehra', 'seed-rode'],
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
    metaDescription: 'Street interviews for physical products, built to send people to where you sell. Kreators.Army.',
    videoIds: ['seed-circlestore-1', 'seed-circlestore-2', 'seed-circlestore-3', 'seed-waxys'],
  },
};

/** The videos for a format page: its own, in the order listed, or the top four when none of them are live. */
export function formatVideos<V extends { id: string }>(content: FormatPageContent, videos: V[]): V[] {
  const own = content.videoIds.flatMap((id) => videos.find((v) => v.id === id) ?? []);
  return own.length > 0 ? own : videos.slice(0, 4);
}

export interface Post {
  slug: string;
  title: string;
  summary: string;
  sections: { heading?: string; body: string[] }[];
}

export const POSTS: Post[] = [
  {
    slug: 'what-is-vox-pop-content',
    title: 'What is vox pop content?',
    summary: 'The short version of a format built on real people and honest answers.',
    sections: [
      { body: ['Vox pop means “voice of the people.” A host takes a question to the street, real people answer it on camera, and the best reactions become short videos.'] },
      { heading: 'Why it holds attention', body: ['Most influencer and UGC videos today feel scripted. Vox pop does the opposite. The conversation is real, so it looks like something from a friend’s feed and not like an ad.', 'People scroll past ads. But they stop when they see real people talking.'] },
      { heading: 'Who it works best for', body: ['It works best for brands with physical products, because real people can interact with the product and share honest reactions on camera.'] },
    ],
  },
  {
    slug: 'how-a-vox-pop-shoot-works',
    title: 'How a vox pop shoot works, step by step',
    summary: 'Five steps take a product from a first call to ready-to-post videos.',
    sections: STEPS.map((s, i) => ({ heading: `${i + 1}. ${s.name}`, body: [s.body] })),
  },
  {
    slug: 'where-to-post-vox-pop-videos',
    title: 'Where to post your vox pop videos',
    summary: 'One shoot, cut for every short-form feed your customers already watch.',
    sections: [
      { body: ['Vertical street interviews travel well because they already look like what the feed is full of. You can post them across Instagram, YouTube Shorts, TikTok and other platforms, including ads.'] },
      ...SERVICES.map((s) => ({ heading: s.name, body: [s.body] })),
      { heading: 'They stay yours', body: ['The videos are delivered directly to you, so they become long-term content assets for your own brand channels.'] },
    ],
  },
];

export type CastId = 'bolu' | 'tiko' | 'gola' | 'sochu';

/** The brand cast. Mascots, never staff: the real claim stays TEAM's "10+ creative professionals". */
export const CAST: { id: CastId; name: string; shape: string; colour: string; role: string; prop: string; signature: string }[] = [
  { id: 'bolu', name: 'Bolu', shape: 'green square', colour: '#47c349', role: 'Anchors', prop: 'mic', signature: 'Raises the mic and talks' },
  { id: 'tiko', name: 'Tiko', shape: 'purple triangle', colour: '#6d61fe', role: 'Camera and sound', prop: 'camera', signature: 'Tally light on, follows you' },
  { id: 'gola', name: 'Gola', shape: 'orange circle', colour: '#ff8d3a', role: 'Video editors', prop: 'clapperboard', signature: 'Claps the board' },
  { id: 'sochu', name: 'Sochu', shape: 'yellow flower', colour: '#fbd43f', role: 'Content strategists', prop: 'clipboard', signature: 'Opens its eyes and ticks a line' },
];

export const castById = (id: CastId) => CAST.find((c) => c.id === id) as (typeof CAST)[number];

export const NAV_GROUPS = [
  { label: 'The work', links: [['Video library', '/video-library'], ['Testimonials', '/testimonials'], ['The numbers', '/numbers']] },
  { label: 'Why us', links: [['Why Kreators', '/why-kreators'], ['Why vox pop', '/why-voxpop'], ['Pricing', '/#pricing']] },
  { label: 'Formats', links: [['Founders', '/founders'], ['Events', '/events'], ['Retail', '/retail']] },
  { label: 'Company', links: [['Blog', '/blog'], ['Careers', '/careers'], ['FAQ', '/faq'], ['Contact', '/contact']] },
] as const;

/** The desktop nav: Work and Pricing go straight to a page, the others open a menu of their NAV_GROUPS links. */
export const NAV_TOP = [
  { label: 'Work', to: '/video-library', group: 'The work' },
  { label: 'Why us', group: 'Why us' },
  { label: 'Formats', group: 'Formats' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'Company', group: 'Company' },
] as const;

/** The footer's link columns: every group the nav has, The work included. */
export const FOOTER_GROUPS = NAV_GROUPS;

/** The cast member standing over each footer column, in column order. */
export const FOOTER_CAST_ORDER: CastId[] = ['tiko', 'sochu', 'bolu', 'gola'];
