#!/usr/bin/env node
// Usage: node tools/publish-rank.js <rank.json> [--no-changelog] [--check-urls] [--validate-only]
// Writes data/rank.json, data/rank-history/<date>.json + index.json, js/rank-data.js,
// adds/replaces a 「赚钱榜」 changelog entry for that date, and rebuilds daily.json.
// --validate-only checks and exits without writing. A file whose every name starts
// with 【示例】 (data/rank-sample.json) is validated only and is not published.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const QS = require('../js/sources.js');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2), file = args.find(a => !a.startsWith('--'));
if (!file) { console.error('usage: node tools/publish-rank.js <rank.json> [--no-changelog] [--check-urls] [--validate-only]'); process.exit(2); }
const data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const KINDS = { official: 1, media: 1, community: 1 };
function todayShanghai() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}
function isValidYmd(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const p = s.split('-'), y = +p[0], m = +p[1], d = +p[2];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
function isExampleSet(items) {
  return Array.isArray(items) && items.length > 0 && items.every(it => it && typeof it.name === 'string' && it.name.startsWith('【示例】'));
}
function ranksAre1ToN(items) {
  const got = items.map(i => i.rank).slice().sort((a, b) => a - b);
  for (let i = 0; i < got.length; i++) if (got[i] !== i + 1) return false;
  return true;
}
const today = todayShanghai();
const errs = [];
const exampleSet = isExampleSet(data.items);
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '')) errs.push('date must be YYYY-MM-DD');
if (!Array.isArray(data.items) || (!exampleSet && data.items.length !== 10)) errs.push('items must have exactly 10 entries');
const BAN = /盗版|破解|账号(合租|买卖|出售)|游戏币|点卡|代写|刷量|刷单|代考/;
(data.items || []).forEach((it, i) => {
  const at = 'items[' + i + ']';
  ['name', 'type', 'cost', 'fit', 'why', 'risk'].forEach(k => { if (typeof it[k] !== 'string' || !it[k].trim()) errs.push(at + '.' + k + ' required string'); });
  const rankMax = exampleSet ? (data.items || []).length : 10;
  if (!Number.isInteger(it.rank) || it.rank < 1 || it.rank > rankMax) errs.push(at + '.rank must be 1–' + rankMax);
  if (it.resell !== undefined) {
    const rs = it.resell;
    if (!rs || typeof rs !== 'object' || Array.isArray(rs)) errs.push(at + '.resell must be an object { product, buyers, expires }');
    else {
      if (typeof rs.product !== 'string' || !rs.product.trim()) errs.push(at + '.resell.product must be a non-empty string');
      if (typeof rs.buyers !== 'string' || !rs.buyers.trim()) errs.push(at + '.resell.buyers must be a non-empty string');
      if (rs.expires !== '' && !isValidYmd(rs.expires)) errs.push(at + ".resell.expires must be '' or a valid YYYY-MM-DD date");
    }
  }
  if (!Number.isInteger(it.difficulty) || it.difficulty < 1 || it.difficulty > 5) errs.push(at + '.difficulty must be 1–5');
  if (!Array.isArray(it.steps) || !it.steps.length) errs.push(at + '.steps must be a non-empty array');
  if (!Array.isArray(it.tags)) errs.push(at + '.tags must be an array');
  const hasSources = Array.isArray(it.sources) && it.sources.length > 0;
  const hasLegacy = typeof it.source_url === 'string' && it.source_url.trim();
  if (hasSources) {
    if (!hasLegacy) it.source_url = it.sources[0] && it.sources[0].url;
  } else if (hasLegacy) {
    console.warn('WARN ' + at + ' has no sources[]; auto-converted from source_url. Agent: add sources next time.');
    it.sources = [QS.fromLegacy(it.source_url, today)];
  } else {
    errs.push(at + ' has no source (need sources[] with at least 1 http(s) url, or legacy source_url)');
    return;
  }
  (it.sources || []).forEach((s, j) => {
    const sat = at + '.sources[' + j + ']';
    if (!s || typeof s !== 'object') { errs.push(sat + ' must be an object'); return; }
    if (!QS.isHttpUrl(s.url)) errs.push(sat + '.url must be http(s)');
    if (s.kind == null || s.kind === '') s.kind = QS.kindOf(s.url);
    if (!KINDS[s.kind]) errs.push(sat + '.kind must be official|media|community');
    if (s.title == null) s.title = '';
    if (!s.publisher) s.publisher = QS.hostOf(s.url);
    if (s.published == null) s.published = '';
    s.checked = today;
  });
  if (it.sources && it.sources[0] && it.sources[0].url) it.source_url = it.sources[0].url;
  if (typeof it.source_url !== 'string' || !QS.isHttpUrl(it.source_url)) errs.push(at + '.source_url must be http(s)');
  if (BAN.test(JSON.stringify(it))) errs.push(at + ' contains a forbidden category (piracy/account trading/game coins/ghostwriting/fake traffic)');
});
const rankItems = Array.isArray(data.items) ? data.items : [];
if (rankItems.length && !ranksAre1ToN(rankItems)) errs.push('ranks must be 1..' + (exampleSet ? rankItems.length : 10) + ' each once');
if (errs.length) { console.error('INVALID rank file:\n- ' + errs.join('\n- ')); process.exit(1); }
data.items.sort((a, b) => a.rank - b.rank);
if (args.includes('--validate-only')) { console.log('valid rank ' + data.date + ' (' + data.items.length + ' items)'); process.exit(0); }

if (args.includes('--check-urls')) {
  const urls = [];
  for (const it of data.items) {
    (it.sources || []).forEach(s => { if (s && s.url && urls.indexOf(s.url) < 0) urls.push(s.url); });
    if (it.source_url && urls.indexOf(it.source_url) < 0) urls.push(it.source_url);
  }
  for (const u of urls) {
    let code = '000';
    try { code = cp.execFileSync('curl', ['-s', '-o', '/dev/null', '-L', '-A', 'Mozilla/5.0', '-w', '%{http_code}', '--max-time', '15', u]).toString(); } catch (_) {}
    console.log(code + ' ' + u);
    if (code !== '200') { console.error('source url not 200: ' + u); process.exit(1); }
  }
}

if (exampleSet) { console.log('valid example rank ' + data.date + ' (' + data.items.length + ' items, not published)'); process.exit(0); }

const dataDir = path.join(root, 'data'), hist = path.join(dataDir, 'rank-history');
fs.mkdirSync(hist, { recursive: true });
const out = { date: data.date, publishedAt: new Date().toISOString(), items: data.items };
fs.writeFileSync(path.join(dataDir, 'rank.json'), JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(path.join(hist, data.date + '.json'), JSON.stringify(out, null, 2) + '\n');
const dates = fs.readdirSync(hist).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).map(f => f.slice(0, 10)).sort().reverse();
fs.writeFileSync(path.join(hist, 'index.json'), JSON.stringify({ dates }, null, 2) + '\n');
// embedded copy (latest 14 days) so file:// works
const embed = {}; dates.slice(0, 14).forEach(d => { embed[d] = JSON.parse(fs.readFileSync(path.join(hist, d + '.json'), 'utf8')); });
fs.writeFileSync(path.join(root, 'js/rank-data.js'), '/* AUTO-GENERATED by tools/publish-rank.js — do not edit */\nwindow.QUEST_RANK = ' + JSON.stringify({ latest: data.date, dates, days: embed }) + ';\n');

if (!args.includes('--no-changelog')) {
  const clPath = path.join(root, 'js/changelog.js');
  let src = fs.readFileSync(clPath, 'utf8');
  const vm = require('vm'), ctx = { window: {} }; vm.runInNewContext(src, ctx);
  const log = ctx.window.QUEST_CHANGELOG || [];
  const title = '每日赚钱榜 · ' + data.date;
  const lineRe = new RegExp("^    \\{ id: \\d+, date: '" + data.date + "', title: '每日赚钱榜 · " + data.date + "'.*\\n", 'm');
  const existing = log.find(e => e.title === title);
  const id = existing ? existing.id : log.reduce((m, e) => Math.max(m, e.id), 0) + 1;
  const items = data.items.slice(0, 3).map(i => 'No.' + i.rank + ' ' + i.name);
  const line = '    { id: ' + id + ", date: '" + data.date + "', title: " + JSON.stringify(title).replace(/^"|"$/g, "'") + ", tag: '赚钱榜', href: '#war-rank', items: " + JSON.stringify(items) + ' },\n';
  if (existing && lineRe.test(src)) src = src.replace(lineRe, line);
  else src = src.replace('global.QUEST_CHANGELOG = [\n', 'global.QUEST_CHANGELOG = [\n' + line);
  fs.writeFileSync(clPath, src);
}
cp.execFileSync(process.execPath, [path.join(root, 'tools/build-daily.js')], { stdio: 'inherit' });
console.log('published rank ' + data.date + ' (' + dates.length + ' day(s) in history)');
