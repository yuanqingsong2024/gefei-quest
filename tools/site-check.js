// Usage: node tools/site-check.js [baseUrl] [shotDir]  (needs playwright-core + Chrome)
const { chromium } = require(process.env.PW || 'playwright-core');
// Phase 18：紧凑组件会把内容收进标签/折叠/分页；交互前先像用户一样展开目标（QuestCompact.revealSel）
function cx(pg) {
  for (const k of ['click', 'fill', 'check', 'uncheck', 'selectOption', 'setInputFiles', 'type', 'focus', 'hover']) {
    const o = pg[k].bind(pg);
    pg[k] = async (sel, ...a) => { await pg.evaluate(s => { try { window.QuestCompact && QuestCompact.revealSel(s); } catch (_) {} }, sel).catch(() => {}); return o(sel, ...a); };
  }
  return pg;
}
const BASE = process.argv[2] || 'http://localhost:8765/';
const SHOTS = process.argv[3] || '';
const ROUTES = ['home','path','path-quests','war','war-s2','war-s3','war-m','war-x','war-kit','war-keywords','war-rank','lib','lib-tools','lib-hosting','lib-monetize','lib-paths','lib-xianyu','lib-tips','lib-peers','guides','weekly','me','me-sites','me-ai','me-stats','changelog','dev','pm','pm-cn','pm-global','pm-cn-drama','pm-gl-video','me-accounts','me-analytics','war-publish','war-share'];
const OLD = { '':'home', map:'path', quest:'path-quests', quests:'path-quests', ship:'weekly', ach:'me', settings:'me', stats:'me-stats', updates:'changelog', resources:'lib', 'war-s1':'war', 'home-faq':'home-faq' };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } }); cx(p);
  const errors = []; p.on('pageerror', e => errors.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_CONNECTION_REFUSED/.test(m.text())) errors.push(m.text()); });
  const hrefs = new Set(); let fail = 0;
  const visit = async (h) => { await p.goto(BASE + 'index.html#' + h); await p.waitForTimeout(150); };
  const guides = await (async () => { await visit('guides'); return p.$$eval('a[href^="#guide-"]', as => [...new Set(as.map(a => a.getAttribute('href').slice(1)))]); })();
  const devs = await (async () => { await visit('dev'); return p.$$eval('a[href^="#dev-"]', as => [...new Set(as.map(a => a.getAttribute('href').slice(1)))]); })();
  for (const h of [...ROUTES, ...guides, ...devs]) {
    await visit(h);
    const info = await p.evaluate(() => ({ hash: location.hash, sec: (document.querySelector('.site-links a.active') || {}).textContent || '', panel: [...document.querySelectorAll('.tab-panel')].filter(x => !x.hidden).map(x => x.id).join(), empty: !!document.querySelector('.empty-state'), w: document.documentElement.scrollWidth, hrefs: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) }));
    info.hrefs.forEach(x => hrefs.add(x));
    const bad = info.hash !== '#' + h || info.empty || !info.panel;
    if (bad) fail++;
    console.log((bad ? 'FAIL ' : 'ok   ') + h.padEnd(30) + info.panel + ' ' + info.sec.trim());
  }
  for (const [o, n] of Object.entries(OLD)) {
    await visit(o); const hash = await p.evaluate(() => location.hash);
    const ok = hash === '#' + n; if (!ok) fail++; console.log((ok ? 'ok   ' : 'FAIL ') + 'old #' + o + ' -> ' + hash);
  }
  for (const o of ['tools', 'xianyu', '']) {
    await p.goto(BASE + 'resources.html' + (o ? '#' + o : '')); await p.waitForTimeout(400);
    const hash = await p.evaluate(() => location.pathname.split('/').pop() + location.hash); const exp = 'index.html#' + (o ? 'lib-' + o : 'lib');
    const ok = hash === exp; if (!ok) fail++; console.log((ok ? 'ok   ' : 'FAIL ') + 'resources.html#' + o + ' -> ' + hash);
  }
  // link check
  const known = new Set([...ROUTES, ...guides, ...devs]);
  let md = 0, broken = 0;
  for (const h of hrefs) {
    if (/\.md(#|$)/.test(h)) { md++; console.log('RAW MD', h); continue; }
    if (/^(https?:|mailto:)/.test(h)) continue;
    if (h.startsWith('#')) { const k = h.slice(1); if (!known.has(k) && !/^home-/.test(k)) { await visit(k); const hh = await p.evaluate(() => location.hash); if (hh === '#home' && k !== 'home') { broken++; console.log('BROKEN', h); } } continue; }
    const r = await p.request.get(BASE + h.replace(/^\.\//, '')); if (r.status() !== 200) { broken++; console.log('BROKEN', h, r.status()); }
  }
  console.log(`\nroutes=${ROUTES.length} guides=${guides.length} dev=${devs.length} uniqueLinks=${hrefs.size} rawMd=${md} broken=${broken} routeFails=${fail} consoleErrors=${errors.length}`);
  errors.slice(0, 10).forEach(e => console.log('ERR', e));
  // ---- Phase 9 functional tests ----
  let ft = 0; const T = (ok, name) => { if (!ok) ft++; console.log((ok ? 'ok   ' : 'FAIL ') + 'P9 ' + name); };
  const OLD_SAVE = { version: 1, xp: 30, done: ['q-p-01'], unlocked: ['ch-prologue'], cleared: [], streak: 1, lastCheckIn: null, achievements: [], weeklyClaimed: [], settings: { muted: true, energyEnabled: false } };
  await p.goto(BASE + 'index.html#home'); await p.evaluate(s => localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)), OLD_SAVE);
  await p.reload(); await p.waitForTimeout(200);
  T(await p.evaluate(() => !!document.querySelector('#home-tools') && /站点台账/.test(document.querySelector('#home-sites-snap').textContent)), 'old save (no kit/keywords/sites) loads; home tools + snapshot');
  await visit('war-keywords');
  T(await p.evaluate(() => !!document.querySelector('.tool-empty')), 'keywords empty state');
  const addKw = async (kw, vol, big, weak, intent) => { await p.fill('#kw-kw', kw); await p.selectOption('#kw-vol', vol); await p.selectOption('#kw-big', big); await p.selectOption('#kw-weak', weak); await p.selectOption('#kw-intent', intent); await p.click('#kw-save'); await p.waitForTimeout(80); };
  await addKw('pdf merge for mac', '100-1k', '2', '4', 'tool');   // 32+16+10+12=70
  await addKw('best vpn', '10k+', '10', '0', 'trans');            // 0+0+8+4=12
  await addKw('csv to json offline', 'lt100', '5', '2', 'info');  // 20+8+4+6=38
  const rows = await p.$$eval('.kw-item', ls => ls.map(l => l.dataset.kw + '|' + l.querySelector('.kw-score b').textContent + '|' + l.querySelector('.kw-label').textContent));
  console.log('     ', rows.join(' ; '));
  T(rows.length === 3 && rows.includes('pdf merge for mac|70|适合练手') && rows.includes('best vpn|12|先换长尾') && rows.includes('csv to json offline|38|先换长尾'), 'add 3 keywords + scoring labels');
  await p.click('.kw-item[data-kw="csv to json offline"] [data-kw-act="edit"]'); await p.selectOption('#kw-big', '2'); await p.click('#kw-save'); await p.waitForTimeout(80);
  T(await p.$eval('.kw-item[data-kw="csv to json offline"] .kw-label', e => e.textContent) === '可以试', 'edit keyword -> 50 可以试');
  p.once('dialog', d => d.accept()); await p.click('.kw-item[data-kw="best vpn"] [data-kw-act="del"]'); await p.waitForTimeout(80);
  T((await p.$$('.kw-item')).length === 2, 'delete keyword');
  await p.click('.kw-item[data-kw="pdf merge for mac"] [data-kw-act="star"]'); await p.waitForTimeout(50);
  await p.click('.kw-item[data-kw="pdf merge for mac"] [data-kw-act="s1"]'); await p.waitForTimeout(50);
  await p.click('.kw-item[data-kw="csv to json offline"] [data-kw-act="s2"]'); await p.waitForTimeout(50);
  T(await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); return s.keywords.items.length === 2 && s.keywords.s2Target === 'csv to json offline' && s.kit.keyword === 'pdf merge for mac' && s.keywords.items.some(k => k.star); }), 'star / 设为站一主词 / 设为站二目标词 persisted');
  const gHref = await p.$eval('.kw-item[data-kw="pdf merge for mac"] a[href*="google.com/search"]', a => a.href);
  T(gHref.includes('q=pdf%20merge%20for%20mac'), 'quick links encoded');
  await p.click('#kw-csv'); await p.waitForTimeout(50);
  T(await p.evaluate(async () => (await window.__lastDownload.blob.text()).includes('pdf merge for mac,')), 'keywords CSV export');
  await visit('war-kit');
  T(await p.inputValue('#kit-keyword') === 'pdf merge for mac', 'kit form prefilled from keyword board');
  await p.fill('#kit-domain', 'https://pdfmerge-mac.com/'); await p.fill('#kit-email', 'hi@pdfmerge-mac.com'); await p.fill('#kit-intro', 'Merge PDF files on your Mac for free in seconds, no upload needed.');
  const pv = await p.evaluate(() => ({ t: document.querySelector('#kit-title').textContent, d: document.querySelector('#kit-desc').textContent, ok: document.querySelectorAll('.kit-rules li.ok').length }));
  console.log('      title=' + pv.t + ' (' + pv.t.length + ') desc=' + pv.d.length);
  T(pv.t.includes('pdf merge for mac') && pv.t.length <= 60 && pv.d.length >= 120 && pv.d.length <= 160 && pv.ok === 4, 'live preview + rules all pass');
  await p.click('[data-dl="index.html"]'); await p.waitForTimeout(50);
  const html = await p.evaluate(async () => window.__lastDownload.name + '\n' + await window.__lastDownload.blob.text());
  T(html.startsWith('index.html') && html.includes('<h1>pdf merge for mac</h1>') && html.includes('hi@pdfmerge-mac.com') && !html.includes('YOURBRAND') && (html.match(/<h1/g) || []).length === 1, 'index.html download filled, one h1, no placeholder');
  await p.click('[data-dl="sitemap.xml"]'); await p.waitForTimeout(50);
  T((await p.evaluate(() => window.__lastDownload.blob.text())).includes('<loc>https://pdfmerge-mac.com/</loc>'), 'sitemap.xml with domain');
  await p.click('#kit-dl'); await p.waitForTimeout(50);
  const zip = await p.evaluate(async () => { const b = new Uint8Array(await window.__lastDownload.blob.arrayBuffer()); const t = new TextDecoder().decode(b); return { sig: b[0] === 0x50 && b[1] === 0x4b, files: ['index.html', 'robots.txt', 'sitemap.xml'].every(n => t.includes(n)), name: window.__lastDownload.name }; });
  T(zip.sig && zip.files && zip.name === 'station-one-pdf-merge-for-mac.zip', 'ZIP bundle (PK header, 3 files)');
  await p.check('[data-kc="tags"]'); await p.waitForTimeout(100);
  await p.reload(); await p.waitForTimeout(200);
  T(await p.isChecked('[data-kc="tags"]') && await p.inputValue('#kit-domain') === 'https://pdfmerge-mac.com/', 'kit checklist + form persist after reload');
  await visit('me-sites');
  T(await p.evaluate(() => !!document.querySelector('.tool-empty')), 'sites empty state');
  await p.fill('#site-name', 'PDF Merge Mac'); await p.fill('#site-domain', 'pdfmerge-mac.com'); await p.selectOption('#site-status', '有点击'); await p.click('#site-form button[type=submit]'); await p.waitForTimeout(80);
  const addLog = async (m, imp, cl, usd) => { await p.fill('form[data-log] [name=month]', m); await p.fill('form[data-log] [name=imp]', imp); await p.fill('form[data-log] [name=clicks]', cl); await p.fill('form[data-log] [name=usd]', usd); await p.click('form[data-log] button'); await p.waitForTimeout(80); };
  await addLog('2026-08', '120', '3', '0'); await addLog('2026-09', '480', '15', '1.2'); await addLog('2026-10', '900', '31', '4.5');
  T(await p.evaluate(() => document.querySelectorAll('.site-chart polyline').length === 2 && document.querySelectorAll('.site-chart circle').length === 6 && document.querySelectorAll('.site-logs tbody tr').length === 3), 'site + 3 month logs + SVG chart');
  await p.reload(); await p.waitForTimeout(200);
  T(await p.$eval('#sites-count', e => e.textContent) === '1', 'sites persist after reload');
  await visit('home');
  const snap = await p.$eval('#home-sites-snap', e => e.textContent); console.log('      ' + snap);
  T(/1 个站/.test(snap) && /2026-10/.test(snap) && /点击 31/.test(snap), 'home snapshot sites + latest month');
  await visit('me');
  T(await p.evaluate(() => !!document.querySelector('a[href="#me-sites"]')), 'me overview links to 站点台账');
  console.log('P9 functional fails=' + ft); fail += ft;
  if (SHOTS) {
    const s9 = async (h, name, pg = p) => { await pg.goto(BASE + 'index.html#' + h); await pg.waitForTimeout(400); await pg.screenshot({ path: `${SHOTS}/p9-${name}.png`, fullPage: true }); };
    await s9('war-kit', 'kit'); await s9('war-keywords', 'keywords'); await s9('me-sites', 'sites');
    const m9 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); cx(m9);
    await m9.goto(BASE + 'index.html#home'); await m9.evaluate(() => 0);
    for (const h of ['war-kit', 'war-keywords', 'me-sites']) { await m9.goto(BASE + 'index.html#' + h); await m9.waitForTimeout(300); const w = await m9.evaluate(() => document.documentElement.scrollWidth); console.log((w <= 390 ? 'ok   ' : 'FAIL ') + 'mobile ' + h + ' scrollWidth ' + w); if (w > 390) fail++; }
    await s9('war-keywords', 'mobile-keywords', m9);
  }

  // ---------- Phase 10 ----------
  let f10 = 0; const T10 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P10 ' + m); if (!c) f10++; };
  await p.goto(BASE + 'index.html#home'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(200);
  T10(await p.evaluate(() => document.querySelectorAll('#today-list li').length >= 2 && /今日任务/.test(document.querySelector('#home-today').textContent)), 'home 今日任务 card with 2-3 quests');
  T10(await p.evaluate(() => !!document.querySelector('#today-changelog .red-dot') && !!document.querySelector('.site-links a[data-nav="me"] .red-dot')), 'red dot on home + top nav for unseen changelog');
  await visit('changelog');
  T10(await p.evaluate(() => document.querySelectorAll('.cl-item').length >= 5 && document.querySelectorAll('.cl-item.is-new').length >= 5), 'changelog lists entries marked NEW');
  T10(await p.evaluate(() => !document.querySelector('.site-links a[data-nav="me"] .red-dot') && JSON.parse(localStorage.getItem('gefei-quest-save-v1')).lastSeenChangelog >= 10), 'visiting changelog clears red dot + saves lastSeenChangelog');
  await visit('home');
  T10(await p.evaluate(() => !document.querySelector('#today-changelog .red-dot')), 'home red dot gone after reading');
  // old save without new fields stays compatible
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); delete s.activity; delete s.doneDates; s.lastSeenChangelog = 3; localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)); });
  await visit('me-stats'); await p.reload(); await p.waitForTimeout(200);
  T10(await p.$eval('#st-cur', e => e.textContent) === '0 天', 'stats empty -> streak 0 (old save loads)');
  await visit('path-quests');
  await p.evaluate(() => { const c = document.querySelector('input[type=checkbox]:not(:checked):not(:disabled)'); if (c) c.click(); }); await p.waitForTimeout(400);
  await p.evaluate(() => { const m = document.querySelector('.modal-root button, .boss-modal button'); if (m) m.click(); });
  const sv = await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')));
  const td = await p.evaluate(() => QuestStats.ymd(new Date()));
  T10(sv.activity && sv.activity[td] >= 1 && Object.values(sv.doneDates || {}).includes(td), 'quest completion records activity + doneDates');
  // seed past activity for streak math
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); const d = n => QuestStats.ymd(new Date(Date.now() - n * 864e5)); s.activity[d(1)] = 2; s.activity[d(2)] = 4; s.activity[d(10)] = 1; s.activity[d(11)] = 1; s.activity[d(12)] = 1; s.activity[d(13)] = 1; localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)); });
  await visit('me-stats'); await p.reload(); await p.waitForTimeout(250);
  const st = await p.evaluate(() => ({ cur: document.querySelector('#st-cur').textContent, long: document.querySelector('#st-long').textContent, today: !!document.querySelector('.heatmap rect.hm-today:not(.hm-0)'), cells: document.querySelectorAll('.heatmap rect').length, bars: [...document.querySelectorAll('.week-bars .bar-rect')].filter(r => +r.getAttribute('height') > 0).length, mods: document.querySelectorAll('.mod-row').length }));
  console.log('      ', JSON.stringify(st));
  T10(st.cur === '3 天' && st.long === '4 天', 'current streak 3 / longest 4');
  T10(st.today && st.cells > 150, 'heatmap renders, today colored');
  T10(st.bars >= 1 && st.mods === 6, 'weekly bars + 6 chapter rows');
  T10(await p.evaluate(() => !!document.querySelector('a.stat-link[href="#war-keywords"]') && !!document.querySelector('a.stat-link[href="#me-sites"]')), 'tool summary links');
  const dj = await p.request.get(BASE + 'daily.json'); const dd = dj.status() === 200 ? await dj.json() : {};
  T10(dd.latestId >= 10 && Array.isArray(dd.entries) && dd.entries[0].title, 'daily.json served + valid');
  console.log('P10 functional fails=' + f10); fail += f10;
  if (SHOTS) {
    const s10 = async (h, name, pg = p, full = true) => { await pg.goto(BASE + 'index.html#' + h); await pg.waitForTimeout(400); await pg.screenshot({ path: `${SHOTS}/p10-${name}.png`, fullPage: full }); };
    await s10('me-stats', 'stats'); await s10('changelog', 'changelog');
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); s.lastSeenChangelog = 8; localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)); });
    await p.goto(BASE + 'index.html#home'); await p.reload(); await p.waitForTimeout(400); await (await p.$('#home-today')).screenshot({ path: `${SHOTS}/p10-today.png` });
    const m10 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); cx(m10);
    for (const h of ['home', 'me-stats', 'changelog']) { await m10.goto(BASE + 'index.html#' + h); await m10.waitForTimeout(300); const w = await m10.evaluate(() => document.documentElement.scrollWidth); console.log((w <= 390 ? 'ok   ' : 'FAIL ') + 'mobile ' + h + ' scrollWidth ' + w); if (w > 390) fail++; }
    await s10('me-stats', 'mobile-stats', m10); await s10('home', 'mobile-home', m10, false);
  }

  // ---------- Phase 11 ----------
  let f11 = 0; const T11 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P11 ' + m); if (!c) f11++; };
  await visit('war-keywords'); await p.keyboard.press('/'); await p.waitForTimeout(100);
  T11(await p.evaluate(() => !document.getElementById('search-modal').hidden && document.activeElement.id === 'search-input'), '/ opens search + focuses input');
  await p.keyboard.type('闲鱼'); await p.waitForTimeout(150);
  const groups = await p.$$eval('.sr-group h4', hs => hs.map(h => h.textContent));
  T11(groups.length >= 2 && (await p.$$('.sr-item')).length >= 3, 'search groups results: ' + groups.join(' | '));
  await p.keyboard.press('Escape'); T11(await p.evaluate(() => document.getElementById('search-modal').hidden), 'Esc closes search');
  await p.keyboard.press('Control+k'); await p.waitForTimeout(100); await p.keyboard.type('sitemap'); await p.waitForTimeout(150);
  T11(await p.evaluate(() => [...document.querySelectorAll('.sr-group h4')].some(h => /手册|开发文档/.test(h.textContent))), 'Ctrl+K opens; guides/dev docs indexed');
  await p.keyboard.press('Escape'); await p.keyboard.press('Control+k'); await p.keyboard.type('选词练习板'); await p.waitForTimeout(150); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  T11(await p.evaluate(() => location.hash === '#war-keywords' && document.getElementById('search-modal').hidden), 'Enter navigates to top result');
  await p.keyboard.press('Control+k'); await p.keyboard.type('zzqqxx'); await p.waitForTimeout(120);
  T11(await p.evaluate(() => !!document.querySelector('#search-results .illo')), 'no-result empty illustration'); await p.keyboard.press('Escape');
  await visit('home'); await p.evaluate(() => scrollTo(0, 1500)); await p.waitForTimeout(300);
  T11(await p.evaluate(() => document.body.classList.contains('nav-condensed') && document.getElementById('to-top').classList.contains('show')), 'nav condenses + back-to-top shows on scroll');
  await p.click('#to-top'); await p.waitForTimeout(900);
  T11(await p.evaluate(() => scrollY < 50), 'back-to-top scrolls up');
  T11(await p.evaluate(() => /v1\.\d+/.test(document.querySelector('.foot-ver').textContent) && !!document.querySelector('.site-footer a[href="#changelog"]') && /关于本站/.test(document.querySelector('.site-footer').textContent)), 'footer: version + changelog + about + sitemap');
  T11(await p.evaluate(() => getComputedStyle(document.getElementById('bottom-bar')).display === 'none'), 'bottom bar hidden on desktop');
  T11(await p.evaluate(() => document.querySelectorAll('.card-ico svg.ico[class*="tone-"]').length > 10), 'badges use tone family');
  const mm = await b.newPage({ viewport: { width: 390, height: 844 } }); cx(mm);
  await mm.goto(BASE + 'index.html#war-kit'); await mm.waitForTimeout(300);
  T11(await mm.evaluate(() => getComputedStyle(document.getElementById('bottom-bar')).display === 'grid' && document.querySelector('#bottom-bar a.active').dataset.bb === 'war'), 'mobile bottom bar visible, 作战室 active');
  await mm.click('#bottom-bar a[data-bb="lib"]'); await mm.waitForTimeout(250);
  T11(await mm.evaluate(() => location.hash === '#lib' && document.querySelector('#bottom-bar a.active').dataset.bb === 'lib'), 'bottom bar navigates');
  await mm.click('#bottom-bar .bb-search'); await mm.waitForTimeout(100);
  T11(await mm.evaluate(() => !document.getElementById('search-modal').hidden), 'mobile search button opens search');
  for (const h of ['home', 'war', 'lib', 'me-stats', 'guide-station-one-playbook']) { await mm.goto(BASE + 'index.html#' + h); await mm.waitForTimeout(250); const w = await mm.evaluate(() => document.documentElement.scrollWidth); T11(w <= 390, 'mobile ' + h + ' scrollWidth ' + w); }
  const r11 = await p.request.get(BASE + 'icons.html'); T11(r11.status() === 200, 'icons.html overview served');
  console.log('P11 functional fails=' + f11); fail += f11;

  // ---------- Phase 12 ----------
  let f12 = 0; const T12 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P12 ' + m); if (!c) f12++; };
  await visit('war-rank'); await p.waitForTimeout(200);
  T12(await p.evaluate(() => document.querySelectorAll('.rank-card').length === 10 && /不保证/.test(document.querySelector('.rank-disclaimer').textContent)), '10 cards + disclaimer');
  T12(await p.evaluate(() => !!document.querySelector('.sub-tab.active[href="#war-rank"]') && /每日赚钱榜/.test(document.querySelector('.crumbs').textContent)), 'WAR_TABS tab + breadcrumb');
  const t0 = await p.$eval('[data-rtype]:not([data-rtype="all"])', b => b.dataset.rtype);
  await p.click(`[data-rtype="${t0}"]`); await p.waitForTimeout(100);
  T12(await p.evaluate(t => { const c = [...document.querySelectorAll('.rank-card')]; return c.length > 0 && c.length < 10 && c.every(x => x.dataset.type === t); }, t0), 'type filter ' + t0);
  await p.click('[data-rtype="all"]'); await p.waitForTimeout(80);
  await p.click('.rank-card[data-rank="3"] .rank-fav'); await p.waitForTimeout(80);
  await p.click('#rank-only-fav'); await p.waitForTimeout(80);
  T12(await p.evaluate(() => document.querySelectorAll('.rank-card').length === 1 && JSON.parse(localStorage.getItem('gefei-quest-save-v1')).rankFav.length === 1), 'favorite + 只看收藏 persisted');
  await p.click('#rank-only-fav'); await p.waitForTimeout(80);
  await p.click('.rank-card[data-rank="1"] [data-plan-add]'); await p.waitForTimeout(100);
  T12(await p.evaluate(() => document.querySelectorAll('#rank-plan .plan-item').length === 1 && document.querySelector('.rank-card[data-rank="1"] [data-plan-add]').disabled), 'plan it -> 实操计划');
  await visit('war-kit');
  T12(await p.evaluate(() => document.querySelectorAll('#kit-plan .plan-item').length === 1), 'plan shown on 实操助手 page');
  await p.check('#kit-plan [data-plan-done="0"]'); await p.waitForTimeout(100);
  T12(await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).rankPlan[0].done === true), 'plan item done persisted');
  await visit('home');
  T12(await p.evaluate(() => !!document.querySelector('#home-rank-card') && !!document.querySelector('.site-footer a[href="#war-rank"]')), 'home card + footer link');
  await p.keyboard.press('Control+k'); await p.keyboard.type(await p.evaluate(() => QuestRank.latestItems()[0].name.slice(0, 6))); await p.waitForTimeout(150);
  T12(await p.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => a.getAttribute('href') === '#war-rank')), 'search index includes rank items'); await p.keyboard.press('Escape');
  for (const u of ['data/rank.json', 'data/rank-history/index.json']) { const r = await p.request.get(BASE + u); const j = r.status() === 200 ? await r.json() : null; T12(!!j && (u.endsWith('index.json') ? j.dates.length >= 1 : j.items.length === 10), u + ' served'); }
  const dj12 = await (await p.request.get(BASE + 'daily.json')).json(); T12(dj12.rank && dj12.rank.top3.length === 3, 'daily.json has rank top3');
  console.log('P12 functional fails=' + f12); fail += f12;
  if (SHOTS) {
    await p.evaluate(() => localStorage.clear()); await p.goto(BASE + 'index.html#war-rank'); await p.reload(); await p.waitForTimeout(500); await p.screenshot({ path: `${SHOTS}/p12-rank.png`, fullPage: false });
    const m12 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); cx(m12);
    await m12.goto(BASE + 'index.html#war-rank'); await m12.waitForTimeout(500);
    const w = await m12.evaluate(() => document.documentElement.scrollWidth); console.log((w <= 390 ? 'ok   ' : 'FAIL ') + 'mobile war-rank scrollWidth ' + w); if (w > 390) fail++;
    await m12.screenshot({ path: `${SHOTS}/p12-mobile-rank.png`, fullPage: false });
  }

  // ---------- Phase 13–14 · AI ----------
  let f13 = 0; const T13 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P13 ' + m); if (!c) f13++; };
  const fake = require('./fake-openai.js').start(8766); const FAKE = 'http://127.0.0.1:8766/v1', FAKE_ROOT = 'http://127.0.0.1:8766';
  const aiCfg = () => p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-ai-v1') || 'null'));
  const waitOut = (sel) => p.waitForFunction(s => { const e = document.querySelector(s); return e && e.textContent.trim() && !/正在/.test(e.textContent); }, sel, { timeout: 15000 });
  const waitDone = (sel) => p.waitForFunction(s => /完成|出错/.test((document.querySelector(s) || {}).textContent || ''), sel, { timeout: 15000 });
  // migration from Phase 13 single config
  await p.goto(BASE + 'index.html#me-ai'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('gefei-quest-ai-v1', JSON.stringify({ mode: 'custom', provider: 'deepseek', baseUrl: 'http://127.0.0.1:8766/v1', apiKey: 'good', model: 'fake-model', temperature: 0.5 })); }); await p.reload(); await p.waitForTimeout(200);
  let cfg = await aiCfg();
  T13(cfg.version === 2 && cfg.providers.length === 1 && cfg.providers[0].apiKey === 'good' && cfg.activeId === cfg.providers[0].id && cfg.baseUrl === FAKE && /迁移/.test(cfg.providers[0].name), 'P14 migrate single config -> providers[] (legacy fields kept)');
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(200);
  T13(await p.evaluate(() => !!document.querySelector('#ai-grok') && /赚钱榜雷达/.test(document.body.textContent) && /赚钱项目实施官/.test(document.body.textContent)), 'default Grok Bot mode explains both agents');
  await visit('war-keywords'); await p.fill('#kw-kw', 'pdf merge for mac'); await p.click('#kw-save'); await p.waitForTimeout(150);
  await p.click('.kw-item [data-ai-kw]'); await p.waitForTimeout(100);
  T13(await p.evaluate(() => !!document.querySelector('.kw-item .ai-hint a[href="#me-ai"]')), 'Grok mode: AI button shows hint linking to settings');
  await visit('me-ai'); await p.check('[name=ai-mode][value=custom]'); await p.waitForTimeout(100);
  T13(await p.evaluate(() => /不会写入进度存档/.test(document.querySelector('.ai-warn').textContent) && !!document.querySelector('#ai-custom .empty-illo')), 'custom mode: warning + empty provider list');
  // template clone
  await p.selectOption('#ai-template', 'dashscope'); await p.click('#ai-new'); await p.waitForTimeout(100);
  T13(await p.inputValue('#ai-base') === 'https://dashscope.aliyuncs.com/compatible-mode/v1' && await p.inputValue('#ai-model') === 'qwen-plus' && await p.evaluate(() => document.querySelector('#ai-key').type === 'password'), 'template clone fills base/model, key is password');
  await p.click('#ai-cancel'); await p.waitForTimeout(80);
  // provider A: OpenAI-compatible with custom header
  await p.selectOption('#ai-template', 'custom'); await p.click('#ai-new'); await p.waitForTimeout(100);
  await p.fill('#ai-name', '本地假 OpenAI'); await p.fill('#ai-base', FAKE); await p.fill('#ai-model', 'fake-model');
  await p.fill('#ai-key', 'bad'); await p.click('#ai-test'); await waitOut('#ai-test-out');
  T13(/401/.test(await p.textContent('#ai-test-out')) && /Key/.test(await p.textContent('#ai-test-out')), 'test: 401 explained');
  await p.fill('#ai-key', 'good'); await p.fill('#ai-model', 'missing'); await p.click('#ai-test'); await waitOut('#ai-test-out');
  T13(/404/.test(await p.textContent('#ai-test-out')) && /模型/.test(await p.textContent('#ai-test-out')), 'test: 404 explained');
  await p.fill('#ai-base', 'http://127.0.0.1:9/v1'); await p.fill('#ai-model', 'fake-model'); await p.click('#ai-test'); await waitOut('#ai-test-out');
  T13(/CORS/.test(await p.textContent('#ai-test-out')), 'test: network/CORS explained');
  await p.fill('#ai-base', FAKE); await p.fill('#ai-model', ''); await p.click('#ai-fetch'); await waitOut('#ai-test-out');
  T13(/3 个模型/.test(await p.textContent('#ai-test-out')) && (await p.inputValue('#ai-models')).split('\n').length === 3 && await p.inputValue('#ai-model') === 'fake-model', 'P14 fetch models via /models');
  await p.click('#ai-hdr-add'); await p.fill('.hdr-row .hdr-k', 'X-Quest-Test'); await p.fill('.hdr-row .hdr-v', 'hello-14');
  await p.click('#ai-test'); await waitOut('#ai-test-out');
  T13(/连接成功/.test(await p.textContent('#ai-test-out')) && fake.last.headers['x-quest-test'] === 'hello-14' && fake.last.headers.authorization === 'Bearer good', 'test success + custom header sent');
  await p.click('#ai-save'); await p.waitForTimeout(100);
  // provider B: Anthropic
  await p.selectOption('#ai-template', 'anthropic'); await p.click('#ai-new'); await p.waitForTimeout(100);
  await p.fill('#ai-name', '假 Anthropic'); await p.fill('#ai-base', FAKE_ROOT); await p.fill('#ai-key', 'good'); await p.fill('#ai-model', 'fake-claude');
  await p.click('#ai-test'); await waitOut('#ai-test-out');
  T13(/连接成功/.test(await p.textContent('#ai-test-out')) && fake.last.url === '/v1/messages' && fake.last.headers['x-api-key'] === 'good' && fake.last.headers['anthropic-version'] && !fake.last.headers.authorization, 'P14 anthropic format test (x-api-key, /v1/messages)');
  await p.click('#ai-save'); await p.waitForTimeout(100);
  // provider C: Ollama, no key
  await p.selectOption('#ai-template', 'ollama'); await p.click('#ai-new'); await p.waitForTimeout(100);
  await p.fill('#ai-name', '假 Ollama'); await p.fill('#ai-base', FAKE_ROOT); await p.fill('#ai-model', ''); await p.click('#ai-fetch'); await waitOut('#ai-test-out');
  T13(fake.last.url === '/api/tags' && await p.inputValue('#ai-model') === 'qwen2.5:7b', 'P14 ollama fetch models via /api/tags');
  await p.click('#ai-test'); await waitOut('#ai-test-out');
  T13(/连接成功/.test(await p.textContent('#ai-test-out')) && fake.last.url === '/api/chat', 'P14 ollama test without key');
  await p.click('#ai-save'); await p.waitForTimeout(100);
  cfg = await aiCfg();
  T13(cfg.providers.length === 3 && cfg.providers[0].name === '本地假 OpenAI' && cfg.activeId === cfg.providers[0].id && cfg.providers[0].headers[0].k === 'X-Quest-Test', 'P14 three providers saved, first active');
  const saveStr = await p.evaluate(() => localStorage.getItem('gefei-quest-save-v1') || '');
  T13(!/"apiKey"|X-Quest-Test|"good"/.test(saveStr), 'keys/providers never in gefei-quest-save-v1');
  // duplicate / edit / delete
  await p.click('.prov[data-prov="' + cfg.providers[1].id + '"] [data-pact="dup"]'); await p.waitForTimeout(80);
  cfg = await aiCfg(); T13(cfg.providers.length === 4 && cfg.providers[2].name === '假 Anthropic 副本' && cfg.providers[2].id !== cfg.providers[1].id, 'P14 duplicate provider');
  await p.click('.prov[data-prov="' + cfg.providers[2].id + '"] [data-pact="edit"]'); await p.waitForTimeout(80); await p.fill('#ai-name', '改名的 Claude'); await p.click('#ai-save'); await p.waitForTimeout(80);
  cfg = await aiCfg(); T13(cfg.providers[2].name === '改名的 Claude' && cfg.providers.length === 4, 'P14 edit provider');
  p.once('dialog', d => d.accept()); await p.click('.prov[data-prov="' + cfg.providers[2].id + '"] [data-pact="del"]'); await p.waitForTimeout(80);
  cfg = await aiCfg(); T13(cfg.providers.length === 3, 'P14 delete provider');
  await p.click('.prov[data-prov="' + cfg.providers[1].id + '"] [data-pact="test"]'); await p.waitForFunction(() => /连接成功|错误|无法/.test(document.querySelectorAll('.prov-test')[1].textContent), null, { timeout: 10000 });
  T13(/连接成功/.test(await p.evaluate(() => document.querySelectorAll('.prov-test')[1].textContent)), 'P14 per-provider test button');
  // export without keys / import
  await p.click('#ai-export'); await p.waitForTimeout(80);
  const exp = await p.evaluate(() => window.__lastAiExport);
  T13(/X-Quest-Test/.test(exp) && !/apiKey|"good"/.test(exp) && JSON.parse(exp).providers.length === 3, 'P14 export JSON without keys');
  await p.setInputFiles('#ai-import', { name: 'providers.json', mimeType: 'application/json', buffer: Buffer.from(exp) }); await p.waitForTimeout(200);
  cfg = await aiCfg(); T13(cfg.providers.length === 6 && cfg.providers.slice(3).every(x => x.apiKey === '') && /已导入 3/.test(await p.textContent('#ai-io-out')), 'P14 import adds providers with empty keys');
  if (SHOTS) { await p.reload(); await p.waitForTimeout(300); await p.screenshot({ path: `${SHOTS}/p14-ai-providers.png`, fullPage: true }); await p.screenshot({ path: `${SHOTS}/p13-ai-settings.png`, fullPage: true }); }
  // keyword AI streaming via active OpenAI provider
  await visit('war-keywords'); await p.waitForTimeout(100);
  T13(await p.evaluate(() => document.querySelector('.ai-switch-bar select') && document.querySelectorAll('.ai-switch-bar option').length === 6), 'P14 provider switcher near AI buttons');
  await p.click('.kw-item [data-ai-kw]'); await waitDone('.kw-item .ai-status');
  const kwOut = await p.evaluate(() => { const b = document.querySelector('.kw-item .ai-body'); return { h: !!b.querySelector('h2,h3,h4'), strong: !!b.querySelector('strong'), li: b.querySelectorAll('li').length, script: !!b.querySelector('script'), js: [...b.querySelectorAll('a')].some(a => /^javascript/i.test(a.getAttribute('href') || '')), txt: b.textContent }; });
  T13(kwOut.h && kwOut.strong && kwOut.li >= 2 && !kwOut.script && !kwOut.js && /测试回复/.test(kwOut.txt), 'AI 分析这个词: streamed markdown, sanitized');
  T13(fake.last.body.stream === true && /合法/.test(fake.last.body.messages[0].content) && /承诺/.test(fake.last.body.messages[0].content) && /pdf merge for mac/.test(fake.last.body.messages[1].content) && fake.last.headers['x-quest-test'] === 'hello-14', 'request: stream + legality/no-income prompt + custom header');
  if (SHOTS) { await p.evaluate(() => document.querySelector('.kw-item').scrollIntoView()); await p.screenshot({ path: `${SHOTS}/p13-ai-keyword.png` }); }
  // switch to Anthropic via switcher, run rank card
  cfg = await aiCfg(); await visit('war-rank'); await p.waitForTimeout(150);
  await p.selectOption('.ai-switch-bar select', cfg.providers[1].id); await p.waitForTimeout(80);
  T13((await aiCfg()).activeId === cfg.providers[1].id, 'P14 switcher changes active provider');
  await p.click('.rank-card[data-rank="1"] [data-ai-rank]'); await waitDone('.rank-card .ai-status');
  T13(fake.last.url === '/v1/messages' && fake.last.body.stream && /每日赚钱榜/.test(fake.last.body.messages[0].content) && /合法/.test(fake.last.body.system) && await p.evaluate(() => !!document.querySelector('.rank-card[data-rank="1"] .ai-body li')), 'P14 anthropic streaming on rank card');
  // Ollama on kit
  await p.selectOption('.ai-switch-bar select', cfg.providers[2].id); await visit('war-kit'); await p.fill('#kit-keyword', 'pdf merge for mac'); await p.waitForTimeout(100); await p.click('[data-ai-kit]');
  await waitDone('.ai-kit .ai-status');
  T13(fake.last.url === '/api/chat' && /title/.test(fake.last.body.messages[1].content) && await p.evaluate(() => /测试回复/.test(document.querySelector('.ai-kit .ai-body').textContent)), 'P14 ollama NDJSON streaming on 实操助手');
  await visit('me-ai'); await p.click('#ai-forget-all'); await p.waitForTimeout(80);
  T13(await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-ai-v1')).providers.every(x => !x.apiKey)), 'forget all keys');
  await p.keyboard.press('Control+k'); await p.keyboard.type('DeepSeek'); await p.waitForTimeout(150);
  T13(await p.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => a.getAttribute('href') === '#me-ai')), 'search finds AI 设置'); await p.keyboard.press('Escape');
  T13(await p.evaluate(() => !!document.querySelector('.site-footer a[href="#me-ai"]')), 'footer link');
  const m13 = await b.newPage({ viewport: { width: 390, height: 844 } }); cx(m13); await m13.goto(BASE + 'index.html#me-ai');
  const cfgStr = JSON.stringify(await aiCfg());
  await m13.evaluate(s => { const c = JSON.parse(s); c.mode = 'custom'; localStorage.setItem('gefei-quest-ai-v1', JSON.stringify(c)); }, cfgStr); await m13.reload(); await m13.waitForTimeout(300);
  await m13.click('.prov [data-pact="edit"]'); await m13.waitForTimeout(150);
  const w13 = await m13.evaluate(() => document.documentElement.scrollWidth); T13(w13 <= 390, 'mobile me-ai (list + editor) scrollWidth ' + w13);
  for (const h of ['war-keywords', 'war-rank']) { await m13.goto(BASE + 'index.html#' + h); await m13.waitForTimeout(300); const w = await m13.evaluate(() => document.documentElement.scrollWidth); T13(w <= 390, 'mobile ' + h + ' scrollWidth ' + w); }
  fake.close();
  console.log('P13 functional fails=' + f13); fail += f13;
  // ---- P15 平台变现 ----
  let f15 = 0; const T15 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P15 ' + m); if (!c) f15++; };
  await visit('pm');
  const pm = await p.evaluate(() => ({ cats: document.querySelectorAll('.pm-cat').length, guide: !!document.querySelector('.pm-guide table'), note: /官方未公开\/以后台为准/.test(document.querySelector('.pm-note').textContent), groups: document.querySelectorAll('.pm-group').length }));
  T15(pm.cats === 13 && pm.groups === 2, 'index: 2 groups / 13 categories (' + pm.cats + ')');
  T15(pm.guide && pm.note, 'index: 新手怎么选 + 来源须知');
  const D15 = await p.evaluate(() => window.QUEST_PLATFORMS);
  T15(D15.PLATFORMS.every(x => x.ways && x.gate && x.steps.length && x.fit && x.risk && x.src.length && x.up && x.rules.length), 'every platform has all fields (' + D15.PLATFORMS.length + ')');
  T15(D15.PLATFORMS.every(x => x.rules.every(r => r[1] || /官方未公开\/以后台为准/.test(r[0]))), 'every rule has a source or NA marker');
  T15(D15.PLATFORMS.filter(x => x.cat.indexOf('gl-') === 0).every(x => x.access && x.payout), 'overseas platforms have 大陆可用性 + 收款方式');
  T15(['微博', '红果', 'YouTube', 'TikTok', 'X（', 'Medium', 'Substack', 'Patreon', 'Twitch', 'Pinterest', 'Instagram'].every(n => D15.PLATFORMS.some(x => x.name.indexOf(n) >= 0)), 'required platforms present');
  for (const c of D15.CATS) { await visit('pm-' + c.id); const r = await p.evaluate(() => ({ t: document.querySelectorAll('.pm-compare tbody tr').length, c: document.querySelectorAll('.pm-card').length })); T15(r.t > 0 && r.t === r.c, 'category ' + c.id + ' table rows=cards=' + r.c); }
  await visit('cn-short-drama'); T15(await p.evaluate(() => document.querySelectorAll('.pm-card').length === 6 && location.hash.indexOf('drama') > 0), 'alias #cn-short-drama → 短剧');
  T15(await p.evaluate(() => document.querySelectorAll('.pm-link').length > 0 && !!window.QUEST_PLATFORM_LINKS.total), 'link status badges');
  await visit('lib'); T15(await p.evaluate(() => !!document.querySelector('#pm-banner')), 'lib banner');
  T15(await p.evaluate(() => !!document.querySelector('.site-footer a[href="#pm"]')), 'footer link');
  await p.keyboard.press('Control+k'); await p.keyboard.type('红果'); await p.waitForTimeout(150);
  T15(await p.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => /^#pm-cn-drama/.test(a.getAttribute('href')))), 'search finds 红果'); await p.keyboard.press('Escape');
  for (const h of ['pm', 'pm-cn-drama', 'pm-gl-video']) { await m13.goto(BASE + 'index.html#' + h); await m13.waitForTimeout(300); const w = await m13.evaluate(() => document.documentElement.scrollWidth); T15(w <= 390, 'mobile ' + h + ' scrollWidth ' + w); }
  console.log('P15 functional fails=' + f15); fail += f15;
  // ---- P16 实操工作台 ----
  let f16 = 0; const T16 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P16 ' + m); if (!c) f16++; };
  const gh = require('./fake-github.js').start(8767); const GH = 'http://127.0.0.1:8767';
  const fake16 = require('./fake-openai.js').start(8766);
  await visit('me-accounts');
  T16(await p.evaluate(() => document.querySelectorAll('.wb-plat').length >= 17 && ['A', 'B', 'C', 'D'].every(k => document.querySelector('.wb-plat .wb-cls-' + k))), 'accounts: platform list with A–D classes');
  await p.fill('#gh-token', 'wrong'); await p.fill('#gh-base', GH); await p.click('#gh-form button[type=submit]'); await p.waitForTimeout(400);
  T16(/401/.test(await p.textContent('#gh-msg')), 'bad token → 401 message');
  await p.fill('#gh-token', 'github_pat_test'); await p.fill('#gh-base', GH); await p.click('#gh-form button[type=submit]'); await p.waitForTimeout(400);
  T16(/tester/.test(await p.textContent('#gh-msg')) && await p.evaluate(() => /已连接/.test(document.querySelector('[data-plat="github"]').textContent)), 'token verified → 已连接 tester');
  T16(await p.evaluate(() => { const s = localStorage.getItem('gefei-quest-save-v1') || ''; return s.indexOf('github_pat_test') < 0 && /github_pat_test/.test(localStorage.getItem('gefei-quest-accounts-v1')); }), 'token stored in separate key, not in save');
  await visit('war-kit'); await p.fill('#kit-keyword', 'pdf merge tool'); await p.fill('#kit-intro', 'Merge PDF files online for free.'); await p.waitForTimeout(250);
  T16(await p.evaluate(() => !!document.querySelector('#kit-publish') && !!document.querySelector('#panel-war .wb-pipe [data-step="kit"].done')), 'kit: pipeline + 发布 button');
  await p.click('#kit-publish'); await p.waitForTimeout(300);
  T16(await p.evaluate(() => location.hash === '#war-publish' && document.querySelector('#pub-repo').value === 'pdf-merge-tool' && !!document.querySelector('.wb-preview')), 'publish page prefilled + preview iframe');
  const callsBefore = gh.st.calls.length;
  await p.click('#pub-dry'); await p.waitForTimeout(500);
  T16(await p.evaluate(() => /将新建/.test(document.querySelector('#pub-out').textContent) && document.querySelectorAll('.wb-plan tr[data-action="create"]').length === 3), 'dry-run: new repo + 3 files to create');
  T16(gh.st.calls.slice(callsBefore).every(c => c.method === 'GET') && !gh.repos['tester/pdf-merge-tool'], 'dry-run made no writes');
  await p.click('#pub-go'); await p.waitForTimeout(800);
  const R = gh.repos['tester/pdf-merge-tool'];
  T16(R && /pdf merge tool/i.test(R.files['index.html'] || '') && R.files['robots.txt'] && R.files['sitemap.xml'] && R.pages, 'publish: repo created, 3 files written, Pages enabled');
  T16(await p.evaluate(() => /tester\.github\.io\/pdf-merge-tool/.test(document.querySelector('#pub-url').href)), 'publish: site URL shown');
  T16(await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); return s.sites.items.some(x => x.host === 'GitHub Pages' && /tester\.github\.io/.test(x.domain) && x.status === '已上线') && s.publish.some(x => x.ok && !x.dry); }), 'publish → 台账 site + publish record');
  await p.click('#pub-dry'); await p.waitForTimeout(500);
  T16(await p.evaluate(() => document.querySelectorAll('.wb-plan tr[data-action="same"]').length === 3 && /已开启/.test(document.querySelector('#pub-out').textContent)), 're-preview: all files 不变, Pages 已开启');
  await visit('war-kit'); await p.fill('#kit-intro', 'Merge PDFs fast, free, in your browser.'); await p.waitForTimeout(150); await visit('war-publish'); await p.click('#pub-dry'); await p.waitForTimeout(500);
  T16(await p.evaluate(() => document.querySelectorAll('.wb-plan tr[data-action="update"]').length >= 1), 'changed kit → update detected');
  await p.click('#pub-go'); await p.waitForTimeout(600);
  T16(/in your browser/.test(gh.repos['tester/pdf-merge-tool'].files['index.html']), 'update written with sha');
  // 导入
  await visit('me-analytics');
  const siteId = await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).sites.items.find(x => x.host === 'GitHub Pages').id);
  const csv16 = ['\ufeffDate,Clicks,Impressions,CTR,Position']; for (let i = 1; i <= 30; i++) csv16.push(`2026-09-${String(i).padStart(2, '0')},${i % 5 + (i > 15 ? 3 : 0)},${100 + i * 4},${(2 + i / 10).toFixed(1)}%,${(20 - i / 3).toFixed(1)}`);
  await p.selectOption('#imp-site', siteId);
  await p.setInputFiles('#imp-file', { name: 'Dates.csv', mimeType: 'text/csv', buffer: Buffer.from(csv16.join('\n')) });
  await p.click('#imp-form button[type=submit]'); await p.waitForTimeout(300);
  T16(await p.evaluate(() => document.querySelector('#an-view').dataset.kind === 'gsc-dates' && !!document.querySelector('#an-view .wb-chart polyline') && !!document.querySelector('#an-trend')), 'GSC dates CSV → chart + trend');
  T16(await p.evaluate(id => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); const l = s.sites.items.find(x => x.id === id).logs.find(x => x.month === '2026-09'); return l && l.clicks > 0 && l.imp > 3000; }, siteId), 'GSC → 台账 2026-09 month log');
  await p.fill('#imp-text', '热门查询,点击次数,展示,点击率,排名\npdf merge,12,300,4%,6.2\nmerge pdf mac,0,140,0%,11.5\n"combine pdf, free",1,60,1.6%,14\n'); await p.click('#imp-form button[type=submit]'); await p.waitForTimeout(300);
  T16(await p.evaluate(() => document.querySelector('#an-view').dataset.kind === 'gsc-queries' && document.querySelectorAll('.wb-top tbody tr').length === 3 && /merge pdf mac/.test(document.querySelector('.wb-opp').textContent)), 'GSC queries → top table + 机会词');
  await p.selectOption('#imp-site', siteId); await p.fill('#imp-text', '日期,估算收入 (USD),网页浏览量,点击次数\n2026-09-01,1.20,300,2\n2026-09-02,0.80,280,1\n'); await p.click('#imp-form button[type=submit]'); await p.waitForTimeout(300);
  T16(await p.evaluate(id => document.querySelector('#an-view').dataset.kind === 'adsense' && JSON.parse(localStorage.getItem('gefei-quest-save-v1')).sites.items.find(x => x.id === id).logs.find(x => x.month === '2026-09').usd === 2, siteId), 'AdSense CSV → 台账 usd 2.00');
  await p.selectOption('#imp-kind', 'generic'); await p.selectOption('#imp-plat', 'xhs'); await p.selectOption('#imp-site', '');
  await p.fill('#imp-text', '日期,观看量,点赞,涨粉\n2026/9/1,1.2万,30,5\n2026/9/2,8000,25,3\n'); await p.click('#imp-form button[type=submit]'); await p.waitForTimeout(300);
  T16(await p.evaluate(() => document.querySelector('#an-view').dataset.kind === 'generic' && /小红书/.test(document.querySelector('#an-view').textContent) && /20,000/.test(document.querySelector('#an-view .stat-grid').textContent)), 'generic 小红书 CSV (万 parsed) → totals');
  await p.fill('#imp-text', 'foo,bar\n1,2'); await p.click('#imp-form button[type=submit]'); await p.waitForTimeout(200);
  T16(/导入失败/.test(await p.textContent('#imp-msg')), 'bad CSV → friendly error');
  await p.click('#an-ai'); await p.waitForTimeout(1200);
  T16(/数据分析师/.test(JSON.stringify(fake16.last && fake16.last.body || {})) && await p.evaluate(() => !!document.querySelector('#an-ai-out .ai-out')), 'AI 分析 uses AI settings provider');
  await visit('me-analytics'); const done16 = await p.evaluate(() => [...document.querySelectorAll('#panel-me .wb-pipe .wb-step.done')].map(a => a.dataset.step).join(',')); T16(['keywords', 'kit', 'publish', 'analytics'].every(k => done16.split(',').includes(k)), 'pipeline core steps done (' + done16 + ')');
  T16(await p.evaluate(() => ['#me-accounts', '#me-analytics', '#war-publish'].every(h => document.querySelector('.site-footer a[href="' + h + '"]'))), 'footer links');
  await p.keyboard.press('Control+k'); await p.keyboard.type('导入'); await p.waitForTimeout(150);
  T16(await p.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => a.getAttribute('href') === '#me-analytics')), 'search finds 数据导入'); await p.keyboard.press('Escape');
  const st16 = await p.evaluate(() => localStorage.getItem('gefei-quest-save-v1'));
  const acc16 = await p.evaluate(() => localStorage.getItem('gefei-quest-accounts-v1'));
  await m13.evaluate(([s, a]) => { localStorage.setItem('gefei-quest-save-v1', s); localStorage.setItem('gefei-quest-accounts-v1', a); }, [st16, acc16]); await m13.reload(); await m13.waitForTimeout(300);
  for (const h of ['me-accounts', 'war-publish', 'me-analytics']) { await m13.goto(BASE + 'index.html#' + h); await m13.waitForTimeout(350); const w = await m13.evaluate(() => document.documentElement.scrollWidth); T16(w <= 390, 'mobile ' + h + ' scrollWidth ' + w); }
  if (SHOTS) {
    await m13.goto(BASE + 'index.html#me-accounts'); await m13.waitForTimeout(400); await m13.screenshot({ path: `${SHOTS}/p16-accounts.png`, fullPage: true });
    await m13.goto(BASE + 'index.html#war-publish'); await m13.waitForTimeout(400); await m13.evaluate(() => document.querySelector('#pub-dry').click()); await m13.waitForTimeout(600); await m13.screenshot({ path: `${SHOTS}/p16-publish.png`, fullPage: true });
    await m13.goto(BASE + 'index.html#me-analytics'); await m13.waitForTimeout(300); await m13.evaluate(() => document.querySelector('.wb-chips .chip').click()); await m13.waitForTimeout(300); await m13.screenshot({ path: `${SHOTS}/p16-analytics.png`, fullPage: true });
  }
  gh.close(); fake16.close();
  console.log('P16 functional fails=' + f16); fail += f16;
  // ---- P17 内容分发 ----
  let f17 = 0; const T17 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P17 ' + m); if (!c) f17++; };
  const fake17 = require('./fake-openai.js').start(8766);
  await p.addInitScript(() => document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[data-sh-open]'); if (a) { e.preventDefault(); window.__opened = (window.__opened || []).concat(a.href); } }, true));
  const aiCfg17 = await p.evaluate(() => localStorage.getItem('gefei-quest-ai-v1'));
  await p.evaluate(() => { const c = JSON.parse(localStorage.getItem('gefei-quest-ai-v1')); c.mode = 'grok'; localStorage.setItem('gefei-quest-ai-v1', JSON.stringify(c)); });
  await p.goto(BASE + 'index.html#war-share'); await p.reload(); await p.waitForTimeout(300);
  T17(await p.evaluate(() => document.querySelectorAll('[data-src]').length === 4 && /tester\.github\.io\/pdf-merge-tool/.test(document.querySelector('.sh-src-form').textContent)), 'sources (4) + kit uses published Pages URL');
  T17(await p.evaluate(() => /模板/.test(document.querySelector('#sh-gen').textContent)), 'Grok Bot mode → template button');
  await p.evaluate(() => document.querySelectorAll('.sh-plats input').forEach(c => { if (!c.checked) c.click(); }));
  await p.click('#sh-gen'); await p.waitForTimeout(300);
  const n17 = await p.evaluate(() => document.querySelectorAll('.sh-card').length);
  T17(n17 === 14, 'template drafts for all 14 platforms (' + n17 + ')');
  T17(await p.evaluate(() => { const S = QuestShare, d = JSON.parse(localStorage.getItem('gefei-quest-save-v1')).shareDraft.out; return d.x.parts.every(t => S.xLen(t) <= 280) && [...d.xhs.title].length <= 20 && d.xhs.tags.length > 0 && d.reddit.title && d.medium.body; }), 'X ≤280, 小红书 title ≤20 + tags, reddit/medium title+body');
  await p.fill('.sh-card[data-plat="x"] textarea', 'a'.repeat(300)); await p.waitForTimeout(80);
  T17(await p.evaluate(() => { const c = document.querySelector('.sh-card[data-plat="x"] .sh-count'); return c.classList.contains('over') && /300 \/ 280/.test(c.textContent); }), 'X counter 300/280 over-limit');
  await p.fill('.sh-card[data-plat="x"] textarea', '中文测试 https://example.com/a/very/long/path/that/is/long'); await p.waitForTimeout(80);
  T17(await p.evaluate(() => /^32 \/ 280/.test(document.querySelector('.sh-card[data-plat="x"] .sh-count').textContent)), 'X counter: CJK×2 + URL=23');
  await p.click('.sh-card[data-plat="x"] [data-sh-add]'); await p.waitForTimeout(150);
  T17(await p.evaluate(() => document.querySelectorAll('.sh-card[data-plat="x"] textarea').length === 2), 'add thread part');
  await p.evaluate(() => { window.__opened = []; document.querySelectorAll('.sh-card [data-sh-open]').forEach(a => { if (!a.hasAttribute('data-i')) a.click(); }); });
  const op = await p.evaluate(() => window.__opened);
  const want = { x: /^https:\/\/x\.com\/intent\/post\?text=%E4%B8%AD%E6%96%87/, weibo: /^https:\/\/service\.weibo\.com\/share\/share\.php\?url=https%3A%2F%2Ftester\.github\.io.*&title=/, reddit: /^https:\/\/www\.reddit\.com\/submit\?url=https%3A%2F%2Ftester.*&title=/, linkedin: /^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\/\?url=https%3A%2F%2Ftester/, facebook: /^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=https%3A%2F%2Ftester/, pinterest: /^https:\/\/www\.pinterest\.com\/pin\/create\/button\/\?url=.*&description=/, telegram: /^https:\/\/t\.me\/share\/url\?url=https%3A%2F%2Ftester.*&text=/, whatsapp: /^https:\/\/wa\.me\/\?text=/, xhs: /^https:\/\/creator\.xiaohongshu\.com\/publish\/publish$/, zhihu: /^https:\/\/zhuanlan\.zhihu\.com\/write$/, wechat: /^https:\/\/mp\.weixin\.qq\.com\/$/, toutiao: /^https:\/\/mp\.toutiao\.com\//, douyin: /^https:\/\/creator\.douyin\.com\//, medium: /^https:\/\/medium\.com\/new-story$/ };
  for (const k of Object.keys(want)) T17(op.some(u => want[k].test(u)), 'open URL ' + k);
  T17(await p.evaluate(() => /share-offsite/.test([...document.querySelectorAll('[data-sh-open]')].map(a => a.href).join(' ')) && !/shareActive/.test([...document.querySelectorAll('[data-sh-open]')].map(a => a.href).join(' '))), 'LinkedIn uses official share-offsite only');
  await p.click('.sh-card[data-plat="weibo"] [data-sh-copy]'); await p.waitForTimeout(150);
  const sh17 = await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).shares);
  T17(sh17.length === 15 && sh17.filter(x => x.action === 'open').length === 14 && sh17.some(x => x.action === 'copy' && x.platform === 'weibo') && sh17.every(x => x.at && x.title), 'shares logged (14 open + 1 copy)');
  await visit('me-analytics');
  T17(await p.evaluate(() => { const t = document.querySelector('#share-timeline'); return t && /15 次/.test(t.textContent) && t.querySelectorAll('.sh-bar').length === 14; }), 'analytics: share timeline + per-platform bars');
  await visit('me-accounts');
  T17(await p.evaluate(() => document.querySelectorAll('.wb-free').length >= 12 && /已分发/.test(document.querySelector('.wb-plat[data-plat="x"]').textContent) && /放弃/.test(document.querySelector('.wb-plat[data-plat="x"]').textContent) && document.querySelector('.wb-plat[data-plat="x"] .wb-cls-D')), 'accounts: free-path badges, X marked D + 已分发');
  // 赚钱榜来源 + AI
  await p.evaluate(s => localStorage.setItem('gefei-quest-ai-v1', s), aiCfg17); await visit('war-share'); await p.reload(); await p.waitForTimeout(300);
  await p.click('[data-src="rank"]'); await p.waitForTimeout(150);
  T17(await p.evaluate(() => /用 AI 生成/.test(document.querySelector('#sh-gen').textContent) && document.querySelectorAll('#sh-rank option').length > 0), 'rank source + AI mode button');
  await p.click('#sh-gen'); await p.waitForTimeout(800);
  const ai17 = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('gefei-quest-save-v1')).shareDraft; return { xhs: d.out.xhs.title, x: d.out.x.parts.length, weibo: d.out.weibo.text, reddit: d.out.reddit.title, title: d.srcSnap.title, msg: document.querySelector('#sh-msg').textContent }; });
  const rank1 = await p.evaluate(() => QuestRank.latestItems()[0].name);
  T17(ai17.xhs === 'AI 小红书标题' && ai17.x === 2 && ai17.weibo === 'AI 微博正文' && !!ai17.reddit && ai17.title === rank1 && /模板补齐/.test(ai17.msg), 'AI drafts parsed + template fill-in');
  T17(/平台ID/.test(JSON.stringify(fake17.last && fake17.last.body || {})) && /不承诺收益/.test(JSON.stringify(fake17.last.body)), 'AI prompt via AI settings, no-income-promise rule');
  await p.click('[data-src="url"]'); await p.waitForTimeout(100); await p.fill('#sh-url', 'notaurl'); await p.waitForTimeout(50);
  T17(await p.evaluate(() => document.querySelector('#sh-gen').disabled), 'invalid URL source disables generate');
  await p.fill('#sh-url', 'https://example.com/'); await p.waitForTimeout(50);
  T17(await p.evaluate(() => !document.querySelector('#sh-gen').disabled), 'valid URL enables generate');
  T17(await p.evaluate(() => !!document.querySelector('.site-footer a[href="#war-share"]') && !!document.querySelector('.wb-pipe [data-step="share"].done')), 'footer link + pipeline share step');
  await p.keyboard.press('Control+k'); await p.keyboard.type('分发'); await p.waitForTimeout(150);
  T17(await p.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => a.getAttribute('href') === '#war-share')), 'search finds 内容分发'); await p.keyboard.press('Escape');
  const st17 = await p.evaluate(() => localStorage.getItem('gefei-quest-save-v1'));
  await m13.evaluate(([s, a]) => { localStorage.setItem('gefei-quest-save-v1', s); const c = JSON.parse(a); c.mode = 'grok'; localStorage.setItem('gefei-quest-ai-v1', JSON.stringify(c)); }, [st17, aiCfg17]);
  await m13.goto(BASE + 'index.html#war-share'); await m13.reload(); await m13.waitForTimeout(300);
  await m13.evaluate(() => document.querySelector('[data-src="kit"]').click()); await m13.waitForTimeout(150); await m13.evaluate(() => document.querySelector('#sh-gen').click()); await m13.waitForTimeout(300);
  const w17 = await m13.evaluate(() => document.documentElement.scrollWidth); T17(w17 <= 390, 'mobile war-share scrollWidth ' + w17);
  if (SHOTS) await m13.screenshot({ path: `${SHOTS}/p17-share.png`, fullPage: true });
  fake17.close();
  console.log('P17 functional fails=' + f17); fail += f17;
  let f18 = 0; {
  // ===================== Phase 18 =====================
  const fg = require('./fake-google.js').start(8768);
 const T18 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P18 ' + m); if (!c) f18++; };
  const vis = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); return !!e && !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length); }, sel);
  // 紧凑：赚钱榜分页
  await visit('war-rank'); await p.reload(); await p.waitForTimeout(300);
  const rk = await p.evaluate(() => { const g = document.querySelector('#panel-war .rank-grid'); const c = [...g.querySelectorAll(':scope > .rank-card')]; return { all: c.length, shown: c.filter(x => !x.classList.contains('cx-off')).length, pager: !!document.querySelector('#panel-war .cx-pager'), tog: document.querySelectorAll('#panel-war .rank-card .cx-toggle').length }; });
  T18(rk.all > 6 && rk.shown === 6 && rk.pager && rk.tog === rk.all, 'rank: paginate 6/page + per-card collapse (' + rk.shown + '/' + rk.all + ')');
  await p.click('#panel-war .cx-pager [data-pg="1"]'); await p.waitForTimeout(80);
  T18(await p.evaluate(() => { const c = [...document.querySelectorAll('#panel-war .rank-grid > .rank-card')]; return c[0].classList.contains('cx-off') && !c[6].classList.contains('cx-off'); }), 'rank: page 2 shows cards 7+');
  await p.click('#panel-war .cx-pager [data-pg="all"]'); await p.waitForTimeout(80);
  T18(await p.evaluate(() => [...document.querySelectorAll('#panel-war .rank-grid > .rank-card')].every(x => !x.classList.contains('cx-off'))), 'rank: 全部 shows every card');
  // 资源库：分类 显示更多
  await visit('lib'); await p.reload(); await p.waitForTimeout(300);
  const lb = await p.evaluate(() => { const s = [...document.querySelectorAll('#res-sections > .res-section')]; return { all: s.length, shown: s.filter(x => !x.classList.contains('cx-off')).length, btn: !!document.querySelector('#res-sections + .cx-more-btn') }; });
  T18(lb.all >= 7 && lb.shown === 3 && lb.btn, 'lib: first 3 categories + 显示更多分类');
  await p.click('#res-sections + .cx-more-btn'); await p.waitForTimeout(80);
  T18(await p.evaluate(() => [...document.querySelectorAll('#res-sections > .res-section')].every(x => !x.classList.contains('cx-off'))), 'lib: 显示更多 reveals all categories (content preserved)');
  // 平台变现分类：标签 + 分页 + 深链接展开
  await visit('pm-cn-media'); await p.reload(); await p.waitForTimeout(300);
  const pm = await p.evaluate(() => ({ tabs: [...document.querySelectorAll('#panel-lib .cx-tabs .cx-tab-btn')].map(b => b.textContent), cards: document.querySelectorAll('#panel-lib .pm-card').length, shown: [...document.querySelectorAll('#panel-lib .pm-card')].filter(x => !x.classList.contains('cx-off')).length, dl: document.querySelectorAll('#panel-lib .pm-card dl > .cx-body.cx-off').length, table: !!document.querySelector('#panel-lib .pm-table-wrap') }));
  T18(pm.tabs.length === 2 && /平台详情/.test(pm.tabs[0]) && pm.tabs[1] === '对比表' && pm.table, 'pm category: tabs 平台详情 / 对比表 (' + pm.tabs.join('|') + ')');
  T18(pm.cards >= 7 && pm.shown === 6 && pm.dl === pm.cards, 'pm category: cards paginated 6 + dl collapsed (' + pm.shown + '/' + pm.cards + ')');
  const lastId = await p.evaluate(() => { const c = [...document.querySelectorAll('#panel-lib .pm-card')]; return c[c.length - 1].id.replace('pm-p-', ''); });
  await p.goto(BASE + 'index.html#pm-cn-media/' + lastId); await p.reload(); await p.waitForTimeout(400);
  T18(await vis(p, '#pm-p-' + lastId), 'pm deep link #pm-cn-media/' + lastId + ' reveals card on page 2');
  await visit('pm-cn'); await p.reload(); await p.waitForTimeout(300);
  T18(await p.evaluate(() => document.querySelectorAll('#panel-lib details.pm-det').length >= 8 && document.querySelectorAll('#panel-lib details.pm-det .pm-table-wrap').length >= 8), 'pm-cn: per-category tables in details (all kept)');
  // 手册：分节折叠 + 目录跳转自动展开
  await visit('guide-monetize-playbook'); await p.reload(); await p.waitForTimeout(400);
  const dc = await p.evaluate(() => ({ secs: document.querySelectorAll('article.doc-body .cx-docsec').length, closed: document.querySelectorAll('article.doc-body .cx-docsec > .cx-body.cx-off').length, ids: [...document.querySelectorAll('.doc-toc a[data-target]')].map(a => a.getAttribute('data-target')) }));
  T18(dc.secs >= 5 && dc.closed >= 3, 'doc: sections collapsible (' + dc.secs + ' secs, ' + dc.closed + ' closed)');
  const tgt = dc.ids[dc.ids.length - 1];
  await p.evaluate(t => document.querySelector('.doc-toc a[data-target="' + t + '"]').click(), tgt); await p.waitForTimeout(300);
  T18(await p.evaluate(t => { const e = document.getElementById(t); return !!e && !e.closest('.cx-off'); }, tgt), 'doc: TOC click reveals collapsed section');
  // 首页：标签；#home-faq 深链接
  await visit('home'); await p.reload(); await p.waitForTimeout(300);
  const hm = await p.evaluate(() => ({ tabs: document.querySelectorAll('.home-wrap .cx-tabs .cx-tab-btn').length, faqOff: [...document.querySelectorAll('.home-wrap > [data-tab]')].filter(x => !x.classList.contains('cx-off')).length === 1, today: !document.querySelector('#home-today').classList.contains('cx-off') }));
  T18(hm.tabs === 7 && hm.faqOff && hm.today, 'home: 7 section tabs, 今日任务 always visible');
  await p.goto(BASE + 'index.html#home-faq'); await p.reload(); await p.waitForTimeout(400);
  T18(await p.evaluate(() => !document.querySelector('#home-faq').classList.contains('cx-off')), 'home: #home-faq anchor reveals its tab');
  await visit('changelog'); await p.reload(); await p.waitForTimeout(200);
  T18(await p.evaluate(() => [...document.querySelectorAll('.cl-list > li')].filter(x => !x.classList.contains('cx-off')).length === 5 && !!document.querySelector('.cl-list + .cx-more-btn')), 'changelog: 5 latest + 更多更新');
  await visit('war'); await p.reload(); await p.waitForTimeout(200);
  T18(await p.evaluate(() => { const d = [...document.querySelectorAll('#panel-war section.war-day')]; return d.length >= 7 && d.filter(x => x.querySelector(':scope > .cx-body.cx-off')).length >= d.length - 1; }), 'war: non-today days collapsed');
  // 高度（与 page-heights 一致：1280×800，屏 = scrollHeight/800）
  const H = {};
  await p.setViewportSize({ width: 1280, height: 800 });
  for (const r of ['home', 'lib', 'pm', 'pm-cn', 'pm-cn-media', 'war-kit', 'war-rank', 'me', 'me-accounts', 'weekly', 'changelog', 'work']) {
    await p.goto(BASE + 'index.html#' + r); await p.reload(); await p.waitForTimeout(300);
    H[r] = +(await p.evaluate(() => document.documentElement.scrollHeight / 800)).toFixed(2);
  }
  await p.setViewportSize({ width: 1280, height: 860 });
  T18(Object.values(H).every(v => v <= 2.5), 'heights ≤2.5 screens @1280x800 ' + JSON.stringify(H));
  await visit('me-accounts'); await p.reload(); await p.waitForTimeout(300);
  T18(await p.evaluate(() => {
    const cards = [...document.querySelectorAll('#panel-me .wb-plat')].filter(el => el.offsetParent !== null);
    return cards.length > 0 && cards.every(el => { const st = el.querySelector('.wb-st'); return !!st && st.offsetParent !== null; });
  }), 'accounts: every visible .wb-plat shows .wb-st');

  // Google 连接（GIS 桩 + fake-google 8768）
  const gUrl = 'http://localhost:8768';
  const ctxG = await b.newContext({ viewport: { width: 1280, height: 860 } });
  await ctxG.addInitScript(() => { window.__gis = []; window.google = { accounts: { oauth2: { initTokenClient(c) { window.__gis.push(c); return { requestAccessToken(o) { setTimeout(() => c.callback({ access_token: 'ya29.test', expires_in: 3599, scope: c.scope }), 20); } }; }, revoke(t, cb) { window.__gisRevoked = t; cb && cb(); } } } }; });
  const g = cx(await ctxG.newPage()); g.on('pageerror', e => errors.push('g ' + e.message));
  const base18 = JSON.parse(await p.evaluate(() => localStorage.getItem('gefei-quest-save-v1')));
  base18.sites = { items: [{ id: 's18', name: 'Demo 站', domain: 'demo.example.com', kw: 'pdf merge', station: '1', launch: '2026-09-01', status: '已上线', host: 'GitHub Pages', money: 'AdSense', logs: [] }] };
  base18.shares = []; base18.reviews = [];
  await g.goto(BASE + 'index.html#me-accounts');
  await g.evaluate(([s, u]) => { localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)); localStorage.setItem('gefei-quest-accounts-v1', JSON.stringify({ google: { clientId: 'bad-id', apiBase: u } })); }, [base18, gUrl]);
  await g.reload(); await g.waitForTimeout(300);
  T18(await g.evaluate(() => !!document.querySelector('#g-connect') && /Google 连接/.test([...document.querySelectorAll('#panel-me .cx-tab-btn')].map(b => b.textContent).join())), 'accounts: Google 连接 tab present');
  await g.click('#g-auth'); await g.waitForTimeout(150);
  T18(/客户端 ID/.test(await g.textContent('#g-msg')), 'invalid client ID rejected before GIS');
  await g.fill('#g-client', '1234567890-abc.apps.googleusercontent.com'); await g.click('#g-auth'); await g.waitForTimeout(600);
  const g1 = await g.evaluate(() => ({ init: window.__gis[0] && { id: window.__gis[0].client_id, scope: window.__gis[0].scope }, msg: document.querySelector('#g-msg').textContent, gsc: document.querySelectorAll('.g-map select[data-map="gscProperty"] option').length, ads: document.querySelector('#g-ads').value, tok: sessionStorage.getItem('gefei-quest-google-token'), acc: localStorage.getItem('gefei-quest-accounts-v1') }));
  T18(g1.init && g1.init.id === '1234567890-abc.apps.googleusercontent.com' && /webmasters\.readonly/.test(g1.init.scope) && /analytics\.readonly/.test(g1.init.scope) && /adsense\.readonly/.test(g1.init.scope), 'GIS initTokenClient with own client ID + 3 readonly scopes');
  T18(/GSC 2 · GA4 1 · AdSense 1/.test(g1.msg) && g1.gsc === 3 && g1.ads === 'accounts/pub-0000000000000000', 'listProps: GSC/GA4/AdSense resources (' + g1.msg + ')');
  T18(!!g1.tok && /ya29\.test/.test(g1.tok) && !/ya29/.test(g1.acc) && !/ya29/.test(await g.evaluate(() => localStorage.getItem('gefei-quest-save-v1'))), 'token only in sessionStorage (not accounts key, not save)');
  await g.selectOption('.g-map tr[data-site="s18"] select[data-map="gscProperty"]', 'sc-domain:demo.example.com');
  await g.selectOption('.g-map tr[data-site="s18"] select[data-map="ga4Property"]', 'properties/123456');
  await g.selectOption('#g-ads-site', 's18');
  await g.click('#g-pull'); await g.waitForTimeout(900);
  const g2 = await g.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); const api = s.imports.filter(x => x.via === 'api'); const site = s.sites.items[0]; return { kinds: api.map(x => x.kind + ':' + x.platform).sort().join(','), site, msg: document.querySelector('#g-msg').textContent, n: api.length }; });
  T18(g2.kinds === 'adsense:adsense,generic:ga4,gsc-dates:gsc,gsc-queries:gsc', 'pull: 4 API datasets (' + g2.kinds + ')');
  T18(g2.site.gscProperty === 'sc-domain:demo.example.com' && g2.site.ga4Property === 'properties/123456' && g2.site.logs.length >= 2 && g2.site.logs.some(l => l.clicks > 0) && g2.site.logs.some(l => l.usd > 0), 'site mapping saved (additive) + 台账 monthly logs from API');
  await g.click('#g-pull'); await g.waitForTimeout(900);
  T18(await g.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).imports.filter(x => x.via === 'api').length) === 4, 're-pull replaces API datasets (no duplicates)');
  // 自动刷新：上次拉取 > 6h
  await g.evaluate(() => { const c = JSON.parse(localStorage.getItem('gefei-quest-accounts-v1')); c.google.lastPull = '2026-01-01T00:00:00Z'; localStorage.setItem('gefei-quest-accounts-v1', JSON.stringify(c)); });
  await g.goto(BASE + 'index.html#me-analytics'); await g.waitForTimeout(1000);
  const g3 = await g.evaluate(() => ({ lp: JSON.parse(localStorage.getItem('gefei-quest-accounts-v1')).google.lastPull, bar: !!document.querySelector('#g-bar'), sel: document.querySelector('#an-view') && document.querySelector('#an-view').dataset.kind }));
  T18(g3.bar && g3.lp > '2026-02', 'analytics: auto-refresh on open when >6h (lastPull ' + g3.lp + ')');
  await g.click('[data-ds]:first-child'); await g.waitForTimeout(100);
  T18(await g.evaluate(() => [...document.querySelectorAll('[data-ds]')].some(b => /API · GSC 按日期/.test(b.textContent))), 'analytics: API datasets listed');
  // 401 → 清令牌
  await g.evaluate(() => { const t = JSON.parse(sessionStorage.getItem('gefei-quest-google-token')); t.access_token = 'bad'; sessionStorage.setItem('gefei-quest-google-token', JSON.stringify(t)); });
  await g.goto(BASE + 'index.html#me-accounts'); await g.waitForTimeout(300); await g.click('#g-pull'); await g.waitForTimeout(700);
  const e401 = await g.evaluate(() => document.querySelector('#g-msg').textContent + '|' + (sessionStorage.getItem('gefei-quest-google-token') || 'cleared'));
  T18(/401/.test(e401) && /cleared$/.test(e401), '401 → error shown + token cleared');
  await g.evaluate(() => { sessionStorage.setItem('gefei-quest-google-token', JSON.stringify({ access_token: 'ya29.test', exp: Date.now() + 3e6, scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/adsense.readonly' })); });
  // 工作台
  await g.goto(BASE + 'index.html#me-accounts'); await g.reload(); await g.waitForTimeout(300); await g.click('#g-pull'); await g.waitForTimeout(800);
  await g.goto(BASE + 'index.html#work'); await g.reload(); await g.waitForTimeout(500);
  const w = await g.evaluate(() => { const c = document.querySelector('.wk-card[data-site="s18"]'); return c && { next: (c.querySelector('.wk-steps li.next') || {}).dataset, done: [...c.querySelectorAll('.wk-steps li.done')].map(x => x.dataset.step).join(','), kpi: c.querySelector('.wk-kpi') && c.querySelector('.wk-kpi').textContent, tab: !!document.querySelector('#panel-war .sub-tabs a[href="#work"].active, #panel-war a[href="#work"][aria-current]'), home: !!document.querySelector('#panel-war .wb-pipe-home'), steps: document.querySelectorAll('#panel-war .wb-pipe .wb-step').length }; });
  T18(w && w.next && w.next.step === 'share' && /publish/.test(w.done) && /analytics/.test(w.done), '#work: per-site steps, next = 分发 (done ' + (w && w.done) + ')');
  T18(w && /点击/.test(w.kpi) && /Google API/.test(w.kpi), '#work: 28-day KPIs from API data');
  T18(w && w.steps === 6, '#work: 6-step pipeline 选词→实操助手→发布→分发→数据→复盘');
  if (SHOTS) await g.screenshot({ path: `${SHOTS}/p18-work.png`, fullPage: true });
  // 复盘
  await g.goto(BASE + 'index.html#work-review'); await g.waitForTimeout(400);
  T18(await g.evaluate(() => /分发 0 次/.test(document.querySelector('#rv-facts').textContent) && /Demo 站/.test(document.querySelector('#rv-facts').textContent)), 'review: auto facts (shares + per-site data)');
  await g.fill('#rv-did', '站一上线'); await g.fill('#rv-data', '点击小幅上涨'); await g.fill('#rv-learned', '标题要含主词'); await g.fill('#rv-next-0', '发 3 个平台'); await g.fill('#rv-next-1', '补 2 篇内页'); await g.fill('#rv-next-2', '导出一次 GSC'); await g.fill('#rv-risk', '收录慢');
  await g.click('#rv-save'); await g.waitForTimeout(200);
  const rv = await g.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).reviews);
  T18(rv.length === 1 && rv[0].next.length === 3 && rv[0].did === '站一上线' && /^\d{4}-\d\d-\d\d$/.test(rv[0].week) && rv[0].facts.length >= 3, 'review saved to save.reviews (additive)');
  await g.click('#rv-copy'); await g.waitForTimeout(100);
  T18(await g.evaluate(() => /# 每周复盘/.test(document.querySelector('.rv').parentElement.__md || '') && /## 下周 3 件事\n1\. 发 3 个平台/.test(document.querySelector('.rv').parentElement.__md)), 'review: copy as Markdown');
  await g.goto(BASE + 'index.html#work'); await g.reload(); await g.waitForTimeout(400);
  T18(await g.evaluate(() => !!document.querySelector('.wk-card .wk-steps li.done[data-step="review"]') && /已写/.test(document.querySelector('.wk-week').textContent)), '#work: review step done after save');
  await g.goto(BASE + 'index.html#review'); await g.waitForTimeout(300);
  T18(await g.evaluate(() => location.hash === '#work-review' || !!document.querySelector('#rv-form')), 'alias #review → #work-review');
  await g.keyboard.press('Control+k'); await g.keyboard.type('工作台'); await g.waitForTimeout(150);
  T18(await g.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => a.getAttribute('href') === '#work')), 'search finds 工作台'); await g.keyboard.press('Escape');
  // 断开
  await g.goto(BASE + 'index.html#me-accounts'); await g.waitForTimeout(300); await g.click('#g-forget'); await g.waitForTimeout(150);
  T18(await g.evaluate(() => !sessionStorage.getItem('gefei-quest-google-token') && window.__gisRevoked === 'ya29.test' && !JSON.parse(localStorage.getItem('gefei-quest-accounts-v1')).google.clientId), 'forget: token revoked + cleared');
  // 390px
  const sv18 = await g.evaluate(() => localStorage.getItem('gefei-quest-save-v1'));
  await m13.evaluate(s => localStorage.setItem('gefei-quest-save-v1', s), sv18);
  for (const r of ['work', 'work-review', 'me-accounts', 'pm-cn-media', 'war-rank', 'lib', 'home']) { await m13.goto(BASE + 'index.html#' + r); await m13.reload(); await m13.waitForTimeout(300); const ww = await m13.evaluate(() => document.documentElement.scrollWidth); T18(ww <= 390, 'mobile ' + r + ' scrollWidth ' + ww); }
  await m13.goto(BASE + 'index.html#work'); await m13.reload(); await m13.waitForTimeout(300);
  if (SHOTS) await m13.screenshot({ path: `${SHOTS}/p18-work-mobile.png`, fullPage: true });
  await ctxG.close();
  fg.close();
  }
  console.log('P18 functional fails=' + f18); fail += f18;
  let f19 = 0; {
  const T19 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P19 ' + m); if (!c) f19++; };
  const kitBase = { keyword: 'pdf merge tool', intro: 'Merge PDF files online for free.', domain: 'pdfmergetool.com', email: 'hi@pdfmergetool.com' };
  const eq = await p.evaluate((base) => {
    const a = QuestTools.files(base);
    const b = QuestTools.files(Object.assign({ template: 'basic' }, base));
    const c = QuestTools.files(Object.assign({ template: 'nope' }, base));
    return a.length === 3 && a.every((f, i) => f.name === b[i].name && f.text === b[i].text && f.text === c[i].text) && QuestTools.TEMPLATES.length === 4;
  }, kitBase);
  T19(eq, 'default files() equals template:basic (and unknown id)');
  await visit('war-kit'); await p.reload(); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); if (s.kit) { delete s.kit.template; delete s.kit.templateDone; localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)); } });
  await p.reload(); await p.waitForTimeout(300);
  T19(await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
    const basic = document.querySelector('#kit-tpl-basic');
    const extra = [...document.querySelectorAll('.kit-rules li')].some(li => /模板占位内容已替换/.test(li.textContent));
    return !!basic && basic.checked && !extra && (s.kit.template == null || s.kit.template === 'basic');
  }), 'missing kit.template defaults to 单页介绍');
  const markerOk = (id, src) => {
    if (id === 'tool') return src.includes('<form') && /replace with your tool/i.test(src);
    if (id === 'compare') return src.includes('<table') && /<th[^>]*scope=/.test(src) && /check official site/.test(src);
    return /aria-label="A.Z"/.test(src) && (src.match(/id="term-/g) || []).length === 8;
  };
  for (const id of ['tool', 'compare', 'glossary']) {
    await visit('war-kit');
    await p.click('#kit-tpl-' + id); await p.waitForTimeout(200);
    const live = await p.evaluate((tid) => {
      const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
      const files = QuestTools.files(s.kit);
      const html = files[0].text;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const g = QuestTools.gen(s.kit);
      const h1s = [...doc.querySelectorAll('h1')];
      const frame = document.querySelector('#kit-frame');
      return {
        saved: s.kit.template,
        checked: document.querySelector('#kit-tpl-' + tid).checked,
        src: frame ? frame.srcdoc : '',
        names: files.map(f => f.name).join(','),
        h1: h1s.length === 1 && h1s[0].textContent === g.h1 && g.h1 === s.kit.keyword.trim(),
        title: doc.querySelector('title').textContent === g.title,
        desc: doc.querySelector('meta[name="description"]').getAttribute('content') === g.desc,
        can: doc.querySelector('link[rel="canonical"]').getAttribute('href') === 'https://' + g.domain + '/',
        lang: doc.documentElement.lang === 'en',
        locs: (files[2].text.match(/<loc>/g) || []).length,
        robots: /Sitemap: https:\/\//.test(files[1].text) && files[1].text.indexOf(g.domain) > 0,
        marks: !!(doc.querySelector('header') && doc.querySelector('nav') && doc.querySelector('main') && doc.querySelector('footer')),
        filesUi: document.querySelector('#kit-files').textContent,
      };
    }, id);
    T19(live.saved === id && live.checked, 'select ' + id + ' saves kit.template');
    await p.reload(); await p.waitForTimeout(300);
    const again = await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).kit.template);
    T19(again === id, 'reload keeps kit.template=' + id + ' (' + again + ')');
    T19(markerOk(id, live.src), id + ' preview iframe has template markers');
    T19(live.h1 && live.title && live.desc && live.can && live.lang && live.marks, id + ' one h1 + title + description + canonical');
    T19(live.names === 'index.html,robots.txt,sitemap.xml' && live.locs === 1 && live.robots && /index\.html/.test(live.filesUi) && /robots\.txt/.test(live.filesUi) && /sitemap\.xml/.test(live.filesUi), id + ' files index/robots/sitemap (sitemap only /)');
  }
  await visit('war-kit');
  await p.click('#kit-tpl-tool'); await p.waitForTimeout(150);
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); s.kit.templateDone = false; localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(300);
  const ruleBefore = await p.evaluate(() => { const li = [...document.querySelectorAll('.kit-rules li')].find(el => /模板占位内容已替换/.test(el.textContent)); const cb = document.querySelector('#kit-tpl-done'); return { cls: li && li.className, on: !!(cb && cb.checked) }; });
  T19(ruleBefore.cls === 'warn' && ruleBefore.on === false, 'extra rule warn before #kit-tpl-done');
  await p.click('#kit-tpl-done'); await p.waitForTimeout(150);
  const ruleOn = await p.evaluate(() => { const li = [...document.querySelectorAll('.kit-rules li')].find(el => /模板占位内容已替换/.test(el.textContent)); const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); return { cls: li && li.className, on: document.querySelector('#kit-tpl-done').checked, saved: s.kit.templateDone }; });
  T19(ruleOn.cls === 'ok' && ruleOn.on === true && ruleOn.saved === true, 'extra rule ok after #kit-tpl-done');
  await p.click('#kit-tpl-done'); await p.waitForTimeout(150);
  T19(await p.evaluate(() => { const li = [...document.querySelectorAll('.kit-rules li')].find(el => /模板占位内容已替换/.test(el.textContent)); return li.className === 'warn' && JSON.parse(localStorage.getItem('gefei-quest-save-v1')).kit.templateDone === false; }), 'extra rule warn again when unchecked');
  const gh19 = require('./fake-github.js').start(8767); const GH19 = 'http://127.0.0.1:8767';
  try {
  await p.evaluate((GH) => {
    const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
    s.kit.template = 'tool';
    if (!s.kit.keyword) s.kit.keyword = 'pdf merge tool';
    if (!s.kit.intro) s.kit.intro = 'Merge PDF files online for free.';
    localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s));
    const c = JSON.parse(localStorage.getItem('gefei-quest-accounts-v1') || '{}');
    c.github = Object.assign({ token: '', base: 'https://api.github.com', login: '', owner: '', repo: '', branch: 'main', dir: '', createRepo: true, enablePages: true }, c.github || {});
    c.github.token = 'github_pat_test'; c.github.base = GH; c.github.login = 'tester'; c.github.owner = 'tester'; c.github.branch = 'main'; c.github.createRepo = true; c.github.enablePages = true;
    localStorage.setItem('gefei-quest-accounts-v1', JSON.stringify(c));
  }, GH19);
  await visit('war-publish'); await p.waitForTimeout(350);
  T19(/模板：在线工具站/.test(await p.locator('#panel-war').innerText()), 'publish plan summary shows 模板：在线工具站');
  await p.click('#pub-dry'); await p.waitForTimeout(700);
  const dry19 = await p.evaluate(() => ({ rows: document.querySelectorAll('#pub-out .wb-plan tr[data-action]').length, text: (document.querySelector('#pub-out') || {}).textContent || '' }));
  T19(dry19.rows === 3 && /模板：在线工具站/.test(dry19.text), 'dry-run lists 3 files and template name (' + dry19.rows + ')');
  } finally { gh19.close(); }
  await p.setViewportSize({ width: 1280, height: 860 });
  await visit('war-kit'); await p.click('#kit-tpl-compare'); await p.waitForTimeout(300);
  T19(await p.evaluate(() => document.querySelector('#kit-tpl-compare').checked), 'compare template selected for screenshot');
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/p19-templates.png`, fullPage: true });
  await m13.goto(BASE + 'index.html#war-kit'); await m13.reload(); await m13.waitForTimeout(350);
  const w19 = await m13.evaluate(() => document.documentElement.scrollWidth);
  T19(w19 <= 390, '390px #war-kit scrollWidth ' + w19);
  }
  console.log('P19 functional fails=' + f19); fail += f19;
  let f19b = 0; {
  const T19b = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P19b ' + m); if (!c) f19b++; };
  const ideaSrv = require('./fake-ideas.js').start(8769);
  const ideaReady = await ideaSrv.ready;
  T19b(!ideaReady, 'fake ideas listening' + (ideaReady ? ' ' + (ideaReady.message || ideaReady) : ''));
  try {
  await p.setViewportSize({ width: 1280, height: 860 });
  await visit('war-keywords'); await p.waitForTimeout(350);
  const tabInfo = await p.evaluate(() => {
    const btns = [...document.querySelectorAll('#tool-body .cx-tab-btn')].map(b => b.textContent.trim());
    const on = document.querySelector('#tool-body .cx-tab-btn.on');
    const board = document.querySelector('.kw-board');
    const idea = document.querySelector('#idea-panel');
    return {
      btns,
      boardFirst: btns[0] === '选词练习板' && btns[1] === '关键词灵感',
      active: !!(on && on.textContent.trim() === '选词练习板'),
      boardOn: !!(board && !board.classList.contains('cx-off')),
      ideaOff: !!(idea && idea.classList.contains('cx-off')),
      controls: !!(document.querySelector('#idea-seed') && document.querySelector('#idea-go') && document.querySelector('#idea-results') && document.querySelector('#idea-add') && document.querySelector('#idea-copy-az')),
    };
  });
  T19b(tabInfo.boardFirst && tabInfo.active && tabInfo.boardOn && tabInfo.ideaOff, 'tabs 选词练习板 / 关键词灵感, board first (' + (tabInfo.btns || []).join(' | ') + ')');
  T19b(tabInfo.controls, 'idea controls present');
  await p.evaluate(() => localStorage.setItem('gefei-quest-ideas-cfg', JSON.stringify({ base: 'http://127.0.0.1:8769' })));
  await p.evaluate(() => { const b = [...document.querySelectorAll('#tool-body .cx-tab-btn')].find(x => x.textContent.trim() === '关键词灵感'); if (b) b.click(); });
  await p.fill('#idea-seed', 'pdf merge');
  await p.click('#idea-go');
  let populated = false;
  try {
    await p.waitForFunction(() => {
      const dm = document.querySelector('[data-idea-col="dm"]');
      const wiki = document.querySelector('[data-idea-col="wiki"]');
      const hn = document.querySelector('[data-idea-col="hn"]');
      if (!dm || !wiki || !hn) return false;
      if (/正在获取/.test(dm.textContent + wiki.textContent + hn.textContent)) return false;
      return /pdf merge files/.test(dm.textContent) && /Datamuse 相关词 → 长尾组合/.test(dm.textContent) && /PDF Split and Merge/.test(wiki.textContent) && !wiki.querySelector('.searchmatch') && /Show HN: pdf merge/.test(hn.textContent);
    }, null, { timeout: 12000 });
    populated = true;
  } catch (e) { console.log('P19b wait', e.message); }
  if (!populated) {
    const dump = await p.evaluate(() => ({
      dm: (document.querySelector('[data-idea-col="dm"]') || {}).innerText,
      wiki: (document.querySelector('[data-idea-col="wiki"]') || {}).innerText,
      hn: (document.querySelector('[data-idea-col="hn"]') || {}).innerText,
    }));
    console.log('P19b dump ' + JSON.stringify(dump).slice(0, 800));
  }
  T19b(populated, 'pdf merge: Datamuse / Wikipedia / HN columns populated');
  const dmChips = await p.evaluate(() => [...document.querySelectorAll('[data-idea-col="dm"] .idea-chk')].map(b => b.value));
  const stop = ['the', 'a', 'an', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'with', 'into', 'is', 'are', 'be', 'it', 'this', 'that', '.', 'pdf', 'merge'];
  const expectDm = ['pdf merge files', 'pdf merge converter', 'pdf merge documents', 'pdf merge online', 'pdf merge software', 'pdf merge free', 'pdf merge tool'];
  const tails = dmChips.map(c => c.startsWith('pdf merge ') ? c.slice('pdf merge '.length) : '');
  T19b(JSON.stringify(dmChips) === JSON.stringify(expectDm) && tails.every(w => w && stop.indexOf(w.toLowerCase()) < 0), 'datamuse chips are "<seed> <word>" without stopwords (' + dmChips.join(' | ') + ')');
  const wikiInfo = await p.evaluate(() => {
    const col = document.querySelector('[data-idea-col="wiki"]');
    const chips = [...col.querySelectorAll('.idea-chk')].map(b => b.value);
    const links = [...col.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), text: a.textContent, target: a.getAttribute('target'), rel: a.getAttribute('rel') }));
    const snips = [...col.querySelectorAll('.idea-snip')].map(s => s.textContent);
    return {
      chips,
      links,
      snips,
      htmlHasTag: col.innerHTML.includes('<span class="searchmatch"') || !!col.querySelector('.searchmatch'),
    };
  });
  T19b(JSON.stringify(wikiInfo.chips) === JSON.stringify(['PDF Split and Merge', 'PDF'])
    && wikiInfo.links.length === 2
    && wikiInfo.links[0].href === 'https://en.wikipedia.org/wiki/PDF_Split_and_Merge'
    && wikiInfo.links[0].text === 'PDF Split and Merge'
    && wikiInfo.links[0].target === '_blank' && wikiInfo.links[0].rel === 'noopener'
    && wikiInfo.links[1].href === 'https://en.wikipedia.org/wiki/PDF'
    && wikiInfo.snips[0] === 'Free PDF utility to split and merge files.'
    && wikiInfo.snips[1] === 'Portable Document Format & related tools.'
    && wikiInfo.htmlHasTag === false, 'wiki search titles link to /wiki/<title>, snippet HTML stripped (' + JSON.stringify(wikiInfo).slice(0, 500) + ')');
  const hnLink = await p.evaluate(() => {
    const col = document.querySelector('[data-idea-col="hn"]');
    const a = col.querySelector('a[href="https://news.ycombinator.com/item?id=180001"]');
    const btn = col.querySelector('.idea-copy-title');
    const texts = [...col.querySelectorAll('a')].map(x => x.textContent);
    const amp = col.querySelector('a[href="https://news.ycombinator.com/item?id=180002"]');
    return {
      ok: !!(a && a.textContent === 'Show HN: pdf merge' && a.getAttribute('target') === '_blank' && a.getAttribute('rel') === 'noopener' && btn && btn.getAttribute('data-title') === 'Show HN: pdf merge'),
      amp: amp ? amp.textContent : '',
      ampHtml: amp ? amp.innerHTML : '',
      noEl: !col.querySelector('b') && !col.querySelector('script') && !col.querySelector('img'),
      texts,
    };
  });
  T19b(hnLink.ok && hnLink.amp === 'Ask HN: pdf merge & alternatives' && hnLink.ampHtml.includes('&amp;') && hnLink.noEl, 'HN title links to news.ycombinator.com/item, copy button, title escaped (' + hnLink.amp + ')');
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/p19-ideas.png`, fullPage: true });
  const az = await p.evaluate((seed) => {
    const links = [...document.querySelectorAll('#idea-az a[href*="google.com/search"]')];
    const tails = ['for', 'vs', 'free', 'online', 'alternative'];
    const expect = [];
    for (let i = 0; i < 26; i++) expect.push('https://www.google.com/search?q=' + encodeURIComponent(seed + ' ' + String.fromCharCode(97 + i)));
    tails.forEach(w => expect.push('https://www.google.com/search?q=' + encodeURIComponent(seed + ' ' + w)));
    const hrefs = links.map(a => a.getAttribute('href'));
    const attrs = links.length > 0 && links.every(a => a.getAttribute('target') === '_blank' && a.getAttribute('rel') === 'noopener');
    return { n: hrefs.length, match: expect.every(u => hrefs.includes(u)) && hrefs.length === expect.length, attrs, sample: hrefs[0] || '' };
  }, 'pdf merge');
  T19b(az.n === 31 && az.match && az.attrs, 'A–Z list 26+5 with google URLs (' + az.n + ') ' + az.sample);
  const manual = await p.evaluate((seed) => {
    const q = encodeURIComponent(seed);
    const want = {
      '#idea-trends': 'https://trends.google.com/trends/explore?q=' + q,
      '#idea-reddit': 'https://www.reddit.com/search/?q=' + q,
      '#idea-ph': 'https://www.producthunt.com/search?q=' + q,
    };
    return Object.keys(want).every(sel => {
      const a = document.querySelector(sel);
      return !!(a && a.getAttribute('href') === want[sel] && a.getAttribute('target') === '_blank' && a.getAttribute('rel') === 'noopener');
    });
  }, 'pdf merge');
  T19b(manual, 'Trends / Reddit / Product Hunt URLs encoded');
  const before = await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).keywords.items.length);
  const picked = await p.evaluate(() => {
    const boxes = [...document.querySelectorAll('[data-idea-col="dm"] .idea-chk')].slice(0, 3);
    boxes.forEach(b => { b.checked = true; b.dispatchEvent(new Event('change', { bubbles: true })); });
    const btn = document.querySelector('#idea-add');
    return { values: boxes.map(b => b.value), btn: btn.textContent, disabled: btn.disabled };
  });
  T19b(picked.values.length === 3 && picked.btn === '加入候选词（3）' && picked.disabled === false, '3 chips checked (' + picked.values.join(' | ') + ') btn=' + picked.btn);
  await p.click('#idea-add'); await p.waitForTimeout(250);
  const after = await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
    const items = s.keywords.items;
    const added = items.slice(-3);
    return {
      n: items.length,
      added,
      msg: (document.querySelector('#idea-msg') || {}).textContent || '',
      count: (document.querySelector('#kw-count') || {}).textContent || '',
      scores: added.map(k => QuestTools.score(k)),
      labels: added.map(k => QuestTools.label(QuestTools.score(k))[1]),
    };
  });
  T19b(after.n === before + 3, 'keywords.items grew by 3 (' + before + ' -> ' + after.n + ')');
  T19b(after.msg === '已加入 3 个，去选词练习板打分', 'add message: ' + after.msg);
  T19b(after.count === String(after.n), 'board tab count re-rendered ' + after.count + ' / ' + after.n);
  T19b(after.added.length === 3 && after.added.every((k, i) => k.kw === picked.values[i].toLowerCase() && k.src === '联想' && k.vol === '' && k.big === '' && k.weak === '' && k.intent === 'tool' && k.note === '' && k.star === false && typeof k.id === 'string' && typeof k.at === 'number') && after.scores.every(s => s === 52) && after.labels.every(l => l === '可以试'), 'added rows use board defaults and score 52');
  await p.click('#idea-add'); await p.waitForTimeout(200);
  const n2 = await p.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).keywords.items.length);
  T19b(n2 === after.n, 'duplicates not re-added on second add (' + n2 + ')');
  await p.evaluate(() => { const b = [...document.querySelectorAll('#tool-body .cx-tab-btn')].find(x => x.textContent.trim().indexOf('选词练习板') === 0); if (b) b.click(); });
  await p.waitForTimeout(150);
  const shown = await p.evaluate(() => [...document.querySelectorAll('.kw-name')].map(n => n.textContent.trim()));
  T19b(picked.values.every(v => shown.includes(v.toLowerCase())), 'board tab shows added keywords');
  await p.fill('#idea-seed', 'fail');
  await p.click('#idea-go');
  let failedOk = false;
  try {
    await p.waitForFunction(() => {
      const dm = document.querySelector('[data-idea-col="dm"]');
      const wiki = document.querySelector('[data-idea-col="wiki"]');
      const hn = document.querySelector('[data-idea-col="hn"]');
      if (!dm || !wiki || !hn) return false;
      if (/正在获取/.test(dm.textContent)) return false;
      return /暂时取不到，可稍后再试或用下面的链接手动查/.test(dm.textContent)
        && /fail software/.test(wiki.textContent)
        && /Show HN: fail/.test(hn.textContent)
        && !/暂时取不到/.test(wiki.textContent)
        && !/暂时取不到/.test(hn.textContent)
        && !wiki.querySelector('.searchmatch')
        && !hn.querySelector('b');
    }, null, { timeout: 12000 });
    failedOk = true;
  } catch (e) {
    console.log('P19b fail-wait', e.message);
    const dump = await p.evaluate(() => ({
      dm: (document.querySelector('[data-idea-col="dm"]') || {}).innerText,
      wiki: (document.querySelector('[data-idea-col="wiki"]') || {}).innerText,
      hn: (document.querySelector('[data-idea-col="hn"]') || {}).innerText,
    }));
    console.log('P19b fail dump ' + JSON.stringify(dump).slice(0, 800));
  }
  T19b(failedOk, 'seed fail: Datamuse friendly error, Wikipedia and HN still render');
  const failSafe = await p.evaluate(() => {
    const wiki = document.querySelector('[data-idea-col="wiki"]');
    const hn = document.querySelector('[data-idea-col="hn"]');
    const snips = [...wiki.querySelectorAll('.idea-snip')].map(s => s.textContent);
    const ask = hn.querySelector('a[href="https://news.ycombinator.com/item?id=180002"]');
    return {
      snip: snips[0] || '',
      ask: ask ? ask.textContent : '',
      askHtml: ask ? ask.innerHTML : '',
      noB: !hn.querySelector('b'),
      noMatch: !wiki.querySelector('.searchmatch'),
    };
  });
  T19b(failSafe.snip === 'Notes on fail.' && failSafe.ask === 'Ask HN: <b>fail</b> alternatives' && failSafe.askHtml.includes('&lt;b&gt;') && failSafe.noB && failSafe.noMatch, 'fail seed: wiki snippet textContent, HN title escaped (' + failSafe.ask + ' / ' + failSafe.snip + ')');
  const hist = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1')); return s.ideas || null; });
  T19b(!!(hist && hist.lastSeed === 'fail' && Array.isArray(hist.history) && hist.history.length > 0 && hist.history.length <= 20 && hist.history.some(h => h.seed === 'pdf merge' && h.added === 3) && hist.history.every(h => typeof h.seed === 'string' && typeof h.at === 'number' && typeof h.added === 'number')), 'state.ideas.history recorded lastSeed=' + (hist && hist.lastSeed) + ' ' + JSON.stringify(hist && hist.history));
  await m13.goto(BASE + 'index.html#war-keywords'); await m13.reload(); await m13.waitForTimeout(400);
  const wKw = await m13.evaluate(() => document.documentElement.scrollWidth);
  T19b(wKw <= 390, '390px #war-keywords scrollWidth ' + wKw);
  await m13.evaluate(() => { const b = [...document.querySelectorAll('#tool-body .cx-tab-btn')].find(x => x.textContent.trim() === '关键词灵感'); if (b) b.click(); });
  await m13.waitForTimeout(200);
  const wIdea = await m13.evaluate(() => document.documentElement.scrollWidth);
  T19b(wIdea <= 390, '390px #war-keywords ideas tab scrollWidth ' + wIdea);
  await p.keyboard.press('Escape');
  await p.keyboard.press('Control+k');
  await p.keyboard.type('关键词灵感');
  await p.waitForTimeout(200);
  T19b(await p.evaluate(() => [...document.querySelectorAll('.sr-item')].some(a => a.getAttribute('href') === '#war-keywords' && /关键词灵感/.test(a.textContent))), 'search finds 关键词灵感');
  await p.keyboard.press('Escape');
  await p.evaluate(() => localStorage.removeItem('gefei-quest-ideas-cfg'));
  } finally { await ideaSrv.close(); }
  }
  console.log('P19b functional fails=' + f19b); fail += f19b;
  console.log(`TOTAL fails=${fail} consoleErrors=${errors.length}`);
  if (SHOTS) {
    const shot = async (h, name, pg = p) => { await pg.goto(BASE + 'index.html#' + h); await pg.waitForTimeout(400); await pg.screenshot({ path: `${SHOTS}/p8-${name}.png`, fullPage: false }); };
    await shot('home', 'home'); await shot('path', 'path'); await shot('war', 'war'); await shot('lib-xianyu', 'lib'); await shot('guide-station-one-playbook', 'guide'); await shot('weekly', 'weekly'); await shot('me', 'me');
    const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); cx(m);
    for (const h of ['home', 'lib', 'path', 'war', 'guide-station-one-playbook', 'me']) { await m.goto(BASE + 'index.html#' + h); await m.waitForTimeout(300); const w = await m.evaluate(() => document.documentElement.scrollWidth); console.log('mobile', h, 'scrollWidth', w); }
    await shot('home', 'mobile-home', m); await shot('lib', 'mobile-lib', m);
  }
  await b.close();
})();
