/* ==========================================================================
   MUZIKIGLASS — Live Global & Ugandan Music Engine
   Fuses Apple Liquid Glass Refraction + Material 3 Expressive Dynamic Tokens
   ========================================================================== */

// Material Expressive Dynamic Palettes
const EXPRESSIVE_PALETTES = [
  { name: "Kampala Sunset", primary: "#ff6b3d", secondary: "#00d4ff", tertiary: "#d946ef" },
  { name: "Nile Emerald", primary: "#22e58a", secondary: "#38bdf8", tertiary: "#a855f7" },
  { name: "Afrobeat Gold", primary: "#facc15", secondary: "#fb7185", tertiary: "#6366f1" },
  { name: "Global Neon", primary: "#60a5fa", secondary: "#f472b6", tertiary: "#34d399" },
  { name: "Pearl Crimson", primary: "#fb7185", secondary: "#fbbf24", tertiary: "#2dd4bf" },
];

// Curated Offline/Fallback Ugandan & Global Hits (guaranteed instant load)
const FALLBACK_TRACKS = [
  {
    id: "ug-1",
    title: "Sitya Loss",
    artist: "Eddy Kenzo",
    album: "Sitya Loss",
    genre: "Ugaflow & Afrobeat",
    region: "uganda",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/44/0c/a4/440ca4c0-1f62-842b-2cf2-145c3cfcb0b8/artwork.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseYear: "2014",
  },
  {
    id: "ug-2",
    title: "Nana",
    artist: "Joshua Baraka",
    album: "Growing Pains",
    genre: "Ugaflow & Afrobeat",
    region: "uganda",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b8/96/4d/b8964d1f-152c-25fb-9a3f-9c126925c5d4/197188894965.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseYear: "2023",
  },
  {
    id: "ug-3",
    title: "Party",
    artist: "Azawi",
    album: "Sankofa",
    genre: "Ugaflow & Afrobeat",
    region: "uganda",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1c/71/23/1c7123c7-b9e2-96d2-7bc6-d19b2fa9d490/196589626516.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseYear: "2023",
  },
  {
    id: "gl-1",
    title: "Water",
    artist: "Tyla",
    album: "TYLA",
    genre: "Amapiano & Dance",
    region: "global",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/aa/52/4d/aa524dff-952e-d77e-00f7-e7d06b5c1a49/196871319959.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseYear: "2023",
  },
  {
    id: "gl-2",
    title: "City Boys",
    artist: "Burna Boy",
    album: "I Told Them...",
    genre: "Ugaflow & Afrobeat",
    region: "global",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/67/40/f4/6740f40f-c7b2-1fa1-cc5f-d0e1a4a217a1/075679678799.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseYear: "2023",
  },
  {
    id: "gl-3",
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    album: "Single",
    genre: "Global Pop & R&B",
    region: "global",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/55/82/1155825e-59e3-8c53-efbd-0f1940376d09/24UMGIM84979.rgb.jpg/600x600bb.jpg",
    previewUrl: "",
    releaseYear: "2024",
  },
];

// Query configurations for Live iTunes Music Search API
const QUERY_PRESETS = {
  trending: {
    uganda: ["Eddy Kenzo", "Joshua Baraka", "Azawi Uganda", "Sheebah Karungi", "Alien Skin Uganda", "Winnie Nwagi"],
    global: ["Burna Boy", "Tyla", "Sabrina Carpenter", "Kendrick Lamar", "Billie Eilish", "Wizkid"],
  },
  ugaflow: {
    uganda: ["Eddy Kenzo", "Bebe Cool", "Jose Chameleone", "Fik Fameica", "Azawi", "Vinka Uganda"],
    global: ["Rema", "Asake", "Ayra Starr", "Burna Boy"],
  },
  amapiano: {
    uganda: ["Sheebah", "Pallaso", "Spice Diana"],
    global: ["Tyla", "Kabza De Small", "Uncle Waffles", "Tyler ICU"],
  },
  globalpop: {
    uganda: ["Joshua Baraka", "Elijah Kitaka", "Kenneth Mugabi"],
    global: ["Taylor Swift", "The Weeknd", "Ariana Grande", "SZA"],
  },
  hiphop: {
    uganda: ["Navio Uganda", "GNL Zamba", "Fik Fameica", "Gravity Omutujju"],
    global: ["Kendrick Lamar", "Drake", "Travis Scott", "J. Cole"],
  },
};

// App State
const state = {
  tracks: [],
  filteredTracks: [],
  region: "all",
  genre: "trending",
  sortBy: "rank",
  searchQuery: "",
  currentIndex: -1,
  isPlaying: false,
  paletteIdx: 0,
};

// DOM References
const tracksGrid = document.getElementById("tracks-grid");
const audioPlayer = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const spotlightPlayBtn = document.getElementById("spotlight-play-btn");
const seekBar = document.getElementById("seek-bar");
const volumeBar = document.getElementById("volume-bar");
const visualizer = document.getElementById("visualizer");
const dockArtWrap = document.getElementById("dock-art-wrap");

/* ==========================================================================
   1. Apple Liquid Glass Specular Pointer + Dynamic SVG Refraction
   ========================================================================== */
function attachGlassLighting() {
  document.addEventListener("pointermove", (e) => {
    const cards = document.querySelectorAll(".liquid-card");
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    });
  });

  // Live refraction slider
  const refractionRange = document.getElementById("refraction-range");
  const dispText = document.getElementById("disp-text");
  const dispSurface = document.getElementById("disp-surface");
  refractionRange.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    dispText.setAttribute("scale", val);
    dispSurface.setAttribute("scale", val * 1.4);
  });

  // Subtle ambient liquid wave animation on SVG turbulence
  let phase = 0;
  function animateRefraction() {
    phase += 0.018;
    const turbText = document.getElementById("turb-text");
    const freqX = (0.013 + Math.sin(phase) * 0.003).toFixed(4);
    const freqY = (0.042 + Math.cos(phase * 0.8) * 0.006).toFixed(4);
    turbText.setAttribute("baseFrequency", `${freqX} ${freqY}`);
    requestAnimationFrame(animateRefraction);
  }
  requestAnimationFrame(animateRefraction);
}

/* ==========================================================================
   2. Material Expressive Dynamic Color Engine
   ========================================================================== */
function applyPalette(index) {
  state.paletteIdx = index % EXPRESSIVE_PALETTES.length;
  const p = EXPRESSIVE_PALETTES[state.paletteIdx];
  const root = document.documentElement;
  root.style.setProperty("--md-primary", p.primary);
  root.style.setProperty("--md-secondary", p.secondary);
  root.style.setProperty("--md-tertiary", p.tertiary);
  document.getElementById("stat-palette").textContent = p.name;
}

document.getElementById("theme-cycle-btn").addEventListener("click", () => {
  applyPalette(state.paletteIdx + 1);
});

/* ==========================================================================
   3. Live Music Fetcher (iTunes Search API for Ugandan & Global Music)
   ========================================================================== */
async function fetchArtistSongs(term, regionTag) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=4`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API fetch failed");
  const data = await res.json();

  return (data.results || []).map((item) => ({
    id: String(item.trackId),
    title: item.trackName,
    artist: item.artistName,
    album: item.collectionName || "Single",
    genre: item.primaryGenreName || "Music",
    region: regionTag,
    artwork: (item.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
    previewUrl: item.previewUrl || "",
    releaseYear: item.releaseDate ? item.releaseDate.slice(0, 4) : "2025",
  }));
}

async function loadCharts() {
  const statusEl = document.getElementById("live-status-text");
  statusEl.textContent = "SYNCING LIVE UGANDA & GLOBAL CHARTS...";
  tracksGrid.innerHTML = `<div class="liquid-card" style="padding:24px;border-radius:24px;">Loading live audio waves from Kampala & Global charts...</div>`;

  try {
    let fetched = [];

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim();
      const [ugRes, glRes] = await Promise.all([
        fetchArtistSongs(`${q} Uganda`, "uganda"),
        fetchArtistSongs(q, "global"),
      ]);
      fetched = [...ugRes, ...glRes];
    } else {
      const preset = QUERY_PRESETS[state.genre] || QUERY_PRESETS.trending;
      const ugPromises = preset.uganda.map((artist) => fetchArtistSongs(artist, "uganda"));
      const glPromises = preset.global.map((artist) => fetchArtistSongs(artist, "global"));
      const results = await Promise.allSettled([...ugPromises, ...glPromises]);

      results.forEach((r) => {
        if (r.status === "fulfilled") fetched.push(...r.value);
      });
    }

    // Deduplicate by track ID and interleave Uganda & Global tracks
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
    statusEl.textContent = "LIVE CHARTS • KAMPALA TO THE WORLD";
  } catch (err) {
    console.warn("Falling back to local music catalog:", err);
    state.tracks = FALLBACK_TRACKS;
    statusEl.textContent = "OFFLINE PULSE • CURATED CATALOG";
  }

  filterAndRender();
}

/* ==========================================================================
   4. Filter, Sort & Render UI
   ========================================================================== */
function filterAndRender() {
  let list = [...state.tracks];

  if (state.region !== "all") {
    list = list.filter((t) => t.region === state.region);
  }

  if (state.sortBy === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (state.sortBy === "artist") {
    list.sort((a, b) => a.artist.localeCompare(b.artist));
  }

  state.filteredTracks = list;
  document.getElementById("stat-count").textContent = list.length;
  renderSpotlight(list[0]);
  renderGrid(list);
}

function renderSpotlight(track) {
  if (!track) return;
  document.getElementById("spotlight-img").src = track.artwork;
  document.getElementById("spotlight-title").textContent = track.title;
  document.getElementById("spotlight-artist").textContent = `${track.artist} • ${track.album}`;
  document.getElementById("spotlight-region").textContent =
    track.region === "uganda" ? "🇺🇬 UGANDA" : "🌍 GLOBAL";

  spotlightPlayBtn.onclick = () => playTrackAtIndex(0);
}

function renderGrid(list) {
  tracksGrid.innerHTML = "";

  if (!list.length) {
    tracksGrid.innerHTML = `<div class="liquid-card" style="padding:24px;border-radius:24px;">No tracks matched your filter. Try switching to "All Waves".</div>`;
    return;
  }

  list.forEach((track, idx) => {
    const card = document.createElement("article");
    const isPlayingThis =
      state.currentIndex >= 0 &&
      state.filteredTracks[state.currentIndex]?.id === track.id &&
      state.isPlaying;

    card.className = `track-card liquid-card${isPlayingThis ? " playing" : ""}`;
    card.style.animationDelay = `${Math.min(idx * 35, 350)}ms`;

    card.innerHTML = `
      <div class="track-cover-wrap">
        <img src="${track.artwork}" alt="${track.title}" loading="lazy" />
        <span class="rank-badge">#${idx + 1}</span>
        <span class="region-badge">${track.region === "uganda" ? "🇺🇬 UG" : "🌍 GLB"}</span>
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

    card.addEventListener("click", () => playTrackAtIndex(idx));
    tracksGrid.appendChild(card);
  });
}

/* ==========================================================================
   5. Audio Engine + Dynamic Theme Shifting per Song
   ========================================================================== */
function playTrackAtIndex(idx) {
  const track = state.filteredTracks[idx];
  if (!track) return;

  // Clicking the same currently playing track toggles pause/play
  if (state.currentIndex === idx && state.isPlaying) {
    audioPlayer.pause();
    state.isPlaying = false;
    updatePlayerUI();
    return;
  }

  state.currentIndex = idx;

  // Dynamically shift Material Expressive palette per track
  const hash = track.title.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  applyPalette(hash % EXPRESSIVE_PALETTES.length);

  document.getElementById("dock-img").src = track.artwork;
  document.getElementById("dock-title").textContent = track.title;
  document.getElementById("dock-artist").textContent = `${track.artist} • ${track.region.toUpperCase()}`;

  if (track.previewUrl) {
    audioPlayer.removeAttribute("crossorigin");
    audioPlayer.src = track.previewUrl;
    audioPlayer.volume = Number(volumeBar.value);
    audioPlayer.play().catch(() => {});
    state.isPlaying = true;
    document.getElementById("stat-audio").textContent = "Playing 30s Preview";
  } else {
    state.isPlaying = false;
    document.getElementById("stat-audio").textContent = "No Audio Preview";
  }

  updatePlayerUI();
  renderGrid(state.filteredTracks);
}

function updatePlayerUI() {
  playPauseBtn.textContent = state.isPlaying ? "⏸" : "▶";
  playPauseBtn.classList.toggle("is-playing", state.isPlaying);
  visualizer.classList.toggle("active", state.isPlaying);
  dockArtWrap.classList.toggle("spinning", state.isPlaying);
}

playPauseBtn.addEventListener("click", () => {
  if (state.currentIndex < 0 && state.filteredTracks.length) {
    playTrackAtIndex(0);
    return;
  }
  if (state.isPlaying) {
    audioPlayer.pause();
    state.isPlaying = false;
  } else if (audioPlayer.src) {
    audioPlayer.play().catch(() => {});
    state.isPlaying = true;
  }
  updatePlayerUI();
  renderGrid(state.filteredTracks);
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (!state.filteredTracks.length) return;
  const prev = (state.currentIndex - 1 + state.filteredTracks.length) % state.filteredTracks.length;
  playTrackAtIndex(prev);
});

document.getElementById("next-btn").addEventListener("click", () => {
  if (!state.filteredTracks.length) return;
  const next = (state.currentIndex + 1) % state.filteredTracks.length;
  playTrackAtIndex(next);
});

audioPlayer.addEventListener("timeupdate", () => {
  if (!audioPlayer.duration) return;
  const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  seekBar.value = pct;
  document.getElementById("current-time").textContent = formatTime(audioPlayer.currentTime);
  document.getElementById("total-time").textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("ended", () => {
  const next = (state.currentIndex + 1) % state.filteredTracks.length;
  playTrackAtIndex(next);
});

seekBar.addEventListener("input", () => {
  if (!audioPlayer.duration) return;
  audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
});

volumeBar.addEventListener("input", () => {
  audioPlayer.volume = Number(volumeBar.value);
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/* ==========================================================================
   6. Navigation & Filter Event Listeners
   ========================================================================== */
document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.region = btn.dataset.region;
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
  loadCharts();
});

/* ==========================================================================
   Boot
   ========================================================================== */
attachGlassLighting();
applyPalette(0);
loadCharts();
