import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import {
  classifyDimension,
  companyCategories,
  regions,
  standards,
  themes,
} from './taxonomy';
import { loadAllClassificationOverrides } from './enrichment';
import { sanitizeHtml } from './sanitize';
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

export type HighlightRef = { briefing: Briefing; highlight: Highlight };

/* ---------------- 路径：相对于本文件，不依赖 cwd ---------------- */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATE_DIRS = [
  process.env.BRIEFINGS_DIR,
  path.resolve(HERE, '../../../briefings'),  // 源：web/src/lib → 仓库根/briefings
  path.resolve(process.cwd(), '../briefings'), // 传统路径（astro dev / build 默认 cwd = web/）
  path.resolve(process.cwd(), 'briefings'),
].filter((p): p is string => !!p);

function resolveBriefingsDir(): string {
  for (const p of CANDIDATE_DIRS) {
    if (fs.existsSync(p)) return p;
  }
  return CANDIDATE_DIRS[1]!;
}
const BRIEFINGS_DIR = resolveBriefingsDir();

/* ---------------- 类型 → 主题 ---------------- */
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

function extractHighlights(raw: string, filename: string): Highlight[] {
  const section =
    raw.split(/##+\s*[一二三四五]、?今日要点[\s\S]*?\n/)[1] ||
    raw.split(/###?\s*[一二三四五]、?今日要点[\s\S]*?\n/)[1] ||
    '';
  const cut = section.split(/\n---\n|\n##+\s*[二三]/)[0] || section;
  const blocks = cut.split(/\n(?=\*\*\[\d+\])/);
  const highlights: Highlight[] = [];

  for (const block of blocks) {
    const m = block.match(
      /\*\*\[(\d+)\]\s*(.+?)\*\*\s*\n📌\s*类型[：:]\s*(.+?)\s*\n+([\s\S]*?)(?=\n🔗|\n!\[|$)/,
    );
    if (!m) continue;
    const summary = m[4].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    const sourceLine =
      block.match(/🔗\s*来源[：:]\s*(.+)$/m)?.[1] ||
      block.match(/来源[：:]\s*(.+)$/m)?.[1] ||
      block;
    const seen = new Set<string>();
    const sources = [...sourceLine.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)]
      .map((s) => ({ label: s[1].trim(), href: s[2].trim() }))
      .filter((s) => {
        if (seen.has(s.href)) return false;
        seen.add(s.href);
        return true;
      });
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

  if (highlights.length === 0 && process.env.NODE_ENV !== 'test') {
    console.warn(`[briefings] ${filename}: parsed 0 highlights — 模板可能已变更`);
  }

  return highlights;
}

/* ---------------- 加载 + 索引 ---------------- */
type Index = {
  byTheme: Map<string, HighlightRef[]>;
  byDimension: Map<string, HighlightRef[]>;
};

let cache: { briefings: Briefing[]; index: Index } | null = null;

function buildIndex(briefings: Briefing[]): Index {
  const byTheme = new Map<string, HighlightRef[]>();
  const byDimension = new Map<string, HighlightRef[]>();
  for (const briefing of briefings) {
    for (const highlight of briefing.highlights) {
      const ref: HighlightRef = { briefing, highlight };
      const t = byTheme.get(highlight.themeSlug);
      if (t) t.push(ref);
      else byTheme.set(highlight.themeSlug, [ref]);
      if (highlight.dimensionSlug) {
        const key = `${highlight.themeSlug}/${highlight.dimensionSlug}`;
        const d = byDimension.get(key);
        if (d) d.push(ref);
        else byDimension.set(key, [ref]);
      }
    }
  }
  return { byTheme, byDimension };
}

export function loadBriefings(): Briefing[] {
  if (cache) return cache.briefings;
  if (!fs.existsSync(BRIEFINGS_DIR)) {
    console.warn(`[briefings] directory not found: ${BRIEFINGS_DIR}`);
    return [];
  }
  const files = fs
    .readdirSync(BRIEFINGS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse();

  const overrides = loadAllClassificationOverrides();

  const briefings: Briefing[] = files.map((filename) => {
    const raw = fs.readFileSync(path.join(BRIEFINGS_DIR, filename), 'utf8');
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch?.[1] ?? '1970-01-01';
    const slug = filename.replace(/\.md$/, '');
    const titleLine = raw.split('\n').find((l) => l.trim()) || slug;
    const highlights = extractHighlights(raw, filename).map((h) => {
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
      bodyHtml: sanitizeHtml(marked.parse(raw, { async: false }) as string),
      raw,
    };
  });

  cache = { briefings, index: buildIndex(briefings) };
  return briefings;
}

/** dev 模式下清除缓存（文件变更后可手动调用）。 */
export function invalidateBriefingsCache(): void {
  cache = null;
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

export function collectThemeHighlights(themeSlug: string, limit = 12): HighlightRef[] {
  loadBriefings();
  const items = cache?.index.byTheme.get(themeSlug) ?? [];
  return items.slice(0, limit);
}

export function collectDimensionHighlights(
  themeSlug: string,
  dimensionSlug: string,
  limit = 10,
): HighlightRef[] {
  loadBriefings();
  const items = cache?.index.byDimension.get(`${themeSlug}/${dimensionSlug}`) ?? [];
  return items.slice(0, limit);
}

export function countThemeHighlights(themeSlug: string): number {
  loadBriefings();
  return cache?.index.byTheme.get(themeSlug)?.length ?? 0;
}

export function countDimensionHighlights(themeSlug: string, dimensionSlug: string): number {
  loadBriefings();
  return cache?.index.byDimension.get(`${themeSlug}/${dimensionSlug}`)?.length ?? 0;
}

/** 按正则在全部简报要点中检索，供治理/标准/公司/专题页挂接情报。 */
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
