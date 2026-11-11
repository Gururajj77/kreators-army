import type { Post } from '../types';
import meta from './improv-for-street-interviews.meta';

const post: Post = {
  meta,

  answer:
    'Improv interview techniques are stage habits that help a street interviewer get unrehearsed answers. Kreators.Army groups them into ten rules for vox pop hosts: treat surprises as gifts, lower your status, find the game, notice offers, heighten what works, call back an early word, name the feeling, audit your blocks, read the body and start in play.',

  takeaways: [
    'A street interview is a scene with a stranger and no script. Improvisers rehearse for that, and most of their habits carry straight over.',
    'Lower your status early. Ask people to teach you something, and they tend to stop performing for the camera.',
    'Keep a gift spotter column and a pattern log. Your next three questions come from the log, not the sheet.',
    'When an answer lands, go deeper, not past. Then pick your callback words before you open the timeline.',
    'Treat body cues as prompts for a better question, never as a lie detector.',
    'Start in play. A silly warm-up often gives you the most usable opening of the day.',
  ],

  body: [
    `Picture a host on a footpath in HSR Layout with five questions on a card. On question two, a stranger laughs and says, "Honestly, I don't even know why I started using this." The host nods and reads out question three.`,

    'That laugh was the best moment of the afternoon, and the host walked straight past it.',

    'A stage improviser would have caught it. Nothing in improv goes to plan, so improvisers learn to notice what a partner hands them and build on it. A street interview runs on the same condition, plus a camera rolling and no second take with that stranger.',

    "This guide rewrites ten improv habits as rules for street interviews. Each rule gets a street example and a line you can actually say, plus the note it leaves for your editor. The kit at the end has a two-column shoot sheet you can copy.",

    { type: 'h2', id: 'why-improv-belongs-on-the-street', text: 'Why does improv belong on the street?', toc: 'Why improv belongs on the street' },

    'Because a street interview is an unscripted scene with a stranger, which is the one situation improvisers rehearse for. Much of their training is noticing what a partner offers, accepting it and adding to it.',

    {
      type: 'definition',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    'Our guide to [what vox pop content is](/blog/what-is-vox-pop-content) covers the format itself. This one is about the person holding the mic.',

    "We think a flat street interview is rarely the camera's fault, or the spot's. Usually the person answering has started to perform. The mic and the question card tell them they're being tested, so they give the safe answer: a polite review, delivered like a spokesperson.",

    'The safe answer costs more than it looks. In a 2022 experiment with TV news items, viewers rated vox pops as less trustworthy than an expert quoting a poll, yet the vox pops moved their personal opinions more[^vox-pop-vs-expert-2022]. The ordinary voice did its work even while viewers said they trusted it less. Our reading: a stranger who sounds like a spokesperson gives up that advantage.',

    { type: 'h3', id: 'the-words-improvisers-use', text: 'What do improvisers mean by offers and blocking?' },

    `Much of the vocabulary below, including status, offers and blocking, goes back to Keith Johnstone's 1979 book _Impro_. Hoopla, a London improv school, sums up the central idea in its glossary in six words: "Everything is an offer, even mistakes."[^hoopla-impro-glossary]`,

    {
      type: 'definition',
      id: 'improv-offer',
      term: 'Offer (improv)',
      text: 'An offer is anything a scene partner gives you to build on, from a line of dialogue to a shrug. In a street interview, an offer is any part of an answer that opens a door, including a sentence someone starts and then drops.',
      source: 'hoopla-impro-glossary',
    },

    'Blocking is the opposite: refusing or ignoring the offer. Accepting it and adding something is usually taught as "yes, and". Most of this guide is a long way of saying "yes, and" to strangers on a footpath. Our glossary lists the [improv terms used on the street](/blog/vox-pop-glossary#improv-terms).',

    'The ten names below, from GIFT to PLAY, are our own shorthand, not improv canon. Each takes an idea from the stage and turns it into something a host can do with a camera rolling and a stranger who owes them nothing. Some acronyms run long, so keep the rule and drop the letters if you like.',

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. On our shoots, the interviewer can follow an interesting answer and go deeper. These rules are about doing that well, whether the mic is with our host or with you.',

    'Swipe through the ten rules first, then take them one at a time below.',

    {
      type: 'widget',
      widget: 'slides',
      id: 'ten-rules-deck',
      props: {
        title: 'The ten rules, one card each',
        slides: [
          {
            heading: '1. GIFT',
            text: "Treat an answer that breaks your plan as the best thing that's happened. Stop, and follow it.",
          },
          {
            heading: '2. STATUS',
            text: 'Hand over the expert role in the first half-minute. People who teach you talk more than people being tested.',
          },
          {
            heading: '3. SCENE',
            text: "Spot the pattern repeating across someone's answers, name it gently and build on it.",
          },
          {
            heading: '4. OFFER',
            text: 'Watch for the sentence they started and dropped, or the pause before they spoke. Flag it lightly and walk through.',
          },
          {
            heading: '5. HEIGHTEN',
            text: 'When something lands, go one level deeper before you move on.',
          },
          {
            heading: '6. CALLBACK',
            text: 'Catch one exact word from the first two minutes and return to it later, live or in the edit.',
          },
          {
            heading: '7. TRUTH',
            text: 'Ask about the feeling under the facts, then hold the silence.',
          },
          {
            heading: '8. BLOCK',
            text: 'Find your own shutdown habits in old footage before you shoot.',
          },
          {
            heading: '9. BODY',
            text: 'Watch posture and hands before words. Use cues as prompts for a better question, not as proof.',
          },
          {
            heading: '10. PLAY',
            text: 'Start with something silly and low-stakes, then ease into the real question.',
          },
        ],
      },
    },

    { type: 'h2', id: 'gift', text: '1. GIFT: treat the unexpected answer as the point', toc: '1. GIFT' },

    'When an answer breaks your plan, treat it as the best thing that has happened in the interview. Stop, work out what surprised you and follow it, even if it takes you off your list.',

    'On stage, plans break all the time. Someone forgets a line, or a heckler shouts from the third row. A trained improviser folds the heckle into the scene, because the thing nobody planned usually beats the thing somebody did.',

    {
      type: 'framework',
      id: 'gift-framework',
      name: 'GIFT',
      tagline: "Four steps for the answer you didn't plan for.",
      parts: [
        { key: 'G', name: 'Get out of the plan', text: 'Drop your next question as soon as something new surfaces.' },
        { key: 'I', name: 'Identify the gift', text: 'Name it to yourself: a laugh, a pause, an odd word.' },
        { key: 'F', name: 'Follow it fully', text: 'Ask about it, even when it feels off-script.' },
        { key: 'T', name: 'Trust the viewer', text: 'They will find it more real than anything you prepared.' },
      ],
    },

    'Go back to the host in HSR Layout. Say the product is a cold-pressed hair oil, and the stranger has just laughed. This time the host takes the gift.',

    {
      type: 'script',
      id: 'script-gift',
      title: 'Following a gift',
      context: 'An illustration, not a real interview.',
      lines: [
        { speaker: 'Host', text: 'How long have you been using it?' },
        { direction: 'The participant laughs, a little nervously.' },
        { speaker: 'Participant', text: "I mean, I don't even know why I started, honestly." },
        { direction: 'The host lowers the card. Question three can wait.' },
        { speaker: 'Host', text: "You don't know why you started. So when did you stop asking?" },
      ],
    },

    'The planned question would have got a review: how long, how often. The follow-up opens a story about habit, and a brand learns more from that than from a star rating.',

    'That story is the video.',

    {
      type: 'callout',
      tone: 'tip',
      title: 'The gift spotter column',
      text: 'Draw a line down your shoot sheet. Planned questions go on the left. On the right, under "gift spotter", note every hesitation, odd laugh or answer that surprised even the person giving it, with a time code and three words. By the end of the day, that column is your shortlist for the edit.',
    },

    'The exception is a gift that leads somewhere private. A stray mention of a health scare or a family fight is a gift for a friend, not for a brand video. Leave it off the sheet, thank them and steer back.',

    { type: 'h2', id: 'status', text: '2. STATUS: lower yours so strangers relax on camera', toc: '2. STATUS' },

    'Whoever holds the mic and the question card starts with high status. People who feel low status perform: they give safe answers and say what they think you want. So hand the status over early, by making them the expert.',

    `Status in improv has little to do with rank. Hoopla's glossary calls it "behaviour rather than class": a servant can play high status to a king[^hoopla-impro-glossary]. What counts is who leads the exchange from moment to moment. Improvisers practise raising and lowering it on purpose, because a scene changes whenever its status does.`,

    "On the footpath, you've claimed high status before you say a word. The kit does it for you. The person you stop becomes a subject in your study, and subjects answer like spokespeople.",

    'Experts talk. Ask someone to teach you, and they will.',

    {
      type: 'framework',
      id: 'status-framework',
      name: 'STATUS',
      tagline: 'Six steps for handing over the expert role.',
      parts: [
        { key: 'S', name: 'Surrender authority early', text: 'In the first 30 seconds, before the real question.' },
        { key: 'T', name: 'Transfer the expert frame', text: '"You know this better than I do."' },
        { key: 'A', name: 'Ask a teacher question', text: 'One that has them explain, not rate.' },
        { key: 'T', name: 'Track the posture change', text: "You'll see them settle." },
        { key: 'U', name: 'Use something low-stakes first', text: 'A small, slightly absurd question before the real one.' },
        { key: 'S', name: 'Stay below them', text: 'Until the answer you came for arrives.' },
      ],
    },

    'The fastest way to lower your status is to rewrite your questions. The topic stays the same. The role of the person answering changes.',

    {
      type: 'table',
      caption: 'Subject questions and teacher-frame rewrites',
      head: ['Subject question', 'Teacher-frame rewrite', 'What changes'],
      rows: [
        ['"Do you use this audio brand\'s earphones?"', '"Explain it like I know nothing: why does sound quality matter to you?"', 'A yes or no becomes an explanation'],
        ['"What do you think of this hair oil?"', '"Help me understand something. What does a good hair day need?"', 'An opinion becomes expertise'],
        ['"Would you buy this?"', '"If your cousin asked whether to buy it, what would you say?"', 'A verdict becomes advice to someone they know'],
        ['"Rate this snack out of ten."', '"What does someone who really knows snacks check first?"', 'A score becomes a method'],
      ],
      rowHeaders: true,
    },

    "Questions about someone's own life make them the expert by default. Nobody knows more about the smell they'd want on a date than the person you're asking.",

    {
      type: 'video',
      brand: 'Waxys',
      title: 'Smell On A Date',
      caption: 'Waxys, "Smell On A Date". A light question about scent and dating, where the person answering is the only expert in the room.',
    },

    "Lowering your status isn't the same as looking lost. In Aronson's 1966 experiment, a clearly capable quiz contestant who spilled coffee became more likeable, while the same slip made an average contestant less likeable[^pratfall-effect].",

    'That study measured liking in a lab, not openness on a footpath, but the lesson travels. Be visibly good at the job first, with a clear introduction and a plain answer about where the video will go. Then hand over the expertise.',

    'Before your next shoot, rewrite your top five questions in the teacher frame. Where it breaks: people in a rush. Nobody wants to teach on the way to a bus, so give them a quick either-or question they can answer while walking.',

    { type: 'h2', id: 'scene', text: '3. SCENE: find the game in their answers', toc: '3. SCENE' },

    'Every improv scene has a game: a pattern that repeats and builds. Most people you interview have one too. Spot it in their first few answers, name it gently and build the interview around it instead of the next question on your card.',

    "The game can be a habit, a tension or a person who keeps coming up. On stage, that pattern keeps an audience watching more than any single line does.",

    {
      type: 'framework',
      id: 'scene-framework',
      name: 'SCENE',
      tagline: 'Five steps for building a scene out of answers.',
      parts: [
        { key: 'S', name: 'Spot the repeat', text: 'It usually shows up within the first three answers.' },
        { key: 'C', name: 'Call it out gently', text: 'As an observation, never a criticism.' },
        { key: 'E', name: 'Escalate it', text: 'Your next question goes one level deeper into the pattern.' },
        { key: 'N', name: 'Never drop it', text: 'Even if they try to open a new topic.' },
        { key: 'E', name: 'Extract it in the edit', text: "The pattern becomes the video's through-line." },
      ],
    },

    'The most common game on a footpath is the hedge. Someone answers three different questions and hedges every time.',

    {
      type: 'script',
      id: 'script-scene',
      title: 'Finding the game in a hedge',
      context: 'An illustration, not a real interview.',
      lines: [
        { speaker: 'Participant', text: 'I mean, sort of.' },
        { speaker: 'Participant', text: 'Kind of, yeah.' },
        { speaker: 'Participant', text: 'I think so? Maybe.' },
        { direction: 'The host skips question four.' },
        { speaker: 'Host', text: 'You keep saying "sort of". What would it take to feel sure?' },
      ],
    },

    "The hedge is the game. They're circling something they haven't said yet. Once you name it, the interview has a through-line, and you're building a scene rather than collecting quotes. We think viewers stay longer for a scene than for a list of answers.",

    'Other games worth watching for:',

    {
      type: 'list',
      items: [
        '**A person who keeps appearing:** "My mother would never…" in one answer, "Mum says…" two answers later.',
        '**Price, every time,** whatever you actually asked.',
        '**A joke** whenever the question gets close.',
        '**"We" instead of "I",** as if a partner or flatmate makes the call.',
        '**One word on repeat,** like "honestly" or "basically".',
      ],
    },

    "Two cautions. One odd answer is not a game, so wait for the second repeat before you name it. And name patterns in what people think, never in how they speak. A stammer or an accent is nobody's game.",

    { type: 'h2', id: 'offer', text: '4. OFFER: notice what they almost said', toc: '4. OFFER' },

    "The best offer in a street interview is often something the person didn't finish: a dropped sentence, or a pause before the answer. Notice it, flag it lightly and follow it.",

    'Most interviewers listen to the answer. The OFFER habit is to watch what surrounds it: the breath out before a "yeah", or the smile that slips out when you mention the brand they used to buy. The polite answer comes after. The door is just before it.',

    {
      type: 'framework',
      id: 'offer-framework',
      name: 'OFFER',
      tagline: 'Five steps for walking through a door they opened.',
      parts: [
        { key: 'O', name: 'Observe everything', text: 'Body, breath and word choice, not just the words.' },
        { key: 'F', name: 'Find the offer', text: "It's usually in the pause before the answer." },
        { key: 'F', name: 'Flag it back neutrally', text: '"You hesitated there."' },
        { key: 'E', name: 'Enter that door', text: 'The one they opened, not the one you planned.' },
        { key: 'R', name: 'Resist closing it', text: 'Stay with it for at least two more exchanges.' },
      ],
    },

    'Take a nutrition brand. You ask someone about their supplement routine. They pause and look faintly embarrassed, then give a perfectly normal answer. The normal answer is usable, but the pause is the part worth asking about.',

    `Ask: "You hesitated there. What was that about?" Then wait. You might hear about price, or about feeling judged for buying supplements at all. You won't know until you ask, and no brief could have predicted it.`,

    'Flagging only works when it sounds curious rather than like a catch. Say it lightly, and accept "nothing, really" as a full answer. People can usually tell interest from an ambush.',

    `Improv teachers are wary of questions, which is awkward for interviewers. Hoopla's glossary warns that a question with no offer in it "puts all the pressure on your partner"[^hoopla-impro-glossary]. You can't stop asking questions on a street shoot. You can put an offer inside them, such as a guess they can correct: "I'd have guessed this is a gym thing for you. Wrong?"`,

    {
      type: 'callout',
      tone: 'tip',
      title: 'The pattern log',
      text: "SCENE and OFFER share one tool. Keep a note on your phone with two lists: patterns you've spotted, and offers you saw but haven't followed yet. Build your next three questions from the log, not from your sheet.",
    },

    { type: 'h2', id: 'heighten', text: '5. HEIGHTEN: go deeper, not past', toc: '5. HEIGHTEN' },

    `When an answer lands, the instinct is to say "great" and move on. Don't. Stay on the same ground and ask one question that goes a level deeper before you change the subject.`,

    `You know the moment. Someone says something they clearly didn't plan to say, the energy shifts, and they feel it too. Then the interviewer says "lovely, okay, moving on", and the best minute of the day becomes a clip that never makes the cut.`,

    {
      type: 'framework',
      id: 'heighten-framework',
      name: 'HEIGHTEN',
      tagline: 'Eight steps for staying inside a moment that works.',
      parts: [
        { key: 'H', name: 'Hold the spike', text: "Don't name it, don't release it, don't let it settle." },
        { key: 'E', name: 'Escalate', text: 'Ask one question that goes further into the same ground.' },
        { key: 'I', name: 'Intensify', text: 'Each follow-up asks for slightly more honesty than the last.' },
        { key: 'G', name: 'Go again', text: 'Same feeling, different way in.' },
        { key: 'H', name: 'Hit the peak', text: "You're there when they surprise themselves, not just you." },
        { key: 'T', name: 'Then move on', text: 'Only then.' },
        { key: 'E', name: 'Edit from here', text: 'Not from the first, careful answer.' },
        { key: 'N', name: 'Never leave early', text: 'A spike you leave unmined rarely comes back.' },
      ],
    },

    'One quiet way to hold a spike is mirroring. In a MindTools interview, former FBI hostage negotiator Chris Voss describes it as "repeating the last one to three words", said like a question so the person keeps going[^voss-mirroring]. Our guide to [street interview techniques](/blog/street-interview-techniques#echo-technique) covers the same move as ECHO. The made-up exchange below uses one mirror, then climbs.',

    {
      type: 'script',
      id: 'script-heighten',
      title: 'A heighten ladder',
      context: 'An illustration, not a real interview. The host never changes the subject.',
      lines: [
        { speaker: 'Host', text: "What's your skincare routine like?" },
        { speaker: 'Participant', text: 'Honestly? Whatever my sister leaves in the bathroom.' },
        { speaker: 'Host', text: 'Whatever your sister leaves.' },
        { direction: 'The host waits.' },
        { speaker: 'Participant', text: "Yeah. I've never bought anything for myself. Feels like a waste." },
        { speaker: 'Host', text: 'When did you last buy something just for you?' },
        { direction: 'A long pause.' },
        { speaker: 'Participant', text: "Huh. I actually don't know." },
      ],
    },

    'That last line is the peak, because they surprised themselves. Everything before it is setup, so the edit should start close to the peak rather than at the first, careful answer.',

    "Heightening isn't pushing, though. If someone's answers start to shrink or they glance at the exit, you've gone past the peak. Thank them, lighten the next question and let them go.",

    { type: 'h2', id: 'callback', text: '6. CALLBACK: return to an early word', toc: '6. CALLBACK' },

    'A callback brings back something from earlier in a scene. In a street interview, catch one specific word from the first two minutes and let it go. Later, link it back, either live with one question or in the edit.',

    `Hoopla's glossary files the idea under "reincorporation": bringing back an offer from earlier in a scene, which can tie up a storyline[^hoopla-impro-glossary]. A video that returns to its own early word feels made rather than assembled.`,

    {
      type: 'framework',
      id: 'callback-framework',
      name: 'CALLBACK',
      tagline: 'Eight steps, most of them for the edit.',
      parts: [
        { key: 'C', name: 'Capture one specific word', text: 'Or image, from the first two minutes. Specific, not a theme.' },
        { key: 'A', name: 'Allow the talk to move on', text: "Improvisers call it shelving. Don't mention it again yet." },
        { key: 'L', name: 'Listen for the echo', text: 'A later line that connects, even loosely.' },
        { key: 'L', name: 'Link with one question', text: 'A single bridging question, with no explanation.' },
        { key: 'B', name: 'Build the edit around the return', text: 'Not around the running order.' },
        { key: 'A', name: 'Anchor the close', text: 'End on the callback, not on a summary.' },
        { key: 'C', name: 'Close without explaining', text: 'Let the viewer make the link.' },
        { key: 'K', name: 'Keep it to one', text: 'Two callbacks start to feel engineered.' },
      ],
    },

    `Imagine footage for a food-delivery app. Early on, someone says, "I order when I'm lonely." The talk moves on to prices and favourite places. Much later, they mention "comfort". Put those two moments side by side, with no voice-over and no caption spelling it out, and the viewer joins the dots.`,

    "That's the kind of clip people send to one friend late at night, and sends count. In January 2025, Instagram's head, Adam Mosseri, named watch time, likes and sends as the three signals that matter most for ranking[^mosseri-signals]. A callback can't promise any of them. It does give a viewer a reason to share.",

    `One hard rule: a callback has to connect what the person meant. If "lonely" and "comfort" came from two different stories, splicing them together changes what they said. That's a line no edit should cross.`,

    {
      type: 'callout',
      tone: 'tip',
      title: 'Callback candidates',
      text: 'Before you open the timeline, write down the three most specific words or images from the first two minutes of each interview. Exact words, not themes. Your edit starts from that list.',
    },

    { type: 'h2', id: 'truth', text: '7. TRUTH: ask about the feeling, not the facts', toc: '7. TRUTH' },

    "Under every scene's surface there's an emotional truth. Two characters argue about whose turn it is to wash up, but one of them feels unseen. In an interview, listen for the feeling under the facts, and ask about that.",

    {
      type: 'framework',
      id: 'truth-framework',
      name: 'TRUTH',
      tagline: 'Five steps for the line under the line.',
      parts: [
        { key: 'T', name: 'Track the surface', text: 'What they say at face value: products, routines, facts.' },
        { key: 'R', name: 'Read the feeling', text: "Doubt, hope or frustration they haven't named." },
        { key: 'U', name: 'Use one reframe', text: 'Name the feeling, not the situation, and ask it as a question.' },
        { key: 'T', name: 'Test it', text: 'Watch their face before they speak.' },
        { key: 'H', name: 'Hold the silence', text: "Don't fill it and don't rescue them. Let them move first." },
      ],
    },

    `Someone tells you, "I've tried four or five protein powders." The surface follow-up is "Oh, which ones?", and you'll get a list. The truth underneath may be that they don't trust any of them, so ask: "What would it feel like to find one you actually trusted?"`,

    'That question leaves the product behind and asks about the feeling the product is meant to fix. The answer tells a nutrition brand more about its category than a list of rival names could.',

    'Tap each made-up statement to see both follow-ups side by side.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'surface-vs-truth',
      props: {
        title: 'Surface or truth?',
        firstLabel: 'Surface follow-up',
        secondLabel: 'Truth follow-up',
        items: [
          {
            question: '"I\'ve tried four or five protein powders."',
            first: '"Oh, which ones?" You get a list of names.',
            second: '"What would it feel like to find one you actually trusted?" You get a story about doubt.',
          },
          {
            question: '"I always buy the cheaper one."',
            first: '"How much cheaper?" You get a number.',
            second: '"What would you worry about if you paid more?" You get the fear behind the habit.',
          },
          {
            question: '"My mum still buys my shampoo."',
            first: '"Which one?" You get a brand.',
            second: '"What would it mean to pick your own?" You get a story about growing up.',
          },
          {
            question: '"I only order in when I\'m working late."',
            first: '"What do you usually get?" You get a menu.',
            second: '"What does a night like that feel like?" You get the evening itself.',
          },
          {
            question: '"I don\'t really wear perfume."',
            first: '"Why not?" You get a reason.',
            second: '"Is there a smell you remember someone by?" You get a memory.',
          },
        ],
      },
    },

    'The hardest step is the last one. After a reframe, silence feels like a mistake, and every instinct says fill it. Count to five in your head instead.',

    `Voss teaches a gentler tool for this step, which Voss calls labelling: an observation that starts "it sounds like" or "it feels like"[^voss-mirroring]. Said tentatively, a label leaves room for "no, it's more that…", and the correction often carries the detail you wanted.`,

    `It goes wrong when the label turns into a verdict ("so you feel ashamed"). That puts words in a stranger's mouth, and in a brand video those words go out under the brand's name. Keep it light, and take "no" for an answer.`,

    { type: 'h2', id: 'block', text: '8. BLOCK: audit your own shutdowns', toc: '8. BLOCK' },

    'A block is any reply that denies or ignores what the other person offered. Interviewers block without meaning to: they smile and move on, change the subject or jump to the next question. Audit your own blocks before the shoot, and again in the footage.',

    `On stage a block sounds like this: "There's an elephant in the room." "No, there isn't." The scene is dead.`,

    "Street blocks are quieter, which is why they're easy to miss. Someone starts to say something vulnerable, and the host smiles and moves on. Someone contradicts themselves, and the host nods and reads the next question.",

    "Good interviewers block too. It's the default reaction to anything awkward, so fixing it takes an audit, not good intentions.",

    {
      type: 'framework',
      id: 'block-framework',
      name: 'BLOCK',
      tagline: 'Five steps, run before the shoot and again in review.',
      parts: [
        { key: 'B', name: 'Before the shoot, find your blocks', text: 'Watch old footage and name your three most common ones.' },
        { key: 'L', name: 'List the swerves', text: 'Every time you changed the subject because it got uncomfortable.' },
        { key: 'O', name: 'Observe your own body', text: 'Where did you step back or look away?' },
        { key: 'C', name: 'Create a yes-and rule', text: 'Build on any offer for two more exchanges before you redirect.' },
        { key: 'K', name: 'Kill closing questions', text: 'Cut every question that ends a conversation instead of opening one.' },
      ],
    },

    'Closing questions are easy to spot once you look for them. "Do you like it?" "Would you recommend it?" "Is it worth the price?" Each invites one word. Rewrite them as "What do you like about it?" or "Who would you tell about it, and what would you say?"',

    { type: 'h3', id: 'block-or-build-quiz', text: 'Try it: block or build?' },

    'Practise on someone else first. Each reply below follows an offer: did the interviewer block it or build on it?',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'block-or-build',
      props: {
        title: 'Block or build?',
        intro: 'Eight moments from imagined interviews. Pick one answer for each.',
        questions: [
          {
            q: 'They say: "I only bought it because my flatmate did." The host says: "Ha, fair. Next question…"',
            options: [
              { text: 'Block', points: 1, why: 'Right. The flatmate was the offer, and "next question" walked past it.' },
              { text: 'Build', points: 0, why: 'Look again. "Next question" ignores the flatmate completely.' },
            ],
          },
          {
            q: 'They say: "I mean, it\'s fine. Sort of." The host says: "Sort of?"',
            options: [
              { text: 'Block', points: 0, why: 'This one builds. A two-word echo keeps the door open.' },
              { text: 'Build', points: 1, why: 'Right. Two words, and the hedge becomes the next topic.' },
            ],
          },
          {
            q: 'They laugh nervously before answering. The host says: "Great answer. So, moving on to price…"',
            options: [
              { text: 'Block', points: 1, why: 'Right. The nervous laugh was the gift, and "moving on" closed it.' },
              { text: 'Build', points: 0, why: 'Not quite. "Moving on" leaves the laugh unexplored.' },
            ],
          },
          {
            q: 'They say: "My mother would never let me buy this." The host says: "What would your mother say about it?"',
            options: [
              { text: 'Block', points: 0, why: 'This one builds. The host followed the person they brought up.' },
              { text: 'Build', points: 1, why: 'Right. The mother is the game, and the host stayed with it.' },
            ],
          },
          {
            q: 'They say: "It\'s overpriced, honestly." The host says: "Actually, it works out cheaper per use."',
            options: [
              { text: 'Block', points: 1, why: 'Right. Defending the product turns an honest view into an argument.' },
              { text: 'Build', points: 0, why: 'It sounds helpful, but correcting them shuts the honest view down.' },
            ],
          },
          {
            q: 'They start a sentence, stop, and say "never mind". The host says lightly: "Only if you want to. What were you about to say?"',
            options: [
              { text: 'Block', points: 0, why: 'This one builds, as long as "never mind" is still allowed.' },
              { text: 'Build', points: 1, why: 'Right. A gentle door back in, with a way out.' },
            ],
          },
          {
            q: 'They say: "I use it every day. Well, most days." The host says: "Every day, great."',
            options: [
              { text: 'Block', points: 1, why: 'Right. "Most days" was the offer, and the host kept the tidier answer.' },
              { text: 'Build', points: 0, why: 'Look again. The correction was the interesting part.' },
            ],
          },
          {
            q: 'They say: "It reminds me of my grandmother\'s kitchen." The host says: "What was that kitchen like?"',
            options: [
              { text: 'Block', points: 0, why: 'This one builds. The host went straight through the door.' },
              { text: 'Build', points: 1, why: 'Right. One question, and the memory gets room to grow.' },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Some blocks slipped through', text: 'Most of us miss these on a first pass. Watch one of your own interviews with this list beside you.' },
          { min: 5, title: 'You spot most blocks', text: 'Now try it on a shoot. The hard part is noticing in real time, with a camera rolling.' },
          { min: 8, title: 'Eight out of eight', text: "You can see blocks and builds clearly. Write your crew's yes-and rule before the next shoot." },
        ],
      },
    },

    "Then go back to your last three interviews and mark every moment you smiled and moved on too quickly. Each of those was a scene you didn't play.",

    { type: 'h2', id: 'body', text: '9. BODY: watch posture and hands before words', toc: '9. BODY' },

    "People often react physically before they speak, with a shift in weight or a dropped chin. Use those cues to choose a better follow-up and to tell the camera where to point. Don't use them as a lie detector.",

    "Everything so far lives in language. Improvisers also read a partner's body as closely as their lines, and posture often reacts before the answer arrives. That's easy to miss when your eyes are on your notes.",

    {
      type: 'framework',
      id: 'body-read-framework',
      name: 'BODY READ',
      tagline: 'Eight steps for using what you can see.',
      parts: [
        { key: 'B', name: 'Before you ask, watch them stand', text: 'Open or guarded? Posture shows how they walked in.' },
        { key: 'O', name: 'Open with something physical', text: 'A task that gets a laugh or a move, not a clever answer.' },
        { key: 'D', name: 'During answers, watch in order', text: 'Hands first, then face, then words.' },
        { key: 'Y', name: 'Your follow-up answers the body', text: 'Respond to what you saw, not only to what you heard.' },
        { key: 'R', name: 'Read the half-second before the answer', text: "It's the least rehearsed frame you'll get." },
        { key: 'E', name: 'Extract that half-second', text: 'In the edit, it can open the video.' },
        { key: 'A', name: 'Ask the heavy question later', text: 'Wait until they look settled.' },
        { key: 'D', name: 'Direct the camera', text: 'Ask for a tight reaction shot whenever you see a shift.' },
      ],
    },

    "One correction to the usual advice. You'll often hear that the half-second before an answer is where people are most honest. We'd say it's where they're least edited. The idea that a micro-expression reveals the truth is pop psychology, and reading honesty from faces is contested. Use a cue as a reason to ask, never as proof.",

    `On a shoot for an audio brand, you ask about sound quality. Their arms cross for a second, and then a perfectly reasonable answer arrives. Follow the arms, gently: "Has the sound ever let you down?" The body suggested the better question before the person did.`,

    'The O step is the easiest to start with. A physical task gives people something to do with their mouth before they have to do anything with their opinions.',

    {
      type: 'video',
      brand: 'Hackdaily',
      title: 'Red Lorry Yellow',
      caption: 'Hackdaily, "Red Lorry Yellow". The title is the start of the tongue-twister "red lorry, yellow lorry": a physical task with no wrong answer, only funny ones.',
    },

    "Pre-answer frames also make strong openings. YouTube's Shorts analytics report how often viewers stayed to watch past the first seconds[^youtube-stayed-to-watch], so the first frame has to earn the next few. Our guide to [street interview hooks](/blog/street-interview-hooks) covers openings in detail.",

    { type: 'h2', id: 'play', text: '10. PLAY: start with a silly warm-up question', toc: '10. PLAY' },

    'Actors chase a result. Improvisers chase a state, and the state is play. Someone who is playing has stopped performing for the camera, so start with something absurd and low-stakes, then ease into the real question.',

    "In play, someone's guard drops on its own, because the exchange has stopped feeling like a test. Telling people to relax rarely gets you there. Playing first does, and that includes the host.",

    {
      type: 'framework',
      id: 'play-state-framework',
      name: 'PLAY STATE',
      tagline: 'Nine steps from warm-up to real question.',
      parts: [
        { key: 'P', name: 'Prime the space', text: 'Start with something absurd before you record.' },
        { key: 'L', name: 'Lower your own seriousness', text: "If you're not playing, they won't." },
        { key: 'A', name: 'Ask the silliest version first', text: 'The ridiculous cousin of your real question.' },
        { key: 'Y', name: 'Yield the energy', text: 'Let them lead for about a minute.' },
        { key: 'S', name: 'Signal safety', text: 'Loose shoulders, an easy smile: nothing can go wrong here.' },
        { key: 'T', name: 'Time the real question', text: "Ask it once they've forgotten the format." },
        { key: 'A', name: 'Accept everything', text: 'No judging or steering during play.' },
        { key: 'T', name: 'Transition gradually', text: 'No sudden gear change into depth.' },
        { key: 'E', name: 'Edit the warm-up separately', text: 'It often holds the most usable opening.' },
      ],
    },

    `A good model: "If this brand were a Bollywood villain, who would it be?" There's no right answer and no way to look foolish, yet the answer still tells you how they see the brand. Someone who picks a smooth, well-dressed villain sees a different brand from someone who picks a loud one.`,

    {
      type: 'video',
      brand: 'Hackdaily',
      title: 'Only Questions',
      caption: 'Hackdaily, "Only Questions". The title echoes Questions Only, an improv game in which every line has to be a question. One rule like that gives people something to play with before anything serious.',
    },

    'Type your product and the habit around it, and the warm-ups fill in as you type.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'warm-up-generator',
      props: {
        title: 'Warm-up generator',
        intro: 'Low-stakes, slightly absurd openers. Use one after consent and before your real question.',
        fields: [
          { id: 'product', label: 'Your product', placeholder: 'e.g. a bottle of hair oil', example: 'a bottle of hair oil' },
          { id: 'habit', label: 'The habit around it', placeholder: 'e.g. your Sunday hair oiling', example: 'your Sunday hair oiling' },
        ],
        templates: [
          { text: 'If {product} were a Bollywood villain, who would it be?', group: 'Characters', mechanism: 'Humour and playful interactions' },
          { text: 'At a family wedding, which relative would {product} sit next to?', group: 'Characters', mechanism: 'Humour and playful interactions' },
          { text: 'What would {product} order at a chai stall?', group: 'Characters', mechanism: 'Unexpected questions' },
          { text: 'Commentate {habit} like the last over of a cricket final.', group: 'Performances', mechanism: 'Challenges' },
          { text: 'Describe {habit} as a movie trailer. Deep voice, please.', group: 'Performances', mechanism: 'Challenges' },
          { text: 'If {habit} had a theme song, hum the first line.', group: 'Performances', mechanism: 'Humour and playful interactions' },
          { text: 'If {habit} could talk, what would it complain about?', group: 'Silly versions of real questions', mechanism: 'Unexpected questions' },
          { text: 'In a dance-off between {product} and its biggest rival, who wins?', group: 'Silly versions of real questions', mechanism: 'Debates and opposing opinions' },
          { text: 'Say "red lorry, yellow lorry" three times, fast. Then tell us about {habit}.', group: 'Physical', mechanism: 'Challenges' },
        ],
        note: 'Get consent before you record anything, warm-ups included. Then keep rolling: warm-ups often make the best openings.',
      },
    },

    "Play fails with people who are rushed or plainly not in the mood. It only works as an invitation. If someone doesn't want to be silly, thank them and ask your real question straight.",

    { type: 'h2', id: 'shoot-day-kit', text: 'What goes in an improv shoot-day kit?', toc: 'The shoot-day kit' },

    'The kit runs in three phases. Before the shoot, rewrite questions, audit blocks and write a warm-up. During it, run a two-column sheet and a pattern log. After it, pick callback words, mark spikes and pull pre-answer frames before you edit.',

    'Think of the ten rules as filters rather than a formula. You run the raw footage through them, and the video is whatever survives. The table shows where each one does its work.',

    {
      type: 'table',
      caption: 'Where each rule works, and what it leaves you',
      head: ['Rule', 'When', 'What it leaves you'],
      rows: [
        ['GIFT', 'During', 'A gift spotter column'],
        ['STATUS', 'Before and during', 'Five questions rewritten in the teacher frame'],
        ['SCENE', 'During', 'Patterns in the pattern log'],
        ['OFFER', 'During', 'Offers not yet followed, in the same log'],
        ['HEIGHTEN', 'During and after', 'Time codes for each spike'],
        ['CALLBACK', 'After', 'Three exact words per interview'],
        ['TRUTH', 'During', 'One reframe question, and the silence after it'],
        ['BLOCK', 'Before and after', 'A yes-and rule for the crew'],
        ['BODY', 'During and after', 'Reaction shots and pre-answer frames'],
        ['PLAY', 'Before and during', 'One absurd warm-up question'],
      ],
      rowHeaders: true,
    },

    {
      type: 'steps',
      id: 'improv-shoot-kit',
      title: 'How to run the improv kit on shoot day',
      intro: "Eight steps, in the order you'll need them.",
      howTo: true,
      supplies: ['A two-column shoot sheet', 'A notes app for the pattern log', 'Signed release forms, checked by a lawyer'],
      steps: [
        { name: 'Rewrite your questions', text: 'Put your top five into the teacher frame: "Can you help me understand…" instead of "What do you think of…".' },
        { name: 'Audit three old interviews', text: 'Mark every time you smiled and moved on. Turn what you find into a yes-and rule for the whole crew.' },
        { name: 'Write one absurd warm-up', text: "Something with no right answer, like the Bollywood villain question. Use it to read the person's energy before anything real." },
        { name: 'Brief the camera', text: 'Agree that any physical shift, from folded arms to a sudden laugh, gets a tight reaction shot.' },
        { name: 'Run the two-column sheet', text: 'Planned questions on the left, gift spotter on the right. Every surprise goes on the right as it happens.' },
        { name: 'Keep a pattern log', text: "Note the first hedge, the first heavy pause and any offer you haven't followed. Your next three questions come from here." },
        { name: 'Pick callback words', text: 'Before you open the timeline, write the three most specific words from the first two minutes of each interview.' },
        { name: 'Mark spikes and pre-answer frames', text: 'Flag every energy spike to cut from, and every half-second before an answer that could open the video.' },
      ],
    },

    { type: 'h3', id: 'the-two-column-sheet', text: 'The two-column shoot sheet' },

    'Type your product and the habit around it, then copy the finished sheet into a notes app or print it.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'shoot-sheet',
      props: {
        title: 'Your two-column shoot sheet',
        intro: 'Planned questions on the left, gift spotter on the right, then the pattern log and the edit notes.',
        fields: [
          { id: 'product', label: 'Your product', placeholder: 'e.g. cold-pressed hair oil', example: 'cold-pressed hair oil' },
          { id: 'habit', label: 'The habit around it', placeholder: 'e.g. oiling your hair', example: 'oiling your hair' },
        ],
        templates: [
          { text: 'Q1. Can you help me understand something? What does {habit} look like for you?   |   Gift spotter: ________', group: 'Left: planned questions. Right: gift spotter' },
          { text: 'Q2. Explain {product} to me like I have never seen it.   |   Gift spotter: ________', group: 'Left: planned questions. Right: gift spotter' },
          { text: 'Q3. If a friend asked you about {product}, what would you tell them?   |   Gift spotter: ________', group: 'Left: planned questions. Right: gift spotter' },
          { text: 'Q4. What is the part of {habit} nobody talks about?   |   Gift spotter: ________', group: 'Left: planned questions. Right: gift spotter' },
          { text: 'Q5. What would make you stop {habit}?   |   Gift spotter: ________', group: 'Left: planned questions. Right: gift spotter' },
          { text: 'Patterns spotted on {habit} (a hedge, a repeated word, a person they keep mentioning): ________', group: 'Pattern log' },
          { text: 'Offers not followed yet (a pause, a dropped sentence, a look when {product} came up): ________', group: 'Pattern log' },
          { text: 'Next three questions about {habit}, taken from this log: ________', group: 'Pattern log' },
          { text: 'Callback candidates for the {product} edit, three exact words from the first two minutes: ________', group: 'After the shoot' },
          { text: 'Spike time codes to cut the {product} video from: ________', group: 'After the shoot' },
          { text: 'Pre-answer frames that could open the {product} video: ________', group: 'After the shoot' },
        ],
        note: 'Keep the left column short. If the right column is still empty when you wrap, your questions were too tight.',
      },
    },

    { type: 'cta', text: 'Want the kit run for you, on your own product? See the format first. Scope, the number of trial videos and any fee are confirmed in writing.' },

    { type: 'h2', id: 'consent-language-locations', text: 'How do you handle consent, language and locations?', toc: 'Consent, language, locations' },

    "Improv habits only work with people who chose to be there. Get a clear yes on camera, use a signed release for commercial use, let people stop, subtitle both languages and check where you're allowed to film.",

    'A simple consent routine, before anything rolls:',

    {
      type: 'list',
      ordered: true,
      items: [
        'Say who you are and which brand the video is for, by name.',
        "Say where the video will appear, then ask on camera whether that's all right.",
        'Get a signed release from everyone you feature, and keep a printed copy for anyone who wants to read it first.',
        'Tell people they can stop at any point, and mean it.',
        "Don't film anyone under 18 without a parent's written consent.",
      ],
    },

    "India's data protection rules are coming into force in phases through 2027[^dpdp-rules], so have a lawyer check your release form. If anyone on camera is paid, works for the brand or was cast, India's endorsement guidelines expect you to say so clearly[^endorsement-know-hows]. This is general information, not legal advice. Our guide to [street interview consent in India](/blog/street-interview-consent-india) goes further.",

    "Language is the easy win. Plenty of answers switch between Hindi and English mid-sentence, or, in Bengaluru, between Kannada and English in one breath. Don't correct it, and don't ask for an English-only retake. The switch is often the most natural part of the clip, so brief your editor to subtitle both languages.",

    "For locations, semi-public spaces such as a café courtyard (with the owner's okay) or the edge of a market tend to cause less friction than a crowded footpath. Metro premises are different: Bengaluru's Namma Metro, for example, needs prior permission and charges a fee for shoots[^namma-metro-shoots]. Malls are private property, so ask management first. Scout the day before and keep two backup spots.",

    { type: 'h2', id: 'where-to-start', text: 'Which rule should you start with?', toc: 'Where to start' },

    "Start with BLOCK, because all it needs is an hour with old footage. If you've never filmed a street interview, start with PLAY instead. Either way, take one rule to your next shoot.",

    'Just one. The rest come easier once the first is a habit.',

    {
      type: 'callout',
      tone: 'note',
      title: 'What no rule can change',
      text: "We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger will respond in the moment. These rules don't change that. They make more room for the moments worth keeping.",
    },

    '[How a vox pop shoot works](/blog/how-a-vox-pop-shoot-works) walks through the full day around these habits, from the setup to the edit.',

    'Like talking to strangers? So do we. [Our careers page](/careers) is the place to start.',

    "If you'd rather hand the footpath to a crew, Kreators.Army plans, shoots and edits street interviews for D2C brands. See the format on your own brand first: scope, the number of trial videos and any fee are confirmed in writing. [Request a trial video](/contact).",
  ],

  faqs: [
    {
      q: 'What does "yes, and" mean in an interview?',
      a: '"Yes, and" means accepting what the other person offers and adding to it, instead of ignoring it. In an interview, the "yes" is noticing a surprising answer, a pause or a dropped sentence. The "and" is a follow-up that goes further into it. The opposite is a block, such as smiling and moving to the next question on your list.',
    },
    {
      q: 'How do you make strangers comfortable on camera?',
      a: 'Make strangers comfortable on camera by being clear first and lowering your status second. Say who you are, which brand the video is for and where it will appear, then ask for consent. After that, ask people to teach you something rather than rate a product. Questions about their own habits make them the expert, and most people relax once the exchange stops feeling like a test.',
    },
    {
      q: 'What is status in improv?',
      a: 'Status in improv is who leads an exchange from moment to moment: who sets the pace and the mood. It describes behaviour, not rank, so a servant can play high status to a king. Keith Johnstone made status a core idea of _Impro_, published in 1979. In a street interview the host starts with high status, so a good host hands it to the person answering.',
    },
    {
      q: 'What is a callback in video editing?',
      a: 'A callback in video editing is a cut that returns to a word or image from earlier in the footage, so the ending connects to the beginning. In a street interview, it might pair an early line with a later one that echoes it. Use one callback per video, never explain it on screen, and never pair lines in a way that changes what someone meant.',
    },
    {
      q: 'Can body language tell you if someone is lying?',
      a: 'No. Treat body language as a prompt, not a lie detector. The popular idea that a fleeting facial expression gives away the truth is contested. In a street interview, crossed arms or a long pause is a reason to ask a better follow-up question and to get a reaction shot. Never present a body language cue as proof of what someone thinks or feels.',
    },
    {
      q: "What's a good warm-up question for a street interview?",
      a: 'A good warm-up question for a street interview is silly, low-stakes and impossible to get wrong. "If this brand were a Bollywood villain, who would it be?" works because everyone has an answer and nobody can look foolish. Ask it after consent and before your real question, and keep recording: warm-up answers often make good openings.',
    },
    {
      q: 'Do interviewers need improv training?',
      a: "No. Interviewers don't need formal improv training, though a class can help. The ten habits in this guide can be practised on any shoot. The fastest teacher is your own footage: watch three old interviews, mark every place you moved on too quickly and fix one habit at a time.",
    },
    {
      q: 'What is a gift spotter column?',
      a: 'A gift spotter column is the right-hand column of a two-column shoot sheet. Planned questions go on the left. On the right, the interviewer notes every unexpected moment as it happens: a hesitation, an odd laugh, an answer that surprised the person giving it. By the end of the day, the gift spotter column is a shortlist for the edit.',
    },
  ],

  sources: [
    {
      id: 'hoopla-impro-glossary',
      title: 'Improv Glossary',
      url: 'https://www.hooplaimpro.com/improv-glossary.html',
      publisher: 'Hoopla Impro',
      note: 'Offer, blocking, status, heightening, reincorporation, shelving, game of the scene and Questions Only. The terms status, offers and blocking go back to Keith Johnstone, Impro (1979). CLAIMS.md R15.',
    },
    {
      id: 'vox-pop-vs-expert-2022',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter Brill',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert quoting a poll, but shifted personal opinion more. CLAIMS.md R11.',
    },
    {
      id: 'pratfall-effect',
      title: 'Pratfall effect',
      url: 'https://en.wikipedia.org/wiki/Pratfall_effect',
      publisher: 'Wikipedia',
      note: 'Aronson, Willerman and Floyd (1966), Psychonomic Science 4: 227-228. A blunder helped only the highly capable contestant. CLAIMS.md R02.',
    },
    {
      id: 'voss-mirroring',
      title: 'Never Split the Difference (Expert Interview with Chris Voss)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Chris Voss, co-author of Never Split the Difference (2016), on mirroring (repeating the last one to three words) and labelling ("it sounds like"). CLAIMS.md P08.',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram Shares Algorithm Insights To Inform Strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'Adam Mosseri: watch time, likes and sends are the top three ranking signals. CLAIMS.md P02.',
    },
    {
      id: 'youtube-stayed-to-watch',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'Shorts "stayed to watch": the share of times viewers watched past the first seconds. CLAIMS.md P01.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI, via The Week',
      date: '2025-11-14',
      note: 'DPDP Rules notified November 2025, duties phasing in through about May 2027. CLAIMS.md P07.',
    },
    {
      id: 'endorsement-know-hows',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose material connections with terms such as "advertisement", "sponsored" or "paid promotion". CLAIMS.md E26.',
    },
    {
      id: 'namma-metro-shoots',
      title: 'Bengaluru: After 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023-11-25',
      note: 'Namma Metro shoots need prior permission and a licence fee. CLAIMS.md P06.',
    },
  ],

  related: ['street-interview-techniques', 'how-a-vox-pop-shoot-works', 'street-interview-consent-india', 'street-interview-hooks'],
};

export default post;
