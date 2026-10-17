/** Phase 19 · 关键词灵感（#war-keywords 页内标签）
 *  浏览器直接请求有 CORS 的免费接口；Google / Reddit / Product Hunt 只给链接和复制。
 *  多词种子：Datamuse rel_trg（末词）+ topics（其余词）与 ml，拼成「种子词 + 相关词」。
 *  单词种子：另外请求 sug，原样放在长尾组合前面。Wikipedia 用全文搜索 list=search。
 *  测试可把 localStorage gefei-quest-ideas-cfg 设为 {base:"http://127.0.0.1:8769"} 改 API 根。
 *  加入候选词写入 state.keywords.items（QuestTools.newKeyword）；存档只追加 state.ideas。
 *  接口返回的字符串只经 esc 写入 HTML，摘要用 textContent，不用 innerHTML 塞接口原文。 */
(function (global) {
  var I = function (n) { return global.QuestIcons ? global.QuestIcons.svg(n) : ''; };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
  var ERR = '暂时取不到，可稍后再试或用下面的链接手动查';
  var TAILS = ['for', 'vs', 'free', 'online', 'alternative'];
  var STOP = { the: 1, a: 1, an: 1, to: 1, of: 1, and: 1, or: 1, in: 1, on: 1, for: 1, with: 1, into: 1, is: 1, are: 1, be: 1, it: 1, this: 1, that: 1, '.': 1 };
  var ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  var mem = { seed: '', msg: '', az: [], checked: {}, seq: 0, abort: null, cols: { dm: { state: 'idle' }, wiki: { state: 'idle' }, hn: { state: 'idle' } } };

  function roots() {
    var base = '';
    try {
      var raw = localStorage.getItem('gefei-quest-ideas-cfg');
      if (raw) { var j = JSON.parse(raw); if (j && j.base) base = String(j.base).replace(/\/+$/, ''); }
    } catch (_) {}
    if (base) return { sug: base + '/datamuse/sug', words: base + '/datamuse/words', wiki: base + '/wiki/w/api.php', hn: base + '/hn/api/v1/search' };
    return { sug: 'https://api.datamuse.com/sug', words: 'https://api.datamuse.com/words', wiki: 'https://en.wikipedia.org/w/api.php', hn: 'https://hn.algolia.com/api/v1/search' };
  }
  function seedInfo(seed) {
    var display = String(seed || '').trim().replace(/\s+/g, ' ');
    var parts = display ? display.split(' ') : [];
    var set = {};
    parts.forEach(function (p) { set[p.toLowerCase()] = 1; });
    return { display: display, parts: parts, set: set, low: display.toLowerCase(), multi: parts.length > 1 };
  }
  function urls(seed) {
    var r = roots(), info = seedInfo(seed), q = encodeURIComponent(info.display);
    var last = info.parts.length ? info.parts[info.parts.length - 1] : '';
    var others = info.parts.slice(0, -1).join(' ');
    var o = {
      ml: r.words + '?ml=' + q + '&max=20',
      wiki: r.wiki + '?action=query&list=search&srsearch=' + q + '&srlimit=10&format=json&origin=*',
      hn: r.hn + '?query=' + q + '&tags=story&hitsPerPage=10',
    };
    if (info.multi && last) o.trg = r.words + '?rel_trg=' + encodeURIComponent(last) + '&topics=' + encodeURIComponent(others) + '&max=20';
    else o.sug = r.sug + '?s=' + q + '&max=10';
    return o;
  }
  function gSearch(q) { return 'https://www.google.com/search?q=' + encodeURIComponent(q); }
  function trendsUrl(q) { return 'https://trends.google.com/trends/explore?q=' + encodeURIComponent(q); }
  function redditUrl(q) { return 'https://www.reddit.com/search/?q=' + encodeURIComponent(q); }
  function phUrl(q) { return 'https://www.producthunt.com/search?q=' + encodeURIComponent(q); }
  function wikiHref(title) {
    var t = String(title || '').trim().replace(/ /g, '_');
    if (!t) return '';
    return 'https://en.wikipedia.org/wiki/' + encodeURIComponent(t);
  }
  function decodeEntities(s) {
    return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (all, ent) {
      if (ent.charAt(0) !== '#') { var v = ENT[ent.toLowerCase()]; return v == null ? all : v; }
      var hex = ent.charAt(1) === 'x' || ent.charAt(1) === 'X';
      var n = parseInt(hex ? ent.slice(2) : ent.slice(1), hex ? 16 : 10);
      if (!isFinite(n) || n <= 0 || n > 0xFFFF) return all;
      return String.fromCharCode(n);
    });
  }
  function stripHtml(s) {
    var t = String(s == null ? '' : s);
    t = t.replace(/<\s*\/?\s*[a-zA-Z][^>]*>/g, '');
    t = t.replace(/<\s*\/?\s*[a-zA-Z][^>]*$/g, '');
    t = decodeEntities(t);
    return t.replace(/\s+/g, ' ').trim();
  }
  function bannedWord(word, info) {
    var raw = String(word || '').trim().toLowerCase();
    if (!raw || STOP[raw] || info.set[raw] || raw === info.low) return true;
    var c = raw.replace(/^\.+|\.+$/g, '').trim();
    if (!c || c !== raw && (STOP[c] || info.set[c] || c === info.low)) return true;
    return false;
  }
  function scoreOf(it) { var n = Number(it && it.score); return isFinite(n) ? n : 0; }
  function dmItems(seed, rs) {
    var info = seedInfo(seed), sug = [], best = {}, any = false;
    rs.forEach(function (r) {
      if (!r.ok || !Array.isArray(r.d)) return;
      any = true;
      if (r.kind === 'sug') {
        r.d.forEach(function (it) {
          var w = it && it.word != null ? String(it.word).trim() : '';
          if (w) sug.push(w);
        });
        return;
      }
      r.d.forEach(function (it) {
        if (!it || it.word == null) return;
        var word = String(it.word).trim();
        if (!word) return;
        var key = word.toLowerCase(), sc = scoreOf(it);
        if (!best[key] || sc > best[key].score) best[key] = { word: word, score: sc };
      });
    });
    if (!any) return null;
    var ranked = [];
    Object.keys(best).forEach(function (k) { if (!bannedWord(best[k].word, info)) ranked.push(best[k]); });
    ranked.sort(function (a, b) { return b.score - a.score || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0); });
    if (ranked.length > 15) ranked.length = 15;
    var seen = {}, items = [];
    function push(p) { var k = String(p || '').toLowerCase(); if (!p || seen[k]) return; seen[k] = 1; items.push(p); }
    sug.slice(0, 10).forEach(push);
    ranked.forEach(function (it) { push(info.display + ' ' + it.word); });
    return items;
  }
  function azLines(seed) {
    var s = String(seed || '').trim(), out = [], i;
    for (i = 0; i < 26; i++) out.push(s + ' ' + String.fromCharCode(97 + i));
    for (i = 0; i < TAILS.length; i++) out.push(s + ' ' + TAILS[i]);
    return out;
  }
  function fetchJson(url, parent) {
    var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, 8000);
    function onParent() { ctrl.abort(); }
    if (parent) { if (parent.aborted) ctrl.abort(); else parent.addEventListener('abort', onParent); }
    function done() { clearTimeout(timer); if (parent) parent.removeEventListener('abort', onParent); }
    return fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) { done(); return data; }, function (err) { done(); throw err; });
  }
  function copyText(t) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); return ok;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return fallback(); });
    } catch (_) {}
    return Promise.resolve(fallback());
  }
  function toast(t) { if (global.QuestModal && global.QuestModal.showToast) global.QuestModal.showToast(t); }
  function ensureIdeas(state) {
    var ideas = state.ideas;
    if (!ideas || typeof ideas !== 'object' || Array.isArray(ideas)) ideas = {};
    if (typeof ideas.lastSeed !== 'string') ideas.lastSeed = '';
    if (!Array.isArray(ideas.history)) ideas.history = [];
    state.ideas = ideas;
    return ideas;
  }
  function trimHistory(ideas) { if (ideas.history.length > 20) ideas.history.length = 20; }
  function rememberSearch(state, seed) {
    var ideas = ensureIdeas(state);
    ideas.lastSeed = seed;
    ideas.history.unshift({ seed: seed, at: Date.now(), added: 0 });
    trimHistory(ideas);
  }
  function rememberAdd(state, seed, n) {
    var ideas = ensureIdeas(state);
    ideas.lastSeed = seed;
    var top = ideas.history[0];
    if (top && top.seed === seed) top.added = (Number(top.added) || 0) + n;
    else { ideas.history.unshift({ seed: seed, at: Date.now(), added: n }); trimHistory(ideas); }
  }
  function ext(href, label) { return '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(label) + '</a>'; }
  function currentPhrases() {
    var list = [];
    var dm = mem.cols.dm;
    if (dm && dm.state === 'ok' && dm.items) dm.items.forEach(function (w) { list.push(w); });
    var wiki = mem.cols.wiki;
    if (wiki && wiki.state === 'ok' && wiki.items) wiki.items.forEach(function (it) { list.push(it.title); });
    (mem.az || []).forEach(function (line) { list.push(line); });
    return list;
  }
  function renderedChecked() {
    var n = 0;
    currentPhrases().forEach(function (p) { if (mem.checked[p]) n++; });
    return n;
  }
  function chip(phrase) {
    var on = mem.checked[phrase] ? ' checked' : '';
    return '<label class="idea-chip"><input type="checkbox" class="idea-chk" value="' + esc(phrase) + '"' + on + ' /><span>' + esc(phrase) + '</span></label>';
  }
  function colBody(key) {
    var col = mem.cols[key] || { state: 'idle' };
    if (col.state === 'loading') return '<p class="idea-status">正在获取…</p>';
    if (col.state === 'error') return '<p class="idea-status idea-err">' + ERR + '</p>';
    if (col.state === 'idle') return '<p class="idea-status">点「找灵感」后显示在这里。</p>';
    if (col.state === 'empty' || !col.items || !col.items.length) return '<p class="idea-status">没有找到相关结果。</p>';
    if (key === 'hn') {
      return col.items.map(function (h) {
        var id = h.objectID == null ? '' : String(h.objectID);
        var title = h.title == null ? '' : String(h.title);
        var href = id ? 'https://news.ycombinator.com/item?id=' + encodeURIComponent(id) : '';
        var link = href ? ext(href, title) : '<span>' + esc(title) + '</span>';
        var pts = h.points == null || h.points === '' ? '' : '<span class="idea-pts">' + esc(String(h.points)) + ' 分</span>';
        return '<div class="idea-hn">' + link + pts + '<button type="button" class="btn btn-sm idea-copy-title" data-title="' + esc(title) + '">复制标题</button></div>';
      }).join('');
    }
    if (key === 'wiki') {
      return '<div class="idea-chips">' + col.items.map(function (it) {
        var title = String(it.title || '');
        var href = wikiHref(title);
        var on = mem.checked[title] ? ' checked' : '';
        var link = href ? ext(href, title) : '<span>' + esc(title) + '</span>';
        var snip = it.snippet ? '<span class="idea-snip"></span>' : '';
        return '<span class="idea-line"><label class="idea-chip"><input type="checkbox" class="idea-chk" value="' + esc(title) + '"' + on + ' />' + link + '</label>' + snip + '</span>';
      }).join('') + '</div>';
    }
    return '<div class="idea-chips">' + col.items.map(function (w) { return chip(w); }).join('') + '</div>';
  }
  function fillSnippets(sec) {
    var wiki = mem.cols.wiki;
    if (!sec || !wiki || wiki.state !== 'ok' || !wiki.items) return;
    var nodes = sec.querySelectorAll('[data-idea-col="wiki"] .idea-snip');
    var n = 0;
    wiki.items.forEach(function (it) {
      if (!it.snippet) return;
      if (nodes[n]) nodes[n].textContent = it.snippet;
      n++;
    });
  }
  function linkHref(id, seed) {
    var s = String(seed || '').trim();
    if (id === 'idea-trends') return s ? trendsUrl(s) : 'https://trends.google.com/trends/explore';
    if (id === 'idea-reddit') return s ? redditUrl(s) : 'https://www.reddit.com/search/';
    return s ? phUrl(s) : 'https://www.producthunt.com/search';
  }
  function viewHtml() {
    var seed = mem.seed || '';
    var n = renderedChecked();
    var az = mem.az || [];
    return '<h2 class="block-title">' + I('bulb') + '关键词灵感</h2>' +
      '<p class="hint">输入英文种子词，从免费公开接口取联想。多词种子会拼成「种子词 + 相关词」。结果只帮你找词，不代表搜索量或排名。Google、Reddit、Product Hunt 只打开官方搜索页。</p>' +
      '<form id="idea-form" class="idea-form" autocomplete="off">' +
      '<label class="fld"><span>英文种子词</span><input id="idea-seed" type="text" placeholder="例：pdf merge" value="' + esc(seed) + '" /></label>' +
      '<button type="submit" class="btn btn-primary btn-sm" id="idea-go">' + I('search') + '找灵感</button></form>' +
      '<div id="idea-results">' +
      '<div class="idea-cols">' +
      '<section class="idea-col" data-idea-col="dm"><h3>' + I('sparkle') + '<span>Datamuse 相关词 → 长尾组合</span></h3><div class="idea-body">' + colBody('dm') + '</div></section>' +
      '<section class="idea-col" data-idea-col="wiki"><h3>' + I('book') + 'Wikipedia 词条</h3><div class="idea-body">' + colBody('wiki') + '</div></section>' +
      '<section class="idea-col" data-idea-col="hn"><h3>' + I('fire') + 'HN 讨论</h3><div class="idea-body">' + colBody('hn') + '</div></section>' +
      '</div>' +
      '<div class="idea-manual"><h3>' + I('external') + '手动查（只打开链接）</h3>' +
      '<div class="idea-links">' +
      ext(linkHref('idea-trends', seed), 'Google Trends').replace('<a ', '<a id="idea-trends" ') +
      ext(linkHref('idea-reddit', seed), 'Reddit 搜索').replace('<a ', '<a id="idea-reddit" ') +
      ext(linkHref('idea-ph', seed), 'Product Hunt').replace('<a ', '<a id="idea-ph" ') +
      '</div></div>' +
      '<div class="idea-az"><h3>Google 自动补全（字母扩展）</h3>' +
      '<p class="hint">下面是「种子词 + a…z」以及 for / vs / free / online / alternative。不请求 Google，复制后自己搜，或点每行打开搜索。</p>' +
      '<div class="tool-actions"><button type="button" class="btn btn-sm" id="idea-copy-az"' + (az.length ? '' : ' disabled') + '>' + I('file') + '复制全部</button></div>' +
      (az.length ? '<ul class="idea-az-list" id="idea-az">' + az.map(function (line) {
        return '<li class="idea-az-row">' + chip(line) + ext(gSearch(line), 'Google') + '</li>';
      }).join('') + '</ul>' : '<p class="idea-status" id="idea-az">先输入种子词并点「找灵感」，这里会列出 26 个字母扩展和 5 个常用后缀。</p>') +
      '</div></div>' +
      '<p id="idea-msg" class="idea-msg" role="status">' + (mem.msg || '') + '</p>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary btn-sm" id="idea-add"' + (n ? '' : ' disabled') + '>加入候选词（' + n + '）</button></div>';
  }
  function checkedCount() { var n = 0; Object.keys(mem.checked).forEach(function (k) { if (mem.checked[k]) n++; }); return n; }
  function paint(sec) {
    if (!sec || !sec.isConnected) sec = document.getElementById('idea-panel');
    if (!sec) return;
    sec.innerHTML = viewHtml();
    fillSnippets(sec);
  }
  function goBoard() {
    var btn = document.querySelector('#tool-body .cx-tabs .cx-tab-btn');
    if (btn) btn.click();
  }
  function addChecked(state, root, ctx, sec) {
    var phrases = [];
    mem.checked = {};
    sec.querySelectorAll('.idea-chk').forEach(function (el) { mem.checked[el.value] = el.checked; if (el.checked) phrases.push(el.value); });
    if (!global.QuestTools || !state.keywords || !Array.isArray(state.keywords.items)) return;
    var items = state.keywords.items, have = {}, n = 0;
    items.forEach(function (k) { have[norm(k.kw)] = 1; });
    phrases.forEach(function (p) {
      var kw = norm(p);
      if (!kw || have[kw]) return;
      have[kw] = 1;
      items.push(global.QuestTools.newKeyword({ kw: kw, src: '联想' }));
      n++;
    });
    var seed = String(mem.seed || '').trim() || (state.ideas && state.ideas.lastSeed) || '';
    rememberAdd(state, seed, n);
    if (ctx && ctx.save) ctx.save();
    mem.msg = '已加入 ' + n + ' 个，<button type="button" class="idea-goto" data-idea-goto="board">去选词练习板打分</button>';
    if (global.QuestTools.renderKeywords) global.QuestTools.renderKeywords(state, root, ctx);
  }
  function dmJob(kind, url, signal) {
    return fetchJson(url, signal).then(function (d) {
      return Array.isArray(d) ? { ok: true, kind: kind, d: d } : { ok: false, kind: kind };
    }, function () { return { ok: false, kind: kind }; });
  }
  function search(seed, state, ctx, sec) {
    seed = String(seed || '').trim().replace(/\s+/g, ' ');
    mem.seed = seed;
    if (!seed) { mem.msg = '请先输入英文种子词。'; mem.az = []; paint(sec); return; }
    if (mem.abort) mem.abort.abort();
    mem.abort = new AbortController();
    var signal = mem.abort.signal, seq = ++mem.seq, u = urls(seed);
    mem.msg = '';
    mem.az = azLines(seed);
    mem.cols.dm = { state: 'loading' };
    mem.cols.wiki = { state: 'loading' };
    mem.cols.hn = { state: 'loading' };
    rememberSearch(state, seed);
    if (ctx && ctx.save) ctx.save();
    paint(sec);
    function alive() { return seq === mem.seq; }
    function show() { if (alive()) paint(document.getElementById('idea-panel')); }
    var jobs = [dmJob('ml', u.ml, signal)];
    if (u.trg) jobs.push(dmJob('trg', u.trg, signal));
    if (u.sug) jobs.push(dmJob('sug', u.sug, signal));
    Promise.all(jobs).then(function (rs) {
      if (!alive()) return;
      var items = dmItems(seed, rs);
      if (!items) mem.cols.dm = { state: 'error' };
      else mem.cols.dm = items.length ? { state: 'ok', items: items } : { state: 'empty' };
      show();
    });
    fetchJson(u.wiki, signal).then(function (d) {
      if (!alive()) return;
      var list = d && d.query && Array.isArray(d.query.search) ? d.query.search : null;
      if (!list) { mem.cols.wiki = { state: 'error' }; show(); return; }
      var seen = {}, items = [];
      list.forEach(function (it) {
        if (!it || it.title == null) return;
        var title = String(it.title).trim();
        if (!title || seen[title]) return;
        seen[title] = 1;
        var snip = stripHtml(it.snippet);
        items.push({ title: title, snippet: snip });
      });
      mem.cols.wiki = items.length ? { state: 'ok', items: items } : { state: 'empty' };
      show();
    }, function () { if (alive()) { mem.cols.wiki = { state: 'error' }; show(); } });
    fetchJson(u.hn, signal).then(function (d) {
      if (!alive()) return;
      var hits = d && Array.isArray(d.hits) ? d.hits.filter(function (h) { return h && h.title != null && String(h.title); }) : null;
      if (!hits) { mem.cols.hn = { state: 'error' }; show(); return; }
      mem.cols.hn = hits.length ? { state: 'ok', items: hits } : { state: 'empty' };
      show();
    }, function () { if (alive()) { mem.cols.hn = { state: 'error' }; show(); } });
  }
  function bind(sec, state, root, ctx) {
    if (sec.__ideaBound) return;
    sec.__ideaBound = 1;
    sec.addEventListener('submit', function (e) {
      if (!e.target || e.target.id !== 'idea-form') return;
      e.preventDefault();
      var input = sec.querySelector('#idea-seed');
      search(input ? input.value : '', state, ctx, sec);
    });
    sec.addEventListener('change', function (e) {
      var el = e.target;
      if (!el || !el.classList || !el.classList.contains('idea-chk')) return;
      mem.checked[el.value] = el.checked;
      var b = sec.querySelector('#idea-add');
      if (!b) return;
      var n = sec.querySelectorAll('.idea-chk:checked').length;
      b.textContent = '加入候选词（' + n + '）';
      b.disabled = n === 0;
    });
    sec.addEventListener('click', function (e) {
      var copyBtn = e.target.closest('.idea-copy-title');
      if (copyBtn) { copyText(copyBtn.getAttribute('data-title') || '').then(function (ok) { toast(ok ? '已复制标题' : '复制失败，请长按标题手动复制'); }); return; }
      if (e.target.closest('#idea-copy-az')) {
        var lines = (mem.az || []).slice();
        if (!lines.length) return;
        copyText(lines.join('\n')).then(function (ok) { toast(ok ? '已复制 ' + lines.length + ' 行' : '复制失败，请手动选择列表'); });
        return;
      }
      if (e.target.closest('[data-idea-goto]')) { goBoard(); return; }
      if (e.target.closest('#idea-add')) { addChecked(state, root, ctx, sec); }
    });
  }
  function mount(state, root, ctx) {
    var wrap = root && root.querySelector ? root.querySelector('.tool-wrap') : null;
    if (!wrap) return;
    if (!mem.seed && state.ideas && state.ideas.lastSeed) mem.seed = state.ideas.lastSeed;
    var sec = document.createElement('section');
    sec.id = 'idea-panel';
    sec.className = 'block glass tool-card idea-panel';
    sec.setAttribute('data-tab', '关键词灵感');
    sec.innerHTML = viewHtml();
    fillSnippets(sec);
    wrap.appendChild(sec);
    bind(sec, state, root, ctx);
  }
  global.QuestIdeas = { mount: mount, urls: urls, azLines: azLines, ERR: ERR, checkedCount: checkedCount };
})(typeof window !== 'undefined' ? window : globalThis);
