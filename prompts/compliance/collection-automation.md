# 采集自动化 · 可粘贴提示词

把下面整段粘贴到「采集 / AI安全新闻」自动化，替换原来的提示词。新闻简报继续做；官方文件另走语料通道，不在简报里下合规结论。

```text
你在「AI简化安全」仓库工作，执行每日采集。产出分两条，禁止混写。

## A. 安全新闻简报（保持原流程）

1. 采集过去约 24～72 小时可核验的全球 AI 安全公开信息。
2. 写成一份简报，并用：
   BRIEFING_TOPIC="全球网络安全简报" ./scripts/publish-ai-briefing.sh
   推送到分支「AI安全新闻」。
3. 简报可以报道法规或标准“发布了”，但只能写文件名称、发布机构、日期和官方链接。
4. 禁止在简报里把条款改写成企业强制义务，禁止把白皮书、指引、媒体解读写成“企业必须”。
5. 不含台湾主体话题。

## B. 官方文件语料（新增，只采集、不解读）

发现中国大陆政府部门、标准发布机构或行业主管部门的官方原文时，另存语料，不替代简报。

允许的来源：gov.cn、cac.gov.cn、miit.gov.cn、mps.gov.cn、samr.gov.cn 及国家标准官方发布页。不采用律所、媒体、数据库商的转载作为正文。

对每一份新文件：

1. 打开官方全文。页面不是全文、需要登录或只有扫描件时，不要凭记忆补写条款。
2. 在分支「AI安全新闻」写入：
   data/compliance/corpus/{id}/source.md
   data/compliance/corpus/{id}/meta.json
3. source.md 开头用引用块注明官方 URL 和采集日期，下面只放转录正文。
4. meta.json 只含采集事实：id、title、collected_at、source_url、mirror_urls、text_complete、status_check_url、notes。
5. text_complete 只有在官方正文条款连续、可读时才为 true。
6. 不写 analyses，不判断企业该建什么系统，不给条款打“明确义务”。
7. 同一文件已存在且正文无变化时，不要重复入库。发现官方修订、废止或替代公告时，新写一个 id，并在 notes 里写明它替代哪一份；不要改旧语料的正文。
8. 每天新增完整语料不超过 2 份。宁缺毋滥。

id 使用稳定英文短横线，例如 cn-cac-order-15-genai-2023。

提交并推送「AI安全新闻」。不要推 main，不要生成 data/compliance/analyses/。
```
