// Minimal fake OpenAI-compatible server for tests: node tools/fake-openai.js [port]
// Key "good" works; any other key -> 401; model "missing" -> 404; supports stream (SSE) and JSON.
const http = require('http');
function start(port) {
  const srv = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      srv.last = { url: req.url, auth: req.headers.authorization, body: body ? JSON.parse(body) : null };
      if (!/\/v1\/chat\/completions$/.test(req.url)) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"error":{"message":"Not found"}}'); }
      if (req.headers.authorization !== 'Bearer good') { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end('{"error":{"message":"Incorrect API key provided"}}'); }
      const j = srv.last.body;
      if (j.model === 'missing') { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"error":{"message":"The model does not exist"}}'); }
      const user = j.messages[j.messages.length - 1].content;
      const text = j.stream ? '## 搜索意图\n这是**测试回复**，主题：' + user.slice(0, 20) + '\n\n- 第一步\n- 第二步\n\n<script>alert(1)</script> [坏链接](javascript:alert(1))\n\n不保证收益。' : '成功';
      if (!j.stream) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: text } }] })); }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
      const parts = text.match(/[\s\S]{1,12}/g); let i = 0;
      const t = setInterval(() => {
        if (i < parts.length) res.write('data: ' + JSON.stringify({ choices: [{ delta: { content: parts[i++] } }] }) + '\n\n');
        else { res.write('data: [DONE]\n\n'); res.end(); clearInterval(t); }
      }, 15);
    });
  });
  srv.listen(port); return srv;
}
if (require.main === module) { start(+process.argv[2] || 8766); console.log('fake openai on', +process.argv[2] || 8766); }
module.exports = { start };
