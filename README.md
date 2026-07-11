# 静词 Stillword

一个从语感出发的高中英语学习网页。首屏直接进入今日学习，不做营销式落地页。

## 已实现

- 语法：起步、中阶、进阶共 12 节可完成课程，固定采用“看情境 -> 凭感觉选 -> 看差异 -> 换情境再用”。
- 词汇：完整 3600 条高中范围词库，基础、中阶、拔高各 1200 词；支持中英文搜索、分页、发音、词本和间隔复习状态。
- 每日阅读：3 篇原创短文按本地日期轮换，支持点词释义、收藏进词本、全文朗读和理解题。
- 进度：使用 `localStorage` 保存在当前浏览器，无需登录，并同步同源的其他标签页。
- 响应式：覆盖 375、768、1024、1440 像素宽度，并支持 `prefers-reduced-motion`。

## 本地运行

```bash
npm install
npm run dev
```

质量检查：

```bash
npm run lint
npm test
npm run build
```

## 词库生成

仓库已提交生成后的 `src/data/vocabulary.json`，运行网页不需要 Python。重新生成时：

```bash
python3 -m venv work/.venv
work/.venv/bin/pip install wordfreq
work/.venv/bin/python scripts/build_vocabulary.py
```

脚本会断言总数恰好为 3600、词条不重复、每档恰好 1200。原始清单与图片来源见 [ATTRIBUTIONS.md](./ATTRIBUTIONS.md)。

## Render 部署

根目录的 `render.yaml` 将项目配置为 Render Static Site：

- Build command: `npm ci && npm run build`
- Publish directory: `./dist`
- SPA rewrite: `/* -> /index.html`

连接 GitHub 仓库后，Render 会在后续 push 时自动重新部署。
