# kreators-army

A pnpm monorepo: a React app built with Vite, served by a Cloudflare Worker with a D1 database. The Worker answers `/api/*` and serves the built web app as static files from the same origin.

```
apps/web         React, Vite, Tailwind, PWA
apps/api         Cloudflare Worker (Hono), D1 migrations
packages/shared  Types and values used by both apps
scripts          Repository tooling (bundle size budget)
```

## Run locally

Needs Node 22 and pnpm 11.

```sh
pnpm install
cp apps/api/.dev.vars.example apps/api/.dev.vars
pnpm db:migrate:local
pnpm dev
```

The web app runs on http://localhost:5183 and proxies `/api` to the Worker on port 8797.

## First deploy

```sh
pnpm cf:login
pnpm db:create            # prints a database_id
# paste that id into d1_databases in apps/api/wrangler.jsonc
pnpm db:migrate
pnpm cf:secret ADMIN_KEY  # a long random value; it guards adding videos and reading enquiries
pnpm deploy
```

Set `PUBLIC_URL` as a Worker variable once the domain is live.

## Adding videos

The site has no admin screens. Videos go in through the admin API, using these commands. Nothing needs redeploying; a new video shows up within about a minute.

```sh
pnpm video add --url "https://youtu.be/XXXXXXXXXXX" --title "Street interview" --brand "CircleStore.in" \
  --category "Fashion" --platform "Instagram Reels" --views 120000
pnpm video list
pnpm video update <id> --views 150000
pnpm video update <id> --published false   # hide without deleting
pnpm video remove <id>
pnpm leads                                 # read contact form enquiries
```

These talk to your local API by default. For the live site, put this in front of the command: `KREATORS_API=https://your-domain ADMIN_KEY=your-key`.

- **YouTube:** the video must be **Unlisted**, with embedding allowed. YouTube does not let **Private** videos play on any website.
- **wave.video:** in the video's embed settings, copy the embed code and pass all of it as `--url`. wave.video gives no thumbnail, so add `--poster "https://..."`.
- `--aspect landscape` is for 16:9 videos; vertical is the default.
- The Category and Platform filters appear on the library page as soon as any video has one.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the web app and the Worker together |
| `pnpm typecheck` | Type-checks every package |
| `pnpm build` | Builds the web app into `apps/web/dist` |
| `pnpm perf:budget` | Checks the built bundle against its size budget |
| `pnpm db:migrate:local` | Applies migrations to the local D1 database |
| `pnpm db:migrate` | Applies migrations to the live D1 database; run before `pnpm deploy` |
| `pnpm db:create` | Creates the D1 database on Cloudflare |
| `pnpm deploy` | Builds the web app and deploys it with the Worker |
| `pnpm cf:secret <NAME>` | Sets a Worker secret |
| `pnpm cf:logs` | Tails live Worker logs |
| `pnpm video <add, list, update, remove>` | Manages the video library |
| `pnpm leads` | Lists contact form enquiries |
| `pnpm cf:login`, `cf:logout`, `cf:whoami` | Manage the Wrangler login |

`pnpm --filter @kreators/shared test` runs the shared package's tests.

## How the web app is put together

| Where | What |
| --- | --- |
| `apps/web/src/lib/content.ts` | Shared facts and wording: figures, prices, FAQs, blog posts, the one primary action and the pages that have their own, footer links, and each format page's own video ids (`FORMATS[x].videoIds`, falling back to the top four). Wording used on one page only stays in that page's file |
| `apps/web/src/App.tsx` | The routes. Every page except Home and the 404 is its own chunk, listed once in `ROUTE_LOADERS` and fetched after first paint |
| `apps/web/src/site` | Home (`Home.tsx`, `home/`), the video library, the shell (`Layout.tsx`) and the inner pages (`pages/`) |
| `apps/web/src/screens` | The 404 (`NotFound.tsx`), kept in the main bundle with Home |
| `apps/web/src/components` | Shared pieces: `ui.tsx` (buttons, tiles, bento, reveal, numbers), the nav, the footer, the video tile and player, the contact form |
| `apps/web/src/cast` | Bolu, Tiko, Gola and Sochu. The plates are in `public/cast`. The rest pose paints with no JavaScript; the animated rig is a lazy chunk |
| `apps/web/src/styles` | One stylesheet per area. `tokens.css` holds every colour, radius, gradient and spacing value. Every class sits in `@layer components`, so a Tailwind utility always wins; `app.css` only imports |
| `apps/web/public/theme.js` | Runs before first paint: the theme (`kreators-theme`), Pause animations (`kreators-still`, also set by the device's reduced-motion setting) and the hero poster preload |

House rules that keep it working:

- Red (`--action`) is for actions only, and there is one action label, `Get a Free Trial Video`, set in `content.ts`.
- Animate with `m` from `motion/react`, never `motion`; the app runs `LazyMotion strict`, which throws on the other. Only `transform`, `opacity` and `filter` animate.
- Anything that moves on its own must stop under `:root[data-still]`, the one attribute behind Pause animations and reduced motion.
- Sticky elements need `overflow: clip`, never `overflow: hidden`, on their ancestors. Sticky tops and hash scrolls use `--nav-offset`.
- The space above the footer is `--end-y` on every page: a page's last block gives up its own bottom padding.

## Adding to it

- API route: add a file in `apps/api/src/routes` and mount it in `apps/api/src/index.ts`.
- Database change: add the next numbered `.sql` file in `apps/api/migrations`.
- Request or response shape: define it in `packages/shared/src` and export it from `index.ts`.
- Page: add it in `apps/web/src/site/pages`, with its styles in its area's file under `apps/web/src/styles`, then add it to `ROUTE_LOADERS` and the router in `App.tsx`. Give it a `<Seo>` title and one `.g-word`.
- Site wording, prices, FAQs and blog posts: `apps/web/src/lib/content.ts`.
- Calling a new external origin from the browser: update the CSP in both `apps/api/src/headers.ts` and `apps/web/public/_headers`.
