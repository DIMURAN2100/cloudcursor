/**
 * DeepSeek 对话代理（密钥只存在服务端）。
 *
 * 启动：
 *   export DEEPSEEK_API_KEY=sk-xxx
 *   npm start
 *
 * 网站侧：
 *   export PUBLIC_CHAT_ENDPOINT=http://127.0.0.1:8787/chat
 *   cd web && npm run build && npm run preview
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const ALLOW_ORIGIN = process.env.CORS_ORIGIN || '*';

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function buildPrompt(payload) {
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
        '回答用简洁中文，结构清楚；若涉及落地，给出可执行建议；末尾列出用到的原文链接。',
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

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    send(res, 200, {
      ok: true,
      model: MODEL,
      hasKey: Boolean(API_KEY),
    });
    return;
  }

  if (req.method === 'POST' && (req.url === '/chat' || req.url?.startsWith('/chat?'))) {
    if (!API_KEY) {
      send(res, 500, { error: '缺少 DEEPSEEK_API_KEY' });
      return;
    }
    try {
      const payload = await readBody(req);
      if (!payload.question) {
        send(res, 400, { error: 'question 必填' });
        return;
      }

      const upstream = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: buildPrompt(payload),
          temperature: 0.3,
        }),
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        send(res, upstream.status, {
          error: data?.error?.message || 'DeepSeek 调用失败',
          detail: data,
        });
        return;
      }

      const answer = data?.choices?.[0]?.message?.content || '';
      // 前端聊天气泡用 innerHTML；将换行转成段落，避免整段糊在一起。
      const html = answer
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
      send(res, 200, { answer: html || '<p>（空响应）</p>', raw: answer });
    } catch (err) {
      send(res, 500, { error: err?.message || String(err) });
    }
    return;
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[chat-proxy] http://127.0.0.1:${PORT}/chat`);
  console.log(`[chat-proxy] model=${MODEL} key=${API_KEY ? 'set' : 'MISSING'}`);
});
