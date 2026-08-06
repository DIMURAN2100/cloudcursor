# 智能对话能力说明

网站支持对任意简报要点发起「针对这条对话」。

## 默认模式（无需后端）

1. 构建时生成 `/knowledge.json`（全部要点 + 原文链接）
2. 用户点击「针对这条对话」→ 侧栏载入该条上下文
3. 提问后在站内知识库做相关检索，返回答案并附带原文链接

适合公开发布的静态托管（GitHub Pages 等）。

## 完整 LLM 模式（可选）

设置环境变量后重新构建：

```bash
# web/.env
PUBLIC_CHAT_ENDPOINT=https://your-worker.example.com/chat
```

接口约定：

```http
POST /chat
Content-Type: application/json

{
  "question": "用户问题",
  "context": { "id", "title", "summary", "sources", ... },
  "related": [ /* 站内相关要点 */ ]
}
```

响应：

```json
{ "answer": "<p>HTML 或纯文本均可</p>" }
```

Worker / Serverless 内可接 OpenAI 兼容 API；务必服务端保管密钥，不要写进前端。
