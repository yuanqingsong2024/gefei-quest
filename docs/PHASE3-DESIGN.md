# Phase 3 · 界面与模块设计

> 补充 Phase 2 作战室；站二子区。2026-10-16

---

## 1. 作战室内双站 Tab

```
┌─────────────────────────────────────┐
│ 作战室                               │
│ [ 站一 ] [ 站二 ]   ← war-station-tabs │
│ 进度 · Starter · 手册 · 任务板        │
├─────────────────────────────────────┤
│ （站一：既有 Day1–7）                 │
│ 或                                   │
│ （站二：Day1–7；未解锁时灰锁 + 横幅）   │
└─────────────────────────────────────┘
```

- `data-war-station="1|2"`
- 未解锁横幅文案：「先完成站一 Boss（呼名）后再勾站二；可先浏览日程。」
- 灰锁：`.war-quest.is-locked` + `disabled`；整区可加 `.war-station-locked`

## 2. 深链

| Hash | 行为 |
|------|------|
| `#war` / `#war-s1` | 作战室 · 站一 |
| `#war-s2` | 作战室 · 站二 |

## 3. Starter · `starters/station-two/`

| 文件 | 作用 |
|------|------|
| `index.html` | 一词着陆：`TARGET_KEYWORD` 进 title + 唯一 h1；短 FAQ / CTA 区 |
| `README.md` | 替换清单 + 部署；对应 `q-s2-03` |

## 4. 数据

```js
STATION_TWO_DAYS = [
  { day, title, tip, questIds, optionalQuestIds? },
  …
]
```

Day6：`questIds: []` → `dayProgress.complete === true`（巩固日不挡「当前推进」）。
