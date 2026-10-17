/** 工具页顶部一行提示。关闭后写入存档 hints.dismissed[route]=true，不整页重绘。 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var HINTS = {
    work: { what: '按每个站点显示下一步。', go: '去登记站点', href: '#me-sites' },
    'work-review': { what: '写本周做了什么和下周 3 件事。', go: '先登记一个站点', href: '#me-sites' },
    war: { what: '每个阶段一张 7 天清单。', go: '勾一项今天已经做完的' },
    'war-kit': { what: '用主词生成可以上线的页面。', go: '填写主词', focus: '#kit-keyword' },
    'war-keywords': { what: '给候选词打分，决定做不做。', go: '记一个候选词', focus: '#kw-kw' },
    'war-rank': { what: '整理公开渠道，不承诺收益。', go: '挑一条加入实操计划' },
    'war-publish': { what: '把页面写进你的 GitHub 仓库。', go: '先填实操助手', href: '#war-kit' },
    'war-share': { what: '生成各平台文案，由你自己去发。', go: '先填实操助手', href: '#war-kit' },
    path: { what: '按章节看关卡地图。', go: '打开任务清单', href: '#path-quests' },
    'path-quests': { what: '勾选当前章节里你已经做完的任务。', go: '勾一项已做完的' },
    lib: { what: '免费工具、托管和渠道笔记。', go: '看免费工具', href: '#lib-tools' },
    pm: { what: '各平台的门槛和分成，以官网为准。', go: '先看「新手怎么选」' },
    me: { what: '等级、成就，以及本机备份。', go: '导出一份 JSON', focus: '#set-export' },
    'me-accounts': { what: '只保存你自己的官方 Token。', go: '填写 GitHub Token', focus: '#gh-token' },
    'me-analytics': { what: '只显示你导入或拉取的数字。', go: '先登记站点', href: '#me-sites' },
    'me-ai': { what: '选择 AI 服务商；不填也能用内置模板。', go: '添加一个服务商', focus: '#ai-new' },
  };
  function keyFor(route) {
    var h = (route && route.hash) || '';
    if (h === 'war' || h === 'war-s2' || h === 'war-s3' || h === 'war-m' || h === 'war-x') return 'war';
    if (h === 'lib' || h.indexOf('lib-') === 0) return 'lib';
    if (h === 'pm' || h.indexOf('pm-') === 0) return 'pm';
    return HINTS[h] ? h : '';
  }
  function dismissed(key) {
    try {
      var s = global.QuestApp && QuestApp.get ? QuestApp.get() : null;
      return !!(s && s.hints && s.hints.dismissed && s.hints.dismissed[key]);
    } catch (_) { return false; }
  }
  function stepHtml(spec) {
    if (spec.href) return '<a href="' + esc(spec.href) + '">' + esc(spec.go) + '</a>';
    if (spec.focus) return '<button type="button" class="page-hint-go" data-focus="' + esc(spec.focus) + '">' + esc(spec.go) + '</button>';
    return esc(spec.go);
  }
  function mount(route) {
    var old = document.querySelector('.page-hint');
    if (old) old.remove();
    var key = keyFor(route);
    if (!key || dismissed(key)) return;
    var spec = HINTS[key];
    var panelId = { home: 'panel-home', path: 'panel-path', war: 'panel-war', lib: 'panel-lib', me: 'panel-me', start: 'panel-start' }[route.section];
    var panel = panelId ? document.getElementById(panelId) : null;
    if (!panel || !spec) return;
    var bar = document.createElement('div');
    bar.className = 'page-hint';
    bar.setAttribute('data-hint', key);
    bar.setAttribute('role', 'note');
    bar.innerHTML = '<p><b>这个页面是干什么的</b> ' + esc(spec.what) + ' <span class="page-hint-step">第一步：</span>' + stepHtml(spec) + '</p>' +
      '<a href="#start">新手引导</a><button type="button" class="page-hint-x" aria-label="关闭提示">×</button>';
    panel.insertBefore(bar, panel.firstChild);
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
    try { if (global.QuestCompact && QuestCompact.reveal) QuestCompact.reveal(el); } catch (_) {}
    try { el.scrollIntoView({ block: 'center' }); } catch (_) {}
    if (el.focus) { try { el.focus(); } catch (_) {} }
  }, true);
  global.QuestHints = { mount: mount, keyFor: keyFor, HINTS: HINTS };
})(typeof window !== 'undefined' ? window : globalThis);
