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

## Phase 12 · 每日赚钱榜（2026-10-16）
- site-check：26 路由（+#war-rank）+ 9 手册 + 17 开发文档，0 失败 · broken 0 · consoleErrors 0；P12 用例 13/13（10 卡片+免责、Tab/面包屑、类型筛选、收藏+只看收藏、加入实操计划、实操助手页显示与勾选、首页卡片/页脚、搜索索引、rank.json/index.json/daily.json）✅
- 种子榜单 10 条 source_url 均返回 200（publish-rank.js --check-urls）✅；390px 无横向滚动 ✅

## Phase 13 · AI 设置（2026-10-17）
- site-check：27 路由（+#me-ai）+ 9 手册 + 18 开发文档，0 失败 · consoleErrors 0；P13 用例 19/19：Grok 默认说明两 agent、Grok 模式按钮提示、password + 警告、预设填充、测试连接 401/404/网络 CORS/成功、Key 只在 gefei-quest-ai-v1、三个按钮流式 markdown（script/javascript: 链接被净化）、system prompt 合规与不承诺收益、忘记 Key、搜索、页脚、390px ✅
- 假服务：tools/fake-openai.js（端口 8766）。

## Phase 14 · AI 服务商列表（2026-10-17）
- site-check 0 失败 · consoleErrors 0；AI 用例 34/34：旧配置迁移、模板新建、401/404/CORS/成功、/models 获取、自定义头断言、Anthropic（x-api-key、/v1/messages、SSE）、Ollama（/api/tags、/api/chat NDJSON、无 Key）、复制/编辑/删除/单独测试、导出无 Key、导入 Key 为空、工具页切换器、三个按钮流式、忘记全部 Key、390px（列表+编辑器、选词、赚钱榜）✅

## Phase 15 · 平台变现（2026-10-17）
- site-check：routes=32 guides=9 dev=20 broken=0 consoleErrors=0；P9–P13、P15 全部 0 fails（P15 共 25 项：13 个分类页对比表=卡片数、字段完整、每条规则有来源或「官方未公开/以后台为准」、海外有大陆可用性+收款方式、#cn-short-drama 别名、资源库横幅、页脚、搜索「红果」、390px 无横向溢出）
- file:// 打开 #pm-cn-drama 正常（6 张卡片，链接状态徽章来自 js/platform-links.js）
- 来源链接核实 tools/check-platform-links.js：61 个唯一来源，55 个 200；6 个被拦截/异常：bilibili opus 404（反爬，浏览器可开）、vcg.com 403、creators.facebook.com 400、help.medium.com 403、support.substack.com 403、support.patreon.com 403（均为机器访问拦截，页面已标注）
- 截图：gefei-quest-shots/p15-cn-index.png、p15-cn-short-drama.png

## Phase 16 · 实操工作台 Phase A（2026-10-17）
- site-check：routes=35 dev=21 broken=0 consoleErrors=0；P9–P13、P15、P16 全部 0 fails
- P16（31 项，假 GitHub API tools/fake-github.js:8767 + 假 AI :8766）：平台 A–D 列表；错误 Token → 401 提示；校验成功显示已连接；Token 只在 gefei-quest-accounts-v1、不进存档；实操助手流水线 + 发布按钮；发布页自动填仓库名 + iframe 预览；预览只发 GET 不写入；确认后新建仓库、写 3 个文件、开启 Pages、显示地址、写入台账 + 发布记录；再次预览全部「不变」；改内容后检测「更新」并带 sha 写入；GSC 日期 CSV → 图表 + 趋势 + 台账月记录；GSC 查询 CSV → 前列表 + 机会词；AdSense CSV → 台账 usd；通用小红书 CSV（1.2万 解析）；坏 CSV 友好报错；AI 分析走 AI 设置服务商；流水线 5 步全部完成；页脚、搜索；390px 三页无横向溢出
- file:// 三个新页面正常
- 截图：p16-accounts.png、p16-publish.png、p16-analytics.png

## Phase 17 · 内容分发（2026-10-17）
- site-check：routes=36 dev=22 broken=0 consoleErrors=0；P9–P13、P15、P16、P17 全部 0 fails
- P17（36 项）：4 种来源（实操助手用已发布 Pages 地址）；Grok Bot 模式模板生成 14 个平台；X ≤280、小红书标题 ≤20 + 标签；X 计数（300/280 超限、中文×2 + 链接=23）；串推加条；14 个打开链接格式全部校验（X intent/post、微博 share.php、Reddit submit、LinkedIn share-offsite（不使用非官方 shareActive）、Facebook sharer、Pinterest pin/create/button、Telegram t.me/share/url、WhatsApp wa.me、小红书/知乎/公众号/头条/抖音/Medium 发布页）；shares 记录 14 次打开 + 1 次复制；数据分析时间线 + 平台柱；账号中心免费路径徽章、X 标为 D + 已分发；赚钱榜来源 + AI 生成（解析 x/xhs/weibo，其余模板补齐）；AI 提示含不承诺收益；URL 来源校验；页脚、流水线、搜索；390px
- 链接格式人工核实（curl）：x.com/intent/post 200、reddit submit 200、pinterest 200、weibo share.php 200、t.me 200、linkedin/facebook/wa.me 302（登录跳转）、小红书/公众号/抖音/头条 200、知乎 302、medium 403（拦截机器访问）
- 截图：gefei-quest-shots/p17-share.png

## Phase 18 · 紧凑页面 + Google 连接 + 工作台 + 复盘（2026-10-17）
- site-check：routes=36 dev=23 broken=0 consoleErrors=0；P9–P13、P15–P18 全部 0 fails（交互前用 `QuestCompact.revealSel` 模拟用户展开）
- P18（44 项）：赚钱榜 6/页 + 卡片折叠 + 第 2 页 + 全部；资源库前 3 类 + 显示更多；平台分类页「平台详情 / 对比表」标签、卡片 6/页、dl 折叠、`#pm-cn-media/<id>` 深链接展开第 2 页卡片；国内总览分类表 details；手册分节折叠 + 目录点击展开；首页 7 个栏目标签 + `#home-faq` 深链接展开；更新日志前 5；作战室非今日 Day 折叠；9 个关键页 ≤3 屏
- Google（GIS 桩 + 假 Google API tools/fake-google.js:8768）：客户端 ID 格式校验；initTokenClient 用用户客户端 ID + 3 个只读 scope；读取 GSC 2 / GA4 1 / AdSense 1；令牌只在 sessionStorage（不在 accounts 键、不在存档）；站点映射 gscProperty/ga4Property 追加；拉取 4 份 API 数据（GSC 按日期 / 查询、GA4、AdSense）并按月写入台账；重复拉取不重复；>6h 打开数据分析自动刷新；401 → 提示 + 清令牌；断开 → revoke + 清除
- 工作台：每站 6 步 + 下一步（分发）+ 近 28 天 API 数据 + 环比；复盘：自动事实、保存到 save.reviews、复制 Markdown、保存后工作台复盘步打勾；#review 别名；搜索可找到工作台
- 390px：work / work-review / me-accounts / pm-cn-media / war-rank / lib / home 无横向滚动
- 截图：p18-work.png、p18-work-mobile.png、p18-compact-before-after-{lib,pm-cn-media,war-rank}.png

### 页面高度（屏 = scrollHeight / 视口高；1280×800 与 390×844；空存档；tools/page-heights.js）
前：data/page-heights-before.json；后：data/page-heights-after.json。40 个可比路由桌面平均 4.19 → 2.10 屏；31/40 ≤2.5，最高 2.85（账号中心）；dev-TASKS 37.5 → 7.0（123 个标题，按章节折叠 + 显示更多章节）。

| 路由 | 前 1280 | 后 1280 | 前 390 | 后 390 |
|---|---|---|---|---|
| home | 5.96 | 2.69 | 10.44 | 4.85 |
| path | 1.81 | 1.65 | 3.15 | 2.68 |
| path-quests | 2.26 | 2.10 | 3.51 | 3.05 |
| war | 3.65 | 2.37 | 5.23 | 3.43 |
| war-s2 | 3.38 | 2.02 | 4.95 | 3.03 |
| war-s3 | 3.30 | 2.02 | 4.73 | 3.05 |
| war-m | 3.25 | 2.02 | 4.74 | 3.09 |
| war-x | 3.08 | 2.02 | 4.62 | 3.12 |
| war-kit | 3.64 | 2.77 | 5.73 | 3.95 |
| war-keywords | 2.26 | 2.09 | 4.00 | 3.53 |
| war-rank | 4.82 | 2.58 | 11.79 | 4.98 |
| war-publish | 2.05 | 1.89 | 3.75 | 3.29 |
| war-share | 2.04 | 1.88 | 3.54 | 3.07 |
| lib | 7.08 | 2.69 | 16.30 | 5.23 |
| lib-tools | 2.37 | 1.80 | 4.91 | 3.32 |
| lib-hosting | 2.42 | 1.82 | 4.76 | 3.37 |
| lib-monetize | 2.11 | 1.82 | 4.38 | 3.32 |
| lib-paths | 2.08 | 1.37 | 4.38 | 2.38 |
| lib-xianyu | 2.73 | 1.37 | 5.78 | 2.38 |
| lib-tips | 2.06 | 1.37 | 4.35 | 2.38 |
| lib-peers | 2.16 | 1.37 | 4.50 | 2.38 |
| pm | 3.03 | 2.77 | 6.39 | 5.81 |
| pm-cn | 6.57 | 2.78 | 9.84 | 4.93 |
| pm-global | 2.99 | 1.71 | 5.07 | 2.94 |
| pm-cn-media | 6.92 | 2.28 | 13.00 | 4.77 |
| pm-cn-drama | 4.89 | 2.08 | 9.27 | 4.61 |
| pm-gl-video | 3.89 | 1.96 | 7.47 | 3.49 |
| guides | 1.97 | 1.80 | 3.91 | 3.44 |
| guide-station-one-playbook | 4.01 | 2.08 | 6.72 | 3.57 |
| guide-monetize-playbook | 4.11 | 2.12 | 6.52 | 3.79 |
| weekly | 5.05 | 2.58 | 7.86 | 3.46 |
| me | 2.70 | 2.54 | 5.68 | 5.21 |
| me-stats | 2.88 | 2.37 | 4.46 | 3.52 |
| me-sites | 2.10 | 1.94 | 4.37 | 3.90 |
| me-analytics | 2.13 | 2.07 | 3.78 | 3.45 |
| me-accounts | 4.03 | 2.85 | 8.94 | 5.23 |
| me-ai | 1.72 | 1.55 | 3.25 | 2.78 |
| changelog | 4.45 | 2.46 | 7.51 | 4.54 |
| dev | 2.17 | 2.04 | 5.01 | 4.70 |
| dev-TASKS | 37.52 | 2.16 | 57.12 | 8.21 |
| work | — | 1.55 | — | 2.78 |
| work-review | — | 2.11 | — | 3.14 |

## Phase 19 · 计划 1 紧凑收尾 T178（2026-10-17，代码：Grok Build；评审：执行 agent）
- 评审 2 轮：第 1 轮 9 页全部 ≤2.5，但账号中心平台卡把状态徽章 / 免费路径收进了「展开」→ 退回；第 2 轮修好并加断言
- 1280×800（屏）前 → 后：home 2.69→2.09、war-kit 2.77→2.10、war-rank 2.58→1.95、lib 2.69→2.25、pm 2.77→1.57、pm-cn 2.78→1.99、weekly 2.58→1.75、me 2.54→1.88、me-accounts 2.85→2.10（data/page-heights-p19.json）
- site-check：routes=36 dev=24 broken=0 consoleErrors=0，P9–P18 全部 0 fails；P18 高度阈值改为 2.5（12 个页面）；fake-google 由测试自启
- 390px 与 file://（10 个页面）无横向滚动、无报错
- 截图：p19-compact-home.png、p19-compact-me-accounts.png

## Phase 19 · 计划 2 模板库 T179（2026-10-17，代码：Grok Build）
- 站一实操助手起步模板：单页介绍（`basic`，缺省，index.html 与原来逐字节相同）、在线工具站、对比/评测页、术语表/词汇站。存档只追加 `kit.template`、`kit.templateDone`。
- 预览、ZIP、单文件下载和发布上线都走 `QuestTools.files(kit)`。发布计划显示模板名（例如「模板：在线工具站」）。非 basic 的上线自查多一条「占位已替换」，勾 `#kit-tpl-done` 才算通过。
- 空存档 1280×800：`#war-kit` 2.36 屏（`tools/page-heights.js`）。P18 高度用例里 war-kit 为 1.92（上线自查标签打开、预览区收起），12 页均 ≤2.5。
- site-check：routes=36 guides=9 dev=24 rawMd=0 broken=0，P9–P19 全部 0 fails，`TOTAL fails=0 consoleErrors=0`。P19：缺省 basic、三种新模板刷新后仍记住、预览含 form/table/8 条术语、每页一个 h1 与 title/description/canonical、文件为 index.html + robots.txt + sitemap.xml（只含 `/`）、占位勾选来回切换、假 GitHub 预演 3 个文件并显示模板名、390px `#war-kit` scrollWidth 390。
- 截图：`/tmp/sc-shots/p19-templates.png`（桌面 `#war-kit`，对比/评测页选中）

## Phase 19 · 计划 3 关键词灵感 T180（2026-10-17，代码：Grok Build）
- `#war-keywords` 增加页内标签「选词练习板」「关键词灵感」（练习板在前）。`js/ideas.js` 在浏览器里直连 Datamuse 联想、Wikipedia opensearch、HN Algolia；失败或 8 秒超时显示「暂时取不到，可稍后再试或用下面的链接手动查」。
- Google 自动补全只生成「种子词 + a…z」和 for / vs / free / online / alternative，可复制或打开 Google 搜索。Trends、Reddit、Product Hunt 只给官方搜索链接。不使用代理，不绕过 CORS。
- 勾选后「加入候选词」写入 `keywords.items`（`QuestTools.newKeyword`，来源「联想」，可打分）。重复词不会再加。存档只追加 `ideas.lastSeed` 与 `ideas.history`（最多 20 条）。
- 测试桩 `tools/fake-ideas.js`（8769）。`gefei-quest-ideas-cfg.base` 可改 API 根。空存档 1280×800：`#war-keywords` 1.85 屏。390px 练习板与灵感标签 scrollWidth 均为 390。
- site-check：`TOTAL fails=0 consoleErrors=0`。P19b：三列有结果、A–Z 31 条 Google URL、Trends/Reddit/Product Hunt 编码正确、加入 3 个且第二次不重复、练习板能看到、种子词 fail 时只有 Datamuse 报错、history 记下 pdf merge / added 3、搜索能找到「关键词灵感」。
- 截图：`/tmp/sc-shots/p19-ideas.png`（桌面，种子词 pdf merge 搜完之后）

## Phase 20 · 计划 1 新手引导 T182（2026-10-17，代码：Grok Build）
- 新栏目 `#start`（别名 `guide-start` / `onboarding` / `newbie`）：学习、实施、赚钱三条路线，每步链到站里已有页面。顶栏第 2 项「新手引导」。页脚「新手引导」与「新手导览」（`#foot-tour` 重播）。手机底栏仍是 6 个入口，没有把新手引导塞进去。
- 三张路线图截自 `#path`、`#work`（先写入一个演示站点）、`#war-rank` 视口顶部，存为 `assets/start/learn.webp`、`do.webp`、`earn.webp`（宽 640，quality 70，约 11 / 18 / 30 KB）。
- 前 7 天勾选写入存档 `onboarding.days`（只追加字段）。聚光灯导览 `js/tour.js`：第一次打开 `#home` 且 `onboarding.tourDone !== true` 时出现；`navigator.webdriver` 时不自动出现，除非 `localStorage gefei-quest-tour-test=1`。跳过、Esc、完成、「不再显示」都会记下 `tourDone` 与 `tourSeenAt`。`#start-tour` 与页脚可以重播。
- 空存档 1280×800：`#start` 1.50 屏（390×844 为 3.40 屏）。`tools/page-heights.js` → `/tmp/h.json`。
- 首页布局未改（T183）。只加了导览用的 `data-tour` 锚点。
- site-check：`TOTAL fails=0 consoleErrors=0`。P20a 覆盖导航、三条路线与编号步骤、深链、截图 naturalWidth、7 天勾选刷新后仍在、导览自动打开 / 上一步下一步 / Esc / 不再显示与完成 / 重播 / 缺目标跳过、390px 无横向滚动且气泡在视口内、file://。截图 `/tmp/sc-shots/p20-start.png`、`/tmp/sc-shots/p20-tour.png`。

## Phase 20 · 计划 2 首页重做 T183（2026-10-17，代码：Grok Build）
- 首页改为产品页：价值主张 +「开始新手引导」`#start` +「进入工作台」`#work`，右侧为站内真实数字（平台 50、今日榜条数、累计天数、起步模板 4、作战手册 5、更新日志条数）。
- 今日赚钱榜紧跟首屏：最新日期、每日更新、最多 10 条（序号、名称、类型、成本第一分句、难度点），条目链到 `#war-rank`。无数据时有空态。
- 学习 / 实施 / 赚钱链到 `#start-learn` `#start-do` `#start-earn`（打开新手引导对应标签）。8 张功能卡链到已有页面。今日任务与我的进度并排，勾选入口和站点台账快照仍在。FAQ 6 条可折叠。
- 旧锚点 `#home-today` `#home-faq` `#home-progress` `#home-sections` `#home-tools` `#home-steps` `#home-res` `#home-guides` 仍滚到对应块。导览目标改到主按钮、Top 10、三条路线、工作台按钮、我的进度。
- 顶栏在 1024 与 1280 收紧字号和间距（1024 隐藏图标），「我的进度」不再被裁切。
- 空存档 1280×800：`#home` 约 2.83 屏。390px `scrollWidth` 390，底部栏仍是 6 项。
- site-check：P20b 覆盖两个 CTA、Top 10 顺序与类型/成本/难度、三项真实数字、路线和功能卡离开首页、旧锚点、FAQ 折叠、桌面 ≤3 屏、390 无横向滚动、1024/1280 顶栏、导览 6 步。截图 `/tmp/sc-shots/p20-home.png`、`/tmp/sc-shots/p20-home-mobile.png`。
