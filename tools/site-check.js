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
const ROUTES = ['home','start','path','path-quests','war','war-s2','war-s3','war-m','war-x','war-kit','war-keywords','war-rank','lib','lib-tools','lib-hosting','lib-monetize','lib-paths','lib-xianyu','lib-tips','lib-peers','guides','weekly','me','me-sites','me-ai','me-stats','changelog','dev','pm','pm-cn','pm-global','pm-cn-drama','pm-gl-video','me-accounts','me-analytics','war-publish','war-share','sitemap'];
const OLD = { '':'home', map:'path', quest:'path-quests', quests:'path-quests', ship:'weekly', ach:'me', settings:'me', stats:'me-stats', updates:'changelog', resources:'lib', 'war-s1':'war', 'home-faq':'home-faq', 'guide-start':'start', onboarding:'start', newbie:'start', rank:'war-rank', ai:'me-ai', platforms:'pm', learn:'path', do:'war', practice:'war', earn:'war-rank', money:'war-rank', res:'lib' };
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
  T(await p.evaluate(() => {
    const a = document.querySelector('.hero-cta a.btn-primary');
    const step = window.QuestHome.nextStep(window.QuestApp.get());
    const hero = document.querySelector('.hero.hero-home');
    const starts = hero ? [...hero.querySelectorAll('a,button')].filter((el) => (el.getAttribute('href') || '') === '#start') : [];
    return !!a && a.getAttribute('href') === step.href && step.href !== '#start' && !!document.querySelector('#home-continue') && !document.getElementById('home-next') && starts.length <= 1;
  }), 'old save (no kit/keywords/sites) loads; continue strip shown');
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
  const ledger = await p.$eval('#sites-body', e => e.textContent); console.log('      ' + ledger.replace(/\s+/g, ' ').slice(0, 160));
  T(/2026-10/.test(ledger) && /31/.test(ledger), 'sites ledger shows latest month');
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
  T10(await p.evaluate(() => !document.getElementById('home-today') && !/今日任务/.test(document.getElementById('panel-home').textContent)), 'home has no 今日任务 card');
  T10(await p.evaluate(() => !!document.querySelector('.site-links a[data-nav="me"] .red-dot')), 'red dot on top nav for unseen changelog');
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
  T10(await p.evaluate(() => document.querySelectorAll('#panel-path input[type=checkbox]').length >= 2), 'quest list still offers the next steps');
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
  T10(/今天已打卡/.test(await p.locator('#panel-me').innerText()), 'stats shows 今天已打卡');
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
    await p.goto(BASE + 'index.html#path-quests'); await p.reload(); await p.waitForTimeout(400); await (await p.$('#panel-path')).screenshot({ path: `${SHOTS}/p10-today.png` });
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
  await visit('guides');
  T11(await p.evaluate(() => document.querySelectorAll('.card-ico svg.ico[class*="tone-"]').length > 10), 'badges use tone family');
  const mm = await b.newPage({ viewport: { width: 390, height: 844 } }); cx(mm);
  await mm.goto(BASE + 'index.html#war-kit'); await mm.waitForTimeout(300);
  T11(await mm.evaluate(() => getComputedStyle(document.getElementById('bottom-bar')).display === 'grid' && document.querySelector('#bottom-bar a.active').dataset.bb === 'do'), 'mobile bottom bar visible, 实施 active');
  await mm.click('#bottom-bar a[data-bb="learn"]'); await mm.waitForTimeout(250);
  T11(await mm.evaluate(() => location.hash === '#path' && document.querySelector('#bottom-bar a.active').dataset.bb === 'learn'), 'bottom bar navigates');
  const searchAt390 = await mm.evaluate(() => {
    const b = document.querySelector('#site-nav .nav-search');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    const s = getComputedStyle(b);
    return { disp: s.display, vis: s.visibility, w: r.width, h: r.height, left: r.left, right: r.right, top: r.top };
  });
  T11(!!searchAt390 && searchAt390.disp !== 'none' && searchAt390.vis !== 'hidden' && searchAt390.w > 20 && searchAt390.h > 20 && searchAt390.left >= -1 && searchAt390.right <= 391 && searchAt390.top >= -1, 'top search visible at 390 ' + JSON.stringify(searchAt390));
  await mm.click('#site-nav .nav-search'); await mm.waitForTimeout(100);
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
  T12(await p.evaluate(() => !!document.querySelector('#home-rank') && !!document.querySelector('.site-footer a[href="#war-rank"]')), 'home card + footer link');
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
  const hm = await p.evaluate(() => ({
    today: !!document.querySelector('#home-today'),
    grid: !!document.querySelector('#panel-home .feat-grid'),
    task: /今日任务/.test((document.querySelector('#panel-home') || {}).textContent || ''),
    faq: !!document.getElementById('home-faq'),
    rank: !!document.getElementById('home-rank'),
  }));
  T18(!hm.today && !hm.grid && !hm.task && hm.faq && hm.rank, 'home: no today card or feature grid; faq + rank kept');
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
  T18(Object.entries(H).every(([k, v]) => k === 'home' || v <= 2.5), 'heights ≤2.5 screens (home uncapped) @1280x800 ' + JSON.stringify(H));
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

  // ---------- Phase 19c · PWA ----------
  // 默认上下文不注册 SW（navigator.webdriver 且没有 gefei-quest-sw-test）。
  // 网络优先已经避免旧 JS；再跳过注册，是因为 clients.claim() 会让后续 reload 走 SW，
  // Playwright 的 page.route 看不到 SW 从缓存直接返回的响应。P19c 用新上下文并打开开关。
  let f19c = 0; {
  const T19c = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P19c ' + m); if (!c) f19c++; };
  const path = require('path');
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('gefei-quest-sw-test', '1'); } catch (e) {} });
  const pg = cx(await ctx.newPage());
  const e19 = [];
  pg.on('pageerror', (e) => e19.push('pageerror ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) e19.push(m.text()); });
  try {
    await pg.goto(BASE + 'index.html#work', { waitUntil: 'domcontentloaded' });
    await pg.waitForFunction(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller), null, { timeout: 20000 });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForFunction(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller), null, { timeout: 15000 });
    const cached = await pg.evaluate(async () => {
      const keys = await caches.keys();
      const name = keys.find((k) => k.indexOf('gefei-quest-') === 0) || '';
      const cache = name ? await caches.open(name) : null;
      const urls = cache ? (await cache.keys()).map((r) => r.url) : [];
      return { name, index: urls.some((u) => /\/index\.html(?:#.*)?$/.test(u)), app: urls.some((u) => /\/js\/app\.js(?:#.*)?$/.test(u)), n: urls.length };
    });
    T19c(cached.index && cached.app && /^gefei-quest-v\d+$/.test(cached.name), 'SW controlled, cache ' + cached.name + ' has index.html + js/app.js (' + cached.n + ')');
    await ctx.setOffline(true);
    await pg.goto(BASE + 'index.html#work', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(400);
    const off = await pg.evaluate(() => {
      const pill = document.querySelector('#offline-pill');
      const cs = pill ? getComputedStyle(pill) : null;
      const r = pill ? pill.getBoundingClientRect() : { width: 0, height: 0 };
      return {
        wk: !!document.querySelector('.wk'),
        onLine: navigator.onLine,
        pill: !!(pill && cs && cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && /离线模式：AI \/ 发布 \/ 数据拉取暂不可用/.test(pill.textContent)),
      };
    });
    T19c(off.wk && off.pill, 'offline reload #work renders .wk and offline pill ' + JSON.stringify(off));
    await ctx.setOffline(false);
    let jsonHits = 0;
    let jsHits = 0;
    const fs = require('fs');
    const pwaSrc = fs.readFileSync(path.join(__dirname, '../js/pwa.js'), 'utf8');
    await ctx.route('**/daily.json', (route) => {
      jsonHits++;
      route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        headers: { 'X-P19C': 'fresh', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ schema: 1, latestId: 424242, marker: 'p19c-fresh', entries: [] }),
      });
    });
    await ctx.route('**/js/pwa.js*', (route) => {
      jsHits++;
      route.fulfill({
        status: 200,
        contentType: 'application/javascript; charset=utf-8',
        headers: { 'Cache-Control': 'no-store' },
        body: pwaSrc + '\nwindow.__P19C_JS_MARKER="fresh-js";\n',
      });
    });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(300);
    const fresh = await pg.evaluate(async () => {
      const r = await fetch('daily.json');
      const j = await r.json();
      return { marker: j.marker, header: r.headers.get('X-P19C'), js: window.__P19C_JS_MARKER || '', controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller) };
    });
    T19c(fresh.controlled && fresh.marker === 'p19c-fresh' && fresh.header === 'fresh' && jsonHits >= 1, 'controlled page receives new daily.json from network hits=' + jsonHits + ' ' + JSON.stringify(fresh));
    T19c(fresh.js === 'fresh-js' && jsHits >= 1, 'controlled reload executes fresh js/pwa.js hits=' + jsHits + ' marker=' + fresh.js);
    await ctx.unroute('**/daily.json');
    await ctx.unroute('**/js/pwa.js*');
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    T19c(e19.length === 0, 'P19c http page console errors ' + e19.slice(0, 3).join(' | '));
  } catch (e) {
    T19c(false, 'SW block threw ' + e.message);
    try { await ctx.setOffline(false); } catch (_) {}
    try { await ctx.unroute('**/daily.json'); await ctx.unroute('**/js/pwa.js*'); } catch (_) {}
  }
  const fp = await b.newPage();
  const ferr = [];
  fp.on('pageerror', (e) => ferr.push(e.message));
  fp.on('console', (m) => { if (m.type() === 'error') ferr.push(m.text()); });
  try {
    await fp.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded' });
    await fp.waitForTimeout(500);
    const reg = await fp.evaluate(async () => {
      let n = -1;
      try { n = (await navigator.serviceWorker.getRegistrations()).length; } catch (e) { n = 0; }
      return { attempted: window.__pwaRegisterAttempted === true, regs: n, proto: location.protocol };
    });
    T19c(ferr.length === 0 && !reg.attempted && reg.regs === 0 && reg.proto === 'file:', 'file:// no console errors and no SW register ' + JSON.stringify({ ferr: ferr.slice(0, 3), reg }));
  } catch (e) {
    T19c(false, 'file:// threw ' + e.message);
  }
  await fp.close();
  try {
    const mf = await (await ctx.request.get(BASE + 'manifest.webmanifest')).json();
    const sc = mf.shortcuts || [];
    const okId = mf.id === './' && sc.length === 3;
    const want = [
      ['工作台', './index.html#work'],
      ['选词练习板', './index.html#war-keywords'],
      ['每日赚钱榜', './index.html#war-rank'],
    ];
    const okSc = want.every(([name, url]) => sc.some((s) => s.name === name && s.url === url && (s.icons || []).some((i) => i.src === 'assets/icon-192.png')));
    T19c(okId && okSc && mf.name === '出海小站练站营' && mf.start_url === './index.html#home' && mf.display === 'standalone', 'manifest id + 3 shortcuts, existing fields kept');
  } catch (e) {
    T19c(false, 'manifest ' + e.message);
  }
  const prog = { version: 1, xp: 10, done: ['q-p-01'], unlocked: ['ch-prologue'], cleared: [], streak: 1, lastCheckIn: null, achievements: [], weeklyClaimed: [], settings: { muted: true, energyEnabled: false, reduceMotion: false } };
  const putSave = async (extra) => {
    await pg.evaluate((s) => {
      if (!s) localStorage.removeItem('gefei-quest-save-v1');
      else localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s));
    }, extra);
    // 同文档只改 hash 不会重新执行脚本。loadSave 只在整页加载时读 localStorage，
    // 所以写完存档必须 reload，否则内存里仍是上一次的空进度，备份条不会出现。
    const doc = BASE + 'index.html';
    if (pg.url().replace(/#.*$/, '') !== doc) await pg.goto(doc + '#work', { waitUntil: 'domcontentloaded' });
    else {
      await pg.evaluate(() => { location.hash = 'work'; });
      await pg.reload({ waitUntil: 'domcontentloaded' });
    }
    await pg.waitForTimeout(250);
  };
  try {
    const logic = await pg.evaluate(() => {
      const P = window.QuestPWA;
      const empty = { done: [], sites: { items: [] }, keywords: { items: [] }, reviews: [] };
      return {
        done: P.due({ done: ['x'], sites: { items: [] }, keywords: { items: [] }, reviews: [] }),
        sites: P.due(Object.assign({}, empty, { sites: { items: [{}] } })),
        kw: P.due(Object.assign({}, empty, { keywords: { items: [{}] } })),
        rv: P.due(Object.assign({}, empty, { reviews: [{}] })),
        none: P.due(empty),
        fresh: P.due({ done: ['x'], lastBackupAt: new Date().toISOString() }),
        old: P.due({ done: ['x'], lastBackupAt: new Date(Date.now() - 15 * 86400000).toISOString() }),
        snoozed: P.due({ done: ['x'], backupSnoozeUntil: new Date(Date.now() + 86400000).toISOString() }),
      };
    });
    T19c(logic.done && logic.sites && logic.kw && logic.rv && !logic.none && !logic.fresh && logic.old && !logic.snoozed, 'backup due() progress / 14d / snooze ' + JSON.stringify(logic));
    await putSave(prog);
    const onWork = await pg.evaluate(() => {
      const el = document.querySelector('#backup-reminder');
      return { bar: !!(el && el.getAttribute('role') === 'status' && /只保存在这个浏览器/.test(el.textContent)), exp: !!document.querySelector('#backup-export'), imp: !!document.querySelector('#backup-import'), sn: !!document.querySelector('#backup-snooze') };
    });
    T19c(onWork.bar && onWork.exp && onWork.imp && onWork.sn, '#work backup bar visible ' + JSON.stringify(onWork));
    await pg.goto(BASE + 'index.html#me', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(250);
    T19c(await pg.evaluate(() => {
      const panel = document.querySelector('#panel-me');
      const el = panel && panel.querySelector('#backup-reminder');
      const cs = el ? getComputedStyle(el) : null;
      return !!(panel && !panel.hidden && el && el.getAttribute('role') === 'status' && cs && cs.display !== 'none' && document.querySelector('#me-settings #set-export'));
    }), '#me backup bar visible next to settings export');
    await pg.locator('#panel-me #backup-snooze').click();
    await pg.waitForTimeout(100);
    const snoozed = await pg.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
      const el = document.querySelector('#backup-reminder');
      const days = s.backupSnoozeUntil ? (Date.parse(s.backupSnoozeUntil) - Date.now()) / 86400000 : -1;
      const cs = el ? getComputedStyle(el) : null;
      return { hidden: !el || el.hidden || (cs && cs.display === 'none'), days };
    });
    T19c(snoozed.hidden && snoozed.days > 13 && snoozed.days < 15, 'snooze hides bar and sets backupSnoozeUntil (' + snoozed.days.toFixed(2) + 'd)');
    await putSave(prog);
    T19c(await pg.evaluate(() => !!document.querySelector('#backup-reminder')), 'reset save without lastBackupAt shows bar again');
    const [dl] = await Promise.all([
      pg.waitForEvent('download', { timeout: 8000 }),
      pg.click('#backup-export'),
    ]);
    T19c(dl.suggestedFilename() === 'gefei-quest-save-v1.json', 'backup export download ' + dl.suggestedFilename());
    await dl.path().catch(() => {});
    const exported = await pg.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
      const el = document.querySelector('#backup-reminder');
      const t = s.lastBackupAt ? Date.parse(s.lastBackupAt) : 0;
      return { hidden: !el, recent: t > 0 && Math.abs(Date.now() - t) < 120000 };
    });
    T19c(exported.hidden && exported.recent, 'export sets lastBackupAt and hides bar ' + JSON.stringify(exported));
    const nowSave = Object.assign({}, prog, { lastBackupAt: new Date().toISOString() });
    await putSave(nowSave);
    T19c(await pg.evaluate(() => !document.querySelector('#backup-reminder')), 'lastBackupAt = now → no bar on #work');
    await pg.goto(BASE + 'index.html#me', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    T19c(await pg.evaluate(() => !document.querySelector('#backup-reminder')), 'lastBackupAt = now → no bar on #me');
    await putSave(null);
    T19c(await pg.evaluate(() => !document.querySelector('#backup-reminder')), 'empty save → no bar on #work');
    await pg.goto(BASE + 'index.html#me', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    T19c(await pg.evaluate(() => !document.querySelector('#backup-reminder')), 'empty save → no bar on #me');
    await pg.evaluate(() => {
      window.__pwaPrompted = 0;
      const ev = new Event('beforeinstallprompt', { cancelable: true });
      ev.prompt = function () { window.__pwaPrompted++; return Promise.resolve(); };
      ev.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
      window.dispatchEvent(ev);
    });
    const inst = await pg.evaluate(() => {
      const el = document.getElementById('pwa-install');
      if (!el) return { ok: false, reason: 'missing' };
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { ok: !el.hidden && cs.display !== 'none' && r.width > 0 && r.height > 0 && /安装到桌面/.test(el.textContent), text: el.textContent, hidden: el.hidden, display: cs.display };
    });
    T19c(inst.ok, 'beforeinstallprompt shows #pwa-install ' + JSON.stringify(inst));
    await pg.click('#pwa-install');
    T19c(await pg.evaluate(() => window.__pwaPrompted === 1), 'click #pwa-install calls prompt()');
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.evaluate(() => {
      localStorage.removeItem('gefei-quest-save-v1');
      location.hash = 'me';
    });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(400);
    const wMe = await pg.evaluate(() => document.documentElement.scrollWidth);
    T19c(wMe <= 390, '390px #me scrollWidth ' + wMe);
    await pg.setViewportSize({ width: 1280, height: 860 });
    if (SHOTS) {
      await putSave(prog);
      await pg.waitForSelector('#backup-reminder');
      await pg.screenshot({ path: `${SHOTS}/p19-pwa.png`, fullPage: false });
    }
  } catch (e) {
    T19c(false, 'backup/install block threw ' + e.message);
  }
  await ctx.close();
  }
  console.log('P19c functional fails=' + f19c); fail += f19c;

  // ---------- Phase 20a · 新手引导 + 导览（新上下文，避免影响前面的存档） ----------
  let f20a = 0; {
  const T20a = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P20a ' + m); if (!c) f20a++; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('gefei-quest-tour-test', '1'); } catch (e) {} });
  const pg = cx(await ctx.newPage());
  const e20 = [];
  const pushErr = (t) => { e20.push(t); errors.push(t); };
  pg.on('pageerror', (e) => pushErr('pageerror ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) pushErr(m.text()); });
  try {
    await pg.goto(BASE + 'index.html#start', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(300);
    const nav = await pg.evaluate(() => [...document.querySelectorAll('.site-links a')].map((a) => ({ t: (a.querySelector('span') || a).textContent.trim(), h: a.getAttribute('href'), on: a.classList.contains('active') })));
    T20a(nav[0] && nav[0].t === '首页' && nav[1] && nav[1].t === '新手引导' && nav[1].h === '#start' && nav[1].on, 'nav 2nd is 新手引导 ' + JSON.stringify(nav[1]));
    const foot = await pg.evaluate(() => ({
      guides: [...document.querySelectorAll('#site-footer a')].filter((a) => a.textContent.trim() === '新手引导' && a.getAttribute('href') === '#start').length,
      tour: (document.querySelector('#foot-tour') || {}).textContent || '',
    }));
    T20a(foot.guides === 1 && /重播新手导览/.test(foot.tour), 'footer 新手引导 + 重播新手导览 ' + JSON.stringify(foot));
    const found = await pg.evaluate(() => {
      const a = QuestShell.search('新手引导').some((x) => x.href === '#start');
      const b = QuestShell.search('新手导览').some((x) => x.href === '#start');
      return a && b;
    });
    T20a(found, 'search finds 新手引导 / 新手导览');
    const tracks = await pg.evaluate(() => {
      const tabs = [...document.querySelectorAll('#start-tracks [role="tab"]')].map((b) => b.textContent.replace(/\s+/g, ''));
      const counts = [...document.querySelectorAll('.start-panel ol.start-steps')].map((ol) => ol.querySelectorAll(':scope > li').length);
      const lead = document.querySelector('.start-lead') && document.querySelector('.start-lead').textContent;
      return { tabs, counts, lead };
    });
    T20a(/三条路线/.test(tracks.lead || '') && tracks.tabs.length === 3 && /学习/.test(tracks.tabs[0]) && /实施/.test(tracks.tabs[1]) && /赚钱/.test(tracks.tabs[2]), '3 tracks ' + JSON.stringify(tracks.tabs) + ' lead');
    T20a(tracks.counts.length === 3 && tracks.counts.every((n) => n >= 4 && n <= 6), 'numbered steps ' + tracks.counts.join(','));
    for (const id of ['learn', 'do', 'earn']) {
      await pg.click('#start-tab-' + id);
      await pg.locator('#start-img-' + id).scrollIntoViewIfNeeded();
      await pg.waitForFunction((sel) => { const im = document.querySelector(sel); return !!(im && im.complete && im.naturalWidth > 0); }, '#start-img-' + id, { timeout: 8000 });
      const wh = await pg.$eval('#start-img-' + id, (im) => im.naturalWidth + 'x' + im.naturalHeight + ' ' + im.getAttribute('alt') + ' lazy=' + im.getAttribute('loading'));
      T20a(/lazy/.test(wh) && !/^0x/.test(wh), 'image ' + id + ' ' + wh);
    }
    const hrefs = await pg.$$eval('#panel-start a[href^="#"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    T20a(hrefs.length >= 8, 'deep link count ' + hrefs.length + ' ' + hrefs.join(' '));
    for (const h of hrefs) {
      const key = h.slice(1).split('?')[0];
      const parsed = await pg.evaluate((hash) => { const r = QuestNav.parse(hash); return r.section + ':' + r.hash; }, key);
      await pg.goto(BASE + 'index.html' + h, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(120);
      const landed = await pg.evaluate(() => location.hash + ' ' + QuestNav.parse(location.hash.replace(/^#/, '').split('?')[0]).section);
      const bad = parsed.indexOf('home:') === 0 || / #home$/.test(' ' + landed) || landed.endsWith(' home');
      T20a(!bad && !landed.endsWith(' home'), h + ' -> parse ' + parsed + ' visit ' + landed);
    }
    await pg.goto(BASE + 'index.html#start', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('#start-day-d1');
    await pg.check('#start-day-d1');
    await pg.check('#start-day-d3');
    const savedDays = await pg.evaluate(() => JSON.parse(localStorage.getItem('gefei-quest-save-v1')).onboarding.days);
    T20a(savedDays.d1 === true && savedDays.d3 === true && savedDays.d2 !== true, 'days saved ' + JSON.stringify(savedDays));
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('#start-day-d1');
    const daysAfter = await pg.evaluate(() => ({
      d1: document.querySelector('#start-day-d1').checked,
      d2: document.querySelector('#start-day-d2').checked,
      d3: document.querySelector('#start-day-d3').checked,
      n: document.querySelector('#start-done').textContent,
    }));
    T20a(daysAfter.d1 && daysAfter.d3 && !daysAfter.d2 && daysAfter.n === '2', 'days persist after reload ' + JSON.stringify(daysAfter));

    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('#tour-root');
    const dlg = await pg.evaluate(() => {
      const r = document.getElementById('tour-root');
      return { role: r && r.getAttribute('role'), modal: r && r.getAttribute('aria-modal'), title: (document.getElementById('tour-title') || {}).textContent || '' };
    });
    T20a(dlg.role === 'dialog' && dlg.modal === 'true' && !!dlg.title, 'tour auto-opens ' + JSON.stringify(dlg));
    const t1 = dlg.title;
    await pg.click('#tour-next');
    const t2 = await pg.locator('#tour-title').innerText();
    T20a(t2 && t2 !== t1, 'next ' + t1 + ' -> ' + t2);
    await pg.click('#tour-prev');
    const t1b = await pg.locator('#tour-title').innerText();
    T20a(t1b === t1, 'prev back to ' + t1b);
    await pg.keyboard.press('ArrowRight');
    const tArrow = await pg.locator('#tour-title').innerText();
    T20a(tArrow === t2, 'ArrowRight ' + tArrow);
    await pg.keyboard.press('ArrowLeft');
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(150);
    const esc = await pg.evaluate(() => {
      const o = JSON.parse(localStorage.getItem('gefei-quest-save-v1')).onboarding;
      return { open: !!document.getElementById('tour-root'), done: o.tourDone === true, at: o.tourSeenAt, d1: o.days && o.days.d1 === true };
    });
    T20a(!esc.open && esc.done && /^\d{4}-\d{2}-\d{2}T/.test(esc.at || '') && esc.d1, 'Esc closes and sets tourDone ' + JSON.stringify(esc));
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(400);
    T20a(await pg.evaluate(() => !document.getElementById('tour-root')), 'no tour after reload');

    await pg.goto(BASE + 'index.html#start', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await pg.click('#start-tour');
    await pg.waitForSelector('#tour-root');
    T20a(await pg.evaluate(() => location.hash === '#home' && !!document.getElementById('tour-root')), 'replay from #start-tour');
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(100);
    await pg.click('#foot-tour');
    await pg.waitForSelector('#tour-root');
    T20a(await pg.evaluate(() => !!document.getElementById('tour-root')), 'replay from footer');
    await pg.check('#tour-never');
    for (let i = 0; i < 10; i++) {
      if (!(await pg.$('#tour-root'))) break;
      const label = (await pg.locator('#tour-next').innerText()).trim();
      await pg.click('#tour-next');
      if (/完成/.test(label)) break;
    }
    await pg.waitForTimeout(150);
    const fin = await pg.evaluate(() => {
      const o = JSON.parse(localStorage.getItem('gefei-quest-save-v1')).onboarding;
      return { open: !!document.getElementById('tour-root'), done: o.tourDone === true, at: o.tourSeenAt };
    });
    T20a(!fin.open && fin.done && /^\d{4}-\d{2}-\d{2}T/.test(fin.at || ''), '不再显示 + finish ' + JSON.stringify(fin));
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(400);
    T20a(await pg.evaluate(() => location.hash.indexOf('home') >= 0 && !document.getElementById('tour-root')), 'no tour after finish reload');

    const beforeMiss = e20.length;
    await pg.evaluate(() => {
      const h = document.createElement('div');
      h.id = 'tour-hidden-probe';
      h.hidden = true;
      h.textContent = 'hidden';
      document.body.appendChild(h);
      QuestTour.start([
        { sel: '#no-such-tour-target', title: '缺失步骤', body: '不应显示' },
        { sel: '#tour-hidden-probe', title: '隐藏步骤', body: '不应显示' },
        { sel: '[data-tour="cta"]', title: '主按钮', body: '开始站一。' },
      ]);
    });
    await pg.waitForSelector('#tour-title');
    const missTitle = await pg.locator('#tour-title').innerText();
    T20a(missTitle === '主按钮' && e20.length === beforeMiss, 'missing target skipped, got ' + missTitle + (e20.length !== beforeMiss ? ' errs ' + e20.slice(beforeMiss).join(' | ') : ''));
    await pg.keyboard.press('Escape');

    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#start', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(300);
    const mob = await pg.evaluate(() => {
      const bar = document.getElementById('bottom-bar');
      const labels = bar ? [...bar.querySelectorAll('a span, button span')].map((s) => s.textContent.trim()) : [];
      const br = bar ? bar.getBoundingClientRect() : { left: 0, right: 0 };
      return {
        sw: document.documentElement.scrollWidth,
        n: bar ? bar.querySelectorAll('a, button').length : 0,
        labels,
        barRight: Math.round(br.right),
        barLeft: Math.round(br.left),
        barScroll: bar ? bar.scrollWidth : 0,
        barClient: bar ? bar.clientWidth : 0,
      };
    });
    T20a(mob.sw <= 390, '390px #start scrollWidth ' + mob.sw);
    T20a(mob.n === 6 && mob.labels.join(',') === '首页,新手,学习,实施,赚钱,我的' && mob.labels.indexOf('新手引导') < 0 && mob.barScroll <= mob.barClient + 1 && mob.barRight <= 391 && mob.barLeft >= -1, 'bottom bar ' + JSON.stringify(mob));
    await pg.evaluate(() => QuestTour.start());
    await pg.waitForSelector('#tour-card');
    await pg.click('#tour-next');
    const bubble = await pg.evaluate(() => {
      const c = document.getElementById('tour-card');
      const r = c.getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, vw: document.documentElement.clientWidth, vh: window.innerHeight, sheet: document.getElementById('tour-root').classList.contains('is-sheet') };
    });
    T20a(bubble.sheet && bubble.left >= -1 && bubble.top >= -1 && bubble.right <= bubble.vw + 1 && bubble.bottom <= bubble.vh + 1, 'tour bubble in viewport ' + JSON.stringify(bubble));

    const filePg = await ctx.newPage();
    filePg.on('pageerror', (e) => pushErr('file pageerror ' + e.message));
    await filePg.setViewportSize({ width: 1280, height: 800 });
    await filePg.goto('file:///workspace/gefei-quest/index.html#start', { waitUntil: 'domcontentloaded' });
    await filePg.waitForTimeout(400);
    const fileOk = await filePg.evaluate(() => {
      const panel = document.getElementById('panel-start');
      return !!(panel && !panel.hidden && document.querySelector('#start-tracks') && /三条路线/.test(document.body.innerText));
    });
    T20a(fileOk, 'file:// #start renders');
    await filePg.close();

    if (SHOTS) {
      await pg.setViewportSize({ width: 1280, height: 800 });
      await pg.goto(BASE + 'index.html#start', { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(400);
      await pg.screenshot({ path: `${SHOTS}/p20-start.png`, fullPage: false });
      await pg.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
        s.onboarding = Object.assign({}, s.onboarding, { tourDone: false, tourSeenAt: null });
        localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s));
        if (window.QuestApp) QuestApp.update((st) => Object.assign({}, st, { onboarding: s.onboarding }));
      });
      await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
      await pg.reload({ waitUntil: 'domcontentloaded' });
      await pg.waitForSelector('#tour-root');
      await pg.click('#tour-next');
      await pg.waitForTimeout(200);
      await pg.screenshot({ path: `${SHOTS}/p20-tour.png`, fullPage: false });
    }
  } catch (e) {
    T20a(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e));
  }
  T20a(e20.length === 0, 'P20a console errors ' + e20.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P20a functional fails=' + f20a); fail += f20a;

  // ---------- Phase 20b · 首页重做 ----------
  let f20b = 0; {
  const T20b = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P20b ' + m); if (!c) f20b++; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('gefei-quest-tour-test', '1'); } catch (e) {} });
  const pg = cx(await ctx.newPage());
  const e20b = [];
  pg.on('pageerror', (e) => { e20b.push('pageerror ' + e.message); errors.push('p20b ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e20b.push(m.text()); errors.push('p20b ' + m.text()); } });
  try {
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('#home-rank-list');
    await pg.waitForSelector('#tour-root');
    const hero = await pg.evaluate(() => {
      const primary = document.querySelector('.hero-cta a.btn-primary');
      const secondary = document.querySelector('.hero-cta a.btn-ghost, .hero-cta a.btn-secondary');
      return {
        pHref: primary && primary.getAttribute('href'),
        pText: primary ? primary.textContent.replace(/\s+/g, '') : '',
        sHref: secondary && secondary.getAttribute('href'),
        sText: secondary ? secondary.textContent.replace(/\s+/g, '') : '',
      };
    });
    T20b(hero.pHref === '#start' && hero.pText.indexOf('我是新手') >= 0 && hero.sHref === '#home-rank' && hero.sText.indexOf('直接看今日赚钱榜') >= 0, 'hero CTAs ' + JSON.stringify(hero));
    const top = await pg.evaluate(() => {
      const src = (QUEST_RANK.days[QUEST_RANK.latest] && QUEST_RANK.days[QUEST_RANK.latest].items) || [];
      const expect = src.slice(0, Math.min(10, src.length));
      const rows = [...document.querySelectorAll('#home-rank .home-rank-row')];
      const date = (document.querySelector('#home-rank-date') || {}).textContent || '';
      const deadlineOf = (it) => {
        const blob = [it.name, it.summary, it.why].filter(Boolean).join(' ');
        const end = blob.match(/(\d{1,2}月\d{1,2}日[^，。；\n]{0,12}截止)/);
        if (end) return end[1];
        const day = blob.match(/(\d{1,2}月\d{1,2}日)/);
        return day ? day[1] : '';
      };
      const bad = rows.find((row, i) => {
        const it = expect[i];
        if (!it) return true;
        const pill = row.querySelector('.pill');
        const due = row.querySelector('.home-rank-deadline');
        const gotDue = due ? due.textContent.trim() : '';
        return row.getAttribute('data-name') !== it.name || row.getAttribute('href') !== '#war-rank' ||
          !pill || pill.textContent.trim() !== it.type ||
          !!row.querySelector('.home-rank-cost, .rank-diff, .home-rank-cost-full') ||
          gotDue !== deadlineOf(it);
      });
      const noMeta = rows.every((row) => !row.querySelector('.home-rank-cost, .rank-diff, .home-rank-cost-full'));
      return { n: rows.length, expect: expect.length, names: rows.map((r) => r.getAttribute('data-name')), want: expect.map((i) => i.name), date, latest: QUEST_RANK.latest, bad: !!bad, noMeta };
    });
    T20b(top.n === top.expect && top.n === Math.min(10, top.expect) && top.names.join('\n') === top.want.join('\n') && top.date === top.latest && !top.bad, 'top10 n=' + top.n + ' date=' + top.date + (top.bad ? ' row mismatch' : ''));
    T20b(top.noMeta, 'home rank cards have no cost or difficulty');
    await pg.evaluate(() => { if (window.QuestTour) QuestTour.close(); });
    const shape = await pg.evaluate(() => ({
      grid: !!document.querySelector('#panel-home .feat-grid'),
      today: !!document.getElementById('home-today'),
      progress: !!document.getElementById('home-progress'),
      task: /今日任务/.test(document.getElementById('panel-home').textContent),
      cont: !!document.getElementById('home-continue'),
      howto: [...document.querySelectorAll('#home-howto a')].map((a) => a.getAttribute('href')),
      faq: document.querySelectorAll('#home-faq details').length,
    }));
    T20b(!shape.grid && !shape.today && !shape.progress && !shape.task, 'no feature grid or today/progress cards ' + JSON.stringify(shape));
    T20b(!shape.cont, 'continue strip hidden for fresh save');
    T20b(shape.howto.join(',') === '#path,#war,#war-rank' && shape.faq >= 3, 'howto + faq ' + shape.howto.join(',') + ' faq=' + shape.faq);
    for (const h of ['#start-learn', '#start-do', '#start-earn']) {
      await pg.goto(BASE + 'index.html' + h, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(80);
      const id = h.slice(7);
      const tabOk = await pg.evaluate((id) => {
        const b = document.getElementById('start-tab-' + id);
        const panel = document.getElementById('start-panel-' + id);
        return !!(b && b.getAttribute('aria-selected') === 'true' && panel && !panel.hidden);
      }, id);
      T20b(tabOk, h + ' opens start tab');
    }
    await pg.goto(BASE + 'index.html#home-faq', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await pg.evaluate(() => { if (window.QuestTour && QuestTour.isOpen && QuestTour.isOpen()) QuestTour.close(); });
    const faqBefore = await pg.evaluate(() => document.querySelector('#home-faq details').open);
    // locator.click 不走 cx()：cx 的 revealSel 会先把祖先 <details> 设为 open，随后这次点击再把它关掉，前后都是 false。
    await pg.locator('#home-faq details summary').first().click();
    const faqAfter = await pg.evaluate(() => document.querySelector('#home-faq details').open);
    T20b(faqBefore !== faqAfter, 'FAQ toggles ' + faqBefore + ' -> ' + faqAfter);
    await pg.setViewportSize({ width: 1280, height: 800 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(300);
    const screens = await pg.evaluate(() => document.documentElement.scrollHeight / 800);
    console.log('     home screens @1280x800 ' + screens.toFixed(2) + ' (uncapped)');
    const fitAt = async (w) => {
      await pg.setViewportSize({ width: w, height: 800 });
      await pg.waitForTimeout(80);
      return pg.evaluate(() => {
        const inner = document.querySelector('.site-nav-inner');
        const links = document.querySelector('.site-links');
        const last = links && links.querySelector('a:last-of-type');
        if (!inner || !links || !last) return { ok: false, why: 'missing' };
        const ir = inner.getBoundingClientRect();
        const lr = links.getBoundingClientRect();
        const ar = last.getBoundingClientRect();
        return {
          ok: ar.right <= lr.right + 1 && ar.right <= ir.right + 1 && ar.left >= lr.left - 1 && ar.width > 20,
          lastRight: Math.round(ar.right), linksRight: Math.round(lr.right), innerRight: Math.round(ir.right),
          text: last.textContent.replace(/\s+/g, ''),
        };
      });
    };
    const fit1024 = await fitAt(1024);
    T20b(fit1024.ok, 'nav 1024 ' + JSON.stringify(fit1024));
    const fit1280 = await fitAt(1280);
    T20b(fit1280.ok, 'nav 1280 ' + JSON.stringify(fit1280));
    await pg.evaluate(() => {
      QuestApp.update(function (s) {
        return Object.assign({}, s, { sites: { items: [{ id: 's20b', name: '新手示例站', domain: '', kw: '', station: '站一', launch: '', status: '筹备', host: '', money: '', logs: [] }] } });
      });
    });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(250);
    const cont = await pg.evaluate(() => {
      const el = document.getElementById('home-continue');
      const a = el && el.querySelector('a');
      return { text: el ? el.textContent.replace(/\s+/g, '') : '', href: a && a.getAttribute('href') };
    });
    T20b(/继续上次/.test(cont.text) && cont.text.indexOf('新手示例站') >= 0 && cont.text.indexOf('选词') >= 0 && cont.href === '#war-keywords', 'continue strip ' + JSON.stringify(cont));
    const aliases = [
      ['home-today', '#work'],
      ['home-progress', '#me'],
      ['home-sections', '#start'],
      ['home-tools', '#war'],
      ['home-steps', '#start'],
      ['home-res', '#pm'],
      ['home-guides', '#guides'],
    ];
    for (const pair of aliases) {
      await pg.goto(BASE + 'index.html#' + pair[0], { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(120);
      const hash = await pg.evaluate(() => location.hash);
      T20b(hash === pair[1], '#' + pair[0] + ' -> ' + hash);
    }
    await pg.goto(BASE + 'index.html#home-faq', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    const faqStay = await pg.evaluate(() => location.hash === '#home-faq' && !!document.getElementById('home-faq'));
    T20b(faqStay, '#home-faq stays on home');
    await pg.goto(BASE + 'index.html#home-rank', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    const rankStay = await pg.evaluate(() => {
      const el = document.getElementById('home-rank');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return location.hash === '#home-rank' && r.width + r.height > 0;
    });
    T20b(rankStay, '#home-rank stays on home');
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(300);
    const mob = await pg.evaluate(() => {
      const bar = document.getElementById('bottom-bar');
      const br = bar ? bar.getBoundingClientRect() : null;
      const rows = document.querySelectorAll('#home-rank .home-rank-row').length;
      return {
        sw: document.documentElement.scrollWidth,
        rows,
        bar: !!(bar && br && br.height > 20 && br.bottom <= window.innerHeight + 2 && br.left >= -1 && br.right <= document.documentElement.clientWidth + 1),
        n: bar ? bar.querySelectorAll('a, button').length : 0,
      };
    });
    T20b(mob.sw <= 390 && mob.rows >= 1 && mob.bar && mob.n === 6, '390px ' + JSON.stringify(mob));
    const mobClean = await pg.evaluate(() => {
      const rows = [...document.querySelectorAll('#home-rank .home-rank-row')];
      return {
        sw: document.documentElement.scrollWidth,
        ok: rows.length > 0 && rows.every((row) => !row.querySelector('.home-rank-cost, .rank-diff, .home-rank-cost-full')),
      };
    });
    T20b(mobClean.ok && mobClean.sw <= 390, '390px home rank has no cost/difficulty sw=' + mobClean.sw);
    await pg.setViewportSize({ width: 1280, height: 800 });
    await pg.goto(BASE + 'index.html#war-rank', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.rank-card');
    const warMeta = await pg.evaluate(() => {
      const cards = [...document.querySelectorAll('.rank-card')];
      const ok = cards.length > 0 && cards.every((card) => {
        const cost = card.querySelector('.rank-cost');
        const diff = card.querySelector('.rank-diff');
        return !!(cost && cost.textContent.trim()) && !!(diff && /难度 \d\/5/.test(diff.getAttribute('aria-label') || ''));
      });
      return { n: cards.length, ok };
    });
    T20b(warMeta.ok && warMeta.n >= 1, 'war-rank still shows cost + difficulty n=' + warMeta.n);
    if (SHOTS) {
      await pg.setViewportSize({ width: 390, height: 844 });
      await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
      await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
      await pg.reload({ waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(300);
      await pg.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
      await pg.screenshot({ path: `${SHOTS}/p20-home-mobile.png`, fullPage: true });
      await pg.setViewportSize({ width: 1280, height: 800 });
      await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
      await pg.reload({ waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(300);
      await pg.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
      await pg.screenshot({ path: `${SHOTS}/p20-home.png`, fullPage: true });
    }
  } catch (e) {
    T20b(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 6).join(' | ') : e));
  }
  T20b(e20b.length === 0, 'P20b console errors ' + e20b.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P20b functional fails=' + f20b); fail += f20b;

  // ---------- Phase 20c · 每页提示 / 空状态 / 导览 ----------
  let f20c = 0; {
  const T20c = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P20c ' + m); if (!c) f20c++; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('gefei-quest-tour-test', '1'); } catch (e) {} });
  const pg = cx(await ctx.newPage());
  const e20c = [];
  pg.on('pageerror', (e) => { e20c.push('pageerror ' + e.message); errors.push('p20c ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e20c.push(m.text()); errors.push('p20c ' + m.text()); } });
  try {
    const hintRoutes = ['work', 'work-review', 'war', 'war-kit', 'war-keywords', 'war-rank', 'war-publish', 'war-share', 'path', 'path-quests', 'lib', 'pm', 'me', 'me-accounts', 'me-analytics', 'me-ai'];
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    for (const h of hintRoutes) {
      await pg.goto(BASE + 'index.html#' + h, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(160);
      const info = await pg.evaluate(() => {
        const bar = document.querySelector('.page-hint');
        if (!bar) return { ok: false, why: 'missing' };
        const t = bar.textContent.replace(/\s+/g, '');
        return {
          ok: t.indexOf('这个页面是干什么的') >= 0 && t.indexOf('第一步') >= 0 && !!bar.querySelector('a[href="#start"]') && !!bar.querySelector('.page-hint-x'),
          t: t.slice(0, 90),
        };
      });
      T20c(info.ok, '#' + h + ' hint ' + (info.t || info.why || ''));
    }
    await pg.goto(BASE + 'index.html#work', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.page-hint-x');
    await pg.locator('.page-hint-x').click();
    await pg.waitForTimeout(120);
    T20c(await pg.evaluate(() => !document.querySelector('.page-hint')), '× removes the #work hint');
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(250);
    const kept = await pg.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null');
      return { noBar: !document.querySelector('.page-hint'), dismissed: !!(s && s.hints && s.hints.dismissed && s.hints.dismissed.work === true) };
    });
    T20c(kept.noBar && kept.dismissed, 'dismiss persists after reload ' + JSON.stringify(kept));
    await pg.goto(BASE + 'index.html#path', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(160);
    T20c(await pg.evaluate(() => !!document.querySelector('.page-hint[data-hint="path"]')), '#path hint still shown');
    await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
    for (const h of ['work', 'work-review', 'me-analytics']) {
      await pg.goto(BASE + 'index.html#' + h, { waitUntil: 'domcontentloaded' });
      await pg.reload({ waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(220);
      const empty = await pg.evaluate(() => [...document.querySelectorAll('.tool-empty')].some((b) => !!b.querySelector('a.btn[href], button.btn')));
      T20c(empty, '#' + h + ' empty-state button');
    }
    await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('#tour-root');
    const stepN = await pg.evaluate(() => (window.QuestTour && QuestTour.STEPS ? QuestTour.STEPS.length : 0));
    T20c(stepN >= 5, 'tour steps on home ' + stepN);
    const titles = [];
    for (let i = 0; i < stepN; i++) {
      const open = await pg.evaluate(() => !!document.getElementById('tour-root'));
      if (!open) break;
      titles.push((await pg.locator('#tour-title').innerText()).trim());
      await pg.locator('#tour-next').click();
      await pg.waitForTimeout(140);
    }
    const closed = await pg.evaluate(() => !document.getElementById('tour-root'));
    T20c(closed && titles.length === stepN && new Set(titles).size === stepN, 'tour walk ' + titles.join(' | '));
  } catch (e) {
    T20c(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 6).join(' | ') : e));
  }
  T20c(e20c.length === 0, 'P20c console errors ' + e20c.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P20c functional fails=' + f20c); fail += f20c;

  // ---------- Phase 21 · 首页视觉整理 ----------
  let f21 = 0; {
  const T21 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P21 ' + m); if (!c) f21++; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('gefei-quest-tour-test', '1'); } catch (e) {} });
  const pg = cx(await ctx.newPage());
  const e21 = [];
  pg.on('pageerror', (e) => { e21.push('pageerror ' + e.message); errors.push('p21 ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e21.push(m.text()); errors.push('p21 ' + m.text()); } });
  try {
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.nav-top');
    await pg.evaluate(() => { if (window.QuestTour) QuestTour.close(); });
    const tops = await pg.evaluate(() => [...document.querySelectorAll('.site-links > a.nav-top, .site-links > .nav-drop > a.nav-top')].map((a) => (a.querySelector('span') || a).textContent.trim()));
    T21(tops.length <= 6 && tops.join(',') === '首页,新手引导,学习,实施,赚钱,我的', 'top nav ≤6 ' + tops.join(','));
    const learnBtn = '.nav-drop[data-group="learn"] .nav-caret';
    await pg.click(learnBtn);
    await pg.waitForTimeout(40);
    const opened = await pg.evaluate(() => {
      const b = document.querySelector('.nav-drop[data-group="learn"] .nav-caret');
      const menu = document.getElementById('nav-menu-learn');
      const r = menu ? menu.getBoundingClientRect() : null;
      return { exp: b && b.getAttribute('aria-expanded'), w: r ? r.width : 0, hidden: menu ? menu.hasAttribute('hidden') : true };
    });
    T21(opened.exp === 'true' && !opened.hidden && opened.w > 40, 'dropdown click open ' + JSON.stringify(opened));
    await pg.click('h1.hero-title');
    await pg.waitForTimeout(40);
    const closedOut = await pg.getAttribute(learnBtn, 'aria-expanded');
    T21(closedOut === 'false', 'dropdown closes on outside click ' + closedOut);
    await pg.focus(learnBtn);
    await pg.keyboard.press('Enter');
    await pg.waitForTimeout(40);
    const keyOpen = await pg.getAttribute(learnBtn, 'aria-expanded');
    T21(keyOpen === 'true', 'dropdown Enter opens ' + keyOpen);
    await pg.keyboard.press('ArrowDown');
    await pg.keyboard.press('ArrowDown');
    const focused = await pg.evaluate(() => {
      const a = document.activeElement;
      return { href: a && a.getAttribute && a.getAttribute('href'), tag: a && a.tagName };
    });
    T21(focused.href === '#path-quests', 'ArrowDown moves to child ' + JSON.stringify(focused));
    await pg.keyboard.press('Escape');
    const esc = await pg.evaluate(() => {
      const b = document.querySelector('.nav-drop[data-group="learn"] .nav-caret');
      return { exp: b.getAttribute('aria-expanded'), focus: document.activeElement === b };
    });
    T21(esc.exp === 'false' && esc.focus, 'Esc closes and returns focus ' + JSON.stringify(esc));
    const groups = await pg.evaluate(() => [...document.querySelectorAll('.nav-drop')].map((d) => ({
      id: d.getAttribute('data-group'),
      hrefs: [...d.querySelectorAll('.nav-menu a')].map((a) => a.getAttribute('href')),
    })));
    T21(groups.length === 4 && groups.every((g) => g.hrefs.length >= 2), 'four dropdowns ' + groups.map((g) => g.id + ':' + g.hrefs.length).join(' '));
    for (const g of groups) {
      for (let i = 0; i < g.hrefs.length; i++) {
        await pg.click('.nav-drop[data-group="' + g.id + '"] .nav-caret');
        await pg.waitForTimeout(30);
        const link = pg.locator('.nav-drop[data-group="' + g.id + '"] .nav-menu a').nth(i);
        const href = await link.getAttribute('href');
        await link.click();
        await pg.waitForTimeout(90);
        const hash = await pg.evaluate(() => location.hash);
        T21(hash === href, g.id + ' ' + href + ' -> ' + hash);
      }
    }
    await pg.goto(BASE + 'index.html#war-rank', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(150);
    const parentOn = await pg.evaluate(() => {
      const a = document.querySelector('a.nav-top.active');
      return a ? (a.querySelector('span') || a).textContent.trim() : '';
    });
    T21(parentOn === '赚钱', 'active parent on #war-rank is ' + parentOn);
    await pg.setViewportSize({ width: 1280, height: 800 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await pg.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
    const layout = await pg.evaluate(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ids = ['home-howto', 'home-rank', 'home-split'];
      const widths = ids.map((id) => {
        const el = document.getElementById(id);
        const r = el.getBoundingClientRect();
        return { id, w: Math.round(r.width) };
      });
      const hero = document.querySelector('.hero.hero-home');
      const h1 = hero.querySelector('h1');
      const minH = parseFloat(getComputedStyle(hero).minHeight);
      const heroH = hero.getBoundingClientRect().height;
      const fs = parseFloat(getComputedStyle(h1).fontSize);
      const lh = parseFloat(getComputedStyle(h1).lineHeight);
      const h1h = h1.getBoundingClientRect().height;
      const aria = [hero.getAttribute('aria-label') || ''].concat([...hero.querySelectorAll('[aria-label],[title],[alt]')].map((el) => (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('alt') || ''))).join('\n');
      const heroBlob = (hero.textContent || '') + '\n' + aria;
      const list = document.querySelector('.home-rank-list');
      const cols = getComputedStyle(list).gridTemplateColumns.split(' ').filter((x) => x && x !== 'none').length;
      const why = document.getElementById('home-why').getBoundingClientRect();
      const faq = document.getElementById('home-faq').getBoundingClientRect();
      const side = faq.left >= why.right - 8 && Math.abs(why.top - faq.top) < 40;
      const colsFoot = document.querySelectorAll('#site-footer .foot-cols > div').length;
      return {
        wrap: !!document.querySelector('#panel-home > .home-wrap'),
        widths, vw, full: widths.every((x) => x.w >= vw - 20),
        minH, heroH, vh, fs, cols, side,
        kicker: !!document.querySelector('.hero-kicker'),
        ctas: document.querySelectorAll('.hero-cta a').length,
        h1Text: (h1.textContent || '').trim(),
        h1h, lh,
        singleLine: h1h < lh * 1.6,
        noGefei: heroBlob.indexOf('哥飞') < 0,
        colsFoot,
        sitemap: !!document.querySelector('#site-footer a[href="#sitemap"]'),
      };
    });
    T21(!layout.wrap && layout.full, 'home sections full width ' + JSON.stringify(layout.widths) + ' vw=' + layout.vw);
    T21(layout.heroH >= 360 && layout.heroH <= 440 && layout.fs >= 44 && layout.fs <= 52, 'hero height ' + layout.heroH + ' fs ' + layout.fs + ' vh ' + layout.vh);
    T21(layout.vw === 1280 && layout.h1Text === '做英文出海小站' && layout.noGefei && layout.singleLine, 'hero h1 === 做英文出海小站, no 哥飞, single line @1280 h=' + layout.h1h + ' lh=' + layout.lh + ' ' + JSON.stringify({ text: layout.h1Text, noGefei: layout.noGefei }));
    T21(layout.cols === 2 && layout.side && !layout.kicker && layout.ctas === 2, 'rank 2-col + why/faq side by side ' + JSON.stringify({ cols: layout.cols, side: layout.side }));
    T21(layout.colsFoot <= 5 && layout.colsFoot >= 1 && layout.sitemap, 'footer columns ' + layout.colsFoot + ' sitemap ' + layout.sitemap);
    const found = await pg.evaluate(() => {
      const hrefs = new Set([...document.querySelectorAll('#panel-sitemap a')].map((a) => a.getAttribute('href')));
      const missing = [];
      (window.QuestNav.SITE_NAV || []).forEach((n) => {
        if (!hrefs.has(n.hash)) missing.push(n.label + n.hash);
        (n.children || []).forEach((c) => { if (!hrefs.has(c.hash)) missing.push(c.label + c.hash); });
      });
      const search = window.QuestShell.search('网站地图').some((x) => x.href === '#sitemap')
        && window.QuestShell.search('学习路线').some((x) => x.href === '#path')
        && window.QuestShell.search('每周补给').some((x) => x.href === '#weekly')
        && window.QuestShell.search('7 天作战日程').some((x) => x.href === '#war')
        && window.QuestShell.search('实战作战室').some((x) => x.href === '#war');
      return { missing, onPage: location.hash, search };
    });
    await pg.goto(BASE + 'index.html#sitemap', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(150);
    const site = await pg.evaluate(() => {
      const hrefs = new Set([...document.querySelectorAll('#panel-sitemap a')].map((a) => a.getAttribute('href')));
      const missing = [];
      (window.QuestNav.SITE_NAV || []).forEach((n) => {
        if (!hrefs.has(n.hash)) missing.push(n.hash);
        (n.children || []).forEach((c) => { if (!hrefs.has(c.hash)) missing.push(c.hash); });
      });
      const search = window.QuestShell.search('网站地图').some((x) => x.href === '#sitemap')
        && window.QuestShell.search('学习路线').some((x) => x.href === '#path')
        && window.QuestShell.search('每周补给').some((x) => x.href === '#weekly')
        && window.QuestShell.search('手册与模板').some((x) => x.href === '#guides')
        && window.QuestShell.search('我的进度').some((x) => x.href === '#me')
        && window.QuestShell.search('7 天作战日程').some((x) => x.href === '#war')
        && window.QuestShell.search('实战作战室').some((x) => x.href === '#war');
      return { hash: location.hash, panel: !document.getElementById('panel-sitemap').hidden, missing, search, n: hrefs.size };
    });
    T21(site.hash === '#sitemap' && site.panel && site.missing.length === 0 && site.search, 'sitemap lists SITE_NAV + search ' + JSON.stringify({ missing: site.missing, search: site.search, n: site.n }));
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await pg.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
    const mob = await pg.evaluate(() => {
      const list = document.querySelector('.home-rank-list');
      const cols = getComputedStyle(list).gridTemplateColumns.split(' ').filter((x) => x && x !== 'none').length;
      const why = document.getElementById('home-why').getBoundingClientRect();
      const faq = document.getElementById('home-faq').getBoundingClientRect();
      const h1 = parseFloat(getComputedStyle(document.querySelector('.hero-home h1')).fontSize);
      return { sw: document.documentElement.scrollWidth, cols, stacked: faq.top >= why.bottom - 8, h1 };
    });
    T21(mob.sw <= 390 && mob.cols === 1 && mob.stacked && mob.h1 >= 28, '390 home ' + JSON.stringify(mob));
    await pg.goto(BASE + 'index.html#sitemap', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    const sm = await pg.evaluate(() => document.documentElement.scrollWidth);
    T21(sm <= 390, '390 sitemap scrollWidth ' + sm);
    if (SHOTS) {
      await pg.screenshot({ path: `${SHOTS}/p21-home-mobile.png`, fullPage: true });
      await pg.setViewportSize({ width: 1280, height: 800 });
      await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
      await pg.reload({ waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(250);
      await pg.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
      await pg.screenshot({ path: `${SHOTS}/p21-home.png`, fullPage: true });
      await pg.locator('.hero.hero-home').screenshot({ path: `${SHOTS}/p21-hero.png` });
    }
  } catch (e) {
    T21(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 8).join(' | ') : e));
  }
  T21(e21.length === 0, 'P21 console errors ' + e21.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P21 functional fails=' + f21); fail += f21;

  // ---------- Phase 23A · 问 AI ----------
  let f23 = 0; {
  const T23 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P23A ' + m); if (!c) f23++; };
  const fake23 = require('./fake-openai.js').start(8766);
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = cx(await ctx.newPage());
  const e23 = [];
  pg.on('pageerror', (e) => { e23.push('pageerror ' + e.message); errors.push('p23a ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e23.push(m.text()); errors.push('p23a ' + m.text()); } });
  const hit = (a, c) => !!(a && c && a.w > 0 && a.h > 0 && c.w > 0 && c.h > 0 && a.x < c.r - 0.5 && a.r > c.x + 0.5 && a.y < c.btm - 0.5 && a.b > c.y + 0.5);
  const boxes = () => pg.evaluate(() => {
    function box(el) {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.left, y: b.top, r: b.right, btm: b.bottom, w: b.width, h: b.height };
    }
    return {
      fab: box(document.getElementById('qa-fab')),
      top: box(document.getElementById('to-top')),
      bar: box(document.getElementById('bottom-bar')),
      sw: document.documentElement.scrollWidth,
      vw: window.innerWidth,
    };
  });
  try {
    for (const h of ['home', 'war-keywords', 'pm', 'me']) {
      await pg.goto(BASE + 'index.html#' + h, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(180);
      await pg.click('#qa-fab');
      const opened = await pg.evaluate(() => {
        const panel = document.getElementById('qa-panel');
        return !!(panel && !panel.hidden && panel.getAttribute('role') === 'dialog' && panel.getAttribute('aria-label') && document.activeElement && document.activeElement.id === 'qa-input' && document.getElementById('qa-fab').getAttribute('aria-expanded') === 'true');
      });
      T23(opened, '#' + h + ' FAB opens dialog and focuses input');
      await pg.keyboard.press('Escape');
      const esc = await pg.evaluate(() => {
        const panel = document.getElementById('qa-panel');
        return !!(panel && panel.hidden && document.activeElement && document.activeElement.id === 'qa-fab');
      });
      T23(esc, '#' + h + ' Esc closes and focus returns to FAB');
      await pg.click('#qa-fab');
      await pg.click('#qa-panel .qa-close');
      const closed = await pg.evaluate(() => {
        const panel = document.getElementById('qa-panel');
        return !!(panel && panel.hidden && document.activeElement && document.activeElement.id === 'qa-fab');
      });
      T23(closed, '#' + h + ' close button closes and focus returns to FAB');
    }
    await pg.goto(BASE + 'index.html#war-keywords', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(180);
    const chips = await pg.evaluate(() => [...document.querySelectorAll('#qa-panel .qa-chips button')].map((b) => b.textContent));
    T23(chips.indexOf('怎么判断一个词值不值得做？') >= 0 && chips.length >= 2 && chips.length <= 4, '#war-keywords chips ' + JSON.stringify(chips));
    const off = await pg.evaluate(async () => {
      const hits = QuestAssistant.search('怎么判断一个词值不值得做');
      await QuestAssistant.ask('怎么判断一个词值不值得做');
      const panel = document.getElementById('qa-panel');
      const label = panel.textContent.indexOf('站内资料检索（未连接 AI）') >= 0;
      const links = [...panel.querySelectorAll('a')].map((a) => a.getAttribute('href') || '').filter((h) => h.charAt(0) === '#');
      const none = QuestAssistant.search('zzqqxxnomatch');
      return { n: hits.length, href: hits[0] && hits[0].href, label, links, none: none.length, ready: QuestAI.ready() };
    });
    T23(!off.ready && off.n >= 1 && typeof off.href === 'string' && off.href.charAt(0) === '#' && off.label && off.links.some((h) => h.charAt(0) === '#') && off.none === 0, 'offline ask ' + JSON.stringify(off));
    await pg.click('#qa-panel .qa-clear');
    const cleared = await pg.evaluate(() => {
      const raw = sessionStorage.getItem('gefei-quest-chat-v1');
      let arr = null;
      try { arr = raw ? JSON.parse(raw) : []; } catch (e) { arr = null; }
      return { raw, n: Array.isArray(arr) ? arr.length : -1, msgs: document.querySelectorAll('#qa-panel .qa-msg').length };
    });
    T23(cleared.n === 0 && cleared.msgs === 0, '清空对话 empties sessionStorage ' + JSON.stringify(cleared));
    await pg.evaluate(() => {
      localStorage.setItem('gefei-quest-ai-v1', JSON.stringify({
        mode: 'custom', version: 2, activeId: 'fake1',
        providers: [{ id: 'fake1', name: 'Fake', format: 'openai', baseUrl: 'http://127.0.0.1:8766/v1', apiKey: 'good', model: 'fake-model', models: ['fake-model'], headers: [], temperature: 0.2, maxTokens: 256 }],
      }));
    });
    await pg.evaluate(async () => { await QuestAssistant.ask('请说明选词'); });
    const streamed = await pg.evaluate(() => {
      const panel = document.getElementById('qa-panel');
      return {
        text: /测试回复/.test(panel.textContent) && /不保证收益/.test(panel.textContent),
        script: !!panel.querySelector('script'),
        js: [...panel.querySelectorAll('a')].some((a) => /^javascript:/i.test(a.getAttribute('href') || '')),
      };
    });
    const sys = (fake23.log || []).map((x) => x && x.body).filter(Boolean).pop();
    const sysMsg = sys && sys.messages && sys.messages[0];
    const hist = sys && sys.messages ? sys.messages.filter((m) => m.role !== 'system') : [];
    T23(streamed.text && !streamed.script && !streamed.js && sysMsg && sysMsg.role === 'system' && /当前路由：#war-keywords/.test(sysMsg.content) && hist.length >= 1 && hist.length <= 10, 'custom stream ' + JSON.stringify({ streamed, sys: !!(sysMsg && /当前路由/.test(sysMsg.content || '')), hist: hist.length }));
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(250);
    await pg.evaluate(() => QuestAssistant.close());
    const lay = await boxes();
    T23(lay.vw === 390 && lay.sw <= 390 && lay.fab && lay.fab.h > 30 && lay.top && lay.top.h > 30 && lay.bar && lay.bar.h > 40 && !hit(lay.fab, lay.top) && !hit(lay.fab, lay.bar), '390 FAB clear of to-top and bottom bar ' + JSON.stringify(lay));
    await pg.evaluate(() => scrollTo(0, 1600));
    await pg.waitForTimeout(250);
    const layShow = await boxes();
    const topShown = await pg.evaluate(() => document.getElementById('to-top').classList.contains('show'));
    T23(topShown && layShow.sw <= 390 && layShow.fab && layShow.top && layShow.top.h > 30 && layShow.bar && layShow.bar.h > 40 && !hit(layShow.fab, layShow.top) && !hit(layShow.fab, layShow.bar), '390 FAB clear when to-top shown ' + JSON.stringify(layShow));
    await pg.click('#qa-fab');
    const sheet = await pg.evaluate(() => {
      const panel = document.getElementById('qa-panel');
      const r = panel.getBoundingClientRect();
      return { sw: document.documentElement.scrollWidth, modal: panel.getAttribute('aria-modal'), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
    });
    T23(sheet.sw <= 390 && sheet.modal === 'true' && sheet.w <= 390 && sheet.top <= 1, '390 sheet ' + JSON.stringify(sheet));
    await pg.keyboard.press('Escape');
  } catch (e) {
    T23(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 8).join(' | ') : e));
  }
  T23(e23.length === 0, 'P23A console errors ' + e23.slice(0, 4).join(' | '));
  try { fake23.close(); } catch (_) {}
  await ctx.close();
  }
  console.log('P23A functional fails=' + f23); fail += f23;

  // ---------- Phase 23BC · 首页下一步 + 工具页流程 ----------
  let f23bc = 0; {
  const T23bc = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P23BC ' + m); if (!c) f23bc++; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = cx(await ctx.newPage());
  const e23bc = [];
  pg.on('pageerror', (e) => { e23bc.push('pageerror ' + e.message); errors.push('p23bc ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e23bc.push(m.text()); errors.push('p23bc ' + m.text()); } });
  const shotDir = '/workspace/gefei-quest-shots';
  try {
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.hero-cta a.btn-primary');
    const emptyCard = await pg.evaluate(() => {
      const hero = document.querySelector('.hero.hero-home');
      const primary = document.querySelector('.hero-cta a.btn-primary');
      const secondary = document.querySelector('.hero-cta a.btn-ghost, .hero-cta a.btn-secondary');
      const starts = hero ? [...hero.querySelectorAll('a, button')].filter((el) => (el.getAttribute('href') || '') === '#start') : [];
      const fn = QuestHome.nextStep(QuestSave.getDefaultSave());
      return {
        noStrip: !document.getElementById('home-next'),
        href: primary && primary.getAttribute('href'),
        btn: primary ? primary.textContent.replace(/\s+/g, '') : '',
        sHref: secondary && secondary.getAttribute('href'),
        startN: starts.length,
        grid: !!document.querySelector('#panel-home .feat-grid'),
        cont: !!document.getElementById('home-continue'),
        fnHref: fn.href,
        fnBtn: (fn.btn || '').replace(/\s+/g, ''),
        fnStage: fn.stage,
      };
    });
    T23bc(emptyCard.noStrip && emptyCard.href === '#start' && emptyCard.href === emptyCard.fnHref && emptyCard.btn.indexOf('我是新手') >= 0 && emptyCard.btn.indexOf(emptyCard.fnBtn) >= 0 && emptyCard.fnStage === '学习' && emptyCard.startN === 1 && emptyCard.sHref === '#home-rank' && !emptyCard.grid && !emptyCard.cont, 'empty save CTA #start ' + JSON.stringify(emptyCard));
    const branched = await pg.evaluate(() => {
      const base = QuestSave.getDefaultSave();
      const kw = JSON.parse(JSON.stringify(base));
      kw.keywords.items = [{ id: 'k1', at: 1, star: false, kw: 'pdf merge for mac', src: '手填', vol: '', big: '', weak: '', intent: 'tool', note: '' }];
      const started = JSON.parse(JSON.stringify(base));
      started.onboarding = { tourDone: true, tourSeenAt: null, days: { d1: true } };
      const draft = JSON.parse(JSON.stringify(kw));
      draft.sites = { items: [{ id: 's1', name: 'Demo', domain: 'demo.example', kw: 'pdf merge for mac', status: '筹备', logs: [] }] };
      const live = JSON.parse(JSON.stringify(draft));
      live.sites.items[0].status = '已上线';
      const data = JSON.parse(JSON.stringify(live));
      data.sites.items[0].logs = [{ month: '2026-09', clicks: 3, imp: 20, usd: 0 }];
      const flow = QuestHints.FLOW.map((s) => {
        const id = s.hash.replace(/^#/, '');
        const r = QuestNav.parse(id);
        const nxt = QuestHints.nextOf(s.id);
        return { id, ok: r.hash === id, next: nxt ? nxt.hash : '', nextOk: !nxt || QuestNav.parse(nxt.hash.replace(/^#/, '')).hash === nxt.hash.replace(/^#/, '') };
      });
      return {
        started: QuestHome.nextStep(started),
        kw: QuestHome.nextStep(kw),
        draft: QuestHome.nextStep(draft),
        live: QuestHome.nextStep(live),
        data: QuestHome.nextStep(data),
        flow,
        last: QuestHints.nextOf('pm'),
      };
    });
    T23bc(branched.started.href === '#path-quests' && branched.started.stage === '学习' && /第一课/.test(branched.started.title), 'started, no lesson → #path-quests ' + branched.started.href + ' ' + branched.started.title);
    T23bc(branched.kw.href === '#me-sites' && branched.kw.stage === '实施', 'keyword, no site → #me-sites ' + branched.kw.href);
    T23bc(branched.draft.href === '#war-publish' && branched.draft.stage === '实施', 'site not published → #war-publish ' + branched.draft.href);
    T23bc(branched.live.href === '#me-analytics' && branched.live.stage === '赚钱', 'published, no data → #me-analytics ' + branched.live.href);
    T23bc(branched.data.href === '#work-review' && branched.data.stage === '赚钱', 'published with logs, no review → #work-review ' + branched.data.href);
    T23bc(branched.flow.length >= 12 && branched.flow.every((s) => s.ok && s.nextOk) && branched.last == null, 'FLOW routes exist ' + branched.flow.filter((s) => !s.ok || !s.nextOk).map((s) => s.id).join(','));
    await pg.evaluate(() => {
      const s = QuestSave.getDefaultSave();
      s.keywords.items = [{ id: 'k1', at: 1, star: false, kw: 'pdf merge for mac', src: '手填', vol: '', big: '', weak: '', intent: 'tool', note: '' }];
      s.sites = { items: [] };
      localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s));
    });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.hero-cta a.btn-primary');
    const partial = await pg.evaluate(() => {
      const primary = document.querySelector('.hero-cta a.btn-primary');
      const hero = document.querySelector('.hero.hero-home');
      const save = JSON.parse(localStorage.getItem('gefei-quest-save-v1'));
      const starts = hero ? [...hero.querySelectorAll('a, button')].filter((el) => (el.getAttribute('href') || '') === '#start') : [];
      const fn = QuestHome.nextStep(save);
      return {
        href: primary && primary.getAttribute('href'),
        btn: primary ? primary.textContent.replace(/\s+/g, '') : '',
        fnHref: fn.href,
        noStrip: !document.getElementById('home-next'),
        startN: starts.length,
        kw: save.keywords.items.length,
        kwText: save.keywords.items[0] && save.keywords.items[0].kw,
        sites: save.sites.items.length,
      };
    });
    T23bc(partial.href === '#me-sites' && partial.href === partial.fnHref && partial.noStrip && partial.startN === 0 && partial.kw === 1 && partial.kwText === 'pdf merge for mac' && partial.sites === 0, 'partial save CTA #me-sites ' + JSON.stringify(partial));
    const pages = ['war-keywords', 'war-kit', 'me-sites', 'work'];
    for (const h of pages) {
      await pg.goto(BASE + 'index.html#' + h, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(220);
      const info = await pg.evaluate(() => {
        const panel = document.querySelector('.tab-panel:not([hidden])');
        const btn = panel && panel.querySelector('.flow-next a');
        const hint = panel && panel.querySelector('.page-hint');
        const href = btn ? btn.getAttribute('href') : '';
        const id = href.replace(/^#/, '');
        const route = href ? QuestNav.parse(id) : null;
        const hit = QuestHints.FLOW.filter((s) => s.hash === href)[0];
        return {
          text: btn ? btn.textContent.replace(/\s+/g, ' ').trim() : '',
          href,
          routeHash: route && route.hash,
          goal: !!(hint && hint.textContent.indexOf('目标：') >= 0),
          prog: hint ? hint.querySelectorAll('.page-hint-prog li').length : 0,
          cur: hint ? hint.querySelectorAll('.page-hint-prog li.current, .page-hint-prog li.done').length : 0,
          title: hit ? hit.title : '',
        };
      });
      T23bc(info.goal && info.prog === 3 && info.cur >= 1 && info.href && info.routeHash === info.href.slice(1) && info.title && info.text.indexOf('下一步') >= 0 && info.text.indexOf('→') >= 0 && info.text.indexOf(info.title) >= 0, '#' + h + ' goal + 下一步 ' + JSON.stringify(info));
      await pg.goto(BASE + 'index.html' + info.href, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(220);
      const landed = await pg.evaluate((href) => {
        const panel = document.querySelector('.tab-panel:not([hidden])');
        return { hash: location.hash, text: panel ? panel.innerText.trim().length : 0 };
      }, info.href);
      T23bc(landed.hash === info.href && landed.text > 40, '#' + h + ' next renders ' + info.href + ' text=' + landed.text);
    }
    await pg.goto(BASE + 'index.html#me-accounts', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.page-hint-x');
    const beforeDismiss = await pg.evaluate(() => {
      const panel = document.querySelector('.tab-panel:not([hidden])');
      return { hint: !!panel.querySelector('.page-hint'), next: !!panel.querySelector('.flow-next a') };
    });
    await pg.locator('.tab-panel:not([hidden]) .page-hint-x').click();
    await pg.waitForTimeout(120);
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(220);
    const afterDismiss = await pg.evaluate(() => {
      const panel = document.querySelector('.tab-panel:not([hidden])');
      const s = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null');
      const btn = panel && panel.querySelector('.flow-next a');
      return {
        hint: !!(panel && panel.querySelector('.page-hint')),
        next: btn ? btn.getAttribute('href') : '',
        dismissed: !!(s && s.hints && s.hints.dismissed && s.hints.dismissed['me-accounts'] === true),
      };
    });
    T23bc(beforeDismiss.hint && beforeDismiss.next && !afterDismiss.hint && afterDismiss.next === '#me-ai' && afterDismiss.dismissed, 'dismiss keeps 下一步 ' + JSON.stringify({ beforeDismiss, afterDismiss }));
    await pg.setViewportSize({ width: 390, height: 844 });
    for (const h of ['home', 'war-keywords']) {
      await pg.goto(BASE + 'index.html#' + h, { waitUntil: 'domcontentloaded' });
      await pg.reload({ waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(250);
      await pg.evaluate(() => {
        const t = document.getElementById('tour-root');
        if (t) t.remove();
        if (window.QuestAssistant && QuestAssistant.close) QuestAssistant.close();
      });
      const lay = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: window.innerWidth }));
      T23bc(lay.vw === 390 && lay.sw <= 390, '390 #' + h + ' no overflow ' + JSON.stringify(lay));
    }
    await pg.setViewportSize({ width: 1280, height: 800 });
    await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.hero-cta a.btn-primary');
    await pg.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
    await pg.locator('.hero.hero-home').screenshot({ path: shotDir + '/p23-home-next.png' });
    await pg.goto(BASE + 'index.html#war-keywords', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await pg.evaluate(async () => { await QuestAssistant.ask('怎么判断一个词值不值得做'); });
    await pg.waitForTimeout(200);
    const offlineShot = await pg.evaluate(() => document.getElementById('qa-panel').textContent.indexOf('站内资料检索（未连接 AI）') >= 0);
    T23bc(offlineShot, 'offline answer visible for screenshot');
    await pg.locator('#qa-panel').screenshot({ path: shotDir + '/p23-assistant-offline.png' });
    await pg.evaluate(() => QuestAssistant.close());
    await pg.goto(BASE + 'index.html#war-keywords', { waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('.page-hint-goal');
    await pg.screenshot({ path: shotDir + '/p23-tool-next.png', fullPage: true });
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await pg.evaluate(async () => { await QuestAssistant.ask('这个页面是干什么的'); });
    await pg.waitForTimeout(250);
    await pg.screenshot({ path: shotDir + '/p23-assistant-390.png' });
    await pg.keyboard.press('Escape');
  } catch (e) {
    T23bc(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 8).join(' | ') : e));
  }
  T23bc(e23bc.length === 0, 'P23BC console errors ' + e23bc.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P23BC functional fails=' + f23bc); fail += f23bc;

  // ---------- Phase 24 · 首页桌面版重排 ----------
  let f24 = 0; {
  const T24 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P24 ' + m); if (!c) f24++; };
  const fs = require('fs');
  const shot24 = '/workspace/gefei-quest-shots';
  fs.mkdirSync(shot24, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } });
  const pg = cx(await ctx.newPage());
  const e24 = [];
  pg.on('pageerror', (e) => { e24.push('pageerror ' + e.message); errors.push('p24 ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e24.push(m.text()); errors.push('p24 ' + m.text()); } });
  const quiet = () => pg.evaluate(() => {
    const t = document.getElementById('tour-root'); if (t) t.remove();
    if (window.QuestAssistant && QuestAssistant.close) QuestAssistant.close();
  });
  const measure = () => pg.evaluate(() => {
    function edge(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { l: r.left, r: r.right, w: r.width };
    }
    const ids = {
      hero: '.hero.hero-home .home-inner',
      how: '#home-howto .home-inner',
      rank: '#home-rank .home-inner',
      split: '#home-split .home-inner',
    };
    const edges = {};
    Object.keys(ids).forEach((k) => { edges[k] = edge(ids[k]); });
    const hero = document.querySelector('.hero.hero-home');
    const src = (window.QuestRank && QuestRank.latestItems ? QuestRank.latestItems() : ((QUEST_RANK.days[QUEST_RANK.latest] || {}).items || [])) || [];
    const expect = src.slice(0, 3);
    const rows = [...document.querySelectorAll('#hero-top3 .hero-top3-row')];
    const dateEl = document.querySelector('#hero-top3 time');
    const date = dateEl ? dateEl.textContent.trim() : '';
    const copy = document.querySelector('.hero-copy');
    const card = document.querySelector('.hero-top3');
    const cr = copy ? copy.getBoundingClientRect() : null;
    const tr = card ? card.getBoundingClientRect() : null;
    return {
      heroH: hero ? hero.getBoundingClientRect().height : 0,
      sw: document.documentElement.scrollWidth,
      vw: window.innerWidth,
      edges,
      n: rows.length,
      names: rows.map((r) => r.getAttribute('data-name')),
      ranks: rows.map((r) => r.getAttribute('data-rank')),
      wantNames: expect.map((i) => i.name),
      wantRanks: expect.map((i) => String(i.rank)),
      date,
      latest: (window.QUEST_RANK && QUEST_RANK.latest) || '',
      stacked: !!(cr && tr && tr.top >= cr.bottom - 4),
      sideBySide: !!(cr && tr && tr.left >= cr.right - 8),
    };
  });
  const heroSlack = () => pg.evaluate(() => {
    const hero = document.querySelector('.hero.hero-home').getBoundingClientRect();
    const cols = [...document.querySelectorAll('.hero-copy, .hero-top3')].map((el) => el.getBoundingClientRect());
    const tall = Math.max.apply(null, cols.map((r) => r.bottom));
    const top = Math.min.apply(null, cols.map((r) => r.top));
    const mid = cols.map((r) => Math.round((r.top + r.bottom) / 2));
    return {
      below: Math.round((hero.bottom - tall) * 10) / 10,
      above: Math.round((top - hero.top) * 10) / 10,
      heroH: Math.round(hero.height),
      mids: mid,
    };
  });
  const fabVsCards = async () => {
    await pg.evaluate(() => {
      const el = document.getElementById('home-howto');
      const nav = document.getElementById('site-nav');
      const navB = nav ? nav.getBoundingClientRect().height : 0;
      const y = el.getBoundingClientRect().top + window.scrollY - navB - 8;
      window.scrollTo(0, Math.max(0, y));
    });
    await pg.waitForTimeout(180);
    return pg.evaluate(() => {
      const fabEl = document.getElementById('qa-fab');
      const fb = fabEl.getBoundingClientRect();
      function hit(a, b) {
        return a.width > 0 && a.height > 0 && b.width > 0 && b.height > 0 && a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5;
      }
      const cards = [...document.querySelectorAll('.home-band .home-howto a, .home-band .home-rank-row, .home-band details')];
      const bad = cards.filter((el) => hit(fb, el.getBoundingClientRect())).map((el) => (el.id || el.className || el.tagName).toString().slice(0, 60));
      const how = document.getElementById('home-howto').getBoundingClientRect();
      return {
        n: bad.length,
        bad: bad.slice(0, 6),
        fab: { l: Math.round(fb.left), r: Math.round(fb.right), t: Math.round(fb.top), b: Math.round(fb.bottom), w: Math.round(fb.width), h: Math.round(fb.height) },
        howTop: Math.round(how.top),
        howVis: how.bottom > 80 && how.top < window.innerHeight - 40,
      };
    });
  };
  const edgesOk = (m) => {
    const vals = ['hero', 'how', 'rank', 'split'].map((k) => m.edges[k]).filter(Boolean);
    if (vals.length !== 4 || vals.some((e) => !(e.w > 0))) return false;
    const ls = vals.map((e) => e.l);
    const rs = vals.map((e) => e.r);
    return Math.max(...ls) - Math.min(...ls) <= 2 && Math.max(...rs) - Math.min(...rs) <= 2;
  };
  try {
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.evaluate(() => localStorage.removeItem('gefei-quest-save-v1'));
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForSelector('#hero-top3 .hero-top3-row');
    await pg.waitForSelector('#home-rank-list');
    await quiet();
    const at1366 = await measure();
    T24(at1366.vw === 1366 && at1366.heroH >= 360 && at1366.heroH <= 440, '1366 hero height ' + at1366.heroH);
    T24(at1366.n === 3 && at1366.names.join('\n') === at1366.wantNames.join('\n') && at1366.ranks.join(',') === at1366.wantRanks.join(',') && at1366.date === at1366.latest && !!at1366.date, '1366 top3 matches rank date=' + at1366.date + ' ' + JSON.stringify({ names: at1366.names, want: at1366.wantNames }));
    T24(edgesOk(at1366), '1366 edges ' + JSON.stringify(at1366.edges));
    T24(at1366.sideBySide && !at1366.stacked, '1366 hero is two columns');
    await pg.evaluate(() => window.scrollTo(0, 0));
    const slack1366 = await heroSlack();
    T24(slack1366.below <= 72, '1366 hero bottom pad ' + JSON.stringify(slack1366));
    const cards1366 = await fabVsCards();
    T24(cards1366.n === 0 && cards1366.howVis && cards1366.fab.w >= 40, '1366 FAB misses howto cards ' + JSON.stringify(cards1366));
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.click('#hero-top3 .hero-top3-more');
    await pg.waitForTimeout(900);
    const scrolled = await pg.evaluate(() => {
      const nav = document.getElementById('site-nav').getBoundingClientRect();
      const el = document.getElementById('home-rank').getBoundingClientRect();
      return { hash: location.hash, top: Math.round(el.top), nav: Math.round(nav.bottom), delta: el.top - nav.bottom };
    });
    T24(scrolled.hash === '#home-rank' && scrolled.delta >= -2 && scrolled.delta <= 36, 'top3 link scrolls under nav ' + JSON.stringify(scrolled));
    await pg.evaluate(() => window.scrollTo(0, Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)));
    await pg.waitForTimeout(250);
    const fab = await pg.evaluate(() => {
      const fabEl = document.getElementById('qa-fab');
      const fb = fabEl.getBoundingClientRect();
      function hit(a, b) {
        return a.width > 0 && a.height > 0 && b.width > 0 && b.height > 0 && a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5;
      }
      const cards = [...document.querySelectorAll('.hero-top3, .home-howto a, #home-rank .home-rank-row, #home-why, #home-faq details')];
      const bad = cards.filter((el) => hit(fb, el.getBoundingClientRect())).map((el) => (el.id || el.className || el.tagName).toString().slice(0, 80));
      return { n: bad.length, bad: bad.slice(0, 6), fabTop: Math.round(fb.top), fabH: Math.round(fb.height) };
    });
    T24(fab.n === 0 && fab.fabH > 30, '1366 FAB misses cards at bottom ' + JSON.stringify(fab));
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(80);
    await pg.screenshot({ path: shot24 + '/p24-home-1366.png', fullPage: false });
    await pg.screenshot({ path: shot24 + '/p24-home-1366-full.png', fullPage: true });
    await pg.setViewportSize({ width: 1024, height: 800 });
    await pg.waitForTimeout(120);
    await quiet();
    const at1024 = await measure();
    T24(at1024.vw === 1024 && at1024.heroH >= 360 && at1024.heroH <= 440, '1024 hero height ' + at1024.heroH);
    T24(at1024.n === 3 && at1024.date === at1024.latest && at1024.names.join('\n') === at1024.wantNames.join('\n'), '1024 top3 ' + at1024.date);
    T24(edgesOk(at1024), '1024 edges ' + JSON.stringify(at1024.edges));
    T24(at1024.sideBySide, '1024 hero is two columns');
    const cards1024 = await fabVsCards();
    T24(cards1024.n === 0 && cards1024.howVis && cards1024.fab.w >= 40, '1024 FAB misses howto cards ' + JSON.stringify(cards1024));
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.screenshot({ path: shot24 + '/p24-home-1024.png', fullPage: false });
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(250);
    await quiet();
    const mob = await measure();
    T24(mob.vw === 390 && mob.sw <= 390 && mob.stacked && mob.n === 3, '390 no overflow stacked top3 ' + JSON.stringify({ sw: mob.sw, vw: mob.vw, stacked: mob.stacked, n: mob.n, heroH: mob.heroH }));
    await pg.screenshot({ path: shot24 + '/p24-home-390.png', fullPage: false });
  } catch (e) {
    T24(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 8).join(' | ') : e));
  }
  T24(e24.length === 0, 'P24 console errors ' + e24.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P24 functional fails=' + f24); fail += f24;

  // ---------- Phase 25 · 导航整理 + 统一图标 ----------
  let f25 = 0; {
  const T25 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P25 ' + m); if (!c) f25++; };
  const fs = require('fs');
  const shot25 = '/workspace/gefei-quest-shots';
  fs.mkdirSync(shot25, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = cx(await ctx.newPage());
  const e25 = [];
  pg.on('pageerror', (e) => { e25.push('pageerror ' + e.message); errors.push('p25 ' + e.message); });
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e25.push(m.text()); errors.push('p25 ' + m.text()); } });
  const quiet = () => pg.evaluate(() => {
    const t = document.getElementById('tour-root'); if (t) t.remove();
    if (window.QuestAssistant && QuestAssistant.close) QuestAssistant.close();
  });
  try {
    await pg.goto(BASE + 'index.html#sitemap', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(280);
    await quiet();
    const bag = await pg.evaluate(() => {
      function take(sel) { return [...document.querySelectorAll(sel)].map((a) => a.getAttribute('href')).filter(Boolean); }
      const menu = {};
      document.querySelectorAll('.nav-menu a[href]').forEach((a) => {
        const h = a.getAttribute('href');
        menu[h] = (menu[h] || 0) + 1;
      });
      const flow = (window.QuestHints.FLOW || []).map((s) => s.id);
      const main = (window.QuestNav.mainFlow ? QuestNav.mainFlow() : []).map((s) => s.id);
      const sm = [...document.querySelectorAll('#panel-sitemap a[href]')].map((a) => a.getAttribute('href'));
      return {
        top: take('.site-links a.nav-top'),
        menu: take('.nav-menu a'),
        bottom: take('#bottom-bar a'),
        foot: take('#site-footer a'),
        map: sm,
        dup: Object.keys(menu).filter((h) => menu[h] > 1),
        smDup: sm.filter((h, i) => sm.indexOf(h) !== i),
        flow, main,
      };
    });
    const expectFlow = ['start', 'path', 'path-quests', 'war', 'war-keywords', 'war-kit', 'me-sites', 'war-publish', 'war-share', 'work', 'me-analytics', 'work-review', 'war-rank', 'pm'];
    T25(bag.flow.join(',') === expectFlow.join(',') && bag.main.join(',') === bag.flow.join(','), 'FLOW equals menu order ' + bag.flow.join(','));
    T25(bag.dup.length === 0, 'no route in two dropdowns ' + bag.dup.join(','));
    T25(bag.smDup.length === 0, 'sitemap hrefs unique ' + bag.smDup.slice(0, 8).join(','));
    const hrefs = [...new Set([].concat(bag.top, bag.menu, bag.bottom, bag.foot, bag.map))];
    const linkBad = [];
    for (const href of hrefs) {
      if (!href || /^(https?:|mailto:)/.test(href)) continue;
      if (href.charAt(0) !== '#') {
        const r = await pg.request.get(BASE + href.replace(/^\.\//, ''));
        if (r.status() !== 200) linkBad.push(href + ' ' + r.status());
        continue;
      }
      await pg.goto(BASE + 'index.html' + href, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(120);
      const info = await pg.evaluate((want) => {
        const hash = location.hash.split('?')[0];
        const canon = '#' + QuestNav.canonical(want.slice(1));
        const panel = [...document.querySelectorAll('.tab-panel')].filter((x) => !x.hidden);
        const empty = !!document.querySelector('.tab-panel:not([hidden]) .empty-state');
        return { hash, canon, panel: panel.map((x) => x.id).join(','), empty, text: panel[0] ? panel[0].innerText.trim().length : 0 };
      }, href);
      if ((info.hash !== href && info.hash !== info.canon) || !info.panel || info.empty || info.text < 8) linkBad.push(href + ' ' + JSON.stringify(info));
    }
    T25(linkBad.length === 0, 'nav links resolve ' + linkBad.slice(0, 6).join(' | '));
    const cases = [
      ['home', '首页', '', '首页', '', '', '出海小站练站营'],
      ['start', '新手引导', '', '新手', '新手引导', '首页/新手引导', '新手引导'],
      ['path', '学习', '学习路线', '学习', '学习路线', '首页/学习/学习路线', '学习路线'],
      ['path-quests', '学习', '任务清单', '学习', '任务清单', '首页/学习/任务清单', '任务清单'],
      ['guides', '学习', '手册与模板', '学习', '手册与模板', '首页/学习/手册与模板', '手册与模板'],
      ['guide-station-one-playbook', '学习', '手册与模板', '学习', '手册与模板', '首页/学习/手册与模板/', '手册与模板'],
      ['lib', '学习', '资源库', '学习', '资源库', '首页/学习/资源库', '资源库'],
      ['lib-tools', '学习', '资源库', '学习', '资源库', '首页/学习/资源库', '资源库'],
      ['weekly', '学习', '每周补给', '学习', '每周补给', '首页/学习/每周补给', '每周补给'],
      ['war', '实施', '7 天作战日程', '实施', '7 天作战日程', '首页/实施/7 天作战日程', '7 天作战日程'],
      ['war-s2', '实施', '7 天作战日程', '实施', '7 天作战日程', '首页/实施/7 天作战日程', '7 天作战日程'],
      ['war-s3', '实施', '7 天作战日程', '实施', '7 天作战日程', '首页/实施/7 天作战日程', '7 天作战日程'],
      ['war-m', '实施', '7 天作战日程', '实施', '7 天作战日程', '首页/实施/7 天作战日程', '7 天作战日程'],
      ['war-x', '实施', '7 天作战日程', '实施', '7 天作战日程', '首页/实施/7 天作战日程', '7 天作战日程'],
      ['war-keywords', '实施', '选词练习板', '实施', '选词练习板', '首页/实施/选词练习板', '选词练习板'],
      ['war-kit', '实施', '站一实操助手', '实施', '站一实操助手', '首页/实施/站一实操助手', '站一实操助手'],
      ['me-sites', '实施', '我的站点台账', '实施', '我的站点台账', '首页/实施/我的站点台账', '我的站点台账'],
      ['war-publish', '实施', '发布上线', '实施', '发布上线', '首页/实施/发布上线', '发布上线'],
      ['war-share', '实施', '内容分发', '实施', '内容分发', '首页/实施/内容分发', '内容分发'],
      ['work', '实施', '工作台', '实施', '工作台', '首页/实施/工作台', '工作台'],
      ['me-analytics', '赚钱', '数据分析', '赚钱', '数据分析', '首页/赚钱/数据分析', '数据分析'],
      ['work-review', '赚钱', '每周复盘', '赚钱', '每周复盘', '首页/赚钱/每周复盘', '每周复盘'],
      ['war-rank', '赚钱', '每日赚钱榜', '赚钱', '每日赚钱榜', '首页/赚钱/每日赚钱榜', '每日赚钱榜'],
      ['pm', '赚钱', '平台变现', '赚钱', '平台变现', '首页/赚钱/平台变现', '平台变现'],
      ['pm-cn', '赚钱', '平台变现', '赚钱', '平台变现', '首页/赚钱/平台变现', '平台变现'],
      ['pm-global', '赚钱', '平台变现', '赚钱', '平台变现', '首页/赚钱/平台变现', '平台变现'],
      ['me', '我的', '我的进度', '我的', '我的进度', '首页/我的/我的进度', '我的进度'],
      ['me-stats', '我的', '学习统计', '我的', '学习统计', '首页/我的/学习统计', '学习统计'],
      ['me-accounts', '我的', '账号中心', '我的', '账号中心', '首页/我的/账号中心', '账号中心'],
      ['me-ai', '我的', 'AI 设置', '我的', 'AI 设置', '首页/我的/AI 设置', 'AI 设置'],
      ['changelog', '我的', '更新日志', '我的', '更新日志', '首页/我的/更新日志', '更新日志'],
      ['sitemap', '', '', '', '网站地图', '首页/网站地图', '网站地图'],
      ['dev', '', '', '', '开发者文档', '首页/开发者文档', '开发者文档'],
    ];
    const ownBad = [];
    const uiBad = [];
    for (const row of cases) {
      const hash = row[0], parent = row[1], item = row[2], bottom = row[3], h1 = row[4], crumb = row[5], title = row[6];
      if (hash !== 'sitemap' && hash !== 'dev') {
        const owners = await pg.evaluate((h) => QuestNav.pagesOwning(h).map((p) => p.id), hash);
        if (owners.length !== 1) ownBad.push(hash + ':' + owners.join('|'));
      }
      await pg.goto(BASE + 'index.html#' + hash, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(140);
      await quiet();
      const ui = await pg.evaluate(() => {
        const p = document.querySelector('a.nav-top.active span');
        const it = document.querySelector('.nav-menu a.active b');
        const b = document.querySelector('#bottom-bar a.active span');
        const titleEl = document.querySelector('h1.sh-title');
        const hero = document.querySelector('h1.hero-title');
        const crumbs = [...document.querySelectorAll('.crumbs > a, .crumbs > [aria-current]')].map((el) => el.textContent.trim());
        return {
          parent: p ? p.textContent.trim() : '',
          item: it ? it.textContent.trim() : '',
          bottom: b ? b.textContent.trim() : '',
          h1: titleEl ? titleEl.textContent.trim() : (hero ? hero.textContent.trim() : ''),
          crumbs: crumbs.join('/'),
          title: document.title,
          empty: !!document.querySelector('.tab-panel:not([hidden]) .empty-state'),
        };
      });
      let crumbOk = crumb === '' || ui.crumbs === crumb;
      if (hash === 'guide-station-one-playbook') crumbOk = ui.crumbs.indexOf('首页/学习/手册与模板/') === 0 && ui.crumbs.length > '首页/学习/手册与模板/'.length;
      const titleOk = hash === 'home' ? ui.title === title : ui.title.indexOf(title) === 0;
      const h1Ok = hash === 'home' ? ui.h1 === '做英文出海小站' : ui.h1 === h1;
      if (ui.parent !== parent || ui.item !== item || ui.bottom !== bottom || !h1Ok || !crumbOk || !titleOk || ui.empty) {
        uiBad.push('#' + hash + ' ' + JSON.stringify(ui));
      }
    }
    T25(ownBad.length === 0, 'single owner ' + ownBad.join(','));
    T25(uiBad.length === 0, 'active + crumb + h1 ' + uiBad.slice(0, 3).join(' || '));
    const devHref = await pg.evaluate(() => {
      const a = document.querySelector('#panel-sitemap a[href^="#dev-"]');
      return a ? a.getAttribute('href') : '';
    });
    T25(!!devHref, 'sitemap lists a dev doc');
    if (devHref) {
      await pg.goto(BASE + 'index.html' + devHref, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(180);
      const devUi = await pg.evaluate(() => {
        const crumbs = [...document.querySelectorAll('.crumbs > a, .crumbs > [aria-current]')].map((el) => el.textContent.trim());
        return { crumbs: crumbs.join('/'), n: crumbs.length, h1: ((document.querySelector('h1.sh-title') || {}).textContent || '').trim(), title: document.title };
      });
      T25(devUi.n === 3 && devUi.crumbs.indexOf('首页/开发者文档/') === 0 && devUi.h1 === '开发者文档' && devUi.title.indexOf('开发者文档') === 0, 'dev doc crumb ' + JSON.stringify(devUi));
    }
    const aliases = [['rank', '#war-rank'], ['resources', '#lib'], ['ai', '#me-ai'], ['settings', '#me'], ['map', '#path'], ['quests', '#path-quests'], ['stats', '#me-stats'], ['platforms', '#pm'], ['learn', '#path'], ['do', '#war'], ['practice', '#war'], ['earn', '#war-rank'], ['money', '#war-rank'], ['res', '#lib']];
    const aliasBad = [];
    for (const pair of aliases) {
      await pg.goto(BASE + 'index.html#' + pair[0], { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(70);
      const hash = await pg.evaluate(() => location.hash);
      if (hash !== pair[1]) aliasBad.push(pair[0] + '->' + hash);
    }
    T25(aliasBad.length === 0, 'aliases ' + aliasBad.join(','));
    await pg.setViewportSize({ width: 1280, height: 800 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    await quiet();
    await pg.click('.nav-drop[data-group="learn"] .nav-caret');
    await pg.waitForTimeout(80);
    const iconTileReport = (sel) => {
      function one(tile) {
        const svg = tile.querySelector('svg');
        if (!svg || !svg.getBBox) return { ok: false, why: 'no-svg', cls: String(tile.className).slice(0, 48) };
        const bb = svg.getBBox();
        const boxOk = bb.width > 4 && bb.x >= 1.9 && bb.y >= 1.9 && (bb.x + bb.width) <= 22.1 && (bb.y + bb.height) <= 22.1;
        const a = svg.getBoundingClientRect();
        const b = tile.getBoundingClientRect();
        const inside = a.width > 8 && a.height > 8 && a.left >= b.left - 0.6 && a.right <= b.right + 0.6 && a.top >= b.top - 0.6 && a.bottom <= b.bottom + 0.6;
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return { ok: !!(boxOk && inside && dx <= 2 && dy <= 2), dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10, cls: String(tile.className).slice(0, 48) };
      }
      const rows = [...document.querySelectorAll(sel)].filter((el) => {
        if (el.closest('[hidden]')) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 8 && r.height > 8;
      }).map(one);
      return { n: rows.length, ok: rows.length > 0 && rows.every((r) => r.ok), bad: rows.filter((r) => !r.ok).slice(0, 5) };
    };
    const iconFit = await pg.evaluate(iconTileReport, '.nav-drop.is-open .nav-ico');
    T25(iconFit.n >= 5 && iconFit.ok, 'dropdown icons centered ' + JSON.stringify(iconFit));
    await pg.screenshot({ path: shot25 + '/p25-nav-dropdown.png' });
    await pg.keyboard.press('Escape');
    const homeIco = await pg.evaluate(() => {
      function one(tile) {
        const svg = tile.querySelector('svg');
        if (!svg || !svg.getBBox) return false;
        const bb = svg.getBBox();
        const boxOk = bb.width > 4 && bb.x >= 1.9 && bb.y >= 1.9 && (bb.x + bb.width) <= 22.1 && (bb.y + bb.height) <= 22.1;
        const a = svg.getBoundingClientRect();
        const b = tile.getBoundingClientRect();
        const inside = a.width > 8 && a.height > 8 && a.left >= b.left - 0.6 && a.right <= b.right + 0.6 && a.top >= b.top - 0.6 && a.bottom <= b.bottom + 0.6;
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return !!(boxOk && inside && dx <= 2 && dy <= 2);
      }
      const tiles = [...document.querySelectorAll('#home .home-step-ico, #home-howto .home-step-ico, #panel-home .card-ico, #panel-home .sh-ico')].filter((el) => {
        if (el.closest('[hidden]')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 8 && r.height > 8;
      });
      return { n: tiles.length, ok: tiles.every(one), hrefs: [...document.querySelectorAll('#home-howto a')].map((a) => a.getAttribute('href')) };
    });
    T25(homeIco.n === 3 && homeIco.ok && homeIco.hrefs.join(',') === '#path,#war,#war-rank', 'home card icons ' + JSON.stringify(homeIco));
    await pg.locator('#home-howto').screenshot({ path: shot25 + '/p25-home-icons.png' });
    await pg.goto(BASE + 'index.html#start', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(180);
    await quiet();
    const startIco = await pg.evaluate(iconTileReport, '#panel-start .card-ico, #panel-start .home-step-ico, .section-head .sh-ico');
    T25(startIco.n >= 4 && startIco.ok, 'start icon tiles centered ' + JSON.stringify(startIco));
    await pg.goto(BASE + 'index.html#war-keywords', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(180);
    await quiet();
    const sh = await pg.evaluate(() => {
      const tile = document.querySelector('.sh-ico');
      const svg = tile && tile.querySelector('svg');
      if (!svg) return { ok: false };
      const bb = svg.getBBox();
      const a = svg.getBoundingClientRect();
      const b = tile.getBoundingClientRect();
      const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
      const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
      return {
        ok: a.left >= b.left - 0.6 && a.right <= b.right + 0.6 && a.top >= b.top - 0.6 && a.bottom <= b.bottom + 0.6 && bb.x >= 1.9 && bb.y >= 1.9 && (bb.x + bb.width) <= 22.1 && (bb.y + bb.height) <= 22.1 && dx <= 2 && dy <= 2,
        w: Math.round(b.width), h: Math.round(b.height), dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10,
      };
    });
    T25(sh.ok && sh.w >= 44 && sh.w <= 52 && sh.h >= 44 && sh.h <= 52, 'section icon ' + JSON.stringify(sh));
    const kwIco = await pg.evaluate(iconTileReport, '.sh-ico, #panel-war .card-ico, #panel-war .home-step-ico');
    T25(kwIco.n >= 1 && kwIco.ok, 'keywords icon tiles centered ' + JSON.stringify(kwIco));
    await pg.goto(BASE + 'index.html#me', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(180);
    await quiet();
    const meIco = await pg.evaluate(iconTileReport, '#panel-me .card-ico, .section-head .sh-ico');
    T25(meIco.n >= 5 && meIco.ok, 'me icon tiles centered ' + JSON.stringify(meIco));
    await pg.locator('.section-head').screenshot({ path: shot25 + '/p25-breadcrumb.png' });
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(250);
    await quiet();
    const mob = await pg.evaluate(() => {
      const bar = document.getElementById('bottom-bar');
      const labels = bar ? [...bar.querySelectorAll('a span')].map((s) => s.textContent.trim()) : [];
      const b = document.querySelector('#site-nav .nav-search');
      const r = b ? b.getBoundingClientRect() : null;
      const s = b ? getComputedStyle(b) : null;
      return { sw: document.documentElement.scrollWidth, labels: labels.join(','), search: !!(b && s.display !== 'none' && r.width > 20 && r.left >= -1 && r.right <= 391) };
    });
    T25(mob.sw <= 390 && mob.labels === '首页,新手,学习,实施,赚钱,我的' && mob.search, '390 bottom + search ' + JSON.stringify(mob));
    await pg.screenshot({ path: shot25 + '/p25-mobile-390.png' });
    await pg.setViewportSize({ width: 1280, height: 900 });
    await pg.goto(BASE + 'icons.html', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(200);
    const sheet = await pg.evaluate(() => ({
      n: document.querySelectorAll('#sheet code').length,
      tints: [...document.querySelectorAll('#tints code, #tints span')].map((s) => s.textContent.trim()).filter(Boolean).join(','),
    }));
    T25(sheet.n >= 40 && sheet.tints.indexOf('学习') >= 0 && sheet.tints.indexOf('实施') >= 0 && sheet.tints.indexOf('赚钱') >= 0, 'icons sheet ' + JSON.stringify(sheet));
    await pg.screenshot({ path: shot25 + '/p25-icons-sheet.png', fullPage: true });
  } catch (e) {
    T25(false, 'threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 8).join(' | ') : e));
  }
  T25(e25.length === 0, 'P25 console errors ' + e25.slice(0, 4).join(' | '));
  await ctx.close();
  }
  console.log('P25 functional fails=' + f25); fail += f25;

  // ---------- Phase 26 · 每条都标来源 ----------
  let f26 = 0; const T26 = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + 'P26 ' + m); if (!c) f26++; };
  const fs26 = require('fs');
  const path26 = require('path');
  const cp26 = require('child_process');
  const os26 = require('os');
  const root26 = path26.resolve(__dirname, '..');
  const shot26 = SHOTS || '/workspace/gefei-quest-shots';
  fs26.mkdirSync(shot26, { recursive: true });
  try {
    const rankFiles = [];
    const walk26 = (dir) => {
      fs26.readdirSync(dir).forEach((f) => {
        const pth = path26.join(dir, f);
        if (fs26.statSync(pth).isDirectory()) return walk26(pth);
        if (f === 'index.json') return;
        if (/\.json$/.test(f)) rankFiles.push(pth);
      });
    };
    rankFiles.push(path26.join(root26, 'data/rank.json'));
    walk26(path26.join(root26, 'data/rank-history'));
    walk26(path26.join(root26, 'data/money-rank'));
    let miss = 0, nItems = 0;
    rankFiles.forEach((f) => {
      const data = JSON.parse(fs26.readFileSync(f, 'utf8'));
      (data.items || []).forEach((it, i) => {
        nItems++;
        if (!Array.isArray(it.sources) || !it.sources.length || it.sources[0].url !== it.source_url) {
          miss++;
          if (miss <= 3) console.log('     missing sources', path26.relative(root26, f), 'items[' + i + ']');
        }
      });
    });
    T26(nItems >= 10 && miss === 0, 'every rank item has sources[0].url === source_url n=' + nItems);

    const QS = require('./../js/sources.js');
    T26(QS.kindOf('https://finance.sina.com.cn/roll/x') === 'media' && QS.kindOf('https://www.shhk.gov.cn/a') === 'official' && QS.kindOf('https://www.zhihu.com/creator') === 'community', 'kindOf media/official/community');

    const baseRank = JSON.parse(fs26.readFileSync(path26.join(root26, 'data/rank.json'), 'utf8'));
    const tmpDir = fs26.mkdtempSync(path26.join(os26.tmpdir(), 'p26-rank-'));
    const runBad = (mutator, needle) => {
      const copy = JSON.parse(JSON.stringify(baseRank));
      mutator(copy);
      const f = path26.join(tmpDir, 'bad.json');
      fs26.writeFileSync(f, JSON.stringify(copy));
      const r = cp26.spawnSync(process.execPath, [path26.join(root26, 'tools/publish-rank.js'), f, '--no-changelog'], { encoding: 'utf8' });
      const out = (r.stdout || '') + (r.stderr || '');
      const ok = r.status !== 0 && needle.test(out);
      if (!ok) console.log('     publish exit=' + r.status + ' out=' + out.slice(0, 400));
      return ok;
    };
    T26(runBad((d) => { delete d.items[0].sources; d.items[0].source_url = ''; }, /no source|没有来源|sources/i), 'publish-rank rejects item with no source');
    T26(runBad((d) => { d.items[0].sources = [{ title: '', url: 'ftp://example.com/x', publisher: 'example.com', published: '', kind: 'media', checked: '2026-10-18' }]; d.items[0].source_url = 'ftp://example.com/x'; }, /url must be http/i), 'publish-rank rejects illegal url');
    T26(runBad((d) => { d.items[0].sources = [{ title: '', url: 'https://example.com/x', publisher: 'example.com', published: '', kind: 'blog', checked: '2026-10-18' }]; d.items[0].source_url = 'https://example.com/x'; }, /kind must be/i), 'publish-rank rejects illegal kind');
    try { fs26.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}

    const swSrc = fs26.readFileSync(path26.join(root26, 'sw.js'), 'utf8');
    T26(/CACHE_VERSION\s*=\s*12/.test(swSrc) && /js\/sources\.js/.test(swSrc), 'sw CACHE_VERSION 12 + sources.js precache');
    const cl = fs26.readFileSync(path26.join(root26, 'js/changelog.js'), 'utf8');
    T26(/id:\s*34/.test(cl) && /每条赚钱榜和平台资料都标出来源/.test(cl), 'changelog id 34 sources entry');
  } catch (e) {
    T26(false, 'file checks threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e));
  }

  const ctx26 = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const pg26 = cx(await ctx26.newPage());
  const e26 = [];
  pg26.on('pageerror', (e) => { e26.push('pageerror ' + e.message); errors.push('p26 ' + e.message); });
  pg26.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/.test(m.text())) { e26.push(m.text()); errors.push('p26 ' + m.text()); } });
  try {
    await pg26.goto(BASE + 'index.html#war-rank', { waitUntil: 'domcontentloaded' });
    await pg26.waitForTimeout(350);
    await pg26.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); if (window.QuestAssistant && QuestAssistant.close) QuestAssistant.close(); });
    const rankUi = await pg26.evaluate(() => {
      const cards = [...document.querySelectorAll('.rank-card')];
      const sina = cards.find((c) => /finance\.sina\.com\.cn/.test(c.innerHTML));
      const qs = sina ? sina.querySelector('.qs') : null;
      const qsText = qs ? qs.textContent : '';
      const chips = [...document.querySelectorAll('[data-rtype]')].map((b) => b.getAttribute('data-rtype'));
      const present = [...new Set(cards.map((c) => c.getAttribute('data-type')))];
      const extra = chips.filter((t) => t && t !== 'all' && present.indexOf(t) < 0);
      const faceNodes = [...document.querySelectorAll('.rank-card .rank-face-src .qs-compact')];
      const footNodes = [...document.querySelectorAll('.rank-card .rank-foot .qs')];
      return {
        n: cards.length,
        nQs: document.querySelectorAll('.rank-card .qs').length,
        face: faceNodes.length,
        foot: footNodes.length,
        faceOutside: faceNodes.length === 10 && faceNodes.every((q) => !q.closest('.cx-body') && q.querySelector('.qs-kind') && /官方|媒体|社区/.test(q.querySelector('.qs-kind').textContent) && q.querySelector('.qs-pub') && /↗/.test((q.querySelector('a.qs-link') || {}).textContent || '')),
        footInside: footNodes.length === 10 && footNodes.every((q) => !!q.closest('.cx-body') && !q.classList.contains('qs-compact') && /来源/.test(q.textContent)),
        sinaQs: !!(qs && /finance\.sina/.test(qs.innerHTML)),
        sinaOfficial: qsText.indexOf('官方') >= 0,
        sinaMedia: qsText.indexOf('媒体') >= 0,
        chips: chips,
        extra: extra,
        hasAll: chips[0] === 'all',
        types: window.QuestRank && QuestRank.TYPES ? QuestRank.TYPES.length : 0,
      };
    });
    T26(rankUi.n === 10 && rankUi.face === 10 && rankUi.foot === 10 && rankUi.faceOutside && rankUi.footInside, 'rank cards face+footer sources n=' + rankUi.n + ' face=' + rankUi.face + ' foot=' + rankUi.foot + ' qs=' + rankUi.nQs);
    T26(rankUi.sinaQs && rankUi.sinaMedia && !rankUi.sinaOfficial, 'sina source shows 媒体 not 官方');
    await pg26.click('#panel-war .cx-pager [data-pg="all"]');
    await pg26.waitForTimeout(80);
    const faceVis = await pg26.evaluate(() => {
      const cards = [...document.querySelectorAll('#panel-war .rank-grid > .rank-card')];
      const rows = cards.map((c) => {
        const q = c.querySelector(':scope > .rank-head .rank-face-src .qs-compact');
        const body = c.querySelector(':scope > .cx-body');
        const btn = c.querySelector(':scope > .cx-toggle');
        const r = q ? q.getBoundingClientRect() : { width: 0, height: 0 };
        const kind = q && q.querySelector('.qs-kind') ? q.querySelector('.qs-kind').textContent : '';
        const pub = q && q.querySelector('.qs-pub') ? q.querySelector('.qs-pub').textContent.trim() : '';
        const link = q && q.querySelector('a.qs-link') ? q.querySelector('a.qs-link').textContent : '';
        const collapsed = !!(body && body.classList.contains('cx-off') && btn && btn.getAttribute('aria-expanded') === 'false' && !c.classList.contains('cx-open'));
        return {
          ok: !!q && !q.closest('.cx-body') && !c.classList.contains('cx-off') && collapsed && r.width > 0 && r.height > 0 && r.height <= 40 && /官方|媒体|社区/.test(kind) && !!pub && /↗/.test(link),
          h: Math.round(r.height),
        };
      });
      return { n: cards.length, ok: rows.length === 10 && rows.every((x) => x.ok), h: rows.map((x) => x.h) };
    });
    T26(faceVis.ok, 'rank compact source visible without expanding on all 10 h=' + (faceVis.h || []).join(','));
    T26(rankUi.hasAll && rankUi.extra.length === 0 && rankUi.types === 12, 'type chips 全部 + only present types, TYPES=12 extra=' + rankUi.extra.join(','));
    const firstType = await pg26.getAttribute('[data-rtype]:not([data-rtype="all"])', 'data-rtype');
    await pg26.click('[data-rtype="' + firstType + '"]');
    await pg26.waitForTimeout(120);
    const filtered = await pg26.evaluate((t) => {
      const cards = [...document.querySelectorAll('.rank-card')];
      return { n: cards.length, ok: cards.length > 0 && cards.every((c) => c.getAttribute('data-type') === t) };
    }, firstType);
    T26(filtered.ok, 'type filter ' + firstType + ' n=' + filtered.n);
    await pg26.click('[data-rtype="all"]');
    await pg26.waitForTimeout(80);
    await pg26.click('.rank-card[data-rank="1"] [data-plan-add]');
    await pg26.waitForTimeout(120);
    const planQs = await pg26.evaluate(() => {
      const plan = document.querySelector('#rank-plan');
      return { n: document.querySelectorAll('#rank-plan .plan-item').length, qs: !!(plan && plan.querySelector('.qs')) };
    });
    T26(planQs.n === 1 && planQs.qs, 'rankPlan shows QuestSources');
    await pg26.locator('#panel-war .rank-card[data-rank="1"] .rank-face-src').screenshot({ path: shot26 + '/p26-rank-sources.png' }).catch(async () => {
      await pg26.screenshot({ path: shot26 + '/p26-rank-sources.png' });
    });

    await pg26.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
    await pg26.waitForTimeout(280);
    await pg26.evaluate(() => { const t = document.getElementById('tour-root'); if (t) t.remove(); });
    const homeQs = await pg26.evaluate(() => {
      const box = document.querySelector('#hero-top3');
      return { n: box ? box.querySelectorAll('.qs').length : 0, rows: document.querySelectorAll('#hero-top3 .hero-top3-row').length };
    });
    T26(homeQs.rows >= 3 && homeQs.n >= 3, 'home Top 3 compact sources rows=' + homeQs.rows + ' qs=' + homeQs.n);
    await pg26.locator('#hero-top3').screenshot({ path: shot26 + '/p26-home-top3.png' });

    await pg26.goto(BASE + 'index.html#pm-cn-media', { waitUntil: 'domcontentloaded' });
    await pg26.waitForTimeout(280);
    const pmQs = await pg26.evaluate(() => {
      const n = document.querySelectorAll('.pm-card .qs').length;
      const badges = document.querySelectorAll('.pm-card .pm-link').length;
      const unkFn = (u) => {
        const c = (window.QUEST_PLATFORM_LINKS && QUEST_PLATFORM_LINKS.status || {})[u];
        if (!c) return '未核实';
        if (c === '200') return '200 已核实';
        return c + ' 自动检查被拦截';
      };
      const sina = [...document.querySelectorAll('.pm-card .qs-item')].find((el) => /finance\.sina/.test(el.innerHTML));
      const sinaText = sina ? sina.textContent : '';
      const shown = [...document.querySelectorAll('.pm-card')].filter((c) => !c.classList.contains('cx-off'));
      const face = shown.map((c) => {
        const q = c.querySelector(':scope > .pm-face-src .qs-compact');
        const box = c.querySelector(':scope > .pm-face-src');
        const collapsed = !!c.querySelector('dl > .cx-body.cx-off');
        const r = box ? box.getBoundingClientRect() : { width: 0, height: 0 };
        const unk = [...c.querySelectorAll(':scope > .pm-face-src .pm-link.unk')];
        const unkOk = unk.every((el) => {
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.height > 0 && !el.closest('.cx-body') && !el.closest('.cx-off');
        });
        return !!q && !q.closest('.cx-body') && collapsed && r.width > 0 && r.height > 0 && r.height <= 40 && unkOk && !!q.querySelector('.qs-kind') && /↗/.test((q.querySelector('a.qs-link') || {}).textContent || '') && !!q.querySelector('.pm-link');
      });
      return { n: n, badges: badges, unkLabel: unkFn('https://example.invalid/no-such-source'), sina: !!sina, sinaOfficial: sinaText.indexOf('官方') >= 0, sinaMedia: sinaText.indexOf('媒体') >= 0, faceOk: face.length >= 1 && face.every(Boolean), faceN: face.length };
    });
    T26(pmQs.n >= 1 && pmQs.badges >= 1 && pmQs.unkLabel === '未核实', 'platform sources + 未核实 mark n=' + pmQs.n + ' badges=' + pmQs.badges);
    T26(pmQs.sina && pmQs.sinaMedia && !pmQs.sinaOfficial, 'platform sina reprint is 媒体 not 官方');
    T26(pmQs.faceOk, 'platform card face shows compact source without expanding n=' + pmQs.faceN);
    await pg26.locator('.pm-card .qs, .pm-card').first().screenshot({ path: shot26 + '/p26-platform-sources.png' });

    await pg26.goto(BASE + 'index.html#war-rank', { waitUntil: 'domcontentloaded' });
    await pg26.waitForTimeout(200);
    await pg26.evaluate(() => { if (window.QuestAssistant && QuestAssistant.close) QuestAssistant.close(); });
    const off = await pg26.evaluate(async () => {
      if (!window.QuestAssistant) return { ok: false };
      const q = 'AI Visibility Checker';
      const hits = QuestAssistant.search(q);
      await QuestAssistant.ask(q);
      const panel = document.getElementById('qa-panel');
      const qs = panel ? panel.querySelectorAll('.qs').length : 0;
      const withSrc = (hits || []).filter((h) => h && ((h.sources && h.sources.length) || h.href === '#war-rank')).length;
      return { n: (hits || []).length, withSrc: withSrc, qs: qs, label: panel && panel.textContent.indexOf('站内资料检索（未连接 AI）') >= 0 };
    });
    T26(off.n >= 1 && off.qs >= 1 && off.label, 'assistant offline results include sources hits=' + off.n + ' qs=' + off.qs);
  } catch (e) {
    T26(false, 'ui threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 8).join(' | ') : e));
  }
  T26(e26.length === 0, 'P26 console errors ' + e26.slice(0, 4).join(' | '));
  await ctx26.close();
  console.log('P26 functional fails=' + f26); fail += f26;
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
