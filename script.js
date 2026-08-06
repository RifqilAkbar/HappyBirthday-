/* ============================================================
   script.js — Birthday Surprise (Satu Halaman, 5 Section)
   Vanilla JavaScript (tanpa framework)
   Section:
     1. Countdown      (#landing)
     2. Birthday Cake  (#birthday)
     3. Birthday Letter(#letter)
     4. Memory Gallery (#gallery)
     5. Final Message  (#final)
   Musik diputar satu kali dan tetap berlanjut di semua section.
============================================================ */

'use strict';

/* ============================================================
   0. KONFIGURASI
=========================================================== */

// ⚠️ GANTI TANGGAL INI dengan hari ulang tahun yang dituju!
const BIRTHDAY_DATE = new Date('2026-08-07T00:00:00');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   1. AMBIL SEMUA ELEMEN PENTING
=========================================================== */
const el = {
  landing:  document.getElementById('landing'),
  birthday: document.getElementById('birthday'),
  letter:   document.getElementById('letter'),
  gallery:  document.getElementById('gallery'),
  final:    document.getElementById('final'),
  blackout: document.getElementById('blackout'),
  cakeWrap: document.querySelector('.cake-wrap'),
  cake:     document.getElementById('cake'),
  candles:  document.getElementById('candles'),
  message:  document.getElementById('message'),
  typeEl:   document.getElementById('type-text'),
  wish:     document.getElementById('wish'),
  openBtn:  document.getElementById('open-btn'),
  nextBtn:  document.getElementById('next-btn'),
  restartBtn: document.getElementById('restart-btn'),
  musicHint:  document.getElementById('music-hint'),
  revealBtn:  document.getElementById('reveal-btn'),
  landingHint: document.getElementById('landing-hint'),
  petalLayer: document.getElementById('petals'),
  balloonsLayer: document.getElementById('balloons'),
  heartsLayer:   document.getElementById('hearts'),
  sparklesLayer: document.getElementById('sparkles'),
  letterHeartsLayer:    document.getElementById('letter-hearts'),
  letterPetalsLayer:    document.getElementById('letter-petals'),
  letterSparklesLayer:  document.getElementById('letter-sparkles'),
  gTrack:    document.getElementById('track'),
  gViewport: document.getElementById('viewport'),
  gDots:     document.getElementById('dots'),
  gCounter:  document.getElementById('counter'),
  gCaption:  document.getElementById('caption'),
  gPrev:     document.getElementById('nav-prev'),
  gNext:     document.getElementById('nav-next'),
  gOverlay:  document.getElementById('final-overlay'),
  gFinalBtn: document.getElementById('final-btn'),
  galleryHearts:   document.getElementById('gallery-hearts'),
  galleryPetals:   document.getElementById('gallery-petals'),
  gallerySparkles: document.getElementById('gallery-sparkles'),
  finalHearts:   document.getElementById('final-hearts'),
  finalPetals:   document.getElementById('final-petals'),
  finalSparkles: document.getElementById('final-sparkles'),
};

let celebrating = false;

/* ============================================================
   2. PARTIKEL KECIL (canvas, latar halus di semua section)
=========================================================== */
const particles = (() => {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  const COLORS = ['rgba(255,255,255,', 'rgba(236,72,153,', 'rgba(232,121,249,', 'rgba(255,215,0,'];
  let w, h, list = [], raf = null;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class P {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.r = Math.random() * 2.2 + 0.4;
      this.sy = 0.05 + Math.random() * 0.2;
      this.sx = (Math.random() - 0.5) * 0.12;
      this.c = COLORS[(Math.random() * COLORS.length) | 0];
      this.a = Math.random() * 0.5 + 0.15;
      this.tw = Math.random() * Math.PI * 2;
    }
    update() {
      this.tw += 0.02;
      this.y -= this.sy;
      this.x += this.sx + Math.sin(this.tw) * 0.1;
      if (this.y < -10) {
        this.x = Math.random() * w;
        this.y = h + 10;
      }
    }
    draw() {
      const alpha = this.a * (0.6 + 0.4 * Math.sin(this.tw));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c + alpha + ')';
      ctx.fill();
    }
  }

  list = Array.from({ length: 90 }, () => new P());

  function loop() {
    ctx.clearRect(0, 0, w, h);
    for (const p of list) { p.update(); p.draw(); }
    raf = requestAnimationFrame(loop);
  }

  return {
    start() { if (!raf) loop(); },
    stop() { cancelAnimationFrame(raf); raf = null; },
  };
})();

/* ============================================================
   3. KELOPAK SAKURA BERJATUHAN (container bebas)
=========================================================== */
let petalTimer = null;

function spawnPetal(container) {
  const p = document.createElement('div');
  p.className = 'petal';
  const size = 12 + Math.random() * 12;
  p.style.width = size + 'px';
  p.style.height = size * 0.78 + 'px';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.setProperty('--sway', (Math.random() * 160 - 80) + 'px');
  p.style.setProperty('--rot', (Math.random() * 720 + 360) + 'deg');
  p.style.animationDuration = (7 + Math.random() * 6) + 's';
  p.style.animationDelay = (Math.random() * 4) + 's';
  container.appendChild(p);
  p.addEventListener('animationend', () => p.remove());
}

function startPetals() {
  for (let i = 0; i < 10; i++) spawnPetal(el.petalLayer);
  petalTimer = setInterval(() => {
    spawnPetal(el.petalLayer);
    if (Math.random() < 0.4) spawnPetal(el.petalLayer);
  }, 700);
}

/* ============================================================
   4. COUNTDOWN REALTIME
=========================================================== */
function pad(n) {
  return String(n).padStart(2, '0');
}

function setNum(id, val) {
  const box = document.getElementById(id);
  const v = pad(val);
  if (box.textContent !== v) {
    box.textContent = v;
    box.classList.remove('pop');
    void box.offsetWidth;
    box.classList.add('pop');
  }
}

function updateCountdown() {
  const diff = BIRTHDAY_DATE - new Date();

  // Waktu habis → berhenti, tampilkan tombol di halaman awal
  if (diff <= 0) {
    if (cdTimer) clearInterval(cdTimer);
    setNum('cd-days', 0);
    setNum('cd-hours', 0);
    setNum('cd-minutes', 0);
    setNum('cd-seconds', 0);
    el.revealBtn.classList.add('show');
    if (el.landingHint) el.landingHint.textContent = '✨ Kejutannya sudah siap... ✨';
    return;
  }

  setNum('cd-days', Math.floor(diff / 86400000));
  setNum('cd-hours', Math.floor(diff / 3600000) % 24);
  setNum('cd-minutes', Math.floor(diff / 60000) % 60);
  setNum('cd-seconds', Math.floor(diff / 1000) % 60);
}

let cdTimer = null;
updateCountdown();
cdTimer = setInterval(updateCountdown, 1000);

/* ============================================================
   5. LAGU LATAR — "Monokrom" oleh Tulus
   Prioritas:
   1) File lokal  → music.mp3 (letakkan di folder ini)
   2) Fallback    → YouTube embed (butuh internet)
=========================================================== */
const LOCAL_AUDIO = 'music.mp3';
const VIDEO_ID = 'CiHb0IKdK1Q';  // Monokrom - Tulus (fallback)
const SONG_START = 8;            // detik awal lagu (bagian lirik)

let audioSource = 'none';        // 'none' | 'local' | 'yt'
let localAudio = null;
let ytPlayer = null;
let ytReady = false;
let ytStarted = false;
let ytInitialized = false;       // player YouTube sudah dibuat
let soundRequested = false;
let hasInteracted = false;
let celebrationDone = false;

// --- Coba pakai file lokal dulu ---
function initLocalAudio() {
  localAudio = new Audio(LOCAL_AUDIO);
  localAudio.loop = true;
  localAudio.muted = true;
  localAudio.preload = 'auto';

  localAudio.addEventListener('loadedmetadata', () => {
    try { localAudio.currentTime = SONG_START; } catch (e) {}
    localAudio.play();
  });
  localAudio.addEventListener('canplay', () => {
    audioSource = 'local';
    if ((hasInteracted || soundRequested) && !ytStarted) setSound(true);
  });
  // Kalau file tidak ada → pakai YouTube
  localAudio.addEventListener('error', () => {
    console.warn('[Musik] music.mp3 tidak ditemukan, pakai YouTube');
    loadYtApi();
  });
}

// --- Muat YouTube IFrame API hanya saat dibutuhkan ---
function loadYtApi() {
  if (typeof YT !== 'undefined' && YT.Player) { initYtPlayer(); return; }
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  s.async = true;
  document.head.appendChild(s);
}

// --- Cadangan: pemutar YouTube (aman jika API belum dimuat) ---
function initYtPlayer() {
  if (ytInitialized) return;
  if (typeof YT === 'undefined' || !YT.Player) return;
  ytInitialized = true;
  ytPlayer = new YT.Player('yt-player', {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      playsinline: 1,
      loop: 1,
      playlist: VIDEO_ID,
      start: SONG_START,
    },
    events: {
      onReady() {
        ytReady = true;
        audioSource = 'yt';
        if ((hasInteracted || soundRequested) && !ytStarted) setSound(true);
      },
      onStateChange(e) {
        if (e.data === YT.PlayerState.ENDED && ytPlayer) ytPlayer.playVideo();
      },
    },
  });
}

window.onYouTubeIframeAPIReady = initYtPlayer;

let volTimer = null;

// Naikkan volume pelan-pelan dari `from` ke `to` (fade-in musik).
function fadeInVolume(from, to, ms) {
  if (volTimer) clearTimeout(volTimer);
  const t0 = performance.now();
  const step = () => {
    const t = Math.min((performance.now() - t0) / ms, 1);
    const v = from + (to - from) * (1 - Math.pow(1 - t, 3)); // easeOutCubic
    if (audioSource === 'local' && localAudio) localAudio.volume = v;
    else if (audioSource === 'yt' && ytReady && ytPlayer) ytPlayer.setVolume(v * 100);
    if (t < 1) volTimer = setTimeout(step, 80);
    else volTimer = null;
  };
  step();
}

// Nyalakan / matikan suara (untuk sumber mana pun yang aktif)
function setSound(on) {
  if (on) {
    let handled = false;
    if (audioSource === 'local' && localAudio) {
      localAudio.volume = 0.12;
      localAudio.muted = false;
      localAudio.play();
      fadeInVolume(0.12, 1, 4200);
      handled = true;
    } else if (audioSource === 'yt' && ytReady && ytPlayer) {
      ytPlayer.setVolume(12);
      ytPlayer.unMute();
      ytPlayer.playVideo();
      fadeInVolume(0.12, 1, 4200);
      handled = true;
    }
    if (handled) {
      ytStarted = true;
      soundRequested = false;
    } else {
      soundRequested = true;
    }
  } else {
    if (volTimer) { clearTimeout(volTimer); volTimer = null; }
    if (audioSource === 'local' && localAudio) {
      localAudio.muted = true;
    } else if (audioSource === 'yt' && ytPlayer) {
      ytPlayer.mute();
    }
    ytStarted = false;
    soundRequested = false;
  }
  el.musicHint.textContent = on ? '🔊 Musik' : '🔇 Musik';
  el.musicHint.classList.toggle('playing', on);
  persistMusicState();
}

// Simpan status & posisi lagu (aman jika nanti dibuka file lama)
function persistMusicState() {
  try {
    const st = { on: ytStarted };
    if (ytStarted) {
      if (audioSource === 'local' && localAudio) {
        st.time = localAudio.currentTime;
      } else if (audioSource === 'yt' && ytReady && ytPlayer) {
        const t = ytPlayer.getCurrentTime();
        if (typeof t === 'number') st.time = t;
      }
    }
    localStorage.setItem('hbdMusic', JSON.stringify(st));
  } catch (e) { /* abaikan (mis. mode penyamaran) */ }
}

setInterval(() => { if (ytStarted) persistMusicState(); }, 1000);
window.addEventListener('beforeunload', persistMusicState);

// Tandai interaksi pertama user, lalu nyalakan suara.
// (Kebijakan autoplay browser: suara hanya bisa menyala setelah user menyentuh/klik.)
function onGesture(e) {
  hasInteracted = true;
  if (e.target === el.musicHint || el.musicHint.contains(e.target)) return;
  if (!ytStarted) setSound(true);
}

document.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
document.addEventListener('keydown', onGesture, { capture: true, passive: true });

el.musicHint.addEventListener('click', () => {
  setSound(!el.musicHint.classList.contains('playing'));
});

initLocalAudio();

/* ============================================================
   6. MEMBANGUN KUE (drip, strawberry, lilin)
=========================================================== */
function buildCake() {
  const drips = document.getElementById('drips');
  const nDrip = 8;
  for (let i = 0; i < nDrip; i++) {
    const d = document.createElement('span');
    d.className = 'drip';
    d.style.left = (8 + i * (84 / (nDrip - 1))) + '%';
    d.style.width = (10 + Math.random() * 6) + 'px';
    d.style.height = (14 + Math.random() * 22) + 'px';
    drips.appendChild(d);
  }

  addStrawberries('strawberries-top', 5);
  addStrawberries('strawberries-mid', 7);

  const count = 5;
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'candle';
    c.style.left = count === 1
      ? '50%'
      : (10 + i * (80 / (count - 1))) + '%';
    c.innerHTML =
      '<div class="flame"><span class="core"></span></div>' +
      '<div class="wick"></div>' +
      '<div class="body"></div>';
    el.candles.appendChild(c);
  }
}

function addStrawberries(id, n) {
  const box = document.getElementById(id);
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'strawberry';
    s.style.left = (4 + Math.random() * 78) + '%';
    box.appendChild(s);
  }
}

/* ============================================================
   7. CONFETTI (canvas)
=========================================================== */
const confetti = {
  canvas: document.getElementById('confetti-canvas'),
  ctx: null,
  parts: [],
  active: false,
  raf: null,
  spawnT: null,
  colors: ['#ff6b9d', '#ffd166', '#7bdff2', '#c77dff', '#b8f2e6', '#ff9e5e', '#ffffff'],

  init() {
    this.ctx = this.canvas.getContext('2d');
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  },

  make() {
    return {
      x: Math.random() * this.canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: this.colors[(Math.random() * this.colors.length) | 0],
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
    };
  },

  ensureRunning() {
    if (!this.active) {
      this.active = true;
      this.init();
    }
    if (!this.raf) this.raf = requestAnimationFrame(() => this.render());
  },

  burst(n) {
    this.ensureRunning();
    for (let i = 0; i < n; i++) this.parts.push(this.make());
  },

  render() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.r += p.vr;
      if (p.y > this.canvas.height + 30) {
        this.parts.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.r);
      this.ctx.fillStyle = p.c;
      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
    this.raf = requestAnimationFrame(() => this.render());
  },

  start() {
    if (this.active) return;
    this.burst(80);
    this.spawnT = setInterval(() => this.burst(12), 1200);
    setTimeout(() => clearInterval(this.spawnT), 14000);
  },

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.spawnT) clearInterval(this.spawnT);
    this.spawnT = null;
    this.parts = [];
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.active = false;
  },
};

/* ============================================================
   8. BALON, HATI, DAN SPARKLE (container bebas)
=========================================================== */
let balloonTimer = null;
let heartTimer = null;

function makeBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  const colors = ['#ff6b9d', '#ffd166', '#7bdff2', '#c77dff', '#ff9e5e', '#b8f2e6'];
  b.style.setProperty('--c', colors[(Math.random() * colors.length) | 0]);
  b.style.left = (5 + Math.random() * 90) + 'vw';
  b.style.width = (34 + Math.random() * 22) + 'px';
  b.style.height = (46 + Math.random() * 28) + 'px';
  const dur = 7 + Math.random() * 5;
  b.style.animationDuration = dur + 's';
  b.innerHTML = '<span class="str"></span>';
  el.balloonsLayer.appendChild(b);
  setTimeout(() => b.remove(), (dur + 2) * 1000);
}

function startBalloons() {
  const spawn = () => {
    const n = 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < n; i++) makeBalloon();
  };
  spawn();
  balloonTimer = setInterval(spawn, 1400);
  setTimeout(() => { clearInterval(balloonTimer); balloonTimer = null; }, 30000);
}

// Hati melayang ke atas (container = lapisan FX halaman terkait)
function makeHeart(container) {
  const h = document.createElement('div');
  h.className = 'heart';
  const colors = ['#ff6b9d', '#ff8fb3', '#e05aa6', '#ff5d8f', '#f472b6'];
  h.style.setProperty('--hc', colors[(Math.random() * colors.length) | 0]);
  h.style.left = (5 + Math.random() * 90) + 'vw';
  h.style.width = (14 + Math.random() * 12) + 'px';
  h.style.height = (12 + Math.random() * 10) + 'px';
  h.style.animationDuration = (6 + Math.random() * 5) + 's';
  container.appendChild(h);
  setTimeout(() => h.remove(), 13000);
}

function startHearts() {
  heartTimer = setInterval(() => makeHeart(el.heartsLayer), 500);
  setTimeout(() => { clearInterval(heartTimer); heartTimer = null; }, 30000);
}

// Sparkle berkelip (container = lapisan FX halaman terkait)
function placeSparkles(container) {
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle star';
    s.style.left = (8 + Math.random() * 84) + 'vw';
    s.style.top = (18 + Math.random() * 60) + 'vh';
    s.style.animationDelay = (Math.random() * 2) + 's';
    s.style.animationDuration = (1.4 + Math.random() * 1.6) + 's';
    container.appendChild(s);
  }
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = (10 + Math.random() * 80) + 'vw';
    s.style.top = (15 + Math.random() * 70) + 'vh';
    s.style.animationDelay = (Math.random() * 2) + 's';
    container.appendChild(s);
  }
}

// Hentikan semua efek halaman birthday (hemat CPU saat pindah halaman)
function stopBirthdayFx() {
  confetti.stop();
  clearInterval(balloonTimer); balloonTimer = null;
  clearInterval(heartTimer); heartTimer = null;
}

/* ============================================================
   9. TYPING EFFECT "🎂 Happy Birthday 🎂"
=========================================================== */
function typeHappyBirthday() {
  setTimeout(() => el.message.classList.add('show'), 300);

  const full = Array.from('🎂 Happy Birthday 🎂');
  let i = 0;
  const iv = setInterval(() => {
    el.typeEl.textContent = full.slice(0, ++i).join('');
    if (i >= full.length) {
      clearInterval(iv);
      el.typeEl.classList.add('done');
      el.wish.classList.add('show');
      setTimeout(() => el.openBtn.classList.add('show'), 700);
    }
  }, 130);
}

/* ============================================================
   10. PERAYAAN UTAMA (setelah countdown habis)
=========================================================== */
function triggerCelebration() {
  if (celebrating) return;
  celebrating = true;

  clearInterval(cdTimer);
  clearInterval(petalTimer);
  particles.stop();

  // 1) Layar fade menjadi hitam selama 1 detik
  el.blackout.classList.add('show');

  setTimeout(() => {
    // 2) Pindah ke halaman birthday
    el.landing.classList.remove('active');
    el.birthday.classList.add('active');
    buildCake();
    placeSparkles(el.sparklesLayer);

    setTimeout(() => el.blackout.classList.remove('show'), 150);

    // 3) Kue muncul dari bawah layar
    requestAnimationFrame(() => el.cakeWrap.classList.add('in'));

    // 4) Perayaan dimulai → mulai lagu latar
    celebrationDone = true;
    if (!ytStarted) setSound(true);

    // 5) Lilin menyala satu per satu
    const candles = document.querySelectorAll('.candle');
    candles.forEach((c, i) => {
      setTimeout(() => c.classList.add('lit'), 1500 + i * 500);
    });

    // 6) Setelah semua lilin menyala → confetti, balon, hati, tulisan
    setTimeout(() => {
      confetti.burst(120);
      startBalloons();
      startHearts();
      typeHappyBirthday();
    }, 1500 + candles.length * 500 + 300);
  }, 1000);
}

/* ============================================================
   11. HALAMAN BIRTHDAY LETTER (surat digital premium)
=========================================================== */
let letterIO = null;
let letterHeartTimer = null;
let letterPetalTimer = null;

// Reveal paragraf/tombol satu per satu saat di-scroll
function initLetterReveal() {
  if (letterIO) letterIO.disconnect();

  // Stagger ~500ms per paragraf → terasa seperti membacakan surat
  const ps = el.letter.querySelectorAll('.letter-p');
  ps.forEach((p, i) => { p.style.transitionDelay = (0.5 + i * 0.5) + 's'; });

  const items = el.letter.querySelectorAll('.reveal');
  letterIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        letterIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((n) => letterIO.observe(n));
}

// Efek latar halaman surat: hati, kelopak, sparkle
function startLetterFx() {
  if (letterHeartTimer || letterPetalTimer) return;

  for (let i = 0; i < 6; i++) setTimeout(() => makeHeart(el.letterHeartsLayer), i * 400);
  for (let i = 0; i < 5; i++) spawnPetal(el.letterPetalsLayer);

  letterHeartTimer = setInterval(() => makeHeart(el.letterHeartsLayer), 1600);
  letterPetalTimer = setInterval(() => {
    spawnPetal(el.letterPetalsLayer);
    if (Math.random() < 0.4) spawnPetal(el.letterPetalsLayer);
  }, 1400);

  placeSparkles(el.letterSparklesLayer);
}

function stopLetterFx() {
  clearInterval(letterHeartTimer); letterHeartTimer = null;
  clearInterval(letterPetalTimer); letterPetalTimer = null;
}

// Pindah ke halaman surat
function goToLetter() {
  stopBirthdayFx();
  switchSection(el.letter, el.birthday, { fast: false });
  el.letter.scrollTop = 0;
  startLetterFx();
  initLetterReveal();

  // Efek cinematic: latar blur → fokus & kartu naik dari bawah
  el.letter.classList.remove('entered');
  requestAnimationFrame(() => {
    setTimeout(() => el.letter.classList.add('entered'), 60);
  });
}

/* ============================================================
   12. HALAMAN 4: MEMORY GALLERY (album perjalanan hidup)
=========================================================== */
const photos = [
  { image: 'assets/images/foto1.jpg', caption: 'Dari senyum kecil inilah semua cerita indah dimulai. ❤️' },
  { image: 'assets/images/foto2.jpg', caption: 'Sedikit demi sedikit kamu tumbuh menjadi pribadi yang luar biasa.' },
  { image: 'assets/images/foto3.jpg', caption: 'Setiap langkahmu selalu membawa cerita baru.' },
  { image: 'assets/images/foto4.jpg', caption: 'Waktu terus berjalan, tetapi senyummu tetap menjadi hal yang paling indah.' },
  { image: 'assets/images/foto5.jpg', caption: 'Semakin dewasa, semakin banyak mimpi yang ingin kamu wujudkan.' },
  { image: 'assets/images/foto6.jpg', caption: 'Terima kasih karena selalu menjadi dirimu sendiri.' },
  { image: 'assets/images/foto7.jpeg', caption: 'Aku bangga melihat sejauh ini kamu sudah bertumbuh.' },
  { image: 'assets/images/foto8.jpeg', caption: 'Dan hari ini... kamu genap berusia 20 tahun. Selamat ulang tahun, sayang. ❤️' },
];

let gIndex = 0;
let gLastReveal = -1;
let gHintHidden = false;
let gBuilt = false;
let gHeartTimer = null;
let gPetalTimer = null;

function buildSlides() {
  if (gBuilt) return;
  gBuilt = true;

  photos.forEach((p, i) => {
    const slide = document.createElement('figure');
    slide.className = 'slide';
    if (i === 0) slide.classList.add('active');

    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.style.setProperty('--tilt', (i % 2 === 0 ? -1.4 : 1.4) + 'deg');

    const img = document.createElement('img');
    img.src = p.image;
    img.alt = 'Kenangan ' + (i + 1);
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.draggable = false;
    img.addEventListener('error', () => {
      img.removeAttribute('src');
      img.style.backgroundImage = 'linear-gradient(135deg, #f9a8d4, #c77dff)';
    });

    frame.appendChild(img);
    slide.appendChild(frame);
    el.gTrack.appendChild(slide);
  });

  for (let i = 0; i < photos.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    el.gDots.appendChild(dot);
  }
}

function gUpdateActive() {
  Array.from(el.gTrack.children).forEach((s, i) => s.classList.toggle('active', i === gIndex));
  Array.from(el.gDots.children).forEach((d, i) => d.classList.toggle('active', i === gIndex));
  el.gCounter.textContent = (gIndex + 1) + ' / ' + photos.length;
}

function gShowCaption() {
  el.gCaption.textContent = photos[gIndex].caption;
  el.gCaption.classList.remove('fade-in');
  void el.gCaption.offsetWidth;
  el.gCaption.classList.add('fade-in');
}

function gGoTo(i) {
  const n = (i + photos.length) % photos.length;
  if (n === gIndex) return;
  gIndex = n;
  gHideSwipeHint();
  el.gTrack.style.transform = 'translateX(' + (-gIndex * 100) + '%)';
  gUpdateActive();
  gShowCaption();
  if (gIndex === photos.length - 1) onLastReveal();
}

function gHideSwipeHint() {
  if (gHintHidden) return;
  gHintHidden = true;
  const hint = document.getElementById('swipe-hint');
  if (!hint) return;
  hint.classList.add('hidden');
}

function gNext() { gGoTo(gIndex + 1); }
function gPrev() { gGoTo(gIndex - 1); }

function gCanSwipe(dx, dy) {
  return Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy);
}

(function bindSwipe() {
  let startX = 0;
  let startY = 0;
  let active = false;

  el.gViewport.addEventListener('pointerdown', (e) => {
    active = true;
    startX = e.clientX;
    startY = e.clientY;
    try { el.gViewport.setPointerCapture(e.pointerId); } catch (err) {}
  });

  el.gViewport.addEventListener('pointerup', (e) => {
    if (!active) return;
    active = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (gCanSwipe(dx, dy)) {
      if (dx < 0) gNext(); else gPrev();
    }
  });

  el.gViewport.addEventListener('pointercancel', () => { active = false; });
})();

el.gPrev.addEventListener('click', gPrev);
el.gNext.addEventListener('click', gNext);

// Kejutan terakhir (foto ke-8): confetti ±2 detik → overlay muncul
function onLastReveal() {
  if (gLastReveal >= 0) return;
  gLastReveal = gIndex;

  if (reducedMotion) {
    el.gOverlay.classList.add('show');
    return;
  }

  confetti.burst(80);
  let n = 0;
  const iv = setInterval(() => {
    if (++n >= 4) { clearInterval(iv); return; }
    confetti.burst(16);
  }, 450);

  setTimeout(() => {
    confetti.stop();
    el.gOverlay.classList.add('show');
  }, 2100);
}

// Dekorasi latar galeri
function gStartFx() {
  if (reducedMotion) {
    placeSparkles(el.gallerySparkles);
    return;
  }
  for (let i = 0; i < 6; i++) setTimeout(() => makeHeart(el.galleryHearts), i * 350);
  for (let i = 0; i < 5; i++) setTimeout(() => spawnPetal(el.galleryPetals), i * 250);
  gHeartTimer = setInterval(() => makeHeart(el.galleryHearts), 1600);
  gPetalTimer = setInterval(() => {
    spawnPetal(el.galleryPetals);
    if (Math.random() < 0.4) spawnPetal(el.galleryPetals);
  }, 1600);
  placeSparkles(el.gallerySparkles);
}

function gStopFx() {
  clearInterval(gHeartTimer); gHeartTimer = null;
  clearInterval(gPetalTimer); gPetalTimer = null;
}

// Pindah ke galeri (transisi cepat ±500ms)
function goToGallery() {
  stopLetterFx();
  switchSection(el.gallery, el.letter, { fast: true });

  // Reset galeri untuk kunjungan baru
  el.gallery.classList.remove('entered');
  el.gOverlay.classList.remove('show');
  gHintHidden = false;
  const hint = document.getElementById('swipe-hint');
  if (hint) hint.classList.remove('hidden');
  gLastReveal = -1;
  gIndex = 0;
  buildSlides();
  gUpdateActive();
  gShowCaption();
  gStartFx();

  requestAnimationFrame(() => {
    setTimeout(() => el.gallery.classList.add('entered'), 80);
  });
}

/* ============================================================
   13. HALAMAN 5: FINAL (pesan penutup yang emosional)
=========================================================== */
let finalHeartTimer = null;
let finalPetalTimer = null;

function finalConfetti() {
  if (reducedMotion) return;
  confetti.burst(80);
  let n = 0;
  const iv = setInterval(() => {
    if (++n >= 5) { clearInterval(iv); confetti.stop(); return; }
    confetti.burst(20);
  }, 420);
}

function startFinalFx() {
  for (let i = 0; i < 6; i++) setTimeout(() => makeHeart(el.finalHearts), i * 350);
  for (let i = 0; i < 5; i++) setTimeout(() => spawnPetal(el.finalPetals), i * 250);
  finalHeartTimer = setInterval(() => makeHeart(el.finalHearts), 1600);
  finalPetalTimer = setInterval(() => {
    spawnPetal(el.finalPetals);
    if (Math.random() < 0.4) spawnPetal(el.finalPetals);
  }, 1600);
  placeSparkles(el.finalSparkles);
}

function stopFinalFx() {
  clearInterval(finalHeartTimer); finalHeartTimer = null;
  clearInterval(finalPetalTimer); finalPetalTimer = null;
}

// Pindah ke halaman penutup (transisi cepat ±500ms)
function goToFinal() {
  gStopFx();
  switchSection(el.final, el.gallery, { fast: true });

  el.final.classList.remove('entered');
  startFinalFx();
  requestAnimationFrame(() => {
    setTimeout(() => el.final.classList.add('entered'), 80);
  });
  setTimeout(finalConfetti, 500);
}

/* ============================================================
   14. PERPINDAHAN SECTION (crossfade)
=========================================================== */
function switchSection(show, hide, opts) {
  opts = opts || {};
  const fast = opts.fast !== false;

  if (fast) {
    show.classList.add('fast');
    if (hide) hide.classList.add('fast');
  }
  if (hide) hide.classList.remove('active');
  show.classList.add('active');

  if (fast) {
    setTimeout(() => {
      show.classList.remove('fast');
      if (hide) hide.classList.remove('fast');
    }, 600);
  }
}

/* ============================================================
   15. TOMBOL NAVIGASI
=========================================================== */
// Tombol "Happy Birthday 🎂" (muncul saat jam 12) → mulai perayaan
el.revealBtn.addEventListener('click', () => {
  triggerCelebration();
});

// Tombol "Open Your Surprise" → halaman surat
el.openBtn.addEventListener('click', () => {
  goToLetter();
});

// Tombol "Next →" → galeri (transisi fade ±500ms)
el.nextBtn.addEventListener('click', () => {
  goToGallery();
});

// Tombol "💌 One Last Message" → halaman penutup
el.gFinalBtn.addEventListener('click', () => {
  goToFinal();
});

// Tombol "⟲ Putar Lagi dari Awal" → muat ulang halaman
el.restartBtn.addEventListener('click', () => {
  location.reload();
});

/* ============================================================
   16. PINTASAN DEMO / TESTING
   S → langsung ke perayaan (kue)
   L → langsung ke halaman surat
   G → langsung ke galeri
   F → langsung ke halaman penutup
=========================================================== */
document.addEventListener('keydown', (e) => {
  // Jangan ganggu kombinasi tombol sistem seperti Ctrl+S (save)
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 's' || e.key === 'S') triggerCelebration();
  if (e.key === 'l' || e.key === 'L') goToLetter();
  if (e.key === 'g' || e.key === 'G') goToGallery();
  if (e.key === 'f' || e.key === 'F') goToFinal();

  // Navigasi galeri dengan panah (hanya saat galeri aktif)
  if (el.gallery.classList.contains('active')) {
    if (e.key === 'ArrowRight') gNext();
    if (e.key === 'ArrowLeft') gPrev();
  }
});

/* ============================================================
   17. JALANKAN EFEK AWAL
=========================================================== */
particles.start();
startPetals();
