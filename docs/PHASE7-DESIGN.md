# Phase 7 · 整站美化 + 网站式首页（锁定默认）

日期：2026-10-16 · 默认值已锁定，不再征询。

## 锁定决策
| 项 | 默认 |
|---|---|
| 首页形态 | 真正落地页：吸顶导航 + 全幅 Hero（`assets/hero-bg.webp/jpg` + 深色渐变）+ 分区 + 页脚 |
| 默认路由 | `/` 与 `#home` → 落地页；其余 hash 进入「应用区」，显示 HUD + Tab |
| 导航 | 首页 / 开始练站(#war) / 作战室(#war) / 资源库(resources.html) / 手册(#home-guides) / 关于(#home-faq) |
| 主 CTA | 「开始站一」→ `#war`；「逛资源库」→ `resources.html#tools` |
| 分区 | 五步路线 · 你能得到什么 · 进度快照(读 `gefei-quest-save-v1`) · 资源入口条 · 手册与模板 · FAQ · 页脚 |
| 图标 | `assets/icon-512/192.png`、`apple-touch-icon.png`、`favicon-32.png`、`favicon.ico`、`manifest.webmanifest` |
| 视觉 | 系统中文字体栈；正文近白 #f1f5f9；链接金/亮青；玻璃卡片 + 细边光晕；内页背景为暗化 hero 固定层 |
| 动效 | 仅 hover/淡入；`prefers-reduced-motion` 与设置「减少动效」全部关闭 |
| 兼容 | 不改存档 key / 结构；hash 路由、作战室 Tab、`#tools` `#xianyu` 深链保持 |
| 响应式 | ≤420px 导航折叠为横向滚动，Hero 单列 |

## 任务
见 TASKS.md T88–T95。
