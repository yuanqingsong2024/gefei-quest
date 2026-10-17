/** Phase 17 · 内容分发 #war-share：选来源 → 生成各平台版本（AI 或模板）→ 编辑/计数/复制 → 用官方免费分享链接打开发帖页。
 *  不调用任何付费 API；每次复制/打开记入存档追加字段 shares。 */
(function (global) {
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var E = encodeURIComponent;
  /** 字数：X 规则里链接按 23 计，中日韩字符按 2 计 */
  function xLen(t) { var s = String(t || '').replace(/https?:\/\/\S+/g, '12345678901234567890123'); var n = 0; for (var ch of s) n += /[\u1100-\uFFFF]/.test(ch) && !/[\u2000-\u206F]/.test(ch) ? 2 : 1; return n; }
  function len(t) { return Array.from(String(t || '')).length; }
  /* prefill: 'full' 文本+链接预填 · 'url' 只能预填链接（文字先复制）· 'none' 复制后打开发布页 */
  var P = [
    { id: 'x', name: 'X', icon: 'sparkle', limit: 280, lim: 'X 规则：280（中文按 2、链接按 23 计）', thread: true, prefill: 'full', open: function (d) { return 'https://x.com/intent/post?text=' + E(d.text); }, doc: 'X Web Intent（x.com/intent/post，参数 text/url/hashtags）' },
    { id: 'weibo', name: '微博', icon: 'users', prefill: 'full', open: function (d) { return 'https://service.weibo.com/share/share.php?' + (d.url ? 'url=' + E(d.url) + '&' : '') + 'title=' + E(d.textNoUrl); }, doc: '微博分享组件 share.php（url/title）' },
    { id: 'xhs', name: '小红书', icon: 'star', limit: 1000, titleLimit: 20, lim: '常见上限：标题 20 字、正文 1000 字（以 App 为准）', fields: true, prefill: 'none', open: function () { return 'https://creator.xiaohongshu.com/publish/publish'; }, doc: '无分享预填 → 复制后打开创作服务平台' },
    { id: 'zhihu', name: '知乎', icon: 'book', prefill: 'none', open: function () { return 'https://zhuanlan.zhihu.com/write'; }, doc: '无预填 → 复制后打开写文章页' },
    { id: 'wechat', name: '公众号', icon: 'file', prefill: 'none', open: function () { return 'https://mp.weixin.qq.com/'; }, doc: '无预填 → 复制后打开公众平台（新建图文）' },
    { id: 'toutiao', name: '头条号', icon: 'file', prefill: 'none', open: function () { return 'https://mp.toutiao.com/profile_v4/graphic/publish'; }, doc: '无预填 → 复制后打开发布页' },
    { id: 'douyin', name: '抖音（文案）', icon: 'fire', limit: 1000, prefill: 'none', open: function () { return 'https://creator.douyin.com/creator-micro/content/upload'; }, doc: '无预填 → 复制文案后打开创作者中心上传页' },
    { id: 'reddit', name: 'Reddit', icon: 'globe', titleLimit: 300, lim: '标题上限 300 字符', fields: true, prefill: 'url', open: function (d) { return 'https://www.reddit.com/submit?' + (d.url ? 'url=' + E(d.url) + '&' : '') + 'title=' + E(d.title); }, doc: 'reddit.com/submit（url/title；正文需粘贴）' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'users', limit: 3000, lim: '帖子上限约 3000 字符', prefill: 'url', open: function (d) { return d.url ? 'https://www.linkedin.com/sharing/share-offsite/?url=' + E(d.url) : 'https://www.linkedin.com/feed/'; }, doc: '官方 share-offsite 只接受 url（文字需粘贴）' },
    { id: 'facebook', name: 'Facebook', icon: 'users', prefill: 'url', open: function (d) { return d.url ? 'https://www.facebook.com/sharer/sharer.php?u=' + E(d.url) : 'https://www.facebook.com/'; }, doc: 'sharer.php 只接受 u（文字需粘贴）' },
    { id: 'pinterest', name: 'Pinterest', icon: 'tag', limit: 500, lim: '描述上限 500 字符（官方按钮文档）', prefill: 'full', open: function (d) { return 'https://www.pinterest.com/pin/create/button/?' + (d.url ? 'url=' + E(d.url) + '&' : '') + 'description=' + E(d.textNoUrl); }, doc: 'Pin It 按钮 pin/create/button（url/media/description）' },
    { id: 'medium', name: 'Medium', icon: 'book', prefill: 'none', open: function () { return 'https://medium.com/new-story'; }, doc: '官方已停发 API token → 复制后打开新文章页' },
    { id: 'telegram', name: 'Telegram', icon: 'rocket', prefill: 'full', open: function (d) { return 'https://t.me/share/url?url=' + E(d.url || '') + '&text=' + E(d.textNoUrl); }, doc: 'Telegram 分享链接 t.me/share/url（url/text）' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'users', prefill: 'full', open: function (d) { return 'https://wa.me/?text=' + E(d.text); }, doc: 'WhatsApp 链接 wa.me/?text=' },
  ];
  var PRE = { full: '预填文字', url: '预填链接，文字自动复制', none: '自动复制后打开发布页' };
  var DEFAULT_ON = ['x', 'weibo', 'xhs', 'zhihu', 'reddit', 'linkedin', 'pinterest'];

  function ensure(state) { if (!Array.isArray(state.shares)) state.shares = []; if (!state.shareDraft || typeof state.shareDraft !== 'object') state.shareDraft = { src: 'kit', text: '', url: '', title: '', rank: 1, on: DEFAULT_ON.slice(), out: {} }; return state; }

  function publishedUrl(state) { var p = (state.publish || []).filter(function (x) { return x.ok && !x.dry && x.url; }); return p.length ? p[p.length - 1].url : ''; }
  /** 来源 → {title, summary, url, tags, lang} */
  function source(state) {
    var d = state.shareDraft, T = global.QuestTools;
    if (d.src === 'kit') {
      var kit = state.kit || {}; if (!kit.keyword) return null;
      var g = T.gen(kit), url = publishedUrl(state) || (kit.domain ? 'https://' + g.domain + '/' : '');
      var meta = (T.TEMPLATES || []).filter(function (t) { return t.id === (kit.template || 'basic'); })[0];
      return { kind: 'kit', title: g.title, summary: g.desc, url: url, tags: [g.kw.replace(/\s+/g, '')], kw: g.kw, templateName: meta ? meta.name : '' };
    }
    if (d.src === 'rank') {
      var it = (global.QuestRank ? global.QuestRank.latestItems() : []).filter(function (x) { return x.rank === +d.rank; })[0]; if (!it) return null;
      return { kind: 'rank', title: it.name, summary: (it.summary || it.why || '').split('上榜理由')[0].trim(), url: it.source_url || '', tags: (it.tags || []).slice(0, 3), steps: it.steps || [], risk: it.risk || '' };
    }
    if (d.src === 'url') { if (!/^https?:\/\//.test(d.url || '')) return null; return { kind: 'url', title: d.title || d.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), summary: d.text || '', url: d.url, tags: [] }; }
    if (!String(d.text || '').trim()) return null;
    var lines = d.text.trim().split('\n');
    return { kind: 'text', title: d.title || lines[0].slice(0, 40), summary: d.text.trim(), url: /^https?:\/\//.test(d.url || '') ? d.url : '', tags: [] };
  }

  /* ---------- 模板（Grok Bot 模式或 AI 未返回某平台时使用） ---------- */
  function cut(t, n) { var a = Array.from(t); return a.length <= n ? t : a.slice(0, n - 1).join('') + '…'; }
  function hashtags(tags, sep) { return tags.filter(Boolean).map(function (t) { return '#' + String(t).replace(/[#\s]/g, '') + (sep || ''); }).join(sep ? '' : ' '); }
  function splitThread(text, max) {
    var parts = [], cur = '';
    String(text).split(/(?<=[。！？.!?\n])/).forEach(function (seg) {
      if (xLen(cur + seg) > max - 6 && cur) { parts.push(cur.trim()); cur = ''; }
      while (xLen(seg) > max - 6) { var a = Array.from(seg), k = a.length; while (k > 1 && xLen(a.slice(0, k).join('')) > max - 6) k--; parts.push(a.slice(0, k).join('').trim()); seg = a.slice(k).join(''); }
      cur += seg;
    });
    if (cur.trim()) parts.push(cur.trim());
    return parts.length > 1 ? parts.map(function (p, i) { return p + ' ' + (i + 1) + '/' + parts.length; }) : parts;
  }
  function template(id, s) {
    var u = s.url ? '\n' + s.url : '', sum = s.summary || s.title, tg = s.tags || [];
    var steps = (s.steps || []).length ? '\n' + s.steps.slice(0, 3).map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n') : '';
    switch (id) {
      case 'x': var full = s.title + '\n\n' + sum + (s.url ? '\n' + s.url : '') + (tg.length ? '\n' + hashtags(tg) : ''); return { parts: xLen(full) <= 280 ? [full] : splitThread(s.title + '。' + sum + (s.url ? ' ' + s.url : ''), 280) };
      case 'weibo': return { text: '【' + s.title + '】' + sum + steps + u + (tg.length ? ' ' + hashtags(tg, '#') : '') };
      case 'xhs': return { title: cut(s.title, 20), body: '姐妹们/朋友们，今天分享一个我实际在用的：' + s.title + '\n\n' + sum + steps + '\n\n💡 小提醒：' + (s.risk ? cut(s.risk, 60) : '规则以官方为准，量力而行。') + (s.url ? '\n（链接见评论区/主页）' : ''), tags: tg.concat(['干货分享', '实用工具']).slice(0, 5) };
      case 'zhihu': return { text: '# ' + s.title + '\n\n先说结论：' + sum + '\n\n## 怎么做' + (steps || '\n1. 先打开官方入口\n2. 按页面提示操作\n3. 记录结果、复盘') + '\n\n## 需要注意\n' + (s.risk || '规则以官方页面为准，不保证收益。') + (s.url ? '\n\n参考：' + s.url : '') };
      case 'wechat': return { text: '标题：' + s.title + '\n摘要：' + cut(sum, 54) + '\n\n正文：\n' + sum + steps + '\n\n' + (s.risk ? '⚠️ ' + s.risk + '\n' : '') + (s.url ? '阅读原文：' + s.url : '') };
      case 'toutiao': return { text: s.title + '\n\n' + sum + steps + (s.url ? '\n\n来源：' + s.url : '') };
      case 'douyin': return { text: s.title + '｜' + cut(sum, 120) + ' ' + hashtags(tg) };
      case 'reddit': return { title: cut(s.title, 300), body: sum + (steps ? '\n' + steps : '') + '\n\nHappy to answer questions.' };
      case 'linkedin': return { text: s.title + '\n\n' + sum + steps + '\n\n' + (s.url ? '🔗 ' + s.url + '\n' : '') + hashtags(tg) };
      case 'facebook': return { text: s.title + '\n\n' + sum + u };
      case 'pinterest': return { text: cut(s.title + ' — ' + sum + ' ' + hashtags(tg), 500) };
      case 'medium': return { title: s.title, body: sum + (steps ? '\n' + steps : '') + (s.url ? '\n\nOriginally published at ' + s.url : '') };
      case 'telegram': case 'whatsapp': return { text: s.title + '\n' + cut(sum, 200) + u };
    }
    return { text: s.title + '\n' + sum + u };
  }
  /* ---------- AI ---------- */
  function aiPrompt(s, ids) {
    return '请把下面的内容改写成多个平台的发帖版本。只写真实、合法的内容，不夸大、不承诺收益，不要编造数据。\n' +
      '内容标题：' + s.title + '\n内容摘要：' + s.summary + '\n链接：' + (s.url || '（无）') + '\n标签：' + (s.tags || []).join(', ') + '\n\n' +
      '输出格式严格如下，每个平台以单独一行「=== 平台ID ===」开头，平台ID 只能是：' + ids.join(', ') + '。\n' +
      '- x：英文或中文均可，单条 ≤280（中文按 2 计）；如需串推，每条之间单独一行 ---\n- xhs：第一行「标题：」（≤20 字），然后「正文：」，最后一行「标签：」用逗号分隔\n- reddit / medium：第一行「标题：」，其余为正文\n- 其他平台：直接写正文\n' +
      '面向国内平台用中文；reddit、linkedin、medium、pinterest、facebook 用英文。';
  }
  function parseAI(txt) {
    var out = {}, re = /^===\s*([a-z]+)\s*===\s*$/gim, m, marks = [];
    while ((m = re.exec(txt))) marks.push({ id: m[1].toLowerCase(), at: m.index, end: re.lastIndex });
    marks.forEach(function (k, i) {
      var body = txt.slice(k.end, i + 1 < marks.length ? marks[i + 1].at : txt.length).trim(); if (!body) return;
      var tl = body.match(/^标题[:：]\s*(.*)$/m), bd = body.match(/正文[:：]\s*([\s\S]*?)(?=^标签[:：]|$(?![\s\S]))/m), tg = body.match(/^标签[:：]\s*(.*)$/m);
      if (k.id === 'x') out.x = { parts: body.split(/^\s*---\s*$/m).map(function (x) { return x.trim(); }).filter(Boolean) };
      else if (k.id === 'xhs') out.xhs = { title: tl ? tl[1].trim() : '', body: bd ? bd[1].trim() : body.replace(/^标题[:：].*$/m, '').replace(/^标签[:：].*$/m, '').trim(), tags: tg ? tg[1].split(/[,，、\s#]+/).filter(Boolean) : [] };
      else if (k.id === 'reddit' || k.id === 'medium') out[k.id] = { title: tl ? tl[1].trim() : body.split('\n')[0], body: body.replace(/^标题[:：].*\n?/m, '').trim() };
      else out[k.id] = { text: body };
    });
    return out;
  }

  /* ---------- 文本组装 ---------- */
  function fullText(id, o) {
    if (!o) return '';
    if (id === 'x') return (o.parts || []).join('\n\n');
    if (id === 'xhs') return o.title + '\n\n' + o.body + '\n\n' + (o.tags || []).map(function (t) { return '#' + t; }).join(' ');
    if (o.title != null && o.body != null) return o.title + '\n\n' + o.body;
    return o.text || '';
  }
  function copy(t) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { return true; }, fallback); } catch (_) {}
    return Promise.resolve(fallback());
    function fallback() { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok; }
  }
  function counter(id, field, val) {
    var p = P.filter(function (x) { return x.id === id; })[0], n, lim;
    if (id === 'x') { n = xLen(val); lim = 280; }
    else if (field === 'title') { n = len(val); lim = p.titleLimit; }
    else { n = len(val); lim = field === 'tags' ? null : p.limit; }
    return '<span class="sh-count' + (lim && n > lim ? ' over' : '') + '" data-count="' + id + '">' + n + (lim ? ' / ' + lim : ' 字') + '</span>';
  }

  function card(id, o, s) {
    var p = P.filter(function (x) { return x.id === id; })[0]; o = o || {};
    var area = function (field, val, rows, i) { return '<label class="sh-fld"><span>' + ({ title: '标题', body: '正文', tags: '标签（逗号分隔）', text: '正文', part: (i != null ? '第 ' + (i + 1) + ' 条' : '') }[field] || field) + ' ' + counter(id, field === 'part' ? 'text' : field, val) + '</span><textarea rows="' + rows + '" data-sh="' + id + '" data-f="' + field + '"' + (i != null ? ' data-i="' + i + '"' : '') + '>' + esc(val) + '</textarea></label>'; };
    var bodyHtml;
    if (id === 'x') bodyHtml = (o.parts || ['']).map(function (t, i) { return area('part', t, 4, i) + ((o.parts || []).length > 1 ? '<div class="sh-mini"><button type="button" class="btn btn-sm btn-ghost" data-sh-copy="x" data-i="' + i + '">复制第 ' + (i + 1) + ' 条</button><a class="btn btn-sm btn-ghost" data-sh-open="x" data-i="' + i + '" href="#" target="_blank" rel="noopener">打开第 ' + (i + 1) + ' 条</a></div>' : ''); }).join('') + '<button type="button" class="btn btn-sm btn-ghost" data-sh-add="x">+ 加一条（串推）</button>';
    else if (id === 'xhs') bodyHtml = area('title', o.title || '', 1) + area('body', o.body || '', 7) + area('tags', (o.tags || []).join(', '), 1);
    else if (o.title != null && o.body != null) bodyHtml = area('title', o.title, 1) + area('body', o.body, 6);
    else bodyHtml = area('text', o.text || '', 6);
    return '<article class="sh-card" data-plat="' + id + '"><header><span class="card-ico">' + I(p.icon) + '</span><b>' + esc(p.name) + '</b><span class="sh-pre sh-pre-' + p.prefill + '">' + PRE[p.prefill] + '</span></header>' +
      (p.lim ? '<p class="sh-lim">' + esc(p.lim) + '</p>' : '') + bodyHtml +
      '<div class="tool-actions"><button type="button" class="btn btn-sm" data-sh-copy="' + id + '">' + I('file') + '复制</button><a class="btn btn-sm btn-primary" data-sh-open="' + id + '" href="#" target="_blank" rel="noopener">' + I('external') + (p.prefill === 'none' ? '复制并打开发布页' : '打开发帖页') + '</a></div>' +
      '<p class="sh-doc">' + esc(p.doc) + '</p></article>';
  }

  function render(state, root, ctx) {
    ensure(state); var d = state.shareDraft, s = source(state), AI = global.QuestAI, aiOn = AI && AI.ready();
    var items = global.QuestRank ? global.QuestRank.latestItems() : [];
    var srcTabs = [['kit', '实操助手站点', 'kit'], ['rank', '赚钱榜条目', 'trophy'], ['url', '已发布网址', 'globe'], ['text', '自由文本', 'file']];
    var recent = state.shares.slice(-5).reverse();
    root.innerHTML = '<div class="tool-wrap wb sh">' + (global.QuestWorkbench ? global.QuestWorkbench.pipeline(state, 'share') : '') +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('rocket') + '内容分发：一份内容，多平台发帖</h2>' +
      '<p class="hint">全部免费：只用各平台官方的分享/发帖链接，在你自己登录的页面里由你确认发布；本站不代发、不调用付费 API。</p>' +
      '<div class="sh-src" role="tablist">' + srcTabs.map(function (t) { return '<button type="button" role="tab" class="chip' + (d.src === t[0] ? ' on' : '') + '" data-src="' + t[0] + '" aria-selected="' + (d.src === t[0]) + '">' + I(t[2]) + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="form-grid sh-src-form">' +
      (d.src === 'kit' ? (s ? '<p class="hint fld-wide">来自 <a href="#war-kit">站一实操助手</a>：<b>' + esc(s.title) + '</b>' + (s.templateName ? ' · 模板：' + esc(s.templateName) : '') + (s.url ? ' · ' + esc(s.url) : ' · 还没有网址（<a href="#war-publish">先发布</a> 或在实操助手填域名）') + '</p>' : '<p class="hint fld-wide">先到 <a href="#war-kit">站一实操助手</a> 填主词和介绍。</p>') : '') +
      (d.src === 'rank' ? '<label class="fld fld-wide"><span>赚钱榜条目（' + esc(global.QUEST_RANK && global.QUEST_RANK.latest || '') + '）</span><select id="sh-rank">' + items.map(function (it) { return '<option value="' + it.rank + '"' + (+d.rank === it.rank ? ' selected' : '') + '>No.' + it.rank + ' ' + esc(it.name) + '</option>'; }).join('') + '</select></label>' : '') +
      (d.src === 'url' ? '<label class="fld"><span>网址</span><input id="sh-url" type="url" placeholder="https://you.github.io/site/" value="' + esc(d.url) + '" /></label><label class="fld"><span>标题</span><input id="sh-title" value="' + esc(d.title) + '" /></label><label class="fld fld-wide"><span>一句话介绍</span><textarea id="sh-text" rows="2">' + esc(d.text) + '</textarea></label>' : '') +
      (d.src === 'text' ? '<label class="fld fld-wide"><span>要分享的内容</span><textarea id="sh-text" rows="4" placeholder="写下你想分享的内容，第一行会作为标题">' + esc(d.text) + '</textarea></label><label class="fld"><span>链接（可空）</span><input id="sh-url" type="url" value="' + esc(d.url) + '" /></label>' : '') +
      '</div>' +
      '<fieldset class="sh-plats"><legend>发到哪些平台</legend>' + P.map(function (p) { return '<label class="chk"><input type="checkbox" value="' + p.id + '"' + (d.on.indexOf(p.id) >= 0 ? ' checked' : '') + ' /> ' + esc(p.name) + '</label>'; }).join('') + '</fieldset>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary btn-sm" id="sh-gen"' + (s ? '' : ' disabled') + '>' + I('sparkle') + (aiOn ? '用 AI 生成各平台版本' : '生成各平台草稿（模板）') + '</button>' + (aiOn && AI.switcher ? AI.switcher('sh-switch') : '') + '</div>' +
      '<p class="hint" id="sh-mode">' + (aiOn ? 'AI：' + esc(AI.active().name) + ' · ' + esc(AI.active().model) + '（AI 设置）。没返回的平台用模板补齐。' : 'Grok Bot 模式：先用内置模板生成草稿；在 <a href="#me-ai">AI 设置</a> 配置自定义服务商后可用 AI 改写。') + '</p><p id="sh-msg" class="hint" role="status"></p></section>' +
      '<div class="sh-grid" id="sh-grid">' + d.on.filter(function (id) { return d.out[id]; }).map(function (id) { return card(id, d.out[id], s); }).join('') + '</div>' +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('list') + '最近分发</h2>' + (recent.length ? '<ul class="wb-hist">' + recent.map(function (r) { return '<li>' + esc(r.at.slice(5, 16).replace('T', ' ')) + ' · <b>' + esc(r.platformName) + '</b> · ' + (r.action === 'open' ? '打开发帖页' : '复制') + ' · ' + esc(r.title) + '</li>'; }).join('') + '</ul><p class="hint"><a href="#me-analytics">在数据分析里看完整时间线</a></p>' : '<p class="empty-hint">还没有分发记录。</p>') + '</section></div>';

    function saveDraft() { ctx.save(); }
    root.querySelectorAll('[data-src]').forEach(function (b) { b.addEventListener('click', function () { d.src = b.getAttribute('data-src'); saveDraft(); render(state, root, ctx); }); });
    [['#sh-rank', 'rank', 'change'], ['#sh-url', 'url', 'input'], ['#sh-title', 'title', 'input'], ['#sh-text', 'text', 'input']].forEach(function (x) { var el = root.querySelector(x[0]); if (el) el.addEventListener(x[2], function () { d[x[1]] = el.value; saveDraft(); root.querySelector('#sh-gen').disabled = !source(state); }); });
    root.querySelectorAll('.sh-plats input').forEach(function (c) { c.addEventListener('change', function () { d.on = [].slice.call(root.querySelectorAll('.sh-plats input:checked')).map(function (x) { return x.value; }); saveDraft(); }); });
    var msg = root.querySelector('#sh-msg');
    root.querySelector('#sh-gen').addEventListener('click', function () {
      var src = source(state); if (!src) return; var ids = d.on.slice(); if (!ids.length) { msg.textContent = '至少选一个平台。'; return; }
      var fill = function (got) { d.out = {}; ids.forEach(function (id) { d.out[id] = got[id] || template(id, src); }); d.srcSnap = { kind: src.kind, title: src.title, url: src.url }; saveDraft(); render(state, root, ctx); };
      if (!(AI && AI.ready())) { fill({}); root.querySelector('#sh-msg').textContent = '已用模板生成 ' + ids.length + ' 个平台草稿，可直接编辑。'; return; }
      msg.textContent = 'AI 生成中…'; root.querySelector('#sh-gen').disabled = true;
      AI.chat([{ role: 'user', content: aiPrompt(src, ids) }], { stream: false, maxTokens: 2048 }).then(function (txt) {
        var got = parseAI(txt || ''), n = Object.keys(got).filter(function (k) { return ids.indexOf(k) >= 0; }).length;
        fill(got); root.querySelector('#sh-msg').textContent = 'AI 生成了 ' + n + ' 个平台' + (n < ids.length ? '，其余 ' + (ids.length - n) + ' 个用模板补齐' : '') + '。发布前请自己检查一遍。';
      }, function (e) { fill({}); root.querySelector('#sh-msg').textContent = 'AI 出错（' + e.message + '），已改用模板草稿。'; });
    });
    var grid = root.querySelector('#sh-grid');
    grid.addEventListener('input', function (e) {
      var t = e.target; if (!t.matches('textarea[data-sh]')) return;
      var id = t.getAttribute('data-sh'), f = t.getAttribute('data-f'), o = d.out[id];
      if (f === 'part') o.parts[+t.getAttribute('data-i')] = t.value; else if (f === 'tags') o.tags = t.value.split(/[,，、]+/).map(function (x) { return x.trim().replace(/^#/, ''); }).filter(Boolean); else o[f] = t.value;
      var lab = t.parentNode.querySelector('.sh-count'); lab.outerHTML = counter(id, f === 'part' ? 'text' : f, t.value);
      saveDraft();
    });
    grid.querySelectorAll('[data-sh-add]').forEach(function (b) { b.addEventListener('click', function () { d.out.x.parts.push(''); saveDraft(); render(state, root, ctx); }); });
    function payload(id, i) {
      var o = d.out[id], src = d.srcSnap || source(state) || {}, url = src.url || '';
      var text = id === 'x' ? (o.parts[i || 0] || '') : fullText(id, o);
      var noUrl = url ? text.split(url).join('').trim() : text;
      return { text: text, textNoUrl: noUrl, url: url, title: o.title || src.title || '' };
    }
    function log(id, action, i) {
      var p = P.filter(function (x) { return x.id === id; })[0], src = d.srcSnap || {};
      state.shares.push({ at: new Date().toISOString(), platform: id, platformName: p.name, action: action, part: i == null ? null : i, chars: len(payload(id, i).text), title: src.title || '', url: src.url || '', source: src.kind || d.src });
      if (state.shares.length > 500) state.shares.splice(0, state.shares.length - 500);
      saveDraft();
    }
    grid.querySelectorAll('[data-sh-copy]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-sh-copy'), i = b.getAttribute('data-i'); var pl = payload(id, i == null ? null : +i); copy(i == null && id === 'x' ? fullText('x', d.out.x) : pl.text).then(function () { if (global.QuestModal) QuestModal.showToast('已复制'); }); log(id, 'copy', i == null ? null : +i); }); });
    grid.querySelectorAll('[data-sh-open]').forEach(function (a) {
      var id = a.getAttribute('data-sh-open'), i = a.getAttribute('data-i'), p = P.filter(function (x) { return x.id === id; })[0];
      var setHref = function () { a.href = p.open(payload(id, i == null ? 0 : +i)); };
      setHref(); a.addEventListener('focus', setHref); a.addEventListener('mouseenter', setHref);
      a.addEventListener('click', function () { setHref(); var pl = payload(id, i == null ? 0 : +i); if (p.prefill !== 'full') { copy(pl.text); if (global.QuestModal) QuestModal.showToast('文字已复制，到发布页粘贴即可'); } log(id, 'open', i == null ? null : +i); });
    });
  }

  /* ---------- 数据分析时间线 ---------- */
  function timeline(state) {
    ensure(state); var sh = state.shares; if (!sh.length) return '<section class="block glass tool-card" id="share-timeline"><h2 class="block-title">' + I('rocket') + '分发时间线</h2><p class="empty-hint">还没有分发记录。到 <a href="#war-share">内容分发</a> 生成并发帖。</p></section>';
    var byP = {}, byDay = {}; sh.forEach(function (r) { byP[r.platformName] = (byP[r.platformName] || 0) + 1; var k = r.at.slice(0, 10); (byDay[k] = byDay[k] || []).push(r); });
    var max = Math.max.apply(null, Object.keys(byP).map(function (k) { return byP[k]; }));
    return '<section class="block glass tool-card" id="share-timeline"><h2 class="block-title">' + I('rocket') + '分发时间线（' + sh.length + ' 次）</h2>' +
      '<div class="sh-bars">' + Object.keys(byP).sort(function (a, b) { return byP[b] - byP[a]; }).map(function (k) { return '<div class="sh-bar"><span>' + esc(k) + '</span><i style="width:' + Math.max(6, byP[k] / max * 100) + '%"></i><b>' + byP[k] + '</b></div>'; }).join('') + '</div>' +
      '<ol class="sh-tl">' + Object.keys(byDay).sort().reverse().slice(0, 14).map(function (day) { return '<li><b>' + day + '</b><ul>' + byDay[day].slice().reverse().map(function (r) { return '<li>' + esc(r.at.slice(11, 16)) + ' · ' + esc(r.platformName) + ' · ' + (r.action === 'open' ? '打开发帖页' : '复制') + ' · ' + esc(r.title) + (r.url ? ' · <a href="' + esc(r.url) + '" target="_blank" rel="noopener">链接</a>' : '') + '</li>'; }).join('') + '</ul></li>'; }).join('') + '</ol>' +
      '<p class="hint">记录的是你在本站点击「复制 / 打开发帖页」的动作，是否真正发出以你在平台上的确认为准。</p></section>';
  }

  global.QuestShare = { PLATFORMS: P, ensure: ensure, render: render, timeline: timeline, template: template, parseAI: parseAI, xLen: xLen, splitThread: splitThread, source: source };
})(typeof window !== 'undefined' ? window : globalThis);
