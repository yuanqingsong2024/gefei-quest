#!/usr/bin/env node
/* 截 #path / #work / #war-rank 视口顶部，转成 assets/start/*.webp（宽 640，约 quality 70，≤80KB）。
 * 用法：PW=... node tools/shoot-start.js [baseUrl] */
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const BASE = process.argv[2] || 'http://localhost:8765/';
const OUT = path.join(__dirname, '..', 'assets', 'start');
const PY = `
import os, sys
from PIL import Image
src, dest = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
w = 640
h = max(1, round(im.height * w / im.width))
im = im.resize((w, h), Image.Resampling.LANCZOS)
q = 70
im.save(dest, 'WEBP', quality=q, method=6)
while os.path.getsize(dest) > 80 * 1024 and q > 40:
    q -= 5
    im.save(dest, 'WEBP', quality=q, method=6)
print(dest, im.size[0], im.size[1], os.path.getsize(dest), 'q'+str(q))
if os.path.getsize(dest) > 80 * 1024:
    raise SystemExit('still over 80KB')
`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(BASE + 'index.html#home', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#panel-home');
  const wd = await p.evaluate(() => navigator.webdriver);
  console.log('navigator.webdriver', wd);
  await p.evaluate(() => {
    const base = {
      version: 1, xp: 0, done: [], unlocked: ['ch-prologue'], cleared: [], streak: 0,
      lastCheckIn: null, achievements: [], achievementDates: {}, weeklyClaimed: [],
      settings: { muted: true, energyEnabled: false, reduceMotion: false },
      energy: { date: null, left: 5 }, notes: {},
      kit: { keyword: '', intro: '', domain: '', email: '', checks: {}, template: 'basic', templateDone: false },
      keywords: { items: [], s2Target: '', sort: 'score', filter: 'all' },
      sites: { items: [] }, activity: {}, doneDates: {}, lastSeenChangelog: 0,
      rankFav: [], rankPlan: [], lastBackupAt: null, backupSnoozeUntil: null,
      onboarding: { tourDone: false, tourSeenAt: null, days: {} },
    };
    let s = null;
    try { s = JSON.parse(localStorage.getItem('gefei-quest-save-v1') || 'null'); } catch (e) { s = null; }
    if (!s || typeof s !== 'object') s = base;
    s.sites = { items: [{ id: 'demo-start', name: 'PDF Merge Mac', domain: 'pdfmerge.example', kw: 'pdf merge', station: '站一', launch: '2026-10-01', status: '已上线', host: 'GitHub Pages', money: '', logs: [{ month: '2026-10', imp: 120, clicks: 8, usd: 0 }] }] };
    s.kit = Object.assign({}, s.kit || {}, { keyword: 'pdf merge', intro: 'Merge PDF files on your Mac for free.' });
    s.onboarding = { tourDone: true, tourSeenAt: '2026-10-17T00:00:00.000Z', days: {} };
    localStorage.setItem('gefei-quest-save-v1', JSON.stringify(s));
  });
  const shots = [
    ['path', 'learn', '#path-body'],
    ['work', 'do', '.wk-card'],
    ['war-rank', 'earn', '.rank-card'],
  ];
  for (const [hash, name, sel] of shots) {
    await p.goto(BASE + 'index.html#' + hash, { waitUntil: 'domcontentloaded' });
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForSelector(sel, { timeout: 8000 });
    await p.waitForTimeout(250);
    const png = '/tmp/start-' + name + '.png';
    await p.screenshot({ path: png, fullPage: false });
    execFileSync('python3', ['-c', PY, png, path.join(OUT, name + '.webp')], { stdio: 'inherit' });
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
