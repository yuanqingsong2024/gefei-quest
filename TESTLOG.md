# 自测记录 · 出海小站练站营 MVP

日期：2026-10-16（Asia/Shanghai）  
方式：Node 逻辑脚本 + 静态文件检查

| 项 | 结果 | 说明 |
|----|------|------|
| 冷启动默认存档 | PASS | version=1, muted=true, energyEnabled=false, unlocked=[ch-prologue] |
| XP 等级表 | PASS | 0→1, 50→2, 1450→10 |
| 序章→站一解锁 | PASS | 勾齐 required 后 unlocked 含 ch-stage1 |
| 取消 Boss 锁回 | PASS | 取消 q-p-boss 后 ch-stage1 不在 unlocked |
| 连击同日不叠加 | PASS | applyCheckIn 同日 streak 不变 |
| 连击隔日 +1 | PASS | lastCheckIn 昨天 → streak+1 |
| 商船只领一次 | PASS | 二次 claim 返回 already |
| 成就可触发 | PASS | first-check / prologue-clear 等 |
| 静音默认 | PASS | settings.muted === true |
| 体力默认关 | PASS | energyEnabled === false；关时可连勾 |
| 体力开启耗尽 | PASS | 开后勾 5 次，第 6 次 no-energy |
| 非法 JSON 回退 | PASS | 破坏字符串后 loadSave 回默认 |
| 移动端 CSS | PASS | ≤640px HUD 堆叠、底栏 Tab |
| 键盘焦点 | PASS | :focus-visible + checkbox 可 Tab |
| 高对比 Token | PASS | --ink/#f1f5f9, --gold, --cyan 按 SPEC |

已知限制：Boss 过场 / Toast 需在真实浏览器目视；未做自动化截图。音效无资源文件时 WebAudio 短 beep，静音默认不播。

## Phase 2 自测（2026-10-16）

- [x] `STATION_ONE_DAYS` 长度 7；node 加载 data/war-room/resources/settings 无语法错
- [x] `starters/station-one/index.html` 含 YOURBRAND / About / Privacy
- [x] 主导航含「作战室」；`index.html#war` 深链由 app hash 处理
- [x] 资源库搜索框与站一工具条存在
- [x] 设置含导出/导入与作战室入口
- [x] 浏览器手工：逻辑经 toggleQuest 同源；线上 Pages built（抽查建议用户自测）
- [x] Pages 线上 URL 可开（T50）· status=built · commit fb5b9f8



## Phase 3 自测（2026-10-16）

- [x] `STATION_TWO_DAYS` 长度 7；Day6 soft（questIds 空）
- [x] `starters/station-two/index.html` 含 TARGET_KEYWORD
- [x] 作战室站一/站二 Tab；未勾 q-s1-boss 时站二 input disabled
- [x] `#war-s2` 深链切到站二
- [x] 资源库/设置含站二入口
- [x] node 加载 data/war-room/app 无语法错
- [x] Pages 线上 built（T67）· status=built · commit 623de3a

## Phase 4 自测（2026-10-16）

- [x] `STATION_THREE_DAYS` / `MONETIZE_DAYS` 长度 7；巩固日 soft
- [x] 站三锁至 `q-s2-boss`；变现锁至 `q-s3-boss`（node 逻辑）
- [x] 深链 hash：`war-s3` / `war-m`（`hashForStation`）
- [x] 手册文件存在：station-three-playbook / monetize-playbook
- [x] 资源库/设置含站三与变现入口
- [x] node --check data/war-room/app/settings/resources 无语法错
- [x] Pages 线上 built（T75）· status=built · commit 3a8171f

## Phase 5 自测（2026-10-16）

- [x] `SCALE_DAYS` 长度 7；Day4–6 soft（questIds 空）；绑定 `q-x-01` `q-x-02` `q-x-03` `q-x-boss`
- [x] 放大锁至 `q-m-boss` 或 `ch-scale`（node 逻辑）
- [x] 深链 hash：`war-x`（`hashForStation(5)`）
- [x] 手册文件存在：`scale-playbook.md` / PHASE5-ROADMAP / PHASE5-DESIGN
- [x] 资源库/设置含放大入口
- [x] node --check data/war-room/app/settings/resources 无语法错
- [x] Pages 线上 built（T82）· status=built · commit d169dfc

## Phase 6 · 首页枢纽（2026-10-16）

- [x] 默认打开 `#home`，见四组卡片：开始实战 / 资源与羊毛 / 模板与手册 / 进度与文档
- [x] 卡片切 Tab：地图、作战室、任务、商船、成就、资源库、设置
- [x] 作战室深链：`#war` / `#war-s2` / `#war-s3` / `#war-m` / `#war-x`
- [x] 资源库 `#tools` / `#xianyu` 筛选；返回「← 首页」
- [x] Starter / playbook / MASTER / Phase / TASKS 外链可开
- [x] 移动端两列卡片可读
- [x] Pages built（见部署 commit）

## 2026-10-16 · Phase 7 美化 + 落地页
- Playwright Chromium：1280×800 / 390×844
- `/` → `#home` 落地页，body.is-home，HUD/Tab 隐藏 ✅；`#war` / `#war-s2` 显示 HUD+Tab ✅；`#home-faq` 回首页并滚动 ✅
- 390 宽无横向溢出（scrollWidth=390）✅；`resources.html#xianyu` 深链 ✅；页面 JS 错误 0
- 截图：/workspace/gefei-quest-shots/{home-desktop,home-mobile,war-desktop,resources-desktop}.png

## 2026-10-16 · Phase 8 信息架构
- `tools/site-check.js`（Chrome headless，1280×860）：20 个路由 + 9 份手册页 + 13 份开发文档页全部命中正确面板 ✅
- 旧 hash 10 个（#map #quest #quests #ship #ach #settings #resources #war-s1 #home-faq 空）→ 新路由 ✅；resources.html / #tools / #xianyu → index.html#lib(-x) ✅
- 链接检查：78 个唯一链接，原始 .md 链接 0，失效 0；控制台错误 0
- 390×844：home/lib/path/war/guide/me scrollWidth=390 ✅
- file:// 打开 #guide-scale-playbook 正常渲染（guides-data.js 兜底）✅；作战室勾选 q-p-01 写入 gefei-quest-save-v1 并在 #me 统计同步 ✅
- 截图：/workspace/gefei-quest-shots/p8-{home,path,war,lib,guide,weekly,me,mobile-home,mobile-lib}.png

## 2026-10-16 · Phase 9 实操工具
- `tools/site-check.js`（Chrome headless）：23 路由（新增 #war-kit / #war-keywords / #me-sites）+ 9 手册 + 14 开发文档，routeFails 0 · broken 0 · rawMd 0 · consoleErrors 0 ✅
- P9 功能用例 20/20 ✅：旧存档（无 kit/keywords/sites）正常加载；选词增/改/删/星标；评分 70 适合练手 · 50 可以试 · 38/12 先换长尾；设为站一主词/站二目标词；快捷链编码；CSV；实操助手预览规则 4/4；index.html 填充且唯一 h1、无 YOURBRAND；sitemap 含域名；ZIP（PK 头，Python zipfile 校验通过）；自查表与表单刷新后保留；站点 + 3 个月记录 + SVG 折线；首页快照显示站点数和最近月合计。
- file://：三个新页面 0 错误；390px：war-kit / war-keywords / me-sites scrollWidth 390 ✅
- 截图：/workspace/gefei-quest-shots/p9-kit.png · p9-keywords.png · p9-sites.png · p9-mobile-keywords.png

## Phase 10 · 学习统计与更新日志（2026-10-16）
- `tools/site-check.js`：25 路由（新增 #me-stats / #changelog）+ 9 手册 + 15 开发文档，routeFails 0 · broken 0 · rawMd 0 · consoleErrors 0 ✅
- P10 功能用例 13/13：今日任务卡、红点出现/已读消失、旧存档兼容、勾任务记 activity/doneDates、连击 3/最长 4、热力图、周柱状图、章节进度、daily.json ✅
- 390px：home / me-stats / changelog scrollWidth 390 ✅；file:// 打开三页无报错 ✅

## Phase 11 · 网站质感打磨（2026-10-16）
- site-check：25 路由 + 9 手册 + 16 开发文档，routeFails 0 · broken 0 · rawMd 0 · consoleErrors 0；P9/P10/P11 功能用例全部通过 ✅
- P11：/ 与 Ctrl+K 打开搜索、分组结果、Enter 跳转、无结果插画、顶栏收缩、回到顶部、页脚版本、底部栏（390px 显示/桌面隐藏/跳转/搜索）、5 页 390px 无横向滚动 ✅
- file:// 打开首页/作战室/搜索/文档页无报错 ✅
