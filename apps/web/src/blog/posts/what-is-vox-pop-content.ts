import type { Post } from '../types';
import meta from './what-is-vox-pop-content.meta';

const post: Post = {
  meta,

  answer: `A vox pop (from the Latin _vox populi_, "voice of the people") is a short video of unscripted answers that members of the public give to one question, usually on the street. Kreators.Army's view: brands use it because real reactions look more like a friend's post than an ad, and the answers double as customer research.`,

  takeaways: [
    `Vox pop is short for _vox populi_, Latin for "voice of the people". For a brand, it means a short street-interview video built on one question.`,
    `Nobody scripts the answers. What gets planned is the interaction around them: the question, the setup, who is approached, the follow-up and the edit.`,
    `It works as a social mirror. Viewers see someone like them on screen and quietly ask, "Is that me?"`,
    `In a 2022 experiment, viewers trusted vox pops less than an expert quoting a poll, yet the vox pops shifted their opinions more.[^communications-2022]`,
    `The question is the product. No camera, location or edit rescues a weak one.`,
    `It suits physical products best. It can't promise views or sales, and one street is never a representative sample.`,
  ],

  body: [
    `Picture the footpath outside a Bengaluru metro station, a little after 6 pm. A host with a mic stops people with one question: chai or coffee? The first person says chai without breaking stride. The second stops, laughs and spends a full minute defending filter coffee.`,

    `A third says "both", and means it.`,

    `Nobody told them what to say. Cut those few minutes of mild disagreement down to thirty seconds, put the question on screen, and you have a vox pop.`,

    `If you run a brand, you've seen these in your feed. This guide explains what the format is, why people stop for it and whether it suits what you sell. Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands, so the examples come from our own library. We're also plain about what the format can't do.`,

    // ---------------------------------------------------------------- 1
    { type: 'h2', id: 'what-does-vox-pop-mean', text: 'What does vox pop mean?', toc: 'What vox pop means' },

    `Vox pop is short for _vox populi_, Latin for "the voice of the people".[^mw-vox-populi] In media and marketing, it means short, unscripted answers from members of the public, recorded around one question and cut together.`,

    {
      type: 'definition',
      id: 'vox-pop',
      term: 'Vox pop',
      text: `A short video or audio piece built from members of the public answering one question, usually on the street and without a script. Short for the Latin _vox populi_, "voice of the people". Also called a street interview or a man-on-the-street interview.`,
      source: 'mw-vox-populi',
    },

    `Three names cover the same ground. "Vox pop" is the newsroom name, and it leans British.[^mw-word-of-the-day] "Street interview" is the plain description. "Man on the street" is the other common one, though it assumes everyone you stop is a man.`,

    `We use vox pop and street interview to mean the same thing throughout.`,

    { type: 'h3', id: 'how-to-pronounce-vox-pop', text: 'How do you pronounce vox pop?' },

    `Say it as it's spelled: "voks pop", rhyming with "box top". Both words get roughly equal weight. The plural is vox pops, and on this site it stays lower case: a vox pop, two vox pops.`,

    `The full Latin is said in more than one way. You'll hear "voks POP-yoo-lee" and "voks POP-yoo-lye", and nobody on a shoot will correct you for either.`,

    { type: 'h3', id: 'where-vox-pop-came-from', text: 'Where did vox pop come from?' },

    `The phrase is old. Merriam-Webster dates the first known English use of _vox populi_ to about 1547.[^mw-vox-populi] Its Word of the Day note adds that English speakers, British ones especially, have clipped it to "vox pop" since the mid-1960s.[^mw-word-of-the-day]`,

    `Street interviews are older than television. A radio show named after the phrase began on KTRH in Houston in 1932. Two advertising salesmen, Parks Johnson and Jerry Belcher, took microphones out onto the street and asked passers-by what they thought. The show went national on NBC in 1935 and ran until 1948.[^vox-pop-radio]`,

    `A small irony: one of the first street-interview shows came from two men who sold ads for a living.`,

    `Nearly a century later, the same idea runs on Instagram Reels, YouTube Shorts and Facebook Reels. In India, the audience for short video now reaches well past the big cities.`,

    {
      type: 'stat',
      value: '588 million',
      label: 'People in India who watched short-form video in 2025, slightly more of them in rural areas than in cities',
      source: 'iamai-2025',
      note: 'IAMAI and Kantar, Internet in India 2025',
    },

    // ---------------------------------------------------------------- 2
    { type: 'h2', id: 'what-a-vox-pop-video-looks-like', text: 'What does a vox pop video look like?', toc: 'What a vox pop looks like' },

    `A typical vox pop is a vertical video. The question sits on screen from the first second, the sharpest answer opens it, two or three contrasting answers follow, and a payoff closes it.`,

    `Not every video uses every part. The ones worth watching nearly always have a clear opening and a clear ending, though. The table breaks one down.`,

    {
      type: 'table',
      caption: 'The parts of a typical vox pop video',
      head: ['Part', 'What happens', "Why it's there"],
      rows: [
        ['Question card', 'The question appears as on-screen text, often read aloud too', 'A viewer with the sound off still knows what was asked'],
        ['Cold open', 'The sharpest or funniest answer plays first, with no logo or intro', 'It has to earn the next few seconds'],
        ['Contrast', 'Two or three people answer differently', 'Disagreement gives viewers a side to pick'],
        ['Follow-up', 'The host asks "why?" or "what happened?"', 'The second answer is where the story tends to be'],
        ['Payoff', 'A reveal, a twist or the line that sums it up', 'It gives the clip an ending people remember'],
        ['Close', 'The product, where to find it, or nothing at all', 'The brand arrives after the people, not before'],
      ],
      rowHeaders: true,
    },

    `That opening answer is called the [cold open](/blog/vox-pop-glossary#cold-open). On a short-form feed it carries a lot of weight. YouTube's own Shorts analytics measure how often viewers stayed to watch past the first seconds, so the first answer on screen has to earn the next ten seconds.[^youtube-stayed-to-watch]`,

    `Length varies.`,

    `Our rule is "as tight as the story allows": made for short-form viewing, but never cut to a fixed length if that loses the context or the payoff. The platforms give you room. YouTube counts vertical videos up to three minutes as Shorts,[^shorts-three-minutes] and Instagram Reels can also run three minutes.[^reels-three-minutes] In our view, few vox pops need that long.`,

    `At its simplest, a vox pop is one choice put to whoever walks past. This one from our library hangs on a single A/B question.`,

    {
      type: 'video',
      brand: 'BreadBerry',
      title: 'Salt Vs Sweet',
      caption: 'BreadBerry, "Salt Vs Sweet". The question: salt or sweet? One either-or choice is about as simple as a vox pop gets.',
    },

    `Who's on camera changes the feel. Usually it's a host with a mic and a stream of strangers. Sometimes the founder holds the mic, and people answer the person who made the thing.`,

    `A host who appears in every video also becomes familiar. Sociologists Horton and Wohl named this para-social interaction in 1956: a presenter who talks to the camera like a friend creates "intimacy at a distance".[^horton-wohl-1956] A recurring host on a vox pop series can build the same kind of familiarity.`,

    { type: 'h3', id: 'where-vox-pops-are-filmed', text: 'Where are vox pops filmed, and in what language?' },

    `Anywhere people pass and have a minute to spare: footpaths, markets, college gates, parks, malls, metro exits and events. Busy isn't the goal. A crowd rushing for a train gives you short answers, while a queue at a chai stall gives you stories.`,

    `Permission depends on the place. The footpath outside a metro station is not the station itself: Bengaluru's Namma Metro needs prior permission and charges a fee for shoots on its premises.[^bmrcl-shoots] Malls and campuses are private property, so ask the management first.`,

    `Language is the detail that makes a vox pop feel Indian. On an Indian street, one answer can move between English and Hindi, Kannada, Tamil or Marathi inside a sentence. Subtitle what people said, the way they said it, and keep the switch. Tidy a Hinglish line into neat English and you lose the voice viewers came for.`,

    // ---------------------------------------------------------------- 3
    { type: 'h2', id: 'why-vox-pops-work', text: 'Why do vox pops work for brands?', toc: 'Why vox pops work' },

    `Because viewers see themselves in a stranger's answer. An ad tells people what to think. A street answer shows how people like them already think. Research on TV news vox pops backs part of that, with caveats.`,

    { type: 'h3', id: 'social-proof-vs-social-mirror', text: 'Social proof or social mirror?' },

    `The easy mistake is to treat vox pop as a cheaper testimonial. Ask a stranger about your packaging and you get a polite review. Ask whether they'd recommend you and you get a polite yes. Neither survives the scroll.`,

    `Changing the frame fixes it. Social proof says, "Look how many people like us." A social mirror says, "Look, that person is just like you." The first asks the viewer for trust. The second puts the viewer inside the video.`,

    {
      type: 'comparison',
      title: 'Two ways to frame a vox pop',
      left: {
        label: 'Social proof',
        items: [
          'Asks about the brand: "Would you recommend us?"',
          'Answers sound like reviews',
          'The viewer watches from outside',
          'Works as a short add-on, not a whole video',
        ],
      },
      right: {
        label: 'Social mirror',
        items: [
          'Asks about the person: "What do you do the minute you get home?"',
          'Answers sound like a friend talking',
          'The viewer recognises themselves',
          'The product arrives as part of their life',
        ],
      },
      verdict: 'Ask about their life first. Bring the brand in once they are talking.',
    },

    `The toggle below writes the same idea twice, once as ad copy and once as a stranger might say it. We invented both lines to show the difference.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'ad-line-vs-street-line',
      props: {
        title: 'Ad line or street line',
        before: {
          label: 'Ad line',
          text: '"Crunchy, wholesome and made with real ingredients: the evening snack you deserve."',
          points: ['Written by the brand, about the brand', 'Asks the viewer to take a claim on trust', 'Sounds like every other ad in the feed'],
        },
        after: {
          label: 'Street line',
          text: `"I tell myself one handful. Then the packet's gone before the second episode ends."`,
          points: ['Said by a person, about their own evening', 'No claim to doubt, only a habit people recognise and a moment the brand can join'],
        },
        note: 'Illustrative lines, not from a real shoot. Street answers stay about habits and feelings. They are never proof that a product works.',
      },
    },

    { type: 'h3', id: 'is-that-me', text: '"Is that me?": what the viewer is really asking' },

    `We think three forces run under every vox pop that holds attention. Each one is about the viewer, not the person answering.`,

    {
      type: 'list',
      items: [
        `**Social validation.** Someone on screen who could be the viewer's flatmate or colleague makes the viewer feel seen.`,
        `**Identity signalling.** The viewer isn't checking whether the answer is true. They're checking one thing: "Is that me?"`,
        '**The comparison loop.** A question people rarely ask out loud, about salary or regret, makes viewers measure themselves against the stranger. They stay to hear how it ends.',
      ],
    },

    `Put together, the effect is recognition. A viewer who thinks "that's exactly how I feel" has stepped into the video before your product appears. We go through the psychology, with the studies and their limits, in [why vox pops work](/blog/psychology-of-vox-pop). For the short version, see [why brands choose vox pop](/why-voxpop).`,

    { type: 'h3', id: 'what-research-says', text: 'What does research say about vox pops?' },

    `Communication researchers have studied vox pops in TV news for years, and their findings are more interesting than "people trust real people". In a 2012 experiment, Lefevere, De Swert and Walgrave compared ordinary people with experts and politicians in news items. The ordinary people did more to shape what viewers believed the public thought.[^lefevere-2012]`,

    `A 2022 web experiment in Flanders, published in the journal _Communications_, added a twist. Viewers rated news items with vox pops as less attractive and less trustworthy than items in which an expert presented poll figures. Yet the vox pops shifted their personal opinions more strongly.[^communications-2022] People said they trusted the expert. The ordinary voices moved them anyway.`,

    `Media researchers call the wider pattern exemplification: one vivid person on screen sways judgments more than a percentage does.[^brosius-1994]`,

    `Outside the newsroom, trust follows a similar line. In Nielsen's 2021 global survey of more than 40,000 people, 88% said they trust recommendations from people they know, the highest of any channel in the study.[^nielsen-2021] A stranger isn't a friend. But a stranger who sounds like one is the closest an ad gets.`,

    {
      type: 'callout',
      tone: 'note',
      title: "The catch: one street isn't everyone",
      text: 'A study of 2,000 Belgian TV vox pops found that journalists hardly ever told viewers the people interviewed might not represent everyone. Ethnic minorities and people with disabilities were also under-represented.[^beckers-2017] A later study of the same sample found most vox pop news items showed only one point of view.[^opinion-balance-2018] So cast widely on purpose, and keep the answers that disagree.',
    },

    // ---------------------------------------------------------------- 4
    { type: 'h2', id: 'are-vox-pop-answers-scripted', text: 'Are vox pop answers scripted?', toc: 'Are the answers scripted?' },

    `No. In an honest vox pop, nobody is told what to say. What gets planned is everything around the answer: the question, the setup, who is approached, the follow-up and the edit.`,

    `That list is the whole craft. Every item on it makes a good moment more likely, and none of them makes one happen. On our shoots, the split looks like this.`,

    {
      type: 'comparison',
      title: "What gets planned, and what can't be",
      left: {
        label: 'What we plan',
        items: [
          'The objective and creative direction',
          'Question and concept framing',
          'How participants are approached',
          'The setup of the interaction',
          'The interviewer and follow-up questions',
          'On-ground direction',
          'Participant selection',
          'Editing, pacing and final presentation',
        ],
      },
      right: {
        label: "What we can't plan",
        items: [
          'Exactly how a stranger will respond in the moment',
          'Whether any one person turns out funny or surprised',
          'Who happens to walk past at 6 pm',
          'How the video performs once it is posted',
        ],
      },
      verdict: 'We plan the conditions for a good moment, then let the person in front of the mic decide what happens.',
    },

    `We break every street interaction into six links. A weak one anywhere in the chain shows up in the final cut. The slides step through them in order.`,

    {
      type: 'widget',
      widget: 'slides',
      id: 'interaction-chain',
      props: {
        title: 'The six links of a street interaction',
        slides: [
          {
            heading: '1. Setup',
            text: `How the moment is framed before the question lands: where the host stands, what's in shot, and whether the product is in hand or out of sight.`,
          },
          {
            heading: '2. Question',
            text: 'One question with one job, in a shape that suits it: a guess, a choice, a small challenge or a reveal. The shape decides the reaction you are likely to get.',
          },
          {
            heading: '3. Participant',
            text: 'Who is approached, and how. A small thank-you can help people stop for a minute. It never decides what they say.',
          },
          {
            heading: '4. Follow-up',
            text: `The host follows an interesting answer and goes deeper. We'd rather follow a good moment than force a script.`,
          },
          {
            heading: '5. Reaction',
            text: 'The moment the clip is built on: a laugh, a pause, an argument, a change of mind. It can be made more likely, never forced.',
          },
          {
            heading: '6. Edit',
            text: 'Strong openings, no dead air, clear context, tight storytelling and a clean ending. As tight as the story allows.',
          },
        ],
      },
    },

    `One more thing about "unscripted". Say someone in your vox pop is paid to praise a product, works for you or was cast. India's endorsement guidelines expect that connection to be disclosed clearly, with labels such as "advertisement", "sponsored" or "paid promotion".[^endorsement-know-hows] This is general information, not legal advice.`,

    `A staged street interview passed off as spontaneous misleads the people watching it.`,

    `There's still a pattern to how vox pops are built. A student paper in the _Essex Student Journal_ used conversation analysis on vox pops from Mexican TV news.[^essex-fingerprint] It argues they have a recognisable "fingerprint": they look spontaneous but follow a set run of questions and cuts. We'd agree. The pattern is planned. The answers aren't.`,

    // ---------------------------------------------------------------- 5
    { type: 'h2', id: 'street-interviews-as-research', text: 'Can a street interview double as customer research?', toc: 'Street interviews as research' },

    `Yes. When nobody hands people a script, they answer in their own words, and those words show you how customers really talk about the problem your product solves.`,

    `On the footpath, a street interview looks like a host and a mic. Underneath, it's a research method. A lot of brand copy is written in a meeting room, from what the team assumes customers feel. A street interview checks that guess against what customers say.`,

    `People who have to answer fast don't speak in brochure lines. They let slip what they worry about, what they envy and what they want others to think of them.`,

    {
      type: 'callout',
      tone: 'tip',
      title: 'A street interview works like a lens',
      text: 'Sunlight spread across a leaf does nothing. Focused through a magnifying glass to one point, it burns. One sharp question does the same to opinions that usually stay scattered and unspoken.',
    },

    `The first answer is rarely the whole story, though. Someone says they want to earn more. Ask one more question and it becomes "I'm tired of being the one who can't keep up." The second line is about pride more than money. That's the feeling your marketing has to speak to.`,

    `Tap each answer below to see what one follow-up can surface. The answers are invented to show the pattern; they aren't from a real shoot.`,

    {
      type: 'widget',
      widget: 'reveal',
      id: 'line-behind-the-line',
      props: {
        title: 'The line behind the line',
        firstLabel: 'First answer',
        secondLabel: 'After one follow-up',
        items: [
          {
            question: 'What are you saving up for right now?',
            first: '"Nothing big. Just a bit of a cushion."',
            second: `"Everyone in my friend group bought a car this year. I don't want to be the last one taking autos."`,
            note: 'The follow-up was "Why now?" The real subject is keeping up with friends.',
          },
          {
            question: `What's the first thing you do when you get home?`,
            first: '"Shower, eat, the usual."',
            second: `"Honestly? I sit on my scooter outside the building for ten minutes. It's the only quiet part of my day."`,
            note: 'The follow-up was "And before that?" A brand that sells calm has found its opening line.',
          },
          {
            question: 'Do you cook on weekdays?',
            first: '"Sometimes."',
            second: `"Only if my flatmate's cooking too. Alone, it's instant noodles and a bit of guilt."`,
            note: 'The follow-up was "Why only then?" The answer is about company, which matters if you sell ready meals.',
          },
        ],
      },
    },

    `Write down the jokes too. When someone laughs, they stop performing for a second, and a plain truth slips out. "My salary is gone before the month even starts" would get a laugh on any footpath. For a budgeting app, it's also a content theme.`,

    `Turning a shoot into words you can reuse takes six steps.`,

    {
      type: 'steps',
      id: 'steps-mine-the-answers',
      title: 'Turn street answers into words you can use',
      intro: 'The first three steps happen on the street. The last three happen at your desk, before the edit.',
      steps: [
        { name: 'Ask one sharp question', text: 'Tie it to the exact problem your product solves. One question, not five.' },
        { name: 'Let people finish', text: `Don't interrupt and don't rescue a pause. The best line often comes after the silence.` },
        { name: 'Ask one follow-up', text: `"Why?" or "What happened?" is enough. Write it down before the shoot so the host has it on the day.` },
        { name: 'Transcribe in their words', text: 'Keep the Hinglish, the slang and the half-sentences. Never tidy a quote into brand language.' },
        { name: 'Find the lines that repeat', text: 'Look for three lines that come up across different people, not one great quote. A line that repeats is a pattern; one quote is an anecdote.' },
        { name: 'Use them back', text: 'Put those words into hooks, captions, ad copy and product pages. Then write the next question from what you heard.' },
      ],
    },

    `After a few shoots you'll have a file of customer language your team didn't write. We'd rather start a campaign from that file than from a brainstorm. It's a record of how people talk, though, not a count of how many think it. The method is in [vox pop market research](/blog/vox-pop-market-research).`,

    // ---------------------------------------------------------------- 6
    { type: 'h2', id: 'what-makes-a-good-vox-pop-question', text: 'What makes a good vox pop question?', toc: 'What makes a good question' },

    `A good vox pop question is about the person rather than the brand. It's short enough to say in one breath, easy to start answering and hard to finish in one word.`,

    `Our view: the question is the product.`,

    `The camera, the location and the edit are execution. A better camera won't save a weak question, and a sharp question shot on a phone can still hold a feed.`,

    `Three types of question tend to get people talking about who they are, which is the part viewers recognise.`,

    {
      type: 'table',
      caption: 'Three question types that get people talking about themselves',
      head: ['Type', 'Example', 'Why people answer it'],
      rows: [
        ['Aspiration', `"If money weren't a problem for a year, what would you do first?"`, `It asks who they'd be without limits: the version they'd like to be`],
        ['Taboo', '"Does your salary feel like what you expected at this age?"', 'It says out loud what people usually keep private, so viewers compare'],
        ['Contrast', '"What do most people get wrong about making chai?"', 'It lets the person answering, and the viewer, feel like insiders'],
      ],
      rowHeaders: true,
    },

    `Taboo questions need care. We think money is one of the last things many people in India talk about openly. That's why a salary question gets attention, and it's also why the host has to ask it kindly and let people pass.`,

    `The easy mistake is matching the question to the product instead of the person. "How do you like our new flavour?" is about you. "What do you snack on when nobody's watching?" is about them, and your product can still turn up in the answer.`,

    `How you shape the question decides the shape of the reaction:`,

    {
      type: 'list',
      items: [
        'A prediction creates curiosity: "Guess what this costs."',
        'An A/B choice creates debate: "Salt or sweet?"',
        'An unexpected challenge creates humour: "Say this tongue twister three times, fast."',
        'A reveal creates surprise: the price, the brand or the right answer, shown on camera.',
      ],
    },

    `Every question also needs its follow-up written before the shoot, for the reason the reveal above showed: the first answer is the polite one. For more to start from, [our vox pop question bank](/blog/vox-pop-questions) has 120, sorted by category.`,

    `Unexpected questions work on products too. This one asks people what a product reminds them of, which invites a memory instead of a review.`,

    {
      type: 'video',
      brand: 'Waxys',
      title: 'What Does This Remind',
      caption: 'Waxys, "What Does This Remind". The question: what does this remind you of?',
    },

    // ---------------------------------------------------------------- 7
    { type: 'h2', id: 'kinds-of-vox-pop', text: 'What kinds of vox pop can a brand make?', toc: 'Kinds of vox pop' },

    `We count eleven mechanisms, from guessing and reveals to A/B comparisons, challenges and rankings. Each video in a batch gets one, so no two videos ask the same thing.`,

    { type: 'mechanisms', caption: 'The eleven mechanisms a vox pop batch can mix.' },

    `A mechanism is the engine of one video: the thing the participant does. The same street, host and product can produce very different videos depending on which one you pick. That's how a batch stays varied without a new set for every video.`,

    `Five of them are easy to spot by title alone in our library:`,

    {
      type: 'table',
      caption: 'Mechanisms you can find in our library, by video title',
      head: ['Mechanism', 'Library examples (brand, title)', 'What it tends to create'],
      rows: [
        ['Guessing and reveals', 'CircleStore, "Guess The Price"; Waxys, "Smell It And Guess"', 'Curiosity, then a reaction to the reveal'],
        ['A/B comparisons', 'BreadBerry, "Salt Vs Sweet"; Orgaheal, "Plant Vs Whey"', 'Debate, with viewers picking a side'],
        ['Challenges', 'BreadBerry, "Blindfold Bun"; Hackdaily, "Hindi Tongue Twister"', 'Humour, and people trying something in public'],
        ['Personal experiences', 'CircleStore, "Bad Second Hand"', 'Stories viewers recognise from their own lives'],
        ['Unexpected questions', 'Waxys, "What Does This Remind"', 'Memories and answers nobody rehearsed'],
      ],
      rowHeaders: true,
    },

    `An A/B choice is the easiest mechanism to start with. Anyone can answer it while walking, and everyone watching picks a side too.`,

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Goa Vs Mobile',
      caption: 'CircleStore, "Goa Vs Mobile". The question: a new phone or a Goa trip?',
    },

    `All eleven, with when each one works, are in [eleven ways to vary a vox pop batch](/blog/eleven-ways-to-vary-a-vox-pop-batch). Every video in the table above is in [our library of real street interviews](/video-library), if you'd rather watch than read.`,

    { type: 'h3', id: 'one-job-per-video', text: 'One main job per video' },

    `Variety comes from the mechanism. Focus comes from the job. We recommend each video has one primary objective, rather than trying to carry every product, feature, benefit and call to action at once. A video in a batch might be built to:`,

    {
      type: 'list',
      items: [
        '**Create curiosity:** a guess, with the reveal held back until the end.',
        '**Address a specific problem:** ask about the small annoyance your product removes.',
        '**Generate product interest:** first reactions, with the product in hand.',
        '**Demonstrate a benefit:** a blind taste test or a side-by-side people can see for themselves.',
        '**Build social proof:** several people choosing the same thing without being steered.',
        '**Drive consideration:** an A/B choice between your product and what people use now.',
      ],
    },

    `Featuring several products? Plan the batch across them. Each video gets a clear purpose, and the batch still covers the range.`,

    // ---------------------------------------------------------------- 8
    { type: 'h2', id: 'vox-pop-vs-ugc-and-testimonials', text: 'Is vox pop the same as UGC or a testimonial?', toc: 'Vox pop, UGC and testimonials' },

    `No. A vox pop is strangers answering one question on the street. User-generated content (UGC) is made by a creator or customer, usually to a brief. A testimonial is an existing customer recommending you.`,

    `All three put real people on screen, which is why they get confused. They differ in who speaks, who chose them and how much is planned.`,

    {
      type: 'table',
      caption: 'Vox pop, UGC and testimonials compared',
      head: ['What differs', 'Vox pop', 'UGC', 'Testimonial'],
      rows: [
        ['Who speaks', 'Strangers who stopped for the question', 'A creator or customer, often paid', 'A customer who already bought'],
        ['Is it scripted?', 'No. The question and setup are planned', 'Often loosely, to a brief', 'Usually guided, sometimes written'],
        ["Where it's filmed", 'Streets, markets, campuses, events', 'At home, on a phone', 'At home or in a studio'],
        ['What viewers see', 'Many people, many opinions', `One person's routine or review`, `One person's experience`],
        ['Strongest at', 'Attention, recognition, real language', 'Showing the product in daily use', 'Reassuring people close to buying'],
        ['Weak spot', `Answers can't be controlled`, 'Looks like an ad if overdone', 'Can sound rehearsed'],
      ],
      rowHeaders: true,
    },

    `They aren't rivals.`,

    `A brand can use vox pop to catch attention, UGC to show the product in daily use and testimonials near the checkout. We compare all three properly in [vox pop vs UGC vs testimonials](/blog/vox-pop-vs-ugc).`,

    `Then there's the sit-down interview: one person, chosen in advance, answering many questions in a controlled room. A vox pop flips each part of that. Many people, one question, and a street nobody chose.`,

    `Try the difference for yourself. Six short scenes; label each one.`,

    {
      type: 'widget',
      widget: 'quiz',
      id: 'vox-pop-or-not',
      props: {
        title: 'Vox pop or not?',
        intro: 'For each scene, pick what it is. One point for each right answer.',
        questions: [
          {
            q: `A host outside a college gate asks students, "What's the most you've spent on one meal?" and films ten answers.`,
            options: [
              { text: 'Vox pop', points: 1 },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 0 },
              { text: 'Sit-down interview', points: 0 },
            ],
            explain: 'One question, many strangers, answers nobody scripted. That is a vox pop.',
          },
          {
            q: `A creator is sent a steel water bottle and films a "what's in my office bag" video at home that features it.`,
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 1 },
              { text: 'Testimonial', points: 0 },
              { text: 'Sit-down interview', points: 0 },
            ],
            explain: `One creator, a brief, filmed at home. That is UGC. If the creator was paid or given the product, India's endorsement guidelines expect a clear disclosure label.`,
          },
          {
            q: 'A customer who has used a meal kit for six months tells the camera why they keep reordering.',
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 1 },
              { text: 'Sit-down interview', points: 0 },
            ],
            explain: 'A buyer recommending what they bought. That is a testimonial, and it does its best work near the checkout.',
          },
          {
            q: 'A founder answers twelve questions from a journalist in a studio for forty minutes.',
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 0 },
              { text: 'Sit-down interview', points: 1 },
            ],
            explain: 'One chosen person, many questions, a controlled room. That is a sit-down interview.',
          },
          {
            q: 'At a product launch, a host asks guests to guess what the new product costs, then films the guesses and the reveal.',
            options: [
              { text: 'Vox pop', points: 1 },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 0 },
              { text: 'Sit-down interview', points: 0 },
            ],
            explain: 'Events count. The audience is in one place, the question is one guess, and the reactions are real.',
          },
          {
            q: 'An actor is handed lines, stands on a busy road and "reacts" to a product as if stopped at random.',
            options: [
              { text: 'Vox pop', points: 0, why: 'It borrows the look of a vox pop, but the answer was written in advance.' },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 0 },
              { text: 'A staged ad', points: 1 },
            ],
            explain: 'It looks like a street interview, but nothing about it is unscripted. Passing it off as spontaneous misleads viewers.',
          },
        ],
        results: [
          { min: 0, title: 'Worth a second look', text: 'The lines blur. Go back to the table above: who speaks, who chose them and how much is planned.' },
          { min: 3, title: 'Nearly there', text: 'You can spot a vox pop. The edge cases are events, and staged ads that borrow the look.' },
          { min: 5, title: 'Sharp eye', text: `You know the difference. Now write one question you'd take to the street.` },
        ],
      },
    },

    // ---------------------------------------------------------------- 9
    { type: 'h2', id: 'which-brands-is-vox-pop-right-for', text: 'Which brands is vox pop right for?', toc: 'Which brands it suits' },

    `It works best for brands with physical products, because real people can try the product and react honestly on camera. Founder-led brands, events and services can work too, with a different setup.`,

    `Physical products give the participant something to do. They can smell it, taste it, guess its price or pick between two. That action turns a question into a reaction, and our [vox pop format for retail](/retail) is built around it.`,

    `A quick test for your own brand: can you think of a question about your category that a stranger could start answering in five seconds? If not, start from the problem your product solves, not the product.`,

    `Where we'd expect the format to fit well:`,

    {
      type: 'list',
      items: [
        '**Food and drink:** blind tastings, salt or sweet, guess the ingredient.',
        '**Personal care and fragrance:** smell tests and "what does this remind you of?", kept to habits and feelings.',
        '**Apparel and home:** comfort, fit, and the small annoyances everyone shares.',
        '**Second-hand, refurbished and electronics:** price guesses and "would you buy this used?"',
        '**Apps and services with an everyday problem:** ask about the problem first; the product comes later. A founder with the mic often fits here.',
        '**Events and launches:** the audience is already in one place and already interested.',
      ],
    },

    `It's harder in a few situations. None of them rules vox pop out, but each changes the plan:`,

    {
      type: 'list',
      items: [
        'Products that need a long demo before anyone can react.',
        'Claims that need proof. A street answer is never evidence that a product works.',
        'Buyers who are rarely on the street, such as a niche B2B audience. Events, or a founder asking about the problem, can still work.',
        'Brands that need every word on camera approved in advance.',
      ],
    },

    {
      type: 'callout',
      tone: 'warning',
      title: 'Street answers are not proof',
      text: `The ASCI Code, India's advertising self-regulation code, says claims about matters of objective fact "should be capable of substantiation".[^asci-code] A few happy strangers on a footpath don't substantiate anything. Keep street questions about habits and feelings, and never present an answer as proof that a product works.`,
    },

    // ---------------------------------------------------------------- 10
    { type: 'h2', id: 'what-vox-pop-cant-do', text: `What can't vox pop do?`, toc: `What vox pop can't do` },

    `It can't promise results, and it can't control people. Strangers are unpredictable, performance depends on much more than the video, and one street is never a representative sample.`,

    {
      type: 'quote',
      text: `We can't guarantee any one stranger will be funny or surprised. We can create more chances for it to happen.`,
      attribution: 'Kreators.Army, on what happens on the street',
    },

    `It's the most honest sentence on our site, and it sets the limits for everything below. However well it's planned, a vox pop can't:`,

    {
      type: 'list',
      items: [
        '**Promise views or sales.** Performance depends on the platform, audience, account history, media spend, offer and distribution. That is why [we never promise views or sales](/faq/do-you-guarantee-views).',
        `**Control what people say.** You can plan the question and the follow-up. You can't plan the answer, and you shouldn't try.`,
        '**Replace research at scale.** A few dozen people on one footpath show you language and patterns, not percentages.',
        '**Prove a product works.** Street answers show habits and feelings, not efficacy.',
        `**Fix a weak offer.** If people don't want the product, a vox pop will show you that quickly. It won't change it.`,
        `**Skip consent.** People must agree to be filmed and to the clip being used, and nobody under 18 appears without a parent's written consent. Our guide to [street interview consent in India](/blog/street-interview-consent-india) covers releases.`,
      ],
    },

    `Repetition has limits too. A familiar format helps people recognise you, but the same question in every video gets old fast. That's why we give each video in a batch its own mechanism.`,

    `If anyone promises you a view count before the shoot, ask which stranger they've booked.`,

    // ---------------------------------------------------------------- 11
    { type: 'h2', id: 'how-to-get-started', text: 'How do you get started with vox pop?', toc: 'How to get started' },

    `Start small: one question, a phone and three people. When you want a full batch planned, shot and edited, a crew takes the question design, the street and the edit off your hands.`,

    `You don't need a big set to test the format. Write one question about your customer's life, ask three people at work, and listen. If they answer with a story, you've got a vox pop question. If they shrug, rewrite it before anyone holds a mic.`,

    `Both routes work. They differ in how much of the work lands on your team.`,

    {
      type: 'table',
      caption: 'Testing it yourself or working with a crew',
      head: ['What it takes', 'Doing it yourself', 'Working with a crew'],
      rows: [
        ['Gear', 'A phone, a clip-on mic and a power bank', 'Professional framing and audio'],
        ['The host', 'You, or someone on your team', 'An interviewer, or your founder with the crew beside them'],
        ['Questions', 'One or two you test yourself', 'Concepts and questions planned for your objective'],
        ['Variety', 'Usually one question at a time', 'A different mechanism for each video in the batch'],
        ['Edit', 'On a phone, as time allows', 'Short-form edits: strong openings, captions, clean endings'],
        ['Best for', 'Learning how your customers talk', 'A steady batch of videos for one brand'],
      ],
      rowHeaders: true,
    },

    `The checklist below covers a first test on the street. Your ticks stay in this browser only.`,

    {
      type: 'widget',
      widget: 'checklist',
      id: 'first-street-test',
      props: {
        title: 'Your first street test',
        items: [
          { id: 'one-question', text: 'Write one question about the person, not the brand', detail: 'Read it aloud. If it needs a second breath, cut it.' },
          { id: 'follow-up', text: 'Write the follow-up before you leave', detail: '"Why?" or "What happened last time?" is enough.' },
          { id: 'office-test', text: 'Try the question on three people at work first' },
          {
            id: 'spot',
            text: 'Pick a spot with steady foot traffic and a quieter corner',
            detail: 'Filming inside metro premises needs permission, and private premises belong to someone. Ask first.',
          },
          {
            id: 'consent',
            text: 'Ask before you film anyone, and get a signed release before you use a clip',
            detail: 'Have a lawyer check your release. This is general information, not legal advice.',
          },
          { id: 'vertical', text: 'Film vertical, with the mic close to the person speaking' },
          { id: 'their-words', text: `Keep every answer in the person's own words`, detail: 'Trim, but never reorder words to change what someone meant.' },
          { id: 'repeat-lines', text: 'Write down the lines that repeat across people' },
        ],
        done: `That's a first test. Watch it back and ask which answer you'd stop scrolling for.`,
      },
    },

    `When you want it done at scale, here's how working with us goes:`,

    {
      type: 'list',
      ordered: true,
      items: [
        '**Send the brief.** The objective, how your brand should show up and what every video must include.',
        `**The trial.** We make a short trial on your brand, so you can see the format before you commit. Scope, the number of videos and any fee are confirmed in writing. Trial videos are for evaluation only and can't be published.`,
        '**Feedback and a package.** Consolidated feedback through one point of contact, then a 5, 10 or 20 video package for one brand.',
        '**Prepay and plan.** Before each shoot we lock the objective, products, audience and must-haves.',
        '**Shoot, edit, deliver.** One planned production cycle, with minor revisions included. Usage rights transfer on full payment.',
      ],
    },

    `Packages start at 5 videos for ₹50,000 (₹10,000 a video), GST extra where applicable. Our guide to [what vox pop videos cost in India](/blog/vox-pop-video-cost-india) explains what goes into the price.`,

    { type: 'cta', text: 'See the format on your own brand first. Scope, the number of trial videos and any fee are confirmed in writing.' },

    `If you keep one thing from this guide, keep the question. Before you think about cameras, hosts or streets, sit with this one: which two of your products would your customers argue about?`,

    `Once you have an answer, [how a vox pop shoot works](/blog/how-a-vox-pop-shoot-works) picks up from there, step by step.`,
  ],

  faqs: [
    {
      q: 'What does vox pop stand for?',
      a: `Vox pop stands for _vox populi_, Latin for "the voice of the people". English speakers, especially in Britain, have shortened it to "vox pop" since the mid-1960s. In media and marketing, a vox pop is a short piece built from members of the public answering one question, usually on the street and without a script.`,
    },
    {
      q: 'How do you pronounce vox pop?',
      a: `Vox pop is pronounced "voks pop", rhyming with "box top", with roughly equal weight on both words. The full Latin phrase, vox populi, is said in more than one way: "voks POP-yoo-lee" and "voks POP-yoo-lye" are both common. The plural is vox pops, and both words stay lower case in a sentence.`,
    },
    {
      q: 'What is the difference between a vox pop and an interview?',
      a: 'A vox pop asks many strangers one question, usually on the street, and uses short answers from several of them. A standard interview asks one chosen person many questions, often in a controlled setting. A vox pop shows a range of opinion in one short clip, while an interview goes deep with one voice.',
    },
    {
      q: 'Are vox pop videos real or staged?',
      a: `Honest vox pop videos are real: the people are members of the public, and their answers aren't scripted. What is planned is the question, the setup, who is approached, the follow-up and the edit. Some videos online use actors made to look like strangers. If anyone is paid, cast or works for the brand, India's endorsement guidelines expect that to be disclosed.`,
    },
    {
      q: 'How long is a vox pop video?',
      a: `A vox pop video is usually short enough for Reels or Shorts, but there's no fixed length. We cut each one as tight as the story allows, without losing the context or the payoff. YouTube Shorts and Instagram Reels can now run up to three minutes, though in our view a vox pop rarely needs that long.`,
    },
    {
      q: 'Do people get paid to appear in vox pops?',
      a: `Sometimes. A small incentive, ideally something physical or redeemable on the spot, helps people stop and spend a few minutes answering. It should never decide what they say. If someone is paid to praise a product, works for the brand or was cast, that's an endorsement, and India's guidelines expect the connection to be disclosed.`,
    },
    {
      q: 'Is vox pop the same as a man-on-the-street interview?',
      a: `Yes. Vox pop, street interview and man-on-the-street interview all describe the same format: a host asks members of the public one question, usually outdoors, and the answers are edited together. "Vox pop" is the British-leaning newsroom name and "street interview" is the plain description. "Man on the street" assumes everyone stopped is a man, which is why we rarely use it.`,
    },
    {
      q: 'Can any brand use vox pop?',
      a: `Most brands can try it, but the fit varies. Vox pop works best for physical products people can taste, smell, hold or guess the price of. Founder-led brands, apps that solve an everyday problem and events can also work with the right setup. It suits brands least when every word needs approval, or when a claim needs proof a street answer can't give.`,
    },
  ],

  sources: [
    {
      id: 'mw-vox-populi',
      title: 'Vox populi',
      url: 'https://www.merriam-webster.com/dictionary/vox%20populi',
      publisher: 'Merriam-Webster',
      note: 'Meaning ("popular sentiment or opinion") and first known English use, about 1547. CLAIMS E01.',
    },
    {
      id: 'mw-word-of-the-day',
      title: 'Word of the Day: vox populi',
      url: 'https://www.merriam-webster.com/word-of-the-day/vox%20populi-2007-01-07',
      publisher: 'Merriam-Webster',
      date: '2007-01-07',
      note: 'English speakers, especially British ones, clipped it to "vox pop" since the mid-1960s. CLAIMS E01.',
    },
    {
      id: 'vox-pop-radio',
      title: 'Vox Pop (radio)',
      url: 'https://en.wikipedia.org/wiki/Vox_Pop_(radio)',
      publisher: 'Wikipedia',
      note: 'KTRH Houston, 1932, Parks Johnson and Jerry Belcher; NBC from 1935; ran until 1948. CLAIMS E02.',
    },
    {
      id: 'iamai-2025',
      title: "India's internet user base tops 950 million as rural growth, AI drive adoption",
      url: 'https://www.businesstoday.in/technology/news/story/indias-internet-user-base-tops-950-million-as-rural-growth-ai-drive-adoption-513353-2026-01-29',
      publisher: 'Business Today, reporting the IAMAI and Kantar Internet in India 2025 report',
      date: '2026-01-29',
      note: 'About 588 million short-form video viewers in 2025; rural 302 million, urban 286 million. CLAIMS E15.',
    },
    {
      id: 'bmrcl-shoots',
      title: 'Bengaluru: after 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023',
      note: 'Shoots need prior permission and a fee, in lean hours only. CLAIMS P06 / E28.',
    },
    {
      id: 'youtube-stayed-to-watch',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: '"Stayed to watch": viewers who stayed past the initial seconds of a Short. CLAIMS P01 / E24.',
    },
    {
      id: 'shorts-three-minutes',
      title: 'YouTube Shorts can now be up to three minutes long',
      url: 'https://www.tubefilter.com/2024/10/03/youtube-shorts-three-minutes-max-length-redesign-trends-templates/',
      publisher: 'Tubefilter',
      date: '2024-10-03',
      note: 'Vertical or square uploads up to 3 minutes count as Shorts from 15 October 2024. CLAIMS E20.',
    },
    {
      id: 'reels-three-minutes',
      title: 'Instagram now supports three-minute Reels',
      url: 'https://lindseygamble.com/blog/instagram-three-minute-reels',
      publisher: 'Lindsey Gamble',
      date: '2025-01',
      note: 'Reels up to three minutes from January 2025 (Adam Mosseri). CLAIMS E21.',
    },
    {
      id: 'horton-wohl-1956',
      title: 'Mass Communication and Para-Social Interaction: Observations on Intimacy at a Distance',
      url: 'https://doi.org/10.1080/00332747.1956.11023049',
      publisher: 'Psychiatry 19(3)',
      date: '1956',
      note: 'Horton and Wohl coin para-social interaction. CLAIMS R10.',
    },
    {
      id: 'communications-2022',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert with poll data, yet shifted personal opinion more. CLAIMS R11 / E04.',
    },
    {
      id: 'lefevere-2012',
      title: 'Effects of popular exemplars in television news',
      url: 'https://medialibrary.uantwerpen.be/oldcontent/container2608/files/Lefevere%2C%20De%20Swert%2C%20Walgrave%20-%20Effects%20of%20popular%20exemplars%20in%20television%20news.pdf',
      publisher: 'Communication Research 39(1) (author copy, University of Antwerp)',
      date: '2012',
      note: 'Popular exemplars had more impact on perceived public opinion than interviewed experts and politicians. CLAIMS E05.',
    },
    {
      id: 'brosius-1994',
      title: 'The utility of exemplars in persuasive communications (Brosius and Bathelt)',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research 21(1)',
      date: '1994',
      note: 'Brosius and Bathelt: exemplification, individual cases sway judgments more than base rates. CLAIMS E06.',
    },
    {
      id: 'nielsen-2021',
      title: 'Beyond martech: building trust with consumers and engaging where sentiment is high',
      url: 'https://www.nielsen.com/insights/2021/beyond-martech-building-trust-with-consumers-and-engaging-where-sentiment-is-high/',
      publisher: 'Nielsen',
      date: '2021',
      note: 'Trust in Advertising 2021: 88% trust recommendations from people they know, the most trusted channel. CLAIMS E09.',
    },
    {
      id: 'beckers-2017',
      title: 'How ordinary is the ordinary (wo)man on the street?',
      url: 'https://doi.org/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice 11(8) (Beckers)',
      date: '2017',
      note: '2,000 Flemish TV vox pops; representativeness rarely flagged; minorities under-represented. CLAIMS E07 (DOI link in place of the informahealthcare.com mirror).',
    },
    {
      id: 'opinion-balance-2018',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies',
      date: '2018',
      note: 'Most vox pop news items present one point of view. CLAIMS E08.',
    },
    {
      id: 'essex-fingerprint',
      title: `The "fingerprint" of vox pop interviews`,
      url: 'https://publications.essex.ac.uk/esj/article/id/198/',
      publisher: 'Essex Student Journal 2(1) (Ariel Vázquez)',
      date: '2009',
      note: 'Weak: one student conversation-analysis paper on Mexican TV news vox pops; attributed in the sentence. CLAIMS R12.',
    },
    {
      id: 'endorsement-know-hows',
      title: 'Endorsement Know-hows! for celebrities, influencers and virtual influencers on social media platforms',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose material connections with labels such as "advertisement", "sponsored" or "paid promotion". CLAIMS E26 / 5.7.',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code and guidelines',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'Claims about matters of objectively ascertainable fact should be capable of substantiation. CLAIMS 5.8.',
    },
  ],

  related: ['vox-pop-vs-ugc', 'psychology-of-vox-pop', 'vox-pop-questions', 'how-a-vox-pop-shoot-works'],
};

export default post;
