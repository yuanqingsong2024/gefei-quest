# Phase 20 · 新手引导 + 首页重做

日期：2026-10-17（Asia/Shanghai）· 流程：执行 agent 规划 / 评审，Grok Build 写代码，develop → main 发布。

## 通用约束
- 存档 `gefei-quest-save-v1` 只追加字段；不改任务 id、路由。旧首页锚点：`#home-today` 转到 `#work`，`#home-progress` 转到 `#me`，`#home-faq` 与 `#home-rank` 仍滚到首页对应块，`#home-sections` → `#start`，`#home-tools` → `#war`，`#home-steps` → `#start`，`#home-res` → `#pm`，`#home-guides` → `#guides`。
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

## T183 / T183b · 首页（白话说明 + 每页提示）

T183 先做成产品页。T183b 按反馈改掉：人们不知道这个站怎么用。首页只留下面这些块，按顺序，不再放功能网格、工具卡、今日任务或我的进度。

### 首页结构（自上而下）
1. **Hero**：白话说明这个站是什么（跟着哥飞的方法做英文出海小站，并收集整理靠谱的赚钱和副业渠道，每天更新赚钱榜）、写给谁（想做副业或出海小站的新手）、能拿到什么（一条按步骤走的学习路线、做站工具、每日赚钱榜）。主按钮「我是新手，从这里开始」→ `#start`（`data-tour="cta"`）。次按钮「直接看今日赚钱榜」滚到本页 `#home-rank`。
2. **继续上次**（`#home-continue`）：只有已经做过任务、登记过站点，或实操计划里有条目时才出现。一行字加一个「继续」按钮，指向最相关的下一步（站点名 + 流水线下一步，或实操计划，或上次打开的页面）。新用户不显示。
3. **这个网站怎么用**（`#home-howto`）：三句。① 学 → `#start-learn`，② 做 → `#start-do`，③ 赚 → `#start-earn`。进新手引导对应标签，不进工具页。
4. **今日赚钱榜 Top 10**（`#home-rank`）：日期、类型、成本、难度。每条链到 `#war-rank`。底部「查看完整榜单」。数据来自 `QUEST_RANK` 最新一天。
5. **为什么做这个网站**（`#home-why`）：短段落，并写明不承诺收益、榜单每条附来源链接以官方为准、进度只存在你自己的浏览器。
6. **FAQ**（`#home-faq`，details）：怎么开始、数据存在哪、要不要付费，以及能不能保证赚钱、和哥飞是什么关系。
7. 页脚（现有）。「新手导览」可重播导览。

### 旧锚点
- `#home-today` → `#work`，`#home-progress` → `#me`。
- `#home-faq`、`#home-rank` 留在首页并滚到对应块。
- `#home-sections`、`#home-steps` → `#start`；`#home-tools` → `#war`；`#home-res` → `#pm`；`#home-guides` → `#guides`。

### 每页提示与空状态
- `js/hints.js`：工具页顶部一行提示，「这个页面是干什么的」加「第一步」。可点 × 关掉。关掉记在 `save.hints.dismissed[route]=true`。带「新手引导」链接。覆盖工作台、复盘、作战日程、实操助手、选词、赚钱榜、发布、分发、学习路线、任务清单、资源库、平台变现、我的进度、账号中心、数据分析、AI 设置。
- 新用户看到的空页面要写明下一步，并给一个按钮：工作台、复盘、数据分析、实操计划、选词 / 关键词灵感、内容分发、发布上线、站点台账。

### 导览
首页 5 步，都能在首页找到：顶栏「新手引导」→ 主按钮 → 这个网站怎么用 → 今日赚钱榜 → 页脚重播（说明每页提示）。

### 验收
- 首页没有功能网格和今日任务卡。两个 CTA 链接正确。三步进入 `#start` 对应标签。Top 10 与最新一天一致。新存档不显示「继续上次」，有站点进度时显示。FAQ 至少 3 条可折叠。
- `#home-today` 打开后地址是 `#work`。桌面 1280×800 首页 ≤2.5 屏。390px 无横向滚动。
- 列出的工具页都有提示条；关掉 `#work` 的提示后刷新仍不出现，其他页仍在。工作台、复盘、数据分析的空状态有按钮。导览能走完首页上的每一步。
- 不写假数字，不承诺收入。截图 p20-home.png、p20-home-mobile.png、p20-tour.png、p20-start.png。
