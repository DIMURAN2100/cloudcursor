import type { Briefing } from './briefings';

export const ARCHIVE_DAYS_PER_PAGE = 15;

export type BriefingDay = {
  date: string;
  briefings: Briefing[];
};

export function groupBriefingsByDay(briefings: Briefing[]): BriefingDay[] {
  const groups = new Map<string, Briefing[]>();

  for (const briefing of briefings) {
    const items = groups.get(briefing.date) ?? [];
    items.push(briefing);
    groups.set(briefing.date, items);
  }

  return [...groups.entries()].map(([date, items]) => ({
    date,
    briefings: items,
  }));
}

export function paginateBriefingDays(
  briefings: Briefing[],
  page: number,
  pageSize = ARCHIVE_DAYS_PER_PAGE,
) {
  const days = groupBriefingsByDay(briefings);
  const totalPages = Math.max(1, Math.ceil(days.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    days: days.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
    totalDays: days.length,
  };
}
