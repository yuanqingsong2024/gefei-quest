/**
 * 出海小站练站营 · 可选后端（Phase B 模板）—— 由你自己部署到 Cloudflare Workers（免费档）。
 * 作用：给不支持浏览器跨域的官方 API（如 Cloudflare API）做白名单代理，并在 Worker Secrets 里保存需要保密的密钥。
 * 仓库里不含任何密钥。部署：见 worker/README.md
 */
const ALLOW_HOSTS = ['api.cloudflare.com']; // 只代理官方 API，按需增加
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowOrigin = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).includes(origin) ? origin : '';
    const cors = { 'Access-Control-Allow-Origin': allowOrigin, 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Proxy-Key', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!allowOrigin) return new Response('origin not allowed', { status: 403 });
    if (!env.PROXY_KEY || req.headers.get('X-Proxy-Key') !== env.PROXY_KEY) return new Response('bad proxy key', { status: 401, headers: cors });
    const url = new URL(req.url);
    const target = new URL(url.pathname.replace(/^\/proxy\//, 'https://') + url.search);
    if (!ALLOW_HOSTS.includes(target.hostname)) return new Response('host not allowed', { status: 403, headers: cors });
    const headers = new Headers(req.headers);
    headers.delete('Origin'); headers.delete('X-Proxy-Key');
    if (target.hostname === 'api.cloudflare.com' && env.CF_API_TOKEN) headers.set('Authorization', 'Bearer ' + env.CF_API_TOKEN);
    const res = await fetch(target, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body });
    const out = new Response(res.body, res);
    Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
    return out;
  },
};
