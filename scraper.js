# Baseplate — Roblox Game Finder (backend edition)

This is the real version of the app: a small server that scrapes Roblox's
game data on its own, stores it in a database, and serves it to a website
your friends (or the public) can use. This is the only version that can
realistically show 700+ real games, because Roblox blocks that kind of
scraping from a plain browser page — it has to come from a server.

## What's inside

- `server.js` — the web server. Serves the frontend and a JSON API.
- `scraper.js` — pulls game data from Roblox and saves it to the database.
  Runs once on startup, then automatically every 3 days via cron.
- `db.js` — SQLite database (a single file, no separate database service needed).
- `seed-games.json` — 100+ real, hand-verified popular games. Always loaded
  as a floor, so the app is never empty even if live scraping breaks.
- `public/index.html` — the website your friends will actually use.

## Important honesty note

Roblox does not officially support this kind of scraping, and their
internal API endpoints change without notice (confirmed by their own
developer forum). `scraper.js` is written defensively: if the live scrape
fails for any reason, it silently falls back to the 100+ game seed list so
the app still works. Over time you (or I, in a future session) may need to
update the endpoint URLs in `scraper.js` if Roblox changes them again —
search "explore-api" or "games.roblox.com/v1/games" on
devforum.roblox.com for the current pattern.

## Running it locally (to test)

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

## Deploying so friends can use it

The easiest free options are **Render** or **Railway** — both can run a
Node.js app with a persistent disk for the SQLite file for free at small scale.

### Render (recommended, free tier available)
1. Push this folder to a new GitHub repo.
2. Go to render.com → New → Web Service → connect the repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add a free persistent disk mounted at `/opt/render/project/src` (or wherever
   the app runs) so `baseplate.db` isn't wiped on redeploys.
6. Deploy. Render gives you a public URL like `baseplate.onrender.com` —
   that's the link you send your 5 friends (or anyone, if you go public later).

### Railway (also easy)
1. Push to GitHub.
2. railway.app → New Project → Deploy from GitHub repo.
3. Railway auto-detects Node and runs `npm start`.
4. Add a volume for persistent storage of `baseplate.db`.
5. Generate a public domain in the Railway dashboard.

## If Roblox requires login for scraping

If `scraper.js` stops finding live games (check server logs for
`[scraper] no live universe IDs found`), Roblox may have tightened auth
requirements. You can supply a `.ROBLOSECURITY` cookie from a real Roblox
account as an environment variable:

```
ROBLOSECURITY=your_cookie_value_here
```

Set this in Render/Railway's environment variables panel — never commit it
to GitHub. Using a throwaway account (not your main) is safer for this.

## Manually triggering a re-scrape

```
POST https://your-deployed-url/api/scrape-now
```

Useful right after deploying, instead of waiting for the 3-day cron.

## Thumbnails

Live-scraped games get a real thumbnail pulled from Roblox's thumbnails API
(a separate call from game details). Seed dataset games don't have real
Roblox universe IDs, so they show a genre-colored gradient placeholder
instead — you'll see real images fill in as the scraper finds live games.

## What you get day one

Even with zero successful live scrapes, you get 100+ real, currently
popular Roblox games with genres, descriptions, and platform tags —
already a big step up from the 25-game static list. As live scraping
succeeds (or as you manually add more to `seed-games.json`), the number
grows toward your 700+ target with real data instead of invented entries.
