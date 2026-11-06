/*
 * LỚP HỌC CHỮ — StudioLive (overlay/lop.js)
 * Áp dụng trọn vẹn ý tưởng & cơ chế từ https://github.com/workaipvlinh-byte/lop-hoc-chu (MIT):
 *  - Tiết học 20 câu theo nhịp tăng dần: Ghép chữ + Tiếng Anh (câu 3, 12) + Đố mẹo (câu 7, 13)
 *    + Lịch sử (câu 9, 17) + 4 câu Tính nhẩm (câu 5, 10, 15, 19) + Câu Hỏi Vàng x2 ở câu 20.
 *  - Cô Giáo đọc đề trước ("👂 Nghe cô đọc đề nè…"), hô "Bắt đầu!" mới hiện ô chữ & đếm giờ.
 *  - Bổ sung +10s & mở 1 chữ gợi ý khi cả lớp bí; dừng tuyên dương & phát quà bay về bàn sau câu 5, 10, 15.
 *  - Giờ ra chơi 5 trò luân phiên (Oẳn tù tì, Kiểm tra miệng, Chọn phe, Điểm danh, Thả tim) + Bảng Lớp Trưởng + Bình chọn chủ đề.
 *  - 4 dãy bàn gỗ dài (7+7+8+8 = 30 chỗ) xếp theo điểm tiết + 60 chỗ đứng cửa lớp, Bảng Xuất Sắc Hôm Nay, Bảng Vàng Tuần, Chuyên cần.
 *  - Tặng quà: học sinh ôm bó hoa đi lên bục tặng Cô Giáo, cắm vào bình hoa, quà >=30 xu mở chữ cứu cả lớp.
 *  - Hỗ trợ cả 2 chế độ nhân vật: Avatar TikTok tròn + đồng phục khăn quàng đỏ HOẶC học sinh quay lưng nhìn bảng.
 */
(() => {
  'use strict';

  const W = 1080;
  const H = 1920;
  const FRAME_MS = 1000 / 30;
  let DPR = 1;

  function computeOptimalDpr() {
    const scale = Math.min((window.innerWidth || W) / W, (window.innerHeight || H) / H);
    const phys = scale * (window.devicePixelRatio || 1);
    // Ở đúng chuẩn 1080×1920 (phys ≈ 1), vẽ 1:1 sắc nét tuyệt đối (không bị nhoè do thu nhỏ 2160→1080 & nhẹ GPU gấp 4 lần)
    return phys > 1.25 ? 2 : 1;
  }

  function syncCanvasResolution() {
    if (!canvas) return;
    const nextDpr = computeOptimalDpr();
    const tw = W * nextDpr;
    const th = H * nextDpr;
    if (!ctx || canvas.width !== tw || canvas.height !== th || DPR !== nextDpr) {
      DPR = nextDpr;
      canvas.width = tw;
      canvas.height = th;
      ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    }
  }

  const BENCH_SIZES = [7, 7, 8, 8];
  const BENCH_YS = [1020, 1200, 1380, 1560];
  const MAX_SEATS = 30;
  const MAX_STANDING = 60;
  const HEART_BOOST = 5;

  const ROUND_PLAN = [
    'easy', 'easy', 'anh', 'easy', 'math1',
    'easy', 'meo', 'easy', 'su', 'math2',
    'easy', 'anh', 'easy', 'meo', 'math3',
    'medium', 'su', 'easy', 'math4', 'medium'
  ];
  const SCORE_RANK = [10, 7, 5, 3, 3, 3, 3, 3, 3, 3];
  const ATTEND_MILESTONES = new Set([3, 5, 7, 10, 14, 21, 30]);

  const THEMES = {
    classic: {
      ceilTop: '#a4572c', ceilBot: '#c97843', beam: '#6b3417',
      wallTop: '#fdf3dc', wallBot: '#f5e4be', brick: 'rgba(186, 135, 82, 0.16)',
      wainscot: '#d6a46c', wainscotTrim: '#9e6230',
      floorA: '#eab87d', floorB: '#dfaa6c', floorLine: 'rgba(130, 78, 34, 0.22)',
      skyTop: '#7dd3fc', skyBot: '#e0f2fe', leaf: '#22c55e', flower: '#ec4899',
      boardBg: '#1b4332', boardDark: '#122e22', frame: '#8c4f23', frameHi: '#b9733c'
    },
    pastel: {
      ceilTop: '#b8e0d8', ceilBot: '#d8f1ec', beam: '#7ea89f',
      wallTop: '#fff7ed', wallBot: '#fde8d7', brick: 'rgba(203, 155, 125, 0.14)',
      wainscot: '#f3cfb6', wainscotTrim: '#c58b68',
      floorA: '#f5d5a7', floorB: '#ecc692', floorLine: 'rgba(148, 97, 52, 0.18)',
      skyTop: '#bae6fd', skyBot: '#f0f9ff', leaf: '#4ade80', flower: '#f472b6',
      boardBg: '#235347', boardDark: '#173b32', frame: '#b97a45', frameHi: '#d89b64'
    },
    sunny: {
      ceilTop: '#b4692e', ceilBot: '#d98c46', beam: '#783f16',
      wallTop: '#fef9c3', wallBot: '#fde68a', brick: 'rgba(180, 130, 50, 0.14)',
      wainscot: '#e7b26b', wainscotTrim: '#a16207',
      floorA: '#f3c687', floorB: '#e8b671', floorLine: 'rgba(146, 88, 28, 0.2)',
      skyTop: '#7dd3fc', skyBot: '#fef9c3', leaf: '#16a34a', flower: '#fb7185',
      boardBg: '#1e4635', boardDark: '#132f23', frame: '#92400e', frameHi: '#c26d27'
    },
    sakura: {
      ceilTop: '#9d5b6b', ceilBot: '#be7a8b', beam: '#6d3746',
      wallTop: '#fff1f2', wallBot: '#ffe4e6', brick: 'rgba(190, 120, 140, 0.14)',
      wainscot: '#f5c2cc', wainscotTrim: '#be6a7d',
      floorA: '#f3d1bd', floorB: '#e8c1aa', floorLine: 'rgba(140, 85, 75, 0.18)',
      skyTop: '#fbcfe8', skyBot: '#fff1f2', leaf: '#34d399', flower: '#f43f5e',
      boardBg: '#244b43', boardDark: '#17332d', frame: '#9f5848', frameHi: '#c77966'
    },
    sky: {
      ceilTop: '#4a7c9b', ceilBot: '#689ab8', beam: '#2f5670',
      wallTop: '#f0f9ff', wallBot: '#e0f2fe', brick: 'rgba(100, 150, 185, 0.14)',
      wainscot: '#bdd8ea', wainscotTrim: '#5a87a6',
      floorA: '#edd2a8', floorB: '#e2c394', floorLine: 'rgba(120, 85, 45, 0.18)',
      skyTop: '#38bdf8', skyBot: '#e0f2fe', leaf: '#22c55e', flower: '#f472b6',
      boardBg: '#1d473d', boardDark: '#123029', frame: '#8a5530', frameHi: '#b5784c'
    }
  };

  const HAIR_COLORS = [
    '#231815', '#3b2314', '#58311a', '#7c3f1d', '#1e293b', '#4a1d35',
    '#78350f', '#92400e', '#312e81', '#831843', '#134e4a', '#5b21b6'
  ];
  const UNIFORM_TINTS = ['#ffffff', '#fffdf7', '#f8fafc', '#fefce8'];
  const VASE_FLOWERS = ['🌸', '🌷', '🌹', '🌼', '🌺', '🌻'];

  const DATA = () => window.LopData || {
    QUESTIONS: [], CATEGORIES: [], REWARDS: [{ name: 'một cây kẹo mút', icon: '🍭' }],
    LINES: {}, POLLS: [], PICK_TOPICS: [['phở', 'bún bò']],
    containsBanned: () => false, maskBanned: (s) => s, speakableName: (s) => s || 'bạn'
  };

  // ---------- Chuẩn hoá dấu tiếng Việt (hỗ trợ cả quy tắc dấu cũ hoà/hóa, thuỷ/thủy, quí/quý) ----------
  const OLD_TONES = [
    ['oà', 'òa'], ['oá', 'óa'], ['oả', 'ỏa'], ['oã', 'õa'], ['oạ', 'ọa'],
    ['oè', 'òe'], ['oé', 'óe'], ['oẻ', 'ỏe'], ['oẽ', 'õe'], ['oẹ', 'ọe'],
    ['uỳ', 'ùy'], ['uý', 'úy'], ['uỷ', 'ủy'], ['uỹ', 'ũy'], ['uỵ', 'ụy'],
    ['quì', 'quỳ'], ['quí', 'quý'], ['quỉ', 'quỷ'], ['quĩ', 'quỹ'], ['quị', 'quỵ'], ['qui', 'quy']
  ];

  function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function normViTone(str) {
    let s = String(str || '').normalize('NFC').toLowerCase();
    for (const [a, b] of OLD_TONES) s = s.split(a).join(b);
    return s.replace(/[^\p{L}\p{M}\p{N}]+/gu, '');
  }

  function normViNoTone(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  function lettersOf(answer) {
    return String(answer || '').normalize('NFC').toUpperCase().replace(/\s+/g, '');
  }

  function scrambleWords(answer) {
    const words = String(answer || '').normalize('NFC').toUpperCase().trim().split(/\s+/).filter(Boolean);
    const scrambleOne = (chars) => {
      if (chars.length <= 1) return chars.slice();
      const orig = chars.join('');
      for (let attempt = 0; attempt < 10; attempt++) {
        const arr = chars.slice();
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        if (arr.join('') !== orig) return arr;
      }
      return chars.slice().reverse();
    };
    // Xáo chữ trong phạm vi từng tiếng riêng biệt (vd: BÁNH MÌ -> HBÁN / ÌM) để học sinh dễ nhìn và đoán nhanh
    return words.map((w) => scrambleOne([...w]));
  }

  // ---------- Sinh câu tính nhẩm 4 cấp độ siêu dễ nhẩm nhanh (câu 5, 10, 15, 19) ----------
  const rInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function makeMathQuestion(level) {
    let expr = '', ans = 0, promptPlain = '', speech = '', speechAns = '';
    if (level <= 1) {
      // Cấp 1 (Câu 5): Cộng / trừ nhỏ gọn trong phạm vi 20
      if (Math.random() < 0.6) {
        const a = rInt(2, 10), b = rInt(2, 9);
        ans = a + b;
        expr = `${a} + ${b} = ?`;
        promptPlain = `${a} cộng ${b}`;
      } else {
        const a = rInt(7, 18), b = rInt(2, Math.min(9, a - 2));
        ans = a - b;
        expr = `${a} - ${b} = ?`;
        promptPlain = `${a} trừ ${b}`;
      }
      speech = `${promptPlain} bằng bao nhiêu?`;
      speechAns = `${promptPlain} bằng ${ans}`;
    } else if (level === 2) {
      // Cấp 2 (Câu 10): Số tròn chục hoặc cộng/trừ không nhớ/mượn phức tạp (phạm vi ~40), hoặc nhân 2, 5, 10
      const mode = Math.random();
      if (mode < 0.45) {
        if (Math.random() < 0.5) {
          const a = rInt(1, 3) * 10, b = rInt(1, 2) * 10 + (Math.random() < 0.5 ? 0 : 5);
          ans = a + b;
          expr = `${a} + ${b} = ?`;
          promptPlain = `${a} cộng ${b}`;
        } else {
          const tens = rInt(1, 2) * 10, u1 = rInt(1, 5), b = rInt(2, 9 - u1);
          const a = tens + u1;
          ans = a + b;
          expr = `${a} + ${b} = ?`;
          promptPlain = `${a} cộng ${b}`;
        }
      } else if (mode < 0.8) {
        if (Math.random() < 0.45) {
          const a = rInt(2, 4) * 10, b = Math.random() < 0.6 ? 10 : 5;
          ans = a - b;
          expr = `${a} - ${b} = ?`;
          promptPlain = `${a} trừ ${b}`;
        } else {
          const tens = rInt(1, 2) * 10, u1 = rInt(4, 9), b = rInt(1, u1 - 1);
          const a = tens + u1;
          ans = a - b;
          expr = `${a} - ${b} = ?`;
          promptPlain = `${a} trừ ${b}`;
        }
      } else {
        const easyFactors = [2, 5, 10];
        const a = easyFactors[rInt(0, easyFactors.length - 1)], b = rInt(2, 6);
        ans = a * b;
        expr = `${a} × ${b} = ?`;
        promptPlain = `${a} nhân ${b}`;
      }
      speech = `${promptPlain} bằng bao nhiêu?`;
      speechAns = `${promptPlain} bằng ${ans}`;
    } else if (level === 3) {
      // Cấp 3 (Câu 15): Bảng nhân chia cơ bản 2, 3, 4, 5, 10 hoặc cộng số tròn 5/10
      const mode = Math.random();
      if (mode < 0.55) {
        const easyTables = [2, 3, 4, 5, 10];
        const f1 = easyTables[rInt(0, easyTables.length - 1)];
        const f2 = rInt(2, 9);
        const [a, b] = Math.random() < 0.5 ? [f1, f2] : [f2, f1];
        ans = a * b;
        expr = `${a} × ${b} = ?`;
        promptPlain = `${a} nhân ${b}`;
      } else if (mode < 0.85) {
        const divisors = [2, 3, 5, 10];
        const b = divisors[rInt(0, divisors.length - 1)];
        const q = rInt(2, 9);
        const a = b * q;
        ans = q;
        expr = `${a} : ${b} = ?`;
        promptPlain = `${a} chia ${b}`;
      } else {
        const a = [15, 20, 25, 30][rInt(0, 3)];
        const b = [5, 10, 15, 20][rInt(0, 3)];
        ans = a + b;
        expr = `${a} + ${b} = ?`;
        promptPlain = `${a} cộng ${b}`;
      }
      speech = `${promptPlain} bằng bao nhiêu?`;
      speechAns = `${promptPlain} bằng ${ans}`;
    } else {
      // Cấp 4 (Câu 19): Phép tính 2 bước toàn số nhỏ dễ nhẩm nhanh (kết quả gọn <= 35)
      const mode = Math.random();
      if (mode < 0.45) {
        const roundPairs = [[6, 4], [7, 3], [8, 2], [5, 5], [15, 5], [12, 8], [14, 6]];
        const [a, b] = roundPairs[rInt(0, roundPairs.length - 1)];
        const c = rInt(2, 9);
        ans = a + b + c;
        expr = `${a} + ${b} + ${c} = ?`;
        promptPlain = `${a} cộng ${b} cộng ${c}`;
        speech = `${a} cộng ${b}, cộng ${c} bằng bao nhiêu?`;
      } else if (mode < 0.8) {
        const a = rInt(10, 20), b = rInt(2, 8);
        const c = rInt(2, Math.min(8, a + b - 3));
        ans = a + b - c;
        expr = `${a} + ${b} - ${c} = ?`;
        promptPlain = `${a} cộng ${b} trừ ${c}`;
        speech = `${a} cộng ${b}, trừ ${c} bằng bao nhiêu?`;
      } else {
        const a = rInt(2, 5), b = rInt(2, 5), c = rInt(1, 6);
        ans = a * b + c;
        expr = `${a} × ${b} + ${c} = ?`;
        promptPlain = `${a} nhân ${b} cộng ${c}`;
        speech = `${a} nhân ${b}, cộng ${c} bằng bao nhiêu?`;
      }
      speechAns = `${promptPlain} bằng ${ans}`;
    }
    return {
      id: `math:${level}:${expr}`,
      answer: String(ans),
      clue: 'Tính nhẩm thật nhanh rồi gõ kết quả bằng số vào bình luận!',
      category: 'Tính nhẩm',
      kind: 'math',
      slot: 'math',
      difficulty: level <= 2 ? 'easy' : 'medium',
      acceptedAnswers: [String(ans)],
      mathExpr: expr,
      mathPromptPlain: promptPlain,
      mathSpeech: speech,
      mathSpeechAns: speechAns
    };
  }

  function pickLine(key, ...args) {
    const arr = DATA().LINES?.[key];
    if (!Array.isArray(arr) || !arr.length) return '';
    const item = arr[Math.floor(Math.random() * arr.length)];
    return typeof item === 'function' ? item(...args) : String(item || '');
  }

  function pickRand(arr) {
    return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
  }

  // ---------- Trạng thái toàn cục của Lớp Học Chữ ----------
  let canvas = null;
  let ctx = null;
  let sfx = { play: () => {}, duck: () => {}, muted: () => false };
  let ui = {};
  let onStateCb = null;
  let onSyncOutCb = null;
  let isMaster = false;       // chờ server bầu chọn đúng 1 cửa sổ Master điều khiển câu hỏi & phát âm thanh
  let lastSyncedCaption = '';
  let paused = false;
  let rafId = 0;
  let lastFrameTs = 0;

  let cfg = {
    mode: 'game',
    lopName: 'Lớp Học Chữ',
    lopTheme: 'classic',
    lopAvatarMode: 'avatar',
    lopTopic: 'all',
    lopQuestionSec: 20,
    lopRequireTone: false,
    lopAcceptNoTone: true,
    lopMathEnabled: true,
    lopAutoHint: true,
    lopVoice: true,
    lopGreet: true,
    lopRate: 1.08,
    lopLikeGoal: 300,
    lopSoundscape: 'off',
    lopMusicVolume: 0.25,
    customLopMusic: '',
    lopMusicList: [],
    lopMusicIndex: 0,
    lopMusicLoop: true,
    lopCustomWords: '',
    lopIdleMin: 0,
    volume: 0.7,
    sound: true
  };

  // Dữ liệu sổ lớp đồng bộ với server
  const savedUsed = new Set();
  const savedBanned = new Set();
  let weekTop = [];
  let todayTop = [];
  let saveLoaded = false;

  // Người chơi trong lớp
  const players = new Map(); // uid -> player object
  let benchOrder = [];       // tối đa 30 uid ngồi ghế
  let standingOrder = [];    // tối đa 60 uid đứng hai bên cửa
  let currentMonitorUid = ''; // Lớp trưởng hiện tại trong tiết
  const roundChampions = new Map(); // uid -> { uid, nickname, avatar, count }

  // Trạng thái tiết học & câu hỏi
  let roundNum = 0;
  let roundQuestions = [];
  let qIndex = -1;            // 0..19
  let curQ = null;
  let phase = 'intro';        // intro | question | bonus | reveal | praise | results | recess | vote
  let phaseDuration = 8;
  let phaseRemaining = 8;
  let boardReady = false;     // chỉ hiện ô chữ & đếm ngược sau khi Cô hô "Bắt đầu!"
  let halfQuietSaid = false;
  let fiveSecWarned = false;
  let lastWholeSec = 99;
  let reviewMode = false;
  let votedTopic = '';
  let lastActivityAt = Date.now();
  let peakActive = 0;
  let roundQuestionStats = [];

  // Dữ liệu câu hiện tại
  let scrambledGroups = [];   // [['B','Á','N','H'], ['M','Ì']]
  let answerWords = [];       // ['BÁNH', 'MÌ']
  let answerFlat = '';        // 'BÁNHMÌ'
  let revealedIdx = new Set();// vị trí ký tự trong answerFlat đã mở gợi ý
  let qAttempts = new Map();  // uid -> { text, correct, time }
  let qSolvedUids = new Set();// uid đã giải đúng câu hiện tại (ai đoán sai vẫn được đoán lại!)
  let qCorrectList = [];      // [{ uid, nickname, avatar, createTime, points, elapsedMs }]
  let qWrongList = [];        // [{ uid, nickname, text }]
  let qCommentCount = 0;
  let fastestThree = [];      // top 3 của câu vừa/đang giải

  // Tương tác phụ trong lớp
  const podiumPunished = [];  // [{ uid, nickname, avatar, hairIdx, hairColor, until }]
  const flyingGifts = [];     // [{ icon, fromX, fromY, toUid, t, dur }]
  const flowerWalkers = [];   // [{ uid, nickname, avatar, hairIdx, hairColor, fromX, fromY, t, dur, giftName }]
  const floatingHearts = [];  // [{ x, y, vx, vy, size, alpha, emoji }]
  const confetti = [];        // [{ x, y, vx, vy, color, rot, vr, w, h, life }]
  const vaseItems = [];       // ['🌸', '🌷', ...] tối đa 12 bông cắm trong bình
  let totalBouquets = 0;

  // Tim & vỗ tay
  let rawLikesPrev = -1;
  let boostedHearts = 0;
  let nextClapGoal = 300;
  let classClapUntil = 0;

  // Sinh nhật
  const birthdayGiven = new Set();
  let birthdayBanner = null;  // { nickname, until }

  // Tương tác lúc chờ (love / story / poll / sleep)
  let nextEngageAt = Date.now() + 75000;
  let engageStep = 0;
  let loveSession = null;     // { users: Map<uid, nickname>, until }
  let activePoll = null;      // { ask, opts: [{key,label}], votes: Map<uid, key>, until, announced }

  // Giờ ra chơi (5 trò luân phiên)
  const RECESS_GAMES = ['rps', 'callup', 'pick', 'roll', 'heart'];
  let lastRecessGame = '';
  let recessState = null;     // { game, sub: 'play'|'result'|'board', ... }

  // Bình chọn chủ đề cuối giờ ra chơi
  let voteState = null;       // { options: [catA, catB], votes: Map<uid, 1|2> }

  // Hàng đợi chào người mới vào
  let pendingGreets = [];
  let greetFlushTimer = 0;

  // Hình ảnh avatar cache
  const avatarCache = new Map(); // url -> { img, ok }
  function getAvatarImg(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.startsWith('https://') && !url.startsWith('http://') && !url.startsWith('data:image/')) return null;
    let rec = avatarCache.get(url);
    if (!rec) {
      const img = new Image();
      if (url.startsWith('http')) img.referrerPolicy = 'no-referrer';
      rec = { img, ok: false };
      img.onload = () => { rec.ok = true; };
      img.onerror = () => { rec.bad = true; };
      img.src = url;
      avatarCache.set(url, rec);
      if (avatarCache.size > 240) {
        const firstKey = avatarCache.keys().next().value;
        avatarCache.delete(firstKey);
      }
    }
    return rec.ok ? rec.img : null;
  }

  // ---------- Hệ thống giọng đọc Cô Giáo (1 luồng duy nhất, chống đè tiếng tuyệt đối) ----------
  const mainVoiceQueue = [];
  const chatterQueue = [];
  let voicePlaying = false;
  let currentAudio = null;
  let abortCurrentSeg = null;
  let preDelayTimer = 0;
  let lastVoiceEndAt = 0;
  let holdTimerForVoice = false;
  let holdSafetyUntil = 0;
  let captionTimer = 0;
  let currentCaptionText = '';
  let teacherSpeaking = false;
  let voiceGen = 0;

  function setCaption(text, holdMs = 4500) {
    const clean = String(text || '')
      .replace(/\|\s*[FE]:\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;
    currentCaptionText = clean;
    if (!ui.caption) return;
    ui.caption.textContent = `👩‍🏫 ${clean}`;
    ui.caption.classList.add('on');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => {
      currentCaptionText = '';
      ui.caption?.classList.remove('on');
    }, holdMs);
  }

  let pendingRankPraises = [];

  // Thống nhất 1 giọng Cô Giáo Hoài My duy nhất xuyên suốt toàn bộ lớp học (không tách sang giọng trẻ em Mỹ)
  function parseSpeechSegments(raw) {
    const clean = String(raw || '')
      .replace(/\|\s*[FE]:\s*/gi, ' ')
      .replace(/^[FE]:\s*/i, '')
      .replace(/\|/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return [];
    return [{ v: 'f', text: clean, rate: cfg.lopRate || 1.06 }];
  }

  function buildTtsUrl(seg) {
    const q = new URLSearchParams({
      text: seg.text,
      rate: String(seg.rate || cfg.lopRate || 1.06),
      v: 'f'
    });
    return `/api/tts?${q.toString()}`;
  }

  // Tải trước câu tiếp theo trong lúc Cô Giáo đang đọc câu hiện tại để chuyển câu mượt tức thì, không trễ mạng
  function prefetchSegments(segments, delayMs = 320) {
    if (!segments || !segments.length || typeof fetch !== 'function') return;
    const myGen = voiceGen;
    setTimeout(() => {
      if (myGen !== voiceGen || paused || cfg.mode !== 'lop' || !isMaster || sfx.muted() || !cfg.lopVoice) return;
      for (const seg of segments) {
        try {
          fetch(buildTtsUrl(seg)).then((r) => (r && r.arrayBuffer ? r.arrayBuffer() : null)).catch(() => {});
        } catch { /* ignore */ }
      }
    }, delayMs);
  }

  function clearMainVoice(clearChatter = true) {
    voiceGen += 1;
    mainVoiceQueue.length = 0;
    if (clearChatter) {
      chatterQueue.length = 0;
      pendingRankPraises.length = 0;
    }
    clearTimeout(preDelayTimer);
    preDelayTimer = 0;
    holdTimerForVoice = false;
    if (abortCurrentSeg) {
      const fn = abortCurrentSeg;
      abortCurrentSeg = null;
      try { fn(); } catch { /* ignore */ }
    }
    if (currentAudio) {
      try {
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.onplaying = null;
        currentAudio.onloadedmetadata = null;
        currentAudio.muted = true;
        currentAudio.pause();
        currentAudio.removeAttribute('src');
        currentAudio.load();
      } catch { /* ignore */ }
      currentAudio = null;
    }
    try { window.speechSynthesis?.cancel?.(); } catch { /* ignore */ }
    voicePlaying = false;
    teacherSpeaking = false;
    sfx.duck(false);
    updateCustomMusicVolume();
  }

  function enqueueMainSpeech(text, opts = {}) {
    if (!isMaster) return;
    if (!text) {
      if (opts.onStart) opts.onStart();
      if (opts.onDone) opts.onDone();
      return;
    }
    if (paused || cfg.mode !== 'lop') {
      setCaption(text, 3800);
      opts.onStart?.();
      opts.onDone?.();
      return;
    }
    const isSilent = !cfg.lopVoice || sfx.muted();
    const preDelayMs = Math.max(0, Number(opts.preDelayMs) || 0);
    const segments = isSilent ? [] : parseSpeechSegments(text);
    if (opts.hold) {
      holdTimerForVoice = true;
      holdSafetyUntil = Math.max(holdSafetyUntil, performance.now() + preDelayMs + (isSilent ? 2200 : 32000));
    }
    // Nếu Cô Giáo đang đọc câu trước (vd đọc đề), tải sẵn câu nối tiếp (vd "Bắt đầu!") trong nền để phát mượt 0ms trễ
    if (!isSilent && (voicePlaying || mainVoiceQueue.length > 0)) {
      prefetchSegments(segments, 320);
    }
    mainVoiceQueue.push({
      segments,
      rawText: text,
      silent: isSilent,
      silentMs: opts.go ? 200 : (opts.hold ? 850 : 120),
      preDelayMs,
      hype: Boolean(opts.hype),
      hold: Boolean(opts.hold),
      onStart: opts.onStart || null,
      onDone: opts.onDone || null
    });
    pumpVoice();
  }

  function canPlayChatterItem(item) {
    if (!item) return false;
    if (item.priority) {
      return (phase === 'question' || phase === 'bonus') && boardReady && phaseRemaining > 3.6;
    }
    return isChatterWindow();
  }

  function enqueueChatter(text, priority = false) {
    if (!isMaster || !text) return;
    if (mainVoiceQueue.length > 0) return;
    if (!priority && (voicePlaying || !isChatterWindow())) return;
    if (priority && !((phase === 'question' || phase === 'bonus') && boardReady && phaseRemaining > 3.6)) return;
    chatterQueue.length = 0; // Chỉ giữ tối đa 1 câu tương tác mới nhất, không bao giờ xếp hàng đọc dồn dập
    const segments = parseSpeechSegments(text);
    if (voicePlaying && priority) prefetchSegments(segments, 180);
    chatterQueue.push({
      segments,
      rawText: text,
      priority: Boolean(priority),
      hype: false,
      hold: false,
      preDelayMs: 0
    });
    if (!voicePlaying && canPlayChatterItem(chatterQueue[0])) pumpVoice();
  }

  // Khen mượt người trả lời đúng thứ 2, thứ 3 (gộp gọn nếu cả hai trả lời sát nhau lúc Cô đang khen hạng 1)
  function queueSolverRankPraise(rank, sName) {
    if (!isMaster || !sName || (rank !== 2 && rank !== 3)) return;
    if (mainVoiceQueue.length > 0 || phaseRemaining <= 4.0) return;
    if (!voicePlaying) {
      const single = rank === 2
        ? `Giỏi quá, bạn ${sName} trả lời đúng thứ hai rồi nè!`
        : `Hoan hô bạn ${sName} về đích thứ ba nha!`;
      enqueueChatter(single, true);
      return;
    }
    if (phaseRemaining <= 5.2) return;
    if (!pendingRankPraises.some((x) => x.rank === rank)) {
      pendingRankPraises.push({ rank, name: sName });
      pendingRankPraises.sort((a, b) => a.rank - b.rank);
    }
    let combined = '';
    if (pendingRankPraises.length >= 2) {
      combined = `Bạn ${pendingRankPraises[0].name} đúng thứ hai, bạn ${pendingRankPraises[1].name} về thứ ba, giỏi quá!`;
    } else if (pendingRankPraises[0].rank === 2) {
      combined = `Giỏi quá, bạn ${pendingRankPraises[0].name} trả lời đúng thứ hai rồi nè!`;
    } else {
      combined = `Hoan hô bạn ${pendingRankPraises[0].name} về đích thứ ba nha!`;
    }
    const segments = parseSpeechSegments(combined);
    prefetchSegments(segments, 180);
    chatterQueue.length = 0;
    chatterQueue.push({
      segments,
      rawText: combined,
      priority: true,
      isRankFollowup: true,
      hype: false,
      hold: false,
      preDelayMs: 0
    });
  }

  function speakImmediateWarn(text) {
    if (!isMaster || !text) return;
    setCaption(text, 3400);
    if (!cfg.lopVoice || sfx.muted() || paused || cfg.mode !== 'lop') return;
    if (voicePlaying || mainVoiceQueue.length > 0) return;
    mainVoiceQueue.push({
      segments: parseSpeechSegments(text),
      rawText: text,
      hype: false,
      hold: false,
      preDelayMs: 0
    });
    pumpVoice();
  }

  function isChatterWindow() {
    if (!((phase === 'question' || phase === 'bonus') && boardReady && phaseRemaining > 6.5)) return false;
    return performance.now() - lastVoiceEndAt >= 2600;
  }

  async function playOneSegment(seg, _hype, myGen) {
    if (myGen !== voiceGen || sfx.muted() || paused || cfg.mode !== 'lop') return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = Math.min(1, Math.max(0.15, Number(cfg.volume ?? 0.7)));
    currentAudio = audio;
    await new Promise((resolve) => {
      let settled = false;
      let loadTimer = 0;
      let playTimer = 0;
      const extendSafetyForDuration = () => {
        const dur = Number(audio.duration);
        if (Number.isFinite(dur) && dur > 0) {
          const remainMs = Math.max(0, (dur - (Number(audio.currentTime) || 0)) * 1000);
          holdSafetyUntil = Math.max(holdSafetyUntil, performance.now() + remainMs + 3200);
          clearTimeout(playTimer);
          playTimer = setTimeout(done, Math.min(48000, Math.max(12000, remainMs + 4000)));
        }
      };
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(loadTimer);
        clearTimeout(playTimer);
        if (abortCurrentSeg === cancelNow) abortCurrentSeg = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onplaying = null;
        audio.onloadedmetadata = null;
        resolve();
      };
      const cancelNow = () => {
        try {
          audio.onended = null;
          audio.onerror = null;
          audio.onplaying = null;
          audio.onloadedmetadata = null;
          audio.muted = true;
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        } catch { /* ignore */ }
        done();
      };
      abortCurrentSeg = cancelNow;
      // Chỉ huỷ nếu quá 10 giây mạng chưa tải được tiếng; khi đã phát thì chờ đọc hết trọn câu (tối đa 45s)
      loadTimer = setTimeout(cancelNow, 10000);
      audio.onloadedmetadata = extendSafetyForDuration;
      audio.onplaying = () => {
        clearTimeout(loadTimer);
        loadTimer = 0;
        playTimer = setTimeout(done, 35000);
        extendSafetyForDuration();
      };
      audio.onended = done;
      audio.onerror = cancelNow;
      audio.src = buildTtsUrl(seg);
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(cancelNow);
    });
    if (currentAudio === audio) currentAudio = null;
  }

  async function pumpVoice() {
    if (voicePlaying || paused || cfg.mode !== 'lop' || !isMaster) return;
    let item = mainVoiceQueue.shift() || null;
    if (!item && chatterQueue.length) {
      if (canPlayChatterItem(chatterQueue[0])) {
        item = chatterQueue.shift();
        if (item?.isRankFollowup) pendingRankPraises.length = 0;
      } else if (!chatterQueue[0].priority) {
        chatterQueue.length = 0;
      }
    }
    if (!item) {
      holdTimerForVoice = false;
      teacherSpeaking = false;
      sfx.duck(false);
      updateCustomMusicVolume();
      return;
    }
    const myGen = voiceGen;
    voicePlaying = true;
    try { item.onStart?.(); } catch { /* ignore */ }
    if (myGen !== voiceGen || paused || cfg.mode !== 'lop') return;

    // Đợi tiếng trống trường / chuông / vỗ tay dứt hẳn rồi Cô Giáo mới cất giọng đọc
    if (item.preDelayMs > 0) {
      await new Promise((resolve) => {
        preDelayTimer = setTimeout(() => { preDelayTimer = 0; resolve(); }, item.preDelayMs);
      });
      if (myGen !== voiceGen || paused || cfg.mode !== 'lop') return;
    }

    const useAudio = !item.silent && cfg.lopVoice && !sfx.muted();
    teacherSpeaking = useAudio;
    if (useAudio) {
      sfx.duck(true);
      updateCustomMusicVolume();
    }
    if (item.rawText) {
      setCaption(item.rawText, Math.min(14000, Math.max(3800, item.rawText.length * 72)));
      emitSync(false);
    }

    if (useAudio) {
      for (const seg of item.segments) {
        if (myGen !== voiceGen || paused || cfg.mode !== 'lop' || sfx.muted()) break;
        await playOneSegment(seg, item.hype, myGen);
      }
    } else if (item.silentMs > 0) {
      await new Promise((r) => setTimeout(r, item.silentMs));
    }
    if (myGen !== voiceGen || paused || cfg.mode !== 'lop') return;

    lastVoiceEndAt = performance.now();
    try { item.onDone?.(); } catch { /* ignore */ }
    if (myGen !== voiceGen) return;

    voicePlaying = false;
    if (!mainVoiceQueue.some((x) => x.hold)) holdTimerForVoice = false;
    if (mainVoiceQueue.length || (chatterQueue.length && canPlayChatterItem(chatterQueue[0]))) {
      pumpVoice();
    } else {
      teacherSpeaking = false;
      sfx.duck(false);
      updateCustomMusicVolume();
    }
  }

  // ---------- Nhạc nền tuỳ chỉnh (Link YouTube / MP3 / File trên máy) ----------
  const customAudio = new Audio();
  let ytWrap = null;
  let curCustomKey = '';
  let customPaused = false;

  function parseYouTubeId(input) {
    const s = String(input || '').trim();
    const m = s.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    return m ? m[1] : '';
  }

  function ensureYtWrap() {
    if (ytWrap) return ytWrap;
    ytWrap = document.createElement('div');
    ytWrap.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;overflow:hidden';
    document.body.appendChild(ytWrap);
    return ytWrap;
  }

  function stopCustomMusic() {
    curCustomKey = '';
    try { customAudio.pause(); customAudio.removeAttribute('src'); } catch { /* ignore */ }
    if (ytWrap) ytWrap.replaceChildren();
  }

  function updateCustomMusicVolume() {
    if (!curCustomKey || customAudio.paused) return;
    const baseVol = Math.min(1, Math.max(0, Number(cfg.volume ?? 0.7) * Number(cfg.lopMusicVolume ?? 0.25)));
    customAudio.volume = teacherSpeaking ? baseVol * 0.2 : baseVol;
  }

  function syncCustomMusic() {
    const list = Array.isArray(cfg.lopMusicList) && cfg.lopMusicList.length
      ? cfg.lopMusicList
      : (cfg.customLopMusic ? [cfg.customLopMusic] : []);
    const want = cfg.mode === 'lop' && cfg.lopSoundscape === 'custom' && list.length > 0 && cfg.sound && !sfx.muted() && !paused && !customPaused;
    if (!want) {
      stopCustomMusic();
      return;
    }
    const idx = Math.max(0, Math.min(list.length - 1, Number(cfg.lopMusicIndex) || 0));
    const item = String(list[idx] || '').trim();
    if (!item) { stopCustomMusic(); return; }
    const ytId = parseYouTubeId(item);
    const key = `${idx}|${item}`;
    const baseVol = Math.min(1, Math.max(0, Number(cfg.volume ?? 0.7) * Number(cfg.lopMusicVolume ?? 0.25)));
    const vol = teacherSpeaking ? baseVol * 0.2 : baseVol;
    if (ytId) {
      if (curCustomKey !== key) {
        stopCustomMusic();
        curCustomKey = key;
        const iframe = document.createElement('iframe');
        iframe.allow = 'autoplay';
        iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&controls=0`;
        ensureYtWrap().replaceChildren(iframe);
      }
      return;
    }
    if (ytWrap) ytWrap.replaceChildren();
    const src = /^https?:\/\//i.test(item) ? item : `/lopmusic/${idx}?v=${encodeURIComponent(item)}`;
    if (curCustomKey !== key) {
      curCustomKey = key;
      customAudio.src = src;
      customAudio.loop = list.length === 1 && cfg.lopMusicLoop !== false;
      customAudio.onended = () => {
        if (list.length > 1) {
          cfg.lopMusicIndex = (idx + 1) % list.length;
          curCustomKey = '';
          syncCustomMusic();
        } else if (cfg.lopMusicLoop !== false) {
          customAudio.currentTime = 0;
          customAudio.play().catch(() => {});
        }
      };
    }
    customAudio.volume = vol;
    if (customAudio.paused) customAudio.play().catch(() => {});
  }

  // ---------- Đồng bộ sổ lớp (`/api/lop/save` & `/api/lop/attend`) ----------
  let saveLoadPromise = null;
  function loadSave() {
    if (saveLoadPromise) return saveLoadPromise;
    saveLoaded = true;
    saveLoadPromise = (async () => {
      try {
        const r = await fetch('/api/lop/save').then((x) => x.json());
        if (Array.isArray(r.used)) r.used.forEach((id) => savedUsed.add(id));
        if (Array.isArray(r.banned)) r.banned.forEach((id) => savedBanned.add(id));
        if (Array.isArray(r.weekTop)) weekTop = r.weekTop;
        if (Array.isArray(r.todayTop)) todayTop = r.todayTop;
      } catch { /* offline / standalone */ }
    })();
    return saveLoadPromise;
  }

  async function saveProgress(payload) {
    if (!isMaster) return;
    try {
      const r = await fetch('/api/lop/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then((x) => x.json());
      if (Array.isArray(r.weekTop)) weekTop = r.weekTop;
      if (Array.isArray(r.todayTop)) todayTop = r.todayTop;
    } catch { /* ignore */ }
  }

  async function markAttendance(p) {
    if (!isMaster || !p || p.attendChecked || p.isDemo) return;
    p.attendChecked = true;
    try {
      const r = await fetch('/api/lop/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: p.uid, nickname: p.nickname })
      }).then((x) => x.json());
      if (Number(r.days) > 0) p.attendDays = Number(r.days);
      if (r.fresh && p.attendDays >= 2) {
        const sName = DATA().speakableName(p.nickname);
        if (ATTEND_MILESTONES.has(p.attendDays)) {
          const rw = giveDeskReward(p);
          enqueueChatter(pickLine('attendMilestone', sName, p.attendDays, rw.name), true);
          pushToast('🎒', `<b>${p.nickname}</b> chuyên cần ${p.attendDays} ngày liền! Thưởng ${rw.icon}`, true);
        } else {
          enqueueChatter(pickLine('attendBack', sName, p.attendDays), false);
        }
      }
    } catch { /* ignore */ }
  }

  // ---------- Toast & Thẻ vinh danh quà ----------
  let plateTimer = 0;
  function pushToast(ico, htmlText, gold = false) {
    if (!ui.toasts) return;
    const node = document.createElement('div');
    node.className = 'l-toast' + (gold ? ' gold' : '');
    const spIco = document.createElement('span');
    spIco.className = 'lt-ico';
    spIco.textContent = ico;
    const spTxt = document.createElement('span');
    spTxt.className = 'lt-text';
    spTxt.innerHTML = htmlText;
    node.append(spIco, spTxt);
    ui.toasts.appendChild(node);
    requestAnimationFrame(() => node.classList.add('on'));
    while (ui.toasts.children.length > 2) ui.toasts.firstChild.remove();
    setTimeout(() => {
      node.classList.remove('on');
      setTimeout(() => node.remove(), 280);
    }, 3400);
  }

  function showGiftPlate(user, giftText) {
    if (!ui.plate) return;
    const av = ui.plate.querySelector('.np-av');
    const nm = ui.plate.querySelector('.np-name');
    const gf = ui.plate.querySelector('.np-gift');
    av.replaceChildren();
    if (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image/'))) {
      const img = document.createElement('img');
      img.src = user.avatar;
      if (user.avatar.startsWith('http')) img.referrerPolicy = 'no-referrer';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
      av.appendChild(img);
    } else {
      av.textContent = '💐';
    }
    nm.textContent = user?.nickname || 'Học sinh';
    gf.textContent = giftText;
    ui.plate.classList.add('on');
    clearTimeout(plateTimer);
    plateTimer = setTimeout(() => ui.plate?.classList.remove('on'), 3800);
  }

  // ---------- Quản lý học sinh & xếp chỗ 4 bàn dài (7+7+8+8 = 30) + 60 đứng cửa ----------
  function hashStr(s) {
    let h = 2166136261;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function ensurePlayer(user, isDemo = false) {
    const uid = String(user?.id || user?.uniqueId || user?.nickname || ('u-' + Math.random().toString(36).slice(2, 8)));
    let p = players.get(uid);
    const nick = DATA().maskBanned(String(user?.nickname || user?.uniqueId || 'Bạn nhỏ').trim()).slice(0, 28) || 'Bạn nhỏ';
    if (!p) {
      const h = hashStr(uid);
      p = {
        uid,
        nickname: nick,
        avatar: String(user?.avatar || ''),
        score: 0,
        totalScore: 0,
        streak: 0,
        hairIdx: h % 10,
        hairColor: HAIR_COLORS[(h >>> 4) % HAIR_COLORS.length],
        tint: UNIFORM_TINTS[(h >>> 8) % UNIFORM_TINTS.length],
        joinedAt: Date.now(),
        lastActive: Date.now(),
        firstScoredAt: Infinity,
        deskGifts: [],     // ['🍭', '🧁', '🎂']
        bubbleText: '',
        bubbleUntil: 0,
        celebrateUntil: 0,
        wrongUntil: 0,
        sleeping: false,
        attendDays: 0,
        attendChecked: false,
        isDemo: Boolean(isDemo),
        seatX: W * 0.5,
        seatY: H * 0.85,
        curX: (h % 2 === 0) ? 46 : W - 46,
        curY: 1180 + (h % 220)
      };
      players.set(uid, p);
      recomputeSeating();
    } else {
      p.nickname = nick || p.nickname;
      if (user?.avatar) p.avatar = user.avatar;
      p.lastActive = Date.now();
      p.sleeping = false;
    }
    if (p.avatar) getAvatarImg(p.avatar);
    return p;
  }

  function recomputeSeating() {
    const all = [...players.values()];
    all.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.score > 0 && a.firstScoredAt !== b.firstScoredAt) return a.firstScoredAt - b.firstScoredAt;
      return a.joinedAt - b.joinedAt;
    });
    benchOrder = all.slice(0, MAX_SEATS).map((p) => p.uid);
    standingOrder = all.slice(MAX_SEATS, MAX_SEATS + MAX_STANDING).map((p) => p.uid);

    // Cập nhật Lớp trưởng tiết hiện tại
    const top = all[0];
    if (top && top.score > 0 && top.uid !== currentMonitorUid) {
      const hadPrev = Boolean(currentMonitorUid);
      currentMonitorUid = top.uid;
      if (hadPrev && qIndex >= 2) {
        enqueueChatter(pickLine('newMonitor', DATA().speakableName(top.nickname)), true);
      }
    }
    const activeNow = all.filter((p) => Date.now() - p.lastActive < 180000).length;
    if (activeNow > peakActive) peakActive = activeNow;
  }

  function seatPositionOf(seatIdx) {
    // 4 bàn gỗ dài: [7, 7, 8, 8]
    let rem = seatIdx;
    for (let b = 0; b < BENCH_SIZES.length; b++) {
      const cnt = BENCH_SIZES[b];
      if (rem < cnt) {
        const left = 132;
        const right = W - 132;
        const step = (right - left) / (cnt - 1);
        return { x: left + rem * step, y: BENCH_YS[b], bench: b, col: rem };
      }
      rem -= cnt;
    }
    return { x: W / 2, y: BENCH_YS[3], bench: 3, col: 0 };
  }

  function standingPositionOf(stIdx) {
    const leftSide = stIdx % 2 === 0;
    const row = Math.floor(stIdx / 2);
    const x = leftSide ? (38 + (row % 2) * 26) : (W - 38 - (row % 2) * 26);
    const y = 956 + Math.min(29, row) * 22;
    return { x, y, leftSide, front: stIdx < 6 };
  }

  function giveDeskReward(p, customIcon, customName) {
    const rw = customIcon
      ? { icon: customIcon, name: customName || 'một món quà' }
      : (pickRand(DATA().REWARDS) || { icon: '🍭', name: 'một cây kẹo mút' });
    if (p) {
      p.deskGifts.push(rw.icon);
      if (p.deskGifts.length > 5) p.deskGifts.shift();
      flyingGifts.push({
        icon: rw.icon,
        fromX: 540,
        fromY: 655,
        toUid: p.uid,
        t: 0,
        dur: 1.05
      });
    }
    return rw;
  }

  // ---------- Kho câu hỏi & Lập kế hoạch Tiết học 20 câu ----------
  function parseCustomQuestions() {
    const raw = String(cfg.lopCustomWords || '').trim();
    if (!raw) return [];
    const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    const out = [];
    lines.forEach((line, idx) => {
      const parts = line.split('|').map((x) => x.trim()).filter(Boolean);
      if (!parts.length) return;
      let answer = '', clue = '', category = 'Tự chọn';
      if (parts.length === 1) {
        answer = parts[0];
        clue = 'Sắp xếp các chữ cái trên bảng thành từ đúng.';
      } else if (parts.length === 2) {
        // Hỗ trợ cả "Đáp án | Gợi ý" lẫn "Chủ đề | Đáp án" (tự nhận diện bên nào dài hơn làm gợi ý)
        if (parts[1].split(/\s+/).length >= 4) {
          answer = parts[0];
          clue = parts[1];
        } else {
          category = parts[0];
          answer = parts[1];
          clue = `Từ thuộc chủ đề ${category}.`;
        }
      } else {
        answer = parts[0];
        clue = parts[1];
        category = parts[2];
      }
      const cleanAns = answer.normalize('NFC').toUpperCase().replace(/\s+/g, ' ').trim();
      const flat = lettersOf(cleanAns);
      if (flat.length < 2 || flat.length > 16) return;
      out.push({
        id: `custom:${idx}:${cleanAns}`,
        answer: cleanAns,
        clue: clue || `Từ thuộc chủ đề ${category}.`,
        category,
        kind: `Đây là câu hỏi chủ đề ${category}.`,
        difficulty: flat.length <= 5 ? 'easy' : flat.length <= 9 ? 'medium' : 'hard',
        slot: '',
        acceptedAnswers: [cleanAns]
      });
    });
    return out;
  }

  const SLANG_LOANWORDS = new Set([
    'DEADLINE', 'SELFIE', 'EMOJI', 'CRUSH', 'CHILL', 'SEEN', 'MAKEUP', 'NAIL', 'NOOB', 'PRO', 'LAG',
    'FOLLOW', 'SHARE', 'IDOL', 'CARRY', 'GANK', 'FEED', 'AFK', 'SLAY', 'GHOST', 'HEALING', 'SKINCARE',
    'TAROT', 'TOXIC', 'FLEX', 'HASHTAG', 'VIRAL', 'FILTER', 'STORY', 'ANTI FAN', 'CHECK IN', 'FREESHIP',
    'BLUETOOTH', 'INSTAGRAM', 'LIVESTREAM', 'PASS WIFI', 'QR CODE', 'CHATGPT', 'VALENTINE', 'HALLOWEEN',
    'TETRIS', 'BOXING', 'GAME ONLINE', 'WORLD CUP', 'OLYMPIC', 'KANGAROO', 'ARGENTINA', 'INDONESIA',
    'MALAYSIA', 'SINGAPORE', 'SHIPPER', 'STREAMER', 'YOUTUBER', 'TIKTOKER', 'FANSIPAN', 'VITAMIN',
    'EMAIL', 'CAMERA', 'INTERNET', 'FACEBOOK', 'YOUTUBE', 'USB', 'GPS', 'MV', 'DJ', 'MC', 'AXIT', 'OXY'
  ]);

  function wordCountOf(answer) {
    return String(answer || '').trim().split(/\s+/).filter(Boolean).length;
  }

  function isFriendlyWord(q) {
    if (!q) return false;
    if (String(q.id || '').startsWith('custom:')) return true;
    if (q.slot || SLANG_LOANWORDS.has(q.answer)) return false;
    const wc = wordCountOf(q.answer);
    const nChars = [...lettersOf(q.answer)].length;
    return wc >= 1 && wc <= 2 && nChars >= 2 && nChars <= 7;
  }

  function buildRoundDeck() {
    const customList = parseCustomQuestions();
    const bank = DATA().QUESTIONS || [];
    const onlyCustom = cfg.lopTopic === 'custom' && customList.length > 0;
    const basePool = onlyCustom ? customList : [...customList, ...bank];

    const chosenIds = new Set();
    const preferredCat = (cfg.lopTopic && cfg.lopTopic !== 'all' && cfg.lopTopic !== 'custom')
      ? cfg.lopTopic
      : votedTopic;

    const pickWord = (filterFn, fallbackFn) => {
      let cands = basePool.filter((q) => !savedBanned.has(q.id) && !chosenIds.has(q.id) && filterFn(q));
      if (!reviewMode) {
        const unused = cands.filter((q) => !savedUsed.has(q.id));
        if (unused.length) cands = unused;
      } else {
        const usedOnes = cands.filter((q) => savedUsed.has(q.id));
        if (usedOnes.length >= 5) cands = usedOnes;
      }
      if (!cands.length && fallbackFn) {
        cands = basePool.filter((q) => !savedBanned.has(q.id) && !chosenIds.has(q.id) && fallbackFn(q));
      }
      if (!cands.length) {
        // Nếu đã dùng hết sạch kho -> xoá used để quay vòng mới
        savedUsed.clear();
        saveProgress({ used: [], replaceUsed: true });
        cands = basePool.filter((q) => !savedBanned.has(q.id) && !chosenIds.has(q.id) && (fallbackFn ? fallbackFn(q) : true));
        if (!cands.length) {
          cands = basePool.filter((q) => !savedBanned.has(q.id) && !chosenIds.has(q.id));
        }
      }
      const picked = pickRand(cands);
      if (picked) chosenIds.add(picked.id);
      return picked;
    };

    // Chọn trước tối đa 5 vị trí ưu tiên cho chủ đề được vote / chọn
    const topicSlots = new Set();
    if (preferredCat && !onlyCustom) {
      const wordIndices = [0, 1, 3, 5, 7, 10, 12, 15, 17, 19];
      while (topicSlots.size < 5 && wordIndices.length) {
        const idx = wordIndices.splice(Math.floor(Math.random() * wordIndices.length), 1)[0];
        topicSlots.add(idx);
      }
    }

    const deck = [];
    for (let i = 0; i < ROUND_PLAN.length; i++) {
      const slotType = ROUND_PLAN[i];
      if (slotType.startsWith('math') && cfg.lopMathEnabled !== false && !onlyCustom) {
        const lv = Number(slotType.slice(4)) || 1;
        deck.push(makeMathQuestion(lv));
        continue;
      }
      if ((slotType === 'anh' || slotType === 'meo' || slotType === 'su') && !onlyCustom && (!cfg.lopTopic || cfg.lopTopic === 'all')) {
        let sp = null;
        if (slotType === 'anh') {
          sp = pickWord(
            (q) => q.slot === 'anh' && q.difficulty === 'easy' && wordCountOf(q.answer) === 1 && [...lettersOf(q.answer)].length <= 6,
            (q) => q.slot === 'anh' && q.difficulty === 'easy'
          );
        } else if (slotType === 'meo') {
          sp = pickWord(
            (q) => q.slot === 'meo' && wordCountOf(q.answer) <= 2 && [...lettersOf(q.answer)].length <= 7,
            (q) => q.slot === 'meo' && wordCountOf(q.answer) <= 2
          );
        } else {
          sp = pickWord(
            (q) => q.slot === 'su' && q.difficulty === 'easy' && wordCountOf(q.answer) <= 2 && [...lettersOf(q.answer)].length <= 8,
            (q) => q.slot === 'su' && q.difficulty !== 'hard' && wordCountOf(q.answer) <= 2
          );
        }
        if (sp) { deck.push(sp); continue; }
      }
      const diff = slotType === 'medium' ? 'medium' : 'easy';
      const wantTopic = (cfg.lopTopic && cfg.lopTopic !== 'all' && cfg.lopTopic !== 'custom')
        ? cfg.lopTopic
        : (topicSlots.has(i) ? preferredCat : '');
      let q = null;
      if (onlyCustom) {
        q = pickWord((x) => String(x.id || '').startsWith('custom:'), () => true);
      } else if (wantTopic) {
        q = pickWord(
          (x) => !x.slot && x.category === wantTopic && x.difficulty !== 'hard' && !SLANG_LOANWORDS.has(x.answer) && wordCountOf(x.answer) <= 2 && [...lettersOf(x.answer)].length <= 8,
          (x) => !x.slot && x.category === wantTopic && x.difficulty !== 'hard'
        ) || pickWord((x) => !x.slot && x.category === wantTopic, (x) => isFriendlyWord(x));
      } else if (diff === 'easy') {
        q = pickWord(
          (x) => isFriendlyWord(x) && x.difficulty === 'easy',
          (x) => isFriendlyWord(x) && x.difficulty !== 'hard'
        );
      } else {
        q = pickWord(
          (x) => isFriendlyWord(x) && (x.difficulty === 'easy' || x.difficulty === 'medium'),
          (x) => !x.slot && x.difficulty !== 'hard' && wordCountOf(x.answer) <= 2
        );
      }
      if (q) deck.push(q);
    }
    return deck;
  }

  function greetingByHour() {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return pickLine('timeMorning');
    if (h >= 11 && h < 14) return pickLine('timeNoon');
    if (h >= 14 && h < 18) return pickLine('timeAfternoon');
    if (h >= 18 && h < 22) return pickLine('timeEvening');
    return pickLine('timeNight');
  }

  // ---------- Điều phối vòng đời Tiết học ----------
  function startNewRound(fromVoteTopic = '') {
    clearMainVoice();
    chatterQueue.length = 0;
    roundNum += 1;
    votedTopic = fromVoteTopic || '';
    // Kiểm tra phòng vắng > 5 phút -> sang chế độ Ôn bài
    reviewMode = roundNum > 1 && (Date.now() - lastActivityAt > 300000);

    // Reset điểm tiết để ai cũng có cơ hội giành ghế Lớp Trưởng
    for (const p of players.values()) {
      p.score = 0;
      p.streak = 0;
      p.firstScoredAt = Infinity;
    }
    currentMonitorUid = '';
    recomputeSeating();

    roundQuestions = buildRoundDeck();
    roundQuestionStats = [];
    qIndex = -1;
    curQ = null;
    recessState = null;
    voteState = null;
    phase = 'intro';
    phaseDuration = 5.5;
    phaseRemaining = 5.5;
    boardReady = true;

    sfx.play('schoolDrum', 1);
    spawnConfetti(32);

    const showWeek = roundNum % 2 === 0 && weekTop.length > 0;
    let introSpeech = '';
    if (reviewMode) {
      introSpeech = pickLine('reviewIntro');
    } else if (showWeek) {
      const topName = DATA().speakableName(weekTop[0].nickname);
      const ordLabels = ['nhất', 'hạng nhì', 'hạng ba', 'hạng tư', 'hạng năm'];
      const followWeek = weekTop.slice(1, 5).map((u, i) => `${ordLabels[i + 1]} là ${DATA().speakableName(u.nickname)} ${u.score} điểm`);
      const weekFollowTxt = followWeek.length ? ` Theo sau trên bảng tuần: ${followWeek.join(', ')}.` : '';
      introSpeech = `${pickLine('weekBoard', topName)}${weekFollowTxt} ${pickLine('intro')}`;
    } else if (roundNum === 1) {
      introSpeech = `${greetingByHour()} ${pickLine('intro')}`;
    } else if (votedTopic) {
      introSpeech = `${pickLine('voteResult', votedTopic)} ${pickLine('intro')}`;
    } else if (todayTop.length >= 2) {
      const ordToday = ['dẫn đầu đang là', 'hạng nhì', 'hạng ba'];
      const topTodayTxt = todayTop.slice(0, 3).map((u, i) => `${ordToday[i]} ${DATA().speakableName(u.nickname)}`).join(', ');
      introSpeech = `Bảng xuất sắc hôm nay: ${topTodayTxt}. ${pickLine('intro')}`;
    } else {
      introSpeech = pickLine('intro');
    }
    enqueueMainSpeech(introSpeech, { hold: true, hype: true, preDelayMs: 900 });
    emitState();
  }

  function spokenAns(q) {
    return String(q?.answer || '').normalize('NFC').toLowerCase();
  }

  function formatQuestionWinnersSpeech(list) {
    if (!list || !list.length) return '';
    const names = list.slice(0, 5).map((x) => DATA().speakableName(x.nickname));
    if (list.length === 1) return pickLine('revealTop', names[0]);
    if (list.length === 2) {
      return `Về nhất câu này là bạn ${names[0]}, trả lời đúng thứ hai là bạn ${names[1]}!`;
    }
    if (list.length === 3) {
      return `Về nhất là bạn ${names[0]}, đúng thứ hai là bạn ${names[1]}, và thứ ba là bạn ${names[2]}!`;
    }
    if (list.length === 4) {
      return `Về nhất là bạn ${names[0]}, thứ hai là ${names[1]}, thứ ba là ${names[2]}, và thứ tư là bạn ${names[3]}!`;
    }
    const tail = list.length > 5
      ? `, thứ năm là ${names[4]}, cùng tổng cộng ${list.length} bạn trả lời đúng!`
      : `, và thứ năm là bạn ${names[4]}!`;
    return `Về nhất là bạn ${names[0]}, thứ hai là ${names[1]}, thứ ba là ${names[2]}, thứ tư là ${names[3]}${tail}`;
  }

  function startQuestion(nextIdx) {
    clearMainVoice();
    chatterQueue.length = 0;
    loveSession = null;
    activePoll = null;
    qIndex = nextIdx;
    if (qIndex >= roundQuestions.length) {
      enterResults();
      return;
    }
    curQ = roundQuestions[qIndex];
    const isGolden = qIndex === roundQuestions.length - 1;
    phase = 'question';
    const baseSec = Math.min(90, Math.max(10, Number(cfg.lopQuestionSec) || 20));
    phaseDuration = baseSec;
    phaseRemaining = baseSec;
    boardReady = false;
    halfQuietSaid = false;
    fiveSecWarned = false;
    lastWholeSec = 99;

    qAttempts.clear();
    qSolvedUids.clear();
    qCorrectList = [];
    qWrongList = [];
    qCommentCount = 0;
    fastestThree = [];
    revealedIdx.clear();

    if (curQ.kind === 'math') {
      scrambledGroups = [];
      answerWords = [curQ.answer];
      answerFlat = curQ.answer;
    } else {
      answerWords = curQ.answer.normalize('NFC').toUpperCase().trim().split(/\s+/).filter(Boolean);
      answerFlat = lettersOf(curQ.answer);
      scrambledGroups = scrambleWords(curQ.answer);
      // Với từ dài >= 7 chữ cái, mở sẵn chữ cái đầu tiên làm gợi ý để học sinh dễ đoán nhanh hơn
      if ([...answerFlat].length >= 7) {
        revealedIdx.add(0);
      }
      if (!reviewMode && !String(curQ.id).startsWith('custom:')) {
        savedUsed.add(curQ.id);
        saveProgress({ used: [curQ.id] });
      }
    }

    // Lời đọc đề tự nhiên, liền mạch bằng 1 giọng Cô Giáo duy nhất
    const qNum = qIndex + 1;
    let lead = `Câu ${qNum}.`;
    if (isGolden) lead = `${pickLine('goldenIntro')} Câu ${qNum}.`;
    if (curQ.kind === 'math') {
      const mIntro = pickLine('mathIntro');
      enqueueMainSpeech(`${lead} ${mIntro} ${curQ.mathSpeech}`, { hold: true, hype: isGolden });
    } else {
      const nChars = [...answerFlat].length;
      const sizeNote = answerWords.length > 1
        ? `Từ này gồm ${answerWords.length} tiếng, ${nChars} chữ cái.`
        : `Từ này có ${nChars} chữ cái.`;
      let kindNote = curQ.kind || '';
      if (curQ.slot === 'meo') kindNote = 'Câu đố mẹo vui nè!';
      else if (curQ.slot === 'su') kindNote = 'Câu hỏi lịch sử Việt Nam:';
      else if (curQ.slot === 'anh') kindNote = 'Đố từ tiếng Anh nè:';
      const rawClue = String(curQ.clue || '').trim();
      const askTail = /\?\s*$/.test(rawClue)
        ? ''
        : (curQ.slot === 'anh' ? ' Đố cả lớp là từ tiếng Anh nào?' : ' Đố cả lớp là chữ gì nào?');
      enqueueMainSpeech(`${lead} ${kindNote} ${sizeNote} ${rawClue}${askTail}`, {
        hold: true,
        hype: isGolden
      });
    }
    // Ngay khi đọc đề xong -> mở bảng ô chữ + hiệu lệnh trống/chuông ngắn rồi hô "Bắt đầu!" (đã prefetch sẵn)
    enqueueMainSpeech(pickLine('go') || 'Bắt đầu!', {
      hold: false,
      hype: true,
      go: true,
      preDelayMs: 180,
      onStart: () => {
        showBoardNow();
      }
    });
    emitState();
  }

  function showBoardNow() {
    if (boardReady) return;
    boardReady = true;
    holdTimerForVoice = false;
    sfx.play('startGo', teacherSpeaking ? 0.45 : 1);
    emitState();
  }

  function revealOneHintLetter() {
    if (!curQ || curQ.kind === 'math') return false;
    const chars = [...answerFlat];
    const unrevealed = [];
    for (let i = 0; i < chars.length; i++) {
      if (!revealedIdx.has(i)) unrevealed.push(i);
    }
    if (unrevealed.length <= 1) return false;
    // Ưu tiên mở chữ cái đầu của tiếng thứ 1, rồi chữ cái đầu của tiếng thứ 2, sau đó mới ngẫu nhiên
    let pickIdx = -1;
    if (!revealedIdx.has(0)) {
      pickIdx = 0;
    } else if (answerWords.length > 1) {
      const secondWordIdx = [...answerWords[0]].length;
      if (secondWordIdx < chars.length && !revealedIdx.has(secondWordIdx)) {
        pickIdx = secondWordIdx;
      }
    }
    if (pickIdx < 0) {
      pickIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    }
    revealedIdx.add(pickIdx);
    sfx.play('correctDing', teacherSpeaking ? 0.35 : 0.75);
    return true;
  }

  function enterBonus() {
    if (!curQ) return;
    clearMainVoice();
    phase = 'bonus';
    phaseDuration = 10;
    phaseRemaining = 10;
    fiveSecWarned = false;
    lastWholeSec = 99;
    boardReady = true;
    if (curQ.kind === 'math') {
      enqueueMainSpeech(pickLine('mathBonus', curQ.mathSpeech), { hold: false, hype: true });
    } else {
      revealOneHintLetter();
      enqueueMainSpeech(pickLine('bonus'), { hold: false, hype: true, preDelayMs: 240 });
    }
    emitState();
  }

  function enterReveal() {
    if (!curQ) return;
    clearMainVoice();
    chatterQueue.length = 0;
    loveSession = null;
    activePoll = null;
    phase = 'reveal';
    phaseDuration = 6.8;
    phaseRemaining = 6.8;
    boardReady = true;

    const isGolden = qIndex === roundQuestions.length - 1;
    const mult = isGolden ? 2 : 1;

    // Xếp hạng người giải đúng theo createTime
    qCorrectList.sort((a, b) => a.createTime - b.createTime);
    const scoreDeltas = [];
    const correctUids = new Set();

    qCorrectList.forEach((entry, rankIdx) => {
      const basePts = rankIdx < SCORE_RANK.length ? SCORE_RANK[rankIdx] : 1;
      let pts = basePts * mult;
      const p = players.get(entry.uid);
      correctUids.add(entry.uid);
      if (p) {
        p.streak = (p.streak || 0) + 1;
        if (p.streak > 0 && p.streak % 3 === 0) {
          pts += 5;
          entry.streakBonus = true;
        }
        if (p.score === 0 && p.firstScoredAt === Infinity) p.firstScoredAt = Date.now() + rankIdx;
        p.score += pts;
        p.totalScore += pts;
        p.celebrateUntil = Date.now() + 4500;
        scoreDeltas.push({ username: p.uid, nickname: p.nickname, avatar: p.avatar, delta: pts });
      }
      entry.points = pts;
    });

    // Reset streak của người không giải đúng câu này
    for (const p of players.values()) {
      if (!correctUids.has(p.uid)) p.streak = 0;
    }

    fastestThree = qCorrectList.slice(0, 3);
    recomputeSeating();

    // Lưu thống kê câu hỏi + điểm tuần/ngày
    roundQuestionStats.push({
      id: curQ.id,
      answer: curQ.answer,
      clue: curQ.clue,
      category: curQ.category,
      attempts: qAttempts.size,
      correct: qCorrectList.length
    });
    if (scoreDeltas.length) saveProgress({ scores: scoreDeltas });

    const plainMathPrompt = curQ.mathPromptPlain || String(curQ.mathExpr || '').replace('= ?', '').trim();
    const ansSpoken = spokenAns(curQ);

    if (qCorrectList.length > 0) {
      sfx.play('revealFanfare', 1);
      spawnConfetti(isGolden ? 55 : 22);
      const w0 = players.get(qCorrectList[0].uid);
      const topSpeak = DATA().speakableName(qCorrectList[0].nickname);
      const winnersSpeech = formatQuestionWinnersSpeech(qCorrectList);

      let line = '';
      if (curQ.kind === 'math') {
        line = pickLine('mathReveal', plainMathPrompt, curQ.answer, winnersSpeech);
      } else if (curQ.slot === 'anh') {
        line = pickLine('englishReveal', ansSpoken, winnersSpeech);
      } else if (curQ.slot === 'meo') {
        line = pickLine('riddleReveal', ansSpoken, winnersSpeech);
      } else if (curQ.slot === 'su') {
        line = pickLine('historyReveal', ansSpoken, winnersSpeech);
      } else {
        line = pickLine('reveal', ansSpoken, winnersSpeech);
      }

      // Thưởng quà đặt lên bàn cho người nhanh nhất / chuỗi 3 câu / câu vàng
      if (w0) {
        if (isGolden) {
          const rw = giveDeskReward(w0);
          line += ' ' + pickLine('goldenGift', topSpeak, rw.name);
        } else if (qCorrectList[0].streakBonus) {
          const rw = giveDeskReward(w0);
          line += ' ' + pickLine('streakGift', topSpeak, rw.name);
        } else if (Math.random() < 0.4) {
          const rw = giveDeskReward(w0);
          line += ' ' + pickLine('firstCorrectGift', topSpeak, rw.name);
        }
      }
      enqueueMainSpeech(line, { hold: true, hype: true, preDelayMs: 420 });
    } else {
      sfx.play('wrongPop', 1);
      let line = '';
      if (curQ.kind === 'math') line = pickLine('mathNobody', plainMathPrompt, curQ.answer);
      else if (curQ.slot === 'anh') line = pickLine('englishNobody', ansSpoken);
      else if (curQ.slot === 'meo') line = pickLine('riddleNobody', ansSpoken);
      else line = pickLine('revealNobody', ansSpoken);
      enqueueMainSpeech(line, { hold: true, preDelayMs: 220 });
    }

    // Trêu vui 1 bạn đoán sai khi lớp ít người giải đúng (tránh kéo dài khi đã đọc nhiều bạn về đích)
    const pureWrong = qWrongList.filter((w) => !correctUids.has(w.uid));
    if (pureWrong.length > 0 && qCorrectList.length <= 1 && Math.random() < 0.5) {
      const target = pickRand(pureWrong);
      const tSpeak = DATA().speakableName(target.nickname);
      const p = players.get(target.uid);
      if (p && podiumPunished.length < 2 && Math.random() < 0.32 && !podiumPunished.some((x) => x.uid === p.uid)) {
        podiumPunished.push({
          uid: p.uid,
          nickname: p.nickname,
          avatar: p.avatar,
          hairIdx: p.hairIdx,
          hairColor: p.hairColor,
          until: Date.now() + 45000
        });
        enqueueMainSpeech(pickLine('roastStand', tSpeak), { hold: true });
      } else if (curQ.kind === 'math') {
        enqueueMainSpeech(pickLine('mathWrong', tSpeak), { hold: true });
      } else if (curQ.slot === 'meo') {
        enqueueMainSpeech(pickLine('riddleWrong', tSpeak), { hold: true });
      } else {
        enqueueMainSpeech(pickLine('roastWrong', tSpeak), { hold: true });
      }
    }
    emitState();
  }

  function enterPraise() {
    clearMainVoice();
    phase = 'praise';
    phaseDuration = 8;
    phaseRemaining = 8;
    boardReady = true;

    const allRanked = benchOrder.map((uid) => players.get(uid)).filter((p) => p && p.score > 0);
    const ranked = allRanked.slice(0, 3);
    if (!ranked.length) {
      startQuestion(qIndex + 1);
      return;
    }
    sfx.play('classClap', 0.9);
    classClapUntil = Date.now() + 4200;
    const parts = [pickLine('praiseIntro')];
    const keys = ['praiseFirst', 'praiseSecond', 'praiseThird'];
    ranked.forEach((p, idx) => {
      const rw = giveDeskReward(p);
      parts.push(pickLine(keys[idx], DATA().speakableName(p.nickname), p.score, rw.name));
    });
    if (allRanked.length === 4) {
      const p4 = allRanked[3];
      parts.push(`Hạng tư đang là bạn ${DATA().speakableName(p4.nickname)} với ${p4.score} điểm.`);
    } else if (allRanked.length >= 5) {
      const p4 = allRanked[3];
      const p5 = allRanked[4];
      parts.push(`Hạng tư là bạn ${DATA().speakableName(p4.nickname)} ${p4.score} điểm, hạng năm là bạn ${DATA().speakableName(p5.nickname)} ${p5.score} điểm.`);
    }
    parts.push(pickLine('praiseOutro'));
    enqueueMainSpeech(parts.join(' '), { hold: true, hype: true, preDelayMs: 650 });
    emitState();
  }

  function enterResults() {
    clearMainVoice();
    phase = 'results';
    phaseDuration = 10;
    phaseRemaining = 10;
    boardReady = true;
    sfx.play('schoolDrum', 1);
    spawnConfetti(65);

    const ranked = benchOrder.map((uid) => players.get(uid)).filter((p) => p && p.score > 0);
    if (ranked.length > 0) {
      const champ = ranked[0];
      const prev = roundChampions.get(champ.uid) || { uid: champ.uid, nickname: champ.nickname, avatar: champ.avatar, count: 0 };
      prev.nickname = champ.nickname;
      prev.avatar = champ.avatar || prev.avatar;
      prev.count += 1;
      roundChampions.set(champ.uid, prev);
      giveDeskReward(champ, '🏆', 'chiếc cúp Lớp Trưởng');

      const parts = [pickLine('results', DATA().speakableName(champ.nickname), champ.score)];
      if (ranked[1]) {
        const p2 = ranked[1];
        const rw2 = giveDeskReward(p2);
        parts.push(`Về nhì tiết này là bạn ${DATA().speakableName(p2.nickname)} với ${p2.score} điểm, cô thưởng ${rw2.name}.`);
      }
      if (ranked[2]) {
        const p3 = ranked[2];
        const rw3 = giveDeskReward(p3);
        parts.push(`Hạng ba thuộc về bạn ${DATA().speakableName(p3.nickname)}, ${p3.score} điểm, nhận ${rw3.name}.`);
      }
      if (ranked.length === 4) {
        const p4 = ranked[3];
        parts.push(`Hạng tư là bạn ${DATA().speakableName(p4.nickname)} với ${p4.score} điểm.`);
      } else if (ranked.length >= 5) {
        const p4 = ranked[3];
        const p5 = ranked[4];
        parts.push(`Hạng tư là bạn ${DATA().speakableName(p4.nickname)} ${p4.score} điểm, hạng năm là bạn ${DATA().speakableName(p5.nickname)} ${p5.score} điểm.`);
      }
      if (ranked.length >= 2) {
        parts.push('Cả lớp vỗ tay chúc mừng bảng vàng tiết này nào!');
      }
      enqueueMainSpeech(parts.join(' '), { hold: true, hype: true, preDelayMs: 900 });
    } else {
      enqueueMainSpeech(pickLine('resultsNobody'), { hold: true, preDelayMs: 900 });
    }

    // Lưu báo cáo tiết học lên server
    saveProgress({
      report: {
        totalPlayers: players.size,
        peakActive,
        questions: roundQuestionStats
      }
    });
    emitState();
  }

  // ---------- Giờ ra chơi: 5 trò mini-game luân phiên + Bảng Lớp Trưởng + Bình chọn chủ đề ----------
  function enterRecess(forcedGame = '') {
    clearMainVoice();
    phase = 'recess';
    boardReady = true;
    let g = forcedGame && RECESS_GAMES.includes(forcedGame) ? forcedGame : '';
    if (!g) {
      const pool = RECESS_GAMES.filter((x) => x !== lastRecessGame);
      g = pickRand(pool) || 'rps';
    }
    // Nếu chưa có học sinh ngồi ghế thì không chọn callup
    const seatedWithPlayers = benchOrder.map((uid) => players.get(uid)).filter(Boolean);
    if (g === 'callup' && !seatedWithPlayers.length) g = 'rps';
    lastRecessGame = g;

    sfx.play('schoolBell', 1);
    const intro = forcedGame ? '' : (pickLine('recessIntro') + ' ');
    const bellDelay = 980;

    if (g === 'rps') {
      phaseDuration = 16;
      phaseRemaining = 16;
      recessState = { game: 'rps', sub: 'play', picks: new Map(), teacherHand: '', winners: [] };
      enqueueMainSpeech(intro + pickLine('rpsIntro'), { hold: true, hype: true, preDelayMs: bellDelay });
    } else if (g === 'callup') {
      const target = pickRand(seatedWithPlayers);
      const wordPool = (DATA().QUESTIONS || []).filter((q) => isFriendlyWord(q) && q.difficulty === 'easy' && [...lettersOf(q.answer)].length <= 6);
      const q = pickRand(wordPool) || { answer: 'BẢNG ĐEN', clue: 'Cô giáo viết phấn lên đây.' };
      phaseDuration = 16;
      phaseRemaining = 16;
      recessState = {
        game: 'callup',
        sub: 'play',
        targetUid: target.uid,
        targetName: target.nickname,
        targetAvatar: target.avatar,
        q,
        scrambled: scrambleWords(q.answer),
        outcome: '' // 'right' | 'wrong' | 'silent'
      };
      enqueueMainSpeech(intro + pickLine('callUp', DATA().speakableName(target.nickname)) + ' ' + q.clue, { hold: true, hype: true, preDelayMs: bellDelay });
    } else if (g === 'pick') {
      const pair = pickRand(DATA().PICK_TOPICS) || ['phở', 'bún bò'];
      phaseDuration = 16;
      phaseRemaining = 16;
      recessState = { game: 'pick', sub: 'play', a: pair[0], b: pair[1], votes: new Map() };
      enqueueMainSpeech(intro + pickLine('pickIntro', pair[0], pair[1]), { hold: true, hype: true, preDelayMs: bellDelay });
    } else if (g === 'roll') {
      phaseDuration = 15;
      phaseRemaining = 15;
      recessState = { game: 'roll', sub: 'play', list: [] };
      enqueueMainSpeech(intro + pickLine('rollIntro'), { hold: true, hype: true, preDelayMs: bellDelay });
    } else {
      const targetHearts = 300;
      phaseDuration = 24;
      phaseRemaining = 24;
      recessState = { game: 'heart', sub: 'play', count: 0, target: targetHearts };
      enqueueMainSpeech(intro + pickLine('heartIntro', targetHearts), { hold: true, hype: true, preDelayMs: bellDelay });
    }
    emitState();
  }

  function finishRecessPlay() {
    if (!recessState) { enterVote(); return; }
    if (recessState.game !== 'callup' || !recessState.outcome) clearMainVoice();
    recessState.sub = 'result';
    phaseDuration = 7.5;
    phaseRemaining = 7.5;
    const g = recessState.game;

    if (g === 'rps') {
      const hands = ['búa', 'kéo', 'bao'];
      const tHand = pickRand(hands);
      recessState.teacherHand = tHand;
      const beats = { 'búa': 'bao', 'kéo': 'búa', 'bao': 'kéo' }; // người chơi ra beats[tHand] sẽ thắng cô
      const winChoice = beats[tHand];
      let winCnt = 0, loseCnt = 0;
      const deltas = [];
      for (const [uid, choice] of recessState.picks.entries()) {
        if (choice === winChoice) {
          winCnt += 1;
          const p = players.get(uid);
          if (p) {
            p.score += 2;
            p.totalScore += 2;
            p.celebrateUntil = Date.now() + 3500;
            deltas.push({ username: p.uid, nickname: p.nickname, avatar: p.avatar, delta: 2 });
          }
        } else if (choice !== tHand) {
          loseCnt += 1;
        }
      }
      if (deltas.length) { saveProgress({ scores: deltas }); recomputeSeating(); }
      recessState.winCnt = winCnt;
      recessState.loseCnt = loseCnt;
      if (recessState.picks.size === 0) {
        enqueueMainSpeech(pickLine('rpsNobody'), { hold: true });
      } else {
        const rest = winCnt > 0 ? pickLine('rpsWin', winCnt) : pickLine('rpsLose', Math.max(1, loseCnt));
        if (winCnt > 0) sfx.play('revealFanfare', 0.9);
        enqueueMainSpeech(pickLine('rpsReveal', tHand, rest), { hold: true, hype: true, preDelayMs: winCnt > 0 ? 450 : 0 });
      }
    } else if (g === 'callup') {
      if (!recessState.outcome) {
        recessState.outcome = 'silent';
        enqueueMainSpeech(pickLine('callUpSilent', DATA().speakableName(recessState.targetName)), { hold: true });
      }
    } else if (g === 'pick') {
      let c1 = 0, c2 = 0;
      for (const v of recessState.votes.values()) {
        if (v === 1) c1 += 1; else c2 += 1;
      }
      recessState.c1 = c1;
      recessState.c2 = c2;
      const tot = c1 + c2;
      if (tot === 0) {
        enqueueMainSpeech(pickLine('pickNobody'), { hold: true });
      } else if (c1 === c2) {
        enqueueMainSpeech(pickLine('pickTie'), { hold: true });
      } else {
        const win = c1 > c2 ? recessState.a : recessState.b;
        const lose = c1 > c2 ? recessState.b : recessState.a;
        const pct = Math.round((Math.max(c1, c2) / tot) * 100);
        enqueueMainSpeech(`${pickLine('pickResult', win, pct)} ${pickLine('pickRoast', lose)}`, { hold: true, hype: true });
      }
    } else if (g === 'roll') {
      if (!recessState.list.length) {
        enqueueMainSpeech(pickLine('rollNobody'), { hold: true });
      } else {
        const deltas = [];
        for (const item of recessState.list) {
          const p = players.get(item.uid);
          if (p) {
            p.score += 3;
            p.totalScore += 3;
            p.celebrateUntil = Date.now() + 3500;
            deltas.push({ username: p.uid, nickname: p.nickname, avatar: p.avatar, delta: 3 });
          }
        }
        if (deltas.length) { saveProgress({ scores: deltas }); recomputeSeating(); }
        sfx.play('revealFanfare', 0.9);
        const rollOrd = ['thứ nhất', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm'];
        const names = recessState.list.slice(0, 5).map((x, i) => `${rollOrd[i]} ${DATA().speakableName(x.nickname)}`).join(', ');
        enqueueMainSpeech(pickLine('rollResult', names), { hold: true, hype: true, preDelayMs: 450 });
      }
    } else if (g === 'heart') {
      if (recessState.count >= recessState.target) {
        const deltas = [];
        for (const p of players.values()) {
          p.score += 1;
          p.totalScore += 1;
          deltas.push({ username: p.uid, nickname: p.nickname, avatar: p.avatar, delta: 1 });
        }
        if (deltas.length) { saveProgress({ scores: deltas }); recomputeSeating(); }
        sfx.play('classClap', 1);
        classClapUntil = Date.now() + 4500;
        enqueueMainSpeech(pickLine('heartWin'), { hold: true, hype: true, preDelayMs: 680 });
      } else {
        enqueueMainSpeech(pickLine('heartFail', recessState.count), { hold: true });
      }
    }
    emitState();
  }

  function enterRecessChampionBoard() {
    clearMainVoice();
    if (!roundChampions.size) {
      enterVote();
      return;
    }
    recessState = { game: recessState?.game || 'rps', sub: 'board' };
    phaseDuration = 8.5;
    phaseRemaining = 8.5;
    const champs = [...roundChampions.values()].sort((a, b) => b.count - a.count);
    const top = champs[0];
    const sName = DATA().speakableName(top.nickname);
    let speech = top.count >= 2 ? pickLine('championAgain', sName, top.count) : pickLine('championBoard', sName);
    if (champs.length >= 2) {
      const champOrd = ['hạng nhì', 'hạng ba', 'hạng tư'];
      const followTxt = champs.slice(1, 4)
        .map((c, i) => `${champOrd[i]} là ${DATA().speakableName(c.nickname)} ${c.count} lần`)
        .join(', ');
      speech += ` Xếp tiếp theo trên bảng lớp trưởng: ${followTxt}!`;
    }
    enqueueMainSpeech(speech, { hold: true, hype: true });
    emitState();
  }

  const SKIP_VOTE_CATS = new Set([
    'Tuổi thơ 8x 9x',
    'Bài hát thiếu nhi',
    'Khoa học, công nghệ',
    'Ca dao, thành ngữ (điền từ còn thiếu)',
    'Đoán quốc gia'
  ]);

  function enterVote() {
    clearMainVoice();
    recessState = null;
    const rawCats = DATA().CATEGORIES || [];
    const cats = rawCats.filter((c) => !SKIP_VOTE_CATS.has(c));
    if (cats.length < 2 || (cfg.lopTopic && cfg.lopTopic !== 'all')) {
      startNewRound('');
      return;
    }
    const a = pickRand(cats);
    const b = pickRand(cats.filter((c) => c !== a)) || cats[0];
    phase = 'vote';
    phaseDuration = 15;
    phaseRemaining = 15;
    boardReady = true;
    voteState = { options: [a, b], votes: new Map() };
    enqueueMainSpeech(pickLine('voteIntro', a, b), { hold: true, hype: true });
    emitState();
  }

  function finishVote() {
    if (!voteState) { startNewRound(''); return; }
    let c1 = 0, c2 = 0;
    for (const v of voteState.votes.values()) {
      if (v === 1) c1 += 1; else c2 += 1;
    }
    let chosen = '';
    if (c1 > 0 || c2 > 0) {
      chosen = c1 >= c2 ? voteState.options[0] : voteState.options[1];
    } else {
      enqueueChatter(pickLine('voteNobody'), false);
    }
    startNewRound(chosen);
  }

  // ---------- Tương tác khuấy động lớp học khi chờ trả lời (love / story / poll / sleep) ----------
  function runIdleEngage() {
    if ((phase !== 'question' && phase !== 'bonus') || !boardReady || phaseRemaining < 8) return;
    if (!curQ || curQ.kind === 'math') return;
    const kind = ['love', 'story', 'poll', 'sleep'][engageStep % 4];
    engageStep += 1;

    if (kind === 'love') {
      loveSession = { users: new Map(), until: Date.now() + 14000, thanked: false };
      enqueueChatter(pickLine('loveCall'), true);
    } else if (kind === 'story') {
      enqueueChatter(pickLine('funFact'), false);
    } else if (kind === 'poll') {
      const poll = pickRand(DATA().POLLS);
      if (poll) {
        activePoll = {
          ask: poll.ask,
          opts: poll.opts,
          votes: new Map(),
          until: Date.now() + 15000,
          announced: false
        };
        enqueueChatter(poll.ask, false);
      }
    } else if (kind === 'sleep') {
      const sleepy = benchOrder
        .map((uid) => players.get(uid))
        .find((p) => p && Date.now() - p.lastActive > 240000);
      if (sleepy) {
        sleepy.sleeping = true;
        enqueueChatter(pickLine('wakeUp', DATA().speakableName(sleepy.nickname)), false);
      } else {
        enqueueChatter(pickLine('share'), false);
      }
    }
  }

  // ---------- Xử lý bình luận, quà, tim, vào/rời phòng ----------
  const CHAT_GREETINGS_NOTONE = new Set([
    'chaoco', 'emchaoco', 'chaocoa', 'emchaocoa', 'hello', 'hi', 'hico', 'helloco',
    'xinchaoco', 'xinchao', 'choemvaolop', 'vaolop', 'diemdanha', 'diemdanh', 'comat'
  ]);

  function extractCandidateTexts(raw) {
    const base = String(raw || '').normalize('NFC').trim();
    if (!base) return [];
    const out = [base];
    const stripped = base
      .replace(/^(?:đáp án là|dap an la|đáp án|dap an|câu trả lời là|cau tra loi la|em đoán là|em doan la|em đoán|em doan|từ khóa là|tu khoa la|cô ơi là|co oi la|cô ơi|co oi|thưa cô là|thua co la|thưa cô|thua co|là từ|la tu)\s*[:=\-]?\s*/iu, '')
      .replace(/\s*(?:ạ|nhé|nhe|nha|cô ơi|co oi|thưa cô|thua co|đúng không cô|đúng ko cô|dung khong co|dung ko co)+[.!?~]*$/iu, '')
      .trim();
    if (stripped && stripped !== base) out.push(stripped);
    return out;
  }

  function checkIsCorrectGuess(text, q) {
    if (!q) return { isAttempt: false, isCorrect: false, missingTone: false };
    if (q.kind === 'math') {
      const s = String(text || '').trim();
      const exact = s.match(/^[=:\s]*(-?\d{1,6})\s*(?:ạ|nha|nhé|nhe|điểm|đ)?[.!?]*$/iu);
      if (exact) {
        return { isAttempt: true, isCorrect: exact[1] === String(q.answer), missingTone: false };
      }
      const prefixed = s.match(/(?:=|bằng|bang|là|la|đáp án|dap an|kết quả|ket qua)\s*(-?\d{1,6})\b/iu);
      if (prefixed) {
        return { isAttempt: true, isCorrect: prefixed[1] === String(q.answer), missingTone: false };
      }
      return { isAttempt: false, isCorrect: false, missingTone: false };
    }

    const requireTone = Boolean(cfg.lopRequireTone) && !cfg.lopAcceptNoTone;
    const targets = [q.answer, ...(Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : [])];
    const targetTones = targets.map((t) => normViTone(t)).filter(Boolean);
    const targetNoTones = targets.map((t) => normViNoTone(t)).filter(Boolean);
    const validLengths = new Set(targetNoTones.map((t) => [...t].length));

    const cands = extractCandidateTexts(text);
    for (const cand of cands) {
      const gTone = normViTone(cand);
      const gNoTone = normViNoTone(cand);
      if (!gNoTone) continue;
      if (targetTones.includes(gTone)) {
        return { isAttempt: true, isCorrect: true, missingTone: false };
      }
      if (targetNoTones.includes(gNoTone)) {
        if (!requireTone) {
          return { isAttempt: true, isCorrect: true, missingTone: false };
        }
        // Người chơi đã đoán đúng chữ nhưng quên bỏ dấu khi chủ kênh bật bắt buộc dấu -> nhắc nhẹ, KHÔNG khoá lượt!
        return { isAttempt: false, isCorrect: false, missingTone: true };
      }
    }

    // Xác định xem có phải lượt đoán chữ sai (cùng độ dài ký tự và không phải câu chào xã giao)
    const primaryNoTone = normViNoTone(cands[cands.length - 1] || text);
    if (!primaryNoTone || CHAT_GREETINGS_NOTONE.has(primaryNoTone)) {
      return { isAttempt: false, isCorrect: false, missingTone: false };
    }
    if (validLengths.has([...primaryNoTone].length)) {
      return { isAttempt: true, isCorrect: false, missingTone: false };
    }
    return { isAttempt: false, isCorrect: false, missingTone: false };
  }

  function triggerBirthday(p) {
    if (!p || birthdayGiven.has(p.uid)) return;
    birthdayGiven.add(p.uid);
    giveDeskReward(p, '🎂', 'một chiếc bánh kem sinh nhật');
    birthdayBanner = { nickname: p.nickname, until: Date.now() + 10000 };
    classClapUntil = Date.now() + 5000;
    sfx.play('classClap', teacherSpeaking ? 0.35 : 1);
    spawnConfetti(48);
    enqueueChatter(pickLine('birthday', DATA().speakableName(p.nickname)), true);
    emitState(true);
  }

  function handleChat(ev) {
    const rawText = String(ev.text || '').trim();
    if (!rawText) return;
    lastActivityAt = Date.now();
    qCommentCount += 1;

    const p = ensurePlayer(ev.user, Boolean(ev.test));
    markAttendance(p);

    // Nếu đang ở chế độ Ôn bài mà có người thật chat -> chuyển sang bài mới ở câu kế
    if (reviewMode && !ev.test) {
      reviewMode = false;
      enqueueChatter(pickLine('reviewEnd'), true);
    }

    const low = rawText.normalize('NFC').toLowerCase().trim();

    // Đổi kiểu tóc nếu người xem gõ "đổi kiểu" / "đổi tóc"
    if (low === 'đổi kiểu' || low === 'đổi tóc' || low === 'doi kieu' || low === 'doi toc') {
      p.hairIdx = (p.hairIdx + 1) % 10;
      p.hairColor = HAIR_COLORS[(HAIR_COLORS.indexOf(p.hairColor) + 1) % HAIR_COLORS.length];
      p.bubbleText = '✨ Đổi kiểu tóc mới!';
      p.bubbleUntil = Date.now() + 3600;
      emitState(true);
      return;
    }

    // Tự phát hiện sinh nhật: có "sinh nhật" nhưng không phải "chúc mừng sinh nhật..."
    if (low.includes('sinh nhật') && !low.includes('chúc') && !low.includes('mừng') && !birthdayGiven.has(p.uid)) {
      triggerBirthday(p);
      return;
    }

    // Xử lý theo từng pha
    if (phase === 'vote' && voteState) {
      if (low === '1' || low === '2') {
        voteState.votes.set(p.uid, low === '1' ? 1 : 2);
        p.bubbleText = low === '1' ? `1️⃣ ${voteState.options[0]}` : `2️⃣ ${voteState.options[1]}`;
        p.bubbleUntil = Date.now() + 3500;
        if (!teacherSpeaking) sfx.play('correctDing', 0.45);
        emitState(true);
      }
      return;
    }

    if (phase === 'recess' && recessState && recessState.sub === 'play') {
      const g = recessState.game;
      if (g === 'rps') {
        let pick = '';
        if (low === '1' || low.includes('búa') || low.includes('bua') || low.includes('✊')) pick = 'búa';
        else if (low === '2' || low.includes('kéo') || low.includes('keo') || low.includes('✌')) pick = 'kéo';
        else if (low === '3' || low.includes('bao') || low.includes('🖐')) pick = 'bao';
        if (pick && !recessState.picks.has(p.uid)) {
          recessState.picks.set(p.uid, pick);
          p.bubbleText = pick === 'búa' ? '✊ Búa' : pick === 'kéo' ? '✌️ Kéo' : '🖐️ Bao';
          p.bubbleUntil = Date.now() + 4000;
          if (!teacherSpeaking) sfx.play('correctDing', 0.4);
          emitState(true);
        }
        return;
      }
      if (g === 'callup') {
        if (p.uid === recessState.targetUid && !recessState.outcome) {
          const chk = checkIsCorrectGuess(rawText, recessState.q);
          if (chk.isCorrect) {
            clearMainVoice();
            recessState.outcome = 'right';
            p.score += 5;
            p.totalScore += 5;
            p.celebrateUntil = Date.now() + 4500;
            saveProgress({ scores: [{ username: p.uid, nickname: p.nickname, avatar: p.avatar, delta: 5 }] });
            recomputeSeating();
            sfx.play('revealFanfare', 1);
            enqueueMainSpeech(pickLine('callUpRight', DATA().speakableName(p.nickname)), { hold: true, hype: true, preDelayMs: 440 });
            finishRecessPlay();
          } else if (chk.missingTone) {
            p.bubbleText = '✍️ Gõ thêm dấu tiếng Việt nhé!';
            p.bubbleUntil = Date.now() + 3400;
            emitState(true);
          } else if (chk.isAttempt) {
            clearMainVoice();
            recessState.outcome = 'wrong';
            p.wrongUntil = Date.now() + 3000;
            sfx.play('wrongPop', 1);
            enqueueMainSpeech(pickLine('callUpWrong', DATA().speakableName(p.nickname)), { hold: true, preDelayMs: 220 });
            finishRecessPlay();
          }
        }
        return;
      }
      if (g === 'pick') {
        if (low === '1' || low === '2') {
          recessState.votes.set(p.uid, low === '1' ? 1 : 2);
          p.bubbleText = low === '1' ? `1️⃣ ${recessState.a}` : `2️⃣ ${recessState.b}`;
          p.bubbleUntil = Date.now() + 3500;
          emitState(true);
        }
        return;
      }
      if (g === 'roll') {
        const clean = normViNoTone(low);
        if ((clean.includes('comat') || low.includes('có mặt') || low === '1' || low.includes('🙋')) &&
            recessState.list.length < 10 && !recessState.list.some((x) => x.uid === p.uid)) {
          recessState.list.push({ uid: p.uid, nickname: p.nickname, avatar: p.avatar });
          p.bubbleText = '🙋 Có mặt!';
          p.bubbleUntil = Date.now() + 4500;
          if (!teacherSpeaking) sfx.play('correctDing', 0.65);
          if (recessState.list.length >= 10) finishRecessPlay();
          else emitState(true);
        }
        return;
      }
    }

    // Tương tác phụ khi đang mở "Ai yêu cô gõ số 1" hoặc Bình chọn 1 chữ cái
    if (loveSession && Date.now() < loveSession.until && (low === '1' || low.includes('yêu cô') || low.includes('❤️'))) {
      loveSession.users.set(p.uid, p.nickname);
      for (let i = 0; i < 3; i++) {
        floatingHearts.push({
          x: 490 + Math.random() * 100,
          y: 660 + Math.random() * 30,
          vx: (Math.random() - 0.5) * 45,
          vy: -65 - Math.random() * 55,
          size: 22 + Math.random() * 12,
          alpha: 1,
          emoji: pickRand(['💖', '💕', '💗', '❤️'])
        });
      }
      p.bubbleText = '💖 Con yêu cô!';
      p.bubbleUntil = Date.now() + 3800;
      emitState();
      return;
    }

    if (activePoll && Date.now() < activePoll.until && low.length === 1) {
      const opt = activePoll.opts.find((o) => o.key === low);
      if (opt) {
        activePoll.votes.set(p.uid, opt.key);
        p.bubbleText = `🗳️ ${opt.label}`;
        p.bubbleUntil = Date.now() + 3800;
        emitState();
        return;
      }
    }

    // Đang trong câu hỏi / giờ thêm: cho phép đoán lại thoải mái cho tới khi giải ĐÚNG câu hiện tại!
    if ((phase === 'question' || phase === 'bonus') && curQ) {
      if (qSolvedUids.has(p.uid)) {
        p.bubbleText = '✅ Em giải xong rồi ạ!';
        p.bubbleUntil = Date.now() + 2600;
        emitState();
        return;
      }
      const chk = checkIsCorrectGuess(rawText, curQ);
      if (chk.missingTone) {
        if (!boardReady) showBoardNow();
        p.bubbleText = '✍️ Gõ thêm dấu tiếng Việt nhé!';
        p.bubbleUntil = Date.now() + 3400;
        emitState(true);
        return;
      }
      if (chk.isAttempt) {
        if (!boardReady) showBoardNow();
        const createTime = Number(ev.createTime || ev.ts) || Date.now();
        qAttempts.set(p.uid, { text: rawText, correct: chk.isCorrect, time: createTime });

        if (chk.isCorrect) {
          qSolvedUids.add(p.uid);
          const elapsedSec = phaseDuration - phaseRemaining;
          qCorrectList.push({
            uid: p.uid,
            nickname: p.nickname,
            avatar: p.avatar,
            createTime,
            points: 0,
            elapsedSec
          });
          fastestThree = qCorrectList.slice().sort((a, b) => a.createTime - b.createTime).slice(0, 3);
          p.celebrateUntil = Date.now() + 3400;
          p.bubbleText = '✅ Em ra rồi ạ!';
          p.bubbleUntil = Date.now() + 3800;
          sfx.play('correctDing', teacherSpeaking ? 0.35 : 0.95);

          const rankNum = qCorrectList.length;
          const sName = DATA().speakableName(p.nickname);
          if (rankNum === 1) {
            const praiseLine = elapsedSec <= 4 ? pickLine('superFast', sName) : pickLine('firstCorrect', sName);
            enqueueChatter(praiseLine, true);
            pushToast('🥇', `<b>${escHtml(p.nickname)}</b> giải đúng đầu tiên!`, true);

            // Phòng vắng (<5 người hoạt động) -> rút ngắn thời gian còn 8s để không chờ lâu
            const activeCount = [...players.values()].filter((u) => Date.now() - u.lastActive < 120000).length;
            if (activeCount < 5 && phaseRemaining > 8) {
              phaseRemaining = 8;
            }
          } else if (rankNum === 2) {
            queueSolverRankPraise(2, sName);
            pushToast('🥈', `<b>${escHtml(p.nickname)}</b> trả lời đúng thứ 2!`, true);
          } else if (rankNum === 3) {
            queueSolverRankPraise(3, sName);
            pushToast('🥉', `<b>${escHtml(p.nickname)}</b> trả lời đúng thứ 3!`, true);
          }
          emitState(true);
        } else {
          p.wrongUntil = Date.now() + 2400;
          const safeWrong = DATA().containsBanned(rawText) ? '***' : rawText.slice(0, 18);
          p.bubbleText = `❌ ${safeWrong}`;
          p.bubbleUntil = Date.now() + 3000;
          if (!qWrongList.some((w) => w.uid === p.uid)) {
            qWrongList.push({ uid: p.uid, nickname: p.nickname, text: safeWrong });
          }
          if (!teacherSpeaking) sfx.play('wrongPop', 0.65);
          emitState(true);
        }
        return;
      }
    }

    // Chat trò chuyện bình thường: hiện bong bóng trên đầu (ẩn từ cấm & ẩn nếu câu dài vô tình lộ đáp án)
    if (!DATA().containsBanned(rawText)) {
      const ansNoTone = curQ ? normViNoTone(curQ.answer) : '';
      const mayLeakAnswer = Boolean(ansNoTone && (phase === 'question' || phase === 'bonus') && normViNoTone(rawText).includes(ansNoTone));
      p.bubbleText = mayLeakAnswer ? '🤫 Suỵt, gõ riêng đáp án nhé!' : rawText.slice(0, 34);
      p.bubbleUntil = Date.now() + 4500;
      emitState();
    }
  }

  function handleGift(ev) {
    lastActivityAt = Date.now();
    const p = ensurePlayer(ev.user, Boolean(ev.test));
    markAttendance(p);
    const diamonds = Math.max(1, Number(ev.total || ev.diamonds || 1));
    const giftName = String(ev.giftName || 'bó hoa tươi').slice(0, 32);

    // Học sinh ôm hoa đi lên bục tặng Cô Giáo + cắm thêm hoa vào bình
    totalBouquets += 1;
    if (vaseItems.length < 12) {
      vaseItems.push(VASE_FLOWERS[(totalBouquets - 1) % VASE_FLOWERS.length]);
    }
    flowerWalkers.push({
      uid: p.uid,
      nickname: p.nickname,
      avatar: p.avatar,
      hairIdx: p.hairIdx,
      hairColor: p.hairColor,
      fromX: p.curX || W / 2,
      fromY: p.curY || 1150,
      t: 0,
      dur: 3.4,
      giftName
    });

    const sName = DATA().speakableName(p.nickname);
    showGiftPlate(p, `💐 Tặng Cô Giáo ${giftName} (${diamonds} 💎)`);
    sfx.play('revealFanfare', teacherSpeaking ? 0.35 : 0.95);
    spawnConfetti(diamonds >= 30 ? 45 : 18);

    // Quà >= 30 xu khi chưa ai giải ra câu chữ -> mở 1 chữ gợi ý cứu cả lớp!
    if (diamonds >= 30 && (phase === 'question' || phase === 'bonus') && curQ && curQ.kind !== 'math' && qCorrectList.length === 0) {
      if (revealOneHintLetter()) {
        enqueueChatter(pickLine('giftHint', sName), true);
        pushToast('💡', `Nhờ quà của <b>${escHtml(p.nickname)}</b>, Cô mở 1 chữ gợi ý!`, true);
        emitState(true);
        return;
      }
    }
    if (diamonds >= 50) {
      enqueueChatter(pickLine('bigGift', sName), true);
    } else {
      enqueueChatter(pickLine('thankGift', sName, giftName), false);
    }
    emitState(true);
  }

  function handleLikesDelta(deltaRealLikes) {
    if (!(deltaRealLikes > 0)) return;
    const boosted = deltaRealLikes * HEART_BOOST;
    boostedHearts += boosted;

    if (phase === 'recess' && recessState?.game === 'heart' && recessState.sub === 'play') {
      recessState.count += boosted;
      for (let i = 0; i < Math.min(6, deltaRealLikes); i++) {
        floatingHearts.push({
          x: 240 + Math.random() * 600,
          y: 540 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 40,
          vy: -75 - Math.random() * 55,
          size: 22 + Math.random() * 14,
          alpha: 1,
          emoji: '❤️'
        });
      }
      if (recessState.count >= recessState.target) {
        finishRecessPlay();
      } else {
        emitState();
      }
      return;
    }

    const goalStep = Math.max(50, Number(cfg.lopLikeGoal) || 300);
    if (boostedHearts >= nextClapGoal) {
      nextClapGoal = Math.floor(boostedHearts / goalStep) * goalStep + goalStep;
      classClapUntil = Date.now() + 4500;
      sfx.play('classClap', teacherSpeaking ? 0.3 : 0.9);
      spawnConfetti(28);
      enqueueChatter(pickLine('clap'), true);
      pushToast('👏', `Đạt <b>${boostedHearts.toLocaleString('vi-VN')}</b> tim! Cả lớp vỗ tay rần rần!`, true);
    }
    emitState();
  }

  let lastJoinToastAt = 0;
  function handleJoin(ev) {
    const hadBefore = players.has(String(ev.user?.id || ev.user?.uniqueId || ev.user?.nickname || ''));
    const p = ensurePlayer(ev.user, Boolean(ev.test));
    markAttendance(p);
    if (!hadBefore) {
      p.bubbleText = '🎒 Em chào cô ạ!';
      p.bubbleUntil = Date.now() + 4200;
      if (Date.now() - lastJoinToastAt > 1800) {
        lastJoinToastAt = Date.now();
        pushToast('🎒', `<b>${escHtml(p.nickname)}</b> vừa vào lớp học!`, false);
      }
    }
    emitState(true);
    if (!cfg.lopGreet) return;
    pendingGreets.push(DATA().speakableName(p.nickname));
    if (pendingGreets.length > 6) pendingGreets.shift();
    clearTimeout(greetFlushTimer);
    greetFlushTimer = setTimeout(() => {
      if (!pendingGreets.length) return;
      const uniq = [...new Set(pendingGreets)].slice(0, 3);
      pendingGreets = [];
      enqueueChatter(pickLine('greeting', uniq.join(', ')), false);
    }, 3800);
  }

  function handleLeave(ev) {
    const uid = String(ev.user?.id || ev.user?.uniqueId || ev.user?.nickname || '');
    if (uid && players.has(uid)) {
      players.delete(uid);
      recomputeSeating();
      emitState();
    }
  }

  function spawnConfetti(n) {
    const colors = ['#fbbf24', '#f43f5e', '#34d399', '#38bdf8', '#a855f7', '#fb923c'];
    for (let i = 0; i < n; i++) {
      confetti.push({
        x: 180 + Math.random() * (W - 360),
        y: 260 + Math.random() * 160,
        vx: (Math.random() - 0.5) * 260,
        vy: -160 - Math.random() * 200,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 9,
        w: 9 + Math.random() * 7,
        h: 6 + Math.random() * 5,
        life: 1.8 + Math.random() * 1.2
      });
    }
  }

  // ---------- Gửi trạng thái trực tiếp về Bảng điều khiển chủ kênh & Đồng bộ sang cửa sổ phụ ----------
  let lastEmitAt = 0;
  let lastSyncAt = 0;
  let lastEmitPhase = '';
  let lastEmitBoardReady = false;

  function buildSyncSnapshot() {
    const playerList = [];
    for (const p of players.values()) {
      playerList.push({
        uid: p.uid,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        totalScore: p.totalScore,
        streak: p.streak,
        hairIdx: p.hairIdx,
        hairColor: p.hairColor,
        tint: p.tint,
        joinedAt: p.joinedAt,
        lastActive: p.lastActive,
        firstScoredAt: Number.isFinite(p.firstScoredAt) ? p.firstScoredAt : -1,
        deskGifts: p.deskGifts.slice(-5),
        bubbleText: p.bubbleText,
        bubbleUntil: p.bubbleUntil,
        celebrateUntil: p.celebrateUntil,
        wrongUntil: p.wrongUntil,
        sleeping: p.sleeping,
        attendDays: p.attendDays
      });
    }
    let recSnap = null;
    if (recessState) {
      recSnap = {
        ...recessState,
        picks: undefined,
        votes: undefined,
        picksEntries: recessState.picks instanceof Map ? [...recessState.picks.entries()] : [],
        votesEntries: recessState.votes instanceof Map ? [...recessState.votes.entries()] : []
      };
    }
    const voteSnap = voteState ? {
      options: voteState.options,
      entries: voteState.votes instanceof Map ? [...voteState.votes.entries()] : []
    } : null;

    return {
      roundNum,
      qIndex,
      totalQuestions: roundQuestions.length || 20,
      curQ,
      phase,
      phaseDuration,
      phaseRemaining,
      boardReady,
      reviewMode,
      votedTopic,
      scrambledGroups,
      answerWords,
      answerFlat,
      revealedIdx: [...revealedIdx],
      qCorrectList: qCorrectList.slice(0, 20),
      fastestThree: fastestThree.slice(0, 3),
      benchOrder: benchOrder.slice(),
      standingOrder: standingOrder.slice(),
      currentMonitorUid,
      boostedHearts,
      nextClapGoal,
      classClapUntil,
      birthdayBanner,
      podiumPunished: podiumPunished.slice(),
      vaseItems: vaseItems.slice(),
      totalBouquets,
      weekTop: weekTop.slice(0, 6),
      todayTop: todayTop.slice(0, 6),
      roundChampions: [...roundChampions.values()],
      recessState: recSnap,
      voteState: voteSnap,
      teacherSpeaking,
      caption: currentCaptionText,
      players: playerList
    };
  }

  function applySyncSnapshot(s) {
    if (!s || typeof s !== 'object' || isMaster) return;
    roundNum = Number(s.roundNum) || 1;
    qIndex = typeof s.qIndex === 'number' ? s.qIndex : -1;
    curQ = s.curQ || null;
    phase = s.phase || 'intro';
    phaseDuration = Number(s.phaseDuration) || 20;
    phaseRemaining = Number(s.phaseRemaining) || 0;
    boardReady = Boolean(s.boardReady);
    reviewMode = Boolean(s.reviewMode);
    votedTopic = s.votedTopic || '';
    scrambledGroups = Array.isArray(s.scrambledGroups) ? s.scrambledGroups : [];
    answerWords = Array.isArray(s.answerWords) ? s.answerWords : [];
    answerFlat = String(s.answerFlat || '');
    revealedIdx = new Set(Array.isArray(s.revealedIdx) ? s.revealedIdx : []);
    qCorrectList = Array.isArray(s.qCorrectList) ? s.qCorrectList : [];
    fastestThree = Array.isArray(s.fastestThree) ? s.fastestThree : [];
    benchOrder = Array.isArray(s.benchOrder) ? s.benchOrder : [];
    standingOrder = Array.isArray(s.standingOrder) ? s.standingOrder : [];
    currentMonitorUid = s.currentMonitorUid || '';
    boostedHearts = Number(s.boostedHearts) || 0;
    nextClapGoal = Number(s.nextClapGoal) || 300;
    classClapUntil = Number(s.classClapUntil) || 0;
    birthdayBanner = s.birthdayBanner || null;
    teacherSpeaking = Boolean(s.teacherSpeaking);

    podiumPunished.length = 0;
    if (Array.isArray(s.podiumPunished)) podiumPunished.push(...s.podiumPunished);
    vaseItems.length = 0;
    if (Array.isArray(s.vaseItems)) vaseItems.push(...s.vaseItems);
    totalBouquets = Number(s.totalBouquets) || 0;
    if (Array.isArray(s.weekTop)) weekTop = s.weekTop;
    if (Array.isArray(s.todayTop)) todayTop = s.todayTop;

    roundChampions.clear();
    if (Array.isArray(s.roundChampions)) {
      for (const c of s.roundChampions) {
        if (c && c.uid) roundChampions.set(c.uid, c);
      }
    }

    if (s.recessState) {
      recessState = {
        ...s.recessState,
        picks: new Map(Array.isArray(s.recessState.picksEntries) ? s.recessState.picksEntries : []),
        votes: new Map(Array.isArray(s.recessState.votesEntries) ? s.recessState.votesEntries : [])
      };
    } else {
      recessState = null;
    }
    if (s.voteState) {
      voteState = {
        options: s.voteState.options || ['', ''],
        votes: new Map(Array.isArray(s.voteState.entries) ? s.voteState.entries : [])
      };
    } else {
      voteState = null;
    }

    if (Array.isArray(s.players)) {
      const keep = new Set();
      for (const sp of s.players) {
        if (!sp || !sp.uid) continue;
        keep.add(sp.uid);
        const existing = players.get(sp.uid);
        if (existing) {
          Object.assign(existing, sp, {
            firstScoredAt: sp.firstScoredAt >= 0 ? sp.firstScoredAt : Infinity,
            curX: existing.curX,
            curY: existing.curY,
            seatX: existing.seatX,
            seatY: existing.seatY
          });
        } else {
          const h = hashStr(sp.uid);
          players.set(sp.uid, {
            ...sp,
            firstScoredAt: sp.firstScoredAt >= 0 ? sp.firstScoredAt : Infinity,
            seatX: W * 0.5,
            seatY: H * 0.85,
            curX: (h % 2 === 0) ? 46 : W - 46,
            curY: 1180 + (h % 220)
          });
        }
        if (sp.avatar) getAvatarImg(sp.avatar);
      }
      for (const uid of [...players.keys()]) {
        if (!keep.has(uid)) players.delete(uid);
      }
    }

    if (s.caption && s.caption !== lastSyncedCaption) {
      lastSyncedCaption = s.caption;
      setCaption(s.caption, 4200);
    } else if (!s.caption && lastSyncedCaption) {
      lastSyncedCaption = '';
    }
  }

  function emitSync(force = false) {
    if (!isMaster || !onSyncOutCb) return;
    const now = performance.now();
    if (!force && now - lastSyncAt < 380) return;
    lastSyncAt = now;
    onSyncOutCb(buildSyncSnapshot());
  }

  function emitState(force = false) {
    if (!isMaster) return;
    emitSync(force);
    if (!onStateCb) return;
    const now = performance.now();
    const stateChanged = phase !== lastEmitPhase || boardReady !== lastEmitBoardReady;
    if (!force && !stateChanged && now - lastEmitAt < 250) return;
    lastEmitAt = now;
    lastEmitPhase = phase;
    lastEmitBoardReady = boardReady;
    const phaseNames = {
      intro: 'Vào tiết',
      question: boardReady ? 'Đang trả lời' : 'Cô đang đọc đề',
      bonus: 'Giờ thêm (+10s)',
      reveal: 'Công bố đáp án',
      praise: 'Tuyên dương & phát quà',
      results: 'Tổng kết tiết',
      recess: recessState ? `Giờ ra chơi (${recessState.game})` : 'Giờ ra chơi',
      vote: 'Bình chọn chủ đề'
    };
    onStateCb({
      round: roundNum,
      questionNum: Math.max(0, qIndex + 1),
      totalQuestions: roundQuestions.length || 20,
      phase,
      phaseLabel: phaseNames[phase] || phase,
      remaining: Math.ceil(Math.max(0, phaseRemaining)),
      secretAnswer: curQ ? curQ.answer : '',
      clue: curQ ? (curQ.kind === 'math' ? curQ.mathExpr : curQ.clue) : '',
      category: curQ ? curQ.category : '',
      golden: qIndex === (roundQuestions.length || 20) - 1 && phase !== 'intro',
      reviewMode,
      votedTopic,
      seatedCount: benchOrder.length,
      standingCount: standingOrder.length,
      totalPlayers: players.size,
      activePlayers: [...players.values()].filter((p) => Date.now() - p.lastActive < 180000).length,
      qComments: qCommentCount,
      qAttempts: qAttempts.size,
      qCorrect: qCorrectList.length,
      top3: benchOrder.slice(0, 3).map((uid) => {
        const p = players.get(uid);
        return p ? { nickname: p.nickname, score: p.score } : null;
      }).filter(Boolean)
    });
  }

  // ---------- Bước tiến thời gian mỗi khung hình ----------
  function updateSimulation(dt) {
    const now = Date.now();

    // Dọn danh sách phạt góc bục hết hạn
    for (let i = podiumPunished.length - 1; i >= 0; i--) {
      if (now >= podiumPunished[i].until) podiumPunished.splice(i, 1);
    }
    if (birthdayBanner && now >= birthdayBanner.until) birthdayBanner = null;

    // Kết thúc phiên "Ai yêu cô gõ số 1"
    if (loveSession && !loveSession.thanked && now >= loveSession.until) {
      loveSession.thanked = true;
      if (loveSession.users.size > 0) {
        const sample = [...loveSession.users.values()].slice(0, 3).map((n) => DATA().speakableName(n)).join(', ');
        enqueueChatter(pickLine('loveThanks', loveSession.users.size, sample), true);
      }
      setTimeout(() => { loveSession = null; }, 2500);
    }

    // Kết thúc phiên bình chọn 1 chữ cái
    if (activePoll && !activePoll.announced && now >= activePoll.until) {
      activePoll.announced = true;
      if (activePoll.votes.size > 0) {
        const counts = new Map();
        for (const k of activePoll.votes.values()) counts.set(k, (counts.get(k) || 0) + 1);
        const sorted = activePoll.opts
          .map((o) => ({ label: o.label, count: counts.get(o.key) || 0 }))
          .sort((a, b) => b.count - a.count);
        if (sorted.length >= 2 && sorted[0].count === sorted[1].count) {
          enqueueChatter(pickLine('pollTie', activePoll.votes.size), false);
        } else if (sorted[0].count > 0) {
          enqueueChatter(pickLine('pollResult', sorted[0].label, sorted[0].count), false);
        }
      }
      setTimeout(() => { activePoll = null; }, 3500);
    }

    // Tự rời lớp nếu bật lopIdleMin > 0
    if (cfg.lopIdleMin > 0) {
      const maxIdle = cfg.lopIdleMin * 60000;
      let removed = false;
      for (const [uid, p] of players.entries()) {
        if (now - p.lastActive > maxIdle) {
          players.delete(uid);
          removed = true;
        }
      }
      if (removed) recomputeSeating();
    }

    // Nội suy vị trí mượt mà cho học sinh về ghế / chỗ đứng
    benchOrder.forEach((uid, idx) => {
      const p = players.get(uid);
      if (!p) return;
      const target = seatPositionOf(idx);
      p.seatX = target.x;
      p.seatY = target.y;
      const k = Math.min(1, dt * 6.5);
      p.curX += (target.x - p.curX) * k;
      p.curY += (target.y - p.curY) * k;
    });
    standingOrder.forEach((uid, idx) => {
      const p = players.get(uid);
      if (!p) return;
      const target = standingPositionOf(idx);
      p.seatX = target.x;
      p.seatY = target.y;
      const k = Math.min(1, dt * 6.5);
      p.curX += (target.x - p.curX) * k;
      p.curY += (target.y - p.curY) * k;
    });

    // Cập nhật hiệu ứng bay quà, người đi tặng hoa, tim bay, pháo giấy
    for (let i = flyingGifts.length - 1; i >= 0; i--) {
      flyingGifts[i].t += dt;
      if (flyingGifts[i].t >= flyingGifts[i].dur) flyingGifts.splice(i, 1);
    }
    for (let i = flowerWalkers.length - 1; i >= 0; i--) {
      flowerWalkers[i].t += dt;
      if (flowerWalkers[i].t >= flowerWalkers[i].dur) flowerWalkers.splice(i, 1);
    }
    for (let i = floatingHearts.length - 1; i >= 0; i--) {
      const h = floatingHearts[i];
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.alpha -= dt * 0.55;
      if (h.alpha <= 0) floatingHearts.splice(i, 1);
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 420 * dt;
      c.rot += c.vr * dt;
      c.life -= dt;
      if (c.life <= 0 || c.y > H + 40) confetti.splice(i, 1);
    }

    // Cửa sổ phụ (Mirror) chỉ mượt hoá chuyển động & hiển thị đúng trạng thái từ Master, không tự chạy bộ đếm riêng
    if (!isMaster) {
      if (!(phase === 'question' && !boardReady)) {
        phaseRemaining = Math.max(0, phaseRemaining - dt);
      }
      return;
    }

    emitSync(false);

    // Giữ đồng hồ đếm ngược khi Cô đang đọc đề / phổ biến luật; riêng các pha công bố (intro/reveal/praise/results)
    // cho đếm nền song song nhưng luôn chừa nhịp nghỉ tự nhiên 1.5s sau khi Cô đọc dứt câu để không bao giờ cắt chữ
    const freezeCountdown = phase === 'question' || phase === 'bonus' || phase === 'vote' || (phase === 'recess' && recessState?.sub === 'play');
    const isAnnouncementPhase = phase === 'intro' || phase === 'reveal' || phase === 'praise' || phase === 'results' || (phase === 'recess' && recessState?.sub !== 'play');
    if (holdTimerForVoice && performance.now() > holdSafetyUntil) {
      holdTimerForVoice = false;
      if (phase === 'question' && !boardReady) showBoardNow();
    }
    if (holdTimerForVoice && freezeCountdown) {
      return;
    }

    if (phase === 'question' && !boardReady) return;

    // Đếm ngược thời gian của pha hiện tại
    phaseRemaining -= dt;
    if (isAnnouncementPhase && (holdTimerForVoice || voicePlaying || mainVoiceQueue.length > 0) && performance.now() <= holdSafetyUntil) {
      if (phaseRemaining < 1.5) phaseRemaining = 1.5;
    }

    if (phase === 'question' || phase === 'bonus') {
      const whole = Math.ceil(Math.max(0, phaseRemaining));
      if (whole <= 5 && whole >= 1 && whole !== lastWholeSec) {
        lastWholeSec = whole;
        if (!teacherSpeaking) sfx.play('clockTick', 0.85);
        emitState();
      }
      if (!fiveSecWarned && phaseRemaining <= 5.1 && phaseRemaining > 2.5) {
        fiveSecWarned = true;
        if (curQ?.kind === 'math') {
          const pPlain = curQ.mathPromptPlain || String(curQ.mathExpr || '').replace('= ?', '').trim();
          speakImmediateWarn(`Sắp hết giờ rồi, phép tính ${pPlain} bằng bao nhiêu nào các bạn nhỏ ơi?`);
        } else {
          speakImmediateWarn(pickLine('timeWarn'));
        }
      }
      if (phase === 'question' && !halfQuietSaid && phaseRemaining <= phaseDuration * 0.5 && qCorrectList.length === 0) {
        halfQuietSaid = true;
        enqueueChatter(pickLine('quietHalfway'), false);
      }
      if (now >= nextEngageAt) {
        nextEngageAt = now + 95000;
        runIdleEngage();
      }
    }

    if (phaseRemaining > 0) return;

    // Chuyển pha khi hết giờ
    if (phase === 'intro') {
      startQuestion(0);
    } else if (phase === 'question') {
      if (qCorrectList.length === 0 && cfg.lopAutoHint !== false) {
        enterBonus();
      } else {
        enterReveal();
      }
    } else if (phase === 'bonus') {
      enterReveal();
    } else if (phase === 'reveal') {
      const finishedCount = qIndex + 1;
      if (finishedCount < roundQuestions.length && finishedCount % 5 === 0) {
        enterPraise();
      } else if (finishedCount < roundQuestions.length) {
        startQuestion(qIndex + 1);
      } else {
        enterResults();
      }
    } else if (phase === 'praise') {
      startQuestion(qIndex + 1);
    } else if (phase === 'results') {
      enterRecess('');
    } else if (phase === 'recess') {
      if (recessState?.sub === 'play') {
        finishRecessPlay();
      } else if (recessState?.sub === 'result') {
        enterRecessChampionBoard();
      } else {
        enterVote();
      }
    } else if (phase === 'vote') {
      finishVote();
    }
  }

  // =========================================================================
  // PHẦN 2: VẼ SÂN KHẤU LỚP HỌC VIỆT NAM 2× HiDPI (1080×1920 -> 2160×3840)
  // =========================================================================
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

  function wrapLines(text, maxWidth, maxLines = 2) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = cur + ' ' + words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        cur = test;
      } else {
        lines.push(cur);
        cur = words[i];
        if (lines.length === maxLines - 1) {
          const rest = [cur, ...words.slice(i + 1)].join(' ');
          let trimmed = rest;
          while (trimmed.length > 4 && ctx.measureText(trimmed + '…').width > maxWidth) {
            trimmed = trimmed.slice(0, -1).trim();
          }
          lines.push(trimmed === rest ? rest : trimmed + '…');
          return lines;
        }
      }
    }
    lines.push(cur);
    return lines.slice(0, maxLines);
  }

  function fitText(text, maxW) {
    const s = String(text || '');
    if (ctx.measureText(s).width <= maxW) return s;
    let out = s;
    while (out.length > 2 && ctx.measureText(out + '…').width > maxW) out = out.slice(0, -1);
    return out + '…';
  }

  function drawAvatarCircle(url, fallbackName, cx, cy, radius, borderCol = '#ffffff', borderW = 3) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const img = getAvatarImg(url);
    if (img) {
      ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
    } else {
      const h = hashStr(fallbackName || 'u') % 360;
      const g = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      g.addColorStop(0, `hsl(${h}, 72%, 58%)`);
      g.addColorStop(1, `hsl(${(h + 40) % 360}, 68%, 42%)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(radius * 0.95)}px "Be Vietnam Pro", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const ch = String(fallbackName || '?').trim().charAt(0).toUpperCase() || '?';
      ctx.fillText(ch, cx, cy + 1);
    }
    ctx.restore();
    if (borderW > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = borderW;
      ctx.strokeStyle = borderCol;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 10 kiểu tóc nhìn từ phía sau chuẩn phong cách Lớp Học Chữ
  function drawBackHair(cx, cy, r, styleIdx, color) {
    ctx.save();
    ctx.fillStyle = color;
    const s = styleIdx % 10;
    // Đầu cơ bản
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Ánh tóc nhẹ phía đỉnh
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.35, r * 0.48, r * 0.22, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;

    if (s === 1) {
      // Tóc buộc 2 chùm hai bên + nơ hồng
      ctx.beginPath();
      ctx.ellipse(cx - r * 1.05, cy + r * 0.15, r * 0.36, r * 0.55, 0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 1.05, cy + r * 0.15, r * 0.36, r * 0.55, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx - r * 0.85, cy - r * 0.1, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.85, cy - r * 0.1, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (s === 2) {
      // Búi củ tỏi trên đỉnh
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.95, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.34, cy - r * 0.65);
      ctx.lineTo(cx + r * 0.34, cy - r * 0.65);
      ctx.stroke();
    } else if (s === 3) {
      // Tóc nam dựng nhọn năng động
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy - r * 0.7);
      ctx.lineTo(cx - r * 0.3, cy - r * 1.28);
      ctx.lineTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.25, cy - r * 1.32);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.75);
      ctx.closePath();
      ctx.fill();
    } else if (s === 4) {
      // Tóc bob ngang vai
      rrect(cx - r * 1.04, cy - r * 0.2, r * 2.08, r * 1.15, r * 0.45);
      ctx.fill();
    } else if (s === 5) {
      // Bím tóc đôi thả lưng
      ctx.lineWidth = r * 0.34;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.62, cy + r * 0.45);
      ctx.lineTo(cx - r * 0.72, cy + r * 1.35);
      ctx.moveTo(cx + r * 0.62, cy + r * 0.45);
      ctx.lineTo(cx + r * 0.72, cy + r * 1.35);
      ctx.stroke();
    } else if (s === 6) {
      // Đuôi ngựa buộc cao
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.55, r * 0.35, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 6, cy - 2, 12, 5);
    } else if (s === 7) {
      // Tóc xoăn xù
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * r * 0.78, cy + Math.sin(ang) * r * 0.78, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (s === 8) {
      // Tóc cài băng đô vàng
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.88, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (s === 9) {
      // Tóc đầu nấm dễ thương + mầm cây trên đỉnh
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx + 4, cy - r - 12, cx + 10, cy - r - 10);
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(cx + 11, cy - r - 11, 5, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawClassroomArchitecture(t, th) {
    // 1. Trần gỗ ngói ấm áp + xà ngang + đèn chao xanh trường học Việt Nam
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, 178);
    ceilGrad.addColorStop(0, th.ceilTop);
    ceilGrad.addColorStop(1, th.ceilBot);
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, W, 178);

    ctx.fillStyle = th.beam;
    for (let y = 26; y <= 156; y += 44) {
      ctx.fillRect(0, y, W, 10);
    }
    ctx.fillRect(0, 170, W, 12);

    // 3 đèn chao sắt tráng men xanh đung đưa nhẹ
    [230, 540, 850].forEach((lx, idx) => {
      const sway = Math.sin(t * 1.1 + idx * 1.4) * 2.5;
      ctx.save();
      ctx.strokeStyle = '#3f2718';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + sway, 112);
      ctx.stroke();

      // Ánh nắng/đèn vàng ấm toả nhẹ
      const glow = ctx.createRadialGradient(lx + sway, 134, 6, lx + sway, 152, 95);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
      glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx + sway, 145, 95, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1f6f54';
      ctx.beginPath();
      ctx.moveTo(lx + sway - 36, 126);
      ctx.quadraticCurveTo(lx + sway, 96, lx + sway + 36, 126);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lx + sway, 128, 9, 0, Math.PI);
      ctx.fill();
      ctx.restore();
    });

    // 2. Tường kem nắng ấm + chân tường gỗ
    const wallGrad = ctx.createLinearGradient(0, 182, 0, 770);
    wallGrad.addColorStop(0, th.wallTop);
    wallGrad.addColorStop(1, th.wallBot);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 182, W, 592);

    // Gạch mờ nhẹ tạo chiều sâu lớp học
    ctx.strokeStyle = th.brick;
    ctx.lineWidth = 1.5;
    for (let wy = 220; wy < 660; wy += 38) {
      const off = ((wy / 38) | 0) % 2 === 0 ? 0 : 36;
      for (let wx = -20 + off; wx < W; wx += 74) {
        ctx.strokeRect(wx, wy, 70, 34);
      }
    }

    // Ô cửa sổ nắng hai bên mép lớp + giàn hoa giấy hồng rực rỡ
    const drawSideWindow = (wx, isLeft) => {
      ctx.save();
      rrect(wx, 278, 62, 290, 8);
      ctx.clip();
      const sky = ctx.createLinearGradient(0, 278, 0, 568);
      sky.addColorStop(0, th.skyTop);
      sky.addColorStop(1, th.skyBot);
      ctx.fillStyle = sky;
      ctx.fillRect(wx, 278, 62, 290);

      // Tán cây xanh & chùm hoa giấy đung đưa ngoài sân trường
      ctx.fillStyle = th.leaf;
      ctx.beginPath();
      ctx.arc(wx + (isLeft ? 18 : 44), 515, 42, 0, Math.PI * 2);
      ctx.arc(wx + (isLeft ? 45 : 18), 475, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = th.flower;
      for (let i = 0; i < 9; i++) {
        const fx = wx + 12 + ((i * 19) % 42);
        const fy = 296 + i * 22 + Math.sin(t * 1.8 + i) * 2;
        ctx.beginPath();
        ctx.arc(fx, fy, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = th.frame;
      ctx.lineWidth = 6;
      rrect(wx, 278, 62, 290, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx, 422);
      ctx.lineTo(wx + 62, 422);
      ctx.stroke();
    };
    drawSideWindow(6, true);
    drawSideWindow(W - 68, false);

    // Ốp chân tường gỗ (wainscot)
    ctx.fillStyle = th.wainscot;
    ctx.fillRect(0, 675, W, 102);
    ctx.fillStyle = th.wainscotTrim;
    ctx.fillRect(0, 671, W, 6);
    ctx.fillRect(0, 773, W, 6);

    // 3. Nền gạch bông / gỗ ấm áp kéo dài suốt tới đáy 1920
    const floorGrad = ctx.createLinearGradient(0, 779, 0, H);
    floorGrad.addColorStop(0, th.floorA);
    floorGrad.addColorStop(1, th.floorB);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 779, W, H - 779);

    ctx.strokeStyle = th.floorLine;
    ctx.lineWidth = 1.5;
    for (let fy = 820; fy < H; fy += 68) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(W, fy);
      ctx.stroke();
    }
    for (let col = -3; col <= 9; col++) {
      const topX = W / 2 + (col - 3) * 150;
      const botX = W / 2 + (col - 3) * 235;
      ctx.beginPath();
      ctx.moveTo(topX, 779);
      ctx.lineTo(botX, H);
      ctx.stroke();
    }

    // Vệt nắng ấm chiếu xiên từ cửa sổ bên trái xuống lớp học
    ctx.save();
    const sun = ctx.createLinearGradient(0, 290, 480, 960);
    sun.addColorStop(0, 'rgba(255, 251, 214, 0.22)');
    sun.addColorStop(1, 'rgba(255, 251, 214, 0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.moveTo(0, 280);
    ctx.lineTo(290, 280);
    ctx.lineTo(620, 1020);
    ctx.lineTo(0, 1020);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Bảng tên gỗ đỉnh lớp + Khẩu hiệu đỏ vàng "TIÊN HỌC LỄ – HẬU HỌC VĂN"
    const clsName = (cfg.lopName || 'Lớp Học Chữ').toUpperCase();
    const qTotal = roundQuestions.length || 20;
    const qDisp = phase === 'intro' ? 'Mở đầu' : (qIndex >= 0 ? `Câu ${Math.min(qTotal, qIndex + 1)}/${qTotal}` : 'Giải lao');
    const headerText = `${clsName}  ·  Tiết ${Math.max(1, roundNum)}  ·  ${qDisp}  ·  ${players.size} bạn${reviewMode ? ' · Ôn bài' : ''}`;

    ctx.save();
    rrect(136, 160, W - 272, 52, 16);
    const woodG = ctx.createLinearGradient(0, 160, 0, 212);
    woodG.addColorStop(0, '#9a5828');
    woodG.addColorStop(1, '#6e3b16');
    ctx.fillStyle = woodG;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#fde68a';
    ctx.stroke();

    ctx.fillStyle = '#fef9c3';
    ctx.font = '800 22px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fitText(headerText, W - 306), W / 2, 187);

    // Khẩu hiệu truyền thống trường học Việt Nam
    rrect(210, 221, W - 420, 38, 8);
    ctx.fillStyle = '#b91c1c';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.font = '800 19px "Be Vietnam Pro", sans-serif';
    ctx.fillText('★  TIÊN HỌC LỄ  –  HẬU HỌC VĂN  ★', W / 2, 241);
    ctx.restore();
  }

  // ---------- Vẽ Bảng Phấn Xanh & Toàn bộ 8 Chế độ Bảng ----------
  function drawWoodTile(x, y, size, ch, style = 'wood') {
    ctx.save();
    rrect(x, y, size, size, Math.max(8, size * 0.18));
    if (style === 'wood') {
      const g = ctx.createLinearGradient(x, y, x, y + size);
      g.addColorStop(0, '#fef3c7');
      g.addColorStop(1, '#f59e0b');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#92400e';
      ctx.stroke();
      // Cạnh nổi 3D dưới đáy thẻ gỗ
      ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
      ctx.fillRect(x + 4, y + size - 6, size - 8, 4);
      ctx.fillStyle = '#3b1806';
    } else if (style === 'reveal') {
      const g = ctx.createLinearGradient(x, y, x, y + size);
      g.addColorStop(0, '#bbf7d0');
      g.addColorStop(1, '#22c55e');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
      ctx.fillStyle = '#052e16';
    } else if (style === 'hint') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.26)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
    }
    if (ch) {
      ctx.font = `900 ${Math.round(size * 0.56)}px "Be Vietnam Pro", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, x + size / 2, y + size / 2 + 1);
    }
    ctx.restore();
  }

  function drawChalkboard(t, th) {
    const bx = 76, by = 268, bw = W - 152, bh = 312;
    const isGolden = (phase === 'question' || phase === 'bonus' || phase === 'reveal') &&
      roundQuestions.length > 0 && qIndex === roundQuestions.length - 1;

    ctx.save();
    // Khung gỗ bảng đen (hoặc viền vàng rực cho Câu Hỏi Vàng x2)
    if (isGolden) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.75)';
      ctx.shadowBlur = 22 + Math.sin(t * 5) * 8;
    } else {
      ctx.shadowColor = 'rgba(45, 25, 10, 0.28)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    rrect(bx - 12, by - 12, bw + 24, bh + 24, 18);
    ctx.fillStyle = isGolden ? '#eab308' : th.frame;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.lineWidth = 3;
    ctx.strokeStyle = isGolden ? '#fef08a' : th.frameHi;
    ctx.stroke();

    // Mặt bảng phấn xanh thẫm
    rrect(bx, by, bw, bh, 10);
    const bg = ctx.createLinearGradient(bx, by, bx, by + bh);
    bg.addColorStop(0, th.boardBg);
    bg.addColorStop(1, th.boardDark);
    ctx.fillStyle = bg;
    ctx.fill();

    // Máng để phấn & khăn lau bảng
    ctx.fillStyle = th.frameHi;
    ctx.fillRect(bx - 6, by + bh, bw + 12, 11);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 90, by + bh - 5, 28, 6);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(bx + 126, by + bh - 5, 24, 6);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(bx + 158, by + bh - 5, 22, 6);
    ctx.fillStyle = '#d97706';
    rrect(bx + bw - 140, by + bh - 12, 52, 13, 4);
    ctx.fill();

    // Vệt bụi phấn tự nhiên trên mặt bảng
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.ellipse(bx + bw * 0.35, by + bh * 0.45, 240, 85, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Nội dung trên bảng theo từng Pha
    const cx = bx + bw / 2;

    if (phase === 'intro') {
      const showWeek = roundNum % 2 === 0 && weekTop.length > 0;
      if (showWeek) {
        ctx.fillStyle = '#fde047';
        ctx.font = '800 28px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏅 BẢNG VÀNG TUẦN NÀY 🏅', cx, by + 48);
        const list = weekTop.slice(0, 6);
        list.forEach((u, idx) => {
          const col = idx < 3 ? 0 : 1;
          const row = idx % 3;
          const rx = bx + 44 + col * 430;
          const ry = by + 84 + row * 64;
          rrect(rx, ry, 405, 50, 12);
          ctx.fillStyle = idx === 0 ? 'rgba(250, 204, 21, 0.22)' : 'rgba(255,255,255,0.08)';
          ctx.fill();
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
          ctx.fillStyle = '#fde047';
          ctx.font = '800 22px "Be Vietnam Pro", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(medal, rx + 14, ry + 32);
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 21px "Be Vietnam Pro", sans-serif';
          ctx.fillText(fitText(u.nickname, 235), rx + 58, ry + 32);
          ctx.fillStyle = '#86efac';
          ctx.textAlign = 'right';
          ctx.font = '800 21px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`${u.score}đ`, rx + 390, ry + 32);
        });
      } else {
        ctx.fillStyle = '#fde047';
        ctx.font = '900 38px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(reviewMode ? `📖 GIỜ ÔN BÀI TIẾT ${roundNum}` : `🔔 TIẾT ${Math.max(1, roundNum)} BẮT ĐẦU!`, cx, by + 76);

        if (votedTopic) {
          rrect(cx - 210, by + 98, 420, 40, 20);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.font = '800 21px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`📚 Chủ đề ưu tiên: ${votedTopic}`, cx, by + 124);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 24px "Be Vietnam Pro", sans-serif';
        ctx.fillText('Nhìn chữ xáo trên bảng → Gõ đáp án có dấu vào bình luận!', cx, by + 182);
        ctx.fillStyle = '#bbf7d0';
        ctx.font = '700 21px "Be Vietnam Pro", sans-serif';
        ctx.fillText('20 câu hỏi · 4 bài toán nhẩm · Câu 20 nhân đôi điểm · Chọn ra 👑 Lớp Trưởng!', cx, by + 228);
        ctx.fillStyle = 'rgba(255,255,255,0.78)';
        ctx.font = '600 18px "Be Vietnam Pro", sans-serif';
        ctx.fillText('🎁 Tặng quà lên bục tặng hoa Cô Giáo · ❤️ Đủ tim cả lớp vỗ tay!', cx, by + 272);
      }
      ctx.restore();
      return;
    }

    if (phase === 'praise') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 30px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🌟 TUYÊN DƯƠNG TOP ĐẦU SAU CÂU ${qIndex + 1} 🌟`, cx, by + 46);

      const allRanked = benchOrder.map((uid) => players.get(uid)).filter((p) => p && p.score > 0);
      const top3 = allRanked.slice(0, 3);
      const cardH = allRanked.length > 3 ? 182 : 198;
      top3.forEach((p, idx) => {
        const cardW = 272;
        const gap = 22;
        const startX = cx - ((top3.length * cardW + (top3.length - 1) * gap) / 2);
        const x = startX + idx * (cardW + gap);
        const y = by + 70;
        rrect(x, y, cardW, cardH, 16);
        ctx.fillStyle = idx === 0 ? 'rgba(250, 204, 21, 0.24)' : 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = idx === 0 ? '#fde047' : 'rgba(255,255,255,0.3)';
        ctx.stroke();

        drawAvatarCircle(p.avatar, p.nickname, x + cardW / 2, y + 52, 32, idx === 0 ? '#fde047' : '#ffffff', 3);
        const badge = idx === 0 ? '👑 Hạng 1' : idx === 1 ? '🥈 Hạng 2' : '🥉 Hạng 3';
        ctx.fillStyle = '#fde047';
        ctx.font = '800 18px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badge, x + cardW / 2, y + 108);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 20px "Be Vietnam Pro", sans-serif';
        ctx.fillText(fitText(p.nickname, cardW - 24), x + cardW / 2, y + 136);
        ctx.fillStyle = '#86efac';
        ctx.font = '900 21px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`${p.score} điểm ${p.deskGifts.slice(-1)[0] || '🎁'}`, x + cardW / 2, y + 166);
      });
      if (allRanked.length > 3) {
        const extra = allRanked.slice(3, 6).map((p, i) => `Hạng ${i + 4}: ${p.nickname} (${p.score}đ)`).join('  ·  ');
        ctx.fillStyle = '#fef08a';
        ctx.font = '700 18.5px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(fitText(extra, bw - 60), cx, by + 280);
      }
      ctx.restore();
      return;
    }

    if (phase === 'results') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 30px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🏆 BẢNG VÀNG TỔNG KẾT TIẾT ${roundNum} 🏆`, cx, by + 46);

      const ranked = benchOrder.map((uid) => players.get(uid)).filter((p) => p && p.score > 0).slice(0, 6);
      if (!ranked.length) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 25px "Be Vietnam Pro", sans-serif';
        ctx.fillText('Tiết này chưa ai ghi điểm — Chuẩn bị ra chơi rồi phục thù tiết sau nhé!', cx, by + 168);
      } else {
        ranked.forEach((p, idx) => {
          const col = idx < 3 ? 0 : 1;
          const row = idx % 3;
          const rx = bx + 38 + col * 434;
          const ry = by + 76 + row * 68;
          rrect(rx, ry, 416, 54, 14);
          ctx.fillStyle = idx === 0 ? 'rgba(250, 204, 21, 0.28)' : 'rgba(255,255,255,0.09)';
          ctx.fill();
          drawAvatarCircle(p.avatar, p.nickname, rx + 34, ry + 27, 20, idx === 0 ? '#fde047' : '#ffffff', 2);
          const prefix = idx === 0 ? '👑 ' : idx === 1 ? '⭐ ' : idx === 2 ? '⭐ ' : `${idx + 1}. `;
          ctx.fillStyle = idx === 0 ? '#fef08a' : '#ffffff';
          ctx.font = '800 20px "Be Vietnam Pro", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(fitText(prefix + p.nickname, 250), rx + 64, ry + 34);
          ctx.fillStyle = '#86efac';
          ctx.textAlign = 'right';
          ctx.font = '900 21px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`${p.score}đ`, rx + 398, ry + 34);
        });
      }
      ctx.restore();
      return;
    }

    if (phase === 'recess' && recessState) {
      drawRecessBoard(bx, by, bw, bh);
      ctx.restore();
      return;
    }

    if (phase === 'vote' && voteState) {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 28px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🗳️ BÌNH CHỌN CHỦ ĐỀ TIẾT ${roundNum + 1} (${Math.ceil(Math.max(0, phaseRemaining))}s)`, cx, by + 48);

      let c1 = 0, c2 = 0;
      for (const v of voteState.votes.values()) { if (v === 1) c1++; else c2++; }
      const tot = Math.max(1, c1 + c2);
      const p1 = Math.round((c1 / tot) * 100);
      const p2 = c1 + c2 === 0 ? 0 : 100 - p1;

      [0, 1].forEach((i) => {
        const ry = by + 88 + i * 96;
        const pct = i === 0 ? p1 : p2;
        const cnt = i === 0 ? c1 : c2;
        rrect(bx + 60, ry, bw - 120, 74, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
        if (pct > 0) {
          rrect(bx + 60, ry, Math.max(36, ((bw - 120) * pct) / 100), 74, 16);
          ctx.fillStyle = i === 0 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(244, 114, 182, 0.42)';
          ctx.fill();
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = i === 0 ? '#38bdf8' : '#f472b6';
        rrect(bx + 60, ry, bw - 120, 74, 16);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 24px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Gõ ${i + 1}:  ${voteState.options[i]}`, bx + 88, ry + 45);
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'right';
        ctx.fillText(`${cnt} phiếu (${pct}%)`, bx + bw - 88, ry + 45);
      });
      ctx.restore();
      return;
    }

    // ---- Chế độ Câu hỏi / Giờ thêm / Mở đáp án ----
    if (!curQ) { ctx.restore(); return; }

    // Dòng tiêu đề trên cùng mặt bảng
    let badgeText = `📚 ${curQ.category}`;
    let badgeBg = 'rgba(255,255,255,0.14)';
    if (curQ.slot === 'meo') { badgeText = '🤪 Đố mẹo'; badgeBg = 'rgba(244, 63, 94, 0.35)'; }
    else if (curQ.slot === 'su') { badgeText = '📜 Lịch sử Việt Nam'; badgeBg = 'rgba(217, 119, 6, 0.38)'; }
    else if (curQ.slot === 'anh') { badgeText = '🔤 Tiếng Anh'; badgeBg = 'rgba(56, 189, 248, 0.34)'; }
    else if (curQ.kind === 'math') { badgeText = '🧮 Toán tính nhẩm'; badgeBg = 'rgba(168, 85, 247, 0.36)'; }

    ctx.font = '800 19px "Be Vietnam Pro", sans-serif';
    const bWidth = Math.min(420, ctx.measureText(badgeText).width + 34);
    rrect(bx + 22, by + 16, bWidth, 36, 18);
    ctx.fillStyle = badgeBg;
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, bx + 39, by + 35);

    if (isGolden) {
      const gx = bx + 32 + bWidth;
      rrect(gx, by + 16, 232, 36, 18);
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.fillStyle = '#422006';
      ctx.font = '900 18px "Be Vietnam Pro", sans-serif';
      ctx.fillText('⭐ CÂU HỎI VÀNG x2', gx + 16, by + 35);
    } else if (phase === 'bonus') {
      const gx = bx + 32 + bWidth;
      rrect(gx, by + 16, 210, 36, 18);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#422006';
      ctx.font = '900 18px "Be Vietnam Pro", sans-serif';
      ctx.fillText('💡 +10 GIÂY GỢI Ý', gx + 16, by + 35);
    }

    // Đồng hồ tròn góc phải bảng phấn
    const tcx = bx + bw - 48, tcy = by + 42, tr = 27;
    ctx.beginPath();
    ctx.arc(tcx, tcy, tr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fill();
    const frac = phaseDuration > 0 ? Math.max(0, Math.min(1, phaseRemaining / phaseDuration)) : 0;
    const lowTime = (phase === 'question' || phase === 'bonus') && boardReady && phaseRemaining <= 5;
    ctx.beginPath();
    ctx.arc(tcx, tcy, tr - 3, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = phase === 'reveal' ? '#4ade80' : lowTime ? '#fb7185' : '#fde047';
    ctx.stroke();

    ctx.fillStyle = lowTime ? '#fecdd3' : '#ffffff';
    ctx.font = '900 20px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const timerTxt = phase === 'reveal' ? '✓' : (!boardReady ? '👂' : `${Math.ceil(Math.max(0, phaseRemaining))}`);
    ctx.fillText(timerTxt, tcx, tcy + 1);

    // Dòng gợi ý câu đố (clue)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    const clueLines = wrapLines(curQ.clue, bw - 140, 2);
    clueLines.forEach((ln, idx) => {
      ctx.fillText(ln, cx, by + 76 + idx * 31);
    });

    // Nếu Cô Giáo đang đọc đề & chưa hô "Bắt đầu!": hiện "👂 Nghe cô đọc đề nè…" (chống lộ chữ sớm)
    if (phase === 'question' && !boardReady) {
      const pulse = 1 + Math.sin(t * 4.5) * 0.025;
      ctx.save();
      ctx.translate(cx, by + 206);
      ctx.scale(pulse, pulse);
      rrect(-250, -36, 500, 72, 36);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = '800 27px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👂 Nghe cô đọc đề nè…', 0, 2);
      ctx.restore();
      ctx.restore();
      return;
    }

    const topPodiumText = qCorrectList.length > 0
      ? qCorrectList.slice(0, 3).map((u, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.nickname}`).join('  ·  ')
      : '';

    // Câu Toán tính nhẩm
    if (curQ.kind === 'math') {
      const shownExpr = phase === 'reveal'
        ? curQ.mathExpr.replace('?', curQ.answer)
        : curQ.mathExpr;
      ctx.fillStyle = phase === 'reveal' ? '#86efac' : '#fde047';
      ctx.font = '900 66px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shownExpr, cx, by + 196);

      ctx.fillStyle = phase === 'reveal' ? '#fef08a' : 'rgba(255,255,255,0.85)';
      ctx.font = '700 19.5px "Be Vietnam Pro", sans-serif';
      const mathFoot = phase === 'reveal'
        ? (topPodiumText
          ? `${topPodiumText}${qCorrectList.length > 3 ? `  (+${qCorrectList.length - 3} bạn)` : ''}`
          : '⏰ Hết giờ · Câu sau cố lên nha cả lớp!')
        : `💬 Gõ kết quả bằng số vào bình luận · Đã có ${qCorrectList.length} bạn giải ra`;
      ctx.fillText(fitText(mathFoot, bw - 48), cx, by + 278);
      ctx.restore();
      return;
    }

    // Câu Ghép chữ: Hàng 1 = Thẻ gỗ xáo chữ (ngăn cách bằng dấu "/"), Hàng 2 = Ô đáp án
    const totalChars = scrambledGroups.reduce((acc, g) => acc + g.length, 0);
    const slashCount = Math.max(0, scrambledGroups.length - 1);
    const maxAvailW = bw - 64;
    const gap = totalChars > 11 ? 6 : 8;
    const slashW = slashCount > 0 ? 22 : 0;
    const tileSize = Math.min(58, Math.max(36, Math.floor((maxAvailW - slashCount * slashW - (totalChars - 1) * gap) / Math.max(1, totalChars))));

    // Tính tổng chiều rộng hàng thẻ gỗ
    const totalRowW = totalChars * tileSize + Math.max(0, totalChars - scrambledGroups.length) * gap + slashCount * (slashW + gap * 2);
    let tx = cx - totalRowW / 2;
    const ty = by + 140;

    scrambledGroups.forEach((grp, gIdx) => {
      grp.forEach((ch, cIdx) => {
        const bob = phase === 'reveal' ? 0 : Math.sin(t * 3 + gIdx + cIdx * 0.7) * 1.6;
        drawWoodTile(tx, ty + bob, tileSize, ch, 'wood');
        tx += tileSize + (cIdx < grp.length - 1 ? gap : 0);
      });
      if (gIdx < scrambledGroups.length - 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = `900 ${Math.round(tileSize * 0.62)}px "Be Vietnam Pro", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('/', tx + gap + slashW / 2, ty + tileSize / 2);
        tx += slashW + gap * 2;
      }
    });

    // Hàng 2: Ô điền đáp án (hiện chữ gợi ý hoặc mở toàn bộ đáp án ở pha reveal)
    const slotSize = Math.min(54, tileSize);
    const wordGap = answerWords.length > 1 ? 20 : 0;
    const slotTotalW = totalChars * slotSize + Math.max(0, totalChars - answerWords.length) * gap + Math.max(0, answerWords.length - 1) * wordGap;
    let sx = cx - slotTotalW / 2;
    const sy = by + 216;
    let flatPos = 0;

    answerWords.forEach((word, wIdx) => {
      const chars = [...word];
      chars.forEach((ch, cIdx) => {
        if (phase === 'reveal') {
          drawWoodTile(sx, sy, slotSize, ch, 'reveal');
        } else if (revealedIdx.has(flatPos)) {
          drawWoodTile(sx, sy, slotSize, ch, 'hint');
        } else {
          drawWoodTile(sx, sy, slotSize, '', 'slot');
        }
        flatPos += 1;
        sx += slotSize + (cIdx < chars.length - 1 ? gap : 0);
      });
      if (wIdx < answerWords.length - 1) sx += wordGap;
    });

    // Dòng trạng thái chân bảng
    ctx.fillStyle = phase === 'reveal' ? '#fef08a' : 'rgba(255,255,255,0.84)';
    ctx.font = '700 18.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const footMsg = phase === 'reveal'
      ? (topPodiumText
        ? `✅ ${curQ.answer}  ·  ${topPodiumText}${qCorrectList.length > 3 ? ` (+${qCorrectList.length - 3})` : ''}`
        : `✅ Đáp án: ${curQ.answer}  ·  Câu sau cố lên nhé!`)
      : `✍️ Gõ đáp án ${(Boolean(cfg.lopRequireTone) && !cfg.lopAcceptNoTone) ? 'CÓ DẤU' : 'vào bình luận'} (${totalChars} chữ cái)  ·  ⚡ ${qCorrectList.length} bạn đã giải ra`;
    ctx.fillText(fitText(footMsg, bw - 44), cx, by + 290);
    ctx.restore();
  }

  function drawRecessBoard(bx, by, bw, bh) {
    const cx = bx + bw / 2;
    const st = recessState;
    if (st.sub === 'board') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 29px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑 LỚP TRƯỞNG CÁC TIẾT HÔM NAY 👑', cx, by + 48);
      const list = [...roundChampions.values()].sort((a, b) => b.count - a.count).slice(0, 6);
      list.forEach((c, idx) => {
        const col = idx < 3 ? 0 : 1;
        const row = idx % 3;
        const rx = bx + 42 + col * 430;
        const ry = by + 84 + row * 66;
        rrect(rx, ry, 410, 52, 14);
        ctx.fillStyle = idx === 0 ? 'rgba(250, 204, 21, 0.25)' : 'rgba(255,255,255,0.1)';
        ctx.fill();
        drawAvatarCircle(c.avatar, c.nickname, rx + 32, ry + 26, 19, '#fde047', 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 20px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(fitText(c.nickname, 235), rx + 62, ry + 32);
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'right';
        ctx.fillText(`👑 ×${c.count}`, rx + 394, ry + 32);
      });
      return;
    }

    const sec = Math.ceil(Math.max(0, phaseRemaining));
    if (st.game === 'rps') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 29px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✊✌️🖐️ GIỜ RA CHƠI: OẲN TÙ TÌ CÙNG CÔ (${sec}s)`, cx, by + 48);
      if (st.sub === 'play') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 26px "Be Vietnam Pro", sans-serif';
        ctx.fillText('✊ Gõ BÚA (1)    ·    ✌️ Gõ KÉO (2)    ·    🖐️ Gõ BAO (3)', cx, by + 148);
        ctx.fillStyle = '#86efac';
        ctx.font = '700 22px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`Thắng Cô được +2 điểm! Đã có ${st.picks.size} bạn ra tay`, cx, by + 225);
      } else {
        const ico = st.teacherHand === 'búa' ? '✊ BÚA' : st.teacherHand === 'kéo' ? '✌️ KÉO' : '🖐️ BAO';
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 46px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`Cô Giáo ra: ${ico}!`, cx, by + 150);
        ctx.fillStyle = '#86efac';
        ctx.font = '800 24px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`🎉 ${st.winCnt || 0} bạn thắng Cô (+2đ)  ·  😅 ${st.loseCnt || 0} bạn thua Cô`, cx, by + 235);
      }
    } else if (st.game === 'callup') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 27px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`📢 KIỂM TRA MIỆNG (+5 ĐIỂM) · ${sec}s`, cx, by + 44);
      drawAvatarCircle(st.targetAvatar, st.targetName, bx + 95, by + 145, 42, '#fde047', 3);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 23px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Mời bạn: ${fitText(st.targetName, 360)}`, bx + 156, by + 112);
      ctx.font = '700 20px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#bbf7d0';
      ctx.fillText(fitText(st.q.clue, 690), bx + 156, by + 148);

      const letters = st.sub === 'result' ? [...lettersOf(st.q.answer)] : st.scrambled.flat();
      let lx = bx + 156;
      letters.forEach((ch) => {
        drawWoodTile(lx, by + 176, 46, ch, st.sub === 'result' ? 'reveal' : 'wood');
        lx += 54;
      });
    } else if (st.game === 'pick') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 28px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚖️ CHỌN PHE GIỜ RA CHƠI (${sec}s)`, cx, by + 48);
      let c1 = 0, c2 = 0;
      for (const v of st.votes.values()) { if (v === 1) c1++; else c2++; }
      const tot = Math.max(1, c1 + c2);
      const p1 = c1 + c2 === 0 ? 50 : Math.round((c1 / tot) * 100);
      const p2 = c1 + c2 === 0 ? 50 : 100 - p1;

      ctx.font = '800 28px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'left';
      ctx.fillText(`1️⃣ ${st.a} (${c1})`, bx + 64, by + 128);
      ctx.fillStyle = '#f9a8d4';
      ctx.textAlign = 'right';
      ctx.fillText(`(${c2}) ${st.b} 2️⃣`, bx + bw - 64, by + 128);

      rrect(bx + 64, by + 158, bw - 128, 56, 28);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      rrect(bx + 64, by + 158, Math.max(48, ((bw - 128) * p1) / 100), 56, 28);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '900 23px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`${p1}%  vs  ${p2}%`, cx, by + 193);
      ctx.font = '700 20px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Gõ số 1 hoặc số 2 vào bình luận để bảo vệ phe của bạn!', cx, by + 262);
    } else if (st.game === 'roll') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 28px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🙋 ĐIỂM DANH SIÊU TỐC (+3 ĐIỂM) · ${sec}s`, cx, by + 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 23px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Gõ "CÓ MẶT" thật nhanh — 10 bạn đầu tiên nhận +3đ! (${st.list.length}/10)`, cx, by + 98);

      st.list.slice(0, 10).forEach((item, idx) => {
        const col = idx % 5;
        const row = Math.floor(idx / 5);
        const rx = bx + 34 + col * 174;
        const ry = by + 132 + row * 72;
        rrect(rx, ry, 162, 54, 14);
        ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 17px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(fitText(`✓ ${item.nickname}`, 146), rx + 81, ry + 33);
      });
    } else if (st.game === 'heart') {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 28px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`❤️ THỬ THÁCH BÃO TIM CẢ LỚP (${sec}s)`, cx, by + 50);
      const pct = Math.min(1, st.count / Math.max(1, st.target));
      rrect(bx + 70, by + 118, bw - 140, 64, 32);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
      if (pct > 0) {
        rrect(bx + 70, by + 118, Math.max(54, (bw - 140) * pct), 64, 32);
        const hg = ctx.createLinearGradient(bx + 70, 0, bx + bw - 70, 0);
        hg.addColorStop(0, '#f43f5e');
        hg.addColorStop(1, '#fbbf24');
        ctx.fillStyle = hg;
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`❤️ ${st.count} / ${st.target} tim`, cx, by + 158);
      ctx.fillStyle = '#bbf7d0';
      ctx.font = '700 21px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Bấm thả tim liên tục vào màn hình — Đủ tim cả lớp được +1 điểm!', cx, by + 242);
    }
  }

  // ---------- Vẽ Khu vực Bục Giảng: Bảng Xuất Sắc Hôm Nay + Cô Giáo Áo Dài + Bình Hoa + Nhanh Nhất ----------
  function drawPodiumZone(t) {
    // 1. Tờ giấy ghim đinh ghim đỏ bên trái: "📌 🏆 Học sinh xuất sắc hôm nay"
    ctx.save();
    ctx.translate(188, 676);
    ctx.rotate(-0.025);
    ctx.shadowColor = 'rgba(60, 35, 10, 0.18)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    rrect(-132, -82, 264, 164, 10);
    ctx.fillStyle = '#fffdf5';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e5cfa3';
    ctx.stroke();

    // Đinh ghim đỏ
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -74, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(-2, -76, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.font = '900 16px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 XUẤT SẮC HÔM NAY', 0, -48);

    const dailySource = todayTop.length > 0
      ? todayTop.slice(0, 4)
      : benchOrder.map((u) => players.get(u)).filter((p) => p && p.score > 0).slice(0, 4);

    if (!dailySource.length) {
      ctx.fillStyle = '#78716c';
      ctx.font = '600 15px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Trả lời đúng để ghi tên', 0, -4);
      ctx.fillText('lên bảng vàng hôm nay!', 0, 20);
    } else {
      dailySource.forEach((u, idx) => {
        const y = -22 + idx * 29;
        const m = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '4.';
        ctx.textAlign = 'left';
        ctx.font = '800 15.5px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#451a03';
        ctx.fillText(`${m} ${fitText(u.nickname, 155)}`, -116, y);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#b45309';
        ctx.fillText(`${u.score}đ`, 116, y);
      });
    }
    ctx.restore();

    // 2. Góc bục phạt "😅 Học sinh cá biệt" (nếu có bạn vừa bị cô gọi lên đứng)
    podiumPunished.slice(0, 2).forEach((pu, idx) => {
      const px = 368 + idx * 66;
      const py = 708;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath();
      ctx.ellipse(px, py + 44, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Áo trắng khăn quàng đỏ
      rrect(px - 16, py + 8, 32, 34, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(px - 10, py + 10);
      ctx.lineTo(px + 10, py + 10);
      ctx.lineTo(px, py + 24);
      ctx.closePath();
      ctx.fill();
      drawAvatarCircle(pu.avatar, pu.nickname, px, py - 10, 21, '#fb7185', 2.5);
      ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#991b1b';
      rrect(px - 44, py - 48, 88, 20, 10);
      ctx.fillStyle = '#fee2e2';
      ctx.fill();
      ctx.fillStyle = '#b91c1c';
      ctx.fillText('😅 Cá biệt', px, py - 34);
      ctx.restore();
    });

    // 3. Cô Giáo Áo Dài Trắng & Bàn Giáo Viên + Bình Hoa Tươi ở trung tâm
    const tx = 536, ty = 668;
    const breath = Math.sin(t * 2.4) * 2;
    ctx.save();
    // Tóc dài đen mượt sau lưng Cô Giáo
    ctx.fillStyle = '#1e1b24';
    rrect(tx - 28, ty - 58 + breath, 56, 72, 24);
    ctx.fill();

    // Tà Áo Dài trắng thướt tha + cổ áo + hoa cài ngực
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(tx - 24, ty - 6 + breath);
    ctx.lineTo(tx + 24, ty - 6 + breath);
    ctx.lineTo(tx + 32, ty + 62);
    ctx.lineTo(tx - 32, ty + 62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Tay phải Cô cầm thước gỗ chỉ lên bảng xanh
    const pointWave = teacherSpeaking ? Math.sin(t * 8) * 0.14 : Math.sin(t * 1.8) * 0.05;
    ctx.save();
    ctx.translate(tx + 22, ty + 4 + breath);
    ctx.rotate(-0.75 + pointWave);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, -12);
    ctx.stroke();
    // Cây thước chỉ bảng
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(24, -12);
    ctx.lineTo(68, -42);
    ctx.stroke();
    ctx.restore();

    // Khuôn mặt hiền dịu của Cô Giáo
    ctx.fillStyle = '#fde2c4';
    ctx.beginPath();
    ctx.arc(tx, ty - 34 + breath, 24, 0, Math.PI * 2);
    ctx.fill();

    // Mái tóc uốn nhẹ
    ctx.fillStyle = '#1e1b24';
    ctx.beginPath();
    ctx.arc(tx, ty - 40 + breath, 25, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();

    // Kính tròn tri thức + mắt chớp tự nhiên + miệng mấp máy khi đọc đề
    const blink = (Math.floor(t * 1.7) % 9 === 0 && (t * 1.7) % 1 < 0.15);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(tx - 9, ty - 34 + breath, 6.5, 0, Math.PI * 2);
    ctx.arc(tx + 9, ty - 34 + breath, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    if (blink) {
      ctx.fillRect(tx - 12, ty - 34 + breath, 6, 1.8);
      ctx.fillRect(tx + 6, ty - 34 + breath, 6, 1.8);
    } else {
      ctx.beginPath();
      ctx.arc(tx - 9, ty - 34 + breath, 2.5, 0, Math.PI * 2);
      ctx.arc(tx + 9, ty - 34 + breath, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.arc(tx - 15, ty - 27 + breath, 4, 0, Math.PI * 2);
    ctx.arc(tx + 15, ty - 27 + breath, 4, 0, Math.PI * 2);
    ctx.fill();

    // Miệng Cô Giáo
    ctx.fillStyle = '#e11d48';
    if (teacherSpeaking && Math.sin(t * 18) > 0) {
      ctx.beginPath();
      ctx.ellipse(tx, ty - 23 + breath, 4.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(tx, ty - 25 + breath, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Bàn gỗ Giáo Viên phía trước Cô
    rrect(tx - 82, ty + 46, 164, 54, 10);
    const deskG = ctx.createLinearGradient(0, ty + 46, 0, ty + 100);
    deskG.addColorStop(0, '#c27c3e');
    deskG.addColorStop(1, '#8c4f20');
    ctx.fillStyle = deskG;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#5c3111';
    ctx.stroke();
    ctx.fillStyle = '#fef3c7';
    ctx.font = '800 14px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CÔ GIÁO CHỦ NHIỆM', tx, ty + 78);

    // Chồng sổ đầu bài bên trái bàn giáo viên
    ctx.fillStyle = '#2563eb';
    rrect(tx - 70, ty + 32, 38, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    rrect(tx - 66, ty + 22, 34, 11, 3);
    ctx.fill();

    // Bình hoa trên bàn giáo viên (tích luỹ hoa khi học sinh tặng quà!)
    const vx = tx + 54, vy = ty + 34;
    ctx.fillStyle = '#fef9c3';
    rrect(vx - 14, vy - 8, 28, 24, 8);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    const flowersToShow = vaseItems.length ? vaseItems : ['🌸'];
    flowersToShow.slice(-8).forEach((fl, fi) => {
      const ang = -0.7 + (fi / Math.max(1, flowersToShow.slice(-8).length - 1)) * 1.4;
      const fx = vx + Math.sin(ang) * 18;
      const fy = vy - 18 - (fi % 2) * 8;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(fl, fx, fy);
    });
    if (totalBouquets > 0) {
      rrect(vx - 26, vy + 18, 52, 20, 10);
      ctx.fillStyle = '#fffbeb';
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.font = '800 12.5px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`💐 ${totalBouquets}`, vx, vy + 31);
    }

    // Nhãn "💕 N bạn yêu cô" nếu đang diễn ra
    if (loveSession && loveSession.users.size > 0) {
      rrect(tx - 76, ty - 92, 152, 28, 14);
      ctx.fillStyle = '#fdf2f8';
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#be185d';
      ctx.font = '800 15px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`💕 ${loveSession.users.size} bạn yêu cô`, tx, ty - 74);
    }
    ctx.restore();

    // 4. Bảng phải bục giảng: Bình chọn vui 1 chữ (nếu đang bật) HOẶC "⚡ Nhanh nhất câu này" + Mẹo ghế ngồi
    ctx.save();
    const rx = 648, ry = 594, rw = 376, rh = 162;
    rrect(rx, ry, rw, rh, 16);
    ctx.fillStyle = 'rgba(255, 252, 245, 0.95)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#d9b382';
    ctx.stroke();

    if (activePoll) {
      ctx.fillStyle = '#7c2d12';
      ctx.font = '900 16px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🗳️ BÌNH CHỌN VUI CÙNG CÔ', rx + 16, ry + 26);

      const tot = Math.max(1, activePoll.votes.size);
      activePoll.opts.slice(0, 3).forEach((opt, idx) => {
        let cnt = 0;
        for (const v of activePoll.votes.values()) if (v === opt.key) cnt++;
        const pct = activePoll.votes.size ? Math.round((cnt / tot) * 100) : 0;
        const oy = ry + 42 + idx * 36;
        rrect(rx + 16, oy, rw - 32, 28, 10);
        ctx.fillStyle = '#f3ead6';
        ctx.fill();
        if (pct > 0) {
          rrect(rx + 16, oy, Math.max(24, ((rw - 32) * pct) / 100), 28, 10);
          ctx.fillStyle = '#fde68a';
          ctx.fill();
        }
        ctx.fillStyle = '#451a03';
        ctx.font = '800 15px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Gõ ${opt.key.toUpperCase()}: ${opt.label}`, rx + 26, oy + 19);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#b45309';
        ctx.fillText(`${cnt} (${pct}%)`, rx + rw - 26, oy + 19);
      });
    } else {
      ctx.fillStyle = '#92400e';
      ctx.font = '900 16.5px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ NHANH NHẤT CÂU NÀY', rx + 16, ry + 26);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#be123c';
      ctx.font = '800 14.5px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`❤️ ${boostedHearts.toLocaleString('vi-VN')} tim`, rx + rw - 16, ry + 26);

      if (!fastestThree.length) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#78716c';
        ctx.font = '700 16px "Be Vietnam Pro", sans-serif';
        ctx.fillText('Ai gõ đúng nhanh nhất được +10đ!', rx + rw / 2, ry + 78);
      } else {
        fastestThree.slice(0, 3).forEach((item, idx) => {
          const iy = ry + 42 + idx * 29;
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#1e293b';
          ctx.font = '800 16px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`${medal} ${fitText(item.nickname, 235)}`, rx + 16, iy + 16);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#15803d';
          const ptsTxt = item.points > 0 ? `+${item.points}đ` : `${item.elapsedSec.toFixed(1)}s`;
          ctx.fillText(ptsTxt, rx + rw - 16, iy + 16);
        });
      }

      // Dải hướng dẫn xoay vòng dưới đáy thẻ
      const hints = [
        '👑 #1 Lớp Trưởng · ⭐ #2 #3 Lớp Phó · 30 ghế xếp theo điểm',
        '🎒 Điểm danh nhiều ngày liền nhận quà chuyên cần!',
        '🎁 Tặng quà lên bục tặng hoa · Quà ≥30💎 mở chữ cứu lớp!'
      ];
      const hTxt = hints[Math.floor(t / 5) % hints.length];
      rrect(rx + 10, ry + rh - 30, rw - 20, 22, 8);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.fillStyle = '#92400e';
      ctx.font = '700 12.8px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hTxt, rx + rw / 2, ry + rh - 15);
    }
    ctx.restore();
  }

  // ---------- Vẽ 4 Dãy Bàn Gỗ Dài (30 ghế) + Đứng Hai Bên Cửa (60 chỗ) + Hoa & Quà ----------
  function drawBenchesAndStudents(t) {
    const now = Date.now();
    const benchYs = BENCH_YS;
    const isBackMode = cfg.lopAvatarMode === 'back';

    // 1. Học sinh đứng xem hai bên cửa lớp (tối đa 60 bạn)
    standingOrder.forEach((uid, idx) => {
      const p = players.get(uid);
      if (!p) return;
      const sx = p.curX;
      const sy = p.curY;
      const hop = Math.abs(Math.sin(t * 2.5 + idx)) * 2.5;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      rrect(sx - 12, sy - 2 - hop, 24, 24, 7);
      ctx.fill();
      if (isBackMode) {
        drawBackHair(sx, sy - 16 - hop, 14, p.hairIdx, p.hairColor);
      } else {
        drawAvatarCircle(p.avatar, p.nickname, sx, sy - 16 - hop, 14, '#ffffff', 2);
      }
      if (idx < 6) {
        ctx.font = '700 11.5px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        const nw = Math.min(72, ctx.measureText(p.nickname).width + 10);
        rrect(sx - nw / 2, sy + 22, nw, 16, 6);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.fillText(fitText(p.nickname, 64), sx, sy + 33);
      }
      ctx.restore();
    });

    // 2. Vẽ từng dãy bàn dài từ trên xuống dưới (Bàn 1 -> Bàn 4)
    let seatCursor = 0;
    for (let b = 0; b < BENCH_SIZES.length; b++) {
      const count = BENCH_SIZES[b];
      const by = benchYs[b];

      // Ghế băng gỗ phía sau bàn
      ctx.save();
      rrect(94, by + 18, W - 188, 18, 6);
      ctx.fillStyle = '#854d27';
      ctx.fill();

      // Mặt bàn gỗ dài truyền thống trường học Việt Nam
      ctx.shadowColor = 'rgba(55, 30, 10, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      rrect(84, by - 16, W - 168, 42, 10);
      const dg = ctx.createLinearGradient(0, by - 16, 0, by + 26);
      dg.addColorStop(0, b === 0 ? '#eab308' : '#d69456');
      dg.addColorStop(0.18, '#c98243');
      dg.addColorStop(1, '#9a5b25');
      ctx.fillStyle = dg;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = b === 0 ? '#fde047' : '#6b3b16';
      ctx.stroke();

      // Chân bàn hai đầu + giữa
      ctx.fillStyle = '#5c3111';
      ctx.fillRect(104, by + 26, 12, 26);
      ctx.fillRect(W / 2 - 6, by + 26, 12, 26);
      ctx.fillRect(W - 116, by + 26, 12, 26);
      ctx.restore();

      // Vẽ từng chỗ ngồi trên dãy bàn b
      for (let c = 0; c < count; c++) {
        const rankIdx = seatCursor + c;
        const pos = seatPositionOf(rankIdx);
        const uid = benchOrder[rankIdx];
        const p = uid ? players.get(uid) : null;

        if (!p) {
          // Vở trắng mở sẵn trên chỗ trống mời gọi người xem bình luận vào ngồi
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          rrect(pos.x - 16, by - 8, 32, 20, 3);
          ctx.fill();
          ctx.fillStyle = 'rgba(92, 49, 17, 0.45)';
          ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`#${rankIdx + 1}`, pos.x, by + 6);
          ctx.restore();
          continue;
        }

        const px = p.curX;
        const py = p.curY;
        const isCeleb = now < p.celebrateUntil || now < classClapUntil;
        const isWrong = now < p.wrongUntil;
        const bounce = isCeleb ? Math.abs(Math.sin(t * 11 + rankIdx)) * 9 : Math.sin(t * 2.2 + rankIdx) * 1.5;
        const shake = isWrong ? Math.sin(t * 32) * 4 : 0;
        const sx = px + shake;
        const sy = py - bounce;

        ctx.save();
        // Vòng hào quang vàng cho Lớp Trưởng (#1) hoặc khi cả lớp vỗ tay
        if (rankIdx === 0 && p.score > 0) {
          const halo = ctx.createRadialGradient(sx, sy - 22, 8, sx, sy - 22, 48);
          halo.addColorStop(0, 'rgba(250, 204, 21, 0.52)');
          halo.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy - 22, 48, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vở ô li & bút mực đặt trên mặt bàn trước mặt học sinh
        ctx.fillStyle = '#ffffff';
        rrect(pos.x - 18, by - 9, 36, 22, 3);
        ctx.fill();
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x - 16, by - 7, 32, 18);

        // Quà thưởng đặt trên bàn của học sinh (kẹo mút, gấu bông, bánh sinh nhật...)
        if (p.deskGifts.length > 0) {
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          p.deskGifts.slice(-2).forEach((ico, gi) => {
            ctx.fillText(ico, pos.x + 24 + gi * 15, by + 6);
          });
        }

        // Thân áo đồng phục trắng + Khăn quàng đỏ Đội viên
        rrect(sx - 21, sy - 16, 42, 34, 12);
        ctx.fillStyle = p.tint || '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Khăn quàng đỏ thắm trên vai
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(sx - 15, sy - 14);
        ctx.lineTo(sx + 15, sy - 14);
        ctx.lineTo(sx, sy + 3);
        ctx.closePath();
        ctx.fill();

        // Tay giơ cao vẫy/vỗ tay khi trả lời đúng hoặc bão tim
        if (isCeleb) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sx - 18, sy - 8);
          ctx.lineTo(sx - 30, sy - 28 - Math.sin(t * 14) * 4);
          ctx.moveTo(sx + 18, sy - 8);
          ctx.lineTo(sx + 30, sy - 28 + Math.sin(t * 14) * 4);
          ctx.stroke();
        }

        // Đầu nhân vật: Chế độ Avatar TikTok tròn HOẶC Chế độ Quay lưng Lớp Học Chữ
        const headY = sy - 38;
        if (isBackMode) {
          drawBackHair(sx, headY, 24, p.hairIdx, p.hairColor);
        } else {
          // Tóc viền chibi ôm quanh Avatar tròn của người tham gia
          ctx.fillStyle = p.hairColor;
          ctx.beginPath();
          ctx.arc(sx, headY - 2, 27.5, 0, Math.PI * 2);
          ctx.fill();
          const borderCol = rankIdx === 0 && p.score > 0 ? '#fde047'
            : (rankIdx <= 2 && p.score > 0) ? '#38bdf8' : '#ffffff';
          drawAvatarCircle(p.avatar, p.nickname, sx, headY, 24, borderCol, 3);
        }

        // Vương miện Lớp Trưởng (#1) / Ngôi sao Lớp Phó (#2, #3) / Ký hiệu ngủ gật 💤
        if (rankIdx === 0 && p.score > 0) {
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', sx, headY - 30);
        } else if ((rankIdx === 1 || rankIdx === 2) && p.score > 0) {
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⭐', sx, headY - 29);
        } else if (p.sleeping) {
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💤', sx + 22, headY - 22 - Math.sin(t * 3) * 4);
        }
        if (now < classClapUntil) {
          ctx.font = '19px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👏', sx + 26, headY - 14);
        }

        // Thẻ tên + Hạng + Huy hiệu chuyên cần 🎒 + Điểm số ngay trước mặt bàn
        const attendTag = p.attendDays >= 2 ? `🎒${p.attendDays} ` : '';
        const nameLabel = `${attendTag}${fitText(p.nickname, 78)}`;
        const scoreLabel = p.score > 0 ? ` ${p.score}` : '';
        const tagW = count === 8 ? 104 : 116;
        const tagY = by + 18;

        rrect(pos.x - tagW / 2, tagY, tagW, 24, 12);
        ctx.fillStyle = rankIdx === 0 && p.score > 0 ? '#422006' : 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = rankIdx === 0 && p.score > 0 ? '#fbbf24' : '#d6b88d';
        ctx.stroke();

        ctx.font = '800 12.5px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rankIdx === 0 && p.score > 0 ? '#fef08a' : '#1e293b';
        ctx.fillText(fitText(`${rankIdx + 1}.${nameLabel}${scoreLabel}`, tagW - 10), pos.x, tagY + 12.5);
        ctx.restore();
      }
      seatCursor += count;
    }

    // 3. Vẽ bong bóng chat nổi phía trên đầu học sinh (vẽ sau cùng để không bị dãy sau đè lên)
    benchOrder.forEach((uid) => {
      const p = players.get(uid);
      if (!p || !p.bubbleText || now >= p.bubbleUntil) return;
      ctx.save();
      ctx.font = '700 14.5px "Be Vietnam Pro", sans-serif';
      const txt = fitText(p.bubbleText, 190);
      const bw = Math.min(212, Math.max(64, ctx.measureText(txt).width + 22));
      const bx = Math.max(24 + bw / 2, Math.min(W - 24 - bw / 2, p.curX));
      const by = p.curY - 88;

      rrect(bx - bw / 2, by - 16, bw, 30, 12);
      const isErr = txt.startsWith('❌');
      const isOk = txt.startsWith('✅');
      ctx.fillStyle = isErr ? '#fff1f2' : isOk ? '#f0fdf4' : '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isErr ? '#fb7185' : isOk ? '#4ade80' : '#f59e0b';
      ctx.stroke();

      ctx.fillStyle = isErr ? '#be123c' : isOk ? '#15803d' : '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, bx, by - 0.5);
      ctx.restore();
    });

    // 4. Nhân vật ôm bó hoa tươi đi bộ lên bục tặng Cô Giáo (`FlowerWalk`)
    flowerWalkers.forEach((fw) => {
      const p = fw.t / fw.dur;
      // 0..0.42: đi lên bục; 0.42..0.68: đứng trao hoa + tim bay; 0.68..1: đi về chỗ
      let wx = fw.fromX, wy = fw.fromY;
      const targetX = 505, targetY = 742;
      if (p < 0.42) {
        const k = p / 0.42;
        wx = fw.fromX + (targetX - fw.fromX) * k;
        wy = fw.fromY + (targetY - fw.fromY) * k;
      } else if (p < 0.68) {
        wx = targetX;
        wy = targetY;
      } else {
        const k = (p - 0.68) / 0.32;
        wx = targetX + (fw.fromX - targetX) * k;
        wy = targetY + (fw.fromY - targetY) * k;
      }
      const stepBob = Math.abs(Math.sin(fw.t * 14)) * 5;
      ctx.save();
      rrect(wx - 18, wy - 10 - stepBob, 36, 32, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      drawAvatarCircle(fw.avatar, fw.nickname, wx, wy - 30 - stepBob, 22, '#fbbf24', 3);
      if (p < 0.68) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💐', wx + 24, wy - 12 - stepBob);
      }
      if (p >= 0.4 && p <= 0.72) {
        ctx.font = '22px sans-serif';
        ctx.fillText('💖', wx + 18, wy - 56 - (p - 0.4) * 50);
      }
      ctx.restore();
    });

    // 5. Quà thưởng bay vòng cung từ tay Cô Giáo về bàn học sinh
    flyingGifts.forEach((fg) => {
      const targetP = players.get(fg.toUid);
      const tx = targetP ? targetP.seatX : W / 2;
      const ty = targetP ? targetP.seatY : 920;
      const k = Math.min(1, fg.t / fg.dur);
      const gx = fg.fromX + (tx - fg.fromX) * k;
      const gy = fg.fromY + (ty - fg.fromY) * k - Math.sin(k * Math.PI) * 140;
      ctx.save();
      ctx.font = `${Math.round(28 + Math.sin(k * Math.PI) * 14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fg.icon, gx, gy);
      ctx.restore();
    });

    // 6. Nhãn sĩ số lớp học gọn gàng dưới dãy bàn 4
    ctx.save();
    const statusTxt = standingOrder.length > 0
      ? `🎒 Bàn học: ${benchOrder.length}/${MAX_SEATS}  ·  👀 Đứng cửa lớp: ${standingOrder.length} bạn`
      : `🎒 Sĩ số lớp: ${benchOrder.length}/${MAX_SEATS} ghế  ·  💬 Gõ đáp án để tranh ghế Bàn Đầu!`;
    rrect(W / 2 - 295, 1626, 590, 36, 18);
    ctx.fillStyle = 'rgba(43, 29, 14, 0.86)';
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = '#fef9c3';
    ctx.font = '700 16px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(statusTxt, W / 2, 1645);
    ctx.restore();
  }

  function drawOverlaysAndParticles(t) {
    // Ánh sáng vàng ấm khi cả lớp vỗ tay ăn mừng 300 tim
    if (Date.now() < classClapUntil) {
      ctx.save();
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.45 + Math.sin(t * 10) * 0.2})`;
      ctx.lineWidth = 18;
      ctx.strokeRect(9, 9, W - 18, H - 18);
      ctx.restore();
    }

    // Băng rôn chúc mừng sinh nhật 🎂 (đặt dưới thanh sĩ số, không che học sinh hay bục giảng)
    if (birthdayBanner) {
      ctx.save();
      rrect(W / 2 - 360, 1678, 720, 56, 28);
      const bg = ctx.createLinearGradient(W / 2 - 360, 0, W / 2 + 360, 0);
      bg.addColorStop(0, '#ec4899');
      bg.addColorStop(0.5, '#f59e0b');
      bg.addColorStop(1, '#ec4899');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 23px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🎂 CHÚC MỪNG SINH NHẬT ${fitText(birthdayBanner.nickname.toUpperCase(), 320)}! 🎉`, W / 2, 1707);
      ctx.restore();
    }

    // Tim bay
    floatingHearts.forEach((h) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, h.alpha));
      ctx.font = `${Math.round(h.size)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(h.emoji, h.x, h.y);
      ctx.restore();
    });

    // Pháo giấy ăn mừng
    confetti.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = Math.min(1, c.life);
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    });
  }

  let lastDrawTs = 0;
  function renderFrame(ts) {
    rafId = 0;
    if (paused || cfg.mode !== 'lop' || !ctx) return;
    rafId = requestAnimationFrame(renderFrame);
    if (lastDrawTs && ts - lastDrawTs < FRAME_MS - 1) return;
    lastDrawTs = ts;

    const dt = lastFrameTs ? Math.min(0.1, (ts - lastFrameTs) / 1000) : (1 / 30);
    lastFrameTs = ts;
    const t = ts / 1000;

    updateSimulation(dt);

    const th = THEMES[cfg.lopTheme] || THEMES.classic;
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    drawClassroomArchitecture(t, th);
    drawChalkboard(t, th);
    drawPodiumZone(t);
    drawBenchesAndStudents(t);
    drawOverlaysAndParticles(t);

    ctx.restore();
  }

  function ensureLoop() {
    if (!rafId && !paused && cfg.mode === 'lop' && ctx) {
      lastFrameTs = 0;
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  // ---------- Lệnh điều khiển từ Bảng Chủ Kênh (`lop:command`) ----------
  const DEMO_STUDENTS = [
    'Minh Anh', 'Gia Bảo', 'Khánh Linh', 'Tuấn Kiệt', 'Bảo Ngọc', 'Hải Đăng',
    'Phương Nhi', 'Quốc Huy', 'Tường Vy', 'Nhật Minh', 'Cẩm Tú', 'Thảo Nguyên',
    'Đức Phúc', 'Ngọc Hân', 'Hoàng Nam', 'Bích Phương', 'Mii anime', 'Thỏ Con',
    'Bé Na', 'Gấu Trúc', 'Sóc Nhỏ', 'Thanh Tùng', 'Mai Phương', 'Trọng Nghĩa'
  ];

  function makeSvgAvatar(seed) {
    const cols = ['#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
    const c = cols[seed % cols.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${c}"/><circle cx="40" cy="42" r="20" fill="#fde68a"/><path d="M20 38 C22 18,58 18,60 38 Z" fill="#1e293b"/><circle cx="33" cy="42" r="3" fill="#1e293b"/><circle cx="47" cy="42" r="3" fill="#1e293b"/><path d="M34 51 Q40 57 46 51" fill="none" stroke="#be123c" stroke-width="3" stroke-linecap="round"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function runFloodDemo(count = 50) {
    const n = Math.min(250, Math.max(5, Number(count) || 50));
    if (phase === 'question' && !boardReady) showBoardNow();
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        if (cfg.mode !== 'lop') return;
        const base = DEMO_STUDENTS[i % DEMO_STUDENTS.length];
        const nick = i < DEMO_STUDENTS.length ? base : `${base} ${i + 1}`;
        const user = { id: `flood-${i + 1}`, uniqueId: `flood_${i + 1}`, nickname: nick, avatar: makeSvgAvatar(i) };
        let text = 'Em chào cô ạ!';
        if ((phase === 'question' || phase === 'bonus') && curQ) {
          if (Math.random() < 0.35) text = curQ.answer;
          else if (Math.random() < 0.65) text = curQ.kind === 'math' ? String(Number(curQ.answer) + rInt(-5, 5)) : 'BÁNH TRÁNG';
        } else if (phase === 'recess' && recessState) {
          if (recessState.game === 'rps') text = pickRand(['búa', 'kéo', 'bao']);
          else if (recessState.game === 'pick') text = Math.random() < 0.5 ? '1' : '2';
          else if (recessState.game === 'roll') text = 'có mặt';
        } else if (phase === 'vote') {
          text = Math.random() < 0.55 ? '1' : '2';
        }
        handleChat({ type: 'chat', user, text, createTime: Date.now(), test: true });
      }, i * 38);
    }
  }

  function command(cmd) {
    if (!cmd || !cmd.action) return;
    const a = cmd.action;
    if (a === 'playMusic' || a === 'pauseMusic' || a === 'nextMusic' || a === 'prevMusic' || a === 'musicIndex') {
      if (a === 'playMusic') {
        customPaused = false;
        syncCustomMusic();
      } else if (a === 'pauseMusic') {
        customPaused = true;
        stopCustomMusic();
      } else if (a === 'nextMusic') {
        const len = (cfg.lopMusicList || []).length;
        if (len > 0) {
          cfg.lopMusicIndex = ((Number(cfg.lopMusicIndex) || 0) + 1) % len;
          customPaused = false;
          syncCustomMusic();
        }
      } else if (a === 'prevMusic') {
        const len = (cfg.lopMusicList || []).length;
        if (len > 0) {
          cfg.lopMusicIndex = ((Number(cfg.lopMusicIndex) || 0) - 1 + len) % len;
          customPaused = false;
          syncCustomMusic();
        }
      } else if (a === 'musicIndex') {
        cfg.lopMusicIndex = Math.max(0, Number(cmd.n) || 0);
        cfg.lopSoundscape = 'custom';
        customPaused = false;
        syncCustomMusic();
      }
      return;
    }
    // Các lệnh điều khiển tiết học chỉ chạy trên cửa sổ Master để tránh chạy đúp
    if (!isMaster) return;

    if (a === 'skip' || a === 'nextQuestion') {
      clearMainVoice();
      if (phase === 'question' && !boardReady) {
        showBoardNow();
      } else {
        phaseRemaining = 0.01;
      }
      emitState(true);
    } else if (a === 'newRound') {
      startNewRound('');
    } else if (a === 'ban') {
      if (curQ && !String(curQ.id).startsWith('math:')) {
        savedBanned.add(curQ.id);
        saveProgress({ banned: [curQ.id] });
        clearMainVoice();
        enqueueChatter(pickLine('banned'), false);
        startQuestion(qIndex + 1);
      }
    } else if (a === 'hint') {
      if (phase === 'question' && !boardReady) showBoardNow();
      revealOneHintLetter();
      emitState(true);
    } else if (a === 'reveal') {
      if (phase === 'question' || phase === 'bonus') enterReveal();
    } else if (a === 'recess' || a === 'recessGame') {
      enterRecess(cmd.game || '');
    } else if (a === 'birthday') {
      const name = String(cmd.text || '').trim() || 'Bạn nhỏ';
      let found = [...players.values()].find((p) => p.nickname.toLowerCase() === name.toLowerCase());
      if (!found) {
        found = ensurePlayer({ id: `bday-${name}`, nickname: name, avatar: makeSvgAvatar(7) }, true);
      }
      birthdayGiven.delete(found.uid);
      triggerBirthday(found);
    } else if (a === 'flood') {
      runFloodDemo(cmd.n || 50);
    } else if (a === 'fillDemo') {
      runFloodDemo(18);
    } else if (a === 'answerCorrect') {
      if ((phase === 'question' || phase === 'bonus') && curQ) {
        if (!boardReady) showBoardNow();
        const idx = Math.floor(Math.random() * DEMO_STUDENTS.length);
        const nick = DEMO_STUDENTS[idx];
        handleChat({
          type: 'chat',
          user: { id: `demo-ans-${idx}-${Date.now() % 1000}`, nickname: nick, avatar: makeSvgAvatar(idx) },
          text: curQ.answer,
          createTime: Date.now(),
          test: true
        });
      }
    } else if (a === 'speak') {
      const txt = String(cmd.text || '').trim();
      if (txt) {
        clearMainVoice(false);
        enqueueMainSpeech(txt, { hold: false, hype: true });
      }
    } else if (a === 'resetScores') {
      for (const p of players.values()) {
        p.score = 0;
        p.streak = 0;
      }
      currentMonitorUid = '';
      recomputeSeating();
      fetch('/api/lop/reset-today', { method: 'POST' }).then((r) => r.json()).then((d) => {
        if (Array.isArray(d.todayTop)) todayTop = d.todayTop;
      }).catch(() => {});
      emitState(true);
    } else if (a === 'clearClass') {
      players.clear();
      benchOrder = [];
      standingOrder = [];
      podiumPunished.length = 0;
      currentMonitorUid = '';
      emitState(true);
    } else if (a === 'testLikes') {
      handleLikesDelta(Math.ceil((Number(cfg.lopLikeGoal) || 300) / HEART_BOOST));
    }
  }

  // ---------- Giao diện công khai `window.LopScene` ----------
  window.LopScene = {
    init(opts = {}) {
      canvas = opts.canvas;
      sfx = opts.sfx || sfx;
      ui = opts.ui || {};
      onStateCb = opts.onState || null;
      onSyncOutCb = opts.onSyncOut || null;
      if (canvas) {
        syncCanvasResolution();
        window.addEventListener('resize', syncCanvasResolution);
      }
      loadSave();
    },

    setMaster(nextMaster, syncSnap = null) {
      const prev = isMaster;
      isMaster = Boolean(nextMaster);
      if (!isMaster) {
        clearMainVoice(true);
        stopCustomMusic();
        if (syncSnap) applySyncSnapshot(syncSnap);
      } else if (!prev && isMaster && cfg.mode === 'lop') {
        loadSave().then(() => {
          if (!isMaster || cfg.mode !== 'lop') return;
          if (roundNum === 0) {
            startNewRound('');
          } else {
            if (!roundQuestions.length) roundQuestions = buildRoundDeck();
            if (phase === 'question' && !boardReady) boardReady = true;
            emitState(true);
          }
        });
        syncCustomMusic();
      } else if (isMaster && cfg.mode === 'lop' && roundNum > 0) {
        emitState(true);
      }
    },

    onSync(snap) {
      applySyncSnapshot(snap);
    },

    onAudioChange(mutedNow) {
      if (mutedNow) {
        clearMainVoice(false);
        stopCustomMusic();
      } else if (cfg.mode === 'lop') {
        syncCustomMusic();
      }
    },

    setConfig(nextCfg) {
      const prevMode = cfg.mode;
      const prevTopic = cfg.lopTopic;
      cfg = { ...cfg, ...nextCfg };
      nextClapGoal = Math.max(nextClapGoal, Number(cfg.lopLikeGoal) || 300);

      if (canvas && ui.root) {
        const on = cfg.mode === 'lop';
        canvas.style.display = on ? 'block' : 'none';
        ui.root.style.display = on ? 'block' : 'none';
      }

      if (cfg.mode === 'lop') {
        if (isMaster) {
          loadSave().then(() => {
            if (!isMaster || cfg.mode !== 'lop') return;
            if (roundNum === 0) startNewRound('');
            else if (prevTopic !== cfg.lopTopic && cfg.lopTopic && cfg.lopTopic !== 'all') {
              startNewRound(cfg.lopTopic);
            }
          });
          emitState(true);
        }
        syncCustomMusic();
        ensureLoop();
      } else if (prevMode === 'lop') {
        clearMainVoice();
        stopCustomMusic();
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      } else {
        stopCustomMusic();
      }
    },

    setPaused(p) {
      paused = Boolean(p);
      if (paused) {
        clearMainVoice();
        stopCustomMusic();
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      } else if (cfg.mode === 'lop') {
        syncCustomMusic();
        ensureLoop();
      }
    },

    onStats(st) {
      if (!isMaster || cfg.mode !== 'lop' || !st) return;
      if (typeof st.likes === 'number') {
        if (rawLikesPrev >= 0 && st.likes > rawLikesPrev) {
          handleLikesDelta(st.likes - rawLikesPrev);
        }
        rawLikesPrev = st.likes;
      }
    },

    onLiveStatus(st) {
      if (st && (st.status === 'connected' || st.status === 'live')) {
        rawLikesPrev = -1;
      }
    },

    onEvent(ev) {
      if (!isMaster || cfg.mode !== 'lop' || paused || !ev) return;
      if (ev.type === 'chat') {
        handleChat(ev);
      } else if (ev.type === 'gift') {
        handleGift(ev);
      } else if (ev.type === 'like') {
        if (ev.user && (ev.user.id || ev.user.uniqueId || ev.user.nickname)) {
          const p = ensurePlayer(ev.user, Boolean(ev.test));
          markAttendance(p);
        }
        handleLikesDelta(Math.max(1, Number(ev.count) || 1));
      } else if (ev.type === 'join') {
        handleJoin(ev);
      } else if (ev.type === 'leave') {
        handleLeave(ev);
      } else if (ev.type === 'follow') {
        const p = ensurePlayer(ev.user, Boolean(ev.test));
        markAttendance(p);
        enqueueChatter(pickLine('thankFollow', DATA().speakableName(p.nickname)), false);
        emitState(true);
      } else if (ev.type === 'share' || ev.type === 'emote') {
        if (ev.user) {
          const p = ensurePlayer(ev.user, Boolean(ev.test));
          markAttendance(p);
          emitState(true);
        }
      } else if (ev.type === 'roomUsers' && Array.isArray(ev.users)) {
        let changed = false;
        for (const u of ev.users) {
          if (u && (u.id || u.uniqueId || u.nickname)) {
            ensurePlayer(u, false);
            changed = true;
          }
        }
        if (changed) emitState(true);
      }
    },

    command
  };
})();
