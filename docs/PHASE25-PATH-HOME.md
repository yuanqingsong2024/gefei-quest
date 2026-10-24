# Phase 25 · 首页路径化 + 顶栏减负（阶段 1）

日期：2026-10-24（Asia/Shanghai）
风格：Duolingo 主线路径 + Stripe 稀疏顶栏

## 目标
首页一眼知道「今天做哪一关」；顶栏只留 4 条主路径；旧 hash 全部可开。

## 验收标准
1. 顶栏中心主导航 ≤4：首页 · 学习 · 实施 · 赚钱。「我的」仅右侧头像/菜单（可下拉），不与四项平级居中。
2. 「新手引导」不在顶栏/底栏；`#start` 深链仍可打开；首页 CTA / 路径节点可进入。
3. 「每周补给」不在「学习」下拉；`#weekly` 仍可开（页脚/网站地图）。
4. 首页：中间竖向路径约 5 节点（新手→学习路线→做站Day→发布→试渠道），当前关高亮 + 侧卡「今天这一关」+ 主按钮「开始」；已完成打勾、未解锁灰显。
5. 首页右侧仅今日榜 Top3 + 链到 `#war-rank`；**删除**首页完整 Top10 区块（`#home-rank` 大列表）。
6. FAQ / 为什么做默认折叠。
7. 有进度时保留「继续上次」。
8. 手机底栏：四主路径 + 我的（约 5 格），不坏布局。
9. `locate` / `navById` / 搜索 / 页脚仍能找到 `#start`；`parse('#start')` 不变。
10. 更新 `js/tour.js` 文案与选择器，去掉对「顶栏新手引导」和「首页 Top10」的依赖，改指路径/今天这一关/Top3。
11. `sw.js` CACHE_VERSION +1；changelog 一条。
12. 不提交 `data/money-rank/latest.json` 与未跟踪的 `2026-10-24.json`。

## 路径节点（映射真实 hash）
| 节点 | hash | 完成判定（可读 save，与 nextStep 同源逻辑） |
|------|------|----------------------------------------------|
| 新手引导 | #start | visitorStarted(save) |
| 学习路线 | #path | done 任务至少 1 条，或已有候选词/站点 |
| 做站 Day | #war | 已有候选词（kwReady） |
| 发布上线 | #war-publish | isPublished |
| 试渠道 | #war-rank | hasData 或 hasReview 或 rankPlan 有条目；否则当前关 |

当前节点 = 第一个未完成；若全部完成则高亮「试渠道」。
侧卡「今天这一关」标题/说明/按钮优先用现有 `nextStep(save)`。

## 改动文件（预期）
- `js/nav.js`：SITE_NAV 去掉 start 顶层；learn.children 去掉 weekly；mine 标记右侧；导出 START_PAGE；locate/navById/mainFlow/renderTopNav/页脚适配
- `js/shell.js`：底栏用 首页/学习/实施/赚钱/我的；CSS 列数
- `js/home.js`：`renderHome` 重写为路径布局；去掉完整 Top10
- `css/ui.css`：`.home-path*` / `.nav-mine` / bottom-bar 5 列等最小样式
- `js/tour.js`：步骤选择器与文案
- `sw.js`：CACHE_VERSION
- `js/changelog.js`：一条中文条目

## 不做（本阶段）
- 不合并 main；不改赚钱三 Tab；不改实施区内 Tab 折叠。
