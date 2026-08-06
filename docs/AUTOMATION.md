# 每日智能更新 Automation

学习站的「智能」放在云端每日流水线里，由 Cloud Agent 完成语义级加工；网站本身保持纯静态、零运行时成本。

## 架构

```text
Cursor Automation（定时，东八区每日）
  └─ Cloud Agent（VM，由 .cursor/environment.json 预装 web 依赖）
       1. 同步简报    ./scripts/sync-briefings-to-site.sh
       2. 智能加工    阅读当日简报，生成 data/enrichment/daily/YYYY-MM-DD.json
                      （头条、管理层决策摘要、必要时纠正要点归类）
                      按需补充 data/enrichment/glossary.json 新术语
       3. 构建验证    cd web && npm run build
       4. 提交推送    git commit && git push
```

站点构建时消费 enrichment 数据：首页头条与管理层摘要、术语墙、归类覆盖，全部自动生效。

## Automation 配置建议

- **触发器**：Scheduled，建议在简报发布流程完成之后（如东八区每日 09:30）
- **仓库**：本仓库，站点分支
- **权限**：允许 push；无需其他外部工具

## 可直接粘贴的 Prompt

```text
你在 AI简化安全 学习站仓库工作，执行每日智能更新：

1. 运行 ./scripts/sync-briefings-to-site.sh 同步最新简报（SKIP_COMMIT=1）。
2. 阅读 briefings/ 中最新日期的简报全文，生成 data/enrichment/daily/{当日日期}.json：
   - headline：一句话概括今日主线（面向安全从业者，不要空话）
   - execSummary：3 条管理层决策摘要，每条含 title（现象）、insight（为什么重要）、
     action（本周可执行的一个动作）
   - classifications：检查站点自动归类是否有明显错分（对照 web/src/lib/taxonomy.ts
     的主题与维度定义），仅对错分的要点写覆盖，键为 "简报slug#要点序号"
3. 若简报出现术语墙（data/enrichment/glossary.json）尚未收录的高频新概念，
   追加 1-2 条术语（term/en/definition/theme/dimension）。
4. cd web && npm run build 验证构建通过。
5. git add 变更并提交（消息：chore: 每日智能更新 YYYY-MM-DD），push 到当前分支。

要求：JSON 必须符合 web/src/lib/enrichment.ts 中的类型定义；摘要基于简报事实，
不要编造；构建失败时修复后再提交。
```

## 智能能力清单（当前）

| 能力 | 实现位置 | 形态 |
|---|---|---|
| 每日头条与管理层摘要 | `data/enrichment/daily/*.json` | Agent 语义生成 |
| 要点归类纠错 | 同上 `classifications` | Agent 覆盖规则归类 |
| 术语墙 | `data/enrichment/glossary.json` | Agent 持续补充 |
| 主题/维度/地区/公司挂接 | 构建时正则 | 规则兜底 |

## 后续可扩展

- 周报合成（`data/enrichment/weekly/`，趋势与复盘页）
- 站内全文搜索（Pagefind，纯静态）
- 语义相似事件推荐（构建时向量化）
