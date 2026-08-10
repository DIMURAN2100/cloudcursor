import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { loadBriefings } from '../lib/briefings';
import { brand } from '../lib/site';
import { absUrl, u } from '../lib/urls';

export function GET(context: APIContext) {
  const briefings = loadBriefings().slice(0, 30);
  return rss({
    title: `${brand.name} · 每日简报`,
    description: brand.description,
    site: context.site ?? absUrl(),
    items: briefings.map((b) => ({
      title: `${b.date} · ${b.highlights[0]?.title || b.title}`,
      description: b.lede,
      pubDate: new Date(`${b.date}T09:00:00+08:00`),
      link: u(`briefings/${b.slug}/`),
      categories: Array.from(new Set(b.highlights.map((h) => h.type))),
    })),
    customData: `<language>zh-CN</language>`,
    trailingSlash: true,
  });
}
