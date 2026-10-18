/** Phase 11 · 网站外壳增强：顶栏收缩 · 回到顶部 · 底部 Tab 栏 · 全站搜索（/ 与 Ctrl/⌘+K）· 页面淡入 */
(function (global) {
  var doc = document;
  function N() { return global.QuestNav; }
  function I(n) { return global.QuestIcons.svg(n); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- 顶栏高度（fixed 后用 --nav-h 垫开正文）+ 收缩 + 回到顶部 ---------- */
  function navHeight() {
    var n = parseFloat(getComputedStyle(doc.documentElement).getPropertyValue('--nav-h'));
    return n > 0 ? n : 0;
  }
  function syncNavH() {
    var nav = doc.getElementById('site-nav');
    if (!nav) return 0;
    var h = nav.getBoundingClientRect().height;
    if (!(h > 0)) return 0;
    var next = Math.ceil(h) + 'px';
    if (doc.documentElement.style.getPropertyValue('--nav-h') !== next) doc.documentElement.style.setProperty('--nav-h', next);
    return Math.ceil(h);
  }
  function scrollToEl(el, behavior) {
    if (!el || !el.getBoundingClientRect) return;
    syncNavH();
    var y = global.pageYOffset || doc.documentElement.scrollTop || 0;
    var top = el.getBoundingClientRect().top + y - navHeight() - 12;
    if (top < 0) top = 0;
    try { global.scrollTo({ top: top, behavior: behavior || 'auto' }); }
    catch (_) { global.scrollTo(0, top); }
  }
  function onScroll() {
    var y = global.scrollY || doc.documentElement.scrollTop || 0;
    var condensed = y > 24;
    if (doc.body.classList.contains('nav-condensed') !== condensed) {
      doc.body.classList.toggle('nav-condensed', condensed);
      syncNavH();
    }
    var b = doc.getElementById('to-top'); if (b) b.classList.toggle('show', y > 600);
  }
  function mountToTop() {
    if (doc.getElementById('to-top')) return;
    var b = doc.createElement('button');
    b.id = 'to-top'; b.type = 'button'; b.className = 'to-top'; b.setAttribute('aria-label', '回到顶部'); b.title = '回到顶部';
    b.innerHTML = I('arrowUp');
    b.addEventListener('click', function () { global.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); });
    doc.body.appendChild(b);
  }
  function reduced() { return doc.documentElement.classList.contains('reduce-motion') || (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* ---------- 底部 Tab 栏（≤640px 由 CSS 显示）。6 项与顶栏同一组，搜索留在顶栏。 ---------- */
  function renderBottomBar() {
    var el = doc.getElementById('bottom-bar');
    if (!el) { el = doc.createElement('nav'); el.id = 'bottom-bar'; el.className = 'bottom-bar'; el.setAttribute('aria-label', '底部导航'); doc.body.appendChild(el); }
    var Nv = N();
    var loc = Nv.locate ? Nv.locate(String(location.hash || '').replace(/^#/, '')) : { group: null };
    el.innerHTML = (Nv.SITE_NAV || []).map(function (n) {
      var on = loc.group && loc.group.id === n.id;
      return '<a href="' + n.hash + '" data-bb="' + n.id + '"' + (on ? ' class="active" aria-current="page"' : '') + '>' + I(n.icon) + '<span>' + esc(n.short || n.label) + '</span></a>';
    }).join('');
  }

  /* ---------- 页面淡入 ---------- */
  function fade(panelId) {
    var el = doc.getElementById(panelId); if (!el || reduced()) return;
    el.classList.remove('page-enter'); void el.offsetWidth; el.classList.add('page-enter');
  }

  /* ---------- 全站搜索 ---------- */
  var INDEX = null;
  function build() {
    var D = global.QuestData, Nv = N(), out = [];
    function add(type, title, sub, href, hay, icon) { out.push({ type: type, title: title, sub: sub || '', href: href, icon: icon, hay: (title + ' ' + (sub || '') + ' ' + (hay || '')).toLowerCase() }); }
    var HAY = {
      start: '新手导览',
      war: '实战作战室 作战室',
      work: 'dashboard 下一步 流水线 进度 站点',
      'work-review': '复盘 周报 review 总结 下周计划',
      'me-accounts': 'google gsc ga4 adsense oauth 授权 自动拉取 search console analytics Google 连接',
      'me-analytics': 'csv 导入 search console adsense 小红书 抖音 b站 数据 分析 数据导入中心',
      'me-ai': 'ai api key deepseek openai 通义 kimi 智谱 openrouter 模型 赚钱榜雷达 赚钱项目实施官',
      'war-share': '分享 分发 发帖 x 推特 微博 小红书 知乎 公众号 reddit linkedin pinterest facebook medium telegram whatsapp',
      'war-publish': 'github pages 部署 发布 token pat',
      'war-keywords': '灵感 联想 autocomplete trends datamuse wikipedia hn 关键词灵感',
      pm: '平台变现 流量主 创作激励 分成 副业 新手怎么选',
    };
    function addNav(n) {
      add('页面', n.label, n.desc || '', n.hash, [n.id, HAY[n.id] || ''].join(' '), n.icon);
      (n.children || []).forEach(addNav);
    }
    Nv.SITE_NAV.forEach(addNav);
    add('页面', '关键词灵感', '选词练习板里的免费联想词，勾选后加入候选', '#war-keywords', '灵感 联想', 'tag');
    if (Nv.SITEMAP) add('页面', Nv.SITEMAP.label, Nv.SITEMAP.desc || '', Nv.SITEMAP.hash, 'sitemap 站点地图', Nv.SITEMAP.icon);
    Nv.STATIONS.forEach(function (s) { add('页面', s.name, '7 天作战日程 · Day1–7', s.hash, s.hash === '#war' ? '实战作战室' : '', s.icon); });
    Nv.LIB_CATS.forEach(function (c) { add('页面', '资源库 · ' + c.label, '资源分类', '#lib-' + c.id, '', c.icon); });
    (D.QUESTS || []).forEach(function (q) { var ch = D.getChapter(q.chapterId); add('任务', q.title, (ch ? ch.name : '') + ' · ' + q.action, '#path-quests', [q.tools, q.doneCriteria, q.pitfalls, q.id].join(' '), ch ? ch.icon : 'list'); });
    var catIcon = {}; Nv.LIB_CATS.forEach(function (c) { catIcon[c.id] = c.icon; });
    (D.TRY_CHANNELS || []).forEach(function (c) { add('资源', c.name, c.blurb, '#lib-' + c.cat, [c.how, c.caveat].join(' '), catIcon[c.cat] || 'toolbox'); });
    (D.PEER_METHODS || []).forEach(function (p) { add('资源', p.name, p.oneLiner, '#lib-peers', [p.steal, p.caveat].join(' '), 'users'); });
    if (global.QUEST_PLATFORMS) {
      var PD = global.QUEST_PLATFORMS;
      add('页面', '平台变现 · 国内 + 海外', PD.PLATFORMS.length + ' 个平台的变现方式、门槛、分成与来源', '#pm', '平台变现 流量主 创作激励 分成 副业 新手怎么选', 'wallet');
      PD.CATS.forEach(function (c) { add('页面', '平台变现 · ' + c.label, c.desc, '#pm-' + c.id, '', c.icon); });
      PD.PLATFORMS.forEach(function (p) { add('平台变现', p.name, p.ways, '#pm-' + p.cat + '/' + p.id, [p.gate, p.fit].join(' '), 'coin'); });
    }
    if (global.QuestRank) global.QuestRank.latestItems().forEach(function (it) { add('赚钱榜', 'No.' + it.rank + ' ' + it.name, it.type + ' · ' + it.why, '#war-rank', [it.fit, it.risk, (it.tags || []).join(' '), it.cost].join(' '), 'trophy'); });
    add('赚钱榜', '闲鱼零成本方案', '可零成本起步的闲鱼非实物方案', '#war-rank-xianyu', '闲鱼 零成本 合集 规则', 'fish');
    var col = global.QUEST_COLLECTIONS && global.QUEST_COLLECTIONS['xianyu-zero-cost'];
    if (col) {
      (col.items || []).forEach(function (it) {
        if (!it || !it.name) return;
        add('赚钱榜', it.name, (it.fit || '') + (it.why ? ' · ' + it.why : ''), '#war-rank-xianyu', [it.risk, (it.tags || []).join(' '), it.cost, it.type].join(' '), 'fish');
      });
      (col.rules || []).forEach(function (rule) {
        if (!rule || !rule.text) return;
        add('赚钱榜', '闲鱼规则', rule.text, '#war-rank-xianyu', rule.text, 'fish');
      });
    }
    var MD = global.QUEST_GUIDES_MD || {};
    Nv.GUIDES.forEach(function (g) { add('手册', g.title, g.desc, g.href || '#guide-' + g.id, g.href ? '' : heads(MD[g.id]), g.icon); });
    Nv.DEV_DOCS.forEach(function (d) { add('开发文档', d.title, '开发者文档', '#dev-' + d.id, heads(MD[d.id]), 'code'); });
    return out;
  }
  function heads(md) { return md ? (md.match(/^#{1,3} .+$/gm) || []).join(' ').replace(/#/g, '') + ' ' + md.slice(0, 1500) : ''; }
  function resetIndex() { INDEX = null; }
  function search(q) {
    INDEX = INDEX || build();
    var terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX.filter(function (r) { return terms.every(function (t) { return r.hay.indexOf(t) >= 0; }); })
      .map(function (r) { var tl = r.title.toLowerCase(), s = 0; terms.forEach(function (t) { if (tl.indexOf(t) === 0) s += 6; else if (tl.indexOf(t) >= 0) s += 4; else if (r.sub.toLowerCase().indexOf(t) >= 0) s += 2; }); return { r: r, s: s + (r.type === '页面' ? 1 : 0) }; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 30).map(function (x) { return x.r; });
  }
  function hl(text, q) {
    var t = esc(text); q.toLowerCase().trim().split(/\s+/).filter(Boolean).forEach(function (w) {
      var re = new RegExp('(' + esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); t = t.replace(re, '<mark>$1</mark>');
    }); return t;
  }
  var sel = 0, lastFocus = null;
  function openSearch(prefill) {
    var m = doc.getElementById('search-modal');
    if (!m) {
      m = doc.createElement('div'); m.id = 'search-modal'; m.className = 'search-modal'; m.hidden = true;
      m.innerHTML = '<div class="search-backdrop" data-close-search></div><div class="search-box" role="dialog" aria-modal="true" aria-label="全站搜索">' +
        '<div class="search-input-row">' + I('search') + '<input id="search-input" type="search" placeholder="搜索任务、资源、手册、开发文档…" autocomplete="off" aria-controls="search-results" />' +
        '<kbd>Esc</kbd></div><div id="search-results" class="search-results" role="listbox"></div>' +
        '<div class="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>/</kbd> 或 <kbd>Ctrl</kbd>+<kbd>K</kbd> 随时打开</span></div></div>';
      doc.body.appendChild(m);
      var inp = m.querySelector('#search-input');
      inp.addEventListener('input', function () { sel = 0; renderResults(inp.value); });
      inp.addEventListener('keydown', function (e) {
        var items = m.querySelectorAll('.sr-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); mark(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(items); }
        else if (e.key === 'Enter') { e.preventDefault(); if (items[sel]) items[sel].click(); }
      });
      m.addEventListener('click', function (e) {
        if (e.target.closest('[data-close-search]')) closeSearch();
        var a = e.target.closest('.sr-item'); if (a) { closeSearch(); }
      });
    }
    lastFocus = doc.activeElement;
    m.hidden = false; doc.body.classList.add('search-open');
    var inp2 = m.querySelector('#search-input'); inp2.value = prefill || ''; renderResults(inp2.value); inp2.focus();
  }
  function closeSearch() {
    var m = doc.getElementById('search-modal'); if (!m || m.hidden) return;
    m.hidden = true; doc.body.classList.remove('search-open');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (_) {}
  }
  function mark(items) { items.forEach(function (x, i) { x.classList.toggle('sel', i === sel); x.setAttribute('aria-selected', i === sel); }); if (items[sel]) items[sel].scrollIntoView({ block: 'nearest' }); }
  function renderResults(q) {
    var box = doc.getElementById('search-results');
    if (!q.trim()) {
      box.innerHTML = '<p class="sr-hint">试试：<button type="button" data-q="闲鱼">闲鱼</button><button type="button" data-q="GSC">GSC</button><button type="button" data-q="AdSense">AdSense</button><button type="button" data-q="选词">选词</button><button type="button" data-q="sitemap">sitemap</button></p>';
      box.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { var i = doc.getElementById('search-input'); i.value = b.getAttribute('data-q'); sel = 0; renderResults(i.value); i.focus(); }); });
      return;
    }
    var res = search(q);
    if (!res.length) { box.innerHTML = '<div class="empty-illo">' + global.QuestIcons.illo('search') + '<p><b>没有找到「' + esc(q) + '」</b><br>换个关键词，或少输入几个字试试。</p></div>'; return; }
    var groups = {}, order = ['页面', '平台变现', '赚钱榜', '任务', '资源', '手册', '开发文档'];
    res.forEach(function (r) { (groups[r.type] = groups[r.type] || []).push(r); });
    var html = '';
    order.forEach(function (g) {
      if (!groups[g]) return;
      html += '<div class="sr-group"><h4>' + g + ' <small>' + groups[g].length + '</small></h4>' + groups[g].map(function (r) {
        var ext = /^https?:|\/$/.test(r.href) && r.href.charAt(0) !== '#';
        return '<a class="sr-item" role="option" href="' + esc(r.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '><span class="card-ico">' + I(r.icon) + '</span><span class="sr-text"><b>' + hl(r.title, q) + '</b><small>' + hl(r.sub.slice(0, 80), q) + '</small></span></a>';
      }).join('') + '</div>';
    });
    box.innerHTML = html; mark(box.querySelectorAll('.sr-item'));
  }

  function init() {
    mountToTop();
    var nav = doc.getElementById('site-nav');
    if (nav && global.ResizeObserver) new ResizeObserver(function () { syncNavH(); }).observe(nav);
    else global.addEventListener('resize', syncNavH);
    syncNavH();
    global.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    doc.addEventListener('keydown', function (e) {
      var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openSearch(); return; }
      if (e.key === '/' && !typing) { e.preventDefault(); openSearch(); return; }
      if (e.key === 'Escape') closeSearch();
    });
    doc.addEventListener('click', function (e) { if (e.target.closest('[data-open-search]')) { e.preventDefault(); openSearch(); } });
    global.addEventListener('hashchange', closeSearch);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();

  global.QuestShell = { renderBottomBar: renderBottomBar, fade: fade, openSearch: openSearch, closeSearch: closeSearch, search: search, resetIndex: resetIndex, scrollToEl: scrollToEl, syncNavH: syncNavH };
})(typeof window !== 'undefined' ? window : globalThis);
