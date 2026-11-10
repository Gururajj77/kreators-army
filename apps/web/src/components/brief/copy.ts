// Owner: A6 Pages B. Brief wording that two pages use, verbatim from content.md: the /trial #brief cards (content §3.3) and the /contact brief form
// (content §5.2). Option labels are not here: they come from @kreators/shared (brief.ts), so the form, the API and the admin inbox read one list.

/** content §3.3, card 5's disclosure and content §5.2 step 5's: "What a simple brand guide covers". */
export const BRAND_GUIDE_TITLE = 'What a simple brand guide covers';

export const BRAND_GUIDE_COVERS = [
  { lead: 'Brand identity:', rest: 'personality in 3 to 5 words, positive keywords, negative keywords, things to avoid' },
  {
    lead: 'Editing and design:',
    rest: 'overall editing style (fast-paced, premium, cinematic, documentary, raw UGC and so on), typography, brand colours, motion graphics style, caption style, music direction, sound effects (minimal, energetic, meme-style and so on), transitions, pacing, logo usage, product shot guidelines',
  },
] as const;
