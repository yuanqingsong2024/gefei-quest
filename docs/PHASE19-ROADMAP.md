# Phase 19 · 路线图（免费优先）

日期：2026-10-17（Asia/Shanghai）

## 新工作流（用户决定）
- **规划 / 评审**：执行 agent 只写规格、评审、测试、合并。
- **写代码**：所有源码改动由 Grok Build CLI 完成：`~/.local/bin/grok -p "<规格>" --cwd /workspace/gefei-quest --always-approve`。评审不通过时，给出精确修复提示退回（每个任务最多 3 轮）。
- **分支**：`develop` 先提交；评审通过后（site-check 0 fails、390px、file://、截图）合并到 `main` 上线。`main` 上「赚钱榜雷达」agent 会继续推送榜单数据，每轮先 `git pull --rebase` 并把 main 合回 develop。

## 通用约束（每个计划都适用）
- 存档 `gefei-quest-save-v1` 只追加字段，不改任务 id；凭据不进仓库。
- 高对比、中文界面、图标用 js/icons.js；不爬虫、不违反平台条款；不承诺收入、不编造数字。
- 纯静态站，不加付费 API，不加构建步骤。
- 交付：site-check 0 fails + consoleErrors 0；390px 无横向滚动；file:// 能打开；截图到 /workspace/gefei-quest-shots；changelog 新条目（id 递增）+ `node tools/build-daily.js` + `python3 tools/build-guides.py`；TASKS / TESTLOG / MASTER-STATUS 更新。

---

## 计划 1 · 紧凑收尾（T178）
**目标**：Phase 18 后仍超标的 9 个页面降到 ≤2.5 桌面屏（1280×800，空存档，`tools/page-heights.js`）：home 2.69、war-kit 2.77、war-rank 2.58、lib 2.69、pm 2.77、pm-cn 2.78、weekly 2.58、me 2.54、me-accounts 2.85。
**做法**：继续用 js/compact.js 的组件（tabs / collapse / more / paginate / cx-fold），收紧间距；不删内容、不改路由和锚点。
**验收**：
- 上述 9 页 1280 下 ≤2.50；其他页不变高；390px 不横向滚动。
- site-check P18 高度用例把阈值从 3.0 改为 2.5，覆盖这 9 页。
- 截图 p19-compact-*.png（前后对比 2 张）。

## 计划 2 · 模板库（T179）
**目标**：站一实操助手可选多种起步模板，并能用现有「发布上线」推到 GitHub Pages。
**模板**：现有「单页工具介绍」+ 新增 ①「在线工具站」（工具框 + 使用步骤 + FAQ）②「对比 / 评测页」（对比表 + 优缺点 + 结论，带「信息以官网为准」提示）③「术语表 / 词汇站」（A–Z 索引 + 词条卡）。
**做法**：js/tools.js 的 `gen/files` 按 `kit.template` 生成（新存档字段，默认 `basic`，老存档不变）；每个模板都输出 index.html + robots.txt + sitemap.xml，含 title/description/canonical/语义化结构；实时预览、下载 ZIP、发布上线都按所选模板。
**验收**：4 个模板可选并持久化；每个模板的预览 iframe 能渲染、上线自查表通过；发布上线预演（假 GitHub）文件列表正确；新增 site-check P19 模板用例。

## 计划 3 · 关键词灵感（T180）
**目标**：在选词练习板旁提供免费的关键词灵感来源，一键加入候选词。
**来源（已核实 CORS，2026-10-17）**：
- 浏览器直接取数（有 CORS）：Datamuse `api.datamuse.com/sug`（英文联想）、Wikipedia opensearch（`origin=*`）、Hacker News Algolia 首页 / 搜索 API。
- 只能打开链接 / 复制辅助（无 CORS，不绕过）：Google 自动补全（字母扩展 `词 a…z` 一键复制 / 打开 Google 搜索）、Google Trends 探索链接、Reddit 搜索、Product Hunt。
**做法**：新区块「关键词灵感」（在 #war-keywords 页内标签），输入种子词 → 并列显示联想结果，勾选后「加入候选词」写入现有 `keywords.items`；错误 / 离线时友好提示；测试用假服务器 + 可覆盖 API 根地址。
**验收**：3 个 CORS 来源能取数（假服务器测试）、失败提示；加入候选词后选词练习板出现并可打分；链接类来源 URL 格式正确；site-check P19 用例。

## 计划 4 · PWA 离线 + 安装 + 备份提醒（T181）
**目标**：http(s) 下可安装、可离线打开；提醒用户定期备份存档。
**做法**：根目录 `sw.js`（版本号缓存全部静态资源，导航请求离线回退 index.html；只在 http/https 注册，file:// 跳过）；manifest 补 `id`、`shortcuts`（工作台 / 选词 / 赚钱榜）；「安装到桌面」按钮（beforeinstallprompt，可隐藏）；备份提醒：存档追加 `lastBackupAt`，超过 14 天且有进度时在我的进度 / 工作台显示提醒条，含「导出备份」「从备份恢复」（复用现有导出 / 导入）。
**验收**：Playwright 下 SW 注册且离线刷新 #work 能渲染；file:// 无 SW 错误；提醒条按日期出现 / 消失；导出后 `lastBackupAt` 更新；site-check P19 用例。

---

## 执行顺序
1 → 2 → 3 → 4，各自在 develop 上单独提交，评审通过后各自发布到 main。
