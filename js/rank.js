/** Phase 12 · 每日赚钱榜 #war-rank
 *  数据：js/rank-data.js（内嵌近 14 天，file:// 可用）→ 历史更早的日期再 fetch data/rank-history/<date>.json
 *  合集：js/collection-data.js，再 fetch data/collections/<id>.json（QUEST_COLLECTIONS[id] 兜底）
 *  存档追加：rankFav [name] · rankPlan [{name,type,date,steps,source_url,done,key?}]
 *  合集计划的 key 为 <collection-id>:<rank>，只追加字段，不改已有字段名。 */
(function (global) {
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var TYPES = ['羊毛', '副业', '闲鱼非实物', '出海小站', '工具活动', '出海新词', '开发者羊毛', '奖金赛/悬赏', '平台激励', '联盟营销', '案例拆解', '数字产品/接单'];
  var view = { date: null, type: 'all', fav: false, resell: false };
  var COLS = [
    { id: 'xianyu-zero-cost', hash: 'war-rank-xianyu', tab: 'xianyu', label: '闲鱼零成本方案', rulesTitle: '闲鱼规则提醒', icon: 'fish', searchHay: '闲鱼 零成本 合集 规则' },
    { id: 'ai-life-wechat-topics', hash: 'war-rank-ai-life', tab: 'ai-life', label: 'AI生活起号选题', rulesTitle: '合规提醒', icon: 'sparkle', searchHay: 'AI 生活 起号 选题 公众号 合集 规则 提示词' },
  ];
  var colOpen = {};
  var cache = {};
  function R() { return global.QUEST_RANK || { latest: null, dates: [], days: {} }; }
  function QS() { return global.QuestSources; }
  function srcHtml(item, compact, date) {
    var S = QS(); if (!S) return '';
    return S.render(S.of(item, date), { compact: !!compact, date: date });
  }
  function typeClass(t) {
    return 'rank-type-' + String(t || '').replace(/[^\w\u4e00-\u9fa5]+/g, '-');
  }
  function typesIn(day) {
    var present = {}, i, t, out = [];
    (day.items || []).forEach(function (it) { if (it && it.type) present[it.type] = (present[it.type] || 0) + 1; });
    for (i = 0; i < TYPES.length; i++) {
      t = TYPES[i];
      if (present[t]) { out.push(t); delete present[t]; }
    }
    Object.keys(present).forEach(function (k) { out.push(k); });
    return out;
  }
  function ensure(state) {
    if (!Array.isArray(state.rankFav)) state.rankFav = [];
    if (!Array.isArray(state.rankPlan)) state.rankPlan = [];
    return state;
  }
  function getDay(date, cb) {
    var r = R();
    if (r.days[date]) return cb(r.days[date]);
    if (cache[date]) return cb(cache[date]);
    if (!global.fetch) return cb(null);
    fetch('data/rank-history/' + date + '.json').then(function (x) { return x.ok ? x.json() : null; }).then(function (d) { cache[date] = d; cb(d); }).catch(function () { cb(null); });
  }
  var DISCLAIMER = '<div class="rank-disclaimer" role="note">' + '<b>免责声明</b>：本榜单只是对公开、合法渠道的整理和排序，<b>不构成收益承诺，也不保证你能赚到钱</b>。可参与地区、审核标准、费率和规则随时会变，请以各平台官网为准；涉及个人信息与收款前，请先读官方条款。不收录盗版、账号买卖、游戏币点卡、代写、刷量等内容。</div>';
  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return '<span class="rank-diff" aria-label="难度 ' + n + '/5">' + s + '</span>'; }
  function todayShanghai() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { return ''; }
  }
  function hasResell(it) { return !!(it && it.resell && typeof it.resell === 'object' && !Array.isArray(it.resell)); }
  function resellHtml(it) {
    if (!hasResell(it)) return '';
    var rs = it.resell;
    var product = rs.product == null ? '' : String(rs.product);
    var buyers = rs.buyers == null ? '' : String(rs.buyers);
    var exp = rs.expires == null ? '' : String(rs.expires);
    var expHtml = exp ? esc(exp) + (exp < todayShanghai() ? ' <span class="rank-resell-badge">已过期</span>' : '') : '<span class="rank-resell-empty">未写到期日</span>';
    return '<div class="rank-resell" data-resell="1">' +
      '<p class="rank-resell-title">闲鱼方案</p>' +
      '<dl><dt>卖什么:</dt><dd>' + esc(product) + '</dd><dt>卖给谁:</dt><dd>' + esc(buyers) + '</dd><dt>到期下架:</dt><dd>' + expHtml + '</dd></dl>' +
      '<p class="rank-resell-note">只卖原创整理的攻略，不卖账号/券码/代领</p></div>';
  }

  function planHtml(state) {
    ensure(state);
    var P = state.rankPlan;
    return '<section class="block glass tool-card rank-plan cx-fold' + (P.length ? '' : ' cx-fold-open') + '" id="rank-plan"><h2 class="block-title">' + I('list') + '我的实操计划 <small>' + P.filter(function (p) { return p.done; }).length + '/' + P.length + ' 已完成</small></h2>' +
      (P.length ? '<ul class="plan-list">' + P.map(function (p, i) {
        return '<li class="plan-item' + (p.done ? ' done' : '') + '" data-plan="' + esc(p.name) + '"><label><input type="checkbox" data-plan-done="' + i + '"' + (p.done ? ' checked' : '') + ' /> <b>' + esc(p.name) + '</b></label>' +
          '<small>' + esc(p.type) + ' · 加入于 ' + esc(p.date) + (p.steps && p.steps[0] ? ' · 第一步：' + esc(p.steps[0]) : '') + '</small>' +
          srcHtml(p, true, p.date) +
          '<span class="plan-acts"><button type="button" class="btn btn-sm btn-ghost" data-plan-del="' + i + '" aria-label="移出计划">移出</button></span></li>';
      }).join('') + '</ul>' : '<div class="tool-empty"><p>还没有计划。下一步：到每日赚钱榜挑 1 条，点「加入实操计划」，先试一周。</p><a class="btn btn-primary btn-sm" href="#war-rank">去每日赚钱榜</a></div>') +
      '</section>';
  }
  function bindPlan(state, root, ctx) {
    root.querySelectorAll('[data-plan-done]').forEach(function (c) { c.addEventListener('change', function () { state.rankPlan[+c.getAttribute('data-plan-done')].done = c.checked; ctx.save(); ctx.rerender(); }); });
    root.querySelectorAll('[data-plan-del]').forEach(function (b) { b.addEventListener('click', function () { state.rankPlan.splice(+b.getAttribute('data-plan-del'), 1); ctx.save(); ctx.rerender(); }); });
  }

  function card(it, state, date, opts) {
    opts = opts || {};
    var planKey = opts.planKey || '';
    var extra = opts.extraClass ? ' ' + opts.extraClass : '';
    var fav = state.rankFav.indexOf(it.name) >= 0;
    var planned = planKey
      ? state.rankPlan.some(function (p) { return p.key === planKey; })
      : state.rankPlan.some(function (p) { return !p.key && p.name === it.name; });
    var S = QS();
    var face = S ? '<div class="rank-face-src qs-oneline">' + S.render(it.sources, { compact: true }) + '</div>' : '';
    return '<article class="rank-card glass' + (hasResell(it) ? ' has-resell' : '') + extra + '" data-rank="' + it.rank + '" data-difficulty="' + it.difficulty + '" data-type="' + esc(it.type) + '">' +
      '<div class="rank-head"><span class="rank-no rank-no-' + Math.min(it.rank, 4) + '">' + it.rank + '</span><div class="rank-title"><h3>' + esc(it.name) + '</h3>' +
      '<p><span class="pill" data-type="' + esc(it.type) + '">' + esc(it.type) + '</span> ' + stars(it.difficulty) + ' <span class="rank-cost">' + I('coin') + esc(it.cost) + '</span></p>' +
      face + resellHtml(it) + '</div>' +
      '<button type="button" class="rank-fav' + (fav ? ' on' : '') + '" data-fav="' + esc(it.name) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? '取消收藏' : '收藏') + '">' + I('star') + '</button></div>' +
      '<p class="rank-why">' + esc(it.why) + '</p>' +
      '<dl class="rank-meta"><dt>适合谁</dt><dd>' + esc(it.fit) + '</dd><dt>风险</dt><dd class="rank-risk">' + esc(it.risk) + '</dd></dl>' +
      '<details class="rank-steps"><summary>怎么开始（' + it.steps.length + ' 步）</summary><ol>' + it.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></details>' +
      '<div class="rank-foot">' + srcHtml(it, false, date) +
      '<span class="rank-tags">' + (it.tags || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('') + '</span>' +
      '<span class="tool-actions">' +
      '<button type="button" class="btn btn-sm ' + (planned ? 'btn-ghost' : 'btn-primary') + '" data-plan-add="' + it.rank + '"' + (planned ? ' disabled' : '') + '>' + (planned ? '已在计划中' : '加入实操计划') + '</button></span></div></article>';
  }

  function hashNow() {
    var h = '';
    try { h = String(location.hash || '').replace(/^#/, '').split('?')[0]; } catch (e) {}
    if (global.QuestNav && QuestNav.canonical) { try { h = QuestNav.canonical(h); } catch (e2) {} }
    return h;
  }
  function colByHash(h) {
    h = h || hashNow();
    var i;
    for (i = 0; i < COLS.length; i++) if (COLS[i].hash === h) return COLS[i];
    return null;
  }
  function colById(id) {
    var i;
    for (i = 0; i < COLS.length; i++) if (COLS[i].id === id) return COLS[i];
    return null;
  }
  function switchHtml(which) {
    var html = '<nav class="rank-switch" aria-label="榜单内容">' +
      '<a class="rank-switch-btn' + (which === 'top' ? ' active' : '') + '" href="#war-rank"' + (which === 'top' ? ' aria-current="page"' : '') + '>每日 Top 10</a>';
    COLS.forEach(function (c) {
      var on = which === c.tab;
      html += '<a class="rank-switch-btn' + (on ? ' active' : '') + '" href="#' + c.hash + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(c.label) + '</a>';
    });
    return html + '</nav>';
  }
  function colBundle(id) {
    var all = global.QUEST_COLLECTIONS || {};
    return all[id] || null;
  }
  function sortCol(items) {
    return (items || []).slice().sort(function (a, b) {
      var d = (a.difficulty || 0) - (b.difficulty || 0);
      if (d) return d;
      return (a.rank || 0) - (b.rank || 0);
    });
  }
  function paintCollection(state, root, ctx, meta, data) {
    ensure(state);
    meta = meta || colByHash();
    data = data || {};
    if (!meta) return;
    var open = !!colOpen[meta.id];
    var items = sortCol(data.items);
    var rules = data.rules || [];
    var S = QS();
    var rulesHtml = '<details class="rank-rules"><summary>' + esc(meta.rulesTitle || '规则提醒') + '</summary><ol class="rank-rule-list">' +
      rules.map(function (rule) {
        return '<li class="rank-rule"><p>' + esc(rule.text) + '</p>' + (S ? S.render(rule.sources, { compact: true }) : '') + '</li>';
      }).join('') + '</ol></details>';
    var cards = items.map(function (it, idx) {
      return card(it, state, data.updated || '', {
        planKey: meta.id + ':' + it.rank,
        extraClass: (!open && idx >= 6) ? 'col-more' : '',
      });
    }).join('');
    var moreBtn = (!open && items.length > 6) ? '<p class="rank-more-row"><button type="button" class="btn btn-sm" id="col-more">展开更多</button></p>' : '';
    root.innerHTML = switchHtml(meta.tab) +
      '<p class="rank-intro">' + esc(data.intro || '') + '</p>' +
      rulesHtml +
      (items.length ? '<div class="rank-grid' + (open ? ' is-open' : '') + '" id="col-grid" data-col-expand="1">' + cards + '</div>' : '<div class="empty-illo">' + global.QuestIcons.illo('list') + '<p><b>这组合集还没有条目</b></p></div>') +
      moreBtn +
      planHtml(state);
    var more = root.querySelector('#col-more');
    if (more) more.addEventListener('click', function () { colOpen[meta.id] = true; paintCollection(state, root, ctx, meta, data); });
    root.querySelectorAll('[data-fav]').forEach(function (b) { b.addEventListener('click', function () {
      var n = b.getAttribute('data-fav'), k = state.rankFav.indexOf(n);
      if (k >= 0) state.rankFav.splice(k, 1); else state.rankFav.push(n);
      ctx.save(); paintCollection(state, root, ctx, meta, data);
    }); });
    root.querySelectorAll('[data-plan-add]').forEach(function (b) { b.addEventListener('click', function () {
      var rank = +b.getAttribute('data-plan-add');
      var it = items.filter(function (i) { return i.rank === rank; })[0];
      if (!it) return;
      var key = meta.id + ':' + it.rank;
      if (!state.rankPlan.some(function (p) { return p.key === key; })) {
        state.rankPlan.push({
          key: key,
          name: it.name,
          type: it.type,
          date: global.QuestStats ? global.QuestStats.ymd(new Date()) : (data.updated || ''),
          steps: it.steps.slice(),
          source_url: it.source_url,
          sources: (it.sources && it.sources.slice()) || undefined,
          done: false,
        });
      }
      ctx.save();
      if (global.QuestModal) global.QuestModal.showToast('已加入实操计划：' + it.name);
      paintCollection(state, root, ctx, meta, data);
    }); });
    bindPlan(state, root, { save: ctx.save, rerender: function () {
      var m = colByHash();
      if (m) paintCollection(state, root, ctx, m, colBundle(m.id) || data);
      else renderRank(state, root, ctx);
    } });
    if (global.QuestNav) global.QuestNav.fixLinks(root);
  }
  function renderCollection(state, root, ctx, meta) {
    ensure(state);
    meta = meta || colByHash();
    if (!meta) return;
    var embedded = colBundle(meta.id);
    if (embedded) paintCollection(state, root, ctx, meta, embedded);
    else root.innerHTML = switchHtml(meta.tab) + '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i></div>';
    if (!global.fetch) return;
    var seq = (renderCollection._seq = (renderCollection._seq || 0) + 1);
    fetch('data/collections/' + meta.id + '.json', { cache: 'no-cache' }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (d) {
      if (seq !== renderCollection._seq) return;
      if (!d || !Array.isArray(d.items) || !d.items.length) return;
      global.QUEST_COLLECTIONS = global.QUEST_COLLECTIONS || {};
      var prev = global.QUEST_COLLECTIONS[meta.id];
      var same = false;
      try { same = JSON.stringify(prev) === JSON.stringify(d); } catch (e) { same = false; }
      global.QUEST_COLLECTIONS[meta.id] = d;
      if (same) return;
      if (global.QuestAssistant && QuestAssistant.resetIndex) QuestAssistant.resetIndex();
      if (global.QuestShell && QuestShell.resetIndex) QuestShell.resetIndex();
      var now = colByHash();
      if (now && now.id === meta.id) paintCollection(state, root, ctx, meta, d);
    }).catch(function () {});
  }
  function renderRank(state, root, ctx) {
    ensure(state);
    var meta = colByHash();
    if (meta) { renderCollection(state, root, ctx, meta); return; }
    var r = R();
    if (!r.latest) { root.innerHTML = switchHtml('top') + DISCLAIMER + '<div class="empty-illo">' + global.QuestIcons.illo('list') + '<p><b>榜单还没有发布</b><br>稍后再来看看。</p></div>'; return; }
    var date = view.date && r.dates.indexOf(view.date) >= 0 ? view.date : r.latest;
    root.innerHTML = switchHtml('top') + '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i><i class="sk sk-short"></i></div>';
    getDay(date, function (day) {
      if (!day) { root.innerHTML = DISCLAIMER + '<div class="empty-illo">' + global.QuestIcons.illo('search') + '<p><b>这一天的榜单读取失败</b><br>换个日期试试。</p></div>'; return; }
      var types = typesIn(day);
      var resellN = day.items.filter(hasResell).length;
      if (!resellN) view.resell = false;
      var list = day.items.filter(function (i) {
        return (view.type === 'all' || i.type === view.type) && (!view.fav || state.rankFav.indexOf(i.name) >= 0) && (!view.resell || hasResell(i));
      });
      var emptyB = view.resell && view.type !== 'all' ? '这个类型里没有闲鱼方案' : view.resell ? '今天没有闲鱼方案' : view.fav ? '还没有收藏' : '这个类型今天没有上榜';
      var emptyS = view.resell && view.type !== 'all' ? '换个类型，或关掉「闲鱼方案」。' : view.resell ? '关掉「闲鱼方案」看看全部条目。' : view.fav ? '点卡片右上角的星标收藏感兴趣的方案。' : '切回「全部」看看。';
      var resellChip = resellN ? '<button type="button" class="chip chip-resell' + (view.resell ? ' active' : '') + '" id="rank-only-resell" data-rresell="1" aria-pressed="' + (view.resell ? 'true' : 'false') + '">闲鱼方案 ' + resellN + '</button>' : '';
      root.innerHTML = switchHtml('top') + DISCLAIMER +
        '<section class="rank-bar"><div class="rank-date"><label class="fld"><span>' + I('calendar') + '榜单日期</span><select id="rank-date">' + r.dates.map(function (d) { return '<option value="' + d + '"' + (d === date ? ' selected' : '') + '>' + d + (d === r.latest ? '（最新）' : '') + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="chip-row rank-types" role="group" aria-label="按类型筛选"><button type="button" class="chip' + (view.type === 'all' ? ' active' : '') + '" data-rtype="all">全部 ' + day.items.length + '</button>' +
        types.map(function (t) { var n = day.items.filter(function (i) { return i.type === t; }).length; return '<button type="button" class="chip ' + typeClass(t) + (view.type === t ? ' active' : '') + '" data-rtype="' + esc(t) + '">' + esc(t) + ' ' + n + '</button>'; }).join('') +
        resellChip +
        '<button type="button" class="chip chip-fav' + (view.fav ? ' active' : '') + '" id="rank-only-fav" aria-pressed="' + view.fav + '">' + I('star') + '只看收藏 ' + state.rankFav.length + '</button></div></section>' +
        '<p class="hint" id="rank-count">' + esc(day.date) + ' · 显示 ' + list.length + ' / ' + day.items.length + ' 条 · 每天更新一次</p>' +
        (list.length ? '<div class="rank-grid">' + list.map(function (i) { return card(i, state, day.date); }).join('') + '</div>'
          : '<div class="empty-illo">' + global.QuestIcons.illo('star') + '<p><b>' + emptyB + '</b><br>' + emptyS + '</p></div>') +
        planHtml(state);
      root.querySelector('#rank-date').addEventListener('change', function (e) { view.date = e.target.value; renderRank(state, root, ctx); });
      root.querySelectorAll('[data-rtype]').forEach(function (b) { b.addEventListener('click', function () { view.type = b.getAttribute('data-rtype'); renderRank(state, root, ctx); }); });
      var rsBtn = root.querySelector('#rank-only-resell');
      if (rsBtn) rsBtn.addEventListener('click', function () { view.resell = !view.resell; renderRank(state, root, ctx); });
      root.querySelector('#rank-only-fav').addEventListener('click', function () { view.fav = !view.fav; renderRank(state, root, ctx); });
      root.querySelectorAll('[data-fav]').forEach(function (b) { b.addEventListener('click', function () {
        var n = b.getAttribute('data-fav'), k = state.rankFav.indexOf(n);
        if (k >= 0) state.rankFav.splice(k, 1); else state.rankFav.push(n);
        ctx.save(); renderRank(state, root, ctx);
      }); });
      root.querySelectorAll('[data-plan-add]').forEach(function (b) { b.addEventListener('click', function () {
        var it = day.items.filter(function (i) { return i.rank === +b.getAttribute('data-plan-add'); })[0]; if (!it) return;
        if (!state.rankPlan.some(function (p) { return !p.key && p.name === it.name; })) state.rankPlan.push({ name: it.name, type: it.type, date: global.QuestStats ? global.QuestStats.ymd(new Date()) : day.date, steps: it.steps.slice(), source_url: it.source_url, sources: (it.sources && it.sources.slice()) || undefined, done: false });
        ctx.save(); if (global.QuestModal) global.QuestModal.showToast('已加入实操计划：' + it.name); renderRank(state, root, ctx);
      }); });
      bindPlan(state, root, { save: ctx.save, rerender: function () { renderRank(state, root, ctx); } });
      if (global.QuestNav) global.QuestNav.fixLinks(root);
    });
  }
  function latestItems() { var r = R(); return r.latest && r.days[r.latest] ? r.days[r.latest].items : []; }
  global.QuestRank = { ensure: ensure, renderRank: renderRank, planHtml: planHtml, bindPlan: bindPlan, latestItems: latestItems, DISCLAIMER: DISCLAIMER, TYPES: TYPES, COLS: COLS, colByHash: colByHash, colById: colById };
})(typeof window !== 'undefined' ? window : globalThis);
