import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import {
  classifyDimension,
  companyCategories,
  regions,
  standards,
  themes,
} from './taxonomy';
import { loadAllClassificationOverrides } from './enrichment';

export type Highlight = {
  index: number;
  title: string;
  type: string;
  themeSlug: string;
  dimensionSlug?: string;
  summary: string;
  sources: { label: string; href: string }[];
};

export type Briefing = {
  slug: string;
  filename: string;
  date: string;
  title: string;
  lede: string;
  highlights: Highlight[];
  bodyHtml: string;
  raw: string;
};

const BRIEFINGS_DIR = path.resolve(process.cwd(), '../briefings');

export function typeToTheme(type: string, title = '', summary = ''): string {
  // 优先使用简报中的显式「📌 类型」标签，正文关键词仅作兜底。
  if (/自身/.test(type)) return 'ai-self';
  if (/赋能|升级安全/.test(type)) return 'ai-defense';
  if (/CVE|基础设施|供应链/.test(type)) return 'infra-cve';
  if (/治理|合规|监管|政策/.test(type)) return 'governance';

  const blob = `${title} ${summary}`;
  if (/法案|监管|合规|标准|框架|政策/.test(blob)) return 'governance';
  if (/CVE|供应链|npm|网关|漏洞利用/.test(blob)) return 'infra-cve';
  if (/SOC|检测|防御|红队/.test(blob)) return 'ai-defense';
  return 'ai-self';
}

function extractLede(raw: string): string {
  const quote = raw.match(/^>\s*(.+)$/m);
  if (quote) return quote[1].trim();
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[1] && !lines[1].startsWith('#') && !lines[1].startsWith('---')
    ? lines[1].replace(/\*\*/g, '')
    : '全球 AI 安全公开动态的日更学习材料。';
}

function extractHighlights(raw: string): Highlight[] {
  const section =
    raw.split(/##+\s*[一二三四五]、?今日要点[\s\S]*?\n/)[1] ||
    raw.split(/###?\s*[一二三四五]、?今日要点[\s\S]*?\n/)[1] ||
    '';
  const cut = section.split(/\n---\n|\n##+\s*[二三]/)[0] || section;
  const blocks = cut.split(/\n(?=\*\*\[\d+\])/);
  const highlights: Highlight[] = [];

  for (const block of blocks) {
    const m = block.match(
      /\*\*\[(\d+)\]\s*(.+?)\*\*\s*\n📌\s*类型：\s*(.+?)\s*\n+([\s\S]*?)(?=\n🔗|\n!\[|$)/,
    );
    if (!m) continue;
    const summary = m[4].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    const sources = [...block.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(
      (s) => ({ label: s[1], href: s[2] }),
    );
    const type = m[3].trim();
    const title = m[2].trim();
    const themeSlug = typeToTheme(type, title, summary);
    highlights.push({
      index: Number(m[1]),
      title,
      type,
      themeSlug,
      dimensionSlug: classifyDimension(themeSlug, `${title} ${summary}`),
      summary,
      sources,
    });
  }
  return highlights;
}

let cache: Briefing[] | null = null;

export function loadBriefings(): Briefing[] {
  if (cache) return cache;
  if (!fs.existsSync(BRIEFINGS_DIR)) return [];
  const files = fs
    .readdirSync(BRIEFINGS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse();

  const overrides = loadAllClassificationOverrides();

  cache = files.map((filename) => {
    const raw = fs.readFileSync(path.join(BRIEFINGS_DIR, filename), 'utf8');
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch?.[1] ?? '1970-01-01';
    const slug = filename.replace(/\.md$/, '');
    const titleLine = raw.split('\n').find((l) => l.trim()) || slug;
    const highlights = extractHighlights(raw).map((h) => {
      const override = overrides[`${slug}#${h.index}`];
      return override
        ? {
            ...h,
            themeSlug: override.theme,
            dimensionSlug:
              override.dimension ??
              classifyDimension(override.theme, `${h.title} ${h.summary}`),
          }
        : h;
    });
    return {
      slug,
      filename,
      date,
      title: titleLine.trim(),
      lede: extractLede(raw),
      highlights,
      bodyHtml: marked.parse(raw, { async: false }) as string,
      raw,
    };
  });
  return cache;
}

export function getLatestBriefing(briefings = loadBriefings()): Briefing | undefined {
  return briefings[0];
}

export function briefingsInLastDays(days: number, briefings = loadBriefings()): Briefing[] {
  if (!briefings.length) return [];
  const latest = new Date(`${briefings[0].date}T00:00:00Z`);
  const min = new Date(latest);
  min.setUTCDate(min.getUTCDate() - (days - 1));
  return briefings.filter((b) => new Date(`${b.date}T00:00:00Z`) >= min);
}

export type HighlightRef = { briefing: Briefing; highlight: Highlight };

export function collectThemeHighlights(themeSlug: string, limit = 12): HighlightRef[] {
  const items: HighlightRef[] = [];
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (highlight.themeSlug === themeSlug) {
        items.push({ briefing, highlight });
        if (items.length >= limit) return items;
      }
    }
  }
  return items;
}

export function collectDimensionHighlights(
  themeSlug: string,
  dimensionSlug: string,
  limit = 10,
): HighlightRef[] {
  const items: HighlightRef[] = [];
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (highlight.themeSlug === themeSlug && highlight.dimensionSlug === dimensionSlug) {
        items.push({ briefing, highlight });
        if (items.length >= limit) return items;
      }
    }
  }
  return items;
}

export function countThemeHighlights(themeSlug: string): number {
  let count = 0;
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (highlight.themeSlug === themeSlug) count += 1;
    }
  }
  return count;
}

export function countDimensionHighlights(themeSlug: string, dimensionSlug: string): number {
  let count = 0;
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (highlight.themeSlug === themeSlug && highlight.dimensionSlug === dimensionSlug) {
        count += 1;
      }
    }
  }
  return count;
}

/** 按正则在全部简报要点中检索，供治理/标准/公司页挂接情报。 */
export function matchHighlights(pattern: RegExp, limit = 8): HighlightRef[] {
  const items: HighlightRef[] = [];
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (pattern.test(`${highlight.title} ${highlight.summary}`)) {
        items.push({ briefing, highlight });
        if (items.length >= limit) return items;
      }
    }
  }
  return items;
}

export function countMatches(pattern: RegExp): number {
  let count = 0;
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (pattern.test(`${highlight.title} ${highlight.summary}`)) count += 1;
    }
  }
  return count;
}

export function regionIntel(regionSlug: string, limit = 6): HighlightRef[] {
  const region = regions.find((r) => r.slug === regionSlug);
  return region ? matchHighlights(region.match, limit) : [];
}

export function standardIntel(standardSlug: string, limit = 5): HighlightRef[] {
  const standard = standards.find((s) => s.slug === standardSlug);
  return standard ? matchHighlights(standard.match, limit) : [];
}

export function companyMentionCount(pattern: RegExp): number {
  return countMatches(pattern);
}

export { themes, regions, standards, companyCategories };
