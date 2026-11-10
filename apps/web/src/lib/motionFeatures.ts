// What makes `m` components move. main.tsx loads it through import() inside `LazyMotion`, so the bulk of motion is not in the first download.
// Every motion component in the app is `m` (imported as `m as motion`); a plain `motion` import would pull all of this back into the first download.
export { domMax as default } from 'motion/react';
