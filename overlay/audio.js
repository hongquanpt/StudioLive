/*
 * BỘ ÂM THANH OVERLAY — tự tổng hợp bằng WebAudio, không cần file.
 * Mọi tiếng đi qua: bus chính -> vang phòng (reverb) -> nén (compressor) -> loa.
 * Tách biệt hoàn toàn bus nhạc nền Nhà Ma (ambGain) và bus âm tịnh tâm Chánh Điện (templeGain).
 */
(() => {
  'use strict';

  let getCfg = () => ({ sound: true, volume: 0.7, ambient: true, ambientVolume: 0.5 });
  let muted = false;
  let paused = false;
  let ducked = false;
  let ac = null;
  let master, dry, wet, comp, ambGain, templeGain, barGain, lopGain;
  const lastPlay = {};

  const rnd = (a, b) => a + Math.random() * (b - a);

  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      comp.connect(ac.destination);
      master = ac.createGain();
      master.connect(comp);
      dry = ac.createGain();
      dry.gain.value = 0.85;
      dry.connect(master);
      const conv = ac.createConvolver();
      conv.buffer = impulse(3.2, 2.6);
      wet = ac.createGain();
      wet.gain.value = 0.45;
      wet.connect(conv).connect(master);
      ambGain = ac.createGain();
      ambGain.gain.value = 0;
      ambGain.connect(comp);
      templeGain = ac.createGain();
      templeGain.gain.value = 0;
      templeGain.connect(comp);
      barGain = ac.createGain();
      barGain.gain.value = 0;
      barGain.connect(comp);
      lopGain = ac.createGain();
      lopGain.gain.value = 0;
      lopGain.connect(comp);
      applyVolume();
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }

  // Tiếng vang phòng trống, tạo bằng nhiễu tắt dần
  function impulse(seconds, decay) {
    const len = Math.floor(ac.sampleRate * seconds);
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  let noiseBuf = null;
  function noiseBuffer() {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  function applyVolume() {
    if (!ac) return;
    const c = getCfg();
    const on = c.sound && !muted && !paused;
    master.gain.setTargetAtTime(on ? c.volume : 0, ac.currentTime, 0.05);
    // Hạ nhỏ tiếng hiệu ứng (dry/wet) khi Cô Giáo / MC đang đọc để giọng nói luôn rõ nét, không chèn lấn
    dry.gain.setTargetAtTime(ducked ? 0.22 : 0.85, ac.currentTime, 0.04);
    wet.gain.setTargetAtTime(ducked ? 0.08 : 0.45, ac.currentTime, 0.04);

    // Nhạc nền Nhà Ma: chỉ bật khi ở chế độ game/cards, tắt tức thì khi sang Chùa hoặc Rạp
    const isHaunt = c.mode === 'game' || c.mode === 'cards';
    const hauntOn = on && isHaunt && c.ambient && !c.customAmbient;
    ambGain.gain.setTargetAtTime(hauntOn ? c.volume * c.ambientVolume * 0.6 * (ducked ? 0.35 : 1) : 0, ac.currentTime, isHaunt ? 0.4 : 0.03);

    // Âm nền Chánh Điện: chỉ bật khi người dùng chủ động chọn 'bell' hoặc 'chant'
    const sc = c.chuaSoundscape || 'off';
    const templeOn = on && c.mode === 'chua' && (sc === 'bell' || sc === 'chant');
    const tv = (c.volume ?? 0.7) * (c.chuaMusicVolume ?? 0.35) * (ducked ? 0.25 : 1);
    templeGain.gain.setTargetAtTime(templeOn ? tv : 0, ac.currentTime, c.mode === 'chua' ? 0.25 : 0.03);

    // Beat nền Đi Bar Online: chỉ bật khi ở chế độ 'bar' và chọn 'house' hoặc 'chill', tắt tức thì khi đổi cảnh
    const bs = c.barSoundscape || 'house';
    const barOn = on && c.mode === 'bar' && (bs === 'house' || bs === 'chill');
    const bv = (c.volume ?? 0.7) * (c.barMusicVolume ?? 0.45) * (ducked ? 0.28 : 1);
    barGain.gain.setTargetAtTime(barOn ? bv : 0, ac.currentTime, c.mode === 'bar' ? 0.25 : 0.03);

    // Giai điệu Lớp Học Chữ: mặc định 'off', chỉ bật khi người dùng chủ động chọn 'melody' hoặc 'lofi'
    const ls = c.lopSoundscape || 'off';
    const lopOn = on && c.mode === 'lop' && (ls === 'melody' || ls === 'lofi');
    const lv = (c.volume ?? 0.7) * (c.lopMusicVolume ?? 0.25) * (ducked ? 0.18 : 1);
    lopGain.gain.setTargetAtTime(lopOn ? lv : 0, ac.currentTime, c.mode === 'lop' ? 0.25 : 0.03);
  }

  // ---------- Khối dựng âm ----------
  function out(reverb = 0.5) {
    const g = ac.createGain();
    const d = ac.createGain();
    const w = ac.createGain();
    d.gain.value = 1 - reverb * 0.5;
    w.gain.value = reverb;
    g.connect(d).connect(dry);
    g.connect(w).connect(wet);
    return g;
  }

  function env(g, t, a, peak, hold, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.setValueAtTime(Math.max(0.0002, peak), t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
  }

  function osc(type, f, t, dur, peak, dest, opt = {}) {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t + (opt.glide || dur));
    if (opt.detune) o.detune.value = opt.detune;
    const g = ac.createGain();
    env(g, t, opt.a ?? 0.01, peak, opt.hold ?? 0, opt.rel ?? dur);
    let node = o;
    if (opt.vib) {
      const l = ac.createOscillator();
      const lg = ac.createGain();
      l.frequency.value = opt.vib;
      lg.gain.value = opt.vibDepth || f * 0.03;
      l.connect(lg).connect(o.frequency);
      l.start(t);
      l.stop(t + dur + 0.5);
    }
    if (opt.filter) {
      const f2 = ac.createBiquadFilter();
      f2.type = opt.filter.type || 'lowpass';
      f2.frequency.value = opt.filter.f;
      f2.Q.value = opt.filter.q || 1;
      node.connect(f2);
      node = f2;
    }
    node.connect(g).connect(dest);
    o.start(t);
    o.stop(t + (opt.a ?? 0.01) + (opt.hold ?? 0) + (opt.rel ?? dur) + 0.1);
    return o;
  }

  function noise(t, dur, peak, dest, f = {}) {
    const s = ac.createBufferSource();
    s.buffer = noiseBuffer();
    s.loop = true;
    const fl = ac.createBiquadFilter();
    fl.type = f.type || 'bandpass';
    fl.frequency.setValueAtTime(f.f || 1000, t);
    if (f.to) fl.frequency.exponentialRampToValueAtTime(f.to, t + dur);
    fl.Q.value = f.q || 1;
    const g = ac.createGain();
    env(g, t, f.a ?? 0.01, peak, f.hold ?? 0, f.rel ?? dur);
    s.connect(fl).connect(g).connect(dest);
    s.start(t, Math.random() * 2);
    s.stop(t + (f.a ?? 0.01) + (f.hold ?? 0) + (f.rel ?? dur) + 0.1);
  }

  // Giọng người (tiếng thét/khóc/cười) = nguồn răng cưa qua các bộ lọc formant nguyên âm
  const VOWELS = { a: [800, 1150, 2900], o: [450, 800, 2830], e: [400, 1700, 2600], i: [300, 2200, 3000], u: [325, 700, 2530] };
  function voice(t, dur, f0, toF, vowel, peak, dest, opt = {}) {
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t);
    if (toF) o.frequency.exponentialRampToValueAtTime(toF, t + dur);
    const l = ac.createOscillator();
    const lg = ac.createGain();
    l.frequency.value = opt.vib || 6;
    lg.gain.value = f0 * (opt.vibDepth || 0.025);
    l.connect(lg).connect(o.frequency);
    const g = ac.createGain();
    env(g, t, opt.a ?? 0.03, peak, opt.hold ?? dur * 0.6, opt.rel ?? dur * 0.4);
    const sum = ac.createGain();
    VOWELS[vowel].forEach((fr, i) => {
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = fr;
      bp.Q.value = 6 + i * 2;
      const bg = ac.createGain();
      bg.gain.value = [1, 0.6, 0.25][i] * 3;
      o.connect(bp).connect(bg).connect(sum);
    });
    if (opt.breath) noise(t, dur, peak * opt.breath, g, { f: VOWELS[vowel][1], q: 2 });
    sum.connect(g).connect(dest);
    o.start(t); l.start(t);
    const end = t + (opt.a ?? 0.03) + (opt.hold ?? dur * 0.6) + (opt.rel ?? dur * 0.4) + 0.1;
    o.stop(end); l.stop(end);
  }

  // Đánh một tiếng mõ gỗ vào đích bất kỳ (dùng chung cho hiệu ứng & nhịp tụng)
  function strikeMo(t, dest, gain = 1) {
    osc('sine', 342, t, 0.15, 0.48 * gain, dest, { to: 296, glide: 0.07, a: 0.002, rel: 0.15 });
    osc('triangle', 522, t, 0.08, 0.18 * gain, dest, { to: 478, glide: 0.05, a: 0.002, rel: 0.08 });
    osc('sine', 890, t, 0.035, 0.07 * gain, dest, { a: 0.001, rel: 0.035 });
    noise(t, 0.026, 0.22 * gain, dest, { f: 1180, q: 3.6, a: 0.001, rel: 0.026 });
  }

  // Đánh một tiếng khánh / chuông gia trì thanh nhẹ vào đích bất kỳ
  function strikeKhanh(t, dest, gain = 1) {
    [[528, 0.28, 2.8], [1057.5, 0.13, 2.1], [1586, 0.06, 1.5], [2368, 0.025, 0.9]].forEach(([f, v, rel]) => {
      osc('sine', f, t, rel, v * gain, dest, { a: 0.005, rel, detune: rnd(-4, 4) });
    });
    noise(t, 0.018, 0.06 * gain, dest, { f: 2600, q: 4, a: 0.001, rel: 0.018 });
  }

  // ---------- Thư viện tiếng ----------
  const S = {
    // Tiếng thét: 4 kiểu khác nhau, chọn ngẫu nhiên
    scream(k = 1) {
      const t = ac.currentTime, d = out(0.55);
      const kind = Math.floor(Math.random() * 4);
      if (kind === 0) { // nữ thét chói
        voice(t, 1.1, 900, 1250, 'a', 0.5 * k, d, { vib: 9, vibDepth: 0.04, breath: 0.4 });
        voice(t + 0.02, 1.0, 1300, 1500, 'e', 0.25 * k, d, { vib: 11, breath: 0.3 });
      } else if (kind === 1) { // nam la hoảng
        voice(t, 0.8, 260, 420, 'a', 0.55 * k, d, { vib: 7, breath: 0.5 });
        voice(t + 0.75, 0.5, 380, 300, 'o', 0.35 * k, d, { vib: 7 });
      } else if (kind === 2) { // trẻ con hét "Áaa"
        voice(t, 0.9, 700, 1000, 'a', 0.45 * k, d, { vib: 10, vibDepth: 0.05 });
      } else { // tiếng rú đứt quãng
        [0, 0.22, 0.44].forEach((o, i) => voice(t + o, 0.2, 800 + i * 120, 950 + i * 120, 'e', 0.4 * k, d, { a: 0.01, hold: 0.08, rel: 0.1, breath: 0.4 }));
      }
    },
    boo() { // ma "hùuuu"
      const t = ac.currentTime, d = out(0.8);
      voice(t, 1.3, 180, 120, 'u', 0.5, d, { vib: 4, vibDepth: 0.06, breath: 0.7, a: 0.15 });
      noise(t, 1.3, 0.12, d, { f: 400, to: 200, q: 1.5, a: 0.2 });
    },
    whoosh() { const t = ac.currentTime; noise(t, 0.6, 0.25, out(0.4), { f: 300, to: 2400, q: 1.2, a: 0.15 }); },
    creak() { // cửa gỗ kẽo kẹt
      const t = ac.currentTime, d = out(0.5);
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      const base = rnd(70, 110);
      for (let i = 0; i <= 24; i++) o.frequency.setValueAtTime(base * (1 + Math.sin(i * 1.3) * 0.25 + Math.random() * 0.25), t + i * 0.045);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 4;
      const g = ac.createGain(); env(g, t, 0.05, 0.35, 0.9, 0.2);
      o.connect(bp).connect(g).connect(d); o.start(t); o.stop(t + 1.3);
    },
    footsteps(n = 4, gap = 0.32) {
      const t = ac.currentTime, d = out(0.45);
      for (let i = 0; i < n; i++) {
        const s = t + i * gap * rnd(0.9, 1.1);
        noise(s, 0.09, 0.5, d, { type: 'lowpass', f: 380, q: 1, rel: 0.09 });
        osc('sine', 80, s, 0.12, 0.35, d, { to: 45 });
      }
    },
    heartbeat(beats = 4, bpm = 95) {
      const t = ac.currentTime, d = out(0.15);
      for (let i = 0; i < beats; i++) {
        const s = t + i * 60 / bpm;
        osc('sine', 60, s, 0.15, 0.7, d, { to: 38 });
        osc('sine', 55, s + 0.16, 0.18, 0.5, d, { to: 34 });
      }
    },
    flashlight() { const t = ac.currentTime, d = out(0.2); noise(t, 0.03, 0.4, d, { f: 4000, q: 3 }); osc('square', 2000, t, 0.03, 0.08, d); },
    gong() { // chuông chùa (dùng chung)
      const t = ac.currentTime, d = out(0.7);
      [[110, 0.5], [220.5, 0.25], [331, 0.18], [442, 0.1], [587, 0.06]].forEach(([f, v]) => osc('sine', f, t, 4, v, d, { rel: 4, detune: rnd(-6, 6) }));
    },
    bellToll(times = 3) {
      const t = ac.currentTime, d = out(0.75);
      for (let i = 0; i < times; i++) [[196, 0.4], [392.5, 0.2], [588, 0.12], [940, 0.05]].forEach(([f, v]) => osc('sine', f, t + i * 1.2, 2.4, v, d, { rel: 2.4 }));
    },
    talisman() { const t = ac.currentTime; noise(t, 0.35, 0.3, out(0.3), { f: 1800, to: 600, q: 1 }); setTimeout(() => S.gong(), 380); },
    choir() { // dàn hợp xướng ma
      const t = ac.currentTime, d = out(0.9);
      [[220, 'o'], [261.6, 'a'], [311.1, 'u'], [370, 'o']].forEach(([f, v], i) => voice(t + i * 0.12, 2.6, f, f * 0.97, v, 0.16, d, { vib: 5, a: 0.6, breath: 0.6 }));
    },
    whisper() {
      const t = ac.currentTime, d = out(0.7);
      for (let i = 0; i < 5; i++) noise(t + i * 0.18, 0.25, 0.22, d, { f: rnd(1800, 4000), q: 6, a: 0.05 });
      voice(t, 1.2, 140, 110, 'i', 0.08, d, { breath: 2 });
    },
    powerDown() {
      const t = ac.currentTime, d = out(0.3);
      noise(t, 0.12, 0.6, d, { f: 3000, q: 1 });
      osc('sawtooth', 120, t, 1.2, 0.3, d, { to: 25, filter: { f: 600 } });
      osc('sine', 60, t, 1.4, 0.25, d, { to: 20 });
    },
    chime() { const t = ac.currentTime, d = out(0.6); [659.3, 784, 987.8, 1318.5].forEach((f, i) => osc('sine', f, t + i * 0.09, 1.2, 0.12, d)); },
    musicBox() { // hộp nhạc giọng thứ, hơi lệch tông cho rợn
      const t = ac.currentTime, d = out(0.6);
      const notes = [659.3, 587.3, 523.3, 493.9, 523.3, 440, 493.9, 415.3];
      notes.forEach((f, i) => { osc('triangle', f, t + i * 0.28, 0.9, 0.18, d, { detune: rnd(-25, 25) }); osc('sine', f * 2, t + i * 0.28, 0.5, 0.05, d); });
    },
    childLaugh() {
      const t = ac.currentTime, d = out(0.7);
      [0, 0.17, 0.34, 0.5, 0.66].forEach((o, i) => voice(t + o, 0.14, 520 - i * 25, 470 - i * 25, i % 2 ? 'i' : 'e', 0.32, d, { a: 0.01, hold: 0.05, rel: 0.09, vib: 12, breath: 0.6 }));
    },
    evilLaugh() {
      const t = ac.currentTime, d = out(0.6);
      [0, 0.24, 0.48, 0.72].forEach((o, i) => voice(t + o, 0.2, 140 - i * 6, 120 - i * 6, 'a', 0.4, d, { a: 0.01, hold: 0.08, rel: 0.12, breath: 0.5 }));
    },
    sob() {
      const t = ac.currentTime, d = out(0.7);
      [0, 0.45, 0.8, 1.35].forEach((o, i) => voice(t + o, 0.32, 420 + i * 10, 330, 'u', 0.28, d, { vib: 8, vibDepth: 0.05, breath: 0.6, a: 0.04 }));
    },
    wail() { const t = ac.currentTime; voice(t, 2.2, 500, 380, 'o', 0.35, out(0.9), { vib: 5, vibDepth: 0.07, breath: 0.5, a: 0.4 }); },
    growl() { // Bà Ma gầm gừ + xích sắt
      const t = ac.currentTime, d = out(0.5);
      voice(t, 2.2, 70, 55, 'o', 0.6, d, { vib: 22, vibDepth: 0.15, breath: 1 });
      osc('sawtooth', 48, t, 2.4, 0.3, d, { filter: { f: 300 }, vib: 30, vibDepth: 6 });
      for (let i = 0; i < 6; i++) { const s = t + 0.6 + i * 0.13; osc('square', rnd(2500, 4200), s, 0.06, 0.05, d); noise(s, 0.05, 0.15, d, { f: 5000, q: 4 }); }
    },
    thunder() {
      const t = ac.currentTime, d = out(0.6);
      noise(t, 0.25, 0.9, d, { type: 'lowpass', f: 3000, to: 400 });
      noise(t + 0.1, 2.8, 0.8, d, { type: 'lowpass', f: 220, to: 60, a: 0.2, q: 0.7 });
    },
    pop() { const t = ac.currentTime; osc('sine', 700, t, 0.15, 0.15, out(0.3), { to: 1100 }); },
    // ---- Chánh Điện (chuông đồng, khánh, mõ gỗ trầm ấm đúng chất chùa Việt) ----
    mo(n = 1) {
      const t = ac.currentTime, d = out(0.26);
      for (let i = 0; i < n; i++) strikeMo(t + i * 0.62, d, 1);
    },
    khanh(k = 1) {
      strikeKhanh(ac.currentTime, out(0.52), k);
    },
    templeBell(k = 1) { // Đại hồng chung trầm ấm, ngân dài trang nghiêm
      const t = ac.currentTime, d = out(0.66);
      noise(t, 0.05, 0.22 * k, d, { type: 'lowpass', f: 420, q: 1.2, a: 0.003, rel: 0.05 });
      [
        [130.81, 0.46, 5.0, 0],
        [131.35, 0.22, 4.6, 0],   // nhịp ngân đồng nhẹ
        [261.63, 0.24, 4.2, -3],
        [311.13, 0.15, 3.5, 4],
        [392.00, 0.12, 3.0, -2],
        [523.25, 0.07, 2.3, 3],
        [783.99, 0.035, 1.6, 0]
      ].forEach(([f, v, rel, det]) => osc('sine', f, t, rel, v * k, d, { a: 0.008, rel, detune: det }));
    },
    // ---- Đi Bar Online (DJ Airhorn, Bass Drop, Pháo Khói CO2, Cụng Ly, Laser) ----
    airhorn(k = 1) {
      const t = ac.currentTime, d = out(0.45);
      const pattern = [[0, 0.11], [0.14, 0.11], [0.28, 0.58]];
      pattern.forEach(([off, dur]) => {
        [466.16, 587.33, 698.46].forEach((f, idx) => {
          osc('sawtooth', f * 0.92, t + off, dur, (idx === 0 ? 0.2 : 0.13) * k, d, {
            to: f, glide: 0.035, a: 0.006, hold: dur * 0.68, rel: dur * 0.32,
            detune: idx * 7 - 7, filter: { f: 2800, q: 1.8 }
          });
        });
      });
    },
    bassDrop(k = 1) {
      const t = ac.currentTime, d = out(0.42);
      noise(t, 0.32, 0.32 * k, d, { f: 350, to: 3600, q: 1.8, a: 0.02, rel: 0.3 });
      osc('sine', 120, t + 0.28, 1.1, 0.82 * k, d, { to: 31, glide: 0.55, a: 0.004, rel: 1.05 });
      osc('sawtooth', 65.41, t + 0.28, 0.65, 0.26 * k, d, { to: 32.7, glide: 0.5, a: 0.005, rel: 0.62, filter: { f: 420, q: 2.2 } });
      [261.63, 311.13, 392.00, 523.25].forEach((f) => {
        osc('sawtooth', f, t + 0.29, 0.45, 0.09 * k, d, { a: 0.004, rel: 0.45, detune: rnd(-8, 8), filter: { f: 2200, q: 1.4 } });
      });
    },
    co2Jet(k = 1) {
      const t = ac.currentTime, d = out(0.35);
      noise(t, 0.72, 0.44 * k, d, { type: 'highpass', f: 1600, q: 0.8, a: 0.012, hold: 0.24, rel: 0.46 });
      noise(t, 0.55, 0.26 * k, d, { type: 'bandpass', f: 3400, to: 1800, q: 1.6, a: 0.008, rel: 0.52 });
    },
    cheers(k = 1) {
      const t = ac.currentTime, d = out(0.4);
      [[2280, 0.22, 0.55], [3120, 0.14, 0.42], [4180, 0.08, 0.28]].forEach(([f, v, rel]) => {
        osc('sine', f, t, rel, v * k, d, { a: 0.002, rel });
        osc('sine', f * 1.045, t + 0.13, rel * 0.9, v * 0.85 * k, d, { a: 0.002, rel: rel * 0.9 });
      });
      noise(t + 0.15, 0.35, 0.08 * k, d, { type: 'highpass', f: 3500, q: 0.7, a: 0.02, rel: 0.32 });
    },
    laserZap(k = 1) {
      const t = ac.currentTime, d = out(0.32);
      osc('sawtooth', 1550, t, 0.22, 0.2 * k, d, { to: 190, glide: 0.2, a: 0.003, rel: 0.22, filter: { f: 3200, q: 2.5 } });
      osc('sine', 920, t + 0.06, 0.18, 0.15 * k, d, { to: 260, glide: 0.16, a: 0.003, rel: 0.18 });
    },
    coinBurst(k = 1) {
      const t = ac.currentTime, d = out(0.45);
      [880, 1174.66, 1318.51, 1760].forEach((f, i) => {
        osc('triangle', f, t + i * 0.055, 0.36, 0.16 * k, d, { a: 0.003, rel: 0.35 });
        osc('sine', f * 2, t + i * 0.055, 0.22, 0.06 * k, d, { a: 0.002, rel: 0.22 });
      });
    },
    firework(k = 1) {
      const t = ac.currentTime, d = out(0.5);
      // Tiếng rít thăng thiên + cú nổ trầm ấm + tiếng pháo kim tuyến lách tách rực rỡ
      osc('sine', 520, t, 0.24, 0.14 * k, d, { to: 1850, glide: 0.22, a: 0.008, rel: 0.22 });
      osc('sine', 142, t + 0.2, 0.78, 0.78 * k, d, { to: 34, glide: 0.48, a: 0.003, rel: 0.74 });
      noise(t + 0.2, 0.58, 0.54 * k, d, { type: 'lowpass', f: 720, to: 150, q: 0.85, a: 0.004, rel: 0.55 });
      for (let i = 0; i < 10; i++) {
        const st = t + 0.31 + i * rnd(0.032, 0.068);
        noise(st, 0.038, rnd(0.14, 0.28) * k, d, { type: 'highpass', f: rnd(2600, 5600), q: 1.3, a: 0.001, rel: 0.036 });
      }
    },
    // ---- Rạp phim ----
    applause(level = 1) { // tiếng vỗ tay: nhiều cú vỗ ngẫu nhiên, càng đông càng dày
      const t = ac.currentTime, d = out(0.45);
      const dur = 1.6 + level * 0.8;
      const n = Math.floor(18 + level * 26);
      for (let i = 0; i < n; i++) {
        const s = t + Math.random() * dur * (0.6 + Math.random() * 0.4);
        noise(s, 0.035, rnd(0.12, 0.3), d, { f: rnd(1200, 3200), q: 1.4, a: 0.002, rel: 0.035 });
      }
    },
    crowdLaugh(level = 1) { // cả rạp cười "ha ha"
      const t = ac.currentTime, d = out(0.6);
      const voices = 2 + level * 2;
      for (let v = 0; v < voices; v++) {
        const f = rnd(170, 420), start = rnd(0, 0.4);
        for (let i = 0; i < 4; i++) voice(t + start + i * rnd(0.17, 0.22), 0.14, f * (1 - i * 0.03), f * 0.9, 'a', 0.16 / Math.sqrt(voices) * 2, d, { a: 0.01, hold: 0.05, rel: 0.08, breath: 0.7 });
      }
    },
    wow() { const t = ac.currentTime, d = out(0.5); voice(t, 0.7, 200, 320, 'o', 0.3, d, { a: 0.05, breath: 0.4 }); voice(t + 0.05, 0.6, 290, 420, 'o', 0.16, d, { a: 0.05 }); },
    crunch() { const t = ac.currentTime, d = out(0.2); for (let i = 0; i < 6; i++) noise(t + i * rnd(0.06, 0.11), 0.05, rnd(0.15, 0.3), d, { type: 'highpass', f: 2200, q: 0.7, a: 0.002, rel: 0.05 }); },
    jumpscare(face = '') { // tiếng hét lớn + đập + méo, khác nhau theo mặt ma
      const t = ac.currentTime, d = out(0.35);
      const shaper = ac.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 5); }
      shaper.curve = curve;
      shaper.connect(d);
      const pitch = { manu: 1.2, skull: 0.8, demon: 0.5, doll: 1.5, jiangshi: 0.9, stretch: 1 }[face] || 1;
      voice(t, 1.6, 700 * pitch, 900 * pitch, 'a', 0.9, shaper, { vib: 9, vibDepth: 0.05, breath: 0.6, a: 0.01 });
      voice(t, 1.6, 520 * pitch, 700 * pitch, 'e', 0.6, shaper, { vib: 13, breath: 0.4, a: 0.01 });
      noise(t, 0.4, 1, d, { f: 2500, q: 0.6 });
      osc('sine', 45, t, 1.6, 1, d, { to: 28 });
      osc('sawtooth', 90 * pitch, t, 1.4, 0.35, shaper, { to: 50 });
      if (face === 'doll') setTimeout(() => S.musicBox(), 1500);
      if (face === 'demon') setTimeout(() => S.growl(), 900);
    },
    // ---- Lớp Học Chữ (Chuông trường học, trả lời đúng, đoán sai, mở đáp án — gọn gàng, không ngân đè giọng Cô) ----
    schoolBell(k = 1) { // Chuông trường học 4 nốt gọn ~1.05s
      const t = ac.currentTime, d = out(0.32);
      [[440.00, 0], [349.23, 0.22], [392.00, 0.44], [261.63, 0.66]].forEach(([f, off], idx) => {
        const dur = idx === 3 ? 0.48 : 0.28;
        osc('sine', f, t + off, dur, 0.21 * k, d, { a: 0.005, rel: dur });
        osc('triangle', f * 2, t + off, dur * 0.55, 0.07 * k, d, { a: 0.004, rel: dur * 0.55 });
      });
    },
    correctDing(k = 1) { // Tiếng trả lời đúng gọn sáng (C6 -> G6)
      const t = ac.currentTime, d = out(0.24);
      [[1046.50, 0, 0.16], [1567.98, 0.065, 0.26]].forEach(([f, off, dur]) => {
        osc('sine', f, t + off, dur, 0.18 * k, d, { a: 0.004, rel: dur });
        osc('triangle', f * 2, t + off, dur * 0.5, 0.05 * k, d, { a: 0.003, rel: dur * 0.5 });
      });
    },
    wrongPop(k = 1) { // Tiếng gõ gỗ nhẹ khi đoán trật
      const t = ac.currentTime, d = out(0.12);
      osc('triangle', 320, t, 0.08, 0.12 * k, d, { to: 275, glide: 0.07, a: 0.003, rel: 0.08 });
      osc('sine', 240, t + 0.065, 0.09, 0.1 * k, d, { to: 205, glide: 0.08, a: 0.003, rel: 0.09 });
    },
    revealFanfare(k = 1) { // Hợp âm mở đáp án gọn 0.45s
      const t = ac.currentTime, d = out(0.28);
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        osc('triangle', f, t + i * 0.05, 0.34, 0.13 * k, d, { a: 0.005, rel: 0.32 });
        osc('sine', f * 2, t + i * 0.05, 0.22, 0.04 * k, d, { a: 0.004, rel: 0.2 });
      });
    },
    schoolDrum(k = 1) { // Tiếng trống trường Việt Nam: Tùng - Tùng - Tùng! (~0.9s)
      const t = ac.currentTime, d = out(0.28);
      [0, 0.26, 0.52].forEach((off, idx) => {
        const v = (idx === 2 ? 0.36 : 0.28) * k;
        const dur = idx === 2 ? 0.38 : 0.22;
        osc('sine', 132, t + off, dur, v, d, { to: 68, glide: 0.12, a: 0.004, rel: dur });
        osc('triangle', 196, t + off, dur * 0.55, v * 0.3, d, { to: 98, glide: 0.09, a: 0.003, rel: dur * 0.55 });
        noise(t + off, 0.035, 0.12 * k, d, { type: 'bandpass', f: 420, q: 1.4, a: 0.002, rel: 0.035 });
      });
    },
    startGo(k = 1) { // Hiệu lệnh "Bắt đầu!" sáng rõ mở ô chữ
      const t = ac.currentTime, d = out(0.2);
      [[587.33, 0, 0.1], [880.00, 0.07, 0.18]].forEach(([f, off, dur]) => {
        osc('triangle', f, t + off, dur, 0.18 * k, d, { a: 0.004, rel: dur });
        osc('sine', f * 2, t + off, dur * 0.6, 0.06 * k, d, { a: 0.003, rel: dur * 0.6 });
      });
    },
    clockTick(k = 1) { // Tiếng tích tắc 5 giây cuối
      const t = ac.currentTime, d = out(0.08);
      osc('sine', 1120, t, 0.035, 0.09 * k, d, { to: 760, glide: 0.03, a: 0.002, rel: 0.035 });
    },
    classClap(k = 1) { // Cả lớp vỗ tay gọn ~0.85s
      const t = ac.currentTime, d = out(0.28);
      for (let i = 0; i < 14; i++) {
        const off = i * 0.052 + rnd(0, 0.022);
        const gain = (0.07 + Math.sin((i / 14) * Math.PI) * 0.09) * k;
        noise(t + off, 0.045, gain, d, { type: 'bandpass', f: rnd(1250, 2050), q: 1.8, a: 0.002, rel: 0.045 });
      }
    },
    // Giữ tên cũ cho tương thích
    bell() { S.bellToll(1); },
    laugh() { S.childLaugh(); },
    click() { S.flashlight(); },
    blackout() { S.powerDown(); },
    freeze() { S.talisman(); },
    boss() { S.growl(); }
  };

  // ---------- Nhạc nền Nhà Ma: nhiều kiểu để chọn ----------
  let amb = null; // { key, bus, sources: [], timers: [] }

  function loopNoise(dest, type, f, q, gain) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const fl = ac.createBiquadFilter();
    fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ac.createGain();
    g.gain.value = gain;
    src.connect(fl).connect(g).connect(dest);
    src.start(ac.currentTime, Math.random() * 2);
    return { src, fl, g };
  }

  function lfo(param, rate, depth, a) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = rate;
    g.gain.value = depth;
    o.connect(g).connect(param);
    o.start();
    a.sources.push(o);
    return o;
  }

  function tonal(dest, type, f, gain, a, filt) {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = ac.createGain();
    g.gain.value = gain;
    let n = o;
    if (filt) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filt; n.connect(fl); n = fl; }
    n.connect(g).connect(dest);
    o.start();
    a.sources.push(o);
    return { o, g };
  }

  // Lặp lại một việc sau khoảng thời gian ngẫu nhiên, tự huỷ khi đổi nhạc nền
  function every(a, minMs, maxMs, fn) {
    const tick = () => {
      if (amb !== a && templeAmb !== a && barAmb !== a && lopAmb !== a) return;
      if (playable()) { try { fn(); } catch { /* bỏ qua */ } }
      a.timers.push(setTimeout(tick, rnd(minMs, maxMs)));
    };
    a.timers.push(setTimeout(tick, rnd(minMs, maxMs)));
  }

  // Phát một tiếng ngắn vào bus nhạc nền (đi qua vang phòng)
  function ambOut(a, reverb = 0.7) {
    const g = ac.createGain();
    const w = ac.createGain();
    w.gain.value = reverb;
    g.connect(a.bus);
    g.connect(w).connect(wet);
    return g;
  }

  const AMBIENTS = {
    drone(a) { // U ám
      const d = a.bus;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 4; lp.connect(d);
      lfo(lp.frequency, 0.03, 140, a);
      tonal(lp, 'sawtooth', 55, 0.16, a);
      tonal(lp, 'sawtooth', 58.27, 0.1, a);
      tonal(lp, 'triangle', 82.41, 0.08, a);
      const hi = tonal(ambOut(a, 0.9), 'sine', 932.3, 0.012, a);
      lfo(hi.o.frequency, 0.2, 6, a);
      lfo(hi.g.gain, 0.05, 0.01, a);
      loopNoise(d, 'lowpass', 180, 0.7, 0.08);
      every(a, 14000, 30000, () => (Math.random() < 0.5 ? S.whisper() : S.wail()));
    },
    wind(a) { // Gió hú
      const base = loopNoise(a.bus, 'lowpass', 500, 1, 0.45);
      lfo(base.fl.frequency, 0.06, 320, a);
      lfo(base.g.gain, 0.09, 0.2, a);
      const howl = loopNoise(ambOut(a, 0.6), 'bandpass', 650, 14, 0.5);
      lfo(howl.fl.frequency, 0.045, 260, a);
      lfo(howl.g.gain, 0.07, 0.35, a);
      const howl2 = loopNoise(a.bus, 'bandpass', 980, 18, 0.25);
      lfo(howl2.fl.frequency, 0.033, 300, a);
      every(a, 15000, 35000, () => S.creak());
    },
    rain(a) { // Mưa đêm
      const r = loopNoise(a.bus, 'highpass', 1400, 0.5, 0.18);
      const r2 = loopNoise(a.bus, 'bandpass', 5000, 0.6, 0.1);
      lfo(r2.g.gain, 0.15, 0.04, a);
      loopNoise(a.bus, 'lowpass', 300, 0.7, 0.12);
      every(a, 60, 260, () => {
        const t = ac.currentTime;
        const o = ac.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(rnd(1800, 4200), t);
        o.frequency.exponentialRampToValueAtTime(rnd(700, 1200), t + 0.05);
        const g = ac.createGain(); env(g, t, 0.002, rnd(0.01, 0.035), 0, 0.06);
        o.connect(g).connect(a.bus); o.start(t); o.stop(t + 0.1);
      });
      every(a, 20000, 45000, () => {
        const t = ac.currentTime;
        noise(t, 4, 0.35, ambOut(a, 0.8), { type: 'lowpass', f: 160, to: 50, a: 0.6, q: 0.6 });
      });
      void r;
    },
    church(a) { // Nhà thờ hoang
      const pad = ac.createGain(); pad.gain.value = 0.9; pad.connect(a.bus);
      const w = ac.createGain(); w.gain.value = 1; pad.connect(w).connect(wet);
      const chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [146.83, 174.61, 220], [164.81, 207.65, 246.94]];
      const voices = [0, 1, 2].map(() => {
        const o1 = ac.createOscillator(); o1.type = 'triangle';
        const o2 = ac.createOscillator(); o2.type = 'sine';
        const g = ac.createGain(); g.gain.value = 0.05;
        o1.connect(g); o2.connect(g); g.connect(pad);
        o1.start(); o2.start();
        a.sources.push(o1, o2);
        return { o1, o2 };
      });
      let ci = 0;
      const setChord = () => {
        const t = ac.currentTime;
        chords[ci % chords.length].forEach((f, i) => {
          voices[i].o1.frequency.setTargetAtTime(f, t, 0.8);
          voices[i].o2.frequency.setTargetAtTime(f * 2.003, t, 0.8);
        });
        ci++;
      };
      setChord();
      every(a, 7000, 9000, setChord);
      tonal(pad, 'sine', 55, 0.08, a);
      every(a, 25000, 45000, () => S.bellToll(1));
    },
    heartbeat(a) { // Hồi hộp
      tonal(a.bus, 'sine', 41.2, 0.12, a);
      loopNoise(a.bus, 'lowpass', 220, 0.8, 0.05);
      const beat = () => {
        const t = ac.currentTime;
        const out = a.bus;
        [[0, 0.7], [0.18, 0.45]].forEach(([o, v]) => {
          const osc = ac.createOscillator(); osc.type = 'sine';
          osc.frequency.setValueAtTime(62, t + o);
          osc.frequency.exponentialRampToValueAtTime(36, t + o + 0.16);
          const g = ac.createGain(); env(g, t + o, 0.01, v, 0, 0.2);
          osc.connect(g).connect(out); osc.start(t + o); osc.stop(t + o + 0.3);
        });
      };
      every(a, 820, 900, beat);
      every(a, 9000, 16000, () => noise(ac.currentTime, 1.4, 0.06, ambOut(a, 0.4), { f: 900, q: 1.2, a: 0.5 }));
    },
    musicbox(a) { // Hộp nhạc ma
      const crackle = () => {
        const t = ac.currentTime;
        noise(t, 0.01, rnd(0.02, 0.06), a.bus, { type: 'highpass', f: 3000, q: 0.5, a: 0.001, rel: 0.01 });
      };
      every(a, 40, 220, crackle);
      loopNoise(a.bus, 'bandpass', 1200, 0.4, 0.015);
      const melody = [659.3, 587.3, 523.3, 493.9, 440, 493.9, 523.3, 440, 415.3, 440, 493.9, 329.6];
      const playTune = () => {
        const t = ac.currentTime;
        const slow = rnd(0.38, 0.5);
        const dest = ambOut(a, 0.8);
        melody.forEach((f, i) => {
          const o = ac.createOscillator(); o.type = 'triangle';
          o.frequency.value = f * (1 + rnd(-0.012, 0.012));
          const g = ac.createGain(); env(g, t + i * slow, 0.005, 0.07, 0, 1.2);
          o.connect(g).connect(dest); o.start(t + i * slow); o.stop(t + i * slow + 1.4);
        });
      };
      playTune();
      every(a, 9000, 12000, playTune);
    },
    whispers(a) { // Thì thầm
      loopNoise(a.bus, 'bandpass', 700, 0.6, 0.05);
      tonal(a.bus, 'sine', 49, 0.06, a);
      every(a, 2500, 6500, () => {
        const pan = ac.createStereoPanner();
        pan.pan.value = rnd(-1, 1);
        const dest = ac.createGain();
        dest.connect(pan).connect(a.bus);
        const w = ac.createGain(); w.gain.value = 0.7; dest.connect(w).connect(wet);
        const t = ac.currentTime;
        const n = Math.floor(rnd(3, 7));
        for (let i = 0; i < n; i++) noise(t + i * rnd(0.12, 0.22), rnd(0.12, 0.25), rnd(0.08, 0.16), dest, { f: rnd(1800, 4500), q: rnd(4, 9), a: 0.03 });
      });
      every(a, 25000, 50000, () => S.childLaugh());
    },
    forest(a) { // Rừng đêm
      const wind = loopNoise(a.bus, 'lowpass', 380, 0.8, 0.12);
      lfo(wind.fl.frequency, 0.05, 150, a);
      every(a, 900, 2200, () => {
        const t = ac.currentTime;
        const f = rnd(4200, 4800);
        const pan = ac.createStereoPanner(); pan.pan.value = rnd(-0.8, 0.8); pan.connect(a.bus);
        for (let i = 0; i < 3; i++) {
          const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f;
          const g = ac.createGain(); env(g, t + i * 0.07, 0.005, 0.025, 0.02, 0.03);
          o.connect(g).connect(pan); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.08);
        }
      });
      every(a, 12000, 26000, () => {
        const t = ac.currentTime;
        const dest = ambOut(a, 0.9);
        [[0, 0.45], [0.7, 0.25], [1.0, 0.35]].forEach(([o, d]) => {
          const os = ac.createOscillator(); os.type = 'sine';
          os.frequency.setValueAtTime(410, t + o);
          os.frequency.exponentialRampToValueAtTime(370, t + o + d);
          const g = ac.createGain(); env(g, t + o, 0.05, 0.1, d * 0.5, d * 0.5);
          os.connect(g).connect(dest); os.start(t + o); os.stop(t + o + d + 0.2);
        });
      });
    },
    none() {}
  };

  // ---------- Âm tịnh tâm Chánh Điện (thuần khiết, không giai điệu nhạc tạp, không beat) ----------
  let templeAmb = null; // { key, bus, sources: [], timers: [] }
  const TEMPLE_SOUNDSCAPES = {
    bell(a) { // Chuông xoay & âm ngân đồng trầm ấm
      const d = ambOut(a, 0.85);
      const b1 = tonal(d, 'sine', 130.81, 0.065, a);
      const b2 = tonal(d, 'sine', 196.00, 0.04, a);
      const b3 = tonal(d, 'sine', 261.63, 0.022, a);
      lfo(b1.g.gain, 0.07, 0.018, a);
      lfo(b2.g.gain, 0.05, 0.014, a);
      lfo(b3.g.gain, 0.04, 0.008, a);
      strikeKhanh(ac.currentTime + 0.3, d, 0.42);
      every(a, 14000, 22000, () => {
        if (Math.random() < 0.3) S.templeBell(0.45);
        else strikeKhanh(ac.currentTime, d, 0.42);
      });
    },
    chant(a) { // Nhịp mõ tịnh tâm đều đặn + chuông gia trì mỗi 16 nhịp
      const d = ambOut(a, 0.24);
      const kd = ambOut(a, 0.55);
      let beat = 0;
      const step = () => {
        if (templeAmb !== a) return;
        if (playable()) {
          const t = ac.currentTime;
          strikeMo(t, d, 0.55);
          if (beat % 16 === 0) strikeKhanh(t + 0.02, kd, 0.48);
          beat += 1;
        }
        a.timers.push(setTimeout(step, 1160));
      };
      a.timers.push(setTimeout(step, 400));
    }
  };

  // ---------- Beat điện tử Đi Bar Online (tổng hợp WebAudio sạch bản quyền, không đụng file ngoài) ----------
  let barAmb = null; // { key, bus, sources: [], timers: [] }
  const BAR_SOUNDSCAPES = {
    house(a) { // Beat Sôi Động 128 BPM (kick căng + off-beat hat + bass nảy + synth lead nhẹ)
      const dryBus = a.bus;
      const wetBus = ambOut(a, 0.32);
      const stepMs = (60 / 128 / 4) * 1000; // ~117.1875ms / nốt móc kép (16th)
      const bassNotes = [65.41, 65.41, 77.78, 87.31, 98.00, 87.31, 77.78, 58.27]; // C2, Eb2, F2, G2, Bb1
      const leadNotes = [261.63, 311.13, 392.00, 349.23, 311.13, 293.66, 261.63, 233.08];
      let stepIdx = 0;
      const tick = () => {
        if (barAmb !== a) return;
        if (playable()) {
          const t = ac.currentTime;
          const s16 = stepIdx % 16;
          const barIdx = Math.floor(stepIdx / 16);
          // Kick 4-on-the-floor (0, 4, 8, 12)
          if (s16 % 4 === 0) {
            osc('sine', 142, t, 0.19, 0.56, dryBus, { to: 42, glide: 0.085, a: 0.002, rel: 0.18 });
            noise(t, 0.018, 0.12, dryBus, { type: 'lowpass', f: 900, q: 1, a: 0.001, rel: 0.018 });
          }
          // Clap + Snare nhẹ nhịp 4 & 12
          if (s16 === 4 || s16 === 12) {
            noise(t, 0.09, 0.22, wetBus, { type: 'bandpass', f: 1850, q: 1.4, a: 0.002, rel: 0.09 });
          }
          // Open hi-hat off-beat (2, 6, 10, 14) + closed hat mảnh
          if (s16 % 4 === 2) {
            noise(t, 0.095, 0.15, dryBus, { type: 'highpass', f: 6800, q: 0.8, a: 0.002, rel: 0.09 });
          } else if (s16 % 2 === 1) {
            noise(t, 0.03, 0.05, dryBus, { type: 'highpass', f: 8200, q: 0.9, a: 0.001, rel: 0.03 });
          }
          // Off-beat bouncy bassline
          if (s16 % 4 === 2 || s16 === 15) {
            const bf = bassNotes[(barIdx * 2 + Math.floor(s16 / 8)) % bassNotes.length];
            osc('sawtooth', bf, t, 0.16, 0.22, dryBus, { a: 0.005, rel: 0.15, filter: { f: 440, q: 2.8 } });
          }
          // Pluck giai điệu neon dịu tai để không lấn giọng MC
          if (s16 === 0 || s16 === 3 || s16 === 6 || s16 === 10 || s16 === 14) {
            const lf = leadNotes[(stepIdx + barIdx) % leadNotes.length];
            osc('triangle', lf * 2, t, 0.15, 0.075, wetBus, { a: 0.004, rel: 0.15, detune: 5 });
          }
          stepIdx += 1;
        }
        a.timers.push(setTimeout(tick, stepMs));
      };
      a.timers.push(setTimeout(tick, 120));
    },
    chill(a) { // Lounge Deep Chill 110 BPM êm ái
      const dryBus = a.bus;
      const wetBus = ambOut(a, 0.55);
      const stepMs = (60 / 110 / 2) * 1000; // nốt móc đơn (8th) ~272.7ms
      const chords = [
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [130.81, 196.00, 246.94, 329.63], // Cmaj7
        [146.83, 220.00, 261.63, 329.63]  // Dm7
      ];
      let stepIdx = 0;
      const tick = () => {
        if (barAmb !== a) return;
        if (playable()) {
          const t = ac.currentTime;
          const s8 = stepIdx % 8;
          const chord = chords[Math.floor(stepIdx / 8) % chords.length];
          if (s8 % 2 === 0) {
            osc('sine', 112, t, 0.22, 0.42, dryBus, { to: 44, glide: 0.09, a: 0.003, rel: 0.21 });
          }
          if (s8 % 2 === 1) {
            noise(t, 0.055, 0.08, dryBus, { type: 'highpass', f: 7200, q: 0.7, a: 0.002, rel: 0.055 });
          }
          if (s8 === 2 || s8 === 6) {
            noise(t, 0.07, 0.12, wetBus, { type: 'bandpass', f: 1650, q: 1.8, a: 0.002, rel: 0.07 });
          }
          if (s8 === 0 || s8 === 3) {
            chord.forEach((f, idx) => {
              osc('sine', f, t, 0.55, idx === 0 ? 0.08 : 0.045, wetBus, { a: 0.015, rel: 0.52 });
            });
          }
          stepIdx += 1;
        }
        a.timers.push(setTimeout(tick, stepMs));
      };
      a.timers.push(setTimeout(tick, 150));
    }
  };

  // ---------- Giai điệu nền Lớp Học Vui Vẻ (Kalimba / Lofi học bài sạch bản quyền) ----------
  let lopAmb = null; // { key, bus, sources: [], timers: [] }
  const LOP_SOUNDSCAPES = {
    melody(a) { // Giai điệu Kalimba / Music-box tuổi học trò trong sáng, êm dịu
      const wetBus = ambOut(a, 0.48);
      const notes = [
        523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 659.25, 523.25,
        440.00, 523.25, 659.25, 587.33, 523.25, 392.00, 440.00, 523.25
      ];
      const bass = [261.63, 196.00, 220.00, 174.61];
      let idx = 0;
      const tick = () => {
        if (lopAmb !== a) return;
        if (playable()) {
          const t = ac.currentTime;
          const f = notes[idx % notes.length];
          osc('sine', f, t, 0.62, 0.11, wetBus, { a: 0.008, rel: 0.6 });
          osc('triangle', f * 2, t, 0.28, 0.032, wetBus, { a: 0.005, rel: 0.26 });
          if (idx % 4 === 0) {
            const bf = bass[Math.floor(idx / 4) % bass.length];
            osc('sine', bf, t, 1.35, 0.085, wetBus, { a: 0.02, rel: 1.3 });
          }
          idx += 1;
        }
        a.timers.push(setTimeout(tick, 430));
      };
      a.timers.push(setTimeout(tick, 180));
    },
    lofi(a) { // Hợp âm Piano Lofi ấm áp tập trung giải đố
      const wetBus = ambOut(a, 0.55);
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 349.23], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G6
      ];
      let step = 0;
      const tick = () => {
        if (lopAmb !== a) return;
        if (playable()) {
          const t = ac.currentTime;
          const ch = chords[step % chords.length];
          ch.forEach((f, i) => {
            osc('sine', f, t + i * 0.045, 2.1, i === 0 ? 0.095 : 0.055, wetBus, { a: 0.025, rel: 2.0, detune: rnd(-3, 3) });
          });
          step += 1;
        }
        a.timers.push(setTimeout(tick, 2200));
      };
      a.timers.push(setTimeout(tick, 180));
    }
  };

  function stopBus(ref) {
    if (!ref) return;
    ref.timers.forEach(clearTimeout);
    ref.bus.gain.setTargetAtTime(0, ac.currentTime, 0.06);
    setTimeout(() => {
      ref.sources.forEach((s) => { try { s.stop(); } catch { /* đã dừng */ } });
      try { ref.bus.disconnect(); } catch { /* đã ngắt */ }
    }, 320);
  }

  function stopAmbient() {
    if (!amb) return;
    const old = amb;
    amb = null;
    stopBus(old);
  }

  function stopTempleAmbient() {
    if (!templeAmb) return;
    const old = templeAmb;
    templeAmb = null;
    stopBus(old);
  }

  function stopBarAmbient() {
    if (!barAmb) return;
    const old = barAmb;
    barAmb = null;
    stopBus(old);
  }

  function stopLopAmbient() {
    if (!lopAmb) return;
    const old = lopAmb;
    lopAmb = null;
    stopBus(old);
  }

  // Bật đúng kiểu nhạc nền theo từng cảnh, cô lập tuyệt đối giữa Nhà Ma, Chánh Điện và Đi Bar
  function syncAmbient() {
    const c = getCfg();
    const on = c.sound && !muted && !paused;

    // 1. Bus Nhà Ma
    let hauntKey = 'none';
    if (on && (c.mode === 'game' || c.mode === 'cards') && c.ambient && !c.customAmbient) {
      hauntKey = AMBIENTS[c.ambientPreset] ? c.ambientPreset : 'drone';
    }
    if ((amb?.key || 'none') !== hauntKey) {
      stopAmbient();
      if (hauntKey !== 'none') {
        const bus = ac.createGain();
        bus.gain.value = 0;
        bus.connect(ambGain);
        bus.gain.setTargetAtTime(1, ac.currentTime, 0.8);
        const a = { key: hauntKey, bus, sources: [], timers: [] };
        amb = a;
        const origCreate = ac.createBufferSource.bind(ac);
        ac.createBufferSource = () => { const n = origCreate(); a.sources.push(n); return n; };
        try { AMBIENTS[hauntKey](a); } finally { ac.createBufferSource = origCreate; }
      }
    }

    // 2. Bus Chánh Điện
    const sc = c.chuaSoundscape || 'off';
    const templeKey = on && c.mode === 'chua' && TEMPLE_SOUNDSCAPES[sc] ? sc : 'none';
    if ((templeAmb?.key || 'none') !== templeKey) {
      stopTempleAmbient();
      if (templeKey !== 'none') {
        const bus = ac.createGain();
        bus.gain.value = 0;
        bus.connect(templeGain);
        bus.gain.setTargetAtTime(1, ac.currentTime, 0.6);
        const a = { key: templeKey, bus, sources: [], timers: [] };
        templeAmb = a;
        TEMPLE_SOUNDSCAPES[templeKey](a);
      }
    }

    // 3. Bus Đi Bar Online
    const bs = c.barSoundscape || 'house';
    const barKey = on && c.mode === 'bar' && BAR_SOUNDSCAPES[bs] ? bs : 'none';
    if ((barAmb?.key || 'none') !== barKey) {
      stopBarAmbient();
      if (barKey !== 'none') {
        const bus = ac.createGain();
        bus.gain.value = 0;
        bus.connect(barGain);
        bus.gain.setTargetAtTime(1, ac.currentTime, 0.35);
        const a = { key: barKey, bus, sources: [], timers: [] };
        barAmb = a;
        BAR_SOUNDSCAPES[barKey](a);
      }
    }

    // 4. Bus Lớp Học Chữ
    const ls = c.lopSoundscape || 'off';
    const lopKey = on && c.mode === 'lop' && LOP_SOUNDSCAPES[ls] ? ls : 'none';
    if ((lopAmb?.key || 'none') !== lopKey) {
      stopLopAmbient();
      if (lopKey !== 'none') {
        const bus = ac.createGain();
        bus.gain.value = 0;
        bus.connect(lopGain);
        bus.gain.setTargetAtTime(1, ac.currentTime, 0.4);
        const a = { key: lopKey, bus, sources: [], timers: [] };
        lopAmb = a;
        LOP_SOUNDSCAPES[lopKey](a);
      }
    }
  }

  const playable = () => { const c = getCfg(); return ac && c.sound && !muted && !paused; };

  // ---------- API ----------
  const MIN_GAP = {
    applause: 700, crowdLaugh: 900, wow: 500, crunch: 300,
    scream: 350, boo: 500, whoosh: 300, footsteps: 600, pop: 150, creak: 800, jumpscare: 1500, thunder: 3000,
    mo: 220, khanh: 320, templeBell: 450,
    airhorn: 650, bassDrop: 850, co2Jet: 450, cheers: 350, laserZap: 200, coinBurst: 350, firework: 240,
    schoolBell: 1800, correctDing: 480, wrongPop: 720, revealFanfare: 1400,
    schoolDrum: 1800, startGo: 500, clockTick: 850, classClap: 2400
  };

  function play(name, ...args) {
    const c = getCfg();
    if (!c.sound || muted || paused || !S[name]) return;
    const now = performance.now();
    if (now - (lastPlay[name] || 0) < (MIN_GAP[name] ?? 400)) return;
    lastPlay[name] = now;
    try {
      ctx();
      syncAmbient();
      S[name](...args);
    } catch { /* trình duyệt chặn âm thanh */ }
  }

  window.HauntAudio = {
    init(cfgGetter, isMuted) { getCfg = cfgGetter; muted = !!isMuted; },
    setMuted(m) {
      muted = !!m;
      if (ac) { applyVolume(); syncAmbient(); }
    },
    duck(d) { ducked = !!d; applyVolume(); },
    setPaused(p) {
      paused = !!p;
      if (ac) {
        applyVolume();
        syncAmbient();
        (paused ? ac.suspend() : ac.resume()).catch(() => {});
      }
    },
    update() {
      const c = getCfg();
      const sc = c.chuaSoundscape || 'off';
      const bs = c.barSoundscape || 'house';
      const ls = c.lopSoundscape || 'off';
      const wantCtx = c.sound && !muted && (
        c.mode === 'chua' ? (sc === 'bell' || sc === 'chant') :
        c.mode === 'bar' ? (bs === 'house' || bs === 'chill') :
        c.mode === 'lop' ? (ls === 'melody' || ls === 'lofi') :
        (c.mode === 'game' || c.mode === 'cards') && c.ambient
      );
      if (!ac && wantCtx) { try { ctx(); } catch { return; } }
      if (ac) { applyVolume(); syncAmbient(); }
    },
    play,
    names: Object.keys(S)
  };
})();
