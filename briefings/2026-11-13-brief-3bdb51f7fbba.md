# 全球网络安全简报（AI 专题）— 2026-11-13（GMT+8）

本期覆盖东八区 2026-11-10 07:00 至 2026-11-13 07:00。Visual Studio Code、Kong 与 Arctic Wolf 的原文早于 48 小时、仍在 72 小时内；pgEdge 与 Opera 的公告在 48 小时内。

---

### 一、今日要点

**[1] 编辑器通知可执行代码**
📌 类型：AI自身安全

微软于美西 2026-11-10 08:00（东八区 11 月 11 日 00:00）公布 CVE-2026-120779。控制远程 MCP 服务器的未认证攻击者，在用户把 Visual Studio Code 连到该服务器并点击通知里的特制链接后，可以用户权限执行代码。MSRC 将严重性标为 Important，CVSS 3.1 基础分 9.6、时间分 8.3，并写明此前未公开披露、未见利用、利用可能性较低，同时要求客户采取行动。修复构建为 1.145.3，对应 GitHub 标签发布于 2026-11-10T18:53:52Z；1.145.0 的功能说明日期仍是 2026-11-04。

🔗 来源：[微软 MSRC](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-120779) · [Visual Studio Code 1.145 更新说明](https://code.visualstudio.com/updates/v1_145)

**[2] 模型名写入触发注入**
📌 类型：AI基础设施CVE

Kong 在日期为 2026-11-10 的产品更新日志中记录了 CVE-2026-92544 的修复，属厂商来源。客户端提供的模型名会被写入 LLM 用量计数使用的 license_llm_data 表；修复前这些值直接进入 SQL，调用者可能据此对 Kong 数据库执行任意 SQL。NVD 于 2026-11-10T21:21:40Z 收录该编号，CVSS 4.0 为 8.7，向量要求低权限，并带有额外攻击前提。厂商日志写明修复进入 Kong Gateway Enterprise 3.16.0.2、3.15.0.7、3.14.0.17、3.13.0.12、3.10.0.20，以及 Kong AI Gateway 2.2.1。日志和 NVD 都没有写在野利用。

🔗 来源：[Kong Gateway 更新日志](https://developer.konghq.com/gateway/changelog/) · [Kong AI Gateway 更新日志](https://developer.konghq.com/ai-gateway/changelog/) · [NVD CVE-2026-92544](https://nvd.nist.gov/vuln/detail/CVE-2026-92544)

**[3] 自定义工具可注入语句**
📌 类型：AI基础设施CVE

pgEdge 于 2026-11-11T08:34:52Z 公开 GHSA-r5pp-jx86-r6r9（CVE-2026-126197，CVSS 3.1 为 8.8）。1.0.0 及更早版本中，能够调用自定义 pl-do 工具的调用者可以把参数插进固定分隔的 DO 块，再以数据库连接角色执行自行选择的 SQL，并在只读连接上绕过 read_only；sql 与 pl-func 工具使用绑定参数，不在此项范围内。同一分钟公开的 GHSA-5gmh-9683-hhq9（CVE-2026-126199，NVD 记录的 CVSS 3.1 为 6.8）影响捆绑的 CLI 和 Web 客户端：allow_writes 打开时，客户端只按语句首个关键字决定是否确认写入，SELECT INTO、以 WITH 开头的数据修改公共表表达式，以及对写入语句的 EXPLAIN ANALYZE 会直接执行。两项的修复版本都是 1.1.0，该标签发布于 2026-09-04T08:29:31Z；公告写明升级不能说明注入或非预期写入是否已经发生。

🔗 来源：[GHSA-r5pp-jx86-r6r9](https://github.com/pgEdge/pgedge-postgres-mcp/security/advisories/GHSA-r5pp-jx86-r6r9) · [GHSA-5gmh-9683-hhq9](https://github.com/pgEdge/pgedge-postgres-mcp/security/advisories/GHSA-5gmh-9683-hhq9)

**[4] 渗透平台关联云端入侵**
📌 类型：AI赋能安全

Arctic Wolf Labs 于 2026-11-10 发布报告，仓库提交时间为 2026-11-10T16:41:08Z，属厂商来源。报告写明，托管 AntiFox 界面的阿里云系统与针对面向公网的 Web 服务及相关 AWS 环境的已确认恶意行为相关联；活动使用有效的 IAM 用户或代入的 EC2 角色，约半小时内跨多项服务枚举，其间出现对生产密钥的成功 GetSecretValue，以及对 S3 对象的读取、复制和删除，枚举范围包括 Amazon Bedrock。报告写明初始代码执行所用的漏洞没有确定，并把 AntiFox 描述为公开的、中文界面的智能体渗透测试平台。The Hacker News 于 11 月 11 日转述了同一份报告。

🔗 来源：[Arctic Wolf Labs 报告](https://github.com/rtkwlf/wolf-tools/blob/main/pack_alerts/202611-antifox-alibaba-hosted-platforms-facilitate-web-cloud-intrusions/README.md) · [The Hacker News](https://thehackernews.com/2026/11/antifox-ai-pentesting-platform-linked.html)

**[5] 扩展经枢纽下发指令**
📌 类型：AI自身安全

Opera 安全团队于 2026-11-12 发布 CVE-2026-123139。Opera Neon 在 macOS 与 Windows 上的 MCP Hub 扩展 0.0.1 没有核验通信来源，恶意浏览器扩展可以通过 MCP Hub 向内置 Browser Operator 扩展发送命令，从而控制浏览器。Opera 经 NVD 给出的 CVSS 4.0 为 5.8，攻击向量为本地，需要用户被动交互，利用状态标记为未报告。公告页面只列出受影响的 0.0.1，没有写出修复版本。

🔗 来源：[Opera 安全公告](https://security.opera.com/en/improper-verification-of-source-of-a-communication-channel-opera-security-advisories/) · [NVD CVE-2026-123139](https://nvd.nist.gov/vuln/detail/CVE-2026-123139)

**[6] 澳洲拟立法约束前沿模型**
📌 类型：AI治理合规

澳大利亚工业、创新与科学部长办公室发布联合媒体稿《New Australian AI safety and security protections》，联署方为总理、国防部长以及内政与网络安全部长。MediaNama 写明该联合稿日期为 2026-11-10；官方页面抽取文本使用“announcing today”，没有另写施行日期。稿件写明，强制性安全与安保保护将通过 Australian AI Standards 立法，适用于希望在澳大利亚运营的前沿人工智能公司，并由一个拟议的人工智能安全监管机构与澳大利亚人工智能安全研究所配合执行。页面列出该监管机构将要求公司承担的六类事项，范围包括开发与部署阶段的安全控制、模型风险的识别与管理、独立评估、向澳大利亚政府快速通报事件、维持并公布安全与安保框架，以及在标准更新后作出响应。

🔗 来源：[澳大利亚工业部长办公室](https://www.minister.industry.gov.au/t-ayres/media/new-australian-ai-safety-and-security-protections) · [MediaNama](https://www.medianama.com/2026/11/223-australia-safety-rules-regulator-frontier-ai-companies)

---

### 二、深度速览

#### 【AI 赋能防御】

本日没有带可核验效果数据的防御研究或产品更新，不强行补充。

#### 【AI 系统风险】

CVE-2026-120779 的入口是编辑器对 MCP 通知的渲染。MSRC 常见问题写明，攻击者无需先通过身份认证，前提是用户主动连接其控制的远程 MCP 服务器，并点击通知中的链接；成功后代码以用户权限运行，范围因用户交互而改变。MSRC 同时写明利用状态为未见利用、公开披露为否、最新软件版本上的利用可能性较低。CVRF 把修复构建记为 1.145.3，发布说明页把 1.145.3 列为处理安全问题的更新。1.145.0 的发布日期是 2026-11-04，核对时要看完整构建号是否达到 1.145.3。

pgEdge 的两项公告在同一分钟公开，暴露条件不同。CVE-2026-126197 位于服务器：自定义 pl-do 工具把 JSON 参数插进固定分隔的 DO 块，参数中的分隔标记可以提前结束代码块，后续文本按简单查询协议执行；只读事务也可以被注入的事务控制语句结束。公告写明，在 query_database 被关闭、只剩自定义工具的部署里，这项缺陷仍然成立。CVE-2026-126199 位于捆绑客户端：确认提示只看首个关键字，所以看起来像查询的写入不会询问用户。服务器侧的只读事务模式仍会拒绝这类写入，允许写入的连接则依赖这个客户端提示。1.1.0 已于 2026-09-04 发布；11 月 11 日的公告要求升级后复查数据库审计日志，因为升级本身不保留“是否已经发生”的结论。

CVE-2026-92544 位于网关的用量记账，而不是模型推理本身。厂商日志写明，模型名在写入 license_llm_data 之前没有转义；NVD 把影响描述为客户端可能对 Kong 数据库执行任意 SQL，CVSS 4.0 的 8.7 同时要求低权限和额外攻击前提。2026-11-10 当天的修复分散在五条 Gateway Enterprise 维护版本和 AI Gateway 2.2.1，部署按自己的版本分支对照同日日志里的对应构建。两条日志都没有提供在野利用说明。

🔗 来源：[微软 MSRC](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-120779) · [GHSA-r5pp-jx86-r6r9](https://github.com/pgEdge/pgedge-postgres-mcp/security/advisories/GHSA-r5pp-jx86-r6r9) · [GHSA-5gmh-9683-hhq9](https://github.com/pgEdge/pgedge-postgres-mcp/security/advisories/GHSA-5gmh-9683-hhq9) · [Kong Gateway 更新日志](https://developer.konghq.com/gateway/changelog/)

#### 【全球治理与标准】

澳大利亚上述联合媒体稿宣布的是即将写入 Australian AI Standards 的立法安排，适用对象是希望在澳大利亚运营的前沿人工智能公司。页面写明将提议由新的人工智能安全监管机构执行，并列出六类该机构将提出的要求；文本使用“will be legislated”和“will be required”，没有给出已经生效的日期，也没有公布立法细则的完成时间。核对时以部长办公室页面上的适用主体和时态为准。

🔗 来源：[澳大利亚工业部长办公室](https://www.minister.industry.gov.au/t-ayres/media/new-australian-ai-safety-and-security-protections)

---

### 三、今日趋势洞察

外部 MCP 服务提供的内容正在进入本地执行面：Visual Studio Code 会把远程服务器发来的通知渲染成可点击链接，Opera Neon 的 MCP Hub 则允许其他扩展向内置浏览器操作扩展下发命令。同一窗口里，调用者提供的字符串继续进入数据层，Kong 把模型名写入用量计数的 SQL，pgEdge 把自定义工具参数插进 DO 块，捆绑客户端又只按首个关键字决定是否确认写入。Arctic Wolf 记录到与 AntiFox 界面同址的云上活动已经读到生产密钥；澳大利亚联合稿则写明将立法约束前沿模型公司，页面没有给出已经生效的日期。

---

### 四、企业行动清单

- 将 Visual Studio Code 升级到 MSRC 列出的修复构建 1.145.3，并核对安装包时间不早于 2026-11-10T18:53:52Z 的该标签。升级完成前，不要把编辑器连接到未审核的远程 MCP 服务器。
- 按 2026-11-10 的厂商日志核对 Kong 版本：Gateway Enterprise 对应 3.16.0.2、3.15.0.7、3.14.0.17、3.13.0.12 或 3.10.0.20，AI Gateway 对应 2.2.1。当前构建不在该列表中时，到同一分支的 2026-11-10 日志查找 CVE-2026-92544 条目。
- 盘点 pgEdge Postgres MCP Server。低于 1.1.0 且定义了 pl-do 自定义工具的实例升级到 1.1.0 或更高，并按 GHSA-r5pp-jx86-r6r9 复查伴随 DO 块的非预期语句。使用捆绑 CLI 或 Web 客户端且打开 allow_writes 的连接，按 GHSA-5gmh-9683-hhq9 复查以 SELECT、WITH 或 EXPLAIN ANALYZE 开头的写入。
- 按 Arctic Wolf 2026-11-10 报告核查 CloudTrail：非常用托管网段上的 GetSecretValue，以及同一来源在短时间内跨多项 AWS 服务的 List、Get、Describe。报告写明初始漏洞未确定，因此同时检查面向公网的 IIS 应用是否由 w3wp.exe 新建 ASPX 文件。
- 清点 Opera Neon 的 MCP Hub 扩展是否仍为公告点名的 0.0.1；公告没有给出修复版本，在厂商写出后续版本前限制该浏览器上的非预期扩展。另核对澳大利亚联合媒体稿中的适用主体和立法时态，稿件写明保护措施将被立法，页面没有给出已经生效的日期。
