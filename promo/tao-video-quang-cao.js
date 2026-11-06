'use strict';
/**
 * TRÌNH TẠO VIDEO QUẢNG CÁO BÁN HÀNG TỰ ĐỘNG — STUDIOLIVE PRO
 * Chạy bằng Electron:
 *   npx electron promo/tao-video-quang-cao.js
 * Tuỳ chọn dòng lệnh:
 *   --contact "Zalo: 09xx.xxx.xxx"   (Hiển thị thông tin liên hệ ở màn kết)
 *   --out "promo/StudioLive-Video-Gioi-Thieu.mp4"
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const ROOT_DIR = path.resolve(__dirname, '..');
const { Settings } = require(path.join(ROOT_DIR, 'src', 'settings'));
const { OverlayServer } = require(path.join(ROOT_DIR, 'src', 'server'));
const { synthesize } = require(path.join(ROOT_DIR, 'src', 'tts'));

function getArg(flag, fallback = '') {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const CONTACT_LINE = getArg('--contact', 'Bàn giao trọn bộ & hỗ trợ cài đặt từ xa ngay trong ngày!');
const OUT_FILE = path.resolve(ROOT_DIR, getArg('--out', path.join('promo', 'StudioLive-Video-Gioi-Thieu.mp4')));
const KEYFRAMES_DIR = getArg('--keyframes', '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- Vá thời lượng chuẩn cho file MP4 xuất từ Chromium MediaRecorder ----------------
function patchMp4Duration(buf, durationMs) {
  const out = Buffer.from(buf);
  const sec = Math.max(1, durationMs / 1000);

  function walk(start, end, movieTimescaleRef) {
    let pos = start;
    while (pos + 8 <= end) {
      let size = out.readUInt32BE(pos);
      const type = out.toString('ascii', pos + 4, pos + 8);
      let hdr = 8;
      if (size === 1) {
        if (pos + 16 > end) break;
        size = Number(out.readBigUInt64BE(pos + 8));
        hdr = 16;
      } else if (size === 0) {
        size = end - pos;
      }
      if (size < hdr || pos + size > end) break;

      if (type === 'moov' || type === 'trak' || type === 'mdia' || type === 'mvex') {
        walk(pos + hdr, pos + size, movieTimescaleRef);
      } else if (type === 'mvhd' && pos + hdr + 20 <= pos + size) {
        const ver = out.readUInt8(pos + hdr);
        if (ver === 0 && pos + hdr + 20 <= pos + size) {
          const ts = out.readUInt32BE(pos + hdr + 12) || 1000;
          movieTimescaleRef.ts = ts;
          out.writeUInt32BE(Math.round(sec * ts), pos + hdr + 16);
        } else if (ver === 1 && pos + hdr + 32 <= pos + size) {
          const ts = out.readUInt32BE(pos + hdr + 20) || 1000;
          movieTimescaleRef.ts = ts;
          out.writeBigUInt64BE(BigInt(Math.round(sec * ts)), pos + hdr + 24);
        }
      } else if (type === 'tkhd') {
        const ver = out.readUInt8(pos + hdr);
        const ts = movieTimescaleRef.ts || 1000;
        if (ver === 0 && pos + hdr + 24 <= pos + size) {
          out.writeUInt32BE(Math.round(sec * ts), pos + hdr + 20);
        } else if (ver === 1 && pos + hdr + 36 <= pos + size) {
          out.writeBigUInt64BE(BigInt(Math.round(sec * ts)), pos + hdr + 28);
        }
      } else if (type === 'mdhd') {
        const ver = out.readUInt8(pos + hdr);
        if (ver === 0 && pos + hdr + 20 <= pos + size) {
          const ts = out.readUInt32BE(pos + hdr + 12) || 1000;
          out.writeUInt32BE(Math.round(sec * ts), pos + hdr + 16);
        } else if (ver === 1 && pos + hdr + 32 <= pos + size) {
          const ts = out.readUInt32BE(pos + hdr + 20) || 1000;
          out.writeBigUInt64BE(BigInt(Math.round(sec * ts)), pos + hdr + 24);
        }
      } else if (type === 'mehd') {
        const ver = out.readUInt8(pos + hdr);
        const ts = movieTimescaleRef.ts || 1000;
        if (ver === 0 && pos + hdr + 8 <= pos + size) {
          out.writeUInt32BE(Math.round(sec * ts), pos + hdr + 4);
        } else if (ver === 1 && pos + hdr + 12 <= pos + size) {
          out.writeBigUInt64BE(BigInt(Math.round(sec * ts)), pos + hdr + 4);
        }
      }
      pos += size;
    }
  }

  try {
    walk(0, out.length, { ts: 1000 });
  } catch (err) {
    console.warn('patchMp4Duration warning:', err.message);
  }
  return out;
}

// ---------------- Tạo Avatar SVG tươi sáng cho nhân vật demo ----------------
function makeAvatarDataUri(idx) {
  const bgCols = ['#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
  const hairCols = ['#1e1b24', '#5c3317', '#7c2d12', '#1e293b', '#4a2511'];
  const bg = bgCols[idx % bgCols.length];
  const hc = hairCols[idx % hairCols.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="40" fill="${bg}"/>
    <circle cx="40" cy="43" r="21" fill="#fde2c4"/>
    <path d="M18 39 C20 16,60 16,62 39 Z" fill="${hc}"/>
    <circle cx="33" cy="43" r="3.2" fill="#1e293b"/>
    <circle cx="47" cy="43" r="3.2" fill="#1e293b"/>
    <circle cx="27" cy="49" r="3.5" fill="#fb7185" opacity="0.5"/>
    <circle cx="53" cy="49" r="3.5" fill="#fb7185" opacity="0.5"/>
    <path d="M34 52 Q40 58 46 52" fill="none" stroke="#be123c" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const VN_NAMES = [
  'Minh Anh', 'Bảo Ngọc', 'Hoàng Cường', 'Khánh Linh', 'Tuấn Kiệt', 'Phương Nhi',
  'Gia Bảo', 'Tường Vy', 'Nhật Minh', 'Cẩm Tú', 'Thảo Nguyên', 'Đức Phúc',
  'Ngọc Hân', 'Bích Phương', 'Hải Đăng', 'Quốc Huy', 'Mii Anime', 'Thỏ Con',
  'Bé Na', 'Gấu Trúc', 'Sóc Nhỏ', 'Thanh Tùng', 'Mai Phương', 'Trọng Nghĩa',
  'Hoàng Nam', 'Linh Đan', 'Anh Thư', 'Quỳnh Hương'
];

async function grabFrameBase64(win, quality = 86) {
  const img = await win.webContents.capturePage();
  return 'data:image/jpeg;base64,' + img.toJPEG(quality).toString('base64');
}

async function recordClipFrames(win, count, intervalMs, quality = 85, onTick = null) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    if (onTick) await onTick(i);
    frames.push(await grabFrameBase64(win, quality));
    await sleep(intervalMs);
  }
  return frames;
}

// ---------------- Bước 1: Tạo giọng đọc thuyết minh quảng cáo ----------------
const VOICE_SCRIPT = [
  {
    id: 'hook',
    v: 'm',
    rate: 1.12,
    hype: true,
    caption: 'Treo Live TikTok 24/7 hút quà & tăng follow — Không cần lộ mặt, không cần ngồi nói!',
    text: 'Muốn treo Live TikTok kéo hàng ngàn mắt xem, hút quà và tăng follow tự động mà không cần lộ mặt, không cần ngồi nói hàng giờ? Đây chính là vũ khí bí mật của các phòng Live tương tác triệu view!'
  },
  {
    id: 'intro',
    v: 'm',
    rate: 1.12,
    hype: false,
    caption: 'StudioLive 5 trong 1: Khán giả bình luận là hóa thân ngay thành nhân vật trên màn hình!',
    text: 'Giới thiệu StudioLive, phần mềm phòng Live tương tác năm trong một. Người xem chỉ cần gõ bình luận là lập tức hóa thân thành nhân vật ngay trên màn hình!'
  },
  {
    id: 'lop',
    v: 'm',
    rate: 1.12,
    hype: false,
    caption: 'Lớp Học Chữ: Hơn 2.000 câu đố, Toán nhẩm, 5 trò Giờ Ra Chơi & Cô Giáo AI tự dẫn dắt!',
    text: 'Nổi bật nhất là Lớp Học Chữ với hơn hai ngàn câu đố, toán nhẩm và năm trò chơi giải lao. Cô giáo A I tự động đọc đề, chấm điểm, xếp ghế Lớp Trưởng và nhận hoa khi có quà tặng!'
  },
  {
    id: 'cogiao',
    v: 'f',
    rate: 1.06,
    hype: true,
    caption: '👩‍🏫 Cô Giáo AI: "Cả lớp sẵn sàng chưa? Nhìn lên bảng giải đố nhé, bắt đầu!"',
    text: 'Cả lớp sẵn sàng chưa? Nhìn lên bảng giải đố nhé, bắt đầu!'
  },
  {
    id: 'barchua',
    v: 'm',
    rate: 1.12,
    hype: false,
    caption: 'Đi Bar Online bùng nổ quà buổi tối · Đi Chùa Online giữ chân mắt xem suốt ban ngày!',
    text: 'Buổi tối bùng nổ quà tặng với Đi Bar Online: dàn nhân vật meme gắn avatar người xem quẩy cực sung, bắn pháo hoa và ghép đôi! Ban ngày giữ chân khán giả hàng giờ với Đi Chùa Online: dâng hương, thỉnh chuông và đọc sớ cầu an.'
  },
  {
    id: 'easy',
    v: 'm',
    rate: 1.12,
    hype: false,
    caption: 'Tặng kèm Rạp Phim & Nhà Ma · Cắm thẳng vào TikTok LIVE Studio hoặc OBS trong 1 phút!',
    text: 'Tặng kèm cả Rạp Phim Online và Nhà Ma vui nhộn. Bảng điều khiển tiếng Việt cực dễ dùng: chỉ cần nhập tên kênh, dán link vào TikTok LIVE Studio hoặc O B S là lên sóng ngay!'
  },
  {
    id: 'cta',
    v: 'm',
    rate: 1.10,
    hype: true,
    caption: 'Đầu tư 1 lần, khai thác mỗi ngày — Nhắn tin ngay để nhận trọn bộ & ưu đãi hôm nay!',
    text: 'Đầu tư một lần, khai thác mỗi ngày! Nhắn tin ngay hôm nay để nhận trọn bộ phần mềm StudioLive kèm hỗ trợ cài đặt từ A đến Z và ưu đãi đặc biệt!'
  }
];

async function buildVoiceAssets() {
  console.log('[1/4] Đang tổng hợp giọng đọc AI thuyết minh bán hàng...');
  const out = {};
  for (const item of VOICE_SCRIPT) {
    const mp3Buf = await synthesize(item.text, item.rate, { v: item.v, hype: item.hype });
    out[item.id] = {
      ...item,
      dataUri: 'data:audio/mpeg;base64,' + mp3Buf.toString('base64')
    };
    console.log(`  ✓ ${item.id} (${(mp3Buf.length / 1024).toFixed(1)} KB)`);
  }
  return out;
}

// ---------------- Bước 2: Quay trực tiếp hình ảnh chuyển động thật của 5 phòng Live & Bảng điều khiển ----------------
async function captureProductFootage(tmpDir) {
  console.log('[2/4] Đang quay trực tiếp cảnh hoạt động thật từ 5 phòng Live & Bảng điều khiển...');
  const settings = new Settings(path.join(tmpDir, 'userdata'));
  settings.update({
    overlay: {
      mode: 'lop',
      sound: false,
      lopVoice: false,
      barVoice: false,
      chuaVoice: false,
      rapVoice: false,
      lopName: 'Lớp Học Chữ',
      barName: 'Sàn Bar Remix',
      chuaName: 'Chùa Bình An',
      rapName: 'Rạp Chiếu Đêm'
    }
  });

  const server = new OverlayServer({
    getConfig: () => settings.get(),
    getSnapshot: () => ({
      stats: { likes: 18500, viewers: 428, comments: 3200, gifts: 95, diamonds: 2450, follows: 180, topGifters: [] }
    }),
    getPaused: () => false,
    getDataDir: () => path.join(tmpDir, 'userdata')
  });

  const port = await server.start(3992);
  const win = new BrowserWindow({
    width: 540,
    height: 960,
    show: false,
    useContentSize: true,
    webPreferences: { offscreen: true, backgroundThrottling: false }
  });
  win.webContents.setFrameRate(30);

  const setOverlay = (patch) => {
    const next = settings.update({ overlay: patch });
    server.broadcast('config', next.overlay);
  };

  await win.loadURL(`http://127.0.0.1:${port}/?output&mute=1`);
  await win.webContents.insertCSS('html, body { background: #070612 !important; }');
  await sleep(900);

  // --- Clip 1: Lớp Học Chữ (Avatar tròn + Giải đố + Tặng hoa Cô Giáo + Pháo giấy) ---
  console.log('  • Quay cảnh 1: Lớp Học Chữ (Ghép chữ + Tặng hoa)...');
  setOverlay({ mode: 'lop', lopAvatarMode: 'avatar', lopTheme: 'classic', lopVoice: false, sound: false });
  await sleep(300);
  server.broadcast('lop', { action: 'skip' }); // qua intro
  await sleep(220);
  server.broadcast('lop', { action: 'skip' }); // mở ô chữ
  await sleep(200);
  server.broadcast('lop', { action: 'flood', n: 34 });
  await sleep(1300);
  server.broadcast('lop', { action: 'answerCorrect' });
  await sleep(120);
  server.broadcast('lop', { action: 'answerCorrect' });
  await sleep(120);
  server.broadcast('live', {
    type: 'gift',
    user: { id: 'vip-bngoc', nickname: 'Bảo Ngọc', avatar: makeAvatarDataUri(1) },
    giftName: 'Bó Hoa Tươi',
    diamonds: 35,
    repeatCount: 1,
    total: 35,
    ts: Date.now()
  });
  const clipLopWord = await recordClipFrames(win, 44, 65, 86, async (f) => {
    if (f === 18) server.broadcast('lop', { action: 'answerCorrect' });
  });

  // --- Clip 2: Lớp Học Chữ (Giờ Ra Chơi Chọn Phe + Quay lưng 10 kiểu tóc) ---
  console.log('  • Quay cảnh 2: Lớp Học Chữ (Giờ Ra Chơi & Kiểu tóc học sinh)...');
  setOverlay({ lopAvatarMode: 'back' });
  server.broadcast('lop', { action: 'recessGame', game: 'pick' });
  await sleep(250);
  server.broadcast('lop', { action: 'flood', n: 26 });
  await sleep(450);
  const clipLopRecess = await recordClipFrames(win, 38, 65, 86, async (f) => {
    if (f === 16) setOverlay({ lopAvatarMode: 'avatar' });
  });

  // --- Clip 3: Đi Bar Online (Sàn nhảy Meme + Avatar + Pháo hoa sân khấu) ---
  console.log('  • Quay cảnh 3: Đi Bar Online (Nhân vật Meme + Pháo hoa)...');
  setOverlay({ mode: 'bar', barTheme: 'cyber', barName: 'CLUB TRIỆU VIEW', barVoice: false, sound: false });
  await sleep(350);
  for (let i = 0; i < 24; i++) {
    server.broadcast('live', {
      type: 'chat',
      user: { id: `bar-${i}`, nickname: VN_NAMES[i % VN_NAMES.length], avatar: makeAvatarDataUri(i) },
      text: i % 5 === 0 ? 'nhảy 1 cái' : 'Quẩy lên anh em ơi 🔥',
      ts: Date.now()
    });
  }
  await sleep(850);
  server.broadcast('bar', { action: 'rain' });
  server.broadcast('bar', { action: 'couple' });
  server.broadcast('live', {
    type: 'gift',
    user: { id: 'bar-vip', nickname: 'Hoàng Cường', avatar: makeAvatarDataUri(2) },
    giftName: 'Siêu Xe Vàng',
    diamonds: 120,
    repeatCount: 1,
    total: 120,
    ts: Date.now()
  });
  const clipBar = await recordClipFrames(win, 46, 60, 86, async (f) => {
    if (f === 20) server.broadcast('bar', { action: 'cheers' });
  });

  // --- Clip 4: Đi Chùa Online (Phật tử dâng hương + Thỉnh chuông + Sớ cầu an) ---
  console.log('  • Quay cảnh 4: Đi Chùa Online (Dâng hương & Sớ Cầu An)...');
  setOverlay({ mode: 'chua', chuaName: 'Chùa An Lạc', chuaVoice: false, sound: false });
  await sleep(450);
  const chuaPhrases = ['Nam mô A Di Đà Phật 🙏', 'sư', 'nữ', 'tiểu', 'Con cầu bình an sức khỏe cho cả gia đình', 'thỉnh chuông', 'hoa sen'];
  for (let i = 0; i < 18; i++) {
    server.broadcast('live', {
      type: 'chat',
      user: { id: `chua-${i}`, nickname: VN_NAMES[i % VN_NAMES.length], avatar: makeAvatarDataUri(i + 3) },
      text: chuaPhrases[i % chuaPhrases.length],
      ts: Date.now()
    });
  }
  await sleep(950);
  server.broadcast('live', {
    type: 'chat',
    user: { id: 'chua-wish', nickname: 'Minh Anh', avatar: makeAvatarDataUri(0) },
    text: 'Con cầu bình an, tài lộc và may mắn cho gia đình năm mới',
    test: true,
    ts: Date.now()
  });
  const clipChua = await recordClipFrames(win, 38, 65, 86);

  // --- Clip 5: Rạp Phim Online (Mưa bắp rang + Vỗ tay + Ghế VIP) ---
  console.log('  • Quay cảnh 5: Rạp Phim Online...');
  setOverlay({ mode: 'rap', rapTheme: 'gold', rapName: 'Rạp Phim Đêm', rapVoice: false, sound: false });
  await sleep(400);
  for (let i = 0; i < 18; i++) {
    server.broadcast('live', {
      type: 'chat',
      user: { id: `rap-${i}`, nickname: VN_NAMES[i % VN_NAMES.length], avatar: makeAvatarDataUri(i + 1) },
      text: ['bắp', 'vỗ tay', 'haha', 'Phim cuốn quá!'][i % 4],
      ts: Date.now()
    });
  }
  server.broadcast('live', {
    type: 'gift',
    user: { id: 'rap-vip', nickname: 'Tuấn Kiệt', avatar: makeAvatarDataUri(4) },
    giftName: 'Vé VIP Vàng',
    diamonds: 50,
    repeatCount: 1,
    total: 50,
    ts: Date.now()
  });
  await sleep(750);
  server.broadcast('rap', { action: 'rain' });
  server.broadcast('rap', { action: 'clap' });
  const clipRap = await recordClipFrames(win, 30, 68, 84);

  // --- Clip 6: Live Ma Online (Nhà Ma + Soi đèn pin + Hù) ---
  console.log('  • Quay cảnh 6: Live Ma Online...');
  setOverlay({ mode: 'game', background: 'haunted', bots: true, sound: false });
  await sleep(400);
  for (let i = 0; i < 12; i++) {
    server.broadcast('live', {
      type: 'chat',
      user: { id: `ma-${i}`, nickname: VN_NAMES[i % VN_NAMES.length], avatar: makeAvatarDataUri(i + 2) },
      text: ['hù', 'tìm', 'nhảy', 'trốn'][i % 4],
      ts: Date.now()
    });
  }
  await sleep(650);
  server.broadcast('game', 'thunder');
  const clipMa = await recordClipFrames(win, 30, 68, 84);

  await win.close();

  // --- Ảnh chụp thực tế Bảng điều khiển chủ kênh StudioLive (1280×800) ---
  console.log('  • Chụp giao diện Bảng điều khiển chủ kênh StudioLive...');
  const uiWin = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    useContentSize: true,
    webPreferences: { offscreen: true, backgroundThrottling: false }
  });
  await uiWin.loadFile(path.join(ROOT_DIR, 'renderer', 'index.html'));
  await sleep(450);
  await uiWin.webContents.executeJavaScript(`(() => {
    const warn = document.getElementById('warn-connect');
    if (warn) warn.style.display = 'none';
    const u = document.getElementById('username');
    if (u) u.value = 'kenh_live_trieu_view';
    const pill = document.getElementById('status-pill');
    if (pill) pill.className = 'status-pill connected';
    const st = document.getElementById('status-text');
    if (st) st.textContent = 'Đang phát trực tiếp · Lớp Học Chữ';
    const up = document.getElementById('uptime');
    if (up) up.textContent = '04:18:36';
    const cl = document.getElementById('clients');
    if (cl) cl.textContent = '1 (TikTok LIVE Studio)';
    const srvDot = document.getElementById('srv-dot');
    if (srvDot) srvDot.style.background = '#22c55e';
    const srvSub = document.getElementById('srv-sub');
    if (srvSub) srvSub.textContent = 'http://localhost:3000 · Đang chạy';
    const ver = document.getElementById('ver');
    if (ver) ver.textContent = 'StudioLive v1.0 Pro';

    const setTxt = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    setTxt('s-viewers', '1.428');
    setTxt('s-likes', '68.450');
    setTxt('s-comments', '9.812');
    setTxt('s-gifts', '415');
    setTxt('s-diamonds', '6.290');
    setTxt('s-follows', '538');
    setTxt('qs-scene', 'Đang chạy: 📚 Lớp Học Chữ');

    const navLop = document.getElementById('nav-lop');
    if (navLop) {
      const dot = navLop.querySelector('.live-dot');
      if (dot) dot.style.display = 'inline-block';
    }

    const feed = document.getElementById('feed');
    if (feed) {
      feed.innerHTML = [
        ['🎁', '#f472b6', 'Bảo Ngọc', 'vừa tặng Bó Hoa Tươi ×5 (150 💎) — Ôm hoa lên bục tặng Cô Giáo!'],
        ['💬', '#a3e635', 'Minh Anh', 'CON ẾCH  (Giải đúng nhanh nhất +10đ · Giữ ghế 👑 Lớp Trưởng)'],
        ['🎁', '#facc15', 'Hoàng Cường', 'vừa tặng Vương Miện Vàng (299 💎) — Mở 1 chữ cứu cả lớp!'],
        ['💜', '#c084fc', 'Khánh Linh', 'vừa bấm Theo dõi kênh & ngồi vào Bàn 2'],
        ['💬', '#38bdf8', 'Tuấn Kiệt', 'CON ẾCH  (+7đ · Chuỗi 3 câu liên tiếp +5đ thưởng nóng!)']
      ].map(([ico, col, name, msg]) =>
        '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,0.04);margin-bottom:8px;border-left:3px solid ' + col + '">' +
        '<span style="font-size:20px">' + ico + '</span>' +
        '<div style="font-size:13.5px;line-height:1.35"><b style="color:#fff">' + name + '</b> <span style="color:#cbd5e1">' + msg + '</span></div></div>'
      ).join('');
    }

    const leader = document.getElementById('leader');
    if (leader) {
      leader.innerHTML = [
        ['🥇 Hoàng Cường', '2.450 💎'],
        ['🥈 Bảo Ngọc', '1.820 💎'],
        ['🥉 Tuấn Kiệt', '980 💎'],
        ['4. Minh Anh', '640 💎']
      ].map(([n, d]) =>
        '<li style="display:flex;justify-content:space-between;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13.5px"><b style="color:#f8fafc">' + n + '</b><span style="color:#facc15;font-weight:700">' + d + '</span></li>'
      ).join('');
    }
  })()`);
  await sleep(250);
  const dashboardShot = 'data:image/png;base64,' + (await uiWin.webContents.capturePage()).toPNG().toString('base64');
  await uiWin.close();
  await server.stop();

  return {
    lopWord: clipLopWord,
    lopRecess: clipLopRecess,
    bar: clipBar,
    chua: clipChua,
    rap: clipRap,
    ma: clipMa,
    dashboard: dashboardShot
  };
}

// ---------------- Bước 3: Trang HTML dựng Motion Graphics + Hòa âm + Xuất MP4 1080×1920 ----------------
function buildComposerHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; padding: 0; background: #070612; overflow: hidden; }
  canvas { display: block; width: 1080px; height: 1920px; }
</style>
</head>
<body>
<canvas id="stage" width="1080" height="1920"></canvas>
<script>
window.runPromoComposer = async function(payload) {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1920;

  if (document.fonts && document.fonts.ready) {
    try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch {}
  }

  // Giải mã toàn bộ ảnh clip sang HTMLImageElement để vẽ 30fps mượt tuyệt đối
  async function decodeImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function decodeClip(arr) {
    const out = [];
    for (const src of arr) {
      const im = await decodeImage(src);
      if (im) out.push(im);
    }
    return out;
  }

  const clips = {
    lopWord: await decodeClip(payload.footage.lopWord),
    lopRecess: await decodeClip(payload.footage.lopRecess),
    bar: await decodeClip(payload.footage.bar),
    chua: await decodeClip(payload.footage.chua),
    rap: await decodeClip(payload.footage.rap),
    ma: await decodeClip(payload.footage.ma)
  };
  const dashImg = await decodeImage(payload.footage.dashboard);

  // Giải mã toàn bộ MP3 thuyết minh bằng WebAudio để đồng bộ từng mili-giây
  const audioCtx = new AudioContext({ sampleRate: 48000 });
  await audioCtx.resume();

  async function decodeVo(dataUri) {
    const res = await fetch(dataUri);
    const ab = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(ab);
  }

  const voOrder = ['hook', 'intro', 'lop', 'cogiao', 'barchua', 'easy', 'cta'];
  const voBuffers = {};
  for (const id of voOrder) {
    voBuffers[id] = await decodeVo(payload.voices[id].dataUri);
  }

  // Xây dựng Timeline chính xác theo độ dài thực của giọng đọc (+ khoảng nghỉ chuyển cảnh mượt)
  const pad = 0.55;
  let cursor = 0.35;

  const segHook = { start: 0, voStart: cursor, dur: voBuffers.hook.duration };
  cursor += segHook.dur + pad;
  segHook.end = cursor;

  const segIntro = { start: cursor, voStart: cursor + 0.18, dur: voBuffers.intro.duration };
  cursor = segIntro.voStart + segIntro.dur + pad;
  segIntro.end = cursor;

  const segLop = {
    start: cursor,
    voStart: cursor + 0.18,
    dur: voBuffers.lop.duration,
    cgStart: cursor + 0.18 + voBuffers.lop.duration + 0.22,
    cgDur: voBuffers.cogiao.duration
  };
  cursor = segLop.cgStart + segLop.cgDur + pad + 0.15;
  segLop.end = cursor;

  const segBarChua = { start: cursor, voStart: cursor + 0.18, dur: voBuffers.barchua.duration };
  cursor = segBarChua.voStart + segBarChua.dur + pad;
  segBarChua.end = cursor;

  const segEasy = { start: cursor, voStart: cursor + 0.18, dur: voBuffers.easy.duration };
  cursor = segEasy.voStart + segEasy.dur + pad;
  segEasy.end = cursor;

  const segCta = { start: cursor, voStart: cursor + 0.18, dur: voBuffers.cta.duration };
  cursor = segCta.voStart + segCta.dur + 1.35;
  segCta.end = cursor;

  const totalDuration = cursor;

  // ---------------- Hòa âm Chuyên Nghiệp: Nhạc nền điện tử sôi động + Hiệu ứng chuyển cảnh + Ducking ----------------
  const dest = audioCtx.createMediaStreamDestination();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.95;
  masterGain.connect(dest);

  // Kênh giọng đọc (rõ nét, ưu tiên số 1)
  const voGain = audioCtx.createGain();
  voGain.gain.value = 1.12;
  voGain.connect(masterGain);

  // Kênh nhạc nền (tự động hạ nhỏ khi có giọng đọc, nâng lên ở nhịp chuyển và kết)
  const bgmGain = audioCtx.createGain();
  bgmGain.gain.value = 0.16;
  bgmGain.connect(masterGain);

  const t0 = audioCtx.currentTime + 0.12;

  function scheduleVo(buf, whenSec, gainMul = 1.0) {
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.value = gainMul;
    src.connect(g);
    g.connect(voGain);
    src.start(t0 + whenSec);
  }

  scheduleVo(voBuffers.hook, segHook.voStart, 1.0);
  scheduleVo(voBuffers.intro, segIntro.voStart, 1.0);
  scheduleVo(voBuffers.lop, segLop.voStart, 1.0);
  scheduleVo(voBuffers.cogiao, segLop.cgStart, 1.08);
  scheduleVo(voBuffers.barchua, segBarChua.voStart, 1.0);
  scheduleVo(voBuffers.easy, segEasy.voStart, 1.0);
  scheduleVo(voBuffers.cta, segCta.voStart, 1.04);

  // Hiệu ứng âm thanh chuyển cảnh (Whoosh + Chime sáng)
  function scheduleWhoosh(whenSec) {
    const len = Math.floor(audioCtx.sampleRate * 0.28);
    const b = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    const s = audioCtx.createBufferSource();
    s.buffer = b;
    const f = audioCtx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(320, t0 + whenSec);
    f.frequency.exponentialRampToValueAtTime(2200, t0 + whenSec + 0.25);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.16, t0 + whenSec);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + whenSec + 0.28);
    s.connect(f); f.connect(g); g.connect(masterGain);
    s.start(t0 + whenSec);

    // Chime đồng bộ chuyển cảnh
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t0 + whenSec + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1320, t0 + whenSec + 0.22);
    const cg = audioCtx.createGain();
    cg.gain.setValueAtTime(0.11, t0 + whenSec + 0.04);
    cg.gain.exponentialRampToValueAtTime(0.001, t0 + whenSec + 0.34);
    osc.connect(cg); cg.connect(masterGain);
    osc.start(t0 + whenSec + 0.04);
    osc.stop(t0 + whenSec + 0.36);
  }

  [0.02, segIntro.start, segLop.start, segBarChua.start, segEasy.start, segCta.start].forEach(scheduleWhoosh);

  // Nhạc nền Pop-Electronic hiện đại 124 BPM (Kick + HiHat + Sub Bass + Pluck Hợp âm Am - F - C - G)
  const bpm = 124;
  const beatDur = 60 / bpm;
  const totalBeats = Math.ceil(totalDuration / beatDur);
  const chordProg = [
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63], // F
    [261.63, 329.63, 392.0], // C
    [196.0, 246.94, 392.0]   // G
  ];
  const bassRoots = [110.0, 87.31, 130.81, 98.0];

  for (let b = 0; b < totalBeats; b++) {
    const bt = t0 + b * beatDur;
    if (b * beatDur > totalDuration - 0.15) break;
    const barIdx = Math.floor(b / 4) % 4;

    // Kick trầm ấm mỗi phách
    const kOsc = audioCtx.createOscillator();
    const kGain = audioCtx.createGain();
    kOsc.type = 'sine';
    kOsc.frequency.setValueAtTime(135, bt);
    kOsc.frequency.exponentialRampToValueAtTime(42, bt + 0.11);
    kGain.gain.setValueAtTime(0.55, bt);
    kGain.gain.exponentialRampToValueAtTime(0.001, bt + 0.18);
    kOsc.connect(kGain); kGain.connect(bgmGain);
    kOsc.start(bt); kOsc.stop(bt + 0.19);

    // Sub-bass nảy ở nửa phách
    const bsOsc = audioCtx.createOscillator();
    const bsGain = audioCtx.createGain();
    bsOsc.type = 'triangle';
    bsOsc.frequency.setValueAtTime(bassRoots[barIdx], bt + beatDur * 0.5);
    bsGain.gain.setValueAtTime(0.28, bt + beatDur * 0.5);
    bsGain.gain.exponentialRampToValueAtTime(0.001, bt + beatDur * 0.95);
    bsOsc.connect(bsGain); bsGain.connect(bgmGain);
    bsOsc.start(bt + beatDur * 0.5); bsOsc.stop(bt + beatDur);

    // Pluck arpeggio tươi sáng (2 nốt mỗi phách)
    const chord = chordProg[barIdx];
    for (let sub = 0; sub < 2; sub++) {
      const st = bt + sub * (beatDur * 0.5);
      const pOsc = audioCtx.createOscillator();
      const pGain = audioCtx.createGain();
      pOsc.type = 'sine';
      pOsc.frequency.setValueAtTime(chord[(b * 2 + sub) % chord.length] * 2, st);
      pGain.gain.setValueAtTime(0.15, st);
      pGain.gain.exponentialRampToValueAtTime(0.001, st + 0.21);
      pOsc.connect(pGain); pGain.connect(bgmGain);
      pOsc.start(st); pOsc.stop(st + 0.22);
    }
  }

  // Nâng nhạc kết cuối video rồi fade-out mượt
  bgmGain.gain.setValueAtTime(0.15, t0);
  bgmGain.gain.setValueAtTime(0.15, t0 + segCta.voStart + segCta.dur);
  bgmGain.gain.linearRampToValueAtTime(0.34, t0 + segCta.voStart + segCta.dur + 0.25);
  bgmGain.gain.linearRampToValueAtTime(0.001, t0 + totalDuration - 0.05);

  // ---------------- Tiện ích đồ hoạ Motion Graphics ----------------
  const FONT = '"Be Vietnam Pro", "Segoe UI", system-ui, sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOutBack = (x) => {
    const c1 = 1.70158, c3 = c1 + 1;
    const p = clamp(x, 0, 1) - 1;
    return 1 + c3 * p * p * p + c1 * p * p;
  };
  const easeOutCubic = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

  function rrect(x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function wrapLines(text, maxW, fontStr) {
    ctx.font = fontStr;
    const words = String(text || '').split(/\\s+/).filter(Boolean);
    const lines = [];
    let cur = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      const test = cur + ' ' + words[i];
      if (ctx.measureText(test).width <= maxW) cur = test;
      else { lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // Hạt ánh sáng bokeh nền sang trọng
  const bokeh = Array.from({ length: 34 }, (_, i) => ({
    x: (i * 197) % W,
    y: (i * 311) % H,
    r: 3 + (i % 5) * 2.4,
    sp: 18 + (i % 6) * 9,
    col: ['#fde047', '#38bdf8', '#f472b6', '#a855f7'][i % 4]
  }));

  function drawLuxuryBg(t, palette = 'gold') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (palette === 'cyber') {
      g.addColorStop(0, '#090418');
      g.addColorStop(0.5, '#190830');
      g.addColorStop(1, '#060510');
    } else if (palette === 'warm') {
      g.addColorStop(0, '#140c06');
      g.addColorStop(0.5, '#271509');
      g.addColorStop(1, '#0c0704');
    } else {
      g.addColorStop(0, '#070919');
      g.addColorStop(0.5, '#131033');
      g.addColorStop(1, '#060712');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Hào quang ánh sáng xoay dịu
    const spots = palette === 'cyber'
      ? [[240, 460, 480, 'rgba(236,72,153,0.24)'], [850, 980, 520, 'rgba(56,189,248,0.22)']]
      : palette === 'warm'
      ? [[540, 480, 560, 'rgba(245,158,11,0.24)'], [280, 1280, 460, 'rgba(234,179,8,0.16)']]
      : [[260, 380, 500, 'rgba(250,204,21,0.19)'], [820, 1080, 540, 'rgba(56,189,248,0.18)'], [540, 1580, 480, 'rgba(168,85,247,0.18)']];

    for (const [sx, sy, sr, col] of spots) {
      const dx = Math.sin(t * 0.9 + sx) * 35;
      const dy = Math.cos(t * 0.7 + sy) * 30;
      const rg = ctx.createRadialGradient(sx + dx, sy + dy, 10, sx + dx, sy + dy, sr);
      rg.addColorStop(0, col);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    // Lưới công nghệ mảnh tinh tế
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 90) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = (-(t * 24) % 90); y <= H; y += 90) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Hạt bokeh bay lên
    for (const p of bokeh) {
      const py = (p.y - t * p.sp % H + H) % H;
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + p.x);
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x + Math.sin(t + p.y) * 14, py, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawPillBadge(cx, y, text, bgCol = 'rgba(250,204,21,0.16)', borderCol = '#facc15', textCol = '#fef08a', fontSize = 23) {
    ctx.save();
    ctx.font = '800 ' + fontSize + 'px ' + FONT;
    const tw = Math.min(940, ctx.measureText(text).width + 52);
    const h = fontSize + 24;
    rrect(cx - tw / 2, y, tw, h, h / 2);
    ctx.fillStyle = bgCol;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = borderCol;
    ctx.stroke();
    ctx.fillStyle = textCol;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, y + h / 2 + 1);
    ctx.restore();
  }

  // Khung điện thoại thông minh 3D phát trực tiếp Clip thật bên trong
  function drawPhoneMockup(clipFrames, fps, t, x, y, w, h, opts = {}) {
    if (!clipFrames || !clipFrames.length) return;
    const frame = clipFrames[Math.floor(t * fps) % clipFrames.length];
    ctx.save();
    const cx = x + w / 2, cy = y + h / 2;
    ctx.translate(cx, cy);
    if (opts.rot) ctx.rotate(opts.rot);
    if (opts.scale) ctx.scale(opts.scale, opts.scale);

    // Đổ bóng sâu + viền neon
    ctx.shadowColor = opts.glow || 'rgba(250,204,21,0.42)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 14;
    rrect(-w / 2 - 9, -h / 2 - 9, w + 18, h + 18, 38);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.lineWidth = 4;
    ctx.strokeStyle = opts.border || '#fde047';
    ctx.stroke();

    // Màn hình clip bên trong
    ctx.save();
    rrect(-w / 2, -h / 2, w, h, 30);
    ctx.clip();
    ctx.drawImage(frame, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Tai thỏ Dynamic Island gọn gàng
    rrect(-w * 0.14, -h / 2 + 10, w * 0.28, 16, 8);
    ctx.fillStyle = '#020617';
    ctx.fill();

    // Nhãn góc LIVE đỏ + tiêu đề cảnh
    if (opts.label) {
      ctx.font = '800 19px ' + FONT;
      const lw = ctx.measureText(opts.label).width + 34;
      rrect(-w / 2 + 14, h / 2 - 48, lw, 34, 17);
      ctx.fillStyle = 'rgba(9, 11, 22, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = opts.border || '#fde047';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.label, -w / 2 + 31, h / 2 - 30);
    }

    if (opts.liveBadge !== false) {
      rrect(w / 2 - 94, -h / 2 + 16, 78, 28, 14);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('● LIVE', w / 2 - 55, -h / 2 + 31);
    }
    ctx.restore();
  }

  // Hộp phụ đề thuyết minh phía dưới giúp người xem tắt tiếng vẫn đọc trọn thông điệp
  function drawVoiceCaption(t) {
    let activeCap = '';
    for (const [id, seg] of [
      ['hook', segHook],
      ['intro', segIntro],
      ['lop', segLop],
      ['barchua', segBarChua],
      ['easy', segEasy]
    ]) {
      if (t >= seg.start && t < seg.end) {
        if (id === 'lop' && t >= segLop.cgStart - 0.1) activeCap = payload.voices.cogiao.caption;
        else activeCap = payload.voices[id].caption;
        break;
      }
    }
    if (!activeCap) return;

    ctx.save();
    const fontStr = '700 24px ' + FONT;
    const lines = wrapLines(activeCap, 880, fontStr).slice(0, 2);
    const bh = lines.length * 34 + 26;
    const by = 1795 - bh;
    rrect(64, by, W - 128, bh, 22);
    ctx.fillStyle = 'rgba(8, 10, 24, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
    ctx.stroke();

    ctx.font = fontStr;
    ctx.fillStyle = '#fef9c3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((ln, idx) => {
      ctx.fillText(ln, W / 2, by + 28 + idx * 34);
    });
    ctx.restore();
  }

  // Thanh tiến trình 6 phần mảnh ở đỉnh video
  function drawTopProgress(t) {
    const p = clamp(t / totalDuration, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, 0, W, 7);
    const gg = ctx.createLinearGradient(0, 0, W, 0);
    gg.addColorStop(0, '#facc15');
    gg.addColorStop(0.5, '#38bdf8');
    gg.addColorStop(1, '#ec4899');
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, W * p, 7);
  }

  // ---------------- VẼ TỪNG PHÂN CẢNH BÁN HÀNG ----------------
  function renderSceneHook(t) {
    const lt = t - segHook.start;
    drawLuxuryBg(t, 'gold');

    const k1 = easeOutBack(lt / 0.45);
    ctx.save();
    ctx.translate(W / 2, 114);
    ctx.scale(k1, k1);
    drawPillBadge(0, -24, '🔥 XU HƯỚNG KIẾM TIỀN TIKTOK LIVE 24/7', 'rgba(239,68,68,0.22)', '#fb7185', '#ffe4e6', 23);
    ctx.restore();

    // Tiêu đề đánh trúng nỗi đau
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const a1 = easeOutCubic((lt - 0.1) / 0.4);
    ctx.globalAlpha = a1;
    ctx.font = '900 49px ' + FONT;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MUỐN TREO LIVE HÚT QUÀ', W / 2, 198 - (1 - a1) * 24);

    const a2 = easeOutCubic((lt - 0.25) / 0.4);
    ctx.globalAlpha = a2;
    const goldG = ctx.createLinearGradient(160, 0, 920, 0);
    goldG.addColorStop(0, '#fde047');
    goldG.addColorStop(0.5, '#fbbf24');
    goldG.addColorStop(1, '#f97316');
    ctx.fillStyle = goldG;
    ctx.font = '900 54px ' + FONT;
    ctx.fillText('& TĂNG FOLLOW TỰ ĐỘNG', W / 2, 266 - (1 - a2) * 24);

    const a3 = easeOutCubic((lt - 0.4) / 0.4);
    ctx.globalAlpha = a3;
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 42px ' + FONT;
    ctx.fillText('MÀ KHÔNG CẦN LỘ MẶT?', W / 2, 332 - (1 - a3) * 20);
    ctx.restore();

    // 3 thẻ lợi ích sắc gọn
    const pills = [
      ['❌ Không lộ mặt', '#fda4af', 'rgba(244,63,94,0.18)'],
      ['❌ Không ngồi nói', '#fda4af', 'rgba(244,63,94,0.18)'],
      ['✅ Tự chạy 24/7', '#86efac', 'rgba(34,197,94,0.20)']
    ];
    pills.forEach(([txt, col, bg], i) => {
      const pk = easeOutBack((lt - 0.5 - i * 0.1) / 0.35);
      if (pk <= 0) return;
      const px = 205 + i * 335;
      ctx.save();
      ctx.translate(px, 412);
      ctx.scale(pk, pk);
      rrect(-152, -24, 304, 48, 24);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, 0, 1);
      ctx.restore();
    });

    // Hai màn hình điện thoại Live thật chuyển động rực rỡ
    const pLeft = easeOutBack((lt - 0.35) / 0.55);
    drawPhoneMockup(clips.bar, 16, t, 68, 520, 446, 792, {
      rot: -0.055,
      scale: pLeft,
      border: '#ec4899',
      glow: 'rgba(236,72,153,0.45)',
      label: '🪩 Đi Bar Online'
    });

    const pRight = easeOutBack((lt - 0.5) / 0.55);
    drawPhoneMockup(clips.lopWord, 15, t, 466, 474, 548, 974, {
      rot: 0.035,
      scale: pRight,
      border: '#fde047',
      glow: 'rgba(250,204,21,0.52)',
      label: '📚 Lớp Học Chữ AI'
    });

    // Thẻ thông báo nổ quà & mắt xem nổi lên sống động (nằm gọn dưới 2 điện thoại, không đè nhãn)
    if (lt > 1.0) {
      const bk = easeOutBack((lt - 1.0) / 0.4);
      ctx.save();
      ctx.translate(W / 2, 1552);
      ctx.scale(bk, bk);
      rrect(-420, -52, 840, 104, 26);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#facc15';
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.font = '900 26px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👁 1.428 mắt xem trực tiếp  ·  🎁 Liên tục nổ quà & tăng Follow', 0, -15);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 21px ' + FONT;
      ctx.fillText('Khán giả tự bình luận chơi vui — Chủ kênh hoàn toàn thảnh thơi!', 0, 22);
      ctx.restore();
    }
  }

  function renderSceneIntro(t) {
    const lt = t - segIntro.start;
    drawLuxuryBg(t, 'gold');

    drawPillBadge(W / 2, 86, '✨ PHẦN MỀM PHÒNG LIVE TƯƠNG TÁC TẤT CẢ TRONG 1', 'rgba(56,189,248,0.16)', '#38bdf8', '#bae6fd', 22);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = '900 64px ' + FONT;
    ctx.fillText('STUDIOLIVE 5 TRONG 1', W / 2, 206);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 30px ' + FONT;
    ctx.fillText('Khán giả bình luận ➔ Hoá nhân vật ngay trên màn hình!', W / 2, 266);
    ctx.restore();

    // Lưới 5 chủ đề chạy động đồng thời (2 thẻ lớn hàng trên + 3 thẻ hàng dưới)
    const cards = [
      { clip: clips.lopWord, x: 64, y: 318, w: 462, h: 590, border: '#facc15', label: '📚 Lớp Học Chữ (HOT)' },
      { clip: clips.bar, x: 554, y: 318, w: 462, h: 590, border: '#ec4899', label: '🪩 Đi Bar Online' },
      { clip: clips.chua, x: 56, y: 940, w: 306, h: 470, border: '#f59e0b', label: '🪷 Đi Chùa' },
      { clip: clips.rap, x: 387, y: 940, w: 306, h: 470, border: '#38bdf8', label: '🎬 Rạp Phim' },
      { clip: clips.ma, x: 718, y: 940, w: 306, h: 470, border: '#a3e635', label: '👻 Nhà Ma' }
    ];

    cards.forEach((c, idx) => {
      const sc = easeOutBack((lt - 0.12 * idx) / 0.45);
      if (sc <= 0) return;
      drawPhoneMockup(c.clip, 15, t, c.x, c.y, c.w, c.h, {
        scale: sc,
        border: c.border,
        glow: 'rgba(15,23,42,0.65)',
        label: c.label
      });
    });

    // Thanh cơ chế sinh lời ở dưới
    if (lt > 0.5) {
      rrect(64, 1452, W - 128, 128, 26);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const steps = [
        ['💬 Gõ Bình Luận', 'Vào phòng ngay lập tức'],
        ['🧍 Hiện Avatar Thật', 'Giữ chân khán giả cực lâu'],
        ['🎁 Tặng Quà Đua Top', 'Tăng doanh thu tự động']
      ];
      steps.forEach(([h, s], i) => {
        const cx = 224 + i * 316;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        ctx.font = '800 24px ' + FONT;
        ctx.fillText(h, cx, 1498);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 18.5px ' + FONT;
        ctx.fillText(s, cx, 1534);
      });
    }
  }

  function renderSceneLop(t) {
    const lt = t - segLop.start;
    const inSecondHalf = t >= segLop.start + (segLop.end - segLop.start) * 0.52;
    const isCoGiaoSpeaking = t >= segLop.cgStart - 0.05 && t <= segLop.cgStart + segLop.cgDur + 0.2;
    drawLuxuryBg(t, 'warm');

    drawPillBadge(W / 2, 84, '👑 CHỦ ĐỀ HÚT VIEW & GIỮ CHÂN SỐ 1 HIỆN NAY', 'rgba(250,204,21,0.2)', '#fde047', '#fef08a', 22);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px ' + FONT;
    ctx.fillText('📚 LỚP HỌC CHỮ AI', W / 2, 198);
    ctx.fillStyle = '#fde68a';
    ctx.font = '700 27px ' + FONT;
    ctx.fillText('2.076 Câu Đố · Toán Nhẩm · Đố Mẹo · Tiếng Anh · Lịch Sử', W / 2, 252);
    ctx.restore();

    // Điện thoại lớn bên trái (nửa đầu: giải ô chữ + tặng hoa; nửa sau: giờ ra chơi chọn phe + đổi kiểu tóc)
    drawPhoneMockup(
      inSecondHalf ? clips.lopRecess : clips.lopWord,
      15,
      t,
      54,
      305,
      534,
      950,
      {
        border: '#fde047',
        glow: 'rgba(245,158,11,0.5)',
        label: inSecondHalf ? '⚖️ Giờ Ra Chơi Chọn Phe' : '👩‍🏫 Giải Đố & Tặng Hoa'
      }
    );

    // 4 thẻ tính năng đắt giá bên phải
    const feats = [
      ['👩‍🏫 Cô Giáo AI Dẫn Dắt', 'Tự đọc câu đố, hô "Bắt đầu!", chấm điểm & khen tên người giải nhanh nhất'],
      ['👑 Tranh 30 Ghế Bàn Dài', 'Ai cao điểm ngồi đầu bàn làm Lớp Trưởng, hiện Avatar tròn hoặc quay lưng'],
      ['💐 Tặng Quà Ôm Hoa Lên Bục', 'Nhân vật bước lên tặng hoa Cô Giáo, quà ≥30💎 mở chữ cứu cả lớp'],
      ['🎮 5 Trò Giờ Ra Chơi + Báo Cáo', 'Oẳn tù tì, Kiểm tra miệng, Chọn phe, Điểm danh, Lưu bảng vàng tuần']
    ];

    feats.forEach(([title, desc], idx) => {
      const fk = easeOutBack((lt - 0.25 - idx * 0.22) / 0.42);
      if (fk <= 0) return;
      const fx = 612, fy = 312 + idx * 236, fw = 418, fh = 216;
      ctx.save();
      ctx.translate(fx + fw / 2, fy + fh / 2);
      ctx.scale(fk, fk);
      rrect(-fw / 2, -fh / 2, fw, fh, 24);
      ctx.fillStyle = 'rgba(24, 16, 10, 0.90)';
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = idx === 0 ? '#facc15' : 'rgba(251,191,36,0.45)';
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '800 24px ' + FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(title, -fw / 2 + 22, -fh / 2 + 22);

      const dLines = wrapLines(desc, fw - 44, '600 20px ' + FONT).slice(0, 4);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '600 20px ' + FONT;
      dLines.forEach((ln, li) => {
        ctx.fillText(ln, -fw / 2 + 22, -fh / 2 + 64 + li * 30);
      });
      ctx.restore();
    });

    // Thanh sóng âm phát sáng khi Cô Giáo AI cất tiếng nói thật trong video!
    const boxY = 1300;
    rrect(54, boxY, W - 108, 152, 28);
    ctx.fillStyle = isCoGiaoSpeaking ? 'rgba(21, 128, 61, 0.92)' : 'rgba(20, 48, 36, 0.85)';
    ctx.fill();
    ctx.lineWidth = isCoGiaoSpeaking ? 3.5 : 2;
    ctx.strokeStyle = isCoGiaoSpeaking ? '#fde047' : '#4ade80';
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 23px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText(isCoGiaoSpeaking ? '🔊 ĐANG PHÁT GIỌNG THẬT CÔ GIÁO AI:' : '🎙️ TÍCH HỢP SẴN GIỌNG CÔ GIÁO AI TRUYỀN CẢM:', 84, boxY + 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 21.5px ' + FONT;
    ctx.fillText('“Cả lớp sẵn sàng chưa? Nhìn lên bảng giải đố nhé, bắt đầu!”', 84, boxY + 100);

    // Vẽ cột sóng âm động cân tâm dọc bên phải
    for (let b = 0; b < 11; b++) {
      const amp = isCoGiaoSpeaking ? (20 + Math.abs(Math.sin(t * 16 + b * 0.9)) * 56) : 14;
      const bx = W - 238 + b * 15;
      rrect(bx, boxY + 76 - amp / 2, 9, amp, 4.5);
      ctx.fillStyle = isCoGiaoSpeaking ? '#fde047' : 'rgba(255,255,255,0.35)';
      ctx.fill();
    }
  }

  function renderSceneBarChua(t) {
    const lt = t - segBarChua.start;
    const half = (segBarChua.end - segBarChua.start) * 0.5;
    const isChua = lt >= half;

    if (!isChua) {
      // Nửa 1: ĐI BAR ONLINE
      drawLuxuryBg(t, 'cyber');
      drawPillBadge(W / 2, 84, '🌙 KHUNG GIỜ TỐI & ĐÊM — BÙNG NỔ QUÀ TẶNG', 'rgba(236,72,153,0.22)', '#f472b6', '#fce7f3', 22);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.font = '900 58px ' + FONT;
      ctx.fillText('🪩 ĐI BAR ONLINE', W / 2, 200);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '700 28px ' + FONT;
      ctx.fillText('Sàn nhảy Meme gắn Avatar thật · Quẩy xuyên đêm cực cuốn!', W / 2, 256);

      drawPhoneMockup(clips.bar, 17, t, 488, 310, 538, 956, {
        border: '#ec4899',
        glow: 'rgba(236,72,153,0.55)',
        label: '🪩 Sàn Bar Meme Sôi Động'
      });

      const barPts = [
        ['🎭 Meme Hoạt Hình Nổi Tiếng', 'Bình luận là vào sàn nhảy ngay, gắn Avatar tròn trên đầu nhân vật'],
        ['🎆 Pháo Hoa & Sân Khấu Chính', 'Gõ cú pháp lên bục VIP, đi bão, ghép đôi nam nữ, zoom cận cảnh'],
        ['🎵 Nhạc Remix Tuỳ Ý Chủ Kênh', 'Dán link YouTube hoặc MP3 bất kỳ để làm nhạc sàn theo gu riêng']
      ];
      barPts.forEach(([h, d], i) => {
        const sc = easeOutBack((lt - 0.15 - i * 0.18) / 0.4);
        if (sc <= 0) return;
        const x = 52, y = 340 + i * 295, w = 412, bh = 265;
        ctx.save();
        ctx.translate(x + w / 2, y + bh / 2);
        ctx.scale(sc, sc);
        rrect(-w / 2, -bh / 2, w, bh, 24);
        ctx.fillStyle = 'rgba(24, 10, 44, 0.90)';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#ec4899';
        ctx.stroke();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const hLines = wrapLines(h, w - 40, '800 25px ' + FONT);
        ctx.fillStyle = '#fde047';
        ctx.font = '800 25px ' + FONT;
        hLines.forEach((ln, li) => ctx.fillText(ln, -w / 2 + 20, -bh / 2 + 22 + li * 32));

        const dLines = wrapLines(d, w - 40, '600 21px ' + FONT);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 21px ' + FONT;
        dLines.forEach((ln, li) => ctx.fillText(ln, -w / 2 + 20, -bh / 2 + 32 + hLines.length * 32 + li * 31));
        ctx.restore();
      });
    } else {
      // Nửa 2: ĐI CHÙA ONLINE
      const ct = lt - half;
      drawLuxuryBg(t, 'warm');
      drawPillBadge(W / 2, 84, '☀️ KHUNG GIỜ SÁNG & TRƯA — GIỮ CHÂN KHÁN GIẢ HÀNG GIỜ', 'rgba(245,158,11,0.22)', '#fbbf24', '#fef3c7', 21);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.font = '900 58px ' + FONT;
      ctx.fillText('🪷 ĐI CHÙA ONLINE', W / 2, 200);
      ctx.fillStyle = '#fed7aa';
      ctx.font = '700 28px ' + FONT;
      ctx.fillText('Không gian thanh tịnh · Dâng hương, thỉnh chuông & cầu bình an', W / 2, 256);

      drawPhoneMockup(clips.chua, 15, t, 54, 310, 538, 956, {
        border: '#f59e0b',
        glow: 'rgba(245,158,11,0.52)',
        label: '🪷 Chánh Điện Bình An'
      });

      const chuaPts = [
        ['🙏 Hoá Phật Tử Thành Tâm', 'Khách vào phòng tự chọn hình tượng nam, nữ, sư thầy, chú tiểu'],
        ['🔔 Hiệu Ứng Theo Bình Luận', 'Gõ từ khoá thỉnh chuông đồng, gõ mõ, dâng hương, nở hoa sen vàng'],
        ['📜 Mở Sớ Cầu An Tự Động', 'Hiển thị lời ước nguyện lên màn hình kèm giọng đọc chúc phúc ấm áp']
      ];
      chuaPts.forEach(([h, d], i) => {
        const sc = easeOutBack((ct - 0.12 - i * 0.18) / 0.4);
        if (sc <= 0) return;
        const x = 616, y = 340 + i * 295, w = 412, bh = 265;
        ctx.save();
        ctx.translate(x + w / 2, y + bh / 2);
        ctx.scale(sc, sc);
        rrect(-w / 2, -bh / 2, w, bh, 24);
        ctx.fillStyle = 'rgba(32, 18, 8, 0.92)';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const hLines = wrapLines(h, w - 40, '800 25px ' + FONT);
        ctx.fillStyle = '#fde047';
        ctx.font = '800 25px ' + FONT;
        hLines.forEach((ln, li) => ctx.fillText(ln, -w / 2 + 20, -bh / 2 + 22 + li * 32));

        const dLines = wrapLines(d, w - 40, '600 21px ' + FONT);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 21px ' + FONT;
        dLines.forEach((ln, li) => ctx.fillText(ln, -w / 2 + 20, -bh / 2 + 32 + hLines.length * 32 + li * 31));
        ctx.restore();
      });
    }
  }

  function renderSceneEasy(t) {
    const lt = t - segEasy.start;
    drawLuxuryBg(t, 'gold');

    drawPillBadge(W / 2, 84, '⚡ AI CŨNG DÙNG ĐƯỢC — KHÔNG CẦN BIẾT LẬP TRÌNH', 'rgba(34,197,94,0.2)', '#4ade80', '#dcfce7', 22);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 50px ' + FONT;
    ctx.fillText('CÀI ĐẶT 1 PHÚT · LÊN SÓNG NGAY', W / 2, 194);
    ctx.fillStyle = '#fde047';
    ctx.font = '700 27px ' + FONT;
    ctx.fillText('Tương thích 100% TikTok LIVE Studio & OBS (Không cần Stream Key!)', W / 2, 248);

    // Khung giao diện phần mềm StudioLive Desktop thật
    if (dashImg) {
      const dk = easeOutBack(lt / 0.5);
      const dx = 54, dy = 292, dw = 972, dh = 608;
      ctx.save();
      ctx.translate(dx + dw / 2, dy + dh / 2);
      ctx.scale(dk, dk);
      ctx.shadowColor = 'rgba(56,189,248,0.42)';
      ctx.shadowBlur = 32;
      rrect(-dw / 2 - 6, -dh / 2 - 36, dw + 12, dh + 44, 22);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 3 nút cửa sổ máy tính
      [['#ef4444', -dw / 2 + 22], ['#f59e0b', -dw / 2 + 44], ['#22c55e', -dw / 2 + 66]].forEach(([c, cx]) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(cx, -dh / 2 - 16, 6.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 16px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillText('Phần mềm quản lý StudioLive Pro — Tiếng Việt 100%', 0, -dh / 2 - 15);

      ctx.save();
      rrect(-dw / 2, -dh / 2, dw, dh, 14);
      ctx.clip();
      ctx.drawImage(dashImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
      ctx.restore();
    }

    // 2 phòng tặng kèm bên dưới: Rạp Phim Online & Live Ma Online + Quy trình 3 bước
    drawPhoneMockup(clips.rap, 14, t, 64, 938, 286, 488, {
      border: '#38bdf8',
      label: '🎬 Rạp Phim'
    });
    drawPhoneMockup(clips.ma, 14, t, 376, 938, 286, 488, {
      border: '#a3e635',
      label: '👻 Nhà Ma'
    });

    // Thẻ 3 bước siêu dễ bên phải
    const sx = 688, sy = 938, sw = 338, sh = 488;
    rrect(sx, sy, sw, sh, 26);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 25px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('🚀 3 BƯỚC LÊN LIVE', sx + sw / 2, sy + 44);

    const steps3 = [
      ['1. Chọn chủ đề Live', 'Đổi qua lại 5 phòng chỉ 1 cú nhấp chuột'],
      ['2. Dán Link nguồn', 'Thêm vào TikTok LIVE Studio hoặc OBS'],
      ['3. Nhập @Username', 'Tự bắt bình luận, tim & quà tức thì!']
    ];
    steps3.forEach(([st, sd], idx) => {
      const yy = sy + 92 + idx * 126;
      rrect(sx + 18, yy, sw - 36, 108, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#86efac';
      ctx.font = '800 21px ' + FONT;
      ctx.fillText(st, sx + 32, yy + 32);
      const lines = wrapLines(sd, sw - 64, '600 17.5px ' + FONT);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 17.5px ' + FONT;
      lines.forEach((ln, li) => ctx.fillText(ln, sx + 32, yy + 62 + li * 23));
    });
  }

  function renderSceneCta(t) {
    const lt = t - segCta.start;
    drawLuxuryBg(t, 'gold');

    drawPillBadge(W / 2, 86, '🏆 BỘ CÔNG CỤ PHÒNG LIVE TƯƠNG TÁC ĐẦY ĐỦ NHẤT', 'rgba(250,204,21,0.22)', '#fde047', '#fef9c3', 22);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px ' + FONT;
    ctx.fillText('SỞ HỮU NGAY STUDIOLIVE', W / 2, 198);

    const gTitle = ctx.createLinearGradient(120, 0, 960, 0);
    gTitle.addColorStop(0, '#fde047');
    gTitle.addColorStop(0.5, '#fbbf24');
    gTitle.addColorStop(1, '#38bdf8');
    ctx.fillStyle = gTitle;
    ctx.font = '900 44px ' + FONT;
    ctx.fillText('BẬT MÁY LÀ CÓ PHÒNG LIVE ĐÔNG KHÁCH!', W / 2, 262);

    // Dàn 5 màn hình điện thoại xếp cánh quạt toả sáng
    const fan = [
      { c: clips.ma, x: 46, y: 348, w: 230, h: 408, r: -0.09, b: '#a3e635' },
      { c: clips.chua, x: 205, y: 326, w: 248, h: 440, r: -0.045, b: '#f59e0b' },
      { c: clips.rap, x: 627, y: 326, w: 248, h: 440, r: 0.045, b: '#38bdf8' },
      { c: clips.bar, x: 798, y: 348, w: 230, h: 408, r: 0.09, b: '#ec4899' },
      { c: clips.lopWord, x: 396, y: 300, w: 288, h: 512, r: 0, b: '#fde047' }
    ];
    fan.forEach((f, idx) => {
      const fk = easeOutBack((lt - idx * 0.06) / 0.45);
      drawPhoneMockup(f.c, 15, t, f.x, f.y, f.w, f.h, {
        rot: f.r,
        scale: fk,
        border: f.b,
        liveBadge: idx === 4
      });
    });

    // Bảng quyền lợi bàn giao trọn gói
    const vx = 64, vy = 856, vw = W - 128, vh = 540;
    rrect(vx, vy, vw, vh, 32);
    ctx.fillStyle = 'rgba(12, 16, 36, 0.93)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 30px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('🎁 QUYỀN LỢI KHI NHẬN BẢN QUYỀN STUDIOLIVE', W / 2, vy + 54);

    const perks = [
      '✅ Trọn bộ 5 chủ đề hot: Lớp Học Chữ · Đi Bar · Đi Chùa · Rạp Phim · Nhà Ma',
      '✅ Tích hợp sẵn giọng đọc AI tiếng Việt & tiếng Anh tự động 100%',
      '✅ Thoải mái đổi tên phòng, thêm câu đố riêng & chèn nhạc nền theo ý',
      '✅ Chạy mượt với TikTok LIVE Studio & OBS — Không cần lộ mặt',
      '✅ Hỗ trợ cài đặt từ xa A–Z · Mua 1 lần khai thác lâu dài mỗi ngày!'
    ];
    ctx.textAlign = 'left';
    perks.forEach((pk, idx) => {
      const py = vy + 118 + idx * 82;
      rrect(vx + 28, py - 28, vw - 56, 66, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 23.5px ' + FONT;
      ctx.fillText(pk, vx + 48, py + 12);
    });

    // Nút Kêu Gọi Hành Động (CTA) đập nhịp vàng kim rực rỡ
    const pulse = 1 + Math.sin(t * 6.5) * 0.026;
    ctx.save();
    ctx.translate(W / 2, 1528);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = 'rgba(250, 204, 21, 0.65)';
    ctx.shadowBlur = 36;
    rrect(-476, -82, 952, 164, 82);
    const btnG = ctx.createLinearGradient(-476, -82, 476, 82);
    btnG.addColorStop(0, '#fde047');
    btnG.addColorStop(0.5, '#f59e0b');
    btnG.addColorStop(1, '#ea580c');
    ctx.fillStyle = btnG;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#1c0a00';
    ctx.font = '900 35px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📩 NHẮN TIN NGAY ĐỂ NHẬN DEMO & ƯU ĐÃI!', 0, -16);
    ctx.fillStyle = '#3b1104';
    ctx.font = '800 23px ' + FONT;
    ctx.fillText(payload.contactLine, 0, 34);
    ctx.restore();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 22px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Số lượng suất hỗ trợ cài đặt ưu đãi trong tuần có hạn — Inbox ngay!', W / 2, 1682);
  }

  function renderAt(t) {
    ctx.clearRect(0, 0, W, H);
    if (t < segHook.end) renderSceneHook(t);
    else if (t < segIntro.end) renderSceneIntro(t);
    else if (t < segLop.end) renderSceneLop(t);
    else if (t < segBarChua.end) renderSceneBarChua(t);
    else if (t < segEasy.end) renderSceneEasy(t);
    else renderSceneCta(t);

    if (t < segCta.start) drawVoiceCaption(t);
    drawTopProgress(t);
  }

  // ---------------- Ghi hình H.264 + AAC 30 FPS bằng MediaRecorder ----------------
  const videoStream = canvas.captureStream(30);
  const combined = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  const mime = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus'
  ].find((m) => MediaRecorder.isTypeSupported(m));

  const chunks = [];
  const recorder = new MediaRecorder(combined, {
    mimeType: mime,
    videoBitsPerSecond: 3800000,
    audioBitsPerSecond: 192000
  });
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const keyframes = {};
  const kfTargets = [
    ['01_hook', segHook.start + 2.2],
    ['02_intro', segIntro.start + 2.0],
    ['03_lop', segLop.cgStart + 0.6],
    ['04_bar', segBarChua.start + 2.0],
    ['05_chua', segBarChua.start + (segBarChua.end - segBarChua.start) * 0.72],
    ['06_easy', segEasy.start + 2.2],
    ['07_cta', segCta.start + 2.2]
  ];

  const donePromise = new Promise((resolve) => {
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mime });
      const ab = await blob.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      const step = 32768;
      for (let i = 0; i < bytes.length; i += step) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
      }
      resolve({
        base64: btoa(bin),
        mime,
        durationMs: Math.round(totalDuration * 1000),
        keyframes
      });
    };
  });

  renderAt(0);
  recorder.start(250);

  const wallStart = performance.now();
  const interval = setInterval(() => {
    const elapsed = (performance.now() - wallStart) / 1000;
    renderAt(Math.min(totalDuration, elapsed));

    for (const [kName, kTime] of kfTargets) {
      if (!keyframes[kName] && elapsed >= kTime) {
        keyframes[kName] = canvas.toDataURL('image/jpeg', 0.88);
      }
    }

    if (elapsed >= totalDuration) {
      clearInterval(interval);
      recorder.stop();
    }
  }, 1000 / 30);

  return await donePromise;
};
</script>
</body>
</html>`;
}

// ---------------- Quy trình chính ----------------
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.whenReady().then(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studiolive-promo-'));
  try {
    const voices = await buildVoiceAssets();
    const footage = await captureProductFootage(tmpDir);

    console.log('[3/4] Đang dựng Motion Graphics 1080×1920 (30 FPS) + hoà âm nhạc nền & giọng AI...');
    const htmlPath = path.join(tmpDir, 'composer.html');
    fs.writeFileSync(htmlPath, buildComposerHtml(), 'utf8');

    const compWin = new BrowserWindow({
      width: 1080,
      height: 1920,
      show: false,
      useContentSize: true,
      webPreferences: { offscreen: true, backgroundThrottling: false }
    });
    compWin.webContents.setFrameRate(30);
    await compWin.loadFile(htmlPath);

    const payloadJson = JSON.stringify({
      voices,
      footage,
      contactLine: CONTACT_LINE
    });
    const result = await compWin.webContents.executeJavaScript(`window.runPromoComposer(${payloadJson})`);
    await compWin.close();

    console.log('[4/4] Đang đóng gói chuẩn MP4 (H.264 + AAC) & kiểm tra chất lượng...');
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    const rawBuf = Buffer.from(result.base64, 'base64');
    const finalBuf = result.mime.includes('mp4')
      ? patchMp4Duration(rawBuf, result.durationMs)
      : rawBuf;
    fs.writeFileSync(OUT_FILE, finalBuf);

    if (KEYFRAMES_DIR) {
      fs.mkdirSync(KEYFRAMES_DIR, { recursive: true });
      for (const [k, dataUri] of Object.entries(result.keyframes || {})) {
        const b64 = dataUri.split(',')[1];
        if (b64) fs.writeFileSync(path.join(KEYFRAMES_DIR, `${k}.jpg`), Buffer.from(b64, 'base64'));
      }
    }

    console.log(JSON.stringify({
      ok: true,
      outFile: OUT_FILE,
      mime: result.mime,
      durationSec: +(result.durationMs / 1000).toFixed(2),
      sizeMB: +(finalBuf.length / (1024 * 1024)).toFixed(2),
      keyframes: Object.keys(result.keyframes || {})
    }, null, 2));
  } catch (err) {
    console.error('PROMO_ERROR:', err);
    process.exitCode = 1;
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    app.quit();
  }
});
