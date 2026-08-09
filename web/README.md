# AI简化安全 · 站点

全球 AI 安全学习站（本地预览优先）。内容源为仓库根目录 `briefings/` 日报 Markdown。

## 开发

```bash
cd web
npm install
npm run dev
```

## 构建预览

```bash
npm run build
npm run preview
```

## 结构

- `src/lib/briefings.ts` — 解析日报要点与主题归类
- `src/pages/` — 首页、简报台、主题学堂、学习路径、架构图、方法
- `src/components/*Diagram.astro` — 三张架构图

发布渠道未锁定；当前以本地/预览验收。
