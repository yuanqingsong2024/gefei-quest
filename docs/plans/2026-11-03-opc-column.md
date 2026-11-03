# Plan · 2026-11-03 · 赚钱站「OPC 一人公司」栏目

> **状态**：IMPLEMENTED（PR pending merge）。  
> **门禁**：代码在 `feat/war-rank-opc`，只开 PR、不合 `main`。合 `main` 另须「合 main 上线」。  
> **拍板**：用户 2026-11-03 确认用现有陆晴+沈清，**不新建 bot**。  
> **调研**：`/workspace/opc-research/2026-11-03-opc-brief.md`

## 目标

在 gefei-quest「赚钱」下新增子页 **OPC 一人公司**（`#war-rank-opc`）：政策摘要、可做业务、接活渠道、风险红线、周报归档；数据来自陆晴每周 3 次采集（二/四/六）。

## 路由与导航

| 项 | 值 |
|----|-----|
| 菜单名 | OPC 一人公司（短标 OPC） |
| hash | `#war-rank-opc` |
| 挂载 | `js/nav.js` SITE_NAV → earn 分组，与 Agent 赚钱 / AI 羊毛并列 |
| desc | 一人公司政策摘要、可做业务与接活渠道；每周 3 次情报，不承诺收益 |

## 页内结构

1. 政策摘要（常青，链官网）  
2. 可做业务（精简合法清单 + 出海/闲鱼标签）  
3. 接活渠道（国内/海外）  
4. 风险红线  
5. 周报归档（读 `data/opc-briefs/*.json`）

## 数据

- 单条：`data/opc-briefs/YYYY-MM-DD.json`  
- 字段：date, title, source_url, region, type, summary, action, tags, risk_level  
- 可选周聚合：`data/opc-briefs/weeks/YYYY-Www.json`  
- changelog：可周更一条，勿日刷

## 实现顺序（获「做」后）

1. 静态页骨架 + nav 入口 + 空态  
2. 灌入调研精简常青块（政策/业务/渠道/红线）  
3. 接线 opc-briefs JSON 列表  
4. SW / changelog；PR；等「合 main 上线」

## 非目标

- 不新建独立 bot；不做法税代办；不承诺收益；不合规业务教程

## 验收

- [x] 赚钱菜单可见 OPC；`#war-rank-opc` 可打开  
- [x] 常青四块 + 归档列表；每条有可点来源  
- [x] 无收益承诺、无灰产引导  
