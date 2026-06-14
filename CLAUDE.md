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

## RSVP (NOT built yet)

- RSVP submissions will be stored in **Google Sheets**.
- Planned approach: a Next.js **API route** (`/api/rsvp`) using a Google **service
  account** (via `google-spreadsheet` / `googleapis`) so credentials stay server-side.
- Credentials will live in `.env.local` (git-ignored) and Vercel env vars — never commit them.

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
- Vintage botanical line-and-wash: fine forest/sage outlines, muted palette fills.
- Floral **clusters frame the corners and edges** of the page (`CornerCluster`).
- A small floral **sprig divider** (`Divider`) separates sections.
- All illustration SVGs are decorative → `aria-hidden`, `pointer-events-none`.
- If the actual invite image is added to `/public`, tune the SVGs to match it.

## Site map / roadmap

Everything lives on the **single landing page** so far. Sections, top to bottom:

1. Hero — names + date/venue
2. Order of Service — key details
3. Save the Date — **Add to Calendar** (Google / Outlook links + downloadable `.ics`)
4. The Venue (`#venue`) — **Google Maps embed** (no API key) + "Get directions"
5. Useful Information (`#useful-info`) — **accordion**: Travel, Where to Stay,
   Local Recommendations
6. Footer

Nav links: `RSVP` and `FAQ` point at routes (`/rsvp`, `/faq`) that **don't exist
yet** (they 404 until built — for RSVP → Google Sheets, FAQ later). `Details` and
`Travel & Stay` are hash links to the on-page `#venue` and `#useful-info` sections.

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
├── components/
│   ├── NavBar.tsx
│   ├── Hero.tsx
│   ├── OrderOfService.tsx
│   ├── AddToCalendar.tsx    # Google/Outlook/.ics buttons
│   ├── VenueMap.tsx         # Google Maps embed + directions
│   ├── UsefulInfo.tsx       # <details> accordion
│   ├── Footer.tsx
│   └── botanical/
│       ├── Botanicals.tsx   # flower/leaf primitives + CornerCluster
│       └── Divider.tsx      # floral sprig divider
└── lib/
    ├── wedding.ts      # event details + calendar/map link builders
    └── usefulInfo.ts   # EDIT-ME accordion content (travel/stay/recommendations)

public/
└── katie-and-matty-wedding.ics   # downloadable calendar file
```

Tip: `npm run dev` runs the site at http://localhost:3000. (There's a Claude Code
preview launch config at the repo-root `.claude/launch.json` named "wedding".)

## Conventions

- Read event facts from `src/lib/wedding.ts`; never duplicate them in markup.
- Keep components server components unless they need interactivity.
- British English in user-facing copy (e.g. "4th June", "favour").
