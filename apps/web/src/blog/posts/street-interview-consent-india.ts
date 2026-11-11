import type { Post } from '../types';
import meta from './street-interview-consent-india.meta';

const post: Post = {
  meta,

  answer: `India has no single rule written for street interviews, so treat consent as the rule. Before a vox pop rolls, say who you are and where the video will appear, then record a clear yes. Use a signed release for commercial use, honour withdrawals, and keep minors and unwilling bystanders out. This is Kreators.Army's practical guidance, not legal advice.`,

  takeaways: [
    `Name yourself, the brand and every place the video may appear before you roll. Consent means little if people don't know what they're agreeing to.`,
    `Record a clear yes on camera, then use a short signed release for anything commercial. Have a lawyer review the release before you rely on it.`,
    `The DPDP Rules were notified in November 2025, and the consent and notice duties apply from around May 2027. A video of an identifiable person is personal data.`,
    `Make leaving as easy as agreeing: hand over a contact, and act on removal requests fast, starting with paid ads.`,
    `No one under 18 without a parent's written consent. Malls need management's permission, and metros need the operator's.`,
    `If anyone on camera was paid, cast or works for the brand, say so clearly on screen.`,
  ],

  body: [
    `Picture a footpath in Indiranagar at 6 pm. A host asks a stranger one question, the answer is funny and honest, and the camera catches all of it. Then the person asks, "Wait, where is this going?"`,

    `What happens next decides whether you have a clip or a problem. If the host already named the brand, said where the video will run and made it easy to say no, the reply takes one sentence. If not, the best answer of the day may be one you can't use.`,

    `This guide is the routine we'd want any crew in India to follow: what to say before you roll, what a release covers, where you can film and what the DPDP Act may change. It isn't legal advice.`,

    { type: 'h2', id: 'short-answer', text: 'The short answer', toc: 'The short answer' },

    `Ask before you film, record the yes and put commercial use in writing. India gives you no checklist written for street interviews, so the crew has to bring its own.`,

    `A [vox pop](/blog/what-is-vox-pop-content) is a short street interview. A host takes one question to the street, and real people answer on camera without a script. That last part is the whole appeal. It's also why consent matters so much: the people in a vox pop aren't actors, and nobody signed them up in advance.`,

    `Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. We wrote this for anyone planning a street shoot in India, and for anyone choosing a crew to run one.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'This is not legal advice',
      text: `This is general information, not legal advice. It's checked against the primary sources listed at the end, but laws and city rules change, and your facts matter.`,
    },

    { type: 'h2', id: 'is-it-legal', text: 'Is it legal to film people in public in India?', toc: 'Filming in public' },

    `We know of no Indian law written specifically for street interviews. The risk sits less in pointing a camera at a street than in how you film, whom you film and what you do with the footage. Commercial use carries the most.`,

    `The rules on filming in public and on commercial use are complex and still changing. Get a lawyer's view on your release and on image rights before a clip earns money.`,

    `Then treat the law as the minimum. A stranger who feels tricked won't care that you were technically allowed.`,

    `Split the risk into layers. Most of the fixes come down to two habits: ask first, and write it down.`,

    {
      type: 'table',
      caption: 'Where the risk sits in a street interview, and what to do about each layer',
      head: ['Layer', 'What it covers', 'What to do'],
      rows: [
        ['How you film', 'Covert filming, zooming in on bodies, following people', 'Ask first. Film openly, at talking distance.'],
        ['Personal data', 'The faces and voices of identifiable people', 'Give notice, get consent, keep records, honour withdrawal.'],
        ['Commercial use', 'Ads, boosted posts, product pages, retail screens', 'A signed release naming each use, reviewed by a lawyer.'],
        ['The location', 'Malls, metros, campuses, government-controlled sites', 'Permission from whoever controls the space.'],
        ['Disclosure', 'Paid, cast or staff participants', 'Label the connection clearly.'],
        ['Minors', 'Anyone under 18', "A parent's written consent, or don't film."],
      ],
      rowHeaders: true,
    },

    `The location row depends on who owns the ground you're standing on, so it gets [its own section](#where-can-you-film).`,

    { type: 'h3', id: 'organic-vs-ads', text: 'Organic posts and ads are different uses' },

    `A clip on your Instagram grid and the same clip running as a paid ad are two different uses. So is a still from it on your product page. Someone who happily agreed to "a video for Instagram" may feel very differently about seeing their face in an ad for months.`,

    `An ad also travels further. It reaches people the participant knows but never chose to tell: a manager, an aunt, the neighbours.`,

    `Our rule: name every use, out loud and on paper. If the clip might become an ad, say "ads" before you roll.`,

    { type: 'h2', id: 'dpdp-act', text: 'What could the DPDP Act mean for vox pop footage?', toc: 'The DPDP Act' },

    `Probably more care and more paperwork, not a ban. India's data protection law treats data about an identifiable person as personal data, and its consent and notice duties are being phased in through 2027.`,

    {
      type: 'definition',
      id: 'dpdp-act-definition',
      term: 'DPDP Act',
      text: `The Digital Personal Data Protection Act, 2023 is India's law on how organisations handle digital personal data. It defines personal data as "any data about an individual who is identifiable by or in relation to such data".`,
      source: 'dpdp-act',
    },

    `A face, a voice or a name said on camera can each identify someone. So a video of an identifiable person is personal data, and a day of street footage is a folder full of it.`,

    `The Act received the President's assent on 11 August 2023[^dpdp-act]. The government notified the DPDP Rules on 14 November 2025, with [an eighteen-month period for phased compliance](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)[^dpdp-rules-pib]. On that timeline, the consent and notice duties apply from around May 2027[^dpdp-rules].`,

    `Some duties may not bind a shoot you run today, but footage you film this year may still run as an ad in 2027. Under section 5(2), people who consented before the Act commenced must then be sent a notice "as soon as it is reasonably practicable"[^dpdp-act]. A release with a phone number or email makes that possible. A nod on a footpath doesn't.`,

    `In the table below, the right-hand column is our reading, not a legal opinion.`,

    {
      type: 'table',
      caption: 'What the DPDP Act and Rules say, and what that may mean on a street shoot',
      head: ['Provision', 'What it says', 'What it may mean on a shoot'],
      rows: [
        ['Act, section 2(t)', 'Personal data is data about an identifiable individual[^dpdp-act].', 'A clear face or voice in your footage counts.'],
        ['Act, section 5(1)', 'A notice describes the personal data and the purpose.', 'Say what you filmed and where it will go.'],
        ['Act, section 6(1)', 'Consent must be specific, informed, unconditional and unambiguous, among other tests.', 'A spoken yes or a signature, tied to named uses.'],
        ['Act, section 6(3)', 'Plain language, English or an Eighth Schedule language, and a contact.', 'Releases in local languages, with a named contact.'],
        ['Act, section 6(4)', 'People can withdraw consent as easily as they gave it.', 'A contact on the slip, and a plan for removals.'],
        ['Act, section 6(10)', 'The organisation must be able to prove notice and consent.', 'Keep the consent clip and the signed release together.'],
        ['Rules, November 2025', 'A separate, clear consent notice explaining the specific purpose[^dpdp-rules-pib].', 'A short participant notice, not your website policy.'],
      ],
      rowHeaders: true,
    },

    `Two points on that table belong with a lawyer, not a blog. The first is who counts as the "data fiduciary" on a brand shoot: the brand, the crew or both. That decides who gives the notice and who answers a removal request. The Act also holds the data fiduciary responsible for processing a contractor does on its behalf[^dpdp-act].`,

    `The second is the Act's exceptions. Section 3 says the Act doesn't apply to personal data a person makes publicly available themselves[^dpdp-act]. You may hear that a stranger who speaks on a public street has done exactly that.`,

    `Don't build your process on that argument. A routine that asks first works whatever a court later decides.`,

    {
      type: 'callout',
      tone: 'tip',
      title: "A website policy isn't a participant notice",
      text: `[Our privacy policy](/legal/privacy), for example, covers what brands send us through this site's form. A participant needs something shorter and more specific: what you filmed, why, where it will appear and how to ask for removal.`,
    },

    `Shoots run only for insight need the same care. Our guide to [vox pop market research](/blog/vox-pop-market-research) covers them.`,

    { type: 'h3', id: 'outtakes', text: 'What happens to the outtakes?' },

    `A shoot day films far more people than the edit uses. The Act expects personal data to be kept secure, and erased once its purpose is no longer served, unless another law needs it kept[^dpdp-act].`,

    `Our reading for a vox pop: once the project closes, delete the takes of people who didn't make the cut. Keep the consent clip and the release for as long as the video runs, because they're your proof. Store the footage like customer data, on a drive with restricted access, not in someone's phone gallery.`,

    { type: 'h2', id: 'consent-on-camera', text: 'How do you get consent on camera?', toc: 'Consent on camera' },

    `Ask before you roll, then record the yes. Name yourself and the brand, say where the video will appear and what you'll ask, get a clear yes on camera, and tell the person they can stop at any time.`,

    `The talking takes under a minute. The paper adds a couple more when the clip is commercial.`,

    {
      type: 'steps',
      id: 'consent-routine',
      title: 'The on-camera consent routine',
      intro: `Seven steps. The first three happen before the camera rolls, the yes is recorded at step 4, and step 7 comes after the last answer.`,
      howTo: true,
      totalTime: 'PT3M',
      supplies: ['Printed one-line consent slips', 'Full release forms for commercial use', 'Pens', 'Contact cards with a number or email for removal requests'],
      steps: [
        {
          name: 'Introduce yourself and the brand',
          text: `Say your name and the brand's name before the camera rolls. A hidden brand makes people guarded, and consent means little if they don't know who is asking.`,
        },
        {
          name: 'Say where the video will appear',
          text: `Name the channels: Instagram, YouTube, the brand's website, ads. If you aren't sure yet, list everything it could become.`,
        },
        {
          name: "Say what you'll ask",
          text: `Give one line on the kind of question, such as "a quick one about your morning routine". Nobody should agree to a question they haven't heard of.`,
        },
        {
          name: 'Ask for a clear yes, and roll on it',
          text: `Ask "Is it okay if we film this and use it?" and record the answer at the start of the clip. A nod off camera isn't a record.`,
        },
        {
          name: 'Tell them they can stop',
          text: `Say it plainly: "You can stop at any point, and you can change your mind later." Then mean it.`,
        },
        {
          name: 'Hand over the paper',
          text: `Give the full release to anyone in a commercial shoot, and a one-line slip to anyone else who wants something to sign. Read the key lines aloud if the person prefers.`,
        },
        {
          name: 'Check again at the end',
          text: `After the last answer, ask once more: "Still happy for us to use that?" Then hand over a card with a number or email for removal requests.`,
        },
      ],
    },

    `The same steps, as lines a host can say:`,

    {
      type: 'script',
      id: 'consent-lines',
      title: 'On-camera consent lines',
      context: `Before the real question. The camera rolls from the "Is it okay" line, so the yes is on the record.`,
      lines: [
        { direction: "Before the camera rolls. The host holds the mic low, not in the person's face." },
        { speaker: 'Host', text: "Hi, I'm (name). We're filming short street interviews for (brand name)." },
        { speaker: 'Host', text: 'The videos go on their Instagram and YouTube, and maybe in their ads.' },
        { speaker: 'Host', text: "It's one question about (topic), about two minutes. Quick check first: are you 18 or over?" },
        { speaker: 'Participant', text: 'Yes.' },
        { direction: 'The camera rolls from here.' },
        { speaker: 'Host', text: 'Is it okay if we film this and use it in those videos?' },
        { speaker: 'Participant', text: "Sure, that's fine." },
        { speaker: 'Host', text: 'Thanks. You can stop at any point, and if you change your mind later, the number is on this card.' },
        { direction: 'If the clip may run as an ad, hand over the full release now and read the uses aloud.' },
        { direction: 'After the last answer.' },
        { speaker: 'Host', text: 'Thank you, that was great. Still happy for us to use that?' },
      ],
    },

    `One slip is common: rolling on a warm-up before the consent lines. If you open with a silly warm-up, as our [improv rules for street interviews](/blog/improv-for-street-interviews) suggest, ask for consent first. A warm-up can produce the best line of the day, and you'll want to use it.`,

    { type: 'h3', id: 'when-people-hesitate', text: 'When someone hesitates or says no' },

    `Let them go. We'd treat a hesitant yes as a no, because if someone needs talking into it, the clip will feel that way too.`,

    `People on their way somewhere are the hardest case. Don't shorten the consent lines to fit their walk. Thank them, step back and wait for someone with two minutes.`,

    { type: 'h2', id: 'release-form', text: 'What should a street interview release cover?', toc: 'What a release covers' },

    `A short release should say who is filming, what was filmed, how and where it will be used, for how long, how to withdraw and who signed. Keep it to one page, and have a lawyer review any template before you use it.`,

    {
      type: 'definition',
      id: 'release-form-definition',
      term: 'Release form',
      text: `A release form is a short signed document in which a person agrees to be filmed and to the stated uses of the footage. On a street shoot it sits beside the on-camera yes rather than replacing it.`,
    },

    `Our [vox pop glossary](/blog/vox-pop-glossary#release-form) has the rest of the paperwork vocabulary. On the street, consent gets recorded in one of three ways, and each proves something different.`,

    {
      type: 'table',
      caption: 'Three ways to record consent on a street shoot',
      head: ['Record', 'What it shows', 'Where it falls short'],
      rows: [
        ['On-camera yes', 'The person agreed, in their own voice', 'Which uses they agreed to is hard to prove'],
        ['One-line slip', 'A name, a signature and a date', 'Too thin for ads or long-term use'],
        ['Full release', 'Named uses, period, territory and withdrawal', 'Takes two or three minutes on a busy footpath'],
      ],
      rowHeaders: true,
    },

    `For anything commercial we'd use the yes and the release together. The on-camera yes proves the moment. The release proves what the moment covered.`,

    { type: 'h3', id: 'what-goes-in-a-release', text: 'What goes in it' },

    {
      type: 'list',
      items: [
        `**Who:** the crew and the brand, by name, with a contact for questions and removal.`,
        `**What:** the date, the place and a line on what was filmed, such as "a street interview about morning routines".`,
        `**Uses:** each one named: organic social posts, paid ads, the brand's website, retail screens.`,
        `**Period and territory:** how long the footage may be used, and where in the world.`,
        `**Edits:** that answers may be trimmed, captioned and translated, but not changed in meaning.`,
        `**Withdrawal:** how to ask for removal, and what happens to posts and ads already running.`,
        `**Signature:** name, signature and date, with a line confirming the person is 18 or over.`,
      ],
    },

    {
      type: 'callout',
      tone: 'warning',
      title: 'Have a lawyer review it',
      text: `The outline below is a planning aid, not a legal document. Release wording decides what you can do with footage for years. Ask a lawyer in India to review your template before you use it, and again whenever you add a new use such as ads.`,
    },

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'release-outline',
      props: {
        title: 'Release outline builder',
        intro: `Type your brand, where the video will appear, how long you want to use it and how people can reach you. The outline fills in as you type. Take it to a lawyer before you take it to the street.`,
        fields: [
          { id: 'brand', label: 'Brand name', placeholder: 'e.g. your brand', example: 'Your Brand' },
          { id: 'uses', label: 'Where the video will appear', placeholder: 'e.g. Instagram, YouTube and paid ads', example: 'Instagram, YouTube Shorts and paid social ads' },
          { id: 'period', label: 'How long it may be used', placeholder: 'e.g. two years from the shoot', example: 'two years from the date of filming' },
          { id: 'contact', label: 'Contact for questions and removal', placeholder: 'e.g. an email address or phone number', example: 'the email address on the contact card' },
        ],
        templates: [
          { text: 'I agree to be filmed for a street interview video made for {brand}. Questions go to {contact}.', group: 'Who' },
          { text: 'Filmed for {brand} on (date) at (place). Topic of the interview: (fill in).', group: 'What was filmed' },
          { text: '{brand} may use my image, voice and words from this interview on {uses}.', group: 'Uses' },
          { text: 'Any use by {brand} not listed here needs my permission again.', group: 'Uses' },
          { text: 'This permission lasts for {period}, in (territory), unless I withdraw it sooner.', group: 'Period and territory' },
          { text: '{brand} may trim, caption and translate my answers, but not change their meaning.', group: 'Edits' },
          { text: 'I can ask {brand} to stop using the footage at any time by writing to {contact}.', group: 'Withdrawal' },
          { text: 'After a request to {contact}, no new posts or ads use the footage. Existing posts: (fill in).', group: 'Withdrawal' },
          { text: 'Name, signature and date (fill in). I confirm I am 18 or over and agree to the uses above for {brand}.', group: 'Signature' },
        ],
        note: `Have a lawyer review this outline before you use it. It isn't a release form, and it doesn't cover every situation.`,
      },
    },

    { type: 'h3', id: 'two-layers', text: 'Two layers of permission' },

    `A release covers the person on camera. It doesn't settle what the brand may do with the finished video. That's a second layer, between the brand and whoever made it.`,

    `On our side, usage rights for the videos we make transfer to the brand on full payment, and our [terms](/legal/terms) set out the rest. Whoever makes your videos, check that the two layers match. A brand that buys the right to run a video as an ad needs releases that allow ads.`,

    { type: 'h2', id: 'bystanders', text: 'What about bystanders in the background?', toc: 'Bystanders' },

    `Frame them out, blur them or ask them too. A passer-by who is clearly identifiable in your shot hasn't agreed to anything, so treat their face the way you'd treat a participant's.`,

    `Background people are the consent problem nobody plans for. The participant said yes. Their friend, half a step behind and pulling faces, didn't. Neither did the person who stopped to watch and is now in every take.`,

    {
      type: 'comparison',
      title: 'Fix it on the street, or fix it in the edit',
      left: {
        label: 'On the street',
        items: [
          'Pick a plain background: a shopfront, a wall, a hedge',
          'Frame a medium shot rather than a wide one',
          'Shoot along the footpath, so passers-by cross quickly',
          'Run the consent lines for any friend in the shot',
          'Move when a few people stop to watch',
        ],
      },
      right: {
        label: 'In the edit',
        items: ["Blur any identifiable face that didn't agree", 'Crop in to the participant', 'Cut the take', 'Reshoot if the answer really matters'],
      },
      verdict: `The street fix is faster and looks better. Blurring a busy background frame by frame is slow, and it shows.`,
    },

    `If the blur ruins the clip, the clip goes: we'd rather lose a good answer than put a stranger in an ad.`,

    `Some backgrounds need extra care whatever the framing: a hospital gate, a temple queue, a school gate at home time, a police station, an accident, a protest. A face there tells a story the person never chose to tell. Move on.`,

    { type: 'h2', id: 'minors', text: 'Can you film minors in a street interview?', toc: 'Minors' },

    `Our rule: no one under 18 on camera without a parent's written consent. We'd rather not film minors at all, because a teenager can't easily weigh what a clip might mean to them in five years.`,

    `On a street, age is the hardest thing to judge. Outside a college or a coaching centre, a 17-year-old and a 21-year-old look much the same. So ask everyone the same quick question, "Are you 18 or over?" It feels routine because nobody is singled out.`,

    `A parent nearby isn't the same as a parent's written consent. If a family stops and the child wants to answer, thank them and film the parent alone, or nobody. If a shoot really needs young people, plan it as its own production, with parents present and signed releases.`,

    `Watch the background too. A child running behind your participant is a bystander under 18, so crop, blur or cut.`,

    { type: 'h3', id: 'vulnerable-people', text: "People who can't really agree in the moment" },

    `The same care applies to anyone who can't give a real yes. One case is easy: don't film drunk strangers. Add anyone visibly distressed, anyone who doesn't follow the language you're speaking and anyone who seems unsure what's happening. A yes from someone who didn't understand the question isn't consent.`,

    { type: 'h2', id: 'sensitive-questions', text: 'How do you ask sensitive questions without hurting anyone?', toc: 'Sensitive questions' },

    `Ask personal questions as invitations, not traps. Warn people before a sensitive one, let them pass, never post an answer to mock them, and check consent again after anything personal.`,

    `The questions behind strong vox pop videos often touch money, family, work and self-image. Those answers are raw because the pressure behind them is real. Our rule when a sensitive story surfaces: respond with empathy, not a zoom-in.`,

    `Here's an imagined example. A host asks a passer-by how many side projects they run. They list three, laugh, then admit only one pays the rent.`,

    `You can post that as a punchline, or as an honest picture of how many people work now. Only one of those is fair to the person who said it out loud.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'sensitive-question',
      props: {
        title: 'One sensitive question, asked two ways',
        before: {
          label: 'As a trap',
          text: '"How much debt are you in?"',
          points: ['Puts a number on the spot', 'No way out on camera', 'Invites a clip that mocks them'],
        },
        after: {
          label: 'As an invitation',
          text: '"Has money ever stopped you from starting something? You can skip this one."',
          points: ['About a choice, not a number', 'A clear way to pass', 'Room for a story they choose to tell'],
        },
        note: `Both can get an honest answer. Only the second leaves the person in charge of how much they share.`,
      },
    },

    { type: 'h3', id: 'other-people-in-answers', text: 'Answers that name other people' },

    `Answers bring other people into your video. Ask someone what stopped them from starting something, and the honest reply may be "my mother thinks I'm wasting my degree". The participant agreed to be filmed. Their mother didn't. Keep the line if the participant is comfortable with it, but cut names, workplaces and anything that points to a specific third person.`,

    `Waiting quietly after an answer often draws out a more honest second one. It isn't a licence to corner anyone. If someone looks away and says "next question", that's the answer.`,

    `After anything personal, check before you move on: "That was personal. Still okay with us using it?" If they hesitate, it stays out of the edit. Write that rule down for the editor too. The editor wasn't there.`,

    `Personal doesn't have to mean invasive. A "how long have you…" question asks for a stretch of time, and the person decides how much story comes with it.`,

    {
      type: 'video',
      brand: 'CircleStore',
      title: '74 Circlestore - How Long Have You 07-10',
      caption: `CircleStore's street question: "How long have you…?"`,
    },

    { type: 'h2', id: 'gifts-and-disclosure', text: 'Do you have to disclose gifts or payments?', toc: 'Gifts and disclosure' },

    `If anyone on camera was paid, cast or works for the brand, yes: say so clearly. A small thank-you for everyone who stops is a greyer area, and no gift should ever buy an answer.`,

    `[On our own shoots](/faq/do-participants-get-anything), a simple incentive sometimes helps people stop and spend enough time with us. It's agreed in pre-production, and it never decides what anyone says.`,

    `Disclosure rules start from one idea. If viewers would judge an answer differently once they knew about a connection, they should know. India's [endorsement guidelines from the Department of Consumer Affairs](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect a material connection to be disclosed clearly, using terms such as "advertisement", "sponsored" or "paid promotion"[^endorsement-know-hows].`,

    `ASCI's influencer guidelines spell out what counts. A material connection can include money, products given at no cost, discounts, gifts, and "any family or employment relationship"[^asci-influencer].`,

    {
      type: 'callout',
      tone: 'note',
      title: 'Our view on thank-you gifts',
      text: `ASCI's guidelines are written for influencers, not passers-by. Whether a small gift to a stranger needs a label is a question for your lawyer. When in doubt, disclose.`,
    },

    {
      type: 'table',
      caption: 'Who is on camera, and whether to disclose it',
      head: ['Who is on camera', 'Disclose?', 'How'],
      rows: [
        ['A stranger who got nothing', 'No connection to disclose', 'Nothing extra needed'],
        ['A stranger with a small thank-you gift', 'Ask your lawyer. We lean towards yes.', 'A short caption or on-screen line'],
        ['A paid participant or actor', 'Yes, clearly', 'A label such as "Advertisement" or "Sponsored"'],
        ['Staff, a founder or their family', 'Yes, clearly', '"Employee", or a plain line naming the link'],
        ['A creator posting on their own account', 'Yes, clearly', "The platform's paid tag plus a label"],
      ],
      rowHeaders: true,
    },

    `For a paid video on a creator's account, ASCI also sets timings when the label sits on the video itself. On a video of 15 seconds or less, the label stays for at least 3 seconds. Up to 2 minutes, it stays for a third of the length[^asci-influencer].`,

    `One staging rule sits above any label. A cast vox pop presented as spontaneous is misleading. If the people are actors, say so, and don't cut the video to pass them off as strangers.`,

    `Give the thank-you the same way to everyone, ideally before the question. Never offer more for a better reaction: that turns the video into an ad pretending not to be one.`,

    { type: 'h2', id: 'where-can-you-film', text: 'Where can you film a street interview in India?', toc: 'Where you can film' },

    `Semi-public spaces with the owner's nod are the easiest. Private property needs permission, and malls are private, so ask management. Metro premises need prior permission and a fee. Public streets depend on local rules.`,

    `Think of a café courtyard, the edge of a market or the forecourt of a shop that has said yes. There's less friction than on a crowded footpath, and usually someone to ask. Scout the spot the day before and keep two backups ready.`,

    `Metro premises aren't open for casual filming. In November 2023, Bengaluru's metro operator BMRCL [ended a four-year pause on shoots in its trains and premises](https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises), under a permission-and-fee policy[^bmrcl-shoots]. The News Minute reported an hourly licence fee, a security deposit, applications 30 days ahead for Indian nationals and BMRCL's sign-off on the final film. Check the current policy first.`,

    `Who to ask depends on who controls the ground:`,

    {
      type: 'list',
      items: [
        `**Malls, campuses, office parks, gated communities:** management, in writing. Security will ask, so keep the yes on your phone.`,
        `**Cafés and shop forecourts:** the owner or manager, with an agreed spot to stand.`,
        `**Metro premises:** the operator, well ahead of the shoot.`,
        `**Government-controlled locations in Mumbai:** a single-window cell run by the Maharashtra Film, Stage and Cultural Development Corporation[^mumbai-single-window].`,
        `**Public streets:** we won't tell you what the police in your city need, because rules differ by place and change. Ask locally before any commercial shoot, especially with lights, a tripod or a bigger crew.`,
      ],
    },

    {
      type: 'widget',
      widget: 'decisionTree',
      id: 'can-i-film-here',
      props: {
        title: 'Can I film here?',
        intro: `Pick the place you have in mind. Every path ends in a next step, not a legal answer.`,
        start: 'place',
        nodes: [
          {
            id: 'place',
            q: 'Where do you want to film?',
            options: [
              { text: 'A public street or footpath', next: 'street-rules' },
              { text: 'A semi-public space: café courtyard, shop forecourt, market edge', next: 'owner-asked' },
              { text: 'Private property: a mall, campus or office park', next: 'management-yes' },
              { text: 'A metro station or train', next: 'metro-yes' },
              { text: 'A public park', next: 'park-rules' },
            ],
          },
          {
            id: 'street-rules',
            q: 'Have you checked the local rules for filming on this street?',
            help: 'Rules differ by city and by place. Commercial shoots, lights and tripods are the cases to check most carefully.',
            options: [
              { text: 'Yes, and we are clear to film', next: 'bystanders-ok' },
              { text: 'Not yet', next: 'end-check-local' },
            ],
          },
          {
            id: 'owner-asked',
            q: 'Has the owner or manager agreed?',
            options: [
              { text: 'Yes, in writing', next: 'bystanders-ok' },
              { text: 'Only verbally', next: 'end-get-written' },
              { text: 'Not yet', next: 'end-ask-owner' },
            ],
          },
          {
            id: 'management-yes',
            q: 'Do you have written permission from management?',
            options: [
              { text: 'Yes', next: 'bystanders-ok' },
              { text: 'No', next: 'end-ask-management' },
            ],
          },
          {
            id: 'metro-yes',
            q: "Do you have the metro operator's written permission for this shoot?",
            options: [
              { text: 'Yes', next: 'bystanders-ok' },
              { text: 'No', next: 'end-metro-stop' },
            ],
          },
          {
            id: 'park-rules',
            q: 'Do you know who manages the park, and whether it allows commercial filming?',
            options: [
              { text: 'Yes, and it does', next: 'bystanders-ok' },
              { text: 'Not sure', next: 'end-check-local' },
            ],
          },
          {
            id: 'bystanders-ok',
            q: "Can you keep bystanders who haven't agreed out of focus?",
            options: [
              { text: 'Yes', next: 'end-go' },
              { text: 'No, the spot is too crowded', next: 'end-move' },
            ],
          },
        ],
        ends: [
          {
            id: 'end-go',
            title: 'Go ahead, with the consent routine',
            text: `Run the consent lines, record the yes, use a release for commercial use and keep bystanders out of focus.`,
            tone: 'go',
          },
          {
            id: 'end-move',
            title: 'Move, or change the framing',
            text: `Find a quieter spot or a plainer background. Crowded frames make consent hard to keep.`,
            tone: 'caution',
          },
          {
            id: 'end-check-local',
            title: 'Check local rules first',
            text: `Rules differ by city and by place. Ask locally, or ask a lawyer, before a commercial shoot.`,
            tone: 'caution',
          },
          {
            id: 'end-get-written',
            title: 'Get it in writing',
            text: `A message from the manager confirming the date, time and spot beats a verbal yes.`,
            tone: 'caution',
          },
          {
            id: 'end-ask-owner',
            title: 'Ask the owner first',
            text: `Explain the shoot and where you'll stand. Film only after a yes.`,
            tone: 'stop',
          },
          {
            id: 'end-ask-management',
            title: 'Not yet: ask management',
            text: `Malls, campuses and office parks are private property. Ask management and wait for a written yes.`,
            tone: 'stop',
          },
          {
            id: 'end-metro-stop',
            title: "Don't film there yet",
            text: `Metro premises need prior permission, and applications can take weeks. Pick another spot for now.`,
            tone: 'stop',
          },
        ],
        note: `A planning aid, not legal advice. Rules differ by city and change over time. When unsure, check with the place's owner, the local authority or a lawyer.`,
      },
    },

    { type: 'h2', id: 'why-now', text: 'Why does consent matter more now?', toc: 'Why it matters now' },

    `Because people have seen what careless filming does. Strangers filmed without consent and posted online have made the news in Bengaluru, and India's data rules are tightening. A crew has to earn trust in the first ten seconds.`,

    `In July 2025, [Bengaluru police arrested a man](https://www.thenewsminute.com/karnataka/man-arrested-in-bengaluru-for-filming-women-without-consent-posting-45-videos-online) who, they said, had filmed women mainly on Church Street without their consent and posted the clips on Instagram[^tnm-church-street]. The News Minute reported that police registered the case themselves after a woman whose clip was posted tagged them online. The FIR cited the stalking section of the Bharatiya Nyaya Sanhita and the IT Act's provision on obscene material.`,

    {
      type: 'quote',
      text: `Just because my account is public doesn't mean I consent to be filmed publicly. That is not how consent works.`,
      attribution: 'A woman whose clip was posted, quoted by The News Minute',
      source: 'tnm-church-street',
    },

    `That case, as reported, was nothing like a brand interview: covert, aimed at women, and nobody was asked anything. But a stranger on the footpath can't tell your crew from that account at a glance.`,

    {
      type: 'comparison',
      title: 'What a stranger sees in the first ten seconds',
      left: { label: 'A host who explains first', items: ['A name and a brand', 'A clear question', 'An easy way to say no'] },
      right: { label: 'A host who films first', items: ['A phone pointed their way', 'No idea where the clip will go', 'Something they may have read about'] },
      verdict: `Lead with the explanation. The first ten seconds decide which host you look like.`,
    },

    `There's a business reason too. We think a vox pop borrows its pull from ordinary people saying what they really think. If viewers suspect someone was tricked, paid to perform or filmed against their will, that pull goes.`,

    { type: 'h2', id: 'ai-edits', text: 'Can you use AI to edit street interview footage?', toc: 'AI edits' },

    `Yes, for craft: captions, translation, cleaner audio. Never to change what someone said or meant. A participant agreed to their own words, in their own order, answering your actual question.`,

    {
      type: 'comparison',
      title: 'Where AI helps, and where it crosses the line',
      left: {
        label: 'Fine, with a person checking',
        items: [
          'Auto-captions, corrected by someone who heard the answer',
          'Subtitles for answers that mix Hindi or Kannada with English',
          'Cleaning wind and traffic noise',
          'Finding the best takes in hours of footage',
        ],
      },
      right: {
        label: 'Never',
        items: [
          "Putting new words in someone's mouth",
          'Cloning a voice or swapping a face',
          'Cutting an answer onto a different question',
          "Generating participants who don't exist",
          'Uploading raw footage to outside tools without consent',
        ],
      },
      verdict: `If an edit would surprise the person who said it, don't make it.`,
    },

    `Language is where honest edits go wrong most easily. Plenty of answers on a Bengaluru or Mumbai footpath switch languages mid-sentence, and that switch is often the most natural moment in the clip. Our rule is to subtitle both languages rather than ask for an English retake. Machine translation can flatten a joke or flip a meaning, so someone who speaks both should check every line.`,

    {
      type: 'callout',
      tone: 'warning',
      title: 'Raw footage is personal data',
      text: `Don't upload a participant's face, voice or details to a third-party AI tool unless your notice and release cover it.`,
    },

    `Keep product claims out of participants' mouths too. India's advertising code asks that claims about objective facts be "capable of substantiation"[^asci-code]. A stranger saying a product worked for them isn't proof that it works, so never edit an answer to sound like proof.`,

    `Our policy: when AI helped with captions or translation, we say so. That's a choice, not a research finding. The people on screen are real, and viewers should know what touched their words.`,

    { type: 'h2', id: 'removal-requests', text: 'What if someone wants out after the video is live?', toc: 'Removal requests' },

    `Act on it quickly and start with paid use. Acknowledge the request, pause any ads using the clip, then edit or remove the organic posts and confirm in writing. Agree in advance who does each step.`,

    `Where consent is the basis for using someone's footage, the DPDP Act lets them withdraw it at any time, as easily as they gave it. The organisation must then stop processing their data within a reasonable time, unless a law requires or allows otherwise. Withdrawal doesn't make the earlier use unlawful[^dpdp-act].`,

    {
      type: 'list',
      ordered: true,
      items: [
        `**Acknowledge it the same day.** A one-line reply can keep a private request from becoming a public comment.`,
        `**Pause paid use first.** An ad keeps showing the face to new people every hour it runs.`,
        `**Fix the organic posts.** Re-edit the person out if the video still works, or take it down.`,
        `**Ask reposting accounts to remove it.** You can't control them, but you can ask, and show the person you did.`,
        `**Confirm in writing and log it.** Note the date, the request and what you did, next to the release.`,
      ],
    },

    `Once the Rules' duties apply, the government's summary gives organisations ninety days at most to deal with requests such as erasure[^dpdp-rules-pib]. We'd aim for days.`,

    `Our view, plainly: if someone regrets being in a video, take them out, whatever the paperwork allows. One clip is never worth a stranger's peace of mind.`,

    { type: 'h2', id: 'questions-for-a-crew', text: 'What should you ask a crew about consent?', toc: 'Questions for a crew' },

    `Ask for specifics: what the host says, how consent is recorded, what the release covers and who handles removals. A good crew answers each in a sentence.`,

    `These are fair questions for any studio, us included, so take them to the first call:`,

    {
      type: 'list',
      ordered: true,
      items: [
        `How do you introduce the brand before you roll, and what exactly do you say?`,
        `Do you record consent on camera, on paper, or both?`,
        `What does your release cover, and has a lawyer reviewed it?`,
        `Do the releases cover every use we're paying for, including ads?`,
        `What happens when someone asks to be removed after the video is live?`,
        `What's your rule on people under 18, and on bystanders in the frame?`,
        `Who keeps the consent clips, releases and outtakes, and for how long?`,
      ],
    },

    `Listen for specifics. "We always get consent" is a slogan. "The host names the brand and the channels, we roll on the yes, and the release lists organic and paid use" is a process. Our guide to [how a vox pop shoot works](/blog/how-a-vox-pop-shoot-works) shows where these steps sit in a full shoot day.`,

    `Or run the checklist yourself on your next shoot. It saves your ticks in this browser.`,

    {
      type: 'widget',
      widget: 'checklist',
      id: 'consent-checklist',
      props: {
        title: 'Consent checklist: before, during and after',
        intro: 'Fourteen checks across one shoot, from the kit bag to the publish button.',
        items: [
          { id: 'location', text: 'Before rolling: location cleared with the owner, manager or operator', detail: 'In writing for private property and metros.' },
          { id: 'languages', text: 'Before rolling: releases packed, in the languages people speak locally' },
          { id: 'intro', text: 'Before rolling: host names themselves, the brand and every channel the video may appear on' },
          { id: 'age', text: "Before rolling: age check done, and no one under 18 without a parent's written consent" },
          { id: 'yes', text: 'On camera: a clear yes recorded at the start of the clip' },
          { id: 'bystanders', text: 'On camera: bystanders framed out, or asked as well' },
          { id: 'recheck', text: 'After the interview: consent checked again after anything personal' },
          { id: 'signed', text: 'After the interview: release signed for commercial use, and a contact card handed over' },
          { id: 'files', text: 'After the interview: consent clip and release saved together in the project folder' },
          { id: 'blur', text: "Before publishing: faces that didn't agree blurred or cropped" },
          { id: 'meaning', text: 'Before publishing: no edit changes what anyone meant' },
          { id: 'labels', text: 'Before publishing: paid, cast or staff participants labelled' },
          { id: 'uses', text: 'Before publishing: every planned use is named in the release', detail: 'Ads especially.' },
          { id: 'owner', text: 'Before publishing: one named person handles removal requests' },
        ],
        done: 'Every box ticked. Keep this list with the footage.',
      },
    },

    { type: 'h2', id: 'six-scenarios', text: 'Six scenarios to test your routine', toc: 'Six scenarios' },

    `Pick the best next step for each situation.`,

    {
      type: 'widget',
      widget: 'quiz',
      id: 'consent-scenarios',
      props: {
        title: 'What would you do?',
        intro: `One point per best answer. Practice, not legal advice.`,
        questions: [
          {
            q: "Your participant's friend is clearly visible behind them and never spoke to you. What do you do?",
            options: [
              { text: 'Use it. They chose to stand there.', points: 0, why: `Standing nearby isn't agreeing to be in a video.` },
              { text: 'Run the consent lines for the friend too, or frame them out.', points: 1 },
              { text: 'Add a caption saying bystanders appear.', points: 0, why: `A caption doesn't get anyone's consent.` },
            ],
            explain: `Treat an identifiable bystander like a participant: ask, reframe or blur.`,
          },
          {
            q: "A student in a college crowd wants to answer and tells you they're 17. What do you do?",
            options: [
              { text: "Film them. They're nearly 18.", points: 0 },
              { text: 'Film them if their friends agree.', points: 0, why: `Friends can't consent for a minor.` },
              { text: "Thank them and don't film, unless a parent gives written consent.", points: 1 },
            ],
            explain: `Our rule: no one under 18 without a parent's written consent, and we'd rather not film minors at all.`,
          },
          {
            q: "Two days after the shoot, someone emails asking to be removed from a video that's already live. What comes first?",
            options: [
              {
                text: 'Reply that they signed a release.',
                points: 0,
                why: `Pointing at paperwork doesn't end the problem. Where consent is the basis, the DPDP Act gives people a right to withdraw it.`,
              },
              { text: 'Acknowledge it quickly, pause any ads and start the removal.', points: 1 },
              { text: 'Wait to see whether they ask again.', points: 0 },
            ],
            explain: `Acknowledge fast, stop paid use first, then fix the organic posts and confirm in writing.`,
          },
          {
            q: 'A participant agreed to "a video for Instagram". The brand now wants to run it as a paid ad. What do you do?',
            options: [
              { text: 'Run it. Instagram ads are still Instagram.', points: 0, why: `An ad is a different use from an organic post.` },
              { text: "Check the release. If ads aren't named, ask the person again.", points: 1 },
              { text: 'Run it, but only for a week.', points: 0 },
            ],
          },
          {
            q: "The street is quiet, so the host's cousin answers the question on camera. How do you post it?",
            options: [
              { text: 'As a normal street answer.', points: 0, why: `Viewers will assume a stranger, which is misleading.` },
              { text: 'Cut it, or post it with the connection clearly disclosed.', points: 1 },
              { text: "Post it, but don't tag the cousin.", points: 0 },
            ],
            explain: `ASCI's influencer guidelines count family and employment links as material connections. Disclose it, or don't use it.`,
          },
          {
            q: "You set up just outside a mall's doors, and security walks over. What should you already have?",
            options: [
              { text: "Nothing. You're outside.", points: 0, why: `The forecourt may still be the mall's property.` },
              { text: 'Written permission from mall management.', points: 1 },
              { text: 'A stack of signed releases.', points: 0, why: `Releases cover the people, not the place.` },
            ],
          },
        ],
        results: [
          {
            min: 0,
            title: 'Start with the routine',
            text: `Go back to the consent lines and the release outline. Most answers come from two habits: ask first, and name every use in writing.`,
          },
          { min: 3, title: 'Nearly there', text: `Check the scenarios you missed against the sections above.` },
          { min: 6, title: 'Ready for the footpath', text: `Every best answer. Pack the checklist, and keep the paperwork with the footage.` },
        ],
      },
    },

    { type: 'h2', id: 'before-your-next-shoot', text: 'One thing to do before your next shoot', toc: 'Before your next shoot' },

    `Write your consent lines down and say them aloud to a colleague. Time them. If they run past twenty seconds, cut words until they don't. Then print a stack of one-line slips and put them in the kit bag.`,

    `We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger will respond in the moment. Consent makes sure that whatever they say, they chose to say it on camera.`,

    `If you'd rather hand the footpath to a crew, Kreators.Army plans, shoots and edits street interviews for D2C brands. See the format on your own brand first: scope, the number of trial videos and any fee are confirmed in writing. [Request a trial video](/contact).`,
  ],

  faqs: [
    {
      q: 'Is it legal to film strangers in public in India?',
      a: `It depends on how you film and what you do with the footage. India has no single rule written for street interviews. Covert filming has led to police cases, and commercial use raises the most questions. Film openly, ask first, use a signed release for commercial use and have a lawyer review your process. This isn't legal advice.`,
    },
    {
      q: 'Do I need a release form for a street interview?',
      a: `For anything commercial, we'd always use one. A short signed release should name the brand, what was filmed, each use including ads, how long the footage may be used and how to withdraw. Pair it with a clear yes recorded on camera, and have a lawyer in India review the template before you rely on it.`,
    },
    {
      q: 'Is verbal consent on camera enough?',
      a: `Verbal consent on camera is a good record, but for commercial use we wouldn't rely on it alone. A recorded yes proves the person agreed. It's harder to prove what they agreed to: which channels, whether ads were included and for how long. Add a short signed release that names every use, and keep both together.`,
    },
    {
      q: 'Does the DPDP Act apply to street interview videos?',
      a: `It may well. The DPDP Act treats data about an identifiable person as personal data, and a clear face or voice on video can identify someone. The DPDP Rules were notified on 14 November 2025 with an eighteen-month phase-in, so the consent and notice duties apply from around May 2027. Ask a lawyer how the Act applies to your shoot.`,
    },
    {
      q: 'Can I film inside a mall or a metro station?',
      a: `Only with permission. Malls are private property, so ask management and get the yes in writing. Metro premises need prior permission and a fee: Bengaluru's BMRCL, for example, reopened its trains and stations to shoots in 2023 under a permission-and-fee policy. Check the operator's current rules before you plan a shoot there.`,
    },
    {
      q: 'What if someone asks to be removed after the video is posted?',
      a: `Act on it quickly. Acknowledge the request the same day, pause any paid ads using the clip, then edit or remove the organic posts and confirm in writing. Where consent is the basis for using someone's footage, the DPDP Act gives them a right to withdraw it. Agree with your crew before the shoot who handles removal requests.`,
    },
    {
      q: 'Can I interview children on the street?',
      a: `Our rule is no one under 18 on camera without a parent's written consent, and we'd rather not film minors at all. Age is hard to judge on a street, so ask everyone "Are you 18 or over?" before you roll. If a shoot really needs young people, plan it separately, with parents present and signed releases.`,
    },
    {
      q: 'Do I need to disclose that participants got a gift?',
      a: `If anyone on camera was paid, cast or works for the brand, yes, clearly. India's endorsement guidelines expect material connections to be disclosed with terms such as "advertisement" or "sponsored". Whether a small thank-you gift to a passer-by needs a label is a grey area, so ask your lawyer. When in doubt, disclose, and never let a gift depend on the answer.`,
    },
    {
      q: 'Is this guide legal advice?',
      a: `No. This guide is general information from people who plan street interviews, checked against the primary sources it links. Laws, rules and city policies change, and your situation matters. For commercial shoots, have a lawyer in India review your release form, your consent routine and how you store footage.`,
    },
  ],

  sources: [
    {
      id: 'dpdp-act',
      title: 'The Digital Personal Data Protection Act, 2023 (No. 22 of 2023), Gazette of India',
      url: 'https://www.trai.gov.in/sites/default/files/2024-09/DPDT_11082024.pdf',
      publisher: 'Ministry of Law and Justice, Government of India (Gazette copy hosted by TRAI)',
      date: '2023-08-11',
      note: 'Primary text, read in full by the editor on 11 Nov 2026. Assent 11 Aug 2023. Sections 2(t) personal data, 3(c)(ii) publicly available exception, 5(1) notice, 5(2) notice for consent given before commencement, 6(1) consent qualities, 6(3) language and contact, 6(4) withdrawal, 6(5) earlier processing stays lawful, 6(6) cease processing, 6(10) burden of proof, 8(1) fiduciary responsible for processor, 8(5) security safeguards, 8(7) erasure when purpose ends.',
    },
    {
      id: 'dpdp-rules-pib',
      title: 'DPDP Rules, 2025 Notified: A Citizen-Centric Framework for Privacy Protection and Responsible Data Use',
      url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf',
      publisher: 'Press Information Bureau, Government of India',
      date: '2025-11-17',
      note: 'Read by the editor. Rules notified 14 Nov 2025; "eighteen-month period for phased compliance"; separate, clear consent notice explaining the specific purpose; consent can be withdrawn at any time; requests on access, correction, updating or erasure answered within ninety days at most.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI, via The Week',
      date: '2025-11-14',
      note: 'Consent and notice duties apply about 18 months after notification, around May 2027. CLAIMS.md P07, E27.',
    },
    {
      id: 'endorsement-know-hows',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose material connections with terms such as advertisement, sponsored or paid promotion. CLAIMS.md E26.',
    },
    {
      id: 'asci-influencer',
      title: 'Guidelines for Influencer Advertising in Digital Media',
      url: 'https://www.ascionline.in/social/wp-content/uploads/2025/04/ASCI-Influencer-Guidelines.pdf',
      publisher: 'Advertising Standards Council of India',
      date: '2025-04',
      note: 'Read by the editor. Material connection includes monetary or other compensation, products at no cost, discounts, gifts and "any family or employment relationship". Superimposed labels: at least 3 seconds for videos of 15 seconds or less; one third of the length for videos under 2 minutes. CLAIMS.md E26.',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'Objective claims should be capable of substantiation; testimonials do not substantiate efficacy. CLAIMS.md 5.8.',
    },
    {
      id: 'bmrcl-shoots',
      title: 'Bengaluru: After 4 years, BMRCL allows film shooting in metro trains and premises',
      url: 'https://www.thenewsminute.com/karnataka/bengaluru-after-4-years-bmrcl-allows-film-shooting-in-metro-trains-and-premises',
      publisher: 'The News Minute',
      date: '2023-11-25',
      note: 'Read by the editor. Ban from 2019 lifted; hourly licence fee and a security deposit; Indian nationals apply 30 days ahead (the detailed script is stated for foreign applicants); BMRCL must approve the final film before release. CLAIMS.md P06, E28.',
    },
    {
      id: 'mumbai-single-window',
      title: 'Single window clearance for film shooting in Mumbai',
      url: 'https://iprmentlaw.com/update/single-window-clearance-for-film-shooting-in-mumbai',
      publisher: 'IPRMENTLAW',
      note: 'Mumbai shoot permissions for government-controlled locations go through a single-window cell run by the MFSCDC. CLAIMS.md P07.',
    },
    {
      id: 'tnm-church-street',
      title: 'Man arrested in Bengaluru for filming women without consent, posting 45 videos online',
      url: 'https://www.thenewsminute.com/karnataka/man-arrested-in-bengaluru-for-filming-women-without-consent-posting-45-videos-online',
      publisher: 'The News Minute',
      date: '2025-07-10',
      note: 'Read by the editor. Police said the accused operated mainly on Church Street; suo motu FIR after a woman tagged Bengaluru City Police on Instagram; FIR under BNS 78(2) and IT Act 67; her quoted words. Not in CLAIMS.md.',
    },
  ],

  related: ['how-a-vox-pop-shoot-works', 'improv-for-street-interviews', 'vox-pop-market-research', 'street-interview-techniques'],
};

export default post;
