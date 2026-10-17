# Phase 20 · 新手引导 + 首页重做

日期：2026-10-17（Asia/Shanghai）· 流程：执行 agent 规划 / 评审，Grok Build 写代码，develop → main 发布。

## 通用约束
- 存档 `gefei-quest-save-v1` 只追加字段；不改任务 id、路由、锚点（`#home-today`、`#home-faq` 等继续可用）。
- 中文、高对比、图标用 js/icons.js；不编造数字、用户量、评价；不承诺收入。
- 新 JS 加入 index.html 和 sw.js `PRECACHE`，`CACHE_VERSION` +1。
- 交付：site-check 0 fails + consoleErrors 0；390px 无横向滚动；file:// 正常；截图 p20-*.png；changelog；TASKS / TESTLOG / MASTER-STATUS。

---

## T182 · 使用引导 #start + 首次访问导览

### 页面 #start（新手引导）
- 路由 `#start`（别名 `#guide-start`、`#onboarding`、`#newbie`），顶栏新增「新手引导」入口（SITE_NAV 第 2 位，手机底部栏不加新项，放进「更多」或首页按钮），搜索可找到。
- 结构（页内标签，桌面 ≤2.5 屏）：
  1. 顶部一句话：「三条路线，选一条先走 7 天」+ 三张路线卡（点卡片切换标签）。
  2. **① 学习**：闯关路线 `#path` → 任务清单 `#path-quests` → 资源库 `#lib` → 平台变现 `#pm`；编号步骤 4–5 步，每步一句说明 + 深链按钮。
  3. **② 实施**：选词 `#war-keywords`（含关键词灵感）→ 实操助手 `#war-kit`（选模板）→ 发布 `#war-publish` → 分发 `#war-share` → 数据 `#me-analytics` / Google 连接 `#me-accounts` → 复盘 `#work-review`；总控台 `#work`。
  4. **③ 赚钱**：每日赚钱榜 `#war-rank` → 「加入实操计划」→ 实操计划（站一实操助手页 / 赚钱榜页）→ AI 实施官助手（赚钱榜卡片里的 AI 按钮，`#me-ai` 设置）。
  - 每条路线配 1 张真实页面截图（assets/start/*.webp，宽 640，≤80KB，由 Playwright 截取本站页面生成）。
  5. **前 7 天清单**：Day1–Day7 各 1–2 件事（勾选写入追加字段 `onboarding.days`），完成数显示在 #start 顶部。
  6. 「重新播放导览」按钮。
- 文案只描述本站真实功能。

### 首次访问导览（tour overlay）
- js/tour.js（全局 QuestTour）：首次打开（存档 `onboarding.tourDone` 不为 true 且非 file:// 也可）在首页显示 5–6 步聚光灯：顶栏导航 → 首页主按钮 → 赚钱榜 Top10 → 三条路线 → 工作台入口 → 我的进度/备份。每步：高亮框（遮罩挖洞）、标题、说明、「上一步 / 下一步 / 跳过」、步骤点、「不再显示」复选框。
- Esc 关闭、方向键翻页、焦点锁在弹层内、`role="dialog" aria-modal="true"`；目标元素不存在或被隐藏时自动跳过该步；窗口缩放重新定位；390px 下说明框贴底。
- 结束 / 跳过 / 勾「不再显示」→ `onboarding.tourDone = true`（追加字段 `onboarding = {tourDone, tourSeenAt, days:{}}`）。
- 可从 #start 和页脚「新手导览」重新播放（`#start?tour` 或按钮调用 `QuestTour.start()`）。
- 自动化测试环境（navigator.webdriver）默认不自动弹出，除非 localStorage `gefei-quest-tour-test`='1'，避免影响既有用例。

### 验收
- #start 1280 ≤2.5 屏、390px 无横向滚动；三条路线每步深链都能打开对应路由；7 天清单勾选持久化。
- 导览：首次自动出现（测试开关下）、下一步/上一步/跳过/Esc、勾「不再显示」后刷新不再出现、从 #start 与页脚可重播；目标缺失时跳过不报错。
- 截图 p20-start.png、p20-tour.png。

---

## T183 · 首页重做（产品官网风格）

### 结构（自上而下）
1. **Hero**：价值主张一句（如「把出海小站当成一场闯关：每天一份赚钱榜、一套实操工具、一条清晰路线」）+ 副标题 + 2 个 CTA：「开始新手引导」→ `#start`，「进入工作台」→ `#work`；右侧/下方真实数据小卡（见 5）。
2. **今日赚钱榜 Top 10**（紧跟 hero，最显眼）：日期 + 「每日更新」，紧凑排名列表（序号、名称、类型 pill、成本、难度点），点条目进入 `#war-rank`（定位到该条），底部「查看完整榜单」。数据来自 `QUEST_RANK` 最新一天；无数据时友好空态。
3. **三条路线**（学习 / 实施 / 赚钱）：图标 + 3 行说明 + 进入按钮（对应 #start 的标签）。
4. **功能网格**：6–8 个功能卡（作战日程、实操助手+模板库、选词+关键词灵感、发布上线、内容分发、数据分析+Google、平台变现、AI 助手），每张一句话 + 深链。
5. **真实数据条**（只用站内真实数据）：平台变现收录平台数（QUEST_PLATFORMS）、今日赚钱榜条数与已累计天数（QUEST_RANK.dates）、起步模板数（QuestTools.TEMPLATES）、手册数、更新日志条数。不出现用户数、评价、收入。
6. **今日任务 + 我的进度**（压缩成一行两卡，保留 `#home-today` 锚点；`#home-progress` 锚点保留）。
7. **FAQ**（保留 `#home-faq`，details 折叠，5–6 条）。
8. 页脚（现有）。
- 旧的 `#home-sections`、`#home-tools`、`#home-steps`、`#home-res`、`#home-guides` 锚点：保留为对应新区块的 id 或隐藏锚点，深链能滚到合理位置。
- 桌面 ≤ ~3 屏（1280×800），390px 有底部栏、无横向滚动；高对比；hero 图可沿用 assets/hero-bg.webp。

### 验收
- Top10 显示最新日期的 10 条（或实际条数），类型/成本/难度齐全，链接到 #war-rank；数据条数字与数据源一致（测试里比对）。
- 两个 CTA 链接正确；旧锚点全部可达；首页 1280 ≤3.0 屏；390px 无横向滚动。
- 截图 p20-home.png、p20-home-mobile.png。
