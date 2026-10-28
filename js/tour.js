/** 首次访问导览。自动只在 #home、且 onboarding.tourDone 不为 true 时出现。
 *  navigator.webdriver 时不自动弹出，除非 localStorage gefei-quest-tour-test=1。
 *  QuestTour.start() / open() 可从 #start 与页脚重播：非首页时先 location.hash='#home' 再开，
 *  避免在 #war-kit 等工具页把聚光灯叠在生成页预览上。tour-root 为全屏 fixed。 */
(function (global) {
  var STEPS = [
    { sel: '[data-tour="nav"]', title: '顶栏四个入口', body: '首页、学习、实施、赚钱。手机上同样的入口在底部栏。「我的」在右侧头像菜单。' },
    { sel: '[data-tour="cta"]', title: '今天这一关', body: '根据你的进度，这里只推荐今天要做的一件事。点「开始」进入。' },
    { sel: '#home-path', title: '主线路径', body: '从新手引导到试渠道，五步竖着排。已完成打勾，当前关高亮，未解锁灰色。' },
    { sel: '#hero-top3', title: '今日 Top3', body: '今天赚钱榜的前三条。看完整榜去每日赚钱榜。不保证收入。' },
    { sel: '#foot-tour', title: '每页提示，可以再看一遍', body: '工具页顶部有一行说明，告诉你这个页面是干什么的，可以点 × 关掉。想再看导览，点页脚「重播新手导览」。' },
  ];
  var DAY_KEYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
  var active = [];
  var index = 0;
  var openNow = false;
  var forced = false;
  var customSteps = null;
  var keyOn = false;
  var raf = 0;
  var lastFocus = null;

  function q(sel) {
    try { return document.querySelector(sel); } catch (_) { return null; }
  }
  function prepare() {
    try { if (global.QuestCompact && QuestCompact.apply) QuestCompact.apply(document); } catch (_) {}
  }
  function readOb() {
    try {
      if (global.QuestApp && QuestApp.get) {
        var s = QuestApp.get();
        if (s && s.onboarding) return s.onboarding;
      }
    } catch (_) {}
    try {
      var raw = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null');
      return (raw && raw.onboarding) || {};
    } catch (_) { return {}; }
  }
  function autoOk() {
    var test = false;
    try { test = localStorage.getItem('gefei-quest-tour-test') === '1'; } catch (_) { test = false; }
    if (navigator.webdriver && !test) return false;
    return readOb().tourDone !== true;
  }
  function isHome() {
    var raw = (location.hash || '').replace(/^#/, '');
    var i = raw.indexOf('?');
    if (i >= 0) raw = raw.slice(0, i);
    if (!raw) return true;
    try { if (global.QuestNav) return QuestNav.parse(raw).section === 'home'; } catch (_) {}
    return raw === 'home' || raw.indexOf('home-') === 0;
  }
  function eligible(step) {
    if (!step || !step.sel) return false;
    var el = q(step.sel);
    if (!el || !el.isConnected) return false;
    if (el.closest('[hidden]')) return false;
    if (el.classList.contains('cx-off') || el.closest('.cx-off')) return true;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return true;
  }
  function makeVisible(el) {
    try { if (global.QuestCompact) QuestCompact.reveal(el); } catch (_) {}
    if (!el.isConnected || el.closest('[hidden]')) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    return r.width > 1 || r.height > 1;
  }
  function saveDone() {
    var iso = new Date().toISOString();
    function pack(prev) {
      var src = (prev && prev.days) || {};
      var days = {};
      DAY_KEYS.forEach(function (k) { if (src[k] === true) days[k] = true; });
      return { tourDone: true, tourSeenAt: iso, days: days };
    }
    if (global.QuestApp && QuestApp.update) {
      QuestApp.update(function (s) {
        return Object.assign({}, s, { onboarding: pack(s && s.onboarding) });
      });
      return;
    }
    try {
      var raw = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null');
      if (!raw || typeof raw !== 'object') return;
      raw.onboarding = pack(raw.onboarding);
      localStorage.setItem('gefei-quest-save-v1', JSON.stringify(raw));
    } catch (_) {}
  }
  function focusables(root) {
    return [].slice.call(root.querySelectorAll('button, a[href], input, select, textarea')).filter(function (el) {
      if (el.disabled) return false;
      var cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    });
  }
  function onKey(e) {
    if (!openNow) return;
    var root = document.getElementById('tour-root');
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hide(true); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); if (index >= active.length - 1) hide(true); else go(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(-1); return; }
    if (e.key !== 'Tab') return;
    var list = focusables(root);
    if (!list.length) { e.preventDefault(); return; }
    var i = list.indexOf(document.activeElement);
    if (e.shiftKey) {
      if (i <= 0) { e.preventDefault(); list[list.length - 1].focus(); }
    } else if (i < 0 || i === list.length - 1) {
      e.preventDefault();
      list[0].focus();
    }
  }
  function schedule() {
    if (!openNow || raf) return;
    raf = requestAnimationFrame(function () { raf = 0; if (openNow) place(); });
  }
  function bindKeys() {
    if (keyOn) return;
    keyOn = true;
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
  }
  function unbindKeys() {
    if (!keyOn) return;
    keyOn = false;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', schedule, true);
  }
  function place() {
    var root = document.getElementById('tour-root');
    var card = document.getElementById('tour-card');
    var hole = document.getElementById('tour-hole');
    if (!root || !card || !hole || !active[index]) return;
    var el = q(active[index].sel);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var pad = 6;
    var top = Math.max(4, rect.top - pad);
    var left = Math.max(4, rect.left - pad);
    var right = Math.min(vw - 4, rect.right + pad);
    var bottom = Math.min(vh - 4, rect.bottom + pad);
    hole.style.top = top + 'px';
    hole.style.left = left + 'px';
    hole.style.width = Math.max(0, right - left) + 'px';
    hole.style.height = Math.max(0, bottom - top) + 'px';
    var sheet = vw <= 700;
    root.classList.toggle('is-sheet', sheet);
    if (sheet) {
      card.style.left = '0';
      card.style.right = '0';
      card.style.top = 'auto';
      card.style.bottom = '0';
      card.style.width = 'auto';
      return;
    }
    var w = Math.min(340, Math.max(220, vw - 16));
    card.style.width = w + 'px';
    card.style.right = 'auto';
    card.style.bottom = 'auto';
    var h = card.offsetHeight || 180;
    var l = Math.max(8, rect.left);
    var t = rect.bottom + 12;
    if (t + h > vh - 8) t = rect.top - h - 12;
    if (t < 8) t = 8;
    if (t + h > vh - 8) t = Math.max(8, vh - h - 8);
    if (l + w > vw - 8) l = Math.max(8, vw - w - 8);
    card.style.left = l + 'px';
    card.style.top = t + 'px';
  }
  function paint() {
    var step = active[index];
    if (!step) return;
    var title = document.getElementById('tour-title');
    var body = document.getElementById('tour-body');
    var prev = document.getElementById('tour-prev');
    var next = document.getElementById('tour-next');
    var dots = document.getElementById('tour-dots');
    if (title) title.textContent = step.title;
    if (body) body.textContent = step.body;
    if (prev) prev.disabled = index === 0;
    if (next) next.textContent = index === active.length - 1 ? '完成' : '下一步';
    if (dots) {
      dots.innerHTML = active.map(function (_, i) {
        return '<button type="button" class="tour-dot' + (i === index ? ' on' : '') + '" data-dot="' + i + '" aria-label="第 ' + (i + 1) + ' 步，共 ' + active.length + ' 步"' + (i === index ? ' aria-current="step"' : '') + '></button>';
      }).join('');
    }
    place();
    var el = q(step.sel);
    if (el && el.scrollIntoView) {
      try { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' }); } catch (_) {}
    }
    place();
    var n = document.getElementById('tour-next');
    if (n && document.activeElement && document.getElementById('tour-root') && !document.getElementById('tour-root').contains(document.activeElement)) {
      try { n.focus(); } catch (_) {}
    }
  }
  function showAt(i) {
    if (i < 0 || i >= active.length) return false;
    prepare();
    var el = q(active[i].sel);
    if (!el || !makeVisible(el)) return false;
    index = i;
    if (el.scrollIntoView) {
      try { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); } catch (_) {}
    }
    paint();
    var n = document.getElementById('tour-next');
    if (n) { try { n.focus(); } catch (_) {} }
    return true;
  }
  function go(delta) {
    var i = index + delta;
    var guard = 0;
    while (i >= 0 && i < active.length && guard++ < active.length) {
      if (showAt(i)) return;
      i += delta > 0 ? 1 : -1;
    }
    if (delta > 0) hide(true);
  }
  function hide(persist) {
    if (persist) saveDone();
    openNow = false;
    customSteps = null;
    unbindKeys();
    var root = document.getElementById('tour-root');
    if (root) root.remove();
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) {
      try { lastFocus.focus(); } catch (_) {}
    }
    lastFocus = null;
  }
  function build() {
    var old = document.getElementById('tour-root');
    if (old) old.remove();
    var root = document.createElement('div');
    root.id = 'tour-root';
    root.className = 'tour-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'tour-title');
    root.setAttribute('aria-describedby', 'tour-body');
    root.innerHTML =
      '<div class="tour-shade"></div><div class="tour-hole" id="tour-hole" aria-hidden="true"></div>' +
      '<div class="tour-card" id="tour-card">' +
      '<h2 id="tour-title"></h2><p id="tour-body"></p>' +
      '<div class="tour-dots" id="tour-dots"></div>' +
      '<label class="tour-never"><input type="checkbox" id="tour-never" /> 不再显示</label>' +
      '<div class="tour-actions"><button type="button" class="btn btn-sm" id="tour-skip">跳过</button>' +
      '<span class="tour-nav"><button type="button" class="btn btn-sm" id="tour-prev">上一步</button>' +
      '<button type="button" class="btn btn-sm btn-primary" id="tour-next">下一步</button></span></div></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) {
      if (e.target.closest('#tour-skip')) { hide(true); return; }
      if (e.target.closest('#tour-prev')) { go(-1); return; }
      if (e.target.closest('#tour-next')) { if (index >= active.length - 1) hide(true); else go(1); return; }
      var d = e.target.closest('[data-dot]');
      if (d) showAt(+d.getAttribute('data-dot'));
    });
    var never = root.querySelector('#tour-never');
    if (never) never.addEventListener('change', function () { if (never.checked) saveDone(); });
    bindKeys();
  }
  function open() {
    if (openNow) { place(); return; }
    /* 非首页绝不开导览：先回 #home，等 afterRender 再开，避免叠在 #war-kit 预览带上 */
    if (!isHome()) {
      forced = true;
      if ((location.hash || '') !== '#home') location.hash = '#home';
      return;
    }
    forced = false;
    prepare();
    var src = customSteps || STEPS;
    var steps = [];
    src.forEach(function (s) { if (eligible(s)) steps.push(s); });
    if (!steps.length) return;
    active = steps;
    index = 0;
    lastFocus = document.activeElement;
    build();
    openNow = true;
    if (!showAt(0)) {
      var found = false;
      for (var i = 1; i < active.length; i++) { if (showAt(i)) { found = true; break; } }
      if (!found) hide(false);
    }
  }
  function start(custom) {
    var steps = arguments.length ? (Array.isArray(custom) ? custom : null) : null;
    if (openNow) hide(false);
    customSteps = steps;
    forced = true;
    if (!isHome()) {
      if ((location.hash || '') !== '#home') location.hash = '#home';
      else open();
      return;
    }
    open();
  }
  function afterRender(route) {
    if (!route) return;
    if (route.section !== 'home') {
      if (openNow) hide(false);
      if (route.tour) {
        forced = true;
        if ((location.hash || '') !== '#home') location.hash = '#home';
      }
      return;
    }
    if (openNow) { place(); return; }
    if (forced || route.tour || autoOk()) open();
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('#foot-tour, #start-tour') : null;
    if (!t) return;
    e.preventDefault();
    start();
  }, true);

  global.QuestTour = { STEPS: STEPS, start: start, open: start, close: function () { hide(true); }, afterRender: afterRender, isOpen: function () { return openNow; } };
})(typeof window !== 'undefined' ? window : globalThis);
