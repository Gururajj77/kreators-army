import type { Post } from '../types';
import meta from './how-a-vox-pop-shoot-works.meta';

// How a vox pop shoot works, step by step (PLAN.md post 2; full rewrite of the live post, same slug). Shoot cluster hub.
// Sources: founder PDF pp. 7-11, 72-73, 76-77, 80, 107-108, 125-126; facts only from CLAIMS.md (P01, P06, P07, P08, R11, R15, E08, E26).

const post: Post = {
  meta,

  answer: 'A vox pop shoot runs in six parts: setup, question, participant, follow-up, reaction and edit. Kreators.Army plans the question and the interaction, never the answers. On the day, the work is a quiet spot, far more approaches than you will use, an easy warm-up question and silence after the first answer. The second answer is usually the keeper.',

  takeaways: [
    'Lock the objective, products, audience and must-haves before anyone picks up a camera. A vague brief turns into a vague question on the street.',
    'Keep the kit small: a phone, a wireless clip-on mic with a windshield and a power bank will carry a first shoot.',
    "Approach far more people than you need. Plan the day with your own stop and keep rates, not someone else's benchmark.",
    'Open with an easy warm-up question, then make the person the expert. People who feel tested give safe answers.',
    'After the first answer, stop nodding. Repeat their last few words and wait. What fills the silence is usually more honest than what came before it.',
    'In India, plan for answers that switch languages, heat, crowds and permissions. Malls are private property, and metro premises need prior permission.',
  ],

  body: [
    'Picture the edge of a Sunday market in Bengaluru, late in the afternoon. A host with a clip-on mic asks a passer-by where they\'re headed. "Home, after this," they say, lifting a bag of vegetables. Then the real question: which of the two steel bottles in the host\'s hands would they carry to work? "This one. Looks nicer." The host says "Looks nicer" back to them, and waits.',

    'Whatever fills that silence is what ends up in the video.',

    'None of it was luck. Someone chose where the host would stand, what they would ask first, who they would stop and what they would do after the answer. That planning is the whole craft, because nobody scripts what a stranger says.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',

    },

    "The [guide to vox pop content](/blog/what-is-vox-pop-content) covers why the format works. This one covers how to shoot it, in the order it happens. You'll get a kit list, a script to copy and a calculator for how many people to approach. You'll also get what newsroom filming guides rarely cover: Hinglish, heat, crowds and permissions.",

    { type: 'h2', id: 'six-parts-at-a-glance', text: 'How to shoot a vox pop: the six parts at a glance', toc: 'The six parts at a glance' },

    'Every street interview runs through the same six links: setup, question, participant, follow-up, reaction and edit. A weak link anywhere shows up in the final video, so plan all six before the day.',

    {
      type: 'steps',
      id: 'six-steps',
      title: 'The six parts of a vox pop shoot',
      intro: 'Each part has one job, and one mistake that tends to break it.',
      howTo: true,
      supplies: ['A phone or camera', 'A wireless clip-on mic with a windshield', 'Question cards with follow-ups', 'The product', 'Signed release forms'],
      steps: [
        {
          name: 'Set up the spot',
          text: 'Pick a place with steady foot traffic, open shade and as little noise as you can find, then frame the shot before anyone walks up. **What goes wrong:** a spot that looks great and sounds like a traffic signal at rush hour.',
        },
        {
          name: 'Ask one clear question',
          text: 'Take one question per video, easy to start and open at the end, with an easy warm-up before it. **What goes wrong:** a question about your brand, which gets the polite answer people give a salesperson.',
        },
        {
          name: 'Approach the right people',
          text: "Stop people who have a minute, say who you're filming for and get a signed release before you roll. **What goes wrong:** approaching too few people, then trying to rescue flat answers in the edit.",
        },
        {
          name: 'Follow up after the first answer',
          text: 'Stop nodding, repeat their last few words and wait, or ask "Interesting, why though?" **What goes wrong:** moving to the next question just as the real answer was arriving.',
        },
        {
          name: 'Capture the reaction',
          text: 'Set up a moment, such as a reveal, a blind pick or the product in their hands, and keep a tight shot ready for the face. **What goes wrong:** the camera is on the wide shot when the expression happens.',
        },
        {
          name: 'Edit for hook, reaction and payoff',
          text: 'Open on the strongest moment, cut contrasting answers together and save the brand for the end. **What goes wrong:** the logo comes first and the viewer leaves before the story starts.',
        },
      ],

    },

    'First, though, the part that happens at a desk.',

    { type: 'h2', id: 'before-the-shoot', text: 'What gets locked before a vox pop shoot?', toc: 'Before the shoot' },

    'Before anyone goes outside, the brief gets locked: the objective, the products, the audience and the must-haves. Every decision on the street depends on it, and a change after filming can mean a reshoot.',

    'Think of it as dominoes. Say a coffee brand writes "awareness" as its objective. On the street that becomes "Have you heard of us?", and strangers answer "No, sorry." There is no video in that.',

    'Now lock the objective as "show that filter-coffee drinkers pick ours when they can\'t see the label". The question almost writes itself: two cups, no labels, one pick. Fix the first domino and the rest fall the right way.',

    'We lock nine things before each shoot. The right-hand column is the reason: every locked line is one less decision for the host to make on a hot footpath with a stranger waiting.',

    {
      type: 'table',
      caption: 'The nine things locked before a shoot, and what each one changes on the street',
      head: ['What gets locked', 'What it changes on the day'],
      rowHeaders: true,
      rows: [
        ['Primary objective', 'Which question you ask, and which answers you keep'],
        ['Product or products featured', 'What the host holds, hands over or hides for a reveal'],
        ['Target audience', 'Where you stand, and who you stop'],
        ['Core message or value proposition', 'The follow-up you plan, so answers can reach it on their own'],
        ['Desired audience response', 'The mechanism: a guess for curiosity, a choice for debate'],
        ['Required brand and product information', 'What goes on screen, so the host never recites it'],
        ['Mandatory requirements', 'Shots that must exist before you wrap, such as the product in hand'],
        ['Things to avoid', 'Questions, places and claims the host stays away from'],
        ['Any special production requirements', 'Props, permissions or a location agreed in advance'],
      ],

    },

    "If you're writing your own, [what goes in a vox pop brief](/blog/what-goes-in-a-vox-pop-brief) has the full template, field by field.",

    { type: 'h2', id: 'step-1-setup', text: 'Step 1: Setup' },

    "Setup is everything the viewer sees and hears before the question lands: the spot, the light, the sound and the framing. Get it right before the first approach.",

    "Once a stranger is talking, you can't stop them to move a tripod.",

    { type: 'h3', id: 'where-to-film', text: 'Where should you film a vox pop?' },

    "Somewhere semi-public: a café courtyard, the edge of a market, the wide pavement by a park gate. People there often have a minute to spare, and you aren't blocking anyone's way. A narrow footpath creates friction, because every conversation pushes walkers onto the road.",

    "Then choose by ear. A good-looking street that sounds like a horn chorus is useless, and viewers forgive a soft image long before an answer they can't hear.",

    {
      type: 'list',
      items: [
        '**Sound:** find the quietest corner, away from the main road, loudspeakers, generators and construction.',
        '**Light:** open shade beats direct sun. Faces stay even and nobody squints.',
        "**People:** watch who walks past for ten minutes. If they aren't your audience, move.",
        '**Room:** leave space for the small crowd that gathers.',
        '**Backups:** scout the main spot the day before, and keep two backup spots within walking distance.',
      ],

    },

    'Check who owns the ground, too. Malls, metro premises and most courtyards belong to someone, and the [notes on permissions](#permissions) below cover what to ask for.',

    { type: 'h3', id: 'what-gear', text: 'What gear do you need for a vox pop?' },

    'Less than you think. A recent phone and a wireless clip-on mic will carry a first shoot. Small kit has an upside beyond cost. A stranger facing a phone tends to talk like they would to a friend. Put a rig, a boom and three crew members in front of them and they start choosing their words.',

    "Audio is the one place not to save. A clip-on (lavalier) mic on the participant's collar, or a handheld mic the host angles toward them, beats any camera's built-in mic on a loud street. Add a furry windshield. A light breeze can wreck a take you can't repeat.",

    'The left column below is enough to learn the format. The right column is what lets a team film a whole batch in one day without missing the moment.',

    {
      type: 'table',
      caption: 'A first-shoot kit compared with what a professional crew adds',
      head: ['Item', 'Enough for a first shoot', 'What a crew adds'],
      rowHeaders: true,
      rows: [
        ['Camera', 'A recent phone, shooting vertical', 'A second camera for the tight reaction shot'],
        ['Audio', 'One wireless clip-on mic with a windshield', 'A mic each for host and participant, checked on headphones'],
        ['Support', 'A small gimbal, or a steady pair of hands', 'Tripods to lock the wide and medium shots'],
        ['Light', 'Open shade, with the sun behind the camera', 'A bounce board or small panel for faces'],
        ['Power and storage', 'A power bank and a cleared phone', 'Spare batteries, cards and a backup made on the day'],
        ['People', 'A host and someone filming', 'A host, a camera operator, and someone on releases and logging'],
      ],

    },

    'Our own street shoots come with professional framing and audio, because a brand batch has to hold up on every feed it runs on. For a first test on your own, the phone is fine.',

    "A better camera won't save a weak question.",

    { type: 'h3', id: 'three-shots', text: 'Three shots are enough: wide, medium, tight' },

    'Keep the shot plan to three. A wide shot shows a real place, so the viewer knows nobody is in a studio. A medium shot on the participant carries the conversation. A tight shot on the face catches the reaction, and the reaction is what people remember.',

    'With one camera, start on the medium and push in when the answer gets interesting, then grab the wide between people. With two, lock one on the medium and let the second hunt for faces.',

    {
      type: 'video',
      brand: 'Clotrio',
      title: 'Blind Pick',
      caption: 'Clotrio, "Blind Pick": people choose without seeing what they are choosing.',

    },

    'A blind pick shows why setup comes first. Nobody picks twice, so the camera, the mic and the light all have to be ready before the host says a word.',

    { type: 'h2', id: 'step-2-question', text: 'Step 2: The question' },

    'The question is the product. Everything else on the shoot exists to deliver it. So each video gets one question, short enough to say in one breath and about the person rather than your brand.',

    'A useful test before any question goes on a card: say it aloud, at normal speed, to someone who has never heard of the brand. If they reply "Meaning?", rewrite it. A stranger on a footpath gives you one hearing, not two.',

    'Three kinds of question tend to get people talking about themselves:',

    {
      type: 'list',
      items: [
        '**Aspiration:** what someone would do if a limit disappeared. "What would you buy first if EMIs didn\'t exist?"',
        '**Taboo, asked gently:** something people think about but rarely say aloud, like money or small habits. "Be honest, what do you spend too much on?"',
        '**Contrast:** what most people get wrong. "What\'s the biggest mistake people make with their mornings?"',
      ],

    },

    "Each one is about the person. The product comes in afterwards, in their hands or in the follow-up. A question that opens with your brand name tends to get the polite answer people give a salesperson, and polite answers don't hold a viewer.",

    "Across a batch, each video also gets its own mechanism: a guess and a reveal, an A/B choice, a ranking or a challenge.",

    "Five videos shouldn't ask the same thing five ways.",

    { type: 'h3', id: 'warm-up-question', text: 'Start with a warm-up question' },

    'Before the real question, ask one that costs nothing emotionally. "Where are you headed?" works. So does "Which part of the city are you from?" The person gets a few seconds of talking on camera while nothing rides on it, and you can watch their shoulders drop.',

    "That's the [warm-up question](/blog/vox-pop-glossary#warm-up-question). We'd call it the cheapest fix on the whole shoot. By the time the real question arrives, the person has stopped auditioning.",

    'A warm-up can be playful, too. Ask something absurd with no right answer, like which Bollywood villain the brand would be. Silly questions lower the stakes, and the answer sometimes makes a better opening for the video than anything after it. So keep rolling once they\'ve agreed to be filmed.',

    {
      type: 'callout',
      tone: 'tip',
      title: 'When the warm-up does not work',
      text: 'People rushing somewhere. Skip the warm-up and ask a quick choice they can answer while walking, like "Chai or coffee?" Save the deeper question for someone who stops.',

    },

    'One more question shape earns a place on every card: "Does this remind you of anything?" Most questions push people toward an answer. This one pulls out a memory, and memories make better clips than descriptions.',

    'A smell stops being "nice" and becomes a grandparent\'s cupboard, or the first rain on a hot road. Our video for Waxys, "What Does This Remind", at the top of this page, takes that question to the street.',

    { type: 'h2', id: 'step-3-participant', text: 'Step 3: The participant' },

    "The participant is whoever you stop, and how you stop them shapes how they answer. Approach people who have a minute, say who you're filming for, make them the expert, and get a signed release before the camera rolls.",

    { type: 'h3', id: 'approaching-strangers', text: 'How do you approach strangers for a street interview?' },

    "Walk up with the camera down and make it easy to say no. Someone who could have walked away and chose to stay gives you a different interview from someone who felt cornered. People who feel safe talk. People who feel tested perform.",

    'The first two minutes of an approach have four stages. The [street interview techniques guide](/blog/street-interview-techniques) gives them a name and a full script. Here they are in brief.',

    {
      type: 'framework',
      id: 'four-stage-approach',
      name: 'The first two minutes',
      tagline: 'An approach in four stages, before and during the real question.',
      acronym: false,
      parts: [
        {
          key: '1',
          name: 'Be a person first',
          text: "Spend the first minute being friendly: comment on something nearby, ask the warm-up. Let them see you aren't about to interrogate them.",
        },
        {
          key: '2',
          name: 'Set the scene, not the answer',
          text: 'Give just enough context: "We\'re asking people what they really think about breakfast. Not the ad version." Don\'t hint at the answer you want.',
        },
        {
          key: '3',
          name: 'Ask for a feeling',
          text: 'Ask the question that gets a feeling rather than a description: "When did a product last get it exactly right for you?"',
        },
        { key: '4', name: 'Hold the space', text: "Don't celebrate a good line or nod along. Let the answer finish arriving." },
      ],

    },

    "Then hand over the power. Improvisers call it status, an idea that goes back to Keith Johnstone's 1979 book _Impro_[^impro-glossary]. A host with a camera and a mic holds most of it, and people who feel low in status give safe answers.",

    'The fix is the teacher frame. "Can you help me understand something?" makes the person the expert. "What do you think about this?" makes them a test subject. Experts explain. Test subjects try to pass.',

    "Be clear about who you're filming for. If the host represents a brand, say so in the first sentence. Kreators.Army agrees that introduction and positioning with the brand before the shoot, so nobody is left guessing who the host speaks for.",

    'Not everyone has two minutes, and the pace can change on the day. When the spot turns out to be full of people on their way somewhere, a rapid-fire format asks less of each one.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Rapid Fire',
      caption: 'CircleStore, "Rapid Fire": short questions, quick answers.',

    },

    { type: 'h3', id: 'how-many-people', text: 'How many people should you interview for a vox pop?' },

    'More than feels sensible. A planning rule we call the minimum viable shoot: film at least 15 people for each question, and expect five to seven of them to make the cut.',

    'Treat that as a starting point, not a statistic. Some people go blank. Some give the safe, practised answer. Some are lovely but wrong for this question on this day. None of that is a failure if you planned for it.',

    'The numbers that matter are yours: how many people stop when asked, and how many of those answers are good enough to use. Both change with the spot, the hour and the question. The calculator below turns your guesses into a plan for the day. Its defaults are set so that each video needs 15 people filmed, the rule of thumb above.',

    {
      type: 'widget',
      widget: 'calculator',
      id: 'people-to-approach',
      props: {
        title: 'How many people should we approach?',
        intro: 'Use your own guesses. The defaults are placeholders that show how the sums work, not benchmarks.',
        inputs: [
          { key: 'videos', label: 'Videos in the batch', default: 5, min: 1, max: 20, step: 1, unit: 'videos' },
          { key: 'perVideo', label: 'Usable answers each video needs', default: 6, min: 1, max: 12, step: 1, unit: 'answers' },
          { key: 'keepRate', label: 'Your guess: answers good enough to use', default: 40, min: 5, max: 100, step: 5, unit: '%' },
          { key: 'stopRate', label: 'Your guess: people who stop and answer', default: 30, min: 5, max: 100, step: 5, unit: '%' },
          { key: 'interviewMin', label: 'Minutes per interview, from hello to thank-you', default: 3, min: 1, max: 15, step: 1, unit: 'min' },
          { key: 'noSeconds', label: 'Seconds lost on each person who says no', default: 20, min: 5, max: 120, step: 5, unit: 'sec' },
        ],
        outputs: [
          { key: 'answers', label: 'Usable answers needed', formula: 'videos * perVideo', format: 'number', unit: 'answers' },
          { key: 'filmed', label: 'People to film', formula: 'ceil(answers / (keepRate / 100))', format: 'number', unit: 'people' },
          { key: 'approach', label: 'People to approach', formula: 'ceil(filmed / (stopRate / 100))', format: 'number', unit: 'people' },
          {
            key: 'hours',
            label: 'Hours on the footpath, interviews and refusals together',
            formula: 'round((filmed * interviewMin + (approach - filmed) * noSeconds / 60) / 60, 1)',
            format: 'number',
            decimals: 1,
            unit: 'hours',
          },
        ],
        disclaimer: 'Planning numbers from your own estimates, nothing more. Real rates change with the place, the time of day, the weather and the question. Setup, breaks and moving between spots are not included.',
      },

    },

    'Run the defaults and most of the time goes on the interviews, because a no takes seconds. If the total runs past one day, you have three levers. Ask a question more people want to answer, find a spot with more of the right people, or plan for fewer usable answers per video. The first lever is usually the cheapest to pull.',

    "While you're choosing who to stop, don't only approach people who look like your ideal customer, or people who look easy. The edit needs contrast. A batch of near-identical answers gives the editor nothing to cut against.",

    { type: 'h3', id: 'consent-before-you-roll', text: 'Get consent before you roll' },

    "Consent comes before the camera, not after a good answer. Introduce yourself and the brand by name, say where the video will appear, and get a signed release from everyone you feature. A clear yes on camera is a useful record, but it doesn't replace the release.",

    "India's data protection rules [are coming into force in phases through 2027](https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html)[^dpdp-rules], and a video of an identifiable person is personal data. Check your release forms with a lawyer. Never feature anyone under 18 without a parent's written consent. This is general information, not legal advice.",

    'The paperwork has its own guide: [filming street interviews in India, consent and releases](/blog/street-interview-consent-india).',

    { type: 'h2', id: 'step-4-follow-up', text: 'Step 4: The follow-up' },

    'We think the follow-up is where a vox pop is won or lost. The first answer is usually the polite one, so plan what happens after it: stop nodding, echo their last words, wait, and ask why.',

    "Start with your head. When a host nods during an answer, the person reads it as approval and decides they've said enough. A friendly gesture cuts a great answer short. Keep your face interested and your head still.",

    "The first answer is the one people think they're supposed to give: reasonable, safe, fine on camera. That isn't lying. It's a social answer, given before they've heard themselves think.",

    'Then comes the real one.',

    { type: 'h3', id: 'echo-technique', text: 'The ECHO technique: repeat, then wait' },

    'Former FBI hostage negotiator Chris Voss calls the core move [mirroring](https://www.mindtools.com/arg0sjv/never-split-the-difference)[^mirroring]: repeat the last few words someone said, then wait. We call the street version ECHO.',

    {
      type: 'framework',
      id: 'echo',
      name: 'ECHO',
      tagline: 'Their words, back at them, then silence.',
      parts: [
        { key: 'E', name: 'Extract', text: 'Pick the key phrase from their answer, usually the last two or three words.' },
        { key: 'C', name: 'Confirm', text: 'Say it back to them word for word, flat or as a gentle question.' },
        { key: 'H', name: 'Hold', text: 'Stay silent. Count to five in your head if you have to.' },
        { key: 'O', name: 'Observe', text: "Watch what fills the silence. It's often the line the video is built on." },
      ],

    },

    'On the street it sounds like this. Someone says, "I only buy it when there\'s a sale." The host says, "Only when there\'s a sale." Then nothing. The small pressure of that silence often brings out a longer, more specific answer than a new question would, and it\'s in the person\'s own words.',

    { type: 'h3', id: 'why-though', text: 'The second question: why, though?' },

    "When an echo doesn't fit, three words do the same job: \"Interesting, why though?\" Ask it after they've committed to a position, not before. People explain a choice they've already made more openly than one they're still making.",

    'Below are three made-up exchanges, written to show the pattern. The first is the bottle question from the top of this guide. Tap each one to see an answer that could follow.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'first-and-second-answer',
      props: {
        title: 'What the follow-up changes (illustrative answers)',
        firstLabel: 'First answer',
        secondLabel: 'After the follow-up',
        items: [
          {
            question: 'Which of these two bottles would you carry to work?',
            first: '"This one. Looks nicer."',
            second: '"Honestly, my last one looked nice and the lid leaked into my bag within a month. Now I check the lid before anything else."',
            note: 'The follow-up was an echo: "Looks nicer."',
          },
          {
            question: 'What do you do first when you get home?',
            first: '"Change, then switch on the fan."',
            second: '"Then I sit in the dark for ten minutes before anyone can ask me anything. That\'s my time."',
            note: 'The follow-up: "Interesting, why though?"',
          },
          {
            question: 'Can you help me understand why people pay more for branded basics?',
            first: '"Quality, I guess."',
            second: '"Mostly so I don\'t have to think. If it\'s what my parents bought, I never have to compare."',
            note: 'The teacher frame made them the expert. The host then echoed "Quality, I guess" and waited.',
          },
        ],
      },

    },

    'Not every follow-up has to go deeper. Sometimes the structure does the work: a run of short questions keeps the energy up and gives the viewer several small answers instead of one long one.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Multiple Short Questions',
      caption: 'CircleStore, "Multiple Short Questions": several quick questions in a row in place of one long one.',

    },

    'Whichever structure you pick, the host needs room to leave it when something better turns up:',

    {
      type: 'quote',
      text: "We'd rather follow a genuinely interesting moment than force someone back to a script.",
      attribution: 'Kreators.Army, How we work',

    },

    'Here is one full approach as a script, from the first hello to the thank-you. Copy it, swap in your own category, and read it aloud before the day.',

    {
      type: 'script',
      id: 'script-full-approach',
      title: 'One approach, start to finish: warm-up, question, echo, why',
      context: 'A host, a camera operator and one product, on a wide footpath. The camera stays down until the person has agreed and signed.',
      lines: [
        { direction: 'The host walks up with the camera lowered.' },
        { speaker: 'Host', text: "Hi, sorry, quick one. We're filming short street interviews for a shoe brand. Have you got two minutes?" },
        { direction: 'They agree. The host says where the video will appear, and they sign the release.' },
        { speaker: 'Host', text: 'Thank you. Easy start: where are you headed?' },
        { speaker: 'Participant', text: 'Just home. Long day.' },
        {
          speaker: 'Host',
          text: 'Fair. Can you help me understand something? When you buy shoes, what do you actually look for? Not the ad version, the real one.',
        },
        { speaker: 'Participant', text: 'Honestly, I just want them to last.' },
        { speaker: 'Host', text: 'Want them to last.' },
        { direction: 'The host says nothing more and keeps a still, interested face.' },
        { speaker: 'Participant', text: "Yeah. I've bought three cheap pairs this year. I'm done replacing things." },
        { speaker: 'Host', text: 'Interesting. Why though?' },
        { direction: 'Wait. Let the second answer finish before saying anything.' },
        { speaker: 'Host', text: "That was great, thank you. Is there anything you said that you'd rather we didn't use?" },
      ],

    },

    { type: 'h3', id: 'two-column-sheet', text: 'Let the answers write your next question' },

    "Run the day from a sheet with two columns. Planned questions go on the left. The right column is for everything you didn't plan: a word someone used, a joke that landed, an answer that came out sideways.",

    'Mark the first hedge as well, the moment someone says "I mean, it depends" or goes quiet before answering. A hedge is a sign there is more to say. By mid-morning, the best follow-ups for the next few people often come from the right-hand column, not the prepared one.',

    { type: 'h2', id: 'step-5-reaction', text: 'Step 5: The reaction' },

    'The reaction is the one part nobody controls. What you control is the setup around it: a reveal, a blind pick, the product in their hands, and a camera ready for the face.',

    {
      type: 'quote',
      text: "We can't guarantee any one stranger will be funny or surprised. We can create more chances for it to happen.",
      attribution: 'Kreators.Army',

    },

    "We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger will respond in the moment. So the job is to stack the odds:",

    {
      type: 'list',
      items: [
        '**Give them something to do.** A product in hand, a smell, a taste or a guess gives the face a reason to move.',
        '**Build in a reveal.** A price or a name shown after the guess lands as a reaction, not an opinion.',
        '**Hide something.** In a blind pick or a blindfold test, the reaction arrives before the explanation.',
        '**Keep the tight shot ready.** Brief the camera to go in on any physical shift: a lean, a laugh, a pause.',
        '**Leave the pause alone.** The half-second before someone answers can be the most watchable part of the clip.',
      ],

    },

    'Why does an unpolished reaction matter so much? Partly because of how people weigh ordinary voices. In [a 2022 experiment with TV news items](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html)[^vox-pop-vs-expert], viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more.',

    "We'd argue that only holds while the reaction is real. A participant you coach, or a moment you prompt too hard, stops being a reaction. If anyone in your video is paid to appear, works for you or was cast, [India's endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf)[^endorsement-guidelines] expect you to say so clearly.",

    { type: 'h2', id: 'step-6-edit', text: 'Step 6: The edit' },

    'The edit decides what the viewer actually sees. Open on the strongest moment, build the middle from contrasting answers, and end on a payoff. Keep it as tight as the story allows, and no tighter.',

    'Before touching the timeline, watch everything back and log it. Mark the strongest moments, the best second answers and the words people used at the start of each interview. Those early words make good captions and callbacks.',

    {
      type: 'list',
      items: [
        '**Hook:** open on the most charged moment of the whole session, mid-sentence if you have to. Pick the answer that made you feel something, not the most articulate one.',
        '**Reaction:** cut two or three contrasting answers back to back. Someone certain next to someone still searching makes the viewer work out where they stand.',
        '**Payoff:** close on the answer that reframes the question, or on the brand moment, but only once the viewer feels understood.',
      ],

    },

    'Contrast is worth the extra effort. A study in _Journalism Studies_ of 2,000 vox pops from Flemish TV news found that [most vox pop news items show only one point of view](https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721)[^opinion-balance]. A brand video can do better: put the person who loves a habit next to the person who quit it.',

    "The opening carries the most weight. YouTube's own Shorts analytics measure [how often viewers stayed to watch past the first seconds](https://support.google.com/youtube/answer/12220281)[^yt-stayed-to-watch], so your first line has to earn the next ten seconds.",

    'Our own edit checklist is short: strong openings, no dead air or repetition, clear context, tight storytelling, strong reactions, pacing that suits the moment and clean endings.',

    'Subtitle everything, so a viewer scrolling with the sound off still follows the question and the answer. [How to edit a vox pop](/blog/how-to-edit-vox-pop-videos) goes through the whole edit, cut by cut.',

    { type: 'h2', id: 'filming-in-india', text: 'What changes when you film street interviews in India?', toc: 'Filming in India' },

    'Indian streets add four things to plan for: answers that switch languages, heat, crowds and permissions. None of them has to stop a shoot if you deal with it the day before.',

    { type: 'h3', id: 'hinglish', text: 'Let people answer in Hinglish' },

    "On many Indian streets, answers move between Hindi and English mid-sentence, or between English and Kannada, Tamil or Marathi. Don't correct it, and don't ask anyone to stick to English. The switch is often the most natural moment in the clip: \"Price theek hai, but who has the time?\" says more than a tidy English answer.",

    'Brief your editor to subtitle both languages, and have a native speaker check the translations before anything goes out. Write the question so it works in both, too.',

    'A question that needs careful translating gets careful answers.',

    { type: 'h3', id: 'heat-and-light', text: 'Heat, light and the monsoon' },

    'Plan the day around the sun. Morning and late afternoon give softer light, and five minutes of standing still is an easier ask when the footpath isn\'t baking. Around midday, faces squint and phones overheat.',

    {
      type: 'list',
      items: [
        'Carry water for the crew, and something cold to offer participants.',
        'Keep phones and batteries in the shade between takes. An overheated phone can shut down mid-answer.',
        "In the monsoon, make one backup a covered spot, such as a shopfront awning, with the shopkeeper's okay.",
        'Check the light on a face, not on the street. A bright background behind a face in shade leaves the face too dark.',
      ],

    },

    { type: 'h3', id: 'crowds-and-onlookers', text: 'Crowds and onlookers' },

    'Film for a while on a busy street and you will often collect an audience. Sometimes that helps: onlookers laugh, chip in and make the participant feel less alone. Sometimes it turns one honest answer into a performance for friends.',

    'If the crowd starts answering for the person, thank everyone and move to a backup spot.',

    'Watch the background as well. Anyone clearly identifiable in the frame is someone you may need to blur, crop out or ask.',

    { type: 'h3', id: 'permissions', text: 'Permissions: malls, metros and private spaces' },

    "Ask before you film anywhere private. Malls are private property, so get management's permission first. Metro premises are not open for filming either: Bengaluru's Namma Metro, for example, [needs prior permission and charges a fee for shoots](https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises)[^bmrcl-shoots].",

    'Cafés, colleges, gated communities and shop forecourts belong to someone, so ask the owner or manager. For public streets, check the local rules before any commercial shoot. This is general information, not legal advice.',

    'The whole section as one list, to tick off as you pack and film.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'shoot-day-checklist',
      props: {
        title: 'Shoot-day checklist: kit and consent',
        intro: 'Your ticks are saved on this device only.',
        items: [
          { id: 'brief', text: 'The locked brief, with the objective and must-haves on one page' },
          { id: 'questions', text: 'Question cards: one question per video, each with its warm-up and follow-up' },
          {
            id: 'camera',
            text: 'Phone or camera charged, with storage cleared',
            detail: 'Shoot vertical, and check the frame on a face before the first approach.',
          },
          { id: 'mic', text: 'Wireless clip-on mic, charged, with a windshield' },
          { id: 'power', text: 'Power bank, spare batteries and cables' },
          { id: 'support', text: 'A small gimbal or tripod' },
          { id: 'product', text: 'Enough product for every take, plus spares for the ones that get opened' },
          {
            id: 'thank-you',
            text: 'The thank-you for participants, if you have agreed one',
            detail: 'It helps people stop. It never decides what they say.',
          },
          { id: 'water', text: 'Water and shade for the crew' },
          { id: 'spots', text: 'The main spot, scouted the day before, and two backups' },
          { id: 'permission', text: 'Written permission for any private space you plan to use' },
          { id: 'introduction', text: 'The introduction line: who you are and which brand you are filming for' },
          {
            id: 'releases',
            text: 'Release forms, printed or on a tablet, checked by a lawyer',
            detail: 'Tell each person where the video will appear before they sign.',
          },
          { id: 'minors', text: "A crew rule: no one under 18 on camera without a parent's written consent" },
          { id: 'log', text: 'A log for the strongest moments and second answers, kept as you go' },
        ],
        done: 'Packed and planned. The rest happens on the footpath.',
      },

    },

    { type: 'h2', id: 'sample-shoot-day', text: 'What does a vox pop shoot day look like?', toc: 'A sample shoot day' },

    'A shoot day is mostly approaching people. Plan it around the light and the crowd. Set up early, work the best hours hard, rest through the hottest part and log the day before you forget it.',

    'The timeline below is an illustration, not a record of a real shoot. It assumes a host, a camera operator, someone handling releases and one question per video.',

    {
      type: 'widget',
      widget: 'timeline',
      id: 'sample-shoot-day-timeline',
      props: {
        title: 'An illustrative shoot day',
        intro: 'A made-up day to show the shape. Real timings depend on the city, the season and the questions.',
        items: [
          {
            when: '7:30',
            title: 'Arrive and check the spot',
            text: 'Walk the main spot and both backups. Listen before you look.',
            tasks: ['Check the noise at mic level', 'Find the open shade'],
          },
          {
            when: '8:00',
            title: 'Set up and sound check',
            text: 'Frame the wide and the medium, test the mic on a crew member, and run the warm-up out loud once.',
          },
          {
            when: '8:30',
            title: 'First approaches',
            text: 'Start with the easiest question on the card. The first few approaches warm up the host as well.',
          },
          {
            when: '10:00',
            title: 'Second question',
            text: 'Switch questions once you have enough usable answers, not when the clock says so. Log the best second answers as you go.',
          },
          {
            when: '11:30',
            title: 'Rest out of the heat',
            text: "Eat, back up the footage, charge everything and watch what you have. If a question isn't working, rewrite it now.",
            tasks: ['Back up to two places', 'Mark the strongest moments so far'],
          },
          {
            when: '15:30',
            title: 'Second spot',
            text: 'A new place gives the batch new faces and backgrounds. Run the questions that still need answers.',
          },
          {
            when: '17:30',
            title: 'Last light',
            text: 'The low evening sun flatters faces but fades fast. Use it for the question that needs the most reaction shots.',
          },
          {
            when: '18:30',
            title: 'Wrap and log',
            text: 'Match every release to its footage, back up again and write down the words people used. They feed the edit.',
          },
        ],
      },

    },

    'Two things in that day matter more than the timings. The midday rest is when a weak question gets rewritten instead of abandoned. And the log at the end is where the edit starts.',

    { type: 'cta', text: 'Want to see the format on your own product before you commit to a batch?' },

    { type: 'h2', id: 'how-kreators-army-runs-a-shoot', text: 'How does Kreators.Army run a vox pop shoot?', toc: 'How Kreators.Army runs a shoot' },

    'We run every brand shoot as part of one planned batch, after a brief, a trial and a package.',

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. The six steps above happen on the day. Getting to that day takes five:',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Send the brief.** The objective, how your brand should show up and what every video must include.',
        '**The trial.** We make a short trial on your brand, usually in 7 to 14 days, so you can see the format before you commit. Scope, the number of videos and any fee are confirmed in writing.',
        '**Feedback and a package.** Consolidated feedback through one point of contact, then a 5, 10 or 20 video package for one brand.',
        '**Prepay and plan.** Sign the pilot agreement and pay the package in advance. Before each shoot we lock the objective, products, audience and must-haves.',
        '**Shoot, edit, deliver.** We produce the batch in one planned cycle, usually 14 to 21 days, with review checkpoints where useful and minor revisions included. Usage rights transfer on full payment.',
      ],

    },

    "On the ground, we handle everything this guide covers, from the questions and who we approach to the interviewer, the follow-ups and the edit. What a stranger says back stays theirs.",

    'We batch-shoot, so variety comes from different people, backgrounds, framing and places, and from a different mechanism in each video. If a concept needs a special location or a large prop, we agree it in pre-production. [How we work](/how-we-work) sets out the full split, and [how the trial works](/trial) explains the first step.',

    'One thing to try this week: write one question about your product, ask it to three people at work, and stay quiet after their first answer.',

    'If the second answer beats the first, you have just run step 4 of a vox pop shoot. If it doesn\'t, change the question before you change the people.',
  ],

  faqs: [
    {
      q: 'How long does a vox pop shoot take?',
      a: 'Longer than the filming itself. Most of a vox pop shoot day goes on approaching people, so the length depends on how many videos you need and how many people stop. The calculator in this guide turns your own guesses into hours. A Kreators.Army batch usually takes 14 to 21 days, and the exact dates are confirmed in the pilot agreement once pre-production alignment is complete.',
    },
    {
      q: 'How many people do you need to interview for a vox pop?',
      a: 'More than you will use. A useful rule of thumb is to film at least 15 people per question and expect five to seven usable answers. Treat that as a starting point, because your own rates depend on the spot, the time of day and the question. The calculator in this guide turns your guesses into a number of people to approach.',
    },
    {
      q: 'What equipment do you need for a vox pop?',
      a: 'For a first shoot, a recent phone, a wireless clip-on mic with a windshield, a power bank and a small gimbal are enough. On a loud street, audio matters more than the camera. A professional crew adds a second camera for tight reaction shots, a second mic and someone to handle releases and logging.',
    },
    {
      q: 'Do you need permission to film street interviews in India?',
      a: "For private spaces, yes. Malls are private property, so ask management, and metro premises such as Bengaluru's Namma Metro need prior permission and charge a fee for shoots. Everyone you feature should sign a release that says where the video will appear. For public streets, check the local rules before a commercial shoot. This is general information, not legal advice.",
    },
    {
      q: 'What if nobody wants to talk to you?',
      a: 'Change one thing at a time: the question, the spot or the opener. A question that needs explaining tends to get refusals, so try a quick A/B choice people can answer while walking. Move somewhere people have a minute to spare, like a café courtyard or the edge of a market. A small thank-you also helps people stop.',
    },
    {
      q: 'Can our founder be the interviewer?',
      a: "Yes. A founder can host a vox pop, with the Kreators.Army team beside them running the shoot. The founder needs the same habits as any host: warm people up, stop nodding, echo the last few words and wait. Agree the introduction before the shoot, so participants know exactly who they're talking to and which brand it's for.",
    },
    {
      q: 'Do people get paid to take part in a vox pop?',
      a: "Sometimes, with a small thank-you. Something physical or redeemable on the spot gives a passer-by a reason to stop for a few minutes, and it never decides what they say. If anyone in a vox pop is paid to appear, works for the brand or was cast, India's endorsement guidelines expect that connection to be disclosed clearly.",
    },
    {
      q: 'How do you get clean audio for a street interview outdoors?',
      a: "Clip a wireless mic to the participant's collar, add a furry windshield and stand in the quietest corner of your spot, away from the main road, loudspeakers and construction. Listen on headphones if you can. Record a few seconds of background sound for the editor. If a horn drowns an answer, wait for it to pass and ask the follow-up again.",
    },
  ],

  sources: [
    {
      id: 'impro-glossary',
      title: 'Improv glossary',
      url: 'https://www.hooplaimpro.com/?p=1866',
      publisher: 'Hoopla Impro',
      note: 'Status, offers and blocking as improv terms, from Keith Johnstone, Impro (1979). CLAIMS.md R15.',
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
      id: 'mirroring',
      title: 'Never Split the Difference (summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Chris Voss and Tahl Raz (2016): mirroring, repeating the last few words to keep someone talking. CLAIMS.md P08.',
    },
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert with poll data, but shifted personal opinion more. CLAIMS.md R11.',
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
      id: 'opinion-balance',
      title: 'Opinion Balance in Vox Pop Television News',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies (Beckers, Walgrave and Van den Bulck)',
      note: 'Sample of 2,000 Flemish TV news vox pops; most vox pop news items present one point of view. CLAIMS.md E08.',
    },
    {
      id: 'yt-stayed-to-watch',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'Shorts analytics: "Stayed to watch", the share of views that continued past the first seconds. CLAIMS.md P01.',
    },
    {
      id: 'bmrcl-shoots',
      title: 'Bengaluru: after four years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023',
      note: 'Namma Metro shoots need prior permission and a fee. CLAIMS.md P06.',
    },
  ],

  related: ['street-interview-techniques', 'what-goes-in-a-vox-pop-brief', 'street-interview-consent-india', 'how-to-edit-vox-pop-videos'],
};

export default post;
