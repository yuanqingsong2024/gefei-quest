# 出海小站练站营

本地单页轻 RPG：把哥飞公开的「挖词 → 上站 → SEO → 变现 → 放大」拆成可勾选关卡。  
**勾选 = 你承认线下这步已经做完**（游戏不能替你建站）。

## 开发完成状态

**T01–T83 关闭**；**Phase 6 首页枢纽**已上线。总览：[`docs/MASTER-STATUS.md`](./docs/MASTER-STATUS.md) · 清单：[`TASKS.md`](./TASKS.md)

## 站点结构（Phase 8 · 唯一名称表 `js/nav.js` SITE_NAV）

| 栏目 | 路由 | 内容 |
|---|---|---|
| 首页 | `#home` | 落地页：六个栏目、五步路线、资源分类、手册、FAQ |
| 学习路线 | `#path`（关卡地图）· `#path-quests`（任务清单） | 六个章节依次解锁，勾选即线下完成 |
| 实战作战室 | `#war` `#war-s2` `#war-s3` `#war-m` `#war-x` · `#war-kit` · `#war-keywords` | 站一 / 站二 / 站三 / 变现 / 放大，每站 Day1–7；站一实操助手；选词练习板 |
| 资源库 | `#lib`、`#lib-tools` `#lib-hosting` `#lib-monetize` `#lib-paths` `#lib-xianyu` `#lib-tips` `#lib-peers` | 筛选 + 搜索 |
| 手册与模板 | `#guides`、`#guide-<文档名>` | 5 份手册、2 个单页模板、笔记；文档在站内渲染成页面 |
| 每周补给 | `#weekly` | 每周知识卡，领取 +XP |
| 我的进度 | `#me` · `#me-sites` | 等级/统计、成就墙、偏好、导出/导入/重置存档；我的站点台账 |
| 开发者文档（页脚） | `#dev`、`#dev-<文档名>` | 路线图、任务表、测试记录 |

旧链接永久兼容：`#map` `#quest` `#ship` `#ach` `#settings` `#resources` `#war-s1`、`resources.html#tools` 等自动跳到新路由。
修改 `docs/*.md` 后运行 `python3 tools/build-guides.py` 重新生成 `js/guides-data.js`（file:// 打开也能看手册）。
测试：`node tools/site-check.js http://localhost:8765/ [截图目录]`（路由 / 旧 hash / 链接检查 / 控制台错误）。

周一知识补给 Bot：**未启用**（各 Phase 明确跳过；需你说「恢复周一补给」后再开）。

## Phase 9 · 实操工具（`docs/PHASE9-TOOLS.md`）

- **站一实操助手** `#war-kit`：填主词/介绍/域名/邮箱 → 实时预览 title/description/h1 与规则 → 下载 ZIP（index.html + robots.txt + sitemap.xml，零依赖自写 ZIP）→ 上线自查表（部分项同步勾任务 q-s1-02~05）。存 `save.kit`。
- **选词练习板** `#war-keywords`：候选词 + SERP 观察，启发式评分（公式页内可见）、快捷链、排序筛选、星标、设为站一主词/站二目标词、CSV。存 `save.keywords`。
- **我的站点台账** `#me-sites`：站点 + 月度曝光/点击/收入，汇总卡、SVG 折线、CSV；首页进度快照显示。存 `save.sites`。
- 全部只存本机浏览器；旧存档自动补字段。

## 首页枢纽

打开 [`index.html`](./index.html) 默认进入 **首页**（`#home`）：卡片目录一页串起地图 / 作战室五站 / 资源库（羊毛+闲鱼）/ Starter / 手册 / MASTER 与 Phase 文档。点卡片即可进对应 Tab 或打开文档。

## 资源库

分类浏览免费工具、托管、变现、可试路径、闲鱼·非实物、技巧与同路人方法：顶栏「资源库」（`#lib`）。

## Phase 2（已完成）

[`docs/PHASE2-ROADMAP.md`](./docs/PHASE2-ROADMAP.md) · [`docs/PHASE2-DESIGN.md`](./docs/PHASE2-DESIGN.md) · `TASKS.md` T46–T60

- **站一作战室** + [`starters/station-one/`](./starters/station-one/) + [`docs/station-one-playbook.md`](./docs/station-one-playbook.md)

## Phase 3（已完成）

[`docs/PHASE3-ROADMAP.md`](./docs/PHASE3-ROADMAP.md) · [`docs/PHASE3-DESIGN.md`](./docs/PHASE3-DESIGN.md) · `TASKS.md` T61–T68

- **作战室双站**：站一 | 站二（站二灰锁至站一 Boss；`#war-s2`）
- **站二 Starter**：[`starters/station-two/`](./starters/station-two/)（一词着陆 → GH/CF Pages）
- **站二手册**：[`docs/station-two-playbook.md`](./docs/station-two-playbook.md)

## Phase 4（已完成）

[`docs/PHASE4-ROADMAP.md`](./docs/PHASE4-ROADMAP.md) · [`docs/PHASE4-DESIGN.md`](./docs/PHASE4-DESIGN.md) · `TASKS.md` T69–T76

- **作战室四站**：站一 | 站二 | 站三 | 变现（`#war-s3` / `#war-m`）
- **灰锁**：站三 ← 站二 Boss；变现 ← 站三 Boss
- **手册**（无厚 Starter）：[`docs/station-three-playbook.md`](./docs/station-three-playbook.md) · [`docs/monetize-playbook.md`](./docs/monetize-playbook.md)
- **周一知识补给 Bot 例行**：仍暂停；**需你明确说「恢复周一补给」后再开**

## Phase 5（已完成）

[`docs/PHASE5-ROADMAP.md`](./docs/PHASE5-ROADMAP.md) · [`docs/PHASE5-DESIGN.md`](./docs/PHASE5-DESIGN.md) · `TASKS.md` T77–T83

- **作战室五站**：站一 | 站二 | 站三 | 变现 | 放大（`#war-x`）
- **灰锁**：放大 ← 变现港 Boss（`q-m-boss`）
- **手册**（无厚 Starter）：[`docs/scale-playbook.md`](./docs/scale-playbook.md)
- **周一知识补给 Bot 例行**：仍暂停；**需你明确说「恢复周一补给」后再开**

## 如何打开


1. 用浏览器打开本目录下的 [`index.html`](./index.html)（双击或拖进 Chrome / Edge / Safari / Firefox）。
2. 无需安装、无需账号、无需联网即可打卡（点外链时才需要网）。
3. 建议用同一浏览器；清站点数据会丢进度。

也可在本目录起一个静态服务，例如：

```bash
cd gefei-quest
python3 -m http.server 8765
# 浏览器访问 http://127.0.0.1:8765/
```

## 怎么玩

| Tab | 作用 |
|-----|------|
| **首页** | 内容总目录：实战 / 羊毛资源 / 模板手册 / 文档入口卡片。默认页。 |
| **地图** | 六座岛：序章 → 站一 → 站二 → 站三 → 变现港 → 放大。点已解锁岛进任务。 |
| **作战室** | 站一 / 站二 / 站三 / 变现 / 放大固定 Day1–7；灰锁递进；勾选与任务板同源。 |
| **任务** | 勾选完成；展开看「动作 / 工具 / 标准 / 坑」。Boss 通关解锁下一岛。 |
| **每周补给** | 每周知识卡；领取 +5 XP（每张一次）。 |
| **成就** | 至少 10 枚徽章，解锁条件见卡片。 |
| **我的进度** | 统计、成就墙、静音（默认开）、体力（默认关）、减少动态、导出/导入/重置存档。 |

等级只改称号，**不锁关卡内容**。取消勾选会撤回 XP；若因此破坏通关，下一岛会重新上锁。

## 进度存在哪

- `localStorage` 键名：`gefei-quest-save-v1`
- 仅本机本浏览器；换设备/无痕/清缓存会丢
- 重置：我的进度 → 重置存档 → 输入「重置」确认

## 周更（知识补给）怎么更新

- 数据在 `js/data.js` 的 `WEEKLY_UPDATES` 数组里追加条目即可（见 `docs/weekly-template.md`）。
- **只追加内容，禁止清空或覆盖用户存档。**
- 由 Grok Bot 做「每周一知识补给」例行：**当前为暂停状态**；需你明确说「恢复周一补给」后再开。无新料则保持安静。

## 相关文档

- `DESIGN-SPEC.md` — 详细设计规格
- `docs/PHASE2-ROADMAP.md` — Phase 2 路线图
- `docs/PHASE3-ROADMAP.md` — Phase 3 路线图
- `docs/PHASE4-ROADMAP.md` — Phase 4 路线图
- `docs/PHASE5-ROADMAP.md` — Phase 5 路线图
- `docs/PHASE2-DESIGN.md` / `docs/PHASE3-DESIGN.md` / `docs/PHASE4-DESIGN.md` / `docs/PHASE5-DESIGN.md` — 界面设计
- `TASKS.md` — 开发任务清单（含 T46+ / T61+ / T69+ / T77+）
- `TESTLOG.md` — 自测记录
- 学习方案：`../gefei-seo-playbook.html`
- 同路人调研：`docs/peer-methods.md`
- 可试渠道/羊毛（含**闲鱼·非实物**）：`docs/channels-and-tips.md`
- 公开文入口：https://new.web.cafe/tutorial/ww4r3rsllv

## 诚实声明

- 不收益承诺；案例收入 ≠ 你的收入。
- 不复刻付费社群生意；只整理公开方法与可执行清单。
- 不做账号 / 云同步 / 排行榜（MVP）。

## Phase 7 · 首页与视觉
打开即网站式落地页（`#home`）：Hero、五步路线、功能卡、进度快照、资源入口、手册、FAQ。其余 hash（`#war`、`#map`…）进入游戏应用区。资源：`assets/`（图标、hero 背景）、`manifest.webmanifest`。

## 更新日志与 daily.json
新增更新：在 `js/changelog.js` 最前面加一条（id 递增），然后运行 `node tools/build-daily.js` 生成 `daily.json`，再运行 `python3 tools/build-guides.py`。

## 每日赚钱榜发布（给「赚钱榜雷达」agent）
1. 准备一个 JSON 文件（格式见 `data/rank-sample.json`）：
   `{ "date": "YYYY-MM-DD", "items": [ 10 × { rank, name, type, cost, difficulty(1–5), fit, why, steps[], risk, source_url(https), tags[] } ] }`
   只收合法渠道；脚本会拒绝含盗版、账号买卖、游戏币点卡、代写、刷量的条目。
2. 发布：`node tools/publish-rank.js /path/to/rank.json --check-urls`
   - 校验结构，`--check-urls` 要求每个 source_url 返回 200
   - 写 `data/rank.json`、`data/rank-history/<date>.json`、`data/rank-history/index.json`、`js/rank-data.js`（近 14 天内嵌，file:// 可用）
   - 在 `js/changelog.js` 加/替换当天「每日赚钱榜」条目，重建 `daily.json`（含 `rank.top3`）
   - 加 `--no-changelog` 可不写更新日志
3. 推送：`git add -A && git commit -m "rank: YYYY-MM-DD" && git push`，约 1 分钟后 GitHub Pages 生效：`#war-rank`、`data/rank.json`、`daily.json`。

## 分支与协作流程（2026-10-17 起）
- `main`：GitHub Pages 线上分支。「赚钱榜雷达」agent 继续直接推送榜单数据到 main。
- `develop`：所有功能开发先提交到这里（代码由 Grok Build CLI 编写，执行 agent 负责规划、评审、测试）。
- 发布：develop 评审通过（site-check 0 fails、390px、file://、截图）→ `git pull --rebase` → 合并到 main → 推送 → 验证线上。每轮开始前先把 main 合回 develop，带上最新榜单数据。
- 路线图：`docs/PHASE19-ROADMAP.md`
