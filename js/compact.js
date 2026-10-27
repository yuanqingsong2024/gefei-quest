/** Phase 18 · 紧凑页面组件：tabs / collapse / more / paginate / reveal。
 *  渲染后由 MutationObserver 按选择器规则统一处理（幂等）；不删内容，被定位的元素自动展开。 */
(function (global) {
  var OFF = 'cx-off';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function kids(el, sel) { return [].slice.call(el.children).filter(function (c) { return !sel || c.matches(sel); }); }
  function setShow(n, fn) { n.__cxShow = fn; }

  /** 同级 [data-tab] 区块 → 页内标签（吸顶） */
  function tabs(parent) {
    var groups = [], cur = null;
    kids(parent).forEach(function (c) { if (c.hasAttribute('data-tab') && !c.__cxTab) { if (!cur) { cur = []; groups.push(cur); } cur.push(c); } else if (!c.classList.contains('cx-tabs')) cur = null; });
    groups.forEach(function (g) {
      if (g.length < 2) return;
      var key = 'cx-tab:' + (parent.id || parent.className) + ':' + g[0].getAttribute('data-tab'), act = 0;
      try { var v = sessionStorage.getItem(key); if (v != null && +v < g.length) act = +v; } catch (_) {}
      var nav = document.createElement('div'); nav.className = 'cx-tabs'; nav.setAttribute('role', 'tablist');
      nav.innerHTML = g.map(function (p, i) { return '<button type="button" role="tab" class="cx-tab-btn" data-i="' + i + '">' + esc(p.getAttribute('data-tab')) + '</button>'; }).join('');
      parent.insertBefore(nav, g[0]);
      function show(k, keep) {
        g.forEach(function (p, i) { p.classList.toggle(OFF, i !== k); p.setAttribute('role', 'tabpanel'); });
        [].forEach.call(nav.children, function (b, i) { b.classList.toggle('on', i === k); b.setAttribute('aria-selected', i === k ? 'true' : 'false'); });
        if (!keep) try { sessionStorage.setItem(key, k); } catch (_) {}
      }
      g.forEach(function (p, i) { p.__cxTab = 1; setShow(p, function () { show(i); }); });
      nav.addEventListener('click', function (e) { var b = e.target.closest('.cx-tab-btn'); if (b) show(+b.getAttribute('data-i')); });
      show(act, true);
    });
  }

  /** 可折叠：保留 head（或前 keep 个子元素），其余收进 .cx-body */
  function collapse(el, o) {
    if (el.__cx) return; el.__cx = 1; o = o || {};
    var ch = kids(el), head = o.head ? el.querySelector(':scope > ' + o.head) : null;
    var keepN = head ? ch.indexOf(head) + 1 : (o.keep || 1);
    var rest = ch.slice(keepN); if (!rest.length) return;
    var body = document.createElement('div'); body.className = 'cx-body';
    rest.forEach(function (n) { body.appendChild(n); });
    el.appendChild(body); el.classList.add('cx-coll');
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cx-toggle';
    (head || ch[keepN - 1]).appendChild ? null : null;
    if (o.btnOutside) el.after(btn); else if (head && !o.btnBelow) head.appendChild(btn); else el.insertBefore(btn, body);
    function set(open) { body.classList.toggle(OFF, !open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.textContent = open ? (o.less || '收起') : (o.more || '展开详情'); el.classList.toggle('cx-open', open); if (o.btnOutside) btn.classList.toggle('on', open); }
    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); set(body.classList.contains(OFF)); });
    if (head && o.headClick !== false) head.addEventListener('click', function (e) { if (e.target.closest('a,button,input,label,select,textarea')) return; set(body.classList.contains(OFF)); });
    setShow(body, function () { set(true); });
    set(!!o.open);
  }

  function sig(el, items) { return items.length + ':' + (items[0] ? items[0].textContent.length : 0); }
  /** 显示更多：前 n 个，其余点「显示更多」 */
  function more(el, sel, n, label) {
    var items = kids(el, sel); var s = sig(el, items);
    if (el.__cxMore === s) return; el.__cxMore = s;
    var old = el.nextElementSibling; if (old && old.classList.contains('cx-more-btn')) old.remove();
    items.forEach(function (it) { it.classList.remove(OFF); });
    if (items.length <= n) return;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-sm cx-more-btn';
    var open = false;
    function set(v) { open = v; items.forEach(function (it, i) { it.classList.toggle(OFF, !open && i >= n); }); btn.textContent = open ? '收起' : (label || '显示更多') + '（还有 ' + (items.length - n) + '）'; btn.setAttribute('aria-expanded', open); }
    btn.addEventListener('click', function () { set(!open); });
    el.after(btn); items.forEach(function (it) { setShow(it, function () { set(true); }); }); set(false);
  }
  /** 分页 */
  function paginate(el, sel, size) {
    var items = kids(el, sel); var s = sig(el, items);
    if (el.__cxPage === s) return; el.__cxPage = s;
    var last = items[items.length - 1], old = el.querySelector(':scope > .cx-pager') || (el.nextElementSibling && el.nextElementSibling.classList.contains('cx-pager') ? el.nextElementSibling : null);
    if (old) old.remove();
    items.forEach(function (it) { it.classList.remove(OFF); });
    if (items.length <= size) return;
    var pages = Math.ceil(items.length / size), cur = 0, all = false;
    var nav = document.createElement('nav'); nav.className = 'cx-pager'; nav.setAttribute('aria-label', '分页');
    function draw() {
      nav.innerHTML = '<button type="button" class="cx-pg" data-pg="prev"' + (cur === 0 || all ? ' disabled' : '') + ' aria-label="上一页">‹</button>' +
        Array.from({ length: pages }, function (_, i) { return '<button type="button" class="cx-pg' + (!all && i === cur ? ' on' : '') + '" data-pg="' + i + '">' + (i + 1) + '</button>'; }).join('') +
        '<button type="button" class="cx-pg" data-pg="next"' + (cur === pages - 1 || all ? ' disabled' : '') + ' aria-label="下一页">›</button>' +
        '<button type="button" class="cx-pg cx-pg-all' + (all ? ' on' : '') + '" data-pg="all">' + (all ? '分页显示' : '全部 ' + items.length) + '</button><span class="cx-pg-info">' + (all ? '共 ' + items.length + ' 项' : '第 ' + (cur * size + 1) + '–' + Math.min(items.length, (cur + 1) * size) + ' 项 / 共 ' + items.length) + '</span>';
      items.forEach(function (it, i) { it.classList.toggle(OFF, !all && Math.floor(i / size) !== cur); });
    }
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pg]'); if (!b || b.disabled) return; var v = b.getAttribute('data-pg');
      if (v === 'all') all = !all; else { all = false; cur = v === 'prev' ? cur - 1 : v === 'next' ? cur + 1 : +v; }
      draw(); var top = items[all ? 0 : cur * size];
      if (top) {
        var nh = 0; try { nh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0; } catch (_) {}
        if (top.getBoundingClientRect().top < nh + 12) {
          if (global.QuestShell && QuestShell.scrollToEl) QuestShell.scrollToEl(top, 'auto');
          else top.scrollIntoView({ block: 'start' });
        }
      }
    });
    items.forEach(function (it, i) { setShow(it, function () { if (!all) { cur = Math.floor(i / size); draw(); } }); });
    if (el.matches('.rank-grid,.ship-list,.peer-grid,.wb-plats,.quest-list,.res-grid,.pm-cards')) el.after(nav); else last.after(nav);
    draw();
  }
  /** 文档：按 h2/h3 分节折叠（前 2 节展开） */
  function docSections(art) {
    if (art.__cxDoc) return; var hs = kids(art).filter(function (c) { return /^H[23]$/.test(c.tagName); }); if (hs.length < 5) return; art.__cxDoc = 1;
    var h2s = hs.filter(function (h) { return h.tagName === 'H2'; }), big = hs.length > 20, byH2 = big && h2s.length >= 4, RX = byH2 ? /^H2$/ : /^H[23]$/;
    var openN = !big ? 2 : (byH2 ? 0 : 1);
    if (byH2) hs = h2s;
    hs.forEach(function (h, k) {
      var sec = document.createElement('section'); sec.className = 'cx-docsec'; h.before(sec); sec.appendChild(h);
      var n = sec.nextSibling; while (n && !(n.nodeType === 1 && RX.test(n.tagName))) { var nx = n.nextSibling; sec.appendChild(n); n = nx; }
      collapse(sec, { head: h.tagName.toLowerCase(), open: k < openN, more: '展开', less: '收起' });
    });
    if (big) more(art, '.cx-docsec', 12, '显示更多章节');
    var bar = document.createElement('div'); bar.className = 'cx-docbar'; bar.innerHTML = '<button type="button" class="btn btn-sm" data-cx-all="1">全部展开</button><button type="button" class="btn btn-sm" data-cx-all="0">全部收起</button>';
    var first = art.querySelector('.cx-docsec'); if (first) first.before(bar);
    bar.addEventListener('click', function (e) { var b = e.target.closest('[data-cx-all]'); if (!b) return; var open = b.getAttribute('data-cx-all') === '1'; if (open) art.querySelectorAll(':scope > .cx-docsec.' + OFF).forEach(reveal); art.querySelectorAll('.cx-docsec').forEach(function (s) { var body = s.querySelector(':scope > .cx-body'), t = s.querySelector('.cx-toggle'); if (body && body.classList.contains(OFF) === open && t) t.click(); }); });
  }

  /** 一行截断 +「展开」（全文仍在 DOM）。innerSel 指定被截断的子元素；否则把原内容包进 .cx-clip */
  function clipLine(el, innerSel) {
    if (el.__cxClip) return;
    var inner = innerSel ? el.querySelector(innerSel) : null;
    if (innerSel && !inner) return;
    el.__cxClip = 1;
    if (!inner) {
      inner = document.createElement('div'); inner.className = 'cx-clip';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    } else inner.classList.add('cx-clip');
    el.classList.add('cx-clip-host');
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cx-toggle';
    function set(open) { el.classList.toggle('cx-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.textContent = open ? '收起' : '展开'; }
    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); set(!el.classList.contains('cx-open')); });
    el.appendChild(btn); setShow(inner, function () { set(true); }); set(false);
  }

  /* ---------- 规则 ---------- */
  var RULES = [
    ['.home-wrap, .tool-wrap, .pm-page, #wb-body .wb', tabs],
    ['.war-days > section.war-day:not(.war-day-today)', function (el) { collapse(el, { head: '.war-day-head', more: '展开', less: '收起' }); }],
    // rank 详情改弹窗，不再对 .rank-card collapse 插入「展开详情」
    ['.rank-grid', function (el) { if (el.hasAttribute('data-col-expand')) return; paginate(el, '.rank-card', 6); }],
    ['.rank-disclaimer', function (el) { clipLine(el); }],
    ['.pm-note', function (el) { clipLine(el, ':scope > div'); }],
    ['.ship-list', function (el) { paginate(el, '.ship-card', 4); }],
    ['.res-sections', function (el) { var secs = kids(el, '.res-section'); if (secs.length > 3) more(el, '.res-section', 3, '显示更多分类'); secs.forEach(function (s) { var g = s.querySelector('.peer-grid'); if (!g) return; if (secs.length > 1) more(g, null, 3, '显示本类更多'); else paginate(g, null, 6); }); }],
    ['.cl-list', function (el) { more(el, 'li', 5, '更多更新'); }],
    ['article.doc-body', docSections],
    ['.pm-card dl', function (el) { collapse(el, { keep: 4, btnOutside: true, more: '展开：分成规则 · 实操 · 红线 · 来源' }); }],
    ['.pm-cards', function (el) { paginate(el, '.pm-card', 6); }],
    ['.wb-plat', function (el) {
      if (el.__cx) return;
      // 保留标题、状态徽章、免费路径；只折叠说明 <p> 和操作按钮
      var ch = kids(el), keep = 0, i;
      for (i = 0; i < ch.length; i++) {
        if (ch[i].matches('header, .wb-st, .wb-free')) keep = i + 1;
        else break;
      }
      collapse(el, { keep: keep || 1, btnBelow: true, more: '展开', less: '收起' });
      var st = el.querySelector(':scope > .wb-st'), free = el.querySelector(':scope > .wb-free'), btn = el.querySelector(':scope > .cx-toggle');
      if (!st || !btn) return;
      var row = document.createElement('div'); row.className = 'wb-meta';
      st.before(row); row.appendChild(st); if (free) row.appendChild(free); row.appendChild(btn);
    }],
    ['.wb-plats', function (el) { paginate(el, '.wb-plat', 6); }],
    ['#me-ach', function (el) { collapse(el, { head: '.panel-head', more: '展开', less: '收起' }); }],
    ['.quest-list', function (el) { paginate(el, null, 10); }],
    ['.pm-guide', function (el) { collapse(el, { head: 'h3', more: '展开', less: '收起' }); }],
    ['.cx-fold', function (el) { collapse(el, { head: '.block-title', open: el.classList.contains('cx-fold-open'), more: '展开', less: '收起' }); }],
  ];
  var busy = false;
  function apply(root) {
    if (busy) return; busy = true;
    try { root = root || document; RULES.forEach(function (r) { root.querySelectorAll(r[0]).forEach(function (el) { try { r[1](el); } catch (e) { if (global.console) console.warn('[compact]', r[0], e); } }); }); }
    finally { busy = false; }
    // 深链接锚点（如 #home-faq）：目标在收起区域里时自动展开一次
    var h = (location.hash || '').slice(1);
    if (h && h !== apply._h) { var t = null; try { t = document.getElementById(decodeURIComponent(h)); } catch (_) {} if (t) { apply._h = h; if (t.classList.contains(OFF) || t.closest('.' + OFF)) reveal(t); } }
  }
  function reveal(el) {
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      if (n.tagName === 'DETAILS' && !n.open) n.open = true;
      if (n.classList && n.classList.contains(OFF) && n.__cxShow) n.__cxShow();
    }
    return el;
  }
  function revealSel(sel) { var el = document.querySelector(sel); if (el) reveal(el); return !!el; }
  function start() {
    var app = document.getElementById('app') || document.body; apply(app);
    var pend = false;
    new MutationObserver(function () { if (busy || pend) return; pend = true; Promise.resolve().then(function () { pend = false; apply(app); }); }).observe(app, { childList: true, subtree: true });
    global.addEventListener('hashchange', function () { apply._h = ''; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  global.QuestCompact = { apply: apply, reveal: reveal, revealSel: revealSel, tabs: tabs, collapse: collapse, more: more, paginate: paginate };
})(typeof window !== 'undefined' ? window : globalThis);
