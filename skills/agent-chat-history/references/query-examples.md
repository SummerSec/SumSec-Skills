# 按日期查询示例

**若已给定日期**：优先运行 skill 内脚本（少占对话 token）：`python scripts/query_history.py --date YYYY-MM-DD [--json]`；**只要用户提示词**时加 `--prompts-only [--include-claude-global-history]`（在 `agent-chat-history/` 目录下执行）。

脚本全参数、两种模式与各端筛选规则见 [query-history-script.md](query-history-script.md)。

以下手工示例假设目标日为 **2026-05-10**（本地日历日），请替换为实际需要。时间边界建议：**本地时区当天 00:00:00 至次日 00:00:00 前**。

---

## A. Windows（PowerShell）

### A.1 按文件修改日期粗筛 Claude Code `*.jsonl`

```powershell
$d = Get-Date '2026-05-10'
$root = "$env:USERPROFILE\.claude\projects"
Get-ChildItem -Path $root -Recurse -File -Filter *.jsonl -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime.Date -eq $d.Date } |
  Select-Object FullName, LastWriteTime
```

### A.2 Codex `history.jsonl` 按行内 `ts`

```powershell
$day = [DateTime]'2026-05-10'
$start = [int][double]::Parse(([DateTimeOffset]$day).ToUnixTimeSeconds())
$end   = [int][double]::Parse(([DateTimeOffset]$day.AddDays(1)).ToUnixTimeSeconds())
$path  = "$env:USERPROFILE\.codex\history.jsonl"
Get-Content $path -ErrorAction SilentlyContinue | ForEach-Object {
  try {
    $o = $_ | ConvertFrom-Json
    if ($o.ts -ge $start -and $o.ts -lt $end) { $_ }
  } catch {}
}
```

若 `CODEX_HOME` 已设置：`$path = Join-Path $env:CODEX_HOME 'history.jsonl'`。

---

## B. macOS / Linux（Bash）

以下使用 **GNU date**（多数 Linux 默认；macOS 若 `date` 为 BSD 版，建议 `brew install coreutils` 后用 `gdate`，或改用 Python 一节）。

### B.1 按 mtime 列出「某日动过」的 Claude Code `*.jsonl`

**Linux（GNU find，`$DAY` 当天 0 点 ≤ mtime < 次日 0 点）**：

```bash
DAY=2026-05-10
ROOT="$HOME/.claude/projects"
find "$ROOT" -type f -name '*.jsonl' -newermt "${DAY} 00:00:00" ! -newermt "${DAY} 23:59:59" -ls 2>/dev/null
# 若 GNU date 可用，更推荐用「次日零点」作上界：
END=$(date -d "${DAY} +1 day" +%Y-%m-%d)   # GNU coreutils
find "$ROOT" -type f -name '*.jsonl' -newermt "${DAY} 00:00:00" ! -newermt "${END} 00:00:00" -ls 2>/dev/null
```

**macOS（BSD `find` 的 `-newermt` 与 BSD `date`）**：用「次日」字符串作上界。

```bash
DAY=2026-05-10
NEXT=$(date -j -v+1d -f "%Y-%m-%d" "$DAY" +%Y-%m-%d)
find "$HOME/.claude/projects" -type f -name '*.jsonl' -newermt "${DAY} 00:00:00" ! -newermt "${NEXT} 00:00:00" 2>/dev/null
```

若 `find -newermt` 报错，可用 **`touch` 参考文件** + `-newer`（两系统通用思路）：先 `touch` 出表示当天开始与次日开始的空文件时间戳，再 `find … -newer start ! -newer end`。

### B.2 Codex 按 `ts`（Python，推荐 macOS / Linux）

```bash
export DAY=2026-05-10
export CODEX_HIST="${CODEX_HOME:-$HOME/.codex}/history.jsonl"
python3 << 'PY'
import json, os, datetime
day = datetime.date.fromisoformat(os.environ["DAY"])
# 按运行本脚本的机器「本地时区」日历日 [00:00, 次日00:00)
start = datetime.datetime.combine(day, datetime.time.min).astimezone()
end = start + datetime.timedelta(days=1)
t0, t1 = int(start.timestamp()), int(end.timestamp())
path = os.environ.get("CODEX_HIST", "")
with open(path, encoding="utf-8", errors="ignore") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            o = json.loads(line)
            ts = o.get("ts")
            if ts is not None and t0 <= int(ts) < t1:
                print(line)
        except Exception:
            pass
PY
```

将 `DAY` 与 `CODEX_HOME`（若需）在调用前设为实际值。

### B.3 Codex 按 `ts`（`jq` 可选，Linux 常见）

需已安装 `jq`，且能算出 Unix 起止秒（可与 GNU `date` 配合）：

```bash
# 示例：GNU date（Linux）
START=$(date -d '2026-05-10 00:00:00' +%s)
END=$(date -d '2026-05-11 00:00:00' +%s)
# history.jsonl 为 JSON Lines：用 inputs 逐行解析
jq -cn --argjson s "$START" --argjson e "$END" \
  'inputs | select(.ts != null and (.ts|tonumber) >= $s and (.ts|tonumber) < $e)' \
  < "${CODEX_HOME:-$HOME/.codex}/history.jsonl"
```

macOS 上算 `START`/`END` 用 BSD `date` 或改用 **B.2 Python** 更省事。

### B.4 Cursor：按目录 mtime 缩小 `workspaceStorage` 候选（Linux/macOS）

```bash
DAY=2026-05-10
BASE="$HOME/.config/Cursor/User/workspaceStorage"   # Linux
# macOS 改用：
# BASE="$HOME/Library/Application Support/Cursor/User/workspaceStorage"
find "$BASE" -mindepth 1 -maxdepth 1 -type d -newermt "${DAY}" ! -newermt "${DAY} 23:59:59" 2>/dev/null
```

再在命中目录内对 `state.vscdb` 执行 SQLite（见下节 C）。

---

## C. Cursor：`state.vscdb`（SQLite，三系统均需 `sqlite3` 可执行文件）

列出可能含聊天数据的 key（示例，实际 key 因版本而异）：

```bash
sqlite3 "/path/to/state.vscdb" "SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%composer%' LIMIT 50;"
```

读出某 key（值可能极大，勿直接全量贴入对话）：

```bash
sqlite3 "/path/to/state.vscdb" "SELECT value FROM ItemTable WHERE key = 'workbench.panel.aichat.view.aichat.chatdata' LIMIT 1;"
```

建议在本地用 **DB Browser for SQLite** 打开 `state.vscdb` 浏览。

---

## D. 按项目路径缩小 Cursor 范围（任意 OS）

1. 在 `workspaceStorage` 各子目录中搜索 `workspace.json`（若存在），其中常含 **`folder`** 字段指向曾打开的项目路径。  
2. 用 `rg` / `grep -R` 搜索你的项目绝对路径字符串，定位到具体哈希目录后再打开该目录下的 `state.vscdb`。

---

## E. Claude Code JSONL 行内时间

若行内带 ISO 时间或 `created_at` 等字段，可用 **B.2** 的 Python 模式改为解析该字段过滤；若无统一时间字段，则主要依赖 **文件 mtime** 或人工在编辑器中打开浏览。
