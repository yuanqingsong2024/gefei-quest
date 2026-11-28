# Render Static Site 部署备忘（榜单 2026-11-04 No.3）

> 只在**还没有任何可访问静态地址**时做；已有 CF Pages / Netlify / Vercel / GitHub Pages 任一可打开地址，就不必再部署 Render，今天只做无痕复核。

## 方式（约 8–10 分钟）
1. 在 GitHub 新建公开仓库（如 `stacked-discount-calculator`），上传本文件夹里的 `index.html`（`_redirects` 可选）。
2. 打开 https://dashboard.render.com → New → **Static Site** → 连接该仓库。
3. Build Command 留空；Publish Directory 填 `.`；Create。
4. 部署完成后得到 `xxx.onrender.com` 地址，无痕窗口打开确认计算器能算。
5. 记下地址，回复给我；之后再决定是否绑自定义域名（Render 官方文档称静态站免费、含免费 TLS 与自定义域名，以官网为准）。

## 注意
- 页面里 canonical 目前指向 GitHub Pages 地址；如果你最终以 Render 为主站，告诉我，我改 canonical，避免重复页面。
- 不加任何跟踪脚本；暂不接广告/联盟，先看能否被索引。
- 不编造流量或搜索量。
