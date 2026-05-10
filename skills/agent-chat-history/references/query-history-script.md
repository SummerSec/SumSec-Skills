# `query_history.py` 说明

**与 [SKILL.md](../SKILL.md) 分工**：`SKILL.md` 负责何时触发、执行顺序与最小命令；本文档负责**全参数**、两种模式细节、各端筛选逻辑与 **JSON 输出形状**，按需打开即可。

本仓库 skill **`agent-chat-history`** 下的只读查询脚本，按**本地日历日**（本地时区当天 00:00～次日 00:00）粗筛 Claude Code、OpenAI Codex CLI、Cursor 相关数据。

## 运行方式

- **Python**：建议 3.10+（使用 `pathlib`、`typing` 等标准写法）。
- **工作目录**：在 skill 根目录 `agent-chat-history/` 下执行，保证相对路径 `scripts/query_history.py` 可用：

```bash
cd /path/to/skills/agent-chat-history
python scripts/query_history.py --date 2026-05-10
```

- **只读**：不写入、不删除任何用户数据；Cursor 使用 SQLite URI `mode=ro` 打开 `state.vscdb`。

## 两种输出模式

### 1. 列表模式（默认，无 `--prompts-only`）

列出「可能相关」的**文件路径**与少量元数据，便于人工再打开排查。

| 子集 | 行为概要 |
|------|----------|
| Claude | `~/.claude/projects/**/*.jsonl` 以及（若存在）`~/.claude/history.jsonl`，**文件 mtime** 落在目标日 |
| Codex | `history.jsonl` 中行内 **`ts`（Unix 秒）** 落在目标日，最多 `--max-codex` 行，每行保留原始 JSON 字符串 |
| Cursor | `workspaceStorage/<hash>/` 子目录 **mtime** 落在目标日，并标注 `state.vscdb` 路径 |

加 **`--sqlite-keys`** 时，对每个命中的 `state.vscdb` 尝试查询 `ItemTable` 中 key 含 `chat` 或 `composer` 的样例 key（最多 40 条），**仅列表模式**有效；与 `--prompts-only` 互斥用途。

### 2. `--prompts-only` 模式

尽量只输出**用户输入侧**的提示文本，合并多客户端结果，便于 Agent 贴回对话、节省 token。

- **`--mode`**：`all`（默认）时按顺序合并 **Claude →（可选全局 history）→ Codex → Cursor**，总条数受 **`--max-prompts`** 截断。
- 各端提取规则见下文「各客户端逻辑」。

## 命令行参数一览

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--date` | （必填） | `YYYY-MM-DD`，按**本地时区**日界解析 |
| `--mode` | `all` | `all` \| `claude` \| `codex` \| `cursor` |
| `--json` | 关闭 |  stdout 输出结构化 JSON |
| `--prompts-only` | 关闭 | 只提取用户提示词模式 |
| `--max-prompts` | `300` | `--prompts-only` 下合并后最多条数 |
| `--max-codex` | `200` | Codex：最多处理的**命中行**数（列表模式与 prompts-only 均使用该上限语义） |
| `--claude-scan` | `mtime` | `mtime`：只打开 projects 下 **mtime 在当日**的 `*.jsonl`；`all`：最多扫 `--max-claude-files` 个 jsonl（慢，用于漏检） |
| `--max-claude-files` | `200` | `claude-scan=all` 时最多打开文件数 |
| `--include-claude-global-history` | 关闭 | prompts-only：额外解析 `~/.claude/history.jsonl`（见下文） |
| `--max-cursor-blob-mb` | `8` | Cursor：单条 SQLite `value` 超过该大小时跳过，避免占用过大内存 |
| `--sqlite-keys` | 关闭 | **非** prompts-only：为每个命中 workspace 的 `state.vscdb` 附加 key 样例 |

## 各客户端逻辑摘要

### Claude Code（projects 下 `*.jsonl`）

- 只处理 JSONL 每行解析为对象后：`type == "user"` 且 `message.role == "user"`。
- 跳过 `message.subtype` 为 `hook_result`、`command_output` 的行。
- **时间**：若信封存在 `timestamp` 且可解析为 ISO 时间，则按**本地日**过滤；否则仅当该 **jsonl 文件 mtime** 落在目标日时才采纳该行（与 `claude-scan` 组合使用）。
- **内容**：`message.content` 支持字符串或块列表，取其中文本拼接。

**注意**：`claude-scan=all` 时**不会**把 `~/.claude/history.jsonl` 混进 projects 扫描列表；全局文件需 **`--include-claude-global-history`**。

### `~/.claude/history.jsonl`（仅 `--include-claude-global-history`）

- 仅当该文件 **mtime** 在目标日才读。
- 行内 JSON 在 `text` / `prompt` / `query` / `input` 中取第一个非空字符串；**必须**存在可解析的 `ts`（数值秒）或 `timestamp`（ISO）且落在目标日，否则不输出（避免无时间戳的噪声）。

### Codex（`history.jsonl`）

- 路径：`$CODEX_HOME/history.jsonl`（若设置），否则 `~/.codex/history.jsonl`。
- 行内必须有 **`ts`**（Unix 秒，整型可解析）且在目标日。
- 提示词：`text` 优先；否则 `role == "user"` 且 `content` 为字符串。

### Cursor（`state.vscdb`）

- workspace 根：Windows `%APPDATA%\Cursor\User\workspaceStorage`；macOS `~/Library/Application Support/Cursor/User/workspaceStorage`；Linux `~/.config/Cursor/User/workspaceStorage`。
- 仅处理 **子目录 mtime** 在目标日且存在 `state.vscdb` 的项。
- 读取 `ItemTable` 中固定 key：`composer.composerData`、`workbench.panel.aichat.view.aichat.chatdata`。
- 对 value 做 JSON 解析（失败时尝试一层 unicode 转义再解析），在 JSON 树中递归查找 `role` / `author` / `kind` 为 `user` 或 `human` 的节点，收集 `content`、`text` 等字段；去重、长度过滤。**启发式**，随 Cursor 版本可能不全或混入非用户文本。

## JSON 输出形状

**列表模式**（`--json`，无 `--prompts-only`）顶层大致为：

```json
{
  "date": "2026-05-10",
  "mode": "all",
  "claude_jsonl": [ { "path": "...", "mtime_iso": "...", "filter": "mtime_in_local_day" } ],
  "codex_history_lines": [ { "ts": 1234567890, "raw": "{...}" } ],
  "cursor_workspaces": [ { "workspace_dir": "...", "state_vscdb": "...", "sqlite_keys_sample": [] } ]
}
```

**`--prompts-only --json`**：

```json
{
  "date": "2026-05-10",
  "prompts_only": true,
  "prompts": [
    {
      "client": "claude-code",
      "file": "/path/to/session.jsonl",
      "line": 42,
      "prompt": "用户输入…"
    }
  ]
}
```

`client` 取值示例：`claude-code`、`claude-code-history`、`codex`、`cursor`（Cursor 项可能含 `sqlite_key`、`index`）。

## 退出码

| 码 | 含义 |
|----|------|
| `0` | 正常执行（无命中也属正常） |
| `2` | `--date` 格式非法 |

## 限制与排查

- **路径非默认安装**（自定义 `CODEX_HOME`、Cursor `--user-data-dir` 等）：脚本不会覆盖所有变体，需对照 [storage-paths.md](storage-paths.md) 手工查。
- **无命中**：确认当天是否使用过对应工具；Claude 可试 `--claude-scan all`；Codex 依赖行内 `ts`；Cursor 依赖 workspace 目录 mtime 与 DB 结构。
- **SQLite**：依赖 Python 内置 `sqlite3`；若编译未带 sqlite，Cursor 相关功能返回空列表。
- **编码**：文件按 UTF-8 读取，`errors='ignore'` 忽略非法字节。

## 相关文档

- [storage-paths.md](storage-paths.md) — 各客户端默认路径与变量。
- [query-examples.md](query-examples.md) — 手工命令与示例。
- 上层入口与 Agent 使用约定：[SKILL.md](../SKILL.md)。
