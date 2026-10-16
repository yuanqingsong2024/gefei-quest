// Usage: node tools/build-daily.js  → writes daily.json from js/changelog.js (for daily reminders)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'js/changelog.js'), 'utf8'), ctx);
const log = ctx.window.QUEST_CHANGELOG || [];
const BASE = 'https://yuanqingsong2024.github.io/gefei-quest/';
const out = {
  site: '出海小站练站营', url: BASE, schema: 1,
  generatedAt: new Date().toISOString(),
  latestId: log.reduce((m, e) => Math.max(m, e.id), 0),
  latestDate: log[0] ? log[0].date : null,
  links: { stats: BASE + '#me-stats', changelog: BASE + '#changelog', today: BASE + '#home-today', quests: BASE + '#path-quests' },
  entries: log.slice(0, 10).map(e => ({ id: e.id, date: e.date, tag: e.tag, title: e.title, items: e.items, url: BASE + (e.href || '#changelog') })),
};
fs.writeFileSync(path.join(root, 'daily.json'), JSON.stringify(out, null, 2) + '\n');
console.log('daily.json latestId=' + out.latestId + ' entries=' + out.entries.length);
