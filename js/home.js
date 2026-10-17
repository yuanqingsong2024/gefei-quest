/** 首页 · 产品页：今日赚钱榜 Top 10、三条路线、功能入口 */
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

  function costClause(cost) {
    var s = String(cost == null ? '' : cost).trim();
    var first = (s.split(/[；;。]/)[0] || '').trim();
    return first || s;
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

  var HOME_TRACKS = [
    { id: 'learn', hash: '#start-learn', icon: 'map', name: '学习', lines: ['按章节看关卡地图和任务清单', '资源库、平台变现和作战手册都在这条路上', '只勾你已经在线下做完的任务'] },
    { id: 'do', hash: '#start-do', icon: 'target', name: '实施', lines: ['选词练习板里可以打开关键词灵感', '实操助手选模板，再发布和分发', '数据分析、Google 连接和每周复盘'] },
    { id: 'earn', hash: '#start-earn', icon: 'coin', name: '赚钱', lines: ['看每日赚钱榜的类型、成本和难度', '把一条加进实操计划，先试一周', '榜单卡片上的 AI 按钮在 AI 设置里切换'] },
  ];
  var HOME_FEATS = [
    { href: '#war', icon: 'calendar', title: '作战日程', desc: '五个阶段各一张 Day 1–7 清单，和任务清单共用勾选。' },
    { href: '#war-kit', icon: 'kit', title: '实操助手', desc: '四种起步模板，填主词后预览并下载页面。' },
    { href: '#war-keywords', icon: 'tag', title: '选词', desc: '给候选词打分，关键词灵感可以加入候选。' },
    { href: '#war-publish', icon: 'rocket', title: '发布上线', desc: '先预演，再写入 GitHub Pages，并登记到站点台账。' },
    { href: '#war-share', icon: 'external', title: '内容分发', desc: '生成各平台文案，用官方免费链接自己去发。' },
    { href: '#me-analytics', icon: 'chart', title: '数据分析', desc: '导入 CSV，或到账号中心用 Google 只读拉取。' },
    { href: '#pm', icon: 'coin', title: '平台变现', desc: '国内和海外平台的门槛、分成和来源，以官网为准。', id: 'home-res' },
    { href: '#me-ai', icon: 'sparkle', title: 'AI 助手', desc: '选词、赚钱榜和实操助手上的 AI 按钮，服务商在 AI 设置。' },
  ];
  var HOME_FAQ = [
    ['进度存在哪里？', '只存在你当前浏览器的 localStorage，不上传服务器。换设备请在「我的进度」导出 / 导入 JSON。'],
    ['能保证赚钱吗？', '不保证。赚钱榜和平台页只整理公开、合法的渠道，额度与规则会变，以各平台官网为准。'],
    ['和哥飞是什么关系？', '非官方。这里是基于公开分享的方法学习整理，不含付费社群内容。'],
    ['学习路线和实战作战室有什么区别？', '同一份进度的两种看法：学习路线按章节列全部任务；作战室把每站压成 Day 1–7 日程。任一处勾选，另一处同步。'],
    ['今日赚钱榜的数字从哪来？', '来自站内已发布的每日榜单（类型、成本、难度和来源）。首页只显示最新一天的前 10 条，完整内容和免责声明在每日赚钱榜。'],
    ['新手引导可以再看一次吗？', '可以。打开「新手引导」点「重新播放导览」，或用页脚的「新手导览」。前 7 天清单的勾选记在本机存档里。'],
  ];

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
    var N = global.QuestNav, I = N.icon;
    var C = homeCounts();
    var rank = global.QUEST_RANK || {};
    var items = latestRankItems();
    var date = rank.latest || '';
    var stats = [
      ['platforms', C.platforms, '收录平台'],
      ['rank', C.rank, '今日榜'],
      ['days', C.days, '累计天数'],
      ['templates', C.templates, '起步模板'],
      ['guides', C.guides, '作战手册'],
      ['changelog', C.changelog, '更新日志'],
    ];
    var rankBody = items.length
      ? '<ol class="home-rank-list" id="home-rank-list">' + items.map(function (it) {
        var cost = String(it.cost == null ? '' : it.cost);
        var short = costClause(cost);
        return '<li><a class="home-rank-row" href="#war-rank" data-name="' + esc(it.name) + '" data-type="' + esc(it.type) + '" data-cost="' + esc(cost) + '" data-difficulty="' + esc(it.difficulty) + '">' +
          '<span class="home-rank-no">' + esc(it.rank) + '</span>' +
          '<span class="home-rank-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
          '<span class="home-rank-meta"><span class="pill">' + esc(it.type) + '</span>' +
          '<span class="home-rank-cost" title="' + esc(cost) + '">' + esc(short) + '</span>' +
          diffDots(it.difficulty) + '</span></a></li>';
      }).join('') + '</ol>'
      : '<p class="home-rank-empty">今天的赚钱榜还没有发布。稍后再来，或先打开<a href="#war-rank">每日赚钱榜</a>看说明。</p>';
    root.innerHTML =
      '<section class="hero hero-home" aria-label="首页">' +
      '<div class="hero-inner">' +
      '<div class="hero-copy">' +
      '<p class="hero-kicker">出海建站 · SEO · 练习营</p>' +
      '<h1 class="hero-title">把出海小站当成一场闯关：每天一份赚钱榜、一套实操工具、一条清晰路线</h1>' +
      '<p class="hero-sub">从选词、上线到收录和变现，每一步都有清单和模板。进度只存在这台浏览器。不承诺收入。</p>' +
      '<div class="hero-cta"><a class="btn btn-primary" href="#start" data-tour="cta">' + I('flag') + '开始新手引导</a><a class="btn btn-ghost" href="#work" data-tour="work">' + I('target') + '进入工作台</a></div>' +
      '</div>' +
      '<ul class="home-stats" aria-label="站内真实数据">' + stats.map(function (s) {
        return '<li class="home-stat" data-stat="' + s[0] + '"><b>' + esc(s[1]) + '</b><span>' + s[2] + '</span></li>';
      }).join('') + '</ul></div></section>' +
      '<div class="home-wrap">' +
      '<section class="home-rank" id="home-rank-card" data-tour="rank" aria-label="今日赚钱榜">' +
      '<div class="home-rank-head"><div><h2>' + I('trophy') + '今日赚钱榜</h2>' +
      '<p>' + (date ? '<time id="home-rank-date" datetime="' + esc(date) + '">' + esc(date) + '</time> · ' : '') + '每日更新 · 不保证收益</p></div>' +
      '<a class="btn btn-sm btn-primary" href="#war-rank">查看完整榜单</a></div>' +
      rankBody + '</section>' +
      '<section class="lp-sec" id="home-steps" data-tour="tracks"><div class="sec-head"><h2>三条路线</h2><p>选一条，进入新手引导里对应的标签。</p></div>' +
      '<div class="home-tracks">' + HOME_TRACKS.map(function (tr) {
        return '<a class="home-track" href="' + tr.hash + '"><span class="card-ico">' + I(tr.icon) + '</span><b>' + esc(tr.name) + '</b><ul>' +
          tr.lines.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('') +
          '</ul><span class="home-track-go">进入' + esc(tr.name) + '</span></a>';
      }).join('') + '</div></section>' +
      '<section class="lp-sec" id="home-sections"><div class="sec-head"><h2>可以做的事</h2><p>这些都是站里已经有的页面。</p></div>' +
      '<div id="home-tools"><div class="feat-grid">' + HOME_FEATS.map(function (f) {
        return '<a class="feat-card" href="' + f.href + '"' + (f.id ? ' id="' + f.id + '"' : '') + '><span class="card-ico">' + I(f.icon) + '</span><b>' + esc(f.title) + '</b><span>' + esc(f.desc) + '</span></a>';
      }).join('') + '</div></div>' +
      '<p class="home-guides-line" id="home-guides"><a href="#guides">' + I('book') + '手册与模板</a></p></section>' +
      '<div class="home-split">' + (state && global.QuestStats ? global.QuestStats.todayCard(state) : '<section class="lp-sec" id="home-today"></section>') +
      '<section class="lp-sec" id="home-progress" data-tour="me"><div class="sec-head"><h2>我的进度</h2></div><div class="glass snap">' + snapshot() +
      '<div class="snap-links"><a class="btn btn-sm" href="#path">' + I('map') + '学习路线</a><a class="btn btn-sm" href="#me">' + I('user') + '我的进度</a></div></div></section></div>' +
      '<section class="lp-sec" id="home-faq"><div class="sec-head"><h2>常见问题</h2></div><div class="faq">' +
      HOME_FAQ.map(function (qa) {
        return '<details><summary>' + esc(qa[0]) + '</summary><p>' + esc(qa[1]) + '</p></details>';
      }).join('') + '</div></section></div>';
  }

  global.QuestHome = { renderHome: renderHome, SECTIONS: SECTIONS };
})(typeof window !== 'undefined' ? window : globalThis);
