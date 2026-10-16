# 出海小站练站营 · Phase 4 路线图

> 日期：2026-10-16（Asia/Shanghai）  
> 状态：**执行中 → 完成后改为已完成** · 默认决策已锁定 · **不再用选择器打断用户**  
> 线上：https://yuanqingsong2024.github.io/gefei-quest/  
> 前置：Phase 2（T46–T60）、Phase 3（T61–T68）已完成

---

## 1. 目标

在站一 / 站二作战室之上，落地 **站三作战室** 与 **变现港作战室**：固定 Day1–7（变现港含巩固日）+ 作战手册（优先文档，不做厚 Starter），与主线 `q-s3-*` / `q-m-*` 同源勾选。

非目标：

- 放大航线（`ch-scale`）同等作战室（Phase 5+）
- 收益保证、付费课、云同步
- **周一知识补给 Bot**：仍 **不启用**（需用户亲口说恢复）
- 向用户发选择 widget
- 厚 HTML Starter（信任页 / AdSense 以 playbook 清单为主）

---

## 2. 范围

### In

| 块 | 说明 |
|----|------|
| 站三 Day1–7 | `QuestData.STATION_THREE_DAYS` 绑定 `q-s3-*` |
| 变现 Day1–7 | `QuestData.MONETIZE_DAYS` 绑定 `q-m-*`（主线少 → 巩固日 + 支线） |
| 作战室四站 Tab | 「站一 \| 站二 \| 站三 \| 变现」；灰锁规则见 D2/D3 |
| 站三 / 变现手册 | `docs/station-three-playbook.md`、`docs/monetize-playbook.md`（含信任页三件套 + AdSense 自检） |
| 资源库 / 设置入口 | 链到手册、`#war-s3`、`#war-m` |
| 部署 | push main → GitHub Pages |

### Out

- 新垂直类目大规模调研
- Bot 周更启用
- `starters/station-three/` 厚模板（可选极薄 trust 片段不进本 Phase）
- channels.json 拆分

---

## 3. 架构决策（已锁定 · 无备选）

| # | 决策 |
|---|------|
| D1 | 作战室 **内部 Tab**：站一 / 站二 / 站三 / 变现（不新增主导航 Tab）。 |
| D2 | 站三 **全部 Day 可见**；勾选灰锁，直到存档含 `q-s2-boss` **或** 已解锁 `ch-stage3`。 |
| D3 | 变现 **全部 Day 可见**；勾选灰锁，直到存档含 `q-s3-boss` **或** 已解锁 `ch-monetize`。 |
| D4 | 单条任务仍受章节解锁约束；站级锁再叠加一层。 |
| D5 | Day1–7 **写死**在 `STATION_THREE_DAYS` / `MONETIZE_DAYS`；无路径分支。 |
| D6 | 勾选 = `QuestBoard.toggleQuest` 同源存档。 |
| D7 | **不做** 站三/变现厚 Starter；手册内嵌信任页与 AdSense 清单即可。 |
| D8 | 深链：`#war`/`#war-s1`=站一；`#war-s2`=站二；`#war-s3`=站三；`#war-m`=变现。 |
| D9 | 周更 Bot：**OUT OF SCOPE**。 |
| D10 | **禁止** 选择 widget；按 T69→… 递增执行。 |

---

## 4. 站三 Day1–7（固定）

| Day | 主题 | Quest IDs |
|-----|------|-----------|
| 1 | 绘制群岛海图 | `q-s3-01` |
| 2 | 填海造岛 | `q-s3-02` |
| 3 | 架起群岛桥梁 | `q-s3-03` |
| 4 | 更新航海图 | `q-s3-04` |
| 5 | 继续抛缆 | `q-s3-05` |
| 6 | 巩固与质检 | 无强制主线；可选 `q-s3-s1` |
| 7 | 群岛连线 | `q-s3-boss`（可选支线汇总） |

---

## 5. 变现港 Day1–7（固定）

| Day | 主题 | Quest IDs |
|-----|------|-----------|
| 1 | 阅读港口法令 | `q-m-01` |
| 2 | 三选一旗帜 | `q-m-02` |
| 3 | 清理甲板 | `q-m-03` |
| 4 | 信任页预习 | 无强制主线；可选 `q-m-s2` |
| 5 | 门槛与联盟 | 无强制主线；可选 `q-m-s3` `q-m-s4` |
| 6 | 收款与闲鱼草稿 | 无强制主线；可选 `q-m-s1` `q-m-s5` `q-m-s6` |
| 7 | 升旗仪式 | `q-m-boss`（可选支线汇总） |

---

## 6. 里程碑与任务映射

| 次序 | 里程碑 | 任务 |
|------|--------|------|
| 1 | 文档 + TASKS | T69 |
| 2 | `STATION_THREE_DAYS` + `MONETIZE_DAYS` | T70 |
| 3 | 作战室四站 UI + 灰锁 + 深链 | T71 |
| 4 | 站三 / 变现手册 | T72–T73 |
| 5 | 资源库/设置/RESOURCES | T74 |
| 6 | 部署 Pages | T75 |
| 7 | 自测 TESTLOG | T76 |

详细验收见 `TASKS.md` · **Phase 4 · T69+**。

---

## 7. 成功标准

- 打开作战室可见四站切换；未通关站二 Boss 时站三可浏览但不可勾；未通关站三 Boss 时变现同理。
- 解锁后可勾，与任务板同步。
- 手册 / `#war-s3` / `#war-m` 线上可开。
- 无选择控件；Bot 周更仍关。

---

## 8. 给 Parent / Bot 的执行约定

- 按 `TASKS.md` Phase 4 递增实现，默认已锁，勿再问用户。
- 周一补给例行：勿启用。
