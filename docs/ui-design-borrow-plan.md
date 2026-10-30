# UI 设计借鉴方案（ai-design-skills → geifei-quest）

来源：[elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills) · `landing-page-design` PART B。  
本站是多意图 SPA（学习 / 实施 / 赚钱），**不改成单 CTA SaaS 落地页**；只吸视觉与交互规则。中文站**保留 CJK 字体栈**，不换 Geist/Manrope；不禁主题渐变；不动 money-rank / agent-money 数据管线。

## 摘取清单（做 / 不做）

| # | 规则 | 本站落地 |
|---|---|---|
| 1 | 字号阶梯 12/14/16/18/20/24/30/36；标题 `text-wrap: balance`，正文 `pretty` | tokens + 首页/赚钱页标题与正文；保留 PingFang/Noto/YaHei |
| 2 | 间距 token 2/4/8/12/16/24/32/40/48/64… | `tokens.css` 补齐 `--space-*`，与旧 `--sp-*` 对齐；首页区块与榜单卡片优先走 token |
| 3 | 嵌套圆角：外 − gap = 内（gap&lt;32） | 榜单卡 / 详情 panel / 首页玻璃卡内层 |
| 4 | 动效 `cubic-bezier(0.22,1,0.36,1)`；布局 ~500ms；hover ≥200ms；只动 transform/opacity；尊重 reduced-motion | 统一 `--ease` / `--duration-*`；按钮 active `scale(0.98)` |
| 5 | 滚动显现：IO，上移 ~32px + fade，进视口一次 | `js/shell.js` + `.reveal`；首页 band / 赚钱榜区块 |
| 6 | 导航浮层 + backdrop-blur | 顶栏轻微 inset + 毛玻璃；保留选中态与 `--nav-h` 垫高 |
| 7 | hover / active / focus / 空态 | 按钮与 rank/home 卡片补齐；空态保持插画+下一步 CTA |
| 8 | 赚钱页文案更具体、少空话；不承诺收益 | 开关标签、CTA、intro；**不改条目 JSON 数据** |

**明确不做：** 单 CTA 整站改造；禁背景渐变 / 换主题 / 禁 CJK；强制 Tagline 逐词揭示（首页可有一处静态利益点，非逐词）；引入 Tailwind / Material Icons；改 agent-money / rank JSON。

## 改哪些文件

| 文件 | 改动 |
|---|---|
| `docs/ui-design-borrow-plan.md` | 本方案 |
| `css/tokens.css` | `--space-*`、字号阶梯别名、`--ease` / duration、圆角嵌套变量 |
| `css/ui.css` | 顶栏浮层、reveal、首页/榜单字号与间距对齐、按钮态、嵌套圆角覆盖块 |
| `js/shell.js` | IntersectionObserver 滚动显现；`mountReveal`；nav 高度含 float 边距 |
| `js/home.js` | `data-reveal`；可选利益点文案；Top3 / CTA 更具体 |
| `js/rank.js` | 开关/CTA/空态文案；`data-reveal` |
| `js/agent-money.js` | 开关/intro/空态文案；`data-reveal` |
| `js/app.js` | 路由后调用 `mountReveal` |
| `js/changelog.js` + `daily.json` + `sw.js` | 更新日志 + CACHE +1 |

## 验收点

1. 首页与 `#war-rank` / `#war-rank-agent`：标题不孤字（balance）、区块滚动进场一次；关「减少动态效果」或系统 reduced-motion 时无位移动画。
2. 顶栏：轻微浮起 + 毛玻璃；学习/实施/赚钱选中态仍清晰；正文不被挡。
3. 榜单卡：外圆角与内 panel/step 圆角符合外−gap；按钮 hover≥200ms、active 略缩。
4. 文案：CTA 能看出下一步（看步骤与来源 / 加入本周实操）；免责声明仍在；JSON 条目名与字段未改。
5. `node tools/site-check.js`（或惯用本地静态预览）关键路由不挂；push `main` 后 Pages 刷新，必要时硬刷新或等 SW CACHE 升级。

## 第二轮：配图与更明显的视觉（2026-10-30，CACHE 42 / changelog #70）
用户反馈第一轮「看不出变化」。这轮加 4 张统一水墨风配图（`assets/art/*.webp`，均 < 140KB，无文字）：
- `hero-voyage.webp`：首页 hero 右侧大图（帆船载电脑驶向日出），标题上方加「挖词→上站→SEO→变现→放大」标签；≤860px 改上下排。
- `today-quest.webp`：首页「今天这一关」卡片右上角圆形插画。
- `rank-banner.webp`：每日赚钱榜日期行右侧横幅（桌面 92px 细条，守住 P18 的 3 屏上限；手机 2:1 置于日期上方）。
- `agent-banner.webp`：Agent 赚钱页顶部横幅（桌面 160px，手机 16:9）。
另加：hero 暖色/青色径向渐变、首页区块水墨分隔线、榜单卡片悬浮上浮。数据、主题切换、整站结构未改。

## 第三轮：每个主题一套配图（2026-10-30，CACHE 43 / changelog #71）
- 海岸青 `assets/art/ocean/`：水彩海岸风（白帆船+灯塔、沙丘木栈道走向灯塔、浅海踏石通往沙洲宝箱、海边小屋门廊机器人）。
- 像素暖沙 `assets/art/pixel/`：16-bit 像素风（粉帆小木船驶向晚霞、沙丘石阶插粉旗、检查点小旗通往藏宝箱、遮阳伞下机器人），`image-rendering: pixelated`，硬边框 + 像素投影。
- 水墨纸仍用 `assets/art/*.webp`。`js/theme.js` 新增 `QuestTheme.art/artAlt/refreshArt`：图片带 `data-art`，切主题时 `apply()` 自动换 src 与 alt。
- 配色抽成 `--art-*` 变量（暖/冷渐变、标签行、分隔线、横幅标签、卡片悬停阴影），三套主题各一组。SW 只预缓存水墨默认图，其它主题图走运行时缓存。
