/**
 * 站点知识体系：主题 → 研究维度，以及全球治理、标准框架、产业图谱的策展数据。
 * 简报要点在构建时按关键词自动挂接到维度/地区/标准/公司。
 */

export type Dimension = {
  slug: string;
  name: string;
  question: string;
  match: RegExp;
};

export type Theme = {
  slug: string;
  name: string;
  summary: string;
  focus: string;
  dimensions: Dimension[];
};

export const themes: Theme[] = [
  {
    slug: 'ai-self',
    name: 'AI 自身安全',
    summary: '模型与智能体作为被攻击对象：注入、越狱、投毒、权限失控。',
    focus: '以「模型指令边界终将被绕过」为设计前提，收紧动作与输出通道。',
    dimensions: [
      {
        slug: 'prompt-injection',
        name: '提示注入与越狱',
        question: '外部内容如何劫持模型指令流？直接/间接注入、多会话拆分、越狱手法。',
        match: /提示注入|越狱|jailbreak|注入攻击|多会话|指令流|prompt/i,
      },
      {
        slug: 'agent-security',
        name: 'Agent 与权限治理',
        question: '智能体拿到工具与凭证后会怎样失控？过度代理、MCP、技能市场投毒。',
        match: /agent|代理|智能体|MCP|技能|skill|过度代理|工具调用|插件/i,
      },
      {
        slug: 'data-model',
        name: '数据与模型层攻击',
        question: '训练与推理链路上的投毒、后门、模型窃取与幻觉滥用。',
        match: /投毒|后门|幻觉|模型窃取|训练数据|成员推理|RAG|记忆/i,
      },
      {
        slug: 'multimodal',
        name: '多模态与新攻击面',
        question: '图像、语音、视频输入如何成为绕过文本护栏的注入通道？',
        match: /多模态|图像|视觉|语音|像素|LVLM|视频/i,
      },
      {
        slug: 'eval-redteam',
        name: '评测与红队',
        question: '如何度量模型与 Agent 的安全性？基准、红队演练与认证。',
        match: /红队|测评|基准|评测|benchmark|竞赛|演练/i,
      },
    ],
  },
  {
    slug: 'ai-defense',
    name: 'AI 赋能防御',
    summary: 'AI 作为防御工具：SOC 自动化、漏洞挖掘、检测与响应。',
    focus: '关注信号质量与验证闭环，而不是工具堆叠。',
    dimensions: [
      {
        slug: 'agentic-soc',
        name: 'Agentic SOC 与告警编排',
        question: 'AI 如何把告警洪水变成可行动情报？分级、关联、自主调查。',
        match: /SOC|告警|SIEM|EDR|XDR|NDR|编排|分级|调查/i,
      },
      {
        slug: 'ai-vuln-hunting',
        name: 'AI 漏洞挖掘与渗透',
        question: '用模型规模化找漏洞：扫描验证流水线、PoC 生成、渗透认证。',
        match: /漏洞挖掘|渗透|PoC|挖洞|扫描|exploit|模糊测试|fuzz/i,
      },
      {
        slug: 'detection-intel',
        name: '检测与威胁情报',
        question: 'AI 驱动的威胁检测、钓鱼识别与情报生产如何落地？',
        match: /检测|威胁情报|钓鱼|恶意|狩猎|情报/i,
      },
    ],
  },
  {
    slug: 'infra-cve',
    name: '基础设施与供应链',
    summary: 'AI 运行时与其依赖链：网关 CVE、模型工件、开发依赖投毒。',
    focus: '把 AI 组件纳入与传统软件同级的补丁与监测节奏。',
    dimensions: [
      {
        slug: 'ai-runtime',
        name: 'AI 网关与推理设施',
        question: 'LiteLLM、Ollama、推理平台等组件的 CVE 与在野利用。',
        match: /网关|LiteLLM|Ollama|推理|vLLM|SGLang|CVE-\d{4}|KEV/i,
      },
      {
        slug: 'model-supply',
        name: '模型与工件供应链',
        question: '模型分发、部署链路如何被植入载荷？签名、隔离与来源审计。',
        match: /模型供应链|工件|Hugging|Vertex|模型分发|签名|抢注|squat/i,
      },
      {
        slug: 'dev-supply',
        name: '开发依赖与生态投毒',
        question: 'npm/PyPI 蠕虫、技能市场恶意包对 AI 工具链的冲击。',
        match: /npm|PyPI|依赖|蠕虫|供应链攻击|开源|包管理|仓库/i,
      },
    ],
  },
  {
    slug: 'governance',
    name: '治理与合规',
    summary: '政策、法规、标准与采购要求的全球动态。',
    focus: '把公开情报翻译成可汇报的决策与控制项。',
    dimensions: [
      {
        slug: 'regulation',
        name: '法规与监管',
        question: '各国 AI 法案、行政令、监管义务的生效节点与影响。',
        match: /法案|法规|监管|行政令|合规|生效|立法|法律/i,
      },
      {
        slug: 'standards-frameworks',
        name: '标准与框架',
        question: 'NIST、ISO、OWASP、MITRE 等框架如何映射到落地控制。',
        match: /NIST|ISO|OWASP|MITRE|框架|标准|认证|基线/i,
      },
      {
        slug: 'national-strategy',
        name: '国家战略与机构',
        question: '安全机构（CISA、CSA、AISI 等）的指南、警示与协议。',
        match: /CISA|CSA|AISI|国防部|白宫|国家|机构|战略|指南/i,
      },
    ],
  },
];

export function getTheme(slug: string) {
  return themes.find((t) => t.slug === slug);
}

export function classifyDimension(themeSlug: string, text: string): string | undefined {
  const theme = getTheme(themeSlug);
  if (!theme) return undefined;
  for (const dim of theme.dimensions) {
    if (dim.match.test(text)) return dim.slug;
  }
  return theme.dimensions[0]?.slug;
}

/* ---------------- 全球治理：地区与代表性法规 ---------------- */

export type Region = {
  slug: string;
  name: string;
  flag: string;
  stance: string;
  instruments: { name: string; status: string; note: string }[];
  match: RegExp;
};

export const regions: Region[] = [
  {
    slug: 'eu',
    name: '欧盟',
    flag: 'EU',
    stance: '以《人工智能法案》为核心的横向强监管，配合 CRA、GDPR 形成合规矩阵。',
    instruments: [
      {
        name: 'EU AI Act（人工智能法案）',
        status: '高风险义务 2026-08-02 全面生效',
        note: 'Annex III 覆盖招聘、信贷、关键基础设施等场景，需完成合规映射。',
      },
      {
        name: 'Cyber Resilience Act（网络弹性法）',
        status: '分阶段实施',
        note: '对含数字元素产品提出漏洞处理与 SBOM 要求，波及 AI 组件。',
      },
      { name: 'GDPR', status: '持续适用', note: 'AI 训练与推理中的个人数据处理基线。' },
    ],
    match: /欧盟|EU AI Act|人工智能法案|CRA|网络弹性法|GDPR|欧洲/i,
  },
  {
    slug: 'us',
    name: '美国',
    flag: 'US',
    stance: '联邦以框架与自愿协议为主、州法先行，安全机构（CISA/NIST/CAISI）提供技术基线。',
    instruments: [
      {
        name: 'NIST AI RMF / AI 600-1',
        status: '事实基线',
        note: '生成式 AI 风险管理概要，被企业合规广泛引用。',
      },
      {
        name: 'CAISI 前沿模型评估协议',
        status: '与主要实验室生效',
        note: '商务部中心与 Google、Microsoft、xAI 等达成发布前安全评估。',
      },
      {
        name: 'CISA KEV / BOD 强制修复',
        status: '持续更新',
        note: 'AI 基础设施 CVE 进入 KEV 后联邦机构须限期修复。',
      },
      {
        name: '州级立法（如科罗拉多 SB 189）',
        status: '陆续生效',
        note: '高风险 AI 决策系统的州级义务，企业需跟踪多州差异。',
      },
    ],
    match: /美国|白宫|NIST|CISA|CAISI|联邦|科罗拉多|国防部|OMB|BOD/i,
  },
  {
    slug: 'cn',
    name: '中国',
    flag: 'CN',
    stance: '生成式 AI 服务管理与安全评估并行，TC260 等推进技术标准落地。',
    instruments: [
      {
        name: '《生成式人工智能服务管理暂行办法》',
        status: '施行中',
        note: '面向公众服务的生成式 AI 备案与安全评估要求。',
      },
      {
        name: 'TC260 AI 安全标准体系',
        status: '持续发布',
        note: '涵盖生成式 AI 安全基本要求、训练数据安全等技术文件。',
      },
      {
        name: '《人工智能安全治理框架》',
        status: '已发布',
        note: '给出风险分类与治理措施的国家级参考框架。',
      },
    ],
    match: /中国|网信|TC260|生成式人工智能|360|新华|国内|北京|上海/i,
  },
  {
    slug: 'uk',
    name: '英国',
    flag: 'UK',
    stance: '不设单一 AI 法案，依托 AI Safety Institute 与行业监管机构分域治理。',
    instruments: [
      {
        name: 'AI Safety Institute（AISI）评测',
        status: '持续运行',
        note: '对前沿模型开展安全评测并发布方法论。',
      },
      {
        name: '分域监管指引',
        status: '演进中',
        note: '金融、医疗等行业监管机构各自发布 AI 使用指引。',
      },
    ],
    match: /英国|UK|AISI|AI Safety Institute|伦敦/i,
  },
  {
    slug: 'sg',
    name: '新加坡',
    flag: 'SG',
    stance: '以 CSA/IMDA 的实操指南与案例研究见长，聚焦代理式 AI 部署治理。',
    instruments: [
      {
        name: 'CSA 网络安全警示',
        status: '持续发布',
        note: '针对自主 AI 代理（如 OpenClaw）的官方安全建议。',
      },
      {
        name: 'IMDA 负责任部署案例研究',
        status: '已发布',
        note: '给出代理权限、人工监督与日志审计的上线前清单。',
      },
    ],
    match: /新加坡|CSA|IMDA|Singapore/i,
  },
  {
    slug: 'jp-kr',
    name: '日本 / 韩国',
    flag: 'JP·KR',
    stance: '促进与安全并重：日本 AI 促进法与 AISI Japan，韩国推进 AI 基本法。',
    instruments: [
      { name: '日本 AI 相关立法与 AISI Japan', status: '推进中', note: '评测机构与立法并行。' },
      { name: '韩国 AI 基本法', status: '立法进程中', note: '综合性 AI 治理框架。' },
    ],
    match: /日本|韩国|东京|首尔|Japan|Korea/i,
  },
  {
    slug: 'intl',
    name: '国际组织',
    flag: 'INTL',
    stance: '跨国协调层：G7、OECD、联合国与标准组织提供互认基础。',
    instruments: [
      { name: 'G7 广岛 AI 进程', status: '持续', note: '前沿 AI 行为准则的多边共识。' },
      { name: 'ISO/IEC 42001', status: '可认证', note: 'AI 管理体系国际标准。' },
      { name: 'OECD AI 原则', status: '持续', note: '各国政策的共同参考底座。' },
    ],
    match: /G7|OECD|联合国|国际标准|ISO\/IEC|多边|广岛/i,
  },
];

/* ---------------- 标准与框架 ---------------- */

export type Standard = {
  slug: string;
  name: string;
  org: string;
  purpose: string;
  usage: string;
  match: RegExp;
};

export const standards: Standard[] = [
  {
    slug: 'owasp-llm',
    name: 'OWASP Top 10 for LLM Applications',
    org: 'OWASP GenAI',
    purpose: 'LLM 应用十大风险清单，提示注入连续多年居首。',
    usage: '作为应用安全评审与威胁建模的入门清单。',
    match: /OWASP|LLM01|Top ?10/i,
  },
  {
    slug: 'mitre-atlas',
    name: 'MITRE ATLAS',
    org: 'MITRE',
    purpose: '面向 AI 系统的对抗战术与技术知识库（对标 ATT&CK）。',
    usage: '红队演练设计与检测规则映射。',
    match: /MITRE|ATLAS|AML\.T/i,
  },
  {
    slug: 'nist-rmf',
    name: 'NIST AI RMF / AI 600-1',
    org: 'NIST',
    purpose: 'AI 风险管理框架及生成式 AI 概要，治理-映射-测量-管理四职能。',
    usage: '企业 AI 治理制度与合规映射的骨架。',
    match: /NIST|AI RMF|600-1/i,
  },
  {
    slug: 'iso-42001',
    name: 'ISO/IEC 42001',
    org: 'ISO/IEC',
    purpose: 'AI 管理体系（AIMS）可认证标准。',
    usage: '需要第三方认证背书时的体系选择。',
    match: /42001|ISO\/IEC/i,
  },
  {
    slug: 'csa-maestro',
    name: 'CSA MAESTRO',
    org: 'Cloud Security Alliance',
    purpose: '智能体系统威胁建模框架，按层拆解 Agent 风险。',
    usage: 'Agent/MCP 架构评审时的分层威胁清单。',
    match: /MAESTRO|Cloud Security Alliance|CSA 研究/i,
  },
  {
    slug: 'crest-ai',
    name: 'CREST AI 渗透测试认证',
    org: 'CREST',
    purpose: 'AI 赋能渗透测试服务的资质框架。',
    usage: '采购渗透测试时区分能力真伪的参考。',
    match: /CREST/i,
  },
];

/* ---------------- 产业图谱 ---------------- */

export type CompanyCategory = {
  slug: string;
  name: string;
  description: string;
  companies: { name: string; note: string; match: RegExp }[];
};

export const companyCategories: CompanyCategory[] = [
  {
    slug: 'model-labs',
    name: '模型厂商与云平台',
    description: '前沿模型实验室与承载 AI 工作负载的云平台，安全既是产品也是责任。',
    companies: [
      { name: 'Microsoft', note: 'Agent 365、Prompt Injection Protection、MDASH 漏洞挖掘。', match: /微软|Microsoft/i },
      { name: 'Google', note: 'Vertex AI、Gemini 安全、SecOps 与 Model Armor。', match: /Google|谷歌|Gemini|Vertex/i },
      { name: 'Anthropic', note: '前沿模型安全评估与安全研究合作。', match: /Anthropic|Claude/i },
      { name: 'OpenAI', note: '前沿模型发布前评估协议参与方。', match: /OpenAI|GPT/i },
      { name: 'NVIDIA', note: 'AI 基础设施与安全扫描工具。', match: /NVIDIA|英伟达/i },
      { name: 'AWS', note: '云安全与 AI 红队竞赛合作方。', match: /AWS|亚马逊/i },
    ],
  },
  {
    slug: 'ai-security',
    name: 'AI 安全专业厂商',
    description: '围绕模型与 Agent 安全的新兴公司：检测、红队、供应链审查。',
    companies: [
      { name: 'Darktrace', note: 'AI 代理可观测与威胁检测，Agent 365 集成。', match: /Darktrace/i },
      { name: 'Vectra AI', note: '威胁检测现状报告与告警编排研究。', match: /Vectra/i },
      { name: 'Pillar Security', note: 'AI 攻击面预测与 Agent 安全研究。', match: /Pillar Security/i },
      { name: 'Phoenix Security', note: 'Exploit Hunt AI 红队产品。', match: /Phoenix Security/i },
      { name: 'Dropzone AI', note: '自主 SOC 调查代理。', match: /Dropzone/i },
      { name: 'Prophet Security', note: 'AI SOC 平台。', match: /Prophet Security/i },
    ],
  },
  {
    slug: 'traditional',
    name: '传统安全厂商转型',
    description: '既有安全巨头把 AI 纳入产品线，同时研究 AI 带来的新威胁。',
    companies: [
      { name: 'CrowdStrike', note: '年度威胁报告、AI 红队竞赛。', match: /CrowdStrike/i },
      { name: 'Palo Alto Networks', note: 'AI 安全产品线与威胁研究。', match: /Palo Alto/i },
      { name: 'Cisco (Talos)', note: '多会话越狱研究、skill-scanner。', match: /Cisco|思科|Talos/i },
      { name: 'Cloudflare', note: '前沿模型漏洞研究实践。', match: /Cloudflare/i },
      { name: 'Imperva', note: 'Agent 提示注入实战披露。', match: /Imperva/i },
      { name: 'Varonis', note: '智能体钓鱼攻击研究。', match: /Varonis/i },
      { name: '360', note: '智能体安全六层攻击面模型。', match: /360/i },
    ],
  },
  {
    slug: 'research',
    name: '研究机构与社区',
    description: '提供方法论与公共物品的研究力量。',
    companies: [
      { name: 'Trail of Bits', note: '技能市场扫描绕过研究。', match: /Trail of Bits/i },
      { name: 'OWASP GenAI', note: 'LLM Top 10 与 Agent 安全清单。', match: /OWASP/i },
      { name: 'Cloud Security Alliance', note: 'MAESTRO 框架与 CVE 研究通报。', match: /Cloud Security Alliance|CSA/i },
      { name: 'MITRE', note: 'ATLAS 对抗知识库。', match: /MITRE/i },
    ],
  },
];
