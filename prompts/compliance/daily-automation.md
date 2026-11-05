# 每日智能更新 · 可粘贴提示词

把下面整段粘贴到「AI简化安全情报网站」每日自动化，替换原来的提示词。简报加工保持不变；合规解读是新增的第二步，而且必须先有官方语料。

```text
你在「AI简化安全」学习站仓库工作，执行每日智能更新。

目标有两项：同步并加工 AI 安全简报；对新增的官方文件语料做合规解读，推送到 main。推送 main 后，GitHub Actions 会更新 GitHub Pages。

## 硬性边界

- 简报加工仍以 briefings/ 最新日期的简报为来源。近 7 日只作趋势对照。不重新大规模检索新闻。
- 合规解读只允许读取 data/compliance/corpus/ 中 text_complete 为 true 的语料。不另找新闻稿补写条款。
- 不编造语料中不存在的条款、义务、文号和关联关系。
- 分析标准只使用 prompts/compliance/system-v1.md。明确义务、条件性义务、指导建议、分析推导必须分开。
- 文件没写智能体、MCP、提示词注入时，不得写成该文件的义务。
- 不修改网站视觉、页面结构和 taxonomy 定义，不改简报正文，不改已入库语料正文。
- 新闻分支上的 data/compliance/analyses/ 一律忽略。解读只写在当前站点分支。

## 步骤

### 1. 更新 main

git fetch origin main AI安全新闻
git checkout main
git pull --rebase origin main

不能切换分支时，留在当前分支，最后仍 git push origin HEAD:main。

### 2. 同步简报和语料

SKIP_COMMIT=1 ./scripts/sync-briefings-to-site.sh

该脚本同步 briefings/，以及新闻分支上的 data/compliance/corpus/。它不会覆盖 analyses/。

若同时满足：briefings/ 无变化，corpus/ 无变化，当日 data/enrichment/daily/YYYY-MM-DD.json 已存在，且没有“有语料但没有 passed 分析”的 id，则结束，不创建空提交。

### 3. 简报智能加工

找出 briefings/ 最新东八区日期。该日有多份简报则全部阅读。

生成或更新 data/enrichment/daily/YYYY-MM-DD.json，格式不变：

- headline：一句话结构性主线
- execSummary：恰好 3 条，每条含 title、insight、action。action 必须可执行
- classifications：只纠正自动分类明显错误的条目，键为「简报slug#要点序号」，theme 和 dimension 来自 web/src/lib/taxonomy.ts

术语墙 data/enrichment/glossary.json：最新简报有值得长期保留的新概念时最多追加 1～2 条。处理了新简报时，把 updatedAt 改为该简报日期。没有合适术语就不要新增条目。

### 4. 合规解读

列出 corpus 中 text_complete 为 true、且 analyses/{id}.json 不存在或语料比分析更新的 id。每次最多处理 1 份。

按 prompts/compliance/system-v1.md 写出 analyses/{id}.json。

写完后换一次审查口吻，只做检查、不放宽标准：

1. quote 是否为 source.md 的连续原文。
2. 指导建议有没有被写成明确义务。
3. 发布、施行、废止有没有混用。
4. 智能体、MCP、提示词注入是否被写成文件义务。
5. 关联文件是否超出原文点名范围。

有问题就改正。改不了的把 review.status 设为 needs_human，并且不要把该文件算作本次成功发布；构建校验会拒绝 needs_human。

没有新语料则跳过本步。

### 5. 验证

cd web
npm ci
npm run build
cd ..

构建失败先修数据或类型，不得跳过。

### 6. 提交并推送 main

git add briefings/ data/enrichment/ data/compliance/
git commit -m "chore: 每日智能更新 YYYY-MM-DD"

无变更则不提交。

git push origin HEAD:main

远端更新导致失败时：

git pull --rebase origin main
git push origin HEAD:main

只重试一次，禁止 force push。

## 最终回复

说明：同步了哪一天、多少份简报；是否生成每日 enrichment；是否更新术语墙；是否新增或更新了哪一份合规分析；构建是否成功；main 是否推送成功。没有新简报也没有新语料时，写明“无新简报、无新语料，未创建提交”。
```
