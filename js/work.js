/** Phase 18 · 工作台 #work（每个站点的下一步）+ 每周复盘 #work-review（存档追加字段 reviews） */
(function (global) {
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function hostOf(u) { return String(u || '').replace(/^https?:\/\//i, '').replace(/[\/?#].*$/, '').toLowerCase(); }
  var DAY = 86400000;
  function ymd(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
  function weekStart(d) { d = new Date(d || Date.now()); d.setHours(0, 0, 0, 0); var w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return d; }
  function ensure(state) { global.QuestWorkbench.ensure(state); if (!Array.isArray(state.reviews)) state.reviews = []; if (!Array.isArray(state.shares)) state.shares = []; if (!state.sites) state.sites = { items: [] }; if (!Array.isArray(state.sites.items)) state.sites.items = []; return state; }
  function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString('zh-CN'); }

  /** 某站 GSC 按日期数据：最近 28 天 vs 前 28 天 */
  function stats28(state, s) {
    var ds = state.imports.filter(function (x) { return x.kind === 'gsc-dates' && x.siteId === s.id; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; })[0];
    if (ds && ds.rows.length) {
      var L = ds.rows.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; }), end = Date.parse(L[L.length - 1].d), cur = { clicks: 0, imp: 0 }, prev = { clicks: 0, imp: 0 };
      L.forEach(function (r) { var t = Date.parse(r.d), age = (end - t) / DAY; var b = age < 28 ? cur : age < 56 ? prev : null; if (b) { b.clicks += r.v.clicks || 0; b.imp += r.v.imp || 0; } });
      var pct = prev.clicks ? Math.round((cur.clicks - prev.clicks) / prev.clicks * 100) : null;
      return { src: (ds.via === 'api' ? 'Google API' : 'CSV 导入') + ' · 截至 ' + L[L.length - 1].d, clicks: cur.clicks, imp: cur.imp, pct: pct, label: '近 28 天' };
    }
    var lg = (s.logs || []).slice().sort(function (a, b) { return a.month < b.month ? 1 : -1; })[0];
    if (lg) return { src: '台账 ' + lg.month, clicks: +lg.clicks || 0, imp: +lg.imp || 0, usd: +lg.usd || 0, pct: null, label: lg.month };
    return null;
  }
  function weekOf(state) { var ws = ymd(weekStart()); return state.reviews.filter(function (r) { return r.week === ws; })[0]; }

  /** 每站 6 步状态 + 下一步 */
  function siteSteps(state, s) {
    var h = hostOf(s.domain), kit = state.kit || {};
    var pub = state.publish.filter(function (p) { return p.ok && !p.dry && h && hostOf(p.url) === h; });
    var sh = state.shares.filter(function (x) { return h && hostOf(x.url) === h; });
    var data = state.imports.some(function (x) { return x.siteId === s.id; }) || (s.logs || []).length > 0;
    var live = pub.length > 0 || ['已上线', '已收录', '有点击', '有收入'].indexOf(s.status) >= 0;
    var rv = weekOf(state);
    return [
      { id: 'keywords', label: '选词', done: !!(s.kw || kit.keyword), href: '#war-keywords', todo: '给这个站定一个主词：在选词练习板里比较 3–5 个候选词，把选中的写进台账「主词」。' },
      { id: 'kit', label: '实操助手', done: !!(kit.keyword && kit.intro), href: '#war-kit', todo: '在站一实操助手里填主词和简介，生成页面并通过上线自查表。' },
      { id: 'publish', label: '发布', done: live, href: '#war-publish', todo: '用发布上线把页面推到 GitHub Pages（先「预演」，确认后再发布），或在台账把状态改成「已上线」。' },
      { id: 'share', label: '分发', done: sh.length > 0, href: '#war-share', todo: '在内容分发页为站点网址生成各平台文案，用官方分享链接手动发出 2–3 个平台。', n: sh.length },
      { id: 'analytics', label: '数据', done: data, href: global.QuestGoogle && global.QuestGoogle.token() ? '#me-accounts' : '#me-analytics', todo: '上线一两周后：连接 Google 自动拉取，或从 GSC 导出「效果」CSV 导入并写入这个站。' },
      { id: 'review', label: '复盘', done: !!rv, href: '#work-review', todo: '写本周复盘：做了什么、数据变化、学到什么、下周 3 件事。' },
    ];
  }

  function renderWork(state, root, ctx) {
    ensure(state);
    var sites = state.sites.items, G = global.QuestGoogle, pipe = global.QuestWorkbench.pipeline(state, '');
    var rv = weekOf(state), wk = ymd(weekStart());
    var weekShares = state.shares.filter(function (x) { return Date.parse(x.at) >= weekStart().getTime(); }).length;
    var cards = sites.map(function (s) {
      var st = siteSteps(state, s), nx = st.filter(function (x) { return !x.done; })[0], k = stats28(state, s);
      return '<article class="wk-card glass" data-site="' + esc(s.id) + '"><header><b>' + esc(s.name) + '</b>' + (s.domain ? '<small>' + esc(s.domain) + '</small>' : '') + '<span class="pill">' + esc(s.status || '筹备') + '</span></header>' +
        '<ol class="wk-steps">' + st.map(function (x) { return '<li class="' + (x.done ? 'done' : x === nx ? 'next' : '') + '" data-step="' + x.id + '"><a href="' + x.href + '">' + (x.done ? '✓ ' : '') + esc(x.label) + '</a></li>'; }).join('') + '</ol>' +
        (nx ? '<p class="wk-next"><b>下一步 · ' + esc(nx.label) + '</b>' + esc(nx.todo) + ' <a class="btn btn-sm btn-primary" href="' + nx.href + '">去做</a></p>' : '<p class="wk-next ok"><b>本周 6 步都完成了</b>继续按复盘里的「下周 3 件事」推进。</p>') +
        (k ? '<div class="wk-kpi"><span><b>' + fmt(k.clicks) + '</b>点击</span><span><b>' + fmt(k.imp) + '</b>曝光</span>' + (k.usd ? '<span><b>$' + fmt(k.usd) + '</b>收入</span>' : '') + (k.pct != null ? '<span class="' + (k.pct > 0 ? 'up' : k.pct < 0 ? 'down' : '') + '"><b>' + (k.pct > 0 ? '+' : '') + k.pct + '%</b>点击环比</span>' : '') + '<small>' + esc(k.label) + ' · ' + esc(k.src) + '</small></div>' : '<p class="hint wk-nodata">还没有数据：上线后连接 Google 或导入 CSV。</p>') + '</article>';
    }).join('');
    var gnx = [{ ok: sites.length > 0, t: '先在「我的站点台账」登记你的第一个站（名称、域名、主词），工作台就会按站点给出下一步。', h: '#me-sites', b: '去登记站点' }].filter(function (x) { return !x.ok; })[0];
    root.innerHTML = '<div class="tool-wrap wb wk">' + pipe +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('target') + '工作台 <span class="pill">' + sites.length + ' 个站</span></h2>' +
      '<p class="hint">选词 → 实操助手 → 发布 → 分发 → 数据 → 复盘。每个站只显示「下一步」，做完自动打勾；数据来自 Google 自动拉取、CSV 导入或台账手记，不编造数字。</p>' +
      '<div class="wk-week"><span>本周（' + wk + ' 起）</span><span>分发 <b>' + weekShares + '</b> 次</span><span>复盘 ' + (rv ? '<b class="ok">已写</b>' : '<a href="#work-review">未写 →</a>') + '</span>' + (G ? '<span>Google：' + (G.token() ? '已授权 · 上次拉取 ' + esc(G.ago(G.cfg().google.lastPull)) : '<a href="#me-accounts">未连接</a>') + '</span>' : '') + '</div></section>' +
      (G ? G.bar() : '') +
      (gnx ? '<div class="tool-empty glass">' + global.QuestIcons.illo('star') + '<p>' + gnx.t + '</p><a class="btn btn-primary btn-sm" href="' + gnx.h + '">' + gnx.b + '</a></div>' : '<div class="wk-grid">' + cards + '</div>') + '</div>';
    if (G) {
      var again = function () { if (root.isConnected) renderWork(state, root, ctx); };
      G.bindBar(state, root, ctx, again);
      if (!renderWork._auto && G.autoRefresh(state, ctx, function () { renderWork._auto = 0; again(); })) { renderWork._auto = 1; var bm = root.querySelector('#g-bar-msg'); if (bm) bm.textContent = '自动刷新中…'; }
    }
  }

  /* ---------- 每周复盘 ---------- */
  function facts(state) {
    var t0 = weekStart().getTime(), inWk = function (x) { return Date.parse(x.at) >= t0; };
    var f = [];
    var sh = state.shares.filter(inWk); f.push('分发 ' + sh.length + ' 次' + (sh.length ? '（' + Array.from(new Set(sh.map(function (x) { return x.platformName || x.platform; }))).join('、') + '）' : ''));
    var pb = state.publish.filter(function (p) { return inWk(p) && p.ok && !p.dry; }); f.push('发布 ' + pb.length + ' 次');
    var im = state.imports.filter(inWk); f.push('新数据 ' + im.length + ' 份' + (im.some(function (x) { return x.via === 'api'; }) ? '（含 Google API）' : ''));
    state.sites.items.forEach(function (s) { var k = stats28(state, s); if (k) f.push(s.name + '：' + k.label + ' 点击 ' + fmt(k.clicks) + ' · 曝光 ' + fmt(k.imp) + (k.pct != null ? '（环比 ' + (k.pct > 0 ? '+' : '') + k.pct + '%）' : '') + ' · ' + k.src); });
    return f;
  }
  var FIELDS = [['did', '本周做了什么', '例：站一上线；发了 3 个平台；补了 2 篇内页'], ['data', '数据变化', '看上面的自动事实，写你自己的判断：哪里涨、哪里没动'], ['learned', '学到什么', '一个踩过的坑或有效的做法'], ['risk', '风险 / 卡点', '例：还没收录；某平台规则不清楚（以官方后台为准）']];
  function md(r) {
    return '# 每周复盘 · ' + r.week + ' 起\n\n## 自动事实\n' + (r.facts || []).map(function (x) { return '- ' + x; }).join('\n') + '\n\n' +
      FIELDS.map(function (f) { return '## ' + f[1] + '\n' + (r[f[0]] || '（未填）'); }).join('\n\n').replace('## 风险', '## 下周 3 件事\n' + [0, 1, 2].map(function (i) { return (i + 1) + '. ' + ((r.next || [])[i] || ''); }).join('\n') + '\n\n## 风险') + '\n';
  }
  function renderReview(state, root, ctx, opts) {
    ensure(state); opts = opts || {};
    var ws = opts.week || ymd(weekStart()), r = state.reviews.filter(function (x) { return x.week === ws; })[0] || { week: ws, next: ['', '', ''] };
    var isCur = ws === ymd(weekStart()), F = isCur ? facts(state) : (r.facts || []);
    var past = state.reviews.slice().sort(function (a, b) { return a.week < b.week ? 1 : -1; });
    root.innerHTML = '<div class="tool-wrap wb rv">' + global.QuestWorkbench.pipeline(state, 'review') +
      '<section class="block glass tool-card" id="rv-form-wrap"><h2 class="block-title">' + I('bulb') + '每周复盘 <span class="pill">' + ws + ' 起</span>' + (r.at ? '<span class="wb-st ok">已保存</span>' : '') + '</h2>' +
      '<p class="hint">每周花 10 分钟：先看自动事实，再写判断和下周 3 件事。只记真实发生的事，收入与规则以官方后台为准。</p>' +
      '<h3 class="wb-h">自动事实（本周一起）</h3><ul class="rv-facts" id="rv-facts">' + F.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<form id="rv-form" class="form-grid">' + FIELDS.slice(0, 3).map(function (f) { return '<label class="fld fld-wide"><span>' + f[1] + '</span><textarea id="rv-' + f[0] + '" rows="2" placeholder="' + esc(f[2]) + '">' + esc(r[f[0]] || '') + '</textarea></label>'; }).join('') +
      '<fieldset class="fld fld-wide"><legend>下周 3 件事</legend>' + [0, 1, 2].map(function (i) { return '<input id="rv-next-' + i + '" placeholder="' + (i + 1) + '. 可执行、能打勾的一件事" value="' + esc((r.next || [])[i] || '') + '" />'; }).join('') + '</fieldset>' +
      '<label class="fld fld-wide"><span>' + FIELDS[3][1] + '</span><textarea id="rv-risk" rows="2" placeholder="' + esc(FIELDS[3][2]) + '">' + esc(r.risk || '') + '</textarea></label>' +
      '<div class="tool-actions fld-wide"><button type="submit" class="btn btn-primary btn-sm" id="rv-save">' + I('check') + '保存复盘</button><button type="button" class="btn btn-sm" id="rv-copy">' + I('file') + '复制为 Markdown</button><button type="button" class="btn btn-sm ai-btn" id="rv-ai">' + I('sparkle') + 'AI 复盘建议</button></div></form><p id="rv-msg" class="hint" role="status"></p><div id="rv-ai-out"></div></section>' +
      (past.length ? '<section class="block glass tool-card cx-fold"><h2 class="block-title">' + I('list') + '历史复盘（' + past.length + '）</h2><ul class="rv-hist">' + past.map(function (x) { return '<li><button type="button" class="chip' + (x.week === ws ? ' on' : '') + '" data-week="' + x.week + '">' + x.week + ' 起</button> ' + esc((x.next || []).filter(Boolean).join(' / ') || (x.did || '').slice(0, 40)) + '</li>'; }).join('') + '</ul></section>' : '') + '</div>';
    function read() { var o = { week: ws, at: new Date().toISOString(), facts: F, next: [0, 1, 2].map(function (i) { return root.querySelector('#rv-next-' + i).value.trim(); }) }; FIELDS.forEach(function (f) { o[f[0]] = root.querySelector('#rv-' + f[0]).value.trim(); }); return o; }
    var msg = root.querySelector('#rv-msg');
    root.querySelector('#rv-form').addEventListener('submit', function (e) {
      e.preventDefault(); var o = read(), i = state.reviews.findIndex(function (x) { return x.week === ws; });
      if (i >= 0) state.reviews[i] = Object.assign(state.reviews[i], o); else state.reviews.push(o);
      if (state.reviews.length > 104) state.reviews.shift();
      ctx.save();
      renderReview(state, root, ctx, { week: ws }); root.querySelector('#rv-msg').textContent = '已保存本周复盘。';
    });
    root.querySelector('#rv-copy').addEventListener('click', function () {
      var t = md(read()); var done = function () { msg.textContent = '已复制 Markdown。'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { msg.textContent = t; }); else msg.textContent = t;
      root.__md = t;
    });
    root.querySelector('#rv-ai').addEventListener('click', function () {
      global.QuestAI.run(root.querySelector('#rv-ai-out'), '你是出海小站的复盘教练。根据下面这份每周复盘（事实部分为真实记录），用中文给出：1) 一句话总结；2) 数据里最值得注意的 1–2 点（不要编造任何数字，没有数据就说没有）；3) 对「下周 3 件事」的修改建议，要具体可执行；4) 一个风险提醒。只建议合法渠道，不承诺收入。\n\n' + md(read()), 'AI 复盘建议');
    });
    root.querySelectorAll('[data-week]').forEach(function (b) { b.addEventListener('click', function () { renderReview(state, root, ctx, { week: b.getAttribute('data-week') }); }); });
  }
  global.QuestWork = { renderWork: renderWork, renderReview: renderReview, siteSteps: siteSteps, stats28: stats28, facts: facts, md: md, weekStart: weekStart };
})(typeof window !== 'undefined' ? window : globalThis);
