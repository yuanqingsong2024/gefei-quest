# 出海小站练站营 · Phase 3 路线图

> 日期：2026-10-16（Asia/Shanghai）  
> 状态：执行中 · 默认决策已锁定 · **不再用选择器打断用户**  
> 线上：https://yuanqingsong2024.github.io/gefei-quest/  
> 前置：Phase 2（T46–T60）已完成

---

## 1. 目标

在站一作战室之上，落地 **站二作战室**：固定 Day1–7 + 薄 Starter（一词一岛着陆页）+ 作战手册，与主线 `q-s2-*` 同源勾选。

非目标：

- 站三同等作战室（Phase 4）
- 收益保证、付费课、云同步
- **周一知识补给 Bot**：仍 **不启用**（需用户亲口说恢复）
- 向用户发选择 widget

---

## 2. 范围

### In

| 块 | 说明 |
|----|------|
| 站二 Day1–7 数据 | `QuestData.STATION_TWO_DAYS` 绑定 `q-s2-*` |
| 作战室双站 Tab | 作战室内「站一 \| 站二」；站二全日程可见，灰锁至站一 Boss |
| 站二 Starter | `starters/station-two/` 英文一词着陆薄页 |
| 站二作战手册 | `docs/station-two-playbook.md` |
| 资源库 / 设置入口 | 链到站二手册、Starter、`#war-s2` |
| 部署 | push main → GitHub Pages |

### Out

- 新垂直类目大规模调研
- Bot 周更启用
- channels.json 拆分（Phase2 已取消，本 Phase 仍保持 data.js）

---

## 3. 架构决策（已锁定 · 无备选）

| # | 决策 |
|---|------|
| D1 | 作战室 **内部 Tab**：站一 / 站二（不新增主导航 Tab）。 |
| D2 | 站二 **全部 Day 可见**；勾选灰锁，直到存档含 `q-s1-boss` **或** 已解锁 `ch-stage2`。 |
| D3 | 单条任务仍受章节解锁约束（与任务板一致）；站级锁再叠加一层。 |
| D4 | Day1–7 **写死**在 `STATION_TWO_DAYS`；无路径分支、无「换赛道」。 |
| D5 | 勾选 = `QuestBoard.toggleQuest` 同源存档。 |
| D6 | Starter 放 `starters/station-two/`；占位 `TARGET_KEYWORD` / `yourkeyword.example`。 |
| D7 | 深链：`#war` = 站一；`#war-s2` = 站二子 Tab。 |
| D8 | 周更 Bot：**OUT OF SCOPE**。 |
| D9 | **禁止** 选择 widget；按 T61→… 递增执行。 |

---

## 4. 站二 Day1–7（固定）

| Day | 主题 | Quest IDs |
|-----|------|-----------|
| 1 | 蓝海侦察 | `q-s2-01`（可选 `q-s2-s1` `q-s2-s2`） |
| 2 | 一词一岛 | `q-s2-02` |
| 3 | 承接港上线 | `q-s2-03`（用 station-two Starter） |
| 4 | 抛出缆绳 | `q-s2-04`（可选 `q-s2-s3`） |
| 5 | 每周观星 | `q-s2-05` |
| 6 | 巩固观察窗 | 无强制主线（可选 `q-s2-s4`）；不挡推进 |
| 7 | 航道打通 | `q-s2-boss`（可选支线汇总） |

---

## 5. 里程碑与任务映射

| 次序 | 里程碑 | 任务 |
|------|--------|------|
| 1 | 文档 + TASKS | T61 |
| 2 | `STATION_TWO_DAYS` | T62 |
| 3 | 作战室双站 UI + 灰锁 | T63 |
| 4 | Starter + 手册 | T64–T65 |
| 5 | 资源库/设置/深链 | T66 |
| 6 | 部署 Pages | T67 |
| 7 | 自测 TESTLOG | T68 |

详细验收见 `TASKS.md` · **Phase 3 · T61+**。

---

## 6. 成功标准

- 打开作战室可见站一/站二切换；未通关站一 Boss 时站二可浏览但不可勾。
- 站一 Boss 完成后（或岛已解锁）站二可勾，与任务板同步。
- Starter / 手册 / `#war-s2` 线上可开。
- 无选择控件；Bot 周更仍关。

---

## 7. 给 Parent / Bot 的执行约定

- 按 `TASKS.md` Phase 3 递增实现，默认已锁，勿再问用户。
- 周一补给例行：勿启用。
