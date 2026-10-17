# 出海小站练站营 · MASTER 状态

> 日期：2026-10-16（Asia/Shanghai）  
> 线上：https://yuanqingsong2024.github.io/gefei-quest/  
> 仓库：https://github.com/yuanqingsong2024/gefei-quest

---

## 结论

**开发任务清单已关闭；Phase 6 首页枢纽已交付。**

| 范围 | 任务 ID | 结果 |
|------|---------|------|
| Phase 1 MVP | T01–T45 | 全部 `[x]` |
| Phase 2 站一作战室 | T46–T60 | 14 完成 + **T58 取消** |
| Phase 3 站二作战室 | T61–T68 | 全部 `[x]` |
| Phase 4 站三+变现 | T69–T76 | 全部 `[x]` |
| Phase 5 放大 | T77–T83 | 全部 `[x]` |
| Phase 6 首页枢纽 | T84–T87 | 全部 `[x]` |
| **合计** | **T01–T87** | **开放 `- [ ]` = 0**（T58 取消不计开放） |

### 取消项

| ID | 说明 |
|----|------|
| **T58** | channels JSON 拆分试验 — `file://` 无法可靠 `fetch`；保持 `js/data.js`。已文档说明。 |
| **周更 Bot 启用** | 各 Phase 明确 **不启用**；无任务要求打开。保持暂停，直至用户明确说「恢复周一补给」。 |

手册（`docs/*-playbook.md`）里的 `- [ ]` 是给**学习者**的 Day 勾选清单，**不是**开发任务，故不计开放项。

---

## Phase 路线图扫描

| 文档 | 状态头 | 未完成功能？ |
|------|--------|--------------|
| `PHASE2-ROADMAP.md` | **已完成** | 无；站二占位已移交 Phase 3 |
| `PHASE3-ROADMAP.md` | **已完成** | 无；站三移交 Phase 4 |
| `PHASE4-ROADMAP.md` | **已完成** | 无；放大移交 Phase 5 |
| `PHASE5-ROADMAP.md` | **已完成** | 无；Out 项（Bot、厚 Starter、量产引擎）为明确非目标 |

`DESIGN-SPEC.md` §13 MVP 验收已全部勾为 `[x]`（T43 / TESTLOG）。§14「后续版本」表为产品愿景备忘（云同步等），**未列入 TASKS**，本 MASTER **不**自动开 Phase 6。

---

## 已交付能力（摘要）

- **首页枢纽**（默认 `#home`）：分类卡片 → 地图 / 作战室五站 / 任务·商船·成就 / 资源库·羊毛·闲鱼 / Starter / 手册 / MASTER·Phase·TASKS / 设置
- 轻 RPG 主线：序章 → 站一 → 站二 → 站三 → 变现港 → 放大（XP / 连击 / Boss / 成就 / 商船 / 设置）
- 作战室五站 Tab + 灰锁 + `#war` / `#war-s2` / `#war-s3` / `#war-m` / `#war-x`
- Starter：`starters/station-one/`、`starters/station-two/`
- 手册：站一～放大 + 变现；资源库整页 + 搜索 + `#tools` / `#xianyu` 深链；存档 JSON 导出/导入
- 渠道资料：免费工具 / 托管 / 变现 / 路径 / 闲鱼·非实物 / 同路人公开摘要

---

## 线上入口

- 首页：https://yuanqingsong2024.github.io/gefei-quest/#home
- 主站：https://yuanqingsong2024.github.io/gefei-quest/
- 资源库：https://yuanqingsong2024.github.io/gefei-quest/resources.html
- 闲鱼筛选：https://yuanqingsong2024.github.io/gefei-quest/resources.html#xianyu
- 本文件：https://yuanqingsong2024.github.io/gefei-quest/docs/MASTER-STATUS.md
- 任务清单：https://yuanqingsong2024.github.io/gefei-quest/TASKS.md

---

## 自测指针

见仓库根目录 `TESTLOG.md`（Phase 2–5 节均已勾 Pages built）。

---

## Phase 6 · 首页枢纽（2026-10-16）

| 项 | 说明 |
|----|------|
| 默认 Tab | `首页` / `#home` |
| 模块 | `js/home.js` + `css/ui.css` 首页卡片样式 |
| 入口 | 实战 · 资源羊毛 · 模板手册 · 进度文档 |
| 任务 | T84–T87（见 `TASKS.md`） |

## Phase 7 · 整站美化（2026-10-16）
- T88–T95 全部完成：网站式落地页首页、图标/背景/favicon/manifest/og:image、整站玻璃卡片与吸顶导航、resources.html 统一头尾。方案：`docs/PHASE7-DESIGN.md`

## Phase 8 · 信息架构重整（2026-10-16）
- T96–T105 全部完成。七个栏目（首页 / 学习路线 / 实战作战室 / 资源库 / 手册与模板 / 每周补给 / 我的进度）名称统一来自 `js/nav.js`；SVG 图标集 `js/icons.js`；文档站内渲染（`js/guides.js` + `js/guides-data.js`）；`resources.html` 改为跳转；用户界面原始 .md 链接 0。方案：`docs/PHASE8-IA.md`

## Phase 9 · 实操工具（2026-10-16）
- T106–T114 全部完成。站一实操助手 `#war-kit`、选词练习板 `#war-keywords`、我的站点台账 `#me-sites`；存档追加 `kit` / `keywords` / `sites`（旧存档兼容）。测试：site-check 路由 23 + P9 功能用例 20/20，0 坏链、0 控制台错误、390px 无横向滚动。方案：`docs/PHASE9-TOOLS.md`

## Phase 10 · 学习统计与更新日志（T115–T122 ✅）
- 学习统计 `#me-stats`、今日任务（首页）、更新日志 `#changelog`（数据 js/changelog.js，红点按 save.lastSeenChangelog）。
- 存档追加 activity / doneDates / lastSeenChangelog，记录集中在 QuestSave.saveSave。
- `daily.json`：`node tools/build-daily.js` 由 changelog 生成，供每日提醒读取。新增更新日志条目后需重新生成。

## Phase 11 · 网站质感打磨（T123–T129 ✅）
- js/icons.js 图标家族重画（线稿 + 强调面 + 6 色调渐变徽章，`badge()` / `illo()`），总览页 icons.html。
- 新 Logo assets/logo.svg → icon-512/192、apple-touch-icon、favicon-32/48、favicon.ico、maskable；manifest 更新。
- js/shell.js：顶栏收缩、回到顶部、≤640px 底部栏、全站搜索（/ · Ctrl/⌘+K）、页面淡入；文档页骨架占位；空状态插画。
- 页脚：站点地图 / 关于本站 / 最近更新 / 版本号（v1.<最新更新日志 id>）。

## Phase 12 · 每日赚钱榜（T130–T136 ✅）
- `#war-rank`（js/rank.js），数据 data/rank.json + data/rank-history/ + js/rank-data.js（内嵌，file:// 可用）。
- 存档追加 rankFav / rankPlan；「我的实操计划」显示在赚钱榜与站一实操助手页。
- 发布：`node tools/publish-rank.js file.json --check-urls` → git push（见 README）。

## Phase 13 · AI 设置与助手（T137–T142 ✅）
- `#me-ai`（js/ai.js）：Grok Bot 默认模式 / 自定义 OpenAI 兼容（7 个预设）；配置存 `gefei-quest-ai-v1`，不进存档导出。
- AI 按钮：选词练习板、每日赚钱榜、站一实操助手（SSE 流式、markdown 净化、合规 system prompt）。测试用 tools/fake-openai.js。

## Phase 14 · AI 服务商列表（T143–T148 ✅）
- gefei-quest-ai-v1 v2：providers[] + activeId（旧单配置自动迁移，旧字段保留）；格式 openai / anthropic / ollama；自定义请求头；获取模型；导入导出不含 Key；工具页切换器。

## Phase 15 · 平台变现 ✅（2026-10-17）
- 资源库新栏目 `#pm`（国内/海外两组，13 分类，50 个平台），分类页 `#pm-<分类>`，别名 `#cn`、`#cn-short-drama`、`#cn-*`/`#gl-*`
- 数据 js/platform-data.js；链接核实 tools/check-platform-links.js → data/platform-links.json + js/platform-links.js
- 61 个来源，30 条带出处与日期的规则；其余写「官方未公开/以后台为准」
- 任务 T149–T154 完成；site-check 0 fails

## Phase 16 · 实操工作台 Phase A ✅（2026-10-17）
- docs/PHASE16-WORKBENCH.md：17+ 平台可行性矩阵（A/B/C/D）+ 架构 + T155–T167
- js/workbench.js：#me-accounts 账号中心、#war-publish GitHub 发布（预览/写入/Pages/台账）、#me-analytics 导入中心 + 分析 + AI；流水线条
- worker/ Cloudflare Worker 代理模板（Phase B，用户自行部署）；tools/fake-github.js 测试桩
- 存档追加字段：publish、imports；凭据独立键 gefei-quest-accounts-v1
- 下一步：Phase B（需 Cloudflare 账号）、Phase C（需 Google Cloud OAuth Client ID）
