/* ==========================================================================
   MUZIKIGLASS: Audio-Only Music Engine (Audius Full + Deezer + iTunes) & Country FM
   ========================================================================== */
const ACCENT_PALETTES = [
  { name: "Apple Crimson", primary: "#FA243C", secondary: "#FF6B4A", soft: "rgba(250, 36, 60, 0.14)" },
  { name: "Kampala Sunset", primary: "#FF6B2C", secondary: "#F59E0B", soft: "rgba(255, 107, 44, 0.15)" },
  { name: "Ocean Indigo", primary: "#2563EB", secondary: "#0EA5E9", soft: "rgba(37, 99, 235, 0.14)" },
  { name: "Nile Emerald", primary: "#059669", secondary: "#10B981", soft: "rgba(5, 150, 105, 0.14)" },
  { name: "Electric Plum", primary: "#9333EA", secondary: "#EC4899", soft: "rgba(147, 51, 234, 0.14)" },
];

const COUNTRY_CODES = ["UG", "KE", "TZ", "NG", "ZA", "GB", "US"];
const COUNTRY_NAMES = {
  UG: "🇺🇬 Uganda", KE: "🇰🇪 Kenya", TZ: "🇹🇿 Tanzania", NG: "🇳🇬 Nigeria",
  ZA: "🇿🇦 South Africa", GB: "🇬🇧 UK", US: "🇺🇸 USA", ALL: "🌍 All Countries",
};

const GENRE_QUERIES = {
  trending: { ug: ["Joshua Baraka", "Azawi", "Eddy Kenzo"], gl: ["Burna Boy", "Tyla", "Sabrina Carpenter"], audiusGenre: "" },
  ugaflow: { ug: ["Elijah Kitaka", "Fik Fameica", "Winnie Nwagi"], gl: ["Ayra Starr", "Rema", "Asake"], audiusGenre: "Afrobeats" },
  amapiano: { ug: ["Sheebah", "Spice Diana"], gl: ["Tyla", "Kabza De Small", "Uncle Waffles"], audiusGenre: "Electronic" },
  globalpop: { ug: ["Kenneth Mugabi", "Lydia Jazmine"], gl: ["Lady Gaga", "The Weeknd", "Ariana Grande"], audiusGenre: "Pop" },
  hiphop: { ug: ["Navio", "Gravity Omutujju", "Feffe Bussi"], gl: ["Kendrick Lamar", "Travis Scott", "Central Cee"], audiusGenre: "Hip-Hop/Rap" },
};

const GLOBAL_FALLBACK_RADIO = [
  { id: "rad-somafm-groove", title: "SomaFM Groove Salad", artist: "Ambient & Chill", album: "Live FM", genre: "Chill", region: "radio", country: "US", isRadio: true, freqLabel: "128 kbps", artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=75", streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3", fallbackUrl: "https://ice2.somafm.com/groovesalad-128-mp3", hls: 0, releaseYear: "LIVE" },
  { id: "rad-rp-main", title: "Radio Paradise Mix", artist: "World Eclectic", album: "Live FM", genre: "Mix", region: "radio", country: "US", isRadio: true, freqLabel: "128 kbps", artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&q=75", streamUrl: "https://stream.radioparadise.com/mp3-128", fallbackUrl: "https://stream.radioparadise.com/aac-128", hls: 0, releaseYear: "LIVE" },
];

const state = {
  tracks: [],
  radioByCountry: {},
  radioCountry: "UG",
  filteredTracks: [],
  activeQueue: [],
  likedMap: JSON.parse(localStorage.getItem("muzikiglass_liked") || "{}"),
  theme: localStorage.getItem("muzikiglass_appearance") || "light",
  glassAlpha: Number(localStorage.getItem("muzikiglass_glass_alpha") || 0.42),
  region: "all", genre: "trending", sortBy: "rank", searchQuery: "",
  currentTrackId: null, isPlaying: false, isPlayerExpanded: false,
  shuffle: false, repeatMode: "off",
  paletteIdx: 0, volume: 0.8, lastVolume: 0.8, isMuted: false, currentSlide: 0,
  syncedLines: [], activeLyricIdx: -1, lyricsOffset: 0,
  hlsInstance: null, radioStallTimer: 0, audiusHost: "",
};

const radioSection = document.getElementById("radio-section");
const tracksSection = document.getElementById("tracks-section");
const radioGrid = document.getElementById("radio-grid");
const tracksGrid = document.getElementById("tracks-grid");
const audioPlayer = document.getElementById("audio-player");
const playerDock = document.getElementById("player-dock");
const dockExpandBtn = document.getElementById("dock-expand-btn");
const trayBackdrop = document.getElementById("tray-backdrop");
const trayCarousel = document.getElementById("tray-carousel");
const trayDragBar = document.getElementById("tray-drag-bar");
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
const ytPlayerWrap = document.getElementById("yt-player-wrap");
const trayArt = document.getElementById("tray-art");
const dockScrubber = document.getElementById("dock-scrubber");
const trayScrubber = document.getElementById("tray-scrubber");
const volMuteBtn = document.getElementById("volume-mute-btn");
const volTrack = document.getElementById("custom-volume-track");
const volReadout = document.getElementById("volume-readout");
const appearanceBtn = document.getElementById("appearance-toggle-btn");
const glassModeBtn = document.getElementById("glass-mode-btn");
const glassSlider = document.getElementById("glass-alpha-slider");

// Never use crossOrigin on <audio> so MP3/Icecast/Audius streams play without CORS failures
audioPlayer.removeAttribute("crossorigin");
if (ytPlayerWrap) {
  ytPlayerWrap.classList.add("yt-inactive");
  ytPlayerWrap.classList.remove("yt-active");
}
if (trayArt) trayArt.classList.remove("yt-hidden");

/* ==========================================================================
   1. Tray Expansion, Glass Lenses & Dynamic Color
   ========================================================================== */
function setPlayerExpanded(expanded, initialSlide = 0) {
  state.isPlayerExpanded = Boolean(expanded);
  if (state.isPlayerExpanded) {
    if (!getCurrentTrack() && state.activeQueue.length) {
      state.currentTrackId = state.activeQueue[0].id;
      syncTrayDetails();
    }
    renderTrayQueue();
    trayBackdrop.classList.add("open");
    trayBackdrop.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => goToTraySlide(initialSlide, { instant: true }));
  } else {
    trayBackdrop.classList.remove("open");
    trayBackdrop.setAttribute("aria-hidden", "true");
  }
}

function positionGlassLens(container, lensEl, activeBtn, animateSwell = true) {
  if (!container || !lensEl || !activeBtn) return;
  lensEl.style.width = `${activeBtn.offsetWidth}px`;
  lensEl.style.setProperty("--lens-x", `${activeBtn.offsetLeft}px`);
  lensEl.style.transform = `translate3d(${activeBtn.offsetLeft}px, 0, 0)`;
  if (animateSwell) {
    lensEl.classList.add("is-sliding");
    clearTimeout(lensEl._t);
    lensEl._t = setTimeout(() => lensEl.classList.remove("is-sliding"), 190);
  }
}

function syncAllLenses() {
  positionGlassLens(document.getElementById("region-segmented"), document.getElementById("region-lens"), document.querySelector(".seg-btn.active"), false);
  positionGlassLens(document.getElementById("tray-segmented"), document.getElementById("tray-lens"), document.querySelector(".tray-dot.active"), false);
}
window.addEventListener("resize", syncAllLenses, { passive: true });

function applyAppearance(mode) {
  state.theme = mode === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("muzikiglass_appearance", state.theme);
  appearanceBtn.setAttribute("aria-checked", state.theme === "dark" ? "true" : "false");
}
appearanceBtn.addEventListener("click", () => applyAppearance(state.theme === "light" ? "dark" : "light"));

function applyGlassAlpha(alpha) {
  state.glassAlpha = Math.max(0.2, Math.min(0.82, alpha));
  document.documentElement.style.setProperty("--glass-alpha", state.glassAlpha.toFixed(2));
  localStorage.setItem("muzikiglass_glass_alpha", String(state.glassAlpha));
  glassSlider.value = String(Math.round(state.glassAlpha * 100));
  glassModeBtn.textContent = state.glassAlpha <= 0.55 ? "Clear" : "Tinted";
}
glassModeBtn.addEventListener("click", () => applyGlassAlpha(state.glassAlpha <= 0.55 ? 0.74 : 0.36));
glassSlider.addEventListener("input", (e) => applyGlassAlpha(Number(e.target.value) / 100));

function setGreeting() {
  const hr = new Date().getHours();
  document.getElementById("greeting-text").textContent = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
}

function applyAccentColor(primary, secondary, soft) {
  const r = document.documentElement;
  r.style.setProperty("--accent-color", primary);
  r.style.setProperty("--accent-secondary", secondary);
  r.style.setProperty("--accent-soft", soft);
}
function applyPalette(index) {
  state.paletteIdx = index % ACCENT_PALETTES.length;
  const p = ACCENT_PALETTES[state.paletteIdx];
  applyAccentColor(p.primary, p.secondary, p.soft);
}

function extractColorFromArtwork(imgUrl, fallbackTitle) {
  const hash = (fallbackTitle || "M").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const fb = ACCENT_PALETTES[hash % ACCENT_PALETTES.length];
  if (!imgUrl) return applyAccentColor(fb.primary, fb.secondary, fb.soft);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 16;
      const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, 16, 16);
      const data = ctx.getImageData(0, 0, 16, 16).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        const mx = Math.max(data[i], data[i+1], data[i+2]), mn = Math.min(data[i], data[i+1], data[i+2]);
        if (mx - mn > 28 && mx > 55 && mn < 225) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
      }
      if (n > 5) {
        r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
        applyAccentColor(`rgb(${r},${g},${b})`, `rgb(${Math.min(255,r+35)},${Math.min(255,g+25)},${Math.max(0,b-20)})`, `rgba(${r},${g},${b},0.15)`);
        return;
      }
    } catch {}
    applyAccentColor(fb.primary, fb.secondary, fb.soft);
  };
  img.onerror = () => applyAccentColor(fb.primary, fb.secondary, fb.soft);
  img.src = imgUrl;
}
document.getElementById("theme-cycle-btn").addEventListener("click", () => { applyPalette(state.paletteIdx + 1); showToast(`M3 Tone: ${ACCENT_PALETTES[state.paletteIdx].name}`); });

async function fetchWithTimeout(url, ms = 6500) {
  const ctrl = new AbortController(); const id = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); } finally { clearTimeout(id); }
}
function showToast(msg) {
  const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ==========================================================================
   2. Volume & Wavy Scrubber Controls
   ========================================================================== */
function setVolumeLevel(val, { saveNonZero = true } = {}) {
  const clamped = Math.max(0, Math.min(1, val));
  state.volume = clamped; state.isMuted = clamped === 0;
  if (saveNonZero && clamped > 0) state.lastVolume = clamped;
  audioPlayer.volume = clamped;
  const pct = Math.round(clamped * 100);
  volTrack.style.setProperty("--vol", clamped.toFixed(4));
  volReadout.textContent = `${pct}%`; volTrack.setAttribute("aria-valuenow", String(pct));
  volMuteBtn.classList.toggle("muted", state.isMuted);
  volMuteBtn.querySelector(".vol-wave-1").classList.toggle("hidden", state.isMuted);
  volMuteBtn.querySelector(".vol-wave-2").classList.toggle("hidden", state.isMuted || clamped < 0.48);
  volMuteBtn.querySelector(".vol-slash").classList.toggle("hidden", !state.isMuted);
  volMuteBtn.querySelector(".vol-slash-2").classList.toggle("hidden", !state.isMuted);
}

function bindGpuSlider(el, onRatio) {
  const handle = (e) => { const r = el.getBoundingClientRect(); onRatio(Math.max(0, Math.min(1, (e.clientX - r.left) / (r.width || 1)))); };
  el.addEventListener("pointerdown", (e) => { e.stopPropagation(); e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add("dragging"); handle(e); });
  el.addEventListener("pointermove", (e) => { if (el.classList.contains("dragging")) handle(e); });
  el.addEventListener("click", (e) => e.stopPropagation());
  const end = () => el.classList.remove("dragging");
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
}
bindGpuSlider(volTrack, (r) => setVolumeLevel(r));
volMuteBtn.addEventListener("click", () => {
  if (state.isMuted) setVolumeLevel(state.lastVolume > 0 ? state.lastVolume : 0.8);
  else { state.lastVolume = state.volume || 0.8; setVolumeLevel(0, { saveNonZero: false }); }
});

function updateProgressVisual(ratio) {
  const c = Math.max(0, Math.min(1, ratio)), clip = `${((1 - c) * 100).toFixed(2)}%`, pct = String(Math.round(c * 100));
  [dockScrubber, trayScrubber].forEach((s) => { s.style.setProperty("--prog", c.toFixed(4)); s.style.setProperty("--clip-right", clip); s.setAttribute("aria-valuenow", pct); });
}
function seekToTime(sec) {
  if (audioPlayer.duration && isFinite(audioPlayer.duration)) audioPlayer.currentTime = sec;
}
function seekToRatio(ratio) {
  updateProgressVisual(ratio);
  if (audioPlayer.duration && isFinite(audioPlayer.duration)) seekToTime(ratio * audioPlayer.duration);
}
bindGpuSlider(dockScrubber, seekToRatio);
bindGpuSlider(trayScrubber, seekToRatio);

/* ==========================================================================
   3. Audio-Only Music Fetchers (Audius Full Tracks + Deezer + iTunes)
   ========================================================================== */
function cleanTitle(raw) {
  return (raw || "")
    .replace(/(\(|\[)\s*(official\s*(music\s*)?(video|audio|lyric\s*video|visualizer)|lyrics|4k|hd|explicit)\s*(\)|\])/gi, "")
    .replace(/\s+/g, " ").trim();
}

async function getAudiusHost() {
  if (state.audiusHost) return state.audiusHost;
  try {
    const res = await fetchWithTimeout("https://api.audius.co", 4500);
    const json = await res.json();
    if (json?.data?.length) { state.audiusHost = json.data[0]; return state.audiusHost; }
  } catch {}
  return "https://discoveryprovider.audius.co";
}

function mapAudiusTrack(t, host, regionTag) {
  return {
    id: `aud-${t.id}`,
    title: cleanTitle(t.title),
    artist: t.user?.name || "Artist",
    album: t.mood || "Full Audio",
    genre: t.genre || "Music",
    region: regionTag,
    duration: t.duration || 180,
    artwork: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    streamUrl: `${host}/v1/tracks/${t.id}/stream?app_name=MuzikiGlass`,
    releaseDate: t.release_date || "2025-01-01",
    releaseYear: (t.release_date || "2025").slice(0, 4),
  };
}

async function fetchAudiusTrending(genre = "", regionTag = "global") {
  try {
    const host = await getAudiusHost();
    const gParam = genre ? `&genre=${encodeURIComponent(genre)}` : "";
    const res = await fetchWithTimeout(`${host}/v1/tracks/trending?limit=40${gParam}&app_name=MuzikiGlass`, 6000);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).filter((t) => t.id && t.title && t.duration >= 60 && t.duration <= 720).map((t) => mapAudiusTrack(t, host, regionTag));
  } catch { return []; }
}

async function fetchAudiusSearch(term, regionTag) {
  try {
    const host = await getAudiusHost();
    const res = await fetchWithTimeout(`${host}/v1/tracks/search?query=${encodeURIComponent(term)}&limit=12&app_name=MuzikiGlass`, 5500);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).filter((t) => t.id && t.title && t.duration >= 60 && t.duration <= 720).map((t) => mapAudiusTrack(t, host, regionTag));
  } catch { return []; }
}

function fetchDeezerJsonp(urlPath, regionTag) {
  return new Promise((resolve) => {
    const cb = `dzCb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); resolve([]); }, 5500);
    function cleanup() { clearTimeout(timer); delete window[cb]; script.remove(); }
    window[cb] = (res) => {
      cleanup();
      resolve((res?.data || []).filter((i) => i.preview && i.title).map((i) => ({
        id: `dz-${i.id}`,
        title: cleanTitle(i.title),
        artist: i.artist?.name || "Artist",
        album: i.album?.title || "Single",
        genre: "Chart Hit",
        region: regionTag,
        duration: i.duration || 180,
        artwork: i.album?.cover_big || i.album?.cover_medium || "",
        streamUrl: i.preview,
        releaseDate: "2025-01-01",
        releaseYear: "2025",
      })));
    };
    const sep = urlPath.includes("?") ? "&" : "?";
    script.src = `https://api.deezer.com/${urlPath}${sep}output=jsonp&callback=${cb}`;
    script.onerror = () => { cleanup(); resolve([]); };
    document.head.appendChild(script);
  });
}

async function fetchItunesAudio(term, regionTag) {
  try {
    const res = await fetchWithTimeout(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=10`, 5000);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .filter((i) => i.trackName && i.artworkUrl100 && i.previewUrl)
      .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
      .slice(0, 6)
      .map((i) => ({
        id: `it-${i.trackId}`,
        title: cleanTitle(i.trackName),
        artist: i.artistName,
        album: i.collectionName || "Single",
        genre: i.primaryGenreName || "Music",
        region: regionTag,
        duration: Math.round((i.trackTimeMillis || 180000) / 1000),
        artwork: i.artworkUrl100.replace("100x100bb", "600x600bb"),
        streamUrl: i.previewUrl,
        releaseDate: i.releaseDate || "2024-01-01",
        releaseYear: (i.releaseDate || "2025").slice(0, 4),
      }));
  } catch { return []; }
}

async function loadCharts() {
  const statusEl = document.getElementById("live-status-text");
  statusEl.textContent = "SYNCING AUDIO-ONLY CHARTS...";
  try {
    let fetched = [];
    const q = state.searchQuery.trim();

    if (q) {
      const results = await Promise.allSettled([
        fetchAudiusSearch(`${q} Uganda`, "uganda"),
        fetchAudiusSearch(q, "global"),
        fetchDeezerJsonp(`search?q=${encodeURIComponent(`${q} Uganda`)}&limit=10`, "uganda"),
        fetchDeezerJsonp(`search?q=${encodeURIComponent(q)}&limit=20`, "global"),
        fetchItunesAudio(`${q} Uganda`, "uganda"),
      ]);
      results.forEach((r) => { if (r.status === "fulfilled") fetched.push(...r.value); });
    } else {
      const preset = GENRE_QUERIES[state.genre] || GENRE_QUERIES.trending;
      const results = await Promise.allSettled([
        fetchAudiusTrending(preset.audiusGenre, "global"),
        fetchDeezerJsonp("chart/0/tracks?limit=60", "global"),
        ...preset.ug.map((a) => fetchDeezerJsonp(`search?q=${encodeURIComponent(a)}&limit=6`, "uganda")),
        ...preset.ug.slice(0, 2).map((a) => fetchItunesAudio(a, "uganda")),
        ...preset.gl.slice(0, 2).map((a) => fetchAudiusSearch(a, "global")),
      ]);
      results.forEach((r) => { if (r.status === "fulfilled") fetched.push(...r.value); });
    }

    const seen = new Set();
    const unique = fetched.filter((t) => {
      if (!t.streamUrl || !t.streamUrl.startsWith("https://")) return false;
      const key = `${t.title.toLowerCase()}_${t.artist.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length) {
      const ug = unique.filter((t) => t.region === "uganda");
      const gl = unique.filter((t) => t.region === "global");
      const mixed = [];
      for (let i = 0; i < Math.max(ug.length, gl.length); i++) {
        if (ug[i]) mixed.push(ug[i]);
        if (gl[i]) mixed.push(gl[i]);
      }
      state.tracks = mixed;
      statusEl.textContent = `AUDIO-ONLY CHARTS (${unique.length} TRACKS) • UGANDA & GLOBAL`;
    } else {
      statusEl.textContent = "NO AUDIO TRACKS LOADED • TAP SYNC";
    }
  } catch {
    statusEl.textContent = "SYNC ERROR • TAP REFRESH";
  }
  applyFiltersAndRender();
}

/* ==========================================================================
   4. Country-Categorized FM Radio + sessionStorage + HLS & Watchdog
   ========================================================================== */
async function fetchStationsByCountry(code) {
  if (state.radioByCountry[code]?.length) return state.radioByCountry[code];
  const cacheKey = `muzikiglass_fm_${code}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { const p = JSON.parse(cached); if (p.length) { state.radioByCountry[code] = p; return p; } }
  } catch {}

  const mirrors = ["https://de1.api.radio-browser.info", "https://all.api.radio-browser.info", "https://nl1.api.radio-browser.info"];
  for (const base of mirrors) {
    try {
      const res = await fetchWithTimeout(`${base}/json/stations/bycountrycodeexact/${code}?limit=60&order=clickcount&reverse=true&hidebroken=true`, 6000);
      if (!res.ok) continue;
      const data = await res.json();
      const seen = new Set();
      const mapped = data
        .filter((s) => s.url_resolved && s.url_resolved.startsWith("https://") && s.ssl_error === 0 && !seen.has(s.url_resolved) && seen.add(s.url_resolved))
        .map((s) => ({
          id: `rad-${s.stationuuid}`, title: (s.name || "FM Station").trim(),
          artist: `${s.state || COUNTRY_NAMES[code]} • ${(s.tags || "FM").split(",")[0] || "Radio"}`,
          album: "Live Broadcast", genre: (s.tags || "FM").split(",")[0] || "Radio",
          region: "radio", country: code, isRadio: true,
          hls: s.hls === 1 || s.url_resolved.includes(".m3u8") ? 1 : 0,
          freqLabel: `${s.bitrate || 128} kbps`,
          artwork: s.favicon && s.favicon.startsWith("https://") ? s.favicon : "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&q=75",
          streamUrl: s.url_resolved,
          fallbackUrl: s.url && s.url.startsWith("https://") && s.url !== s.url_resolved ? s.url : "",
          releaseYear: "LIVE",
        }));
      if (mapped.length) {
        state.radioByCountry[code] = mapped;
        try { sessionStorage.setItem(cacheKey, JSON.stringify(mapped)); } catch {}
        return mapped;
      }
    } catch {}
  }
  return code === "US" ? GLOBAL_FALLBACK_RADIO : [];
}

async function selectRadioCountry(code) {
  state.radioCountry = code;
  document.getElementById("radio-heading").textContent = `Live FM • ${COUNTRY_NAMES[code] || code}`;
  if (code === "ALL") {
    document.getElementById("radio-status").textContent = "Loading grouped stations by country...";
    await Promise.allSettled(COUNTRY_CODES.map((c) => fetchStationsByCountry(c)));
    const total = COUNTRY_CODES.reduce((sum, c) => sum + (state.radioByCountry[c]?.length || 0), 0);
    document.getElementById("radio-status").textContent = `${total} live stations grouped across ${COUNTRY_CODES.length} countries`;
    renderRadioSection();
    return;
  }
  document.getElementById("radio-status").textContent = `Tuning ${COUNTRY_NAMES[code]} stations...`;
  const stations = await fetchStationsByCountry(code);
  document.getElementById("radio-status").textContent = `${stations.length} live ${COUNTRY_NAMES[code]} streams`;
  if (code === "UG") { document.getElementById("radio-count").textContent = stations.length; syncAllLenses(); }
  renderRadioSection();
}

function playAudioUrl(item, urlToPlay, isRetry = false) {
  clearTimeout(state.radioStallTimer);
  if (state.hlsInstance) { state.hlsInstance.destroy(); state.hlsInstance = null; }
  audioPlayer.pause();
  audioPlayer.removeAttribute("crossorigin");

  const isHls = item.hls === 1 || urlToPlay.includes(".m3u8");
  if (isHls && window.Hls && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true });
    state.hlsInstance = hls;
    hls.loadSource(urlToPlay);
    hls.attachMedia(audioPlayer);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      audioPlayer.volume = state.volume;
      audioPlayer.play().catch(() => {});
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) handleAudioFailure(item, isRetry);
    });
  } else {
    audioPlayer.src = urlToPlay;
    audioPlayer.volume = state.volume;
    const p = audioPlayer.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        state.isPlaying = true;
        updatePlayerUI();
        syncPlayingCardHighlight();
      }).catch(() => {
        handleAudioFailure(item, isRetry);
      });
    }
  }

  state.isPlaying = true;
  if (item.isRadio) {
    state.radioStallTimer = setTimeout(() => {
      if (state.currentTrackId === item.id && audioPlayer.readyState < 3 && !audioPlayer.paused) {
        handleAudioFailure(item, isRetry);
      }
    }, 6000);
  }
}

function handleAudioFailure(item, isRetry) {
  clearTimeout(state.radioStallTimer);
  if (!isRetry && item.fallbackUrl) {
    playAudioUrl(item, item.fallbackUrl, true);
    return;
  }
  state.isPlaying = false;
  updatePlayerUI();
  syncPlayingCardHighlight();
  showToast(item.isRadio ? "Station offline — try another" : "Audio stream blocked — try another track");
}

/* ==========================================================================
   5. Timestamped LRC Lyrics Sync
   ========================================================================== */
function cleanTrackName(name) { return name.replace(/\(.*?\)|\[.*?\]/g, "").split("-")[0].split("feat")[0].trim(); }
function parseLrc(lrc) {
  const out = [];
  lrc.split("\n").forEach((raw) => {
    const m = raw.match(/\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)/);
    if (m && m[3].trim()) out.push({ time: Number(m[1]) * 60 + Number(m[2]), text: m[3].trim() });
  });
  return out.sort((a, b) => a.time - b.time);
}

async function loadLyricsForTrack(track) {
  const box = document.getElementById("tray-lyrics-box"), status = document.getElementById("lyrics-status");
  state.syncedLines = []; state.activeLyricIdx = -1;
  if (!track || track.isRadio) { status.textContent = "Live FM"; box.innerHTML = `<p class="lyrics-placeholder">Live FM broadcast — switch to a music track for synced lyrics.</p>`; return; }
  status.textContent = "Syncing..."; box.innerHTML = `<p class="lyrics-placeholder">Loading synced lyrics for "${track.title}"...</p>`;
  const t = cleanTrackName(track.title), a = cleanTrackName(track.artist), dur = track.duration ? `&duration=${Math.round(track.duration)}` : "";
  try {
    let res = await fetchWithTimeout(`https://lrclib.net/api/get?track_name=${encodeURIComponent(t)}&artist_name=${encodeURIComponent(a)}${dur}`, 4500);
    let data = res.ok ? await res.json() : null;
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      const s = await fetchWithTimeout(`https://lrclib.net/api/search?q=${encodeURIComponent(`${t} ${a}`)}`, 4500);
      data = s.ok ? (await s.json())[0] : null;
    }
    if (data?.syncedLyrics) {
      status.textContent = "LRC Synced"; state.syncedLines = parseLrc(data.syncedLyrics); box.innerHTML = "";
      state.syncedLines.forEach((line) => {
        const p = document.createElement("p"); p.className = "lyric-line"; p.textContent = line.text;
        p.addEventListener("click", () => seekToTime(line.time));
        box.appendChild(p);
      });
      return;
    }
    if (data?.plainLyrics) { status.textContent = "Plain"; box.innerHTML = `<div class="lyric-plain">${data.plainLyrics}</div>`; return; }
    status.textContent = "Unavailable"; box.innerHTML = `<p class="lyrics-placeholder">No lyrics indexed for "${track.title}".</p>`;
  } catch { status.textContent = "Offline"; box.innerHTML = `<p class="lyrics-placeholder">Could not load lyrics.</p>`; }
}

function updateActiveLyric(currentTime) {
  if (!state.syncedLines.length) return;
  const adjusted = currentTime + state.lyricsOffset;
  let active = -1;
  for (let i = 0; i < state.syncedLines.length; i++) { if (adjusted >= state.syncedLines[i].time) active = i; else break; }
  if (active === state.activeLyricIdx) return;
  state.activeLyricIdx = active;
  const box = document.getElementById("tray-lyrics-box"), lines = box.querySelectorAll(".lyric-line");
  lines.forEach((el, idx) => el.classList.toggle("active-line", idx === active));
  if (active >= 0 && state.currentSlide === 2 && state.isPlayerExpanded && lines[active]) {
    box.scrollTo({ top: Math.max(0, lines[active].offsetTop - box.clientHeight / 2 + lines[active].clientHeight / 2), behavior: "smooth" });
  }
}

document.getElementById("lyric-offset-minus").addEventListener("click", () => {
  state.lyricsOffset = Number((state.lyricsOffset - 0.5).toFixed(1));
  document.getElementById("lyric-offset-readout").textContent = `${state.lyricsOffset > 0 ? "+" : ""}${state.lyricsOffset.toFixed(1)}s`;
});
document.getElementById("lyric-offset-plus").addEventListener("click", () => {
  state.lyricsOffset = Number((state.lyricsOffset + 0.5).toFixed(1));
  document.getElementById("lyric-offset-readout").textContent = `${state.lyricsOffset > 0 ? "+" : ""}${state.lyricsOffset.toFixed(1)}s`;
});

/* ==========================================================================
   6. Rendering & Unified Audio-Only Playback Controller
   ========================================================================== */
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

function createRadioCard(st, queue) {
  const card = document.createElement("article");
  card.className = `radio-card${state.currentTrackId === st.id && state.isPlaying ? " playing" : ""}`;
  card.dataset.trackId = st.id;
  card.innerHTML = `<img class="radio-thumb" src="${st.artwork}" alt="${st.title}" loading="lazy" /><div class="radio-info"><div class="radio-title-row"><h3>${st.title}</h3>${eqMarkup}</div><p>${st.artist}</p></div><span class="freq-badge"><span class="live-dot"></span>${st.freqLabel || "LIVE"}</span>`;
  card.addEventListener("click", () => playItem(st, queue));
  return card;
}

function renderRadioSection() {
  const show = state.region === "all" || state.region === "radio";
  radioSection.classList.toggle("hidden", !show);
  if (!show) return;
  const q = state.searchQuery.trim();
  radioGrid.innerHTML = "";
  const frag = document.createDocumentFragment();

  if (state.radioCountry === "ALL") {
    const allList = [];
    COUNTRY_CODES.forEach((code) => {
      const stations = (state.radioByCountry[code] || []).filter((s) => matchesSearch(s, q));
      if (!stations.length) return;
      const header = document.createElement("div");
      header.className = "country-group-head";
      header.textContent = `${COUNTRY_NAMES[code]} (${stations.length})`;
      frag.appendChild(header);
      stations.forEach((st) => { allList.push(st); frag.appendChild(createRadioCard(st, allList)); });
    });
    radioGrid.appendChild(frag);
    return;
  }

  const stations = (state.radioByCountry[state.radioCountry] || []).filter((s) => matchesSearch(s, q));
  if (!stations.length) { radioGrid.innerHTML = `<div class="radio-card"><p>No HTTPS stations found for this filter.</p></div>`; return; }
  stations.forEach((st) => frag.appendChild(createRadioCard(st, stations)));
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
  if (!list.length) { tracksGrid.innerHTML = `<div class="track-card"><p style="font-size:0.85rem;color:var(--ink-secondary);">Loading playable audio tracks...</p></div>`; return; }
  const frag = document.createDocumentFragment();
  list.forEach((track, idx) => {
    const isPlayingThis = state.currentTrackId === track.id && state.isPlaying;
    const isLiked = Boolean(state.likedMap[track.id]);
    const card = document.createElement("article");
    card.className = `track-card${isPlayingThis ? " playing" : ""}`;
    card.dataset.trackId = track.id;
    card.innerHTML = `
      <div class="track-cover-wrap"><img src="${track.artwork}" alt="${track.title}" loading="lazy" /><span class="rank-badge">#${idx + 1}</span><span class="region-badge">${track.region === "uganda" ? "UG" : "GLB"}</span><button class="card-like-btn ${isLiked ? "liked" : ""}">${isLiked ? "♥" : "♡"}</button><button class="card-play-fab">${isPlayingThis ? "⏸" : "▶"}</button></div>
      <div class="track-title-row"><h3 class="track-title" title="${track.title}">${track.title}</h3>${eqMarkup}</div>
      <p class="track-artist" title="${track.artist}">${track.artist}</p>
      <div class="track-footer"><span>${track.genre}</span><span>${track.duration ? formatTime(track.duration) : track.releaseYear}</span></div>`;
    card.querySelector(".card-like-btn").addEventListener("click", (e) => toggleLike(track, e));
    card.addEventListener("click", () => playItem(track, list));
    frag.appendChild(card);
  });
  tracksGrid.appendChild(frag);
}

function applyFiltersAndRender() {
  renderRadioSection();
  renderTracksSection();
  const radioList = state.radioCountry === "ALL"
    ? COUNTRY_CODES.flatMap((c) => state.radioByCountry[c] || [])
    : (state.radioByCountry[state.radioCountry] || []);
  state.activeQueue = state.region === "radio" ? radioList : state.filteredTracks;
  renderSpotlight(state.activeQueue[0] || (state.radioByCountry.UG || GLOBAL_FALLBACK_RADIO)[0]);
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

function getCurrentTrack() {
  const allRadio = Object.values(state.radioByCountry).flat();
  return state.activeQueue.find((t) => t.id === state.currentTrackId) || state.tracks.find((t) => t.id === state.currentTrackId) || allRadio.find((t) => t.id === state.currentTrackId) || null;
}

function playItem(track, queueContext, forceNew = false) {
  if (!track) return;
  if (queueContext) state.activeQueue = queueContext;

  if (!forceNew && state.currentTrackId === track.id && state.isPlaying) { togglePlayPause(); return; }

  state.currentTrackId = track.id;
  extractColorFromArtwork(track.artwork, track.title);
  document.getElementById("dock-img").src = track.artwork;
  document.getElementById("dock-title").textContent = track.title;
  document.getElementById("dock-artist").textContent = track.artist;

  if (track.streamUrl) {
    playAudioUrl(track, track.streamUrl, false);
  } else {
    state.isPlaying = false;
    showToast("No audio URL for this item");
  }

  if (track.isRadio) {
    updateProgressVisual(1);
    syncTimeReadouts(0, 0, true);
  } else {
    updateProgressVisual(0);
    syncTimeReadouts(0, track.duration || 0, false);
  }

  syncTrayDetails();
  loadLyricsForTrack(track);
  updatePlayerUI();
  syncPlayingCardHighlight();
  renderTrayQueue();
}

function syncTimeReadouts(curSec, durSec, isLive = false) {
  const cur = isLive ? "LIVE" : formatTime(curSec), tot = isLive ? "FM" : formatTime(durSec);
  document.getElementById("current-time").textContent = cur; document.getElementById("total-time").textContent = tot;
  document.getElementById("tray-current-time").textContent = cur; document.getElementById("tray-total-time").textContent = tot;
}

function updatePlayerUI() {
  const label = state.isPlaying ? "Pause" : "Play";
  playPauseBtn.classList.toggle("is-playing", state.isPlaying); trayPlayBtn.classList.toggle("is-playing", state.isPlaying);
  playPauseBtn.setAttribute("aria-label", label); trayPlayBtn.setAttribute("aria-label", label);
  dockScrubber.classList.toggle("is-playing", state.isPlaying); trayScrubber.classList.toggle("is-playing", state.isPlaying);
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
  const next = state.shuffle ? Math.floor(Math.random() * state.activeQueue.length) : (idx + 1) % state.activeQueue.length;
  playItem(state.activeQueue[next], state.activeQueue, true);
}

function playPrev(e) {
  if (e) e.stopPropagation();
  if (!state.activeQueue.length) return;
  if (audioPlayer.currentTime > 3 && !getCurrentTrack()?.isRadio) { seekToTime(0); return; }
  const idx = state.activeQueue.findIndex((t) => t.id === state.currentTrackId);
  playItem(state.activeQueue[(idx - 1 + state.activeQueue.length) % state.activeQueue.length], state.activeQueue, true);
}

function handleTrackEnded() {
  if (state.repeatMode === "one") { seekToTime(0); audioPlayer.play().catch(() => {}); }
  else if (state.repeatMode === "all" || state.activeQueue.length > 1) playNext();
  else { state.isPlaying = false; updatePlayerUI(); syncPlayingCardHighlight(); }
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

audioPlayer.addEventListener("playing", () => clearTimeout(state.radioStallTimer));
audioPlayer.addEventListener("timeupdate", () => {
  if (getCurrentTrack()?.isRadio) return;
  updateActiveLyric(audioPlayer.currentTime);
  if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return;
  updateProgressVisual(audioPlayer.currentTime / audioPlayer.duration);
  syncTimeReadouts(audioPlayer.currentTime, audioPlayer.duration, false);
});
audioPlayer.addEventListener("ended", handleTrackEnded);
audioPlayer.addEventListener("error", () => {
  const cur = getCurrentTrack();
  if (cur && state.isPlaying) handleAudioFailure(cur, false);
});

function formatTime(sec) { const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return `${m}:${s < 10 ? "0" : ""}${s}`; }

function syncTrayDetails() {
  const track = getCurrentTrack();
  if (!track) return;
  trayArt.src = track.artwork;
  document.getElementById("tray-title").textContent = track.title;
  document.getElementById("tray-artist").textContent = `${track.artist} • ${track.album}`;
  document.getElementById("tray-region-badge").textContent = track.isRadio ? (COUNTRY_NAMES[track.country] || "LIVE FM") : track.region === "uganda" ? "UGANDA" : "GLOBAL";
  document.getElementById("tray-year-badge").textContent = track.duration && !track.isRadio ? formatTime(track.duration) : track.releaseYear;
  document.getElementById("tray-genre-badge").textContent = track.genre;
  const ytmUrl = `https://music.youtube.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`;
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
document.getElementById("tray-open-lyrics-btn").addEventListener("click", () => goToTraySlide(2));

[prevBtn, playPauseBtn, nextBtn].forEach((btn) => {
  btn.addEventListener("pointerdown", (e) => e.stopPropagation());
  btn.addEventListener("click", (e) => e.stopPropagation());
});
playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", playPrev);
nextBtn.addEventListener("click", playNext);

dockExpandBtn.addEventListener("click", (e) => { e.stopPropagation(); setPlayerExpanded(true, 0); });
playerDock.addEventListener("click", () => setPlayerExpanded(true, 0));

let dockTouchY = 0;
playerDock.addEventListener("touchstart", (e) => { dockTouchY = e.touches[0].clientY; }, { passive: true });
playerDock.addEventListener("touchend", (e) => { if (dockTouchY - e.changedTouches[0].clientY > 28) setPlayerExpanded(true, 0); }, { passive: true });

let trayTouchY = 0;
trayDragBar.addEventListener("touchstart", (e) => { trayTouchY = e.touches[0].clientY; }, { passive: true });
trayDragBar.addEventListener("touchend", (e) => { if (e.changedTouches[0].clientY - trayTouchY > 40) setPlayerExpanded(false); }, { passive: true });

document.getElementById("tray-close-btn").addEventListener("click", () => setPlayerExpanded(false));
trayBackdrop.addEventListener("click", (e) => { if (e.target === trayBackdrop) setPlayerExpanded(false); });
trayPlayBtn.addEventListener("click", togglePlayPause);
trayNextBtn.addEventListener("click", playNext);
trayPrevBtn.addEventListener("click", playPrev);
document.getElementById("tray-shuffle-btn").addEventListener("click", (e) => {
  state.shuffle = !state.shuffle; e.currentTarget.classList.toggle("active-toggle", state.shuffle);
  showToast(state.shuffle ? "Shuffle On" : "Shuffle Off");
});

document.querySelectorAll(".country-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".country-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    selectRadioCountry(pill.dataset.country);
  });
});

/* Audio-Only Mode Notice in API Modal */
const ytBtn = document.getElementById("yt-api-btn");
if (ytBtn) {
  ytBtn.textContent = "Audio Mode";
  ytBtn.addEventListener("click", () => showToast("Audio-Only Mode Active (No Music Videos)"));
}
if (ytModalBackdrop) {
  document.getElementById("yt-modal-close")?.addEventListener("click", () => ytModalBackdrop.classList.remove("open"));
}

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    positionGlassLens(document.getElementById("region-segmented"), document.getElementById("region-lens"), btn, true);
    state.region = btn.dataset.region;
    applyFiltersAndRender();
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
  state.searchQuery = e.target.value; clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => applyFiltersAndRender(), 120);
});
document.getElementById("search-form").addEventListener("submit", (e) => { e.preventDefault(); state.searchQuery = document.getElementById("search-input").value; loadCharts(); });
document.getElementById("refresh-btn").addEventListener("click", () => loadCharts());
document.getElementById("refresh-radio-btn").addEventListener("click", () => {
  try { sessionStorage.removeItem(`muzikiglass_fm_${state.radioCountry}`); } catch {}
  delete state.radioByCountry[state.radioCountry];
  selectRadioCountry(state.radioCountry).then(() => showToast("FM refreshed"));
});

/* Boot */
applyAppearance(state.theme);
applyGlassAlpha(state.glassAlpha);
setGreeting();
applyPalette(0);
setVolumeLevel(0.8);
updateLikedCounter();
applyFiltersAndRender();
requestAnimationFrame(syncAllLenses);
loadCharts();
selectRadioCountry("UG");
