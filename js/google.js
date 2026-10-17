/** Phase 18 · Google 连接（GIS 令牌客户端，纯浏览器，无密钥）
 *  用你自己的 OAuth Web 客户端 ID → 只读拉取 Search Console / GA4 / AdSense，写入 数据分析（imports, via:'api'）与站点台账（按月）。
 *  客户端 ID 与资源列表存 gefei-quest-accounts-v1；访问令牌只存 sessionStorage（关标签页即失效），不进存档导出。 */
(function (global) {
  var WB = function () { return global.QuestWorkbench; };
  var TK = 'gefei-quest-google-token';
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var SCOPES = {
    gsc: { s: 'https://www.googleapis.com/auth/webmasters.readonly', label: 'Search Console（只读）' },
    ga4: { s: 'https://www.googleapis.com/auth/analytics.readonly', label: 'GA4（只读）' },
    adsense: { s: 'https://www.googleapis.com/auth/adsense.readonly', label: 'AdSense（只读）' },
  };
  var HOSTS = { gsc: 'https://www.googleapis.com', ga4admin: 'https://analyticsadmin.googleapis.com', ga4: 'https://analyticsdata.googleapis.com', adsense: 'https://adsense.googleapis.com' };
  var REFRESH_MS = 6 * 3600 * 1000;

  function cfg() { var c = WB().load(); c.google = Object.assign({ clientId: '', scopes: { gsc: true, ga4: true, adsense: true }, apiBase: '', props: { gsc: [], ga4: [], adsense: [] }, adsenseAccount: '', adsenseSite: '', lastPull: '', lastMsg: '' }, c.google || {}); return c; }
  function saveCfg(c) { localStorage.setItem(WB().KEY, JSON.stringify(c)); }
  function token() { try { var t = JSON.parse(sessionStorage.getItem(TK) || 'null'); return t && t.exp > Date.now() + 30000 ? t : null; } catch (_) { return null; } }
  function forgetToken() { var t = token(); try { sessionStorage.removeItem(TK); } catch (_) {} if (t && global.google && google.accounts && google.accounts.oauth2 && google.accounts.oauth2.revoke) try { google.accounts.oauth2.revoke(t.access_token, function () {}); } catch (_) {} }
  function host(k, g) { return (g.apiBase || HOSTS[k]).replace(/\/+$/, ''); }
  function scopeStr(g) { return Object.keys(SCOPES).filter(function (k) { return g.scopes[k]; }).map(function (k) { return SCOPES[k].s; }).join(' '); }

  var gisP = null;
  function loadGIS() {
    if (global.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
    if (gisP) return gisP;
    gisP = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { gisP = null; rej(new Error('Google 登录脚本加载失败（检查网络或拦截插件）')); };
      document.head.appendChild(s);
    });
    return gisP;
  }
  /** 弹出 Google 授权（必须由用户点击触发） */
  function connect() {
    var g = cfg().google;
    if (!/\.apps\.googleusercontent\.com$/.test(g.clientId.trim())) return Promise.reject(new Error('先填写 OAuth 客户端 ID（以 .apps.googleusercontent.com 结尾）'));
    if (!scopeStr(g)) return Promise.reject(new Error('至少勾选一项数据权限'));
    return loadGIS().then(function () {
      return new Promise(function (res, rej) {
        var tc = google.accounts.oauth2.initTokenClient({
          client_id: g.clientId.trim(), scope: scopeStr(g),
          callback: function (r) {
            if (!r || r.error || !r.access_token) return rej(new Error('授权未完成：' + ((r && (r.error_description || r.error)) || '未知原因')));
            var t = { access_token: r.access_token, exp: Date.now() + (+r.expires_in || 3600) * 1000, scope: r.scope || scopeStr(g) };
            try { sessionStorage.setItem(TK, JSON.stringify(t)); } catch (_) {}
            res(t);
          },
          error_callback: function (e) { rej(new Error('授权窗口被关闭或拦截' + (e && e.type ? '（' + e.type + '）' : ''))); },
        });
        tc.requestAccessToken({ prompt: '' });
      });
    });
  }
  function api(url, opts) {
    var t = token(); if (!t) return Promise.reject(new Error('未连接或授权已过期，请点「连接 Google」'));
    opts = opts || {};
    return fetch(url, { method: opts.method || 'GET', headers: Object.assign({ Authorization: 'Bearer ' + t.access_token }, opts.body ? { 'Content-Type': 'application/json' } : {}), body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.text().then(function (x) { var j = null; try { j = x ? JSON.parse(x) : null; } catch (_) {}
        if (!r.ok) { var m = j && j.error && (j.error.message || j.error.status) || ''; if (r.status === 401) { try { sessionStorage.removeItem(TK); } catch (_) {} } throw new Error('HTTP ' + r.status + (r.status === 403 ? ' 权限不足或 API 未在 Google Cloud 项目里启用' : r.status === 401 ? ' 授权过期' : '') + (m ? ' · ' + m : '')); }
        return j || {}; }); }, function () { throw new Error('网络错误或被浏览器拦截'); });
  }
  function hasScope(k) { var t = token(); return !!(t && String(t.scope).indexOf(SCOPES[k].s) >= 0); }

  /** 读取可用资源：GSC 站点、GA4 媒体资源、AdSense 账号 */
  function listProps() {
    var c = cfg(), g = c.google, out = { gsc: g.props.gsc, ga4: g.props.ga4, adsense: g.props.adsense }, errs = [];
    var jobs = [];
    if (hasScope('gsc')) jobs.push(api(host('gsc', g) + '/webmasters/v3/sites').then(function (j) { out.gsc = (j.siteEntry || []).filter(function (s) { return s.permissionLevel !== 'siteUnverifiedUser'; }).map(function (s) { return { id: s.siteUrl, name: s.siteUrl }; }); }, function (e) { errs.push('GSC：' + e.message); }));
    if (hasScope('ga4')) jobs.push(api(host('ga4admin', g) + '/v1beta/accountSummaries?pageSize=200').then(function (j) { var L = []; (j.accountSummaries || []).forEach(function (a) { (a.propertySummaries || []).forEach(function (p) { L.push({ id: p.property, name: (p.displayName || p.property) + ' · ' + (a.displayName || '') }); }); }); out.ga4 = L; }, function (e) { errs.push('GA4：' + e.message); }));
    if (hasScope('adsense')) jobs.push(api(host('adsense', g) + '/v2/accounts').then(function (j) { out.adsense = (j.accounts || []).map(function (a) { return { id: a.name, name: (a.displayName || a.name) + ' · ' + a.name.replace('accounts/', '') }; }); }, function (e) { errs.push('AdSense：' + e.message); }));
    return Promise.all(jobs).then(function () { var c2 = cfg(); c2.google.props = out; if (!c2.google.adsenseAccount && out.adsense.length === 1) c2.google.adsenseAccount = out.adsense[0].id; saveCfg(c2); return { props: out, errs: errs }; });
  }

  function ymd(d) { return d.toISOString().slice(0, 10); }
  function daysAgo(n) { var d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d; }
  function nd(s) { s = String(s || ''); return /^\d{8}$/.test(s) ? s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8) : s.slice(0, 10); }
  function n(v) { var x = parseFloat(v); return isFinite(x) ? x : 0; }
  function r2(x) { return Math.round(x * 100) / 100; }

  function upsert(state, ds) {
    var ims = state.imports, i = ims.findIndex(function (x) { return x.via === 'api' && x.src === ds.src; });
    ds.id = i >= 0 ? ims[i].id : 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); ds.at = new Date().toISOString(); ds.via = 'api';
    if (i >= 0) ims[i] = ds; else { ims.push(ds); if (ims.length > 30) { var k = ims.findIndex(function (x) { return x.via !== 'api'; }); ims.splice(k >= 0 ? k : 0, 1); } }
    if (ds.siteId) WB().syncToSite(state, ds, ds.siteId);
    return ds;
  }
  /** 拉取全部已映射资源（近 90 天）。返回 { n, errs } */
  function pull(state) {
    WB().ensure(state); var c = cfg(), g = c.google, sites = (state.sites && state.sites.items) || [], errs = [], cnt = 0, jobs = [];
    var start = ymd(daysAgo(90)), end = ymd(daysAgo(1));
    sites.forEach(function (s) {
      if (s.gscProperty && hasScope('gsc')) {
        var base = host('gsc', g) + '/webmasters/v3/sites/' + encodeURIComponent(s.gscProperty) + '/searchAnalytics/query';
        jobs.push(api(base, { method: 'POST', body: { startDate: start, endDate: end, dimensions: ['date'], rowLimit: 1000 } }).then(function (j) {
          upsert(state, { src: 'gsc-dates:' + s.id, name: 'API · GSC 按日期 · ' + s.name, kind: 'gsc-dates', platform: 'gsc', siteId: s.id, metrics: ['clicks', 'imp', 'ctr', 'pos'],
            rows: (j.rows || []).map(function (r) { return { d: nd(r.keys[0]), v: { clicks: n(r.clicks), imp: n(r.impressions), ctr: r2(n(r.ctr) * 100), pos: r2(n(r.position)) } }; }) }); cnt++;
        }, function (e) { errs.push(s.name + ' GSC：' + e.message); }));
        jobs.push(api(base, { method: 'POST', body: { startDate: ymd(daysAgo(28)), endDate: end, dimensions: ['query'], rowLimit: 100 } }).then(function (j) {
          upsert(state, { src: 'gsc-queries:' + s.id, name: 'API · GSC 查询 · ' + s.name, kind: 'gsc-queries', platform: 'gsc', siteId: '',
            rows: (j.rows || []).map(function (r) { return { q: r.keys[0], clicks: n(r.clicks), imp: n(r.impressions), ctr: r2(n(r.ctr) * 100), pos: r2(n(r.position)) }; }) }); cnt++;
        }, function (e) { errs.push(s.name + ' GSC 查询：' + e.message); }));
      }
      if (s.ga4Property && hasScope('ga4')) {
        jobs.push(api(host('ga4', g) + '/v1beta/' + s.ga4Property + ':runReport', { method: 'POST', body: { dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }], dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }], limit: 1000 } }).then(function (j) {
          var M = ['活跃用户', '会话', '浏览量'];
          upsert(state, { src: 'ga4:' + s.id, name: 'API · GA4 · ' + s.name, kind: 'generic', platform: 'ga4', siteId: '', metrics: M,
            rows: (j.rows || []).map(function (r) { var v = {}; M.forEach(function (m, i) { v[m] = n(r.metricValues && r.metricValues[i] && r.metricValues[i].value); }); return { d: nd(r.dimensionValues[0].value), v: v }; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; }) }); cnt++;
        }, function (e) { errs.push(s.name + ' GA4：' + e.message); }));
      }
    });
    if (g.adsenseAccount && hasScope('adsense')) {
      var sd = daysAgo(90), ed = daysAgo(1);
      var q = 'dateRange=CUSTOM&startDate.year=' + sd.getUTCFullYear() + '&startDate.month=' + (sd.getUTCMonth() + 1) + '&startDate.day=' + sd.getUTCDate() + '&endDate.year=' + ed.getUTCFullYear() + '&endDate.month=' + (ed.getUTCMonth() + 1) + '&endDate.day=' + ed.getUTCDate() +
        '&dimensions=DATE&metrics=ESTIMATED_EARNINGS&metrics=PAGE_VIEWS&metrics=CLICKS&metrics=IMPRESSIONS';
      jobs.push(api(host('adsense', g) + '/v2/' + g.adsenseAccount + '/reports:generate?' + q).then(function (j) {
        var hd = (j.headers || []).map(function (h) { return h.name; }), ix = function (k) { return hd.indexOf(k); };
        upsert(state, { src: 'adsense:' + g.adsenseAccount, name: 'API · AdSense · ' + g.adsenseAccount.replace('accounts/', ''), kind: 'adsense', platform: 'adsense', siteId: g.adsenseSite || '', metrics: ['earn', 'pv', 'clicks', 'imp'],
          rows: (j.rows || []).map(function (r) { var c = function (k) { var i = ix(k); return i >= 0 && r.cells[i] ? r.cells[i].value : ''; }; return { d: nd(c('DATE')), v: { earn: n(c('ESTIMATED_EARNINGS')), pv: n(c('PAGE_VIEWS')), clicks: n(c('CLICKS')), imp: n(c('IMPRESSIONS')) } }; }).filter(function (r) { return r.d; }) }); cnt++;
      }, function (e) { errs.push('AdSense：' + e.message); }));
    }
    if (!jobs.length) return Promise.resolve({ n: 0, errs: ['还没有映射：先「读取我的资源」，再给站点选择对应的 GSC / GA4 资源或 AdSense 账号'] });
    return Promise.all(jobs).then(function () { var c2 = cfg(); c2.google.lastPull = new Date().toISOString(); c2.google.lastMsg = cnt + ' 份数据' + (errs.length ? '，' + errs.length + ' 个错误' : ''); saveCfg(c2); return { n: cnt, errs: errs }; });
  }
  function mapped(state) { var g = cfg().google; return ((state.sites && state.sites.items) || []).some(function (s) { return s.gscProperty || s.ga4Property; }) || !!g.adsenseAccount; }
  /** 打开 数据分析 / 工作台 时：令牌有效 + 有映射 + 距上次 >6h → 自动拉取 */
  function autoRefresh(state, ctx, done) {
    var g = cfg().google;
    if (!token() || !mapped(state)) return false;
    if (g.lastPull && Date.now() - Date.parse(g.lastPull) < REFRESH_MS) return false;
    pull(state).then(function (r) { ctx.save(); if (done) done(r); });
    return true;
  }
  function ago(iso) { if (!iso) return '从未'; var m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? '刚刚' : m < 60 ? m + ' 分钟前' : m < 1440 ? Math.round(m / 60) + ' 小时前' : Math.round(m / 1440) + ' 天前'; }
  function statusLine() { var g = cfg().google, t = token(); return t ? '<span class="wb-st ok">已授权 · ' + Math.max(0, Math.round((t.exp - Date.now()) / 60000)) + ' 分钟内有效</span>' : g.clientId ? '<span class="wb-st warn">已填客户端 ID，未授权</span>' : '<span class="wb-st">未连接</span>'; }
  /** 数据分析页顶部的小条 */
  function bar() {
    var g = cfg().google;
    return '<div class="g-bar glass" id="g-bar">' + I('chart') + '<b>Google 自动拉取</b>' + statusLine() + '<span class="hint">上次：' + esc(ago(g.lastPull)) + (g.lastMsg ? ' · ' + esc(g.lastMsg) : '') + '</span>' +
      (token() ? '<button type="button" class="btn btn-sm" id="g-bar-pull">' + I('download') + '立即拉取</button>' : '<a class="btn btn-sm" href="#me-accounts">去连接 Google</a>') + '<span id="g-bar-msg" class="hint" role="status"></span></div>';
  }
  function bindBar(state, root, ctx, after) {
    var b = root.querySelector('#g-bar-pull'); if (!b) return;
    b.addEventListener('click', function () { var m = root.querySelector('#g-bar-msg'); m.textContent = '拉取中…'; b.disabled = true; pull(state).then(function (r) { ctx.save(); if (after) after(r); var m2 = document.querySelector('#g-bar-msg'); if (m2) m2.textContent = '已更新 ' + r.n + ' 份' + (r.errs.length ? '；' + r.errs.join('；') : ''); }); });
  }

  /** 账号中心里的 Google 区块 */
  function section(state) {
    var g = cfg().google, sites = (state.sites && state.sites.items) || [], P = g.props;
    var opt = function (list, v) { return '<option value="">（不拉取）</option>' + list.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === v ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + (v && !list.some(function (x) { return x.id === v; }) ? '<option value="' + esc(v) + '" selected>' + esc(v) + '</option>' : ''); };
    return '<section class="block glass tool-card" id="g-connect" data-tab="Google 连接"><h2 class="block-title">' + I('search') + 'Google 连接 ' + statusLine() + '</h2>' +
      '<p class="hint">用<b>你自己的</b> Google Cloud OAuth「Web 应用」客户端 ID，在浏览器里弹窗授权（Google Identity Services），只读拉取 Search Console、GA4、AdSense。没有密钥、没有后端；访问令牌只存本标签页会话，关闭即失效。准备步骤见下方「怎么获得客户端 ID」。</p>' +
      '<form id="g-form" class="form-grid" autocomplete="off"><label class="fld fld-wide"><span>OAuth 客户端 ID</span><input id="g-client" placeholder="1234567890-xxxx.apps.googleusercontent.com" value="' + esc(g.clientId) + '" /></label>' +
      '<fieldset class="fld-wide g-scopes"><legend>数据权限（只读）</legend>' + Object.keys(SCOPES).map(function (k) { return '<label class="chk"><input type="checkbox" id="g-sc-' + k + '"' + (g.scopes[k] ? ' checked' : '') + ' /> ' + SCOPES[k].label + '</label>'; }).join('') + '</fieldset>' +
      '<details class="cx-details fld-wide"><summary>高级：API 地址（测试或自建代理用，默认留空）</summary><label class="fld"><span>API 根地址</span><input id="g-base" placeholder="留空 = Google 官方" value="' + esc(g.apiBase) + '" /></label></details>' +
      '<div class="tool-actions fld-wide"><button type="submit" class="btn btn-sm">' + I('lock') + '保存设置</button><button type="button" class="btn btn-primary btn-sm" id="g-auth">' + I('user') + '连接 Google（弹窗授权）</button><button type="button" class="btn btn-sm" id="g-list"' + (token() ? '' : ' disabled') + '>' + I('list') + '读取我的资源</button><button type="button" class="btn btn-sm btn-danger" id="g-forget">断开 / 忘记</button></div></form>' +
      '<p id="g-msg" class="hint" role="status"></p>' +
      '<h3 class="wb-h">站点映射</h3>' + (sites.length ? '<div class="tbl-wrap"><table class="g-map"><thead><tr><th>台账站点</th><th>Search Console 资源</th><th>GA4 媒体资源</th></tr></thead><tbody>' + sites.map(function (s) {
        return '<tr data-site="' + esc(s.id) + '"><td>' + esc(s.name) + (s.domain ? '<br><small>' + esc(s.domain) + '</small>' : '') + '</td><td><select data-map="gscProperty" aria-label="' + esc(s.name) + ' GSC 资源">' + opt(P.gsc, s.gscProperty) + '</select></td><td><select data-map="ga4Property" aria-label="' + esc(s.name) + ' GA4 资源">' + opt(P.ga4, s.ga4Property) + '</select></td></tr>'; }).join('') + '</tbody></table></div>'
        : '<p class="empty-hint">台账还没有站点。先去 <a href="#me-sites">我的站点台账</a> 登记站点，再回来映射。</p>') +
      '<div class="form-grid"><label class="fld"><span>AdSense 账号</span><select id="g-ads">' + opt(P.adsense, g.adsenseAccount) + '</select></label><label class="fld"><span>AdSense 收入写入哪个站点</span><select id="g-ads-site"><option value="">（不写入台账）</option>' + sites.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === g.adsenseSite ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary btn-sm" id="g-pull"' + (token() ? '' : ' disabled') + '>' + I('download') + '立即拉取（近 90 天）</button><span class="hint">上次：' + esc(ago(g.lastPull)) + (g.lastMsg ? ' · ' + esc(g.lastMsg) : '') + '。打开数据分析或工作台时，若授权有效且超过 6 小时会自动刷新。</span></div>' +
      '<details class="cx-details"><summary>怎么获得客户端 ID（一次性，约 10 分钟，免费）</summary><ol class="g-howto">' +
      '<li>打开 Google Cloud Console（console.cloud.google.com），新建一个项目。</li>' +
      '<li>「API 和服务 → 库」启用：Google Search Console API、Google Analytics Data API、Google Analytics Admin API、AdSense Management API（只用到的可以只开对应项）。</li>' +
      '<li>「OAuth 同意屏幕」：用户类型选「外部」，填应用名和邮箱；发布状态保持「测试」，把你自己的 Google 账号加入「测试用户」。</li>' +
      '<li>「凭据 → 创建凭据 → OAuth 客户端 ID」，类型选「Web 应用」，「已获授权的 JavaScript 来源」填 <code>https://yuanqingsong2024.github.io</code>（本地测试再加 <code>http://localhost:8765</code>），不需要重定向 URI。</li>' +
      '<li>复制生成的客户端 ID（…apps.googleusercontent.com）粘贴到上面，保存 → 连接 Google → 读取我的资源 → 映射站点 → 立即拉取。</li></ol><p class="hint">客户端 ID 不是密钥，可以放在浏览器里；不要创建或粘贴「客户端密钥」。file:// 打开本站无法授权（Google 要求 http/https 来源）。</p></details></section>';
  }
  function bind(state, root, ctx, rerender) {
    var msg = root.querySelector('#g-msg'); if (!msg) return;
    function say(t) { var m = document.querySelector('#g-msg'); if (m) m.textContent = t; }
    function store() { var c = cfg(); c.google.clientId = root.querySelector('#g-client').value.trim(); c.google.apiBase = root.querySelector('#g-base').value.trim().replace(/\/+$/, ''); Object.keys(SCOPES).forEach(function (k) { c.google.scopes[k] = root.querySelector('#g-sc-' + k).checked; }); saveCfg(c); }
    root.querySelector('#g-form').addEventListener('submit', function (e) { e.preventDefault(); store(); rerender(); say('已保存 Google 设置。'); });
    root.querySelector('#g-auth').addEventListener('click', function () { store(); say('等待 Google 授权窗口…'); connect().then(function () { return listProps(); }).then(function (r) { rerender(); say('已授权并读取资源：GSC ' + r.props.gsc.length + ' · GA4 ' + r.props.ga4.length + ' · AdSense ' + r.props.adsense.length + (r.errs.length ? '；' + r.errs.join('；') : '')); }).catch(function (e) { say(e.message); }); });
    root.querySelector('#g-list').addEventListener('click', function () { say('读取中…'); listProps().then(function (r) { rerender(); say('GSC ' + r.props.gsc.length + ' · GA4 ' + r.props.ga4.length + ' · AdSense ' + r.props.adsense.length + (r.errs.length ? '；' + r.errs.join('；') : '')); }); });
    root.querySelector('#g-forget').addEventListener('click', function () { forgetToken(); var c = cfg(); c.google.clientId = ''; c.google.props = { gsc: [], ga4: [], adsense: [] }; c.google.adsenseAccount = ''; saveCfg(c); rerender(); say('已断开并忘记客户端 ID（站点映射保留）。'); });
    root.querySelectorAll('.g-map select[data-map]').forEach(function (s) { s.addEventListener('change', function () { var id = s.closest('tr').getAttribute('data-site'), it = state.sites.items.filter(function (x) { return x.id === id; })[0]; if (it) { it[s.getAttribute('data-map')] = s.value; ctx.save(); } }); });
    root.querySelector('#g-ads').addEventListener('change', function (e) { var c = cfg(); c.google.adsenseAccount = e.target.value; saveCfg(c); });
    root.querySelector('#g-ads-site').addEventListener('change', function (e) { var c = cfg(); c.google.adsenseSite = e.target.value; saveCfg(c); });
    root.querySelector('#g-pull').addEventListener('click', function () { say('拉取中…'); pull(state).then(function (r) { ctx.save(); rerender(); say('已拉取 ' + r.n + ' 份数据，已写入数据分析' + (r.errs.length ? '；' + r.errs.join('；') : '') + '。'); }); });
  }
  global.QuestGoogle = { SCOPES: SCOPES, TK: TK, cfg: cfg, token: token, connect: connect, listProps: listProps, pull: pull, autoRefresh: autoRefresh, mapped: mapped, section: section, bind: bind, bar: bar, bindBar: bindBar, ago: ago };
})(typeof window !== 'undefined' ? window : globalThis);
