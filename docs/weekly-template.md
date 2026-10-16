# WEEKLY_UPDATES 追加模板

把下面对象追加进 `js/data.js` 的 `WEEKLY_UPDATES` 数组（**只追加，不删旧 id**）：

```js
{
  id: "w-2026-10-20-a",          // 全局唯一
  week: "2026-W43",
  title: "卷轴标题",
  summary: "两到四句摘要，不要整页搬运原文。可含要点与注意。",
  url: "https://example.com/optional", // 可空字符串
  tags: ["GSC", "新词"],
  xp: 5,
  addedAt: "2026-10-20"
}
```

领取后用户存档里的 `weeklyClaimed` 会记下 `id`，故 **id 不可复用**。
