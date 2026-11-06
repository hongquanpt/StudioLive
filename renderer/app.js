(() => {
  'use strict';
  const api = window.studio;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

  let settings = null;
  let server = { running: false, port: 3000 };
  let status = 'idle';
  let startedAt = 0;
  let feedFilter = 'all';

  // ---------- Toast nhỏ trong app ----------
  function notify(text, kind = 'ok') {
    const t = document.createElement('div');
    t.className = 'app-toast ' + kind;
    t.textContent = text;
    $('#toast-host').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ---------- Điều hướng ----------
  $$('.nav-item').forEach((b) => b.addEventListener('click', () => {
    $$('.nav-item').forEach((x) => x.classList.toggle('active', x === b));
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + b.dataset.view));
    if (['ma', 'chua', 'bar', 'lop', 'rap'].includes(b.dataset.view)) switchScene(b.dataset.view);
    setPreviewSrc(false);
  }));

  // Cột cài đặt của tab cảnh: bọc thêm 1 lớp để chia 2 cột bên trong và cuộn dọc
  $$('.feature-controls').forEach((fc) => {
    const inner = document.createElement('div');
    inner.className = 'fc-inner';
    while (fc.firstChild) inner.appendChild(fc.firstChild);
    fc.appendChild(inner);
  });

  // ---------- Kết nối ----------
  const STATUS = {
    idle: ['Chưa kết nối', ''],
    connecting: ['Đang kết nối…', 'busy'],
    reconnecting: ['Đang kết nối lại…', 'busy'],
    live: ['ĐANG LIVE', 'live'],
    ended: ['Live đã kết thúc', ''],
    error: ['Lỗi kết nối', 'error']
  };

  function renderStatus(s) {
    status = s.status;
    $('#warn-connect').hidden = status === 'live';
    renderQuick();
    const [label, cls] = STATUS[status] || STATUS.idle;
    const pill = $('#status-pill');
    pill.className = 'status-pill ' + cls;
    $('#status-text').textContent = label + (status === 'live' && s.username ? ` · @${s.username}` : '');
    const msg = $('#status-msg');
    msg.textContent = status === 'live' ? '' : s.message || '';
    msg.classList.toggle('err', status === 'error');

    const busy = status === 'connecting' || status === 'reconnecting';
    const on = status === 'live' || busy;
    const btn = $('#btn-connect');
    btn.className = 'btn ' + (on ? 'danger' : 'primary');
    btn.querySelector('span').textContent = on ? (busy ? 'Huỷ' : 'Ngắt kết nối') : 'Kết nối';
    btn.querySelector('svg').innerHTML = on
      ? '<path d="M6 6h12v12H6z"/>'
      : '<path d="M8 5v14l11-7z"/>';
    $('#username').disabled = on;
  }

  $('#btn-connect').addEventListener('click', async () => {
    if (status === 'live' || status === 'connecting' || status === 'reconnecting') {
      await api.disconnect();
      return;
    }
    const u = $('#username').value.trim();
    if (!u) {
      $('#username').focus();
      notify('Nhập username kênh TikTok đang live', 'err');
      return;
    }
    clearFeed();
    const r = await api.connect(u);
    if (!r.ok) notify(r.message, 'err');
  });
  $('#username').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#btn-connect').click();
  });

  // ---------- Thống kê ----------
  const statEls = ['viewers', 'likes', 'comments', 'gifts', 'diamonds', 'follows'];
  const prev = {};
  function renderStats(s) {
    for (const k of statEls) {
      const el = $('#s-' + k);
      if (prev[k] !== s[k]) {
        el.textContent = fmt(s[k]);
        if (prev[k] !== undefined && s[k] > prev[k]) {
          el.classList.remove('flash');
          void el.offsetWidth;
          el.classList.add('flash');
        }
        prev[k] = s[k];
      }
    }
    startedAt = s.startedAt || 0;
    renderLeader(s.topGifters || []);
  }

  function renderLeader(list) {
    const ol = $('#leader');
    ol.replaceChildren();
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'muted small leader-empty';
      li.textContent = 'Chưa có ai tặng quà';
      ol.appendChild(li);
      return;
    }
    for (const g of list) {
      const li = document.createElement('li');
      const nm = document.createElement('span');
      nm.className = 'nm';
      nm.textContent = g.nickname;
      const dm = document.createElement('span');
      dm.className = 'dm';
      dm.textContent = fmt(g.diamonds) + ' 💎';
      li.append(avatarEl(g.avatar), nm, dm);
      ol.appendChild(li);
    }
  }

  setInterval(() => {
    if (!startedAt || status !== 'live') return;
    const t = Math.floor((Date.now() - startedAt) / 1000);
    const p = (n) => String(n).padStart(2, '0');
    $('#uptime').textContent = `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
  }, 1000);

  // ---------- Feed ----------
  const feed = $('#feed');
  const MAX_FEED = 250;

  function avatarEl(url) {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('data:image/'))) {
      const img = document.createElement('img');
      img.className = 'av';
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.onerror = () => { const d = avatarEl(''); img.replaceWith(d); };
      return img;
    }
    const d = document.createElement('div');
    d.className = 'av';
    const mode = settings?.overlay?.mode;
    d.textContent = mode === 'chua' ? '🪷' : mode === 'bar' ? '🪩' : mode === 'lop' ? '📚' : mode === 'rap' ? '🎬' : '👻';
    return d;
  }

  function clearFeed() {
    $$('.item', feed).forEach((n) => n.remove());
    $('#feed-empty').style.display = '';
  }

  const GROUP = { chat: 'chat', gift: 'gift', follow: 'social', share: 'social' };
  const TAG = { chat: 'Chat', gift: 'Quà', follow: 'Theo dõi', share: 'Chia sẻ' };

  function addFeed(ev) {
    if (!GROUP[ev.type]) return; // like/join/streak không đưa vào feed để tránh spam
    $('#feed-empty').style.display = 'none';
    const item = document.createElement('div');
    item.className = 'item ' + ev.type;
    item.dataset.g = GROUP[ev.type];
    const body = document.createElement('div');
    body.className = 'body';
    const who = document.createElement('div');
    who.className = 'who';
    const name = document.createElement('span');
    name.textContent = ev.user?.nickname || 'Ẩn danh';
    const tag = document.createElement('span');
    tag.className = 'tag ' + (ev.test ? 'test' : ev.type);
    tag.textContent = ev.test ? 'Thử' : TAG[ev.type];
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = new Date(ev.ts || Date.now()).toLocaleTimeString('vi-VN');
    who.append(name, tag, time);
    const text = document.createElement('div');
    text.className = 'text';
    if (ev.type === 'chat') text.textContent = ev.text;
    else if (ev.type === 'gift') {
      text.append('Tặng ');
      const b = document.createElement('b');
      b.textContent = `${ev.giftName} x${ev.repeatCount}`;
      text.append(b, ` · ${fmt(ev.total)} 💎`);
    } else if (ev.type === 'follow') text.textContent = 'Đã theo dõi kênh';
    else if (ev.type === 'share') text.textContent = 'Đã chia sẻ buổi live';
    body.append(who, text);
    item.append(avatarEl(ev.user?.avatar), body);
    if (feedFilter !== 'all' && feedFilter !== item.dataset.g) item.style.display = 'none';

    const atTop = feed.scrollTop < 40;
    feed.prepend(item);
    const items = $$('.item', feed);
    for (let i = MAX_FEED; i < items.length; i++) items[i].remove();
    if (atTop) feed.scrollTop = 0;
  }

  $$('#feed-filter .chip').forEach((c) => c.addEventListener('click', () => {
    feedFilter = c.dataset.f;
    $$('#feed-filter .chip').forEach((x) => x.classList.toggle('active', x === c));
    $$('.item', feed).forEach((n) => { n.style.display = feedFilter === 'all' || n.dataset.g === feedFilter ? '' : 'none'; });
  }));

  // ---------- Đi Chùa Online ----------
  // Bắt đầu nhanh: đánh dấu các bước đã xong
  function renderQuick() {
    const mode = settings?.overlay?.mode;
    const live = status === 'live';
    const screens = server.running ? Math.max(0, (server.clients || 0) - 1) : 0;
    const set = (k, done) => $(`.qs [data-qs=${k}]`)?.classList.toggle('done', !!done);
    set('scene', !!mode);
    set('link', screens > 0);
    set('golive', live);
    set('connect', live);
    const sc = $('#qs-scene');
    if (sc) {
      sc.textContent = mode === 'chua' ? 'Đang chọn: 🪷 Đi Chùa Online'
        : mode === 'bar' ? 'Đang chọn: 🪩 Đi Bar Online'
        : mode === 'lop' ? 'Đang chọn: 📚 Lớp Học Chữ'
        : mode === 'rap' ? 'Đang chọn: 🎬 Rạp Phim Online'
        : 'Đang chọn: 👻 Live Ma Online';
    }
    const emptyGhost = $('#feed-empty .empty-ghost');
    if (emptyGhost) emptyGhost.textContent = mode === 'chua' ? '🪷' : mode === 'bar' ? '🪩' : mode === 'lop' ? '📚' : mode === 'rap' ? '🎬' : '👻';
  }
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => $(`.nav-item[data-view=${b.dataset.goto}]`).click()));
  $('#qs-copy').addEventListener('click', async () => {
    await api.copy(`http://lvh.me:${server.port}`);
    notify('Đã sao chép link cho TikTok LIVE Studio');
  });

  // Chấm LIVE cạnh tab đang chạy trên live
  function renderChuaNav(mode) {
    renderQuick();
    const live = mode === 'chua' ? 'chua' : mode === 'bar' ? 'bar' : mode === 'lop' ? 'lop' : mode === 'rap' ? 'rap' : 'ma';
    $$('[data-live-for]').forEach((d) => d.classList.toggle('on', d.dataset.liveFor === live));
    $$('[data-open-scene]').forEach((b) => {
      const on = b.dataset.openScene === live;
      b.classList.toggle('live', on);
      b.querySelector('small').textContent = on
        ? '● Đang phát cảnh này — bấm để mở màn hình phát'
        : ({
          ma: 'Chuyển live sang Nhà Ma + mở màn hình phát',
          chua: 'Chuyển live sang chánh điện + mở màn hình phát',
          bar: 'Chuyển live sang sàn bar + mở màn hình phát',
          lop: 'Chuyển live sang lớp học ghép chữ + mở màn hình phát',
          rap: 'Chuyển live sang rạp phim + mở màn hình phát'
        })[b.dataset.openScene];
    });
  }
  // Nút riêng cho từng cảnh: chuyển cảnh trên live rồi mở màn hình phát
  $$('[data-open-scene]').forEach((b) => b.addEventListener('click', () => {
    switchScene(b.dataset.openScene);
    api.openOutput();
  }));

  // Mở tab nào thì cảnh đó chạy trên live
  function switchScene(view) {
    if (!settings) return;
    const want = view === 'chua' ? 'chua' : view === 'bar' ? 'bar' : view === 'lop' ? 'lop' : view === 'rap' ? 'rap' : 'game';
    if (settings.overlay.mode === want) return;
    settings.overlay.mode = want;
    renderSettings();
    save({ overlay: { mode: want } }, true);
    notify(
      view === 'chua' ? '🪷 Live đang chạy: Đi Chùa Online' :
      view === 'bar' ? '🪩 Live đang chạy: Đi Bar Online' :
      view === 'lop' ? '📚 Live đang chạy: Lớp Học Chữ' :
      view === 'rap' ? '🎬 Live đang chạy: Rạp Phim Online' :
      '👻 Live đang chạy: Live Ma Online'
    );
  }
  $('#chua-name-save').addEventListener('click', () => {
    const name = $('#chua-name').value.trim();
    settings.overlay.chuaName = name;
    save({ overlay: { chuaName: name } }, true);
    notify(name ? `Đã lưu tên chánh điện: ${name}` : 'Đã xoá tên riêng (dùng Chánh Điện Tâm An)');
  });
  $('#chua-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#chua-name-save').click();
  });
  $('#chua-speak-btn').addEventListener('click', () => {
    const text = $('#chua-speak').value.trim();
    if (!text) return notify('Nhập câu cần đọc trước', 'err');
    api.chua('speak', { text });
    notify('Đã gửi câu cần đọc lên live');
  });
  $('#chua-speak').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#chua-speak-btn').click();
  });
  $$('#chua-soundscape button').forEach((b) => b.addEventListener('click', async () => {
    let sc = b.dataset.sc;
    if (sc === 'custom' && !settings.overlay.customChuaMusic) {
      const file = await api.pickSound();
      if (file) {
        settings.overlay.customChuaMusic = file;
        settings.overlay.chuaSoundscape = 'custom';
        settings.overlay.chuaMusic = true;
        renderSettings();
        save({ overlay: { customChuaMusic: file, chuaSoundscape: 'custom', chuaMusic: true } }, true);
        notify('Đã chọn file nhạc nền Chánh Điện');
        return;
      }
      sc = 'off';
      notify('Chưa chọn file nhạc — giữ chế độ Tắt nhạc nền');
    }
    const on = sc !== 'off';
    settings.overlay.chuaSoundscape = sc;
    settings.overlay.chuaMusic = on;
    renderSettings();
    save({ overlay: { chuaSoundscape: sc, chuaMusic: on } }, true);
  }));
  $$('[data-chua]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.chua;
    api.chua(a, a === 'testLikes' ? { n: 100 } : {});
  }));

  // ---------- Bộ quy tắc Cụm từ bình luận → Hiệu ứng (dùng cho Đi Chùa & Đi Bar) ----------
  const CHUA_EFFECT_OPTS = [
    ['incense', '🪔 Dâng hương & Tam bái'],
    ['bell', '🔔 Thỉnh Đại Hồng Chung'],
    ['mo', '🪵 Gõ nhịp mõ tịnh tâm'],
    ['lotus', '🪷 Nở đài sen vàng'],
    ['halo', '✨ Tỏa hào quang an lành'],
    ['rain', '🌸 Mưa cánh hoa sen'],
    ['wish', '📜 Lập Sớ Cầu An']
  ];
  const DEFAULT_CHUA_RULES = [
    { phrase: 'adidaphat, nam mô, mô phật, thắp hương, dâng hương, lạy phật, 🙏', effect: 'incense' },
    { phrase: 'thỉnh chuông, đánh chuông, chuông, 🔔', effect: 'bell' },
    { phrase: 'gõ mõ, tụng kinh, niệm phật, 🪵', effect: 'mo' },
    { phrase: 'hoa sen, dâng hoa, sen vàng, nở sen, 🪷', effect: 'lotus' },
    { phrase: 'hoan hỷ, tùy hỷ, công đức, phóng sinh, tâm an, ✨', effect: 'halo' },
    { phrase: 'mưa hoa, mưa sen, rải hoa, 🌸', effect: 'rain' }
  ];

  const BAR_EFFECT_OPTS = [
    ['center', '🌟 Lên Sóng Chính (tâm điểm)'],
    ['fireworks', '🎆 Bắn Đại Tiệc Pháo Hoa'],
    ['jump', '💃 Nhảy 1 cái (bung nóc)'],
    ['camera', '📷 Quay cận cảnh CAMERA'],
    ['skin', '🎭 Biến hình đổi nhân vật'],
    ['parade', '🏃 Đi bão vòng quanh sàn'],
    ['pilot', '🚀 Hóa Phi Công bay lượn'],
    ['couple', '💞 Ghép đôi giữa sàn'],
    ['wukong', '🐵 Hóa Tề Thiên Đại Thánh'],
    ['king', '👑 Lên ngôi Vua Sàn Đêm'],
    ['cheers', '🍻 Nâng ly 1·2·3 DZÔ'],
    ['drop', '🔥 Kích hoạt BASS DROP']
  ];
  const DEFAULT_BAR_RULES = [
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

  function renderTriggerEditor(boxSel, key, opts) {
    const box = $(boxSel);
    if (!box || !settings?.overlay) return;
    if (box.contains(document.activeElement)) return;
    const list = Array.isArray(settings.overlay[key]) ? settings.overlay[key] : [];
    box.replaceChildren(...list.map((rule, idx) => {
      const row = document.createElement('div');
      row.className = 'trig-row';

      const inp = document.createElement('input');
      inp.className = 'inp trig-inp';
      inp.value = rule.phrase || '';
      inp.placeholder = 'Nhập các từ khoá, cách nhau bằng dấu phẩy…';
      inp.addEventListener('change', () => {
        const val = inp.value.trim();
        if (!val) {
          inp.value = rule.phrase;
          return;
        }
        settings.overlay[key][idx].phrase = val;
        save({ overlay: { [key]: structuredClone(settings.overlay[key]) } }, true);
        notify('Đã lưu cụm từ kích hoạt hiệu ứng');
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });

      const sel = document.createElement('select');
      sel.className = 'inp trig-sel';
      opts.forEach(([val, label]) => {
        const op = document.createElement('option');
        op.value = val;
        op.textContent = label;
        if (val === rule.effect) op.selected = true;
        sel.appendChild(op);
      });
      sel.addEventListener('change', () => {
        settings.overlay[key][idx].effect = sel.value;
        save({ overlay: { [key]: structuredClone(settings.overlay[key]) } }, true);
        notify('Đã đổi hiệu ứng cho cụm từ');
      });

      const playBtn = document.createElement('button');
      playBtn.className = 'btn ghost sm trig-play';
      playBtn.textContent = '▶';
      playBtn.title = 'Thử gửi bình luận cụm từ này lên cảnh';
      playBtn.addEventListener('click', () => {
        const firstWord = (inp.value || rule.phrase || '').split(',')[0].trim();
        if (!firstWord) return notify('Nhập cụm từ trước khi thử', 'err');
        api.test({ type: 'phrase', text: firstWord });
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn ghost sm trig-del';
      delBtn.textContent = '✕';
      delBtn.title = 'Xoá quy tắc này';
      delBtn.addEventListener('click', () => {
        settings.overlay[key] = settings.overlay[key].filter((_, k) => k !== idx);
        renderTriggerEditor(boxSel, key, opts);
        save({ overlay: { [key]: structuredClone(settings.overlay[key]) } }, true);
      });

      row.append(inp, sel, playBtn, delBtn);
      return row;
    }));
  }

  $('#chua-trig-add')?.addEventListener('click', () => {
    const next = [...(settings.overlay.chuaTriggers || []), { phrase: 'tâm an, bình an', effect: 'halo' }];
    settings.overlay.chuaTriggers = next;
    renderTriggerEditor('#chua-trigger-list', 'chuaTriggers', CHUA_EFFECT_OPTS);
    save({ overlay: { chuaTriggers: structuredClone(next) } }, true);
  });
  $('#chua-trig-reset')?.addEventListener('click', () => {
    settings.overlay.chuaTriggers = structuredClone(DEFAULT_CHUA_RULES);
    renderTriggerEditor('#chua-trigger-list', 'chuaTriggers', CHUA_EFFECT_OPTS);
    save({ overlay: { chuaTriggers: structuredClone(DEFAULT_CHUA_RULES) } }, true);
    notify('Đã khôi phục bộ cụm từ Chánh Điện mặc định');
  });

  // ---------- Đi Bar Online ----------
  $$('#bar-theme button').forEach((b) => b.addEventListener('click', () => {
    const th = b.dataset.btheme;
    settings.overlay.barTheme = th;
    renderSettings();
    save({ overlay: { barTheme: th } }, true);
  }));
  $('#bar-name-save')?.addEventListener('click', () => {
    const name = $('#bar-name').value.trim();
    settings.overlay.barName = name;
    save({ overlay: { barName: name } }, true);
    notify(name ? `Đã lưu tên sàn bar: ${name}` : 'Đã xoá tên riêng (dùng Club Neon)');
  });
  $('#bar-name')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#bar-name-save').click();
  });
  $('#bar-speak-btn')?.addEventListener('click', () => {
    const text = $('#bar-speak').value.trim();
    if (!text) return notify('Nhập câu cần MC đọc trước', 'err');
    api.bar('speak', { text });
    notify('Đã gửi câu thoại cho MC đọc trên sàn');
  });
  $('#bar-speak')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#bar-speak-btn').click();
  });
  const barYtIdOf = (u) => (String(u || '').match(/(?:(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i) || [])[1] || '';
  const barTrackName = (p) => {
    if (barYtIdOf(p)) return '▶ YouTube · ' + barYtIdOf(p);
    if (/^https?:\/\/(?:www\.|m\.|on\.)?soundcloud\.com\//i.test(p)) {
      try { const u = new URL(p); return '☁️ SoundCloud · ' + decodeURIComponent(u.pathname).replace(/^\/+|\/+$/g, '').slice(0, 56); } catch { return '☁️ SoundCloud · ' + p; }
    }
    if (/^https?:\/\//i.test(p)) {
      try { const u = new URL(p); return '🔗 ' + u.hostname + decodeURIComponent(u.pathname).slice(0, 56); } catch { return '🔗 ' + p; }
    }
    return '🎵 ' + String(p || '').split(/[\\/]/).pop();
  };
  function renderBarMusic() {
    const listEl = $('#bar-music-list');
    const emptyEl = $('#bar-music-empty');
    if (!listEl || !emptyEl) return;
    const list = settings.overlay.barMusicList || [];
    const cur = settings.overlay.barMusicIndex || 0;
    emptyEl.hidden = list.length > 0;
    listEl.replaceChildren(...list.map((p, i) => {
      const li = document.createElement('li');
      li.className = i === cur ? 'on' : '';
      li.title = 'Bấm để phát bài này — ' + p;
      const n = document.createElement('span'); n.className = 'mv-n'; n.textContent = i === cur ? '▶' : i + 1;
      const nm = document.createElement('span'); nm.className = 'mv-name'; nm.textContent = barTrackName(p);
      const del = document.createElement('button'); del.className = 'mv-del'; del.textContent = '✕'; del.title = 'Xoá khỏi danh sách';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = list.filter((_, k) => k !== i);
        const idx = Math.min(cur > i ? cur - 1 : cur, Math.max(0, next.length - 1));
        const patch = { barMusicList: next, barMusicIndex: idx };
        settings.overlay.barMusicList = next;
        settings.overlay.barMusicIndex = idx;
        if (!next.length && settings.overlay.barSoundscape === 'custom') {
          settings.overlay.barSoundscape = 'house';
          patch.barSoundscape = 'house';
        }
        renderSettings();
        save({ overlay: patch }, true);
      });
      li.addEventListener('click', () => {
        settings.overlay.barMusicIndex = i;
        settings.overlay.barSoundscape = 'custom';
        renderSettings();
        api.updateSettings({ overlay: { barMusicIndex: i, barSoundscape: 'custom' } }).then(() => api.bar('musicIndex', { n: i }));
      });
      li.append(n, nm, del);
      return li;
    }));
  }
  $$('#bar-soundscape button').forEach((b) => b.addEventListener('click', () => {
    const sc = b.dataset.bsc;
    settings.overlay.barSoundscape = sc;
    renderSettings();
    save({ overlay: { barSoundscape: sc } }, true);
    if (sc === 'custom' && !(settings.overlay.barMusicList || []).length) {
      $('#bar-music-link')?.focus();
      notify('Dán link YouTube / SoundCloud / MP3 vào ô bên dưới hoặc bấm + Chọn file máy');
    }
  }));
  $('#bar-music-link-add')?.addEventListener('click', () => {
    const link = $('#bar-music-link').value.trim();
    if (!/^https?:\/\//i.test(link)) return notify('Link nhạc phải bắt đầu bằng http:// hoặc https://', 'err');
    const next = [...(settings.overlay.barMusicList || []), link].slice(0, 100);
    const idx = next.length - 1;
    settings.overlay.barMusicList = next;
    settings.overlay.barMusicIndex = idx;
    settings.overlay.barSoundscape = 'custom';
    $('#bar-music-link').value = '';
    renderSettings();
    api.updateSettings({ overlay: { barMusicList: next, barMusicIndex: idx, barSoundscape: 'custom' } })
      .then(() => setTimeout(() => api.bar('musicIndex', { n: idx }), 200));
    notify('Đã thêm link nhạc — đang phát trên sàn Bar');
  });
  $('#bar-music-link')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#bar-music-link-add').click();
  });
  $('#bar-music-file-add')?.addEventListener('click', async () => {
    const files = await api.pickMusicFiles();
    if (!files || !files.length) return;
    const before = (settings.overlay.barMusicList || []).length;
    const next = [...(settings.overlay.barMusicList || []), ...files].slice(0, 100);
    settings.overlay.barMusicList = next;
    settings.overlay.barMusicIndex = before;
    settings.overlay.barSoundscape = 'custom';
    renderSettings();
    api.updateSettings({ overlay: { barMusicList: next, barMusicIndex: before, barSoundscape: 'custom' } })
      .then(() => setTimeout(() => api.bar('musicIndex', { n: before }), 200));
    notify(`Đã thêm ${files.length} bài nhạc vào sàn Bar`);
  });
  $$('[data-bar]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.bar;
    if (a === 'nextMusic' || a === 'prevMusic') {
      const n = (settings.overlay.barMusicList || []).length;
      if (n) {
        settings.overlay.barMusicIndex = ((settings.overlay.barMusicIndex || 0) + (a === 'nextMusic' ? 1 : -1) + n) % n;
        settings.overlay.barSoundscape = 'custom';
        renderSettings();
        save({ overlay: { barMusicIndex: settings.overlay.barMusicIndex, barSoundscape: 'custom' } });
      }
    } else if (a === 'playMusic') {
      if ((settings.overlay.barMusicList || []).length && settings.overlay.barSoundscape !== 'custom') {
        settings.overlay.barSoundscape = 'custom';
        renderSettings();
        save({ overlay: { barSoundscape: 'custom' } }, true);
      }
    }
    api.bar(a, a === 'testLikes' ? { n: 100 } : {});
  }));
  $('#bar-trig-add')?.addEventListener('click', () => {
    const next = [...(settings.overlay.barTriggers || []), { phrase: 'cháy phố, hết nước chấm', effect: 'jump' }];
    settings.overlay.barTriggers = next;
    renderTriggerEditor('#bar-trigger-list', 'barTriggers', BAR_EFFECT_OPTS);
    save({ overlay: { barTriggers: structuredClone(next) } }, true);
  });
  $('#bar-trig-reset')?.addEventListener('click', () => {
    settings.overlay.barTriggers = structuredClone(DEFAULT_BAR_RULES);
    renderTriggerEditor('#bar-trigger-list', 'barTriggers', BAR_EFFECT_OPTS);
    save({ overlay: { barTriggers: structuredClone(DEFAULT_BAR_RULES) } }, true);
    notify('Đã khôi phục bộ cụm từ Sàn Bar mặc định');
  });

  // ---------- Lớp Học Chữ ----------
  function renderLopState(st) {
    if (!st || typeof st !== 'object') return;
    const rd = $('#lop-st-round');
    const ph = $('#lop-st-phase');
    const ans = $('#lop-st-ans');
    const pl = $('#lop-st-players');
    const cl = $('#lop-st-clue');
    if (rd) {
      const qTxt = st.phase === 'intro' ? 'Mở đầu' : (st.questionNum ? `Câu ${st.questionNum}/${st.totalQuestions || 20}` : 'Giải lao');
      rd.textContent = `Tiết ${st.round || 1} · ${qTxt}${st.golden ? ' ⭐x2' : ''}`;
    }
    if (ph) ph.textContent = `${st.phaseLabel || st.phase || ''}${st.remaining ? ` (${st.remaining}s)` : ''}`;
    if (ans) ans.textContent = st.secretAnswer || '—';
    if (pl) pl.textContent = `${st.totalPlayers || 0} bạn (${st.seatedCount || 0} ghế) · ${st.qCorrect || 0} đúng / ${st.qAttempts || 0} đoán`;
    if (cl) cl.textContent = st.clue ? `Chủ đề: ${st.category || 'Chung'} — Gợi ý: ${st.clue}` : 'Đang chuyển tiếp giữa các phần…';
  }
  api.onLopState?.(renderLopState);

  $('#btn-lop-report')?.addEventListener('click', () => {
    const port = server?.port || settings?.port || 3000;
    api.openExternal(`http://localhost:${port}/lop-bao-cao`);
  });
  $$('#lop-theme button').forEach((b) => b.addEventListener('click', () => {
    const th = b.dataset.ltheme;
    settings.overlay.lopTheme = th;
    renderSettings();
    save({ overlay: { lopTheme: th } }, true);
  }));
  $$('#lop-avatar-seg button').forEach((b) => b.addEventListener('click', () => {
    const mode = b.dataset.lav;
    settings.overlay.lopAvatarMode = mode;
    renderSettings();
    save({ overlay: { lopAvatarMode: mode } }, true);
  }));
  $('#lop-name-save')?.addEventListener('click', () => {
    const name = $('#lop-name').value.trim();
    settings.overlay.lopName = name || 'Lớp Học Chữ';
    save({ overlay: { lopName: settings.overlay.lopName } }, true);
    notify(`Đã lưu tên lớp: ${settings.overlay.lopName}`);
  });
  $('#lop-name')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#lop-name-save').click();
  });
  $('#lop-speak-btn')?.addEventListener('click', () => {
    const text = $('#lop-speak').value.trim();
    if (!text) return notify('Nhập lời nhắn cần Cô Giáo đọc trước', 'err');
    api.lop('speak', { text });
    notify('Đã gửi lời nhắn cho Cô Giáo đọc trên live');
  });
  $('#lop-speak')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#lop-speak-btn').click();
  });
  $('#lop-bday-btn')?.addEventListener('click', () => {
    const name = $('#lop-bday-name').value.trim();
    if (!name) return notify('Nhập tên bạn nhỏ cần chúc mừng sinh nhật', 'err');
    api.lop('birthday', { text: name });
    $('#lop-bday-name').value = '';
    notify(`🎂 Đã gửi bánh kem & chúc mừng sinh nhật ${name}!`);
  });
  $('#lop-bday-name')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#lop-bday-btn').click();
  });
  $$('[data-lop-recess]').forEach((b) => b.addEventListener('click', () => {
    api.lop('recessGame', { game: b.dataset.lopRecess });
    notify('🔔 Đã chuyển sang trò Giờ Ra Chơi');
  }));
  $$('[data-lop-flood]').forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.lopFlood) || 50;
    api.lop('flood', { n });
    notify(`👥 Đang mô phỏng ${n} người vào lớp cùng đoán chữ`);
  }));
  $('#lop-test-send')?.addEventListener('click', () => {
    const inp = $('#lop-test-chat');
    const text = (inp?.value || '').trim();
    if (!text) return notify('Nhập đáp án hoặc câu bình luận cần thử', 'err');
    api.test({ type: 'phrase', text });
    inp.value = '';
    inp.focus();
  });
  $('#lop-test-chat')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#lop-test-send').click();
  });
  $('#lop-words-save')?.addEventListener('click', () => {
    const words = $('#lop-custom-words').value;
    settings.overlay.lopCustomWords = words;
    save({ overlay: { lopCustomWords: words } }, true);
    notify('Đã lưu bộ câu hỏi tự thêm cho Lớp Học Chữ');
  });
  function renderLopMusic() {
    const listEl = $('#lop-music-list');
    const emptyEl = $('#lop-music-empty');
    if (!listEl || !emptyEl) return;
    const list = settings.overlay.lopMusicList || [];
    const cur = settings.overlay.lopMusicIndex || 0;
    emptyEl.hidden = list.length > 0;
    listEl.replaceChildren(...list.map((p, i) => {
      const li = document.createElement('li');
      li.className = i === cur ? 'on' : '';
      li.title = 'Bấm để phát bài này — ' + p;
      const n = document.createElement('span'); n.className = 'mv-n'; n.textContent = i === cur ? '▶' : i + 1;
      const nm = document.createElement('span'); nm.className = 'mv-name'; nm.textContent = barTrackName(p);
      const del = document.createElement('button'); del.className = 'mv-del'; del.textContent = '✕'; del.title = 'Xoá khỏi danh sách';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = list.filter((_, k) => k !== i);
        const idx = Math.min(cur > i ? cur - 1 : cur, Math.max(0, next.length - 1));
        const patch = { lopMusicList: next, lopMusicIndex: idx };
        settings.overlay.lopMusicList = next;
        settings.overlay.lopMusicIndex = idx;
        if (!next.length && settings.overlay.lopSoundscape === 'custom') {
          settings.overlay.lopSoundscape = 'off';
          patch.lopSoundscape = 'off';
        }
        renderSettings();
        save({ overlay: patch }, true);
      });
      li.addEventListener('click', () => {
        settings.overlay.lopMusicIndex = i;
        settings.overlay.lopSoundscape = 'custom';
        renderSettings();
        api.updateSettings({ overlay: { lopMusicIndex: i, lopSoundscape: 'custom' } }).then(() => api.lop('musicIndex', { n: i }));
      });
      li.append(n, nm, del);
      return li;
    }));
  }
  $$('#lop-soundscape button').forEach((b) => b.addEventListener('click', () => {
    const sc = b.dataset.lsc;
    settings.overlay.lopSoundscape = sc;
    renderSettings();
    save({ overlay: { lopSoundscape: sc } }, true);
    if (sc === 'custom' && !(settings.overlay.lopMusicList || []).length) {
      $('#lop-music-link')?.focus();
      notify('Dán link YouTube / MP3 vào ô bên dưới hoặc bấm + Chọn file máy');
    }
  }));
  $('#lop-music-link-add')?.addEventListener('click', () => {
    const link = $('#lop-music-link').value.trim();
    if (!/^https?:\/\//i.test(link)) return notify('Link nhạc phải bắt đầu bằng http:// hoặc https://', 'err');
    const next = [...(settings.overlay.lopMusicList || []), link].slice(0, 100);
    const idx = next.length - 1;
    settings.overlay.lopMusicList = next;
    settings.overlay.lopMusicIndex = idx;
    settings.overlay.lopSoundscape = 'custom';
    $('#lop-music-link').value = '';
    renderSettings();
    api.updateSettings({ overlay: { lopMusicList: next, lopMusicIndex: idx, lopSoundscape: 'custom' } })
      .then(() => setTimeout(() => api.lop('musicIndex', { n: idx }), 200));
    notify('Đã thêm link nhạc nền Lớp Học');
  });
  $('#lop-music-link')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#lop-music-link-add').click();
  });
  $('#lop-music-file-add')?.addEventListener('click', async () => {
    const files = await api.pickMusicFiles();
    if (!files || !files.length) return;
    const before = (settings.overlay.lopMusicList || []).length;
    const next = [...(settings.overlay.lopMusicList || []), ...files].slice(0, 100);
    settings.overlay.lopMusicList = next;
    settings.overlay.lopMusicIndex = before;
    settings.overlay.lopSoundscape = 'custom';
    renderSettings();
    api.updateSettings({ overlay: { lopMusicList: next, lopMusicIndex: before, lopSoundscape: 'custom' } })
      .then(() => setTimeout(() => api.lop('musicIndex', { n: before }), 200));
    notify(`Đã thêm ${files.length} bài nhạc vào Lớp Học`);
  });
  $$('[data-lop]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.lop;
    if (a === 'nextMusic' || a === 'prevMusic') {
      const n = (settings.overlay.lopMusicList || []).length;
      if (n) {
        settings.overlay.lopMusicIndex = ((settings.overlay.lopMusicIndex || 0) + (a === 'nextMusic' ? 1 : -1) + n) % n;
        settings.overlay.lopSoundscape = 'custom';
        renderSettings();
        save({ overlay: { lopMusicIndex: settings.overlay.lopMusicIndex, lopSoundscape: 'custom' } });
      }
    } else if (a === 'playMusic') {
      if ((settings.overlay.lopMusicList || []).length && settings.overlay.lopSoundscape !== 'custom') {
        settings.overlay.lopSoundscape = 'custom';
        renderSettings();
        save({ overlay: { lopSoundscape: 'custom' } }, true);
      }
    }
    api.lop(a, a === 'testLikes' ? { n: 500 } : {});
  }));

  // ---------- Rạp Phim Online ----------
  const ytIdOf = (u) => (String(u).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i) || [])[1] || '';
  const movieName = (p) => {
    if (ytIdOf(p)) return '▶ YouTube · ' + ytIdOf(p);
    if (/^https?:\/\//i.test(p)) { try { const u = new URL(p); return '🔗 ' + u.hostname + decodeURIComponent(u.pathname).slice(0, 60); } catch { return '🔗 ' + p; } }
    return String(p || '').split(/[\\/]/).pop();
  };
  function renderMovies() {
    const list = settings.overlay.rapVideos || [];
    const cur = settings.overlay.rapIndex || 0;
    $('#rap-empty').hidden = list.length > 0;
    $('#rap-list').replaceChildren(...list.map((p, i) => {
      const li = document.createElement('li');
      li.className = i === cur ? 'on' : '';
      li.title = 'Bấm để chiếu phim này — ' + p;
      const n = document.createElement('span'); n.className = 'mv-n'; n.textContent = i === cur ? '▶' : i + 1;
      const nm = document.createElement('span'); nm.className = 'mv-name'; nm.textContent = movieName(p);
      const del = document.createElement('button'); del.className = 'mv-del'; del.textContent = '✕'; del.title = 'Xoá khỏi danh sách';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = list.filter((_, k) => k !== i);
        const idx = Math.min(cur > i ? cur - 1 : cur, Math.max(0, next.length - 1));
        settings.overlay.rapVideos = next; settings.overlay.rapIndex = idx;
        renderMovies();
        save({ overlay: { rapVideos: next, rapIndex: idx } }, true);
      });
      li.addEventListener('click', () => {
        settings.overlay.rapIndex = i;
        renderMovies();
        api.rap('index', { n: i });
      });
      li.append(n, nm, del);
      return li;
    }));
  }
  $$('#rap-theme button').forEach((b) => b.addEventListener('click', () => {
    settings.overlay.rapTheme = b.dataset.theme;
    renderSettings();
    save({ overlay: { rapTheme: b.dataset.theme } }, true);
  }));
  $('#rap-link-add').addEventListener('click', () => {
    const link = $('#rap-link').value.trim();
    if (!/^https?:\/\//i.test(link)) return notify('Link phải bắt đầu bằng http:// hoặc https://', 'err');
    if (!ytIdOf(link) && !/\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(link)) {
      notify('Chỉ phát được link YouTube hoặc link trực tiếp tới file video (.mp4, .webm). Link trang web khác có thể không chạy.', 'err');
    }
    const next = [...(settings.overlay.rapVideos || []), link].slice(0, 100);
    const idx = next.length - 1;
    settings.overlay.rapVideos = next;
    settings.overlay.rapIndex = idx;
    $('#rap-link').value = '';
    renderMovies();
    // lưu danh sách rồi chiếu ngay link vừa thêm
    api.updateSettings({ overlay: { rapVideos: next, rapIndex: idx } }).then(() => setTimeout(() => api.rap('index', { n: idx }), 300));
    notify('Đã thêm link — đang chiếu');
  });
  $('#rap-link').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#rap-link-add').click(); });
  $('#rap-lights').addEventListener('click', () => {
    settings.overlay.rapLightsOff = !settings.overlay.rapLightsOff;
    renderSettings();
    save({ overlay: { rapLightsOff: settings.overlay.rapLightsOff } }, true);
  });
  $('#rap-add').addEventListener('click', async () => {
    const files = await api.pickVideos();
    if (!files.length) return;
    const before = (settings.overlay.rapVideos || []).length;
    const next = [...(settings.overlay.rapVideos || []), ...files].slice(0, 100);
    settings.overlay.rapVideos = next;
    settings.overlay.rapIndex = before;
    renderMovies();
    api.updateSettings({ overlay: { rapVideos: next, rapIndex: before } }).then(() => setTimeout(() => api.rap('index', { n: before }), 300));
    notify(`Đã thêm ${files.length} phim`);
  });
  $$('[data-rap]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.rap;
    if (a === 'next' || a === 'prev') {
      const n = (settings.overlay.rapVideos || []).length;
      if (n) {
        settings.overlay.rapIndex = ((settings.overlay.rapIndex || 0) + (a === 'next' ? 1 : -1) + n) % n;
        renderMovies();
        save({ overlay: { rapIndex: settings.overlay.rapIndex } });
      }
    }
    api.rap(a, a === 'testLikes' ? { n: 100 } : {});
  }));
  $('#rap-name-save').addEventListener('click', () => {
    const name = $('#rap-name').value.trim();
    settings.overlay.rapName = name;
    save({ overlay: { rapName: name } }, true);
    notify(name ? `Đã lưu tên rạp: ${name}` : 'Đã xoá tên rạp (dùng tên mặc định)');
  });
  $('#rap-speak-btn').addEventListener('click', () => {
    const text = $('#rap-speak').value.trim();
    if (!text) return notify('Nhập câu cần đọc trước', 'err');
    api.rap('speak', { text });
    notify('Đã gửi câu cần đọc lên live');
  });

  // ---------- Tạm dừng / chạy tiếp ----------
  function renderPause(p) {
    $$('[data-pause]').forEach((b) => {
      b.classList.toggle('paused', p);
      b.textContent = p ? '▶ Chạy tiếp' : '⏸ Tạm dừng';
    });
  }
  $$('[data-pause]').forEach((b) => b.addEventListener('click', async () => {
    const p = await api.setPaused();
    notify(p ? 'Đã tạm dừng cảnh: đứng hình, tắt tiếng, nhẹ máy' : 'Đã chạy tiếp');
  }));
  api.onPause(renderPause);

  // ---------- Màn hình phát live ----------
  let outputOpen = false;
  $$('[data-open-output]').forEach((b) => b.addEventListener('click', () => api.openOutput()));
  api.onOutput(({ open }) => {
    outputOpen = open;
    $$('[data-open-output]').forEach((b) => {
      b.classList.toggle('open', open);
      b.textContent = open ? '📺 Màn hình phát đang mở' : '📺 Mở màn hình phát live';
    });
    // tránh phát tiếng 2 lần: khi cửa sổ phát mở, khung xem trước tự tắt tiếng
    setPreviewSrc(false);
    if (open) notify('Đã mở màn hình phát. Trong TikTok LIVE Studio chọn “Chụp cửa sổ” → cửa sổ này.');
  });

  $$('#guide-tabs .chip').forEach((c) => c.addEventListener('click', () => {
    $$('#guide-tabs .chip').forEach((x) => x.classList.toggle('active', x === c));
    $$('.guide').forEach((g) => { g.hidden = g.dataset.guide !== c.dataset.g; });
  }));

  // ---------- Gửi thử ----------
  $$('[data-test]').forEach((b) => b.addEventListener('click', () => api.test(b.dataset.test)));

  // ---------- Server / Overlay ----------
  function renderServer(s) {
    server = s;
    const url = `http://localhost:${s.port}`;
    $('#srv-dot').className = 'dot ' + (s.running ? 'ok' : 'err');
    $('#srv-sub').textContent = s.running ? url : s.error || 'Không chạy';
    $('#overlay-url').textContent = url;
    $('#overlay-url-studio').textContent = `http://lvh.me:${s.port}`;
    $('#clients').textContent = s.running ? Math.max(0, (s.clients || 0) - 1) : 0; // trừ khung xem trước
    $('#qs-link').textContent = `http://lvh.me:${s.port}`;

    const vp = s.liveViewport;
    const resEl = $('#live-res');
    const warnRes = $('#warn-resolution');
    const warnTxt = $('#warn-res-text');
    if (resEl && warnRes && warnTxt) {
      if (!vp || !vp.width || !vp.height) {
        resEl.textContent = '—';
        resEl.style.color = '';
        warnRes.hidden = true;
      } else if (vp.role === 'output' && vp.height < 1600) {
        resEl.textContent = `${vp.width}×${vp.height} (Cửa sổ)`;
        resEl.style.color = '#fbbf24';
        warnTxt.innerHTML = `<b>Đang chụp cửa sổ ${vp.width}×${vp.height} nên lên live bị mờ!</b> Màn hình máy tính ngang chỉ cao 1080px nên cửa sổ dọc bị thu nhỏ. Hãy dùng nguồn <b>Link</b> <code>http://lvh.me:${s.port}</code> trong TikTok LIVE Studio và nhập kích thước <b>1080 × 1920</b> để nét căng Full HD.`;
        warnRes.hidden = false;
      } else if (vp.width < 1000 || vp.height < 1750) {
        resEl.textContent = `${vp.width}×${vp.height} (Thấp)`;
        resEl.style.color = '#f87171';
        warnTxt.innerHTML = `<b>Nguồn Link đang đặt ${vp.width}×${vp.height} nên hình bị vỡ/mờ!</b> Trong TikTok LIVE Studio (hoặc OBS), hãy bấm đúp vào nguồn <b>Link / Browser</b> → đổi <b>Chiều rộng = 1080</b>, <b>Chiều cao = 1920</b> (đừng chỉ kéo giãn góc khung).`;
        warnRes.hidden = false;
      } else {
        resEl.textContent = `${vp.width}×${vp.height} ✓ HD`;
        resEl.style.color = '#a3e635';
        warnRes.hidden = true;
      }
    }
    renderQuick();
    setPreviewSrc(false);
    if (settings) renderChuaNav(settings.overlay.mode);
    if (!s.running && s.error) notify(s.error, 'err');
  }

  $('#btn-copy-studio').addEventListener('click', async () => {
    await api.copy(`http://lvh.me:${server.port}`);
    notify('Đã sao chép link cho TikTok LIVE Studio');
  });
  $('#btn-copy-url').addEventListener('click', async () => {
    await api.copy(`http://localhost:${server.port}`);
    notify('Đã sao chép đường dẫn overlay');
  });
  $('#btn-reload-overlay').addEventListener('click', () => {
    api.reloadOverlay();
    notify('Đã gửi lệnh tải lại tới mọi overlay');
  });
  // Lưới vùng bị TikTok che trong khung xem trước (chỉ trong app, không ảnh hưởng live)
  let showSafe = false;
  $$('.preview-safe-cb').forEach((cb) => cb.addEventListener('change', (e) => {
    showSafe = e.target.checked;
    $$('.preview-safe-cb').forEach((x) => { x.checked = showSafe; });
    setPreviewSrc(true);
  }));
  $$('.preview-sound-cb').forEach((cb) => cb.addEventListener('change', (e) => {
    settings.previewSound = e.target.checked;
    $$('.preview-sound-cb').forEach((x) => { x.checked = e.target.checked; });
    save({ previewSound: e.target.checked }, true);
    setPreviewSrc(true);
  }));

  // Khung xem cảnh: chỉ khung ở tab đang mở được chạy, tab khác tắt hẳn cho nhẹ máy
  // Tự hồi phục khung xem: không nhận được nhịp "còn sống" 4 giây -> tải lại khung
  let lastAlive = Date.now();
  window.addEventListener('message', (e) => { if (e.data && e.data.studioAlive) lastAlive = Date.now(); });
  setInterval(() => {
    const vis = $$('.live-preview').some((f) => f.dataset.src && $('#view-' + f.dataset.for).classList.contains('active'));
    if (vis && !document.hidden && Date.now() - lastAlive > 4000) { lastAlive = Date.now(); setPreviewSrc(true); }
  }, 2000);
  // cửa sổ hiện lại sau khi thu nhỏ / máy ngủ dậy: tải lại khung cho chắc
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { lastAlive = Date.now(); setPreviewSrc(true); } });
  api.onPreviewReload(() => { lastAlive = Date.now(); setPreviewSrc(true); });
  $$('[data-reload-preview]').forEach((b) => b.addEventListener('click', () => { setPreviewSrc(true); notify('Đã tải lại khung xem'); }));

  function setPreviewSrc(force) {
    if (!server.running) return;
    const mute = (settings && !settings.previewSound) || outputOpen;
    const src = `http://127.0.0.1:${server.port}/?preview${mute ? '&mute=1' : ''}${showSafe ? '&safe=1' : ''}`;
    $$('.live-preview').forEach((iframe) => {
      const visible = $('#view-' + iframe.dataset.for).classList.contains('active');
      const want = visible ? src : '';
      if (force || iframe.dataset.src !== want) {
        iframe.dataset.src = want;
        iframe.src = want || 'about:blank';
      }
    });
  }

  // ---------- Cài đặt ----------
  let saveTimer = 0;
  let pending = {};
  function save(patch, immediate = false) {
    pending = deepMerge(pending, patch);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const p = pending;
      pending = {};
      const r = await api.updateSettings(p);
      settings = r.settings;
      renderServer(r.server);
    }, immediate ? 0 : 250);
  }
  function deepMerge(a, b) {
    const o = { ...a };
    for (const [k, v] of Object.entries(b)) {
      o[k] = v && typeof v === 'object' && !Array.isArray(v) ? deepMerge(a[k] || {}, v) : v;
    }
    return o;
  }

  function renderSettings() {
    const o = settings.overlay;
    $$('[data-o]').forEach((el) => {
      const k = el.dataset.o;
      if (el.type === 'checkbox') el.checked = !!o[k];
      else el.value = o[k];
    });
    updateLabels();
    $$('#bg-seg button').forEach((b) => b.classList.toggle('active', b.dataset.bg === o.background));
    renderChuaNav(o.mode);
    $$('#amb-grid button').forEach((b) => b.classList.toggle('active', b.dataset.amb === o.ambientPreset && !o.customAmbient));
    $('#amb-grid').classList.toggle('off', !o.ambient || !!o.customAmbient);
    const chuaSc = o.chuaSoundscape || 'off';
    $$('#chua-soundscape button').forEach((b) => b.classList.toggle('active', b.dataset.sc === chuaSc));
    $('#chua-vol-field')?.classList.toggle('off-field', chuaSc === 'off');
    $('#chua-custom-row')?.classList.toggle('active-custom', chuaSc === 'custom');
    const barSc = o.barSoundscape || 'house';
    $$('#bar-soundscape button').forEach((b) => b.classList.toggle('active', b.dataset.bsc === barSc));
    $('#bar-vol-field')?.classList.toggle('off-field', barSc === 'off');
    $('#bar-custom-row')?.classList.toggle('active-custom', barSc === 'custom');
    $$('#bar-theme button').forEach((b) => b.classList.toggle('active', b.dataset.btheme === (o.barTheme || 'cyber')));
    const lopSc = o.lopSoundscape || 'off';
    $$('#lop-soundscape button').forEach((b) => b.classList.toggle('active', b.dataset.lsc === lopSc));
    $('#lop-vol-field')?.classList.toggle('off-field', lopSc === 'off');
    $('#lop-custom-row')?.classList.toggle('active-custom', lopSc === 'custom');
    $$('#lop-theme button').forEach((b) => b.classList.toggle('active', b.dataset.ltheme === (o.lopTheme || 'classic')));
    $$('#lop-avatar-seg button').forEach((b) => b.classList.toggle('active', b.dataset.lav === (o.lopAvatarMode || 'avatar')));
    renderTriggerEditor('#chua-trigger-list', 'chuaTriggers', CHUA_EFFECT_OPTS);
    renderTriggerEditor('#bar-trigger-list', 'barTriggers', BAR_EFFECT_OPTS);
    $$('#swatches button').forEach((b) => b.classList.toggle('active', b.dataset.c === o.accent));
    $('#accent-custom').value = o.accent;
    const DEF = {
      customGiftSound: 'Mặc định: chuông chùa', customChatSound: 'Mặc định: ting', customJumpscare: 'Mặc định: 6 mặt ma ngẫu nhiên',
      customScareSound: 'Mặc định: 4 kiểu tiếng thét ngẫu nhiên', customAmbient: 'Mặc định: gió hú tự tạo',
      customChuaMusic: 'Chưa chọn file nhạc', customBarMusic: 'Chưa chọn file nhạc'
    };
    for (const k of Object.keys(DEF)) {
      const def = DEF[k];
      const fEl = $('#f-' + k);
      if (fEl) {
        fEl.textContent = o[k] ? o[k].split(/[\\/]/).pop() : def;
        fEl.title = o[k] || '';
      }
    }
    $('#autoReconnect').checked = settings.autoReconnect;
    $$('.preview-sound-cb').forEach((x) => { x.checked = settings.previewSound; });
    $('#port').value = settings.port;
  }

  function updateLabels() {
    const o = settings.overlay;
    $('#v-chatDuration').textContent = o.chatDuration + ' giây';
    $('#v-maxCards').textContent = o.maxCards;
    $('#v-volume').textContent = Math.round(o.volume * 100) + '%';
    $('#v-roundEvery').textContent = o.roundEvery ? o.roundEvery + ' phút' : 'Tắt';
    $('#v-chuaRate').textContent = '×' + Number(o.chuaRate).toFixed(2);
    $('#v-rapVolume').textContent = Math.round(o.rapVolume * 100) + '%';
    $('#v-rapRate').textContent = '×' + Number(o.rapRate).toFixed(2);
    $('#v-rapIdleMin').textContent = o.rapIdleMin ? o.rapIdleMin + ' phút' : 'Không bao giờ';
    if (document.activeElement !== $('#rap-name')) $('#rap-name').value = o.rapName || '';
    renderMovies();
    $$('#rap-theme button').forEach((b) => b.classList.toggle('active', b.dataset.theme === (o.rapTheme || 'classic')));
    $('#rap-lights').textContent = o.rapLightsOff ? '💡 Bật đèn phòng' : '🌑 Tắt đèn phòng';
    $('#rap-lights').classList.toggle('on', !!o.rapLightsOff);
    $('#v-liveBoost').textContent = o.liveBoost ? '+' + o.liveBoost + '%' : 'Tắt';
    $('#v-chuaMusicVolume').textContent = Math.round(o.chuaMusicVolume * 100) + '%';
    if (document.activeElement !== $('#chua-name')) $('#chua-name').value = o.chuaName || '';
    if ($('#v-barRate')) $('#v-barRate').textContent = '×' + Number(o.barRate ?? 1.05).toFixed(2);
    if ($('#v-barMusicVolume')) $('#v-barMusicVolume').textContent = Math.round((o.barMusicVolume ?? 0.45) * 100) + '%';
    if ($('#v-barIdleMin')) $('#v-barIdleMin').textContent = o.barIdleMin ? o.barIdleMin + ' phút' : 'Chỉ khi rời live';
    if ($('#bar-name') && document.activeElement !== $('#bar-name')) $('#bar-name').value = o.barName || '';
    renderBarMusic();
    if ($('#v-lopQuestionSec')) $('#v-lopQuestionSec').textContent = (o.lopQuestionSec || 20) + ' giây';
    if ($('#v-lopRate')) $('#v-lopRate').textContent = '×' + Number(o.lopRate ?? 1.08).toFixed(2);
    if ($('#v-lopMusicVolume')) $('#v-lopMusicVolume').textContent = Math.round((o.lopMusicVolume ?? 0.25) * 100) + '%';
    if ($('#v-lopIdleMin')) $('#v-lopIdleMin').textContent = o.lopIdleMin ? o.lopIdleMin + ' phút' : 'Chỉ khi rời live';
    if ($('#lop-name') && document.activeElement !== $('#lop-name')) $('#lop-name').value = o.lopName || '';
    if ($('#lop-custom-words') && document.activeElement !== $('#lop-custom-words')) $('#lop-custom-words').value = o.lopCustomWords || '';
    renderLopMusic();
    $('#v-tutorialEvery').textContent = o.tutorialEvery ? o.tutorialEvery + ' phút' : 'Tắt';
    $('#v-ambientVolume').textContent = Math.round(o.ambientVolume * 100) + '%';
  }

  $$('[data-o]').forEach((el) => {
    const evt = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const k = el.dataset.o;
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if ('num' in el.dataset) v = Number(v) || 0;
      settings.overlay[k] = v;
      updateLabels();
      save({ overlay: { [k]: v } });
    });
  });

  $$('#bg-seg button').forEach((b) => b.addEventListener('click', () => {
    settings.overlay.background = b.dataset.bg;
    renderSettings();
    save({ overlay: { background: b.dataset.bg } }, true);
  }));
  $$('#amb-grid button').forEach((b) => b.addEventListener('click', () => {
    settings.overlay.ambientPreset = b.dataset.amb;
    settings.overlay.ambient = true;
    const patch = { ambientPreset: b.dataset.amb, ambient: true };
    if (settings.overlay.customAmbient) { settings.overlay.customAmbient = ''; patch.customAmbient = ''; }
    renderSettings();
    save({ overlay: patch }, true);
  }));

  const setAccent = (c) => {
    settings.overlay.accent = c;
    renderSettings();
    save({ overlay: { accent: c } });
  };
  $$('#swatches button').forEach((b) => b.addEventListener('click', () => setAccent(b.dataset.c)));
  $('#accent-custom').addEventListener('input', (e) => setAccent(e.target.value));

  $$('[data-pick]').forEach((b) => b.addEventListener('click', async () => {
    const file = await api.pickSound(b.dataset.kind);
    if (!file) return;
    const key = b.dataset.pick;
    const patch = { [key]: file };
    settings.overlay[key] = file;
    if (key === 'customChuaMusic') {
      settings.overlay.chuaSoundscape = 'custom';
      settings.overlay.chuaMusic = true;
      patch.chuaSoundscape = 'custom';
      patch.chuaMusic = true;
    }
    if (key === 'customBarMusic') {
      settings.overlay.barSoundscape = 'custom';
      patch.barSoundscape = 'custom';
    }
    renderSettings();
    save({ overlay: patch }, true);
  }));
  $$('[data-clear]').forEach((b) => b.addEventListener('click', () => {
    const key = b.dataset.clear;
    const patch = { [key]: '' };
    settings.overlay[key] = '';
    if (key === 'customChuaMusic' && settings.overlay.chuaSoundscape === 'custom') {
      settings.overlay.chuaSoundscape = 'off';
      settings.overlay.chuaMusic = false;
      patch.chuaSoundscape = 'off';
      patch.chuaMusic = false;
    }
    if (key === 'customBarMusic' && settings.overlay.barSoundscape === 'custom') {
      settings.overlay.barSoundscape = 'house';
      patch.barSoundscape = 'house';
    }
    renderSettings();
    save({ overlay: patch }, true);
  }));

  $('#btn-tt-login').addEventListener('click', () => api.tiktokLogin());
  $('#btn-tt-login-quick')?.addEventListener('click', () => api.tiktokLogin());
  $('#btn-tt-logout').addEventListener('click', async () => {
    await api.tiktokLogout();
    notify('Đã xoá phiên đăng nhập TikTok trên máy');
  });
  $('#autoReconnect').addEventListener('change', (e) => save({ autoReconnect: e.target.checked }, true));
  $('#btn-apply-port').addEventListener('click', async () => {
    const port = Number($('#port').value);
    if (!(port >= 1024 && port <= 65535)) return notify('Cổng phải từ 1024 đến 65535', 'err');
    const r = await api.updateSettings({ port });
    settings = r.settings;
    renderServer(r.server);
    if (r.server.running) notify(`Overlay chạy ở cổng ${port}. Nhớ cập nhật URL trong OBS.`);
  });

  // ---------- Khởi động ----------
  api.onStatus(renderStatus);
  api.onStats(renderStats);
  api.onEvent(addFeed);
  api.onServer(renderServer);

  api.init().then((init) => {
    settings = init.settings;
    $('#username').value = settings.username;
    $('#ver').textContent = 'v' + init.version;
    renderSettings();
    renderServer(init.server);
    renderStatus({ status: init.live.status, username: init.live.username });
    renderPause(init.paused);
    if (init.lopState) renderLopState(init.lopState);
    renderStats({ ...init.live.stats, topGifters: init.live.topGifters });
  });
})();
