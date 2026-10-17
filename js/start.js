/** 新手引导 #start · 三条路线 + 前 7 天清单。截图在 assets/start/。 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function I(n) { return global.QuestIcons ? global.QuestIcons.svg(n) : ''; }

  var TRACKS = [
    {
      id: 'learn', no: '①', name: '学习', icon: 'map', blurb: '先把地图和任务走通',
      img: 'assets/start/learn.webp', alt: '学习路线的关卡地图页面顶部',
      steps: [
        { t: '看六章顺序，确认自己现在在哪一章。', links: [['#path', '打开关卡地图']] },
        { t: '只勾已经在线下做完的任务，勾选会计入进度。', links: [['#path-quests', '打开任务清单']] },
        { t: '免费工具、托管和变现渠道可以筛选、搜索。', links: [['#lib', '打开资源库']] },
        { t: '国内和海外平台的门槛、分成和来源，以官网为准。', links: [['#pm', '打开平台变现']] },
        { t: '每个阶段有一份作战手册，对照着做。', links: [['#guides', '打开手册']] },
      ],
    },
    {
      id: 'do', no: '②', name: '实施', icon: 'target', blurb: '从一个词做到复盘',
      img: 'assets/start/do.webp', alt: '工作台页面顶部，显示已登记站点的下一步',
      steps: [
        { t: '记下候选词。页内「关键词灵感」可查免费联想词并加入候选。', links: [['#war-keywords', '打开选词']] },
        { t: '选起步模板（单页、工具站、对比或术语表），填主词和简介。', links: [['#war-kit', '打开实操助手']] },
        { t: '先预演，确认后再写入 GitHub Pages。', links: [['#war-publish', '打开发布上线']] },
        { t: '生成各平台文案，用官方免费链接自己发帖。', links: [['#war-share', '打开内容分发']] },
        { t: '导入 CSV，或连接 Google 只读拉取 Search Console、GA4、AdSense。', links: [['#me-analytics', '数据分析'], ['#me-accounts', 'Google 连接']] },
        { t: '写本周做了什么、数据变化和下周 3 件事。各站进度看工作台。', links: [['#work-review', '每周复盘'], ['#work', '工作台']] },
      ],
    },
    {
      id: 'earn', no: '③', name: '赚钱', icon: 'coin', blurb: '从今天的榜选一条',
      img: 'assets/start/earn.webp', alt: '每日赚钱榜页面顶部',
      steps: [
        { t: '看今天的条目、类型、成本、难度和来源。不保证收入。', links: [['#war-rank', '打开赚钱榜']] },
        { t: '在榜单条目上点「加入实操计划」，先挑 1 条试一周。', links: [['#war-rank', '去加入计划']] },
        { t: '已加入的计划会出现在赚钱榜和站一实操助手页。', links: [['#war-kit', '查看实操计划']] },
        { t: '榜单卡片上的「AI 点评/生成今日步骤」交给赚钱项目实施官。服务商在 AI 设置里切换，默认是 Grok Bot 模式。', links: [['#me-ai', '打开 AI 设置']] },
      ],
    },
  ];

  var DAYS = [
    { id: 'd1', n: '第 1 天', t: '打开关卡地图，在学习、实施、赚钱里选定一条。', links: [['#path', '关卡地图']] },
    { id: 'd2', n: '第 2 天', t: '在任务清单勾一项你确实做完的任务。', links: [['#path-quests', '任务清单']] },
    { id: 'd3', n: '第 3 天', t: '在资源库打开一个免费工具或托管页，额度以官网为准。', links: [['#lib', '资源库']] },
    { id: 'd4', n: '第 4 天', t: '在选词练习板记下 3 个候选词，可以用关键词灵感。', links: [['#war-keywords', '选词练习板']] },
    { id: 'd5', n: '第 5 天', t: '在站一实操助手里选一个模板，填上主词。', links: [['#war-kit', '实操助手']] },
    { id: 'd6', n: '第 6 天', t: '看每日赚钱榜，把 1 条加入实操计划。', links: [['#war-rank', '赚钱榜']] },
    { id: 'd7', n: '第 7 天', t: '打开工作台看下一步，或写一条每周复盘。', links: [['#work', '工作台'], ['#work-review', '每周复盘']] },
  ];

  function obOf(state) {
    if (global.QuestSave && QuestSave.mergeOnboarding) return QuestSave.mergeOnboarding(state && state.onboarding);
    var o = (state && state.onboarding) || {};
    return { tourDone: o.tourDone === true, tourSeenAt: o.tourSeenAt || null, days: o.days || {} };
  }
  function doneCount(days) {
    var n = 0;
    DAYS.forEach(function (d) { if (days[d.id] === true) n++; });
    return n;
  }
  function linksHtml(links) {
    return links.map(function (l) { return '<a class="btn btn-sm" href="' + l[0] + '">' + esc(l[1]) + '</a>'; }).join('');
  }

  function trackFromLocation() {
    var h = '';
    try { h = (location.hash || '').replace(/^#/, '').split('?')[0]; } catch (_) { h = ''; }
    if (h === 'start-learn' || h === 'start-do' || h === 'start-earn') return h.slice(6);
    return 'learn';
  }
  function render(root, state) {
    if (!root) return;
    var ob = obOf(state);
    var n = doneCount(ob.days);
    var activeId = trackFromLocation();
    root.innerHTML =
      '<div class="start-page" id="start-page">' +
      '<div class="start-top"><div><p class="start-lead">三条路线，选一条先走 7 天</p>' +
      '<p id="start-progress">前 7 天已完成 <b id="start-done">' + n + '</b> / 7</p></div>' +
      '<button type="button" class="btn btn-primary" id="start-tour">' + I('flag') + '重新播放导览</button></div>' +
      '<div class="start-cards" id="start-tracks" role="tablist" aria-label="三条路线">' +
      TRACKS.map(function (tr) {
        var on = tr.id === activeId;
        return '<button type="button" class="start-card' + (on ? ' on' : '') + '" role="tab" id="start-tab-' + tr.id + '" data-track="' + tr.id + '" aria-selected="' + (on ? 'true' : 'false') + '" aria-controls="start-panel-' + tr.id + '"' + (on ? '' : ' tabindex="-1"') + '>' +
          '<span class="card-ico">' + I(tr.icon) + '</span><span><b>' + tr.no + ' ' + esc(tr.name) + '</b><small>' + esc(tr.blurb) + '</small></span></button>';
      }).join('') + '</div>' +
      TRACKS.map(function (tr) {
        return '<div class="start-panel" role="tabpanel" id="start-panel-' + tr.id + '" data-track="' + tr.id + '" aria-labelledby="start-tab-' + tr.id + '"' + (tr.id === activeId ? '' : ' hidden') + '>' +
          '<div class="start-body"><img class="start-shot" id="start-img-' + tr.id + '" src="' + tr.img + '" width="640" height="400" alt="' + esc(tr.alt) + '" loading="lazy" />' +
          '<ol class="start-steps">' + tr.steps.map(function (s) {
            return '<li><span>' + esc(s.t) + '</span> ' + linksHtml(s.links) + '</li>';
          }).join('') + '</ol></div></div>';
      }).join('') +
      '<section class="start-week"><h2 class="block-title">' + I('calendar') + '前 7 天清单</h2>' +
      '<ul class="start-days">' + DAYS.map(function (d) {
        var on = ob.days[d.id] === true;
        return '<li><label for="start-day-' + d.id + '"><input type="checkbox" id="start-day-' + d.id + '" data-day="' + d.id + '"' + (on ? ' checked' : '') + ' /> <span><b>' + esc(d.n) + '</b> ' + esc(d.t) + '</span></label> ' + linksHtml(d.links) + '</li>';
      }).join('') + '</ul></section></div>';

    function show(id) {
      root.querySelectorAll('#start-tracks [role="tab"]').forEach(function (b) {
        var on = b.getAttribute('data-track') === id;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) b.removeAttribute('tabindex'); else b.setAttribute('tabindex', '-1');
      });
      root.querySelectorAll('.start-panel').forEach(function (p) { p.hidden = p.getAttribute('data-track') !== id; });
    }
    root.querySelector('#start-tracks').addEventListener('click', function (e) {
      var b = e.target.closest('[data-track]');
      if (b) show(b.getAttribute('data-track'));
    });
    root.querySelectorAll('[data-day]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (!global.QuestApp) return;
        var id = cb.getAttribute('data-day');
        QuestApp.update(function (s) {
          var cur = obOf(s);
          var days = {};
          DAYS.forEach(function (d) { if (cur.days[d.id] === true) days[d.id] = true; });
          if (cb.checked) days[id] = true; else delete days[id];
          return Object.assign({}, s, { onboarding: { tourDone: cur.tourDone, tourSeenAt: cur.tourSeenAt, days: days } });
        });
        var count = root.querySelectorAll('[data-day]:checked').length;
        var el = root.querySelector('#start-done');
        if (el) el.textContent = String(count);
      });
    });
  }

  global.QuestStart = { render: render, TRACKS: TRACKS, DAYS: DAYS };
})(typeof window !== 'undefined' ? window : globalThis);
