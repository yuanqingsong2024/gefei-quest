# 可选后端：Cloudflare Worker 代理（Phase B）

只有在你要用「B 类」平台（Cloudflare Pages、X、Pinterest 等）时才需要。GitHub 发布与 CSV 导入不需要它。

1. 注册 Cloudflare（免费档），安装 `npm i -g wrangler`，`wrangler login`。
2. 在本目录新建 `wrangler.toml`：
   ```toml
   name = "lianzhanying-proxy"
   main = "proxy.js"
   compatibility_date = "2026-10-01"
   [vars]
   ALLOWED_ORIGINS = "https://yuanqingsong2024.github.io"
   ```
3. 设置密钥（只存在 Cloudflare，不进仓库）：
   `wrangler secret put PROXY_KEY`（自己生成一串随机字符）、`wrangler secret put CF_API_TOKEN`（Cloudflare Pages 编辑权限的 API Token）。
4. `wrangler deploy`，把得到的 `https://xxx.workers.dev` 填到练站营「账号中心 → Worker 地址」。

安全：Worker 只代理白名单主机、只接受白名单来源和 PROXY_KEY；不要把 Token 写进任何文件或提交到 Git。
