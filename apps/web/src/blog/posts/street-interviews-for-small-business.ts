import type { Post } from '../types';
import meta from './street-interviews-for-small-business.meta';

// Street interviews for small businesses: a 30-day system (PLAN.md post 12, PDF p95-105). Claims follow .work/v2/blog/CLAIMS.md. Every quote in the
// body is illustrative and signposted as such; city lenses are hypotheses, never facts; "five posts per line" is our rule of thumb (CLAIMS S37).

const post: Post = {
  meta,

  answer:
    "A small business can run street interviews, or vox pops, as a monthly habit. Pick one emotional theme, write a three-step question funnel (surface, pressure, identity) and record three to five chats on a phone. Then give each strong line five jobs: hook, opinion, lesson, contrast and soft sell. Kreators.Army's advice: change one thing a month.",

  takeaways: [
    'Our view: customers rarely buy because of one more feature. They buy when they feel understood, and a stranger’s unplanned line shows you that feeling in their words.',
    'Ask in a funnel: an easy surface question, then a pressure question about cost or stress, then an identity question about what it says about them.',
    'Tag lines by emotion before topic. Fear, pride, shame, want, confusion and relief tell you what a line can do.',
    'Our rule of thumb: a strong line can do five jobs. A hook, an opinion, a lesson, a contrast and a soft sell.',
    'Post the clips that help viewers explain themselves. Funny is a bonus, not the test.',
    'One session a month on one theme. Change one thing at a time, and let comments and sends write next month’s question.',
  ],

  body: [
    "It's Sunday night and the content calendar is open again. You run a small brand: a bakery that delivers across Bengaluru, say, or a skincare line you still pack at the dining table. You have a phone, about two spare hours a week and a feed that looks fine and says very little.",

    "You've tried the trends. You've tried the clean product shot on a marble slab.",

    'Neither sounded like your customers, because neither came from them.',

    "This guide changes where your posts come from. Once a month you'll go out with one question and collect the words people use when nobody is selling to them. Then you'll turn them into posts. You'll get six frameworks, a question funnel builder, a tool that turns one line into five posts and a 30-day calendar you can start this week.",

    { type: 'h2', id: 'why-small-brands-sound-the-same', text: 'Why do small brands end up sounding the same?', toc: 'Why small brands sound alike' },

    "They write from the same three places: the founder's head, a competitor's feed and the trend of the week. The fix is a better input: the exact words buyers use when nobody is trying to sell them anything.",

    "Try this. Open ten small-brand feeds in your category and cover the logos. Same trending audio, same flat-lay, same festive discount, same founder note in a serif font. You'd struggle to say which feed is whose.",

    'Each post is fine on its own. Together they sound like a brand talking to itself.',

    "Buyers notice, and they're wary. In PwC's 2024 survey of Indian shoppers, social media was where most of them found new brands and checked reviews, yet it was their least-trusted channel[^pwc-india-2024]. We read that as a warning about polish. People find you on the feed, then doubt what you say there.",

    { type: 'stat', value: '588M', label: 'People in India who watched short video in 2025', source: 'iamai-short-video', note: 'Slightly more of them were in rural India than in cities.' },
    { type: 'stat', value: '77%', label: 'Indian shoppers who discover new brands on social media', source: 'pwc-india-2024' },
    { type: 'stat', value: '81%', label: 'Who check reviews there, though it is their least-trusted channel', source: 'pwc-india-2024' },

    'Your customers are on the feed already. What they rarely find there is someone who sounds like them.',

    {
      type: 'definition',
      id: 'street-interview',
      term: 'Street interview (vox pop)',
      text: 'A [street interview, or vox pop](/blog/what-is-vox-pop-content), is a short video where a host asks people in a public place one question and films their unscripted answers.',
    },

    'For a small business, the video is half the value. The other half is the language.',

    "Someone answering a stranger's question on the spot doesn't talk in brand lines. Fear, pride, shame and doubt slip out in their own words. Those words can become your hooks and captions, and over time your brand voice.",

    "It's easy to treat street interviews as a views play. We think their bigger use for a small brand is quieter: they show you who your buyer is, in the buyer's own words. The six frameworks below turn that into a monthly habit.",

    {
      type: 'framework',
      id: 'six-frameworks',
      name: 'Six frameworks for a small team',
      tagline: 'Each one does a single job. Together they make one month.',
      acronym: false,
      parts: [
        { key: '1', name: 'The mirror effect', text: 'Hear the line behind the line, and hand the buyer’s words back to them.' },
        { key: '2', name: 'The city lens', text: 'Decide whose pressure you are listening to, and test one hunch a month.' },
        { key: '3', name: 'The question funnel', text: 'Ask surface, then pressure, then identity, so people open up without feeling trapped.' },
        { key: '4', name: 'The clip-to-content pipeline', text: 'Put each chat into text, mark the peaks, sort by emotion and give each line several jobs.' },
        { key: '5', name: 'The perspective trigger', text: 'Keep the clips that help viewers explain themselves.' },
        { key: '6', name: 'The 30-day system', text: 'One theme, one question, one session and one batch of posts, every month.' },
      ],
    },

    { type: 'h2', id: 'the-mirror-effect', text: '1. The mirror effect: what are customers really telling you?', toc: '1. The mirror effect' },

    `Usually something under the topic: a money worry, or a fear of falling behind. The [mirror effect](/blog/vox-pop-glossary#mirror-effect) is handing those words back, so a viewer hears a stranger say one messy line and thinks, "that's me."`,

    'We think people rarely buy because you added one more fact. They buy when they feel seen. An ad tells people what to think. A street answer shows you how they already think.',

    "That changes your job. You don't have to invent a new language for your brand. You have to notice what people say, sort it and hand it back cleanly.",

    'Media researchers call part of this exemplification: one vivid person on screen sways judgments more than a statistic does[^exemplification]. A 2022 experiment with TV news went further. Viewers rated vox pops as less trustworthy than an expert quoting a poll, yet the vox pops moved their personal opinions more[^vox-pop-vs-expert].',

    {
      type: 'quote',
      text: "Vox pops do influence audiences' personal opinion more strongly.",
      attribution: 'Kathleen Beckers, in Communications (2022), comparing vox pop and expert statements in news items',
      source: 'vox-pop-vs-expert',
    },

    { type: 'h3', id: 'the-line-behind-the-line', text: 'Listen for the line behind the line' },

    "People answering fast don't sound like a brochure. Under a little time pressure they let slip what they're afraid of, what they envy and what they want others to think of them. The first answer is usually the surface. One more question gets you the feeling underneath.",

    "Take work. Someone laughs and says they're just hustling: long days, sleep can wait. It sounds like pride.",

    `Ask one more question and it can turn into "I work all day and I'm still not where I said I'd be." That's pressure, and a quiet worry about what they're worth.`,

    'Hustle was only the way in.',

    {
      type: 'callout',
      tone: 'note',
      title: 'The topic is rarely the real thing',
      text: 'It’s tempting to hear the surface line and build content on the topic: fitness, careers, dating, money. Underneath, someone buying a course may be buying proof they aren’t falling behind their friends. Someone buying a better pressure cooker may be buying the story they tell when relatives visit.',
    },

    'Here are three made-up exchanges of the kind a small brand might film. Tap each one to see what a single follow-up can uncover.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'line-behind-the-line',
      props: {
        title: 'Illustrative: the first answer and the one behind it',
        firstLabel: 'What they say first',
        secondLabel: 'After one more question',
        items: [
          {
            question: 'What did you have for lunch today?',
            first: '"Something quick. Whatever came first."',
            second: `"Every Sunday I tell myself I'll eat properly this week."`,
            note: 'Food is the topic. A promise they keep breaking is the feeling.',
          },
          {
            question: "What's in your skincare routine?",
            first: '"Nothing much. Face wash, sunscreen if I remember."',
            second: `"I bought five things last year and use one. I don't even know what the rest are for."`,
            note: 'Routine is the topic. Confusion, and a little guilt about the money, sit underneath.',
          },
          {
            question: "How's the month going?",
            first: '"My salary finishes before the month does." (laughs)',
            second: `"I've stopped telling my parents how tight it is."`,
            note: 'The joke gets you in. The truth comes one question later.',
          },
        ],
      },
    },

    `Funny lines deserve special attention. For a second the filter drops and the person stops performing for the camera. "My salary finishes before the month does" gets a laugh. If you sell budgeting tools or a monthly meal plan, it's also a whole content pillar.`,

    { type: 'h3', id: 'three-lines-four-assets', text: 'Turn three repeated lines into four assets' },

    'To use this without making your feed messy, work in three steps.',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Pull three lines that repeat.** Skip the single wildest quote. Look for three things different people kept saying in different words.',
        '**Write the feeling under each.** Fear, shame, pride or doubt. One word per line is enough.',
        '**Give each line four homes:** a hook, a reel angle, a caption and a note to your customers by email or WhatsApp.',
      ],
    },

    `Say you run a home-style tiffin service in HSR Layout. Three different people tell you some version of "I eat whatever's fastest at lunch and feel bad about it." The feeling is shame. Your four assets might look like this:`,

    {
      type: 'list',
      items: [
        '**Hook:** "A lunch you decide at 1.45 pm is never the lunch you wanted."',
        "**Reel angle:** the gap between the lunch you grab and the one you'd pick if someone planned it for you.",
        '**Caption:** the small guilt of the desk lunch, told without a lecture.',
        '**WhatsApp note:** how a weekly box settles the lunch question before Monday starts.',
      ],
    },

    "None of those four lines came from your head. That's why they'll sound like your customer instead of your brand.",

    "The mirror effect only works once you know whose words you're collecting. That's the next framework.",

    { type: 'h2', id: 'the-city-lens', text: '2. The city lens: whose pressure are you listening to?', toc: '2. The city lens' },

    `The city lens is a decision about whose pressure you're listening to this month. "The audience" is too broad to write for: two people with the same phone and the same sneakers can be carrying very different weights.`,

    `Place shifts how people answer: how fast they talk, which mix of languages they use, what they joke about and how much they'll admit to a stranger with a mic. Pool every answer into one big "India" and the content flattens out. It can be clever and still feel like it came from nowhere in particular.`,

    `Take one question: "What are you chasing right now?" Same words, different streets. Below are three starting hunches for the big metros. Read them as hypotheses to test with your own camera, never as facts about the people who live there.`,

    {
      type: 'table',
      caption: 'City hunches to test, not facts about anyone',
      head: ['Lens', 'A hunch to test', 'If it holds, build around'],
      rows: [
        ['Mumbai', 'The chase sounds close to survival. Rent, time and money come up fast, even in jokes.', 'Effort, pressure and progress'],
        ['Bengaluru', 'Ambition with drift. The job looks fine on paper but something feels off.', 'Direction, fit and identity'],
        ['Delhi', 'Image is spoken about openly: style, status and how a choice will look.', 'Self-presentation, social proof and hidden insecurity'],
        ['Your own town', 'Whatever you keep hearing in week three', 'The three lines that repeat'],
      ],
      rowHeaders: true,
    },

    "If you sell from Mysuru or Indore, your lens might be a college gate, a market lane or the queue outside a popular chai stall. The point is the same. Decide who you're listening to before you decide what to post.",

    { type: 'h3', id: 'pick-one-driver', text: 'Pick one driver and test it for a month' },

    "You don't need a notebook full of theories. Pick one driver and build one content pillar from it. If your street keeps giving you money stress mixed with pride, build around effort and progress. If it gives you career doubt mixed with hope, build around direction and fit.",

    `Write the hunch down before you shoot, in one line: "Near the tech park, people will talk about direction more than money." After the session, mark each answer: backs it, contradicts it or neither. A hunch that keeps losing is still a win, because you've learned something no desk research would have told you.`,

    "Then don't switch every week. Switching is how small brands kill their own momentum. Run one pillar for a whole month across reels, carousels, captions and stories, then check what people save, send and quote back to you in the comments.",

    {
      type: 'callout',
      tone: 'note',
      title: 'A handful of chats is not a survey',
      text: 'Five answers from one corner tell you what five people said. Even TV news struggles here: a study of 2,000 vox pops in Flemish TV news found they rarely reflected minorities[^beckers-2017]. Cast widely on purpose, ask at different times and places, and treat each lens as a hunch until your comments back it up.',
    },

    'A good lens with a bad question still gets you polite nothing. So, the question.',

    { type: 'h2', id: 'the-question-funnel', text: '3. The question funnel: what should you ask on the street?', toc: '3. The question funnel' },

    "Ask three questions in order: an easy surface question, a pressure question about cost or stress, then an identity question about what it all says about them. In that order, people open up without feeling cornered. We'd put the question above the camera and the edit.",

    `Yes-or-no questions are the usual mistake. "Do you like your job?" "Do you enjoy coffee?" You'll get yes, no or it depends, and nobody stays to watch a stranger say "it depends".`,

    {
      type: 'definition',
      id: 'question-funnel',
      term: 'Question funnel',
      text: 'A question funnel is a set of three street interview questions asked in order: a surface question that is easy to answer, a pressure question about cost, stress or frustration, and an identity question about what it all says about the person.',
    },

    { type: 'h3', id: 'the-coffee-example', text: 'The coffee example' },

    "Say you run a small coffee brand. Don't ask whether people like coffee, because that tells you nothing. Ask about the morning instead.",

    {
      type: 'script',
      id: 'script-coffee-funnel',
      title: 'A question funnel for a small coffee brand',
      context: 'An imagined exchange to show the order of the questions. It is not a real interview.',
      lines: [
        { direction: 'A weekday morning on a busy footpath near an office gate. The host holds the phone at chest height.' },
        { speaker: 'Host', text: 'What do you need in the morning before your day feels usable?' },
        { speaker: 'Participant', text: 'Coffee. And ten minutes where nobody talks to me.' },
        { speaker: 'Host', text: 'What ruins your morning most days?' },
        { speaker: 'Participant', text: "Leaving late. Then it's one thing after another." },
        { speaker: 'Host', text: 'What does your morning say about where your life is right now?' },
        { direction: "Wait. Don't fill the silence." },
        { speaker: 'Participant', text: "That I'm always catching up, I think." },
      ],
    },

    'The first question is about routine. The second brings pressure in. By the third, the clip has moved from a drink to control and self-respect, which is a much bigger idea for a coffee brand to stand next to.',

    {
      type: 'video',
      brand: 'Waxys',
      title: 'Unwind Routine',
      caption: "Waxys, 'Unwind Routine': a question about how people unwind, a routine rather than a product. Surface questions like this are where a funnel starts.",
    },

    { type: 'h3', id: 'stay-on-the-emotion-word', text: 'Stay on the emotion word' },

    'Picture the same funnel outside a tech park in Bengaluru. Plenty of people there can give you a LinkedIn-ready answer in two seconds: "Growing. Learning a lot."',

    'Stay with them. Ask what feels heavy, then what that says about the path they are on. The neat answer may crack into safe-job guilt, a startup idea never acted on, or a quiet doubt about whether the stable path still fits.',

    "Viewers stay for that turn, the moment a stranger stops managing the answer and admits the thing. The words that come after it are the ones to write down, because they're usually the words your market lives inside.",

    'So when someone drops an emotion word like tired or stuck, don’t rush on. Repeat it back and wait.',

    {
      type: 'callout',
      tone: 'tip',
      title: 'Follow-ups to keep in your pocket',
      text: 'Short, open and about them. Say one, then stop talking.',
      items: ['"Stuck?" (their word, repeated back)', '"Why that word?"', '"How long has it felt like that?"', '"What happened the last time?"'],
    },

    'Former FBI hostage negotiator Chris Voss calls this mirroring: repeat the last few words someone said, then let the silence work[^mirroring]. On the street, the silence is the hard part. Hold it.',

    'Two rules keep this kind and useful. First, never push someone who backs off. A skipped question costs you nothing, and a cornered stranger costs you the clip and some goodwill.',

    'Second, hunt for repeat lines rather than the one wild answer. A loud clip may spike for a day and do nothing for your brand. A phrase that turns up across five people, in five different ways, can feed your hooks and offers for months.',

    'Try the funnel on your own product. Type what you sell, the moment it gets used and a small frustration around that moment. Edit the wording until it sounds like you, then copy it.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'question-funnel-builder',
      props: {
        title: 'Question funnel builder',
        intro: 'Three fields in, a surface, pressure and identity set out. Pick one question from each group for your shoot.',
        fields: [
          { id: 'category', label: 'What you sell, in plain words', placeholder: 'e.g. coffee', example: 'coffee' },
          { id: 'moment', label: 'The moment it gets used', placeholder: 'e.g. your morning', example: 'your morning' },
          { id: 'pain', label: 'A small frustration in that moment', placeholder: "e.g. you're already running late", example: "you're already running late" },
        ],
        templates: [
          { text: 'Walk me through {moment}. What has to happen first?', group: 'Surface', mechanism: 'Personal experiences' },
          { text: "What's the one thing you can't skip in {moment}?", group: 'Surface', mechanism: 'Personal experiences' },
          { text: 'When did you last buy {category}, and where?', group: 'Surface', mechanism: 'Personal experiences' },
          { text: 'What ruins {moment} most days?', group: 'Pressure', mechanism: 'Different follow-up structures' },
          { text: 'When {pain}, what is the first thing to go?', group: 'Pressure', mechanism: 'Different follow-up structures' },
          { text: 'What do people around you get wrong about {category}?', group: 'Pressure', mechanism: 'Debates and opposing opinions' },
          { text: 'What does {moment} say about where your life is right now?', group: 'Identity', mechanism: 'Unexpected questions' },
          { text: 'If a friend saw your {category} choices, what would they guess about you?', group: 'Identity', mechanism: 'Unexpected questions' },
          { text: 'When {pain}, do you tell people, or do you hide it?', group: 'Identity', mechanism: 'Unexpected questions' },
        ],
        note: 'Write one follow-up for each question before the shoot. "Why that word?" is often enough.',
      },
    },

    'For more starting points sorted by category, see our list of [120 vox pop questions](/blog/vox-pop-questions).',

    { type: 'h2', id: 'the-clip-to-content-pipeline', text: '4. The clip-to-content pipeline: how does one chat become a week of posts?', toc: '4. Clip-to-content pipeline' },

    'Put the chat into text, mark the emotional peaks, tag each one by feeling, then give every strong line several jobs across formats. One decent chat can feed a week of posts.',

    'The usual habit wastes good answers: clip the punchline, add captions, post, forget. The parts left on the hard drive are often the ones that build trust.',

    { type: 'h3', id: 'why-text-first', text: 'Why text comes first' },

    "When you only watch clips, you get distracted by the voice, the clothes, the traffic and who seems cool. On a page, the pattern is easier to catch. Repeat words stand out. So do small confessions, and the sentence people slip in right after a laugh.",

    'That laugh line often becomes the save line. People react fast to the joke, then a viewer watches again and thinks: that is my life.',

    'For a business, the second reaction matters more. Likes are pleasant. Saves and sends tell you the line landed somewhere real, and so does a DM from someone who never writes.',

    "You don't need a production stack. A phone and a small mic will do, plus a transcription tool that copes with the languages your street speaks. Keep the best lines in a spreadsheet or plain doc: your line bank. If you paste transcripts into an AI tool to help sort them, strip out names first and check that your release form covers it.",

    {
      type: 'steps',
      id: 'clip-to-content-steps',
      title: 'Turn one street chat into a week of posts',
      intro: 'Roughly two hours for three to five chats, once it becomes a habit.',
      howTo: true,
      totalTime: 'PT2H',
      supplies: ['Your raw clips', 'A transcription tool', 'A spreadsheet or plain doc'],
      steps: [
        { name: 'Transcribe every chat', text: 'Get every chat into text, including the parts you expect to cut. Keep a timestamp beside each line so you can find the clip later.' },
        { name: 'Mark the peaks', text: 'Read the text once without the video. Highlight where a speaker shifts from polished to honest, and the line after every laugh.' },
        { name: 'Tag by emotion first', text: 'Give each highlighted line one feeling: fear, pride, shame, want, confusion or relief. Add the topic as a second tag.' },
        { name: 'Find the angles', text: 'For each strong line, ask what it could become: a hook, an opinion, a lesson, a contrast or a soft sell.' },
        { name: 'Split by format', text: 'Decide what each angle needs: the raw clip, your take over it, a carousel or a longer cut.' },
      ],
    },

    { type: 'h3', id: 'sort-by-emotion', text: 'Sort by emotion, then topic' },

    "Topic folders like 'Career' or 'Money' fill up fast and tell you very little. Emotion tags tell you what a line can do. We think people act on a feeling first and find the logic after, so the feeling is the more useful label.",

    'Try it on eight made-up lines, picking the feeling you would file each one under.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'emotion-tagger',
      props: {
        title: "Emotion tagger: what's under the line?",
        intro: 'Eight illustrative lines, not real quotes. Some carry two feelings, so pick the one you would file it under.',
        questions: [
          {
            q: '"I check my bank app before I order anything now."',
            options: [
              { text: 'Fear', points: 1 },
              { text: 'Pride', points: 0 },
              { text: 'Relief', points: 0 },
              { text: 'Want', points: 0 },
            ],
            explain: 'Fear: a worry about running short, said out loud.',
          },
          {
            q: '"I built the whole thing myself. Nobody helped."',
            options: [
              { text: 'Shame', points: 0 },
              { text: 'Pride', points: 1 },
              { text: 'Confusion', points: 0 },
              { text: 'Fear', points: 0 },
            ],
            explain: 'Pride. Lines like this suit stories about effort and craft.',
          },
          {
            q: '"I tell people I cook. Mostly I order in."',
            options: [
              { text: 'Want', points: 0 },
              { text: 'Relief', points: 0 },
              { text: 'Shame', points: 1 },
              { text: 'Pride', points: 0 },
            ],
            explain: 'Shame: a small gap between how they live and how they say they live.',
          },
          {
            q: '"I just want one morning where nothing is urgent."',
            options: [
              { text: 'Want', points: 1 },
              { text: 'Fear', points: 0 },
              { text: 'Confusion', points: 0 },
              { text: 'Shame', points: 0 },
            ],
            explain: 'Want: a plain wish. Wishes make good hooks and gentle soft sells.',
          },
          {
            q: '"There are fifty kinds and I have no idea which one is for me."',
            options: [
              { text: 'Relief', points: 0 },
              { text: 'Confusion', points: 1 },
              { text: 'Want', points: 0 },
              { text: 'Pride', points: 0 },
            ],
            explain: 'Confusion: the natural start of a teaching post.',
          },
          {
            q: '"Since I started packing lunch the night before, mornings are calm."',
            options: [
              { text: 'Pride', points: 0 },
              { text: 'Want', points: 0 },
              { text: 'Relief', points: 1 },
              { text: 'Fear', points: 0 },
            ],
            explain: 'Relief: the after-picture a product can stand next to.',
          },
          {
            q: `"Everyone acts chill, but we're all trying to look sorted."`,
            options: [
              { text: 'Shame', points: 1 },
              { text: 'Pride', points: 0 },
              { text: 'Relief', points: 0 },
              { text: 'Confusion', points: 0 },
            ],
            explain: "Shame, or hidden insecurity: the public face and the private worry don't match.",
          },
          {
            q: `"I'd rather earn less and sleep well."`,
            options: [
              { text: 'Fear', points: 0 },
              { text: 'Want', points: 1 },
              { text: 'Shame', points: 0 },
              { text: 'Relief', points: 0 },
            ],
            explain: 'Want, framed as a trade-off. It pairs well with an answer that says the opposite.',
          },
        ],
        results: [
          { min: 0, title: 'Keep practising', text: 'Tagging gets easier with real transcripts. Give each line one feeling and move on.' },
          { min: 4, title: 'Good ear', text: 'You hear the feeling under the words. Tag your next transcript the same way.' },
          { min: 7, title: 'Sharp', text: 'You are ready for a real line bank. The lines you hesitated over are often the richest.' },
        ],
      },
    },

    { type: 'h2', id: 'one-line-five-jobs', text: 'How many posts can one strong line carry?', toc: 'One line, five posts' },

    'Up to five, as our rule of thumb: a hook, an opinion post, a teaching post, a contrast post and a soft-sell post. This is the last step of the pipeline, where a tagged line turns into a week of content.',

    `Say someone in Delhi tells you, "Everyone acts chill, but all of us are low-key trying to look sorted." That's more than a funny clip about image. It can branch five ways.`,

    'It can be a hook. It can be an opinion post on how social pressure shapes buying, or a teaching post on speaking to private worries instead of public wants. It can be a contrast post: do you want to be seen as sorted, or to feel settled? And if you sell anything near styling, grooming, gifting or money, it can carry a soft sell.',

    "If a line can't do all five, it may be funny, but it probably isn't deep enough to carry a month. Treat five as a test of depth, not a quota.",

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'one-line-five-posts',
      props: {
        title: 'One line, five posts',
        intro: 'Paste a line from your transcript, name the feeling under it and say what you sell. You get five post outlines to edit.',
        fields: [
          { id: 'line', label: 'The line, word for word', placeholder: 'Paste one line from a transcript', example: "Everyone acts chill, but we're all trying to look sorted." },
          { id: 'feeling', label: 'The feeling under it', placeholder: 'e.g. the pressure to look sorted', example: 'the pressure to look sorted' },
          { id: 'offer', label: 'What you sell', placeholder: 'e.g. a styling service', example: 'a styling service' },
        ],
        templates: [
          { text: 'Hook: open on the line itself, uncut: "{line}" Then one question on screen: does this sound like you?', group: 'Hook' },
          { text: 'Opinion: we think {feeling} shapes what people buy more than they admit. Use the clip as proof, then give your view in three lines.', group: 'Opinion' },
          { text: 'Teaching: what "{line}" tells a brand about private worries versus public wants, with one practical lesson.', group: 'Teaching' },
          { text: 'Contrast: cut "{line}" next to an answer that says the opposite, and ask viewers which side they are on.', group: 'Contrast', mechanism: 'Debates and opposing opinions' },
          { text: 'Soft sell: if {feeling} sounds familiar, show how {offer} helps, in one calm line. No countdowns, no pressure.', group: 'Soft sell' },
        ],
        note: 'Write the soft sell last. If it feels forced, drop it. The other four outlines still work.',
      },
    },

    { type: 'h3', id: 'match-the-format', text: 'Match the format to the line' },

    'Not every clip needs your face explaining it. Some quotes work as raw reaction content. Some need your take layered over them.',

    "Others become a carousel, where slide one is the line and the next slides unpack what it says about how people buy. A few deserve a longer cut, because the answer opens up a whole pattern. [How to edit a vox pop](/blog/how-to-edit-vox-pop-videos) covers the cutting itself.",

    'This is one place where small brands have an edge. We think big brands often over-clean their footage. They remove the odd bits and smooth the edges, and the human part goes with them. You can keep the rough truth and post while the feeling is still fresh.',

    {
      type: 'video',
      brand: 'BreadBerry',
      title: 'Square Size',
      caption: "BreadBerry, 'Square Size': a video built around one product detail, its square size. We'd post a product question like this after the viewer already feels seen.",
    },

    { type: 'h2', id: 'the-perspective-trigger', text: '5. The perspective trigger: which clips are worth posting?', toc: '5. The perspective trigger' },

    `Post the clips that help viewers explain themselves. Before anything goes out, swap "Is this funny?" for "Would someone use this to describe their own life?" A yes is worth a week of content.`,

    'Some clips get a laugh and vanish. Others make people stop, send the clip to a friend and write a long comment, because the line gave them words for their own life. The second kind is the one to build on.',

    "A strong clip doesn't push the product first. It gives the viewer a frame for seeing themselves. The trigger fires when the person watching thinks, 'I've felt this, I just never had words for it.' Trust starts there, before your pitch arrives.",

    'Four quick checks before a clip goes out:',

    {
      type: 'list',
      items: [
        '**The send test.** Can you picture someone forwarding it with "this is you"?',
        '**The comment test.** Would a viewer want to add their own version below it?',
        '**The caption test.** Can you caption it in the speaker’s words, without explaining the joke?',
        '**The brand test.** Does the feeling sit near what you sell? If not, it may be a great clip for someone else’s brand.',
      ],
    },

    "Fail the brand test and the clip can still go out. Just don't build a month on it.",

    { type: 'h3', id: 'why-people-send-these-clips', text: 'Why people send these clips' },

    "People share what's funny, and also what signals who they are and which side they're on. Instagram's head, Adam Mosseri, has said the top three ranking signals are watch time, likes and sends. Sends count slightly more among people who don't follow you yet[^mosseri-signals]. For a small brand trying to reach strangers, post the line people want to send.",

    'What makes a line strong enough? Many people feel it, and very few say it out loud. When a stranger admits something common but hidden, the viewer hears more than an opinion. They hear permission.',

    "So start with the human line. A skincare brand doesn't need to open with ingredients. A fitness coach doesn't need to open with sets and reps. Start with the thought people carry around in private, and let the product arrive later.",

    {
      type: 'video',
      brand: 'Orgaheal',
      title: 'Amount Of Protein',
      caption: "Orgaheal, 'Amount Of Protein': a nutrition brand, with a title that starts from the category question, protein, rather than the product.",
    },

    { type: 'h3', id: 'use-contrast', text: 'Use contrast to make people pick a side' },

    'Contrast is one of the most useful moves. Put two answers side by side and let the tension work.',

    {
      type: 'comparison',
      title: 'Two answers, one cut (illustrative)',
      left: { label: 'One person says', items: ['"I want peace."', `"I'd rather earn less and sleep well."`] },
      right: { label: 'Another says', items: ['"I want to be ahead."', `"I'll suffer now if it means I look sorted later."`] },
      verdict: 'Viewers stop watching strangers and start choosing sides.',
    },

    "Side-picking matters more than it looks. A viewer who chooses, even silently, has told themselves what they value and which story they belong to. Now they have a reason to comment (to defend it), to send (to test a friend) and to save (it names a conflict they live with).",

    "It's also the fairer way to cut. A study of vox pops in Flemish TV news found that most items showed only one point of view[^opinion-balance]. Putting answers that disagree in one video is truer to the street, and more interesting to watch.",

    { type: 'h3', id: 'perspective-before-offer', text: 'Let the perspective land before the offer' },

    "The payoff often comes one beat after the laugh, when viewers see their own pattern in a stranger's answer.",

    'First the reaction, then the self-read.',

    "Don't sell during that moment. Let the viewer feel seen, then bring the offer in as the next step.",

    'If your product helps with the tension the clip exposed, the offer reads as a continuation rather than an interruption. [Vox pop content for the middle of the funnel](/blog/vox-pop-mofu-content-strategy) goes further into that next step.',

    { type: 'h2', id: 'the-30-day-system', text: '6. What does a 30-day street content system look like?', toc: '6. The 30-day system' },

    "One street session a month, with one core question and three to five short chats, run on a four-week loop. You don't need fifty clips or three camera angles. You need a rhythm you can keep in the weeks when the shop is busy.",

    `Bursts don't work for a small business. You post every day for four days, then a big order lands and the feed goes quiet for three weeks. A loop keeps the effort small and predictable, so Monday never starts with "what do I even post today?"`,

    'The times below are our rough guide for one person doing everything.',

    {
      type: 'table',
      caption: 'The 30-day loop at a glance',
      head: ['Week', 'The job', 'Rough time', 'You end with'],
      rows: [
        ['Week 1', 'Pick one emotional zone: money stress, career drift or family weight', '30 minutes', 'One theme, in one sentence'],
        ['Week 2', 'Write the core question and its funnel, then test it on two people', 'An hour', 'A question card with follow-ups'],
        ['Week 3', 'Go out and record three to five useful chats', 'Two hours on the street', 'Raw clips and signed releases'],
        ['Week 4', "Transcribe, tag by emotion and stack next month's posts", 'Two to three hours', 'A batch of posts, ready to schedule'],
      ],
      rowHeaders: true,
    },

    'Week three is about language with tension in it, not random noise. If a chat gives you only polite answers, thank the person and move on.',

    { type: 'h3', id: 'on-the-street', text: 'What a street session looks like' },

    "The street session is the only part that needs nerve, so plan it like an errand. Pick two spots close together, say a market lane and the footpath outside a busy café, and go when people aren't rushing. Stand so the light is on faces and the traffic is behind the camera.",

    {
      type: 'script',
      id: 'script-opening-an-approach',
      title: 'A plain way to open',
      context: 'Say who you are before you ask anything. Consent comes before the camera rolls.',
      lines: [
        { speaker: 'Host', text: "Hi, sorry to stop you. I run a small coffee brand and we're asking people one quick question for a video. Have you got a minute?" },
        { direction: 'If they hesitate, thank them and let them go. If they say yes, carry on.' },
        { speaker: 'Host', text: 'Are you okay being filmed? The video may go on our Instagram page.' },
        { direction: 'Start recording, ask the surface question, and follow the funnel from there.' },
        { direction: 'After the chat, get the release signed on the spot and note where the video will appear.' },
      ],
    },

    'Expect more refusals than yeses. People have buses to catch, and a no is never about you. Keep each chat short: three questions, a follow-up or two, a thank-you. If someone is clearly uncomfortable, stop, and delete the clip if they ask.',

    { type: 'h3', id: 'change-one-thing', text: 'Change one driver at a time' },

    'You can rotate the lens or the theme inside this loop without losing the pattern. One month, stay in a money-coded zone where people talk about staying afloat. The next, move to career tension, where people are split between what looks safe and what feels right. After that, try relationships: how much of life runs on looking okay from outside.',

    'Change one thing at a time: the question set or the emotional theme, never both.',

    "Shift ten things at once and you'll have no idea what worked.",

    { type: 'h3', id: 'rough-but-clear', text: 'Rough but clear beats polished and lifeless' },

    "Don't over-polish this format. If the sound is decent, the frame works and the answer lands, post it. Buying gear feels productive, which is why it's so easy to hide behind. The one purchase we'd make early is a small mic, because viewers forgive a shaky frame long before they forgive muddy sound.",

    { type: 'h3', id: 'audience-writes-next-month', text: "Let the audience write next month's question" },

    'A feedback loop is built in if you pay attention. Watch which clips get comments with personal stories, which get saved and which get quoted back to you. Notice which answers pull DMs from people who never usually talk.',

    'Reply early, while people are still in the thread. That is our habit, not a platform rule.',

    "Those signals shape your next month. The street gives you the first set of words, and your audience gives you the next. Posting on a steady rhythm also gives you more chances to learn. Instagram's Trial Reels show a cut to non-followers first, which is a cheap way to test two hooks from the same chat[^trial-reels].",

    'After two or three months you have more than a folder of clips. You have a working map of what your customers worry about and what they keep pretending is fine. That map is hard for a competitor to copy.',

    { type: 'h2', id: 'diy-or-a-crew', text: 'Should you do it yourself or bring in a crew?', toc: 'DIY or a crew' },

    "Both routes work. Doing it yourself teaches you your customers' words first-hand and costs mostly time. A crew makes sense when you need volume, a dedicated interviewer and consistent editing, or when your own hours are worth more elsewhere.",

    "Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. So we aren't neutral here, and we'd rather say so. We still think every founder should run a few street chats themselves.",

    "Nothing teaches you a buyer's language faster.",

    'The trade-off is mostly time against money, and learning against scale.',

    {
      type: 'table',
      caption: 'Doing it yourself vs bringing in a crew',
      head: ['What it takes', 'Doing it yourself', 'Bringing in a crew'],
      rows: [
        ['Money', 'A phone and a small mic', 'A package fee, plus GST where applicable'],
        ['Your time', 'About two hours a week', 'A brief, consolidated feedback and review checkpoints'],
        ['Who asks', 'You or a teammate', 'An interviewer who handles the approach and follow-ups'],
        ['Volume', 'Three to five chats a month', 'A planned batch of 5, 10 or 20 videos'],
        ['Variety', 'One question and one funnel', 'Different mechanisms across the batch'],
        ['Best for', "Learning your customers' language", 'Scale and consistency once the habit works'],
      ],
      rowHeaders: true,
    },

    'If you go the crew route, our packages are 5 videos for ₹50,000 (₹10,000 each), 10 for ₹85,000 (₹8,500 each) and 20 for ₹1,50,000 (₹7,500 each). Each package is for one brand and fully prepaid, and GST is extra where applicable. [Our pricing page](/pricing) has the details, and [what vox pop videos cost in India](/blog/vox-pop-video-cost-india) compares the options.',

    "Before each shoot we lock the objective, products, audience and must-haves. We plan the question, the setup, who we approach, the follow-up and the edit. What we can't control is exactly how a stranger will respond in the moment.",

    'You can also see the format on your own product before you commit. With [our trial](/trial), the scope, the number of trial videos and any fee are confirmed in writing. Trial videos are for evaluation only, so they cannot be published.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'Rules that apply either way',
      text: 'Whoever holds the phone, a few rules stay the same. This is general information, not legal advice.',
      items: [
        "Get a signed release from everyone you feature, and tell them where the video will appear. India's data protection rules come into force in phases through 2027, so have a lawyer check your form[^dpdp-rules].",
        "Metro premises aren't open for casual filming. Bengaluru's Namma Metro wants a shoot application 30 days ahead and charges a licence fee[^bmrcl-shoots]. Malls are private property, so ask management first.",
        "If anyone on camera is paid, works for you or was cast, India's endorsement guidelines expect you to say so clearly[^endorsement-guidelines]. That includes staff and friends.",
        "Don't film anyone under 18 without a parent's written consent.",
        '[Filming street interviews in India](/blog/street-interview-consent-india) covers consent in full.',
      ],
    },

    { type: 'cta', text: 'Want to see the format on your own product before you decide?' },

    { type: 'h2', id: 'your-first-month', text: 'Your first month, week by week', toc: 'Your first month' },

    'Start this week with one move: pick one lens, write one question funnel and record five honest answers, then turn them into a week of posts. The calendar below spreads that over 30 days, with a checklist to tick as you go.',

    {
      type: 'widget',
      widget: 'timeline',
      id: 'first-30-days',
      props: {
        title: 'Your first 30 days',
        intro: 'Built for one person with a phone and about two hours a week. Move the days around, but keep the order.',
        items: [
          { when: 'Days 1 to 7', title: 'Pick the theme and the lens', text: 'Choose one emotional zone and one lens: a city, a neighbourhood or a type of customer.', tasks: ['Write the theme in one sentence', 'Note three lines you already hear from customers'] },
          { when: 'Days 8 to 11', title: 'Write the funnel', text: 'Use the funnel builder above to draft surface, pressure and identity questions, each with a follow-up.', tasks: ['Read each question aloud', 'Cut anything that needs a second breath'] },
          { when: 'Days 12 to 14', title: 'Test it and prepare', text: 'Ask two people who know nothing about the plan. If either says "what do you mean?", rewrite the question. Then get the kit and the release form ready.', tasks: ['Charge the phone and a power bank', 'Test the mic on a noisy street'] },
          { when: 'Days 15 to 21', title: 'Record', text: "Pick one day and spend about two hours on the street, at two spots close together, when people aren't rushing. Aim for three to five useful chats, and expect plenty of polite refusals." },
          { when: 'Days 22 to 25', title: 'Transcribe and tag', text: 'Put every chat into text. Tag each strong line by emotion first and topic second.' },
          { when: 'Days 26 to 28', title: 'Build the batch', text: 'Run your best three lines through the five-post outline. Cut the clips and write the captions.' },
          { when: 'Days 29 and 30', title: 'Schedule and choose', text: 'Schedule the batch across month two, and reply to comments early once it goes out. Pick the one thing you will change next time: the question set or the theme.' },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'checklist',
      id: 'month-one-checklist',
      props: {
        title: 'Month-one checklist',
        intro: 'Tick as you go. Your ticks are saved on this device only.',
        items: [
          { id: 'theme', text: 'One emotional theme, written in one sentence' },
          { id: 'lens', text: 'One lens chosen: a city, a neighbourhood or a type of customer' },
          { id: 'funnel', text: 'A surface, pressure and identity question, each with a follow-up' },
          { id: 'tested', text: 'The funnel tested on two people who know nothing about it' },
          { id: 'release', text: 'A release form ready and checked by a lawyer', detail: 'Tell people where the video will appear before they sign.' },
          { id: 'kit', text: 'Phone charged, mic tested, power bank packed' },
          { id: 'chats', text: 'Three to five useful chats recorded' },
          { id: 'line-bank', text: 'Every chat transcribed into your line bank' },
          { id: 'tags', text: 'Strong lines tagged by emotion, then topic' },
          { id: 'outlines', text: 'Five post outlines drafted for each of your best lines' },
          { id: 'review', text: 'Batch scheduled and one change picked for the next loop' },
        ],
        done: 'Month one is done. Keep the theme or change one thing, and go again.',
      },
    },

    'One thing to do this week: write one question about the moment your product gets used, not about the product. Ask three customers. If any of them answers with a story, you have the start of your funnel.',

    'And one question to sit with: which line do your customers keep saying that your feed has never said back to them?',
  ],

  faqs: [
    {
      q: 'Can a small business shoot street interviews on a phone?',
      a: 'Yes. A recent phone that shoots vertical video is enough for street interviews, as long as the sound is clear. Buy a small clip-on or wireless mic before anything else, keep light on faces and stand so traffic noise is behind the camera. Viewers forgive a shaky frame far sooner than muddy audio, so post once the sound is clean and the answer lands.',
    },
    {
      q: 'How many street interviews does a small brand need each month?',
      a: 'Three to five useful chats from one session a month is enough for a small brand starting out. Use one core question and its funnel, and expect to approach many more people than that, because plenty will say no or give one-word answers. Five honest answers, each worked into several posts, can fill a month on a steady posting rhythm.',
    },
    {
      q: 'What if my product is niche?',
      a: "Ask about the moment, not the product. A niche product still sits inside a common moment: a morning, a commute, a workout, a gift, a guest arriving. Write the surface question about that moment and bring the product in at the pressure or identity step. Orgaheal's library video, for example, is titled 'Amount Of Protein': a category question, not a product name.",
    },
    {
      q: 'How do I turn one street interview clip into several posts?',
      a: "Pull the strongest line and give it up to five jobs: a hook, an opinion post, a teaching post, a contrast post and a soft-sell post. Five is our rule of thumb, not a law. A line that can carry all five is deep enough to build a week around. A line that can only carry a hook still makes a good hook.",
    },
    {
      q: 'Should I sort street interview clips by topic or by emotion?',
      a: 'Sort by emotion first and topic second. Topic folders such as career or money get crowded fast and say little about what a line can do. Tag each line with one feeling (fear, pride, shame, want, confusion or relief), then add the topic. The emotion tells you which post a line can carry, and the topic helps you find it again.',
    },
    {
      q: 'Do I need a big following before I start?',
      a: "No. The words you collect are useful at any size: in captions, product pages, WhatsApp replies and ads. Instagram's Trial Reels show a reel to non-followers first, a cheap way to test two hooks from one street interview. Since mid-2025 they've been open to public accounts with at least 1,000 followers[^trial-reels]. Below that, post normally and read the comments closely.",
    },
    {
      q: 'How do I avoid feeling awkward on camera?',
      a: 'Stay behind the phone at first. The person answering is the subject, so you can hold the phone, ask from just off-camera and keep your face out of it. Bring a friend to hold the phone or the mic, start every chat with the easy surface question, and accept that the first few approaches feel strange. They get easier once someone laughs.',
    },
    {
      q: 'When is it worth hiring a crew for street interviews?',
      a: "When the habit works but you've become the bottleneck: you want more videos than your weekends allow, a dedicated interviewer, consistent editing, or your own hours back. Kreators.Army packages run from 5 to 20 videos for one brand, prepaid, with GST extra where applicable. A trial lets you see the format on your own brand before you commit.",
    },
  ],

  sources: [
    {
      id: 'pwc-india-2024',
      title: 'Voice of the Consumer Survey 2024, India (press release)',
      url: 'https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html',
      publisher: 'PwC India',
      date: '2024-07',
      note: 'CLAIMS S17/E13: 77% discover brands on social media, 81% check reviews there, least-trusted channel.',
    },
    {
      id: 'iamai-short-video',
      title: "India's internet user base tops 950 million as rural growth, AI drive adoption",
      url: 'https://www.businesstoday.in/technology/news/story/indias-internet-user-base-tops-950-million-as-rural-growth-ai-drive-adoption-513353-2026-01-29',
      publisher: 'Business Today, on the IAMAI and Kantar Internet in India 2025 report',
      date: '2026-01-29',
      note: 'CLAIMS E15: about 588 million short-video viewers in 2025; rural 302 million, urban 286 million.',
    },
    {
      id: 'exemplification',
      title: 'The Utility of Exemplars in Persuasive Communications',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research (Brosius and Bathelt)',
      date: '1994',
      note: 'CLAIMS E06: individual cases sway judgments more than base-rate statistics. Title checked against Crossref.',
    },
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications (Kathleen Beckers), De Gruyter Brill',
      date: '2022',
      note: 'CLAIMS R11/E04: vox pops rated less trustworthy than an expert with poll data, yet moved personal opinion more. Author and issue (47:1, 2022) checked against Crossref; quote is [indexed], confirm in a browser.',
    },
    {
      id: 'beckers-2017',
      title: 'How Ordinary is the Ordinary (Wo)man on the Street?',
      url: 'https://doi.org/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice (Kathleen Beckers)',
      date: '2017',
      note: 'CLAIMS E07: 2,000 Flemish TV vox pops; minorities rarely shown. Title, author and DOI checked against Crossref (CLAIMS listed it as Beckers and Walgrave via an informahealthcare URL).',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion Balance in Vox Pop Television News',
      url: 'https://doi.org/10.1080/1461670X.2016.1187576',
      publisher: 'Journalism Studies (Beckers, Walgrave and Van den Bulck)',
      date: '2018',
      note: 'CLAIMS E08: most vox pop news items present only one point of view. DOI found via Crossref; replaces the Drexel portal link.',
    },
    {
      id: 'mirroring',
      title: 'Never Split the Difference (book summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'CLAIMS P08: mirroring, popularised by Chris Voss.',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram Shares Algorithm Insights To Inform Strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'CLAIMS P02/E22: "The top three signals that matter most for ranking are watch time, likes and sends." Also quotes Mosseri: "sends are slightly more important for unconnected content." Both read on the page by the editor.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram Trial Reels Are Now Available to More Creators',
      url: 'https://www.socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025-07-13',
      note: 'CLAIMS E23: Trial Reels show a reel to non-followers first; now open to creators with at least 1,000 followers and a public account. Read on the page by the editor.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI, via The Week',
      date: '2025-11-14',
      note: 'CLAIMS P07: DPDP Rules notified November 2025; consent and notice duties phase in through 2027.',
    },
    {
      id: 'bmrcl-shoots',
      title: 'Bengaluru: After 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023-11-25',
      note: 'CLAIMS P06: Namma Metro shoots need an application 30 days ahead (Indian nationals) and a licence fee. Read on the page by the editor.',
    },
    {
      id: 'endorsement-guidelines',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose any material connection with labels such as "advertisement", "sponsored" or "paid promotion".',
    },
  ],

  related: ['vox-pop-strategy-for-indian-brands', 'vox-pop-questions', 'how-to-edit-vox-pop-videos', 'vox-pop-mofu-content-strategy'],
};

export default post;
