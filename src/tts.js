'use strict';
/*
 * Giọng đọc tiếng Việt & tiếng Anh cho StudioLive (Chùa, Bar, Rạp, Lớp Học Chữ).
 * Dùng Microsoft Edge Neural TTS (NamMinh / HoaiMy / Ana) trên kết nối WebSocket tái sử dụng,
 * tự động ngắt mạch (cooldown 90s) và chuyển tức thì sang Google Translate TTS khi gặp lỗi 429.
 * Lưu ý: cả hai là dịch vụ trực tuyến bên ngoài — câu cần đọc được gửi tới đó.
 */
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const VOICES = {
  m: { voice: 'vi-VN-NamMinhNeural', pitch: '-4%', lang: 'vi' },
  f: { voice: 'vi-VN-HoaiMyNeural', pitch: '+4%', lang: 'vi' },
  en: { voice: 'vi-VN-HoaiMyNeural', pitch: '+4%', lang: 'vi' }
};

const EDGE_IDLE_MS = 300000;
const EDGE_COOLDOWN_MS = 25000;

const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function splitTtsText(text, max = 190) {
  const chunks = [];
  let rest = String(text || '').trim();
  while (rest.length > max) {
    const win = rest.slice(0, max + 1);
    let cut = Math.max(win.lastIndexOf('. '), win.lastIndexOf('! '), win.lastIndexOf('? '));
    if (cut < max / 2) cut = Math.max(win.lastIndexOf(', '), win.lastIndexOf('; '));
    if (cut < max / 2) cut = win.lastIndexOf(' ');
    if (cut <= 0) cut = max - 1;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

// Tái sử dụng 1 phiên MsEdgeTTS cho mỗi giọng để tránh mở mới hàng chục WebSocket/phút gây lỗi 429
const edgeClients = new Map(); // voice -> { tts, lastUsed, idleTimer }
let edgeCooldownUntil = 0;
let edgeFailStreak = 0;
let lastCooldownLogAt = 0;

function dropEdgeClient(voice) {
  const rec = edgeClients.get(voice);
  if (!rec) return;
  edgeClients.delete(voice);
  clearTimeout(rec.idleTimer);
  try { rec.tts.close(); } catch { /* ignore */ }
}

function getEdgeClient(voice) {
  let rec = edgeClients.get(voice);
  if (rec && Date.now() - rec.lastUsed > EDGE_IDLE_MS) {
    dropEdgeClient(voice);
    rec = null;
  }
  if (!rec) {
    rec = {
      tts: new MsEdgeTTS({ connectionTimeoutMs: 8000, synthesisTimeoutMs: 10000 }),
      lastUsed: Date.now(),
      idleTimer: null
    };
    edgeClients.set(voice, rec);
  }
  rec.lastUsed = Date.now();
  clearTimeout(rec.idleTimer);
  rec.idleTimer = setTimeout(() => dropEdgeClient(voice), EDGE_IDLE_MS + 2000);
  if (rec.idleTimer.unref) rec.idleTimer.unref();
  return rec.tts;
}

async function edgeTtsOnce(text, rate, vCfg, hype) {
  const tts = getEdgeClient(vCfg.voice);
  let timer = null;
  let audioStream = null;
  try {
    await tts.setMetadata(vCfg.voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const prosody = {
      rate: `${Math.round((rate - 1) * 100)}%`,
      pitch: vCfg.pitch
    };
    ({ audioStream } = tts.toStream(escapeXml(text), prosody));
    const chunks = [];
    const read = (async () => {
      for await (const c of audioStream) chunks.push(c);
    })();
    // Gắn .catch rỗng lên nhánh phụ để không bao giờ phát sinh UnhandledPromiseRejection khi timeout thắng
    read.catch(() => {});
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Edge TTS timeout')), 11000);
    });
    await Promise.race([read, timeout]);
    if (!chunks.length) throw new Error('Edge TTS returned no audio');
    return Buffer.concat(chunks);
  } catch (err) {
    if (audioStream) {
      try { audioStream.destroy(); } catch { /* ignore */ }
    }
    dropEdgeClient(vCfg.voice);
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Xếp hàng tuần tự + khử trùng câu đang tổng hợp + chống UnhandledPromiseRejection tuyệt đối
let edgeChain = Promise.resolve();
const edgeInflight = new Map();

function isRateLimitErr(err) {
  const msg = String(err?.message || err || '');
  const code = err?.cause?.statusCode || err?.statusCode;
  return code === 429 || /\b429\b|too many requests/i.test(msg);
}

function tripEdgeCooldown(reason) {
  edgeCooldownUntil = Date.now() + EDGE_COOLDOWN_MS;
  for (const v of [...edgeClients.keys()]) dropEdgeClient(v);
  if (Date.now() - lastCooldownLogAt > 30000) {
    lastCooldownLogAt = Date.now();
    console.warn(`[tts] Edge tạm giới hạn (${reason}) -> dùng Google TTS trong 90s.`);
  }
}

function edgeTts(text, rate, vCfg, hype) {
  if (Date.now() < edgeCooldownUntil) {
    return Promise.reject(Object.assign(new Error('Edge TTS cooldown active'), { cooldown: true }));
  }
  const key = `${vCfg.voice}|${rate}|${hype ? 1 : 0}|${text}`;
  const existing = edgeInflight.get(key);
  if (existing) return existing;

  const run = async () => {
    if (Date.now() < edgeCooldownUntil) {
      throw Object.assign(new Error('Edge TTS cooldown active'), { cooldown: true });
    }
    try {
      const buf = await edgeTtsOnce(text, rate, vCfg, hype);
      edgeFailStreak = 0;
      return buf;
    } catch (e) {
      edgeFailStreak += 1;
      if (isRateLimitErr(e) || edgeFailStreak >= 2) {
        tripEdgeCooldown(e.message || '429');
        throw e;
      }
      // Lỗi mạng thoáng qua (không phải 429): thử lại 1 lần duy nhất
      await new Promise((r) => setTimeout(r, 180));
      try {
        const buf = await edgeTtsOnce(text, rate, vCfg, hype);
        edgeFailStreak = 0;
        return buf;
      } catch (e2) {
        edgeFailStreak += 1;
        if (isRateLimitErr(e2) || edgeFailStreak >= 2) tripEdgeCooldown(e2.message || 'error');
        throw e2;
      }
    }
  };

  const cleanup = () => edgeInflight.delete(key);
  const job = edgeChain.then(run, run);
  // QUAN TRỌNG: dùng .then(cleanup, cleanup) thay vì job.finally() trần để không tạo Promise phụ bị reject ngầm
  edgeChain = job.then(cleanup, cleanup);
  edgeInflight.set(key, job);
  return job;
}

async function googleTts(text, lang = 'vi') {
  const parts = [];
  for (const chunk of splitTtsText(text)) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 8000);
    try {
      const r = await fetch(url, {
        signal: ac.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/'
        }
      });
      if (!r.ok) throw new Error(`TTS upstream error: ${r.status}`);
      parts.push(Buffer.from(await r.arrayBuffer()));
    } finally {
      clearTimeout(timer);
    }
  }
  return Buffer.concat(parts);
}

const cache = new Map();
const fallbackCache = new Map(); // text -> { audio, until } (TTL ngắn để không ám giọng dự phòng vào cache chính)

async function synthesize(text, rate = 1, opts = {}) {
  const vKey = opts && VOICES[opts.v] ? opts.v : 'm';
  const vCfg = VOICES[vKey];
  const key = `${vKey}|${rate}|${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  if (Date.now() < edgeCooldownUntil) {
    const fb = fallbackCache.get(key);
    if (fb && Date.now() < fb.until) return fb.audio;
    const audio = await googleTts(text, vCfg.lang);
    fallbackCache.set(key, { audio, until: Date.now() + 25000 });
    return audio;
  }

  try {
    const audio = await edgeTts(text, rate, vCfg, false);
    cache.set(key, audio);
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return audio;
  } catch (err) {
    if (!err?.cooldown && !isRateLimitErr(err)) {
      console.warn('[tts] Edge lỗi, chuyển tạm sang Google:', err.message);
    }
    const fb = fallbackCache.get(key);
    if (fb && Date.now() < fb.until) return fb.audio;
    const audio = await googleTts(text, vCfg.lang);
    fallbackCache.set(key, { audio, until: Date.now() + 25000 });
    return audio;
  }
}

module.exports = { synthesize, _resetForTest() { edgeCooldownUntil = 0; edgeFailStreak = 0; cache.clear(); } };
