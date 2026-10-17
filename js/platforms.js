/** Phase 15 · 平台变现页面：#pm 总览、#pm-cn / #pm-global 分组、#pm-<分类> 分类页 */
(function (global) {
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function D() { return global.QUEST_PLATFORMS; }
  function ico(n) { return global.QuestIcons ? global.QuestIcons.svg(n) : ''; }
  function links() { return global.QUEST_PLATFORM_LINKS || { status: {}, total: 0, ok: 0 }; }
  function cat(id) { return D().CATS.find(function (c) { return c.id === id; }); }
  function inCat(id) { return D().PLATFORMS.filter(function (p) { return p.cat === id; }); }
  function sourceCount() { var u = {}; D().PLATFORMS.forEach(function (p) { p.src.forEach(function (s) { u[s[1]] = 1; }); }); return Object.keys(u).length; }
  function figureCount() { var n = 0; D().PLATFORMS.forEach(function (p) { p.rules.forEach(function (r) { if (sourced(r)) n++; }); }); return n; }
  function isNA(t) { return String(t).indexOf(D().NA) >= 0; }
  function sourced(r) { return !!r[1] && !isNA(r[1]) && !isNA(r[0]); }
  function stars(n) { return '<span class="pm-lv" title="新手上手难度（编辑主观评估，1 易 – 5 难）">' + '●●●●●'.slice(0, n) + '<i>' + '●●●●●'.slice(n) + '</i></span>'; }
  function linkBadge(u) {
    var c = links().status[u];
    if (!c) return '<span class="pm-link unk">未核实</span>';
    if (c === '200') return '<span class="pm-link ok">200 已核实</span>';
    return '<span class="pm-link warn" title="自动检查被网站拦截或返回异常，请在浏览器手动打开">' + esc(c) + ' 自动检查被拦截</span>';
  }
  function disclaimer() {
    var L = links();
    return '<div class="pm-note">' + ico('lock') + '<div><b>阅读须知</b>：规则会变，所有数字均标注来源与日期；查不到可靠来源的写「' + esc(D().NA) + '」。本页不承诺任何收益，只列合法渠道；海外平台仅供身处支持地区或有合法海外主体者参考，本站不提供绕过地区限制的方法。共 <b>' + sourceCount() + '</b> 个来源、<b>' + figureCount() + '</b> 条带出处的规则，链接于 ' + esc(L.checked || '—') + ' 自动核实 ' + (L.ok || 0) + '/' + (L.total || 0) + ' 返回 200（其余为网站拦截机器访问，已逐条标注）。</div></div>';
  }
  function tabs(active) {
    var t = [['pm', '总览', 'compass'], ['pm-cn', '国内', 'flag'], ['pm-global', '海外', 'globe']];
    return '<div class="pm-tabs">' + t.map(function (x) { return '<a href="#' + x[0] + '" class="' + (active === x[0] ? 'on' : '') + '">' + ico(x[2]) + x[1] + '</a>'; }).join('') + '</div>';
  }
  function catCard(c) {
    var ps = inCat(c.id);
    return '<a class="pm-cat card" href="#pm-' + c.id + '"><span class="card-ico">' + ico(c.icon) + '</span><div><b>' + esc(c.label) + '</b><small>' + esc(c.desc) + '</small><em>' + ps.length + ' 个平台 · ' + ps.map(function (p) { return esc(p.name.replace(/（.*?）/g, '')); }).slice(0, 4).join(' / ') + (ps.length > 4 ? '…' : '') + '</em></div></a>';
  }
  function groupBlock(g) {
    return '<section class="pm-group" id="pm-group-' + g.id + '"><h3>' + ico(g.icon) + esc(g.label) + '</h3><div class="pm-cats">' + D().CATS.filter(function (c) { return c.group === g.id; }).map(catCard).join('') + '</div></section>';
  }
  function guide() {
    return '<section class="pm-guide"><h3>' + ico('bulb') + '新手怎么选</h3><ol>' +
      '<li><b>先看你会什么，而不是哪里「最赚钱」</b>：所有平台都要求原创与持续更新，选你能坚持 3 个月的形式。</li>' +
      '<li><b>先零成本、后投入</b>：图文与技能服务几乎零成本；直播、付费短剧、投流需要资金与资质，不建议新手先做。</li>' +
      '<li><b>只走官方入口</b>：分成、推广、投稿都在平台官方后台完成；要求先交钱「内部渠道」「保过」「包赚」的基本是骗局。</li>' +
      '<li><b>门槛以后台为准</b>：本页数字来自官方页面或权威报道并标日期，规则随时调整，以你登录后台看到的为准。</li></ol>' +
      '<table class="pm-table"><thead><tr><th>你的情况</th><th>可以先看</th></tr></thead><tbody>' + D().GUIDE.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</tbody></table></section>';
  }
  function compare(ps, global_) {
    return '<div class="pm-table-wrap"><table class="pm-table pm-compare"><thead><tr><th>平台</th><th>变现方式</th><th>门槛</th><th>分成/计费</th>' + (global_ ? '<th>大陆可用性</th>' : '') + '<th>上手难度</th></tr></thead><tbody>' +
      ps.map(function (p) {
        var r = p.rules.find(sourced);
        return '<tr><td><a href="#pm-' + p.cat + '/' + p.id + '" data-pm-jump="' + p.id + '"><b>' + esc(p.name) + '</b></a></td><td>' + esc(p.ways) + '</td><td>' + esc(p.gate) + '</td><td>' + (r ? esc(r[0]) + '<small class="pm-src">（' + esc(r[1]) + '，' + esc(r[2]) + '）</small>' : '<span class="pm-na">' + esc(D().NA) + '</span>') + '</td>' + (global_ ? '<td>' + esc(p.access || '') + '</td>' : '') + '<td>' + stars(p.level || 3) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function card(p) {
    return '<article class="pm-card card" id="pm-p-' + p.id + '"><header><h3>' + esc(p.name) + '</h3>' + stars(p.level || 3) + '<span class="pm-up">更新 ' + esc(p.up) + '</span></header>' +
      '<dl><dt>变现方式</dt><dd>' + esc(p.ways) + '</dd><dt>门槛</dt><dd>' + esc(p.gate) + '</dd>' +
      '<dt>分成 / 计费规则</dt><dd><ul class="pm-rules">' + p.rules.map(function (r) { return '<li>' + (isNA(r[0]) && !r[1] ? '<span class="pm-na">' + esc(r[0]) + '</span>' : esc(r[0])) + (r[1] ? ' <small class="pm-src">来源：' + esc(r[1]) + (r[2] ? '，' + esc(r[2]) : '') + '</small>' : '') + '</li>'; }).join('') + '</ul></dd>' +
      (p.access ? '<dt>大陆可用性</dt><dd>' + esc(p.access) + '</dd><dt>收款方式</dt><dd>' + esc(p.payout || D().NA) + '</dd>' : '') +
      '<dt>实操方案</dt><dd><ol>' + p.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></dd>' +
      '<dt>适合谁</dt><dd>' + esc(p.fit) + '</dd><dt>风险 / 违规红线</dt><dd class="pm-risk">' + esc(p.risk) + '</dd>' +
      '<dt>来源链接</dt><dd><ul class="pm-srcs">' + p.src.map(function (s) { return '<li><a href="' + esc(s[1]) + '" target="_blank" rel="noopener nofollow">' + esc(s[0]) + '</a> ' + linkBadge(s[1]) + '</li>'; }).join('') + '</ul></dd></dl></article>';
  }
  function render(el, param) {
    var d = D(); if (!d) { el.innerHTML = '<p>数据未加载</p>'; return; }
    param = param || '';
    var sub = param.split('/'), id = sub[0], h = '';
    if (!id) {
      h = tabs('pm') + '<div class="pm-hero"><h2>' + ico('coin') + '平台变现 · 国内 + 海外</h2><p>' + d.PLATFORMS.length + ' 个平台、' + d.CATS.length + ' 个分类，按同一格式整理：变现方式 / 门槛 / 分成规则 / 实操 / 适合谁 / 红线 / 来源。</p></div>' + disclaimer() + d.GROUPS.map(groupBlock).join('') + guide();
    } else if (id === 'cn' || id === 'global') {
      var g = d.GROUPS.find(function (x) { return x.id === id; });
      h = tabs('pm-' + id) + disclaimer() + groupBlock(g) + '<h3 class="pm-h">' + ico('ledger') + '各分类对比表</h3>' + d.CATS.filter(function (c) { return c.group === id; }).map(function (c, k) { return '<details class="cx-details pm-det"><summary>' + ico(c.icon) + esc(c.label) + ' <small>' + inCat(c.id).length + ' 个平台</small></summary><p class="pm-det-link"><a href="#pm-' + c.id + '">打开「' + esc(c.label) + '」分类页 →</a></p>' + compare(inCat(c.id), id === 'global') + '</details>'; }).join('');
    } else {
      var c = cat(id);
      if (!c) { el.innerHTML = tabs('') + '<p>没有这个分类。</p>'; return; }
      var ps = inCat(id);
      h = tabs('pm-' + c.group) + '<div class="pm-hero"><h2>' + ico(c.icon) + esc(c.label) + '</h2><p>' + esc(c.desc) + '</p></div>' + disclaimer() +
        '<section class="pm-sec" data-tab="平台详情（' + ps.length + '）"><h3 class="pm-h">' + ico('map') + '平台详情</h3><div class="pm-cards">' + ps.map(card).join('') + '</div></section>' +
        '<section class="pm-sec" data-tab="对比表"><h3 class="pm-h">' + ico('ledger') + '对比表</h3>' + compare(ps, c.group === 'global') + '</section>' +
        '<div class="pm-more">' + d.CATS.filter(function (x) { return x.group === c.group && x.id !== id; }).map(function (x) { return '<a class="chip" href="#pm-' + x.id + '">' + esc(x.label) + '</a>'; }).join('') + '</div>';
    }
    el.innerHTML = '<div class="pm-page">' + h + '</div>';
    function scrollPastNav(t, behavior) {
      if (!t) return;
      if (global.QuestShell && QuestShell.scrollToEl) QuestShell.scrollToEl(t, behavior || 'auto');
      else t.scrollIntoView({ behavior: behavior || 'auto', block: 'start' });
    }
    el.querySelectorAll('[data-pm-jump]').forEach(function (a) { a.addEventListener('click', function (e) { var t = el.querySelector('#pm-p-' + a.getAttribute('data-pm-jump')); if (t) { e.preventDefault(); if (global.QuestCompact) QuestCompact.reveal(t); scrollPastNav(t, 'smooth'); } }); });
    if (sub[1]) { var t = el.querySelector('#pm-p-' + sub[1]); if (t) setTimeout(function () { if (global.QuestCompact) { QuestCompact.apply(el); QuestCompact.reveal(t); } scrollPastNav(t, 'auto'); }, 30); }
  }
  function titleOf(param) { var id = (param || '').split('/')[0]; if (!id) return '平台变现'; if (id === 'cn') return '平台变现 · 国内'; if (id === 'global') return '平台变现 · 海外'; var c = cat(id); return c ? '平台变现 · ' + c.label : '平台变现'; }
  global.QuestPlatforms = { render: render, titleOf: titleOf, sourceCount: sourceCount, figureCount: figureCount };
})(typeof window !== 'undefined' ? window : globalThis);
