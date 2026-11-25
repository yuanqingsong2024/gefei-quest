/** AEO / GEO / SEO · #geo-seo
 *  加载：js/geo-seo-data.js 内嵌兜底 → fetch data/geo-seo/latest.json
 *  无合法 http(s) source_url 的条目不上屏。不承诺流量、排名或引用。 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) {
    var s = String(u || '').trim();
    return /^https?:\/\//i.test(s) ? s : '';
  }
  function ext(href, label) {
    var u = safeUrl(href);
    if (!u) return '';
    return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(label) + '</a>';
  }
  var SLOT = { launch: '栏目上线', tue: '周二', sat: '周六' };
  var cache = null;
  var fetching = false;

  function typeClass(t) {
    return 'geo-seo-type-' + String(t || '').replace(/[^\w\u4e00-\u9fa5]+/g, '-');
  }
  function tagsHtml(tags) {
    var html = (tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).filter(Boolean).join('');
    return html ? '<div class="geo-seo-tags">' + html + '</div>' : '';
  }
  function normalize(raw) {
    if (!raw) return null;
    var items = Array.isArray(raw) ? raw : (Array.isArray(raw.items) ? raw.items : null);
    if (!items) return null;
    var clean = items.filter(function (it) { return it && safeUrl(it.source_url); });
    clean.sort(function (a, b) {
      var da = String(a.date || '');
      var db = String(b.date || '');
      if (da !== db) return da < db ? 1 : -1;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
    return {
      updated: (!Array.isArray(raw) && (raw.updated || raw.date)) || '',
      items: clean,
    };
  }
  function splitByDate(items) {
    var latest = '';
    var i;
    for (i = 0; i < items.length; i++) {
      if (items[i].date && String(items[i].date) > latest) latest = String(items[i].date);
    }
    var fresh = [];
    var older = [];
    items.forEach(function (it) {
      if (latest && String(it.date) === latest) fresh.push(it);
      else older.push(it);
    });
    return { latest: latest, fresh: fresh, older: older };
  }
  function itemCard(it) {
    var src = safeUrl(it.source_url);
    var slot = SLOT[it.slot] || (it.slot ? String(it.slot) : '');
    var meta = [it.date ? esc(it.date) : '', slot ? esc(slot) : ''].filter(Boolean).join(' · ');
    var sourceLabel = it.source_name ? ('来源：' + it.source_name) : '打开原文';
    return '<article class="geo-seo-card glass ' + typeClass(it.type) + '">' +
      '<div class="geo-seo-meta">' +
      (it.type ? '<span class="pill">' + esc(it.type) + '</span>' : '') +
      (meta ? '<span class="geo-seo-when">' + meta + '</span>' : '') +
      '</div>' +
      '<h3>' + esc(it.title || '未命名') + '</h3>' +
      (it.summary ? '<p>' + esc(it.summary) + '</p>' : '') +
      (it.takeaway ? '<p class="geo-seo-take"><b>核对</b> ' + esc(it.takeaway) + '</p>' : '') +
      tagsHtml(it.tags) +
      (src ? '<div class="geo-seo-links">' + ext(src, sourceLabel) + '</div>' : '') +
      '</article>';
  }
  function newsHtml(pack) {
    var items = (pack && pack.items) || [];
    var illo = global.QuestIcons ? global.QuestIcons.illo('list') : '';
    if (!items.length) {
      return '<div class="empty-illo">' + illo +
        '<p><b>还没有可展示的资讯</b><br>写入 data/geo-seo/latest.json 后会出现在这里。每条都要有可打开的 http(s) 来源。</p></div>';
    }
    var parts = splitByDate(items);
    var freshNote = esc(parts.latest) + (parts.fresh.length > 1 ? ' · 同日 ' + parts.fresh.length + ' 条' : '');
    var html = '<section class="geo-seo-sec" id="geo-seo-latest"><h2>最新资讯</h2>' +
      '<p class="hint">' + freshNote + (pack.updated ? ' · 数据更新 ' + esc(pack.updated) : '') + '</p>' +
      '<div class="geo-seo-grid">' + parts.fresh.map(itemCard).join('') + '</div></section>';
    html += '<section class="geo-seo-sec" id="geo-seo-history"><h2>历史资讯</h2>';
    if (!parts.older.length) {
      html += '<p class="geo-seo-history-note">还没有更早的条目。之后周二、周六的资讯会留在这里。</p>';
    } else {
      html += '<div class="geo-seo-grid">' + parts.older.map(itemCard).join('') + '</div>';
    }
    html += '</section>';
    return html;
  }
  function introHtml() {
    return '<p class="geo-seo-lead">AEO、GEO 和经典 SEO 这几个标签有重叠，不是三选一。本栏给原则要点，以及每条都附来源的公开资讯。可操作清单在两份练站页，这里不重写清单正文。</p>' +
      '<p class="geo-seo-cadence">每周二、周六各一则 · 宁缺勿滥 · 不承诺流量或引用</p>' +
      '<p class="hint">栏目今日上线（2026-11-25）。首刊用 launch，之后再进入周二、周六节奏。</p>';
  }
  function principlesHtml() {
    return '<section class="geo-seo-sec" id="geo-seo-principles"><h2>原则要点</h2>' +
      '<p class="hint">短条目，正文以 GEO checklist 为准。不编造官方引用率或流量承诺。</p>' +
      '<ul class="geo-seo-points">' +
      '<li><a href="./starters/geo-checklist/#cited-vs-recommended">被引用 ≠ 被推荐</a></li>' +
      '<li><a href="./starters/geo-checklist/#measure-layers">四层观察，不要停在「被提及」</a>（爬虫请求 / 问答当时读取 / AI referral / 注册询盘归因）</li>' +
      '<li><a href="./starters/geo-checklist/#page-types-h">Google 流量页 ≠ ChatGPT 流量页</a></li>' +
      '<li><a href="./starters/geo-checklist/#vocab-h">词汇分工：经典 SEO / AEO / GEO</a></li>' +
      '</ul>' +
      '<p class="geo-seo-official">官方对照：Google Search 文档从官方视角认为，为生成式 AI 搜索做优化仍是 SEO。本栏保留从业词汇，不等于 Google 把 AEO/GEO 立成独立官方学科或排名系统。</p></section>';
  }
  function checklistsHtml() {
    return '<section class="geo-seo-sec" id="geo-seo-checklists"><h2>练站清单</h2>' +
      '<div class="geo-seo-grid">' +
      '<article class="geo-seo-card glass"><h3>GEO / AI SEO Checklist</h3><p>词汇与可执行清单。</p>' +
      '<div class="geo-seo-links"><a href="./starters/geo-checklist/">打开 GEO checklist</a></div></article>' +
      '<article class="geo-seo-card glass"><h3>AEO Tools Checklist</h3><p>llms.txt / schema / AI index 等文件与工具链。</p>' +
      '<div class="geo-seo-links"><a href="./starters/aeo-checklist/">打开 AEO checklist</a></div></article>' +
      '</div></section>';
  }
  function ctaHtml() {
    return '<p class="geo-seo-actions">' +
      '<a class="btn btn-primary btn-sm" href="./starters/geo-checklist/#waitlist">申请试用</a>' +
      '<a class="btn btn-sm" href="./starters/aeo-checklist/#waitlist">Waitlist</a>' +
      '</p>';
  }
  function disclaimerHtml() {
    return '<div class="rank-disclaimer" role="note"><b>免责声明</b>：本栏是公开整理，不是排名、流量或收益承诺。以各来源原文为准。宁缺勿滥。</div>';
  }
  function embedded() { return global.QUEST_GEO_SEO || null; }
  function getPack(cb) {
    var emb = normalize(embedded());
    if (cache) return cb(cache);
    if (emb) {
      cache = emb;
      cb(emb);
    } else {
      cb({ updated: '', items: [] });
    }
    if (!global.fetch || fetching) return;
    fetching = true;
    fetch('data/geo-seo/latest.json', { cache: 'no-cache' }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (d) {
      fetching = false;
      var n = normalize(d);
      if (!n) return;
      var same = false;
      try { same = cache && JSON.stringify(cache) === JSON.stringify(n); } catch (e) { same = false; }
      cache = n;
      global.QUEST_GEO_SEO = n;
      if (!same) cb(n);
    }).catch(function () { fetching = false; });
  }
  function paint(root, pack) {
    root.innerHTML = introHtml() + principlesHtml() + checklistsHtml() + ctaHtml() + newsHtml(pack) + disclaimerHtml();
    if (global.QuestNav && global.QuestNav.fixLinks) global.QuestNav.fixLinks(root);
    if (global.QuestShell && global.QuestShell.mountReveal) global.QuestShell.mountReveal(root);
  }
  function render(state, root) {
    if (!root) return;
    root.innerHTML = '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i><i class="sk sk-short"></i></div>';
    var seq = (render._seq = (render._seq || 0) + 1);
    getPack(function (pack) {
      if (seq !== render._seq) return;
      paint(root, pack || { updated: '', items: [] });
    });
  }
  global.QuestGeoSeo = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
