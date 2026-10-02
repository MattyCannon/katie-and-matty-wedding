# Katie & Matty — Wedding Website

Guidance for Claude Code (and humans) working in this repo.

## The event (source of truth — keep consistent everywhere)

| | |
|---|---|
| **Couple** | Katie & Matty |
| **Date** | Friday 4 June 2027 |
| **Time** | 2:00 pm ("two o'clock in the afternoon") |
| **Venue** | The Hospitium |
| **Location** | Museum Gardens, York, England |

> If any of these change, update this table **and** `src/lib/wedding.ts`, which is
> the single constant the UI reads from. Don't hard-code event details in components.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v3** for styling; palette + fonts defined in `tailwind.config.ts`
- **Fonts** via `next/font/google`: Cormorant Garamond (display) + EB Garamond (body)
- **No client JS framework beyond React** — keep it light and static-friendly

## Hosting & deployment

- **Code:** GitHub repository.
- **Hosting:** **Vercel**, connected to the GitHub repo (push to `main` → auto-deploy).
  Chosen over GitHub Pages so RSVP can later run server-side (API route) and keep
  Google credentials secret.
- Local dev requires **Node.js** (LTS). Install it, then `npm install` and `npm run dev`.

## RSVP — guest-list lookup (built, live)

Guests find their name, then RSVP for their whole party (per person). It's
**lookup-only** — no free-text form; people not on the list are asked to get in touch.

- **Data model**: the guest list is the tab **named `Guest List`**
  (`sheetsByTitle["Guest List"]`) of the RSVP sheet
  (`docs.google.com/spreadsheets/d/1jF6TM0S_0rACFfV-I9XkC6LEQGlOh1uGCZUVBQf9Fe8`).
  The tab is resolved by **name** and the columns by **header text**, so column
  order doesn't matter. Three fields are read: a group/party id, a name, and an
  optional ceremony flag (Yes/No — defaults to full-day if the column is absent).
  Accepted header wordings live in `COLUMN_ALIASES` at the top of
  `src/lib/guests.ts` — that's the one place to edit when the sheet's headers
  change. Matching ignores case/spaces/underscores/hyphens. A "party" = all rows
  sharing the same group id.
- **Responses write back onto that same tab**, in columns created on first response:
  `RSVP_Status` (Attending/Declined), `RSVP_Email`, `RSVP_Timestamp`.
- **Flow**: `/rsvp` → `src/components/RsvpForm.tsx` (client, 3 stages: search → group
  → done) → route handlers:
  - `GET /api/guests/search?q=` → matching names (min 2 chars, capped, full list
    never sent to the client; 60s in-memory cache).
  - `GET /api/guests/group?name=` → the party (members + ceremony flag).
  - `POST /api/rsvp/group` → re-resolves the group server-side from the anchor name
    and writes each member's status. Honeypot included.
- Sheet logic: `src/lib/guests.ts`; shared types: `src/lib/guestTypes.ts`; auth/doc:
  `src/lib/googleSheet.ts` (`getDoc()`).
- **Confirmation email** (optional): on submit, a short plain-text email goes to
  the address given, listing who's coming and their arrival time. Transport is
  `src/lib/email.ts` (Resend HTTP API via `fetch`, no SDK); wording is
  `src/lib/rsvpEmail.ts` (EDIT-ME). Env: `RESEND_API_KEY`, `RSVP_FROM_EMAIL`,
  optional `RSVP_BCC_EMAIL`. With no key it's silently skipped, and a mail
  failure is caught so it can never fail an RSVP that already saved.
  `recordGroupResponse` returns the rows it wrote (with ceremony flags) so the
  email doesn't need a second sheet read.
- Env vars (same as before): `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
  `GOOGLE_SHEET_ID`. Degrades gracefully (shows "RSVPs open soon" with no creds).
- Note: names are matched trimmed + case-insensitive (the sheet has some trailing
  spaces). Duplicate names across groups resolve to the first match.
- UI assumption to confirm: the ceremony flag shows as "Ceremony & evening" vs
  "Evening" — adjust the wording in `RsvpForm.tsx` if that's not the intended meaning.
- **Layout rules (phones are the main audience — keep these when editing):**
  - The whole block is **centred** (text and block): `main` is a flex centre in the
    space above the footer, and the form root is `text-center`. The page uses
    `min-h-dvh`, not `min-h-screen`, so the phone browser toolbar doesn't skew it.
  - Each party row **stacks** — name above, Coming / Can't make it below, both
    centred and `flex-wrap` — so a long name or a 320px screen can never squeeze
    the buttons. Names use `break-words`.
  - Cards, inputs and suggestion lists use an **opaque** `bg-ivory` (not `/60`),
    so border flowers can't show through behind text.
  - `main` has `px-8` and extra top padding on phones (`pt-28`) so text clears the
    border's side stems and the top corner sweeps; the shared `Footer` has `px-8
    pb-32` on phones for the same reason. The border's side stems are also
    shortened on phones (`--rail`, see WildflowerBorder).
  - Tested at 320, 360, 375, 390, 414, 768, 1024 and 1440 wide, across the
    search / results / party / error / thank-you states, with long names and a
    five-person mixed day+evening party: no text-on-text overlap, nothing
    off-screen, no sideways scroll, no wrapped buttons. Re-test at 320 and 375
    after any change here. (Handy trick: stub `window.fetch` for `/api/guests/*`
    and `/api/rsvp/group` in the browser console to test without touching the sheet.)

## Spotify song requests (built — needs creds to go live)

- Route `/songs` → `src/components/SongRequest.tsx` (client: debounced search →
  results → "Add"). Calls route handlers `src/app/api/spotify/{search,add}/route.ts`.
- Server client: `src/lib/spotify.ts`. Uses the **owner's refresh token** for both
  search and add (guests never authorize). Adds skip **duplicates**. Honeypot on add.
- **One song per guest.** Guests don't log in, so this is per browser: the add route
  sets an httpOnly cookie (`song_requested`, ~1 year; `src/lib/songLimit.ts`) after a
  song is genuinely added, and returns **409 `limit_reached`** for any later add. A
  duplicate adds nothing, so it does *not* use up the request. The client swaps the
  search for a thank-you panel and remembers the pick in localStorage (display only —
  the cookie enforces). Clearing cookies / another browser bypasses it; that's an
  accepted trade-off for a light-hearted feature.
- Env vars (`.env.local`, git-ignored; mirror in Vercel) — **never commit**:
  `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`,
  `SPOTIFY_PLAYLIST_ID`. Get the refresh token via `scripts/spotify-auth.mjs`.
- Degrades gracefully: with no env vars the page shows an "opening soon" state.
- Caveat: Spotify dropped 30s preview clips for new apps — no in-browser previews.
- Setup steps: README → "Spotify song requests setup".

## Theme — "Wildflower summer"

Matches the couple's paper invitation. Refined and romantic — **never kitsch**.

**Palette** (Tailwind tokens in `tailwind.config.ts`):

Tuned to the paper invite (`public/paper_invite_img.avif`, used as a styling
reference only — it's a template printed with other names).

| Token | Hex | Use |
|---|---|---|
| `ivory` / `ivory-deep` | `#FAF6EA` / `#F2EAD6` | page background, cards |
| `botanical-red` | `#9E2B22` | primary accent, ampersand, dahlias |
| `cornflower` / `cornflower-soft` | `#5C77B8` / `#8FB4DE` | cornflowers, forget-me-nots |
| `buttercup` | `#ECC23F` | buttercups, warm highlights |
| `dusky` / `dusky-pale` (pink) | `#D49AA0` / `#E7C2C6` | blossoms, feathery sprays |
| `sage` / `forest` | `#88A06A` / `#46603F` | foliage, stems, hairlines |
| `ink` / `ink-soft` | `#2A303C` / `#535A68` | body text / muted text |

**Typography**
- Headings: **Cormorant Garamond** (elegant old-style serif) — `font-display`.
- Body: **EB Garamond** — `font-body`.
- Labels: the `.label` utility (uppercase, letter-spaced) gives the small-caps,
  "Order of Service" feel. Use for nav items, eyebrows, and detail labels.

**Illustration style — wildflowers growing in from the edges**

Every motif is a cut stem with the bloom at the top. Each one is planted by its
**root** on an edge or in a corner of the screen and grown inward,
flower-first, towards the middle. Nothing floats in open space: a stem always
comes from somewhere off-page, with its foot just outside the viewport — the
way a border of real pressed flowers would sit. Corners carry the fullest
clusters; the middle of each edge is thinner.

This is the site's **one** decoration language — don't add a second, and don't
reintroduce free-floating motifs.

- **Two local sources**, both git-ignored (`imgs/`), because stock licences
  cover using the artwork in the finished site but not redistributing the
  original files. Only the small `.webp` cut-outs are committed.
  1. `imgs/AdobeStock_1554878676.jpeg` — the **licensed Adobe Stock** sheet:
     six wildflower stems on white, 8736x4896. All the *detail* comes from here.
  2. `imgs/wildflowers-source/*.png` — **Katie & Matty's own hand-cut motifs**,
     one flower each on white with neighbouring stems erased. These are the
     authority on **which** flower and **how much of it** each motif is. They're
     only 30–90px, so they can't be used directly at retina sizes.
- **11 motifs** are built by `scripts/cut-wildflowers.py`
  (`python3 scripts/cut-wildflowers.py`) into `public/wildflowers/scatter/*.webp`.
  It takes the framing from (2) and the resolution from (1): it locates each
  hand-cut PNG in the full sheet by **multi-scale template matching** (all
  eleven land at ~0.068 scale, which is how we know they share a source), crops
  the sheet at full resolution there, then uses the hand-cut silhouette as a
  **stencil** — so whatever neighbouring artwork happens to fall inside that
  rectangle stays erased. Finally the white paper is **keyed to transparency**
  with a soft ramp so watercolour edges stay feathered, and un-blended so a
  pale petal keeps its real colour.
  - To add or re-frame a motif: drop a new hand-cut PNG into
    `imgs/wildflowers-source/`, re-run the script, and paste the `MOTIFS` block
    it prints into `WildflowerBorder.tsx`. The filename becomes the motif key.
  - The script flags any weak template match (< 0.75) to check by eye.
- `public/wildflowers/divider-bloom.webp` is the older, separate cut-out used by
  `Divider` (a single bloom between sage hairlines). Still in use, unchanged.
- **`WildflowerBorder`** plants them as **one border around the whole page**:
  a fuller cluster across the very top, a fuller cluster across the very
  bottom (beneath the footer), and a continuous run of stems down both sides.
  **No flowers sit between sections** — that was the old per-section system and
  is deliberately gone. Each motif is reused many times at a different length,
  angle and mirroring — that repetition is what keeps the border from reading
  as a pattern. It also draws a deterministic confetti of tiny colour specks
  (the invite's seed-paper texture), kept to the border strips only (no
  `Math.random`, so no hydration mismatch). **Positions are the EDIT-ME bit**:
  `TOP`, `BOTTOM`, and the side modules `RAIL_A` / `RAIL_B`.
  - **Why modules.** Page height isn't known at render time (viewport,
    accordion panels), so side stems aren't placed by % of page height — that
    would stretch them apart on a tall page. The side run is a hand-arranged
    module (`MODULE_H` px tall) repeated down the page, alternating A/B so it
    doesn't read as a stamp. `MODULE_COUNT` modules are rendered — far more
    than any page needs; the layer clips at the real page height and images
    below it never load.
  - Render it **once per page**, as the first child of the page's outermost
    wrapper (`page.tsx`, `rsvp/page.tsx`, `songs/page.tsx`). It sits at
    `-z-10`, behind in-flow content, so it needs an ancestor stacking context or
    it vanishes behind the body background: on the landing page that's the
    `relative z-10` wrapper; `/rsvp` and `/songs` carry `relative isolate` on
    their root. **Don't** mount it per section — that reintroduces flowers in
    the gaps between sections.
  - `x` is the **root** of the stem — the point it grows out of — as a % of page
    width; `top` / `bottom` are the root's px from that edge. The component
    pivots each motif about the foot of its stem (`transform-origin: 50% 100%`
    plus a matching translate), so a stem swings out from its root like a real
    one. Keep roots just off-page (`x: -1`/`101`, `top: -2`, `bottom: -2`).
  - `grow` is the direction it grows, in degrees clockwise from straight up.
    Use the `FROM_*` constants — named for the edge the stem is rooted on, so
    `FROM_LEFT` grows rightwards — plus a few degrees of lean
    (`FROM_LEFT + 12`) so the border doesn't look combed.
  - `size` is the stem's **length**, which is also how far it reaches inward.
    Keep side stems under ~115px so they hug the edge; bottom-edge stems grow
    *up*, so keep the middle ones under ~72px or they reach the footer text
    (`Footer` has extra bottom padding for this); top-edge stems hang down, so
    keep them out of `x` 28–72 where the hero type and the **header RSVP button**
    (top centre of the landing page) sit.
  - `wideOnly` drops a stem below `sm`. `--wf` on the layer scales every length
    and gap down on narrower screens; `--rail` additionally shortens the **side
    run only** below `lg` (0.55 on phones, 0.7 on tablets, 1 from `lg`), because
    on a phone or tablet the text runs nearly edge to edge and a long side stem
    would sit on top of it. The top and bottom clusters are not shortened.
    Text-heavy sections pair this with wider side margins (`UsefulInfo` is
    `px-9` on phones, `sm:px-14` on tablets; `Footer` is `px-8` on phones) so the
    first letters of left-aligned text clear the stems.
- All decoration is `aria-hidden` + `pointer-events-none`, with `alt=""`.
- Earlier systems have been **removed** — don't reintroduce them: the
  hand-drawn SVG flowers (`Botanicals.tsx`); the four tall corner stems
  (`WildflowerCorner`, with `corner-blue-flax` / `corner-meadow-sprig`), which
  pinned one repeated stem to each corner; and the per-section
  `WildflowerScatter` (variants `hero` / `section` / `quiet`), which put flowers
  between sections. The current border is *varied* stems rooted on the edges —
  not one repeated stem.

## Site map / roadmap

There is **no nav bar** (it was removed, along with `navLinks`). The only
navigation is a slim **header** at the very top of the landing page holding a
single centred **RSVP button** → `/rsvp`, plus scrolling. The header is
`absolute` (so the hero keeps its full-viewport height and the button scrolls
away with the page), and the hero has symmetrical `py-24` so its content clears
it. The border's top cluster keeps clear of the top centre for it.

Landing-page sections, top to bottom:

0. Header — centred RSVP button (see above). Only on the landing page.
1. Hero — names + date/venue (eyebrow: "Together with their friends & family").
   Full viewport (`min-h-dvh`), **scroll-snap page**, content **centred**
   horizontally and vertically. There is **no Save the Date heading and no Add to
   Calendar button** on the landing page — they were removed on purpose (see the
   day-vs-evening note below). The eyebrow only shows from `lg` up.
2. The Venue (`#venue`) — **Google Maps embed** (no API key) + "Get directions".
   Full viewport, **scroll-snap page**.
3. Useful Information (`#useful-info`) — **accordion**: Travel, Where to Stay,
   Local Recommendations. On narrow phones the section titles shrink slightly
   and `.btn` tightens its tracking so nothing wraps into a cramped two-liner.
4. Footer — `Footer` takes `divider` (default on): the landing page passes
   `divider={false}` (the bloom divider used to sit beneath the old RSVP button),
   while `/rsvp` and `/songs` keep it. The footer line is three `nowrap` parts
   (names / date / place) that **stack on phones and sit in one row from `md`**,
   so the date can never break across lines.

Snapping runs **Hero → Venue**. Sections after Venue have no `snap-align`, so
scrolling returns to normal.

Other routes: `/rsvp` (guest-list lookup) and `/songs` ("Request a Song"). `/songs`
is reachable only from the RSVP success screen.

### Editing content (no component changes needed)

- **Event details / calendar / map** → `src/lib/wedding.ts` (names, date, time,
  address, calendar times, map query).
- **Day vs evening guests.** The guest list's ceremony flag drives everything.
  Two arrival types live in `wedding.arrivals` (EDIT-ME): `ceremony` (arrive
  1:30 pm, ceremony 2:00 pm) and `evening` (from 7:00 pm), each with its own
  wording and calendar times.
  - There is deliberately **no calendar entry on the public landing page** (an
    all-day "Save the Date" button used to live in the hero and was removed,
    along with `calendarLinks` and the all-day `.ics`): the page is shown before
    the name lookup, so it can't tell an evening-only guest from a ceremony
    guest. Calendar entries only appear after the lookup.
  - Precise timings appear **as soon as a guest picks their name** — the
    `ArrivalPanel` at the top of the group stage in `RsvpForm.tsx`, above the
    coming / can't-make-it toggles. Not on the success screen (people need the
    time before they submit, not after). The day/evening split is still never
    public, since it's behind the name lookup. Mixed parties get one line per
    type, labelled with who it applies to, and a **single** Add to Calendar
    button whose menu is grouped by type (`CalendarDropdown` takes `sections`).
  - Two `.ics` files in `public/`: `katie-and-matty-ceremony.ics` (13:30–00:00
    BST) and `katie-and-matty-evening.ics` (19:00–00:00 BST). Both end at
    **midnight**, i.e. 00:00 on 5 June (`DTEND` 23:00Z on the 4th). Times are
    stored as UTC (`Z`), i.e. one hour behind the BST local time. Update both
    plus `wedding.ts` if the date or times change.
- **Useful Information links** → `src/lib/usefulInfo.ts` (one entry per accordion
  panel; each item has an optional `href`). Has an EDIT-ME header.
- **Map** uses Google's no-key `…/maps?q=…&output=embed`. Renders in real browsers;
  won't load in headless/automated previews. For guaranteed reliability/styling,
  switch to the official Maps Embed API (free key) in `src/lib/wedding.ts` → `maps.embedSrc`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx      # fonts, <html>, metadata
│   ├── page.tsx        # landing page composition; mounts the one WildflowerBorder
│   └── globals.css     # Tailwind layers, base styles, .label/.btn/.acc utilities
├── app/api/spotify/    # song search + add route handlers
├── app/api/guests/     # guest-list search + group resolve
├── app/api/rsvp/group/ # group RSVP submit (writes back to the Guest List tab)
├── app/rsvp/           # RSVP page (guest-list lookup)
├── app/songs/          # "Request a Song" page
├── components/
│   ├── Hero.tsx             # full-viewport snap page, content centred
│   ├── CalendarDropdown.tsx # "Add to Calendar" menu (client; used on the RSVP page)
│   ├── VenueMap.tsx         # Google Maps embed + directions (snap page)
│   ├── UsefulInfo.tsx       # <details> accordion
│   ├── RsvpForm.tsx         # RSVP guest-lookup client form (search → group → done)
│   ├── SongRequest.tsx      # Spotify search/add client component
│   ├── Footer.tsx
│   └── botanical/
│       ├── WildflowerBorder.tsx  # ONE border per page: top, bottom, both sides; EDIT-ME
│       └── Divider.tsx           # single bloom between sage hairlines
└── lib/
    ├── wedding.ts      # event details + calendar/map link builders
    ├── usefulInfo.ts   # EDIT-ME accordion content (travel/stay/recommendations)
    ├── guests.ts       # guest-list read/search/resolve + write-back; COLUMN_ALIASES
    ├── guestTypes.ts   # shared (client-safe) RSVP types
    ├── googleSheet.ts  # authed Google Sheets doc (getDoc)
    └── spotify.ts      # Spotify search/add client

scripts/
├── spotify-auth.mjs     # one-time: obtain the Spotify refresh token
└── cut-wildflowers.py   # re-cut the border motifs from the stock sheet

imgs/                          # source artwork (git-ignored, local only)
├── AdobeStock_1554878676.jpeg # the licensed sheet — supplies the resolution
└── wildflowers-source/        # the couple's hand-cut motifs — supply the framing

public/
├── katie-and-matty-ceremony.ics  # 13:30–00:00 BST (ceremony guests)
├── katie-and-matty-evening.ics   # 19:00–00:00 BST (evening guests)
└── wildflowers/
    ├── divider-bloom.webp        # single bloom used by Divider
    └── scatter/                  # 11 keyed motifs used by WildflowerBorder
```

Tip: `npm run dev` runs the site at http://localhost:3000. (There's a Claude Code
preview launch config at the repo-root `.claude/launch.json` named "wedding".)

## Conventions

- Read event facts from `src/lib/wedding.ts`; never duplicate them in markup.
- Keep components server components unless they need interactivity.
- British English in user-facing copy (e.g. "4th June", "favour").
