#!/usr/bin/env node
/* 测试用假 GitHub API（端口 8767）：/user、/repos、/user/repos、contents、pages。token 必须为 github_pat_test */
const http = require('http');
function start(port = 8767) {
  const repos = {}; const st = { calls: [] };
  const srv = http.createServer((req, res) => {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, X-GitHub-Api-Version', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Content-Type': 'application/json' };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname), j = body ? JSON.parse(body) : null;
      st.calls.push({ method: req.method, path: p, body: j });
      const send = (code, obj) => { res.writeHead(code, cors); res.end(JSON.stringify(obj || {})); };
      if (req.headers.authorization !== 'Bearer github_pat_test') return send(401, { message: 'Bad credentials' });
      let m;
      if (p === '/user') return send(200, { login: 'tester' });
      if (req.method === 'POST' && p === '/user/repos') { repos['tester/' + j.name] = { files: { 'README.md': '# init' }, pages: null, branch: 'main' }; return send(201, { name: j.name, default_branch: 'main' }); }
      if ((m = p.match(/^\/repos\/([^/]+)\/([^/]+)$/))) { const r = repos[m[1] + '/' + m[2]]; return r ? send(200, { default_branch: r.branch }) : send(404, { message: 'Not Found' }); }
      if ((m = p.match(/^\/repos\/([^/]+)\/([^/]+)\/contents\/(.+)$/))) {
        const r = repos[m[1] + '/' + m[2]]; if (!r) return send(404, { message: 'Not Found' });
        const f = m[3];
        if (req.method === 'GET') return r.files[f] != null ? send(200, { sha: 'sha-' + Buffer.from(r.files[f]).length, content: Buffer.from(r.files[f]).toString('base64') }) : send(404, { message: 'Not Found' });
        if (req.method === 'PUT') { if (r.files[f] != null && j.sha !== 'sha-' + Buffer.from(r.files[f]).length) return send(409, { message: 'sha mismatch' }); r.files[f] = Buffer.from(j.content, 'base64').toString(); return send(r.files[f] ? 200 : 201, { content: { path: f } }); }
      }
      if ((m = p.match(/^\/repos\/([^/]+)\/([^/]+)\/pages$/))) {
        const r = repos[m[1] + '/' + m[2]]; if (!r) return send(404, { message: 'Not Found' });
        if (req.method === 'GET') return r.pages ? send(200, { html_url: r.pages }) : send(404, { message: 'Not Found' });
        if (req.method === 'POST') { r.pages = 'https://' + m[1] + '.github.io/' + m[2] + '/'; return send(201, { html_url: r.pages }); }
      }
      send(404, { message: 'Not Found' });
    });
  });
  srv.listen(port); return { srv, repos, st, close: () => srv.close() };
}
module.exports = { start };
if (require.main === module) { start(); console.log('fake github on 8767'); }
