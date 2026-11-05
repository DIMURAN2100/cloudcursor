#!/usr/bin/env bash
# 从远程「AI安全新闻」分支同步最新简报到当前分支的 briefings/，供学习站构建吸收日更。
#
# 用法（在站点所在分支执行）：
#   ./scripts/sync-briefings-to-site.sh          # 同步 + 提交
#   SKIP_COMMIT=1 ./scripts/sync-briefings-to-site.sh   # 只同步不提交（本地预览用）
#
# 环境变量：
#   REMOTE       默认 origin
#   NEWS_BRANCH  默认 AI安全新闻
#   SKIP_COMMIT  设为 1 时仅更新工作区文件

set -euo pipefail

REMOTE="${REMOTE:-origin}"
NEWS_BRANCH="${NEWS_BRANCH:-AI安全新闻}"
SKIP_COMMIT="${SKIP_COMMIT:-0}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

git fetch "$REMOTE" "$NEWS_BRANCH"
git checkout "$REMOTE/$NEWS_BRANCH" -- briefings/

# 官方文件原文由采集任务写入新闻分支，站点分支只在这里同步原文，不从新闻分支覆盖解读。
if git cat-file -e "$REMOTE/$NEWS_BRANCH:data/compliance/corpus" 2>/dev/null; then
  git checkout "$REMOTE/$NEWS_BRANCH" -- data/compliance/corpus
fi

ADDED="$(git status --short briefings/ data/compliance/corpus 2>/dev/null | wc -l | tr -d ' ')"
if [[ "$ADDED" == "0" ]]; then
  echo "简报和官方语料已是最新，无需同步。"
  exit 0
fi

echo "同步了 $ADDED 处简报或官方语料变更。"

if [[ "$SKIP_COMMIT" != "1" ]]; then
  git add briefings/
  if [[ -d data/compliance/corpus ]]; then
    git add data/compliance/corpus
  fi
  git commit -m "chore: 同步 ${NEWS_BRANCH} 最新简报与官方语料（$(TZ=Asia/Shanghai date +%Y-%m-%d)）"
  echo "已提交。构建站点即可吸收最新日报：cd web && npm run build"
else
  echo "SKIP_COMMIT=1，仅更新了工作区文件。"
fi
