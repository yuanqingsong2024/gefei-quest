/** Agent 赚钱 · #war-rank-agent
 *  数据：js/agent-money-data.js 内嵌兜底 → fetch data/agent-money/latest.json
 *  计划 key：agent:<rank>，复用 rankFav / rankPlan，不并进每日赚钱榜。 */
(function (global) {
  var I = function (n) { return global.QuestIcons.svg(n); };
  function pageBanner(kind) {
    var B = {
      rank: { art: 'rank-banner', k: '今日公开渠道', t: '挑 1 条，先试一周', s: '每条附官方来源 · 每天整理一次 · 不承诺收益' },
      agent: { art: 'agent-banner', k: 'Agent 进账方案', t: '让 Agent 帮你接单、上架、跑流程', s: '点卡片看步骤与来源 · 以各平台官方规则为准' }
    }[kind];
    var T = global.QuestTheme;
    if (!B || !T) return '';
    return '<figure class="page-banner page-banner-' + kind + '" data-reveal><img data-art="' + B.art + '" src="' + T.art(B.art) + '" width="1280" height="720" loading="lazy" decoding="async" alt="' + T.artAlt(B.art) + '" />' +
      '<figcaption><span class="page-banner-k">' + B.k + '</span><b>' + B.t + '</b><small>' + B.s + '</small></figcaption></figure>';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var TYPES = ['Agent接单', 'Agent内容变现', 'Agent工具/小产品', 'Agent出海小站', 'Agent闲鱼方案', 'Agent平台激励', 'Agent案例拆解'];
  var view = { type: 'all', fav: false };
  var cache = null;
  var fetching = false;

  function R() {
    return global.QuestRank;
  }
  function embedded() {
    return global.QUEST_AGENT_MONEY || null;
  }
  function planKeyFor(it) {
    return 'agent:' + (it && it.rank != null ? it.rank : '');
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
  function switchHtml(which) {
    var QR = R();
    if (QR && QR.switchHtml) return QR.switchHtml(which);
    return '<nav class="rank-switch" aria-label="榜单内容">' +
      '<a class="rank-switch-btn" href="#war-rank">今日公开渠道</a>' +
      '<a class="rank-switch-btn' + (which === 'agent' ? ' active' : '') + '" href="#war-rank-agent"' +
      (which === 'agent' ? ' aria-current="page"' : '') + '>Agent 进账方案</a>' +
      '<a class="rank-switch-btn' + (which === 'tools' ? ' active' : '') + '" href="#war-tools"' +
      (which === 'tools' ? ' aria-current="page"' : '') + '>今日工具发掘</a></nav>';
  }
  function disclaimer() {
    var QR = R();
    return (QR && QR.DISCLAIMER) || '';
  }

  function normalize(day) {
    if (!day || !Array.isArray(day.items)) return null;
    return {
      date: day.date || '',
      updated: day.updated || day.date || '',
      items: day.items.slice(),
    };
  }

  function getDay(cb) {
    var emb = normalize(embedded());
    if (cache) return cb(cache);
    if (emb) {
      cache = emb;
      cb(emb);
    } else {
      cb(null);
    }
    if (!global.fetch || fetching) return;
    fetching = true;
    fetch('data/agent-money/latest.json', { cache: 'no-cache' }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (d) {
      fetching = false;
      var n = normalize(d);
      if (!n || !n.items.length) return;
      var same = false;
      try { same = cache && JSON.stringify(cache) === JSON.stringify(n); } catch (e) { same = false; }
      cache = n;
      global.QUEST_AGENT_MONEY = n;
      if (!same) cb(n);
    }).catch(function () { fetching = false; });
  }

  function paint(state, root, ctx, day) {
    var QR = R();
    if (!QR) {
      root.innerHTML = '<div class="empty-illo"><p><b>页面模块未加载</b></p></div>';
      return;
    }
    QR.ensure(state);
    if (!day || !day.items || !day.items.length) {
      root.innerHTML = '<div data-reveal class="rank-switch-wrap">' + switchHtml('agent') + '</div>' + pageBanner('agent') + disclaimer() +
        '<div class="empty-illo">' + global.QuestIcons.illo('list') +
        '<p><b>Agent 进账方案还没有发布</b><br>稍后再来，或先打开今日公开渠道榜。</p><p><a class="btn btn-primary btn-sm" href="#war-rank">打开今日公开渠道</a></p></div>';
      if (global.QuestNav) global.QuestNav.fixLinks(root);
      if (global.QuestShell && QuestShell.mountReveal) QuestShell.mountReveal(root);
      return;
    }
    var types = typesIn(day);
    var list = day.items.filter(function (i) {
      return (view.type === 'all' || i.type === view.type) &&
        (!view.fav || state.rankFav.indexOf(i.name) >= 0);
    });
    var emptyB = view.fav ? '还没有收藏方案' : '这个类型今天没有条目';
    var emptyS = view.fav ? '点卡片右上角星标收藏；收藏后可从「只看收藏」回看。' : '切回「全部」看看。';
    root.innerHTML = '<div data-reveal class="rank-switch-wrap">' + switchHtml('agent') + '</div>' + pageBanner('agent') + disclaimer() +
      '<p class="rank-intro" data-reveal>每天整理可执行的 Agent 进账路径（接单、小产品、平台激励等）。点卡片看步骤与来源；不承诺收益，以各平台官网规则为准。</p>' +
      '<section class="rank-bar"><div class="chip-row rank-types" role="group" aria-label="按类型筛选">' +
      '<button type="button" class="chip' + (view.type === 'all' ? ' active' : '') + '" data-amtype="all">全部 ' + day.items.length + '</button>' +
      types.map(function (t) {
        var n = day.items.filter(function (i) { return i.type === t; }).length;
        return '<button type="button" class="chip ' + typeClass(t) + (view.type === t ? ' active' : '') + '" data-amtype="' + esc(t) + '">' + esc(t) + ' ' + n + '</button>';
      }).join('') +
      '<button type="button" class="chip chip-fav' + (view.fav ? ' active' : '') + '" id="am-only-fav" aria-pressed="' + view.fav + '">' +
      I('star') + '只看收藏 ' + state.rankFav.length + '</button></div></section>' +
      '<p class="hint" id="am-count">' + esc(day.date) + (day.updated ? ' · 更新 ' + esc(day.updated) : '') +
      ' · 显示 ' + list.length + ' / ' + day.items.length + ' 条</p>' +
      (list.length
        ? '<div class="rank-grid" data-reveal>' + list.map(function (i) {
            return QR.card(i, state, day.date, { planKey: planKeyFor(i) });
          }).join('') + '</div>'
        : '<div class="empty-illo">' + global.QuestIcons.illo('star') + '<p><b>' + emptyB + '</b><br>' + emptyS + '</p></div>') +
      QR.planHtml(state);

    root.querySelectorAll('[data-amtype]').forEach(function (b) {
      b.addEventListener('click', function () {
        view.type = b.getAttribute('data-amtype');
        paint(state, root, ctx, day);
      });
    });
    var favOnly = root.querySelector('#am-only-fav');
    if (favOnly) favOnly.addEventListener('click', function () {
      view.fav = !view.fav;
      paint(state, root, ctx, day);
    });
    root.querySelectorAll('[data-fav]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var n = b.getAttribute('data-fav'), k = state.rankFav.indexOf(n);
        if (k >= 0) state.rankFav.splice(k, 1); else state.rankFav.push(n);
        ctx.save();
        paint(state, root, ctx, day);
      });
    });
    root.querySelectorAll('[data-plan-add]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var rank = +b.getAttribute('data-plan-add');
        var it = day.items.filter(function (i) { return i.rank === rank; })[0];
        if (!it) return;
        var key = planKeyFor(it);
        if (!state.rankPlan.some(function (p) { return p.key === key; })) {
          state.rankPlan.push({
            key: key,
            name: it.name,
            type: it.type,
            date: global.QuestStats ? global.QuestStats.ymd(new Date()) : day.date,
            steps: (it.steps || []).slice(),
            source_url: it.source_url,
            sources: (it.sources && it.sources.slice()) || undefined,
            done: false,
          });
        }
        ctx.save();
        if (global.QuestModal) global.QuestModal.showToast('已加入本周实操：' + it.name);
        paint(state, root, ctx, day);
      });
    });
    QR.bindRankCards(root, day.items, state, day.date, ctx, {
      planKeyFor: planKeyFor,
      rerender: function () { paint(state, root, ctx, day); },
    });
    QR.bindPlan(state, root, {
      save: ctx.save,
      rerender: function () { paint(state, root, ctx, day); },
    });
    if (global.QuestNav) global.QuestNav.fixLinks(root);
    if (global.QuestShell && QuestShell.mountReveal) QuestShell.mountReveal(root);
  }

  function render(state, root, ctx) {
    var QR = R();
    if (QR) QR.ensure(state);
    root.innerHTML = switchHtml('agent') + '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i><i class="sk sk-short"></i></div>';
    var seq = (render._seq = (render._seq || 0) + 1);
    getDay(function (day) {
      if (seq !== render._seq) return;
      paint(state, root, ctx, day);
    });
  }

  global.QuestAgentMoney = {
    render: render,
    TYPES: TYPES,
    planKeyFor: planKeyFor,
  };
})(typeof window !== 'undefined' ? window : globalThis);
