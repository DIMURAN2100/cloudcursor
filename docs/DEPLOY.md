# 公开发布清单（GitHub Pages + 自动更新）

## 组合方式

| 组件 | 放哪 | 作用 |
|---|---|---|
| 网站静态页 | GitHub Pages | 全球可访问 |
| 每日简报 | `AI安全新闻` 分支（原流程） | OpenClaw / 原发布 |
| 每日智能更新 Automation | 推到 `main` | 同步简报 + enrichment → 触发 Pages 重建 |

---

## 你需要手动做的 3 步

### 1）把仓库改为 Public

GitHub → `DIMURAN2100/cloudcursor` → **Settings → General → Danger Zone → Change repository visibility → Public**

### 2）合并 PR #8 到 `main`

把学习站代码合进默认分支，Pages 工作流才会生效。

### 3）开启 GitHub Pages

Settings → **Pages** → Build and deployment → Source 选 **GitHub Actions**

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

`https://dimuran2100.github.io/cloudcursor/`

首次合并后若 Actions 失败，到 Actions 页看日志；常见原因是 Pages 未改为 GitHub Actions 源。
