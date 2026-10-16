# Phase 4 · 界面与模块设计

> 补充 Phase 2/3 作战室；站三 + 变现子区。2026-10-16

---

## 1. 作战室内四站 Tab

```
┌──────────────────────────────────────────────┐
│ 作战室                                        │
│ [站一] [站二] [站三] [变现]  ← war-station-tabs │
│ 进度 · 手册 ·（站一/二仍有 Starter）· 任务板    │
├──────────────────────────────────────────────┤
│ Day1–7（当前站）；未解锁时灰锁 + 横幅           │
└──────────────────────────────────────────────┘
```

- `data-war-station="1|2|3|4"`（4 = 变现）
- 未解锁横幅：
  - 站三：「先完成站二 Boss（航道打通）后再勾站三；可先浏览日程。」
  - 变现：「先完成站三 Boss（群岛连线）后再勾变现；可先浏览日程。」
- 灰锁：`.war-quest.is-locked` + `disabled`；整区 `.war-station-locked`
- 站三 / 变现工具栏：**无 Starter 按钮**（仅手册 + 任务板）；站一/二保持原样

## 2. 深链

| Hash | 行为 |
|------|------|
| `#war` / `#war-s1` | 作战室 · 站一 |
| `#war-s2` | 作战室 · 站二 |
| `#war-s3` | 作战室 · 站三 |
| `#war-m` | 作战室 · 变现 |

## 3. 数据

```js
STATION_THREE_DAYS = [
  { day, title, tip, questIds, optionalQuestIds? },
  …
]
MONETIZE_DAYS = [ /* 同上；Day4–6 questIds: [] */ ]
```

巩固日：`questIds: []` → `dayProgress.complete === true`（不挡「当前推进」）。

## 4. 手册（无厚 Starter）

| 文件 | 作用 |
|------|------|
| `docs/station-three-playbook.md` | 站三 Day1–7 可打印 |
| `docs/monetize-playbook.md` | 变现 Day1–7 + 信任页三件套 + AdSense 自检清单 |

## 5. activeStation

`QuestWarRoom` 内部：`1 | 2 | 3 | 4`；`setActiveStation` / `getActiveStation` 归一化非法值为 `1`。
