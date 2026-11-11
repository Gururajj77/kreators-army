import type { Post } from '../types';
import meta from './vox-pop-video-cost-india.meta';

// How much does a vox pop video cost in India? (PLAN.md post 20; PDF p8-9, p16, p27-28, p33-34, p42-43). Claims follow .work/v2/blog/CLAIMS.md.
// Prices, inclusions, rules and payment steps are lib/content.ts (PACKAGES, ADD_ON, PACKAGE_INCLUDES, PRICING_RULES, PAYMENT_STEPS, LATE_PAYMENT, FAQS).
// No other supplier's prices and no market rates. The PDF's rupee figures, CPMs, ROI and CAC claims are left out. The DIY week and the minimum viable
// shoot are planning aids from the founder's playbook, never promises of speed. The package calculator reproduces shared quoteBatch(): a fee only for
// 5, 10, 20 or 20 plus whole blocks of 5; any other number shows a dash (0/0), because it is quoted in writing.

const post: Post = {
  meta,

  answer:
    "A vox pop video's cost in India depends mostly on people and time: who plans the questions, who interviews strangers, the crew, locations, editing, revisions and usage rights. Kreators.Army packages are ₹50,000 for 5 videos, ₹85,000 for 10 and ₹1,50,000 for 20, GST extra where applicable. Doing it yourself costs less cash and more hours.",

  takeaways: [
    'A vox pop price is mostly people and time: planning the question, stopping strangers, asking the follow-up and finding the few seconds worth keeping.',
    'Kreators.Army packages work out at ₹10,000 a video for 5, ₹8,500 for 10 and ₹7,500 for 20. GST is extra where applicable, and each package covers one brand.',
    "Doing it yourself needs a phone and a clip-on mic. The real bill is two people's hours, and the DIY calculator below puts a number on them.",
    "Compare options on cost per usable video, not price per video. A batch you won't post is the most expensive kind.",
    'Before you sign, get the questions, revisions, rights, releases and payment terms in writing. The checklist below covers 18 points.',
  ],

  body: [
    `"How much do the videos cost?" It's on our FAQ page. The answer fits on one line: ₹50,000 for 5 videos, ₹85,000 for 10 or ₹1,50,000 for 20, with GST extra where applicable[^ka-pricing].`,

    "One line rarely settles it. You're probably holding other options already: an agency quote, a freelancer's day rate sent over WhatsApp, and a quiet suspicion that someone on your team could do this with a phone.",

    'This guide puts all of them on one scale. You get what a vox pop price pays for, our packages in full and an honest sum for doing it yourself. There are also three calculators that run on your own numbers, and an 18-point checklist for comparing quotes.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'the-short-answer', text: 'How much does a vox pop video cost in India?', toc: 'The short answer' },

    "With Kreators.Army, a vox pop video costs ₹10,000 in the 5 video package, ₹8,500 in the 10 and ₹7,500 in the 20, with GST extra where applicable. Anyone else's price depends on what their quote includes.",

    "We won't quote other studios' or freelancers' rates. We don't know them well enough to be fair, and a bare rate card rarely says what it leaves out. What we can do is show you what goes into the work, so any quote you hold starts to make sense.",

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    "If the format is new to you, start with [what vox pop content is](/blog/what-is-vox-pop-content). Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. So yes, we sell one of the options in this guide. We've tried to treat the others fairly anyway, including the one where you hire nobody.",

    'There are three ways to get a street interview made, and each one bills you in a different currency.',

    {
      type: 'table',
      caption: 'Three ways to get a vox pop made, and what each asks of you',
      head: ['Route', 'What you pay with', 'Who plans and interviews', 'Suits you when'],
      rows: [
        ['Do it yourself', 'Team hours, plus a phone and a mic', 'Your own team', 'You want to learn the format and have the hours'],
        ['Hire freelancers', 'Fees you agree with each person', 'Usually you plan; they shoot or edit', 'You can direct a shoot and need extra hands'],
        ['Use a vox pop studio', 'A package fee, paid up front', 'The studio, from questions to final edit', 'You want batches without running them yourself'],
      ],
      rowHeaders: true,
    },

    'Our view: DIY suits a team with a founder who likes talking to strangers and someone who already edits. Without those two people, the hours land on whoever you can least spare.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'what-youre-paying-for', text: 'What are you paying for in a vox pop video?', toc: "What you're paying for" },

    "Mostly people and time. You're paying for the question, the person who asks it, the conversations that never make the cut and the edit that finds the seconds that do. The camera is a small part of it.",

    "Every Kreators.Army package includes the same ten things[^ka-pricing]. Here they are, with the work behind each one and what covering it in-house would cost you.",

    {
      type: 'table',
      caption: 'What every Kreators.Army package includes, and the work behind it',
      head: ['In every package', 'The work behind it', 'If you do it yourself'],
      rows: [
        ['Concepts, questions and interactions planned for your objective', 'Writing and testing questions before anyone leaves the office', "Planning hours, usually the founder's"],
        ['Creative variety across the batch, not one question repeated', 'A different idea per video: a reveal, an A/B choice, a challenge', 'More questions to write and test'],
        ['Interviewer, participant selection and on-ground direction', 'Stopping strangers, keeping them talking, asking the follow-up', 'Someone on your team willing to do it'],
        ['Street shoot with professional framing and audio', 'Camera, mics and someone watching sound on a loud street', 'A phone, a clip-on mic and care'],
        ['Editing for short-form: strong openings, tight pacing, captions, clean endings', 'Finding the few seconds that work in a lot of footage', 'Your evenings, most likely'],
        ['Pre-production alignment before each shoot', 'Locking the objective, products, audience and must-haves', 'A brief you write for yourself'],
        ['Review checkpoints where useful', 'Chances to correct course before the final cut', 'Your own judgement'],
        ['Minor edit-level revisions', 'Trims, text, sequencing and caption changes', 'More editing hours'],
        ['Vertical videos ready for Reels, Shorts and other short-form feeds', 'Exports sized and paced for each feed', 'Export settings you learn once'],
        ['Usage rights on full payment', 'Clear terms for where the videos can run', 'Signed releases you collect yourself'],
      ],
      rowHeaders: true,
    },

    'Read the middle column again. Nearly every line is a person doing something. Only one row is mostly about kit, and even that one needs someone listening to the sound.',

    { type: 'h3', id: 'the-work-nobody-sees', text: 'The conversations you never see' },

    "A finished video might show four or five people. It doesn't show the people who walked past, said no, froze at the sight of the mic or gave the safe answer they'd give a survey.",

    "One planning rule from our playbook, the [minimum viable shoot](/blog/vox-pop-strategy-for-indian-brands#minimum-viable-shoot), is to film at least fifteen people in a session and expect five to seven worth keeping. Treat it as a starting estimate. The spot, the hour and the question all move it.",

    'The ratio is the point.',

    'You pay for every conversation, including the eight or ten that never reach the edit. A quote that looks high may have budgeted for those conversations. A quote that looks low may be planning to film six people and hope.',

    { type: 'h3', id: 'question-before-camera', text: 'Why the question matters more than the camera' },

    "A better camera won't rescue a weak question. A stranger gives you a few seconds. A question that's easy to start and leaves room for a story does more for the video than any lens.",

    {
      type: 'video',
      brand: 'BreadBerry',
      title: 'Blindfold Wheat',
      caption: 'BreadBerry, "Blindfold Wheat". The title gives away the whole setup: a blindfold and a product. Kit this small keeps the budget on the question and the edit.',
    },

    "A blindfold test needs a blindfold and a product. What it can't do without is a host who knows what to ask after the blindfold comes off.",

    // ------------------------------------------------------------------
    { type: 'h2', id: 'kreators-army-packages', text: 'What do Kreators.Army packages cost?', toc: 'Kreators.Army packages' },

    'Three packages, each for one brand: ₹50,000 for 5 videos, ₹85,000 for 10 and ₹1,50,000 for 20. Beyond 20, add blocks of 5 at ₹35,000. GST is extra where applicable, and every package is fully prepaid.',

    {
      type: 'table',
      caption: 'Kreators.Army vox pop packages, before GST',
      head: ['Package', 'Fee', 'Per video'],
      rows: [
        ['5 video package', '₹50,000', '₹10,000'],
        ['10 video package', '₹85,000', '₹8,500'],
        ['20 video package', '₹1,50,000', '₹7,500'],
        ['Each block of 5 beyond 20', '₹35,000', '₹7,000'],
      ],
      rowHeaders: true,
    },

    'The table comes straight from our [pricing page](/pricing), and so do the six rules that sit beside every price we quote.',

    {
      type: 'list',
      items: [
        "**One brand per package.** Packages can't be combined, pooled or split across brands. That includes agencies working for several brands: each brand needs its own package.",
        '**Beyond 20 videos,** add blocks of 5 at ₹35,000 a block (₹7,000 a video).',
        '**Quantities in between** the packages are quoted in writing before work begins.',
        '**Taxes:** fees exclude applicable taxes, including GST where applicable.',
        '**Fully prepaid:** the whole package fee is paid in advance, before pre-production starts.',
        '**Usage rights** for the final videos transfer on full payment.',
      ],
    },

    { type: 'h3', id: 'work-out-a-package', text: 'Work out a package' },

    'This calculator runs the same rule as the pricing page. Pick a number of videos and a number of brands.',

    {
      type: 'widget',
      widget: 'calculator',
      id: 'package-calculator',
      props: {
        title: 'Package calculator',
        intro: 'Videos move in steps of 5. A dash means the number falls between our packages, and we quote those in writing before work begins.',
        inputs: [
          { key: 'videos', label: 'Videos for each brand', default: 10, min: 5, max: 60, step: 5, unit: 'videos' },
          { key: 'brands', label: 'Brands, each with its own package', default: 1, min: 1, max: 10, step: 1, unit: 'brands' },
        ],
        outputs: [
          {
            key: 'fee',
            label: 'Fee for each brand, before GST',
            formula:
              '50000 + 35000 * (floor(videos / 5) - 1) - 2500 * min(max(floor(videos / 5) - 2, 0), 2) + 0 / (1 - min(ceil(videos - 5 * floor(videos / 5)), 1)) + 0 / (floor(videos / 5) - 3)',
            format: 'inr',
          },
          { key: 'total', label: 'Total for all brands, before GST', formula: 'fee * round(brands)', format: 'inr' },
          { key: 'perVideo', label: 'Average per video, rounded', formula: 'fee / videos', format: 'inr' },
        ],
        disclaimer:
          'Package fees from our pricing page, worked out with the same rule. Fees exclude GST where applicable. One brand per package, fully prepaid. In-between quantities, such as 7 or 15 videos, are quoted in writing.',
      },
    },

    "Two things it won't do. It won't price 7 or 15 videos, because we quote in-between numbers in writing rather than guess. And it won't split one package across two brands, even for an agency.",

    'A bigger batch costs less per video for a plain reason. We produce a batch in one planned cycle, not one video at a time. The brief, the planning and the shoot set-up are largely shared, so each extra video carries less of them.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'what-moves-a-quote', text: 'What moves a vox pop quote up or down?', toc: 'What moves a quote' },

    "Scope. How many videos, locations and shoot days, who is on camera, the crew, permissions, props, participant thank-yous, revisions and how widely you'll use the videos. Each one changes the work, so each one changes the price.",

    `We won't put rupee figures on these. Rates vary by city, crew and season, and any number we gave for someone else's work would be a guess. Use the table to see why two quotes for "a vox pop video" can sit far apart.`,

    {
      type: 'table',
      caption: 'What tends to move a vox pop quote',
      head: ['Factor', 'Tends to push cost up', 'Tends to keep it down'],
      rows: [
        ['Number of videos', 'One-off videos, each planned from scratch', 'A batch planned and shot in one cycle'],
        ['Locations and days', 'Several spots across a city, or several days', 'One or two spots close together'],
        ['Who asks the questions', 'A presenter hired for the day, or extra takes while a founder warms up', 'An interviewer already on the crew'],
        ['Crew and audio', 'Several cameras, a sound recordist, lights', 'One camera and a clip-on mic per speaker'],
        ['Permissions', 'Metro stations, malls and other private property', 'Spots cleared in advance, or used before'],
        ['Props and products', 'Large props, built sets, product shipping', 'A product the host can hold'],
        ['Participant thank-you', 'Costly gifts for everyone approached', 'Something small, agreed in advance'],
        ['Revisions', 'New concepts or reshoots after the shoot', 'Direction locked before filming'],
        ['Usage and rights', 'Rights priced separately for ads or long periods', 'Your uses agreed up front'],
        ['Timeline', 'A rushed date that squeezes the planning', 'Time to plan, shoot and edit properly'],
      ],
      rowHeaders: true,
    },

    'Most of those rows are decisions made before anyone films. Lock them early and a quote has fewer surprises in it.',

    { type: 'h3', id: 'who-asks-the-questions', text: 'Who asks the questions' },

    "The interviewer is the line item people underrate. Stopping a stranger, keeping them for a minute and asking the follow-up that turns a polite answer into a real one is a skill.",

    "A phone can't do that part for you.",

    "With us, the questions are asked by our interviewer, or by your founder if you'd like them on camera with our team beside them[^ka-faq]. Where the interviewer represents your brand, we agree the introduction and positioning before the shoot.",

    { type: 'h3', id: 'locations-and-permissions', text: 'Locations and permissions' },

    "Every extra spot adds travel, set-up and waiting for the right crowd. Some spots add paperwork too. Bengaluru's Namma Metro, for example, needs prior permission and charges a fee for shoots[^bmrcl-shoots]. Malls are private property, so ask management first.",

    'If a quote includes a metro platform or a mall atrium, it should say who gets the permission and who pays for it.',

    { type: 'h3', id: 'props-and-products', text: 'Props and products' },

    "The cheapest prop is your product. A host holding it at chest height gives people something to react to, and it's already in your warehouse. Special locations and large props are a different matter. We batch-shoot, so we agree those in pre-production rather than add them on the day[^ka-faq].",

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Dyson',
      caption: "A product-led cut from CircleStore's library, titled after a single product. When the product is the prop, there is no set to build or hire.",
    },

    { type: 'h3', id: 'revisions-and-late-changes', text: 'Revisions and late changes' },

    'Revisions are where quotes quietly differ. Ours include minor, edit-level changes: text, trims, sequencing and captions. A different concept, format or setup, new footage or a reshoot is discussed separately first[^ka-faq].',

    "The expensive revision is the one that needs footage nobody shot. A change of direction after the shoot can mean extra editing, revised deliverables or a reshoot. That's why we lock direction, branding and must-haves before filming.",

    { type: 'h3', id: 'length-usage-and-rights', text: 'Length, usage and rights' },

    'Length moves the price less than people expect. YouTube Shorts and Instagram Reels both allow videos of up to three minutes[^shorts-three-minutes][^reels-three-minutes], but we cut each video as tight as its story allows. Editing time goes into finding the moment, not filling the running time.',

    'Usage is the line to read twice. Ask every supplier where you can use the videos, for how long and when the rights pass to you. A quote can cover organic posts and leave out ads. Ours include usage rights on full payment: your own brand channels, Instagram, YouTube Shorts and other platforms, ads included, on the terms of your pilot agreement.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'the-real-cost-of-diy', text: 'What does it really cost to do a vox pop yourself?', toc: 'The real cost of DIY' },

    "Less cash and more time. A phone and a clip-on mic will carry a first shoot. The real bill is two people's hours: one on the street, and one on the edit and everything after it.",

    'We want to be fair here: doing it yourself is a real option, and we think some brands should start that way.',

    "The format doesn't need a studio. It needs a good question, someone willing to ask it and someone patient enough to edit.",

    { type: 'h3', id: 'the-kit', text: 'The kit' },

    'The list is short. On a loud street, the mic matters more than the camera.',

    {
      type: 'list',
      items: [
        '**A recent phone.** Shoot vertical, at the best quality your storage allows.',
        '**A wireless clip-on mic with a windshield.** Traffic and wind ruin more street footage than bad framing does.',
        "**A power bank.** A morning of filming drains a phone faster than you'd think.",
        '**A small tripod or gimbal.** Optional, but it steadies the wide shot.',
        "**Any phone editor that's available in India.** CapCut, popular elsewhere, has been blocked here since 2020[^capcut-ban].",
        '**Printed release forms.** One for each person you feature.',
      ],
    },

    'Small kit has an upside beyond price. In our view, someone facing a phone stays more relaxed than someone facing a rig and three crew members.',

    { type: 'h3', id: 'the-two-roles', text: 'The two roles' },

    'Running it in-house takes two people who own it. One runs the street. The other runs everything after.',

    {
      type: 'comparison',
      title: 'Who does what on a DIY vox pop',
      left: {
        label: 'The street lead',
        items: [
          'Writes the question and the follow-up',
          'Picks the spot and the hour',
          'Asks an easy warm-up question first, then the real one',
          'Collects a signed release from everyone featured',
          'Keeps going after the fifth "no"',
        ],
      },
      right: {
        label: 'The output lead',
        items: [
          'Logs every clip and the exact phrases that landed',
          'Edits the opening, pacing, captions and ending',
          'Posts, then answers comments while people are still there',
          'Reads the numbers and suggests the next question',
        ],
      },
      verdict: 'If one person does both jobs, put both sets of hours against their name in the calculator below. The second set is the one that usually gets left out.',
    },

    { type: 'h3', id: 'costs-off-the-receipt', text: 'Costs that never show up on a receipt' },

    {
      type: 'list',
      items: [
        "**Releases and consent.** Get a signed release from everyone you feature, and tell them where the video will appear. India's data protection rules come into force in phases through 2027, so have a lawyer check your form[^dpdp-rules]. This is general information, not legal advice.",
        "**Under-18s.** Don't feature anyone under 18 without a parent's written consent.",
        "**Disclosure.** If anyone on camera is paid, works for you or was cast, India's endorsement guidelines expect you to say so clearly[^endorsement-guidelines].",
        "**The founder's hours.** If the founder hosts, every street hour is an hour away from the business.",
        "**The session that gives you nothing.** Some mornings don't work. Budget for one.",
      ],
    },

    'None of these should stop you, but every one of them belongs in the sum.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'diy-hours', text: 'How many hours does a DIY vox pop take?', toc: 'DIY hours' },

    'More than the shoot itself. Two hours on the street sits inside a week of planning, logging, editing, posting and reading replies. The sample week below shows where the rest goes, and the calculator after it prices your version.',

    {
      type: 'widget',
      widget: 'timeline',
      id: 'diy-week',
      props: {
        title: 'One DIY week, sketched',
        intro: 'A sample week for a two-person team, adapted from our playbook. Treat it as a planning aid, not a promise of speed. The first week usually runs long.',
        items: [
          {
            when: 'Monday',
            title: 'Pick one question',
            text: "Read your comments, DMs and reviews. Pick one question your buyers already argue about, and write the follow-up you'll ask after the first answer.",
            tasks: ["Write a warm-up question, something easy like which part of the city they're from", 'Choose the spot and the hour', 'Print the release forms'],
          },
          {
            when: 'Tuesday morning',
            title: 'Two hours on the street',
            text: "One spot, one question, one mic. Plan to talk to more people than you'll use, and keep going after the first few say no.",
          },
          {
            when: 'Tuesday afternoon',
            title: 'Log the clips',
            text: 'Put every clip in one folder. Write down the phrases that landed, word for word, and note who signed a release.',
          },
          {
            when: 'Wednesday',
            title: 'Cut the main video',
            text: 'Open on the strongest answer, keep the pacing tight, add captions and end clean. Turn the sharpest objection you heard into a carousel.',
          },
          {
            when: 'Thursday',
            title: 'Make a second piece',
            text: 'Script a slightly longer video that walks through the thinking behind the best answer.',
          },
          {
            when: 'Friday',
            title: 'Post and ask',
            text: 'Post, then ask viewers to agree or push back in the comments. Reply early, while people are still in the thread.',
          },
          {
            when: 'Saturday',
            title: 'Read the replies',
            text: 'Pick next week’s question from whatever people argued about.',
          },
          {
            when: 'Sunday',
            title: 'Rest',
            text: 'Really. A tired host asks flat questions.',
          },
        ],
      },
    },

    'Notice where the hours go. The street is one morning. The rest of the week is desk work, and most of it lands on the output lead.',

    { type: 'h3', id: 'put-a-number-on-diy', text: 'Put a number on DIY' },

    'Time is the cost people leave out of DIY sums. This calculator adds it back.',

    {
      type: 'widget',
      widget: 'calculator',
      id: 'diy-cost-calculator',
      props: {
        title: 'DIY cost calculator',
        intro: "Use your own hours and an honest value for an hour of your team's time. Count everyone on the street, host and helper alike.",
        inputs: [
          { key: 'videos', label: 'Videos you want from the batch', default: 5, min: 1, max: 40, step: 1, unit: 'videos' },
          { key: 'planHours', label: 'Planning hours: questions, spots, releases', default: 8, min: 0, max: 100, step: 1, unit: 'hours' },
          { key: 'streetHours', label: 'Street hours, added up for everyone there', default: 16, min: 0, max: 200, step: 1, unit: 'hours' },
          { key: 'editHours', label: 'Editing and caption hours for each video', default: 4, min: 0, max: 20, step: 0.5, unit: 'hours' },
          { key: 'hourValue', label: "What an hour of your team's time is worth", default: 600, min: 0, max: 10000, step: 50, unit: '₹' },
          { key: 'cash', label: 'Cash spent: kit, travel, any thank-you for participants', default: 8000, min: 0, max: 500000, step: 500, unit: '₹' },
        ],
        outputs: [
          { key: 'hours', label: 'Total hours', formula: 'planHours + streetHours + editHours * videos', format: 'number', decimals: 1, unit: 'hours' },
          { key: 'timeCost', label: 'What those hours are worth', formula: 'hours * hourValue', format: 'inr' },
          { key: 'totalCost', label: 'Time plus cash', formula: 'timeCost + cash', format: 'inr' },
          { key: 'perVideo', label: 'Time plus cash, per video', formula: 'totalCost / videos', format: 'inr' },
        ],
        disclaimer: 'Your own numbers, for planning only. The starting figures are placeholders, not typical costs, benchmarks or our prices.',
      },
    },

    "We'd look at the editing line first. Finding three good seconds in a long clip takes longer than people expect. We think it's also the skill that improves fastest with practice.",

    {
      type: 'comparison',
      title: 'Where each option earns its cost',
      left: {
        label: 'Doing it yourself',
        items: [
          'The lowest cash outlay',
          'You learn the format first-hand',
          'You hear every answer yourself, which is research in its own right',
          'Harder to keep up once you want more than a few videos',
        ],
      },
      right: {
        label: 'A vox pop studio like ours',
        items: [
          'Questions, interviewer, shoot and edit in one fee',
          'Variety planned across a whole batch',
          'Your team keeps its hours',
          'More cash up front, and our fee is prepaid',
        ],
      },
      verdict: 'Neither one wins for everyone. A sensible pattern is to learn the format with a small DIY shoot, then bring in help when you want batches.',
    },

    'If you go the DIY route, our [30-day system for small businesses](/blog/street-interviews-for-small-business) lays out a month of it, one theme at a time.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'cost-per-usable-video', text: 'What is the cost per usable video?', toc: 'Cost per usable video' },

    "It's what a batch cost you, cash and time together, divided by the videos you'd actually post. It's fairer than price per video, because a video you won't post costs money and gives you nothing back.",

    {
      type: 'definition',
      id: 'cost-per-usable-video-term',
      term: 'Cost per usable video',
      text: 'The total cost of a batch of vox pop videos, cash and time together, divided by the number of videos from it you would publish as they are.',
    },

    "The idea comes from our playbook, which asks what each real moment on the street costs you rather than what the production cost. We've narrowed it to whole videos, because that's what you post.",

    'Picture two batches. The first costs less, but only a couple of its videos are good enough to post. The second costs more, and you would post nearly all of it. Divide each bill by what you would actually use, and the cheap batch can turn out to be the expensive one.',

    'Two rules keep the number honest.',

    {
      type: 'list',
      ordered: true,
      items: [
        `**Count only videos you'd post today, as they are.** "Fine after a reshoot" doesn't count.`,
        "**Count every cost.** Fees, kit, travel, thank-yous and your team's hours, including the hours spent reviewing.",
      ],
    },

    {
      type: 'widget',
      widget: 'calculator',
      id: 'cost-per-usable-video-calculator',
      props: {
        title: 'Cost per usable video',
        intro: 'Use it on any batch: DIY, freelance or ours. Count only the videos you would post as they are.',
        inputs: [
          { key: 'batchCost', label: 'What the batch cost you, cash plus time', default: 60000, min: 1000, max: 2000000, step: 1000, unit: '₹' },
          { key: 'finished', label: 'Finished videos in the batch', default: 10, min: 1, max: 100, step: 1, unit: 'videos' },
          { key: 'usable', label: 'Videos you would post as they are', default: 8, min: 1, max: 100, step: 1, unit: 'videos' },
          { key: 'extras', label: 'Other pieces you will make from the batch: ad cuts, stills, carousels', default: 4, min: 0, max: 200, step: 1, unit: 'pieces' },
        ],
        outputs: [
          { key: 'perFinished', label: 'Cost per finished video', formula: 'batchCost / finished', format: 'inr' },
          { key: 'perUsable', label: 'Cost per usable video', formula: 'batchCost / min(usable, finished)', format: 'inr' },
          { key: 'perPiece', label: 'Cost per piece you publish, extras included', formula: 'batchCost / (min(usable, finished) + extras)', format: 'inr' },
          { key: 'share', label: 'Share of the batch you would post', formula: 'round(min(usable, finished) / finished * 100)', format: 'percent' },
        ],
        disclaimer: 'Your own figures, for comparison only. The starting numbers are placeholders, not benchmarks or our prices, and nothing here predicts how any video will perform.',
      },
    },

    "Leave views and sales out of this sum. They depend on your platform, audience, account history, media spend, offer and distribution, so we never promise them, and nobody quoting you should either.",

    'Extras are worth counting, though. A strong answer can also become an ad cut, a hook test or a quote on a carousel. Check your rights terms first: where you can use the footage, and in what form.',

    "If you're weighing a vox pop batch against creator content, run the same sum on both. Our [vox pop vs UGC comparison](/blog/vox-pop-vs-ugc) covers the rest of that decision.",

    // ------------------------------------------------------------------
    { type: 'h2', id: 'why-the-first-shoot-costs-most', text: 'Why does the first shoot cost the most?', toc: 'Why the first shoot costs most' },

    "Because it carries all the set-up. The first time, you're writing questions from scratch, finding spots, settling an edit style and learning what your audience reacts to. Later batches reuse most of that.",

    "Our package fees don't change with the batch number. They change with the batch size.",

    'What changes from batch to batch is how much is already decided. Whoever runs the shoot, five things carry over.',

    {
      type: 'list',
      items: [
        '**The question bank.** You learn which questions get stories and which get shrugs.',
        '**The spot map.** You find which spots and hours bring the people you want, and which bring only people in a rush.',
        '**The edit style.** Caption style, opening pattern and pacing settle after a few videos.',
        '**The brief.** Your must-haves and things to avoid are written once, then tightened.',
        '**The review rhythm.** One point of contact and consolidated feedback make each round quicker.',
      ],
    },

    "That's the creative loop we work in: hypothesis, interaction, production, edit, learn, improve. Each batch's last step feeds the next batch's first.",

    "For DIY, the same logic applies with more force. Your first week includes learning the kit, the edit and your own nerves. Don't judge the format on week one's cost per video.",

    "With a studio, it's the reason a trial exists. You see the format on your own brand before you commit to a batch.",

    // ------------------------------------------------------------------
    { type: 'h2', id: 'how-to-compare-quotes', text: 'How do you compare two vox pop quotes?', toc: 'How to compare quotes' },

    'Line them up item by item. Two quotes for "10 vox pop videos" can describe very different jobs. The gap sits in who writes the questions, who interviews, how many people are approached, revisions, rights, releases and when the money is due.',

    'Use the checklist on every quote you hold, ours included. Tick what each supplier has confirmed in writing.',

    'Anything left unticked is a question for your next call.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'quote-comparison-checklist',
      props: {
        title: 'Quote comparison checklist',
        intro: 'Run it once per quote. Your ticks are saved in this browser only.',
        items: [
          { id: 'who-writes', text: 'Who writes the questions and concepts?', detail: 'Ask how they would plan one video: the question, the follow-up and the idea, such as a reveal or an A/B choice.' },
          { id: 'who-interviews', text: 'Who interviews on camera, and who are they speaking for?', detail: 'Their interviewer, a freelancer or your founder. Agree the introduction before the shoot.' },
          { id: 'how-many-approached', text: 'How many people will they talk to for each video?', detail: 'More conversations than videos is normal. Ask how they choose who to approach.' },
          {
            id: 'real-or-cast',
            text: 'Are the people real passers-by, or cast?',
            detail: "Cast or paid people are a different product. If anyone has a material connection to the brand, India's endorsement guidelines expect clear disclosure[^asci-influencer].",
          },
          { id: 'variety', text: 'Does each video get its own idea, or is one question repeated?', detail: 'A batch of the same question in different places wears thin quickly.' },
          { id: 'crew-audio', text: 'What crew and kit come on the day?', detail: 'Ask about audio first. On a busy footpath, a clip-on mic per speaker matters more than a better camera.' },
          { id: 'locations', text: 'How many locations and shoot days are included?', detail: "And who arranges permission where it's needed, such as a metro station or a mall." },
          { id: 'thank-you', text: 'Is there a thank-you for participants, and who pays for it?', detail: 'A simple thank-you helps people stop. It should never decide what they say.' },
          { id: 'edit', text: 'What does the edit include?', detail: 'Strong openings, tight pacing, captions, clean endings and vertical exports for Reels and Shorts.' },
          { id: 'revisions', text: 'What counts as a revision, and what counts as a new concept?', detail: 'Get the line in writing: trims and captions on one side, new footage and reshoots on the other.' },
          { id: 'raw-footage', text: 'Is raw footage delivered, and on what terms?' },
          { id: 'rights', text: 'Where can you use the videos, for how long, and when do the rights pass to you?', detail: 'Organic posts and ads are different uses. Check that both are covered.' },
          { id: 'releases', text: 'Who collects signed releases from everyone featured?', detail: "Nobody under 18 on camera without a parent's written consent." },
          { id: 'timeline', text: 'When is the delivery timeline confirmed, and in which document?' },
          { id: 'payment', text: 'When is the money due, and what happens if a payment is late?' },
          { id: 'tax', text: 'Is the price before or after GST?' },
          { id: 'brands', text: 'Does the quote cover one brand or several?', detail: "Agencies: check whether a package can be shared. Ours can't." },
          { id: 'trial', text: 'Can you see the format on your own brand first, with the trial terms in writing?' },
        ],
        done: 'Every box ticked. Now put each quote through the cost per usable video calculator above.',
      },
    },

    {
      type: 'callout',
      tone: 'warning',
      title: 'What makes a low quote expensive later',
      text: 'Watch for these three. Each one turns a saving into a second bill.',
      items: [
        'Revisions that cover trims but not a missing shot, so a late change becomes a reshoot.',
        'Rights that cover organic posts but not ads, or only for a short period.',
        'Cast people presented as strangers, which you would have to disclose.',
      ],
    },

    'And one thing makes a higher quote cheaper than it looks: a batch where nearly every video is one you would post.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'is-the-trial-paid', text: 'Is the trial paid?', toc: 'Is the trial paid?' },

    "The trial's scope, the number of trial videos and any trial fee are confirmed in writing between us. Ask about a trial for your brand and we'll set it out.",

    'Our [FAQ answer on trial terms](/faq/is-the-trial-free) says the same. Two more things are worth knowing before you plan around it.',

    {
      type: 'list',
      items: [
        "**Trial videos are for evaluation only.** They can't be published, boosted, used in ads, repurposed or sublicensed unless a paid engagement is confirmed in writing.",
        '**Nothing in the trial commits either of us** to a paid pilot.',
      ],
    },

    'So treat the trial as a way to judge the format on your own product, not as your first piece of content.',

    '[How the trial works](/trial) has the detail. The short brief asks for your objective, how prominent the brand should be, what every video must include, a simple brand guide and 3 to 5 reference videos.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'how-payment-works', text: 'How does payment work?', toc: 'How payment works' },

    'Everything is prepaid. The full package fee is paid in advance, and production begins when payment arrives.',

    {
      type: 'steps',
      id: 'payment-steps',
      title: 'How payment works, in four steps',
      steps: [
        { name: 'Confirm and sign', text: 'Confirm the package and sign the pilot agreement.' },
        { name: 'Receive the invoice', text: 'Expect an invoice from us for the package fee, with GST added where applicable.' },
        { name: 'Pay in advance', text: 'Pay the full package fee in advance, before pre-production or production begins.' },
        { name: 'Start production', text: 'Production begins when payment arrives. Delivery timelines are confirmed in the pilot agreement once pre-production alignment is complete.' },
      ],
    },

    {
      type: 'callout',
      tone: 'note',
      title: 'If a payment is late or partial',
      text: 'The pilot agreement sets out what happens. Refund and delivery terms are in it too.',
      items: ['Work may be paused', 'Delivery of edited videos and/or raw footage may be withheld', 'Usage rights stay suspended'],
    },

    'Plan your cash flow around that. There is no monthly plan, so a 10 video package means ₹85,000 plus GST where applicable, paid before pre-production starts.',

    // ------------------------------------------------------------------
    { type: 'h2', id: 'before-you-ask-for-quotes', text: 'What should you do before asking for quotes?', toc: 'Before you ask for quotes' },

    "Run your own numbers first. Put your team's hours into the DIY calculator, decide how many videos you'd actually post in a month, and write down one question you'd want strangers to answer.",

    `Don't skip the question. Try it on the next two people who walk into your office or shop. If one of them starts with "Once, I…" rather than "It's fine", you have a street question. Send it with every quote request, and each supplier can price a real shoot instead of a vague idea.`,

    'Every batch we make starts from a brief, and a question like that is a good first line for one. If you would like to see the format on your own brand first, [request a trial video](/contact). Scope, the number of trial videos and any fee are confirmed in writing.',
  ],

  faqs: [
    {
      q: 'How much does one vox pop video cost?',
      a: 'With Kreators.Army, one vox pop video works out at ₹10,000 in the 5 video package (₹50,000), ₹8,500 in the 10 (₹85,000) and ₹7,500 in the 20 (₹1,50,000). GST is extra where applicable. Other suppliers price differently, and their per-video figure depends on what the quote leaves in or out. [Our pricing FAQ](/faq/how-much-does-it-cost) has the short version.',
    },
    {
      q: 'Is GST included in the price?',
      a: "No. Kreators.Army fees exclude applicable taxes, including GST where applicable, so GST is added to the package fee on the invoice. When you compare suppliers, check whether each quote is before or after tax. Two quotes can look further apart than they are simply because one includes GST and the other doesn't.",
    },
    {
      q: 'Can I order 7 or 15 videos?',
      a: 'Yes, but not at a listed price. Quantities between the packages are quoted in writing before work begins. The listed packages are 5, 10 and 20 videos for one brand. Beyond 20, videos are added in blocks of 5 at ₹35,000 a block (₹7,000 a video), with GST extra where applicable.',
    },
    {
      q: 'Can an agency split a package across brands?',
      a: "No. Each Kreators.Army package is for one brand, and packages can't be combined, pooled or split across brands. That includes agencies working with several brands: each brand needs its own package. Every brand gets its own planning, questions and shoot, so the fee is set per brand.",
    },
    {
      q: 'Is it a monthly plan?',
      a: "No. Kreators.Army doesn't sell a monthly plan. You pay per package: one batch of videos for one brand, paid in full in advance. If you want a steady flow of street interviews, you plan batches around your calendar, and each batch is its own package with its own pre-production.",
    },
    {
      q: 'Do you charge for the trial?',
      a: "Kreators.Army confirms the trial's scope, the number of trial videos and any trial fee in writing, brand by brand. Ask about a trial for yours and we'll set it out. Trial videos are for evaluation only: they can't be published, boosted or used in ads. Budget for the trial as a test of the format on your own product.",
    },
    {
      q: 'Do people get paid for street interviews?',
      a: 'Sometimes. On a Kreators.Army shoot, a simple incentive, ideally something physical or redeemable on the spot, can help people stop and spend a minute with the host. It never decides what they say, and the exact incentive is agreed in pre-production. On a DIY shoot, put it in the cash line of the calculator, and give everyone the same thing whatever they answer.',
    },
    {
      q: "What's included in every package?",
      a: 'Every Kreators.Army package includes the same ten things. Before the shoot: concepts, questions and interactions planned for your objective, variety across the batch and pre-production alignment. On the street: the interviewer, participant selection, on-ground direction, and professional framing and audio. After it: short-form editing with captions, review checkpoints where useful, minor edit-level revisions, vertical videos for Reels and Shorts, and usage rights on full payment.',
    },
    {
      q: 'Who owns the videos?',
      a: "The pilot agreement sets the exact terms, so read that clause before you sign. Usage rights for the final videos transfer to you on full payment. After that, the videos can run on your own brand channels, across Instagram, YouTube Shorts and other platforms, including ads. You don't need to post them on our channel. Trial videos are different: they're for evaluation only.",
    },
    {
      q: 'Is doing it yourself cheaper?',
      a: 'In cash, usually yes. A phone, a clip-on mic and a power bank will carry a first shoot. In time, it costs more: someone has to plan the questions, stop strangers, collect releases and edit. Put your hours into the DIY calculator in this guide, then compare the result with any quote on cost per usable video.',
    },
  ],

  sources: [
    {
      id: 'ka-pricing',
      title: 'Pricing',
      url: '/pricing',
      publisher: 'Kreators.Army',
      note: 'lib/content.ts PACKAGES, ADD_ON, PACKAGE_INCLUDES, PRICING_RULES and PAYMENT_STEPS: the fees, per-video rates, blocks of 5, GST, one brand per package, prepayment.',
    },
    {
      id: 'ka-faq',
      title: 'Frequently asked questions',
      url: '/faq',
      publisher: 'Kreators.Army',
      note: 'lib/content.ts FAQS: who asks the questions, participant incentives, revisions, changes after the shoot, special locations and props, where the videos can be used, the trial.',
    },
    {
      id: 'bmrcl-shoots',
      title: 'Bengaluru: After 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023-11-25',
      note: 'CLAIMS P06: Namma Metro shoots need prior permission and a fee.',
    },
    {
      id: 'shorts-three-minutes',
      title: 'YouTube is letting Shorts be longer',
      url: 'https://www.tubefilter.com/2024/10/03/youtube-shorts-three-minutes-max-length-redesign-trends-templates/',
      publisher: 'Tubefilter',
      date: '2024-10-03',
      note: 'CLAIMS E20: vertical or square uploads of up to 3 minutes count as Shorts from 15 October 2024.',
    },
    {
      id: 'reels-three-minutes',
      title: 'Instagram expands Reels length to 3 minutes following creator feedback',
      url: 'https://lindseygamble.com/blog/instagram-three-minute-reels',
      publisher: 'Lindsey Gamble',
      date: '2025-01',
      note: 'CLAIMS E21: Instagram extended Reels to 3 minutes in January 2025 (Adam Mosseri).',
    },
    {
      id: 'capcut-ban',
      title: "Xiaomi Browser, ByteDance's CapCut among 47 Chinese apps banned by India last week",
      url: 'https://inc42.com/buzz/xiaomi-browser-bytedances-capcut-among-47-chinese-apps-banned-by-india-last-week',
      publisher: 'Inc42',
      date: '2020-08-05',
      note: 'CLAIMS P04: CapCut has been blocked in India since 2020.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI, via The Week',
      date: '2025-11-14',
      note: 'CLAIMS P07: DPDP Rules notified November 2025; consent and notice duties phase in through 2027.',
    },
    {
      id: 'endorsement-guidelines',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose any material connection with labels such as "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'asci-influencer',
      title: 'Guidelines for influencer advertising in digital media',
      url: 'https://www.ascionline.in/social/wp-content/uploads/2025/04/ASCI-Influencer-Guidelines.pdf',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS 5.7 and E26: material connections must be disclosed clearly.',
    },
  ],

  related: ['vox-pop-vs-ugc', 'street-interviews-for-small-business', 'what-goes-in-a-vox-pop-brief', 'how-a-vox-pop-shoot-works'],
};

export default post;
