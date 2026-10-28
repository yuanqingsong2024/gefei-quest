# Stacked Discount Calculator｜Netlify 备选笔记（精简）

**今日主推是 Cloudflare Pages**（见 `wrangler-notes.md`）。仅当你已有 Netlify 账号、或 CF 暂时不便时，用本备选。三选一上线即可，不必重复部署。今天不买域名。

---

## 拖拽（约 5 分钟）

1. 打开 [Netlify Drop](https://app.netlify.com/drop)，免费登录。
2. 把本文件夹 `stacked-discount-calculator/` 整夹拖进上传区。
3. 得到 `*.netlify.app` 后无痕自测计算器与 How/About/Privacy。
4. （可选）站点设置里改可读站名。
5. 用最终 URL 做 Google Search Console 网址前缀验证与请求索引。

---

## Git 自动部署（可选）

GitHub 公开仓根目录放 `index.html` → Netlify Import → Build 留空、Publish `/` → Deploy。

---

## 注意

- 免费档 `*.netlify.app` 足够验证；今天不升级付费、不接广告脚本。
- 若改用 Netlify 作正式 URL，同步改 `index.html` 的 canonical，并与 Search Console 一致。
- 成功标准：任一方式有可访问 HTTPS + 自测通过；不承诺收益。
