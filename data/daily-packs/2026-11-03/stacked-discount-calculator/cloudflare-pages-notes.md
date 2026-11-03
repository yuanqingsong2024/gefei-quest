# Stacked Discount Calculator｜Cloudflare Pages 上线笔记（2026-11-03）

日期：2026-11-03（周二，Asia/Shanghai）  
纯静态单页，无构建、无跟踪脚本。本目录至少含 `index.html`（可选 `_redirects`）。  
**今天目标：无痕复核已有可访问址，或按需 Direct Upload / wrangler 部署一次。**  
若已有 **Cloudflare Pages / Netlify / Vercel / GitHub Pages 任一** HTTPS 可打开地址 → **只做无痕复核即可，不必重复四家**。不必买域名、不接广告。

官方入门：https://developers.cloudflare.com/pages/get-started/  
Direct Upload：https://developers.cloudflare.com/pages/get-started/direct-upload/

---

## 路径 A：控制台 Direct Upload（最快，约 5–8 分钟）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**。
2. 项目名建议：`stacked-discount-calculator`。
3. 上传本文件夹（根目录须能直接打开 `index.html`）。
4. Deploy 后打开 `https://项目名.pages.dev`（或控制台给出的 URL）。
5. 无痕自测：计算器可算、How / FAQ / About / Privacy 锚点正常、页面源码无第三方跟踪；确认顶部有 Black Friday 2026 countdown note（距 11/27 约 **24** 天，或动态 `#bf-days-live`）。

---

## 路径 B：Wrangler 命令行

```bash
npx wrangler login   # 首次
npx wrangler pages deploy ./stacked-discount-calculator --project-name=stacked-discount-calculator
```

记下输出的 `*.pages.dev` URL；改 `index.html` 后重复同一条 `pages deploy` 即可覆盖。未装 Node 时优先路径 A。

---

## 路径 C：Git 接入（可选）

1. 把含 `index.html` 的仓库推到 GitHub/GitLab。
2. Pages → **Connect to Git** → 选仓库；构建命令留空、输出目录填 `/`（或存放 `index.html` 的目录）。
3. 保存后自动部署；以后 push 即更新。

---

## 已有静态址时（推荐今天走这条）

1. 无痕窗口打开已有 CF / Netlify / Vercel / GH Pages URL。  
2. 验算一组：原价 + 20% off + 15% off，确认「非简单相加」。  
3. 看倒计时文案是否已更新为 **From Tuesday, November 3, 2026 / about 24 days**（或 live 天数合理）。  
4. 若文案仍是旧日期：按路径 A/B 重新部署本目录覆盖即可。

---

## 部署后（能做多少做多少）

1. [Google Search Console](https://search.google.com/search-console) 添加网址前缀 → 验证 → 请求编入索引。  
2. **CF Pages 正式上线后**：把 `index.html` 的 `<link rel="canonical">` 改成实际 `*.pages.dev` 或自定义域名，并与 Search Console 一致。  
3. **今天不买域名、不接 AdSense/联盟。**

---

## 合规

- 保持纯静态、无外链跟踪。  
- 不承诺流量/广告/联盟收益；站稳后再评估变现。  
- 黑五（2026-11-27）前优先：可访问 HTTPS + 尽量可索引 + Trends 选词表有手填记录。

（三/四选一托管即可，不必重复部署。）
