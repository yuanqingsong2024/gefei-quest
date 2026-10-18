# Phase 24 · 每条都标来源

用户要求：每条收集来的内容都要显示来源 / 来源文章链接。

## 现状
- `data/rank.json`、`data/rank-history/*.json`、`data/money-rank/*.json`、`js/rank-data.js` 每条只有一个 `source_url`；`js/rank.js` 一律写「官方来源」，哪怕是新闻或博客（如 finance.sina.com.cn、10000yun.com）。没有发布方和日期。
- 首页 Top 3 不显示来源。
- `js/platform-data.js` 约 50 个链接，格式不一；部分标「未核实」。

## 方案
1. **数据格式（只增不删，向后兼容）**：榜单条目新增
   `sources: [{ title, url, publisher, published, kind, checked }]`
   - `kind`：`official` | `media` | `community`；`published`：`YYYY-MM-DD` 或 `''`；`checked`：`YYYY-MM-DD`。
   - 保留 `source_url`（= 第一条来源的 url），旧存档和 rankPlan 继续可用。
   - 旧条目迁移：从 `source_url` 生成一条来源；`publisher` 用域名；`title`、`published` 留空（不编）；`kind` 按域名判断：gov.cn / 政府与机构域名 / 平台自家官方域名（如 jd.com、taobao.com、tmall.com、10086.cn、bilibili.com、douyin.com 等平台官方帮助/活动页）→ `official`，reddit/v2ex/知乎/小红书/论坛等 → `community`，其余 → `media`。`checked` 用该期榜单日期。
2. **`tools/publish-rank.js`**：每条至少 1 个来源，url 必须是 http(s)，`kind` 必须合法；`--check-urls` 检查每条来源；`checked` 自动填当天；没有来源的条目直接拒绝。更新 `data/rank-sample.json` 与赚钱榜雷达说明（README / docs 中的 rank agent 说明）。迁移现有 `data/rank.json`、`data/rank-history/*`、`data/money-rank/*` 并重建 `js/rank-data.js`。
3. **统一组件** `QuestSources.render(sources, { compact })`（新文件 `js/sources.js`，加入 sw 预缓存）：
   - 完整版：「来源」+ 类型徽章（官方 / 媒体 / 社区）+ 发布方 + 发布日期（有才显示）+ 链接 ↗（`target=_blank rel="noopener noreferrer"`）+「核实于 YYYY-MM-DD」。多条来源逐条列出。
   - 紧凑版：发布方 + ↗。
   - 用在：每日赚钱榜列表（替换写死的「官方来源」按钮）、首页 Top 3（紧凑版）、实操计划 rankPlan 条目、平台变现栏目（把 platform-data.js 链接尽量规范成同一结构，保留「未核实」标记）、「问 AI」离线回答（有来源的片段）、手册 / 资源库中引用链接的地方。
   - 非官方来源绝不显示「官方」。
4. **榜单类型**：在原有 羊毛、副业、闲鱼非实物、出海小站、工具活动 之外新增 出海新词、开发者羊毛、奖金赛/悬赏、平台激励、联盟营销、案例拆解、数字产品/接单；#war-rank 加类型筛选（只显示有条目的类型 + 「全部」）。不为新类型造假条目。

## 发布
changelog id 34、`node tools/build-daily.js`、sw `CACHE_VERSION` 11→12。

## 验收
- `node tools/site-check.js`：TOTAL fails=0 consoleErrors=0，新增 P26：
  - 迁移后每个 rank 文件的每条都有 `sources` 且 `sources[0].url === source_url`；
  - `publish-rank.js` 拒绝没有来源 / 非法 url / 非法 kind 的条目（用临时文件测试，不改真数据）；
  - 组件出现在：赚钱榜、首页 Top 3、rankPlan、平台变现、问 AI 离线回答；
  - 非官方来源（如 finance.sina.com.cn）不出现「官方」字样；
  - 类型筛选可用。
- 截图：p26-rank-sources.png、p26-home-top3.png、p26-platform-sources.png。
- 线上：sw v12，latestId 34。
