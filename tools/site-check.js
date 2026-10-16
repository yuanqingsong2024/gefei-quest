// Usage: node tools/site-check.js [baseUrl] [shotDir]  (needs playwright-core + Chrome)
const { chromium } = require(process.env.PW || 'playwright-core');
const BASE = process.argv[2] || 'http://localhost:8765/';
const SHOTS = process.argv[3] || '';
const ROUTES = ['home','path','path-quests','war','war-s2','war-s3','war-m','war-x','war-kit','war-keywords','lib','lib-tools','lib-hosting','lib-monetize','lib-paths','lib-xianyu','lib-tips','lib-peers','guides','weekly','me','me-sites','me-stats','changelog','dev'];
const OLD = { '':'home', map:'path', quest:'path-quests', quests:'path-quests', ship:'weekly', ach:'me', settings:'me', stats:'me-stats', updates:'changelog', resources:'lib', 'war-s1':'war', 'home-faq':'home-faq' };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = []; p.on('pageerror', e => errors.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
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
    const m9 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
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
    const m10 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    for (const h of ['home', 'me-stats', 'changelog']) { await m10.goto(BASE + 'index.html#' + h); await m10.waitForTimeout(300); const w = await m10.evaluate(() => document.documentElement.scrollWidth); console.log((w <= 390 ? 'ok   ' : 'FAIL ') + 'mobile ' + h + ' scrollWidth ' + w); if (w > 390) fail++; }
    await s10('me-stats', 'mobile-stats', m10); await s10('home', 'mobile-home', m10, false);
  }
  console.log(`TOTAL fails=${fail} consoleErrors=${errors.length}`);
  if (SHOTS) {
    const shot = async (h, name, pg = p) => { await pg.goto(BASE + 'index.html#' + h); await pg.waitForTimeout(400); await pg.screenshot({ path: `${SHOTS}/p8-${name}.png`, fullPage: false }); };
    await shot('home', 'home'); await shot('path', 'path'); await shot('war', 'war'); await shot('lib-xianyu', 'lib'); await shot('guide-station-one-playbook', 'guide'); await shot('weekly', 'weekly'); await shot('me', 'me');
    const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    for (const h of ['home', 'lib', 'path', 'war', 'guide-station-one-playbook', 'me']) { await m.goto(BASE + 'index.html#' + h); await m.waitForTimeout(300); const w = await m.evaluate(() => document.documentElement.scrollWidth); console.log('mobile', h, 'scrollWidth', w); }
    await shot('home', 'mobile-home', m); await shot('lib', 'mobile-lib', m);
  }
  await b.close();
})();
