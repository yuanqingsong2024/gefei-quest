#!/usr/bin/env node
/* 测试用关键词灵感 API（端口 8769）：
 *   /datamuse/sug?s=            单词补全
 *   /datamuse/words?rel_trg=&topics=  末词触发 + 其余词作主题
 *   /datamuse/words?ml=         means-like
 *   /wiki/w/api.php?list=search 全文搜索 {query:{search:[{title,snippet}]}}
 *   /hn/api/v1/search
 * s / ml / rel_trg 为 fail 时 Datamuse 返回 500。Wikipedia 摘要里夹 HTML，交给页面去掉。 */
const http = require('http');
function start(port = 8769) {
  const srv = http.createServer((req, res) => {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Accept', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
    const u = new URL(req.url, 'http://127.0.0.1');
    const p = decodeURIComponent(u.pathname);
    const send = (code, obj) => { res.writeHead(code, cors); res.end(JSON.stringify(obj)); };
    const dmFail = ['s', 'ml', 'rel_trg'].some((k) => String(u.searchParams.get(k) || '').trim().toLowerCase() === 'fail');
    if (p === '/datamuse/sug' || p === '/datamuse/words') {
      if (dmFail) return send(500, { error: 'fail' });
      if (p === '/datamuse/sug') {
        const q = u.searchParams.get('s') || 'seed';
        const words = [q + ' tool', q + ' online', q + ' free', q + ' app'];
        return send(200, words.map((word, i) => ({ word, score: 1000 - i * 10 })));
      }
      const rel = u.searchParams.get('rel_trg');
      if (rel) {
        const topic = String(u.searchParams.get('topics') || '').split(/\s+/).filter(Boolean)[0] || '';
        return send(200, [
          { word: 'files', score: 980 },
          { word: 'the', score: 970 },
          { word: rel, score: 960 },
          { word: 'documents', score: 900 },
          { word: 'online', score: 860 },
          { word: '.', score: 850 },
          { word: 'and', score: 840 },
          { word: topic || 'topicword', score: 830 },
          { word: 'free', score: 700 },
        ]);
      }
      const ml = u.searchParams.get('ml') || '';
      const first = ml.split(/\s+/).filter(Boolean)[0] || 'seed';
      return send(200, [
        { word: 'converter', score: 940 },
        { word: 'a', score: 930 },
        { word: 'software', score: 820 },
        { word: 'for', score: 810 },
        { word: 'with', score: 500 },
        { word: first, score: 400 },
        { word: 'tool', score: 300 },
      ]);
    }
    if (p === '/wiki/w/api.php') {
      const sr = u.searchParams.get('srsearch') || u.searchParams.get('search') || '';
      const items = sr.toLowerCase() === 'pdf merge'
        ? [
          { title: 'PDF Split and Merge', snippet: 'Free <span class="searchmatch">PDF</span> utility to split and merge files.' },
          { title: 'PDF', snippet: 'Portable Document Format &amp; related tools.' },
        ]
        : [
          { title: sr + ' software', snippet: 'Notes on <span class="searchmatch">' + sr + '</span>.' },
          { title: sr + ' file format', snippet: 'Format &amp; tools' },
        ];
      return send(200, { query: { search: items } });
    }
    if (p === '/hn/api/v1/search') {
      const q = u.searchParams.get('query') || '';
      const second = String(q).toLowerCase() === 'fail'
        ? 'Ask HN: <b>' + q + '</b> alternatives'
        : 'Ask HN: ' + q + ' & alternatives';
      return send(200, { hits: [
        { title: 'Show HN: ' + q, objectID: '180001', points: 128 },
        { title: second, objectID: '180002', points: 46 },
      ] });
    }
    send(404, { message: 'Not Found' });
  });
  let readyResolve;
  const ready = new Promise((r) => { readyResolve = r; });
  srv.on('error', (err) => { readyResolve(err); });
  srv.listen(port, '127.0.0.1', () => readyResolve());
  return { srv, ready, close: () => new Promise((res) => srv.close(() => res())) };
}
module.exports = { start };
if (require.main === module) { start().ready.then(() => console.log('fake ideas on 8769')); }
