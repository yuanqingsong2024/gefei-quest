# Phase 5 · 界面与模块设计

> 补充 Phase 2–4 作战室；放大子区。2026-10-16

---

## 1. 作战室内五站 Tab

```
┌────────────────────────────────────────────────────┐
│ 作战室                                              │
│ [站一] [站二] [站三] [变现] [放大]  ← war-station-tabs │
│ 进度 · 手册 ·（站一/二仍有 Starter）· 任务板          │
├────────────────────────────────────────────────────┤
│ Day1–7（当前站）；未解锁时灰锁 + 横幅                 │
└────────────────────────────────────────────────────┘
```

- `data-war-station="1|2|3|4|5"`（5 = 放大）
- 未解锁横幅：
  - 放大：「先完成变现港 Boss（升旗仪式）后再勾放大；可先浏览日程。」
- 灰锁：`.war-quest.is-locked` + `disabled`；整区 `.war-station-locked`
- 放大工具栏：**无 Starter 按钮**（仅手册 + 任务板）

## 2. 深链

| Hash | 行为 |
|------|------|
| `#war` / `#war-s1` | 作战室 · 站一 |
| `#war-s2` | 作战室 · 站二 |
| `#war-s3` | 作战室 · 站三 |
| `#war-m` | 作战室 · 变现 |
| `#war-x` | 作战室 · 放大 |

## 3. 数据

```js
SCALE_DAYS = [
  { day, title, tip, questIds, optionalQuestIds? },
  …
]
```

巩固日：`questIds: []` → `dayProgress.complete === true`（不挡「当前推进」）。

## 4. 手册（无厚 Starter）

| 文件 | 作用 |
|------|------|
| `docs/scale-playbook.md` | 放大 Day1–7 可打印：复用船体、一词一船、反空壳、下一站清单 |

## 5. activeStation

`QuestWarRoom` 内部：`1 | 2 | 3 | 4 | 5`；`setActiveStation` / `getActiveStation` 归一化非法值为 `1`。

## 6. 解锁函数

```js
function scaleInteractive(state) {
  return isDone(state, 'q-m-boss') || chapterUnlocked(state, 'ch-scale');
}
```
