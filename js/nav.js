/** 唯一名称表 + 路由 + 统一壳（顶栏 / 区块头带 / 页脚）+ 旧链接兼容 */
(function (global) {
  var I = function (n, c) { return global.QuestIcons ? global.QuestIcons.svg(n, c) : ''; };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var SITE_NAME = '出海小站练站营';
  /** 页面条目。顶栏只露出 6 个；其余挂在 children 上，搜索索引会把 children 也收进去。 */
  var PAGE = {
    home: { id: 'home', label: '首页', icon: 'lighthouse', hash: '#home', sub: '出海建站 · SEO · 练习营', desc: '从挖词到多站的完整练习路线。' },
    start: { id: 'start', label: '新手引导', icon: 'flag', hash: '#start', sub: '三条路线 · 7 天清单 · 新手导览', desc: '学习、实施、赚钱三条路线，前 7 天清单，以及可以重播的新手导览。' },
    path: { id: 'path', label: '学习路线', icon: 'map', hash: '#path', section: 'path', sub: '关卡地图 · 任务清单', desc: '按章节闯关：入门准备 → 站一 → 站二 → 站三 → 变现 → 放大，勾选即线下完成。' },
    quests: { id: 'path-quests', label: '任务清单', icon: 'list', hash: '#path-quests', section: 'path', sub: '按章节勾选', desc: '当前章节可以勾选的任务，勾选表示线下已经做完。' },
    guides: { id: 'guides', label: '手册与模板', icon: 'book', hash: '#guides', section: 'guides', sub: '5 份手册 · 2 个模板 · 笔记', desc: '每个阶段的作战手册、可直接部署的单页模板，以及渠道笔记。' },
    war: { id: 'war', label: '实战作战室', icon: 'target', hash: '#war', section: 'war', sub: '每站 Day1–7 · 实操助手 · 选词 · 赚钱榜', desc: '五个阶段各一张 7 天清单，加上站一实操助手、选词练习板和每日赚钱榜，与学习路线共用同一份进度。' },
    work: { id: 'work', label: '工作台', icon: 'target', hash: '#work', section: 'war', sub: '每个站点的下一步', desc: '选词、实操助手、发布、分发、数据和复盘，看每个站点的下一步。' },
    rank: { id: 'war-rank', label: '每日赚钱榜', icon: 'trophy', hash: '#war-rank', section: 'war', sub: '每天更新 · 不保证收益', desc: '公开渠道整理成的每日赚钱榜，每条带来源链接。' },
    weekly: { id: 'weekly', label: '每周补给', icon: 'calendar', hash: '#weekly', section: 'weekly', sub: '每周一更新的知识卡', desc: '每周几张短卡片：方法、提醒和本周可试的小动作，领取得 XP。' },
    kit: { id: 'war-kit', label: '站一实操助手', icon: 'kit', hash: '#war-kit', section: 'war', sub: '生成可上线的单页', desc: '填主词，生成页面、robots 和 sitemap。' },
    keywords: { id: 'war-keywords', label: '选词练习板', icon: 'tag', hash: '#war-keywords', section: 'war', sub: '给候选词打分', desc: '给候选词打分，决定适不适合练手。' },
    publish: { id: 'war-publish', label: '发布上线', icon: 'rocket', hash: '#war-publish', section: 'war', sub: '写进 GitHub 仓库', desc: '用细粒度 Token 把页面写进你的仓库并开启 Pages。' },
    share: { id: 'war-share', label: '内容分发', icon: 'external', hash: '#war-share', section: 'war', sub: '各平台文案', desc: '生成各平台文案，由你自己去官方页面发布。' },
    review: { id: 'work-review', label: '每周复盘', icon: 'bulb', hash: '#work-review', section: 'war', sub: '本周和下周 3 件事', desc: '写下本周做了什么、数据变化和下周要做的 3 件事。' },
    lib: { id: 'lib', label: '资源库', icon: 'toolbox', hash: '#lib', section: 'lib', sub: '工具 · 托管 · 变现 · 闲鱼', desc: '免费工具、托管域名、变现渠道、可试路径、闲鱼非实物与同路人方法，可筛选可搜索。' },
    pm: { id: 'pm', label: '平台变现', icon: 'coin', hash: '#pm', section: 'lib', sub: '国内 + 海外', desc: '各平台的变现方式、门槛、分成和来源。不承诺收益。' },
    me: { id: 'me', label: '我的进度', icon: 'user', hash: '#me', section: 'me', sub: '统计 · 站点台账 · 更新日志 · AI 设置', desc: '等级、XP、学习统计与打卡热力图、成就墙、我的站点台账、更新日志、AI 设置，以及存档导出导入和偏好设置。' },
    accounts: { id: 'me-accounts', label: '账号中心', icon: 'users', hash: '#me-accounts', section: 'me', sub: '官方 Token', desc: '只保存你自己的官方 Token，以及 Google 只读连接。' },
    analytics: { id: 'me-analytics', label: '数据分析', icon: 'chart', hash: '#me-analytics', section: 'me', sub: '导入或拉取的数字', desc: '展示你导入或拉取的搜索与收入数据。' },
    stats: { id: 'me-stats', label: '学习统计', icon: 'chart', hash: '#me-stats', section: 'me', sub: '打卡和连击', desc: '打卡热力图、连续天数和各章节进度。' },
    ai: { id: 'me-ai', label: 'AI 设置', icon: 'sparkle', hash: '#me-ai', section: 'me', sub: '服务商与模板', desc: '选择 AI 服务商。不填也能用内置模板。' },
  };
  var SITEMAP = { id: 'sitemap', label: '网站地图', icon: 'map', hash: '#sitemap', sub: '全站页面一览', desc: '顶栏六个入口以外的全部页面。sitemap 站点地图' };
  /** 顶栏 6 项。children 仍是完整页面列表，供搜索和下拉使用。 */
  var SITE_NAV = [
    PAGE.home,
    PAGE.start,
    { id: 'learn', label: '学习', icon: 'map', hash: '#path', sub: '学习路线 · 任务清单 · 手册与模板', desc: '学习路线、任务清单、手册与模板。', children: [PAGE.path, PAGE.quests, PAGE.guides] },
    { id: 'practice', label: '实战', icon: 'target', hash: '#war', sub: '作战室 · 工作台 · 赚钱榜 · 每周补给', desc: '实战作战室、工作台、每日赚钱榜、每周补给。', children: [PAGE.war, PAGE.work, PAGE.rank, PAGE.weekly, PAGE.kit, PAGE.keywords, PAGE.publish, PAGE.share, PAGE.review] },
    { id: 'res', label: '资源', icon: 'toolbox', hash: '#lib', sub: '资源库 · 平台变现', desc: '资源库和平台变现。', children: [PAGE.lib, PAGE.pm] },
    { id: 'mine', label: '我的', icon: 'user', hash: '#me', dataNav: 'me', sub: '进度 · 账号 · 数据', desc: '我的进度、账号中心、数据分析。', children: [PAGE.me, PAGE.accounts, PAGE.analytics, PAGE.stats, PAGE.ai] },
  ];
  var DEV_SECTION = { id: 'dev', label: '开发者文档', icon: 'code', hash: '#dev', sub: '路线图 · 任务 · 测试记录', desc: '项目开发过程文档，供维护者查阅。' };

  var PATH_TABS = [
    { id: 'map', label: '关卡地图', icon: 'map', hash: '#path' },
    { id: 'quests', label: '任务清单', icon: 'list', hash: '#path-quests' },
  ];

  var WAR_TABS = [
    { id: 'work', label: '工作台', icon: 'target', hash: '#work' },
    { id: 'days', label: '作战日程', icon: 'calendar', hash: '#war' },
    { id: 'kit', label: '站一实操助手', icon: 'kit', hash: '#war-kit' },
    { id: 'keywords', label: '选词练习板', icon: 'tag', hash: '#war-keywords' },
    { id: 'rank', label: '每日赚钱榜', icon: 'trophy', hash: '#war-rank' },
    { id: 'publish', label: '发布上线', icon: 'rocket', hash: '#war-publish' },
    { id: 'share', label: '内容分发', icon: 'external', hash: '#war-share' },
    { id: 'review', label: '每周复盘', icon: 'bulb', hash: '#work-review' },
  ];
  var ME_TABS = [
    { id: 'overview', label: '概览', icon: 'user', hash: '#me' },
    { id: 'stats', label: '学习统计', icon: 'chart', hash: '#me-stats' },
    { id: 'sites', label: '我的站点台账', icon: 'ledger', hash: '#me-sites' },
    { id: 'analytics', label: '数据分析', icon: 'chart', hash: '#me-analytics' },
    { id: 'accounts', label: '账号中心', icon: 'users', hash: '#me-accounts' },
    { id: 'changelog', label: '更新日志', icon: 'bulb', hash: '#changelog' },
    { id: 'ai', label: 'AI 设置', icon: 'sparkle', hash: '#me-ai' },
  ];

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
  function owns(n, section, hash) {
    if (!n || !section) return false;
    if (n.id === section || n.section === section || n.hash === '#' + hash) return true;
    return (n.children || []).some(function (c) { return owns(c, section, hash); });
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
    if (h === 'war-rank') return { section: 'war', view: 'rank', hash: h };
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
  function topLink(n, active, hash, dot) {
    var on = owns(n, active, hash) || n.id === active;
    var attr = n.dataNav || n.id;
    return '<a class="nav-top' + (on ? ' active' : '') + '" href="' + n.hash + '" data-nav="' + attr + '"' + (on ? ' aria-current="page"' : '') + '>' + I(n.icon) + '<span>' + esc(n.label) + '</span>' + (attr === 'me' && dot ? '<span class="red-dot nav-dot" aria-label="有新更新"></span>' : '') + '</a>';
  }
  function dropHtml(n, active, hash, dot) {
    var on = owns(n, active, hash);
    var attr = n.dataNav || n.id;
    var childExact = (n.children || []).some(function (c) { return c.hash === '#' + hash; });
    var menuId = 'nav-menu-' + n.id;
    return '<div class="nav-drop' + (on ? ' is-active' : '') + '" data-group="' + n.id + '">' +
      '<a class="nav-top' + (on ? ' active' : '') + '" href="' + n.hash + '" data-nav="' + attr + '"' + (on && !childExact ? ' aria-current="page"' : '') + '>' + I(n.icon) + '<span>' + esc(n.label) + '</span>' + (attr === 'me' && dot ? '<span class="red-dot nav-dot" aria-label="有新更新"></span>' : '') + '</a>' +
      '<button type="button" class="nav-caret" aria-expanded="false" aria-haspopup="true" aria-controls="' + menuId + '" aria-label="' + esc(n.label) + '菜单"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="nav-menu" id="' + menuId + '" role="menu" hidden>' + (n.children || []).map(function (c) {
        var cur = c.hash === '#' + hash;
        return '<a role="menuitem" href="' + c.hash + '"' + (cur ? ' class="active" aria-current="page"' : '') + '>' + I(c.icon) + '<span>' + esc(c.label) + '</span></a>';
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
  function renderTopNav(active) {
    var el = document.getElementById('site-nav');
    if (!el) return;
    el.setAttribute('data-tour', 'nav');
    var hash = currentHash();
    var dot = unseenCount();
    el.innerHTML = '<div class="site-nav-inner">' +
      '<a class="brand" href="#home"><img src="assets/icon-192.png" alt="" width="34" height="34" /><span>' + SITE_NAME + '</span></a>' +
      '<nav class="site-links" aria-label="主导航">' + SITE_NAV.map(function (n) {
        return n.children && n.children.length ? dropHtml(n, active, hash, dot) : topLink(n, active, hash, dot);
      }).join('') + '</nav>' +
      '<button type="button" class="nav-search" data-open-search aria-label="全站搜索（快捷键 / 或 Ctrl+K）" title="搜索（/ 或 Ctrl+K）">' + I('search') + '<span>搜索</span><kbd>/</kbd></button>' +
      '<span id="offline-pill" class="offline-pill" role="status">离线模式：AI / 发布 / 数据拉取暂不可用</span></div>';
    bindNav(el);
    if (global.QuestShell && QuestShell.syncNavH) QuestShell.syncNavH();
  }

  /** 区块头带：图标 + 标题 + 一句说明 + 面包屑 */
  function renderSectionHead(route, extraCrumb) {
    var el = document.getElementById('section-head');
    if (!el) return;
    if (route.section === 'home') { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    var n = navById(route.section);
    var crumbs = '<a href="#home">首页</a><span aria-hidden="true">/</span>' +
      (extraCrumb ? '<a href="' + n.hash + '">' + n.label + '</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(extraCrumb) + '</span>' : '<span aria-current="page">' + n.label + '</span>');
    el.innerHTML = '<div class="sh-inner"><nav class="crumbs" aria-label="面包屑">' + crumbs + '</nav>' +
      '<div class="sh-row"><span class="sh-ico">' + I(n.icon) + '</span><div><h1 class="sh-title">' + n.label + '<small>' + n.sub + '</small></h1>' +
      '<p class="sh-desc">' + n.desc + '</p></div></div></div>';
  }

  function version() {
    var log = global.QUEST_CHANGELOG || [], top = log[0];
    return top ? { v: 'v1.' + top.id, date: top.date } : { v: 'v1', date: '' };
  }
  function extAttr(href) { return /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''; }
  function footA(href, label, extra) {
    return '<a href="' + href + '"' + (extra || '') + extAttr(href) + '>' + esc(label) + '</a>';
  }
  function navPageLinks() {
    var out = [];
    SITE_NAV.forEach(function (n) {
      out.push({ href: n.hash, label: n.label });
      (n.children || []).forEach(function (c) { out.push({ href: c.hash, label: c.label }); });
    });
    out.push({ href: '#start', label: '新手导览' });
    out.push({ href: '#sitemap', label: '网站地图' });
    return out;
  }
  function sitemapGroups() {
    var log = (global.QUEST_CHANGELOG || []).slice(0, 3);
    return [
      { title: '主要页面', links: navPageLinks() },
      { title: '实战与工具', links: STATIONS.map(function (s) { return { href: s.hash, label: s.label + '作战室' }; }).concat([
        { href: '#war-kit', label: '站一实操助手' }, { href: '#war-keywords', label: '选词练习板' }, { href: '#war-rank', label: '每日赚钱榜' },
        { href: '#war-publish', label: '发布上线' }, { href: '#war-share', label: '内容分发' }, { href: '#work', label: '工作台' }, { href: '#work-review', label: '每周复盘' },
      ]) },
      { title: '资源库', links: LIB_CATS.map(function (c) { return { href: '#lib-' + c.id, label: c.label }; }).concat([
        { href: '#pm', label: '平台变现' }, { href: '#pm-cn', label: '平台变现 · 国内' }, { href: '#pm-global', label: '平台变现 · 海外' },
      ]) },
      { title: '我的', links: ME_TABS.map(function (t) { return { href: t.hash, label: t.label }; }).concat([
        { href: '#guides', label: '手册与模板' }, { href: '#dev', label: DEV_SECTION.label },
        { href: 'https://github.com/yuanqingsong2024/gefei-quest', label: 'GitHub 仓库' },
      ]) },
      { title: '最近更新', links: log.map(function (e) { return { href: '#changelog', label: e.date + ' ' + e.title }; }) },
    ];
  }
  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var V = version();
    el.innerHTML = '<div class="foot-inner">' +
      '<div class="foot-about"><div class="foot-brand"><img src="assets/icon-192.png" alt="" width="44" height="44" /><div><b>' + SITE_NAME + '</b><span>出海建站 · SEO · 练习营</span></div></div>' +
      '<p class="foot-desc"><b>关于本站</b>：跟着公开的方法做英文出海小站，并把靠谱渠道收成每天更新的赚钱榜。非官方，不含付费社群内容。不承诺收益。进度只保存在你的浏览器里。</p></div>' +
      '<div class="foot-cols">' +
      '<div><h4>开始</h4>' + footA('#home', '首页') + footA('#start', '新手引导') + footA('#start', '新手导览', ' id="foot-tour" data-tour="replay"') + footA('#path', '学习路线') + footA('#sitemap', '网站地图') + '</div>' +
      '<div><h4>实战</h4>' + footA('#war', '实战作战室') + footA('#work', '工作台') + footA('#war-rank', '每日赚钱榜') + footA('#war-publish', '发布上线') + footA('#war-share', '内容分发') + '</div>' +
      '<div><h4>资源</h4>' + footA('#lib', '资源库') + footA('#pm', '平台变现') + footA('#guides', '手册与模板') + footA('#weekly', '每周补给') + '</div>' +
      '<div><h4>我的</h4>' + footA('#me', '我的进度') + footA('#me-accounts', '账号中心') + footA('#me-analytics', '数据分析') + footA('#me-ai', 'AI 设置') + footA('#changelog', '更新日志') + '</div>' +
      '</div><p class="foot-note">© 2026 ' + SITE_NAME + ' · 不承诺收益 · 数据以官方为准 · <span class="foot-ver"><span class="pill">' + V.v + '</span></span> · <a href="#changelog">更新日志</a> · <a href="daily.json" target="_blank" rel="noopener">daily.json</a> <button type="button" class="btn btn-sm" data-pwa-install hidden>安装到桌面</button><span class="pwa-ios-hint" hidden>Safari 分享 → 添加到主屏幕</span></p></div>';
  }
  function renderSitemap(root) {
    if (!root) return;
    var groups = sitemapGroups();
    root.innerHTML = '<div class="sitemap-page"><p class="sitemap-lead">顶栏只放六个入口。下面是全部页面，和原来页脚里的链接一样。</p><div class="sitemap-grid">' +
      groups.map(function (g) {
        return '<section><h2>' + esc(g.title) + '</h2><ul>' + g.links.map(function (l) {
          return '<li><a href="' + l.href + '"' + extAttr(l.href) + '>' + esc(l.label) + '</a></li>';
        }).join('') + '</ul></section>';
      }).join('') + '</div></div>';
  }

  function titleFor(route, extra) {
    var n = navById(route.section);
    document.title = (route.section === 'home' ? SITE_NAME : (extra ? extra + ' · ' : '') + n.label + ' · ' + SITE_NAME);
  }

  global.QuestNav = {
    SITE_NAME: SITE_NAME, SITE_NAV: SITE_NAV, SITEMAP: SITEMAP, DEV_SECTION: DEV_SECTION, PATH_TABS: PATH_TABS, WAR_TABS: WAR_TABS, ME_TABS: ME_TABS, STATIONS: STATIONS,
    LIB_CATS: LIB_CATS, GUIDES: GUIDES, GUIDE_GROUPS: GUIDE_GROUPS, DEV_DOCS: DEV_DOCS, ALIASES: ALIASES,
    parse: parse, canonical: canonical, fixHref: fixHref, fixLinks: fixLinks, navById: navById, guideById: guideById,
    isDevId: isDevId, renderTopNav: renderTopNav, renderSectionHead: renderSectionHead, renderFooter: renderFooter,
    renderSitemap: renderSitemap, titleFor: titleFor, icon: I, esc: esc, version: version,
  };
})(typeof window !== 'undefined' ? window : globalThis);
