/** Phase 13 · AI 设置 #me-ai + AI 助手按钮
 *  配置只存独立 key gefei-quest-ai-v1（不进 gefei-quest-save-v1，不随存档导出）。
 *  调用 OpenAI 兼容 /chat/completions，优先 SSE 流式。 */
(function (global) {
  var KEY = 'gefei-quest-ai-v1';
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var PRESETS = [
    { id: 'openai', label: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', note: 'OpenAI 官方接口。' },
    { id: 'deepseek', label: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', note: 'DeepSeek 开放平台，OpenAI 兼容。' },
    { id: 'dashscope', label: '通义千问 DashScope', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', note: '阿里云百炼 compatible-mode 兼容接口。' },
    { id: 'moonshot', label: 'Kimi / Moonshot', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', note: '月之暗面开放平台。' },
    { id: 'zhipu', label: '智谱 GLM', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', note: '智谱开放平台（v4 路径，已含 /chat/completions 前缀）。' },
    { id: 'openrouter', label: 'OpenRouter', base: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', note: '聚合多家模型，支持浏览器直连。' },
    { id: 'custom', label: '自定义', base: '', model: '', note: '任意 OpenAI 兼容服务（含本地 Ollama / LM Studio 的 /v1）。' },
  ];
  var SYSTEM = '你是「出海小站练站营」的中文学习助手，帮助新手用合法方式学习出海建站、SEO 与小额副业。规则：\n' +
    '1. 只用简体中文回答，结构清晰，用 markdown 小标题和列表，控制在 400 字左右。\n' +
    '2. 只建议合法、合规、符合平台条款的做法。拒绝并劝阻：盗版与破解、账号合租/买卖、游戏币点卡倒卖、学术代写代考、刷量刷单、虚假流量、灰黑产、违反平台规则的引流。\n' +
    '3. 绝不承诺或暗示收益；提到收入时必须写明「不保证收益，因人因时而异」。\n' +
    '4. 平台规则、费率、可用地区以官网为准，不确定就明说不确定，不要编造数据。\n' +
    '5. 给出今天就能做的小步骤，优先免费工具。';

  function load() { try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && typeof c === 'object') return c; } catch (_) {} return { mode: 'grok', provider: 'deepseek', baseUrl: '', apiKey: '', model: '', temperature: 0.7 }; }
  function save(c) { localStorage.setItem(KEY, JSON.stringify(c)); }
  function preset(id) { return PRESETS.filter(function (p) { return p.id === id; })[0] || PRESETS[PRESETS.length - 1]; }
  function ready(c) { c = c || load(); return c.mode === 'custom' && !!(c.baseUrl && c.apiKey && c.model); }
  function endpoint(c) { return String(c.baseUrl).trim().replace(/\/+$/, '').replace(/\/chat\/completions$/, '') + '/chat/completions'; }

  /* ---------- 错误分类 ---------- */
  function explain(status, body) {
    var snippet = body ? '（服务商返回：' + String(body).slice(0, 160) + '）' : '';
    if (status === 401 || status === 403) return 'Key 无效或没有权限（HTTP ' + status + '）：检查 API Key 是否复制完整、是否过期、账户是否开通该模型。' + snippet;
    if (status === 404) return '地址或模型不存在（HTTP 404）：检查 Base URL（通常以 /v1 结尾）和模型名是否与服务商文档一致。' + snippet;
    if (status === 429) return '请求太频繁或余额不足（HTTP 429）：稍后重试，或到服务商后台查看额度。' + snippet;
    if (status === 400) return '请求参数被拒绝（HTTP 400）：常见原因是模型名写错或温度超出范围。' + snippet;
    return '服务商返回错误（HTTP ' + status + '）。' + snippet;
  }
  var NET = '无法连接（网络错误或 CORS 被拦截）：浏览器直连需要服务商允许跨域。请检查 Base URL 是否正确、网络是否可达；若服务商不支持浏览器直连，换用 OpenRouter 等支持 CORS 的服务，或切回 Grok Bot 模式，在聊天里让 agent 帮你。';

  /* ---------- 调用 ---------- */
  function chat(messages, opts) {
    opts = opts || {};
    var c = opts.config || load();
    var body = { model: c.model, messages: [{ role: 'system', content: SYSTEM }].concat(messages), temperature: Math.max(0, Math.min(2, +c.temperature || 0)), stream: opts.stream !== false };
    if (opts.maxTokens) body.max_tokens = opts.maxTokens;
    var ctrl = global.AbortController ? new AbortController() : null;
    var p = fetch(endpoint(c), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.apiKey }, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) return res.text().then(function (t) { var e = new Error(explain(res.status, t)); e.status = res.status; throw e; });
        var ct = res.headers.get('content-type') || '';
        if (body.stream && res.body && /event-stream/.test(ct)) {
          var reader = res.body.getReader(), dec = new TextDecoder(), buf = '', full = '';
          return (function pump() {
            return reader.read().then(function (r) {
              if (r.done) return full;
              buf += dec.decode(r.value, { stream: true });
              var lines = buf.split('\n'); buf = lines.pop();
              lines.forEach(function (ln) {
                ln = ln.trim(); if (ln.indexOf('data:') !== 0) return;
                var d = ln.slice(5).trim(); if (!d || d === '[DONE]') return;
                try { var j = JSON.parse(d), t = j.choices && j.choices[0] && (j.choices[0].delta && j.choices[0].delta.content || j.choices[0].message && j.choices[0].message.content) || ''; if (t) { full += t; opts.onDelta && opts.onDelta(t, full); } } catch (_) {}
              });
              return pump();
            });
          })();
        }
        return res.json().then(function (j) { var t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; opts.onDelta && opts.onDelta(t, t); return t; });
      }, function (err) { if (err && err.name === 'AbortError') throw err; var e = new Error(NET); e.network = true; throw e; });
    p.abort = function () { if (ctrl) ctrl.abort(); };
    return p;
  }
  function test(c) { return chat([{ role: 'user', content: '只回复两个字：成功' }], { config: c, stream: false, maxTokens: 8 }); }

  /* ---------- markdown 渲染（复用站内渲染器 + 链接白名单） ---------- */
  function md(text) {
    var html = global.QuestGuides ? global.QuestGuides.render(text || '').html : esc(text).replace(/\n/g, '<br>');
    var box = document.createElement('div'); box.innerHTML = html;
    box.querySelectorAll('a').forEach(function (a) { var h = a.getAttribute('href') || ''; if (!/^(https?:|#)/i.test(h)) a.removeAttribute('href'); else if (/^https?:/i.test(h)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
    box.querySelectorAll('script,iframe,object,embed,style').forEach(function (x) { x.remove(); });
    return box.innerHTML;
  }

  /* ---------- 结果面板 ---------- */
  var GROK_HINT = '<div class="ai-out ai-hint">' + '<p>' + I('sparkle') + '当前是 <b>Grok Bot 模式</b>：这类分析由后台的「赚钱项目实施官」完成。直接在 <b>Grok Bot 聊天</b>里说，例如「帮我分析选词 pdf merge for mac」或「把赚钱榜第 3 名拆成今天的步骤」。</p>' +
    '<p class="hint">想在网页里直接调用自己的模型？到 <a href="#me-ai">AI 设置</a> 切换为自定义模式。</p></div>';
  function run(host, prompt, title) {
    var old = host.querySelector('.ai-out'); if (old) old.remove();
    if (!ready()) { host.insertAdjacentHTML('beforeend', GROK_HINT); if (global.QuestNav) global.QuestNav.fixLinks(host); return null; }
    var box = document.createElement('div'); box.className = 'ai-out'; box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="ai-out-head"><b>' + I('sparkle') + esc(title) + '</b><span class="ai-status">生成中…</span><button type="button" class="btn btn-sm btn-ghost ai-stop">停止</button></div><div class="ai-body doc-body"><i class="sk"></i><i class="sk sk-short"></i></div><p class="ai-foot">AI 生成内容仅供参考，不保证收益；平台规则以官网为准。</p>';
    host.appendChild(box);
    var body = box.querySelector('.ai-body'), status = box.querySelector('.ai-status'), raf = 0, latest = '';
    var req = chat([{ role: 'user', content: prompt }], { onDelta: function (_, full) { latest = full; if (!raf) raf = requestAnimationFrame(function () { raf = 0; body.innerHTML = md(latest); }); } });
    box.querySelector('.ai-stop').addEventListener('click', function () { req.abort(); });
    req.then(function (full) {
      body.innerHTML = md(full || '（模型没有返回内容）'); status.textContent = '完成';
      var stop = box.querySelector('.ai-stop'); stop.textContent = '复制'; stop.classList.add('ai-copy');
      stop.replaceWith(stop.cloneNode(true)); box.querySelector('.ai-copy').addEventListener('click', function () { try { navigator.clipboard.writeText(full); status.textContent = '已复制'; } catch (_) {} });
    }, function (e) {
      if (e && e.name === 'AbortError') { status.textContent = '已停止'; if (!latest) body.innerHTML = '<p class="hint">已停止。</p>'; return; }
      status.textContent = '出错'; body.innerHTML = '<p class="ai-error" role="alert">' + I('lock') + esc(e.message) + '</p>';
    });
    return req;
  }
  function btn(label, attrs) { return '<button type="button" class="btn btn-sm ai-btn" ' + attrs + '>' + I('sparkle') + label + '</button>'; }

  /* ---------- 三处按钮（MutationObserver 自动装饰，工具内部重绘也不丢） ---------- */
  function getState() { try { return JSON.parse(localStorage.getItem('gefei-quest-save-v1') || '{}'); } catch (_) { return {}; } }
  function decorate(root) {
    if (!root) return;
    root.querySelectorAll('.kw-item:not([data-ai])').forEach(function (li) {
      li.setAttribute('data-ai', '1'); var acts = li.querySelector('.kw-acts') || li;
      acts.insertAdjacentHTML('beforeend', btn('AI 分析这个词', 'data-ai-kw="' + esc(li.dataset.kw) + '"'));
    });
    root.querySelectorAll('.rank-card:not([data-ai])').forEach(function (card) {
      card.setAttribute('data-ai', '1'); var acts = card.querySelector('.rank-foot .tool-actions') || card;
      acts.insertAdjacentHTML('beforeend', btn('AI 点评/生成今日步骤', 'data-ai-rank="' + card.dataset.rank + '"'));
    });
    var prev = root.querySelector('#kit-preview');
    if (prev && !root.querySelector('[data-ai-kit]')) prev.insertAdjacentHTML('afterend', '<div class="ai-kit">' + btn('AI 生成 title/描述', 'data-ai-kit="1"') + '</div>');
  }
  function onClick(e) {
    var b = e.target.closest('[data-ai-kw],[data-ai-rank],[data-ai-kit]'); if (!b) return;
    var s = getState(), host, prompt, title;
    if (b.hasAttribute('data-ai-kw')) {
      var kw = b.getAttribute('data-ai-kw'), k = ((s.keywords && s.keywords.items) || []).filter(function (x) { return x.kw === kw; })[0] || {};
      host = b.closest('.kw-item'); title = 'AI 分析：' + kw;
      prompt = '我在练习出海英文小站选词，请分析这个关键词：「' + kw + '」。\n我在搜索结果前 10 里观察到：大站数量 ' + (k.big === '' || k.big == null ? '未填' : k.big) + '，论坛/新站/小站数量 ' + (k.weak === '' || k.weak == null ? '未填' : k.weak) + '，搜索量档位 ' + (k.vol || '未知') + '，意图 ' + (k.intent || '未知') + '，备注：' + (k.note || '无') + '。\n请输出：\n## 搜索意图\n## 竞争判断（新手能否做，为什么）\n## 5 个更容易的长尾词\n## 单页结构建议（H1 / 3–5 个 H2）\n## 今天的下一步\n最后提醒不保证排名和收益。';
    } else if (b.hasAttribute('data-ai-rank')) {
      var R = global.QuestRank ? global.QuestRank.latestItems() : [], it = R.filter(function (x) { return x.rank === +b.getAttribute('data-ai-rank'); })[0];
      if (!it) return; host = b.closest('.rank-card'); title = 'AI 点评：' + it.name;
      prompt = '这是今天「每日赚钱榜」上的一个方案，请客观点评并拆成今天能做的步骤。\n名称：' + it.name + '\n类型：' + it.type + '\n成本：' + it.cost + '\n难度：' + it.difficulty + '/5\n适合：' + it.fit + '\n理由：' + it.why + '\n已知步骤：' + (it.steps || []).join('；') + '\n风险：' + it.risk + '\n官方来源：' + it.source_url + '\n请输出：\n## 一句话点评（适合谁、不适合谁）\n## 主要风险与合规注意\n## 今天 30–60 分钟的步骤（编号）\n## 一周后怎么判断要不要继续\n不要承诺收益。';
    } else {
      var kit = s.kit || {}; host = b.closest('.ai-kit'); title = 'AI 生成 title/描述';
      if (!(kit.keyword || '').trim()) { host.insertAdjacentHTML('beforeend', '<div class="ai-out"><p class="ai-error">先在上面填写「主词 / 品牌名」，再让 AI 生成。</p></div>'); return; }
      prompt = '我要做一个英文单页小站，主词：「' + kit.keyword + '」，一句话介绍：「' + (kit.intro || '未填') + '」，域名：' + (kit.domain || '未填') + '。\n请生成 3 组英文 SEO 文案，每组包括：\n- title（必须包含主词，≤60 个字符，标出字符数）\n- meta description（120–160 个字符，标出字符数，自然包含主词，不夸大、不承诺）\n- H1\n再用中文说明各组的取舍，最后给出你推荐的一组。';
    }
    run(host, prompt, title);
  }

  /* ---------- 设置页 ---------- */
  function renderSettings(root) {
    var c = load(), p = preset(c.provider);
    var masked = c.apiKey ? c.apiKey.slice(0, 3) + '••••' + c.apiKey.slice(-4) : '';
    root.innerHTML =
      '<section class="block"><h2 class="block-title">' + I('sparkle') + 'AI 模式</h2><div class="ai-modes" role="radiogroup" aria-label="AI 模式">' +
      '<label class="ai-mode glass' + (c.mode !== 'custom' ? ' on' : '') + '"><input type="radio" name="ai-mode" value="grok"' + (c.mode !== 'custom' ? ' checked' : '') + ' /><span class="card-ico card-ico-lg">' + I('lighthouse') + '</span><span><b>Grok Bot（默认，推荐）</b><small>不用配置任何东西</small></span></label>' +
      '<label class="ai-mode glass' + (c.mode === 'custom' ? ' on' : '') + '"><input type="radio" name="ai-mode" value="custom"' + (c.mode === 'custom' ? ' checked' : '') + ' /><span class="card-ico card-ico-lg">' + I('gear') + '</span><span><b>自定义 · OpenAI 兼容接口</b><small>用你自己的 API Key，在网页里直接调用</small></span></label></div></section>' +
      (c.mode !== 'custom' ?
        '<section class="block glass tool-card" id="ai-grok"><h2 class="block-title">' + I('lighthouse') + 'Grok Bot 模式在做什么</h2>' +
        '<div class="ai-agents"><div class="ai-agent"><span class="card-ico">' + I('trophy') + '</span><div><b>赚钱榜雷达</b><p>每天在后台搜集公开、合法的赚钱与薅羊毛渠道，核对官方来源后发布到 <a href="#war-rank">每日赚钱榜</a>，并更新 daily.json。</p></div></div>' +
        '<div class="ai-agent"><span class="card-ico">' + I('kit') + '</span><div><b>赚钱项目实施官</b><p>帮你把选中的方案落地：拆步骤、写页面文案、分析选词、复盘数据。需要时直接在 Grok Bot 聊天里找它。</p></div></div></div>' +
        '<p class="hint">两个 agent 都在后台工作，这里<b>没有需要配置的内容</b>。网页上的 AI 按钮会提示你去聊天里提问。</p></section>'
        :
        '<section class="block glass tool-card" id="ai-custom"><h2 class="block-title">' + I('gear') + '接口配置</h2>' +
        '<div class="ai-warn" role="note"><b>安全提醒</b>：API Key 以明文保存在<b>当前浏览器</b>（独立存储，不会写入进度存档，也不会随「导出存档」带走）。请求直接从你的浏览器发往服务商，不经过本站。建议使用设置了额度上限的 Key；公共或他人电脑用完请点「忘记 Key」。</div>' +
        '<div class="form-grid">' +
        '<label class="fld"><span>服务商</span><select id="ai-provider">' + PRESETS.map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('') + '</select><small class="hint" id="ai-note">' + esc(p.note) + '</small></label>' +
        '<label class="fld"><span>Base URL</span><input id="ai-base" value="' + esc(c.baseUrl || p.base) + '" placeholder="https://api.example.com/v1" spellcheck="false" autocomplete="off" /></label>' +
        '<label class="fld"><span>API Key ' + (masked ? '<small>（已保存：' + esc(masked) + '）</small>' : '') + '</span><input id="ai-key" type="password" value="' + esc(c.apiKey) + '" placeholder="sk-..." autocomplete="off" spellcheck="false" /></label>' +
        '<label class="fld"><span>模型名</span><input id="ai-model" value="' + esc(c.model || p.model) + '" placeholder="例如 deepseek-chat" spellcheck="false" autocomplete="off" /></label>' +
        '<label class="fld"><span>温度 <b id="ai-temp-v">' + (+c.temperature || 0).toFixed(1) + '</b></span><input id="ai-temp" type="range" min="0" max="1.5" step="0.1" value="' + (+c.temperature || 0) + '" /></label>' +
        '</div><div class="tool-actions"><button type="button" class="btn btn-primary btn-sm" id="ai-save">' + I('download') + '保存</button><button type="button" class="btn btn-sm" id="ai-test">' + I('target') + '测试连接</button><button type="button" class="btn btn-sm btn-danger" id="ai-forget">' + I('lock') + '忘记 Key</button></div>' +
        '<div id="ai-test-out" class="ai-test-out" aria-live="polite"></div>' +
        '<p class="hint">配置好后，<a href="#war-keywords">选词练习板</a>、<a href="#war-rank">每日赚钱榜</a>、<a href="#war-kit">站一实操助手</a> 会出现 AI 按钮。回答为中文、只给合法建议、不承诺收益。</p></section>') +
      '<p class="tool-privacy">' + I('lock') + 'AI 设置存于独立的本地存储（gefei-quest-ai-v1），与学习进度分开。</p>';
    root.querySelectorAll('[name=ai-mode]').forEach(function (r) { r.addEventListener('change', function () { var x = load(); x.mode = r.value; save(x); renderSettings(root); if (global.QuestNav) global.QuestNav.fixLinks(root); }); });
    if (c.mode !== 'custom') return;
    var $ = function (s) { return root.querySelector(s); };
    $('#ai-provider').addEventListener('change', function () { var np = preset(this.value); $('#ai-note').textContent = np.note; if (np.base) $('#ai-base').value = np.base; if (np.model) $('#ai-model').value = np.model; });
    $('#ai-temp').addEventListener('input', function () { $('#ai-temp-v').textContent = (+this.value).toFixed(1); });
    function collect() { return { mode: 'custom', provider: $('#ai-provider').value, baseUrl: $('#ai-base').value.trim(), apiKey: $('#ai-key').value.trim(), model: $('#ai-model').value.trim(), temperature: +$('#ai-temp').value }; }
    function out(cls, html) { $('#ai-test-out').innerHTML = '<p class="' + cls + '">' + html + '</p>'; }
    $('#ai-save').addEventListener('click', function () { var x = collect(); save(x); out(ready(x) ? 'ai-ok' : 'ai-error', ready(x) ? '已保存。AI 按钮已在三个工具页启用。' : '已保存，但 Base URL、API Key、模型名需要都填写才能使用。'); });
    $('#ai-test').addEventListener('click', function () {
      var x = collect();
      if (!x.baseUrl || !x.apiKey || !x.model) { out('ai-error', '请先填写 Base URL、API Key 和模型名。'); return; }
      out('hint', '正在测试…'); var t0 = Date.now();
      test(x).then(function (txt) { out('ai-ok', '连接成功（' + (Date.now() - t0) + ' ms），模型回复：' + esc(String(txt).slice(0, 40)) + '。记得点「保存」。'); }, function (e) { out('ai-error', esc(e.message)); });
    });
    $('#ai-forget').addEventListener('click', function () { var x = load(); x.apiKey = ''; save(x); renderSettings(root); var o = root.querySelector('#ai-test-out'); if (o) o.innerHTML = '<p class="ai-ok">API Key 已从本浏览器删除。</p>'; });
  }

  function init() {
    document.addEventListener('click', onClick);
    var war = document.getElementById('panel-war');
    if (war && global.MutationObserver) new MutationObserver(function () { decorate(war); }).observe(war, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  global.QuestAI = { KEY: KEY, PRESETS: PRESETS, SYSTEM: SYSTEM, load: load, save: save, ready: ready, chat: chat, test: test, md: md, run: run, decorate: decorate, renderSettings: renderSettings, endpoint: endpoint };
})(typeof window !== 'undefined' ? window : globalThis);
