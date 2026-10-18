/** 唯一名称表 + 路由 + 统一壳（顶栏 / 区块头带 / 页脚）+ 旧链接兼容 */
(function (global) {
  var I = function (n, c) { return global.QuestIcons ? global.QuestIcons.svg(n, c) : ''; };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var SITE_NAME = '出海小站练站营';
  /** 顶栏、下拉、底部栏、页脚、网站地图、标题和 FLOW 都从这里生成。路由 hash 不改。 */
  var SITE_NAV = [
    { id: 'home', label: '首页', short: '首页', icon: 'home', hash: '#home', owns: ['home', 'home-*'],
      desc: '从挖词到多站的完整练习路线。' },
    { id: 'start', label: '新手引导', short: '新手', icon: 'flag', hash: '#start', owns: ['start', 'start-*'],
      desc: '学习、实施、赚钱三条路线，前 7 天清单，以及可以重播的新手导览。' },
    { id: 'learn', label: '学习', short: '学习', icon: 'book-open', hash: '#path', tint: 'learn',
      desc: '学习路线、任务清单、手册与模板、资源库。',
      children: [
        { id: 'path', label: '学习路线', icon: 'map', hash: '#path', owns: ['path'],
          desc: '按章节看关卡地图，知道自己在哪一章。' },
        { id: 'path-quests', label: '任务清单', icon: 'checklist', hash: '#path-quests', owns: ['path-quests'],
          desc: '勾选当前章节里已经做完的任务。' },
        { id: 'guides', label: '手册与模板', icon: 'file-text', hash: '#guides', owns: ['guides', 'guide-*'],
          desc: '作战手册、单页模板和渠道笔记。' },
        { id: 'lib', label: '资源库', icon: 'archive', hash: '#lib', owns: ['lib', 'lib-*'],
          desc: '免费工具、托管、渠道和同路人方法。' },
        { id: 'weekly', label: '每周补给', icon: 'calendar', hash: '#weekly', owns: ['weekly'],
          desc: '每周几张短卡片，已暂停更新。' },
      ] },
    { id: 'do', label: '实施', short: '实施', icon: 'tools', hash: '#war', tint: 'do',
      desc: '从 7 天日程做到发布、分发和工作台。',
      children: [
        { id: 'war', label: '7 天作战日程', icon: 'calendar-check', hash: '#war', owns: ['war', 'war-s2', 'war-s3', 'war-m', 'war-x'],
          desc: '五个阶段各一张 7 天清单，勾选和任务清单同一份进度。' },
        { id: 'war-keywords', label: '选词练习板', icon: 'tag', hash: '#war-keywords', owns: ['war-keywords'],
          desc: '给候选词打分，决定适不适合练手。' },
        { id: 'war-kit', label: '站一实操助手', icon: 'wand', hash: '#war-kit', owns: ['war-kit'],
          desc: '填主词，生成可以上线的页面。' },
        { id: 'me-sites', label: '我的站点台账', icon: 'ledger', hash: '#me-sites', owns: ['me-sites'],
          desc: '记下站名、域名和主词，按月记数据。' },
        { id: 'war-publish', label: '发布上线', icon: 'rocket', hash: '#war-publish', owns: ['war-publish'],
          desc: '用细粒度 Token 把页面写进你的仓库。' },
        { id: 'war-share', label: '内容分发', icon: 'send', hash: '#war-share', owns: ['war-share'],
          desc: '生成各平台文案，由你自己去发布。' },
        { id: 'work', label: '工作台', icon: 'dashboard', hash: '#work', owns: ['work'],
          desc: '看每个站点现在该做的下一步。' },
      ] },
    { id: 'earn', label: '赚钱', short: '赚钱', icon: 'coin', hash: '#war-rank', tint: 'earn',
      desc: '看数据、写复盘、选今天的一条。',
      children: [
        { id: 'me-analytics', label: '数据分析', icon: 'chart-line', hash: '#me-analytics', owns: ['me-analytics'],
          desc: '只显示你导入或拉取的数字。' },
        { id: 'work-review', label: '每周复盘', icon: 'clipboard-check', hash: '#work-review', owns: ['work-review'],
          desc: '写下本周事实和下周 3 件事。' },
        { id: 'war-rank', label: '每日赚钱榜', icon: 'trophy', hash: '#war-rank', owns: ['war-rank', 'war-rank-xianyu'],
          desc: '公开渠道整理成的每日榜，不保证收益。' },
        { id: 'pm', label: '平台变现', icon: 'wallet', hash: '#pm', owns: ['pm', 'pm-*'],
          desc: '各平台的门槛和分成，以官网为准。' },
      ] },
    { id: 'mine', label: '我的', short: '我的', icon: 'user', hash: '#me', dataNav: 'me', tint: 'neutral',
      desc: '进度、统计、账号和 AI 设置。',
      children: [
        { id: 'me', label: '我的进度', icon: 'gauge', hash: '#me', owns: ['me'],
          desc: '等级、成就，以及本机备份。' },
        { id: 'me-stats', label: '学习统计', icon: 'bar-chart', hash: '#me-stats', owns: ['me-stats'],
          desc: '打卡热力图、连续天数和各章进度。' },
        { id: 'me-accounts', label: '账号中心', icon: 'key', hash: '#me-accounts', owns: ['me-accounts'],
          desc: '只保存你自己的官方 Token。' },
        { id: 'me-ai', label: 'AI 设置', icon: 'sparkle', hash: '#me-ai', owns: ['me-ai'],
          desc: '选择 AI 服务商；不填也能用内置模板。' },
        { id: 'changelog', label: '更新日志', icon: 'history', hash: '#changelog', owns: ['changelog'],
          desc: '这个网站最近改了什么。' },
      ] },
  ];
  var SITEMAP = { id: 'sitemap', label: '网站地图', icon: 'sitemap', hash: '#sitemap', desc: '顶栏六个入口以外的全部页面。sitemap 站点地图' };
  var DEV_SECTION = { id: 'dev', label: '开发者文档', icon: 'code', hash: '#dev', desc: '项目开发过程文档，供维护者查阅。' };
  /** 主线顺序。必须是 SITE_NAV 从上到下的子序列。 */
  var FLOW_IDS = ['start', 'path', 'path-quests', 'war', 'war-keywords', 'war-kit', 'me-sites', 'war-publish', 'war-share', 'work', 'me-analytics', 'work-review', 'war-rank', 'pm'];
  function tabsFrom(groupId) {
    var g = null, i;
    for (i = 0; i < SITE_NAV.length; i++) if (SITE_NAV[i].id === groupId) g = SITE_NAV[i];
    return ((g && g.children) || []).map(function (c) { return { id: c.id, label: c.label, icon: c.icon, hash: c.hash }; });
  }
  var PATH_TABS = tabsFrom('learn');
  var WAR_TABS = tabsFrom('do');
  var EARN_TABS = tabsFrom('earn');
  var ME_TABS = tabsFrom('mine');

  var STATIONS = [
    { n: 1, label: '站一', name: '站一 · 上线第一站', icon: 'island1', hash: '#war', guide: 'station-one-playbook' },
    { n: 2, label: '站二', name: '站二 · 一词一站', icon: 'island2', hash: '#war-s2', guide: 'station-two-playbook' },
    { n: 3, label: '站三', name: '站三 · 扩内页', icon: 'island3', hash: '#war-s3', guide: 'station-three-playbook' },
    { n: 4, label: '变现', name: '变现 · 广告与联盟', icon: 'chart', hash: '#war-m', guide: 'monetize-playbook' },
    { n: 5, label: '放大', name: '放大 · 复制到多站', icon: 'rocket', hash: '#war-x', guide: 'scale-playbook' },
  ];

  var LIB_CATS = [
    { id: 'tools', label: '免费工具', icon: 'wrench' },
    { id: 'hosting', label: '托管与域名', icon: 'globe' },
    { id: 'monetize', label: '变现渠道', icon: 'coin' },
    { id: 'paths', label: '可试路径', icon: 'route' },
    { id: 'xianyu', label: '闲鱼·非实物', icon: 'fish' },
    { id: 'tips', label: '技巧速记', icon: 'bulb' },
    { id: 'peers', label: '同路人方法', icon: 'users' },
  ];

  var GUIDES = [
    { id: 'station-one-playbook', group: 'playbook', title: '站一手册', icon: 'island1', desc: '定词、上线一页、挂统计与 GSC。' },
    { id: 'station-two-playbook', group: 'playbook', title: '站二手册', icon: 'island2', desc: '一个真实需求词做一站，看曝光。' },
    { id: 'station-three-playbook', group: 'playbook', title: '站三手册', icon: 'island3', desc: '扩内页、内链与收录。' },
    { id: 'monetize-playbook', group: 'playbook', title: '变现手册', icon: 'chart', desc: 'AdSense / 联盟门槛与路径文档。' },
    { id: 'scale-playbook', group: 'playbook', title: '放大手册', icon: 'rocket', desc: '复用流程到多站，避免空壳。' },
    { id: 'tpl-station-one', group: 'template', title: '站一单页模板', icon: 'template', href: 'starters/station-one/', desc: '英文单页 Starter，替换 YOURBRAND 即可部署。' },
    { id: 'tpl-station-two', group: 'template', title: '站二单页模板', icon: 'template', href: 'starters/station-two/', desc: '关键词单页 Starter，替换 TARGET_KEYWORD。' },
    { id: 'channels-and-tips', group: 'note', title: '渠道与羊毛笔记', icon: 'coin', desc: '免费工具、托管、变现、可试路径与闲鱼完整笔记。' },
    { id: 'peer-methods', group: 'note', title: '同路人方法笔记', icon: 'users', desc: '公开的同类出海建站方法摘要。' },
    { id: 'resource-expansion', group: 'note', title: '资源库扩容配方', icon: 'toolbox', desc: '新增资源条目的收录标准。' },
    { id: 'weekly-template', group: 'note', title: '每周补给模板', icon: 'calendar', desc: '每周知识卡的写法模板。' },
  ];
  var GUIDE_GROUPS = [
    { id: 'playbook', label: '作战手册' },
    { id: 'template', label: '开站模板' },
    { id: 'note', label: '笔记' },
  ];
  var DEV_DOCS = [
    { id: 'PHASE20-HOME-ONBOARDING', title: 'Phase 20 · 新手引导 + 首页重做' },
    { id: 'MASTER-STATUS', title: '总进度 MASTER-STATUS' },
    { id: 'PHASE17-SHARE', title: 'Phase 17 · 内容分发（免费）' },
    { id: 'PHASE18-DESIGN', title: 'Phase 18 · 紧凑页面 + Google 连接 + 工作台' },
    { id: 'PHASE19-ROADMAP', title: 'Phase 19 · 路线图（免费优先）' },
    { id: 'PHASE16-WORKBENCH', title: 'Phase 16 · 实操工作台' },
    { id: 'PHASE15-PLATFORMS', title: 'Phase 15 · 平台变现（国内 + 海外）' },
    { id: 'PHASE14-AI-PROVIDERS', title: 'Phase 14 · AI 服务商列表' },
    { id: 'PHASE13-AI', title: 'Phase 13 · AI 设置与助手' },
    { id: 'PHASE12-RANK', title: 'Phase 12 · 每日赚钱榜' },
    { id: 'PHASE11-POLISH', title: 'Phase 11 · 网站质感打磨' },
    { id: 'PHASE10-STATS', title: 'Phase 10 · 学习统计与更新日志' },
    { id: 'PHASE9-TOOLS', title: 'Phase 9 · 实操工具' },
    { id: 'PHASE8-IA', title: 'Phase 8 · 信息架构' },
    { id: 'PHASE7-DESIGN', title: 'Phase 7 · 设计方案' },
    { id: 'PHASE5-ROADMAP', title: 'Phase 5 · 路线图' },
    { id: 'PHASE5-DESIGN', title: 'Phase 5 · 设计' },
    { id: 'PHASE4-ROADMAP', title: 'Phase 4 · 路线图' },
    { id: 'PHASE4-DESIGN', title: 'Phase 4 · 设计' },
    { id: 'PHASE3-ROADMAP', title: 'Phase 3 · 路线图' },
    { id: 'PHASE3-DESIGN', title: 'Phase 3 · 设计' },
    { id: 'PHASE2-ROADMAP', title: 'Phase 2 · 路线图' },
    { id: 'PHASE2-DESIGN', title: 'Phase 2 · 设计' },
    { id: 'TASKS', title: '任务表 TASKS' },
    { id: 'TESTLOG', title: '测试记录 TESTLOG' },
  ];

  /** 旧 hash → 新 hash（永久兼容） */
  var ALIASES = {
    '': 'home', map: 'path', quest: 'path-quests', quests: 'path-quests', ship: 'weekly',
    ach: 'me', settings: 'me', resources: 'lib', 'war-s1': 'war', guide: 'guides', docs: 'guides',
    tools: 'lib-tools', hosting: 'lib-hosting', monetize: 'lib-monetize', paths: 'lib-paths',
    xianyu: 'lib-xianyu', tips: 'lib-tips', peers: 'lib-peers', 'lib-docs': 'guides', 'lib-all': 'lib', rank: 'war-rank', ai: 'me-ai', 'ai-settings': 'me-ai', stats: 'me-stats', 'me-changelog': 'changelog', updates: 'changelog', platforms: 'pm', accounts: 'me-accounts', 'account-center': 'me-accounts', publish: 'war-publish', share: 'war-share', dashboard: 'work', 'war-work': 'work', review: 'work-review', 'weekly-review': 'work-review', 'me-review': 'work-review', fupan: 'work-review', distribute: 'war-share', 'war-distribute': 'war-share', deploy: 'war-publish', analytics: 'me-analytics', import: 'me-analytics', 'data-import': 'me-analytics', workbench: 'me-accounts', monetize: 'pm', 'pm-all': 'pm', cn: 'pm-cn', intl: 'pm-global', overseas: 'pm-global', 'cn-short-drama': 'pm-cn-drama', 'guide-start': 'start', onboarding: 'start', newbie: 'start',
    'home-today': 'work', 'home-progress': 'me', 'home-sections': 'start', 'home-tools': 'war', 'home-steps': 'start', 'home-res': 'pm', 'home-guides': 'guides',
    learn: 'path', do: 'war', practice: 'war', earn: 'war-rank', money: 'war-rank', res: 'lib',
  };
  function isDevId(id) { return DEV_DOCS.some(function (d) { return d.id === id; }); }
  function guideById(id) { return GUIDES.filter(function (g) { return g.id === id; })[0]; }
  function navById(id) {
    if (id === 'dev') return DEV_SECTION;
    if (id === 'sitemap') return SITEMAP;
    var i, n, c;
    for (i = 0; i < SITE_NAV.length; i++) if (SITE_NAV[i].id === id) return SITE_NAV[i];
    for (i = 0; i < SITE_NAV.length; i++) {
      n = SITE_NAV[i];
      if (!n.children) continue;
      for (c = 0; c < n.children.length; c++) if (n.children[c].id === id) return n.children[c];
    }
    return null;
  }
  function matchPat(pat, id) {
    if (!pat) return false;
    if (pat.charAt(pat.length - 1) === '*') {
      var pre = pat.slice(0, -1);
      return id.indexOf(pre) === 0 && id.length >= pre.length;
    }
    return pat === id;
  }
  function pageOwns(page, id) {
    return !!page && (page.owns || []).some(function (p) { return matchPat(p, id); });
  }
  function hashId(raw) {
    return canonical(String(raw || '').replace(/^#/, '').split('?')[0]);
  }
  function locate(raw) {
    var id = hashId(raw);
    var i, g, c;
    for (i = 0; i < SITE_NAV.length; i++) {
      g = SITE_NAV[i];
      if (g.children) {
        for (c = 0; c < g.children.length; c++) {
          if (pageOwns(g.children[c], id)) return { group: g, page: g.children[c], id: id };
        }
      } else if (pageOwns(g, id)) return { group: g, page: g, id: id };
    }
    if (id === 'sitemap') return { group: null, page: SITEMAP, id: id };
    if (id === 'dev' || id.indexOf('dev-') === 0) return { group: null, page: DEV_SECTION, id: id };
    return { group: null, page: null, id: id };
  }
  function pagesOwning(raw) {
    var id = hashId(raw);
    var out = [];
    SITE_NAV.forEach(function (g) {
      if (g.children) g.children.forEach(function (c) { if (pageOwns(c, id)) out.push(c); });
      else if (pageOwns(g, id)) out.push(g);
    });
    return out;
  }
  function mainFlow() {
    var want = {};
    FLOW_IDS.forEach(function (id) { want[id] = true; });
    var out = [];
    function walk(n) {
      if (want[n.id]) out.push({ id: n.id, hash: n.hash, title: n.label });
      (n.children || []).forEach(walk);
    }
    SITE_NAV.forEach(walk);
    return out;
  }
  function nextInGroup(raw) {
    var loc = locate(raw);
    if (!loc.group || !loc.group.children || !loc.page) return null;
    var kids = loc.group.children, i;
    for (i = 0; i < kids.length; i++) if (kids[i].id === loc.page.id) return kids[i + 1] || null;
    return null;
  }

  function canonical(raw) {
    raw = String(raw || '').replace(/^#/, '');
    if (raw.indexOf('cat-') === 0) raw = raw.slice(4);
    return Object.prototype.hasOwnProperty.call(ALIASES, raw) ? ALIASES[raw] : raw;
  }

  /** 解析 hash → { section, view, param, hash } */
  function parse(raw) {
    var h = canonical(raw);
    if (/^home(-|$)/.test(h)) return { section: 'home', view: 'home', param: h === 'home' ? '' : h, hash: h };
    var startTrack = /^start(?:-(learn|do|earn))?$/.exec(h);
    if (startTrack) return { section: 'start', view: 'start', param: startTrack[1] || '', hash: h };
    if (h === 'path') return { section: 'path', view: 'map', hash: h };
    if (h === 'path-quests') return { section: 'path', view: 'quests', hash: h };
    var st = { war: 1, 'war-s2': 2, 'war-s3': 3, 'war-m': 4, 'war-x': 5 };
    if (h === 'war-kit') return { section: 'war', view: 'kit', hash: h };
    if (h === 'war-keywords') return { section: 'war', view: 'keywords', hash: h };
    if (h === 'work') return { section: 'war', view: 'work', hash: h };
    if (h === 'work-review') return { section: 'war', view: 'review', hash: h };
    if (h === 'war-share') return { section: 'war', view: 'share', hash: h };
    if (h === 'war-publish') return { section: 'war', view: 'publish', hash: h };
    if (h === 'me-accounts') return { section: 'me', view: 'accounts', hash: h };
    if (h === 'me-analytics') return { section: 'me', view: 'analytics', hash: h };
    if (h === 'war-rank' || h === 'war-rank-xianyu') return { section: 'war', view: 'rank', param: h === 'war-rank-xianyu' ? 'xianyu' : '', hash: h };
    if (h === 'me-sites') return { section: 'me', view: 'sites', hash: h };
    if (h === 'me-ai') return { section: 'me', view: 'ai', hash: h };
    if (h === 'me-stats') return { section: 'me', view: 'stats', hash: h };
    if (h === 'changelog') return { section: 'me', view: 'changelog', hash: h };
    if (st[h]) return { section: 'war', view: 'war', param: st[h], hash: h };
    if (h === 'pm' || h.indexOf('pm-') === 0) return { section: 'lib', view: 'pm', param: h === 'pm' ? '' : h.slice(3), hash: h };
    if (/^(cn|gl)-[a-z]/.test(h)) return { section: 'lib', view: 'pm', param: h, hash: 'pm-' + h };
    if (h === 'lib') return { section: 'lib', view: 'lib', param: 'all', hash: h };
    if (h.indexOf('lib-') === 0) return { section: 'lib', view: 'lib', param: h.slice(4), hash: h };
    if (h === 'guides') return { section: 'guides', view: 'guides', hash: h };
    if (h.indexOf('guide-') === 0) return { section: 'guides', view: 'doc', param: h.slice(6), hash: h };
    if (h === 'dev') return { section: 'dev', view: 'dev', hash: h };
    if (h.indexOf('dev-') === 0) return { section: 'dev', view: 'doc', param: h.slice(4), hash: h };
    if (h === 'weekly') return { section: 'weekly', view: 'weekly', hash: h };
    if (h === 'me') return { section: 'me', view: 'me', hash: h };
    if (h === 'sitemap') return { section: 'sitemap', view: 'sitemap', hash: h };
    return { section: 'home', view: 'home', param: '', hash: 'home' };
  }

  /** 任意旧 href → 站内路由（.md → #guide-/#dev-，resources.html#x → #lib-x，旧 hash → 新 hash） */
  function fixHref(href) {
    if (!href || /^(https?:|mailto:|javascript:)/i.test(href)) return href;
    var m = href.match(/(?:^|\/)([A-Za-z0-9_-]+)\.md(?:#.*)?$/);
    if (m) return isDevId(m[1]) || m[1] === 'DESIGN-SPEC' ? (m[1] === 'DESIGN-SPEC' ? 'DESIGN-SPEC.html' : '#dev-' + m[1]) : '#guide-' + m[1];
    m = href.match(/^(?:\.\.?\/)*resources\.html(?:#(.*))?$/);
    if (m) return '#' + (m[1] ? canonical(m[1]).replace(/^(?!lib)/, 'lib-') : 'lib');
    m = href.match(/^(?:\.\.?\/)*index\.html(?:#(.*))?$/);
    if (m) return '#' + canonical(m[1] || 'home');
    if (href.charAt(0) === '#') return '#' + canonical(href);
    return href;
  }
  function fixLinks(root) {
    (root || document).querySelectorAll('a[href]').forEach(function (a) {
      var o = a.getAttribute('href'), n = fixHref(o);
      if (n !== o) a.setAttribute('href', n);
      if (n && n.charAt(0) === '#') { a.removeAttribute('target'); a.removeAttribute('rel'); }
    });
  }

  function unseenCount() {
    try { var raw = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null'); return global.QuestStats ? global.QuestStats.unseen(raw || {}) : 0; } catch (_) { return 0; }
  }
  function currentHash() {
    try { return String(location.hash || '').replace(/^#/, '').split('?')[0]; } catch (_) { return ''; }
  }
  function hereLoc() { return locate(currentHash()); }
  function topLink(n, loc, dot) {
    var on = loc.group && loc.group.id === n.id;
    var attr = n.dataNav || n.id;
    return '<a class="nav-top' + (on ? ' active' : '') + '" href="' + n.hash + '" data-nav="' + attr + '"' + (on ? ' aria-current="page"' : '') + '>' + I(n.icon) + '<span>' + esc(n.label) + '</span>' + (attr === 'me' && dot ? '<span class="red-dot nav-dot" aria-label="有新更新"></span>' : '') + '</a>';
  }
  function dropHtml(n, loc, dot) {
    var on = loc.group && loc.group.id === n.id;
    var attr = n.dataNav || n.id;
    var menuId = 'nav-menu-' + n.id;
    var tint = n.tint ? ' tint-' + n.tint : '';
    return '<div class="nav-drop' + (on ? ' is-active' : '') + '" data-group="' + n.id + '">' +
      '<a class="nav-top' + (on ? ' active' : '') + '" href="' + n.hash + '" data-nav="' + attr + '">' + I(n.icon) + '<span>' + esc(n.label) + '</span>' + (attr === 'me' && dot ? '<span class="red-dot nav-dot" aria-label="有新更新"></span>' : '') + '</a>' +
      '<button type="button" class="nav-caret" aria-expanded="false" aria-haspopup="true" aria-controls="' + menuId + '" aria-label="' + esc(n.label) + '菜单"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="nav-menu" id="' + menuId + '" role="menu" hidden>' + (n.children || []).map(function (c) {
        var cur = loc.page && loc.page.id === c.id;
        return '<a role="menuitem" href="' + c.hash + '"' + (cur ? ' class="active" aria-current="page"' : '') + '><span class="nav-ico' + tint + '">' + I(c.icon) + '</span><span class="nav-item-text"><b>' + esc(c.label) + '</b><small>' + esc(c.desc || '') + '</small></span></a>';
      }).join('') + '</div></div>';
  }
  function canHover() {
    try { return global.matchMedia('(hover: hover) and (min-width: 641px)').matches; } catch (_) { return false; }
  }
  function dropOf(node, root) {
    var drop = node && node.closest ? node.closest('.nav-drop') : null;
    return drop && root.contains(drop) ? drop : null;
  }
  function openDrop(drop) {
    var root = drop.parentNode;
    if (root) [].forEach.call(root.querySelectorAll('.nav-drop.is-open'), function (d) { if (d !== drop) closeDrop(d); });
    drop.classList.add('is-open');
    var btn = drop.querySelector('.nav-caret');
    var menu = drop.querySelector('.nav-menu');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (menu) menu.removeAttribute('hidden');
  }
  function closeDrop(drop) {
    if (!drop) return;
    drop.classList.remove('is-open');
    var btn = drop.querySelector('.nav-caret');
    var menu = drop.querySelector('.nav-menu');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (menu) menu.setAttribute('hidden', '');
  }
  function closeDrops(root) {
    (root || document).querySelectorAll('.nav-drop.is-open').forEach(closeDrop);
  }
  function bindNav(el) {
    if (el.getAttribute('data-nav-bound') === '1') return;
    el.setAttribute('data-nav-bound', '1');
    el.addEventListener('mouseover', function (e) {
      if (!canHover()) return;
      var drop = dropOf(e.target, el);
      if (!drop || drop.classList.contains('is-open')) return;
      openDrop(drop);
      drop.setAttribute('data-via', 'hover');
    });
    el.addEventListener('mouseout', function (e) {
      if (!canHover()) return;
      var drop = dropOf(e.target, el);
      if (!drop) return;
      var rel = e.relatedTarget;
      if (rel && drop.contains(rel)) return;
      if (drop.contains(document.activeElement)) return;
      closeDrop(drop);
    });
    el.addEventListener('click', function (e) {
      var caret = e.target.closest && e.target.closest('.nav-caret');
      if (caret && el.contains(caret)) {
        e.preventDefault();
        var drop = caret.closest('.nav-drop');
        if (drop.getAttribute('data-via') === 'hover' && drop.classList.contains('is-open')) {
          drop.setAttribute('data-via', 'click');
          return;
        }
        if (drop.classList.contains('is-open')) closeDrop(drop);
        else openDrop(drop);
        drop.setAttribute('data-via', 'click');
        return;
      }
      if (e.target.closest && e.target.closest('.nav-menu a')) closeDrops(el);
    });
    el.addEventListener('keydown', function (e) {
      var drop = dropOf(e.target, el);
      if (!drop) return;
      var items = [].slice.call(drop.querySelectorAll('.nav-menu a'));
      var btn = drop.querySelector('.nav-caret');
      var open = drop.classList.contains('is-open');
      var idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) openDrop(drop);
        items = [].slice.call(drop.querySelectorAll('.nav-menu a'));
        var n = idx < 0 ? 0 : Math.min(items.length - 1, idx + 1);
        if (items[n]) items[n].focus();
        drop.setAttribute('data-via', 'key');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) { openDrop(drop); items = [].slice.call(drop.querySelectorAll('.nav-menu a')); if (items.length) items[items.length - 1].focus(); return; }
        if (idx <= 0) { if (btn) btn.focus(); }
        else if (items[idx - 1]) items[idx - 1].focus();
      } else if (e.key === 'Home') {
        if (!open) return;
        e.preventDefault();
        if (items[0]) items[0].focus();
      } else if (e.key === 'End') {
        if (!open) return;
        e.preventDefault();
        if (items.length) items[items.length - 1].focus();
      } else if (e.key === 'Escape') {
        if (!open) return;
        e.preventDefault();
        e.stopPropagation();
        closeDrop(drop);
        if (btn) btn.focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && btn && e.target === btn) {
        /* 按钮的点击由浏览器触发，避免这里再切一次 */
      }
    });
    if (!bindNav.doc) {
      bindNav.doc = true;
      document.addEventListener('click', function (ev) {
        if (ev.target.closest && ev.target.closest('.nav-drop')) return;
        closeDrops(document);
      });
    }
  }
  function renderTopNav() {
    var el = document.getElementById('site-nav');
    if (!el) return;
    el.setAttribute('data-tour', 'nav');
    var loc = hereLoc();
    var dot = unseenCount();
    el.innerHTML = '<div class="site-nav-inner">' +
      '<a class="brand" href="#home"><img src="assets/icon-192.png" alt="" width="34" height="34" /><span>' + SITE_NAME + '</span></a>' +
      '<nav class="site-links" aria-label="主导航">' + SITE_NAV.map(function (n) {
        return n.children && n.children.length ? dropHtml(n, loc, dot) : topLink(n, loc, dot);
      }).join('') + '</nav>' +
      '<button type="button" class="nav-search" data-open-search aria-label="全站搜索（快捷键 / 或 Ctrl+K）" title="搜索（/ 或 Ctrl+K）">' + I('search') + '<span>搜索</span><kbd>/</kbd></button>' +
      '<span id="offline-pill" class="offline-pill" role="status">离线模式：AI / 发布 / 数据拉取暂不可用</span></div>';
    bindNav(el);
    if (global.QuestShell && QuestShell.syncNavH) QuestShell.syncNavH();
  }

  /** 区块头带：页面名（不是分组名）+ 面包屑 首页 / 分组 / 页面 */
  function renderSectionHead(route, extraCrumb) {
    var el = document.getElementById('section-head');
    if (!el) return;
    if (!route || route.section === 'home') { el.hidden = true; el.innerHTML = ''; return; }
    var loc = locate(route.hash);
    var page = loc.page;
    if (!page) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    var group = loc.group;
    var docExtra = route.view === 'doc' ? extraCrumb : '';
    var bits = ['<a href="#home">首页</a>'];
    function sep() { return '<span aria-hidden="true">/</span>'; }
    function cur(text) { return '<span aria-current="page">' + esc(text) + '</span>'; }
    function link(href, text) { return '<a href="' + href + '">' + esc(text) + '</a>'; }
    if (route.section === 'dev') {
      if (docExtra) bits.push(sep(), link('#dev', DEV_SECTION.label), sep(), cur(docExtra));
      else bits.push(sep(), cur(DEV_SECTION.label));
    } else if (group && group.children) {
      bits.push(sep(), link(group.hash, group.label));
      if (docExtra) bits.push(sep(), link(page.hash, page.label), sep(), cur(docExtra));
      else bits.push(sep(), cur(page.label));
    } else if (docExtra) {
      bits.push(sep(), link(page.hash, page.label), sep(), cur(docExtra));
    } else {
      bits.push(sep(), cur(page.label));
    }
    var tint = (group && group.tint) || 'neutral';
    el.innerHTML = '<div class="sh-inner"><nav class="crumbs" aria-label="面包屑">' + bits.join('') + '</nav>' +
      '<div class="sh-row"><span class="sh-ico tint-' + tint + '">' + I(page.icon) + '</span><div><h1 class="sh-title">' + esc(page.label) + '</h1>' +
      '<p class="sh-desc">' + esc(page.desc || '') + '</p></div></div></div>';
  }

  function version() {
    var log = global.QUEST_CHANGELOG || [], top = log[0];
    return top ? { v: 'v1.' + top.id, date: top.date } : { v: 'v1', date: '' };
  }
  function extAttr(href) { return /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''; }
  function footA(href, label, extra) {
    return '<a href="' + href + '"' + (extra || '') + extAttr(href) + '>' + esc(label) + '</a>';
  }
  function subsOf(page) {
    if (page.id === 'war-rank') return [{ href: '#war-rank-xianyu', label: '闲鱼零成本方案' }];
    if (page.id === 'war') return STATIONS.filter(function (s) { return s.hash !== page.hash; }).map(function (s) { return { href: s.hash, label: s.name }; });
    if (page.id === 'lib') return LIB_CATS.map(function (c) { return { href: '#lib-' + c.id, label: c.label }; });
    if (page.id === 'pm') return [{ href: '#pm-cn', label: '国内' }, { href: '#pm-global', label: '海外' }];
    if (page.id === 'guides') return GUIDES.map(function (g) { return { href: g.href || ('#guide-' + g.id), label: g.title }; });
    return [];
  }
  function sitemapGroups() {
    var seen = {};
    function fresh(links) {
      var out = [];
      links.forEach(function (l) {
        if (!l || !l.href || seen[l.href]) return;
        seen[l.href] = 1;
        var kids = (l.children || []).filter(function (c) {
          if (!c || !c.href || seen[c.href]) return false;
          seen[c.href] = 1;
          return true;
        });
        out.push({ href: l.href, label: l.label, children: kids });
      });
      return out;
    }
    var groups = [];
    var tops = SITE_NAV.filter(function (g) { return !g.children; }).map(function (g) { return { href: g.hash, label: g.label }; });
    groups.push({ title: '开始', links: fresh(tops) });
    SITE_NAV.forEach(function (g) {
      if (!g.children) return;
      groups.push({ title: g.label, links: fresh(g.children.map(function (c) {
        return { href: c.hash, label: c.label, children: subsOf(c) };
      })) });
    });
    groups.push({ title: '其他', links: fresh([
      { href: '#sitemap', label: SITEMAP.label },
      { href: '#dev', label: DEV_SECTION.label, children: DEV_DOCS.map(function (d) { return { href: '#dev-' + d.id, label: d.title }; }) },
      { href: 'https://github.com/yuanqingsong2024/gefei-quest', label: 'GitHub 仓库' },
    ]) });
    return groups;
  }
  function footChildren(id) {
    var g = navById(id);
    return ((g && g.children) || []).map(function (c) { return footA(c.hash, c.label); }).join('');
  }
  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var V = version();
    el.innerHTML = '<div class="foot-inner">' +
      '<div class="foot-about"><div class="foot-brand"><img src="assets/icon-192.png" alt="" width="44" height="44" /><div><b>' + SITE_NAME + '</b><span>出海建站 · SEO · 练习营</span></div></div>' +
      '<p class="foot-desc"><b>关于本站</b>：跟着公开的方法做英文出海小站，并把靠谱渠道收成每天更新的赚钱榜。非官方，不含付费社群内容。不承诺收益。进度只保存在你的浏览器里。</p></div>' +
      '<div class="foot-cols">' +
      '<div><h4>开始</h4>' + footA('#home', '首页') + footA('#start', '新手引导') +
      '<button type="button" id="foot-tour" data-tour="replay" title="再看一遍首页聚光灯导览">重播新手导览</button><small class="foot-replay-note">再看一遍首页聚光灯导览</small>' +
      footA('#sitemap', '网站地图') + footA('#dev', DEV_SECTION.label) + '</div>' +
      '<div><h4>学习</h4>' + footChildren('learn') + '</div>' +
      '<div><h4>实施</h4>' + footChildren('do') + '</div>' +
      '<div><h4>赚钱</h4>' + footChildren('earn') + '</div>' +
      '<div><h4>我的</h4>' + footChildren('mine') + '</div>' +
      '</div><p class="foot-note">© 2026 ' + SITE_NAME + ' · 不承诺收益 · 数据以官方为准 · <span class="foot-ver"><span class="pill">' + V.v + '</span></span> · <a href="#changelog">更新日志</a> · <a href="daily.json" target="_blank" rel="noopener">daily.json</a> <button type="button" class="btn btn-sm" data-pwa-install hidden>安装到桌面</button><span class="pwa-ios-hint" hidden>Safari 分享 → 添加到主屏幕</span></p></div>';
  }
  function renderSitemap(root) {
    if (!root) return;
    var groups = sitemapGroups();
    function li(l) {
      return '<li><a href="' + l.href + '"' + extAttr(l.href) + '>' + esc(l.label) + '</a>' +
        (l.children && l.children.length ? '<ul>' + l.children.map(li).join('') + '</ul>' : '') + '</li>';
    }
    root.innerHTML = '<div class="sitemap-page"><p class="sitemap-lead">顶栏六个入口。下面按学习、实施、赚钱和我的列出全部页面，每个链接只出现一次。</p><div class="sitemap-grid">' +
      groups.map(function (g) {
        return '<section><h2>' + esc(g.title) + '</h2><ul>' + g.links.map(li).join('') + '</ul></section>';
      }).join('') + '</div></div>';
  }

  function titleFor(route, extra) {
    if (!route || route.section === 'home') { document.title = SITE_NAME; return; }
    var loc = locate(route.hash);
    var page = loc.page;
    if (!page) { document.title = SITE_NAME; return; }
    document.title = (route.view === 'doc' && extra ? page.label + ' · ' + extra : page.label) + ' · ' + SITE_NAME;
  }

  /** 按 hash 取 SITE_NAV 页面图标名（子页面优先于分组）。找不到返回空串。 */
  function iconName(raw) {
    var loc = locate(raw);
    return (loc.page && loc.page.icon) || '';
  }
  function iconFor(raw) { return I(iconName(raw) || 'compass'); }

  global.QuestNav = {
    SITE_NAME: SITE_NAME, SITE_NAV: SITE_NAV, SITEMAP: SITEMAP, DEV_SECTION: DEV_SECTION, PATH_TABS: PATH_TABS, WAR_TABS: WAR_TABS, EARN_TABS: EARN_TABS, ME_TABS: ME_TABS, STATIONS: STATIONS,
    LIB_CATS: LIB_CATS, GUIDES: GUIDES, GUIDE_GROUPS: GUIDE_GROUPS, DEV_DOCS: DEV_DOCS, ALIASES: ALIASES,
    parse: parse, canonical: canonical, fixHref: fixHref, fixLinks: fixLinks, navById: navById, guideById: guideById,
    locate: locate, pagesOwning: pagesOwning, pageOwns: pageOwns, mainFlow: mainFlow, nextInGroup: nextInGroup,
    isDevId: isDevId, renderTopNav: renderTopNav, renderSectionHead: renderSectionHead, renderFooter: renderFooter,
    renderSitemap: renderSitemap, titleFor: titleFor, icon: I, iconName: iconName, iconFor: iconFor, esc: esc, version: version,
  };
})(typeof window !== 'undefined' ? window : globalThis);
