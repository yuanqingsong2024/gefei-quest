# Phase 10 · 学习统计 + 今日任务 + 更新日志

## 目标
1. **学习统计** `#me-stats`（我的进度子页）：打卡热力图（近 26 周）、当前/最长连续天数、每周完成任务柱状图（近 12 周，纯 SVG）、各章节进度、选词练习板与站点台账汇总。
2. **今日任务** 卡片（首页顶部）：下 2–3 个未完成任务、连续天数、今日是否已打卡。
3. **更新日志** `#changelog`（我的进度子页 + 首页入口）：数据在 `js/changelog.js`；比 `save.lastSeenChangelog` 新的条目在顶栏「我的进度」和首页显示红点。
4. **daily.json**：站点根目录的机器可读文件，列出最新更新日志，供每日提醒读取。由 `tools/build-daily.js` 从 `js/changelog.js` 生成。

## 存档（只追加字段，key 仍为 gefei-quest-save-v1）
- `activity: { 'YYYY-MM-DD': count }`：每次有效存档（勾任务、领补给、工具保存）当天 +1。
- `doneDates: { questId: 'YYYY-MM-DD' }`：任务首次出现在 `done` 时记日期；撤销时删除。旧存档已完成但无日期的任务不计入周图（周图注明）。
- `lastSeenChangelog: number`：已读过的最新更新日志序号（条目 `id` 递增，同一天可多条），打开 #changelog 时更新。
- 记录集中在 `QuestSave.saveSave`，所有入口自动覆盖；quest id 不变。

## 连续天数
按 `activity` 的日期计算：今天或昨天有活动则当前连击延续；最长连击为历史最长连续日期段。

## 测试
site-check 增加 `me-stats`、`changelog` 路由与功能用例（勾任务后热力图今天有色块、周图有柱、红点出现/消失、daily.json 可取）。390px、file://、截图 p10-*.png。
