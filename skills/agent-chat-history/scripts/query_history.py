#!/usr/bin/env python3
"""
按本地日历日粗筛 Claude Code / Codex / Cursor 相关文件（只读）。
默认打印人类可读摘要；可用 --json 输出结构化结果，便于 Agent 少读 SKILL 正文。

用法（在 skill 根目录 agent-chat-history/ 下）:
  python scripts/query_history.py --date 2026-05-10
  python scripts/query_history.py --date 2026-05-10 --mode codex --max-codex 50
  python scripts/query_history.py --date 2026-05-10 --mode cursor --sqlite-keys
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any


def local_day_bounds(d: date) -> tuple[datetime, datetime]:
    """本地时区 [当天 00:00, 次日 00:00)。"""
    tz = datetime.now().astimezone().tzinfo or timezone.utc
    start = datetime.combine(d, datetime.min.time().replace(tzinfo=tz))
    end = start + timedelta(days=1)
    return start, end


def ts_in_day(ts: float | int, start: datetime, end: datetime) -> bool:
    t0, t1 = start.timestamp(), end.timestamp()
    return t0 <= float(ts) < t1


def mtime_in_day(path: Path, start: datetime, end: datetime) -> bool:
    try:
        mt = path.stat().st_mtime
    except OSError:
        return False
    dt = datetime.fromtimestamp(mt, tz=start.tzinfo)
    return start <= dt < end


def home() -> Path:
    return Path.home()


def claude_projects_root() -> Path:
    return home() / ".claude" / "projects"


def codex_history_path() -> Path:
    root = os.environ.get("CODEX_HOME")
    if root:
        return Path(root).expanduser() / "history.jsonl"
    return home() / ".codex" / "history.jsonl"


def cursor_workspace_root() -> Path:
    if sys.platform == "win32":
        appdata = os.environ.get("APPDATA")
        if not appdata:
            return home() / "AppData" / "Roaming" / "Cursor" / "User" / "workspaceStorage"
        return Path(appdata) / "Cursor" / "User" / "workspaceStorage"
    if sys.platform == "darwin":
        return (
            home()
            / "Library"
            / "Application Support"
            / "Cursor"
            / "User"
            / "workspaceStorage"
        )
    return home() / ".config" / "Cursor" / "User" / "workspaceStorage"


def iter_claude_jsonl(day: date) -> list[dict[str, Any]]:
    start, end = local_day_bounds(day)
    out: list[dict[str, Any]] = []
    root = claude_projects_root()
    if not root.is_dir():
        return out
    for p in root.rglob("*.jsonl"):
        if p.is_file() and mtime_in_day(p, start, end):
            out.append(
                {
                    "path": str(p.resolve()),
                    "mtime_iso": datetime.fromtimestamp(
                        p.stat().st_mtime, tz=start.tzinfo
                    ).isoformat(),
                    "filter": "mtime_in_local_day",
                }
            )
    hist = home() / ".claude" / "history.jsonl"
    if hist.is_file() and mtime_in_day(hist, start, end):
        out.append(
            {
                "path": str(hist.resolve()),
                "mtime_iso": datetime.fromtimestamp(
                    hist.stat().st_mtime, tz=start.tzinfo
                ).isoformat(),
                "filter": "mtime_in_local_day",
            }
        )
    return out


def iter_codex_lines(day: date, max_rows: int) -> list[dict[str, Any]]:
    start, end = local_day_bounds(day)
    path = codex_history_path()
    if not path.is_file():
        return []
    t0, t1 = start.timestamp(), end.timestamp()
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except json.JSONDecodeError:
                continue
            ts = o.get("ts")
            if ts is None:
                continue
            try:
                tsi = int(ts)
            except (TypeError, ValueError):
                continue
            if t0 <= tsi < t1:
                rows.append({"ts": tsi, "raw": line})
                if len(rows) >= max_rows:
                    break
    return rows


def iter_cursor_workspaces(day: date) -> list[dict[str, Any]]:
    start, end = local_day_bounds(day)
    root = cursor_workspace_root()
    out: list[dict[str, Any]] = []
    if not root.is_dir():
        return out
    for child in root.iterdir():
        if not child.is_dir():
            continue
        if mtime_in_day(child, start, end):
            db = child / "state.vscdb"
            item: dict[str, Any] = {
                "workspace_dir": str(child.resolve()),
                "mtime_iso": datetime.fromtimestamp(
                    child.stat().st_mtime, tz=start.tzinfo
                ).isoformat(),
                "filter": "workspace_dir_mtime_in_local_day",
            }
            if db.is_file():
                item["state_vscdb"] = str(db.resolve())
            out.append(item)
    return out


def sqlite_chat_keys(db_path: Path, limit: int = 40) -> list[str]:
    try:
        import sqlite3
    except ImportError:
        return []
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    except sqlite3.Error:
        return []
    try:
        cur = conn.execute(
            "SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%composer%' LIMIT ?",
            (limit,),
        )
        return [r[0] for r in cur.fetchall()]
    finally:
        conn.close()


def main() -> int:
    p = argparse.ArgumentParser(description="按日期查询本机 Agent 相关历史文件（只读）")
    p.add_argument("--date", required=True, help="日历日 YYYY-MM-DD（本地时区）")
    p.add_argument(
        "--mode",
        choices=("all", "claude", "codex", "cursor"),
        default="all",
        help="查询子集",
    )
    p.add_argument("--json", action="store_true", help="输出 JSON，便于程序消费")
    p.add_argument(
        "--max-codex",
        type=int,
        default=200,
        help="Codex history.jsonl 最多输出行数（mode 含 codex 时）",
    )
    p.add_argument(
        "--sqlite-keys",
        action="store_true",
        help="对命中的 Cursor state.vscdb 尝试列出可能含聊天的 key（需 sqlite3）",
    )
    args = p.parse_args()

    try:
        day = date.fromisoformat(args.date)
    except ValueError:
        print("错误: --date 须为 YYYY-MM-DD", file=sys.stderr)
        return 2

    result: dict[str, Any] = {"date": args.date, "mode": args.mode}

    if args.mode in ("all", "claude"):
        result["claude_jsonl"] = iter_claude_jsonl(day)
    if args.mode in ("all", "codex"):
        result["codex_history_lines"] = iter_codex_lines(day, args.max_codex)
    if args.mode in ("all", "cursor"):
        result["cursor_workspaces"] = iter_cursor_workspaces(day)
        if args.sqlite_keys and result.get("cursor_workspaces"):
            for item in result["cursor_workspaces"]:
                dbp = item.get("state_vscdb")
                if dbp:
                    item["sqlite_keys_sample"] = sqlite_chat_keys(Path(dbp))

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    # 人类可读
    print(f"日期（本地时区日界）: {args.date}  mode={args.mode}")
    if "claude_jsonl" in result:
        print("\n[Claude Code] 当日 mtime 命中的 .jsonl:")
        for it in result["claude_jsonl"]:
            print(f"  - {it['path']}")
        if not result["claude_jsonl"]:
            print("  （无或未安装 ~/.claude/projects）")
    if "codex_history_lines" in result:
        print(f"\n[Codex] history.jsonl 中行内 ts 落在当日（最多 {args.max_codex} 行）:")
        path = codex_history_path()
        print(f"  文件: {path}")
        for it in result["codex_history_lines"]:
            print(f"  ts={it['ts']}")
        if not result["codex_history_lines"]:
            print("  （无或未安装）")
    if "cursor_workspaces" in result:
        print("\n[Cursor] workspaceStorage 子目录 mtime 落在当日:")
        for it in result["cursor_workspaces"]:
            print(f"  - {it['workspace_dir']}")
            if it.get("state_vscdb"):
                print(f"    state.vscdb: {it['state_vscdb']}")
            if it.get("sqlite_keys_sample"):
                print(f"    keys 样例: {', '.join(it['sqlite_keys_sample'][:10])}")
        if not result["cursor_workspaces"]:
            print("  （无或路径非默认，见 skill references/storage-paths.md）")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
