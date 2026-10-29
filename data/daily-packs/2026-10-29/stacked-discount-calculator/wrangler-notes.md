# Stacked Discount Calculator｜Cloudflare Pages 上线笔记（今日主推）

日期：2026-10-28  
纯静态单页，无构建、无跟踪脚本。本目录至少含 `index.html`（可选 `_redirects`）。  
**今天主推 Cloudflare Pages Direct Upload**（控制台拖拽或 `wrangler pages deploy`）。不必买域名。

官方文档：https://developers.cloudflare.com/pages/get-started/direct-upload/

---

## 路径 A：控制台拖拽（最快，约 5–8 分钟）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → 左侧 **Workers & Pages** → **Create** → **Pages** → 选 **Upload assets**（Direct Upload）。
2. 项目名填 `stacked-discount-calculator`（或自定可读名）。
3. 把本文件夹整夹拖进上传区，或只选含 `index.html` 的目录；确认根目录能直接打开 `index.html`。
4. 点 Deploy。完成后打开 `https://项目名.pages.dev`（或控制台给出的预览 URL）。
5. 无痕窗口自测：计算器可算、How / About / Privacy 锚点正常、页面源码无第三方跟踪脚本。

---

## 路径 B：本机 Wrangler 命令行

1. 本机已装 Node 时，在含本文件夹的上级目录执行：  
   `npx wrangler login`（首次）  
   `npx wrangler pages deploy ./stacked-discount-calculator --project-name=stacked-discount-calculator`
2. 按提示完成部署；记下输出的 `*.pages.dev` URL。
3. 无痕自测同上。
4. 以后改 `index.html` 后，再跑同一条 `pages deploy` 即可覆盖发布。

> 若尚未装 Node，优先用路径 A 拖拽，今天不必为部署去折腾环境。

---

## 部署后：Search Console（能做多少做多少）

1. 打开 [Google Search Console](https://search.google.com/search-console)。
2. 添加资源 → **网址前缀** → 填最终 URL（如 `https://stacked-discount-calculator.pages.dev/`）。
3. 验证：常用「HTML 文件」——把验证文件放到与 `index.html` 同目录后再 Deploy 一次；或按控制台提示用 DNS/meta。
4. 验证通过后，网址检查 → 请求编入索引。
5. **今天不买域名、不接广告/联盟。**

---

## Canonical 说明

- 当前 `index.html` 的 `<link rel="canonical">` 仍指向用户 GH Pages 路径：  
  `https://yuanqingsong2024.github.io/stacked-discount-calculator/`
- **CF Pages 正式上线后**：把 canonical 改成实际 `*.pages.dev` 或自定义域名，并与 Search Console 属性一致。
- 若你最终选定 GH Pages 作为正式地址，可保持现状，不必重复挂广告脚本。

---

## （可选）自定义域名——以后再说

有稳定访问且你主动想绑域名时：Pages 项目 → **Custom domains** → 按提示改 DNS。同步改 canonical。今天跳过。

若以后要 Git 自动部署：在 Pages 里接同一 GitHub 仓库，构建命令留空、输出目录 `/`。

---

## 合规提醒

- 保持纯静态、无外链跟踪（当前已满足）。
- 不承诺流量/广告/联盟收益；站稳后再评估变现。
- 赶黑五（约 11/27）前优先：可访问 HTTPS + 尽量可索引 + PH/Trends 选词表有手填记录。

备选托管见同目录精简版 `netlify-notes.md`（Netlify 拖拽）；GitHub Pages 亦可，三选一即可，不必重复部署。
