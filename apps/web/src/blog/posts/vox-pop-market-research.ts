import type { Post } from '../types';
import meta from './vox-pop-market-research.meta';

const post: Post = {
  meta,

  answer:
    'Vox pop market research uses street interviews as qualitative customer research. A host asks one neutral question to many passers-by, lets each person finish, and logs their exact words. Lines that repeat across different people show the worries and objections buyers hold, and become hooks, scripts and positioning. Kreators.Army treats these findings as directional, not as survey data.',

  takeaways: [
    'A street interview turns into research when its first job is to learn: one neutral question, many different people, no interrupting, and exact words logged the same day.',
    'Street answers show how people talk and why they choose. They can’t show how many people think so, so cast widely and size big decisions with broader data.',
    'Read your best line to strangers before you film it. If they can’t say what it meant, fix the message before the production.',
    'Ask one step away from your product, about money, habits or family, to find the belief that decides the purchase.',
    'Log exact words, emotion, speaker type and question. Tag by emotion first, then topic, and count different people, not mentions.',
    'Store words, not identities. Keep identifiable footage out of third-party AI tools unless people agreed.',
  ],

  body: [
    `We think the most useful thing a street interview produces often isn't the video. It's the sentence a stranger says a few seconds after their first answer, once they've stopped managing how they sound.`,

    'Think about where your current ad copy was written. Usually it’s a meeting room, and the people writing it already love the product, so it comes out in the team’s words. The ads go live, the numbers sit flat, and nobody in that room can say why.',

    'A street interview changes where the words come from. One question goes out to a footpath, many people answer it in their own words, and someone writes those words down exactly.',

    'This guide is the method, start to finish: running a research shoot, logging and tagging what you hear, turning the log into copy, and knowing where street answers stop being reliable. You’ll leave with a log template, a pressure-test script, two builders and a six-question bias quiz.',

    { type: 'h2', id: 'what-makes-a-vox-pop-research', text: 'How is vox pop market research different from a content shoot?', toc: 'What makes it research' },

    'A research shoot exists to learn something. A content shoot exists to make a video. Research asks one question the same way, to a planned spread of people, and keeps every answer in a log. Any video is a by-product.',

    'The format began close to this. The first street-interview show started on a Houston radio station in 1932, when two advertising salesmen carried microphones onto the pavement and asked passers-by what they thought[^vox-pop-radio]. Salespeople, listening to strangers.',

    'We still think that’s the most useful way to see it.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea. Our [guide to vox pop content](/blog/what-is-vox-pop-content) covers the format itself.',
    },

    {
      type: 'definition',
      id: 'voice-of-customer-research',
      term: 'Voice-of-customer research',
      text: 'Voice-of-customer research collects how customers describe their needs, problems and choices in their own words, so a brand can build and talk about its product in those words.',
    },

    `Street answers work as research for one reason: nobody hands people a script. So they answer in the words they use when they think about the problem on their own. Copy written at a desk uses somebody else's words, and messages go flat in the gap between the two.`,

    'Four rules turn a street shoot into a research shoot:',

    {
      type: 'list',
      items: [
        '**One question, asked the same way every time.** Reword it at lunch and you can no longer compare the morning’s answers with the evening’s.',
        '**No interrupting.** Let people finish, then wait. The useful sentence often arrives after the pause.',
        '**Exact words, logged the same day.** Not your summary of what they meant.',
        '**Many people, in more than one place.** One answer is an anecdote. The same idea from different kinds of people starts to look like a pattern.',
      ],
    },

    'The same street, host and camera can run either kind of shoot. The differences sit in the plan.',

    {
      type: 'table',
      caption: 'A content shoot and a research shoot, side by side',
      head: ['What differs', 'Content shoot', 'Research shoot'],
      rows: [
        ['Goal', 'A strong video', 'A pattern you can act on'],
        ['Questions', 'Varied, one mechanism per video', 'One question, asked the same way every time'],
        ['Who you stop', 'Whoever might give a good reaction', 'A planned spread of people and places'],
        ['What you keep', 'The best few moments', 'Every answer, including the dull ones'],
        ['The product', 'Often in hand from the start', 'Hidden until the end, or never shown'],
        ['Output', 'Edited clips', 'A log of exact words, then clips'],
      ],
      rowHeaders: true,
    },

    'You can run both on one day. Ask the research question first, before any product appears, and the content questions after.',

    { type: 'h2', id: 'what-street-interviews-can-tell-you', text: 'What can street interviews tell you, and what can’t they?', toc: 'What they can and can’t tell you' },

    'Street interviews tell you how people describe a problem, what they feel about it and why they choose what they choose. They can’t tell you how many people feel that way. Treat every finding as directional.',

    'That is the line between qualitative and quantitative research. A survey of a well-drawn sample can estimate how common a view is. A street shoot can’t, because the sample is whoever walked past your spot, at that hour, and agreed to stop.',

    'Even TV news struggles here. A study of 2,000 Belgian TV vox pops found that journalists hardly ever told viewers the interviewees might not represent everyone[^beckers-2017]. Age and gender were broadly representative; ethnic minorities and people with disabilities were not. A later study of the same sample found that most vox pop news items showed only one point of view[^opinion-balance-2018].',

    'Brand shoots carry the same risks, plus one more: the people running a brand shoot want a particular answer.',

    { type: 'h3', id: 'the-answer-thats-too-good', text: 'The answer that’s too good' },

    'Media researchers call it exemplification: one vivid person sways judgments more than a statistic does[^exemplification-1994]. That effect doesn’t stop at your audience. It works on your team in the edit room too, where the funniest answer from the shoot slowly becomes “what everyone thinks”.',

    'A 2022 experiment with TV news items points the same way. Viewers rated vox pops as less trustworthy than an expert quoting a poll, yet the vox pops moved their personal opinions more[^vox-pop-vs-expert-2022].',

    'Street answers persuade. That makes them good content, and it’s also why they need checking before they steer a decision.',

    {
      type: 'comparison',
      title: 'What a street shoot can and can’t tell you',
      left: {
        label: 'It can tell you',
        items: [
          'The words people use for the problem',
          'The reasons they give, first and second',
          'Objections you hadn’t thought of',
          'Which of your lines confuse people',
          'Beliefs that sit under the whole category',
        ],
      },
      right: {
        label: 'It can’t tell you',
        items: [
          'How many people share a view',
          'Whether people will actually buy',
          'How a whole city or country thinks',
          'Differences between groups you barely sampled',
          'Whether one memorable answer was typical',
        ],
      },
      verdict: 'Use street answers to find out what to ask. Use broader data to find out how much it matters.',
    },

    { type: 'h2', id: 'biases-to-watch', text: 'Which biases should you watch for in street research?', toc: 'Eight biases to watch' },

    'Watch for eight biases. You can’t remove any of them, but you can reduce each one and write it down, so whoever reads the log knows what it is.',

    {
      type: 'table',
      caption: 'Common biases in street interview research, and what reduces each one',
      head: ['Bias', 'How it shows up on the street', 'What reduces it'],
      rows: [
        ['Place', 'One footpath means one kind of passer-by', 'Two or more spots, picked for different crowds'],
        ['Time', 'A weekday evening means mostly office-goers', 'Different hours, and a weekend if you can'],
        ['Who the host picks', 'People who look friendly or camera-ready', 'A quota sheet the host works through'],
        ['Who says yes', 'Confident, unhurried people stop; others walk on', 'Note every refusal and roughly who it was'],
        ['Language', 'People answer in a language they don’t think in', 'Offer two languages; log which one they chose'],
        ['Performing for the camera', 'The first answer is the polite one', 'Ask “why” once more and log both answers'],
        ['Leading questions', '“Don’t you hate it when…” gets agreement', 'Neutral wording, read the same way each time'],
        ['Hearing what you hoped', 'The team remembers the answers that fit', 'Tag from transcripts, never from memory'],
      ],
      rowHeaders: true,
    },

    `Casting widely costs a little more time, and it's worth it. Plan for the spread of ages, genders, languages and incomes that matches the buyers you care about, then check the log against that plan. If everyone you logged is a student near one metro exit, you've learnt about students near one metro exit.`,

    'Try the bias check on six imaginary findings.',

    {
      type: 'widget',
      widget: 'quiz',
      id: 'valid-conclusion-quiz',
      props: {
        title: 'Valid conclusion?',
        intro: 'Each finding below comes from an imaginary street shoot. Decide how far the team can trust the conclusion it wants to draw.',
        questions: [
          {
            q: 'One evening at one metro exit, most people said the pack felt “too small for the price”. Conclusion: most of our buyers think we’re overpriced.',
            options: [
              { text: 'Safe to act on', points: 0, why: 'One evening at one exit isn’t “most of our buyers”. The sample is whoever walked past and stopped.' },
              { text: 'A strong lead to size first', points: 1, why: 'Right. Size it with a survey or sales data before you touch the price.' },
              { text: 'Ignore it', points: 0, why: 'Too far. A repeated complaint in people’s own words is exactly what this research is for.' },
            ],
            explain: 'Repeated words are a signal. How common they are is a question for broader data.',
          },
          {
            q: 'People of different ages, at two different spots, used almost the same phrase: “I keep it for guests.” Conclusion: some buyers see the product as something to serve, not to use themselves.',
            options: [
              { text: 'A reasonable lead to test', points: 1, why: 'Yes. The same phrase from different kinds of people, in different places, is the pattern a log is built to catch.' },
              { text: 'Proven', points: 0, why: 'Not proven. It’s a lead worth testing in copy.' },
              { text: 'Meaningless', points: 0 },
            ],
          },
          {
            q: 'The host only stopped people who were strolling and smiling. Every one of them liked the brand. Conclusion: people love us.',
            options: [
              { text: 'Safe', points: 0, why: 'The host picked the friendliest faces, so friendly answers were likely.' },
              { text: 'Safe if we stop more people the same way', points: 0, why: 'More of the same sample repeats the same bias.' },
              { text: 'Unsafe: the selection decided the answer', points: 1, why: 'Right. A quota sheet stops the host choosing only easy yeses.' },
            ],
          },
          {
            q: 'One person gave a funny, furious rant about the whole category. The team keeps quoting it. Conclusion: this is how our audience feels.',
            options: [
              { text: 'Probably true, it was so vivid', points: 0, why: 'Vivid isn’t typical. One memorable person sways judgment more than a count does.' },
              { text: 'One data point, however good the clip', points: 1, why: 'Yes. Log it, and look for the same feeling in other people’s words.' },
            ],
          },
          {
            q: 'The question was “Don’t you hate cleaning up after cooking?” Everyone agreed. Conclusion: cleaning up is the main pain in our category.',
            options: [
              { text: 'Safe, everyone agreed', points: 0, why: 'The question told people what to feel. Agreement was the easy answer.' },
              { text: 'Unsafe: the question led them', points: 1, why: 'Right. Ask “What’s the most annoying part of cooking at home?” and see what comes up unprompted.' },
            ],
          },
          {
            q: 'People who first said they buy for “quality” said, after one more “why”, that they’re scared of wasting money. Conclusion: our quality message may be answering the wrong worry.',
            options: [
              { text: 'A reasonable lead to test', points: 1, why: 'Yes. The second answer often names the real worry. Test a message about not wasting money.' },
              { text: 'Unsafe, they changed their answer', points: 0, why: 'A changed answer is often the more honest one.' },
            ],
          },
        ],
        results: [
          { min: 0, title: 'Trusting the street too much', text: 'Street answers are leads, not proof. Reread the bias table above and try again.' },
          { min: 3, title: 'Getting there', text: 'You spot the obvious traps. Watch the subtle ones: vivid answers and friendly-looking samples.' },
          { min: 5, title: 'Research-ready', text: 'You read street answers the way a researcher would: as directional, and worth testing.' },
        ],
      },
    },

    { type: 'h2', id: 'messaging-gap-pressure-test', text: 'What is the messaging gap, and how do you test for it?', toc: 'The messaging gap and the pressure test' },

    'The messaging gap is the distance between what you meant and what a stranger heard. The pressure test measures it: read your line to people on the street, word for word, and ask what they think it meant.',

    'Every brand has a line it’s proud of. Usually it was written by people who know the product well, and that’s the problem. They read the line with all the context in their heads. A stranger has none of it.',

    {
      type: 'callout',
      tone: 'note',
      title: 'Who the test doesn’t work on',
      text: 'Anyone who already knows what you mean. They hear the line you intended, not the one you wrote.',
      items: ['Your team, and anyone who has read the brief', 'Friends and family', 'Loyal followers and repeat customers'],
    },

    'The test only works on people who owe you nothing.',

    'A stranger is also closer to the person who meets your ad in a feed: curious and guarded at once. In PwC’s 2024 survey of Indian shoppers, 77% said they discover new brands on social media and 81% check reviews there, yet social media was their least-trusted channel[^pwc-2024].',

    { type: 'h3', id: 'running-the-pressure-test', text: 'Running the pressure test' },

    'Run it before you spend on production. Take your current best line: the ad headline, the hook your team likes most, the first sentence on your homepage. Take it to the street on a card, with a notebook and no camera.',

    'Read the line once, exactly as written, and watch their face. You aren’t reading minds. A pause, a frown or a polite nod isn’t proof of anything on its own. It’s your cue to ask what they understood.',

    'Our [street interview techniques guide](/blog/street-interview-techniques#pressure-test) treats the test as a filming habit. This version is for research: two extra questions, and a note after every person.',

    {
      type: 'script',
      id: 'pressure-test-script',
      title: 'The pressure test, research version',
      context: 'One person with a card and a notebook. No camera needed; if you do record, ask first. Write down each answer before you approach the next person.',
      lines: [
        { direction: 'Hold the card where you can read it. Don’t show it to them.' },
        { speaker: 'Host', text: 'Can I try something quick on you? I’ll read you one sentence. Tell me the first thing that comes to mind. Be honest, I won’t be offended.' },
        { direction: 'Read the line once, exactly as written. Don’t explain it.' },
        { speaker: 'Host', text: 'Did that make sense?' },
        { speaker: 'Participant', text: 'Yeah, I think so.' },
        { direction: 'A polite yes tells you nothing. Ask the real question.' },
        { speaker: 'Host', text: 'What do you think it meant?' },
        { direction: 'Wait. Let them finish, then count to three before you speak.' },
        { speaker: 'Host', text: 'Which word stuck with you?' },
        { speaker: 'Host', text: 'Who do you think it’s for?' },
        { speaker: 'Host', text: 'If a friend sent you this, what would you reply?' },
        { direction: 'Thank them. Write their exact words on the sheet before the next person.' },
      ],
    },

    'What you hear falls into a few patterns. Each one points to a different fix.',

    {
      type: 'list',
      items: [
        '**They explain it back in their own words.** The line works. Log their version: it may be better than yours.',
        '**They repeat your words but can’t explain them.** The line sounds fine and means nothing. Usually that’s jargon.',
        '**They describe a different product.** That’s a positioning gap, not a copy problem.',
        '**They ask a question,** such as “Is it for kids?” Log it. Questions show what the line left out.',
        '**They remember a word you treated as filler.** That word is doing the work, for better or worse. Log it.',
        '**They shrug.** The line didn’t land, so don’t build a shoot around it.',
      ],
    },

    `Our rule: stop testing a line once the same misreading keeps coming back from different kinds of people. You don't need a big sample to learn that a sentence confuses people. You'd need a much bigger one to claim it works.`,

    { type: 'h3', id: 'never-trust-the-first-answer', text: 'Never trust the first answer' },

    'The pressure test pairs with the [two-answer rule](/blog/vox-pop-glossary#two-answer-rule). A first answer is the one people think they’re supposed to give. It sounds reasonable and safe on camera. The second comes after they’ve heard themselves speak, when you ask, gently, “Interesting, why though?”',

    'People don’t lie in the first answer. They perform. The shapes below are illustrations, not real interviews.',

    {
      type: 'widget',
      widget: 'reveal',
      id: 'first-and-second-answers',
      props: {
        title: 'First answer, second answer (illustrations)',
        items: [
          {
            question: 'Why did you stop going to the gym?',
            first: '“No time, honestly.”',
            second: '“Everyone there seemed to know what they were doing. I felt watched the whole time.”',
            note: 'The first answer is about the calendar. The second is embarrassment, and no timetable fixes it.',
          },
          {
            question: 'What stops you ordering furniture online?',
            first: '“I like to see it first.”',
            second: '“Last time the colour was nothing like the photo, and sending it back was a nightmare.”',
            note: 'The first answer is a habit. The second is a fear with a story behind it.',
          },
          {
            question: 'How do you pick headphones?',
            first: '“Sound quality, mainly.”',
            second: '“If my friends have heard of the brand. I don’t want to explain it.”',
            note: 'Pride and belonging, hiding behind a spec.',
          },
        ],
      },
    },

    'Log both answers in the same row. The gap between them is often the finding.',

    'Once a line survives the street, try it on a wider crowd. If your account has the feature, Instagram’s Trial Reels show a Reel to non-followers first, and you decide afterwards whether to share it with your followers[^trial-reels]. That’s a cheap way to compare two openings cut from the same street interview.',

    { type: 'h2', id: 'find-the-hidden-belief', text: 'How do you find the belief buyers never say out loud?', toc: 'The belief one step removed' },

    'Ask about the buyer’s life, not your product. A question one step away from the category, about money, habits or other people, brings out the belief that decides the purchase. A direct product question gets the polite version.',

    'Every category has the story its brands tell and the story its buyers live. A mattress brand talks about foam and firmness. The buyer remembers the mattress their parents had for as long as anyone can recall, and quietly wonders why anyone needs a new one.',

    'Stories like that rarely reach a survey, because the survey asks about the product. They come out when people talk about their own lives.',

    'Our [street interview marketing playbooks](/blog/street-interview-marketing-playbooks) call this the invisible category frame, and show how to build a brand message on it. Here the job is narrower: finding it.',

    { type: 'h3', id: 'one-step-removed', text: 'Ask one step removed' },

    `Say you sell skincare. The direct question is "Why don't you buy skincare?" It gets a defensive shrug. Move one step out and ask instead: "What's the last thing you bought just for yourself that you had to think twice about?"`,

    `Now listen. One person says they can't remember. Another says their mother would call it a waste. A third says that money should really go on the house. None of those answers mentions skin, yet each one explains why an ad full of glow might slide straight past.`,

    'Those lines are illustrations. Your own shoot may surface something else entirely, which is why you run it.',

    {
      type: 'steps',
      id: 'one-step-removed-steps',
      title: 'Write a one-step-removed question',
      intro: 'Do this at your desk, before the shoot.',
      steps: [
        { name: 'Write the direct question', text: 'The one you actually want answered, even if it’s blunt: “Why don’t people reorder?”' },
        { name: 'Name the decision underneath', text: 'Pick the decision the purchase rests on: spending on yourself, trusting a new brand, changing a habit, or facing what other people will think.' },
        { name: 'Step out of the category', text: 'Ask about the last time they faced that decision with any purchase at all, inside your category or far outside it.' },
        { name: 'Ask for a memory', text: '“The last time” beats “in general”. Memories come with details. Opinions come with slogans.' },
        { name: 'Follow the feeling word', text: 'When someone says “stuck”, “guilty” or “confused”, stay there. Ask why that word, and how long they’ve felt it.' },
      ],
    },

    'When this doesn’t work: people rushing for a bus, or topics that feel too personal for a footpath. Don’t push. Thank them and let them go.',

    'The builder below turns your product and the decision behind it into indirect questions you can take to the street.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'one-step-removed-builder',
      props: {
        title: 'One-step-removed question builder',
        intro: 'Type your product, the decision behind buying it, and what people do instead. Copy the questions that fit your street.',
        fields: [
          { id: 'product', label: 'Your product', placeholder: 'e.g. a face serum', example: 'a face serum' },
          { id: 'decision', label: 'The decision behind buying it', placeholder: 'e.g. spending money on yourself', example: 'spending money on yourself' },
          { id: 'habit', label: 'What people do instead', placeholder: 'e.g. using whatever is at home', example: 'using whatever is at home' },
        ],
        templates: [
          { text: 'When did you last think twice about {decision}? What stopped you?', group: 'Memory', mechanism: 'Personal experiences' },
          { text: 'Tell me about the last time {decision} felt worth it.', group: 'Memory', mechanism: 'Personal experiences' },
          { text: 'Who at home has an opinion about {decision}? What would they say?', group: 'Other people', mechanism: 'Personal experiences' },
          { text: 'Be honest: how long have you been {habit}? Why that?', group: 'Habit', mechanism: 'Unexpected questions' },
          { text: 'What would have to change for you to stop {habit}?', group: 'Habit', mechanism: 'Unexpected questions' },
          { text: 'What is the most annoying part of {decision}?', group: 'Pain', mechanism: 'Debates and opposing opinions' },
          { text: 'Last, and only if it fits: if {product} turned up at your door tomorrow, what would you do with it?', group: 'Product, last', mechanism: 'Product reactions' },
          { text: 'You used a strong word about {decision} just now. Why that word?', group: 'Follow-up', mechanism: 'Different follow-up structures' },
        ],
        note: 'Ask the product question last, if at all. Every question before it should work even for someone who has never heard of your brand.',
      },
    },

    'Category-level questions show up in our library too. A question like this invites people to explain how they decide.',

    { type: 'video', brand: 'CircleStore', title: 'Branded Vs Unbranded', caption: 'CircleStore, “Branded Vs Unbranded”: a category-level choice, branded or unbranded, rather than a question about one product.' },

    'For more question shapes, sorted by category, see our [bank of vox pop questions](/blog/vox-pop-questions).',

    { type: 'h2', id: 'run-a-research-shoot', text: 'How do you run a research shoot?', toc: 'Running a research shoot' },

    'Write down what you want to learn, plan where and when you’ll ask, take one question and its follow-ups, and log exact words the same day. Ask for consent to the research, and separately for any publishing.',

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. Before every shoot we lock the objective, products, audience and must-haves. For a research shoot, add one line to that list: the thing you want to learn. You can see [how we plan a shoot](/how-we-work#before-the-shoot) on our process page.',

    {
      type: 'steps',
      id: 'research-shoot-steps',
      title: 'How to run a research shoot',
      howTo: true,
      supplies: ['One question and two written follow-ups', 'A phone or camera with a clip-on mic', 'A quota sheet', 'Consent forms', 'A notebook for field notes'],
      steps: [
        { name: 'Write the learning goal', text: 'One sentence, before anything else: “We want to learn why people who try us once don’t come back.” If you can’t write it, you’re not ready to shoot.' },
        { name: 'Write the question and two follow-ups', text: 'Keep the question neutral and short enough for one breath. Write the follow-ups now, such as “Interesting, why though?” and “When did that last happen?”' },
        { name: 'Plan the spread', text: 'Pick at least two spots with different crowds, and two times of day. Make a rough quota sheet of the ages, languages and kinds of buyer you need to hear from.' },
        { name: 'Brief the host to stay neutral', text: 'The host asks, listens and follows up. They don’t sell, agree or show the product until the end.' },
        { name: 'Ask, then wait', text: 'Let people finish, and count to three before the next question. Repeating their last few words, which former FBI negotiator Chris Voss calls mirroring, often draws out a second, fuller answer[^voss-mirroring].' },
        { name: 'Log the refusals', text: 'Note roughly who said no, and when. If every older person walked past, the log should say so.' },
        { name: 'Write field notes after each person', text: 'Place, time, a rough description (never a name), the language they answered in, and anything the camera missed.' },
        { name: 'Transcribe the same day', text: 'Mark the exact phrases, not your reading of them. By next week, you’ll mostly remember the answers you liked.' },
      ],
    },

    { type: 'h3', id: 'neutral-follow-ups', text: 'Follow-ups that don’t lead' },

    'A follow-up should ask for more of what the person already said. These five never suggest an answer:',

    {
      type: 'list',
      items: ['“Interesting, why though?”', '“When did that last happen?”', '“What did you do next?”', '“You said stuck. Stuck how?”', '“And then?”'],
    },

    'Who asks matters too. A host who represents the brand should say so at the start. A host who keeps nodding at the “right” answers teaches people what to say, and the log fills up with your own opinions read back to you.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'Two consents, not one',
      text: 'Someone may be happy to help with your research and not want to appear in an ad. Ask for both separately, note which they agreed to, and keep that note with their footage. Our [guide to street interview consent in India](/blog/street-interview-consent-india) covers releases in detail.',
      items: ['Never interview anyone under 18 without a parent’s written consent.', 'Don’t fill gaps with staff or friends. They know the answer you want.'],
    },

    'If anyone in your vox pop is paid, works for you or was cast, India’s endorsement guidelines expect you to say so clearly[^endorsement-2023]. That matters most when research footage later turns into a public clip.',

    { type: 'h2', id: 'intelligence-library', text: 'How do you log what people say in street interviews?', toc: 'The four-column log' },

    'Keep one shared log of every answer from every shoot. We call it an intelligence library. Each row holds the exact words, the emotion, the kind of person who said it and the question that drew it out.',

    'It’s tempting to treat each shoot as a one-off: shoot, post, move on. Treat it as an entry in a library instead, and the value builds with every shoot.',

    'We think the log matters more than any single video. A competitor can copy a clip’s format. They can’t copy a log of real answers, because they never asked your questions of your buyers.',

    'It doesn’t need special software. A shared spreadsheet is enough. Four columns do most of the work, and we’d add three more.',

    {
      type: 'table',
      caption: 'The intelligence log: four core columns and three that help',
      head: ['Column', 'What goes in it', 'Example (illustrative)'],
      rows: [
        ['Exact words', 'What they said, verbatim, in the language they said it', '“Mummy will ask why I spent so much”'],
        ['Emotion', 'The feeling under the line, one tag', 'Fear'],
        ['Archetype', 'The kind of person, never who they are', 'First-job earner, lives with family'],
        ['Question', 'The exact question that drew the answer', '“Last thing you bought just for yourself?”'],
        ['First or second', 'The first answer, or the one after a follow-up', 'Second'],
        ['Place and time', 'Where and when, roughly', 'Metro exit, weekday evening'],
        ['Used in', 'Where the line has been used since', 'Hook test, week three'],
      ],
      rowHeaders: true,
    },

    'The last three columns make the log easier to trust, and far easier to search later.',

    {
      type: 'list',
      items: [
        '**Verbatim or nothing.** A summary replaces their words with yours, which defeats the point.',
        '**Keep the original language.** Log Hinglish, Kannada or Tamil as said, with a translation in brackets. The translation is for you; the original is the asset.',
        '**One row per idea.** A long answer can hold three findings. Split it.',
        '**No names, numbers or faces.** The archetype describes a person. It never identifies one.',
      ],
    },

    'The builder below makes one row at a time: type an answer from your footage, then copy the CSV line into your sheet.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'insight-log-template',
      props: {
        title: 'Insight log row builder',
        intro: 'One answer in, one CSV row out, plus a tag line and two drafts to test later.',
        fields: [
          { id: 'words', label: 'Exact words', placeholder: 'e.g. Mummy will ask why I spent so much', example: 'Mummy will ask why I spent so much' },
          { id: 'emotion', label: 'Emotion', placeholder: 'e.g. Fear', example: 'Fear' },
          { id: 'archetype', label: 'Archetype', placeholder: 'e.g. first-job earner, lives with family', example: 'first-job earner, lives with family' },
          { id: 'question', label: 'Question that drew it', placeholder: 'e.g. Last thing you bought just for yourself?', example: 'Last thing you bought just for yourself?' },
        ],
        templates: [
          { text: '"{words}","{emotion}","{archetype}","{question}","","",""', group: 'CSV row' },
          { text: '{emotion} | topic: ___ | said by: {archetype}', group: 'Tag line' },
          { text: '"{words}" Who else has heard this?', group: 'Caption to test' },
          { text: 'Next shoot, ask: "A stranger told us, {words}. Does that sound like anyone you know?"', group: 'Next question', mechanism: 'Personal experiences' },
        ],
        note: 'Paste this header row once, at the top of the sheet: Exact words,Emotion,Archetype,Question,First or second,Place and time,Used in. Fill the last three by hand. Never log names, phone numbers or handles.',
      },
    },

    'After a few shoots, search the sheet for one word, such as “later” or “expensive”, and sort the results by question. You’ll see which question opens people up and which one shuts them down.',

    { type: 'h2', id: 'tag-by-emotion', text: 'Why tag answers by emotion before topic?', toc: 'Tag by emotion, then topic' },

    'Topics say what people talked about. Emotions say why it mattered, and that’s what your copy has to carry. Tag each line with one feeling first, then add the topic as a second tag.',

    'Topic folders such as “price”, “quality” or “delivery” fill up fast and stop meaning much. Half the log lands in “price”, and the folder can’t tell you whether people were angry, embarrassed or simply curious about it.',

    'Our working view: people react to how a line feels before they weigh what it says. So sort by feeling first. These seven tags make a good starting set, and you can add your own.',

    {
      type: 'table',
      caption: 'Seven emotion tags, with illustrative lines',
      head: ['Emotion', 'What it sounds like', 'An illustrative line'],
      rows: [
        ['Fear', 'Worry about losing money, face or time', '“What if it doesn’t suit me and I’ve wasted it?”'],
        ['Pride', 'Wanting to be seen a certain way', '“I only buy the original. People notice.”'],
        ['Shame', 'Embarrassment about a habit', '“Don’t judge, I’ve had this pillow since college.”'],
        ['Want', 'A clear, plain desire', '“I just want one that lasts.”'],
        ['Confusion', 'Not understanding the offer', '“Wait, is it a subscription?”'],
        ['Ambition', 'Reaching for a better version of their life', '“Once the raise comes, I’m redoing the whole room.”'],
        ['Relief', 'A problem that’s finally gone', '“Now I don’t have to think about it.”'],
      ],
      rowHeaders: true,
    },

    { type: 'h3', id: 'read-the-log-as-text', text: 'Read the log as text, not as clips' },

    'Watching clips, you notice voices, faces and who seemed cool. On a blank page, you notice repeat words, odd confessions and the sentence someone slips in right after they laugh. That sentence is often the finding.',

    `Don't skip the jokes either. Someone joking that their salary runs out before the month does is telling you about money pressure.`,

    'The joke is the way in.',

    'Everyday frustrations make good raw material, because people describe them in vivid, ordinary words.',

    { type: 'video', brand: 'YourPlug', title: 'Focus Killers', caption: 'YourPlug, “Focus Killers”: by its title, a question about what kills focus. An everyday frustration, in people’s own words.' },

    { type: 'h3', id: 'count-across-people', text: 'Count across people, not mentions' },

    'This is the analysis itself. It’s slow, and it’s the step that turns a pile of quotes into a finding.',

    {
      type: 'list',
      ordered: true,
      items: [
        'Read the whole day’s log once, without tagging anything.',
        'Tag each row: one emotion, then one or two topics.',
        'Group rows that say the same thing in different words.',
        'Count the different people in each group. One person saying it five times is still one person.',
        'Write one plain sentence per group: “People who live with family worry about being asked what they spent.”',
        'Pick the exact quote that carries each group best. That quote, not your sentence, goes to whoever writes the copy.',
      ],
    },

    'One great rant may make a good clip. It makes a weak finding.',

    `Counts describe your sample, never the market. "Several people we logged mentioned their mother" is a fine note for the team. "Most Indians worry about their mother's opinion" is a sentence the log can't support.`,

    { type: 'h2', id: 'turn-the-log-into-copy', text: 'How do you turn the log into hooks, scripts and positioning?', toc: 'From the log to copy' },

    'Take the lines that repeat across different people, name the feeling under each, and turn each line into a hook, a video angle, a caption and a product-page sentence. Keep their words wherever you can.',

    'The weak point sits between the log and the brief. A team reads the log, nods, and then writes the copy in its own voice again.',

    'That habit is exactly what the log was meant to break.',

    {
      type: 'list',
      ordered: true,
      items: [
        '**Pull three lines** that repeat across different people. Not the funniest lines. The most repeated.',
        '**Write the feeling under each one** in a single word: fear, shame, pride or doubt.',
        '**Turn each line into drafts:** a hook, a video angle, a caption, and a sentence for an email or product page.',
      ],
    },

    `A made-up example shows the idea. Say you sell a kitchen appliance. Some version of one line keeps coming back from different people: "I bought one, used it twice, and now it lives on top of the fridge."`,

    {
      type: 'table',
      caption: 'One repeated line, five drafts (an illustration)',
      head: ['Use', 'Draft'],
      rows: [
        ['Hook', '“Be honest. Where does your last kitchen gadget live now?”'],
        ['Video angle', 'Ask strangers what’s on their fridge, then show daily use, not specs'],
        ['Caption', '“Top of the fridge counts as storage, apparently.”'],
        ['Product page', '“Built for the counter, not the top of the fridge.”'],
        ['Next question', '“What’s the last thing you bought and stopped using within a month?”'],
      ],
      rowHeaders: true,
    },

    'If a line can’t feed more than one of these, it may be funny, but it isn’t deep enough to build a message on.',

    { type: 'h3', id: 'positioning-is-the-slow-use', text: 'Positioning is the slow use' },

    'When the same belief turns up across different speaker types, places and shoots, it becomes a candidate for how you describe the whole brand. Test it in copy, ads and the next shoot before you rebuild anything around it.',

    'Middle-of-funnel content is a natural home for these lines, because that’s where people weigh their doubts. Our guide to [MoFu content with vox pops](/blog/vox-pop-mofu-content-strategy) shows how, and [the vox pop stack](/blog/vox-pop-funnel) maps questions to every funnel stage.',

    {
      type: 'callout',
      tone: 'warning',
      title: 'What the log can’t be used for',
      text: 'A street answer is an opinion, never evidence that a product works. India’s advertising code says claims about matters of objective fact “should be capable of substantiation”[^asci-code], and a stranger’s praise doesn’t substantiate anything.',
      items: [
        'Never edit an answer to say something the person didn’t say.',
        'Never quote a log line in an ad unless that person agreed to appear in it.',
        'Never present a count from the log as a market statistic.',
      ],
    },

    { type: 'cta', text: 'Want to see real people react to your own product before you commit to a batch?' },

    { type: 'h2', id: 'comments-are-round-two', text: 'How do you use comments as a second round of research?', toc: 'Comments are round two' },

    'Once a clip is out, its comments are more answers to the same question, from a wider but self-selected crowd. Log the specific ones beside your street answers, marked as comments, and tag them the same way.',

    'Views and likes tell you a clip was seen. They don’t tell you whether a line landed. Comments can, but only the specific ones. A row of fire emojis is noise. “I thought I was the only one who did this” is a finding.',

    'Watch for three kinds of signal. Each one tells you a line reached someone in particular.',

    {
      type: 'list',
      items: ['**Stories:** comments where someone tells you about their own life.', '**Quotes:** a line from the clip, typed back to you.', '**New voices:** messages from people who never usually comment.'],
    },

    'You can ask for round two directly. End a clip with the question itself, such as “What’s the annoying part for you?”, and the replies become the brief for your next shoot.',

    {
      type: 'list',
      ordered: true,
      items: [
        'Copy comments that hold a claim, a story or a question. Skip plain praise and emojis.',
        'Remove usernames before anything else.',
        'Add each one as a row, marked “comment”, with the clip it came from.',
        'Tag by emotion, then topic, exactly as you tag street answers.',
        'Compare the two: which street lines come back in comments, and which comments say something nobody said on the street?',
      ],
    },

    'Public comments are fair to sort with an AI tool. Paste in the specific ones and ask it to group them by feeling. Then check every group against the comments themselves, because a summary can sound right and still be wrong.',

    'Remember who comments: people with strong feelings and time to type. Keep comments in their own tab, so one loud thread doesn’t drown out the quieter street answers.',

    { type: 'h2', id: 'storing-what-you-collect', text: 'How should you store street interview recordings?', toc: 'Storing what you collect' },

    'Store words, not identities. Keep footage in one access-controlled place, decide when you’ll delete it, and never upload identifiable footage to a third-party AI tool without consent. This is general information, not legal advice.',

    'A video of an identifiable person is personal data. India’s Digital Personal Data Protection Rules were notified in November 2025 and are coming into force in phases through 2027, with the consent and notice duties applying about 18 months after notification[^dpdp-rules-2025]. Check your release forms and storage with a lawyer.',

    'These are the rules we’d set for any research material:',

    {
      type: 'list',
      items: [
        '**The log holds no identities.** No names, phone numbers, handles or faces. The archetype column describes; it never identifies.',
        '**Footage lives in one place.** One folder, a short list of people with access, and no copies left on personal phones after the shoot.',
        '**Every clip carries its consent.** File what each person agreed to, research only or research and publishing, beside their footage.',
        '**Pick a deletion date.** Footage you’ll never publish shouldn’t sit around for ever. Decide how long you’ll keep it before the shoot.',
        '**AI tools get text, not faces.** Transcribe with consent that covers it, strip names, then let a tool sort the text. Raw footage of identifiable people stays out of third-party tools unless they agreed.',
      ],
    },

    'The checklist below covers a research shoot from the night before to the last row in the log. It remembers your ticks on this device.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'research-shoot-checklist',
      props: {
        title: 'Research shoot: before and after',
        intro: 'Tick each item as you go. The first six come before the shoot; the rest come after.',
        items: [
          { id: 'goal', text: 'The learning goal is written in one sentence' },
          { id: 'question', text: 'One neutral question, read aloud, with two follow-ups written down' },
          { id: 'spread', text: 'At least two spots and two times of day planned' },
          { id: 'quota', text: 'A rough quota sheet of the people you need to hear from' },
          { id: 'host', text: 'The host knows not to sell, agree or show the product early' },
          { id: 'consent', text: 'Consent forms that separate research from publishing', detail: 'Never film anyone under 18 without a parent’s written consent.' },
          { id: 'refusals', text: 'Refusals logged, with roughly who walked past' },
          { id: 'transcribe', text: 'Answers transcribed the same day, word for word' },
          { id: 'rows', text: 'Every row has exact words, emotion, archetype, question, and first or second answer' },
          { id: 'tags', text: 'Rows tagged by emotion first, then topic' },
          { id: 'counts', text: 'Groups counted by different people, not by mentions' },
          { id: 'storage', text: 'Footage in one access-controlled place, with a deletion date' },
          { id: 'ai-tools', text: 'No identifiable footage uploaded to a third-party AI tool without consent' },
        ],
        done: 'Done. Now pick the three lines that repeated most, and write the drafts.',
      },
    },

    { type: 'h2', id: 'when-you-need-proper-research', text: 'When do you need proper market research instead?', toc: 'When you need proper research' },

    'When the decision depends on how many people think something, not why: a price change, a new city, a reformulation or a big media budget. Use surveys, sales data or tests for that, with street answers to write the questions.',

    'Street interviews make a good first step and a poor last one.',

    {
      type: 'table',
      caption: 'Where street interviews fit among research methods',
      head: ['Method', 'Best at', 'Weak at'],
      rows: [
        ['Street interviews', 'Real words, reasons and hidden beliefs', 'How common any view is'],
        ['Online survey', 'Sizing a view across a defined sample', 'Why people answer the way they do'],
        ['One-to-one interviews', 'Depth, history and context with one person', 'Speed, and hearing from many people'],
        ['Focus groups', 'Reactions to ideas in conversation', 'Loud voices steering the room'],
        ['Sales and review data', 'What people actually did', 'Why they did it'],
        ['Ad and Reel tests', 'Which of two versions holds attention', 'What either version meant to people'],
      ],
      rowHeaders: true,
    },

    'The order that works is a loop. Street answers suggest a hypothesis, a survey or a test sizes it, and the next shoot asks about whatever surprised you. It’s the same shape as the creative loop we work in: hypothesis, interaction, production, edit, learn, improve.',

    'If the decision is big and the money is real, hire a research firm and hand them your log. Your street answers will make their survey questions better, because they’re already written in your buyers’ words.',

    { type: 'h2', id: 'where-to-start', text: 'Where should you start this week?', toc: 'Where to start' },

    'Start with the line your brand leads with. Write it on a card, take it to a footpath, and read it to five strangers who owe you nothing. Ask what they think it meant, and write down their exact words.',

    'If they explain it back in words close to yours, keep the line and log their version. If they don’t, you’ve found your first research question, and it cost you an afternoon.',

    'One limit stays, however well you plan. We control the question, the setup, who we approach, the follow-up and the edit. We can’t control exactly how a stranger will respond in the moment, and in research that’s the whole point. [See how we work with that](/how-we-work).',
  ],

  faqs: [
    {
      q: 'Can vox pops be used for market research?',
      a: 'Yes, as qualitative research. A vox pop shows the words people use, the reasons they give and the beliefs under a choice. It can’t show how many people share a view, because the sample is whoever passed your spot and agreed to stop. Use street answers to find out what to ask, then check anything behind a big decision against surveys, sales data or tests.',
    },
    {
      q: 'How many street interviews do you need for useful insight?',
      a: 'Usually, enough that new answers stop adding new ideas. Qualitative researchers call this point saturation. For one narrow question, the same few lines can start repeating within a single shoot. A broad question needs several shoots across different places, times and kinds of people. Count how many different people said something, and stop when the log stops surprising you, not at a fixed number.',
    },
    {
      q: 'Are street interview answers representative?',
      a: 'No. Street interview answers come from whoever walked past at that hour and agreed to talk, partly chosen by the host. A study of 2,000 Belgian TV vox pops found they rarely reflected minorities, and journalists hardly ever said so[^beckers-2017]. Cast widely on purpose, log refusals, and treat every finding as directional until broader data backs it up.',
    },
    {
      q: 'What is voice-of-customer research?',
      a: 'Voice-of-customer research collects how customers describe their needs, problems and choices in their own words. Brands use it to write copy, shape products and fix messages that miss. Common sources include interviews, reviews, support tickets and surveys with open questions. Street interviews add a source many brands lack: unprompted answers from people who may never have bought from them.',
    },
    {
      q: 'How do you analyse vox pop answers?',
      a: 'Transcribe them the same day, word for word. Log each idea as a row with the exact words, the emotion, the kind of person and the question that drew it out. Tag by emotion first, then topic. Group rows that say the same thing, count the different people in each group, and pick the exact quote that carries it best.',
    },
    {
      q: 'Can AI help analyse interview transcripts?',
      a: 'Yes, for sorting text you’re allowed to share. An AI tool can group comments or transcripts by theme or feeling quickly. Strip names and other identifying details first, and don’t upload raw footage of identifiable people to a third-party tool without their consent. Check every group the tool makes against the original lines, because a tidy summary can still misread what someone meant.',
    },
    {
      q: 'Can research footage be used in ads later?',
      a: 'Only if the people in it agreed to that use. Consent to answer research questions isn’t consent to appear in an ad, so ask for both separately and file what each person agreed to. If anyone in the clip is paid, works for you or was cast, India’s endorsement guidelines expect clear disclosure[^endorsement-2023]. Our [consent guide](/blog/street-interview-consent-india) covers releases.',
    },
    {
      q: 'How should we store interview recordings?',
      a: 'Keep recordings in one access-controlled place, file each person’s consent beside their footage, and set a deletion date for anything you won’t publish. Keep names, numbers and faces out of the research log. A video of an identifiable person is personal data, and India’s data protection rules are coming into force in phases through 2027. This is general information, not legal advice.',
    },
  ],

  sources: [
    {
      id: 'vox-pop-radio',
      title: 'Vox Pop (radio program)',
      url: 'https://en.wikipedia.org/wiki/Vox_Pop_(radio)',
      publisher: 'Wikipedia',
      note: 'Vox Pop began on KTRH in Houston in 1932, when ad salesmen Parks Johnson and Jerry Belcher took microphones into the street (CLAIMS E02).',
    },
    {
      id: 'beckers-2017',
      title: 'How ordinary is the ordinary (wo)man on the street? An analysis of vox pop characteristics in television news (Kathleen Beckers)',
      url: 'https://doi.org/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice',
      date: '2017',
      note: 'Content analysis of 2,000 vox pops in Flemish TV news: journalists hardly ever say interviewees may not be representative; representative on age and gender, not on ethnic minorities or people with disabilities (CLAIMS E07).',
    },
    {
      id: 'opinion-balance-2018',
      title: 'Opinion balance in vox pop television news (Beckers, Walgrave and Van den Bulck)',
      url: 'https://doi.org/10.1080/1461670X.2016.1187576',
      publisher: 'Journalism Studies',
      date: '2018',
      note: 'A large majority of vox pop news items present only one point of view (CLAIMS E08).',
    },
    {
      id: 'exemplification-1994',
      title: 'The utility of exemplars in persuasive communications (Brosius and Bathelt)',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research',
      date: '1994',
      note: 'Exemplification: individual cases sway judgments more than base-rate statistics (CLAIMS E06).',
    },
    {
      id: 'vox-pop-vs-expert-2022',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications (De Gruyter)',
      date: '2022',
      note: 'Vox pops rated less trustworthy than an expert quoting a poll, yet shifted personal opinion more (CLAIMS R11, E04).',
    },
    {
      id: 'pwc-2024',
      title: 'Voice of the Consumer Survey 2024 (India), press release',
      url: 'https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html',
      publisher: 'PwC India',
      date: '2024-07',
      note: '77% discover new brands on social media, 81% seek reviews there, yet it is the least-trusted channel (CLAIMS S17).',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'Trial Reels show a Reel to non-followers first; the creator then decides whether to share it with followers (CLAIMS E23).',
    },
    {
      id: 'voss-mirroring',
      title: 'Never Split the Difference: summary',
      url: 'https://www.mindtools.com/arg0sjv/never-split-the-difference',
      publisher: 'MindTools',
      note: 'Mirroring, popularised by former FBI negotiator Chris Voss: repeat the last few words to keep someone talking (CLAIMS P08).',
    },
    {
      id: 'endorsement-2023',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'Disclose any material connection with terms such as advertisement, sponsored or paid promotion (CLAIMS E26).',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'Objective claims should be capable of substantiation (CLAIMS 5.8).',
    },
    {
      id: 'dpdp-rules-2025',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'The Week (PTI)',
      date: '2025-11-14',
      note: 'DPDP Rules notified November 2025; consent and notice duties apply about 18 months later (CLAIMS P07, E27).',
    },
  ],

  related: ['street-interview-marketing-playbooks', 'vox-pop-questions', 'vox-pop-mofu-content-strategy', 'street-interview-consent-india'],
};

export default post;
