/** AI 订阅 / Token 羊毛 · #war-rank-ai-wool
 *  数据：js/ai-wool-data.js 内嵌兜底 → fetch data/ai-wool/latest.json
 *  计划 key：aiwool:<rank>，复用 rankFav / rankPlan，不并进每日赚钱榜。 */
(function (global) {
  var I = function (n) { return global.QuestIcons ? global.QuestIcons.svg(n) : ''; };
  function pageBanner() {
    var T = global.QuestTheme;
    if (!T) return '';
    var art = 'rank-banner';
    return '<figure class="page-banner page-banner-wool" data-reveal><img data-art="' + art + '" src="' + T.art(art) + '" width="1280" height="720" loading="lazy" decoding="async" alt="' + T.artAlt(art) + '" />' +
      '<figcaption><span class="page-banner-k">AI 订阅 / Token 羊毛</span><b>优惠以官方为准，先核对再开通</b><small>每天整理一次 · 可能随时失效 · 不承诺省钱结果</small></figcaption></figure>';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var TYPES = ['免费额度', '订阅折扣', '学生教育', '限时促销', 'Token福利', '国内渠道', '其他'];
  var view = { type: 'all', fav: false };
  var cache = null;
  var fetching = false;

  function R() { return global.QuestRank; }
  function embedded() { return global.QUEST_AI_WOOL || null; }
  function planKeyFor(it) {
    return 'aiwool:' + (it && it.rank != null ? it.rank : '');
  }
  function typeClass(t) {
    return 'rank-type-' + String(t || '').replace(/[^\w\u4e00-\u9fa5]+/g, '-');
  }
  function riskClass(lvl) {
    var m = { '低': 'low', '中': 'mid', '高': 'high' };
    return 'wool-risk-' + (m[lvl] || 'mid');
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
      '<a class="rank-switch-btn" href="#war-rank-agent">Agent 进账方案</a>' +
      '<a class="rank-switch-btn' + (which === 'wool' ? ' active' : '') + '" href="#war-rank-ai-wool"' +
      (which === 'wool' ? ' aria-current="page"' : '') + '>AI 羊毛</a>' +
      '<a class="rank-switch-btn" href="#war-tools">今日工具发掘</a></nav>';
  }
  function disclaimer() {
    return '<div class="rank-disclaimer" role="note"><b>免责声明</b>：本频道整理公开的 AI 订阅 / Token 优惠与免费额度信息，' +
      '<b>优惠以各产品官方页面为准，可能随时失效</b>。开通或试用前请自行核对绑卡、自动续费、地区与学生资格等条款；' +
      '<b>不承诺任何省钱或收益结果</b>。不收录盗版、破解、共享账号、代充代绑等内容。</div>';
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
    fetch('data/ai-wool/latest.json', { cache: 'no-cache' }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (d) {
      fetching = false;
      var n = normalize(d);
      if (!n) return;
      var same = false;
      try { same = cache && JSON.stringify(cache) === JSON.stringify(n); } catch (e) { same = false; }
      cache = n;
      global.QUEST_AI_WOOL = n;
      if (!same) cb(n);
    }).catch(function () { fetching = false; });
  }

  function stars(n) {
    n = Math.max(1, Math.min(5, +n || 1));
    var s = '', i;
    for (i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return '<span class="rank-stars" aria-label="难度' + n + '">' + s + '</span>';
  }
  function cnStep(n) {
    var u = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    n = +n || 0;
    if (n <= 0) return '第' + n + '步';
    if (n < 10) return '第' + u[n] + '步';
    if (n === 10) return '第十步';
    if (n < 20) return '第十' + u[n - 10] + '步';
    return '第' + n + '步';
  }
  function isPlanned(it, state) {
    var key = planKeyFor(it);
    return state.rankPlan.some(function (p) { return p.key === key; });
  }
  function card(it, state) {
    var fav = state.rankFav.indexOf(it.name) >= 0;
    var planned = isPlanned(it, state);
    var meta = [
      it.provider ? esc(it.provider) : '',
      it.region ? esc(it.region) : '',
      it.value ? esc(it.value) : '',
    ].filter(Boolean).join(' · ');
    var risk = it.risk_level
      ? '<span class="pill wool-risk ' + riskClass(it.risk_level) + '">风险' + esc(it.risk_level) + '</span>'
      : '';
    return '<article class="rank-card rank-card--teaser glass ' + typeClass(it.type) + '" data-rank="' + it.rank + '" data-type="' + esc(it.type) + '" data-plan-key="' + esc(planKeyFor(it)) + '">' +
      '<div class="rank-head"><span class="rank-no rank-badge rank-no-' + Math.min(it.rank, 4) + '" aria-label="第' + it.rank + '名">第' + it.rank + '名</span><div class="rank-title"><h3>' + esc(it.name) + '</h3>' +
      '<p><span class="pill" data-type="' + esc(it.type) + '">' + esc(it.type) + '</span> ' + risk +
      (it.difficulty != null ? ' ' + stars(it.difficulty) : '') + '</p>' +
      (meta ? '<p class="rank-why">' + meta + '</p>' : '') +
      '</div>' +
      '<button type="button" class="rank-fav' + (fav ? ' on' : '') + '" data-fav="' + esc(it.name) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? '取消收藏' : '收藏') + '">' + I('star') + '</button></div>' +
      (it.summary ? '<p class="rank-why">' + esc(it.summary) + '</p>' : (it.why ? '<p class="rank-why">' + esc(it.why) + '</p>' : '')) +
      '<div class="rank-foot"><span class="tool-actions">' +
      '<button type="button" class="btn btn-sm" data-rank-detail="' + it.rank + '">看领取与来源</button>' +
      '<button type="button" class="btn btn-sm ' + (planned ? 'btn-ghost' : 'btn-primary') + '" data-plan-add="' + it.rank + '"' + (planned ? ' disabled' : '') + '>' +
      (planned ? '已在本周计划' : '加入本周实操') + '</button></span></div></article>';
  }

  function closeDetail() {
    var M = global.QuestModal;
    if (!M) return;
    var roots = M.ensureRoots();
    var modal = roots.modal;
    modal.hidden = true;
    modal.innerHTML = '';
    modal.onclick = null;
    if (closeDetail._onKey) {
      document.removeEventListener('keydown', closeDetail._onKey);
      closeDetail._onKey = null;
    }
  }

  function openDetail(it, state, date, ctx) {
    var M = global.QuestModal;
    if (!M || !it) return;
    if (closeDetail._onKey) {
      document.removeEventListener('keydown', closeDetail._onKey);
      closeDetail._onKey = null;
    }
    var QR = R();
    if (QR) QR.ensure(state);
    var roots = M.ensureRoots();
    var modal = roots.modal;
    var fav = state.rankFav.indexOf(it.name) >= 0;
    var planned = isPlanned(it, state);
    var steps = (it.steps || []).map(function (s, i) {
      return '<li class="rank-step" data-step="' + (i + 1) + '">' +
        '<span class="rank-step-badge">' + cnStep(i + 1) + '</span>' +
        '<div class="rank-step-card">' + esc(s) + '</div></li>';
    }).join('');
    var tags = (it.tags || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('');
    var stack = (it.stack || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    var S = global.QuestSources;
    var src = S ? S.render(S.of(it, date), { compact: false, date: date }) : '';
    var metaRows = '';
    [
      ['提供方', it.provider],
      ['地区', it.region],
      ['价值', it.value],
      ['成本', it.cost],
      ['截止', it.deadline],
      ['门槛', it.threshold],
      ['耗时', it.time],
      ['适合谁', it.fit],
      ['风险等级', it.risk_level],
    ].forEach(function (pair) {
      if (pair[1]) metaRows += '<dt>' + esc(pair[0]) + '</dt><dd>' + esc(pair[1]) + '</dd>';
    });
    modal.hidden = false;
    modal.innerHTML =
      '<div class="modal-backdrop" data-wool-close="1"></div>' +
      '<div class="modal-card rank-detail-card ' + typeClass(it.type) + '" role="dialog" aria-modal="true" aria-labelledby="wool-detail-title">' +
      '<button type="button" class="rank-detail-close" data-wool-close="1" aria-label="关闭">×</button>' +
      '<div class="rank-detail-head">' +
      '<span class="rank-no rank-badge rank-no-' + Math.min(it.rank, 4) + '" aria-label="第' + it.rank + '名">第' + it.rank + '名</span>' +
      '<div class="rank-title"><h2 id="wool-detail-title">' + esc(it.name) + '</h2>' +
      '<p><span class="pill" data-type="' + esc(it.type) + '">' + esc(it.type) + '</span> ' +
      (it.risk_level ? '<span class="pill wool-risk ' + riskClass(it.risk_level) + '">风险' + esc(it.risk_level) + '</span> ' : '') +
      (it.difficulty != null ? stars(it.difficulty) : '') + '</p></div></div>' +
      (it.summary ? '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">摘要</h3><p class="rank-why rank-why-full">' + esc(it.summary) + '</p></section>' : '') +
      (it.why ? '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">为什么收录</h3><p class="rank-why rank-why-full">' + esc(it.why) + '</p></section>' : '') +
      (metaRows ? '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">关键信息</h3><dl class="rank-meta">' + metaRows + '</dl></section>' : '') +
      (it.risk ? '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">风险说明</h3><p class="rank-risk">' + esc(it.risk) + '</p></section>' : '') +
      (it.claim_howto ? '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">怎么领 / 怎么开</h3><p class="rank-why rank-why-full">' + esc(it.claim_howto) + '</p>' +
        (stack ? '<div class="rank-agent-stack">' + stack + '</div>' : '') + '</section>' : (stack ? '<section class="rank-detail-section"><div class="rank-agent-stack">' + stack + '</div></section>' : '')) +
      '<section class="rank-detail-section"><h3 class="rank-detail-label">怎么开始（' + (it.steps || []).length + ' 步）</h3><ol class="rank-roadmap">' + steps + '</ol></section>' +
      '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">来源</h3>' + src +
      (tags ? '<div class="rank-tags" style="margin-top:8px">' + tags + '</div>' : '') + '</section>' +
      '<div class="modal-actions rank-detail-actions">' +
      '<button type="button" class="btn rank-fav-btn' + (fav ? ' on' : '') + '" data-wool-fav="1" aria-pressed="' + fav + '">' + I('star') + (fav ? ' 已收藏' : ' 收藏') + '</button>' +
      '<button type="button" class="btn ' + (planned ? 'btn-ghost' : 'btn-primary') + '" data-wool-plan="1"' + (planned ? ' disabled' : '') + '>' + (planned ? '已在本周计划' : '加入本周实操') + '</button>' +
      '<button type="button" class="btn" data-wool-close="1">关闭</button></div></div>';

    function refresh() {
      fav = state.rankFav.indexOf(it.name) >= 0;
      planned = isPlanned(it, state);
      var favBtn = modal.querySelector('[data-wool-fav]');
      var planBtn = modal.querySelector('[data-wool-plan]');
      if (favBtn) {
        favBtn.classList.toggle('on', fav);
        favBtn.setAttribute('aria-pressed', fav ? 'true' : 'false');
        favBtn.innerHTML = I('star') + (fav ? ' 已收藏' : ' 收藏');
      }
      if (planBtn) {
        planBtn.disabled = planned;
        planBtn.className = 'btn ' + (planned ? 'btn-ghost' : 'btn-primary');
        planBtn.textContent = planned ? '已在本周计划' : '加入本周实操';
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') { closeDetail(); }
    }
    closeDetail._onKey = onKey;
    document.addEventListener('keydown', onKey);
    modal.onclick = function (e) {
      var t = e.target;
      if (!t) return;
      if (t.getAttribute && t.getAttribute('data-wool-close')) { closeDetail(); return; }
      if (t.closest && t.closest('[data-wool-close]')) { closeDetail(); return; }
      if (t.closest && t.closest('[data-wool-fav]')) {
        var k = state.rankFav.indexOf(it.name);
        if (k >= 0) state.rankFav.splice(k, 1); else state.rankFav.push(it.name);
        if (ctx && ctx.save) ctx.save();
        refresh();
        if (ctx && ctx.onChanged) ctx.onChanged();
        return;
      }
      if (t.closest && t.closest('[data-wool-plan]') && !planned) {
        var key = planKeyFor(it);
        if (!state.rankPlan.some(function (p) { return p.key === key; })) {
          state.rankPlan.push({
            key: key,
            name: it.name,
            type: it.type,
            date: global.QuestStats ? global.QuestStats.ymd(new Date()) : date,
            steps: (it.steps || []).slice(),
            source_url: it.source_url,
            sources: (it.sources && it.sources.slice()) || undefined,
            done: false,
          });
        }
        if (ctx && ctx.save) ctx.save();
        if (global.QuestModal && QuestModal.showToast) QuestModal.showToast('已加入本周实操：' + it.name);
        refresh();
        if (ctx && ctx.onChanged) ctx.onChanged();
      }
    };
  }

  function paint(state, root, ctx, day) {
    var QR = R();
    if (!QR) {
      root.innerHTML = '<div class="empty-illo"><p><b>页面模块未加载</b></p></div>';
      return;
    }
    QR.ensure(state);
    if (!day || !day.items || !day.items.length) {
      root.innerHTML = '<div data-reveal class="rank-switch-wrap">' + switchHtml('wool') + '</div>' + pageBanner() + disclaimer() +
        '<div class="empty-illo">' + (global.QuestIcons ? global.QuestIcons.illo('list') : '') +
        '<p><b>今天还没有 AI 羊毛条目</b><br>雷达推送后会自动出现。可先看公开渠道或 Agent 进账方案。</p>' +
        '<p><a class="btn btn-primary btn-sm" href="#war-rank">打开今日公开渠道</a> ' +
        '<a class="btn btn-sm" href="#war-rank-agent">打开 Agent 进账方案</a></p></div>';
      if (global.QuestNav) global.QuestNav.fixLinks(root);
      if (global.QuestShell && QuestShell.mountReveal) QuestShell.mountReveal(root);
      return;
    }
    var types = typesIn(day);
    var list = day.items.filter(function (i) {
      return (view.type === 'all' || i.type === view.type) &&
        (!view.fav || state.rankFav.indexOf(i.name) >= 0);
    });
    var emptyB = view.fav ? '还没有收藏条目' : '这个类型今天没有条目';
    var emptyS = view.fav ? '点卡片右上角星标收藏；收藏后可从「只看收藏」回看。' : '切回「全部」看看。';
    root.innerHTML = '<div data-reveal class="rank-switch-wrap">' + switchHtml('wool') + '</div>' + pageBanner() + disclaimer() +
      '<p class="rank-intro" data-reveal>每天整理 AI 订阅折扣、免费额度、学生计划和 Token 福利。点卡片看领取步骤与官方来源；优惠可能随时失效，开通前核对绑卡与自动续费。</p>' +
      '<section class="rank-bar"><div class="chip-row rank-types" role="group" aria-label="按类型筛选">' +
      '<button type="button" class="chip' + (view.type === 'all' ? ' active' : '') + '" data-wooltype="all">全部 ' + day.items.length + '</button>' +
      types.map(function (t) {
        var n = day.items.filter(function (i) { return i.type === t; }).length;
        return '<button type="button" class="chip ' + typeClass(t) + (view.type === t ? ' active' : '') + '" data-wooltype="' + esc(t) + '">' + esc(t) + ' ' + n + '</button>';
      }).join('') +
      '<button type="button" class="chip chip-fav' + (view.fav ? ' active' : '') + '" id="wool-only-fav" aria-pressed="' + view.fav + '">' +
      I('star') + '只看收藏 ' + state.rankFav.length + '</button></div></section>' +
      '<p class="hint" id="wool-count">' + esc(day.date) + (day.updated ? ' · 更新 ' + esc(day.updated) : '') +
      ' · 显示 ' + list.length + ' / ' + day.items.length + ' 条</p>' +
      (list.length
        ? '<div class="rank-grid" data-reveal>' + list.map(function (i) { return card(i, state); }).join('') + '</div>'
        : '<div class="empty-illo">' + (global.QuestIcons ? global.QuestIcons.illo('star') : '') + '<p><b>' + emptyB + '</b><br>' + emptyS + '</p></div>') +
      QR.planHtml(state);

    root.querySelectorAll('[data-wooltype]').forEach(function (b) {
      b.addEventListener('click', function () {
        view.type = b.getAttribute('data-wooltype');
        paint(state, root, ctx, day);
      });
    });
    var favOnly = root.querySelector('#wool-only-fav');
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
    root.querySelectorAll('[data-rank-detail]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var rank = +b.getAttribute('data-rank-detail');
        var it = day.items.filter(function (i) { return i.rank === rank; })[0];
        if (!it) return;
        openDetail(it, state, day.date, {
          save: ctx.save,
          onChanged: function () { paint(state, root, ctx, day); },
        });
      });
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
    root.innerHTML = switchHtml('wool') + '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i><i class="sk sk-short"></i></div>';
    var seq = (render._seq = (render._seq || 0) + 1);
    getDay(function (day) {
      if (seq !== render._seq) return;
      paint(state, root, ctx, day);
    });
  }

  global.QuestAiWool = {
    render: render,
    TYPES: TYPES,
    planKeyFor: planKeyFor,
  };
})(typeof window !== 'undefined' ? window : globalThis);
