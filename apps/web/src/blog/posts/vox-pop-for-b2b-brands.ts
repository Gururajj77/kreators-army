import type { Post } from '../types';
import meta from './vox-pop-for-b2b-brands.meta';

const post: Post = {
  meta,

  answer:
    "Vox pop, a short unscripted street interview, fits B2B and SaaS brands when you film where buyers gather, such as events, meetups and co-working spaces, or ask the people your product serves. Kreators.Army's advice: ask about the job, the frustration and the workaround, not the product. Then use the answers to sharpen your messaging and your LinkedIn posts.",

  takeaways: [
    "Vox pop suits B2B for messaging research, events, founder-led video and hiring. It's a weak way to find leads on broad consumer feeds.",
    "Film where buyers already gather: event floors, meetups and co-working spaces. Or ask the people your customers serve, out on the street.",
    'Ask people about their work: what they do, what slows them down and what they use instead of a proper tool. Keep your product out of the first question.',
    "Read your main line to people who've never heard of you before you film anything. The gap between what you meant and what they heard is your brief.",
    "On LinkedIn, lead with a professional contrast and post from a person's profile. A four-slide FLIP carousel turns one answer into an argument.",
    'At work events, watch badges, screens and company names, and disclose anyone on staff or paid. Judge the work by the conversations it starts.',
  ],

  body: [
    // ---------------------------------------------------------------- Lead
    "“Will this format work for my brand?” is a real question on our FAQ page. Our answer there is honest: it works best for physical products, because people can hold them, try them and react on camera.",

    "Software doesn't fit in anyone's hand. Nobody laughs at a payroll tool outside a metro exit. So if you market a B2B or SaaS product, you have good reason to doubt the format. We would too.",

    "Look at what carries a good vox pop, though. The product is often a prop. The engine is one question that strangers can answer honestly, on the spot. Work is full of those: the task that eats every Tuesday afternoon, the tool everyone quietly avoids, the meeting that should have been an email.",

    "Below are four formats that suit business buyers, a question builder with 14 templates, a seven-step messaging test that needs no camera, and a LinkedIn carousel you can fill in. Where B2B vox pop is the wrong tool, we say so.",

    // ---------------------------------------------------------------- Fit
    { type: 'h2', id: 'does-vox-pop-work-for-b2b', text: 'Does vox pop work for B2B?', toc: 'Does it work for B2B?' },

    "Yes, for some jobs. Vox pop is strong for B2B messaging research, event content, founder-led video and hiring. It's weak as a direct source of leads on broad feeds, because most people who watch a street interview will never buy business software.",

    {
      type: 'definition',
      id: 'vox-pop',
      term: 'Vox pop',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    "The name is short for the Latin _vox populi_, “the voice of the people”[^merriam-webster]. Our guide to [what vox pop content is](/blog/what-is-vox-pop-content) covers the basics, so here we stay with selling to businesses.",

    "B2B buying works differently from picking a snack. The buyer is often a team, the decision can take months, and the person who signs isn't always the person who uses the product. A clip that makes a stranger laugh does little for a deal that needs three approvals.",

    'We think vox pop earns its place in B2B when the question is about work. It struggles when the clip has to do the selling.',

    {
      type: 'table',
      caption: "Where B2B vox pop fits, and where it doesn't",
      head: ['Job', 'Fit', 'Why'],
      rows: [
        ['Testing your messaging', 'Strong', 'Anyone can tell you what a sentence means to them'],
        ['Event content', 'Strong', 'Your buyers are in one room, already thinking about the subject'],
        ['Founder-led video', 'Strong', 'A person asking real questions beats a logo talking'],
        ['Hiring and culture', 'Good', 'People talk about work easily; disclose any staff on camera'],
        ["Your customers' customers", 'Good', 'Shows buyers you understand the people they serve'],
        ['Product demos', 'Weak', 'Software on a screen rarely gets a reaction worth filming'],
        ['Leads from broad consumer feeds', 'Weak', 'Most viewers will never be buyers'],
      ],
      rowHeaders: true,
    },

    'The strong rows share one thing: the person answering knows more about the subject than the person asking.',

    'There is also a gap in how B2B brands talk. Our read is that the category leans hard on experts and data: whitepapers, analyst quotes, benchmark reports. The voice of someone who does the job turns up far less.',

    'Research on news audiences suggests that voice carries weight. In a 2022 experiment with TV news items, viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-pop-vs-expert].',

    'Media researchers call the wider effect exemplification: one vivid person on screen tends to sway judgements more than a percentage does[^exemplification]. Your whitepaper is the expert quoting the poll. A street answer is the exemplar. A B2B plan has room for both.',

    {
      type: 'callout',
      tone: 'note',
      title: 'A format started by ad salesmen',
      text: 'A radio show named after the phrase began in Houston in 1932, when two advertising salesmen, Parks Johnson and Jerry Belcher, carried microphones into the street to ask passers-by what they thought[^vox-pop-radio].',
    },

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. Our formats for events and for founders sit closest to B2B work, and this guide draws on both.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'When to skip it',
      text: 'Some B2B problems need a different tool. Be honest with yourself before you plan a shoot.',
      items: [
        'If you know every buyer by name, call them. A public clip is the wrong channel for a market of forty companies.',
        'If the product needs a ten-minute walkthrough to make sense, record a demo instead.',
        "If your buyers can't discuss their work in public, as in parts of banking, defence or security, the people you need won't talk on camera.",
        "If you need leads by next week, a street shoot won't produce them on that clock.",
      ],
    },

    // ---------------------------------------------------------------- Formats
    { type: 'h2', id: 'four-b2b-formats', text: 'What are the four B2B vox pop formats?', toc: 'Four B2B formats' },

    'Four formats fit B2B best. Two happen where buyers already gather: the event floor, and co-working spaces with meetups. The other two change who asks or who answers: the founder with the mic, and the end customer on the street. Those two get their own section below.',

    { type: 'h3', id: 'the-event-floor', text: 'The event floor' },

    'Events are the easiest place to start.',

    'Launches, meetups, conferences and trade shows are full of people who chose to spend a day thinking about one subject. As [our events page](/events) puts it, every event is a street interview.',

    "Plan the questions before the doors open. Then stand where people wait, away from where they're sold to. Our advice is to pick the coffee queue over your own stall, because an answer given at your stall looks staged, even when it isn't.",

    'Timing matters as much as position. The best windows are the gaps in the programme:',

    {
      type: 'list',
      items: [
        '**Before the first session,** while people queue for badges and coffee.',
        '**The tea break,** when the floor fills up again for a few minutes.',
        '**The half-hour after the last talk,** when people are still arguing about it.',
      ],
    },

    'During a keynote the floor empties, and the people left on it are usually working the stalls.',

    'Shows and tours need a different cut. Our events page describes it as a short recap that brings people who missed it into the room, which is what our work with Rode does.',

    {
      type: 'video',
      brand: 'Rode',
      title: 'Event Showreel',
      caption: 'Rode, “Event Showreel”. An event recap from our library.',
    },

    'A recap and a floor interview do different jobs. The recap tells people what they missed. The floor interview gives them one answer to argue with.',

    'Plan both before the day, because they need different shots. The recap wants wide shots of the room, the stage and the crowd. The floor interview wants a quieter corner and clean audio, which is harder than it sounds in a hall that echoes.',

    {
      type: 'video',
      brand: 'Offlyn',
      title: 'On Kreator Events',
      caption: 'Offlyn, “On Kreator Events”. Another event video from our library.',
    },

    { type: 'h3', id: 'coworking-and-meetups', text: 'Co-working spaces and meetups' },

    'Co-working spaces and community meetups gather the people many B2B products are built for: founders, designers, developers, sales teams and the people who run small agencies.',

    "Both are private spaces with a host. Ask the operator or organiser first, agree where you'll stand and how people can decline, and keep it short. People at a co-working space are at work, so two minutes is a lot to ask.",

    'Picture a co-working floor in HSR Layout at 4 pm, when the chai comes round and people step away from their screens. That break is your window. Ask in the pantry or on the balcony, never at someone’s desk, where a laptop full of client work sits behind every answer.',

    'Meetups are friendlier, because people came to talk and the organiser can introduce you. Our events page describes our meetup work with Ansh Mehra as real conversations with the people who turned up.',

    {
      type: 'video',
      brand: 'Ansh',
      title: 'design',
      caption: 'Ansh Mehra, “design”. The question, as our home page gives it: what does AI change about design?',
    },

    'That is a professional question with no product in it. Anyone who works with design tools has a view, and nobody needs a brief to answer it.',

    'Questions about tools, AI and the future of a job suit this format, as long as you ask what people think rather than what their company plans.',

    // ---------------------------------------------------------------- Founders and end customers
    { type: 'h2', id: 'founders-and-end-customers', text: 'How do founder-led and end-customer vox pops work?', toc: 'Founders and end customers' },

    'Both change who stands at each end of the mic. In a founder-led vox pop, your founder asks the questions. In an end-customer vox pop, the people your buyers serve give the answers.',

    { type: 'h3', id: 'founder-with-the-mic', text: 'Founder with the mic' },

    "In this format the founder runs the interviews, with our anchors and crew beside them, as [our page on founder-led vox pop](/founders) describes. It suits B2B, where the founder is often the company's most visible voice, especially on LinkedIn.",

    "The same page puts the idea in seven words: a founder asking beats a brand telling. A founder asking strangers about the problem the company solves is seen listening, and the answers give them something to react to besides their own pitch.",

    {
      type: 'video',
      brand: 'FyndFlow',
      title: 'Who should Pay',
      caption: 'FyndFlow, “Who should Pay”. One of the videos on our founders page. The question is in the title: who should pay?',
    },

    'Prepare a founder the way you would for a panel, only shorter. Four things are worth rehearsing before they pick up the mic:',

    {
      type: 'list',
      items: [
        "**The introduction.** We agree it before the shoot, so people know who's asking. Then the founder says it aloud until it sounds like them and not like the deck.",
        '**One follow-up, by heart.** “Interesting, why though?” is enough. A founder reading from a card has stopped listening.',
        '**An exit line.** A polite way to end an interview that is going nowhere, such as “That’s great, thank you.” The crew should know it too.',
        '**The reply to criticism.** Someone will knock the category, or the company. The founder asks why, then lets it run.',
      ],
    },

    'Our rule for founders: ask, never correct. The moment a founder argues with an answer, the video turns into a pitch.',

    'One more idea from that page fits B2B: a question of the week, one sharp question from your category asked again and again as a series. Sociologists Horton and Wohl described a familiar presenter as creating “intimacy at a distance”[^para-social]. A founder who turns up with the mic every week can build some of that.',

    { type: 'h3', id: 'end-customer-on-the-street', text: 'The end customer on the street' },

    "Many B2B products end up serving ordinary people, an arrangement some marketers call B2B2C. Payments, delivery, booking, payroll and support software all touch people who never chose that software.",

    'Those people are out on the street, with opinions about the experience your customers give them.',

    'Say you sell billing software to kirana (neighbourhood grocery) stores. Your buyers are the store owners, but their customers are on every street. Ask the customers about paying, never about the store.',

    {
      type: 'script',
      id: 'end-customer-questions',
      title: 'Three questions for the end customer',
      context: 'An illustration for a made-up billing software company. The questions are about the experience of paying, not about any named shop.',
      lines: [
        { speaker: 'Host', text: 'Quick one. At a small shop, UPI or cash, and why?' },
        { speaker: 'Host', text: 'What’s the most annoying thing that happens at the counter when you pay?' },
        { direction: 'If they mention a payment that failed or a “server down” sign, that is the story. Let them finish it, then ask the follow-up.' },
        { speaker: 'Host', text: 'Interesting, why though?' },
      ],
    },

    "Your buyers have a reason to watch those answers, because it's their own customers talking. A short clip of shoppers describing a slow checkout can say more in a sales meeting than a slide that claims to know the market.",

    "The same move works in other categories. Find the moment your product touches a stranger's day, and ask about that moment.",

    {
      type: 'table',
      caption: 'B2B products, and the end customers you can ask on the street',
      head: ['If you sell', 'Ask', 'A question to try'],
      rows: [
        ['Billing or payments software', 'Shoppers', '“Has a payment ever failed at the counter? What happened next?”'],
        ['Delivery and logistics software', 'People who order in', '“When a delivery goes wrong, who do you blame?”'],
        ['Booking software for clinics or salons', 'Anyone who books appointments', '“What’s the most annoying part of booking anything?”'],
        ['Payroll and HR software', 'People on their way to work', '“When did you last read your payslip properly?”'],
        ['Customer support software', 'Anyone with a phone', '“What’s the longest you’ve waited for a company to reply?”'],
      ],
      rowHeaders: true,
    },

    "Notice that no question names a shop, a company or a product. Keep it that way. Asking strangers to rate a specific business invites complaints you couldn't publish anyway.",

    // ---------------------------------------------------------------- Picker
    { type: 'h2', id: 'which-format-first', text: 'Which B2B format should you start with?', toc: 'Which format first' },

    "Start from the job you need done this quarter, and let the format follow. If you aren't sure your main line lands with buyers, test it before you film anything.",

    'The picker asks three questions and suggests a format, with two starter questions for each.',

    {
      type: 'widget',
      widget: 'picker',
      id: 'b2b-format-picker',
      props: {
        title: 'Which B2B vox pop format fits your goal?',
        intro: 'Pick the answer closest to your situation for each question. The format named most often wins.',
        questions: [
          {
            q: 'What do you need most this quarter?',
            options: [
              { text: "Clearer messaging. We're not sure our main line lands.", outcomes: ['pressure-test', 'end-customer'] },
              { text: "Content from an event we're running or attending", outcomes: ['event-floor'] },
              { text: 'A voice for our founder on LinkedIn', outcomes: ['founder-mic'] },
              { text: 'Hiring content that shows what the work is like', outcomes: ['workspace'] },
            ],
          },
          {
            q: 'Who has to appear in the video?',
            options: [
              { text: 'People who do the job our buyers do', outcomes: ['workspace', 'event-floor'] },
              { text: 'The people our customers serve', outcomes: ['end-customer'] },
              { text: 'Our founder, asking the questions', outcomes: ['founder-mic'] },
              { text: "Nobody yet. We're testing words, not filming.", outcomes: ['pressure-test'] },
            ],
          },
          {
            q: 'What access do you have in the next month?',
            options: [
              { text: 'A stall, a talk or a ticket at an event', outcomes: ['event-floor'] },
              { text: 'A meetup or co-working space that will let us in', outcomes: ['workspace'] },
              { text: "A busy public place where our customers' customers pass", outcomes: ['end-customer'] },
              { text: "Our founder's calendar, and not much else", outcomes: ['founder-mic'] },
              { text: 'Nothing booked yet', outcomes: ['pressure-test'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'event-floor',
            title: 'The event floor',
            text: 'Interview people on the floor at a launch, meetup, conference or trade show. Plan the questions before the doors open, and stand where people wait.',
            reasons: [
              'Your buyers are already in one place, thinking about the same subject.',
              'Starter: “What’s one thing you heard today that you disagree with?”',
              'Starter: “What problem did you come here hoping to solve?”',
            ],
          },
          {
            id: 'founder-mic',
            title: 'Founder with the mic',
            text: 'Your founder runs the interviews with a crew beside them, asking people about the problem the company exists to solve.',
            reasons: [
              'It gives the founder something to react to besides their own pitch.',
              'Starter: “What’s the most annoying part of your week at work?”',
              'Starter: “What do you do when the tool you’re given doesn’t work?”',
            ],
          },
          {
            id: 'end-customer',
            title: 'The end customer on the street',
            text: 'Ask the people your customers serve about the moment your product touches, such as paying, booking or getting a delivery.',
            reasons: [
              'Your buyers get to watch their own customers talk.',
              'Starter: “What’s the most annoying thing that happens when you pay at a shop?”',
              'Starter: “When a delivery goes wrong, who do you blame?”',
            ],
          },
          {
            id: 'workspace',
            title: 'Co-working spaces and meetups',
            text: "Ask professionals about their work where they already gather, with the operator's or organiser's permission.",
            reasons: [
              'Good for hiring content and for questions about tools and careers.',
              'Starter: “What’s one skill you wish someone had taught you before your first job?”',
              'Starter: “Which meeting this week should have been an email?”',
            ],
          },
          {
            id: 'pressure-test',
            title: 'A messaging test before any camera',
            text: 'Read your main line to people who have never heard of you and ask what they think it means. Film once the line survives.',
            reasons: ['A confusing message stays confusing on camera.', 'Start with [the steps for testing your messaging](#test-your-messaging).'],
          },
        ],
      },
    },

    "One outcome isn't a video at all, and that's deliberate. Filming a message that confuses people only records the confusion.",

    'Whichever format you choose, plan several cuts from one shoot. Single answers go to the feed and a recap to the company page. A short reel of the best moments belongs in a sales deck or the follow-up email after an event.',

    {
      type: 'video',
      brand: '8Club',
      title: 'Demo Reel',
      caption: '8Club, “Demo Reel”. As the title says, a demo reel: the kind of cut that belongs on a company page or in a deck.',
    },

    // ---------------------------------------------------------------- Questions
    { type: 'h2', id: 'questions-that-work', text: 'What questions work for B2B vox pops?', toc: 'Questions that work' },

    'Ask about the job, the frustration and the workaround. People talk about their own work readily, and in detail. Questions about your product get polite, short answers that rarely make a clip.',

    'You already know what your product does. The street tells you how people describe the problem it solves, in words your marketing team would never write. Four families of questions get you there.',

    {
      type: 'list',
      items: [
        '**The job:** what someone does all day. “Walk me through the first hour of your workday.” “What’s the part of your job nobody else sees?”',
        '**The frustration:** where the time and patience go. “What’s one task that takes longer than it should?” “Which meeting this week should have been an email?”',
        '**The workaround:** what people do instead of using a proper tool. “What do you use for that: a spreadsheet, a WhatsApp group or someone’s memory?”',
        '**The contrast:** where two views of the same work collide. “What does your manager think takes five minutes that actually takes a day?”',
      ],
    },

    'We think the workaround is the most useful family, and the easiest to skip. A workaround is someone telling you, on camera, that the problem hurt enough for them to build their own fix out of a spreadsheet and goodwill.',

    'For hiring content, or a crowd of young professionals, career questions work too. “What’s one skill you wish someone had taught you before your first job?” is easy to start and hard to answer without a story.',

    'Every question needs a follow-up, written before the shoot. The [two-answer rule](/blog/vox-pop-glossary#two-answer-rule) explains why. The first answer is the polite version. The second, after a gentle “Interesting, why though?”, is usually closer to what people think.',

    'Former FBI hostage negotiator Chris Voss has a name for a quieter follow-up: mirroring[^mirroring]. Repeat the last few words someone said, then wait. At work events, where people are used to sounding professional, that pause gives them room to drop the rehearsed version.',

    { type: 'h3', id: 'teacher-frame', text: 'Rewrite your questions in the teacher frame' },

    'B2B questions tend to leave the office written like survey items. They ask people to rate, approve or predict, which turns them into subjects in your study.',

    'Subjects answer like spokespeople.',

    "The teacher frame flips that. Ask people to explain their work as if you knew nothing about it. The topic stays the same, but now they're the expert. The rewrites below keep each topic and change the role of the person answering.",

    {
      type: 'table',
      caption: 'Survey-style B2B questions and teacher-frame rewrites',
      head: ['Survey-style question', 'Teacher-frame rewrite', 'What changes'],
      rows: [
        ['“Do you use project management software?”', '“Explain it like I’ve never had a job: how does your team decide who does what?”', 'A yes or no becomes a process'],
        ['“What do you think of AI tools at work?”', '“Teach me: which part of your job would you never hand to AI?”', 'An opinion becomes a line they’ll defend'],
        ['“Would you pay for a better invoicing tool?”', '“A friend just started a business. What should they know about getting paid?”', 'A price question becomes advice'],
        ['“Rate your company’s onboarding out of ten.”', '“What should every new joiner hear in week one that nobody tells them?”', 'A score becomes a story'],
        ['“Is reporting hard where you work?”', '“Walk me through the last report you made. Where did it get stuck?”', 'A complaint becomes a scene'],
      ],
      rowHeaders: true,
    },

    "Look at what's missing from the middle column: the product. It comes in later, if at all, as the answer to a problem the person has already described.",

    'The builder below turns your own role, task and workaround into a question set, grouped by family.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'b2b-question-builder',
      props: {
        title: 'B2B vox pop question builder',
        intro: 'Type a role, a task, the workaround people use and your product category. The questions fill in as you type, and you can copy each one.',
        fields: [
          { id: 'role', label: 'Who you are asking (a role)', placeholder: 'e.g. a store manager', example: 'a store manager' },
          { id: 'task', label: 'A task in their week', placeholder: 'e.g. counting stock', example: 'counting stock' },
          { id: 'workaround', label: 'What they use instead of a proper tool', placeholder: 'e.g. a notebook and a WhatsApp group', example: 'a notebook and a WhatsApp group' },
          { id: 'category', label: 'Your product category', placeholder: 'e.g. inventory software', example: 'inventory software' },
        ],
        templates: [
          { text: 'Walk me through a normal Monday as {role}.', group: 'The job', mechanism: 'Personal experiences' },
          { text: 'What part of {task} would surprise someone who has never done it?', group: 'The job', mechanism: 'Unexpected questions' },
          { text: 'Guess: how many hours a week does {role} spend on {task}?', group: 'The job', mechanism: 'Guessing and reveals' },
          { text: 'What is the most annoying part of {task}?', group: 'The frustration', mechanism: 'Personal experiences' },
          { text: 'Rank these from worst to least bad: {task}, a meeting that should have been an email, or chasing approvals.', group: 'The frustration', mechanism: 'Rankings' },
          { text: 'What does your manager think {task} takes, and what does it really take?', group: 'The frustration', mechanism: 'Debates and opposing opinions' },
          { text: 'How long have you used {workaround} for {task}, and who started it?', group: 'The workaround', mechanism: 'Personal experiences' },
          { text: 'Be honest: which does your team trust more, {category} or {workaround}? Why?', group: 'The workaround', mechanism: 'A/B comparisons' },
          { text: 'Explain {task} to me like I have never had a job.', group: 'Teacher frame', mechanism: 'Personal experiences' },
          { text: 'If a friend became {role} tomorrow, what would you warn them about first?', group: 'Teacher frame', mechanism: 'Personal experiences' },
          { text: 'What does everyone outside your team get wrong about {role}?', group: 'Contrast', mechanism: 'Debates and opposing opinions' },
          { text: 'What is one skill you wish someone had taught you before you became {role}?', group: 'Career', mechanism: 'Personal experiences' },
          { text: 'You said {task} is the worst bit. Interesting, why though?', group: 'Follow-ups', mechanism: 'Different follow-up structures' },
          { text: 'You said {workaround}. Why that, and not something built for the job?', group: 'Follow-ups', mechanism: 'Different follow-up structures' },
        ],
        note: 'Keep your product out of the first question. Bring it in only after someone has described the problem in their own words.',
      },
    },

    // ---------------------------------------------------------------- Messaging
    { type: 'h2', id: 'test-your-messaging', text: 'How do you test your messaging before you film?', toc: 'Test your messaging first' },

    'Read your main line, word for word, to people who have never heard of you, then ask what they think it means. The distance between what you meant and what they heard is the thing to fix before any shoot.',

    "We call that distance the messaging gap. B2B copy is especially prone to it, because experts write it for other experts. Everyone in the meeting knows what “unified workflow orchestration” means. The plant manager in Peenya scrolling past your ad at 7 am may not.",

    {
      type: 'comparison',
      title: 'What the company says, and what the street might tell you',
      left: {
        label: 'What the company says',
        items: [
          '“Our buyers want an enterprise-grade platform.”',
          '“Our homepage says exactly what we do.”',
          '“Everyone in our market knows what a CRM is.”',
          '“Our case studies prove it.”',
        ],
      },
      right: {
        label: 'What the street might tell you',
        items: [
          "They want a quick win that won't make them look silly in front of their boss.",
          "It's industry language that nobody outside your office uses.",
          'Half the room calls it “the thing sales makes us update”.',
          'They read like ads, because your team wrote them.',
        ],
      },
      verdict: 'These are illustrations, not findings. The only way to know which column your copy sits in is to read it to someone who owes you nothing.',
    },

    'The fix needs no camera.',

    "It's the pressure test, and in B2B it works best in two rooms. People who do your buyer's job tell you whether the line is relevant. People who don't tell you whether it's clear.",

    {
      type: 'steps',
      id: 'b2b-pressure-test',
      title: 'How to run a B2B pressure test',
      intro: 'Run it in an afternoon or an evening, before you plan any shoot. You need a card, a pen and the venue’s permission. You don’t need a camera.',
      howTo: true,
      supplies: ['Your main line, printed on a card', 'A notebook or a phone for notes', 'Permission from the venue, if it is private'],
      steps: [
        { name: 'Pick one line', text: 'Choose the sentence you lead with: the homepage headline, the first line of your deck or the ad your team likes most. Test one line at a time.' },
        { name: 'Pick two rooms', text: 'Find people who do your buyer’s job, at a meetup or a co-working space. Then find people who don’t, on the street. The first group judges relevance and the second judges clarity.' },
        { name: 'Read it once, as written', text: 'Say it word for word, with no explanation, and keep the card out of sight. A pause or a frown is a cue to ask, never an answer in itself.' },
        { name: 'Ask what it meant', text: 'Ask “What do you think that meant?” and “Who do you think it’s for?” Write down their exact words, not your summary of them.' },
        { name: 'Ask the second question', text: 'Follow the first answer with “Interesting, why though?” The first answer is the polite one. The second is usually closer to what they think.' },
        { name: 'Stop when misreadings repeat', text: 'Once different people keep getting it wrong in the same way, you’ve found the gap. Rewrite the line in the words they used, and test the new version.' },
        { name: 'Then plan the shoot', text: 'Only now write questions for camera. The misreadings tell you what the video has to explain, and in whose words.' },
      ],
    },

    {
      type: 'script',
      id: 'pressure-test-at-a-meetup',
      title: 'The pressure test at a meetup',
      context: 'No camera. If you want audio for your notes, ask first and say it won’t be published. The participant’s lines are an illustration, not a real interview.',
      lines: [
        { direction: 'Ask the organiser first. Approach people during a break, never during a talk.' },
        { speaker: 'Host', text: 'Hi, can I borrow one minute? I’m testing a sentence for a company, and I’d like your honest first reaction. There’s no wrong answer.' },
        { direction: 'Read the line once, exactly as written.' },
        { speaker: 'Host', text: 'What do you think that company does?' },
        { speaker: 'Participant', text: 'Something with workflows? Automation, maybe.' },
        { speaker: 'Host', text: 'Who do you think it’s for?' },
        { speaker: 'Participant', text: 'Big companies, I guess. Not people like me.' },
        { speaker: 'Host', text: 'Interesting, why though?' },
        { direction: 'Wait. Let them finish, then write their exact words before you approach the next person.' },
        { speaker: 'Host', text: 'Last one. If you had to describe it to your manager in one line, what would you say?' },
      ],
    },

    'Suppose you heard that second answer, “not people like me”, and your buyers are small teams. Your headline has just told them to look elsewhere.',

    'You would never hear that line in your own meeting room, however long the debate about adjectives ran.',

    "Our rule on numbers: stop once the same misreading keeps coming back from different kinds of people. A handful of strangers can show you that a sentence confuses people. You'd need a proper study to show that one works.",

    'For a fuller method, including how to log and tag what you hear, read our guide to [vox pop market research](/blog/vox-pop-market-research).',

    { type: 'cta', text: 'Want to see the format on your own brand before you plan a shoot? Scope, the number of trial videos and any fee are confirmed in writing.' },

    // ---------------------------------------------------------------- LinkedIn
    { type: 'h2', id: 'linkedin', text: 'How should B2B vox pops be cut for LinkedIn?', toc: 'LinkedIn and the FLIP carousel' },

    'Lead with a professional contrast: the honest answer that makes a founder or manager stop and think “nobody in my industry says this”. Post it from a person’s profile, framed around what your company learned.',

    'We cut differently for LinkedIn. People scroll it at work, with their jobs on their minds, so the random reactions that suit Reels can feel out of place. A line that disagrees with how an industry talks about itself fits better.',

    "On Instagram the clip is about the stranger. On LinkedIn it's about what the company learned from the stranger. A founder's post that says “we expected this, we heard that, and here's what we changed” gives the clip a reason to be on a work feed.",

    {
      type: 'list',
      items: [
        '**The job and the job description:** what a role says on paper, against what people say they actually do.',
        '**Manager and team:** what one side thinks takes five minutes, against what the other says it takes.',
        '**The tool and the workaround:** the software a company paid for, against the spreadsheet people really use.',
        '**First answer and second answer:** the polite version, then the one after “why though?”.',
        '**Two roles, one question:** a founder and an employee, asked exactly the same thing.',
      ],
    },

    'Pick one contrast per post. Two contrasts in one clip usually means neither lands.',

    'Contrast also keeps a clip fair. When researchers studied 2,000 vox pop interviews from Flemish TV news, they found that a large majority of items showed only one point of view[^opinion-balance]. Two views side by side make a better argument, and a more honest one.',

    { type: 'h3', id: 'flip-carousel', text: 'The FLIP carousel for B2B' },

    'A carousel lets people read the argument at their own pace, which suits a work feed. The FLIP shape has four slides: frame, layer, invert, plant. In B2B, slide one holds a belief about work, and your product never needs to appear.',

    {
      type: 'framework',
      id: 'flip-framework',
      name: 'FLIP',
      tagline: 'Four slides that turn one answer from the floor into an argument.',
      parts: [
        { key: 'F', name: 'Frame', text: 'State the belief your buyers hold about their work, in their words. Not what you want them to think: what they think now.' },
        { key: 'L', name: 'Layer', text: 'Add the answer from the floor or the street that doesn’t fit the belief. Quote it exactly, with no name unless the person agreed.' },
        { key: 'I', name: 'Invert', text: 'Turn the logic around. If the belief were true, that answer shouldn’t exist, so say what is going on instead.' },
        { key: 'P', name: 'Plant', text: 'Plant the view your company stands for, in one sentence. No feature list and no logo slide.' },
      ],
    },

    'The builder fills in all four slides, plus the post text, a caption for the clip and a first comment.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'b2b-flip-builder',
      props: {
        title: 'Build a FLIP carousel for LinkedIn',
        intro: 'Type one line for each slide. The slides, the post text and a first comment fill in as you type.',
        fields: [
          { id: 'belief', label: 'Frame: what your buyers believe about their work', placeholder: 'e.g. month-end close is a finance problem', example: 'month-end close is a finance problem' },
          { id: 'heard', label: 'Layer: what people actually said', placeholder: 'e.g. the hold-up is always one missing approval', example: 'the hold-up is always one missing approval' },
          { id: 'means', label: 'Invert: what that really means', placeholder: 'e.g. the delay sits with managers, not accountants', example: 'the delay sits with managers, not with accountants' },
          { id: 'view', label: 'Plant: the view your company stands for', placeholder: 'e.g. closing the books should start with whoever signs off', example: 'closing the books should start with whoever signs off' },
        ],
        templates: [
          { text: 'Ask anyone in our industry and they will tell you that {belief}.', group: 'Slide 1: Frame' },
          { text: 'So we asked people who do the work, on camera. What we kept hearing: “{heard}.”', group: 'Slide 2: Layer' },
          { text: 'If that is true, {means}.', group: 'Slide 3: Invert' },
          { text: 'That is why we think {view}.', group: 'Slide 4: Plant' },
          { text: 'We went in expecting to hear that {belief}. We heard “{heard}” instead. Four slides on what changed our minds.', group: 'Post text' },
          { text: '“{heard}.” Said by someone who does this job every week.', group: 'Clip caption' },
          { text: 'Is that true where you work, or does {belief} still hold?', group: 'First comment' },
          { text: 'We took one belief about our industry to real people: {belief}. Their answers disagreed. A thread.', group: 'Thread on X, post 1' },
        ],
        note: 'Quote only people who agreed to appear, word for word. Leave out names and employers unless they said yes.',
      },
    },

    'The same four beats make a thread on X, one beat per post, with the clip attached to the second. If one answer clearly held people, give it its own short cut and post it a week later.',

    'Our view on paid promotion: boost only a clip that already held attention without help. Your audience has run the test for you, so put money behind its answer rather than your guess.',

    'Reply to comments early, while people are still in the thread. A comment from someone in your buyer’s role is a conversation you can carry on in a direct message, if they seem open to it. For the platform-by-platform detail, see [where to post vox pop videos](/blog/where-to-post-vox-pop-videos).',

    // ---------------------------------------------------------------- Consent
    { type: 'h2', id: 'consent-and-confidentiality', text: 'How do you handle consent and confidentiality at work events?', toc: 'Consent and confidentiality' },

    'Get the organiser’s permission, ask every person before you film, get a signed release from anyone you feature, and keep badges, screens and company secrets out of frame. Work events carry risks a footpath doesn’t.',

    'On the street, the main question is whether someone agreed to be filmed. At a work event more people have a stake: the organiser, the person’s employer, and sometimes a client whose name is on a slide behind them.',

    {
      type: 'list',
      items: [
        '**Badges and lanyards** show a name and an employer. Ask people to flip them, or frame them out.',
        '**Screens and slides** in the background can show a dashboard, an email or a client list. Check every frame before anything is published.',
        '**Company names** are a risk, because many people can’t speak for their employer in public. Ask, “Are you speaking for yourself today?”',
        '**Unreleased work** is everywhere at trade shows and demo days. If someone mentions something that isn’t public yet, leave it out.',
        '**The organiser’s rules** come first. Many events have a media policy, and some mark attendees who’d rather not be photographed.',
        '**Students** at college fests and campus events may be under 18. Never feature anyone under 18 without a parent’s written consent.',
      ],
    },

    'Get a signed release from everyone you feature, and tell them where the video will appear. India’s data protection rules are coming into force in phases through 2027[^dpdp-rules], so have a lawyer check your release form. This is general information, not legal advice.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'Featuring your own team',
      text: 'You can, but say so. If anyone in your vox pop is paid, works for you or was cast, India’s endorsement guidelines expect you to disclose it clearly[^endorsement-dca]. Staff dressed up as random strangers mislead viewers, and on LinkedIn someone will recognise them.',
    },

    'For the wider picture, our guide to [filming consent in India](/blog/street-interview-consent-india) covers releases and public spaces in more depth. Kreators.Army’s own agreements keep non-public information confidential on both sides, for five years after an engagement ends.',

    'The checklist covers the whole event day, from the organiser’s email to the last release.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'event-day-checklist',
      props: {
        title: 'Event-day vox pop checklist',
        intro: 'Tick each item as you go. Your ticks stay in this browser and nowhere else.',
        items: [
          { id: 'organiser-ok', text: 'Written permission from the organiser, and a copy of their media policy', detail: 'Ask whether they mark attendees who opted out of photos, and how.' },
          { id: 'introduction', text: 'An agreed introduction, so people know who is asking and for which company' },
          { id: 'question-cards', text: 'Question cards, each with its follow-up written underneath' },
          { id: 'releases', text: 'Release forms, printed or on a phone, checked by a lawyer' },
          { id: 'spot', text: 'A spot near the coffee queue or the exit, away from your own stall' },
          { id: 'audio', text: 'Wireless mics and a plan for crowd noise', detail: 'Event halls echo. Test the sound where you will stand before the doors open.' },
          { id: 'ask-first', text: 'Ask before you film anyone, and say where the clip will appear' },
          { id: 'speaking-for-themselves', text: 'Ask “Are you speaking for yourself today?” before anyone names their employer' },
          { id: 'badges', text: 'Badges flipped or framed out, unless the person agrees to show them' },
          { id: 'screens', text: 'No laptops, slides or whiteboards readable in the background' },
          { id: 'under-18', text: 'No one under 18 on camera without a parent’s written consent' },
          { id: 'staff', text: 'Anyone on staff, paid or cast is noted, so the post can disclose it' },
          { id: 'log', text: 'Time codes logged for the best answers, with three words on each' },
          { id: 'take-down', text: 'A way for people to reach you later if they change their mind' },
        ],
        done: 'All ticked. Go and find the coffee queue.',
      },
    },

    // ---------------------------------------------------------------- Measuring
    { type: 'h2', id: 'is-it-working', text: 'How do you tell if B2B vox pop is working?', toc: 'Is it working?' },

    'Count conversations before views. Watch for comments and messages from people in your buyer’s role, clips your sales team reuses, and street lines that end up in your copy. No video can promise pipeline.',

    'B2B audiences are small. A clip seen by a few thousand of the right people can matter more than one seen by a crowd who will never buy. So compare each clip with your own past posts, never with a snack brand’s numbers.',

    'The table lists the signals we’d watch, on the platforms and off them.',

    {
      type: 'table',
      caption: 'Signals worth tracking for B2B vox pop',
      head: ['Signal', 'Where to find it', 'What it tells you'],
      rows: [
        ['Stayed to watch', 'YouTube Shorts analytics', 'Whether the opening line earned the next few seconds'],
        ['Sends and reposts', 'Instagram insights, LinkedIn reposts', 'Whether someone thought a colleague should see it'],
        ['Comments from buyer roles', 'The thread under the post', 'Whether the contrast started an argument worth having'],
        ['Messages and replies', 'Founder and company inboxes', 'Whether a viewer wants to keep talking'],
        ['Sales reuse', 'Decks and follow-up emails', 'Whether the clip helps in a real conversation'],
        ['Event follow-ups', 'Notes from calls after the event', 'Whether people remember the clip or its question'],
        ['Copy changes', 'Your homepage and ads', 'Whether the street changed how you describe yourself'],
      ],
      rowHeaders: true,
    },

    'The platforms tell you part of it. YouTube’s Shorts analytics measure how often viewers stayed to watch past the first seconds[^yt-stayed]. In January 2025, Instagram’s head Adam Mosseri said the three signals that matter most for ranking are watch time, likes and sends[^instagram-signals]. A street answer someone wants to send to a colleague fits that last one well.',

    'The rest lives off the platforms, so build two small habits:',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Sort the comments once a week.** Make two piles: people in your buyer’s role, and everyone else. Only the first pile tells you whether the clip reached the right room.',
        '**Ask sales one question once a month.** Did you use a clip in a deck, an email or a call, and what happened next? We’d weigh that answer above any view count.',
      ],
    },

    'Don’t treat the answers as a survey, either. Even TV news struggles here: a study of the same 2,000 Flemish TV vox pops found they rarely reflected minorities[^vox-pop-representation]. An event floor is narrower still. Treat what you hear as a lead worth following up, then size it with a proper survey.',

    'Be clear, too, about what nobody can promise. We never promise views, pipeline or sales from a video, and [our FAQ explains why](/faq/do-you-guarantee-views). Performance also depends on the platform, the audience, account history, media spend, the offer and distribution.',

    // ---------------------------------------------------------------- Close
    { type: 'h2', id: 'where-to-start', text: 'Where should you start this week?', toc: 'Where to start' },

    'Start small: one event, three questions. The steps below fit into a single week.',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Find the event.** Open your calendar and pick the next event your buyers will attend.',
        '**Write three questions.** One each about the job, the frustration and the workaround, with a follow-up written under each.',
        '**Ask for a corner.** Email the organiser for a spot near the coffee, and ask for their media policy while you’re at it.',
      ],
    },

    'Even if you never publish a frame, you’ll come back knowing how your buyers describe their own work. That’s the raw material for every message you write next.',

    'One limit stays, however well you plan. We control the question, the setup, who we approach, the follow-up and the edit. We can’t control exactly how a stranger will respond in the moment.',

    'In B2B that’s the point: you want the answer you couldn’t have written yourself.',

    "[Our guide to street interview techniques](/blog/street-interview-techniques) covers follow-ups in depth. If you'd rather have the questions planned, the shoot run and every cut made for you, that's the work we do. See the format on your own brand first: the scope, the number of trial videos and any fee are confirmed in writing. [Request a trial video](/contact).",
  ],

  faqs: [
    {
      q: 'Can B2B brands use vox pop?',
      a: 'Yes. B2B and SaaS brands can use vox pop where their buyers gather, such as events, meetups and co-working spaces, or with the people their product serves. Vox pop suits messaging research, event content, founder-led video and hiring best. It is weaker as a direct source of leads on broad feeds, because most people who watch a street interview will never buy business software.',
    },
    {
      q: 'What questions work for SaaS vox pops?',
      a: 'Questions about the job, the frustration and the workaround. Ask people to walk you through a task, name the part that takes longer than it should, and describe what they use instead of a proper tool. Avoid asking strangers to rate your product or say whether they would pay for it. Those questions get polite, short answers that rarely make a usable clip.',
    },
    {
      q: 'Where should B2B brands film vox pops?',
      a: 'Where people who do your buyer’s job already gather: conferences, trade shows, launches, meetups and co-working spaces. Most of these are private spaces, so get the organiser’s or operator’s permission before filming. If your product serves the public, such as payments or delivery software, film the end customers on the street and ask about the experience rather than a named business.',
    },
    {
      q: 'Should we film a vox pop at our own event?',
      a: 'Yes, with care. Your own event gives you access, a willing crowd and a ready-made recap. The risk is that every answer sounds like praise for the host. Ask attendees about their work rather than the event, place the crew away from your stall, tell attendees at registration that filming will happen, and disclose anyone on camera who works for you.',
    },
    {
      q: 'Can we interview our own employees in a vox pop?',
      a: 'Yes, as long as viewers can tell. India’s endorsement guidelines expect a clear disclosure whenever someone in the video is paid, employed by you or cast[^endorsement-dca]. Never present staff as random strangers. Employee vox pops suit hiring content well, because questions about work and careers are easy for your own team to answer honestly. Get a signed release from employees too.',
    },
    {
      q: 'How should B2B vox pops be used on LinkedIn?',
      a: 'Lead with a professional contrast: an honest answer that challenges how your industry talks about itself. Post from the founder’s or a team member’s profile, framed around what the company learned, rather than dropping the clip on the company page alone. A four-slide FLIP carousel built on the best answer sits well alongside the video. Reply to comments early, while people are still in the thread.',
    },
    {
      q: 'How long should a B2B vox pop be?',
      a: 'As short as the story allows. Most B2B vox pops need one question, one contrast and one payoff, and anything that serves none of those should go. Don’t cut to a fixed length if that loses the context the payoff depends on. A recap for a company page or a sales deck can run longer than a single answer for the feed.',
    },
    {
      q: 'Can a vox pop replace a B2B case study?',
      a: 'No. A case study shows what one customer achieved with your product, with their permission and their numbers. A vox pop shows how people talk about the problem, in their own words. They do different jobs. Use the vox pop to help people recognise the problem, and the case study when they want evidence that you solve it.',
    },
  ],

  sources: [
    {
      id: 'merriam-webster',
      title: 'Vox populi',
      url: 'https://www.merriam-webster.com/dictionary/vox%20populi',
      publisher: 'Merriam-Webster',
      note: 'CLAIMS E01: vox populi means "voice of the people".',
    },
    {
      id: 'vox-pop-radio',
      title: 'Vox Pop (radio program)',
      url: 'https://en.wikipedia.org/wiki/Vox_Pop_(radio)',
      publisher: 'Wikipedia',
      note: 'CLAIMS E02: began on KTRH Houston in 1932 when ad salesmen Parks Johnson and Jerry Belcher took microphones into the street.',
    },
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter Brill',
      date: '2022',
      note: 'CLAIMS R11/E04: vox pops rated less trustworthy than an expert quoting a poll, yet moved personal opinion more.',
    },
    {
      id: 'exemplification',
      title: 'Brosius and Bathelt, exemplars in persuasive communication',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research 21(1)',
      date: '1994',
      note: 'CLAIMS E06: individual cases sway judgements more than base-rate statistics.',
    },
    {
      id: 'para-social',
      title: 'Mass communication and para-social interaction: observations on intimacy at a distance',
      url: 'https://doi.org/10.1080/00332747.1956.11023049',
      publisher: 'Psychiatry 19(3), Horton and Wohl',
      date: '1956',
      note: 'CLAIMS R10 (corrected): the concept only; the host point is written as our view.',
    },
    {
      id: 'mirroring',
      title: 'Never Split the Difference (summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'CLAIMS P08 (corrected): Chris Voss calls repeating the last few words "mirroring".',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies, via Drexel University Research Discovery',
      date: '2018',
      note: 'CLAIMS E08: in a sample of 2,000 Flemish TV vox pops, a large majority of items showed only one point of view.',
    },
    {
      id: 'vox-pop-representation',
      title: 'Beckers and Walgrave, study of 2,000 vox pops in Flemish TV news',
      url: 'https://informahealthcare.com/doi/abs/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice',
      date: '2017',
      note: 'CLAIMS E07: TV vox pops rarely reflected minorities, and journalists seldom flag that they are not representative.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI via The Week',
      date: '2025-11-14',
      note: 'CLAIMS P07/E27: DPDP Rules notified November 2025; consent and notice duties apply in phases.',
    },
    {
      id: 'endorsement-dca',
      title: 'Endorsement Know-hows! For celebrities, influencers and virtual influencers on social media platforms',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose any material connection clearly, with terms such as "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'yt-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'CLAIMS P01: "Stayed to watch" is the percentage of times viewers stayed past the initial seconds of a Short.',
    },
    {
      id: 'instagram-signals',
      title: 'Instagram shares algorithm insights for 2025',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01',
      note: 'CLAIMS P02/E22: Adam Mosseri names watch time, likes and sends as the top three ranking signals.',
    },
  ],

  related: ['where-to-post-vox-pop-videos', 'vox-pop-market-research', 'street-interview-techniques', 'street-interview-consent-india'],
};

export default post;
