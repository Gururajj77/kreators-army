import type { Post } from '../types';
import meta from './psychology-of-vox-pop.meta';

const post: Post = {
  meta,

  answer: `Vox pops work because viewers see themselves in a stranger's unscripted answer. Seven well-studied effects explain what keeps them watching: open loops, the pratfall effect, loss aversion, in-group signals, the IKEA effect, cognitive dissonance and mere exposure. Some hold up less well than their fame suggests. Kreators.Army's advice: use them to arrange real moments, never to fake them.`,

  takeaways: [
    `Every effect here is a tendency, not a switch. None of them makes a video perform, and none of them controls how a stranger answers.`,
    `Treat open loops as editing craft. Open on the moment before the reaction and keep the question on screen. The famous Zeigarnik memory effect hasn't held up.`,
    `A stumble helps only someone already shown to be capable. Keep real hesitations that follow proof, and never stage one.`,
    `Give the viewer a small job they can finish, like a guess or a pick. In the IKEA studies, unfinished effort created no attachment.`,
    `Familiarity raises liking modestly and can fade with overkill. Vary the format, repeat one recognisable element, and ignore any fixed "rule of seven".`,
    `Use psychology to choose and order what happened, never to stage it. Get consent, disclose anyone paid or cast, and make no claim a street answer can't carry.`,
  ],

  body: [
    `Start with an imagined clip. A host on a Jayanagar footpath holds out a small glass jar and asks one thing: smell it and guess what's inside. The stranger leans in, frowns and goes quiet for a second. You're already guessing with them.`,

    `Nobody scripted that frown. Almost everything around it was planned, though: the question, the jar, where the camera stood and the frame the editor chose to open on.`,

    `This guide is about why moments like that hold people. Seven effects from psychology do most of the work. For each one we tell the original study straight, say what later research found and name the shoot or edit move it suggests.`,

    `Some are weaker than their fame. The Zeigarnik café story is often told in the wrong city, and its memory finding hasn't held up. No study gives a magic number of exposures. We flag each weak spot, because a plan built on a myth breaks the first time you lean on it.`,

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: `A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea. More in [what vox pop content is](/blog/what-is-vox-pop-content).`,
    },

    `Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. What follows is the thinking behind the format, for founders and marketers who want the why before the how.`,

    // ---------------------------------------------------------------- The three forces
    { type: 'h2', id: 'three-forces', text: 'What are the three forces behind a vox pop?', toc: 'The three forces' },

    `Three forces carry a vox pop, as we see it: social validation, identity signalling and the curiosity-comparison loop. In the viewer's words: someone like me is on screen, that answer sounds like me, and where do I stand?`,

    `All three happen in the viewer, not in front of the mic. A vox pop lands when someone scrolling sees a stranger answer and thinks, for a second, that's exactly how I feel.`,

    `There's research behind the hunch. In [a 2022 experiment with TV news items](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html), viewers rated vox pops as less trustworthy than an expert quoting a poll. Yet the vox pops moved their personal opinions more[^vox-pop-vs-expert]. Media researchers call the wider pattern exemplification: one vivid person on screen sways judgments more than a percentage does[^exemplification].`,

    `We'd map the seven effects onto the three forces like this. Most effects feed more than one.`,

    {
      type: 'table',
      caption: 'The three forces, and the effects that feed each one',
      head: ['Force', 'What the viewer thinks', 'Effects that feed it'],
      rows: [
        ['Social validation', '"Someone like me is on screen."', 'In-group signals, mere exposure'],
        ['Identity signalling', '"That answer is exactly how I feel."', 'In-group signals, the pratfall effect, dissonance'],
        ['Curiosity-comparison loop', '"Where do I stand next to them?"', 'Open loops, loss aversion, the IKEA effect'],
      ],
      rowHeaders: true,
    },

    {
      type: 'list',
      items: [
        `**Social validation.** Casting drives it. Who you approach, and where you stand to do it, decides which viewers see someone like themselves.`,
        `**Identity signalling.** The viewer isn't checking whether an answer is true. They're checking whether it's theirs, so the answers you keep, and their order, carry this force.`,
        `**The curiosity-comparison loop.** Questions people rarely ask aloud, about money or regret, make every viewer run their own numbers. They stay to see where they land.`,
      ],
    },

    `Comparison questions need care. Money and regret are personal, so ask lightly, let people skip, and never put a figure on screen that someone didn't agree to share.`,

    `Our [five-phase vox pop strategy](/blog/vox-pop-strategy-for-indian-brands) builds a full plan on these three forces, and [why brands choose vox pop](/why-voxpop) has the short version. This page stays with the seven effects underneath them.`,

    `Before the seven effects, test what you've heard. Each card has a popular claim on the front and what the research found on the back.`,

    {
      type: 'widget',
      widget: 'flipCards',
      id: 'claims-checked',
      props: {
        title: 'Seven popular claims, checked',
        cards: [
          {
            front: 'Unfinished tasks are remembered twice as well.',
            back: `Zeigarnik reported roughly that in 1927. A 2025 meta-analysis found no memory advantage, only a tendency to go back and finish.`,
            tag: 'Open loops',
          },
          {
            front: 'A mistake makes anyone more likeable.',
            back: `Only someone already seen as highly capable. In the 1966 study, the same slip made an average contestant less likeable.`,
            tag: 'Pratfall',
          },
          {
            front: 'Losses always feel exactly twice as strong as gains.',
            back: `Roughly twice on average, but the ratio varies from person to person and with the stakes.`,
            tag: 'Loss aversion',
          },
          {
            front: 'People need a shared history to favour their own group.',
            back: `No. Boys grouped by something as trivial as a painting preference still gave more rewards to their own group.`,
            tag: 'In-group',
          },
          {
            front: 'Any effort makes people love the result.',
            back: `Only finished effort. When people failed to complete the IKEA boxes, the effect went away.`,
            tag: 'IKEA effect',
          },
          {
            front: 'Dissonance is painful and forces people to act.',
            back: `Festinger described a discomfort that motivates people to reduce it, often by changing a belief. "Painful" and "forced" overstate it.`,
            tag: 'Dissonance',
          },
          {
            front: 'Seven exposures and people trust you.',
            back: `There's no fixed number. Familiarity raises liking modestly, and it can fade with too much repetition.`,
            tag: 'Mere exposure',
          },
        ],
      },
    },

    // ---------------------------------------------------------------- 1. Zeigarnik
    { type: 'h2', id: 'unfinished-loops', text: '1. Why do open loops keep people watching?', toc: '1. Open loops' },

    `An open question tends to pull people forward, so viewers stay to see how it ends. Treat that as editing craft, not a law of the brain: the famous memory effect behind it hasn't held up well.`,

    { type: 'h3', id: 'zeigarnik-study', text: 'What the 1927 study found, and what held up' },

    {
      type: 'definition',
      id: 'zeigarnik-definition',
      term: 'Zeigarnik effect',
      text: 'The claim that people remember interrupted tasks better than finished ones. Bluma Zeigarnik reported it in 1927, and later studies have not reliably confirmed it.',
      source: 'zeigarnik-meta',
    },

    `The usual story starts in a café, and retellings often put it in Vienna, though it was Berlin. Kurt Lewin, the story goes, watched a waiter remember every unpaid order and forget each one once the bill was paid. It's an anecdote, not data. Bluma Zeigarnik, one of Lewin's students, took the idea into the lab and earned a doctorate in Berlin in 1927[^zeigarnik-bio].`,

    `Zeigarnik gave people a series of small tasks and interrupted some before they were done. The 1927 paper reported that interrupted tasks were recalled roughly twice as often as finished ones[^zeigarnik-meta]. That result still gets quoted as a law of memory.`,

    `It isn't one.`,

    `In 2025, a meta-analysis by Ghibellini and Meier at the University of Bern pooled the studies that tried to repeat it[^zeigarnik-meta]. The memory advantage didn't show up. Something else did.`,

    {
      type: 'quote',
      text: 'We found no memory advantage for unfinished tasks but found a general tendency to resume tasks.',
      attribution: 'Ghibellini and Meier, University of Bern, 2025',
      source: 'zeigarnik-meta',
    },

    `That second pattern, going back to finish, is called the Ovsiankina effect. For a vox pop it's the useful one. A viewer doesn't need to remember your unanswered question. They need a reason to stay and close it.`,

    `Editors call that reason an [open loop](/blog/vox-pop-glossary#open-loop): a question the video raises early and answers later. We call the technique the Zeigarnik pull, after the research, even though the memory claim didn't survive.`,

    { type: 'h3', id: 'zeigarnik-street', text: 'On the street and in the edit' },

    `The easy cut opens on the biggest reaction: a laugh, or someone saying "I love it". It feels safe. But the story is over in two seconds, and a viewer who has the ending has no reason to stay.`,

    `Open on the moment just before instead: the sniff, the frown, the pause before the guess. YouTube's own Shorts analytics measure [how often viewers stayed to watch past the first seconds](https://support.google.com/youtube/answer/12220281)[^youtube-stayed], so the first frame has one job.`,

    `It has to raise a question the next ten seconds can answer.`,

    {
      type: 'steps',
      id: 'zeigarnik-pull',
      title: 'Build an open loop into a vox pop edit',
      intro: 'Five moves, in the order an editor makes them.',
      howTo: true,
      supplies: ['The raw clips from one question', 'The question, written as a caption'],
      steps: [
        { name: 'Start mid-moment', text: `Open on the second before the reaction. Something should already be happening when the viewer arrives.` },
        { name: 'Keep the question on screen', text: `Put the question in a caption that stays up. A viewer who can see the question knows what they're waiting for.` },
        { name: 'Hold the answer one more beat', text: `Let the first person think. Don't fill the gap with a voiceover; the gap is the point.` },
        { name: 'Cut away once, at most', text: `Cut to a second person mid-answer, so two answers are pending. Do it twice and the viewer loses the thread.` },
        { name: 'Close it, but leave one thread', text: `Answer the question you opened, clearly. Then leave one small question for the next video in the series.` },
      ],
    },

    `Below is the same imagined clip, opened two ways. Switch between them and notice where your attention goes.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'closed-vs-open',
      props: {
        title: 'Closed vs open opening',
        before: {
          label: 'Closed opening',
          text: `The clip opens on the reveal: "Oh, it's coffee. I love coffee." Then a caption explains what was asked.`,
          points: ['The ending comes first', 'Nothing is left to wait for', 'The question arrives too late to matter'],
        },
        after: {
          label: 'Open opening',
          text: `The clip opens on the sniff. Caption: "Smell it. Guess what it is." The person frowns and goes quiet.`,
          points: ['The question is on screen from the first frame', 'The viewer guesses along', 'The reveal lands at the end, where it belongs'],
        },
        note: 'Illustrative lines, not from a real shoot. Same footage, same length. Only the first two seconds moved.',
      },
    },

    {
      type: 'video',
      brand: 'Waxys',
      title: 'Smell It And Guess',
      caption: 'The question: smell it and guess. The guess comes before the answer, so the viewer waits alongside the person.',
    },

    `A loop can also run across videos. End one clip on a small open thread, such as "part two: what they said after the follow-up", and the next video has a reason to exist. Use it sparingly. A run of cliffhangers with weak payoffs teaches people to stop trusting your openings.`,

    `When this doesn't work: a weak payoff. An open loop is a promise, and a clip that delays a dull answer only annoys people. Make the reveal worth the wait, and close every loop you open. Our [street interview hooks](/blog/street-interview-hooks) guide has more first lines to test.`,

    // ---------------------------------------------------------------- 2. Pratfall
    { type: 'h2', id: 'pratfall-effect', text: '2. Does the pratfall effect make people more likeable?', toc: '2. The pratfall effect' },

    `Only when competence is already clear. In a 1966 study, a capable quiz contestant who spilled coffee became more likeable, while the same slip made an average contestant less likeable. Keep real stumbles. Never stage one.`,

    { type: 'h3', id: 'pratfall-study', text: 'What Aronson actually tested' },

    {
      type: 'definition',
      id: 'pratfall-definition',
      term: 'Pratfall effect',
      text: 'The finding that a small blunder can make a highly capable person more likeable, while the same blunder makes an average person less likeable.',
      source: 'aronson-1966',
    },

    `Elliot Aronson, with Willerman and Floyd, played male students a tape of a quiz-show contestant[^aronson-1966]. The contestant came across as either highly capable or average. On some tapes, they also spilled a cup of coffee.`,

    `The capable contestant who spilled the coffee was rated more likeable than the capable one who didn't. The average contestant who spilled it was rated less likeable[^pratfall-summary]. Later work by Helmreich, Aronson and LeFan, in 1970, found the effect also shifts with the listener's own self-esteem[^pratfall-summary]. The 1966 listeners were all male students, so hold the details loosely.`,

    `Two corrections follow. The study measured liking, not persuasion, so it says nothing direct about buying. And a stumble helps only once competence is on the record.`,

    `Blunder first, and you're just the person who spilled the coffee.`,

    { type: 'h3', id: 'pratfall-street', text: 'Keep the stumble that comes after the proof' },

    `The usual instinct is to scrub the footage.`,

    `Out go the "uh, I mean", the nervous laugh and the look away, until a clean thirty seconds is left. Our view: viewers have seen enough ads to notice when something has been sanded down, and too much polish starts to read as performance.`,

    `Order matters more than the stumble. Let the person show they know the subject, then keep the admission that follows. Someone who has cooked every day for ten years and still can't roll a round roti reads as a real cook.`,

    {
      type: 'script',
      id: 'script-proof-then-slip',
      title: 'Proof first, then the slip',
      context: 'An illustrative exchange, not from a real shoot. Any everyday skill works. The host asks about experience before asking about mistakes.',
      lines: [
        { direction: 'Mid-afternoon, outside a grocery store. The warm-up question is done.' },
        { speaker: 'Host', text: 'You cook every day?' },
        { speaker: 'Participant', text: 'Every single day. Ten years now.' },
        { speaker: 'Host', text: 'So what do you still get wrong?' },
        { direction: 'A laugh. They look away from the camera.' },
        { speaker: 'Participant', text: "Rotis. They're never round. My mother still checks." },
        { direction: 'Keep the laugh and the look away. Cut after the line, not before it.' },
      ],
    },

    `The same goes for the host. A host who has clearly done this before can fumble a word and laugh at it, and we think strangers relax a little when that happens. A host who fumbles everything just looks unprepared.`,

    `In the edit, keep the hesitation that carries meaning and cut the dead air that doesn't. Don't rescue the moment with music or a voiceover. Bring the product in after the moment has landed, never on top of it. [How to edit a vox pop](/blog/how-to-edit-vox-pop-videos) covers pacing in full.`,

    {
      type: 'callout',
      tone: 'warning',
      title: 'Never fake a stumble',
      text: `A staged slip is a performance, and a performance passed off as a reaction misleads the viewer. The same goes for planted answers and actors cast as passers-by. The disclosure rules are in the section on manipulation, further down.`,
    },

    `Where it breaks: a stumble before any proof, or a slip about the product itself. A participant who can't get your product to do its main job has found a problem with the product or the brief, and no edit makes that charming.`,

    // ---------------------------------------------------------------- 3. Loss aversion
    { type: 'h2', id: 'loss-aversion', text: '3. Why does a loss land harder than a gain?', toc: '3. Loss aversion' },

    `People tend to weigh a loss more heavily than an equal gain. In a vox pop, let people describe what they lost in their own words, keep the stakes small and real, and never manufacture fear.`,

    { type: 'h3', id: 'loss-study', text: 'Roughly twice, on average' },

    {
      type: 'definition',
      id: 'loss-aversion-definition',
      term: 'Loss aversion',
      text: 'The tendency to weigh a loss more heavily than a gain of the same size.',
      source: 'loss-aversion',
    },

    `Daniel Kahneman and Amos Tversky made loss aversion famous. In their 1992 estimate, built on hypothetical choices by 25 graduate students, a loss weighed about 2.25 times as much as an equal gain[^tversky-kahneman-1992]. A 2024 meta-analysis in the Journal of Economic Literature put the average nearer 1.96[^loss-aversion].`,

    `Treat "twice" as a rough average. The ratio moves with the person and with the stakes.`,

    `Losing five hundred rupees tends to sting more than finding five hundred rupees pleases, but nobody's head runs a fixed exchange rate.`,

    { type: 'h3', id: 'loss-street', text: 'Let people name what they lost' },

    `The default D2C pitch sells the gain: the after shot, the better routine. We call the alternative the loss anchor. Start with what someone is losing now, in their own words, before the product appears.`,

    `Your best voices here are often people who tried other things first and can say what it cost them. Happy customers can wait for a later video.`,

    `Specific beats general. "I wasted money" is forgettable. "I bought three yoga mats and unrolled one" is a scene.`,

    {
      type: 'list',
      items: [
        `"What did you pay for last year and never use?"`,
        `"What's the worst money you've spent on a gadget?"`,
        `"What went missing the last time you moved house?"`,
        `"What's a bet you lost, and what did it cost you?"`,
      ],
    },

    `Each of those invites a small, real loss with room for a laugh, and none of them asks anyone to be afraid.`,

    `Framing is the cheapest lever you have. "What would you do with two extra hours a day?" is a gain question, and it usually gets wishes. "Where did yesterday evening go?" is a loss question, and it usually gets a scene. Both are useful, as long as you know which one you're asking.`,

    {
      type: 'video',
      brand: 'Hackdaily',
      title: 'She Lost The Bet',
      caption: 'The title tells the story: someone lost a bet. It is the kind of small loss people can laugh about on camera.',
    },

    `Then stay on the loss for a beat after it lands, and only then bring in the product as one way to stop it. Lost time and small embarrassments work. Health scares and invented deadlines don't. They cross [our lines on manipulation](#without-manipulating).`,

    `When this doesn't work: fear. A loss frame that frightens people about their health, or about money they haven't lost, is manipulation. Don't write that question in the first place.`,

    // ---------------------------------------------------------------- 4. In-group
    { type: 'h2', id: 'in-group-signals', text: '4. How do in-group signals make a viewer feel seen?', toc: '4. In-group signals' },

    `People favour their own group even when the group means almost nothing. A vox pop signals the group through who answers and the words they use, so the right viewer thinks "that's us".`,

    { type: 'h3', id: 'ingroup-study', text: "Tajfel's groups, built on almost nothing" },

    {
      type: 'definition',
      id: 'in-group-definition',
      term: 'In-group favouritism',
      text: 'The tendency to treat members of your own group better than outsiders, even when the group was formed on trivial or random grounds.',
      source: 'minimal-group',
    },

    `In 1970 and 1971, Henri Tajfel split schoolboys into groups on trivial grounds: how many dots they thought they'd seen, or whether they preferred paintings by Klee or Kandinsky. In fact the groups were random. The boys still gave more rewards to members of their own group[^minimal-group].`,

    `Sometimes they even accepted less for their own side if it widened the gap over the other side. Tajfel and John Turner later built social identity theory on findings like these, in 1979[^minimal-group].`,

    `A shared label is enough to make people feel like a "we".`,

    { type: 'h3', id: 'ingroup-street', text: 'Name the group by habit, not by age' },

    `Content that talks to everyone tends to land with no one in particular. What we call the in-group signal starts narrower. Pick the group by a shared habit or frustration, not a demographic.`,

    `A line like "you're the one who flips the pack to read the ingredients first" describes a habit, not a purchase. The right viewer recognises themselves in it. Everyone else scrolls on, and that's fine.`,

    `Questions can find a group the same way, by a habit its members share:`,

    {
      type: 'list',
      items: [
        `"What's the one thing in your fridge your flatmates aren't allowed to touch?"`,
        `"What's your line when the auto driver won't go by meter?"`,
        `"What do you carry in your bag that nobody else in your family would?"`,
        `"What's the first app you open when the metro goes underground?"`,
      ],
    },

    {
      type: 'comparison',
      title: 'Talking to everyone vs talking to a group',
      left: { label: 'Everyone', items: ['"What do you look for in a snack?"', 'Polite, general answers', 'Every viewer half-recognises it'] },
      right: {
        label: 'A group',
        items: ['"What do you eat at your desk at 4 pm when the meeting runs over?"', 'Specific answers with a scene in them', 'One group sees itself clearly'],
      },
      verdict: 'Narrow the question and the right viewers lean in. Outsiders scrolling past is part of the design.',
    },

    `In India, language does a lot of this work. A question asked the way people talk, in the street's own mix of English with Hindi or Kannada, signals "one of us" before the answer starts. So do small local details, like the Silk Board signal or a "one by two" chai.`,

    `If you shoot in more than one city, treat any "city type" as a guess to test, not a fact. A Bengaluru engineer who feels most awake at 2 am, or a Mumbai saver who grew up watching parents worry about bills, is a hypothesis about who you're asking. The street will tell you if it's wrong.`,

    `The signal backfires when newcomers are the audience you most need, because a tight one shuts them out. And an in-group never needs a villain.`,

    `Contrast a habit, never a kind of person.`,

    // ---------------------------------------------------------------- 5. IKEA
    { type: 'h2', id: 'ikea-effect', text: '5. Why do people value what they help build?', toc: '5. The IKEA effect' },

    `Effort tends to create attachment, but only finished effort. Give viewers a small job they can complete in a few seconds, such as a guess or a pick, and end the video on a task rather than a vague question.`,

    { type: 'h3', id: 'ikea-study', text: 'Boxes, origami and the catch' },

    {
      type: 'definition',
      id: 'ikea-definition',
      term: 'IKEA effect',
      text: 'The tendency to value something more because you helped make it, as long as you finished it.',
      source: 'ikea-paper',
    },

    `Michael Norton of Harvard Business School, with Daniel Mochon and Dan Ariely, asked people to assemble plain IKEA storage boxes[^ikea-paper]. Builders were willing to pay about 63% more for their box than other people would pay for an identical one that came ready-made[^ikea-summary]. In an origami study, builders valued their own amateur pieces about as highly as other people valued an expert's[^ikea-paper].`,

    `Then the catch, which retellings often skip. When people started building and failed to finish, the effect went away[^ikea-summary]. Effort without completion created no extra attachment.`,

    `That catch is the whole lesson for content.`,

    { type: 'h3', id: 'ikea-street', text: 'Give the viewer a job they can finish' },

    `A typical post arrives pre-assembled. You watch it, it ends, and nothing of you went into it. A vox pop can hand the viewer a small job before it asks for anything.`,

    {
      type: 'list',
      items: [
        `**A guess.** "What do you think this costs?" Every viewer has a number before the reveal.`,
        `**A pick.** "Salt or sweet?" The viewer takes a side in the first second.`,
        `**A ranking.** Three options, ranked out loud, while the viewer quietly ranks along.`,
        `**A gap to fill.** Stop a list one item short and let the comments finish it.`,
      ],
    },

    `All four are among [our eleven mechanisms for varying a batch](/blog/eleven-ways-to-vary-a-vox-pop-batch). Each gives the viewer something to hold before the answer arrives.`,

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'What Will U Do With X',
      caption: 'The question in the title, "What will you do with X?", invites every viewer to answer in their head alongside the person on screen.',
    },

    `Then design the ending as a task. "Let me know what you think" is a pre-assembled ending, because it asks for nothing in particular. Compare it with "We asked people on the street whether they'd make the same choice again. Would you?"`,

    `Now the comment box is the next part of the video.`,

    `Build the product into the task itself. If the guess is the price, the product is the thing being guessed. Reply to the answers that come in, and let the most common ones shape the next shoot's questions.`,

    `When this doesn't work: a task that takes real effort. If it needs more than a few seconds, people skip it, and an unfinished task is exactly where the effect disappeared.`,

    // ---------------------------------------------------------------- 6. Dissonance
    { type: 'h2', id: 'cognitive-dissonance', text: '6. What does cognitive dissonance look like on camera?', toc: '6. Cognitive dissonance' },

    `Dissonance is the discomfort of holding a belief that clashes with what you do. On the street it shows up when someone catches their own contradiction mid-answer. Edit around that moment, and don't rush to the product.`,

    { type: 'h3', id: 'dissonance-study', text: "Festinger's one-dollar finding" },

    {
      type: 'definition',
      id: 'dissonance-definition',
      term: 'Cognitive dissonance',
      text: 'The discomfort of holding two beliefs, or a belief and an action, that clash. The discomfort motivates people to reduce the clash.',
      source: 'dissonance-summary',
    },

    `Leon Festinger set out the theory in 1957. When what we do clashes with what we believe, the discomfort pushes us to change one of them, often by changing the belief or finding a reason for the action[^dissonance-summary].`,

    `The classic test came two years later. Festinger and Carlsmith had students do a dull, repetitive task, then paid them $1 or $20 to tell the next person it was fun. Afterwards, those paid $1 rated the task as more enjoyable than those paid $20[^festinger-1959].`,

    `Twenty dollars was reason enough to have said it. One dollar wasn't, so the belief moved instead.`,

    `Nothing in the theory says dissonance hurts, or that it forces anyone to act. It describes a discomfort that motivates people to settle the clash, one way or another.`,

    { type: 'h3', id: 'dissonance-street', text: 'Find the crack, then hold it' },

    `The moment is often already in your footage. Someone says they care about quality, then admits they always buy the cheapest option first. They hear themselves, and something crosses their face.`,

    `We call it the dissonance crack.`,

    `A follow-up question is usually what surfaces it. These lines are illustrative, not from a real shoot. Tap each one to see the second answer.`,

    {
      type: 'widget',
      widget: 'reveal',
      id: 'contradiction-caught',
      props: {
        title: 'The contradiction, caught',
        items: [
          {
            question: 'Do you compare prices before you buy?',
            first: `"Always. I'm very careful with money."`,
            second: `"The phone? No. I saw it, I bought it." A laugh. "Okay, not always."`,
            note: 'The follow-up: "What did you last buy without checking?"',
          },
          {
            question: 'Would you call yourself organised?',
            first: '"Very. I plan everything."',
            second: `"My bag? Please don't ask about my bag."`,
            note: `The follow-up: "What's in your bag right now?"`,
          },
        ],
      },
    },

    {
      type: 'list',
      ordered: true,
      items: [
        `**Name the belief.** What does your viewer already think about the category? Not what you want them to think.`,
        `**Find the moment.** A real person on camera saying something that shouldn't be true if that belief were right.`,
        `**Hold it.** Start from the crack, not from the recovery. No music sting, no voiceover rescue.`,
        `**Let the viewer resolve it.** The product appears once the question is already running in their head. Never tell them what to conclude.`,
      ],
    },

    {
      type: 'comparison',
      title: 'Rushed vs held',
      left: { label: 'Rushed to the product', items: ['Problem, then pack shot, within two seconds', 'The tension never lands', 'Reads as an ad'] },
      right: { label: 'Held contradiction', items: ['The crack plays out in full', 'The viewer wonders, "Do I do that?"', 'The product arrives as one possible answer'] },
      verdict: 'Hold the contradiction longer than feels comfortable. Then step back.',
    },

    `Two limits. The person on camera agreed to be filmed, not to be the punchline, so the cut should laugh with them. And a product can only resolve a contradiction it can actually resolve. A street answer is never proof that a product works.`,

    // ---------------------------------------------------------------- 7. Mere exposure
    { type: 'h2', id: 'mere-exposure', text: '7. Does seeing you more often make people like you more?', toc: '7. Mere exposure' },

    `Usually a little, up to a point. Familiarity tends to raise liking, but the effect is modest and can fade with too much repetition. No study we know of gives a fixed number of exposures before people trust a brand.`,

    { type: 'h3', id: 'exposure-study', text: "Zajonc's nonsense words, and the limits" },

    {
      type: 'definition',
      id: 'mere-exposure-definition',
      term: 'Mere-exposure effect',
      text: 'The tendency to like something more because you have seen it before, sometimes without remembering that you have.',
      source: 'zajonc-1968',
    },

    `In 1968, Robert Zajonc showed people unfamiliar things, such as nonsense words, Chinese-like characters and faces from a yearbook, different numbers of times. On average, the more often something had been shown, the more people liked it[^zajonc-1968].`,

    `The striking version came in 1980. Kunst-Wilson and Zajonc flashed shapes too briefly for people to recognise them later, yet people still tended to prefer the ones they'd seen[^kunst-wilson-1980].`,

    { type: 'stat', value: '208', label: "Experiments in Robert Bornstein's 1989 review of mere exposure", source: 'bornstein-1989' },

    `Then the limits. Bornstein's review found a reliable but modest effect[^bornstein-1989]. It was strongest for brief exposures and usually peaked within 10 to 20 of them, after which liking could fall[^mere-exposure-summary].`,

    `So "show up more" is half right: show up more, in different shapes, with something recognisable each time.`,

    `It's tempting to post twice, see little and stop. Lab studies with nonsense words aren't brand studies, so don't stretch them far. The fair reading is narrower: familiarity builds over several meetings, so judge a series, never a single clip.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'A recurring host helps too',
      text: `Sociologists Horton and Wohl described para-social interaction in 1956: a presenter who talks to the camera like a friend creates "intimacy at a distance"[^parasocial-1956]. The same host across a vox pop series builds that kind of familiarity too.`,
    },

    { type: 'h3', id: 'exposure-ladder', text: 'The exposure ladder' },

    `The exposure ladder, as we call it, plans five meetings with one idea, each in a different format. People won't meet them in order, and that's fine. What matters is that each one feels like the same brand.`,

    {
      type: 'table',
      caption: 'Five rungs of the exposure ladder',
      head: ['Rung', 'Format', 'Its job'],
      rows: [
        ['1', 'Vox pop', 'The street question. The viewer thinks "this is about me".'],
        ['2', 'Carousel', 'Goes deeper into the answer that landed.'],
        ['3', 'Talking head', 'Someone from the brand explains the thinking behind it.'],
        ['4', 'Case study', 'A real example, only if true and shareable.'],
        ['5', 'Comment prompt', 'A task that invites the viewer to answer.'],
      ],
    },

    `Draft your own ladder below by typing your question, your product and the element that repeats.`,

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'ladder-builder',
      props: {
        title: 'Build your exposure ladder',
        intro: 'Each rung fills in as you type. Copy the lines you would use.',
        fields: [
          { id: 'question', label: 'Your street question', placeholder: 'e.g. What does your home smell like?', example: 'What does your home smell like?' },
          { id: 'product', label: 'Your product', placeholder: 'e.g. a scented candle', example: 'a scented candle' },
          { id: 'element', label: 'The element that repeats', placeholder: 'e.g. the yellow question card', example: 'the yellow question card' },
        ],
        templates: [
          { text: 'Ask "{question}" on the street. Open the cut on the pause before the best answer.', group: 'Rung 1: vox pop', mechanism: 'Personal experiences' },
          { text: 'End the vox pop with {element} on screen, holding the question.', group: 'Rung 1: vox pop' },
          { text: 'Slide 1: the most surprising answer to "{question}". Slides 2 to 4: what it says about people like your viewer.', group: 'Rung 2: carousel' },
          { text: 'Last slide: {element}, and one line on where {product} fits.', group: 'Rung 2: carousel' },
          { text: 'To camera: "We asked strangers one question: {question} Here is what we noticed."', group: 'Rung 3: talking head' },
          { text: 'Show how one real customer uses {product}, with their permission and nothing invented.', group: 'Rung 4: case study' },
          { text: 'Open with {element}, then ask the viewer: "{question}" Pin the best reply.', group: 'Rung 5: comment prompt', mechanism: 'Audience participation' },
        ],
        note: 'A planning aid. Research gives no fixed number of exposures, and liking can fall with too much repetition.',
      },
    },

    `We'd take five steady meetings over one big hit. A clip that travels gives you a screenshot for the team chat. Five consistent meetings can make a brand feel familiar, which is the slower and more useful prize.`,

    `Where it breaks: reposting the same clip. Change the question and the shape each time, and keep only the element that repeats.`,

    // ---------------------------------------------------------------- All seven in one video
    { type: 'h2', id: 'one-video', text: 'What do the seven effects look like in one video?', toc: 'All seven in one video' },

    `Good vox pops lean on several effects at once, usually without anyone naming them. Below is one imagined 30-second cut, beat by beat, with the effect behind each choice.`,

    `The brand is made up, to show the idea: a desk snack for people whose meetings run late. None of these beats can be scripted. They're what to look for in the footage, and where to put each one in the cut.`,

    {
      type: 'widget',
      widget: 'timeline',
      id: 'thirty-second-cut',
      props: {
        title: 'One imagined 30-second vox pop, beat by beat',
        intro: 'A made-up desk snack brand. Each beat names the effect it leans on.',
        items: [
          {
            when: '0:00 to 0:02',
            title: 'The pause',
            text: 'Open on someone staring at two packets, mouth half open. Caption: "4 pm, meeting overrun. Which one?"',
            tasks: ['Open loop: the question is on screen, the answer is not'],
          },
          {
            when: '0:02 to 0:06',
            title: 'The group',
            text: 'Three quick faces with office lanyards, each picking a side without a second thought.',
            tasks: ['In-group signals: the desk-at-4-pm crowd sees itself'],
          },
          {
            when: '0:06 to 0:12',
            title: 'The proof, then the slip',
            text: `One person says they've tried every snack in the office canteen, then laughs: they still can't open a chips packet without it bursting.`,
            tasks: ['Pratfall effect: competence first, then the slip'],
          },
          {
            when: '0:12 to 0:18',
            title: 'The crack',
            text: `Another says they never snack at work. The host asks what's in their drawer. A pause, then a laugh.`,
            tasks: ['Cognitive dissonance: hold the pause, not the recovery'],
          },
          {
            when: '0:18 to 0:24',
            title: 'The small loss',
            text: 'Someone remembers the canteen snack they paid for every day and never once enjoyed.',
            tasks: ['Loss aversion: a small, real cost in their own words'],
          },
          {
            when: '0:24 to 0:30',
            title: 'The task',
            text: `The product appears in the host's hand. On screen: "Your 4 pm pick?" on the yellow card that opens every video in the series.`,
            tasks: ['IKEA effect: a task the viewer can finish', 'Mere exposure: the same card, every time'],
          },
        ],
      },
    },

    `Not every video needs all seven. In our view most need two or three, chosen on purpose. When a cut feels flat, check the first two seconds before anything else, because that's where the open loop either starts or doesn't.`,

    `To find these beats, log the footage before you cut. Tag each usable answer with what it shows, such as a pause, a slip, a loss or a crack, and build the edit from the log rather than from memory.`,

    // ---------------------------------------------------------------- Ethics
    { type: 'h2', id: 'without-manipulating', text: 'How do you use psychology without manipulating people?', toc: 'Without manipulating people' },

    `Use these effects to choose and arrange real moments, never to invent them. Get consent, keep reactions real, make no claim a street answer can't support, and say so when anyone on camera was paid or cast.`,

    `Every effect in this guide can be abused. An open loop can turn into bait, and a loss frame into fear.`,

    `Our test: would the person on camera, and the viewer, be comfortable seeing exactly how the clip was made?`,

    {
      type: 'list',
      items: [
        `**Consent first.** Tell people where the video will appear, get a signed release from everyone you feature, and have a lawyer check the release. No one under 18 appears without a parent's written consent.`,
        `**Real reactions only.** No staged stumbles, no planted answers, no actors passed off as passers-by.`,
        `**Disclose connections.** If anyone in your vox pop is paid, works for you or was cast, [India's endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect a clear label such as "advertisement", "sponsored" or "paid promotion"[^dca-endorsements].`,
        `**No claims a street answer can't carry.** ASCI, India's advertising self-regulator, says factual claims "should be capable of substantiation"[^asci-code]. A stranger's opinion doesn't substantiate a health or efficacy claim, so keep questions about habits and feelings.`,
        `**Close the loops you open.** A hook that promises a reveal must deliver one.`,
        `**Laugh with people, never at them.** A pratfall or a contradiction belongs to the participant. Cut it with respect, and drop any clip the person asks you to drop.`,
      ],
    },

    `This is general information, not legal advice.`,

    `The line between persuasion and manipulation runs through every effect. This is where we'd draw it for each one.`,

    {
      type: 'table',
      caption: 'Each effect, used honestly and used to manipulate',
      head: ['Effect', 'Honest use', 'Manipulative use'],
      rows: [
        ['Open loops', 'A clear question, answered by the end', 'A tease the video never pays off'],
        ['Pratfall effect', 'Keeping a real slip from a capable person', 'Staging a stumble, or casting an actor'],
        ['Loss aversion', 'People naming small losses they really had', 'Health scares and invented deadlines'],
        ['In-group signals', 'Words and habits a group shares', 'Mocking an outsider group'],
        ['IKEA effect', 'A small task the viewer can finish', 'Hiding the brand inside a fake poll'],
        ['Cognitive dissonance', 'Holding a contradiction the person laughed at', 'Editing someone to look foolish'],
        ['Mere exposure', 'A consistent series in varied formats', 'Reposting one clip until people give in'],
      ],
      rowHeaders: true,
    },

    `One more honest limit. We control the question, the setup, who we approach, the follow-ups and the edit.`,

    `We can't control exactly how a stranger will respond in the moment, and none of these effects changes that.`,

    // ---------------------------------------------------------------- Cheat sheet
    { type: 'h2', id: 'cheat-sheet', text: 'Cheat sheet: the seven effects on one page', toc: 'Cheat sheet' },

    `Each effect suggests one move on the shoot and one in the edit. Use the table to plan your next batch, then test yourself with the quiz.`,

    {
      type: 'table',
      caption: 'The seven effects, with one shoot move and one edit move each',
      head: ['Effect', 'Shoot move', 'Edit move'],
      rows: [
        ['Open loops', 'Ask questions with a reveal: a guess or a pick', 'Open on the pause; keep the question on screen'],
        ['Pratfall effect', 'Ask about experience before asking about mistakes', 'Keep meaningful hesitation; no rescue voiceover'],
        ['Loss aversion', 'Ask what people paid for and never used', 'Hold the loss before the product appears'],
        ['In-group signals', 'Ask in the words your group uses', 'Keep answers only insiders would give'],
        ['IKEA effect', 'Give people a task: guess, rank or choose', 'End on a task the viewer can finish'],
        ['Cognitive dissonance', 'Follow up on very confident answers', 'Start from the crack, not the recovery'],
        ['Mere exposure', 'Keep the same host or question card', 'Vary the format; repeat one element'],
      ],
      rowHeaders: true,
    },

    `Choose the effect after you've set the objective. Before each shoot we lock the objective, products, audience and must-haves, and each video gets one job.`,

    `If the job is curiosity, start with an open loop. If it's social proof, lean on in-group signals and a recurring host. If it's a specific problem, the loss anchor and the dissonance crack tend to fit better.`,

    `Name the effect at work in each of these seven moments from imagined street interviews.`,

    {
      type: 'widget',
      widget: 'quiz',
      id: 'which-effect',
      props: {
        title: 'Which effect is this?',
        intro: 'Pick one answer per moment. Every moment is invented for practice.',
        questions: [
          {
            q: 'The clip opens on someone sniffing a jar and frowning. The caption reads "Guess what this is." The answer comes at the end.',
            options: [
              { text: 'Open loop', points: 1 },
              { text: 'Mere exposure', points: 0 },
              { text: 'IKEA effect', points: 0, why: 'The viewer does guess along, but the main move is holding the answer back.' },
            ],
            explain: 'A clear question with the answer held back is an open loop.',
          },
          {
            q: 'Someone who has cooked daily for ten years laughs and admits their rotis are never round.',
            options: [
              { text: 'Cognitive dissonance', points: 0, why: 'There is no clash between belief and action here, only a small slip after proof of skill.' },
              { text: 'Pratfall effect', points: 1 },
              { text: 'Loss aversion', points: 0 },
            ],
            explain: 'Competence first, then a small slip: the pratfall pattern.',
          },
          {
            q: 'Asked what they never used, a person says they bought three yoga mats and unrolled one.',
            options: [
              { text: 'In-group signals', points: 0 },
              { text: 'Mere exposure', points: 0 },
              { text: 'Loss aversion', points: 1 },
            ],
            explain: 'A specific, real loss in the person\'s own words is the loss anchor.',
          },
          {
            q: 'The host asks, "What do you eat at your desk at 4 pm when the meeting runs over?" Office workers comment, "This is me."',
            options: [
              { text: 'In-group signals', points: 1 },
              { text: 'Pratfall effect', points: 0 },
              { text: 'Open loop', points: 0 },
            ],
            explain: 'A habit one group shares signals "that\'s us".',
          },
          {
            q: 'The video ends: "We asked people if they\'d make the same choice again. Would you?"',
            options: [
              { text: 'Mere exposure', points: 0 },
              { text: 'IKEA effect', points: 1 },
              { text: 'Cognitive dissonance', points: 0, why: 'It may stir a little doubt, but its job is giving the viewer a task to finish.' },
            ],
            explain: 'A small, finishable task gives the viewer a share in the video.',
          },
          {
            q: 'Someone says they always compare prices, then laughs: they bought their phone the day they saw it.',
            options: [
              { text: 'Pratfall effect', points: 0, why: 'Close, but the point is the clash between what they believe and what they did.' },
              { text: 'Loss aversion', points: 0 },
              { text: 'Cognitive dissonance', points: 1 },
            ],
            explain: 'A belief and an action that don\'t match, noticed on camera, is the dissonance crack.',
          },
          {
            q: 'A brand posts a vox pop, a carousel and a talking-head clip in one week, all with the same yellow question card.',
            options: [
              { text: 'Mere exposure', points: 1 },
              { text: 'In-group signals', points: 0 },
              { text: 'IKEA effect', points: 0 },
            ],
            explain: 'Several meetings, different shapes, one repeating element: the exposure ladder.',
          },
        ],
        results: [
          { min: 0, title: 'Read it again', text: 'Go back to the sections you missed. Each one ends with the move it suggests.' },
          { min: 4, title: 'Nearly there', text: 'You know most of them. Check the cheat sheet for the ones that tripped you up.' },
          { min: 6, title: "You've got them", text: 'Now pick one effect and plan your next shoot around it.' },
        ],
      },
    },

    `One thing to do this week: take your last vox pop and watch its first two seconds. If it opens on the biggest reaction, re-cut it to open on the moment before, and keep the question on screen.`,

    `Then compare how far people watch each version. Of everything in this guide, it's the cheapest test you can run.`,

    { type: 'divider' },

    `If you'd rather have the questions planned, the shoot run and the edit made for you, that's the work we do. See the format on your own brand first: scope, the number of trial videos and any fee are confirmed in writing. [Request a trial video](/contact).`,
  ],

  faqs: [
    {
      q: 'Why do people watch street interviews?',
      a: `People watch street interviews because they see themselves in strangers. A real person answering an unscripted question invites a quiet comparison: is that me, and where do I stand? In a 2022 experiment with TV news items, vox pops moved viewers' personal opinions more than an expert quoting a poll, even though viewers rated the expert as more trustworthy. A clear question and an open edit keep them watching.`,
    },
    {
      q: 'What is the Zeigarnik effect in marketing?',
      a: `The Zeigarnik effect is the idea that unfinished tasks stick in the mind, so marketers use open questions to hold attention. Bluma Zeigarnik reported it in Berlin in 1927, but a 2025 meta-analysis found no reliable memory advantage for unfinished tasks, only a tendency to resume them. Treat open loops as editing craft: raise a clear question early and answer it at the end.`,
    },
    {
      q: 'Does the pratfall effect really work?',
      a: `Sometimes, and only for people already seen as capable. In Aronson's 1966 study, a highly capable quiz contestant who spilled coffee became more likeable, while an average contestant became less likeable after the same slip. The study measured liking, not persuasion. In a vox pop, keep a real stumble that follows clear competence, and never stage one.`,
    },
    {
      q: 'What is loss aversion?',
      a: `Loss aversion is the tendency to weigh a loss more heavily than an equal gain. Tversky and Kahneman estimated a ratio of about 2.25 in 1992, and a 2024 meta-analysis put the average near 1.96, though it varies by person and by stakes. In a vox pop, let people describe small, real losses in their own words, and never manufacture fear.`,
    },
    {
      q: 'What is the IKEA effect in content?',
      a: `The IKEA effect is the tendency to value what we help build. Norton, Mochon and Ariely found people would pay more for IKEA boxes they assembled than for identical ready-made ones, but only when they finished. In content, give the viewer a small task they can complete, such as a guess, a pick or a ranking, and end on a specific question.`,
    },
    {
      q: 'Is using psychology in marketing manipulative?',
      a: `Sometimes. Using psychology in marketing turns manipulative when it invents what it shows. Choosing and arranging real moments so viewers understand them is editing. Inventing reactions, staging stumbles, scaring people about losses or making claims a street answer can't support is manipulation. One test: would the person on camera, and the viewer, be comfortable seeing exactly how the clip was made?`,
    },
    {
      q: 'How many times does someone need to see a brand before they trust it?',
      a: `There is no fixed number. Research on the mere-exposure effect shows familiarity tends to raise liking, but the effect is modest, strongest for brief exposures and can fade with too much repetition. Rules such as "seven touches" have no solid source. Plan several meetings in different formats, keep one recognisable element, and watch how your own audience responds.`,
    },
    {
      q: 'Which psychology effect matters most for vox pop?',
      a: `Open loops, in the edit, because the opening decides whether anyone stays. On the shoot, the follow-up question matters more than any single effect, since it surfaces the slips, losses and contradictions worth keeping. Our view: start with the opening. Re-cut one video to open on the moment before the reaction, and keep the question on screen.`,
    },
  ],

  sources: [
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications (De Gruyter)',
      date: '2022',
      note: 'CLAIMS R11/E04: vox pops rated less trustworthy than an expert with poll data, yet shifted personal opinion more.',
    },
    {
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research (Brosius and Bathelt)',
      date: '1994',
      note: 'CLAIMS E06: individual cases sway judgments more than base-rate statistics.',
    },
    {
      id: 'zeigarnik-bio',
      title: 'Bluma Zeigarnik',
      url: 'https://feministvoices.com/profiles/bluma-zeigarnik',
      publisher: "Psychology's Feminist Voices",
      note: 'CLAIMS R01: worked in Berlin with Kurt Lewin; doctorate at the University of Berlin, 1927.',
    },
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications (Ghibellini and Meier)',
      date: '2025',
      note: 'CLAIMS R01: no memory advantage for unfinished tasks; a general tendency to resume them.',
    },
    {
      id: 'youtube-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'CLAIMS P01/E24: "Stayed to watch" for Shorts.',
    },
    {
      id: 'aronson-1966',
      title: 'The effect of a pratfall on increasing interpersonal attractiveness',
      url: 'https://doi.org/10.3758/BF03342263',
      publisher: 'Psychonomic Science (Aronson, Willerman and Floyd)',
      date: '1966',
      note: 'CLAIMS R02: the original study.',
    },
    {
      id: 'pratfall-summary',
      title: 'Pratfall effect',
      url: 'https://en.wikipedia.org/wiki/Pratfall_effect',
      publisher: 'Wikipedia',
      note: 'CLAIMS R02: only the capable contestant gained; the average one lost; Helmreich, Aronson and LeFan (1970) on self-esteem.',
    },
    {
      id: 'tversky-kahneman-1992',
      title: 'Advances in prospect theory: Cumulative representation of uncertainty',
      url: 'https://doi.org/10.1007/BF00122574',
      publisher: 'Journal of Risk and Uncertainty (Tversky and Kahneman)',
      date: '1992',
      note: 'CLAIMS R03: the loss-aversion estimate of 2.25.',
    },
    {
      id: 'loss-aversion',
      title: 'Meta-analysis of empirical estimates of loss aversion',
      url: 'https://www.aeaweb.org/articles?id=10.1257/jel.20221698',
      publisher: 'Journal of Economic Literature (Brown, Imai, Vieider and Camerer)',
      date: '2024',
      note: 'CLAIMS R03: "the mean loss aversion coefficient is 1.955".',
    },
    {
      id: 'minimal-group',
      title: 'Minimal group paradigm',
      url: 'https://en.wikipedia.org/wiki/Minimal_group_paradigm',
      publisher: 'Wikipedia',
      note: 'CLAIMS R04: Tajfel 1970 and 1971; random groups; in-group favouritism.',
    },
    {
      id: 'ikea-paper',
      title: 'The IKEA effect: When labor leads to love',
      url: 'https://doi.org/10.1016/j.jcps.2011.08.002',
      publisher: 'Journal of Consumer Psychology (Norton, Mochon and Ariely)',
      date: '2012',
      note: 'CLAIMS R05: the original paper, including the origami study.',
    },
    {
      id: 'ikea-summary',
      title: 'IKEA effect',
      url: 'https://en.wikipedia.org/wiki/IKEA_effect',
      publisher: 'Wikipedia',
      note: 'CLAIMS R05: builders willing to pay 63% more; the effect dissipated when people failed to complete.',
    },
    {
      id: 'dissonance-summary',
      title: 'Cognitive dissonance',
      url: 'https://en.wikipedia.org/wiki/Cognitive_dissonance',
      publisher: 'Wikipedia',
      note: 'CLAIMS R06: Festinger 1957, the theory.',
    },
    {
      id: 'festinger-1959',
      title: 'Cognitive consequences of forced compliance',
      url: 'https://doi.org/10.1037/h0041593',
      publisher: 'Journal of Abnormal and Social Psychology (Festinger and Carlsmith)',
      date: '1959',
      note: 'CLAIMS R06: the $1 and $20 study.',
    },
    {
      id: 'zajonc-1968',
      title: 'Attitudinal effects of mere exposure',
      url: 'https://doi.org/10.1037/h0025848',
      publisher: 'Journal of Personality and Social Psychology (Zajonc)',
      date: '1968',
      note: 'CLAIMS R07: nonsense words, Chinese-like characters, yearbook faces.',
    },
    {
      id: 'kunst-wilson-1980',
      title: 'Affective discrimination of stimuli that cannot be recognized',
      url: 'https://doi.org/10.1126/science.7352271',
      publisher: 'Science (Kunst-Wilson and Zajonc)',
      date: '1980',
      note: 'CLAIMS R07: preference without recognition, from very brief exposures.',
    },
    {
      id: 'bornstein-1989',
      title: 'Exposure and affect: Overview and meta-analysis of research, 1968-1987',
      url: 'https://doi.org/10.1037/0033-2909.106.2.265',
      publisher: 'Psychological Bulletin (Bornstein)',
      date: '1989',
      note: 'CLAIMS R07: 208 experiments; reliable but modest effect.',
    },
    {
      id: 'mere-exposure-summary',
      title: 'Mere-exposure effect',
      url: 'https://en.wikipedia.org/wiki/Mere-exposure_effect',
      publisher: 'Wikipedia',
      note: 'CLAIMS R07: strongest for brief exposures; usually peaks within 10 to 20; liking can fall after.',
    },
    {
      id: 'parasocial-1956',
      title: 'Mass communication and para-social interaction: observations on intimacy at a distance',
      url: 'https://doi.org/10.1080/00332747.1956.11023049',
      publisher: 'Psychiatry (Horton and Wohl)',
      date: '1956',
      note: 'CLAIMS R10.',
    },
    {
      id: 'dca-endorsements',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS 5.7/E26: disclose material connections with "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS 5.8: factual claims "should be capable of substantiation".',
    },
  ],

  related: ['what-is-vox-pop-content', 'vox-pop-strategy-for-indian-brands', 'street-interview-hooks', 'how-to-edit-vox-pop-videos'],
};

export default post;
