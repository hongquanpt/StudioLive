'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const { LopStore } = require('./lopStore');

const MEDIA_TYPES = {
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime'
};

/*
 * Server overlay nội bộ: chỉ lắng nghe 127.0.0.1 nên không ai ngoài máy truy cập được.
 * OBS / TikTok Live Studio thêm Browser Source trỏ tới http://localhost:<port>
 */
class OverlayServer {
  constructor({ getConfig, getSnapshot, getPaused, getDataDir }) {
    this.getConfig = getConfig;
    this.getPaused = getPaused || (() => false);
    this.getSnapshot = getSnapshot;
    this.getDataDir = getDataDir || null;
    this._lopStore = null;
    this.lastLopState = null;
    this.lastLopSync = null;
    this.onLopState = null;
    this.clientMeta = new Map(); // socket.id -> { socket, role, seq }
    this.clientSeq = 0;
    this.masterId = '';
    this.audioId = '';
    this.server = null;
    this.io = null;
    this.port = 0;
  }

  getLopStore() {
    if (!this._lopStore) {
      const base = this.getDataDir ? path.join(this.getDataDir(), 'lop-hoc') : undefined;
      this._lopStore = new LopStore(base);
    }
    return this._lopStore;
  }

  async start(port) {
    await this.stop();
    const app = express();
    app.disable('x-powered-by');

    // Giọng đọc tiếng Việt & tiếng Anh (Chùa, Bar, Rạp, Lớp Học Chữ)
    app.get('/api/tts', async (req, res) => {
      const text = String(req.query.text || '').trim().slice(0, 1500);
      if (!text) return res.status(400).send('Missing text parameter');
      const rate = Math.min(1.6, Math.max(0.5, Number(req.query.rate) || 1));
      const v = String(req.query.v || '');
      const hype = req.query.hype === '1';
      try {
        const audio = await require('./tts').synthesize(text, rate, { v, hype });
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(audio);
      } catch (e) {
        console.error('[tts]', e.message);
        res.status(500).json({ error: 'TTS failed' });
      }
    });

    // API sổ lớp & báo cáo buổi live cho chế độ Lớp Học Chữ
    const jsonParser = express.json({ limit: '512kb' });
    app.get('/api/lop/save', (_req, res) => {
      res.json(this.getLopStore().getSave());
    });
    app.post('/api/lop/save', jsonParser, (req, res) => {
      res.json(this.getLopStore().postSave(req.body || {}));
    });
    app.post('/api/lop/attend', jsonParser, (req, res) => {
      res.json(this.getLopStore().attend(req.body || {}));
    });
    app.post('/api/lop/unban', jsonParser, (req, res) => {
      res.json(this.getLopStore().unban(req.body?.id));
    });
    app.post('/api/lop/reset-today', jsonParser, (_req, res) => {
      res.json(this.getLopStore().resetToday());
    });
    app.post('/api/lop/state', jsonParser, (req, res) => {
      this.lastLopState = req.body || {};
      if (this.onLopState) this.onLopState(this.lastLopState);
      res.json({ ok: true });
    });
    app.get('/lop-bao-cao', (req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(this.getLopStore().renderReportHtml(req.query.d));
    });

    app.use(express.static(path.join(__dirname, '..', 'overlay'), { index: 'index.html' }));

    // Âm thanh tuỳ chỉnh người dùng chọn trên máy
    app.get('/media/:kind', (req, res) => {
      const o = this.getConfig().overlay;
      const file = {
        gift: o.customGiftSound, chat: o.customChatSound, jumpscare: o.customJumpscare,
        scare: o.customScareSound, ambient: o.customAmbient, chuamusic: o.customChuaMusic,
        barmusic: o.customBarMusic, lopmusic: o.customLopMusic
      }[req.params.kind] || '';
      const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
      if (!file || !type || !fs.existsSync(file)) return res.sendStatus(404);
      // sendFile hỗ trợ Range -> video tua/phát được trong OBS
      res.sendFile(file, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
    });

    // Phim cho cảnh Rạp Phim (file trên máy, hỗ trợ tua nhờ sendFile/Range)
    app.get('/rap/:i', (req, res) => {
      const list = this.getConfig().overlay.rapVideos || [];
      const file = list[Number(req.params.i)] || '';
      const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
      if (!file || !type || !type.startsWith('video/') || !fs.existsSync(file)) return res.sendStatus(404);
      res.sendFile(file, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
    });

    // Nhạc / MV cho cảnh Đi Bar Online (file âm thanh hoặc video trên máy)
    app.get('/barmusic/:i', (req, res) => {
      const list = this.getConfig().overlay.barMusicList || [];
      const file = list[Number(req.params.i)] || '';
      const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
      if (!file || !type || (!type.startsWith('audio/') && !type.startsWith('video/')) || !fs.existsSync(file)) return res.sendStatus(404);
      res.sendFile(file, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
    });

    // Nhạc nền riêng cho cảnh Lớp Học
    app.get('/lopmusic/:i', (req, res) => {
      const list = this.getConfig().overlay.lopMusicList || [];
      const file = list[Number(req.params.i)] || '';
      const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
      if (!file || !type || (!type.startsWith('audio/') && !type.startsWith('video/')) || !fs.existsSync(file)) return res.sendStatus(404);
      res.sendFile(file, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
    });

    app.get('/health', (_req, res) => res.json({ ok: true }));

    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: false } });
    io.on('connection', (socket) => {
      const rawRole = String(socket.handshake?.query?.role || 'live');
      const role = ['live', 'output', 'preview', 'muted'].includes(rawRole) ? rawRole : 'live';
      this.clientSeq += 1;
      this.clientMeta.set(socket.id, { socket, role, seq: this.clientSeq });

      this.electRoles();
      socket.emit('config', this.getConfig().overlay);
      socket.emit('stats', this.getSnapshot().stats);
      socket.emit('pause', this.getPaused());
      this.emitClients();

      socket.on('lopState', (st) => {
        if (this.masterId && socket.id !== this.masterId) return;
        if (st && typeof st === 'object') {
          this.lastLopState = st;
          if (this.onLopState) this.onLopState(st);
        }
      });
      socket.on('lopSync', (snap) => {
        if (this.masterId && socket.id !== this.masterId) return;
        if (snap && typeof snap === 'object') {
          this.lastLopSync = snap;
          socket.broadcast.emit('lopSync', snap);
        }
      });
      socket.on('overlayInfo', (vp) => {
        const meta = this.clientMeta.get(socket.id);
        if (meta && vp && typeof vp === 'object') {
          meta.viewport = {
            width: Number(vp.width) || 0,
            height: Number(vp.height) || 0,
            dpr: Number(vp.dpr) || 1
          };
          this.emitClients();
        }
      });
      socket.on('disconnect', () => {
        this.clientMeta.delete(socket.id);
        this.electRoles();
        this.emitClients();
      });
    });

    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => {
        server.off('error', reject);
        resolve();
      });
    });
    this.server = server;
    this.io = io;
    this.port = port;
    return port;
  }

  electRoles() {
    // 1. Chọn đúng 1 cửa sổ làm Master điều khiển tiết học (ưu tiên: TikTok LIVE Studio/OBS -> Cửa sổ phát -> Khung xem trước)
    const masterWeight = { live: 4, output: 3, preview: 2, muted: 1 };
    let bestMaster = null;
    let bestAudio = null;
    for (const [id, info] of this.clientMeta.entries()) {
      const mw = masterWeight[info.role] || 1;
      if (!bestMaster || mw > bestMaster.w || (mw === bestMaster.w && info.seq > bestMaster.seq)) {
        bestMaster = { id, w: mw, seq: info.seq };
      }
      // 2. Chọn DUY NHẤT 1 cửa sổ được phép phát tiếng để không bao giờ bị phát chồng 2 giọng Cô Giáo / 2 bộ trống
      if (info.role !== 'muted') {
        const aw = masterWeight[info.role] || 1;
        if (!bestAudio || aw > bestAudio.w || (aw === bestAudio.w && info.seq > bestAudio.seq)) {
          bestAudio = { id, w: aw, seq: info.seq };
        }
      }
    }
    this.masterId = bestMaster ? bestMaster.id : '';
    this.audioId = bestAudio ? bestAudio.id : '';
    for (const [id, info] of this.clientMeta.entries()) {
      const isMaster = id === this.masterId;
      const hasAudio = id === this.audioId;
      info.socket.emit('audioGrant', hasAudio);
      info.socket.emit('lopMaster', { master: isMaster, sync: isMaster ? null : this.lastLopSync });
    }
  }

  emitClients() {
    if (!this.onClients) return;
    let nonPreview = 0;
    let bestVp = null;
    for (const info of this.clientMeta.values()) {
      if (info.role === 'live' || info.role === 'output') {
        nonPreview += 1;
        if (info.viewport?.width && (!bestVp || (info.role === 'live' && bestVp.role !== 'live') || info.seq > bestVp.seq)) {
          bestVp = { ...info.viewport, role: info.role, seq: info.seq };
        }
      }
    }
    const cleanVp = bestVp ? { width: bestVp.width, height: bestVp.height, dpr: bestVp.dpr, role: bestVp.role } : null;
    // Trả về tổng số client đang kết nối kèm kích thước thực tế của nguồn phát
    this.onClients(this.io ? this.io.engine.clientsCount : nonPreview, cleanVp);
  }

  broadcast(event, payload) {
    if (this.io) this.io.emit(event, payload);
  }

  async stop() {
    if (!this.server) return;
    const server = this.server;
    this.io.close();
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    this.server = null;
    this.io = null;
    await new Promise((r) => server.close(() => r()));
  }
}

module.exports = { OverlayServer };
