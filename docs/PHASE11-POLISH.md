# Phase 11 · 网站质感打磨

## 1. 网站感
- 顶栏吸顶，滚动超过 24px 收缩（高度变小、加阴影与毛玻璃）。
- 页脚：站点地图（栏目/资源库/手册/我的）、关于本站、更新日志、版本号（取 changelog 最新条目 id → v1.<id>）。
- 区块头带面包屑细化到子页：首页 / 实战作战室 / 选词练习板 等（已有，补全所有子页名）。

## 2. 图标
- js/icons.js 重画为同一家族：24 网格、stroke 1.75、圆角端点；新增 `badge(name, tone)` 渐变底徽章（6 种色调），模块卡片统一使用。
- Logo：SVG 原稿 assets/logo.svg（灯塔 + 航线 + 渐变圆角方块），由 Chrome 渲染生成 icon-512/192、apple-touch-icon、favicon-32、favicon.ico；manifest 同步。

## 3. 体验
- 路由切换淡入（reduced-motion 时关闭）。
- 骨架占位：首页进度快照、文档页渲染前显示骨架条。
- ≤640px 底部 Tab 栏（首页 / 路线 / 作战室 / 资源库 / 我的）。
- 全站搜索：任务、资源、手册、开发文档；快捷键 `/` 与 Ctrl/⌘+K，方向键 + 回车跳转。
- 回到顶部按钮；空状态插画（SVG）+ 提示。

## 4. 打磨
- 统一字号阶梯（--fs-xs…--fs-3xl）、间距（--sp-1…--sp-8）、卡片阴影（--sh-1/2）、hover/focus-visible 环；prefers-reduced-motion 全局关闭动画。

## 测试
site-check 增加：搜索打开/快捷键/结果跳转、底部栏 390px、回到顶部、顶栏收缩、0 失败；file://；截图 p11-*.png。
