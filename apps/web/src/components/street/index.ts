// The street (visual §1.3). Pages use Street, the light wrapper that reserves the box and lazy-loads the art. StreetScene and StreetArt live in the
// lazy chunk; import them only from code that is itself lazy. The How we work vignettes are separate: import { Vignette } from
// '../components/street/Vignette' (not from this index, so the first download does not carry them).
export { Street, type StreetProps } from './Street';
export type { StreetArtProps, StreetSceneProps, StreetTime, StreetVariant } from './StreetScene';
