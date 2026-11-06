/*
 * ĐI CHÙA ONLINE — không gian chánh điện thanh tịnh, sắc nét cho StudioLive.
 * Hình ảnh chánh điện, nhân vật và hiệu ứng lấy từ dự án "Chánh Điện Online" (MIT).
 *
 * - Vào phòng / bình luận -> bước vào chánh điện, ngồi bồ đoàn tịnh tâm.
 * - Gõ "adidaphat" / "nam mô" / "thắp hương" / 🙏 -> lên trước bàn thờ tam bái, dâng hương.
 * - Bình luận ước nguyện ("cầu bình an", "thi đỗ", "sức khỏe"...) -> hiện Sớ Cầu An & lời chúc.
 * - Gõ nam / nữ / bà / sư / ni / tiểu -> đổi nhân vật ngay cả khi đang đi hoặc đang ngồi.
 * - Tặng quà -> máy quay áp sát, bảng tri ân, sen vàng nở, mưa cánh sen, giọng đọc chúc lành.
 * - Âm thanh mặc định tĩnh lặng (không tự phát nhạc nền MP3 pha tạp); chỉ vang chuông/mõ/khánh nghi lễ.
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
  // Dịch khung cảnh vừa khít để tượng Phật (y=370..675) nằm trọn dưới bảng tiêu đề (y=242..346)
  const SCENE_DY = -115;
  const FRAME_MS = 1000 / 30;
  const BASE = 'chua-assets/';
  const ALTAR = { x: 540, y: 952 };      // Lư hương đồng chính giữa bàn thờ trên hall.jpg
  const MO_POS = { x: 248, y: 995 };     // Mõ gỗ nằm bên TRÁI bàn thờ trên hall.jpg
  const BELL_POS = { x: 762, y: 995 };   // Chuông đồng nằm bên PHẢI bàn thờ trên hall.jpg
  const AISLE_X = 540;
  const OFFER_COOLDOWN = 20 * 1000;
  const RAIN_MS = 60 * 1000;
  const ENTRY_Y = 1525; // Ngưỡng vừa lọt vào vùng hiển thị an toàn TikTok (màn hình y ≈ 1410)

  const FALLBACK_TRIGGERS = [
    { phrase: 'adidaphat, nam mô, mô phật, thắp hương, dâng hương, lạy phật, 🙏', effect: 'incense' },
    { phrase: 'thỉnh chuông, đánh chuông, chuông, 🔔', effect: 'bell' },
    { phrase: 'gõ mõ, tụng kinh, niệm phật, 🪵', effect: 'mo' },
    { phrase: 'hoa sen, dâng hoa, sen vàng, nở sen, 🪷', effect: 'lotus' },
    { phrase: 'hoan hỷ, tùy hỷ, công đức, phóng sinh, tâm an, ✨', effect: 'halo' },
    { phrase: 'mưa hoa, mưa sen, rải hoa, 🌸', effect: 'rain' }
  ];

  // Dải hình động 8 khung: 0-3 đi bộ, 4 đứng chắp tay, 5-6 quỳ bồ đoàn, 7 ngồi thiền đọc kinh
  const ANIM = {
    man: { fw: 212, fh: 300, seatH: 210 },
    woman: { fw: 212, fh: 300, seatH: 220 },
    granny: { fw: 195, fh: 300, seatH: 222 }
  };

  const SKIN_MAP = [
    [/^(nam|con trai|doi nam|đổi nam|anh|chàng trai)$/, 'man'],
    [/^(nu|nữ|con gai|con gái|doi nu|đổi nữ|chị)$/, 'woman'],
    [/^(ba|bà|ba cu|bà cụ|cu|cụ|doi ba|đổi bà|ngoại|nội)$/, 'granny'],
    [/^(su|sư|su thay|sư thầy|nha su|nhà sư|thay|thầy|doi su|đổi sư)$/, 'monk'],
    [/^(ni|ni co|ni cô|su co|sư cô|doi ni|đổi ni)$/, 'nun'],
    [/^(tieu|tiểu|chu tieu|chú tiểu|doi tieu|đổi tiểu)$/, 'child']
  ];

  const BLESSINGS = [
    'Chúc bạn và gia đình luôn mạnh khỏe, tâm an vạn sự lành.',
    'Chúc bạn một ngày nhẹ nhàng, thân khỏe tâm an.',
    'Chúc mọi điều tốt lành và bình yên luôn ở bên bạn.',
    'Chúc bạn công việc hanh thông, gia đạo thuận hòa êm ấm.',
    'Chúc bạn đêm ngon giấc, lòng luôn thanh thản an vui.',
    'Chúc bạn đi đến nơi về đến chốn, vạn dặm bình an.',
    'Chúc bạn sức khỏe dồi dào, sở cầu như ý.',
    'Chúc gia đình bạn luôn tràn ngập tiếng cười và bình an.'
  ];

  const WISHES = [
    [/thi\b|đỗ|đậu|học hành|điểm cao|tốt nghiệp|khoa bảng/, 'Chúc {n} trí tuệ sáng suốt, học hành tấn tới, thi cử đỗ đạt như ý.'],
    [/sức khỏe|sức khoẻ|ốm|bệnh|khỏe|khoẻ|đau|mau khỏi|bình phục/, 'Chúc {n} cùng người thân tật bệnh tiêu trừ, thân tâm tráng kiện, luôn bình an.'],
    [/cha mẹ|bố mẹ|ba má|ông bà|bố\b|mẹ\b|ba\b|má\b|gia đình|gia đạo|nhà mình/, 'Chúc đại gia đình {n} trên thuận dưới hòa, cha mẹ mạnh khỏe sống lâu trăm tuổi.'],
    [/con cái|em bé|bầu|mẹ tròn|con ngoan/, 'Chúc gia đình {n} phúc lộc sum vầy, con cháu bình an khôn lớn.'],
    [/tình duyên|người yêu|người thương|cưới|vợ chồng|hạnh phúc|nhân duyên/, 'Chúc {n} nhân duyên tốt đẹp, trọn vẹn yêu thương và êm ấm dài lâu.'],
    [/công việc|việc làm|xin việc|thăng tiến|thăng chức|sự nghiệp|dự án/, 'Chúc {n} công việc thuận buồm xuôi gió, quý nhân nâng đỡ, vạn sự hanh thông.'],
    [/làm ăn|buôn bán|kinh doanh|tài lộc|khai trương|đắt hàng|thuận lợi/, 'Chúc {n} buôn may bán đắt, làm ăn chân chính vững vàng, lộc phúc đủ đầy.'],
    [/thượng lộ|đi đường|chuyến đi|xa nhà|về quê/, 'Chúc {n} thượng lộ bình an, chân cứng đá mềm, đi đến nơi về đến chốn.'],
    [/ngủ ngon|mất ngủ|buồn|mệt|áp lực|lo âu|tĩnh tâm|an nhiên|bình an|bình yên|an lành/, 'Chúc {n} buông nhẹ muộn phiền, tâm trí thảnh thơi, đêm về an giấc.'],
    [/cầu\b|ước\b|nguyện\b|mong\b|xin\b/, 'Chúc điều ước thiện lành của {n} sớm viên thành, tâm an vạn sự an.']
  ];

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // ---------------- Tải & làm sạch tài nguyên hình ảnh ----------------
  const IMG = {};
  const CLEAN = {};
  let hallCanvas = null;

  // Các sprite có viền tím chroma-key hoặc lem mép trái từ tờ sprite gốc
  const CROP_LEFT = { fx_incense: 12, fx_scroll: 28 };
  const DESPILL = new Set([
    'c_man', 'c_woman', 'c_granny', 'c_monk', 'c_nun', 'c_child',
    'anim_man', 'anim_woman', 'anim_granny',
    'fx_bell', 'fx_mo', 'fx_incense', 'fx_scroll'
  ]);

  const ASSETS = [
    'hall', 'c_man', 'c_woman', 'c_granny', 'c_monk', 'c_nun', 'c_child',
    'anim_man', 'anim_woman', 'anim_granny',
    'fx_lotus', 'fx_halo', 'fx_bell', 'fx_incense', 'fx_petal', 'fx_mo', 'fx_scroll'
  ];

  ASSETS.forEach((k) => {
    const im = new Image();
    im.onload = () => {
      if (k === 'hall') buildHallCanvas(im);
      else cleanSprite(k, im);
    };
    im.src = BASE + k + (k === 'hall' ? '.jpg' : '.png');
    IMG[k] = im;
  });

  const ok = (im) => im && im.complete && im.naturalWidth > 0;
  const hasAnim = (skin) => Boolean(ANIM[skin] && (CLEAN['anim_' + skin] || ok(IMG['anim_' + skin])));

  function buildHallCanvas(im) {
    const ext = 160;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H + ext;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(im, 0, 0, W, H);
    // Phản chiếu thớ sàn gỗ tự nhiên thay vì kéo giãn 6px gây sọc mã vạch
    cx.save();
    cx.translate(0, H * 2 + ext);
    cx.scale(1, -1);
    cx.drawImage(im, 0, H - ext, W, ext, 0, 0, W, ext);
    cx.restore();
    const grd = cx.createLinearGradient(0, H - 18, 0, H + ext);
    grd.addColorStop(0, 'rgba(20, 7, 3, 0)');
    grd.addColorStop(0.28, 'rgba(20, 7, 3, 0.42)');
    grd.addColorStop(1, 'rgba(12, 4, 2, 0.92)');
    cx.fillStyle = grd;
    cx.fillRect(0, H - 18, W, ext + 18);
    hallCanvas = c;
  }

  // Khử viền tím neon (chroma-key spill) và cắt phần lem sprite lân cận
  function cleanSprite(key, im) {
    const cropX = CROP_LEFT[key] || 0;
    const w = im.naturalWidth - cropX;
    const h = im.naturalHeight;
    if (w <= 0 || h <= 0) return;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    cx.drawImage(im, cropX, 0, w, h, 0, 0, w, h);
    if (DESPILL.has(key)) {
      try {
        const imgData = cx.getImageData(0, 0, w, h);
        const d = imgData.data;
        // Đánh dấu pixel sát biên trong suốt (bán kính 2px)
        const alphaCopy = new Uint8Array(w * h);
        for (let i = 0, p = 0; p < w * h; p++, i += 4) alphaCopy[p] = d[i + 3];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const p = y * w + x;
            const a = alphaCopy[p];
            if (a === 0) continue;
            const i = p * 4;
            const r = d[i], gg = d[i + 1], b = d[i + 2];
            // Nhận diện màu tím/hồng cánh sen neon của nền tách phông (R cao, B cao, G thấp)
            const purpleSpill = b > gg + 26 && r > gg + 18 && b > 85;
            if (!purpleSpill) continue;
            let nearEdge = a < 242;
            if (!nearEdge) {
              for (let dy = -2; dy <= 2 && !nearEdge; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) { nearEdge = true; break; }
                for (let dx = -2; dx <= 2; dx++) {
                  const nx = x + dx;
                  if (nx < 0 || nx >= w || alphaCopy[ny * w + nx] < 90) { nearEdge = true; break; }
                }
              }
            }
            if (!nearEdge) continue;
            if (gg < Math.min(r, b) * 0.48 && b > 120) {
              // Rìa tím thuần -> làm mờ hẳn
              d[i + 3] = Math.round(a * 0.12);
            } else {
              // Trung hòa sắc tím về tông nâu ấm của gỗ/áo tràng
              d[i] = Math.min(r, gg + 28);
              d[i + 2] = Math.min(b, Math.max(0, gg - 6));
              if (a < 210) d[i + 3] = Math.round(a * 0.72);
            }
          }
        }
        cx.putImageData(imgData, 0, 0);
      } catch { /* bỏ qua nếu môi trường chặn đọc pixel */ }
    }
    CLEAN[key] = { el: c, w, h };
  }

  function texOf(key) {
    if (CLEAN[key]) return CLEAN[key];
    const im = IMG[key];
    return ok(im) ? { el: im, w: im.naturalWidth, h: im.naturalHeight } : null;
  }

  let cv, g, ui, sfx, cfg = {};
  let enabled = false;
  let pauseAt = 0;
  let pausedMs = 0;
  const clock = () => (pauseAt || performance.now()) - pausedMs;
  let last = 0;

  // ---------------- Bồ đoàn trên hall.jpg (ưu tiên vùng an toàn TikTok trước) ----------------
  const CUSHIONS = [
    [428, 1266, 100], [652, 1266, 100], [258, 1266, 100], [822, 1266, 100],
    [403, 1338, 122], [678, 1338, 122], [202, 1338, 120], [878, 1338, 122],
    [368, 1432, 146], [712, 1432, 146],
    [316, 1578, 184], [765, 1578, 184]
  ];
  const EXTRA = [
    [332, 1298], [748, 1298], [486, 1304], [594, 1304],
    [292, 1384], [788, 1384], [462, 1390], [618, 1390],
    [245, 1468], [835, 1468], [448, 1474], [632, 1474],
    [196, 1515], [884, 1515], [430, 1545], [650, 1545],
    [250, 1650], [830, 1650], [455, 1665], [625, 1665]
  ];
  const scaleAt = (y) => clamp(0.44 + (y - 1266) * 0.00112, 0.34, 1.12);
  const SEATS = [
    ...CUSHIONS.map(([x, y, w], i) => ({ x, y, s: w / 226, order: i, taken: null })),
    ...EXTRA.map(([x, y], i) => ({ x, y, s: scaleAt(y), order: 100 + i, taken: null }))
  ];
  const FRONT = [-156, -78, 0, 78, 156].map((dx) => ({ x: ALTAR.x + dx, y: 1192, busy: null }));
  const facesLeft = (x) => x > AISLE_X + 10;

  const people = new Map();
  const avatars = new Map();
  const queue = [];
  const effects = [];
  const petals = [];
  const incenseSticks = [];
  let incenseUntil = 0;
  let spotlight = null;
  let rainUntil = 0;
  let liveViewers = 0;

  // Bộ đếm tim tách bạch giữa tim thật từ live và nút cộng thử 100 tim
  let likeBase = -1;
  let liveLikes = 0;
  let bonusLikes = 0;
  const totalLikes = () => Math.max(0, liveLikes + bonusLikes);

  const zoom = { k: 1, x: W / 2, y: H / 2 };

  // ---------------- Âm thanh nền tự chọn (TUYỆT ĐỐI không phát music1/music2 mặc định) ----------------
  let customMusic = null;
  let customMusicSrc = '';
  let duck = false;

  function syncMusic() {
    const mode = cfg.chuaSoundscape || 'off';
    const wantCustom = enabled && !pauseAt && cfg.sound !== false && !sfx?.muted() && mode === 'custom' && Boolean(cfg.customChuaMusic);
    if (!wantCustom) {
      if (customMusic && !customMusic.paused) customMusic.pause();
      return;
    }
    const nextUrl = `/media/chuamusic?v=${encodeURIComponent(cfg.customChuaMusic)}`;
    if (!customMusic) {
      customMusic = new Audio();
      customMusic.loop = true;
    }
    if (customMusicSrc !== nextUrl) {
      customMusicSrc = nextUrl;
      customMusic.src = nextUrl;
    }
    customMusic.volume = clamp((cfg.volume ?? 0.7) * (cfg.chuaMusicVolume ?? 0.35) * (duck ? 0.32 : 1), 0, 1);
    if (customMusic.paused) customMusic.play().catch(() => {});
  }

  // ---------------- Khởi tạo ----------------
  function syncTempleDpr() {
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
    syncTempleDpr();
    window.addEventListener('resize', syncTempleDpr);
    ui = opts.ui;
    sfx = opts.sfx;
    last = clock();
    // Khởi tạo sẵn 3 nén hương trầm ấm trên lư hương chính
    seedBaseIncense();
    requestAnimationFrame(loop);
    setInterval(tick1s, 1000);
  }

  function seedBaseIncense() {
    incenseSticks.length = 0;
    [-9, 0, 9].forEach((dx, idx) => {
      incenseSticks.push({ dx, tilt: (idx - 1) * 0.055, h: 46 + (idx === 1 ? 5 : 0), permanent: true, until: Infinity, phase: idx * 2.1 });
    });
  }

  function setConfig(next) {
    cfg = next || {};
    const was = enabled;
    enabled = cfg.mode === 'chua';
    cv.style.display = enabled ? 'block' : 'none';
    ui.root.style.display = enabled ? 'block' : 'none';
    ui.title.textContent = channelName().toUpperCase();
    updateLikeBar();
    updateOnlineBadge();
    syncTriggerHints();
    if (enabled && !was) lastSpeechAt = Date.now();
    if (!enabled) {
      voice.stop();
      if (ui.wish) ui.wish.classList.remove('on');
      if (ui.plate) ui.plate.classList.remove('on');
      if (ui.fxToast) ui.fxToast.classList.remove('on');
      if (ui.welcome) ui.welcome.classList.remove('on');
      if (ui.caption) ui.caption.classList.remove('on');
    }
    syncMusic();
  }

  const channelName = () => (cfg.chuaName || '').trim() || 'Chánh Điện Tâm An';

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

  // ---------------- Người xem & Nhân vật ----------------
  function loadAvatar(url) {
    if (!url || !url.startsWith('https://')) return null;
    if (avatars.has(url)) return avatars.get(url);
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = url;
    avatars.set(url, img);
    return img;
  }

  const keyOf = (u) => String(u?.id || u?.uniqueId || u?.nickname || '');
  const randomSkin = () => pick(['man', 'woman', 'woman', 'man', 'granny']);

  function getPerson(user, create = true) {
    const k = keyOf(user);
    if (!k) return null;
    let p = people.get(k);
    if (!p && create) {
      const seat = pickSeat();
      if (!seat) return null;
      const skin = user?.skin || randomSkin();
      const startY = Math.max(ENTRY_Y, seat.y + 48);
      p = {
        key: k,
        name: cleanName(user?.nickname || 'Phật tử'),
        label: '',
        img: loadAvatar(user?.avatar),
        skin,
        seat,
        x: AISLE_X + rnd(-48, 48),
        y: startY,
        state: 'walk',
        after: 'sit',
        path: [{ x: clamp(AISLE_X + (seat.x - AISLE_X) * 0.25, 470, 610), y: seat.y }, { x: seat.x, y: seat.y }],
        frame: 0,
        ft: 0,
        t0: clock(),
        fade: 0.35,
        phase: rnd(0, 6.28),
        bowAt: clock() + rnd(6000, 22000),
        glowUntil: clock() + 2600,
        glowPeak: 0.22,
        bubble: null,
        points: 0,
        lastOffer: 0,
        lastTrigAt: 0,
        active: Date.now(),
        spot: null,
        flip: false
      };
      seat.taken = p;
      people.set(k, p);
      updateOnlineBadge();
      onFirstEnter(p);
    }
    if (p) {
      p.active = Date.now();
      const nextName = user?.nickname ? cleanName(user.nickname) : '';
      if (nextName && nextName !== p.name) { p.name = nextName; p.label = ''; }
      if (user?.avatar && !p.img) p.img = loadAvatar(user.avatar);
    }
    return p;
  }

  function pickSeat() {
    const free = SEATS.filter((s) => !s.taken).sort((a, b) => a.order - b.order)[0];
    if (free) return free;
    let oldest = null;
    for (const p of people.values()) {
      if (p.state !== 'sit' || p === spotlight?.p) continue;
      if (!oldest || p.active < oldest.active) oldest = p;
    }
    if (!oldest) return null;
    people.delete(oldest.key);
    oldest.seat.taken = null;
    return oldest.seat;
  }

  function cleanName(n) {
    let s = String(n).replace(/[\u0000-\u001f]/g, '').trim();
    const words = String(cfg.filterWords || '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    for (const w of words) if (s.toLowerCase().includes(w)) s = 'Phật tử';
    return s.slice(0, 24) || 'Phật tử';
  }

  function updateOnlineBadge() {
    if (!ui?.online) return;
    const count = Math.max(people.size, liveViewers || 0);
    ui.online.textContent = `🙏 ${count} hiện diện`;
  }

  // ---------------- Nghi thức dâng hương & tam bái ----------------
  function requestOffering(p, force = false) {
    if (!p) return;
    const now = Date.now();
    if (!force && now - p.lastOffer < OFFER_COOLDOWN) return;
    if (queue.includes(p) || p.spot) return;
    p.lastOffer = now;
    queue.push(p);
    pumpQueue();
  }

  function pumpQueue() {
    while (queue.length) {
      const free = FRONT.filter((f) => !f.busy);
      if (!free.length) return;
      const p = queue.shift();
      if (!people.has(p.key)) continue;
      // Ưu tiên vị trí chính giữa cho người tặng quà hoặc khi trống
      const spot = (!FRONT[2].busy && (p === spotlight?.p || free.includes(FRONT[2])))
        ? FRONT[2]
        : free[Math.floor(free.length / 2)];
      spot.busy = p;
      p.spot = spot;
      p.state = 'walk';
      p.after = 'offer';
      p.path = [
        { x: AISLE_X, y: Math.min(p.y, 1520) },
        { x: AISLE_X, y: spot.y + 18 },
        { x: spot.x, y: spot.y }
      ];
    }
  }

  function startOffer(p) {
    p.state = 'offer';
    p.t0 = clock();
    p.lit = false;
    p.flip = p.x > ALTAR.x + 20;
    sfx.mo(1);
  }

  function finishOffer(p) {
    if (p.spot) p.spot.busy = null;
    p.spot = null;
    const s = p.seat;
    p.state = 'walk';
    p.after = 'sit';
    p.path = [
      { x: AISLE_X, y: p.y + 18 },
      { x: AISLE_X, y: s.y },
      { x: s.x, y: s.y }
    ];
    pumpQueue();
  }

  function lightIncense(sound = true) {
    const t = clock();
    incenseUntil = Math.max(incenseUntil, t) + 25000;
    if (incenseSticks.filter((s) => !s.permanent).length < 8) {
      incenseSticks.push({
        dx: rnd(-22, 22),
        tilt: rnd(-0.14, 0.14),
        h: rnd(42, 52),
        permanent: false,
        until: t + 90000,
        phase: rnd(0, 6.28)
      });
    }
    effects.push({ type: 'sprite', img: 'fx_incense', x: ALTAR.x, y: ALTAR.y - 34, s: 0.56, t0: t, dur: 2600, rise: 54, glow: true });
    burst(ALTAR.x, ALTAR.y - 44, '#fbbf24', 12);
    if (sound) (sfx.khanh ? sfx.khanh(0.9) : sfx.mo(1));
  }

  // ---------------- Quà tặng & Tri ân ----------------
  function onGift(ev) {
    const p = getPerson(ev.user);
    if (!p) return;
    const coins = Math.max(1, Number(ev.total || ev.diamonds || 1));
    p.points += coins * 10;
    p.glowUntil = clock() + 8500;
    const tier = coins >= 99 ? 3 : coins >= 10 ? 2 : 1;
    const fx = tier >= 3 ? 'fx_bell' : tier >= 2 ? 'fx_lotus' : 'fx_incense';
    const ps = p.state === 'sit' ? p.seat.s : scaleAt(p.y);
    effects.push({
      type: 'sprite', img: fx, x: p.x, y: p.y - 260 * ps,
      s: (0.48 + tier * 0.14) * ps, t0: clock(), dur: 3800, rise: 105 * ps, glow: true
    });
    effects.push({ type: 'lotus', t0: clock(), dur: 6500, size: clamp(0.82 + Math.log10(coins + 1) * 0.45, 0.82, 1.85) });
    effects.push({ type: 'halo', t0: clock(), dur: 3600 });
    petalBurst(Math.min(160, 24 + coins * 4), Math.min(11000, 3800 + coins * 220));
    if (!spotlight || clock() > spotlight.until - 2000) {
      spotlight = { p, t0: clock(), until: clock() + 8500 };
      showNameplate(p, ev);
    }
    requestOffering(p, true);
    voice.say(`${channelName()} xin cảm ơn bạn ${speakName(p.name)} đã gửi tặng ${ev.giftName || 'quà'}. ${pick(BLESSINGS)}`, true);
    sfx.bell(tier >= 3 ? 1.15 : 0.95);
    renderBoard();
  }

  function showNameplate(p, ev) {
    if (!ui?.plate) return;
    const n = ui.plate;
    n.querySelector('.np-name').textContent = p.name;
    n.querySelector('.np-gift').textContent = `đã gửi tặng ${ev.giftName || 'quà'}${ev.repeatCount > 1 ? ' ×' + ev.repeatCount : ''} · Chúc bạn an lành`;
    const av = n.querySelector('.np-av');
    av.replaceChildren();
    if (p.img) {
      const im = new Image();
      im.referrerPolicy = 'no-referrer';
      im.src = p.img.src;
      av.appendChild(im);
    } else {
      av.textContent = (p.name[0] || '🪷').toUpperCase();
    }
    n.classList.remove('on');
    void n.offsetWidth;
    n.classList.add('on');
    clearTimeout(showNameplate.t);
    showNameplate.t = setTimeout(() => n.classList.remove('on'), 8000);
  }

  // ---------------- Lượt tim & Mưa hoa sen ----------------
  function onStats(s) {
    if (!s) return;
    if (typeof s.viewers === 'number') {
      liveViewers = s.viewers;
      if (enabled) updateOnlineBadge();
    }
    if (!enabled) return;
    if (typeof s.likes === 'number') {
      if (likeBase < 0 || s.likes < likeBase) likeBase = s.likes;
      liveLikes = Math.max(0, s.likes - likeBase);
      checkLikes();
    }
  }

  function addLikes(n) {
    bonusLikes += Math.max(1, Number(n) || 100);
    checkLikes();
  }

  function checkLikes() {
    const goal = Math.max(10, Number(cfg.chuaLikeGoal) || 666);
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
    if (triggered) startRain();
    else updateLikeBar();
  }

  function updateLikeBar() {
    if (!ui?.likeFill || !ui?.likeText) return;
    const goal = Math.max(10, Number(cfg.chuaLikeGoal) || 666);
    const cur = totalLikes();
    const raining = clock() < rainUntil;
    ui.likeFill.style.width = (raining ? 100 : clamp((cur / goal) * 100, 0, 100)) + '%';
    ui.likeText.textContent = raining
      ? '🌸 Mưa hoa sen cát tường — cảm ơn cả nhà đã thả tim!'
      : `❤️ ${cur}/${goal} tim — đủ tim sẽ nở mưa hoa sen`;
  }

  function startRain() {
    rainUntil = clock() + RAIN_MS;
    petalBurst(48, 3500);
    sfx.bell(1);
    voice.say(`Cảm ơn cả nhà đã thả tim. ${channelName()} xin gửi tặng mọi người cơn mưa hoa sen, chúc cả nhà thân tâm an lạc.`, false);
    updateLikeBar();
  }

  function petalBurst(n, ms) {
    for (let i = 0; i < n; i++) petals.push(newPetal(clock() + rnd(0, ms * 0.6)));
  }

  function newPetal(born) {
    return {
      x: rnd(60, W - 60),
      y: rnd(-180, -20),
      vx: rnd(-0.55, 0.55),
      vy: rnd(1.35, 2.6),
      r: rnd(0, 6.28),
      vr: rnd(-0.032, 0.032),
      s: rnd(0.085, 0.155),
      born
    };
  }

  // ---------------- Giọng đọc TTS ----------------
  const speakName = (n) => String(n).replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim() || 'bạn';
  let lastSpeechAt = Date.now();

  const voice = {
    q: [], pq: [], busy: false, audio: null,
    say(text, priority) {
      if (!cfg.chuaVoice || !text) return;
      (priority ? this.pq : this.q).push(text);
      if (this.q.length > 6) this.q.splice(0, this.q.length - 6);
      if (this.pq.length > 15) this.pq.splice(0, this.pq.length - 15);
      this.next();
    },
    next() {
      if (this.busy || pauseAt || !enabled) return;
      const text = this.pq.shift() || this.q.shift();
      if (!text) return;
      this.busy = true;
      lastSpeechAt = Date.now();
      const done = () => {
        this.busy = false;
        this.audio = null;
        setDuck(false);
        setTimeout(() => this.next(), 450);
      };
      if (ui?.caption) {
        ui.caption.textContent = text;
        ui.caption.classList.add('on');
        clearTimeout(this.capT);
        this.capT = setTimeout(() => ui.caption.classList.remove('on'), Math.max(4200, text.length * 82));
      }
      if (sfx.muted()) { setTimeout(done, Math.max(2400, text.length * 68)); return; }
      const a = new Audio(`/api/tts?rate=${cfg.chuaRate || 1}&text=${encodeURIComponent(text)}`);
      a.volume = Math.min(1, (cfg.volume ?? 0.7) + 0.25);
      this.audio = a;
      setDuck(true);
      a.onended = done;
      a.onerror = () => this.fallback(text, done);
      a.play().catch(() => this.fallback(text, done));
    },
    fallback(text, done) {
      const ss = window.speechSynthesis;
      const v = ss && ss.getVoices().find((x) => /^vi/i.test(x.lang));
      if (!v) { done(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.rate = cfg.chuaRate || 1;
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

  // Chào người mới bước vào chánh điện: hiện bảng chào trên màn hình + chuông khánh nhẹ + giọng đọc
  const greetQ = [];
  const welcomeBatch = [];
  let lastGreet = 0;
  let lastEnterChime = 0;

  function onFirstEnter(p) {
    if (!p || !enabled) return;
    greetQ.push(p.name);
    if (greetQ.length > 30) greetQ.splice(0, greetQ.length - 30);
    setTimeout(greetTick, 900);
    if (cfg.chuaWelcomeBanner !== false) showWelcome(p);
    const now = Date.now();
    if (now - lastEnterChime > 3500 && sfx?.khanh) {
      lastEnterChime = now;
      sfx.khanh(0.45);
    }
    burst(p.x, p.y - 90 * scaleAt(p.y), '#fde68a', 8);
  }

  function showWelcome(p) {
    if (!ui?.welcome) return;
    const now = Date.now();
    welcomeBatch.push({ p, at: now });
    while (welcomeBatch.length && now - welcomeBatch[0].at > 4500) welcomeBatch.shift();
    if (welcomeBatch.length > 8) welcomeBatch.splice(0, welcomeBatch.length - 8);

    const w = ui.welcome;
    const av = w.querySelector('.twc-av');
    const txt = w.querySelector('.twc-text');
    const latest = welcomeBatch[welcomeBatch.length - 1].p;
    av.replaceChildren();
    if (latest.img && ok(latest.img)) {
      const im = new Image();
      im.referrerPolicy = 'no-referrer';
      im.src = latest.img.src;
      av.appendChild(im);
    } else {
      av.textContent = (latest.name[0] || '🙏').toUpperCase();
    }

    txt.replaceChildren();
    const b1 = document.createElement('b');
    if (welcomeBatch.length === 1) {
      b1.textContent = latest.name;
      txt.append('🪷 Hoan hỷ chào đón ', b1, ' bước vào chánh điện');
    } else if (welcomeBatch.length === 2) {
      b1.textContent = `${welcomeBatch[0].p.name}, ${latest.name}`;
      txt.append('🪷 Chào đón ', b1, ' vừa bước vào chánh điện');
    } else {
      b1.textContent = `${welcomeBatch[welcomeBatch.length - 2].p.name}, ${latest.name}`;
      txt.append('🪷 ', b1, ` và ${welcomeBatch.length - 2} Phật tử vừa vào chánh điện`);
    }

    w.classList.add('on');
    clearTimeout(showWelcome.t);
    showWelcome.t = setTimeout(() => w.classList.remove('on'), 4500);
  }

  function showFxToast(ico, name, desc) {
    if (!ui?.fxToast) return;
    const box = ui.fxToast;
    const icoEl = box.querySelector('.tft-ico');
    const txtEl = box.querySelector('.tft-text');
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
    showFxToast.t = setTimeout(() => box.classList.remove('on'), 3600);
  }

  function greetTick() {
    if (!cfg.chuaGreet || !greetQ.length || Date.now() - lastGreet < 5000) return;
    lastGreet = Date.now();
    const names = greetQ.splice(0, 3).map(speakName);
    const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' và ' + names.at(-1) : names[0];
    voice.say(`A Di Đà Phật, ${channelName()} xin chào đón ${list} vừa ghé chánh điện.`, false);
  }

  // Sớ Cầu An & Lời chúc theo ước nguyện
  const wishSeen = new Map();
  let lastWish = 0;
  function maybeWish(p, text, isTest = false) {
    const raw = String(text || '').trim();
    const low = raw.toLowerCase();
    const hit = WISHES.find(([re]) => re.test(low));
    if (!hit) return false;
    const now = Date.now();
    if (!isTest && (now - lastWish < 8000 || now - (wishSeen.get(p.key) || 0) < 90000)) return false;
    lastWish = now;
    wishSeen.set(p.key, now);
    const bless = hit[1].replace('{n}', speakName(p.name));
    showWishCard(p, raw, bless);
    const ps = p.state === 'sit' ? p.seat.s : scaleAt(p.y);
    effects.push({ type: 'sprite', img: 'fx_scroll', x: p.x, y: p.y - 235 * ps, s: 0.46 * ps, t0: clock(), dur: 3400, rise: 70 * ps, glow: true });
    if (sfx.khanh) sfx.khanh(0.85);
    voice.say(bless, false);
    return true;
  }

  function showWishCard(p, wishText, blessText) {
    if (!ui?.wish) return;
    const w = ui.wish;
    w.querySelector('.tw-user').textContent = `🙏 ${p.name}`;
    w.querySelector('.tw-wish').textContent = `“${wishText.slice(0, 90)}”`;
    w.querySelector('.tw-bless').textContent = blessText;
    w.classList.remove('on');
    void w.offsetWidth;
    w.classList.add('on');
    clearTimeout(showWishCard.t);
    showWishCard.t = setTimeout(() => w.classList.remove('on'), 9000);
  }

  function shareReminder() {
    lastSpeechAt = Date.now();
    voice.say(`Cảm ơn mọi người đã ghé ${channelName()}. ${pick(BLESSINGS)} Hoan hỷ chia sẻ buổi live để lan tỏa sự bình yên đến mọi người nhé.`, false);
  }

  // ---------------- Phân tích bình luận, cụm từ hiệu ứng & Sự kiện ----------------
  function activeRules() {
    return Array.isArray(cfg.chuaTriggers) && cfg.chuaTriggers.length ? cfg.chuaTriggers : FALLBACK_TRIGGERS;
  }

  const EFFECT_LABELS = {
    incense: ['dâng hương', ''],
    bell: ['rung chuông', ''],
    mo: ['gõ mõ', ''],
    lotus: ['nở sen', 'wish'],
    halo: ['hào quang', 'wish'],
    rain: ['mưa hoa', 'wish'],
    wish: ['cầu an', 'wish']
  };

  function syncTriggerHints() {
    if (!ui?.cmdRow) return;
    const rules = activeRules();
    const items = [];
    const seen = new Set();
    for (const r of rules) {
      if (!r?.phrase || seen.has(r.effect)) continue;
      const firstKey = r.phrase.split(',')[0].trim();
      if (!firstKey) continue;
      seen.add(r.effect);
      const [desc, cls] = EFFECT_LABELS[r.effect] || ['hiệu ứng', ''];
      items.push({ key: firstKey.slice(0, 16), desc, cls });
      if (items.length >= 3) break;
    }
    items.push({ key: 'nam·nữ·bà·sư·ni·tiểu', desc: 'đổi người', cls: 'skin' });
    ui.cmdRow.replaceChildren(...items.map((it) => {
      const d = document.createElement('div');
      d.className = 'cmd' + (it.cls ? ' ' + it.cls : '');
      const k = document.createElement('span');
      k.className = 'key';
      k.textContent = it.key;
      d.append(k, it.desc);
      return d;
    }));
  }

  function parseSkin(text) {
    const t = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const tn = norm(t);
    for (const [re, skin] of SKIN_MAP) {
      if (re.test(t) || re.test(tn)) return skin;
    }
    return null;
  }

  function matchChuaTriggers(text) {
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

  function runTriggerEffect(p, effect, rawText, isTest = false) {
    const now = Date.now();
    if (!isTest && now - (p.lastTrigAt || 0) < 2500 && effect !== 'incense') return;
    p.lastTrigAt = now;
    const t = clock();
    const ps = p.state === 'sit' ? p.seat.s : scaleAt(p.y);

    if (effect === 'incense') {
      requestOffering(p, isTest);
      lightIncense(true);
      p.glowUntil = t + 4500;
      showFxToast('🪔', p.name, 'thành tâm dâng nén tâm hương');
    } else if (effect === 'bell') {
      sfx.bell(1.05);
      effects.push({ type: 'sprite', img: 'fx_bell', x: BELL_POS.x, y: BELL_POS.y - 20, s: 0.56, t0: t, dur: 3000, swing: true, glow: true });
      effects.push({ type: 'ring', x: BELL_POS.x, y: BELL_POS.y - 55, color: '251, 191, 36', maxR: 175, t0: t, dur: 2200 });
      effects.push({ type: 'halo', t0: t, dur: 3000 });
      p.glowUntil = t + 4500;
      showFxToast('🔔', p.name, 'thỉnh Đại Hồng Chung ngân vang');
    } else if (effect === 'mo') {
      sfx.mo(3);
      effects.push({ type: 'sprite', img: 'fx_mo', x: MO_POS.x, y: MO_POS.y - 16, s: 0.52, t0: t, dur: 1900, knock: true, glow: true });
      effects.push({ type: 'ring', x: MO_POS.x, y: MO_POS.y - 48, color: '245, 158, 11', maxR: 125, t0: t, dur: 1400 });
      p.glowUntil = t + 3800;
      showFxToast('🪵', p.name, 'gõ nhịp mõ tịnh tâm');
    } else if (effect === 'lotus') {
      effects.push({ type: 'lotus', t0: t, dur: 6000, size: 1.22 });
      effects.push({ type: 'sprite', img: 'fx_lotus', x: p.x, y: p.y - 220 * ps, s: 0.44 * ps, t0: t, dur: 3000, rise: 65 * ps, glow: true });
      petalBurst(28, 2800);
      if (sfx.khanh) sfx.khanh(0.95);
      p.glowUntil = t + 5000;
      showFxToast('🪷', p.name, 'dâng đóa sen vàng thanh khiết');
    } else if (effect === 'halo') {
      effects.push({ type: 'halo', t0: t, dur: 4200 });
      effects.push({ type: 'ring', x: p.x, y: p.y - 110 * ps, color: '253, 224, 71', maxR: 135 * ps + 40, t0: t, dur: 1900 });
      burst(p.x, p.y - 130 * ps, '#fde68a', 18);
      if (sfx.khanh) sfx.khanh(0.85);
      p.glowUntil = t + 6000;
      showFxToast('✨', p.name, 'gieo duyên lành, tâm sáng bình an');
    } else if (effect === 'rain') {
      rainUntil = Math.max(rainUntil, t + 18000);
      petalBurst(42, 3200);
      if (sfx.khanh) sfx.khanh(1);
      updateLikeBar();
      p.glowUntil = t + 5500;
      showFxToast('🌸', p.name, 'gọi cơn mưa hoa sen cát tường');
    } else if (effect === 'wish') {
      if (!maybeWish(p, rawText, true)) {
        const bless = pick(BLESSINGS);
        showWishCard(p, rawText || 'Cầu bình an', bless);
        effects.push({ type: 'sprite', img: 'fx_scroll', x: p.x, y: p.y - 235 * ps, s: 0.46 * ps, t0: t, dur: 3400, rise: 70 * ps, glow: true });
        if (sfx.khanh) sfx.khanh(0.85);
        voice.say(bless, false);
      }
    }
  }

  function setSpeechBubble(p, text) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 44);
    if (!clean) return;
    p.bubble = { text: clean, until: clock() + 5200 };
  }

  function onEvent(ev) {
    if (!enabled || !ev || pauseAt) return;
    switch (ev.type) {
      case 'chat': {
        const p = getPerson(ev.user);
        if (!p) return;
        p.points += 1;
        setSpeechBubble(p, ev.text);
        renderBoard();
        const skin = parseSkin(ev.text);
        if (skin) {
          changeSkin(p, skin);
          showFxToast('🧘', p.name, 'đã đổi trang phục Phật tử');
          return;
        }
        const matched = matchChuaTriggers(ev.text);
        for (const eff of matched) runTriggerEffect(p, eff, ev.text, !!ev.test);
        // Không dùng else: câu vừa niệm Phật vừa cầu bình an sẽ thực hiện trọn vẹn cả hai!
        if (!matched.includes('wish')) maybeWish(p, ev.text, !!ev.test);
        return;
      }
      case 'join': {
        // Người xem vừa vào phòng lập tức hóa thành nhân vật bước vào chánh điện ngay!
        getPerson(ev.user);
        return;
      }
      case 'gift':
        onGift(ev);
        return;
      case 'follow': {
        const p = getPerson(ev.user);
        if (p) {
          p.points += 5;
          p.glowUntil = clock() + 4500;
          showFxToast('🙏', p.name, 'đã hữu duyên theo dõi kênh');
          renderBoard();
        }
        return;
      }
      case 'share': {
        const p = getPerson(ev.user);
        if (p) {
          p.points += 5;
          p.glowUntil = clock() + 4500;
          showFxToast('🪷', p.name, 'đã hoan hỷ chia sẻ buổi live');
          renderBoard();
        }
        return;
      }
      case 'like': {
        const p = getPerson(ev.user);
        if (p && Math.random() < 0.5) {
          effects.push({ type: 'heart', x: p.x + rnd(-18, 18), y: p.y - 210 * scaleAt(p.y), t0: clock(), dur: 1600 });
        }
        return;
      }
    }
  }

  // Đổi nhân vật mượt ở mọi trạng thái (đang đi, đang quỳ hay đang ngồi đều đổi được ngay)
  function changeSkin(p, skin) {
    if (!p) return;
    p.skin = skin;
    p.fade = 0.35;
    const ps = p.state === 'sit' ? p.seat.s : scaleAt(p.y);
    burst(p.x, p.y - 125 * ps, '#fde68a', 12);
    if (sfx.khanh) sfx.khanh(0.75);
  }

  function command(c) {
    if (!enabled || !c) return;
    const a = c.action;
    const t = clock();
    if (a === 'speak' && c.text) {
      voice.say(String(c.text).slice(0, 400), true);
    } else if (a === 'bell') {
      // Chuông đồng nằm bên PHẢI bàn thờ (x = 762, y = 995)
      sfx.bell(1.05);
      effects.push({ type: 'sprite', img: 'fx_bell', x: BELL_POS.x, y: BELL_POS.y - 20, s: 0.56, t0: t, dur: 3000, swing: true, glow: true });
      effects.push({ type: 'ring', x: BELL_POS.x, y: BELL_POS.y - 55, color: '251, 191, 36', maxR: 170, t0: t, dur: 2200 });
      effects.push({ type: 'halo', t0: t, dur: 3000 });
    } else if (a === 'mo') {
      // Mõ gỗ nằm bên TRÁI bàn thờ (x = 248, y = 995)
      sfx.mo(3);
      effects.push({ type: 'sprite', img: 'fx_mo', x: MO_POS.x, y: MO_POS.y - 16, s: 0.52, t0: t, dur: 1900, knock: true, glow: true });
      effects.push({ type: 'ring', x: MO_POS.x, y: MO_POS.y - 48, color: '245, 158, 11', maxR: 125, t0: t, dur: 1400 });
    } else if (a === 'incense') {
      lightIncense(true);
    } else if (a === 'lotus') {
      effects.push({ type: 'lotus', t0: t, dur: 6200, size: 1.25 });
      effects.push({ type: 'halo', t0: t, dur: 3200 });
      petalBurst(40, 3500);
      if (sfx.khanh) sfx.khanh(1);
    } else if (a === 'share') {
      shareReminder();
    } else if (a === 'testLikes') {
      addLikes(Number(c.n) || 100);
    } else if (a === 'rain') {
      startRain();
    } else if (a === 'reset') {
      for (const p of people.values()) p.points = 0;
      renderBoard();
    }
  }

  // ---------------- Nhịp mỗi giây ----------------
  function tick1s() {
    if (!enabled || pauseAt) return;
    greetTick();
    renderBoard();
    updateLikeBar();
    updateOnlineBadge();
    syncMusic();
    // Chỉ tự nhắc chia sẻ nếu chủ kênh chủ động bật tuỳ chọn chuaAutoShare
    if (cfg.chuaVoice && cfg.chuaAutoShare === true && Date.now() - lastSpeechAt > 120000 && !voice.busy) {
      shareReminder();
    }
  }

  function renderBoard() {
    if (!ui?.board || !ui?.boardEmpty) return;
    const top = [...people.values()].filter((p) => p.points > 0).sort((a, b) => b.points - a.points).slice(0, 5);
    ui.board.replaceChildren(...top.map((p, i) => {
      const r = document.createElement('div');
      r.className = 'tb-row';
      const a = document.createElement('span'); a.className = 'tb-rank'; a.textContent = i + 1;
      const n = document.createElement('span'); n.className = 'tb-name'; n.textContent = p.name;
      const s = document.createElement('span'); s.className = 'tb-pts'; s.textContent = p.points;
      r.append(a, n, s);
      return r;
    }));
    ui.boardEmpty.style.display = top.length ? 'none' : '';
  }

  // ---------------- Vòng lặp mô phỏng & vẽ 30fps ----------------
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
    for (let i = incenseSticks.length - 1; i >= 0; i--) {
      if (!incenseSticks[i].permanent && t > incenseSticks[i].until) incenseSticks.splice(i, 1);
    }

    for (const p of people.values()) {
      p.fade = Math.min(1, p.fade + dt * 2.4);
      if (p.state === 'walk') {
        const tgt = p.path[0];
        if (!tgt) { arrive(p, t); continue; }
        const dx = tgt.x - p.x, dy = tgt.y - p.y;
        const d = Math.hypot(dx, dy);
        const sp = (210 + 320 * scaleAt(p.y)) * dt;
        if (Math.abs(dx) > 4) p.flip = dx < 0;
        if (d <= sp) {
          p.x = tgt.x; p.y = tgt.y;
          p.path.shift();
          if (!p.path.length) arrive(p, t);
        } else {
          p.x += (dx / d) * sp;
          p.y += (dy / d) * sp;
        }
        p.ft += dt;
        if (p.ft > 0.14) { p.ft = 0; p.frame = (p.frame + 1) % 4; }
      } else if (p.state === 'kneel') {
        const k = (t - p.t0) / 1000;
        const toOffer = p.after === 'offer';
        p.frame = Math.min(toOffer ? 6 : 7, 4 + Math.floor(k / 0.2));
        if (k > 0.72) {
          if (toOffer) startOffer(p);
          else { p.state = 'sit'; p.frame = 7; }
        }
      } else if (p.state === 'offer') {
        const k = (t - p.t0) / 1000;
        p.frame = 6;
        if (k > 1.5 && !p.lit) { p.lit = true; lightIncense(true); }
        if (k > 7.4) finishOffer(p);
      } else if (p.state === 'sit') {
        p.frame = 7;
        if (t > p.bowAt) { p.bowStart = t; p.bowAt = t + rnd(15000, 32000); }
      }
    }

    // Máy quay tiến vào êm ái khi có người gửi quà
    let tk = 1, tx = W / 2, ty = H / 2;
    if (spotlight && t < spotlight.until && people.has(spotlight.p.key)) {
      const p = spotlight.p;
      tk = 1.38;
      tx = clamp(p.x, 320, 760);
      ty = clamp(p.y - 150 * scaleAt(p.y) + SCENE_DY, 560, 1280);
    } else if (spotlight && t >= spotlight.until) {
      spotlight = null;
    }
    const camLerp = Math.min(1, dt * 2.4);
    zoom.k += (tk - zoom.k) * camLerp;
    zoom.x += (tx - zoom.x) * camLerp;
    zoom.y += (ty - zoom.y) * camLerp;

    const raining = t < rainUntil;
    if (raining && petals.length < 150 && Math.random() < 0.58) petals.push(newPetal(t));
    for (let i = petals.length - 1; i >= 0; i--) {
      const f = petals[i];
      if (t < f.born) continue;
      f.x += f.vx + Math.sin((t + i * 310) / 620) * 0.55;
      f.y += f.vy;
      f.r += f.vr;
      if (f.y > H + 36) petals.splice(i, 1);
    }
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      if (e.type === 'spark') {
        e.age += dt; e.x += e.vx; e.y += e.vy; e.vy += 0.11;
        if (e.age > e.life) effects.splice(i, 1);
      } else if (t - e.t0 > e.dur) {
        effects.splice(i, 1);
      }
    }
    if (!raining && ui?.likeFill?.dataset.r === '1') { ui.likeFill.dataset.r = ''; updateLikeBar(); }
    if (raining && ui?.likeFill) ui.likeFill.dataset.r = '1';
  }

  function arrive(p, t) {
    if (p.after !== 'offer') { p.x = p.seat.x; p.y = p.seat.y; }
    p.state = 'kneel';
    p.t0 = t;
    p.flip = p.after === 'offer' ? p.x > ALTAR.x + 20 : facesLeft(p.x);
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), s = rnd(1.4, 4.6);
      effects.push({ type: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.8, life: rnd(0.55, 1.2), age: 0, color });
    }
  }

  // ---------------- Vẽ cảnh sắc nét 2× DPR ----------------
  function drawTex(key, x, y, s, ay = 1) {
    const tx = texOf(key);
    if (!tx) return;
    const w = tx.w * s, h = tx.h * s;
    g.drawImage(tx.el, x - w / 2, y - h * ay, w, h);
  }

  function draw(t) {
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.fillStyle = '#140602';
    g.fillRect(0, 0, W, H);

    g.setTransform(
      zoom.k * DPR, 0, 0, zoom.k * DPR,
      (W / 2 - zoom.x * zoom.k) * DPR,
      (H / 2 - zoom.y * zoom.k) * DPR
    );
    g.translate(0, SCENE_DY);

    if (hallCanvas) {
      g.drawImage(hallCanvas, 0, 0);
    } else if (ok(IMG.hall)) {
      g.drawImage(IMG.hall, 0, 0, W, H);
    }

    drawLights(t);
    drawIncenseAndSmoke(t);
    drawLotus(t);

    const list = [...people.values()].sort((a, b) => a.y - b.y);
    for (const p of list) drawPerson(p, t);

    drawEffects(t);

    // Mưa cánh sen phủ lớp tiền cảnh toàn màn hình
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawPetals(t);
  }

  // Hào quang Phật & ánh nến lung linh ấm áp trên bàn thờ
  function drawLights(t) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    const extra = effects.some((e) => e.type === 'halo') ? 0.28 : 0;
    g.globalAlpha = clamp(0.14 + 0.045 * Math.sin(t / 1400) + extra, 0, 0.85);
    drawTex('fx_halo', 540, 725, 1.55);
    g.globalAlpha = 1;
    // Các ngọn đèn dầu / nến hai bên bàn thờ trên hall.jpg
    const lamps = [[466, 912, 0], [614, 912, 1.4], [295, 868, 2.2], [785, 868, 3.5], [372, 752, 4.2], [708, 752, 5.3]];
    for (const [x, y, ph] of lamps) {
      const f = 0.52 + 0.2 * Math.sin(t / 240 + ph) + 0.08 * Math.sin(t / 95 + ph * 2);
      const gr = g.createRadialGradient(x, y, 2, x, y, 66);
      gr.addColorStop(0, `rgba(255, 212, 130, ${0.3 * f})`);
      gr.addColorStop(1, 'rgba(255, 150, 50, 0)');
      g.fillStyle = gr;
      g.fillRect(x - 66, y - 66, 132, 132);
    }
    g.restore();
  }

  // Nén hương đỏ chân nhang + làn khói trầm uốn lượn mềm mại từ lư hương
  function drawIncenseAndSmoke(t) {
    const strong = t < incenseUntil;
    g.save();
    // Vẽ từng nén hương cắm trong lư đồng (ALTAR.x = 540, ALTAR.y = 952)
    for (const st of incenseSticks) {
      const bx = ALTAR.x + st.dx;
      const by = ALTAR.y - 6;
      const tx = bx + Math.sin(st.tilt) * st.h;
      const ty = by - Math.cos(st.tilt) * st.h;
      // Chân hương đỏ son
      g.strokeStyle = '#b91c1c';
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(bx, by + 6);
      g.lineTo(bx + (tx - bx) * 0.32, by + (ty - by) * 0.32);
      g.stroke();
      // Thân hương trầm vàng xám
      g.strokeStyle = '#d6bfa2';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bx + (tx - bx) * 0.32, by + (ty - by) * 0.32);
      g.lineTo(tx, ty);
      g.stroke();
      // Đốm lửa nhang lập lòe
      const glow = 0.65 + 0.35 * Math.sin(t / 210 + st.phase);
      g.fillStyle = `rgba(255, 120, 40, ${glow})`;
      g.beginPath();
      g.arc(tx, ty, 2.7, 0, 6.28);
      g.fill();
      g.fillStyle = '#fef08a';
      g.beginPath();
      g.arc(tx, ty, 1.3, 0, 6.28);
      g.fill();
    }

    // Dải khói trầm mảnh uốn lượn thanh thoát (thay cho chấm tròn rời rạc cũ)
    const ribbons = strong ? 5 : 3;
    const height = strong ? 305 : 225;
    g.lineCap = 'round';
    for (let r = 0; r < ribbons; r++) {
      const phase = t * 0.0013 + r * 1.45;
      const ox = ALTAR.x + (r - (ribbons - 1) / 2) * 8;
      const oy = ALTAR.y - 52;
      const sway1 = Math.sin(phase) * (14 + r * 3);
      const sway2 = Math.cos(phase * 0.78 + r) * (24 + r * 4);
      const grd = g.createLinearGradient(ox, oy, ox, oy - height);
      const peakA = strong ? 0.24 : 0.15;
      grd.addColorStop(0, 'rgba(248, 237, 218, 0)');
      grd.addColorStop(0.18, `rgba(248, 237, 218, ${peakA})`);
      grd.addColorStop(0.65, `rgba(240, 228, 210, ${peakA * 0.55})`);
      grd.addColorStop(1, 'rgba(240, 228, 210, 0)');
      g.strokeStyle = grd;
      g.lineWidth = strong ? 5 + r * 1.6 : 4 + r * 1.3;
      g.beginPath();
      g.moveTo(ox, oy);
      g.bezierCurveTo(
        ox + sway1, oy - height * 0.34,
        ox - sway2, oy - height * 0.68,
        ox + sway1 * 0.7, oy - height
      );
      g.stroke();
    }
    g.restore();
  }

  function drawLotus(t) {
    for (const e of effects) {
      if (e.type !== 'lotus') continue;
      const k = (t - e.t0) / e.dur;
      const open = ease(Math.min(1, k * 2.4));
      const fade = k > 0.8 ? (1 - k) / 0.2 : 1;
      g.save();
      g.globalAlpha = Math.max(0, fade);
      g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(540, 705, 10, 540, 705, 300 * e.size);
      gr.addColorStop(0, 'rgba(255, 225, 140, .68)');
      gr.addColorStop(1, 'rgba(255, 190, 80, 0)');
      g.fillStyle = gr;
      g.fillRect(540 - 310 * e.size, 705 - 310 * e.size, 620 * e.size, 620 * e.size);
      g.globalCompositeOperation = 'source-over';
      drawTex('fx_lotus', 540, 882 - open * 36, (0.58 + open * 0.46) * e.size);
      g.restore();
    }
  }

  function drawPerson(p, t) {
    const anim = hasAnim(p.skin);
    const seated = p.state === 'sit' || (p.state === 'kneel' && p.after === 'sit');
    const ws = seated ? p.seat.s : scaleAt(p.y);

    // Hào quang ấm quanh người vừa gửi quà, bấm từ khoá hoặc mới vào
    if (p.glowUntil && t < p.glowUntil) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      const peak = p === spotlight?.p ? 0.55 : (p.glowPeak ?? 0.34);
      g.globalAlpha = Math.min(1, (p.glowUntil - t) / 1400) * peak;
      const gr = g.createRadialGradient(p.x, p.y - 105 * ws, 8, p.x, p.y - 105 * ws, 175 * ws);
      gr.addColorStop(0, 'rgba(255, 208, 125, .85)');
      gr.addColorStop(1, 'rgba(255, 160, 60, 0)');
      g.fillStyle = gr;
      g.fillRect(p.x - 185 * ws, p.y - 290 * ws, 370 * ws, 340 * ws);
      g.restore();
    }

    // Nhịp cúi lạy thành kính (3 lạy tam bái khi dâng hương, hoặc khẽ cúi đầu khi ngồi niệm Phật)
    let bowAmt = 0;
    if (p.state === 'offer') {
      const k = (t - p.t0) / 1000;
      if (k < 6.9) bowAmt = Math.pow(Math.max(0, Math.sin(((k % 2.3) / 2.3) * Math.PI)), 1.3);
    } else if (p.state === 'sit' && p.bowStart && t - p.bowStart < 2400) {
      bowAmt = Math.sin(((t - p.bowStart) / 2400) * Math.PI) * 0.35;
    }

    const walkBob = p.state === 'walk' && !anim ? -Math.abs(Math.sin(t / 125 + p.phase)) * 6 * ws : 0;
    const breathe = p.state === 'sit' ? Math.sin(t / 950 + p.phase) * 1.8 * ws : 0;

    g.save();
    g.globalAlpha = p.fade;
    g.translate(p.x, p.y);

    // Bóng đổ mềm dưới chân / bồ đoàn giúp nhân vật ăn nhập với mặt sàn gỗ
    g.fillStyle = 'rgba(10, 3, 1, 0.36)';
    g.beginPath();
    g.ellipse(0, -4 * ws, 68 * ws, 15 * ws, 0, 0, 6.28);
    g.fill();

    // Nếu quỳ trước bàn thờ trên sàn gỗ (không có bồ đoàn vẽ sẵn), lót chiếc bồ đoàn nâu trầm gọn đẹp
    const atAltar = p.state === 'offer' || (p.state === 'kneel' && p.after === 'offer');
    if (atAltar) {
      g.fillStyle = '#5c2d14';
      g.beginPath(); g.ellipse(0, -7 * ws, 66 * ws, 15 * ws, 0, 0, 6.28); g.fill();
      g.fillStyle = '#7c3f1d';
      g.beginPath(); g.ellipse(0, -10 * ws, 57 * ws, 11 * ws, 0, 0, 6.28); g.fill();
      g.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      g.lineWidth = 1.4;
      g.stroke();
    }

    let topY;
    if (anim) {
      const a = ANIM[p.skin];
      const tex = texOf('anim_' + p.skin);
      const k = (ws * 1.04 * 260) / a.seatH;
      const flip = atAltar ? p.x > ALTAR.x + 16 : p.flip;
      if (flip) g.scale(-1, 1);
      // Cúi lạy tự nhiên từ khớp gối thay vì cắt ngang thân hình
      if (bowAmt > 0) {
        g.translate(0, -24 * k);
        g.rotate(bowAmt * 0.19);
        g.scale(1 + bowAmt * 0.03, 1 - bowAmt * 0.1);
        g.translate(0, 24 * k);
      }
      if (tex) {
        g.drawImage(tex.el, p.frame * a.fw, 0, a.fw, a.fh, (-a.fw * k) / 2, -a.fh * k + breathe, a.fw * k, a.fh * k);
      }
      topY = (p.frame === 7 ? a.seatH : p.frame >= 5 ? a.fh * 0.8 : a.fh * 0.96) * k;
    } else {
      const flip = p.state === 'walk' ? p.flip : (atAltar ? p.x > ALTAR.x + 16 : facesLeft(p.x));
      if (flip) g.scale(-1, 1);
      if (bowAmt > 0) {
        g.translate(0, -22 * ws);
        g.rotate(bowAmt * 0.18);
        g.scale(1 + bowAmt * 0.03, 1 - bowAmt * 0.1);
        g.translate(0, 22 * ws);
      }
      drawTex('c_' + p.skin, 0, breathe + walkBob, ws * 1.04);
      topY = 256 * ws * 1.04;
    }
    g.restore();

    const tagY = p.y - topY - 8 * (ws / 0.45);
    const tagH = drawTag(p, p.x, tagY, ws);
    if (p.bubble && t < p.bubble.until) {
      drawBubble(p.bubble, p.x, tagY - tagH - 6, ws, t);
    }
  }

  function drawBubble(bub, x, y, ws, t) {
    const f = clamp(ws / 0.6, 0.72, 1.12);
    const fs = Math.round(16 * f);
    const fontStr = `600 ${fs}px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif`;
    const rem = bub.until - t;
    const alpha = rem < 500 ? Math.max(0, rem / 500) : 1;
    g.save();
    g.globalAlpha = alpha;
    g.font = fontStr;
    const txt = fitText(bub.text, 210, fontStr);
    const tw = g.measureText(txt).width;
    const w = Math.round(tw + 24);
    const h = Math.round(fs + 14);
    const rx = clamp(Math.round(x - w / 2), 116, W - 116 - w);
    const ry = Math.round(y - h);
    g.fillStyle = 'rgba(255, 251, 235, 0.96)';
    roundRect(rx, ry, w, h, 11);
    g.fill();
    g.strokeStyle = 'rgba(217, 119, 6, 0.85)';
    g.lineWidth = 1.6;
    g.stroke();
    // Mũi nhọn bong bóng thoại trỏ xuống nhân vật
    const tipX = clamp(x, rx + 12, rx + w - 12);
    g.beginPath();
    g.moveTo(tipX - 5, ry + h - 0.8);
    g.lineTo(tipX, ry + h + 6);
    g.lineTo(tipX + 5, ry + h - 0.8);
    g.closePath();
    g.fillStyle = 'rgba(255, 251, 235, 0.96)';
    g.fill();
    g.fillStyle = '#451a03';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(txt, rx + w / 2, ry + h / 2 + 0.5);
    g.restore();
  }

  function drawTag(p, x, y, ws) {
    const f = clamp(ws / 0.6, 0.66, 1.12);
    const r = Math.round(14 * f);
    const fs = Math.round(17 * f);
    const fontStr = `700 ${fs}px "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif`;
    g.save();
    g.font = fontStr;
    const label = p.label || (p.label = fitText(p.name, 136, fontStr));
    const tw = g.measureText(label).width;
    const w = Math.round(tw + r * 2 + 20);
    const h = Math.max(r * 2 + 6, fs + 12);
    const gold = p === spotlight?.p || p.points >= 500;
    const rx = Math.round(x - w / 2);
    const ry = Math.round(y - h);

    g.fillStyle = gold ? 'rgba(110, 44, 12, 0.94)' : 'rgba(24, 9, 4, 0.84)';
    roundRect(rx, ry, w, h, h / 2);
    g.fill();
    g.strokeStyle = gold ? '#fbbf24' : 'rgba(234, 179, 8, 0.42)';
    g.lineWidth = gold ? 2 : 1.2;
    g.stroke();

    const ax = rx + r + 4;
    const ay = ry + h / 2;
    if (p.img && ok(p.img)) {
      g.save();
      g.beginPath(); g.arc(ax, ay, r, 0, 6.28); g.clip();
      g.drawImage(p.img, ax - r, ay - r, r * 2, r * 2);
      g.restore();
    } else {
      g.fillStyle = '#853a12';
      g.beginPath(); g.arc(ax, ay, r, 0, 6.28); g.fill();
      g.fillStyle = '#fde68a';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `800 ${Math.max(11, Math.round(r * 0.95))}px "Be Vietnam Pro", system-ui, sans-serif`;
      g.fillText((p.name[0] || 'P').toUpperCase(), ax, ay + 0.5);
      g.font = fontStr;
    }

    g.fillStyle = gold ? '#fde68a' : '#fffbeb';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(label, ax + r + 7, ay + 0.5);
    g.restore();
    return h;
  }

  function drawEffects(t) {
    for (const e of effects) {
      if (e.type === 'spark') {
        g.save();
        g.globalAlpha = Math.max(0, 1 - e.age / e.life);
        g.fillStyle = e.color;
        g.beginPath(); g.arc(e.x, e.y, 3.2, 0, 6.28); g.fill();
        g.restore();
      } else if (e.type === 'ring') {
        const k = clamp((t - e.t0) / e.dur, 0, 1);
        g.save();
        g.strokeStyle = `rgba(${e.color}, ${(1 - k) * 0.72})`;
        g.lineWidth = 3 * (1 - k * 0.5);
        g.beginPath();
        g.arc(e.x, e.y, 18 + ease(k) * e.maxR, 0, 6.28);
        g.stroke();
        g.restore();
      } else if (e.type === 'sprite') {
        const k = (t - e.t0) / e.dur;
        const a = k < 0.14 ? k / 0.14 : k > 0.75 ? (1 - k) / 0.25 : 1;
        g.save();
        g.globalAlpha = Math.max(0, a);
        g.translate(e.x, e.y - (e.rise || 0) * k);
        if (e.swing) g.rotate(Math.sin(k * 18) * 0.22 * (1 - k));
        if (e.knock) g.rotate(Math.sin(k * 28) * 0.11 * (1 - k));
        if (e.glow) {
          g.globalCompositeOperation = 'lighter';
          const gr = g.createRadialGradient(0, -56, 5, 0, -56, 130);
          gr.addColorStop(0, 'rgba(255, 215, 130, .55)');
          gr.addColorStop(1, 'rgba(255, 170, 60, 0)');
          g.fillStyle = gr;
          g.fillRect(-140, -195, 280, 280);
          g.globalCompositeOperation = 'source-over';
        }
        drawTex(e.img, 0, 0, e.s);
        g.restore();
      } else if (e.type === 'heart') {
        const k = (t - e.t0) / e.dur;
        g.save();
        g.globalAlpha = Math.max(0, 1 - k);
        g.font = '26px "Segoe UI Emoji", system-ui';
        g.textAlign = 'center';
        g.fillText('🪷', e.x + Math.sin(k * 7) * 9, e.y - k * 85);
        g.restore();
      }
    }
  }

  function drawPetals(t) {
    const tx = texOf('fx_petal');
    for (const f of petals) {
      if (t < f.born) continue;
      g.save();
      g.translate(f.x, f.y);
      g.rotate(f.r);
      if (tx) {
        const w = tx.w * f.s, h = tx.h * f.s;
        g.drawImage(tx.el, -w / 2, -h / 2, w, h);
      } else {
        g.fillStyle = '#f9a8d4';
        g.beginPath(); g.ellipse(0, 0, 6, 12, 0, 0, 6.28); g.fill();
      }
      g.restore();
    }
  }

  // ---------------- Tiện ích hình học ----------------
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

  window.TempleScene = { init, setConfig, onEvent, onStats, command, setPaused, isOn: () => enabled };
})();
