/**
 * 极简 HTML 消毒：简报源是私有的自动化产物，但仍在构建时去掉
 * <script> / <iframe> / on*= 等危险构造，避免上游模板异常把脚本注入静态站。
 * 不引入 DOMPurify（Node 端需要 jsdom）；白名单够用即可。
 */
const DANGEROUS_TAGS = /<\s*(script|iframe|object|embed|form|link|meta|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_SELF_CLOSING = /<\s*(script|iframe|object|embed|form|link|meta|base)\b[^>]*>/gi;
const ON_HANDLER = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /(javascript|data|vbscript)\s*:/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, '')
    .replace(DANGEROUS_SELF_CLOSING, '')
    .replace(ON_HANDLER, '')
    .replace(JS_URL, (m) => m.replace(/:/g, '&#58;'));
}
