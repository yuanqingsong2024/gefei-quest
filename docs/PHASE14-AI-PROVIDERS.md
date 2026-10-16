# Phase 14 · AI 服务商列表（用户自管理）

## 数据（gefei-quest-ai-v1，追加式迁移）
```
{ mode, version: 2, activeId, providers: [ { id, name, format, baseUrl, apiKey, models[], model, headers[{k,v}], temperature, maxTokens } ],
  // Phase 13 旧字段 provider/baseUrl/apiKey/model/temperature 保留不删
}
```
- 首次读取到旧单配置（有 baseUrl）且没有 providers 时，自动生成一个服务商「我的服务商（迁移）」并设为当前。
- 仍不写入 gefei-quest-save-v1。

## 格式
| format | 请求 | 流式 | 模型列表 |
|---|---|---|---|
| openai（默认） | POST {base}/chat/completions，Bearer Key（可选） | SSE `choices[].delta.content` | GET {base}/models → data[].id |
| anthropic | POST {base}/v1/messages（base 以 /v1 结尾则 /messages），x-api-key、anthropic-version、anthropic-dangerous-direct-browser-access | SSE `content_block_delta.delta.text` | GET {base}/v1/models |
| ollama | POST {base}/api/chat（如 http://localhost:11434） | NDJSON `message.content` | GET {base}/api/tags → models[].name |

自定义请求头逐行 key/value，最后合并（可覆盖默认头）。Key 可留空（本地模型）。

## 界面
- 模式：Grok Bot（默认）/ 自定义。
- 自定义：服务商卡片列表（当前标记、设为当前、编辑、复制、删除、测试）；「从模板新建」（OpenAI、DeepSeek、通义、Kimi、智谱、OpenRouter、Anthropic、Ollama 本地、空白）。
- 编辑：名称、格式、Base URL、Key（password）、模型（自由输入 + 列表 datalist）、获取模型、模型列表（每行一个）、请求头行、温度、最大 tokens、测试连接、清除此 Key。
- 导入 / 导出 JSON（导出不含任何 Key；导入生成新 id，Key 为空）。
- 工具页 AI 按钮附近有小型服务商切换器。

## 测试
fake-openai.js 增加 /v1/models、/v1/messages（anthropic SSE）、/api/chat + /api/tags（ollama NDJSON）、自定义头断言。
