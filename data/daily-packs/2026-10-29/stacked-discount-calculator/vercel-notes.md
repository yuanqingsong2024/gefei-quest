# Stacked Discount Calculator｜Vercel 上线笔记（今日主推）

日期：2026-10-29  
纯静态单页，无构建、无跟踪脚本。本目录至少含 `index.html`（可含 `vercel.json`、`_redirects`、备选笔记）。  
**今天优先试 Vercel**。不必买域名。

官方：https://vercel.com/docs · 免费注册 https://vercel.com/signup

---

## 路径 A：Dashboard 导入 Git（适合已有公开仓库）

1. 免费注册 / 登录 [vercel.com](https://vercel.com/)，可用 GitHub 账号授权。
2. **Add New… → Project** → Import 含本工具的仓库（或先把 `stacked-discount-calculator/` 推到一个小仓）。
3. Framework Preset 选 **Other**；Build Command 留空；Output / Root Directory 指到含 `index.html` 的目录（本文件夹作根即可）。
4. Deploy。完成后打开控制台给出的 `https://项目名.vercel.app`。
5. 无痕窗口自测：计算器可算、How / FAQ / About / Privacy 正常、页面源码无第三方跟踪脚本。

---

## 路径 B：CLI 部署本目录（最快练手）

1. 本机已装 Node 时，进入本文件夹：
   ```bash
   cd stacked-discount-calculator
   npx vercel
   ```
   首次按提示登录、确认项目名与目录；预览部署成功后再执行：
   ```bash
   npx vercel --prod
   ```
2. 记下输出的 `*.vercel.app` URL。
3. 无痕自测同上。改 `index.html` 后重复 `npx vercel --prod` 即可覆盖。

> 若尚未装 Node，用路径 A（Git 导入）或控制台「拖拽/上传」类入口（以官网当前 UI 为准）；今天不必为部署折腾复杂环境。

---

## Direct：把整个文件夹作为根部署

- 部署根目录 = 本文件夹，**至少含 `index.html`**。
- 可选：同目录 `vercel.json`（极简静态配置，无 serverless）。
- 不要把上级大仓里的无关文件一并当根上传。

---

## 部署后：改 canonical + Search Console（简述）

1. 上线后编辑 `index.html` 的 `<link rel="canonical">`：改为实际 `https://你的项目.vercel.app/`（或自定义域），与正式入口一致；注释已提醒「Vercel 上线后改」。
2. 打开 [Google Search Console](https://search.google.com/search-console) → 添加资源 → **网址前缀** → 填最终 URL。
3. 验证：常用 HTML 文件（放到与 `index.html` 同目录后再 Deploy 一次）或 meta/DNS，按控制台提示即可。
4. 验证通过后，网址检查 → 请求编入索引。
5. **今天不买域名、不接广告/联盟。**

---

## 备选托管（三选一即可，不必重复）

| 备选 | 笔记文件 |
|------|----------|
| Cloudflare Pages | `wrangler-notes.md` |
| Netlify | `netlify-notes.md` |
| GitHub Pages | 仓库 Settings → Pages，根目录放 `index.html` |

今天优先试 **Vercel**；若已有可访问的 GH/CF/Netlify 链接，也可只自测 + 改 canonical，不必强行再挂第四套。

---

## 合规提醒

- 保持纯静态、无外链跟踪（当前已满足）。
- 不承诺流量/广告/联盟收益；站稳后再评估变现。
- 赶黑五（约 11/27）前优先：可访问 HTTPS + 尽量可索引 + Trends 表有手填记录。
