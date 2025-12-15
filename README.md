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

## Deployment (GitHub Pages)

This repository includes a GitHub Actions workflow that builds the Vite app and publishes the `dist` folder to the `gh-pages` branch. After you push to `main`, the site will be published automatically.

- Site URL (once published): `https://harrisjustinhagen-oss.github.io/BlockDAG-Transfer/`

If you prefer Vercel or Netlify, connect the repository to those services and set the build command to `npm run build` with the publish directory `dist`.
