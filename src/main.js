'use strict';
const path = require('path');
const { app, BrowserWindow, ipcMain, shell, dialog, clipboard, nativeTheme, screen } = require('electron');
const { Settings } = require('./settings');
const { LiveService, friendlyError } = require('./live');
const { OverlayServer } = require('./server');

app.setName('StudioLive');
// Cho phép phát âm thanh hiệu ứng mà không cần bấm vào trang trước + giữ chuẩn màu sRGB sắc nét
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('force-color-profile', 'srgb');
nativeTheme.themeSource = 'dark';

let win = null;
let settings;
const live = new LiveService();
let paused = false;
async function connectLive(username) {
  const s = settings.update({ username: String(username || '') });
  try {
    await live.start(s.username, { autoReconnect: s.autoReconnect });
    return { ok: true };
  } catch (e) {
    const message = friendlyError(e);
    live.setStatus('error', message);
    return { ok: false, message };
  }
}

const overlay = new OverlayServer({
  getConfig: () => settings.get(),
  getSnapshot: () => live.snapshot(),
  getPaused: () => paused,
  getDataDir: () => app.getPath('userData')
});

let serverState = { running: false, port: 0, error: '', clients: 0, liveViewport: null };
let outWin = null;

// Cửa sổ "màn hình phát live": tự mở ở độ phân giải dọc 9:16 cao nhất vừa màn hình (bấm F11 để toàn màn hình)
function openOutputWindow() {
  if (outWin && !outWin.isDestroyed()) {
    outWin.show();
    outWin.focus();
    return;
  }
  const wa = screen.getPrimaryDisplay()?.workAreaSize || { width: 1920, height: 1040 };
  const targetH = Math.max(640, Math.min(1920, wa.height - 36));
  const targetW = Math.round(targetH * (9 / 16));
  outWin = new BrowserWindow({
    width: targetW,
    height: targetH,
    useContentSize: true,
    minWidth: 360,
    minHeight: 640,
    title: 'StudioLive - Man hinh phat live',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, backgroundThrottling: false }
  });
  outWin.setAspectRatio(9 / 16);
  outWin.webContents.on('before-input-event', (_e, inp) => {
    if (inp.type === 'keyDown' && inp.key === 'F11') outWin.setFullScreen(!outWin.isFullScreen());
  });
  outWin.on('page-title-updated', (e) => e.preventDefault());
  outWin.loadURL(`http://127.0.0.1:${serverState.port}/?output`);
  outWin.on('closed', () => {
    outWin = null;
    send('output:state', { open: false });
  });
  send('output:state', { open: true });
}

const send = (channel, payload) => {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
};

// ---- Chuyển tiếp sự kiện live -> dashboard + overlay ----
live.on('status', (s) => {
  send('live:status', s);
  overlay.broadcast('liveStatus', s);
});
live.on('stats', (s) => {
  send('live:stats', s);
  overlay.broadcast('stats', s);
});
live.on('event', (e) => {
  send('live:event', e);
  overlay.broadcast('live', e);
});
overlay.onClients = (n, liveViewport) => {
  serverState.clients = n;
  serverState.liveViewport = liveViewport || null;
  send('server:state', serverState);
};
overlay.onLopState = (st) => {
  send('lop:state', st);
};

async function startServer(port) {
  try {
    await overlay.start(port);
    serverState = { running: true, port, error: '', clients: 0 };
  } catch (e) {
    serverState = {
      running: false, port, clients: 0,
      error: e.code === 'EADDRINUSE' ? `Cổng ${port} đang bị ứng dụng khác dùng. Đổi cổng trong Cài đặt.` : e.message
    };
  }
  send('server:state', serverState);
  if (outWin && !outWin.isDestroyed() && serverState.running) outWin.loadURL(`http://127.0.0.1:${port}/?output`);
  return serverState;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0b0d10',
    title: 'StudioLive',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'darwin' ? false : { color: '#0b0d10', symbolColor: '#9ca3af', height: 40 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  win.once('ready-to-show', () => { if (!process.env.STUDIO_SELFTEST) win.show(); });
  if (process.env.STUDIO_SELFTEST) selfTest();

  // Link ngoài mở bằng trình duyệt mặc định
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

// ---- IPC ----
ipcMain.handle('app:init', () => ({
  settings: settings.get(),
  server: serverState,
  live: live.snapshot(),
  lopState: overlay.lastLopState,
  paused,
  platform: process.platform,
  version: app.getVersion()
}));

ipcMain.handle('settings:update', async (_e, patch) => {
  const before = settings.get();
  const next = settings.update(patch || {});
  overlay.broadcast('config', next.overlay);
  if (next.overlay.mode !== before.overlay.mode) {
    // đổi chế độ: mọi trang đang hiện cảnh (LIVE Studio, OBS, xem trước) tải lại để sang cảnh mới
    overlay.broadcast('reload');
  }
  if (next.port !== before.port) await startServer(next.port);
  return { settings: next, server: serverState };
});

ipcMain.handle('live:connect', (_e, username) => connectLive(username));

ipcMain.handle('live:disconnect', async () => {
  await live.stop();
  return { ok: true };
});

ipcMain.handle('overlay:test', (_e, payload) => {
  if (payload && typeof payload === 'object' && payload.type === 'phrase') {
    const demo = demoPhraseEvent(String(payload.text || ''));
    if (demo) {
      const tagged = { ...demo, test: true };
      overlay.broadcast('live', tagged);
      send('live:event', tagged);
    }
    return true;
  }
  const type = String(payload || '');
  if (['round', 'thunder', 'jumpscare', 'peek', 'howto'].includes(type)) {
    overlay.broadcast('game', type);
    return true;
  }
  const demo = demoEvent(type);
  if (demo) {
    const tagged = { ...demo, test: true };
    overlay.broadcast('live', tagged);
    send('live:event', tagged);
  }
  return true;
});

ipcMain.handle('overlay:pause', (_e, p) => {
  paused = typeof p === 'boolean' ? p : !paused;
  overlay.broadcast('pause', paused);
  send('pause:state', paused);
  return paused;
});

// Lệnh điều khiển cảnh Rạp Phim: chiếu / dừng / chuyển phim, vỗ tay, mưa bắp, đọc ngay…
ipcMain.handle('rap:command', (_e, c) => {
  const actions = ['play', 'pause', 'next', 'prev', 'index', 'speak', 'clap', 'rain', 'share', 'reset', 'testLikes'];
  if (!c || !actions.includes(c.action)) return false;
  if (c.action === 'index') settings.update({ overlay: { rapIndex: Number(c.n) || 0 } });
  overlay.broadcast('rap', { action: c.action, text: typeof c.text === 'string' ? c.text.slice(0, 400) : undefined, n: Number(c.n) || 0 });
  return true;
});

ipcMain.handle('dialog:pickVideos', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Chọn phim để chiếu',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Video', extensions: ['mp4', 'webm', 'mov', 'm4v'] }]
  });
  return r.canceled ? [] : r.filePaths;
});

// Lệnh điều khiển cảnh Chùa
ipcMain.handle('chua:command', (_e, c) => {
  const actions = ['speak', 'bell', 'mo', 'incense', 'lotus', 'share', 'rain', 'reset', 'testLikes'];
  if (!c || !actions.includes(c.action)) return false;
  overlay.broadcast('chua', { action: c.action, text: typeof c.text === 'string' ? c.text.slice(0, 400) : undefined, n: Number(c.n) || undefined });
  return true;
});

// Lệnh điều khiển cảnh Đi Bar Online
ipcMain.handle('bar:command', (_e, c) => {
  const actions = [
    'speak', 'center', 'fireworks', 'drop', 'co2', 'laser', 'couple', 'parade', 'cheers', 'rain', 'reset', 'clear', 'testLikes',
    'playMusic', 'pauseMusic', 'nextMusic', 'prevMusic', 'musicIndex'
  ];
  if (!c || !actions.includes(c.action)) return false;
  if (c.action === 'musicIndex') settings.update({ overlay: { barMusicIndex: Number(c.n) || 0, barSoundscape: 'custom' } });
  overlay.broadcast('bar', { action: c.action, text: typeof c.text === 'string' ? c.text.slice(0, 400) : undefined, n: Number(c.n) || 0 });
  return true;
});

// Lệnh điều khiển cảnh Lớp Học Chữ
ipcMain.handle('lop:command', (_e, c) => {
  const actions = [
    'skip', 'newRound', 'ban', 'birthday', 'recessGame', 'flood',
    'nextQuestion', 'hint', 'reveal', 'recess', 'speak', 'resetScores', 'clearClass', 'fillDemo', 'answerCorrect', 'testLikes',
    'playMusic', 'pauseMusic', 'nextMusic', 'prevMusic', 'musicIndex'
  ];
  if (!c || !actions.includes(c.action)) return false;
  if (c.action === 'musicIndex') settings.update({ overlay: { lopMusicIndex: Number(c.n) || 0, lopSoundscape: 'custom' } });
  overlay.broadcast('lop', {
    action: c.action,
    text: typeof c.text === 'string' ? c.text.slice(0, 400) : undefined,
    game: typeof c.game === 'string' ? c.game.slice(0, 30) : undefined,
    n: Number(c.n) || 0
  });
  return true;
});

ipcMain.handle('dialog:pickMusicFiles', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Chọn nhạc MP3 / MV cho Đi Bar Online',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Nhạc & Video', extensions: ['mp3', 'm4a', 'wav', 'ogg', 'mp4', 'webm', 'mov'] }]
  });
  return r.canceled ? [] : r.filePaths;
});

ipcMain.handle('overlay:reload', () => {
  overlay.broadcast('reload');
  return true;
});

ipcMain.handle('server:restart', () => startServer(settings.get().port));

ipcMain.handle('dialog:pickSound', async (_e, kind) => {
  const media = kind === 'media';
  const r = await dialog.showOpenDialog(win, {
    title: media ? 'Chọn ảnh / video jumpscare' : 'Chọn file âm thanh',
    properties: ['openFile'],
    filters: media
      ? [{ name: 'Ảnh hoặc video', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov'] }]
      : [{ name: 'Âm thanh', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }]
  });
  return r.canceled ? '' : r.filePaths[0];
});

ipcMain.handle('output:open', () => {
  openOutputWindow();
  return true;
});

ipcMain.handle('tiktok:login', () => {
  require('./direct').openLoginWindow(win);
  return true;
});

ipcMain.handle('tiktok:logout', async () => {
  await require('./direct').logoutTikTok();
  return true;
});

ipcMain.handle('util:copy', (_e, text) => {
  clipboard.writeText(String(text));
  return true;
});

ipcMain.handle('util:openExternal', (_e, url) => {
  if (/^https?:\/\//.test(url)) shell.openExternal(url);
  return true;
});

// ---- Dữ liệu thử nghiệm ----
const DEMO_NAMES = ['Hồn Ma Áo Trắng', 'Bé Ma Lém Lỉnh', 'Thầy Pháp Tập Sự', 'Cô Hồn Dạ Khúc', 'Quỷ Nhỏ 2k7', 'Ma Da Sông Hàn'];
const DEMO_CHATS = ['Ghê quá streamer ơi 😱', 'Sau lưng anh có gì kìa!!!', 'Tắt đèn đi chơi mới vui', 'Ai đang xem một mình giơ tay 🙋', 'Nghe tiếng chuông rợn người', 'Cho em xin lá bùa với'];
const DEMO_GIFTS = [
  { giftName: 'Hoa Hồng', diamonds: 1, repeatCount: 5 },
  { giftName: 'Kẹo Bông', diamonds: 5, repeatCount: 1 },
  { giftName: 'Mũ Phù Thuỷ', diamonds: 99, repeatCount: 1 },
  { giftName: 'Lâu Đài Ma', diamonds: 299, repeatCount: 2 }
];

const CHUA_NAMES = [
  'Minh Tâm', 'An Nhiên', 'Phúc Lộc', 'Thanh Hà', 'Bảo Ngọc', 'Đức Anh',
  'Diệu Hiền', 'Gia Bảo', 'Tường Vy', 'Thiện Nhân', 'Hoàng Nam', 'Thu Thảo',
  'Quốc Khánh', 'Ngọc Hân', 'Minh Khôi', 'Phương Thảo', 'Hữu Phước', 'Khánh Linh'
];
const CHUA_CHATS = [
  'Nam mô A Di Đà Phật 🙏',
  'Chánh điện thanh tịnh quá, chúc cả nhà bình an ạ',
  'Hoa sen vàng đẹp quá 🪷',
  'Thỉnh chuông cầu an cho cả nhà 🔔'
];
const CHUA_WISHES = [
  'Con cầu sức khỏe và bình an cho cha mẹ hai bên',
  'Nam mô A Di Đà Phật, cầu cho gia đình luôn thuận hòa êm ấm',
  'Cầu cho kỳ thi sắp tới đỗ đạt như ý',
  'Mong công việc hanh thông, mọi điều tốt lành đến với cả nhà',
  'Cầu bình an, sớm buông bỏ mọi lo âu muộn phiền'
];
const CHUA_GIFTS = [
  { giftName: 'Hoa Sen Hồng', diamonds: 1, repeatCount: 5 },
  { giftName: 'Đèn Hoa Đăng', diamonds: 15, repeatCount: 1 },
  { giftName: 'Hoa Sen Vàng', diamonds: 99, repeatCount: 1 },
  { giftName: 'Đại Hồng Chung', diamonds: 299, repeatCount: 1 }
];
const CHUA_SKINS = ['sư thầy', 'ni cô', 'chú tiểu', 'nữ', 'bà', 'nam'];

const BAR_NAMES = [
  'Hoàng Cường', 'MrBen', 'Tuấn Nhật', 'Khánh Châu', 'Thần Tiên Tỷ Tỷ', 'Gấu Misa',
  'Trịnh Vinh', 'Phan Hiếu', 'Nobita', 'Võ Khang', 'Hồng Thắm', 'Boy Phố 2k',
  'Cáo Nhỏ', 'Ken Nguyễn', 'Bích Phương', 'Minh Triết', 'Linh Ka', 'Đạt Villa'
];
const BAR_CHATS = [
  'Cho mình vào sàn quẩy với anh em ơi 🔥',
  'Nhạc căng đét DJ ơi 🪩',
  'Chào cả sàn nha, tối nay vui quá ✨',
  'Meme trên sàn nhìn cưng xỉu 😂'
];
const BAR_GIFTS = [
  { giftName: 'Kem Ốc Quế', diamonds: 1, repeatCount: 1 },
  { giftName: 'Hoa Hồng Neon', diamonds: 5, repeatCount: 3 },
  { giftName: 'Kính Râm VIP', diamonds: 99, repeatCount: 1 },
  { giftName: 'Siêu Xe Vào Sàn', diamonds: 299, repeatCount: 1 }
];

const LOP_NAMES = [
  'Mii anime', 'Thảooo', 'Ngocc', 'bao ngoc=))', 'Baby✨', 'con heo biết nói',
  'Khánh Linh', 'Gia Bảo', 'Tuấn Kiệt', 'Phương Nhi', 'Minh Anh', 'Cẩm Tú',
  'Hải Đăng', 'Tường Vy', 'Nhật Minh', 'Bích Ngọc', 'Quốc Huy', 'Thỏ Con Đi Học'
];
const LOP_CHATS = [
  'Em chào cô ạ 🙋',
  'Cho em vào lớp ngồi học với ạ 🎒',
  'Hôm nay lớp đông vui quá ✨',
  'Có mặt điểm danh cô ơi!'
];
const LOP_WRONGS = ['Kỹ sư', 'Bánh tráng', 'Bác sĩ', 'Mùa xuân', 'Cầu vồng', 'Học sinh giỏi'];
const LOP_GIFTS = [
  { giftName: 'Bút Mực Điểm 10', diamonds: 1, repeatCount: 3 },
  { giftName: 'Hoa Điểm Mười', diamonds: 10, repeatCount: 2 },
  { giftName: 'Học Bổng Xuất Sắc', diamonds: 99, repeatCount: 1 },
  { giftName: 'Cúp Vàng Thủ Khoa', diamonds: 299, repeatCount: 1 }
];

let demoSkinIdx = 0;
let demoJoinSeq = 0;
let demoBarChatSeq = 0;
let demoLopChatSeq = 0;
const demoActiveBarUsers = [];
const demoActiveLopUsers = [];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeDemoAvatar(seed) {
  const palettes = [
    ['#ec4899', '#6366f1', '#1e1b4b'],
    ['#06b6d4', '#3b82f6', '#172554'],
    ['#f59e0b', '#ef4444', '#450a0a'],
    ['#a855f7', '#ec4899', '#3b0764'],
    ['#10b981', '#06b6d4', '#064e3b'],
    ['#f43f5e', '#fbbf24', '#4c0519']
  ];
  const [c1, c2, hair] = palettes[Math.abs(Number(seed) || 0) % palettes.length];
  const shades = (Number(seed) || 0) % 2 === 0
    ? '<rect x="27" y="40" width="17" height="10" rx="3" fill="#090d16"/><rect x="46" y="40" width="17" height="10" rx="3" fill="#090d16"/><line x1="44" y1="45" x2="46" y2="45" stroke="#fde047" stroke-width="2"/>'
    : '<circle cx="36" cy="45" r="4" fill="#1e1b4b"/><circle cx="54" cy="45" r="4" fill="#1e1b4b"/><circle cx="37.5" cy="43.5" r="1.4" fill="#fff"/><circle cx="55.5" cy="43.5" r="1.4" fill="#fff"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="90" height="90" fill="url(#g)"/><circle cx="45" cy="92" r="30" fill="${hair}"/><circle cx="45" cy="46" r="22" fill="#fde68a"/><path d="M23 43 C24 21, 66 21, 67 43 C60 33, 30 33, 23 43 Z" fill="${hair}"/><circle cx="30" cy="52" r="3.5" fill="#fb7185" opacity=".65"/><circle cx="60" cy="52" r="3.5" fill="#fb7185" opacity=".65"/>${shades}<path d="M38 56 Q45 63 52 56" fill="none" stroke="#be123c" stroke-width="3" stroke-linecap="round"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function rememberDemoBarUser(user) {
  if (!user || !user.id) return;
  const i = demoActiveBarUsers.findIndex((u) => u.id === user.id);
  if (i >= 0) demoActiveBarUsers.splice(i, 1);
  demoActiveBarUsers.push(user);
  if (demoActiveBarUsers.length > 60) demoActiveBarUsers.shift();
}

function rememberDemoLopUser(user) {
  if (!user || !user.id) return;
  const i = demoActiveLopUsers.findIndex((u) => u.id === user.id);
  if (i >= 0) demoActiveLopUsers.splice(i, 1);
  demoActiveLopUsers.push(user);
  if (demoActiveLopUsers.length > 60) demoActiveLopUsers.shift();
}

function demoPhraseEvent(text) {
  const clean = String(text || '').trim().slice(0, 180);
  if (!clean) return null;
  const mode = settings ? settings.get().overlay.mode : 'game';
  const pool = mode === 'lop' ? LOP_NAMES : mode === 'bar' ? BAR_NAMES : mode === 'chua' ? CHUA_NAMES : DEMO_NAMES;
  const prefix = mode === 'lop' ? 'lop-' : mode === 'bar' ? 'bar-' : mode === 'chua' ? 'chua-' : 'demo-';
  const nickname = rand(pool);
  const idx = pool.indexOf(nickname);
  const user = { id: prefix + nickname, uniqueId: prefix + idx, nickname, avatar: (mode === 'bar' || mode === 'lop') ? makeDemoAvatar(idx + 1) : '' };
  if (mode === 'bar') rememberDemoBarUser(user);
  if (mode === 'lop') rememberDemoLopUser(user);
  return { type: 'chat', user, text: clean, ts: Date.now() };
}

function demoEvent(type) {
  const mode = settings ? settings.get().overlay.mode : 'game';
  const isChua = mode === 'chua';
  const isBar = mode === 'bar';
  const isLop = mode === 'lop';
  const pool = isLop ? LOP_NAMES : isBar ? BAR_NAMES : isChua ? CHUA_NAMES : DEMO_NAMES;
  const prefix = isLop ? 'lop-' : isBar ? 'bar-' : isChua ? 'chua-' : 'demo-';

  if (type === 'join' && (isChua || isBar || isLop)) {
    const nickname = pool[demoJoinSeq % pool.length];
    demoJoinSeq += 1;
    const user = {
      id: `${prefix}join-${demoJoinSeq}`,
      uniqueId: `${prefix}u_${demoJoinSeq}`,
      nickname,
      avatar: (isBar || isLop) ? makeDemoAvatar(demoJoinSeq) : ''
    };
    return { type: 'join', user, ts: Date.now() };
  }

  if (type === 'leave' && isBar) {
    const leaving = demoActiveBarUsers.pop() || { id: 'bar-Hoàng Cường', uniqueId: 'bar-0', nickname: 'Hoàng Cường', avatar: makeDemoAvatar(1) };
    return { type: 'leave', user: leaving, ts: Date.now() };
  }

  if (type === 'leave' && isLop) {
    const leaving = demoActiveLopUsers.pop() || { id: 'lop-chat-1', uniqueId: 'lop_c_1', nickname: 'Mii anime', avatar: makeDemoAvatar(1) };
    return { type: 'leave', user: leaving, ts: Date.now() };
  }

  if (type === 'chat' && isBar) {
    const nickname = pool[demoBarChatSeq % pool.length];
    demoBarChatSeq += 1;
    const round = Math.ceil(demoBarChatSeq / pool.length);
    const displayNick = round > 1 ? `${nickname} #${round}` : nickname;
    const user = { id: `bar-chat-${demoBarChatSeq}`, uniqueId: `bar_c_${demoBarChatSeq}`, nickname: displayNick, avatar: makeDemoAvatar(demoBarChatSeq) };
    rememberDemoBarUser(user);
    return { type: 'chat', user, text: rand(BAR_CHATS), ts: Date.now() };
  }

  if (type === 'chat' && isLop) {
    const nickname = pool[demoLopChatSeq % pool.length];
    demoLopChatSeq += 1;
    const round = Math.ceil(demoLopChatSeq / pool.length);
    const displayNick = round > 1 ? `${nickname} #${round}` : nickname;
    const user = { id: `lop-chat-${demoLopChatSeq}`, uniqueId: `lop_c_${demoLopChatSeq}`, nickname: displayNick, avatar: makeDemoAvatar(demoLopChatSeq) };
    rememberDemoLopUser(user);
    return { type: 'chat', user, text: rand(LOP_CHATS), ts: Date.now() };
  }

  const nickname = rand(pool);
  const idx = pool.indexOf(nickname);
  const user = { id: prefix + nickname, uniqueId: prefix + idx, nickname, avatar: (isBar || isLop) ? makeDemoAvatar(idx + 2) : '' };
  if (isBar && type !== 'join') rememberDemoBarUser(user);
  if (isLop && type !== 'join') rememberDemoLopUser(user);
  const ts = Date.now();
  switch (type) {
    case 'chat': return { type: 'chat', user, text: rand(isLop ? LOP_CHATS : isBar ? BAR_CHATS : isChua ? CHUA_CHATS : DEMO_CHATS), ts };
    case 'lopWrong': {
      const u = (isLop && demoActiveLopUsers.length) ? rand(demoActiveLopUsers) : user;
      return { type: 'chat', user: u, text: rand(LOP_WRONGS), ts };
    }
    case 'lopSkin': {
      const u = (isLop && demoActiveLopUsers.length) ? rand(demoActiveLopUsers) : user;
      return { type: 'chat', user: u, text: 'đổi kiểu', ts };
    }
    case 'scare': return { type: 'chat', user, text: 'hù', ts };
    case 'adidaphat': return { type: 'chat', user, text: 'Nam mô A Di Đà Phật 🙏', ts };
    case 'bellChat': return { type: 'chat', user, text: 'Thỉnh chuông bình an 🔔', ts };
    case 'lotusChat': return { type: 'chat', user, text: 'Dâng hoa sen vàng 🪷', ts };
    case 'skin': {
      const skinWord = CHUA_SKINS[demoSkinIdx % CHUA_SKINS.length];
      demoSkinIdx += 1;
      return { type: 'chat', user, text: skinWord, ts };
    }
    case 'barCenter': return { type: 'chat', user, text: 'lên chính 🌟 Chào 500 anh em trong sàn!', ts };
    case 'barFireworks': return { type: 'chat', user, text: 'pháo hoa rực trời luôn shop ơi 🎆', ts };
    case 'barJump': return { type: 'chat', user, text: 'nhảy 1 cái 💃', ts };
    case 'barCamera': return { type: 'chat', user, text: 'camera', ts };
    case 'barSkin': return { type: 'chat', user, text: 'đổi nv', ts };
    case 'barParade': return { type: 'chat', user, text: 'đi vòng', ts };
    case 'barPilot': return { type: 'chat', user, text: 'phi công 🚀', ts };
    case 'barCouple': return { type: 'chat', user, text: 'ghép đôi 💞', ts };
    case 'barWukong': return { type: 'chat', user, text: 'ngộ không 🐵', ts };
    case 'barKing': return { type: 'chat', user, text: 'vua 👑', ts };
    case 'barCheers': return { type: 'chat', user, text: '1 2 3 dzô 🍻', ts };
    case 'clap': return { type: 'chat', user, text: 'vỗ tay', ts };
    case 'haha': return { type: 'chat', user, text: 'haha', ts };
    case 'wow': return { type: 'chat', user, text: 'wow', ts };
    case 'popcorn': return { type: 'chat', user, text: 'bắp', ts };
    case 'wish': return { type: 'chat', user, text: rand(CHUA_WISHES), ts };
    case 'hide': return { type: 'chat', user, text: 'trốn', ts };
    case 'seek': return { type: 'chat', user, text: 'tìm', ts };
    case 'freeze': return { type: 'chat', user, text: 'bùa', ts };
    case 'summon': return { type: 'chat', user, text: 'gọi hồn', ts };
    case 'blackout': return { type: 'chat', user, text: 'tắt đèn', ts };
    case 'dance': return { type: 'chat', user, text: 'nhảy', ts };
    case 'laugh': return { type: 'chat', user, text: 'cười', ts };
    case 'cry': return { type: 'chat', user, text: 'khóc', ts };
    case 'hug': return { type: 'chat', user, text: 'ôm', ts };
    case 'gift': {
      const g = rand(isLop ? LOP_GIFTS.slice(0, 3) : isBar ? BAR_GIFTS.slice(0, 3) : isChua ? CHUA_GIFTS.slice(0, 3) : DEMO_GIFTS);
      return { type: 'gift', user, ...g, total: g.diamonds * g.repeatCount, giftImage: '', ts };
    }
    case 'bigGift': {
      const g = isLop ? LOP_GIFTS[3] : isBar ? BAR_GIFTS[3] : isChua ? CHUA_GIFTS[3] : DEMO_GIFTS[3];
      return { type: 'gift', user, ...g, total: g.diamonds * g.repeatCount, giftImage: '', ts };
    }
    case 'follow': return { type: 'follow', user, ts };
    case 'share': return { type: 'share', user, ts };
    case 'join': return { type: 'join', user, ts };
    default: return null;
  }
}

// ---- Tự kiểm tra (không hiện cửa sổ): STUDIO_SELFTEST=<file kết quả> ----
function selfTest() {
  const fs = require('fs');
  win.webContents.once('did-finish-load', async () => {
    const r = { server: serverState.running, port: serverState.port };
    try {
      const h = await fetch(`http://127.0.0.1:${serverState.port}/health`).then((x) => x.json());
      r.health = h.ok === true;
      const html = await fetch(`http://127.0.0.1:${serverState.port}/`).then((x) => x.text());
      r.overlay = html.includes('temple.js') && html.includes('game.js') && html.includes('bar.js') && html.includes('lop-data.js') && html.includes('lop.js');
      const reportRes = await fetch(`http://127.0.0.1:${serverState.port}/lop-bao-cao`);
      r.lopReport = reportRes.ok;
      const img = await fetch(`http://127.0.0.1:${serverState.port}/chua-assets/hall.jpg`);
      r.chuaAssets = img.ok;
      await new Promise((ok) => setTimeout(ok, 1500));
      r.ui = await win.webContents.executeJavaScript("!!document.querySelector('#view-dashboard') && document.querySelector('#srv-sub').textContent");
      r.decoder = typeof require('tiktok-live-connector').deserializeWebSocketMessage === 'function';
    } catch (e) {
      r.error = String(e.message || e);
    }
    fs.writeFileSync(process.env.STUDIO_SELFTEST, JSON.stringify(r));
    app.quit();
  });
}

// ---- Vòng đời ứng dụng ----
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    settings = new Settings(app.getPath('userData'));
    await startServer(settings.get().port);
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Tiến trình đồ hoạ (GPU) sập -> khung xem / màn hình phát dễ bị đen: tự tải lại
  app.on('child-process-gone', (_e, d) => {
    if (d.type !== 'GPU') return;
    setTimeout(() => {
      send('preview:reload');
      if (outWin && !outWin.isDestroyed()) outWin.webContents.reload();
    }, 800);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => {
    live.stop(true);
    overlay.stop();
  });
}
