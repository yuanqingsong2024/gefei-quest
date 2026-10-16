/** 极简音效 · 默认静音；无音文件时静默成功 */
(function (global) {
  let ctx = null;

  function getCtx() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      return ctx;
    } catch (_) {
      return null;
    }
  }

  function beep(freq, dur, type) {
    const c = getCtx();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.stop(c.currentTime + dur);
    } catch (_) {
      /* 静默 */
    }
  }

  function play(name, muted) {
    if (muted) return;
    if (name === 'check') beep(880, 0.08, 'triangle');
    else if (name === 'boss') {
      beep(523, 0.1, 'square');
      setTimeout(() => beep(784, 0.12, 'square'), 90);
    } else if (name === 'ach') beep(660, 0.15, 'sine');
    else if (name === 'claim') beep(740, 0.1, 'sine');
  }

  global.QuestSfx = { play };
})(typeof window !== 'undefined' ? window : globalThis);
