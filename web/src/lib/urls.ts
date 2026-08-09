/** 拼接 Astro base（GitHub Pages 项目站为 /cloudcursor/） */
export function u(path = ''): string {
  const base = import.meta.env.BASE_URL || '/';
  const clean = String(path).replace(/^\//, '');
  return `${base}${clean}`;
}
