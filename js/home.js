/** 首页枢纽 · 分类入口卡片 */
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
          target: './resources.html',
        },
        {
          emoji: '🛠️',
          title: '羊毛与免费工具',
          desc: 'GSC / GA4 / Clarity / Pages / 域名…',
          action: 'href',
          target: './resources.html#tools',
        },
        {
          emoji: '🐟',
          title: '闲鱼·非实物',
          desc: '数字商品与技能服务（合法向）',
          action: 'href',
          target: './resources.html#xianyu',
        },
        {
          emoji: '📝',
          title: '渠道完整笔记',
          desc: 'channels-and-tips.md',
          action: 'href',
          target: './docs/channels-and-tips.md',
        },
        {
          emoji: '🤝',
          title: '同路人方法',
          desc: '公开摘要，非付费社群内容',
          action: 'href',
          target: './docs/peer-methods.md',
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
          target: './docs/station-one-playbook.md',
        },
        {
          emoji: '📖',
          title: '站二手册',
          desc: '一词着陆与收录',
          action: 'href',
          target: './docs/station-two-playbook.md',
        },
        {
          emoji: '📖',
          title: '站三手册',
          desc: '内容与内链',
          action: 'href',
          target: './docs/station-three-playbook.md',
        },
        {
          emoji: '📖',
          title: '变现手册',
          desc: '申请门槛与诚实声明',
          action: 'href',
          target: './docs/monetize-playbook.md',
        },
        {
          emoji: '📖',
          title: '放大手册',
          desc: '多站与流程',
          action: 'href',
          target: './docs/scale-playbook.md',
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
          target: './docs/MASTER-STATUS.md',
        },
        {
          emoji: '🧭',
          title: 'Phase 2 路线图',
          desc: '站一作战室',
          action: 'href',
          target: './docs/PHASE2-ROADMAP.md',
        },
        {
          emoji: '🧭',
          title: 'Phase 3 路线图',
          desc: '站二作战室',
          action: 'href',
          target: './docs/PHASE3-ROADMAP.md',
        },
        {
          emoji: '🧭',
          title: 'Phase 4 路线图',
          desc: '站三 + 变现',
          action: 'href',
          target: './docs/PHASE4-ROADMAP.md',
        },
        {
          emoji: '🧭',
          title: 'Phase 5 路线图',
          desc: '放大',
          action: 'href',
          target: './docs/PHASE5-ROADMAP.md',
        },
        {
          emoji: '☑️',
          title: '任务清单 TASKS',
          desc: '开发勾选记录',
          action: 'href',
          target: './TASKS.md',
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

  var STEPS = [
    ['🔍', '挖词', '找一个低竞争英文需求词'],
    ['🏗️', '上站', '单页上线 · HTTPS · 统计'],
    ['📈', 'SEO', 'GSC 收录 · 内容与内链'],
    ['💰', '变现', 'AdSense / 联盟门槛'],
    ['🚀', '放大', '复制流程到多站'],
  ];
  var FEATURES = [
    ['🎮', '游戏化任务', '地图闯关、XP、连击与成就，勾选=线下做完', '#map'],
    ['📋', '五站作战室', '站一→放大，每站固定 Day1–7 清单', '#war'],
    ['🧺', '资源库 · 羊毛', '免费工具、托管、变现入口约 40 条', 'resources.html#tools'],
    ['🐟', '闲鱼 · 非实物', '数字商品与技能服务，附禁区自检', 'resources.html#xianyu'],
    ['🧩', '开站模板', '站一 / 站二英文单页 Starter，改词即部署', 'starters/station-one/'],
    ['📘', '实战手册', '五份手册 + 阶段路线图', '#home-guides'],
  ];
  var STRIP = [
    ['🛠️', '羊毛工具', 'resources.html#tools'],
    ['☁️', '托管与域名', 'resources.html#hosting'],
    ['💵', '变现渠道', 'resources.html#monetize'],
    ['🐟', '闲鱼非实物', 'resources.html#xianyu'],
    ['🧭', '同路人方法', 'resources.html#peers'],
  ];
  var GUIDES = [
    ['站一 Starter', 'starters/station-one/'],
    ['站二 Starter', 'starters/station-two/'],
    ['站一手册', 'docs/station-one-playbook.md'],
    ['站二手册', 'docs/station-two-playbook.md'],
    ['站三手册', 'docs/station-three-playbook.md'],
    ['变现手册', 'docs/monetize-playbook.md'],
    ['放大手册', 'docs/scale-playbook.md'],
    ['渠道与羊毛笔记', 'docs/channels-and-tips.md'],
    ['同路人方法', 'docs/peer-methods.md'],
    ['总进度 MASTER-STATUS', 'docs/MASTER-STATUS.md'],
  ];

  function snapshot() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null'); } catch (_) {}
    if (!raw || typeof raw.xp !== 'number') {
      return '<div class="snap-empty"><p>还没有存档。点「开始站一」勾下第一项，这里会显示你的等级、XP 与连击。</p></div>';
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
      '</div>' + (pct ? '<div class="snap-bar"><i style="width:' + Math.min(100, pct) + '%"></i></div>' : '') +
      '<p class="snap-note">存档仅在本机浏览器（gefei-quest-save-v1），可在设置里导出 JSON。</p>';
  }

  function renderHome(root) {
    if (!root) return;
    var stamp = '2026-10-16';
    root.innerHTML =
      '<section class="hero" aria-label="首页">' +
      '<div class="hero-inner">' +
      '<p class="hero-kicker">出海建站 · SEO · 游戏化练习营</p>' +
      '<h2 class="hero-title">把出海小站，<br />当成一场闯关冒险</h2>' +
      '<p class="hero-sub">挖词 → 上站 → SEO → 变现 → 放大<br />每一步都有清单、模板和资源，勾一项就是线下真做完一项。</p>' +
      '<div class="hero-cta"><a class="btn btn-primary" href="#war">⚓ 开始站一</a><a class="btn btn-ghost" href="resources.html#tools">🧺 逛资源库</a></div>' +
      '</div></section>' +
      '<div class="home-wrap">' +
      '<section class="lp-sec" id="home-steps"><div class="sec-head"><span class="sec-kicker">ROADMAP</span><h3>五步路线</h3><p>从零到多站，按顺序推进，每步对应一个作战室。</p></div>' +
      '<ol class="steps">' + STEPS.map(function (s, k) {
        return '<li class="step"><span class="step-no">' + (k + 1) + '</span><span class="step-ico" aria-hidden="true">' + s[0] + '</span><b>' + s[1] + '</b><span>' + s[2] + '</span></li>';
      }).join('') + '</ol></section>' +
      '<section class="lp-sec" id="home-features"><div class="sec-head"><span class="sec-kicker">FEATURES</span><h3>你能得到什么</h3></div>' +
      '<div class="feat-grid">' + FEATURES.map(function (f) {
        return '<a class="feat-card" href="' + esc(f[3]) + '"><span class="feat-ico" aria-hidden="true">' + f[0] + '</span><b>' + esc(f[1]) + '</b><span>' + esc(f[2]) + '</span></a>';
      }).join('') + '</div></section>' +
      '<section class="lp-sec" id="home-progress"><div class="sec-head"><span class="sec-kicker">PROGRESS</span><h3>进度快照</h3></div><div class="glass snap">' + snapshot() +
      '<div class="snap-links"><a href="#map">地图</a><a href="#quest">任务板</a><a href="#ship">商船</a><a href="#ach">成就</a><a href="#settings">设置</a></div></div></section>' +
      '<section class="lp-sec" id="home-res"><div class="sec-head"><span class="sec-kicker">RESOURCES</span><h3>资源入口</h3><p>官方免费档与公开渠道摘要，额度以官网为准。</p></div>' +
      '<div class="strip">' + STRIP.map(function (r) {
        return '<a class="strip-item" href="' + r[2] + '"><span aria-hidden="true">' + r[0] + '</span>' + r[1] + '</a>';
      }).join('') + '</div></section>' +
      '<section class="lp-sec" id="home-guides"><div class="sec-head"><span class="sec-kicker">GUIDES</span><h3>模板与手册</h3></div>' +
      '<div class="guide-grid">' + GUIDES.map(function (g) {
        return '<a class="guide" href="' + g[1] + '">' + esc(g[0]) + ' <span aria-hidden="true">→</span></a>';
      }).join('') + '</div></section>' +
      '<section class="lp-sec" id="home-faq"><div class="sec-head"><span class="sec-kicker">FAQ</span><h3>常见问题</h3></div>' +
      '<div class="faq">' +
      '<details open><summary>进度存在哪里？</summary><p>只存在你当前浏览器的 localStorage，不上传服务器。换设备请在「设置」导出 / 导入 JSON。</p></details>' +
      '<details><summary>能保证赚钱吗？</summary><p>不保证。站内收入数字均为公开案例，额度与规则会变，以各平台官网为准。</p></details>' +
      '<details><summary>和哥飞是什么关系？</summary><p>非官方。这里是基于公开分享的方法学习整理，不含付费社群内容。</p></details>' +
      '<details><summary>游戏能替我建站吗？</summary><p>不能。勾选代表你已在线下真正完成那一步，游戏只负责节奏与记录。</p></details>' +
      '</div></section></div>' +
      '<footer class="site-footer"><div class="foot-inner">' +
      '<div class="foot-brand"><img src="assets/icon-192.png" alt="" width="40" height="40" /><div><b>出海小站练站营</b><span>公开方法学习 · 非官方 · 收入≠保证</span></div></div>' +
      '<div class="foot-links"><a href="docs/MASTER-STATUS.md">MASTER-STATUS</a><a href="docs/PHASE7-DESIGN.md">设计方案</a><a href="resources.html">资源库</a><a href="docs/channels-and-tips.md">渠道笔记</a><a href="https://github.com/yuanqingsong2024/gefei-quest">GitHub</a></div>' +
      '<p class="foot-note">进度仅存本机浏览器 · 更新于 ' + stamp + '</p></div></footer>';
  }

  global.QuestHome = { renderHome: renderHome, SECTIONS: SECTIONS };
})(typeof window !== 'undefined' ? window : globalThis);
