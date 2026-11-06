/*
 * ĐI BAR ONLINE — Sân khấu Nightclub / Vinahouse tương tác trực tiếp cho StudioLive.
 * Render 2× HiDPI (2160×3840) sắc nét, nằm gọn trong vùng an toàn TikTok (110..970 × 240..1440).
 *
 * - Người xem vừa vào phòng / thả tim / bình luận / tặng quà -> lập tức hóa thành nhân vật bước vào sàn nhảy.
 * - Thanh chào mừng neon trên đỉnh ("Hoàng Cường, MrBen và 2 người nữa vừa vào sàn") + MC đọc tên chào đón.
 * - Bình luận cụm từ (hoặc cấu hình riêng trong tab Đi Bar) -> nổ hiệu ứng:
 *   NHẢY 1 CÁI, CAMERA, ĐỔI NV, ĐI VÒNG, PHI CÔNG, GHÉP ĐÔI, NGỘ KHÔNG, VUA, DZÔ NÂNG LY, BASS DROP.
 * - Bục DJ trung tâm + Bảng vinh danh có cánh (Bá Chủ, Á Vương, Tam Hoàng, Bão Tim).
 * - Âm thanh sạch bản quyền (Beat House 128 BPM / Chill 110 BPM bằng WebAudio, nhạc MP3 riêng, hoặc tắt để phát nhạc ngoài).
 */
(() => {
  'use strict';

  const W = 1080;
  const H = 1920;
  let DPR = 1;
  const calcDpr = () => {
    const s = Math.min((window.innerWidth || W) / W, (window.innerHeight || H) / H);
    return s * (window.devicePixelRatio || 1) > 1.25 ? 2 : 1;
  };
  const FRAME_MS = 1000 / 30;
  const MAX_DANCERS = 96;
  const STORM_MS = 28 * 1000;

  const THEMES = {
    cyber: {
      bgTop: '#070414',
      bgMid: '#18062c',
      bgBot: '#090312',
      pri: '#ec4899',      // Hồng neon
      sec: '#06b6d4',      // Xanh cyan
      acc: '#fde047',      // Vàng sao
      beamA: '6, 182, 212',
      beamB: '236, 72, 153',
      beamC: '168, 85, 247',
      tileA: 'rgba(236, 72, 153, 0.34)',
      tileB: 'rgba(56, 189, 248, 0.28)'
    },
    vinahouse: {
      bgTop: '#140305',
      bgMid: '#2c0710',
      bgBot: '#0d0204',
      pri: '#ef4444',
      sec: '#f59e0b',
      acc: '#fef08a',
      beamA: '245, 158, 11',
      beamB: '239, 68, 68',
      beamC: '236, 72, 153',
      tileA: 'rgba(239, 68, 68, 0.36)',
      tileB: 'rgba(245, 158, 11, 0.30)'
    },
    galaxy: {
      bgTop: '#030617',
      bgMid: '#0f173d',
      bgBot: '#040714',
      pri: '#8b5cf6',
      sec: '#38bdf8',
      acc: '#f472b6',
      beamA: '56, 189, 248',
      beamB: '139, 92, 246',
      beamC: '244, 114, 182',
      tileA: 'rgba(139, 92, 246, 0.35)',
      tileB: 'rgba(56, 189, 248, 0.28)'
    },
    rooftop: {
      bgTop: '#021210',
      bgMid: '#072924',
      bgBot: '#030d0c',
      pri: '#10b981',
      sec: '#fbbf24',
      acc: '#38bdf8',
      beamA: '16, 185, 129',
      beamB: '251, 191, 36',
      beamC: '56, 189, 248',
      tileA: 'rgba(16, 185, 129, 0.32)',
      tileB: 'rgba(251, 191, 36, 0.26)'
    }
  };

  const BASE_SKINS = ['panda', 'pepe', 'doge', 'usagi', 'shin', 'pika', 'sponge', 'popcat', 'capy', 'maruko'];
  const SKINS = [...BASE_SKINS, 'wukong', 'king', 'pilot'];
  const SKIN_LABELS = {
    panda: '🐼 Gấu Trúc Bựa',
    pepe: '🐸 Ếch Xanh Pepe',
    doge: '🐶 Chó Shiba Doge',
    usagi: '🐰 Thỏ Usagi',
    shin: '🖍️ Shin Bút Chì',
    pika: '⚡ Pikachu Meme',
    sponge: '🧽 SpongeBob',
    popcat: '🐱 Mèo PopCat',
    capy: '🦫 Capybara Đội Cam',
    maruko: '🎀 Bé Hồng Meme',
    wukong: '🐵 Ngộ Không Đại Thánh',
    king: '👑 Hoàng Đế Meme',
    pilot: '🚀 Phi Công Tên Lửa'
  };

  const DIRECT_SKIN_MAP = [
    [/^(gau|gau truc|panda|meme|biaoqing)$/, 'panda'],
    [/^(pepe|ech|ech xanh|frog)$/, 'pepe'],
    [/^(doge|cheems|cho|shiba)$/, 'doge'],
    [/^(tho|usagi|chiikawa|tho trang)$/, 'usagi'],
    [/^(shin|but chi|shin but chi|crayon)$/, 'shin'],
    [/^(pika|pikachu|chuot dien)$/, 'pika'],
    [/^(sponge|spongebob|bot bien)$/, 'sponge'],
    [/^(meo|popcat|cat|capoo)$/, 'popcat'],
    [/^(capy|capybara|chuot lang)$/, 'capy'],
    [/^(maruko|be hong|loopy|banh beo)$/, 'maruko']
  ];

  const LEAVE_CHAT_RE = /^(bye|bai|pai|pp|tam biet|roi live|roi san|di ve|di ngu|nghi nha|out)(\b|!|\.|~|$)/;

  const FALLBACK_TRIGGERS = [
    { phrase: 'lên chính, lên sóng, tâm điểm, spotlight, ngôi sao, main, 🌟', effect: 'center' },
    { phrase: 'pháo hoa, bắn pháo, nổ pháo, chúc mừng, 🎆, 🎇', effect: 'fireworks' },
    { phrase: 'quẩy, nhảy, nhảy 1 cái, lên nóc, bung nóc, 💃', effect: 'jump' },
    { phrase: 'camera, quay tôi, lên hình, cận cảnh, 📷', effect: 'camera' },
    { phrase: 'đổi nv, đổi nhân vật, biến hình', effect: 'skin' },
    { phrase: 'đi vòng, chạy vòng, dạo sàn, 🏃', effect: 'parade' },
    { phrase: 'phi công, bay, tên lửa, 🚀', effect: 'pilot' },
    { phrase: 'ghép đôi, tìm người yêu, thả thính, 💞', effect: 'couple' },
    { phrase: 'ngộ không, tề thiên, 🐵', effect: 'wukong' },
    { phrase: 'vua, hoàng đế, bá chủ, 👑', effect: 'king' },
    { phrase: 'dzô, 123 dzô, nâng ly, cụng ly, bia, 🍻', effect: 'cheers' }
  ];

  const HYPE_LINES = [
    'Chúc bạn đêm nay quẩy hết mình, niềm vui nhân đôi nhé!',
    'Cảm ơn đại gia đã tiếp lửa cho cả sàn bùng nổ!',
    'Chúc bạn vạn sự rực rỡ, tiền vào như nước, lúc nào cũng vui tươi!',
    'Đêm nay sàn sáng nhất nhờ bạn, lên nhạc căng đét luôn!',
    'Chúc bạn luôn tràn đầy năng lượng và gặp thật nhiều may mắn!'
  ];

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  let cv, g, ui, sfx, cfg = {};
  let enabled = false;
  let pauseAt = 0;
  let pausedMs = 0;
  const clock = () => (pauseAt || performance.now()) - pausedMs;
  let last = 0;

  // ---------------- Vị trí đứng trên sàn nhảy (trải rộng thoáng từ y=975..1545 giống ảnh mẫu, tránh bảng menu phải) ----------------
  const SPOTS = buildDanceSpots();
  function buildDanceSpots() {
    const preset = [
      // Hàng tiền cảnh lớn, rõ mặt từng nhân vật Meme giống ảnh mẫu
      [320, 1525], [525, 1535], [695, 1495], [168, 1485],
      // Hàng trung cảnh dưới
      [425, 1365], [245, 1345], [615, 1355],
      // Hàng trung tâm sàn nhảy
      [335, 1205], [525, 1210], [435, 1065],
      // Mở rộng cho khách thứ 11..44
      [175, 1195], [695, 1200], [255, 1060], [615, 1065], [345, 975], [535, 975],
      [425, 1485], [240, 1555], [615, 1550], [160, 1350], [712, 1355], [430, 1245],
      [255, 1135], [615, 1135], [185, 1020], [700, 1020], [440, 965],  [235, 970],
      [645, 970],  [335, 1435], [525, 1435], [165, 1565], [715, 1565], [340, 1285],
      [520, 1285], [175, 1275], [705, 1275], [345, 1125], [520, 1125], [435, 1155],
      [245, 1425], [615, 1425], [265, 1235], [610, 1235]
    ];
    // Bổ sung thêm các vị trí đan xen cho phòng đông tới 96 dân chơi (không bao giờ tự đuổi khách cũ)
    while (preset.length < MAX_DANCERS) {
      const idx = preset.length;
      const col = idx % 8;
      const row = Math.floor((idx - 44) / 8);
      const x = clamp(162 + col * 79 + (row % 2 ? 32 : -12), 158, 736);
      const y = clamp(975 + ((row * 86) % 580), 965, 1560);
      preset.push([x, y]);
    }
    return preset.slice(0, MAX_DANCERS).map(([x, y], i) => ({ x, y, order: i, taken: null }));
  }

  const scaleAt = (y) => clamp(0.62 + (y - 950) * 0.00095, 0.58, 1.22);

  const dancers = new Map();
  const avatars = new Map();
  const particles = [];
  const fireworkRockets = [];
  const shockRings = [];
  const pyroFountains = [];
  const floorWaves = [];
  const co2Jets = [];
  const floaters = [];
  function pushFloater(text, x, y, dur = 2400, color = '#fde047') {
    const t = clock();
    let targetY = clamp(y, 880, 1140);
    for (const fl of floaters) {
      if (Math.abs(fl.y - targetY) < 42) targetY -= 44;
    }
    if (floaters.length >= 3) floaters.shift();
    floaters.push({ text, x: clamp(x, 250, 690), y: Math.max(820, targetY), t0: t, dur, color });
  }

  let spotlight = null;    // { p, until, mode: 'camera' | 'gift' }
  let centerStage = null;  // { p, comment, t0, until } — hiển thị người bình luận cú pháp lên chính!
  let coupleState = null;  // { a, b, until }
  let dropUntil = 0;
  let laserBoostUntil = 0;
  let stormUntil = 0;
  let lastStormFw = 0;
  let strobeUntil = 0;
  let liveViewers = 0;
  let liveConnected = false;
  let activeRoomId = '';
  let skinSeq = 0;

  let likeBase = -1;
  let liveLikes = 0;
  let bonusLikes = 0;
  const totalLikes = () => Math.max(0, liveLikes + bonusLikes);

  const zoom = { k: 1, x: W / 2, y: H / 2 };

  // ---------------- Trình phát Link Nhạc & Playlist Đi Bar (YouTube / SoundCloud / MP3 / MP4 / File máy) ----------------
  const mediaEl = document.createElement('video');
  mediaEl.playsInline = true;
  mediaEl.preload = 'auto';
  mediaEl.style.display = 'none';

  let musicIdx = 0;
  let wantMusicPlay = true;
  let lastTrackListKey = '';
  let curTrackKind = 'none'; // none | media | yt | sc
  let curMediaSrc = '';
  let duck = false;

  const ytIdOf = (u) => {
    const m = String(u || '').match(/(?:(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
    return m ? m[1] : '';
  };
  const ytStartOf = (u) => {
    const m = String(u || '').match(/[?&]t=(\d+)/);
    return m ? Number(m[1]) : 0;
  };
  const isSoundCloudUrl = (u) => /^https?:\/\/(?:www\.|m\.|on\.)?soundcloud\.com\//i.test(String(u || ''));

  let ytPlayer = null, ytReady = false, ytHost = null, curYtId = '';
  let scWidget = null, scReady = false, scHost = null, curScUrl = '';

  function barTracks() {
    if (Array.isArray(cfg.barMusicList) && cfg.barMusicList.length) {
      return cfg.barMusicList.filter((x) => typeof x === 'string' && x.trim());
    }
    return cfg.customBarMusic ? [String(cfg.customBarMusic).trim()] : [];
  }

  function ensureYouTubeApi(cb) {
    if (window.YT && window.YT.Player) return cb();
    ensureYouTubeApi.q = ensureYouTubeApi.q || [];
    ensureYouTubeApi.q.push(cb);
    if (ensureYouTubeApi.loading) return;
    ensureYouTubeApi.loading = true;
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      (ensureYouTubeApi.q || []).forEach((f) => f());
      ensureYouTubeApi.q = [];
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const sc = document.createElement('script');
      sc.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(sc);
    }
  }

  function ensureSoundCloudApi(cb) {
    if (window.SC && window.SC.Widget) return cb();
    ensureSoundCloudApi.q = ensureSoundCloudApi.q || [];
    ensureSoundCloudApi.q.push(cb);
    if (ensureSoundCloudApi.loading) return;
    ensureSoundCloudApi.loading = true;
    const sc = document.createElement('script');
    sc.src = 'https://w.soundcloud.com/player/api.js';
    sc.onload = () => {
      (ensureSoundCloudApi.q || []).forEach((f) => f());
      ensureSoundCloudApi.q = [];
    };
    document.head.appendChild(sc);
  }

  function getYtHost() {
    if (!ytHost) {
      ytHost = document.createElement('div');
      Object.assign(ytHost.style, {
        position: 'fixed', left: '-9999px', top: '-9999px',
        width: '240px', height: '135px', opacity: '0.001', pointerEvents: 'none'
      });
      const inner = document.createElement('div');
      inner.id = 'b-yt-player';
      ytHost.appendChild(inner);
      document.body.appendChild(ytHost);
    }
    return ytHost;
  }

  function getScHost() {
    if (!scHost) {
      scHost = document.createElement('iframe');
      scHost.allow = 'autoplay';
      Object.assign(scHost.style, {
        position: 'fixed', left: '-9999px', top: '-9999px',
        width: '240px', height: '135px', opacity: '0.001', pointerEvents: 'none', border: '0'
      });
      document.body.appendChild(scHost);
    }
    return scHost;
  }

  function stopAllCustomPlayers() {
    if (!mediaEl.paused) mediaEl.pause();
    if (ytPlayer && ytReady) { try { ytPlayer.pauseVideo(); } catch {} }
    if (scWidget && scReady) { try { scWidget.pause(); } catch {} }
  }

  function onTrackEnded() {
    const list = barTracks();
    if (!list.length) return;
    if (musicIdx + 1 < list.length) {
      loadBarTrack(musicIdx + 1, true);
    } else if (cfg.barMusicLoop !== false) {
      loadBarTrack(0, true);
    } else {
      wantMusicPlay = false;
      syncMusic();
    }
  }

  mediaEl.addEventListener('ended', onTrackEnded);
  mediaEl.addEventListener('error', () => {
    if (!enabled || (cfg.barSoundscape || 'house') !== 'custom') return;
    showFxToast('⚠️', 'Nhạc sàn', 'Không phát được link này — kiểm tra link trực tiếp hoặc dùng YouTube / SoundCloud');
    if (barTracks().length > 1) setTimeout(() => loadBarTrack(musicIdx + 1, true), 2200);
  });

  function loadBarTrack(idx, forceReload = false) {
    const list = barTracks();
    if (!list.length) {
      curTrackKind = 'none';
      curMediaSrc = '';
      curYtId = '';
      curScUrl = '';
      stopAllCustomPlayers();
      return;
    }
    musicIdx = ((idx % list.length) + list.length) % list.length;
    const raw = list[musicIdx];
    const yid = ytIdOf(raw);

    if (yid) {
      curTrackKind = 'yt';
      curMediaSrc = '';
      curScUrl = '';
      if (!mediaEl.paused) mediaEl.pause();
      if (scWidget && scReady) { try { scWidget.pause(); } catch {} }
      getYtHost();
      ensureYouTubeApi(() => {
        if (!ytPlayer) {
          curYtId = yid;
          ytPlayer = new window.YT.Player('b-yt-player', {
            width: 240, height: 135, videoId: yid,
            playerVars: {
              autoplay: 1, controls: 0, rel: 0, playsinline: 1,
              iv_load_policy: 3, disablekb: 1, fs: 0, start: ytStartOf(raw),
              origin: location.origin
            },
            events: {
              onReady: () => { ytReady = true; syncMusic(); },
              onStateChange: (e) => { if (e.data === 0) onTrackEnded(); },
              onError: (e) => {
                const code = e && e.data;
                const msg = (code === 101 || code === 150 || code === 153)
                  ? 'Video YouTube này bị chủ kênh chặn nhúng — hãy chọn bản Remix khác hoặc dùng SoundCloud/MP3'
                  : 'Không phát được link YouTube này';
                showFxToast('⚠️', 'Nhạc YouTube', msg);
                if (barTracks().length > 1) setTimeout(() => loadBarTrack(musicIdx + 1, true), 2800);
              }
            }
          });
        } else if (ytReady && (forceReload || curYtId !== yid)) {
          curYtId = yid;
          ytPlayer.loadVideoById({ videoId: yid, startSeconds: ytStartOf(raw) });
          syncMusic();
        } else {
          syncMusic();
        }
      });
      return;
    }

    if (isSoundCloudUrl(raw)) {
      curTrackKind = 'sc';
      curMediaSrc = '';
      curYtId = '';
      if (!mediaEl.paused) mediaEl.pause();
      if (ytPlayer && ytReady) { try { ytPlayer.pauseVideo(); } catch {} }
      const iframe = getScHost();
      ensureSoundCloudApi(() => {
        if (!scWidget) {
          curScUrl = raw;
          scReady = false;
          iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&auto_play=false&buying=false&sharing=false&show_artwork=false`;
          scWidget = window.SC.Widget(iframe);
          scWidget.bind(window.SC.Widget.Events.READY, () => {
            scReady = true;
            scWidget.bind(window.SC.Widget.Events.FINISH, onTrackEnded);
            syncMusic();
          });
          scWidget.bind(window.SC.Widget.Events.ERROR, () => {
            showFxToast('⚠️', 'SoundCloud', 'Không tải được link SoundCloud này');
            if (barTracks().length > 1) setTimeout(() => loadBarTrack(musicIdx + 1, true), 2500);
          });
        } else if (forceReload || curScUrl !== raw) {
          curScUrl = raw;
          scWidget.load(raw, { auto_play: false, buying: false, sharing: false, show_artwork: false, callback: () => syncMusic() });
        } else {
          syncMusic();
        }
      });
      return;
    }

    curTrackKind = 'media';
    curYtId = '';
    curScUrl = '';
    if (ytPlayer && ytReady) { try { ytPlayer.pauseVideo(); } catch {} }
    if (scWidget && scReady) { try { scWidget.pause(); } catch {} }
    const nextSrc = /^https?:\/\//i.test(raw)
      ? raw
      : (Array.isArray(cfg.barMusicList) && cfg.barMusicList.length
          ? `/barmusic/${musicIdx}?v=${encodeURIComponent(raw)}`
          : `/media/barmusic?v=${encodeURIComponent(raw)}`);
    if (forceReload || curMediaSrc !== nextSrc) {
      curMediaSrc = nextSrc;
      mediaEl.removeAttribute('crossorigin');
      mediaEl.src = nextSrc;
      mediaEl.currentTime = 0;
    }
    syncMusic();
  }

  function syncMusic() {
    const mode = cfg.barSoundscape || 'house';
    const list = barTracks();
    const muted = cfg.sound === false || Boolean(sfx?.muted());
    const wantCustom = enabled && !pauseAt && wantMusicPlay && mode === 'custom' && list.length > 0;
    const vol = clamp((cfg.volume ?? 0.7) * (cfg.barMusicVolume ?? 0.45) * (duck ? 0.30 : 1), 0, 1);

    if (!wantCustom) {
      stopAllCustomPlayers();
      return;
    }

    if (curTrackKind === 'none') {
      loadBarTrack(Number(cfg.barMusicIndex) || 0, false);
      return;
    }

    if (curTrackKind === 'yt') {
      if (!ytPlayer || !ytReady) return;
      try {
        if (muted) ytPlayer.mute();
        else { ytPlayer.unMute(); ytPlayer.setVolume(Math.round(vol * 100)); }
        const st = ytPlayer.getPlayerState();
        if (st !== 1 && st !== 3) ytPlayer.playVideo();
      } catch {}
      return;
    }

    if (curTrackKind === 'sc') {
      if (!scWidget || !scReady) return;
      try {
        scWidget.setVolume(muted ? 0 : Math.round(vol * 100));
        scWidget.isPaused((pausedState) => { if (pausedState) scWidget.play(); });
      } catch {}
      return;
    }

    if (curTrackKind === 'media') {
      mediaEl.muted = muted;
      mediaEl.volume = vol;
      if (mediaEl.paused && curMediaSrc) mediaEl.play().catch(() => {});
    }
  }

  // ---------------- Khởi tạo & Cấu hình ----------------
  function syncBarDpr() {
    if (!cv) return;
    const next = calcDpr();
    if (cv.width !== W * next || cv.height !== H * next || DPR !== next) {
      DPR = next;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      g = cv.getContext('2d', { alpha: false });
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
    }
  }

  function init(opts) {
    cv = opts.canvas;
    syncBarDpr();
    window.addEventListener('resize', syncBarDpr);
    ui = opts.ui;
    sfx = opts.sfx;
    last = clock();
    requestAnimationFrame(loop);
    setInterval(tick1s, 1000);
  }

  const clubName = () => (cfg.barName || '').trim() || 'Club Neon';
  const curTheme = () => THEMES[cfg.barTheme] || THEMES.cyber;
  const bpmOf = () => ((cfg.barSoundscape || 'house') === 'chill' ? 110 : 128);

  function setConfig(next) {
    cfg = next || {};
    enabled = cfg.mode === 'bar';
    cv.style.display = enabled ? 'block' : 'none';
    ui.root.style.display = enabled ? 'block' : 'none';
    updateLikeBar();
    syncMenuHints();

    const list = barTracks();
    const listKey = JSON.stringify(list);
    const listChanged = listKey !== lastTrackListKey;
    const wantedIdx = clamp(Number(cfg.barMusicIndex) || 0, 0, Math.max(0, list.length - 1));
    if (enabled && (cfg.barSoundscape || 'house') === 'custom') {
      if (listChanged || wantedIdx !== musicIdx || curTrackKind === 'none') {
        lastTrackListKey = listKey;
        wantMusicPlay = true;
        loadBarTrack(wantedIdx, listChanged);
      }
    }

    if (!enabled) {
      voice.stop();
      stopAllCustomPlayers();
      centerStage = null;
      fireworkRockets.length = 0;
      shockRings.length = 0;
      pyroFountains.length = 0;
      floorWaves.length = 0;
      if (ui.welcome) ui.welcome.classList.remove('on');
      if (ui.couple) ui.couple.classList.remove('on');
      if (ui.plate) ui.plate.classList.remove('on');
      if (ui.fxToast) ui.fxToast.classList.remove('on');
      if (ui.caption) ui.caption.classList.remove('on');
    }
    syncMusic();
  }

  function setPaused(p) {
    if (p && !pauseAt) pauseAt = performance.now();
    else if (!p && pauseAt) {
      pausedMs += performance.now() - pauseAt;
      pauseAt = 0;
      last = clock();
      requestAnimationFrame(loop);
    }
    if (p) voice.stop();
    syncMusic();
  }

  // ---------------- Quản lý Nhân vật vào sàn (Chỉ cần Comment là vào nhảy, Rời live mới mất) ----------------
  const ok = (im) => im && im.complete && im.naturalWidth > 0;

  function loadAvatar(url) {
    if (!url || !/^(https?:\/\/|data:image\/)/i.test(String(url))) return null;
    if (avatars.has(url)) return avatars.get(url);
    const img = new Image();
    if (/^https?:\/\//i.test(url)) img.referrerPolicy = 'no-referrer';
    img.src = url;
    avatars.set(url, img);
    return img;
  }

  const keyOf = (u) => String(u?.id || u?.uniqueId || u?.nickname || '');

  function cleanName(n) {
    let s = String(n || '').replace(/[\u0000-\u001f]/g, '').trim();
    const words = String(cfg.filterWords || '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    for (const w of words) if (s.toLowerCase().includes(w)) s = 'Dân chơi';
    return s.slice(0, 22) || 'Dân chơi';
  }

  function pickSpot() {
    const free = SPOTS.find((s) => !s.taken);
    if (free) return free;
    // Phòng cực đông > 96 người bình luận: tạo thêm vị trí động trên sàn để KHÔNG phải xoá người cũ
    return {
      x: Math.round(rnd(165, 728)),
      y: Math.round(rnd(975, 1555)),
      order: SPOTS.length,
      dynamic: true,
      taken: null
    };
  }

  function startLeave(p, msg = '👋 Tạm biệt!') {
    if (!p || p.mode === 'leave') return;
    if (p.spot && p.spot.taken === p) p.spot.taken = null;
    if (spotlight?.p === p) spotlight = null;
    if (centerStage?.p === p) centerStage = null;
    if (coupleState && (coupleState.a === p || coupleState.b === p)) {
      const other = coupleState.a === p ? coupleState.b : coupleState.a;
      if (other && other.mode === 'couple') {
        other.mode = 'dance';
        other.tx = other.spot.x;
        other.ty = other.spot.y;
      }
      coupleState = null;
      if (ui?.couple) ui.couple.classList.remove('on');
    }
    p.mode = 'leave';
    p.leaveAt = Date.now();
    p.tx = clamp(p.x, 200, 700);
    p.ty = 1710;
    p.bubble = { text: msg, until: clock() + 2600 };
    updateLikeBar();
  }

  function getDancer(user, create = true, opts = {}) {
    const k = keyOf(user);
    if (!k) return null;
    let p = dancers.get(k);
    // Nếu đang bước ra về mà bình luận lại -> quay lại sàn nhảy ngay!
    if (p && p.mode === 'leave' && create) {
      dancers.delete(k);
      p = null;
    }
    if (!p && create) {
      const spot = pickSpot();
      if (!spot) return null;
      const t = clock();
      const nextSkin = user?.skin || BASE_SKINS[(skinSeq++) % BASE_SKINS.length];
      p = {
        key: k,
        name: cleanName(user?.nickname || 'Dân chơi'),
        label: '',
        avatarUrl: user?.avatar || '',
        img: loadAvatar(user?.avatar),
        skin: nextSkin,
        hue: Math.floor(rnd(0, 360)),
        spot,
        x: clamp(spot.x + rnd(-55, 55), 165, 725),
        y: Math.min(1685, spot.y + 185),
        tx: spot.x,
        ty: spot.y,
        mode: 'enter', // enter | dance | parade | fly | couple | leave
        alpha: 1,
        demo: Boolean(opts.demo),
        paradeAngle: 0,
        paradeUntil: 0,
        flyT0: 0,
        flyDur: 0,
        flyFromX: 0,
        flyFromY: 0,
        flyToX: 0,
        jumpT0: t,
        cheersUntil: 0,
        glowUntil: t + 5000,
        bubble: null,
        phase: rnd(0, 6.28),
        flip: Math.random() < 0.45,
        points: 1,
        diamonds: 0,
        lastTrigAt: 0,
        joinedAt: Date.now(),
        active: Date.now()
      };
      spot.taken = p;
      dancers.set(k, p);
      onFirstEnter(p);
    }
    if (p && p.mode !== 'leave') {
      p.active = Date.now();
      if (opts.demo) p.demo = true;
      const nextName = user?.nickname ? cleanName(user.nickname) : '';
      if (nextName && nextName !== p.name) { p.name = nextName; p.label = ''; }
      if (user?.avatar && (!p.img || p.avatarUrl !== user.avatar)) {
        p.avatarUrl = user.avatar;
        p.img = loadAvatar(user.avatar);
      }
    }
    return p;
  }

  // ---------------- Chào mừng vào sàn (Top Capsule giống ảnh mẫu + MC giọng đọc) ----------------
  const welcomeBatch = [];
  const greetQ = [];
  let lastGreet = 0;
  let lastJoinPop = 0;

  function onFirstEnter(p) {
    if (!p || !enabled) return;
    queueWelcomeGreeting(p.name, p.img);
    spawnStars(p.x, p.y - 60, 12, curTheme().sec);
    updateLikeBar();
  }

  function queueWelcomeGreeting(rawName, avatarImg) {
    const name = cleanName(rawName || 'Dân chơi');
    if (!greetQ.includes(name)) {
      greetQ.push(name);
      if (greetQ.length > 30) greetQ.splice(0, greetQ.length - 30);
      setTimeout(greetTick, 850);
    }
    if (cfg.barWelcomeBanner !== false) showWelcomeCapsule({ name, img: avatarImg || null });
    const now = Date.now();
    if (now - lastJoinPop > 2600) {
      lastJoinPop = now;
      sfx?.play('pop');
    }
  }

  function showWelcomeCapsule(p) {
    if (!ui?.welcome) return;
    const now = Date.now();
    welcomeBatch.push({ p, at: now });
    while (welcomeBatch.length && now - welcomeBatch[0].at > 5500) welcomeBatch.shift();
    if (welcomeBatch.length > 12) welcomeBatch.splice(0, welcomeBatch.length - 12);

    const box = ui.welcome;
    const av = box.querySelector('.bw-av');
    const txt = box.querySelector('.bw-text');
    const latest = welcomeBatch[welcomeBatch.length - 1].p;

    av.replaceChildren();
    if (latest.img && ok(latest.img)) {
      const im = new Image();
      im.referrerPolicy = 'no-referrer';
      im.src = latest.img.src;
      av.appendChild(im);
    } else {
      av.textContent = (latest.name[0] || 'H').toUpperCase();
    }

    txt.replaceChildren();
    const b = document.createElement('b');
    if (welcomeBatch.length === 1) {
      b.textContent = latest.name;
      txt.append(b, ' vừa vào sàn');
    } else if (welcomeBatch.length === 2) {
      b.textContent = `${welcomeBatch[0].p.name}, ${latest.name}`;
      txt.append(b, ' vừa vào sàn');
    } else {
      b.textContent = `${welcomeBatch[0].p.name}, ${latest.name}`;
      txt.append(b, ` và ${welcomeBatch.length - 2} người nữa vừa vào sàn`);
    }

    box.classList.add('on');
    clearTimeout(showWelcomeCapsule.t);
    showWelcomeCapsule.t = setTimeout(() => box.classList.remove('on'), 5000);
  }

  function showFxToast(ico, name, desc) {
    if (!ui?.fxToast) return;
    const box = ui.fxToast;
    const icoEl = box.querySelector('.bft-ico');
    const txtEl = box.querySelector('.bft-text');
    if (icoEl) icoEl.textContent = ico;
    if (txtEl) {
      txtEl.replaceChildren();
      const b = document.createElement('b');
      b.textContent = name;
      txtEl.append(b, ' ' + desc);
    }
    box.classList.remove('on');
    void box.offsetWidth;
    box.classList.add('on');
    clearTimeout(showFxToast.t);
    showFxToast.t = setTimeout(() => box.classList.remove('on'), 3400);
  }

  // ---------------- MC Giọng đọc TTS ----------------
  const speakName = (n) => String(n || '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim() || 'bạn';

  const voice = {
    q: [], pq: [], busy: false, audio: null,
    say(text, priority) {
      if (!cfg.barVoice || !text) return;
      (priority ? this.pq : this.q).push(text);
      if (this.q.length > 6) this.q.splice(0, this.q.length - 6);
      if (this.pq.length > 14) this.pq.splice(0, this.pq.length - 14);
      this.next();
    },
    next() {
      if (this.busy || pauseAt || !enabled) return;
      const text = this.pq.shift() || this.q.shift();
      if (!text) return;
      this.busy = true;
      const done = () => {
        this.busy = false;
        this.audio = null;
        setDuck(false);
        setTimeout(() => this.next(), 380);
      };
      if (ui?.caption) {
        ui.caption.textContent = '🎤 ' + text;
        ui.caption.classList.add('on');
        clearTimeout(this.capT);
        this.capT = setTimeout(() => ui.caption.classList.remove('on'), Math.max(3800, text.length * 76));
      }
      if (sfx?.muted()) { setTimeout(done, Math.max(2200, text.length * 64)); return; }
      const rate = clamp(Number(cfg.barRate) || 1.05, 0.6, 1.3);
      const a = new Audio(`/api/tts?rate=${rate}&text=${encodeURIComponent(text)}`);
      a.volume = Math.min(1, (cfg.volume ?? 0.7) + 0.25);
      this.audio = a;
      setDuck(true);
      a.onended = done;
      a.onerror = () => this.fallback(text, rate, done);
      a.play().catch(() => this.fallback(text, rate, done));
    },
    fallback(text, rate, done) {
      const ss = window.speechSynthesis;
      const v = ss && ss.getVoices().find((x) => /^vi/i.test(x.lang));
      if (!v) { done(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.rate = rate;
      u.onend = done; u.onerror = done;
      ss.speak(u);
    },
    stop() {
      if (this.audio) { this.audio.pause(); this.audio = null; }
      window.speechSynthesis?.cancel();
      this.busy = false;
      setDuck(false);
    }
  };

  function setDuck(d) {
    duck = d;
    if (sfx) { sfx.duck(d); syncMusic(); }
  }

  function greetTick() {
    if (!cfg.barGreet || !greetQ.length || Date.now() - lastGreet < 5500) return;
    lastGreet = Date.now();
    const names = greetQ.splice(0, 3).map(speakName);
    const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' và ' + names.at(-1) : names[0];
    voice.say(`Chào mừng ${list} vừa vào sàn ${clubName()}, lên nhạc quẩy hết mình nào!`, false);
  }

  // ---------------- Cụm từ kích hoạt hiệu ứng & Bảng menu phải ----------------
  function activeRules() {
    return Array.isArray(cfg.barTriggers) && cfg.barTriggers.length ? cfg.barTriggers : FALLBACK_TRIGGERS;
  }

  const MENU_META = [
    { effect: 'center',    ico: '🌟', label: 'LÊN CHÍNH' },
    { effect: 'fireworks', ico: '🎆', label: 'PHÁO HOA' },
    { effect: 'camera',    ico: '📷', label: 'CAMERA' },
    { effect: 'skin',      ico: '🎭', label: 'ĐỔI NV' },
    { effect: 'jump',      ico: '💃', label: 'NHẢY 1 CÁI' },
    { effect: 'pilot',     ico: '🚀', label: 'PHI CÔNG' },
    { effect: 'couple',    ico: '💞', label: 'GHÉP ĐÔI' },
    { effect: 'wukong',    ico: '🐵', label: 'NGỘ KHÔNG' },
    { effect: 'king',      ico: '👑', label: 'VUA' }
  ];

  function syncMenuHints() {
    if (!ui?.menu) return;
    const rules = activeRules();
    const byEff = new Map();
    for (const r of rules) {
      if (r?.phrase && !byEff.has(r.effect)) {
        byEff.set(r.effect, r.phrase.split(',')[0].trim());
      }
    }
    ui.menu.replaceChildren(...MENU_META.map((m) => {
      const row = document.createElement('div');
      row.className = 'bm-item';
      const ico = document.createElement('span');
      ico.className = 'bm-ico';
      ico.textContent = m.ico;
      const body = document.createElement('div');
      body.className = 'bm-body';
      const title = document.createElement('div');
      title.className = 'bm-title';
      title.textContent = m.label;
      const sub = document.createElement('div');
      sub.className = 'bm-key';
      const hint = byEff.get(m.effect);
      sub.textContent = hint ? `gõ: ${hint.slice(0, 14)}` : m.label.toLowerCase();
      body.append(title, sub);
      row.append(ico, body);
      return row;
    }));
  }

  function parseDirectSkin(text) {
    const t = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const tn = norm(t);
    for (const [re, sk] of DIRECT_SKIN_MAP) {
      if (re.test(t) || re.test(tn)) return sk;
    }
    return null;
  }

  function matchBarTriggers(text) {
    const raw = String(text || '').toLowerCase().trim();
    if (!raw) return [];
    const nText = norm(raw);
    const hits = [];
    for (const r of activeRules()) {
      if (!r || typeof r.phrase !== 'string') continue;
      const tokens = r.phrase.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      for (const tok of tokens) {
        const nTok = norm(tok);
        if (raw.includes(tok) || (nTok.length >= 2 && nText.includes(nTok))) {
          if (!hits.includes(r.effect)) hits.push(r.effect);
          break;
        }
      }
    }
    return hits;
  }

  function triggerEffect(p, effect, isTest = false, rawText = '') {
    const now = Date.now();
    if (!isTest && now - (p.lastTrigAt || 0) < 1800) return;
    p.lastTrigAt = now;
    const t = clock();
    const th = curTheme();

    if (effect === 'center') {
      startCenterStage(p, rawText);
    } else if (effect === 'fireworks') {
      p.jumpT0 = t;
      p.glowUntil = t + 5500;
      spawnFireworkSalvo(7, 1350);
      fireStagePyro(t, 2800);
      spawnFloorWave(p.x, p.y, '#fde047');
      pushFloater('🎆 PHÁO HOA RỰC TRỜI!', p.x, p.y - 165, 2500, '#fde047');
      showFxToast('🎆', p.name, 'bắn đại tiệc pháo hoa rực sáng cả bầu trời!');
    } else if (effect === 'jump') {
      p.jumpT0 = t;
      p.glowUntil = t + 4000;
      spawnStars(p.x, p.y - 90, 20, th.acc);
      launchFirework(clamp(p.x + rnd(-90, 90), 170, 910), rnd(290, 520));
      sfx?.play('laserZap', 0.9);
      showFxToast('💃', p.name, 'bật nhảy bung nóc sàn!');
    } else if (effect === 'camera') {
      spotlight = { p, comment: rawText, t0: t, until: t + 5800, mode: 'camera' };
      p.jumpT0 = t;
      p.glowUntil = t + 6000;
      strobeUntil = t + 260;
      fireStagePyro(t, 1800);
      sfx?.play('laserZap', 1);
      showFxToast('📷', p.name, 'đang lên sóng cận cảnh CAMERA!');
    } else if (effect === 'skin') {
      const pool = BASE_SKINS.filter((s) => s !== p.skin);
      p.skin = pick(pool);
      p.jumpT0 = t;
      p.glowUntil = t + 4200;
      spawnStars(p.x, p.y - 80, 18, th.pri);
      sfx?.play('pop');
      showFxToast('✨', p.name, `biến hình thành ${SKIN_LABELS[p.skin] || 'Meme mới'}!`);
    } else if (effect === 'parade') {
      p.mode = 'parade';
      p.paradeUntil = t + 7500;
      p.paradeAngle = Math.atan2(p.y - 1150, p.x - 455);
      p.glowUntil = t + 7500;
      sfx?.play('airhorn', 0.75);
      showFxToast('🏃', p.name, 'đang đi bão một vòng quanh sàn!');
    } else if (effect === 'pilot') {
      p.skin = 'pilot';
      p.mode = 'fly';
      p.flyT0 = t;
      p.flyDur = 4600;
      const fromLeft = p.x < W / 2;
      p.flyFromX = fromLeft ? 150 : 880;
      p.flyToX = fromLeft ? 880 : 150;
      p.flyFromY = rnd(660, 820);
      p.glowUntil = t + 5500;
      fireCo2(t);
      spawnFireworkSalvo(3, 700);
      sfx?.play('co2Jet', 0.95);
      showFxToast('🚀', p.name, 'hóa Phi Công bay xuyên bầu trời sàn bar!');
    } else if (effect === 'couple') {
      startCouple(p);
    } else if (effect === 'wukong') {
      p.skin = 'wukong';
      p.jumpT0 = t;
      p.glowUntil = t + 7000;
      spawnStars(p.x, p.y - 95, 24, '#fbbf24');
      spawnFireworkSalvo(4, 800);
      pushFloater('⚡ ĐẠI THÁNH GIÁ LÂM!', p.x, p.y - 150, 2400, '#fde047');
      sfx?.play('coinBurst', 1);
      showFxToast('🐵', p.name, 'hóa Tề Thiên Đại Thánh đại náo sàn bar!');
    } else if (effect === 'king') {
      p.skin = 'king';
      p.jumpT0 = t;
      p.glowUntil = t + 8000;
      spawnStars(p.x, p.y - 100, 28, '#fde047');
      spawnFireworkSalvo(5, 1000);
      fireStagePyro(t, 2400);
      pushFloater('👑 HOÀNG ĐẾ LÊN NGÔI!', p.x, p.y - 155, 2600, '#fde047');
      sfx?.play('coinBurst', 1.1);
      showFxToast('👑', p.name, 'lên ngôi VUA SÀN ĐÊM NAY!');
    } else if (effect === 'cheers') {
      const all = [...dancers.values()];
      all.slice(0, 14).forEach((d) => { d.cheersUntil = t + 4200; });
      p.cheersUntil = t + 5000;
      fireStagePyro(t, 1600);
      pushFloater('🍻 1 · 2 · 3 DZÔÔÔ!', p.x, p.y - 145, 2400, '#fde047');
      sfx?.play('cheers', 1);
      showFxToast('🍻', p.name, 'nâng ly cụng bia cùng cả sàn: 1 2 3 DZÔ!');
    } else if (effect === 'drop') {
      triggerBassDrop(p.name);
    }
  }

  function startCenterStage(p, rawText = '') {
    if (!p) return;
    const t = clock();
    spotlight = null; // Trả góc máy toàn cảnh để thấy rõ cả Bảng Lên Chính, Bục Sao 3D & Pháo Hoa trên trời
    if (centerStage?.p && centerStage.p !== p && centerStage.p.mode === 'center') {
      const prev = centerStage.p;
      prev.mode = 'dance';
      prev.tx = prev.spot.x;
      prev.ty = prev.spot.y;
    }
    const stripped = String(rawText || '')
      .replace(/^\s*(lên\s*chính|len\s*chinh|lên\s*sóng|len\s*song|tâm\s*điểm|tam\s*diem|spotlight|main|ngôi\s*sao)\s*[:.,!\-–—]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 52);
    centerStage = {
      p,
      comment: stripped || 'Xin chào cả sàn! Đêm nay quẩy hết mình! 🌟',
      t0: t,
      until: t + 7200
    };
    p.mode = 'center';
    p.tx = 432;
    p.ty = 1605;
    p.flip = false;
    p.jumpT0 = t;
    p.glowUntil = t + 7600;
    laserBoostUntil = Math.max(laserBoostUntil, t + 7200);
    strobeUntil = t + 260;

    spawnFireworkSalvo(7, 1450);
    fireStagePyro(t, 3200);
    fireCo2(t);
    spawnFloorWave(432, 1605, '#fde047');
    spawnConfetti(55);
    sfx?.play('firework', 1);
    setTimeout(() => { if (enabled && !pauseAt) sfx?.play('airhorn', 0.85); }, 280);
    showFxToast('🌟', p.name, 'ĐANG LÊN SÓNG CHÍNH GIỮA TÂM ĐIỂM SÂN KHẤU!');
    voice.say(`Xin mời ngôi sao ${speakName(p.name)} bước lên tâm điểm sân khấu chính của ${clubName()}!`, false);
  }

  function startCouple(p) {
    const t = clock();
    const candidates = [...dancers.values()].filter((d) => d.key !== p.key && d.mode !== 'leave');
    let partner = candidates.length ? pick(candidates) : null;
    if (!partner) {
      // Nếu trên sàn mới có 1 mình người xem, gọi NPC Meme ra nhảy đôi cùng cho vui!
      const altSkin = p.skin === 'panda' ? 'maruko' : 'panda';
      partner = getDancer({ id: 'npc_crush', nickname: 'Crush Meme 💕', skin: altSkin }, true, { demo: true });
    }
    if (!partner) return;
    coupleState = { a: p, b: partner, t0: t, until: t + 7200 };
    p.mode = 'couple';
    partner.mode = 'couple';
    p.tx = 425; p.ty = 1095; p.flip = false;
    partner.tx = 535; partner.ty = 1095; partner.flip = true;
    p.glowUntil = t + 7500;
    partner.glowUntil = t + 7500;
    spawnHearts(480, 995, 22);
    sfx?.play('coinBurst', 1);

    if (ui?.couple) {
      const c = ui.couple;
      c.querySelector('.bc-names').textContent = `${p.name}  ❤️  ${partner.name}`;
      c.classList.remove('on');
      void c.offsetWidth;
      c.classList.add('on');
      clearTimeout(startCouple.t);
      startCouple.t = setTimeout(() => c.classList.remove('on'), 6800);
    }
    voice.say(`Chúc mừng ${speakName(p.name)} đã ghép đôi thành công cùng ${speakName(partner.name)} ngay giữa sàn ${clubName()}!`, false);
  }

  const FW_PALETTES = [
    ['#fde047', '#fffbeb', '#f97316'],
    ['#f472b6', '#22d3ee', '#fdf4ff'],
    ['#c084fc', '#a3e635', '#fef08a'],
    ['#fb7185', '#fbbf24', '#38bdf8']
  ];

  function launchFirework(x = rnd(165, 915), targetY = rnd(165, 465), palette = pick(FW_PALETTES)) {
    if (fireworkRockets.length > 24) return;
    fireworkRockets.push({
      x,
      y: 880,
      prevX: x,
      prevY: 880,
      vx: rnd(-1.6, 1.6),
      vy: -rnd(23.5, 29.5),
      targetY,
      palette
    });
  }

  function detonateFirework(x, y, palette = pick(FW_PALETTES)) {
    const [c1, c2, c3] = palette;
    shockRings.push({ x, y, r: 12, maxR: rnd(175, 265), color: c1, age: 0, life: 0.65 });
    shockRings.push({ x, y, r: 6, maxR: rnd(90, 145), color: '#ffffff', age: 0, life: 0.42 });
    strobeUntil = Math.max(strobeUntil, clock() + 120);
    sfx?.play('firework', 0.95);

    const outerN = particles.length > 620 ? 38 : 66;
    for (let i = 0; i < outerN; i++) {
      const ang = (i / outerN) * Math.PI * 2 + rnd(-0.05, 0.05);
      const sp = rnd(6.2, 13.5);
      const col = i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3);
      particles.push({
        kind: 'fwSpark',
        x, y, prevX: x, prevY: y,
        vx: Math.cos(aClamp(ang)) * sp,
        vy: Math.sin(aClamp(ang)) * sp,
        r: rnd(3.2, 5.6),
        drag: 0.962,
        grav: 0.13,
        age: 0,
        life: rnd(1.0, 1.7),
        color: col,
        twinkle: Math.random() < 0.55
      });
    }
    const innerN = particles.length > 660 ? 16 : 28;
    for (let i = 0; i < innerN; i++) {
      const ang = rnd(0, Math.PI * 2);
      const sp = rnd(2.2, 5.6);
      particles.push({
        kind: 'fwSpark',
        x, y, prevX: x, prevY: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        r: rnd(2.6, 4.4),
        drag: 0.95,
        grav: 0.1,
        age: 0,
        life: rnd(0.75, 1.25),
        color: '#ffffff',
        twinkle: true
      });
    }
  }
  const aClamp = (a) => a;

  function spawnFireworkSalvo(count = 6, spanMs = 1400) {
    // Nổ liên hoàn trên bầu trời đêm + phóng các quả đạn pháo hoa bay vút từ sân khấu lên!
    detonateFirework(rnd(210, 440), rnd(175, 360), FW_PALETTES[0]);
    if (count >= 2) {
      setTimeout(() => {
        if (enabled && !pauseAt) detonateFirework(rnd(640, 870), rnd(170, 355), FW_PALETTES[1]);
      }, 180);
    }
    if (count >= 4) {
      setTimeout(() => {
        if (enabled && !pauseAt) detonateFirework(rnd(390, 690), rnd(155, 320), FW_PALETTES[3]);
      }, 420);
    }
    const launchCount = Math.max(1, count - 1);
    for (let i = 0; i < launchCount; i++) {
      const delay = Math.round((i / Math.max(1, launchCount - 1)) * spanMs);
      setTimeout(() => {
        if (!enabled || pauseAt) return;
        const laneX = 165 + ((i * 197 + Math.round(rnd(-45, 45))) % 750);
        launchFirework(clamp(laneX, 155, 925), rnd(165, 455), FW_PALETTES[i % FW_PALETTES.length]);
      }, delay);
    }
  }

  function fireStagePyro(t, dur = 2600) {
    const nozzles = [195, 368, 712, 885];
    pyroFountains.length = 0;
    for (const nx of nozzles) {
      pyroFountains.push({ x: nx, y: 870, t0: t, dur });
    }
  }

  function spawnFloorWave(x, y, color = '#fde047') {
    floorWaves.push({ x, y, r: 24, maxR: 380, color, age: 0, life: 0.85 });
    floorWaves.push({ x, y, r: 10, maxR: 250, color: '#22d3ee', age: -0.14, life: 0.78 });
  }

  function triggerBassDrop(byName = '') {
    const t = clock();
    dropUntil = t + 6500;
    laserBoostUntil = t + 8500;
    strobeUntil = t + 450;
    fireCo2(t);
    fireStagePyro(t, 3200);
    spawnFireworkSalvo(8, 1600);
    spawnFloorWave(540, 1180, '#fde047');
    for (const d of dancers.values()) {
      d.jumpT0 = t + rnd(0, 320);
      d.glowUntil = Math.max(d.glowUntil || 0, t + 5500);
    }
    spawnConfetti(70);
    spawnStars(540, 820, 42, '#fde047');
    sfx?.play('bassDrop', 1);
    setTimeout(() => { if (enabled && !pauseAt) sfx?.play('airhorn', 0.85); }, 320);
    showFxToast('🔥', byName || clubName(), 'KÍCH HOẠT BASS DROP & ĐẠI TIỆC PHÁO HOA!');
  }

  function fireCo2(t) {
    co2Jets.push({ x: 190, y: 870, dir: -0.28, t0: t, dur: 1750 });
    co2Jets.push({ x: 356, y: 868, dir: -0.16, t0: t, dur: 1850 });
    co2Jets.push({ x: 724, y: 868, dir: 0.16, t0: t, dur: 1850 });
    co2Jets.push({ x: 890, y: 870, dir: 0.28, t0: t, dur: 1750 });
  }

  function spawnStars(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), sp = rnd(2.2, 7.5);
      particles.push({
        kind: 'star', x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2.4,
        r: rnd(4, 8.5),
        rot: rnd(0, 6.28),
        age: 0,
        life: rnd(0.65, 1.35),
        color
      });
    }
  }

  function spawnHearts(x, y, n) {
    for (let i = 0; i < n; i++) {
      particles.push({
        kind: 'heart',
        x: x + rnd(-65, 65),
        y: y + rnd(-20, 30),
        vx: rnd(-1.4, 1.4),
        vy: rnd(-4.2, -1.8),
        r: rnd(16, 28),
        age: 0,
        life: rnd(1.2, 2.2),
        color: '#fb7185'
      });
    }
  }

  function spawnConfetti(n) {
    const colors = ['#ec4899', '#06b6d4', '#fde047', '#a855f7', '#34d399', '#fb7185'];
    for (let i = 0; i < n; i++) {
      particles.push({
        kind: 'confetti',
        x: rnd(115, 965),
        y: rnd(220, 360),
        vx: rnd(-2.2, 2.2),
        vy: rnd(2.4, 5.4),
        r: rnd(5, 10),
        rot: rnd(0, 6.28),
        age: 0,
        life: rnd(2.2, 3.8),
        color: pick(colors)
      });
    }
  }

  // ---------------- Quà tặng & Bão Tim ----------------
  function onGift(ev) {
    const p = getDancer(ev.user, true, { demo: Boolean(ev.test) });
    if (!p) return;
    const coins = Math.max(1, Number(ev.total || ev.diamonds || 1));
    p.points += coins * 12;
    p.diamonds += coins;
    const t = clock();
    p.glowUntil = t + 9500;
    p.jumpT0 = t;

    // Tự động nâng cấp ngoại hình VIP theo mệnh giá quà hoặc tên quà giống ảnh mẫu
    const gName = norm(ev.giftName || '');
    if (/phi cong|ten lua|may bay|rocket/.test(gName)) triggerEffect(p, 'pilot', true);
    else if (/ghep doi|tim|love/.test(gName)) triggerEffect(p, 'couple', true);
    else if (/ngo khong|te thien/.test(gName)) p.skin = 'wukong';
    else if (coins >= 99 || /vua|vuong mien|su tu/.test(gName)) p.skin = 'king';

    fireCo2(t);
    fireStagePyro(t, coins >= 20 ? 3400 : 2000);
    spawnFireworkSalvo(coins >= 50 ? 9 : coins >= 10 ? 6 : 3, coins >= 20 ? 1700 : 900);
    spawnFloorWave(p.x, p.y, '#fde047');
    spawnConfetti(Math.min(100, 28 + coins * 3));
    spawnStars(p.x, p.y - 95, 24, '#fde047');

    if (coins >= 20) {
      dropUntil = Math.max(dropUntil, t + 5000);
      laserBoostUntil = Math.max(laserBoostUntil, t + 7500);
      startCenterStage(p, `Đại gia bắn ${ev.giftName || 'quà VIP'} cực cháy! 💎`);
      sfx?.play('bassDrop', 1);
    } else {
      sfx?.play('coinBurst', 1);
      if ((!spotlight || t > spotlight.until - 1800) && !(centerStage && t < centerStage.until)) {
        spotlight = { p, t0: t, until: t + 5200, mode: 'gift' };
      }
      showGiftPlate(p, ev);
    }
    voice.say(`${clubName()} cảm ơn đại gia ${speakName(p.name)} đã bắn ${ev.giftName || 'quà VIP'}! ${pick(HYPE_LINES)}`, true);
  }

  function showGiftPlate(p, ev) {
    if (!ui?.plate) return;
    const n = ui.plate;
    n.querySelector('.np-name').textContent = p.name;
    n.querySelector('.np-gift').textContent = `đã gửi ${ev.giftName || 'Quà VIP'}${ev.repeatCount > 1 ? ' ×' + ev.repeatCount : ''} 🔥`;
    const av = n.querySelector('.np-av');
    av.replaceChildren();
    if (p.img && ok(p.img)) {
      const im = new Image();
      im.referrerPolicy = 'no-referrer';
      im.src = p.img.src;
      av.appendChild(im);
    } else {
      av.textContent = (p.name[0] || '👑').toUpperCase();
    }
    n.classList.remove('on');
    void n.offsetWidth;
    n.classList.add('on');
    clearTimeout(showGiftPlate.t);
    showGiftPlate.t = setTimeout(() => n.classList.remove('on'), 6800);
  }

  function onLiveStatus(st) {
    if (!st) return;
    liveConnected = st.status === 'live';
    if (st.roomId) activeRoomId = String(st.roomId);
    if (st.status === 'ended') {
      // Buổi live kết thúc -> toàn bộ khách vẫy tay rời sàn
      for (const d of dancers.values()) startLeave(d, '👋 Hẹn gặp lại!');
      activeRoomId = '';
      liveViewers = 0;
    }
  }

  function onStats(s) {
    if (!s) return;
    if (s.roomId) {
      if (activeRoomId && activeRoomId !== s.roomId) {
        // Chuyển sang phiên live mới -> dọn sàn cũ
        for (const d of dancers.values()) {
          if (!d.demo) startLeave(d, '👋 Đã rời live');
        }
      }
      activeRoomId = String(s.roomId);
      liveConnected = true;
    }
    if (typeof s.viewers === 'number') liveViewers = Math.max(0, s.viewers);
    if (!enabled) return;
    if (typeof s.likes === 'number') {
      if (likeBase < 0 || s.likes < likeBase) likeBase = s.likes;
      liveLikes = Math.max(0, s.likes - likeBase);
      checkLikes();
    } else {
      updateLikeBar();
    }
  }

  function addLikes(n) {
    bonusLikes += Math.max(1, Number(n) || 100);
    checkLikes();
  }

  function checkLikes() {
    const goal = Math.max(10, Number(cfg.barLikeGoal) || 500);
    let triggered = false;
    while (totalLikes() >= goal) {
      const fromBonus = Math.min(bonusLikes, goal);
      bonusLikes -= fromBonus;
      const rem = goal - fromBonus;
      if (rem > 0) {
        likeBase += rem;
        liveLikes = Math.max(0, liveLikes - rem);
      }
      triggered = true;
    }
    if (triggered) startHeartStorm();
    else updateLikeBar();
  }

  function startHeartStorm() {
    const t = clock();
    stormUntil = t + STORM_MS;
    lastStormFw = t;
    dropUntil = Math.max(dropUntil, t + 6500);
    laserBoostUntil = Math.max(laserBoostUntil, t + 14000);
    fireCo2(t);
    fireStagePyro(t, 4200);
    spawnFireworkSalvo(10, 2200);
    spawnFloorWave(540, 1200, '#fb7185');
    spawnConfetti(95);
    spawnHearts(540, 860, 32);
    sfx?.play('bassDrop', 1);
    setTimeout(() => { if (enabled && !pauseAt) sfx?.play('airhorn', 0.9); }, 340);
    voice.say(`Bão tim và đại tiệc pháo hoa đã nổ tại ${clubName()}! Cảm ơn cả nhà thả tim cháy máy!`, false);
    updateLikeBar();
  }

  function activeDancerCount() {
    let n = 0;
    for (const d of dancers.values()) if (d.mode !== 'leave') n += 1;
    return n;
  }

  function updateLikeBar() {
    if (!ui?.likeFill || !ui?.likeText) return;
    const goal = Math.max(10, Number(cfg.barLikeGoal) || 500);
    const cur = totalLikes();
    const storm = clock() < stormUntil;
    const onFloor = activeDancerCount();
    ui.likeFill.style.width = (storm ? 100 : clamp((cur / goal) * 100, 0, 100)) + '%';
    ui.likeText.textContent = storm
      ? `⚡ BÃO TIM BÙNG NỔ · 🪩 ${onFloor} meme đang quẩy!`
      : `❤️ ${cur}/${goal} Bão Tim · 🪩 ${onFloor} đang nhảy · 💬 Comment để vào sàn`;
  }

  // ---------------- Xử lý Sự kiện Live & Lệnh điều khiển ----------------
  function setSpeechBubble(p, text) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 42);
    if (!clean) return;
    p.bubble = { text: clean, until: clock() + 5000 };
  }

  function onEvent(ev) {
    if (!enabled || !ev || pauseAt) return;
    switch (ev.type) {
      case 'join': {
        // Vào xem live: chỉ chào đón trên thanh thông báo đỉnh, CHƯA vào sàn nhảy (chỉ cần comment là vào nhảy!)
        queueWelcomeGreeting(ev.user?.nickname || 'Khách mới', loadAvatar(ev.user?.avatar));
        return;
      }
      case 'leave': {
        const p = getDancer(ev.user, false);
        if (p) {
          startLeave(p, '👋 Đã rời live');
          showFxToast('👋', p.name, 'đã rời phiên live!');
        }
        return;
      }
      case 'chat': {
        const rawText = String(ev.text || '').trim();
        const normText = norm(rawText);
        // Nếu người xem chào tạm biệt / báo rời live -> vẫy tay bước rời khỏi sàn và biến mất
        if (LEAVE_CHAT_RE.test(normText)) {
          const existing = getDancer(ev.user, false);
          if (existing) {
            startLeave(existing, '👋 Tạm biệt!');
            showFxToast('👋', existing.name, 'chào tạm biệt và rời khỏi sàn!');
          }
          return;
        }

        // Chỉ cần bình luận BẤT KỲ câu gì là lập tức hóa nhân vật Meme bước vào nhảy suốt buổi live!
        const k = keyOf(ev.user);
        const wasOnFloor = k && dancers.has(k) && dancers.get(k)?.mode !== 'leave';
        const p = getDancer(ev.user, true, { demo: Boolean(ev.test) });
        if (!p) return;
        p.points += 2;
        setSpeechBubble(p, rawText);

        const directSkin = parseDirectSkin(rawText);
        if (directSkin) {
          p.skin = directSkin;
          p.jumpT0 = clock();
          p.glowUntil = clock() + 4500;
          spawnStars(p.x, p.y - 80, 16, curTheme().pri);
          sfx?.play('pop');
          showFxToast('🎭', p.name, `hóa thân thành ${SKIN_LABELS[directSkin] || 'Meme'}!`);
          return;
        }

        const matched = matchBarTriggers(rawText);
        if (matched.length) {
          for (const eff of matched) triggerEffect(p, eff, Boolean(ev.test), rawText);
        } else {
          p.jumpT0 = clock();
          if (!wasOnFloor) {
            showFxToast('🪩', p.name, `vào sàn nhảy hóa ${SKIN_LABELS[p.skin] || 'Meme'}!`);
          }
        }
        return;
      }
      case 'gift':
        onGift(ev);
        return;
      case 'follow': {
        const p = getDancer(ev.user, false);
        if (p) {
          p.points += 8;
          p.jumpT0 = clock();
          p.glowUntil = clock() + 4500;
          spawnStars(p.x, p.y - 85, 14, curTheme().sec);
          showFxToast('💖', p.name, 'đã Follow thành khách VIP của sàn!');
        }
        return;
      }
      case 'share': {
        const p = getDancer(ev.user, false);
        if (p) {
          p.points += 8;
          p.glowUntil = clock() + 4500;
          showFxToast('🔥', p.name, 'đã chia sẻ rủ hội bạn vào sàn!');
        }
        return;
      }
      case 'like': {
        const p = getDancer(ev.user, false);
        if (p && Math.random() < 0.55) {
          spawnHearts(p.x, p.y - 110 * scaleAt(p.y), 2);
        }
        return;
      }
    }
  }

  function command(c) {
    if (!c) return;
    const a = c.action;
    if (a === 'playMusic') { wantMusicPlay = true; syncMusic(); return; }
    if (a === 'pauseMusic') { wantMusicPlay = false; syncMusic(); return; }
    if (a === 'nextMusic') { wantMusicPlay = true; loadBarTrack(musicIdx + 1, true); return; }
    if (a === 'prevMusic') { wantMusicPlay = true; loadBarTrack(musicIdx - 1, true); return; }
    if (a === 'musicIndex') { wantMusicPlay = true; loadBarTrack(Number(c.n) || 0, true); return; }
    if (!enabled) return;

    const t = clock();
    if (a === 'speak' && c.text) {
      voice.say(String(c.text).slice(0, 400), true);
    } else if (a === 'fireworks') {
      spawnFireworkSalvo(10, 1800);
      fireStagePyro(t, 3400);
      fireCo2(t);
      spawnFloorWave(540, 1180, '#fde047');
      showFxToast('🎆', 'DJ ' + clubName(), 'khai hỏa ĐẠI TIỆC PHÁO HOA RỰC SÁNG SÂN KHẤU!');
    } else if (a === 'center') {
      const list = [...dancers.values()].filter((d) => d.mode !== 'leave');
      const star = list.length ? pick(list) : getDancer({ id: 'vip_star_1', nickname: 'Hoàng Cường' }, true, { demo: true });
      if (star) startCenterStage(star, 'Ngôi sao đêm nay lên sóng chính!');
    } else if (a === 'drop') {
      triggerBassDrop('DJ ' + clubName());
    } else if (a === 'co2') {
      fireCo2(t);
      sfx?.play('co2Jet', 1);
      showFxToast('💨', 'DJ ' + clubName(), 'xả pháo khói lạnh CO2 toàn sân khấu!');
    } else if (a === 'laser') {
      laserBoostUntil = t + 10000;
      strobeUntil = t + 320;
      sfx?.play('laserZap', 1);
      showFxToast('⚡', 'DJ ' + clubName(), 'bật đại tiệc Laser 3D cực mạnh!');
    } else if (a === 'couple') {
      const list = [...dancers.values()].filter((d) => d.mode !== 'leave');
      const first = list.length ? pick(list) : getDancer({ id: 'vip_demo_1', nickname: 'Hoàng Cường' }, true, { demo: true });
      if (first) startCouple(first);
    } else if (a === 'parade') {
      const list = [...dancers.values()].filter((d) => d.mode !== 'leave');
      if (!list.length) getDancer({ id: 'vip_demo_2', nickname: 'MrBen' }, true, { demo: true });
      for (const d of dancers.values()) {
        if (d.mode === 'leave') continue;
        d.mode = 'parade';
        d.paradeUntil = t + 7500;
        d.paradeAngle = rnd(0, 6.28);
      }
      sfx?.play('airhorn', 0.9);
      showFxToast('🏃', 'Cả sàn', 'cùng nối đuôi đi bão vòng quanh sân khấu!');
    } else if (a === 'cheers') {
      for (const d of dancers.values()) if (d.mode !== 'leave') d.cheersUntil = t + 5000;
      pushFloater('🍻 CẢ SÀN 1 · 2 · 3 DZÔÔÔ!', 480, 980, 2800, '#fde047');
      sfx?.play('cheers', 1.1);
    } else if (a === 'rain') {
      startHeartStorm();
    } else if (a === 'testLikes') {
      addLikes(Number(c.n) || 100);
    } else if (a === 'reset') {
      for (const d of dancers.values()) { d.points = 1; d.diamonds = 0; }
    } else if (a === 'clear') {
      for (const d of dancers.values()) startLeave(d, '👋 Hẹn gặp lại!');
    }
  }

  function tick1s() {
    if (!enabled || pauseAt) return;
    greetTick();
    syncDepartedViewers();
    updateLikeBar();
    syncMusic();
  }

  // Đồng bộ người rời live: giữ nguyên suốt buổi live khi còn mắt xem, chỉ rời khi lượng người xem thật giảm xuống hoặc bật hẹn giờ
  function syncDepartedViewers() {
    const now = Date.now();
    // Dọn dẹp dự phòng nếu tab trình duyệt bị ẩn nên rAF chạy chậm
    for (const d of dancers.values()) {
      if (d.mode === 'leave' && d.leaveAt && now - d.leaveAt > 2600) {
        dancers.delete(d.key);
      }
    }
    // 1. Khi đang phát live thật và số mắt xem hiện tại thấp hơn số nhân vật thật trên sàn -> số chênh lệch chắc chắn đã rời live
    if (liveConnected) {
      const realActive = [...dancers.values()].filter((d) => !d.demo && d.mode !== 'leave');
      const excess = realActive.length - liveViewers;
      if (excess > 0) {
        const candidates = realActive
          .filter((d) => d.diamonds === 0 && d !== spotlight?.p && d !== centerStage?.p && (liveViewers === 0 || now - d.active > 12000))
          .sort((a, b) => a.active - b.active);
        for (const d of candidates.slice(0, Math.min(3, excess))) {
          startLeave(d, '👋 Đã rời live');
        }
      }
    }
    // 2. Tuỳ chọn tự rời nếu im lặng quá X phút (mặc định barIdleMin = 0: tắt, giữ trên sàn đến khi rời live)
    const idleMs = (Number(cfg.barIdleMin) || 0) * 60000;
    if (idleMs > 0) {
      let leftCount = 0;
      for (const d of dancers.values()) {
        if (leftCount >= 2) break;
        if (d.mode === 'dance' && d.diamonds === 0 && d !== spotlight?.p && d !== centerStage?.p && now - d.active > idleMs) {
          startLeave(d, '👋 Tạm biệt!');
          leftCount += 1;
        }
      }
    }
  }

  // ---------------- Mô phỏng chuyển động 30fps ----------------
  function loop(rt) {
    if (pauseAt) return;
    requestAnimationFrame(loop);
    const t = rt - pausedMs;
    if (t - last < FRAME_MS - 2) return;
    const dt = Math.min(0.06, (t - last) / 1000);
    last = t;
    if (!enabled) return;
    update(dt, t);
    draw(t);
  }

  function update(dt, t) {
    const fStep = clamp(dt * 30, 0.5, 2.2);

    if (centerStage) {
      if (t >= centerStage.until || !dancers.has(centerStage.p.key)) {
        const cp = centerStage.p;
        if (cp && dancers.has(cp.key) && cp.mode === 'center') {
          cp.mode = 'dance';
          cp.tx = cp.spot.x;
          cp.ty = cp.spot.y;
        }
        centerStage = null;
      } else if (t - (centerStage.lastFw || centerStage.t0) > 1250) {
        centerStage.lastFw = t;
        launchFirework(rnd(170, 910), rnd(220, 470), pick(FW_PALETTES));
      }
    }

    if (coupleState && t > coupleState.until) {
      if (coupleState.a) { coupleState.a.mode = 'dance'; coupleState.a.tx = coupleState.a.spot.x; coupleState.a.ty = coupleState.a.spot.y; }
      if (coupleState.b) { coupleState.b.mode = 'dance'; coupleState.b.tx = coupleState.b.spot.x; coupleState.b.ty = coupleState.b.spot.y; }
      coupleState = null;
    }

    if (t < stormUntil) {
      if (particles.length < 220 && Math.random() < 0.55) spawnConfetti(4);
      if (t - lastStormFw > 720) {
        lastStormFw = t;
        launchFirework(rnd(165, 915), rnd(215, 520), pick(FW_PALETTES));
      }
    }

    // Pháo hoa tầm cao bay vút từ sân khấu lên trời và nổ chùm rực rỡ
    for (let i = fireworkRockets.length - 1; i >= 0; i--) {
      const rk = fireworkRockets[i];
      rk.prevX = rk.x;
      rk.prevY = rk.y;
      rk.x += rk.vx * fStep;
      rk.y += rk.vy * fStep;
      rk.vy += 0.22 * fStep;
      if (particles.length < 620 && Math.random() < 0.85) {
        particles.push({
          kind: 'fwSpark',
          x: rk.x + rnd(-2, 2),
          y: rk.y + 4,
          prevX: rk.x,
          prevY: rk.y,
          vx: rnd(-0.9, 0.9),
          vy: rnd(1.2, 3.2),
          r: rnd(1.8, 3.2),
          drag: 0.92,
          grav: 0.08,
          age: 0,
          life: rnd(0.22, 0.38),
          color: '#fde047',
          twinkle: false
        });
      }
      if (rk.y <= rk.targetY || rk.vy >= -1.5) {
        detonateFirework(rk.x, rk.y, rk.palette);
        fireworkRockets.splice(i, 1);
      }
    }

    // Dàn pháo điện kim tuyến (Stage Sparkler Pyro) phun thẳng đứng dọc mép bục DJ
    for (let i = pyroFountains.length - 1; i >= 0; i--) {
      const fn = pyroFountains[i];
      if (t - fn.t0 > fn.dur) {
        pyroFountains.splice(i, 1);
        continue;
      }
      if (particles.length < 650) {
        for (let k = 0; k < 2; k++) {
          particles.push({
            kind: 'fwSpark',
            x: fn.x + rnd(-5, 5),
            y: fn.y,
            prevX: fn.x,
            prevY: fn.y + 8,
            vx: rnd(-2.3, 2.3),
            vy: -rnd(8.5, 15.2),
            r: rnd(2.0, 3.8),
            drag: 0.965,
            grav: 0.32,
            age: 0,
            life: rnd(0.42, 0.78),
            color: Math.random() < 0.55 ? '#fef08a' : (Math.random() < 0.5 ? '#ffffff' : '#fb923c'),
            twinkle: true
          });
        }
      }
    }

    for (let i = shockRings.length - 1; i >= 0; i--) {
      shockRings[i].age += dt;
      if (shockRings[i].age >= shockRings[i].life) shockRings.splice(i, 1);
    }
    for (let i = floorWaves.length - 1; i >= 0; i--) {
      floorWaves[i].age += dt;
      if (floorWaves[i].age >= floorWaves[i].life) floorWaves.splice(i, 1);
    }

    for (const p of dancers.values()) {
      if (p.mode === 'fly') {
        const k = (t - p.flyT0) / p.flyDur;
        if (k >= 1) {
          p.mode = 'dance';
          p.tx = p.spot.x;
          p.ty = p.spot.y;
        } else {
          p.x = p.flyFromX + (p.flyToX - p.flyFromX) * k;
          p.y = p.flyFromY - Math.sin(k * Math.PI) * 145;
          p.flip = p.flyToX < p.flyFromX;
          if (Math.random() < 0.6) {
            particles.push({
              kind: 'star',
              x: p.x + (p.flip ? 34 : -34),
              y: p.y - 36,
              vx: (p.flip ? 2.6 : -2.6) + rnd(-0.6, 0.6),
              vy: rnd(-0.8, 1.2),
              r: rnd(4, 7),
              rot: rnd(0, 6.28),
              age: 0,
              life: 0.45,
              color: Math.random() < 0.5 ? '#fde047' : '#fb7185'
            });
          }
          continue;
        }
      } else if (p.mode === 'parade') {
        if (t > p.paradeUntil) {
          p.mode = 'dance';
          p.tx = p.spot.x;
          p.ty = p.spot.y;
        } else {
          p.paradeAngle += dt * 1.9;
          const nx = 450 + Math.cos(p.paradeAngle) * 255;
          const ny = 1145 + Math.sin(p.paradeAngle) * 175;
          p.flip = nx < p.x;
          p.x += (nx - p.x) * Math.min(1, dt * 6);
          p.y += (ny - p.y) * Math.min(1, dt * 6);
          if (Math.random() < 0.28) spawnStars(p.x, p.y - 30, 1, curTheme().acc);
          continue;
        }
      }

      // Khách rời live -> vẫy tay bước ra khỏi sàn rồi biến mất
      if (p.mode === 'leave') {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.hypot(dx, dy);
        const sp = 390 * dt;
        if (dist <= sp || p.y >= 1695 || (p.leaveAt && Date.now() - p.leaveAt > 2600)) {
          dancers.delete(p.key);
          updateLikeBar();
        } else {
          p.x += (dx / dist) * sp;
          p.y += (dy / dist) * sp;
          p.alpha = p.y > 1530 ? clamp(1 - (p.y - 1530) / 165, 0, 1) : 1;
        }
        continue;
      }

      // Di chuyển mượt về vị trí đích (enter / dance / couple / center)
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 2.5) {
        const sp = (p.mode === 'enter' || p.mode === 'center' ? 490 : 360) * dt;
        if (Math.abs(dx) > 4 && p.mode !== 'couple' && p.mode !== 'center') p.flip = dx < 0;
        if (dist <= sp) {
          p.x = p.tx; p.y = p.ty;
          if (p.mode === 'enter') p.mode = 'dance';
        } else {
          p.x += (dx / dist) * sp;
          p.y += (dy / dist) * sp;
        }
      } else if (p.mode === 'enter') {
        p.mode = 'dance';
      } else if (p.mode === 'center') {
        if (Math.random() < dt * 0.45 && (!p.jumpT0 || t - p.jumpT0 > 1350)) {
          p.jumpT0 = t;
          spawnStars(p.x, p.y - 110, 6, '#fde047');
        }
      } else if (p.mode === 'dance') {
        // Khi đang trên sàn, thỉnh thoảng tự xoay người & nhún nhảy cực sung suốt buổi live
        if (Math.random() < dt * 0.18 && (!p.jumpT0 || t - p.jumpT0 > 1800)) {
          p.flip = !p.flip;
        }
        if (Math.random() < dt * 0.08 && (!p.jumpT0 || t - p.jumpT0 > 3200)) {
          p.jumpT0 = t;
        }
      }
    }

    // Camera zoom cận cảnh khi gõ "camera" hoặc tặng quà lớn
    let tk = 1, tx = W / 2, ty = H / 2;
    if (spotlight && t < spotlight.until && dancers.has(spotlight.p.key)) {
      const p = spotlight.p;
      tk = spotlight.mode === 'camera' ? 1.48 : 1.36;
      tx = clamp(p.x, 310, 760);
      ty = clamp(p.y - 75, 580, 1280);
    } else if (spotlight && t >= spotlight.until) {
      spotlight = null;
    }
    const camLerp = Math.min(1, dt * 3.2);
    zoom.k += (tk - zoom.k) * camLerp;
    zoom.x += (tx - zoom.x) * camLerp;
    zoom.y += (ty - zoom.y) * camLerp;

    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.age += dt;
      pt.prevX = pt.x;
      pt.prevY = pt.y;
      pt.x += pt.vx * fStep;
      pt.y += pt.vy * fStep;
      if (pt.kind === 'fwSpark') {
        const drag = Math.pow(pt.drag || 0.96, fStep);
        pt.vx *= drag;
        pt.vy = pt.vy * drag + (pt.grav || 0.14) * fStep;
      } else if (pt.kind === 'star') {
        pt.vy += 0.14 * fStep;
      } else if (pt.kind === 'confetti') {
        pt.vx += Math.sin(t / 180 + i) * 0.06 * fStep;
        pt.rot += 0.12 * fStep;
      }
      if (pt.age >= pt.life || pt.y > H + 40) particles.splice(i, 1);
    }

    for (let i = co2Jets.length - 1; i >= 0; i--) {
      if (t - co2Jets[i].t0 > co2Jets[i].dur) co2Jets.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      if (t - floaters[i].t0 > floaters[i].dur) floaters.splice(i, 1);
    }
  }

  // ---------------- Vẽ Sân Khấu Nightclub 2× HiDPI ----------------
  function draw(t) {
    const th = curTheme();
    const bpm = bpmOf();
    const beatPos = ((t / 1000) * (bpm / 60)) % 1; // 0..1 theo từng phách nhạc
    const kick = Math.pow(1 - beatPos, 3);         // nảy mạnh đầu phách
    const centerOn = Boolean(centerStage && t < centerStage.until && dancers.has(centerStage.p.key));
    const hype = t < dropUntil || t < stormUntil || centerOn || fireworkRockets.length > 0;

    g.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Rung nhẹ khi Bass Drop hoặc Pháo Hoa nổ lớn
    let shakeX = 0, shakeY = 0;
    if (t < dropUntil || shockRings.length > 0) {
      const base = t < dropUntil ? Math.min(1, (dropUntil - t) / 4000) * 4.8 * kick : Math.min(3.4, shockRings.length * 1.1);
      shakeX = Math.sin(t * 0.095) * base;
      shakeY = Math.cos(t * 0.115) * base;
    }

    g.setTransform(
      zoom.k * DPR, 0, 0, zoom.k * DPR,
      (W / 2 - zoom.x * zoom.k + shakeX) * DPR,
      (H / 2 - zoom.y * zoom.k + shakeY) * DPR
    );

    drawBackdrop(th, t, kick);
    drawLedWall(th, t, kick, hype);
    drawCeilingBeams(th, t, kick, hype, centerOn ? centerStage.p : null);
    drawAngledMarquee(th, t);
    drawDanceFloor(th, t, kick, hype);
    drawFloorWaves();
    if (centerOn) drawCenterPedestal(centerStage.p, th, t, kick);
    drawDjStage(th, t, kick, hype);
    drawVipRanks(th, t, kick, centerOn);
    drawCo2Jets(t);

    // Sắp xếp dân chơi theo chiều sâu y (ưu tiên ngôi sao đang Lên Chính đứng hàng tiền cảnh trên cùng)
    const sorted = [...dancers.values()].sort((a, b) => {
      if (centerOn && a === centerStage.p) return 1;
      if (centerOn && b === centerStage.p) return -1;
      return a.y - b.y;
    });
    for (const p of sorted) drawDancer(p, th, t, beatPos, kick, centerOn);

    // Trái tim đôi lơ lửng khi đang ghép đôi
    if (coupleState && t < coupleState.until) {
      drawCoupleAura(coupleState, t, kick);
    }

    drawParticles();
    drawFireworks(t);
    drawFloaters(t);

    // Bảng Vinh Danh Lên Sóng Chính & Khung ống kính máy quay
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (centerOn) {
      drawCenterShowcase(centerStage, th, t, kick);
    }
    if (spotlight && spotlight.mode === 'camera' && t < spotlight.until) {
      drawCameraHud(spotlight.p, t, th);
    }
    if (t < strobeUntil) {
      g.fillStyle = `rgba(255, 255, 255, ${clamp((strobeUntil - t) / 450, 0, 1) * 0.26})`;
      g.fillRect(0, 0, W, H);
    }
  }

  function drawBackdrop(th, t, kick) {
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, th.bgTop);
    grd.addColorStop(0.46, th.bgMid);
    grd.addColorStop(1, th.bgBot);
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);

    // Quầng sáng trần sân khấu
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rg = g.createRadialGradient(540, 340, 20, 540, 440, 560);
    rg.addColorStop(0, `rgba(${th.beamA}, ${0.22 + kick * 0.08})`);
    rg.addColorStop(0.55, `rgba(${th.beamB}, 0.10)`);
    rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, W, 960);
    g.restore();
  }

  // Bức tường LED Ma Trận phía sau DJ (giống hệt mảng ô vuông hồng-trắng rực sáng trong ảnh mẫu)
  function drawLedWall(th, t, kick, hype) {
    const x0 = 60, y0 = 468, w = 960, h = 392;
    const cols = 28, rows = 12;
    const cw = w / cols, ch = h / rows;

    g.fillStyle = 'rgba(8, 4, 20, 0.92)';
    g.fillRect(x0, y0, w, h);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = (c - cols / 2) / (cols / 2);
        const wave = Math.sin(c * 0.42 + t * 0.005) * 0.5 + 0.5;
        const eqHeight = rows - Math.floor((0.35 + wave * 0.55 + kick * 0.22) * rows);
        const lit = r >= eqHeight || (hype && ((r + c + Math.floor(t / 120)) % 5 === 0));
        const distMid = 1 - Math.min(1, Math.hypot(nx, (r - 5) / 7));
        const alpha = lit ? 0.48 + distMid * 0.42 : 0.12 + distMid * 0.16;
        g.fillStyle = (c + r) % 3 === 0
          ? `rgba(${th.beamB}, ${alpha})`
          : (c % 4 === 0 ? `rgba(${th.beamA}, ${alpha * 0.85})` : `rgba(255, 215, 245, ${alpha * 0.78})`);
        g.fillRect(x0 + c * cw + 2, y0 + r * ch + 2, cw - 4, ch - 4);
      }
    }

    // Dàn đèn rọi Moving-head treo dọc mép trên tường LED (5 cụm đèn đen như ảnh mẫu)
    const fixtures = [165, 335, 540, 745, 915];
    for (const fx of fixtures) {
      g.fillStyle = '#0f172a';
      roundRect(fx - 18, y0 - 8, 36, 38, 8);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.22)';
      g.lineWidth = 1.5;
      g.stroke();
      g.fillStyle = `rgba(${th.beamA}, ${0.7 + kick * 0.3})`;
      g.beginPath();
      g.ellipse(fx, y0 + 28, 12, 5, 0, 0, 6.28);
      g.fill();
    }
  }

  // Hệ thống đèn chùm Laser / Spotlight quét từ đỉnh trần xuống sàn
  function drawCeilingBeams(th, t, kick, hype, centerStar = null) {
    const boost = hype || t < laserBoostUntil ? 1.65 : 1;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const sources = [
      { x: 180, y: 120, col: th.beamA, spd: 0.0011, ph: 0.2, spread: 210 },
      { x: 540, y: 80,  col: th.beamA, spd: -0.0008, ph: 1.4, spread: 340 },
      { x: 900, y: 120, col: th.beamB, spd: 0.0013, ph: 2.7, spread: 220 },
      { x: 350, y: 475, col: th.beamC, spd: -0.0019, ph: 0.9, spread: 155 },
      { x: 730, y: 475, col: th.beamB, spd: 0.0017, ph: 2.1, spread: 155 }
    ];
    for (const s of sources) {
      const sway = Math.sin(t * s.spd + s.ph) * 290;
      const tx = 540 + sway;
      const ty = 1320;
      const grd = g.createLinearGradient(s.x, s.y, tx, ty);
      const a0 = clamp((0.18 + kick * 0.09) * boost, 0, 0.44);
      grd.addColorStop(0, `rgba(${s.col}, ${a0})`);
      grd.addColorStop(0.55, `rgba(${s.col}, ${a0 * 0.45})`);
      grd.addColorStop(1, `rgba(${s.col}, 0)`);
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(s.x - 14, s.y);
      g.lineTo(s.x + 14, s.y);
      g.lineTo(tx + s.spread, ty);
      g.lineTo(tx - s.spread, ty);
      g.closePath();
      g.fill();
    }

    // Cặp đèn Spotlight vàng kim rọi hội tụ thẳng vào Ngôi Sao đang Lên Sóng Chính!
    if (centerStar) {
      const heroLights = [255, 825];
      for (const lx of heroLights) {
        const grd = g.createLinearGradient(lx, 96, centerStar.x, centerStar.y + 10);
        grd.addColorStop(0, `rgba(253, 224, 71, ${0.34 + kick * 0.12})`);
        grd.addColorStop(0.65, 'rgba(251, 191, 36, 0.18)');
        grd.addColorStop(1, 'rgba(253, 224, 71, 0)');
        g.fillStyle = grd;
        g.beginPath();
        g.moveTo(lx - 16, 96);
        g.lineTo(lx + 16, 96);
        g.lineTo(centerStar.x + 135, centerStar.y + 18);
        g.lineTo(centerStar.x - 135, centerStar.y + 18);
        g.closePath();
        g.fill();
      }
    }

    // Quạt tia Laser 3D mảnh sắc nét cực mạnh khi bật Laser Boost / Drop / Pháo Hoa / Lên Chính
    if (hype || t < laserBoostUntil) {
      const origins = [205, 540, 875];
      origins.forEach((ox, idx) => {
        for (let i = -5; i <= 5; i++) {
          const ang = Math.sin(t * 0.0034 + idx * 1.2 + i * 0.28) * 0.72 + i * 0.13;
          const ex = ox + Math.sin(ang) * 1020;
          const ey = 474 + Math.cos(ang) * 1020;
          g.strokeStyle = i % 2 === 0 ? `rgba(${th.beamA}, 0.68)` : `rgba(${th.beamB}, 0.68)`;
          g.lineWidth = 3.2;
          g.beginPath();
          g.moveTo(ox, 474);
          g.lineTo(ex, ey);
          g.stroke();
          g.strokeStyle = 'rgba(255, 255, 255, 0.42)';
          g.lineWidth = 1.1;
          g.stroke();
        }
      });
    }
    g.restore();
  }

  // Hai dải băng rôn chữ LED nghiêng liền mạch toàn chiều ngang ("Tên Sàn — TikTok") không cắt chữ ở tâm
  function drawAngledMarquee(th, t) {
    const label = `•   ${clubName()} — TikTok   `;
    const bands = [
      { yL: 358, yR: 394, h: 42, bg: 'rgba(12, 34, 54, 0.88)', textCol: '#e0f2fe', dir: 1, phase: 0 },
      { yL: 404, yR: 440, h: 40, bg: 'rgba(78, 16, 46, 0.90)', textCol: '#fce7f3', dir: -1, phase: 150 }
    ];
    for (const b of bands) {
      drawRibbonHalf(0, b.yL, W, b.yR, b.h, b.bg, b.textCol, label, t * 0.065 * b.dir + b.phase, th);
    }
  }

  function drawRibbonHalf(x1, y1, x2, y2, h, bg, textCol, unitText, scrollPx, th) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    g.save();
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.lineTo(x2, y2 + h);
    g.lineTo(x1, y1 + h);
    g.closePath();
    g.clip();

    g.translate(x1, y1);
    g.rotate(ang);
    g.fillStyle = bg;
    g.fillRect(-20, 0, len + 40, h);
    g.strokeStyle = `rgba(${th.beamA}, 0.55)`;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(-20, 1); g.lineTo(len + 20, 1);
    g.moveTo(-20, h - 1); g.lineTo(len + 20, h - 1);
    g.stroke();

    g.font = '800 24px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.fillStyle = textCol;
    g.textBaseline = 'middle';
    const tw = Math.max(160, g.measureText(unitText).width);
    const offset = ((scrollPx % tw) + tw) % tw - tw;
    for (let x = offset; x < len + tw; x += tw) {
      g.fillText(unitText, x, h / 2 + 1);
    }
    g.restore();
  }

  // Sàn nhảy caro 3D phát sáng theo nhịp Bass
  function drawDanceFloor(th, t, kick, hype) {
    const horizonY = 858;
    const botY = H;
    const floorGrd = g.createLinearGradient(0, horizonY, 0, botY);
    floorGrd.addColorStop(0, '#160726');
    floorGrd.addColorStop(0.55, '#1e0b36');
    floorGrd.addColorStop(1, '#080211');
    g.fillStyle = floorGrd;
    g.fillRect(0, horizonY, W, botY - horizonY);

    const cols = 10;
    const rows = 13;
    const topHalfW = 470;
    const botHalfW = 980;
    const rowY = (r) => {
      const u = r / rows;
      return horizonY + Math.pow(u, 1.38) * (botY - horizonY);
    };
    const ptAt = (c, r) => {
      const u = r / rows;
      const y = rowY(r);
      const hw = topHalfW + (botHalfW - topHalfW) * Math.pow(u, 1.38);
      const s = (c / cols) * 2 - 1;
      return { x: 540 + s * hw, y };
    };

    const pulseTick = Math.floor(t / (hype ? 160 : 320));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p1 = ptAt(c, r);
        const p2 = ptAt(c + 1, r);
        const p3 = ptAt(c + 1, r + 1);
        const p4 = ptAt(c, r + 1);
        const checker = (r + c) % 2 === 0;
        const hot = ((c * 3 + r * 5 + pulseTick) % 11 === 0);
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.lineTo(p3.x, p3.y);
        g.lineTo(p4.x, p4.y);
        g.closePath();
        if (hot) {
          g.fillStyle = `rgba(${th.beamA}, ${0.38 + kick * 0.25})`;
        } else {
          g.fillStyle = checker ? th.tileA : th.tileB;
        }
        g.fill();
        g.strokeStyle = 'rgba(15, 6, 28, 0.86)';
        g.lineWidth = 2.4;
        g.stroke();
      }
    }

    // Viền neon ngang chân sân khấu DJ
    g.save();
    g.globalCompositeOperation = 'lighter';
    const stageGlow = g.createLinearGradient(120, horizonY - 6, 960, horizonY - 6);
    stageGlow.addColorStop(0, `rgba(${th.beamB}, 0.15)`);
    stageGlow.addColorStop(0.5, `rgba(${th.beamA}, ${0.75 + kick * 0.25})`);
    stageGlow.addColorStop(1, `rgba(${th.beamB}, 0.15)`);
    g.strokeStyle = stageGlow;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(90, horizonY + 2);
    g.lineTo(990, horizonY + 2);
    g.stroke();
    g.restore();
  }

  // Sóng xung kích ánh sáng lan tỏa trên mặt sàn 3D khi nổ Pháo Hoa / Bass Drop / Lên Chính
  function drawFloorWaves() {
    if (!floorWaves.length) return;
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const fw of floorWaves) {
      if (fw.age < 0) continue;
      const k = clamp(fw.age / fw.life, 0, 1);
      const rx = fw.r + (fw.maxR - fw.r) * easeOut(k);
      const ry = rx * 0.34;
      g.globalAlpha = (1 - k) * 0.72;
      g.strokeStyle = fw.color;
      g.lineWidth = Math.max(2, (1 - k) * 9);
      g.beginPath();
      g.ellipse(fw.x, fw.y, rx, ry, 0, 0, 6.28);
      g.stroke();
    }
    g.restore();
  }

  // Bục Ngôi Sao Vàng Kim 3D xoay tròn dưới chân người xem đang "LÊN SÓNG CHÍNH"
  function drawCenterPedestal(p, th, t, kick) {
    if (!p) return;
    const x = p.x, y = p.y;
    g.save();
    g.globalCompositeOperation = 'lighter';

    // Cột hào quang thẳng đứng bao quanh ngôi sao trung tâm
    const colGrd = g.createLinearGradient(x, y - 360, x, y + 30);
    colGrd.addColorStop(0, 'rgba(253, 224, 71, 0)');
    colGrd.addColorStop(0.55, `rgba(253, 224, 71, ${0.18 + kick * 0.10})`);
    colGrd.addColorStop(1, `rgba(${th.beamB}, ${0.32 + kick * 0.14})`);
    g.fillStyle = colGrd;
    g.fillRect(x - 105, y - 350, 210, 380);

    // Đĩa ánh sáng xoay dưới chân
    const rx = 116 + kick * 12;
    const ry = 38 + kick * 4;
    const baseGrd = g.createRadialGradient(x, y, 8, x, y, rx);
    baseGrd.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    baseGrd.addColorStop(0.55, 'rgba(245, 158, 11, 0.34)');
    baseGrd.addColorStop(1, 'rgba(245, 158, 11, 0)');
    g.fillStyle = baseGrd;
    g.beginPath();
    g.ellipse(x, y, rx * 1.18, ry * 1.25, 0, 0, 6.28);
    g.fill();

    // Vòng cung neon xoay kép quanh bục đứng
    g.strokeStyle = '#fde047';
    g.lineWidth = 4;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, 6.28);
    g.stroke();

    const rot = t * 0.0032;
    for (let i = 0; i < 8; i++) {
      const a1 = rot + (i * Math.PI) / 4;
      const a2 = a1 + 0.24;
      g.strokeStyle = i % 2 === 0 ? '#ffffff' : th.sec;
      g.lineWidth = 4.5;
      g.beginPath();
      g.ellipse(x, y, rx * 0.78, ry * 0.78, 0, a1, a2);
      g.stroke();
    }
    g.restore();

    // Nhãn sàn "★ TÂM ĐIỂM SÀN ĐÊM ★" ngay mũi bục đứng
    g.save();
    g.fillStyle = 'rgba(24, 8, 36, 0.92)';
    roundRect(x - 104, y + 18, 208, 28, 14);
    g.fill();
    g.strokeStyle = '#fde047';
    g.lineWidth = 2;
    g.stroke();
    g.font = '800 13.5px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.fillStyle = '#fef08a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('★ TÂM ĐIỂM SÀN ĐÊM ★', x, y + 32.5);
    g.restore();
  }

  // Bục DJ trung tâm + Nhân vật DJ đeo kính cánh thiên thần + Bảng LED tên kênh
  function drawDjStage(th, t, kick, hype) {
    const cx = 540, baseY = 876;

    // Bậc thềm phát sáng dưới bàn DJ
    g.fillStyle = '#120724';
    g.beginPath();
    g.moveTo(cx - 210, baseY);
    g.lineTo(cx + 210, baseY);
    g.lineTo(cx + 180, baseY - 34);
    g.lineTo(cx - 180, baseY - 34);
    g.closePath();
    g.fill();
    g.strokeStyle = th.sec;
    g.lineWidth = 2.5;
    g.stroke();

    // Nhân vật DJ có cánh đứng mix nhạc phía sau bàn
    const djBob = Math.sin(t / 120) * (3 + kick * 5);
    const djY = baseY - 96 + djBob;
    g.save();
    g.translate(cx, djY);
    // Đôi cánh neon của DJ (giống nhân vật DJ có cánh xanh-tím ở giữa ảnh mẫu)
    for (const dir of [-1, 1]) {
      g.save();
      g.scale(dir, 1);
      g.rotate(Math.sin(t / 180) * 0.08);
      const wg = g.createLinearGradient(0, -18, 66, -42);
      wg.addColorStop(0, th.pri);
      wg.addColorStop(1, th.sec);
      g.fillStyle = wg;
      g.beginPath();
      g.moveTo(12, -12);
      g.quadraticCurveTo(54, -52, 68, -28);
      g.quadraticCurveTo(56, -8, 42, -4);
      g.quadraticCurveTo(52, 8, 28, 12);
      g.closePath();
      g.fill();
      g.restore();
    }
    // Áo khoác & đầu DJ
    g.fillStyle = '#f59e0b';
    roundRect(-22, -18, 44, 38, 10);
    g.fill();
    g.fillStyle = '#fde68a';
    g.beginPath(); g.arc(0, -36, 22, 0, 6.28); g.fill();
    // Tóc vuốt ngược cháy phố
    g.fillStyle = '#451a03';
    g.beginPath();
    g.moveTo(-22, -40);
    g.quadraticCurveTo(-8, -68, 18, -56);
    g.quadraticCurveTo(24, -44, 20, -36);
    g.closePath();
    g.fill();
    // Tai nghe chụp tai phát sáng
    g.strokeStyle = th.sec;
    g.lineWidth = 5;
    g.beginPath(); g.arc(0, -38, 24, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.fillStyle = th.pri;
    g.beginPath(); g.arc(-23, -36, 6, 0, 6.28); g.arc(23, -36, 6, 0, 6.28); g.fill();
    // Kính râm ngầu
    g.fillStyle = '#090d16';
    roundRect(-17, -43, 15, 9, 3); g.fill();
    roundRect(2, -43, 15, 9, 3); g.fill();
    g.strokeStyle = '#fbbf24'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-2, -39); g.lineTo(2, -39); g.stroke();
    g.restore();

    // Bàn xoay & mặt trước bục DJ in tên sàn ("[Tên Sàn] — TikTok")
    const bx = cx - 156, by = baseY - 96, bw = 312, bh = 68;
    const boxGrd = g.createLinearGradient(bx, by, bx, by + bh);
    boxGrd.addColorStop(0, '#3b0726');
    boxGrd.addColorStop(1, '#190418');
    g.fillStyle = boxGrd;
    roundRect(bx, by, bw, bh, 12);
    g.fill();
    g.strokeStyle = hype ? '#fde047' : th.pri;
    g.lineWidth = 3;
    g.stroke();

    // Dải đèn nháy trên mép bàn DJ
    for (let i = 0; i < 12; i++) {
      const lx = bx + 18 + i * 25;
      g.fillStyle = (i + Math.floor(t / 140)) % 2 === 0 ? th.sec : th.acc;
      g.fillRect(lx, by + 6, 14, 4);
    }

    const signFont = '800 22px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.font = signFont;
    const signTxt = fitText(`${clubName()} — TikTok`, bw - 28, signFont);
    g.fillStyle = '#fff1f2';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(signTxt, cx, by + bh / 2 + 5);
  }

  // Các huy hiệu danh vọng có cánh (Bá Chủ, Á Vương, Tam Hoàng, Bão Tim — đúng bố cục ảnh mẫu)
  function drawVipRanks(th, t, kick, centerOn = false) {
    const ranked = [...dancers.values()]
      .filter((d) => d.mode !== 'leave')
      .sort((a, b) => (b.points - a.points) || (b.diamonds - a.diamonds));

    // Khi đang chiếu bảng "Lên Sóng Chính" cỡ lớn trên màn LED thì làm mờ nhẹ 3 bảng Top để chữ nổi bật tuyệt đối
    if (!centerOn) {
      drawWingedBadge({
        x: 540, y: 536, w: 196,
        title: '👑 BÁ CHỦ',
        sub: ranked[0] ? ranked[0].name : 'Tặng quà lên ngôi',
        img: ranked[0]?.img,
        c1: '#f59e0b', c2: '#fef08a', wing: '#fbbf24',
        pulse: kick * 0.04
      });
      drawWingedBadge({
        x: 312, y: 656, w: 174,
        title: '🦅 Á VƯƠNG',
        sub: ranked[1] ? ranked[1].name : 'Top 2 sàn đêm',
        img: ranked[1]?.img,
        c1: '#06b6d4', c2: '#bae6fd', wing: '#38bdf8',
        pulse: 0
      });
      drawWingedBadge({
        x: 768, y: 656, w: 174,
        title: '🔥 TAM HOÀNG',
        sub: ranked[2] ? ranked[2].name : 'Top 3 sàn đêm',
        img: ranked[2]?.img,
        c1: '#ec4899', c2: '#fbcfe8', wing: '#f472b6',
        pulse: 0
      });
    }

    // Huy hiệu "Bão tim" rực đỏ-hồng bên phải (ngay phía trên menu hành động giống ảnh mẫu)
    const stormOn = t < stormUntil;
    const goal = Math.max(10, Number(cfg.barLikeGoal) || 500);
    drawWingedBadge({
      x: 856, y: 815, w: 168,
      title: '❤️ BÃO TIM',
      sub: stormOn ? 'ĐANG BÙNG NỔ!' : `${totalLikes()}/${goal} tim`,
      c1: '#e11d48', c2: '#fecdd3', wing: '#fb7185',
      pulse: stormOn ? 0.08 * Math.sin(t / 90) : kick * 0.03
    });
  }

  function drawWingedBadge(b) {
    g.save();
    g.translate(b.x, b.y);
    if (b.pulse) g.scale(1 + b.pulse, 1 + b.pulse);
    const hw = b.w / 2;

    // Đôi cánh kim loại sáng hai bên bảng hiệu
    for (const dir of [-1, 1]) {
      g.save();
      g.scale(dir, 1);
      g.fillStyle = b.wing;
      g.globalAlpha = 0.88;
      g.beginPath();
      g.moveTo(hw - 10, 4);
      g.lineTo(hw + 30, -20);
      g.lineTo(hw + 22, -4);
      g.lineTo(hw + 34, 2);
      g.lineTo(hw + 16, 12);
      g.lineTo(hw + 24, 20);
      g.lineTo(hw - 8, 18);
      g.closePath();
      g.fill();
      g.restore();
    }

    // Thân bảng hiệu
    const grd = g.createLinearGradient(0, -18, 0, 28);
    grd.addColorStop(0, 'rgba(24, 10, 38, 0.94)');
    grd.addColorStop(1, 'rgba(10, 4, 20, 0.96)');
    g.fillStyle = grd;
    roundRect(-hw, -16, b.w, 46, 12);
    g.fill();
    g.strokeStyle = b.c1;
    g.lineWidth = 2.2;
    g.stroke();

    // Huy chương Avatar tròn phía trên đỉnh bảng Top VIP nếu đã có chủ nhân
    if (b.img && ok(b.img)) {
      const ar = 17, ay = -46;
      g.save();
      g.beginPath(); g.arc(0, ay, ar + 3, 0, 6.28);
      g.fillStyle = '#090414'; g.fill();
      g.strokeStyle = b.c1; g.lineWidth = 2.4; g.stroke();
      g.beginPath(); g.arc(0, ay, ar, 0, 6.28); g.clip();
      g.drawImage(b.img, -ar, ay - ar, ar * 2, ar * 2);
      g.restore();
    }

    // Nhãn danh hiệu phía trên
    g.fillStyle = b.c1;
    roundRect(-hw * 0.68, -27, b.w * 0.68, 20, 9);
    g.fill();
    g.font = '800 12.5px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.fillStyle = '#090414';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(b.title, 0, -16.5);

    // Tên người giữ ngôi
    const subFont = '700 15px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.font = subFont;
    g.fillStyle = b.c2;
    g.fillText(fitText(b.sub, b.w - 18, subFont), 0, 10);
    g.restore();
  }

  // ---------------- Vẽ 13 Nhân vật Meme Hoạt Hình Nổi Tiếng Nhún Nhảy Sắc Nét ----------------
  function drawDancer(p, th, t, beatPos, kick, centerOn = false) {
    const isCenter = Boolean(centerOn && centerStage?.p === p);
    const s = isCenter ? 1.46 : (p.mode === 'fly' ? 0.88 : scaleAt(p.y));
    const bounce = Math.abs(Math.sin((beatPos + p.phase * 0.16) * Math.PI)) * (isCenter ? 16 : 13) * s;
    const sway = Math.sin((t / 205) + p.phase) * 0.095;
    const grooveX = (p.mode === 'dance' || isCenter) ? Math.sin((t / 310) + p.phase) * 9 * s : 0;
    const drawX = p.x + grooveX;

    let jumpY = 0;
    let spin = 0;
    if (p.jumpT0 && t - p.jumpT0 < 780) {
      const jk = (t - p.jumpT0) / 780;
      jumpY = Math.sin(jk * Math.PI) * 92 * s;
      spin = Math.sin(jk * Math.PI * 2) * 0.22;
    }

    const baseAlpha = p.alpha ?? 1;
    const alpha = centerOn && !isCenter ? baseAlpha * 0.80 : baseAlpha;
    g.save();
    if (alpha < 1) g.globalAlpha = alpha;

    // Vòng sáng dưới chân nhân vật VIP / mới vào sàn / đang Lên Chính
    if ((p.glowUntil && t < p.glowUntil) || isCenter) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      const ga = isCenter ? (0.72 + kick * 0.18) : Math.min(1, (p.glowUntil - t) / 1200) * 0.56 * alpha;
      const rg = g.createRadialGradient(drawX, p.y - 44 * s, 8, drawX, p.y - 44 * s, 118 * s);
      rg.addColorStop(0, isCenter ? `rgba(253, 224, 71, ${ga})` : `rgba(${th.beamA}, ${ga})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.fillRect(drawX - 122 * s, p.y - 165 * s, 244 * s, 210 * s);
      g.restore();
    }

    g.save();
    g.translate(drawX, p.y);

    // Bóng đổ trên mặt sàn gương
    if (p.mode !== 'fly') {
      g.fillStyle = 'rgba(4, 1, 10, 0.48)';
      g.beginPath();
      g.ellipse(0, 0, 40 * s, 11 * s, 0, 0, 6.28);
      g.fill();
    }

    g.translate(0, -bounce - jumpY);
    if (p.flip) g.scale(-1, 1);
    g.rotate(sway + spin);
    g.scale(s, s);

    const armWave = Math.sin(t / 130 + p.phase) * 0.62;
    drawChibiSkin(p.skin, p.hue, t, armWave, kick, beatPos, p.phase);

    // Ly bia phát sáng nếu đang cụng ly "DZÔ"
    if (p.cheersUntil && t < p.cheersUntil) {
      g.save();
      g.translate(44, -92 - Math.abs(Math.sin(t / 120)) * 10);
      g.rotate(-0.18);
      g.fillStyle = '#fbbf24';
      roundRect(-10, -14, 20, 26, 4);
      g.fill();
      g.strokeStyle = '#fffbeb';
      g.lineWidth = 2.2;
      g.stroke();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(-4, -15, 6, 0, 6.28);
      g.arc(4, -16, 7, 0, 6.28);
      g.fill();
      g.restore();
    }
    g.restore();

    const headTop = p.y - (138 * s) - bounce - jumpY;
    const tagH = drawDancerTag(p, drawX, headTop - 8, s, t, kick, th, isCenter);
    if (p.bubble && t < p.bubble.until) {
      drawSpeechBubble(p.bubble, drawX, headTop - 8 - tagH - 8, s, t, th);
    }
    g.restore();
  }

  function drawChibiSkin(skin, hue, t, armWave, kick, beatPos, phase) {
    const legStep = Math.sin(t / 135 + phase) * 7.5;
    g.lineJoin = 'round';
    g.lineCap = 'round';

    // Chân nhún nhảy theo phách nhạc
    const legCol = skin === 'pepe' ? '#16a34a'
      : skin === 'doge' ? '#d97706'
      : skin === 'pika' ? '#eab308'
      : skin === 'sponge' ? '#fde047'
      : skin === 'capy' ? '#78350f'
      : skin === 'popcat' || skin === 'usagi' ? '#fff7ed'
      : '#1e1b2e';
    g.strokeStyle = '#141020';
    g.lineWidth = 11.5;
    g.beginPath();
    g.moveTo(-13, -30); g.lineTo(-16 - legStep * 0.3, -4 + legStep * 0.5);
    g.moveTo(13, -30);  g.lineTo(16 + legStep * 0.3, -4 - legStep * 0.5);
    g.stroke();
    g.strokeStyle = legCol;
    g.lineWidth = 7.5;
    g.beginPath();
    g.moveTo(-13, -30); g.lineTo(-16 - legStep * 0.3, -4 + legStep * 0.5);
    g.moveTo(13, -30);  g.lineTo(16 + legStep * 0.3, -4 - legStep * 0.5);
    g.stroke();

    // 1. 🐼 GẤU TRÚC BỰA (Biaoqing Panda Meme kinh điển)
    if (skin === 'panda') {
      g.fillStyle = '#334155'; g.strokeStyle = '#0f172a'; g.lineWidth = 3.2;
      roundRect(-24, -62, 48, 40, 14); g.fill(); g.stroke();
      g.fillStyle = '#94a3b8';
      g.fillRect(-16, -62, 7, 36); g.fillRect(9, -62, 7, 36);
      g.fillStyle = '#fbbf24';
      g.beginPath(); g.arc(-12.5, -46, 2.5, 0, 6.28); g.arc(12.5, -46, 2.5, 0, 6.28); g.fill();
      // Tay trắng quẩy sung
      g.strokeStyle = '#0f172a'; g.lineWidth = 11;
      g.beginPath();
      g.moveTo(-24, -52); g.lineTo(-45, -76 + armWave * 19);
      g.moveTo(24, -52);  g.lineTo(45, -76 - armWave * 19);
      g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 6.5; g.stroke();
      // Tai gấu trúc đen + Đầu trắng to tròn
      g.fillStyle = '#0f172a';
      g.beginPath(); g.arc(-25, -109, 11.5, 0, 6.28); g.arc(25, -109, 11.5, 0, 6.28); g.fill();
      g.fillStyle = '#ffffff'; g.strokeStyle = '#0f172a'; g.lineWidth = 3.4;
      g.beginPath(); g.arc(0, -86, 34, 0, 6.28); g.fill(); g.stroke();
      // Mặt meme bựa bên trong
      g.strokeStyle = '#cbd5e1'; g.lineWidth = 1.8;
      g.beginPath(); g.arc(0, -83, 23, 0, 6.28); g.stroke();
      g.fillStyle = '#0f172a';
      g.fillRect(-16, -95, 11, 3.4); g.fillRect(5, -95, 11, 3.4);
      g.beginPath(); g.arc(-9.5, -88, 3.1, 0, 6.28); g.arc(9.5, -88, 3.1, 0, 6.28); g.fill();
      g.fillStyle = '#fda4af';
      g.beginPath(); g.ellipse(-16, -81, 5, 3, 0, 0, 6.28); g.ellipse(16, -81, 5, 3, 0, 0, 6.28); g.fill();
      // Nụ cười nhe răng nhây bựa
      g.fillStyle = '#ffffff'; g.strokeStyle = '#0f172a'; g.lineWidth = 2.4;
      g.beginPath(); g.arc(0, -78, 11.5, 0.08, Math.PI - 0.08); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-6, -78); g.lineTo(-6, -69); g.moveTo(0, -78); g.lineTo(0, -67); g.moveTo(6, -78); g.lineTo(6, -69); g.stroke();
      return;
    }

    // 2. 🐸 ẾCH XANH PEPE (Pepe the Frog Meme huyền thoại)
    if (skin === 'pepe') {
      g.fillStyle = '#2563eb'; g.strokeStyle = '#0f172a'; g.lineWidth = 3.2;
      roundRect(-24, -62, 48, 40, 13); g.fill(); g.stroke();
      // Hai tay ếch xanh vung que phát sáng
      for (const d of [-1, 1]) {
        const hx = d * 43, hy = -74 + d * armWave * 18;
        g.strokeStyle = '#0f172a'; g.lineWidth = 10.5;
        g.beginPath(); g.moveTo(d * 22, -52); g.lineTo(hx, hy); g.stroke();
        g.strokeStyle = '#4ade80'; g.lineWidth = 6.5; g.stroke();
        g.strokeStyle = d < 0 ? '#f43f5e' : '#22d3ee'; g.lineWidth = 4.5;
        g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + d * 11, hy - 20); g.stroke();
      }
      // Đầu ếch xanh + 2 bầu mắt lồi đặc trưng của Pepe
      g.fillStyle = '#4ade80'; g.strokeStyle = '#0f172a'; g.lineWidth = 3.2;
      g.beginPath(); g.arc(-13, -104, 15, 0, 6.28); g.arc(13, -104, 15, 0, 6.28); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(0, -84, 34, 26, 0, 0, 6.28); g.fill(); g.stroke();
      // Đôi mắt trắng to liếc sang bên cực hài
      g.fillStyle = '#ffffff'; g.lineWidth = 2.6;
      g.beginPath(); g.ellipse(-12, -98, 10.5, 9, 0, 0, 6.28); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(12, -98, 10.5, 9, 0, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#090d16';
      g.beginPath(); g.arc(-9, -98, 4.5, 0, 6.28); g.arc(15, -98, 4.5, 0, 6.28); g.fill();
      // Mí mắt xanh Pepe
      g.fillStyle = '#22c55e';
      g.beginPath(); g.ellipse(-12, -103, 10.5, 4, 0, Math.PI, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(12, -103, 10.5, 4, 0, Math.PI, Math.PI * 2); g.fill();
      // Đôi môi dày cam-đỏ đặc trưng của Pepe
      g.fillStyle = '#dc2626'; g.strokeStyle = '#0f172a'; g.lineWidth = 2.4;
      roundRect(-22, -79, 44, 10, 5); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-19, -74); g.quadraticCurveTo(0, -70, 19, -74); g.stroke();
      return;
    }

    // 3. 🐶 CHÓ SHIBA DOGE / CHEEMS (Meme Shiba vàng liếc mắt)
    if (skin === 'doge') {
      g.fillStyle = '#f59e0b'; g.strokeStyle = '#1c1917'; g.lineWidth = 3.2;
      g.beginPath(); g.ellipse(0, -44, 26, 26, 0, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#fef3c7';
      g.beginPath(); g.ellipse(0, -42, 16, 18, 0, 0, 6.28); g.fill();
      // Đuôi Shiba cuộn tròn vẫy tít
      g.strokeStyle = '#f59e0b'; g.lineWidth = 8;
      g.beginPath(); g.arc(-26, -34, 9, 0.5, Math.PI * 1.6); g.stroke();
      // Hai tay vẫy
      g.strokeStyle = '#1c1917'; g.lineWidth = 10;
      g.beginPath();
      g.moveTo(-22, -50); g.lineTo(-42, -70 + armWave * 17);
      g.moveTo(22, -50);  g.lineTo(42, -70 - armWave * 17);
      g.stroke();
      g.strokeStyle = '#f59e0b'; g.lineWidth = 6; g.stroke();
      // Tai nhọn tam giác Shiba
      for (const d of [-1, 1]) {
        g.fillStyle = '#f59e0b'; g.strokeStyle = '#1c1917'; g.lineWidth = 3;
        g.beginPath();
        g.moveTo(d * 8, -108); g.lineTo(d * 27, -126); g.lineTo(d * 28, -96);
        g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#fef3c7';
        g.beginPath();
        g.moveTo(d * 12, -107); g.lineTo(d * 24, -120); g.lineTo(d * 24, -99);
        g.closePath(); g.fill();
      }
      // Đầu tròn Shiba + má kem trắng
      g.fillStyle = '#f59e0b'; g.strokeStyle = '#1c1917'; g.lineWidth = 3.2;
      g.beginPath(); g.arc(0, -85, 31, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#fef3c7';
      g.beginPath(); g.ellipse(0, -76, 22, 16, 0, 0, 6.28); g.fill();
      g.beginPath(); g.arc(-11, -95, 4, 0, 6.28); g.arc(11, -95, 4, 0, 6.28); g.fill();
      // Mắt liếc xéo đặc trưng của Doge
      g.fillStyle = '#ffffff'; g.strokeStyle = '#1c1917'; g.lineWidth = 2.2;
      g.beginPath(); g.ellipse(-11, -87, 7, 5, 0, 0, 6.28); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(11, -87, 7, 5, 0, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#1c1917';
      g.beginPath(); g.arc(-8.5, -87, 3.2, 0, 6.28); g.arc(13.5, -87, 3.2, 0, 6.28); g.fill();
      // Mũi đen & miệng cười nhếch mép Doge
      g.beginPath(); g.ellipse(0, -78, 5, 3.6, 0, 0, 6.28); g.fill();
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(-8, -71); g.quadraticCurveTo(0, -67, 10, -73); g.stroke();
      return;
    }

    // 4. 🐰 THỎ USAGI (Chiikawa / Thỏ Trắng Meme quẩy điên cuồng)
    if (skin === 'usagi') {
      g.fillStyle = '#fffbeb'; g.strokeStyle = '#1e1b24'; g.lineWidth = 3.2;
      g.beginPath(); g.ellipse(0, -44, 28, 33, 0, 0, 6.28); g.fill(); g.stroke();
      for (const d of [-1, 1]) {
        g.save();
        g.translate(d * 13, -98);
        g.rotate(d * 0.12 + armWave * 0.18);
        g.fillStyle = '#fffbeb';
        g.beginPath(); g.ellipse(0, -23, 8.8, 25, 0, 0, 6.28); g.fill(); g.stroke();
        g.fillStyle = '#fda4af';
        g.beginPath(); g.ellipse(0, -22, 4.4, 15, 0, 0, 6.28); g.fill();
        g.restore();
      }
      g.fillStyle = '#fffbeb';
      g.beginPath(); g.arc(0, -78, 30, 0, 6.28); g.fill(); g.stroke();
      g.lineWidth = 8.5; g.strokeStyle = '#1e1b24';
      g.beginPath();
      g.moveTo(-25, -48); g.lineTo(-44, -69 + armWave * 18);
      g.moveTo(25, -48);  g.lineTo(44, -69 - armWave * 18);
      g.stroke();
      g.lineWidth = 5; g.strokeStyle = '#fffbeb'; g.stroke();
      g.fillStyle = '#fda4af';
      g.beginPath(); g.ellipse(-17, -72, 6.5, 4, 0, 0, 6.28); g.ellipse(17, -72, 6.5, 4, 0, 0, 6.28); g.fill();
      g.fillStyle = '#18181b';
      g.beginPath(); g.arc(-10, -80, 3.8, 0, 6.28); g.arc(10, -80, 3.8, 0, 6.28); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(-11, -81.5, 1.3, 0, 6.28); g.arc(9, -81.5, 1.3, 0, 6.28); g.fill();
      g.strokeStyle = '#18181b'; g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-5, -73); g.quadraticCurveTo(0, -69, 5, -73);
      g.moveTo(0, -70); g.lineTo(0, -64);
      g.stroke();
      return;
    }

    // 5. 🖍️ SHIN CẬU BÉ BÚT CHÌ (Áo đỏ quần vàng, mày sâu róm, má bánh bao)
    if (skin === 'shin') {
      // Quần đùi vàng + Áo thun đỏ đặc trưng
      g.fillStyle = '#fde047'; g.strokeStyle = '#18181b'; g.lineWidth = 3;
      roundRect(-22, -38, 44, 18, 7); g.fill(); g.stroke();
      g.fillStyle = '#ef4444';
      roundRect(-24, -64, 48, 30, 10); g.fill(); g.stroke();
      // Tay vung múa điệu lắc mông
      g.strokeStyle = '#18181b'; g.lineWidth = 10;
      g.beginPath();
      g.moveTo(-23, -54); g.lineTo(-43, -72 + armWave * 18);
      g.moveTo(23, -54);  g.lineTo(43, -72 - armWave * 18);
      g.stroke();
      g.strokeStyle = '#fed7aa'; g.lineWidth = 6; g.stroke();
      // Khuôn mặt củ khoai má phệ sang một bên đặc trưng của Shin
      g.fillStyle = '#fed7aa'; g.strokeStyle = '#18181b'; g.lineWidth = 3.2;
      g.beginPath();
      g.arc(-2, -85, 29, 0, 6.28);
      g.arc(14, -77, 18, 0, 6.28);
      g.fill();
      g.beginPath(); g.ellipse(3, -83, 33, 27, 0, 0, 6.28); g.fill(); g.stroke();
      // Mái tóc húi cua đen mỏng trên đỉnh
      g.fillStyle = '#18181b';
      g.beginPath(); g.ellipse(0, -105, 25, 9, 0, Math.PI, Math.PI * 2); g.fill();
      // Cặp lông mày sâu róm cực dày nhướn theo nhịp Bass!
      const browLift = kick * 4;
      g.strokeStyle = '#09090b'; g.lineWidth = 6.8;
      g.beginPath();
      g.moveTo(-20, -96 - browLift); g.quadraticCurveTo(-11, -104 - browLift, -3, -96 - browLift);
      g.moveTo(3, -96 - browLift);   g.quadraticCurveTo(12, -104 - browLift, 21, -96 - browLift);
      g.stroke();
      // Mắt to tròn & miệng chữ "O" tinh nghịch
      g.fillStyle = '#ffffff'; g.strokeStyle = '#18181b'; g.lineWidth = 2.4;
      g.beginPath(); g.arc(-10, -85, 6, 0, 6.28); g.arc(10, -85, 6, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#18181b';
      g.beginPath(); g.arc(-10, -85, 2.8, 0, 6.28); g.arc(10, -85, 2.8, 0, 6.28); g.fill();
      g.fillStyle = '#fb7185';
      g.beginPath(); g.arc(18, -75, 5.5, 0, 6.28); g.fill();
      g.fillStyle = '#be123c'; g.strokeStyle = '#18181b'; g.lineWidth = 2.2;
      g.beginPath(); g.ellipse(2, -72, 4.8, 6.5, 0, 0, 6.28); g.fill(); g.stroke();
      return;
    }

    // 6. ⚡ PIKACHU MEME (Vàng rực, chóp tai đen, má đỏ phóng điện)
    if (skin === 'pika') {
      // Đuôi tia chớp vàng phía sau
      g.fillStyle = '#facc15'; g.strokeStyle = '#18181b'; g.lineWidth = 2.8;
      g.beginPath();
      g.moveTo(16, -34); g.lineTo(32, -48); g.lineTo(25, -54); g.lineTo(44, -72);
      g.lineTo(34, -76); g.lineTo(18, -56); g.lineTo(24, -50); g.closePath();
      g.fill(); g.stroke();
      // Thân tròn vàng
      g.fillStyle = '#facc15';
      g.beginPath(); g.ellipse(0, -45, 26, 29, 0, 0, 6.28); g.fill(); g.stroke();
      // Hai tai dài chóp đen
      for (const d of [-1, 1]) {
        g.save();
        g.translate(d * 16, -102);
        g.rotate(d * 0.34 + armWave * 0.16);
        g.fillStyle = '#facc15'; g.strokeStyle = '#18181b'; g.lineWidth = 3;
        g.beginPath(); g.ellipse(0, -22, 8.5, 24, 0, 0, 6.28); g.fill(); g.stroke();
        g.fillStyle = '#18181b';
        g.beginPath(); g.ellipse(0, -37, 6.5, 10, 0, 0, 6.28); g.fill();
        g.restore();
      }
      // Đầu Pikachu + tay vẫy
      g.fillStyle = '#facc15'; g.strokeStyle = '#18181b'; g.lineWidth = 3.2;
      g.beginPath(); g.arc(0, -82, 30, 0, 6.28); g.fill(); g.stroke();
      g.lineWidth = 9;
      g.beginPath();
      g.moveTo(-23, -50); g.lineTo(-41, -70 + armWave * 16);
      g.moveTo(23, -50);  g.lineTo(41, -70 - armWave * 16);
      g.stroke();
      g.strokeStyle = '#facc15'; g.lineWidth = 5.5; g.stroke();
      // Hai má đỏ phóng điện
      g.fillStyle = '#ef4444';
      g.beginPath(); g.arc(-19, -75, 6.8, 0, 6.28); g.arc(19, -75, 6.8, 0, 6.28); g.fill();
      if (kick > 0.45) {
        g.strokeStyle = '#fef08a'; g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(-27, -75); g.lineTo(-35, -80); g.lineTo(-31, -72);
        g.moveTo(27, -75);  g.lineTo(35, -80);  g.lineTo(31, -72);
        g.stroke();
      }
      // Mắt đen long lanh + miệng Surprised / Cute
      g.fillStyle = '#18181b';
      g.beginPath(); g.arc(-11, -85, 4.4, 0, 6.28); g.arc(11, -85, 4.4, 0, 6.28); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(-12.2, -86.5, 1.6, 0, 6.28); g.arc(9.8, -86.5, 1.6, 0, 6.28); g.fill();
      g.fillStyle = '#fb7185'; g.strokeStyle = '#18181b'; g.lineWidth = 2.2;
      g.beginPath(); g.ellipse(0, -74, 5.5, 4.5 + kick * 3, 0, 0, 6.28); g.fill(); g.stroke();
      return;
    }

    // 7. 🧽 SPONGEBOB BỌT BIỂN VÀNG (Vuông vức, mắt xanh to, 2 răng cửa thỏ)
    if (skin === 'sponge') {
      // Thân bọt biển hình chữ nhật đứng
      g.fillStyle = '#fde047'; g.strokeStyle = '#18181b'; g.lineWidth = 3.2;
      roundRect(-28, -112, 56, 68, 8); g.fill(); g.stroke();
      // Áo sơ mi trắng + Quần tây nâu + Cà vạt đỏ
      g.fillStyle = '#ffffff';
      g.fillRect(-27, -48, 54, 10);
      g.fillStyle = '#78350f';
      roundRect(-28, -38, 56, 16, 4); g.fill(); g.stroke();
      g.fillStyle = '#ef4444';
      g.beginPath(); g.moveTo(-4, -48); g.lineTo(4, -48); g.lineTo(5, -34); g.lineTo(0, -30); g.lineTo(-5, -34); g.closePath(); g.fill();
      // Lỗ bọt biển đặc trưng
      g.fillStyle = '#ca8a04';
      g.beginPath();
      g.arc(-20, -102, 3.5, 0, 6.28); g.arc(21, -98, 4, 0, 6.28); g.arc(-21, -60, 3, 0, 6.28); g.arc(20, -62, 3.2, 0, 6.28);
      g.fill();
      // Hai tay vàng mảnh quẩy nhiệt tình
      g.strokeStyle = '#18181b'; g.lineWidth = 8;
      g.beginPath();
      g.moveTo(-28, -62); g.lineTo(-46, -82 + armWave * 18);
      g.moveTo(28, -62);  g.lineTo(46, -82 - armWave * 18);
      g.stroke();
      g.strokeStyle = '#fde047'; g.lineWidth = 4.5; g.stroke();
      // Hai mắt tròn to sát nhau màu xanh dương
      g.fillStyle = '#ffffff'; g.strokeStyle = '#18181b'; g.lineWidth = 2.4;
      g.beginPath(); g.arc(-10, -88, 10.5, 0, 6.28); g.arc(10, -88, 10.5, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#38bdf8';
      g.beginPath(); g.arc(-9, -88, 5.2, 0, 6.28); g.arc(9, -88, 5.2, 0, 6.28); g.fill();
      g.fillStyle = '#09090b';
      g.beginPath(); g.arc(-9, -88, 2.5, 0, 6.28); g.arc(9, -88, 2.5, 0, 6.28); g.fill();
      // Miệng cười rộng + 2 chiếc răng thỏ trắng tinh
      g.strokeStyle = '#18181b'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(0, -76, 14, 0.15, Math.PI - 0.15); g.stroke();
      g.fillStyle = '#ffffff'; g.lineWidth = 2;
      g.fillRect(-6, -65, 5.5, 7); g.strokeRect(-6, -65, 5.5, 7);
      g.fillRect(0.5, -65, 5.5, 7); g.strokeRect(0.5, -65, 5.5, 7);
      return;
    }

    // 8. 🐱 MÈO POPCAT (Há miệng chữ "O" bự chảng theo từng nhịp Bass!)
    if (skin === 'popcat') {
      g.fillStyle = '#f8fafc'; g.strokeStyle = '#1e293b'; g.lineWidth = 3.2;
      g.beginPath(); g.ellipse(0, -45, 27, 30, 0, 0, 6.28); g.fill(); g.stroke();
      // Hai tai mèo nhọn
      for (const d of [-1, 1]) {
        g.fillStyle = '#94a3b8'; g.strokeStyle = '#1e293b'; g.lineWidth = 3;
        g.beginPath();
        g.moveTo(d * 8, -106); g.lineTo(d * 26, -124); g.lineTo(d * 28, -94);
        g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#fda4af';
        g.beginPath();
        g.moveTo(d * 12, -105); g.lineTo(d * 23, -118); g.lineTo(d * 24, -97);
        g.closePath(); g.fill();
      }
      // Đầu mèo trắng đốm xám + tay vẫy
      g.fillStyle = '#f8fafc'; g.strokeStyle = '#1e293b'; g.lineWidth = 3.2;
      g.beginPath(); g.arc(0, -84, 31, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#94a3b8';
      g.beginPath(); g.arc(-16, -103, 11, 0, 6.28); g.arc(16, -103, 11, 0, 6.28); g.fill();
      g.strokeStyle = '#1e293b'; g.lineWidth = 9.5;
      g.beginPath();
      g.moveTo(-24, -50); g.lineTo(-43, -72 + armWave * 17);
      g.moveTo(24, -50);  g.lineTo(43, -72 - armWave * 17);
      g.stroke();
      g.strokeStyle = '#f8fafc'; g.lineWidth = 5.5; g.stroke();
      // Mắt hạt đậu đen láy
      g.fillStyle = '#0f172a';
      g.beginPath(); g.arc(-12, -91, 3.8, 0, 6.28); g.arc(12, -91, 3.8, 0, 6.28); g.fill();
      // Miệng POPCAT đóng mở chữ O khổng lồ theo phách nhạc!
      const popOpen = beatPos < 0.5;
      if (popOpen) {
        g.fillStyle = '#fb7185'; g.strokeStyle = '#1e293b'; g.lineWidth = 2.8;
        g.beginPath(); g.ellipse(0, -74, 15, 13, 0, 0, 6.28); g.fill(); g.stroke();
        g.fillStyle = '#be123c';
        g.beginPath(); g.ellipse(0, -77, 10, 6, 0, 0, 6.28); g.fill();
      } else {
        g.strokeStyle = '#1e293b'; g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(-8, -77); g.quadraticCurveTo(-4, -73, 0, -77);
        g.quadraticCurveTo(4, -73, 8, -77);
        g.stroke();
      }
      return;
    }

    // 9. 🦫 CAPYBARA ĐỘI CAM (Bộ trưởng ngoại giao chill phết đội quả quýt trên đầu)
    if (skin === 'capy') {
      g.fillStyle = '#b45309'; g.strokeStyle = '#291505'; g.lineWidth = 3.2;
      g.beginPath(); g.ellipse(0, -45, 28, 30, 0, 0, 6.28); g.fill(); g.stroke();
      // Hai tay nâu nhún nhảy chill
      g.strokeStyle = '#291505'; g.lineWidth = 10;
      g.beginPath();
      g.moveTo(-25, -50); g.lineTo(-42, -68 + armWave * 15);
      g.moveTo(25, -50);  g.lineTo(42, -68 - armWave * 15);
      g.stroke();
      g.strokeStyle = '#b45309'; g.lineWidth = 6; g.stroke();
      // Tai tròn nhỏ + Đầu Capybara hơi vuông bầu + Mõm sậm màu
      g.fillStyle = '#78350f';
      g.beginPath(); g.arc(-22, -106, 7.5, 0, 6.28); g.arc(22, -106, 7.5, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#b45309';
      roundRect(-30, -108, 60, 48, 22); g.fill(); g.stroke();
      g.fillStyle = '#78350f';
      roundRect(-14, -90, 28, 24, 11); g.fill();
      // Đôi mắt lim dim bất biến giữa dòng đời vạn biến
      g.strokeStyle = '#1c0f04'; g.lineWidth = 3;
      g.beginPath();
      g.moveTo(-22, -92); g.lineTo(-13, -92);
      g.moveTo(13, -92);  g.lineTo(22, -92);
      g.moveTo(-4, -82);  g.lineTo(4, -82);
      g.moveTo(0, -82);   g.lineTo(0, -73);
      g.moveTo(-6, -72);  g.quadraticCurveTo(0, -69, 6, -72);
      g.stroke();
      // Quả cam tươi + chiếc lá xanh đội ngay trên đỉnh đầu!
      g.fillStyle = '#f97316'; g.strokeStyle = '#291505'; g.lineWidth = 2.4;
      g.beginPath(); g.arc(0, -118, 10.5, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#22c55e';
      g.beginPath(); g.ellipse(5, -129, 6, 3.2, -0.4, 0, 6.28); g.fill();
      return;
    }

    // 10. 🎀 BÉ HỒNG MARUKO MEME (Váy hồng chấm bi, tóc mái răng cưa, mặt meme lầy lội)
    if (skin === 'maruko') {
      g.fillStyle = '#f43f5e'; g.strokeStyle = '#1f1224'; g.lineWidth = 3;
      g.beginPath();
      g.moveTo(-18, -62); g.lineTo(18, -62);
      g.lineTo(31, -22);  g.lineTo(-31, -22);
      g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#ffe4e6'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-28, -25); g.lineTo(28, -25); g.stroke();
      g.fillStyle = '#ffe4e6';
      g.beginPath(); g.arc(-10, -42, 3, 0, 6.28); g.arc(10, -45, 3, 0, 6.28); g.arc(0, -34, 3, 0, 6.28); g.fill();
      g.strokeStyle = '#1f1224'; g.lineWidth = 9.5;
      g.beginPath();
      g.moveTo(-20, -54); g.lineTo(-42, -73 + armWave * 17);
      g.moveTo(20, -54);  g.lineTo(42, -73 - armWave * 17);
      g.stroke();
      g.strokeStyle = '#fde68a'; g.lineWidth = 5.5; g.stroke();
      g.fillStyle = '#18181b';
      g.beginPath(); g.arc(0, -88, 35, Math.PI * 0.84, Math.PI * 2.16); g.fill();
      g.fillStyle = '#fde7d3'; g.strokeStyle = '#1f1224'; g.lineWidth = 3;
      g.beginPath(); g.arc(0, -84, 30, 0, 6.28); g.fill(); g.stroke();
      // Mái ngố răng cưa đặc trưng của Maruko
      g.fillStyle = '#18181b';
      g.beginPath();
      g.arc(0, -89, 31, Math.PI, Math.PI * 2);
      g.lineTo(29, -86); g.lineTo(18, -93); g.lineTo(9, -85); g.lineTo(0, -93);
      g.lineTo(-9, -85); g.lineTo(-18, -93); g.lineTo(-29, -86);
      g.closePath(); g.fill();
      g.fillStyle = '#fb7185';
      g.beginPath(); g.arc(-16, -75, 5.8, 0, 6.28); g.arc(16, -75, 5.8, 0, 6.28); g.fill();
      g.fillStyle = '#18181b';
      g.beginPath(); g.arc(-10, -80, 3.4, 0, 6.28); g.arc(10, -80, 3.4, 0, 6.28); g.fill();
      g.fillStyle = '#e11d48';
      g.beginPath(); g.arc(0, -70, 5.5, 0, 6.28); g.fill();
      return;
    }

    // 11. 🐵 TỀ THIÊN ĐẠI THÁNH (Biến hình đặc biệt: gõ "ngộ không")
    if (skin === 'wukong') {
      g.fillStyle = '#d97706'; g.strokeStyle = '#451a03'; g.lineWidth = 3.2;
      roundRect(-24, -64, 48, 42, 12); g.fill(); g.stroke();
      g.fillStyle = '#dc2626';
      g.fillRect(-14, -62, 28, 16);
      g.save();
      g.translate(34, -66);
      g.rotate(armWave * 1.15 + 0.4);
      g.strokeStyle = '#ef4444'; g.lineWidth = 6.5;
      g.beginPath(); g.moveTo(0, -46); g.lineTo(0, 46); g.stroke();
      g.strokeStyle = '#fde047'; g.lineWidth = 7.5;
      g.beginPath(); g.moveTo(0, -48); g.lineTo(0, -33); g.moveTo(0, 33); g.lineTo(0, 48); g.stroke();
      g.restore();
      g.strokeStyle = '#f59e0b'; g.lineWidth = 3.6;
      g.beginPath();
      g.moveTo(-6, -114); g.quadraticCurveTo(-36, -148, -52, -126 + armWave * 8);
      g.moveTo(6, -114);  g.quadraticCurveTo(36, -148, 52, -126 - armWave * 8);
      g.stroke();
      g.fillStyle = '#b45309'; g.strokeStyle = '#451a03'; g.lineWidth = 3;
      g.beginPath(); g.arc(0, -86, 31, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#fde68a';
      g.beginPath(); g.arc(0, -83, 24, 0, 6.28); g.fill();
      g.strokeStyle = '#fde047'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(-28, -98); g.quadraticCurveTo(0, -106, 28, -98); g.stroke();
      g.fillStyle = '#dc2626';
      g.beginPath(); g.arc(-9, -86, 4, 0, 6.28); g.arc(9, -86, 4, 0, 6.28); g.fill();
      return;
    }

    // 12. 👑 HOÀNG ĐẾ MEME (Biến hình VIP: gõ "vua" hoặc tặng quà lớn)
    if (skin === 'king') {
      g.fillStyle = '#b91c1c';
      g.beginPath();
      g.moveTo(-24, -64); g.lineTo(24, -64);
      g.lineTo(38, -16);  g.lineTo(-38, -16);
      g.closePath(); g.fill();
      g.strokeStyle = '#fef08a'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#ffffff';
      roundRect(-26, -66, 52, 13, 6); g.fill();
      g.strokeStyle = '#fbbf24'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(34, -22); g.lineTo(40, -88 + armWave * 8); g.stroke();
      g.fillStyle = '#38bdf8';
      g.beginPath(); g.arc(40, -92 + armWave * 8, 8.5, 0, 6.28); g.fill();
      // Mặt Gấu Trúc Hoàng Đế đeo kính đen cực chất
      g.fillStyle = '#ffffff'; g.strokeStyle = '#18181b'; g.lineWidth = 3.2;
      g.beginPath(); g.arc(0, -86, 30, 0, 6.28); g.fill(); g.stroke();
      g.fillStyle = '#090d16';
      roundRect(-19, -92, 17, 9.5, 3); g.fill();
      roundRect(2, -92, 17, 9.5, 3); g.fill();
      g.strokeStyle = '#18181b'; g.lineWidth = 2.4;
      g.beginPath(); g.arc(0, -76, 8, 0.1, Math.PI - 0.1); g.stroke();
      g.fillStyle = '#fbbf24'; g.strokeStyle = '#92400e'; g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(-24, -108);
      g.lineTo(-27, -133); g.lineTo(-12, -118);
      g.lineTo(0, -138);   g.lineTo(12, -118);
      g.lineTo(27, -133);  g.lineTo(24, -108);
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#ef4444';
      g.beginPath(); g.arc(0, -117, 4.5, 0, 6.28); g.fill();
      return;
    }

    // 13. 🚀 PHI CÔNG TÊN LỬA (Biến hình bay lượn: gõ "phi công")
    g.fillStyle = '#38bdf8';
    g.beginPath();
    g.moveTo(-52, -48); g.lineTo(52, -48);
    g.lineTo(26, -34);  g.lineTo(-26, -34);
    g.closePath(); g.fill();
    g.fillStyle = kick > 0.4 ? '#fde047' : '#fb7185';
    g.beginPath();
    g.moveTo(-22, -28); g.lineTo(-14, -3 - kick * 13); g.lineTo(-6, -28);
    g.moveTo(6, -28);   g.lineTo(14, -3 - kick * 13);  g.lineTo(22, -28);
    g.fill();
    g.fillStyle = '#1e3a8a'; g.strokeStyle = '#0f172a'; g.lineWidth = 2.8;
    roundRect(-22, -64, 44, 40, 12); g.fill(); g.stroke();
    g.fillStyle = '#f59e0b';
    g.beginPath(); g.arc(0, -86, 29, 0, 6.28); g.fill(); g.stroke();
    g.fillStyle = '#fef3c7';
    g.beginPath(); g.ellipse(0, -78, 19, 13, 0, 0, 6.28); g.fill();
    g.fillStyle = '#0284c7';
    g.beginPath(); g.arc(0, -90, 31, Math.PI * 0.92, Math.PI * 2.08); g.fill();
    g.fillStyle = '#bae6fd'; g.strokeStyle = '#0f172a'; g.lineWidth = 2.5;
    roundRect(-22, -106, 20, 12, 5); g.fill(); g.stroke();
    roundRect(2, -106, 20, 12, 5); g.fill(); g.stroke();
    g.fillStyle = '#0f172a';
    g.beginPath(); g.arc(-9, -84, 3.2, 0, 6.28); g.arc(9, -84, 3.2, 0, 6.28); g.fill();
  }

  // Huy chương Avatar phát sáng có cánh & vòng năng lượng xoay tròn NGAY TRÊN TÊN của mỗi người tham gia
  function drawDancerTag(p, x, y, s, t, kick, th, isCenter = false) {
    const f = clamp(s / 0.78, 0.72, 1.28);
    const vip = isCenter || p.diamonds > 0 || p.skin === 'king' || p === spotlight?.p;
    const fs = Math.round((isCenter ? 17.5 : 15.5) * f);
    const fontStr = `800 ${fs}px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif`;

    g.save();
    g.font = fontStr;
    const cleanName = fitText(p.name, isCenter ? 185 : 136, fontStr);
    const displayLabel = isCenter ? `🌟 ${cleanName}` : (vip ? `👑 ${cleanName}` : cleanName);
    const tw = g.measureText(displayLabel).width;
    const pillW = Math.round(tw + 22 * f);
    const pillH = Math.round(fs + 10 * f);
    const pillX = Math.round(x - pillW / 2);
    const pillY = Math.round(y - pillH);

    // 1. Vòng tròn Hình Đại Diện (Avatar Medallion) + Hiệu ứng hào quang xoay nằm TRÊN bảng tên
    const avR = Math.round((isCenter ? 29 : vip ? 23 : 19.5) * f);
    const avX = Math.round(x);
    const avY = Math.round(pillY - avR - 6 * f);

    // Hào quang nhịp Bass tỏa sáng sau lưng Avatar
    g.save();
    g.globalCompositeOperation = 'lighter';
    const haloR = avR * (1.85 + kick * 0.36);
    const hg = g.createRadialGradient(avX, avY, avR * 0.35, avX, avY, haloR);
    if (vip) {
      hg.addColorStop(0, `rgba(253, 224, 71, ${0.52 + kick * 0.22})`);
      hg.addColorStop(0.55, 'rgba(236, 72, 153, 0.24)');
    } else {
      hg.addColorStop(0, `rgba(${th.beamA}, ${0.40 + kick * 0.20})`);
      hg.addColorStop(0.55, `rgba(${th.beamB}, 0.18)`);
    }
    hg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = hg;
    g.beginPath();
    g.arc(avX, avY, haloR, 0, 6.28);
    g.fill();

    // Đôi cánh năng lượng hai bên Avatar (cánh Hoàng Kim cho VIP/Lên Chính, cánh Neon cho dân chơi)
    const wingFlap = Math.sin(t / 135 + p.phase) * 0.14;
    for (const dir of [-1, 1]) {
      g.save();
      g.translate(avX, avY);
      g.scale(dir, 1);
      g.rotate(wingFlap);
      g.fillStyle = vip ? '#fbbf24' : th.pri;
      g.globalAlpha = vip ? 0.9 : (0.52 + kick * 0.25);
      const ws = vip ? 1.15 * f : 0.88 * f;
      g.beginPath();
      g.moveTo(avR * 0.82, -4 * ws);
      g.quadraticCurveTo(avR + 18 * ws, -18 * ws, avR + 22 * ws, -5 * ws);
      g.quadraticCurveTo(avR + 14 * ws, 2 * ws, avR + 18 * ws, 8 * ws);
      g.quadraticCurveTo(avR + 8 * ws, 12 * ws, avR * 0.82, 6 * ws);
      g.closePath();
      g.fill();
      g.restore();
    }

    // Vòng cung Neon kép xoay ngược chiều + Hạt sao vệ tinh bay quanh Avatar
    const ringR = avR + 4.5 * f;
    const rot = t * 0.0038 + p.phase;
    const cArc1 = vip ? '#fde047' : th.pri;
    const cArc2 = isCenter ? '#ffffff' : th.sec;
    g.lineCap = 'round';
    g.lineWidth = Math.max(2, 2.6 * f);

    g.strokeStyle = cArc1;
    g.beginPath();
    g.arc(avX, avY, ringR, rot, rot + 1.85);
    g.stroke();

    g.strokeStyle = cArc2;
    g.beginPath();
    g.arc(avX, avY, ringR, rot + Math.PI, rot + Math.PI + 1.85);
    g.stroke();

    // 2 hạt sao sáng quay quanh viền Avatar
    for (let k = 0; k < 2; k++) {
      const oa = rot + k * Math.PI + 1.85;
      const ox = avX + Math.cos(oa) * ringR;
      const oy = avY + Math.sin(oa) * ringR;
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(ox, oy, Math.max(2.2, 3.1 * f), 0, 6.28);
      g.fill();
    }
    g.restore();

    // Khung tròn nền + Ảnh Đại Diện thật của người tham gia
    g.fillStyle = '#090414';
    g.beginPath();
    g.arc(avX, avY, avR + 2, 0, 6.28);
    g.fill();

    if (p.img && ok(p.img)) {
      g.save();
      g.beginPath();
      g.arc(avX, avY, avR, 0, 6.28);
      g.clip();
      g.drawImage(p.img, avX - avR, avY - avR, avR * 2, avR * 2);
      g.restore();
    } else {
      const ag = g.createLinearGradient(avX - avR, avY - avR, avX + avR, avY + avR);
      ag.addColorStop(0, `hsl(${p.hue}, 82%, 54%)`);
      ag.addColorStop(1, `hsl(${(p.hue + 45) % 360}, 84%, 30%)`);
      g.fillStyle = ag;
      g.beginPath();
      g.arc(avX, avY, avR, 0, 6.28);
      g.fill();
      g.fillStyle = '#ffffff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `800 ${Math.max(12, Math.round(avR * 0.92))}px "Be Vietnam Pro", system-ui, sans-serif`;
      g.fillText((p.name[0] || 'D').toUpperCase(), avX, avY + 1);
    }

    // Viền kim loại sáng + Ánh kính bóng trên mặt Avatar
    g.strokeStyle = vip ? '#fde047' : '#f472b6';
    g.lineWidth = vip ? 2.8 * f : 2.1 * f;
    g.beginPath();
    g.arc(avX, avY, avR + 0.5, 0, 6.28);
    g.stroke();

    g.fillStyle = 'rgba(255, 255, 255, 0.20)';
    g.beginPath();
    g.ellipse(avX - avR * 0.22, avY - avR * 0.45, avR * 0.52, avR * 0.24, -0.35, 0, 6.28);
    g.fill();

    // Vương miện nhỏ đội trên đỉnh Avatar của VIP / Ngôi Sao Lên Chính
    let crestExtra = 6 * f;
    if (vip) {
      const cy = avY - avR - 3 * f;
      const cw = 11 * f, ch = 10 * f;
      g.fillStyle = '#fbbf24';
      g.strokeStyle = '#78350f';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(avX - cw, cy);
      g.lineTo(avX - cw * 1.15, cy - ch);
      g.lineTo(avX - cw * 0.45, cy - ch * 0.45);
      g.lineTo(avX, cy - ch * 1.25);
      g.lineTo(avX + cw * 0.45, cy - ch * 0.45);
      g.lineTo(avX + cw * 1.15, cy - ch);
      g.lineTo(avX + cw, cy);
      g.closePath();
      g.fill();
      g.stroke();
      crestExtra = ch * 1.35 + 6 * f;
    }

    // 2. Bảng Tên Neon nằm ngay dưới Hình Đại Diện
    const pillGrd = g.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
    if (isCenter) {
      pillGrd.addColorStop(0, 'rgba(124, 45, 18, 0.96)');
      pillGrd.addColorStop(1, 'rgba(67, 20, 7, 0.96)');
    } else if (vip) {
      pillGrd.addColorStop(0, 'rgba(88, 18, 66, 0.94)');
      pillGrd.addColorStop(1, 'rgba(38, 8, 34, 0.95)');
    } else {
      pillGrd.addColorStop(0, 'rgba(18, 10, 36, 0.90)');
      pillGrd.addColorStop(1, 'rgba(8, 5, 20, 0.92)');
    }
    g.fillStyle = pillGrd;
    roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    g.fill();
    g.strokeStyle = vip ? '#fde047' : 'rgba(236, 72, 153, 0.72)';
    g.lineWidth = vip ? 2.2 : 1.5;
    g.stroke();

    g.font = fontStr;
    g.fillStyle = vip ? '#fef08a' : '#f8fafc';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(displayLabel, x, pillY + pillH / 2 + 0.5);
    g.restore();

    const topMost = avY - avR - crestExtra;
    return Math.round(y - topMost);
  }

  // Bảng Vinh Danh Sân Khấu Chính ("LÊN SÓNG CHÍNH") nổi bật giữa màn hình LED khi người xem gõ cú pháp!
  function drawCenterShowcase(cs, th, t, kick) {
    const p = cs.p;
    if (!p) return;
    const age = t - cs.t0;
    const rem = cs.until - t;
    const enterK = easeOut(clamp(age / 360, 0, 1));
    const exitK = clamp(rem / 420, 0, 1);
    const alpha = Math.min(clamp(age / 200, 0, 1), exitK);
    const sc = (0.84 + 0.16 * enterK) * (1 + kick * 0.024);

    const cx = 540, cy = 584;
    const w = 604, h = 166;
    const hw = w / 2, hh = h / 2;

    g.save();
    g.globalAlpha = alpha;
    g.translate(cx, cy);
    g.scale(sc, sc);

    // Quầng sáng Hoàng Kim bùng nổ phía sau bảng vinh danh
    g.save();
    g.globalCompositeOperation = 'lighter';
    const bgGlow = g.createRadialGradient(0, 0, 30, 0, 0, 360);
    bgGlow.addColorStop(0, `rgba(253, 224, 71, ${0.42 + kick * 0.16})`);
    bgGlow.addColorStop(0.55, `rgba(${th.beamB}, 0.22)`);
    bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = bgGlow;
    g.fillRect(-380, -170, 760, 340);
    g.restore();

    // Đôi cánh Đại Bàng Hoàng Kim hai bên bảng Lên Chính
    for (const dir of [-1, 1]) {
      g.save();
      g.scale(dir, 1);
      g.rotate(Math.sin(t / 150) * 0.05);
      const wg = g.createLinearGradient(hw - 10, -40, hw + 68, 30);
      wg.addColorStop(0, '#fde047');
      wg.addColorStop(1, '#f59e0b');
      g.fillStyle = wg;
      g.beginPath();
      g.moveTo(hw - 8, -28);
      g.lineTo(hw + 68, -62);
      g.lineTo(hw + 46, -22);
      g.lineTo(hw + 72, -6);
      g.lineTo(hw + 42, 16);
      g.lineTo(hw + 56, 38);
      g.lineTo(hw - 8, 34);
      g.closePath();
      g.fill();
      g.restore();
    }

    // Khung thẻ chính Cyber-Gold
    const cardGrd = g.createLinearGradient(0, -hh, 0, hh);
    cardGrd.addColorStop(0, 'rgba(36, 10, 54, 0.96)');
    cardGrd.addColorStop(0.55, 'rgba(18, 6, 32, 0.97)');
    cardGrd.addColorStop(1, 'rgba(42, 12, 34, 0.96)');
    g.fillStyle = cardGrd;
    roundRect(-hw, -hh, w, h, 24);
    g.fill();

    // Cột sóng nhạc Equalizer nhấp nháy bên trong nền thẻ
    g.save();
    roundRect(-hw + 4, -hh + 4, w - 8, h - 8, 20);
    g.clip();
    for (let i = 0; i < 24; i++) {
      const eqH = (12 + Math.abs(Math.sin(t * 0.008 + i * 0.55)) * 34) * (0.7 + kick * 0.5);
      g.fillStyle = i % 2 === 0 ? 'rgba(253, 224, 71, 0.11)' : `rgba(${th.beamA}, 0.11)`;
      g.fillRect(-hw + 14 + i * 24.5, hh - eqH, 16, eqH);
    }
    g.restore();

    g.strokeStyle = '#fde047';
    g.lineWidth = 3.5;
    roundRect(-hw, -hh, w, h, 24);
    g.stroke();
    g.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    g.lineWidth = 1.2;
    roundRect(-hw + 5, -hh + 5, w - 10, h - 10, 20);
    g.stroke();

    // Dải băng rôn tiêu đề trên đỉnh thẻ
    const headGrd = g.createLinearGradient(-210, 0, 210, 0);
    headGrd.addColorStop(0, '#f59e0b');
    headGrd.addColorStop(0.5, '#fef08a');
    headGrd.addColorStop(1, '#f59e0b');
    g.fillStyle = headGrd;
    roundRect(-222, -hh - 15, 444, 30, 15);
    g.fill();
    g.strokeStyle = '#78350f';
    g.lineWidth = 2;
    g.stroke();
    g.font = '900 14.5px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.fillStyle = '#1c0a00';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('🌟 LÊN SÓNG CHÍNH · TÂM ĐIỂM SÀN ĐÊM 🌟', 0, -hh);

    // Chân dung Avatar khổng lồ bên trái thẻ (104×104) + Vòng hào quang xoay kép
    const ax = -hw + 82, ay = 8, ar = 52;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rot = t * 0.004;
    g.lineCap = 'round';
    g.lineWidth = 4;
    g.strokeStyle = '#fde047';
    g.beginPath(); g.arc(ax, ay, ar + 8, rot, rot + 2.1); g.stroke();
    g.strokeStyle = th.sec;
    g.beginPath(); g.arc(ax, ay, ar + 8, rot + Math.PI, rot + Math.PI + 2.1); g.stroke();
    g.restore();

    g.fillStyle = '#090414';
    g.beginPath(); g.arc(ax, ay, ar + 3, 0, 6.28); g.fill();
    if (p.img && ok(p.img)) {
      g.save();
      g.beginPath(); g.arc(ax, ay, ar, 0, 6.28); g.clip();
      g.drawImage(p.img, ax - ar, ay - ar, ar * 2, ar * 2);
      g.restore();
    } else {
      const ag = g.createLinearGradient(ax - ar, ay - ar, ax + ar, ay + ar);
      ag.addColorStop(0, `hsl(${p.hue}, 84%, 54%)`);
      ag.addColorStop(1, `hsl(${(p.hue + 45) % 360}, 86%, 30%)`);
      g.fillStyle = ag;
      g.beginPath(); g.arc(ax, ay, ar, 0, 6.28); g.fill();
      g.fillStyle = '#ffffff';
      g.font = '900 42px "Be Vietnam Pro", system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText((p.name[0] || 'S').toUpperCase(), ax, ay + 2);
    }
    g.strokeStyle = '#fde047';
    g.lineWidth = 3.5;
    g.beginPath(); g.arc(ax, ay, ar + 1, 0, 6.28); g.stroke();

    // Tên người chơi + Nhân vật Meme + Lời bình luận trực tiếp bên phải
    const tx = -hw + 156;
    const maxW = w - 180;
    const nameFont = '900 29px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.font = nameFont;
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    const starName = fitText(p.name, maxW, nameFont);
    g.strokeStyle = '#090414';
    g.lineWidth = 5;
    g.strokeText(starName, tx, -34);
    g.fillStyle = '#fef08a';
    g.fillText(starName, tx, -34);

    const roleFont = '700 15.5px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.font = roleFont;
    const skinTxt = `${SKIN_LABELS[p.skin] || '🐼 Meme'}  ·  ${p.diamonds > 0 ? `💎 ${p.diamonds} Xu VIP` : '🔥 Đang Quẩy Tâm Điểm'}`;
    g.fillStyle = '#bae6fd';
    g.fillText(fitText(skinTxt, maxW, roleFont), tx, -3);

    // Khung trích dẫn bình luận
    g.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(tx, 18, maxW, 42, 12);
    g.fill();
    g.strokeStyle = 'rgba(253, 224, 71, 0.55)';
    g.lineWidth = 1.5;
    g.stroke();

    const quoteFont = '700 16.5px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
    g.font = quoteFont;
    g.fillStyle = '#ffffff';
    g.fillText(fitText(`💬 “${cs.comment}”`, maxW - 22, quoteFont), tx + 12, 39.5);

    g.restore();
  }

  function drawSpeechBubble(bub, x, y, s, t, th) {
    const f = clamp(s / 0.78, 0.76, 1.15);
    const fs = Math.round(15 * f);
    const fontStr = `700 ${fs}px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif`;
    const rem = bub.until - t;
    const alpha = rem < 450 ? Math.max(0, rem / 450) : 1;
    g.save();
    g.globalAlpha = alpha;
    g.font = fontStr;
    const txt = fitText(bub.text, 205, fontStr);
    const tw = g.measureText(txt).width;
    const w = Math.round(tw + 22);
    const h = Math.round(fs + 14);
    const rx = clamp(Math.round(x - w / 2), 116, W - 116 - w);
    const ry = Math.round(y - h);
    g.fillStyle = 'rgba(255, 255, 255, 0.96)';
    roundRect(rx, ry, w, h, 11);
    g.fill();
    g.strokeStyle = th.pri;
    g.lineWidth = 2;
    g.stroke();
    const tipX = clamp(x, rx + 12, rx + w - 12);
    g.beginPath();
    g.moveTo(tipX - 5, ry + h - 0.8);
    g.lineTo(tipX, ry + h + 6);
    g.lineTo(tipX + 5, ry + h - 0.8);
    g.closePath();
    g.fillStyle = 'rgba(255, 255, 255, 0.96)';
    g.fill();
    g.fillStyle = '#1e1b4b';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(txt, rx + w / 2, ry + h / 2 + 0.5);
    g.restore();
  }

  function drawCoupleAura(cs, t, kick) {
    const cx = (cs.a.x + cs.b.x) / 2;
    const cy = Math.min(cs.a.y, cs.b.y) - 145;
    g.save();
    g.translate(cx, cy - Math.sin(t / 180) * 8);
    const sc = 1 + kick * 0.14;
    g.scale(sc, sc);
    g.font = '48px "Segoe UI Emoji", system-ui';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('💖', 0, 0);
    g.restore();
  }

  function drawCo2Jets(t) {
    for (const j of co2Jets) {
      const k = (t - j.t0) / j.dur;
      if (k < 0 || k > 1) continue;
      const len = 450 * easeOut(Math.min(1, k * 2.5));
      const alpha = (1 - k) * 0.65;
      g.save();
      g.translate(j.x, j.y);
      g.rotate(j.dir);
      const grd = g.createLinearGradient(0, 0, 0, -len);
      grd.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grd.addColorStop(0.55, `rgba(224, 242, 254, ${alpha * 0.72})`);
      grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(-10, 0);
      g.lineTo(10, 0);
      g.lineTo(74, -len);
      g.lineTo(-74, -len);
      g.closePath();
      g.fill();
      g.restore();
    }
  }

  // Hệ thống Pháo Hoa Tầm Cao & Pháo Điện Sân Khấu rực sáng bầu trời đêm (Additive Blending)
  function drawFireworks(t) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round';

    // 1. Lõi lửa rực sáng ngay tại 4 họng pháo điện kim tuyến dọc mép bục DJ
    for (const fn of pyroFountains) {
      if (t - fn.t0 > fn.dur) continue;
      const fg = g.createRadialGradient(fn.x, fn.y - 24, 4, fn.x, fn.y - 36, 68);
      fg.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      fg.addColorStop(0.45, 'rgba(253, 224, 71, 0.55)');
      fg.addColorStop(1, 'rgba(249, 115, 22, 0)');
      g.fillStyle = fg;
      g.beginPath();
      g.ellipse(fn.x, fn.y - 36, 36, 72, 0, 0, 6.28);
      g.fill();
    }

    // 2. Vòng sóng xung kích (Shockwave Rings) & Chớp sáng tâm nổ trên không trung
    for (const sr of shockRings) {
      const k = clamp(sr.age / sr.life, 0, 1);
      const r = sr.r + (sr.maxR - sr.r) * easeOut(k);
      if (k < 0.45) {
        const flashR = r * 1.15;
        const rg = g.createRadialGradient(sr.x, sr.y, 2, sr.x, sr.y, flashR);
        rg.addColorStop(0, `rgba(255, 255, 255, ${(1 - k / 0.45) * 0.85})`);
        rg.addColorStop(0.5, `rgba(253, 224, 71, ${(1 - k / 0.45) * 0.35})`);
        rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(sr.x, sr.y, flashR, 0, 6.28);
        g.fill();
      }
      g.globalAlpha = (1 - k) * 0.85;
      g.strokeStyle = sr.color;
      g.lineWidth = Math.max(1.8, (1 - k) * 7.5);
      g.beginPath();
      g.arc(sr.x, sr.y, r, 0, 6.28);
      g.stroke();
    }
    g.globalAlpha = 1;

    // 3. Quả đạn pháo hoa đang lao vút từ sân khấu lên trời
    for (const rk of fireworkRockets) {
      g.strokeStyle = '#fde047';
      g.lineWidth = 4.8;
      g.beginPath();
      g.moveTo(rk.prevX - rk.vx * 1.6, rk.prevY - rk.vy * 1.6);
      g.lineTo(rk.x, rk.y);
      g.stroke();

      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(rk.x, rk.y, 4.5, 0, 6.28);
      g.fill();
    }

    // 4. Hàng trăm tia pháo hoa kéo vệt sáng dài & lấp lánh kim tuyến (Strobe Twinkle)
    for (const pt of particles) {
      if (pt.kind !== 'fwSpark') continue;
      const k = clamp(pt.age / pt.life, 0, 1);
      if (pt.twinkle && k > 0.52 && Math.floor((t + pt.x * 7) / 45) % 2 === 0) continue;
      const a = Math.pow(1 - k, 0.78);
      g.globalAlpha = a;

      const tailX = (pt.prevX ?? pt.x) - pt.vx * 2.1;
      const tailY = (pt.prevY ?? pt.y) - pt.vy * 2.1;
      g.strokeStyle = pt.color;
      g.lineWidth = pt.r * 1.95;
      g.beginPath();
      g.moveTo(tailX, tailY);
      g.lineTo(pt.x, pt.y);
      g.stroke();

      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(pt.x, pt.y, pt.r * 0.78, 0, 6.28);
      g.fill();
    }

    g.restore();
  }

  function drawParticles() {
    for (const pt of particles) {
      if (pt.kind === 'fwSpark') continue;
      const a = Math.max(0, 1 - pt.age / pt.life);
      g.save();
      g.globalAlpha = a;
      g.translate(pt.x, pt.y);
      if (pt.kind === 'heart') {
        g.font = `${Math.round(pt.r)}px "Segoe UI Emoji", system-ui`;
        g.textAlign = 'center';
        g.fillText('💗', 0, 0);
      } else if (pt.kind === 'confetti') {
        g.rotate(pt.rot);
        g.fillStyle = pt.color;
        g.fillRect(-pt.r, -pt.r * 0.5, pt.r * 2, pt.r);
      } else {
        g.fillStyle = pt.color;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const ang2 = ang + Math.PI / 5;
          g.lineTo(Math.cos(ang) * pt.r, Math.sin(ang) * pt.r);
          g.lineTo(Math.cos(ang2) * pt.r * 0.45, Math.sin(ang2) * pt.r * 0.45);
        }
        g.closePath();
        g.fill();
      }
      g.restore();
    }
  }

  function drawFloaters(t) {
    for (const fl of floaters) {
      const k = (t - fl.t0) / fl.dur;
      const a = k < 0.15 ? k / 0.15 : k > 0.72 ? (1 - k) / 0.28 : 1;
      g.save();
      g.globalAlpha = Math.max(0, a);
      g.font = '800 28px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
      g.textAlign = 'center';
      g.strokeStyle = '#090414';
      g.lineWidth = 6;
      const y = fl.y - k * 56;
      const x = clamp(fl.x, 220, W - 220);
      g.strokeText(fl.text, x, y);
      g.fillStyle = fl.color;
      g.fillText(fl.text, x, y);
      g.restore();
    }
  }

  function drawCameraHud(p, t, th) {
    g.save();
    const x = 136, y = 360, w = 808, h = 980;
    const len = 46;
    g.strokeStyle = 'rgba(255, 255, 255, 0.90)';
    g.lineWidth = 4.5;
    // 4 góc khung ngắm Camera Live
    g.beginPath();
    g.moveTo(x, y + len); g.lineTo(x, y); g.lineTo(x + len, y);
    g.moveTo(x + w - len, y); g.lineTo(x + w, y); g.lineTo(x + w, y + len);
    g.moveTo(x, y + h - len); g.lineTo(x, y + h); g.lineTo(x + len, y + h);
    g.moveTo(x + w - len, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - len);
    g.stroke();

    // Thanh tiêu đề REC kèm Avatar tròn của người được quay cận cảnh
    g.fillStyle = 'rgba(9, 4, 20, 0.78)';
    roundRect(x + 18, y + 16, 460, 54, 27);
    g.fill();
    g.strokeStyle = th?.pri || '#ec4899';
    g.lineWidth = 2;
    g.stroke();

    if (Math.floor(t / 420) % 2 === 0) {
      g.fillStyle = '#ef4444';
      g.beginPath(); g.arc(x + 44, y + 43, 9, 0, 6.28); g.fill();
    }
    if (p.img && ok(p.img)) {
      g.save();
      g.beginPath(); g.arc(x + 82, y + 43, 19, 0, 6.28); g.clip();
      g.drawImage(p.img, x + 63, y + 24, 38, 38);
      g.restore();
      g.strokeStyle = '#fde047'; g.lineWidth = 2;
      g.beginPath(); g.arc(x + 82, y + 43, 19, 0, 6.28); g.stroke();
    }
    const camFont = '800 21px "Be Vietnam Pro", system-ui, sans-serif';
    g.font = camFont;
    g.fillStyle = '#ffffff';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    const textX = p.img && ok(p.img) ? x + 110 : x + 64;
    g.fillText(fitText(`REC · ${p.name}`, 350, camFont), textX, y + 43.5);
    g.restore();
  }

  function roundRect(x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function fitText(s, max, fontStr) {
    g.font = fontStr;
    if (g.measureText(s).width <= max) return s;
    let out = s;
    while (out.length > 1 && g.measureText(out + '…').width > max) out = out.slice(0, -1);
    return out + '…';
  }

  const debugState = () => ({
    count: dancers.size,
    dancers: [...dancers.values()].map((d) => ({
      id: d.id,
      name: d.name,
      skin: d.skin,
      mode: d.mode,
      hasAvatar: Boolean(d.img && ok(d.img))
    })),
    centerStage: centerStage ? { name: centerStage.p?.name, comment: centerStage.comment } : null,
    fireworks: {
      rockets: fireworkRockets.length,
      rings: shockRings.length,
      pyro: pyroFountains.length,
      sparks: particles.filter((pt) => pt.kind === 'fwSpark').length
    },
    trackKind: curTrackKind,
    musicIdx
  });

  window.BarScene = { init, setConfig, onEvent, onStats, onLiveStatus, command, setPaused, isOn: () => enabled, debugState };
})();
