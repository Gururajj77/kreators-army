import type { Post } from '../types';
import meta from './vox-pop-mofu-content-strategy.meta';

// MoFu content with vox pops (PLAN.md post 8; founder's PDF p34-44). Claims follow .work/v2/blog/CLAIMS.md. City lenses are hypotheses, never facts
// about anyone; every exchange, quote-like answer and scene is labelled as an illustration (CLAIMS F14, F15). No founder-only claims (F02-F04).
// Keep the h2 ids what-is-mofu-content and the-two-answer-rule: the glossary links to both.

const post: Post = {
  meta,

  answer:
    'MoFu content is middle-of-funnel content: it\'s for people who know your brand exists but haven\'t decided to trust it. Vox pops fit there because the second answer a stranger gives, after one gentle "why?", often names the doubt your buyers carry. Kreators.Army\'s advice: turn each street insight into an objection carousel, a walkthrough video and a community question.',

  takeaways: [
    'The middle of the funnel often sits empty because reach is easy to buy and orders are easy to count. Trust is neither.',
    'Read your best hook, word for word, to a stranger. The gap between what you meant and what they heard is your messaging gap.',
    'The two-answer rule: the first answer is the polite one. One gentle "why?" often brings out the doubt that decides a purchase.',
    'Career in Bengaluru, income in Mumbai, permission in Delhi: each city lens is a guess to test, never a fact about the people who live there.',
    "Log exact phrases, never summaries. A buyer's own sentence makes a better hook than most lines written in an office.",
    'Judge MoFu by saves, sends, keyword replies and specific DMs. Views tell you who saw a post, not who is weighing you up.',
  ],

  body: [
    'Your brand has reach. People have seen the reels, the name rings a bell, and some of them even follow you. Then nothing much happens. The comments are mostly emojis, and the add-to-cart number hasn\'t moved since the last sale.',

    "They know you exist. They haven't decided to trust you yet.",

    `That stretch between "I've heard of them" and "I'd try them" is the middle of the funnel. In our view, it's the stage brands most often leave empty, and it's where a street interview earns its keep. A stranger on a footpath owes your brand nothing. Their first answer will be polite, but one gentle follow-up often brings out what's stopping them.`,

    'This guide turns that into a method. You get a street test for your hook, the two-answer rule, three city lenses and a one-week loop that makes three pieces of content from every good answer. Last come the signals that show whether any of it is working.',

    // ---------------------------------------------------------------- 1
    { type: 'h2', id: 'what-is-mofu-content', text: 'What is MoFu content?' },

    "MoFu content is anything you make for people who already know your brand but haven't decided to trust it. It answers their doubts, shows how the product fits their life and offers a small next step.",

    "Marketers split the buyer's path into three stages: the top, middle and bottom of the funnel, often shortened to TOFU, MOFU and BOFU. We write the middle one as MoFu. Each stage meets a different question in the buyer's head, so each needs different content.",

    {
      type: 'table',
      caption: 'The three funnel stages, and what each one is for',
      head: ['Stage', 'What the buyer is thinking', 'Content that fits', 'Signal to watch'],
      rows: [
        ['Top (TOFU)', '"Who are you?"', 'A playful street question, a trend, a collaboration', 'Views, and how long people stay'],
        ['Middle (MoFu)', '"Can I trust this? Is it for someone like me?"', "Doubts answered in customers' words, walkthroughs, honest comparisons", 'Saves, sends, replies and DMs'],
        ['Bottom (BOFU)', '"Is now the time, at this price?"', 'Offers, product-page reviews, delivery and returns', 'Add-to-carts and orders'],
      ],
      rowHeaders: true,
    },

    "The middle row is the hardest to measure, which is part of why it gets skipped. It's also where a street interview does its most useful work.",

    `A [vox pop](/blog/what-is-vox-pop-content) is a short street interview: a host takes one question to the street, and real people answer on camera without a script. The same format can serve either stage. A playful question like "salt or sweet?" earns attention at the top, and a question built around a buyer's doubt earns consideration in the middle.`,

    "Ordinary voices carry real weight there. In [a 2022 experiment with TV news items](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html), viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-pop-vs-expert]. People say they trust the expert, then lean towards the stranger.",

    "Nielsen's trust survey points the same way, with one caveat.",

    {
      type: 'stat',
      value: '88%',
      label: "of people in Nielsen's 2021 global survey said they trust recommendations from people they know more than any other source",
      source: 'nielsen-trust',
    },

    "A stranger on the street isn't someone you know. They're still a lot closer to a friend than an ad is.",

    'Try sorting a few examples before reading on. The stages blur at the edges, and spotting where is the useful part.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'funnel-stage-quiz',
      props: {
        title: 'Top, middle or bottom of the funnel?',
        intro: 'Eight pieces of content a D2C brand might post. Pick the stage each one mainly serves.',
        questions: [
          {
            q: 'A street clip asking strangers "salt or sweet?", posted to reach people who have never heard of you.',
            options: [
              { text: 'Top (TOFU)', points: 1 },
              { text: 'Middle (MoFu)', points: 0 },
              { text: 'Bottom (BOFU)', points: 0 },
            ],
            explain: "Top. A light, open question earns attention from people who don't know you yet.",
          },
          {
            q: 'A carousel that opens with a stranger saying "I never know which one suits me", then answers it.',
            options: [
              { text: 'Top (TOFU)', points: 0 },
              { text: 'Middle (MoFu)', points: 1 },
              { text: 'Bottom (BOFU)', points: 0 },
            ],
            explain: "Middle. It names a real doubt in a customer's own words, then settles it.",
          },
          {
            q: 'A story with a discount code, shown to people who left items in their cart.',
            options: [
              { text: 'Top (TOFU)', points: 0 },
              { text: 'Middle (MoFu)', points: 0 },
              { text: 'Bottom (BOFU)', points: 1 },
            ],
            explain: 'Bottom. They already want it. The questions left are price and timing.',
          },
          {
            q: 'A two-minute video that walks through how to choose between your three variants.',
            options: [
              { text: 'Top (TOFU)', points: 0 },
              { text: 'Middle (MoFu)', points: 1 },
              { text: 'Bottom (BOFU)', points: 0 },
            ],
            explain: 'Middle. Choosing is a consideration problem, and a walkthrough makes the choice feel safe.',
          },
          {
            q: 'A reel built on a trending office joke, with your logo in the last second.',
            options: [
              { text: 'Top (TOFU)', points: 1 },
              { text: 'Middle (MoFu)', points: 0, why: 'It may earn a laugh, but it gives nobody a reason to trust you.' },
              { text: 'Bottom (BOFU)', points: 0 },
            ],
            explain: 'Top, at best. Reach without a reason to believe.',
          },
          {
            q: 'A post asking followers: "What stopped you from trying a new brand of this last year?"',
            options: [
              { text: 'Top (TOFU)', points: 0 },
              { text: 'Middle (MoFu)', points: 1 },
              { text: 'Bottom (BOFU)', points: 0 },
            ],
            explain: 'Middle. It invites people to say their doubt out loud, and the replies feed your next street question.',
          },
          {
            q: 'A section of your product page on delivery times, returns and payment options.',
            options: [
              { text: 'Top (TOFU)', points: 0 },
              { text: 'Middle (MoFu)', points: 0 },
              { text: 'Bottom (BOFU)', points: 1 },
            ],
            explain: 'Bottom. These settle the last practical worries before an order.',
          },
          {
            q: 'A street interview where the host asks "why though?" and the stranger admits what put them off buying.',
            options: [
              { text: 'Top (TOFU)', points: 0 },
              { text: 'Middle (MoFu)', points: 1 },
              { text: 'Bottom (BOFU)', points: 0 },
            ],
            explain: 'Middle. That second answer is the doubt your buyers carry. It is the core of a MoFu vox pop.',
          },
        ],
        results: [
          { min: 0, title: 'Worth another look', text: 'The middle is the easiest stage to mix up. Reread the table above, then try the examples again.' },
          { min: 5, title: 'Mostly there', text: 'You can spot the middle. Watch the edges: a playful street question is top, a doubt answered is middle.' },
          { min: 8, title: 'All eight', text: "You sort content by the question in the buyer's head. That's how to plan MoFu." },
        ],
      },
    },

    // ---------------------------------------------------------------- 2
    { type: 'h2', id: 'why-the-middle-is-empty', text: 'Why is the middle of the funnel often empty?', toc: 'Why the middle is empty' },

    'The top is busy and the bottom is easy to count, so the middle gets skipped. Budgets go to reach and to closing, and very little goes to answering "can I trust this?"',

    "Start with the top. Short video is now mainstream in India: [about 588 million people watched it in 2025](https://www.businesstoday.in/technology/news/story/indias-internet-user-base-tops-950-million-as-rural-growth-ai-drive-adoption-513353-2026-01-29), and slightly more of them were in rural India than in cities[^iamai-2025]. Every brand is in the same feeds, with the same trending audio and the same editing templates. Odds are your viewer has seen a hook like yours before breakfast.",

    'So the top fills up with decent-looking content that sounds alike. Views still come. But a view is an invitation, not a decision: someone can watch your reel to the end and still have no idea whether your product suits them.',

    "The bottom gets the rest of the budget, because that's where orders are counted. Retargeting ads and discount codes live there, and they work well on people who have already decided. On people who haven't, they mostly add pressure. Follow the chain:",

    {
      type: 'list',
      ordered: true,
      items: [
        "Reach without a middle brings visitors who aren't sure.",
        "Visitors who aren't sure get retargeted.",
        'Retargeting without a reason to trust feels like being followed around a shop.',
        'So the team decides the product page needs a bigger discount, and the middle stays empty.',
      ],
    },

    "Indian shoppers show the gap clearly. In [PwC's 2024 survey of Indian shoppers](https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html), 77% said they discover new brands on social media and 81% check reviews there. Yet social media was their least-trusted channel[^pwc-india-2024].",

    'People check you out in the place they trust least.',

    "There's a money reason too. As [Forbes India put it in February 2026](https://www.thirdeyesight.in/?p=6940), India's D2C brands have moved from rapid scale-up to discipline: margins, repeat purchases and a path to profit[^forbes-india-d2c]. Paid reach gets more expensive whenever more brands bid for the same audience. A brand that can't keep buying its way past the middle has to build one.",

    // ---------------------------------------------------------------- 3
    { type: 'h2', id: 'the-messaging-gap', text: 'What is a messaging gap, and how do you find yours?', toc: 'The messaging gap' },

    'A messaging gap is the distance between what you think your content says and what a stranger hears. The quickest way to find yours is low-tech: read your best hook, word for word, to someone who has never heard of you.',

    "Your team can't run this test on itself. Everyone in the office knows what the product does, so they read the meaning into the line without noticing. A stranger has only the words.",

    "That gap can stall the whole middle of the funnel. People watch your videos to the end and still don't act, because they heard the words without feeling understood.",

    {
      type: 'callout',
      tone: 'note',
      title: 'The friendly-audience trap',
      text: `It's tempting to test hooks on people who already know you: the team, the founder's friends, loyal followers. They nod, because they know what you meant and quietly fill the gaps. A stranger fills nothing. A blank look, or "so what is it?", is the most useful thing you'll hear all month.`,
    },

    "Your audience is also better at spotting a built line than you might think. In [YouTube's research with SmithGeiger](https://www.exchange4media.com/marketing-news/83-gen-z-create-content-and-80-want-brands-playing-along-survey-149389.html), 83% of Indian Gen Z said they consider themselves creators[^youtube-genz]. People who make content know how a hook is put together, so they notice when one is doing all the work.",

    "Generating more lines with AI won't close the gap either. In [NielsenIQ's 2024 study](https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/), viewers rated AI-generated ads as more annoying and confusing than traditional ones, and even the better AI ads were less memorable[^niq-ai-ads]. A line that sounds like everyone else's slides straight past.",

    {
      type: 'steps',
      id: 'messaging-gap-test',
      title: 'Run the messaging gap test',
      intro: 'One afternoon, one line and at least five strangers who have never heard of you.',
      howTo: true,
      totalTime: 'PT2H',
      supplies: ['Your best-performing hook, on your phone or a card', 'A notebook or a voice-notes app'],
      steps: [
        { name: 'Pick the line', text: "Choose the hook or headline that does best in your ads or captions today. Don't polish it first. Test what people see now." },
        { name: "Find people who don't know you", text: 'Go where your buyers walk, not where your team sits. Skip friends and anyone who has heard the pitch.' },
        { name: 'Read it word for word', text: "Read it once, at normal speed. Don't explain it, and don't show the product yet." },
        { name: 'Ask the two questions', text: 'Ask "Did that make sense?", then "What did you think it meant?" Let them finish without correcting them.' },
        { name: 'Write their words, not yours', text: 'Note their exact phrasing next to what you meant. Where the two differ is the gap. Their version is often the better hook.' },
      ],
    },

    "There's an online version too. Instagram's [Trial Reels](https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/) let you show a cut to non-followers first[^trial-reels], which is a cheap way to test two hooks on people who don't know you. The feed tells you which line holds strangers. The street tells you why.",

    'Type your hook below and the page turns it into a street-test script you can copy to your phone.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'gap-script-builder',
      props: {
        title: 'Messaging gap test: your street script',
        intro: 'Type your hook, what you sell and what you meant by it. Copy the script and take it outside.',
        fields: [
          { id: 'hook', label: 'Your best hook, word for word', placeholder: 'e.g. Breakfast, sorted in two minutes', example: 'Breakfast, sorted in two minutes' },
          { id: 'product', label: 'What you sell', placeholder: 'e.g. ready-to-cook breakfast mixes', example: 'ready-to-cook breakfast mixes' },
          { id: 'meaning', label: 'What you meant by it', placeholder: 'e.g. a home-style breakfast without the cooking', example: 'a home-style breakfast without the cooking' },
        ],
        templates: [
          { group: 'Open and read', text: 'Hi, quick one. Can I read you one line from a small brand and ask what it means to you? One minute, no camera. Here it is: "{hook}"' },
          { group: 'Ask', text: 'Did "{hook}" make sense to you? What did you think it meant?' },
          { group: 'Ask', text: 'If you saw "{hook}" on a reel, what would you guess it was selling?' },
          { group: 'Follow up', text: 'What in "{hook}" made you say that?' },
          { group: 'Reveal', text: "It's for {product}. Does that change what you thought?" },
          { group: 'Your notes', text: 'We meant: {meaning}. They heard: (their exact words). The distance between the two is the gap.' },
        ],
        note: 'Thank everyone, including the people who say no. If you decide to film anyone, ask first and get a signed release.',
      },
    },

    // ---------------------------------------------------------------- 4
    { type: 'h2', id: 'the-two-answer-rule', text: 'What is the two-answer rule?', toc: 'The two-answer rule' },

    `The [two-answer rule](/blog/vox-pop-glossary#two-answer-rule) says a person's first answer is the polite one: what they think they're supposed to say. Ask one gentle "why?" and the second answer is often what they really think.`,

    'First answers are quick and safe. They\'re what someone would give a survey form or a stranger with a mic. The second comes after a small push, and it tends to carry the doubt or habit that decides whether they buy.',

    "Our view: most marketing is written for the first answer. That's why it can feel slightly off to the people it targets. It speaks to the polite version of the buyer, while the real one stands just behind.",

    'The follow-up is one of the six parts of every street interaction we plan: setup, question, participant, follow-up, reaction and edit. It\'s also the part people underrate. A good follow-up is short, and it comes in a few shapes:',

    {
      type: 'list',
      items: [
        '**Ask "why?" once.** Gently, with a smile: "Why though?", "How come?" or "Achha, kyun?" Ask it twice and it starts to feel like a cross-examination.',
        `**Repeat their last few words.** Former FBI hostage negotiator Chris Voss calls it [mirroring](https://www.mindtools.com/arg0sjv/never-split-the-difference): say back the last few words, then wait[^voss-mirroring]. "Just busy?" often gets more than a new question.`,
        '**Offer the other side.** "Some people say the opposite." It gives permission to disagree with their own first answer.',
        '**Then stop talking.** Count to three in your head. Nervous hosts fill the silence too early, and the second answer never arrives.',
      ],
    },

    {
      type: 'script',
      id: 'two-answer-script',
      title: 'The two-answer rule on the street (an illustration)',
      context: 'An imagined exchange for a made-up breakfast-mix brand. The warm-up question is done, and the person has relaxed.',
      lines: [
        { speaker: 'Host', text: 'Do you ever skip breakfast?' },
        { speaker: 'Participant', text: "Sometimes. I'm just busy." },
        { speaker: 'Host', text: 'Just busy?' },
        { direction: 'Wait. Hold the mic steady and say nothing for three seconds.' },
        { speaker: 'Participant', text: "Honestly, there's nothing at home I can make in two minutes. And I don't really trust the packaged stuff." },
        { direction: 'That last line is the doubt. Log it word for word before the next person.' },
      ],
    },

    '"I\'m busy" would hand you a time-saving hook your rivals already run. The second answer gives you the real job: making a packaged breakfast feel trustworthy.',

    'That one sentence is a middle-of-funnel brief.',

    'Tap each card below for the second answer. These are illustrations written to show the pattern, not quotes from real interviews.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'first-and-second-answers',
      props: {
        title: 'First answer, second answer',
        firstLabel: 'First answer',
        secondLabel: 'After "why though?"',
        items: [
          {
            question: 'Would you buy furniture online?',
            first: '"Maybe. Why not?"',
            second: '"What if it looks different at home? Sending back a sofa sounds like a whole project."',
            note: 'The doubt is returns. A walkthrough of how returns work answers it.',
          },
          {
            question: 'Do you read reviews before you buy?',
            first: '"Always."',
            second: '"I read them, but I skip the five-star ones. I look for the three-star ones to see what went wrong."',
            note: 'The doubt is polished praise. Show the trade-offs honestly.',
          },
          {
            question: 'What do you look for in office wear?',
            first: '"Comfort."',
            second: '"Something nobody comments on. Last time someone asked if I was going to a wedding."',
            note: 'The doubt is what people will say. A styling video that keeps it low-key answers it.',
          },
          {
            question: "Why haven't you tried a new snack brand online?",
            first: '"Never got around to it."',
            second: '"I\'m not paying delivery for one packet I might not like."',
            note: 'The doubt is the risk on a first order. A small starter pack or a taste guide answers it.',
          },
          {
            question: 'Would you switch your tea brand?',
            first: '"No, I\'m happy with it."',
            second: '"My parents buy it. If I change it, I have to explain why."',
            note: 'The doubt is family permission. Give buyers a line they can say at home.',
          },
          {
            question: 'Would you buy shoes online?',
            first: '"Sure, I do sometimes."',
            second: '"Only from brands I know. Sizes change everywhere, so I end up ordering two and sending one back."',
            note: "The doubt is fit. A size guide written in buyers' own words answers it.",
          },
        ],
      },
    },

    'Money is where we would use the rule first. A joke tends to come before a money answer, and the honest part only arrives if the host waits.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'When You Are Broke',
      caption: 'CircleStore, "When You Are Broke": a money question taken to the street. On a topic like this, write the follow-up before the shoot.',
    },

    {
      type: 'callout',
      tone: 'warning',
      title: "When the rule doesn't work",
      text: 'With people who are rushing somewhere, and on topics that touch family, debt or health. If someone closes up after the first answer, thank them and let them go. A second answer is invited, never extracted. More follow-up methods are in [our street interview techniques](/blog/street-interview-techniques).',
    },

    // ---------------------------------------------------------------- 5
    { type: 'h2', id: 'three-city-lenses', text: 'Should your street question change by city?', toc: 'Three city lenses' },

    'Sometimes, and only as a test. A city lens is a guess about the doubt a group might carry, turned into one street question. It\'s a hypothesis, never a fact about who lives there.',

    'Why would a D2C brand ask about careers or side income at all? Because buying decisions borrow their doubts from the rest of life. Money, approval and the fear of choosing wrong all turn up at the checkout.',

    'The cities are labels that make each guess concrete, so swap them freely. The Bengaluru lens can work in Pune, and the Delhi lens works anywhere a family has opinions, which is everywhere.',

    { type: 'h3', id: 'bengaluru-career-explorer', text: "Bengaluru: the career explorer's question" },

    `The guess: a city full of people between paths. A course just finished, or a move from another state for work. "I'm exploring options" is the polite answer, and the hypothesis is that a fear of picking wrong sits under it.`,

    `So skip the surface question, "What do you want to do next?" Everyone has a tidy answer to that. Ask this instead: "What's one thing that stopped you from choosing a direction in the last six months?" It asks about the wall, not the dream.`,

    'Listen for the feeling as much as the words: irritation at family, embarrassment at still not knowing, or relief at not having to commit yet. Someone who says "I\'m exploring" brightly while looking at the floor has given you two answers at once. Note both.',

    {
      type: 'script',
      id: 'bengaluru-exchange',
      title: 'The Bengaluru lens (an illustration)',
      context: 'An imagined exchange, written to show the shape of a second answer.',
      lines: [
        { speaker: 'Host', text: "What's one thing that stopped you from choosing a direction in the last six months?" },
        { speaker: 'Participant', text: 'I just need to figure out which field has more scope.' },
        { speaker: 'Host', text: 'And if you pick the wrong one?' },
        { direction: 'Wait. The laugh comes first. Let it pass.' },
        { speaker: 'Participant', text: "My parents paid for my degree. I can't afford to be wrong." },
      ],
    },

    'So the doubt is about money, dressed in career words.',

    'Content that answers "which field?" misses it. Content that makes the first step feel small and reversible speaks straight to it.',

    'Moving for work brings a related feeling: a city that hasn\'t become home yet. One CircleStore title names it outright.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Still Doesnt Feel Home',
      caption: 'CircleStore, "Still Doesnt Feel Home": a belonging feeling, named in the title.',
    },

    { type: 'h3', id: 'mumbai-income-fault-line', text: 'Mumbai: the income fault line' },

    'The guess: money pressure close to the surface, and busyness worn as a badge. Ask what someone is working on and the first answer may be a confident list. The hypothesis is a gap between what looks busy and what pays.',

    `Ask this: "If you had to drop every side project and keep one income, which one survives, and why?" It forces a choice. Someone who answers in a second has clarity. A long pause before "probably the consulting one" suggests the others are running on hope.`,

    'Listen for the phrases that keep a project alive: "I\'m building my portfolio." "It could lead to something." Neither one says it pays.',

    {
      type: 'script',
      id: 'mumbai-exchange',
      title: 'The Mumbai lens (an illustration)',
      context: 'An imagined exchange. Someone has just listed three projects in eight seconds.',
      lines: [
        { speaker: 'Participant', text: 'Content writing, some consulting, and an online store I started in March.' },
        { speaker: 'Host', text: 'Which one pays your rent?' },
        { direction: 'The smile stays, and the pause gets longer. Let it run.' },
        { speaker: 'Participant', text: 'Probably the consulting. But the store is picking up.' },
        { direction: 'The pause was the answer. Note it next to the words.' },
      ],
    },

    'Never post a clip like that to laugh at someone.',

    "Use it to show what keeping going looks like, then offer one step that helps the thing that pays. For a product brand, the parallel is value: which product earns its place in a tight month.",

    {
      type: 'video',
      brand: 'CircleStore',
      title: "When You Can't Afford",
      caption: 'CircleStore, "When You Can\'t Afford": the money theme again, through a different question.',
    },

    { type: 'h3', id: 'delhi-status-permission', text: 'Delhi: status and the permission question' },

    'The guess: choices shaped by who is watching. Parents, college friends, a partner, the relative who asks at every wedding. The hypothesis is that many people wait for approval they never ask for out loud.',

    `Ask a question that's uncomfortable on purpose: "What's something you stopped yourself from starting because of what one particular person would think?"`,

    `Expect a laugh first, and "I don't care what anyone thinks."`,

    `Don't move the mic, and don't fill the silence. If the person is willing, the real answer may follow. It might sound like "My mother would say it's a phase" or "My uncle would ask why I'm not preparing for UPSC."`,

    {
      type: 'callout',
      tone: 'note',
      title: 'An imagined example',
      text: "Someone in their mid-twenties laughs the question off, and the host just waits. Then it comes out. They bought a ring light last year to start a finance tips page, wrote ten scripts and posted none. When a parent asked about the box, they said it was a friend's. The box is still sealed.",
    },

    "That's a permission problem, and laziness has little to do with it.",

    'Note whose name comes up first, and the feeling that comes with it. Fear and embarrassment need different kinds of reassurance.',

    'MoFu content for this lens moves slower and speaks softer. It offers a first step small enough to take without asking anyone, and sometimes a line the viewer can say to the person they worry about.',

    // ---------------------------------------------------------------- 6
    { type: 'h2', id: 'adapting-the-lenses', text: 'How does a D2C brand adapt each lens?', toc: 'Adapting the lenses' },

    "Keep the shape of each lens and point it at your category. The question still asks about the person's life, and the follow-up still looks for the doubt behind the first answer.",

    'Three made-up brands show the idea. Each sample answer is about a habit or a feeling, never a claim that a product works.',

    {
      type: 'table',
      caption: 'Three lenses, adapted for three made-up D2C brands',
      head: ['Lens', 'Street question', 'Second answer to listen for', 'MoFu asset it suggests'],
      rows: [
        ['Fear of choosing wrong (skincare)', '"What\'s stopped you from changing your routine this year?"', '"I already have half-used bottles at home."', 'A carousel on choosing one product, not five'],
        ['What actually pays (snacks)', '"Keep one snack in your bag this month. Which one, and why?"', '"The one that fills me up. The fancy ones are for the office desk."', 'A walkthrough of what one pack gives you in a week'],
        ['Permission (apparel)', '"What have you stopped yourself wearing because of one person?"', '"My mother says this colour is too loud for office."', 'A styling video that keeps one bold piece low-key'],
      ],
      rowHeaders: true,
    },

    'Skincare swaps careers for routines. The follow-up stays the same: "And if you pick the wrong one?" Listen for waste and regret, then make choosing feel lighter: one product at a time, explained in the buyer\'s words.',

    'For snacks, keep the Mumbai shape: drop everything but one. "Which one is worth the money?" brings out how people judge value. Your walkthrough answers that judgement directly, with what is in a pack and how long it lasts.',

    "Apparel is the gentlest of the three. Nobody is choosing a career here, but the same voice is often in their head: a parent, a manager, a friend who teases. The content offers a first step small enough to try on a Monday.",

    '[The vox pop stack](/blog/vox-pop-funnel) uses the same three cities as nicknames for question families across the whole funnel. Here they do one job: find the doubt.',

    // ---------------------------------------------------------------- 7
    { type: 'h2', id: 'the-mofu-loop', text: 'How does the MoFu loop turn street answers into content?', toc: 'The MoFu loop' },

    'The MoFu loop turns street answers into trust content every week. It has four parts: capture, mine the exact phrases, turn one insight into three assets, and end every asset with a zero-click next step.',

    'Most of the work happens after the shoot.',

    'Posting raw clips and hoping is the easiest way to waste a good street day. The clips are research. What you build from them is the content.',

    { type: 'h3', id: 'street-capture', text: 'Street capture' },

    'Pick one lens and one question for the week. Spend a couple of hours on the street and aim for a handful of real conversations, not a crowd of quick ones. Go where people have a minute: a metro exit after 6 pm or a chai stall in the afternoon, never the 9 am office rush.',

    "A research round can be small: a phone, a clip-on mic and one curious person asking. A batch you'll post for months is a different job, with a planned question set, an interviewer, framing, audio and an edit. That second job is the work we do. Before each shoot we lock the objective, products, audience and must-haves, so the street time goes on the right question.",

    { type: 'h3', id: 'insight-mine', text: 'Insight mine: exact phrases only' },

    'Review the footage the same day, while you still remember the pauses. Write down the exact phrases people used. Not your summary of what they meant: their words, in their order.',

    'Those phrases become hooks, captions, carousel headlines and even ad copy. A line like "I\'m not paying delivery for one packet" beats most office-written copy, because it sounds like a buyer and not a brand. Keep the phrases in a simple insight bank with five columns:',

    {
      type: 'list',
      items: [
        '**The phrase,** word for word.',
        '**The question** that got it, and whether it came as a first or a second answer.',
        '**The lens** you were testing.',
        '**The doubt** underneath, in one line.',
        '**Where you used it,** so nothing gets used twice by accident.',
      ],
    },

    "Keep names and personal details out of the sheet, and don't upload anyone's raw footage to third-party AI tools without their consent.",

    { type: 'h3', id: 'one-insight-three-assets', text: 'One insight, three assets' },

    'Each strong insight can become three pieces of MoFu content. Treat that as a possibility, not a quota. Some phrases carry one post, and some carry a month.',

    {
      type: 'list',
      items: [
        '**An objection carousel.** Open with the exact phrase, name the doubt underneath, and answer it in a few plain slides.',
        '**A walkthrough video.** A mid-length video that works through the decision, with the street clip as its opening.',
        '**A community question.** Ask followers to agree or push back: "We asked this on the street. Is that you too?"',
      ],
    },

    "The community question matters more than it looks. Its replies can become next week's street question, so the loop feeds itself. A template for all three comes after the week plan below.",

    { type: 'h3', id: 'trust-bridge', text: 'The trust bridge: a zero-click next step' },

    'Every MoFu asset ends with one specific next step that keeps people where they are. Skip "link in bio". Ask for something they can do inside the post, like replying with one word.',

    {
      type: 'definition',
      id: 'zero-click-cta',
      term: 'Zero-click call to action',
      text: 'A next step people can take without leaving the post: reply with a word, save it, send it to someone or answer a question. It asks for a small signal of trust before any purchase.',
    },

    'For a skincare brand, the ask might be "reply SHADE for the two-minute shade guide". Another might be "send this to the friend with half-used bottles". Each ask is small, and each one tells you something.',

    "Replies can carry on in DMs or on WhatsApp, which has [more than 500 million users in India](https://techcrunch.com/2024/12/31/india-lifts-whatsapp-payment-curbs/)[^whatsapp-india]. Message only people who asked, keep the offer small and keep your word. If you say you'll send a guide, send it the same day.",

    'A reply count is also the clearest MoFu number you have. A view tells you someone saw the post. A keyword reply tells you they wanted more.',

    // ---------------------------------------------------------------- 8
    { type: 'h2', id: 'a-week-of-the-loop', text: 'What does a week of the loop look like?', toc: 'A week of the loop' },

    'One lens, one question, one week. Plan on Monday, shoot on Tuesday, build the three assets from Wednesday to Friday, read the replies on Saturday and rest on Sunday.',

    {
      type: 'widget',
      widget: 'timeline',
      id: 'week-timeline',
      props: {
        title: 'The MoFu loop, Monday to Sunday',
        intro: 'A rhythm for a small team. Move the days around if you need to, but keep the order.',
        items: [
          {
            when: 'Monday',
            title: 'Pick the lens and the question',
            text: "Choose one lens and write one question with its follow-up. Read both aloud to someone who doesn't know the brand.",
            tasks: ['Keep the question to one breath', 'Write the follow-up before anything else'],
          },
          { when: 'Tuesday morning', title: 'Two hours on the street', text: 'Aim for a handful of real conversations. Note the strongest second answers as you go.' },
          { when: 'Tuesday afternoon', title: 'Mine the phrases', text: 'Watch everything back. Copy the exact phrases that stopped you into the insight bank.' },
          { when: 'Wednesday', title: 'Build the carousel', text: "Take the strongest objection and build the carousel around the stranger's words." },
          { when: 'Thursday', title: 'Make the walkthrough', text: 'Script and shoot the mid-length video that works through the decision. Open on the street clip.' },
          { when: 'Friday', title: 'Post the community question', text: 'Ask followers to agree or push back, and end with the zero-click step.' },
          { when: 'Saturday', title: 'Read the replies', text: "Pick next week's question from what people argued about, asked about or quoted back." },
          { when: 'Sunday', title: 'Rest', text: 'The loop starts again on Monday, with a better question than last week.' },
        ],
      },
    },

    'Use the template below on Wednesday. Paste the strongest phrase, name the doubt, and it lays out all three assets.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'three-assets-builder',
      props: {
        title: 'One insight, three assets',
        intro: 'Paste one exact phrase from the street. The template turns it into a carousel, a walkthrough video and a community question.',
        fields: [
          { id: 'quote', label: 'The exact phrase', placeholder: 'e.g. I never know which one suits me', example: 'I never know which one suits me' },
          { id: 'doubt', label: 'The doubt underneath', placeholder: 'e.g. picking the wrong one and wasting money', example: 'picking the wrong one and wasting money' },
          { id: 'product', label: 'Your product', placeholder: 'e.g. our three breakfast mixes', example: 'our three breakfast mixes' },
          { id: 'word', label: 'Reply keyword', placeholder: 'e.g. MATCH', example: 'MATCH' },
        ],
        templates: [
          { group: 'Carousel', text: 'Slide 1, the hook: "{quote}" (a stranger, after we asked why)' },
          { group: 'Carousel', text: 'Slide 2, name it: if that sounds like you, the worry underneath is {doubt}.' },
          { group: 'Carousel', text: "Slide 3, be honest: say who shouldn't buy {product}." },
          { group: 'Carousel', text: 'Slide 4, show the choice: how to decide, step by step, using {product} as the example.' },
          { group: 'Carousel', text: "Slide 5, the bridge: reply {word} and we'll send the short guide." },
          { group: 'Walkthrough video', text: 'Open on the street clip: "{quote}"' },
          { group: 'Walkthrough video', text: 'Say the doubt out loud: {doubt}. Then work through the choice step by step, with {product} in hand.' },
          { group: 'Walkthrough video', text: 'Close on one line: if this sounds like you, reply {word}.' },
          { group: 'Community question', text: 'We asked strangers this week and one said, "{quote}". Is that you too, or do you see it differently?' },
          { group: 'Community question', text: 'Be honest: has the worry of {doubt} ever stopped you buying something?' },
        ],
        note: "Use the phrase exactly as it was said, and only with the person's consent to use the clip.",
      },
    },

    "Keep the week light. If one asset slips, drop the asset, never Saturday's reading. That's the step that makes next week's question better than this one.",

    'For a very small team, [street interviews for small businesses](/blog/street-interviews-for-small-business) stretches the same habit into a 30-day system, with one city lens a month.',

    { type: 'cta', text: "If you'd rather hand over the street part, we plan the questions and follow-ups, run the shoot and edit every cut. See the format on your own brand first. Scope, the number of trial videos and any fee are confirmed in writing." },

    // ---------------------------------------------------------------- 9
    { type: 'h2', id: 'approaching-strangers', text: 'How do you approach strangers without feeling awkward?', toc: 'Approaching strangers' },

    'Approach like a curious person, not a reporter. Start with something small and true about them, then ask your question. A moment of real connection settles people faster than any explanation of the video.',

    'First-timers often worry that someone will shout or demand to know who sent them. Expect plenty of "not today" instead. Take it with a smile, thank them and move on.',

    "The next person didn't see you get turned down.",

    "Open on something you noticed: their shoes, the song leaking from their earphones, the heat. Then ask for a minute, and say who you're with before they have to ask.",

    {
      type: 'script',
      id: 'approach-script',
      title: "An opener that doesn't sound like a reporter",
      context: 'Change the words to suit your voice. Keep the order: a small true thing, who you are, what you need, then the question.',
      lines: [
        { speaker: 'Host', text: "Those shoes are great. Quick one, we're from (your brand), making a short street video. Can I borrow two minutes?" },
        { direction: 'If they slow down, show the mic and say where the video will appear.' },
        { speaker: 'Host', text: 'Easy one first. Where are you headed?' },
        { direction: 'Let them answer fully. This is the warm-up.' },
        { speaker: 'Host', text: "Now the real one. What's one thing that stopped you from trying something new this year?" },
        { direction: 'After the first answer, ask one gentle "why?" and wait.' },
      ],
    },

    "Let people answer in the language they think in. If someone drifts into Hindi, Kannada or Hinglish halfway through, go with them. We'd take an honest answer in Kannada over a careful one in English, and subtitles can carry the rest.",

    "If your founder wants to be the one asking, that works too. A [founder-led street interview](/founders) puts them on the footpath with a crew beside them, and buyers get to watch the founder listen.",

    {
      type: 'callout',
      tone: 'warning',
      title: 'Consent comes first',
      text: 'Tell people what the video is for and where it will appear, and get a signed release from everyone you feature. This is general information, not legal advice.',
      items: [
        "India's data protection rules [are coming into force in phases through 2027](https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html)[^dpdp-rules], so check your release form with a lawyer.",
        "Don't film anyone under 18 without a parent's written consent.",
        "If anyone on camera is paid, works for you or was cast, [India's endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect you to say so clearly[^endorsement].",
        "Bengaluru's Namma Metro needs prior permission for shoots[^bmrcl], and malls are private property, so ask first. [Consent and releases for street interviews](/blog/street-interview-consent-india) covers the detail.",
      ],
    },

    // ---------------------------------------------------------------- 10
    { type: 'h2', id: 'data-not-entertainment', text: 'Why treat street answers as data, not entertainment?', toc: 'Data, not entertainment' },

    'Because the loop runs on what people really think. Once a host starts performing for the camera instead of listening, the follow-up dies, and so does the second answer the whole loop depends on.',

    "We think viewers can tell curiosity from impatience. A host waiting for a stranger to say something shareable looks different from one who wants to know. The impatience shows on the host's face, and later it shows in the cuts.",

    {
      type: 'comparison',
      title: 'Two ways to run the same street',
      left: {
        label: 'Answers as entertainment',
        items: ['The host chases a funny line', 'Moves on after the first answer', 'Keeps only the answers that agree', 'Edits towards a story decided in advance'],
      },
      right: {
        label: 'Answers as data',
        items: ['The host chases the reason', 'Waits for the second answer', 'Keeps the answers that disagree', 'Lets the footage change the plan'],
      },
      verdict: 'Entertainment earns a view. Data earns the next question, and the doubt your buyers carry.',
    },

    "None of this means MoFu clips have to be dull. A funny answer can carry a doubt as well as a serious one can. The test is why you kept it: for the laugh, or for what it told you.",

    "Keep the answers that disagree, too. A study of 2,000 vox pops from Belgian TV news found that [a large majority of vox pop news items showed only one point of view](https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721)[^one-sided-vox-pops]. To a sceptical viewer, a one-sided cut looks arranged. A mix of answers is easier to believe, and far more useful to you.",

    "Don't edit an answer into something the person didn't mean. Cut a doubt so it sounds like praise, and you lose the insight and the viewer's trust in one move.",

    "This is also where the lasting value sits. Editing tools keep getting better and cheaper, but none of them can stand on a footpath in Bengaluru and ask a stranger why they almost didn't buy. A bank of hundreds of real answers is hard for a competitor to copy. [Vox pop market research](/blog/vox-pop-market-research) goes further into running street interviews as research.",

    // ---------------------------------------------------------------- 11
    { type: 'h2', id: 'is-your-mofu-working', text: 'How do you tell if your MoFu content is working?', toc: 'Is your MoFu working?' },

    `Look for signs of trust, not attention. Saves, sends, keyword replies, specific DMs and comments that quote the clip back all suggest people are moving from "I've seen this" to "I'm considering this".`,

    "Instagram's head Adam Mosseri has said the [three signals that matter most are watch time, likes and sends](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/)[^mosseri-signals]. Sends are the telling one for the middle. Someone who forwards your carousel to a friend is saying \"this is us\", which sits close to trust.",

    'Each signal points to a different fix, so read them one at a time.',

    {
      type: 'table',
      caption: 'MoFu signals, and what to change when one stays flat',
      head: ['Signal', 'What it suggests', 'If it stays flat'],
      rows: [
        ['Saves', 'They want it for later, when they decide', 'Make the answer more useful: steps, not slogans'],
        ['Sends', 'They know someone with the same doubt', 'Open on a doubt that sounds like a real person'],
        ['Keyword replies', 'They want the next step', 'Make the ask smaller and clearer'],
        ['DMs with a specific question', 'They are checking fit', "Answer it publicly in next week's carousel"],
        ['Comments that quote the clip', 'The phrase landed', 'Use that phrase as your next hook'],
        ['Return viewers', 'The series is becoming familiar', 'Keep the host and the format steady'],
      ],
      rowHeaders: true,
    },

    'Read comments for detail, not volume. "Does this come in a smaller size?" is worth more than ten fire emojis. Count keyword replies week by week, and note which lens and question each one came from.',

    "Compare each week with your own last month, never with someone else's benchmark. Accounts, categories and audiences differ too much for a borrowed number to mean anything. Give a lens three or four loops before you judge it, because one quiet week can be the question's fault and not the lens's.",

    'None of this is a promise.',

    "How a post performs also depends on the platform, the audience, the account's history, media spend, the offer and distribution. We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger will respond in the moment.",

    {
      type: 'callout',
      tone: 'tip',
      title: 'One thing to do this week',
      text: 'Read your best hook to three strangers and ask what they think it means. If their words differ from yours, you have your first MoFu brief.',
    },

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. We plan the questions and follow-ups, choose and approach the people, run the shoot and edit the batch for short-form feeds.',

    "If you'd like to see a street interview built around your buyers' doubts first, [request a trial video](/contact). Scope, the number of trial videos and any fee are confirmed in writing.",
  ],

  faqs: [
    {
      q: 'What does MoFu mean in marketing?',
      a: 'MoFu means middle of the funnel: the stage between first hearing about a brand and deciding to buy from it. People at this stage know the brand exists but have not decided to trust it. MoFu content works on that gap with answered objections, honest comparisons and walkthroughs, then asks for a small next step, such as saving a post or replying with one word.',
    },
    {
      q: 'What content works in the middle of the funnel?',
      a: "Content that answers a specific doubt in the buyer's own words. Objection carousels, walkthrough videos, honest comparisons and community questions all suit the middle of the funnel. Street interviews add something most MoFu content lacks: real people naming the doubt on camera, unscripted. The answer that follows then feels earned, not pitched.",
    },
    {
      q: 'Are vox pops top-of-funnel or middle-of-funnel content?',
      a: 'Both, depending on the question. A playful vox pop, such as "salt or sweet?", earns attention at the top of the funnel. A vox pop built on the two-answer rule, where the host asks "why?" and the stranger names a doubt, belongs in the middle. Pick the job for each video before the shoot, because the question settles it.',
    },
    {
      q: 'What is the two-answer rule?',
      a: 'The two-answer rule says the first answer to a street interview question is usually the polite one. The second, given after one gentle follow-up such as "why though?", is often what the person really thinks. MoFu content is built from that second answer, because it tends to carry the doubt, fear or habit that decides whether someone buys.',
    },
    {
      q: 'How do you turn one street interview into several posts?',
      a: "Mine the footage for exact phrases, then turn each strong insight into three assets. An objection carousel opens on the phrase. A walkthrough video works through the decision. A community question asks followers to agree or push back, and its replies can give you next week's street question. Use a clip only with the person's consent.",
    },
    {
      q: 'What is a zero-click call to action?',
      a: 'A zero-click call to action is a next step people can take without leaving the post: replying with one word, saving it, sending it to a friend or answering a question. It asks for a small signal of trust, not a purchase. For MoFu content, a count of keyword replies is also one of the clearest numbers to track.',
    },
    {
      q: 'How do you measure MoFu content?',
      a: 'Measure signs of trust, not reach. Track saves, sends, keyword replies, DMs with specific questions, comments that quote the clip back and return viewers. Read comments for detail, not volume, and note which question each reply came from. Views still matter at the top of the funnel, but they say little about whether someone is considering you.',
    },
    {
      q: 'Do city differences really matter for content?',
      a: "They can, but treat them as hypotheses, not facts. A city lens is a guess about the doubt a group might carry, such as fear of choosing wrong, money pressure or what family will say. Test the guess with a street question and a follow-up. If the second answers don't match the lens, drop it and follow what people said.",
    },
  ],

  sources: [
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert with poll data, yet shifted personal opinion more (CLAIMS R11).',
    },
    {
      id: 'nielsen-trust',
      title: 'Beyond martech: building trust with consumers and engaging where sentiment is high',
      url: 'https://www.nielsen.com/insights/2021/beyond-martech-building-trust-with-consumers-and-engaging-where-sentiment-is-high/',
      publisher: 'Nielsen',
      date: '2021',
      note: '88% of global respondents trust recommendations from people they know (CLAIMS E09).',
    },
    {
      id: 'iamai-2025',
      title: "India's internet user base tops 950 million as rural growth, AI drive adoption",
      url: 'https://www.businesstoday.in/technology/news/story/indias-internet-user-base-tops-950-million-as-rural-growth-ai-drive-adoption-513353-2026-01-29',
      publisher: 'Business Today, on the IAMAI and Kantar Internet in India 2025 report',
      date: '2026-01-29',
      note: 'About 588 million short-video viewers in 2025; rural 302 million, urban 286 million (CLAIMS E15).',
    },
    {
      id: 'pwc-india-2024',
      title: "PwC's Voice of the Consumer Survey 2024 (India): press release",
      url: 'https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html',
      publisher: 'PwC India',
      date: '2024-07',
      note: '77% discover brands on social media, 81% seek reviews there, least-trusted channel (CLAIMS S17).',
    },
    {
      id: 'forbes-india-d2c',
      title: "India's D2C journey: After a rapid scale-up, why it's now all about discipline",
      url: 'https://www.thirdeyesight.in/?p=6940',
      publisher: 'Forbes India (Samar Srivastava), syndicated by Third Eyesight',
      date: '2026-02-27',
      note: 'D2C moved from rapid scale-up to discipline: margins, repeat purchases, profit (CLAIMS S07).',
    },
    {
      id: 'youtube-genz',
      title: '83% Gen Z create content and 80% want brands playing along: survey',
      url: 'https://www.exchange4media.com/marketing-news/83-gen-z-create-content-and-80-want-brands-playing-along-survey-149389.html',
      publisher: 'exchange4media, on YouTube and SmithGeiger research',
      date: '2025-11-17',
      note: '83% of Indian Gen Z consider themselves creators (CLAIMS S27, E18).',
    },
    {
      id: 'niq-ai-ads',
      title: 'NIQ research uncovers hidden consumer attitudes toward AI-generated ads',
      url: 'https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/',
      publisher: 'NielsenIQ',
      date: '2024-12',
      note: 'AI-generated ads rated more annoying and confusing; weaker memory activation (CLAIMS S28).',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'Trial Reels show a Reel to non-followers first (CLAIMS E23).',
    },
    {
      id: 'voss-mirroring',
      title: 'Never Split the Difference: summary',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Mirroring: repeat the last few words to keep someone talking (CLAIMS P08).',
    },
    {
      id: 'whatsapp-india',
      title: 'India lifts WhatsApp payment curbs',
      url: 'https://techcrunch.com/2024/12/31/india-lifts-whatsapp-payment-curbs/',
      publisher: 'TechCrunch',
      date: '2024-12-31',
      note: 'More than 500 million WhatsApp users in India (CLAIMS S10).',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI via The Week',
      date: '2025-11-14',
      note: 'DPDP Rules notified November 2025; duties phase in over 12 to 18 months (CLAIMS P07).',
    },
    {
      id: 'endorsement',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose material connections with "advertisement", "sponsored" or "paid promotion" (CLAIMS E26).',
    },
    {
      id: 'bmrcl',
      title: 'Bengaluru: after 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023',
      note: 'Namma Metro shoots need prior permission and a fee (CLAIMS P06).',
    },
    {
      id: 'one-sided-vox-pops',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies',
      date: '2018',
      note: '2,000-interview sample of Flemish TV vox pops: a large majority of items show one point of view (CLAIMS E08).',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram shares algorithm insights for 2025',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01',
      note: 'Watch time, likes and sends are the top ranking signals (CLAIMS P02).',
    },
  ],

  related: ['vox-pop-funnel', 'street-interview-techniques', 'vox-pop-market-research', 'street-interviews-for-small-business'],
};

export default post;
