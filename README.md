# 字帖小助手 · Copybook Helper

免费、免注册、**纯前端离线**的字帖模板与生成器。输入汉字 / 拼音 / 英文 / 古诗，自动标注读音、描红临摹、分页排版，一键打印或「另存为 PDF」。

> 多端项目：当前已完成 **Web 网站版**，后续会补齐 iOS / Android / 微信小程序等版本（均复用同一套排版核心逻辑 `web/assets/js/core/`）。本文件先记录整体结构与 Web 版，其它端完成后在此补充。

## 各端进度

| 平台 | 状态 | 说明 |
| --- | --- | --- |
| Web 网站版 | 已发布 | `web/`，GitHub Pages 在线访问 |
| iOS | 规划中 | 复用 `core/` 排版逻辑 |
| Android | 规划中 | 复用 `core/` 排版逻辑 |
| 微信小程序 | 规划中 | 复用 `core/` 排版逻辑 |

## Web 网站版（当前可用）

- 在线访问：https://jdb156158.github.io/copybook/
- 手机外壳版：https://jdb156158.github.io/copybook/mobile.html
- 功能：31 种预设版式、离线拼音与多音字校对、描红临摹、12 种矢量格型、分页排版、深浅主题、打印 / 导出 PDF。
- 本地运行：
  ```bash
  cd web
  python3 -m http.server 8770
  # 打开 http://127.0.0.1:8770
  ```
  也可直接双击 `web/index.html`（零依赖、零构建、无网络请求）。
- 详细说明与更新日志见 [`web/README.md`](web/README.md)。

## 仓库结构

```
copybook/
├── web/                  # 网站版（已发布）；含可复用的 core/ 排版逻辑
│   ├── assets/js/core/   # 纯逻辑层：拼音 / 格型 / 模板 / 排版 / 渲染 / 状态（无 DOM 依赖，供各端复用）
│   ├── assets/js/ui/     # 桌面 + 手机外壳版 UI 与控件
│   └── README.md         # Web 版详细文档与更新日志
└── （iOS / Android / 小程序 目录待建，与 web/ 并列）
```

## 部署

Web 版通过 `gh-pages` 分支发布：将 `web/` 子目录推送到 `gh-pages` 分支根目录，GitHub Pages 从 `gh-pages` / `root` 提供服务。

```bash
# 把 web/ 子目录推送到 gh-pages 分支（更新站点）
git subtree push --prefix web origin gh-pages
```
