import type { Post } from '../types';
import meta from './vox-pop-glossary.meta';

// Vox pop glossary: 70 street interview terms explained (PLAN.md post 22). Understand cluster, derived reference post.
// Source: framework names and definitions from across the founder's PDF (pp. 7-14 question types, GRAVEL, warm-up, three shots, ECHO,
// hook-reaction-payoff, FLIP, FAULT line; 19-22 KIRANA and PEAK-VALLEY; 36 two-answer rule; 47 S.T.A.C.K.; 72-92 PACE, DROP, Socratic stack,
// mirror question, second question rule, OPEN loop, STACK protocol, pressure test; 95-103 mirror effect; 106-126 the improv rules, teacher frame,
// play state, code-switching, semi-public spaces), each rewritten in its CLAIMS-corrected form and matched to its home post.
// Facts only from CLAIMS.md: E01, E02, R01, R07, R11, R15, P01, P06, P07, P08, E23, E26 and 5.8. Crew terms come from lib/content.ts
// (JOURNEY, PILOT_STEPS, PACKAGES, ADD_ON, LOCK_LIST, MECHANISMS, INTERACTION, FAQS). The named frameworks are presented as working terms used
// across the blog, not as what Kreators.Army runs on every shoot (PLAN.md decision 2). Every definition has an id so other posts can link
// /blog/vox-pop-glossary#<id>; the ids already linked elsewhere are kept exactly (two-answer-rule, warm-up-question, s-t-a-c-k, pressure-test,
// open-loop, mirror-effect, mechanism, lock-list, kirana-principle, gravel, flip, cold-open). Exactly 70 definition blocks.

const post: Post = {
  meta,

  answer:
    'This vox pop glossary defines 70 terms for planning, shooting, editing and publishing street interviews: short videos where strangers answer one question on camera. It runs from film words like b-roll and the lav mic to interview techniques like the two-answer rule. Each definition stands alone, and the index links every term to a Kreators.Army guide that goes deeper.',

  takeaways: [
    'Seventy terms in eight groups, ordered the way a video gets made, from planning the question to signing the paperwork.',
    'Search the index, filter it by group, and follow the last column to the guide that explains each term in depth.',
    'Capitalised names such as GRAVEL, PACE and FLIP are memory aids from this blog, not industry standards. Offer, status and blocking come from Keith Johnstone’s 1979 book _Impro_.',
    'If you learn one idea, make it the two-answer rule: the first answer is usually polite, and the second, after one gentle follow-up, is usually honest.',
    'The legal entries are general information, not legal advice. Get a signed release from everyone you feature, and have a lawyer check your forms.',
  ],

  body: [
    `Picture the review call after a street shoot. The editor wants b-roll under the second answer. The host says the person in the red scarf gave a gift and nobody followed it. The founder asks whether the price guess should be the cold open or the payoff. Half the call goes on agreeing what the words mean.`,

    `Street interviews borrow words from film sets (b-roll, the jump cut), from marketing (TOFU, MoFu) and from the improv stage (offer, status). Our guides add their own shorthand on top: the warm-up question, the two-answer rule, the FAULT line.`,

    `This page defines 70 of those terms in eight groups. Every definition runs under 60 words and makes sense on its own, so you can send one to a colleague without the rest.`,

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands.',

    // ---------------------------------------------------------------- How to use
    { type: 'h2', id: 'how-to-use', text: 'How do you use this glossary?', toc: 'How to use it' },

    `Search the index for a term, or tap a group to narrow it down. Each term in the index jumps to its full entry, and the last column links to the guide that covers it in depth.`,

    `A word on the capital letters. GRAVEL, PACE, DROP, FLIP and the other acronyms are memory aids written for this blog, not industry standards. Another crew won't know them by name. The moves behind them are much older than the names.`,

    {
      type: 'table',
      caption: 'All 70 terms, A to Z, with the guide that goes deeper',
      head: ['Term', 'Group', 'Go deeper'],
      search: true,
      filterColumn: 1,
      rowHeaders: true,
      rows: [
        ['[A/B question](#ab-question)', 'Format', '[Eleven ways to vary a batch](/blog/eleven-ways-to-vary-a-vox-pop-batch#ab-comparisons)'],
        ['[Aspiration, taboo and contrast questions](#question-types)', 'Format', '[Phase 1: question design](/blog/vox-pop-strategy-for-indian-brands#phase-1-question-design)'],
        ['[B-roll](#b-roll)', 'Production', '[Pacing and cutaways](/blog/how-to-edit-vox-pop-videos#pacing)'],
        ['[Batch](#batch)', 'Format', '[Planning a batch](/blog/eleven-ways-to-vary-a-vox-pop-batch#planning-a-batch)'],
        ['[Block](#block)', 'Improv', '[Improv guide: BLOCK](/blog/improv-for-street-interviews#block)'],
        ['[BOFU](#bofu)', 'Distribution', '[The vox pop stack](/blog/vox-pop-funnel#stacks-together)'],
        ['[Boosting](#boosting)', 'Distribution', '[Should you boost a vox pop?](/blog/where-to-post-vox-pop-videos#should-you-boost)'],
        ['[Callback](#callback)', 'Improv', '[Improv guide: CALLBACK](/blog/improv-for-street-interviews#callback)'],
        ['[Caption tease](#caption-tease)', 'Editing', '[Captions that tease](/blog/street-interview-hooks#captions-that-tease)'],
        ['[Code-switching subtitles](#code-switching-subtitles)', 'Editing', '[Subtitling Hindi and English](/blog/how-to-edit-vox-pop-videos#hindi-english-subtitles)'],
        ['[Cold open](#cold-open)', 'Editing', '[The mid-answer cold open](/blog/street-interview-hooks#mid-answer-cold-open)'],
        ['[Consent](#consent)', 'Legal', '[Consent on camera](/blog/street-interview-consent-india#consent-on-camera)'],
        ['[Disclosure](#disclosure)', 'Legal', '[Disclosing gifts and payments](/blog/street-interview-consent-india#gifts-and-disclosure)'],
        ['[DPDP Act](#dpdp-act)', 'Legal', '[What the DPDP Act could mean](/blog/street-interview-consent-india#dpdp-act)'],
        ['[DROP](#drop)', 'Interview', '[Techniques guide: DROP](/blog/street-interview-techniques#drop)'],
        ['[ECHO technique](#echo)', 'Interview', '[Techniques guide: ECHO](/blog/street-interview-techniques#echo-technique)'],
        ['[Establishing shot](#establishing-shot)', 'Production', '[Three shots are enough](/blog/how-a-vox-pop-shoot-works#three-shots)'],
        ['[Exposure ladder](#exposure-ladder)', 'Distribution', '[The exposure ladder](/blog/psychology-of-vox-pop#exposure-ladder)'],
        ['[FAULT line](#fault-line)', 'Interview', '[Techniques guide: FAULT line](/blog/street-interview-techniques#fault-line)'],
        ['[FLIP carousel](#flip)', 'Distribution', '[The FLIP carousel](/blog/where-to-post-vox-pop-videos#flip-carousel)'],
        ['[Game of the scene](#game-of-the-scene)', 'Improv', '[Improv guide: SCENE](/blog/improv-for-street-interviews#scene)'],
        ['[Gift](#gift)', 'Improv', '[Improv guide: GIFT](/blog/improv-for-street-interviews#gift)'],
        ['[GRAVEL](#gravel)', 'Interview', '[Strategy guide: GRAVEL](/blog/vox-pop-strategy-for-indian-brands#gravel)'],
        ['[Heighten](#heighten)', 'Improv', '[Improv guide: HEIGHTEN](/blog/improv-for-street-interviews#heighten)'],
        ['[Hook](#hook)', 'Editing', '[15 street interview hooks](/blog/street-interview-hooks)'],
        ['[Jump cut](#jump-cut)', 'Editing', '[How fast to cut](/blog/how-to-edit-vox-pop-videos#pacing)'],
        ['[KIRANA principle](#kirana-principle)', 'Format', '[Playbook 1: KIRANA](/blog/street-interview-marketing-playbooks#kirana-principle)'],
        ['[Lav mic](#lav-mic)', 'Production', '[What gear you need](/blog/how-a-vox-pop-shoot-works#what-gear)'],
        ['[Lock list](#lock-list)', 'Crew', '[What the crew locks](/blog/what-goes-in-a-vox-pop-brief#lock-list)'],
        ['[Man-on-the-street interview](#man-on-the-street)', 'Format', '[Where vox pop came from](/blog/what-is-vox-pop-content#where-vox-pop-came-from)'],
        ['[Mechanism](#mechanism)', 'Format', '[The eleven mechanisms](/blog/eleven-ways-to-vary-a-vox-pop-batch#the-eleven-mechanisms)'],
        ['[Mirror effect](#mirror-effect)', 'Format', '[The mirror effect](/blog/street-interviews-for-small-business#the-mirror-effect)'],
        ['[Mirror question](#mirror-question)', 'Interview', '[The mirror question](/blog/street-interview-techniques#mirror-question)'],
        ['[MoFu](#mofu)', 'Distribution', '[MoFu content with vox pops](/blog/vox-pop-mofu-content-strategy#what-is-mofu-content)'],
        ['[Offer](#offer)', 'Improv', '[Improv guide: OFFER](/blog/improv-for-street-interviews#offer)'],
        ['[Open loop](#open-loop)', 'Editing', '[The OPEN loop edit](/blog/street-interview-techniques#open-loop)'],
        ['[PACE](#pace)', 'Interview', '[Techniques guide: PACE](/blog/street-interview-techniques#pace)'],
        ['[Package](#package)', 'Crew', '[Our vox pop pricing](/pricing)'],
        ['[Payoff](#payoff)', 'Editing', '[Where the brand appears](/blog/how-to-edit-vox-pop-videos#the-payoff)'],
        ['[Peak and valley](#peak-valley)', 'Editing', '[The PEAK-VALLEY map](/blog/street-interview-marketing-playbooks#peak-valley-map)'],
        ['[Pilot](#pilot)', 'Crew', '[What happens after the trial](/trial#after)'],
        ['[Play state](#play-state)', 'Improv', '[Improv guide: PLAY](/blog/improv-for-street-interviews#play)'],
        ['[Pressure test](#pressure-test)', 'Interview', '[The pressure test](/blog/street-interview-techniques#pressure-test)'],
        ['[Reaction](#reaction)', 'Editing', '[The middle of a vox pop](/blog/how-to-edit-vox-pop-videos#the-reaction)'],
        ['[Release form](#release-form)', 'Legal', '[What a release should cover](/blog/street-interview-consent-india#release-form)'],
        ['[Retention curve](#retention-curve)', 'Distribution', '[Reading the retention curve](/blog/how-to-edit-vox-pop-videos#retention-curve)'],
        ['[Revisions](#revisions)', 'Crew', '[Can I request revisions?](/faq/can-i-request-revisions)'],
        ['[Room tone](#room-tone)', 'Production', '[Sound that does not jump](/blog/how-to-edit-vox-pop-videos#street-sound)'],
        ['[S.T.A.C.K.](#s-t-a-c-k)', 'Interview', '[The five-beat S.T.A.C.K.](/blog/vox-pop-funnel#the-stack-interview)'],
        ['[Safe zone](#safe-zone)', 'Editing', '[Caption placement](/blog/how-to-edit-vox-pop-videos#placement-and-animation)'],
        ['[Second question rule](#second-question-rule)', 'Interview', '[The second question rule](/blog/street-interview-techniques#second-question-rule)'],
        ['[Semi-public space](#semi-public-space)', 'Production', '[Where to film a vox pop](/blog/how-a-vox-pop-shoot-works#where-to-film)'],
        ['[Socratic stack](#socratic-stack)', 'Interview', '[The Socratic stack](/blog/street-interview-techniques#socratic-stack)'],
        ['[STACK protocol](#stack-protocol)', 'Interview', '[The STACK protocol](/blog/street-interview-techniques#stack-protocol)'],
        ['[Stakes question](#stakes-question)', 'Interview', '[Strategy guide: GRAVEL](/blog/vox-pop-strategy-for-indian-brands#gravel)'],
        ['[Status](#status)', 'Improv', '[Improv guide: STATUS](/blog/improv-for-street-interviews#status)'],
        ['[Stayed to watch](#stayed-to-watch)', 'Distribution', '[Posting to YouTube Shorts](/blog/where-to-post-vox-pop-videos#youtube-shorts)'],
        ['[Teacher frame](#teacher-frame)', 'Interview', '[Improv guide: STATUS](/blog/improv-for-street-interviews#status)'],
        ['[Testimonial](#testimonial)', 'Format', '[What is a testimonial video?](/blog/vox-pop-vs-ugc#what-is-a-testimonial)'],
        ['[TOFU](#tofu)', 'Distribution', '[The vox pop stack](/blog/vox-pop-funnel#stack-belonging)'],
        ['[Trial](#trial)', 'Crew', '[How the trial works](/trial)'],
        ['[Trial Reels](#trial-reels)', 'Distribution', '[Test two openings](/blog/where-to-post-vox-pop-videos#trial-reels)'],
        ['[Two-answer rule](#two-answer-rule)', 'Interview', '[The two-answer rule](/blog/vox-pop-mofu-content-strategy#the-two-answer-rule)'],
        ['[Usage rights](#usage-rights)', 'Legal', '[Where can I use the videos?](/faq/where-can-i-use-the-videos)'],
        ['[User-generated content (UGC)](#ugc)', 'Format', '[What is UGC?](/blog/vox-pop-vs-ugc#what-is-ugc)'],
        ['[Vox pop](#vox-pop)', 'Format', '[What is vox pop content?](/blog/what-is-vox-pop-content)'],
        ['[Vox pop brief](#brief)', 'Crew', '[What goes in a vox pop brief](/blog/what-goes-in-a-vox-pop-brief)'],
        ['[Vox populi](#vox-populi)', 'Format', '[What does vox pop mean?](/blog/what-is-vox-pop-content#what-does-vox-pop-mean)'],
        ['[Warm-up question](#warm-up-question)', 'Interview', '[Start with a warm-up](/blog/how-a-vox-pop-shoot-works#warm-up-question)'],
        ['[Wide, medium and tight shots](#shot-sizes)', 'Production', '[Three shots are enough](/blog/how-a-vox-pop-shoot-works#three-shots)'],
      ],
    },

    `If seventy is too many for one sitting, start with [the five we'd learn first](#learn-first).`,

    // ---------------------------------------------------------------- Format and planning
    { type: 'h2', id: 'format-terms', text: 'Which terms describe the vox pop format?', toc: 'Format and planning' },

    `Eleven terms describe the format: what a vox pop is, what it often gets confused with, and the planning decisions made before anyone picks up a mic.`,

    {
      type: 'definition',
      id: 'vox-pop',
      term: 'Vox pop',
      text: 'A vox pop video is a [short street interview](/blog/what-is-vox-pop-content). A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },
    {
      type: 'definition',
      id: 'vox-populi',
      term: 'Vox populi',
      text: 'Vox populi is Latin for "the voice of the people", meaning popular opinion. Merriam-Webster dates its first known English use to about 1547. It also notes that English speakers, especially British ones, have clipped it to "vox pop" since the mid-1960s[^mw-wotd].',
      source: 'mw-vox-populi',
    },
    {
      type: 'definition',
      id: 'man-on-the-street',
      term: 'Man-on-the-street interview',
      text: 'A man-on-the-street interview is another name for a vox pop: a host stops passers-by in a public place and records their answers to one question. The idea is older than television: radio got there first, with a Houston street-interview show in 1932[^vox-pop-radio]. "Street interview" says the same thing without assuming a man.',
    },
    {
      type: 'definition',
      id: 'ugc',
      term: 'User-generated content (UGC)',
      text: 'User-generated content (UGC) is content made by customers or creators rather than the brand: reviews, unboxings, routines. In advertising, UGC often means a creator paid and briefed to film themselves with a product. A vox pop differs because the people answering were not recruited or briefed before the shoot.',
    },
    {
      type: 'definition',
      id: 'testimonial',
      term: 'Testimonial',
      text: `A testimonial is a satisfied customer describing their experience with a product, often prompted and edited for praise. It persuades through endorsement rather than surprise. India's advertising code expects factual claims to be substantiated, so neither a testimonial nor a street answer counts as proof that a product works[^asci-code].`,
    },

    `The difference matters in a brief. Ask a crew for a vox pop when you wanted a testimonial, and you get strangers arguing where you expected praise.`,
    {
      type: 'definition',
      id: 'mechanism',
      term: 'Mechanism',
      text: `A mechanism is the device that makes a street interaction worth watching: a guess and a reveal, an A/B comparison, a challenge, a ranking, a debate or an unexpected question. Kreators.Army plans with eleven mechanisms and gives each video in a batch its own, so the batch doesn't repeat itself.`,
    },
    {
      type: 'definition',
      id: 'ab-question',
      term: 'A/B question',
      text: 'An A/B question asks someone to choose between two options, such as salt or sweet, or a new phone or a Goa trip. It takes seconds to answer and reads clearly with the sound off. It also splits people into sides. A handful of answers becomes a debate.',
    },

    {
      type: 'video',
      brand: 'BreadBerry',
      title: '10 Breadberry - Salt Vs Sweet',
      caption: 'BreadBerry, from our library. The A/B question is in the title: salt or sweet?',
    },

    {
      type: 'definition',
      id: 'batch',
      term: 'Batch',
      text: 'A batch is a set of vox pop videos for one brand, planned together and shot in one production cycle. A good batch varies the mechanism, the people, the places and the framing, so no two videos repeat the same question. Kreators.Army packages are batches of 5, 10 or 20 videos.',
    },
    {
      type: 'definition',
      id: 'question-types',
      term: 'Aspiration, taboo and contrast questions',
      text: 'Aspiration, taboo and contrast questions are three ways to ask about who someone is rather than what they own. An aspiration question asks who they would be without limits. A taboo question touches something people rarely say aloud, such as salary. A contrast question asks what most people get wrong.',
    },
    {
      type: 'definition',
      id: 'kirana-principle',
      term: 'KIRANA principle',
      text: 'The KIRANA principle is a playbook for familiar trust, named after the kirana (neighbourhood grocery) store whose owner knows your order. Its six letters: know the person, inhabit their world, reflect their words, anchor to the familiar, narrow the target, and accumulate small moments of recognition across every post.',
    },
    {
      type: 'definition',
      id: 'mirror-effect',
      term: 'Mirror effect',
      text: `The mirror effect is the moment a viewer hears a stranger say something messy and true and thinks "that's me". The viewer recognises themselves before they notice the brand. Brands can then reuse the stranger's exact words in captions, hooks and product copy.`,
    },

    `Ordinary voices carry weight even with people who say they trust experts more. In a 2022 experiment with TV news items, viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-pop-vs-expert].`,

    // ---------------------------------------------------------------- Interview: opening
    { type: 'h2', id: 'interview-techniques', text: 'Which terms cover the start of a street interview?', toc: 'Interview: the opening' },

    `Seven terms cover the start: four for the message and the first minute, and three structures that carry a whole conversation. Get the opening wrong and people perform for the camera instead of talking to you.`,

    `Our [guide to street interview techniques](/blog/street-interview-techniques) has a script for most of these.`,

    { type: 'h3', id: 'before-and-first-minute', text: 'Before the camera and in the first minute' },

    {
      type: 'definition',
      id: 'pressure-test',
      term: 'Pressure test',
      text: 'A pressure test means saying your headline or hook, word for word, to a few strangers before you film anything, then watching their faces. A squint, a pause or "what does that mean?" shows the message needs fixing before you spend money on production. Nothing is recorded.',
    },
    {
      type: 'definition',
      id: 'warm-up-question',
      term: 'Warm-up question',
      text: 'A warm-up question is an easy, low-stakes question asked before the real one: what someone ate on their last trip home, say. Someone who has already answered one easy question tends to relax into the second. It doubles as a sound check.',
    },
    {
      type: 'definition',
      id: 'pace',
      term: 'PACE',
      text: 'PACE is a four-part opening for a street interview. Permission: a minute of being friendly before filming. Anchoring: naming the topic, never the answer. Catalyst: asking for a moment, not an opinion, such as the last time a snack hit the spot. Extraction: holding still while the answer arrives.',
    },
    {
      type: 'definition',
      id: 'teacher-frame',
      term: 'Teacher frame',
      text: `The teacher frame phrases a question so the participant becomes the expert. "Can you help me understand why this matters to you?" works better than "What do you think of this?" because people asked to teach tend to explain. People who feel tested hunt for the right answer.`,
    },

    { type: 'h3', id: 'whole-interview', text: 'Structures for a whole interview' },

    'Two of these three share a name, which trips people up. The dotted S.T.A.C.K. fits a short chat on a footpath. The STACK protocol needs someone with time to spare, at a pop-up or an event.',

    {
      type: 'definition',
      id: 'gravel',
      term: 'GRAVEL',
      text: 'GRAVEL is a six-beat path from small talk to the answer that matters. Ground the person in a memory, raise the temperature with soft follow-ups and ask the real question. Then validate without judging, escalate with a stakes question, and leave the last answer alone in silence.',
    },
    {
      type: 'definition',
      id: 's-t-a-c-k',
      term: 'S.T.A.C.K.',
      text: 'S.T.A.C.K. is a five-beat structure for one street conversation. Safety makes it easy to leave, territory asks easy preference questions, and anchoring ties the topic to a real memory. Challenge asks for the harder version of their answer. In the conclusion, they land on their own last line. It differs from the STACK protocol.',
    },
    {
      type: 'definition',
      id: 'stack-protocol',
      term: 'STACK protocol',
      text: 'The STACK protocol builds one long interview so it gives several usable moments. Set an emotional baseline, test a mild provocation and amplify what surfaces. Then challenge the comfortable version, and keep pulling until the person surprises themselves. It needs time, so it suits events and pop-ups. It differs from S.T.A.C.K.',
    },

    // ---------------------------------------------------------------- Interview: going deeper
    { type: 'h2', id: 'follow-up-techniques', text: 'Which terms help you get past the first answer?', toc: 'Interview: going deeper' },

    `Follow-up techniques get people from the answer they think they should give to the one they actually believe. Most of them work in the few seconds after someone stops talking.`,

    'That gap is where a host either moves on or leans in.',

    {
      type: 'definition',
      id: 'drop',
      term: 'DROP',
      text: 'DROP gets the real reason by offering a slightly wrong guess that people want to correct. Displace their assumption, restate it a little off, observe the correction, then pull the truth out with one more question. Correcting someone tends to feel safer than explaining yourself.',
    },
    {
      type: 'definition',
      id: 'socratic-stack',
      term: 'Socratic stack',
      text: 'The Socratic stack is three questions, each built on the last answer: a surface question, a gentle challenge to the reason given, then a question about when that belief began. A "when" can only be answered with a memory. By the third layer, people stop reciting.',
    },
    {
      type: 'definition',
      id: 'fault-line',
      term: 'FAULT line',
      text: `The FAULT line mines hesitation instead of praise. Find the moment someone almost didn't buy, amplify it without judgement, uncover what changed, let the shift land in silence, then tie it to a feeling. It needs a real buyer. Use it at shop fronts, pop-ups and events.`,
    },
    {
      type: 'definition',
      id: 'mirror-question',
      term: 'Mirror question',
      text: `The mirror question asks "Does this remind you of anything?" after someone has tried a product. It draws out a memory or a comparison instead of a review, such as a grandparent's kitchen or a train ride home. It is a different thing from the mirror effect and from mirroring.`,
    },

    {
      type: 'video',
      brand: 'Waxys',
      title: 'What Does This Remind',
      caption: 'Waxys, from our library. The title is a mirror question: what does this remind you of?',
    },

    {
      type: 'definition',
      id: 'stakes-question',
      term: 'Stakes question',
      text: 'A stakes question asks what someone would lose if a product, a place or a habit stopped existing. It is the escalation beat in GRAVEL, saved until the person is comfortable. Asked cold, it gets a shrug. Asked late, it often gets a reason.',
    },
    {
      type: 'definition',
      id: 'echo',
      term: 'ECHO technique',
      text: 'The ECHO technique means repeating the key two or three words of an answer back to the person, then staying quiet. Extract the phrase, confirm it, hold the silence, observe what fills it. Former FBI hostage negotiator Chris Voss calls the move mirroring[^mirroring].',
    },
    {
      type: 'definition',
      id: 'second-question-rule',
      term: 'Second question rule',
      text: `The second question rule says never stop at the first answer. Once someone has committed to a position, a light "Interesting, why though?", or "Achha, kyun?" in Hindi, often brings out the reason they hadn't planned to say. Asked too early, the same question sounds like a challenge.`,
    },
    {
      type: 'definition',
      id: 'two-answer-rule',
      term: 'Two-answer rule',
      text: 'The two-answer rule is the pattern behind most follow-ups. The first answer to a street question is usually the polite one. The second, after one gentle follow-up, is usually the honest one. Middle-of-funnel content is built from the second answer, because that is the one viewers recognise.',
    },

    'Tap each card for the second answer.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'two-answer-reveal',
      props: {
        title: 'First answer, second answer (made-up examples)',
        firstLabel: 'First answer',
        secondLabel: 'After "Interesting, why though?"',
        items: [
          {
            question: 'What made you pick this candle?',
            first: '"It smells nice."',
            second: `"It smells like my grandmother's house. I light it when I miss home."`,
          },
          {
            question: 'Why this bread and not the cheaper one?',
            first: '"It tastes better."',
            second: '"My dad brought this one home every Sunday. I never switched, and now my kids ask for it."',
            note: 'The second answer gives a caption and a reason. The first gives neither.',
          },
        ],
      },
    },

    // ---------------------------------------------------------------- Improv
    { type: 'h2', id: 'improv-terms', text: 'Which improv terms do street interviewers use?', toc: 'Improv terms' },

    `Improv terms describe how to listen and build on what someone gives you. Offer, status and blocking come from Keith Johnstone's 1979 book _Impro_[^impro-glossary]. A good street interviewer needs the same habits, with strangers who never agreed to be in a scene.`,

    `Our guide to [improv for street interviews](/blog/improv-for-street-interviews) turns each term into a habit a host can practise. Pick one per shoot. Trying all eight at once makes a host stiffer, not looser.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'Stage words, our acronyms',
      text: 'The stage terms below are widely used by improvisers. The capitalised versions in our improv guide, such as GIFT and SCENE, are memory aids written for this blog, not improv canon.',
    },

    {
      type: 'definition',
      id: 'offer',
      term: 'Offer',
      text: 'An offer, in improv, is anything a scene partner gives you to build on: a line, a gesture, a pause, a look. On the street, an offer is any part of an answer that opens a door, including a sentence someone starts and then abandons.',
    },
    {
      type: 'definition',
      id: 'block',
      term: 'Block',
      text: `Blocking is refusing or ignoring an offer, which in improv stops a scene dead. Interviewers block when an answer turns awkward and they smile and move to the next planned question. The fix is a "yes, and" habit: build on the offer for two more exchanges before redirecting.`,
    },
    {
      type: 'definition',
      id: 'gift',
      term: 'Gift',
      text: 'A gift is an unplanned moment in an answer, such as a nervous laugh, a pause or an odd choice of word, that reveals more than anything the host prepared. The GIFT habit: get out of the plan, identify the gift, follow it fully, and trust the viewer to find it real.',
    },
    {
      type: 'definition',
      id: 'status',
      term: 'Status',
      text: `Status is improv's word for who holds control in an exchange, and a central idea in Johnstone's _Impro_. A host with a camera, a mic and the questions starts high. Participants then play safe. The STATUS shift hands the expert role to them on purpose, often with a teacher-frame question.`,
      source: 'impro-glossary',
    },
    {
      type: 'definition',
      id: 'game-of-the-scene',
      term: 'Game of the scene',
      text: 'The game of the scene is the pattern that makes an improv scene work, found and then played again. In an interview, it is the theme someone keeps returning to. The SCENE habit spots the repeat, names it gently, escalates it, never drops it and builds the edit around it.',
    },
    {
      type: 'definition',
      id: 'heighten',
      term: 'Heighten',
      text: 'To heighten is to stay inside a moment that is working and raise it instead of moving on. When an answer spikes with energy or honesty, the host asks one more question into the same ground, then another, for as long as the energy holds. Moving on early is the usual mistake.',
    },
    {
      type: 'definition',
      id: 'callback',
      term: 'Callback',
      text: 'A callback brings back a specific word or image from earlier so it lands with new meaning. In a vox pop, the host notes one specific word from the first minutes and links back to it later with a single question. The edit can then close on that return. Don’t explain it.',
    },
    {
      type: 'definition',
      id: 'play-state',
      term: 'Play state',
      text: 'The play state is the relaxed mood in which a participant stops treating the interview as a test. Hosts reach it with something absurd and low-stakes before recording, such as "If this brand were a film villain, who would it be?", then move to the real question gradually.',
    },

    // ---------------------------------------------------------------- Production
    { type: 'h2', id: 'production-terms', text: 'What do b-roll, lav mic and other shoot terms mean?', toc: 'Production terms' },

    `Shoot terms cover sound, framing and where you stand. A street shoot needs less gear than most people expect: clear audio, three framings and a spot where people have a minute to spare.`,

    {
      type: 'definition',
      id: 'lav-mic',
      term: 'Lav mic',
      text: 'A lav mic, short for lavalier microphone, is a small clip-on microphone worn on clothing near the chest. It records a voice clearly over street noise. A handheld mic is the visible alternative: it shows viewers who is speaking and passes easily between host and participant.',
    },
    {
      type: 'definition',
      id: 'room-tone',
      term: 'Room tone',
      text: 'Room tone is a short recording of a location’s background sound with nobody speaking. Outdoors it is often called ambience. Laid under the cuts, it keeps traffic and chatter continuous when two answers are joined. Record it at every spot, because a busy signal and a café courtyard sound nothing alike.',
    },
    {
      type: 'definition',
      id: 'establishing-shot',
      term: 'Establishing shot',
      text: 'An establishing shot is a wide opening shot that shows where a conversation is happening, such as a market lane or the footpath outside a college gate. In a vox pop it proves the place is real. That is part of why viewers believe the answer.',
    },
    {
      type: 'definition',
      id: 'shot-sizes',
      term: 'Wide, medium and tight shots',
      text: 'Wide, medium and tight shots are the three framing sizes in a simple street setup. The wide shot shows the place. The medium shot frames the participant from the chest up for the conversation. The tight shot catches the face. That is where the reaction lives.',
    },
    {
      type: 'definition',
      id: 'b-roll',
      term: 'B-roll',
      text: 'B-roll is supporting footage cut in over or between the main interview. Think of the product in someone’s hand, a queue at a chai stall or a close-up of packaging. In a vox pop it covers jump cuts, adds context and gives a strong line room to breathe.',
    },
    {
      type: 'definition',
      id: 'semi-public-space',
      term: 'Semi-public space',
      text: `A semi-public space is a place open to everyone but not a busy thoroughfare, such as a café courtyard, the edge of a market or a park gate. It causes less friction than a narrow footpath, where everyone is in someone's way. Metro premises are different: Bengaluru's Namma Metro needs prior permission for shoots[^namma-metro].`,
    },

    `Our rule of thumb on a shoot: sound first, then the face, then everything else. A slightly soft frame survives the edit. A line drowned by traffic doesn't.`,

    'Gear, spots and permissions get the full treatment in [how a vox pop shoot works](/blog/how-a-vox-pop-shoot-works).',

    // ---------------------------------------------------------------- Editing
    { type: 'h2', id: 'editing-terms', text: 'Which editing terms shape a vox pop?', toc: 'Editing terms' },

    `Three beat names do most of the work: the hook earns the first seconds, the reaction sets answers against each other, and the payoff closes. The other seven terms are tools that hold those beats together.`,

    `[How to edit a vox pop](/blog/how-to-edit-vox-pop-videos) walks through a full cut, from logging the footage to reading the curve after posting.`,

    {
      type: 'definition',
      id: 'hook',
      term: 'Hook',
      text: 'The hook is whatever earns the first seconds of a video: an opening answer, a caption, a visual or the question on screen. In a vox pop, pick the most emotionally charged moment of the session, not the most articulate one. It is the first beat of hook, reaction, payoff.',
    },
    {
      type: 'definition',
      id: 'cold-open',
      term: 'Cold open',
      text: 'A cold open starts a video on its sharpest answer, with no logo, intro or setup. The viewer lands mid-moment, sometimes mid-sentence, and decides whether to stay, so that first answer has to earn the next few seconds. It is the most direct way to deliver the hook.',
    },
    {
      type: 'definition',
      id: 'reaction',
      term: 'Reaction',
      text: 'The reaction is the middle beat of a vox pop edit: two or three contrasting answers cut back to back, so the viewer starts comparing and asks where they stand. Similar answers side by side give viewers nothing to compare.',
    },
    {
      type: 'definition',
      id: 'payoff',
      term: 'Payoff',
      text: 'The payoff is the closing beat of a vox pop edit: either the most surprising answer, which reframes the question, or the brand moment. A brand moment works only once viewers feel understood. Too early, and it’s an ad.',
    },
    {
      type: 'definition',
      id: 'jump-cut',
      term: 'Jump cut',
      text: 'A jump cut is a cut within the same shot that skips a moment of time, so the person seems to jump forward. Use them to clear pauses from energetic answers. Use fewer on emotional ones, so those lines have room to land.',
    },
    {
      type: 'definition',
      id: 'peak-valley',
      term: 'Peak and valley',
      text: 'Peaks are the high-energy moments in raw footage: laughs, strong opinions, quick answers. Valleys are the quiet ones: a pause, a restarted sentence, a puzzled face. The PEAK-VALLEY approach keeps at least two valleys in the final cut, because a pause shows the question was real.',
    },
    {
      type: 'definition',
      id: 'open-loop',
      term: 'Open loop',
      text: 'An open loop is a tension a video raises and holds back from resolving, which gives viewers a reason to keep watching. The idea is often traced to Bluma Zeigarnik, but a 2025 meta-analysis found no memory advantage for unfinished tasks[^zeigarnik-meta]. Treat it as editing craft, not a law of the brain.',
    },
    {
      type: 'definition',
      id: 'caption-tease',
      term: 'Caption tease',
      text: 'A caption tease is on-screen text that hints at what is coming instead of describing what viewers can already see. "Wait for the answer in the blue cap" gives a muted viewer a reason to stay. "People share their views" gives them none.',
    },

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'caption-tease-toggle',
      props: {
        title: 'One clip, two captions',
        before: {
          label: 'Describes',
          text: 'On screen: "People share their thoughts on breakfast."',
          points: ['Repeats what viewers can already see', 'Gives someone watching on mute no reason to wait'],
        },
        after: {
          label: 'Teases',
          text: 'On screen: "Wait for the answer in the blue cap."',
          points: ['Points to a beat that has not happened yet', 'Only works if the video then delivers it'],
        },
        note: 'Write the tease after the edit is locked, so the caption never promises a moment the cut does not have.',
      },
    },

    {
      type: 'definition',
      id: 'safe-zone',
      term: 'Safe zone',
      text: `The safe zone is the part of a vertical frame that the app's own buttons, captions and account name don't cover. The edges and the bottom of a Reel or Short are usually overlaid, so faces, question cards and captions belong nearer the centre. Check each app's current layout before export.`,
    },
    {
      type: 'definition',
      id: 'code-switching-subtitles',
      term: 'Code-switching subtitles',
      text: `Code-switching subtitles keep a participant's mix of languages, such as Hindi and English, or Kannada and English, instead of forcing one. People often switch mid-sentence, and that switch can be the most natural part of the clip. Subtitle what was said rather than asking for an English-only retake.`,
    },

    // ---------------------------------------------------------------- Distribution and analytics
    { type: 'h2', id: 'distribution-terms', text: 'What do TOFU, MoFu and the analytics terms mean?', toc: 'Distribution and analytics' },

    `TOFU, MoFu and BOFU name the top, middle and bottom of the marketing funnel, which tells you who a clip is for. The analytics terms describe what viewers did once they saw it.`,

    `Our advice: read where people left before you count views. [Where to post vox pop videos](/blog/where-to-post-vox-pop-videos) covers each platform in turn.`,

    'The three funnel stages are easiest to see side by side.',

    {
      type: 'table',
      caption: 'The three funnel stages, in vox pop terms',
      head: ['Stage', 'Who is watching', 'A vox pop that fits'],
      rowHeaders: true,
      rows: [
        ['TOFU (top)', 'People who have never heard of you', 'A broad, easy question about a shared habit'],
        ['MoFu (middle)', 'People who know you and are weighing it up', 'The honest second answer to a common objection'],
        ['BOFU (bottom)', 'People close to buying', 'A blind test, a price guess or the product in real hands'],
      ],
    },

    {
      type: 'definition',
      id: 'tofu',
      term: 'TOFU',
      text: `TOFU, the top of the funnel, is content for people who don't know your brand yet. Its job is attention and recognition, not selling. In vox pop terms, it is the broad, easy question about a shared habit that a stranger will happily stop for.`,
    },
    {
      type: 'definition',
      id: 'mofu',
      term: 'MoFu',
      text: `MoFu, the middle of the funnel, is content for people who have noticed a brand but haven't decided. Its job is trust and consideration: objections, comparisons and real reasons. Street interviews suit the middle because an honest second answer sounds like a peer talking, not a brand selling.`,
    },
    {
      type: 'definition',
      id: 'bofu',
      term: 'BOFU',
      text: 'BOFU, the bottom of the funnel, is content for people close to buying. Its job is to answer the last doubts: price, fit, what it is like to use and where to buy. A vox pop here might show a blind test, a price guess or a product in real hands.',
    },

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Guess The Price',
      nth: 5,
      caption: 'A price guess, one of the bottom-of-funnel ideas above. The question is in the title: guess the price.',
    },

    {
      type: 'definition',
      id: 'retention-curve',
      term: 'Retention curve',
      text: 'A retention curve is the graph in a platform’s analytics that shows how many viewers are still watching at each moment. A steep early drop points to a weak hook. A dip in the middle points to a flat reaction section, and a drop before the end to a brand moment that came too early.',
    },
    {
      type: 'definition',
      id: 'stayed-to-watch',
      term: 'Stayed to watch',
      text: '"Stayed to watch" is a YouTube Shorts analytics measure: the share of times viewers kept watching past the first seconds of a Short instead of swiping away[^yt-stayed-to-watch]. It was formerly labelled "viewed vs swiped away", and it is a quick read on whether an opening worked.',
    },
    {
      type: 'definition',
      id: 'trial-reels',
      term: 'Trial Reels',
      text: 'Trial Reels is an Instagram feature that shows a Reel to non-followers first, after which the creator decides whether to share it with followers[^trial-reels]. For street interviews, it is a low-risk way to test two hooks cut from the same footage before committing to one.',
    },
    {
      type: 'definition',
      id: 'boosting',
      term: 'Boosting',
      text: 'Boosting means paying a platform to show an existing post to more people. Our rule: boost only clips that already held attention without paid help. Your audience has already run the test. Money rarely rescues a clip that nobody watched.',
    },
    {
      type: 'definition',
      id: 'flip',
      term: 'FLIP carousel',
      text: 'A FLIP carousel turns one street answer into a four-slide argument. Frame the belief your audience already holds, then layer in the answer that contradicts it, word for word. Invert the logic, then plant the view your brand stands for. It suits LinkedIn and Instagram carousels.',
    },
    {
      type: 'definition',
      id: 'exposure-ladder',
      term: 'Exposure ladder',
      text: 'An exposure ladder plans several meetings with one idea, each in a different format: a vox pop, a carousel, a talking head, a case study and a comment prompt. It draws on the mere-exposure effect, which research finds real but modest, and which fades with too much repetition[^mere-exposure].',
    },

    // ---------------------------------------------------------------- Legal and ethics
    { type: 'h2', id: 'legal-terms', text: 'Which legal terms apply to filming people in India?', toc: 'Legal and ethics' },

    `Five terms cover the permission to film someone, the permission to use what they said, and the duty to say who paid for what.`,

    {
      type: 'callout',
      tone: 'warning',
      title: 'Not legal advice',
      text: 'Get a signed release from everyone you feature, tell them where the video will appear, and have a lawyer check your forms. Our [guide to street interview consent in India](/blog/street-interview-consent-india) goes further.',
    },

    {
      type: 'definition',
      id: 'consent',
      term: 'Consent',
      text: 'Consent, in a street interview, is a participant’s clear agreement to be filmed and for the footage to be used. They should know who is filming and where the video will appear. Good practice: say both on camera, get a signed release, and never feature anyone under 18 without a parent’s written consent.',
    },
    {
      type: 'definition',
      id: 'release-form',
      term: 'Release form',
      text: 'A release form is a signed document in which a participant allows footage of them to be used, usually naming the brand, the purposes and the places it may appear. Get one from everyone you feature, keep it with the footage, and have a lawyer check the template.',
    },
    {
      type: 'definition',
      id: 'dpdp-act',
      term: 'DPDP Act',
      text: `The DPDP Act is India's Digital Personal Data Protection Act, 2023. The government notified its rules in November 2025, and they come into force in phases, with the consent and notice duties due around May 2027[^dpdp-rules]. A video of an identifiable person is personal data.`,
    },
    {
      type: 'definition',
      id: 'disclosure',
      term: 'Disclosure',
      text: `Disclosure means clearly labelling a material connection between a brand and the people promoting it. India's endorsement guidelines expect terms such as "advertisement", "sponsored" or "paid promotion"[^endorsement-know-hows]. In a vox pop, it applies when anyone featured is paid, works for the brand or was cast.`,
    },
    {
      type: 'definition',
      id: 'usage-rights',
      term: 'Usage rights',
      text: 'Usage rights set where and how a brand may use the final videos, such as its own channels and ads. Kreators.Army transfers usage rights for final videos on full payment, on the terms of the pilot agreement. Trial videos carry none. They are for evaluation only.',
    },

    `One ethical line sits under all five. A staged vox pop passed off as spontaneous misleads the viewer, so if anyone on screen was cast, paid or works for the brand, say so.`,

    // ---------------------------------------------------------------- Working with a crew
    { type: 'h2', id: 'crew-terms', text: 'Which terms come up when you hire a vox pop crew?', toc: 'Working with a crew' },

    `Six terms come up as soon as you talk to a crew: the brief, the trial, the pilot, the package, the lock list and revisions. They're defined here as Kreators.Army uses them. If another studio uses the same word, ask what theirs includes.`,

    {
      type: 'definition',
      id: 'brief',
      term: 'Vox pop brief',
      text: 'A vox pop brief is a short document that tells a street-interview crew what a batch is for, before filming. It covers the objective, how prominent the brand should be, the response you want, the must-haves, a simple brand guide and 3 to 5 reference videos. It briefs the interaction, not the lines.',
    },
    {
      type: 'definition',
      id: 'trial',
      term: 'Trial',
      text: `A trial is a short piece of work on your own brand that lets you see the format before you commit. At Kreators.Army, its scope, the number of trial videos and any fee are confirmed in writing. Trial videos are for evaluation only, so they can't be published, boosted or used in ads.`,
    },
    {
      type: 'definition',
      id: 'pilot',
      term: 'Pilot',
      text: 'A pilot is the first paid engagement after a trial. You give consolidated feedback, choose a package for one brand, sign a pilot agreement and pay in advance. A batch usually takes 14 to 21 days, and the exact delivery dates are confirmed in that agreement once pre-production alignment is complete.',
    },
    {
      type: 'definition',
      id: 'package',
      term: 'Package',
      text: `A package is a fixed batch of videos for one brand, paid in full in advance. At Kreators.Army, 5 videos cost ₹50,000 and 10 cost ₹85,000. Twenty cost ₹1,50,000 and blocks of 5 beyond that cost ₹35,000 each. GST is extra where applicable. Packages can't be split across brands.`,
    },
    {
      type: 'definition',
      id: 'lock-list',
      term: 'Lock list',
      text: 'The lock list is the nine points Kreators.Army fixes before each shoot. They are the objective, the products, the audience, the core message, the response you want, required brand information, must-haves, things to avoid and special production needs. Changing them after filming can mean extra editing or a reshoot.',
    },
    {
      type: 'definition',
      id: 'revisions',
      term: 'Revisions',
      text: 'Revisions are changes requested after the edit. Minor, edit-level ones, such as text, trims, order and captions, are included in Kreators.Army packages. A different concept, new footage or a reshoot is discussed separately first, and feedback works best through one point of contact.',
    },

    {
      type: 'steps',
      id: 'crew-steps',
      title: 'How an engagement with Kreators.Army runs',
      intro: 'The crew terms above, in the order you meet them.',
      steps: [
        { name: 'Send the brief', text: 'Tell us the objective, how your brand should show up and what every video must include.' },
        { name: 'Review the trial', text: 'See the format on your own brand, on the scope agreed in writing. A trial usually takes 7 to 14 days.' },
        { name: 'Send consolidated feedback', text: 'Share feedback through one point of contact, then choose a package.' },
        { name: 'Sign and prepay', text: 'Sign the pilot agreement and pay in advance. Production starts when payment arrives.' },
        { name: 'Lock the list', text: 'Before each shoot, fix the nine points of the [lock list](#lock-list) with us.' },
        { name: 'Shoot, edit and review', text: 'We produce the batch in one planned cycle, usually 14 to 21 days, with review checkpoints where useful.' },
        { name: 'Receive the rights', text: 'Usage rights for the final videos transfer on full payment.' },
      ],
    },

    'Short answers on price, payment and timing are on our [FAQ page](/faq).',

    // ---------------------------------------------------------------- Practice
    { type: 'h2', id: 'test-yourself', text: 'How well do you know the terms?', toc: 'Test yourself' },

    `Three ways to check: a table of the pairs people mix up, a deck of flashcards and a six-question quiz. Use them before a shoot, or with someone new to the team.`,

    {
      type: 'table',
      caption: 'Terms that sound alike, and the difference',
      head: ['Terms', 'The difference'],
      rowHeaders: true,
      rows: [
        ['Mirror question, mirror effect, mirroring', 'A question to ask, a viewer’s "that’s me" moment, and the ECHO move'],
        ['S.T.A.C.K. and the STACK protocol', 'Five beats for one short conversation, against a slow build for a long one'],
        ['Hook and cold open', 'Any opening that earns attention, against one way to deliver it'],
        ['Second question rule and two-answer rule', 'The move ("why, though?") and the pattern it relies on'],
        ['Consent and release form', 'The agreement itself, and the signed record of it'],
        ['Trial and pilot', 'A look at the format on your brand, then the first paid package'],
      ],
    },

    {
      type: 'widget',
      widget: 'flipCards',
      id: 'glossary-flashcards',
      props: {
        title: 'Flashcards: name the term',
        cards: [
          { front: 'Repeat their last two or three words, then say nothing.', back: '**ECHO technique.** Extract, confirm, hold, observe. Negotiators call it mirroring.', tag: 'Interview' },
          { front: 'Ask about the moment they almost did not buy.', back: '**FAULT line.** Doubt first, then what changed, then the feeling.', tag: 'Interview' },
          { front: 'Offer a slightly wrong guess and let them correct you.', back: '**DROP.** Displace, restate, observe, pull.', tag: 'Interview' },
          { front: 'Ground, raise, ask, validate, escalate, leave.', back: '**GRAVEL.** Small talk to the stakes question, ending in silence.', tag: 'Interview' },
          { front: 'Permission, anchoring, catalyst, extraction.', back: '**PACE.** The four-part opening of a street interview.', tag: 'Interview' },
          { front: 'Safety, territory, anchoring, challenge, conclusion.', back: '**S.T.A.C.K.** Five beats for one short conversation. Not the STACK protocol.', tag: 'Interview' },
          { front: 'The first answer is polite. The second is honest.', back: '**Two-answer rule.** Middle-of-funnel content is built from the second one.', tag: 'Interview' },
          { front: 'Anything a person gives you to work with: a line, a pause, a look.', back: '**Offer.** A stage term. Ignoring one is called blocking.', tag: 'Improv' },
          { front: 'The video starts on the sharpest answer, with no intro.', back: '**Cold open.** One way to deliver the hook.', tag: 'Editing' },
          { front: 'Supporting footage cut over the interview: hands, product, street.', back: '**B-roll.** It hides jump cuts and gives a line room to land.', tag: 'Production' },
          { front: 'Four slides: the belief, the contradiction, the turn, the new view.', back: '**FLIP carousel.** Frame, layer, invert, plant.', tag: 'Distribution' },
          { front: 'Labelling a paid or cast participant clearly.', back: '**Disclosure.** India’s endorsement guidelines expect words such as "sponsored" or "paid promotion".', tag: 'Legal' },
        ],
      },
    },

    {
      type: 'widget',
      widget: 'quiz',
      id: 'glossary-quiz',
      props: {
        title: 'Which term is it?',
        intro: 'Six moments from a shoot or an edit. Pick the term that names each one.',
        questions: [
          {
            q: 'Your editor starts the video mid-sentence on the strongest answer, with no logo or intro.',
            options: [
              { text: 'Cold open', points: 1, why: 'Right. The first answer is the opening.' },
              { text: 'Payoff', points: 0, why: 'The payoff is the closing beat.' },
              { text: 'B-roll', points: 0 },
            ],
            explain: 'A cold open is one way to deliver the hook.',
          },
          {
            q: 'The host hears "I just stopped trusting it", says "Stopped trusting it", then waits.',
            options: [
              { text: 'Callback', points: 0, why: 'A callback returns to a word from much earlier.' },
              { text: 'ECHO technique', points: 1, why: 'Right. Two or three words back, then silence.' },
              { text: 'Second question rule', points: 0, why: 'Close, but the host asks nothing new here. They only hand the words back.' },
            ],
            explain: 'What fills the silence is often the line the video is built on.',
          },
          {
            q: 'Before booking a shoot, you read your ad headline to three strangers and watch their faces.',
            options: [
              { text: 'Warm-up question', points: 0, why: 'A warm-up happens on camera, before the real question.' },
              { text: 'Trial', points: 0 },
              { text: 'Pressure test', points: 1, why: 'Right. Nothing is filmed; you are testing the message.' },
            ],
            explain: 'Fix the message before you spend on production.',
          },
          {
            q: 'One person in the final edit works at the brand’s own office.',
            options: [
              { text: 'Disclosure', points: 1, why: 'Right. The connection needs a clear label.' },
              { text: 'Release form', points: 0, why: 'They still need to sign one, but the issue here is the label.' },
              { text: 'Usage rights', points: 0 },
            ],
            explain: 'Anyone paid, cast or employed by the brand should be disclosed.',
          },
          {
            q: 'You want to test two openings on people who do not follow you before your followers see either.',
            options: [
              { text: 'Boosting', points: 0, why: 'Boosting pays for reach. It does not hold a Reel back from followers.' },
              { text: 'Trial Reels', points: 1, why: 'Right. Non-followers see it first, and you decide what happens next.' },
              { text: 'Exposure ladder', points: 0 },
            ],
            explain: 'Cut two hooks from the same footage and compare them.',
          },
          {
            q: 'A participant keeps returning to what their mother thinks, and the host builds the next questions around it.',
            options: [
              { text: 'Heighten', points: 0, why: 'Close. Heightening raises one moment; here the repeat itself is the point.' },
              { text: 'Gift', points: 0, why: 'A gift is one unplanned moment, not a pattern.' },
              { text: 'Game of the scene', points: 1, why: 'Right. Spot the repeat, then play it.' },
            ],
            explain: 'The repeat can become the through-line of the edit.',
          },
        ],
        results: [
          { min: 0, title: 'Keep the index open', text: 'Read the entries for the ones you missed, then try again before your next shoot.' },
          { min: 3, title: 'Getting there', text: 'You know the core terms. The flashcards above cover the rest.' },
          { min: 5, title: 'You speak the language', text: 'Now use one technique on purpose at your next shoot.' },
        ],
      },
    },

    // ---------------------------------------------------------------- Close
    { type: 'h2', id: 'learn-first', text: 'Which five terms should you learn first?', toc: 'Five to learn first' },

    `For a first street interview, start with these five. In our view, the question, the follow-up and the paperwork are where first shoots slip.`,

    {
      type: 'list',
      ordered: true,
      items: [
        '[Warm-up question](#warm-up-question): One easy question before the real one changes the answer you get.',
        '[A/B question](#ab-question): The simplest question to answer while walking, and it starts a debate on its own.',
        '[ECHO technique](#echo): Two or three words back, then silence. It costs nothing, and you can practise it on a friend tonight.',
        '[Two-answer rule](#two-answer-rule): Plan for the second answer, not the first.',
        '[Release form](#release-form): No signed release, no clip. Sort the paperwork before the camera rolls.',
      ],
    },

    `Each of these is easier to spot on screen than on the page. Watch three videos from [our library of real street interviews](/video-library) with the list beside you.`,

    `We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger will respond in the moment. These words help you plan for that. They don't remove it.`,

    `To watch these terms at work on your own product, start with a trial. Its scope, the number of trial videos and any fee are confirmed in writing. [Request a trial video](/contact).`,
  ],

  faqs: [
    {
      q: 'What does vox pop stand for?',
      a: 'Vox pop is short for the Latin _vox populi_, which means "the voice of the people". English speakers, especially in Britain, have used the clipped form since the 1960s. Today a vox pop is a short piece built from members of the public answering one question, usually on the street and without a script.',
    },
    {
      q: "What's the difference between vox pop and man-on-the-street?",
      a: 'There is no real difference in format. Both describe a host stopping passers-by in a public place to answer one question on camera. "Vox pop" comes from the Latin phrase, "man-on-the-street" is an older and gendered name, and "street interview" is the plain, neutral one. Kreators.Army uses vox pop and street interview interchangeably.',
    },
    {
      q: 'What is b-roll?',
      a: 'B-roll is the supporting footage cut over or between the main interview: the product in someone’s hand, the street, a queue, a close-up of packaging. In a vox pop, b-roll hides jump cuts and shows where the conversation happened. Shoot a little at every spot. Never cover a face with it during the line that matters.',
    },
    {
      q: 'What is a lav mic?',
      a: 'A lav mic, or lavalier microphone, is a small microphone clipped to clothing near the chest. It picks up a speaker’s voice clearly even on a noisy street. A handheld mic is the visible alternative: strangers can see who is asking, and it passes easily from person to person. Pick by the shot, not by habit.',
    },
    {
      q: 'What does MoFu mean?',
      a: 'MoFu means middle of the funnel: content for people who already know a brand exists but have not decided whether it is for them. MoFu content answers objections and comparisons. Street interviews suit it because a stranger’s honest second answer sounds like a peer talking, not a brand selling.',
    },
    {
      q: 'What is a release form?',
      a: 'A release form is a signed document in which a person agrees that footage of them can be used, usually naming the brand, the purpose and where it will appear. Get one from everyone you feature in a vox pop, and have a lawyer check the template. This is general information, not legal advice.',
    },
    {
      q: 'Are GRAVEL, PACE and FLIP standard industry terms?',
      a: 'No. GRAVEL, PACE, DROP, FLIP and the other capitalised names are working frameworks used across the Kreators.Army blog, written as acronyms so a host can remember them in the field. Film terms such as b-roll and jump cut, and stage terms such as offer and status, are widely used elsewhere.',
    },
    {
      q: 'Can I link to a single term in this glossary?',
      a: 'Yes. Every entry in this vox pop glossary has its own address, so a link can open the page at one definition. Tap the term in the index, then copy the address from your browser. Our other guides link their first technical term here in the same way.',
    },
  ],

  sources: [
    {
      id: 'mw-vox-populi',
      title: 'Vox populi',
      url: 'https://www.merriam-webster.com/dictionary/vox%20populi',
      publisher: 'Merriam-Webster',
      note: 'Meaning ("popular sentiment or opinion") and first known English use, about 1547. CLAIMS.md E01.',
    },
    {
      id: 'mw-wotd',
      title: 'Word of the Day: vox populi',
      url: 'https://www.merriam-webster.com/word-of-the-day/vox%20populi-2007-01-07',
      publisher: 'Merriam-Webster',
      date: '2007-01-07',
      note: 'English speakers, especially British ones, have shortened it to "vox pop" since the mid-1960s. CLAIMS.md E01.',
    },
    {
      id: 'vox-pop-radio',
      title: 'Vox Pop (radio)',
      url: 'https://en.wikipedia.org/wiki/Vox_Pop_(radio)',
      publisher: 'Wikipedia',
      note: 'The street-interview radio show began on KTRH, Houston, in 1932. CLAIMS.md E02.',
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
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'Objective claims "should be capable of substantiation"; testimonials are not proof of efficacy. CLAIMS.md 5.8.',
    },
    {
      id: 'mirroring',
      title: 'Never Split the Difference (summary)',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Chris Voss and Tahl Raz (2016): mirroring, repeating the last few words to keep someone talking. CLAIMS.md P08 (corrected).',
    },
    {
      id: 'impro-glossary',
      title: 'Improv glossary',
      url: 'https://www.hooplaimpro.com/?p=1866',
      publisher: 'Hoopla Impro',
      note: 'Offers, blocking and status as established improv terms, from Keith Johnstone, Impro (1979). CLAIMS.md R15.',
    },
    {
      id: 'namma-metro',
      title: 'Bengaluru: after 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023',
      note: 'Namma Metro shoots need prior permission and a fee. CLAIMS.md P06.',
    },
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications (Ghibellini and Meier)',
      date: '2025',
      note: '"No memory advantage for unfinished tasks", but a general tendency to resume them. CLAIMS.md R01 (corrected).',
    },
    {
      id: 'yt-stayed-to-watch',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'Stayed to watch: the percentage of times viewers stayed past the initial seconds of a Short. CLAIMS.md P01.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'Trial Reels are shown to non-followers first; the creator then decides whether to share them with followers. CLAIMS.md E23.',
    },
    {
      id: 'mere-exposure',
      title: 'Mere-exposure effect',
      url: 'https://en.wikipedia.org/wiki/Mere-exposure_effect',
      publisher: 'Wikipedia',
      note: 'Zajonc (1968); Bornstein’s 1989 meta-analysis found a reliable but modest effect that can fade with overexposure. CLAIMS.md R07 (corrected).',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI via The Week',
      date: '2025-11-14',
      note: 'DPDP Rules notified November 2025, phased in through about May 2027. CLAIMS.md P07.',
    },
    {
      id: 'endorsement-know-hows',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Use terms such as "advertisement", "sponsored" or "paid promotion" for endorsements with a material connection. CLAIMS.md E26.',
    },
  ],

  related: ['what-is-vox-pop-content', 'street-interview-techniques', 'improv-for-street-interviews', 'how-to-edit-vox-pop-videos'],
};

export default post;
