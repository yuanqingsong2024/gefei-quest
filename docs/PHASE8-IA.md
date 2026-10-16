# Phase 8 · 信息架构重整（IA）· 定稿

日期：2026-10-16 · 状态：LOCKED（不再征询选择）

## 1. 审计（Phase 7 现状）
| 现位置 | 旧名 | 旧去向 | 问题 |
|---|---|---|---|
| 顶栏 site-links | 首页 / 开始练站 / 作战室 / 资源库 / 手册 / 关于 | #home, #war×2, resources.html, #home-guides, #home-faq | 「开始练站」「作战室」同一目标（重复）；资源库跳出 SPA |
| Tab 栏 | 首页 地图 作战室 任务 商船 成就 资源库 设置 | #home #map #war #quest #ship #ach #resources #settings | 与顶栏两套导航；游戏名「商船」；资源库与 resources.html 重复 |
| 作战室 | 站一/站二/站三/变现/放大 + 「作战手册」 | docs/*-playbook.md（新窗） | 原始 markdown |
| 资源库 工具条 | 5 份手册按钮 | docs/*.md | 原始 markdown |
| 资源库「文档笔记」 | 14 条 | docs/*.md（含 PHASE*、MASTER-STATUS） | 开发文档混入用户区 |
| 首页 功能/资源/手册/页脚 | 羊毛、闲鱼、手册、MASTER-STATUS、PHASE2–5、TASKS.md | resources.html#…、docs/*.md | 跳出 SPA + 原始 md |
| 设置 | 可试渠道 / 同路人 面板 + docs 链接 | docs/channels-and-tips.md 等 | 与资源库重复、原始 md |
| 商船卷轴 data.RESOURCES / WEEKLY | url: ./docs/*.md | 原始 md |
| resources.html | 独立页 #tools #hosting #monetize #paths #xianyu #tips #peers #docs | — | 第二套壳 |
合计 grep：用户界面 `.md` 链接 ~60 处（data.js 40+、home.js 20、resources.js 19、war-room.js 5、settings.js 7）。

## 2. 新信息架构（唯一名称表 = js/nav.js `SITE_NAV`）
| id | 主名称 | 副标题（保留少量游戏味） | 路由 | 图标 |
|---|---|---|---|---|
| home | 首页 | 出海小站练站营 | #home | lighthouse |
| path | 学习路线 | 关卡地图 · 任务清单 | #path / #path-quests | map |
| war | 实战作战室 | 站一 → 放大，每站 Day1–7 | #war #war-s2 #war-s3 #war-m #war-x | target |
| lib | 资源库 | 工具 · 托管 · 变现 · 闲鱼 | #lib, #lib-tools #lib-hosting #lib-monetize #lib-paths #lib-xianyu #lib-tips #lib-peers | toolbox |
| guides | 手册与模板 | 5 份手册 · 2 个模板 · 笔记 | #guides, #guide-&lt;id&gt; | book |
| weekly | 每周补给 | 原「商船卷轴」 | #weekly | calendar |
| me | 我的进度 | 成就 · 统计 · 存档 · 设置 | #me | user |
| dev（页脚） | 开发者文档 | 路线图/任务/状态 | #dev, #dev-&lt;id&gt; | code |

章节显示名：序章 → 「入门准备」，站一·新手岛 → 「站一 · 上线第一站」等仅作主名，岛名保留为副标题。

## 3. 旧链接兼容（永久）
#map→#path · #quest/#quests→#path-quests · #ship→#weekly · #ach/#settings→#me · #resources→#lib · #war-s1→#war · #home-*保留滚动 ·
resources.html[#x] → index.html#lib-x（meta refresh + JS，保留 hash）。docs/X.md 的站内引用一律改为 #guide-X / #dev-X；运行时还有兜底改写。

## 4. 文档 → 页面
- js/guides.js：内置极简 markdown 渲染器（标题/列表/表格/代码/引用/链接/粗斜体），带 TOC、返回按钮。
- 数据：tools/build-guides.py 将 docs/*.md 打包到 js/guides-data.js（file:// 可用，无需 fetch）。
- 用户手册：station-one/two/three-playbook、monetize-playbook、scale-playbook、channels-and-tips、peer-methods、resource-expansion、weekly-template。
- 开发文档（仅页脚「开发者文档」#dev）：MASTER-STATUS、PHASE2–8、TASKS、TESTLOG。

## 5. 图标
js/icons.js 内联 SVG（24 视框，stroke 1.75，round caps，currentColor；金/青强调）。覆盖：7 区块、5 作战站、7 资源分类、全部手册、首页功能卡、步骤。主图标不再用 emoji。

## 6. 视觉
统一壳：吸顶顶栏（图标+名）→ 区块头带（图标 + 标题 + 一句说明 + 面包屑）→ 内容卡片 → 每页页脚。移除旧 Tab 栏与 HUD 大块（HUD 精简进「我的进度」与顶栏小徽章）。390px 无横向滚动；prefers-reduced-motion 生效。
