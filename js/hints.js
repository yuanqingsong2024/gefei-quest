/** 工具页顶部提示 + 学习→实施→赚钱 的共享流程。
 *  关闭提示写入存档 hints.dismissed[route]=true，不整页重绘。
 *  提示关掉后，页底「下一步 →」仍然在。 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var HINTS = {
    work: { what: '按每个站点显示下一步。', go: '去登记站点', href: '#me-sites', goal: '看清每个站现在该做的那一步。' },
    'work-review': { what: '写本周做了什么和下周 3 件事。', go: '先登记一个站点', href: '#me-sites', goal: '写下本周事实和下周 3 件事。' },
    war: { what: '每个阶段一张 7 天清单。', go: '勾一项今天已经做完的', goal: '勾完这一站今天能做的一项。' },
    'war-kit': { what: '用主词生成可以上线的页面。', go: '填写主词', focus: '#kit-keyword', goal: '生成一页能上线的页面。' },
    'war-keywords': { what: '给候选词打分，决定做不做。', go: '记一个候选词', focus: '#kw-kw', goal: '留下一个你打算做的候选词。' },
    'war-rank': { what: '整理公开渠道，不承诺收益。', go: '挑一条加入实操计划', goal: '挑 1 条加入实操计划，先试一周。' },
    'war-publish': { what: '把页面写进你的 GitHub 仓库。', go: '先填实操助手', href: '#war-kit', goal: '把页面写进你的仓库并上线。' },
    'war-share': { what: '生成各平台文案，由你自己去发。', go: '先填实操助手', href: '#war-kit', goal: '生成文案后用官方链接自己发出去。' },
    path: { what: '按章节看关卡地图。', go: '打开任务清单', href: '#path-quests', goal: '知道自己现在在哪一章。' },
    'path-quests': { what: '勾选当前章节里你已经做完的任务。', go: '勾一项已做完的', goal: '勾一项已经做完的任务。' },
    lib: { what: '免费工具、托管和渠道笔记。', go: '看免费工具', href: '#lib-tools', goal: '找到一个今天能用的免费工具。' },
    pm: { what: '各平台的门槛和分成，以官网为准。', go: '先看「新手怎么选」', goal: '看清一个平台的门槛和分成。' },
    me: { what: '等级、成就，以及本机备份。', go: '导出一份 JSON', focus: '#set-export', goal: '确认进度还在，并留一份备份。' },
    'me-accounts': { what: '只保存你自己的官方 Token。', go: '填写 GitHub Token', focus: '#gh-token', goal: '只填你自己的官方 Token。' },
    'me-analytics': { what: '只显示你导入或拉取的数字。', go: '先登记站点', href: '#me-sites', goal: '只看你导入或拉取的真实数字。' },
    'me-ai': { what: '选择 AI 服务商；不填也能用内置模板。', go: '添加一个服务商', focus: '#ai-new', goal: '选好服务商；不填也能用模板。' },
    'me-sites': { what: '记下站名、域名和主词。', go: '填写站点名称', focus: '#site-name', goal: '登记站名、域名和主词。' },
  };

  /** 与菜单顺序一致，由 SITE_NAV 生成。 */
  var FLOW = global.QuestNav && QuestNav.mainFlow ? QuestNav.mainFlow() : [];
  /** 分组里没有下一项时，跳进主线的这一站。 */
  var JUMP = { weekly: 'war' };

  function keyFor(route) {
    var h = (route && route.hash) || '';
    if (h === 'war' || h === 'war-s2' || h === 'war-s3' || h === 'war-m' || h === 'war-x') return 'war';
    if (h === 'lib' || h.indexOf('lib-') === 0) return 'lib';
    if (h === 'pm' || h.indexOf('pm-') === 0) return 'pm';
    return HINTS[h] ? h : '';
  }
  function flowId(routeOrHash) {
    var h = typeof routeOrHash === 'string' ? routeOrHash : ((routeOrHash && routeOrHash.hash) || '');
    h = String(h).replace(/^#/, '');
    if (global.QuestNav && QuestNav.locate) {
      var loc = QuestNav.locate(h);
      if (loc && loc.page && loc.page.id) return loc.page.id;
    }
    return h;
  }
  function flowAt(id) {
    var i;
    for (i = 0; i < FLOW.length; i++) if (FLOW[i].id === id) return i;
    return -1;
  }
  function nextOf(routeOrHash) {
    var id = flowId(routeOrHash);
    var i = flowAt(id);
    if (i >= 0) return i < FLOW.length - 1 ? FLOW[i + 1] : null;
    if (global.QuestNav && QuestNav.nextInGroup) {
      var sib = QuestNav.nextInGroup(id);
      if (sib) return { id: sib.id, hash: sib.hash, title: sib.label };
    }
    var jump = JUMP[id];
    if (!jump) return null;
    var j = flowAt(jump);
    return j >= 0 ? FLOW[j] : null;
  }
  function readSave() {
    try {
      if (global.QuestApp && QuestApp.get) {
        var s = QuestApp.get();
        if (s && typeof s === 'object') return s;
      }
    } catch (e) {}
    return {};
  }
  function sitesOf(s) {
    return s && s.sites && Array.isArray(s.sites.items) ? s.sites.items : [];
  }
  function kwItems(s) {
    return s && s.keywords && Array.isArray(s.keywords.items) ? s.keywords.items : [];
  }
  function liveSite(s) {
    var sites = sitesOf(s);
    var pub = Array.isArray(s.publish) ? s.publish : [];
    var live = { '已上线': 1, '已收录': 1, '有点击': 1, '有收入': 1 };
    if (sites.some(function (x) { return x && live[x.status]; })) return true;
    return pub.some(function (p) { return p && p.ok && !p.dry; });
  }
  function learnSteps(s) {
    var done = Array.isArray(s.done) ? s.done : [];
    var cleared = Array.isArray(s.cleared) ? s.cleared : [];
    var ob = s.onboarding || {};
    var days = ob.days || {};
    var seen = ob.tourDone === true || Object.keys(days).some(function (k) { return days[k] === true; });
    return [
      { t: '看过引导', done: seen },
      { t: '完成一课', done: done.length > 0 },
      { t: '通过一章', done: cleared.length > 0 },
    ];
  }
  function stepsFor(key, save) {
    var s = save || readSave();
    if (key === 'path' || key === 'path-quests') return learnSteps(s);
    if (key === 'war-keywords') {
      var items = kwItems(s);
      var scored = items.some(function (k) {
        return k && (String(k.vol || '').trim() || String(k.note || '').trim() || (k.big !== '' && k.big != null) || (k.weak !== '' && k.weak != null));
      });
      var picked = items.some(function (k) { return k && k.star; }) || !!(s.kit && String(s.kit.keyword || '').trim());
      return [
        { t: '记下候选词', done: items.some(function (k) { return k && String(k.kw || '').trim(); }) },
        { t: '填观察打分', done: scored },
        { t: '标出要做的词', done: picked },
      ];
    }
    if (key === 'war-kit') {
      var kit = s.kit || {};
      var checks = kit.checks || {};
      var n = Object.keys(checks).filter(function (id) { return checks[id]; }).length;
      return [
        { t: '填写主词', done: !!String(kit.keyword || '').trim() },
        { t: '写一句话介绍', done: !!String(kit.intro || '').trim() },
        { t: '勾上线自查', done: n > 0 },
      ];
    }
    if (key === 'me-sites') {
      var list = sitesOf(s);
      return [
        { t: '登记站点', done: list.length > 0 },
        { t: '写上主词', done: list.some(function (x) { return x && String(x.kw || '').trim(); }) },
        { t: '记一个月数据', done: list.some(function (x) { return x && x.logs && x.logs.length; }) },
      ];
    }
    if (key === 'work') {
      return [
        { t: '有站点', done: sitesOf(s).length > 0 },
        { t: '已发布', done: liveSite(s) },
        { t: '有数据或复盘', done: (Array.isArray(s.imports) && s.imports.length > 0) || (Array.isArray(s.reviews) && s.reviews.length > 0) || sitesOf(s).some(function (x) { return x && x.logs && x.logs.length; }) },
      ];
    }
    if (key === 'war-publish') {
      var pk = s.kit || {};
      return [
        { t: '助手已填主词', done: !!String(pk.keyword || '').trim() && !!String(pk.intro || '').trim() },
        { t: '台账有站点', done: sitesOf(s).length > 0 },
        { t: '发布成功', done: liveSite(s) },
      ];
    }
    if (key === 'war-share') {
      var sh = Array.isArray(s.shares) ? s.shares : [];
      var out = s.shareDraft && s.shareDraft.out;
      var drafted = !!(out && typeof out === 'object' && Object.keys(out).length);
      return [
        { t: '有可发的内容', done: !!(s.kit && String(s.kit.keyword || '').trim()) || sitesOf(s).length > 0 },
        { t: '生成过文案', done: drafted },
        { t: '记过分发', done: sh.length > 0 },
      ];
    }
    if (key === 'me-analytics') {
      var an = sitesOf(s);
      return [
        { t: '已登记站点', done: an.length > 0 },
        { t: '导入或拉取', done: Array.isArray(s.imports) && s.imports.length > 0 },
        { t: '写入台账', done: an.some(function (x) { return x && x.logs && x.logs.length; }) },
      ];
    }
    if (key === 'work-review') {
      var rv = Array.isArray(s.reviews) ? s.reviews : [];
      var facts = (Array.isArray(s.shares) && s.shares.length > 0) || (Array.isArray(s.publish) && s.publish.some(function (p) { return p && p.ok && !p.dry; })) || (Array.isArray(s.imports) && s.imports.length > 0);
      return [
        { t: '有站点', done: sitesOf(s).length > 0 },
        { t: '有本周事实', done: !!facts },
        { t: '写过复盘', done: rv.length > 0 },
      ];
    }
    if (key === 'war') {
      var wd = Array.isArray(s.done) ? s.done : [];
      return [
        { t: '完成入门一课', done: wd.length > 0 },
        { t: '做完站一任务', done: wd.some(function (id) { return String(id).indexOf('q-s1') === 0; }) },
        { t: '站点已上线', done: liveSite(s) },
      ];
    }
    if (key === 'war-rank') {
      var plan = Array.isArray(s.rankPlan) ? s.rankPlan : [];
      var fav = Array.isArray(s.rankFav) ? s.rankFav : [];
      return [
        { t: '收藏一条', done: fav.length > 0 },
        { t: '加入计划', done: plan.length > 0 },
        { t: '勾完一条', done: plan.some(function (p) { return p && p.done; }) },
      ];
    }
    if (key === 'me') {
      var md = Array.isArray(s.done) ? s.done : [];
      return [
        { t: '有学习记录', done: md.length > 0 || s.xp > 0 },
        { t: '完成过任务', done: md.length > 0 },
        { t: '导出过备份', done: !!s.lastBackupAt },
      ];
    }
    return null;
  }
  function progHtml(steps) {
    if (!steps || !steps.length) return '';
    var cur = -1, i;
    for (i = 0; i < steps.length; i++) { if (!steps[i].done) { cur = i; break; } }
    return '<ol class="page-hint-prog" aria-label="进度">' + steps.map(function (st, idx) {
      var cls = st.done ? 'done' : (idx === cur ? 'current' : '');
      return '<li class="' + cls + '"' + (idx === cur ? ' aria-current="step"' : '') + '>' + (st.done ? '✓ ' : '') + esc(st.t) + '</li>';
    }).join('') + '</ol>';
  }
  function dismissed(key) {
    try {
      var s = global.QuestApp && QuestApp.get ? QuestApp.get() : null;
      return !!(s && s.hints && s.hints.dismissed && s.hints.dismissed[key]);
    } catch (e) { return false; }
  }
  function stepHtml(spec) {
    if (spec.href) return '<a href="' + esc(spec.href) + '">' + esc(spec.go) + '</a>';
    if (spec.focus) return '<button type="button" class="page-hint-go" data-focus="' + esc(spec.focus) + '">' + esc(spec.go) + '</button>';
    return esc(spec.go);
  }
  function panelFor(route) {
    var panelId = { home: 'panel-home', path: 'panel-path', war: 'panel-war', lib: 'panel-lib', me: 'panel-me', start: 'panel-start', guides: 'panel-guides', weekly: 'panel-weekly' }[route && route.section];
    return panelId ? document.getElementById(panelId) : null;
  }
  function mount(route) {
    var oldHints = document.querySelectorAll('.page-hint');
    var hi;
    for (hi = 0; hi < oldHints.length; hi++) oldHints[hi].remove();
    var oldNext = document.querySelectorAll('.flow-next');
    for (hi = 0; hi < oldNext.length; hi++) oldNext[hi].remove();
    var panel = panelFor(route);
    if (!panel || !route) return;
    var key = keyFor(route);
    if (key && !dismissed(key)) {
      var spec = HINTS[key];
      if (spec) {
        var bar = document.createElement('div');
        bar.className = 'page-hint';
        bar.setAttribute('data-hint', key);
        bar.setAttribute('role', 'note');
        bar.innerHTML = '<div class="page-hint-main"><p><b>这个页面是干什么的</b> ' + esc(spec.what) + ' <span class="page-hint-step">第一步：</span>' + stepHtml(spec) + '</p>' +
          (spec.goal ? '<p class="page-hint-goal">目标：' + esc(spec.goal) + '</p>' : '') +
          progHtml(stepsFor(key, readSave())) +
          '</div><a href="#start">新手引导</a><button type="button" class="page-hint-x" aria-label="关闭提示">×</button>';
        panel.insertBefore(bar, panel.firstChild);
      }
    }
    var nxt = nextOf(route);
    if (!nxt) return;
    var foot = document.createElement('p');
    foot.className = 'flow-next';
    foot.innerHTML = '<a class="btn btn-primary btn-sm" href="' + esc(nxt.hash) + '">下一步 → ' + esc(nxt.title) + '</a>';
    panel.appendChild(foot);
  }
  function dismiss(key) {
    if (global.QuestApp && QuestApp.update) {
      QuestApp.update(function (s) {
        var prev = (s.hints && s.hints.dismissed) || {};
        var next = {};
        Object.keys(prev).forEach(function (k) { if (prev[k] === true) next[k] = true; });
        next[key] = true;
        return Object.assign({}, s, { hints: { dismissed: next } });
      });
    }
  }
  document.addEventListener('click', function (e) {
    var x = e.target.closest && e.target.closest('.page-hint-x');
    if (x) {
      var bar = x.closest('.page-hint');
      var key = bar && bar.getAttribute('data-hint');
      if (key) dismiss(key);
      if (bar) bar.remove();
      return;
    }
    var go = e.target.closest && e.target.closest('.page-hint-go');
    if (!go) return;
    var el = document.querySelector(go.getAttribute('data-focus') || '');
    if (!el) return;
    try { if (global.QuestCompact && QuestCompact.reveal) QuestCompact.reveal(el); } catch (err) {}
    try { el.scrollIntoView({ block: 'center' }); } catch (err2) {}
    if (el.focus) { try { el.focus(); } catch (err3) {} }
  }, true);
  global.QuestHints = { mount: mount, keyFor: keyFor, HINTS: HINTS, FLOW: FLOW, nextOf: nextOf, stepsFor: stepsFor };
})(typeof window !== 'undefined' ? window : globalThis);
