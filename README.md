# kreators-army

A pnpm monorepo: a React app built with Vite, served by a Cloudflare Worker with a D1 database. The Worker answers `/api/*`, streams the library's videos from MEGA under the site's own address, serves the admin panel at `/admin`, and serves the built web app as static files from the same origin.

```
apps/web         React, Vite, Tailwind, PWA (the public site and the /admin panel)
apps/api         Cloudflare Worker (Hono), D1 migrations, the MEGA stream, tests
packages/shared  Types, parsers and values used by both apps (with tests)
scripts          Repository tooling: the video CLI and the bundle size budget
```

## Run locally

Needs Node 22 and pnpm 11.

```sh
pnpm install
cp apps/api/.dev.vars.example apps/api/.dev.vars   # then set ADMIN_KEY to a passphrase
pnpm db:migrate:local
pnpm dev
```

The web app runs on http://localhost:5183 and proxies `/api`, `/media/v/`, `/media/mega-` and `/media/p/` to the Worker on port 8797. `pnpm db:migrate:local` applies every migration your local database has not seen yet; run it again whenever a new numbered file appears in `apps/api/migrations`.

The admin panel is at http://localhost:5183/admin. Use Chrome or Firefox to test it locally: Safari refuses the admin's `Secure` cookie over plain `http`. Locally every request comes from one address, so six wrong passkeys in a row lock your own browser out for 15 minutes.

## The admin panel (`/admin`)

`/admin` is not linked anywhere, is never indexed or cached, and opens with the passkey in the Worker secret `ADMIN_KEY`. Pick a passkey you can type: four or more random words. Under 16 characters the panel shows a quiet "short passkey" note.

- **Unlocking** exchanges the passkey for a session cookie that lasts 7 days (24 hours without use). Five wrong passkeys from one address in 15 minutes lock that address for a while.
- **Videos:** add, edit, publish or hide, feature, reorder (drag, or Space and the arrow keys), pick a poster frame or upload one, delete to the bin (restorable for 30 days), and delete forever from the bin.
- **Import:** paste or drop a links file (`.txt`, `.csv`, `.tsv` or `.json`; save an `.xlsx` as CSV first), up to 1,000,000 characters, 500 rows and 5 MEGA folders. MEGA, Instagram and YouTube links in any of the usual layouts are read, checked three at a time and shown for review. Every imported video comes in as a **draft**. A whole import can be undone in one step, and "Make posters from the first second" fills in posters in the browser.
- **Enquiries:** trial briefs and questions from `/contact`, with New, Contacted and Archived, a private note, reply by email or WhatsApp, and CSV export. Permanent delete works only from Archived.
- **Revoking access:** "Lock" ends this browser's session; **Lock everywhere** (in the Lock menu) ends every session. Rotating `ADMIN_KEY` (`pnpm cf:secret ADMIN_KEY`) also ends every session and retires the old key for scripts. There is no other way to revoke access.

## Videos and MEGA

Every library entry streams from its MEGA link. The link stays on the server: visitors only ever see the site's own stream address (`/media/v/<id>.mp4`). A bundled `/media/*.mp4` file plays only for an entry without a MEGA link, or as a fallback when MEGA fails.

**Export for the web before uploading to MEGA:** MP4, H.264 video with AAC audio, 720p (1280 on the long side), about 2.5 to 5 Mbps, with **fast start** (the index at the front of the file: "Web optimized" in HandBrake, `-movflags +faststart` in ffmpeg). The admin grades every link:

| Grade | Means |
| --- | --- |
| Ready | 720p or smaller and up to 5 Mbps. Plays smoothly and gets a muted preview on hover |
| Heavy | Up to 1080p or 15 Mbps. Plays, but may stall on slow connections |
| Too heavy | Larger than 1080p or over 15 Mbps (a 4K phone file). Plays slowly; re-export it at 720p |

An HEVC (H.265) file is saved as a draft and cannot be published: many browsers can't play it. Export it as H.264.

The same work from the terminal (they use the admin API, so a change shows on the site within about a minute):

```sh
pnpm video check "<MEGA link>"                      # name, size, resolution, bitrate, length, grade, warnings
pnpm video add --mega "<MEGA link>" --title "Street interview" --brand "CircleStore.in" \
  --instagram "<url>" --youtube "<url>" --views 1.2M  # publishes; add --draft to keep it hidden
pnpm video update <id> --views 150000               # --mega none, --instagram none or --youtube none clears a link
pnpm video list [--drafts | --bin]
pnpm video remove <id>                              # to the bin
pnpm video remove <id> --forever                    # only from the bin
pnpm video restore <id>
pnpm video import links.txt [--yes] [--brand "CircleStore.in"]   # every row comes in as a draft
pnpm video import --undo <importId>                 # bins a whole import
pnpm leads [--status new|contacted|archived|all] [--kind trial|question] [--csv]
```

These talk to your local Worker by default, with the key from `apps/api/.dev.vars`. For the live site, put this in front of the command: `KREATORS_API=https://kreators.army ADMIN_KEY=<your passkey>`.

- **MEGA folder links** are read by the import (each video file in the folder becomes a row). They have only been tried against a local stand-in for MEGA, so check one with `pnpm video check "<folder link>"` before the first real folder import.
- **YouTube-only entries** play the YouTube embed (the video must be Unlisted or Public, with embedding allowed). Instagram links are shown as "Watch on Instagram"; an Instagram link alone has nothing to play, so it cannot be published.

## Deploy

First time only:

```sh
pnpm cf:login
pnpm db:create            # prints a database_id
# paste that id into d1_databases in apps/api/wrangler.jsonc
pnpm cf:secret ADMIN_KEY  # a passphrase of four or more random words
```

Every release, in this order, as one line at a quiet hour (between the two commands, tiles show posters but do not play for under a minute; the contact form keeps working):

```sh
pnpm db:migrate && pnpm deploy
```

The first v2 release has two more steps after that: open `/admin`, unlock, and press **Move it into the library** on the banner (it moves the old `MEGA_LINKS` secret's key into the library entry), then delete the old secret: `pnpm --filter @kreators/api exec wrangler secret delete MEGA_LINKS`.

Set `PUBLIC_URL` as a Worker variable once the domain is live. After a deploy, watch `pnpm cf:logs` for a day for error 1102 (the free plan's CPU limit); if it appears, Workers Paid is the fix.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the web app and the Worker together |
| `pnpm typecheck` | Type-checks every package |
| `pnpm test` | Runs the shared package's and the API's tests (vitest; the MEGA tests use a local stand-in, never real MEGA) |
| `pnpm build` | Builds the web app into `apps/web/dist` |
| `pnpm perf:budget` | Checks the built bundle against its size budget (also `node scripts/perf-budget.mjs <dist folder>`) |
| `pnpm db:migrate:local` | Applies migrations to the local D1 database |
| `pnpm db:migrate` | Applies migrations to the live D1 database; run right before `pnpm deploy` |
| `pnpm db:create` | Creates the D1 database on Cloudflare |
| `pnpm deploy` | Builds the web app and deploys it with the Worker |
| `pnpm cf:secret <NAME>` | Sets a Worker secret |
| `pnpm cf:logs` | Tails live Worker logs |
| `pnpm video <check, add, update, list, remove, restore, import>` | Manages the video library (above) |
| `pnpm leads` | Lists enquiries (`--status`, `--kind`, `--csv`) |
| `pnpm cf:login`, `cf:logout`, `cf:whoami` | Manage the Wrangler login |

## How the web app is put together

| Where | What |
| --- | --- |
| `apps/web/src/lib/content.ts` | Shared facts and wording: figures, prices and packages, FAQs, blog posts, the cast's lines, the one primary action and the pages that have their own, nav and footer links, each format page's own video ids, and the defaults the founder can change in one line (`ARMY_SENTENCE`, `STREET_SCENE`, `SITE.phones`, `SITE.email`, `BRANDS`, `BRAND_GUIDE_UPLOAD`). Wording used on one page only stays in that page's file |
| `apps/web/src/App.tsx` | The routes. Every page except Home and the 404 is its own chunk, listed once in `ROUTE_LOADERS` and fetched after first paint. `/admin/*` is one lazy chunk outside the site's layout, never prefetched or precached |
| `apps/web/src/site` | Home (`Home.tsx`, `home/`), the video library, the shell (`Layout.tsx`) and the inner pages (`pages/`) |
| `apps/web/src/admin` | The admin panel |
| `apps/web/src/screens` | The 404 (`NotFound.tsx`), kept in the main bundle with Home |
| `apps/web/src/components` | Shared pieces: `ui.tsx` (buttons, reveal, numbers), `tabs.tsx` (segments, chip rails, tab bars, the chapter index), `frames.tsx` and `video.tsx` (video frames, previews, the reel deck, the player), `chat.tsx` (speech bubbles, the chat thread, the FAQ chat), `visuals.tsx` and `demos/` (the interaction chain, edit timeline, mechanism cards), `street/` (the Bengaluru street, generated by `scripts/street-art.mjs`), `Packages.tsx`, the nav, the footer and the contact form |
| `apps/web/src/cast` | Bolu, Tiko, Gola and Sochu. The plates are in `public/cast`. The rest pose paints with no JavaScript; the animated rig is a lazy chunk |
| `apps/web/src/styles` | One stylesheet per area. `tokens.css` holds every colour, radius, gradient and spacing value. Every class sits in `@layer components`, so a Tailwind utility always wins; `app.css` only imports |
| `apps/web/public/theme.js` | Runs before first paint: the theme (`kreators-theme`), Pause animations (`kreators-still`, also set by the device's reduced-motion setting) and the hero poster preload, which must match `HERO.poster` in `content.ts` |

House rules that keep it working:

- Red (`--action`) is for actions only, and there is one action label, **Request a trial video**, set in `content.ts`. The trial is never called free, and no page promises views or sales.
- Animate with `m` from `motion/react`, never `motion`; the app runs `LazyMotion strict`, which throws on the other. Only `transform`, `opacity` and `filter` animate.
- Anything that moves on its own must stop under `:root[data-still]`, the one attribute behind Pause animations and reduced motion. One self-running loop, one playing video and one speech bubble at a time; phones and Save-Data never autoplay.
- Sticky elements need `overflow: clip`, never `overflow: hidden`, on their ancestors. Sticky tops and hash scrolls use `--nav-offset`.
- The space above the footer is `--end-y` on every page: a page's last block gives up its own bottom padding.
- No page names MEGA or shows a MEGA address. Pages read only `streamUrl`, `posterUrl`, `previewOk`, `embedUrl` and `links` from a video; no file under `apps/web/src` except `lib/content.ts` holds a `/media/` path.

## Adding to it

- API route: add a file in `apps/api/src/routes` (or `routes/admin/` behind the passkey) and mount it in `apps/api/src/index.ts`.
- Database change: add the next numbered `.sql` file in `apps/api/migrations`.
- Request or response shape: define it in `packages/shared/src` and export it from `index.ts`.
- Page: add it in `apps/web/src/site/pages`, with its styles in its area's file under `apps/web/src/styles`, then add it to `ROUTE_LOADERS` and the router in `App.tsx`. Give it a `<Seo>` title and one `.g-word`.
- Site wording, prices, FAQs and blog posts: `apps/web/src/lib/content.ts`.
- Calling a new external origin from the browser: update the CSP in both `apps/api/src/headers.ts` and `apps/web/public/_headers` (a test checks they match).
