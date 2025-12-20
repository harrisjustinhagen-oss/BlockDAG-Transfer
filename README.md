<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZtN8IQY9GU3b94ZSvZXPtMFM9iz-vEcr

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (local testing)

We scaffolded a small Fastify + Prisma + SQLite server under `server/`.

1) Install deps: `cd server && npm install`
2) Copy env: `cp .env.example .env` (Windows: `copy .env.example .env`)
3) Generate Prisma client + DB: `npx prisma generate && npx prisma migrate dev --name init`
4) Run API: `npm run dev` (defaults to port 4000, CORS open to http://localhost:5173)

Endpoints (JSON):
- `POST /users` { handle }
- `GET /team/slots/:handle`, `POST /team/slots` { handle, set, invitedId }, `POST /team/slots/accept` { handle, set }, `POST /team/slots/revoke` { handle, set }
- `GET /rental-board`, `POST /rental-board` { handle, message, rate? }, `DELETE /rental-board/:id`
- `POST /equipped-sets` { handle, sets: string[] }, `GET /equipped-sets/:handle`

## Deployment (GitHub Pages)

This repository includes a GitHub Actions workflow that builds the Vite app and publishes the `dist` folder to the `gh-pages` branch. After you push to `main`, the site will be published automatically.

- Site URL (once published): `https://harrisjustinhagen-oss.github.io/BlockDAG-Transfer/`

If you prefer Vercel or Netlify, connect the repository to those services and set the build command to `npm run build` with the publish directory `dist`.
