/**
 * 法规与安全合规知识库。
 * 原文在 data/compliance/corpus/{id}/，解读在 data/compliance/analyses/{id}.json。
 * 两者分开存放。构建时核对：非「分析推导」的原文必须能在语料中原样找到。
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), '../data/compliance');

export const requirementKinds = ['明确义务', '条件性义务', '指导建议', '分析推导'] as const;
export type RequirementKind = (typeof requirementKinds)[number];

export type SecurityRequirement = {
  id: string;
  domain: string;
  quote: string;
  location: string;
  kind: RequirementKind;
  binding: string;
  purpose: string;
  subjects: string;
  response: string;
  evidence: string;
};

export type GuidanceTask = {
  item: string;
  basis: string;
  basis_kind: RequirementKind;
  purpose: string;
  measures: string[];
  artifacts: string[];
  priority: '高' | '中' | '低';
  condition: string;
  owner: string;
};

export type ChecklistItem = {
  question: string;
  kind: RequirementKind;
  location: string;
  evidence: string;
};

export type ComplianceAnalysis = {
  id: string;
  corpus_id: string;
  analyzed_at: string;
  document_profile: {
    title: string;
    doc_type: string;
    issuers: string[];
    doc_number: string;
    issued_at: string;
    published_at: string;
    effective_at: string;
    revised_at: string | null;
    status: 'in_force' | 'partial' | 'not_yet' | 'repealed' | 'superseded' | 'unverified';
    status_note: string;
    territory: string;
    industries: string[];
    subjects: string[];
    not_applicable: string;
    source_url: string;
    status_check_url?: string;
  };
  executive_summary: string[];
  core_contents: { question: string; answer: string }[];
  security_analysis: SecurityRequirement[];
  ai_security_analysis: { covered: string[]; not_in_document: string[] };
  enterprise_guidance: GuidanceTask[];
  compliance_checklist: ChecklistItem[];
  industry_impact: {
    industry: string;
    scenarios: string;
    risks: string;
    duties: string;
    capabilities: string;
  }[];
  related_documents: { title: string; relation: string; verified: boolean; note: string }[];
  management_insights: {
    regulatory_focus: string;
    enterprise_duty: string;
    security_build: string;
    leadership: string;
  };
  uncertainty_and_review: string[];
  review: { status: 'passed' | 'needs_human'; notes: string[] };
};

const statusLabel: Record<ComplianceAnalysis['document_profile']['status'], string> = {
  in_force: '现行有效',
  partial: '部分有效',
  not_yet: '尚未实施',
  repealed: '已废止',
  superseded: '已被替代',
  unverified: '待核验',
};

export function statusText(status: ComplianceAnalysis['document_profile']['status']) {
  return statusLabel[status] ?? '待核验';
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function loadAnalyses(): ComplianceAnalysis[] {
  const dir = path.join(DATA_DIR, 'analyses');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => readJson<ComplianceAnalysis>(path.join(dir, name)))
    .filter((item): item is ComplianceAnalysis => Boolean(item))
    .sort((a, b) => (a.document_profile.effective_at < b.document_profile.effective_at ? 1 : -1));
}

export function loadAnalysis(id: string): ComplianceAnalysis | null {
  return readJson<ComplianceAnalysis>(path.join(DATA_DIR, 'analyses', `${id}.json`));
}

export function corpusSource(corpusId: string): string {
  const file = path.join(DATA_DIR, 'corpus', corpusId, 'source.md');
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
}

export function kindCounts(doc: ComplianceAnalysis) {
  const counts: Record<RequirementKind, number> = {
    明确义务: 0,
    条件性义务: 0,
    指导建议: 0,
    分析推导: 0,
  };
  for (const item of doc.security_analysis) counts[item.kind] += 1;
  for (const item of doc.enterprise_guidance) {
    if (item.basis_kind === '分析推导') counts['分析推导'] += 1;
  }
  return counts;
}
