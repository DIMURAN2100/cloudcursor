# 每日智能更新 Automation

学习站的「智能」放在云端每日流水线里，由 Cloud Agent 完成语义级加工；网站本身保持纯静态、零运行时成本。

## 架构

```text
采集 Automation（AI安全新闻）
  ├─ 新闻简报     briefings/YYYY-MM-DD-*.md
  └─ 官方原文     data/compliance/corpus/{id}/source.md + meta.json
                  （不写解读，不判断义务）

每日 Automation（main）
  └─ Cloud Agent
       1. 同步       ./scripts/sync-briefings-to-site.sh
                     （briefings/ 与 corpus/，不覆盖 analyses/）
       2. 简报加工   data/enrichment/daily/YYYY-MM-DD.json、术语墙
       3. 合规解读   仅对新的完整语料运行 prompts/compliance/system-v1.md
                     输出 data/compliance/analyses/{id}.json
       4. 构建验证   cd web && npm run build
       5. 提交推送   git push origin HEAD:main
```

站点构建时消费 enrichment 数据：首页头条与管理层摘要、术语墙、归类覆盖，全部自动生效。

## Automation 配置建议

- **触发器**：Scheduled，建议在简报发布流程完成之后（如东八区每日 09:30）
- **仓库**：本仓库，站点分支
- **权限**：允许 push；无需其他外部工具

## 可直接粘贴的 Prompt

每日更新与官方文件采集已经分成两段提示词，避免把新闻简报写成合规义务：

- 采集自动化：[`prompts/compliance/collection-automation.md`](../prompts/compliance/collection-automation.md)
- 每日智能更新：[`prompts/compliance/daily-automation.md`](../prompts/compliance/daily-automation.md)
- 合规分析标准：[`prompts/compliance/system-v1.md`](../prompts/compliance/system-v1.md)

采集任务只把官方全文放进 `data/compliance/corpus/`，并继续发布新闻简报到「AI安全新闻」。每日任务同步简报和语料，简报仍生成 `data/enrichment/daily/`，新语料才按系统提示词写入 `data/compliance/analyses/`。解读必须区分明确义务、条件性义务、指导建议和分析推导。构建时会核对引文是否真的出现在语料里。

## 智能能力清单（当前）

| 能力 | 实现位置 | 形态 |
|---|---|---|
| 每日头条与管理层摘要 | `data/enrichment/daily/*.json` | Agent 语义生成 |
| 要点归类纠错 | 同上 `classifications` | Agent 覆盖规则归类 |
| 术语墙 | `data/enrichment/glossary.json` | Agent 持续补充 |
| 主题/维度/地区/公司挂接 | 构建时正则 | 规则兜底 |
| 中国合规知识库 | `data/compliance/analyses/*.json` | 官方语料上的条款解读，构建时回链原文 |

## 后续可扩展

- 周报合成（`data/enrichment/weekly/`，趋势与复盘页）
- 站内全文搜索（Pagefind，纯静态）
- 语义相似事件推荐（构建时向量化）
