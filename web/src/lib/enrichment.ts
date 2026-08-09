/**
 * 智能加工数据层：由每日 Automation 中的 Cloud Agent 生成，站点构建时消费。
 * 目录：仓库根 data/enrichment/
 *   glossary.json          术语墙
 *   daily/YYYY-MM-DD.json  当日头条、管理层摘要、归类覆盖
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), '../data/enrichment');

export type GlossaryTerm = {
  term: string;
  en: string;
  definition: string;
  theme?: string;
  dimension?: string;
};

export type ExecItem = { title: string; insight: string; action: string };

export type DailyEnrichment = {
  date: string;
  headline?: string;
  execSummary: ExecItem[];
  /** 键格式 `${briefingSlug}#${highlightIndex}`，用于纠正自动归类。 */
  classifications?: Record<string, { theme: string; dimension?: string }>;
};

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function loadGlossary(): GlossaryTerm[] {
  const data = readJson<{ terms: GlossaryTerm[] }>(path.join(DATA_DIR, 'glossary.json'));
  return data?.terms ?? [];
}

export function loadDailyEnrichment(date: string): DailyEnrichment | null {
  return readJson<DailyEnrichment>(path.join(DATA_DIR, 'daily', `${date}.json`));
}

export function loadAllClassificationOverrides(): Record<
  string,
  { theme: string; dimension?: string }
> {
  const dir = path.join(DATA_DIR, 'daily');
  if (!fs.existsSync(dir)) return {};
  const merged: Record<string, { theme: string; dimension?: string }> = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const data = readJson<DailyEnrichment>(path.join(dir, file));
    Object.assign(merged, data?.classifications ?? {});
  }
  return merged;
}
