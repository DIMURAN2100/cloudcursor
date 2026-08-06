import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export type Highlight = {
  index: number;
  title: string;
  type: string;
  themeSlug: string;
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
  themeCounts: Record<string, number>;
};

const BRIEFINGS_DIR = path.resolve(process.cwd(), '../briefings');

const THEME_MAP: { match: RegExp; slug: string }[] = [
  { match: /赋能|升级安全|防御|检测|SOC|红队|渗透/i, slug: 'ai-defense' },
  { match: /自身|提示注入|prompt|agent|代理|过度代理|幻觉/i, slug: 'ai-self' },
  { match: /基础设施|CVE|供应链|npm|网关|MCP/i, slug: 'infra-cve' },
  { match: /治理|合规|监管|法案|框架/i, slug: 'governance' },
];

export function typeToTheme(type: string, title = '', summary = ''): string {
  // Prefer the explicit 📌 类型 label; only fall back to title/summary keywords.
  if (/自身/.test(type)) return 'ai-self';
  if (/赋能|升级安全/.test(type)) return 'ai-defense';
  if (/CVE|基础设施/.test(type)) return 'infra-cve';
  if (/治理|合规|监管/.test(type)) return 'governance';

  const blob = `${title} ${summary}`;
  for (const rule of THEME_MAP) {
    if (rule.match.test(blob)) return rule.slug;
  }
  return 'governance';
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
    highlights.push({
      index: Number(m[1]),
      title,
      type,
      themeSlug: typeToTheme(type, title, summary),
      summary,
      sources,
    });
  }
  return highlights;
}

export function loadBriefings(): Briefing[] {
  if (!fs.existsSync(BRIEFINGS_DIR)) return [];
  const files = fs
    .readdirSync(BRIEFINGS_DIR)
    .filter((f) => f.endsWith('.md') && f !== '.gitkeep')
    .sort()
    .reverse();

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(BRIEFINGS_DIR, filename), 'utf8');
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch?.[1] ?? '1970-01-01';
    const slug = filename.replace(/\.md$/, '');
    const titleLine = raw.split('\n').find((l) => l.trim()) || slug;
    const highlights = extractHighlights(raw);
    const themeCounts: Record<string, number> = {};
    for (const h of highlights) {
      themeCounts[h.themeSlug] = (themeCounts[h.themeSlug] || 0) + 1;
    }
    return {
      slug,
      filename,
      date,
      title: titleLine.trim(),
      lede: extractLede(raw),
      highlights,
      bodyHtml: marked.parse(raw, { async: false }) as string,
      raw,
      themeCounts,
    };
  });
}

export function getLatestBriefing(briefings = loadBriefings()): Briefing | undefined {
  return briefings[0];
}

export function getBriefingBySlug(slug: string): Briefing | undefined {
  return loadBriefings().find((b) => b.slug === slug);
}

export function briefingsInLastDays(days: number, briefings = loadBriefings()): Briefing[] {
  if (!briefings.length) return [];
  const latest = new Date(`${briefings[0].date}T00:00:00Z`);
  const min = new Date(latest);
  min.setUTCDate(min.getUTCDate() - (days - 1));
  return briefings.filter((b) => new Date(`${b.date}T00:00:00Z`) >= min);
}

export function collectThemeHighlights(themeSlug: string, limit = 12) {
  const items: { briefing: Briefing; highlight: Highlight }[] = [];
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

export function countThemeHighlights(themeSlug: string): number {
  let count = 0;
  for (const briefing of loadBriefings()) {
    for (const highlight of briefing.highlights) {
      if (highlight.themeSlug === themeSlug) count += 1;
    }
  }
  return count;
}
