# Stacked Discount Calculator｜Netlify 部署笔记（2026-11-02）

**今天部署路径以 Netlify 为主**（对应榜单 No.3）。若你已有 Cloudflare Pages / Vercel / 其他静态址且可打开 → **无痕复核即可，不必重复部署三家**。今天不买域名、不接广告脚本。不承诺流量或收益。

时区参考：Asia/Shanghai；Black Friday 2026-11-27 距 11/02 约 **25 天**。

---

## 方式 A：拖拽上传（约 5–8 分钟，推荐）

1. 打开 [Netlify Drop](https://app.netlify.com/drop)，免费登录。
2. 把本文件夹 `stacked-discount-calculator/`（至少含 `index.html`；可含 `_redirects`）整夹拖进上传区。
3. 得到 `*.netlify.app` 后，用无痕窗口自测：计算器、FAQ、About、Privacy；确认倒计时约 25 天或动态天数显示正常。
4. （可选）站点设置里改可读站名；若此 URL 将作正式入口，同步改 `index.html` 的 `canonical`。
5. （可选）用最终 URL 做 Google Search Console 网址前缀验证与请求索引。

---

## 方式 B：Netlify CLI（可选）

```bash
# 需已安装 Node；在含 index.html 的本目录执行
npx netlify-cli login
npx netlify-cli deploy --dir=. --prod
```

按提示选择或新建站点；部署后同样无痕自测。具体命令以 [Netlify 官方 Get started](https://docs.netlify.com/get-started/) 为准。

---

## 方式 C：Git 自动部署（可选）

GitHub 公开仓根目录（或指定子目录）放 `index.html` → Netlify Import from Git → Build 命令留空、Publish directory 指向含本页的目录 → Deploy。

---

## 注意

- 免费档 `*.netlify.app` 足够验证搜索与回访；今天不升级付费、不加跟踪脚本。
- 成功标准：有可访问 HTTPS + 自测通过；**不承诺** AdSense/联盟收入。
- 页面保持 About / Privacy / FAQ；无第三方分析。
