# Phase 16 · 实操工作台（连接你自己的账号）

目标：把练站营从「教程 + 手动台账」升级为**实操工作台**——官方 API 允许直接发布的就直接发布；不允许的就拉取/导入数据并分析。
原则：只用官方 API 与官方导出文件；不爬虫、不模拟登录、不做违反平台条款的自动化；不承诺收益。

## 1. 可行性矩阵（2026-10-17 调研）

分类：**A** 浏览器直接发布 · **B** 经用户自己部署的小后端（Cloudflare Worker 免费档）持有 OAuth 密钥后发布 · **C** 只能通过 API 拉数据 · **D** 只能手动 / CSV 导入 + 分析。

| 平台 | 官方发布 API | 读取/分析 API | 鉴权 | 浏览器 CORS | 需要后端 | 成本/审批 | 条款要点 | 分类 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GitHub / GitHub Pages | 有：Contents API 写文件、Pages API 开启站点 | 有（仓库、Pages 构建状态） | Fine-grained PAT（Contents + Pages + Administration 读写，限定单仓库） | **支持**（api.github.com 返回 CORS 头） | 否 | 免费；公开仓库 Pages 免费 | Token 只存本机；Pages 不得用于商业 SaaS 主业，个人站可 | **A** |
| Cloudflare Pages | 有：Pages Direct Upload API / wrangler | 有（部署列表、Web Analytics GraphQL） | API Token | **不支持**（社区确认 api.cloudflare.com 无 CORS 头） | 是（Worker 代理或本地 wrangler） | 免费档 | Token 不得暴露在前端 | **B** |
| Google Search Console | 无（只能提交 sitemap / URL 检查） | 有：Search Analytics API | OAuth 2.0（Google Cloud OAuth 客户端，scope webmasters.readonly） | 支持（Google API + GIS token client，纯前端可用，只需 Client ID） | 否（仅需用户自建 OAuth Client ID） | 免费；需 Google Cloud 项目 + 同意屏幕 | 只读自己验证过的站 | **C**（Phase C 前：D，CSV 导出） |
| Google Analytics 4 | 无 | 有：GA4 Data API | OAuth 2.0（analytics.readonly） | 支持（同上） | 否 | 免费 | 同上 | **C** |
| AdSense | 无 | 有：AdSense Management API v2（报表） | OAuth 2.0（adsense.readonly） | 支持（同上） | 否 | 免费 | 禁止任何点击/流量操纵 | **C**（Phase C 前：D，CSV 报告） |
| X | 有：POST /2/tweets | 有（按次计费） | OAuth 2.0 PKCE / OAuth 1.0a | 不可靠（不建议浏览器直连，需保密 client secret） | 是 | **按次付费**：发帖 $0.015、带链接 $0.20、读 $0.005（第三方汇总 docs.x.com，2026-09）；无免费档 | 自动化规则、禁止刷量 | **B（付费）** |
| YouTube | 有：videos.insert（需 OAuth；未审核项目上传视频为私享） | 有：YouTube Analytics API | OAuth 2.0 | 支持（Google API） | 上传大文件建议后端；分析可纯前端 | 免费配额；上传公开需 API 审核 | 未经审核的 API 项目上传默认私享 | **C**（发布 B，需审核） |
| Medium | 已停止：官方「不再发放新 integration token、不允许新集成」 | 无 | — | — | — | 不可用 | — | **D**（手动 / 官方导入网页） |
| WordPress | 有：WordPress.com REST API；自托管 REST API + 应用密码 | 有 | OAuth2（.com）/ Application Password（自托管） | 自托管需站点开启 CORS；.com 隐式授权可前端 | 视站点而定 | 免费 | 应用密码只存本机 | **A/B**（自托管可 A） |
| Pinterest | 有：POST /v5/pins | 有：Pin Analytics | OAuth 2.0（需 app secret） | 不适合（需保密 secret） | 是 | 需申请 Trial；Trial 创建的 Pin 仅自己可见，Standard 需录屏审核 | 开发者准则 | **B（需审批）** |
| 微信公众号 | 草稿/发布接口存在，但**2025-07 起个人主体与未认证账号被回收发布能力接口权限** | 数据统计接口（同样需服务端 + IP 白名单） | AppID + AppSecret（服务端 access_token） | 否（官方要求服务端调用） | 是 | 仅企业认证账号可发布 | 禁止前端直接调用 | **D**（个人号）/ B（企业认证号） |
| 小红书 | 无（开放平台未提供笔记发布 API） | 无公开个人数据 API | — | — | — | — | 禁止自动化发布与爬取 | **D**（后台导出 / 手抄） |
| 抖音 | 有：video.create / SDK 投稿，但发布能力**仅开放给企业主体（注册资本≥50 万、成立≥1 年）且限定应用类型** | 数据开放服务（需应用 + 授权） | OAuth（需 client_secret） | 否 | 是 | 企业资质 + 审核 | 每次代发须用户明确感知 | **D**（个人）/ B（企业） |
| B 站 | 有：开放平台视频/专栏稿件发布 | 有：用户授权后的稿件数据 | OAuth（需身份认证 + 应用审核） | 否 | 是 | 需开发者认证审核 | 开放平台运营规范 | **D**（未获批）/ B（获批后） |
| 头条号 | 抖音开放平台「发布视频到头条」需应用权限；个人图文无公开 API | 无公开个人 API | — | — | 是 | 企业资质 | — | **D** |
| 微博 | 开放平台有分享接口，需应用审核 | 有限 | OAuth2（需 secret） | 否 | 是 | 需应用审核 | 禁止批量营销 | **D**（个人）/ B |
| 闲鱼 | 无个人开放 API | 无 | — | — | — | — | 禁止自动化 | **D** |
| 知乎 / 百家号 / 快手 / 视频号 | 无面向个人的发布 API | 后台可导出或手抄 | — | — | — | — | 禁止自动化 | **D** |

主要来源（2026-10-17 查阅）：GitHub REST 文档 docs.github.com/rest；Cloudflare 社区「CORS blocking access to Cloudflare API」；Google APIs JS / GIS 文档；Medium Help Center「API/Importing」与 github.com/Medium/medium-api-docs；X 定价（outstand.so、postzen.dev 汇总 docs.x.com）；Pinterest developers「access tiers」；微信开发者文档「发布能力」（developers.weixin.qq.com/doc/subscription/guide/product/publish.html）；抖音开放平台「发布能力使用规范」「创建视频」；哔哩哔哩开放平台 openhome.bilibili.com/doc。

**小结**：A 类 1 个（GitHub，WordPress 自托管视情况）；B 类需后端（Cloudflare Pages、X 付费、Pinterest 审批、企业号的公众号/抖音/B 站/微博）；C 类 4 个（GSC、GA4、AdSense、YouTube Analytics）都是 Google OAuth，纯前端 + 用户自建 Client ID 即可；其余国内平台对个人都是 D：用后台导出的 CSV 导入分析。

## 2. 架构
- 仍是静态站（GitHub Pages）。
- **凭据**：Token 存浏览器 localStorage 独立键 `gefei-quest-accounts-v1`（不进存档导出、可一键忘记）；需要 secret 的平台放在用户自己部署的 Worker 的 Secrets 里。仓库里永远没有 token。
- **可选后端**：`worker/` 目录提供 Cloudflare Worker 模板（CORS 白名单代理 + OAuth 回调），用户自己 `wrangler deploy`，地址填回账号中心。
- **数据**：导入的数据存存档的追加字段 `imports`、发布记录存 `publish`（均为追加字段）；月度汇总可写入站点台账。

## 3. 分期任务
- Phase A（本次）
  - T155 可行性矩阵与架构（本文）
  - T156 账号中心 #me-accounts：平台列表、分类 A–D、状态、接入说明
  - T157 GitHub 连接器：PAT 校验、选择/新建仓库、预览（dry-run）、写入文件、开启 Pages、写入台账
  - T158 数据导入中心：GSC 效果导出、AdSense 报告、通用平台 CSV（小红书/抖音/B 站后台导出）→ 台账
  - T159 数据分析 #me-analytics：图表、汇总、AI 分析按钮
  - T160 流水线条：选词 → 实操助手 → 发布 → 台账 → 分析
  - T161 测试（假 GitHub API）、390px、截图、更新日志、推送
- Phase B（需要用户：Cloudflare 账号）
  - T162 Worker 模板部署指引 + 账号中心「后端地址」
  - T163 Cloudflare Pages Direct Upload 发布
  - T164 X / Pinterest / WordPress.com 经 Worker 发布（X 需付费额度、Pinterest 需审批）
- Phase C（需要用户：Google Cloud 项目 + OAuth Client ID，已添加授权来源）
  - T165 GSC Search Analytics 自动拉取
  - T166 GA4 Data API、AdSense Management API 拉取
  - T167 YouTube Analytics 拉取
