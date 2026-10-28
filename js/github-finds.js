/** 工具发掘 · #war-tools
 *  数据：js/github-finds-data.js 内嵌兜底 → fetch data/github-finds/latest.json
 *  类别：项目 | 生活。短卡摘要 + QuestModal 大弹窗。不承诺收益。 */
(function (global) {
  var I = function (n) { return global.QuestIcons ? global.QuestIcons.svg(n) : ''; };
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var CATS = ['项目', '生活'];
  var view = { cat: 'all' };
  var cache = null;
  var fetching = false;

  function embedded() {
    return global.QUEST_GITHUB_FINDS || null;
  }
  function catClass(c) {
    return 'gf-cat-' + (c === '生活' ? 'life' : 'proj');
  }
  function switchHtml(which) {
    var QR = global.QuestRank;
    if (QR && QR.switchHtml) return QR.switchHtml(which);
    return '<nav class="rank-switch" aria-label="榜单内容">' +
      '<a class="rank-switch-btn" href="#war-rank">每日 Top 10</a>' +
      '<a class="rank-switch-btn" href="#war-rank-agent">Agent 赚钱</a>' +
      '<a class="rank-switch-btn' + (which === 'tools' ? ' active' : '') + '" href="#war-tools"' +
      (which === 'tools' ? ' aria-current="page"' : '') + '>工具发掘</a></nav>';
  }
  function disclaimer() {
    return '<div class="rank-disclaimer" role="note"><b>说明</b>：本频道整理公开的 GitHub / 开源工具，' +
      '分「项目」与「生活」两类，仅供学习与自用参考。<b>不构成收益承诺，也不保证任何变现结果</b>。' +
      '请以各项目官方仓库与许可证为准。</div>';
  }
  function normalize(day) {
    if (!day || !Array.isArray(day.items)) return null;
    return {
      date: day.date || '',
      updated: day.updated || day.date || '',
      weekday: day.weekday || '',
      sample: !!day.sample,
      items: day.items.slice(),
    };
  }
  function getDay(cb) {
    var emb = normalize(embedded());
    if (cache) return cb(cache);
    if (emb) {
      cache = emb;
      cb(emb);
    } else {
      cb(null);
    }
    if (!global.fetch || fetching) return;
    fetching = true;
    fetch('data/github-finds/latest.json', { cache: 'no-cache' }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (d) {
      fetching = false;
      var n = normalize(d);
      if (!n || !n.items.length) return;
      var same = false;
      try { same = cache && JSON.stringify(cache) === JSON.stringify(n); } catch (e) { same = false; }
      cache = n;
      global.QUEST_GITHUB_FINDS = n;
      if (!same) cb(n);
    }).catch(function () { fetching = false; });
  }

  function starsHtml(n) {
    if (n == null || n === '' || isNaN(+n)) return '';
    var v = +n;
    var label = v >= 1000 ? (Math.round(v / 100) / 10) + 'k' : String(v);
    return '<span class="gf-stars" title="GitHub stars">★ ' + esc(label) + '</span>';
  }

  function card(it) {
    var tags = (it.tags || []).slice(0, 4).map(function (t) {
      return '<span class="tag">#' + esc(t) + '</span>';
    }).join('');
    return '<article class="rank-card rank-card--teaser glass gf-card ' + catClass(it.category) + '" data-gf-id="' + esc(it.id || '') + '" data-gf-rank="' + (it.rank || '') + '">' +
      '<div class="rank-head"><span class="rank-no rank-badge rank-no-' + Math.min(it.rank || 4, 4) + '" aria-label="第' + (it.rank || '') + '条">#' + (it.rank || '') + '</span>' +
      '<div class="rank-title"><h3>' + esc(it.name) + '</h3>' +
      '<p><span class="pill" data-type="' + esc(it.category) + '">' + esc(it.category) + '</span> ' +
      starsHtml(it.stars) +
      (it.repo ? ' <span class="rank-cost">' + esc(it.repo) + '</span>' : '') +
      '</p></div></div>' +
      '<p class="rank-why">' + esc(it.summary || it.why || '') + '</p>' +
      (tags ? '<div class="rank-tags">' + tags + '</div>' : '') +
      '<div class="rank-foot"><span class="tool-actions">' +
      '<button type="button" class="btn btn-sm" data-gf-detail="' + esc(it.id || String(it.rank)) + '">查看详情</button>' +
      (it.url ? '<a class="btn btn-sm btn-primary" href="' + esc(it.url) + '" target="_blank" rel="noopener">打开链接</a>' : '') +
      '</span></div></article>';
  }

  function closeDetail() {
    var M = global.QuestModal;
    if (!M) return;
    var roots = M.ensureRoots();
    var modal = roots.modal;
    modal.hidden = true;
    modal.innerHTML = '';
    modal.onclick = null;
    if (closeDetail._onKey) {
      document.removeEventListener('keydown', closeDetail._onKey);
      closeDetail._onKey = null;
    }
  }

  function openDetail(it) {
    var M = global.QuestModal;
    if (!M || !it) return;
    if (closeDetail._onKey) {
      document.removeEventListener('keydown', closeDetail._onKey);
      closeDetail._onKey = null;
    }
    var roots = M.ensureRoots();
    var modal = roots.modal;
    var steps = (it.steps || []).map(function (s, i) {
      return '<li class="rank-step" data-step="' + (i + 1) + '">' +
        '<span class="rank-step-badge">' + (i + 1) + '</span>' +
        '<div class="rank-step-card">' + esc(s) + '</div></li>';
    }).join('');
    var tags = (it.tags || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('');
    var src = (it.sources || []).map(function (s) {
      if (!s || !s.url) return '';
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title || s.url) + '</a></li>';
    }).join('');
    modal.hidden = false;
    modal.innerHTML =
      '<div class="modal-backdrop" data-gf-close="1"></div>' +
      '<div class="modal-card rank-detail-card ' + catClass(it.category) + '" role="dialog" aria-modal="true" aria-labelledby="gf-detail-title">' +
      '<button type="button" class="rank-detail-close" data-gf-close="1" aria-label="关闭">×</button>' +
      '<div class="rank-detail-head">' +
      '<span class="rank-no rank-badge rank-no-' + Math.min(it.rank || 4, 4) + '">#' + (it.rank || '') + '</span>' +
      '<div class="rank-title"><h2 id="gf-detail-title">' + esc(it.name) + '</h2>' +
      '<p><span class="pill" data-type="' + esc(it.category) + '">' + esc(it.category) + '</span> ' +
      starsHtml(it.stars) +
      (it.repo ? ' <span class="rank-cost">' + esc(it.repo) + '</span>' : '') +
      '</p></div></div>' +
      '<section class="rank-detail-section rank-panel rank-panel-why"><h3 class="rank-detail-label">一句话</h3>' +
      '<p class="rank-why rank-why-full">' + esc(it.summary || '') + '</p></section>' +
      '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">为什么值得看</h3>' +
      '<p class="rank-why rank-why-full">' + esc(it.why || '') + '</p></section>' +
      (it.risk ? '<section class="rank-detail-section rank-panel"><h3 class="rank-detail-label">注意</h3>' +
        '<p class="rank-risk">' + esc(it.risk) + '</p></section>' : '') +
      (steps ? '<section class="rank-detail-section"><h3 class="rank-detail-label">怎么用 / 怎么跟进（' + (it.steps || []).length + ' 步）</h3>' +
        '<ol class="rank-roadmap">' + steps + '</ol></section>' : '') +
      '<section class="rank-detail-section rank-panel rank-panel-src"><h3 class="rank-detail-label">链接与来源</h3>' +
      (it.url ? '<p><a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.url) + '</a></p>' : '') +
      (src ? '<ul class="gf-sources">' + src + '</ul>' : '') +
      (tags ? '<div class="rank-tags" style="margin-top:8px">' + tags + '</div>' : '') +
      '</section>' +
      '<div class="modal-actions rank-detail-actions">' +
      (it.url ? '<a class="btn btn-primary" href="' + esc(it.url) + '" target="_blank" rel="noopener">打开链接</a>' : '') +
      '<button type="button" class="btn" data-gf-close="1">关闭</button></div></div>';

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeDetail(); }
    }
    closeDetail._onKey = onKey;
    document.addEventListener('keydown', onKey);
    modal.onclick = function (e) {
      if (e.target.closest('[data-gf-close]')) closeDetail();
    };
  }

  function paint(state, root, ctx, day) {
    if (!day || !day.items || !day.items.length) {
      root.innerHTML = switchHtml('tools') + disclaimer() +
        '<div class="empty-illo">' + (global.QuestIcons ? global.QuestIcons.illo('list') : '') +
        '<p><b>工具发掘还没有发布</b><br>稍后再来看看。</p></div>';
      if (global.QuestNav) global.QuestNav.fixLinks(root);
      return;
    }
    var list = day.items.filter(function (i) {
      return view.cat === 'all' || i.category === view.cat;
    });
    var sampleNote = day.sample
      ? '<p class="hint">当前为<strong>样例数据</strong>（正式发布后由「工具发掘大师」替换）。</p>'
      : '';
    var emptyB = '这个类别今天没有条目';
    root.innerHTML = switchHtml('tools') + disclaimer() +
      '<p class="rank-intro">每天从 GitHub 等公开仓库里挑「项目向」与「生活向」工具，方便自学与自用。不承诺收益。</p>' +
      sampleNote +
      '<section class="rank-bar"><div class="chip-row rank-types" role="group" aria-label="按类别筛选">' +
      '<button type="button" class="chip' + (view.cat === 'all' ? ' active' : '') + '" data-gfcat="all">全部 ' + day.items.length + '</button>' +
      CATS.map(function (c) {
        var n = day.items.filter(function (i) { return i.category === c; }).length;
        return '<button type="button" class="chip ' + catClass(c) + (view.cat === c ? ' active' : '') + '" data-gfcat="' + esc(c) + '">' + esc(c) + ' ' + n + '</button>';
      }).join('') +
      '</div></section>' +
      '<p class="hint" id="gf-count">' + esc(day.date) +
      (day.weekday ? ' · ' + (day.weekday === 'weekend' ? '周末' : '工作日') : '') +
      (day.updated ? ' · 更新 ' + esc(day.updated) : '') +
      ' · 显示 ' + list.length + ' / ' + day.items.length + ' 条</p>' +
      (list.length
        ? '<div class="rank-grid">' + list.map(card).join('') + '</div>'
        : '<div class="empty-illo">' + (global.QuestIcons ? global.QuestIcons.illo('search') : '') +
          '<p><b>' + emptyB + '</b><br>切回「全部」看看。</p></div>');

    root.querySelectorAll('[data-gfcat]').forEach(function (b) {
      b.addEventListener('click', function () {
        view.cat = b.getAttribute('data-gfcat');
        paint(state, root, ctx, day);
      });
    });
    root.querySelectorAll('[data-gf-detail]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var key = b.getAttribute('data-gf-detail');
        var it = day.items.filter(function (i) {
          return i.id === key || String(i.rank) === key;
        })[0];
        if (it) openDetail(it);
      });
    });
    if (global.QuestNav) global.QuestNav.fixLinks(root);
  }

  function render(state, root, ctx) {
    root.innerHTML = switchHtml('tools') +
      '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i><i class="sk sk-short"></i></div>';
    var seq = (render._seq = (render._seq || 0) + 1);
    getDay(function (day) {
      if (seq !== render._seq) return;
      paint(state, root, ctx, day);
    });
  }

  global.QuestGithubFinds = {
    render: render,
    CATS: CATS,
    closeDetail: closeDetail,
  };
})(typeof window !== 'undefined' ? window : globalThis);
