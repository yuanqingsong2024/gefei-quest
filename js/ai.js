/** Phase 13–14 · AI 设置 #me-ai + AI 助手按钮
 *  配置只存独立 key gefei-quest-ai-v1（不进 gefei-quest-save-v1，不随存档导出）。
 *  v2：用户自管理服务商列表 providers[] + activeId；格式 openai / anthropic / ollama。 */
(function (global) {
  var KEY = 'gefei-quest-ai-v1';
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  var FORMATS = [['openai', 'OpenAI 兼容（/chat/completions）'], ['anthropic', 'Anthropic Messages（/v1/messages）'], ['ollama', 'Ollama / 本地（/api/chat）']];
  /** 模板：克隆后成为用户自己的服务商 */
  var TEMPLATES = [
    { id: 'openai', label: 'OpenAI', format: 'openai', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', note: 'OpenAI 官方接口。' },
    { id: 'deepseek', label: 'DeepSeek', format: 'openai', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', note: 'DeepSeek 开放平台，OpenAI 兼容。' },
    { id: 'dashscope', label: '通义千问 DashScope', format: 'openai', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', note: '阿里云百炼 compatible-mode 兼容接口。' },
    { id: 'moonshot', label: 'Kimi / Moonshot', format: 'openai', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', note: '月之暗面开放平台。' },
    { id: 'zhipu', label: '智谱 GLM', format: 'openai', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', note: '智谱开放平台 v4。' },
    { id: 'openrouter', label: 'OpenRouter', format: 'openai', base: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', note: '聚合多家模型，支持浏览器直连。' },
    { id: 'anthropic', label: 'Anthropic Claude', format: 'anthropic', base: 'https://api.anthropic.com', model: 'claude-3-5-haiku-latest', note: 'Anthropic Messages API（浏览器直连需特殊头，已自动加）。' },
    { id: 'ollama', label: 'Ollama 本地', format: 'ollama', base: 'http://localhost:11434', model: 'qwen2.5:7b', note: '本机 Ollama，无需 Key；需设置 OLLAMA_ORIGINS 允许本站跨域。' },
    { id: 'custom', label: '空白自定义', format: 'openai', base: '', model: '', note: '任意服务，自己填写。' },
  ];
  var PRESETS = TEMPLATES;
  var SYSTEM = '你是「出海小站练站营」的中文学习助手，帮助新手用合法方式学习出海建站、SEO 与小额副业。规则：\n' +
    '1. 只用简体中文回答，结构清晰，用 markdown 小标题和列表，控制在 400 字左右。\n' +
    '2. 只建议合法、合规、符合平台条款的做法。拒绝并劝阻：盗版与破解、账号合租/买卖、游戏币点卡倒卖、学术代写代考、刷量刷单、虚假流量、灰黑产、违反平台规则的引流。\n' +
    '3. 绝不承诺或暗示收益；提到收入时必须写明「不保证收益，因人因时而异」。\n' +
    '4. 平台规则、费率、可用地区以官网为准，不确定就明说不确定，不要编造数据。\n' +
    '5. 给出今天就能做的小步骤，优先免费工具。';


  function blankProvider(t) {
    t = t || TEMPLATES[TEMPLATES.length - 1];
    return { id: uid(), name: t.id === 'custom' ? '我的服务商' : t.label, format: t.format, baseUrl: t.base, apiKey: '', models: t.model ? [t.model] : [], model: t.model, headers: [], temperature: 0.7, maxTokens: 1024, template: t.id };
  }
  function normProvider(p) {
    p = p || {};
    return { id: String(p.id || uid()), name: String(p.name || '未命名服务商').slice(0, 60), format: ['openai', 'anthropic', 'ollama'].indexOf(p.format) >= 0 ? p.format : 'openai',
      baseUrl: String(p.baseUrl || ''), apiKey: String(p.apiKey || ''), models: Array.isArray(p.models) ? p.models.map(String).filter(Boolean) : [], model: String(p.model || ''),
      headers: Array.isArray(p.headers) ? p.headers.filter(function (h) { return h && h.k; }).map(function (h) { return { k: String(h.k), v: String(h.v == null ? '' : h.v) }; }) : [],
      temperature: isFinite(+p.temperature) ? +p.temperature : 0.7, maxTokens: Math.max(1, Math.min(32000, parseInt(p.maxTokens, 10) || 1024)), template: p.template || '' };
  }
  function load() {
    var c = null;
    try { c = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
    if (!c || typeof c !== 'object') c = { mode: 'grok' };
    if (!Array.isArray(c.providers)) {
      c.providers = [];
      if (c.baseUrl) { // Phase 13 单配置 → 迁移（旧字段保留）
        var t = TEMPLATES.filter(function (x) { return x.id === c.provider; })[0];
        var p = normProvider({ name: (t && t.id !== 'custom' ? t.label : '我的服务商') + '（迁移）', format: 'openai', baseUrl: c.baseUrl, apiKey: c.apiKey, model: c.model, models: c.model ? [c.model] : [], temperature: c.temperature, template: c.provider });
        c.providers.push(p); c.activeId = p.id;
      }
    }
    c.providers = c.providers.map(normProvider);
    if (!c.providers.some(function (p) { return p.id === c.activeId; })) c.activeId = c.providers[0] ? c.providers[0].id : null;
    c.version = 2; if (c.mode !== 'custom') c.mode = 'grok';
    return c;
  }
  function save(c) { localStorage.setItem(KEY, JSON.stringify(c)); }
  function active(c) { c = c || load(); return c.providers.filter(function (p) { return p.id === c.activeId; })[0] || null; }
  function usable(p) { return !!(p && p.baseUrl && p.model && (p.format === 'ollama' || p.apiKey || p.headers.length || /localhost|127\.0\.0\.1/.test(p.baseUrl) || true)); }
  function ready(c) { c = c || load(); var p = active(c); return c.mode === 'custom' && !!(p && p.baseUrl && p.model); }
  function base(p) { return String(p.baseUrl || '').trim().replace(/\/+$/, ''); }
  function endpoint(p) {
    var b = base(p);
    if (p.format === 'anthropic') return /\/v1$/.test(b) ? b + '/messages' : b.replace(/\/v1\/messages$/, '') + '/v1/messages';
    if (p.format === 'ollama') return b.replace(/\/api\/chat$/, '') + '/api/chat';
    return b.replace(/\/chat\/completions$/, '') + '/chat/completions';
  }
  function modelsUrl(p) {
    var b = base(p);
    if (p.format === 'anthropic') return (/\/v1$/.test(b) ? b : b + '/v1') + '/models';
    if (p.format === 'ollama') return b + '/api/tags';
    return b + '/models';
  }
  function headersFor(p, json) {
    var h = {};
    if (json) h['Content-Type'] = 'application/json';
    if (p.format === 'anthropic') { if (p.apiKey) h['x-api-key'] = p.apiKey; h['anthropic-version'] = '2023-06-01'; h['anthropic-dangerous-direct-browser-access'] = 'true'; }
    else if (p.apiKey) h.Authorization = 'Bearer ' + p.apiKey;
    (p.headers || []).forEach(function (x) { if (x.k) h[x.k] = x.v; });
    return h;
  }
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


  /* ---------- 调用（三种格式） ---------- */
  function chat(messages, opts) {
    opts = opts || {};
    var p = opts.provider || active();
    if (!p) return Promise.reject(new Error('还没有可用的服务商，请先在 AI 设置里添加。'));
    var stream = opts.stream !== false, temp = Math.max(0, Math.min(2, +p.temperature || 0)), maxT = opts.maxTokens || p.maxTokens || 1024, body;
    var sys = (typeof opts.system === 'string' && opts.system) ? opts.system : SYSTEM;
    if (p.format === 'anthropic') body = { model: p.model, system: sys, messages: messages, max_tokens: maxT, temperature: Math.min(1, temp), stream: stream };
    else if (p.format === 'ollama') body = { model: p.model, messages: [{ role: 'system', content: sys }].concat(messages), stream: stream, options: { temperature: temp, num_predict: maxT } };
    else { body = { model: p.model, messages: [{ role: 'system', content: sys }].concat(messages), temperature: temp, stream: stream }; if (opts.maxTokens || p.maxTokens) body.max_tokens = maxT; }
    var ctrl = global.AbortController ? new AbortController() : null;
    function pick(j) {
      if (p.format === 'anthropic') { if (j.type === 'content_block_delta' && j.delta) return j.delta.text || ''; if (Array.isArray(j.content)) return j.content.map(function (c) { return c.text || ''; }).join(''); return ''; }
      if (p.format === 'ollama') return (j.message && j.message.content) || j.response || '';
      var c = j.choices && j.choices[0]; return c ? ((c.delta && c.delta.content) || (c.message && c.message.content) || '') : '';
    }
    var req = fetch(endpoint(p), { method: 'POST', headers: headersFor(p, true), body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) return res.text().then(function (t) { var e = new Error(explain(res.status, t)); e.status = res.status; throw e; });
        var ct = res.headers.get('content-type') || '';
        var lineMode = stream && res.body && (/event-stream/.test(ct) || (p.format === 'ollama' && /ndjson|x-ndjson/.test(ct)));
        if (lineMode) {
          var reader = res.body.getReader(), dec = new TextDecoder(), buf = '', full = '';
          return (function pump() {
            return reader.read().then(function (r) {
              if (r.done) return full;
              buf += dec.decode(r.value, { stream: true });
              var lines = buf.split('\n'); buf = lines.pop();
              lines.forEach(function (ln) {
                ln = ln.trim(); if (!ln) return;
                if (ln.indexOf('data:') === 0) ln = ln.slice(5).trim(); else if (ln.indexOf('event:') === 0) return;
                if (!ln || ln === '[DONE]') return;
                try { var t = pick(JSON.parse(ln)); if (t) { full += t; opts.onDelta && opts.onDelta(t, full); } } catch (_) {}
              });
              return pump();
            });
          })();
        }
        return res.text().then(function (txt) {
          var t = '';
          try { t = pick(JSON.parse(txt)); } catch (_) { txt.split('\n').forEach(function (ln) { try { t += pick(JSON.parse(ln.replace(/^data:\s*/, ''))); } catch (__) {} }); }
          opts.onDelta && opts.onDelta(t, t); return t;
        });
      }, function (err) { if (err && err.name === 'AbortError') throw err; var e = new Error(NET); e.network = true; throw e; });
    req.abort = function () { if (ctrl) ctrl.abort(); };
    return req;
  }
  function test(p) { return chat([{ role: 'user', content: '只回复两个字：成功' }], { provider: p, stream: false, maxTokens: 8 }); }
  function fetchModels(p) {
    return fetch(modelsUrl(p), { headers: headersFor(p, false) }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(res.status === 404 ? '该服务不支持获取模型列表（HTTP 404），请手动填写模型名。' : explain(res.status, t)); });
      return res.json();
    }, function () { throw new Error(NET); }).then(function (j) {
      var list = (j.data || j.models || []).map(function (m) { return typeof m === 'string' ? m : (m.id || m.name || m.model); }).filter(Boolean);
      if (!list.length) throw new Error('服务商返回了空的模型列表，请手动填写。');
      return list;
    });
  }

  /* ---------- 导入导出（不含 Key） ---------- */
  function exportJson(c) {
    c = c || load();
    return JSON.stringify({ kind: 'gefei-quest-ai-providers', version: 1, exportedAt: new Date().toISOString(), providers: c.providers.map(function (p) { var q = normProvider(p); delete q.apiKey; delete q.id; return q; }) }, null, 2);
  }
  function importJson(text, c) {
    c = c || load();
    var j = JSON.parse(text), list = Array.isArray(j) ? j : j.providers;
    if (!Array.isArray(list) || !list.length) throw new Error('文件里没有 providers 列表。');
    var added = list.map(function (p) { var q = normProvider(p); q.id = uid(); q.apiKey = ''; return q; });
    c.providers = c.providers.concat(added);
    if (!c.activeId) c.activeId = added[0].id;
    return added.length;
  }
  /* ---------- markdown 渲染（复用站内渲染器 + 链接白名单） ---------- */
  function md(text) {
    var html = global.QuestGuides ? global.QuestGuides.render(text || '').html : esc(text).replace(/\n/g, '<br>');
    var box = document.createElement('div'); box.innerHTML = html;
    box.querySelectorAll('a').forEach(function (a) { var h = a.getAttribute('href') || ''; if (!/^(https?:|#)/i.test(h)) a.removeAttribute('href'); else if (/^https?:/i.test(h)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
    box.querySelectorAll('script,iframe,object,embed,style').forEach(function (x) { x.remove(); });
    return box.innerHTML;
  }

  var GROK_HINT = '<div class="ai-out ai-hint">' + '<p>' + I('sparkle') + '当前是 <b>Grok Bot 模式</b>：这类分析由后台的「赚钱项目实施官」完成。直接在 <b>Grok Bot 聊天</b>里说，例如「帮我分析选词 pdf merge for mac」或「把赚钱榜第 3 名拆成今天的步骤」。</p>' +
    '<p class="hint">想在网页里直接调用自己的模型？到 <a href="#me-ai">AI 设置</a> 切换为自定义模式。</p></div>';

  function switcher(cls) {
    var c = load(); if (c.mode !== 'custom' || !c.providers.length) return '';
    return '<label class="ai-switch ' + (cls || '') + '"><span>' + I('sparkle') + 'AI 服务商</span><select data-ai-switch aria-label="切换 AI 服务商">' +
      c.providers.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === c.activeId ? ' selected' : '') + '>' + esc(p.name) + (p.model ? ' · ' + esc(p.model) : '') + '</option>'; }).join('') + '</select><a href="#me-ai" class="ai-switch-link">管理</a></label>';
  }
  function run(host, prompt, title) {
    var old = host.querySelector('.ai-out'); if (old) old.remove();
    if (!ready()) { host.insertAdjacentHTML('beforeend', load().mode === 'custom' ? '<div class="ai-out ai-hint"><p>' + I('gear') + '自定义模式还没有可用的服务商（需要 Base URL 和模型名）。到 <a href="#me-ai">AI 设置</a> 新建或选择一个。</p></div>' : GROK_HINT); if (global.QuestNav) global.QuestNav.fixLinks(host); return null; }
    var p = active();
    var box = document.createElement('div'); box.className = 'ai-out'; box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="ai-out-head"><b>' + I('sparkle') + esc(title) + '</b><small class="ai-via">' + esc(p.name) + ' · ' + esc(p.model) + '</small><span class="ai-status">生成中…</span><button type="button" class="btn btn-sm btn-ghost ai-stop">停止</button></div><div class="ai-body doc-body"><i class="sk"></i><i class="sk sk-short"></i></div><p class="ai-foot">AI 生成内容仅供参考，不保证收益；平台规则以官网为准。</p>';
    host.appendChild(box);
    var body = box.querySelector('.ai-body'), status = box.querySelector('.ai-status'), raf = 0, latest = '';
    var req = chat([{ role: 'user', content: prompt }], { provider: p, onDelta: function (_, full) { latest = full; if (!raf) raf = requestAnimationFrame(function () { raf = 0; body.innerHTML = md(latest); }); } });
    box.querySelector('.ai-stop').addEventListener('click', function () { req.abort(); });
    req.then(function (full) {
      body.innerHTML = md(full || '（模型没有返回内容）'); status.textContent = '完成';
      var stop = box.querySelector('.ai-stop'), cp = stop.cloneNode(true); cp.textContent = '复制'; cp.classList.add('ai-copy'); stop.replaceWith(cp);
      cp.addEventListener('click', function () { try { navigator.clipboard.writeText(full); status.textContent = '已复制'; } catch (_) {} });
    }, function (e) {
      if (e && e.name === 'AbortError') { status.textContent = '已停止'; if (!latest) body.innerHTML = '<p class="hint">已停止。</p>'; return; }
      status.textContent = '出错'; body.innerHTML = '<p class="ai-error" role="alert">' + I('lock') + esc(e.message) + '</p>';
    });
    return req;
  }
  function btn(label, attrs) { return '<button type="button" class="btn btn-sm ai-btn" ' + attrs + '>' + I('sparkle') + label + '</button>'; }
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
    if (prev && !root.querySelector('[data-ai-kit]')) prev.insertAdjacentHTML('afterend', '<div class="ai-kit">' + btn('AI 生成 title/描述', 'data-ai-kit="1"') + switcher('ai-switch-inline') + '</div>');
    var tb = root.querySelector('#tool-body');
    if (tb && (root.querySelector('.kw-item, .rank-card')) && !root.querySelector('.ai-switch-bar')) { var sw = switcher('ai-switch-bar'); if (sw) tb.insertAdjacentHTML('afterbegin', sw); }
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
  var editing = null; // provider id 或 'new:<template>'
  function providerCard(p, c) {
    var on = p.id === c.activeId, fmt = FORMATS.filter(function (f) { return f[0] === p.format; })[0];
    return '<li class="prov glass' + (on ? ' on' : '') + '" data-prov="' + esc(p.id) + '"><div class="prov-main">' +
      '<label class="prov-radio"><input type="radio" name="ai-active" value="' + esc(p.id) + '"' + (on ? ' checked' : '') + ' aria-label="设为当前" /></label>' +
      '<div><b class="prov-name">' + esc(p.name) + '</b>' + (on ? ' <span class="pill">当前</span>' : '') +
      '<small>' + esc(fmt ? fmt[1] : p.format) + ' · ' + esc(p.baseUrl || '未填地址') + '</small><small>模型：' + esc(p.model || '未填') + (p.models.length > 1 ? '（列表 ' + p.models.length + ' 个）' : '') + ' · Key：' + (p.apiKey ? '已保存' : '无') + (p.headers.length ? ' · 请求头 ' + p.headers.length : '') + '</small></div></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-sm" data-pact="test">测试</button><button type="button" class="btn btn-sm" data-pact="edit">编辑</button><button type="button" class="btn btn-sm" data-pact="dup">复制</button><button type="button" class="btn btn-sm btn-danger" data-pact="del">删除</button></div>' +
      '<div class="prov-test" aria-live="polite"></div></li>';
  }
  function editor(p, isNew) {
    var t = TEMPLATES.filter(function (x) { return x.id === p.template; })[0];
    return '<section class="block glass tool-card ai-editor" id="ai-editor"><h2 class="block-title">' + I('gear') + (isNew ? '新建服务商' : '编辑：' + esc(p.name)) + '</h2>' +
      (t ? '<p class="hint">模板：' + esc(t.label) + ' · ' + esc(t.note) + '</p>' : '') +
      '<div class="form-grid">' +
      '<label class="fld"><span>名称</span><input id="ai-name" value="' + esc(p.name) + '" maxlength="60" /></label>' +
      '<label class="fld"><span>API 格式</span><select id="ai-format">' + FORMATS.map(function (f) { return '<option value="' + f[0] + '"' + (f[0] === p.format ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld"><span>Base URL</span><input id="ai-base" value="' + esc(p.baseUrl) + '" placeholder="https://api.example.com/v1 或 http://localhost:11434" spellcheck="false" autocomplete="off" /></label>' +
      '<label class="fld"><span>API Key <small>（可选' + (p.apiKey ? '，已保存' : '') + '）</small></span><input id="ai-key" type="password" value="' + esc(p.apiKey) + '" placeholder="sk-...（本地模型可留空）" autocomplete="off" spellcheck="false" /></label>' +
      '<label class="fld"><span>当前模型</span><input id="ai-model" list="ai-model-list" value="' + esc(p.model) + '" placeholder="输入或从列表选择" spellcheck="false" autocomplete="off" /><datalist id="ai-model-list">' + p.models.map(function (m) { return '<option value="' + esc(m) + '">'; }).join('') + '</datalist></label>' +
      '<label class="fld"><span>模型列表 <small>（每行一个）</small></span><textarea id="ai-models" rows="3" spellcheck="false">' + esc(p.models.join('\n')) + '</textarea></label>' +
      '<label class="fld"><span>温度 <b id="ai-temp-v">' + (+p.temperature).toFixed(1) + '</b></span><input id="ai-temp" type="range" min="0" max="1.5" step="0.1" value="' + (+p.temperature) + '" /></label>' +
      '<label class="fld"><span>最大 tokens</span><input id="ai-maxt" type="number" min="1" max="32000" value="' + p.maxTokens + '" /></label>' +
      '</div>' +
      '<div class="ai-headers"><h3>自定义请求头 <small>（如 HTTP-Referer、X-Title、组织 ID；会覆盖同名默认头）</small></h3><div id="ai-hdr-rows">' + p.headers.map(hdrRow).join('') + '</div><button type="button" class="btn btn-sm" id="ai-hdr-add">+ 添加请求头</button></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary btn-sm" id="ai-save">' + I('download') + '保存</button><button type="button" class="btn btn-sm" id="ai-test">' + I('target') + '测试连接</button><button type="button" class="btn btn-sm" id="ai-fetch">' + I('list') + '获取模型</button><button type="button" class="btn btn-sm btn-danger" id="ai-forget">' + I('lock') + '清除此 Key</button><button type="button" class="btn btn-sm btn-ghost" id="ai-cancel">取消</button></div>' +
      '<div id="ai-test-out" class="ai-test-out" aria-live="polite"></div></section>';
  }
  function hdrRow(h) { return '<div class="hdr-row"><input class="hdr-k" placeholder="Header 名" value="' + esc(h.k) + '" spellcheck="false" /><input class="hdr-v" placeholder="值" value="' + esc(h.v) + '" spellcheck="false" /><button type="button" class="btn btn-sm btn-ghost hdr-del" aria-label="删除此请求头">×</button></div>'; }

  function renderSettings(root) {
    var c = load(); save(c);
    var html = '<section class="block"><h2 class="block-title">' + I('sparkle') + 'AI 模式</h2><div class="ai-modes" role="radiogroup" aria-label="AI 模式">' +
      '<label class="ai-mode glass' + (c.mode !== 'custom' ? ' on' : '') + '"><input type="radio" name="ai-mode" value="grok"' + (c.mode !== 'custom' ? ' checked' : '') + ' /><span class="card-ico card-ico-lg">' + I('lighthouse') + '</span><span><b>Grok Bot（默认，推荐）</b><small>不用配置任何东西</small></span></label>' +
      '<label class="ai-mode glass' + (c.mode === 'custom' ? ' on' : '') + '"><input type="radio" name="ai-mode" value="custom"' + (c.mode === 'custom' ? ' checked' : '') + ' /><span class="card-ico card-ico-lg">' + I('gear') + '</span><span><b>自定义 · 我的服务商</b><small>OpenAI 兼容 / Anthropic / Ollama 本地，数量不限</small></span></label></div></section>';
    if (c.mode !== 'custom') {
      html += '<section class="block glass tool-card" id="ai-grok"><h2 class="block-title">' + I('lighthouse') + 'Grok Bot 模式在做什么</h2>' +
        '<div class="ai-agents"><div class="ai-agent"><span class="card-ico">' + I('trophy') + '</span><div><b>赚钱榜雷达</b><p>每天在后台搜集公开、合法的赚钱与薅羊毛渠道，核对官方来源后发布到 <a href="#war-rank">每日赚钱榜</a>，并更新 daily.json。</p></div></div>' +
        '<div class="ai-agent"><span class="card-ico">' + I('kit') + '</span><div><b>赚钱项目实施官</b><p>帮你把选中的方案落地：拆步骤、写页面文案、分析选词、复盘数据。需要时直接在 Grok Bot 聊天里找它。</p></div></div></div>' +
        '<p class="hint">两个 agent 都在后台工作，这里<b>没有需要配置的内容</b>。网页上的 AI 按钮会提示你去聊天里提问。' + (c.providers.length ? '你保存的 ' + c.providers.length + ' 个自定义服务商仍保留，切回自定义即可使用。' : '') + '</p></section>';
    } else {
      var ed = null, isNew = false;
      if (editing && editing.indexOf('new:') === 0) { isNew = true; ed = blankProvider(TEMPLATES.filter(function (t) { return t.id === editing.slice(4); })[0]); }
      else if (editing) ed = c.providers.filter(function (p) { return p.id === editing; })[0] || null;
      html += '<div class="ai-warn" role="note"><b>安全提醒</b>：API Key 以明文保存在<b>当前浏览器</b>（独立存储 gefei-quest-ai-v1，不会写入进度存档，也不会随「导出存档」或「导出服务商」带走）。请求直接从你的浏览器发往服务商，不经过本站。建议使用设置了额度上限的 Key；公共或他人电脑用完请点「忘记全部 Key」。</div>' +
        '<section class="block glass tool-card" id="ai-custom"><h2 class="block-title">' + I('list') + '我的服务商 <small>' + c.providers.length + ' 个</small></h2>' +
        '<div class="ai-new"><label class="fld"><span>从模板新建</span><select id="ai-template">' + TEMPLATES.map(function (t) { return '<option value="' + t.id + '">' + esc(t.label) + '</option>'; }).join('') + '</select></label><button type="button" class="btn btn-primary btn-sm" id="ai-new">+ 新建服务商</button></div>' +
        (c.providers.length ? '<ul class="prov-list">' + c.providers.map(function (p) { return providerCard(p, c); }).join('') + '</ul>' : '<div class="empty-illo">' + global.QuestIcons.illo('list') + '<p><b>还没有服务商</b><br>选一个模板，点「新建服务商」，填 Key 后测试连接。</p></div>') +
        '<div class="tool-actions ai-io"><button type="button" class="btn btn-sm" id="ai-export">' + I('download') + '导出服务商（不含 Key）</button><label class="btn btn-sm" for="ai-import">' + I('file') + '导入服务商 JSON</label><input type="file" id="ai-import" accept="application/json,.json" hidden /><button type="button" class="btn btn-sm btn-danger" id="ai-forget-all">' + I('lock') + '忘记全部 Key</button></div>' +
        '<div id="ai-io-out" aria-live="polite"></div></section>' +
        (ed ? editor(ed, isNew) : '') +
        '<p class="hint">当前服务商会用于 <a href="#war-keywords">选词练习板</a>、<a href="#war-rank">每日赚钱榜</a>、<a href="#war-kit">站一实操助手</a> 的 AI 按钮（那里也能快速切换）。回答为中文、只给合法建议、不承诺收益。</p>';
    }
    html += '<p class="tool-privacy">' + I('lock') + 'AI 设置存于独立的本地存储（gefei-quest-ai-v1），与学习进度分开。</p>';
    root.innerHTML = html;
    if (global.QuestNav) global.QuestNav.fixLinks(root);
    var $ = function (s) { return root.querySelector(s); }, rerender = function () { renderSettings(root); };
    root.querySelectorAll('[name=ai-mode]').forEach(function (r) { r.addEventListener('change', function () { var x = load(); x.mode = r.value; save(x); editing = null; rerender(); }); });
    if (c.mode !== 'custom') return;
    function io(cls, msg) { $('#ai-io-out').innerHTML = '<p class="' + cls + '">' + msg + '</p>'; }
    function scrollPastNav(e) { if (!e) return; if (global.QuestShell && QuestShell.scrollToEl) QuestShell.scrollToEl(e, 'auto'); else e.scrollIntoView({ block: 'start' }); }
    $('#ai-new').addEventListener('click', function () { editing = 'new:' + $('#ai-template').value; rerender(); var e = $('#ai-editor'); if (e) { scrollPastNav(e); $('#ai-name').focus(); } });
    root.querySelectorAll('[name=ai-active]').forEach(function (r) { r.addEventListener('change', function () { var x = load(); x.activeId = r.value; save(x); rerender(); }); });
    root.querySelectorAll('.prov [data-pact]').forEach(function (b) {
      b.addEventListener('click', function () {
        var li = b.closest('.prov'), id = li.getAttribute('data-prov'), x = load(), p = x.providers.filter(function (q) { return q.id === id; })[0], act = b.getAttribute('data-pact');
        if (!p) return;
        if (act === 'edit') { editing = id; rerender(); var e = $('#ai-editor'); scrollPastNav(e); return; }
        if (act === 'dup') { var d = normProvider(JSON.parse(JSON.stringify(p))); d.id = uid(); d.name = (p.name + ' 副本').slice(0, 60); x.providers.splice(x.providers.indexOf(p) + 1, 0, d); save(x); rerender(); return; }
        if (act === 'del') { if (global.confirm && !global.confirm('删除服务商「' + p.name + '」？其 Key 也会一并删除。')) return; x.providers.splice(x.providers.indexOf(p), 1); if (x.activeId === id) x.activeId = x.providers[0] ? x.providers[0].id : null; if (editing === id) editing = null; save(x); rerender(); return; }
        if (act === 'test') {
          var out = li.querySelector('.prov-test'); out.innerHTML = '<p class="hint">正在测试…</p>'; var t0 = Date.now();
          test(p).then(function (txt) { out.innerHTML = '<p class="ai-ok">连接成功（' + (Date.now() - t0) + ' ms）：' + esc(String(txt).slice(0, 40)) + '</p>'; }, function (e) { out.innerHTML = '<p class="ai-error">' + esc(e.message) + '</p>'; });
        }
      });
    });
    $('#ai-export').addEventListener('click', function () {
      var text = exportJson(), blob = new Blob([text], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'gefei-quest-ai-providers.json'; global.__lastAiExport = text; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      io('ai-ok', '已导出 ' + load().providers.length + ' 个服务商（不含任何 Key）。');
    });
    $('#ai-import').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      f.text().then(function (t) { var x = load(); var n = importJson(t, x); save(x); rerender(); var o = root.querySelector('#ai-io-out'); if (o) o.innerHTML = '<p class="ai-ok">已导入 ' + n + ' 个服务商。导入的服务商不含 Key，请逐个编辑补填。</p>'; })
        .catch(function (e) { io('ai-error', '导入失败：' + esc(e.message)); });
    });
    $('#ai-forget-all').addEventListener('click', function () { var x = load(); x.providers.forEach(function (p) { p.apiKey = ''; }); x.apiKey = ''; save(x); rerender(); var o = root.querySelector('#ai-io-out'); if (o) o.innerHTML = '<p class="ai-ok">所有服务商的 API Key 已从本浏览器删除。</p>'; });

    var edEl = $('#ai-editor'); if (!edEl) return;
    $('#ai-temp').addEventListener('input', function () { $('#ai-temp-v').textContent = (+this.value).toFixed(1); });
    $('#ai-format').addEventListener('change', function () { if (this.value === 'ollama' && !$('#ai-base').value) $('#ai-base').value = 'http://localhost:11434'; if (this.value === 'anthropic' && !$('#ai-base').value) $('#ai-base').value = 'https://api.anthropic.com'; });
    $('#ai-hdr-add').addEventListener('click', function () { $('#ai-hdr-rows').insertAdjacentHTML('beforeend', hdrRow({ k: '', v: '' })); });
    edEl.addEventListener('click', function (e) { var d = e.target.closest('.hdr-del'); if (d) d.closest('.hdr-row').remove(); });
    function collect() {
      var base0 = isNew ? ed : ed;
      var models = $('#ai-models').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean), model = $('#ai-model').value.trim();
      if (model && models.indexOf(model) < 0) models.unshift(model);
      return normProvider({ id: base0.id, template: base0.template, name: $('#ai-name').value.trim() || '未命名服务商', format: $('#ai-format').value, baseUrl: $('#ai-base').value.trim(), apiKey: $('#ai-key').value.trim(), model: model, models: models,
        headers: [].slice.call(edEl.querySelectorAll('.hdr-row')).map(function (r) { return { k: r.querySelector('.hdr-k').value.trim(), v: r.querySelector('.hdr-v').value }; }).filter(function (h) { return h.k; }),
        temperature: +$('#ai-temp').value, maxTokens: +$('#ai-maxt').value });
    }
    function out(cls, html) { $('#ai-test-out').innerHTML = '<p class="' + cls + '">' + html + '</p>'; }
    $('#ai-cancel').addEventListener('click', function () { editing = null; rerender(); });
    $('#ai-save').addEventListener('click', function () {
      var p = collect(), x = load(), i = -1;
      x.providers.forEach(function (q, k) { if (q.id === p.id) i = k; });
      if (i >= 0) x.providers[i] = p; else x.providers.push(p);
      if (!x.activeId || x.providers.length === 1) x.activeId = p.id;
      save(x); editing = null; rerender();
      var o = root.querySelector('#ai-io-out'); if (o) o.innerHTML = '<p class="' + (p.baseUrl && p.model ? 'ai-ok' : 'ai-error') + '">' + (p.baseUrl && p.model ? '已保存「' + esc(p.name) + '」。' : '已保存，但还需要填写 Base URL 和模型名才能使用。') + '</p>';
    });
    $('#ai-test').addEventListener('click', function () {
      var p = collect();
      if (!p.baseUrl || !p.model) { out('ai-error', '请先填写 Base URL 和模型名。'); return; }
      out('hint', '正在测试…'); var t0 = Date.now();
      test(p).then(function (txt) { out('ai-ok', '连接成功（' + (Date.now() - t0) + ' ms），模型回复：' + esc(String(txt).slice(0, 40)) + '。记得点「保存」。'); }, function (e) { out('ai-error', esc(e.message)); });
    });
    $('#ai-fetch').addEventListener('click', function () {
      var p = collect(); if (!p.baseUrl) { out('ai-error', '请先填写 Base URL。'); return; }
      out('hint', '正在获取模型列表…');
      fetchModels(p).then(function (list) {
        $('#ai-models').value = list.join('\n');
        $('#ai-model-list').innerHTML = list.map(function (m) { return '<option value="' + esc(m) + '">'; }).join('');
        if (!$('#ai-model').value) $('#ai-model').value = list[0];
        out('ai-ok', '获取到 ' + list.length + ' 个模型，已填入模型列表。');
      }, function (e) { out('ai-error', esc(e.message)); });
    });
    $('#ai-forget').addEventListener('click', function () { $('#ai-key').value = ''; var x = load(); x.providers.forEach(function (q) { if (q.id === ed.id) q.apiKey = ''; }); save(x); out('ai-ok', '此服务商的 Key 已清除。'); });
  }

  function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('change', function (e) {
      var s = e.target.closest && e.target.closest('[data-ai-switch]'); if (!s) return;
      var x = load(); x.activeId = s.value; save(x);
      document.querySelectorAll('[data-ai-switch]').forEach(function (o) { o.value = s.value; });
      if (global.QuestModal) global.QuestModal.showToast('AI 服务商已切换');
    });
    var war = document.getElementById('panel-war');
    if (war && global.MutationObserver) new MutationObserver(function () { decorate(war); }).observe(war, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  global.QuestAI = { KEY: KEY, PRESETS: PRESETS, TEMPLATES: TEMPLATES, FORMATS: FORMATS, SYSTEM: SYSTEM, load: load, save: save, active: active, ready: ready, chat: chat, test: test, fetchModels: fetchModels,
    exportJson: exportJson, importJson: importJson, md: md, run: run, decorate: decorate, renderSettings: renderSettings, endpoint: endpoint, modelsUrl: modelsUrl, headersFor: headersFor };
})(typeof window !== 'undefined' ? window : globalThis);
