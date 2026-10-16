// Fake AI server for tests: node tools/fake-openai.js [port]
// OpenAI: POST /v1/chat/completions (Bearer good; model "missing" -> 404), GET /v1/models
// Anthropic: POST /v1/messages (x-api-key good + anthropic-version), SSE content_block_delta
// Ollama: POST /api/chat (NDJSON stream), GET /api/tags — no key needed
const http = require('http');
const REPLY = (user) => '## 搜索意图\n这是**测试回复**，主题：' + user.slice(0, 20) + '\n\n- 第一步\n- 第二步\n\n<script>alert(1)</script> [坏链接](javascript:alert(1))\n\n不保证收益。';
function start(port) {
  const srv = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      const j = body ? JSON.parse(body) : null;
      srv.last = { url: req.url, method: req.method, headers: req.headers, body: j };
      (srv.log = srv.log || []).push(srv.last);
      const send = (code, obj, type) => { res.writeHead(code, { 'Content-Type': type || 'application/json' }); res.end(typeof obj === 'string' ? obj : JSON.stringify(obj)); };
      const stream = (frames, type, gap) => { res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' }); let i = 0; const t = setInterval(() => { if (i < frames.length) res.write(frames[i++]); else { res.end(); clearInterval(t); } }, gap || 15); };
      const chunks = (txt) => txt.match(/[\s\S]{1,12}/g);
      if (req.method === 'GET' && req.url === '/v1/models') {
        if (req.headers.authorization !== 'Bearer good' && req.headers['x-api-key'] !== 'good') return send(401, { error: { message: 'bad key' } });
        return send(200, { data: [{ id: 'fake-model' }, { id: 'fake-large' }, { id: 'fake-mini' }] });
      }
      if (req.method === 'GET' && req.url === '/api/tags') return send(200, { models: [{ name: 'qwen2.5:7b' }, { name: 'llama3.2:3b' }] });
      if (req.url === '/v1/chat/completions') {
        if (req.headers.authorization !== 'Bearer good') return send(401, { error: { message: 'Incorrect API key provided' } });
        if (j.model === 'missing') return send(404, { error: { message: 'The model does not exist' } });
        const user = j.messages[j.messages.length - 1].content;
        if (!j.stream) return send(200, { choices: [{ message: { role: 'assistant', content: '成功' } }] });
        return stream(chunks(REPLY(user)).map(c => 'data: ' + JSON.stringify({ choices: [{ delta: { content: c } }] }) + '\n\n').concat(['data: [DONE]\n\n']), 'text/event-stream');
      }
      if (req.url === '/v1/messages') {
        if (req.headers['x-api-key'] !== 'good' || !req.headers['anthropic-version']) return send(401, { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } });
        if (!j.max_tokens || !j.system) return send(400, { type: 'error', error: { message: 'max_tokens and system required (test)' } });
        const user = j.messages[j.messages.length - 1].content;
        if (!j.stream) return send(200, { type: 'message', content: [{ type: 'text', text: '成功' }] });
        const ev = (e, d) => 'event: ' + e + '\ndata: ' + JSON.stringify(d) + '\n\n';
        return stream([ev('message_start', { type: 'message_start' })].concat(chunks(REPLY(user)).map(c => ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: c } })), [ev('message_stop', { type: 'message_stop' })]), 'text/event-stream');
      }
      if (req.url === '/api/chat') {
        const user = j.messages[j.messages.length - 1].content;
        if (!j.stream) return send(200, { message: { role: 'assistant', content: '成功' }, done: true });
        return stream(chunks(REPLY(user)).map(c => JSON.stringify({ message: { role: 'assistant', content: c }, done: false }) + '\n').concat([JSON.stringify({ done: true }) + '\n']), 'application/x-ndjson');
      }
      send(404, { error: { message: 'Not found' } });
    });
  });
  srv.listen(port); return srv;
}
if (require.main === module) { start(+process.argv[2] || 8766); console.log('fake ai server on', +process.argv[2] || 8766); }
module.exports = { start };
