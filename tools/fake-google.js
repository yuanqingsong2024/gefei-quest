// 测试用假 Google API（GSC / GA4 Admin+Data / AdSense），端口 8768；要求 Bearer ya29.test
const http = require('http');
const PORT = +process.env.PORT || 8768;
const days = (n) => Array.from({ length: n }, (_, i) => { const d = new Date(Date.now() - (n - i) * 864e5); return d.toISOString().slice(0, 10); });
http.createServer((req, res) => {
  const h = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, h); return res.end(); }
  if (req.headers.authorization !== 'Bearer ya29.test') { res.writeHead(401, h); return res.end(JSON.stringify({ error: { code: 401, message: 'Invalid Credentials', status: 'UNAUTHENTICATED' } })); }
  let body = ''; req.on('data', (c) => body += c); req.on('end', () => {
    const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname); let j = null; let b = {}; try { b = body ? JSON.parse(body) : {}; } catch (_) {}
    if (p === '/webmasters/v3/sites') j = { siteEntry: [{ siteUrl: 'sc-domain:demo.example.com', permissionLevel: 'siteOwner' }, { siteUrl: 'https://other.example.org/', permissionLevel: 'siteFullUser' }] };
    else if (/^\/webmasters\/v3\/sites\/.+\/searchAnalytics\/query$/.test(p)) {
      if ((b.dimensions || [])[0] === 'query') j = { rows: [{ keys: ['free pdf tool'], clicks: 12, impressions: 300, ctr: 0.04, position: 9.5 }, { keys: ['pdf merge online'], clicks: 3, impressions: 150, ctr: 0.02, position: 14.2 }] };
      else j = { rows: days(60).map((d, i) => ({ keys: [d], clicks: i < 30 ? 1 : 2, impressions: 40 + i, ctr: 0.03, position: 12.3 })) };
    } else if (p === '/v1beta/accountSummaries') j = { accountSummaries: [{ displayName: 'Demo 账号', propertySummaries: [{ property: 'properties/123456', displayName: 'demo 站' }] }] };
    else if (p === '/v1beta/properties/123456:runReport') j = { rows: days(10).map((d, i) => ({ dimensionValues: [{ value: d.replace(/-/g, '') }], metricValues: [{ value: String(5 + i) }, { value: String(7 + i) }, { value: String(12 + i) }] })) };
    else if (p === '/v2/accounts') j = { accounts: [{ name: 'accounts/pub-0000000000000000', displayName: 'Demo AdSense' }] };
    else if (p === '/v2/accounts/pub-0000000000000000/reports:generate') j = { headers: [{ name: 'DATE' }, { name: 'ESTIMATED_EARNINGS' }, { name: 'PAGE_VIEWS' }, { name: 'CLICKS' }, { name: 'IMPRESSIONS' }], rows: days(5).map((d) => ({ cells: [{ value: d }, { value: '0.25' }, { value: '30' }, { value: '1' }, { value: '60' }] })) };
    if (!j) { res.writeHead(404, h); return res.end(JSON.stringify({ error: { code: 404, message: 'not found ' + p } })); }
    res.writeHead(200, h); res.end(JSON.stringify(j));
  });
}).listen(PORT, () => console.log('fake-google on ' + PORT));
