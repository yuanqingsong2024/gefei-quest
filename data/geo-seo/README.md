# AEO / GEO / SEO 专栏

频道页：`#geo-seo`（导航「学习 → AEO / GEO / SEO」）  
加载：`js/geo-seo-data.js` 内嵌兜底 → `fetch data/geo-seo/latest.json`（`cache: 'no-cache'`）  
页面只读 `latest.json`。GitHub Pages 不能当目录索引，不要指望前端去列 `YYYY-MM-DD.json`。

公开整理，不是排名、流量、收益或 AI 引用承诺。不编造官方分数。不触灰产。

## 文件

| 文件 | 说明 |
| --- | --- |
| `YYYY-MM-DD.json` | 当期快照（当天新条目）。前端不读这个文件 |
| `latest.json` | `{ "updated": "YYYY-MM-DD", "items": [ ... ] }`。历史也累积在这里，按 `date` 倒序。前端只读这个 |
| `js/geo-seo-data.js` | 内嵌 `QUEST_GEO_SEO`，与 `latest.json` 同步，给 `file://` 和离线兜底 |

纯 JSON 周更（只改当期文件和 `latest.json`）不必改 `sw.js` 的 `CACHE_VERSION`。网络优先会拉到新 JSON。  
若同步了 `js/geo-seo-data.js` 或其他 JS / CSS / HTML，必须把 `CACHE_VERSION` +1。本栏默认每次内容 PR 都同步兜底，因此通常要 +1。

## 条目字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 建议 | 稳定 id，如 `geo-seo-2026-11-25-a` |
| `date` | 是 | `YYYY-MM-DD`（Asia/Shanghai） |
| `slot` | 建议 | `tue` \| `sat` \| `launch`（首刊或非周二/周六上线日用 `launch`） |
| `title` | 是 | 建议 ≤40 字 |
| `source_url` | 是 | 可打开的 http(s) 来源。渲染器会丢掉缺链接或非 http(s) 的条目 |
| `source_name` | 建议 | 如 `Google Search Central` |
| `type` | 是 | `SEO` \| `AEO` \| `GEO` \| `交叉` \| `官方口径` |
| `summary` | 是 | 只转述来源已写明的事实，建议 ≤120 字 |
| `takeaway` | 建议 | 一句可执行的核对动作。不写收益 / 流量 / 排名 / 引用承诺，不写灰产 |
| `tags` | 否 | 字符串数组 |

来源优先：Google Search Central / 官方帮助文档 / 原厂文档；其次是打开过、可核验的行业公开文。不引用未打开的转载，不编造数字。

## 周更节奏

- **日程**：每周二、周六各一则（Asia/Shanghai）。与「每周补给」周一错开，也不挤到一三五。
- **宁缺勿滥**：当期没有可核验、值得写下的公开来源，就跳过。不要用二手转述或空泛评论凑数。跳过时不必开空 PR，在下次 brief 里注明「YYYY-MM-DD 跳过，原因：…」。
- **数量**：一期通常 1 条，最多 2 条。不要一次堆成简报合集。
- **红线**：不承诺收益 / 流量 / 排名 / AI 引用；不编造官方分数；不触灰产；不写未打开原文的来源。
- **changelog**：可每周（不是每期）补一条「AEO / GEO / SEO 资讯 · 日期」，勿按日刷。纯 JSON 周更也可以不改 changelog。

## 角色

| 角色 | 职责 |
| --- | --- |
| 周衡 | 出 writer-ready brief：建议标题、`type`、已打开并可用的 `source_url`、`source_name`、按原文转述的 `summary`、不越线的 `takeaway`、`tags`，以及跳过时的理由。brief 不是上线。 |
| 林辰 | 审 brief 是否越线（收益承诺、灰产、缺来源、改了不该改的文件），派 Grok Build 按 brief 做内容 PR。 |
| Grok Build | 只改本栏约定文件，开 PR，在说明里列出已核对的 URL 与打开日期（Asia/Shanghai）。 |
| 用户 | 需要上线时明示「合 main 上线」。未明示则 PR 保持打开。 |

本次及后续本栏更新，**都不**套用 AI 生活每日同步那种自动合 main 授权。合 main 须用户明示「合 main 上线」。

## 内容 PR 可以改的文件

- 必改：`data/geo-seo/YYYY-MM-DD.json`（新建当期）、`data/geo-seo/latest.json`（新条目插到 `items` 顶部，更新 `updated`，保留历史）
- 建议同步：`js/geo-seo-data.js`（与 `latest.json` 保持一致）。同步了该 JS 就要 `CACHE_VERSION` +1
- 可选：`js/changelog.js` 一条周汇总，并运行 `node tools/build-daily.js`
- 禁止：`WEEKLY_UPDATES`、`starters/geo-checklist/**`、`starters/aeo-checklist/**`、赚钱榜 / 羊毛 / OPC 当期、W48、FAQ 三连草稿、无关导航、`FLOW_IDS`、顶栏四个主入口

## 怎么开内容 PR（不合 main）

1. 从当时的 `origin/main` 拉分支，例如 `content/geo-seo-YYYY-MM-DD`。不要基于过期本地克隆。
2. 按 brief 写入当期 JSON，更新 `latest.json`（保留历史条目）。
3. 再打开一遍每条 `source_url`，确认 HTTP 200、摘要没有超出原文。
4. 若同步了兜底 JS，同时把 `sw.js` 的 `CACHE_VERSION` +1。纯 JSON、不同步兜底 JS 时不必改 `CACHE_VERSION`。
5. 开 PR。标题示例：`content(geo-seo): YYYY-MM-DD 周二资讯`。正文写：来源 URL、核对时间（Asia/Shanghai）、是否改了 `CACHE_VERSION`、**等待「合 main 上线」**。
6. 不要自动 merge，不要用管理员权限或既有自动同步工作流代合。用户未明示则停在 PR。

## Brief 字段（周衡交稿）

- 拟上线日与 `slot`（`tue` / `sat`；补刊用实际日期并说明）
- 或「本档跳过」及原因
- 每条：`id`、`title`、`source_url`、`source_name`、`type`、`summary`、`takeaway`、`tags`
- 已打开原文的确认（时间 + 页上关键句）
- 明确本条不涉及收益承诺，不改 checklist 正文
