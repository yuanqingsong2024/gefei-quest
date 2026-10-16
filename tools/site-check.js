// Usage: node tools/site-check.js [baseUrl] [shotDir]  (needs playwright-core + Chrome)
const { chromium } = require(process.env.PW || 'playwright-core');
const BASE = process.argv[2] || 'http://localhost:8765/';
const SHOTS = process.argv[3] || '';
const ROUTES = ['home','path','path-quests','war','war-s2','war-s3','war-m','war-x','lib','lib-tools','lib-hosting','lib-monetize','lib-paths','lib-xianyu','lib-tips','lib-peers','guides','weekly','me','dev'];
const OLD = { '':'home', map:'path', quest:'path-quests', quests:'path-quests', ship:'weekly', ach:'me', settings:'me', resources:'lib', 'war-s1':'war', 'home-faq':'home-faq' };
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
  if (SHOTS) {
    const shot = async (h, name, pg = p) => { await pg.goto(BASE + 'index.html#' + h); await pg.waitForTimeout(400); await pg.screenshot({ path: `${SHOTS}/p8-${name}.png`, fullPage: false }); };
    await shot('home', 'home'); await shot('path', 'path'); await shot('war', 'war'); await shot('lib-xianyu', 'lib'); await shot('guide-station-one-playbook', 'guide'); await shot('weekly', 'weekly'); await shot('me', 'me');
    const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    for (const h of ['home', 'lib', 'path', 'war', 'guide-station-one-playbook', 'me']) { await m.goto(BASE + 'index.html#' + h); await m.waitForTimeout(300); const w = await m.evaluate(() => document.documentElement.scrollWidth); console.log('mobile', h, 'scrollWidth', w); }
    await shot('home', 'mobile-home', m); await shot('lib', 'mobile-lib', m);
  }
  await b.close();
})();
