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

  var STEPS = [
    ['search', '挖词', '找一个低竞争英文需求词', '#war'],
    ['build', '上站', '单页上线 · HTTPS · 统计', '#war'],
    ['chart', 'SEO', 'GSC 收录 · 内容与内链', '#war-s3'],
    ['coin', '变现', 'AdSense / 联盟门槛', '#war-m'],
    ['rocket', '放大', '复制流程到多站', '#war-x'],
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
    var sections = N.SITE_NAV.filter(function (n) { return n.id !== 'home'; });
    root.innerHTML =
      '<section class="hero" aria-label="首页">' +
      '<div class="hero-inner">' +
      '<p class="hero-kicker">出海建站 · SEO · 练习营</p>' +
      '<h1 class="hero-title">把出海小站，<br />当成一场闯关冒险</h1>' +
      '<p class="hero-sub">挖词 → 上站 → SEO → 变现 → 放大<br />每一步都有清单、模板和资源，勾一项就是线下真做完一项。</p>' +
      '<div class="hero-cta"><a class="btn btn-primary" href="#war">' + I('target') + '开始站一</a><a class="btn btn-ghost" href="#lib">' + I('toolbox') + '逛资源库</a></div>' +
      '</div></section>' +
      '<div class="home-wrap">' + (state && global.QuestStats ? global.QuestStats.todayCard(state) : '') +
      '<section class="lp-sec" id="home-sections"><div class="sec-head"><span class="sec-kicker">EXPLORE</span><h2>六个栏目</h2><p>全站只有这六个栏目，顶栏、页脚和这里名字完全一致。</p></div>' +
      '<div class="feat-grid">' + sections.map(function (n) {
        return '<a class="feat-card" href="' + n.hash + '"><span class="card-ico card-ico-lg">' + I(n.icon) + '</span><b>' + n.label + '</b><small>' + n.sub + '</small><span>' + n.desc + '</span></a>';
      }).join('') + '</div></section>' +
      '<section class="lp-sec" id="home-tools"><div class="sec-head"><span class="sec-kicker">TOOLS</span><h2>四个实操工具</h2><p>不只是看清单：帮你生成页面、记录选词、追踪每个站的数据。全部只存本机浏览器。</p></div>' +
      '<div class="feat-grid">' +
      '<a class="feat-card" href="#war-kit"><span class="card-ico card-ico-lg">' + I('kit') + '</span><b>站一实操助手</b><small>实战作战室</small><span>填主词和域名，实时检查 title / 描述 / h1，一键下载已填好的站一页面 + robots + sitemap，并附上线自查表。</span></a>' +
      '<a class="feat-card" href="#war-keywords"><span class="card-ico card-ico-lg">' + I('tag') + '</span><b>选词练习板</b><small>实战作战室</small><span>记候选词和搜索结果前 10 观察，自动打分「适合练手 / 可以试 / 先换长尾」，一键设为站一主词。</span></a>' +
      '<a class="feat-card" href="#me-sites"><span class="card-ico card-ico-lg">' + I('ledger') + '</span><b>我的站点台账</b><small>我的进度</small><span>登记每个站的域名、状态和变现方式，按月记曝光、点击、收入，自动画折线。</span></a>' +
      '<a class="feat-card" href="#war-rank" id="home-rank-card"><span class="card-ico card-ico-lg">' + I('trophy') + '</span><b>每日赚钱榜</b><small>实战作战室 · ' + esc((global.QUEST_RANK && global.QUEST_RANK.latest) || '待发布') + '</small><span>每天 10 个公开、合法的赚钱 / 薅羊毛渠道：成本、难度、适合谁、风险和官方来源，可收藏、可加入实操计划。不保证收益。</span></a>' +
      '</div></section>' +
      '<section class="lp-sec" id="home-steps"><div class="sec-head"><span class="sec-kicker">ROADMAP</span><h2>五步路线</h2><p>从零到多站，按顺序推进，每步对应一个实战作战室。</p></div>' +
      '<ol class="steps">' + STEPS.map(function (s, k) {
        return '<li><a class="step" href="' + s[3] + '"><span class="step-no">' + (k + 1) + '</span><span class="card-ico">' + I(s[0]) + '</span><b>' + s[1] + '</b><span>' + s[2] + '</span></a></li>';
      }).join('') + '</ol></section>' +
      '<section class="lp-sec" id="home-res"><div class="sec-head"><span class="sec-kicker">RESOURCES</span><h2>资源库分类</h2><p>官方免费档与公开渠道摘要，额度以官网为准。</p></div>' +
      '<div class="strip">' + N.LIB_CATS.map(function (c) {
        return '<a class="strip-item" href="#lib-' + c.id + '"><span class="card-ico">' + I(c.icon) + '</span>' + c.label + '</a>';
      }).join('') + '</div></section>' +
      '<section class="lp-sec" id="home-guides"><div class="sec-head"><span class="sec-kicker">GUIDES</span><h2>手册与模板</h2></div>' +
      '<div class="guide-grid">' + N.GUIDES.filter(function (g) { return g.group !== 'note'; }).map(function (g) {
        return '<a class="guide" href="' + (g.href || '#guide-' + g.id) + '"' + (g.href ? ' target="_blank" rel="noopener noreferrer"' : '') + '><span class="card-ico">' + I(g.icon) + '</span>' + esc(g.title) + '</a>';
      }).join('') + '<a class="guide guide-more" href="#guides">' + I('book') + '全部手册与笔记</a></div></section>' +
      '<section class="lp-sec" id="home-progress"><div class="sec-head"><span class="sec-kicker">PROGRESS</span><h2>我的进度</h2></div><div class="glass snap">' + snapshot() +
      '<div class="snap-links"><a class="btn btn-sm" href="#path">' + I('map') + '学习路线</a><a class="btn btn-sm" href="#me">' + I('user') + '我的进度</a></div></div></section>' +
      '<section class="lp-sec" id="home-faq"><div class="sec-head"><span class="sec-kicker">FAQ</span><h2>常见问题</h2></div>' +
      '<div class="faq">' +
      '<details open><summary>进度存在哪里？</summary><p>只存在你当前浏览器的 localStorage，不上传服务器。换设备请在「我的进度」导出 / 导入 JSON。</p></details>' +
      '<details><summary>能保证赚钱吗？</summary><p>不保证。站内收入数字均为公开案例，额度与规则会变，以各平台官网为准。</p></details>' +
      '<details><summary>和哥飞是什么关系？</summary><p>非官方。这里是基于公开分享的方法学习整理，不含付费社群内容。</p></details>' +
      '<details><summary>学习路线和实战作战室有什么区别？</summary><p>同一份进度的两种看法：学习路线按章节列全部任务；作战室把每站压成 Day1–7 日程。任一处勾选，另一处同步。</p></details>' +
      '</div></section></div>';
  }

  global.QuestHome = { renderHome: renderHome, SECTIONS: SECTIONS };
})(typeof window !== 'undefined' ? window : globalThis);
