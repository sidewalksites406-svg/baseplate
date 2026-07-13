const express = require('express');
const cors = require('cors');
const path = require('path');
const { getGames, getGenres, countGames, getRandomGame } = require('./db');
const { run: runScraper } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/games', (req, res) => {
  const { minPlayers, genre, platform, search, novelOnly, hiddenGemsOnly, sort, limit } = req.query;
  const games = getGames({
    minPlayers: minPlayers ? parseInt(minPlayers, 10) : 1000,
    genre: genre || null,
    platform: platform || null,
    search: search || null,
    novelOnly: novelOnly === 'true',
    hiddenGemsOnly: hiddenGemsOnly === 'true',
    sort: sort || 'players',
    limit: limit ? parseInt(limit, 10) : 1000
  });
  res.json({ count: games.length, total: countGames(), games });
});

app.get('/api/random', (req, res) => {
  const { minPlayers } = req.query;
  const game = getRandomGame({ minPlayers: minPlayers ? parseInt(minPlayers, 10) : 1000 });
  res.json({ game: game || null });
});

app.get('/api/genres', (req, res) => {
  res.json({ genres: getGenres() });
});

app.get('/api/status', (req, res) => {
  res.json({ total: countGames(), ok: true });
});

// Manually trigger a re-scrape (useful right after deploy, or for testing)
app.post('/api/scrape-now', async (req, res) => {
  try {
    await runScraper();
    res.json({ ok: true, total: countGames() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Baseplate server running on port ${PORT}`);

  // Run once on boot so the DB isn't empty on first deploy...
  runScraper().catch(e => console.error('[startup scrape]', e));

  // Randomized re-scrape every 8-12 hours (picked fresh each time) instead of
  // a fixed interval. This keeps data reasonably current while looking less
  // like predictable bot traffic to Roblox, and still catches games earlier
  // runs missed since discovery results aren't perfectly deterministic.
  function scheduleNextScrape() {
    const minMs = 4 * 60 * 60 * 1000;
    const maxMs = 8 * 60 * 60 * 1000;
    const delay = minMs + Math.random() * (maxMs - minMs);
    console.log(`[cron] next scrape in ${(delay / 3600000).toFixed(1)} hours`);
    setTimeout(() => {
      console.log('[cron] running scheduled scrape');
      runScraper()
        .catch(e => console.error('[cron scrape]', e))
        .finally(scheduleNextScrape);
    }, delay);
  }
  scheduleNextScrape();
});
