/** Phase 21 · 全站助手「问 AI」
 *  对话只存 sessionStorage gefei-quest-chat-v1，不进存档。
 *  已连接自定义服务商时走 QuestAI.chat（可传 opts.system）；否则只检索站内已有资料。 */
(function (global) {
  var STORE = 'gefei-quest-chat-v1';
  var CHIPS = {
    'war-keywords': ['怎么判断一个词值不值得做？', '大站多说明什么？', '搜索量档位怎么选？', '今天先记几个词？'],
    'war-kit': ['title 和描述怎么写才合格？', '四个起步模板怎么选？', '生成的页面还要改什么？'],
    'war-publish': ['发布到 GitHub Pages 要准备什么？', 'Token 应该开哪些权限？', '发布失败先查哪一步？'],
    pm: ['新手怎么选第一个平台？', '分成和门槛以哪里为准？', '哪些做法不能做？'],
    lib: ['免费工具从哪一类开始看？', '托管和域名笔记在哪？', '资源可以怎么筛选？'],
    start: ['学习、做站、赚钱先走哪条？', '前 7 天清单怎么勾？', '新手导览可以重看吗？'],
    home: ['我是新手，今天先做什么？', '这个网站怎么用？', '进度存在哪里？'],
    'me-ai': ['没连 AI 时助手怎么回答？', '自定义服务商要填什么？', 'Key 存在哪里？'],
    work: ['工作台的下一步是什么意思？', '还没登记站点怎么办？', '每个站点看哪几步？'],
    path: ['学习路线按什么顺序走？', '勾选任务代表什么？', '当前章节怎么找？'],
    'war-rank': ['赚钱榜上的条目能保证收入吗？', '怎么把一条加入实操计划？', '先看哪一类渠道？'],
    'war-share': ['分发文案生成后谁去发？', '哪些平台有官方入口？'],
    'work-review': ['每周复盘写哪几项？', '下周 3 件事怎么定？'],
    me: ['等级和 XP 从哪来？', '怎么导出进度备份？', '已完成任务在哪看？'],
    'me-sites': ['站点台账要记哪些？', '月度数据怎么填？'],
    'path-quests': ['任务勾选后会怎样？', '做完一项记在哪里？'],
    guides: ['手册和模板有什么区别？', '站一手册从哪一天开始？'],
    war: ['7 天作战日程的 7 天清单怎么用？', '勾选和任务清单是同一份进度吗？'],
  };
  var GENERIC = ['这个页面是干什么的？', '我下一步可以做什么？', '有没有免费的做法？'];
  var messages = [];
  var pending = null;
  var seq = 0;
  var INDEX = null;
  var fab, panel, input, logEl, stopBtn;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function mobile() {
    try { return global.matchMedia('(max-width: 640px)').matches; } catch (_) { return false; }
  }
  function routeHash() {
    var raw = String(location.hash || '#home').replace(/^#/, '').split('?')[0];
    try { if (global.QuestNav && QuestNav.canonical) raw = QuestNav.canonical(raw); } catch (_) {}
    return raw || 'home';
  }
  function pageTitle() {
    var t = document.title || '';
    if (t) return t;
    try {
      var Nv = global.QuestNav;
      if (Nv && Nv.parse && Nv.navById) {
        var n = Nv.navById(Nv.parse(routeHash()).section);
        if (n && n.label) return n.label;
      }
    } catch (_) {}
    return '出海小站练站营';
  }
  function readSave() {
    try {
      if (global.QuestApp && typeof QuestApp.get === 'function') {
        var live = QuestApp.get();
        if (live && typeof live === 'object') return live;
      }
    } catch (_) {}
    try {
      var raw = localStorage.getItem('gefei-quest-save-v1');
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) { return null; }
  }
  function progressLine() {
    var s = readSave();
    if (!s) return '没有读到存档。';
    var bits = [];
    if (typeof s.xp === 'number') {
      var lv = null;
      try { if (global.QuestProgress && typeof QuestProgress.getLevel === 'function') lv = QuestProgress.getLevel(s.xp); } catch (_) {}
      bits.push(lv == null ? ('XP ' + s.xp) : ('等级 Lv.' + lv + '，XP ' + s.xp));
    }
    if (Array.isArray(s.done)) bits.push('已完成任务 ' + s.done.length);
    if (s.keywords && Array.isArray(s.keywords.items)) bits.push('候选词 ' + s.keywords.items.length);
    if (s.sites && Array.isArray(s.sites.items)) bits.push('站点 ' + s.sites.items.length);
    if (typeof s.streak === 'number') bits.push('连击 ' + s.streak + ' 天');
    if (Array.isArray(s.rankPlan)) bits.push('实操计划 ' + s.rankPlan.length);
    if (s.kit && typeof s.kit.keyword === 'string' && s.kit.keyword) bits.push('站一主词 ' + s.kit.keyword);
    return bits.length ? bits.join('；') : '存档里没有可摘要的进度字段。';
  }
  function systemPrompt() {
    var base = (global.QuestAI && QuestAI.SYSTEM) || '';
    return base + '\n\n当前路由：#' + routeHash() + '\n页面标题：' + pageTitle() + '\n存档进度：' + progressLine() + '\n只根据上面的进度数字说话，没有的字段不要编。';
  }

  function loadChat() {
    try {
      var arr = JSON.parse(sessionStorage.getItem(STORE) || '[]');
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (m) {
        return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
      }).map(function (m) {
        return { role: m.role, content: m.content, mode: typeof m.mode === 'string' ? m.mode : '' };
      }).slice(-40);
    } catch (_) { return []; }
  }
  function saveChat() {
    try { sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-40))); } catch (_) {}
  }
  function chipsFor(hash) { return CHIPS[hash] || GENERIC; }

  function plain(s) {
    return String(s || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#>*_`|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function hashHref(h) {
    h = String(h || '');
    if (h.charAt(0) !== '#' || /[\s"'<>]/.test(h)) return '';
    return h;
  }
  function addChunks(list, title, href, raw, extra) {
    href = hashHref(href);
    if (!href) return;
    var text = plain(raw);
    if (text.length < 8) return;
    var size = 420, step = 320, i;
    var row = function (t) {
      var o = { title: title, text: t, href: href };
      if (extra && extra.sources) o.sources = extra.sources;
      return o;
    };
    if (text.length <= size) { list.push(row(text)); return; }
    for (i = 0; i < text.length; i += step) {
      list.push(row(text.slice(i, i + size)));
      if (i + size >= text.length) break;
    }
  }
  function addMd(list, baseTitle, href, md) {
    var parts = String(md || '').replace(/\r/g, '').split(/\n(?=#{1,3}\s)/);
    parts.forEach(function (part) {
      var m = part.match(/^#{1,3}\s+(.+)$/m);
      var head = m ? plain(m[1]) : '';
      var title = head ? (baseTitle + ' · ' + head) : baseTitle;
      addChunks(list, title, href, part);
    });
  }
  function docHref(id) {
    var Nv = global.QuestNav;
    try {
      if (Nv && Nv.isDevId && Nv.isDevId(id)) return '#dev-' + id;
      var g = Nv && Nv.guideById && Nv.guideById(id);
      if (g && g.href && String(g.href).charAt(0) !== '#') return '#guides';
    } catch (_) {}
    return '#guide-' + id;
  }
  function docTitle(id) {
    var Nv = global.QuestNav;
    try {
      if (Nv && Nv.isDevId && Nv.isDevId(id)) {
        var d = (Nv.DEV_DOCS || []).filter(function (x) { return x.id === id; })[0];
        return d && d.title ? d.title : id;
      }
      var g = Nv && Nv.guideById && Nv.guideById(id);
      if (g && g.title) return g.title;
    } catch (_) {}
    return id;
  }
  function buildIndex() {
    var list = [];
    var md = global.QUEST_GUIDES_MD || {};
    Object.keys(md).forEach(function (id) {
      try { addMd(list, docTitle(id), docHref(id), md[id]); } catch (_) {}
    });
    var faq = (global.QuestHome && QuestHome.FAQ) || [];
    faq.forEach(function (qa) {
      if (!qa || !qa[0]) return;
      addChunks(list, String(qa[0]), '#home-faq', String(qa[0]) + ' ' + String(qa[1] || ''));
    });
    var hints = (global.QuestHints && QuestHints.HINTS) || {};
    Object.keys(hints).forEach(function (key) {
      var spec = hints[key];
      if (!spec) return;
      addChunks(list, spec.what || key, '#' + key, (spec.what || '') + (spec.go ? ' 第一步：' + spec.go : ''));
    });
    var PD = global.QUEST_PLATFORMS;
    if (PD) {
      (PD.CATS || []).forEach(function (c) {
        addChunks(list, c.label || c.id, '#pm-' + c.id, (c.label || '') + ' ' + (c.desc || ''));
      });
      (PD.GUIDE || []).forEach(function (row) {
        if (!row) return;
        addChunks(list, row[0] || '新手怎么选', '#pm', (row[0] || '') + ' ' + (row[1] || ''));
      });
      (PD.PLATFORMS || []).forEach(function (p) {
        if (!p || !p.id) return;
        var rules = (p.rules || []).map(function (r) { return r && r[0]; }).filter(Boolean).join(' ');
        var steps = (p.steps || []).join(' ');
        var src = null;
        try {
          if (global.QuestSources && p.src && p.src.length) {
            var own = QuestSources.ownHostsOf(p.src.map(function (s) { return s[1]; }));
            src = p.src.map(function (s) {
              var o = QuestSources.fromLegacy(s[1], p.up || '');
              o.title = s[0] || '';
              if (QuestSources.isOwnHost(s[1], own)) { o.kind = 'official'; o.publisher = p.name || o.publisher; }
              return o;
            });
          }
        } catch (_) {}
        addChunks(list, p.name || p.id, '#pm-' + p.cat + '/' + p.id, [p.name, p.ways, p.gate, p.fit, p.risk, p.access, p.payout, rules, steps].filter(Boolean).join('\n'), src ? { sources: src } : null);
      });
    }
    var tools = global.QuestTools;
    if (tools) {
      (tools.TEMPLATES || []).forEach(function (t) {
        addChunks(list, t.name || t.id, '#war-kit', (t.name || '') + ' ' + (t.desc || '') + ' 起步模板');
      });
      if (tools.FORMULA) addChunks(list, '评分怎么算', '#war-keywords', tools.FORMULA);
    }
    var rank = global.QUEST_RANK || {};
    var day = rank.latest && rank.days && rank.days[rank.latest];
    if (day && Array.isArray(day.items)) {
      day.items.forEach(function (it) {
        if (!it) return;
        var src = null;
        try { if (global.QuestSources) src = QuestSources.of(it, day.date); } catch (_) {}
        addChunks(
          list,
          '赚钱榜 No.' + it.rank + ' ' + (it.name || ''),
          '#war-rank',
          [it.name, it.type, it.why, it.fit, it.risk, (it.steps || []).join(' ')].filter(Boolean).join('\n'),
          src && src.length ? { sources: src } : null
        );
      });
    }
    var cols = global.QUEST_COLLECTIONS || {};
    var col = cols['xianyu-zero-cost'];
    if (col) {
      if (col.intro) addChunks(list, col.title || '闲鱼零成本方案', '#war-rank-xianyu', col.intro);
      (col.items || []).forEach(function (it) {
        if (!it || !it.name) return;
        var src = null;
        try { if (global.QuestSources) src = QuestSources.of(it, col.updated || ''); } catch (_) {}
        addChunks(
          list,
          it.name,
          '#war-rank-xianyu',
          [it.fit, it.why].filter(Boolean).join('\n'),
          src && src.length ? { sources: src } : null
        );
      });
      (col.rules || []).forEach(function (rule) {
        if (!rule || !rule.text) return;
        addChunks(list, rule.text, '#war-rank-xianyu', rule.text, rule.sources && rule.sources.length ? { sources: rule.sources } : null);
      });
    }
    return list;
  }
  function termsOf(query) {
    var q = String(query || '').trim();
    if (!q) return [];
    var terms = [], seen = {};
    function add(t) {
      t = String(t || '').toLowerCase();
      if (t.length < 2 || seen[t]) return;
      seen[t] = 1;
      terms.push(t);
    }
    var latin = q.match(/[a-z0-9][a-z0-9+#.\-]*/ig) || [];
    latin.forEach(add);
    var zh = q.replace(/[a-z0-9+#.\-]+/ig, '').replace(/[^\u4e00-\u9fff]/g, '');
    var i;
    for (i = 0; i < zh.length - 1; i++) add(zh.slice(i, i + 2));
    return terms;
  }
  function snippet(text, terms) {
    var lower = text.toLowerCase();
    var at = -1, i;
    for (i = 0; i < terms.length; i++) {
      var p = lower.indexOf(terms[i]);
      if (p >= 0 && (at < 0 || p < at)) at = p;
    }
    if (at < 0) at = 0;
    var start = Math.max(0, at - 16);
    var slice = text.slice(start, start + 120).replace(/\s+/g, ' ').trim();
    if (start > 0) slice = '…' + slice;
    if (start + 120 < text.length) slice += '…';
    return slice;
  }
  function resetIndex() { INDEX = null; }
  function entries() {
    if (!INDEX) INDEX = buildIndex();
    return INDEX;
  }
  function search(query) {
    var terms = termsOf(query);
    if (!terms.length) return [];
    if (!INDEX) INDEX = buildIndex();
    var scored = [];
    var i, t;
    for (i = 0; i < INDEX.length; i++) {
      var e = INDEX[i];
      var titleL = e.title.toLowerCase();
      var textL = e.text.toLowerCase();
      var score = 0, hit = 0;
      for (t = 0; t < terms.length; t++) {
        var term = terms[t];
        var inTitle = titleL.indexOf(term) >= 0;
        var inText = textL.indexOf(term) >= 0;
        if (!inTitle && !inText) continue;
        hit++;
        if (inTitle) score += 3;
        if (inText) score += 1;
      }
      if (hit > 0) scored.push({ e: e, score: score, hit: hit });
    }
    scored.sort(function (a, b) { return (b.hit - a.hit) || (b.score - a.score); });
    var user = [], dev = [];
    scored.forEach(function (x) { (x.e.href.indexOf('#dev-') === 0 ? dev : user).push(x); });
    var out = [], seen = {};
    function pushFrom(list) {
      var n;
      for (n = 0; n < list.length && out.length < 3; n++) {
        var href = list[n].e.href;
        if (seen[href]) continue;
        seen[href] = 1;
        var hit = { title: list[n].e.title, text: list[n].e.text, href: href, snippet: snippet(list[n].e.text, terms) };
        if (list[n].e.sources && list[n].e.sources.length) hit.sources = list[n].e.sources;
        out.push(hit);
      }
    }
    pushFrom(user);
    pushFrom(dev);
    return out;
  }
  function mdLabel(s) {
    return String(s || '相关资料').replace(/[\[\]\(\)]/g, '').replace(/\s+/g, ' ').trim() || '相关资料';
  }
  function offlineMd(query) {
    var hits = search(query);
    var lines = ['**站内资料检索（未连接 AI）**', ''];
    if (!hits.length) {
      lines.push('站内资料里没有找到和这个问题对应的内容。');
      lines.push('');
      lines.push('[连接 AI 服务商](#me-ai)');
      return lines.join('\n');
    }
    hits.forEach(function (h) {
      lines.push('[' + mdLabel(h.title) + '](' + h.href + ')');
      lines.push('');
      lines.push(h.snippet);
      lines.push('');
    });
    lines.push('[连接 AI 服务商](#me-ai)');
    return lines.join('\n');
  }

  function renderMd(text) {
    if (global.QuestAI && typeof QuestAI.md === 'function') return QuestAI.md(text || '');
    return esc(text).replace(/\n/g, '<br>');
  }
  function renderLog() {
    if (!logEl) return;
    if (!messages.length) {
      logEl.innerHTML = '<p class="qa-empty">输入问题，或点一个快捷问题。</p>';
      return;
    }
    logEl.innerHTML = messages.map(function (m) {
      if (m.role === 'user') return '<div class="qa-msg qa-user">' + esc(m.content).replace(/\n/g, '<br>') + '</div>';
      var extra = '';
      if (m.hits && global.QuestSources) {
        m.hits.forEach(function (h) {
          var src = h && h.sources;
          if ((!src || !src.length) && h && h.href === '#war-rank' && global.QuestRank) {
            var items = QuestRank.latestItems() || [];
            var it = items.filter(function (x) { return h.title && x.name && h.title.indexOf(x.name) >= 0; })[0] || items[0];
            if (it) src = QuestSources.of(it);
          }
          if (src && src.length) extra += QuestSources.render(src, { compact: true });
        });
      }
      return '<div class="qa-msg qa-bot"><div class="qa-body md">' + renderMd(m.content) + extra + '</div></div>';
    }).join('');
    logEl.scrollTop = logEl.scrollHeight;
  }
  function paintLast() {
    if (!logEl) return;
    var nodes = logEl.querySelectorAll('.qa-bot .qa-body');
    var last = nodes[nodes.length - 1];
    var msg = messages[messages.length - 1];
    if (!last || !msg) { renderLog(); return; }
    last.innerHTML = renderMd(msg.content || '……');
    logEl.scrollTop = logEl.scrollHeight;
  }
  function renderChips() {
    var box = panel && panel.querySelector('.qa-chips');
    if (!box) return;
    var list = chipsFor(routeHash());
    box.innerHTML = list.map(function (q) {
      return '<button type="button" class="chip" data-q="' + esc(q) + '">' + esc(q) + '</button>';
    }).join('');
  }
  function syncModal() {
    if (!panel || panel.hidden) return;
    if (mobile()) panel.setAttribute('aria-modal', 'true');
    else panel.removeAttribute('aria-modal');
  }
  function focusables() {
    if (!panel) return [];
    return [].slice.call(panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])')).filter(function (el) {
      if (el.hidden || (el.closest && el.closest('[hidden]'))) return false;
      var st = global.getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden';
    });
  }
  function showStop(on) { if (stopBtn) stopBtn.hidden = !on; }

  function open() {
    if (!panel || !fab) return;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('qa-open');
    syncModal();
    renderChips();
    if (input) { try { input.focus(); } catch (_) {} }
  }
  function close() {
    if (!panel || !fab || panel.hidden) return;
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('qa-open');
    panel.removeAttribute('aria-modal');
    try { fab.focus(); } catch (_) {}
  }
  function apiMessages() {
    var list = [];
    messages.forEach(function (m) {
      if ((m.role === 'user' || m.role === 'assistant') && m.content) list.push({ role: m.role, content: m.content });
    });
    return list.slice(-10);
  }
  function finish(mySeq, text) {
    if (mySeq !== seq) return text || '';
    var last = messages[messages.length - 1];
    if (last && last.role === 'assistant') last.content = text || last.content || '';
    pending = null;
    showStop(false);
    saveChat();
    renderLog();
    return (messages[messages.length - 1] && messages[messages.length - 1].content) || '';
  }
  function sendOffline(text, mySeq) {
    var hits = search(text);
    var body = offlineMd(text);
    messages.push({ role: 'assistant', content: body, mode: 'offline', hits: hits });
    return Promise.resolve(finish(mySeq, body));
  }
  function sendCustom(mySeq) {
    messages.push({ role: 'assistant', content: '', mode: 'custom' });
    renderLog();
    showStop(true);
    var req = global.QuestAI.chat(apiMessages(), {
      system: systemPrompt(),
      onDelta: function (_delta, full) {
        if (mySeq !== seq) return;
        var last = messages[messages.length - 1];
        if (last && last.role === 'assistant') last.content = full || '';
        paintLast();
      },
    });
    pending = req;
    return req.then(function (full) {
      return finish(mySeq, full || '（模型没有返回内容）');
    }, function (e) {
      if (mySeq !== seq) return '';
      var last = messages[messages.length - 1];
      var aborted = e && e.name === 'AbortError';
      var text = aborted
        ? ((last && last.content) ? last.content : '（已停止）')
        : ('请求没有完成：' + ((e && e.message) || '未知错误'));
      return finish(mySeq, text);
    });
  }
  function ask(text) {
    text = String(text == null ? '' : text).trim();
    if (!text) return Promise.resolve('');
    open();
    if (input) input.value = '';
    var mySeq = ++seq;
    if (pending && pending.abort) {
      try { pending.abort(); } catch (_) {}
      pending = null;
      var tail = messages[messages.length - 1];
      if (tail && tail.role === 'assistant' && !tail.content) messages.pop();
    }
    messages.push({ role: 'user', content: text, mode: 'user' });
    saveChat();
    renderLog();
    var ready = false;
    try { ready = !!(global.QuestAI && QuestAI.ready && QuestAI.ready()); } catch (_) { ready = false; }
    try {
      if (ready && global.QuestAI.chat) return sendCustom(mySeq);
      return sendOffline(text, mySeq);
    } catch (e) {
      return Promise.resolve(finish(mySeq, '请求没有完成：' + (e && e.message ? e.message : '未知错误')));
    }
  }
  function clearChat() {
    seq++;
    if (pending && pending.abort) { try { pending.abort(); } catch (_) {} }
    pending = null;
    showStop(false);
    messages = [];
    try { sessionStorage.setItem(STORE, '[]'); } catch (_) {}
    renderLog();
  }
  function onKey(e) {
    if (!panel || panel.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    var nodes = focusables();
    if (!nodes.length) { e.preventDefault(); return; }
    var first = nodes[0], last = nodes[nodes.length - 1], cur = document.activeElement;
    if (e.shiftKey) {
      if (cur === first || !panel.contains(cur)) { e.preventDefault(); try { last.focus(); } catch (_) {} }
    } else if (cur === last || !panel.contains(cur)) {
      e.preventDefault();
      try { first.focus(); } catch (_) {}
    }
  }
  function mount() {
    if (document.getElementById('qa-fab')) return;
    var ico = global.QuestIcons ? QuestIcons.svg('sparkle') : '';
    fab = document.createElement('button');
    fab.id = 'qa-fab';
    fab.type = 'button';
    fab.className = 'qa-fab';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'qa-panel');
    fab.setAttribute('aria-label', '问 AI');
    fab.setAttribute('title', '问 AI');
    fab.innerHTML = ico + '<span>问 AI</span>';
    panel = document.createElement('div');
    panel.id = 'qa-panel';
    panel.className = 'qa-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '问 AI');
    panel.hidden = true;
    panel.innerHTML =
      '<header class="qa-head"><h2>问 AI</h2><button type="button" class="qa-close" aria-label="关闭">×</button></header>' +
      '<p class="qa-sub">结合当前页面。没连接服务商时，只检索站内已有资料，不编内容。</p>' +
      '<div class="qa-chips" role="group" aria-label="快捷问题"></div>' +
      '<div class="qa-log" id="qa-log" aria-live="polite"></div>' +
      '<form class="qa-form">' +
      '<input id="qa-input" class="qa-input" type="text" maxlength="500" placeholder="问这个页面相关的问题" aria-label="问题" autocomplete="off" />' +
      '<div class="qa-actions"><button type="submit" class="btn btn-primary btn-sm">发送</button>' +
      '<button type="button" class="btn btn-sm qa-clear">清空对话</button>' +
      '<button type="button" class="btn btn-sm qa-stop" hidden>停止</button></div></form>';
    document.body.appendChild(panel);
    document.body.appendChild(fab);
    input = panel.querySelector('#qa-input');
    logEl = panel.querySelector('#qa-log');
    stopBtn = panel.querySelector('.qa-stop');
    messages = loadChat();
    renderChips();
    renderLog();
    fab.addEventListener('click', function () {
      if (panel.hidden) open(); else close();
    });
    panel.querySelector('.qa-close').addEventListener('click', close);
    panel.querySelector('.qa-clear').addEventListener('click', clearChat);
    stopBtn.addEventListener('click', function () { if (pending && pending.abort) pending.abort(); });
    panel.querySelector('.qa-form').addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input.value).catch(function () {});
    });
    panel.querySelector('.qa-chips').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-q]');
      if (!b) return;
      ask(b.getAttribute('data-q')).catch(function () {});
    });
    panel.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || !panel.contains(a)) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#' && mobile()) close();
    });
    document.addEventListener('keydown', onKey, true);
    global.addEventListener('hashchange', function () { renderChips(); });
    global.addEventListener('resize', syncModal);
  }
  function init() { mount(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  global.QuestAssistant = { open: open, close: close, ask: ask, search: search, entries: entries, resetIndex: resetIndex };
})(typeof window !== 'undefined' ? window : globalThis);
