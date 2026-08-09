/** href 不含前导 /，由布局用 BASE_URL 拼接，兼容 GitHub Pages 子路径 */
export function u(path = ''): string {
  const base = import.meta.env.BASE_URL || '/';
  const clean = String(path).replace(/^\//, '');
  return `${base}${clean}`;
}

/** 绝对 URL，用于 RSS/sitemap 等需要完整域名的场景 */
export function absUrl(path = ''): string {
  const site = import.meta.env.SITE || 'http://localhost:4321';
  return new URL(u(path), site).toString();
}
