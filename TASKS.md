# 出海小站练站营 · 开发任务清单（TASKS）

> 依据：`DESIGN-SPEC.md`  
> 原则：一次只做一条；做完勾选；用户已确认按 TASKS 开工  
> 日期：2026-10-16（Asia/Shanghai）

图例：`- [ ]` 未做 · `- [x]` 已做  
任务 ID：`T01`…  
依赖：写明前置任务 ID

---

## P0 · 工程骨架

### T01 · 建立目录结构

- [x] 已完成
- **目标：** 创建可零构建打开的目录骨架  
- **涉及文件：** `gefei-quest/README.md`（可先占位）、`css/`、`js/`、`assets/`（可空）  
- **验收：** 目录存在：`css/`、`js/`、`assets/`；无游戏逻辑  
- **依赖：** 无

### T02 · `index.html` 空壳页面

- [x] 已完成
- **目标：** 最小 HTML5 壳：`lang=zh-CN`、viewport、标题「出海小站练站营」、挂载点 `#app`  
- **涉及文件：** `index.html`  
- **验收：** 浏览器打开可见占位标题；无报错  
- **依赖：** T01

### T03 · 设计 Token CSS

- [x] 已完成
- **目标：** 写入 DESIGN-SPEC §10 全部 CSS 变量与基础 reset（body 深色底、正文 `--ink`）  
- **涉及文件：** `css/tokens.css`、`index.html`（link）  
- **验收：** 检查计算样式：`--gold`、`--cyan`、`--ink` 存在；正文对比清晰  
- **依赖：** T02

### T04 · 存档模块 · 读

- [x] 已完成
- **目标：** `loadSave()`：读 `localStorage['gefei-quest-save-v1']`；无则返回默认对象（见 SPEC §8）  
- **涉及文件：** `js/save.js`  
- **验收：** 控制台调用返回带 `version:1`、`settings.muted===true`、`energyEnabled===false` 的对象  
- **依赖：** T02

### T05 · 存档模块 · 写与校验

- [x] 已完成
- **目标：** `saveSave(state)` 写入；非法 JSON 时回退默认并可选 `console.warn`；导出 `getDefaultSave()`  
- **涉及文件：** `js/save.js`  
- **验收：** 写入后刷新 `loadSave()` 一致；破坏 localStorage 字符串后能恢复默认  
- **依赖：** T04

### T06 · 数据模块占位

- [x] 已完成
- **目标：** `js/data.js` 导出空/最小 `CHAPTERS`、`QUESTS`、`ACHIEVEMENTS`、`WEEKLY_UPDATES` 常量结构  
- **涉及文件：** `js/data.js`  
- **验收：** 脚本可加载无引用错误；结构字段名与 SPEC 一致  
- **依赖：** T02

### T07 · 应用入口接线

- [x] 已完成
- **目标：** `js/app.js` 启动：loadSave → 挂到简单 debug 区显示 xp/unlocked（临时）  
- **涉及文件：** `js/app.js`、`index.html`  
- **验收：** 打开页面 debug 区显示初始 XP=0、已解锁序章  
- **依赖：** T03, T05, T06

---

## P1 · HUD + 地图节点

### T08 · 顶栏 HUD 布局

- [x] 已完成
- **目标：** Screen A 顶栏：头像、等级称号、XP 条、位置、连击、成就计数占位  
- **涉及文件：** `index.html` 或 `js/app.js` 渲染、`css/ui.css`  
- **验收：** 视觉符合深色游戏风；XP 条宽度随 `xp` 变化（可用假数据）  
- **依赖：** T07

### T09 · 等级计算工具

- [x] 已完成
- **目标：** 实现 SPEC §6.1 累计 XP 表 Lv1–10；`getLevel(xp)`、`getTitle(level)`、`xpProgress(xp)`  
- **涉及文件：** `js/progress.js` 或 `js/save.js`  
- **验收：** 单测或控制台：`xp=0→1`，`xp=50→2`，`xp=1450→10`  
- **依赖：** T05

### T10 · 岛屿地图节点渲染

- [x] 已完成
- **目标：** 渲染 6 岛：序章/站一/站二/站三/变现港/放大；状态 locked/active/cleared  
- **涉及文件：** `js/map.js`、`css/ui.css`、`js/data.js`（章节元数据）  
- **验收：** 初始仅序章 active；其余 locked（锁图标+降透明）  
- **依赖：** T08, T06

### T11 · 点击岛屿打开任务板入口

- [x] 已完成
- **目标：** 点击已解锁岛 → 切换到 Screen B 并设 `currentChapter`；锁定岛提示「差什么 Boss」  
- **涉及文件：** `js/app.js`、`js/map.js`  
- **验收：** 点序章进入任务板；点锁定岛有提示且不进入  
- **依赖：** T10

### T12 · Tab 导航骨架

- [x] 已完成
- **目标：** `地图 | 任务 | 商船 | 成就 | 设置` 五个面板切换  
- **涉及文件：** `js/app.js`、`css/ui.css`  
- **验收：** 切换面板无整页刷新；当前 Tab 高亮  
- **依赖：** T08

---

## P2 · 任务板勾选结算

### T13 · 任务列表 UI

- [x] 已完成
- **目标：** Screen B 列出当前章任务卡：标题、XP、标签（主线/支线/Boss）、折叠「动作/工具/标准/坑」  
- **涉及文件：** `js/quest.js`、`css/ui.css`  
- **验收：** 序章 4 条主线任务可见（可先用占位文案，P6 再换全文）  
- **依赖：** T11, T06

### T14 · 勾选完成 · 写 done + XP

- [x] 已完成
- **目标：** 勾选未完成任务 → push `done`、加 `xp`、`saveSave`、刷新 HUD  
- **涉及文件：** `js/quest.js`、`js/save.js`  
- **验收：** 勾选后 XP 增加且刷新仍在；checkbox 保持勾选  
- **依赖：** T13, T05

### T15 · 取消勾选 · 撤回 XP

- [x] 已完成
- **目标：** 取消勾选 → 从 `done` 移除、扣回该任务 xp（不低于 0）、存档  
- **涉及文件：** `js/quest.js`  
- **验收：** 勾再取消，XP 回到勾前；等级随 XP 正确下降  
- **依赖：** T14, T09

### T16 · 连击结算

- [x] 已完成
- **目标：** 勾选或领商船时更新 `streak` / `lastCheckIn`（按本地日）  
- **涉及文件：** `js/progress.js`、`js/quest.js`  
- **验收：** 同日多次不重复加连击；模拟改 `lastCheckIn` 为昨天再勾 → streak+1；隔天以上 → 重置合理  
- **依赖：** T14

### T17 · XP 飘字反馈

- [x] 已完成
- **目标：** 勾选时短时显示 `+N XP`；`reduceMotion` 时改为无动画瞬间更新  
- **涉及文件：** `css/ui.css`、`js/quest.js`  
- **验收：** 默认有轻动效；开启减少动态后无位移动画  
- **依赖：** T14

### T18 · 体力开关逻辑（默认关）

- [x] 已完成
- **目标：** 仅当 `energyEnabled` 时耗体力；不足不可勾并提示；每日按 `energy.date` 回满 5  
- **涉及文件：** `js/quest.js`、`js/save.js`  
- **验收：** 默认关时可连勾；打开后勾 5 次耗尽，第 6 次失败  
- **依赖：** T14

---

## P3 · Boss 通关与解锁

### T19 · 章节完成判定

- [x] 已完成
- **目标：** `isChapterCleared(chapterId, state)`：所有 `required` 任务均在 `done`  
- **涉及文件：** `js/progress.js`  
- **验收：** 缺一 required 为 false；齐备为 true（支线不影响）  
- **依赖：** T06, T14

### T20 · 解锁下一岛

- [x] 已完成
- **目标：** 通关后把下一章 id 写入 `unlocked`，当前章写入 `cleared`；地图刷新  
- **涉及文件：** `js/progress.js`、`js/map.js`  
- **验收：** 序章全勾后站一解锁为 active  
- **依赖：** T19, T10

### T21 · Boss 过场（可跳过）

- [x] 已完成
- **目标：** 首次通关弹出 ≤1.5s 庆贺层（文案用章节胜利演出）；点击/键可跳过  
- **涉及文件：** `js/ui-modal.js`、`css/ui.css`  
- **验收：** 可跳过；`reduceMotion` 时直接短提示  
- **依赖：** T20

### T22 · 取消勾选破坏通关

- [x] 已完成
- **目标：** 若取消导致 required 不齐：从 `cleared` 移除；后续岛屿重新 locked（保留已做任务 done 可选策略：SPEC 为重新上锁下一岛）  
- **涉及文件：** `js/progress.js`、`js/quest.js`  
- **验收：** 取消序章 Boss 后站一变锁定；再勾回恢复  
- **依赖：** T20, T15

---

## P4 · 成就墙

### T23 · 成就数据与检测器

- [x] 已完成
- **目标：** 实现 SPEC §6.3 至少 8 个成就的 `checkAchievements(state)`  
- **涉及文件：** `js/data.js`、`js/achievements.js`  
- **验收：** 首次勾选解锁 `ach-first-check`；通关序章解锁对应成就  
- **依赖：** T20, T16

### T24 · 成就墙 UI

- [x] 已完成
- **目标：** Screen D 网格展示；未解锁灰显+条件；已解锁金边与日期  
- **涉及文件：** `js/achievements.js`、`css/ui.css`  
- **验收：** HUD 成就计数与墙一致  
- **依赖：** T23, T12

### T25 · 成就解锁轻提示

- [x] 已完成
- **目标：** 新成就解锁时 Toast「成就解锁：xxx」  
- **涉及文件：** `js/ui-modal.js`、`js/achievements.js`  
- **验收：** 触发一次提示，不重复刷屏（同成就只提示首次）  
- **依赖：** T24

---

## P5 · 港口商船 WEEKLY_UPDATES

### T26 · 商船面板 UI

- [x] 已完成
- **目标：** Screen C 列出 `WEEKLY_UPDATES` 卡片（标题/摘要/链接/领取按钮）  
- **涉及文件：** `js/weekly.js`、`css/ui.css`  
- **验收：** 样例 2～3 条可见（可先占位，T28 完善）  
- **依赖：** T12, T06

### T27 · 领取已读奖励

- [x] 已完成
- **目标：** 未 claim 时点击 → `weeklyClaimed` 记 id、+xp（默认 5）、连击 check-in、存档；已领禁用  
- **涉及文件：** `js/weekly.js`  
- **验收：** 同条不可重复领；刷新保持已领  
- **依赖：** T26, T16

### T28 · 播种样例补给文案

- [x] 已完成
- **目标：** 写入 2～3 条真实可用的摘要样例（GSC/新词/托管条款类），带可选外链  
- **涉及文件：** `js/data.js`  
- **验收：** 无整页搬运；摘要 2～4 句；id 稳定  
- **依赖：** T26

---

## P6 · 填入完整关卡文案

### T29 · 写入章节元数据

- [x] 已完成
- **目标：** 6 章 id/名称/emoji/胜利文案/下一章指针  
- **涉及文件：** `js/data.js`  
- **验收：** 与 SPEC §7 章节 id 一致  
- **依赖：** T06

### T30 · 写入序章 + 站一全任务

- [x] 已完成
- **目标：** SPEC §7.1–7.2 全部任务字段填全  
- **涉及文件：** `js/data.js`  
- **验收：** 任务板展示游戏化标题与完成标准；Boss 带 boss 标签  
- **依赖：** T29, T13

### T31 · 写入站二 + 站三全任务

- [x] 已完成
- **目标：** SPEC §7.3–7.4  
- **涉及文件：** `js/data.js`  
- **验收：** 同上  
- **依赖：** T30

### T32 · 写入变现港 + 放大全任务

- [x] 已完成
- **目标：** SPEC §7.5–7.6（可变现/放大略简但字段完整）  
- **涉及文件：** `js/data.js`  
- **验收：** 两章均可通关解锁逻辑跑通  
- **依赖：** T31

### T33 · 资料柜外链区

- [x] 已完成
- **目标：** 设置或地图侧链到 playbook / 公开文入口（只链不搬运）  
- **涉及文件：** `index.html` 或 `js/app.js`  
- **验收：** 链接可点；含哥飞归档与 playbook 相对/绝对路径说明  
- **依赖：** T12

---

## P7 · 设置面板

### T34 · 静音开关

- [x] 已完成
- **目标：** `settings.muted` 默认 true；切换持久化；音效播放前检查  
- **涉及文件：** `js/settings.js`、`js/sfx.js`（可极简）  
- **验收：** 默认无声；打开后勾选可播短音（无音文件则静默成功）  
- **依赖：** T12, T05

### T35 · 体力开关 UI

- [x] 已完成
- **目标：** 设置页开关绑定 `energyEnabled`；关时 HUD 隐藏体力条  
- **涉及文件：** `js/settings.js`、`js/app.js`  
- **验收：** 与 T18 行为一致  
- **依赖：** T18, T12

### T36 · 减少动态开关

- [x] 已完成
- **目标：** 绑定 `reduceMotion`；并可读取 `prefers-reduced-motion` 作初始建议  
- **涉及文件：** `js/settings.js`、`css/ui.css`  
- **验收：** 开启后 XP 飘字/过场无位移动画  
- **依赖：** T17, T21

### T37 · 重置存档

- [x] 已完成
- **目标：** 需输入「重置」或二次确认模态 → `localStorage` 恢复默认 → 全 UI 刷新  
- **涉及文件：** `js/settings.js`、`js/save.js`  
- **验收：** 误触单次点击不重置；确认后 XP/done 清空  
- **依赖：** T05, T12

---

## P8 · 打磨：响应式 / 无障碍 / 可读性

### T38 · 移动端布局

- [x] 已完成
- **目标：** ≤640px HUD 堆叠；地图横滑；Tab 可贴底  
- **涉及文件：** `css/ui.css`  
- **验收：** 窄屏无横向撑破；主要按钮可点  
- **依赖：** T12, T10

### T39 · 键盘与焦点

- [x] 已完成
- **目标：** Tab 可聚焦勾选框与按钮；`:focus-visible` 高亮环  
- **涉及文件：** `css/ui.css`、任务模板  
- **验收：** 仅键盘可完成勾选一任务  
- **依赖：** T14

### T40 · 可读性对比复查

- [x] 已完成
- **目标：** 按 SPEC §10 检查正文/链接/标签/节点字色；修掉低对比  
- **涉及文件：** `css/tokens.css`、`css/ui.css`  
- **验收：** 无浅灰长文；金/青在深底可读  
- **依赖：** T03, T13

### T41 · 状态不只靠颜色

- [x] 已完成
- **目标：** locked 有锁图标；cleared 有「已通关」文字；boss 有文字标签  
- **涉及文件：** `js/map.js`、`js/quest.js`  
- **验收：** 灰度模式下仍可分辨状态  
- **依赖：** T10, T13

---

## P9 · README + 自测

### T42 · 编写 README

- [x] 已完成
- **目标：** 如何用浏览器打开、进度存在哪、如何重置、周更谁改什么、非收益承诺  
- **涉及文件：** `gefei-quest/README.md`  
- **验收：** 新人只看 README 能打卡  
- **依赖：** T37

### T43 · 自测清单执行

- [x] 已完成
- **目标：** 按下方「自测清单」逐项手工测并记录结果到 README 或 `TESTLOG.md`  
- **涉及文件：** `TESTLOG.md`（可选）  
- **验收：** MVP 验收项（SPEC §13）全部通过或标明已知问题  
- **依赖：** T32, T27, T37, T40

### 自测清单（T43 用）

- [x] 冷启动默认存档正确  
- [x] 序章→站一解锁  
- [x] 取消 Boss 会锁回  
- [x] 连击跨日逻辑  
- [x] 商船只领一次  
- [x] 成就至少 8 枚可触发其中若干  
- [x] 重置确认  
- [x] 静音默认  
- [x] 体力默认关  
- [x] 刷新进度保持  
- [x] 移动端可玩  

---

## P10 · 周一例行说明（仅文档 · 不改 routine）

### T44 · 周更操作说明写入 README

- [x] 已完成
- **目标：** 说明：用户确认开工并要求恢复后，再开周一「知识补给」例行；Bot 只追加 `WEEKLY_UPDATES`、聊天发摘要；无新料保持安静；**本任务不自动创建/修改任何 routine**  
- **涉及文件：** `README.md`、可选 `DESIGN-SPEC.md` 附录  
- **验收：** 文档写清「暂停中 / 恢复需用户明确说」；仓库无新 routine 变更  
- **依赖：** T42

### T45 ·（可选）周更条目贡献模板

- [x] 已完成
- **目标：** 在 `docs/weekly-template.md` 或 README 给出一条 `WEEKLY_UPDATES` 追加示例 JSON  
- **涉及文件：** `README.md` 或 `docs/weekly-template.md`  
- **验收：** 复制即可用  
- **依赖：** T44

---

## 任务统计

| 阶段 | 任务 ID | 条数 |
|------|---------|------|
| P0 工程骨架 | T01–T07 | 7 |
| P1 HUD+地图 | T08–T12 | 5 |
| P2 任务结算 | T13–T18 | 6 |
| P3 Boss 解锁 | T19–T22 | 4 |
| P4 成就 | T23–T25 | 3 |
| P5 商船 | T26–T28 | 3 |
| P6 文案 | T29–T33 | 5 |
| P7 设置 | T34–T37 | 4 |
| P8 打磨 | T38–T41 | 4 |
| P9 README/自测 | T42–T43 | 2 |
| P10 周更文档 | T44–T45 | 2 |
| **合计** | **T01–T45** | **45** |

建议执行顺序：严格按 ID 递增；同一阶段内可微调，但勿跳过存档（P0）直接做结算。

---

## 本轮状态

- [x] 设计规格 `DESIGN-SPEC.md` 已写  
- [x] 本任务清单 `TASKS.md` 已写  
- [x] **MVP 游戏已实现**（`index.html` + css/js；T01–T45 完成）  

本轮已从 **T01** 做到 **T45**（P0–P10）。

**Phase 2：** T46–T60 已完成。

**Phase 3：** T61–T68 执行中（站二作战室）。

## 变更记录

- 2026-10-16：整合同路人公开方法 → `docs/peer-methods.md`；`WEEKLY_UPDATES` 追加「同类方案」；可选支线 + 设置页同路人卡片。存档 schema 未改。

- 2026-10-16：可试渠道/羊毛整合 → `docs/channels-and-tips.md`；`TRY_CHANNELS` + 设置页分类卡片；商船「羊毛与渠道」；支线 q-s1-s3/s4、q-s2-s4、q-m-s3/s4。存档 schema 未改（仅追加 id）。

- 2026-10-16：闲鱼非实物单独一类 → `TRY_CHANNEL_CATEGORIES.xianyu` + 10 张卡片；`docs/channels-and-tips.md` §F；商船卷轴 w-2026-10-16-j/k；支线 q-m-s5/s6。存档 schema 未改（仅追加 id）。

---

## Phase 2 · 站一落地中枢（T46+）

> 依据：`docs/PHASE2-ROADMAP.md`、`docs/PHASE2-DESIGN.md`  
> 原则：按 ID 递增执行；**默认决策已锁，不向用户抛选择**  
> 周更 Bot 例行：本阶段 **不启用**（需用户日后说「恢复」）

### T46 · Phase 2 文档落地

- [x] 已完成
- **目标：** 写入路线图、设计补充、扩容配方；TASKS Phase2 节；README 指针  
- **涉及文件：** `docs/PHASE2-ROADMAP.md`、`docs/PHASE2-DESIGN.md`、`docs/resource-expansion.md`、`docs/station-one-playbook.md`、`TASKS.md`、`README.md`  
- **验收：** 新人能按路线图知 W1 做什么；README 链到 Phase2  
- **依赖：** Phase1 完成

### T47 · 站一 HTML Starter Kit

- [x] 已完成
- **目标：** `starters/station-one/` 英文最小单页 + 部署 README（GH Pages / CF Pages）  
- **涉及文件：** `starters/station-one/index.html`、`starters/station-one/README.md`  
- **验收：** 本地打开可见 YOURBRAND 占位；README 含替换清单与两托管步骤  
- **依赖：** T46

### T48 · 站一作战室 UI

- [x] 已完成
- **目标：** 主站 Tab「作战室」；固定 Day1–7；勾选绑定 `q-p-*` / `q-s1-*` 与任务板同源  
- **涉及文件：** `index.html`、`js/war-room.js`、`js/app.js`、`js/data.js`（`STATION_ONE_DAYS`）、`css/ui.css`  
- **验收：** 勾选后任务板同步；`#war` 深链可打开；无路径选择控件  
- **依赖：** T46

### T49 · 入口串联

- [x] 已完成
- **目标：** 资源库 / 设置链到 Starter、作战室、作战手册；修设置「本页打开资源库」按钮监听  
- **涉及文件：** `js/resources.js`、`js/settings.js`、`resources.html`（若需）  
- **验收：** 三处入口可点达  
- **依赖：** T47, T48

### T50 · 部署 GitHub Pages

- [x] 已完成
- **目标：** commit + push `main`；确认 Pages 构建；线上可开作战室与 starter  
- **涉及文件：** 仓库全部变更  
- **验收：** https://yuanqingsong2024.github.io/gefei-quest/ 与 `/starters/station-one/` `/docs/PHASE2-ROADMAP.md` 可访问  
- **依赖：** T49

### T51 · 资源库关键词搜索

- [x] 已完成
- **目标：** 资源库增加搜索框，过滤 name/blurb/how/oneLiner  
- **涉及文件：** `js/resources.js`、`css/ui.css`  
- **验收：** 输入「闲鱼」只显示相关卡；清空恢复  
- **依赖：** T50（可并行于推送后）

### T52 · 存档导出 / 导入 JSON

- [x] 已完成
- **目标：** 设置页导出下载 + 导入校验 `isValidSave`  
- **涉及文件：** `js/save.js`、`js/settings.js`、`js/app.js`  
- **验收：** 导出再导入进度一致；坏 JSON 被拒绝  
- **依赖：** T48

### T53 · 作战手册与资源库文档区挂载

- [x] 已完成
- **目标：** `docs/station-one-playbook.md` 已在 T46 创建；资源库 docs 列表与设置资料柜加入手册 / Phase2 路线图  
- **涉及文件：** `js/resources.js`、`js/data.js`（RESOURCES）  
- **验收：** 资源库「文档笔记」可见手册与路线图  
- **依赖：** T46

### T54 · Starter 链入 RESOURCES / TRY 可选卡

- [x] 已完成
- **目标：** 资源库增加「站一 Starter」工具卡（cat=hosting 或 docs）  
- **涉及文件：** `js/data.js`  
- **验收：** 筛选托管或全部时可见  
- **依赖：** T47

### T55 · 作战室「今日」高亮

- [x] 已完成
- **目标：** 第一个未全部完成的 Day 加 `.war-day-today`  
- **涉及文件：** `js/war-room.js`、`css/ui.css`  
- **验收：** 视觉可辨当前应推进日  
- **依赖：** T48

### T56 · 作战室打印样式

- [x] 已完成
- **目标：** `@media print` 隐藏 HUD/Tab，仅留 Day 清单  
- **涉及文件：** `css/ui.css`  
- **验收：** 打印预览基本可用  
- **依赖：** T48

### T57 · 哈希与返回体验

- [x] 已完成
- **目标：** 切 Tab 写 `location.hash`；浏览器后退可回作战室/地图  
- **涉及文件：** `js/app.js`  
- **验收：** `#war` `#map` `#resources` 往返正常  
- **依赖：** T48

### T58 ·（可选）channels 拆 JSON 试验

- [x] 已取消（file:// 无法可靠 fetch；保持 data.js）
- **目标：** 试验 `data/channels.json` + fetch；失败则保持 data.js（可取消）  
- **涉及文件：** `data/channels.json`、加载逻辑  
- **验收：** 不破坏离线 file:// 打开（若 file:// 不可 fetch，则 **取消本任务** 并文档说明）  
- **依赖：** T51

### T59 · 站二作战室数据占位

- [x] 已完成（路线图附录占位，无 UI）
- **目标：** 仅数据 `STATION_TWO_DAYS` 占位注释，不做 UI  
- **涉及文件：** `js/data.js` 或 `docs/PHASE2-ROADMAP.md` 附录  
- **验收：** Phase3 可接着做  
- **依赖：** T55

### T60 · Phase2 收尾自测

- [x] 已完成（TESTLOG Phase2 节；浏览器勾选同步建议用户抽查）
- **目标：** 更新 `TESTLOG.md`：作战室勾选同步、starter 可开、搜索、导入导出  
- **涉及文件：** `TESTLOG.md`  
- **验收：** 关键项勾选或标明已知问题  
- **依赖：** T51, T52, T50

---

## Phase 2 任务统计

| 阶段 | 任务 ID | 条数 |
|------|---------|------|
| 文档 | T46 | 1 |
| Starter + 作战室 + 入口 + 部署 | T47–T50 | 4 |
| 搜索 / 存档 / 手册挂载 | T51–T54 | 4 |
| 打磨 | T55–T57 | 3 |
| 可选 / 收尾 | T58–T60 | 3 |
| **合计** | **T46–T60** | **15** |

建议执行：T46 → T47 → T48 → T49 → T50，同会话尽量做完；其后 T51–T55；T58 可取消。

- 2026-10-16：Phase 2 · 站一作战室 + Starter Kit + 资源搜索 + 存档导入导出；见 `docs/PHASE2-ROADMAP.md`。


---

## Phase 3 · 站二落地中枢（T61+）

> 依据：`docs/PHASE3-ROADMAP.md`、`docs/PHASE3-DESIGN.md`  
> 原则：按 ID 递增；**默认已锁，不向用户抛选择**  
> 周更 Bot：本阶段 **不启用**

### T61 · Phase 3 文档落地

- [x] 已完成
- **目标：** 写入 PHASE3 路线图/设计；TASKS Phase3 节；README 指针  
- **涉及文件：** `docs/PHASE3-ROADMAP.md`、`docs/PHASE3-DESIGN.md`、`docs/station-two-playbook.md`、`TASKS.md`、`README.md`  
- **验收：** 新人能按路线图知站二 Day1–7 与灰锁规则  
- **依赖：** Phase2 完成

### T62 · STATION_TWO_DAYS 数据

- [x] 已完成
- **目标：** `QuestData.STATION_TWO_DAYS` 绑定 q-s2-*（含 Day6 巩固日空主线）  
- **涉及文件：** `js/data.js`  
- **验收：** 长度 7；导出在 QuestData  
- **依赖：** T61

### T63 · 作战室双站 UI + 灰锁

- [x] 已完成
- **目标：** 作战室内「站一|站二」Tab；站二全日程可见；未通关站一 Boss 时勾选灰锁；深链 `#war-s2`  
- **涉及文件：** `js/war-room.js`、`js/app.js`、`css/ui.css`  
- **验收：** 切换站别写 hash；解锁后可勾且与任务板同源  
- **依赖：** T62

### T64 · 站二 HTML Starter

- [x] 已完成
- **目标：** `starters/station-two/` 一词着陆薄页 + README  
- **涉及文件：** `starters/station-two/index.html`、`README.md`  
- **验收：** 含 TARGET_KEYWORD；title/h1 可替换  
- **依赖：** T61

### T65 · 站二作战手册

- [x] 已完成
- **目标：** `docs/station-two-playbook.md` 可打印 Day1–7  
- **涉及文件：** `docs/station-two-playbook.md`  
- **验收：** 与 STATION_TWO_DAYS 一致  
- **依赖：** T62

### T66 · 入口串联

- [x] 已完成
- **目标：** 资源库/设置/RESOURCES/TRY 链到站二 Starter、手册、`#war-s2`  
- **涉及文件：** `js/resources.js`、`js/settings.js`、`js/data.js`  
- **验收：** 入口可点达  
- **依赖：** T63, T64, T65

### T67 · 部署 GitHub Pages

- [x] 已完成（本提交 push 后勾 Pages built）
- **目标：** commit + push main；确认 Pages  
- **涉及文件：** 仓库全部变更  
- **验收：** 线上 `#war-s2`、`/starters/station-two/`、`/docs/PHASE3-ROADMAP.md` 可访问  
- **依赖：** T66

### T68 · Phase3 收尾自测

- [x] 已完成
- **目标：** TESTLOG Phase3 节  
- **涉及文件：** `TESTLOG.md`  
- **验收：** 关键项或已知问题写明  
- **依赖：** T67

---

## Phase 3 任务统计

| 阶段 | 任务 ID | 条数 |
|------|---------|------|
| 文档 | T61 | 1 |
| 数据 + UI | T62–T63 | 2 |
| Starter + 手册 + 入口 | T64–T66 | 3 |
| 部署 + 自测 | T67–T68 | 2 |
| **合计** | **T61–T68** | **8** |

- 2026-10-16：Phase 3 · 站二作战室 + Starter + 手册；见 `docs/PHASE3-ROADMAP.md`。


---

## Phase 4 · 站三 + 变现作战室（T69+）

> 依据：`docs/PHASE4-ROADMAP.md`、`docs/PHASE4-DESIGN.md`  
> 原则：按 ID 递增；**默认已锁，不向用户抛选择**  
> 周更 Bot：本阶段 **不启用**

### T69 · Phase 4 文档落地

- [x] 已完成
- **目标：** 写入 PHASE4 路线图/设计；TASKS Phase4 节；README 指针；站三/变现手册  
- **涉及文件：** `docs/PHASE4-ROADMAP.md`、`docs/PHASE4-DESIGN.md`、`docs/station-three-playbook.md`、`docs/monetize-playbook.md`、`TASKS.md`、`README.md`  
- **验收：** 新人能按路线图知四站 Tab、灰锁与 Day1–7  
- **依赖：** Phase3 完成

### T70 · STATION_THREE_DAYS + MONETIZE_DAYS

- [x] 已完成
- **目标：** 数据绑定 q-s3-* / q-m-*（含巩固日空主线）  
- **涉及文件：** `js/data.js`  
- **验收：** 各长度 7；导出在 QuestData  
- **依赖：** T69

### T71 · 作战室四站 UI + 灰锁 + 深链

- [x] 已完成
- **目标：** Tab 站一|站二|站三|变现；站三锁至站二 Boss；变现锁至站三 Boss；`#war-s3` `#war-m`  
- **涉及文件：** `js/war-room.js`、`js/app.js`、`css/ui.css`  
- **验收：** 切换写 hash；解锁后可勾且与任务板同源  
- **依赖：** T70

### T72 · 站三作战手册

- [x] 已完成
- **目标：** `docs/station-three-playbook.md` 可打印 Day1–7（无厚 Starter）  
- **涉及文件：** `docs/station-three-playbook.md`  
- **验收：** 与 STATION_THREE_DAYS 一致  
- **依赖：** T70

### T73 · 变现港作战手册

- [x] 已完成
- **目标：** `docs/monetize-playbook.md` 含信任页三件套 + AdSense 自检  
- **涉及文件：** `docs/monetize-playbook.md`  
- **验收：** 与 MONETIZE_DAYS 一致  
- **依赖：** T70

### T74 · 入口串联

- [x] 已完成
- **目标：** 资源库/设置/RESOURCES/TRY 链到站三/变现手册与深链  
- **涉及文件：** `js/resources.js`、`js/settings.js`、`js/data.js`  
- **验收：** 入口可点达  
- **依赖：** T71, T72, T73

### T75 · 部署 GitHub Pages

- [x] 已完成（Pages status=built · commit 3a8171f）
- **目标：** commit + push main；确认 Pages  
- **涉及文件：** 仓库全部变更  
- **验收：** 线上 `#war-s3`、`#war-m`、手册、PHASE4 文档可访问  
- **依赖：** T74

### T76 · Phase4 收尾自测

- [x] 已完成
- **目标：** TESTLOG Phase4 节  
- **涉及文件：** `TESTLOG.md`  
- **验收：** 关键项或已知问题写明  
- **依赖：** T75

---

## Phase 4 任务统计

| 阶段 | 任务 ID | 条数 |
|------|---------|------|
| 文档 | T69 | 1 |
| 数据 + UI | T70–T71 | 2 |
| 手册 + 入口 | T72–T74 | 3 |
| 部署 + 自测 | T75–T76 | 2 |
| **合计** | **T69–T76** | **8** |

- 2026-10-16：Phase 4 · 站三 + 变现作战室 + 手册；见 `docs/PHASE4-ROADMAP.md`。


---

## Phase 5 · 放大作战室（T77+）

> 依据：`docs/PHASE5-ROADMAP.md`、`docs/PHASE5-DESIGN.md`  
> 原则：按 ID 递增；**默认已锁，不向用户抛选择**  
> 周更 Bot：本阶段 **不启用**

### T77 · Phase 5 文档落地

- [x] 已完成
- **目标：** 写入 PHASE5 路线图/设计；TASKS Phase5 节；README 指针；放大手册  
- **涉及文件：** `docs/PHASE5-ROADMAP.md`、`docs/PHASE5-DESIGN.md`、`docs/scale-playbook.md`、`TASKS.md`、`README.md`  
- **验收：** 新人能按路线图知五站 Tab、灰锁与 Day1–7  
- **依赖：** Phase4 完成

### T78 · SCALE_DAYS

- [x] 已完成
- **目标：** 数据绑定 q-x-*（含巩固日空主线）  
- **涉及文件：** `js/data.js`  
- **验收：** 长度 7；导出在 QuestData  
- **依赖：** T77

### T79 · 作战室五站 UI + 灰锁 + 深链

- [x] 已完成
- **目标：** Tab 站一|站二|站三|变现|放大；放大锁至变现 Boss；`#war-x`  
- **涉及文件：** `js/war-room.js`、`js/app.js`、`css/ui.css`（若需）  
- **验收：** 切换写 hash；解锁后可勾且与任务板同源  
- **依赖：** T78

### T80 · 放大作战手册

- [x] 已完成
- **目标：** `docs/scale-playbook.md` 可打印 Day1–7（无厚 Starter）  
- **涉及文件：** `docs/scale-playbook.md`  
- **验收：** 与 SCALE_DAYS 一致  
- **依赖：** T78

### T81 · 入口串联

- [x] 已完成
- **目标：** 资源库/设置/RESOURCES/TRY 链到放大手册与深链  
- **涉及文件：** `js/resources.js`、`js/settings.js`、`js/data.js`  
- **验收：** 入口可点达  
- **依赖：** T79, T80

### T82 · 部署 GitHub Pages

- [x] 已完成（Pages status=built · commit d169dfc）
- **目标：** commit + push main；确认 Pages  
- **涉及文件：** 仓库全部变更  
- **验收：** 线上 `#war-x`、手册、PHASE5 文档可访问  
- **依赖：** T81

### T83 · Phase5 收尾自测

- [x] 已完成
- **目标：** TESTLOG Phase5 节  
- **涉及文件：** `TESTLOG.md`  
- **验收：** 关键项或已知问题写明  
- **依赖：** T82

---

## Phase 5 任务统计

| 阶段 | 任务 ID | 条数 |
|------|---------|------|
| 文档 | T77 | 1 |
| 数据 + UI | T78–T79 | 2 |
| 手册 + 入口 | T80–T81 | 2 |
| 部署 + 自测 | T82–T83 | 2 |
| **合计** | **T77–T83** | **7** |

- 2026-10-16：Phase 5 · 放大作战室 + 手册；见 `docs/PHASE5-ROADMAP.md`。
