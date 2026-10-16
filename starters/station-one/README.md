# Station One Starter（站一最小英文单页）

把本目录部署出去 = 练站营任务 **「点亮灯塔」**（`q-s1-02`）的最快路径。

线上预览（本仓 Pages）：  
https://yuanqingsong2024.github.io/gefei-quest/starters/station-one/

---

## 1. 替换清单（必做）

| 找 | 换成 |
|----|------|
| `YOURBRAND` | 你的品牌词 / 唯一主词 |
| `yourbrand.example` | 真实域名（可后补） |
| `you@yourbrand.example` | 联系邮箱（可后补） |
| 「What this site is」段落 | 一句话说明做什么 |

也可用编辑器全局替换 `YOURBRAND`。

---

## 2. 部署 · GitHub Pages（推荐 · 与本仓一致）

### 方式 A：放进已有 Pages 仓库

1. 复制本目录到仓库任意路径（例如 `starters/station-one/` 或仓库根目录只留 `index.html`）。
2. 仓库 **Settings → Pages → Deploy from branch** → `main` / `/ (root)` 或 `/docs`。
3. 数分钟后打开 `https://<user>.github.io/<repo>/`（若在子目录则带上路径）。

### 方式 B：新建仓库只放这一页

```bash
mkdir my-station-one && cd my-station-one
cp /path/to/gefei-quest/starters/station-one/index.html .
# 编辑 index.html 替换 YOURBRAND
git init
git add index.html
git commit -m "Station one starter"
gh repo create my-station-one --public --source=. --remote=origin --push
# Settings → Pages → main / root
```

自定义域：Pages 设置里填 Domain，并按提示加 DNS。

---

## 3. 部署 · Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages**.
2. 接 Git 仓库，或 **Direct Upload** 上传含 `index.html` 的文件夹。
3. 构建命令留空；输出目录为上传根目录（Direct Upload）或 `/`。
4. 绑定自定义域（可选）。

注意：若计划以后广告变现，核对套餐是否允许商用。

---

## 4. 上线后（对应作战室 Day4–6）

1. GA4 或 Clarity  
2. Google Search Console 验证  
3. 提交 sitemap 或 URL 检查 → 请求编入索引  
4. 收录后搜品牌词 / `site:你的域名` → 勾游戏 Boss

配合：[站一作战室](../../index.html#war) · [作战手册](../../docs/station-one-playbook.md)

---

## 诚实声明

不保证收录时间或任何收入。本模板仅用于练手上线。
