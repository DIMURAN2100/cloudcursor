export const brand = {
  name: 'AI简化安全',
  nameEn: 'AI Simplify Security',
  tagline: '用全球 AI 安全情报，训练可执行的防御判断',
  description:
    '面向企业安全岗与管理层的全球 AI 安全学习站：每日简报沉淀为知识体系、治理地图、产业图谱与学习路径。',
};

export const nav = [
  { href: '/briefings/', label: '简报台' },
  { href: '/themes/', label: '知识体系' },
  { href: '/governance/', label: '全球治理' },
  { href: '/landscape/', label: '产业图谱' },
  { href: '/glossary/', label: '术语墙' },
  { href: '/path/', label: '学习路径' },
  { href: '/about/', label: '方法' },
];

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
