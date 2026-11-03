# OPC 周报（一人公司）

频道页：`#war-rank-opc`（导航「赚钱 → OPC 一人公司」）  
加载：`js/opc-data.js` 内嵌兜底 → `fetch data/opc-briefs/latest.json`  
页面只读本目录。采集方先写入工作区 `/workspace/opc-briefs/YYYY-MM-DD.json` 与 `latest.json`，再复制到这里，并同步 `js/opc-data.js` 里的 `QUEST_OPC`。

每周约 3 次（二 / 四 / 六）。changelog 可周更一条，不要按日刷。

## 文件

| 文件 | 说明 |
| --- | --- |
| `YYYY-MM-DD.json` | 当天快照 |
| `latest.json` | 与当天文件相同；前端只读这个 |

`latest.json` 可以是 `{ "updated", "items": [] }`，也可以是条目数组。

## 条目

| 字段 | 说明 |
| --- | --- |
| `date` | `YYYY-MM-DD`（Asia/Shanghai） |
| `title` | 标题，建议 ≤40 字 |
| `source_url` | 可打开的 http(s) 来源，优先 gov.cn / 市监 / 税务 |
| `region` | 全国 / 省 / 市 |
| `type` | `政策` \| `税务` \| `登记实务` \| `接活渠道` \| `合规案例` \| `工具` |
| `summary` | 一句话摘要，建议 ≤80 字 |
| `action` | 一句可执行的核对动作。不写收益承诺，不写灰产 |
| `tags` | 字符串数组 |
| `risk_level` | `info` \| `watch` \| `critical`（critical 只用于监管处罚或刑事类公开信息，或财产混同等硬红线） |

公开整理，不是法律、税务或投资意见，不承诺收益。
