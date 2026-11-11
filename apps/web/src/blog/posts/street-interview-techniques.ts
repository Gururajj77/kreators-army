import type { Post } from '../types';
import meta from './street-interview-techniques.meta';

// Street interview techniques: 10 frameworks with scripts (PLAN.md post 11). Shoot cluster pillar on interview craft.
// Source: the founder's PDF, pp. 66-94 (the "vox pop strategy for any brand" script, its ten carousels and the podcast host questions), rewritten.
// Facts only from CLAIMS.md: R01, R11, R15, P01, P07, P08, E06, E23, E26 and 5.8, plus content.ts (INTERACTION, WE_CANNOT, the follow-up line).
// Dropped per the brief: F01, F07-F10, "97% fail", the Substack asides and the competitor line. Every exchange is illustrative. The ten
// techniques are presented as advice: the site does not say Kreators.Army runs these named frameworks on its shoots (PLAN.md decision 2).
// Inbound anchors from other posts (keep these ids): pressure-test, pace, drop, socratic-stack, fault-line, mirror-question, echo-technique,
// second-question-rule, open-loop, stack-protocol.

const post: Post = {
  meta,

  answer:
    'Street interview techniques are the moves that get a vox pop participant past their polite first answer. Kreators.Army’s guide sets out ten, in interview order. Test your line on strangers before filming. Ask about a moment, not an opinion. Offer a slightly wrong guess to correct, go three questions deep, echo their key words and wait.',

  takeaways: [
    'Say your ad line to strangers before you film. If they squint or ask what it means, fix the message first.',
    'Open with a minute of small talk, a light frame and one question about a moment. People who feel tested give safe answers.',
    'Go past the first answer: offer a slightly wrong guess, stack three questions, or ask about the moment they almost didn’t buy.',
    'Echo the key two or three words, then stay quiet. What fills the silence is often the line the video is built on.',
    'Don’t stop at the first answer. “Interesting, why though?”, asked once someone has committed, tends to bring out the real reason.',
    'Practise one technique per shoot. Ten new moves at once make a host stiff.',
  ],

  body: [
    `Most advice on street interviews stops at "avoid yes or no questions". Fine. That part is easy. The hard part starts the moment someone answers.`,

    `The first answer is usually polite. "It's nice." "Good quality." "Value for money." People say it to be helpful, and nobody has ever forwarded it to a friend. The line worth filming tends to come second, or third, or after a silence the host was brave enough to leave alone.`,

    'Below are ten techniques for getting there, in the order an interview runs, each with a script to copy and a note on when it breaks. The first, the [pressure test](/blog/vox-pop-glossary#pressure-test), happens before anyone presses record.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    'New to the format? Start with [what vox pop content is](/blog/what-is-vox-pop-content).',

    { type: 'h2', id: 'why-the-polite-answer', text: 'Why do street interviews get the polite answer?', toc: 'Why the polite answer' },

    'Because the first answer is a social one. A stranger with a mic in front of them reaches for the safe, sensible thing to say, and most interviews stop right there.',

    `Nobody is lying. They're on a footpath, half their mind on the auto they were about to catch. Someone they've never met wants an opinion, on camera, now. The safest move is an answer that sounds reasonable and won't look silly later.`,

    `Brand teams have a polite-answer problem of their own. Messages get built on guesses about what buyers think, and the guesses rarely meet a stranger before launch. Four common ones, next to what the street might say back:`,

    {
      type: 'table',
      caption: 'What a brand team assumes, and what you may hear on the street (illustrative)',
      head: ['The team assumes', 'What the street may say', 'The technique that finds it'],
      rows: [
        ['"Our buyers want premium."', `"I just want something that works and doesn't make me feel stupid."`, 'The Socratic stack'],
        ['"Our message is clear."', '"Sorry, what does that mean?"', 'The pressure test'],
        ['"People buy us for the taste."', `"Honestly? I buy it so I don't have to think about breakfast."`, 'DROP'],
        ['"Our content feels real."', '"Ye sab marketing hai." (It’s all marketing.)', 'The FAULT line'],
      ],
      rowHeaders: true,
    },

    'Those street answers are made up to show the gap. Why chase the unpolished version at all? Because ordinariness is where a vox pop gets its pull.',

    'In [a 2022 experiment with TV news items](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html), viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-pop-vs-expert]. Our reading: ordinary voices carry weight because they sound like people. A rehearsed answer sounds like an ad, and throws that weight away.',

    'So every technique below has one job: get past the answer people think they should give, without pushing anyone or putting words in their mouth.',

    { type: 'h2', id: 'pressure-test', text: 'The pressure test: how do you check a message before filming?', toc: '1. The pressure test' },

    'The pressure test means saying your headline or hook, word for word, to strangers before you film anything, and watching their faces. If they squint, hesitate or ask what it means, fix the message before you spend on production.',

    `Your analytics show where viewers left, never why. A face shows why, in the two seconds after the line lands. A squint or a polite "hmm" means something in the words didn't work.`,

    `It's the cheapest test in the process, and it catches what no edit can fix. In a feed, nobody stands beside your line to explain it. If it needs you there, it isn't ready.`,

    {
      type: 'steps',
      id: 'steps-pressure-test',
      title: 'How to run a pressure test',
      intro: 'Do it a few days before the shoot, so there is time to rewrite.',
      howTo: true,
      totalTime: 'PT1H',
      supplies: ['The line you want to test, printed', 'A notebook or a notes app'],
      steps: [
        { name: 'Pick the line', text: 'Choose the headline or hook your team is proudest of, exactly as you would run it.' },
        { name: 'Find people who owe you nothing', text: 'Look for strangers who could plausibly buy from you and have a minute, such as a queue at a chai stall. Colleagues already know what you mean.' },
        { name: 'Ask for honesty', text: `Say you'll read one sentence and want their first thought.` },
        { name: 'Read it once', text: `Say it word for word, at normal speed. Don't explain or repeat it.` },
        { name: 'Watch the face', text: 'Note the first two seconds: a nod, a squint, a laugh or a blank look.' },
        { name: 'Ask what it meant', text: 'Ask "What did you think it meant?" and write down their exact words.' },
        { name: 'Compare and rewrite', text: 'Put what you meant next to what they heard. Fix that gap before you film.' },
      ],
    },

    {
      type: 'script',
      id: 'script-pressure-test',
      title: 'The pressure test, word for word',
      context: 'No camera. One stranger, one line and a notebook.',
      lines: [
        { speaker: 'Host', text: `Can I try something quick on you? I'll say one sentence. Tell me the first thing that comes to mind. Be honest, I won't be offended.` },
        { direction: 'Read the line once, exactly as written.' },
        { direction: `Watch their face for two seconds. Don't speak.` },
        { speaker: 'Host', text: 'Did that make sense? What did you think it meant?' },
        { speaker: 'Host', text: `Who do you think that's for?` },
        { direction: 'Write down their exact words, then thank them.' },
      ],
    },

    `Treat the result as a smoke alarm. A few people on one street can't tell you what a market thinks, but they can tell you a line confuses people. More in [street interviews as market research](/blog/vox-pop-market-research).`,

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'People rushing past will nod at anything. Only count reactions from someone who stopped. Three careful reactions beat a crowd of hurried nods.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-pressure-test',
      props: {
        title: 'The pressure test, as a carousel',
        slides: [
          { heading: 'Test the message first', text: 'Take your best line to the street before the shoot. Leave the camera at home.' },
          { heading: 'The first two seconds', points: ['A nod: it landed.', 'A squint: something is off.', `A blank look: they're lost, and too polite to say.`] },
          { heading: 'Ask what they heard', text: '"Did that make sense? What did you think it meant?"' },
          { heading: 'Mind the gap', text: 'Rewrite until what you meant and what they heard match. Then book the shoot.' },
        ],
      },
    },

    { type: 'h2', id: 'pace', text: 'PACE: how do you open a street interview?', toc: '2. PACE' },

    `Use PACE, a four-part opening: permission, anchoring, catalyst and extraction. Be a person for a minute. Frame the topic without hinting at an answer. Ask for a moment rather than an opinion, then hold still while the answer arrives.`,

    'The first minute decides whether you get a conversation or a performance.',

    {
      type: 'list',
      items: [
        `**Permission.** Comment on something you can both see, like the heat or the queue at the chai stall. Say who you're filming for in your first sentence. Nobody relaxes around a mystery.`,
        `**Anchoring.** Name the topic, never the answer. "What people really think about breakfast, not the ad version" is a topic. "Why people love healthy breakfasts" is the answer you want, and you'll get it, politely.`,
        '**Catalyst.** Ask for a moment instead of a review. "What do you think about protein bars?" gets a description. "When did a snack last get it exactly right for you?" gets a time and a place.',
        `**Extraction.** Don't celebrate a good line, don't say "wow" and don't nod. A nod tells people they've said enough.`,
      ],
    },

    'For more catalyst questions, sorted by category, see [120 vox pop questions for brands](/blog/vox-pop-questions).',

    {
      type: 'script',
      id: 'script-pace',
      title: 'PACE: a full opening',
      context: 'The camera stays lowered until the person has agreed and signed the release.',
      lines: [
        { speaker: 'Host', text: `Hi, sorry, quick one. We're filming short street interviews for [brand], a snack company. Have you got two minutes?` },
        { direction: 'They agree. Say where the video will appear. They sign the release.' },
        { speaker: 'Host', text: 'Long day?' },
        { speaker: 'Host', text: `We're asking people about their 4 pm snack. Not the ad version. Yours.` },
        { speaker: 'Host', text: 'When did a snack last get it exactly right for you?' },
        { direction: `Stay still. Don't nod. When they finish, wait two more seconds.` },
      ],
    },

    'Let people answer in whatever language comes naturally. If your hello gets a reply in Kannada, Hindi or Hinglish, switch if you can. A question asked in someone’s second language tends to get their second-best answer.',

    'That’s what subtitles are for.',

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'At a busy signal, nobody has a minute for permission. Ask a quick either-or question instead, and save PACE for people who stop.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-pace',
      props: {
        title: 'PACE, as a carousel',
        slides: [
          { heading: 'P: Permission', text: `Talk like a neighbour for a minute. Mention the heat or the queue. Say who you're filming for.` },
          { heading: 'A: Anchoring', text: 'Name the topic, never the answer. "Not the ad version. Yours."' },
          { heading: 'C: Catalyst', text: 'Ask for a moment, not a review. "When did a product last get it exactly right for you?"' },
          { heading: 'E: Extraction', text: 'No nodding, no "wow". Stay still until they have properly finished.' },
        ],
      },
    },

    { type: 'h2', id: 'drop', text: 'DROP: how do you get the real reason without asking why?', toc: '3. DROP' },

    'Offer a slightly wrong guess that people want to correct. That is DROP: displace their assumption gently, restate it a little further off, observe the correction, then pull the truth out with one more question.',

    `A direct "Why do you buy this?" puts someone in the exam hall. A wrong guess hands them the teacher's red pen. In our view, people explain themselves more openly when they're putting you right.`,

    'Improvisers call anything a scene partner hands you an "offer", an idea that goes back to Keith Johnstone’s 1979 book _Impro_[^impro-glossary]. A wrong guess is an offer most people can’t resist improving. [Improv for street interviews](/blog/improv-for-street-interviews) goes further into that kind of listening.',

    {
      type: 'script',
      id: 'script-drop',
      title: 'DROP: a wrong guess about breakfast',
      context: 'A participant who buys the same pack of granola every week.',
      lines: [
        { speaker: 'Host', text: `So you buy this mostly for the taste, I'm guessing?` },
        { speaker: 'Participant', text: `Taste is fine. That's not really it.` },
        { speaker: 'Host', text: `Ah, so it's basically dessert you're allowed to have at 8 am.` },
        { speaker: 'Participant', text: `No, no. It's that I don't have to think about breakfast. One less decision before work.` },
        { speaker: 'Host', text: 'One less decision. What does that feel like on a weekday morning?' },
        { direction: 'Wait. Keep the camera on them for this answer.' },
      ],
    },

    {
      type: 'callout',
      tone: 'warning',
      title: 'Where DROP goes wrong',
      text: 'A wrong guess should open a door, never set a trap. Four rules keep it fair:',
      items: [
        'Keep the guess mild and about a habit, never about who someone is. “So it’s for showing off?” will land as an insult.',
        'If they agree, believe them and move on. Never argue anyone into a better quote.',
        'In the edit, your guess stays your line. Never cut it so the person seems to agree with something they corrected.',
        'Never steer anyone toward a claim about what a product does for them.',
      ],
    },

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'Shy or deferential people may agree just to be polite. If no correction comes, let the guess go and return to an open question.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-drop',
      props: {
        title: 'DROP, as a carousel',
        slides: [
          { heading: 'Guess first, ask second', text: 'Being corrected costs you nothing. It hands the expert’s chair to the person you’re interviewing.' },
          { heading: 'D: Displace', text: `Offer a mild, slightly wrong take. "So you buy this mostly for the taste, I'm guessing?"` },
          { heading: 'R: Restate, a little off', text: `"So it's basically dessert at 8 am." A little further off, still friendly.` },
          { heading: 'O: Observe', text: 'Wait for the "No, no…". Whatever follows is in their words, not yours.' },
          { heading: 'P: Pull', text: 'One more question from inside the correction: "What does that feel like?"' },
        ],
      },
    },

    { type: 'h2', id: 'socratic-stack', text: 'The Socratic stack: how do you get past a rehearsed answer?', toc: '4. The Socratic stack' },

    'Ask three questions, each built on the answer before. That is the Socratic stack: a surface question, a gentle challenge to the reason, then a question about when that belief began. By the third, people stop reciting and start remembering.',

    `Layer two isn't an argument. It just makes the reason do some work. Layer three asks for a "when", and a "when" can only be answered with a memory.`,

    {
      type: 'script',
      id: 'script-socratic-stack',
      title: 'The Socratic stack: three layers on a work bag',
      context: 'A participant with a laptop bag on one shoulder, on the footpath outside a metro station.',
      lines: [
        { speaker: 'Host', text: 'What do you look for when you buy a work bag?' },
        { speaker: 'Participant', text: 'Lots of pockets, honestly.' },
        { speaker: 'Host', text: 'Why do pockets matter more to you than how it looks?' },
        { speaker: 'Participant', text: 'Because I hate digging for things.' },
        { speaker: 'Host', text: 'When did the digging start to bother you?' },
        { speaker: 'Participant', text: `When I started taking the metro. There's a queue behind you at the gate and your card is somewhere at the bottom. Every single morning.` },
      ],
    },

    `Nobody in a brand meeting would write "for the ten seconds at the metro gate". The person in the queue just did. That's the value of the third layer: it trades an adjective for a scene.`,

    'Scenes also carry further than claims. Media researchers call it [exemplification](https://doi.org/10.1177/009365094021001004): one vivid case tends to sway judgments more than a statistic does[^exemplification].',

    {
      type: 'video',
      brand: 'Clotrio',
      title: 'Twelve Hours',
      caption: 'Clotrio, "Twelve Hours". A number in the title, not an adjective: the exact detail a third-layer question looks for.',
    },

    `Keep the stack on habits and feelings. A street answer can tell you why people buy. It can't show that a product works, and India's advertising code expects factual claims to be [capable of substantiation](https://www.ascionline.in/the-asci-code-guidelines/)[^asci-code].`,

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'Layer two can sound like a debate. Ask it with a smile, and if they bristle, come back to layer one from another side.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-socratic-stack',
      props: {
        title: 'The Socratic stack, as a carousel',
        slides: [
          { heading: 'Layer 1: Surface', text: '"What do you look for when you buy a work bag?" Expect the rehearsed answer. Most interviews stop here.' },
          { heading: 'Layer 2: Challenge', text: '"Why does that matter more than how it looks?" Press gently on the logic.' },
          { heading: 'Layer 3: The real belief', text: '"When did that start to bother you?" A "when" needs a memory.' },
          {
            heading: 'Borrow the shape',
            points: ['1. "What do you look for in \\[category\\]?"', '2. "Why does that matter more than \\[the opposite\\]?"', '3. "When did that start to matter?"'],
          },
        ],
      },
    },

    { type: 'h2', id: 'fault-line', text: 'The FAULT line: how do you get people to talk about doubt?', toc: '5. The FAULT line' },

    `The FAULT line mines hesitation instead of praise. Ask about the moment someone almost didn't buy and let them say the doubt out loud. Find out what changed, stay quiet while it lands, then tie it to a feeling.`,

    `Praise sounds like an ad, even from a stranger. Doubt sounds like a person. We think almost everyone has a moment where they nearly didn't buy, and very few brands ask about it.`,

    'Doubt, then the flip, then the yes: a whole purchase, told by the person who made it.',

    `The FAULT line needs a buyer, so use it outside a store, at a pop-up or at an event. On an ordinary street, widen it: "Think of something you love now that you nearly didn't buy."`,

    {
      type: 'script',
      id: 'script-fault-line',
      title: 'The FAULT line: doubt, flip, decision',
      context: 'Outside a store, with someone carrying a bag they have just bought.',
      lines: [
        { speaker: 'Host', text: 'Before you bought that, was there a moment you nearly put it back on the shelf?' },
        { direction: 'They pause. Let the pause run.' },
        { speaker: 'Host', text: 'What was going through your head right then?' },
        { speaker: 'Participant', text: `That it was too much money for something I'd use twice.` },
        { speaker: 'Host', text: 'So what flipped it?' },
        { direction: 'Say nothing after they answer. Let the shift land on camera.' },
        { speaker: 'Host', text: 'Sounds like it was less about the thing and more about whether it was worth the risk. Fair?' },
      ],
    },

    `That last line is the T, and it needs care. Offer it as a guess they can reject, as DROP does. If they correct you, the correction is the better clip.`,

    `Listen for a second voice inside the doubt. "My mother would say it's too costly." "My flatmate would laugh at me." Doubts often borrow someone else's words, and viewers know exactly who that someone is.`,

    {
      type: 'video',
      brand: 'Hackdaily',
      title: 'How Bad Is It',
      caption: 'Hackdaily, "How Bad Is It". The title asks about the bad part out loud, which is where the FAULT line starts.',
    },

    { type: 'callout', tone: 'note', title: 'When it breaks', text: `Sometimes the doubt never flipped and the purchase is a regret. Thank them, and don't make a clip out of it.` },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-fault-line',
      props: {
        title: 'The FAULT line, as a carousel',
        slides: [
          { heading: 'F: Find the hesitation', text: `"Was there a moment you almost didn't buy this?" Doubt beats praise.` },
          { heading: 'A: Amplify it without judgement', text: `"What was the actual thought in your head?" Let the doubt be said in full.` },
          { heading: 'U: Uncover what changed', text: '"So what flipped it?" If you ask only one question from this deck, ask this one.' },
          { heading: 'L: Let it land', text: 'Say nothing after the answer. The camera catches the shift.' },
          { heading: 'T: Tie it to a feeling', text: 'Offer a guess they can reject: "More about whether it was worth the risk?"' },
        ],
      },
    },

    { type: 'h2', id: 'mirror-question', text: 'The mirror question: how do you get a story instead of a review?', toc: '6. The mirror question' },

    `Ask "Does this remind you of anything?". That's the mirror question. It asks for a connection instead of a verdict, so people reach for a memory, and a memory makes a better story than a description.`,

    'We think people make sense of anything new by matching it to something old. Ask what they like about a product and you get a review. Ask what it reminds them of and you might get a school tiffin, a hostel corridor or an overnight train home.',

    {
      type: 'script',
      id: 'script-mirror-question',
      title: 'Old question, mirror question (a made-up example)',
      context: `A food brand's sample in a paper cup, at a weekend market.`,
      lines: [
        { speaker: 'Host', text: 'What do you like about this?' },
        { speaker: 'Participant', text: 'It tastes good. Packaging is nice.' },
        { direction: 'Same product, next person. Hand it over first and let them taste it.' },
        { speaker: 'Host', text: 'Does this remind you of anything?' },
        { speaker: 'Participant', text: 'Honestly? This feels like something my nani would have made.' },
        { speaker: 'Host', text: 'Your nani.' },
        { direction: 'Wait. Whose kitchen, which festival, what smell: let them tell it.' },
      ],
    },

    'One product, two very different briefs. The first answer describes the food. The second gives you a grandmother, a kitchen and probably a festival.',

    'Ask it after a sensory moment, such as a smell, a taste or the weight of something in the hand. Then echo the memory and wait.',

    'Be kind, too. Memories can turn sad without warning, especially ones about grandparents. Let people stop, and ask before you use an emotional clip.',

    {
      type: 'video',
      brand: 'Waxys',
      title: 'What Does This Remind',
      caption: 'Waxys, "What Does This Remind". The mirror question, used as the premise the title names.',
    },

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'An app or a service gives people nothing to touch. Point the mirror at the problem instead: "Does this situation remind you of anything?" See [vox pop for B2B and SaaS brands](/blog/vox-pop-for-b2b-brands) for more.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-mirror-question',
      props: {
        title: 'The mirror question, as a carousel',
        slides: [
          { heading: 'Ask for a connection, not a verdict', text: '"Does this remind you of anything?" People reach for a memory instead of a review.' },
          { heading: 'What you’re listening for', points: ['A person: "my nani", "my first boss".', 'A place: a hostel room, a train home.', 'A time: exam season, a first salary.'] },
          { heading: 'Then echo the memory', text: 'Say their words back, "Your nani.", and wait. The story tends to come out on its own.' },
        ],
      },
    },

    { type: 'h2', id: 'echo-technique', text: 'ECHO: what should you say after a good answer?', toc: '7. ECHO' },

    `Almost nothing. Repeat the key two or three words back to the person, then stay quiet. That's the ECHO technique, and the silence often brings out a longer, more specific answer than a new question would.`,

    'Former FBI hostage negotiator Chris Voss popularised the move as [mirroring](https://www.mindtools.com/arg0sjv/never-split-the-difference) in the book _Never Split the Difference_[^mirroring]. Therapists use a related skill called reflective listening. The street version has four steps: extract the key phrase, confirm it back word for word, hold the silence and observe what fills it.',

    `The usual follow-up, "That's interesting, what do you mean by honest?", hands the person a new question to answer politely. An echo hands back their own words, and they start unpacking what they meant.`,

    {
      type: 'script',
      id: 'script-echo',
      title: 'ECHO: two words, then nothing',
      lines: [
        { speaker: 'Participant', text: `I don't know, I just feel like it's more honest than other brands.` },
        { speaker: 'Host', text: 'More honest.' },
        { direction: 'Silence. Count to five in your head. Face interested, head still.' },
        { speaker: 'Participant', text: `Like, they don't pretend it's something it's not. I've tried things that just felt like marketing. This doesn't.` },
      ],
    },

    `Two words, three possible angles: not pretending, a past let-down and the relief of not being sold to. None of them came from a question.`,

    'Echoing well is mostly about which words you pick, and how long you can stay quiet afterwards:',

    {
      type: 'list',
      items: [
        '**Pick the phrase with energy in it,** not just the last word. Say it flat or with a slight lift, never as a challenge, and only once per answer.',
        `**Echo in their language.** If someone says "Bas, mujhe tension nahi chahiye" (I just don't want the stress), give back "Tension nahi" and wait.`,
        `**Hold the silence for longer than feels polite.** It will feel too long. It usually isn't.`,
        `**Let a friend jump in.** In a group, someone may say "tell them about the time…". Let them. That story is often worth more than your next question.`,
        `**Brief the camera operator.** Nobody cuts, reframes or says "okay" during an echo. Silence on the day isn't dead air: the editor trims the pause and keeps what came after it.`,
      ],
    },

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'After a one-word answer, echoing "Fine." can sound like mockery. Use the second question rule instead.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-echo',
      props: {
        title: 'ECHO, as a carousel',
        slides: [
          { heading: 'Two words, then nothing', text: 'Their words, back to them, then silence.' },
          { heading: 'E and C: Extract, Confirm', text: 'Pick the phrase with energy in it. Say it back word for word. No question, no comment.' },
          { heading: 'H and O: Hold, Observe', text: 'Stay quiet. Count to five. Watch what fills the space.' },
          { heading: 'In practice', points: [`They say: "It's more honest than other brands."`, 'You say: "More honest."', 'They keep going, in their own words.'] },
        ],
      },
    },

    { type: 'h2', id: 'second-question-rule', text: 'The second question rule: why not trust the first answer?', toc: '8. The second question rule' },

    'Because the first answer is usually the one people think they should give. The second question rule says wait until they have committed to it, then ask "Interesting, why though?". What follows is often a reason they never planned to say.',

    `On camera, reasonable people say "convenient" and "good quality". The second answer comes once they've heard themselves speak and got past the small awkwardness of the lens.`,

    `Timing is the whole trick. Ask "why" too early and it challenges a position they haven't taken. Ask it after they've committed, with a smile, and it sounds like curiosity. In Hindi, "Achha, kyun?" does the same job.`,

    'Tap each card to see the second answer. The pairs are made up to show the pattern.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'first-and-second-answer',
      props: {
        title: 'First answer, second answer (illustrative)',
        firstLabel: 'First answer',
        secondLabel: 'After "Interesting, why though?"',
        items: [
          {
            question: 'What do you like about this soap?',
            first: '"I like that it smells natural."',
            second: `"Honestly? I don't trust anything with an ingredient list I can't read."`,
          },
          {
            question: 'Why this café?',
            first: `"It's close to the office."`,
            second: `"It's the only place nobody from work comes. Twenty minutes where I'm nobody's manager."`,
          },
          {
            question: 'Why do you still buy from the kirana (neighbourhood grocery) store?',
            first: '"Convenient."',
            second: '"Bhaiya knows what I need before I say it. And I can settle up at month-end, no questions."',
          },
          {
            question: 'Why did you pick that phone cover?',
            first: '"It looked good."',
            second: `"My last phone cracked in a week and I didn't tell anyone at home. Never again."`,
          },
        ],
      },
    },

    'Each pair is one person, seconds apart. Only the second answer tells a brand team something it didn’t already know.',

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'Sometimes the second answer matches the first, because some people lead with the truth. Believe them and move on. A third "why" turns curiosity into cross-examination.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-second-question',
      props: {
        title: 'The second question rule, as a carousel',
        slides: [
          { heading: 'Don’t stop at the first answer', text: `It's the one people think they're supposed to give. Sensible, safe, fine on camera.` },
          { heading: 'Wait until they commit', text: 'Asked too early, "why" sounds like a challenge. Asked after, it sounds like interest.' },
          { heading: 'Then say three words', text: '"Interesting, why though?" Or in Hindi, "Achha, kyun?"' },
          { heading: 'Know when to stop', text: 'If the second answer matches the first, believe it. A third "why" is an interrogation.' },
        ],
      },
    },

    { type: 'h2', id: 'open-loop', text: 'The OPEN loop: how do you edit answers so people keep watching?', toc: '9. The OPEN loop' },

    'Leave something unresolved until the end. The OPEN loop is an edit order: open on tension, push deeper before resolving anything, extend with a second open thread, and never close until the last clip.',

    `A vox pop that gives away its best answer in the first clip leaves the viewer nothing to wait for. Leading with the product and the praise does exactly that.`,

    `The opening carries the most weight. YouTube's own Shorts analytics measure [how often viewers stayed to watch past the first seconds](https://support.google.com/youtube/answer/12220281)[^yt-stayed-to-watch]. So the first clip has to raise a question the rest of the video answers.`,

    {
      type: 'script',
      id: 'script-open-loop',
      title: 'An OPEN loop edit, built from four answers',
      context: 'Four clips from one illustrative interview about a chair. Only their order is chosen.',
      lines: [
        { direction: 'O: open on the tension.' },
        { speaker: 'Participant', text: 'I almost sent it back.' },
        { direction: 'P: push deeper, still unresolved.' },
        { speaker: 'Participant', text: 'And honestly, I get why I wanted to. It looked so plain in the photos.' },
        { direction: 'E: extend with a second thread.' },
        { speaker: 'Participant', text: 'The first week, it just sat in the corner. Nobody touched it.' },
        { direction: 'N: close only at the end.' },
        { speaker: 'Participant', text: `Now my flatmate steals it every weekend. I've had to hide it.` },
      ],
    },

    'Three rules keep this honest. Reorder clips, never the words inside an answer. Tease only a payoff the footage contains. And never splice two people into one story.',

    'The idea is often traced to Bluma Zeigarnik’s 1927 study in Berlin on unfinished tasks. That memory effect has not held up: [a 2025 meta-analysis](https://doi.org/10.1057/s41599-025-05000-w) found no memory advantage for unfinished tasks, only a tendency to go back and finish them[^zeigarnik-meta]. Treat open loops as editing craft, not a law of the brain.',

    { type: 'callout', tone: 'note', title: 'When it breaks', text: `If the ending can't pay off the opening, the loop closes on a shrug and feels like a trick. With no real payoff, open on something smaller.` },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-open-loop',
      props: {
        title: 'The OPEN loop, as a carousel',
        slides: [
          { heading: 'Leave it open', text: 'The viewer stays for the answer they haven’t heard yet.' },
          { heading: 'O: Open on tension', text: 'Start mid-story, not with the product. "I almost sent it back."' },
          { heading: 'P and E: Push, then extend', text: 'Add a reason, then a second open thread, before anything resolves.' },
          { heading: 'N: Never close early', text: 'Save the payoff for the last clip, and make sure the footage really has one.' },
          { heading: 'The rule underneath', text: 'Reorder clips, never words. Tease only a payoff the footage has.' },
        ],
      },
    },

    { type: 'h2', id: 'stack-protocol', text: 'The STACK protocol: how do you get several moments from one interview?', toc: '10. The STACK protocol' },

    'Build the interview slowly, so each answer raises the next question. The STACK protocol does that in five beats: set an emotional baseline, test a mild provocation, amplify what surfaces, challenge the comfortable version, and keep pulling.',

    'Most interviews are a list: ask, answer, next. Nothing builds. A stack treats each answer as the floor for the next question, and the person ends up somewhere neither of you planned.',

    'It needs time, so use it where people have some: a pop-up, an event floor, a long queue. At a traffic signal, stick to one question and one echo.',

    {
      type: 'script',
      id: 'script-stack-protocol',
      title: 'The STACK protocol: five beats in one conversation',
      context: 'An event floor and a participant with ten minutes to spare.',
      lines: [
        { direction: `S: set the baseline. Don't mention the product yet.` },
        { speaker: 'Host', text: `What's been taking up most of your headspace lately?` },
        { direction: 'T: test a mild provocation.' },
        { speaker: 'Host', text: 'Does something like [your category] fit into that anywhere?' },
        { direction: `A: amplify whatever surfaces, even if it's small.` },
        { speaker: 'Host', text: `That sounds like it matters to you more than you're letting on.` },
        { direction: 'C: challenge the comfortable version.' },
        { speaker: 'Host', text: 'Would you actually miss it if it disappeared tomorrow?' },
        { direction: 'K: keep pulling, from different angles.' },
        { speaker: 'Host', text: 'Why does that matter? What would be different? Who would notice first?' },
      ],
    },

    `Each beat can leave you something: a relatable line, a reaction, a detail, some tension, then the moment people start answering themselves. You won't always get all five, but the edit gets more to choose from.`,

    'Don’t confuse it with the S.T.A.C.K. beats in [the vox pop funnel guide](/blog/vox-pop-funnel). Those shape one short chat on a footpath. This one works a single long interview for several usable moments.',

    { type: 'callout', tone: 'note', title: 'When it breaks', text: 'A challenge can turn into a grilling. Stay in the useful discomfort, but never corner anyone.' },

    {
      type: 'widget',
      widget: 'slides',
      id: 'deck-stack-protocol',
      props: {
        title: 'The STACK protocol, as a carousel',
        slides: [
          { heading: 'S and T: Set, then test', text: `"What's been on your mind lately?" Then: "Does this fit in there anywhere?"` },
          { heading: 'A: Amplify', text: '"That sounds like it matters to you." Reflect it back a size bigger, without agreeing or judging.' },
          { heading: 'C: Challenge', text: '"Would you actually miss it if it disappeared tomorrow?" Stay in the discomfort.' },
          { heading: 'K: Keep pulling', text: `"Why? What would change? Who'd notice?" Same question, from new angles.` },
        ],
      },
    },

    { type: 'h2', id: 'how-they-fit', text: 'How do the ten techniques fit together?', toc: 'How the ten fit together' },

    `They follow the order of an interview: test the message, open, go deeper, find the emotional core, capture the line, then shape the video. You won't use all ten in one conversation. Three or four is plenty.`,

    'Map them onto the six links of a street interaction (setup, question, participant, follow-up, reaction, edit) and most land in the follow-up. That’s where a shoot is usually won or lost. See [how a vox pop shoot works](/blog/how-a-vox-pop-shoot-works).',

    {
      type: 'table',
      caption: 'The ten techniques in interview order',
      head: ['Phase', 'Technique', 'What it does', 'The line to remember'],
      rows: [
        ['Before the camera', 'The pressure test', 'Checks the message before production', '"What did you think it meant?"'],
        ['Opening', 'PACE', 'Makes it safe and frames the topic', '"Not the ad version. Yours."'],
        ['Going deeper', 'DROP, the Socratic stack', 'Gets past the rehearsed answer', '"Why does that matter more than…?"'],
        ['Emotional core', 'The FAULT line, the mirror question', 'Finds the doubt and the memory', '"Does this remind you of anything?"'],
        ['Capturing it', 'ECHO, the second question rule', 'Gets the unplanned line on camera', '"Interesting, why though?"'],
        ['Output', 'The OPEN loop, the STACK protocol', 'Turns answers into moments that hold', '"Who would notice first?"'],
      ],
      rowHeaders: true,
    },

    'If you only take two into your next shoot, take ECHO and the second question rule. They need no setup, no props and no rehearsal, and they fit almost any answer.',

    { type: 'h2', id: 'full-interview', text: 'What does a full street interview sound like?', toc: 'A full interview, start to finish' },

    'Here’s one that uses five of the ten. It’s an illustration, not a transcript. Picture a made-up participant outside a co-working space in HSR Layout at about 4 pm, and a can of cold coffee from an imagined brand.',

    {
      type: 'script',
      id: 'script-full-interview',
      title: 'A full interview: PACE, ECHO, DROP, the second question and the FAULT line',
      context: 'One host, one camera operator and a can of cold coffee. The camera stays down until the person has agreed and signed.',
      lines: [
        { speaker: 'Host', text: `Hi, sorry, quick one. We're filming street interviews for [brand], a cold coffee company. Got two minutes?` },
        { direction: 'PACE, permission. They agree, hear where it will appear and sign.' },
        { speaker: 'Host', text: 'Long day?' },
        { speaker: 'Participant', text: 'Third meeting that could have been an email.' },
        { speaker: 'Host', text: `We're asking people about their afternoon coffee. Not the ad version. Yours.` },
        { direction: 'PACE, anchoring. Then the catalyst.' },
        { speaker: 'Host', text: 'When did a coffee last get it exactly right for you?' },
        { speaker: 'Participant', text: 'Honestly? The one I make at home on Sundays.' },
        { speaker: 'Host', text: 'On Sundays.' },
        { direction: 'ECHO, then silence.' },
        { speaker: 'Participant', text: 'Yeah. Nobody needs anything from me on a Sunday. Weekday coffee is just fuel.' },
        { direction: 'The host hands over the can.' },
        { speaker: 'Host', text: `So this would be fuel for you, I'm guessing. Something to survive the 4 pm meeting.` },
        { direction: 'DROP, a slightly wrong guess.' },
        { speaker: 'Participant', text: `No, no. Fuel I can get from the machine on our floor. If I'm paying for one, it has to feel like a break.` },
        { speaker: 'Host', text: 'Interesting, why though?' },
        { direction: 'The second question rule.' },
        { speaker: 'Participant', text: 'Because the office coffee tastes like the office.' },
        { speaker: 'Host', text: `Was there a moment you almost didn't try cans like this?` },
        { direction: 'The FAULT line.' },
        { speaker: 'Participant', text: 'Every time. They look like energy drinks. Then a colleague left one on my desk on a bad day.' },
        { direction: 'The host says nothing. A long pause.' },
        { speaker: 'Participant', text: 'I think I just liked that someone noticed.' },
        { direction: `The host thanks them and checks they're happy with what they said.` },
      ],
    },

    'Two lines from that conversation could open a video: "The office coffee tastes like the office" and "I just liked that someone noticed". Neither was in anyone’s brief. Both arrived after a technique, not a script.',

    'Run the OPEN loop over it and the cut almost builds itself. Open on "They look like energy drinks." Push with the office coffee. Extend with the colleague and the bad day. Close on "someone noticed". Only the order is chosen.',

    'A real participant might say none of it. The techniques raise the odds of a line like these. They never write it.',

    { type: 'h2', id: 'practise-one-per-shoot', text: 'How do you get better at street interviews?', toc: 'Practise one per shoot' },

    `Practise one technique per shoot until it's a habit, then add the next. Ten new moves at once make a host stiff, and a stiff host gets polite answers.`,

    'Run the pressure test before every shoot, from the very first. Then add the interview techniques in roughly this order:',

    {
      type: 'list',
      ordered: true,
      items: [
        '**ECHO and the second question rule.** Practise both over chai with a friend.',
        '**PACE.** Repetition turns the opening into muscle memory.',
        '**The FAULT line and the mirror question.** These need the product in hand and a little nerve.',
        '**DROP and the Socratic stack.** A wrong guess or a gentle challenge has to sound warm, which takes confidence.',
        '**The STACK protocol and the OPEN loop.** One needs a participant with time, the other an editor who knows the footage.',
      ],
    },

    'After each shoot, watch your footage with one question: where did the first answer end, and what did you do next? Count the nods. Count the silences you filled. Both numbers should fall shoot by shoot.',

    'Now test yourself on six moments from a street interview.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'what-would-you-say-next',
      props: {
        title: 'What would you say next?',
        intro: 'Pick your next move for each moment. Every option explains itself.',
        questions: [
          {
            q: 'They say: "It\'s just more honest than other brands." What next?',
            options: [
              { text: 'Echo it: "More honest."', points: 1, why: 'Their phrase has energy in it. Give it back and wait.' },
              { text: 'Ask: "What do you mean by honest?"', points: 0, why: 'It works, but it hands them a new question.' },
              { text: 'Say "Love that" and move on', points: 0, why: `Celebrating tells them they're done.` },
            ],
          },
          {
            q: 'You asked why they buy it. They say: "Good quality." What next?',
            options: [
              { text: 'Echo it: "Good quality."', points: 0, why: 'Echo a stock phrase and you get more stock phrases.' },
              { text: '"Interesting, why though?"', points: 1, why: 'They have committed, so the "why" lands as curiosity.' },
              { text: 'Move to your next question', points: 0, why: 'You keep the polite answer and leave the real one behind.' },
            ],
          },
          {
            q: 'Mid-sentence, they stop and look away: "I almost didn\'t… never mind."',
            options: [
              { text: 'Say nothing and wait', points: 1, why: `They're deciding whether to tell you. Silence lets them decide.` },
              { text: '"No, go on, tell me."', points: 0, why: 'Kind, but it adds pressure.' },
              { text: 'Change the subject to spare them', points: 0, why: 'Sometimes right, but give the silence a few seconds first.' },
            ],
            explain: 'The L in the FAULT line: let it land.',
          },
          {
            q: 'They answer "Fine." with arms folded, glancing at their phone.',
            options: [
              { text: 'Thank them and let them go', points: 1, why: `That's a "not today". Pushing gets you a clip nobody should use.` },
              { text: 'Echo it: "Fine."', points: 0, why: 'After a one-word answer, an echo can sound like mockery.' },
              { text: 'Try a wrong guess to provoke them', points: 0, why: 'DROP is for people enjoying the conversation, not people trying to leave it.' },
            ],
          },
          {
            q: 'After smelling the product, they smile: "Smells like my grandmother\'s cupboard."',
            options: [
              { text: 'Echo it: "Your grandmother\'s cupboard."', points: 1, why: 'A memory just arrived. Give it back and let them walk around inside it.' },
              { text: '"So you like it?"', points: 0, why: 'A yes-or-no question closes the memory.' },
              { text: 'Tell them about your own grandmother', points: 0, why: `Warm, but now they're listening to you.` },
            ],
          },
          {
            q: 'Their second answer matches the first: "Honestly, it\'s just convenient."',
            options: [
              { text: 'Believe them and move on', points: 1, why: 'Some people lead with the truth. A third push turns curiosity into cross-examination.' },
              { text: 'Ask: "But why, really?"', points: 0, why: 'It implies they lied the first time.' },
              { text: 'Plant a wrong guess to dig further', points: 0, why: 'With most people, it reads as not listening.' },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Start with silence', text: 'Practise ECHO and the second question first. Most of the best moves here were to say less.' },
          { min: 3, title: 'Getting there', text: 'You know the moves. Now practise when to leave them out.' },
          { min: 5, title: 'Street-ready', text: 'Still pick one technique for your next shoot. Habits beat knowing.' },
        ],
      },
    },

    'On the morning of a shoot, run through this list. It remembers your ticks in this browser.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'interview-day-checklist',
      props: {
        title: 'Interview-day checklist',
        items: [
          { id: 'tested-line', text: 'The line you pressure-tested, rewritten if it needed it' },
          { id: 'catalysts', text: 'One catalyst question per video, with its second question underneath' },
          { id: 'wrong-guess', text: 'A mild wrong guess ready for DROP, about a habit' },
          { id: 'fault-card', text: 'The FAULT line opener on a card', detail: '"Was there a moment you almost didn\'t buy it?"' },
          { id: 'releases', text: 'Release forms for everyone you feature, and a first sentence that says who you film for' },
          { id: 'minors', text: `No one under 18 on camera without a parent's written consent` },
          { id: 'no-nodding', text: 'A crew rule: no nodding during answers' },
          { id: 'keep-rolling', text: 'A camera rule: keep rolling through every silence' },
          { id: 'one-technique', text: `The one technique you're practising today, at the top of the card` },
          { id: 'exact-words', text: 'A notes page for exact words, not summaries' },
        ],
        done: 'Packed. Now go and listen.',
      },
    },

    { type: 'h2', id: 'questions-for-a-crew', text: 'What should you ask a vox pop crew before you hire one?', toc: 'Questions to ask any crew' },

    `Ask how they get past the first answer. A crew that only talks about cameras and locations will bring back polite answers in sharp focus. A better camera won't save a weak question.`,

    'These questions work with any crew, us included. Listen for the reasoning as much as the answer.',

    {
      type: 'list',
      items: [
        '**"What do you do before the camera comes out?"** Listen for the brief and a way of testing the message.',
        '**"What happens in the first minute with a stranger?"** Listen for permission, and for saying who they film for.',
        '**"What do you do when the first answer is polite?"** Listen for a follow-up method, not "we fix it in the edit".',
        '**"Do you fill silences?"** You want some version of no.',
        `**"Will you ever put words in someone's mouth?"** Listen for never, plus a rule about how guesses are edited.`,
        '**"What happens if someone gets uncomfortable?"** Listen for letting them stop, and asking before a clip is used.',
        '**"How many usable moments do you expect from one interview?"** Listen for a range and a reason, not a promise.',
      ],
    },

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. On our shoots the interviewer can follow an interesting answer and go deeper, because we’d rather follow a good moment than force a script.',

    'We control the question, the setup, who we approach, the follow-up and the edit. We can’t control exactly how a stranger will respond in the moment. [How we work](/how-we-work) sets out how we plan around that.',

    `One thing to do this week: take the line your team is proudest of and say it to three strangers. Write down what they think it means. If you'd rather see a street interview on your own product first, [request a trial video](/contact). Scope, the number of trial videos and any fee are confirmed in writing.`,
  ],

  faqs: [
    {
      q: 'How do you get people to open up on camera in a street interview?',
      a: 'Make them feel safe before you make them feel filmed. Spend a minute talking like a person, say who you are filming for, and frame the topic without hinting at an answer. Then ask about a moment rather than an opinion, and stop nodding while they talk. People who feel tested give safe answers. People who feel heard keep going.',
    },
    {
      q: 'What is a good follow-up question in a street interview?',
      a: 'A good follow-up builds on the person’s own words instead of starting a new topic. "Interesting, why though?" works once they have committed to an answer. "When did that start?" turns an opinion into a memory. Repeating their key two or three words, then waiting, often beats any question. Write two follow-ups under every main question before the shoot.',
    },
    {
      q: 'What is the ECHO technique in an interview?',
      a: 'The ECHO technique means repeating the key two or three words of an answer back to the person, then staying silent. Former FBI hostage negotiator Chris Voss popularised the same move as mirroring[^mirroring]. In a street interview, the silence often prompts a longer, more specific answer than a new question would. Echo the phrase with energy in it, once per answer.',
    },
    {
      q: 'What is the second question rule?',
      a: 'The second question rule says never stop at the first answer in a street interview. The first answer is usually the socially safe one. After someone has committed to a position, ask "Interesting, why though?" and wait. The second answer tends to carry the real reason. If it matches the first, believe it and move on instead of pushing a third time.',
    },
    {
      q: 'How long should a street interview last?',
      a: 'It depends on the technique and the person’s time. A quick either-or question at a busy signal can take under a minute. An opening, one question and a couple of follow-ups need a few minutes. A layered conversation like the STACK protocol needs about ten. The finished vox pop is cut much shorter.',
    },
    {
      q: 'Should you tell people which brand you are filming for?',
      a: 'Yes. Say it in your first sentence, before the camera rolls, and say where the video will appear. Consent means little if people don’t know what it’s for, and naming the brand isn’t the same as pitching it. If anyone on camera is paid, works for the brand or was cast, [India’s endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect that to be disclosed[^endorsement-guidelines].',
    },
    {
      q: 'What should you do if someone gets uncomfortable during a street interview?',
      a: 'Stop pushing. Thank them, let them go, and ask before you use anything they said. Get a signed release from everyone you feature and tell them where the video will appear. India’s data protection rules are [coming into force in phases through 2027](https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html), so check your release forms with a lawyer[^dpdp-rules]. This is general information, not legal advice.',
    },
    {
      q: 'How do you test ad copy on strangers before filming?',
      a: 'Run a pressure test. Read your headline or hook once, word for word, to a stranger who has a minute. Watch their face for two seconds, then ask "What did you think it meant?" and write down their exact words. Online, Instagram’s Trial Reels can show a cut to non-followers first[^trial-reels], a similar check for a hook.',
    },
    {
      q: 'Is it fair to plant a wrong assumption in an interview?',
      a: 'Yes, if it stays playful and the person stays in charge. A mild wrong guess about a habit, such as "So you buy it for the taste?", invites a correction, and the correction is entirely theirs. It becomes unfair when the guess insults someone, when you argue them into agreeing, or when the edit makes them seem to agree with something they corrected.',
    },
  ],

  sources: [
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert with poll data, but shifted personal opinion more. CLAIMS.md R11.',
    },
    {
      id: 'impro-glossary',
      title: 'Improv glossary',
      url: 'https://www.hooplaimpro.com/?p=1866',
      publisher: 'Hoopla Impro',
      note: 'Offers and blocking as improv terms, from Keith Johnstone, Impro (1979). CLAIMS.md R15.',
    },
    {
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research (Brosius and Bathelt)',
      date: '1994',
      note: 'Individual cases sway judgments more than base-rate statistics. CLAIMS.md E06.',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'Objective claims "should be capable of substantiation"; street answers are not proof that a product works. CLAIMS.md 5.8.',
    },
    {
      id: 'mirroring',
      title: 'Never Split the Difference (summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Chris Voss and Tahl Raz (2016): mirroring, repeating the last few words to keep someone talking. CLAIMS.md P08 (corrected).',
    },
    {
      id: 'yt-stayed-to-watch',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'Shorts analytics: "Stayed to watch", the share of views that continued past the first seconds. CLAIMS.md P01.',
    },
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications (Ghibellini and Meier)',
      date: '2025',
      note: 'No memory advantage for unfinished tasks, only a tendency to resume them. Zeigarnik worked in Berlin, not Vienna. CLAIMS.md R01 (corrected).',
    },
    {
      id: 'endorsement-guidelines',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose any material connection with labels such as advertisement, sponsored or paid promotion. CLAIMS.md E26.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI, via The Week',
      date: '2025-11-14',
      note: 'DPDP Rules notified November 2025; consent and notice duties phase in about 18 months later. CLAIMS.md P07.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'Trial Reels show a Reel to non-followers first. CLAIMS.md E23.',
    },
  ],

  related: ['how-a-vox-pop-shoot-works', 'improv-for-street-interviews', 'vox-pop-questions', 'vox-pop-market-research'],
};

export default post;
