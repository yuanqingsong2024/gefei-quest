// Shared item checks for tools/publish-rank.js and tools/publish-collection.js.
// Rank mode keeps the original rules: exactly 10 items (unless every name is 【示例】),
// English kind only, checked stamped today. Collection mode allows any count ≥ 1,
// Chinese kind aliases, optional unverified, and income-figure labels.
const QS = require('../js/sources.js');

const KINDS = { official: 1, media: 1, community: 1 };
const KIND_ALIAS = {
  official: 'official', media: 'media', community: 'community',
  '官方': 'official', '媒体': 'media', '社区': 'community',
};
const BAN = /盗版|破解|账号(合租|买卖|出售)|游戏币|点卡|代写|刷量|刷单|代考/;
// Money or order counts (217 单, 3863 元, 4500–5000 元). Percents and step counts (6.6%, 20 条) do not match.
const FIGURE = /(?:\d[\d,]*(?:\.\d+)?)(?:\s*[–\-—~～至]\s*\d[\d,]*(?:\.\d+)?)?\s*(?:元|块钱|块)|(?<![.\d])\d[\d,]*\s*单/;
const INCOME_LABEL = /个人说法|自述|称/;

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
function collectionBanText(it) {
  let s;
  try { s = JSON.stringify(it); } catch (e) { return ''; }
  // 文案代写 is commercial copy in this collection. Prohibition sentences are the rules, not the offer.
  s = s.replace(/文案代写/g, '文案服务');
  s = s.replace(/(?:不要|不能|不可|严禁|禁止|别|不)[^"\\]{0,120}?(?:代写|代考|刷单|刷量|盗版|破解)/g, '');
  return s;
}
function validateSource(s, at, errs, ctx) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) { errs.push(at + ' must be an object'); return; }
  if (!QS.isHttpUrl(s.url)) errs.push(at + '.url must be http(s)');
  if (s.kind == null || s.kind === '') s.kind = QS.kindOf(s.url);
  const aliasOk = !!(ctx.allowKindAlias && KIND_ALIAS[s.kind]);
  if (!aliasOk && !KINDS[s.kind]) errs.push(at + '.kind must be official|media|community');
  if (s.title == null) s.title = '';
  if (!s.publisher) s.publisher = QS.hostOf(s.url);
  if (s.published == null) s.published = '';
  if (ctx.stampChecked !== false) s.checked = ctx.today;
  if (ctx.allowUnverified && s.unverified !== undefined && typeof s.unverified !== 'boolean') {
    errs.push(at + '.unverified must be a boolean');
  }
}
function assertIncome(it, i, errs) {
  const fields = [['why', it.why], ['fit', it.fit], ['risk', it.risk]];
  if (Array.isArray(it.steps)) it.steps.forEach((s, j) => fields.push(['steps[' + j + ']', s]));
  fields.forEach((pair) => {
    const name = pair[0], text = pair[1];
    if (typeof text !== 'string' || !FIGURE.test(text)) return;
    if (!INCOME_LABEL.test(text)) errs.push('items[' + i + '].' + name + ' has an income/order figure without 个人说法/自述/称');
  });
}
function validateItem(it, i, errs, ctx) {
  const at = 'items[' + i + ']';
  if (!it || typeof it !== 'object') { errs.push(at + ' must be an object'); return; }
  ['name', 'type', 'cost', 'fit', 'why', 'risk'].forEach(k => { if (typeof it[k] !== 'string' || !it[k].trim()) errs.push(at + '.' + k + ' required string'); });
  const rankMax = ctx.rankMax;
  if (!Number.isInteger(it.rank) || it.rank < 1 || it.rank > rankMax) errs.push(at + '.rank must be 1–' + rankMax);
  if (it.resell !== undefined) {
    const rs = it.resell;
    if (!rs || typeof rs !== 'object' || Array.isArray(rs)) errs.push(at + '.resell must be an object { product, buyers, expires }');
    else {
      if (typeof rs.product !== 'string' || !rs.product.trim()) errs.push(at + '.resell.product must be a non-empty string');
      if (typeof rs.buyers !== 'string' || !rs.buyers.trim()) errs.push(at + '.resell.buyers must be a non-empty string');
      if (ctx.resellAnyExpires) {
        if (typeof rs.expires !== 'string') errs.push(at + '.resell.expires must be a string');
      } else if (rs.expires !== '' && !isValidYmd(rs.expires)) errs.push(at + ".resell.expires must be '' or a valid YYYY-MM-DD date");
    }
  }
  if (!Number.isInteger(it.difficulty) || it.difficulty < 1 || it.difficulty > 5) errs.push(at + '.difficulty must be 1–5');
  if (!Array.isArray(it.steps) || !it.steps.length) errs.push(at + '.steps must be a non-empty array');
  if (!Array.isArray(it.tags)) errs.push(at + '.tags must be an array');
  if (ctx.incomeLabels) assertIncome(it, i, errs);
  const hasSources = Array.isArray(it.sources) && it.sources.length > 0;
  const hasLegacy = typeof it.source_url === 'string' && it.source_url.trim();
  if (hasSources) {
    if (!hasLegacy) it.source_url = it.sources[0] && it.sources[0].url;
  } else if (hasLegacy) {
    console.warn('WARN ' + at + ' has no sources[]; auto-converted from source_url. Agent: add sources next time.');
    it.sources = [QS.fromLegacy(it.source_url, ctx.today)];
  } else {
    errs.push(at + ' has no source (need sources[] with at least 1 http(s) url, or legacy source_url)');
    return;
  }
  (it.sources || []).forEach((s, j) => validateSource(s, at + '.sources[' + j + ']', errs, ctx));
  if (it.sources && it.sources[0] && it.sources[0].url) it.source_url = it.sources[0].url;
  if (typeof it.source_url !== 'string' || !QS.isHttpUrl(it.source_url)) errs.push(at + '.source_url must be http(s)');
  const banText = ctx.banText ? ctx.banText(it) : JSON.stringify(it);
  if (BAN.test(banText)) errs.push(at + ' contains a forbidden category (piracy/account trading/game coins/ghostwriting/fake traffic)');
}
function validateRule(rule, i, errs, ctx) {
  const at = 'rules[' + i + ']';
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) { errs.push(at + ' must be an object'); return; }
  if (typeof rule.text !== 'string' || !rule.text.trim()) errs.push(at + '.text required string');
  if (!Array.isArray(rule.sources) || !rule.sources.length) errs.push(at + '.sources must be a non-empty array');
  else rule.sources.forEach((s, j) => validateSource(s, at + '.sources[' + j + ']', errs, ctx));
}
function validateRank(data) {
  const errs = [];
  const today = todayShanghai();
  const exampleSet = isExampleSet(data && data.items);
  const ctx = { today: today, allowKindAlias: false, stampChecked: true, allowUnverified: false, incomeLabels: false, banText: null };
  if (!data || typeof data !== 'object') { errs.push('date must be YYYY-MM-DD'); return { ok: false, errors: errs, example: false, today: today }; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '')) errs.push('date must be YYYY-MM-DD');
  if (!Array.isArray(data.items) || (!exampleSet && data.items.length !== 10)) errs.push('items must have exactly 10 entries');
  ctx.rankMax = exampleSet ? (Array.isArray(data.items) ? data.items.length : 0) : 10;
  (data.items || []).forEach((it, i) => validateItem(it, i, errs, ctx));
  const rankItems = Array.isArray(data.items) ? data.items : [];
  if (rankItems.length && !ranksAre1ToN(rankItems)) errs.push('ranks must be 1..' + (exampleSet ? rankItems.length : 10) + ' each once');
  return { ok: errs.length === 0, errors: errs, example: exampleSet, today: today };
}
function validateCollection(data) {
  const errs = [];
  const today = todayShanghai();
  const n = data && Array.isArray(data.items) ? data.items.length : 0;
  const ctx = {
    today: today,
    allowKindAlias: true,
    stampChecked: false,
    allowUnverified: true,
    incomeLabels: true,
    resellAnyExpires: true,
    rankMax: n,
    banText: collectionBanText,
  };
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errs.push('collection must be an object');
    return { ok: false, errors: errs, today: today };
  }
  if (typeof data.title !== 'string' || !data.title.trim()) errs.push('title required string');
  if (typeof data.updated !== 'string' || !isValidYmd(data.updated)) errs.push('updated must be YYYY-MM-DD');
  if (typeof data.intro !== 'string' || !data.intro.trim()) errs.push('intro required string');
  if (!Array.isArray(data.rules) || !data.rules.length) errs.push('rules must be a non-empty array');
  else data.rules.forEach((rule, i) => validateRule(rule, i, errs, ctx));
  if (!Array.isArray(data.items) || data.items.length < 1) errs.push('items must have at least 1 entry');
  (data.items || []).forEach((it, i) => validateItem(it, i, errs, ctx));
  if (n && !ranksAre1ToN(data.items)) errs.push('ranks must be 1..' + n + ' each once');
  return { ok: errs.length === 0, errors: errs, today: today };
}

module.exports = {
  validateRank: validateRank,
  validateCollection: validateCollection,
  todayShanghai: todayShanghai,
  isValidYmd: isValidYmd,
  isExampleSet: isExampleSet,
  ranksAre1ToN: ranksAre1ToN,
  FIGURE: FIGURE,
  INCOME_LABEL: INCOME_LABEL,
};
