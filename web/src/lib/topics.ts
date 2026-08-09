import type { RegExp } from 'node:module';

/**
 * 专题（Curated Topics）：把跨主题的简报要点、术语、标准聚合成一页。
 * 不同于 themes，topics 是横向切面，不参与自动分类。
 */

export type Topic = {
  slug: string;
  title: string;
  lede: string;
  /** 用于在 highlights 中匹配的正则（标题+摘要） */
  pattern: RegExp;
  /** 关联的标准 slug（taxonomy.standards） */
  standards: string[];
  /** 关联的术语 en/term（glossary） */
  terms: string[];
  /** 行动建议 */
  actions: string[];
};

export const topics: Topic[] = [
  {
    slug: 'prompt-injection',
    title: '提示注入与越狱',
    lede: '从直接注入到多会话拆分、间接注入，提示注入连续三年位列 OWASP LLM Top 10 之首。理解它不是"让模型说错话"，而是"让模型做错事"。',
    pattern: /提示注入|越狱|jailbreak|prompt injection|间接注入|多会话/i,
    standards: ['owasp-llm', 'mitre-atlas'],
    terms: ['提示注入', '间接提示注入', '越狱'],
    actions: [
      '把外部内容（网页、邮件、文档、RAG 检索结果）一律视为不可信输入，与系统指令分通道处理。',
      '对 Agent 工具调用实施白名单和人工确认，不允许模型输出直接触发高权限操作。',
      '用红队持续验证新越狱手法；不要把"上线前测过一次"当作长期防护。',
    ],
  },
  {
    slug: 'mcp-agent-security',
    title: 'MCP 与 Agent 权限',
    lede: 'Agent 主风险已从「输出风险」切到「行动风险」。MCP 服务器、插件市场、长期凭证成为新的攻击面，零常设权限是底线。',
    pattern: /MCP|过度代理|Zero-Standing|agent security|工具调用|技能市场|权限滥用/i,
    standards: ['owasp-llm', 'csa-maestro'],
    terms: ['过度代理', 'MCP', '零常设权限'],
    actions: [
      '盘点生产 Agent 的工具与密钥：取消长期凭证，改用短时票据。',
      '高危/不可逆动作（发邮件、转账、删数据、改权限）强制人机确认。',
      'MCP 服务器纳入与 CI/CD 同级的权限审计与来源审查。',
    ],
  },
  {
    slug: 'ai-supply-chain',
    title: 'AI 供应链与运行时',
    lede: '模型工件、AI 网关（LiteLLM/Ollama/vLLM）、开发依赖（npm/PyPI）共同构成新的软件供应链。CVE 进入 KEV 后小时级响应。',
    pattern: /CVE-\d{4}|供应链|模型工件|Hugging|LiteLLM|Ollama|vLLM|npm|PyPI|投毒|SBOM/i,
    standards: ['csa-maestro'],
    terms: ['模型投毒', 'SBOM', 'KEV'],
    actions: [
      '建立 AI 组件资产清单，跟踪 CVE/KEV 订阅，纳入与传统软件同级的补丁节奏。',
      '模型工件启用签名与来源校验，不自动加载来源不明的 checkpoint。',
      'AI 网关/编排平台关闭未认证预测入口，模型输出不直接送入未隔离的执行器。',
    ],
  },
  {
    slug: 'agentic-soc',
    title: 'Agentic SOC 与 AI 防御',
    lede: 'AI 防御的竞争点已经从"聊天助手"转到"调查—处置闭环"：跨遥测推理叙事、生成可审计处置、验证修复有效性。',
    pattern: /Agentic SOC|告警|SIEM|EDR|XDR|自主调查|Hyperautomation|Purple AI|持续红队|pentest/i,
    standards: ['crest-ai'],
    terms: ['Agentic SOC', 'AI 红队'],
    actions: [
      '书面定义哪些 SOC 处置允许机器执行、哪些必须人工批准。',
      '在一条互联网暴露或高权限服务路径上试点"可利用性"门禁，而非只看 CVSS。',
      '区分营销宣称与实测覆盖：要求供应商给出门禁在真实代码/依赖上的验证证据。',
    ],
  },
  {
    slug: 'global-ai-governance',
    title: '全球 AI 治理追踪',
    lede: '欧盟 AI Act 高风险义务 2026-08-02 全面生效，美国以框架与州法并行，中国侧重生成式服务备案。企业需要按"业务触达地"做合规映射。',
    pattern: /AI Act|人工智能法案|CRA|NIST|CISA|CAISI|TC260|生成式人工智能|GDPR|行政令|合规/i,
    standards: ['nist-rmf', 'iso-42001'],
    terms: ['KEV', 'MAESTRO', 'SAFE'],
    actions: [
      '梳理本企业 AI 系统触达的司法辖区，按"高风险/通用/最小风险"做场景映射。',
      '把 EU AI Act 的透明度、人类监督、日志保留要求嵌入采购合同条款。',
      '跟踪 CISA KEV / CAISI 评估协议等"事实基线"，作为对外解释控制成熟度的依据。',
    ],
  },
];

export function getTopic(slug: string) {
  return topics.find((t) => t.slug === slug);
}
