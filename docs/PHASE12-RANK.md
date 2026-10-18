# Phase 12 · 每日赚钱榜

## 页面
`#war-rank`（实战作战室子页「每日赚钱榜」），首页卡片、全站搜索、页脚均有入口。
- 当天 Top 10 卡片：名次、名称、类型、成本、难度（1–5）、适合谁、为什么、步骤、风险、来源链接、标签。
- 类型筛选 + 「只看收藏」；收藏存 `save.rankFav`（[名称]，追加字段）。
- 「加入实操计划」：写入 `save.rankPlan`（[{name,type,date,steps,done}]），在榜单页顶部和站一实操助手页显示「我的实操计划」，可勾完成/删除。
- 历史：日期下拉切换 `data/rank-history/<date>.json`。
- 醒目免责声明：仅为公开渠道整理，不保证收益；规则、地区与费率以官网为准。

## 数据
- `data/rank.json`：{ date, items[10] }，item = {rank,name,type,cost,difficulty,fit,why,steps[],risk,source_url,tags[],sources:[{title,url,publisher,published,kind,checked}], resell?}。`source_url` = 第一条来源的 url。详见 `docs/PHASE24-SOURCES.md`。
- 可选 `resell`：`{ product, buyers, expires }`。`product` 是可卖的原创攻略/清单/模板，`buyers` 是目标买家，`expires` 是到期下架日（`YYYY-MM-DD` 或 `''`）。没有该字段的条目照常通过。只卖原创整理的攻略，不卖账号、券码或代领。卡片在正面显示「闲鱼方案」，当天至少有一条时出现筛选。格式示例在 `data/rank-sample.json`（全是【示例】，可以多于 10 条，脚本只校验、不发布）。给「赚钱榜雷达」agent 的字段说明见 README「每日赚钱榜发布」。
- `data/rank-history/<date>.json` + `index.json`（日期列表，新→旧）。
- `js/rank-data.js`：最近 14 天内嵌，保证 file:// 也能看（fetch 失败时回退）。

## 发布
`node tools/publish-rank.js <file.json>`：校验 → 写 rank.json / 历史 / index / rank-data.js → 更新日志加「赚钱榜」条目（同日替换）→ 重建 daily.json。之后 `git add -A && git commit && git push`。

## 合规
只收录合法渠道；不收盗版、账号买卖、游戏币点卡、代写、刷量。
