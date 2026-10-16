# Phase 2 · 界面与模块设计

> 补充 `DESIGN-SPEC.md`；Phase 2 新增屏幕与文件约定。  
> 2026-10-16

---

## 1. 新 Tab · 站一作战室（War Room）

### 位置

- 主导航：`地图 | 任务 | **作战室** | 商船 | 成就 | 资源库 | 设置`
- `data-tab="war"` · `#panel-war`
- 脚本：`js/war-room.js` · 全局 `QuestWarRoom`

### 布局

```
┌─────────────────────────────────────┐
│ 站一作战室                           │
│ 固定 Day1–7 · 勾选=任务板同源存档     │
│ [进度 3/12 主线]  [打开 Starter →]   │
├─────────────────────────────────────┤
│ Day 1 · 定规矩与主词          ●●○   │
│  ☑ q-p-01 读懂航海禁忌              │
│  ☐ q-p-02 选定职业牌                │
│  ☐ q-p-03 立下一词誓言              │
│  提示：今天写死类型+主词即可         │
├─────────────────────────────────────┤
│ … Day2–7 …                          │
└─────────────────────────────────────┘
```

### 交互

- 勾选框与任务板相同：调用 `QuestBoard.toggleQuest`。
- 岛未解锁时：该日任务显示锁定态，禁止勾选（与任务板一致）。
- 「打开 Starter」→ `./starters/station-one/`（新标签）。
- 「作战手册」→ `./docs/station-one-playbook.md`。
- **无路径选择**；无「换赛道」按钮。

### 视觉

- 复用 `.quest-card` / `.panel-head` / checkbox 样式。
- Day 标题用 `.war-day-head`；今日（按本机日期相对首次打开可选）可用 `.war-day-today` 描边——MVP 用「第一个未完成 Day」高亮即可。

---

## 2. Starter Kit · `starters/station-one/`

| 文件 | 作用 |
|------|------|
| `index.html` | 英文单页：title/h1 含 `YOURBRAND`；About / Privacy 锚点区；占位 GA/GSC meta 注释 |
| `README.md` | 替换清单 + GitHub Pages / Cloudflare Pages 部署步骤（中文为主，命令英文） |

约束：零构建、无框架、内联或同目录即可；HTTPS 由托管提供。

---

## 3. 资源库扩展

- 枢纽页：`resources.html`（已有）。
- 顶部增加 **站一工具条**：作战室（回 index `#war` 或说明）、Starter、作战手册。
- T51：搜索框过滤卡片文案（name/blurb/how）。
- 扩容配方：`docs/resource-expansion.md`。

深链：`index.html#war` 启动时切到作战室 Tab（`app.js` 读 hash）。

---

## 4. 存档导出/导入（T52）

- 设置页增加「导出 JSON」「导入 JSON」。
- 导出：下载 `gefei-quest-save-v1.json`。
- 导入：`FileReader` 或粘贴；`isValidSave` 失败则 toast 拒绝。
- schema 仍 `version: 1`。

---

## 5. 数据

```js
STATION_ONE_DAYS = [
  { day: 1, title: '…', tip: '…', questIds: ['q-p-01', …] },
  …
]
```

导出在 `QuestData.STATION_ONE_DAYS`。

---

## 6. 与 DESIGN-SPEC 关系

- 存档 schema **不破**（T52 仅读写）。
- 章节/解锁逻辑不变；作战室是视图层。
- 静音 / 体力 / 减少动态行为不变。
