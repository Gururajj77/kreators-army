import type { Post } from '../types';
import meta from './eleven-ways-to-vary-a-vox-pop-batch.meta';

const post: Post = {
  meta,

  answer:
    'Good vox pop video ideas vary what people are asked to do, not where you film. Kreators.Army plans each video in a batch around one of eleven mechanisms: guessing and reveals, A/B comparisons, challenges, rankings, debates, personal experiences, product reactions, humour, unexpected questions, audience participation or a different follow-up structure. Each video also gets one main job.',

  takeaways: [
    'Variety in a vox pop batch comes from the mechanism, meaning what the person on camera is asked to do. A new location changes the background, not the video.',
    'Give every video one main job, such as creating curiosity or building social proof, then pick the mechanism that suits that job.',
    'Five videos should mean five mechanisms. At 10 or 20, repeat the strongest ones with a new product, question or follow-up.',
    'Every mechanism has a trap. A guess fails when the answer is obvious, and a debate fails when nobody really disagrees.',
    'Write the follow-up before the shoot day. The answer worth keeping often comes after the second question, not the first.',
  ],

  body: [
    '"Will every video look different?" It\'s one of the real questions on our FAQ page, and it\'s a fair worry. You\'re paying for a batch of five, ten or twenty videos. Nobody wants twenty clips of strangers saying "nice" to the same product.',

    'Our answer is the mechanism. A [mechanism](/blog/vox-pop-glossary#mechanism) is what the person on camera is asked to do: guess, choose, rank, argue, remember or react. Change it, and the same footpath gives you a different video.',

    'Below are the eleven we plan batches with. Each comes with three prompts for D2C products, the move that makes it work, a library video where we have one, and its trap. Then we plan batches of 5, 10 or 20.',

    // ---------------------------------------------------------------- Variety
    { type: 'h2', id: 'variety-without-a-new-set', text: 'How do you vary a batch without a new set every time?', toc: 'Variety without a new set' },

    'Give each video its own mechanism and its own job. The street can stay the same. What changes is the game the person is invited into, and that is the part a viewer remembers.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a [short street interview](/blog/what-is-vox-pop-content). A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. In a batch of five, we avoid repeating the same question or interaction. Each video gets its own mechanism, so it has its own identity, and the shoot stays efficient.',

    'The alternative is to treat every video as a separate production, with a new location, a new set and a new crew call. On a mood board, that looks like variety.',

    "We think it mostly isn't.",

    'Viewers rarely remember whether a clip was filmed outside a metro exit or a bakery. They remember that someone guessed a price, picked a side or lost to a tongue twister.',

    {
      type: 'comparison',
      title: 'Two ways to make a batch feel varied',
      left: {
        label: 'A new set for every video',
        items: ['A new location, set and crew call each time, at more cost per video', 'The same question can still repeat underneath'],
      },
      right: {
        label: 'A new mechanism for every video',
        items: ['One planned shoot, many kinds of interaction', 'Each video asks people to do something different', 'Visual variety from people, framing and corners of one area'],
      },
      verdict: 'We plan variety from the mechanism first, then add visual variety on top.',
    },

    'Visual variety still matters. It comes from the people, the backgrounds, the framing and different corners of one neighbourhood. Anything bigger, like a special location or a large prop, gets agreed in pre-production.',

    {
      type: 'callout',
      tone: 'note',
      title: 'Where the mechanism sits',
      text: 'Every street interaction we plan has six parts: setup, question, participant, follow-up, reaction and edit. The mechanism lives mostly in the setup and the question, but it changes what you need from the other four.',
      items: [
        'A guessing game needs a clean reveal in the edit.',
        'A debate needs two people who really disagree, so casting matters.',
        'A product reaction needs the product in their hands.',
        'A follow-up structure needs a host who can listen and wait.',
      ],
    },

    // ---------------------------------------------------------------- The eleven
    { type: 'h2', id: 'the-eleven-mechanisms', text: 'Which vox pop video ideas can a brand use?', toc: 'The eleven mechanisms' },

    'Start from eleven mechanisms. Each asks the person on camera to do something different, so a batch that mixes them reads as a series rather than one video posted five times.',

    { type: 'mechanisms', caption: 'The eleven mechanisms a batch can mix. Each video leads with one.' },

    'The short version first.',

    {
      type: 'table',
      caption: 'The eleven mechanisms at a glance',
      head: ['Mechanism', 'What it creates', 'The move behind it', 'The trap'],
      rowHeaders: true,
      rows: [
        ['Guessing and reveals', 'Curiosity until the reveal', 'Question on screen, reveal last', 'An answer anyone could guess'],
        ['A/B comparisons', 'Side-picking, on the street and at home', 'Cut clashing answers back to back', 'A rigged choice'],
        ['Challenges', 'Play and a visible attempt', 'Start low-stakes and a bit silly', 'A task that embarrasses people'],
        ['Rankings', 'Priorities, said out loud', 'Ask why the last one is last', 'Too many items'],
        ['Debates and opposing opinions', 'Disagreement that pulls viewers in', 'A mild question people split on', 'A real controversy, or a staged fight'],
        ['Personal experiences', 'Recognition: "that\'s me"', 'Start with an easy memory', 'Going too heavy, too soon'],
        ['Product reactions', 'A first try, doubts included', 'Ask about the hesitation, not the praise', 'Treating a reaction as proof'],
        ['Humour and playful interactions', 'Laughter with a truth inside it', 'Let the joke land, then ask one more', 'Laughing at people, not with them'],
        ['Unexpected questions', 'An answer nobody rehearsed', '"Does this remind you of anything?"', 'Random for the sake of random'],
        ['Audience participation', 'A job for the viewer', 'End on a task the viewer can finish', 'Engagement bait'],
        ['Different follow-up structures', 'Depth or speed from one question', 'Three questions deep, or rapid fire', 'An interrogation'],
      ],
    },

    'Read the third column twice. A mechanism without its move is a gimmick.',

    // ---------------------------------------------------------------- 1
    { type: 'h2', id: 'guessing-and-reveals', text: '1. Guessing and reveals' },

    'A guessing video asks people to predict something, such as a price, an ingredient or a smell, and holds the answer back until the end. The gap between the guess and the reveal is the video.',

    'What you get is curiosity, twice over. The person on the street wants to know if they were right. So does the viewer, who usually has a guess of their own by the second answer.',

    {
      type: 'list',
      items: [
        '**Snacks:** "What do you think one packet of this costs?" Reveal the price, then ask whether it changes anything.',
        '**Fragrance:** "Smell this. Candle, room spray or perfume?" Reveal what it is only after three people have guessed.',
        '**Pre-owned furniture:** "How old do you think this chair is?" Reveal its age and where it came from.',
      ],
    },

    'The move is about holding back.',

    'Don\'t put the answer in the opening. Keep the question on screen for the whole video, so the viewer always knows what is still open. Cut from one guesser to the next before anyone is told, and reveal once, at the end.',

    'Ask for one number, not a range. "Somewhere in the middle" gives the edit nothing to land on. A firm guess can sit on screen next to the real price, and the gap between them does the work.',

    'The idea is often credited to Bluma Zeigarnik\'s 1927 study in Berlin, which suggested people remember unfinished tasks better. That memory effect hasn\'t held up: a 2025 meta-analysis found no memory advantage for unfinished tasks, only a tendency to go back and finish them[^zeigarnik-meta]. Treat the open loop as editing craft, not brain science.',

    { type: 'video', brand: 'CircleStore', title: 'Guess The Price', nth: 1, caption: 'CircleStore, "Guess The Price". The question is the title, and it is one of seven guess-the-price cuts in our library.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: an answer anyone could guess',
      text: 'If the first three people get it right, there is no gap left to close and the reveal lands flat. Test the question on two colleagues first. And never fudge the reveal: the price or fact you show must be the real one.',
    },

    // ---------------------------------------------------------------- 2
    { type: 'h2', id: 'ab-comparisons', text: '2. A/B comparisons' },

    'An A/B comparison puts two options in front of someone and asks them to pick one and say why. It is the fastest mechanism to answer, which makes it a good opener for people on their way somewhere.',

    'The payoff is side-picking. The person on camera picks a team in a second, and the viewer does too. Once two answers clash, the video stops being an interview and turns into a vote.',

    'It takes very little to make a team.',

    'In Henri Tajfel\'s 1970s experiments, boys split into groups by something as trivial as a painting preference still gave more rewards to their own group[^minimal-groups]. A label as small as "salt" or "sweet" can be enough to make a viewer feel like a "we".',

    {
      type: 'list',
      items: [
        '**Bakery:** "Salt or sweet for your evening snack?" Then hand over one of each.',
        '**Footwear:** "Laces or slip-ons for a Monday?" Let people point at their own feet.',
        '**Coffee:** "Filter coffee or cold brew, if you could only have one for a year?"',
      ],
    },

    'The move happens in the edit. Cut two or three clashing answers back to back, and put the person who is completely sure next to the person still deciding. The viewer starts working out which one they are.',

    { type: 'video', brand: 'BreadBerry', title: 'Salt Vs Sweet', caption: 'BreadBerry, "Salt Vs Sweet". The whole question fits in three words.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: a rigged choice',
      text: 'If option B is a strawman, people can tell, and so can viewers. Pick two options that real people split on. Then plan for "both", because someone will say it. Have the follow-up ready: "If you had to give one up?"',
    },

    // ---------------------------------------------------------------- 3
    { type: 'h2', id: 'challenges', text: '3. Challenges' },

    'A challenge gives the person a small task to try on camera: a tongue twister, a blind taste test, a ten-second pitch. The attempt is the video, and a failed attempt is often funnier than a clean win.',

    'Challenges create play. People drop the polite camera voice when they are busy doing something. They laugh at themselves, argue with the rules and forget to perform.',

    'Our library has a run of them from CircleStore, with titles such as "Pitch To Win" and "Sell To Keep". In each one, the title names the task.',

    {
      type: 'list',
      items: [
        '**Bread or snacks:** a blindfold test. "Which one is the whole wheat?"',
        '**Pre-owned goods:** "You have ten seconds to sell me this lamp. Go."',
        '**Kitchenware:** "Open this jar with one hand while I time you."',
      ],
    },

    'Build play before the real task. Open with something low-stakes and slightly absurd, and let the host be the first to look a little silly. A stiff host gets stiff answers. Try the silliest version of the challenge as a warm-up, go along with whatever the person does, and only then bring in the product.',

    'Keep the warm-up footage. It can make a better [street interview hook](/blog/street-interview-hooks) than the challenge itself.',

    { type: 'video', brand: 'Hackdaily', title: 'Hindi Tongue Twister', caption: 'Hackdaily, "Hindi Tongue Twister". The challenge is right there in the title.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: a task that embarrasses people',
      text: 'A challenge should be hard enough to be fun and easy enough to try, and nobody should walk away feeling stupid. Nothing should mock an accent, a language or a body. For any taste test, ask about allergies before the blindfold goes on.',
    },

    // ---------------------------------------------------------------- 4
    { type: 'h2', id: 'rankings', text: '4. Rankings' },

    'A ranking hands someone three to five things and asks them to put them in order. People rank fast, then defend their order, and the defence is where the opinions come out.',

    'You get priorities, said out loud, and viewers rank along in their heads.',

    {
      type: 'list',
      items: [
        '**Snacks:** "Rank these four tea-time snacks, best to worst."',
        '**Home goods:** "Rank these five by what you\'d pack first when you move flats."',
        '**Personal care:** "Rank your morning routine, from the step you\'d never skip to the one you\'d drop first."',
      ],
    },

    'Ask about the bottom, not the top. "Why is that one last?" gets a sharper answer than "Why is that one first?", because people have rehearsed what they like. They haven\'t rehearsed what they\'d cut. Keep it to five items at most, on cards or a tray, so the person can see them all at once.',

    'A ranking is also the easiest way to show several of your own products in one video: four flavours, one tray. If all four are yours, one of them will come last on camera. Decide before the shoot that you can live with that.',

    'Our library has no clear ranking video yet, so here is how we would set one up.',

    {
      type: 'script',
      id: 'script-ranking',
      title: 'A ranking, set up on a tray',
      context: 'Illustrative, written for this guide. The tray stays in the shot.',
      lines: [
        { direction: 'The host lays four snack packs on a tray, in no particular order.' },
        { speaker: 'Host', text: 'Four tea-time snacks. Put them in order, best to worst. No wrong answers.' },
        { direction: 'Let them move the packs themselves. Keep their hands in frame.' },
        { speaker: 'Host', text: 'Why is that one last?' },
        { direction: 'Hold the silence after the answer. Do not nod or fill it.' },
        { speaker: 'Host', text: 'Who do you know who would put it first?' },
      ],
    },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: too many items',
      text: 'Past five, people stop ranking and start guessing, and the clip drags. The other trap is a ranking built so your product always wins. If it can\'t come last, don\'t ask.',
    },

    // ---------------------------------------------------------------- 5
    { type: 'h2', id: 'debates-and-opposing-opinions', text: '5. Debates and opposing opinions' },

    'A debate video asks a question two reasonable people can disagree on, then puts the disagreement side by side. The mild ones work best: everyday habits, money, manners and food.',

    'Disagreement pulls viewers in, and the ones who disagree with a stranger often want to say so.',

    'Even TV news struggles with balance. In a study of 2,000 Belgian TV vox pops, a large majority of news items showed only one point of view[^opinion-balance]. For a brand, one-sided agreement is the least interesting cut you can make.',

    {
      type: 'list',
      items: [
        '**Apparel:** "Is it fine to repeat an outfit in the same office week?"',
        '**Pre-owned goods:** "Acceptable or not: giving a used item as a gift?"',
        '**Gifting:** "Is cash a lazy wedding gift, or the best one?"',
      ],
    },

    'The sharper version catches a contradiction. Someone says they always buy for quality, then admits they pick the cheapest option first. Leon Festinger called that clash cognitive dissonance: when what we do conflicts with what we believe, the discomfort pushes us to change one of them[^dissonance].',

    'Don\'t resolve it for the viewer. Cut around the moment the person notices the contradiction, and let the viewer finish the thought.',

    { type: 'video', brand: 'CircleStore', title: 'Acceptable Vs Taboo', caption: 'CircleStore, "Acceptable Vs Taboo". A debate framed as a verdict: acceptable, or not.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: a real controversy, or a fake fight',
      text: 'Religion, politics, caste and anything that could get a participant trolled stay out. So does staging: if two people disagree in the video, they really disagreed. And never make the person who contradicted themselves the joke.',
    },

    // ---------------------------------------------------------------- 6
    { type: 'h2', id: 'personal-experiences', text: '6. Personal experiences' },

    'A personal-experience video asks people about a memory or a habit instead of an opinion. Memories come with detail, and detail is what makes a stranger\'s answer feel like it could be yours.',

    'What it creates is recognition. The viewer hears a specific memory and thinks "that\'s me" or "that\'s my mother". Media researchers call the wider effect exemplification: one vivid person on screen sways judgments more than a percentage does[^exemplification].',

    {
      type: 'list',
      items: [
        '**Bags:** "What\'s the one thing you always carry, and since when?"',
        '**Home goods:** "What made your first rented flat feel like home?"',
        '**Snacks:** "Which snack were you never allowed as a kid?"',
      ],
    },

    'Warm up with an easy question about a memory, such as "Where did you grow up?" Ask one or two gentle follow-ups, and only then ask the real question.',

    'When the real answer comes, leave the silence alone.',

    'A stakes question works well near the end: "What would you lose if this stopped existing?" Ask it only once the person is relaxed.',

    'CircleStore has a run of these in our library, such as "The Third Place" and "Feeling Homely". Neither title names a product: the category comes first.',

    { type: 'video', brand: 'CircleStore', title: 'The Things We Carry', caption: 'CircleStore, "The Things We Carry". The title is the prompt: the everyday things people keep with them.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: going too heavy, too soon',
      text: 'A stranger owes you nothing, and a question about grief or debt on a footpath can feel like an ambush. Let people choose how deep to go. If someone goes quiet or tears up, ask whether they want to continue, and drop the clip if they\'d rather you did.',
    },

    'Six down, five to go. A quick check before the rest.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'name-the-mechanism',
      props: {
        title: 'Name the mechanism',
        intro: 'Each title is a real video in our library. Pick the mechanism it points to, then read the note.',
        questions: [
          {
            q: 'CircleStore: "Guess The Price"',
            options: [
              { text: 'Guessing and reveals', points: 1 },
              { text: 'Rankings', points: 0 },
              { text: 'Debates and opposing opinions', points: 0 },
            ],
            explain: 'A price guess is the classic reveal.',
          },
          {
            q: 'Orgaheal: "Plant Vs Whey"',
            options: [
              { text: 'Product reactions', points: 0 },
              { text: 'A/B comparisons', points: 1 },
              { text: 'Unexpected questions', points: 0 },
            ],
            explain: 'Two options and a pick. A "Vs" in a title often gives it away, but see the last question.',
          },
          {
            q: 'Hackdaily: "Red Lorry Yellow"',
            options: [
              { text: 'Challenges', points: 1 },
              { text: 'Personal experiences', points: 0 },
              { text: 'Audience participation', points: 0 },
            ],
            explain: '"Red lorry, yellow lorry" is a tongue twister, so it is a challenge first, even if it ends up funny.',
          },
          {
            q: 'Waxys: "What Does This Remind"',
            options: [
              { text: 'Guessing and reveals', points: 0 },
              { text: 'Unexpected questions', points: 1 },
              { text: 'Rankings', points: 0 },
            ],
            explain: 'The mirror question, filed under unexpected questions.',
          },
          {
            q: 'CircleStore: "Rapid Fire"',
            options: [
              { text: 'Challenges', points: 0 },
              { text: 'Debates and opposing opinions', points: 0 },
              { text: 'Different follow-up structures', points: 1 },
            ],
            explain: 'Rapid fire is a follow-up structure: many short questions, asked fast.',
          },
          {
            q: 'CircleStore: "Still Doesnt Feel Home"',
            options: [
              { text: 'Personal experiences', points: 1 },
              { text: 'Product reactions', points: 0 },
              { text: 'A/B comparisons', points: 0 },
            ],
            explain: 'A title about a feeling points to a memory or a habit rather than an opinion.',
          },
          {
            q: 'Hackdaily: "Do I Look Like I Know"',
            options: [
              { text: 'Rankings', points: 0 },
              { text: 'Humour and playful interactions', points: 1 },
              { text: 'Guessing and reveals', points: 0 },
            ],
            explain: 'A playful line as the title. Humour leads, whatever else happens in the video.',
          },
          {
            q: 'CircleStore: "Acceptable Vs Taboo"',
            options: [
              { text: 'A/B comparisons', points: 0, why: 'The "Vs" is a decoy. Acceptable or taboo is a verdict, not a preference, so people argue rather than pick.' },
              { text: 'Debates and opposing opinions', points: 1 },
              { text: 'Rankings', points: 0 },
            ],
            explain: 'A verdict on behaviour splits people, and the split is the video.',
          },
        ],
        results: [
          { min: 0, title: 'Read the titles again', text: 'Look for the verb in each title: guess, rank, pick, remember. It usually names the mechanism.' },
          { min: 5, title: 'A good eye', text: 'You can spot most mechanisms from a title. Next, plan them on purpose.' },
          { min: 7, title: 'Ready to plan a batch', text: 'You read the mechanism straight from the title. Now use the batch planner further down.' },
        ],
      },
    },

    // ---------------------------------------------------------------- 7
    { type: 'h2', id: 'product-reactions', text: '7. Product reactions' },

    'A product-reaction video puts the product in someone\'s hands, often for the first time, and films what happens. It is the most direct mechanism, and it suits physical products best: things people can taste, smell, wear or hold.',

    'You get a first try, doubts included. An honest reaction is often mixed, and mixed is believable.',

    {
      type: 'list',
      items: [
        '**Basics and innerwear:** "Feel this fabric. What\'s the first thing you notice?"',
        '**Snacks:** "Try one. What would you change about it?"',
        '**Candles:** "Smell it. Would you light this at home, or give it away?"',
      ],
    },

    'The best product moments are often not the praise. They come when someone admits they nearly didn\'t buy, or nearly didn\'t try. The FAULT line is a five-step sequence for drawing that out, and it needs people who already own something like your product.',

    {
      type: 'framework',
      id: 'fault-line',
      name: 'FAULT',
      tagline: 'The FAULT line: ask about the doubt, not the praise.',
      parts: [
        { key: 'F', name: 'Find the hesitation', text: 'Ask: "Before you bought it, was there a moment you nearly put it back?" Give them time to find it.' },
        { key: 'A', name: 'Amplify it, without judgement', text: '"What was going through your head?" Let them voice the doubt in full. Don\'t tidy it up for them.' },
        { key: 'U', name: 'Uncover what changed', text: '"So what made you go ahead?" This is the answer the whole sequence exists for.' },
        { key: 'L', name: 'Let the shift land', text: 'Say nothing after they answer. Let the camera stay on their face a beat longer than feels polite.' },
        { key: 'T', name: 'Tie it to a feeling', text: 'Ask how it felt to take the chance, not what the product does. We\'d take a feeling over a feature in any clip.' },
      ],
    },

    'When this doesn\'t work: people who have never bought the category. For them, a simple first try is the better mechanism.',

    'Doubt earns its place too. If someone says "ye sab marketing hai" (it\'s all marketing), keep it, then hand them the product and let them decide on camera. A viewer who thought the same now has someone who said it first. If the doubter stays unconvinced, the clip is still honest research.',

    'One line we hold to: a street reaction is a reaction, not proof that a product works. India\'s advertising code asks that objective claims be "capable of substantiation"[^asci-code], and a stranger\'s opinion substantiates nothing. Keep questions on taste, feel, habits and first impressions. Leave health and efficacy claims out of the answers you use.',

    { type: 'video', brand: 'Clotrio', title: 'Tag Cutting', caption: 'Clotrio, "Tag Cutting". The title names a small clothing habit, and a product reaction can start from one.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: treating a reaction as proof',
      text: 'The other version is editing out every doubt. A clip where everyone loves everything looks like an ad, because it is one. Keep a little friction in.',
    },

    // ---------------------------------------------------------------- 8
    { type: 'h2', id: 'humour-and-playful-interactions', text: '8. Humour and playful interactions' },

    'A humour video is built for a laugh: a silly premise and a host who is in on the joke. The laugh gets attention, and the line behind it is often the most honest thing anyone says.',

    'Humour drops the guard. A joke about someone\'s own life often holds a plain truth, like "my salary ends before the month does". That gets a laugh, and it could start a series for any brand that sells to people counting the days to payday.',

    {
      type: 'list',
      items: [
        '**Snacks:** "Describe this flavour to an alien in five words."',
        '**Fragrance:** "Would you wear this on a first date, or a fifth?"',
        '**Apparel:** "Give this T-shirt a better name than the one on the tag."',
      ],
    },

    'Let the joke land, then ask one more question. "Okay, but seriously, is that true?" turns a laugh into a line you can build on. The host can join in too, with care. In Aronson\'s 1966 experiment, a clearly capable quiz contestant who spilled coffee became more likeable, while the same slip made an average contestant less likeable[^pratfall].',

    'Our reading: a fumble helps a host only once people can see the host knows what they are doing.',

    { type: 'video', brand: 'Hackdaily', title: 'Do I Look Like I Know', caption: 'Hackdaily, "Do I Look Like I Know". A playful line as the title, with humour leading the video.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: laughing at people, not with them',
      text: 'Jokes about someone\'s looks, accent, region or English are out, and so is any edit that makes a participant the punchline. If they wouldn\'t laugh watching it, cut it.',
    },

    // ---------------------------------------------------------------- 9
    { type: 'h2', id: 'unexpected-questions', text: '9. Unexpected questions' },

    'An unexpected question asks something nobody has a rehearsed answer for. The pause before the answer, and the answer itself, are fresher than anything "What do you think of this?" will get you.',

    'The reward is an unrehearsed answer. Most people have a stock reply to the obvious question. Nobody has a stock reply to "If this candle were a person, who would it be?"',

    {
      type: 'list',
      items: [
        '**Fragrance:** "Close your eyes. What does this smell remind you of?"',
        '**Kitchenware:** "If this pan could talk, what would it complain about?"',
        '**Furniture:** "Who in your family would fight you for this chair?"',
      ],
    },

    'Our favourite is the mirror question: "Does this remind you of anything?" An ordinary question asks for a verdict. This one asks for a memory. A biscuit turns into a grandparent\'s kitchen, and a scent into a hostel corridor the week before exams.',

    '"It smells nice" describes the product. "It smells like my hostel" gives you a story, and the story is what you keep.',

    'The other half of the move is what you do with a surprising answer. Improvisers treat anything a scene partner gives them as an offer, and accept it instead of blocking it, an idea that goes back to Keith Johnstone\'s 1979 book _Impro_[^improv-offers]. On the street, that means dropping your next planned question when someone laughs and says something odd.',

    'Follow the odd thing.',

    { type: 'video', brand: 'Waxys', title: 'What Does This Remind', caption: 'Waxys, "What Does This Remind". The mirror question, right there in the title.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: random for the sake of random',
      text: 'A strange question that never comes back to the product or the video\'s job gives you a funny clip and nothing else. Every unexpected question should still lead somewhere you planned.',
    },

    // ---------------------------------------------------------------- 10
    { type: 'h2', id: 'audience-participation', text: '10. Audience participation' },

    'An audience-participation video gives the viewer a job: guess before the reveal, pick a side, finish a list or answer the same question in the comments. The video is built to be finished by the person watching it.',

    'It creates investment. A viewer who has guessed has a stake in the answer. The nearest research is only a loose analogy. Norton, Mochon and Ariely found that people who built an IKEA storage box would pay more for it than for an identical ready-made one, but only if they finished it[^ikea-effect]. So give viewers a task they can finish.',

    'The format also fits what Instagram says it ranks on. In January 2025, its head, Adam Mosseri, said the three signals that matter most are watch time, likes and sends[^instagram-signals]. A question people want to send to a friend suits that kind of ranking.',

    {
      type: 'list',
      items: [
        '**Snacks:** an on-screen "Pause and guess" before each reveal.',
        '**Apparel:** "Strangers picked which one they\'d wear to a wedding. Which would you?"',
        '**Home goods:** "Three people ranked these. Put your order in the comments."',
      ],
    },

    'Don\'t end with "Let me know what you think". That gives the viewer nothing to do. End with a specific task, set up earlier in the video: a guess they have been holding or a side they have already picked.',

    'Then read the replies. They are the first draft of your next batch\'s questions, and the last two steps of the creative loop we work to: learn, then improve.',

    'There is no library video for this one. Participation mostly lives in on-screen prompts and endings, which a title rarely shows.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: engagement bait',
      text: '"Comment YES if you agree" gives people a reason to tap and nothing to say. A good task has a real answer, and the person answering would be happy for a friend to see it.',
    },

    // ---------------------------------------------------------------- 11
    { type: 'h2', id: 'different-follow-up-structures', text: '11. Different follow-up structures' },

    'Sometimes the variety is in the follow-up, not the question. The same opening question, asked three questions deep, as rapid fire or with one echoed phrase, gives you three very different videos.',

    'Rapid fire gives you energy and a lot of faces. A three-deep stack gives you one person saying something they hadn\'t planned to say.',

    {
      type: 'list',
      items: [
        '**Rapid fire:** five or more short questions, a few seconds each, many people. Good for a brisk opener or a series.',
        '**The three-deep stack:** a surface question, a gentle challenge to the answer, then the belief underneath it.',
        '**Mirroring:** repeat their last few words, then wait.',
        '**One planned second question:** a single follow-up, written before the shoot, for when the first answer is a story.',
      ],
    },

    'Former FBI hostage negotiator Chris Voss popularised mirroring[^mirroring]. On the street it often gets you a second, more honest answer. The repeat sounds like interest rather than a new question, so people tend to keep going.',

    {
      type: 'script',
      id: 'script-three-deep',
      title: 'The three-deep stack, for a footwear brand',
      context: 'Illustrative, written for this guide. No product in shot until the end.',
      lines: [
        { speaker: 'Host', text: 'What do you look for when you buy shoes?' },
        { direction: 'Expect the answer they always give, such as comfort. Don\'t stop there.' },
        { speaker: 'Host', text: 'Why does comfort matter more to you than how they look?' },
        { direction: 'A light push on the reasoning, asked with curiosity. You are not arguing.' },
        { speaker: 'Host', text: 'When did comfort start mattering that much?' },
        { direction: 'Wait. If the stack works, this is the answer you keep.' },
      ],
    },

    {
      type: 'list',
      items: [
        '**Personal care:** rapid fire on routines. "Shower: morning or night? Towel: hook or chair?"',
        '**Coffee:** three deep on "How do you take your coffee?"',
        '**Furniture:** mirror the phrase people use about their sofa, such as "it\'s just there", and wait.',
      ],
    },

    { type: 'video', brand: 'CircleStore', title: 'Multiple Short Questions', caption: 'CircleStore, "Multiple Short Questions". A structure built on speed: many short questions in one video.' },

    {
      type: 'callout',
      tone: 'warning',
      title: 'The trap: an interrogation',
      text: 'The challenge in a stack is a gentle press, not a cross-examination. If the person\'s shoulders go up, step back to an easier question. And never lead the witness: "Don\'t you think it\'s overpriced?" is a script in disguise.',
    },

    'That\'s all eleven. Now try them on your own product.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'idea-shuffler',
      props: {
        title: 'Idea shuffler: eleven mechanisms, your product',
        intro: 'Type your product, its category and what people use instead. You get a prompt for every mechanism, ready to copy.',
        fields: [
          { id: 'product', label: 'Your product', placeholder: 'e.g. a millet cookie', example: 'a millet cookie' },
          { id: 'category', label: 'Its category', placeholder: 'e.g. tea-time snacks', example: 'tea-time snacks' },
          { id: 'rival', label: 'What people use instead', placeholder: 'e.g. a cream biscuit', example: 'a cream biscuit' },
        ],
        templates: [
          { text: 'Guess the price of {product}. One number, no range.', group: 'Guessing and reveals', mechanism: 'Guessing and reveals' },
          { text: 'Which are you taking home, {product} or {rival}? Why that one?', group: 'A/B comparisons', mechanism: 'A/B comparisons' },
          { text: 'Blindfold on. Which one is {product} and which is {rival}?', group: 'Challenges', mechanism: 'Challenges' },
          { text: 'Rank these four {category}, best to worst. Why is that one last?', group: 'Rankings', mechanism: 'Rankings' },
          { text: 'Is it silly to spend more on {category} than your friends do?', group: 'Debates and opposing opinions', mechanism: 'Debates and opposing opinions' },
          { text: 'What were {category} like in the house you grew up in?', group: 'Personal experiences', mechanism: 'Personal experiences' },
          { text: 'Try {product}. What is the first thing you would change?', group: 'Product reactions', mechanism: 'Product reactions' },
          { text: 'Describe {product} to your grandparents in one sentence.', group: 'Humour and playful interactions', mechanism: 'Humour and playful interactions' },
          { text: 'Does {product} remind you of anything, or anyone?', group: 'Unexpected questions', mechanism: 'Unexpected questions' },
          { text: 'On screen: "Pause. Will the next person pick {product} or {rival}?"', group: 'Audience participation', mechanism: 'Audience participation' },
          { text: 'What do you look for in {category}? Why that? When did it start mattering?', group: 'Different follow-up structures', mechanism: 'Different follow-up structures' },
          { text: 'Rapid fire on {category}: your favourite, the most overrated, the one you would never buy again.', group: 'Different follow-up structures', mechanism: 'Different follow-up structures' },
        ],
        note: 'Every prompt still needs a follow-up and one job. Say it aloud before it goes on a card, and cut anything that needs a second breath.',
      },
    },

    // ---------------------------------------------------------------- Jobs
    { type: 'h2', id: 'one-main-job-per-video', text: 'Why should each video have one main job?', toc: 'One main job per video' },

    'A short video has room for one idea. Ask it to launch a product, explain three features and push an offer, and the viewer leaves with none of them. Pick one job per video, then the mechanism that suits it.',

    'These are the six jobs we plan videos around. A video might be built to:',

    {
      type: 'list',
      items: ['Create curiosity', 'Address a specific problem', 'Generate product interest', 'Demonstrate a benefit', 'Build social proof', 'Drive consideration'],
    },

    'Here is how the jobs match the mechanisms.',

    {
      type: 'table',
      caption: 'Which mechanisms suit which job',
      head: ['The job', 'Mechanisms that suit it', 'What the viewer should leave with'],
      rowHeaders: true,
      rows: [
        ['Create curiosity', 'Guessing and reveals, unexpected questions, humour', 'A question they want answered'],
        ['Address a specific problem', 'Personal experiences, different follow-up structures', '"That happens to me too"'],
        ['Generate product interest', 'Product reactions, guessing and reveals, challenges', 'What the product is, and its name'],
        ['Demonstrate a benefit', 'Challenges, A/B comparisons, product reactions', 'One benefit they saw rather than heard'],
        ['Build social proof', 'Product reactions, rankings, personal experiences', 'Strangers who chose it in their own words'],
        ['Drive consideration', 'A/B comparisons, debates, audience participation', 'A reason to compare it with what they use'],
      ],
    },

    'Product reactions turn up under three jobs. It is the most flexible mechanism, which is exactly why batches lean on it too hard. Ration it.',

    'The planner below suggests a mix. Treat it as a starting point for the brief, not a formula.',

    {
      type: 'widget',
      widget: 'picker',
      id: 'batch-planner',
      props: {
        title: 'Batch planner',
        intro: 'Answer three questions. Your main purpose counts double. Each suggestion gives the mix for 5, 10 and 20 videos.',
        questions: [
          {
            q: 'What is this batch mainly for?',
            // Each outcome is listed twice on purpose: the main purpose counts double in the tally.
            options: [
              { text: 'Launching a new product', outcomes: ['launch', 'launch'] },
              { text: 'Showing the product in real hands', outcomes: ['proof', 'proof'] },
              { text: 'Comments, sends and a following', outcomes: ['conversation', 'conversation'] },
              { text: 'Ads we can compare against each other', outcomes: ['ads', 'ads'] },
              { text: 'Owning a conversation in our category', outcomes: ['category', 'category'] },
            ],
          },
          {
            q: 'What can a stranger do with your product on the street?',
            options: [
              { text: 'Taste, smell, wear or hold it', outcomes: ['launch', 'proof'] },
              { text: 'Compare it with what they use now', outcomes: ['ads', 'proof'] },
              { text: 'Not much: it is big, digital or a service', outcomes: ['category', 'conversation'] },
            ],
          },
          {
            q: 'Where will most of the batch run?',
            options: [
              { text: 'Our own feed, organically', outcomes: ['conversation', 'category'] },
              { text: 'Mostly as paid ads', outcomes: ['ads', 'proof'] },
              { text: 'A launch push across both', outcomes: ['launch'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'launch',
            title: 'A launch mix',
            text: 'Lead with curiosity and first reactions, then give people something to compare.',
            reasons: [
              '5 videos: guessing and reveals, product reactions, unexpected questions, A/B comparisons, challenges.',
              '10 videos: add personal experiences, humour, audience participation, a follow-up structure and a second product reaction.',
              '20 videos: all eleven once, then guessing, product reactions, A/B comparisons and challenges twice more each, plus one more unexpected question.',
            ],
          },
          {
            id: 'proof',
            title: 'A proof mix',
            text: 'Put the product in real hands and let the doubts show. Built for demonstrating a benefit and social proof.',
            reasons: [
              '5 videos: product reactions, challenges, personal experiences, A/B comparisons, a follow-up structure.',
              '10 videos: add debates, rankings, guessing and reveals, and a second product reaction and personal experience.',
              '20 videos: all eleven once, then product reactions three more times, and challenges, A/B comparisons and personal experiences twice more each.',
            ],
          },
          {
            id: 'conversation',
            title: 'A conversation mix',
            text: 'Questions people argue about and send to friends, with the product arriving later in the video.',
            reasons: [
              '5 videos: debates, A/B comparisons, humour, audience participation, personal experiences.',
              '10 videos: add rankings, unexpected questions, guessing and reveals, and a second debate and A/B comparison.',
              '20 videos: all eleven once, then debates, A/B comparisons, audience participation and humour twice more each, plus one more ranking.',
            ],
          },
          {
            id: 'ads',
            title: 'An ad-testing mix',
            text: 'Fewer mechanisms, repeated on purpose, so you can compare like with like. It is the one mix that breaks our repeat rule, and the product is on screen early in every video.',
            reasons: [
              '5 videos: product reactions, A/B comparisons, guessing and reveals, challenges, a follow-up structure.',
              '10 videos: the same five mechanisms twice, each time with a different product or question.',
              '20 videos: product reactions, A/B comparisons, guessing and challenges three times each, the other seven once, and one more follow-up structure.',
            ],
          },
          {
            id: 'category',
            title: 'A category mix',
            text: 'Habits, memories and opinions about the category, with your product as one answer. Good when the product is hard to hand over.',
            reasons: [
              '5 videos: personal experiences, unexpected questions, rankings, debates, audience participation.',
              '10 videos: add guessing and reveals, A/B comparisons, humour, a follow-up structure and a second personal experience.',
              '20 videos: all eleven once, then personal experiences, rankings, debates and unexpected questions twice more each, plus one more audience participation.',
            ],
          },
        ],
      },
    },

    // ---------------------------------------------------------------- Planning
    { type: 'h2', id: 'planning-a-batch', text: 'How do you plan a batch of 5, 10 or 20 videos?', toc: 'Planning a batch of 5, 10 or 20' },

    'Start from the jobs, give each video one mechanism, and repeat a mechanism only once you have used enough different ones. Five videos should mean five mechanisms. At ten and twenty, repeats are fine with something new each time.',

    'The rule loosens as the batch grows.',

    {
      type: 'table',
      caption: 'How we would spread mechanisms across a batch',
      head: ['Batch', 'Different mechanisms', 'Repeats', 'Jobs covered'],
      rowHeaders: true,
      rows: [
        ['5 videos', 'Five, one per video', 'None', 'Five of the six, one each'],
        ['10 videos', 'Eight to ten', 'Up to two, each with a new question', 'All six, the main one twice'],
        ['20 videos', 'All eleven', 'The strongest four or five, two or three times each', 'All six, weighted to the main objective'],
      ],
    },

    'At twenty, we would repeat on purpose. A mechanism that comes back with a new product starts to feel like a series.',

    'Our library already shows it. BreadBerry has three blindfold videos ("Blindfold Bun", "Blindfold Milk" and "Blindfold Wheat"), and CircleStore has seven cuts titled "Guess The Price".',

    'Those three sizes match [our 5, 10 and 20 video packages](/pricing). Quantities in between are quoted in writing, and every package is for one brand.',

    {
      type: 'steps',
      id: 'steps-plan-a-batch',
      title: 'Plan a vox pop batch in six steps',
      intro: 'Do this with the brief open, before anyone books a shoot day.',
      howTo: true,
      supplies: ['The brief', 'A list of the products in the batch'],
      steps: [
        { name: 'Lock the objective', text: 'Write down the primary objective, the products, the audience and the must-haves. We lock these before every shoot, and [what goes in a vox pop brief](/blog/what-goes-in-a-vox-pop-brief) covers each one.' },
        { name: 'Give every video one job', text: 'Pick from the six jobs. Put your main objective\'s job on more than one video.' },
        { name: 'Match a mechanism to each job', text: 'Use the table in the section above. In a batch of five, no mechanism appears twice.' },
        { name: 'Write the question and its follow-up', text: 'Keep the question to one breath, and write the follow-up before the shoot. Our [bank of vox pop questions](/blog/vox-pop-questions) has starting points.' },
        { name: 'Read the batch in order', text: 'Read every question aloud, one after another. If two sound alike, change the mechanism of one.' },
        { name: 'Group the shoot day by prop', text: 'Shoot the videos that share a product, a tray or a blindfold together.' },
      ],
    },

    { type: 'cta', text: 'Want to see the format on your own product before you plan a full batch?' },

    // ---------------------------------------------------------------- Several products
    { type: 'h2', id: 'several-products-in-one-batch', text: 'How do you fit several products into one batch?', toc: 'Several products in one batch' },

    'Give each video one lead product, or ask a category question with the product as the answer. Spread the range across the batch instead of squeezing it into every video.',

    'A package is for one brand, but a brand can have a whole range. The temptation is to show all of it every time: three products, two offers and a discount code in thirty seconds. Nobody takes that in.',

    {
      type: 'list',
      items: [
        '**One product per video.** Each video has a lead product, and the mechanism suits it: a reveal for the one with the surprising price, a blind test for the one that tastes different.',
        '**Category first, product as the answer.** Ask about the category, such as "What\'s in your bag for the monsoon?", and let the product arrive as the answer. It is how we approach [vox pop for physical products](/retail).',
        '**A comparison inside your range.** Two of your own products side by side, as an A/B comparison or a ranking. Nobody gets knocked, and people still pick a side.',
        '**A lead and a supporting cast.** One product leads, and the others appear only in the background or the closing shot.',
      ],
    },

    'Then check the spread. In a batch of ten with four products, each product could lead at least two videos, and the main one could lead three or four.',

    { type: 'divider' },

    'One thing to do this week: write eleven questions about your best-selling product, one per mechanism. Read them to two people who don\'t work on the brand. Keep the ones that got a story or an argument back.',

    'We control the question, the setup, who we approach, the follow-up and the edit. We can\'t control exactly how a stranger will respond in the moment. Mixing mechanisms is how we create more chances for a good one, and [how we work](/how-we-work#variety) explains the rest.',

    'If you\'d like to see the format on your own brand first, request a trial video. Scope, the number of trial videos and any fee are confirmed in writing.',
  ],

  faqs: [
    {
      q: 'How many mechanisms should one vox pop batch use?',
      a: 'As many as there are videos, up to eleven. A batch of five works best with five different mechanisms, so no two videos ask people to do the same thing. A batch of ten can use eight to ten mechanisms. A batch of twenty can use all eleven and repeat the strongest few with new products, questions or follow-ups.',
    },
    {
      q: 'Can we repeat a vox pop mechanism that worked?',
      a: 'Yes, once the batch is big enough. In a batch of five, a repeat costs you a mechanism you have not tried. In a batch of ten or twenty, repeating a mechanism with a new product, question or follow-up can turn it into a recognisable series. Change one thing each time, so you learn which part made it work.',
    },
    {
      q: 'Do we need a new location for every vox pop video?',
      a: 'No. Variety comes mainly from the mechanism and the people, not the backdrop. Different participants, backgrounds, framing and corners of the same area give each video its own look. Because we batch-shoot, a special location or a large prop is agreed in pre-production, not improvised on the day.',
    },
    {
      q: 'Which vox pop mechanism suits a new product launch?',
      a: 'We would lead a launch with guessing and reveals, product reactions and unexpected questions. A guess builds curiosity before people know what the product is. A first-try reaction shows the product in real hands. An unexpected question, finds the words people use for something they have never seen before.',
    },
    {
      q: 'Which mechanisms suit ads rather than organic posts?',
      a: 'For ads, product reactions, A/B comparisons and guessing and reveals tend to suit, because the product is on screen early and the setup is clear in a second. Organic posts have more room for debates, personal experiences and humour, where the product can arrive later. Neither list is fixed, and nobody can promise how a video performs, so test both.',
    },
    {
      q: 'Can one vox pop video use two mechanisms?',
      a: 'Yes, but one should lead. A guessing game can end with a quick A/B choice, and a challenge often turns funny on its own. Trouble starts when two mechanisms compete for the ending, such as a reveal and a debate that both want the last word. Decide which one is the main mechanism, and let the other support it.',
    },
    {
      q: 'How do you keep a batch of 20 vox pop videos varied?',
      a: 'Use all eleven mechanisms at least once, then repeat the strongest four or five, each time with a new product, question or follow-up structure. Before the shoot, read the full list of questions aloud in order, and change any two that sound alike.',
    },
    {
      q: 'What are good vox pop video ideas for a D2C brand?',
      a: 'Good vox pop video ideas give people something to do with the product: guess its price, pick it against an alternative, try it blindfolded, rank it, or say what it reminds them of. Questions about habits and memories suit brands whose product is hard to hand over on the street. Give each idea one mechanism and one job.',
    },
  ],

  sources: [
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications (Ghibellini and Meier)',
      date: '2025',
      note: 'CLAIMS.md R01 (corrected): no memory advantage for unfinished tasks, only a tendency to resume them.',
    },
    {
      id: 'minimal-groups',
      title: 'Minimal group paradigm',
      url: 'https://en.wikipedia.org/wiki/Minimal_group_paradigm',
      publisher: 'Wikipedia',
      note: 'CLAIMS.md R04 (verified): Tajfel, 1970s; trivially formed groups favoured their own members.',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion Balance in Vox Pop Television News',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies 19(2) (Beckers, Walgrave and Van den Bulck)',
      date: '2018',
      note: 'CLAIMS.md E08: in a sample of 2,000 Flemish TV vox pops, a large majority of news items present one point of view.',
    },
    {
      id: 'dissonance',
      title: 'Cognitive dissonance',
      url: 'https://en.wikipedia.org/wiki/Cognitive_dissonance',
      publisher: 'Wikipedia',
      note: 'CLAIMS.md R06 (corrected): Festinger 1957; discomfort motivates changing a belief or a behaviour.',
    },
    {
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research (Brosius and Bathelt)',
      date: '1994',
      note: 'CLAIMS.md E06: individual cases sway judgments more than base-rate statistics.',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS.md 5.8: objective claims "should be capable of substantiation"; testimonials do not substantiate efficacy.',
    },
    {
      id: 'pratfall',
      title: 'Pratfall effect',
      url: 'https://en.wikipedia.org/wiki/Pratfall_effect',
      publisher: 'Wikipedia',
      note: 'CLAIMS.md R02 (corrected): Aronson, Willerman and Floyd, 1966; the blunder helped only the highly capable contestant.',
    },
    {
      id: 'improv-offers',
      title: 'Improv Glossary',
      url: 'https://www.hooplaimpro.com/?p=1866',
      publisher: 'Hoopla Impro',
      note: 'CLAIMS.md R15 (verified): offers and blocking, from Keith Johnstone, Impro (1979).',
    },
    {
      id: 'ikea-effect',
      title: 'IKEA effect',
      url: 'https://en.wikipedia.org/wiki/IKEA_effect',
      publisher: 'Wikipedia',
      note: 'CLAIMS.md R05 (corrected): Norton, Mochon and Ariely, 2012; the effect disappeared when people failed to finish.',
    },
    {
      id: 'instagram-signals',
      title: 'Instagram Shares Algorithm Insights To Inform Strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'CLAIMS.md P02 (corrected): Mosseri named watch time, likes and sends as the top three ranking signals.',
    },
    {
      id: 'mirroring',
      title: 'Never Split the Difference (summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'CLAIMS.md P08 (corrected): mirroring, popularised by Chris Voss; repeat the last few words, then wait.',
    },
  ],

  related: ['vox-pop-questions', 'street-interview-hooks', 'what-goes-in-a-vox-pop-brief', 'how-to-edit-vox-pop-videos'],
};

export default post;
