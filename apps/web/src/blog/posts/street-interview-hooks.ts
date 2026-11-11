import type { Post } from '../types';
import meta from './street-interview-hooks.meta';

const post: Post = {
  meta,

  answer: `A street interview hook is the first two or three seconds of a vox pop video: the most charged answer, a telling pause, or a line that raises a question viewers want answered. Nobody can script it. At Kreators.Army, editors find the hook in real footage, then choose where the video starts and what the first caption says.`,

  takeaways: [
    `A street interview hook comes from the footage. You choose where the video starts, where it cuts and what the caption says.`,
    `Open just before the payoff: mid-answer, on a pause, on a doubt. An opening that hands over the answer gives viewers no reason to stay.`,
    `Every hook makes a promise. If the payoff isn't on tape, don't tease it. Bait that never pays off costs more trust than it earns.`,
    `Test hooks by cutting two or three openings of one clip and showing each to strangers. Compare how many stayed past the opening, not total views.`,
    `Never stage a pause, a doubt or a contradiction, and never invent a count. If it didn't happen on the street, it can't open the video.`,
  ],

  body: [
    `We think the best hook in a street interview is found, not written. A creator talking to camera can draft their first line the night before. A street team can't, because the first line belongs to a stranger. It's already somewhere in the footage: a laugh, a long pause, a flat "ye sab marketing hai" (it's all marketing).`,

    `That changes how you use a hook list. The usual formulas, like "Stop scrolling if you…", are lines for a creator to say. Street footage gives you nothing to say. It gives you choices: the second the video starts on, where the cuts fall, what the first caption reads. Each hook below comes with a sample script, an edit note, where it works and when to skip it.`,

    `Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. We wrote this for the editors and social teams who sit with that footage after the shoot.`,

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: `A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea. More in [what vox pop content is](/blog/what-is-vox-pop-content).`,
    },

    // ---------------------------------------------------------------- What makes a hook work
    { type: 'h2', id: 'what-makes-a-hook-work', text: 'What makes a street interview hook work?', toc: 'What makes a hook work' },

    `A street interview hook works when its first two or three seconds raise a question the viewer wants closed, using something only unscripted footage has. It fails when it hands over the answer before anyone has a reason to stay.`,

    {
      type: 'definition',
      id: 'street-interview-hook',
      term: 'Street interview hook',
      text: `A street interview hook is the opening beat of a vox pop video, picked from real footage to raise a question the rest of the video answers. It can be a line, a pause, a gesture or a question on screen.`,
    },

    `Think of the edit in three parts: hook, reaction, payoff. The hook is the first job and the hardest. Play back every answer from the shoot and mark each moment that made you react: a laugh, a wince, a "wait, what?". The strongest one is rarely the most articulate answer, and almost never the one that praises the product.`,

    `The platforms point the same way. YouTube reports a Shorts figure called "stayed to watch": how often viewers [kept watching past the opening seconds](https://support.google.com/youtube/answer/12220281)[^yt-stayed-to-watch]. Instagram's head, Adam Mosseri, has said its [top ranking signals are watch time, likes and sends](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/)[^mosseri-signals]. Neither says what to open with. But a viewer who swipes away early adds no watch time and sends nothing.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'Not every pause is unnecessary',
      text: `On our own edit list, strong opening moments come first. Cutting unnecessary pauses comes second, and the word doing the work there is _unnecessary_. Some pauses are the hook.`,
    },

    `Closing the loop too fast is the mistake to watch for. The best answer goes first, and the next forty seconds explain what the viewer already knows. The fix is to open just before the payoff. That's why so many hooks below are a kind of [cold open](/blog/vox-pop-glossary#cold-open): the video starts after the story has begun.`,

    `You'll often hear this pinned on the Zeigarnik effect. Bluma Zeigarnik's 1927 study in Berlin is real, but [a 2025 meta-analysis](https://doi.org/10.1057/s41599-025-05000-w) found no memory advantage for unfinished tasks, only a tendency to go back and finish them[^zeigarnik-meta]. So treat open loops as an editing habit that often works, and nothing grander. [Why vox pops work](/blog/psychology-of-vox-pop) covers the research properly.`,

    `Most hook advice is written for creators who speak to camera. Street footage turns a lot of it upside down.`,

    {
      type: 'table',
      caption: 'Talking-head hooks vs street interview hooks',
      head: ['Question', 'Talking-head hook', 'Street interview hook'],
      rows: [
        ['Who writes the first line?', 'The creator, before filming', 'A stranger, during the shoot'],
        ['When is it decided?', 'In the script', 'In the edit, from real footage'],
        ['What makes it believable?', 'Delivery and production', 'A pause or a doubt nobody planned'],
        ['What can you change later?', 'Anything, with a reshoot', 'Order, cut point, caption and pace'],
        ['Biggest risk', 'Sounding like an ad', 'Teasing a payoff you never filmed'],
      ],
      rowHeaders: true,
    },

    `The last column is the whole method.`,

    `You can't write a better line for a stranger. You can choose a better second to start on. Here's one clip cut two ways.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'setup-first-or-answer-first',
      props: {
        title: 'Setup first or answer first: the same clip, two openings',
        before: {
          label: 'Setup first',
          text: `The host explains the topic, asks the question, and the first answer lands around the sixth second. The viewer waits that long for anything to happen.`,
          points: [
            `0 to 2 s: host to camera, "We asked people about work messages on Sundays."`,
            `2 to 4 s: the question, asked to a participant on the footpath.`,
            `4 to 6 s: the participant thinks.`,
            `6 s: "I replied to one at my cousin's wedding."`,
          ],
        },
        after: {
          label: 'Answer first',
          text: `The strongest line opens the video, and the question arrives as text while the viewer is still reacting to it.`,
          points: [
            `0 s: "I replied to one at my cousin's wedding."`,
            `1 s: on-screen text, "Do you reply to work messages on a Sunday?"`,
            `2 to 4 s: a second participant, "Never. Sunday is mine."`,
            `Then the rest of the answers, and the payoff.`,
          ],
        },
        note: `Same footage, same people. Only the order changed.`,
      },
    },

    {
      type: 'video',
      brand: 'CircleStore',
      title: '42 Circlestore - Pitch To Win 25-04',
      caption: `A challenge, going by its title: pitch to win. When the rules fit in three words, opening on the setup costs almost nothing.`,
    },

    // ---------------------------------------------------------------- At a glance
    { type: 'h2', id: 'all-15-hooks', text: 'Which of the 15 hooks should you try first?', toc: 'All 15 hooks at a glance' },

    `Try the one your footage already has. If you can't tell, start with the mid-answer cold open and the contrast pair: almost every shoot gives you a half-finished story and two people who disagree.`,

    `After that, pick by the job. Curiosity hooks raise a question, and debate hooks set two answers against each other. Trust hooks show a doubt viewers recognise. Share hooks hand the viewer someone to send the video to. Filter the table by goal, or search it for a word.`,

    {
      type: 'table',
      caption: 'The 15 street interview hooks, by goal',
      head: ['Hook', 'Goal', 'Line or move to copy', 'Edit note'],
      rows: [
        ['1. Mid-answer cold open', 'Curiosity', '"…and I still had them on my wedding day."', 'Cut in on a word with weight, not a breath.'],
        ['2. Open-loop line', 'Curiosity', '"I almost sent them back."', 'Hold the reason back, then pay it off at the end.'],
        ['3. Pause before the answer', 'Trust', 'Three seconds of silence after a hard question.', 'Question on screen, room sound, no music.'],
        ['4. Half-second before they speak', 'Trust', 'They pull their phone close before saying a word.', 'Start one beat before the gesture.'],
        ["5. Sceptic's line", 'Trust', '"Ye sab marketing hai."', 'Let the doubt land before anything answers it.'],
        ['6. Their exact words as caption', 'Trust', '"Face wash, if I remember. Then phone."', 'Quote word for word, Hinglish and all.'],
        ['7. Caption written to one person', 'Shares', '"Send this to the friend who buys everything second-hand."', 'Name the friend, not the product.'],
        ['8. Question that stays on screen', 'Curiosity', '"Would you date someone who hates chai?"', 'Keep it visible until the payoff.'],
        ['9. Contrast pair', 'Debate', '"Never. Sunday is mine." Then: "I replied at my cousin\'s wedding."', 'No gap between the two answers.'],
        ['10. Guess-along', 'Curiosity', '"Your guess?"', 'Hold a beat so viewers commit first.'],
        ['11. Warm-up as the hook', 'Trust', '"If your shoes could talk, what would they complain about?"', 'Open on the laugh only if the real answer follows fast.'],
        ['12. Taboo question card', 'Debate', '"How does your salary feel compared to where you thought you\'d be?"', 'About a second of card, then a face.'],
        ['13. We asked (number) people in (place)', 'Debate', '"We asked (the real number) people near (where you shot) one thing."', 'Real counts only, or no number.'],
        ['14. Correction moment', 'Trust', '"No, no. It\'s more that…"', 'Start on the correction, not the wrong summary.'],
        ['15. Contradiction caught live', 'Debate', '"The cheapest one on the app. Oh no."', 'Open on the crack, then label the rewind.'],
      ],
      rowHeaders: true,
      search: true,
      filterColumn: 1,
      copyColumn: 2,
    },

    `Notice how few of these are lines anyone wrote. Most are moments: a silence, a gesture, a correction. The host makes room for them on the day. The editor finds them later.`,

    // ---------------------------------------------------------------- Hooks 1 to 4
    { type: 'h2', id: 'start-inside-the-moment', text: 'Where should the first frame land?', toc: 'Hooks 1 to 4: start inside the moment' },

    `Just before the payoff. Start inside an answer, on a line that opens a loop, on the silence after a hard question, or on the half-second when someone's body answers before their mouth does.`,

    { type: 'h3', id: 'mid-answer-cold-open', text: '1. The mid-answer cold open' },

    `Start the video in the middle of a sentence. The viewer lands inside a story that's already moving and has to catch up, and catching up is a reason to stay. The skill is picking a sentence that still makes sense from its middle.`,

    {
      type: 'script',
      id: 'script-cold-open',
      title: 'A mid-answer cold open',
      context: `An illustration, not a real shoot. A sneaker brand asks: "What's the longest you've kept one pair of shoes?"`,
      lines: [
        { direction: 'In the raw clip, the question was asked twenty seconds earlier and the participant has been warming up.' },
        { speaker: 'Participant', text: `…and I still had them on my wedding day. My mother tried to throw them out twice.` },
        { direction: 'The edit starts on "and I still had them". The question fades in as text a second later.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Cut in on a word with weight, never on a breath or an "um". Start mid-gesture, so it feels as if the viewer joined late. Bring the question in as text within a second or two.`,
        `**Best for.** Personal-experience questions, where answers arrive as small stories.`,
        `**Avoid when.** The sentence needs its start to make sense. A confused viewer doesn't wait to find out.`,
      ],
    },

    { type: 'h3', id: 'open-loop-line', text: '2. The open-loop line' },

    `Open on a line that raises a who, a why or a what-happened, and hold the answer back. "I almost sent them back" does it in five words. The viewer now wants to know why, and what changed their mind. We plan the sequence in four moves. It's the only acronym we'll ask you to remember.`,

    {
      type: 'framework',
      id: 'open-sequence',
      name: 'OPEN',
      tagline: 'The open-loop sequence, in four moves',
      parts: [
        { key: 'O', name: 'Open with tension', text: `Start on the unresolved line, not the product or the brand: "I almost sent them back."` },
        { key: 'P', name: 'Push deeper first', text: `Cut to an answer that adds tension instead of settling it: "Honestly? I get why people return these."` },
        { key: 'E', name: 'Extend with a second thread', text: `Add a second open question: "The first week, they felt like bricks." Now two things need answering.` },
        { key: 'N', name: 'Never close early', text: `Hold the payoff for the end, then close it properly: "Now they're the only pair I wear."` },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Every line must come from the footage, and each payoff must belong to the person who opened the loop. Moving their payoff to the end is editing. Giving it to someone else is fiction.`,
        `**Best for.** Product stories with a turn in them: doubt first, then use.`,
        `**Avoid when.** The payoff isn't on tape. A loop you can't close is bait.`,
      ],
    },

    `The Hackdaily video at the top of this page shows how little a loop needs. Its title is "Seven Freaking Hours", and you want to know: seven hours of what? Three words, and the question is open.`,

    { type: 'h3', id: 'pause-before-the-answer', text: '3. The pause before the answer' },

    `Someone hears the question, goes quiet for three seconds, then says, "Actually, I've never thought about it that way." The usual edit keeps the line and cuts the silence.`,

    `We'd keep the silence. It tells the viewer the question hit something real, and the line then tells them what.`,

    `On the street, the host makes room for it. The urge is to fill the quiet with the next question. Don't. Repeat their last few words and wait. Our [street interview techniques guide](/blog/street-interview-techniques) covers how to hold a silence.`,

    {
      type: 'script',
      id: 'script-pause',
      title: 'The pause as the opening',
      context: `An illustration. A chocolate brand asks: "When did you last buy something just for yourself?"`,
      lines: [
        { speaker: 'Host', text: 'When did you last buy something just for yourself?' },
        { direction: 'Three seconds of silence. The participant looks down at the footpath, then laughs.' },
        { speaker: 'Participant', text: `Actually… I don't think I have. Not this year.` },
        { direction: 'The edit opens on the first second of silence, with the question already on screen.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Open at the start of the pause with the question on screen, so viewers know what's being weighed. Keep the room sound and leave music out. A jump cut inside a long pause is fine. Inventing a pause is not.`,
        `**Best for.** Reflective questions about money or time.`,
        `**Avoid when.** The pause is confusion about the question, or the person looks upset rather than thoughtful.`,
      ],
    },

    { type: 'h3', id: 'half-second-before-they-speak', text: '4. The half-second before they speak' },

    `Before the words, the body answers. Weight shifts, arms fold, a grin starts, someone pulls their bag closer. Edit from that half-second and the viewer reads the answer before they hear it.`,

    `Treat it as craft. A gesture tells you a question landed. It doesn't tell you whether the answer is true, and nobody should claim it does.`,

    {
      type: 'script',
      id: 'script-body-first',
      title: 'The body answers first',
      context: 'An illustration. A phone accessories brand asks an A/B question.',
      lines: [
        { speaker: 'Host', text: 'Phone or wallet. Which one would you rather lose today?' },
        { direction: 'Before a word, the participant pulls their phone to their chest.' },
        { speaker: 'Participant', text: 'Wallet. Obviously the wallet.' },
        { direction: 'The edit opens one beat before the clutch, so the words land as the payoff to a gesture viewers already read.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Brief the camera operator to go tight whenever someone shifts. In the edit, start one beat before the movement and caption the question, because the opening has no words.`,
        `**Best for.** A/B and taboo questions, where the body often reacts first.`,
        `**Avoid when.** The gesture could embarrass them, or the frame is too wide to read on a phone.`,
      ],
    },

    // ---------------------------------------------------------------- Hooks 5 to 7
    { type: 'h2', id: 'their-words', text: 'Which words should open the video?', toc: 'Hooks 5 to 7: their words' },

    `Theirs, exactly as they said them. Doubt, slang and half-finished sentences sound real because they are. A line your copywriter wrote sounds like an ad, however good it is.`,

    { type: 'h3', id: 'sceptics-line', text: "5. The sceptic's line" },

    `Ask about your category's big claims and sooner or later someone says it: "Ye sab marketing hai." The instinct is to cut it, because it sounds bad for the brand.`,

    `We'd open on it.`,

    `Plenty of viewers are thinking the same thing, and hearing a stranger say it out loud lowers their guard.`,

    `The doubt has numbers behind it. In [PwC's 2024 survey of Indian shoppers](https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html), 77% said they discover new brands on social media and 81% check reviews there, yet it was their least-trusted channel[^pwc-voice-2024]. People shop on the feed and doubt it at the same time. A sceptic on screen says the doubt for them.`,

    {
      type: 'script',
      id: 'script-sceptic',
      title: "Opening on the sceptic's line",
      context: 'An illustration. A perfume brand asks about a word every brand uses.',
      lines: [
        { speaker: 'Host', text: 'When a brand calls itself premium, what do you think?' },
        { speaker: 'Participant', text: 'Ye sab marketing hai. Everyone says premium.' },
        { direction: 'Open here. Then cut to the same person trying the product.' },
        { speaker: 'Host', text: `Fair. Smell this one and tell me if it's marketing.` },
        { speaker: 'Participant', text: `Okay. This one I'd actually wear.` },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Let the doubt land in full before anything answers it. If the sceptic doesn't come round, you still have a video: run it as a debate. Never trim a "but" so that doubt sounds like praise.`,
        `**Best for.** Categories crowded with big words: premium, handmade, small-batch, artisanal.`,
        `**Avoid when.** The doubt is about safety or health. A street reaction can't answer that, and shouldn't try.`,
      ],
    },

    { type: 'h3', id: 'exact-words-as-caption', text: '6. Their exact words as the caption' },

    `Put a participant's phrase in the on-screen text, word for word. Think of how a kirana (neighbourhood grocery) store owner talks to regulars: in their language, never a brochure's. A brand line reads like a brand. A stranger's half-sentence reads like a friend.`,

    {
      type: 'script',
      id: 'script-exact-words',
      title: 'Their words, on screen',
      context: 'An illustration. A skincare brand asks about a nightly habit.',
      lines: [
        { speaker: 'Host', text: 'What does your skincare routine actually look like at 11 pm?' },
        { speaker: 'Participant', text: 'Honestly? Face wash, if I remember. Then phone.' },
        { direction: 'First frame, on-screen text: "Face wash, if I remember. Then phone." The participant says it as the text appears.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Quote it exactly, in quotation marks, while the speaker is on screen. Don't fix the grammar or turn Hinglish into brand English. Add a subtitle underneath if some viewers need a translation.`,
        `**Best for.** Habit questions, and ads that need a first line people believe.`,
        `**Avoid when.** The phrase only works in their tone of voice, or could embarrass them out of context.`,
      ],
    },

    { type: 'h3', id: 'caption-to-one-person', text: '7. A caption written to one person' },

    `Write the first caption as if it were a WhatsApp message to one friend. "Our new street interview about second-hand buying" goes nowhere. "Send this to the friend who buys everything second-hand" hands the viewer someone to send it to.`,

    `Sends are one of the three signals Instagram's head says matter most[^mosseri-signals]. A caption that names a friend is an open invitation to send.`,

    {
      type: 'script',
      id: 'script-one-person',
      title: 'Two captions over the same answers',
      context: `An illustration. A resale brand asks: "What would you never buy second-hand?"`,
      lines: [
        { direction: 'Three quick answers play under the caption.' },
        { speaker: 'Caption A', text: 'Our new street interview on second-hand buying.' },
        { speaker: 'Caption B', text: 'Send this to the friend who buys everything second-hand.' },
        { speaker: 'Participant', text: 'A mattress. Never. Anything else, fine.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Name the kind of friend, not the product. Keep the caption up for the first two seconds, over the strongest answer. Before posting, ask who you'd send it to. If you can't name them, rewrite it.`,
        `**Best for.** Everyday habits and light debates people already have with friends.`,
        `**Avoid when.** The "friend" is a target. Nothing about looks, money troubles, caste, religion, region or gender. Teasing is fine. Punching down isn't.`,
      ],
    },

    // ---------------------------------------------------------------- Hooks 8 to 10
    { type: 'h2', id: 'play-along', text: 'How do you get viewers playing along?', toc: 'Hooks 8 to 10: play along' },

    `Give them a job in the first second: hold a question, pick a side or make a guess. A viewer with a stake in the answer has a reason to stay for it.`,

    `These three map onto mechanisms we plan around anyway: guessing and reveals, A/B comparisons, debates and audience participation. [Eleven ways to vary a vox pop batch](/blog/eleven-ways-to-vary-a-vox-pop-batch) shows how to rotate them.`,

    { type: 'h3', id: 'question-on-screen', text: '8. The question that stays on screen' },

    `Put the question on screen in the first second and leave it there until the payoff. With the question in view, viewers keep checking how close they are to an answer. Without it, they forget what they were waiting for.`,

    {
      type: 'script',
      id: 'script-question-on-screen',
      title: 'One question, held on screen',
      context: 'An illustration. A chai brand runs a fast A/B round.',
      lines: [
        { speaker: 'On-screen text, whole video', text: 'Would you date someone who hates chai?' },
        { speaker: 'Participant 1', text: 'No. Red flag.' },
        { speaker: 'Participant 2', text: 'Depends. Do they at least like coffee?' },
        { speaker: 'Participant 3', text: 'I would marry them. More chai for me.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Place the text in the top third, clear of subtitles and the platform's buttons, and short enough to read in one glance. If an answer reframes the question, let the text change with it.`,
        `**Best for.** A/B and opinion questions with lots of short answers.`,
        `**Avoid when.** The question is long or needs explaining. Open on an answer and bring the question in a second later.`,
      ],
    },

    { type: 'h3', id: 'contrast-pair', text: '9. The contrast pair' },

    `Open on two answers that clash, back to back. Someone who has it all worked out, then someone still searching. The viewer stops watching an interview and starts comparing. The quiet question is which one they are.`,

    {
      type: 'script',
      id: 'script-contrast-pair',
      title: 'Two answers, no gap',
      context: `An illustration. A workwear brand asks: "Do you reply to work messages on a Sunday?"`,
      lines: [
        { speaker: 'Participant 1', text: 'Never. Sunday is mine.' },
        { direction: 'Hard cut. No breath, no host.' },
        { speaker: 'Participant 2', text: `I replied to one at my cousin's wedding.` },
        { direction: 'The question appears as text from the second answer onwards.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Cut with no gap, because the clash is the hook. Match framing and volume so nothing distracts from the difference. Two answers make the hook. A third can come later as the tiebreak.`,
        `**Best for.** Debates and opposing opinions.`,
        `**Avoid when.** One side is set up as the fool. A contrast works when both answers sound reasonable.`,
      ],
    },

    { type: 'h3', id: 'guess-along', text: '10. The guess-along' },

    `Ask something the viewer can answer too: a price, a smell, a taste, where a thing was made. Show the person guessing before the reveal, and the viewer guesses with them. Now they have to stay to check.`,

    `Finish what you start. Norton, Mochon and Ariely found that people who assembled an IKEA box [would pay more for it than for an identical ready-made one](https://doi.org/10.1016/j.jcps.2011.08.002), but only if they finished it[^ikea-effect]. Give viewers a small job, then let them complete it.`,

    `So always show the reveal, even when the guess was way off.`,

    {
      type: 'video',
      brand: 'Hackdaily',
      title: '29 Hackdaily - Guessed It Exactly',
      caption: `A guessing format, going by its title: someone "guessed it exactly". Before you press play, you already want to know what they guessed.`,
    },

    {
      type: 'script',
      id: 'script-guess-along',
      title: 'A guess the viewer makes too',
      context: 'An illustration. A home decor brand runs a price guess.',
      lines: [
        { speaker: 'Host', text: 'Guess the price. No googling.' },
        { direction: 'The product at chest height. On-screen text: "Your guess?" Hold it for a beat.' },
        { speaker: 'Participant', text: 'Cheap. No, wait. Expensive. Very expensive.' },
        { direction: `The reveal comes last, with the participant's reaction.` },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Put "Your guess?" on screen and hold a beat before the participant answers, so viewers commit first. Keep the answer out of the caption and the cover frame.`,
        `**Best for.** Guessing and reveals: price, smell, taste, where something comes from.`,
        `**Avoid when.** The reveal is flat, or the answer can't be shown clearly on screen.`,
      ],
    },

    // ---------------------------------------------------------------- Hooks 11 to 13
    { type: 'h2', id: 'the-setup-as-hook', text: 'Can the way you asked be the hook?', toc: 'Hooks 11 to 13: the setup' },

    `Yes. Sometimes the strongest opening is the setup itself: a silly warm-up, a question card people wouldn't say aloud, or an honest count of who you asked. For the questions themselves, start with our [bank of vox pop questions](/blog/vox-pop-questions).`,

    { type: 'h3', id: 'warm-up-as-hook', text: '11. The warm-up as the hook' },

    `Before the real question, the host asks a silly, low-stakes version of it. People laugh and stop performing for the camera. Then the real question gets a real answer, and the warm-up often hands you the best opening as well.`,

    {
      type: 'script',
      id: 'script-warm-up',
      title: 'A warm-up that opens the video',
      context: 'An illustration. A footwear brand warms up before asking how often people replace their shoes.',
      lines: [
        { speaker: 'Host', text: 'Serious question. If your shoes could talk, what would they complain about?' },
        { direction: 'The participant laughs.' },
        { speaker: 'Participant', text: 'That I never wash them. And the rain. Mostly the rain.' },
        { speaker: 'Host', text: 'Okay, real question. How long before you replace a pair?' },
        { speaker: 'Participant', text: 'When my toe comes out. Not before.' },
        { direction: 'The edit opens on the laugh, then cuts straight to the real answer.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Roll the camera from the warm-up. Open on the laugh only if the real answer follows within a few seconds, or it turns into a blooper reel. One warm-up beat, never three.`,
        `**Best for.** Categories that feel dull to talk about: socks, storage boxes, cleaning products, umbrellas.`,
        `**Avoid when.** The joke is at the participant's expense, or the warm-up has nothing to do with the real question.`,
      ],
    },

    { type: 'h3', id: 'taboo-question-card', text: '12. The taboo question card' },

    `Open on a plain text card carrying the question people don't ask out loud. Money is the classic. Most of us talk about it carefully, if at all, so a stranger answering honestly is hard to scroll past.`,

    {
      type: 'script',
      id: 'script-taboo-card',
      title: 'A question card, then a face',
      context: 'An illustration. A personal finance app shows the question as a card.',
      lines: [
        { speaker: 'On-screen card', text: `How does your salary feel compared to where you thought you'd be by now?` },
        { direction: 'About a second of card. Cut to the first answer, mid-laugh.' },
        { speaker: 'Participant', text: 'Like the trailer for a film that never released.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Hold the card long enough to read once, then cut to a face. Use the question exactly as it was asked on the street.`,
        `**Best for.** Money, careers and other topics people have opinions on but rarely voice.`,
        `**Avoid when.** The answer is someone's real pain. Let people skip the question, and never show an amount someone didn't agree to share.`,
      ],
    },

    { type: 'h3', id: 'we-asked-people', text: '13. "We asked [number] people in [place]"' },

    `A count and a place make an opening sound like news. "We asked people near a Bengaluru metro exit one question" is specific enough to feel real. The rule that keeps it honest: the number is the real count from the shoot, or there's no number.`,

    `Be careful what a count implies, because a street interview isn't a survey. Even TV news rarely says so. Kathleen Beckers of the University of Antwerp studied 2,000 vox pops from Flemish TV news and found journalists [hardly ever told viewers the interviewees might not represent everyone](https://doi.org/10.1080/17512786.2016.1223551)[^tv-vox-pops]. A caption that says "we asked" is safer than one that says "people think".`,

    {
      type: 'script',
      id: 'script-we-asked',
      title: 'A count you can stand behind',
      context: 'A template. Fill the brackets with what really happened on the day.',
      lines: [
        { speaker: 'On-screen text', text: 'We asked [the real number] people near [where you really filmed] one thing.' },
        { speaker: 'Host', text: `Have you ever used your sibling's face wash without asking?` },
        { direction: 'The first answer lands within a second of the text.' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Count everyone you asked on camera, including the ones you didn't use. Never add a tally such as "most said yes" unless you counted on the day. Name only the place you really filmed.`,
        `**Best for.** Yes-or-no questions with a split you can count honestly.`,
        `**Avoid when.** The sample was tiny or hand-picked and the wording makes it sound like research.`,
      ],
    },

    // ---------------------------------------------------------------- Hooks 14 and 15
    { type: 'h2', id: 'after-the-follow-up', text: 'Which hooks only happen after a follow-up?', toc: 'Hooks 14 and 15: after the follow-up' },

    `The correction and the contradiction. Both come after the first answer, and both need a host who keeps listening instead of moving on to the next person.`,

    { type: 'h3', id: 'correction-moment', text: '14. The correction moment' },

    `People often say more when they're fixing a misunderstanding than when they're answering a question. Correcting feels safe. Answering can feel like a test. So the host sums up the answer slightly wrong, and the participant leans in: "No, no. It's more that…" That lean-in is the hook.`,

    {
      type: 'script',
      id: 'script-correction',
      title: 'A wrong summary, put right',
      context: 'An illustration. A bag brand asks what people look for in a work bag.',
      lines: [
        { speaker: 'Host', text: 'What do you look for in a work bag?' },
        { speaker: 'Participant', text: 'Something that looks decent, I guess.' },
        { speaker: 'Host', text: `So it's mostly about looking good.` },
        { speaker: 'Participant', text: `No, no. It's that I can find my keys in it. Every morning I'm digging.` },
        { direction: `The edit opens on "No, no", with the host's summary as on-screen text.` },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Start on the correction, not on the host's wrong summary, and caption the summary if viewers need it. Keep the lean-in and the hand gesture that usually comes with it.`,
        `**Best for.** Finding out why people really buy, in their own words.`,
        `**Avoid when.** The misreading could feel like mockery, or the host nudged the person towards an answer they didn't mean.`,
      ],
    },

    { type: 'h3', id: 'contradiction-caught-live', text: '15. The contradiction caught live' },

    `Someone says they only buy quality, and two answers later admits they bought the cheapest one on the app. Sometimes they catch it themselves, with a look or a laugh. Start right on that crack. Don't cut to them recovering.`,

    `Leon Festinger called the discomfort [cognitive dissonance](https://doi.org/10.1037/h0041593): when what we do clashes with what we believe, we feel pushed to change one of them[^dissonance]. Most viewers have a gap like that of their own, and we think that's why the moment holds. They laugh with the person on screen, and a little at themselves.`,

    {
      type: 'script',
      id: 'script-contradiction',
      title: 'The crack, then the rewind',
      context: 'An illustration. A home goods brand asks about buying habits.',
      lines: [
        { speaker: 'Participant', text: `I only buy quality. I don't compromise.` },
        { speaker: 'Host', text: 'What did you buy last?' },
        { speaker: 'Participant', text: 'The cheapest one on the app. Oh no.' },
        { direction: 'They laugh. The edit opens on "Oh no", then rewinds to the claim with an on-screen label: "A minute earlier".' },
      ],
    },

    {
      type: 'list',
      items: [
        `**Edit note.** Open on the crack, then rewind to the claim and label the rewind honestly. Keep their laugh: it tells viewers the person is in on the joke.`,
        `**Best for.** Habits against ideals: spending, screen time, sleep, saving.`,
        `**Avoid when.** They look embarrassed rather than amused. If the laugh isn't theirs, drop the clip.`,
      ],
    },

    `Test your eye before the next part. Each question shows two ways to open the same imagined footage.`,

    {
      type: 'widget',
      widget: 'quiz',
      id: 'which-opening',
      props: {
        title: 'Which opening would you keep?',
        intro: 'Five pairs of openings. Pick the one you would post.',
        questions: [
          {
            q: `Someone goes quiet for three seconds, then says, "Actually, I've never thought about it." Where do you start?`,
            options: [
              { text: 'On the line itself', points: 0, why: 'You lose the part that makes the line believable. The silence shows the question landed.' },
              { text: 'On the silence, with the question on screen', points: 1, why: 'Yes. The pause raises the question and the line answers it a beat later.' },
            ],
          },
          {
            q: `A shopper says "Ye sab marketing hai", then likes the product a minute later. Which opening?`,
            options: [
              { text: 'The doubt', points: 1, why: 'Yes. Viewers who share the doubt stay to see whether it survives.' },
              { text: 'The moment they like it', points: 0, why: 'That gives away the ending. Without the doubt, the praise looks like any testimonial.' },
            ],
          },
          {
            q: 'A price-guessing clip. Which first caption?',
            options: [
              { text: '"They guessed it exactly."', points: 0, why: 'It spoils the reveal before the viewer has made a guess.' },
              { text: '"Your guess?"', points: 1, why: 'Yes. The viewer commits to a number and stays to check it.' },
            ],
          },
          {
            q: 'Two answers clash about Sunday work messages. Which opening?',
            options: [
              { text: 'The host explaining the topic, then both answers', points: 0, why: 'The clash arrives late, and the setup is the slowest part of the clip.' },
              { text: 'Both answers back to back, with the question as text', points: 1, why: 'Yes. The clash is the hook, so it goes first.' },
            ],
          },
          {
            q: 'You asked nine people on camera. Which caption?',
            options: [
              { text: '"We asked 50 people and the answers shocked everyone."', points: 0, why: 'An invented count and an invented reaction. If anyone checks, the brand pays.' },
              { text: '"We asked nine people near the metro one question."', points: 1, why: 'Yes, as long as it is true. A real count sounds like news because it is.' },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Watch for the moment before', text: 'Most of these come down to one habit: open just before the payoff, not on it. Reread hooks 1 to 4 and try again.' },
          { min: 3, title: 'A good eye', text: `You're choosing openings that raise a question. Next, test two of them on the same clip.` },
          { min: 5, title: 'Five for five', text: 'You picked every opening we would. Try the test planner below on your next batch.' },
        ],
      },
    },

    // ---------------------------------------------------------------- Captions
    { type: 'h2', id: 'captions-that-tease', text: 'Which captions tease the next beat?', toc: 'Captions that tease' },

    `Captions that tease name what's coming without giving it away. "Wait for the one in the blue kurta" gives viewers someone to watch for. "People talk about savings" only describes what they can already see.`,

    `On-screen text is part of the hook, and for anyone watching on mute it is the hook. So write about the next beat.`,

    {
      type: 'table',
      caption: 'Captions that describe vs captions that tease',
      head: ['Describes the frame', 'Teases the next beat'],
      rows: [
        ['"People share their Sunday habits"', '"The third answer is the one we all lie about"'],
        ['"Guess the price challenge"', '"One of them gets uncomfortably close"'],
        ['"Street interview on first jobs"', '"They laughed. Then they didn\'t."'],
        ['"Asking people about skincare"', '"The last answer surprised even them"'],
        ['"Our new vox pop about chai"', '"Send this to whoever makes chai at 2 am"'],
      ],
    },

    `Every tease is a promise, so only write one the clip keeps. If the last answer isn't surprising, "the last answer surprised even them" is a small lie, and anyone who stays to the end will know.`,

    `One more move belongs at the end: the callback. Bring back a word from the opening. If the first participant said new shoes felt like bricks, the final caption can read "Not bricks any more." Keep it to one callback per video. Two starts to feel like a trick.`,

    {
      type: 'list',
      items: [
        `**One glance.** If a caption needs reading twice, cut it down.`,
        `**Exact quotes.** Quotation marks only for words someone really said.`,
        `**Their language.** Hinglish included, not the brand's house style.`,
      ],
    },

    // ---------------------------------------------------------------- Testing
    { type: 'h2', id: 'how-to-test-hooks', text: 'How do you test which hook works?', toc: 'How to test hooks' },

    `Cut two or three openings from the same clip, keep everything after them identical, and show each to people who don't follow you. Then compare how many stayed past the opening, not total views.`,

    `Instagram's [Trial Reels](https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/) show a reel to non-followers before your followers see it, and in 2025 Instagram opened them to public accounts with 1,000 or more followers[^trial-reels]. Strangers judge the hook cold. On YouTube Shorts, the "stayed to watch" figure in your analytics does the same job for the opening[^yt-stayed-to-watch].`,

    {
      type: 'steps',
      id: 'test-three-hooks',
      title: 'Test three hooks on one clip',
      howTo: true,
      supplies: ['One finished vox pop clip', 'Three cuts of its opening', 'An Instagram or YouTube account'],
      steps: [
        { name: 'Pick a clip with a real payoff', text: 'Choose a video whose ending justifies a tease. Testing hooks on a weak clip only tells you which opening fails more slowly.' },
        { name: 'Cut three openings', text: 'Make three versions that differ only in the first two or three seconds: say, the cold open, the pause and the question card.' },
        { name: 'Keep everything else identical', text: `Same length, music, captions and cover frame after the opening. Change one thing, or you won't know what made the difference.` },
        { name: 'Show each cut to strangers', text: 'Post them as Trial Reels, or as separate Shorts at similar times on similar days. Followers already like you, which makes them a poor test.' },
        { name: 'Compare the early hold', text: 'Note how many viewers stayed past the opening on each cut, and put the figures in the planner below. Ignore total views for now.' },
        { name: 'Read the comments for words', text: 'Write down the phrases people repeat. They often make the next caption, or the next question.' },
        { name: 'Log the winner by type', text: `Record which hook type won, and for which kind of question. After a few batches you'll have your own pattern, which beats any list, this one included.` },
      ],
    },

    `The planner names the opening that held best and turns its lead into people, which makes a small lead easier to judge.`,

    {
      type: 'widget',
      widget: 'calculator',
      id: 'hook-test-planner',
      props: {
        title: 'Hook test planner',
        intro: 'Replace the sample figures with your own: the share of viewers who stayed past the opening for each cut, and the plays on your smallest test.',
        inputs: [
          { key: 'holdOne', label: 'Opening 1: stayed past the opening', default: 40, min: 0, max: 100, step: 1, unit: '%' },
          { key: 'holdTwo', label: 'Opening 2: stayed past the opening', default: 50, min: 0, max: 100, step: 1, unit: '%' },
          { key: 'holdThree', label: 'Opening 3: stayed past the opening', default: 45, min: 0, max: 100, step: 1, unit: '%' },
          { key: 'plays', label: 'Plays on your smallest test', default: 500, min: 10, max: 1000000, step: 10, unit: 'plays' },
        ],
        outputs: [
          { key: 'best', label: 'Strongest hold', formula: 'max(holdOne, holdTwo, holdThree)', format: 'percent' },
          { key: 'leader', label: 'Opening that held best (a tie goes to the lower number)', formula: '1 + min(1, ceil(abs(holdOne - best))) * (1 + min(1, ceil(abs(holdTwo - best))))', format: 'number' },
          { key: 'lead', label: 'Lead over the runner-up', formula: 'best - (holdOne + holdTwo + holdThree - best - min(holdOne, holdTwo, holdThree))', format: 'number', unit: 'points' },
          { key: 'people', label: 'Extra people who stayed, on your smallest test', formula: 'round(plays * lead / 100)', format: 'number', unit: 'people' },
        ],
        disclaimer: 'Your own figures, for comparing your own cuts. A small lead on a small test is often noise, so run it again before you decide. Nothing here predicts how any video will perform.',
      },
    },

    `Check the people figure before you trust the percentages. On 500 plays, a two-point lead is ten people. That's too few to rebuild an edit around, so run the test again on the next batch.`,

    { type: 'cta', text: 'Want to see these hooks cut from footage of your own product? See the format on your own brand first. Scope, the number of trial videos and any fee are confirmed in writing.' },

    // ---------------------------------------------------------------- Backfire
    { type: 'h2', id: 'hooks-that-backfire', text: 'Which hooks backfire?', toc: 'Hooks that backfire' },

    `Hooks backfire when the video doesn't pay off what the opening promised, when a participant becomes the joke, or when a stranger's line is made to carry a claim the brand couldn't make itself.`,

    {
      type: 'list',
      items: [
        `**Bait with no payoff.** "The answers shocked everyone" over a run of polite answers. Viewers who stay feel tricked, and your next video starts with less goodwill.`,
        `**The participant as punchline.** A contrast or a contradiction works when viewers laugh with the person. Once it's at them, viewers take the stranger's side.`,
        `**Staged moments.** A pause you asked for, a planted sceptic, a rehearsed correction. If anyone on screen is paid, employed or cast, [India's endorsement guidelines](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) expect that to be disclosed clearly[^endorsement].`,
        `**Claims riding on a street answer.** India's advertising code expects factual claims to be [capable of substantiation](https://www.ascionline.in/the-asci-code-guidelines/)[^asci-code]. A stranger saying a product works proves nothing, so keep hooks about habits and feelings.`,
        `**Hype in the caption.** "Most shocking", "you won't believe". Real footage doesn't need either, and they make it look like everything else in the feed.`,
      ],
    },

    `Our own rule is plain. We don't script what strangers say, so we won't open a video on something that didn't happen. And we won't cut to a fixed length if that loses the context or payoff that makes the interaction work. Run this list before any hook goes out.`,

    {
      type: 'widget',
      widget: 'checklist',
      id: 'before-a-hook-goes-out',
      props: {
        title: 'Before a hook goes out',
        intro: 'Tick each one for the opening you plan to post. Your ticks stay in this browser.',
        items: [
          { id: 'happened', text: 'The first frame shows something that really happened on the street.', detail: 'If you moved it out of order, label the rewind on screen.' },
          { id: 'payoff', text: 'The video pays off what the hook promises, and the payoff is on tape.' },
          { id: 'verbatim', text: `Anything in quotation marks is the participant's exact words.` },
          { id: 'real-count', text: 'Any number on screen is the real count from the shoot.' },
          { id: 'nobody-mocked', text: 'Nobody in the opening is the butt of the joke.' },
          { id: 'no-claims', text: 'No health, safety or results claim rides on a street answer.' },
          { id: 'release', text: 'Everyone you feature signed a release that covers this use.', detail: 'Have a lawyer check your release. This is general information, not legal advice.' },
          { id: 'disclosed', text: 'Anyone paid, employed or cast is clearly disclosed.' },
        ],
        done: 'All clear. Post it, and log which hook you used.',
      },
    },

    // ---------------------------------------------------------------- Close
    { type: 'h2', id: 'start-with-your-footage', text: 'Where should you start with your own footage?', toc: 'Start with your footage' },

    `With one clip you already have. Here's how we'd hunt for its hook in the raw answers.`,

    {
      type: 'list',
      ordered: true,
      items: [
        `**Watch every answer once, at normal speed.** Note the timestamp each time you react: a laugh, a wince, a pause that runs long.`,
        `**Tag each mark with a hook from the table.** Pause, sceptic, clash, guess, correction. Some marks fit two.`,
        `**Watch the marks again on mute.** A moment that lands without sound can open the video. One that needs the words needs a caption too.`,
        `**Cut the two strongest as openings,** keep everything after them identical, and test them as above.`,
      ],
    },

    `To train your eye first, watch three videos in our [library of real street interviews](/video-library) with the sound off. Note the second you'd have started each one. Then do the same with your own footage.`,

    `One honest limit. We control the question, the setup, who we approach, the follow-up and the edit. We can't control exactly how a stranger responds in the moment. That's why hooks are found in the edit, never promised in advance.`,

    `[How to edit a vox pop video](/blog/how-to-edit-vox-pop-videos) picks up from here, with the reaction and payoff every hook sets up.`,
  ],

  faqs: [
    {
      q: 'How long should a video hook be?',
      a: `Usually two or three seconds: long enough for one beat, such as a line, a pause or a question card. YouTube's Shorts analytics track whether viewers stayed past the opening seconds[^yt-stayed-to-watch], which is the window a hook has to win. A street interview hook can run longer when viewers are already guessing along. If nothing has happened by the third second, cut tighter.`,
    },
    {
      q: 'What is a good hook for a reel?',
      a: `A good hook for a reel is a real moment that raises a question in the first seconds: an answer cut mid-sentence, a pause after a hard question, or two answers that clash. Instagram's head names watch time, likes and sends as the top ranking signals[^mosseri-signals], so a hook that makes someone think of a friend fits well. Pick it from the footage rather than writing it.`,
    },
    {
      q: 'Should the hook be the best answer?',
      a: `Not always. The best answer often works better as the payoff. A strong street interview hook is the most charged moment, which might be the pause before the best answer, a doubt, or a line that sets it up without giving it away. If you do open on the best answer, make sure something as strong comes later, or viewers leave once they've heard it.`,
    },
    {
      q: 'Do on-screen captions count as the hook?',
      a: `Yes. The caption and the first frame work together, and for anyone watching on mute the caption is the hook. A good hook caption teases the next beat, quotes the participant exactly, or keeps the question on screen. A caption that only describes what viewers can already see wastes the most valuable second of a vox pop video.`,
    },
    {
      q: 'How do you test which hook works?',
      a: `Cut two or three openings of the same clip and keep everything after the opening identical. Show each cut to people who don't follow you: Instagram's Trial Reels show a reel to non-followers first[^trial-reels]. Then compare how many viewers stayed past the opening, using "stayed to watch" on YouTube Shorts or your reel's insights. Log which hook type held better for which kind of question.`,
    },
    {
      q: 'Can a hook be silent?',
      a: `Yes. Some of the strongest street interview hooks have no words: a pause after a hard question, a laugh before the answer, someone clutching their phone when asked to choose. Put the question on screen so viewers know what's being weighed, and keep the room sound rather than music. A silent hook only works when the words that follow are worth the wait.`,
    },
    {
      q: 'Is clickbait a problem for street interviews?',
      a: `Yes, when the video doesn't deliver. A tease is fine if the payoff is on tape. Clickbait is a promise the clip never keeps, like "the answers shocked everyone" over polite answers, or a count nobody took. Street interviews run on believability, so a broken promise costs the next video too. Kreators.Army never promises views, and we'd rather a hook undersell than overpromise.`,
    },
    {
      q: 'Can you stage a hook in a street interview?',
      a: `No. A pause you asked for, a planted sceptic or a rehearsed correction turns a vox pop into an ad dressed as a street interview. If anyone on camera is paid, employed by the brand or cast, India's endorsement guidelines expect that to be disclosed clearly[^endorsement]. Plan the question, the setup and the follow-up, but never what a stranger says. The hook has to have really happened.`,
    },
  ],

  sources: [
    {
      id: 'yt-stayed-to-watch',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'CLAIMS P01/E24: "stayed to watch" is the share of times viewers stayed past the initial seconds of a Short.',
    },
    {
      id: 'mosseri-signals',
      title: 'Instagram Shares Algorithm Insights To Inform Strategy',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01-22',
      note: 'CLAIMS P02/E22: Adam Mosseri names watch time, likes and sends as the top three ranking signals.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram Trial Reels Are Now Available to More Creators',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025-07-13',
      note: 'CLAIMS E23: Trial Reels show a reel to non-followers first; access opened to public accounts with 1,000 or more followers.',
    },
    {
      id: 'zeigarnik-meta',
      title: 'Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects',
      url: 'https://doi.org/10.1057/s41599-025-05000-w',
      publisher: 'Humanities and Social Sciences Communications (Ghibellini and Meier)',
      date: '2025',
      note: 'CLAIMS R01: no memory advantage for unfinished tasks, but a general tendency to resume them.',
    },
    {
      id: 'pwc-voice-2024',
      title: "82% of Indian consumers consider protection of personal data as the most crucial factor in building trust: PwC's Voice of the Consumer Survey 2024",
      url: 'https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html',
      publisher: 'PwC India',
      date: '2024-07-11',
      note: 'CLAIMS S17/E13: 77% discover new brands on social media and 81% seek reviews there; social media is the least-trusted channel.',
    },
    {
      id: 'ikea-effect',
      title: 'The IKEA effect: When labor leads to love',
      url: 'https://doi.org/10.1016/j.jcps.2011.08.002',
      publisher: 'Journal of Consumer Psychology (Norton, Mochon and Ariely)',
      date: '2012',
      note: 'CLAIMS R05: builders paid more for boxes they assembled than for identical pre-built ones; the effect faded when they did not finish.',
    },
    {
      id: 'tv-vox-pops',
      title: 'How ordinary is the ordinary (wo)man on the street? An analysis of vox pop characteristics in television news',
      url: 'https://doi.org/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice 11(8) (Kathleen Beckers, University of Antwerp)',
      date: '2017',
      note: 'CLAIMS E07: a content analysis of 2,000 Flemish TV vox pops; journalists hardly ever say the interviewees may not represent the whole population. Sole author per Crossref; CLAIMS.md lists Beckers and Walgrave.',
    },
    {
      id: 'dissonance',
      title: 'Cognitive consequences of forced compliance',
      url: 'https://doi.org/10.1037/h0041593',
      publisher: 'Journal of Abnormal and Social Psychology (Festinger and Carlsmith)',
      date: '1959',
      note: 'CLAIMS R06: inconsistency between belief and behaviour causes discomfort that motivates people to reduce it.',
    },
    {
      id: 'endorsement',
      title: 'Endorsement Know-hows! For celebrities, influencers and virtual influencers on social media platforms',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26 and 5.7: material connections must be disclosed with terms such as "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS 5.8: claims about objectively ascertainable fact should be capable of substantiation.',
    },
  ],

  related: ['how-to-edit-vox-pop-videos', 'psychology-of-vox-pop', 'vox-pop-questions', 'eleven-ways-to-vary-a-vox-pop-batch'],
};

export default post;
