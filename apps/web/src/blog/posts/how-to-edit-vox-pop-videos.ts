import type { Post } from '../types';
import meta from './how-to-edit-vox-pop-videos.meta';

const post: Post = {
  meta,

  answer:
    "Edit a vox pop in three moves. Open on the most charged moment, even mid-sentence. Cut two or three clashing answers back to back so viewers compare themselves. Close on the surprise or the brand, once the viewer feels understood. Kreators.Army's rule of thumb: leave two honest pauses in, because pauses make a street interview believable.",

  takeaways: [
    "Log and transcribe before you cut. Mark peaks, valleys and three exact words from each interview's opening, then build the edit from that page.",
    'Open on the most charged moment, even mid-sentence. The most articulate answer rarely makes the best hook.',
    'Put clashing answers side by side. Answers that agree give the viewer nothing to compare themselves against.',
    'Bring the brand in only after the viewer feels understood. Never put the door before the mirror.',
    'Cut dead air and keep hesitation. Two honest pauses should survive every final cut.',
    'Move whole answers freely, but never reorder or splice words inside one. Say so when AI helped with captions.',
    'After posting, find where the retention curve drops. Each part of the structure fails in its own place on the graph.',
  ],

  body: [
    'We think a vox pop is made twice. The first time is on the footpath, when a stranger stops and answers.',

    'The second time is at a desk, hours later, when someone decides which few seconds of that answer anyone will ever see.',

    "That second making is the one people rush. They trim the silences, line the answers up in the order they were shot, put a logo at the front and call it done. The result looks tidy and plays like a survey.",

    "Below is the edit we'd walk a new editor through, built on one imagined shoot. It covers a seven-step logging routine, the three beats of hook, reaction and payoff, and the edits you never make. It ends with a 14-point export checklist and a way to tell which beat failed.",

    // ---------------------------------------------------------------- 1. Editing is where it's built
    { type: 'h2', id: 'where-its-built', text: 'Why does the edit matter so much in a vox pop?', toc: "Editing is where it's built" },

    'Because the street hands you raw material, and the edit turns it into a video. The edit decides which answer opens, which answers sit side by side and when the brand appears.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. Every interaction we plan runs through six links: setup, question, participant, follow-up, reaction and edit. If the format is new to you, start with [what vox pop content is](/blog/what-is-vox-pop-content).',

    "The edit comes last, and it decides what the other five links were worth. It also has a hard limit. No editor can add a moment that didn't happen on the street.",

    'A 2009 student paper studied ten vox pops from a Mexican satirical news show. It argues they carry a recognisable "fingerprint": they look spontaneous, yet follow a set pattern of questions and cuts[^essex-fingerprint]. The answers are spontaneous. The pattern is made in the edit.',

    "The pattern this guide teaches has three beats: hook, reaction and payoff. The middle one borrows its name from the chain above, because it is where the edit puts people's reactions next to each other. Our [vox pop glossary](/blog/vox-pop-glossary#editing-terms) defines all three.",

    {
      type: 'table',
      caption: 'The three parts of a vox pop edit',
      head: ['Part', 'Its job', 'What goes there', 'What breaks it'],
      rows: [
        ['Hook', 'Stop the scroll and open a question', 'The most charged moment, even mid-sentence', 'A greeting, a logo or the host setting up'],
        ['Reaction', 'Make the viewer compare themselves', 'Two or three answers that clash', 'Answers that agree with each other'],
        ['Payoff', 'Close the question the hook opened', 'The answer that reframes it, or the brand', 'The brand arriving before the viewer feels understood'],
      ],
      rowHeaders: true,
    },

    'Here is one imagined shoot both ways: the order it was filmed in, and the order it should be cut in.',

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'two-storyboards',
      props: {
        title: 'The same footage, cut two ways',
        before: {
          label: 'Linear Q&A',
          text: 'The order it was shot in. The best moment arrives last, after a viewer has had four chances to scroll away.',
          points: [
            'The host says hello and asks, "What\'s in your bag right now?"',
            '"Phone, keys. Nothing else."',
            '"Three chargers. I don\'t own three phones." A laugh.',
            '"Everything. In case."',
            'A long pause. Then "This," and a steel tiffin box comes out. "It was my mum\'s. It\'s empty most days."',
            'The logo and "Shop the collection".',
          ],
        },
        after: {
          label: 'Hook, reaction, payoff',
          text: 'The same four people, ordered by what the viewer should feel.',
          points: [
            '**Hook:** the long pause, then "This," as the tiffin box comes out. Caption: "Wait for why."',
            '**Reaction:** "Phone, keys. Nothing else." cut hard against "Three chargers." Then "Everything. In case."',
            '**Payoff:** back to the tiffin. "It was my mum\'s. It\'s empty most days." The bag is in shot as the caption names the brand.',
          ],
        },
        note: 'An imagined shoot for a made-up bag brand. Only the order of the answers and the captions changed. Nobody\'s words did.',
      },
    },

    "Moving whole answers around is the editor's job. Moving words inside an answer isn't, and that line comes back near the end of this guide.",

    // ---------------------------------------------------------------- 2. Before the timeline
    { type: 'h2', id: 'before-the-timeline', text: 'How should you log vox pop footage before editing?', toc: 'Before the timeline' },

    'On paper first. Transcribe every answer, mark the peaks and the valleys, tag each line by feeling, and note three exact words from the start of each interview. Then build the edit from that page. Scrubbing through clips comes later.',

    "It feels slow. It's the fastest route we know to a good cut.",

    'Text helps because footage distracts. On video you notice who looks confident and whose background is noisy. On a page those fall away and the patterns show: a word several people used, an odd confession, a small aside someone slips in straight after a laugh.',

    'That aside deserves a habit of its own. A laugh loosens people, and the line that comes straight after it is often less guarded than the answer before. Treat that as a reason to listen twice, not as proof of anything. Mark every one.',

    {
      type: 'steps',
      id: 'log-a-shoot',
      title: 'How to log a vox pop shoot in seven steps',
      intro: 'Do this once per shoot, before anyone opens an editing app. A spreadsheet or a plain document is enough.',
      howTo: true,
      steps: [
        {
          name: 'Back up and label',
          text: 'Copy the cards twice before anything else. Name each file by participant and take, so "P3, take 2" means the same thing to everyone.',
        },
        {
          name: 'Transcribe every answer',
          text: "Run the audio through a transcription tool, then check each line by ear. Use a tool your participants' releases allow, or one that runs on your own machine.",
        },
        {
          name: 'Mark peaks and valleys',
          text: 'Peaks are the laugh, the strong opinion and the surprising take. Valleys are the pause, the half-finished sentence and the look away. Mark both, in two colours.',
        },
        {
          name: 'Tag by feeling first',
          text: 'Label each marked line with an emotion before a topic: pride, fear, want, confusion or relief. A feeling tells you where a line can sit in the edit. A topic like "money" tells you little.',
        },
        {
          name: 'Write down callback words',
          text: 'From the first two minutes of each interview, note the three most specific words or images. Write the exact words. "Cooking" is useful later; "nostalgia" is a theme you made up.',
        },
        {
          name: 'Look for repeat lines',
          text: 'Find phrases that turn up across several people in different words. A line several strangers keep circling tells you how your customers really talk.',
        },
        {
          name: 'Pick the anchor',
          text: 'Among the valleys, find the one that reveals more than any peak could. Build the edit around it. Often it becomes the hook.',
        },
      ],
    },

    'A few rows of that log might look like this. The shoot is imagined: a made-up bag brand asking strangers one question, "What\'s in your bag right now?"',

    {
      type: 'table',
      caption: 'An imagined log sheet, one row per moment worth keeping',
      head: ['Who, and where in the take', 'The line, as spoken', 'Tag', 'Use it for'],
      rows: [
        ['Participant 1, first answer', '"Phone, keys. Nothing else."', 'Peak: quick and sure', 'Reaction, as the minimalist'],
        ['Participant 2, mid-answer', '"Three chargers. I don\'t own three phones." (laughs)', 'Peak: a laugh', 'Reaction, against participant 1'],
        ['Participant 2, after the laugh', '"Honestly, I never know what\'s in there."', 'The quiet line after a laugh', 'A caption, or a second video'],
        ['Participant 3, end of take', '"Everything. In case. I got caught in the rain once."', 'Peak: contrast, a little absurd', 'Reaction, the third voice'],
        ['Participant 4, warm-up', '"First month in a new city. I miss my mum\'s cooking."', 'Callback word: cooking', 'An opening the ending can return to'],
        ['Participant 4, main answer', 'A long pause. Then "This," and a steel tiffin box', 'Valley into peak: the anchor', 'The hook, or the close'],
      ],
    },

    "The hook isn't the funniest line in that log. It's the pause before the tiffin box, because that's the moment that makes you want to know more.",

    'Most of what makes a log useful is decided on the street, by the questions and the follow-ups. [How a vox pop shoot works](/blog/how-a-vox-pop-shoot-works) covers that half of the job.',

    // ---------------------------------------------------------------- 3. The hook
    { type: 'h2', id: 'the-hook', text: 'How do you choose the hook for a vox pop?', toc: 'The hook' },

    'Pick the most emotionally charged moment from the whole session. It is rarely the most articulate answer, and almost never the one that praises the product. Put it first, and start mid-sentence if the line still makes sense.',

    'This is the hardest call in the edit, and the easiest to get wrong. The articulate answer is tempting because it sounds finished. A finished answer gives the viewer no reason to stay.',

    'Go back through your log for the line that hit you hardest the second time you heard it. Discomfort counts. So does honesty the person never planned to share.',

    'Starting mid-sentence takes some care. Cut in on a word that carries weight, such as "honestly", a number or a name, and check that the clipped line still means what the person meant. If it only makes sense with the first half, start earlier or put the question on screen.',

    { type: 'h3', id: 'open-before-the-reaction', text: 'Open on the moment before the reaction' },

    'A big smile and "I love it" in the first second reads as a story that\'s already over. The viewer files it away and keeps scrolling.',

    'Open on what came just before instead. A person who goes quiet after a simple question raises questions of their own: what were they asked, and why can\'t they answer? A caption like "They didn\'t say anything for four seconds" does the same work in words.',

    "Editors call this an open loop. The idea is usually traced to Bluma Zeigarnik's 1927 study in Berlin. Its famous memory effect hasn't held up, though. A 2025 meta-analysis found no memory advantage for unfinished tasks, only a tendency to go back and finish them[^zeigarnik-meta]. Use open loops as a craft habit, and don't sell them to your team as brain science.",

    "YouTube's own Shorts analytics report how often viewers stayed to watch past the opening seconds of a Short[^youtube-stayed]. Your first line has to earn the next few seconds. Four checks help:",

    {
      type: 'list',
      items: [
        '**It stands alone.** Someone who missed the question still feels the charge. If they need the question, put it on screen.',
        '**It has no run-up.** No greeting, no logo, no host explaining the plan.',
        "**It serves the video's job.** Each of our videos gets one job, such as creating curiosity or addressing a specific problem. The hook should point at that job.",
        '**It never mocks anyone.** Open on a moment viewers recognise in themselves. If someone looks caught out or embarrassed, that clip stays in the folder.',
      ],
    },

    'Short lines can carry a hook on their own.',

    {
      type: 'video',
      brand: 'Clotrio',
      title: 'Whatever Mom',
      caption: 'Clotrio, "Whatever Mom". The title reads like a two-word answer, the kind of line that can open a video with no setup at all.',
    },

    "When you can't choose between two hooks, test both. Instagram's Trial Reels show a Reel to non-followers first, so you can try two openings from the same street interview before your followers see either[^trial-reels]. For more opening lines and how to write them, see our guide to [street interview hooks](/blog/street-interview-hooks).",

    // ---------------------------------------------------------------- 4. The reaction
    { type: 'h2', id: 'the-reaction', text: 'What goes in the middle of a vox pop?', toc: 'The reaction' },

    'Contrast. Cut two or three answers that clash, back to back, and put someone who has it all worked out next to someone still searching. Answers that agree give the viewer nothing to measure themselves against.',

    'The moment two answers disagree, the viewer stops watching an interview and starts comparing.',

    'Which of these people am I?',

    'We think that silent self-check is what the format is for. Build the whole middle around differences, and never bury them under b-roll or loud music.',

    { type: 'h3', id: 'mix-answers-on-purpose', text: 'Mix contrasting answers on purpose' },

    'Contrast rarely survives an edit by accident. Agreeing answers feel safe, especially when a brand will watch the cut, and selection drifts towards them.',

    'TV news shows the same pattern. A study of about 2,000 Flemish TV vox pops found that a large majority of vox pop news items showed only one point of view[^opinion-balance].',

    'A one-sided edit sounds like a chorus, and a chorus sounds rehearsed. Mixed answers sound like a street.',

    {
      type: 'list',
      items: [
        '**Opposite answers.** "Phone, keys. Nothing else." against "Three chargers."',
        "**Same answer, opposite reasons.** Two people pick the same thing for reasons that can't both be right.",
        '**Sure against unsure.** A quick, confident answer next to a long pause.',
        '**Short against long.** A one-word answer lands harder straight after a rambling one.',
        '**For and against the brand.** An honest "not for me" makes the yes beside it believable.',
      ],
    },

    'One small product detail can carry a whole middle section.',

    {
      type: 'video',
      brand: 'Clotrio',
      title: 'The Waistband',
      caption: 'Clotrio, "The Waistband". The title names one product detail, the kind of specific thing several people can see differently.',
    },

    'Order matters inside the reaction too. Alternate sides, so each answer pushes against the last. End the section on the sharpest clash, or on the answer nobody expected, because that sets up the payoff.',

    'One caution. Set views against each other, never people. If the edit turns one participant into the punchline, you have made fun of a stranger who stopped to help you. No brand wants to be seen doing that.',

    // ---------------------------------------------------------------- 5. The payoff
    { type: 'h2', id: 'the-payoff', text: 'Where should the brand appear in a vox pop?', toc: 'The payoff' },

    'At the end. Close on the answer that reframes the question, or on the brand moment. The brand works only once the viewer feels understood: the vox pop builds the mirror, and the call to action opens the door.',

    'Our rule fits in seven words: never put the door before the mirror.',

    "The mirror is the moment a viewer sees themselves in a stranger's answer. After that, a product feels like a natural next thought. If the product arrives first, the viewer files the whole video as an ad, and that switch is hard to flip back.",

    {
      type: 'comparison',
      title: 'Two ways to close a vox pop',
      left: {
        label: 'Close on the surprise',
        items: [
          'The answer that turns the question around',
          'Suits organic posts, where the ending earns a rewatch',
          'The brand can live in the caption or the next post',
          'Risk: an ending nobody connects to you',
        ],
      },
      right: {
        label: 'Close on the brand',
        items: [
          "The product in someone's hands, or one short brand line",
          'Suits ads and launches, where the viewer needs a next step',
          'Works only after the strongest moment of recognition',
          'Risk: arriving early and breaking the mirror',
        ],
      },
      verdict: 'Both work. Pick one per video, and decide it in the brief rather than in the edit.',
    },

    "Before a trial we ask how prominently the brand should appear and what every video must include, so the editor isn't guessing. Within that, four ways to bring the brand in without stepping on the last answer:",

    {
      type: 'list',
      items: [
        "The product already in a participant's hands, so the brand arrives inside an answer.",
        'A caption that names the brand as the last answer ends.',
        'A short end card, held just long enough to read.',
        'For ads, an offer line after the payoff, never over the top of it.',
      ],
    },

    'Clean endings matter as much as clean openings. End on a line. A fade, a summary caption or the host saying thanks all tell the viewer they can leave. Reels and Shorts replay on their own, so a last frame that leads back into the first makes the loop feel intended.',

    // ---------------------------------------------------------------- 6. Keep the valleys
    { type: 'h2', id: 'keep-the-valleys', text: 'Should you cut the pauses out of a vox pop?', toc: 'Keep the valleys' },

    'Not all of them. Pauses, half-finished sentences and confused looks are the hardest moments to fake, and they make a street interview believable. Cut dead air, keep hesitation, and our rule of thumb is to leave at least two valleys in every final cut.',

    'An edit that keeps only the peaks plays like a highlights reel. Everyone is quick, sure and funny. Viewers have seen enough coached testimonials to know that shape.',

    "A three-second pause after a hard question doesn't fit it, so they believe it.",

    'Turned into edit decisions, the peak-valley idea looks like this:',

    {
      type: 'list',
      items: [
        'Weigh the silence after a question as heavily as the answer that follows it.',
        'Leave confusion in when it shows the question was a real one.',
        'Shorten a long valley before you delete it. Six seconds of silence can often become two and keep its meaning.',
        'Place one valley right before your strongest peak, so the viewer feels the shift from hesitation to clarity.',
        'Try the valley-to-peak moment as your hook. It often beats the peak on its own.',
      ],
    },

    "That shift from unsure to sure is the moment a viewer starts to believe the answer. You can't build it in the edit. You can only keep it.",

    { type: 'h3', id: 'when-a-stumble-helps', text: 'When a stumble helps, and when it hurts' },

    "There's a psychology finding behind this, and its fine print matters. In Elliot Aronson's 1966 experiment, a clearly capable quiz contestant who spilled coffee became more likeable. The same slip made an average contestant less likeable[^pratfall]. It was one small experiment, and later work found the effect depends on who is watching, so read it as a caution.",

    "For an editor, that caution is about order. Let someone show they know what they're talking about, then keep the stumble. A stumble from someone who hasn't earned the viewer's respect yet can just look foolish.",

    "Don't rescue the moment with a softening voiceover or a quick cutaway. And never fake one: a staged stumble is a performance, which is the very thing this format exists to avoid.",

    {
      type: 'comparison',
      title: 'What to cut and what to keep',
      left: {
        label: 'Cut',
        items: [
          'Dead air while someone hunts for their phone',
          'The walk-up and the hellos',
          'Repeated takes and false starts that say nothing',
          'The host\'s "so, um, basically"',
          'Long, empty gaps between answers',
        ],
      },
      right: {
        label: 'Keep',
        items: [
          'The pause after a hard question',
          'The laugh just before an honest line',
          'A sentence someone abandons for a truer one',
          'Rough audio or a caught breath around that moment',
          'The look away before the answer',
        ],
      },
      verdict: 'Our edit priorities include "no unnecessary pauses or repetition". The word that does the work there is unnecessary.',
    },

    'For the research on why ordinary voices persuade in the first place, see [why vox pops work](/blog/psychology-of-vox-pop).',

    // ---------------------------------------------------------------- 7. Captions
    { type: 'h2', id: 'captions', text: 'What should the captions on a vox pop say?', toc: 'Captions that tease' },

    'Two things. Subtitles carry what people say, word for word. On-screen text should tease the next beat instead of describing this one. "Wait for the third answer" pulls a viewer forward; "People share their views" doesn\'t.',

    "A teaser is a promise, so the video has to keep it. If the third answer turns out ordinary, the caption has spent trust you'll need for the next video.",

    {
      type: 'list',
      items: [
        '**A count:** "Wait for the third answer."',
        '**A reaction:** "This answer surprised the person giving it."',
        '**A silence:** "The longest pause of the day."',
        '**A clash:** "Same question. Opposite answers."',
      ],
    },

    'The question itself is the other caption that earns its place. Keep it on screen for the whole video.',

    'With the question visible, every answer has something to be measured against, even for a viewer who arrived two seconds in. It also rescues the viewer with the sound off, who otherwise has no idea what anyone was asked.',

    { type: 'h3', id: 'placement-and-animation', text: 'Placement, size and animation' },

    "Platforms lay their buttons and descriptions over the bottom and the right edge of a vertical video. Keep captions in the middle band of the frame, sized for a phone at arm's length, with no more than two short lines at a time. Then check the export on a phone, because a monitor hides what the buttons cover.",

    'Word-by-word animated captions are optional. They help on mute and suit a fast cut. On an emotional answer they can fight the face, so switch to plain subtitles for that line.',

    'Write the teaser as a message to one person. "Tell me you don\'t carry three chargers too" is a message someone could send to a friend. "Check out our new video on everyday carry" is an announcement, and nobody forwards an announcement.',

    'Try it below: pick the caption that teases what comes next.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'caption-rewriter',
      props: {
        title: 'Which caption pulls the viewer forward?',
        intro: 'Five moments from an imagined edit, three captions each.',
        questions: [
          {
            q: 'Three people will answer, and the third answer surprises everyone.',
            options: [
              { text: 'Strangers answer our question', points: 0, why: 'It describes what the viewer can already see.' },
              { text: 'Wait for the third answer', points: 1, why: 'It names a payoff and when to expect it.' },
              { text: 'Street interview, Bengaluru', points: 0, why: 'A label, not a reason to stay.' },
            ],
            explain: 'A teaser only works if the video pays it off.',
          },
          {
            q: 'Someone goes quiet for a long time before answering.',
            options: [
              { text: '[pause]', points: 0, why: 'It adds nothing the viewer cannot see.' },
              { text: 'Thinking...', points: 0, why: 'It narrates instead of opening a question.' },
              { text: "They didn't say anything for four seconds", points: 1, why: 'It turns the silence into something that needs explaining.' },
            ],
          },
          {
            q: 'Two people are about to give opposite answers.',
            options: [
              { text: 'Same question. Opposite answers.', points: 1, why: 'It promises a clash and invites the viewer to pick a side.' },
              { text: 'Two opinions', points: 0, why: 'Accurate, and flat.' },
              { text: 'Keep watching', points: 0, why: 'An instruction with no reason attached.' },
            ],
          },
          {
            q: "In the last answer, someone takes the brand's product out of their bag.",
            options: [
              { text: 'Featuring our new range', points: 0, why: 'It announces the ad before the answer lands.' },
              { text: 'Then someone opened their bag', points: 1, why: 'It points at the moment without spoiling it.' },
              { text: 'Shop now', points: 0, why: 'The door before the mirror.' },
            ],
          },
          {
            q: 'A participant gives an answer that surprises even them.',
            options: [
              { text: 'An honest answer', points: 0, why: 'It tells the viewer what to think.' },
              { text: 'This answer surprised the person giving it', points: 1, why: 'Specific, and it makes the viewer want to hear it.' },
              { text: 'Wow', points: 0, why: 'A reaction with nothing to react to yet.' },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Describing, not teasing', text: 'Rewrite each caption to point at what comes next.' },
          { min: 3, title: 'Getting there', text: 'The ones you missed probably describe the present moment.' },
          { min: 5, title: 'You write teasers', text: 'Now make sure each video keeps the promise its caption makes.' },
        ],
      },
    },

    // ---------------------------------------------------------------- 8. Hindi-English subtitles
    { type: 'h2', id: 'hindi-english-subtitles', text: 'How do you subtitle answers that mix Hindi and English?', toc: 'Hindi-English subtitles' },

    'Subtitle both languages as they were spoken. Don\'t correct the switch or force the answer into one language. Pick one way to show the Hindi, Romanised, in Devanagari or translated, and keep it the same across the batch.',

    'In urban India, a lot of answers switch languages mid-sentence. "Sach bolun toh, I don\'t even know what\'s in there" is one thought in two languages, and the switch is often the most natural moment in the clip. Tidy it into one language and the person stops sounding like themselves.',

    "It matters beyond the big cities too. About 588 million people in India watched short-form video in 2025, and slightly more of them were in rural India than in cities[^iamai-2025]. Some of your viewers will speak neither Hindi nor English first, so choose the subtitle style by who's watching.",

    {
      type: 'table',
      caption: 'Four ways to subtitle a Hindi-English answer',
      head: ['Style', 'What the viewer reads', 'When it suits'],
      rows: [
        ['Romanised, as spoken', '"Sach bolun toh, I don\'t even know what\'s in there."', 'Young, urban audiences who talk this way themselves'],
        ['Full English translation', '"Honestly, I don\'t even know what\'s in there."', 'Mixed audiences and ads, where every viewer must follow'],
        ['Original line plus English', 'The spoken line, with an English line under it', 'Short answers only, or the screen fills up'],
        ['Devanagari for the Hindi parts', 'Hindi words in Devanagari, English left in English', 'Hindi-first audiences; slower to read for everyone else'],
      ],
      rowHeaders: true,
    },

    'Whichever style you choose, the same rules hold:',

    {
      type: 'list',
      items: [
        '**Transcribe by ear.** Automatic transcripts often mangle mixed speech, so check every line against the audio.',
        '**Keep the slang.** "Yaar", "accha" and "matlab" are part of how the person sounds.',
        "**Don't fix their grammar.** A subtitle is a record of what someone said. Polish it and it becomes your sentence.",
        "**Translate the meaning of idioms.** When a phrase won't survive word for word, carry its sense, but never change the point.",
        '**Keep a style sheet.** One short list of spellings, so "accha" doesn\'t become "acha" three videos later.',
      ],
    },

    'The same rules work for Kannada-English, Tamil-English or any other mix you hear on the street. The subtitles follow wherever the person goes.',

    // ---------------------------------------------------------------- 9. Pacing
    { type: 'h2', id: 'pacing', text: 'How fast should you cut a vox pop?', toc: 'Pacing' },

    'Fast on the peaks, slow on the feelings. Jump cuts between and inside answers keep the energy up, while an emotional line needs a beat of room to land. Length follows the story.',

    'When people ask us how long each video is, the answer is [as tight as the story allows](/faq/how-long-is-each-video). We won\'t cut to a fixed length if that loses the context or the payoff that makes an answer work.',

    'A video can be too long. It can also be too short to make sense.',

    'Our edit priorities, read as timeline decisions:',

    {
      type: 'table',
      caption: 'Our edit priorities, and what each means on the timeline',
      head: ['Priority', 'What it means in the edit'],
      rows: [
        ['Strong opening moments', 'The most charged line first, with no run-up'],
        ['No unnecessary pauses or repetition', 'Cut dead air and repeats; keep the pauses that mean something'],
        ['Clear context', 'The question on screen, so a muted viewer can follow'],
        ['Tight storytelling', 'Every answer moves the video forward, or it goes'],
        ['Strong reaction moments', 'Hold on a face when the reaction is the content'],
        ['Appropriate pacing', 'Fast cuts on peaks, room on emotional beats'],
        ['Clean endings', 'End on a line, not a fade or a thank-you'],
      ],
      rowHeaders: true,
    },

    'Most of those are about removing things. Strong reactions and appropriate pacing are about knowing when to leave something alone.',

    {
      type: 'list',
      items: [
        'Cut into an answer a breath before the first word, and out a beat after the last.',
        "Use a jump cut to remove a false start, never to join two thoughts the person didn't join.",
        "Let the next person's first word start under the last person's face, an overlap editors call a J-cut, so a clash lands with no gap.",
        'Cover a distracting jump with the product in hand, but never cut away from a face during the line that matters.',
        'Watch the cut once with the sound off and once with your eyes closed.',
      ],
    },

    'Emotional answers slow everything down.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Feeling Homely',
      caption: 'CircleStore, "Feeling Homely". The title names a feeling rather than a product, and answers like that need room in the cut.',
    },

    'Let the answers set the rhythm. A rapid-fire video can cut on every line. A video about feeling at home might hold one face for a long time, and that is the right call.',

    { type: 'h3', id: 'street-sound', text: 'Sound that does not trip the viewer' },

    'Street audio is never clean, and viewers forgive that. What they notice is sound that jumps. A few habits keep it steady:',

    {
      type: 'list',
      items: [
        "Match levels between people, so a soft-spoken answer doesn't feel like a drop-out after a loud one.",
        'Lay a bed of street sound under every jump cut, so the background stays continuous when the picture jumps.',
        'Keep music low under speech, and drop it out entirely for the emotional answer.',
        'If traffic swallows part of a good line, keep the line and lean on the subtitle.',
      ],
    },

    // ---------------------------------------------------------------- 10. Callback endings
    { type: 'h2', id: 'callback-endings', text: 'What is a callback ending in a vox pop?', toc: 'Callback endings' },

    'A callback ending returns to a specific word or image from early in an interview, so the close connects back to the start without anyone explaining it. Use one per video at most, and only when the person meant the two moments together.',

    'Improvisers use callbacks on stage: a word from early in a scene comes back at the end, and the whole scene suddenly feels connected. In a vox pop edit it works like this:',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Capture.** Take the callback words from your log: three exact words or images from the first two minutes of each interview.',
        '**Listen for the echo.** Find a later moment where the same person comes back to one of them, even loosely.',
        '**Let it go.** Run the middle of the edit without mentioning the word.',
        '**Close on the return.** End the video there, with nothing after it.',
        "**Don't explain it.** No caption and no voiceover. Let the viewer make the link.",
        '**Keep it to one.** Two callbacks start to feel engineered.',
      ],
    },

    'The imagined bag-brand shoot can be cut this way too. Open on participant 4\'s warm-up line about missing home cooking, run the other three bag answers through the middle, and end on the tiffin box. The callback word is marked below.',

    {
      type: 'script',
      id: 'callback-script',
      title: 'An imagined interview, with its callback marked',
      context: 'Made up to show the method: one host, one participant, a made-up bag brand. The callback word comes from the warm-up.',
      lines: [
        { direction: 'Early in the interview, before the main question.' },
        { speaker: 'Host', text: 'Long day?' },
        { speaker: 'Participant', text: "Long month. First month in a new city. I miss my mum's cooking more than my bed." },
        { direction: 'Callback candidate: "cooking". The interview moves on.' },
        { speaker: 'Host', text: "What's in your bag right now?" },
        { speaker: 'Participant', text: 'Laptop, charger, umbrella. The usual.' },
        { direction: 'A long pause. The participant looks down, then takes out a steel tiffin box.' },
        { speaker: 'Participant', text: "This. It was my mum's. It's empty most days." },
        { direction: 'The echo. The video closes here, with no caption explaining the link.' },
      ],
    },

    'The close never says "remember the cooking?" The viewer links the empty box to the missing food on their own. We think a link people make for themselves stays with them longer than one a caption makes for them.',

    'One hard rule: the callback must connect what the person meant. If the early word and the later moment came from two different people, or two unrelated stories, joining them invents a meaning nobody said.',

    "When this doesn't work: when nothing echoes. Then end on the strongest answer and keep the method for the next shoot.",

    // ---------------------------------------------------------------- 11. Don't over-edit
    { type: 'h2', id: 'dont-over-edit', text: 'How much editing is too much?', toc: "Don't over-edit" },

    "Anything that changes what someone meant. Trimming false starts and dead air is editing. Reordering or splicing words, rephrasing answers, or placing an answer under a question nobody asked puts words in a stranger's mouth.",

    "Rearranging someone's words so they sound sharper trades the format's main strength, that nobody wrote this, for a few seconds of polish.",

    {
      type: 'table',
      caption: "What an editor can and can't do with someone's answer",
      head: ['Change', 'Allowed?', 'Why'],
      rows: [
        ['Trim a false start or a repeated word', 'Yes', 'The meaning stays the same'],
        ['Shorten a long pause', 'Usually', 'Keep it whole if the pause is the point'],
        ['Reorder whole answers between people', 'Yes', 'Sequencing is the edit\'s job'],
        ['Open in the middle of an answer', 'Yes', 'As long as the rest of the line keeps its sense'],
        ['Hold the end of an answer back for the payoff', 'Yes', 'The words keep their order and their question'],
        ['Reorder words inside one answer', 'No', 'It builds a sentence nobody said'],
        ['Splice two answers into one', 'No', 'It invents an opinion'],
        ['Put an answer under a different question', 'No', 'The answer now means something else'],
        ['Cut a "but" that reverses the point', 'No', 'It flips what they meant'],
        ['Clone a voice or alter a face with AI', 'No', "It is no longer the person's answer"],
      ],
      rowHeaders: true,
    },

    "Our FAQ says we don't script what strangers say. An edit that rewrites them afterwards would be a script by another route.",

    { type: 'h3', id: 'where-ai-fits', text: 'Where AI tools fit' },

    "AI tools earn their place on structure and scale: transcribing, finding speakers, sorting a log, drafting subtitles you then check by ear. They shouldn't touch what people said.",

    'Our advice is to say so when AI has helped. If a tool transcribed the footage or drafted the captions, the post can say that, next to the plain fact that the faces and words are real.',

    "There's a commercial reason to keep AI away from faces and voices, too. In NielsenIQ's 2024 study, viewers rated AI-generated ads as more annoying and confusing than traditional ones, and even the better AI ads were less memorable[^nielseniq-ai-ads].",

    { type: 'h3', id: 'disclosure-and-consent', text: 'Disclosure and consent' },

    'Honesty runs past the words. If anyone in your vox pop is paid, works for you or was cast, India\'s endorsement guidelines expect you to say so clearly. They name labels such as "advertisement", "sponsored" or "paid promotion"[^endorsement]. A staged vox pop presented as spontaneous would mislead viewers.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'Only edit people who agreed',
      text: 'Keep a signed release for everyone you feature, with the project files, and tell people where the video will appear. Our guide to [street interview consent in India](/blog/street-interview-consent-india) goes further. This is general information, not legal advice.',
      items: [
        "Never use footage of a minor without a parent's written consent.",
        'Blur or crop identifiable bystanders who did not agree to appear.',
        'Check your release forms with a lawyer.',
      ],
    },

    // ---------------------------------------------------------------- 12. Retention curve
    { type: 'h2', id: 'retention-curve', text: 'How do you read the retention curve after posting?', toc: 'Read the retention curve' },

    'Find where the curve drops before you look at views. A drop in the first seconds points at the hook. A drop in the middle points at a reaction without contrast. A drop just before the end often means the brand arrived too early.',

    "Views tell you people saw a video. They don't tell you whether anyone felt it. The retention graph in your platform's analytics shows the moment people decided to leave.",

    "Watch time is the part an editor controls most directly. Instagram's head, Adam Mosseri, has said the three signals that matter most for ranking are watch time, likes and sends[^mosseri-signals].",

    'To turn a curve into a fix, open the graph for one posted video and answer three questions.',

    {
      type: 'widget',
      widget: 'picker',
      id: 'drop-off-diagnoser',
      props: {
        title: 'Why are people leaving your vox pop?',
        intro: 'Answer for one posted video, with its retention graph open. The diagnoser names the edit most likely to fix it.',
        questions: [
          {
            q: 'Where does the curve fall most steeply?',
            options: [
              { text: 'In the first two or three seconds', outcomes: ['hook'] },
              { text: 'Somewhere in the middle', outcomes: ['reaction'] },
              { text: 'Just before the brand or product appears', outcomes: ['door'] },
              { text: 'It slides down slowly the whole way', outcomes: ['pacing'] },
              { text: 'Near the very end', outcomes: ['ending'] },
            ],
          },
          {
            q: 'What is on screen at that moment?',
            options: [
              { text: 'A greeting, a logo or the host setting up the question', outcomes: ['hook'] },
              { text: 'An answer that sounds like the one before it', outcomes: ['reaction'] },
              { text: 'The product, a logo or an offer', outcomes: ['door'] },
              { text: 'A gap: someone thinking, a slow walk-up, dead air', outcomes: ['pacing'] },
              { text: 'An end card, an outro or a summary line', outcomes: ['ending'] },
              { text: 'Someone talking, with no sign of what they were asked', outcomes: ['context'] },
            ],
          },
          {
            q: 'What would a friend say after watching it?',
            options: [
              { text: '"Who are these people? What did you ask them?"', outcomes: ['context'] },
              { text: '"Nice, but they all said the same thing."', outcomes: ['reaction'] },
              { text: '"It felt like an ad."', outcomes: ['door'] },
              { text: '"It took a while to get going."', outcomes: ['hook', 'pacing'] },
              { text: '"Good, but it kept going after the best bit."', outcomes: ['ending'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'hook',
            title: 'The hook is too slow',
            text: 'Find a harder opening in the log, often buried mid-answer. Cut the greeting, the logo and the setup, and start on the line itself.',
          },
          {
            id: 'reaction',
            title: 'The middle has no contrast',
            text: 'Swap one similar answer for one that clashes: the sure next to the unsure, or the yes next to the honest no.',
          },
          {
            id: 'door',
            title: 'The brand arrived before the mirror',
            text: 'Move the brand moment after the strongest moment of recognition. Fix the order of the clips, not the brand message.',
          },
          {
            id: 'pacing',
            title: 'Dead air is leaking viewers',
            text: 'Tighten the gaps between answers and cut walk-ups and fumbling. Keep the two pauses that mean something.',
          },
          {
            id: 'ending',
            title: 'The ending outstays the payoff',
            text: 'End on the answer. Cut the outro and the summary caption, and shorten the end card.',
          },
          {
            id: 'context',
            title: "Viewers don't know what was asked",
            text: 'Keep the question on screen for the whole video and subtitle every answer, so a muted viewer can follow.',
          },
        ],
      },
    },

    'Read the comments for how specific they are. One "I thought I was the only one" tells you more than fifty fire emojis: it means the mirror worked. Pasting public comments into an AI tool to sort them is fine; uploading participants\' footage or details without consent is not.',

    'When a video falls flat, check the question before you blame the edit. Find where viewers hesitated and ask which question would have changed the feeling there. Our creative loop runs hypothesis, interaction, production, edit, learn and improve, and the last step feeds the next brief.',

    "A flat video doesn't always mean a bad edit, either. Performance also depends on the platform, the audience, account history, media spend, the offer and distribution, which is why we never promise views. For which feed each cut should go to first, see [where to post vox pop videos](/blog/where-to-post-vox-pop-videos).",

    // ---------------------------------------------------------------- 13. Checklist
    { type: 'h2', id: 'edit-checklist', text: 'What should you check before you export a vox pop?', toc: 'The edit checklist' },

    'Check the structure, the honesty and the basics: a charged opening, clashing answers, the brand after the mirror, honest pauses, accurate subtitles, captions clear of platform buttons, consent and a clean ending.',

    'Run through it on a phone, sound off first. Your ticks stay in this browser for the next video.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'before-export',
      props: {
        title: 'Before you export',
        intro: 'One pass per video. If an item fails, fix it before the next one.',
        items: [
          { id: 'hook', text: 'The first second is the most charged moment, with no greeting, logo or setup' },
          { id: 'context', text: 'With the sound off, a new viewer can tell what was asked' },
          { id: 'contrast', text: 'The middle has at least two answers that clash' },
          { id: 'mirror', text: 'The brand appears only after the viewer feels understood' },
          { id: 'valleys', text: 'At least two honest pauses survived the cut' },
          { id: 'dead-air', text: 'Walk-ups, fumbling and repeated takes are gone' },
          { id: 'tease', text: 'One on-screen line teases the next beat, and the video keeps that promise' },
          { id: 'words', text: "No words reordered or spliced, and every answer sits under its own question" },
          { id: 'subtitles', text: 'Subtitles match what was said, in both languages, with consistent spellings' },
          { id: 'safe-zone', text: 'Captions sit clear of the platform buttons, checked on a phone' },
          { id: 'callback', text: "Any callback is the only one, and keeps the speaker's meaning" },
          { id: 'ending', text: 'It ends on a line, not a summary or a long end card' },
          { id: 'consent', text: "Everyone identifiable has a signed release, and no minor appears without a parent's written consent" },
          { id: 'disclosure', text: 'AI help is mentioned, and anyone paid, cast or on staff is disclosed' },
        ],
        done: 'Export it. Then watch where the curve drops.',
      },
    },

    {
      type: 'cta',
      text: "If you'd rather see this structure on your own product, shot and edited for you, ask about a trial. Scope, the number of trial videos and any fee are confirmed in writing.",
    },

    // ---------------------------------------------------------------- 14. Close
    { type: 'h2', id: 'start-with-one-video', text: 'Where should you start with your next edit?', toc: 'Start with one video' },

    'Start with one video you have already posted. Find its most charged moment, move it to the front, put a clashing answer beside it and push the brand to the end. Post the new cut, as a Trial Reel if you can, and compare the two curves.',

    'That one comparison will teach you more than any guide, this one included.',

    'Some of this is easy to do in-house. Some of it is easier when the question, the shoot and the edit are planned together. We control the question, the setup, who we approach, the follow-up and the edit. We can\'t control exactly how a stranger will respond in the moment, and [how we work](/how-we-work) explains what we do about that.',
  ],

  faqs: [
    {
      q: 'How long should a vox pop video be?',
      a: "As tight as the story allows. A vox pop needs room for a hook, two or three clashing answers and a payoff, and nothing else. Cut anything that doesn't move the video forward, but don't chase a fixed length if it costs the context or the payoff. That is also how we answer [how long each video is](/faq/how-long-is-each-video).",
    },
    {
      q: 'Which app should I use to edit a vox pop?',
      a: 'Any editor that handles several tracks, captions and a vertical export will do, on a phone or a desktop. The app matters far less than the log you make before you open it. One caution for editors in India: CapCut, popular elsewhere, has been blocked in India since 2020[^capcut-ban], so don\'t build your workflow around it.',
    },
    {
      q: 'Should I cut out every "um" and pause?',
      a: 'No. Cut dead air, walk-ups, repeated takes and fillers that add nothing. Keep the pauses that mean something: the silence after a hard question, the laugh before an honest line, the sentence someone abandons for a truer one. Leave at least two of those valleys in every final cut, because they are what make a street interview believable.',
    },
    {
      q: 'How do I subtitle Hindi and English in one video?',
      a: 'Subtitle both languages as they were spoken, and never force an answer into one language. Choose one style for the Hindi, whether Romanised, in Devanagari or translated into English, and keep it the same across the batch. Check every line by ear, keep the slang, and translate idioms for meaning without changing the point the person made.',
    },
    {
      q: "Can I reorder someone's answers in a vox pop?",
      a: "Yes for whole answers, no for words. Moving one person's answer ahead of another's is sequencing, which is the edit's job. Reordering words inside an answer, splicing two answers together or placing an answer under a question that wasn't asked changes what someone meant. That line never moves, however much tighter the video would get.",
    },
    {
      q: 'Should the brand appear at the start of a vox pop?',
      a: "Usually not. A logo or a pitch in the first seconds tells the viewer it's an ad before they feel understood, and that impression is hard to undo. Let the hook and the reaction build the mirror, then bring the brand in at the payoff. Wherever the brand sits, disclose clearly if anyone on camera was paid or cast.",
    },
    {
      q: 'How many answers should one vox pop video use?',
      a: 'Our rule of thumb is three to five voices: one to hook, two or three that clash in the middle, and one to close, often a return to the first person. One strong story can carry a video with fewer. Rapid-fire formats can use more, as long as every answer adds a new angle instead of agreeing with the last.',
    },
    {
      q: 'How do I fix a vox pop video people leave early?',
      a: 'Find where the retention curve drops. A drop in the first seconds points at a weak hook, so look for a harder opening in your log. A drop in the middle suggests the answers are too alike. A drop just before the end often means the brand arrived too early. Fix the order of the clips before you touch the message, then test the new cut.',
    },
  ],

  sources: [
    {
      id: 'essex-fingerprint',
      title: 'The "Fingerprint" of Vox Pop Interviews',
      url: 'https://publications.essex.ac.uk/esj/article/id/198/',
      publisher: 'Essex Student Journal (Ariel Vázquez)',
      date: '2009-11-15',
      note: 'CLAIMS R12 (weak): one student paper, ten interviews from the satirical show El Notifiero (checked on the page, 11 Nov 2026); attributed to one paper, never "researchers".',
    },
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications (Ghibellini and Meier)',
      date: '2025',
      note: 'CLAIMS R01 (corrected): Berlin, 1927; no memory advantage for unfinished tasks, only a tendency to resume them.',
    },
    {
      id: 'youtube-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'CLAIMS P01: Shorts analytics report "stayed to watch" past the first seconds.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram Trial Reels Are Now Available to More Creators',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025-07-13',
      note: 'CLAIMS E23: Trial Reels show a Reel to non-followers first.',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion Balance in Vox Pop Television News',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies (Beckers, Walgrave and Van den Bulck)',
      date: '2018-01-25',
      note: 'CLAIMS E08: in a sample of about 2,000 Flemish TV vox pops, a large majority of news items showed one point of view.',
    },
    {
      id: 'pratfall',
      title: 'Pratfall effect',
      url: 'https://en.wikipedia.org/wiki/Pratfall_effect',
      publisher: 'Wikipedia, summarising Aronson, Willerman and Floyd (1966)',
      note: 'CLAIMS R02 (corrected): only the highly capable contestant became more likeable after the blunder.',
    },
    {
      id: 'iamai-2025',
      title: "India's internet user base tops 950 million as rural growth, AI drive adoption",
      url: 'https://www.businesstoday.in/technology/news/story/indias-internet-user-base-tops-950-million-as-rural-growth-ai-drive-adoption-513353-2026-01-29',
      publisher: 'Business Today, on the IAMAI and Kantar Internet in India 2025 report',
      date: '2026-01-29',
      note: 'CLAIMS E15: about 588 million short-video viewers in 2025; rural slightly ahead of urban.',
    },
    {
      id: 'nielseniq-ai-ads',
      title: 'NIQ research uncovers hidden consumer attitudes toward AI-generated ads',
      url: 'https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/',
      publisher: 'NielsenIQ',
      date: '2024-12-12',
      note: 'CLAIMS S28/E12 (corrected): AI ads rated more annoying and confusing, and less memorable.',
    },
    {
      id: 'endorsement',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose any material connection with labels such as "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram Shares Algorithm Insights To Inform Strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'CLAIMS P02/E22: watch time, likes and sends are the top three ranking signals.',
    },
    {
      id: 'capcut-ban',
      title: "Xiaomi Browser, ByteDance's CapCut Among 47 Chinese Apps Banned By India Last Week",
      url: 'https://inc42.com/buzz/xiaomi-browser-bytedances-capcut-among-47-chinese-apps-banned-by-india-last-week',
      publisher: 'Inc42',
      date: '2020-08-05',
      note: 'CLAIMS P04: CapCut blocked in India since 2020; name no editing app.',
    },
  ],

  related: ['street-interview-hooks', 'where-to-post-vox-pop-videos', 'eleven-ways-to-vary-a-vox-pop-batch', 'improv-for-street-interviews'],
};

export default post;
