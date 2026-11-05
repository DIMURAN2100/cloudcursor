import type { APIContext } from 'astro';
import { loadBriefings } from '../lib/briefings';
import { loadAnalyses } from '../lib/compliance';
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

  const compliance = loadAnalyses().map((doc) => ({
    id: doc.id,
    date: doc.document_profile.effective_at,
    title: doc.document_profile.title,
    summary: doc.executive_summary.join(' '),
    type: '合规文件',
    theme: 'governance',
    href: u(`governance/docs/${doc.id}/`),
  }));

  return new Response(JSON.stringify([...compliance, ...docs]), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
