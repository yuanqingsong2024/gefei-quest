# AEO Tools Checklist Starter（英文练站落地页）

面向独立站与内容团队的 **AEO tools** 单页练习模板：讲清要生成或校验哪些机器可读文件（llms.txt、schema、sitemap、AI 向 robots、可选 AI index），并对照 CLI / 在线 llms.txt generator / AEO brief 生成器 / 登录后平台。CTA 为 **Waitlist / Join the waitlist / 申请试用**。

线上预览（本仓 GitHub Pages 部署源若为 `main`，需该路径合入 `main` 后才稳定可开）：  
https://yuanqingsong2024.github.io/gefei-quest/starters/aeo-checklist/

与 GEO 词汇清单分工，不要合并成一篇重复长文：  
[starters/geo-checklist/](../geo-checklist/)

---

## 1. 用途

| 项 | 说明 |
|----|------|
| 主词 | AEO tools |
| 辅词 | llms.txt generator · answer engine optimization brief · AI index · schema for AI search · aeo.js（工具名作证据，非合作背书） |
| 形态 | 英文单页、零依赖、内联 CSS；checklist 勾选写入 `localStorage` 键 `gefei-aeo-checklist-v1` |
| 练站路径 | `starters/aeo-checklist/` |
| 路径草案 | `/aeo-tools`（**最终站未定**） |
| 非目标 | 不是 aeo.js 运行时、不是在线 brief API、不是公网审计或官方分数仪表盘 |

Brief（不要拷进站点树）：  
`/workspace/search-content/briefs/2026-11-03/aeo-toolchain-tools-landing.md`

施工计划：  
`docs/plans/2026-11-03-aeo-and-enhancer-landings.md`

---

## 2. 当模板复制

1. 复制整个 `starters/aeo-checklist/` 到你的 Pages 仓库或本仓子路径。
2. 替换 `#waitlist-form` 内说明为真实 waitlist（邮件服务 / Typeform / 自建表单）。
3. 按需改 title / meta / 页脚中的仓库链接（年份已自动写）。外链 aeo.js 与 llmstxtkit 是 2026-11-03 的研究引用，改版后请自行复核。
4. 部署：GitHub Pages 或 Cloudflare Pages（构建命令留空）。详见 [station-one/README.md](../station-one/README.md) §2–3。

---

## 3. Waitlist CTA（必读）

产品侧结论与 [GEO checklist starter](../geo-checklist/README.md) 相同：

- 站点审计、Citability / GEO 评分、Schema 生成与校验均为 **登录后的产品内能力**。
- **没有**可挂公网的独立审计 / 评分落地页。
- **不要**把公网域名 `autograph.ai` 链成「试用入口」（该域名属另一款产品）。
- **不要**做假的公网 `/audit` 链接。
- 本页 CTA 文案统一为 **Waitlist / Join the waitlist / 申请试用**。

本 starter 的按钮只锚到页内 `#waitlist` / `#waitlist-form`，不外链假审计。

---

## 4. 诚实声明

- 不保证流量、排名、AI 引用或任何收益。
- 不编造「官方 AEO / GEO 分数 / citation rate」。aeo.js 页面上的 “GEO Readiness Score” 是对方产品演示，不是行业官方分。
- 不提供灰帽、伪装或仅对爬虫可见的内容建议。爬虫命中 ≠ 用户访问。
- 价格与套餐限额一律待核，以厂商官网为准。本页不与 aeo.js、llmstxtkit 官方合作。
- 路径名 `aeo-checklist` 为练站草案；生产域名仍可能未定。

配合：[gefei-quest 主站](../../index.html) · [GEO checklist](../geo-checklist/)
