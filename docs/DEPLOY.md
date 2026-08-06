# 公开发布清单（GitHub Pages + 对话代理 + 自动更新）

## 结论先说

**可以解决。** 正确组合是：

| 组件 | 放哪 | 作用 |
|---|---|---|
| 网站静态页 | GitHub Pages | 全球可访问 |
| chat-proxy | Cloudflare Worker（推荐）或你的云 VM | 安全调用 DeepSeek |
| 每日简报 | `AI安全新闻` 分支（原流程） | OpenClaw / 原发布 |
| 每日智能更新 Automation | 推到 `main` | 同步简报 + enrichment → 触发 Pages 重建 |

> Cursor 云端 Agent 的临时 VM **不适合**当长期公网 chat-proxy（会关机、无稳定域名）。

---

## 你需要手动做的 3 步（我这边无权限代做）

### 1）把仓库改为 Public

GitHub → `DIMURAN2100/cloudcursor` → **Settings → General → Danger Zone → Change repository visibility → Public**

### 2）合并 PR #8 到 `main`

把学习站代码合进默认分支，Pages 工作流才会生效。

### 3）开启 GitHub Pages

Settings → **Pages** → Build and deployment → Source 选 **GitHub Actions**

---

## 部署 DeepSeek 代理（推荐 Cloudflare Worker）

在你本机（已登录 Cloudflare）：

```bash
npm i -g wrangler
cd services/chat-proxy
wrangler login
wrangler secret put DEEPSEEK_API_KEY   # 粘贴 sk-xxx
wrangler deploy
```

记下输出的地址，例如：`https://ai-simplify-chat-proxy.xxx.workers.dev`

到 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret：

- Name: `PUBLIC_CHAT_ENDPOINT`
- Value: `https://ai-simplify-chat-proxy.xxx.workers.dev/chat`

若坚持用云 VM：在 VM 上跑 `services/chat-proxy/server.mjs`，用 systemd/nginx 反代 HTTPS，把同样的 URL 配进上述 Secret。

---

## 自动更新如何转起来

```text
每天早晨
  ├─ 简报 Automation → 推 AI安全新闻
  └─ 网站 Automation（绑 main）
        → sync 简报 + 智能加工 + commit/push main
              → GitHub Actions 自动 build & 发布 Pages
```

因此：**Automation 必须绑 `main`（合并后）且保持 Active**；简报时间早于网站智能更新。

---

## 预期公网地址

- 网站：`https://dimuran2100.github.io/cloudcursor/`
- 对话：走 Worker 上的 `/chat`

首次合并后若 Actions 失败，到 Actions 页看日志；常见原因是 Pages 未改为 GitHub Actions 源，或 Secret 未配（不配也能上线，只是对话退回站内检索）。
