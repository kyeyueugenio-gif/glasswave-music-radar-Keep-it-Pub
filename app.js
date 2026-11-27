/* ==========================================================================
   MUZIKIGLASS — 60fps Tablet-Optimized + Wavy GPU Progress + Repeat Modes
   ========================================================================== */

const EXPRESSIVE_PALETTES = [
  { name: "Kampala Sunset", primary: "#ff7a45", primaryContainer: "rgba(255, 122, 69, 0.22)", secondary: "#38bdf8", secondaryContainer: "rgba(56, 189, 248, 0.18)" },
  { name: "Nile Emerald", primary: "#34d399", primaryContainer: "rgba(52, 211, 153, 0.2)", secondary: "#60a5fa", secondaryContainer: "rgba(96, 165, 250, 0.18)" },
  { name: "Afrobeat Gold", primary: "#fbbf24", primaryContainer: "rgba(251, 191, 36, 0.22)", secondary: "#fb7185", secondaryContainer: "rgba(251, 113, 133, 0.18)" },
  { name: "Global Neon", primary: "#60a5fa", primaryContainer: "rgba(96, 165, 250, 0.22)", secondary: "#f472b6", secondaryContainer: "rgba(244, 114, 182, 0.18)" },
];

const QUERY_PRESETS = {
  trending: { uganda: ["Joshua Baraka", "Azawi Uganda"], global: ["Sabrina Carpenter", "Kendrick Lamar"] },
  ugaflow: { uganda: ["Elijah Kitaka", "Fik Fameica"], global: ["Ayra Starr", "Burna Boy"] },
  amapiano: { uganda: ["Sheebah", "Spice Diana"], global: ["Tyla", "Kabza De Small"] },
  globalpop: { uganda: ["Kenneth Mugabi", "Lydia Jazmine"], global: ["Lady Gaga", "The Weeknd"] },
  hiphop: { uganda: ["Navio", "Gravity Omutujju"], global: ["Kendrick Lamar", "Travis Scott"] },
};

const INITIAL_CATALOG = [
  {
    id: "ug-1", title: "Nana", artist: "Joshua Baraka", album: "Growing Pains", genre: "Afro-Pop", region: "uganda",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b8/96/4d/b8964d1f-152c-25fb-9a3f-9c126925c5d4/197188894965.jpg/600x600bb.jpg",
    previewUrl: "", releaseDate: "2024-03-01", releaseYear: "2024",
  },
  {
    id: "gl-1", title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", album: "Single", genre: "Global Pop", region: "global",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/55/82/1155825e-59e3-8c53-efbd-0f1940376d09/24UMGIM84979.rgb.jpg/600x600bb.jpg",
    previewUrl: "", releaseDate: "2024-08-16", releaseYear: "2024",
  },
  {
    id: "ug-2", title: "Party", artist: "Azawi", album: "Sankofa", genre: "Afrobeat", region: "uganda",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1c/71/23/1c7123c7-b9e2-96d2-7bc6-d19b2fa9d490/196589626516.jpg/600x600bb.jpg",
    previewUrl: "", releaseDate: "2023-10-10", releaseYear: "2023",
  },
  {
    id: "gl-2", title: "Water", artist: "Tyla", album: "TYLA", genre: "Amapiano", region: "global",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/aa/52/4d/aa524dff-952e-d77e-00f7-e7d06b5c1a49/196871319959.jpg/600x600bb.jpg",
    previewUrl: "", releaseDate: "2023-07-28", releaseYear: "2023",
  },
];

const RELIABLE_RADIO = [
  {
    id: "rad-somafm-groove", title: "SomaFM Groove Salad", artist: "Global Ambient & Chill Beats",
    album: "Live FM", genre: "Chill", region: "radio", isRadio: true, freqLabel: "128 kbps",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    previewUrl: "https://ice1.somafm.com/groovesalad-128-mp3", releaseDate: "2026-01-01", releaseYear: "LIVE",
  },
  {
    id: "rad-rp-main", title: "Radio Paradise Mix", artist: "World Eclectic & Indie",
    album: "Live FM", genre: "Global Mix", region: "radio", isRadio: true, freqLabel: "128 kbps",
    artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
    previewUrl: "https://stream.radioparadise.com/mp3-128", releaseDate: "2026-01-01", releaseYear: "LIVE",
  },
  {
    id: "rad-somafm-lush", title: "SomaFM Lush Vocals", artist: "Electronic & Vocal Chill",
    album: "Live FM", genre: "Vocal", region: "radio", isRadio: true, freqLabel: "128 kbps",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    previewUrl: "https://ice1.somafm.com/lush-128-mp3", releaseDate: "2026-01-01", releaseYear: "LIVE",
  },
  {
    id: "rad-somafm-beat", title: "SomaFM Beat Blender", artist: "Deep House & Downtempo",
    album: "Live FM", genre: "House", region: "radio", isRadio: true, freqLabel: "128 kbps",
    artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    previewUrl: "https://ice1.somafm.com/beatblender-128-mp3", releaseDate: "2026-01-01", releaseYear: "LIVE",
  },
];

const state = {
  tracks: [...INITIAL_CATALOG],
  radioStations: [...RELIABLE_RADIO],
  filteredTracks: [],
  activeQueue: [],
  likedMap: JSON.parse(localStorage.getItem("muzikiglass_liked") || "{}"),
  ytApiKey: localStorage.getItem("muzikiglass_yt_key") || "",
  region: "all",
  genre: "trending",
  sortBy: "newest",
  searchQuery: "",
  currentTrackId: null,
  isPlaying: false,
  shuffle: false,
  repeatMode: "off", // "off" | "all" | "one"
  paletteIdx: 0,
  volume: 0.8,
  lastVolume: 0.8,
  isMuted: false,
  currentSlide: 0,
  syncedLines: [],
  activeLyricIdx: -1,
};

// DOM Refs
const radioSection = document.getElementById("radio-section");
const tracksSection = document.getElementById("tracks-section");
const radioGrid = document.getElementById("radio-grid");
const tracksGrid = document.getElementById("tracks-grid");
const audioPlayer = document.getElementById("audio-player");
const playerDock = document.getElementById("player-dock");
const trayBackdrop = document.getElementById("tray-backdrop");
const trayCarousel = document.getElementById("tray-carousel");
const ytModalBackdrop = document.getElementById("yt-modal-backdrop");
const playPauseBtn = document.getElementById("play-pause-btn");
const trayPlayBtn = document.getElementById("tray-play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const trayPrevBtn = document.getElementById("tray-prev-btn");
const trayNextBtn = document.getElementById("tray-next-btn");
const repeatBtn = document.getElementById("tray-repeat-btn");
const repeatOneBadge = document.getElementById("repeat-one-badge");
const dockArtWrap = document.getElementById("dock-art-wrap");
const trayYtIframe = document.getElementById("tray-yt-iframe");
const trayArt = document.getElementById("tray-art");

// Scrubber & Volume Refs
const dockScrubber = document.getElementById("dock-scrubber");
const trayScrubber = document.getElementById("tray-scrubber");
const volMuteBtn = document.getElementById("volume-mute-btn");
const volTrack = document.getElementById("custom-volume-track");
const volReadout = document.getElementById("volume-readout");

/* ==========================================================================
   1. Greeting, Helpers, Toast & Theme Palette
   ========================================================================== */
function setGreeting() {
  const hr = new Date().getHours();
  const text = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
  document.getElementById("greeting-text").textContent = text;
}

async function fetchWithTimeout(url, ms = 5500) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function applyPalette(index) {
  state.paletteIdx = index % EXPRESSIVE_PALETTES.length;
  const p = EXPRESSIVE_PALETTES[state.paletteIdx];
  const root = document.documentElement;
  root.style.setProperty("--md-primary", p.primary);
  root.style.setProperty("--md-primary-container", p.primaryContainer);
  root.style.setProperty("--md-secondary", p.secondary);
  root.style.setProperty("--md-secondary-container", p.secondaryContainer);
}

document.getElementById("theme-cycle-btn").addEventListener("click", () => {
  applyPalette(state.paletteIdx + 1);
  showToast(`Theme: ${EXPRESSIVE_PALETTES[state.paletteIdx].name}`);
});

/* ==========================================================================
   2. GPU-Only Custom Volume & Wavy Scrubber Controls
   ========================================================================== */
function setVolumeLevel(val, { saveNonZero = true } = {}) {
  const clamped = Math.max(0, Math.min(1, val));
  state.volume = clamped;
  state.isMuted = clamped === 0;
  if (saveNonZero && clamped > 0) state.lastVolume = clamped;

  audioPlayer.volume = clamped;
  const pct = Math.round(clamped * 100);
  volTrack.style.setProperty("--vol", clamped.toFixed(4));
  volReadout.textContent = `${pct}%`;
  volTrack.setAttribute("aria-valuenow", String(pct));

  volMuteBtn.classList.toggle("muted", state.isMuted);
  volMuteBtn.querySelector(".vol-wave-1").classList.toggle("hidden", state.isMuted);
  volMuteBtn.querySelector(".vol-wave-2").classList.toggle("hidden", state.isMuted || clamped < 0.48);
  volMuteBtn.querySelector(".vol-slash").classList.toggle("hidden", !state.isMuted);
  volMuteBtn.querySelector(".vol-slash-2").classList.toggle("hidden", !state.isMuted);
}

function bindGpuSlider(el, onRatio) {
  const handlePointer = (e) => {
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width || 1)));
    onRatio(ratio);
  };

  el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
    handlePointer(e);
  });

  el.addEventListener("pointermove", (e) => {
    if (!el.classList.contains("dragging")) return;
    handlePointer(e);
  });

  const endDrag = () => el.classList.remove("dragging");
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
}

bindGpuSlider(volTrack, (ratio) => setVolumeLevel(ratio));

volTrack.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
    e.preventDefault();
    setVolumeLevel(state.volume + 0.05);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
    e.preventDefault();
    setVolumeLevel(state.volume - 0.05);
  }
});

volMuteBtn.addEventListener("click", () => {
  if (state.isMuted) {
    setVolumeLevel(state.lastVolume > 0 ? state.lastVolume : 0.8);
  } else {
    state.lastVolume = state.volume || 0.8;
    setVolumeLevel(0, { saveNonZero: false });
  }
});

// Isolated Wavy Progress Update (Zero homepage/list DOM writes)
function updateProgressVisual(ratio) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const clipRight = `${((1 - clamped) * 100).toFixed(2)}%`;
  const pct = String(Math.round(clamped * 100));

  [dockScrubber, trayScrubber].forEach((scrubber) => {
    scrubber.style.setProperty("--prog", clamped.toFixed(4));
    scrubber.style.setProperty("--clip-right", clipRight);
    scrubber.setAttribute("aria-valuenow", pct);
  });
}

function seekToRatio(ratio) {
  updateProgressVisual(ratio);
  if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
    audioPlayer.currentTime = ratio * audioPlayer.duration;
  }
}

bindGpuSlider(dockScrubber, seekToRatio);
bindGpuSlider(trayScrubber, seekToRatio);

/* ==========================================================================
   3. Data Fetchers (Latest Music, Live FM Radio, YouTube API)
   ========================================================================== */
async function fetchYouTubeTrending(regionCode, regionTag) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&regionCode=${regionCode}&maxResults=10&key=${encodeURIComponent(state.ytApiKey)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("YT API error");
  const data = await res.json();
  return (data.items || []).map((v) => ({
    id: `yt-${v.id}`, ytVideoId: v.id, title: v.snippet.title,
    artist: v.snippet.channelTitle.replace(" - Topic", ""), album: "YouTube Music",
    genre: "YouTube", region: regionTag,
    artwork: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || "",
    previewUrl: "", releaseDate: v.snippet.publishedAt || "2025-01-01",
    releaseYear: (v.snippet.publishedAt || "2025").slice(0, 4),
  }));
}

async function fetchYouTubeSearch(query, regionTag) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&order=date&maxResults=8&q=${encodeURIComponent(query)}&key=${encodeURIComponent(state.ytApiKey)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("YT Search error");
  const data = await res.json();
  return (data.items || []).map((v) => ({
    id: `yt-${v.id.videoId}`, ytVideoId: v.id.videoId, title: v.snippet.title,
    artist: v.snippet.channelTitle.replace(" - Topic", ""), album: "YouTube Music",
    genre: "YouTube", region: regionTag,
    artwork: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || "",
    previewUrl: "", releaseDate: v.snippet.publishedAt || "2025-01-01",
    releaseYear: (v.snippet.publishedAt || "2025").slice(0, 4),
  }));
}

async function fetchItunesBatch(term, regionTag) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=12`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("iTunes failed");
  const data = await res.json();

  return (data.results || [])
    .filter((item) => item.trackName && item.artworkUrl100 && item.previewUrl)
    .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
    .slice(0, 6)
    .map((item) => ({
      id: String(item.trackId), title: item.trackName, artist: item.artistName,
      album: item.collectionName || "Single", genre: item.primaryGenreName || "Music",
      region: regionTag, artwork: item.artworkUrl100.replace("100x100bb", "600x600bb"),
      previewUrl: item.previewUrl, releaseDate: item.releaseDate || "2024-01-01",
      releaseYear: item.releaseDate ? item.releaseDate.slice(0, 4) : "2025",
    }));
}

async function fetchLiveRadioStations() {
  const endpoints = [
    "https://all.api.radio-browser.info/json/stations/search?countrycode=UG&hidebroken=true&order=clickcount&reverse=true&limit=12",
    "https://de1.api.radio-browser.info/json/stations/search?countrycode=UG&hidebroken=true&order=clickcount&reverse=true&limit=12",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithTimeout(url, 4500);
      if (!res.ok) continue;
      const data = await res.json();
      const httpsUg = data
        .filter((s) => (s.url_resolved || "").startsWith("https://"))
        .map((s) => ({
          id: `rad-${s.stationuuid}`, title: s.name.trim(),
          artist: `Uganda FM`, album: "Live Broadcast",
          genre: (s.tags || "Uganda FM").split(",")[0] || "Radio",
          region: "radio", isRadio: true,
          freqLabel: `${s.bitrate || 128} kbps`,
          artwork: s.favicon && s.favicon.startsWith("https://")
            ? s.favicon
            : "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
          previewUrl: s.url_resolved, releaseDate: "2026-01-01", releaseYear: "LIVE",
        }));

      if (httpsUg.length) {
        state.radioStations = [...httpsUg, ...RELIABLE_RADIO];
        renderRadioSection();
        return;
      }
    } catch {
      // Try next mirror
    }
  }
}

async function loadCharts() {
  const statusEl = document.getElementById("live-status-text");
  statusEl.textContent = "Syncing latest Uganda & Global tracks...";

  try {
    let fetched = [];
    if (state.ytApiKey) {
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
    } else if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim();
      const results = await Promise.allSettled([
        fetchItunesBatch(`${q} Uganda`, "uganda"),
        fetchItunesBatch(q, "global"),
      ]);
      results.forEach((r) => { if (r.status === "fulfilled") fetched.push(...r.value); });
    } else {
      const preset = QUERY_PRESETS[state.genre] || QUERY_PRESETS.trending;
      const results = await Promise.allSettled([
        ...preset.uganda.map((a) => fetchItunesBatch(a, "uganda")),
        ...preset.global.map((a) => fetchItunesBatch(a, "global")),
      ]);
      results.forEach((r) => { if (r.status === "fulfilled") fetched.push(...r.value); });
    }

    const seen = new Set();
    const unique = fetched.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    if (unique.length) {
      const ugList = unique.filter((t) => t.region === "uganda");
      const glList = unique.filter((t) => t.region === "global");
      const mixed = [];
      const maxLen = Math.max(ugList.length, glList.length);
      for (let i = 0; i < maxLen; i++) {
        if (ugList[i]) mixed.push(ugList[i]);
        if (glList[i]) mixed.push(glList[i]);
      }
      state.tracks = mixed;
      statusEl.textContent = state.ytApiKey ? "YouTube Music Live • Uganda & Global" : "Kampala to the World • Latest Drops";
    } else {
      statusEl.textContent = "Curated Tracks • Ready";
    }
  } catch {
    statusEl.textContent = "Curated Tracks • Ready";
  }

  applyFiltersAndRender();
}

/* ==========================================================================
   4. Dual Lyrics Engine (Vertical scroll isolated to Lyrics box)
   ========================================================================== */
function cleanTrackName(name) {
  return name.replace(/\(.*?\)|\[.*?\]/g, "").split("-")[0].split("feat")[0].trim();
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
  const status = document.getElementById("lyrics-status");
  state.syncedLines = [];
  state.activeLyricIdx = -1;

  if (!track || track.isRadio) {
    status.textContent = "Live FM";
    box.innerHTML = `<p class="lyrics-placeholder">Live FM broadcast — switch to a music track to view lyrics.</p>`;
    return;
  }

  status.textContent = "Searching...";
  box.innerHTML = `<p class="lyrics-placeholder">Finding lyrics for "${track.title}"...</p>`;

  const cleanTitle = cleanTrackName(track.title);
  const cleanArtist = cleanTrackName(track.artist);

  try {
    let res = await fetchWithTimeout(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`, 4500);
    let data = res.ok ? await res.json() : null;

    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      const sRes = await fetchWithTimeout(`https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`, 4500);
      const list = sRes.ok ? await sRes.json() : [];
      data = list[0] || null;
    }

    if (data?.syncedLyrics) {
      status.textContent = "Synced";
      state.syncedLines = parseLrc(data.syncedLyrics);
      box.innerHTML = "";
      state.syncedLines.forEach((line, idx) => {
        const p = document.createElement("p");
        p.className = "lyric-line";
        p.textContent = line.text;
        p.addEventListener("click", () => {
          if (audioPlayer.duration && isFinite(audioPlayer.duration)) audioPlayer.currentTime = line.time;
        });
        box.appendChild(p);
      });
      return;
    }

    if (data?.plainLyrics) {
      status.textContent = "Lyrics";
      box.innerHTML = `<div class="lyric-plain">${data.plainLyrics}</div>`;
      return;
    }

    const ovhRes = await fetchWithTimeout(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`, 4500);
    if (ovhRes.ok) {
      const ovhData = await ovhRes.json();
      if (ovhData.lyrics) {
        status.textContent = "Lyrics";
        box.innerHTML = `<div class="lyric-plain">${ovhData.lyrics}</div>`;
        return;
      }
    }

    status.textContent = "Unavailable";
    box.innerHTML = `<p class="lyrics-placeholder">Lyrics aren’t indexed yet for "${track.title}".</p>`;
  } catch {
    status.textContent = "Offline";
    box.innerHTML = `<p class="lyrics-placeholder">Could not load lyrics right now.</p>`;
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
  const lines = box.querySelectorAll(".lyric-line");
  lines.forEach((el, idx) => el.classList.toggle("active-line", idx === active));

  if (active >= 0 && state.currentSlide === 2 && trayBackdrop.classList.contains("open")) {
    const activeEl = lines[active];
    if (activeEl) {
      const targetTop = Math.max(0, activeEl.offsetTop - box.clientHeight / 2 + activeEl.clientHeight / 2);
      box.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  }
}

/* ==========================================================================
   5. Clean Separation: Live FM Section vs Latest Tracks Section
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
    showToast("Saved to Liked");
  }
  localStorage.setItem("muzikiglass_liked", JSON.stringify(state.likedMap));
  updateLikedCounter();
  syncTrayDetails();
  applyFiltersAndRender();
}

function matchesSearch(item, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    item.title.toLowerCase().includes(s) ||
    item.artist.toLowerCase().includes(s) ||
    (item.genre || "").toLowerCase().includes(s)
  );
}

function renderRadioSection() {
  const showRadio = state.region === "all" || state.region === "radio";
  radioSection.classList.toggle("hidden", !showRadio);
  if (!showRadio) return;

  const q = state.searchQuery.trim();
  const stations = state.radioStations.filter((s) => matchesSearch(s, q));
  radioGrid.innerHTML = "";

  if (!stations.length) {
    radioGrid.innerHTML = `<div class="radio-card"><p>No matching FM stations.</p></div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  stations.forEach((station) => {
    const isPlayingThis = state.currentTrackId === station.id && state.isPlaying;
    const card = document.createElement("article");
    card.className = `radio-card${isPlayingThis ? " playing" : ""}`;
    card.dataset.trackId = station.id;
    card.innerHTML = `
      <img class="radio-thumb" src="${station.artwork}" alt="${station.title}" loading="lazy" />
      <div class="radio-info">
        <h3>${station.title}</h3>
        <p>${station.artist}</p>
      </div>
      <span class="freq-badge"><span class="live-dot"></span>${station.freqLabel || "LIVE"}</span>
    `;
    card.addEventListener("click", () => playItem(station, stations));
    frag.appendChild(card);
  });
  radioGrid.appendChild(frag);
}

function renderTracksSection() {
  const showTracks = state.region !== "radio";
  tracksSection.classList.toggle("hidden", !showTracks);
  if (!showTracks) return;

  let list = state.region === "liked" ? Object.values(state.likedMap) : [...state.tracks];
  if (state.region === "uganda" || state.region === "global") {
    list = list.filter((t) => t.region === state.region);
  }

  const q = state.searchQuery.trim();
  list = list.filter((t) => matchesSearch(t, q));

  if (state.sortBy === "newest") {
    list.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
  } else if (state.sortBy === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (state.sortBy === "artist") {
    list.sort((a, b) => a.artist.localeCompare(b.artist));
  }

  state.filteredTracks = list;
  tracksGrid.innerHTML = "";

  if (!list.length) {
    tracksGrid.innerHTML = `<div class="track-card"><p style="font-size:0.85rem;color:rgba(255,255,255,0.7);">No tracks found. Try another filter or press Search.</p></div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach((track, idx) => {
    const isPlayingThis = state.currentTrackId === track.id && state.isPlaying;
    const isLiked = Boolean(state.likedMap[track.id]);
    const card = document.createElement("article");
    card.className = `track-card${isPlayingThis ? " playing" : ""}`;
    card.dataset.trackId = track.id;

    card.innerHTML = `
      <div class="track-cover-wrap">
        <img src="${track.artwork}" alt="${track.title}" loading="lazy" />
        <span class="rank-badge">#${idx + 1}</span>
        <span class="region-badge">${track.region === "uganda" ? "UG" : "GLB"}</span>
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
    card.addEventListener("click", () => playItem(track, list));
    frag.appendChild(card);
  });
  tracksGrid.appendChild(frag);
}

function applyFiltersAndRender() {
  renderRadioSection();
  renderTracksSection();
  state.activeQueue = state.region === "radio" ? state.radioStations : state.filteredTracks;
  updateTransportAvailability();
  renderTrayQueue();
}

// Fast DOM-only playing highlight update (no full list re-render!)
function syncPlayingCardHighlight() {
  document.querySelectorAll("[data-track-id]").forEach((card) => {
    const isCurrent = card.dataset.trackId === state.currentTrackId && state.isPlaying;
    card.classList.toggle("playing", isCurrent);
    const fab = card.querySelector(".card-play-fab");
    if (fab) fab.textContent = isCurrent ? "⏸" : "▶";
  });
}

/* ==========================================================================
   6. Media Transport, Wavy Progress & 3-State Repeat / Replay
   ========================================================================== */
function getCurrentTrack() {
  return state.activeQueue.find((t) => t.id === state.currentTrackId) || null;
}

function updateTransportAvailability() {
  const hasQueue = state.activeQueue.length > 0;
  [prevBtn, nextBtn, trayPrevBtn, trayNextBtn].forEach((btn) => {
    btn.disabled = !hasQueue;
  });
}

function playItem(track, queueContext) {
  if (!track) return;
  if (queueContext) state.activeQueue = queueContext;

  if (state.currentTrackId === track.id && state.isPlaying && !track.ytVideoId) {
    audioPlayer.pause();
    state.isPlaying = false;
    updatePlayerUI();
    syncPlayingCardHighlight();
    return;
  }

  state.currentTrackId = track.id;
  document.getElementById("dock-img").src = track.artwork;
  document.getElementById("dock-title").textContent = track.title;
  document.getElementById("dock-artist").textContent = track.artist;

  if (track.ytVideoId) {
    audioPlayer.pause();
    trayYtIframe.src = `https://www.youtube.com/embed/${track.ytVideoId}?autoplay=1`;
    trayYtIframe.classList.remove("hidden");
    trayArt.classList.add("hidden");
    state.isPlaying = true;
    openPickerTray();
  } else {
    trayYtIframe.src = "";
    trayYtIframe.classList.add("hidden");
    trayArt.classList.remove("hidden");

    if (track.previewUrl) {
      audioPlayer.src = track.previewUrl;
      audioPlayer.volume = state.volume;
      audioPlayer.play()
        .then(() => {
          state.isPlaying = true;
          updatePlayerUI();
          syncPlayingCardHighlight();
        })
        .catch(() => {
          state.isPlaying = false;
          showToast("Stream unavailable — try another station or track");
          updatePlayerUI();
          syncPlayingCardHighlight();
        });
    } else {
      state.isPlaying = false;
      showToast("Preview unavailable — tap YT Music in tray");
    }
  }

  if (track.isRadio) {
    updateProgressVisual(1);
    document.getElementById("current-time").textContent = "LIVE";
    document.getElementById("total-time").textContent = "FM";
    document.getElementById("tray-current-time").textContent = "LIVE";
    document.getElementById("tray-total-time").textContent = "FM";
  } else {
    updateProgressVisual(0);
    document.getElementById("current-time").textContent = "0:00";
    document.getElementById("total-time").textContent = "0:30";
    document.getElementById("tray-current-time").textContent = "0:00";
    document.getElementById("tray-total-time").textContent = "0:30";
  }

  syncTrayDetails();
  loadLyricsForTrack(track);
  updatePlayerUI();
  syncPlayingCardHighlight();
  renderTrayQueue();
}

function updatePlayerUI() {
  const label = state.isPlaying ? "Pause" : "Play";
  playPauseBtn.classList.toggle("is-playing", state.isPlaying);
  trayPlayBtn.classList.toggle("is-playing", state.isPlaying);
  playPauseBtn.setAttribute("aria-label", label);
  trayPlayBtn.setAttribute("aria-label", label);

  dockScrubber.classList.toggle("is-playing", state.isPlaying);
  trayScrubber.classList.toggle("is-playing", state.isPlaying);
  dockArtWrap.classList.toggle("spinning", state.isPlaying);
}

function togglePlayPause(e) {
  if (e) e.stopPropagation();
  const track = getCurrentTrack();
  if (!track && state.activeQueue.length) return playItem(state.activeQueue[0], state.activeQueue);
  if (state.isPlaying) {
    audioPlayer.pause();
    state.isPlaying = false;
  } else if (audioPlayer.src) {
    audioPlayer.play().catch(() => {});
    state.isPlaying = true;
  }
  updatePlayerUI();
  syncPlayingCardHighlight();
}

function playNext(e) {
  if (e) e.stopPropagation();
  if (!state.activeQueue.length) return;
  const idx = state.activeQueue.findIndex((t) => t.id === state.currentTrackId);
  const nextIdx = state.shuffle
    ? Math.floor(Math.random() * state.activeQueue.length)
    : (idx + 1) % state.activeQueue.length;
  playItem(state.activeQueue[nextIdx], state.activeQueue);
}

function playPrev(e) {
  if (e) e.stopPropagation();
  if (!state.activeQueue.length) return;
  // If >3s into a song, tapping Previous replays from start first
  if (audioPlayer.currentTime > 3 && !getCurrentTrack()?.isRadio) {
    audioPlayer.currentTime = 0;
    return;
  }
  const idx = state.activeQueue.findIndex((t) => t.id === state.currentTrackId);
  const prevIdx = (idx - 1 + state.activeQueue.length) % state.activeQueue.length;
  playItem(state.activeQueue[prevIdx], state.activeQueue);
}

// 3-State Repeat / Replay Cycle: off -> all -> one (Replay)
repeatBtn.addEventListener("click", () => {
  const order = ["off", "all", "one"];
  state.repeatMode = order[(order.indexOf(state.repeatMode) + 1) % order.length];

  repeatBtn.classList.toggle("active-toggle", state.repeatMode !== "off");
  repeatOneBadge.classList.toggle("hidden", state.repeatMode !== "one");

  const labels = { off: "Repeat Off", all: "Repeat All", one: "Repeat One (Replay)" };
  repeatBtn.setAttribute("aria-label", labels[state.repeatMode]);
  showToast(labels[state.repeatMode]);
});

// Isolated audio progress tick (NEVER touches homepage or grids)
audioPlayer.addEventListener("timeupdate", () => {
  const track = getCurrentTrack();
  if (track?.isRadio) return;

  updateActiveLyric(audioPlayer.currentTime);
  if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return;

  const ratio = audioPlayer.currentTime / audioPlayer.duration;
  updateProgressVisual(ratio);

  const cur = formatTime(audioPlayer.currentTime);
  const tot = formatTime(audioPlayer.duration);
  document.getElementById("current-time").textContent = cur;
  document.getElementById("total-time").textContent = tot;
  document.getElementById("tray-current-time").textContent = cur;
  document.getElementById("tray-total-time").textContent = tot;
});

audioPlayer.addEventListener("ended", () => {
  if (state.repeatMode === "one") {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(() => {});
  } else if (state.repeatMode === "all" || state.activeQueue.length > 1) {
    playNext();
  } else {
    state.isPlaying = false;
    updatePlayerUI();
    syncPlayingCardHighlight();
  }
});

audioPlayer.addEventListener("error", () => {
  if (getCurrentTrack()?.isRadio && state.isPlaying) {
    state.isPlaying = false;
    updatePlayerUI();
    syncPlayingCardHighlight();
    showToast("Station offline — try another FM stream");
  }
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/* ==========================================================================
   7. Expanded 3-Slide Tray Wiring
   ========================================================================== */
function syncTrayDetails() {
  const track = getCurrentTrack();
  if (!track) return;

  trayArt.src = track.artwork;
  document.getElementById("tray-title").textContent = track.title;
  document.getElementById("tray-artist").textContent = `${track.artist} • ${track.album}`;
  document.getElementById("tray-region-badge").textContent =
    track.isRadio ? "LIVE FM" : track.region === "uganda" ? "UGANDA" : "GLOBAL";
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
    const shareText = `Listening to ${track.title} (${track.artist}) on MuzikiGlass`;
    if (navigator.share) {
      navigator.share({ title: track.title, text: shareText, url: ytmUrl }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${ytmUrl}`);
      showToast("Link copied");
    }
  };
}

function renderTrayQueue() {
  const listEl = document.getElementById("tray-queue-list");
  document.getElementById("picker-count").textContent = `${state.activeQueue.length} items`;
  listEl.innerHTML = "";

  const frag = document.createDocumentFragment();
  state.activeQueue.forEach((track) => {
    const row = document.createElement("div");
    row.className = `queue-item${track.id === state.currentTrackId ? " active" : ""}`;
    row.innerHTML = `
      <img src="${track.artwork}" alt="${track.title}" loading="lazy" />
      <div class="queue-meta">
        <strong>${track.title}</strong>
        <span>${track.artist}</span>
      </div>
      <span class="mono-time">${track.isRadio ? "FM" : track.region === "uganda" ? "UG" : "GLB"}</span>
    `;
    row.addEventListener("click", () => {
      playItem(track, state.activeQueue);
      goToTraySlide(0);
    });
    frag.appendChild(row);
  });
  listEl.appendChild(frag);
}

function goToTraySlide(slideIndex, { instant = false } = {}) {
  state.currentSlide = slideIndex;
  trayCarousel.scrollTo({
    left: trayCarousel.clientWidth * slideIndex,
    behavior: instant ? "instant" : "smooth",
  });
  updateTraySlideDots(slideIndex);
}

function updateTraySlideDots(activeIdx) {
  state.currentSlide = activeIdx;
  document.querySelectorAll(".tray-dot").forEach((dot) => {
    dot.classList.toggle("active", Number(dot.dataset.slide) === activeIdx);
  });
}

let slideScrollTimer = 0;
trayCarousel.addEventListener("scroll", () => {
  clearTimeout(slideScrollTimer);
  slideScrollTimer = setTimeout(() => {
    const idx = Math.round(trayCarousel.scrollLeft / (trayCarousel.clientWidth || 1));
    updateTraySlideDots(idx);
  }, 60);
}, { passive: true });

document.querySelectorAll(".tray-dot").forEach((dot) => {
  dot.addEventListener("click", () => goToTraySlide(Number(dot.dataset.slide)));
});
document.querySelectorAll(".swipe-hint").forEach((hint) => {
  hint.addEventListener("click", () => goToTraySlide(Number(hint.dataset.go)));
});

function openPickerTray() {
  if (!getCurrentTrack() && state.activeQueue.length) {
    state.currentTrackId = state.activeQueue[0].id;
    syncTrayDetails();
  }
  renderTrayQueue();
  trayBackdrop.classList.add("open");
  trayBackdrop.setAttribute("aria-hidden", "false");
  goToTraySlide(0, { instant: true });
}

function closePickerTray() {
  trayBackdrop.classList.remove("open");
  trayBackdrop.setAttribute("aria-hidden", "true");
}

playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", playPrev);
nextBtn.addEventListener("click", playNext);
playerDock.addEventListener("click", openPickerTray);
document.getElementById("tray-close-btn").addEventListener("click", closePickerTray);
trayBackdrop.addEventListener("click", (e) => { if (e.target === trayBackdrop) closePickerTray(); });

trayPlayBtn.addEventListener("click", togglePlayPause);
trayNextBtn.addEventListener("click", playNext);
trayPrevBtn.addEventListener("click", playPrev);

document.getElementById("tray-shuffle-btn").addEventListener("click", (e) => {
  state.shuffle = !state.shuffle;
  e.currentTarget.classList.toggle("active-toggle", state.shuffle);
  showToast(state.shuffle ? "Shuffle On" : "Shuffle Off");
});

/* ==========================================================================
   8. Search, Filters & YouTube API Modal
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
  showToast("YouTube Music API Connected");
  loadCharts();
});

document.getElementById("yt-clear-btn").addEventListener("click", () => {
  state.ytApiKey = "";
  localStorage.removeItem("muzikiglass_yt_key");
  ytModalBackdrop.classList.remove("open");
  showToast("Switched to free sync");
  loadCharts();
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.region = btn.dataset.region;
    applyFiltersAndRender();
    if (state.region === "radio") fetchLiveRadioStations();
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
      state.region = "songs";
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("active", b.dataset.region === "songs"));
    }
    loadCharts();
  });
});

document.getElementById("sort-select").addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  renderTracksSection();
});

// Instant client-side filter as user types, plus full API search on submit
let searchDebounce = 0;
document.getElementById("search-input").addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => applyFiltersAndRender(), 120);
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.searchQuery = document.getElementById("search-input").value;
  loadCharts();
});

document.getElementById("refresh-btn").addEventListener("click", () => loadCharts());
document.getElementById("refresh-radio-btn").addEventListener("click", () => {
  fetchLiveRadioStations().then(() => showToast("FM stations refreshed"));
});

/* ==========================================================================
   Boot
   ========================================================================== */
setGreeting();
applyPalette(0);
setVolumeLevel(0.8);
updateLikedCounter();
applyFiltersAndRender();
loadCharts();
fetchLiveRadioStations();
