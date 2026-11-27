/* MUZIKIGLASS: True Apple Music Light Mode + iOS 26 Refracted Glass + 70+ Live FM */
const ACCENT_PALETTES = [
  { name: "Apple Crimson", primary: "#FA243C", secondary: "#FF6B4A", soft: "rgba(250, 36, 60, 0.11)" },
  { name: "Kampala Sunset", primary: "#FF6B2C", secondary: "#F59E0B", soft: "rgba(255, 107, 44, 0.12)" },
  { name: "Ocean Indigo", primary: "#2563EB", secondary: "#0EA5E9", soft: "rgba(37, 99, 235, 0.11)" },
  { name: "Nile Emerald", primary: "#059669", secondary: "#10B981", soft: "rgba(5, 150, 105, 0.11)" },
  { name: "Electric Plum", primary: "#9333EA", secondary: "#EC4899", soft: "rgba(147, 51, 234, 0.11)" },
];

const QUERY_PRESETS = {
  trending: { uganda: ["Joshua Baraka", "Azawi Uganda"], global: ["Sabrina Carpenter", "Kendrick Lamar"] },
  ugaflow: { uganda: ["Elijah Kitaka", "Fik Fameica"], global: ["Ayra Starr", "Burna Boy"] },
  amapiano: { uganda: ["Sheebah", "Spice Diana"], global: ["Tyla", "Kabza De Small"] },
  globalpop: { uganda: ["Kenneth Mugabi", "Lydia Jazmine"], global: ["Lady Gaga", "The Weeknd"] },
  hiphop: { uganda: ["Navio", "Gravity Omutujju"], global: ["Kendrick Lamar", "Travis Scott"] },
};

const INITIAL_CATALOG = [
  { id: "ug-1", title: "Nana", artist: "Joshua Baraka", album: "Growing Pains", genre: "Afro-Pop", region: "uganda", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b8/96/4d/b8964d1f-152c-25fb-9a3f-9c126925c5d4/197188894965.jpg/600x600bb.jpg", previewUrl: "", releaseDate: "2024-03-01", releaseYear: "2024" },
  { id: "gl-1", title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", album: "Single", genre: "Global Pop", region: "global", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/55/82/1155825e-59e3-8c53-efbd-0f1940376d09/24UMGIM84979.rgb.jpg/600x600bb.jpg", previewUrl: "", releaseDate: "2024-08-16", releaseYear: "2024" },
  { id: "ug-2", title: "Party", artist: "Azawi", album: "Sankofa", genre: "Afrobeat", region: "uganda", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1c/71/23/1c7123c7-b9e2-96d2-7bc6-d19b2fa9d490/196589626516.jpg/600x600bb.jpg", previewUrl: "", releaseDate: "2023-10-10", releaseYear: "2023" },
  { id: "gl-2", title: "Water", artist: "Tyla", album: "TYLA", genre: "Amapiano", region: "global", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/aa/52/4d/aa524dff-952e-d77e-00f7-e7d06b5c1a49/196871319959.jpg/600x600bb.jpg", previewUrl: "", releaseDate: "2023-07-28", releaseYear: "2023" },
];

const RELIABLE_RADIO = [
  { id: "rad-somafm-groove", title: "SomaFM Groove Salad", artist: "Global Ambient & Chill", album: "Live FM", genre: "Chill", region: "radio", isRadio: true, freqLabel: "128 kbps", artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=75", previewUrl: "https://ice1.somafm.com/groovesalad-128-mp3", releaseDate: "2026-01-01", releaseYear: "LIVE" },
  { id: "rad-rp-main", title: "Radio Paradise Mix", artist: "World Eclectic & Indie", album: "Live FM", genre: "Mix", region: "radio", isRadio: true, freqLabel: "128 kbps", artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&q=75", previewUrl: "https://stream.radioparadise.com/mp3-128", releaseDate: "2026-01-01", releaseYear: "LIVE" },
  { id: "rad-somafm-lush", title: "SomaFM Lush Vocals", artist: "Electronic & Vocal Chill", album: "Live FM", genre: "Vocal", region: "radio", isRadio: true, freqLabel: "128 kbps", artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=75", previewUrl: "https://ice1.somafm.com/lush-128-mp3", releaseDate: "2026-01-01", releaseYear: "LIVE" },
  { id: "rad-somafm-beat", title: "SomaFM Beat Blender", artist: "Deep House & Downtempo", album: "Live FM", genre: "House", region: "radio", isRadio: true, freqLabel: "128 kbps", artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=75", previewUrl: "https://ice1.somafm.com/beatblender-128-mp3", releaseDate: "2026-01-01", releaseYear: "LIVE" },
];

const state = {
  tracks: [...INITIAL_CATALOG],
  radioStations: [...RELIABLE_RADIO],
  filteredTracks: [],
  activeQueue: [],
  likedMap: JSON.parse(localStorage.getItem("muzikiglass_liked") || "{}"),
  ytApiKey: localStorage.getItem("muzikiglass_yt_key") || "",
  theme: localStorage.getItem("muzikiglass_appearance") || "light",
  region: "all", genre: "trending", sortBy: "newest", searchQuery: "",
  currentTrackId: null, isPlaying: false, shuffle: false, repeatMode: "off",
  paletteIdx: 0, volume: 0.8, lastVolume: 0.8, isMuted: false, currentSlide: 0,
  syncedLines: [], activeLyricIdx: -1,
};

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
const dockScrubber = document.getElementById("dock-scrubber");
const trayScrubber = document.getElementById("tray-scrubber");
const volMuteBtn = document.getElementById("volume-mute-btn");
const volTrack = document.getElementById("custom-volume-track");
const volReadout = document.getElementById("volume-readout");
const appearanceBtn = document.getElementById("appearance-toggle-btn");

/* iOS 26 Refracted Glass Sliding Lens Positioning */
function positionGlassLens(container, lensEl, activeBtn, animateSwell = true) {
  if (!container || !lensEl || !activeBtn) return;
  const x = activeBtn.offsetLeft;
  const w = activeBtn.offsetWidth;
  lensEl.style.width = `${w}px`;
  lensEl.style.setProperty("--lens-x", `${x}px`);
  lensEl.style.transform = `translate3d(${x}px, 0, 0)`;

  if (animateSwell) {
    lensEl.classList.add("is-sliding");
    clearTimeout(lensEl._swellTimer);
    lensEl._swellTimer = setTimeout(() => lensEl.classList.remove("is-sliding"), 190);
  }
}

function syncAllLenses() {
  positionGlassLens(document.getElementById("region-segmented"), document.getElementById("region-lens"), document.querySelector(".seg-btn.active"), false);
  positionGlassLens(document.getElementById("tray-segmented"), document.getElementById("tray-lens"), document.querySelector(".tray-dot.active"), false);
}
window.addEventListener("resize", syncAllLenses, { passive: true });

function setGreeting() {
  const hr = new Date().getHours();
  document.getElementById("greeting-text").textContent = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
}

function applyAppearance(mode) {
  state.theme = mode === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("muzikiglass_appearance", state.theme);
  appearanceBtn.setAttribute("aria-checked", state.theme === "dark" ? "true" : "false");
}
appearanceBtn.addEventListener("click", () => applyAppearance(state.theme === "light" ? "dark" : "light"));

async function fetchWithTimeout(url, ms = 5500) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); }
  finally { clearTimeout(id); }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function applyPalette(index) {
  state.paletteIdx = index % ACCENT_PALETTES.length;
  const p = ACCENT_PALETTES[state.paletteIdx];
  const root = document.documentElement;
  root.style.setProperty("--accent-color", p.primary);
  root.style.setProperty("--accent-secondary", p.secondary);
  root.style.setProperty("--accent-soft", p.soft);
}
document.getElementById("theme-cycle-btn").addEventListener("click", () => {
  applyPalette(state.paletteIdx + 1);
  showToast(`Tone: ${ACCENT_PALETTES[state.paletteIdx].name}`);
});

/* GPU Volume & Wavy Scrubber */
function setVolumeLevel(val, { saveNonZero = true } = {}) {
  const clamped = Math.max(0, Math.min(1, val));
  state.volume = clamped; state.isMuted = clamped === 0;
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
  const handle = (e) => {
    const r = el.getBoundingClientRect();
    onRatio(Math.max(0, Math.min(1, (e.clientX - r.left) / (r.width || 1))));
  };
  el.addEventListener("pointerdown", (e) => { e.stopPropagation(); e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add("dragging"); handle(e); });
  el.addEventListener("pointermove", (e) => { if (el.classList.contains("dragging")) handle(e); });
  const end = () => el.classList.remove("dragging");
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
}

bindGpuSlider(volTrack, (r) => setVolumeLevel(r));
volTrack.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setVolumeLevel(state.volume + 0.05); }
  else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setVolumeLevel(state.volume - 0.05); }
});
volMuteBtn.addEventListener("click", () => {
  if (state.isMuted) setVolumeLevel(state.lastVolume > 0 ? state.lastVolume : 0.8);
  else { state.lastVolume = state.volume || 0.8; setVolumeLevel(0, { saveNonZero: false }); }
});

function updateProgressVisual(ratio) {
  const c = Math.max(0, Math.min(1, ratio));
  const clip = `${((1 - c) * 100).toFixed(2)}%`;
  const pct = String(Math.round(c * 100));
  [dockScrubber, trayScrubber].forEach((s) => { s.style.setProperty("--prog", c.toFixed(4)); s.style.setProperty("--clip-right", clip); s.setAttribute("aria-valuenow", pct); });
}
function seekToRatio(ratio) { updateProgressVisual(ratio); if (audioPlayer.duration && isFinite(audioPlayer.duration)) audioPlayer.currentTime = ratio * audioPlayer.duration; }
bindGpuSlider(dockScrubber, seekToRatio);
bindGpuSlider(trayScrubber, seekToRatio);

/* Music + 70+ FM Stations Fetchers */
function fetchDeezerJsonp(term, regionTag) {
  return new Promise((resolve) => {
    const cb = `dzCb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); resolve([]); }, 5000);
    function cleanup() { clearTimeout(timer); delete window[cb]; script.remove(); }
    window[cb] = (res) => {
      cleanup();
      resolve((res?.data || []).filter((i) => i.preview && i.title).slice(0, 6).map((i) => ({
        id: `dz-${i.id}`, title: i.title, artist: i.artist?.name || "Artist",
        album: i.album?.title || "Single", genre: "Music", region: regionTag,
        artwork: i.album?.cover_big || i.album?.cover_medium || "",
        previewUrl: i.preview, releaseDate: "2025-01-01", releaseYear: "2025",
      })));
    };
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=8&output=jsonp&callback=${cb}`;
    script.onerror = () => { cleanup(); resolve([]); };
    document.head.appendChild(script);
  });
}

async function fetchTrackBatch(term, regionTag) {
  try {
    const res = await fetchWithTimeout(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=12`, 4500);
    if (res.ok) {
      const data = await res.json();
      const mapped = (data.results || []).filter((i) => i.trackName && i.artworkUrl100 && i.previewUrl)
        .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0)).slice(0, 6)
        .map((i) => ({
          id: String(i.trackId), title: i.trackName, artist: i.artistName, album: i.collectionName || "Single",
          genre: i.primaryGenreName || "Music", region: regionTag, artwork: i.artworkUrl100.replace("100x100bb", "600x600bb"),
          previewUrl: i.previewUrl, releaseDate: i.releaseDate || "2024-01-01", releaseYear: i.releaseDate ? i.releaseDate.slice(0, 4) : "2025",
        }));
      if (mapped.length) return mapped;
    }
  } catch {}
  return fetchDeezerJsonp(term, regionTag);
}

async function fetchYouTubeTrending(regionCode, regionTag) {
  const res = await fetchWithTimeout(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&regionCode=${regionCode}&maxResults=10&key=${encodeURIComponent(state.ytApiKey)}`);
  if (!res.ok) throw new Error("YT API error");
  const data = await res.json();
  return (data.items || []).map((v) => ({
    id: `yt-${v.id}`, ytVideoId: v.id, title: v.snippet.title, artist: v.snippet.channelTitle.replace(" - Topic", ""),
    album: "YouTube Music", genre: "YouTube", region: regionTag, artwork: v.snippet.thumbnails?.high?.url || "",
    previewUrl: "", releaseDate: v.snippet.publishedAt || "2025-01-01", releaseYear: (v.snippet.publishedAt || "2025").slice(0, 4),
  }));
}

async function fetchYouTubeSearch(query, regionTag) {
  const res = await fetchWithTimeout(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&order=date&maxResults=8&q=${encodeURIComponent(query)}&key=${encodeURIComponent(state.ytApiKey)}`);
  if (!res.ok) throw new Error("YT Search error");
  const data = await res.json();
  return (data.items || []).map((v) => ({
    id: `yt-${v.id.videoId}`, ytVideoId: v.id.videoId, title: v.snippet.title, artist: v.snippet.channelTitle.replace(" - Topic", ""),
    album: "YouTube Music", genre: "YouTube", region: regionTag, artwork: v.snippet.thumbnails?.high?.url || "",
    previewUrl: "", releaseDate: v.snippet.publishedAt || "2025-01-01", releaseYear: (v.snippet.publishedAt || "2025").slice(0, 4),
  }));
}

async function fetchLiveRadioStations() {
  const mirrors = ["https://all.api.radio-browser.info", "https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info"];
  const statusEl = document.getElementById("radio-status");

  for (const base of mirrors) {
    try {
      const [ugRes, glRes] = await Promise.all([
        fetchWithTimeout(`${base}/json/stations/search?countrycode=UG&hidebroken=true&order=clickcount&reverse=true&limit=70`, 6000),
        fetchWithTimeout(`${base}/json/stations/search?is_https=true&hidebroken=true&order=votes&reverse=true&limit=45`, 6000),
      ]);
      const ugData = ugRes.ok ? await ugRes.json() : [];
      const glData = glRes.ok ? await glRes.json() : [];
      const seenUrl = new Set();

      const combined = [...ugData, ...glData]
        .filter((s) => (s.url_resolved || "").startsWith("https://") && !seenUrl.has(s.url_resolved) && seenUrl.add(s.url_resolved))
        .slice(0, 75)
        .map((s) => ({
          id: `rad-${s.stationuuid}`, title: (s.name || "FM Station").trim(),
          artist: `${s.state || s.country || (s.countrycode === "UG" ? "Uganda FM" : "Global FM")} • ${(s.tags || "Music").split(",")[0] || "FM"}`,
          album: "Live Broadcast", genre: (s.tags || "FM").split(",")[0] || "Radio",
          region: "radio", isRadio: true, freqLabel: `${s.bitrate || 128} kbps`,
          artwork: s.favicon && s.favicon.startsWith("https://") ? s.favicon : "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&q=75",
          previewUrl: s.url_resolved, releaseDate: "2026-01-01", releaseYear: "LIVE",
        }));

      if (combined.length) {
        state.radioStations = [...combined, ...RELIABLE_RADIO].slice(0, 76);
        statusEl.textContent = `${state.radioStations.length} live Ugandan & Global FM streams`;
        document.getElementById("radio-count").textContent = state.radioStations.length;
        renderRadioSection();
        syncAllLenses();
        return;
      }
    } catch {}
  }
  statusEl.textContent = `${state.radioStations.length} curated live FM streams`;
  document.getElementById("radio-count").textContent = state.radioStations.length;
}

async function loadCharts() {
  const statusEl = document.getElementById("live-status-text");
  statusEl.textContent = "SYNCING LATEST UGANDA & GLOBAL CHARTS...";
  try {
    let fetched = [];
    if (state.ytApiKey) {
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.trim();
        const [ug, gl] = await Promise.all([fetchYouTubeSearch(`${q} Uganda`, "uganda"), fetchYouTubeSearch(q, "global")]);
        fetched = [...ug, ...gl];
      } else {
        const [ug, gl] = await Promise.all([fetchYouTubeTrending("UG", "uganda"), fetchYouTubeTrending("US", "global")]);
        fetched = [...ug, ...gl];
      }
    } else if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim();
      const res = await Promise.allSettled([fetchTrackBatch(`${q} Uganda`, "uganda"), fetchTrackBatch(q, "global")]);
      res.forEach((r) => { if (r.status === "fulfilled") fetched.push(...r.value); });
    } else {
      const p = QUERY_PRESETS[state.genre] || QUERY_PRESETS.trending;
      const res = await Promise.allSettled([...p.uganda.map((a) => fetchTrackBatch(a, "uganda")), ...p.global.map((a) => fetchTrackBatch(a, "global"))]);
      res.forEach((r) => { if (r.status === "fulfilled") fetched.push(...r.value); });
    }

    const seen = new Set();
    const unique = fetched.filter((t) => !seen.has(t.id) && seen.add(t.id));
    if (unique.length) {
      const ug = unique.filter((t) => t.region === "uganda"), gl = unique.filter((t) => t.region === "global");
      const mixed = [];
      for (let i = 0; i < Math.max(ug.length, gl.length); i++) { if (ug[i]) mixed.push(ug[i]); if (gl[i]) mixed.push(gl[i]); }
      state.tracks = mixed;
      statusEl.textContent = state.ytApiKey ? "YOUTUBE MUSIC LIVE • UGANDA & GLOBAL" : "KAMPALA TO THE WORLD • LATEST DROPS";
    } else { statusEl.textContent = "CURATED TRACKS • READY TO PLAY"; }
  } catch { statusEl.textContent = "CURATED TRACKS • READY TO PLAY"; }
  applyFiltersAndRender();
}

/* Lyrics Engine */
function cleanTrackName(name) { return name.replace(/\(.*?\)|\[.*?\]/g, "").split("-")[0].split("feat")[0].trim(); }
function parseLrc(lrc) {
  const out = [];
  lrc.split("\n").forEach((raw) => {
    const m = raw.match(/\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)/);
    if (m && m[3].trim()) out.push({ time: Number(m[1]) * 60 + Number(m[2]), text: m[3].trim() });
  });
  return out;
}

async function loadLyricsForTrack(track) {
  const box = document.getElementById("tray-lyrics-box");
  const status = document.getElementById("lyrics-status");
  state.syncedLines = []; state.activeLyricIdx = -1;
  if (!track || track.isRadio) { status.textContent = "Live FM"; box.innerHTML = `<p class="lyrics-placeholder">Live FM broadcast — switch to a music track to view lyrics.</p>`; return; }
  status.textContent = "Searching..."; box.innerHTML = `<p class="lyrics-placeholder">Finding lyrics for "${track.title}"...</p>`;
  const t = cleanTrackName(track.title), a = cleanTrackName(track.artist);
  try {
    let res = await fetchWithTimeout(`https://lrclib.net/api/get?track_name=${encodeURIComponent(t)}&artist_name=${encodeURIComponent(a)}`, 4500);
    let data = res.ok ? await res.json() : null;
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      const s = await fetchWithTimeout(`https://lrclib.net/api/search?q=${encodeURIComponent(`${t} ${a}`)}`, 4500);
      data = s.ok ? (await s.json())[0] : null;
    }
    if (data?.syncedLyrics) {
      status.textContent = "Synced"; state.syncedLines = parseLrc(data.syncedLyrics); box.innerHTML = "";
      state.syncedLines.forEach((line) => {
        const p = document.createElement("p"); p.className = "lyric-line"; p.textContent = line.text;
        p.addEventListener("click", () => { if (audioPlayer.duration && isFinite(audioPlayer.duration)) audioPlayer.currentTime = line.time; });
        box.appendChild(p);
      });
      return;
    }
    if (data?.plainLyrics) { status.textContent = "Lyrics"; box.innerHTML = `<div class="lyric-plain">${data.plainLyrics}</div>`; return; }
    const ovh = await fetchWithTimeout(`https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`, 4500);
    if (ovh.ok) { const d = await ovh.json(); if (d.lyrics) { status.textContent = "Lyrics"; box.innerHTML = `<div class="lyric-plain">${d.lyrics}</div>`; return; } }
    status.textContent = "Unavailable"; box.innerHTML = `<p class="lyrics-placeholder">Lyrics aren’t indexed yet for "${track.title}".</p>`;
  } catch { status.textContent = "Offline"; box.innerHTML = `<p class="lyrics-placeholder">Could not load lyrics right now.</p>`; }
}

function updateActiveLyric(currentTime) {
  if (!state.syncedLines.length) return;
  let active = -1;
  for (let i = 0; i < state.syncedLines.length; i++) { if (currentTime >= state.syncedLines[i].time) active = i; else break; }
  if (active === state.activeLyricIdx) return;
  state.activeLyricIdx = active;
  const box = document.getElementById("tray-lyrics-box");
  const lines = box.querySelectorAll(".lyric-line");
  lines.forEach((el, idx) => el.classList.toggle("active-line", idx === active));
  if (active >= 0 && state.currentSlide === 2 && trayBackdrop.classList.contains("open") && lines[active]) {
    box.scrollTo({ top: Math.max(0, lines[active].offsetTop - box.clientHeight / 2 + lines[active].clientHeight / 2), behavior: "smooth" });
  }
}

/* Rendering */
function updateLikedCounter() { document.getElementById("liked-count").textContent = Object.keys(state.likedMap).length; }
function toggleLike(track, e) {
  if (e) e.stopPropagation();
  if (state.likedMap[track.id]) { delete state.likedMap[track.id]; showToast("Removed from Liked"); }
  else { state.likedMap[track.id] = track; showToast("Saved to Liked ♥"); }
  localStorage.setItem("muzikiglass_liked", JSON.stringify(state.likedMap));
  updateLikedCounter(); syncTrayDetails(); applyFiltersAndRender();
}
function matchesSearch(item, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  return item.title.toLowerCase().includes(s) || item.artist.toLowerCase().includes(s) || (item.genre || "").toLowerCase().includes(s);
}
function renderSpotlight(track) {
  if (!track) return;
  document.getElementById("spotlight-img").src = track.artwork;
  document.getElementById("spotlight-title").textContent = track.title;
  document.getElementById("spotlight-artist").textContent = `${track.artist} • ${track.releaseYear}`;
  document.getElementById("spotlight-region").textContent = track.isRadio ? "LIVE FM" : track.region === "uganda" ? "UGANDA" : "GLOBAL";
  document.getElementById("spotlight-play-btn").onclick = () => playItem(track, state.activeQueue);
}

const eqMarkup = `<span class="eq-mini" aria-hidden="true"><span></span><span></span><span></span></span>`;

function renderRadioSection() {
  const show = state.region === "all" || state.region === "radio";
  radioSection.classList.toggle("hidden", !show);
  if (!show) return;
  const stations = state.radioStations.filter((s) => matchesSearch(s, state.searchQuery.trim()));
  document.getElementById("radio-count").textContent = state.radioStations.length;
  radioGrid.innerHTML = "";
  const frag = document.createDocumentFragment();
  stations.forEach((st) => {
    const card = document.createElement("article");
    card.className = `radio-card${state.currentTrackId === st.id && state.isPlaying ? " playing" : ""}`;
    card.dataset.trackId = st.id;
    card.innerHTML = `<img class="radio-thumb" src="${st.artwork}" alt="${st.title}" loading="lazy" /><div class="radio-info"><div class="radio-title-row"><h3>${st.title}</h3>${eqMarkup}</div><p>${st.artist}</p></div><span class="freq-badge"><span class="live-dot"></span>${st.freqLabel || "LIVE"}</span>`;
    card.addEventListener("click", () => playItem(st, stations));
    frag.appendChild(card);
  });
  radioGrid.appendChild(frag);
}

function renderTracksSection() {
  const show = state.region !== "radio";
  tracksSection.classList.toggle("hidden", !show);
  if (!show) return;
  let list = state.region === "liked" ? Object.values(state.likedMap) : [...state.tracks];
  if (state.region === "uganda" || state.region === "global") list = list.filter((t) => t.region === state.region);
  list = list.filter((t) => matchesSearch(t, state.searchQuery.trim()));
  if (state.sortBy === "newest") list.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
  else if (state.sortBy === "title") list.sort((a, b) => a.title.localeCompare(b.title));
  else if (state.sortBy === "artist") list.sort((a, b) => a.artist.localeCompare(b.artist));

  state.filteredTracks = list;
  tracksGrid.innerHTML = "";
  if (!list.length) { tracksGrid.innerHTML = `<div class="track-card"><p style="font-size:0.85rem;color:var(--ink-secondary);">No tracks found here.</p></div>`; return; }

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
        <button class="card-like-btn ${isLiked ? "liked" : ""}" aria-label="Like ${track.title}">${isLiked ? "♥" : "♡"}</button>
        <button class="card-play-fab" aria-label="Play ${track.title}">${isPlayingThis ? "⏸" : "▶"}</button>
      </div>
      <div class="track-title-row"><h3 class="track-title" title="${track.title}">${track.title}</h3>${eqMarkup}</div>
      <p class="track-artist" title="${track.artist}">${track.artist}</p>
      <div class="track-footer"><span>${track.genre}</span><span>${track.releaseYear}</span></div>`;
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
  renderSpotlight(state.activeQueue[0] || state.radioStations[0]);
  [prevBtn, nextBtn, trayPrevBtn, trayNextBtn].forEach((b) => { b.disabled = state.activeQueue.length === 0; });
  renderTrayQueue();
}

function syncPlayingCardHighlight() {
  document.querySelectorAll("[data-track-id]").forEach((card) => {
    const isCurrent = card.dataset.trackId === state.currentTrackId && state.isPlaying;
    card.classList.toggle("playing", isCurrent);
    const fab = card.querySelector(".card-play-fab");
    if (fab) fab.textContent = isCurrent ? "⏸" : "▶";
  });
}

/* Playback */
function getCurrentTrack() {
  return state.activeQueue.find((t) => t.id === state.currentTrackId) || state.tracks.find((t) => t.id === state.currentTrackId) || state.radioStations.find((t) => t.id === state.currentTrackId) || null;
}

async function playItem(track, queueContext) {
  if (!track) return;
  if (queueContext) state.activeQueue = queueContext;

  if (state.currentTrackId === track.id && state.isPlaying && !track.ytVideoId) {
    audioPlayer.pause(); state.isPlaying = false; updatePlayerUI(); syncPlayingCardHighlight(); return;
  }

  state.currentTrackId = track.id;
  const hash = track.title.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  applyPalette(hash % ACCENT_PALETTES.length);

  document.getElementById("dock-img").src = track.artwork;
  document.getElementById("dock-title").textContent = track.title;
  document.getElementById("dock-artist").textContent = track.artist;

  if (!track.previewUrl && !track.ytVideoId && !track.isRadio) {
    const found = await fetchTrackBatch(`${track.title} ${track.artist}`, track.region);
    if (found[0]?.previewUrl) track.previewUrl = found[0].previewUrl;
  }

  if (track.ytVideoId) {
    audioPlayer.pause();
    trayYtIframe.src = `https://www.youtube.com/embed/${track.ytVideoId}?autoplay=1`;
    trayYtIframe.classList.remove("hidden"); trayArt.classList.add("hidden");
    state.isPlaying = true; openPickerTray();
  } else {
    trayYtIframe.src = ""; trayYtIframe.classList.add("hidden"); trayArt.classList.remove("hidden");
    if (track.previewUrl) {
      audioPlayer.src = track.previewUrl;
      audioPlayer.volume = state.volume;
      audioPlayer.play().then(() => { state.isPlaying = true; updatePlayerUI(); syncPlayingCardHighlight(); })
        .catch(() => { state.isPlaying = false; showToast("Stream unavailable — try another station or track"); updatePlayerUI(); syncPlayingCardHighlight(); });
    } else {
      state.isPlaying = false; showToast("Preview unavailable — open YT Music in tray");
    }
  }

  if (track.isRadio) {
    updateProgressVisual(1);
    ["current-time", "tray-current-time"].forEach((id) => (document.getElementById(id).textContent = "LIVE"));
    ["total-time", "tray-total-time"].forEach((id) => (document.getElementById(id).textContent = "FM"));
  } else {
    updateProgressVisual(0);
    ["current-time", "tray-current-time"].forEach((id) => (document.getElementById(id).textContent = "0:00"));
    ["total-time", "tray-total-time"].forEach((id) => (document.getElementById(id).textContent = "0:30"));
  }

  syncTrayDetails(); loadLyricsForTrack(track); updatePlayerUI(); syncPlayingCardHighlight(); renderTrayQueue();
}

function updatePlayerUI() {
  const label = state.isPlaying ? "Pause" : "Play";
  playPauseBtn.classList.toggle("is-playing", state.isPlaying);
  trayPlayBtn.classList.toggle("is-playing", state.isPlaying);
  playPauseBtn.setAttribute("aria-label", label); trayPlayBtn.setAttribute("aria-label", label);
  dockScrubber.classList.toggle("is-playing", state.isPlaying);
  trayScrubber.classList.toggle("is-playing", state.isPlaying);
  dockArtWrap.classList.toggle("spinning", state.isPlaying);
}

function togglePlayPause(e) {
  if (e) e.stopPropagation();
  const track = getCurrentTrack();
  if (!track && state.activeQueue.length) return playItem(state.activeQueue[0], state.activeQueue);
  if (state.isPlaying) { audioPlayer.pause(); state.isPlaying = false; }
  else if (audioPlayer.src) { audioPlayer.play().catch(() => {}); state.isPlaying = true; }
  updatePlayerUI(); syncPlayingCardHighlight();
}

function playNext(e) {
  if (e) e.stopPropagation();
  if (!state.activeQueue.length) return;
  const idx = state.activeQueue.findIndex((t) => t.id === state.currentTrackId);
  const next = state.shuffle ? Math.floor(Math.random() * state.activeQueue.length) : (idx + 1) % state.activeQueue.length;
  playItem(state.activeQueue[next], state.activeQueue);
}

function playPrev(e) {
  if (e) e.stopPropagation();
  if (!state.activeQueue.length) return;
  if (audioPlayer.currentTime > 3 && !getCurrentTrack()?.isRadio) { audioPlayer.currentTime = 0; return; }
  const idx = state.activeQueue.findIndex((t) => t.id === state.currentTrackId);
  playItem(state.activeQueue[(idx - 1 + state.activeQueue.length) % state.activeQueue.length], state.activeQueue);
}

repeatBtn.addEventListener("click", () => {
  const order = ["off", "all", "one"];
  state.repeatMode = order[(order.indexOf(state.repeatMode) + 1) % order.length];
  repeatBtn.classList.toggle("active-toggle", state.repeatMode !== "off");
  repeatOneBadge.classList.toggle("hidden", state.repeatMode !== "one");
  const labels = { off: "Repeat Off", all: "Repeat All", one: "Repeat One (Replay)" };
  repeatBtn.setAttribute("aria-label", labels[state.repeatMode]);
  showToast(labels[state.repeatMode]);
});

audioPlayer.addEventListener("timeupdate", () => {
  const track = getCurrentTrack();
  if (track?.isRadio) return;
  updateActiveLyric(audioPlayer.currentTime);
  if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return;
  updateProgressVisual(audioPlayer.currentTime / audioPlayer.duration);
  const cur = formatTime(audioPlayer.currentTime), tot = formatTime(audioPlayer.duration);
  document.getElementById("current-time").textContent = cur; document.getElementById("total-time").textContent = tot;
  document.getElementById("tray-current-time").textContent = cur; document.getElementById("tray-total-time").textContent = tot;
});

audioPlayer.addEventListener("ended", () => {
  if (state.repeatMode === "one") { audioPlayer.currentTime = 0; audioPlayer.play().catch(() => {}); }
  else if (state.repeatMode === "all" || state.activeQueue.length > 1) playNext();
  else { state.isPlaying = false; updatePlayerUI(); syncPlayingCardHighlight(); }
});

audioPlayer.addEventListener("error", () => {
  if (getCurrentTrack()?.isRadio && state.isPlaying) {
    state.isPlaying = false; updatePlayerUI(); syncPlayingCardHighlight();
    showToast("Station offline — try another FM stream");
  }
});

function formatTime(sec) { const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return `${m}:${s < 10 ? "0" : ""}${s}`; }

function syncTrayDetails() {
  const track = getCurrentTrack();
  if (!track) return;
  trayArt.src = track.artwork;
  document.getElementById("tray-title").textContent = track.title;
  document.getElementById("tray-artist").textContent = `${track.artist} • ${track.album}`;
  document.getElementById("tray-region-badge").textContent = track.isRadio ? "LIVE FM" : track.region === "uganda" ? "UGANDA" : "GLOBAL";
  document.getElementById("tray-year-badge").textContent = track.releaseYear;
  document.getElementById("tray-genre-badge").textContent = track.genre;
  const ytmUrl = track.ytVideoId ? `https://music.youtube.com/watch?v=${track.ytVideoId}` : `https://music.youtube.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`;
  document.getElementById("tray-ytm-link").href = ytmUrl;
  const likeBtn = document.getElementById("tray-like-btn");
  const isLiked = Boolean(state.likedMap[track.id]);
  likeBtn.textContent = isLiked ? "♥" : "♡"; likeBtn.classList.toggle("liked", isLiked);
  likeBtn.onclick = () => toggleLike(track);
  document.getElementById("tray-share-btn").onclick = async () => {
    const txt = `Listening to ${track.title} (${track.artist}) on MuzikiGlass`;
    if (navigator.share) navigator.share({ title: track.title, text: txt, url: ytmUrl }).catch(() => {});
    else if (navigator.clipboard) { await navigator.clipboard.writeText(`${txt} ${ytmUrl}`); showToast("Link copied"); }
  };
}

function renderTrayQueue() {
  const listEl = document.getElementById("tray-queue-list");
  document.getElementById("picker-count").textContent = `${state.activeQueue.length} items`;
  listEl.innerHTML = "";
  const frag = document.createDocumentFragment();
  state.activeQueue.slice(0, 75).forEach((track) => {
    const row = document.createElement("div");
    row.className = `queue-item${track.id === state.currentTrackId ? " active" : ""}`;
    row.innerHTML = `<img src="${track.artwork}" alt="${track.title}" loading="lazy" /><div class="queue-meta"><strong>${track.title}</strong><span>${track.artist}</span></div><span class="mono-time">${track.isRadio ? "FM" : track.region === "uganda" ? "UG" : "GLB"}</span>`;
    row.addEventListener("click", () => { playItem(track, state.activeQueue); goToTraySlide(0); });
    frag.appendChild(row);
  });
  listEl.appendChild(frag);
}

function goToTraySlide(slideIndex, { instant = false } = {}) {
  state.currentSlide = slideIndex;
  trayCarousel.scrollTo({ left: trayCarousel.clientWidth * slideIndex, behavior: instant ? "instant" : "smooth" });
  const dots = document.querySelectorAll(".tray-dot");
  dots.forEach((d) => d.classList.toggle("active", Number(d.dataset.slide) === slideIndex));
  positionGlassLens(document.getElementById("tray-segmented"), document.getElementById("tray-lens"), dots[slideIndex], !instant);
}

let slideScrollTimer = 0;
trayCarousel.addEventListener("scroll", () => {
  clearTimeout(slideScrollTimer);
  slideScrollTimer = setTimeout(() => {
    const idx = Math.round(trayCarousel.scrollLeft / (trayCarousel.clientWidth || 1));
    state.currentSlide = idx;
    const dots = document.querySelectorAll(".tray-dot");
    dots.forEach((d) => d.classList.toggle("active", Number(d.dataset.slide) === idx));
    positionGlassLens(document.getElementById("tray-segmented"), document.getElementById("tray-lens"), dots[idx], true);
  }, 60);
}, { passive: true });

document.querySelectorAll(".tray-dot").forEach((d) => d.addEventListener("click", () => goToTraySlide(Number(d.dataset.slide))));
document.querySelectorAll(".swipe-hint").forEach((h) => h.addEventListener("click", () => goToTraySlide(Number(h.dataset.go))));

function openPickerTray() {
  if (!getCurrentTrack() && state.activeQueue.length) { state.currentTrackId = state.activeQueue[0].id; syncTrayDetails(); }
  renderTrayQueue();
  trayBackdrop.classList.add("open"); trayBackdrop.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => goToTraySlide(0, { instant: true }));
}
function closePickerTray() { trayBackdrop.classList.remove("open"); trayBackdrop.setAttribute("aria-hidden", "true"); }

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
  state.shuffle = !state.shuffle; e.currentTarget.classList.toggle("active-toggle", state.shuffle);
  showToast(state.shuffle ? "Shuffle On" : "Shuffle Off");
});

/* Search, Filters & Modal */
document.getElementById("yt-api-btn").addEventListener("click", () => { document.getElementById("yt-api-key-input").value = state.ytApiKey; ytModalBackdrop.classList.add("open"); });
document.getElementById("yt-modal-close").addEventListener("click", () => ytModalBackdrop.classList.remove("open"));
ytModalBackdrop.addEventListener("click", (e) => { if (e.target === ytModalBackdrop) ytModalBackdrop.classList.remove("open"); });
document.getElementById("yt-save-btn").addEventListener("click", () => {
  const key = document.getElementById("yt-api-key-input").value.trim();
  if (!key) return showToast("Paste a valid YouTube API key");
  state.ytApiKey = key; localStorage.setItem("muzikiglass_yt_key", key); ytModalBackdrop.classList.remove("open");
  showToast("YouTube Music API Connected"); loadCharts();
});
document.getElementById("yt-clear-btn").addEventListener("click", () => {
  state.ytApiKey = ""; localStorage.removeItem("muzikiglass_yt_key"); ytModalBackdrop.classList.remove("open");
  showToast("Switched to free sync"); loadCharts();
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    positionGlassLens(document.getElementById("region-segmented"), document.getElementById("region-lens"), btn, true);
    state.region = btn.dataset.region;
    applyFiltersAndRender();
    if (state.region === "radio" && state.radioStations.length <= RELIABLE_RADIO.length) fetchLiveRadioStations();
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.genre = chip.dataset.genre; state.searchQuery = "";
    document.getElementById("search-input").value = "";
    if (state.region === "radio") {
      state.region = "songs";
      const songsBtn = document.querySelector('.seg-btn[data-region="songs"]');
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("active", b === songsBtn));
      positionGlassLens(document.getElementById("region-segmented"), document.getElementById("region-lens"), songsBtn, true);
    }
    loadCharts();
  });
});

document.getElementById("sort-select").addEventListener("change", (e) => { state.sortBy = e.target.value; renderTracksSection(); });
let searchDebounce = 0;
document.getElementById("search-input").addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => applyFiltersAndRender(), 120);
});
document.getElementById("search-form").addEventListener("submit", (e) => { e.preventDefault(); state.searchQuery = document.getElementById("search-input").value; loadCharts(); });
document.getElementById("refresh-btn").addEventListener("click", () => loadCharts());
document.getElementById("refresh-radio-btn").addEventListener("click", () => fetchLiveRadioStations().then(() => showToast("FM stations refreshed")));

/* Boot */
applyAppearance(state.theme);
setGreeting();
applyPalette(0);
setVolumeLevel(0.8);
updateLikedCounter();
applyFiltersAndRender();
requestAnimationFrame(syncAllLenses);
loadCharts();
fetchLiveRadioStations();
