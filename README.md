# 出海小站练站营

本地单页轻 RPG：把哥飞公开的「挖词 → 上站 → SEO → 变现 → 放大」拆成可勾选关卡。  
**勾选 = 你承认线下这步已经做完**（游戏不能替你建站）。


## 资源库

分类浏览免费工具、托管、变现、可试路径、闲鱼·非实物、技巧与同路人方法：打开 [`resources.html`](./resources.html)，或主界面「资源库」页签。

## Phase 2（进行中）

完整开发方案与任务：[`docs/PHASE2-ROADMAP.md`](./docs/PHASE2-ROADMAP.md) · 界面补充 [`docs/PHASE2-DESIGN.md`](./docs/PHASE2-DESIGN.md) · 任务 `TASKS.md` **Phase 2 · T46+**。

- **站一作战室**：主站 Tab「作战室」（固定 Day1–7，不选路径）
- **Starter 模板**：[`starters/station-one/`](./starters/station-one/)（英文单页 → GH/CF Pages）
- **作战手册**：[`docs/station-one-playbook.md`](./docs/station-one-playbook.md)
- **周一知识补给 Bot 例行**：仍暂停；**需你明确说「恢复周一补给」后再开**（本仓库不自动启用）

## 如何打开


1. 用浏览器打开本目录下的 [`index.html`](./index.html)（双击或拖进 Chrome / Edge / Safari / Firefox）。
2. 无需安装、无需账号、无需联网即可打卡（点外链时才需要网）。
3. 建议用同一浏览器；清站点数据会丢进度。

也可在本目录起一个静态服务，例如：

```bash
cd gefei-quest
python3 -m http.server 8765
# 浏览器访问 http://127.0.0.1:8765/
```

## 怎么玩

| Tab | 作用 |
|-----|------|
| **地图** | 六座岛：序章 → 站一 → 站二 → 站三 → 变现港 → 放大。点已解锁岛进任务。 |
| **作战室** | 站一固定 Day1–7 清单；勾选与任务板同源。 |
| **任务** | 勾选完成；展开看「动作 / 工具 / 标准 / 坑」。Boss 通关解锁下一岛。 |
| **商船** | 每周知识补给样例；「收入图鉴」领 +5 XP（每条一次）。 |
| **成就** | 至少 10 枚徽章，解锁条件见卡片。 |
| **设置** | 静音（默认开）、体力（默认关）、减少动态、重置存档、**可试渠道/羊毛**（含闲鱼·非实物）、**同路人方法**、资料柜外链。 |

等级只改称号，**不锁关卡内容**。取消勾选会撤回 XP；若因此破坏通关，下一岛会重新上锁。

## 进度存在哪

- `localStorage` 键名：`gefei-quest-save-v1`
- 仅本机本浏览器；换设备/无痕/清缓存会丢
- 重置：设置 → 重置存档 → 输入「重置」确认

## 周更（知识补给）怎么更新

- 数据在 `js/data.js` 的 `WEEKLY_UPDATES` 数组里追加条目即可（见 `docs/weekly-template.md`）。
- **只追加内容，禁止清空或覆盖用户存档。**
- 由 Grok Bot 做「每周一知识补给」例行：**当前为暂停状态**；需你明确说「恢复周一补给」后再开。无新料则保持安静。

## 相关文档

- `DESIGN-SPEC.md` — 详细设计规格
- `docs/PHASE2-ROADMAP.md` — Phase 2 路线图
- `docs/PHASE2-DESIGN.md` — Phase 2 界面设计
- `TASKS.md` — 开发任务清单（含 T46+）
- `TESTLOG.md` — 自测记录
- 学习方案：`../gefei-seo-playbook.html`
- 同路人调研：`docs/peer-methods.md`
- 可试渠道/羊毛（含**闲鱼·非实物**）：`docs/channels-and-tips.md`
- 公开文入口：https://new.web.cafe/tutorial/ww4r3rsllv

## 诚实声明

- 不收益承诺；案例收入 ≠ 你的收入。
- 不复刻付费社群生意；只整理公开方法与可执行清单。
- 不做账号 / 云同步 / 排行榜（MVP）。
