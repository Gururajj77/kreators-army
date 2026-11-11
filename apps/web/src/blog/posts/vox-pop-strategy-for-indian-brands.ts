import type { Post } from '../types';
import meta from './vox-pop-strategy-for-indian-brands.meta';

// Vox pop strategy for Indian brands: the Plan cluster's hub. Claims follow .work/v2/blog/CLAIMS.md; city archetypes are hypotheses, never facts.
// Inbound anchors (keep these ids): #gravel, #phase-1-question-design, #phase-3-hook-reaction-payoff, #phase-5-read-the-curve (vox-pop-glossary).

const post: Post = {
  meta,
  answer: "A vox pop strategy is a five-phase loop where each street interview writes the brief for the next. Write a question viewers see themselves in. Shoot it with a warm-up and follow-ups. Edit it as hook, reaction and payoff, then post per platform. Read where viewers leave and what they comment. Kreators.Army's advice: bring the brand in last.",
  takeaways: [
    "The question is the product. Ask about the brand and you get a polite answer. Ask about the viewer's life and you get recognition.",
    'Aspiration, taboo and contrast questions get people talking about themselves. Match the type to the person you want to reach.',
    'On the street: warm people up, film more people than you need, and stop nodding. Repeat their last few words, then wait.',
    'Edit in three beats: hook, reaction, payoff. Clashing answers hold the middle, and the brand comes last.',
    'Read the retention curve before the view count. The point where viewers leave tells you which phase to fix.',
    "Log every shoot in an intelligence library. Over months it shows which questions make your customers stop, and a competitor can't easily copy that.",
  ],

  body: [
    "You've seen the brand vox pop that goes nowhere. A host stops five people on a busy footpath and asks what they think of the new packaging. All five say it looks nice.",

    'Everyone is polite, and nobody forwards it.',

    'That video was lost at the planning table, before anyone picked up a mic. Its question asked strangers to praise a product, so they did. Viewers found nothing of themselves in the answers, and kept scrolling.',

    "This playbook runs vox pop as a loop in five phases: question design, field production, the edit, distribution and analytics. Each phase feeds the next, and the last one writes your next question. It's written for Indian brands, with host scripts to copy, a question builder, a drop-off diagnoser and a plan for your first month.",

    {
      type: 'steps',
      id: 'vox-pop-loop',
      title: 'The vox pop loop at a glance',
      intro: 'One full turn of the loop takes about a month the first time. Each step links to its phase below.',
      howTo: true,
      totalTime: 'P30D',
      supplies: ['A phone or camera', 'A clip-on mic', 'Signed release forms'],
      steps: [
        {
          name: 'Design the question',
          text: "Write one aspiration, taboo or contrast question about the viewer's life, plus a warm-up and a stakes question. See [Phase 1](#phase-1-question-design).",
        },
        {
          name: 'Shoot it fast',
          text: 'Warm people up, film more of them than you need, keep three shots and echo instead of nodding. See [Phase 2](#phase-2-field-production).',
        },
        {
          name: 'Edit hook, reaction, payoff',
          text: 'Open on the most charged moment, cut clashing answers together and bring the brand in last. See [Phase 3](#phase-3-hook-reaction-payoff).',
        },
        {
          name: 'Post per platform',
          text: 'Open each platform with a different answer, and test hooks before you spend. See [Phase 4](#phase-4-distribution).',
        },
        {
          name: 'Read the curve, then write the next question',
          text: 'Find where viewers left, read the comments for specificity and log it all in your library. See [Phase 5](#phase-5-read-the-curve).',
        },
      ],
    },

    { type: 'h2', id: 'why-brand-vox-pops-fall-flat', text: 'Why do brand vox pops fall flat?', toc: 'Why vox pops fall flat' },

    'When a brand vox pop falls flat, the question is usually to blame: it asks for praise. A polished question gets a polished answer, and a polished answer gives viewers nothing to recognise.',

    'A [vox pop](/blog/what-is-vox-pop-content) is a short street interview: one question, real people, unscripted answers, cut into a video for short-form feeds. In our view, the trouble starts when a brand treats it as a machine for collecting compliments. These are the questions that tend to get asked:',

    {
      type: 'list',
      items: [
        '"What do you think of our packaging?"',
        '"Would you recommend us to a friend?"',
        '"Have you heard of this brand?"',
        '"What\'s your favourite thing about the product?"',
      ],
    },

    "Every one of them is about the brand, and every one has a safe answer. A stranger on camera reaches for the safe answer first, because it's the quickest way to be done.",

    "Follow the chain. A product question gets a polite answer. A polite answer gets a swipe. Enough swipes and the team decides vox pop doesn't work, then books the next shoot with a better camera and the same kind of question.",

    'The camera was never the problem. The question was.',

    { type: 'h2', id: 'social-proof-vs-social-mirror', text: 'Social proof or social mirror: what is your vox pop for?', toc: 'Social proof vs social mirror' },

    'Social proof says "look how many people like us". A social mirror says "look, that person is just like you". Both put real people on screen, but only the mirror puts the viewer at the centre of the video.',

    "Say you sell a budgeting app. Social proof asks five people whether they'd recommend it. A mirror asks five people what they spent their first salary on, and lets every viewer remember their own.",

    {
      type: 'comparison',
      title: 'Two ways to use the same street',
      left: {
        label: 'Social proof',
        items: ['Says "lots of people like us"', 'Asks about the brand', 'Collects agreement and politeness', "The viewer watches someone else's opinion"],
      },
      right: {
        label: 'Social mirror',
        items: ['Says "that person is like you"', "Asks about the person's life", 'Collects stories, doubts and arguments', 'The viewer checks where they stand'],
      },
      verdict: 'Start with the mirror. The proof can come later, from the comments.',
    },

    "There's research behind the instinct. In [a 2022 experiment with TV news items](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html), viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-pop-vs-expert].",

    'Media researchers call the wider pattern exemplification: one vivid person on screen tends to sway judgments more than a percentage does[^exemplification].',

    "A viewer may not treat a stranger's answer as fact, but they still measure themselves against it.",

    "It matters in India too. In [PwC's 2024 survey of Indian shoppers](https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html), 77% said they discover new brands on social media and 81% check reviews there, yet social media was their least-trusted channel[^pwc-india-2024]. Polished claims get discounted. A stranger who talks like your cousin doesn't.",

    { type: 'h2', id: 'three-forces', text: 'What are the three forces inside a vox pop?', toc: 'The three forces' },

    'Three forces do the work: social validation ("that person is like me"), identity signalling ("that answer is mine") and the curiosity-comparison loop ("where do I stand?"). The research behind each is in [our guide to vox pop psychology](/blog/psychology-of-vox-pop).',

    {
      type: 'table',
      caption: 'The three forces, and what you control for each',
      head: ['Force', 'What the viewer thinks', 'What you control'],
      rows: [
        ['Social validation', '"That person is like me."', 'Who you approach, where and when'],
        ['Identity signalling', '"That answer is exactly how I feel."', 'Which answers you keep, and in what order'],
        ['Curiosity-comparison loop', '"Is that more than me? Am I behind?"', 'Questions that invite a comparison'],
      ],
      rowHeaders: true,
    },

    'Social validation starts with casting. A viewer who sees someone of their age, city or mood feels seen before a word is said, and feeling seen comes before trusting a brand. So the mix of faces is a business decision as much as a fair one.',

    'Even TV news gets this wrong. [A study of 2,000 Belgian TV vox pops](https://doi.org/10.1080/17512786.2016.1223551) found they rarely reflected minorities, and journalists almost never told viewers that the people shown might not represent everyone[^tv-vox-pop-diversity]. Cast widely on purpose: different ages, languages, neighbourhoods and moods.',

    "Identity signalling runs quietly in the viewer's head. They aren't checking whether an answer is true. They're asking \"is that me?\", and once the answer is yes, the product becomes secondary. That moment is built as much in the edit as on the street.",

    'The curiosity-comparison loop lives inside taboo questions. Ask what someone earns, or whether they regret a career, and every viewer starts running their own numbers. They keep watching to find out where they stand.',

    {
      type: 'callout',
      tone: 'note',
      title: 'A note on open loops',
      text: "Treat the loop as editing craft rather than a law of the brain. The idea goes back to Bluma Zeigarnik's 1927 study in Berlin, but [a 2025 meta-analysis](https://doi.org/10.1057/s41599-025-05000-w) found no memory advantage for unfinished tasks, only a tendency to go back and finish them[^zeigarnik-meta].",
    },

    "You can't force recognition. You can set up the conditions for it, and that starts with the question.",

    { type: 'h2', id: 'phase-1-question-design', text: 'Phase 1: Question design' },

    'The question is the product. Camera, location and edit only carry what it starts. Three types tend to get people talking about themselves: aspiration, taboo (handled with care) and contrast. Match the type to the person you want to reach.',

    'Spend the most time here, because every later phase polishes whatever this one produces. For a long list to start from, see [120 vox pop questions, sorted by category](/blog/vox-pop-questions).',

    { type: 'h3', id: 'the-aspiration-question', text: 'The aspiration question' },

    'An aspiration question asks who someone would be without their limits. "What would you do differently if money stopped being a problem?" doesn\'t ask what people have. It asks about the version of themselves they\'d like to be, and most people enjoy describing that person.',

    "Picture someone scrolling at 2 am after a long day. A stranger on screen describes the café they'd open if the EMIs disappeared.",

    "That's a version of themselves the viewer hasn't said out loud yet, and it's why they stop.",

    'Local detail makes it land. Swap "money" for "EMIs", "your notice period" or "what the family will say". Keep it about a life. The product can wait.',

    {
      type: 'video',
      brand: 'YourPlug',
      title: '2 Extra Hours',
      caption: 'From our library: YourPlug, "2 Extra Hours". The title is an aspiration prompt: what would someone do with two extra hours?',
    },

    'Where it breaks: the answers come back generic, and "travel the world" is the usual one. Follow up with something concrete, like "Where first?" or "What would the first Monday look like?" Keep the tone curious, never smug.',

    { type: 'h3', id: 'the-taboo-question', text: 'The taboo question, handled with care' },

    'A taboo question touches something people rarely say out loud. Salary is the classic: "How does your pay feel compared to where you thought you\'d be by now?" The comparison loop starts the moment that caption appears.',

    "We think money questions land in India partly because people so rarely hear anyone else answer them honestly. That's also why they need the most care.",

    'Taboo should mean unspoken, never humiliating.',

    {
      type: 'list',
      items: [
        '**Ask about feelings, not figures.** "Does it feel like enough?" works without anyone naming a number.',
        '**Offer an easy exit.** Say "you can skip this one" before you ask, and mean it.',
        '**Never mock an answer,** on the footpath or in the edit.',
        '**Cut on request.** Anyone who regrets a line before you publish gets it removed.',
        "**Keep some topics off the list.** Caste, religion, health conditions and anyone's body put the person at risk once the clip travels.",
        "**No one under 18** goes on camera without a parent's written consent.",
      ],
    },

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Money Habit',
      caption: 'A money question from our library, "Money Habit". Asking about a habit is a gentler way into money than asking about a salary.',
    },

    { type: 'h3', id: 'the-contrast-question', text: 'The contrast question' },

    'A contrast question turns the person answering, and the person watching, into insiders. "What do most people get wrong when they buy a second-hand phone?" invites someone to show they know better than the crowd.',

    'Viewers keep watching to check whether they know better too.',

    'It works in any category with a common mistake: a first sofa, a home workout, a first salary budget. Keep it about habits and choices. A street answer proves nothing about whether a product works, so never let one stand in for a health or efficacy claim.',

    { type: 'h3', id: 'archetype-city-question-grid', text: 'Match the question to the person: archetype × city × question type' },

    'An archetype is a rough sketch of a type of person: the Hustler always building something, the Explorer chasing what\'s new, the Lover who puts people first. Pick one, add a city and a question type, then write the question where they meet.',

    {
      type: 'table',
      caption: 'Three starting hypotheses from the grid',
      head: ['Archetype (a guess)', 'Where to test it', 'Question type', 'Example question'],
      rows: [
        ['Hustler', 'Mumbai, near a co-working space', 'Contrast', '"What do other founders get wrong about growing fast?"'],
        ['Explorer', 'Bengaluru, outside a tech park', 'Aspiration', '"If you started from scratch today, what would you build?"'],
        ['Lover', 'Delhi, at a weekend market', 'Taboo, with care', '"What does real loyalty look like to you?"'],
      ],
      rowHeaders: true,
    },

    "Read those rows as starting guesses about who walks past, never as facts about a city. Plenty of people in Mumbai aren't hustling, and plenty in Delhi would rather talk money than loyalty. The street confirms each cell or corrects it, and you write down which.",

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'question-builder',
      props: {
        title: 'Build questions from the grid',
        intro: 'Type an archetype to test, a city, a topic your product touches and the product itself. Copy the questions you like.',
        fields: [
          { id: 'archetype', label: 'Archetype to test', placeholder: 'e.g. Explorer, Hustler, Lover', example: 'Explorer' },
          { id: 'city', label: 'City', placeholder: 'e.g. Bengaluru', example: 'Bengaluru' },
          { id: 'topic', label: 'A part of life your product touches', placeholder: 'e.g. money, sleep, cooking', example: 'money' },
          { id: 'product', label: 'Your product', placeholder: 'e.g. a pressure cooker', example: 'a pressure cooker' },
        ],
        templates: [
          { text: 'Our guess: {archetype} types in {city} open up at a contrast question about {topic}. The street will tell us.', group: 'Your hypothesis' },
          { text: 'Which part of {city} are you from, and what brings you out today?', group: 'Warm-up' },
          { text: 'If {topic} stopped being a worry tomorrow, what would you start first?', group: 'Aspiration', mechanism: 'Personal experiences' },
          { text: 'If you started over in {city} today, what would you build?', group: 'Aspiration', mechanism: 'Personal experiences' },
          {
            text: 'Honestly, how does your {topic} situation compare with where you thought you would be by now? You can skip this one.',
            group: 'Taboo, with care',
          },
          { text: "What's one thing about {topic} you would only tell a close friend?", group: 'Taboo, with care', mechanism: 'Unexpected questions' },
          { text: 'What do most people in {city} get wrong about {topic}?', group: 'Contrast', mechanism: 'Debates and opposing opinions' },
          { text: 'What did you believe about {product} before you tried one?', group: 'Contrast', mechanism: 'Personal experiences' },
          { text: 'What would you lose if you had to give up {product} tomorrow?', group: 'Stakes' },
        ],
        note: 'Every question still needs a written follow-up. Read each one aloud: if it takes two breaths, cut it down.',
      },
    },

    { type: 'h3', id: 'gravel', text: 'GRAVEL: from small talk to the stakes question' },

    'The right question still needs a route to the best answer. One route is [GRAVEL](/blog/vox-pop-glossary#gravel), shown in the card below.',

    {
      type: 'framework',
      id: 'gravel-framework',
      name: 'GRAVEL',
      tagline: 'Six beats from small talk to the answer that matters.',
      parts: [
        { key: 'G', name: 'Ground', text: 'Start with a memory before anything heavy. "Where did you grow up?" costs nothing to answer.' },
        { key: 'R', name: 'Raise', text: 'Raise the temperature with soft follow-ups. "What did you miss most?" moves from facts to feelings.' },
        { key: 'A', name: 'Ask', text: "Ask the real question only once they're comfortable. Asked cold, the same words get a guarded answer." },
        {
          key: 'V',
          name: 'Validate',
          text: "Accept whatever they say in a word or two, once they've finished. Don't judge or correct, and don't nod mid-answer.",
        },
        { key: 'E', name: 'Escalate', text: 'Go one level deeper with a stakes question: "What would you lose if this stopped existing?"' },
        { key: 'L', name: 'Leave', text: "Leave the last answer alone. Don't nod, don't speak. Let the silence sit, and keep the camera rolling." },
      ],
    },

    {
      type: 'script',
      id: 'gravel-host-card',
      title: 'GRAVEL on the footpath: a host card',
      context: 'An illustration for a home-goods brand. Host lines only: what people say back is theirs.',
      lines: [
        { direction: 'Ground: open on a memory.' },
        { speaker: 'Host', text: 'Where was the first place you lived away from home? Hostel, PG, a shared flat?' },
        { direction: 'Raise: one soft follow-up.' },
        { speaker: 'Host', text: 'What did that first room look like?' },
        { direction: 'Ask: the real question.' },
        { speaker: 'Host', text: 'Does the place you live in now actually feel like home?' },
        { direction: 'Validate: once they finish, a word or two.' },
        { speaker: 'Host', text: 'That makes sense.' },
        { direction: 'Escalate: the stakes question.' },
        { speaker: 'Host', text: 'If you had to leave it tomorrow, what would you lose?' },
        { direction: 'Leave: say nothing. Hold the shot until they finish the thought.' },
      ],
    },

    'The stakes question is where opinions turn into meaning. By then you\'re past "I like it" and into what someone would miss. If someone is in a rush, skip straight to the real question and save the stakes question for people who stay.',

    { type: 'h2', id: 'phase-2-field-production', text: 'Phase 2: Field production' },

    'Field production rewards speed and calm more than kit. Warm people up, film more of them than you need, keep three simple shots and stop nodding. The best answers come from how the host behaves.',

    { type: 'h3', id: 'speed-over-perfection', text: 'Speed over perfection' },

    'This is where brand teams often stall. The plan grows a lighting rig, a big camera and a shot list with seventeen angles, and the shoot keeps slipping. Meanwhile the question sits untested.',

    'To learn the format, a phone and a clip-on mic are enough. In our view, clean audio and steady framing matter more than a cinema look. A big rig also changes people: someone who spots a professional camera often turns into a stiffer, more careful version of themselves.',

    'Whatever you film on, keep it light enough that people still talk like themselves. Then spend the planning time where it pays off: the spot and the paperwork.',

    'Pick the spot for the people who pass it. A college gate after classes, a weekend market and the footpath outside a co-working space give you three different audiences in one city. Then listen before you set up. Traffic horns are the usual enemy, so stand where the mic can win: a side lane, a shopfront, shade at noon.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'Before you film anyone',
      text: 'Five checks for Indian streets. This is general information, not legal advice.',
      items: [
        "Metro premises aren't open for casual filming. Bengaluru's Namma Metro [needs prior permission and charges a fee for shoots](https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises)[^bmrcl]. Malls are private property, so ask management first.",
        "Get a signed release from everyone you feature, and tell them where the video will appear. India's data protection rules [come into force in phases through 2027](https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html)[^dpdp-rules], so check your release with a lawyer.",
        "Film no one under 18 without a parent's written consent.",
        "If anyone on camera is paid, works for you or was cast, [India's endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect you to disclose it[^endorsement]. Never present a staged answer as spontaneous.",
        'The full picture is in [our guide to filming consent in India](/blog/street-interview-consent-india).',
      ],
    },

    { type: 'h3', id: 'the-warm-up-question', text: 'The warm-up question' },

    'Before the real question, ask something that costs nothing. People hear their own voice on camera before anything is at stake, and their shoulders drop. The answer after a warm-up is usually looser and more honest than one asked cold.',

    {
      type: 'list',
      items: [
        '"Chai or coffee, and where\'s the best one around here?"',
        '"Which part of the city are you from?"',
        '"Work, college, or just out?"',
        '"How long have you lived in this city?"',
      ],
    },

    'People short on time are the exception. Skip the warm-up and ask a quick either-or question they can answer while walking.',

    'On mixed-language streets, keep the warm-up plain and let people answer in whatever language they like. The one they pick tells you how to ask the real question.',

    { type: 'h3', id: 'minimum-viable-shoot', text: 'The minimum viable shoot' },

    "Plan to film more people than you'll use. A workable starting estimate is about fifteen people in a session to find five to seven answers worth keeping.",

    "Some people freeze. Some give a safe, practised answer. Some don't have the energy for that question on that day.",

    "That's normal. Budget for it, and no session feels wasted.",

    'Treat the number as a planning estimate rather than a target: the spot, the hour, the weather and the question all move it. A small thank-you helps people stop and give you a few minutes, as long as it never decides what they say.',

    { type: 'h3', id: 'three-shots', text: 'Three shots are enough' },

    'Keep the shot structure plain. Three angles cover a street interview:',

    {
      type: 'list',
      ordered: true,
      items: [
        "**Wide:** shows it's a real place, with real people walking past.",
        '**Medium:** the main angle for the conversation.',
        "**Tight:** on the reaction. That's where the feeling lives, and where the edit will cut most often.",
      ],
    },

    "Frame for vertical from the first take, face in the upper half so captions don't cover it. Anything more elaborate usually just delays the shoot.",

    { type: 'h3', id: 'echo-technique', text: 'Stop nodding: the ECHO technique' },

    "The quietest habit that ruins answers is nodding. When a host nods mid-answer, the person reads it as approval and feels they've said enough.",

    'A great answer gets cut short by a head movement.',

    'So stop nodding. When they finish, repeat their last two or three words back to them, and wait. We call it the ECHO technique. Former FBI hostage negotiator Chris Voss calls the same move [mirroring](https://www.mindtools.com/arg0sjv/never-split-the-difference)[^voss-mirroring], and on the street it often draws out a second, more honest answer.',

    'These are illustrations, not real interviews. Tap each one to see what can come after the silence.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'echo-reveal',
      props: {
        title: 'The first answer, and the one after the echo',
        firstLabel: 'First answer',
        secondLabel: 'After the echo',
        items: [
          {
            question: 'Do you still use the app?',
            first: '"Not really. I just stopped trusting it."',
            second: 'Host: "Stopped trusting it." A pause. "It kept showing me things I had already bought. It felt like nobody was listening."',
            note: 'The echo was three words. The reason came after the silence.',
          },
          {
            question: 'How was your first year in a new city?',
            first: '"Fine. Busy."',
            second: 'Host: "Fine. Busy." A pause. "Honestly, I ate dinner alone most nights. Work was the easy part."',
          },
          {
            question: 'Why did you stop ordering in?',
            first: '"Too expensive."',
            second: 'Host: "Too expensive." A pause. "It was never the money, really. I felt guilty every time I did it."',
            note: 'The first answer named a price. The second named a feeling, and the feeling is the clip.',
          },
        ],
      },
    },

    'Overused, the echo sounds like a parrot. Once or twice per person is plenty.',

    { type: 'h2', id: 'phase-3-hook-reaction-payoff', text: 'Phase 3: Hook, reaction, payoff' },

    'Edit every vox pop in three beats. The hook drops viewers into the most charged moment, and the reaction cuts clashing answers side by side. The payoff closes on a surprise or, once viewers feel understood, on the brand.',

    'The edit is where recognition gets built. Every cut decides who the viewer compares themselves with, and every caption gives them a reason to stay. Our own edit priorities run from strong opening moments to clean endings.',

    {
      type: 'steps',
      id: 'hook-reaction-payoff',
      title: 'Hook, reaction, payoff in five steps',
      steps: [
        {
          name: 'Find the hook',
          text: 'Listen back to every answer and pick the most emotionally charged moment, which is rarely the most articulate one. Open on it, mid-sentence if you have to.',
        },
        {
          name: 'Build the reaction',
          text: 'Cut two or three answers that clash, back to back. Put someone who has it figured out beside someone still searching. The contrast is the content.',
        },
        {
          name: 'Choose the payoff',
          text: 'Close on the answer that reframes the question, or on the brand moment. The brand works only once the viewer already feels understood.',
        },
        {
          name: 'Write captions that tease',
          text: 'Make on-screen text point at what\'s coming instead of describing what\'s on screen. "Wait for the last answer" gives people a reason to keep watching.',
        },
        { name: 'Set the pace', text: 'Jump-cut on reaction peaks to keep the energy up. Slow down on the emotional lines so they have room to land.' },
      ],
    },

    'Step two is the one that gets skipped.',

    'The usual cut lines up five people who agree. TV news often does the same: a study of the same 2,000 Belgian vox pops found most items showed only one point of view[^one-sided-vox-pops].',

    'Agreement gives the viewer nothing to place themselves against.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Money Required To Live',
      caption: 'A comparison loop in a title, "Money Required To Live": a question whose answers invite every viewer to check their own number.',
    },

    {
      type: 'script',
      id: 'thirty-second-beat-sheet',
      title: 'A 30-second cut, beat by beat',
      context: 'A planning shape for the edit brief. Cut to the story, never to the clock.',
      lines: [
        { direction: '0:00 to 0:03. Hook: open mid-answer on the most charged line. On screen, the question in a few words.' },
        { direction: '0:03 to 0:15. Reaction: two or three short answers that clash, cut on their peaks.' },
        { direction: '0:15 to 0:24. Payoff: the answer that reframes the question. Let it breathe.' },
        { direction: "0:24 to 0:30. Door: the product in someone's hands, and one clear next step." },
      ],
    },

    {
      type: 'callout',
      tone: 'warning',
      title: "Never make anyone say what they didn't",
      text: "Trim pauses and false starts, but don't splice half of one sentence onto half of another, and never pair an answer with a question the person wasn't asked. Subtitle a Hindi or Kannada line by what it meant, not by a punchier version. Viewers forgive a slow answer. A participant won't forgive words they never said.",
    },

    'The payoff is where a brand can undo all of it.',

    'If the brand turns up before the viewer has seen themselves, the video flips from "this gets me" to "this is an ad", and it rarely flips back. The full edit method is in [how to edit a vox pop](/blog/how-to-edit-vox-pop-videos).',

    { type: 'h2', id: 'phase-4-distribution', text: 'Phase 4: Where should each cut go?', toc: 'Phase 4: Distribution' },

    'Each platform has its own deal with viewers, so one interview should open differently on each. Lead Reels with the boldest answer, Shorts with the one that reframes the question, and LinkedIn with professional contrast.',

    "Instagram's head Adam Mosseri has said the three signals that matter most for ranking are [watch time, likes and sends](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/)[^mosseri-signals]. A street answer people want to send a friend fits that well. On YouTube, Shorts analytics show how often viewers [stayed to watch past the first seconds](https://support.google.com/youtube/answer/12220281)[^yt-stayed], so the first line has to earn what follows.",

    {
      type: 'table',
      caption: 'One interview, opened differently on each platform',
      head: ['Platform', 'Open with', 'Then'],
      rows: [
        ['Instagram Reels', 'The boldest or most taboo answer', 'One clash, then a quick payoff'],
        ['YouTube Shorts', 'The answer that reframes the question', 'Hold the resolution until the end'],
        ['LinkedIn', 'A professional contrast people in the trade will argue with', 'What your brand does about it'],
        ['WhatsApp', 'The clip someone would forward to a family group', 'Nothing that needs the caption to make sense'],
      ],
      rowHeaders: true,
    },

    'WhatsApp has [more than 500 million users in India](https://techcrunch.com/2024/12/31/india-lifts-whatsapp-payment-curbs/)[^whatsapp-india], so a forwarded clip travels through a channel your customers already use. Cut a version that makes sense with no post around it. For B2B, the LinkedIn detail is in [vox pop for B2B and SaaS](/blog/vox-pop-for-b2b-brands).',

    'One interview should never become one post.',

    'Cut several short videos from it, each built around a single answer, with a caption that hints at the next. Then turn the strongest contrast into a four-slide carousel. Here is a made-up example for the same home-goods brand as the host card:',

    {
      type: 'list',
      ordered: true,
      items: [
        '**The belief:** "A bigger flat would finally feel like home."',
        '**The crack:** three street answers about the small things that made a rented room feel like theirs.',
        '**The flip:** home is built from habits more than square feet.',
        '**The view:** what the brand stands for, in one line.',
      ],
    },

    {
      type: 'callout',
      tone: 'tip',
      title: 'Caption for the sound-off scroll',
      text: "Burn in captions, in English and, where it helps, the language people actually spoke. Some viewers will meet the clip with the sound off, and a caption in their own script widens who can follow it. The same cuts suit Facebook Reels and Snapchat Spotlight too.",
    },

    'Test before you spend.',

    "Instagram's [Trial Reels](https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/), open to public accounts with at least 1,000 followers, show a Reel to non-followers first[^trial-reels]. That's a cheap way to compare two hooks from the same interview. Put ad money only behind cuts that already earned attention on their own, and pick the cut with the best curve rather than the most views.",

    'Then reply to comments early, while people are still in the thread, and reply like a person rather than a brand account. For the platform-by-platform detail and a carousel builder, see [where to post vox pop videos](/blog/where-to-post-vox-pop-videos).',

    { type: 'h2', id: 'phase-5-read-the-curve', text: 'Phase 5: Read the curve, not the count' },

    'Views tell you a video was seen. The retention curve tells you where viewers stopped caring, and the comments tell you whether anyone saw themselves. Read both before you plan the next shoot.',

    "Teams often check numbers after a week, then either celebrate the views or blame the camera. Neither tells you which phase to fix. Open the video's retention graph, where your platform shows one, and find the steepest drop.",

    { type: 'h3', id: 'where-people-leave', text: 'Where people leave, and what it tells you' },

    'The point where the curve falls hardest maps straight onto the edit:',

    {
      type: 'list',
      items: [
        '**In the first few seconds:** the hook failed. The real hook is often buried mid-edit, so go back to the raw footage for a harder opening.',
        '**In the middle:** the reaction lacked contrast. Two similar answers give viewers nothing to compare themselves with.',
        '**Just before the payoff:** the brand arrived too early. Fix the order of the clips and leave the brand message alone.',
      ],
    },

    {
      type: 'callout',
      tone: 'tip',
      title: 'A worked example',
      text: 'Say a 40-second cut holds most viewers through the opening, sags gently through the middle, then drops sharply at 0:28, the second the logo appears. The hook worked and the contrast held. The fix is the order: move the brand moment after the strongest answer, then post the new cut as a trial to non-followers and compare the two curves.',
    },

    'Try it on your last video: four quick questions point to the fix to try first.',

    {
      type: 'widget',
      widget: 'picker',
      id: 'drop-off-diagnoser',
      props: {
        title: 'Drop-off diagnoser',
        intro: "Answer for one video you've already posted. The likeliest fix comes first, and every fix is listed below.",
        questions: [
          {
            q: 'Where does the retention curve fall hardest?',
            options: [
              { text: 'In the first few seconds', outcomes: ['hook'] },
              { text: 'Somewhere in the middle', outcomes: ['contrast'] },
              { text: 'Just before the ending', outcomes: ['brand-early'] },
              { text: 'It holds, but nobody reacts', outcomes: ['question'] },
            ],
          },
          {
            q: 'Do the answers in the middle agree with each other?',
            options: [
              { text: 'Mostly, yes', outcomes: ['contrast'] },
              { text: 'No, they clash', outcomes: ['keep'] },
              { text: "There's only one person", outcomes: ['contrast'] },
            ],
          },
          {
            q: 'When does the brand or product first appear?',
            options: [
              { text: 'In the first few seconds', outcomes: ['brand-early'] },
              { text: 'Somewhere in the middle', outcomes: ['brand-early'] },
              { text: 'Only at the end', outcomes: ['keep'] },
            ],
          },
          {
            q: 'What do the comments sound like?',
            options: [
              { text: 'There are almost none', outcomes: ['hook'] },
              { text: 'Polite, like "nice video"', outcomes: ['question'] },
              { text: 'Someone calls it an ad', outcomes: ['brand-early'] },
              { text: 'Friends tagged with "this is you"', outcomes: ['keep'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'hook',
            title: 'Fix the hook',
            text: "The opening didn't earn the next few seconds. Re-cut from the raw footage and open on the most charged moment, mid-answer if needed.",
            reasons: ['The real hook is often buried in the middle of the edit', 'Open on feeling, even over the most articulate answer'],
          },
          {
            id: 'contrast',
            title: 'Sharpen the contrast',
            text: 'The middle gave viewers nothing to compare. Cut two or three answers that clash, side by side.',
            reasons: ['Agreement reads like an ad', 'A clash makes viewers pick a side'],
          },
          {
            id: 'brand-early',
            title: 'Move the brand later',
            text: 'The door opened before the mirror was built. Change the order of the clips, and keep the brand message as it is.',
            reasons: ['Let the strongest answer land first', 'Then show where to go next'],
          },
          {
            id: 'question',
            title: 'Rewrite the question',
            text: 'People watched, but nobody saw themselves. That points to the question rather than the edit. Swap a product question for an aspiration, taboo or contrast question.',
          },
          {
            id: 'keep',
            title: 'Keep the question, change the mechanism',
            text: 'Recognition is happening. Keep the question shape, and try a new mechanism, city or archetype on the next shoot.',
          },
        ],
      },
    },

    { type: 'h3', id: 'read-comments-for-specificity', text: 'Read comments for specificity' },

    "A comment count tells you little. What people write tells you a lot. Take your top fifty public comments and sort them by the feeling behind them, by hand or with an AI tool. Keep participants' raw footage and personal details out of third-party tools unless they agreed.",

    'The comment you want sounds like "I thought I was the only one".',

    'That\'s a viewer reporting recognition in their own words. "Nice video" is politeness. A friend tagged with "this is you" is the mirror working in public. Sort the rest into three piles: recognition, argument and politeness. A strong video fills the first two, and a weak one fills the third.',

    { type: 'h3', id: 'a-flop-is-the-next-brief', text: 'Treat a flop as the next brief' },

    'When a video flops, go back to the question first. Find the second where viewers hesitated, and ask what question would have changed the temperature at that point.',

    'Then shoot that question.',

    'On the street, the same instinct becomes what we call the FAULT line: mine the hesitation, not the praise. "Was there a moment you almost didn\'t buy it?" gets you the doubt, then what changed. [Street interview techniques](/blog/street-interview-techniques) walks through it.',

    'Our own creative loop runs hypothesis, interaction, production, edit, learn, improve, and the last step points back to the first. A flop is a hypothesis that came back with an answer.',

    { type: 'h2', id: 'mirror-then-door', text: 'When should the brand appear in a vox pop?', toc: 'Mirror, then door' },

    'Last. A vox pop sells a perspective before it sells a product. First the content builds a mirror, so viewers see themselves. Only then does the call to action open a door: a link, a DM or a product page.',

    'An ad tells people what to think. A vox pop shows what real people already think and lets the viewer decide where they stand. We think a conclusion people reach themselves sticks better than one handed to them.',

    "Order matters more than wording. Rush the door and the trust you just built is gone. Here's the same footage cut both ways.",

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'door-before-mirror',
      props: {
        title: 'The same interview, cut two ways',
        before: {
          label: 'Door before mirror',
          text: 'The brand leads, and the people follow.',
          points: ['Opens on the logo and a product shot', 'The host asks "Have you tried our new range?"', 'Three people say it looks nice', 'Ends on "Shop now"'],
        },
        after: {
          label: 'Mirror, then door',
          text: 'The people lead, and the brand earns its place.',
          points: [
            'Opens mid-answer on the most honest line',
            'Two answers that clash, back to back',
            'The answer that reframes the question',
            'Then the product, and one clear next step',
          ],
        },
        note: 'Same footage, same people. Only the order changed.',
      },
    },

    'Keep the door small and single. It can be a pinned comment, a link in bio, a keyword to send on WhatsApp or in a DM, or a product page that opens on the same question. Pick one. Four doors read as a sales pitch.',

    'Where the door leads depends on the funnel stage. For the middle of the funnel, see [MoFu content with vox pops](/blog/vox-pop-mofu-content-strategy). For a plan across every stage, see [the vox pop stack](/blog/vox-pop-funnel).',

    { type: 'h2', id: 'intelligence-library', text: 'What is a vox pop intelligence library?', toc: 'The intelligence library' },

    'An intelligence library is a running record of what each question taught you: who answered and how viewers reacted. Over months it shows which questions make which people stop, and that pattern is hard for a competitor to copy.',

    "Every shoot adds to it. It's tempting to file shoots as content, in folders of clips.",

    'File them as research instead.',

    'Over time you learn which question makes a founder in Mumbai pause, which contrast stops a commuter in Delhi, and which topic a Bengaluru audience shares unprompted.',

    {
      type: 'table',
      caption: 'What to log after every shoot',
      head: ['Log this', 'Why it matters'],
      rows: [
        ['The exact question and its type', 'You compare question shapes, not just topics'],
        ['Who you hoped to reach, and who stopped', 'It tests your archetype guess against the street'],
        ['Place, day and time', 'The same question can fail at noon and work at 7 pm'],
        ['The languages people answered in', 'It shows how your customers really talk'],
        ['The best line, word for word', 'Customer phrasing is often sharper than copy you would write'],
        ['Where the curve fell', 'It points to the phase to fix'],
        ['The most specific comment', "Recognition, in the viewer's own words"],
        ['The next question it suggests', 'It keeps the loop moving'],
      ],
      rowHeaders: true,
    },

    'Give code-switching its own column. People often move between English, Hindi, Kannada or Tamil mid-answer, and that mix is part of how your customers talk. Your next ad line or product page can borrow it.',

    'Once a month, sort the library by question type and read across it. Patterns start to show: the shape that keeps holding viewers, the spot that never works, the phrase that turns up in three different neighbourhoods. Those patterns are your next brief. Share the top three with whoever writes your ads.',

    'For running the library as a research programme, see [vox pop market research](/blog/vox-pop-market-research). For ten ways D2C brands turn street interviews into an edge, see [street interview marketing playbooks](/blog/street-interview-marketing-playbooks).',

    { type: 'h2', id: 'who-runs-it', text: 'Who should run your vox pop strategy?', toc: 'Who runs it' },

    'Two people who own the loop can run it in-house: one for the field, one for the output. When you want volume and a dedicated host without building a team, a production crew can run the loop for you.',

    'The field lead owns the questions, the approach, the warm-ups, the follow-ups and the releases. The output lead owns the edit, the captions, the posting, the comments and the analytics, and keeps the library current.',

    "Beyond the kit, the field lead needs comfort with silence, real curiosity about strangers and the languages of the street they're on. We think a host who can move from English to Hindi or Kannada mid-question often gets a warmer answer than one who can't.",

    {
      type: 'comparison',
      title: 'An in-house pair or a crew',
      left: {
        label: 'Two people in-house',
        items: [
          'Low cash cost, high time cost',
          'You learn the format first-hand',
          "Output depends on two people's calendars",
          'Host skill builds slowly, shoot by shoot',
        ],
      },
      right: {
        label: 'A crew like ours',
        items: [
          'An interviewer, participant selection and on-ground direction',
          'Creative variety planned across a batch',
          'Editing for short-form, with captions',
          'You still set the objective and keep the learning',
        ],
      },
      verdict: 'A sensible path: learn the format in-house, then bring in a crew when you want more videos than two people can make.',
    },

    "Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. We plan the objective, the questions, who we approach, the interviewer and follow-ups, on-ground direction and the edit. What we can't control is exactly how a stranger will respond in the moment.",

    'Our packages run 5 videos for ₹50,000 (₹10,000 each), 10 for ₹85,000 (₹8,500 each) and 20 for ₹1,50,000 (₹7,500 each). Each package is for one brand, and GST is extra where applicable. [How we work](/how-we-work) shows each step, from the brief to delivery.',

    { type: 'cta', text: 'Want to see the format on your own product before you plan a whole loop?' },

    { type: 'h2', id: 'first-30-days', text: 'What should your first 30 days look like?', toc: 'Your first 30 days' },

    "Give the first month one job: learning. Write one question of each type, run one shoot, post before it's perfect and read what comes back. By day 30 you'll have a library entry, a next question and a clear fix.",

    'For a tiny team, [street interviews for small businesses](/blog/street-interviews-for-small-business) stretches this into a fuller system.',

    'Before week one, [what goes in a vox pop brief](/blog/what-goes-in-a-vox-pop-brief) helps you lock the plan on one page.',

    {
      type: 'widget',
      widget: 'timeline',
      id: 'first-month-plan',
      props: {
        title: 'A first month of vox pop',
        items: [
          {
            when: 'Week 1',
            title: 'Write and test',
            text: 'Pick one archetype to test, one spot and one topic. Write a warm-up, one question of each type and a stakes question.',
            tasks: ['Read each question aloud', "Try two on colleagues who haven't seen the brief", 'Check permissions for the spot'],
          },
          {
            when: 'Week 2',
            title: 'Shoot',
            text: 'One session at one spot. Plan for about fifteen people and an hour of asking, then adjust on the day.',
            tasks: ['Warm everyone up first', "Echo, don't nod", 'Wide, medium and tight', 'A signed release from everyone you keep'],
          },
          {
            when: 'Week 3',
            title: 'Edit and post',
            text: 'Cut hook, reaction, payoff. Open each platform differently, and post before it feels perfect.',
            tasks: ['Captions that tease the next answer', 'Reply to comments early'],
          },
          {
            when: 'Week 4',
            title: 'Read and rewrite',
            text: 'Read the curve at three points and the comments for specificity. Log it all, then write the next question.',
            tasks: ['One library entry per question', 'One clear fix for the next shoot'],
          },
          { when: 'Day 30', title: 'Decide', text: 'Keep the loop in-house, or bring in a crew for volume. Either way, the next question is already written.' },
        ],
      },
    },

    'After the first month, the five phases become a weekly routine. Tick them off as you go.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'five-phase-routine',
      props: {
        title: 'The five phases, every week',
        items: [
          { id: 'question', text: 'One question written and read aloud', detail: 'Aspiration, taboo or contrast, about the person rather than the product.' },
          { id: 'warm-up', text: 'Warm-up and stakes question ready' },
          { id: 'permissions', text: 'Spot checked and releases ready' },
          { id: 'people', text: 'More people filmed than you need' },
          { id: 'echo', text: 'Echoed instead of nodding' },
          { id: 'hook', text: 'The edit opens on the most charged moment' },
          { id: 'clash', text: 'The middle cuts answers that clash' },
          { id: 'door', text: 'The brand appears after the mirror' },
          { id: 'platforms', text: 'Each platform opens differently' },
          { id: 'curve', text: 'Curve read at three points' },
          { id: 'comments', text: 'Comments read for specificity' },
          { id: 'library', text: 'Library updated and the next question written' },
        ],
        done: 'Loop closed. The next question is already on the card.',
      },
    },

    { type: 'h2', id: 'what-it-cant-promise', text: "What a vox pop strategy can't promise", toc: "What it can't promise" },

    "A vox pop strategy can't promise views, sales or a reaction from any one person. It can make every shoot a better experiment than the last, and that's the honest case for it.",

    "We control the question, the setup, who we approach, the follow-ups and the edit. How a video performs also depends on the platform, the audience, the account's history, media spend, the offer and distribution. That's why [our FAQ on views and sales](/faq/do-you-guarantee-views) says no to promises, and why this playbook measures recognition before reach.",

    'What it can do is narrower and more useful: show you, shoot by shoot, which questions make your customers see themselves.',

    { type: 'divider' },

    "One thing to do this week: write one aspiration, taboo or contrast question about your customer's life.",

    "Read it to three colleagues. If one of them answers with a story instead of an opinion, it's ready for the street.",

    "If you'd rather see the format on your own brand before building the loop, [request a trial video](/contact). Scope, the number of trial videos and any fee are confirmed in writing.",
  ],

  faqs: [
    {
      q: 'What is a vox pop strategy?',
      a: "A vox pop strategy is a repeatable loop for street-interview content, run in five phases: question design, field production, the edit, distribution and analytics. Each video's retention curve and comments shape the next question, so every shoot sharpens the brief for the one after it.",
    },
    {
      q: 'How often should a brand post vox pops?',
      a: "Often enough to learn from. Posting regularly gives you more chances to see which questions hold attention, but a steady rhythm matters more than a high count. One shoot can give several cuts, so a small batch every few weeks can keep a feed going. Post at a pace that still lets you read each video's curve before the next shoot.",
    },
    {
      q: 'Which vox pop questions work best?',
      a: 'Questions about the person usually beat questions about the product. Three types tend to get people talking. Aspiration asks "what would you do if money stopped being a problem?" Taboo, handled with care, asks how pay feels against expectations. Contrast asks "what do most people get wrong about this?" Keep each one short enough to ask in one breath, and write its follow-up first.',
    },
    {
      q: 'Should brands ask taboo questions like salary?',
      a: "Yes, if the brand can handle them with care. Ask about feelings rather than figures, tell people they can skip the question, and never mock an answer on the street or in the edit. Cut any line someone regrets, get a signed release before publishing, and keep anyone under 18 off camera without a parent's written consent. Caste, religion and health conditions stay off the list entirely.",
    },
    {
      q: 'How many people should we film per shoot?',
      a: "Plan for more people than you'll use. A workable starting estimate is about fifteen people per session to find five to seven answers worth keeping. Some people freeze, some give practised answers and some aren't in the mood for that question. The real number depends on the spot, the time of day and the question, so adjust it after your first shoot.",
    },
    {
      q: 'How do you measure whether a vox pop worked?',
      a: 'Measure recognition before reach. Check the retention curve at three points: the first few seconds (the hook), the middle (the contrast) and just before the payoff (the brand\'s timing). Then read the comments for specificity: one "I thought I was the only one" tells you more than a hundred "nice video" replies. Views alone show a video was seen, nothing more.',
    },
    {
      q: 'Can a two-person team run vox pop in-house?',
      a: 'Yes. One person runs the field: questions, approaching people, warm-ups, follow-ups and releases. The other runs the output: editing, captions, posting, comments, analytics and the library. A phone and a clip-on mic are enough to learn the format. Time and host skill are the limits, so treat the first few shoots as lessons.',
    },
    {
      q: 'Should we use an agency or do it ourselves?',
      a: "It depends on what you need from the next few months. Do it yourselves to learn the format and your audience first-hand. Bring in a crew when you want volume, a dedicated interviewer and consistent editing without building a team. Kreators.Army's packages start at 5 videos for ₹50,000 plus GST where applicable, and [our price FAQ](/faq/how-much-does-it-cost) has the rest.",
    },
    {
      q: 'Do vox pops work for Indian audiences?',
      a: "They can, because they meet a specific trust gap, though no format can promise results. India ranks third on Edelman's 2025 trust index[^edelman-india], so Indians aren't low-trust people. What they discount is polished advertising: in PwC's 2024 survey, social media was Indian shoppers' least-trusted channel, even though most discover brands there[^pwc-india-2024]. A real answer, in the viewer's own mix of languages, sits right in that gap.",
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
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications (Brosius and Bathelt)',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research 21(1)',
      date: '1994',
      note: 'Individual cases sway judgments more than base-rate statistics (CLAIMS E06).',
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
      id: 'tv-vox-pop-diversity',
      title: 'How ordinary is the ordinary (wo)man on the street? An analysis of vox pop characteristics in television news (Beckers, Walgrave and Van den Bulck)',
      url: 'https://doi.org/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice 11(8)',
      date: '2017',
      note: '2,000 Flemish TV vox pops; minorities under-represented; journalists hardly ever flag it (CLAIMS E07).',
    },
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications 12',
      date: '2025',
      note: 'No memory advantage for unfinished tasks; a tendency to resume them (CLAIMS R01).',
    },
    {
      id: 'bmrcl',
      title: 'Bengaluru: After 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023-11-25',
      note: 'Shoots need an application in advance, a licence fee and a deposit (CLAIMS P06).',
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
      id: 'voss-mirroring',
      title: 'Never Split the Difference: summary',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Mirroring: repeat the last one to three words to keep someone talking (CLAIMS P08).',
    },
    {
      id: 'one-sided-vox-pops',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies',
      date: '2018',
      note: 'Same 2,000-interview sample: a large majority of vox pop items show one point of view (CLAIMS E08).',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram shares algorithm insights to inform strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'Adam Mosseri: watch time, likes and sends are the top ranking signals (CLAIMS P02).',
    },
    {
      id: 'yt-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'Shorts "stayed to watch": viewers who stayed past the initial seconds (CLAIMS P01).',
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
      id: 'trial-reels',
      title: 'Instagram Trial Reels are now available to more creators',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025-07-13',
      note: 'Trial Reels show a Reel to non-followers first; open to public accounts with 1,000+ followers (CLAIMS E23).',
    },
    {
      id: 'edelman-india',
      title: 'India slips to third place in Edelman Trust Barometer 2025 rankings',
      url: 'https://currentaffairs.adda247.com/india-slips-to-third-place-in-edelman-trust-barometer-2025-rankings/',
      publisher: 'Adda247 Current Affairs',
      date: '2025-01-22',
      note: 'India third worldwide on the 2025 Trust Index, behind China and Indonesia (CLAIMS S19).',
    },
  ],
  related: ['psychology-of-vox-pop', 'street-interview-marketing-playbooks', 'how-to-edit-vox-pop-videos', 'vox-pop-market-research'],
};

export default post;
