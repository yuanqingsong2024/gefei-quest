# Phase 17 · 内容分发（免费优先）

用户决定：**不使用付费 API**；X 付费自动发帖从计划移除（已在 PHASE16 文档标注）。

## 页面 #war-share
1. 选来源：实操助手站点（优先用已发布的 GitHub Pages 地址）/ 赚钱榜条目 / 已发布网址 / 自由文本
2. 选平台，生成各平台版本：
   - AI 设置为自定义服务商 → AI 按固定格式（`=== 平台ID ===`）一次生成，缺的平台用模板补齐
   - Grok Bot 模式 → 内置模板草稿
3. 每个平台可编辑，带字数计数（X 按官方规则：中文 2、链接 23；其余为常见上限，以平台为准）、复制、打开发帖页
4. 每次复制 / 打开记入存档追加字段 `shares`，在 #me-analytics 显示分发时间线；账号中心显示每个平台的免费路径与分发次数

## 官方免费链接（2026-10-17 核实）
| 平台 | 链接 | 预填 | 状态 |
| --- | --- | --- | --- |
| X | `https://x.com/intent/post?text=` | 文字（含链接） | 200 |
| 微博 | `https://service.weibo.com/share/share.php?url=&title=` | 文字 + 链接 | 200 |
| Reddit | `https://www.reddit.com/submit?url=&title=` | 标题 + 链接；正文复制 | 200 |
| LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url=` | 只有链接（官方接口只收 url；`feed/?shareActive` 为非官方，未采用）；文字复制 | 302 登录 |
| Facebook | `https://www.facebook.com/sharer/sharer.php?u=` | 只有链接；文字复制 | 302 登录 |
| Pinterest | `https://www.pinterest.com/pin/create/button/?url=&description=`（可加 media） | 链接 + 描述 | 200 |
| Telegram | `https://t.me/share/url?url=&text=` | 文字 + 链接 | 200 |
| WhatsApp | `https://wa.me/?text=` | 文字 | 302 |
| 小红书 | 复制 → `https://creator.xiaohongshu.com/publish/publish` | 无 | 200 |
| 公众号 | 复制 → `https://mp.weixin.qq.com/` | 无 | 200 |
| 抖音 | 复制 → `https://creator.douyin.com/creator-micro/content/upload` | 无 | 200 |
| 知乎 | 复制 → `https://zhuanlan.zhihu.com/write` | 无 | 302 登录 |
| 头条号 | 复制 → `https://mp.toutiao.com/profile_v4/graphic/publish` | 无 | 200 |
| Medium | 复制 → `https://medium.com/new-story` | 无 | 403（拦截机器访问，浏览器正常） |

## 任务
- T168 方案 + PHASE16 标注
- T169 #war-share 页面：来源、平台选择、AI/模板生成、编辑、计数、复制、打开
- T170 shares 记录 + 数据分析时间线 + 账号中心免费路径徽章
- T171 测试、390px、截图、推送
