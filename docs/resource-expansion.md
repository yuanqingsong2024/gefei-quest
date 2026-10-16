# 资源库扩容配方

如何往练站营资源库加一条「可试渠道 / 羊毛」而不改 UI。

## 1. 加分类（少见）

编辑 `js/data.js`：

1. `TRY_CHANNEL_CATEGORIES` 追加 `{ id, name, emoji }`。
2. `id` 用英文短横线，如 `payments`。

`resources.js` 会自动生成筛选芯片。

## 2. 加一条渠道（常见）

在 `TRY_CHANNELS` 数组追加：

```js
{
  id: 'ch-xxx',          // 唯一
  cat: 'tools',          // 对应分类 id
  name: '显示名',
  blurb: '一句话是什么',
  how: '怎么试（可执行）',
  caveat: '注意/禁区/额度会变',
  url: 'https://…',      // 可空
}
```

刷新 `resources.html` 与设置摘要即可看见。

## 3. 同路人

追加 `PEER_METHODS`：`name / oneLiner / steal / caveat / url`。

## 4. 文档笔记

`js/resources.js` 内 `docs` 数组追加 `{ title, url }`（指向 `docs/*.md`）。

## 5. 以后可选 JSON

若 `data.js` 过大，可拆 `data/channels.json`，用 `fetch` 加载；**Phase 2 仍以 data.js 为准**，本配方即可扩。

## 6. 禁止

- 盗版、账号合租、游戏币点卡、学术代写等（见 `docs/channels-and-tips.md` §F0）。
- 收益保证文案。
