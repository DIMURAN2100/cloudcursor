import type { APIRoute } from 'astro';
import { loadBriefings } from '../lib/briefings';

export const prerender = true;

export const GET: APIRoute = () => {
  const items = loadBriefings().flatMap((b) =>
    b.highlights.map((h) => ({
      id: `${b.slug}#${h.index}`,
      title: h.title,
      summary: h.summary,
      date: b.date,
      type: h.type,
      theme: h.themeSlug,
      dimension: h.dimensionSlug,
      sources: h.sources,
      briefingSlug: b.slug,
      briefingHref: `/briefings/${b.slug}/`,
      themeHref: `/themes/${h.themeSlug}/${h.dimensionSlug ? `#${h.dimensionSlug}` : ''}`,
    })),
  );

  return new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      count: items.length,
      items,
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
};
