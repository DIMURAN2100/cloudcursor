# 全球网络安全简报（AI 专题）— 2026-11-28（GMT+8）

本期以东八区 2026 年 11 月 26 日至 11 月 28 日早晨新公开的公告和采访为主。markdownify-mcp 的仓库公告发布于 11 月 25 日 21:24 UTC，距今约 50 小时，列入放宽后的 72 小时窗口。瑞士国家网络安全中心书面通报的页面时间为 11 月 24 日 13:09 UTC，距今约 82 小时；下面采用的五起案件数字来自 11 月 26 日的公开采访。

---

### 一、今日要点

**[1] 瑞士确认五起智能体攻击**
📌 类型：AI赋能安全

瑞士国家网络安全中心（NCSC）英文页面的时间戳为 2026-11-24T13:09:01Z，标题写明这是该国首次确认由人工智能智能体实施的网络攻击。页面称，近期收到针对瑞士境内组织、以及至少两个行业的关键基础设施运营者的报告；攻击使用所谓 Agentic Offensive Frameworks，利用默认或易猜口令，以及联网系统上的已知漏洞，定位目标的时间远短于人工。页面把可从互联网访问的这类智能体数量描述为自 10 月以来几乎翻倍，并举 ARTEX 与 CyberStrikeAI 作为可访问工具的例子，没有把它们写成这几起案件已经核实使用的工具。Swissinfo 的刊出时间为 2026-11-26T08:37:46Z，引述局长 Florian Schütz 当天对瑞士广播电视台的谈话：目前有五起已确认案件，其中三起指向关键基础设施，两起得手，没有重大中断，攻击者仍不清楚；同一篇报道把周二通报中的另一句写成私营机构也受到使用人工智能程序的攻击。瑞士广播电视台 11 月 26 日 6 时的节目另写明，中小企业有自愿报告，局方暂不公布受害单位名称。

🔗 来源：[NCSC](https://www.bacs.admin.ch/en/26-ki-agenten-1-en) · [Swissinfo](https://www.swissinfo.ch/eng/swiss-ai/switzerland-reports-first-ai-based-cyberattacks-on-critical-infrastructure/92440400) · [SRF](https://www.srf.ch/news/schweiz/fuenf-bestaetigte-faelle-erstmals-cyberangriffe-mit-ki-agenten-in-der-schweiz)

**[2] 连接令牌越出允许范围**
📌 类型：AI基础设施CVE

NVD 于 2026-11-26T12:17:09Z 公开 CVE-2026-131688，CVSS 3.1 为 8.1，向量为 `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H`。记录写明，面向 Claude、ChatGPT、Gemini、Cursor 等智能体的 WordPress 插件 Secure MCP Server，在 1.5.8 及更早版本没有正确核验调用者是否有权执行操作。持有有效 MCP bearer token 的攻击者，包括范围已被限制的连接测试 token，可以使自己的账户获得该 token 所属管理员的完整管理员角色，从而绕过插件的能力允许列表和范围限制。NVD 没有描述在野利用。插件目录当前版本为 1.5.11，最近更新时间为 2026-11-27；1.5.9 及之后的更新说明没有点名这一编号。

🔗 来源：[NVD CVE-2026-131688](https://nvd.nist.gov/vuln/detail/CVE-2026-131688) · [插件更新说明](https://plugins.svn.wordpress.org/miniorange-secure-mcp-server/trunk/readme.txt)

**[3] 研究应用未核验访问者**
📌 类型：AI自身安全

Pydantic Deep 仓库于 2026-11-26T23:48:16Z 发布两则公告，并在同一分钟发布 0.4.0。GHSA-26gv-pq4g-6m85 写明，捆绑的 DeepResearch 应用在可从网络访问时，未经认证即可读取会话数据并执行会改变状态的操作，HTTP 与 WebSocket 都受影响；公告给出的 CVSS 3.1 为 7.5，向量为 `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`，完整性被标为无。NVD 将同一问题编号为 CVE-2026-137953，受影响范围写为 0.2.18 至 0.4.0 之前、且服务绑定到全部网络接口的部署，描述中还包括枚举会话、读取事件日志和工作区文件、驱动研究代理以及删除会话。同日 GHSA-f4p6-c493-769c（CVE-2026-137954，CVSS 同样为 7.5，向量同样只把机密性标为高）写明，若安装了导出组件，导出含不可信内容的报告时，渲染器会取回服务器能够访问的资源；0.4.0 所含的 DeepResearch 0.2.0 改为清理报告，并在渲染时关闭资源获取。0.4.0 的发行说明写明该应用默认只绑定本机回环，并要求在启动前设置操作员口令。两则公告都没有描述在野利用。

🔗 来源：[GHSA-26gv-pq4g-6m85](https://github.com/vstorm-co/pydantic-deepagents/security/advisories/GHSA-26gv-pq4g-6m85) · [GHSA-f4p6-c493-769c](https://github.com/vstorm-co/pydantic-deepagents/security/advisories/GHSA-f4p6-c493-769c) · [0.4.0](https://github.com/vstorm-co/pydantic-deepagents/releases/tag/0.4.0)

**[4] 图片导入未做类型检查**
📌 类型：AI基础设施CVE

NVD 于 2026-11-26T10:17:07Z 公开 CVE-2026-131589，CVSS 3.1 为 7.2，向量为 `AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H`。记录写明 WordPress 插件 AI Engine 在 3.9.4 及更早版本中，按 URL 创建图片的接口在请求不提供文件名时，用 URL 本身决定保存文件的扩展名，并把下载内容写入上传目录；利用需要已认证的编辑者及以上权限。插件更新说明把对应修复写在 3.9.5，日期为 2026/11/22，原文是从 URL 导入的图片和写入媒体库的文件改为与其他上传做相同的文件名和内容检查。这一编号到 11 月 26 日才出现在 NVD，记录没有描述在野利用。其后的 3.9.6、3.9.7 是功能修复，安全修复版本以 3.9.5 为准。

🔗 来源：[NVD CVE-2026-131589](https://nvd.nist.gov/vuln/detail/CVE-2026-131589) · [AI Engine 更新说明](https://plugins.svn.wordpress.org/ai-engine/trunk/readme.txt)

**[5] 转写工具地址校验可绕过**
📌 类型：AI基础设施CVE

markdownify-mcp 仓库公告 GHSA-pxwh-pcrm-vrm3 的发布时间为 2026-11-25T21:24:37Z，修复版本 v1.2.0 于约七分钟前发布。公告写明 1.1.0 及更早版本中，网页、视频和搜索转写以及 Git 仓库转写所用的地址校验可以被绕过：校验把主机名交给只识别字面量 IP 的库，域名得不到私网判定；括号形式的 IPv6 字面量和 scp 风格简写也在绕过之列。NVD 编号为 CVE-2026-137308，CVSS 3.1 为 7.4，向量为 `AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:N/A:N`。公告没有描述在野利用。

🔗 来源：[GHSA-pxwh-pcrm-vrm3](https://github.com/zcaceres/markdownify-mcp/security/advisories/GHSA-pxwh-pcrm-vrm3) · [NVD CVE-2026-137308](https://nvd.nist.gov/vuln/detail/CVE-2026-137308)

---

### 二、深度速览

#### 【AI 赋能防御】

瑞士通报把可观察的变化写成速度，而不是新的入口类型。书面页面称，智能体寻找的是默认或易猜口令以及联网系统上的已知漏洞，定位时间远短于人工；防御方作出反应后，工具会改用其他方法，组织可用于发现和处置的时间因此变短。页面没有给出检出率，也没有公开受害单位名称或指标列表；它写明技术指标只向关键基础设施运营者分享。11 月 26 日新增的是案件计数：五起已确认，三起指向关键基础设施，两起得手，没有重大中断。自 10 月以来“几乎翻倍”的对象是可从互联网访问的智能体工具数量，不是受害组织数。

公开页面列出的措施都针对互联网可达系统：能限制的就限制，例如地理封锁或允许列表；关键更新在发布后 24 小时内安装；Webmail、VPN 等从互联网可达的内部资源一律使用多因素认证或通行密钥；权限按最小必要授予；对身份、应用、工作负载和基础设施偏离既有行为与数据量的情况做检测。这些是该中心写给瑞士企业和关键基础设施运营者的建议，页面没有附带效果数据。

🔗 来源：[NCSC](https://www.bacs.admin.ch/en/26-ki-agenten-1-en) · [Swissinfo](https://www.swissinfo.ch/eng/swiss-ai/switzerland-reports-first-ai-based-cyberattacks-on-critical-infrastructure/92440400)

#### 【AI 系统风险】

这四则编号的共同前提是工具或插件已经暴露给网络上的调用方，差别在于谁可以调用。Pydantic Deep 的 7.5 分公告不要求认证，NVD 把可达条件写成服务绑定到全部网络接口；仓库公告同时写了“会改变状态的操作”，但给出的向量把完整性标为无，删除会话和驱动代理只出现在 NVD 的文字里。PDF 导出那一则还要求安装了导出组件，并且报告里有不可信内容。0.4.0 把默认监听改到本机回环，因此已经只监听回环、且没有安装导出组件的部署，对不上 NVD 写明的那组暴露条件。

Secure MCP Server 的 8.1 分记录把复杂度标为高，前提是攻击者已经持有有效 token，包括范围受限的连接测试 token。结果是攻击者自己的账户变成该 token 所属管理员的完整管理员，而不是直接远程执行代码。AI Engine 的 7.2 分记录则要求编辑者及以上权限，入口是按 URL 导入图片时未做与其他上传相同的类型检查；3.9.5 的更新说明写于 11 月 22 日，编号晚四天才出现。markdownify-mcp 的 7.4 分公告要求用户交互，范围被标为改变，校验失败的原因是主机名没有先被解析成地址。四处公告都没有写在野利用。

🔗 来源：[GHSA-26gv-pq4g-6m85](https://github.com/vstorm-co/pydantic-deepagents/security/advisories/GHSA-26gv-pq4g-6m85) · [NVD CVE-2026-131688](https://nvd.nist.gov/vuln/detail/CVE-2026-131688) · [GHSA-pxwh-pcrm-vrm3](https://github.com/zcaceres/markdownify-mcp/security/advisories/GHSA-pxwh-pcrm-vrm3)

#### 【全球治理与标准】

本日该类别无可核实的重要更新，不强行补充。

---

### 三、今日趋势洞察

瑞士已经确认的五起案件，打的仍是默认或易猜口令和联网系统上的已知漏洞；同一窗口新公开细节的缺陷，正是这类入口在智能体工具侧的样子。Pydantic Deep 在绑定到全部接口时不核验访问者，Secure MCP Server 的有效 token 可以越出允许范围，markdownify-mcp 的地址校验认不出域名。三处都不是新的攻击类别，而是已经交给模型调用的服务缺少与普通远程接口相同的认证和目标限制。

---

### 四、企业行动清单

- 按瑞士 NCSC 书面通报，检查本组织从互联网可达的系统是否仍使用默认或易猜口令，关键更新能否在发布后 24 小时内安装，并从互联网可达的 Webmail 与 VPN 是否都要求多因素认证或通行密钥。
- 清点安装了 Secure MCP Server 且版本为 1.5.8 或更低的 WordPress 站点。NVD 写明这一区间受 CVE-2026-131688 影响。插件目录当前版本为 1.5.11，更新说明没有点名该编号；在版本高于 1.5.8 之前，收回已经发给外部 MCP 客户端的 bearer token。
- 清点对非回环地址提供服务、且版本低于 0.4.0 的 Pydantic Deep 或捆绑 DeepResearch。仓库公告与 0.4.0 发行说明写明，该版本默认只绑定本机回环，并要求设置操作员口令；安装了导出组件的实例一并升到 0.4.0，以覆盖 CVE-2026-137954。
- 把仍为 3.9.4 或更低的 AI Engine 升到 3.9.5 或更高。更新说明中的安全修复写在 2026/11/22 的 3.9.5，对应 NVD 于 11 月 26 日编号的 CVE-2026-131589。
- 把 markdownify-mcp 升到 v1.2.0 或更高。仓库公告写明 1.1.0 及更早版本的地址校验可被绕过，公告发布于 2026-11-25T21:24:37Z。
