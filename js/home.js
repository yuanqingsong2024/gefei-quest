/** 首页 · 白话说明：这是什么、怎么用、今日赚钱榜、为什么做、常见问题 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * 入口定义：action = tab | hash | href
   * tab → 切主站 Tab；hash → 切 Tab + 深链；href → 外链/静态页
   */
  var SECTIONS = [
    {
      id: 'play',
      title: '开始实战',
      emoji: '⚔️',
      blurb: '地图闯关、作战室 Day 清单、任务板',
      cards: [
        {
          emoji: '🗺️',
          title: '地图',
          desc: '六座岛主线：序章 → 站一 → … → 放大',
          action: 'tab',
          target: 'map',
        },
        {
          emoji: '📋',
          title: '作战室',
          desc: '站一～放大固定 Day1–7，勾选=线下做完',
          action: 'hash',
          target: 'war',
        },
        {
          emoji: '🏝️',
          title: '站一作战室',
          desc: '定词 · 上线 · GSC',
          action: 'hash',
          target: 'war',
        },
        {
          emoji: '🔎',
          title: '站二作战室',
          desc: '一词着陆页（灰锁至站一 Boss）',
          action: 'hash',
          target: 'war-s2',
        },
        {
          emoji: '📚',
          title: '站三作战室',
          desc: '内容扩容与内链',
          action: 'hash',
          target: 'war-s3',
        },
        {
          emoji: '💰',
          title: '变现作战室',
          desc: 'AdSense / 联盟门槛清单',
          action: 'hash',
          target: 'war-m',
        },
        {
          emoji: '🚀',
          title: '放大作战室',
          desc: '多站与流程放大',
          action: 'hash',
          target: 'war-x',
        },
        {
          emoji: '✅',
          title: '任务板',
          desc: '当前岛可勾选任务详情',
          action: 'tab',
          target: 'quest',
        },
        {
          emoji: '⛵',
          title: '商船',
          desc: '知识补给卷轴与收入图鉴',
          action: 'tab',
          target: 'ship',
        },
        {
          emoji: '🏅',
          title: '成就',
          desc: '徽章墙',
          action: 'tab',
          target: 'ach',
        },
      ],
    },
    {
      id: 'res',
      title: '资源与羊毛',
      emoji: '🧺',
      blurb: '免费工具、托管、变现入口、闲鱼·非实物',
      cards: [
        {
          emoji: '📦',
          title: '资源库',
          desc: '分类筛选 + 搜索（站内页签）',
          action: 'tab',
          target: 'resources',
        },
        {
          emoji: '🔗',
          title: '资源库整页',
          desc: '独立页，方便收藏分享',
          action: 'href',
          target: '#lib',
        },
        {
          emoji: '🛠️',
          title: '羊毛与免费工具',
          desc: 'GSC / GA4 / Clarity / Pages / 域名…',
          action: 'href',
          target: '#lib-tools',
        },
        {
          emoji: '🐟',
          title: '闲鱼·非实物',
          desc: '数字商品与技能服务（合法向）',
          action: 'href',
          target: '#lib-xianyu',
        },
        {
          emoji: '📝',
          title: '渠道完整笔记',
          desc: '#guide-channels-and-tips',
          action: 'href',
          target: '#guide-channels-and-tips',
        },
        {
          emoji: '🤝',
          title: '同路人方法',
          desc: '公开摘要，非付费社群内容',
          action: 'href',
          target: '#guide-peer-methods',
        },
      ],
    },
    {
      id: 'starter',
      title: '模板与手册',
      emoji: '📄',
      blurb: '可部署单页 + Day 作战手册',
      cards: [
        {
          emoji: '1️⃣',
          title: '站一 Starter',
          desc: '替换 YOURBRAND 即可上线',
          action: 'href',
          target: './starters/station-one/',
        },
        {
          emoji: '2️⃣',
          title: '站二 Starter',
          desc: '替换 TARGET_KEYWORD',
          action: 'href',
          target: './starters/station-two/',
        },
        {
          emoji: '📖',
          title: '站一手册',
          desc: 'Day1–7 定词上线 GSC',
          action: 'href',
          target: '#guide-station-one-playbook',
        },
        {
          emoji: '📖',
          title: '站二手册',
          desc: '一词着陆与收录',
          action: 'href',
          target: '#guide-station-two-playbook',
        },
        {
          emoji: '📖',
          title: '站三手册',
          desc: '内容与内链',
          action: 'href',
          target: '#guide-station-three-playbook',
        },
        {
          emoji: '📖',
          title: '变现手册',
          desc: '申请门槛与诚实声明',
          action: 'href',
          target: '#guide-monetize-playbook',
        },
        {
          emoji: '📖',
          title: '放大手册',
          desc: '多站与流程',
          action: 'href',
          target: '#guide-scale-playbook',
        },
      ],
    },
    {
      id: 'docs',
      title: '进度与文档',
      emoji: '🗂️',
      blurb: '开发状态、路线图、设置',
      cards: [
        {
          emoji: '📊',
          title: 'MASTER 状态',
          desc: 'T01–T83 关闭总览',
          action: 'href',
          target: '#dev-MASTER-STATUS',
        },
        {
          emoji: '🧭',
          title: 'Phase 2 路线图',
          desc: '站一作战室',
          action: 'href',
          target: '#dev-PHASE2-ROADMAP',
        },
        {
          emoji: '🧭',
          title: 'Phase 3 路线图',
          desc: '站二作战室',
          action: 'href',
          target: '#dev-PHASE3-ROADMAP',
        },
        {
          emoji: '🧭',
          title: 'Phase 4 路线图',
          desc: '站三 + 变现',
          action: 'href',
          target: '#dev-PHASE4-ROADMAP',
        },
        {
          emoji: '🧭',
          title: 'Phase 5 路线图',
          desc: '放大',
          action: 'href',
          target: '#dev-PHASE5-ROADMAP',
        },
        {
          emoji: '☑️',
          title: '任务清单 TASKS',
          desc: '开发勾选记录',
          action: 'href',
          target: '#dev-TASKS',
        },
        {
          emoji: '⚙️',
          title: '设置',
          desc: '静音 · 存档导出导入 · 重置',
          action: 'tab',
          target: 'settings',
        },
      ],
    },
  ];

  function cardHtml(c) {
    var attrs = '';
    if (c.action === 'href') {
      return (
        '<a class="home-card" href="' +
        esc(c.target) +
        '" ' +
        (c.target.indexOf('http') === 0 || c.target.indexOf('./docs/') === 0 || c.target.indexOf('./starters/') === 0 || c.target.indexOf('./resources') === 0 || c.target.indexOf('./TASKS') === 0
          ? 'target="_blank" rel="noopener noreferrer"'
          : '') +
        '>' +
        '<span class="home-card-emoji" aria-hidden="true">' +
        esc(c.emoji) +
        '</span>' +
        '<span class="home-card-title">' +
        esc(c.title) +
        '</span>' +
        '<span class="home-card-desc">' +
        esc(c.desc) +
        '</span>' +
        '</a>'
      );
    }
    attrs =
      ' type="button" data-home-action="' +
      esc(c.action) +
      '" data-home-target="' +
      esc(c.target) +
      '"';
    return (
      '<button class="home-card"' +
      attrs +
      '>' +
      '<span class="home-card-emoji" aria-hidden="true">' +
      esc(c.emoji) +
      '</span>' +
      '<span class="home-card-title">' +
      esc(c.title) +
      '</span>' +
      '<span class="home-card-desc">' +
      esc(c.desc) +
      '</span>' +
      '</button>'
    );
  }

  function costLabel(cost) {
    var s = String(cost == null ? '' : cost).trim();
    var first = (s.split(/[；;，,]/)[0] || '').trim();
    if (!first || first === '0' || first === '0元' || first === '免费' || /^0(?!\d)/.test(first)) return '免费起步';
    return first.length > 12 ? first.slice(0, 12) + '…' : first;
  }
  function diffDots(n) {
    n = Math.max(0, Math.min(5, +n || 0));
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
    return '<span class="rank-diff" data-difficulty="' + n + '" aria-label="难度 ' + n + '/5">' + s + '</span>';
  }
  function homeCounts() {
    var plats = (global.QUEST_PLATFORMS && global.QUEST_PLATFORMS.PLATFORMS) || [];
    var rank = global.QUEST_RANK || {};
    var dayItems = (rank.latest && rank.days && rank.days[rank.latest] && rank.days[rank.latest].items) || [];
    var guides = ((global.QuestNav && global.QuestNav.GUIDES) || []).filter(function (g) { return g.group === 'playbook'; });
    return {
      platforms: plats.length,
      rank: dayItems.length,
      days: (rank.dates || []).length,
      templates: (global.QuestTools && global.QuestTools.TEMPLATES || []).length,
      guides: guides.length,
      changelog: (global.QUEST_CHANGELOG || []).length,
    };
  }
  function latestRankItems() {
    var list = [];
    try {
      if (global.QuestRank && typeof QuestRank.latestItems === 'function') list = QuestRank.latestItems() || [];
    } catch (_) {}
    if (!list.length) {
      var rank = global.QUEST_RANK || {};
      if (rank.latest && rank.days && rank.days[rank.latest]) list = rank.days[rank.latest].items || [];
    }
    return list.slice(0, Math.min(10, list.length));
  }

  var HOME_FAQ = [
    ['怎么开始？', '点「我是新手，从这里开始」，按学习、做站、赚钱三步走。也可以先看今日赚钱榜，挑一条试一周。'],
    ['数据存在哪？', '进度只存在你自己的浏览器里，不上传。换电脑或换浏览器之前，到「我的进度」导出 JSON，再到新浏览器导入。'],
    ['要不要付费？', '不用付费。这个网站免费使用，不卖课，也不含付费社群里的内容。'],
    ['能保证赚钱吗？', '不承诺收益。赚钱榜和平台页只整理公开、合法的渠道，规则和额度会变，以各平台官网为准。'],
    ['和哥飞是什么关系？', '非官方。这里按公开分享的方法做学习整理，方便新手按步骤做英文出海小站。'],
  ];
  var ROUTE_LABEL = {
    work: '工作台', 'work-review': '每周复盘', war: '作战日程', 'war-s2': '站二作战室', 'war-s3': '站三作战室', 'war-m': '变现作战室', 'war-x': '放大作战室',
    'war-kit': '站一实操助手', 'war-keywords': '选词练习板', 'war-rank': '每日赚钱榜', 'war-publish': '发布上线', 'war-share': '内容分发',
    path: '学习路线', 'path-quests': '任务清单', lib: '资源库', pm: '平台变现', me: '我的进度', 'me-accounts': '账号中心', 'me-analytics': '数据分析',
    'me-ai': 'AI 设置', 'me-sites': '站点台账', 'me-stats': '学习统计', start: '新手引导', guides: '手册与模板', weekly: '每周补给', changelog: '更新日志',
  };
  function routeLabel(h) {
    if (ROUTE_LABEL[h]) return ROUTE_LABEL[h];
    if (h.indexOf('lib-') === 0) return '资源库';
    if (h.indexOf('pm-') === 0) return '平台变现';
    if (h.indexOf('guide-') === 0) return '手册';
    return '上次打开的页面';
  }
  function continueNext(state) {
    state = state || {};
    var done = Array.isArray(state.done) ? state.done : [];
    var sites = state.sites && Array.isArray(state.sites.items) ? state.sites.items : [];
    var plan = Array.isArray(state.rankPlan) ? state.rankPlan : [];
    if (!done.length && !sites.length && !plan.length) return null;
    if (sites.length && global.QuestWork && typeof QuestWork.siteSteps === 'function') {
      if (!Array.isArray(state.publish)) state.publish = [];
      if (!Array.isArray(state.imports)) state.imports = [];
      if (!Array.isArray(state.shares)) state.shares = [];
      if (!Array.isArray(state.reviews)) state.reviews = [];
      var i, steps, nx;
      for (i = 0; i < sites.length; i++) {
        steps = QuestWork.siteSteps(state, sites[i]) || [];
        nx = steps.filter(function (x) { return !x.done; })[0];
        if (nx) return { text: (sites[i].name || '未命名站点') + ' · ' + nx.label, href: nx.href || '#work', btn: '继续' };
      }
      return { text: (sites[0].name || '站点') + ' · 打开工作台接着看', href: '#work', btn: '继续' };
    }
    var undone = plan.filter(function (p) { return p && !p.done; })[0];
    if (undone) return { text: '实操计划 · ' + (undone.name || '下一条'), href: '#war-rank', btn: '继续' };
    if (plan.length) return { text: '实操计划里的条目都勾过了', href: '#war-rank', btn: '继续' };
    var last = typeof state.lastRoute === 'string' ? state.lastRoute : '';
    if (last && last !== 'home' && last.indexOf('home-') !== 0) return { text: routeLabel(last), href: '#' + last, btn: '继续' };
    var q = global.QuestStats && QuestStats.nextQuests ? QuestStats.nextQuests(state, 1)[0] : null;
    if (q) return { text: q.title, href: '#path-quests', btn: '继续' };
    return { text: '任务清单', href: '#path-quests', btn: '继续' };
  }

  function sitesSnap(raw) {
    var T = global.QuestTools, I = global.QuestIcons.svg; if (!T) return '';
    raw = raw || {};
    var S = T.summary(JSON.parse(JSON.stringify(raw)));
    if (!S.count) return '<p class="snap-sites" id="home-sites-snap"><a href="#me-sites">' + I('ledger') + '站点台账</a>：还没有登记站点，站一上线后记一笔。</p>';
    return '<p class="snap-sites" id="home-sites-snap"><a href="#me-sites">' + I('ledger') + '站点台账</a>：<b>' + S.count + '</b> 个站' +
      (S.t ? ' · ' + esc(S.month) + ' 合计 曝光 <b>' + S.t.imp + '</b> · 点击 <b>' + S.t.clicks + '</b> · 收入 <b>$' + S.t.usd.toFixed(2) + '</b>' + (S.t.cny ? ' + <b>¥' + S.t.cny.toFixed(2) + '</b>' : '') : ' · 还没有月度记录') + '</p>';
  }
  function snapshot() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null'); } catch (_) {}
    if (!raw || typeof raw.xp !== 'number') {
      return '<div class="snap-empty"><p>还没有进度。点「开始站一」勾下第一项，这里会显示你的等级、XP 与连击。</p></div>' + sitesSnap(raw);
    }
    var P = global.QuestProgress, lv = 1, title = '', pct = 0;
    try {
      lv = P.getLevel(raw.xp); title = P.getTitle(lv);
      var xp = P.xpProgress(raw.xp); pct = Math.round((xp.pct != null ? xp.pct : (xp.ratio || 0) * 100) || 0);
    } catch (_) {}
    return '<div class="snap-grid">' +
      '<div class="snap-item"><b>Lv.' + esc(lv) + '</b><span>' + esc(title) + '</span></div>' +
      '<div class="snap-item"><b>' + esc(raw.xp) + '</b><span>XP</span></div>' +
      '<div class="snap-item"><b>' + esc(raw.streak || 0) + '</b><span>连击天数</span></div>' +
      '<div class="snap-item"><b>' + esc((raw.done || []).length) + '</b><span>已完成任务</span></div>' +
      '</div>' + sitesSnap(raw) + (pct ? '<div class="snap-bar"><i style="width:' + Math.min(100, pct) + '%"></i></div>' : '');
  }

  function renderHome(root, state) {
    if (!root) return;
    var I = global.QuestNav.icon;
    var rank = global.QUEST_RANK || {};
    var items = latestRankItems();
    var date = rank.latest || '';
    var next = continueNext(state);
    var rankBody = items.length
      ? '<ol class="home-rank-list" id="home-rank-list">' + items.map(function (it) {
        var cost = String(it.cost == null ? '' : it.cost);
        var short = costLabel(cost);
        return '<li><a class="home-rank-row" href="#war-rank" data-name="' + esc(it.name) + '" data-type="' + esc(it.type) + '" data-cost="' + esc(cost) + '" data-difficulty="' + esc(it.difficulty) + '">' +
          '<span class="home-rank-no">' + esc(it.rank) + '</span>' +
          '<span class="home-rank-name" title="' + esc(it.name) + '"><span class="home-rank-name-text">' + esc(it.name) + '</span>' +
          '<span class="home-rank-cost-full" title="' + esc(cost) + '">' + esc(cost) + '</span></span>' +
          '<span class="home-rank-meta"><span class="pill">' + esc(it.type) + '</span>' +
          '<span class="home-rank-cost" title="' + esc(cost) + '">' + esc(short) + '</span>' +
          diffDots(it.difficulty) + '</span></a></li>';
      }).join('') + '</ol>'
      : '<p class="home-rank-empty">今天的赚钱榜还没有发布。稍后再来，或先打开<a href="#war-rank">每日赚钱榜</a>看说明。</p>';
    var howto = [
      ['#start-learn', '① 学', '先看学习路线，知道每一步在做什么。'],
      ['#start-do', '② 做', '按实施步骤选词、做页面、再发布。'],
      ['#start-earn', '③ 赚', '看每日赚钱榜，挑一条先试一周。'],
    ];
    root.innerHTML =
      '<section class="hero hero-home" aria-label="首页">' +
      '<div class="hero-inner"><div class="hero-copy">' +
      '<p class="hero-kicker">写给想做副业、做英文出海小站的新手</p>' +
      '<h1 class="hero-title">跟着哥飞的方法做英文出海小站，并收集整理靠谱的赚钱和副业渠道</h1>' +
      '<p class="hero-sub">这里每天更新赚钱榜。你能拿到一条按步骤走的学习路线、做站工具，还有每日赚钱榜。不承诺收入。</p>' +
      '<div class="hero-cta"><a class="btn btn-primary" href="#start" data-tour="cta">' + I('flag') + '我是新手，从这里开始</a>' +
      '<a class="btn btn-ghost" href="#home-rank">' + I('trophy') + '直接看今日赚钱榜</a></div>' +
      '</div></div></section>' +
      '<div class="home-wrap">' +
      (next ? '<aside class="home-continue" id="home-continue"><p>继续上次：<b>' + esc(next.text) + '</b></p><a class="btn btn-primary btn-sm" href="' + esc(next.href) + '">' + esc(next.btn) + '</a></aside>' : '') +
      '<section class="lp-sec" id="home-howto" data-tour="howto"><div class="sec-head"><h2>' + I('flag') + '这个网站怎么用</h2></div>' +
      '<ol class="home-howto">' + howto.map(function (s) {
        return '<li><a href="' + s[0] + '"><b>' + s[1] + '</b><span>' + esc(s[2]) + '</span></a></li>';
      }).join('') + '</ol></section>' +
      '<section class="home-rank" id="home-rank" data-tour="rank" aria-label="今日赚钱榜">' +
      '<div class="home-rank-head"><div><h2>' + I('trophy') + '今日赚钱榜</h2>' +
      '<p>' + (date ? '<time id="home-rank-date" datetime="' + esc(date) + '">' + esc(date) + '</time> · ' : '') + '每日更新 · 不保证收益</p></div>' +
      '<a class="btn btn-sm btn-primary" href="#war-rank">查看完整榜单</a></div>' +
      rankBody + '</section>' +
      '<section class="lp-sec" id="home-why"><div class="sec-head"><h2>为什么做这个网站</h2></div><div class="home-why">' +
      '<p>想做副业或英文出海小站时，新手常常不知道先做什么。这个站把公开的方法收成一条能跟着走的路线，并把靠谱渠道整理成每天更新的赚钱榜。</p>' +
      '<ul><li>不承诺收益。</li><li>榜单每条附来源链接，以官方为准。</li><li>进度只存在你自己的浏览器。</li></ul></div></section>' +
      '<section class="lp-sec" id="home-faq"><div class="sec-head"><h2>常见问题</h2></div><div class="faq">' +
      HOME_FAQ.map(function (qa) {
        return '<details><summary>' + esc(qa[0]) + '</summary><p>' + esc(qa[1]) + '</p></details>';
      }).join('') + '</div></section></div>';
  }

  global.QuestHome = { renderHome: renderHome, SECTIONS: SECTIONS };
})(typeof window !== 'undefined' ? window : globalThis);
