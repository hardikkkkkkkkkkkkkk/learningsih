# Deploying NHAA Stress Assessment (SIH prototype)

## What changed to make this deployable
`server/index.js` now also serves the built React app (the `dist/` folder from
`npm run build`) and falls back to `index.html` for any non-`/api` route. That
means the whole app — frontend **and** backend — can run as a single Node
service. No separate frontend host needed.

## Before you deploy — rotate your API key
Your old key was sitting in a plain `.env` file that wasn't excluded by
`.gitignore`. If that file was ever pushed to GitHub (even briefly, even in a
private repo you later made public), Google's automated leak scanners
typically detect and disable it — which matches "it stopped working even
though I barely used it."

1. Go to https://aistudio.google.com/apikey and revoke/delete the old key.
2. Create a fresh key there (it'll be an "auth key", prefixed `AQ.` — this is
   the new normal, not a mistake).
3. Never paste this key into a chat, a public repo, or a client-side file.
   It only ever goes in two places:
   - your local `.env` (already gitignored now)
   - your hosting platform's "Environment Variables" settings

## Deploying on Netlify (what you're using now)

Netlify only serves static files + short-lived serverless functions — it can't
run `server/index.js` as a persistent process. So `/api/chat` and
`/api/gemini-health` have been rewritten as **Netlify Functions**:

- `netlify/functions/chat.js`
- `netlify/functions/gemini-health.js`

Both reuse the exact same logic as the local Express server (shared from
`server/geminiCore.js`), so behavior doesn't drift between local dev and
production. `netlify.toml` wires `/api/chat` and `/api/gemini-health` to those
functions and handles the SPA fallback — you don't need to change any
frontend code, it still calls `/api/chat` like before.

### Where the API key goes
**Netlify dashboard → your site → Site configuration → Environment variables
→ Add a variable:**
- Key: `GEMINI_API_KEY`
- Value: *your new key*
- Scope: leave default (all deploy contexts) unless you want per-branch keys

That's it — the functions read it via `process.env.GEMINI_API_KEY` at
runtime. Redeploy after adding it (Netlify doesn't hot-reload env vars into
already-running deploys).

### Steps, start to finish
1. Push this project to a GitHub repo (`.gitignore` already excludes `.env`).
2. Netlify → **Add new site** → **Import an existing project** → pick your repo.
3. Build settings (Netlify should auto-detect these from `netlify.toml`, but
   confirm):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
4. Before or right after the first deploy, add the `GEMINI_API_KEY`
   environment variable as above.
5. Deploy (or **Trigger deploy** if you added the env var after the first
   build). Your site's Netlify URL is your live prototype.

### Netlify's function timeout — one thing to know
Free-tier Netlify functions get killed at **10 seconds**. Gemini normally
replies in 2–5s, so this is usually fine, but the chat function's retry
budget was intentionally shortened (1 retry, 8s per attempt) to fail fast and
stay under that ceiling instead of your users seeing a raw 504. If you
upgrade to Netlify Pro later, the ceiling goes up to 26s and you can loosen
those numbers back up in `netlify/functions/chat.js`.

### Testing your Netlify functions locally (optional but recommended)
```bash
npm install -g netlify-cli
netlify dev
```
This runs the real functions + Vite dev server together with the same
routing Netlify uses in production, so you catch issues before deploying.

## Alternative: Render or Railway (single Node service)
If you ever move off Netlify, `server/index.js` + `npm run start:prod` still
work as a normal long-lived Node server (build command
`npm install && npm run build`, start command `npm run start:prod`,
same `GEMINI_API_KEY` env var, just set in that platform's dashboard instead).

## Testing locally before you deploy
```bash
npm install
cp .env.example .env        # then paste your new key into .env
npm run start                # dev mode: Vite (5173) + API (3000) together
```
To test the exact production path locally:
```bash
npm run build
npm run start:prod           # single server on :3000, serving built frontend + API
```
Then check `http://localhost:3000/api/gemini-health` — it should report
`"connection": "ok"` if the key is valid and reachable.
