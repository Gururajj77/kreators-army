import type { Post } from '../types';
import meta from './vox-pop-funnel.meta';

// The vox pop stack (the founder's "Revenue Stack", PDF p44-54). Claims follow .work/v2/blog/CLAIMS.md. Cities are nicknames for question families,
// never claims about people. Scripts and scenes are illustrations, labelled as such.

const post: Post = {
  meta,

  answer:
    'The vox pop stack is a full-funnel plan for street interviews. One five-beat interview (Safety, Territory, Anchoring, Challenge, Conclusion) is run with three question families: belonging questions for shares and reach, career and direction questions for trust, and money and identity questions for the decision. Kreators.Army\'s advice: start where your funnel leaks most.',

  takeaways: [
    'A clip people share can still earn a brand nothing. Reach with no link to the product and no next stage leaks away.',
    'Real voices are not trusted by default. In one 2022 experiment, vox pops were trusted less than an expert quoting a poll, yet moved opinions more.',
    'Run every interview in five beats: Safety, Territory, Anchoring, Challenge, Conclusion. The Conclusion, in the person\'s own words, is the clip.',
    'Belonging questions are built for sends, career and direction questions for saves and follows, and money and identity questions for the decision.',
    'Start with the stage where your funnel leaks most, and judge each family on its own signal, never on views alone.',
    'Ethics holds the stack up: releases, room to change their mind, no rewritten words, and saying so when AI helped.',
  ],

  body: [
    `Your last street clip did well. People sent it to friends, the comments filled with tags, and the follower count moved for once.`,

    `Then you opened Friday's orders, and they looked exactly like last Friday's.`,

    `This guide is about that gap. A vox pop can earn reach, trust or a decision, but one question rarely earns all three. Our founder's notes call the fix the Revenue Stack. We've renamed it the vox pop stack, because revenue is the one thing no video can promise.`,

    `The plan is one five-beat interview, run with three families of questions, each built for a different stage of the funnel. Below you'll find a script card for every beat, a funnel map, a picker for where to start and a planner for one afternoon's shoot.`,

    { type: 'h2', id: 'why-shared-clips-earn-nothing', text: 'Why can a widely shared clip earn a brand nothing?', toc: 'Why shared clips can earn nothing' },

    `Because sharing is only the first stage of a funnel. A clip built for a laugh brings strangers in. If nothing in it touches what the brand sells, and nothing waits for them afterwards, they leave as fast as they came.`,

    `A [vox pop](/blog/what-is-vox-pop-content) is a short street interview: one question, real people, unscripted answers, cut for short-form feeds. Street interviews are good at being passed on.`,

    `Someone says something unexpected, a viewer thinks of a friend, and the clip moves. That's attention a brand usually has to pay for. The trouble starts after the share.`,

    `Follow the chain:`,

    {
      type: 'list',
      ordered: true,
      items: [
        'A question picked for a laugh gets a funny answer.',
        'A funny answer gets shared.',
        'The share brings a newcomer to a profile with nothing else for them.',
        'They leave, and the next shoot chases another laugh.',
      ],
    },

    `Picture a snack brand whose team asks strangers about their worst first date. The answers are great and the clip travels. The comments are all about the person in the blue kurta. Nobody mentions the snack, because the question never went near it.`,

    `Three things usually go missing:`,

    {
      type: 'list',
      items: [
        '**A link to the product\'s world.** The question served the laugh, so the answer has nothing to do with what you sell.',
        '**Someone who comes back.** With no recurring host and no series, viewers remember the stranger and forget the channel.',
        '**A next stage.** Every clip on the profile is another reach clip, so a curious newcomer finds nothing that builds trust or helps a decision.',
      ],
    },

    `The street gave that brand something rare: strangers saying what they think, in their own words. Spending all of it on laughs wastes most of it. The useful material sits in the gap between what a brand believes its customers want and what they say when nobody hands them a script.`,

    `Run the same shoot as a stack and the first-date question can stay. It becomes the top layer. The same host comes back with a question about first jobs, and later with one about money, and each clip points at the next.`,

    `Our working rule: a vox pop doesn't sell a product. It sells a point of view the viewer recognises as their own. Seen that way, an interview stops being a lottery ticket and becomes one planned piece of a funnel.`,

    {
      type: 'comparison',
      title: 'One clip at a time, or a stack',
      left: {
        label: 'One clip at a time',
        items: ['The question is picked for a reaction', 'Any host, any street, no series', 'Every clip is judged on views', 'Nothing waits after the share'],
      },
      right: {
        label: 'A stack',
        items: ['Each question is picked for a funnel stage', 'One host across the series', 'Each family is judged on its own signal', 'Reach, trust and decision clips sit side by side'],
      },
      verdict: 'Same street, same kit. The difference is a plan made before anyone presses record.',
    },

    { type: 'h2', id: 'do-real-voices-persuade', text: 'Do real voices persuade by themselves?' },

    `Not reliably. Real voices can move opinions, but they don't earn trust by default. The trust comes from the conversation, and from a face viewers get to know.`,

    `In [a 2022 experiment with TV news items](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html), some items carried vox pops and others an expert presenting poll figures. Viewers rated the vox pop items as less trustworthy. Yet when the researchers measured what viewers believed afterwards, the vox pops had moved them more[^vox-pop-vs-expert].`,

    {
      type: 'quote',
      text: "Vox pops do influence audiences' personal opinion more strongly.",
      attribution: 'Communications journal, 2022 study of vox pop and expert statements',
      source: 'vox-pop-vs-expert',
    },

    `Media researchers have a name for that pull. [Exemplification research](https://doi.org/10.1177/009365094021001004) finds that one vivid person on screen sways judgments more than a percentage does[^exemplification]. So a real voice can move people. It can't make them trust you on its own.`,

    `Think of the two halves as two funnel jobs. Moving an opinion is something a reach clip can do by itself. Earning trust is slower, and it needs a person viewers come to recognise.`,

    `In our view, two things decide whether the pull turns into trust. The first is the conversation. Someone who feels safe enough to get past their polite first answer tends to hand you one line, in their own words, that carries the point.`,

    `The second is who keeps showing up.`,

    {
      type: 'definition',
      id: 'parasocial-interaction',
      term: 'Para-social interaction',
      text: 'The one-sided bond viewers form with a media figure who talks to them like a friend. Sociologists Horton and Wohl named it in 1956 and called it "intimacy at a distance".',
      source: 'horton-wohl',
    },

    `[Horton and Wohl's 1956 paper](https://doi.org/10.1080/00332747.1956.11023049) described radio and TV hosts who talk to the audience like friends[^horton-wohl]. A recurring host on a vox pop series builds the same kind of familiarity. The bond may matter near the decision too. [A 2020 study of beauty influencers' audiences](https://ideas.repec.org/a/eee/joreco/v53y2020ics0969698918307963.html) found that trust in the creator and the one-sided bond viewers feel were both linked to wanting to buy[^sokolova-kefi].`,

    `Those two needs shape the rest of the stack. The five-beat interview handles the conversation. One host across three question families handles the familiarity.`,

    { type: 'h2', id: 'the-stack-interview', text: 'What is the five-beat S.T.A.C.K. interview?', toc: 'The S.T.A.C.K. interview' },

    `[S.T.A.C.K.](/blog/vox-pop-glossary#s-t-a-c-k) is a five-beat shape for one street conversation: Safety, Territory, Anchoring, Challenge and Conclusion. Each beat earns the next, and the last one hands you the line the clip is built on.`,

    `It isn't the STACK protocol from our [street interview techniques guide](/blog/street-interview-techniques), which works one long interview for several moments. S.T.A.C.K. is one short conversation, from hello to the line you'll use.`,

    {
      type: 'framework',
      id: 'stack-five-beats',
      name: 'S.T.A.C.K.',
      intro: 'One quirk: the fifth beat, the Conclusion, starts with a C. Read the K as "keep their words", the one rule for that beat.',
      parts: [
        { key: 'S', name: 'Safety', text: 'Make it easy to stay by making it easy to leave.' },
        { key: 'T', name: 'Territory', text: 'Ask easy preference questions about the category.' },
        { key: 'A', name: 'Anchoring', text: 'Tie the topic to a real memory, person or moment.' },
        { key: 'C', name: 'Challenge', text: 'Ask the harder version of their answer, gently.' },
        { key: 'K', name: 'Conclusion (keep their words)', text: 'Let them land on their own last line. That line is the clip.' },
      ],
    },

    `A weak conversation gives you a generic clip, and no edit rescues it. The beats upstream matter more than any trick downstream.`,

    `Each beat also does a job in the edit. Most of Safety never airs.`,

    {
      type: 'table',
      caption: 'Each beat on the street and in the edit',
      head: ['Beat', 'On the street', 'In the edit'],
      rows: [
        ['Safety', 'Small talk, the camera admitted, an easy exit', 'Usually cut. A laugh about the camera can open the clip'],
        ['Territory', 'Quick preferences about the category', 'A fast run of different answers that sets up the question'],
        ['Anchoring', 'A memory, a person, a first time', 'The middle: the story that makes the answer theirs'],
        ['Challenge', 'The harder version of their answer', 'The turn, where the viewer leans in'],
        ['Conclusion', 'Their own last line', 'The payoff, and often the hook at the very start'],
      ],
      rowHeaders: true,
    },

    `The scripts below follow one illustrative conversation about spending.`,

    { type: 'h3', id: 'beat-safety', text: 'Safety: make it easy to leave' },

    `Spend the first minute being a person. Mention the heat or the queue at the chai stall, admit the camera is a bit much, and tell them they can walk off any time. People who know they can leave tend to relax enough to stay.`,

    {
      type: 'script',
      id: 'script-safety',
      title: 'Beat 1: Safety',
      context: 'An illustrative script, not a transcript. One host, a camera already rolling wide, a busy footpath near a chai stall.',
      lines: [
        { direction: 'Mic low. The host stands beside the person, not in front.' },
        { speaker: 'Host', text: "Sorry, I know the camera is a lot. We're asking people one quick question for a video." },
        { speaker: 'Participant', text: 'What kind of question?' },
        { speaker: 'Host', text: "Nothing tricky. Skip anything you don't like, and you can walk off any time. Long day?" },
        { speaker: 'Participant', text: 'Very. Heading home.' },
      ],
    },

    `When this doesn't work: someone rushing for a bus. Skip straight to a Territory question they can answer while walking.`,

    { type: 'h3', id: 'beat-territory', text: 'Territory: start with easy preferences' },

    `Ask easy questions about the category. Keep it light, and listen to the words they use. If people say "steel bottle" and your site says "insulated hydration solution", the street has just edited your copy.`,

    `Plenty of brand vox pops stop at this beat, and you can hear it: ten people, ten preferences, nothing anyone remembers.`,

    {
      type: 'script',
      id: 'script-territory',
      title: 'Beat 2: Territory',
      lines: [
        { speaker: 'Host', text: "Easy one. What's one thing you'll always pay a bit extra for?" },
        { speaker: 'Participant', text: 'Shoes. Good shoes.' },
        { speaker: 'Host', text: 'Branded, or whatever fits?' },
        { speaker: 'Participant', text: 'Branded. I know, I know.' },
      ],
    },

    { type: 'h3', id: 'beat-anchoring', text: 'Anchoring: tie it to a memory' },

    `Ask when they started caring about this, and invite a real memory: a person, a place, a first time. Adjectives for a product page are no use here. Look for the moment the category got tangled up with their life.`,

    `Here's an imagined example. Someone says they started caring about cookware the year they moved out and spent a month getting their mother's dal wrong. A pan brand doesn't need to explain itself after that. Ad copy has to persuade, and a story like that only has to be recognised.`,

    {
      type: 'script',
      id: 'script-anchoring',
      title: 'Beat 3: Anchoring',
      lines: [
        { speaker: 'Host', text: 'When did that start? Do you remember the first pair you bought yourself?' },
        { speaker: 'Participant', text: 'First salary. Running shoes. I never ran in them.' },
        { speaker: 'Host', text: 'Never?' },
        { speaker: 'Participant', text: 'I just wanted to walk into office in them.' },
      ],
    },

    { type: 'h3', id: 'beat-challenge', text: 'Challenge: ask the harder version' },

    `Push back gently, or ask the harder version of what they just said. The aim is what they believe, which often differs from what sounds good on camera. Keep the tone curious. A challenge that feels like a trap ends the conversation, and the trust with it.`,

    `Challenge also keeps a clip from going one-note. [A study of 2,000 Belgian TV vox pops](https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721) found that a large majority of the news items showed only one point of view[^opinion-balance]. Someone arguing with their own first answer gives the viewer both sides in one face.`,

    {
      type: 'script',
      id: 'script-challenge',
      title: 'Beat 4: Challenge',
      lines: [
        { speaker: 'Host', text: 'So is it the shoes, or what they say about you?' },
        { direction: 'The host waits. No nodding, no rescue.' },
        { speaker: 'Participant', text: 'Okay. Probably what they say.' },
      ],
    },

    { type: 'h3', id: 'beat-conclusion', text: 'The Conclusion: let them sum it up' },

    `Let them sum up, and don't do it for them. Their conclusion is the clip: the hook of the short cut, the line on the product page, the caption on the ad. Put words in their mouth here and you've thrown away the one thing the street gave you.`,

    {
      type: 'script',
      id: 'script-conclusion',
      title: 'Beat 5: Conclusion',
      lines: [
        { speaker: 'Host', text: 'If you had to put it in one line?' },
        { speaker: 'Participant', text: "I don't pay for shoes. I pay to feel like I've made it." },
        { direction: 'The host thanks them, explains where the video will appear and hands over the release.' },
      ],
    },

    { type: 'h2', id: 'stack-belonging', text: 'Stack 1: belonging questions, built for reach', toc: 'Stack 1: belonging, for reach' },

    `Belonging questions ask about love, friendship, family and the places that feel like home. Each answer tends to remind a viewer of someone they could send it to, so this family is built for reach: the top of the funnel.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'Why the stacks have city names',
      text: "Our founder's notes name each question family after a city: belonging after Delhi, career after Bengaluru, money after Mumbai. Read the city names as labels. Whether a family lands better in one city than another is a hypothesis for your own shoots, never a claim about the people who live there. Every question here works on any street.",
    },

    `They sound like this:`,

    {
      type: 'list',
      items: [
        '"Who made this city feel like home?"',
        '"Who still has a spare key to your place?"',
        '"What does your family do that you\'ll keep doing?"',
        '"Where do you go when you need to feel like yourself?"',
        '"What do you miss most about the place you grew up?"',
      ],
    },

    `Each one comes with an obvious person to send it to. That matters on Instagram, whose head, Adam Mosseri, has said [the three signals that matter most are watch time, likes and sends](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/)[^mosseri-signals].`,

    `In India a clip also travels off the platform. WhatsApp has [more than 500 million users in India](https://techcrunch.com/2024/12/31/india-lifts-whatsapp-payment-curbs/)[^whatsapp-india], and a belonging answer is the kind of clip that lands in a family group with "this is so you" underneath.`,

    { type: 'video', brand: 'CircleStore', title: 'The Third Place', caption: 'A belonging theme from our library. The title names a third place: somewhere that is neither home nor work.' },

    { type: 'video', brand: 'CircleStore', title: 'The People Who Made', caption: 'Another belonging theme from CircleStore. Going by the title, it is about people rather than things.' },

    { type: 'h3', id: 'record-everything-edit-lightly', text: 'Record everything, then edit lightly' },

    `Record the whole conversation. Belonging answers run long and wander, and the best line often arrives after the person has stopped performing. A full recording gives you a long cut, several short cuts and quote posts from one session, as the [one-afternoon plan](#one-afternoon) shows.`,

    `Then edit lightly. The pauses, the half-laughs and the answer nobody expected make a clip feel like a person rather than an ad. Tools that filter, rephrase or rearrange what someone said make the video shorter and the trust thinner.`,

    `A belonging cut usually comes together in four moves:`,

    {
      type: 'list',
      ordered: true,
      items: [
        '**Open on the most specific line.** Put the question on screen as text.',
        '**Let one pause play.** The silence before a belonging answer is part of the answer.',
        '**Keep the brand light:** the product in hand, or a single end card. The clip is about them.',
        '**End on the person\'s face,** before any logo.',
      ],
    },

    {
      type: 'callout',
      tone: 'tip',
      title: 'Our policy on AI in the edit',
      text: 'AI can help with structure and scale: transcripts, captions, finding the strongest moments. When it helps, we say so, and the faces and spoken words stay exactly as filmed.',
    },

    `That's our policy, and no study tests it directly. The nearest research points the same way. In [NielsenIQ's 2024 study](https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/), viewers rated AI-generated ads as more annoying and confusing than traditional ones, and even the better AI ads were less memorable[^nielseniq-ai-ads]. That study is about ads made by AI rather than edits helped by it, but it's one more reason to leave the people untouched.`,

    `This family breaks when the question has nothing to do with your product's world. A belonging clip with no link to what you sell travels without you, so tie it to a moment your product already sits in. Questions about loss get the deepest answers and need the most care, so read the [ethics section](#ethics) before you ask one.`,

    { type: 'h2', id: 'stack-career', text: 'Stack 2: career and direction questions, built for trust', toc: 'Stack 2: career, for trust' },

    `Career and direction questions ask what people are learning, where they're headed and what they wish they'd known sooner. People tend to keep these clips rather than forward them. They save them and follow the host, and that's the middle of the funnel: trust.`,

    {
      type: 'list',
      items: [
        '"What\'s one skill you wish someone had taught you before your first job?"',
        '"If you could redo your first year after college, what would you change?"',
        '"What are you learning right now, just for yourself?"',
        '"Where do you want to be in five years, honestly?"',
        '"What about work keeps you up at 2 am?"',
      ],
    },

    `A career worry rarely goes to the family group. It goes into saved posts.`,

    `So if you judge this family on shares, it'll look like it's failing. Judge it on saves, follows, viewers who come back for the next episode and comments that tell a story of their own.`,

    { type: 'h3', id: 'the-host', text: 'The host is part of the message' },

    `In this family the host stops being a technical role. Viewers come back for someone who respects boundaries, asks thoughtful questions and doesn't chase shock. A host who goes for the gasp gets curiosity once and loses the viewer after. That's our view from the street, and it's why we'd keep one host across a series.`,

    `On our shoots the interviewer is ours, or your founder if you'd like them on camera with our team beside them. Either way, the same face across the stack is what turns separate clips into something viewers follow.`,

    `Give the series a shape people can recognise: the same opening question, the same host, a name for the episodes. By the fourth episode a viewer knows how it will feel, and that predictability is part of the trust.`,

    `When this doesn't work: the host changes every episode, or the questions drift into lecturing. Viewers follow a curious person, not a careers counsellor.`,

    { type: 'h3', id: 'pressure-test', text: 'Run the pressure test first' },

    `Before you shoot this family, test your message. Take the ad line your team is proudest of and read it word for word to a few strangers. Then ask what they think it means.`,

    `Say your line is "Clean energy for long days". If the first stranger guesses you sell solar panels, you've learned something no dashboard would have told you.`,

    `Watch their faces as closely as their words. The gap between what you meant and what they heard is your messaging problem, and the [middle of the funnel](/blog/vox-pop-mofu-content-strategy) is where it costs you most. Fix the line before you build a series on it.`,

    `Then layer the conversation the S.T.A.C.K. way:`,

    {
      type: 'list',
      ordered: true,
      items: [
        '**Territory:** surface career talk. What they do, where they\'re headed.',
        '**Anchoring:** the first job, the first boss, the course they dropped.',
        '**Challenge:** the 2 am worry, asked kindly.',
        '**Conclusion:** what they would tell someone starting out today.',
      ],
    },

    `Trust gets built in the third layer, because it's the one viewers rarely hear anyone say out loud.`,

    { type: 'h2', id: 'stack-money', text: 'Stack 3: money and identity questions, built for the decision', toc: 'Stack 3: money, for the decision' },

    `Money and identity questions ask what people spend on, what they'd never cut and what their money says about them. Viewers measure themselves against the answer, which is why this family sits closest to the decision.`,

    `These questions ask who someone is. "Do you think this product is good?" gets a polite verdict. "What would enough money look like for you?" gets a person.`,

    `When a viewer hears someone their own age describe the life they want, they hold their own life up against it. The money stack is built on that comparison.`,

    { type: 'video', brand: 'CircleStore', title: 'How Much Money', caption: 'A money question from our library. The title puts it plainly: how much money?' },

    { type: 'h3', id: 'precise-questions', text: 'Make the question precise' },

    `A generic money question gets a generic answer, and a generic answer reflects nobody. The precision of the question sets the precision of the identity, and that decides whether a viewer sees themselves or keeps scrolling. Spend most of your prep on the question. The camera angle can wait.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'money-question',
      props: {
        title: 'One money question, sharpened',
        before: { label: 'Generic', text: '"What\'s your financial goal?"', points: ['Invites a stock answer like "save more"', 'Nobody watching sees themselves'] },
        after: { label: 'Precise', text: '"What\'s one thing you\'d never cut, even in a bad month?"', points: ['Forces a choice and a reason', 'The answer says who they are'] },
        note: 'The second question takes no longer to ask. It took longer to write.',
      },
    },

    `Run this family in four moves:`,

    {
      type: 'list',
      ordered: true,
      items: [
        'Pick a money question your audience thinks about but rarely hears asked out loud.',
        'Go where those people already walk: a college gate at 4 pm, a food street after office hours.',
        'Layer it: the surface answer, why it matters, then the memory behind it.',
        'Pull out the key line and build the clip around it: the hook, the caption, the ad.',
      ],
    },

    `Money is private for a lot of people, so handle it with care. Ask about choices and feelings more than figures, let people skip, and never mock an answer, in the field or in the edit.`,

    `This family breaks when you ask about someone's own pay or debts. That puts people on the spot, and an answer someone regrets the next morning is one you can't use. A hypothetical figure, such as how much would be enough, is far easier to give than a real one.`,

    `Where do these clips go? Close to the decision, and the key line travels further than the clip itself:`,

    {
      type: 'list',
      items: [
        '**The product page,** with the clip near the price and the line as its caption.',
        '**The opening of a retargeting ad,** in the person\'s own words.',
        '**The caption of the organic post,** so the line works with the sound off.',
        '**Your reply to "is it worth it?" messages,** with the clip attached.',
      ],
    },

    `If we made the videos, usage rights transfer on full payment, ads included, on the terms of your pilot agreement.`,

    `What to watch: replies and DMs that ask about price or where to buy, and visits from the clip to the product page. Those tell you the clip reached someone who is deciding. The sale itself still depends on the product, the price and the offer.`,

    { type: 'h2', id: 'stacks-together', text: 'How do the three stacks make one vox pop funnel?', toc: 'How the stacks work together' },

    `In sequence. Belonging clips bring new people in, career and direction clips give them a reason to stay, and money and identity clips meet them when they're deciding. The same host runs through all three.`,

    `Each family has its own job, so each needs its own measure. Judge all three on views and two of them will look like failures.`,

    {
      type: 'table',
      caption: 'The vox pop stack, stage by stage',
      head: ['Funnel stage', 'Question family', 'What the clip does', 'Signal to watch'],
      rows: [
        ['Top: reach', 'Belonging: love, friends, family, home', "Gets sent to the people it's about", 'Sends, shares, viewers who stay past the opening'],
        ['Middle: trust', "Career and direction: skills, first jobs, what's next", 'Gets saved, and the host gets followed', 'Saves, follows, return viewers, long comments'],
        ['Bottom: decision', 'Money and identity: spending, value, self-image', 'Shows viewers a version of themselves', 'Price questions, DMs, product-page visits'],
        ['Every stage', 'The host', 'Turns separate clips into a series', 'Comments about the host, repeat viewers'],
      ],
      rowHeaders: true,
    },

    `Read the table from the bottom up when something's wrong. If people ask about price but rarely buy, the money stack is doing its job, and the problem is more likely the offer, the price or the page. If nobody asks at all, look at trust before you shoot more money questions.`,

    `Tap a stage on the map to see its family, a sample question and the signal to watch.`,

    {
      type: 'widget',
      widget: 'flipCards',
      id: 'funnel-map',
      props: {
        title: 'The funnel map',
        cards: [
          {
            front: 'Top of the funnel: reach',
            tag: 'Stack 1',
            back: 'Belonging questions. Try: "Who made this city feel like home?" Watch sends and shares, and how many people stay past the opening line.',
          },
          {
            front: 'Middle of the funnel: trust',
            tag: 'Stack 2',
            back: 'Career and direction questions. Try: "What skill do you wish someone had taught you before your first job?" Watch saves, follows and who comes back.',
          },
          {
            front: 'Bottom of the funnel: decision',
            tag: 'Stack 3',
            back: 'Money and identity questions. Try: "What\'s one thing you\'d never cut, even in a bad month?" Watch replies and DMs about price, and visits to the product page.',
          },
          {
            front: 'Across all three: the host',
            tag: 'Every stage',
            back: 'One recurring face connects the stacks. Watch for comments that mention the host, and viewers who return for the next episode.',
          },
        ],
      },
    },

    `In practice the funnel isn't a straight line. Someone can meet you through a money clip and go back for the belonging ones. The stack doesn't force an order on viewers. It makes sure that wherever they arrive, the next stage is already on your profile.`,

    { type: 'h2', id: 'which-stack-first', text: 'Which stack should you start with?' },

    `Start where your funnel leaks most. If few people know you, start with belonging. If people find you but don't stay, start with career and direction. If they follow but don't buy, start with money and identity.`,

    `You don't need all three at once. We'd rather see a brand run one stack well for a month than all three thinly. Answer three questions and the picker suggests a starting family, with its reasons.`,

    {
      type: 'widget',
      widget: 'picker',
      id: 'stack-picker',
      props: {
        title: 'Which stack should you start with?',
        intro: 'Pick the answer closest to your brand today.',
        questions: [
          {
            q: 'Where does your funnel feel weakest?',
            options: [
              { text: 'Not enough people know we exist', outcomes: ['belonging'] },
              { text: 'People find us, then drift off', outcomes: ['career'] },
              { text: 'People follow us but rarely buy', outcomes: ['money'] },
            ],
          },
          {
            q: 'What does your product sit closest to?',
            options: [
              { text: 'Home, friends, family or gifting', outcomes: ['belonging'] },
              { text: 'Work, routines or getting better at something', outcomes: ['career'] },
              { text: 'Spending choices, treats or self-image', outcomes: ['money'] },
            ],
          },
          {
            q: 'Which signal would you most like to move?',
            options: [
              { text: 'Sends and shares', outcomes: ['belonging'] },
              { text: 'Saves, follows and return viewers', outcomes: ['career'] },
              { text: 'Questions about price and product-page visits', outcomes: ['money'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'belonging',
            title: 'Start with Stack 1: belonging',
            text: 'Your first job is to be seen. Shoot one belonging question in the five beats, then add one career clip so new viewers find a reason to stay.',
            reasons: ['Belonging answers come with a person to send them to', 'Reach with no second stage leaks, so plan the next clip now'],
          },
          {
            id: 'career',
            title: 'Start with Stack 2: career and direction',
            text: 'People already find you. Give them a recurring host and questions worth saving, and run the pressure test on your main ad line before the shoot.',
            reasons: ['Judge it on saves and follows, not shares', 'The same host across episodes is the point'],
          },
          {
            id: 'money',
            title: 'Start with Stack 3: money and identity',
            text: "The trust is there; the decision isn't. Write the most precise money question you can, and put its key line where people decide.",
            reasons: ['Most of the prep goes into the question', "If price questions come but orders don't, look at the offer"],
          },
        ],
      },
    },

    `Whichever family you start with, plan the next one before the first clip goes out. A stack with one layer is a clip with ambitions. Here's one way to build it out, one family at a time, with the same host throughout.`,

    {
      type: 'widget',
      widget: 'timeline',
      id: 'three-months',
      props: {
        title: 'Three months, one stack at a time',
        items: [
          {
            when: 'Month 1',
            title: 'Run your starting stack',
            text: 'One family, one host, two or three afternoons. Post the cuts and read the signal that family is built for.',
            tasks: ['Script the five beats', 'Run the pressure test if you start with trust'],
          },
          {
            when: 'Month 2',
            title: 'Add the next stage',
            text: 'Add the family that comes after your starting one. Keep the host, so returning viewers recognise the series.',
            tasks: ['Point each new clip at the next stage', 'Compare saves and sends side by side'],
          },
          {
            when: 'Month 3',
            title: 'Close the loop',
            text: 'Add the third family, then read the stage table from the bottom up. Where the signals stall is where the next shoot goes.',
            tasks: ['Move the best key lines to the product page', 'Write next month\'s questions from the comments'],
          },
        ],
      },
    },

    { type: 'h2', id: 'one-afternoon', text: 'What can one afternoon of street interviews give you?', toc: 'One afternoon, several outputs' },

    `A long cut, several short cuts, quote posts and outtakes for Stories, if you plan for them. Treat that list as a plan to fill. How many answers you keep depends on the question, the spot and the day.`,

    {
      type: 'steps',
      id: 'steps-one-afternoon',
      title: 'Run one afternoon for one stack',
      intro: 'The plan assumes one question family, one host and about eight to ten full conversations.',
      howTo: true,
      supplies: ['A phone or camera', 'A clip-on mic', 'Printed releases', 'Question cards with the five beats'],
      steps: [
        { name: 'Pick the family and the question', text: 'Choose the family for the stage you need, then write one main question and a line for each beat. Read them aloud, and cut anything that needs a second breath.' },
        { name: 'Choose the spot', text: 'Go where your audience already walks. Malls and metro stations have their own rules, so get permission before you set up there.' },
        { name: 'Run full conversations', text: "Take each person through all five beats and record the whole thing. Some people will stop after Territory, and that's fine." },
        { name: 'Log the key lines that evening', text: 'Watch the footage the same day and note each Conclusion line with its timestamp. Those lines become your hooks, captions and quote posts.' },
        { name: 'Cut the set', text: 'String the strongest answers into one long cut and give each strong answer its own short cut. Turn the best lines into quote posts, and send outtakes to Stories.' },
        { name: 'Post each cut where it fits', text: 'Our guide to [where to post vox pop videos](/blog/where-to-post-vox-pop-videos) covers which cut suits which platform.' },
      ],
    },

    `Keep the log simple. One row per person is enough, and it's what lets you find a line again in three months, when the next shoot needs it.`,

    {
      type: 'table',
      caption: 'A shoot log, with one illustrative row',
      head: ['Person', 'Family and beats reached', 'Key line and timestamp', 'Release'],
      rows: [['Person 4', 'Money and identity; all five beats', '"I pay to feel like I\'ve made it." 06:42', 'Signed on the spot']],
    },

    `The planner turns your own estimates into a shot list. It applies the plan's simple rules and nothing more.`,

    {
      type: 'widget',
      widget: 'calculator',
      id: 'output-planner',
      props: {
        title: "Plan one afternoon's outputs",
        intro: 'Put in your own numbers. The planner gives each usable answer its own short cut (or more, if you choose), one long cut once you have four usable answers, and one quote post for every two.',
        inputs: [
          { key: 'people', label: 'People you plan to interview', default: 8, min: 1, max: 30, step: 1, unit: 'people' },
          { key: 'keepRate', label: 'Share of answers you expect to use', default: 50, min: 10, max: 100, step: 5, unit: '%' },
          { key: 'cutsPer', label: 'Short cuts per usable answer', default: 1, min: 1, max: 3, step: 1 },
        ],
        outputs: [
          { key: 'keepers', label: 'Usable answers', formula: 'round(people * keepRate / 100)', format: 'number', unit: 'answers' },
          { key: 'shorts', label: 'Short cuts to plan', formula: 'keepers * cutsPer', format: 'number', unit: 'cuts' },
          { key: 'longCut', label: 'Long cuts', formula: 'min(1, floor(keepers / 4))', format: 'number' },
          { key: 'quotes', label: 'Quote posts', formula: 'ceil(keepers / 2)', format: 'number', unit: 'posts' },
        ],
        disclaimer: 'A plan built from your own estimates, not a forecast. The defaults are placeholders, not benchmarks. Real numbers change with the question, the spot and the day.',
      },
    },

    `Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. If you'd rather hand the afternoon over, we plan the questions, approach people, run the interviews and edit the batch. Packages start at 5 videos for ₹50,000 (GST extra where applicable). [Our vox pop pricing](/pricing) has the rest.`,

    { type: 'cta', text: 'Want to see the format on your own product before you plan a stack? Scope, the number of trial videos and any fee are confirmed in writing.' },

    { type: 'h2', id: 'product-brands', text: 'How do you adapt the stack to a product brand?', toc: 'Adapting it to a product brand' },

    `Keep the three families and change the doorway. Each question still asks about the person's life, but it opens onto a moment your product already sits in: a meal, a commute, a wardrobe, a home.`,

    `The stack was first written with creators in mind, whose products are often courses about earning or careers. A D2C brand sells something people hold. So career widens into direction: getting better at something, a first job, the routine that holds a working week together. Money and belonging carry over almost as they are.`,

    {
      type: 'table',
      caption: 'Three made-up brands, one question per family',
      head: ['Product', 'Belonging', 'Career and direction', 'Money and identity'],
      rows: [
        ['A snack brand', '"Which snack is always at your family\'s place?"', '"What did you eat at your desk in your first job?"', '"Which snack will you pay extra for, and why?"'],
        ['An apparel brand', '"What do you wear to feel like yourself?"', '"What did you wear to your first interview?"', '"What did you overpay for and never regret?"'],
        ['A home-fragrance brand', '"What does home smell like to you?"', '"What do you light when you need to focus?"', '"Candle or dinner out: which is the treat?"'],
      ],
      rowHeaders: true,
    },

    `Each family also pairs with some of the eleven mechanisms we mix across a batch. Belonging suits personal experiences and audience participation. Career and direction suit debates and different follow-up structures. Money and identity suit guessing and reveals, A/B comparisons and rankings, the shapes that CircleStore titles like Guess The Price and Branded Vs Unbranded suggest.`,

    `Bring the product in after Anchoring. Once the person has told you a story, handing them the product or asking them to choose between two gives the clip its turn. Bring it in during Safety and you're back to collecting compliments.`,

    `Our own library already mixes families. Judging by the titles, CircleStore's videos include money questions such as How Much Money and Money Habit. The same library has belonging themes such as The Third Place and Feeling Homely, and Waxys' Fragrance Of A House reads like a belonging question too. One brand's library can cover more than one stage.`,

    `One rule holds across all of them: questions stay on habits and feelings. A stranger saying a product works is a reaction, and we never present it as proof.`,

    { type: 'h2', id: 'where-stacks-go-wrong', text: 'Where does a vox pop stack usually go wrong?', toc: 'Where stacks go wrong' },

    `Usually in the plan. These are the five mistakes we'd check for first.`,

    {
      type: 'list',
      items: [
        '**Judging every family on views.** Career and money clips look like failures, and the team stops making the ones that build trust and help decisions.',
        '**Changing the host every shoot.** The familiarity resets each time, so the series never forms.',
        '**Skipping Anchoring to save time.** Without the memory, the Conclusion is an opinion instead of a story, and it sounds like an ad.',
        '**Opening with money questions to people who have never met you.** In our view, a decision clip does more for viewers who already know the host.',
        '**Bringing the product in during Safety.** People switch to compliments, and the rest of the conversation stays polite.',
      ],
    },

    `None of the five is about the camera, the mic or the city. All of them can be fixed at a desk, before anyone leaves the office.`,

    { type: 'h2', id: 'ethics', text: 'How do you run a vox pop stack ethically?', toc: 'Ethics: the stack runs on trust' },

    `Ask permission, say where the video will appear, let people change their mind, and never edit anyone into meaning something they didn't. Every stage of the stack depends on trust, and one exploitative clip can spend all of it.`,

    `The stack raises the stakes. Belonging and money questions reach into private lives, and the clips are built to travel. Getting it wrong costs the participant first, and your brand soon after.`,

    {
      type: 'widget',
      widget: 'checklist',
      id: 'before-it-goes-out',
      props: {
        title: 'Before a stack clip goes out',
        items: [
          { id: 'release', text: 'Everyone featured has signed a release', detail: 'And knows where the video will appear: your channels, your ads or both.' },
          { id: 'second-thoughts', text: 'People had a chance to change their mind', detail: "Offer an opt-out after the shoot, once they've had time to think." },
          { id: 'minors', text: "Nobody under 18 appears without a parent's written consent" },
          { id: 'meaning', text: 'No answer was cut to mean something else', detail: 'Trims for length are fine. Rearranging words into a new opinion is not.' },
          { id: 'sensitive', text: 'Sensitive stories were handled with care', detail: 'If someone gets emotional, lower the camera, and ask before using any of it.' },
          { id: 'state', text: 'Nobody was filmed drunk, distressed or pushed past a no' },
          { id: 'ai-tools', text: 'Raw footage went to an AI tool only if the release covers it' },
          { id: 'disclosure', text: 'Anyone who works for you, was cast or was paid is disclosed' },
        ],
        done: 'Ready to publish. Keep the releases with the project files.',
      },
    },

    `Get a signed release from everyone you feature and tell them where the video will appear. India's data protection rules [are coming into force in phases through 2027](https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html)[^dpdp-rules], so check your release forms with a lawyer. This is general information, not legal advice.`,

    `Most edits are honest. A few quietly change what someone meant, and those are the ones that break the stack.`,

    {
      type: 'comparison',
      title: 'Edits that are fine, and edits that cross the line',
      left: {
        label: 'Fine',
        items: ['Trimming a pause or a repeat for length', 'Captions that match what was said', 'Choosing the strongest answers from many', 'Music under a light moment'],
      },
      right: {
        label: 'Crosses the line',
        items: ['Cutting a "but" so a doubt becomes praise', 'Captions that put words in their mouth', 'Splicing two people into one opinion', 'A slow zoom on someone in tears'],
      },
      verdict: 'The test: would the person recognise their own answer if they watched the clip?',
    },

    `If anyone in your vox pop is paid, works for you or was cast, [India's endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect you to say so clearly[^endorsement]. A staged answer passed off as a stranger's would mislead viewers and undo the thing the stack is built on.`,

    `Our guide to [filming street interviews in India](/blog/street-interview-consent-india) goes through consent and releases in detail.`,

    { type: 'h2', id: 'first-stack', text: 'Your first stack, this week' },

    `Write one question for the family your funnel needs most, then script the five beats around it.`,

    `Try it on three people at work before it goes near a street. If the Conclusion beat gets you a line you'd happily put on your product page, the question is ready.`,

    `We control the question, the setup, who we approach, the follow-ups and the edit. We can't control exactly how a stranger will respond in the moment. That's why we don't guarantee views or sales, and [our FAQ on views and sales](/faq/do-you-guarantee-views) says so plainly.`,

    `If you'd like to see the format on your own brand first, [request a trial video](/contact). Scope, the number of trial videos and any fee are confirmed in writing.`,
  ],

  faqs: [
    {
      q: 'What is a full-funnel video strategy?',
      a: 'A full-funnel video strategy plans different videos for each stage a buyer passes through: getting noticed, building trust and making a decision. In a vox pop funnel, each stage gets its own family of street interview questions. Belonging questions aim at reach, career and direction questions at trust, and money and identity questions at the decision, all run through the same five-beat interview.',
    },
    {
      q: 'Which street interview questions get shared most?',
      a: 'Belonging questions are the family built for sharing: questions about friends, family, love and the places that feel like home. Each answer comes with an obvious person to send it to. Instagram\'s head Adam Mosseri has named sends as one of the three signals that matter most, alongside watch time and likes. No question can promise shares, so treat belonging as the reach family and test it.',
    },
    {
      q: 'Which street interview questions build trust?',
      a: "Career and direction questions are the trust family: what people are learning, where they're headed, what they wish they'd known before their first job. Viewers tend to save these answers rather than forward them, and to follow the host who asked. Measure this family on saves, follows and return viewers rather than shares, and keep the same host across the series.",
    },
    {
      q: 'Can vox pops help sales?',
      a: 'Vox pops can support a buying decision, but no video can promise sales. Money and identity questions are built for the decision stage: a viewer sees someone like them describe what they spend on and why. Put those clips where people decide, such as the product page. Whether anyone buys still depends on the product, the price, the offer and distribution.',
    },
    {
      q: 'What is the five-beat S.T.A.C.K. interview?',
      a: 'S.T.A.C.K. is a five-beat structure for one street conversation: Safety, Territory, Anchoring, Challenge and Conclusion. The host makes it easy to leave and asks easy preference questions. Then they tie the topic to a memory, gently ask the harder version, and let the person sum up in their own words. That last line is the clip. The STACK protocol is different: it works one long interview.',
    },
    {
      q: 'Should the same host appear in every video?',
      a: 'Yes, where you can. A recurring host gives viewers someone to come back to, the familiarity Horton and Wohl called "intimacy at a distance" in 1956. Across a vox pop stack, the same face connects belonging, trust and decision clips into one series. The host can be a trained interviewer or the brand\'s founder, as long as the introduction makes clear who they speak for.',
    },
    {
      q: 'Is it okay to use AI tools to edit vox pops?',
      a: "Yes, for structure and scale: transcripts, captions and finding the strongest moments. No, for changing what anyone said or how they look. Our policy is to tell viewers when AI helped and to keep faces and spoken words exactly as filmed. Before uploading raw footage to any third-party AI tool, check that the participant's release covers it.",
    },
    {
      q: 'How do you measure each stage of a vox pop funnel?',
      a: 'Measure each stage on the signal its question family is built for. For belonging clips at the top, watch sends, shares and how many viewers stay past the opening. For career and direction clips in the middle, watch saves, follows and return viewers. For money and identity clips at the bottom, watch price questions, DMs and product-page visits. Views alone only show that a clip was seen.',
    },
    {
      q: 'Which funnel stage should a new brand start with?',
      a: 'A new brand should start where its funnel leaks most. If almost nobody knows the brand yet, start with belonging questions for reach, then add one career and direction clip so new viewers find a reason to stay. If people already follow but rarely buy, start with money and identity questions. One stack run well for a month teaches more than three run thinly.',
    },
  ],

  sources: [
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter Brill',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert with poll data, yet shifted personal opinion more (CLAIMS R11, E04).',
    },
    {
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications (Brosius and Bathelt)',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research 21(1)',
      date: '1994',
      note: 'Individual cases sway judgments more than base-rate statistics (CLAIMS E06).',
    },
    {
      id: 'horton-wohl',
      title: 'Mass Communication and Para-Social Interaction: Observations on Intimacy at a Distance',
      url: 'https://doi.org/10.1080/00332747.1956.11023049',
      publisher: 'Psychiatry 19(3)',
      date: '1956',
      note: 'Coined para-social interaction; hosts address the audience as intimate friends (CLAIMS R10).',
    },
    {
      id: 'sokolova-kefi',
      title: 'Instagram and YouTube bloggers promote it, why should I buy? How credibility and parasocial interaction influence purchase intentions',
      url: 'https://ideas.repec.org/a/eee/joreco/v53y2020ics0969698918307963.html',
      publisher: 'Journal of Retailing and Consumer Services 53',
      date: '2020',
      note: 'Both credibility and parasocial interaction positively related to purchase intention (CLAIMS R09, corrected form).',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion Balance in Vox Pop Television News',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies',
      date: '2018',
      note: 'Of 2,000 Flemish TV vox pops, a large majority of news items present one point of view (CLAIMS E08).',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram shares algorithm insights for 2025',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01',
      note: 'Mosseri: watch time, likes and sends are the top three ranking signals (CLAIMS P02, E22).',
    },
    {
      id: 'whatsapp-india',
      title: 'India lifts WhatsApp payment curbs',
      url: 'https://techcrunch.com/2024/12/31/india-lifts-whatsapp-payment-curbs/',
      publisher: 'TechCrunch',
      date: '2024-12-31',
      note: 'WhatsApp has more than 500 million users in India (CLAIMS S10, E16).',
    },
    {
      id: 'nielseniq-ai-ads',
      title: 'NIQ research uncovers hidden consumer attitudes toward AI-generated ads',
      url: 'https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/',
      publisher: 'NielsenIQ',
      date: '2024-12',
      note: 'AI-generated ads rated more annoying and confusing, with weaker memory activation (CLAIMS S28, E12).',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI via The Week',
      date: '2025-11-14',
      note: 'DPDP Rules notified November 2025; consent and notice duties phased in (CLAIMS P07, E27).',
    },
    {
      id: 'endorsement',
      title: 'Endorsement Know-hows! for celebrities, influencers and virtual influencers on social media platforms',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Material connections must be disclosed with terms such as "advertisement", "sponsored" or "paid promotion" (CLAIMS E26).',
    },
  ],

  related: ['vox-pop-mofu-content-strategy', 'street-interview-techniques', 'vox-pop-strategy-for-indian-brands', 'where-to-post-vox-pop-videos'],
};

export default post;
