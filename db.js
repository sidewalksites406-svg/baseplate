<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Baseplate — Roblox Game Finder</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root{
    --bg:#0e1420;
    --panel:#141c2b;
    --panel-2:#1a2436;
    --line:#26324a;
    --text:#eef2fa;
    --dim:#8b98b3;
    --accent:#5ee6c0;
    --accent-2:#ff8a5c;
    --danger:#ff6b6b;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    background:
      radial-gradient(circle at 15% 0%, #1a2740 0%, transparent 45%),
      radial-gradient(circle at 85% 20%, #202a1e 0%, transparent 40%),
      var(--bg);
    color:var(--text);
    font-family:'Space Grotesk', sans-serif;
    min-height:100vh;
  }
  .grid-overlay{
    position:fixed; inset:0; pointer-events:none; opacity:.06;
    background-image:
      linear-gradient(var(--accent) 1px, transparent 1px),
      linear-gradient(90deg, var(--accent) 1px, transparent 1px);
    background-size:32px 32px;
  }
  header{
    padding:28px 24px 18px;
    border-bottom:1px solid var(--line);
    display:flex; align-items:center; justify-content:space-between;
    position:relative; z-index:1;
  }
  .brand{display:flex; align-items:center; gap:12px;}
  .brand-mark{
    width:34px; height:34px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), #2fb894);
    display:flex; align-items:center; justify-content:center;
    font-family:'JetBrains Mono', monospace; font-weight:700; color:#08120e; font-size:15px;
    transform:rotate(-4deg);
  }
  .brand h1{font-size:20px; margin:0; letter-spacing:-.02em;}
  .brand span{color:var(--dim); font-size:12px; font-family:'JetBrains Mono', monospace;}
  .status{
    font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--dim);
    display:flex; align-items:center; gap:8px;
  }
  .dot{width:7px; height:7px; border-radius:50%; background:var(--accent); box-shadow:0 0 8px var(--accent);}
  .dot.off{background:var(--danger); box-shadow:0 0 8px var(--danger);}

  main{max-width:1080px; margin:0 auto; padding:28px 24px 80px; position:relative; z-index:1;}

  .panel{
    background:var(--panel);
    border:1px solid var(--line);
    border-radius:14px;
    padding:20px;
  }
  .filters{margin-bottom:22px;}
  .filters-row{display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end;}
  .field{display:flex; flex-direction:column; gap:6px;}
  .field label{font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--dim); font-family:'JetBrains Mono', monospace;}
  input[type=text], select{
    background:var(--panel-2); border:1px solid var(--line); color:var(--text);
    padding:9px 12px; border-radius:8px; font-family:'Space Grotesk', sans-serif; font-size:14px;
    min-width:150px;
  }
  input[type=range]{accent-color:var(--accent); width:160px;}
  .toggle-group{display:flex; gap:6px;}
  .toggle{
    padding:8px 12px; border-radius:8px; border:1px solid var(--line); background:var(--panel-2);
    color:var(--dim); font-size:13px; cursor:pointer; user-select:none; font-family:'JetBrains Mono', monospace;
  }
  .toggle.active{background:rgba(94,230,192,.14); color:var(--accent); border-color:var(--accent);}
  .search-btn{
    padding:10px 20px; border-radius:8px; border:none; cursor:pointer;
    background:var(--accent); color:#08130f; font-weight:700; font-size:14px;
    font-family:'Space Grotesk', sans-serif;
  }
  .search-btn:hover{background:#7dedcf;}

  .favbar{
    display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap;
  }
  .favbar h3{margin:0; font-size:13px; color:var(--dim); font-weight:500; font-family:'JetBrains Mono', monospace; text-transform:uppercase; letter-spacing:.06em;}
  .chip{
    background:var(--panel-2); border:1px solid var(--line); padding:6px 10px; border-radius:100px;
    font-size:12px; color:var(--text); display:flex; align-items:center; gap:6px;
  }
  .chip button{background:none; border:none; color:var(--dim); cursor:pointer; font-size:13px; padding:0;}
  .add-fav-btn{
    background:none; border:1px dashed var(--line); color:var(--dim); padding:6px 10px; border-radius:100px;
    font-size:12px; cursor:pointer; font-family:'JetBrains Mono', monospace;
  }

  .cards{display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:14px;}
  .card{
    background:var(--panel-2); border:1px solid var(--line); border-radius:12px;
    display:flex; flex-direction:column; gap:8px; transition:border-color .15s, transform .15s;
    overflow:hidden;
  }
  .card-body{padding:16px; display:flex; flex-direction:column; gap:8px; flex:1;}
  .card-thumb{
    width:100%; aspect-ratio:16/9; object-fit:cover; display:block; background:var(--panel);
  }
  .card-thumb-placeholder{
    width:100%; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center;
    font-family:'JetBrains Mono', monospace; font-size:13px; color:rgba(255,255,255,.55);
    letter-spacing:.04em; text-transform:uppercase;
  }
  .card:hover{border-color:var(--accent); transform:translateY(-2px);}
  .card-top{display:flex; justify-content:space-between; align-items:flex-start; gap:8px;}
  .card h4{margin:0; font-size:16px; line-height:1.25;}
  .fav-toggle{background:none; border:none; cursor:pointer; font-size:17px; color:var(--dim); flex-shrink:0;}
  .fav-toggle.on{color:var(--accent-2);}
  .meta-row{display:flex; gap:8px; flex-wrap:wrap; font-family:'JetBrains Mono', monospace; font-size:11px;}
  .badge{background:rgba(94,230,192,.1); color:var(--accent); padding:3px 8px; border-radius:6px;}
  .badge.plat{background:rgba(255,138,92,.12); color:var(--accent-2);}
  .desc{color:var(--dim); font-size:13px; line-height:1.5; flex:1;}
  .players{font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--text); display:flex; align-items:center; gap:6px;}
  .players b{color:var(--accent);}
  .card-link{
    margin-top:4px; font-size:12px; color:var(--accent); text-decoration:none; font-family:'JetBrains Mono', monospace;
  }

  .empty{text-align:center; padding:50px 20px; color:var(--dim);}

  .banner{
    background:rgba(255,138,92,.08); border:1px solid rgba(255,138,92,.3); color:#ffb08c;
    padding:12px 16px; border-radius:10px; font-size:13px; margin-bottom:18px; line-height:1.5;
  }

  .modal-backdrop{
    position:fixed; inset:0; background:rgba(6,10,16,.75); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center; z-index:50; padding:20px;
  }
  .modal{
    background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:28px;
    max-width:440px; width:100%;
  }
  .modal h2{margin:0 0 6px; font-size:20px;}
  .modal p{color:var(--dim); font-size:13px; margin:0 0 16px; line-height:1.5;}
  .modal input{width:100%; margin-bottom:12px;}
  .modal-actions{display:flex; gap:10px; margin-top:6px;}
  .ghost-btn{
    background:none; border:1px solid var(--line); color:var(--dim); padding:10px 16px; border-radius:8px;
    cursor:pointer; font-size:13px; font-family:'Space Grotesk', sans-serif;
  }

  footer{
    text-align:center; padding:20px; color:var(--dim); font-size:11px;
    font-family:'JetBrains Mono', monospace; border-top:1px solid var(--line);
  }
</style>
</head>
<body>
<div class="grid-overlay"></div>

<header>
  <div class="brand">
    <div class="brand-mark">B</div>
    <div>
      <h1>Baseplate</h1>
      <span>find your next roblox game</span>
    </div>
  </div>
  <div class="status"><span class="dot" id="statusDot"></span><span id="statusText">checking live data…</span></div>
</header>

<main>
  <div class="banner" id="corsBanner" style="display:none;">
    Can't reach the Baseplate backend right now, so no games are loading. Make sure the server (server.js) is running and this page is being served from it, not opened as a standalone file.
  </div>

  <div class="favbar" id="favbar"></div>

  <div class="panel filters">
    <div class="filters-row">
      <div class="field">
        <label>Search</label>
        <input type="text" id="searchInput" placeholder="game name or keyword...">
      </div>
      <div class="field">
        <label>Genre</label>
        <select id="genreSelect"><option value="">All genres</option></select>
      </div>
      <div class="field">
        <label>Min players online: <span id="minPlayersLabel">1,000</span></label>
        <input type="range" id="minPlayers" min="0" max="50000" step="500" value="1000">
      </div>
      <div class="field">
        <label>Platform</label>
        <div class="toggle-group" id="platformToggles">
          <div class="toggle active" data-plat="pc">PC</div>
          <div class="toggle active" data-plat="mobile">Mobile</div>
          <div class="toggle active" data-plat="console">Console</div>
        </div>
      </div>
      <div class="field">
        <label>Concept</label>
        <div class="toggle-group">
          <div class="toggle" id="novelToggle" title="Only show games whose description pitches itself as a genuinely new or unusual idea">✨ Novel only</div>
          <div class="toggle" id="gemToggle" title="Games with unusually strong active-player ratio for their size — good, not just heavily advertised">💎 Hidden gems</div>
        </div>
      </div>
      <div class="field">
        <label>Sort by</label>
        <select id="sortSelect">
          <option value="players">Most players</option>
          <option value="newest">Recently updated</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
      <button class="search-btn" id="applyBtn">Apply filters</button>
      <button class="ghost-btn" id="surpriseBtn" style="align-self:flex-end;">🎲 Surprise me</button>
    </div>
  </div>

  <div id="cardsWrap"></div>
</main>

<footer>Baseplate · personal favorites stored privately on this device · data updated by hand, live-fetch attempted each load</footer>

<script>
(function(){
  // GAMES now loads from our own backend at /api/games instead of being
  // hardcoded. The backend scrapes Roblox server-side (no CORS wall) and
  // re-scrapes every 3 days via cron, layered on a seed dataset so the
  // list never drops below the curated floor.
  let GAMES = [];
  const el = id => document.getElementById(id);
  let liveMode = false;
  let favorites = [];
  let blocked = [];
  let deviceId = null;

  function fmt(n){ return n.toLocaleString('en-US'); }

  function populateGenreDropdown(){
    const current = el('genreSelect').value;
    el('genreSelect').innerHTML = '<option value="">All genres</option>';
    const genreSet = [...new Set(GAMES.map(g=>g.genre))].filter(Boolean).sort();
    genreSet.forEach(g=>{
      const opt = document.createElement('option');
      opt.value = g; opt.textContent = g;
      el('genreSelect').appendChild(opt);
    });
    if (genreSet.includes(current)) el('genreSelect').value = current;
  }

  async function tryLiveFetch(){
    try{
      const res = await fetch('/api/games?minPlayers=0&limit=1000');
      if(!res.ok) throw new Error('bad status');
      const data = await res.json();
      if(data && Array.isArray(data.games) && data.games.length){
        GAMES = data.games.map(g => ({
          id: g.universe_id,
          name: g.name,
          genre: g.genre || 'Other',
          desc: g.description || 'No description available yet.',
          players: g.playing || 0,
          novel: !!g.is_novel,
          gem: !!g.is_hidden_gem,
          thumb: g.thumbnail_url || null,
          plat: [g.is_pc ? 'pc' : null, g.is_mobile ? 'mobile' : null, g.is_console ? 'console' : null].filter(Boolean)
        }));
        liveMode = true;
      }
    }catch(e){
      liveMode = false;
    }
    populateGenreDropdown();
    el('statusDot').classList.toggle('off', !liveMode);
    el('statusText').textContent = liveMode ? `connected · ${GAMES.length} games` : 'backend unreachable';
    el('corsBanner').style.display = liveMode ? 'none' : 'block';
  }

  async function ensureDeviceId(){
    let res;
    try{ res = await window.storage.get('device-id'); }catch(e){ res = null; }
    if(res && res.value){ deviceId = res.value; }
    else{
      deviceId = 'p_' + Math.random().toString(36).slice(2,10);
      try{ await window.storage.set('device-id', deviceId); }catch(e){}
    }
  }

  async function loadFavorites(){
    try{
      const res = await window.storage.get('favorites:' + deviceId);
      favorites = res ? JSON.parse(res.value) : [];
    }catch(e){ favorites = []; }
  }

  async function saveFavorites(){
    try{ await window.storage.set('favorites:' + deviceId, JSON.stringify(favorites)); }catch(e){}
  }

  function toggleFavorite(id){
    const idx = favorites.indexOf(id);
    if(idx >= 0) favorites.splice(idx,1);
    else favorites.push(id);
    saveFavorites();
    renderFavbar();
    renderCards();
  }

  async function loadBlocked(){
    try{
      const res = await window.storage.get('blocked:' + deviceId);
      blocked = res ? JSON.parse(res.value) : [];
    }catch(e){ blocked = []; }
  }

  async function saveBlocked(){
    try{ await window.storage.set('blocked:' + deviceId, JSON.stringify(blocked)); }catch(e){}
  }

  // Blocking also removes the game from favorites if it happened to be
  // favorited, so the two lists never fight each other.
  function toggleBlock(id){
    const idx = blocked.indexOf(id);
    if(idx >= 0){
      blocked.splice(idx,1);
    } else {
      blocked.push(id);
      const favIdx = favorites.indexOf(id);
      if(favIdx >= 0) favorites.splice(favIdx,1);
      saveFavorites();
    }
    saveBlocked();
    renderFavbar();
    renderCards();
  }

  function renderFavbar(){
    const bar = el('favbar');
    bar.innerHTML = '';
    const label = document.createElement('h3');
    label.textContent = 'Your favorites';
    bar.appendChild(label);
    if(favorites.length === 0){
      const hint = document.createElement('span');
      hint.style.color = 'var(--dim)';
      hint.style.fontSize = '12px';
      hint.textContent = 'tap ♡ on a game to add it';
      bar.appendChild(hint);
      return;
    }
    favorites.forEach(id=>{
      const g = GAMES.find(x=>x.id===id);
      if(!g) return;
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `${g.name} <button data-id="${id}">✕</button>`;
      chip.querySelector('button').onclick = ()=>toggleFavorite(id);
      bar.appendChild(chip);
    });

    if(blocked.length > 0){
      const blockedLabel = document.createElement('h3');
      blockedLabel.style.marginLeft = '12px';
      blockedLabel.textContent = `Hidden (${blocked.length})`;
      bar.appendChild(blockedLabel);
      blocked.forEach(id=>{
        const g = GAMES.find(x=>x.id===id);
        if(!g) return;
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.style.opacity = '0.6';
        chip.innerHTML = `${g.name} <button data-id="${id}" title="unhide">↺</button>`;
        chip.querySelector('button').onclick = ()=>toggleBlock(id);
        bar.appendChild(chip);
      });
    }
  }

  function activePlatforms(){
    return [...document.querySelectorAll('#platformToggles .toggle.active')].map(t=>t.dataset.plat);
  }

  function scoreForFavorites(game){
    if(favorites.length === 0) return 0;
    const favGenres = favorites.map(id=>{
      const g = GAMES.find(x=>x.id===id);
      return g ? g.genre : null;
    });
    return favGenres.includes(game.genre) ? 1 : 0;
  }

  function renderCards(){
    const qRaw = el('searchInput').value.trim().toLowerCase();
    const qTerms = qRaw ? qRaw.split(/\s+/).filter(Boolean) : [];
    const genre = el('genreSelect').value;
    const minP = parseInt(el('minPlayers').value, 10);
    const plats = activePlatforms();
    const novelOnly = el('novelToggle').classList.contains('active');
    const gemOnly = el('gemToggle').classList.contains('active');
    const sortMode = el('sortSelect').value;

    let list = GAMES.filter(g=>{
      if(blocked.includes(g.id)) return false;
      if(g.players < minP) return false;
      if(genre && g.genre !== genre) return false;
      if(novelOnly && !g.novel) return false;
      if(gemOnly && !g.gem) return false;
      if(qTerms.length > 0){
        const haystack = (g.name + ' ' + g.desc).toLowerCase();
        // every typed keyword must appear somewhere, so filters stay tight
        // to what was actually asked for instead of loose single-word matches
        if(!qTerms.every(term => haystack.includes(term))) return false;
      }
      if(plats.length > 0 && !g.plat.some(p=>plats.includes(p))) return false;
      return true;
    });

    if(favorites.length > 0){
      list = list.slice().sort((a,b)=> scoreForFavorites(b) - scoreForFavorites(a) || b.players - a.players);
    } else if(sortMode === 'name'){
      list = list.slice().sort((a,b)=> a.name.localeCompare(b.name));
    } else {
      list = list.slice().sort((a,b)=> b.players - a.players);
    }

    const wrap = el('cardsWrap');
    wrap.innerHTML = '';
    if(list.length === 0){
      wrap.innerHTML = '<div class="empty panel">No games match those filters. Try lowering the min player count or removing a keyword.</div>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'cards';
    list.forEach(g=>{
      const isFav = favorites.includes(g.id);
      const card = document.createElement('div');
      card.className = 'card';
      const genreHue = Math.abs([...g.genre].reduce((a,c)=>a+c.charCodeAt(0),0)) % 360;
      const gradient = `linear-gradient(135deg, hsl(${genreHue},45%,22%), hsl(${(genreHue+40)%360},45%,14%))`;
      const thumbHtml = g.thumb
        ? `<img class="card-thumb" src="${g.thumb}" alt="${g.name}" loading="lazy">`
        : `<div class="card-thumb-placeholder" style="background:${gradient}">${g.genre}</div>`;
      card.innerHTML = `
        ${thumbHtml}
        <div class="card-body">
        <div class="card-top">
          <h4>${g.name} ${g.novel ? '<span title="Pitches itself as a new/unusual concept">✨</span>' : ''} ${g.gem ? '<span title="Hidden gem: strong active-player ratio for its size">💎</span>' : ''}</h4>
          <div style="display:flex; gap:4px;">
            <button class="fav-toggle ${isFav?'on':''}" title="favorite">${isFav?'♥':'♡'}</button>
            <button class="fav-toggle block-toggle" title="not interested — hide this game">🚫</button>
          </div>
        </div>
        <div class="meta-row">
          <span class="badge">${g.genre}</span>
          ${g.plat.map(p=>`<span class="badge plat">${p}</span>`).join('')}
        </div>
        <div class="desc">${g.desc}</div>
        <div class="players">👥 <b>${fmt(g.players)}</b> playing now</div>
        </div>
      `;
      const imgEl = card.querySelector('.card-thumb');
      if(imgEl){
        imgEl.addEventListener('error', ()=>{
          const ph = document.createElement('div');
          ph.className = 'card-thumb-placeholder';
          ph.style.background = gradient;
          ph.textContent = g.genre;
          imgEl.replaceWith(ph);
        });
      }
      card.querySelector('.fav-toggle').onclick = ()=>toggleFavorite(g.id);
      card.querySelector('.block-toggle').onclick = ()=>toggleBlock(g.id);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  }

  el('minPlayers').addEventListener('input', e=>{
    el('minPlayersLabel').textContent = fmt(parseInt(e.target.value,10));
  });
  el('applyBtn').addEventListener('click', renderCards);
  el('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter') renderCards(); });
  document.querySelectorAll('#platformToggles .toggle').forEach(t=>{
    t.addEventListener('click', ()=>{ t.classList.toggle('active'); renderCards(); });
  });
  el('novelToggle').addEventListener('click', ()=>{
    el('novelToggle').classList.toggle('active');
    renderCards();
  });
  el('gemToggle').addEventListener('click', ()=>{
    el('gemToggle').classList.toggle('active');
    renderCards();
  });
  el('sortSelect').addEventListener('change', renderCards);
  el('surpriseBtn').addEventListener('click', ()=>{
    const eligible = GAMES.filter(g=>!blocked.includes(g.id) && g.players >= parseInt(el('minPlayers').value,10));
    if(eligible.length === 0) return;
    const pick = eligible[Math.floor(Math.random()*eligible.length)];
    el('searchInput').value = '';
    el('genreSelect').value = '';
    renderCards();
    // Scroll to and briefly highlight the surprise pick if it's in view;
    // otherwise just show it alone so it's obvious what got picked.
    const wrap = el('cardsWrap');
    wrap.innerHTML = '';
    const single = document.createElement('div');
    single.className = 'cards';
    const isFav = favorites.includes(pick.id);
    const genreHue = Math.abs([...pick.genre].reduce((a,c)=>a+c.charCodeAt(0),0)) % 360;
    const gradient = `linear-gradient(135deg, hsl(${genreHue},45%,22%), hsl(${(genreHue+40)%360},45%,14%))`;
    const thumbHtml = pick.thumb
      ? `<img class="card-thumb" src="${pick.thumb}" alt="${pick.name}" loading="lazy">`
      : `<div class="card-thumb-placeholder" style="background:${gradient}">${pick.genre}</div>`;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderColor = 'var(--accent)';
    card.innerHTML = `
      ${thumbHtml}
      <div class="card-body">
      <div class="card-top">
        <h4>🎲 ${pick.name} ${pick.novel ? '✨' : ''} ${pick.gem ? '💎' : ''}</h4>
        <div style="display:flex; gap:4px;">
          <button class="fav-toggle ${isFav?'on':''}" title="favorite">${isFav?'♥':'♡'}</button>
          <button class="fav-toggle block-toggle" title="not interested — hide this game">🚫</button>
        </div>
      </div>
      <div class="meta-row">
        <span class="badge">${pick.genre}</span>
        ${pick.plat.map(p=>`<span class="badge plat">${p}</span>`).join('')}
      </div>
      <div class="desc">${pick.desc}</div>
      <div class="players">👥 <b>${fmt(pick.players)}</b> playing now</div>
      </div>
    `;
    card.querySelector('.fav-toggle').onclick = ()=>toggleFavorite(pick.id);
    card.querySelector('.block-toggle').onclick = ()=>toggleBlock(pick.id);
    single.appendChild(card);
    wrap.appendChild(single);
    const backBtn = document.createElement('button');
    backBtn.className = 'ghost-btn';
    backBtn.style.marginTop = '14px';
    backBtn.textContent = '← Back to all results';
    backBtn.onclick = renderCards;
    wrap.appendChild(backBtn);
  });

  function showOnboarding(){
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h2>What do you already love?</h2>
        <p>Tell us a game or two you already play and we'll bias recommendations toward similar genres. You can skip this and favorite games manually instead.</p>
        <input type="text" id="onboardInput" placeholder="e.g. Blox Fruits, Doors">
        <div class="modal-actions">
          <button class="search-btn" id="onboardSave">Save & start</button>
          <button class="ghost-btn" id="onboardSkip">Skip</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    document.getElementById('onboardSkip').onclick = ()=>{
      backdrop.remove();
      saveOnboarded();
    };
    document.getElementById('onboardSave').onclick = ()=>{
      const val = document.getElementById('onboardInput').value.toLowerCase();
      GAMES.forEach(g=>{
        if(val.includes(g.name.toLowerCase())) favorites.push(g.id);
      });
      saveFavorites();
      renderFavbar();
      renderCards();
      backdrop.remove();
      saveOnboarded();
    };
  }

  async function saveOnboarded(){
    try{ await window.storage.set('onboarded:' + deviceId, 'true'); }catch(e){}
  }

  async function init(){
    await ensureDeviceId();
    await loadFavorites();
    await loadBlocked();
    await tryLiveFetch();
    renderFavbar();
    renderCards();

    let onboardedRes;
    try{ onboardedRes = await window.storage.get('onboarded:' + deviceId); }catch(e){ onboardedRes = null; }
    if(!onboardedRes){
      showOnboarding();
    }
  }

  init();
})();
</script>
</body>
</html>
