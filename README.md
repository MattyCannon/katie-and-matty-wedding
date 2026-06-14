# Katie & Matty — Wedding Website

A wildflower-summer wedding site for **Katie & Matty** — married Friday **4 June 2027**
at **The Hospitium**, Museum Gardens, York.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS. See
[`CLAUDE.md`](./CLAUDE.md) for the full theme brief and project conventions.

> **Status:** Landing page only. RSVP, Details, Travel & Stay and FAQ are planned —
> the nav links to those routes already, but the pages don't exist yet (they 404
> until built).

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
