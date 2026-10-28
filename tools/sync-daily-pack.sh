#!/usr/bin/env bash
# 将实施官当日 attachments 同步进 gefei-quest data/daily-packs/
# 用法：
#   tools/sync-daily-pack.sh [YYYY-MM-DD] [ATTACHMENTS_DIR] [REPO_DIR]
# 默认日期：今天（Asia/Shanghai）；默认附件目录见下方 ATTACH_DEFAULT。
set -euo pipefail

DATE="${1:-$(TZ=Asia/Shanghai date +%F)}"
ATTACH_DEFAULT="/home/box/agent-data/agents/277144be-9cc3-4e62-9754-34a4e491a585/attachments/${DATE}"
ATTACH="${2:-$ATTACH_DEFAULT}"
REPO="${3:-$(cd "$(dirname "$0")/.." && pwd)}"
PACK="$REPO/data/daily-packs/$DATE"

if [[ ! -d "$ATTACH" ]]; then
  echo "attachments 不存在: $ATTACH" >&2
  exit 1
fi

mkdir -p "$PACK"
# 复制公开文件；跳过榜单 JSON 与明显隐私命名
shopt -s nullglob
for f in "$ATTACH"/*; do
  base=$(basename "$f")
  case "$base" in
    money-rank-*.json|*.secret|*.pem|*凭证*|*私聊*|*订单隐私*)
      echo "skip $base"
      continue
      ;;
  esac
  if [[ -d "$f" ]]; then
    rm -rf "$PACK/$base"
    cp -a "$f" "$PACK/$base"
  else
    cp -a "$f" "$PACK/$base"
  fi
  echo "copy $base"
done

# 若无 manifest，写最小 stub（实施官应覆盖为完整摘要）
if [[ ! -f "$PACK/manifest.json" ]]; then
  python3 - "$DATE" "$PACK" <<'PY'
import json, sys, os
from datetime import datetime
from pathlib import Path
date, pack = sys.argv[1], Path(sys.argv[2])
files = []
for p in sorted(pack.rglob("*")):
    if p.is_file() and p.name != "manifest.json":
        files.append({"path": str(p.relative_to(pack)).replace("\\", "/"), "kind": "file", "note": ""})
manifest = {
    "date": date,
    "timezone": "Asia/Shanghai",
    "updated": datetime.now().astimezone().isoformat(timespec="seconds"),
    "title": f"每日执行包｜{date}",
    "source": f"attachments/{date}",
    "primary": [],
    "side": [],
    "deferred": [],
    "files": files,
    "excluded": [],
    "privacy": "仅收录可公开交付物；不含客户私聊与凭证。",
}
(pack / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("wrote stub manifest.json")
PY
fi

# 重建 index.json + latest.json
python3 - "$REPO/data/daily-packs" <<'PY'
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
packs = []
for d in sorted(root.iterdir()):
    if d.is_dir() and (d / "manifest.json").exists():
        m = json.loads((d / "manifest.json").read_text(encoding="utf-8"))
        packs.append({
            "date": m["date"],
            "title": m.get("title", ""),
            "updated": m.get("updated", m["date"]),
            "path": f"data/daily-packs/{m['date']}/",
            "manifest": f"data/daily-packs/{m['date']}/manifest.json",
            "file_count": len(m.get("files") or []),
        })
index = {
    "updated": packs[-1]["updated"] if packs else "",
    "start_date": packs[0]["date"] if packs else "",
    "count": len(packs),
    "packs": list(reversed(packs)),
}
(root / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
if packs:
    latest = json.loads((root / packs[-1]["date"] / "manifest.json").read_text(encoding="utf-8"))
    (root / "latest.json").write_text(json.dumps(latest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"index: {index['count']} packs, latest={packs[-1]['date'] if packs else None}")
PY

echo "done → $PACK"
echo "下一步：在仓库根目录 git add data/daily-packs daily-packs && commit && push（或开 PR）。合并到 main 后 Pages 约 1–2 分钟生效。"
