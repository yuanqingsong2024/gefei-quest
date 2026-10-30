# Plan：SERP 标题拆解便签（首页挖词候选卡旁）

日期：2026-10-30  
状态：已批准（用户回复「做」）  
分支：只推 `origin/develop`，**不要合 main**

## 目标

在首页「挖词候选卡」旁（同一 slot 内、候选卡下方或内部紧挨）增加可折叠小块 **「SERP 标题拆解便签」**：

- 本机粘贴最多 **3 条** 搜索结果标题（多行文本，一行一条）
- **纯前端**解析：每条标出词长、是否含数字/年份、常见修饰词；并生成一句「可仿写骨架」
- **不调外部 AI、无外链请求**
- 结果可 **一键填入** 候选卡表单的「拟标题」字段（`[data-kw="title"]`）
- 数据只存本机 localStorage（与挖词候选卡风格一致）
- 折叠块 **默认收起**；短页友好

## 实现要点

### 代码落点（优先改现有文件，少新建）

1. **`js/keyword-card.js`**（首选）  
   - 在 `mount()` 的 `paint()` HTML 里，挖词候选卡 `</details>` **之后**（同一 container）再渲染一个 `details.serp-note`（或 `kw-serp`）折叠块。  
   - 或在 `kw-card-body` 底部嵌套第二个折叠块亦可，但须保证：挖词卡与 SERP 便签的 open 状态可分别持久化；SERP **默认收起**。  
   - 解析逻辑纯函数：输入多行文本 → 取非空行最多 3 条 → 每条输出 `{ text, len, hasNumber, hasYear, modifiers[], skeleton }`。  
   - 「可仿写骨架」：去掉具体品牌/年份数字后留下结构，例如 `How to {动作} {对象} in {年份}` / `{数字} Best {对象} for {人群}`；中英文标题都要能出一句可读骨架（中文 UI）。  
   - 「填入拟标题」：把骨架或用户选中的那条标题写入同 container 内 `[data-kw="title"]`；若候选卡未展开则先展开候选卡并 toast。  
   - localStorage key 建议：`gefei-serp-note-v1`，结构 `{ open: false, raw: '', lastAt }`；刷新后恢复粘贴文本与展开态（open 默认 false）。

2. **`css/ui.css`**  
   - 在「挖词候选卡」样式段落后追加 `.serp-note` / `.kw-serp` 样式，复用 `.kw-hint`、`.btn`、`.cx-details` 等现有 token，窄屏友好。

3. **不必改 `home.js`**（已有 `.home-kw-slot` + `QuestKeywordCard.mount`），除非 mount 返回值或 slot 结构需要微调。

4. **`js/changelog.js`**：最前新增 id **67**（今日 2026-10-30），tag `新功能`，href `#home-today`。  
5. **`sw.js`**：`CACHE_VERSION` **38 → 39**。  
6. 运行 **`node tools/build-daily.js`** 更新 `daily.json`。

### 解析规则（验收用，可微调但须可测）

对每条标题 `t`：

- **词长**：按空白分词的 token 数（英文）；若几乎无空格则用字符数并标注「字」；UI 同时显示字符数更直观也可（如「12 词 / 58 字」）。至少显示一种长度。  
- **含数字**：`/\d/`  
- **含年份**：`/\b(19|20)\d{2}\b/` 或中文四位年  
- **常见修饰词**（命中则列出）：best, top, free, how to, vs, review, guide, for, 最好, 免费, 怎么, 教程, 对比, 指南, 最新 等（大小写不敏感）  
- **可仿写骨架**：用占位符替换年份→`{年份}`、连续数字→`{数字}`，保留修饰词与介词结构；若只有 1 条也可生成；0 条则提示「先粘贴 1–3 行标题」。

### UI 文案（中文）

- summary：`SERP 标题拆解便签`  
- hint：从谷歌结果页复制最多 3 条标题，本机拆解词长 / 数字年份 / 修饰词，并生成可仿写骨架；不上传、不调外部 AI。  
- textarea placeholder：每行一条标题，最多 3 行  
- 按钮：`拆解`、`填入拟标题`（填骨架）、可选「用此条填入」在每条结果旁  
- 空态 / 错误：友好 toast，不抛异常

## 验收标准

1. 折叠块默认收起；展开可粘贴 1–3 行并点「拆解」出结果  
2. 每条显示：词长（或字数）、含数字/年份否、常见修饰词  
3. 生成可仿写骨架；一键填入候选卡「拟标题」  
4. 无外部网络请求；刷新后 raw/open 合理持久（优先）  
5. CACHE 39 + changelog #67；**只推 develop**

## 禁止

- 合 main / 推 main  
- 调用任何外部 AI / fetch 第三方 SERP API  
- 大改导航或首页布局

## 自测建议

- 本地 `python3 -m http.server` 打开 `#home-today`  
- 粘贴例如：
  ```
  Best Free PDF Merge Tools for Mac 2026
  How to Merge PDF Files Online Without Watermark
  免费 PDF 合并工具对比：Mac 用户怎么选
  ```
- 确认拆解与「填入拟标题」；刷新后便签内容仍在且默认收起（若曾收起）或按持久 open  
- `node tools/site-check.js` 若过慢可只跑与 home 相关断言；至少保证无 JS 语法错误
