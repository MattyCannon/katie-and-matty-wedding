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

`/rsvp` is a **guest-list lookup**: guests search for their name and RSVP for
their whole party (per person). It reads from / writes to a Google Sheet via a
**service account**, and degrades gracefully when unconfigured ("RSVPs open soon").

**Guest list = the second tab** of the Sheet, with columns `Group_ID`, `Name`,
`Ceremony_Guest` (Yes/No), `Food_Order`. A party is all rows sharing a `Group_ID`.
Responses are **written back onto that same tab** in columns added automatically on
the first response: `RSVP_Status`, `RSVP_Email`, `RSVP_Timestamp`. Keep the guest
list up to date there (extend rows as needed). It's lookup-only — guests not on the
list are asked to get in touch.

1. **Create the Sheet** (or use the existing one). Copy its id from the URL
   (`https://docs.google.com/spreadsheets/d/`**`THIS_BIT`**`/edit`). Put the guest
   list on the **second tab**.
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

## Spotify song requests setup

The `/songs` page lets guests search Spotify and add a track to a central
playlist. Like RSVP, it degrades gracefully — without config the page shows a
tidy "opening soon" state. Only **you** (the playlist owner) authorize, once;
guests never log into Spotify.

1. **Create a Spotify app** at <https://developer.spotify.com/dashboard> → note
   the **Client ID** and **Client secret**. In the app settings, add the redirect
   URI exactly: `http://127.0.0.1:8888/callback`.
2. **Create the playlist** (public or private, owned by you). Copy its id from the
   share link: `https://open.spotify.com/playlist/`**`THIS_BIT`**`?…`.
3. **Get a refresh token.** Put `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in
   `.env.local`, then run:
   ```bash
   node scripts/spotify-auth.mjs
   ```
   Open the printed URL, approve, and copy the refresh token it prints.
4. **Finish `.env.local`** with all four:
   `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`,
   `SPOTIFY_PLAYLIST_ID`.
5. **Vercel.** Add the same four under Project → Settings → Environment Variables,
   then redeploy.

Notes: duplicate tracks are skipped automatically. Spotify no longer provides
30-second preview clips for new apps, so the picker shows album art + title +
artist (no in-browser preview).

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
