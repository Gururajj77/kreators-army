// Owner: A6 Pages B. Brief wording that two pages use, verbatim from content.md: the /trial #brief cards (content §3.3) and the /contact brief form
// (content §5.2). Option labels are not here: they come from @kreators/shared (brief.ts), so the form, the API and the admin inbox read one list.

/** content §3.3, card 5's disclosure and content §5.2 step 5's: "What a simple brand guide covers". */
export const BRAND_GUIDE_TITLE = 'What a simple brand guide covers';

export const BRAND_GUIDE_COVERS = [
  { lead: 'Brand identity:', rest: "your brand's personality in 3 to 5 words, words that fit it, words that don't, and things to avoid" },
  {
    lead: 'Editing and design:',
    rest: 'your editing style (fast, premium, cinematic, documentary, raw creator-style and so on), fonts, brand colours, motion graphics, captions, music, sound effects (minimal, energetic, meme-style and so on), transitions, pace, logo use and how to shoot the product',
  },
] as const;
