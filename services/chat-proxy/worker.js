/**
 * Cloudflare Worker 版 chat-proxy（推荐公网部署方式）。
 *
 * 部署：
 *   1. 安装 wrangler：npm i -g wrangler
 *   2. wrangler login
 *   3. cd services/chat-proxy && wrangler secret put DEEPSEEK_API_KEY
 *   4. wrangler deploy
 *
 * 得到 https://xxx.workers.dev 后，把
 *   PUBLIC_CHAT_ENDPOINT=https://xxx.workers.dev/chat
 * 配到 GitHub Actions Secret，站点构建即接通对话。
 */

const MODEL = 'deepseek-chat';
const BASE_URL = 'https://api.deepseek.com';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function buildMessages(payload) {
  const ctx = payload.context || {};
  const related = Array.isArray(payload.related) ? payload.related : [];
  const sources = (ctx.sources || [])
    .map((s) => `- ${s.label}: ${s.href}`)
    .join('\n');
  const relatedText = related
    .map(
      (r, i) =>
        `${i + 1}. ${r.title}${r.date ? `（${r.date}）` : ''}\n${r.summary}\n来源：${(r.sources || [])
          .map((s) => s.href)
          .join(' · ')}`,
    )
    .join('\n\n');

  return [
    {
      role: 'system',
      content:
        '你是「AI简化安全」学习站助手。只依据给定简报上下文回答，不编造未提供的事实。' +
        '回答用简洁中文；若涉及落地，给出可执行建议；末尾列出用到的原文链接。',
    },
    {
      role: 'user',
      content: `【当前条目】
标题：${ctx.title || ''}
类型：${ctx.type || ''}
日期：${ctx.date || ''}
摘要：${ctx.summary || ''}
原文：
${sources || '无'}

【相关简报】
${relatedText || '无'}

【用户问题】
${payload.question || ''}`,
    },
  ];
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return Response.json(
        { ok: true, model: MODEL, hasKey: Boolean(env.DEEPSEEK_API_KEY) },
        { headers: corsHeaders(origin) },
      );
    }

    if (request.method === 'POST' && url.pathname === '/chat') {
      if (!env.DEEPSEEK_API_KEY) {
        return Response.json(
          { error: '缺少 DEEPSEEK_API_KEY' },
          { status: 500, headers: corsHeaders(origin) },
        );
      }
      try {
        const payload = await request.json();
        if (!payload.question) {
          return Response.json(
            { error: 'question 必填' },
            { status: 400, headers: corsHeaders(origin) },
          );
        }
        const upstream = await fetch(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: env.DEEPSEEK_MODEL || MODEL,
            messages: buildMessages(payload),
            temperature: 0.3,
          }),
        });
        const data = await upstream.json();
        if (!upstream.ok) {
          return Response.json(
            { error: data?.error?.message || 'DeepSeek 调用失败', detail: data },
            { status: upstream.status, headers: corsHeaders(origin) },
          );
        }
        const answer = data?.choices?.[0]?.message?.content || '';
        const html = answer
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
          .join('');
        return Response.json(
          { answer: html || '<p>（空响应）</p>', raw: answer },
          { headers: corsHeaders(origin) },
        );
      } catch (err) {
        return Response.json(
          { error: err?.message || String(err) },
          { status: 500, headers: corsHeaders(origin) },
        );
      }
    }

    return Response.json({ error: 'not found' }, { status: 404, headers: corsHeaders(origin) });
  },
};
