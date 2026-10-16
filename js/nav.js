/** 唯一名称表 + 路由 + 统一壳（顶栏 / 区块头带 / 页脚）+ 旧链接兼容 */
(function (global) {
  var I = function (n, c) { return global.QuestIcons ? global.QuestIcons.svg(n, c) : ''; };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var SITE_NAME = '出海小站练站营';
  /** 主导航：名称在全站（顶栏、首页卡片、页脚、面包屑、标题）只从这里取 */
  var SITE_NAV = [
    { id: 'home', label: '首页', icon: 'lighthouse', hash: '#home', sub: '出海建站 · SEO · 练习营', desc: '从挖词到多站的完整练习路线。' },
    { id: 'path', label: '学习路线', icon: 'map', hash: '#path', sub: '关卡地图 · 任务清单', desc: '按章节闯关：入门准备 → 站一 → 站二 → 站三 → 变现 → 放大，勾选即线下完成。' },
    { id: 'war', label: '实战作战室', icon: 'target', hash: '#war', sub: '每站固定 Day1–7', desc: '五个阶段各一张 7 天清单，与学习路线共用同一份进度。' },
    { id: 'lib', label: '资源库', icon: 'toolbox', hash: '#lib', sub: '工具 · 托管 · 变现 · 闲鱼', desc: '免费工具、托管域名、变现渠道、可试路径、闲鱼非实物与同路人方法，可筛选可搜索。' },
    { id: 'guides', label: '手册与模板', icon: 'book', hash: '#guides', sub: '5 份手册 · 2 个模板 · 笔记', desc: '每个阶段的作战手册、可直接部署的单页模板，以及渠道笔记。' },
    { id: 'weekly', label: '每周补给', icon: 'calendar', hash: '#weekly', sub: '每周一更新的知识卡', desc: '每周几张短卡片：方法、提醒和本周可试的小动作，领取得 XP。' },
    { id: 'me', label: '我的进度', icon: 'user', hash: '#me', sub: '成就 · 统计 · 存档 · 设置', desc: '等级、XP、连击、成就墙，以及存档导出导入和偏好设置。' },
  ];
  var DEV_SECTION = { id: 'dev', label: '开发者文档', icon: 'code', hash: '#dev', sub: '路线图 · 任务 · 测试记录', desc: '项目开发过程文档，供维护者查阅。' };

  var PATH_TABS = [
    { id: 'map', label: '关卡地图', icon: 'map', hash: '#path' },
    { id: 'quests', label: '任务清单', icon: 'list', hash: '#path-quests' },
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
    { id: 'MASTER-STATUS', title: '总进度 MASTER-STATUS' },
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
    xianyu: 'lib-xianyu', tips: 'lib-tips', peers: 'lib-peers', 'lib-docs': 'guides', 'lib-all': 'lib',
  };
  function isDevId(id) { return DEV_DOCS.some(function (d) { return d.id === id; }); }
  function guideById(id) { return GUIDES.filter(function (g) { return g.id === id; })[0]; }
  function navById(id) { return id === 'dev' ? DEV_SECTION : SITE_NAV.filter(function (n) { return n.id === id; })[0]; }

  function canonical(raw) {
    raw = String(raw || '').replace(/^#/, '');
    if (raw.indexOf('cat-') === 0) raw = raw.slice(4);
    return Object.prototype.hasOwnProperty.call(ALIASES, raw) ? ALIASES[raw] : raw;
  }

  /** 解析 hash → { section, view, param, hash } */
  function parse(raw) {
    var h = canonical(raw);
    if (/^home(-|$)/.test(h)) return { section: 'home', view: 'home', param: h === 'home' ? '' : h, hash: h };
    if (h === 'path') return { section: 'path', view: 'map', hash: h };
    if (h === 'path-quests') return { section: 'path', view: 'quests', hash: h };
    var st = { war: 1, 'war-s2': 2, 'war-s3': 3, 'war-m': 4, 'war-x': 5 };
    if (st[h]) return { section: 'war', view: 'war', param: st[h], hash: h };
    if (h === 'lib') return { section: 'lib', view: 'lib', param: 'all', hash: h };
    if (h.indexOf('lib-') === 0) return { section: 'lib', view: 'lib', param: h.slice(4), hash: h };
    if (h === 'guides') return { section: 'guides', view: 'guides', hash: h };
    if (h.indexOf('guide-') === 0) return { section: 'guides', view: 'doc', param: h.slice(6), hash: h };
    if (h === 'dev') return { section: 'dev', view: 'dev', hash: h };
    if (h.indexOf('dev-') === 0) return { section: 'dev', view: 'doc', param: h.slice(4), hash: h };
    if (h === 'weekly') return { section: 'weekly', view: 'weekly', hash: h };
    if (h === 'me') return { section: 'me', view: 'me', hash: h };
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

  function renderTopNav(active) {
    var el = document.getElementById('site-nav');
    if (!el) return;
    el.innerHTML = '<div class="site-nav-inner">' +
      '<a class="brand" href="#home"><img src="assets/icon-192.png" alt="" width="34" height="34" /><span>' + SITE_NAME + '</span></a>' +
      '<nav class="site-links" aria-label="主导航">' + SITE_NAV.map(function (n) {
        var on = n.id === active;
        return '<a href="' + n.hash + '" data-nav="' + n.id + '"' + (on ? ' class="active" aria-current="page"' : '') + '>' + I(n.icon) + '<span>' + n.label + '</span></a>';
      }).join('') + '</nav></div>';
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

  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = '<div class="foot-inner">' +
      '<div class="foot-brand"><img src="assets/icon-192.png" alt="" width="40" height="40" /><div><b>' + SITE_NAME + '</b><span>公开方法学习 · 非官方 · 收入≠保证 · 进度仅存本机浏览器</span></div></div>' +
      '<div class="foot-cols">' +
      '<div><h4>栏目</h4>' + SITE_NAV.map(function (n) { return '<a href="' + n.hash + '">' + n.label + '</a>'; }).join('') + '</div>' +
      '<div><h4>资源库</h4>' + LIB_CATS.map(function (c) { return '<a href="#lib-' + c.id + '">' + c.label + '</a>'; }).join('') + '</div>' +
      '<div><h4>手册与模板</h4>' + GUIDES.slice(0, 7).map(function (g) { return '<a href="' + (g.href || '#guide-' + g.id) + '"' + (g.href ? ' target="_blank" rel="noopener"' : '') + '>' + g.title + '</a>'; }).join('') + '</div>' +
      '<div><h4>项目</h4><a href="#dev">' + DEV_SECTION.label + '</a><a href="https://github.com/yuanqingsong2024/gefei-quest" target="_blank" rel="noopener">GitHub 仓库</a></div>' +
      '</div><p class="foot-note">© 2026 ' + SITE_NAME + ' · 额度与规则以各平台官网为准</p></div>';
  }

  function titleFor(route, extra) {
    var n = navById(route.section);
    document.title = (route.section === 'home' ? SITE_NAME : (extra ? extra + ' · ' : '') + n.label + ' · ' + SITE_NAME);
  }

  global.QuestNav = {
    SITE_NAME: SITE_NAME, SITE_NAV: SITE_NAV, DEV_SECTION: DEV_SECTION, PATH_TABS: PATH_TABS, STATIONS: STATIONS,
    LIB_CATS: LIB_CATS, GUIDES: GUIDES, GUIDE_GROUPS: GUIDE_GROUPS, DEV_DOCS: DEV_DOCS, ALIASES: ALIASES,
    parse: parse, canonical: canonical, fixHref: fixHref, fixLinks: fixLinks, navById: navById, guideById: guideById,
    isDevId: isDevId, renderTopNav: renderTopNav, renderSectionHead: renderSectionHead, renderFooter: renderFooter,
    titleFor: titleFor, icon: I, esc: esc,
  };
})(typeof window !== 'undefined' ? window : globalThis);
