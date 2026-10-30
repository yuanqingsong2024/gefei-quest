/** 首页 · 白话说明：这是什么、怎么用、今日赚钱榜、为什么做、常见问题 */
(function (global) {
  function pageSvg(hash, fallback) {
    var Nv = global.QuestNav;
    if (hash && Nv && Nv.iconName && Nv.iconName(hash)) return Nv.icon(Nv.iconName(hash));
    return global.QuestIcons ? QuestIcons.svg(fallback || 'compass') : '';
  }
  function groupSvg(id, fallback) {
    var nav = global.QuestNav && QuestNav.SITE_NAV, i, name = fallback || 'compass';
    if (nav) for (i = 0; i < nav.length; i++) if (nav[i].id === id && nav[i].icon) name = nav[i].icon;
    return global.QuestIcons ? QuestIcons.svg(name) : '';
  }
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
          emoji: '🗺️',
          title: '完整主线说明',
          desc: '找词→建站→SEO→变现→收款',
          action: 'href',
          target: '#guide-full-method-playbook',
        },
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

  function deadlineOf(it) {
    var blob = [it && it.name, it && it.summary, it && it.why].filter(Boolean).join(' ');
    var end = blob.match(/(\d{1,2}月\d{1,2}日[^，。；\n]{0,12}截止)/);
    if (end) return end[1];
    var day = blob.match(/(\d{1,2}月\d{1,2}日)/);
    return day ? day[1] : '';
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
    ['怎么开始？', '看首页中间的主线路径，点「今天这一关」的开始按钮。也可以先看今日赚钱榜 Top 3，挑一条试一周。'],
    ['数据存在哪？', '进度只存在你自己的浏览器里，不上传。换电脑或换浏览器之前，到「我的进度」导出 JSON，再到新浏览器导入。'],
    ['要不要付费？', '不用付费。这个网站免费使用，不卖课，也不含付费社群里的内容。'],
    ['能保证赚钱吗？', '不承诺收益。赚钱榜和平台页只整理公开、合法的渠道，规则和额度会变，以各平台官网为准。'],
    ['和哥飞是什么关系？', '非官方。这里按公开分享的方法做学习整理，方便新手按步骤做英文出海小站。'],
  ];
  var ROUTE_LABEL = {
    work: '工作台', 'work-review': '每周复盘', war: '7 天作战日程', 'war-s2': '7 天作战日程', 'war-s3': '7 天作战日程', 'war-m': '7 天作战日程', 'war-x': '7 天作战日程',
    'war-kit': '站一实操助手', 'war-keywords': '选词练习板', 'war-rank': '每日赚钱榜', 'war-publish': '发布上线', 'war-share': '内容分发',
    path: '学习路线', 'path-quests': '任务清单', lib: '资源库', pm: '平台变现', me: '我的进度', 'me-accounts': '账号中心', 'me-analytics': '数据分析',
    'me-ai': 'AI 设置', 'me-sites': '站点台账', 'me-stats': '学习统计', start: '新手引导', guides: '手册与模板', weekly: '每周补给', changelog: '更新日志',
  };
  function routeLabel(h) {
    try {
      if (global.QuestNav && QuestNav.locate) {
        var loc = QuestNav.locate(h);
        if (loc.page && loc.page.label) return loc.page.label;
      }
    } catch (_) {}
    if (ROUTE_LABEL[h]) return ROUTE_LABEL[h];
    if (h.indexOf('lib-') === 0) return '资源库';
    if (h.indexOf('pm-') === 0) return '平台变现';
    if (h.indexOf('guide-') === 0) return '手册与模板';
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
    var T = global.QuestTools; if (!T) return '';
    raw = raw || {};
    var S = T.summary(JSON.parse(JSON.stringify(raw)));
    if (!S.count) return '<p class="snap-sites" id="home-sites-snap"><a href="#me-sites">' + pageSvg('#me-sites', 'ledger') + '站点台账</a>：还没有登记站点，站一上线后记一笔。</p>';
    return '<p class="snap-sites" id="home-sites-snap"><a href="#me-sites">' + pageSvg('#me-sites', 'ledger') + '站点台账</a>：<b>' + S.count + '</b> 个站' +
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

  function asArr(v) { return Array.isArray(v) ? v : []; }
  function sitesOf(save) {
    return save && save.sites && Array.isArray(save.sites.items) ? save.sites.items : [];
  }
  function hostOf(u) {
    return String(u || '').replace(/^https?:\/\//i, '').replace(/[\/?#].*$/, '').toLowerCase();
  }
  function kwReady(save) {
    var items = save && save.keywords && Array.isArray(save.keywords.items) ? save.keywords.items : [];
    var i;
    for (i = 0; i < items.length; i++) {
      if (items[i] && String(items[i].kw || '').trim()) return true;
    }
    return !!(save && save.kit && String(save.kit.keyword || '').trim());
  }
  function isLiveStatus(status) {
    return status === '已上线' || status === '已收录' || status === '有点击' || status === '有收入';
  }
  function isPublished(save) {
    var sites = sitesOf(save);
    var pub = asArr(save && save.publish);
    var i, s, h;
    for (i = 0; i < sites.length; i++) {
      s = sites[i];
      if (!s) continue;
      if (isLiveStatus(s.status)) return true;
      h = hostOf(s.domain);
      if (h && pub.some(function (p) { return p && p.ok && !p.dry && hostOf(p.url) === h; })) return true;
    }
    return false;
  }
  function hasData(save) {
    if (asArr(save && save.imports).length) return true;
    return sitesOf(save).some(function (s) { return s && Array.isArray(s.logs) && s.logs.length > 0; });
  }
  function hasReview(save) {
    return asArr(save && save.reviews).length > 0;
  }
  function visitorStarted(save) {
    if (!save || typeof save !== 'object') return false;
    if (asArr(save.done).length || kwReady(save) || sitesOf(save).length) return true;
    if (save.xp > 0) return true;
    if (asArr(save.rankPlan).length || asArr(save.rankFav).length) return true;
    if (asArr(save.publish).length || asArr(save.imports).length || asArr(save.reviews).length || asArr(save.shares).length) return true;
    if (asArr(save.weeklyClaimed).length || asArr(save.cleared).length) return true;
    if (save.kit && String(save.kit.intro || '').trim()) return true;
    var ob = save.onboarding || {};
    if (ob.tourDone === true) return true;
    if (typeof ob.tourSeenAt === 'string' && ob.tourSeenAt) return true;
    var days = ob.days || {}, k;
    for (k in days) { if (Object.prototype.hasOwnProperty.call(days, k) && days[k] === true) return true; }
    if (typeof save.lastRoute === 'string' && save.lastRoute && save.lastRoute !== 'home' && save.lastRoute.indexOf('home-') !== 0) return true;
    return false;
  }
  function oneStep(stage, title, why, href, btn) {
    return { stage: stage, title: title, why: why, href: href, btn: btn };
  }
  function firstLesson(save) {
    var title = '完成第一课';
    var why = '引导已经开始。到任务清单完成入门第一课，只勾你确实做完的。';
    var btn = '去完成第一课';
    try {
      var D = global.QuestData;
      var done = asArr(save && save.done);
      if (D && Array.isArray(D.QUESTS)) {
        var q = null, i;
        for (i = 0; i < D.QUESTS.length; i++) {
          if (D.QUESTS[i] && !D.QUESTS[i].side && done.indexOf(D.QUESTS[i].id) < 0) { q = D.QUESTS[i]; break; }
        }
        if (q) {
          title = '完成第一课「' + q.title + '」';
          if (q.action) why = String(q.action).replace(/\s+/g, ' ').slice(0, 48);
          btn = '去完成「' + q.title + '」';
        }
      }
    } catch (e) {}
    return oneStep('学习', title, why, '#path-quests', btn);
  }

  /** 学习 → 实施 → 赚钱里唯一的下一步。纯函数：只读 save，不改存档。 */
  function nextStep(save) {
    save = save || {};
    if (!visitorStarted(save)) {
      return oneStep('学习', '从『新手引导』开始', '先看学习、实施、赚钱三条路线，再决定今天做哪一件。', '#start', '我是新手，从这里开始');
    }
    if (!asArr(save.done).length && !kwReady(save) && !sitesOf(save).length) return firstLesson(save);
    if (!kwReady(save)) {
      return oneStep('实施', '记一个候选词', '还没有候选词。在选词练习板比较几个英文词，决定值不值得做。', '#war-keywords', '去选词练习板');
    }
    if (!sitesOf(save).length) {
      return oneStep('实施', '在「我的站点台账」登记站点', '已经有候选词。下一步写下站名、域名和主词。', '#me-sites', '去我的站点台账');
    }
    if (!isPublished(save)) {
      return oneStep('实施', '把站点发布上线', '站点还没上线。用发布上线写进仓库，或在台账把状态改成「已上线」。', '#war-publish', '去发布上线');
    }
    if (!hasData(save)) {
      return oneStep('赚钱', '看一次真实数据', '站点已上线，还没有导入或拉取的数字。到数据分析看你自己的数据。', '#me-analytics', '去数据分析');
    }
    if (!hasReview(save)) {
      return oneStep('赚钱', '写本周复盘', '数据已经有了。花十分钟写下本周做了什么，以及下周 3 件事。', '#work-review', '去每周复盘');
    }
    return oneStep('赚钱', '打开每日赚钱榜，挑 1 条试一周', '课、站、数据和复盘都有记录了。榜单不保证收益，挑一条加入本周实操即可。', '#war-rank', '打开每日赚钱榜');
  }

  var PATH_DEFS = [
    { id: 'start', label: '新手引导', hash: '#start', icon: 'flag' },
    { id: 'path', label: '学习路线', hash: '#path', icon: 'map' },
    { id: 'war', label: '做站 Day', hash: '#war', icon: 'calendar-check' },
    { id: 'war-publish', label: '发布上线', hash: '#war-publish', icon: 'rocket' },
    { id: 'war-rank', label: '试渠道', hash: '#war-rank', icon: 'trophy' },
  ];
  function nodeComplete(save, id) {
    if (id === 'start') return visitorStarted(save);
    if (id === 'path') return asArr(save && save.done).length > 0 || kwReady(save) || sitesOf(save).length > 0;
    if (id === 'war') return kwReady(save);
    if (id === 'war-publish') return isPublished(save);
    if (id === 'war-rank') return hasData(save) || hasReview(save) || asArr(save && save.rankPlan).length > 0;
    return false;
  }
  function pathNodes(save) {
    var nodes = PATH_DEFS.map(function (d) {
      return { id: d.id, label: d.label, hash: d.hash, icon: d.icon, done: nodeComplete(save, d.id) };
    });
    var current = nodes.length - 1;
    var i;
    for (i = 0; i < nodes.length; i++) {
      if (!nodes[i].done) { current = i; break; }
    }
    return nodes.map(function (n, i) {
      var status = i < current ? 'done' : (i === current ? 'current' : 'locked');
      return { id: n.id, label: n.label, hash: n.hash, icon: n.icon, done: n.done, status: status, current: i === current };
    });
  }
  function renderHome(root, state) {
    if (!root) return;
    var I = global.QuestNav.icon;
    var rank = global.QUEST_RANK || {};
    var items = latestRankItems();
    var date = rank.latest || '';
    var next = continueNext(state);
    var step = nextStep(state);
    var nodes = pathNodes(state);
    var nodesHtml = nodes.map(function (n) {
      var cls = 'home-path-node is-' + n.status + (n.done && n.status !== 'done' ? ' is-done' : '');
      var id = n.current ? ' id="home-path-today"' : '';
      var mark = n.status === 'done' || (n.done && n.current) ? '✓' : '';
      return '<li class="' + cls + '"' + id + (n.current ? ' aria-current="step"' : '') + '>' +
        '<a href="' + n.hash + '">' +
        '<span class="home-path-dot" aria-hidden="true">' + mark + '</span>' +
        '<span class="home-path-label">' + pageSvg(n.hash, n.icon) + esc(n.label) + '</span>' +
        '</a></li>';
    }).join('');
    var top3 = items.slice(0, 3);
    var top3Body = top3.length
      ? '<ol class="hero-top3-list">' + top3.map(function (it) {
        var src = (global.QuestSources ? QuestSources.render(QuestSources.of(it, date), { compact: true, date: date }) : '');
        return '<li><a class="hero-top3-row" href="#war-rank" data-name="' + esc(it.name) + '" data-rank="' + esc(it.rank) + '">' +
          '<span class="hero-top3-no">' + esc(it.rank) + '</span>' +
          '<span class="hero-top3-name">' + esc(it.name) + '</span>' +
          '<span class="pill" data-type="' + esc(it.type) + '">' + esc(it.type) + '</span></a>' +
          (src ? '<div class="hero-top3-src">' + src + '</div>' : '') + '</li>';
      }).join('') + '</ol>'
      : '<p class="hero-top3-empty">今天的赚钱榜还没有发布。稍后再来，或先打开<a href="#war-rank">每日赚钱榜</a>看说明。</p>';
    root.innerHTML =
      '<div class="home-hero-stage">' +
      '<section class="hero hero-home" aria-label="首页" data-reveal>' +
      '<div class="hero-inner home-inner hero-has-art"><div class="hero-copy">' +
      '<p class="hero-steps" aria-label="主线五步：挖词、上站、SEO、变现、放大"><span>挖词</span><i aria-hidden="true">→</i><span>上站</span><i aria-hidden="true">→</i><span>SEO</span><i aria-hidden="true">→</i><span>变现</span><i aria-hidden="true">→</i><span>放大</span></p>' +
      '<h1 class="hero-title">做英文出海小站</h1>' +
      '<p class="hero-sub">跟着主线路径，从新手引导做到试渠道。不承诺收入。</p>' +
      '<p class="hero-playbook"><a class="btn btn-sm" href="#guide-full-method-playbook">打开完整主线：找词→建站→收款</a></p>' +
      (next ? '<aside class="home-continue" id="home-continue"><p>继续上次：<b>' + esc(next.text) + '</b></p><a class="btn btn-primary btn-sm" href="' + esc(next.href) + '">' + esc(next.btn) + '</a></aside>' : '') +
      '</div>' +
      '<figure class="hero-art"><img src="assets/art/hero-voyage.webp" width="1280" height="720" decoding="async" fetchpriority="high" alt="水墨风插画：一艘载着笔记本电脑的小帆船从群山驶向海上日出，天空漂着网页卡片" /></figure>' +
      '</div></section>' +
      '<section class="home-benefit home-inner" data-reveal aria-label="这一站能帮你做什么">' +
      '<p>挑一条公开渠道，按步骤试一周。</p>' +
      '<small>榜单整理公开信息，方便你开工；不构成收益承诺。</small>' +
      '</section>' +
      '<section class="home-band band-a home-path-band" id="home-path" data-tour="path" data-reveal>' +
      '<div class="home-inner home-path-layout">' +
      '<ol class="home-path">' + nodesHtml + '</ol>' +
      '<div class="home-path-rail" id="home-rank">' +
      '<aside class="home-path-side" data-tour="cta" aria-label="今天这一关">' +
      '<img class="home-path-illo" src="assets/art/today-quest.webp" width="640" height="640" loading="lazy" decoding="async" alt="水墨风插画：背包旅人沿灯笼照亮的石阶登山，山顶插着红旗" />' +
      '<p class="home-path-kicker">' + esc(step.stage || '') + '</p>' +
      '<h2>今天这一关</h2>' +
      '<p class="home-path-title">' + esc(step.title) + '</p>' +
      '<p class="home-path-why">' + esc(step.why) + '</p>' +
      '<a class="btn btn-primary" id="home-cta" href="' + esc(step.href) + '">' + pageSvg(step.href, 'flag') + esc(step.btn || '开始') + '</a>' +
      '</aside>' +
      '<aside class="hero-top3" id="hero-top3" aria-label="今日赚钱榜 Top 3">' +
      '<div class="hero-top3-head"><h2>今日赚钱榜 Top 3</h2>' +
      (date ? '<time class="hero-top3-date" datetime="' + esc(date) + '">' + esc(date) + '</time>' : '') +
      '<a class="hero-top3-more" href="#war-rank">打开今日完整榜</a></div>' +
      top3Body + '</aside>' +
      '</div></div></section>' +
      '</div>' +
      '<section class="home-band home-today-band" data-reveal>' +
      '<div class="home-inner">' +
      (global.QuestStats && typeof QuestStats.todayCard === 'function' ? QuestStats.todayCard(state) : '') +
      '<div class="kw-card-slot home-kw-slot"></div>' +
      '</div></section>' +
      '<section class="home-band band-b" id="home-split" data-reveal><div class="home-inner">' +
      '<details class="home-more">' +
      '<summary>为什么做 · 常见问题</summary>' +
      '<div class="home-pair">' +
      '<section id="home-why"><div class="sec-head"><h2>' + I('bulb') + '为什么做这个网站</h2></div><div class="home-why">' +
      '<p>想做副业或英文出海小站时，新手常常不知道先做什么。这个站把公开的方法收成一条能跟着走的路线，并把靠谱渠道整理成每天更新的赚钱榜。</p>' +
      '<ul><li>不承诺收益。</li><li>榜单每条附来源链接，以官方为准。</li><li>进度只存在你自己的浏览器。</li></ul></div></section>' +
      '<section id="home-faq"><div class="sec-head"><h2>' + I('list') + '常见问题</h2></div><div class="faq">' +
      HOME_FAQ.map(function (qa) {
        return '<details><summary>' + esc(qa[0]) + '</summary><p>' + esc(qa[1]) + '</p></details>';
      }).join('') + '</div></section></div></details></div></section>';
    var slot = root.querySelector('.home-kw-slot');
    if (slot && global.QuestKeywordCard && typeof QuestKeywordCard.mount === 'function') {
      QuestKeywordCard.mount(slot);
    }
    if (global.QuestShell && QuestShell.mountReveal) QuestShell.mountReveal(root);
  }

  global.QuestHome = { renderHome: renderHome, SECTIONS: SECTIONS, FAQ: HOME_FAQ, nextStep: nextStep, pathNodes: pathNodes };
})(typeof window !== 'undefined' ? window : globalThis);
