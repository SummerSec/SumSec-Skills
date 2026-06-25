---
name: agent-chat-history
description: 按 YYYY-MM-DD 在 Windows/macOS/Linux 检索本机聊天与 Agent 会话历史（Claude Code 项目 jsonl、Codex CLI history.jsonl、Cursor workspaceStorage 与 state.vscdb）；可只导出用户提示词。用户要查看或导出某日记录、按天筛 jsonl/SQLite、只抽提示词、排查历史丢失或做只读审计时使用。
disable-model-invocation: false
---

# agent-chat-history：本地 Agent 历史对话按日检索（中文）

## 执行顺序（Agent 照做）

1. **已有日期 `YYYY-MM-DD`**：用 `${CLAUDE_SKILL_DIR}` 定位脚本并运行下方命令；若当前环境不支持该变量，再进入 skill 根目录 `agent-chat-history/` 执行；需要给下游贴结果时优先 **`--json`**。
2. **没有日期**：只问用户一句，确认要查询的 **`YYYY-MM-DD`（本地时区日界）**，再问是否只要提示词、是否限定某一客户端。
3. **任务匹配**：只要用户提示词 → `--prompts-only`（可加 `--include-claude-global-history`）；只要路径/文件线索 → 默认列表模式，必要时加 `--sqlite-keys`。
4. **无命中或偏少**：提示尝试 `--claude-scan all`；仍不对则读 [references/storage-paths.md](references/storage-paths.md) 核对自定义安装路径。

## 优先：固定日期用脚本（省 token）

**不要先把本文件整篇读进上下文。** 优先直接执行脚本：

```bash
python "${CLAUDE_SKILL_DIR}/scripts/query_history.py" --date YYYY-MM-DD
python "${CLAUDE_SKILL_DIR}/scripts/query_history.py" --date YYYY-MM-DD --prompts-only --json
```

常用参数（**完整表与 JSON 形状见** [references/query-history-script.md](references/query-history-script.md)）：

| 参数 | 含义 |
|------|------|
| `--date` | 必填，本地日历日 `YYYY-MM-DD` |
| `--prompts-only` | 只提取用户侧提示词（Cursor 为启发式，**可能不全**） |
| `--json` | 结构化输出，便于原样贴回或只摘 `prompts` 数组 |
| `--mode` | `all`（默认）或 `claude` / `codex` / `cursor` 只查一类 |

路径规则与手工命令见 [references/storage-paths.md](references/storage-paths.md)、[references/query-examples.md](references/query-examples.md)。

## Gotchas（易错点）

- **Cursor**：从 `state.vscdb` 已知 key 启发式抽取，版本变更后可能漏项或混入非纯用户句。
- **Codex**：依赖 `history.jsonl` 行内 **`ts`**（Unix 秒）；无 `ts` 的行不会进入结果。
- **非默认数据目录**（`CODEX_HOME`、`CLAUDE_CONFIG_DIR`、Cursor `--user-data-dir`、Flatpak/Snap）：脚本只覆盖常见布局，须对照 `storage-paths.md` 自行定位后再查。

## 何时仍需要读正文 / references

- 要在 SQLite 里深挖 JSON 或新版本 key 名。
- 用户只描述「上周某次」等模糊时间：先澄清日期再跑脚本。

## 摘要（三客户端）

| 客户端 | 要点 |
|--------|------|
| **Claude Code** | `~/.claude/projects/**/*.jsonl` + 可选 `history.jsonl`；列表模式用 **mtime** 落在本地日 |
| **Codex** | `history.jsonl` 行内 **`ts`**（Unix 秒）落在本地日 |
| **Cursor** | `workspaceStorage/<hash>/` 目录 **mtime** + `state.vscdb`；`--sqlite-keys` 仅列表模式下列 key |

## 边界

路径与 DB key 随版本变化；未开启持久化或清理缓存可能导致无命中。只读；勿删改他人数据。
