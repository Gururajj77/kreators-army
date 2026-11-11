import type { Post } from '../types';
import meta from './vox-pop-vs-ugc.meta';

const post: Post = {
  meta,

  answer: `User-generated content (UGC) is video made by customers or paid creators, usually one person talking to camera. A testimonial is a buyer vouching for a product. A vox pop puts one question to many strangers and edits the contrast between their answers. Kreators.Army's rule of thumb: vox pop for attention, UGC to show use, testimonials near the decision.`,

  takeaways: [
    `UGC shows one person using your product. A testimonial shows a buyer vouching for it. A vox pop shows many strangers reacting to one question.`,
    `They aren't rivals. Vox pop earns attention and recognition, UGC shows the product in use, and testimonials reassure people close to buying.`,
    `Vox pop isn't cheaper UGC. You pay for a host, a crew and street time, and you get contrast between people that one creator can't give you.`,
    `Real voices don't always win trust. In one experiment, viewers trusted vox pops less than an expert, yet the vox pops shifted their opinions more.`,
    `Anyone paid, employed or cast should be disclosed under India's endorsement guidelines. A staged street interview presented as spontaneous misleads viewers.`,
    `Skip vox pop when people can't try the product in a minute, when a claim needs an expert, or when the topic is too private for a footpath.`,
  ],

  body: [
    `Your ad account wants new creative every week. A user-generated content (UGC) platform has sent over its rate card. A happy customer has offered to record a review. And someone has dropped a street interview into the team WhatsApp group with one line: "can we do this?"`,

    `All three put real people on screen, but they don't do the same job.`,

    `We should say where we stand. Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands, so we make one of the three.`,

    `We've still written the comparison we'd want as a buyer, including the cases where a vox pop is the wrong call. You'll leave with a comparison table, a format picker, a quiz and a simple test to run before you spend.`,

    // ---------------------------------------------------------------- 1. The short answer
    { type: 'h2', id: 'short-answer', text: 'Vox pop vs UGC vs testimonials: the short answer', toc: 'The short answer' },

    `Use a vox pop when you want viewers to see how people like them think. UGC is for showing the product in use. A testimonial earns its place when a buyer is close to deciding and wants to hear from someone who already bought.`,

    `Each row below is a decision you'll make whichever format you pick. Read across, not down.`,

    {
      type: 'table',
      caption: 'Vox pop, UGC and testimonials side by side',
      head: ['What differs', 'Vox pop', 'UGC', 'Testimonial'],
      rows: [
        ['Who speaks', 'Strangers who stopped for one question', 'A customer, or a creator paid to post like one', 'A customer who has already bought'],
        ['Who picks them', 'The street, inside a planned setup', 'The brand or a creator platform', 'The brand, from happy customers'],
        ['What is scripted', 'The question and setup, never the answers', 'Often a brief, sometimes a full script', 'Usually prompted, sometimes written out'],
        ['What drives the cost', 'A host, a crew, street hours and the edit', 'Creator fees, product sent out, usage rights', 'Time spent finding customers willing to film'],
        ['Funnel stage it suits', 'Top and middle: attention and consideration', 'Middle: showing use and routine', 'Bottom: the decision itself'],
        ['What it shows best', 'Contrast between many people', 'One person using the product', 'One person vouching for it'],
        ['Main risk', "You can't control what strangers say", 'Reads as an ad when over-briefed', 'Sounds rehearsed or too glowing'],
        ['Consent and disclosure', 'A release from everyone featured; label staff or cast', "Disclose the creator's paid or gifted link", 'Disclose any payment, gift or connection'],
      ],
      rowHeaders: true,
    },

    `Look at the last row first. The honesty rules don't relax because a video looks casual, and [the disclosure section](#disclosure) covers them.`,

    `The deck below takes one decision per slide and goes a level deeper than the table.`,

    {
      type: 'widget',
      widget: 'slides',
      id: 'compare-deck',
      props: {
        title: 'Vox pop, UGC and testimonials, one decision at a time',
        slides: [
          {
            heading: 'What are you paying for?',
            points: [
              '**Vox pop:** planning the question, a host, a crew, hours on the street, releases and the edit.',
              '**Creator UGC:** a fee per creator, the product you send, and usage rights if it runs as an ad.',
              '**Testimonial:** little cash and a lot of asking. Finding customers willing to film is the slow part.',
            ],
          },
          {
            heading: 'Where does it sit in the funnel?',
            points: [
              "**Vox pop:** the top and middle, where people don't know you yet or are weighing you up.",
              '**UGC:** the middle, where people want to see the product inside a real day.',
              '**Testimonial:** the bottom. The product page, the checkout, a retargeting ad.',
            ],
          },
          {
            heading: 'What do you control?',
            points: [
              '**Vox pop:** the question, the setup, who is approached, the follow-up and the edit. Not the answers.',
              '**UGC:** the brief, the choice of creator, the script and any reshoots.',
              '**Testimonial:** who you ask and what you prompt. Not how believable they sound.',
            ],
          },
          {
            heading: 'What usually goes wrong?',
            points: [
              '**Vox pop:** a weak question gets polite answers, and a quiet street gives you little to cut.',
              '**UGC:** over-briefing. The creator reads the brief back, and it sounds like an ad.',
              '**Testimonial:** too much polish. Every line is a high point, so none of them lands.',
            ],
          },
          {
            heading: 'What has to be disclosed?',
            text: 'Any payment, gift, job or casting behind the person on screen.',
            points: [
              '**Vox pop:** staff or cast people, and anything that could shape an answer.',
              "**UGC:** the creator's paid or gifted relationship.",
              '**Testimonial:** discounts, refunds, gifts or a personal tie to the brand.',
            ],
          },
        ],
      },
    },

    // ---------------------------------------------------------------- 2. UGC
    { type: 'h2', id: 'what-is-ugc', text: 'What is UGC?' },

    `UGC is content about a product made by people outside the brand. It comes in two kinds: organic UGC, which customers post on their own, and creator UGC, which people are paid to make in a customer's style.`,

    `When a brand says it is "buying UGC", it means the second kind. You can't buy the first. You can only earn it, then ask permission to reuse it.`,

    {
      type: 'definition',
      id: 'ugc',
      term: 'User-generated content (UGC)',
      text: `User-generated content (UGC) is video, photos or reviews about a product made by people outside the brand. In D2C advertising the term now usually means creator UGC: short, phone-shot videos made to a brief and handed over for the brand to post or run as ads.`,
    },

    {
      type: 'comparison',
      title: 'Organic UGC or creator UGC',
      left: {
        label: 'Organic UGC',
        items: ['Made by a real customer, unprompted', 'Posted on their own account', 'Needs their permission before you reuse it', "Can't be briefed, scheduled or reshot"],
      },
      right: {
        label: 'Creator UGC',
        items: ['Made by a creator you pay in money, product or both', 'Delivered to you to post or run as an ad', 'Briefed, sometimes scripted, reshot on request', 'The paid relationship should be disclosed'],
      },
      verdict: 'Organic UGC is the most believable and the least predictable. Creator UGC trades some of that belief for control.',
    },

    `Creator UGC is now a category of its own, with platforms that match brands to creators.`,

    { type: 'h3', id: 'what-ugc-does-well', text: 'What UGC does well' },

    `UGC is the best of the three at showing use. A creator can open the jar in their own kitchen, wear the shirt to work or set up the desk lamp at midnight. Time and place come with it.`,

    `That matters for products whose value shows over days of use. A street interview has a minute with a stranger. It can't follow anyone home.`,

    { type: 'h3', id: 'where-ugc-breaks', text: 'Where UGC breaks' },

    `The risk is the brief.`,

    `A common creator template has four beats: a hook, a problem, the product, a result. Viewers who meet that shape often enough learn to spot it, and then the clip reads as an ad in a casual shirt.`,

    `Younger Indian audiences are well placed to spot it. In [YouTube's research with SmithGeiger](https://www.exchange4media.com/marketing-news/83-gen-z-create-content-and-80-want-brands-playing-along-survey-149389.html), 83% of Indian Gen Z said they consider themselves creators[^youtube-gen-z]. People who make content know what a read-out brief sounds like.`,

    `None of this makes UGC weak. A good creator with a light brief will show a product in use better than any street interview can. Our advice if you buy it: brief the problem, not the lines, and keep the creator's phrasing even when it isn't yours. A light brief fits on one phone screen:`,

    {
      type: 'list',
      items: [
        "**The problem, in a customer's words.** Lift it from reviews or support chats.",
        '**The one thing the product must be seen doing.** Just one.',
        "**What they mustn't claim.** Health, safety and performance claims need evidence a creator can't supply.",
        '**The disclosure label,** agreed before filming.',
      ],
    },

    // ---------------------------------------------------------------- 3. Testimonials
    { type: 'h2', id: 'what-is-a-testimonial', text: 'What is a testimonial video?', toc: 'What is a testimonial?' },

    `A testimonial video is an existing customer telling the camera that your product worked for them. It's chosen and published because it's positive, which is both its strength and its limit.`,

    {
      type: 'definition',
      id: 'testimonial-video',
      term: 'Testimonial video',
      text: 'A testimonial video is a short video in which an existing customer describes their experience of a product and recommends it.',
    },

    `Start with your WhatsApp, where customer praise often lands as a screenshot or a voice note. The video version means asking that customer to say it again on camera, and that ask is most of the work.`,

    `The strength is timing. A buyer close to deciding often has one question left: has someone like me bought this and not regretted it? A testimonial answers that directly, in a voice that isn't yours.`,

    `So testimonials earn their place where hesitation peaks: the product page, the checkout, a retargeting ad. Put one at the top of a cold feed and we think it mostly gets skipped, because the viewer hasn't met the problem yet.`,

    { type: 'h3', id: 'testimonial-limits', text: 'The limits of a testimonial' },

    `Everyone knows the brand picked it. Viewers discount a testimonial the way they discount a reference letter: useful, but chosen.`,

    `Polish makes it worse. Prompted lines, perfect light and three takes of the same smile all push a testimonial toward an ad. We come back to why in [peaks and pauses](#peaks-and-pauses).`,

    `The rule book adds a limit of its own. The ASCI Code, Indian advertising's self-regulatory code, says claims of fact should be ["capable of substantiation"](https://www.ascionline.in/the-asci-code-guidelines/)[^asci-code], and a happy customer's word isn't that substantiation. If your product makes a checkable claim, such as a health effect, the proof has to come from evidence.`,

    {
      type: 'callout',
      tone: 'tip',
      title: 'Ask for a story, not a score',
      text: '"What were you using before, and what made you switch?" gets a better testimonial than "How would you rate us?". The same trick works on the street.',
    },

    // ---------------------------------------------------------------- 4. Vox pop
    { type: 'h2', id: 'what-is-a-vox-pop', text: 'What is a vox pop?' },

    `A vox pop is a short street interview: one question, many strangers, no script for the answers. What it sells is the contrast between them.`,

    {
      type: 'definition',
      id: 'vox-pop',
      term: 'Vox pop video',
      text: `A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea. More in [what vox pop content is](/blog/what-is-vox-pop-content).`,
    },

    `The planning is real, and so are the answers. We plan the objective, the question, the setup and who we approach. We don't script what strangers say, and the one thing we can't control is exactly how a stranger will respond in the moment.`,

    `A 2009 student paper saw the same split in TV news. Its [conversation analysis of vox pops on Mexican television](https://publications.essex.ac.uk/esj/article/id/198/) argues they have a recognisable "fingerprint": they look spontaneous but follow a set pattern of questions and cuts[^vox-pop-fingerprint]. That's fair. The structure is built. The answers aren't.`,

    { type: 'h3', id: 'what-only-a-vox-pop-can-do', text: 'What only a vox pop can do' },

    `Our library is full of games as well as questions: guess the price, blindfold tastings, a blind pick, sell to win. Each needs someone who doesn't know the answer. That's the part UGC can't easily copy, because a briefed creator already knows how the game ends.`,

    {
      type: 'video',
      brand: 'CircleStore',
      title: '44 Circlestore - Sell To Win 25-04',
      caption: 'CircleStore, "Sell To Win". The title names the game, and a game needs players who don\'t know the ending.',
    },

    `The other thing a vox pop gives you is disagreement. One creator can't argue with themselves. Five strangers can, and the viewer quietly picks a side.`,

    // ---------------------------------------------------------------- 5. Social proof vs social mirror
    { type: 'h2', id: 'social-proof-vs-social-mirror', text: 'Social proof or social mirror: what does each format sell?', toc: 'Social proof vs the social mirror' },

    `Testimonials, and UGC built on reviews, sell social proof: look how many people like this. A vox pop works best as a social mirror: look, that person is just like you.`,

    `The difference shows up in the questions brands ask. Treat a street interview as a social-proof machine and you end up asking about yourself: the packaging, the price, whether people would recommend you. Ask a polished question and you get a polite answer nobody remembers.`,

    {
      type: 'comparison',
      title: 'Social proof and the social mirror',
      left: {
        label: 'Social proof',
        items: ['"Look how many people like us."', 'Answers "is this safe to buy?"', 'Works on viewers who are already interested', 'Testimonials, reviews, star ratings, review-style UGC'],
      },
      right: {
        label: 'Social mirror',
        items: ['"Look, that person is just like you."', 'Answers "is this about me?"', "Works before the viewer cares who you are", "A vox pop built on a question about the viewer's life"],
      },
      verdict: "Proof reassures someone who is already looking. A mirror stops someone who wasn't.",
    },

    `A mirror question is about the viewer's life, with the product close by. The viewer answers it in their head before the stranger on screen finishes. That silent answer is the moment we plan for.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'two-framings',
      props: {
        title: 'One product, two framings',
        before: {
          label: 'Social proof question',
          text: '"Would you recommend this bedsheet to a friend?"',
          points: ['Asks for a verdict on a brand they met ten seconds ago', 'Gets a polite yes', 'Sounds like a testimonial, minus the trust'],
        },
        after: {
          label: 'Social mirror question',
          text: '"Be honest. How old is the bedsheet on your bed right now?"',
          points: ["About their life, so it's easy to start", 'Gets a laugh, a confession or an argument', 'The viewer answers it too, silently'],
        },
        note: 'Same product, same street. The second question puts the viewer in the video, and the product arrives after the answer.',
      },
    },

    `The mirror cuts both ways. A viewer who can't see themselves in anyone on screen scrolls on. Who gets approached matters as much as what gets asked, which is why participant selection is one of the things we plan before a shoot.`,

    `TV news has the same blind spot. A [study of 2,000 Belgian TV vox pops](https://informahealthcare.com/doi/abs/10.1080/17512786.2016.1223551) found ethnic minorities and people with disabilities under-represented. Journalists hardly ever told viewers that the people shown might not represent everyone[^beckers-walgrave].`,

    `A brand has every reason to cast the street more widely than that.`,

    // ---------------------------------------------------------------- 6. Not cheaper UGC
    { type: 'h2', id: 'not-cheaper-ugc', text: 'Is vox pop just cheaper UGC?', toc: "Why 'cheaper UGC' is the wrong frame" },

    `No. They buy different things. UGC buys one person using your product. A vox pop buys contrast: several strangers answering the same question in different ways, which no single creator can give you.`,

    `Comparing them on cost per video is the wrong frame. It's like choosing between a product photo and a shop window because both show the product. Pick by the job first, then check the price.`,

    { type: 'h3', id: 'where-the-money-goes', text: 'Where the money goes' },

    `A vox pop's cost sits in people and hours. Someone plans the question and the follow-ups. A host has to stop strangers and keep them talking. A crew handles framing and audio on a noisy footpath, and an editor finds the few seconds that carry each video.`,

    `Our packages are 5 videos for ₹50,000 (₹10,000 each), 10 for ₹85,000 (₹8,500 each) or 20 for ₹1,50,000 (₹7,500 each), with GST extra where applicable. Every package covers the planning, the interviewer, the street shoot and the edit, and [our vox pop pricing](/pricing) lists the rest.`,

    `We won't quote UGC rates, because they vary by creator, platform and usage terms.`,

    {
      type: 'callout',
      tone: 'warning',
      title: "Comparing quotes? Compare what's included",
      text: 'A low price per video can hide the parts you pay for later. Check five things on every quote:',
      items: [
        'Who writes the questions or the brief',
        'Who finds the people on camera',
        'Whether you can run it as an ad, and when usage rights pass to you',
        'Who collects releases and handles disclosure',
        'Which revisions are included',
      ],
    },

    `The costliest mistake isn't on any rate card. It's a good video doing the wrong job, like a polished testimonial shown to people who have never heard of you.`,

    // ---------------------------------------------------------------- 7. Do real voices persuade?
    { type: 'h2', id: 'do-real-voices-persuade', text: 'Do real voices always persuade?' },

    `Not always, and not in the way you might expect. In one experiment, viewers trusted vox pops less than an expert quoting a poll, yet the vox pops moved their personal opinions more.`,

    `The study was [a 2022 web experiment with TV news items in Flanders](https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html). Items with vox pops were rated less attractive and less trustworthy than items with an expert presenting poll results[^vox-pop-vs-expert]. Then the researchers measured what viewers themselves believed.`,

    { type: 'quote', text: "Vox pops do influence audiences' personal opinion more strongly.", attribution: 'The 2022 Communications study, from its abstract', source: 'vox-pop-vs-expert' },

    `That fits an older line of research. Media scholars call it [exemplification](https://doi.org/10.1177/009365094021001004): in Brosius and Bathelt's 1994 experiments, individual cases swayed people's judgments more than base-rate statistics did[^exemplification].`,

    `Trust and persuasion, in other words, are different things.`,

    `Viewers can doubt a stranger and still be moved by one. Two surveys, one global and one Indian, show where that leaves a brand.`,

    { type: 'stat', value: '88%', label: "of people in Nielsen's 2021 global survey trusted recommendations from people they know, more than any other source", source: 'nielsen-trust' },
    { type: 'stat', value: '77%', label: 'of Indian shoppers surveyed in 2024 discovered new brands on social media', source: 'pwc-india' },
    { type: 'stat', value: '81%', label: 'used social media to check reviews before buying, yet it was the least-trusted channel in the survey', source: 'pwc-india' },

    `Together they say two things. People trust [recommendations from people they know](https://www.nielsen.com/insights/2021/beyond-martech-building-trust-with-consumers-and-engaging-where-sentiment-is-high/) above any other source[^nielsen-trust]. And Indian shoppers, in [PwC's 2024 survey](https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html), use the feed to find and check brands while distrusting it[^pwc-india].`,

    `A testimonial is a recommendation, but from a stranger the brand chose, so it isn't "someone they know". A vox pop is a stranger too. What it can offer is recognition: a person who sounds like the people they know.`,

    { type: 'h3', id: 'what-it-means-for-each-format', text: 'What this means for each format' },

    {
      type: 'list',
      items: [
        '**Vox pop:** expect less trust and more pull. Use it to shift how people see a problem, not to prove a claim.',
        "**UGC:** one vivid example plus a demonstration. Strongest when the creator's own words carry it.",
        '**Testimonial:** a recommendation from a chosen stranger. It reassures people who already want to believe.',
        '**An expert:** in that study, trusted more but moved opinions less. Bring one in when a claim needs authority.',
      ],
    },

    `The format alone doesn't do the work. On the street, what lands is the whole interaction: the setup, the question, who stops, the follow-up past the polite first answer, the reaction and the edit.`,

    // ---------------------------------------------------------------- 8. Peaks and pauses
    { type: 'h2', id: 'peaks-and-pauses', text: 'Why do pauses matter more than peaks in an edit?', toc: 'Peaks and pauses' },

    `Because a big smile, a firm "yes" and a "love it" can all be coached. A three-second pause after a hard question is much harder to coach, and a rehearsed testimonial almost never has one.`,

    `Call the high points peaks: the laugh, the strong opinion, the surprising take. The low points are valleys: the pause, the frown, the sentence that starts and doesn't finish. The tidy instinct in an edit is to cut every valley.`,

    `We think that cuts the part that makes the clip believable.`,

    `A caution, though. Nobody can read the truth off a face, and a pause doesn't prove anyone is honest. What a pause does show is that the question landed somewhere. The viewer gets to watch a decision happen.`,

    { type: 'h3', id: 'edit-for-the-turn', text: 'How to edit for the turn' },

    `One way to edit for it is a peak-and-valley map. It takes five moves:`,

    {
      type: 'list',
      ordered: true,
      items: [
        '**Mark the footage first.** Before any cut, note every peak and every valley in the raw answers.',
        '**Find the revealing valley.** Look for the one pause or stumble that says more than any peak.',
        '**Build around it.** Make that valley the centre of the edit.',
        '**Keep at least two.** A final cut with no valleys at all starts to look like an ad.',
        '**Put a valley before your best peak.** The turn from hesitation to a clear answer is often your opening.',
      ],
    },

    `When this doesn't work: a pause with nothing after it. If the answer never comes, the valley is dead air, so cut it.`,

    `None of this is about format. A UGC creator can keep a pause in, and a testimonial can include the moment someone hesitates. Vox pop just hands you more valleys, because nobody rehearsed.`,

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'peak-or-pause',
      props: {
        title: 'The same answer, edited two ways',
        before: {
          label: 'Cut to the peak',
          text: 'Host: "Would you buy it at that price?" Participant: "Yes, definitely. It\'s great."',
          points: ['Tight and clean', 'Sounds like every testimonial', 'Leaves the viewer nothing to watch happen'],
        },
        after: {
          label: 'Kept the pause',
          text: 'Host: "Would you buy it at that price?" The participant turns the tag over and says nothing for three seconds. Participant: "Actually, yes. I didn\'t think I\'d say that."',
          points: ['Three seconds longer', 'The viewer sees a decision being made', 'The pause can be the opening shot'],
        },
        note: 'An imagined example to show the edit. The lines are invented, not taken from a real shoot.',
      },
    },

    `Product reactions are where this shows most.`,

    {
      type: 'video',
      brand: 'Clotrio',
      title: '21 Clotrio - Two Washes',
      caption: 'Clotrio, "Two Washes", from our library. A product reaction, not a testimonial.',
    },

    `A testimonial tells you how the story ended. A reaction lets you watch the middle of it.`,

    // ---------------------------------------------------------------- 9. Influencers
    { type: 'h2', id: 'what-about-influencers', text: 'Where do influencers fit next to UGC and vox pop?', toc: 'What about influencers?' },

    `An influencer posts to their own followers and lends you their relationship with them. A UGC creator makes video for your account or your ads. A vox pop borrows nobody's audience; its pull comes from the question.`,

    `That relationship has a name. Sociologists Horton and Wohl called it [para-social interaction](https://doi.org/10.1080/00332747.1956.11023049) in 1956: a media figure who talks to the camera like a friend creates "intimacy at a distance"[^para-social].`,

    `It shows up in buying, too. A [2020 study of four French beauty influencers' audiences](https://ideas.repec.org/a/eee/joreco/v53y2020ics0969698918307963.html) found that both trust in the creator and the one-sided bond viewers feel were linked to wanting to buy[^sokolova-kefi].`,

    `India's creator economy is large enough to take seriously. [BCG estimates](https://www.bcg.com/publications/2025/india-from-content-to-commerce-mapping-indias-creator-economy) that 2 to 2.5 million monetised creators already influence $350 to 400 billion of consumer spending a year[^bcg-creators].`,

    {
      type: 'table',
      caption: 'Influencer posts, creator UGC and vox pop: what you are paying for',
      head: ['What differs', 'Influencer post', 'Creator UGC', 'Vox pop'],
      rows: [
        ['Whose audience', "The creator's followers", 'Yours, or whoever your ads reach', 'Yours, or whoever your ads reach'],
        ['What you pay for', 'Reach and an existing relationship', 'The video and the right to use it', 'The video and the right to use it'],
        ['Who is on screen', 'A face the audience already knows', 'A creator in the role of a customer', 'Strangers who stopped for a question'],
        ['What carries it', "The creator's credibility", 'The demonstration', 'The question and the contrast'],
      ],
      rowHeaders: true,
    },

    `We think there's a middle route: a recurring face of your own. A host who fronts every episode of a vox pop series can build familiarity the way a creator does, and so can a founder who holds the mic. Our interviewer can ask the questions, or your founder can, with our team beside them.`,

    {
      type: 'video',
      brand: 'FyndFlow',
      title: '98 Who should Pay Fyndflow',
      caption: 'FyndFlow, "Who should Pay". One of the videos on our founders page, and the question is the title: who should pay?',
    },

    `Whichever face you pick, viewers should know who they're watching. AI-made faces are where that breaks first.`,

    // ---------------------------------------------------------------- 10. AI
    { type: 'h2', id: 'ai-street-interviews', text: 'Can AI make street interviews and testimonials?', toc: "AI-made 'street interviews'" },

    `It can make something that looks like one. Generated hosts, generated strangers and AI "UGC" avatars are easy to produce. What AI can't produce is a real person's real answer, and a fake presented as real misleads the viewer.`,

    `Fakes also have a practical cost. In [NielsenIQ's 2024 study](https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/), viewers rated AI-generated ads as more annoying and confusing than traditional ones, and even the better AI ads were less memorable[^nielseniq-ai].`,

    `The ethical problem is simpler. A street interview's whole claim is that these people were stopped, asked and answered. Generate the people, cast them or feed them lines, then present the result as spontaneous, and you've made an ad that lies about what it is.`,

    `So is a testimonial from a customer who doesn't exist, or a "customer" who is really on the payroll.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'Our position',
      text: "If a person on screen didn't exist, didn't say it or was told what to say, don't present the video as a street interview or as a customer's word.",
    },

    { type: 'h3', id: 'four-checks', text: 'Four checks before you publish' },

    {
      type: 'list',
      ordered: true,
      items: [
        '**Real person.** They exist, and the words are their own.',
        '**Real consent.** They agreed in writing, knowing where the video would run.',
        '**Connection disclosed.** Anyone paid, employed or cast is labelled as such.',
        "**No surprise.** A viewer who learned how it was made wouldn't feel misled.",
      ],
    },

    `AI has a place around the footage: drafting captions, testing headlines, sorting question ideas. It just shouldn't be the people in it.`,

    `Before the rules, a quick check. Six short scenes; label each one.`,

    {
      type: 'widget',
      widget: 'quiz',
      id: 'spot-the-format',
      props: {
        title: 'Spot the format',
        intro: 'Pick the format each scene describes. One point for each right answer.',
        questions: [
          {
            q: 'A host outside a metro exit asks ten strangers "salt or sweet?", and the edit cuts between their answers.',
            options: [
              { text: 'Vox pop', points: 1 },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 0 },
              { text: 'Influencer post', points: 0 },
              { text: 'Staged ad', points: 0 },
            ],
            explain: "One question, many strangers, and the contrast carried by the edit. That's a vox pop.",
          },
          {
            q: 'A creator films their morning routine with a hair oil a brand sent them, and the brand runs the clip as an ad.',
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 1 },
              { text: 'Testimonial', points: 0, why: 'Close, but the creator was sent the product to make content, not chosen from existing buyers.' },
              { text: 'Influencer post', points: 0, why: "It runs on the brand's ad account, not to the creator's followers." },
              { text: 'Staged ad', points: 0 },
            ],
            explain: 'Made in a customer style, gifted or paid, run by the brand: creator UGC. The connection needs disclosing.',
          },
          {
            q: 'A customer who bought a mattress six months ago tells the camera why they would buy it again. The brand picked them from its reviews.',
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 1 },
              { text: 'Influencer post', points: 0 },
              { text: 'Staged ad', points: 0 },
            ],
            explain: 'An existing buyer, chosen by the brand, vouching for the product. A testimonial.',
          },
          {
            q: 'A fitness creator with a large following posts a paid reel about protein bars on their own account.',
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 0, why: 'It reaches their own followers, which makes it influencer marketing.' },
              { text: 'Testimonial', points: 0 },
              { text: 'Influencer post', points: 1 },
              { text: 'Staged ad', points: 0 },
            ],
            explain: "It runs on the creator's account to their followers. That's an influencer post, and it needs a clear label.",
          },
          {
            q: "A brand films its own staff as passers-by praising the product on a busy road, and posts it as a street interview.",
            options: [
              { text: 'Vox pop', points: 0, why: 'It borrows the look of one. Staff presented as strangers make it something else.' },
              { text: 'UGC', points: 0 },
              { text: 'Testimonial', points: 0 },
              { text: 'Influencer post', points: 0 },
              { text: 'Staged ad', points: 1 },
            ],
            explain: 'Staff or cast people presented as spontaneous passers-by mislead viewers. Disclose the connection, or stop calling it a street interview.',
          },
          {
            q: 'A customer posts an unboxing of your speaker on their own account without being asked or paid.',
            options: [
              { text: 'Vox pop', points: 0 },
              { text: 'UGC', points: 1 },
              { text: 'Testimonial', points: 0, why: "Nobody chose it and it wasn't made for you. It's organic UGC." },
              { text: 'Influencer post', points: 0 },
              { text: 'Staged ad', points: 0 },
            ],
            explain: 'Organic UGC: made by a customer, unprompted. Ask their permission before you reuse it.',
          },
        ],
        results: [
          { min: 0, title: 'Worth a second read', text: 'The lines blur in practice. Go back to [the comparison table](#short-answer) and try again.' },
          { min: 3, title: 'Mostly there', text: 'You know the formats. The tricky ones are usually the staged ad and the two kinds of UGC.' },
          { min: 5, title: 'You can spot them', text: 'You can tell the formats apart, including the fake one. Now pick the one your objective needs.' },
        ],
      },
    },

    // ---------------------------------------------------------------- 11. Disclosure
    { type: 'h2', id: 'disclosure', text: 'When must a payment, gift or connection be disclosed?', toc: 'Disclosure' },

    `Whenever someone on screen has a material connection to your brand: payment, a gifted product, a job with you or a casting. India's endorsement guidelines ask for that connection to be stated clearly.`,

    `The Department of Consumer Affairs' [endorsement guide](https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf) from January 2023 asks for labels such as "advertisement", "sponsored" or "paid promotion"[^doca-endorsement]. [ASCI's influencer guidelines](https://www.ascionline.in/social/wp-content/uploads/2025/04/ASCI-Influencer-Guidelines.pdf) also require paid or gifted content to carry a clear disclosure[^asci-influencer].`,

    `Both were written with influencers in mind. In our view the principle travels to every format here: if a viewer would see the video differently knowing about the connection, tell them.`,

    {
      type: 'table',
      caption: 'Disclosure by format: the usual connection and what to do',
      head: ['Format', 'The usual connection', 'What to do'],
      rows: [
        ['Creator UGC', 'Paid in money, product or both', 'Label it as paid, wherever it runs'],
        ['Influencer post', 'A fee, gifted product or a barter deal', "A clear label the viewer can't miss"],
        ['Testimonial', 'A discount, refund, gift or personal tie', 'State the connection, and never script the praise'],
        ['Vox pop', 'Staff, cast people or a thank-you incentive', 'Never pass off staff or cast as strangers'],
      ],
      rowHeaders: true,
    },

    `Vox pops raise one question the others don't: the small thank-you. Our FAQ says the people we interview [sometimes get a simple incentive](/faq/do-participants-get-anything), ideally something physical or redeemable on the spot. It never decides what they say, and the exact incentive is agreed in pre-production.`,

    `Whether a thank-you like that needs a label depends on the facts, and that's a question for a lawyer. What we can say is where the line clearly sits.`,

    `Staff presented as passers-by, or actors presented as strangers, are a connection hidden from the viewer.`,

    `Then there's the host. When an interviewer speaks for your brand, we agree the introduction before the shoot, so people on the street know who's asking. That's fair to them, and it protects you.`,

    { type: 'h3', id: 'consent-comes-first', text: 'Consent comes first' },

    `Disclosure is about the viewer. Consent is about the person on screen. Get a signed release from everyone you feature and tell them where the video will appear.`,

    `India's data protection rules [are coming into force in phases through 2027](https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html)[^dpdp-rules], so check your release forms with a lawyer. Never feature anyone under 18 without a parent's written consent. [Our guide to street interview consent in India](/blog/street-interview-consent-india) goes through releases and permissions in detail.`,

    {
      type: 'callout',
      tone: 'note',
      title: 'General information only',
      text: 'This section is general information, not legal advice. Rules on endorsements and personal data change, so check your own case with a lawyer.',
    },

    // ---------------------------------------------------------------- 12. Choose by objective
    { type: 'h2', id: 'choose-by-objective', text: 'Which format fits which objective?', toc: 'Choose by objective' },

    `Start with the job the video has to do, then pick the format. We plan each video around one main objective, and each of the six below has a format that tends to suit it.`,

    {
      type: 'table',
      caption: 'Six video jobs and the format that tends to suit each',
      head: ['The job', 'Best fit', 'Why', 'Also works'],
      rows: [
        ['Create curiosity', 'Vox pop', 'A guess or a debate opens a question viewers want closed', 'UGC with a strong opening line'],
        ['Address a specific problem', 'Vox pop, then UGC', 'Strangers name the problem; UGC shows the fix', 'A testimonial from someone who had it'],
        ['Generate product interest', 'Vox pop product reaction', 'First reactions from people who have never seen it', 'A creator unboxing'],
        ['Demonstrate a benefit', 'UGC', 'Showing use needs time, a home and a routine', 'Vox pop, if the benefit shows in seconds'],
        ['Build social proof', 'Testimonial', 'A buyer saying it worked answers "has anyone like me?"', 'Vox pop for recognition, not proof'],
        ['Drive consideration', 'Vox pop and testimonial together', 'Strangers voice the objection; buyers answer it', 'Comparison UGC'],
      ],
      rowHeaders: true,
    },

    `If two rows apply, you probably need two videos, not one video doing two jobs.`,

    `The picker below asks five questions and points to a starting format, with reasons. When your answers tie, it leans away from vox pop. We make vox pops, so we built our own bias out of it.`,

    {
      type: 'widget',
      widget: 'picker',
      id: 'format-picker',
      props: {
        title: 'Which format should you start with?',
        intro: 'Five questions. The format your answers point to most often wins. Treat it as a starting point.',
        questions: [
          {
            q: 'What should this video do first?',
            options: [
              { text: "Stop people who don't know us", outcomes: ['vox-pop'] },
              { text: 'Show the product being used', outcomes: ['ugc'] },
              { text: 'Reassure people about to buy', outcomes: ['testimonial'] },
              { text: 'Answer an objection we keep hearing', outcomes: ['mix'] },
            ],
          },
          {
            q: 'What are you selling?',
            options: [
              { text: 'A physical product people can try in seconds', outcomes: ['vox-pop'] },
              { text: 'A product that needs days or a routine to show', outcomes: ['ugc'] },
              { text: 'A service or app people have opinions about', outcomes: ['vox-pop', 'mix'] },
              { text: 'Something with health, safety or performance claims', outcomes: ['expert'] },
            ],
          },
          {
            q: 'Where will it run?',
            options: [
              { text: "Feeds, to people who don't follow us", outcomes: ['vox-pop'] },
              { text: "Ads aimed at people who've visited us", outcomes: ['ugc', 'testimonial'] },
              { text: 'The product page or checkout', outcomes: ['testimonial'] },
              { text: 'Several places over a few weeks', outcomes: ['mix'] },
            ],
          },
          {
            q: 'What do you already have?',
            options: [
              { text: 'Happy customers willing to film', outcomes: ['testimonial'] },
              { text: 'Creators we trust, or budget for them', outcomes: ['ugc'] },
              { text: 'A question our category argues about', outcomes: ['vox-pop'] },
              { text: 'A founder who would hold the mic', outcomes: ['vox-pop'] },
            ],
          },
          {
            q: 'How personal is the topic?',
            options: [
              { text: 'Everyday: food, home, style, money habits', outcomes: ['vox-pop'] },
              { text: 'Personal: bodies, relationships, real debt', outcomes: ['ugc', 'testimonial'] },
              { text: 'Clinical or regulated', outcomes: ['expert'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'expert',
            title: 'Put an expert first',
            text: "Claims about health, safety or performance need evidence and a qualified voice. Street answers and testimonials can't substantiate them. Lead with the expert, then add real voices for the human side.",
            reasons: ['India\'s ad code expects factual claims to be backed by evidence', 'A real voice can follow the proof, never replace it'],
          },
          {
            id: 'mix',
            title: 'Use two formats in sequence',
            text: 'Open with a vox pop that names the objection in strangers\' words, follow with UGC that shows use, and close with a testimonial near the decision. See [using them together](#using-them-together).',
            reasons: ['Each format takes a different step with the same viewer', 'One repeated question ties them together'],
          },
          {
            id: 'ugc',
            title: 'Start with creator UGC',
            text: 'Your product needs time, a home or a routine to show. Brief a creator lightly, ask for their real routine and keep their words.',
            reasons: ['Showing use is what UGC does best', 'A creator can film over days, a street interview cannot'],
          },
          {
            id: 'testimonial',
            title: 'Start with testimonials',
            text: 'Your buyer is close to deciding and wants to hear from someone who already bought. Ask customers for a story, disclose any gift or discount, and place the clip near checkout.',
            reasons: ['It answers the last question before a purchase', 'It costs time more than money'],
          },
          {
            id: 'vox-pop',
            title: 'Start with a vox pop',
            text: 'Your job is attention or recognition, and your product can be handed to a stranger or argued about. Plan one question per video, with a follow-up for each.',
            reasons: ['Strangers can react in seconds', 'The contrast between answers carries the video'],
          },
        ],
      },
    },

    { type: 'h3', id: 'test-before-you-commit', text: 'Test before you commit' },

    `Torn between two formats? Test them against each other on one objective. A small, fair test beats an argument in a meeting.`,

    {
      type: 'steps',
      id: 'test-two-formats',
      title: 'Test two formats fairly, in five steps',
      intro: "Do this before you put a quarter's budget behind one format.",
      howTo: true,
      steps: [
        { name: 'Pick one objective', text: 'Choose one of the six jobs above. A test with two goals tells you nothing about either.' },
        { name: 'Hold everything else steady', text: 'Use the same product, the same offer, a similar length and the same posting window. Only the format changes.' },
        { name: 'Make a few of each', text: "One video per format is a coin toss. Two or three of each won't prove anything statistically, but they stop one lucky clip from deciding for you." },
        {
          name: "Show both to people who don't follow you",
          text: "Instagram's [Trial Reels](https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/) show a Reel to non-followers first[^trial-reels]. On YouTube Shorts, compare how often viewers [stayed to watch past the first seconds](https://support.google.com/youtube/answer/12220281)[^youtube-stayed].",
        },
        {
          name: 'Read the comments as well as the numbers',
          text: "In January 2025, Instagram's head named [watch time, likes and sends](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/) as the signals that matter most for ranking[^instagram-signals]. Sends, arguments in the replies and tagged friends tell you people talked about the video.",
        },
      ],
    },

    `Whatever wins, write down why next to the brief, because the next objective may need the other format.`,

    { type: 'cta', text: 'Want to see how your own product does on the street before you decide? The trial\'s scope, the number of videos and any fee are confirmed in writing.' },

    // ---------------------------------------------------------------- 13. Using them together
    { type: 'h2', id: 'using-them-together', text: 'How do vox pop, UGC and testimonials work together?', toc: 'Using them together' },

    `In sequence, with one recognisable idea running through all three, so each video picks up where the last one left off with the same viewer.`,

    `The idea behind the sequence is familiarity. Robert Zajonc showed in 1968 that [people tend to like what they have seen more often](https://en.wikipedia.org/wiki/Mere-exposure_effect). Later reviews found the effect is real but modest, and that it fades when the same thing repeats too much[^mere-exposure].`,

    `So vary the format and repeat one recognisable element: the same question on screen, the same opening line, the same colour. We call the sequence an [exposure ladder](/blog/vox-pop-glossary#exposure-ladder). Each rung is a different shape, and every rung feels like the same brand.`,

    {
      type: 'widget',
      widget: 'timeline',
      id: 'exposure-ladder-plan',
      props: {
        title: 'One question, five shapes, two weeks',
        intro: 'An illustration for one product. The days are a suggestion; the repeated question is the point.',
        items: [
          {
            when: 'Day 1',
            title: 'The vox pop',
            text: 'Strangers answer the question your category argues about. The viewer thinks, "that could be me."',
            tasks: ['Put the question on screen in the first second', 'Keep at least one pause in the edit'],
          },
          { when: 'Day 3', title: 'The carousel', text: "The three best answers as slides, with the question on the first slide and the viewer's turn on the last." },
          {
            when: 'Day 6',
            title: 'The UGC clip',
            text: 'A creator or customer shows the product in a real routine and answers the same question in their own words.',
            tasks: ['Brief the problem, not the lines', 'Disclose the paid or gifted connection'],
          },
          { when: 'Day 9', title: 'The testimonial', text: 'A buyer tells the story of switching. Run it where people are close to deciding.' },
          { when: 'Day 12', title: 'The comment prompt', text: 'Ask viewers for their own answer to the first question, and reply while people are still in the thread.' },
        ],
      },
    },

    `The order is flexible.`,

    `A viewer may meet the testimonial first and the vox pop a week later, and that's fine. What builds familiarity is meeting you more than once, in shapes different enough that it never feels like the same ad twice.`,

    `For ten more ways to put street interviews to work, read our [street interview marketing playbooks](/blog/street-interview-marketing-playbooks).`,

    // ---------------------------------------------------------------- 14. When vox pop is wrong
    { type: 'h2', id: 'when-vox-pop-is-wrong', text: 'When is vox pop the wrong choice?', toc: 'When vox pop is wrong' },

    `When people can't try or judge the product in a minute, when a claim needs an expert, or when the topic is too private for a footpath. Then UGC, a testimonial or an expert will do the job better.`,

    `We'd rather say this than sell you the wrong video. Our own FAQ says the format works best with physical products, because people can try them and react on camera. In these cases we'd point you elsewhere:`,

    {
      type: 'list',
      items: [
        '**Nothing to hand over and nothing to argue about.** A walkthrough of an app or a policy belongs in UGC or a screen recording.',
        "**Claims that need proof.** Health, safety or performance claims need evidence and a qualified voice. Street answers can't carry them.",
        '**Private topics.** Bodies, health conditions, real debt and relationships in trouble don\'t belong on a footpath. People either perform or walk away.',
        '**A need for representative answers.** A vox pop is not a survey. If you need to know what share of buyers want something, run one.',
        '**Results that take weeks.** A mattress after a month or a planner after a term is a story for UGC or a testimonial.',
        "**Wording that must be exact.** Offers with conditions or regulated lines need a script, and we can't script a stranger.",
      ],
    },

    `TV news shows how easily this goes wrong. A [later study of the same 2,000 Belgian vox pops](https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721) found that a large majority of vox pop news items showed only one point of view[^opinion-balance]. An edit can make a street look unanimous. Plan for contrasting answers, and never treat a vox pop as data about everyone.`,

    `A service with nothing to hand over is a softer case. It can still use a vox pop, as long as the question is about the viewer's money, time or habits.`,

    { type: 'divider' },

    `One thing to try this week: write down the objection you hear most from people who nearly bought. Then sort it.`,

    `If strangers could argue about it, start with a vox pop. If it needs showing over days, it's UGC. A testimonial fits when it needs a buyer's word. And if it needs proof, an expert goes first.`,

    `We control the question, the setup, who we approach, the follow-up and the edit. We can't control how a stranger answers, and [we think that's the point of vox pop](/why-voxpop). [Why brands choose Kreators.Army](/why-kreators) explains how we plan around it.`,
  ],

  faqs: [
    {
      q: 'Is vox pop a type of UGC?',
      a: 'Not quite. UGC is made by customers or creators, usually one person talking to camera, often to a brief. A vox pop is made by a host and crew who take one question to many strangers and edit the contrast between their answers. Both put real people on screen, which is why they get grouped together, but who makes them and what is planned are different.',
    },
    {
      q: 'Which is cheaper: vox pop, UGC or testimonials?',
      a: "It depends on what you count. A testimonial can cost little cash but takes time to find willing customers. Creator UGC is priced per creator, plus product and usage rights. A vox pop pays for a host, a crew, street time and the edit. Kreators.Army's packages start at 5 videos for ₹50,000 (₹10,000 each), GST extra where applicable. Our FAQ lists [what the videos cost](/faq/how-much-does-it-cost) at every package size.",
    },
    {
      q: 'Which works better for ads?',
      a: "No format wins every ad. In our view, vox pop suits people who don't know you yet, because a stranger's reaction to a question is easy to stop for. UGC suits ads that need to show the product in use, and testimonials suit people close to buying. Test two formats on one objective before committing budget, and be wary of anyone who promises results.",
    },
    {
      q: 'Do testimonials need a disclosure in India?',
      a: "Usually, if the customer was paid, gifted the product, given a discount or has another connection to your brand. Endorsement guidance from the Department of Consumer Affairs and ASCI asks for material connections to be stated clearly, and we apply the same test to testimonials. A testimonial also can't stand in for evidence behind a factual claim. This is general information, not legal advice.",
    },
    {
      q: 'Can AI make street interview videos?',
      a: "AI can generate something that looks like a street interview, but not a real person's real answer. Presenting generated or cast people as spontaneous passers-by misleads viewers. NielsenIQ's 2024 research also found viewers rated AI-generated ads as more annoying and less memorable than traditional ones. Use AI for work around the video, such as caption drafts, not for the people in it.",
    },
    {
      q: 'Are UGC creators paid?',
      a: "Usually, when a brand commissions the content. Creator UGC is made by people paid in money, product or both to make videos in a customer's style, which the brand then posts or runs as ads. Organic UGC is different: a customer posts on their own, unpaid, and you need their permission to reuse it. Where a creator is paid, the connection should be disclosed.",
    },
    {
      q: "What's the difference between influencer content and UGC?",
      a: 'Whose audience it reaches. An influencer posts to their own followers and lends you their relationship with them, so you pay for reach and trust. A UGC creator makes videos for your channels or ads, and their own following may not matter at all, so you pay for the video and the right to use it. Both need disclosure when there is a paid connection.',
    },
    {
      q: 'Can we use vox pop, UGC and testimonials together?',
      a: "Yes, and for many brands it makes sense. Use a vox pop to get noticed and name the problem in strangers' words, UGC to show the product in use, and testimonials near checkout to reassure buyers. Keep one recognisable element across all three, such as the same question on screen, so viewers connect them as one brand.",
    },
  ],

  sources: [
    {
      id: 'vox-pop-vs-expert',
      title: 'Power of the people or the expert? The influence of vox pop and expert statements on news-item evaluation, perceived public opinion, and personal opinion',
      url: 'https://www.degruyterbrill.com/document/doi/10.1515/commun-2019-0186/html',
      publisher: 'Communications 47(1), De Gruyter Brill',
      date: '2022',
      note: 'CLAIMS R11/E04: vox pops rated less trustworthy than an expert with poll data, but shifted personal opinion more.',
    },
    {
      id: 'exemplification',
      title: 'The utility of exemplars in persuasive communications',
      url: 'https://doi.org/10.1177/009365094021001004',
      publisher: 'Communication Research 21(1), Brosius and Bathelt',
      date: '1994',
      note: 'CLAIMS E06: single vivid cases sway judgments more than base-rate statistics.',
    },
    {
      id: 'nielsen-trust',
      title: 'Beyond martech: building trust with consumers and engaging where sentiment is high',
      url: 'https://www.nielsen.com/insights/2021/beyond-martech-building-trust-with-consumers-and-engaging-where-sentiment-is-high/',
      publisher: 'Nielsen',
      date: '2021',
      note: 'CLAIMS E09: 88% of global respondents trust recommendations from people they know.',
    },
    {
      id: 'pwc-india',
      title: 'Voice of the Consumer Survey 2024, India: press release',
      url: 'https://pwc.in/press-releases/2024/82-of-indian-consumers-consider-protection-of-personal-data-as-most-crucial-factor-in-building-trust-pwcs-voice-of-the-consumer-survey-2024.html',
      publisher: 'PwC India',
      date: '2024-07',
      note: 'CLAIMS S17/E13: 77% discover brands and 81% seek reviews on social media, yet it is the least-trusted channel.',
    },
    {
      id: 'youtube-gen-z',
      title: '83% Gen Z create content and 80% want brands playing along: survey',
      url: 'https://www.exchange4media.com/marketing-news/83-gen-z-create-content-and-80-want-brands-playing-along-survey-149389.html',
      publisher: 'exchange4media',
      date: '2025-11-17',
      note: 'CLAIMS S27: YouTube and SmithGeiger research; 83% of Indian Gen Z consider themselves creators.',
    },
    {
      id: 'asci-code',
      title: 'The ASCI Code',
      url: 'https://www.ascionline.in/the-asci-code-guidelines/',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS 5.8: claims of objectively ascertainable fact should be capable of substantiation.',
    },
    {
      id: 'vox-pop-fingerprint',
      title: 'The "fingerprint" of vox pop interviews',
      url: 'https://publications.essex.ac.uk/esj/article/id/198/',
      publisher: 'Essex Student Journal 2(1), Ariel Vázquez',
      date: '2009',
      note: 'CLAIMS R12 (weak): one conversation-analysis paper, attributed in the sentence.',
    },
    {
      id: 'beckers-walgrave',
      title: 'How ordinary is the ordinary (wo)man on the street? An analysis of vox pop characteristics in television news',
      url: 'https://informahealthcare.com/doi/abs/10.1080/17512786.2016.1223551',
      publisher: 'Journalism Practice 11, Beckers et al.',
      date: '2017',
      note: 'CLAIMS E07: journalists hardly ever flag that vox pops may not be representative; minorities under-represented.',
    },
    {
      id: 'para-social',
      title: 'Mass communication and para-social interaction: observations on intimacy at a distance',
      url: 'https://doi.org/10.1080/00332747.1956.11023049',
      publisher: 'Psychiatry 19(3), Horton and Wohl',
      date: '1956',
      note: 'CLAIMS R10: the concept of para-social interaction, "intimacy at a distance".',
    },
    {
      id: 'sokolova-kefi',
      title: 'Instagram and YouTube bloggers promote it, why should I buy? How credibility and parasocial interaction influence purchase intentions',
      url: 'https://ideas.repec.org/a/eee/joreco/v53y2020ics0969698918307963.html',
      publisher: 'Journal of Retailing and Consumer Services 53, Sokolova and Kefi',
      date: '2020',
      note: 'CLAIMS R09: both credibility and PSI linked to purchase intention.',
    },
    {
      id: 'bcg-creators',
      title: "From content to commerce: mapping India's creator economy",
      url: 'https://www.bcg.com/publications/2025/india-from-content-to-commerce-mapping-indias-creator-economy',
      publisher: 'Boston Consulting Group',
      date: '2025-05-03',
      note: 'CLAIMS S23/E17: 2 to 2.5 million monetised creators influence $350 to 400 billion of spending.',
    },
    {
      id: 'nielseniq-ai',
      title: 'NIQ research uncovers hidden consumer attitudes toward AI-generated ads',
      url: 'https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/',
      publisher: 'NielsenIQ',
      date: '2024-12',
      note: 'CLAIMS S28/E12: AI-generated ads rated more annoying and confusing, and less memorable.',
    },
    {
      id: 'doca-endorsement',
      title: 'Endorsement Know-hows! for celebrities, influencers and virtual influencers on social media platforms',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose material connections with "advertisement", "sponsored" or "paid promotion".',
    },
    {
      id: 'asci-influencer',
      title: 'Guidelines for influencer advertising in digital media',
      url: 'https://www.ascionline.in/social/wp-content/uploads/2025/04/ASCI-Influencer-Guidelines.pdf',
      publisher: 'Advertising Standards Council of India',
      note: 'CLAIMS E26: disclosure labels for paid or gifted content.',
    },
    {
      id: 'dpdp-rules',
      title: 'Govt notifies DPDP Rules; implementation planned in phases spread over 12-18 months',
      url: 'https://www.theweek.in/wire-updates/business/2025/11/14/del148-biz-dpdp-rules-ld-govt.html',
      publisher: 'PTI via The Week',
      date: '2025-11-14',
      note: 'CLAIMS P07/E27: DPDP Rules notified November 2025, duties phased in through 2027.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'CLAIMS E23: Trial Reels show a Reel to non-followers first.',
    },
    {
      id: 'youtube-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'CLAIMS P01/E24: the Shorts "stayed to watch" metric.',
    },
    {
      id: 'instagram-signals',
      title: 'Instagram shares algorithm insights for 2025',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01',
      note: 'CLAIMS P02/E22: watch time, likes and sends are the top three ranking signals (Adam Mosseri).',
    },
    {
      id: 'mere-exposure',
      title: 'Mere-exposure effect',
      url: 'https://en.wikipedia.org/wiki/Mere-exposure_effect',
      publisher: 'Wikipedia',
      note: 'CLAIMS R07 (corrected): Zajonc 1968; the effect is reliable but modest and fades with overexposure.',
    },
    {
      id: 'opinion-balance',
      title: 'Opinion balance in vox pop television news',
      url: 'https://researchdiscovery.drexel.edu/esploro/outputs/journalArticle/Opinion-Balance-in-Vox-Pop-Television/991021864984304721',
      publisher: 'Journalism Studies 19(2), Beckers, Walgrave and Van den Bulck',
      date: '2018',
      note: 'CLAIMS E08: a large majority of vox pop news items present one point of view.',
    },
  ],

  related: ['what-is-vox-pop-content', 'street-interview-marketing-playbooks', 'vox-pop-video-cost-india', 'street-interview-consent-india'],
};

export default post;
