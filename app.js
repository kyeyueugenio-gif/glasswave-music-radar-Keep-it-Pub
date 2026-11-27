/* ==========================================================================
   MUZIKIGLASS v3 — Butter-Smooth Music + Live FM Radio + Synced Lyrics
   ========================================================================== */

const EXPRESSIVE_PALETTES = [
  { name: "Kampala Sunset", primary: "#ff7a45", primaryContainer: "rgba(255, 122, 69, 0.24)", secondary: "#38bdf8", secondaryContainer: "rgba(56, 189, 248, 0.2)", tertiary: "#e879f9" },
  { name: "Nile Emerald", primary: "#34d399", primaryContainer: "rgba(52, 211, 153, 0.22)", secondary: "#60a5fa", secondaryContainer: "rgba(96, 165, 250, 0.2)", tertiary: "#c084fc" },
  { name: "Afrobeat Gold", primary: "#fbbf24", primaryContainer: "rgba(251, 191, 36, 0.24)", secondary: "#fb7185", secondaryContainer: "rgba(251, 113, 133, 0.2)", tertiary: "#818cf8" },
  { name: "Global Neon", primary: "#60a5fa", primaryContainer: "rgba(96, 165, 250, 0.24)", secondary: "#f472b6", secondaryContainer: "rgba(244, 114, 182, 0.2)", tertiary: "#2dd4bf" },
  { name: "Pearl Crimson", primary: "#fb7185", primaryContainer: "rgba(251, 113, 133, 0.24)", secondary: "#fcd34d", secondaryContainer: "rgba(252, 211, 77, 0.2)", tertiary: "#38bdf8" },
];

const QUERY_PRESETS = {
  trending: {
    uganda: ["Joshua Baraka", "Elijah Kitaka", "Azawi", "Mudra Uganda", "Winnie Nwagi", "Lydia Jazmine"],
    global: ["Kendrick Lamar GNX", "Sabrina Carpenter", "ROSE Bruno Mars", "Tems", "Asake", "Billie Eilish"],
  },
  ugaflow: {
    uganda: ["Joshua Baraka", "Elijah Kitaka", "Fik Fameica", "Azawi", "Vinka", "B2C Uganda"],
    global: ["Ayra Starr", "Rema", "Wizkid Morayo", "Burna Boy"],
  },
  amapiano: {
    uganda: ["Sheebah", "Spice Diana", "Pallaso"],
    global: ["Tyla", "Tyler ICU", "Uncle Waffles", "Kabza De Small"],
  },
  globalpop: {
    uganda: ["Joshua Baraka", "Kenneth Mugabi", "Abeeka Band"],
    global: ["Lady Gaga", "Sabrina Carpenter", "The Weeknd", "Ariana Grande"],
  },
  hiphop: {
    uganda: ["Fik Fameica", "Navio", "Gravity Omutujju", "Feffe Bussi"],
    global: ["Kendrick Lamar", "Central Cee", "Travis Scott", "Doechii"],
  },
};

const FALLBACK_TRACKS = [
  {
    id: "ug-new-1",
    title: "Nana",
    artist: "Joshua Baraka",
    album: "Growing Pains",
    genre: "Afro-Pop",
    region: "uganda",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b8/96/4d/b8964d1f-152c-25fb-9a3f-9c126925c5d4/197188894965.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseDate: "2024-03-01",
    releaseYear: "2024",
  },
  {
    id: "gl-new-1",
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    album: "Single",
    genre: "Global Pop",
    region: "global",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/55/82/1155825e-59e3-8c53-efbd-0f1940376d09/24UMGIM84979.rgb.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseDate: "2024-08-16",
    releaseYear: "2024",
  },
];

// Curated HTTPS Radio Fallbacks in case Radio-Browser is busy
const FALLBACK_RADIO = [
  {
    id: "rad-1",
    title: "Capital FM 91.3 Kampala",
    artist: "Live Uganda FM",
    album: "Live Broadcast",
    genre: "Uganda Hit Radio",
    region: "radio",
    isRadio: true,
    artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
    previewUrl: "https://capitalfm.atunwadigital.streamguys1.com/capitalfm",
    releaseDate: "2026-01-01",
    releaseYear: "LIVE",
  },
  {
    id: "rad-2",
    title: "SomaFM Groove Salad",
    artist: "Global Chill & Beats",
    album: "Live Broadcast",
    genre: "Global Radio",
    region: "radio",
    isRadio: true,
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    previewUrl: "https://ice2.somafm.com/groovesalad-128-mp3",
    releaseDate: "2026-01-01",
    releaseYear: "LIVE",
  },
];

const state = {
  tracks: [],
  radioStations: [],
  filteredTracks: [],
  likedMap: JSON.parse(localStorage.getItem("muzikiglass_liked") || "{}"),
  ytApiKey: localStorage.getItem("muzikiglass_yt_key") || "",
  region: "all",
  genre: "trending",
  sortBy: "newest",
  searchQuery: "",
  currentIndex: -1,
  isPlaying: false,
  shuffle: false,
  repeat: false,
  paletteIdx: 0,
  syncedLines: [],
  activeLyricIdx: -1,
};

const tracksGrid = document.getElementById("tracks-grid");
const audioPlayer = document.getElementById("audio-player");
const playerDock = document.getElementById("player-dock");
const trayBackdrop = document.getElementById("tray-backdrop");
const ytModalBackdrop = document.getElementById("yt-modal-backdrop");
const playPauseBtn = document.getElementById("play-pause-btn");
const trayPlayBtn = document.getElementById("tray-play-btn");
const seekBar = document.getElementById("seek-bar");
const traySeekBar = document.getElementById("tray-seek-bar");
const volumeBar = document.getElementById("volume-bar");
const visualizer = document.getElementById("visualizer");
const dockArtWrap = document.getElementById("dock-art-wrap");
const trayYtIframe = document.getElementById("tray-yt-iframe");
const trayArt = document.getElementById("tray-art");

/* ==========================================================================
   1. Butter-Smooth Single-Card Pointer Lighting + Palette + Toast
   ========================================================================== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function attachGlassLighting() {
  let rafId = 0;
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".liquid-card");
    if (!card || rafId) return;
    rafId = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--mouse-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      rafId = 0;
    });
  }, { passive: true });
}

function applyPalette(index) {
  state.paletteIdx = index % EXPRESSIVE_PALETTES.length;
  const p = EXPRESSIVE_PALETTES[state.paletteIdx];
  const root = document.documentElement;
  root.style.setProperty("--md-primary", p.primary);
  root.style.setProperty("--md-primary-container", p.primaryContainer);
  root.style.setProperty("--md-secondary", p.secondary);
  root.style.setProperty("--md-secondary-container", p.secondaryContainer);
  root.style.setProperty("--md-tertiary", p.tertiary);
  document.getElementById("stat-palette").textContent = p.name;
}

document.getElementById("theme-cycle-btn").addEventListener("click", () => {
  applyPalette(state.paletteIdx + 1);
  showToast(`Palette: ${EXPRESSIVE_PALETTES[state.paletteIdx].name}`);
});

/* ==========================================================================
   2. Music + Live Radio + YouTube Fetchers
   ========================================================================== */
async function fetchYouTubeTrending(regionCode, regionTag) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&regionCode=${regionCode}&maxResults=12&key=${encodeURIComponent(state.ytApiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube API error");
  const data = await res.json();

  return (data.items || []).map((v) => ({
    id: `yt-${v.id}`,
    ytVideoId: v.id,
    title: v.snippet.title,
    artist: v.snippet.channelTitle.replace(" - Topic", ""),
    album: "YouTube Music Trending",
    genre: "YouTube Live",
    region: regionTag,
    artwork: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || "",
    previewUrl: "",
    releaseDate: v.snippet.publishedAt || "2025-01-01",
    releaseYear: (v.snippet.publishedAt || "2025").slice(0, 4),
  }));
}

async function fetchYouTubeSearch(query, regionTag) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&order=date&maxResults=8&q=${encodeURIComponent(query)}&key=${encodeURIComponent(state.ytApiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube Search API error");
  const data = await res.json();

  return (data.items || []).map((v) => ({
    id: `yt-${v.id.videoId}`,
    ytVideoId: v.id.videoId,
    title: v.snippet.title,
    artist: v.snippet.channelTitle.replace(" - Topic", ""),
    album: "YouTube Music",
    genre: "YT Latest",
    region: regionTag,
    artwork: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || "",
    previewUrl: "",
    releaseDate: v.snippet.publishedAt || "2025-01-01",
    releaseYear: (v.snippet.publishedAt || "2025").slice(0, 4),
  }));
}

async function fetchItunesLatest(term, regionTag) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("iTunes fetch failed");
  const data = await res.json();

  return (data.results || [])
    .filter((item) => item.trackName && item.artworkUrl100)
    .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
    .slice(0, 3)
    .map((item) => ({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName || "Single",
      genre: item.primaryGenreName || "Music",
      region: regionTag,
      artwork: item.artworkUrl100.replace("100x100bb", "600x600bb"),
      previewUrl: item.previewUrl || "",
      releaseDate: item.releaseDate || "2024-01-01",
      releaseYear: item.releaseDate ? item.releaseDate.slice(0, 4) : "2025",
    }));
}

async function fetchLiveRadioStations() {
  try {
    const [ugRes, glRes] = await Promise.all([
      fetch("https://de1.api.radio-browser.info/json/stations/search?countrycode=UG&is_https=true&hidebroken=true&order=clickcount&reverse=true&limit=10"),
      fetch("https://de1.api.radio-browser.info/json/stations/search?is_https=true&hidebroken=true&order=votes&reverse=true&limit=8"),
    ]);

    const ugData = ugRes.ok ? await ugRes.json() : [];
    const glData = glRes.ok ? await glRes.json() : [];

    const mapStation = (s, label) => ({
      id: `rad-${s.stationuuid}`,
      title: s.name.trim(),
      artist: s.country ? `${s.country} • ${s.bitrate || 128}kbps` : label,
      album: "Live FM Stream",
      genre: (s.tags || label).split(",")[0] || "Radio",
      region: "radio",
      isRadio: true,
      artwork: s.favicon && s.favicon.startsWith("https://")
        ? s.favicon
        : "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
      previewUrl: s.url_resolved || s.url,
      releaseDate: "2026-01-01",
      releaseYear: "LIVE",
    });

    const combined = [
      ...ugData.filter((s) => (s.url_resolved || "").startsWith("https://")).map((s) => mapStation(s, "Uganda FM")),
      ...glData.filter((s) => (s.url_resolved || "").startsWith("https://")).map((s) => mapStation(s, "Global FM")),
    ];

    state.radioStations = combined.length ? combined : FALLBACK_RADIO;
  } catch {
    state.radioStations = FALLBACK_RADIO;
  }
}

async function loadCharts() {
  const statusEl = document.getElementById("live-status-text");
  const sourceEl = document.getElementById("stat-source");
  statusEl.textContent = "SYNCING LATEST UGANDA & GLOBAL MUSIC...";
  tracksGrid.innerHTML = `<div class="liquid-card" style="padding:20px;border-radius:22px;">Syncing latest waves...</div>`;

  try {
    let fetched = [];

    if (state.ytApiKey) {
      sourceEl.textContent = "YouTube Music API";
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.trim();
        const [ugYt, glYt] = await Promise.all([
          fetchYouTubeSearch(`${q} Uganda`, "uganda"),
          fetchYouTubeSearch(q, "global"),
        ]);
        fetched = [...ugYt, ...glYt];
      } else {
        const [ugYt, glYt] = await Promise.all([
          fetchYouTubeTrending("UG", "uganda"),
          fetchYouTubeTrending("US", "global"),
        ]);
        fetched = [...ugYt, ...glYt];
      }
    } else {
      sourceEl.textContent = "Latest + Live Radio";
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.trim();
        const [ugRes, glRes] = await Promise.all([
          fetchItunesLatest(`${q} Uganda`, "uganda"),
          fetchItunesLatest(q, "global"),
        ]);
        fetched = [...ugRes, ...glRes];
      } else {
        const preset = QUERY_PRESETS[state.genre] || QUERY_PRESETS.trending;
        const ugPromises = preset.uganda.map((a) => fetchItunesLatest(a, "uganda"));
        const glPromises = preset.global.map((a) => fetchItunesLatest(a, "global"));
        const results = await Promise.allSettled([...ugPromises, ...glPromises]);
        results.forEach((r) => {
          if (r.status === "fulfilled") fetched.push(...r.value);
        });
      }
    }

    const seen = new Set();
    const unique = fetched.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    const ugList = unique.filter((t) => t.region === "uganda");
    const glList = unique.filter((t) => t.region === "global");
    const interleaved = [];
    const maxLen = Math.max(ugList.length, glList.length);
    for (let i = 0; i < maxLen; i++) {
      if (ugList[i]) interleaved.push(ugList[i]);
      if (glList[i]) interleaved.push(glList[i]);
    }

    state.tracks = interleaved.length ? interleaved : FALLBACK_TRACKS;
    statusEl.textContent = state.ytApiKey
      ? "YOUTUBE MUSIC LIVE • UGANDA & GLOBAL"
      : "LATEST RELEASES • KAMPALA TO THE WORLD";
  } catch (err) {
    state.tracks = FALLBACK_TRACKS;
    statusEl.textContent = "OFFLINE PULSE • CURATED CATALOG";
  }

  updateLikedCounter();
  filterAndRender();
}

/* ==========================================================================
   3. Real-Time Synced Lyrics Engine (LRCLIB)
   ========================================================================== */
function cleanTrackName(name) {
  return name.replace(/\(.*?\)|\[.*?\]/g, "").split("-")[0].trim();
}

function parseLrc(lrcText) {
  const lines = [];
  lrcText.split("\n").forEach((raw) => {
    const match = raw.match(/\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)/);
    if (match) {
      const time = Number(match[1]) * 60 + Number(match[2]);
      const text = match[3].trim();
      if (text) lines.push({ time, text });
    }
  });
  return lines;
}

async function loadLyricsForTrack(track) {
  const box = document.getElementById("tray-lyrics-box");
  state.syncedLines = [];
  state.activeLyricIdx = -1;

  if (!track || track.isRadio) {
    box.innerHTML = `<p class="lyrics-placeholder">📻 Live FM Radio Broadcast — lyrics are shown for music tracks.</p>`;
    return;
  }

  box.innerHTML = `<p class="lyrics-placeholder">Searching synced lyrics for "${track.title}"...</p>`;

  try {
    const cleanTitle = cleanTrackName(track.title);
    const cleanArtist = cleanTrackName(track.artist);
    let res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
    let data = res.ok ? await res.json() : null;

    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`);
      const list = searchRes.ok ? await searchRes.json() : [];
      data = list[0] || null;
    }

    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      box.innerHTML = `<p class="lyrics-placeholder">No lyrics found in LRCLIB yet for this track. Try opening it on YT Music!</p>`;
      return;
    }

    if (data.syncedLyrics) {
      state.syncedLines = parseLrc(data.syncedLyrics);
      box.innerHTML = "";
      state.syncedLines.forEach((line, idx) => {
        const p = document.createElement("p");
        p.className = "lyric-line";
        p.dataset.idx = idx;
        p.textContent = line.text;
        p.addEventListener("click", () => {
          if (audioPlayer.duration) audioPlayer.currentTime = line.time;
        });
        box.appendChild(p);
      });
    } else {
      box.innerHTML = `<div class="lyric-plain">${data.plainLyrics}</div>`;
    }
  } catch {
    box.innerHTML = `<p class="lyrics-placeholder">Unable to fetch lyrics right now.</p>`;
  }
}

function updateActiveLyric(currentTime) {
  if (!state.syncedLines.length) return;
  let active = -1;
  for (let i = 0; i < state.syncedLines.length; i++) {
    if (currentTime >= state.syncedLines[i].time) active = i;
    else break;
  }
  if (active === state.activeLyricIdx) return;
  state.activeLyricIdx = active;

  const box = document.getElementById("tray-lyrics-box");
  box.querySelectorAll(".lyric-line").forEach((el, idx) => {
    const isCurrent = idx === active;
    el.classList.toggle("active-line", isCurrent);
    if (isCurrent) el.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ==========================================================================
   4. Filter, Sort & Render
   ========================================================================== */
function updateLikedCounter() {
  document.getElementById("liked-count").textContent = Object.keys(state.likedMap).length;
}

function toggleLike(track, e) {
  if (e) e.stopPropagation();
  if (state.likedMap[track.id]) {
    delete state.likedMap[track.id];
    showToast("Removed from Liked");
  } else {
    state.likedMap[track.id] = track;
    showToast("Saved to Liked ♥");
  }
  localStorage.setItem("muzikiglass_liked", JSON.stringify(state.likedMap));
  updateLikedCounter();
  syncTrayDetails();
  filterAndRender();
}

function filterAndRender() {
  let list = [];
  if (state.region === "liked") {
    list = Object.values(state.likedMap);
  } else if (state.region === "radio") {
    list = [...state.radioStations];
  } else {
    list = [...state.tracks];
    if (state.region === "uganda" || state.region === "global") {
      list = list.filter((t) => t.region === state.region);
    }
  }

  if (state.region !== "radio") {
    if (state.sortBy === "newest") {
      list.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
    } else if (state.sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (state.sortBy === "artist") {
      list.sort((a, b) => a.artist.localeCompare(b.artist));
    }
  }

  state.filteredTracks = list;
  renderSpotlight(list[0]);
  renderGrid(list);
  renderTrayQueue();
}

function renderSpotlight(track) {
  if (!track) return;
  document.getElementById("spotlight-img").src = track.artwork;
  document.getElementById("spotlight-title").textContent = track.title;
  document.getElementById("spotlight-artist").textContent = `${track.artist} • ${track.releaseYear}`;
  document.getElementById("spotlight-region").textContent =
    track.isRadio ? "📻 LIVE FM" : track.region === "uganda" ? "🇺🇬 UGANDA" : "🌍 GLOBAL";
  document.getElementById("spotlight-play-btn").onclick = () => playTrackAtIndex(0);
}

function renderGrid(list) {
  tracksGrid.innerHTML = "";

  if (!list.length) {
    tracksGrid.innerHTML = `<div class="liquid-card" style="padding:20px;border-radius:22px;">Nothing here yet. Try another tab or tap ♥ to save tracks!</div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach((track, idx) => {
    const card = document.createElement("article");
    const isPlayingThis =
      state.currentIndex >= 0 &&
      state.filteredTracks[state.currentIndex]?.id === track.id &&
      state.isPlaying;
    const isLiked = Boolean(state.likedMap[track.id]);

    card.className = `track-card liquid-card${isPlayingThis ? " playing" : ""}`;
    card.innerHTML = `
      <div class="track-cover-wrap">
        <img src="${track.artwork}" alt="${track.title}" loading="lazy" />
        <span class="rank-badge">#${idx + 1}</span>
        <span class="region-badge">${track.isRadio ? "📻 FM" : track.region === "uganda" ? "🇺🇬 UG" : "🌍 GLB"}</span>
        <button class="card-like-btn ${isLiked ? "liked" : ""}" aria-label="Like ${track.title}">
          ${isLiked ? "♥" : "♡"}
        </button>
        <button class="card-play-fab" aria-label="Play ${track.title}">
          ${isPlayingThis ? "⏸" : "▶"}
        </button>
      </div>
      <h3 class="track-title" title="${track.title}">${track.title}</h3>
      <p class="track-artist" title="${track.artist}">${track.artist}</p>
      <div class="track-footer">
        <span>${track.genre}</span>
        <span>${track.releaseYear}</span>
      </div>
    `;

    card.querySelector(".card-like-btn").addEventListener("click", (e) => toggleLike(track, e));
    card.addEventListener("click", () => playTrackAtIndex(idx));
    frag.appendChild(card);
  });

  tracksGrid.appendChild(frag);
}

/* ==========================================================================
   5. Playback + Zero-Scroll Tray + Queue/Lyrics Switcher
   ========================================================================== */
function playTrackAtIndex(idx) {
  const track = state.filteredTracks[idx];
  if (!track) return;

  if (state.currentIndex === idx && state.isPlaying && !track.ytVideoId) {
    audioPlayer.pause();
    state.isPlaying = false;
    updatePlayerUI();
    renderGrid(state.filteredTracks);
    return;
  }

  state.currentIndex = idx;
  const hash = track.title.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  applyPalette(hash % EXPRESSIVE_PALETTES.length);

  document.getElementById("dock-img").src = track.artwork;
  document.getElementById("dock-title").textContent = track.title;
  document.getElementById("dock-artist").textContent = track.artist;

  if (track.ytVideoId) {
    audioPlayer.pause();
    trayYtIframe.src = `https://www.youtube.com/embed/${track.ytVideoId}?autoplay=1`;
    trayYtIframe.classList.remove("hidden");
    trayArt.classList.add("hidden");
    state.isPlaying = true;
    document.getElementById("stat-audio").textContent = "Playing YouTube";
    openPickerTray();
  } else {
    trayYtIframe.src = "";
    trayYtIframe.classList.add("hidden");
    trayArt.classList.remove("hidden");

    if (track.previewUrl) {
      audioPlayer.src = track.previewUrl;
      audioPlayer.volume = Number(volumeBar.value);
      audioPlayer.play().catch(() => showToast("Stream blocked by station/browser — try another"));
      state.isPlaying = true;
      document.getElementById("stat-audio").textContent = track.isRadio ? "🔴 Live Radio" : "Playing 30s";
    } else {
      state.isPlaying = false;
      document.getElementById("stat-audio").textContent = "Open YT Music";
    }
  }

  if (track.isRadio) {
    document.getElementById("current-time").textContent = "LIVE";
    document.getElementById("total-time").textContent = "FM";
    document.getElementById("tray-current-time").textContent = "LIVE";
    document.getElementById("tray-total-time").textContent = "FM";
  }

  syncTrayDetails();
  loadLyricsForTrack(track);
  updatePlayerUI();
  renderGrid(state.filteredTracks);
  renderTrayQueue();
}

function syncTrayDetails() {
  const track = state.filteredTracks[state.currentIndex];
  if (!track) return;

  trayArt.src = track.artwork;
  document.getElementById("tray-title").textContent = track.title;
  document.getElementById("tray-artist").textContent = `${track.artist} • ${track.album}`;
  document.getElementById("tray-mode-badge").textContent = track.isRadio ? "📻 LIVE RADIO" : "NOW PLAYING";
  document.getElementById("tray-region-badge").textContent =
    track.isRadio ? "📻 FM" : track.region === "uganda" ? "🇺🇬 UGANDA" : "🌍 GLOBAL";
  document.getElementById("tray-year-badge").textContent = track.releaseYear;
  document.getElementById("tray-genre-badge").textContent = track.genre;

  const ytmUrl = track.ytVideoId
    ? `https://music.youtube.com/watch?v=${track.ytVideoId}`
    : `https://music.youtube.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`;
  document.getElementById("tray-ytm-link").href = ytmUrl;

  const likeBtn = document.getElementById("tray-like-btn");
  const isLiked = Boolean(state.likedMap[track.id]);
  likeBtn.textContent = isLiked ? "♥" : "♡";
  likeBtn.classList.toggle("liked", isLiked);
  likeBtn.onclick = () => toggleLike(track);

  document.getElementById("tray-share-btn").onclick = async () => {
    const shareText = `Listening to ${track.title} (${track.artist}) on MuzikiGlass!`;
    if (navigator.share) {
      navigator.share({ title: track.title, text: shareText, url: ytmUrl }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${ytmUrl}`);
      showToast("Link copied!");
    }
  };
}

function renderTrayQueue() {
  const listEl = document.getElementById("tray-queue-list");
  document.getElementById("picker-count").textContent = `${state.filteredTracks.length} items`;
  listEl.innerHTML = "";

  const frag = document.createDocumentFragment();
  state.filteredTracks.forEach((track, idx) => {
    const row = document.createElement("div");
    row.className = `queue-item${idx === state.currentIndex ? " active" : ""}`;
    row.innerHTML = `
      <img src="${track.artwork}" alt="${track.title}" loading="lazy" />
      <div class="queue-meta">
        <strong>${track.title}</strong>
        <span>${track.artist}</span>
      </div>
      <span class="mono-time">${track.isRadio ? "📻" : track.region === "uganda" ? "🇺🇬" : "🌍"}</span>
    `;
    row.addEventListener("click", () => playTrackAtIndex(idx));
    frag.appendChild(row);
  });
  listEl.appendChild(frag);
}

function updatePlayerUI() {
  const icon = state.isPlaying ? "⏸" : "▶";
  playPauseBtn.textContent = icon;
  trayPlayBtn.textContent = icon;
  playPauseBtn.classList.toggle("is-playing", state.isPlaying);
  trayPlayBtn.classList.toggle("is-playing", state.isPlaying);
  visualizer.classList.toggle("active", state.isPlaying);
  dockArtWrap.classList.toggle("spinning", state.isPlaying);
}

function togglePlayPause(e) {
  if (e) e.stopPropagation();
  if (state.currentIndex < 0 && state.filteredTracks.length) return playTrackAtIndex(0);
  if (state.isPlaying) {
    audioPlayer.pause();
    state.isPlaying = false;
  } else if (audioPlayer.src) {
    audioPlayer.play().catch(() => {});
    state.isPlaying = true;
  }
  updatePlayerUI();
  renderGrid(state.filteredTracks);
}

function playNext(e) {
  if (e) e.stopPropagation();
  if (!state.filteredTracks.length) return;
  const next = state.shuffle
    ? Math.floor(Math.random() * state.filteredTracks.length)
    : (state.currentIndex + 1) % state.filteredTracks.length;
  playTrackAtIndex(next);
}

function playPrev(e) {
  if (e) e.stopPropagation();
  if (!state.filteredTracks.length) return;
  const prev = (state.currentIndex - 1 + state.filteredTracks.length) % state.filteredTracks.length;
  playTrackAtIndex(prev);
}

playPauseBtn.addEventListener("click", togglePlayPause);
document.getElementById("prev-btn").addEventListener("click", playPrev);
document.getElementById("next-btn").addEventListener("click", playNext);
seekBar.addEventListener("click", (e) => e.stopPropagation());
playerDock.addEventListener("click", openPickerTray);

function openPickerTray() {
  if (state.currentIndex < 0 && state.filteredTracks.length) syncTrayDetails();
  renderTrayQueue();
  trayBackdrop.classList.add("open");
  trayBackdrop.setAttribute("aria-hidden", "false");
}

function closePickerTray() {
  trayBackdrop.classList.remove("open");
  trayBackdrop.setAttribute("aria-hidden", "true");
}

document.getElementById("tray-close-btn").addEventListener("click", closePickerTray);
trayBackdrop.addEventListener("click", (e) => { if (e.target === trayBackdrop) closePickerTray(); });

// Queue vs Lyrics Tabs inside Tray
document.querySelectorAll(".picker-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".picker-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLyrics = tab.dataset.pane === "lyrics";
    document.getElementById("tray-queue-list").classList.toggle("hidden", isLyrics);
    document.getElementById("tray-lyrics-box").classList.toggle("hidden", !isLyrics);
  });
});

trayPlayBtn.addEventListener("click", togglePlayPause);
document.getElementById("tray-next-btn").addEventListener("click", playNext);
document.getElementById("tray-prev-btn").addEventListener("click", playPrev);

document.getElementById("tray-shuffle-btn").addEventListener("click", (e) => {
  state.shuffle = !state.shuffle;
  e.target.classList.toggle("active-toggle", state.shuffle);
  showToast(state.shuffle ? "Shuffle On 🔀" : "Shuffle Off");
});

document.getElementById("tray-repeat-btn").addEventListener("click", (e) => {
  state.repeat = !state.repeat;
  e.target.classList.toggle("active-toggle", state.repeat);
  showToast(state.repeat ? "Repeat On 🔁" : "Repeat Off");
});

audioPlayer.addEventListener("timeupdate", () => {
  const track = state.filteredTracks[state.currentIndex];
  if (track?.isRadio) return;
  updateActiveLyric(audioPlayer.currentTime);
  if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return;
  const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  seekBar.value = pct;
  traySeekBar.value = pct;
  const cur = formatTime(audioPlayer.currentTime);
  const tot = formatTime(audioPlayer.duration);
  document.getElementById("current-time").textContent = cur;
  document.getElementById("total-time").textContent = tot;
  document.getElementById("tray-current-time").textContent = cur;
  document.getElementById("tray-total-time").textContent = tot;
});

audioPlayer.addEventListener("ended", () => {
  if (state.repeat) {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(() => {});
  } else {
    playNext();
  }
});

function handleSeek(val) {
  if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return;
  audioPlayer.currentTime = (val / 100) * audioPlayer.duration;
}
seekBar.addEventListener("input", () => handleSeek(seekBar.value));
traySeekBar.addEventListener("input", () => handleSeek(traySeekBar.value));
volumeBar.addEventListener("input", () => { audioPlayer.volume = Number(volumeBar.value); });

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/* ==========================================================================
   6. Navigation, Radio Switcher & YouTube API Modal
   ========================================================================== */
document.getElementById("yt-api-btn").addEventListener("click", () => {
  document.getElementById("yt-api-key-input").value = state.ytApiKey;
  ytModalBackdrop.classList.add("open");
});
document.getElementById("yt-modal-close").addEventListener("click", () => ytModalBackdrop.classList.remove("open"));
ytModalBackdrop.addEventListener("click", (e) => { if (e.target === ytModalBackdrop) ytModalBackdrop.classList.remove("open"); });

document.getElementById("yt-save-btn").addEventListener("click", () => {
  const key = document.getElementById("yt-api-key-input").value.trim();
  if (!key) return showToast("Paste a valid YouTube API key");
  state.ytApiKey = key;
  localStorage.setItem("muzikiglass_yt_key", key);
  ytModalBackdrop.classList.remove("open");
  showToast("YouTube Music API Connected!");
  loadCharts();
});

document.getElementById("yt-clear-btn").addEventListener("click", () => {
  state.ytApiKey = "";
  localStorage.removeItem("muzikiglass_yt_key");
  ytModalBackdrop.classList.remove("open");
  showToast("Switched back to free latest charts");
  loadCharts();
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.region = btn.dataset.region;

    if (state.region === "radio" && !state.radioStations.length) {
      tracksGrid.innerHTML = `<div class="liquid-card" style="padding:20px;border-radius:22px;">Tuning into Live Uganda &amp; Global FM Radio...</div>`;
      await fetchLiveRadioStations();
    }
    filterAndRender();
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.genre = chip.dataset.genre;
    state.searchQuery = "";
    document.getElementById("search-input").value = "";
    if (state.region === "radio") {
      state.region = "all";
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("active", b.dataset.region === "all"));
    }
    loadCharts();
  });
});

document.getElementById("sort-select").addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  filterAndRender();
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.searchQuery = document.getElementById("search-input").value;
  loadCharts();
});

document.getElementById("refresh-btn").addEventListener("click", () => {
  if (state.region === "radio") {
    fetchLiveRadioStations().then(filterAndRender);
  } else {
    loadCharts();
  }
});

/* ==========================================================================
   Boot
   ========================================================================== */
attachGlassLighting();
applyPalette(0);
loadCharts();
fetchLiveRadioStations(); // Pre-load radio stations silently in the background
