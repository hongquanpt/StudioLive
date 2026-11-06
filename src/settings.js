'use strict';
const fs = require('fs');
const path = require('path');

const DEFAULT_CHUA_TRIGGERS = [
  { phrase: 'adidaphat, nam mô, mô phật, thắp hương, dâng hương, lạy phật, 🙏', effect: 'incense' },
  { phrase: 'thỉnh chuông, đánh chuông, chuông, 🔔', effect: 'bell' },
  { phrase: 'gõ mõ, tụng kinh, niệm phật, 🪵', effect: 'mo' },
  { phrase: 'hoa sen, dâng hoa, sen vàng, nở sen, 🪷', effect: 'lotus' },
  { phrase: 'hoan hỷ, tùy hỷ, công đức, phóng sinh, tâm an, ✨', effect: 'halo' },
  { phrase: 'mưa hoa, mưa sen, rải hoa, 🌸', effect: 'rain' }
];
const VALID_CHUA_EFFECTS = ['incense', 'bell', 'mo', 'lotus', 'halo', 'rain', 'wish'];

const DEFAULT_BAR_TRIGGERS = [
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
const VALID_BAR_EFFECTS = ['center', 'fireworks', 'jump', 'camera', 'skin', 'parade', 'pilot', 'couple', 'wukong', 'king', 'cheers', 'drop'];

const DEFAULTS = {
  username: '',
  port: 3000,
  autoReconnect: true,
  previewSound: true,       // nghe âm thanh overlay ngay trong app
  maStyle: 'game',          // kiểu của Live Ma Online: game | cards
  barTriggersV2: false,
  lopChuMigrated: false,
  lopCleanV2: false,
  overlay: {
    showChat: true,
    showGifts: true,
    showFollows: true,
    showShares: true,
    showJoins: false,
    showLikeCounter: true,
    showViewerCounter: true,
    showTopGifter: true,
    mode: 'game',               // game (Nhà Ma) | cards | chua (Đi Chùa) | bar (Đi Bar) | rap (Rạp Phim)
    rapName: '',                // tên rạp (tiêu đề + giọng đọc)
    rapVoice: true,
    rapGreet: true,
    rapRate: 1,
    rapVolume: 0.8,             // âm lượng phim
    rapLikeGoal: 500,           // số tim để mưa bắp rang
    rapVideos: [],              // danh sách đường dẫn file phim trên máy
    rapIndex: 0,                // phim đang chiếu
    rapLoop: true,              // hết danh sách thì chiếu lại từ đầu
    rapTheme: 'classic',        // classic | gold | imax | home
    rapLightsOff: false,        // tắt đèn phòng chiếu
    rapIdleMin: 0,              // im lặng quá số phút này thì tự ra về (0 = không)
    chuaName: '',               // tên kênh: tiêu đề + cách giọng đọc tự xưng
    chuaVoice: true,            // giọng đọc (chào, cảm ơn quà, chúc)
    chuaGreet: true,            // chào người mới vào bằng giọng đọc
    chuaWelcomeBanner: true,    // hiện bảng chào mừng trên màn hình khi người xem bước vào
    chuaAutoShare: false,       // tự nhắc chia sẻ định kỳ khi vắng tiếng (mặc định tắt để giữ thanh tịnh)
    chuaRate: 1,                // tốc độ đọc
    chuaLikeGoal: 666,          // số tim để mưa hoa sen
    chuaMusic: false,           // bật/tắt âm nền chánh điện (mặc định tắt để không chèn nhạc ngoài ý muốn)
    chuaSoundscape: 'off',      // off | bell (chuông thiền) | chant (nhịp mõ) | custom (nhạc riêng trên máy)
    customChuaMusic: '',        // đường dẫn file nhạc riêng cho Đi Chùa
    chuaMusicVolume: 0.35,
    chuaTriggers: DEFAULT_CHUA_TRIGGERS,
    barName: '',                // tên sàn bar hiển thị trên bục DJ & băng rôn LED
    barTheme: 'cyber',          // cyber | vinahouse | galaxy | rooftop
    barVoice: true,             // MC đọc chào mừng, ghép đôi, cảm ơn đại gia
    barGreet: true,             // MC chào người mới vào sàn
    barWelcomeBanner: true,     // thanh thông báo "vừa vào sàn" trên đỉnh
    barRate: 1.05,              // tốc độ giọng MC
    barLikeGoal: 500,           // số tim để mở Bão Tim / Drop Pháo Hoa
    barSoundscape: 'house',     // off | house (Beat 128 BPM) | chill (Lounge 110 BPM) | custom (Link nhạc / MP3 riêng)
    customBarMusic: '',         // file / link nhạc đơn (tương thích ngược)
    barMusicList: [],           // danh sách link nhạc (YouTube, SoundCloud, MP3/MP4 trực tiếp) hoặc file trên máy
    barMusicIndex: 0,           // bài đang phát trong danh sách
    barMusicLoop: true,         // tự lặp lại danh sách nhạc
    barIdleMin: 0,              // 0 = chỉ mất khi rời live; >0 = tự rời sau số phút im lặng
    barMusicVolume: 0.45,
    barTriggers: DEFAULT_BAR_TRIGGERS,
    // ---- Lớp Học Chữ ----
    lopName: 'Lớp Học Chữ',     // tên lớp trên bảng gỗ chính giữa
    lopTheme: 'classic',        // classic (Lớp Học Chữ nắng ấm) | pastel | sunny | sakura | sky
    lopAvatarMode: 'avatar',    // avatar (Avatar tròn + đồng phục khăn quàng) | back (Quay lưng kiểu Lớp Học Chữ)
    lopTopic: 'all',            // all | custom | tên chủ đề cụ thể
    lopQuestionSec: 20,         // thời gian đếm ngược mỗi câu hỏi (giây)
    lopRequireTone: false,      // mặc định nhận cả có dấu & không dấu để người xem trên điện thoại dễ trả lời
    lopAcceptNoTone: true,      // tương thích ngược (!lopRequireTone)
    lopMathEnabled: true,       // xen kẽ 4 câu tính nhẩm (câu 5, 10, 15, 19) trong tiết 20 câu
    lopAutoHint: true,          // thêm 10s + mở 1 chữ cái nếu hết giờ chưa ai giải ra
    lopVoice: true,             // giọng Cô Giáo Hoài My + phát âm tiếng Anh
    lopGreet: true,             // Cô Giáo chào & vinh danh chuỗi chuyên cần khi vào lớp
    lopRate: 1.08,              // tốc độ giọng Cô Giáo
    lopLikeGoal: 300,           // mốc tim (nhân 5x) để cả lớp vỗ tay rần rần
    lopSoundscape: 'off',       // off | melody | lofi | custom
    lopMusicVolume: 0.25,
    customLopMusic: '',
    lopMusicList: [],
    lopMusicIndex: 0,
    lopMusicLoop: true,
    lopCustomWords: '',         // câu hỏi tự thêm (Đáp án | Gợi ý | Chủ đề mỗi dòng)
    lopIdleMin: 0,              // 0 = chỉ rời lớp khi thoát live
    roundEvery: 3,              // phút giữa các vòng TRỐN TÌM, 0 = tắt
    bots: true,                 // ma NPC đi hù người xem
    background: 'haunted',      // transparent | haunted
    accent: '#a3e635',
    chatDuration: 4.5,          // giây
    maxCards: 6,                // số thẻ chat tối đa cùng lúc
    bigGiftDiamonds: 30,        // quà >= số kim cương này: jumpscare + Bà Ma
    sound: true,
    volume: 0.7,
    chatSound: false,
    customGiftSound: '',        // đường dẫn file mp3/wav trên máy
    customChatSound: '',
    customJumpscare: '',        // ảnh/gif/video jumpscare tự chọn
    customScareSound: '',       // tiếng khi bị hù (tuỳ chọn)
    customAmbient: '',          // nhạc nền (tuỳ chọn)
    ambient: true,              // nhạc nền rùng rợn
    ambientPreset: 'drone',     // drone | wind | rain | church | heartbeat | musicbox | whispers | forest
    ambientVolume: 0.5,
    tutorialEvery: 2,           // phút giữa các lần hiện bảng CÁCH CHƠI, 0 = tắt
    filterWords: '',            // các từ cần ẩn, ngăn cách bằng dấu phẩy
    liveBoost: 15               // % tăng độ tươi màu để bù phần TikTok nén làm nhạt (0-40)
  }
};

function sanitizeRuleList(list, fallback, validEffects, defEffect) {
  if (!Array.isArray(list)) return structuredClone(fallback);
  return list
    .filter((x) => x && typeof x === 'object' && typeof x.phrase === 'string' && x.phrase.trim())
    .map((x) => ({
      phrase: x.phrase.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 180),
      effect: validEffects.includes(x.effect) ? x.effect : defEffect
    }))
    .slice(0, 40);
}

function merge(base, extra) {
  const out = structuredClone(base);
  for (const [k, v] of Object.entries(extra || {})) {
    if (!(k in base)) continue;
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = merge(base[k], v);
    } else if (Array.isArray(base[k])) {
      if (Array.isArray(v)) out[k] = structuredClone(v);
    } else if (typeof v === typeof base[k]) {
      out[k] = v;
    }
  }
  return out;
}

class Settings {
  constructor(dir) {
    this.file = path.join(dir, 'settings.json');
    this.data = merge(DEFAULTS, {});
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.data = merge(DEFAULTS, raw);
      if (this.data.overlay.mode === 'cards') this.data.overlay.mode = 'game';
      // Chuyển đổi từ bản cũ: tắt hẳn nhạc ngẫu nhiên mặc định ở Chánh Điện
      if (!raw?.overlay || typeof raw.overlay.chuaSoundscape !== 'string') {
        this.data.overlay.chuaSoundscape = 'off';
        this.data.overlay.chuaMusic = false;
        if (this.data.overlay.chuaMusicVolume <= 0.08) this.data.overlay.chuaMusicVolume = 0.35;
      }
      this.data.overlay.chuaTriggers = sanitizeRuleList(this.data.overlay.chuaTriggers, DEFAULT_CHUA_TRIGGERS, VALID_CHUA_EFFECTS, 'lotus');
      this.data.overlay.barTriggers = sanitizeRuleList(this.data.overlay.barTriggers, DEFAULT_BAR_TRIGGERS, VALID_BAR_EFFECTS, 'jump');
      if (this.data.overlay.customBarMusic && (!Array.isArray(this.data.overlay.barMusicList) || !this.data.overlay.barMusicList.length)) {
        this.data.overlay.barMusicList = [this.data.overlay.customBarMusic];
      }
      if (this.data.overlay.customLopMusic && (!Array.isArray(this.data.overlay.lopMusicList) || !this.data.overlay.lopMusicList.length)) {
        this.data.overlay.lopMusicList = [this.data.overlay.customLopMusic];
      }
      // Chuyển đổi sang chuẩn Lớp Học Chữ (1 lần duy nhất nếu đang giữ mặc định bản cũ)
      if (!raw?.lopChuMigrated) {
        const lo = this.data.overlay;
        if (!raw?.overlay?.lopTheme || lo.lopName === 'Lớp Học Vui Vẻ') {
          lo.lopName = 'Lớp Học Chữ';
          lo.lopTheme = 'classic';
          lo.lopQuestionSec = 20;
          lo.lopRequireTone = true;
          lo.lopAcceptNoTone = false;
          lo.lopLikeGoal = 300;
          lo.lopSoundscape = 'off';
          lo.lopGreet = true;
          lo.lopRate = 1.08;
        }
        this.data.lopChuMigrated = true;
      }
      // Chuyển đổi V2: tắt nhạc nền dư thừa & cho phép gõ cả không dấu mặc định để học sinh dễ trả lời trên live
      if (!raw?.lopCleanV2) {
        const lo = this.data.overlay;
        if (lo.lopSoundscape === 'melody') lo.lopSoundscape = 'off';
        lo.lopRequireTone = false;
        lo.lopAcceptNoTone = true;
        this.data.lopCleanV2 = true;
      }
    } catch { /* lần đầu chạy hoặc file hỏng -> dùng mặc định */ }
  }

  get() {
    return structuredClone(this.data);
  }

  update(patch) {
    this.data = merge(this.data, patch);
    this.data.port = Math.min(65535, Math.max(1024, Math.round(this.data.port) || 3000));
    const o = this.data.overlay;
    o.volume = Math.min(1, Math.max(0, o.volume));
    o.chatDuration = Math.min(20, Math.max(2, o.chatDuration));
    o.maxCards = Math.min(20, Math.max(1, Math.round(o.maxCards)));
    o.bigGiftDiamonds = Math.max(0, Math.round(o.bigGiftDiamonds));
    o.roundEvery = Math.min(30, Math.max(0, Math.round(o.roundEvery)));
    o.tutorialEvery = Math.min(30, Math.max(0, Math.round(o.tutorialEvery)));

    o.chuaName = o.chuaName.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40);
    o.chuaRate = Math.min(1.3, Math.max(0.6, o.chuaRate));
    o.chuaMusicVolume = Math.min(1, Math.max(0, o.chuaMusicVolume));
    o.chuaLikeGoal = Math.min(100000, Math.max(10, Math.round(o.chuaLikeGoal)));
    if (!['off', 'bell', 'chant', 'custom'].includes(o.chuaSoundscape)) o.chuaSoundscape = 'off';
    o.customChuaMusic = String(o.customChuaMusic || '').trim().slice(0, 2000);
    if (o.chuaSoundscape === 'custom' && !o.customChuaMusic) o.chuaSoundscape = 'off';
    o.chuaMusic = o.chuaSoundscape !== 'off';
    o.chuaTriggers = sanitizeRuleList(o.chuaTriggers, DEFAULT_CHUA_TRIGGERS, VALID_CHUA_EFFECTS, 'lotus');

    o.barName = String(o.barName || '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40);
    if (!['cyber', 'vinahouse', 'galaxy', 'rooftop'].includes(o.barTheme)) o.barTheme = 'cyber';
    o.barRate = Math.min(1.3, Math.max(0.6, o.barRate));
    o.barMusicVolume = Math.min(1, Math.max(0, o.barMusicVolume));
    o.barLikeGoal = Math.min(100000, Math.max(10, Math.round(o.barLikeGoal)));
    if (!['off', 'house', 'chill', 'custom'].includes(o.barSoundscape)) o.barSoundscape = 'house';
    o.customBarMusic = String(o.customBarMusic || '').trim().slice(0, 2000);
    o.barMusicList = (Array.isArray(o.barMusicList) ? o.barMusicList : [])
      .filter((x) => typeof x === 'string' && x.trim() && (!/^[a-z]+:/i.test(x) || /^https?:\/\//i.test(x.trim()) || /^[a-z]:[\\/]/i.test(x.trim())))
      .map((x) => x.trim().slice(0, 2000))
      .slice(0, 100);
    if (!o.barMusicList.length && o.customBarMusic) o.barMusicList = [o.customBarMusic];
    o.barMusicIndex = Math.max(0, Math.min(Math.max(0, o.barMusicList.length - 1), Math.round(o.barMusicIndex) || 0));
    o.barMusicLoop = o.barMusicLoop !== false;
    o.barIdleMin = Math.min(180, Math.max(0, Math.round(o.barIdleMin) || 0));
    o.barTriggers = sanitizeRuleList(o.barTriggers, DEFAULT_BAR_TRIGGERS, VALID_BAR_EFFECTS, 'jump');
    if (!this.data.barTriggersV2) {
      if (!o.barTriggers.some((r) => r.effect === 'fireworks')) {
        o.barTriggers.unshift({ phrase: 'pháo hoa, bắn pháo, nổ pháo, chúc mừng, 🎆, 🎇', effect: 'fireworks' });
      }
      if (!o.barTriggers.some((r) => r.effect === 'center')) {
        o.barTriggers.unshift({ phrase: 'lên chính, lên sóng, tâm điểm, spotlight, ngôi sao, main, 🌟', effect: 'center' });
      }
      o.barTriggers = o.barTriggers.slice(0, 30);
      this.data.barTriggersV2 = true;
    }

    o.ambientVolume = Math.min(1, Math.max(0, o.ambientVolume));
    o.liveBoost = Math.min(40, Math.max(0, Math.round(o.liveBoost)));
    if (!['drone', 'wind', 'rain', 'church', 'heartbeat', 'musicbox', 'whispers', 'forest'].includes(o.ambientPreset)) o.ambientPreset = 'drone';
    if (!['game', 'cards', 'chua', 'bar', 'rap', 'lop'].includes(o.mode)) o.mode = 'game';

    if (patch?.overlay && typeof patch.overlay === 'object') {
      if ('lopRequireTone' in patch.overlay && !('lopAcceptNoTone' in patch.overlay)) {
        o.lopAcceptNoTone = !o.lopRequireTone;
      } else if ('lopAcceptNoTone' in patch.overlay && !('lopRequireTone' in patch.overlay)) {
        o.lopRequireTone = !o.lopAcceptNoTone;
      }
    }
    o.lopName = String(o.lopName || '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40) || 'Lớp Học Chữ';
    if (!['classic', 'pastel', 'sunny', 'sakura', 'sky'].includes(o.lopTheme)) o.lopTheme = 'classic';
    if (!['avatar', 'back'].includes(o.lopAvatarMode)) o.lopAvatarMode = 'avatar';
    o.lopTopic = String(o.lopTopic || 'all').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 60) || 'all';
    o.lopQuestionSec = Math.min(90, Math.max(10, Math.round(Number(o.lopQuestionSec) || 20)));
    o.lopRequireTone = o.lopRequireTone !== false;
    o.lopAcceptNoTone = !o.lopRequireTone;
    o.lopMathEnabled = o.lopMathEnabled !== false;
    o.lopAutoHint = o.lopAutoHint !== false;
    o.lopRate = Math.min(1.4, Math.max(0.6, Number(o.lopRate) || 1.08));
    o.lopMusicVolume = Math.min(1, Math.max(0, Number(o.lopMusicVolume ?? 0.25)));
    o.lopLikeGoal = Math.min(500000, Math.max(10, Math.round(Number(o.lopLikeGoal) || 300)));
    if (!['off', 'melody', 'lofi', 'custom'].includes(o.lopSoundscape)) o.lopSoundscape = 'off';
    o.customLopMusic = String(o.customLopMusic || '').trim().slice(0, 2000);
    o.lopMusicList = (Array.isArray(o.lopMusicList) ? o.lopMusicList : [])
      .filter((x) => typeof x === 'string' && x.trim() && (!/^[a-z]+:/i.test(x) || /^https?:\/\//i.test(x.trim()) || /^[a-z]:[\\/]/i.test(x.trim())))
      .map((x) => x.trim().slice(0, 2000))
      .slice(0, 100);
    if (!o.lopMusicList.length && o.customLopMusic) o.lopMusicList = [o.customLopMusic];
    o.lopMusicIndex = Math.max(0, Math.min(Math.max(0, o.lopMusicList.length - 1), Math.round(o.lopMusicIndex) || 0));
    o.lopMusicLoop = o.lopMusicLoop !== false;
    o.lopCustomWords = String(o.lopCustomWords || '').replace(/\r\n/g, '\n').slice(0, 12000);
    o.lopIdleMin = Math.min(180, Math.max(0, Math.round(o.lopIdleMin) || 0));
    this.data.lopChuMigrated = true;
    this.data.lopCleanV2 = true;
    o.rapName = String(o.rapName).replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40);
    o.rapRate = Math.min(1.3, Math.max(0.6, o.rapRate));
    if (!['classic', 'gold', 'imax', 'home'].includes(o.rapTheme)) o.rapTheme = 'classic';
    o.rapIdleMin = Math.min(120, Math.max(0, Math.round(o.rapIdleMin)));
    o.rapVolume = Math.min(1, Math.max(0, o.rapVolume));
    o.rapLikeGoal = Math.min(100000, Math.max(10, Math.round(o.rapLikeGoal)));
    o.rapVideos = (Array.isArray(o.rapVideos) ? o.rapVideos : [])
      .filter((x) => typeof x === 'string' && x && (!/^[a-z]+:/i.test(x) || /^https?:\/\//i.test(x) || /^[a-z]:[\\/]/i.test(x)))
      .map((x) => x.trim().slice(0, 2000)).slice(0, 100);
    o.rapIndex = Math.max(0, Math.min(Math.max(0, o.rapVideos.length - 1), Math.round(o.rapIndex) || 0));
    if (!['game', 'cards'].includes(this.data.maStyle)) this.data.maStyle = 'game';
    if (o.mode === 'game' || o.mode === 'cards') this.data.maStyle = o.mode;
    if (!/^#[0-9a-f]{6}$/i.test(o.accent)) o.accent = DEFAULTS.overlay.accent;
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('[settings] Không lưu được:', e.message);
    }
    return this.get();
  }
}

module.exports = { Settings, DEFAULTS, DEFAULT_CHUA_TRIGGERS, DEFAULT_BAR_TRIGGERS };
