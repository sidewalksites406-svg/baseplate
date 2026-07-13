const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'baseplate.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    universe_id INTEGER PRIMARY KEY,
    root_place_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    playing INTEGER DEFAULT 0,
    visits INTEGER DEFAULT 0,
    is_mobile INTEGER DEFAULT 0,
    is_console INTEGER DEFAULT 0,
    is_pc INTEGER DEFAULT 1,
    is_novel INTEGER DEFAULT 0,
    is_hidden_gem INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_playing ON games(playing);
  CREATE INDEX IF NOT EXISTS idx_genre ON games(genre);
  CREATE INDEX IF NOT EXISTS idx_novel ON games(is_novel);
`);

// Phrases that tend to signal a game is pitching itself as a genuinely new
// or unusual concept, not just another entry in a crowded genre. Used to
// power the "novel concepts" filter. Heuristic, not a certainty -- it flags
// candidates worth a look, not a verified "this has never existed" claim.
const NOVELTY_SIGNALS = [
  'first ever', 'first of its kind', 'never before', 'never been done',
  'unlike any', 'one of a kind', 'only game', 'only experience',
  'brand new concept', 'new concept', 'original concept', 'unique concept',
  'no other game', "nowhere else", 'reinvented', 'reimagined',
  'experimental', 'innovative', 'groundbreaking', 'pioneering',
  'never seen before', 'totally new', 'completely new', 'first-of-its-kind'
];

function detectNovelty(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return NOVELTY_SIGNALS.some(sig => lower.includes(sig)) ? 1 : 0;
}

function upsertGame(g) {
  const is_novel = detectNovelty(g.description || g.name);
  // "Hidden gem" = unusually strong active-to-total ratio, i.e. people who
  // find it tend to actually stick around and play, not just a game that
  // bought its way to visibility. Roblox's own search/charts rank by raw
  // visit count, which rewards ads and years of accumulated visits, not
  // whether the game is actually good right now.
  const visits = g.visits || 0;
  const playing = g.playing || 0;
  const engagementRatio = visits > 0 ? playing / visits : 0;
  const is_hidden_gem = (engagementRatio > 0.0008 && playing >= 500 && playing < 50000) ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO games (universe_id, root_place_id, name, description, genre, playing, visits, is_mobile, is_console, is_pc, is_novel, is_hidden_gem, thumbnail_url, updated_at)
    VALUES (@universe_id, @root_place_id, @name, @description, @genre, @playing, @visits, @is_mobile, @is_console, @is_pc, @is_novel, @is_hidden_gem, @thumbnail_url, CURRENT_TIMESTAMP)
    ON CONFLICT(universe_id) DO UPDATE SET
      root_place_id=excluded.root_place_id,
      name=excluded.name,
      description=excluded.description,
      genre=excluded.genre,
      playing=excluded.playing,
      visits=excluded.visits,
      is_mobile=excluded.is_mobile,
      is_console=excluded.is_console,
      is_pc=excluded.is_pc,
      is_novel=excluded.is_novel,
      is_hidden_gem=excluded.is_hidden_gem,
      thumbnail_url=excluded.thumbnail_url,
      updated_at=CURRENT_TIMESTAMP
  `);
  stmt.run({ ...g, is_novel, is_hidden_gem });
}

function getGames({ minPlayers = 1000, genre = null, platform = null, search = null, novelOnly = false, hiddenGemsOnly = false, sort = 'players', limit = 1000 } = {}) {
  let sql = `SELECT * FROM games WHERE playing >= @minPlayers`;
  const params = { minPlayers, limit };

  if (genre) {
    sql += ` AND genre = @genre`;
    params.genre = genre;
  }
  if (platform === 'mobile') sql += ` AND is_mobile = 1`;
  if (platform === 'console') sql += ` AND is_console = 1`;
  if (platform === 'pc') sql += ` AND is_pc = 1`;
  if (novelOnly) sql += ` AND is_novel = 1`;
  if (hiddenGemsOnly) sql += ` AND is_hidden_gem = 1`;

  let terms = [];
  if (search) {
    terms = search.trim().split(/\s+/).filter(Boolean);
    terms.forEach((term, i) => {
      sql += ` AND (name LIKE @term${i} OR description LIKE @term${i})`;
      params[`term${i}`] = `%${term}%`;
    });
  }

  const sortMap = {
    players: 'playing DESC',
    newest: 'updated_at DESC',
    name: 'name ASC'
  };
  const orderBy = sortMap[sort] || sortMap.players;

  if (terms.length > 0) {
    sql += ` ORDER BY (CASE WHEN name LIKE @firstTerm THEN 0 ELSE 1 END), ${orderBy} LIMIT @limit`;
    params.firstTerm = `%${terms[0]}%`;
  } else {
    sql += ` ORDER BY ${orderBy} LIMIT @limit`;
  }

  return db.prepare(sql).all(params);
}

function getRandomGame({ minPlayers = 1000 } = {}) {
  return db.prepare(`SELECT * FROM games WHERE playing >= @minPlayers ORDER BY RANDOM() LIMIT 1`).get({ minPlayers });
}

function countGames() {
  return db.prepare(`SELECT COUNT(*) as c FROM games`).get().c;
}

function getGenres() {
  return db.prepare(`SELECT DISTINCT genre FROM games WHERE genre IS NOT NULL ORDER BY genre`).all().map(r => r.genre);
}

module.exports = { db, upsertGame, getGames, getRandomGame, countGames, getGenres };
