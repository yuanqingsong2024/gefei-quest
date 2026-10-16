# Phase 13 · AI 设置与 AI 助手按钮

## 页面
`#me-ai`（我的进度子页「AI 设置」），搜索与页脚有入口。
- **模式 A · Grok Bot（默认）**：说明两个后台 agent：「赚钱榜雷达」每天发布每日赚钱榜，「赚钱项目实施官」帮你把计划落地。无需配置；想让 AI 分析某个词或方案，直接在 Grok Bot 聊天里说。
- **模式 B · 自定义（OpenAI 兼容）**：预设 OpenAI / DeepSeek / 通义 DashScope compatible-mode / Kimi Moonshot / 智谱 / OpenRouter / 自定义；Base URL、API Key（password 输入）、模型名、温度；「测试连接」；「忘记 Key」。

## 存储（安全）
- 全部 AI 配置存独立 localStorage key `gefei-quest-ai-v1`，**不进** `gefei-quest-save-v1`，因此不会出现在存档导出中。
- 页面醒目警告：Key 明文存在本浏览器；建议用有额度上限的 Key；公共电脑用完点「忘记 Key」。
- 请求直接从浏览器发往服务商，不经过本站。

## 调用
- `POST {baseUrl}/chat/completions`，`stream: true`，解析 SSE；不是 event-stream 时回退整段 JSON。
- 错误提示：网络/CORS、401/403（Key）、404（Base URL 或模型）、429（限流/余额）、400、其他。
- 输出用站内 markdown 渲染器（先转义 HTML），并去掉非 http(s)/# 链接与脚本。

## AI 按钮
| 位置 | 按钮 | 内容 |
|---|---|---|
| 选词练习板每个词 | AI 分析这个词 | 搜索意图、竞争判断、长尾、页面结构、下一步 |
| 每日赚钱榜每张卡 | AI 点评/生成今日步骤 | 适合度、风险、今天 30–60 分钟步骤 |
| 站一实操助手 | AI 生成 title/描述 | 3 组 title（≤60）+ description（120–160）+ H1 |

Grok Bot 模式下按钮显示提示：去 Grok Bot 聊天找「赚钱项目实施官」，并链接到 AI 设置。

## System prompt
中文；只给合法合规建议；拒绝盗版、账号买卖、游戏币点卡、代写、刷量、灰黑产；不承诺收益（提到收入须注明不保证）；规则以官网为准。

## 测试
`tools/fake-openai.js` 本地假服务（CORS、SSE、401、404）；site-check 覆盖设置、存储隔离、忘记 Key、测试连接四种结果、三个按钮流式输出与净化、Grok 模式提示、搜索/页脚、390px。
