# 智能对话 · DeepSeek 配置

网站对话**不能**把 DeepSeek 密钥写进前端。正确做法：

```text
浏览器 → PUBLIC_CHAT_ENDPOINT（代理）→ DeepSeek API
```

仓库已提供本地/可部署代理：`services/chat-proxy/`。

---

## 1. 拿 DeepSeek API Key

1. 打开 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 创建 API Key（形如 `sk-...`）
3. **只保存在服务端环境变量**，不要提交到 Git

---

## 2. 启动对话代理

```bash
cd services/chat-proxy
export DEEPSEEK_API_KEY="sk-你的密钥"
# 可选：
# export DEEPSEEK_MODEL="deepseek-chat"          # 默认
# export DEEPSEEK_MODEL="deepseek-reasoner"      # 更强推理
# export PORT=8787
npm start
```

健康检查：浏览器打开 `http://127.0.0.1:8787/health`，应看到 `"hasKey": true`。

---

## 3. 让网站指向代理

在 `web/` 下创建 `.env`（已被 gitignore，勿提交）：

```bash
# web/.env
PUBLIC_CHAT_ENDPOINT=http://127.0.0.1:8787/chat
```

然后重新构建并预览：

```bash
cd web
npm run build
npm run preview
```

打开站点 → 任意要点点「针对这条对话」→ 提问。  
底部提示变为「当前为接口模型回答…」即表示 DeepSeek 已接通。

> `PUBLIC_*` 变量会打进前端包，这里只暴露**代理地址**，不暴露密钥。

---

## 4. 公开发布时怎么配

静态站（GitHub Pages）+ 代理（二选一）：

| 方式 | 做法 |
|---|---|
| 继续用本仓库代理 | 把 `services/chat-proxy` 部署到一台有公网的小服务（Fly.io / Railway / 云主机），设好 `DEEPSEEK_API_KEY`，网站 `PUBLIC_CHAT_ENDPOINT=https://你的域名/chat` |
| Cloudflare Worker | 用同样逻辑改写成 Worker，密钥放 Worker Secrets |

生产环境建议把 `CORS_ORIGIN` 设成你的网站域名，而不是 `*`：

```bash
export CORS_ORIGIN="https://你的网站域名"
```

---

## 5. 接口约定（已实现）

```http
POST /chat
Content-Type: application/json

{
  "question": "这对 SOC 意味着什么？",
  "context": { "title", "summary", "sources", ... },
  "related": [ /* 站内相关要点 */ ]
}
```

响应：

```json
{ "answer": "<p>...</p>" }
```

未配置 `PUBLIC_CHAT_ENDPOINT` 时，网站自动退回「站内知识库检索」模式，不影响浏览。
