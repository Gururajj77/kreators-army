import type { Post } from '../types';
import meta from './where-to-post-vox-pop-videos.meta';

const post: Post = {
  meta,

  answer:
    "Post vox pop videos where your buyers already scroll: Instagram Reels and YouTube Shorts first, then Facebook Reels and Snapchat Spotlight, with LinkedIn for B2B brands and WhatsApp for forwards. Kreators.Army's advice: open each feed with a different answer from the same street interview, cut one shoot into several posts, and boost only clips that already held attention.",

  takeaways: [
    'Give each feed its own opening: the most honest answer on Reels, the one that turns the question around on Shorts, and a professional contrast on LinkedIn.',
    'TikTok has been blocked in India since June 2020. Use it only if you sell to buyers abroad.',
    "Write WhatsApp captions as a message to one person. A forward is the one share you can't schedule.",
    'One batch can feed short cuts, carousels, quote posts and a thread on X. Plan that mix before the first clip goes out.',
    'Put money only behind clips that already held attention without it, and reply to comments while people are still in the thread.',
    "Post only videos whose usage rights have transferred. Trial videos are for evaluation and can't be published.",
  ],

  body: [
    'The edit is done. Five vertical street interviews sit in a shared folder, each built around one question, and someone on your team asks the obvious thing: where do these go?',

    "A quick answer is everywhere at once: same file, same caption, same afternoon. It's also the answer that wastes the most footage.",

    "Each feed has a different viewer in a different mood. The answer that stops someone on Reels won't always hold them on Shorts, and it can fall flat on LinkedIn.",

    'Below, one batch of vox pop footage goes feed by feed: which answer opens the clip, what the format needs and what to skip. Then the batch gets stretched into carousels and quote posts, spread over two weeks, and tested before any money goes behind it.',

    // ---------------------------------------------------------------- The short answer
    { type: 'h2', id: 'the-short-answer', text: 'Which platform should you post vox pop videos on?', toc: 'The short answer' },

    'Post on the short-form feeds where your buyers already scroll: Instagram Reels and YouTube Shorts first, then Facebook Reels and Snapchat Spotlight. Add LinkedIn if you sell to businesses, and make every clip easy to forward on WhatsApp.',

    {
      type: 'definition',
      id: 'vox-pop-video',
      term: 'Vox pop video',
      text: 'A vox pop video is a short street interview. A host takes one question to the street, real people answer on camera without a script, and the best reactions are edited into a video for Reels, Shorts or other short-form feeds. Brands use vox pop to show how real people talk about a product or idea.',
    },

    'New to the format? Start with [what vox pop content is](/blog/what-is-vox-pop-content). From here on, we assume the videos are already cut.',

    'Your buyers are on these feeds already. The IAMAI and Kantar _Internet in India 2025_ report counted about 588 million short-video viewers in India in 2025, and slightly more of them were rural than urban[^iamai-2025].',

    'Whether to post is settled. The decision left is which answer each feed sees first.',

    { type: 'h3', id: 'one-question-several-openings', text: 'One question, several openings' },

    'A good vox pop shoot gives you more than one usable answer to the same question. One person admits the thing nobody says aloud. Someone else turns the question around. A third makes a point that would start an argument in an office.',

    'The answer in the first second decides who keeps watching.',

    'So the footage stays the same across feeds, and the opening answer changes. Every row of the table below runs on that idea.',

    {
      type: 'table',
      caption: 'Where vox pop videos fit, and which answer to open with on each platform',
      head: ['Platform', 'What the viewer is doing', 'Open with', 'Format notes'],
      rows: [
        ['Instagram Reels', 'Scrolling fast, half-distracted, ready to send things to friends', 'The most honest answer, the one people rarely say aloud', 'Vertical, captions burned in; Reels can run three minutes[^reels-3-min]'],
        ['YouTube Shorts', 'A little more patient, willing to stay for a payoff', 'The answer that turns the question around', 'Vertical or square, up to three minutes[^shorts-3-min]; a clean loop helps'],
        ['Facebook Reels', 'Watching Reels between posts from people and pages they follow', 'The Instagram opening, with a direct question in the caption', 'Usually the same file as Instagram; reply from the page'],
        ['Snapchat Spotlight', 'Tapping through short public videos', 'The single sharpest exchange: one question, one answer', 'Your tightest cut, with large text near the centre'],
        ['LinkedIn', 'Reading at work, thinking about their job', 'A professional contrast a founder or manager would argue with', 'Native video or a quote carousel, posted with the founder’s take'],
        ['WhatsApp', 'Chatting with people they know', 'The answer that makes you think of one friend', 'A caption written as a message to one person'],
        ['TikTok', 'Not available in India since June 2020[^pib-2020]', 'Only for brands with buyers abroad', 'The same vertical cuts, from an account in that market'],
      ],
      rowHeaders: true,
    },

    "Read down the third column, because that's where the work is.",

    { type: 'h2', id: 'pick-a-feed', text: 'Which feed should one clip go to first?', toc: 'Pick a feed for one clip' },

    'Start with what the strongest answer in the clip does, then match it to a feed where your audience already follows you. A clip can live on several feeds, but the first one decides which opening you cut.',

    'Answer three questions about a single clip. The picker suggests a starting feed and the opening to cut for it.',

    {
      type: 'widget',
      widget: 'picker',
      id: 'platform-picker',
      props: {
        title: 'Which feed should this clip go to first?',
        intro: 'Answer for one finished clip. The pick is a starting point, not a rule: most clips end up on more than one feed.',
        questions: [
          {
            q: 'What does the strongest answer in the clip do?',
            options: [
              { text: 'Says something people rarely say out loud', outcomes: ['reels'] },
              { text: 'Turns the question on its head', outcomes: ['shorts'] },
              { text: 'Challenges how an industry or a job works', outcomes: ['linkedin'] },
              { text: 'Makes you think of one specific friend', outcomes: ['whatsapp'] },
              { text: 'Gets a big reaction with no setup at all', outcomes: ['snapchat'] },
            ],
          },
          {
            q: 'Where does your audience already follow you?',
            options: [
              { text: 'Instagram', outcomes: ['reels'] },
              { text: 'YouTube', outcomes: ['shorts'] },
              { text: 'A Facebook page with an active community', outcomes: ['facebook'] },
              { text: 'Snapchat', outcomes: ['snapchat'] },
              { text: 'LinkedIn, mostly through the founder', outcomes: ['linkedin'] },
            ],
          },
          {
            q: 'What do you most want the viewer to do next?',
            options: [
              { text: 'Send it to a friend', outcomes: ['whatsapp', 'reels'] },
              { text: 'Watch to the very end', outcomes: ['shorts'] },
              { text: 'Comment with their own answer', outcomes: ['facebook', 'reels'] },
              { text: 'Rethink something about their work', outcomes: ['linkedin'] },
              { text: 'See the brand again on a second feed', outcomes: ['facebook', 'snapchat'] },
            ],
          },
        ],
        outcomes: [
          {
            id: 'reels',
            title: 'Instagram Reels first',
            text: 'Open with the most honest answer in the clip, the one people rarely say aloud. Burn in captions, keep the first on-screen line short, and write a caption that teases the next answer.',
            reasons: ['Instagram says watch time, likes and sends matter most for ranking', 'Trial Reels let you test two openings on non-followers first'],
          },
          {
            id: 'shorts',
            title: 'YouTube Shorts first',
            text: 'Open with the answer that turns the question around, then build to the reason behind it. Cut the setup hard so the first seconds already hold a question.',
            reasons: ['YouTube reports how often viewers stayed past the first seconds', 'A clean loop back to the opening suits Shorts'],
          },
          {
            id: 'facebook',
            title: 'Facebook Reels, alongside Instagram',
            text: 'Post the Reels cut to your Facebook page as well, with a caption that ends on a direct question. The file is the same, so the extra cost is one caption and an hour of replies.',
            reasons: ['No new edit needed', 'A page with an active community gives comments somewhere to start'],
          },
          {
            id: 'snapchat',
            title: 'Snapchat Spotlight as a second home',
            text: 'Use the tightest cut you have: one question, one answer, one reaction. Keep text large and near the centre of the frame.',
            reasons: ['Blind tests, guesses and quick choices need no setup', 'A second feed for clips that work without context'],
          },
          {
            id: 'linkedin',
            title: 'LinkedIn, from the founder’s profile',
            text: 'Open with the answer that challenges how your category works, then say what the brand learned from it. Post it as native video or a quote carousel, with the founder’s take in the text.',
            reasons: ['Viewers there are thinking about their jobs', 'The post is about what the brand learned'],
          },
          {
            id: 'whatsapp',
            title: 'WhatsApp, through the people who share it',
            text: 'Pick the answer that makes someone think of one friend. Write the caption as a message to that friend, then share it to your Status and to customers who opted in.',
            reasons: ['A forward arrives with a recommendation attached', 'Run the forward test before it goes anywhere'],
          },
        ],
      },
    },

    // ---------------------------------------------------------------- Instagram Reels
    { type: 'h2', id: 'instagram-reels', text: 'Instagram Reels: lead with the most honest answer', toc: 'Instagram Reels' },

    'On Reels, open with the answer people rarely say out loud. The viewer is mid-scroll and committed to nothing, so the first second has to feel personal. An honest admission does that faster than a polished line.',

    'Instagram has said what it ranks on. In January 2025 its head, Adam Mosseri, named watch time, likes and sends as the three signals that matter most[^instagram-signals]. Plan for sends. The line someone forwards with "this is you" is exactly what a street interview is built to catch.',

    { type: 'h3', id: 'the-honest-answer', text: 'What the most honest answer sounds like' },

    'Say you asked people on a footpath why they bought their last phone. Most would mention the camera or the battery.',

    'Then one person shrugs and admits they bought it because everyone at work had one.',

    'That admission breaks a small social rule, and viewers feel it: did they really just say that? Open the Reel there. The camera and battery answers can follow as the build.',

    "Honest isn't the same as harsh. Open on recognition, and never on someone who looks mocked or caught out. If a person seems to regret what they said, that clip stays in the folder.",

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Iphone Overhyped',
      caption: 'Is the iPhone overhyped? An opinion question like this hands the comments something to argue about.',
    },

    "Length comes next. Reels have been able to run up to three minutes since January 2025[^reels-3-min], but that's room, not a target. Our rule for every video is the one on our FAQ: as tight as the story allows, without cutting the context or the payoff the answer depends on.",

    'On-screen text matters as much as the cut, so point it at what is coming. "Wait for the second answer" gives someone a reason to stay. "Street interview about phones" gives them a reason to leave.',

    { type: 'h3', id: 'trial-reels', text: 'Test two openings with Trial Reels' },

    "Instagram's Trial Reels show a Reel to people who don't follow you first, and you decide afterwards whether your followers see it. In 2025 the feature opened to public accounts with 1,000 or more followers[^trial-reels]. For a vox pop, it's the cheapest A/B test you'll get.",

    {
      type: 'list',
      ordered: true,
      items: [
        'Cut the same clip twice, changing only the first two seconds: the honest answer first in one, the surprising answer first in the other.',
        'Post both as Trial Reels a day or two apart, at a similar time of day.',
        'Compare watch time and sends for each cut. The view count alone tells you little.',
        'Share the stronger cut with your followers. Keep the other opening for Shorts.',
      ],
    },

    "One thing Trial Reels are not for: a Kreators.Army trial video. Trial content can't be published anywhere, and a feed shown only to non-followers still counts.",

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'two-openings',
      props: {
        title: 'An imagined clip, two openings',
        before: {
          label: 'Opening for Reels',
          text: 'The admission goes first: "Honestly? I bought it because everyone at work had one."',
          points: ['Feels personal in the first second', 'The kind of line people send with "this is you"'],
        },
        after: {
          label: 'Opening for Shorts',
          text: 'The reframe goes first: "The phone isn\'t the expensive part. The upgrade every year is."',
          points: ['Opens a question the clip has to answer', 'Gives the viewer a reason to stay for the end'],
        },
        note: 'Both lines are made up to show the idea. In a real batch, both answers would come from the same afternoon of footage.',
      },
    },

    'Shorts is where that second opening earns its keep.',

    // ---------------------------------------------------------------- YouTube Shorts
    { type: 'h2', id: 'youtube-shorts', text: 'YouTube Shorts: build to a payoff people stay for', toc: 'YouTube Shorts' },

    'On Shorts, open with the answer that turns the question around, then make people wait for the reason. The first seconds decide whether they stay. The payoff decides whether the wait felt worth it.',

    'YouTube doesn\'t publish a single completion-rate rule for Shorts. Its analytics do show "stayed to watch": the share of times viewers kept watching past the first seconds of a Short instead of swiping away[^yt-stayed]. So the first line has to earn the next few seconds, and the ending has to be worth reaching.',

    "The answer that reframes the question does both jobs. Someone asked whether a phone is worth the money talks about the yearly upgrade instead, and the viewer wants to know where they're going with it. That gap is an open loop. Close it before the end, ideally at the moment the product enters the conversation.",

    'Since 15 October 2024, square or vertical uploads of up to three minutes count as Shorts[^shorts-3-min]. The Reels rule holds here too: use the length a second answer earns, and no more.',

    {
      type: 'steps',
      id: 'cut-a-short',
      title: 'Cut a Short from one street interview',
      intro: 'Four beats for a Short built on the answer that reframes the question, and one check after it goes live.',
      howTo: true,
      steps: [
        { name: 'Open on the reframe', text: 'Start mid-answer, on the line that turns the question around. Put the original question on screen in a few words so nobody is lost.' },
        { name: 'Hold the gap', text: "Cut to a second person who answers the plain way, or disagrees. The contrast keeps the first answer's question open." },
        { name: 'Return for the reason', text: 'Go back to the first person for why they think so. If the product belongs in the clip, this is where it enters.' },
        { name: 'End where you began', text: 'Close on a frame that leads back into the opening, so a replay feels natural.' },
        { name: 'Read the curve', text: 'After a few days, check where viewers left. A drop in the opening seconds points to a weak first line. A drop just before the payoff usually means the build ran long.' },
      ],
    },

    'Reading that curve is a skill of its own. [The vox pop strategy playbook](/blog/vox-pop-strategy-for-indian-brands) covers drop-off, and [how to edit a vox pop](/blog/how-to-edit-vox-pop-videos) covers the cut beat by beat.',

    // ---------------------------------------------------------------- Facebook Reels and Snapchat Spotlight
    { type: 'h2', id: 'facebook-and-snapchat', text: 'Is it worth posting vox pops on Facebook and Snapchat?', toc: 'Facebook and Snapchat' },

    'Yes, if your buyers use them, because the files already exist. Facebook Reels can take your Instagram cut almost unchanged. Snapchat Spotlight wants your tightest version: one question, one answer, one reaction.',

    { type: 'h3', id: 'facebook-reels', text: 'Facebook Reels' },

    'Every package we make includes vertical videos ready for Reels, Shorts and other short-form feeds, so Facebook Reels is the easiest extra home. The file is the same. The real cost is a new caption and someone to answer comments.',

    'Rewrite the caption and leave the cut alone.',

    'End the caption on a direct question, such as "Which side are you on?", and answer the first replies yourself, from the page, so nobody\'s comment sits alone.',

    "If your brand already has a Facebook page with customers on it, post there the same day as Instagram. If it doesn't, don't build one for this. Spend that hour replying where your buyers already are.",

    {
      type: 'video',
      brand: 'Orgaheal',
      title: 'Plant Vs Whey',
      caption: 'Plant protein or whey? A two-sided question suits every feed, because the viewer picks a side while they watch.',
    },

    { type: 'h3', id: 'snapchat-spotlight', text: 'Snapchat Spotlight' },

    "Spotlight is Snapchat's feed of short public videos. Give it the cut with the least setup.",

    "If a clip needs ten seconds of context before the answer lands, it's the wrong clip for Spotlight.",

    "Keep on-screen text large and near the centre of the frame, where the app's own buttons won't cover it. A blind test, a guess or a quick A/B choice needs almost no setup, which makes those mechanisms a natural fit here.",

    {
      type: 'callout',
      tone: 'tip',
      title: 'Check the limits before you export',
      text: "Upload limits, aspect ratios and caption rules change often. Before each batch goes out, check each platform's own help centre for its current rules. Blog posts go out of date, this one included.",
    },

    // ---------------------------------------------------------------- TikTok
    { type: 'h2', id: 'tiktok', text: 'Can Indian brands post vox pops on TikTok?', toc: 'What about TikTok?' },

    "Not for an Indian audience. The Ministry of Electronics and IT blocked TikTok, along with 58 other apps, on 29 June 2020[^pib-2020]. Post there only if you sell to buyers outside India, from an account set up for that market.",

    'Guides written for the US or Europe often put TikTok first. For an Indian D2C brand, the same footage does that work on Reels and Shorts. If you do ship abroad, the vertical cuts carry over unchanged, and only the captions need rewriting for the market that will see them.',

    'Our view on who to reach first: a street interview filmed on an Indian footpath will probably mean most to Indians living abroad. Start with them before you try to reach everyone else.',

    // ---------------------------------------------------------------- LinkedIn
    { type: 'h2', id: 'linkedin', text: 'How should you post a vox pop on LinkedIn?', toc: 'LinkedIn' },

    "Open with the answer that challenges how your industry works, and post it from the founder's profile. People on LinkedIn are thinking about their jobs, so the clip that lands is an honest line a founder or manager would stop and argue with.",

    'Gossip and random reactions usually fall flat there. What works is a line that leaves a founder thinking "nobody in my industry says this out loud", and wondering why not. A street answer can do that well, because it comes from a customer rather than a competitor or a consultant.',

    "Lead with the brand-side version. On Instagram the clip is about the stranger. On LinkedIn it's about what the brand learned from the stranger, and the founder's post text carries that.",

    { type: 'h3', id: 'linkedin-example', text: 'The same clip, posted to LinkedIn' },

    'Say you run a D2C skincare brand, and your street question was about night routines. On Reels you would open with the person who admits they skip the whole routine when they get home late. On LinkedIn, the founder posts the same clip with a different first line.',

    {
      type: 'comparison',
      title: 'One imagined clip, two feeds',
      left: {
        label: 'On Instagram Reels',
        items: ['Opens on the admission: "Honestly, I skip all of it."', 'The caption talks to the viewer: "Be honest. Same?"', 'Posted from the brand account'],
      },
      right: {
        label: 'On LinkedIn',
        items: [
          'Opens on the founder’s line: "Our category sells a ten-step night routine. Strangers told us they skip all of it."',
          'The post text says what the brand learned, and what it will change',
          'Posted from the founder’s own profile',
        ],
      },
      verdict: 'Same footage, two openings. One asks the viewer to recognise themselves. The other asks a professional to rethink something.',
    },

    'Native video works on LinkedIn, and so does a carousel of the best quotes, in the four-slide shape covered under repurposing below. For brands that sell to other businesses, [vox pop for B2B and SaaS brands](/blog/vox-pop-for-b2b-brands) goes much further.',

    // ---------------------------------------------------------------- WhatsApp
    { type: 'h2', id: 'whatsapp', text: 'Can you plan for WhatsApp shares?', toc: 'WhatsApp' },

    "Not directly. You can't schedule a forward, but you can make a clip worth forwarding. TechCrunch reported in December 2024 that WhatsApp has more than 500 million users in India[^whatsapp-india], so a clip people pass on reaches buyers through someone they already know.",

    'A paid ad reaches whoever you target. A forward reaches the people who trust the sender: a cousin, a colleague, the family group.',

    'It arrives with a recommendation already attached.',

    'Inside WhatsApp, a brand controls only a few places: its Status, its Channel if it runs one, and messages to customers who opted in. Everything past that depends on people choosing to pass the clip on, which is why the test below matters more than the posting time.',

    { type: 'h3', id: 'the-forward-test', text: 'The forward test' },

    "Before a clip leaves the edit, ask whether someone would forward it to one specific person. If the honest answer is no, it isn't ready. Six checks get it there.",

    {
      type: 'list',
      ordered: true,
      items: [
        '**Find the forward moment.** Watch the cut and mark the one line that makes you think of a particular friend.',
        '**Check what it triggers.** Recognition ("that\'s so you"), surprise or a comparison ("I\'d never") all travel. Mild interest doesn\'t.',
        '**Clear the path.** Cut long setups, brand intros and explanations that stand between the viewer and that moment. It should arrive within the first few seconds.',
        '**Write the caption as a message.** Write it the way one person texts another, not the way a brand announces a post.',
        '**Ask what the forward says about the sender.** People pass on clips that make them look funny or in the know. Decide which one this clip gives them.',
        '**Then distribute.** Only a clip that passes goes to your Status, your opted-in customers and your other feeds.',
      ],
    },

    {
      type: 'widget',
      widget: 'beforeAfter',
      id: 'caption-as-a-message',
      props: {
        title: 'The same clip, two captions',
        before: {
          label: 'Written as an announcement',
          text: '"Check out our new street interview about breakfast habits."',
          points: ['About the brand', 'Nobody sends this to a friend'],
        },
        after: {
          label: 'Written as a message',
          text: '"This is you, skipping breakfast and calling chai a meal. The second answer is worse."',
          points: ['About the reader', 'Reads like one friend texting another'],
        },
        note: 'Both captions describe the same imagined clip. Only the person the caption talks to has changed.',
      },
    },

    'The rewrite takes a minute and changes who the post is about. Do it on every feed.',

    // ---------------------------------------------------------------- One shoot, many posts
    { type: 'h2', id: 'one-shoot-many-posts', text: 'How do you repurpose one street interview shoot?', toc: 'One shoot, many posts' },

    'One shoot should never become one post. A batch of finished vox pop videos can feed short cuts on several feeds, a carousel, quote posts, a thread on X and a week of Stories. Plan the mix before the first clip goes out.',

    "Each finished video is built around one question, with several people answering it. Any strong answer in it could open a cut, become a quote post or anchor a slide. The skill is deciding which answer goes where, so the same moment doesn't turn up five times in one week.",

    'Treat the table as a menu. Pick only the rows that fit the channels you actually run.',

    {
      type: 'table',
      caption: 'The repurposing stack: what one batch of vox pop videos can become',
      head: ['Format', 'Built from', 'Where it goes'],
      rows: [
        ['Short cuts, one answer each', 'A single strong answer, with a caption that teases the next', 'Reels, Shorts, Facebook Reels, Spotlight'],
        ['The full video', 'The finished edit, as delivered', 'The feed where your brand is strongest'],
        ['A longer compilation', 'The best answers from several videos on one theme', 'YouTube, as a regular video'],
        ['A FLIP carousel', 'One belief, one contradiction from the street, one new view', 'LinkedIn and Instagram'],
        ['Quote posts and a thread', 'One line each, with no name unless the person agreed', 'LinkedIn, Instagram, a thread on X'],
        ['Stories and Status', 'Stills, the question card and a poll on the same question', 'Instagram Stories and WhatsApp Status'],
      ],
      rowHeaders: true,
    },

    'How much that adds up to depends on how many strong answers the batch holds and how many feeds you run. Nobody can promise a number before the footage exists, including us, so the calculator uses yours.',

    {
      type: 'widget',
      widget: 'calculator',
      id: 'one-shoot-how-many-posts',
      props: {
        title: 'One shoot, how many posts?',
        intro: 'Put in your own batch and your own channels. The result is a posting plan, not a forecast.',
        inputs: [
          { key: 'videos', label: 'Finished videos in the batch', default: 5, min: 1, max: 40, step: 1, unit: 'videos' },
          { key: 'feeds', label: 'Short-video feeds you will post each video to', default: 3, min: 1, max: 5, step: 1, unit: 'feeds' },
          { key: 'quotes', label: 'Quotable answers per video', default: 2, min: 0, max: 6, step: 1, unit: 'quotes' },
          { key: 'carousels', label: 'Carousels you will build from the batch', default: 2, min: 0, max: 20, step: 1, unit: 'carousels' },
          { key: 'perWeek', label: 'Posts your team can publish in a week', default: 5, min: 1, max: 21, step: 1, unit: 'posts' },
        ],
        outputs: [
          { key: 'videoPosts', label: 'Video posts across your feeds', formula: 'videos * feeds', format: 'number', unit: 'posts' },
          { key: 'textPosts', label: 'Quote posts and thread lines', formula: 'videos * quotes', format: 'number', unit: 'posts' },
          { key: 'total', label: 'Pieces in the plan', formula: 'videoPosts + textPosts + carousels', format: 'number', unit: 'pieces' },
          { key: 'weeks', label: 'Weeks of posting at your pace', formula: 'ceil(total / perWeek)', format: 'number', unit: 'weeks' },
        ],
        disclaimer:
          'A plan built from your own inputs, not a forecast. It counts pieces you could publish, and says nothing about how any of them will perform. Drop any piece that would repeat a moment your audience saw that week.',
      },
    },

    { type: 'h3', id: 'flip-carousel', text: 'The FLIP carousel' },

    'A carousel turns the best moment of a street interview into an argument people read at their own pace. A simple four-slide shape for it is [FLIP](/blog/vox-pop-glossary#flip): frame, layer, invert, plant. It suits LinkedIn best, and it reads well on Instagram too.',

    {
      type: 'framework',
      id: 'flip-framework',
      name: 'FLIP',
      tagline: 'Four slides that turn one street answer into an argument.',
      parts: [
        { key: 'F', name: 'Frame', text: 'Slide 1 states the belief your audience already holds about the category, in their words. Not what you want them to believe: what they think now.' },
        { key: 'L', name: 'Layer', text: "Slide 2 layers in the contradiction you found on the street. Quote the answer that doesn't fit the belief, word for word." },
        { key: 'I', name: 'Invert', text: "Slide 3 turns the logic around. If the belief were true, that answer shouldn't exist, so say what is really going on." },
        { key: 'P', name: 'Plant', text: 'Slide 4 plants the view your brand stands for. One sentence, and no feature list.' },
      ],
    },

    'A worked example, for a made-up brand that sells coffee concentrate:',

    {
      type: 'widget',
      widget: 'slides',
      id: 'flip-example',
      props: {
        title: 'A FLIP carousel for an imagined coffee brand',
        slides: [
          { heading: 'Frame', text: 'Good coffee takes time. That is what most of us believe about our mornings.' },
          { heading: 'Layer', text: 'So we asked people on the street when they last made coffee on a weekday. The answers kept coming back to time, not taste.' },
          { heading: 'Invert', text: 'The problem was never the coffee. It was the ten minutes it takes to make.' },
          { heading: 'Plant', text: 'That is why we think good coffee should take less than a minute.' },
        ],
      },
    },

    'Now build one for your own product, with a real answer from your footage on slide 2.',

    {
      type: 'widget',
      widget: 'questionBuilder',
      id: 'flip-builder',
      props: {
        title: 'Build your own FLIP carousel',
        intro: 'Type one line for each slide. The slides fill in as you type, and you can copy them into your design tool.',
        fields: [
          { id: 'belief', label: 'Frame: the belief your buyers hold', placeholder: 'e.g. good coffee takes time', example: 'good coffee takes time' },
          { id: 'contradiction', label: 'Layer: what the street said instead', placeholder: 'e.g. nobody has ten minutes on a weekday', example: 'nobody has ten minutes on a weekday' },
          { id: 'flip', label: 'Invert: what that really means', placeholder: 'e.g. the problem is time, not taste', example: 'the problem is the time, not the taste' },
          { id: 'view', label: 'Plant: the view your brand stands for', placeholder: 'e.g. good coffee should take under a minute', example: 'good coffee should take less than a minute' },
        ],
        templates: [
          { text: 'Most of us believe {belief}.', group: 'Slide 1: Frame' },
          { text: 'So we took the question to the street. What we kept hearing: {contradiction}.', group: 'Slide 2: Layer' },
          { text: 'If that is true, {flip}.', group: 'Slide 3: Invert' },
          { text: 'That is why we think {view}.', group: 'Slide 4: Plant' },
          { text: 'We asked strangers whether {belief}. Their answers changed our mind. Swipe to the last slide.', group: 'Post text' },
          { text: 'Would you have said {contradiction}, or something else?', group: 'First comment' },
        ],
        note: 'Quote only people who agreed to be filmed, and keep their words exactly as they said them.',
      },
    },

    'The same four beats make a thread on X: one short line per beat, with the clip attached to the second post. Quote posts work the same way. Lift one line, add nothing, and let the answer carry it.',

    // ---------------------------------------------------------------- Boosting
    { type: 'h2', id: 'should-you-boost', text: 'Should you boost a vox pop?', toc: 'Should you boost?' },

    'Boost only clips that already held attention without paid help. Your audience has already run the test for you, so put money behind its answer rather than behind your guess.',

    'Paid reach gets more expensive whenever more brands bid for the same audience, so it helps to have content that earns attention on its own. A vox pop that people watched through, sent to friends and argued about in the comments has shown you something an ad test would charge for.',

    "Compare each clip with your own recent posts, not with someone else's account. These are the signs a clip has already worked:",

    {
      type: 'list',
      items: [
        'More of the clip watched than your usual, or a higher stayed-to-watch share on Shorts',
        'Sends and shares well above your normal',
        'Comments where people give their own answer, not only an emoji',
        'Saves, which suggest people want to come back to it',
        'Messages that quote a line from the clip back to you',
      ],
    },

    'If a clip shows none of these, boosting it buys reach for something your audience has already passed over. Leave it alone and test a different opening instead.',

    { type: 'h3', id: 'boost-or-ads-manager', text: 'Should you boost in the app or in Ads Manager?' },

    "Instagram's Boost button is the quick route: a goal, an audience, a budget and a few days, all set from the app. Meta's Ads Manager takes longer but gives you more control over placements and testing. In Ads Manager, choose the existing post rather than uploading the clip again, so the ad keeps the comments people already left.",

    "Start small, one clip at a time.",

    "If paid viewers drop off far earlier than your organic ones did, the targeting has probably found people who don't care about the question yet. Fix the audience before you raise the budget.",

    {
      type: 'callout',
      tone: 'note',
      title: 'What a boost can and cannot do',
      text: 'A boost buys distribution, not results. How a video performs depends on the platform, the audience, the account’s history, media spend, the offer and distribution, which is why we never promise views. Anything we show from our own work carries the line "Past results, not a promise."',
    },

    'Vox pops can run as ads, and a clip that worked organically is the natural first candidate. Two rules come with that.',

    {
      type: 'list',
      items: [
        "**Rights first.** You need usage rights that cover ads. Ours cover them on the pilot agreement's terms, once the package is paid in full.",
        '**Disclose any connection.** If anyone in the clip was paid, cast or works for you, India\'s endorsement guidelines expect you to say so clearly, with labels such as "advertisement" or "paid promotion"[^dca-endorsement].',
      ],
    },

    // ---------------------------------------------------------------- The first hours
    { type: 'h2', id: 'the-first-hours', text: 'What should you do in the first hours after posting?', toc: 'The first hours' },

    'Stay in the comments. Reply to the first ones while people are still in the thread, with real answers. A bare thank-you ends the thread. Those early replies are where a clip turns into a conversation.',

    'A comment on a vox pop is someone saying in public, "that\'s me", or tagging the one friend who needs to see it. Each tag is the forward test passing where you can watch it happen.',

    "Instagram and YouTube don't publish a rule that rewards replies in the first hour, and we won't pretend they do. Our advice is plainer. Reply early, while people are still reading, because a reply that lands then keeps the conversation going.",

    {
      type: 'list',
      ordered: true,
      items: [
        'Pin a comment that repeats the task from the end of the video.',
        'Reply to the first comments with a real answer or a follow-up question.',
        'Share the clip to your Story and WhatsApp Status, with the caption written as a message.',
        'Note the lines people quote back to you. Those are your next openings.',
        "Leave the post alone. Don't delete and repost because the first hour looks slow.",
      ],
    },

    { type: 'h3', id: 'end-with-a-task', text: 'End the video with a task' },

    'The comment section starts inside the video. "Let me know what you think" gives nobody anything to do. A specific task does: a choice to make, a number to guess or a gap to fill.',

    'There is research behind the instinct, with a catch. Norton, Mochon and Ariely found that people who assembled an IKEA box would pay more for it than for an identical ready-made one, but only if they finished it[^ikea-effect]. A comment is a small thing to build. Make the task small enough to finish in one line.',

    {
      type: 'script',
      id: 'endings-with-a-task',
      title: 'Three endings that hand the viewer a task',
      context: 'On-screen text or a last line from the host, over the final reaction shot.',
      lines: [
        { direction: 'Hold on the last participant’s pause before they answer.' },
        { speaker: 'On-screen text', text: 'We asked people if they would buy the same phone again. What would you say?' },
        { direction: 'Or, for a guessing video, just before the reveal.' },
        { speaker: 'Host', text: 'Before I tell you the price, put your guess in the comments.' },
        { direction: 'Or, for an A/B question.' },
        { speaker: 'On-screen text', text: 'Plant or whey? Pick one, and tell us why in a line.' },
      ],
    },

    'Then use the replies. The best answers in the comments become your next post: a reply video, a carousel slide or a question for the next shoot. We think the people who answered are the likeliest to come back and see what you did with their words.',

    { type: 'h3', id: 'before-you-post', text: 'A checklist for every clip' },

    'Run each clip through this before it goes out. Your ticks are saved on this device.',

    {
      type: 'widget',
      widget: 'checklist',
      id: 'before-you-post-checklist',
      props: {
        title: 'Before you post a vox pop',
        items: [
          { id: 'rights', text: 'Usage rights for this video have transferred, and it is not a trial cut', detail: "Trial videos are for evaluation only. They can't be published, boosted or used in ads." },
          { id: 'releases', text: 'Everyone featured agreed to be filmed and knows where the video will appear', detail: 'Keep signed releases with the project files, and have a lawyer check the release form.' },
          { id: 'disclosure', text: 'Anyone paid, cast or on your staff is clearly disclosed', detail: 'Use a plain label such as "advertisement" or "paid promotion".' },
          { id: 'opening', text: 'The opening answer was chosen for this feed, not copied from the last one' },
          { id: 'captions', text: 'Captions are burned in and readable with the sound off' },
          { id: 'subtitles', text: 'Hindi, Hinglish or Kannada answers are subtitled faithfully, without changing what was said' },
          { id: 'safe-zone', text: 'On-screen text sits clear of the buttons and caption area at the edges of the screen' },
          { id: 'cover', text: 'The cover frame shows a face mid-reaction and the question in a few words' },
          { id: 'caption-message', text: 'The post caption reads like a message to one person' },
          { id: 'task', text: 'The video ends on a task, not "let me know what you think"' },
          { id: 'reply-plan', text: 'Someone who knows the brand has time set aside to reply to comments in the first hour' },
        ],
        done: 'Ready. Post it, then stay in the comments.',
      },
    },

    // ---------------------------------------------------------------- How often
    { type: 'h2', id: 'how-often-to-post', text: 'How often should you post vox pops?', toc: 'How often to post' },

    'Post often enough that people meet you several times a week, in more than one format, with something recognisable each time. One strong clip a month is easy to forget. Several related pieces in one week give people a chance to recognise you.',

    'Psychologists call the principle behind this the mere-exposure effect. Robert Zajonc showed in 1968 that people tend to like what they have seen more often, even nonsense words. Later reviews found the effect is real but modest, and that it fades if the same thing is repeated too much[^mere-exposure].',

    'That second finding matters for vox pops. Aim for variety in format and consistency in feel. Keep one recognisable element across everything you post, such as the same host, the same opening phrase or the same question card, and change the shape of the content around it. [Why vox pops work](/blog/psychology-of-vox-pop) covers the research in more depth.',

    { type: 'h3', id: 'the-exposure-ladder', text: 'The exposure ladder' },

    'Think of a week of posts as a ladder of five rungs, each a different format carrying the same idea.',

    {
      type: 'list',
      ordered: true,
      items: [
        '**The vox pop.** It introduces the idea and makes someone think, "wait, this is me."',
        '**A carousel.** It goes deeper into the answer that opened the idea, in the FLIP shape.',
        '**A talking head.** The founder explains what the brand learned and how it thinks about the problem.',
        "**A customer's own words.** A real customer story or a product demo, with nothing invented or inflated.",
        '**A comment prompt.** It asks for the viewer’s answer and turns them into a participant.',
      ],
    },

    'The order is not sacred. People step onto the ladder wherever they first see you. What counts is that they meet the same idea, in a familiar style, more than once.',

    {
      type: 'video',
      brand: 'CircleStore',
      title: 'Diwali Buying',
      caption: 'Diwali buying: a seasonal question your buyers already have on their minds. The library also holds "Diwali Selling", a second angle on the same festival.',
    },

    'Seasonal questions give the ladder its theme. In Diwali week, during the IPL or in exam season, the vox pop, the carousel and the comment prompt can all hang on one idea your buyers are already thinking about.',

    {
      type: 'widget',
      widget: 'timeline',
      id: 'two-weeks-from-one-batch',
      props: {
        title: 'Two weeks from a batch of five videos',
        intro: 'One way to spread a five-video batch across a fortnight. Move the days to fit your own calendar.',
        items: [
          { when: 'Day 1', title: 'Video 1 goes out', text: 'Reels and Shorts, each with its own opening. Facebook Reels the same day.', tasks: ['Reply to early comments', 'Share to your Story and WhatsApp Status'] },
          { when: 'Day 3', title: 'A carousel from video 1', text: 'A FLIP carousel built on its best answer: on LinkedIn from the founder, on Instagram from the brand.' },
          { when: 'Day 4', title: 'Video 2', text: 'A different question and mechanism, with the same host and opening phrase.' },
          { when: 'Day 6', title: 'The founder’s take', text: 'A short talking head on what the first two videos showed the team.' },
          { when: 'Day 8', title: 'Video 3, ending on a task', text: 'Pin the question as the first comment.' },
          { when: 'Day 10', title: 'A reply post', text: 'Turn the best answers from the comments into a carousel or a short.' },
          { when: 'Day 11', title: 'Video 4', text: 'If an earlier clip held attention well above your usual, this is the week to consider a boost.' },
          { when: 'Day 14', title: 'Video 5, then a review', text: 'Note which openings held people. Those notes shape the next brief.' },
        ],
      },
    },

    "Posting regularly gives you more chances to learn what works. It doesn't oblige any feed to reward you. Judge the plan by what you learn, because one week's numbers won't tell you much.",

    // ---------------------------------------------------------------- Rights
    { type: 'h2', id: 'who-can-post', text: 'Who can post the videos?', toc: 'Who can post the videos' },

    "You can, on your own brand channels, once usage rights have transferred on full payment. That covers Instagram, YouTube Shorts, other platforms and ads, on the terms of the pilot agreement. Trial videos are the one exception.",

    'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands. We plan the questions, run the shoot and edit the batch, then deliver the videos to you.',

    "You don't need to post them on our channel. They become long-term content assets for your own brand, which is why the plan in this guide is yours to run. The [answer on where you can use the videos](/faq/where-can-i-use-the-videos) sets out the detail.",

    {
      type: 'callout',
      tone: 'warning',
      title: "Trial videos can't be posted",
      text: "A trial exists so you can judge the format on your own brand. Trial content can't be published, boosted, used in ads or repurposed unless a paid engagement is confirmed in writing. Judge the format with it, then plan the posting around the batch.",
    },

    'Packages come as 5, 10 or 20 videos for one brand, paid in full in advance. [Our vox pop pricing](/pricing) has the fees, with GST extra where applicable.',

    {
      type: 'callout',
      tone: 'note',
      title: 'Filming your own street interviews?',
      text: "The same principle applies in another form. Get a signed release from everyone you feature, tell them where the video will appear, and have a lawyer check the form. Never feature anyone under 18 without a parent's written consent. This is general information, not legal advice.",
    },

    // ---------------------------------------------------------------- Close
    { type: 'h2', id: 'where-to-start', text: 'Where to start this week', toc: 'Where to start' },

    'Take one finished clip and cut two openings, one honest and one surprising. Post both as Trial Reels a day apart, and see which one people watch longer and send more. Give the other opening to Shorts.',

    "Run that on your next three clips and you'll have your own answer to where vox pops work for your brand. It will beat any table in a blog post, including ours.",

    "If you'd rather have the questions planned, the shoot run and every cut made for you, that's the work we do. See the format on your own brand first: the scope, the number of trial videos and any fee are confirmed in writing. [Request a trial video](/contact).",
  ],

  faqs: [
    {
      q: 'Which platform is best for vox pop videos?',
      a: 'Instagram Reels and YouTube Shorts are the best starting points for most Indian D2C brands, because both are built for vertical short video and buyers already scroll them. Facebook Reels and Snapchat Spotlight are easy second homes for the same files. LinkedIn suits B2B brands and founder posts. The best platform for a given clip depends on which answer it opens with.',
    },
    {
      q: 'Should I post the same vox pop clip on every platform?',
      a: 'No, not as it is. The footage can stay the same, but the opening answer, the on-screen text and the caption should change for each feed. Reels suit the most honest answer first, Shorts suit an answer that turns the question around, and LinkedIn suits a professional contrast. Facebook Reels can usually take the Instagram cut with a new caption.',
    },
    {
      q: 'How long should a vox pop be for Instagram Reels?',
      a: "As short as the story allows. Instagram now accepts Reels up to three minutes, but nothing obliges you to use that length. Most street questions need a strong opening, a contrast and a payoff, and anything that doesn't serve those should go. Cut to what the clip needs, and keep the context the payoff depends on.",
    },
    {
      q: 'Can vox pops be used as ads?',
      a: "Yes. A vox pop that held attention organically is a strong candidate for paid promotion, because the audience has already shown interest in it. You need usage rights that cover ads, and for Kreators.Army videos those transfer on full payment, on the pilot agreement's terms. If anyone in the clip was paid, cast or on staff, disclose it clearly, as India's endorsement guidelines expect.",
    },
    {
      q: 'Do vox pops work on LinkedIn?',
      a: "Yes, when the clip opens with a professional contrast: an honest answer that challenges how an industry works. LinkedIn viewers are thinking about their jobs, so lead with what the brand learned from the street, posted from the founder's profile. Native video and a four-slide carousel of the best quotes both work. The gossip-style openings that suit Reels usually fit badly there.",
    },
    {
      q: 'Is TikTok available in India?',
      a: 'No. The Government of India blocked TikTok, along with 58 other apps, on 29 June 2020[^pib-2020], and it has not been available in India since. Indian brands post vertical vox pop cuts on Instagram Reels, YouTube Shorts, Facebook Reels and Snapchat Spotlight instead. TikTok is worth considering only if you sell to buyers in other countries and run an account for that market.',
    },
    {
      q: 'Should I boost a vox pop?',
      a: "Boost only a vox pop that already held attention without paid help. Look for a clip people watched further than usual, sent to friends and answered in the comments, then put money behind that one. Boosting a clip your audience passed over buys reach for content that has already shown it doesn't hold people. No boost can promise views or sales.",
    },
    {
      q: 'Can I post the trial video?',
      a: "No. Trial videos are for judging the format on your own brand, and they can't be published, boosted, used in ads or repurposed unless a paid engagement is confirmed in writing. Once you choose a package and pay in full, usage rights for the final videos transfer to you, and those are the videos to post. The [trial video FAQ](/faq/can-i-post-the-trial-video) has the full terms.",
    },
  ],

  sources: [
    {
      id: 'iamai-2025',
      title: "India's internet user base tops 950 million as rural growth, AI drive adoption",
      url: 'https://www.businesstoday.in/technology/news/story/indias-internet-user-base-tops-950-million-as-rural-growth-ai-drive-adoption-513353-2026-01-29',
      publisher: 'Business Today, reporting the IAMAI and Kantar Internet in India 2025 report',
      date: '2026-01-29',
      note: 'CLAIMS E15: about 588 million short-video viewers in 2025; rural 302 million, urban 286 million.',
    },
    {
      id: 'instagram-signals',
      title: 'Instagram shares algorithm insights for 2025',
      url: 'https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/',
      publisher: 'Social Media Today',
      date: '2025-01',
      note: 'CLAIMS P02/E22: Adam Mosseri names watch time, likes and sends as the top three ranking signals.',
    },
    {
      id: 'reels-3-min',
      title: 'Instagram now supports three-minute Reels',
      url: 'https://lindseygamble.com/blog/instagram-three-minute-reels',
      publisher: 'Lindsey Gamble',
      date: '2025-01',
      note: 'CLAIMS E21: Reels extended to 3 minutes in January 2025.',
    },
    {
      id: 'trial-reels',
      title: 'Instagram expands access to Trial Reels',
      url: 'https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/',
      publisher: 'Social Media Today',
      date: '2025',
      note: 'CLAIMS E23: Trial Reels show to non-followers first; expanded to public accounts with 1,000+ followers in 2025.',
    },
    {
      id: 'yt-stayed',
      title: 'Understand your YouTube content performance',
      url: 'https://support.google.com/youtube/answer/12220281',
      publisher: 'YouTube Help',
      note: 'CLAIMS P01/E24: "Stayed to watch" is the percentage of times viewers stayed past the initial seconds of a Short.',
    },
    {
      id: 'shorts-3-min',
      title: 'YouTube Shorts can now be up to three minutes long',
      url: 'https://www.tubefilter.com/2024/10/03/youtube-shorts-three-minutes-max-length-redesign-trends-templates/',
      publisher: 'Tubefilter',
      date: '2024-10-03',
      note: 'CLAIMS E20: square or vertical videos up to 3 minutes uploaded from 15 October 2024 count as Shorts.',
    },
    {
      id: 'pib-2020',
      title: 'Government Bans 59 mobile apps which are prejudicial to sovereignty and integrity of India, defence of India, security of state and public order',
      url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1635206',
      publisher: 'Press Information Bureau, Ministry of Electronics and IT, Government of India',
      date: '2020-06-29',
      note: 'The government press release named in STYLE.md §12: TikTok heads the list of 59 blocked apps.',
    },
    {
      id: 'whatsapp-india',
      title: 'India lifts WhatsApp payment curbs',
      url: 'https://techcrunch.com/2024/12/31/india-lifts-whatsapp-payment-curbs/',
      publisher: 'TechCrunch',
      date: '2024-12-31',
      note: 'CLAIMS S10/E16: "WhatsApp has more than 500 million users in India."',
    },
    {
      id: 'ikea-effect',
      title: 'IKEA effect',
      url: 'https://en.wikipedia.org/wiki/IKEA_effect',
      publisher: 'Wikipedia (summarising Norton, Mochon and Ariely, Journal of Consumer Psychology, 2012)',
      note: 'CLAIMS R05: builders paid more for boxes they assembled; the effect dissipated when they failed to finish. Paper DOI 10.1016/j.jcps.2011.08.002.',
    },
    {
      id: 'mere-exposure',
      title: 'Mere-exposure effect',
      url: 'https://en.wikipedia.org/wiki/Mere-exposure_effect',
      publisher: 'Wikipedia (summarising Zajonc, 1968, and Bornstein, 1989)',
      note: 'CLAIMS R07: repeated exposure raises liking; the effect is real but modest and can fade with overexposure.',
    },
    {
      id: 'dca-endorsement',
      title: 'Endorsement Know-hows!',
      url: 'https://consumeraffairs.nic.in/sites/default/files/PIB1892527.pdf',
      publisher: 'Department of Consumer Affairs, Government of India',
      date: '2023-01-20',
      note: 'CLAIMS E26: disclose any material connection with terms such as "advertisement", "sponsored" or "paid promotion".',
    },
  ],

  related: ['how-to-edit-vox-pop-videos', 'vox-pop-strategy-for-indian-brands', 'vox-pop-for-b2b-brands', 'street-interview-hooks'],
};

export default post;
