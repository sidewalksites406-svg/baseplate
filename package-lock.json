/**
 * Baseplate scraper
 * ------------------
 * Pulls game lists from Roblox's discovery ("explore") API, then fetches
 * details for each universe in batches from the public games.roblox.com API.
 *
 * IMPORTANT: Roblox does not publish or guarantee these endpoints. They are
 * the same calls the roblox.com/discover page itself makes, reverse-engineered
 * by the dev community, and they change without notice. If scraping stops
 * returning results, check https://devforum.roblox.com (search "explore-api"
 * or "omni-recommendation") for the current pattern and update SORT_IDS /
 * EXPLORE_URL below. The seed list at the bottom guarantees the app always
 * has *some* data even if live scraping breaks entirely.
 */

/**
 * Baseplate scraper
 * ------------------
 * Pulls game lists from Roblox using several strategies, layered so that if
 * one breaks (which happens often — Roblox changes these without notice),
 * the others still bring in data. Strategy order:
 *
 *   1. Explore API sorts (apis.roblox.com/explore-api) — the same calls
 *      roblox.com/discover makes. Paginated per sort, many sorts, many pages.
 *   2. Genre-based discovery via the legacy games list endpoint, tried as a
 *      secondary source in case explore-api is unavailable.
 *   3. Keyword search sweep — searches a wide list of common genre/keyword
 *      terms and pulls whatever universe IDs come back, which surfaces
 *      titles outside the "trending" sorts (older but still 1000+ player
 *      games that would otherwise never appear).
 *   4. Seed dataset — always layered in underneath, so the floor never drops
 *      below the curated 100+ list regardless of what live scraping finds.
 *
 * None of these are officially documented or guaranteed by Roblox. If a
 * strategy starts returning nothing, check devforum.roblox.com (search
 * "explore-api" or "omni-search") for the current pattern and update the
 * URL builders below.
 */

const fetch = require('node-fetch');
const { upsertGame, countGames } = require('./db');

const HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; BaseplateBot/1.0)'
};
if (process.env.ROBLOSECURITY) {
  HEADERS['Cookie'] = `.ROBLOSECURITY=${process.env.ROBLOSECURITY}`;
}

async function safeJson(url, opts = {}) {
  try {
    const res = await fetch(url, { headers: HEADERS, ...opts });
    if (!res.ok) {
      console.warn(`[scraper] ${url} -> ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`[scraper] fetch failed for ${url}:`, e.message);
    return null;
  }
}

// ---- Strategy 1: explore-api sorts, many sorts, multiple pages each ----
const EXPLORE_SORTS_URL = 'https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=baseplate-scraper';
const EXPLORE_CONTENT_URL = (sortId, cursor) =>
  `https://apis.roblox.com/explore-api/v1/get-sort-content?sessionId=baseplate-scraper&sortId=${encodeURIComponent(sortId)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;

async function strategyExploreSorts(maxSorts = 40, maxPagesPerSort = 15) {
  const ids = new Set();
  const sortsData = await safeJson(EXPLORE_SORTS_URL);
  const sorts = sortsData?.sorts?.slice(0, maxSorts) || [];

  for (const sort of sorts) {
    const sortId = sort.sortId || sort.id;
    if (!sortId) continue;
    let cursor = null;
    for (let page = 0; page < maxPagesPerSort; page++) {
      const content = await safeJson(EXPLORE_CONTENT_URL(sortId, cursor));
      const tiles = content?.games || content?.tiles || [];
      for (const tile of tiles) {
        const uid = tile.universeId || tile.contentId || tile.id;
        if (uid) ids.add(uid);
      }
      cursor = content?.nextPageCursor || content?.cursor || null;
      if (!cursor || tiles.length === 0) break;
    }
  }
  return ids;
}

// ---- Strategy 2: legacy sorted list endpoint (older, sometimes still alive) ----
const LEGACY_LIST_URL = (genre, startRows) =>
  `https://games.roblox.com/v1/games/list?model.sortToken=&model.genre=${encodeURIComponent(genre || '')}&model.startRows=${startRows}&model.maxRows=50`;

async function strategyLegacyList() {
  const ids = new Set();
  const genres = ['', 'Adventure', 'Building', 'Comedy', 'Fighting', 'FPS', 'Horror',
    'Medieval', 'Military', 'Naval', 'RPG', 'Sci-Fi', 'Sports', 'Survival', 'Town and City',
    'Tycoon', 'Simulation', 'Puzzle', 'Racing', 'Roleplay & Avatar Sim', 'Strategy', 'Western'];
  const pagesPerGenre = 3; // startRows 0, 50, 100
  for (const g of genres) {
    for (let page = 0; page < pagesPerGenre; page++) {
      const data = await safeJson(LEGACY_LIST_URL(g, page * 50));
      const games = data?.games || [];
      for (const game of games) {
        const uid = game.universeId || game.placeId;
        if (uid) ids.add(uid);
      }
      if (games.length === 0) break;
    }
  }
  return ids;
}

// ---- Strategy 3: keyword search sweep, catches non-trending 1000+ games ----
const SEARCH_URL = (keyword) =>
  `https://apis.roblox.com/search-api/omni-search?searchQuery=${encodeURIComponent(keyword)}&sessionId=baseplate-scraper&pageType=games`;

const KEYWORDS = [
  'simulator', 'tycoon', 'obby', 'roleplay', 'horror', 'anime', 'racing', 'fighting',
  'survival', 'rpg', 'adventure', 'sports', 'fps', 'tower defense', 'battle royale',
  'pet', 'city', 'life', 'story', 'puzzle', 'strategy', 'shooter', 'zombie', 'pirate',
  'ninja', 'superhero', 'magic', 'school', 'restaurant', 'farm', 'building', 'war',
  'escape', 'mystery', 'clicker', 'idle', 'fantasy', 'sci-fi', 'space', 'racing game',
  'parkour', 'boxing', 'basketball', 'football', 'soccer', 'skate', 'car', 'plane',
  'mining', 'fishing', 'cooking', 'hospital', 'prison', 'police', 'military', 'medieval',
  'demon', 'dragon', 'sword', 'gun', 'battlegrounds', 'legends', 'clicker rpg', 'grinding',
  'rebirth', 'pvp', 'coop', 'party game', 'minigames', 'hangout', 'roleplay life',
  'brainrot', 'aura', 'demon slayer', 'one piece', 'naruto', 'jujutsu', 'dragon ball',
  'island', 'ocean', 'boat', 'ship', 'castle', 'kingdom', 'empire', 'factory', 'mine',
  'gym', 'muscle', 'strength', 'combat', 'arena', 'duel', 'gang', 'mafia', 'heist',
  'restaurant tycoon', 'theme park', 'zoo', 'hospital tycoon', 'airport', 'train',
  'trucking', 'delivery', 'detective', 'spy', 'assassin', 'monster', 'alien', 'robot',
  'dinosaur', 'egg', 'garden', 'farming sim', 'cooking sim', 'baking', 'bakery',
  'wizard', 'witch', 'vampire', 'werewolf', 'god', 'titan', 'giant', 'meme', 'viral',
  'new game', 'unique game', 'never before', 'experimental', 'original', 'weird game',
  'chaos', 'physics', 'sandbox', 'creative', 'open world', 'multiplayer', 'party',
  'jump', 'run', 'climb', 'swim', 'fly', 'race', 'collect', 'craft', 'build', 'trade',
  'economy', 'business', 'store', 'shop', 'market', 'auction', 'casino', 'lottery',
  'trivia', 'quiz', 'board game', 'card game', 'chess', 'checkers', 'game show',
  'talent show', 'singing', 'dance', 'music', 'concert', 'festival', 'wedding',
  'baby', 'family', 'daycare', 'nursery', 'vet', 'animal', 'dog', 'cat', 'horse',
  'dragon tamer', 'summoner', 'necromancer', 'mage', 'archer', 'knight', 'samurai',
  'cyberpunk', 'steampunk', 'apocalypse', 'wasteland', 'bunker', 'nuclear', 'radiation'
];

async function strategyKeywordSweep() {
  const ids = new Set();
  for (const kw of KEYWORDS) {
    const data = await safeJson(SEARCH_URL(kw));
    const items = data?.searchResults?.flatMap(g => g.contents || []) || data?.games || [];
    for (const item of items) {
      const uid = item.universeId || item.contentId || item.id;
      if (uid) ids.add(uid);
    }
  }
  return ids;
}

// ---- Detail fetch (confirmed stable, public, no auth needed, up to ~50 ids/call) ----
const GAMES_DETAILS_URL = (ids) => `https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`;
// Roblox's icon/thumbnail API is a separate endpoint from game details.
const THUMBNAILS_URL = (ids) =>
  `https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids.join(',')}&size=512x512&format=Png&isCircular=false`;

async function fetchGameDetails(universeIds) {
  const results = [];
  const list = [...universeIds];
  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    const data = await safeJson(GAMES_DETAILS_URL(batch));
    if (data && Array.isArray(data.data)) results.push(...data.data);
  }
  return results;
}

async function fetchThumbnails(universeIds) {
  // Returns a Map of universeId -> imageUrl. Batched like details; if a
  // batch call fails outright, falls back to fetching that batch's games
  // one at a time so a single bad batch doesn't cost every game in it its
  // thumbnail. Games that still fail just fall back to the placeholder
  // gradient on the frontend rather than breaking the scrape.
  const map = new Map();
  const list = [...universeIds];

  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    const data = await safeJson(THUMBNAILS_URL(batch));
    const entries = data?.data || [];
    const gotIds = new Set();
    for (const entry of entries) {
      if (entry.targetId && entry.imageUrl && entry.state !== 'Error') {
        map.set(entry.targetId, entry.imageUrl);
        gotIds.add(entry.targetId);
      }
    }

    // Anything missing from this batch (failed call, partial response, or
    // an errored thumbnail state) gets one individual retry.
    const missing = batch.filter(id => !gotIds.has(id));
    for (const id of missing) {
      const single = await safeJson(THUMBNAILS_URL([id]));
      const entry = single?.data?.[0];
      if (entry?.imageUrl && entry.state !== 'Error') {
        map.set(id, entry.imageUrl);
      }
    }
  }
  return map;
}

// ---- Seed floor, always layered in ----
const SEED_GAMES = require('./seed-games.json');

async function seedFallback() {
  for (const g of SEED_GAMES) {
    upsertGame({
      universe_id: g.id,
      root_place_id: g.id,
      name: g.name,
      description: g.desc,
      genre: g.genre,
      playing: g.players,
      visits: g.players * 1000,
      is_mobile: g.plat.includes('mobile') ? 1 : 0,
      is_console: g.plat.includes('console') ? 1 : 0,
      is_pc: g.plat.includes('pc') ? 1 : 0,
      thumbnail_url: null
    });
  }
}

async function run() {
  console.log('[scraper] starting run...');
  const allIds = new Set();

  const attempts = [
    ['explore-sorts', strategyExploreSorts],
    ['legacy-list', strategyLegacyList],
    ['keyword-sweep', strategyKeywordSweep]
  ];

  for (const [label, fn] of attempts) {
    try {
      const ids = await fn();
      console.log(`[scraper] strategy "${label}" found ${ids.size} candidate IDs`);
      ids.forEach(id => allIds.add(id));
    } catch (e) {
      console.warn(`[scraper] strategy "${label}" failed:`, e.message);
    }
  }

  if (allIds.size === 0) {
    console.warn('[scraper] no live universe IDs found from any strategy (Roblox endpoints likely changed or require auth). Using seed dataset only.');
    await seedFallback();
    console.log(`[scraper] done. total games in db: ${countGames()}`);
    return;
  }

  console.log(`[scraper] ${allIds.size} unique candidate games found across all strategies, fetching details...`);
  const details = await fetchGameDetails(allIds);

  // Only bother fetching thumbnails for games that will actually be saved
  // (meets the activity floor), to avoid wasting calls on filtered-out junk.
  const qualifyingIds = details.filter(g => (g.playing || 0) >= 500).map(g => g.id);
  console.log(`[scraper] fetching thumbnails for ${qualifyingIds.length} qualifying games...`);
  const thumbMap = await fetchThumbnails(qualifyingIds);

  let saved = 0;
  for (const g of details) {
    // Only keep games meeting a reasonable activity floor, to avoid junk/dead universes.
    // (500 players — anything below this isn't worth surfacing per your call.)
    if ((g.playing || 0) < 500) continue;
    upsertGame({
      universe_id: g.id,
      root_place_id: g.rootPlaceId,
      name: g.name,
      description: (g.description || '').slice(0, 500),
      genre: g.genre || 'Other',
      playing: g.playing || 0,
      visits: g.visits || 0,
      is_mobile: 1,
      is_console: g.isXboxOne ? 1 : 0,
      is_pc: 1,
      thumbnail_url: thumbMap.get(g.id) || null
    });
    saved++;
  }
  console.log(`[scraper] saved ${saved} live games (of ${details.length} fetched, ${allIds.size} candidates).`);

  await seedFallback();
  console.log(`[scraper] done. total games in db: ${countGames()}`);
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch(e => {
    console.error('[scraper] fatal error:', e);
    process.exit(1);
  });
}

module.exports = { run };
