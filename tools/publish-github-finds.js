#!/usr/bin/env node
// Usage: node tools/publish-github-finds.js <file.json>
// Validates schema, writes data/github-finds/YYYY-MM-DD.json + latest.json,
// and syncs js/github-finds-data.js embedded fallback.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const file = process.argv[2];
if (!file) {
  console.error('usage: node tools/publish-github-finds.js <file.json>');
  process.exit(2);
}
const raw = fs.readFileSync(file, 'utf8');
const data = JSON.parse(raw);
const errs = [];
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '')) errs.push('date must be YYYY-MM-DD');
if (!data.updated) errs.push('updated required (ISO8601+08:00 preferred)');
if (data.weekday !== 'weekday' && data.weekday !== 'weekend') errs.push('weekday must be weekday|weekend');
if (!Array.isArray(data.items) || !data.items.length) errs.push('items must be non-empty array');
const ids = new Set();
(data.items || []).forEach(function (it, i) {
  const p = 'items[' + i + ']';
  if (!it || typeof it !== 'object') { errs.push(p + ' invalid'); return; }
  if (!it.id || typeof it.id !== 'string') errs.push(p + '.id required');
  if (it.id && ids.has(it.id)) errs.push(p + '.id duplicate: ' + it.id);
  if (it.id) ids.add(it.id);
  if (typeof it.rank !== 'number') errs.push(p + '.rank number required');
  ['name', 'summary', 'why', 'url'].forEach(function (k) {
    if (!it[k] || typeof it[k] !== 'string') errs.push(p + '.' + k + ' required string');
  });
  if (it.category !== '项目' && it.category !== '生活') errs.push(p + '.category must be 项目|生活');
  if (it.url && !/^https?:\/\//i.test(it.url)) errs.push(p + '.url must be http(s)');
  if (it.stars != null && typeof it.stars !== 'number') errs.push(p + '.stars must be number');
  if (it.tags && !Array.isArray(it.tags)) errs.push(p + '.tags must be array');
  if (it.steps && !Array.isArray(it.steps)) errs.push(p + '.steps must be array');
  if (it.sources) {
    if (!Array.isArray(it.sources)) errs.push(p + '.sources must be array');
    else it.sources.forEach(function (s, j) {
      if (!s || !s.url || !/^https?:\/\//i.test(s.url)) errs.push(p + '.sources[' + j + '].url invalid');
    });
  }
});
if (errs.length) {
  console.error('invalid github-finds:\n- ' + errs.join('\n- '));
  process.exit(1);
}
const dir = path.join(root, 'data', 'github-finds');
fs.mkdirSync(dir, { recursive: true });
const out = {
  date: data.date,
  updated: data.updated,
  weekday: data.weekday,
  items: data.items,
};
if (data.sample) out.sample = true;
const pretty = JSON.stringify(out, null, 2) + '\n';
const dayPath = path.join(dir, data.date + '.json');
const latestPath = path.join(dir, 'latest.json');
fs.writeFileSync(dayPath, pretty);
fs.writeFileSync(latestPath, pretty);
const embed = '/** 工具发掘内嵌兜底（与 data/github-finds/latest.json 同步；file:// 可用） */\n' +
  '(function (g) {\n  g.QUEST_GITHUB_FINDS = ' + JSON.stringify(out) + ';\n' +
  '})(typeof window !== "undefined" ? window : globalThis);\n';
fs.writeFileSync(path.join(root, 'js', 'github-finds-data.js'), embed);
console.log('published github-finds ' + data.date + ' (' + out.items.length + ' items)');
console.log('  -> data/github-finds/' + data.date + '.json');
console.log('  -> data/github-finds/latest.json');
console.log('  -> js/github-finds-data.js');
console.log('next: git add ... && git commit -m "github-finds ' + data.date + '" && git push origin HEAD:main');
