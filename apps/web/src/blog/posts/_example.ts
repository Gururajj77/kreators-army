import type { Post } from '../types';
import meta from './_example.meta';

// The format example (.work/v2/blog/FORMAT.md): every block type and every widget once, with realistic content. A leading "_" keeps it out of the
// registry, and the validator does not hold it to the word count. Copy its shapes, not its words.

const post: Post = {
  meta,

  answer:
    'A good vox pop question is short, specific and easy to answer in one breath, but it leaves room for a story. Ask about a choice, a habit or a guess rather than an opinion on your brand, then follow the first answer with a second question. The second answer is usually the one worth posting.',

  takeaways: [
    'Ask about a choice, a habit or a guess. People answer those quickly and honestly.',
    'Keep the question to **one breath**. If it needs a setup, the setup goes on screen, not in the question.',
    'Plan a follow-up for every question. The first answer is polite; the second is usually real.',
    'Give each video in a batch its own mechanism, so no two videos ask the same thing.',
  ],

  body: [
    // A paragraph is a bare string. Inline markup: **bold**, _italic_, [text](/route), [text](#id), [text](https://…), [^source-id].
    'A vox pop lives or dies on its question. The host, the street and the edit all matter, but a stranger only gives you a few seconds, and the question decides what they do with them.',

    'Below are the rules we use when we plan a [trial video](/trial), with a worked script and tools you can try on your own product. The format itself is old: broadcasters have asked the public for their views on the street for decades[^cambridge-vox-pop].',

    {
      type: 'definition',
      id: 'vox-pop',
      term: 'Vox pop',
      text: 'Short for _vox populi_, "voice of the people". A host asks people on the street one question on camera, and the best answers are cut into a short video.',
      source: 'cambridge-vox-pop',
    },

    { type: 'h2', id: 'what-makes-a-question-work', text: 'What makes a question work on the street', toc: 'What makes it work' },

    "A question that reads well in a meeting can still die on the pavement. The person you stop is busy, a little wary and being filmed. They'll answer what they can answer fast, and they'll answer it honestly only if it doesn't feel like a test.",

    {
      type: 'list',
      items: [
        '**Specific:** "What did you last spend too much on?" beats "How do you shop?"',
        '**Easy to start:** the first five words of an answer should come without thinking.',
        '**Open at the end:** a good question leaves room for a reason, a story or a laugh.',
        '**About them, not you:** ask about their life, then bring the product in.',
      ],
    },

    { type: 'h3', id: 'one-breath-rule', text: 'The one-breath rule' },

    'Say the question out loud. If you need a second breath, it is too long for the street. Cut the setup and put it on screen as a caption instead, where the viewer reads it while the person answers.',

    {
      type: 'list',
      ordered: true,
      items: ['Write the question.', 'Read it aloud at normal speed.', 'Cut every word that is setup, not question.', 'Read it again to someone who has not seen the brief.'],
    },

    {
      type: 'callout',
      tone: 'tip',
      title: 'Test it on a friend first',
      text: 'Ask the question to two people who know nothing about the brand. If either asks "what do you mean?", rewrite it before the shoot day.',
    },

    {
      type: 'quote',
      text: "We'd rather follow a genuinely good moment than force a script.",
      attribution: 'Kreators.Army, on how the interviewer works the street',
    },

    {
      type: 'table',
      caption: 'Three question types and what each tends to get on camera',
      head: ['Question type', 'Example', 'What it tends to get'],
      rows: [
        ['A guess', '"What do you think this costs?"', 'A number, then a reaction to the reveal'],
        ['A choice', '"Salt or sweet, and why?"', 'A quick pick, then a reason'],
        ['A habit', '"What is the first thing you do when you get home?"', 'A small story people recognise'],
      ],
      rowHeaders: true,
      // A long bank (the 120-question list) adds search: true, filterColumn and up to 200 rows.
      search: true,
      filterColumn: 0,
      copyColumn: 1,
    },

    {
      type: 'comparison',
      title: 'Opinion question or choice question',
      left: { label: 'Opinion question', items: ['"What do you think of our brand?"', 'Puts people on the spot', 'Gets polite, short answers'] },
      right: { label: 'Choice question', items: ['"Which of these two would you take home?"', 'Easy to answer in a second', 'Leaves room for a reason'] },
      verdict: 'Lead with the choice. The opinion comes out on its own in the follow-up.',
    },

    { type: 'h2', id: 'a-worked-example', text: 'A worked example' },

    'Here is a guessing question written as a two-answer script. The first answer is the guess; the second comes after the reveal, and it is usually the part of the clip people remember.',

    {
      type: 'script',
      id: 'script-guess-the-price',
      title: 'Guess the price, with a follow-up',
      context: 'One host, one product in hand, a busy pavement. The product stays out of shot until the host asks.',
      lines: [
        { direction: 'The host holds the product at chest height.' },
        { speaker: 'Host', text: 'Quick one. What do you think this costs?' },
        { speaker: 'Participant', text: 'Hmm. Maybe a thousand?' },
        { speaker: 'Host', text: 'Lower. Much lower.' },
        { direction: 'Reveal the price on a card.' },
        { speaker: 'Host', text: 'Would you buy it now?' },
      ],
    },

    { type: 'video', brand: 'Waxys', title: 'Smell It And Guess', caption: 'A guessing question in practice: smell first, guess second, reveal last.' },

    {
      type: 'widget',
      widget: 'reveal',
      id: 'two-answers',
      props: {
        title: 'The first answer and the second',
        items: [
          {
            question: 'What do you look for in a sofa?',
            first: '"Comfort, I guess."',
            second: '"My last one sagged in a year, so now I sit on every one in the shop before I buy."',
            note: 'The follow-up was simply "What happened with the last one?"',
          },
        ],
      },
    },

    { type: 'h2', id: 'planning-the-shoot', text: 'Planning the questions for a shoot' },

    {
      type: 'steps',
      id: 'steps-question-set',
      title: 'Build a question set in five steps',
      intro: 'Do this before the shoot day, with the brief open.',
      howTo: true,
      totalTime: 'PT1H',
      supplies: ['The brief', 'A list of the products in the batch'],
      steps: [
        { name: 'Pick one job per video', text: 'Curiosity, a problem, a benefit or social proof. One job, not four.' },
        { name: 'Choose a mechanism', text: 'A guess, a choice, a ranking or a challenge. See [the eleven mechanisms](/blog/eleven-ways-to-vary-a-vox-pop-batch).' },
        { name: 'Write the first question', text: 'One breath, about the person, easy to start.' },
        { name: 'Write the follow-up', text: 'The question that turns a polite answer into a real one.' },
        { name: 'Read both aloud', text: 'Cut anything that needs a second breath. Then lock the set in the [brief](/trial#brief).' },
      ],
    },

    {
      type: 'framework',
      id: 'ask-framework',
      name: 'ASK',
      tagline: 'Three checks for every question before it goes on a card.',
      parts: [
        { key: 'A', name: 'Aim', text: 'The video has one job, and the question serves it.' },
        { key: 'S', name: 'Simple', text: 'One breath, no setup, no jargon.' },
        { key: 'K', name: 'Keep going', text: 'A follow-up is written down before the shoot.' },
      ],
    },

    'A batch should not repeat itself. Each video gets its own mechanism, so the questions stay fresh while the shoot stays efficient.',

    { type: 'mechanisms', caption: 'The eleven mechanisms a batch can mix.' },

    { type: 'stat', value: '100M+', label: 'Views across our work', source: 'kreators-numbers', note: 'Past results, not a promise.' },

    // The one optional mid-post call to action. The page itself always ends with the primary action, so never put this last.
    { type: 'cta', text: 'Want to see the format on your own product before you commit?' },

    { type: 'divider' },

    { type: 'h2', id: 'tools-to-try', text: 'Tools to try on your own questions' },

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'question-builder',
      props: {
        title: 'Build questions for your product',
        intro: 'Type your product and its closest alternative. The questions fill in as you type.',
        fields: [
          { id: 'product', label: 'Your product', placeholder: 'e.g. a scented candle', example: 'a scented candle' },
          { id: 'rival', label: 'What people use instead', placeholder: 'e.g. an incense stick', example: 'an incense stick' },
        ],
        templates: [
          { text: 'Guess what {product} costs. Closest guess wins.', group: 'Guess', mechanism: 'Guessing and reveals' },
          { text: '{product} or {rival}: which one goes home with you, and why?', group: 'Choice', mechanism: 'A/B comparisons' },
          { text: 'Rank these three: {product}, {rival}, or neither.', group: 'Choice', mechanism: 'Rankings' },
          { text: 'Close your eyes. What does {product} remind you of?', group: 'Surprise', mechanism: 'Unexpected questions' },
        ],
        note: 'Every question still needs a follow-up. Write it before the shoot.',
      },
    },

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'candle-question',
      props: {
        title: 'One question, rewritten',
        before: { label: 'Before', text: '"Do you like our candles?"', points: ['A yes or no', 'About the brand, not the person'] },
        after: { label: 'After', text: '"Smell this. What does it remind you of?"', points: ['Easy to start', 'Room for a memory or a laugh'] },
        note: 'Same product, same street. Only the question changed.',
      },
    },

    {
      type: 'widget',
      widget: 'quiz',
      id: 'street-ready-quiz',
      props: {
        title: 'Is your question street-ready?',
        intro: 'Answer for the question you plan to ask.',
        questions: [
          {
            q: 'Can you say it in one breath?',
            options: [
              { text: 'Easily', points: 2 },
              { text: 'Just about', points: 1 },
              { text: 'No', points: 0 },
            ],
            explain: 'Anything longer goes on screen as a caption.',
          },
          {
            q: 'Is it about the person or about your brand?',
            options: [
              { text: 'The person', points: 2 },
              { text: 'A bit of both', points: 1 },
              { text: 'The brand', points: 0, why: 'Brand questions tend to get polite, short answers. Ask about their life first.' },
            ],
          },
          {
            q: 'Have you written the follow-up?',
            options: [
              { text: 'Yes', points: 2 },
              { text: 'Not yet', points: 0 },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Not yet', text: 'Rewrite it with the one-breath rule, then plan the follow-up.' },
          { min: 3, title: 'Close', text: 'Tighten the wording and test it on a friend.' },
          { min: 5, title: 'Ready', text: 'Put it on a card. Your follow-up is where the clip will come from.' },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'checklist',
      id: 'shoot-day-kit',
      props: {
        title: 'Shoot-day kit',
        items: [
          { id: 'power', text: 'Phones or cameras charged, with a power bank' },
          { id: 'mics', text: 'Two wireless mics and spare batteries' },
          { id: 'consent', text: 'Consent forms, printed or on a phone', detail: 'Ask before you film anyone up close, and again before you use the clip.' },
          { id: 'product', text: 'Enough product for every take' },
          { id: 'cards', text: 'Question cards, each with its follow-up' },
          { id: 'backup', text: 'A second spot nearby, in case the first gets crowded' },
        ],
        done: 'Packed. Go and ask.',
      },
    },

    {
      type: 'widget',
      widget: 'calculator',
      id: 'people-to-approach',
      props: {
        title: 'How many people should you approach?',
        intro: 'Put in your own estimates. The answer is a planning number, nothing more.',
        inputs: [
          { key: 'clips', label: 'Usable answers you want', default: 5, min: 1, max: 50, step: 1 },
          { key: 'stopRate', label: 'People who stop and answer', default: 30, min: 1, max: 100, step: 1, unit: '%' },
          { key: 'keepRate', label: 'Answers good enough to use', default: 25, min: 1, max: 100, step: 1, unit: '%' },
          { key: 'minutes', label: 'Minutes per approach', default: 2, min: 1, max: 10, step: 1, unit: 'min' },
        ],
        outputs: [
          { key: 'approach', label: 'People to approach', formula: 'ceil(clips / (stopRate / 100) / (keepRate / 100))', format: 'number', unit: 'people' },
          { key: 'hours', label: 'Time on the street', formula: 'round(approach * minutes / 60, 1)', format: 'number', decimals: 1, unit: 'hours' },
        ],
        disclaimer: 'Your own estimates, for planning only. Real numbers change with the place, the time of day and the question.',
      },
    },

    {
      type: 'widget',
      widget: 'slides',
      id: 'question-funnel',
      props: {
        title: 'The question funnel',
        slides: [
          { heading: 'Start wide', text: 'A warm-up anyone can answer: "Long day?"' },
          { heading: 'Narrow it', text: 'The real question, about their life: "What do you do first when you get home?"' },
          { heading: 'Bring the product in', text: 'Hand it over or hold it up, then ask the guess or the choice.' },
          { heading: 'Follow up', points: ['"Why that one?"', '"What happened last time?"', '"Would you tell a friend?"'] },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'timeline',
      id: 'first-month',
      props: {
        title: 'A first month of street questions',
        items: [
          { when: 'Week 1', title: 'Write the set', text: 'Ten questions, each with a follow-up and a mechanism.', tasks: ['Read each one aloud', 'Test two on friends'] },
          { when: 'Week 2', title: 'Shoot', text: 'One shoot day, two spots, the whole set.' },
          { when: 'Week 3', title: 'Edit and post', text: 'Cut for the feed: a strong opening, no dead air, a clean ending.' },
          { when: 'Week 4', title: 'Learn', text: 'Note which questions held attention, and write the next set from them.' },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'poll',
      id: 'opener-poll',
      props: {
        question: 'Which opener would make you stop?',
        options: ['"Can I ask you something quick?"', '"Smell this."', '"Settle a debate for us."'],
        after: 'There is no wrong pick. The best opener is the one that fits the street you are on, so try two on the day.',
      },
    },

    {
      type: 'widget',
      widget: 'flipCards',
      id: 'terms',
      props: {
        title: 'Three terms from the street',
        cards: [
          { front: 'Warm-up question', back: 'An easy first question that gets someone talking before the real one.' },
          { front: 'Follow-up', back: 'The second question, written before the shoot, that turns a polite answer into a real one.' },
          { front: 'Reveal', back: 'The moment the answer to a guess is shown. The reaction is often the clip.' },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'picker',
      id: 'which-mechanism',
      props: {
        title: 'Which mechanism should your next video use?',
        questions: [
          {
            q: 'What should the viewer feel?',
            options: [
              { text: 'Curious', outcomes: ['guess'] },
              { text: 'Ready to argue', outcomes: ['choice'] },
              { text: 'Amused', outcomes: ['challenge'] },
            ],
          },
          {
            q: 'What does your product do best?',
            options: [
              { text: 'Surprises people on price', outcomes: ['guess'] },
              { text: 'Beats an alternative', outcomes: ['choice'] },
              { text: 'Gets a reaction when tried', outcomes: ['challenge', 'guess'] },
            ],
          },
        ],
        outcomes: [
          { id: 'guess', title: 'A guess and a reveal', text: 'Ask people to guess, then show the answer.', reasons: ['The reveal gives the clip its ending'] },
          { id: 'choice', title: 'An A/B choice', text: 'Put two options in front of people and ask them to pick.', reasons: ['Easy to answer', 'Viewers pick a side too'] },
          { id: 'challenge', title: 'A small challenge', text: 'A blind test or a quick task with the product.' },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'decisionTree',
      id: 'can-we-use-this-clip',
      props: {
        title: 'Can we use this clip?',
        intro: 'A planning aid for the edit, not legal advice.',
        start: 'consent',
        nodes: [
          {
            id: 'consent',
            q: 'Did the person agree on camera, or sign a release?',
            options: [
              { text: 'Yes', next: 'bystanders' },
              { text: 'No', next: 'ask-first' },
            ],
          },
          {
            id: 'bystanders',
            q: 'Can you clearly identify anyone else in the frame?',
            options: [
              { text: 'No', next: 'use-it' },
              { text: 'Yes', next: 'blur' },
            ],
          },
        ],
        ends: [
          { id: 'use-it', title: 'Good to edit', text: 'Keep the release with the project files.', tone: 'go' },
          { id: 'blur', title: 'Blur or crop first', text: 'Or ask those people too before the clip goes out.', tone: 'caution' },
          { id: 'ask-first', title: 'Do not use it yet', text: 'Get consent before the clip is used anywhere.', tone: 'stop' },
        ],
        note: 'Rules on filming people differ by place and use. Check with a lawyer for anything you are unsure of.',
      },
    },

    {
      type: 'widget',
      widget: 'scoreCard',
      id: 'rate-your-clip',
      props: {
        title: 'Rate your own vox pop',
        intro: 'Score a clip you have already posted, honestly.',
        scale: { min: 1, max: 5, lowLabel: 'Weak', highLabel: 'Strong' },
        criteria: [
          { id: 'opening', label: 'A strong opening moment', weight: 2 },
          { id: 'context', label: 'Clear context', help: 'A viewer with the sound off knows what was asked.' },
          { id: 'audio', label: 'Clean audio' },
          { id: 'reaction', label: 'A real reaction', weight: 2 },
          { id: 'ending', label: 'A clean ending' },
        ],
        bands: [
          { min: 0, title: 'Start with the question', text: 'Most fixes begin before the shoot. Rewrite the question and plan a follow-up.' },
          { min: 50, title: 'Getting there', text: 'Look at the lowest score first. It is usually the opening or the audio.' },
          { min: 80, title: 'Strong', text: 'Keep the question. Try a new mechanism for the next one.' },
        ],
      },
    },
  ],

  faqs: [
    {
      q: 'How long should a vox pop question be?',
      a: 'Short enough to say in one breath. A stranger on the street decides in a second or two whether to answer, so a long question loses them. If the question needs context, show the context on screen as a caption and keep the spoken question short.',
    },
    {
      q: 'Should a vox pop question mention the brand?',
      a: 'Usually not at first. Ask about the person: a habit, a choice or a guess. Bring the product in once they are talking, by handing it over or holding it up. Questions about the brand itself tend to get short, polite answers that do not hold a viewer.',
    },
    {
      q: 'What is a follow-up question in a vox pop?',
      a: 'It is the second question, asked after the first answer, that turns a quick reply into a reason or a story. Write it before the shoot day. A simple "why that one?" or "what happened last time?" is often enough, and the second answer is usually the part worth keeping.',
    },
    {
      q: 'How many questions should you take to a vox pop shoot?',
      a: 'Take more than you need. A set of eight to ten questions, each with a written follow-up, gives the host room to drop the ones that fall flat on the day. A batch of five videos needs five strong questions, so the extra ones are insurance, not waste.',
    },
    {
      q: 'What is a warm-up question in a street interview?',
      a: 'A warm-up question is an easy first question that gets someone talking before the real one, such as "Long day?" or "Where are you headed?". It relaxes the person, gives the sound check a few seconds, and makes the main question feel like part of a conversation rather than a test.',
    },
    {
      q: 'Can the same vox pop question work for different products?',
      a: 'Often, yes. A guessing or choice question travels well: swap the product and the follow-up, and the shape of the question still works. What changes is the reveal and what you want the viewer to feel. Note which question shapes hold attention, and reuse them across the batch with new mechanisms.',
    },
  ],

  sources: [
    { id: 'cambridge-vox-pop', title: 'Vox pop', url: 'https://dictionary.cambridge.org/dictionary/english/vox-pop', publisher: 'Cambridge Dictionary' },
    { id: 'kreators-numbers', title: 'Our numbers', url: '/numbers', publisher: 'Kreators.Army', note: 'The site’s own past results, shown with "Past results, not a promise."' },
  ],

  related: ['what-goes-in-a-vox-pop-brief', 'eleven-ways-to-vary-a-vox-pop-batch'],
};

export default post;
