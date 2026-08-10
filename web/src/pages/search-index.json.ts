import type { APIContext } from 'astro';
import { loadBriefings } from '../lib/briefings';
import { u } from '../lib/urls';

export function GET(context: APIContext) {
  const briefings = loadBriefings();
  const docs = briefings.flatMap((b) =>
    b.highlights.map((h) => ({
      id: `${b.slug}#${h.index}`,
      date: b.date,
      title: h.title,
      summary: h.summary,
      type: h.type,
      theme: h.themeSlug,
      href: u(`briefings/${b.slug}/`),
    })),
  );

  return new Response(JSON.stringify(docs), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
