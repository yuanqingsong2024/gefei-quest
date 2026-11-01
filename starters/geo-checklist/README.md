# GEO / AI SEO Checklist Starter（英文练站落地页）

面向独立博主 / 内容团队的 **GEO · AI SEO checklist** 单页练习模板：讲清 GEO vs AEO vs 经典 SEO，给可勾选清单，CTA 为 **Waitlist / Join the waitlist / 申请试用**。

线上预览（本仓 GitHub Pages 部署源若为 `main`，需该路径合入 `main` 后才稳定可开）：  
https://yuanqingsong2024.github.io/gefei-quest/starters/geo-checklist/

`develop` 上的同路径文件可用 raw/blob 查看，例如：  
`https://github.com/yuanqingsong2024/gefei-quest/blob/develop/starters/geo-checklist/index.html`

---

## 1. 用途

| 项 | 说明 |
|----|------|
| 主词 | AI SEO（兼 GEO checklist / what is GEO） |
| 形态 | 单页、零依赖、内联 CSS；checklist 勾选写入 `localStorage` |
| 练站 | 复制本目录当英文着陆页骨架，再接你自己的 waitlist 表单 |
| 非目标 | 不是已上线的公网审计产品页 |

---

## 2. 当模板复制

1. 复制整个 `starters/geo-checklist/` 到你的 Pages 仓库或本仓子路径。
2. 替换 `#waitlist-form` 内说明为真实 waitlist（邮件服务 / Typeform / 自建表单）。
3. 按需改 title / meta / About 中的仓库链接与页脚年份逻辑（年份已自动写）。
4. 部署：GitHub Pages 或 Cloudflare Pages（构建命令留空）。详见 [station-one/README.md](../station-one/README.md) §2–3。

---

## 3. Waitlist CTA（必读）

产品侧结论（autograph 开发）：

- 站点审计、Citability / GEO 评分、Schema 生成与校验均为 **登录后的产品内能力**。
- **没有**可挂公网的独立审计 / 评分落地页。
- **不要**把公网域名 `autograph.ai` 链成「试用入口」（该域名属另一款产品）。
- 本页 CTA 文案统一为 **Waitlist / Join the waitlist / 申请试用**；**禁止**写可点开的公开审计或评分 URL。

本 starter 的按钮只锚到页内 `#waitlist` / `#waitlist-form`，不外链假审计。

---

## 4. 诚实声明

- 不保证流量、排名、AI 引用或任何收益。
- 不编造「官方 GEO 分数 / citation rate」。
- 不提供灰帽、伪装或仅对爬虫可见的内容建议。
- 路径名 `geo-checklist` 为练站草案；生产站点与内链仍可能未定。

配合：[gefei-quest 主站](../../index.html) · [站二 Starter](../station-two/)（同类单页风格参考）
