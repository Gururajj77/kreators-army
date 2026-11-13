import type { Post } from '../types';
import meta from './what-goes-in-a-vox-pop-brief.meta';

const post: Post = {
  meta,

  answer:
    'A vox pop brief tells a street-interview crew six things before anyone films: the objective, how prominent the brand should be, the response you want from viewers, the must-haves, a simple brand guide and 3 to 5 reference videos. Kreators.Army locks it before the shoot, because changes after filming can need new footage.',

  takeaways: [
    'A vox pop brief has six parts: objective, brand integration, desired viewer response, non-negotiables, brand guide and 3 to 5 reference videos.',
    "Brief the interaction, not the lines. You can't script strangers, so describe the video's job, the feeling and the person instead.",
    'Build the mirror before you open the door: viewers should recognise themselves before the brand or the call to action arrives.',
    'Before you write, name one specific person and test your core message on a few strangers, off camera.',
    'Tick only the must-haves every cut needs, and send the exact wording for any claim or disclaimer.',
    'Lock it all before the shoot. Edit-level changes are included; footage nobody captured can mean a reshoot.',
  ],

  body: [
    "\"What do you need from me for the trial?\" It's a real question on our FAQ page, and the answer fits in two words: the brief.",

    'A brief sounds like paperwork. On a street shoot it does real work. It decides which question a stranger hears on the footpath, how soon your product enters the frame and what the edit keeps. Leave it vague and the crew has to guess, and guesses cost footage.',

    "This guide takes the six parts of our brief in order, then steps back to the thinking that should happen before you write one. You'll leave with a filled-in example, a brief builder and the nine points of our [lock list](/blog/vox-pop-glossary#lock-list).",

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. The six fields and the lock list are the ones we use. The exercises around them are planning ideas you can run on your own.',

    {
      type: 'definition',
      id: 'vox-pop-brief',
      term: 'Vox pop brief',
      text: 'A short document that tells a street-interview crew what a batch of videos is for, before filming: the objective, how much brand to show, the viewer response, the must-haves, a brand guide and reference videos. It briefs the interaction, not the lines.',
    },

    // ---------- The six parts ----------

    { type: 'h2', id: 'the-six-parts', text: 'What are the six parts of a vox pop brief?', toc: 'The six parts' },

    "A vox pop brief has six parts: objective, brand integration, desired viewer response, non-negotiables, brand guide and references. They're the six cards in [the brief on our trial page](/trial#brief), and the request form walks you through them in order.",

    {
      type: 'list',
      ordered: true,
      items: [
        '**Objective:** what the videos are mainly for. Four options.',
        '**Brand integration:** how prominently the brand should appear. Six options.',
        '**Desired viewer response:** what people should think, feel or do after watching, in your own words.',
        '**Non-negotiables:** what every video must include. Nine options, and you tick as many as apply.',
        '**Brand guide:** a simple guide to your brand, sent as a link.',
        '**References:** 3 to 5 videos that best show the direction you want.',
      ],
    },

    "Look at what's missing. There's no script field, no lines for the participant and no shot list.",

    "That's deliberate.",

    "A scripted ad brief tells the crew what people will say. A vox pop brief can't, because the people are strangers who haven't walked past yet. So it describes the interaction instead: the video's job, the feeling it should leave, how much brand the moment can carry and what every cut needs.",

    "We break every street video into six parts: setup, question, participant, follow-up, reaction and edit. The brief doesn't write any of them. It gives the crew enough to make each one on purpose.",

    { type: 'h3', id: 'how-it-differs', text: 'How it differs from other video briefs' },

    "If you've briefed a production house or a user-generated content (UGC) creator, a few habits need unlearning. This is how we see the three side by side.",

    {
      type: 'table',
      caption: 'A scripted ad brief, a UGC creator brief and a vox pop brief compared',
      head: ['What it covers', 'Scripted ad brief', 'UGC creator brief', 'Vox pop brief'],
      rows: [
        ['What you write', 'The lines, the shots, the voiceover', 'Talking points for one creator', 'The interaction: the job, the question, who to ask'],
        ['Who speaks', 'Actors or a voiceover artist', 'One creator who uses the product', 'Strangers on the street, with a host'],
        ['What you control', 'Every word', 'Most of the message', 'Everything except what strangers say'],
        ['What can surprise you', 'Very little', 'The delivery', 'The answers, which is the point'],
        ['A vague brief gets you', 'A bland script', 'A generic review', 'Polite answers nobody shares'],
      ],
      rowHeaders: true,
    },

    'Read the last row twice. A vague objective leads to a vague question, and a vague question gets polite answers. Polite answers make a flat video.',

    'The brief is where you catch the first domino.',

    'New to the format? Start with [what vox pop content is](/blog/what-is-vox-pop-content). Our short definition:',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    // ---------- Objective ----------

    { type: 'h2', id: 'objective', text: 'Objective: what are these videos mainly for?', toc: 'Objective' },

    'Pick the one main use for the batch. The form offers four options, and your choice changes the question, how soon the brand appears and how the edit ends.',

    {
      type: 'table',
      caption: 'The four objectives in the brief and what each one changes',
      head: ['Objective', 'What it changes', 'Mechanisms that often fit'],
      rows: [
        ['Organic content (value or entertainment first)', "A question about the viewer's life. The brand arrives late, if at all.", 'Personal experiences, Humour and playful interactions'],
        ['Organic content with subtle brand awareness', 'Works without the brand, but the product sits in the moment.', 'Guessing and reveals, A/B comparisons'],
        ['Paid ads or performance marketing', 'Opens on a problem, shows the product earlier, closes on one next step.', 'Product reactions, Challenges'],
        ['Something else', 'An event recap, a store launch, a festival push: tell us in a line.', 'Whatever fits the job'],
      ],
      rowHeaders: true,
    },

    "Torn between two? Pick the one you'll judge the videos on. If you'll measure the batch on cost per purchase, your objective is paid, even if you hope the videos also do well on your own feed.",

    { type: 'h3', id: 'organic-or-paid', text: 'Organic or paid: the choice that moves everything else' },

    "Organic content has to earn its place between friends' posts. In January 2025, Instagram's head, Adam Mosseri, said the three signals that matter most for ranking are watch time, likes and sends[^mosseri-signals]. A street answer people want to send to a friend fits that well.",

    'A hard sell rarely gets sent.',

    "Paid video works differently. The viewer didn't choose it, so the first seconds have to name a problem they recognise. That's why a paid objective usually pulls the product forward and closes on a single next step.",

    'Try it on five situations from a made-up bakery. Each answer names a mechanism that would suit it.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'which-objective-quiz',
      props: {
        title: 'Which objective is this?',
        questions: [
          {
            q: 'People laughing about the worst breakfast they have eaten before work. The brand can wait.',
            options: [
              { text: 'Organic content (value or entertainment first)', points: 1, why: 'Right. It has to be worth watching with no brand in it. Try Personal experiences, or Humour and playful interactions.' },
              { text: 'Organic content with subtle brand awareness', points: 0, why: 'Close, but "the brand can wait" puts the story first.' },
              { text: 'Paid ads or performance marketing', points: 0 },
            ],
          },
          {
            q: 'An ad for people who put bread in their cart last week and never checked out.',
            options: [
              { text: 'Organic content (value or entertainment first)', points: 0, why: 'This one is aimed and paid for.' },
              { text: 'Paid ads or performance marketing', points: 1, why: 'Right. Open on a problem they recognise and show the product early. Try Product reactions.' },
              { text: 'Something else', points: 0 },
            ],
          },
          {
            q: 'A "chai or coffee with your toast?" debate people want to settle in the comments, with the bakery bag in shot.',
            options: [
              { text: 'Organic content (value or entertainment first)', points: 0, why: 'The bag in shot means some brand presence is wanted.' },
              { text: 'Organic content with subtle brand awareness', points: 1, why: 'Right. It works without the brand, but the product sits in the moment. Try A/B comparisons.' },
              { text: 'Paid ads or performance marketing', points: 0 },
            ],
          },
          {
            q: "A recap of the bakery's stall at a weekend food market, which the organiser will share too.",
            options: [
              { text: 'Organic content (value or entertainment first)', points: 0, why: 'The job is an event recap with a partner. Say so.' },
              { text: 'Paid ads or performance marketing', points: 0 },
              { text: 'Something else', points: 1, why: 'Right. Describe it in a line. A crowd suits Audience participation.' },
            ],
          },
          {
            q: 'Three new opening lines to test against each other, each with ad spend behind it.',
            options: [
              { text: 'Organic content with subtle brand awareness', points: 0, why: 'The spend and the test make this performance work.' },
              { text: 'Paid ads or performance marketing', points: 1, why: 'Right. Plan several openings from one shoot. Guessing and reveals gives you natural ones.' },
              { text: 'Something else', points: 0 },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Worth a second read', text: 'Go back to the table and ask of each situation what the videos will be judged on.' },
          { min: 3, title: 'Nearly there', text: 'Subtle brand awareness is the easiest to mix up: the video works without the brand, but the brand is in the moment.' },
          { min: 5, title: 'Spot on', text: 'Now write your own objective as one line in the brief.' },
        ],
      },
    },

    // ---------- Brand integration ----------

    { type: 'h2', id: 'brand-integration', text: 'Brand integration: how prominent should the brand be?', toc: 'Brand integration' },

    'As little as your objective allows, and never before the viewer feels understood. The form offers six options.',

    {
      type: 'callout',
      tone: 'tip',
      title: 'Our rule: the mirror before the door',
      text: 'The mirror is the moment a viewer sees someone like them on screen and thinks "that\'s exactly how I feel". The door is the brand, the link or the offer. Open the door first and the viewer files the video as an ad. That switch rarely flips back.',
    },

    "Order matters more than polish, and Indian feeds show why. In PwC's 2024 survey of Indian shoppers, 77% said they discover new brands on social media and 81% check reviews there. Yet social media was their least-trusted channel, with privacy the main worry[^pwc-voice-2024]. Trust on the feed is thin, so a moment that looks like an ad has little to fall back on.",

    'Where each option tends to work:',

    {
      type: 'table',
      caption: 'The six brand integration options and when each one fits',
      head: ['Option', 'On screen', 'Works when', 'Watch for'],
      rows: [
        ['Minimal (story first)', 'The product appears late, briefly or only in the caption', 'The objective is organic and the topic carries the video', 'Viewers may not connect the video to you'],
        ['Subtle branding throughout', 'A bag, a cup or a logo sits in frame', 'You want recall without a pitch', 'Placement that looks staged'],
        ['Product visible throughout', 'The product is part of the interaction from the start', "It's a taste test, a guess or a reaction", 'Questions that drift into a sales pitch'],
        ['Product only in the intro or outro', 'A clean product shot opens or closes the cut', 'The middle is about people, not the product', 'An intro shot that delays the hook'],
        ['Creator holding the product', 'The host holds the product or hands it over', 'You want one face linked to the brand', 'Agreeing who the host speaks for'],
        ['Something else', 'Whatever you describe in a line', "Your idea doesn't fit the five above", 'Saying it early, before props are planned'],
      ],
      rowHeaders: true,
    },

    "\"Creator holding the product\" raises a question worth settling early: who's asking? It can be our interviewer, or your founder with our team beside them. Where the interviewer represents your brand, we agree the introduction and positioning before the shoot.",

    "More brand doesn't have to mean more pitch, either. Your product can be part of the conversation, but we won't force a set brand pitch onto a stranger.",

    'Strangers can tell, and so can the people watching.',

    'Same product, same street, two storyboards. Switch between them to see the mirror and the door in the right order.',

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'too-much-brand',
      props: {
        title: 'Too much brand, or just enough?',
        before: {
          label: 'Too much brand',
          text: 'The door opens before the mirror is built. Viewers file it as an ad in the first second.',
          points: [
            'First second: a logo card, then the pack held up to the lens.',
            'The question: "What do you think of our new sourdough?"',
            'The middle: three polite answers, each some version of "it\'s nice".',
            'The end: an offer card and "link in bio" over the last answer.',
          ],
        },
        after: {
          label: 'Just enough',
          text: 'Same product, same street. The viewer recognises themselves first, and the brand arrives once they do.',
          points: [
            'First second: a stranger mid-laugh, with the question on screen: "Breakfast before work, or no time?"',
            'The middle: two answers that clash. One person never eats before noon; the next preps breakfast the night before.',
            'The turn: the host hands over a slice. A first bite, an honest reaction.',
            'The end: the bag in hand, the brand said once, and one line in the caption.',
          ],
        },
        note: 'Only the order changed. The brand still gets its moment. It just arrives after the viewer has a reason to care.',
      },
    },

    // ---------- Desired viewer response ----------

    { type: 'h2', id: 'viewer-response', text: 'Desired viewer response: what should people think, feel or do?', toc: 'Viewer response' },

    'Write it as one sentence a viewer might say after watching, in your own words. The form gives you an open text box here, because no menu can say it for you.',

    "Weak briefs fail here in a predictable way. They list everything: handmade, premium, good value, delivered by 7 am, and please follow us. That's five jobs for one short video, and it will do none of them well.",

    'We recommend each video has one primary creative job. A video might be built to:',

    {
      type: 'list',
      items: ['Create curiosity', 'Address a specific problem', 'Generate product interest', 'Demonstrate a benefit', 'Build social proof', 'Drive consideration'],
    },

    "If you're featuring several products, we can plan the batch across them: one job per video, and the batch covers the range. Giving each video [its own mechanism](/blog/eleven-ways-to-vary-a-vox-pop-batch) stops five videos from asking the same thing five times.",

    "Clotrio's library video shows the shape. Its two-word title names the single idea the whole cut is built around.",

    { type: 'video', brand: 'Clotrio', title: 'Nothing Poking', caption: 'Clotrio, "Nothing Poking": one idea, named in two words, carried by one video.' },

    { type: 'h3', id: 'think-feel-do', text: 'Think, feel or do: write the sentence, not the adjective' },

    {
      type: 'comparison',
      title: 'Weak and strong answers to the viewer response field',
      left: {
        label: 'Weak',
        items: ['"Brand awareness."', '"Viewers should love the product."', '"Engagement."', '"Make people want to buy."'],
      },
      right: {
        label: 'Strong',
        items: [
          'Think: "That\'s exactly what my weekday mornings look like."',
          'Feel: a little called out about skipping breakfast, then amused.',
          'Do: send it to the flatmate who eats toast standing up.',
          "Do: tap through to see this week's loaves.",
        ],
      },
      verdict: 'A strong answer names a viewer, a reaction and, where you can, a next step.',
    },

    'Aim at "think" as well as "feel". In a 2022 experiment with TV news items, viewers rated vox pops as less trustworthy than an expert quoting a poll, yet the vox pops moved their personal opinions more[^vox-pop-vs-expert]. People can doubt ordinary voices and still be moved by them.',

    'Media researchers call the wider effect exemplification: one vivid person on screen sways judgments more than a percentage does[^exemplification]. So write down the thought you want left behind, not only the mood.',

    "Contrast helps too. A study of 2,000 vox pops on Flemish TV news found that a large majority of news items showed only one point of view[^opinion-balance]. Brand videos don't have to copy that. Two answers that clash give the viewer a side to pick, and picking a side is how they start to think.",

    // ---------- Non-negotiables ----------

    { type: 'h2', id: 'non-negotiables', text: 'Non-negotiables: what must every video include?', toc: 'Non-negotiables' },

    'Tick only what has to be in every single cut. The form lists nine options. Each one you tick takes a little room from the street moment, so the shortest honest list wins.',

    'This is the field where good intentions pile up. Each person on your team adds one reasonable thing. Soon one short video has to show the logo, say the brand name twice, hold a product shot, end on an offer and carry a disclaimer.',

    "There's no room left for a stranger to be interesting.",

    'Here are the nine, as the form lists them:',

    {
      type: 'table',
      caption: 'The nine non-negotiables and what each one asks of a street interview',
      head: ['Must-have', 'What it asks of the street moment', 'How to keep it light'],
      rows: [
        ['Product shots', 'Clean shots of the product, apart from the talk', 'Shoot them separately so the interaction stays loose'],
        ['Logo visible', 'The logo in frame or on screen', 'On the bag, or a small end card'],
        ['Brand mention', 'Someone says the brand name', 'Let the host say it once, near the end'],
        ['Call to action', 'The video points somewhere', 'One action, in the last seconds or the caption'],
        ['People trying the product', 'A taste, a touch or a try-on on camera', 'Pick a product people can try in under a minute'],
        ['Intro hook', 'A strong first line or moment', 'Usually found in the edit, from the best answer'],
        ['Closing statement', 'A fixed line at the end', "Short, and in the brand's own voice"],
        ['Disclaimer', 'Required text on screen or in the caption', 'Send the exact wording with the brief'],
        ['Something else', 'Anything not listed above', 'Describe it in one line, with the reason'],
      ],
      rowHeaders: true,
    },

    "Tick \"Intro hook\" if you want it, but don't try to write it. YouTube's own Shorts analytics show how often viewers stayed to watch past the first seconds[^youtube-stayed], so the opening has to earn the rest. On a street shoot it's rarely scripted. The best hook is usually the best answer of the day, moved to the front in the edit.",

    'Some must-haves cost the street moment nothing, because the game already contains them. BreadBerry\'s library video "Blindfold Bun" says it in the title: when the game is a blindfolded taste, "People trying the product" is already part of it.',

    { type: 'video', brand: 'BreadBerry', title: 'Blindfold Bun', caption: 'BreadBerry, "Blindfold Bun": the must-have and the game, named in one title.' },

    { type: 'h3', id: 'claims-and-disclaimers', text: 'Claims and disclaimers belong in the brief' },

    "If your product makes a claim, the claim is yours to stand behind. The Advertising Standards Council of India's code says claims about objectively ascertainable fact \"should be capable of substantiation\"[^asci-code].",

    'A delighted passer-by is not substantiation.',

    "So the brief should say which claims you can back up, in exactly what words, and where they go: the caption, an on-screen card or the host's line. Never in a stranger's answer.",

    {
      type: 'callout',
      tone: 'warning',
      title: 'Disclosure works the same way',
      text: 'If anyone on camera was cast, works for you or has another material connection to the brand, India\'s endorsement guidelines expect that to be disclosed clearly, with words such as "advertisement", "sponsored" or "paid promotion"[^dca-endorsement]. Tick "Disclaimer" and paste the exact wording. This is general information, not legal advice.',
    },

    { type: 'h3', id: 'things-to-avoid', text: 'Say what to avoid, and which languages work' },

    "The form has no box called \"things to avoid\", but our lock list does. Put them under \"Anything else we should know?\": topics, words, rival brands, settings that clash with your image. If your product is for teenagers, plan on nobody under 18 appearing without a parent's written consent.",

    "Add a line on language while you're there. On an Indian street, answers often switch language mid-sentence. Say which languages work for your audience, and whether the captions should translate them.",

    // ---------- Brand guide ----------

    { type: 'h2', id: 'brand-guide', text: 'What goes in the brand guide?', toc: 'Brand guide' },

    'A simple guide in two parts: brand identity, and editing and design. Send it as a link, because the form takes a link rather than an upload.',

    {
      type: 'list',
      items: [
        '**Brand identity:** personality in 3 to 5 words, positive keywords, negative keywords, things to avoid.',
        '**Editing and design:** overall editing style (fast-paced, premium, cinematic, documentary, raw UGC and so on), typography, brand colours, motion graphics style, caption style, music direction, sound effects (minimal, energetic, meme-style and so on), transitions, pacing, logo usage, product shot guidelines.',
      ],
    },

    'Most of that list is for the edit. What changes the street is the first part, especially the negative keywords. "Never cheap, never preachy" tells a host more about what to ask than a colour code does.',

    { type: 'h3', id: 'no-brand-guide', text: "If you don't have one yet" },

    "Plenty of young D2C brands don't, and that's fine. A shared doc of about ten lines does the job:",

    {
      type: 'list',
      items: [
        'Three to five words for your personality, and two words you never want to be called.',
        'Your logo files and the one colour that has to appear.',
        'A caption style you like, linked from any video.',
        'Music direction in a phrase: "no trending audio", "acoustic only", "whatever fits".',
        'Product shot rules: which side faces the camera, and what never sits next to it.',
      ],
    },

    'Paste the link into the brief. If the doc needs a login, fix the sharing settings first.',

    'A guide nobody can open is the same as no guide.',

    // ---------- References ----------

    { type: 'h2', id: 'references', text: 'References: how do you choose 3 to 5 videos?', toc: 'References' },

    'Pick 3 to 5 videos that each show one thing you want, and say what that thing is. A reference without a note leaves the crew guessing which part you liked.',

    "The form takes up to five links. Send one and we're reading tea leaves. Fill all five with videos that pull in different directions and they start to argue with each other.",

    {
      type: 'list',
      ordered: true,
      items: [
        "One from your own category, so we can see what you're used to and what you're tired of.",
        'One from outside your category with the energy you want. Some of the best references for a bakery are about phones.',
        'One street interview, from anyone, with the pace or tone you like. Our [library of real street interviews](/video-library) is there for exactly this.',
        'Optional: one you dislike, labelled "not this".',
        "Optional: your own best post, so we can see your audience's taste.",
      ],
    },

    'Then add a line to each link. Four prompts cover it:',

    {
      type: 'list',
      items: [
        "**What to copy:** the question, the pacing, the captions, the reveal, the host's energy.",
        "**What to ignore:** the music, the location, the length, anything you didn't like.",
        '**Why it worked on you:** one honest sentence.',
        '**Where it would live:** your feed, an ad, or both.',
      ],
    },

    'A note like "copy the quick cuts between answers, ignore the music" saves a round of feedback later.',

    "References show direction, not a script. We'd rather take the feel than copy another creator's video shot for shot: how fast it moves, how playful it is, how much product it shows.",

    // ---------- Who exactly ----------

    { type: 'h2', id: 'who-exactly', text: 'Before you write it: who exactly are you talking to?', toc: "Who you're talking to" },

    'Name one specific person, not a demographic. "Women 25 to 40 in metros" can\'t be found on a footpath. "First-job renters who skip breakfast" can, and so can the question that will stop them.',

    "This step decides who the host walks towards. We call it the kirana principle, after the kirana (neighbourhood grocery) store where the owner reaches for your usual before you've said a word. Two ideas from it matter most for a brief:",

    {
      type: 'list',
      items: [
        '**Know the person before the audience.** Write down one person: their week, their daily annoyance. "Young professionals" is an audience. "Someone in their first job who eats breakfast standing up" is a person.',
        '**Narrow the target until it feels personal.** Keep cutting until a viewer could think "this is about me". Wide targets make wide questions, and wide questions get "it\'s nice".',
      ],
    },

    { type: 'h3', id: 'in-group-signal', text: 'The in-group signal' },

    'People will take sides over almost nothing. In Henri Tajfel\'s 1970s experiments, boys split into groups by something as trivial as a painting preference still gave more rewards to their own group[^tajfel]. A shared label is enough to make people feel like a "we".',

    'For a brief, describe your buyer by what they believe and what annoys them, not only by age or city. Then name something only that group would recognise. "You\'re the kind of person who reads the back of the pack first" speaks to a label-reader, because it describes who they are, not what they buy.',

    "Test it on someone outside the group. If they nod along too, the signal isn't specific enough.",

    { type: 'h3', id: 'the-grid', text: 'A grid for matching the question to the person' },

    'Match the question to the person, not the product. A simple planning grid crosses who they are, where you might meet them and which of three question types fits:',

    {
      type: 'list',
      items: [
        '**Aspiration:** who they would be without limits. "If money weren\'t a problem, what would you do differently?"',
        '**Taboo:** what people rarely say out loud. "How does your salary feel next to where you thought you\'d be by now?"',
        '**Contrast:** what they know that the crowd gets wrong. "What do most people get wrong about their skincare routine?"',
      ],
    },

    "Here's an example grid. The archetypes and cities are guesses to test on the day, not facts about anyone who lives there.",

    {
      type: 'table',
      caption: 'An example grid: who, where, question type and a question to try',
      head: ['Who (a guess to test)', 'Where', 'Question type', 'A question to try'],
      rows: [
        ['A hustler building something on the side', 'Mumbai', 'Contrast', '"What do other founders get wrong about growing a business?"'],
        ['An explorer who likes to make things', 'Bengaluru', 'Aspiration', '"If you started from scratch today, what would you build?"'],
        ['A romantic who values loyalty', 'Delhi', 'Taboo', '"What does real loyalty look like these days?"'],
      ],
      rowHeaders: true,
    },

    'Same brand, three people, three questions. Fill the grid with your own buyers, then put the row you believe in most into the brief.',

    "Be deliberate about who appears on camera, too. A 2017 study of the same Flemish sample found the people interviewed reflected the population's age and gender mix, but rarely included ethnic minorities or people with disabilities[^beckers-walgrave]. If you want viewers across India to see themselves, say so in the brief, and we'll plan who we approach with that in mind.",

    // ---------- Pressure test ----------

    { type: 'h2', id: 'pressure-test', text: 'Before you film it: does your message survive a stranger?', toc: 'The pressure test' },

    'Run a pressure test. Say the one line you most want people to understand to a handful of strangers, word for word, and ask what they think it means. It tests your message, not your production, and uses no footage at all.',

    "Take your best line: the headline on your site, the hook your team is proud of, the promise on the pack. Go where people are already waiting: a chai stall, a bus stop, the queue at a ticket counter. Leave the camera in the bag. You're testing a sentence, and nobody has agreed to be filmed.",

    'Watch their face as closely as you listen. A nod, a squint, a pause before they answer, a polite "nice". The words will be kind.',

    'The pause is the useful part.',

    {
      type: 'script',
      id: 'pressure-test-script',
      title: 'The pressure test script',
      context: 'Off camera, wherever people have a minute. A handful of people is enough to hear a pattern.',
      lines: [
        { direction: 'Approach someone who looks like they have a minute. No camera, no mic.' },
        { speaker: 'You', text: "Can I try something quick on you? I'll say one sentence, and I want the first thing that comes to mind. Be honest. You won't offend me." },
        { direction: "Read your line exactly as written. Don't explain it." },
        { speaker: 'You', text: 'Did that make sense? What did you think it meant?' },
        { direction: 'Write down their words, not your summary of them.' },
        { speaker: 'You', text: 'If you were telling a friend about it, how would you put it?' },
        { speaker: 'You', text: "Thank you. That's really useful." },
      ],
    },

    'The gap between what you meant and what they heard is your messaging problem. Fix it on paper, run the test again, and only then write the core message into the brief.',

    'That last question earns its place. How a stranger would explain your product to a friend is often a better line than yours. When it is, put their phrasing in the brief and tell us it came from the street.',

    "When this doesn't work: lines that only make sense with the product in hand, like a taste or a texture. Test those on the shoot day instead, with the product.",

    // ---------- Questions in the brief ----------

    { type: 'h2', id: 'questions-in-the-brief', text: 'Should you write the questions into the brief?', toc: 'Questions in the brief' },

    "You can suggest them, but brief the topic and the feeling rather than the exact words. Questions about your product get polished answers. Questions about the viewer's life get stories.",

    'Left to ourselves, most of us write product questions first: "What do you think of the packaging?" "Would you recommend us to a friend?" They sound sensible in a meeting room. On a footpath they get rehearsed answers that nobody remembers by evening.',

    'Questions like those treat the video as social proof. What holds a viewer is closer to a social mirror.',

    {
      type: 'comparison',
      title: 'Social proof or social mirror',
      left: { label: 'Social proof', items: ['"Look how many people like us."', 'Asks the viewer to be impressed', '"Would you recommend us to a friend?"'] },
      right: { label: 'Social mirror', items: ['"That person is just like me."', 'Asks the viewer to recognise themselves', '"What does breakfast look like on a weekday?"'] },
      verdict: 'We think recognition is the better reason to send a video to a friend.',
    },

    "So write the question you'd ask about their life, and let the product arrive inside it. Ask about weekday breakfasts, then hand over a slice after the first answer.",

    "YourPlug's library video \"Focus Killers\" is named after a topic, not a product. That's the shape to aim for.",

    { type: 'video', brand: 'YourPlug', title: 'Focus Killers', caption: 'YourPlug, "Focus Killers": the title names the topic, not the product.' },

    "You don't have to write questions at all. Every package includes concepts, questions and interactions planned for your objective. If you have favourites, add them under \"Anything else we should know?\" and expect us to reshape them for the street.",

    { type: 'h3', id: 'the-second-answer', text: 'Leave room for the second answer' },

    "Don't build the brief around the first answer. It's rarely a lie. It's the safe version, the one that sounds sensible with a camera pointed at you. The second comes after people have heard themselves talk, and a short follow-up is often all it takes: \"Interesting, why though?\"",

    'We call it the second question rule. A good brief describes the answer you hope the follow-up finds, not just the opening question. The examples below are made up, to show the pattern.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'second-answer',
      props: {
        title: 'Illustrative: the first answer, then the second',
        items: [
          {
            question: 'What do you eat before work?',
            first: '"Something light. Usually toast."',
            second: '"Honestly? Nothing. I tell everyone it\'s toast, but I\'m out the door with a coffee."',
            note: 'The follow-up: "Interesting, why though?"',
          },
          {
            question: 'How do you choose a gift for someone?',
            first: '"Something useful, usually."',
            second: '"Honestly? Whatever arrives by tomorrow. I always remember the birthday the night before."',
            note: 'The follow-up: "Useful how?"',
          },
        ],
      },
    },

    'Our [bank of 120 vox pop questions](/blog/vox-pop-questions) sorts question shapes by category, and the [street interview techniques guide](/blog/street-interview-techniques) has follow-up scripts.',

    // ---------- Lock list ----------

    { type: 'h2', id: 'lock-list', text: 'What does the crew lock before each shoot?', toc: 'What we lock' },

    'Nine things, the same nine every time. Your brief is the starting point for all of them.',

    'The brief is what you send. The lock list is what we agree together in pre-production alignment. Most of it comes straight from your six answers. The audience, the core message, things to avoid and special production needs take a few extra lines, and those lines save a call later.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'lock-list-check',
      props: {
        title: 'The lock list',
        intro: 'Tick each point once your brief answers it. Your ticks stay in this browser.',
        items: [
          { id: 'primary-objective', text: 'Primary objective', detail: 'One main use for the batch.' },
          { id: 'products', text: 'Product or products featured', detail: 'With several, say which video gets which.' },
          { id: 'audience', text: 'Target audience', detail: 'A specific person, not a demographic.' },
          { id: 'core-message', text: 'Core message or value proposition', detail: 'One sentence that survived the pressure test.' },
          { id: 'audience-response', text: 'Desired audience response', detail: 'Think, feel or do.' },
          { id: 'brand-info', text: 'Required brand and product information', detail: 'Names, variants, claims you can back up, disclaimer wording.' },
          { id: 'mandatory', text: 'Mandatory requirements', detail: 'The non-negotiables you ticked.' },
          { id: 'avoid', text: 'Things to avoid', detail: 'In the form, under "Anything else we should know?".' },
          { id: 'production', text: 'Any special production requirements', detail: 'A location, a large prop, a product that must stay cold. We batch-shoot, so these are agreed in pre-production.' },
        ],
        done: 'All nine answered. Your brief is ready to send.',
      },
    },

    "That's the point of a fixed list: nothing important gets decided on the footpath.",

    // ---------- Why lock ----------

    { type: 'h2', id: 'why-lock-it', text: 'Why lock the brief before filming?', toc: 'Why lock it' },

    "Because a street moment can't be asked for twice. Creative direction, branding expectations and must-haves should all be final before the shoot.",

    'Our own wording on this is plain:',

    {
      type: 'quote',
      text: "New requirements or changes after filming may need extra editing, revised deliverables, or a reshoot if they depend on footage we didn't capture.",
      attribution: 'Kreators.Army, on the brief',
    },

    'A scripted shoot can pick up a missing line another day with the same actor. A street interview can\'t. The person who gave the perfect answer has gone home, and the moment won\'t happen the same way twice. If "logo in every shot" arrives after the shoot, there may be no footage where that was possible.',

    {
      type: 'comparison',
      title: 'After the shoot: an edit, or new footage?',
      left: {
        label: 'Usually an edit-level change',
        items: ['Caption and on-screen text changes', 'Trims and sequencing', 'Which answer opens the video', 'A different end card'],
      },
      right: {
        label: 'Usually needs new footage',
        items: ['A product that was never on set', 'A new must-have, like people trying the product', 'A different question or setup', 'A different kind of person on camera'],
      },
      verdict: 'Minor edit-level revisions are included. A fundamentally different concept, format or setup, new footage or a reshoot is discussed separately first. See [what happens if you change direction after the shoot](/faq/can-we-change-direction-after-the-shoot).',
    },

    // ---------- Filled-in example ----------

    { type: 'h2', id: 'filled-in-example', text: 'A filled-in example, for a made-up bakery', toc: 'A filled-in example' },

    "This is a complete brief for a hypothetical D2C bakery, written the way we like to receive one. The bakery is invented and isn't modelled on any brand in our library. The fields and options are the real ones.",

    "Say you run a small bakery in Bengaluru that delivers sourdough and buns on a weekly subscription. You've named your person and run the pressure test. Your brief might read like this.",

    {
      type: 'list',
      items: [
        '**Objective:** Organic content with subtle brand awareness. We want videos people watch for the answers and remember the bakery from.',
        '**Brand integration:** Subtle branding throughout. The bag sits in frame, and the bread arrives after the first answer, as a taste or a choice.',
        '**Desired viewer response:** Think "my weekday breakfast is a bit sad", laugh at it rather than feel lectured, and tap through to see this week\'s loaves.',
        '**Non-negotiables:** People trying the product, Brand mention, Closing statement ("Fresh on Friday").',
        '**Brand guide:** a link to a shared doc. Warm, unfussy, a little cheeky. Never "healthy", never preachy.',
        '**References:** four links with notes. A street taste test (copy the pacing), a price-guessing video (copy the reveal), our own best Reel (our audience) and a glossy bread ad (not this).',
      ],
    },

    {
      type: 'callout',
      tone: 'note',
      title: 'Under "Anything else we should know?"',
      text: 'The lock-list items the six fields don\'t cover go here, in a few lines.',
      items: [
        '**Audience:** first-job renters in their twenties who skip breakfast or eat it standing up.',
        '**Core message, after a pressure test:** "Bread that tastes like someone made it this morning."',
        '**Avoid:** diet talk, any health claim, other bakeries by name.',
        '**Language:** answers in Kannada, Hindi or English all work. Caption everything in English.',
        '**Production:** loaves stay out of direct sun between takes. We can send a box of buns to thank the people who stop.',
      ],
    },

    "Most of it describes the viewer, the feeling and the limits, not the bakery. That's what a crew needs on the street.",

    'Now build yours. Type into the four boxes and the brief fills in around your answers. Copy it into the request form or a doc. Nothing you type is uploaded.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'brief-builder',
      props: {
        title: 'Vox pop brief builder',
        intro: 'Four answers fill the template. Keep one option where it says so and fill in the brackets.',
        fields: [
          { id: 'product', label: 'Product or products', placeholder: 'e.g. our weekly sourdough subscription', example: 'our weekly sourdough subscription' },
          { id: 'person', label: 'The one person you want to reach', placeholder: 'e.g. first-job renters who skip breakfast', example: 'first-job renters who skip breakfast' },
          { id: 'response', label: 'What they should think, feel or do', placeholder: 'e.g. laugh at their own mornings, then tap through', example: "laugh at their own mornings, then tap through to this week's loaves" },
          { id: 'must', label: 'The one thing every video must include', placeholder: 'e.g. people trying the product', example: 'people trying the product' },
        ],
        templates: [
          { group: 'Objective', text: 'Objective for {product} (keep one): Organic content (value or entertainment first) / Organic content with subtle brand awareness / Paid ads or performance marketing / Something else' },
          { group: 'Objective', text: 'These videos introduce {product} to {person}.' },
          { group: 'Brand integration', text: 'How prominently {product} appears (keep one): Minimal (story first) / Subtle branding throughout / Product visible throughout / Product only in the intro or outro / Creator holding the product / Something else' },
          { group: 'Brand integration', text: 'Brand moment: {product} arrives after an answer that {person} would recognise, not before.' },
          { group: 'Desired viewer response', text: 'After watching, viewers should {response}.' },
          { group: 'Desired viewer response', text: 'Main job of each video for {person} (one per video): Create curiosity / Address a specific problem / Generate product interest / Demonstrate a benefit / Build social proof / Drive consideration' },
          { group: 'Non-negotiables', text: 'Every video must include: {must}.' },
          { group: 'Non-negotiables', text: 'Also required besides {must} (delete the rest): Product shots / Logo visible / Brand mention / Call to action / People trying the product / Intro hook / Closing statement / Disclaimer / Something else' },
          { group: 'Non-negotiables', text: 'Exact wording for any claim about {product}: (paste it here)' },
          { group: 'Brand guide', text: 'Brand guide for {product}: (a link anyone can open). Personality in 3 to 5 words: (write them).' },
          { group: 'References', text: 'References for {product}, 3 to 5 links, each with what to copy and what to ignore: (link, copy, ignore)' },
          { group: 'Anything else we should know?', text: 'Audience: {person}. Avoid: (topics, words, settings). Languages and captions: (which ones). Special production needs: (location, props, product handling).' },
        ],
        note: 'Paste each part into the matching step of the request form.',
      },
    },

    {
      type: 'steps',
      id: 'write-a-brief',
      title: 'Write a vox pop brief in seven steps',
      intro: 'The person and the message come before the form.',
      howTo: true,
      steps: [
        { name: 'Name the person', text: 'Describe one person by their week and their annoyance, not their age band.' },
        { name: 'Test the message', text: 'Say your core line to a few strangers, off camera. Rewrite until what they hear is what you meant.' },
        { name: 'Pick one objective', text: 'Choose the main use for the batch from the four options.' },
        { name: 'Set the brand level', text: 'Choose how prominently the brand appears. Mirror first, door second.' },
        { name: 'Write the viewer response', text: 'One sentence: think, feel or do. One main job per video.' },
        { name: 'Tick the must-haves', text: 'Only what every cut needs, with exact wording for any claim or disclaimer.' },
        { name: 'Link the guide and references', text: 'Add your brand guide and 3 to 5 references, each with a note.' },
      ],
    },

    { type: 'cta', text: 'Brief written? See the format on your own brand first. Scope, the number of trial videos and any fee are confirmed in writing.' },

    // ---------- What happens next ----------

    { type: 'h2', id: 'after-you-send-it', text: 'What happens after you send the brief?', toc: 'What happens next' },

    'We plan a short trial on your brand from it, usually 7 to 14 days, so you can see the format before you commit. Its scope, the number of trial videos and any fee are confirmed in writing first.',

    {
      type: 'list',
      ordered: true,
      items: [
        "**The trial.** We plan and shoot from your brief. Trial videos are for evaluation only, and can't be published or used in ads unless a paid engagement is confirmed in writing.",
        '**Consolidated feedback.** You review the trial and send feedback through one main point of contact.',
        '**A package.** If you go ahead, you choose a 5, 10 or 20 video package for one brand.',
        '**Pilot agreement and prepayment.** We sign a pilot agreement, and the full package fee is paid in advance.',
        '**Pre-production alignment.** Before each shoot we lock the nine points above. Your completed brief is the starting point.',
        '**Shoot, edit, deliver.** We produce the batch in one planned cycle, usually 14 to 21 days, with review checkpoints where useful and minor revisions included. Usage rights transfer on full payment.',
      ],
    },

    'Nothing in the trial commits either of us to a pilot. The full sequence is on [how the trial works](/trial#after).',

    "One thing to do this week, before any of that. Write the one sentence you want a viewer to say after watching, and read it to three people who don't work with you. If they can say it back in their own words, the hardest field in the brief is done.",

    "We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger will respond in the moment. A clear brief is how the parts we control add up. When yours is ready, [request a trial video](/contact).",
  ],

  faqs: [
    {
      q: 'How long should a vox pop brief be?',
      a: 'Usually about one page. A vox pop brief needs six clear answers, not a deck: the objective, brand integration, a sentence on viewer response, the must-haves, a brand guide link and 3 to 5 annotated references. Our request form takes you through it step by step and shows the whole brief before you send it. Add length only where it adds specifics, such as disclaimer wording.',
    },
    {
      q: "What if we don't have a brand guide?",
      a: 'Send a short doc instead. A brand guide for a vox pop brief can be about ten lines: your personality in 3 to 5 words, words you never want used, your logo and main colour, a caption style you like and any product shot rules. Share it as a link, since the brief takes a link rather than an upload, and make sure the crew can open it.',
    },
    {
      q: 'Can we change the brief after the shoot?',
      a: "Some changes, yes. Edit-level changes such as captions, trims and sequencing are minor revisions and are included. New requirements that depend on footage we didn't capture, like a product that wasn't on set, may need extra editing, revised deliverables or a reshoot. That's why the brief is locked before filming. See [changing direction after the shoot](/faq/can-we-change-direction-after-the-shoot).",
    },
    {
      q: 'How many reference videos should we send?',
      a: 'Send 3 to 5 reference videos. Fewer than three gives the crew too little to read a direction from, and five that pull different ways tend to contradict each other. The request form has room for five links. Add a line to each saying what to copy and what to ignore, so nobody has to guess which part you liked.',
    },
    {
      q: 'Should we write the vox pop questions ourselves?',
      a: 'You don\'t have to. Every Kreators.Army package includes concepts, questions and interactions planned for your objective. If you have questions in mind, add them under "Anything else we should know?" with a line on why. Brief the topic and the feeling rather than exact wording, and expect questions to be reshaped for the street, where product-first questions tend to get polished answers.',
    },
    {
      q: 'Can one vox pop brief cover several products?',
      a: 'Yes, as long as the products belong to one brand. Name every product in the brief and the batch can be planned across them, with one main objective per video rather than every product in every cut. Each package is for one brand, so an agency briefing for several brands needs a separate brief and a separate package for each.',
    },
    {
      q: 'Who should give feedback on the videos?',
      a: 'One main point of contact. Gather comments from everyone on your side, settle disagreements internally, then send one consolidated set of feedback. Decide who that person is before the trial and make sure they have read the brief, because feedback is easiest to act on when it is measured against what the brief asked for.',
    },
    {
      q: "What's the difference between the brief and the pilot agreement?",
      a: 'The brief is creative: objective, brand integration, viewer response, must-haves, brand guide and references. You send it before the trial. The pilot agreement is the contract for a paid package, covering the package, prepayment, delivery timelines and usage rights, which transfer on full payment. It is signed after you choose a package, and your completed brief becomes the starting point for pre-production.',
    },
  ],

  sources: [
    {
      id: 'mosseri-signals',
      title: 'Instagram shares algorithm insights to inform strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'Adam Mosseri: watch time, likes and sends are the top three ranking signals (CLAIMS.md P02, E22).',
    },
    {
      id: 'pwc-voice-2024',
      title: 'Voice of the Consumer Survey 2024, India (press release)',
      url: 'https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html',
      publisher: 'PwC India',
      date: '2024-07',
      note: '77% discover new brands on social media, 81% seek reviews there; social media is the least-trusted channel, with 76% concerned about privacy and data sharing (CLAIMS.md S17, E13).',
    },
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert with poll data, yet moved personal opinion more (CLAIMS.md R11, E04).',
    },
    {
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Brosius and Bathelt, Communication Research 21(1)',
      date: '1994',
      note: 'Exemplification: individual cases sway judgments more than base-rate statistics (CLAIMS.md E06).',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Beckers, Walgrave and Van den Bulck, Journalism Studies',
      date: '2018',
      note: 'The 2,000-interview Flemish sample: a large majority of vox pop news items present one point of view (CLAIMS.md E08).',
    },
    {
      id: 'youtube-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'Shorts "stayed to watch": the share of times viewers stayed past the initial seconds (CLAIMS.md P01).',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'Chapter I: claims about objectively ascertainable fact should be capable of substantiation (CLAIMS.md 5.8).',
    },
    {
      id: 'dca-endorsement',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose material connections with terms such as "advertisement", "sponsored" or "paid promotion" (CLAIMS.md E26).',
    },
    {
      id: 'tajfel',
      title: 'Minimal group paradigm',
      url: 'https://en.wikipedia.org/wiki/Minimal_group_paradigm',
      publisher: 'Wikipedia',
      note: "Tajfel's 1970s experiments: trivially assigned groups still favoured their own members (CLAIMS.md R04).",
    },
    {
      id: 'beckers-walgrave',
      title: 'How ordinary is the ordinary (wo)man on the street? An analysis of vox pop characteristics in television news',
      url: 'https://informahealthcare.com/doi/abs/10.1080/17512786.2016.1223551',
      publisher: 'Beckers et al., Journalism Practice 11',
      date: '2017',
      note: '2,000 Flemish TV vox pops: representative of age and gender, not of ethnic minorities or people with disabilities; journalists hardly ever flag this (CLAIMS.md E07).',
    },
  ],

  related: ['how-a-vox-pop-shoot-works', 'vox-pop-questions', 'street-interview-techniques', 'eleven-ways-to-vary-a-vox-pop-batch'],
};

export default post;
