/** 手册与模板 · 文档页（内置极简 Markdown 渲染器，数据来自 js/guides-data.js，file:// 也可用） */
(function (global) {
  var N = function () { return global.QuestNav; };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function inline(t) {
    var codes = [];
    t = t.replace(/`([^`]+)`/g, function (_, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    t = esc(t);
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '$1');
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, txt, href) {
      var raw = href.replace(/&amp;/g, '&');
      if (/^(\.\.\/)?starters\//.test(raw)) raw = raw.replace(/^\.\.\//, '');
      var fixed = N().fixHref(raw);
      var ext = /^https?:/i.test(fixed) || /^starters\//.test(fixed);
      return '<a href="' + esc(fixed) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + txt + '</a>';
    });
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    t = t.replace(/\u0000(\d+)\u0000/g, function (_, i) { return '<code>' + esc(codes[+i]) + '</code>'; });
    return t;
  }

  function slug(t, used) {
    var s = 'h-' + t.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
    var k = s, i = 2; while (used[k]) k = s + '-' + i++; used[k] = 1; return k;
  }

  function render(md) {
    var L = md.replace(/\r/g, '').split('\n'), out = [], toc = [], used = {}, i = 0;
    function isTable(j) { return /^\s*\|/.test(L[j] || '') && /^\s*\|?\s*:?-{2,}/.test(L[j + 1] || ''); }
    while (i < L.length) {
      var l = L[i];
      if (/^```/.test(l)) { var buf = []; i++; while (i < L.length && !/^```/.test(L[i])) buf.push(L[i++]); i++; out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>'); continue; }
      var h = l.match(/^(#{1,4})\s+(.*)$/);
      if (h) { var lv = h[1].length, id = slug(h[2], used); if (lv === 2 || lv === 3) toc.push({ lv: lv, id: id, t: h[2].replace(/[`*]/g, '') }); out.push('<h' + (lv + 1) + ' id="' + id + '">' + inline(h[2]) + '</h' + (lv + 1) + '>'); i++; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr />'); i++; continue; }
      if (isTable(i)) {
        var row = function (s) { return s.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); }); };
        var head = row(L[i]); i += 2; var rows = [];
        while (i < L.length && /^\s*\|/.test(L[i])) rows.push(row(L[i++]));
        out.push('<div class="md-table"><table><thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
        continue;
      }
      if (/^>\s?/.test(l)) { var q = []; while (i < L.length && /^>\s?/.test(L[i])) q.push(L[i++].replace(/^>\s?/, '')); out.push('<blockquote>' + q.map(inline).join('<br />') + '</blockquote>'); continue; }
      if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
        var ordered = /^\s*\d+\./.test(l), items = [];
        while (i < L.length && /^\s*([-*+]|\d+\.)\s+/.test(L[i])) {
          var it = L[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''), sub = /^\s{2,}/.test(L[i]);
          var cb = it.match(/^\[([ xX])\]\s+(.*)$/);
          var body = cb ? '<span class="md-check' + (cb[1] !== ' ' ? ' on' : '') + '" aria-hidden="true"></span>' + inline(cb[2]) : inline(it);
          items.push('<li' + (sub ? ' class="md-sub"' : '') + (cb ? ' data-check' : '') + '>' + body + '</li>'); i++;
        }
        out.push(ordered ? '<ol>' + items.join('') + '</ol>' : '<ul>' + items.join('') + '</ul>'); continue;
      }
      if (!l.trim()) { i++; continue; }
      var p = [];
      while (i < L.length && L[i].trim() && !/^(#{1,4}\s|```|>|\s*([-*+]|\d+\.)\s+|\s*\|)/.test(L[i]) && !/^\s*-{3,}\s*$/.test(L[i])) p.push(L[i++].replace(/\s{2,}$/, '<br>'));
      out.push('<p>' + p.map(function (x) { return x.slice(-4) === '<br>' ? inline(x.slice(0, -4)) + '<br />' : inline(x); }).join(' ') + '</p>');
    }
    return { html: out.join('\n'), toc: toc };
  }

  function card(g) {
    var ext = !!g.href;
    return '<a class="guide-card" href="' + esc(g.href || '#guide-' + g.id) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
      '<span class="card-ico">' + N().icon(g.icon) + '</span><span class="gc-body"><b>' + esc(g.title) + '</b><span>' + esc(g.desc) + '</span></span>' +
      '<span class="gc-go">' + N().icon(ext ? 'external' : 'arrowRight') + '</span></a>';
  }

  function renderGuides(root) {
    var Nv = N();
    root.innerHTML = Nv.GUIDE_GROUPS.map(function (gr) {
      var list = Nv.GUIDES.filter(function (g) { return g.group === gr.id; });
      return '<section class="block"><h2 class="block-title">' + gr.label + ' <span class="count">' + list.length + '</span></h2>' +
        (gr.id === 'template' ? '<p class="block-sub">模板是给你复制去部署的英文单页，新窗口打开，不带本站外观。</p>' : '') +
        '<div class="guide-grid2">' + list.map(card).join('') + '</div></section>';
    }).join('');
  }

  function renderDev(root) {
    var Nv = N();
    root.innerHTML = '<section class="block"><h2 class="block-title">项目文档 <span class="count">' + Nv.DEV_DOCS.length + '</span></h2>' +
      '<div class="guide-grid2">' + Nv.DEV_DOCS.map(function (d) {
        return card({ id: d.id, title: d.title, icon: 'file', desc: d.id + '.md' }).replace('#guide-' + d.id, '#dev-' + d.id);
      }).join('') + card({ id: 'spec', title: '设计规范 DESIGN-SPEC', icon: 'file', desc: '早期视觉与数据规范', href: 'DESIGN-SPEC.html' }) + '</div></section>';
  }

  function docTitle(id, isDev) {
    var Nv = N();
    if (isDev) { var d = Nv.DEV_DOCS.filter(function (x) { return x.id === id; })[0]; return d ? d.title : id; }
    var g = Nv.guideById(id); return g ? g.title : id;
  }

  function renderDoc(root, id, isDev) {
    var Nv = N();
    var md = (global.QUEST_GUIDES_MD || {})[id];
    var back = isDev ? '#dev' : '#guides', backLabel = isDev ? Nv.DEV_SECTION.label : Nv.navById('guides').label;
    if (md == null) {
      root.innerHTML = '<div class="empty-state">' + Nv.icon('file', 'ico-lg') + '<h3>没有找到这份文档</h3><p>链接可能已更新。</p><a class="btn btn-primary" href="' + back + '">返回' + backLabel + '</a></div>';
      return;
    }
    var r = render(md);
    var g = Nv.guideById(id);
    var related = '';
    var st = Nv.STATIONS.filter(function (s) { return s.guide === id; })[0];
    if (st) related = '<a class="btn btn-primary btn-sm" href="' + st.hash + '">' + Nv.icon('target') + '去' + st.label + '作战室勾选</a>';
    root.innerHTML = '<div class="doc-layout">' +
      '<aside class="doc-aside"><a class="btn btn-sm doc-back" href="' + back + '">' + Nv.icon('arrowLeft') + '返回' + backLabel + '</a>' +
      (r.toc.length ? '<nav class="doc-toc" aria-label="目录"><h4>目录</h4>' + r.toc.map(function (t) { return '<a class="toc-l' + t.lv + '" href="#' + (isDev ? 'dev-' : 'guide-') + id + '" data-target="' + t.id + '">' + esc(t.t) + '</a>'; }).join('') + '</nav>' : '') +
      '</aside><article class="doc-body md">' +
      '<div class="doc-meta">' + (g ? '<span class="card-ico">' + Nv.icon(g.icon) + '</span>' : '') + '<span>' + esc(docTitle(id, isDev)) + '</span>' + related + '</div>' +
      r.html + '<div class="doc-end"><a class="btn btn-sm" href="' + back + '">' + Nv.icon('arrowLeft') + '返回' + backLabel + '</a></div></article></div>';
    root.querySelectorAll('.doc-toc a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById(a.getAttribute('data-target'));
        if (el) el.scrollIntoView({ behavior: document.documentElement.classList.contains('reduce-motion') ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  global.QuestGuides = { render: render, renderGuides: renderGuides, renderDev: renderDev, renderDoc: renderDoc, docTitle: docTitle };
})(typeof window !== 'undefined' ? window : globalThis);
