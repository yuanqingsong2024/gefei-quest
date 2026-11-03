# Plan · 2026-11-03 · AEO 工具链 + AI Image Enhancer 练站落地页

> **状态**：PLAN ONLY（本稿不改站点代码、不提交、不开 PR）。  
> **门禁**：未获用户明示「做」前，禁止 Grok Build / Pi 开工；合 `main` 另须「合 main 上线」。  
> **来源**：时予 2026-11-03 用户拍板 — 5) AEO 工具链「做页｜研究」；7) ai image enhancer「做页｜做内容」。  
> **Brief 对齐**：周衡 Desk 2026-11-03 两份落地页 brief（见 §Briefs）；本稿已按 brief 定主词 / 分工 / CTA / 验收。  
> **明确排除**：beacon.sh 仅做内容/研究，**不**拆站页（见 beacon brief）。  
> **实现方**：用户回「做」后由 Grok Build / Pi 按本计划施工。  
> **时区**：Asia/Shanghai。

---

## Briefs（绝对路径 · 实现前必读）

| 页 | Brief 路径 | Primary keyword | 页型 |
|----|------------|-----------------|------|
| Page A | `/workspace/search-content/briefs/2026-11-03/aeo-toolchain-tools-landing.md` | **`AEO tools`** | 落地页（工具链 + 对照表 + Waitlist） |
| Page B | `/workspace/search-content/briefs/2026-11-03/ai-image-enhancer.md` | **`best AI image enhancer`** | 英文工具/对比落地页（非纯内容） |
| （排除） | `/workspace/search-content/briefs/2026-11-03/beacon-sh-coding-agent-memory.md` | coding agent memory layer | **内容文 only · 先不拆站页** |

对照 GEO 页既有 brief（防重复）：  
`/workspace/search-content/briefs/2026-11-01/geo-ai-seo-checklist-landing.md`

**不**把 brief 复制/软链进 `gefei-quest` 站点树；施工时直接读上述路径。

---

## 0. 现有模式（必读）

参考模板：`starters/geo-checklist/`（`index.html` + `README.md`）。

| 约定 | 现状 |
|------|------|
| 形态 | 英文单页、零依赖、内联 CSS；checklist 勾选写 `localStorage` |
| 主站挂载 | `js/data.js` collections：`ch-geo-checklist-starter`（`cat: 'hosting'`，`url: './starters/geo-checklist/'`） |
| 快捷链 | `js/data.js`「GEO / AI SEO Checklist Starter」→ `./starters/geo-checklist/` |
| CTA | **Waitlist / 申请试用 only**；**禁止**假审计 URL / 公网 `autograph.ai` 试用链 / 假 `/audit` |
| 红线文案 | 不保证流量/排名/AI 引用/收益；不编造官方 GEO/AEO 分数 |
| 预览 | `https://yuanqingsong2024.github.io/gefei-quest/starters/geo-checklist/`（须合 main 后稳定） |

本计划两页均复制该骨架（目录级复制 → 改文案/区块 → README），不引入构建工具或后端。

---

## 1. 总目标

在 `starters/` 下新增 **两套** 可复制英文练站落地页，分别承接周衡 brief：

1. **Page A · AEO tools** — 文件产出物 + 工具链选型（CLI / 在线生成器 / brief 生成器 / 平台），对标但**不重复**站内 GEO checklist。  
2. **Page B · best AI image enhancer** — 英文对比/工具着陆：保真 vs 生成式、按场景决策表；自研未上线则 Waitlist。

关键词、Hero、验收以 **§Briefs 中的 brief** 为准；路径工程默认仍落 `starters/…`（练站副本），与 brief 草案 `/aeo-tools`、`/ai-image-enhancer` 的「最终站未定」并存——实现时 README 写明练站路径。

---

## 2. Page A — AEO Toolchain Checklist（优先施工）

### 2.1 Goal & keywords（对齐 brief）

| 项 | 定稿（来自 brief） |
|----|-------------------|
| **Primary** | **`AEO tools`** |
| Supporting | `llms.txt generator` · `answer engine optimization brief` · `AI index` · `schema for AI search` · `aeo.js`（工具名作证据，非品牌冒用） |
| 受众 | EN 独立站与内容团队；已懂一点 SEO，犹豫 CLI vs 平台 vs DIY |
| 一句话目标 | 讲清要生成/校验哪些机器可读文件与工具形状；CTA 一律 Waitlist / 申请试用 |

**与站内 `/geo-checklist`（`starters/geo-checklist/`）分工（必须写进页内与 FAQ）：**

| | GEO checklist（已有） | 本页 AEO toolchain |
|--|--|--|
| 主轴 | 词汇 GEO vs AEO vs SEO + **可执行清单** + agency vs DIY | **要生成/校验哪些文件与工具链**（llms.txt、schema、AI index） |
| 工程路径（练站） | `starters/geo-checklist/` | `starters/aeo-checklist/`（brief 草案 `/aeo-tools`，最终站未定） |
| CTA | Waitlist | Waitlist（相同口径） |

页内专节 **How this relates to our GEO checklist**：词汇与勾选在 GEO；**文件与工具选型在本页**；互链 `../geo-checklist/`；禁止整页重复 GEO vs AEO 长科普。

**证据（研究引用，页脚/「Further reading」诚实外链，不抄长文）：**

- [aeo.js](https://aeojs.org/) — CLI/插件：robots / llms.txt / llms-full / sitemap / schema / ai-index；「GEO Readiness Score」为对方产品演示，**勿写成行业官方分**。  
- [AEO Brief Generator (llmstxtkit)](https://llmstxtkit.com/tools/answer-engine-optimization-brief-generator.html) — 一查询 brief：title/meta/H1、直接答案、proof plan、FAQ schema、llms.txt 条目、测量清单。

### 2.2 Page type

**EN interactive checklist + 工具链说明 + 对照表**（与 `geo-checklist` 同族）。  
不做：真实 aeo.js 封装、在线 brief 生成器后端、假「AEO Score」仪表盘、公网审计页。

可选轻交互（仍纯前端）：

- checklist → `localStorage`（键名建议 `gefei-aeo-checklist-v1`）  
- 可选：静态「示例 llms.txt 片段」`<pre>`（自写短示例）

### 2.3 Paths

```
starters/aeo-checklist/
  index.html
  README.md
```

预览（合 main 后）：  
`https://yuanqingsong2024.github.io/gefei-quest/starters/aeo-checklist/`

Brief 路径建议 `/aeo-tools`（或极少情况做成 `/geo-checklist#aeo-toolchain` 扩展——**不推荐**首版，易糊词汇段）；练站首版固定独立目录 `aeo-checklist`。

### 2.4 Nav / collection wiring（实现阶段再改代码）

| 位置 | 动作 |
|------|------|
| `js/data.js` collections | 新增 `ch-aeo-checklist-starter`，`cat: 'hosting'`，镜像 geo 条目字段 |
| `js/data.js` 快捷链区 | 在 GEO Starter 旁加「AEO Checklist / AEO Tools Starter」→ `./starters/aeo-checklist/` |
| 本页 `README.md` | 用途表、复制步骤、Waitlist 规则、诚实声明、brief 路径引用 |
| `index.html` 顶栏 nav | `#home` `#files` `#tools` `#brief` `#checklist` `#geo` `#waitlist` `#faq` |
| **不改** | 主站大导航（除非另开 IA）；**无** beacon 入口 |

### 2.5 Content outline（对齐 brief H2）

1. **Hero** — Primary **`AEO tools`** / llms.txt；H1 可选用 brief 标题选项（如 *AEO Tools Explained: llms.txt, Schema, and AI Index—Without Fake Citation Scores*）；CTA：**Join the waitlist / 申请试用**；禁止「立刻公开审计你的站」与假链。  
2. **AEO toolchain in one diagram** — 人读页 → 机器可读层：llms.txt / llms-full、schema、sitemap、AI 向 robots、可选 ai-index。  
3. **What each file is for** — 每项一行目的 + 「不能保证被 ChatGPT 引用」。  
4. **Tool shapes compared (not a paid ranking)** — 表：aeo.js 类 CLI · 在线 llms.txt 生成器 · AEO brief 生成器 · 全平台「审计+修复」；价格/评分 **待核/以官网为准**。  
5. **From brief → page → files** — 对齐 llmstxtkit「一查询一答案 + proof plan」。  
6. **Checklist**（可勾选）— Access / Answer-first / Artifacts / Proof / Measure（爬虫命中 ≠ 用户流量）。  
7. **How this relates to our GEO checklist** — 内链 + 分工表。  
8. **Waitlist / 申请试用** — 登录后产品内审计/打分/schema 能力叙事即可；**无公网独立审计页**。  
9. **FAQ + Answer-ready** — brief 三段 Q&A 须完整落入页（What are AEO tools? / Is llms.txt generator enough? / AEO brief vs SEO brief?）。  
10. **Footer** — 练站声明、链回主站与 geo-checklist。

Title ×2、meta ×2 以 brief §Title options / Meta descriptions 为准。

### 2.6 Acceptance criteria（Page A · 摘自 brief + 工程项）

**来自 brief：**

- [ ] Hero 含 **AEO tools** / llms.txt 与 **Waitlist/申请试用** CTA  
- [ ] 文件产出物清单清楚；写明「不保证被引用」  
- [ ] 工具形状对比表（CLI / 在线生成器 / brief 生成器 / 平台）；无伪造价格与官方分  
- [ ] 明确对比并**内链 GEO checklist**，避免整页重复  
- [ ] 无 `autograph.ai` 公网审计链；无假 `/audit`  
- [ ] 无流量/收益承诺；无灰帽  
- [ ] Answer-ready 三段完整；title ×2、meta ×2  
- [ ] 路径草案写出；最终站标注未定  

**工程补充：**

- [ ] `starters/aeo-checklist/{index.html,README.md}`；`lang="en"`；零构建依赖  
- [ ] Checklist → `localStorage`；刷新不丢  
- [ ] `js/data.js` collection + 快捷链（与 geo 同模式）  
- [ ] README 含复制部署步骤 + 引用 brief 绝对路径  

### 2.7 Out of scope / risks（Page A）

- 不 fork / 不嵌入 aeo.js runtime；不自建 brief API；不公网假审计。  
- 不声称与 aeo.js / llmstxtkit 官方合作。  
- 风险：与 geo-checklist 重叠 → 用「文件族 + 工具形状」切口分化（brief 已定分工）。  
- 风险：第三方改版 → 外链标注研究时点 2026-11-03。

---

## 3. Page B — AI Image Enhancer（对比 + 工具着陆）

### 3.1 Goal & keywords（对齐 brief）

| 项 | 定稿（来自 brief） |
|----|-------------------|
| **Primary** | **`best AI image enhancer`** |
| Supporting | `AI image enhancer` · `AI photo enhancer` · `AI image upscaler` · `free AI image enhancer` |
| 受众 | EN 小站 / 内容与电商素材团队 |
| 一句话目标 | 按场景（保真产品图、AI 绘图放大、人像、本地隐私）选型的对比落地页；自研未上线 → Waitlist only |

**证据 / 角度：**

- TideRank 2026-11-01：`ai image enhancer` ~72.9 · Rising steadily — **仅选题强度，禁止流量承诺**。  
- 与 Ideogram Precise Edit 等「生成式修图新闻」**分簇**——本页锚定 enhance / upscale / denoise / restore。  
- SERP 常客可点名类型+代表名（Topaz / Let’s Enhance / Magnific / Upscayl / Remini 等）；价格一律 **待核/以官网为准**。

### 3.2 Page type

**EN comparison / tool landing**（表 + FAQ + CTA；**不是**纯博客长文）。  

**不做（红线）：**

- 真实云端增强 API（首版）、深度伪造/换脸、成人导流、账号/会员中间商。  
- 假装已是「第一名」或已上线可无限用的公网增强器。  
- 流量/收益承诺。

**允许：**

- **B1（推荐首版）**：静态对比表 + 场景决策 + FAQ + Waitlist；无上传。  
- **B2（可选二期 · 工程车道）**：浏览器示意或上传流水线——brief 明确**不在作者成稿承诺上线日**；未上线前 CTA 仍 Waitlist。

### 3.3 Paths

```
starters/ai-image-enhancer/
  index.html
  README.md
```

预览：`…/gefei-quest/starters/ai-image-enhancer/`  
Brief 草案路径：`/ai-image-enhancer`（最终站未定）。

### 3.4 Nav / collection wiring

| 位置 | 动作 |
|------|------|
| `js/data.js` collections | `ch-ai-image-enhancer-starter`，`cat: 'hosting'`（首版跟 geo） |
| 快捷链 | 「AI Image Enhancer Starter」→ `./starters/ai-image-enhancer/` |
| 页内 nav | `#home` `#terms` `#jobs` `#compare` `#waitlist` `#faq` |
| 互链 | 与 GEO/AEO **弱相关，一般不强链**（brief）；不链灰产 |

### 3.5 Content outline（对齐 brief H2）

1. **Hero** — H1 含 **`best AI image enhancer`**；副标区隔 enhancer vs generative edit；主 CTA：自研未上线 → **Join the waitlist**；次 CTA → 对比表。  
2. **Enhancer vs upscaler vs generative “wonder” models** — 三列；生成式可能**改写**内容。  
3. **Pick by job (decision table)** — 电商产品图（保真警告）、摄影打印、AI 出图、旧人像、本地隐私；代表工具类型+名；价格待核。  
4. **Snapshot comparison** — Best for / Runs where / Free tier? / Watch-outs。  
5. **Optional Waitlist hang** — 无公网完整工具则缩成一句 Building… join waitlist。  
6. **FAQ + Answer-ready** — brief 三段（What is enhancer? / What is the best…? / Enhancer vs generative edit?）。  
7. **Footer** — 红线与练站路径。

Title ×2、meta ×2 用 brief 选项。

### 3.6 Acceptance criteria（Page B · 摘自 brief + 工程项）

**来自 brief：**

- [ ] 格式为**落地页**（对比表 + FAQ + CTA），非纯博客长文  
- [ ] Hero 含 **best AI image enhancer**；区隔 enhancer vs generative edit  
- [ ] 按场景决策表；点名常见工具类型；价格「待核/以官网为准」  
- [ ] 电商保真警告写明  
- [ ] 自有工具未上线时 CTA=**Waitlist only**；无虚假「已是第一名」  
- [ ] 无流量/收益承诺；无灰帽  
- [ ] Answer-ready 三段完整；title ×2、meta ×2  
- [ ] 路径草案 `/ai-image-enhancer`；站未定  

**工程补充：**

- [ ] 目录与 README 齐全；英文；零后端  
- [ ] 对比表至少满足 brief 决策表+快照表结构  
- [ ] 无上传至第三方（B1）；若日后 canvas/上传须显著免责  
- [ ] `js/data.js` collection + 快捷链  
- [ ] Primary 出现在 title/H1/首屏，无堆砌  

### 3.7 Out of scope / risks（Page B）

- 不做真实 ML 推理服务、不存用户图（直至另开工程任务）。  
- 风险：竞品点名 — 价格待核、勿抄 affiliate 过期价。  
- 风险：用户期望能上传增强 → 页首+README 标明 content/compare + Waitlist。  
- Trends 分数会变 → 「as of 2026-11-01 snapshot」。

---

## 4. 建议施工顺序

| 顺序 | 页 | 理由 |
|------|----|------|
| **1（先）** | **Page A `aeo-checklist`** | 与 `geo-checklist` 同构；brief 已齐；和 GEO 叙事闭环。 |
| **2** | Page B `ai-image-enhancer` | 对比表需填场景/工具行；brief 已解除「等 brief 再开工」阻塞，仍建议 review 先过 A。 |

并行约束：同一 PR 可两页一起，但 **review 应先过 A**；时间紧可只交 A + wiring，B 第二 PR。

实现流水线：**用户「做」→** Grok Build/Pi develop → review → 用户「合 main 上线」→ main。

---

## 5. 跨页 Out of scope / 总风险

- **beacon.sh**：禁止本计划产出任何 `starters/beacon*` 或主站入口；内容走 `/workspace/search-content/briefs/2026-11-03/beacon-sh-coding-agent-memory.md`，**先不入库上站**。  
- 不改 war-rank / money-rank / 闲鱼方案正文。  
- 不手写大段实现代码（计划作者停于文档）。  
- CTA 全局：**Waitlist / 申请试用 only**（江予口径）；禁 autograph 公网审计假链。  
- 合并门禁：无「合 main 上线」不得合 main。  
- Brief 已到：标题/主词/验收以 brief 为准；工程路径保持 `starters/aeo-checklist` 与 `starters/ai-image-enhancer`。

---

## 6. 待办清单（给 Build 代理人 · 仅在用户「做」之后）

1. 通读 §Briefs 两份落地页 brief（勿拷进站点树）。  
2. 复制 `starters/geo-checklist/` → `starters/aeo-checklist/`，按 §2 + AEO brief 改文案、分工节、checklist keys。  
3. 新写 `starters/ai-image-enhancer/`，按 §3 + Enhancer brief（对比表优先）。  
4. 两份 README：用途 / 复制 / Waitlist / 诚实声明 / brief 路径。  
5. `js/data.js`：两条 collection + 两条快捷链。  
6. 自测 localStorage、锚点、移动宽度、无假审计链。  
7. 开 PR；**等待用户「合 main 上线」**。  
8. （可选）通知时予 / 周衡：预览 URL。

---

## 7. 变更记录

| 日期（上海） | 说明 |
|--------------|------|
| 2026-11-03 | 初稿：双页计划；先 AEO 后 Enhancer；排除 beacon.sh 站页。 |
| 2026-11-03 | **对齐周衡 brief**：增 Briefs 绝对路径表；Primary 定为 `AEO tools` / `best AI image enhancer`；写清 vs `/geo-checklist` 分工；CTA=Waitlist only；验收改摘 brief；确认 beacon 内容-only；门禁仍待用户「做」。 |
