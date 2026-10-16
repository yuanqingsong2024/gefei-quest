# 出海小站练站营 · 详细设计规格（DESIGN-SPEC）

> 产品名：**出海小站练站营**  
> 形态：本地单页轻 RPG 闯关（勾选 = 实战记账）  
> 文档状态：开发前规格 · **尚未实现游戏代码**  
> 日期：2026-10-16（Asia/Shanghai）  
> 依据：`design-game.html`、`design.html`、`gefei-seo-playbook.html`、`gefei-learning-notes.md`

---

## 1. 一句话定位

像《塞尔达》小地图 + 《习惯 RPG》打卡：你是建站冒险者，在「搜索之海」立灯塔站点；主线三座岛屿（站一/二/三），每周港口商船送来知识卷轴。

**核心诚实点：** 游戏不能替你建站；勾选 = 你承认线下这步做完了。

---

## 2. 目标 / 非目标

### 2.1 目标（Goals）

| ID | 目标 |
|----|------|
| G1 | 把哥飞公开方法「挖词→上站→SEO→变现→放大」拆成可勾选小任务 |
| G2 | 用站一→站二→站三递进，先跑通流程再追流量 |
| G3 | 深色游戏 UI：HUD + 岛屿地图 + 任务板 + 成就 + 商船补给 |
| G4 | 进度本机持久化；零部署；浏览器打开即可打卡 |
| G5 | 每周可追加 `WEEKLY_UPDATES`（由 Grok Bot 改数据），不碰用户存档 |
| G6 | 高对比可读（吸取浅蓝/黑字看不清反馈）：金/青字在深底上清晰 |

### 2.2 非目标（Non-goals · MVP）

- 不做账号登录、云同步、排行榜、社交
- 不替用户自动建站、买域名、申请 AdSense
- 不复刻付费社群生意；不收益承诺
- 不做付费抽卡、随机掉落决定进度
- 不做重度数值网游、长不可跳过过场
- 体力系统默认关闭（可设置打开，非主路径）

---

## 3. 玩家幻想与隐喻

| 现实 | 游戏隐喻 |
|------|----------|
| 学习者 | 建站冒险者 |
| 关卡章节 | 岛屿 |
| 实战步骤 | 出击 / 任务 |
| 通关条件 | Boss 战胜利 |
| 每周新知 | 周一港口商船 · 情报卷轴 |
| 谷歌爬虫/搜索 | 航会 / 航船发现灯塔 |
| 流量/广告 | 补给 / 港口旗帜 |
| XP / 等级 | 成长感（不锁内容） |
| 连击 | 每日出航习惯 |

**爽点：** 解锁下一座岛 + 真实站点有收录/曝光（游戏外反馈）。

---

## 4. 画面清单（Screen Inventory）

| 代号 | 名称 | 说明 |
|------|------|------|
| **A** | HUD + 世界地图 | 默认主屏：头像/称号、XP 条、可选体力条、当前位置、连击、成就计数；横向岛屿节点 |
| **B** | 任务面板（Quest Board） | 点击当前岛进入；任务卡列表；勾选结算 |
| **C** | 港口商船（Event Ship） | 展示本周 `WEEKLY_UPDATES`；已读领 XP |
| **D** | 成就墙（Achievements） | 徽章网格；已解锁高亮，未解锁灰显+条件提示 |
| **E** | 设置 / 重置 | 静音、体力开关（默认 OFF）、减少动态、重置存档（二次确认） |

**导航：** 顶栏或底栏 Tab：`地图 | 任务 | 商船 | 成就 | 设置`。移动端优先；任务可从地图点岛屿直达 B。

### 4.1 Screen A 线框要点

- 左：头像区（Emoji 🧭）+ `冒险者 · Lv.N` + 称号
- 中：XP 进度条；若 `energyEnabled` 则显示今日体力条
- 右：当前位置岛名、连击天数、成就 x/y、存档提示「本机浏览器」
- 下：岛屿横滑：`序章 → 站一 → 站二 → 站三 → 变现港 → 放大`

节点状态：`locked | active | cleared`

### 4.2 Screen B 任务卡字段

- `title`（游戏化标题）
- `action`（真实动作说明）
- `tools`（推荐工具）
- `doneCriteria`（完成标准）
- `xp`、`required`、`boss`、`side` 标签
- `pitfalls`（常见坑，可折叠）
- 可选 `noteUrl`（诚实模式备注，仅本地，MVP 可后置）

### 4.3 Screen C

- 标题：「周一港口商船」
- 卡片：标题、摘要 2～4 句、外链、`claimed` 状态
- 操作：「收入图鉴 / 已读」→ +5 XP（每条仅一次）

### 4.4 Screen D

- 至少 8 个成就（见 §6.3）
- 点击看解锁条件与日期（若有）

### 4.5 Screen E

- 音效开关（默认静音）
- 减少动态（`prefers-reduced-motion` 或手动）
- 体力系统 ON/OFF（默认 OFF）
- 重置存档：需输入「重置」或明确二次确认
- 版本号 / 存档 key 显示

---

## 5. 信息架构

```
index.html（或小目录）
├── UI Shell（HUD + Tab）
├── data/
│   ├── CHAPTERS + QUESTS（写死）
│   ├── ACHIEVEMENTS（写死）
│   └── WEEKLY_UPDATES（Bot 可追加）
├── save: localStorage['gefei-quest-save-v1']
└── 外链：playbook / 公开文（资料柜，只摘要）
```

**内容来源优先级：** playbook 分阶段方案 + 学习笔记练手三阶 → 游戏化改写标题，完成标准对齐真实 SEO 结果。

---

## 6. 游戏系统

### 6.1 XP 与等级

- 小任务：10～25 XP；Boss：40～60 XP；商船已读：+5 XP/条
- **等级不锁关卡内容**（防挫败）；只改称号与头像边框样式
- 升级曲线（累计 XP 阈值，达到即升到该级）：

| 等级 | 称号 | 累计 XP |
|------|------|---------|
| Lv.1 | 营地学徒 | 0 |
| Lv.2 | 灯塔学徒 | 50 |
| Lv.3 | 新手船长 | 120 |
| Lv.4 | 蓝海水手 | 220 |
| Lv.5 | 收录猎手 | 350 |
| Lv.6 | 内页制图师 | 500 |
| Lv.7 | 港口商人 | 680 |
| Lv.8 | 航线规划师 | 900 |
| Lv.9 | 果园主理 | 1150 |
| Lv.10 | 出海老兵 | 1450 |

实现：`level = max { L | cumulativeXp[L] <= totalXp }`；当前级进度条 = 距下一级差额。

**取消勾选：** 撤回对应 XP（及若因此掉级则降级）；Boss 取消则可能重新上锁下一岛（见 §7 解锁规则）。

### 6.2 连击 Streak

- 当天任意「勾选任务」或「领取商船奖励」计为一次 check-in
- `lastCheckIn` 存 `YYYY-MM-DD`（按用户本地日历日；文档约定展示用上海时区说明即可）
- 连续自然日 +1；断一天 → streak 重置为 1（当天又有动作）或 0（当天无动作且已断）
- MVP **不做**「保护符」；列入后续

### 6.3 成就（至少 8 个）

| id | 名称 | 解锁条件 |
|----|------|----------|
| `ach-first-check` | 第一次出击 | 任意任务首次勾选 |
| `ach-prologue-clear` | 推开营地大门 | 通关序章 Boss |
| `ach-site-indexed` | 灯塔被发现 | 通关站一 Boss（品牌词可搜到） |
| `ach-gsc-ready` | 航会报到成功 | 完成「GSC 验证」类任务 |
| `ach-blue-sea` | 航道打通 | 通关站二 Boss |
| `ach-archipelago` | 群岛连线 | 通关站三 Boss |
| `ach-ship-4` | 四季商船 | 累计领取 4 条商船卷轴 |
| `ach-streak-7` | 七日连航 | streak ≥ 7 |
| `ach-monetize-aware` | 港口升旗 | 通关变现港 Boss |
| `ach-scale-plan` | 新航线蓝图 | 通关放大 Boss |

（MVP 可先实现上表 8～10 个；展示「已解锁数 / 总数」。）

### 6.4 体力 Energy（可选）

- 默认 **`energyEnabled: false`**
- 若开启：每日自动回满 5 点；每勾选 1 个主线/支线任务耗 1；商船领取不耗体力；体力不足不可勾选（提示明日再来或去设置关闭）
- Boss 勾选同样耗 1（若开启）

### 6.5 解锁规则

- 岛屿线性解锁：通关当前岛 **所有 `required: true` 任务**（含 Boss）→ 解锁下一岛
- 支线 `required: false` 不挡通关
- 已通关岛可回看、可改勾选（改勾选若破坏 required 完成态，下一岛回到 locked，并提示）

---

## 7. 完整关卡与任务大纲

约定字段：`id` · `title`（游戏化）· `action` · `tools` · `doneCriteria` · `xp` · `required` · `boss`

### 7.1 🏕️ 序章营地 `ch-prologue`

**氛围：** 教学、定方向  
**Boss 胜利演出：** 推开营地大门  
**通关：** 完成全部 required（含 Boss）

| id | title | action | tools | doneCriteria | xp | required | boss |
|----|-------|--------|-------|--------------|-----|----------|------|
| `q-p-01` | 读懂航海禁忌 | 读完「不做什么」：不抄黑帽外链、不追求一站暴富、不空站申广告 | 本站说明 / playbook §目标 | 能口头说出 3 条禁忌 | 10 | yes | no |
| `q-p-02` | 选定你的职业牌 | 选择起步类型：纯练手站 / 低竞争工具站 / AI 套壳工具站（三选一写备忘） | 记事本 | 备忘里写明类型 | 15 | yes | no |
| `q-p-03` | 立下一词誓言 | 规定「本站只主攻 1 个关键词」（站一可为自创品牌词） | 记事本 | 主词写死，上线前不改 | 15 | yes | no |
| `q-p-boss` | **BOSS · 方向石碑刻字** | 把「站类型 + 主词」写成一句话方向备忘 | 记事本 | 方向备忘完整可复查 | 40 | yes | **yes** |

支线：`q-p-s1` 读公开文《放弃一站发思维…》摘要或原文 · xp 10 · required no

### 7.2 🏝️ 站一 · 新手岛 `ch-stage1`

**氛围：** 第一次上线  
**Boss：** 谷歌搜品牌词能找到你的站 · 演出：灯塔点亮

| id | title | action | tools | doneCriteria | xp | required | boss |
|----|-------|--------|-------|--------------|-----|----------|------|
| `q-s1-01` | 买下第一块领地 | 注册域名（自创独一无二站名即可；常用后缀） | 国际域名商 | 域名已注册 | 15 | yes | no |
| `q-s1-02` | 点亮灯塔（最小上线） | 部署单页 HTML（可先无支付/登录） | Cloudflare Pages / 静态托管 | HTTPS 可访问 | 25 | yes | no |
| `q-s1-03` | 挂上瞭望镜 | 安装流量统计 | GA4 或 Microsoft Clarity | 统计代码生效 | 15 | yes | no |
| `q-s1-04` | 向航会报到 | Google Search Console 验证站点 | GSC | 属性验证成功 | 20 | yes | no |
| `q-s1-05` | 把地图交给航会 | 提交 sitemap 或 URL 检查请求编入索引 | GSC | 已提交/已请求 | 15 | yes | no |
| `q-s1-boss` | **BOSS · 呼出你的名字** | 用品牌词/站名在谷歌搜索（或 `site:域名`） | Google | 能找到自己的站 | 50 | yes | **yes** |

支线：`q-s1-s1` 核对托管商业条款（若计划以后广告变现，慎用仅非商用套餐）· xp 10 · required no

### 7.3 🌊 站二 · 蓝海岛 `ch-stage2`

**氛围：** 低竞争有搜索量  
**Boss：** 目标词有 GSC 曝光并向首页推进 · 演出：航道打通

| id | title | action | tools | doneCriteria | xp | required | boss |
|----|-------|--------|-------|--------------|-----|----------|------|
| `q-s2-01` | 蓝海侦察 | 谷歌搜需求词 + `intitle:` 判断竞争；记下词与理由 | Google / Trends | 候选词+判断笔记 | 20 | yes | no |
| `q-s2-02` | 一词一岛命名 | 用该词做域名或站名/主 title | 域名商 / 编辑器 | 主词进入品牌层 | 15 | yes | no |
| `q-s2-03` | 打造承接港 | 最小工具/内容页上线；title 与唯一 h1 含主词 | 静态页 / CF Pages | 页面可访问且 On-Page 合格 | 25 | yes | no |
| `q-s2-04` | 抛出第一批缆绳 | 合法渠道提交导航/目录/社区自然外链（nofollow 也可） | 导航站/社区 | 至少尝试若干条并记录 | 20 | yes | no |
| `q-s2-05` | 每周观星象 | 看 GSC 曝光/点击/排名，改文案再观察 | GSC | 至少完成 1 次复盘记录 | 15 | yes | no |
| `q-s2-boss` | **BOSS · 航道打通** | 目标词在 GSC 有曝光，并朝首页推进（有改善趋势即可诚实勾选） | GSC | 曝光出现 + 排名有向好迹象 | 55 | yes | **yes** |

支线：`q-s2-s1` 可选了解 KGR（业界方法）交叉验证 · xp 10 · required no

### 7.4 🗺️ 站三 · 内页群岛 `ch-stage3`

**氛围：** 扩页与内链  
**Boss：** 多页收录 + 点击趋势 · 演出：群岛连成航线

| id | title | action | tools | doneCriteria | xp | required | boss |
|----|-------|--------|-------|--------------|-----|----------|------|
| `q-s3-01` | 绘制群岛海图 | 规划 3+ 长尾内页主题（仍相对低竞争、更高搜索量档） | 笔记 / Trends | 内页清单写好 | 15 | yes | no |
| `q-s3-02` | 填海造岛 | 上线至少 3 个内页；各页独立 title/h1 | 编辑器 / 托管 | 内页可访问 | 25 | yes | no |
| `q-s3-03` | 架起群岛桥梁 | 首页链出内页；内页锚文本指回首页主词 | HTML | 内链结构符合示意 | 20 | yes | no |
| `q-s3-04` | 更新航海图 | sitemap 含新页并提交 | GSC | sitemap 已更新提交 | 15 | yes | no |
| `q-s3-05` | 继续抛缆 | 为新页/整站补充合法外链与发现路径 | 导航/社区 | 有记录的推广动作 | 15 | yes | no |
| `q-s3-boss` | **BOSS · 群岛连线** | `site:` 多页可见；GSC 出现点击趋势 | Google / GSC | 多页收录 + 点击趋势 | 60 | yes | **yes** |

### 7.5 💰 变现港 `ch-monetize`

**氛围：** AdSense / 付费路径意识  
**Boss：** 弄清资格与自己的变现选项（**申请成功不强制**）· 演出：港口升起旗帜

| id | title | action | tools | doneCriteria | xp | required | boss |
|----|-------|--------|-------|--------------|-----|----------|------|
| `q-m-01` | 阅读港口法令 | 了解 AdSense 资格与「页面准备」要点；空站/采集不可申 | AdSense 帮助中心 | 笔记列出资格要点 | 15 | yes | no |
| `q-m-02` | 三选一旗帜 | 决定第一版：只练收录 / 先接 AdSense / 极简付费 | 备忘 | 写下选择与理由 | 15 | yes | no |
| `q-m-03` | 清理甲板 | 检查内容原创、导航可用、广告勿过度干扰（若已想挂广告） | 站点自查 | 合规自检清单勾完 | 20 | yes | no |
| `q-m-boss` | **BOSS · 升旗仪式** | 写出自己的变现路径选项与下一步（申请成功非必须） | 备忘 | 路径文档完整 | 45 | yes | **yes** |

支线：`q-m-s1` 有稳定点击后再研究 Stripe 等收款 · xp 10 · required no

### 7.6 🚢 放大航线 `ch-scale`

**氛围：** 模板多站 · 先学不急量产  
**Boss：** 写下下一站计划 · 演出：新航线解锁

| id | title | action | tools | doneCriteria | xp | required | boss |
|----|-------|--------|-------|--------------|-----|----------|------|
| `q-x-01` | 拆解可复用船体 | 复盘模板：哪些页面/部署步骤可复制 | 笔记 | 模板要点列表 | 15 | yes | no |
| `q-x-02` | 一词一船原则 | 写明下一站主词与「举全站之力一词」策略 | 笔记 | 下一站主词确定 | 15 | yes | no |
| `q-x-03` | 反空壳誓言 | 确认不在第一站未跑通前铺大量空壳站 | 备忘 | 写下节奏约束 | 10 | yes | no |
| `q-x-boss` | **BOSS · 新航线蓝图** | 完成下一站 1–2 天可执行上线清单 | 笔记 | 清单可执行 | 50 | yes | **yes** |

---

## 8. 存档 Schema：`gefei-quest-save-v1`

`localStorage` key：`gefei-quest-save-v1`

```json
{
  "version": 1,
  "xp": 0,
  "done": ["q-p-01"],
  "unlocked": ["ch-prologue"],
  "cleared": [],
  "streak": 0,
  "lastCheckIn": null,
  "achievements": [],
  "achievementDates": {},
  "weeklyClaimed": [],
  "settings": {
    "muted": true,
    "energyEnabled": false,
    "reduceMotion": false
  },
  "energy": {
    "date": null,
    "left": 5
  },
  "notes": {},
  "updatedAt": "2026-10-16T01:58:00.000Z"
}
```

| 字段 | 说明 |
|------|------|
| `version` | schema 版本，便于迁移 |
| `xp` | 当前总 XP（取消勾选会减少） |
| `done` | 已完成任务 id 数组 |
| `unlocked` | 已解锁章节 id；初始含 `ch-prologue` |
| `cleared` | 已通关章节 id（Boss 与 required 均完成过） |
| `streak` | 连击天数 |
| `lastCheckIn` | 上次有效动作日 `YYYY-MM-DD` 或 null |
| `achievements` | 已解锁成就 id |
| `achievementDates` | `{ [achId]: ISO 日期 }` 可选 |
| `weeklyClaimed` | 已领取的补给条目 id |
| `settings.muted` | 默认 true |
| `settings.energyEnabled` | 默认 false |
| `settings.reduceMotion` | 减少动效 |
| `energy.date` / `left` | 仅体力开启时有意义 |
| `notes` | `{ [questId]: string }` 可选证据备注 |
| `updatedAt` | 最后写入时间 ISO |

**边界：** 周更只改页面内 `WEEKLY_UPDATES` 数据，**禁止**清空或覆盖用户该存档。

---

## 9. `WEEKLY_UPDATES` Schema

写在页面 JS 数据（或 `data/weekly.js`）中，示例：

```json
[
  {
    "id": "w-2026-10-13-a",
    "week": "2026-W42",
    "title": "新词侦察简报 · 示例",
    "summary": "两到四句摘要，不整页搬运原文。",
    "url": "https://example.com/optional",
    "tags": ["新词", "GSC"],
    "xp": 5,
    "addedAt": "2026-10-13"
  }
]
```

| 字段 | 说明 |
|------|------|
| `id` | 全局唯一；用于 `weeklyClaimed` |
| `week` | ISO 周标签，便于 UI 分组 |
| `title` | 卷轴标题 |
| `summary` | 2～4 句 |
| `url` | 可选外链 |
| `tags` | 可选标签 |
| `xp` | 默认 5 |
| `addedAt` | 添加日 |

MVP 播种 2～3 条样例。Bot 每周只追加，不删用户进度。

---

## 10. 视觉设计 Token

承接用户反馈：**深色游戏 UI，但金/青/正文必须高对比可读**。

```css
:root {
  --bg: #0f1419;
  --panel: #1a2332;
  --panel2: #243044;
  --ink: #f1f5f9;          /* 正文：近白，勿用浅灰当正文 */
  --muted: #94a3b8;        /* 仅次要说明 */
  --line: #334155;
  --gold: #fbbf24;         /* 标题/高亮；深底上足够亮 */
  --gold-text: #fde68a;    /* 大段金色说明文字 */
  --cyan: #7dd3fc;         /* 链接/强调；避免过暗蓝 */
  --cyan-hot: #38bdf8;
  --ok: #4ade80;
  --danger: #f87171;
  --boss: #ef4444;
  --locked-opacity: 0.45;
  --radius: 14px;
  --font: "PingFang SC","Noto Sans SC","Microsoft YaHei",system-ui,sans-serif;
}
```

**对比度规则：**

- 正文用 `--ink`，不用 `--muted` 写长文
- 链接用 `--cyan` 或更亮，hover 更亮；禁止浅蓝底 + 中蓝字
- 标签：深蓝底 + 浅蓝字（如 `#1e3a8a` / `#bfdbfe`）保证对比
- 地图节点 active：金边 + 轻发光；cleared：绿边；locked：降透明 + 锁图标（不单靠颜色）

---

## 11. 动效 / 音效策略

| 元素 | MVP 建议 | 避免 |
|------|----------|------|
| 勾选 | 短 CSS 闪动 + XP 飘字 | 长动画挡操作 |
| Boss 通关 | ≤1.5s 过场，**可跳过** | 不可跳过长 CG |
| 地图解锁 | 节点弹跳点亮 | 密集粒子 |
| 音效 | 可选叮 / 短和弦；**默认静音** | 自动循环 BGM |
| 无障碍 | 焦点环可见、键盘可勾选；尊重 `reduceMotion` | 仅靠颜色区分状态 |

---

## 12. 技术栈

| 项 | 选择 |
|----|------|
| 载体 | 本地单页；推荐目录：`/workspace/gefei-quest/` → 用户可复制打开 |
| 入口 | `index.html` |
| 可选拆分 | `css/tokens.css`、`js/save.js`、`js/data.js`、`js/app.js`（仍零构建） |
| 存档 | `localStorage` |
| CDN | **尽量零 CDN**（离线可打卡）；外链打开才需网 |
| 图标 | Emoji 或内联 SVG |
| 不引入 | React/Vue 构建链、后端、账号 |

---

## 13. MVP 验收标准

- [ ] 打开 `index.html` 即见 Screen A（HUD + 地图）
- [ ] 序章～站三任务可玩；变现港/放大有完整或简化任务且可通关
- [ ] 勾选结算 XP、连击；取消勾选撤回
- [ ] Boss 通关解锁下一岛；短庆贺可跳过
- [ ] 成就墙至少 8 枚逻辑接通
- [ ] 港口商船展示样例补给，已读 +5 XP 且不重复
- [ ] 设置：默认静音；体力默认关；重置需确认
- [ ] 深色高对比：金/青/正文可读
- [ ] 移动端可用；键盘可操作主要勾选
- [ ] 刷新页面进度仍在（同浏览器）
- [ ] README 说明如何打开、存档位置、与 Bot 周更关系
- [ ] **无**登录、无云同步、无收益承诺文案

---

## 14. 明确不做 / 后续版本

| 版本 | 内容 |
|------|------|
| 非 MVP | 云同步、账号、排行榜、保护符、抽卡 |
| v1.5 | 导出/导入存档 JSON；诚实模式强制 URL 备注 |
| v2 | Cloudflare Pages 固定网址 |
| v2.5 | 角色皮肤三选一；岛屿简笔画背景 |
| v3 | 多站并行进度 / 模板库 |

---

## 15. 相关文件（已有 · 非游戏实现）

| 路径 | 用途 |
|------|------|
| `/workspace/gefei-quest/design-game.html` | 网页游戏向设计稿 |
| `/workspace/gefei-quest/design.html` | 早期产品设计稿 |
| `/workspace/gefei-seo-playbook.html` | 学习与实施方案 |
| `/workspace/gefei-learning-notes.md` | 公开文学习笔记 |
| `/workspace/gefei-quest/DESIGN-SPEC.md` | 本规格 |
| `/workspace/gefei-quest/TASKS.md` | 开发任务清单 |

**本文档确认前不应开始写 `index.html` 游戏逻辑。**（本轮仅产出规格与任务清单。）
