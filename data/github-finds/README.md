# 工具发掘（GitHub Finds）

频道页：`#war-tools`（导航「赚钱 → 工具发掘」）  
加载：`js/github-finds-data.js` 内嵌兜底 → `fetch data/github-finds/latest.json`  
发布方：工具发掘大师（工作日约 3 项目 + 2 生活；周末约 3 生活）

## 文件约定

| 文件 | 说明 |
|------|------|
| `YYYY-MM-DD.json` | 当天完整快照（保留历史） |
| `latest.json` | 与当天文件内容相同；前端只读这个 |

无需 webhook / 后端 API。推到 `main` 后 GitHub Pages 约 1 分钟生效。

## Schema

```json
{
  "date": "YYYY-MM-DD",
  "updated": "2026-10-28T10:40:00+08:00",
  "weekday": "weekday",
  "items": [ /* 见下 */ ]
}
```

- `weekday`：`weekday` | `weekend`（按发布日，不是按条目）
- 可选顶层 `sample: true`：样例/假数据，正式发布请去掉

### item

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✓ | 稳定 slug，如 `near-agent-market` |
| `rank` | ✓ | 当日排序，从 1 起 |
| `name` | ✓ | 标题 |
| `category` | ✓ | 仅 `项目` 或 `生活` |
| `summary` | ✓ | 一句话摘要（列表卡展示） |
| `why` | ✓ | 为什么值得看 |
| `url` | ✓ | 主页或 repo 的 http(s) URL |
| `repo` | | `owner/name` |
| `stars` | | GitHub star 数（数字） |
| `tags` | | `string[]` |
| `steps` | | 怎么用 / 怎么跟进 |
| `risk` | | 注意点（不写收益承诺） |
| `sources` | | `[{ "title", "url" }]` |

工作日典型：3×`项目` + 2×`生活`。周末典型：3×`生活`。

## 发布步骤（工具发掘大师）

1. 写好当天 JSON（可先本地校验：必有 `date` / `updated` / `weekday` / `items[]`，每条有 `id`/`rank`/`name`/`category`/`summary`/`why`/`url`）。
2. 保存为：
   - `data/github-finds/YYYY-MM-DD.json`
   - `data/github-finds/latest.json`（内容相同）
3. （可选）同步内嵌兜底，方便 `file://`：把 JSON 塞进 `js/github-finds-data.js` 的 `QUEST_GITHUB_FINDS`（或跑 `node tools/publish-github-finds.js path/to.json`）。
4. 提交并推 **main**（Pages 源）：

```bash
git add data/github-finds/YYYY-MM-DD.json data/github-finds/latest.json js/github-finds-data.js
git commit -m "github-finds YYYY-MM-DD"
git push origin HEAD:main
```

5. 打开 https://yuanqingsong2024.github.io/gefei-quest/#war-tools 强刷核对。

**不要**承诺收益；文案避免「稳赚」「躺赚」。正式数据去掉 `sample` 与名称里的「【样例】」。
