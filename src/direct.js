'use strict';
/*
 * KẾT NỐI TRỰC TIẾP — không qua máy chủ trung gian.
 *
 * App mở trang live TikTok trong một cửa sổ trình duyệt ẩn (Chromium có sẵn trong Electron).
 * Chính trang TikTok tự kết nối tới máy chủ TikTok như khi bạn xem live trên web.
 * App đọc đồng thời các luồng dữ liệu chuẩn của TikTok Webcast (qua DevTools Protocol):
 *   1) API vào phòng `/webcast/room/enter/` & `/webcast/room/check_alive/` (biết ngay phòng đang LIVE, kể cả khi 0 người xem, hoặc biết chính xác lý do kết thúc / giới hạn 18+ / riêng tư)
 *   2) Khung WebSocket `/webcast/` (`PushFrame` protobuf: `im_enter_room_resp`, `msg`, `hb`, `ack`)
 *   3) Gói HTTP polling `/webcast/im/fetch/` (`WebcastResponse` protobuf)
 *   4) Bộ đọc DOM dự phòng nếu TikTok đổi giao thức
 * => Dữ liệu chỉ đi giữa máy bạn và TikTok, không gửi tới bên thứ ba.
 */
const { EventEmitter } = require('events');
const zlib = require('zlib');
const { BrowserWindow, session } = require('electron');

const PARTITION = 'persist:tiktok';
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const CHROME_UA_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const UA = process.platform === 'win32' ? CHROME_UA_WIN : CHROME_UA;

// Giải mã protobuf bằng tiktok-live-connector 2.0.0 (giấy phép MIT)
const { deserializeWebSocketMessage, deserializeMessage } = require('tiktok-live-connector');

let sessionReady = false;
function tiktokSession() {
  const ses = session.fromPartition(PARTITION);
  if (!sessionReady) {
    sessionReady = true;
    ses.setUserAgent(UA, 'vi-VN,vi,en-US,en');
    // Chặn tải luồng video nặng (.flv/.ts/.m4s/pull-*) để tiết kiệm băng thông & CPU
    ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, cb) => {
      const u = details.url;
      const isStream = details.resourceType === 'media' || /\.(flv|ts|m4s)(\?|$)/i.test(u) || /\/\/pull-[^/]*\.(tiktokcdn|tiktokv|ttlivecdn)/i.test(u);
      cb({ cancel: isStream });
    });
  }
  return ses;
}

const TYPE_MAP = {
  WebcastChatMessage: 'chat',
  WebcastGiftMessage: 'gift',
  WebcastLikeMessage: 'like',
  WebcastMemberMessage: 'member',
  WebcastRoomUserSeqMessage: 'roomUser',
  WebcastEmoteChatMessage: 'emote'
};

class DirectConnection extends EventEmitter {
  constructor(uniqueId) {
    super();
    this.uniqueId = uniqueId;
    this.win = null;
    this.wsIds = new Set();
    this.trackedHttp = new Map(); // requestId -> 'fetch' | 'enter' | 'alive'
    this.roomId = '';
    this.roomInfo = null;
    this.roomLiveConfirmed = false;
    this.closed = false;
    this.seen = new Set();     // chống trùng msgId
    this.domSeen = new Set();  // chống trùng DOM fallback
    this.decodedCount = 0;     // số gói webcast hợp lệ đã nhận
    this.domTimer = null;
    this.confirmTimer = null;
  }

  connect(timeoutMs = 35000) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let loadFinishedAt = 0;
      const done = (err, val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearTimeout(this.confirmTimer);
        clearInterval(probe);
        if (err) { this.destroy(); reject(err); } else resolve(val);
      };

      const markLiveNow = () => {
        done(null, { roomId: this.roomId, roomInfo: this.roomInfo, isConnected: true });
      };

      const win = new BrowserWindow({
        show: false,
        width: 1280,
        height: 800,
        webPreferences: { partition: PARTITION, session: tiktokSession(), backgroundThrottling: false, contextIsolation: true, sandbox: true }
      });
      this.win = win;
      win.webContents.setAudioMuted(true);
      win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

      const dbg = win.webContents.debugger;
      try { dbg.attach('1.3'); } catch (e) { return done(new Error('Không gắn được bộ đọc dữ liệu: ' + e.message)); }
      dbg.sendCommand('Network.enable', {
        maxTotalBufferSize: 16 * 1024 * 1024,
        maxResourceBufferSize: 4 * 1024 * 1024,
        maxPostDataSize: 65536
      }).catch(() => {});
      dbg.sendCommand('Runtime.enable').catch(() => {});

      dbg.on('message', (_e, method, params) => {
        if (this.closed) return;

        // 1. Luồng WebSocket của TikTok Webcast (chỉ bắt socket /webcast/, bỏ qua im-ws-sg tin nhắn riêng)
        if (method === 'Network.webSocketCreated') {
          const u = String(params.url || '');
          if (/webcast/i.test(u) && !/127\.0\.0\.1|localhost/i.test(u)) {
            this.wsIds.add(params.requestId);
            const m = /[?&]room_id=(\d+)/.exec(u);
            if (m) this.roomId = m[1];
          }
        } else if (method === 'Network.webSocketHandshakeResponseReceived' && this.wsIds.has(params.requestId)) {
          if (params.response?.status === 101 && (this.roomId || this.roomLiveConfirmed)) {
            this.decodedCount += 1;
            markLiveNow();
          }
        } else if (method === 'Network.webSocketFrameReceived' && this.wsIds.has(params.requestId)) {
          const r = params.response;
          if (!r || r.opcode !== 2 || !r.payloadData) return;
          this.handleFrame(Buffer.from(r.payloadData, 'base64')).then((ok) => {
            if (ok) markLiveNow();
          }).catch(() => {});
        } else if (method === 'Network.webSocketClosed' && this.wsIds.has(params.requestId)) {
          this.wsIds.delete(params.requestId);
          const prevDecoded = this.decodedCount;
          setTimeout(() => {
            if (!this.closed && settled && this.wsIds.size === 0 && this.decodedCount === prevDecoded) {
              this.emit('disconnected', { reason: 'socket closed' });
            }
          }, 25000);
        }

        // 2. Luồng HTTP `/webcast/room/enter/`, `/webcast/room/check_alive/` & `/webcast/im/fetch/`
        else if (method === 'Network.responseReceived') {
          const u = String(params.response?.url || '');
          const status = Number(params.response?.status || 0);
          const m = /[?&]room_id=(\d+)/.exec(u);
          if (m && !this.roomId) this.roomId = m[1];
          if (status !== 200) return;

          let kind = '';
          if (/\/webcast\/im\/fetch/i.test(u)) kind = 'fetch';
          else if (/\/webcast\/room\/enter/i.test(u)) kind = 'enter';
          else if (/\/webcast\/room\/check_alive/i.test(u)) kind = 'alive';
          if (kind) {
            this.trackedHttp.set(params.requestId, kind);
            if (this.trackedHttp.size > 160) {
              const first = this.trackedHttp.keys().next().value;
              this.trackedHttp.delete(first);
            }
          }
        } else if (method === 'Network.loadingFinished' && this.trackedHttp.has(params.requestId)) {
          const kind = this.trackedHttp.get(params.requestId);
          this.trackedHttp.delete(params.requestId);
          dbg.sendCommand('Network.getResponseBody', { requestId: params.requestId }).then((res) => {
            if (!res || !res.body || this.closed) return;
            const raw = res.base64Encoded ? Buffer.from(res.body, 'base64') : Buffer.from(res.body, 'utf8');
            if (kind === 'fetch') {
              if (this.handleFetchPayload(raw)) markLiveNow();
            } else if (kind === 'enter') {
              this.handleRoomEnterJson(raw, done, markLiveNow);
            } else if (kind === 'alive') {
              this.handleCheckAliveJson(raw, done);
            }
          }).catch(() => {});
        }

        // 3. Kênh dự phòng DOM (chỉ bật nếu sau 8s tải trang chưa nhận được gói protobuf nào)
        else if (method === 'Runtime.consoleAPICalled' && params.type === 'debug') {
          const arg0 = params.args?.[0]?.value;
          if (typeof arg0 === 'string' && arg0.startsWith('__SL_DOM__:')) {
            this.handleDomFallback(arg0.slice(11), (val) => done(null, val));
          }
        }
      });
      dbg.on('detach', () => { if (!this.closed && settled) this.emit('disconnected', { reason: 'detached' }); });

      win.webContents.on('render-process-gone', () => {
        if (!settled) done(new Error('Trình duyệt ẩn bị dừng đột ngột'));
        else if (!this.closed) this.emit('disconnected', { reason: 'crashed' });
      });

      win.webContents.on('did-finish-load', () => {
        loadFinishedAt = Date.now();
        clearTimeout(this.domTimer);
        this.domTimer = setTimeout(() => {
          if (this.closed || win.isDestroyed() || this.decodedCount > 0) return;
          this.installDomFallback(win).catch(() => {});
        }, 8000);
      });

      // Kiểm tra trang dự phòng: kênh chưa từng live (bị điều hướng khỏi /live), không tồn tại hoặc gặp Captcha
      const probe = setInterval(async () => {
        if (settled || win.isDestroyed()) return;
        try {
          const st = await win.webContents.executeJavaScript(`(() => {
            const t = document.body ? document.body.innerText : '';
            return {
              href: location.href,
              pathname: location.pathname,
              offline: /LIVE has ended|Phiên LIVE (này )?đã kết thúc|Buổi LIVE đã kết thúc|hiện không (còn )?phát trực tiếp|is not (currently )?LIVE/i.test(t),
              captcha: !!document.querySelector('#captcha-verify-container, .captcha_verify_container, tiktok-verify-ele, .secsdk-captcha-wrapper, [id*="captcha-verify"]'),
              notFound: /Couldn't find this account|Không thể tìm thấy tài khoản này/i.test(t)
            };
          })()`);
          if (st.notFound) {
            done(new Error(`Không tìm thấy kênh @${this.uniqueId}. Kiểm tra lại username.`));
          } else if (st.captcha) {
            done(new Error('TikTok yêu cầu xác minh Captcha. Bấm "🔑 Đăng nhập TikTok" để xác minh 1 lần rồi kết nối lại.'));
          } else if (!this.roomLiveConfirmed && st.offline) {
            done(Object.assign(new Error(`Kênh @${this.uniqueId} hiện không phát LIVE công khai (hoặc chỉ đang bật Phát thử). Hãy bật LIVE công khai trước rồi kết nối lại.`), { offline: true }));
          } else if (!this.roomLiveConfirmed && loadFinishedAt && Date.now() - loadFinishedAt > 6000 && st.pathname && !/\/live\/?$/i.test(st.pathname) && !/login|verify/i.test(st.pathname)) {
            done(Object.assign(new Error(`Kênh @${this.uniqueId} hiện không phát LIVE. Hãy bật LIVE trước rồi kết nối lại.`), { offline: true }));
          }
        } catch { /* trang đang tải */ }
      }, 3000);

      const timer = setTimeout(() => done(new Error('Không nhận được dữ liệu live sau 35 giây. Kiểm tra kênh đã bấm Phát LIVE công khai chưa, hoặc bấm "🔑 Đăng nhập TikTok" rồi thử lại.')), timeoutMs);

      win.webContents.on('did-fail-load', (_e, code, _desc, _url, isMain) => {
        if (isMain && [-105, -106, -109, -118, -137].includes(code)) done(new Error('Lỗi mạng: không kết nối được tới TikTok. Kiểm tra Internet.'));
      });
      win.loadURL(`https://www.tiktok.com/@${encodeURIComponent(this.uniqueId)}/live`).catch(() => {});
    });
  }

  handleRoomEnterJson(rawBuf, done, markLiveNow) {
    let j;
    try { j = JSON.parse(rawBuf.toString('utf8')); } catch { return; }
    if (!j || typeof j !== 'object') return;
    const code = Number(j.status_code || 0);
    const data = j.data || {};
    const msg = `${data.prompts || ''} ${data.message || ''} ${j?.extra?.finished_perception_msg || ''}`.trim();

    if (code === 0 && data) {
      const rid = String(data.id_str || data.id || '');
      if (rid && rid !== '0') this.roomId = rid;
      if (data.status === 4) {
        done(Object.assign(new Error(`Phiên LIVE của @${this.uniqueId} vừa kết thúc. Hãy bật LIVE mới rồi kết nối lại.`), { offline: true }));
        return;
      }
      if (data.age_restricted?.restricted) {
        done(new Error(`Phiên LIVE của @${this.uniqueId} giới hạn độ tuổi (18+). Bấm "🔑 Đăng nhập TikTok" bằng tài khoản trên 18 tuổi rồi kết nối lại.`));
        return;
      }
      if (data.status === 2 || rid) {
        this.roomLiveConfirmed = true;
        this.roomInfo = { data };
        // Phòng mới mở (0 người xem, 0 bình luận) có thể chưa phát gói msg ngay: xác nhận LIVE sau tối đa 2.5s nếu chưa có gói WS/fetch đến trước
        clearTimeout(this.confirmTimer);
        this.confirmTimer = setTimeout(() => {
          if (!this.closed) markLiveNow();
        }, 2500);
      }
      return;
    }

    if (code === 30003 || /room has finished|kết thúc/i.test(msg)) {
      done(Object.assign(new Error(`Kênh @${this.uniqueId} hiện không phát LIVE (phiên trước đã kết thúc, hoặc bạn đang ở chế độ Phát thử trên LIVE Studio). Hãy bấm Phát LIVE công khai rồi kết nối lại.`), { offline: true }));
      return;
    }

    if (code === 4003110 || code === 30001 || code === 10038 || /18\+|age|login|đăng nhập|riêng tư|bạn bè|private/i.test(msg)) {
      done(new Error(`Phiên LIVE của @${this.uniqueId} yêu cầu đăng nhập (18+ hoặc giới hạn người xem). Bấm "🔑 Đăng nhập TikTok" rồi kết nối lại.`));
    }
  }

  handleCheckAliveJson(rawBuf, done) {
    let j;
    try { j = JSON.parse(rawBuf.toString('utf8')); } catch { return; }
    const item = Array.isArray(j?.data) ? j.data[0] : null;
    if (!item) return;
    const rid = String(item.room_id_str || item.room_id || '');
    if (rid && rid !== '0' && !this.roomId) this.roomId = rid;
    if (item.alive === false) {
      if (!this.roomLiveConfirmed) {
        done(Object.assign(new Error(`Kênh @${this.uniqueId} hiện không phát LIVE (phiên trước đã kết thúc). Hãy bật LIVE công khai trước rồi kết nối lại.`), { offline: true }));
      } else {
        this.emit('streamEnd', { action: 3 });
      }
    }
  }

  rememberId(id) {
    if (!id) return true;
    if (this.seen.has(id)) return false;
    this.seen.add(id);
    if (this.seen.size > 5000) this.seen = new Set([...this.seen].slice(-2000));
    return true;
  }

  processMessages(msgs) {
    if (!Array.isArray(msgs)) return 0;
    let count = 0;
    for (const m of msgs) {
      if (!m || !m.decodedData) continue;
      count += 1;
      const d = { type: m.type, data: m.decodedData };
      const id = String(d.data?.event?.msgId || d.data?.common?.msgId || '');
      if (id && !this.rememberId(id)) continue;
      const data = d.data;
      if (d.type === 'WebcastSocialMessage') {
        const key = String(data?.event?.eventDetails?.displayType || data?.common?.displayText?.key || '').toLowerCase();
        this.emit(key.includes('follow') ? 'follow' : key.includes('share') ? 'share' : 'social', data);
      } else if (d.type === 'WebcastControlMessage') {
        if (data?.action === 3 || data?.action === 4) this.emit('streamEnd', { action: data.action });
      } else if (TYPE_MAP[d.type]) {
        this.emit(TYPE_MAP[d.type], data);
      }
    }
    return count;
  }

  handleFetchPayload(rawBuf) {
    if (!rawBuf || !rawBuf.length) return false;
    let buf = rawBuf;
    try {
      if (buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
        buf = zlib.gunzipSync(buf);
      }
      // Bỏ qua nếu phản hồi là JSON lỗi thay vì protobuf WebcastResponse
      if (buf[0] === 0x7b) return false;
      const resp = deserializeMessage('WebcastResponse', buf);
      if (!resp || (!resp.Cursor && !resp.cursor && !(resp.messages && resp.messages.length) && !this.roomLiveConfirmed)) {
        return false;
      }
      this.decodedCount += 1;
      this.processMessages(resp.messages || []);
      return true;
    } catch {
      return false;
    }
  }

  async handleFrame(buf) {
    let frame;
    try {
      frame = await deserializeWebSocketMessage(buf);
    } catch {
      return false;
    }
    if (!frame) return false;
    if (frame.type === 'msg' && frame.webcastResponse) {
      this.decodedCount += 1;
      this.processMessages(frame.webcastResponse.messages || []);
      return true;
    }
    if ((frame.type === 'im_enter_room_resp' || frame.type === 'hb' || frame.type === 'ack') && (this.roomId || this.roomLiveConfirmed)) {
      this.decodedCount += 1;
      return true;
    }
    return false;
  }

  handleDomFallback(jsonStr, onLive) {
    if (this.decodedCount > 0) return; // Đã có protobuf chuẩn thì bỏ qua DOM tránh trùng
    try {
      const ev = JSON.parse(jsonStr);
      if (!ev || !ev.kind) return;
      const sig = `${ev.kind}|${ev.nick}|${ev.text || ''}`;
      if (this.domSeen.has(sig)) return;
      this.domSeen.add(sig);
      if (this.domSeen.size > 1500) this.domSeen = new Set([...this.domSeen].slice(-600));
      onLive?.({ roomId: this.roomId, roomInfo: this.roomInfo, isConnected: true });
      const user = {
        id: 'dom_' + String(ev.nick || 'user').toLowerCase().replace(/\s+/g, '_'),
        displayId: '',
        nickname: String(ev.nick || 'Người xem').trim(),
        profilePictureUrl: ev.avatar || ''
      };
      if (ev.kind === 'chat' && ev.text) {
        this.emit('chat', { user, content: String(ev.text).trim(), common: { createTime: Date.now() } });
      } else if (ev.kind === 'join') {
        this.emit('member', { user });
      }
    } catch { /* ignore */ }
  }

  async installDomFallback(win) {
    if (!win || win.isDestroyed()) return;
    await win.webContents.executeJavaScript(`(() => {
      if (window.__slDomInstalled) return;
      window.__slDomInstalled = true;
      const seenNodes = new WeakSet();
      const scan = (root) => {
        if (!root || !root.querySelectorAll) return;
        const chats = root.querySelectorAll('[data-e2e="chat-message"]');
        chats.forEach((node) => {
          if (seenNodes.has(node)) return;
          seenNodes.add(node);
          const nickEl = node.querySelector('[data-e2e="message-owner-name"]');
          const imgEl = node.querySelector('img');
          const nick = (nickEl ? nickEl.textContent : '').trim();
          let text = '';
          const spans = node.querySelectorAll('span, div');
          for (let i = spans.length - 1; i >= 0; i--) {
            const s = spans[i];
            if (nickEl && (s === nickEl || nickEl.contains(s) || s.contains(nickEl))) continue;
            if (s.children.length === 0 && s.textContent.trim()) { text = s.textContent.trim(); break; }
          }
          if (nick && text) console.debug('__SL_DOM__:' + JSON.stringify({ kind: 'chat', nick, text, avatar: imgEl ? imgEl.src : '' }));
        });
        const socials = root.querySelectorAll('[data-e2e="social-message"], [data-e2e="enter-message"]');
        socials.forEach((node) => {
          if (seenNodes.has(node)) return;
          seenNodes.add(node);
          const raw = (node.textContent || '').trim();
          const nickEl = node.querySelector('[data-e2e="message-owner-name"]') || node.querySelector('span');
          const nick = (nickEl ? nickEl.textContent : raw.split(/\\s+joined|\\s+đã tham gia/i)[0] || '').trim();
          if (nick && /joined|tham gia|bước vào/i.test(raw)) {
            const imgEl = node.querySelector('img');
            console.debug('__SL_DOM__:' + JSON.stringify({ kind: 'join', nick, avatar: imgEl ? imgEl.src : '' }));
          }
        });
      };
      const obs = new MutationObserver((muts) => {
        for (const m of muts) m.addedNodes.forEach((n) => scan(n.nodeType === 1 ? n : n.parentElement));
      });
      if (document.body) {
        scan(document.body);
        obs.observe(document.body, { childList: true, subtree: true });
      }
    })()`);
  }

  destroy() {
    this.closed = true;
    clearTimeout(this.domTimer);
    clearTimeout(this.confirmTimer);
    const w = this.win;
    this.win = null;
    if (w && !w.isDestroyed()) {
      try { w.webContents.debugger.detach(); } catch { /* đã tách */ }
      w.destroy();
    }
  }

  async disconnect() {
    this.destroy();
  }
}

// Cửa sổ đăng nhập TikTok (dùng chung phiên với kết nối trực tiếp)
function openLoginWindow(parent) {
  const win = new BrowserWindow({
    width: 480, height: 760, parent, title: 'Đăng nhập TikTok',
    webPreferences: { partition: PARTITION, session: tiktokSession(), contextIsolation: true, sandbox: true }
  });
  win.setMenuBarVisibility(false);
  win.loadURL('https://www.tiktok.com/login');
  return win;
}

async function logoutTikTok() {
  await tiktokSession().clearStorageData();
}

module.exports = { DirectConnection, openLoginWindow, logoutTikTok };
