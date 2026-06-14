# Katie & Matty — Wedding Website

A wildflower-summer wedding site for **Katie & Matty** — married Friday **4 June 2027**
at **The Hospitium**, Museum Gardens, York.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS. See
[`CLAUDE.md`](./CLAUDE.md) for the full theme brief and project conventions.

> **Status:** Landing page + **RSVP** (`/rsvp`, stores to Google Sheets). Details and
> FAQ are still planned (the nav links to `/details`/`/faq` 404 until built; Details
> & Travel are also reachable as on-page sections).

## Prerequisites

- **Node.js** (LTS, v18.18+ — v20 or v22 recommended). Not currently installed on
  this machine: grab it from <https://nodejs.org>.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## RSVP / Google Sheets setup

The `/rsvp` form posts to a Next.js Server Action that appends a row to a Google
Sheet via a **service account**. The page works without this configured — submits
just return a friendly error and log a hint — so set it up when you're ready.

1. **Create the Sheet.** New Google Sheet; copy its id from the URL
   (`https://docs.google.com/spreadsheets/d/`**`THIS_BIT`**`/edit`). The header
   row is created automatically on the first RSVP.
2. **Google Cloud project.** At <https://console.cloud.google.com> create/select a
   project and enable the **Google Sheets API**.
3. **Service account.** APIs & Services → Credentials → Create credentials →
   Service account. Then open it → Keys → Add key → **JSON**, and download it.
4. **Share the Sheet** with the service account's `client_email` (from the JSON),
   giving it **Editor** access.
5. **Set env vars.** Copy `.env.local.example` to `.env.local` and fill in:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email`
   - `GOOGLE_PRIVATE_KEY` — the `private_key` (keep the quotes and `\n` escapes)
   - `GOOGLE_SHEET_ID` — from step 1
6. **Vercel.** Add the same three under Project → Settings → Environment Variables,
   then redeploy.

Columns written: `Timestamp · Name · Email · Attending · Guests · Guest names`.

## Deploying (Vercel)

1. Create a GitHub repo and push this folder to it.
2. In Vercel, **Add New → Project** and import the GitHub repo.
3. Framework preset is auto-detected as **Next.js** — no extra config needed.
4. Every push to `main` deploys automatically.

(RSVP → Google Sheets will later need Google service-account credentials added as
Vercel environment variables — see `CLAUDE.md`.)

## Project structure

```
src/
├── app/            layout, landing page, global styles
├── components/     NavBar, Hero, OrderOfService, Footer + botanical/ SVGs
└── lib/wedding.ts  single source of event details
```
