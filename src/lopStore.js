'use strict';
/*
 * Lưu sổ lớp học (`so-lop.json`) và báo cáo buổi live (`bao-cao/<YYYY-MM-DD>.json`)
 * áp dụng theo ý tưởng từ `lop-hoc-chu`:
 *  - Đánh dấu câu hỏi đã hỏi (`used`) để không lặp lại cho tới khi hết kho
 *  - Lưu danh sách câu hỏi bị chủ kênh bỏ qua (`banned`)
 *  - Bảng điểm trong ngày (`todayTop`), bảng vàng tuần (`weekTop`), chuỗi điểm danh chuyên cần (`attendance`)
 *  - Trang web báo cáo buổi live (`/lop-bao-cao`)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const w = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`;
}

const escHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

class LopStore {
  constructor(baseDir) {
    this.dir = baseDir || path.join(os.tmpdir(), 'studiolive-lop');
    this.savePath = path.join(this.dir, 'so-lop.json');
    this.reportDir = path.join(this.dir, 'bao-cao');
    this.state = null;
  }

  ensureLoaded() {
    if (!this.state) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.savePath, 'utf8'));
        this.state = {
          used: Array.isArray(raw.used) ? raw.used.filter((x) => typeof x === 'string') : [],
          banned: Array.isArray(raw.banned) ? raw.banned.filter((x) => typeof x === 'string') : [],
          weekKey: typeof raw.weekKey === 'string' ? raw.weekKey : weekKey(),
          week: raw.week && typeof raw.week === 'object' ? raw.week : {},
          todayKey: typeof raw.todayKey === 'string' ? raw.todayKey : todayStr(),
          today: raw.today && typeof raw.today === 'object' ? raw.today : {},
          attendance: raw.attendance && typeof raw.attendance === 'object' ? raw.attendance : {}
        };
      } catch {
        this.state = {
          used: [],
          banned: [],
          weekKey: weekKey(),
          week: {},
          todayKey: todayStr(),
          today: {},
          attendance: {}
        };
      }
    }
    const wk = weekKey();
    if (this.state.weekKey !== wk) {
      this.state.weekKey = wk;
      this.state.week = {};
    }
    const td = todayStr();
    if (this.state.todayKey !== td) {
      this.state.todayKey = td;
      this.state.today = {};
    }
    return this.state;
  }

  flush() {
    if (!this.state) return;
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      fs.writeFileSync(this.savePath, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.warn('[lopStore] Không lưu được sổ lớp:', e.message);
    }
  }

  topList(mapObj, limit = 10) {
    return Object.entries(mapObj || {})
      .map(([username, v]) => ({
        username,
        nickname: String(v?.nickname || username),
        avatar: String(v?.avatar || ''),
        score: Number(v?.score) || 0
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getSave() {
    const s = this.ensureLoaded();
    return {
      used: s.used,
      banned: s.banned,
      weekTop: this.topList(s.week, 10),
      todayTop: this.topList(s.today, 10)
    };
  }

  postSave(body = {}) {
    const s = this.ensureLoaded();
    if (Array.isArray(body.used)) {
      if (body.replaceUsed) {
        s.used = body.used.filter((x) => typeof x === 'string').slice(-5000);
      } else {
        const set = new Set(s.used);
        for (const id of body.used) {
          if (typeof id === 'string' && id) set.add(id);
        }
        s.used = [...set].slice(-5000);
      }
    }
    if (Array.isArray(body.banned)) {
      const set = new Set(s.banned);
      for (const id of body.banned) {
        if (typeof id === 'string' && id) set.add(id);
      }
      s.banned = [...set];
    }
    if (Array.isArray(body.scores)) {
      for (const p of body.scores) {
        if (!p || typeof p.username !== 'string' || !(Number(p.delta) > 0)) continue;
        const delta = Math.round(Number(p.delta));
        const nick = String(p.nickname || p.username).slice(0, 60);
        const av = String(p.avatar || '').slice(0, 1200);
        const curW = s.week[p.username] || { nickname: nick, avatar: av, score: 0 };
        curW.nickname = nick;
        if (av) curW.avatar = av;
        curW.score += delta;
        s.week[p.username] = curW;

        const curT = s.today[p.username] || { nickname: nick, avatar: av, score: 0 };
        curT.nickname = nick;
        if (av) curT.avatar = av;
        curT.score += delta;
        s.today[p.username] = curT;
      }
    }
    if (body.report && typeof body.report === 'object') {
      this.appendReport(body.report);
    }
    this.flush();
    return {
      ok: true,
      weekTop: this.topList(s.week, 10),
      todayTop: this.topList(s.today, 10)
    };
  }

  attend({ username, nickname } = {}) {
    const u = String(username || '').trim();
    if (!u) return { days: 0, total: 0, fresh: false };
    const s = this.ensureLoaded();
    const td = todayStr();
    const yd = yesterdayStr();
    const nick = String(nickname || u).slice(0, 60);
    const cur = s.attendance[u];
    let fresh = false;
    if (!cur) {
      s.attendance[u] = { nickname: nick, lastDay: td, days: 1, total: 1 };
      fresh = true;
    } else {
      cur.nickname = nick;
      if (cur.lastDay !== td) {
        cur.days = cur.lastDay === yd ? (Number(cur.days) || 0) + 1 : 1;
        cur.total = (Number(cur.total) || 0) + 1;
        cur.lastDay = td;
        fresh = true;
      }
    }
    if (fresh) this.flush();
    const rec = s.attendance[u];
    return { days: rec.days, total: rec.total, fresh };
  }

  unban(id) {
    const s = this.ensureLoaded();
    const clean = String(id || '').trim();
    s.banned = s.banned.filter((x) => x !== clean);
    this.flush();
    return { ok: true, banned: s.banned };
  }

  resetToday() {
    const s = this.ensureLoaded();
    s.today = {};
    this.flush();
    return { ok: true, weekTop: this.topList(s.week, 10), todayTop: [] };
  }

  reportPath(day) {
    const safe = /^\d{4}-\d{2}-\d{2}$/.test(String(day || '')) ? day : todayStr();
    return path.join(this.reportDir, `${safe}.json`);
  }

  loadReport(day) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(String(day || '')) ? day : todayStr();
    try {
      return JSON.parse(fs.readFileSync(this.reportPath(d), 'utf8'));
    } catch {
      return { date: d, rounds: 0, totalPlayers: 0, peakActive: 0, questions: {} };
    }
  }

  listReportDays() {
    try {
      return fs.readdirSync(this.reportDir)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .map((f) => f.slice(0, 10))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  appendReport(entry) {
    const r = this.loadReport(todayStr());
    r.rounds = (Number(r.rounds) || 0) + 1;
    r.totalPlayers = Math.max(Number(r.totalPlayers) || 0, Number(entry.totalPlayers) || 0);
    r.peakActive = Math.max(Number(r.peakActive) || 0, Number(entry.peakActive) || 0);
    if (!r.questions || typeof r.questions !== 'object') r.questions = {};
    if (Array.isArray(entry.questions)) {
      for (const q of entry.questions) {
        if (!q || !q.id) continue;
        const cur = r.questions[q.id] || {
          answer: String(q.answer || ''),
          clue: String(q.clue || ''),
          category: String(q.category || ''),
          asked: 0,
          attempts: 0,
          correct: 0
        };
        cur.asked += 1;
        cur.attempts += Number(q.attempts) || 0;
        cur.correct += Number(q.correct) || 0;
        r.questions[q.id] = cur;
      }
    }
    try {
      fs.mkdirSync(this.reportDir, { recursive: true });
      fs.writeFileSync(this.reportPath(todayStr()), JSON.stringify(r, null, 2));
    } catch (e) {
      console.warn('[lopStore] Không lưu được báo cáo:', e.message);
    }
  }

  renderReportHtml(dayQuery) {
    const s = this.ensureLoaded();
    const day = /^\d{4}-\d{2}-\d{2}$/.test(String(dayQuery || '')) ? dayQuery : todayStr();
    const r = this.loadReport(day);
    const days = [...new Set([todayStr(), ...this.listReportDays()])];
    const qs = Object.entries(r.questions || {}).map(([id, q]) => ({
      id,
      ...q,
      rate: q.attempts ? Math.round((q.correct / q.attempts) * 100) : 0
    }));
    const hard = qs.filter((q) => q.correct === 0 && q.attempts >= 3).sort((a, b) => b.attempts - a.attempts).slice(0, 20);
    const easy = qs.filter((q) => q.attempts >= 3 && q.rate >= 90).sort((a, b) => b.rate - a.rate).slice(0, 15);
    const topToday = this.topList(s.today, 15);
    const topWeek = this.topList(s.week, 15);
    const topAttend = Object.values(s.attendance || {}).sort((a, b) => (b.days || 0) - (a.days || 0)).slice(0, 15);

    const rowQ = (q, actionBtn = '') =>
      `<tr><td><b>${escHtml(q.answer)}</b> <small>(${escHtml(q.category)})</small><br><span class="clue">${escHtml(q.clue)}</span></td>` +
      `<td>${q.asked}</td><td>${q.correct}/${q.attempts} (${q.rate}%)</td><td>${actionBtn}</td></tr>`;

    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Báo cáo Lớp Học Chữ — ${escHtml(day)}</title>
<style>
  body{font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-width:960px;margin:24px auto;padding:0 18px;background:#faf6ee;color:#2b1d0e}
  h1{margin:0 0 6px;font-size:24px} h2{margin:26px 0 8px;border-bottom:2px solid #e2d4b7;padding-bottom:4px;font-size:18px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:14px 0}
  .stat{background:#fff;border:1px solid #e2d4b7;border-radius:10px;padding:12px 14px;box-shadow:0 2px 6px rgba(0,0,0,.04)}
  .stat b{display:block;font-size:24px;color:#b45309}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e2d4b7}
  td,th{padding:9px 11px;border-bottom:1px solid #efe6d2;text-align:left;vertical-align:top}
  th{background:#f3ead6;font-weight:700} .clue{color:#6b5b45;font-size:13px}
  .days a{margin-right:8px;color:#b45309;text-decoration:none;padding:3px 8px;border-radius:6px;background:#f3ead6;display:inline-block;margin-bottom:4px}
  .days a.on{background:#b45309;color:#fff;font-weight:700}
  button{cursor:pointer;padding:4px 10px;border-radius:6px;border:1px solid #c9b58c;background:#fff8eb;color:#78350f;font-weight:600}
  button:hover{background:#fde68a}
  .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
</style></head><body>
<h1>📊 Báo cáo buổi live Lớp Học Chữ — ${escHtml(day)}</h1>
<div class="days">Ngày: ${days.map((d) => `<a href="?d=${encodeURIComponent(d)}" class="${d === day ? 'on' : ''}">${escHtml(d)}</a>`).join('')}</div>
<div class="stats">
  <div class="stat"><b>${r.rounds || 0}</b>tiết đã dạy</div>
  <div class="stat"><b>${qs.length}</b>câu đã hỏi hôm nay</div>
  <div class="stat"><b>${r.totalPlayers || 0}</b>tổng người tham gia</div>
  <div class="stat"><b>${r.peakActive || 0}</b>đông nhất cùng lúc</div>
  <div class="stat"><b>${s.used.length}</b>câu đã dùng trong sổ</div>
  <div class="stat"><b>${s.banned.length}</b>câu đã bỏ qua</div>
</div>

<h2>🤔 Câu quá khó (≥3 lượt đoán mà không ai giải ra — cân nhắc bỏ hoặc sửa gợi ý)</h2>
${hard.length ? `<table><tr><th>Câu hỏi</th><th>Hỏi</th><th>Đúng / Đoán</th><th>Thao tác</th></tr>${hard.map((q) =>
  rowQ(q, s.banned.includes(q.id) ? 'Đã bỏ' : `<button onclick="banQ('${escHtml(q.id)}',this)">🚫 Bỏ câu</button>`)
).join('')}</table>` : '<p>Chưa có câu nào bị bí hôm nay.</p>'}

<h2>😄 Câu dễ (tỉ lệ đúng ≥90%)</h2>
${easy.length ? `<table><tr><th>Câu hỏi</th><th>Hỏi</th><th>Đúng / Đoán</th><th></th></tr>${easy.map((q) => rowQ(q)).join('')}</table>` : '<p>Chưa có dữ liệu.</p>'}

<div class="cols">
  <div>
    <h2>🏆 Học sinh xuất sắc hôm nay</h2>
    ${topToday.length ? `<ol>${topToday.map((p) => `<li><b>${escHtml(p.nickname)}</b> — ${p.score} điểm</li>`).join('')}</ol>` : '<p>Chưa có điểm hôm nay.</p>'}
  </div>
  <div>
    <h2>👑 Bảng vàng tuần (${escHtml(s.weekKey)})</h2>
    ${topWeek.length ? `<ol>${topWeek.map((p) => `<li><b>${escHtml(p.nickname)}</b> — ${p.score} điểm</li>`).join('')}</ol>` : '<p>Chưa có điểm tuần này.</p>'}
  </div>
</div>

<h2>🎒 Học sinh chăm chỉ (điểm danh nhiều ngày liên tiếp)</h2>
${topAttend.length ? `<ol>${topAttend.map((p) => `<li><b>${escHtml(p.nickname)}</b> — ${p.days} ngày liền (tổng ${p.total} buổi)</li>`).join('')}</ol>` : '<p>Chưa có dữ liệu điểm danh.</p>'}

<h2>🚫 Câu đã bỏ qua (${s.banned.length})</h2>
${s.banned.length ? `<ul>${s.banned.map((id) => `<li><code>${escHtml(id)}</code> <button onclick="unbanQ('${escHtml(id)}',this)">Khôi phục</button></li>`).join('')}</ul>` : '<p>Chưa bỏ câu nào.</p>'}

<script>
async function unbanQ(id, btn){
  await fetch('/api/lop/unban',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  btn.parentElement.remove();
}
async function banQ(id, btn){
  await fetch('/api/lop/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({banned:[id]})});
  btn.replaceWith('Đã bỏ');
}
</script>
</body></html>`;
  }
}

module.exports = { LopStore };
