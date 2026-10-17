#!/usr/bin/env node
/* 量每个路由的页面高度（1280x800 与 390x844，空存档）。用法：PW=... node tools/page-heights.js http://localhost:8765/ out.json */
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:8765/', OUT = process.argv[3];
const ROUTES = ['home','path','path-quests','war','war-s2','war-s3','war-m','war-x','war-kit','war-keywords','war-rank','war-publish','war-share','lib','lib-tools','lib-hosting','lib-monetize','lib-paths','lib-xianyu','lib-tips','lib-peers','pm','pm-cn','pm-global','pm-cn-media','pm-cn-drama','pm-gl-video','guides','guide-station-one-playbook','guide-monetize-playbook','weekly','me','me-stats','me-sites','me-analytics','me-accounts','me-ai','changelog','dev','dev-TASKS','work','work-review'];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
  const res = {};
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    for (const r of ROUTES) { await p.goto(BASE + 'index.html#' + r); await p.reload(); await p.waitForTimeout(350); const H = await p.evaluate(() => document.documentElement.scrollHeight); (res[r] = res[r] || {})[w] = { px: H, screens: +(H / h).toFixed(2) }; }
    await p.close();
  }
  await b.close();
  const lines = Object.keys(res).map(r => r.padEnd(30) + String(res[r][1280].screens).padStart(6) + String(res[r][390].screens).padStart(7));
  console.log('route'.padEnd(30) + ' 1280  390 (screens)\n' + lines.join('\n'));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
})();
