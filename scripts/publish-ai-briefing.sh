#!/usr/bin/env bash
# 将 AI 安全简报写入 briefings/ 并直推到远程分支「AI安全新闻」。
# 命名：东八区日期 + 主题；若主题含非 ASCII 字符则用 brief-{sha256 前 12 位}.md，避免 GitHub 网页无法加载含中文路径的 blob。
#
# 用法：
#   BRIEFING_TOPIC="全球网络安全简报" ./scripts/publish-ai-briefing.sh < briefing.md
#   BRIEFING_TOPIC="Comment与Control披露" ./scripts/publish-ai-briefing.sh ./draft.md
#
# 环境变量：
#   BRIEFING_TOPIC  关键主体（文件名用），默认「全球网络安全简报」
#   REMOTE          默认 origin
#   BRANCH          默认 AI安全新闻
#   SKIP_PUSH       设为 1 时只写文件并提交到当前已检出的分支（调试用）
#   RETURN_PREVIOUS 设为 0 时推送后不尝试切回原分支（默认 1）

set -euo pipefail

REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-AI安全新闻}"
TOPIC="${BRIEFING_TOPIC:-全球网络安全简报}"
SKIP_PUSH="${SKIP_PUSH:-0}"
RETURN_PREVIOUS="${RETURN_PREVIOUS:-1}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

sanitize_topic() {
  local raw="$1"
  # 去除路径与 Windows 非法字符，压缩空白
  raw="$(printf '%s' "$raw" | tr -d '\r\n' | sed 's/[\/\\:*?"<>|]/_/g' | sed 's/[[:space:]]\{1,\}/_/g')"
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY' "$raw"
import re, sys
s = sys.argv[1]
s = re.sub(r"_+", "_", s).strip("_")
print(s[:80] if s else "brief")
PY
  else
    printf '%s' "${raw:0:80}"
  fi
}

# 简报文件名：GitHub 网页端对「briefings/ 下含中文等非 ASCII 路径」偶发无法加载 blob，故非纯 ASCII 主题时使用稳定短哈希前缀。
filename_for_briefing() {
  local date_part="$1"
  local topic_raw="$2"
  local safe
  safe="$(sanitize_topic "$topic_raw")"
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY' "$date_part" "$topic_raw" "$safe"
import hashlib, re, sys
date_part, topic_raw, safe = sys.argv[1:4]
safe = (safe or "brief").strip("_") or "brief"
# 仅允许 ASCII 文件名段，避免 URL/前端对 Unicode 路径的兼容问题
if re.fullmatch(r"[A-Za-z0-9._-]+", safe) and safe not in (".", ".."):
    slug = safe[:80]
else:
    h = hashlib.sha256(topic_raw.encode("utf-8")).hexdigest()[:12]
    slug = f"brief-{h}"
print(f"{date_part}-{slug}.md")
PY
  else
    # 无 python 时退化为日期 + 固定后缀（可能丢失主题区分度）
    echo "${date_part}-brief.bin.md"
  fi
}

DATE="$(TZ=Asia/Shanghai date +%Y-%m-%d)"
FILENAME="$(filename_for_briefing "$DATE" "$TOPIC")"
REL_PATH="briefings/${FILENAME}"

CONTENT_FILE=""
if [[ -n "${1:-}" && -f "$1" ]]; then
  CONTENT_FILE="$1"
elif [[ -t 0 ]]; then
  echo "用法: BRIEFING_TOPIC=\"关键主体\" $0 [简报.md]   # 或从 stdin 传入正文" >&2
  exit 1
fi

PREV_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"

git fetch "$REMOTE" "$BRANCH"

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH" "$REMOTE/$BRANCH"
fi

git pull --rebase "$REMOTE" "$BRANCH" || true

mkdir -p briefings

if [[ -n "$CONTENT_FILE" ]]; then
  cp -f "$CONTENT_FILE" "$REL_PATH"
else
  cat >"$REL_PATH"
fi

git add -- "$REL_PATH"

if git diff --staged --quiet; then
  echo "无变更（文件内容或与远程一致），跳过提交。"
else
  git commit -m "简报: ${FILENAME}"
fi

if [[ "$SKIP_PUSH" != "1" ]]; then
  delay=4
  for attempt in 1 2 3 4 5; do
    if git push -u "$REMOTE" "$BRANCH"; then
      break
    fi
    if [[ "$attempt" -eq 5 ]]; then
      echo "git push 在 5 次尝试后仍失败。" >&2
      exit 1
    fi
    echo "push 失败，${delay}s 后重试 (${attempt}/4)..." >&2
    sleep "$delay"
    delay=$((delay * 2))
  done
else
  echo "SKIP_PUSH=1，未执行 push。"
fi

if [[ "$RETURN_PREVIOUS" == "1" && -n "$PREV_BRANCH" && "$PREV_BRANCH" != "$BRANCH" ]]; then
  git checkout "$PREV_BRANCH" || true
fi

echo "已写入并推送: $REL_PATH"
