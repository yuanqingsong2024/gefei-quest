/** Phase 16 · 实操工作台：账号中心 #me-accounts · 发布上线 #war-publish · 数据导入与分析 #me-analytics · 流水线条
 *  凭据只存 localStorage 独立键 gefei-quest-accounts-v1（不进存档导出）；导入数据与发布记录存存档追加字段 imports / publish。 */
(function (global) {
  var KEY = 'gefei-quest-accounts-v1';
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function uid() { return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function toast(t) { if (global.QuestModal) global.QuestModal.showToast(t); }

  /* ---------- 平台矩阵（与 docs/PHASE16-WORKBENCH.md 一致） ---------- */
  var FREE = { prefill: '免费：官方链接预填文字', url: '免费：预填链接 + 复制文字', copy: '免费：复制后打开发布页' };
  var CLS = { A: '浏览器直接发布', B: '需自建小后端', C: 'API 拉数据', D: '导入 CSV / 手动' };
  var PLATFORMS = [
    { id: 'github', name: 'GitHub / GitHub Pages', cls: 'A', icon: 'code', how: '用细粒度 Token（只授权一个仓库：Contents、Pages、Administration 读写）直接从浏览器写文件并开启 Pages。', act: '#war-publish', actLabel: '去发布' },
    { id: 'wordpress', name: 'WordPress（自托管）', cls: 'A', icon: 'file', how: '自托管站点开启 REST API + 应用密码，并允许本站跨域后可直接发布（计划中）。' },
    { id: 'gsc', name: 'Google Search Console', cls: 'C', icon: 'search', how: '现在：在 GSC「效果」点「导出 → CSV」，导入下方导入中心。Phase C：用你自己的 Google Cloud OAuth Client ID 自动拉取。', act: '#me-analytics', actLabel: '导入 CSV' },
    { id: 'ga4', name: 'Google Analytics 4', cls: 'C', icon: 'chart', how: 'Phase C：GA4 Data API（OAuth 只读）。现在可导出 CSV 作为通用数据导入。', act: '#me-analytics', actLabel: '导入 CSV' },
    { id: 'adsense', name: 'Google AdSense', cls: 'C', icon: 'coin', how: '现在：报告页「下载 CSV」后导入。Phase C：AdSense Management API 只读拉取。', act: '#me-analytics', actLabel: '导入 CSV' },
    { id: 'youtube', name: 'YouTube', cls: 'C', icon: 'rocket', how: 'Analytics API 可拉数据；视频上传需 API 审核（未审核项目上传为私享），暂不做。', free: 'copy' },
    { id: 'cloudflare', name: 'Cloudflare Pages', cls: 'B', icon: 'globe', how: 'Cloudflare API 不支持浏览器跨域，需要你部署仓库 worker/ 模板作为代理（Phase B）。' },
    { id: 'x', name: 'X', cls: 'D', icon: 'sparkle', how: 'API 发帖按次付费——已按你的决定放弃自动发帖。用内容分发页生成 ≤280 字/串推，官方 intent 链接预填后由你确认发布。', free: 'prefill' },
    { id: 'reddit', name: 'Reddit', cls: 'D', icon: 'globe', how: '官方 submit 链接预填标题和网址，正文自动复制后粘贴。', free: 'url' },
    { id: 'linkedin', name: 'LinkedIn', cls: 'D', icon: 'users', how: '官方 share-offsite 链接预填网址，文字自动复制后粘贴。', free: 'url' },
    { id: 'facebook', name: 'Facebook', cls: 'D', icon: 'users', how: '官方 sharer 链接预填网址，文字自动复制后粘贴。', free: 'url' },
    { id: 'pinterest', name: 'Pinterest', cls: 'B', icon: 'tag', how: 'API 需开发者审批（Phase B，可选）。免费路径：官方 Pin It 链接预填网址和描述。', free: 'prefill' },
    { id: 'medium', name: 'Medium', cls: 'D', icon: 'book', how: '官方已不再发放新 API token，只能手动发布或用 Medium 的「导入网页」。', free: 'copy' },
    { id: 'wechat', name: '微信公众号', cls: 'D', icon: 'file', how: '2025-07 起个人主体与未认证账号被回收发布接口权限；在公众平台「数据分析」导出后导入通用 CSV。', free: 'copy' },
    { id: 'xhs', name: '小红书', cls: 'D', icon: 'star', how: '无个人发布/数据 API。在专业号数据中心导出或手抄，导入通用 CSV。', act: '#me-analytics', actLabel: '导入 CSV', free: 'copy' },
    { id: 'douyin', name: '抖音', cls: 'D', icon: 'fire', how: '发布能力仅对符合条件的企业应用开放。创作者中心数据可导出后导入通用 CSV。', act: '#me-analytics', actLabel: '导入 CSV', free: 'copy' },
    { id: 'bilibili', name: 'B 站', cls: 'D', icon: 'island3', how: '开放平台需开发者认证审核。创作中心数据导出后导入通用 CSV。', act: '#me-analytics', actLabel: '导入 CSV', free: 'copy' },
    { id: 'toutiao', name: '头条号', cls: 'D', icon: 'file', how: '个人无公开 API，导出/手抄后导入。', free: 'copy' },
    { id: 'weibo', name: '微博', cls: 'D', icon: 'users', how: '开放平台需应用审核；个人建议导出数据后导入。', free: 'prefill' },
    { id: 'xianyu', name: '闲鱼', cls: 'D', icon: 'fish', how: '无个人 API，订单收入可手动记入台账。' },
  ];

  /* ---------- 凭据 ---------- */
  function load() {
    var c = {}; try { c = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
    c.github = Object.assign({ token: '', base: 'https://api.github.com', login: '', owner: '', repo: '', branch: 'main', dir: '', createRepo: true, enablePages: true }, c.github || {});
    c.worker = Object.assign({ url: '' }, c.worker || {});
    return c;
  }
  function saveCfg(c) { localStorage.setItem(KEY, JSON.stringify(c)); }
  function ensure(state) {
    if (!Array.isArray(state.publish)) state.publish = [];
    if (!Array.isArray(state.imports)) state.imports = [];
    return state;
  }

  /* ---------- 流水线条 ---------- */
  function pipeline(state, active) {
    ensure(state);
    var kw = state.keywords && state.keywords.items || [], kit = state.kit || {}, sites = state.sites && state.sites.items || [];
    var steps = [
      ['keywords', '选词', 'tag', '#war-keywords', kw.length > 0 || !!kit.keyword],
      ['kit', '实操助手', 'kit', '#war-kit', !!(kit.keyword && kit.intro)],
      ['publish', '发布上线', 'rocket', '#war-publish', state.publish.some(function (p) { return p.ok && !p.dry; })],
      ['share', '内容分发', 'external', '#war-share', Array.isArray(state.shares) && state.shares.length > 0],
      ['analytics', '数据', 'chart', '#me-analytics', state.imports.length > 0 || sites.some(function (s) { return (s.logs || []).length > 0; })],
      ['review', '复盘', 'bulb', '#work-review', Array.isArray(state.reviews) && state.reviews.length > 0],
    ];
    if (active === 'sites') active = 'analytics';
    return '<nav class="wb-pipe" aria-label="实操流水线"><a class="wb-pipe-home" href="#work" title="工作台">' + I('target') + '<span>工作台</span></a>' + steps.map(function (s, i) {
      return (i ? '<span class="wb-pipe-arrow" aria-hidden="true">→</span>' : '') + '<a href="' + s[3] + '" class="wb-step' + (s[4] ? ' done' : '') + (active === s[0] ? ' on' : '') + '" data-step="' + s[0] + '">' + I(s[2]) + '<span>' + s[1] + '</span>' + (s[4] ? '<i aria-label="已完成">✓</i>' : '') + '</a>';
    }).join('') + '</nav>';
  }

  /* ---------- 账号中心 ---------- */
  function renderAccounts(state, root, ctx) {
    var c = load(), gh = c.github;
    var status = function (p) {
      if (global.QuestGoogle && (p.id === 'gsc' || p.id === 'ga4' || p.id === 'adsense')) { var api = (state.imports || []).filter(function (x) { return x.via === 'api' && x.platform === p.id; }).length; if (global.QuestGoogle.token()) return '<span class="wb-st ok">Google 已授权' + (api ? ' · API 数据 ' + api + ' 份' : '') + '</span>'; }
      if (p.id === 'github') return gh.token ? (gh.login ? '<span class="wb-st ok">已连接 · ' + esc(gh.login) + '</span>' : '<span class="wb-st warn">已填 Token，未校验</span>') : '<span class="wb-st">未连接</span>';
      var shn = (state.shares || []).filter(function (x) { return x.platform === p.id; }).length;
      if (shn) return '<span class="wb-st ok">已分发 ' + shn + ' 次</span>';
      if (p.cls === 'D' || p.cls === 'C') { var n = (state.imports || []).filter(function (x) { return x.platform === p.id; }).length; return n ? '<span class="wb-st ok">已导入 ' + n + ' 份</span>' : '<span class="wb-st">未导入</span>'; }
      return '<span class="wb-st">' + (p.cls === 'B' ? '需 Phase B 后端' : '计划中') + '</span>';
    };
    root.innerHTML = '<div class="tool-wrap wb">' + pipeline(state, '') +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('user') + '账号中心</h2><p class="hint">按官方接口能力分 4 类。只用官方 API 和官方导出文件，不爬虫、不模拟登录。Token 只存在这台浏览器的独立键里，不进存档导出，可一键忘记。</p>' +
      '<div class="wb-legend">' + Object.keys(CLS).map(function (k) { return '<span class="wb-cls wb-cls-' + k + '">' + k + '</span>' + CLS[k]; }).join('') + '</div></section>' +
      '<section class="block glass tool-card" id="gh-connect" data-tab="GitHub 连接"><h2 class="block-title">' + I('code') + 'GitHub 连接</h2>' +
      '<p class="hint">在 GitHub「Settings → Developer settings → Fine-grained tokens」新建 Token：只选你要发布的仓库，权限 Contents、Pages、Administration 设为 Read and write（新建仓库需 Administration）。</p>' +
      '<form id="gh-form" class="form-grid" autocomplete="off"><label class="fld fld-wide"><span>Fine-grained Token</span><input type="password" id="gh-token" placeholder="github_pat_…" value="' + esc(gh.token) + '" /></label>' +
      '<label class="fld fld-wide"><span>API 地址（高级，默认 api.github.com）</span><input id="gh-base" value="' + esc(gh.base) + '" /></label>' +
      '<div class="tool-actions fld-wide"><button type="submit" class="btn btn-primary btn-sm">' + I('lock') + '保存并校验</button><button type="button" class="btn btn-sm btn-danger" id="gh-forget">忘记 Token</button></div></form><p id="gh-msg" class="hint" role="status"></p></section>' +
      (global.QuestGoogle ? global.QuestGoogle.section(state) : '') +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('globe') + '平台列表</h2><div class="wb-plats">' + PLATFORMS.map(function (p) {
        return '<article class="wb-plat" data-plat="' + p.id + '"><header><span class="card-ico">' + I(p.icon) + '</span><b>' + esc(p.name) + '</b><span class="wb-cls wb-cls-' + p.cls + '" title="' + CLS[p.cls] + '">' + p.cls + '</span></header>' + status(p) + (p.free ? '<a class="wb-free" href="#war-share">' + I('external') + FREE[p.free] + '</a>' : '') + '<p>' + esc(p.how) + '</p>' + (p.act ? '<a class="btn btn-sm" href="' + p.act + '">' + esc(p.actLabel) + '</a>' : '') + '</article>';
      }).join('') + '</div></section>' +
      '<section class="block glass tool-card cx-fold"><h2 class="block-title">' + I('gear') + 'Phase B / C 需要你准备</h2><ul class="wb-need"><li><b>Phase B</b>：一个 Cloudflare 账号（免费档），按仓库 <code>worker/README.md</code> 部署代理，把 Worker 地址填到这里；Pinterest API 需开发者审批（可选）。X 付费 API 已从计划移除，改用免费的内容分发。</li><li><b>Phase C</b>：一个 Google Cloud 项目 + OAuth 客户端 ID（Web 应用，授权 JavaScript 来源填本站地址），开启 Search Console / GA4 Data / AdSense Management API。</li></ul>' +
      '<label class="fld"><span>Worker 地址（Phase B，可先留空）</span><input id="wk-url" placeholder="https://xxx.workers.dev" value="' + esc(c.worker.url) + '" /></label></section></div>';
    var msg = root.querySelector('#gh-msg');
    root.querySelector('#gh-form').addEventListener('submit', function (e) {
      e.preventDefault(); var cc = load();
      cc.github.token = root.querySelector('#gh-token').value.trim(); cc.github.base = (root.querySelector('#gh-base').value.trim() || 'https://api.github.com').replace(/\/+$/, ''); cc.github.login = '';
      saveCfg(cc); msg.textContent = '校验中…';
      gh_api(cc.github, 'GET', '/user').then(function (r) {
        if (!r.ok) throw new Error(explain(r));
        var c2 = load(); c2.github.login = r.json.login; if (!c2.github.owner) c2.github.owner = r.json.login; saveCfg(c2);
        renderAccounts(state, root, ctx); root.querySelector('#gh-msg').textContent = '已连接：' + r.json.login;
      }).catch(function (err) { msg.textContent = '校验失败：' + err.message; });
    });
    root.querySelector('#gh-forget').addEventListener('click', function () { var cc = load(); cc.github.token = ''; cc.github.login = ''; saveCfg(cc); renderAccounts(state, root, ctx); toast('已忘记 GitHub Token'); });
    if (global.QuestGoogle) global.QuestGoogle.bind(state, root, ctx, function () { renderAccounts(state, root, ctx); });
    root.querySelector('#wk-url').addEventListener('change', function (e) { var cc = load(); cc.worker.url = e.target.value.trim(); saveCfg(cc); });
  }

  /* ---------- GitHub API ---------- */
  function gh_api(g, method, path, body) {
    return fetch(g.base.replace(/\/+$/, '') + path, { method: method, headers: { Authorization: 'Bearer ' + g.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function (res) { return res.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (_) {} return { ok: res.ok, status: res.status, json: j }; }); }, function () { throw new Error('网络错误或被浏览器拦截（检查 API 地址）'); });
  }
  function explain(r) {
    var m = r.json && r.json.message ? r.json.message : '';
    if (r.status === 401) return 'Token 无效或已过期（HTTP 401）';
    if (r.status === 403) return '权限不足：检查 Token 是否授权该仓库及 Contents/Pages 读写（HTTP 403）' + (m ? ' · ' + m : '');
    if (r.status === 404) return '找不到（HTTP 404）：仓库不存在或 Token 未授权该仓库';
    if (r.status === 422) return '请求被拒绝（HTTP 422）' + (m ? ' · ' + m : '');
    return 'HTTP ' + r.status + (m ? ' · ' + m : '');
  }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function unb64(s) { try { return decodeURIComponent(escape(atob(String(s || '').replace(/\s/g, '')))); } catch (_) { return null; } }
  function encPath(p) { return p.split('/').map(encodeURIComponent).join('/'); }

  /** 计划：查询仓库、每个文件、Pages 状态；dry=true 时不写入 */
  function publish(g, files, opts) {
    opts = opts || {}; var log = opts.onLog || function () {};
    var o = g.owner, r = g.repo, br = g.branch || 'main', dir = (g.dir || '').replace(/^\/+|\/+$/g, '');
    var plan = { repoExists: false, created: false, files: [], pages: null, url: '' };
    return gh_api(g, 'GET', '/repos/' + o + '/' + r).then(function (res) {
      if (res.ok) { plan.repoExists = true; br = g.branch || res.json.default_branch || 'main'; return; }
      if (res.status !== 404) throw new Error(explain(res));
      if (!g.createRepo) throw new Error('仓库 ' + o + '/' + r + ' 不存在。勾选「仓库不存在时自动新建」或先在 GitHub 新建。');
      if (opts.dry) { log('将新建公开仓库 ' + o + '/' + r); return; }
      var isUser = o === g.login;
      return gh_api(g, 'POST', isUser ? '/user/repos' : '/orgs/' + o + '/repos', { name: r, description: 'Built with 出海小站练站营', auto_init: true, private: false }).then(function (cr) {
        if (!cr.ok) throw new Error('新建仓库失败：' + explain(cr)); plan.created = true; br = (cr.json && cr.json.default_branch) || br; log('已新建仓库 ' + o + '/' + r);
      });
    }).then(function () {
      return files.reduce(function (p, f) {
        return p.then(function () {
          var path = (dir ? dir + '/' : '') + f.name;
          var get = plan.repoExists || plan.created ? gh_api(g, 'GET', '/repos/' + o + '/' + r + '/contents/' + encPath(path) + '?ref=' + encodeURIComponent(br)) : Promise.resolve({ ok: false, status: 404 });
          return get.then(function (cur) {
            var sha = cur.ok && cur.json ? cur.json.sha : null, old = cur.ok && cur.json ? unb64(cur.json.content) : null;
            var action = !sha ? 'create' : old === f.text ? 'same' : 'update';
            var item = { path: path, action: action, bytes: new Blob([f.text]).size };
            plan.files.push(item);
            if (opts.dry || action === 'same') return;
            return gh_api(g, 'PUT', '/repos/' + o + '/' + r + '/contents/' + encPath(path), Object.assign({ message: (action === 'create' ? 'Add ' : 'Update ') + path + ' via 练站营', content: b64(f.text), branch: br }, sha ? { sha: sha } : {})).then(function (w) {
              if (!w.ok) throw new Error('写入 ' + path + ' 失败：' + explain(w)); item.done = true; log((action === 'create' ? '已新建 ' : '已更新 ') + path);
            });
          });
        });
      }, Promise.resolve());
    }).then(function () {
      if (!g.enablePages) return;
      var chk = plan.repoExists || plan.created ? gh_api(g, 'GET', '/repos/' + o + '/' + r + '/pages') : Promise.resolve({ ok: false, status: 404 });
      return chk.then(function (pg) {
        if (pg.ok) { plan.pages = 'exists'; plan.url = pg.json.html_url || ''; return; }
        plan.pages = 'enable'; if (opts.dry) return;
        return gh_api(g, 'POST', '/repos/' + o + '/' + r + '/pages', { source: { branch: br, path: dir ? '/' + dir.split('/')[0] === '/docs' ? '/docs' : '/' : '/' } }).then(function (en) {
          if (!en.ok && en.status !== 409) throw new Error('开启 Pages 失败：' + explain(en));
          plan.pages = 'enabled'; plan.url = (en.json && en.json.html_url) || ''; log('已开启 GitHub Pages');
        });
      });
    }).then(function () {
      if (!plan.url) plan.url = 'https://' + o.toLowerCase() + '.github.io/' + r + '/' + (dir && dir !== 'docs' ? dir + '/' : '');
      plan.branch = br; return plan;
    });
  }

  function renderPublish(state, root, ctx) {
    ensure(state);
    var c = load(), g = c.github, T = global.QuestTools, kit = state.kit || {};
    var ready = !!(kit.keyword && kit.intro), files = ready ? T.files(kit) : [], slug = ready ? T.gen(kit).slug : '';
    if (!g.repo && slug) g.repo = slug;
    var hist = state.publish.slice(-5).reverse();
    root.innerHTML = '<div class="tool-wrap wb">' + pipeline(state, 'publish') +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('rocket') + '发布上线：把实操助手生成的站点写进你的 GitHub 仓库</h2>' +
      (!ready ? '<div class="tool-empty"><p>先到 <a href="#war-kit">站一实操助手</a> 填主词和一句话介绍，生成页面后再来发布。</p></div>' :
        '<p class="hint">将发布 ' + files.length + ' 个文件：' + files.map(function (f) { return '<code>' + esc(f.name) + '</code>'; }).join(' ') + '（来自主词「' + esc(kit.keyword) + '」）。</p>') +
      (!g.token ? '<div class="tool-empty"><p>' + I('lock') + '还没连接 GitHub。到 <a href="#me-accounts">账号中心</a> 填 Fine-grained Token。</p></div>' : '<p class="hint">已连接：<b>' + esc(g.login || '（未校验）') + '</b> · <a href="#me-accounts">管理</a></p>') +
      '<form id="pub-form" class="form-grid" autocomplete="off">' +
      '<label class="fld"><span>仓库所有者</span><input id="pub-owner" value="' + esc(g.owner || g.login) + '" placeholder="你的 GitHub 用户名" /></label>' +
      '<label class="fld"><span>仓库名</span><input id="pub-repo" value="' + esc(g.repo) + '" placeholder="pdf-merge-tool" /></label>' +
      '<label class="fld"><span>分支</span><input id="pub-branch" value="' + esc(g.branch) + '" /></label>' +
      '<label class="fld"><span>子目录（可空）</span><input id="pub-dir" value="' + esc(g.dir) + '" placeholder="留空 = 仓库根目录" /></label>' +
      '<label class="chk fld-wide"><input type="checkbox" id="pub-create"' + (g.createRepo ? ' checked' : '') + ' /> 仓库不存在时自动新建（公开仓库）</label>' +
      '<label class="chk fld-wide"><input type="checkbox" id="pub-pages"' + (g.enablePages ? ' checked' : '') + ' /> 开启 GitHub Pages（从该分支根目录）</label>' +
      '<div class="tool-actions fld-wide"><button type="button" class="btn btn-sm" id="pub-dry"' + (ready && g.token ? '' : ' disabled') + '>' + I('search') + '预览（不写入）</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="pub-go" disabled>' + I('rocket') + '确认发布</button></div></form>' +
      '<p class="hint">先预览：会列出每个文件是新建、更新还是不变，以及 Pages 状态。确认后才写入。写入使用 GitHub 官方 Contents API。</p>' +
      '<div id="pub-out" aria-live="polite"></div></section>' +
      (ready ? '<section class="block glass tool-card"><h2 class="block-title">' + I('file') + '页面预览</h2><iframe class="wb-preview" sandbox="" title="index.html 预览" srcdoc="' + esc(files[0].text) + '"></iframe></section>' : '') +
      '<section class="block glass tool-card"><h2 class="block-title">' + I('list') + '发布记录</h2>' + (hist.length ? '<ul class="wb-hist">' + hist.map(function (h) { return '<li><b>' + (h.dry ? '预览' : h.ok ? '已发布' : '失败') + '</b> ' + esc(h.repo) + ' · ' + esc(h.at.slice(0, 16).replace('T', ' ')) + (h.url && !h.dry ? ' · <a href="' + esc(h.url) + '" target="_blank" rel="noopener">' + esc(h.url) + '</a>' : '') + (h.err ? ' · ' + esc(h.err) : '') + '</li>'; }).join('') + '</ul>' : '<p class="empty-hint">还没有发布记录。</p>') + '</section></div>';
    if (!ready || !g.token) return;
    var out = root.querySelector('#pub-out'), go = root.querySelector('#pub-go');
    function read() {
      var cc = load(), x = cc.github; var v = function (id) { return root.querySelector('#pub-' + id).value.trim(); };
      x.owner = v('owner'); x.repo = v('repo').replace(/[^A-Za-z0-9._-]/g, '-'); x.branch = v('branch') || 'main'; x.dir = v('dir'); x.createRepo = root.querySelector('#pub-create').checked; x.enablePages = root.querySelector('#pub-pages').checked;
      saveCfg(cc); return x;
    }
    function record(x, plan, dry, err) {
      state.publish.push({ at: new Date().toISOString(), repo: x.owner + '/' + x.repo, dry: dry, ok: !err, url: plan && plan.url || '', files: plan ? plan.files.length : 0, err: err || '' });
      if (state.publish.length > 50) state.publish.splice(0, state.publish.length - 50);
      ctx.save();
    }
    function table(plan, dry) {
      var lab = { create: '新建', update: '更新', same: '不变' };
      return '<div class="tbl-wrap"><table class="wb-plan"><thead><tr><th>文件</th><th>操作</th><th>大小</th></tr></thead><tbody>' + plan.files.map(function (f) { return '<tr data-action="' + f.action + '"><td><code>' + esc(f.path) + '</code></td><td><span class="wb-act wb-act-' + f.action + '">' + lab[f.action] + (f.done ? ' ✓' : '') + '</span></td><td>' + f.bytes + ' B</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<p class="hint">仓库：' + (plan.repoExists ? '已存在' : dry ? '<b>将新建</b>' : '已新建') + ' · 分支 ' + esc(plan.branch) + ' · Pages：' + ({ exists: '已开启', enable: dry ? '将开启' : '开启中', enabled: '已开启' }[plan.pages] || '不处理') + ' · 预计地址 <code>' + esc(plan.url) + '</code></p>';
    }
    root.querySelector('#pub-dry').addEventListener('click', function () {
      var x = read(); if (!x.owner || !x.repo) { out.innerHTML = '<p class="ai-error">请填写仓库所有者和仓库名。</p>'; return; }
      out.innerHTML = '<p class="hint">预览中…</p>'; go.disabled = true;
      publish(x, files, { dry: true }).then(function (plan) { record(x, plan, true); out.innerHTML = '<h3 class="wb-h">预览结果（未写入）</h3>' + table(plan, true); go.disabled = false; go.dataset.repo = x.owner + '/' + x.repo; },
        function (e) { out.innerHTML = '<p class="ai-error" role="alert">' + I('lock') + esc(e.message) + '</p>'; });
    });
    go.addEventListener('click', function () {
      var x = read(); if (go.dataset.repo !== x.owner + '/' + x.repo) { out.innerHTML = '<p class="ai-error">仓库设置变了，请重新预览。</p>'; go.disabled = true; return; }
      go.disabled = true; var lines = [];
      out.innerHTML = '<p class="hint">发布中…</p><ul class="wb-log"></ul>';
      publish(x, files, { onLog: function (t) { lines.push(t); out.querySelector('.wb-log').innerHTML = lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join(''); } }).then(function (plan) {
        record(x, plan, false);
        var sites = state.sites.items, dom = plan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        var s = sites.filter(function (q) { return q.domain === dom || q.kw === kit.keyword; })[0];
        if (!s) { s = { id: uid(), logs: [], name: kit.keyword, domain: dom, kw: kit.keyword, station: '站一', launch: new Date().toISOString().slice(0, 10), status: '已上线', host: 'GitHub Pages', money: '' }; sites.push(s); }
        else { s.host = 'GitHub Pages'; if (!s.domain) s.domain = dom; if (s.status === '筹备') s.status = '已上线'; if (!s.launch) s.launch = new Date().toISOString().slice(0, 10); }
        ctx.save();
        out.innerHTML = '<h3 class="wb-h">' + I('rocket') + '发布完成</h3>' + table(plan, false) + '<p>站点地址：<a id="pub-url" href="' + esc(plan.url) + '" target="_blank" rel="noopener">' + esc(plan.url) + '</a>（Pages 首次构建通常需要 1–2 分钟）。已写入 <a href="#me-sites">站点台账</a>。</p>';
        toast('已发布到 ' + x.owner + '/' + x.repo);
      }, function (e) { record(x, null, false, e.message); out.innerHTML = '<p class="ai-error" role="alert">' + I('lock') + esc(e.message) + '</p>'; });
    });
  }

  /* ---------- CSV ---------- */
  function parseCSV(text) {
    text = String(text || '').replace(/^\ufeff/, '');
    var delim = (text.split('\n')[0].match(/\t/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? '\t' : ',';
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true; else if (ch === delim) { row.push(f); f = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row); row = []; }
      else f += ch;
    }
    row.push(f); if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
    return rows.map(function (r) { return r.map(function (x) { return x.trim(); }); });
  }
  function num(v) { if (v == null) return 0; var s = String(v).replace(/[,\s¥$US€%]/g, '').replace(/^\((.*)\)$/, '-$1'); var n = parseFloat(s); if (/万$/.test(String(v).trim())) n *= 10000; return isFinite(n) ? n : 0; }
  function normDate(v) {
    var s = String(v || '').trim(), m;
    if ((m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/))) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
    if ((m = s.match(/^(\d{4})[-/年](\d{1,2})月?$/))) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-01';
    return '';
  }
  function findCol(h, re) { for (var i = 0; i < h.length; i++) if (re.test(h[i])) return i; return -1; }
  var RE = { date: /^(date|day|日期|时间|date_time|月份|month)$|日期|date/i, clicks: /^clicks?$|点击次数|^点击$|点击量/i, imp: /impressions?|展示|曝光/i, ctr: /ctr|点击率/i, pos: /position|排名|平均排名/i, query: /quer|查询|关键词|keyword/i, page: /^(top )?pages?$|网页|页面/i, earn: /earnings|收入|收益|revenue/i, pv: /page views|网页浏览量|浏览量|pageviews/i };
  /** 识别 + 规范化。kind: gsc-dates | gsc-queries | gsc-pages | adsense | generic */
  function detect(rows, hint) {
    if (!rows.length) throw new Error('文件是空的');
    var h = rows[0], body = rows.slice(1, 5001);
    var dc = findCol(h, RE.date), cc = findCol(h, RE.clicks), ic = findCol(h, RE.imp), ec = findCol(h, RE.earn), qc = findCol(h, RE.query), pc = findCol(h, RE.page);
    var base = { cols: h };
    if (hint !== 'generic' && cc >= 0 && ic >= 0 && (qc >= 0 || pc >= 0) && dc < 0) {
      var kc = qc >= 0 ? qc : pc, ctr = findCol(h, RE.ctr), pos = findCol(h, RE.pos);
      return Object.assign(base, { kind: qc >= 0 ? 'gsc-queries' : 'gsc-pages', platform: 'gsc', rows: body.map(function (r) { return { q: r[kc], clicks: num(r[cc]), imp: num(r[ic]), ctr: ctr >= 0 ? num(r[ctr]) : 0, pos: pos >= 0 ? num(r[pos]) : 0 }; }).filter(function (r) { return r.q; }) });
    }
    if (hint !== 'generic' && dc >= 0 && cc >= 0 && ic >= 0 && ec < 0) {
      var ctr2 = findCol(h, RE.ctr), pos2 = findCol(h, RE.pos);
      return Object.assign(base, { kind: 'gsc-dates', platform: 'gsc', metrics: ['clicks', 'imp', 'ctr', 'pos'], rows: body.map(function (r) { return { d: normDate(r[dc]), v: { clicks: num(r[cc]), imp: num(r[ic]), ctr: ctr2 >= 0 ? num(r[ctr2]) : 0, pos: pos2 >= 0 ? num(r[pos2]) : 0 } }; }).filter(function (r) { return r.d; }) });
    }
    if (hint !== 'generic' && dc >= 0 && ec >= 0) {
      var pv = findCol(h, RE.pv);
      return Object.assign(base, { kind: 'adsense', platform: 'adsense', metrics: ['earn', 'pv', 'clicks', 'imp'], rows: body.map(function (r) { return { d: normDate(r[dc]), v: { earn: num(r[ec]), pv: pv >= 0 ? num(r[pv]) : 0, clicks: cc >= 0 ? num(r[cc]) : 0, imp: ic >= 0 ? num(r[ic]) : 0 } }; }).filter(function (r) { return r.d; }) });
    }
    if (dc < 0) throw new Error('没找到日期列（表头需含 日期 / Date）。');
    var mcols = h.map(function (x, i) { return i; }).filter(function (i) { return i !== dc && body.some(function (r) { return r[i] && !isNaN(num(r[i])) && /\d/.test(r[i]); }); }).slice(0, 8);
    if (!mcols.length) throw new Error('没找到数字列。');
    return Object.assign(base, { kind: 'generic', metrics: mcols.map(function (i) { return h[i]; }), rows: body.map(function (r) { var v = {}; mcols.forEach(function (i) { v[h[i]] = num(r[i]); }); return { d: normDate(r[dc]), v: v }; }).filter(function (r) { return r.d; }) });
  }
  var KIND_LABEL = { 'gsc-dates': 'GSC 效果 · 按日期', 'gsc-queries': 'GSC 效果 · 查询', 'gsc-pages': 'GSC 效果 · 网页', adsense: 'AdSense 报告', generic: '平台数据' };
  var MET_LABEL = { clicks: '点击', imp: '曝光', ctr: '点击率 %', pos: '平均排名', earn: '收入', pv: '网页浏览量' };
  var GEN_PLATS = [['xhs', '小红书'], ['douyin', '抖音'], ['bilibili', 'B 站'], ['wechat', '公众号'], ['toutiao', '头条号'], ['weibo', '微博'], ['ga4', 'GA4'], ['youtube', 'YouTube'], ['other', '其他']];
  function platName(id) { var p = PLATFORMS.filter(function (x) { return x.id === id; })[0]; if (p) return p.name; var g = GEN_PLATS.filter(function (x) { return x[0] === id; })[0]; return g ? g[1] : id; }

  function monthly(ds) { var m = {}; ds.rows.forEach(function (r) { var k = r.d.slice(0, 7); m[k] = m[k] || {}; Object.keys(r.v).forEach(function (x) { if (x === 'ctr' || x === 'pos') return; m[k][x] = (m[k][x] || 0) + r.v[x]; }); }); return m; }
  function syncToSite(state, ds, siteId) {
    var s = state.sites.items.filter(function (x) { return x.id === siteId; })[0]; if (!s || (ds.kind !== 'gsc-dates' && ds.kind !== 'adsense')) return 0;
    var m = monthly(ds), n = 0;
    Object.keys(m).forEach(function (k) {
      var l = (s.logs = s.logs || []).filter(function (x) { return x.month === k; })[0];
      if (!l) { l = { month: k, imp: 0, clicks: 0, usd: 0, cny: 0, note: '' }; s.logs.push(l); }
      if (ds.kind === 'gsc-dates') { l.imp = Math.round(m[k].imp || 0); l.clicks = Math.round(m[k].clicks || 0); }
      else l.usd = Math.round((m[k].earn || 0) * 100) / 100;
      l.note = (l.note && l.note.indexOf('导入') >= 0 ? l.note : ((l.note ? l.note + ' · ' : '') + '导入 ' + KIND_LABEL[ds.kind])); n++;
    });
    s.logs.sort(function (a, b) { return a.month < b.month ? -1 : 1; });
    return n;
  }

  /* ---------- 分析 ---------- */
  function lineChart(rows, keys) {
    var L = rows.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; }); if (!L.length) return '';
    var W = 600, H = 200, P = 32, n = L.length;
    function x(i) { return n === 1 ? W / 2 : P + i * (W - 2 * P) / (n - 1); }
    var cls = ['c-click', 'c-inc', 'c-third'];
    var lines = keys.slice(0, 3).map(function (k, j) {
      var vals = L.map(function (r) { return r.v[k] || 0; }), max = Math.max.apply(null, vals.concat([1e-9]));
      return '<polyline class="' + cls[j] + '" points="' + vals.map(function (v, i) { return x(i).toFixed(1) + ',' + (H - P - v / max * (H - 2 * P)).toFixed(1); }).join(' ') + '"/>';
    }).join('');
    var step = Math.max(1, Math.ceil(n / 6));
    return '<figure class="site-chart wb-chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="趋势图"><line class="ax" x1="' + P + '" y1="' + (H - P) + '" x2="' + (W - P) + '" y2="' + (H - P) + '"/>' + lines +
      L.map(function (r, i) { return i % step ? '' : '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(r.d.slice(5)) + '</text>'; }).join('') + '</svg><figcaption>' +
      keys.slice(0, 3).map(function (k, j) { return '<span class="lg lg-' + ['click', 'inc', 'third'][j] + '"></span>' + esc(MET_LABEL[k] || k) + '（各自归一化）'; }).join(' ') + '</figcaption></figure>';
  }
  function fmt(v) { return Math.abs(v) >= 100 ? Math.round(v).toLocaleString() : (Math.round(v * 100) / 100).toString(); }
  function summarize(ds) {
    if (/gsc-(queries|pages)/.test(ds.kind)) {
      var t = ds.rows.reduce(function (a, r) { a.clicks += r.clicks; a.imp += r.imp; return a; }, { clicks: 0, imp: 0 });
      var top = ds.rows.slice().sort(function (a, b) { return b.clicks - a.clicks || b.imp - a.imp; }).slice(0, 15);
      var opp = ds.rows.filter(function (r) { return r.pos >= 8 && r.pos <= 20 && r.imp >= 10; }).sort(function (a, b) { return b.imp - a.imp; }).slice(0, 10);
      return { totals: { '条目': ds.rows.length, '点击': t.clicks, '曝光': t.imp, '点击率 %': t.imp ? Math.round(t.clicks / t.imp * 10000) / 100 : 0 }, top: top, opp: opp };
    }
    var keys = ds.metrics, tot = {}, L = ds.rows.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    keys.forEach(function (k) { if (k === 'ctr' || k === 'pos') { tot[MET_LABEL[k]] = L.length ? Math.round(L.reduce(function (a, r) { return a + (r.v[k] || 0); }, 0) / L.length * 100) / 100 : 0; } else tot[MET_LABEL[k] || k] = L.reduce(function (a, r) { return a + (r.v[k] || 0); }, 0); });
    var k0 = keys[0], half = Math.min(7, Math.floor(L.length / 2)), last = 0, prev = 0;
    for (var i = 0; i < half; i++) { last += L[L.length - 1 - i].v[k0] || 0; prev += L[L.length - 1 - half - i].v[k0] || 0; }
    return { totals: tot, range: L.length ? L[0].d + ' ~ ' + L[L.length - 1].d : '', days: L.length, trend: half ? { k: MET_LABEL[k0] || k0, n: half, last: last, prev: prev, pct: prev ? Math.round((last - prev) / prev * 1000) / 10 : null } : null, months: monthly(ds) };
  }
  function aiPrompt(ds, S, site) {
    var lines = ['你是出海小站与内容运营数据分析师。下面是我导入的「' + (KIND_LABEL[ds.kind]) + '」数据（平台：' + platName(ds.platform) + (site ? '，站点：' + site.name + ' ' + (site.domain || '') : '') + '）。', '汇总：' + JSON.stringify(S.totals)];
    if (S.range) lines.push('时间范围：' + S.range + '（' + S.days + ' 天）');
    if (S.trend) lines.push('最近 ' + S.trend.n + ' 天 vs 前 ' + S.trend.n + ' 天「' + S.trend.k + '」：' + fmt(S.trend.last) + ' vs ' + fmt(S.trend.prev));
    if (S.months) lines.push('按月：' + JSON.stringify(S.months));
    if (S.top) lines.push('点击前 15：' + S.top.map(function (r) { return r.q + '(点击' + r.clicks + '/曝光' + r.imp + '/排名' + r.pos + ')'; }).join('；'));
    if (S.opp && S.opp.length) lines.push('排名 8–20 的机会词：' + S.opp.map(function (r) { return r.q + '(曝光' + r.imp + '/排名' + r.pos + ')'; }).join('；'));
    lines.push('请用中文给出：1) 3 条关键发现；2) 接下来 7 天可执行的 3–5 个动作（只用合法、白帽方法，不刷量）；3) 需要继续观察的指标。不要承诺收益。');
    return lines.join('\n');
  }

  function renderAnalytics(state, root, ctx, opts) {
    ensure(state); opts = opts || {};
    var ims = state.imports, sel = ims.filter(function (x) { return x.id === opts.sel; })[0] || ims[ims.length - 1];
    var sites = state.sites.items;
    var siteOpts = '<option value="">（不写入台账）</option>' + sites.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + (s.domain ? ' · ' + esc(s.domain) : '') + '</option>'; }).join('');
    var body = '';
    if (sel) {
      var S = summarize(sel), site = sites.filter(function (s) { return s.id === sel.siteId; })[0];
      body = '<section class="block glass tool-card" id="an-view" data-kind="' + sel.kind + '"><h2 class="block-title">' + I('chart') + esc(sel.name) + ' <span class="pill">' + esc(KIND_LABEL[sel.kind]) + '</span> <span class="pill">' + esc(platName(sel.platform)) + '</span></h2>' +
        (S.range ? '<p class="hint">' + esc(S.range) + ' · ' + S.days + ' 天' + (site ? ' · 已关联站点「' + esc(site.name) + '」' : '') + '</p>' : '') +
        '<div class="stat-grid">' + Object.keys(S.totals).map(function (k) { return '<div class="stat"><b>' + fmt(S.totals[k]) + '</b><small>' + esc(k) + (S.range && k !== '点击率 %' && k !== '平均排名' ? ' 合计' : '') + '</small></div>'; }).join('') + '</div>' +
        (S.trend ? '<p class="wb-trend ' + (S.trend.pct > 0 ? 'up' : S.trend.pct < 0 ? 'down' : '') + '" id="an-trend">最近 ' + S.trend.n + ' 天「' + esc(S.trend.k) + '」' + fmt(S.trend.last) + '，前 ' + S.trend.n + ' 天 ' + fmt(S.trend.prev) + (S.trend.pct == null ? '' : '（' + (S.trend.pct > 0 ? '+' : '') + S.trend.pct + '%）') + '</p>' : '') +
        (sel.metrics ? lineChart(sel.rows, sel.metrics.filter(function (k) { return k !== 'pos'; })) : '') +
        (S.top ? '<h3 class="wb-h">点击最多</h3><div class="tbl-wrap"><table class="wb-top"><thead><tr><th>' + (sel.kind === 'gsc-pages' ? '网页' : '查询') + '</th><th>点击</th><th>曝光</th><th>点击率</th><th>排名</th></tr></thead><tbody>' + S.top.map(function (r) { return '<tr><td>' + esc(r.q) + '</td><td>' + r.clicks + '</td><td>' + r.imp + '</td><td>' + r.ctr + '</td><td>' + r.pos + '</td></tr>'; }).join('') + '</tbody></table></div>' +
          '<h3 class="wb-h">机会词（排名 8–20、曝光≥10）</h3>' + (S.opp.length ? '<ul class="wb-opp">' + S.opp.map(function (r) { return '<li><b>' + esc(r.q) + '</b> 曝光 ' + r.imp + ' · 排名 ' + r.pos + '</li>'; }).join('') + '</ul>' : '<p class="empty-hint">暂时没有。</p>') : '') +
        '<div class="tool-actions"><button type="button" class="btn btn-sm ai-btn" id="an-ai">' + I('sparkle') + 'AI 分析这份数据</button><button type="button" class="btn btn-sm btn-danger" id="an-del">删除这份数据</button></div><div id="an-ai-out"></div></section>';
    }
    root.innerHTML = '<div class="tool-wrap wb">' + pipeline(state, 'analytics') + (global.QuestGoogle ? global.QuestGoogle.bar() : '') +
      '<section class="block glass tool-card" id="import-center"><h2 class="block-title">' + I('download') + '数据导入中心</h2>' +
      '<p class="hint">支持：<b>GSC</b>「效果 → 导出 → CSV」（日期 / 查询 / 网页 表）、<b>AdSense</b>「报告 → 下载 CSV」、<b>通用平台 CSV</b>（小红书 / 抖音 / B 站 / 公众号等后台导出，需含日期列）。文件只在本机解析，不上传。</p>' +
      '<form id="imp-form" class="form-grid"><label class="fld"><span>类型</span><select id="imp-kind"><option value="auto">自动识别（GSC / AdSense）</option><option value="generic">通用平台 CSV</option></select></label>' +
      '<label class="fld"><span>平台（通用 CSV）</span><select id="imp-plat">' + GEN_PLATS.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld"><span>写入站点台账（按月汇总）</span><select id="imp-site">' + siteOpts + '</select></label>' +
      '<label class="fld"><span>CSV 文件</span><input type="file" id="imp-file" accept=".csv,.tsv,.txt,text/csv" /></label>' +
      '<label class="fld fld-wide"><span>或粘贴 CSV 文本</span><textarea id="imp-text" rows="3" placeholder="Date,Clicks,Impressions,CTR,Position&#10;2026-09-01,3,120,2.5%,14.2"></textarea></label>' +
      '<div class="tool-actions fld-wide"><button type="submit" class="btn btn-primary btn-sm">' + I('download') + '导入</button></div></form><p id="imp-msg" class="hint" role="status"></p></section>' +
      (ims.length ? '<section class="block glass tool-card"><h2 class="block-title">' + I('list') + '已导入（' + ims.length + '）</h2><div class="wb-chips">' + ims.map(function (x) { return '<button type="button" class="chip' + (sel && x.id === sel.id ? ' on' : '') + '" data-ds="' + x.id + '">' + esc(x.name) + ' · ' + x.rows.length + ' 行</button>'; }).join('') + '</div></section>' + body
        : '<div class="tool-empty glass">' + global.QuestIcons.illo('star') + '<p>还没有导入数据。站点上线一两周后，从 GSC 导出一次「效果」CSV 导入，就能看到趋势和机会词。</p></div>') + (global.QuestShare ? global.QuestShare.timeline(state) : '') + '</div>';

    var msg = root.querySelector('#imp-msg');
    root.querySelector('#imp-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var file = root.querySelector('#imp-file').files[0], txt = root.querySelector('#imp-text').value;
      var p = file ? file.text() : Promise.resolve(txt);
      p.then(function (text) {
        if (!String(text).trim()) throw new Error('请选择文件或粘贴 CSV。');
        var kind = root.querySelector('#imp-kind').value, ds = detect(parseCSV(text), kind === 'generic' ? 'generic' : '');
        if (ds.kind === 'generic') ds.platform = root.querySelector('#imp-plat').value;
        if (!ds.rows.length) throw new Error('没有解析到有效数据行。');
        ds.id = uid(); ds.at = new Date().toISOString(); ds.siteId = root.querySelector('#imp-site').value;
        ds.name = (file ? file.name.replace(/\.[^.]+$/, '') : KIND_LABEL[ds.kind]) + ' · ' + ds.at.slice(5, 10);
        delete ds.cols;
        ims.push(ds); if (ims.length > 30) ims.shift();
        var n = ds.siteId ? syncToSite(state, ds, ds.siteId) : 0;
        ctx.save(); renderAnalytics(state, root, ctx, { sel: ds.id });
        root.querySelector('#imp-msg').textContent = '已导入「' + KIND_LABEL[ds.kind] + '」' + ds.rows.length + ' 行' + (n ? '，并写入台账 ' + n + ' 个月' : '') + '。';
      }).catch(function (err) { msg.textContent = '导入失败：' + err.message; });
    });
    root.querySelectorAll('[data-ds]').forEach(function (b) { b.addEventListener('click', function () { renderAnalytics(state, root, ctx, { sel: b.getAttribute('data-ds'), noAuto: 1 }); }); });
    if (global.QuestGoogle) {
      var again = function () { if (root.isConnected) renderAnalytics(state, root, ctx, { sel: opts.sel, noAuto: 1 }); };
      global.QuestGoogle.bindBar(state, root, ctx, again);
      if (!opts.noAuto && global.QuestGoogle.autoRefresh(state, ctx, again)) { var bm = root.querySelector('#g-bar-msg'); if (bm) bm.textContent = '自动刷新中…'; }
    }
    var del = root.querySelector('#an-del'); if (del) del.addEventListener('click', function () { if (global.confirm && !global.confirm('删除这份导入数据？（台账里已写入的月度记录保留）')) return; ims.splice(ims.indexOf(sel), 1); ctx.save(); renderAnalytics(state, root, ctx); });
    var ai = root.querySelector('#an-ai'); if (ai) ai.addEventListener('click', function () { global.QuestAI.run(root.querySelector('#an-ai-out'), aiPrompt(sel, summarize(sel), sites.filter(function (s) { return s.id === sel.siteId; })[0]), 'AI 数据分析'); });
  }

  global.QuestWorkbench = { KEY: KEY, PLATFORMS: PLATFORMS, CLS: CLS, load: load, ensure: ensure, pipeline: pipeline, renderAccounts: renderAccounts, renderPublish: renderPublish, renderAnalytics: renderAnalytics, publish: publish, parseCSV: parseCSV, detect: detect, summarize: summarize, syncToSite: syncToSite, aiPrompt: aiPrompt };
})(typeof window !== 'undefined' ? window : globalThis);
