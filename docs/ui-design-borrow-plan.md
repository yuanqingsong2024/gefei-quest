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

## 第四轮：非首页页面背景（2026-10-30，CACHE 44 / changelog #72）
`js/app.js` `pageBgScene(route)` 给 body 写 `data-bg`，`css/themes.css` 按 `html[data-theme] body[data-bg]` 设 `--page-art`，`.page-bg::before` 铺图、`::after` 叠上浓下淡的底色遮罩；首页不受影响。图已与主题底色 30% 混合降对比（每张 12–33KB）。
| 场景 | 路由 | 水墨纸 | 海岸青 | 像素暖沙 |
|---|---|---|---|---|
| learn | #start #path* | 竹林书案 | 帆船学校码头+读书长椅 | 草地小学堂+路牌 |
| build | #war* #work* (除下) | 水车工坊+石拱桥 | 港口船坞+吊机 | 铁匠工坊 |
| earn | #war-rank(-xianyu/-ai-life) | 水乡集市灯笼货船 | 港口条纹集市 | 像素集市摊位 |
| agent | #war-rank-agent #war-tools | 星图连线+梅枝 | 海底水母光束 | 薰衣草星座+天文台 |
| library | #lib* #pm* #guides* #dev* | 藏书阁+松 | 海边小屋书房圆窗 | 烛光书房 |
| log | #weekly #me-stats #changelog #sitemap | 卷轴砚台+柳+归雁 | 瞭望台航海日志+铜铃 | 任务公告板+信鸽 |
| me | #me #me-sites #me-accounts #me-ai #me-analytics | 月门庭院+茶席 | 黄昏海湾吊床 | 像素卧室窗台猫 |

## 第五轮：顶栏 / 页头带 / 页脚主题化（2026-10-30，CACHE 45 / changelog #73）
- 页头带 `.section-head`：负 margin + 等量 padding 延伸到浮动顶栏背后（不增高），背景 = 左实右透遮罩 + 该页场景图 `--page-art` + 主题底色 `--chrome-tint`；`::after` 底边装饰 `--chrome-edge`（水墨笔触+金点 / 青色波浪+白浪线 / 像素阶梯+粉块）。
- 顶栏 `--nav-skin` / `--nav-line`：水墨纸色+金色底线；海岸白→浅青渐变+青色底线；像素奶油底+3px 深棕边+4px 硬投影。下拉、吸顶不变。
- 页脚：`--foot-tint` 主题渐变 + `assets/bg/foot/<theme>.webp` 右下小景（湖畔草亭仙鹤 / 贝壳海岸远帆 / 像素草地宝箱小猫，10–14KB）+ 顶边装饰翻转；栏目标题加主题色短线。手机底栏同皮肤。

## 第六轮：组件视觉一致性审查（2026-10-30，CACHE 46 / changelog #74）
方法：3 主题 × 27 个路由逐页截图（`/workspace/gefei-shots/audit/sheet-*.png`），再对 8 类组件单独截改前/改后（`audit/c-before|after-<theme>-<组件>.png`）。
统一做法：`css/themes.css` 末尾「Phase UI-polish」新增一组组件 token，三主题各一套，组件只引用 token：
`--ui-radius/-sm`（水墨 10/8，海岸 14/10，像素 3/2）、`--ui-bw` + `--ui-border-c`（像素 2px #3f2e22）、`--ui-accent/-2/-soft`（水墨藏青+金，海岸 #0e7490+青，像素粉+蓝）、`--ui-ring`、`--ui-shadow-sm/-hover`（像素为硬投影）、`--ui-hint-bg/-bar`、`--ui-bar-fill`、`--ui-th-bg`、`--ui-scroll-*`、`--ui-select-arrow`（像素为阶梯像素箭头）、`--ui-selection`。

| # | 发现 | 处理 |
|---|---|---|
| 1 | 「这个页面是干什么的」提示条平铺无层次 | 主题色左条（水墨金、海岸青、像素粉棕条纹）+ 主题边框/阴影；像素为虚线框 |
| 2 | 输入框/下拉是默认样式，原生下拉箭头，焦点发黄 | 主题边框、悬停/焦点环、自绘箭头；像素直角+2px 边+粉色硬投影焦点 |
| 3 | 勾选框原生蓝 | `accent-color` 跟主题 |
| 4 | 文件选择「Choose File」原生按钮 | `::file-selector-button` 按主题 |
| 5 | 子导航选中态（黄描边）与工作台 tab（金底）各说各话 | 统一 `--ui-accent-soft` 底 + 强调色；像素为粉底白字硬投影 |
| 6 | 次级按钮/筛选胶囊在像素主题仍圆角细边 | 次级按钮加主题边框与阴影；像素 2px 硬边、直角、按下位移 |
| 7 | 经验进度条灰色平条 | 主题渐变填充；像素为描边轨道+条纹块 |
| 8 | Markdown 表格表头朴素 | 主题表头底色、强调色字、斑马纹、圆角外框；行内 code 主题底色 |
| 9 | Toast/弹窗/骨架屏/空状态是通用样式 | 主题边框+左色条/硬投影，骨架闪光带主题色，空状态虚线框 |
| 10 | 滚动条、选中文字、焦点环为默认 | `scrollbar-color` + webkit 滚动条、`::selection`、focus-visible 统一 `--ui-ring` |
| 11 | 新手引导三张截图仍是旧的深色界面 | 用 `tools/shoot-start.js` 按当前亮色界面重拍（15–19KB） |

故意没改：
- 赚钱榜类型胶囊（羊毛/副业/闲鱼…）配色：颜色本身表达类型，统一会丢信息。
- 原生日期选择弹层、`<select>` 展开后的选项列表：浏览器绘制，强改会破坏可访问性与手机体验。
- 工具页 iframe 预览、用户模板内容：属于内容，不跟站点主题。
- 主按钮 `.btn-primary`、顶栏、页头、页脚：前几轮已主题化，本轮不动。
- 数据、路由、文案与站点结构不变；不新增装饰图（新手引导截图为界面截图，按原用途重拍）。

## 第七轮：顶部菜单栏主题背景（2026-10-31，CACHE 47 / changelog #75）
`css/themes.css` 末尾「Phase UI-navbar」：`.site-nav` 背景 = `--nav-orn`（装饰线）+ `--nav-veil`（半透明遮罩）+ `--nav-art`（`assets/bg/nav/<theme>.webp`）+ `--panel` 底色；吸顶（`body.nav-condensed`）换 `--nav-veil-condensed`（更不透明）+ `--nav-shadow-condensed`（更深阴影）。
- 水墨纸 `ink.webp`（12.8KB）：宣纸纤维 + 两侧淡远山；CSS 叠金色细线（中段渐显）+ 右侧淡云纹 SVG。
- 海岸青 `ocean.webp`（4.5KB）：浅海水彩 + 白色细波纹；CSS 叠青/白双线小波浪 repeat-x。
- 像素暖沙 `pixel.webp`（3KB）：像素粉云天空（降采样 + 20 色量化 + 最近邻放大，保持硬边）；`image-rendering: pixelated`，底边粉/蓝/黄像素色条 + 深棕虚线，3px 硬边框与硬投影保留。
- 顶栏悬停/选中胶囊加 `--nav-pill` 实底，红点加底色描边，品牌名加浅色文字阴影，保证在纹理上可读。
- 没给 `.site-nav` 本身加 `backdrop-filter`：它会让 fixed 元素变成下拉菜单的定位容器，有破坏下拉的风险；遮罩本身已足够不透明，毛玻璃效果几乎看不出。
- 手机底栏（≤860px）用同一纹理 + 吸顶遮罩。SW 只预缓存 `ink.webp`，其它主题运行时缓存。
