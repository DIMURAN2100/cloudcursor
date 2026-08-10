import type { APIContext } from 'astro';
import { loadBriefings } from '../lib/briefings';
import { themes, regions, standards } from '../lib/taxonomy';
import { absUrl, u } from '../lib/urls';

const STATIC_PAGES = [
  '',
  'briefings/',
  'themes/',
  'governance/',
  'landscape/',
  'glossary/',
  'path/',
  'about/',
  'diagrams/',
];

export function GET(context: APIContext) {
  const briefings = loadBriefings();
  const urls: string[] = [
    ...STATIC_PAGES.map((p) => absUrl(u(p))),
    ...briefings.map((b) => absUrl(u(`briefings/${b.slug}/`))),
    ...themes.map((t) => absUrl(u(`themes/${t.slug}/`))),
  ];

  // 归档分页
  const days = new Set(briefings.map((b) => b.date)).size;
  const totalPages = Math.max(1, Math.ceil(days / 15));
  for (let p = 2; p <= totalPages; p++) {
    urls.push(absUrl(u(`briefings/page/${p}/`)));
  }

  const lastmod = briefings[0]?.date ?? new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq></url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
