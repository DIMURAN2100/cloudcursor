export const brand = {
  name: 'AI简化安全',
  nameEn: 'AI Simplify Security',
  tagline: '用全球 AI 安全情报，训练可执行的防御判断',
  description:
    '面向企业安全岗与管理层的全球 AI 安全学习站：把每日简报沉淀为主题路径、事件复盘与行动清单。',
};

export const themes = [
  {
    slug: 'ai-self',
    name: 'AI 自身安全',
    summary: '提示注入、过度代理、多会话规避与模型边界失效。',
    focus: '把「模型会被绕过」当成设计前提，收紧工具与数据权限。',
  },
  {
    slug: 'ai-defense',
    name: 'AI 赋能防御',
    summary: 'Agentic SOC、AI 红队、告警编排与防御自动化。',
    focus: '关注信号质量、验证闭环，而不是工具堆叠。',
  },
  {
    slug: 'infra-cve',
    name: '基础设施与 CVE',
    summary: 'AI 网关、MCP、模型供应链与开发依赖风险。',
    focus: '把 AI 运行时与软件供应链纳入同一套补丁与监测节奏。',
  },
  {
    slug: 'governance',
    name: '治理与合规',
    summary: '监管动态、框架映射、采购资质与责任边界。',
    focus: '把公开情报翻译成可汇报的决策与控制项。',
  },
] as const;

export type ThemeSlug = (typeof themes)[number]['slug'];

export function getTheme(slug: string) {
  return themes.find((t) => t.slug === slug);
}

export const engineerPath = {
  title: '安全工程师路径',
  subtitle: '从威胁面认知到可执行控制，用简报案例完成闭环。',
  steps: [
    {
      id: 'map',
      title: '建立威胁面地图',
      outcome: '能向团队讲清模型、Agent、数据、工具、基础设施分层。',
      action: '对照威胁面架构图，标注本企业已暴露的两层。',
      theme: 'ai-self',
    },
    {
      id: 'inject',
      title: '掌握提示注入与代理滥用',
      outcome: '识别直接/间接注入、多会话拆分与过度代理。',
      action: '从近七日简报中挑选 2 条自身安全要点做案例拆解。',
      theme: 'ai-self',
    },
    {
      id: 'supply',
      title: '审计 AI 供应链与运行时',
      outcome: '覆盖模型工件、AI 网关、MCP、npm/依赖投毒。',
      action: '列出生产路径上的 AI 组件与补丁责任人。',
      theme: 'infra-cve',
    },
    {
      id: 'defend',
      title: '设计 AI 辅助检测闭环',
      outcome: '理解告警分级、验证式红队与人机协同边界。',
      action: '用 1 条赋能防御简报，写清「信号→验证→响应」三步。',
      theme: 'ai-defense',
    },
    {
      id: 'govern',
      title: '落到检查清单与汇报',
      outcome: '把技术发现转成可追踪控制项与管理层摘要。',
      action: '输出一页本周风险与建议动作。',
      theme: 'governance',
    },
  ],
};

export const nav = [
  { href: '/briefings/', label: '今日简报台' },
  { href: '/themes/', label: '主题学堂' },
  { href: '/path/', label: '学习路径' },
  { href: '/diagrams/', label: '架构图' },
  { href: '/about/', label: '方法' },
];
