# 每日执行包（daily-packs）

赚钱项目实施官每天产出的**可公开**执行材料归档目录。

## 从哪天开始

- **起始日：2026-10-28**（示例日已入库）
- 更早日期（10/17–10/27）的附件仍在实施官本地 `attachments/`；需要时可按同结构补档。

## 怎么打开

| 入口 | URL |
|---|---|
| 列表页（推荐） | https://yuanqingsong2024.github.io/gefei-quest/daily-packs/ |
| 索引 JSON | https://yuanqingsong2024.github.io/gefei-quest/data/daily-packs/index.json |
| 最新一日 | https://yuanqingsong2024.github.io/gefei-quest/data/daily-packs/latest.json |
| 某日目录 | `…/data/daily-packs/YYYY-MM-DD/` |

GitHub 浏览：`https://github.com/yuanqingsong2024/gefei-quest/tree/main/data/daily-packs`

## 收录什么

- 今日执行卡、选词/工作表、闲鱼上架文案与接单表、工具站草稿与部署备忘
- **不收录**：客户私聊原文、账号/凭证、真实订单隐私；`money-rank-*.json`（已有 `data/money-rank/`）

## 目录约定

```
data/daily-packs/
  README.md
  index.json          # 全部日期列表（新→旧）
  latest.json         # 最新一日 manifest 副本
  YYYY-MM-DD/
    manifest.json     # 当日摘要 + 文件清单
    …公开文件…
```

同步脚本：`tools/sync-daily-pack.sh`
