/** Phase 9 · 实操工具：站一实操助手 #war-kit · 选词练习板 #war-keywords · 站点台账 #me-sites
 *  数据仅存本机 localStorage（save.kit / save.keywords / save.sites，均为追加字段） */
(function (global) {
  var I = function (n) { return global.QuestIcons.svg(n); };
  function navI(hash, fallback) {
    var Nv = global.QuestNav;
    if (hash && Nv && Nv.iconName && Nv.iconName(hash)) return Nv.iconFor(hash);
    return I(fallback || 'compass');
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  var PRIV = '<p class="tool-privacy">' + I('lock') + '所有内容只保存在当前浏览器，不会上传；换设备请在「我的进度」导出存档。</p>';

  /* ---------- 起步模板（存档只追加 kit.template / kit.templateDone） ---------- */
  var TEMPLATES = [
    { id: 'basic', name: '单页介绍', desc: '一页讲清是什么、怎么用、关于和隐私。', icon: 'file' },
    { id: 'tool', name: '在线工具站', desc: '工具框、使用步骤和常见问题。', icon: 'wrench' },
    { id: 'compare', name: '对比/评测页', desc: '对比表、优缺点和结论，以官网为准。', icon: 'list' },
    { id: 'glossary', name: '术语表/词汇站', desc: 'A–Z 跳转和围绕主词的词条卡。', icon: 'book' },
  ];
  function templateId(kit) {
    var id = kit && kit.template;
    return id === 'basic' || id === 'tool' || id === 'compare' || id === 'glossary' ? id : 'basic';
  }
  function templateMeta(kit) {
    var id = templateId(kit);
    for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) return TEMPLATES[i];
    return TEMPLATES[0];
  }

  /* ---------- 存档默认值（旧存档缺字段时补齐） ---------- */
  function ensure(state) {
    var k = state.kit || {};
    var checks = k.checks && typeof k.checks === 'object' ? k.checks : {};
    var next = { keyword: k.keyword || '', intro: k.intro || '', domain: k.domain || '', email: k.email || '', checks: checks };
    Object.keys(k).forEach(function (key) { if (!Object.prototype.hasOwnProperty.call(next, key)) next[key] = k[key]; });
    next.template = templateId(k);
    next.templateDone = !!k.templateDone;
    state.kit = next;
    var w = state.keywords || {};
    state.keywords = { items: Array.isArray(w.items) ? w.items : [], s2Target: w.s2Target || '', sort: w.sort || 'score', filter: w.filter || 'all' };
    var s = state.sites || {};
    state.sites = { items: Array.isArray(s.items) ? s.items : [] };
    return state;
  }

  /* ---------- 站一实操助手 ---------- */
  function slugify(t) { return String(t || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function cleanDomain(d) { return String(d || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase(); }
  function gen(kit) {
    var kw = (kit.keyword || '').trim() || 'YOURBRAND';
    var intro = (kit.intro || '').trim() || (kw + ' is a simple, free page that helps you get one job done fast.');
    var domain = cleanDomain(kit.domain) || 'yourbrand.example';
    var email = (kit.email || '').trim() || 'you@' + domain;
    var title = kw + ' — ' + (intro.length > 40 ? 'simple free guide' : intro.replace(/\.$/, ''));
    if (title.length > 60) title = (kw + ' — simple free guide').slice(0, 60);
    var desc = intro;
    if (desc.length < 120) desc = (desc.replace(/\.?$/, '.') + ' Free, fast and beginner friendly. Learn what ' + kw + ' is and how to use it today.');
    if (desc.length > 160) desc = desc.slice(0, 157).replace(/\s+\S*$/, '') + '...';
    return { kw: kw, intro: intro, domain: domain, email: email, title: title, desc: desc, h1: kw, slug: slugify(kw) || 'yourbrand' };
  }
  function rules(g, kit) {
    var has = !!(kit.keyword || '').trim(), low = g.kw.toLowerCase();
    var list = [
      { ok: g.title.length <= 60 && g.title.toLowerCase().indexOf(low) >= 0 && has, t: 'title ≤60 字符且含主词（' + g.title.length + '/60）' },
      { ok: g.desc.length >= 120 && g.desc.length <= 160, t: 'description 120–160 字符（' + g.desc.length + '）' },
      { ok: has, t: '页面只有 1 个 h1，且就是主词' },
      { ok: !!cleanDomain(kit.domain), t: '已填写域名（用于 canonical / sitemap）' },
    ];
    if (templateId(kit) !== 'basic') list.push({ ok: !!kit.templateDone, t: '模板占位内容已替换（tool/compare/glossary 里的 placeholder）' });
    return list;
  }
  function pageHtml(g) {
    var y = new Date().getFullYear();
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
      '<title>' + esc(g.title) + '</title>\n<meta name="description" content="' + esc(g.desc) + '" />\n' +
      '<link rel="canonical" href="https://' + esc(g.domain) + '/" />\n<!-- Google Search Console: <meta name="google-site-verification" content="PASTE_CODE_HERE" /> -->\n' +
      '<style>:root{color-scheme:light;--bg:#fafaf8;--card:#fff;--ink:#1c1917;--muted:#57534e;--accent:#0f766e;--line:#e7e5e4}*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55}header,main,footer{max-width:720px;margin:0 auto;padding:24px 20px}header{padding-top:48px}h1{margin:0 0 8px;font-size:1.85rem}.tag{color:var(--muted)}.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin:16px 0}a{color:var(--accent)}nav a{margin-right:14px}footer{color:var(--muted);font-size:.9rem;border-top:1px solid var(--line);margin-top:32px}</style>\n</head>\n<body>\n' +
      '<header>\n<nav aria-label="Primary"><a href="#what">Home</a><a href="#about">About</a><a href="#privacy">Privacy</a></nav>\n<h1>' + esc(g.h1) + '</h1>\n<p class="tag">' + esc(g.intro) + '</p>\n</header>\n<main>\n' +
      '<section class="card" id="what"><h2>What is ' + esc(g.kw) + '?</h2><p><strong>' + esc(g.kw) + '</strong> — ' + esc(g.intro) + '</p></section>\n' +
      '<section class="card"><h2>How to use ' + esc(g.kw) + '</h2><ol><li>Step one: describe it here.</li><li>Step two: keep it short and useful.</li><li>Step three: add a screenshot or example.</li></ol></section>\n' +
      '<section class="card" id="about"><h2>About</h2><p>' + esc(g.kw) + ' is a small independent site. Questions? Email <a href="mailto:' + esc(g.email) + '">' + esc(g.email) + '</a>.</p></section>\n' +
      '<section class="card" id="privacy"><h2>Privacy</h2><p>This static page does not intentionally collect personal data. If analytics or ads are added later, this section will be updated. Contact: ' + esc(g.email) + '.</p></section>\n' +
      '</main>\n<footer><p>&copy; ' + y + ' ' + esc(g.kw) + ' &middot; ' + esc(g.domain) + '</p></footer>\n<!-- Paste GA4 / Microsoft Clarity snippet here -->\n</body>\n</html>\n';
  }
  function robotsTxt(g) { return 'User-agent: *\nAllow: /\n\nSitemap: https://' + g.domain + '/sitemap.xml\n'; }
  function sitemapXml(g) { return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://' + g.domain + '/</loc><lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod></url>\n</urlset>\n'; }
  var BASE_STYLE = null;
  function baseStyle() {
    if (BASE_STYLE == null) {
      var m = pageHtml({ kw: '', h1: '', intro: '', email: '', domain: 'x', title: 't', desc: 'd' }).match(/<style>([\s\S]*?)<\/style>/);
      BASE_STYLE = m ? m[1] : '';
    }
    return BASE_STYLE;
  }
  var EXTRA_STYLE = 'h2{font-size:1.25rem;margin:0 0 8px}h3{font-size:1.05rem;margin:14px 0 6px}label{display:block;font-weight:700;margin:10px 0 4px}textarea,input[type=text]{width:100%;font:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px}button{font:inherit;font-weight:700;background:transparent;color:var(--accent);border:2px solid var(--accent);border-radius:8px;padding:8px 14px;cursor:pointer}output{display:block;margin-top:12px;padding:12px;border:1px dashed var(--line);border-radius:8px;white-space:pre-wrap}table{width:100%;border-collapse:collapse;font-size:.92rem}th,td{border:1px solid var(--line);padding:8px;text-align:left;vertical-align:top}.tbl{overflow-x:auto}.note{border-left:3px solid var(--accent);padding:8px 12px;margin:16px 0}.az{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.az a{display:inline-flex;min-width:2.2rem;min-height:2.2rem;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;text-decoration:none}ul,ol{margin:8px 0;padding-left:1.2rem}details{margin:8px 0;border-top:1px solid var(--line);padding-top:8px}summary{cursor:pointer;font-weight:700}@media (max-width:560px){header,main,footer{padding:20px 14px}table{font-size:.85rem}}';
  function shell(g, nav, main, extraScript) {
    var y = new Date().getFullYear();
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
      '<title>' + esc(g.title) + '</title>\n<meta name="description" content="' + esc(g.desc) + '" />\n' +
      '<link rel="canonical" href="https://' + esc(g.domain) + '/" />\n<!-- Google Search Console: <meta name="google-site-verification" content="PASTE_CODE_HERE" /> -->\n' +
      '<style>' + baseStyle() + EXTRA_STYLE + '</style>\n</head>\n<body>\n' +
      '<header>\n<nav aria-label="Primary">' + nav + '</nav>\n<h1>' + esc(g.h1) + '</h1>\n<p class="tag">' + esc(g.intro) + '</p>\n</header>\n<main>\n' +
      main +
      '</main>\n<footer><p>&copy; ' + y + ' ' + esc(g.kw) + ' &middot; ' + esc(g.domain) + '</p></footer>\n' +
      (extraScript || '') +
      '<!-- Paste GA4 / Microsoft Clarity snippet here -->\n</body>\n</html>\n';
  }
  function aboutBlock(g) {
    return '<section class="card" id="about"><h2>About</h2><p>' + esc(g.kw) + ' is a small independent site. Questions? Email <a href="mailto:' + esc(g.email) + '">' + esc(g.email) + '</a>.</p></section>\n';
  }
  function privacyBlock(g) {
    return '<section class="card" id="privacy"><h2>Privacy</h2><p>This static page does not intentionally collect personal data. If analytics or ads are added later, this section will be updated. Contact: ' + esc(g.email) + '.</p></section>\n';
  }
  function toolScript() {
    return '<script>\n' +
      '(function(){\n' +
      'var f=document.getElementById("tool-form");\n' +
      'if(!f)return;\n' +
      'f.addEventListener("submit",function(e){\n' +
      'e.preventDefault();\n' +
      'var text=document.getElementById("tool-text").value;\n' +
      'var note=(document.getElementById("tool-note").value||"").trim();\n' +
      'var words=text.trim()?text.trim().split(/\\s+/).length:0;\n' +
      'var chars=Array.from(text).length;\n' +
      'var msg=(note?note+": ":"")+words+" words, "+chars+" characters.\\nEcho: "+text;\n' +
      'document.getElementById("tool-out").textContent=msg;\n' +
      '});\n' +
      '})();\n' +
      '<' + '/script>\n';
  }
  function toolPage(g) {
    var main = '<section class="card" id="tool"><h2>' + esc(g.kw) + ' tool</h2>' +
      '<p><strong>Placeholder — replace with your tool.</strong> This sample counts words and characters in your browser. Swap this form and the script for the tool you actually ship.</p>' +
      '<form id="tool-form" action="#tool-out">' +
      '<label for="tool-text">Text</label><textarea id="tool-text" name="text" rows="5" placeholder="Paste text here"></textarea>' +
      '<label for="tool-note">Label</label><input id="tool-note" name="note" type="text" placeholder="Optional label" />' +
      '<button type="submit">Count words and characters</button>' +
      '<output id="tool-out" name="result" for="tool-text">Waiting for input.</output>' +
      '</form></section>\n' +
      '<section class="card" id="how"><h2>How to use</h2><ol>' +
      '<li>Replace the placeholder form with your own tool.</li>' +
      '<li>Type or paste text, and add a label if you want one.</li>' +
      '<li>Press the button and read the result in the output box.</li>' +
      '</ol></section>\n' +
      '<section class="card" id="faq"><h2>FAQ</h2>' +
      '<details><summary>Is this the real tool?</summary><p>No. It is a placeholder — replace with your tool before you publish.</p></details>' +
      '<details><summary>Does this page upload what I type?</summary><p>No. The sample script runs only in the browser and does not send the text anywhere.</p></details>' +
      '</section>\n' +
      aboutBlock(g) + privacyBlock(g);
    return shell(g, '<a href="#tool">Tool</a><a href="#how">How to use</a><a href="#faq">FAQ</a><a href="#about">About</a><a href="#privacy">Privacy</a>', main, toolScript());
  }
  function comparePage(g) {
    var opts = ['Option A — placeholder', 'Option B — placeholder', 'Option C — placeholder'];
    var rows = [
      ['Price', '\u2014', 'check official site', '\u2014'],
      ['Best for', 'check official site', '\u2014', 'check official site'],
      ['Main feature', '\u2014', 'check official site', '\u2014'],
      ['Limits', 'check official site', '\u2014', '\u2014'],
      ['Support', '\u2014', '\u2014', 'check official site'],
    ];
    var head = '<tr><th scope="col">Criteria</th>' + opts.map(function (n) { return '<th scope="col">' + esc(n) + '</th>'; }).join('') + '</tr>';
    var body = rows.map(function (r) {
      return '<tr><th scope="row">' + esc(r[0]) + '</th>' + r.slice(1).map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('');
    var pros = opts.map(function (n) {
      return '<h3>' + esc(n) + '</h3><p>Pros</p><ul><li>placeholder \u2014 replace with a real advantage you checked</li></ul><p>Cons</p><ul><li>placeholder \u2014 replace with a real drawback you checked</li></ul>';
    }).join('');
    var date = new Date().toISOString().slice(0, 10);
    var main = '<section class="card" id="compare"><h2>Compare options</h2><p>A placeholder comparison for <strong>' + esc(g.kw) + '</strong>. Replace every cell before you publish. Nothing here is a real price or score.</p>' +
      '<div class="tbl"><table><caption>Placeholder comparison for ' + esc(g.kw) + '</caption><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div></section>\n' +
      '<section class="card" id="pros"><h2>Pros and cons</h2>' + pros + '</section>\n' +
      '<section class="card" id="verdict"><h2>Our verdict</h2><p>Placeholder verdict for ' + esc(g.kw) + '. Replace this with your own conclusion after you read each official site. This page does not assign a rank or a score.</p></section>\n' +
      '<p class="note" id="disclaimer">Prices and features change \u2014 check each official site (last checked ' + date + ').</p>\n' +
      aboutBlock(g) + privacyBlock(g);
    return shell(g, '<a href="#compare">Compare</a><a href="#pros">Pros and cons</a><a href="#verdict">Verdict</a><a href="#about">About</a><a href="#privacy">Privacy</a>', main, '');
  }
  function glossaryPage(g) {
    var specs = [
      ['A', 'About', 'What ' + g.kw + ' refers to on this site. Placeholder \u2014 replace with your definition.'],
      ['B', 'Basics', 'The basic idea of ' + g.kw + '. Placeholder \u2014 replace with a plain-language note.'],
      ['C', 'Checklist', 'A starter checklist for ' + g.kw + '. Placeholder \u2014 replace with real steps.'],
      ['D', 'Definition', 'A one-line definition of ' + g.kw + '. Placeholder \u2014 replace with wording you stand behind.'],
      ['E', 'Example', 'An example of ' + g.kw + ' in use. Placeholder \u2014 replace with an example you can verify.'],
      ['F', 'Features', 'A feature people look up next to ' + g.kw + '. Placeholder \u2014 replace with a feature you checked.'],
      ['G', 'Getting started', 'Where a newcomer starts with ' + g.kw + '. Placeholder \u2014 replace with your first step.'],
      ['H', 'How it is used', 'A common way people use ' + g.kw + '. Placeholder \u2014 replace with a real use.'],
    ];
    var terms = specs.map(function (s) {
      return { letter: s[0], title: s[1] + ': ' + g.kw, id: 'term-' + slugify(s[1]) + '-' + g.slug, body: s[2] };
    });
    var seen = {}, links = [];
    terms.forEach(function (t) {
      if (seen[t.letter]) return;
      seen[t.letter] = 1;
      links.push('<a href="#' + t.id + '">' + t.letter + '</a>');
    });
    var cards = terms.map(function (t) {
      return '<article class="card" id="' + t.id + '"><h2>' + esc(t.title) + '</h2><p>' + esc(t.body) + '</p></article>\n';
    }).join('');
    var main = '<section class="card" id="glossary"><h2>Glossary</h2><p>Placeholder terms built around <strong>' + esc(g.kw) + '</strong>. Replace each card with a definition you wrote.</p>' +
      '<nav class="az" aria-label="A\u2013Z">' + links.join('') + '</nav></section>\n' +
      cards +
      '<section class="card" id="how"><h2>How to use this glossary</h2><ol>' +
      '<li>Jump with the A\u2013Z links. Only letters that have a card are listed.</li>' +
      '<li>Open a card and replace the placeholder text.</li>' +
      '<li>Keep one term per card so the letter links stay accurate.</li>' +
      '</ol></section>\n' +
      aboutBlock(g) + privacyBlock(g);
    return shell(g, '<a href="#glossary">Glossary</a><a href="#how">How to use</a><a href="#about">About</a><a href="#privacy">Privacy</a>', main, '');
  }
  function pageFor(kit, g) {
    var id = templateId(kit);
    if (id === 'tool') return toolPage(g);
    if (id === 'compare') return comparePage(g);
    if (id === 'glossary') return glossaryPage(g);
    return pageHtml(g);
  }
  function files(kit) {
    var g = gen(kit);
    return [{ name: 'index.html', text: pageFor(kit, g) }, { name: 'robots.txt', text: robotsTxt(g) }, { name: 'sitemap.xml', text: sitemapXml(g) }];
  }

  /* 零依赖 ZIP（store 模式） */
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xffffffff; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function makeZip(list) {
    var enc = new TextEncoder(), parts = [], central = [], off = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; }
    function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    list.forEach(function (f) {
      var name = enc.encode(f.name), data = enc.encode(f.text), crc = crc32(data);
      var common = [].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      var local = new Uint8Array([].concat(u32(0x04034b50), common));
      parts.push(local, name, data);
      central.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), common, u16(0), u16(0), u16(0), u32(0), u32(off))), name);
      off += local.length + name.length + data.length;
    });
    var csize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(list.length), u16(list.length), u32(csize), u32(off), u16(0)));
    return new Blob(parts.concat(central, [end]), { type: 'application/zip' });
  }
  function download(name, blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    global.__lastDownload = { name: name, blob: blob };
  }

  var CHECKS = [
    { id: 'https', t: 'HTTPS 可以打开（换手机流量也能访问）', g: 'h-day-3-上线', q: 'q-s1-02' },
    { id: 'tags', t: 'title 和唯一 h1 都含主词', g: 'h-替换清单-starter' },
    { id: 'stats', t: '统计已装（GA4 或 Clarity 看到自己的访问）', g: 'h-day-4-统计', q: 'q-s1-03' },
    { id: 'gsc', t: 'Google Search Console 已验证', g: 'h-day-5-gsc', q: 'q-s1-04' },
    { id: 'sitemap', t: 'sitemap 已提交（或请求编入索引）', g: 'h-day-6-交地图', q: 'q-s1-05' },
    { id: 'trust', t: '信任页：About / Privacy / 联系邮箱', g: 'h-替换清单-starter' },
  ];

  function tplPicker(cur) {
    return '<fieldset class="kit-tpls"><legend>起步模板</legend><div class="kit-tpl-grid">' + TEMPLATES.map(function (t) {
      var on = cur === t.id;
      return '<label class="kit-tpl' + (on ? ' on' : '') + '"><span class="kit-tpl-top"><input type="radio" name="kit-template" id="kit-tpl-' + t.id + '" value="' + t.id + '"' + (on ? ' checked' : '') + ' />' + I(t.icon) + '<span class="kit-tpl-name">' + esc(t.name) + '</span></span><span class="kit-tpl-desc">' + esc(t.desc) + '</span></label>';
    }).join('') + '</div></fieldset>';
  }
  function renderKit(state, root, ctx) {
    ensure(state);
    var kit = state.kit;
    var s2 = state.keywords.s2Target;
    var cur = templateId(kit);
    root.innerHTML = '<div class="tool-wrap">' +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('wrench') + '1 · 填你的站一信息</h2>' +
      '<details class="cx-details kit-hint"><summary>填写说明</summary><p class="hint">填一个英文主词就能生成整页；还没想好词？先去 <a href="#war-keywords">选词练习板</a> 记几个候选。</p></details>' +
      '<div class="form-grid">' +
      field('keyword', '主词 / 品牌名', 'pdf merge tool', kit.keyword) + field('domain', '域名', 'pdfmergetool.com', kit.domain) +
      field('intro', '一句话介绍（英文）', 'Merge PDF files online for free in seconds.', kit.intro, true) + field('email', '联系邮箱', 'hi@pdfmergetool.com', kit.email) +
      '</div>' + tplPicker(cur) + (s2 ? '<p class="hint">站二目标词（来自选词板）：<b>' + esc(s2) + '</b></p>' : '') + '</section>' +
      '<section class="block glass tool-card" data-tab="2 · 预览与规则"><h2 class="block-title">' + I('search') + '2 · 实时预览与规则</h2><div id="kit-preview" aria-live="polite"></div></section>' +
      '<section class="block glass tool-card" data-tab="3 · 下载 / 发布"><h2 class="block-title">' + I('download') + '3 · 下载我的站一页面</h2>' +
      '<p class="hint">当前模板：<b id="kit-tpl-name">' + esc(templateMeta(kit).name) + '</b>。生成 index.html（已填好 title / description / h1 / 联系邮箱 / canonical）+ robots.txt + sitemap.xml，解压后整个文件夹拖到 GitHub Pages 或 Cloudflare Pages 即可。</p>' +
      '<p class="kit-files" id="kit-dl-files"></p>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary btn-sm" id="kit-dl">' + I('download') + '下载我的站一页面（ZIP）</button>' + '<a class="btn btn-sm" id="kit-publish" href="#war-publish">' + navI('#war-publish', 'rocket') + '直接发布到 GitHub</a>' +
      '<button type="button" class="btn btn-sm" data-dl="index.html">只下 index.html</button><button type="button" class="btn btn-sm" data-dl="robots.txt">robots.txt</button><button type="button" class="btn btn-sm" data-dl="sitemap.xml">sitemap.xml</button></div></section>' +
      '<section class="block glass tool-card" data-tab="4 · 上线自查表"><h2 class="block-title">' + I('list') + '4 · 上线自查表 <small class="tool-count" id="kit-count"></small></h2>' +
      '<p class="hint">标 ⇄ 的项与学习路线任务等价，勾上会同步勾对应任务。</p><ul class="kit-checks">' +
      CHECKS.map(function (c) {
        return '<li><label><input type="checkbox" data-kc="' + c.id + '"' + (kit.checks[c.id] ? ' checked' : '') + ' /><span>' + c.t + (c.q ? ' <em title="与任务同步">⇄</em>' : '') + '</span></label><a href="#guide-station-one-playbook" data-anchor="' + c.g + '" class="kit-guide">看手册</a></li>';
      }).join('') +
      '<li id="kit-tpl-row"' + (cur === 'basic' ? ' hidden' : '') + '><label><input type="checkbox" id="kit-tpl-done"' + (kit.templateDone ? ' checked' : '') + ' /><span>模板占位内容已替换（tool/compare/glossary 里的 placeholder）</span></label></li>' +
      '</ul></section>' + PRIV + '</div>';
    function syncChrome() {
      var extra = templateId(kit) !== 'basic';
      var row = root.querySelector('#kit-tpl-row');
      if (row) row.hidden = !extra;
      var nameEl = root.querySelector('#kit-tpl-name');
      if (nameEl) nameEl.textContent = templateMeta(kit).name;
      var doneN = CHECKS.filter(function (c) { return kit.checks[c.id]; }).length + (extra && kit.templateDone ? 1 : 0);
      var cnt = root.querySelector('#kit-count');
      if (cnt) cnt.textContent = doneN + '/' + (CHECKS.length + (extra ? 1 : 0));
    }
    function closeKitPreview() {
      var M = global.QuestModal;
      if (!M) return;
      var roots = M.ensureRoots();
      var modal = roots.modal;
      modal.hidden = true;
      modal.innerHTML = '';
      modal.onclick = null;
      if (closeKitPreview._onKey) {
        document.removeEventListener('keydown', closeKitPreview._onKey);
        closeKitPreview._onKey = null;
      }
    }
    function openKitPreview() {
      var M = global.QuestModal;
      if (!M) return;
      if (closeKitPreview._onKey) {
        document.removeEventListener('keydown', closeKitPreview._onKey);
        closeKitPreview._onKey = null;
      }
      var g = gen(kit), meta = templateMeta(kit), list = files(kit);
      var kw = (kit.keyword || '').trim() || g.h1 || '未填主词';
      var roots = M.ensureRoots();
      var modal = roots.modal;
      modal.hidden = false;
      modal.innerHTML =
        '<div class="modal-backdrop" data-kit-close="1"></div>' +
        '<div class="modal-card rank-detail-card detail-modal-card kit-preview-card" role="dialog" aria-modal="true" aria-labelledby="kit-preview-title">' +
        '<button type="button" class="rank-detail-close" data-kit-close="1" aria-label="关闭">×</button>' +
        '<div class="rank-detail-head">' +
        '<div class="rank-title"><h2 id="kit-preview-title">生成页预览 · ' + esc(meta.name) + ' · ' + esc(kw) + '</h2>' +
        '<p class="hint">可滚动查看完整页面；关闭后可继续改主词/模板。</p></div></div>' +
        '<div class="kit-preview-frame-wrap">' +
        '<iframe id="kit-frame" class="kit-frame kit-frame--modal" sandbox="allow-scripts allow-forms" title="生成页面预览"></iframe>' +
        '</div>' +
        '<div class="modal-actions rank-detail-actions">' +
        '<button type="button" class="btn" data-kit-close="1">关闭</button></div></div>';
      modal.querySelector('#kit-frame').srcdoc = list[0].text;
      function onKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeKitPreview();
        }
      }
      closeKitPreview._onKey = onKey;
      document.addEventListener('keydown', onKey);
      modal.onclick = function (e) {
        if (e.target.closest('[data-kit-close]')) closeKitPreview();
      };
      var closeBtn = modal.querySelector('.rank-detail-close');
      if (closeBtn) setTimeout(function () { try { closeBtn.focus(); } catch (_) {} }, 30);
    }
    function preview() {
      var g = gen(kit), r = rules(g, kit), list = files(kit);
      var box = root.querySelector('#kit-preview');
      var meta = templateMeta(kit);
      var kw = (kit.keyword || '').trim() || '未填主词';
      box.innerHTML = '<dl class="kit-prev">' +
        '<dt>&lt;title&gt; <small>' + g.title.length + '/60</small></dt><dd id="kit-title">' + esc(g.title) + '</dd>' +
        '<dt>meta description <small>' + g.desc.length + ' · 建议 120–160</small></dt><dd id="kit-desc">' + esc(g.desc) + '</dd>' +
        '<dt>h1</dt><dd id="kit-h1">' + esc(g.h1) + '</dd><dt>slug / 网址</dt><dd>https://' + esc(g.domain) + '/ <small>（内页可用 /' + esc(g.slug) + '/）</small></dd></dl>' +
        '<div class="kit-preview-actions">' +
        '<p class="kit-frame-label">当前模板：<b>' + esc(meta.name) + '</b> · 主词：<b>' + esc(kw) + '</b></p>' +
        '<button type="button" class="btn btn-primary btn-sm" id="kit-open-preview">' + I('search') + '打开预览</button>' +
        '</div>' +
        '<ul class="kit-rules">' + r.map(function (x) { return '<li class="' + (x.ok ? 'ok' : 'warn') + '">' + (x.ok ? '✓ ' : '! ') + esc(x.t) + '</li>'; }).join('') + '</ul>' +
        '<p class="kit-files" id="kit-files">文件：' + list.map(function (f) { return '<code>' + esc(f.name) + '</code>'; }).join(' ') + '</p>';
      var openBtn = box.querySelector('#kit-open-preview');
      if (openBtn) openBtn.addEventListener('click', openKitPreview);
      var live = document.querySelector('#modal-root:not([hidden]) #kit-frame');
      if (live) {
        live.srcdoc = list[0].text;
        var tit = document.querySelector('#kit-preview-title');
        if (tit) tit.textContent = '生成页预览 · ' + meta.name + ' · ' + kw;
      }
      var dl = root.querySelector('#kit-dl-files');
      if (dl) dl.innerHTML = '文件：' + list.map(function (f) { return '<code>' + esc(f.name) + '</code>'; }).join(' ');
      syncChrome();
    }
    preview();
    root.querySelectorAll('[data-kit]').forEach(function (inp) {
      inp.addEventListener('input', function () { kit[inp.getAttribute('data-kit')] = inp.value; ctx.save(); preview(); });
    });
    root.querySelectorAll('input[name="kit-template"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        kit.template = r.value;
        ctx.save();
        root.querySelectorAll('.kit-tpl').forEach(function (lab) {
          var inp = lab.querySelector('input');
          lab.classList.toggle('on', !!(inp && inp.checked));
        });
        preview();
      });
    });
    var tplDone = root.querySelector('#kit-tpl-done');
    if (tplDone) tplDone.addEventListener('change', function () { kit.templateDone = tplDone.checked; ctx.save(); preview(); });
    root.querySelector('#kit-dl').addEventListener('click', function () { download('station-one-' + gen(kit).slug + '.zip', makeZip(files(kit))); global.QuestModal && QuestModal.showToast('已生成 ZIP，解压后部署即可'); });
    root.querySelectorAll('[data-dl]').forEach(function (b) {
      b.addEventListener('click', function () { var f = files(kit).filter(function (x) { return x.name === b.getAttribute('data-dl'); })[0]; download(f.name, new Blob([f.text], { type: 'text/plain' })); });
    });
    root.querySelectorAll('[data-kc]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var c = CHECKS.filter(function (x) { return x.id === cb.getAttribute('data-kc'); })[0];
        kit.checks[c.id] = cb.checked; ctx.save();
        if (cb.checked && c.q && (state.done || []).indexOf(c.q) < 0 && ctx.tickQuest) ctx.tickQuest(c.q, cb);
        else ctx.rerender();
      });
    });
    root.querySelectorAll('.kit-guide').forEach(function (a) {
      a.addEventListener('click', function () { var id = a.getAttribute('data-anchor'); setTimeout(function () { var el = document.getElementById(id); if (!el) return; if (global.QuestShell && QuestShell.scrollToEl) QuestShell.scrollToEl(el, 'auto'); else el.scrollIntoView({ block: 'start' }); }, 120); });
    });
  }
  function field(key, label, ph, val, wide) {
    return '<label class="fld' + (wide ? ' fld-wide' : '') + '"><span>' + label + '</span><input type="text" data-kit="' + key + '" id="kit-' + key + '" placeholder="例：' + esc(ph) + '" value="' + esc(val) + '" /></label>';
  }

  /* ---------- 选词练习板 ---------- */
  var SOURCES = ['Trends', 'Keyword Planner', '联想', '竞品', '其它'];
  var VOLS = [['', '未知'], ['0', '几乎没有'], ['lt100', '<100'], ['100-1k', '100–1k'], ['1k-10k', '1k–10k'], ['10k+', '10k+']];
  var INTENTS = [['tool', '工具'], ['info', '信息'], ['compare', '对比'], ['trans', '交易']];
  var VOL_PTS = { '': 0, '0': 0, lt100: 4, '100-1k': 10, '1k-10k': 14, '10k+': 8 };
  var INT_PTS = { tool: 12, compare: 8, info: 6, trans: 4 };
  function score(k) {
    var big = Math.max(0, Math.min(10, Number(k.big) || 0)), weak = Math.max(0, Math.min(10, Number(k.weak) || 0));
    var s = (10 - big) * 4 + Math.min(weak, 5) * 4 + (VOL_PTS[k.vol] || 0) + (INT_PTS[k.intent] || 0);
    return Math.min(100, s);
  }
  function label(s) { return s >= 65 ? ['good', '适合练手'] : s >= 40 ? ['mid', '可以试'] : ['bad', '先换长尾']; }
  var FORMULA = '分数 = (10 − 大站数)×4 + min(论坛/新站数, 5)×4 + 搜索量分（<100:4 · 100–1k:10 · 1k–10k:14 · 10k+:8 · 未知:0）+ 意图分（工具 12 · 对比 8 · 信息 6 · 交易 4），满分 100。≥65 适合练手，40–64 可以试，<40 先换长尾。这只是帮你练判断的经验公式，不保证排名或流量。';
  function optList(arr, v) { return arr.map(function (o) { var val = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(val) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''); }
  function nOpts(v) { var a = []; for (var i = 0; i <= 10; i++) a.push(String(i)); return optList(a, v == null ? '' : v); }
  function lookup(arr, v) { var f = arr.filter(function (o) { return o[0] === v; })[0]; return f ? f[1] : '—'; }
  /** 新候选词的默认字段（表单「加入练习板」与关键词灵感共用） */
  function newKeyword(data) {
    return Object.assign({ id: uid(), at: Date.now(), star: false, kw: '', src: 'Trends', vol: '', big: '', weak: '', intent: 'tool', note: '' }, data || {});
  }

  function renderKeywords(state, root, ctx, editId) {
    ensure(state);
    var K = state.keywords, items = K.items;
    var editing = editId ? items.filter(function (x) { return x.id === editId; })[0] : null;
    var e = editing || { kw: '', src: 'Trends', vol: '', big: '', weak: '', intent: 'tool', note: '' };
    var list = items.map(function (k) { return { k: k, s: score(k) }; });
    if (K.filter === 'star') list = list.filter(function (x) { return x.k.star; });
    else if (K.filter !== 'all') list = list.filter(function (x) { return label(x.s)[0] === K.filter; });
    list.sort(function (a, b) {
      if (K.sort === 'new') return (b.k.at || 0) - (a.k.at || 0);
      if (K.sort === 'kw') return a.k.kw.localeCompare(b.k.kw);
      return (b.k.star ? 1 : 0) - (a.k.star ? 1 : 0) || b.s - a.s;
    });
    root.innerHTML = '<div class="tool-wrap">' +
      '<div class="kw-board" data-tab="选词练习板">' +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('search') + (editing ? '编辑候选词' : '记一个候选词') + '</h2>' +
      '<form id="kw-form" class="form-grid" autocomplete="off">' +
      '<label class="fld fld-wide"><span>关键词</span><input id="kw-kw" required placeholder="例：pdf merge for mac" value="' + esc(e.kw) + '" /></label>' +
      '<label class="fld"><span>来源</span><select id="kw-src">' + optList(SOURCES, e.src) + '</select></label>' +
      '<label class="fld"><span>搜索量区间（自己估）</span><select id="kw-vol">' + optList(VOLS, e.vol) + '</select></label>' +
      '<label class="fld"><span>前10 大站数（0–10）</span><select id="kw-big"><option value="">—</option>' + nOpts(e.big) + '</select></label>' +
      '<label class="fld"><span>前10 论坛/新站数</span><select id="kw-weak"><option value="">—</option>' + nOpts(e.weak) + '</select></label>' +
      '<label class="fld"><span>意图类型</span><select id="kw-intent">' + optList(INTENTS, e.intent) + '</select></label>' +
      '<label class="fld fld-wide"><span>备注</span><input id="kw-note" placeholder="例：前三都是 Reddit 帖子，有空位" value="' + esc(e.note) + '" /></label>' +
      '<div class="tool-actions fld-wide"><button type="submit" class="btn btn-primary btn-sm" id="kw-save">' + (editing ? '保存修改' : '加入练习板') + '</button>' + (editing ? '<button type="button" class="btn btn-sm" id="kw-cancel">取消</button>' : '') + '</div></form>' +
      '<details class="kw-formula"><summary>评分怎么算？</summary><p>' + FORMULA + '</p></details></section>' +
      '<section class="block glass tool-card"><div class="kw-bar"><h2 class="block-title">' + I('list') + '候选词 <small class="tool-count" id="kw-count">' + items.length + '</small></h2>' +
      '<div class="kw-ctrl"><label>排序 <select id="kw-sort">' + optList([['score', '评分'], ['new', '最新'], ['kw', '字母']], K.sort) + '</select></label>' +
      '<label>筛选 <select id="kw-filter">' + optList([['all', '全部'], ['star', '星标'], ['good', '适合练手'], ['mid', '可以试'], ['bad', '先换长尾']], K.filter) + '</select></label>' +
      '<button type="button" class="btn btn-sm" id="kw-csv"' + (items.length ? '' : ' disabled') + '>' + I('download') + '导出 CSV</button></div></div>' +
      (K.s2Target ? '<p class="hint">站二目标词：<b>' + esc(K.s2Target) + '</b> · 站一主词：<b>' + esc(state.kit.keyword || '未设') + '</b></p>' : '') +
      (items.length ? (list.length ? '<ul class="kw-list">' + list.map(function (x) { return kwRow(x.k, x.s, state); }).join('') + '</ul>' : '<p class="empty-hint">当前筛选下没有词，换个筛选看看。</p>')
        : '<div class="tool-empty">' + global.QuestIcons.illo('search') + '<p>还没有候选词。下一步：在上面输入一个英文词，例如 pdf merge for mac，看搜索结果前 10 有几个大站。也可以打开「关键词灵感」勾选免费联想词。</p><button type="button" class="btn btn-primary btn-sm" id="kw-focus">去记一个候选词</button><button type="button" class="btn btn-sm" id="kw-goto-ideas">打开关键词灵感</button></div>') +
      '</section>' + PRIV + '</div></div>';

    var f = root.querySelector('#kw-form');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var kw = root.querySelector('#kw-kw').value.trim(); if (!kw) return;
      var data = { kw: kw, src: root.querySelector('#kw-src').value, vol: root.querySelector('#kw-vol').value, big: root.querySelector('#kw-big').value, weak: root.querySelector('#kw-weak').value, intent: root.querySelector('#kw-intent').value, note: root.querySelector('#kw-note').value.trim() };
      if (editing) Object.assign(editing, data); else items.push(newKeyword(data));
      ctx.save(); renderKeywords(state, root, ctx);
    });
    var c = root.querySelector('#kw-cancel'); if (c) c.addEventListener('click', function () { renderKeywords(state, root, ctx); });
    root.querySelector('#kw-sort').addEventListener('change', function (ev) { K.sort = ev.target.value; ctx.save(); renderKeywords(state, root, ctx); });
    root.querySelector('#kw-filter').addEventListener('change', function (ev) { K.filter = ev.target.value; ctx.save(); renderKeywords(state, root, ctx); });
    root.querySelector('#kw-csv').addEventListener('click', function () {
      csvDownload('keywords.csv', [['keyword', 'source', 'volume', 'big_sites', 'forum_new', 'intent', 'score', 'label', 'star', 'note']].concat(items.map(function (k) { var s = score(k); return [k.kw, k.src, lookup(VOLS, k.vol), k.big, k.weak, lookup(INTENTS, k.intent), s, label(s)[1], k.star ? 'Y' : '', k.note]; })));
    });
    root.querySelectorAll('[data-kw-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id'), act = b.getAttribute('data-kw-act'), k = items.filter(function (x) { return x.id === id; })[0]; if (!k) return;
        if (act === 'edit') { renderKeywords(state, root, ctx, id); root.querySelector('#kw-kw').focus(); return; }
        if (act === 'del') { if (!global.confirm || global.confirm('删除「' + k.kw + '」？')) { items.splice(items.indexOf(k), 1); } }
        if (act === 'star') k.star = !k.star;
        if (act === 's1') { state.kit.keyword = k.kw; global.QuestModal && QuestModal.showToast('已设为站一主词，去实操助手生成页面'); }
        if (act === 's2') { K.s2Target = k.kw; global.QuestModal && QuestModal.showToast('已设为站二目标词'); }
        ctx.save(); renderKeywords(state, root, ctx);
      });
    });
    if (global.QuestIdeas) global.QuestIdeas.mount(state, root, ctx);
    var kwFocus = root.querySelector('#kw-focus');
    if (kwFocus) kwFocus.addEventListener('click', function () { var el = root.querySelector('#kw-kw'); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } });
    var kwIdeas = root.querySelector('#kw-goto-ideas');
    if (kwIdeas) kwIdeas.addEventListener('click', function () {
      var panel = root.querySelector('#idea-panel');
      if (panel && panel.__cxShow) panel.__cxShow();
      var seed = root.querySelector('#idea-seed');
      if (seed) { seed.scrollIntoView({ block: 'center' }); seed.focus(); }
    });
  }
  function kwRow(k, s, state) {
    var L = label(s), q = encodeURIComponent(k.kw);
    var tags = [k.src, '量 ' + lookup(VOLS, k.vol), '大站 ' + (k.big === '' ? '—' : k.big), '弱站 ' + (k.weak === '' ? '—' : k.weak), lookup(INTENTS, k.intent)];
    var isS1 = state.kit.keyword === k.kw, isS2 = state.keywords.s2Target === k.kw;
    return '<li class="kw-item" data-kw="' + esc(k.kw) + '"><div class="kw-main"><button type="button" class="kw-star' + (k.star ? ' on' : '') + '" data-kw-act="star" data-id="' + k.id + '" aria-label="星标" aria-pressed="' + !!k.star + '">' + I('star') + '</button>' +
      '<div><b class="kw-name">' + esc(k.kw) + '</b>' + (isS1 ? ' <span class="pill">站一主词</span>' : '') + (isS2 ? ' <span class="pill">站二目标</span>' : '') +
      '<div class="kw-tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' + (k.note ? '<p class="kw-note">' + esc(k.note) + '</p>' : '') + '</div>' +
      '<div class="kw-score kw-' + L[0] + '"><b>' + s + '</b><span class="kw-label">' + L[1] + '</span></div></div>' +
      '<div class="kw-acts"><a href="https://www.google.com/search?q=' + q + '" target="_blank" rel="noopener noreferrer">Google ↗</a><a href="https://trends.google.com/trends/explore?q=' + q + '" target="_blank" rel="noopener noreferrer">Trends ↗</a><a href="https://ads.google.com/home/tools/keyword-planner/" target="_blank" rel="noopener noreferrer">Keyword Planner ↗</a>' +
      '<button type="button" class="btn btn-sm" data-kw-act="s1" data-id="' + k.id + '">设为站一主词</button><button type="button" class="btn btn-sm" data-kw-act="s2" data-id="' + k.id + '">设为站二目标词</button>' +
      '<button type="button" class="btn btn-sm" data-kw-act="edit" data-id="' + k.id + '">编辑</button><button type="button" class="btn btn-sm btn-danger" data-kw-act="del" data-id="' + k.id + '">删除</button></div></li>';
  }
  function csvDownload(name, rows) {
    var t = rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
    download(name, new Blob(['\ufeff' + t], { type: 'text/csv;charset=utf-8' }));
  }

  /* ---------- 我的站点台账 ---------- */
  var STATIONS = ['站一', '站二', '站三', '其他'];
  var STATUS = ['筹备', '已上线', '已收录', '有点击', '有收入', '暂停'];
  function cny(l) { return (Number(l.usd) || 0) + (Number(l.cny) || 0) / 7.1; }
  function latestMonth(items) { var m = ''; items.forEach(function (s) { (s.logs || []).forEach(function (l) { if (l.month > m) m = l.month; }); }); return m; }
  function monthTotals(items, m) {
    var t = { imp: 0, clicks: 0, usd: 0, cny: 0 };
    items.forEach(function (s) { (s.logs || []).forEach(function (l) { if (l.month === m) { t.imp += +l.imp || 0; t.clicks += +l.clicks || 0; t.usd += +l.usd || 0; t.cny += +l.cny || 0; } }); });
    return t;
  }
  function summary(state) { ensure(state); var it = state.sites.items, m = latestMonth(it); return { count: it.length, month: m, t: m ? monthTotals(it, m) : null }; }

  function chart(logs) {
    var L = logs.slice().sort(function (a, b) { return a.month < b.month ? -1 : 1; });
    if (L.length < 1) return '';
    var W = 560, H = 170, P = 30, n = L.length;
    var mc = Math.max.apply(null, L.map(function (l) { return +l.clicks || 0; }).concat([1])), mi = Math.max.apply(null, L.map(cny).concat([1]));
    function x(i) { return n === 1 ? W / 2 : P + i * (W - 2 * P) / (n - 1); }
    function line(vals, max, cls) {
      var pts = vals.map(function (v, i) { return x(i).toFixed(1) + ',' + (H - P - v / max * (H - 2 * P)).toFixed(1); });
      return '<polyline class="' + cls + '" points="' + pts.join(' ') + '"/>' + pts.map(function (p) { var a = p.split(','); return '<circle class="' + cls + '" cx="' + a[0] + '" cy="' + a[1] + '" r="3.5"/>'; }).join('');
    }
    return '<figure class="site-chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="每月点击与收入折线"><line class="ax" x1="' + P + '" y1="' + (H - P) + '" x2="' + (W - P) + '" y2="' + (H - P) + '"/>' +
      line(L.map(function (l) { return +l.clicks || 0; }), mc, 'c-click') + line(L.map(cny), mi, 'c-inc') +
      L.map(function (l, i) { return '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(l.month.slice(2)) + '</text>'; }).join('') +
      '</svg><figcaption><span class="lg lg-click"></span>点击（峰值 ' + mc + '）<span class="lg lg-inc"></span>收入（折合 USD，峰值 ' + mi.toFixed(2) + '，CNY 按 7.1 换算）</figcaption></figure>';
  }

  function renderSites(state, root, ctx, opts) {
    ensure(state); opts = opts || {};
    var items = state.sites.items, S = summary(state);
    var editing = opts.edit ? items.filter(function (x) { return x.id === opts.edit; })[0] : null;
    var e = editing || { name: '', domain: '', kw: state.kit.keyword || '', station: '站一', launch: '', status: '筹备', host: '', money: '' };
    var totalClicks = 0, totalUsd = 0; items.forEach(function (s) { (s.logs || []).forEach(function (l) { totalClicks += +l.clicks || 0; totalUsd += cny(l); }); });
    root.innerHTML = '<div class="tool-wrap">' +
      '<div class="stat-grid site-sum"><div class="stat"><span class="card-ico">' + navI('#me-sites', 'ledger') + '</span><b id="sites-count">' + items.length + '</b><small>站点数</small></div>' +
      '<div class="stat"><span class="card-ico">' + I('flag') + '</span><b>' + items.filter(function (s) { return s.status !== '筹备' && s.status !== '暂停'; }).length + '</b><small>已上线及以上</small></div>' +
      '<div class="stat"><span class="card-ico">' + I('chart') + '</span><b>' + (S.t ? S.t.clicks : 0) + '</b><small>' + (S.month || '最近月') + ' 点击</small></div>' +
      '<div class="stat"><span class="card-ico">' + I('coin') + '</span><b>$' + totalUsd.toFixed(2) + '</b><small>累计收入（折合 USD）· 累计点击 ' + totalClicks + '</small></div></div>' +
      '<section class="block glass tool-card"><h2 class="block-title">' + navI('#me-sites', 'ledger') + (editing ? '编辑站点' : '登记一个站点') + '</h2><form id="site-form" class="form-grid" autocomplete="off">' +
      sf('name', '名称', '我的 PDF 小站', e.name, 'required') + sf('domain', '域名', 'pdfmergetool.com', e.domain) + sf('kw', '主词', 'pdf merge tool', e.kw) +
      '<label class="fld"><span>对应站</span><select id="site-station">' + optList(STATIONS, e.station) + '</select></label>' +
      '<label class="fld"><span>上线日</span><input type="date" id="site-launch" value="' + esc(e.launch) + '" /></label>' +
      '<label class="fld"><span>状态</span><select id="site-status">' + optList(STATUS, e.status) + '</select></label>' +
      sf('host', '托管', 'GitHub Pages', e.host) + sf('money', '变现方式', 'AdSense / 联盟 / 暂无', e.money) +
      '<div class="tool-actions fld-wide"><button type="submit" class="btn btn-primary btn-sm">' + (editing ? '保存修改' : '加入台账') + '</button>' + (editing ? '<button type="button" class="btn btn-sm" id="site-cancel">取消</button>' : '') +
      '<button type="button" class="btn btn-sm" id="site-csv"' + (items.length ? '' : ' disabled') + '>' + I('download') + '导出 CSV</button></div></form></section>' +
      (items.length ? items.map(function (s) { return siteCard(s, opts.log === s.id); }).join('') :
        '<div class="tool-empty glass">' + global.QuestIcons.illo('star') + '<p>还没有站点。下一步：在上面填写名称、域名和主词，再点「加入台账」。上线后每月记一次曝光和点击。</p><button type="button" class="btn btn-primary btn-sm" id="sites-empty-go">去填写站点名称</button></div>') +
      '<p class="hint">可以手动记，也可以在 <a href="#me-analytics">数据分析</a> 导入 GSC / AdSense CSV 自动按月写入。</p>' + PRIV + '</div>';

    var sitesGo = root.querySelector('#sites-empty-go');
    if (sitesGo) sitesGo.addEventListener('click', function () { var el = root.querySelector('#site-name'); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } });
    root.querySelector('#site-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var g = function (k) { return root.querySelector('#site-' + k).value.trim(); };
      var data = { name: g('name'), domain: cleanDomain(g('domain')), kw: g('kw'), station: g('station'), launch: g('launch'), status: g('status'), host: g('host'), money: g('money') };
      if (!data.name) return;
      if (editing) Object.assign(editing, data); else items.push(Object.assign({ id: uid(), logs: [] }, data));
      ctx.save(); renderSites(state, root, ctx);
    });
    var c = root.querySelector('#site-cancel'); if (c) c.addEventListener('click', function () { renderSites(state, root, ctx); });
    root.querySelector('#site-csv').addEventListener('click', function () {
      var rows = [['site', 'domain', 'keyword', 'station', 'launch', 'status', 'hosting', 'monetize', 'month', 'impressions', 'clicks', 'usd', 'cny', 'note']];
      items.forEach(function (s) {
        var base = [s.name, s.domain, s.kw, s.station, s.launch, s.status, s.host, s.money];
        if (!(s.logs || []).length) rows.push(base.concat(['', '', '', '', '', '']));
        (s.logs || []).forEach(function (l) { rows.push(base.concat([l.month, l.imp, l.clicks, l.usd, l.cny, l.note])); });
      });
      csvDownload('my-sites.csv', rows);
    });
    root.querySelectorAll('[data-site-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = items.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (!s) return;
        var act = b.getAttribute('data-site-act');
        if (act === 'edit') { renderSites(state, root, ctx, { edit: s.id }); root.querySelector('#site-name').focus(); return; }
        if (act === 'del') { if (global.confirm && !global.confirm('删除站点「' + s.name + '」及其月度记录？')) return; items.splice(items.indexOf(s), 1); }
        if (act === 'dellog') { s.logs.splice(+b.getAttribute('data-i'), 1); }
        ctx.save(); renderSites(state, root, ctx);
      });
    });
    root.querySelectorAll('form[data-log]').forEach(function (fm) {
      fm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var s = items.filter(function (x) { return x.id === fm.getAttribute('data-log'); })[0];
        var v = function (n) { return fm.querySelector('[name=' + n + ']').value.trim(); };
        if (!v('month')) return;
        var row = { month: v('month'), imp: +v('imp') || 0, clicks: +v('clicks') || 0, usd: +v('usd') || 0, cny: +v('cny') || 0, note: v('note') };
        s.logs = (s.logs || []).filter(function (l) { return l.month !== row.month; }).concat([row]).sort(function (a, b) { return a.month < b.month ? -1 : 1; });
        ctx.save(); renderSites(state, root, ctx);
      });
    });
  }
  function sf(k, label, ph, v, req) { return '<label class="fld"><span>' + label + '</span><input id="site-' + k + '" placeholder="例：' + esc(ph) + '" value="' + esc(v) + '" ' + (req || '') + ' /></label>'; }
  function siteCard(s, open) {
    var logs = s.logs || [], ym = new Date().toISOString().slice(0, 7);
    return '<section class="block glass tool-card site-card" data-site="' + s.id + '"><div class="site-head"><div><h3>' + esc(s.name) + ' <span class="pill">' + esc(s.station) + '</span> <span class="pill pill-st">' + esc(s.status) + '</span></h3>' +
      '<p class="hint">' + [s.domain && esc(s.domain), s.kw && '主词 ' + esc(s.kw), s.launch && '上线 ' + esc(s.launch), s.host && esc(s.host), s.money && '变现 ' + esc(s.money)].filter(Boolean).join(' · ') + '</p></div>' +
      '<div class="tool-actions">' + (s.domain ? '<a class="btn btn-sm" href="https://' + esc(s.domain) + '" target="_blank" rel="noopener noreferrer">打开 ↗</a>' : '') + '<button type="button" class="btn btn-sm" data-site-act="edit" data-id="' + s.id + '">编辑</button><button type="button" class="btn btn-sm btn-danger" data-site-act="del" data-id="' + s.id + '">删除</button></div></div>' +
      (logs.length ? chart(logs) + '<div class="tbl-wrap"><table class="site-logs"><thead><tr><th>月份</th><th>曝光</th><th>点击</th><th>收入 USD</th><th>收入 CNY</th><th>备注</th><th></th></tr></thead><tbody>' +
        logs.map(function (l, i) { return '<tr><td>' + esc(l.month) + '</td><td>' + l.imp + '</td><td>' + l.clicks + '</td><td>' + l.usd + '</td><td>' + l.cny + '</td><td>' + esc(l.note) + '</td><td><button type="button" class="btn btn-sm btn-ghost" data-site-act="dellog" data-id="' + s.id + '" data-i="' + i + '" aria-label="删除这条">×</button></td></tr>'; }).join('') + '</tbody></table></div>'
        : '<p class="empty-hint">还没有月度记录。每月 1 号从 GSC「效果」抄一次上月曝光和点击就够。</p>') +
      '<form class="log-form" data-log="' + s.id + '"><label class="fld"><span>月份</span><input type="month" name="month" value="' + ym + '" required /></label>' +
      '<label class="fld"><span>曝光</span><input type="number" min="0" name="imp" inputmode="numeric" /></label><label class="fld"><span>点击</span><input type="number" min="0" name="clicks" inputmode="numeric" /></label>' +
      '<label class="fld"><span>收入 USD</span><input type="number" min="0" step="0.01" name="usd" /></label><label class="fld"><span>收入 CNY</span><input type="number" min="0" step="0.01" name="cny" /></label>' +
      '<label class="fld"><span>备注</span><input name="note" placeholder="例：收录 3 页" /></label><button type="submit" class="btn btn-sm btn-primary">记一笔</button></form></section>';
  }

  global.QuestTools = { ensure: ensure, renderKit: renderKit, renderKeywords: renderKeywords, renderSites: renderSites, score: score, label: label, gen: gen, files: files, makeZip: makeZip, summary: summary, FORMULA: FORMULA, TEMPLATES: TEMPLATES, newKeyword: newKeyword };
})(typeof window !== 'undefined' ? window : globalThis);
