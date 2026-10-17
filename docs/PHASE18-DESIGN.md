# Phase 18 · 免费工作台收尾 + 紧凑页面设计（设计稿）

原则：免费优先。只用免费的官方能力；Cloudflare Worker / 付费 API 全部标为「以后可选」，本期不做。

## A. 免费工作台功能

### A1. Google 连接（浏览器内，Google Identity Services token client）
- **不需要后端、不需要 client secret**：用户在自己的 Google Cloud 项目建「OAuth 客户端 ID（Web 应用）」，授权 JavaScript 来源填 `https://yuanqingsong2024.github.io`（本地测试再加 `http://localhost:8765`），把 Client ID 填到 #me-accounts「Google 连接」。
- 流程：点「连接 Google」→ 懒加载 `https://accounts.google.com/gsi/client` → `google.accounts.oauth2.initTokenClient({ client_id, scope, callback })` → `requestAccessToken()` 弹出 Google 授权 → 得到约 1 小时有效的 access token。
- Scope（只读）：`webmasters.readonly`、`analytics.readonly`、`adsense.readonly`（用户可只勾选需要的）。
- 存储：Client ID 存 `gefei-quest-accounts-v1`；access token 只存 sessionStorage（关闭标签页即失效），不进存档导出、不进仓库。
- 拉取（均为官方 REST，支持浏览器 CORS + Bearer token）：
  - GSC：`GET webmasters/v3/sites` 列出属性；`POST webmasters/v3/sites/{site}/searchAnalytics/query`，按 `date`（近 90 天）和 `query`（近 28 天前 250）各拉一次。
  - GA4：`GET analyticsadmin v1beta/accountSummaries` 列出媒体资源；`POST analyticsdata v1beta/properties/{id}:runReport`（date × activeUsers、screenPageViews、sessions，近 90 天）。
  - AdSense：`GET adsense v2/accounts`；`GET v2/{account}/reports:generate?dateRange=LAST_30_DAYS&dimensions=DATE&metrics=ESTIMATED_EARNINGS,PAGE_VIEWS,CLICKS,IMPRESSIONS`。
- 写入：转换成与 CSV 导入相同的数据集格式（gsc-dates / gsc-queries / ga4 / adsense，`via: 'api'`），同站同类的旧 API 数据集被替换；站点在台账里关联了 GSC 属性 / GA4 媒体资源后，按月汇总写入台账（AdSense 为账户级，可选写入一个站）。
- 自动刷新：打开 #me-analytics 或 #work 时，若本会话 token 仍有效且距上次拉取 > 6 小时 → 静默拉取；token 过期则显示「重新连接」按钮（浏览器会拦截非用户手势的弹窗，所以不强行弹）。
- 测试：API 地址可在配置中覆盖到假服务器；测试注入假的 `google.accounts.oauth2`。

### A2. 流水线 + 工作台 #work
- 流水线 6 步：选词 → 实操助手 → 发布 → 分发 → 数据 → 复盘。
- #work：每个站（台账 + 尚未登记的实操助手草稿）一张卡：6 步状态、**下一步该做什么**（第一个未完成步骤 + 直达按钮）、最近 28 天点击/曝光/收入（有数据时）。顶部：本周进度、Google 连接状态与「立即刷新」。

### A3. 每周复盘 #work-review
- 自动带出本周事实：完成任务数、发布次数、分发次数、导入/拉取次数、点击与曝光（较上周）。
- 模板字段：本周做了什么 / 数据变化 / 学到了什么 / 下周 3 件事 / 风险与卡点；可选关联站点。
- 存档追加字段 `reviews`；可复制为 Markdown；AI 复盘按钮（走 AI 设置，不承诺收益）。

### 以后可选（本期不做）
Cloudflare Worker 代理、Cloudflare Pages 发布、Pinterest API、任何付费 API。

## B. 紧凑页面设计系统

### 现状（Phase 18 前，空存档，单位：屏 = 页面高度 / 视口高度）
数据见 `data/page-heights-before.json`（`tools/page-heights.js` 生成）。超标（>2.5 桌面屏）的：首页 5.96、资源库 7.08、平台变现国内 6.57 / 图文 6.92 / 短剧 4.89 / 海外视频 3.89、赚钱榜 4.82、周报 5.05、更新日志 4.45、作战室 3.1–3.65、实操助手 3.64、账号中心 4.03、手册 4.0+、开发文档（TASKS 37.5）。另外页脚本身 472px（≈0.6 屏）。

### 目标
每页 ≤ 约 2.5 个桌面屏（1280×800）；手机端相应缩短。**不删内容、不改路由和锚点**：所有内容仍在 DOM 中，被折叠/分页的内容在被定位（目录跳转、锚点、站内链接）时自动展开。

### 组件（js/compact.js，统一样式）
| 组件 | 用途 |
| --- | --- |
| `tabs` 页内标签 | 同级大区块（首页各栏目、实操助手 2–4 步、平台变现「对比表 / 平台详情」） |
| `collapse` 可折叠卡/区块 | 卡片保留标题 + 关键信息，次要内容收进「展开」（作战室非今日的 Day、赚钱榜卡、平台卡、账号平台、文档小节） |
| `details/summary` 统一样式 | 表格、说明、阶段说明 |
| `more` 「显示更多」 | 默认展示前 N 张（资源库总览每类 3、更新日志 6） |
| `paginate` 分页 | 长列表：资源库分类页、平台变现卡、赚钱榜、周报、闯关任务、账号平台 |
| 吸顶子导航 | 标签条吸顶；平台变现国内页分类吸顶 |
| 紧凑卡 | 说明文字 2 行截断（悬停/展开看全文） |
| 紧凑页脚 | 链接改为行内排列，桌面高度约减半 |
| `reveal(el)` | 任何被折叠/分页/标签隐藏的元素被定位时自动展开 |

实现方式：渲染后由 MutationObserver 统一按选择器规则处理（幂等，处理过的元素打标记），各页面渲染代码基本不改。

## 任务
- T172 设计稿（本文）+ 页面高度基线
- T173 紧凑组件 + 全站规则 + 紧凑页脚
- T174 Google 连接（GIS token client）+ 拉取 + 写入数据分析/台账 + 自动刷新（假服务器测试）
- T175 #work 工作台 + 6 步流水线
- T176 #work-review 每周复盘
- T177 测试、前后高度记录、截图、推送
