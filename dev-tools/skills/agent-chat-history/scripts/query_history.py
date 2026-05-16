#!/usr/bin/env python3
"""
按本地日历日粗筛 Claude Code / Codex / Cursor 相关文件（只读）。
支持 --prompts-only：尽量只输出用户输入提示词，减少下游 token。

用法（在 skill 根目录 agent-chat-history/ 下）:
  python scripts/query_history.py --date 2026-05-10
  python scripts/query_history.py --date 2026-05-10 --prompts-only --json
  python scripts/query_history.py --date 2026-05-10 --mode codex --prompts-only
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

# ---------- 路径（与 references/storage-paths.md 一致）----------


def local_day_bounds(d: date) -> tuple[datetime, datetime]:
    """本地时区 [当天 00:00, 次日 00:00)。"""
    tz = datetime.now().astimezone().tzinfo or timezone.utc
    start = datetime.combine(d, datetime.min.time().replace(tzinfo=tz))
    end = start + timedelta(days=1)
    return start, end


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


# ---------- 通用：时间 ----------


def parse_iso_ts(s: str) -> datetime | None:
    if not s or not isinstance(s, str):
        return None
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def dt_in_local_day(dt: datetime, start: datetime, end: datetime) -> bool:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    loc = dt.astimezone(start.tzinfo)
    return start <= loc < end


# ---------- Claude Code：仅用户提示 ----------


def flatten_claude_content(content: Any) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, dict):
                t = block.get("type")
                if t == "text" and "text" in block:
                    parts.append(str(block["text"]))
                elif "text" in block:
                    parts.append(str(block["text"]))
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts).strip()
    return str(content).strip()


def claude_user_prompt_from_line(
    obj: dict[str, Any], start: datetime, end: datetime, file_mtime_day: bool
) -> str | None:
    """从一行 JSONL 提取用户提示；若信封带 timestamp 则按本地日过滤，否则依赖 file_mtime_day。"""
    if obj.get("type") != "user":
        return None
    msg = obj.get("message")
    if not isinstance(msg, dict) or msg.get("role") != "user":
        return None
    # 可选：跳过明显非手输的 subtype（若存在）
    st = msg.get("subtype")
    if st in ("hook_result", "command_output"):
        return None

    ts_raw = obj.get("timestamp")
    ts = parse_iso_ts(str(ts_raw)) if ts_raw is not None else None
    if ts is not None:
        if not dt_in_local_day(ts, start, end):
            return None
    elif not file_mtime_day:
        return None

    text = flatten_claude_content(msg.get("content"))
    return text or None


def iter_claude_jsonl_paths(day: date, include_global_history: bool) -> list[Path]:
    """仅 projects 下会话 jsonl；全局 history.jsonl 由 --include-claude-global-history 单独解析。"""
    start, end = local_day_bounds(day)
    paths: list[Path] = []
    root = claude_projects_root()
    if root.is_dir():
        for p in root.rglob("*.jsonl"):
            if p.is_file() and mtime_in_day(p, start, end):
                paths.append(p)
    if include_global_history:
        hist = home() / ".claude" / "history.jsonl"
        if hist.is_file() and mtime_in_day(hist, start, end):
            paths.append(hist)
    return paths


def collect_claude_prompts(
    day: date,
    max_prompts: int,
    claude_scan: str,
    max_claude_files: int,
) -> list[dict[str, Any]]:
    start, end = local_day_bounds(day)
    out: list[dict[str, Any]] = []
    roots: list[Path] = []
    if claude_scan == "mtime":
        roots = iter_claude_jsonl_paths(day, include_global_history=False)
    else:
        root = claude_projects_root()
        if root.is_dir():
            roots = [p for p in root.rglob("*.jsonl") if p.is_file()][:max_claude_files]
        roots = roots[:max_claude_files]

    for path in roots:
        if path.name == "history.jsonl" and path.parent == home() / ".claude":
            continue
        fday = mtime_in_day(path, start, end)
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for lineno, line in enumerate(text.splitlines(), 1):
            if len(out) >= max_prompts:
                return out
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(obj, dict):
                continue
            prompt = claude_user_prompt_from_line(obj, start, end, fday)
            if prompt:
                out.append(
                    {
                        "client": "claude-code",
                        "file": str(path.resolve()),
                        "line": lineno,
                        "prompt": prompt,
                    }
                )
    return out


def collect_claude_global_history_prompts(
    day: date, max_prompts: int
) -> list[dict[str, Any]]:
    """~/.claude/history.jsonl 常见为「仅用户输入」行；字段因版本而异，尽力提取字符串。"""
    start, end = local_day_bounds(day)
    path = home() / ".claude" / "history.jsonl"
    out: list[dict[str, Any]] = []
    if not path.is_file() or not mtime_in_day(path, start, end):
        return out
    try:
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return out
    for lineno, line in enumerate(lines, 1):
        if len(out) >= max_prompts:
            break
        line = line.strip()
        if not line:
            continue
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(o, dict):
            continue
        for key in ("text", "prompt", "query", "input"):
            if key not in o or not isinstance(o[key], str) or not o[key].strip():
                continue
            ts = o.get("ts") or o.get("timestamp")
            ok = False
            if isinstance(ts, (int, float)):
                ok = start.timestamp() <= float(ts) < end.timestamp()
            elif isinstance(ts, str):
                dtp = parse_iso_ts(ts)
                ok = dtp is not None and dt_in_local_day(dtp, start, end)
            if ok:
                out.append(
                    {
                        "client": "claude-code-history",
                        "file": str(path.resolve()),
                        "line": lineno,
                        "prompt": o[key].strip(),
                    }
                )
            break
    return out


# ---------- Codex：仅提示 ----------


def codex_prompt_from_obj(o: dict[str, Any]) -> str | None:
    if isinstance(o.get("text"), str) and o["text"].strip():
        return o["text"].strip()
    if o.get("role") == "user":
        c = o.get("content")
        if isinstance(c, str) and c.strip():
            return c.strip()
    return None


def collect_codex_prompts(day: date, max_rows: int) -> list[dict[str, Any]]:
    start, end = local_day_bounds(day)
    path = codex_history_path()
    out: list[dict[str, Any]] = []
    if not path.is_file():
        return out
    t0, t1 = start.timestamp(), end.timestamp()
    with path.open(encoding="utf-8", errors="ignore") as f:
        for lineno, line in enumerate(f, 1):
            if len(out) >= max_rows:
                break
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
            if not (t0 <= tsi < t1):
                continue
            prompt = codex_prompt_from_obj(o)
            if prompt:
                out.append(
                    {
                        "client": "codex",
                        "file": str(path.resolve()),
                        "line": lineno,
                        "ts": tsi,
                        "prompt": prompt,
                    }
                )
    return out


# ---------- Cursor：尽力从 state.vscdb 抽 user 文本 ----------


CURSOR_VALUE_KEYS = (
    "composer.composerData",
    "workbench.panel.aichat.view.aichat.chatdata",
)


def walk_user_strings(obj: Any, out: list[str], depth: int = 0) -> None:
    if depth > 40:
        return
    if isinstance(obj, dict):
        role = obj.get("role") or obj.get("author") or obj.get("kind")
        if role in ("user", "human"):
            for k in ("content", "text", "value", "body", "message"):
                v = obj.get(k)
                if isinstance(v, str) and len(v.strip()) > 1:
                    out.append(v.strip())
                elif isinstance(v, list):
                    walk_user_strings(v, out, depth + 1)
        for v in obj.values():
            walk_user_strings(v, out, depth + 1)
    elif isinstance(obj, list):
        for v in obj:
            walk_user_strings(v, out, depth + 1)


def extract_cursor_prompts_from_blob(raw: str, max_n: int) -> list[str]:
    prompts: list[str] = []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # 部分值为转义 JSON 字符串
        try:
            data = json.loads(raw.encode().decode("unicode_escape"))
        except Exception:
            return []
    buf: list[str] = []
    walk_user_strings(data, buf)
    seen: set[str] = set()
    for s in buf:
        if s in seen or len(s) < 2:
            continue
        seen.add(s)
        prompts.append(s)
        if len(prompts) >= max_n:
            break
    return prompts


def collect_cursor_prompts(
    day: date, max_prompts: int, max_blob_mb: int
) -> list[dict[str, Any]]:
    try:
        import sqlite3
    except ImportError:
        return []

    start, end = local_day_bounds(day)
    root = cursor_workspace_root()
    out: list[dict[str, Any]] = []
    if not root.is_dir():
        return out
    max_bytes = max_blob_mb * 1024 * 1024
    for child in root.iterdir():
        if not child.is_dir() or not mtime_in_day(child, start, end):
            continue
        db = child / "state.vscdb"
        if not db.is_file():
            continue
        try:
            conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
        except sqlite3.Error:
            continue
        try:
            for key in CURSOR_VALUE_KEYS:
                if len(out) >= max_prompts:
                    break
                cur = conn.execute(
                    "SELECT value FROM ItemTable WHERE key = ? LIMIT 1", (key,)
                )
                row = cur.fetchone()
                if not row or not row[0]:
                    continue
                raw = row[0]
                if isinstance(raw, bytes):
                    raw = raw.decode("utf-8", errors="ignore")
                if len(raw) > max_bytes:
                    continue
                for i, prompt in enumerate(
                    extract_cursor_prompts_from_blob(raw, max_prompts - len(out))
                ):
                    if len(out) >= max_prompts:
                        break
                    out.append(
                        {
                            "client": "cursor",
                            "file": str(db.resolve()),
                            "sqlite_key": key,
                            "index": i,
                            "prompt": prompt,
                        }
                    )
        finally:
            conn.close()
    return out


# ---------- 原有：仅列路径（非 prompts-only）----------


def iter_claude_jsonl(day: date) -> list[dict[str, Any]]:
    start, end = local_day_bounds(day)
    out: list[dict[str, Any]] = []
    for path in iter_claude_jsonl_paths(day, include_global_history=True):
        out.append(
            {
                "path": str(path.resolve()),
                "mtime_iso": datetime.fromtimestamp(
                    path.stat().st_mtime, tz=start.tzinfo
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
    ap = argparse.ArgumentParser(description="按日期查询本机 Agent 相关历史（只读）")
    ap.add_argument("--date", required=True, help="日历日 YYYY-MM-DD（本地时区）")
    ap.add_argument(
        "--mode",
        choices=("all", "claude", "codex", "cursor"),
        default="all",
        help="查询子集",
    )
    ap.add_argument("--json", action="store_true", help="输出 JSON")
    ap.add_argument(
        "--prompts-only",
        action="store_true",
        help="只提取用户输入提示词（Claude JSONL / Codex history / Cursor DB 尽力解析）",
    )
    ap.add_argument(
        "--max-codex",
        type=int,
        default=200,
        help="Codex 最多处理行数（prompts-only 与列表模式共用上限之一）",
    )
    ap.add_argument(
        "--max-prompts",
        type=int,
        default=300,
        help="prompts-only 合并后最多条数",
    )
    ap.add_argument(
        "--claude-scan",
        choices=("mtime", "all"),
        default="mtime",
        help="prompts-only：Claude projects 下扫描 mtime 在当日内的 jsonl，或 all（截断见 --max-claude-files）",
    )
    ap.add_argument(
        "--max-claude-files",
        type=int,
        default=200,
        help="claude-scan=all 时最多打开的文件数",
    )
    ap.add_argument(
        "--include-claude-global-history",
        action="store_true",
        help="prompts-only：额外解析 ~/.claude/history.jsonl（字段因版本而异）",
    )
    ap.add_argument(
        "--max-cursor-blob-mb",
        type=int,
        default=8,
        help="Cursor SQLite 单 value 最大体积（MB），超限跳过以免内存爆",
    )
    ap.add_argument(
        "--sqlite-keys",
        action="store_true",
        help="非 prompts-only：列出 state.vscdb 中含 chat/composer 的 key",
    )
    args = ap.parse_args()

    try:
        day = date.fromisoformat(args.date)
    except ValueError:
        print("错误: --date 须为 YYYY-MM-DD", file=sys.stderr)
        return 2

    if args.prompts_only:
        merged: list[dict[str, Any]] = []
        if args.mode in ("all", "claude"):
            merged.extend(
                collect_claude_prompts(
                    day,
                    args.max_prompts,
                    args.claude_scan,
                    args.max_claude_files,
                )
            )
        if args.include_claude_global_history and args.mode in ("all", "claude"):
            merged.extend(
                collect_claude_global_history_prompts(
                    day, max(0, args.max_prompts - len(merged))
                )
            )
        if args.mode in ("all", "codex"):
            merged.extend(
                collect_codex_prompts(day, max(0, args.max_prompts - len(merged)))
            )
        if args.mode in ("all", "cursor"):
            merged.extend(
                collect_cursor_prompts(
                    day, max(0, args.max_prompts - len(merged)), args.max_cursor_blob_mb
                )
            )
        merged = merged[: args.max_prompts]

        if args.json:
            print(
                json.dumps(
                    {"date": args.date, "prompts_only": True, "prompts": merged},
                    ensure_ascii=False,
                    indent=2,
                )
            )
            return 0

        print(f"日期: {args.date}  --prompts-only  mode={args.mode}")
        for i, it in enumerate(merged, 1):
            print(f"\n--- [{i}] {it.get('client')} ---")
            if "file" in it:
                print(it["file"], end="")
                if "line" in it:
                    print(f" :{it['line']}", end="")
                print()
            print(it.get("prompt", ""))
        if not merged:
            print("\n（无命中：检查是否安装、是否当日有会话，或尝试 --claude-scan all）")
        return 0

    # ----- 原有列表模式 -----
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

    print(f"日期（本地时区日界）: {args.date}  mode={args.mode}")
    if "claude_jsonl" in result:
        print("\n[Claude Code] 当日 mtime 命中的 .jsonl:")
        for it in result["claude_jsonl"]:
            print(f"  - {it['path']}")
        if not result["claude_jsonl"]:
            print("  （无或未安装 ~/.claude/projects）")
    if "codex_history_lines" in result:
        print(f"\n[Codex] history.jsonl 中行内 ts 落在当日（最多 {args.max_codex} 行）:")
        print(f"  文件: {codex_history_path()}")
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
