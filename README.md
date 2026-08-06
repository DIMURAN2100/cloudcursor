# cloudcursor · AI简化安全

全球 AI 安全简报仓库 + 学习站。

## 学习站（本地预览）

品牌：**AI简化安全**。把 `briefings/` 日报解析为今日态势、主题学堂、安全工程师路径与架构图。

```bash
cd web
npm install
npm run dev
```

构建预览：

```bash
cd web
npm run build
npm run preview
```

## AI 安全简报自动发布

简报文件命名：**东八区日期 + 关键主体** → `briefings/YYYY-MM-DD-{关键主体}.md`（主体中的空格与非法文件名字符会替换为下划线，并截断长度；非 ASCII 主题会使用 `brief-{hash}` 以免 GitHub 路径兼容问题）。

每日生成正文后，在仓库根目录执行（stdin 或文件二选一）：

```bash
export BRIEFING_TOPIC="全球网络安全简报"
./scripts/publish-ai-briefing.sh < briefing.md
# 或
./scripts/publish-ai-briefing.sh ./briefing.md
```

脚本会：`fetch` → 检出远程分支 `AI安全新闻` → `pull --rebase` → `git add` 该简报 → `commit` → **`git push -u origin AI安全新闻`**（直推）。

在 Cursor 自动化里：在生成简报步骤之后增加上述命令，并设置 `BRIEFING_TOPIC` 为当日最核心的一条标题或主题词即可。

调试（不写远程）：`SKIP_PUSH=1 ./scripts/publish-ai-briefing.sh briefing.md`
