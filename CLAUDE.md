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
- Env vars (same as before): `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
  `GOOGLE_SHEET_ID`. Degrades gracefully (shows "RSVPs open soon" with no creds).
- Note: names are matched trimmed + case-insensitive (the sheet has some trailing
  spaces). Duplicate names across groups resolve to the first match.
- UI assumption to confirm: the ceremony flag shows as "Ceremony & evening" vs
  "Evening" — adjust the wording in `RsvpForm.tsx` if that's not the intended meaning.

## Spotify song requests (built — needs creds to go live)

- Route `/songs` → `src/components/SongRequest.tsx` (client: debounced search →
  results → "Add"). Calls route handlers `src/app/api/spotify/{search,add}/route.ts`.
- Server client: `src/lib/spotify.ts`. Uses the **owner's refresh token** for both
  search and add (guests never authorize). Adds skip **duplicates**. Honeypot on add.
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

**Illustration style**
- Watercolour botanical illustration, cut from a **licensed Adobe Stock** sheet
  (`imgs/AdobeStock_1554878676.jpeg` — six wildflower stems on white). `imgs/` is
  **git-ignored** — the source artwork stays local, since stock licences cover
  using an asset in the finished site but not redistributing the original file.
  Only the derived cut-outs below are committed.
- Three elements are cut from it, each with the white paper **keyed to
  transparency** with a soft alpha ramp so watercolour edges stay feathered:
  - `public/wildflowers/corner-blue-flax.webp` — blue flax stem
  - `public/wildflowers/corner-meadow-sprig.webp` — mixed meadow sprig
  - `public/wildflowers/divider-bloom.webp` — a single yellow-orange bloom
- The two stems **frame the corners** (`WildflowerCorner`), mirrored with
  `-scale-x-100` / `-scale-y-100`. The bloom sits between sage hairlines as the
  **section divider** (`Divider`).
- All decoration is `aria-hidden` + `pointer-events-none`, with `alt=""`.
- The earlier hand-drawn SVG system (`Botanicals.tsx`) has been **removed** —
  photographic/watercolour artwork replaced it. Don't reintroduce SVG flowers.

## Site map / roadmap

There is **no nav bar** — it was removed from every page, along with `navLinks`.
Navigation is by scrolling, plus the RSVP button.

Landing-page sections, top to bottom:

1. Hero — names + date/venue (eyebrow: "Together with their friends & family"),
   with **Save the Date + Add to Calendar nested inside it**, tight beneath the
   date line. Full viewport (`min-h-dvh`), **scroll-snap page**, content aligned
   to the **top**. `AddToCalendar` is rendered by `Hero.tsx`, not by `page.tsx`,
   and carries no vertical padding of its own — spacing comes from the
   `className` Hero passes it.
2. The Venue (`#venue`) — **Google Maps embed** (no API key) + "Get directions".
   Full viewport, **scroll-snap page**.
3. Useful Information (`#useful-info`) — **accordion**: Travel, Where to Stay,
   Local Recommendations
4. RSVP call-to-action button → `/rsvp`
5. Footer

Snapping runs **Hero → Venue**. Sections after Venue have no `snap-align`, so
scrolling returns to normal.

Other routes: `/rsvp` (guest-list lookup) and `/songs` ("Request a Song"). `/songs`
is reachable only from the RSVP success screen.

### Editing content (no component changes needed)

- **Event details / calendar / map** → `src/lib/wedding.ts` (names, date, time,
  address, calendar times, map query). The Add-to-Calendar links and the `.ics`
  in `public/katie-and-matty-wedding.ics` derive from here — update both if dates change.
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
│   ├── page.tsx        # landing page composition + corner botanicals
│   └── globals.css     # Tailwind layers, base styles, .label/.btn/.acc utilities
├── app/api/spotify/    # song search + add route handlers
├── app/api/guests/     # guest-list search + group resolve
├── app/api/rsvp/group/ # group RSVP submit (writes back to the Guest List tab)
├── app/rsvp/           # RSVP page (guest-list lookup)
├── app/songs/          # "Request a Song" page
├── components/
│   ├── Hero.tsx             # full-viewport snap page, top-aligned; renders AddToCalendar
│   ├── CalendarDropdown.tsx # "Add to Calendar" menu (client)
│   ├── AddToCalendar.tsx    # Save the Date heading + button (nested in Hero)
│   ├── VenueMap.tsx         # Google Maps embed + directions (snap page)
│   ├── UsefulInfo.tsx       # <details> accordion
│   ├── RsvpForm.tsx         # RSVP guest-lookup client form (search → group → done)
│   ├── SongRequest.tsx      # Spotify search/add client component
│   ├── Footer.tsx
│   └── botanical/
│       ├── WildflowerCorner.tsx # watercolour corner stems (flax / sprig)
│       └── Divider.tsx          # single bloom between sage hairlines
└── lib/
    ├── wedding.ts      # event details + calendar/map link builders
    ├── usefulInfo.ts   # EDIT-ME accordion content (travel/stay/recommendations)
    ├── guests.ts       # guest-list read/search/resolve + write-back; COLUMN_ALIASES
    ├── guestTypes.ts   # shared (client-safe) RSVP types
    ├── googleSheet.ts  # authed Google Sheets doc (getDoc)
    └── spotify.ts      # Spotify search/add client

scripts/
└── spotify-auth.mjs    # one-time: obtain the Spotify refresh token

imgs/                   # source artwork (git-ignored, local only)

public/
├── katie-and-matty-wedding.ics   # downloadable calendar file
└── wildflowers/                  # keyed watercolour cut-outs (corners, divider)
```

Tip: `npm run dev` runs the site at http://localhost:3000. (There's a Claude Code
preview launch config at the repo-root `.claude/launch.json` named "wedding".)

## Conventions

- Read event facts from `src/lib/wedding.ts`; never duplicate them in markup.
- Keep components server components unless they need interactivity.
- British English in user-facing copy (e.g. "4th June", "favour").
