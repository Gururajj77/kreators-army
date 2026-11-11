import type { Post } from '../types';
import meta from './vox-pop-questions.meta';

// 120 vox pop questions for brands, sorted by category (PLAN.md post 15). Shoot cluster, derived post: the typed question bank.
// Source: the founder's PDF, pp. 7-9 (aspiration, taboo, contrast; the stakes question; the warm-up), 37-41 and 48-50 (city lenses, as hypotheses),
// 72-80 (catalyst, DROP, Socratic stack, FAULT line, mirror, echo, pressure test, second question rule), 99-100 (surface, pressure, identity),
// 107-108 (teacher frame) and 115-116 (the absurd warm-up), rewritten. The bank's other questions are written fresh.
// Facts only from CLAIMS.md: R03, R11, R15, P07, P08, E07, E08, E23, E26 and 5.8. The seven filmed questions are content.ts INTERACTION_THREAD,
// word for word. Every exchange and answer is illustrative. Dropped: F07-F10 (the nani, ad-ran-four-months and 200-interviews stories), F14 (the
// city "patterns" told as observed), S31 and S29-S30 (p49-50 statistics), "97% fail" and every result line.

const post: Post = {
  meta,

  answer:
    'Good vox pop questions are short, open and about the person before the product. Start with an easy warm-up, ask one aspiration, taboo or contrast question, follow up with "Interesting, why though?" and save the stakes question for last. Kreators.Army’s bank of 120 street interview questions sorts them into 13 categories and 11 question types.',

  takeaways: [
    'Ask one main question per video. If you can’t say it in one breath, or someone can answer it with yes or no, rewrite it.',
    'Order matters. Warm-up first, then the real question, then the follow-up. The stakes question comes last, followed by silence.',
    'The first answer is usually the polite one. A short follow-up such as "Interesting, why though?", an echo of their words or "What flipped it?" often reaches the second.',
    'Taboo questions about money, regret or family need consent first: say the topic, let people pass, and cut whatever they ask you to cut.',
    'Test every question on three people who have never heard of your brand. If they start telling a story, it’s ready.',
  ],

  body: [
    'Search for street interview questions and you get icebreakers and prank prompts. Fine for a laugh. Not much help when you sell breakfast spreads and need five videos by the end of the month.',

    'This list is built for brands. It has 120 vox pop questions in 13 categories and 11 question types, from the throwaway warm-up to the stakes question you save for last. Seven are questions we’ve filmed, word for word. The follow-ups that reach the second answer get their own section.',

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. Everything here rests on one belief of ours: a better camera won’t save a weak question.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    'If you’re new to the format, start with [what vox pop content is](/blog/what-is-vox-pop-content) and come back with a product in mind.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'what-makes-a-good-question', text: 'What makes a good vox pop question?', toc: 'What makes a good question' },

    'A good vox pop question is short enough to say in one breath, open enough to invite a story, and about the person before it’s about the product. It has one job, and its follow-up is already written.',

    'We think the question is the product.',

    'The spot, the host and the edit all matter, but they serve whatever the question sets off. A stranger gives you a few seconds. The question decides what they do with them.',

    'Five tests decide whether a question is ready for the footpath:',

    {
      type: 'list',
      ordered: true,
      items: [
        '**One breath.** If you need a second breath to say it, it’s too long for someone on their way somewhere. Move the setup to an on-screen caption.',
        '**Open.** It can’t be answered with yes or no. "Do you like chai?" ends the chat. "What do most people get wrong about chai at home?" starts one.',
        '**About the person.** A habit, a choice, a memory or a guess. The product comes in by hand, after they’re talking.',
        '**One job.** Spark curiosity, raise a problem or show a benefit. One per video, never all three.',
        '**A follow-up ready.** It sits on the card under the question, written before the shoot day.',
      ],
    },

    'Notice what’s missing: cleverness. The seven questions we’ve filmed, further down, look almost boring on paper. That’s the point. Nobody on a footpath has time to decode a clever one.',

    'Plain doesn’t mean weak.',

    'In a 2022 experiment with TV news items, viewers trusted vox pops less than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-vs-expert].',

    'The question also sits inside a chain. Every street interaction has six parts: setup, question, participant, follow-up, reaction and edit. A strong question can’t rescue a bad setup. A weak one wastes a good one.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'question-types', text: 'What types of vox pop questions are there?', toc: 'The 11 question types' },

    'There are 11 types worth knowing: warm-up, aspiration, taboo, contrast, mirror, FAULT line, stakes, A/B, guess, rapid fire and play. Each one gets a different kind of answer, so choose the type before you write the words.',

    'We’d start with three of them, because they touch identity. An aspiration question asks who people would be without their limits. A taboo question invites what people rarely say out loud, and money is the obvious one. A contrast question lets the person answering, and the person watching, feel like insiders who know better than the crowd.',

    'The rest are tools for getting there. Here is each type with its trap.',

    {
      type: 'table',
      caption: 'The 11 vox pop question types, with an example and a trap for each',
      head: ['Type', 'What it asks for', 'Example', 'Watch out for'],
      rowHeaders: true,
      rows: [
        ['Warm-up', 'Something easy about today', '"Where are you headed right now?"', 'It’s for their nerves, not the edit'],
        ['Aspiration', 'Who they’d be without limits', '"What would you do differently if money wasn’t a problem anymore?"', 'Dreams get vague. Ask what a small version looks like.'],
        ['Taboo', 'What people rarely say aloud', '"How does your salary feel compared to where you thought you’d be?"', 'Needs consent first and an easy way to pass'],
        ['Contrast', 'The insider view against the crowd', '"What do most people get wrong about their skincare routine?"', 'Can drift into advice. Keep it on their experience.'],
        ['Mirror', 'A memory set off by a taste, smell or object', '"Does this remind you of anything?"', 'Strongest with something to hold, smell or taste'],
        ['FAULT line', 'The moment they almost didn’t', '"What almost made you put it back?"', 'Only works with people who already bought'],
        ['Stakes', 'What they’d lose or keep', '"What would you lose if this stopped existing?"', 'Ask it last, then stay quiet'],
        ['A/B', 'A quick pick between two', '"Salt or sweet?"', 'The pick is the hook. The reason is the clip.'],
        ['Guess', 'A prediction, then a reveal', '"What do you think this costs?"', 'Have the reveal ready on a card'],
        ['Rapid fire', 'Several quick picks in a row', '"Cash or UPI, save or spend?"', 'Keep each pick under three words'],
        ['Play', 'A silly or game-like prompt', '"If your sofa could talk, what would it complain about?"', 'Laugh with people, never at them'],
      ],
    },

    'If you remember one row, make it the A/B. It’s the easiest question to answer while walking, and it still leaves room for a reason.',

    { type: 'h3', id: 'fault-line-question', text: 'The FAULT line, step by step' },

    'The FAULT line goes after the hesitation. We’d rather film one honest "I almost didn’t buy it" than ten people saying they love a product, because the doubt is what a viewer on the fence recognises.',

    {
      type: 'framework',
      id: 'fault-line',
      name: 'FAULT',
      tagline: 'Ask about the moment they almost put it back.',
      parts: [
        { key: 'F', name: 'Find the hesitation', text: '"Was there a moment you almost didn’t buy this?" Most people have one. Few brands ask.' },
        { key: 'A', name: 'Amplify it, without judgement', text: '"What was the actual thought in your head?" Let the doubt be said out loud.' },
        { key: 'U', name: 'Uncover what changed', text: '"So what flipped it?" The most important question in the sequence.' },
        { key: 'L', name: 'Let the shift land', text: 'Say nothing after they answer. The camera catches the change on their face.' },
        { key: 'T', name: 'Tie it to the feeling', text: 'Say back what it felt like: "So it was about whether it was worth the risk?" Let them correct you.' },
      ],
    },

    'When this doesn’t work: people who haven’t bought anything in the category. Switch to a contrast question.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'Before you ask a taboo question',
      text: 'Money, regret and family pressure make strong clips, and they can leave real people feeling exposed. Treat consent as part of the question. Our guide to [filming consent in India](/blog/street-interview-consent-india) has the detail.',
      items: [
        'Say the topic before you record the answer.',
        'Tell them they can pass, and mean it.',
        'Never press after a no, and never film anyone who seems drunk or distressed.',
        'Cut anything they ask you to cut, even if it’s the best line.',
        'Get a signed release, and check it with a lawyer: India’s data protection rules are coming into force in phases through 2027[^dpdp-rules]. This is general information, not legal advice.',
      ],
    },

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'question-order', text: 'In what order should you ask vox pop questions?', toc: 'The order to ask them in' },

    'Warm-up first, stakes last. In between, the order is about comfort. Nobody answers a heavy question honestly when it’s the first thing a stranger says to them.',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Ground them.** Ask a warm-up question about today: where they’re headed, what they ate. It costs nothing, and they hear their own voice on camera before anything is at stake.',
        '**Raise the temperature gently.** One soft follow-up on whatever they said.',
        '**Ask the real question.** Only now, once their shoulders have dropped.',
        '**Accept the answer.** No judgement, no correcting, no visible delight either.',
        '**Ask the stakes question.** "What would you lose if this stopped existing?"',
        '**Leave the last answer alone.** Don’t nod or fill the silence. Let it land.',
      ],
    },

    'The stakes question lands harder than "What do you like about it?" for a reason. Behavioural economists estimate that a loss weighs roughly twice as much as an equal gain, though the ratio varies from person to person[^loss-aversion]. Asking what someone would lose makes them weigh the thing properly.',

    'The whole order fits in one exchange. The middle three questions follow a simple funnel: a surface question, then a pressure question, then an identity question.',

    {
      type: 'script',
      id: 'script-question-order',
      title: 'One question set, in order, for a made-up coffee brand',
      context: 'Illustrative, not a real shoot. A host near a metro exit at 8.30 am. The product stays in the bag until the second-to-last question.',
      lines: [
        { direction: 'The host smiles, keeps the mic low and says who the video is for.' },
        { speaker: 'Host', text: 'Morning. Quick one for a video. Where are you headed?' },
        { speaker: 'Participant', text: 'Office. Late, as usual.' },
        { speaker: 'Host', text: 'What do you need in the morning before your day feels usable?' },
        { direction: 'Surface question. Let them finish.' },
        { speaker: 'Host', text: 'And what ruins your morning most days?' },
        { direction: 'Pressure question. Real life comes in.' },
        { speaker: 'Host', text: 'What does your morning say about where your life is right now?' },
        { direction: 'Identity question. Wait. Do not fill the pause.' },
        { direction: 'Hand over a cup.' },
        { speaker: 'Host', text: 'Try this. Does it remind you of anything?' },
        { speaker: 'Host', text: 'If your morning coffee vanished tomorrow, what would you lose?' },
        { direction: 'Stakes question. Say nothing after the answer.' },
      ],
    },

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'questions-we-have-filmed', text: 'What do real vox pop questions sound like?', toc: 'Questions we’ve filmed' },

    'Short, plain and almost casual. These seven come word for word from our live work. Each is six words or fewer, four are A/B choices, and none names the brand behind the video.',

    {
      type: 'table',
      caption: 'Questions from our live work, with the brand and the type',
      head: ['Question', 'Brand', 'Type', 'Why it suits the street'],
      rows: [
        ['"New phone or a Goa trip?"', 'CircleStore', 'A/B', 'Two things people want, so either pick is defensible'],
        ['"Hot take on Valentine’s Day?"', 'BrandingBum', 'Contrast', 'Invites a view against the crowd, on a day everyone has one'],
        ['"Worst thing you ever bought second-hand?"', 'CircleStore', 'Play', 'Everyone has a bad-buy story, and telling it is fun'],
        ['"What does AI change about design?"', 'Ansh Mehra', 'Contrast', 'Makes the person the expert on their own field'],
        ['"Salt or sweet?"', 'BreadBerry', 'A/B', 'Three words, answered in a second, argued for longer'],
        ['"Plant protein or whey?"', 'Orgaheal', 'A/B', 'A preference anyone can hold, with no claim attached'],
        ['"Branded or unbranded?"', 'CircleStore', 'A/B', 'A value question people hold firm views on'],
      ],
    },

    'A passer-by can answer any of these before the signal turns green, and the follow-up does the digging. They ask about a trip, a taste, a bad buy or an opinion.',

    'The first one is the video at the top of this page: CircleStore’s Goa Vs Mobile.',

    'Other library titles show more shapes, and you can read the mechanism from the title alone. BreadBerry’s Blindfold Milk and Blindfold Bun are blind tests. Waxys’ Smell It And Guess is a guess. CircleStore even has one called Acceptable Vs Taboo.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Red Flag In Partner',
      caption: 'CircleStore, Red Flag In Partner. A relationship question about red flags in a partner.',
    },

    {
      type: 'video',
      brand: 'YourPlug',
      title: '2 Extra Hours',
      caption: 'YourPlug, 2 Extra Hours. An aspiration premise: what would people do with two extra hours?',
    },

    {
      type: 'video',
      brand: 'BreadBerry',
      title: 'Blindfold Milk',
      caption: 'BreadBerry, Blindfold Milk. A blind guess first, then the reveal.',
    },

    'You can [browse every street interview in our video library](/video-library) and search by brand. Watch three before you write your own set.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'questions-by-category', text: '120 vox pop questions, sorted by category', toc: 'All 120 questions' },

    'All 120 are in the bank below. Filter by category, search for a word such as "phone" or "Diwali", and copy any row. The type tells you what each question is for. Sensitive means the consent steps above apply.',

    {
      type: 'table',
      caption: '120 vox pop questions for brands, by category, type and tone',
      head: ['Question', 'Category', 'Type', 'Tone'],
      search: true,
      filterColumn: 1,
      copyColumn: 0,
      rows: [
        // Food and drink (10)
        ['What do you need in the morning before your day feels usable?', 'Food and drink', 'Warm-up', 'Light'],
        ['Salt or sweet?', 'Food and drink', 'A/B', 'Light'],
        ['Taste this blindfolded. What do you think it is?', 'Food and drink', 'Guess', 'Light'],
        ['Take one bite. Does this remind you of anything?', 'Food and drink', 'Mirror', 'Warm'],
        ['What do most people get wrong about making chai at home?', 'Food and drink', 'Contrast', 'Light'],
        ['If you opened a food stall tomorrow, what would it sell?', 'Food and drink', 'Aspiration', 'Light'],
        ['What food do you pretend to like in front of family?', 'Food and drink', 'Taboo', 'Light'],
        ['Which snack did you almost skip before you got hooked?', 'Food and drink', 'FAULT line', 'Warm'],
        ['Which food would you miss most if it vanished from your city?', 'Food and drink', 'Stakes', 'Warm'],
        ['Idli or dosa, chai or filter coffee, home food or order in?', 'Food and drink', 'Rapid fire', 'Light'],
        // Beauty and skincare (10)
        ['How long does getting ready take you on a workday?', 'Beauty', 'Warm-up', 'Light'],
        ['What do most people get wrong about their skincare routine?', 'Beauty', 'Contrast', 'Warm'],
        ['Roughly what do you spend on skincare in a month? You can pass.', 'Beauty', 'Taboo', 'Sensitive'],
        ['Smell this. What does it remind you of?', 'Beauty', 'Mirror', 'Warm'],
        ['Smell it and guess: what’s in it?', 'Beauty', 'Guess', 'Light'],
        ['What almost made you put your last skincare buy back on the shelf?', 'Beauty', 'FAULT line', 'Warm'],
        ['Unscented, or a scent you love?', 'Beauty', 'A/B', 'Light'],
        ['If you could keep only one product in your routine, which survives?', 'Beauty', 'Stakes', 'Warm'],
        ['Smell this. Who would wear it on a first date?', 'Beauty', 'Play', 'Light'],
        ['Sunscreen or moisturiser, morning or night routine, one step or ten?', 'Beauty', 'Rapid fire', 'Light'],
        // Fashion and apparel (9)
        ['What’s the oldest thing you’re wearing right now?', 'Fashion', 'Warm-up', 'Light'],
        ['Comfort or style, if you could only have one today?', 'Fashion', 'A/B', 'Light'],
        ['What’s something you almost returned but kept?', 'Fashion', 'FAULT line', 'Warm'],
        ['What does everyone get wrong about dressing for the rain?', 'Fashion', 'Contrast', 'Light'],
        ['What’s the most you’ve ever spent on one piece of clothing?', 'Fashion', 'Taboo', 'Sensitive'],
        ['Feel this fabric. What does it remind you of?', 'Fashion', 'Mirror', 'Warm'],
        ['Cut the tag or keep it? Defend your answer.', 'Fashion', 'Play', 'Light'],
        ['If you could keep one outfit for a whole year, which one?', 'Fashion', 'Stakes', 'Warm'],
        ['Blind pick: which of these two T-shirts costs more?', 'Fashion', 'Guess', 'Light'],
        // Health and fitness (9)
        ['When did you last work up a proper sweat?', 'Fitness', 'Warm-up', 'Light'],
        ['Plant protein or whey?', 'Fitness', 'A/B', 'Light'],
        ['Guess how much protein is in this.', 'Fitness', 'Guess', 'Light'],
        ['One extra hour a day just for your body: how would you use it?', 'Fitness', 'Aspiration', 'Warm'],
        ['What’s one gym habit you think people overdo?', 'Fitness', 'Contrast', 'Light'],
        ['What nearly made you quit your routine?', 'Fitness', 'FAULT line', 'Warm'],
        ['What fitness thing did you pay for and never use?', 'Fitness', 'Taboo', 'Light'],
        ['Which part of your routine would you fight to keep?', 'Fitness', 'Stakes', 'Warm'],
        ['Gym or park, morning or evening, music or podcast?', 'Fitness', 'Rapid fire', 'Light'],
        // Home and furniture (10)
        ['What’s the first thing you do when you get home?', 'Home', 'Warm-up', 'Light'],
        ['Branded or unbranded?', 'Home', 'A/B', 'Light'],
        ['Sit on this. Does it remind you of any home you’ve lived in?', 'Home', 'Mirror', 'Warm'],
        ['If you could redo one room in your house, which one and how?', 'Home', 'Aspiration', 'Warm'],
        ['Which piece of furniture at home do you secretly hate?', 'Home', 'Taboo', 'Light'],
        ['What would you save first if you had to move out tonight?', 'Home', 'Stakes', 'Warm'],
        ['What’s in your home that you almost didn’t buy?', 'Home', 'FAULT line', 'Warm'],
        ['Guess what this sofa costs new. Now guess it second-hand.', 'Home', 'Guess', 'Light'],
        ['What do people get wrong when they set up their first flat?', 'Home', 'Contrast', 'Light'],
        ['If your sofa could talk, what would it complain about?', 'Home', 'Play', 'Light'],
        // Phones and gadgets (9)
        ['How old is the phone in your pocket?', 'Gadgets', 'Warm-up', 'Light'],
        ['What do you think this phone costs?', 'Gadgets', 'Guess', 'Light'],
        ['Upgrade your phone, or fix the one you have?', 'Gadgets', 'A/B', 'Light'],
        ['What’s one phone feature everyone pays for and nobody uses?', 'Gadgets', 'Contrast', 'Light'],
        ['What’s your real screen time a day? No judgement.', 'Gadgets', 'Taboo', 'Light'],
        ['Which app would you delete last?', 'Gadgets', 'Stakes', 'Warm'],
        ['Which gadget did you nearly return in the first week?', 'Gadgets', 'FAULT line', 'Warm'],
        ['Your phone dies for a whole day. What do you panic about first?', 'Gadgets', 'Play', 'Light'],
        ['If gadgets had no price tags, what’s the first thing you’d buy?', 'Gadgets', 'Aspiration', 'Light'],
        // Money and spending (10)
        ['New phone or a Goa trip?', 'Money', 'A/B', 'Light'],
        ['What’s the last thing you bought on your phone?', 'Money', 'Warm-up', 'Light'],
        ['What would you do differently if money wasn’t a problem anymore?', 'Money', 'Aspiration', 'Warm'],
        ['How does your salary feel compared to where you thought you’d be by now?', 'Money', 'Taboo', 'Sensitive'],
        ['What’s one money habit people your age get wrong?', 'Money', 'Contrast', 'Warm'],
        ['What’s a purchase you almost didn’t make and now can’t live without?', 'Money', 'FAULT line', 'Warm'],
        ['If you had to cut one monthly expense today, which goes first?', 'Money', 'Stakes', 'Warm'],
        ['How much do you think it takes to live comfortably in this city?', 'Money', 'Guess', 'Warm'],
        ['What’s the funniest thing you did to get through a broke month?', 'Money', 'Play', 'Light'],
        ['Cash or UPI, save or spend, EMI or wait?', 'Money', 'Rapid fire', 'Light'],
        // Second-hand and resale (9)
        ['Worst thing you ever bought second-hand?', 'Second-hand', 'Play', 'Light'],
        ['What’s the last thing you sold or gave away?', 'Second-hand', 'Warm-up', 'Light'],
        ['A sofa: buy new or buy second-hand?', 'Second-hand', 'A/B', 'Light'],
        ['What do people get wrong about buying second-hand?', 'Second-hand', 'Contrast', 'Light'],
        ['Guess what this sold for second-hand.', 'Second-hand', 'Guess', 'Light'],
        ['What would you never buy second-hand?', 'Second-hand', 'Taboo', 'Light'],
        ['What do you own that you’d never sell, at any price?', 'Second-hand', 'Stakes', 'Warm'],
        ['What almost stopped you buying used the first time?', 'Second-hand', 'FAULT line', 'Warm'],
        ['Sell me this chair in ten seconds.', 'Second-hand', 'Play', 'Light'],
        // Work and careers (9)
        ['Where are you headed right now?', 'Work', 'Warm-up', 'Light'],
        ['What does AI change about design?', 'Work', 'Contrast', 'Warm'],
        ['If your day had two extra hours, what would you do with them?', 'Work', 'Aspiration', 'Warm'],
        ['What’s one thing that stopped you choosing a direction in the last six months?', 'Work', 'Taboo', 'Sensitive'],
        ['If you had to drop every side project and keep one income, which survives?', 'Work', 'Stakes', 'Sensitive'],
        ['What’s one skill you wish someone had taught you before your first job?', 'Work', 'Aspiration', 'Warm'],
        ['Which job offer did you almost turn down?', 'Work', 'FAULT line', 'Warm'],
        ['Describe your job badly in five words.', 'Work', 'Play', 'Light'],
        ['Office or home, calls or messages, chai break or coffee break?', 'Work', 'Rapid fire', 'Light'],
        // Relationships and dating (10)
        ['Who’s the last person you texted today?', 'Relationships', 'Warm-up', 'Light'],
        ['Hot take on Valentine’s Day?', 'Relationships', 'Contrast', 'Light'],
        ['What’s one red flag in a partner you’d never ignore?', 'Relationships', 'Stakes', 'Warm'],
        ['Who should pay on a first date: whoever asked, or split it?', 'Relationships', 'A/B', 'Warm'],
        ['What song reminds you of your first crush?', 'Relationships', 'Mirror', 'Warm'],
        ['What’s something you stopped yourself starting because of what someone would think?', 'Relationships', 'Taboo', 'Sensitive'],
        ['Texting or calling, coffee or dinner, early or fashionably late?', 'Relationships', 'Rapid fire', 'Light'],
        ['What does a perfect Sunday with someone you love look like?', 'Relationships', 'Aspiration', 'Warm'],
        ['What almost stopped you going on a first date you’re glad you went on?', 'Relationships', 'FAULT line', 'Warm'],
        ['What’s the most awkward thing that’s happened to you on a date?', 'Relationships', 'Play', 'Light'],
        // Festivals and occasions (9)
        ['Which festival is the biggest deal in your house?', 'Festivals', 'Warm-up', 'Light'],
        ['Before Diwali: buy something new, or sell something old?', 'Festivals', 'A/B', 'Light'],
        ['What smell reminds you of festival mornings at home?', 'Festivals', 'Mirror', 'Warm'],
        ['What’s the worst gift you’ve had to pretend to love?', 'Festivals', 'Taboo', 'Light'],
        ['Guess what this gift box costs.', 'Festivals', 'Guess', 'Light'],
        ['Which festival tradition would you never let your family skip?', 'Festivals', 'Stakes', 'Warm'],
        ['What do people get wrong about festival gifting?', 'Festivals', 'Contrast', 'Light'],
        ['Rate your family’s festival chaos out of ten.', 'Festivals', 'Play', 'Light'],
        ['If you could spend one festival anywhere in India, where would it be?', 'Festivals', 'Aspiration', 'Light'],
        // B2B and the workplace (8)
        ['How many meetings have you had today?', 'B2B', 'Warm-up', 'Light'],
        ['What’s one tool your company pays for that nobody uses?', 'B2B', 'Contrast', 'Light'],
        ['What nearly stopped your team switching to the tool you use now?', 'B2B', 'FAULT line', 'Warm'],
        ['Which work app would you fight to keep if the budget got cut?', 'B2B', 'Stakes', 'Warm'],
        ['Which part of your job could software do tomorrow, honestly?', 'B2B', 'Taboo', 'Warm'],
        ['Explain what your company does as if I’m five.', 'B2B', 'Play', 'Light'],
        ['Long email or a quick call?', 'B2B', 'A/B', 'Light'],
        ['If you could fix one thing about how your team works, what would it be?', 'B2B', 'Aspiration', 'Warm'],
        // Events and communities (8)
        ['What brought you here today?', 'Events', 'Warm-up', 'Light'],
        ['What does this event remind you of?', 'Events', 'Mirror', 'Warm'],
        ['What would you miss if this community stopped meeting?', 'Events', 'Stakes', 'Warm'],
        ['What do most events like this get wrong?', 'Events', 'Contrast', 'Light'],
        ['Describe this crowd in three words.', 'Events', 'Play', 'Light'],
        ['Who are you hoping to meet before you leave tonight?', 'Events', 'Aspiration', 'Warm'],
        ['First time or regular, solo or with friends, stay late or leave early?', 'Events', 'Rapid fire', 'Light'],
        ['What almost made you skip today?', 'Events', 'FAULT line', 'Warm'],
      ],
    },

    'Treat each row as a shape. Swap the object in the person’s hand and keep the structure. The FAULT line rows are first halves, and the second half is always "What flipped it?"',

    'For a batch of five videos, pull five different types from one or two categories: an A/B, a guess, a mirror, a FAULT line and a play question, say. Five types give you five different videos. Five A/B questions give you one video made five times.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'category-tips', text: 'How should questions change by product category?', toc: 'Tips by category' },

    'The shapes stay the same. What changes is the setup: a product to taste, smell or hold in some categories, and more care before the question in others. Most also have a trap worth knowing.',

    { type: 'h3', id: 'products-people-can-hold', text: 'Food, beauty, fashion, fitness, home and gadgets' },

    'Food and drink questions work best with something to taste. A blindfold or a single bite turns a question into a guess or a memory, which is the whole idea behind BreadBerry’s Blindfold Milk above. Ask about allergies before anything goes in anyone’s mouth.',

    'Beauty questions should stay on routines and feelings. "Did this clear your skin?" invites a claim, and India’s ad code expects objective claims to be backed by evidence a street answer can’t give[^asci-code]. Smell is the easy win, because anyone can say what a scent reminds them of.',

    'Clothes questions improve the moment people touch the fabric, and comfort or style works because both sides are easy to defend. Leave body shape and size alone, even as a joke. Fitness has its own trap: answers drift into health claims, so steer to habits such as when people train and what nearly made them quit.',

    'Home questions open memories fast, and sitting on a sofa does half the asking. Guess-the-price works twice here, new and then second-hand, and the gap between the two guesses is the reveal. Gadget questions need no setup, because everyone already has a phone in hand. Keep other companies’ brand names out unless the brief asks for a comparison.',

    { type: 'h3', id: 'money-second-hand-and-work', text: 'Money, second-hand, work and B2B' },

    'Money questions work when they ask about feelings and choices. Figures make people go quiet. "New phone or a Goa trip?" works because it tucks money inside a choice people enjoy making, and the salary question needs the consent steps every time.',

    'Second-hand is the confession category, because people enjoy telling you about a bad buy. "What would you never buy second-hand?" can sting, but the answer is the objection your product page has to handle.',

    'Work answers start polished. Within two seconds someone will tell you they’re "learning a lot". Stay with them, ask what feels heavy, and the neat answer often gives way.',

    'For B2B, try office lunch breaks and conference coffee queues, and make the person the expert on their own job. The unused-tool question gets a laugh and a real objection in one breath.',

    { type: 'h3', id: 'relationships-festivals-and-events', text: 'Relationships, festivals and events' },

    'Relationship questions get laughs and can also embarrass people. Keep them on opinions and small stories, never on a named partner who isn’t there to agree.',

    'Festival questions belong on family, food, gifts and shopping rather than belief. CircleStore’s library has Diwali Buying and Diwali Selling, two halves of one season, so shoot a few weeks early and the edit is ready while people are still shopping. At an event, people chose to be there. Warm-ups come easily, and the stakes question can wait for the end of the night.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'city-lens', text: 'How do vox pop questions change by city?', toc: 'Questions by city lens' },

    'Use a city lens as a hypothesis about who you’re asking, not a fact about a city. Write down what you expect people to be thinking, pick the question that tests it, and let the street prove you wrong.',

    'Planning by who, where and which type keeps the question about the person, so it doesn’t drift back to the product. Here are three lenses as starting points. Nobody in any city is one type, and each row is a bet to test.',

    {
      type: 'table',
      caption: 'Three city lenses as planning hypotheses, not facts about any city',
      head: ['City lens', 'Hypothesis to test', 'Question', 'Follow-up'],
      rowHeaders: true,
      rows: [
        ['Bengaluru', 'People between paths, afraid of choosing wrong', '"What’s one thing that stopped you choosing a direction in the last six months?"', '"What happens if you pick the wrong one?"'],
        ['Mumbai', 'Many projects on the go, one that really pays', '"If you had to drop every side project and keep one income, which survives?"', '"Which one pays your rent?"'],
        ['Delhi', 'Choices shaped by what someone specific will think', '"What’s something you stopped yourself starting because of what someone would think?"', '"Whose name came to mind first?"'],
      ],
    },

    'For a D2C brand, keep the shape of each question and swap the topic:',

    {
      type: 'list',
      items: [
        '**Bengaluru lens, skincare:** "What stopped you settling on one routine?"',
        '**Mumbai lens, home:** "If you could keep one appliance, which one survives?"',
        '**Delhi lens, fashion:** "What have you stopped wearing because of something someone said?"',
      ],
    },

    'Whatever the lens, cast widely on purpose. A study of 2,000 vox pops in Flemish TV news found they rarely reflected minorities, and journalists hardly ever told viewers the people interviewed might not represent everyone[^beckers-walgrave]. A later study of the same sample found most vox pop news items showed only one side[^opinion-balance]. Ask more kinds of people, and keep answers that disagree.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'follow-up-questions', text: 'Which follow-up questions reach the second answer?', toc: 'Follow-ups that reach the second answer' },

    'Short ones, asked once the first answer has picked a side. "Interesting, why though?" works after almost anything. An echo of their own words often works better. After that, match the follow-up to the question type.',

    'The first answer is the one people think they’re supposed to give. It sounds reasonable and won’t look silly later. The second comes after they’ve heard themselves speak, and it’s usually closer to what they actually think.',

    {
      type: 'list',
      items: [
        '**"Interesting, why though?"** The all-purpose second question. Ask it once they’ve picked a side.',
        '**The echo.** Repeat their key two or three words, then wait. Former FBI hostage negotiator Chris Voss calls this mirroring[^voss-mirroring]. They say it felt "more honest". You say "More honest?" and nothing else.',
        '**"What flipped it?"** After any hesitation. It’s the heart of the FAULT line.',
        '**"What would you lose?"** The stakes follow-up. Ask it last and leave the silence alone.',
        '**The slightly wrong guess.** "So it’s mostly about the taste, then?" People correct a wrong guess more freely than they answer a direct question.',
        '**"When did that stop being enough?"** A third layer, once "why" has had its answer. It moves from the reason to the moment something changed.',
        '**"Can you help me understand something?"** It makes them the teacher. Experts talk. People who feel tested go quiet or play safe.',
      ],
    },

    'One habit ties them together. When someone uses a feeling word, such as tired, stuck or guilty, stay on it. Ask how long they’ve felt that way.',

    'Follow the feeling, not the fact.',

    'The same goes for jokes. Since Keith Johnstone’s 1979 book _Impro_, improvisers have called anything a scene partner gives you an "offer", and they learn to accept it rather than block it[^impro-offers]. When a participant makes a joke, play along for a beat.',

    'The joke often turns out to be the clip.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'second-answer',
      props: {
        title: 'The first answer, then the second (illustrative)',
        items: [
          {
            question: 'What do you need in the morning before your day feels usable?',
            first: '"Coffee, and ten minutes where nobody talks to me."',
            second: '"I share a flat with four people. Those ten minutes are the only time the place feels like mine."',
            note: 'Illustrative, not from a filmed video. The follow-up was an echo: the host repeated "nobody talks to me" and waited.',
          },
          {
            question: 'Which app would you delete last?',
            first: '"The family group chat app, I guess. Everyone’s on it."',
            second: '"My mother sends a voice note every morning. If I skip it, it feels like I skipped calling home."',
            note: 'Illustrative. The follow-up was "Interesting, why though?"',
          },
        ],
      },
    },

    'Our guide to [street interview techniques](/blog/street-interview-techniques) has the full method, with a worked script for each technique.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'questions-to-avoid', text: 'Which vox pop questions should you avoid?', toc: 'Questions to avoid' },

    'Avoid questions that end in one word, steer people to an answer, test or embarrass them, or invite claims a street answer can’t support. Some topics need a clear reason and real care, and some people shouldn’t be on camera at all.',

    {
      type: 'list',
      items: [
        '**Yes or no questions.** "Do you like coffee?" ends in one word. Ask about a moment instead.',
        '**Product-first questions.** "What do you think of our brand?" gets polite praise from someone who has never used it.',
        '**Leading questions.** "Don’t you think fast fashion is a problem?" tells them the answer you want.',
        '**Two questions in one.** "Online or offline, and why, and how often?" Split it, or lose them halfway.',
        '**Questions that humiliate.** Spelling tests, general-knowledge traps, jokes about accent, English or looks. Viewers remember who was laughed at.',
        '**Sensitive ground with no reason.** Religion, caste, politics, health conditions, weight and sexuality need a clear brief, care and a release. Most product videos don’t need them.',
        '**Bait for claims.** "Did this clear your acne?" invites an efficacy claim. Keep questions on habits and feelings.',
      ],
    },

    'Two rules sit outside the list. Never film anyone under 18 without a parent’s written consent. And if anyone in your vox pop is paid, works for you or was cast, India’s endorsement guidelines expect you to say so clearly[^endorsement-guidelines].',

    'Now try it. Six weak questions, three rewrites each.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'fix-this-question',
      props: {
        title: 'Fix this question',
        intro: 'Six weak vox pop questions. For each one, pick the rewrite you’d take to the street.',
        questions: [
          {
            q: 'Weak: "Do you like our candles?"',
            options: [
              { text: '"Smell this. What does it remind you of?"', points: 1, why: 'Yes. It asks for a memory, and the product does the work.' },
              { text: '"Would you say our candles are good value?"', points: 0, why: 'Still a yes or no, and still about the brand.' },
              { text: '"Out of ten, how much do you love our candles?"', points: 0, why: 'Leading. It assumes they love them.' },
            ],
            explain: 'Ask about the person, and let the product set off the answer.',
          },
          {
            q: 'Weak: "Don’t you think fast fashion is a problem?"',
            options: [
              { text: '"Do you care about sustainable fashion?"', points: 0, why: 'A yes or no, and most people will say yes to sound good.' },
              { text: '"Buy less or buy cheaper: which do you actually do?"', points: 1, why: 'Yes. A choice about their own habit, with room to admit something.' },
              { text: '"Why is fast fashion bad?"', points: 0, why: 'Still leading. The answer is baked into the question.' },
            ],
          },
          {
            q: 'Weak: "How much do you earn?"',
            options: [
              { text: '"What’s your take-home pay?"', points: 0, why: 'The same question in office words. Still a figure, still blunt.' },
              { text: '"How does your salary feel compared to where you thought you’d be by now?"', points: 1, why: 'Yes. It asks for a feeling, not a number.' },
              { text: '"Are you rich?"', points: 0, why: 'A joke that puts people on the spot.' },
            ],
            explain: 'Taboo questions still need consent first: say the topic and let people pass.',
          },
          {
            q: 'Weak: "Is our protein powder better than whey?"',
            options: [
              { text: '"Plant protein or whey?"', points: 1, why: 'Yes. It asks for a preference, so nobody has to claim what works. "Why though?" can follow.' },
              { text: '"Have you heard of our brand?"', points: 0, why: 'A yes or no that ends the chat.' },
              { text: '"What results did you get from our powder?"', points: 0, why: 'It invites an efficacy claim a street answer can’t back up.' },
            ],
          },
          {
            q: 'Weak: "Quick, spell entrepreneur."',
            options: [
              { text: '"What’s 17 times 23?"', points: 0, why: 'Another test. People who feel tested give safe answers or walk away.' },
              { text: '"What’s one thing you know more about than most people around you?"', points: 1, why: 'Yes. It makes them the expert, and experts talk.' },
              { text: '"Name the capital of Australia."', points: 0, why: 'A trap. The clip only works if someone looks foolish.' },
            ],
          },
          {
            q: 'Weak: "What’s your experience with our app’s onboarding flow?"',
            options: [
              { text: '"Rate our onboarding from one to five."', points: 0, why: 'A score with no story behind it.' },
              { text: '"What’s the first thing you do when you open a new app?"', points: 1, why: 'Yes. Everyday words, about their own habit.' },
              { text: '"Do you find onboarding flows intuitive?"', points: 0, why: 'Jargon, and a yes or no.' },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Rewrite first', text: 'Go back to the five tests: one breath, open, about the person, one job, a follow-up ready.' },
          { min: 3, title: 'Close', text: 'Your instincts are right on most. Read your own question aloud to someone who doesn’t know the brand.' },
          { min: 5, title: 'Street-ready', text: 'You can spot a weak question. Now test your own on three strangers.' },
        ],
      },
    },

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'test-a-question', text: 'How do you test a vox pop question before the shoot?', toc: 'Test a question first' },

    'Read it aloud, then ask three people who don’t know your brand. If they ask what you mean or answer in one word, rewrite it. If they start telling a story, it’s ready.',

    'Your team can’t do this test for you. They already know what you mean, so every question sounds clear to them.',

    {
      type: 'steps',
      id: 'steps-test-a-question',
      title: 'Test a vox pop question in seven steps',
      intro: 'Do this a few days before the shoot, with the brief open.',
      howTo: true,
      totalTime: 'PT1H',
      supplies: ['Index cards and a pen', 'Three people who don’t know your brand'],
      steps: [
        { name: 'Write one question per card', text: 'Put the type and the follow-up under it. If you can’t name the type, the question isn’t finished.' },
        { name: 'Read it aloud at normal speed', text: 'If you need a second breath, cut words until you don’t. Setup goes on screen as a caption.' },
        { name: 'Ask three outsiders', text: 'Not your team, not friends who know the product. A neighbour, a cousin, the person next to you at the chai stall.' },
        { name: 'Ask what they think it means', text: '"Did that make sense? What did you think I was asking?" The gap between what you meant and what they heard is the problem to fix.' },
        { name: 'Watch the first few seconds', text: 'A pause before a story is good. A blank look, a "what?" or a one-word answer means rewrite.' },
        { name: 'Try the silly version first', text: 'Ask the most ridiculous form of your real question as a warm-up. For a mattress brand: "Where’s the strangest place you’ve fallen asleep?" If it gets a laugh, the real one will get an answer.' },
        { name: 'Lock it in the brief', text: 'Write the final question, its follow-up and anything to avoid into [your vox pop brief](/blog/what-goes-in-a-vox-pop-brief).' },
      ],
    },

    'After the shoot, the test carries on in the feed. Instagram’s Trial Reels show a cut to non-followers first[^trial-reels], which makes it a low-cost way to compare two openings from the same street interview. Our list of [street interview hooks](/blog/street-interview-hooks) has openings to try.',

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'write-your-own', text: 'How do you write your own vox pop questions?', toc: 'Write your own' },

    'Pick the type first, then fill in four things: your product, its category, what people use instead, and when they use it. The builder below turns those four into one question of every type. Edit the wording until it sounds like your street.',

    'Each type also maps to a mechanism, the thing that makes one video different from the next. A guess becomes a reveal. An A/B becomes a debate. If your batch keeps repeating itself, see [eleven ways to vary a vox pop batch](/blog/eleven-ways-to-vary-a-vox-pop-batch).',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'question-builder',
      props: {
        title: 'Vox pop question builder',
        intro: 'Type your product and three details. Every question type fills in as you type, and you can copy any line.',
        fields: [
          { id: 'product', label: 'Your product', placeholder: 'e.g. a masala peanut butter', example: 'a masala peanut butter' },
          { id: 'category', label: 'Its category', placeholder: 'e.g. breakfast spreads', example: 'breakfast spreads' },
          { id: 'alternative', label: 'What people use instead', placeholder: 'e.g. butter on toast', example: 'butter on toast' },
          { id: 'moment', label: 'When people use it', placeholder: 'e.g. weekday breakfast', example: 'weekday breakfast' },
        ],
        templates: [
          { text: 'What does your {moment} usually look like?', group: 'Warm-up', mechanism: 'Personal experiences' },
          { text: 'If time and money were no problem, what would your perfect {moment} look like?', group: 'Aspiration', mechanism: 'Personal experiences' },
          { text: 'Roughly what do you spend on {category} in a month? You can pass.', group: 'Taboo', mechanism: 'Personal experiences' },
          { text: 'What do most people get wrong about {category}?', group: 'Contrast', mechanism: 'Debates and opposing opinions' },
          { text: 'Try {product}. Does it remind you of anything?', group: 'Mirror', mechanism: 'Product reactions' },
          { text: 'Think of the last {category} you bought. What almost made you put it back?', group: 'FAULT line', mechanism: 'Personal experiences' },
          { text: 'If {category} vanished tomorrow, what would your {moment} lose?', group: 'Stakes', mechanism: 'Unexpected questions' },
          { text: 'Which one goes home with you: {product} or {alternative}? Why?', group: 'A/B', mechanism: 'A/B comparisons' },
          { text: 'Guess what {product} costs. Now guess what {alternative} costs.', group: 'Guess', mechanism: 'Guessing and reveals' },
          { text: 'Quick picks: {product} or {alternative}? {moment} at home or out? Try it or skip it?', group: 'Rapid fire', mechanism: 'Challenges' },
          { text: 'If {product} were a guest at a wedding, which relative would it be?', group: 'Play', mechanism: 'Humour and playful interactions' },
          { text: 'You picked {product}. Interesting, why though?', group: 'Follow-up', mechanism: 'Different follow-up structures' },
          { text: 'What would you miss if you went back to {alternative}?', group: 'Follow-up', mechanism: 'Different follow-up structures' },
        ],
        note: 'Every line still needs testing on three people who don’t know your brand. Taboo lines need consent first.',
      },
    },

    'Tap a card to practise the follow-up we’d ask next.',

    {
      type: 'widget',
      widget: 'flipCards',
      id: 'draw-a-question',
      props: {
        title: 'Draw a question, then its follow-up',
        cards: [
          { front: 'New phone or a Goa trip?', back: 'Follow-up: "What would the trip give you that the phone can’t?" The pick is quick. The reason is the clip.', tag: 'A/B' },
          { front: 'Smell this. What does it remind you of?', back: 'Follow-up: echo their key words and wait. A memory usually comes with a person attached.', tag: 'Mirror' },
          { front: 'Worst thing you ever bought second-hand?', back: 'Follow-up: "What did you do with it?" Bad-buy stories are funny when nobody is mocked.', tag: 'Play' },
          { front: 'Which food would you miss most if it vanished from your city?', back: 'Follow-up: none. Stay quiet and let the answer land.', tag: 'Stakes' },
          { front: 'What almost made you put it back?', back: 'Follow-up: "What flipped it?" The doubt and the flip together are the story.', tag: 'FAULT line' },
          { front: 'What would you do differently if money wasn’t a problem anymore?', back: 'Follow-up: "What would a small version of that look like this month?" It brings a dream back to the street.', tag: 'Aspiration' },
          { front: 'What do most people get wrong about making chai at home?', back: 'Follow-up: "Who taught you that?" Insider knowledge usually comes from someone.', tag: 'Contrast' },
        ],
      },
    },

    // ---------------------------------------------------------------------------------------------------------------------------------------
    { type: 'h2', id: 'where-to-start', text: 'Where should you start?', toc: 'Where to start' },

    'Pick one question from the bank. Change one word so it fits your product. Ask three people who have never heard of your brand. If they answer with a story, you’ve got a vox pop question.',

    'We control the question, the setup, who we approach, the follow-up and the edit. We can’t control exactly how a stranger will respond in the moment.',

    'A good question gives more of those moments a chance to happen.',

    'If you’d rather see a street interview on your own product first, [request a trial video](/contact). Scope, the number of trial videos and any fee are confirmed in writing.',
  ],

  faqs: [
    {
      q: 'What are good vox pop questions?',
      a: 'Good vox pop questions are easy to answer in a second and hard to answer in one word. "Salt or sweet?", "New phone or a Goa trip?" and "Smell this. What does it remind you of?" all work on a busy footpath. Pair every vox pop question with a follow-up such as "Interesting, why though?", because the second answer is usually the one worth keeping.',
    },
    {
      q: 'How many questions should one vox pop video use?',
      a: 'One main question per vox pop video. Around it sit a warm-up, which rarely makes the edit, and one or two follow-ups. A batch of five videos needs five different main questions. Bring eight to ten to the shoot, each with its follow-up written down, and drop the ones that fall flat on the day.',
    },
    {
      q: 'What are some funny street interview questions?',
      a: 'Funny street interview questions are usually play or A/B questions with a small twist. Try "Worst thing you ever bought second-hand?", "If your sofa could talk, what would it complain about?" or "Describe your job badly in five words." The humour should come from the situation and the person’s own answer. Laugh with people, never at them, and cut anything that makes someone look foolish.',
    },
    {
      q: 'Should the brand be named in a vox pop question?',
      a: 'Usually not in the first question. Ask about the person’s life, then bring the product in by handing it over. Be open about who you’re filming for, though. Where the interviewer represents your brand, agree the introduction before the shoot. And if anyone on camera is paid, works for you or was cast, say so clearly when the video is posted.',
    },
    {
      q: 'Which vox pop questions should you avoid?',
      a: 'Avoid yes or no questions, product-first questions, leading questions and two questions in one. Avoid anything that humiliates people, such as spelling tests or jokes about accents. Stay off religion, caste, politics, health conditions and weight unless the brief needs them and they’re handled with care. Never ask questions that invite efficacy claims, and never film anyone under 18 without a parent’s written consent.',
    },
    {
      q: 'How do you write a good follow-up question?',
      a: 'Write the follow-up before the shoot, and keep it shorter than the first question. "Interesting, why though?" works after almost any choice. Repeating someone’s key two or three words and then waiting often works better still. After a hesitation, ask "What flipped it?". After a big answer, ask "What would you lose?" and stay quiet. Follow the feeling word, not the fact.',
    },
    {
      q: 'Is it okay to ask people about money in a street interview?',
      a: 'Yes, if you ask with care. Ask about feelings and choices rather than figures: "How does your salary feel compared to where you thought you’d be?" gets a better answer than "How much do you earn?". Tell people the topic before you ask, let them pass on camera, never press after a no, and cut anything they ask you to cut.',
    },
    {
      q: 'Should vox pop questions be in Hindi or English?',
      a: 'Ask in the language the street speaks, which in many Indian cities is a mix. On one Bengaluru footpath you can hear English, Kannada and Hindi in the same hour. Write each vox pop question in English and in the local language your audience uses, let people answer in whichever they think in, and caption the video. Never correct anyone’s English or accent on camera.',
    },
  ],

  sources: [
    {
      id: 'vox-vs-expert',
      title:
        'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter Brill',
      date: '2022',
      note: 'CLAIMS R11/E04: vox pops rated less trustworthy than an expert with poll data, yet shifted personal opinion more.',
    },
    {
      id: 'loss-aversion',
      title: 'Empirical estimates of loss aversion',
      url: 'https://healthcare-economist.com/2024/06/26/empirical-estimates-of-loss-aversion',
      publisher: 'Healthcare Economist',
      date: '2024-06-26',
      note: 'CLAIMS R03: losses weigh roughly twice an equal gain (λ 2.25 in 1992; meta-analysis average about 1.96).',
    },
    {
      id: 'voss-mirroring',
      title: 'Never Split the Difference (summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'CLAIMS P08: repeating someone’s last few words is "mirroring", popularised by former FBI negotiator Chris Voss.',
    },
    {
      id: 'impro-offers',
      title: 'Improv glossary',
      url: 'https://www.hooplaimpro.com/?p=1866',
      publisher: 'Hoopla Impro',
      note: 'CLAIMS R15: offers, accepting and blocking as established improv terms (Keith Johnstone, Impro, 1979).',
    },
    {
      id: 'beckers-walgrave',
      title: 'Who speaks for the (TV) people? The representativeness of vox pops on television news',
      url: 'https://informahealthcare.com/doi/abs/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice',
      date: '2017',
      note: 'CLAIMS E07: 2,000 Flemish TV vox pops; minorities under-represented; journalists hardly ever flag it.',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies',
      date: '2018',
      note: 'CLAIMS E08: most vox pop news items present only one point of view.',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS 5.8: objective claims must be capable of substantiation; testimonials do not substantiate efficacy.',
    },
    {
      id: 'endorsement-guidelines',
      title: 'Endorsement Know-hows! for celebrities, influencers and virtual influencers on social media platforms',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose any material connection with terms such as "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI via The Week',
      date: '2025-11-14',
      note: 'CLAIMS P07: DPDP Rules notified November 2025, coming into force in phases; get a release and ask a lawyer.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'CLAIMS E23: Trial Reels show a Reel to non-followers first.',
    },
  ],

  related: ['street-interview-techniques', 'eleven-ways-to-vary-a-vox-pop-batch', 'street-interview-hooks', 'what-goes-in-a-vox-pop-brief'],
};

export default post;
