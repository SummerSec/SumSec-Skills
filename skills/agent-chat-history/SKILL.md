---
name: agent-chat-history
description: 在本地机器（Windows、macOS、Linux）上按指定日期检索 Claude Code、OpenAI Codex CLI、Cursor 等工具的对话与会话留存位置；说明 JSONL、SQLite 与按文件时间筛选及跨平台路径差异。适用于用户要查看某天历史、导出聊天、排查记录丢失或做只读审计时。
---

# agent-chat-history：本地 Agent 历史对话按日检索（中文）

## 优先：固定日期用脚本（省 token）

**不要先把本文件整篇读进上下文。** 若用户已给出日期 `YYYY-MM-DD`，直接在仓库（或已安装的 skill 根目录）`agent-chat-history/` 下执行：

```bash
python scripts/query_history.py --date YYYY-MM-DD
```

常用参数：

| 参数 | 含义 |
|------|------|
| `--mode all` | 默认：Claude mtime + Codex `ts` + Cursor 目录 mtime |
| `--mode claude` / `codex` / `cursor` | 只跑一类 |
| `--json` | 输出 JSON，便于 Agent **只贴结果**、少复述 SKILL |
| `--max-codex N` | Codex 最多输出行数（默认 200） |
| `--sqlite-keys` | 对命中 `state.vscdb` 尝试列出含 chat/composer 的 key（需 stdlib `sqlite3`） |

脚本逻辑自洽，路径规则与 [references/storage-paths.md](references/storage-paths.md) 一致；手工命令与边界说明见 [references/query-examples.md](references/query-examples.md)。

## 何时仍需要读正文 / references

- 非默认安装路径（`CODEX_HOME`、`CLAUDE_CONFIG_DIR`、Cursor `--user-data-dir`、Flatpak/Snap）。
- 要在 SQLite 里深挖 JSON 内容或版本变更后的 key 名。
- 用户未给日期、只描述「上周某次」等需先澄清再跑脚本。

## 摘要（三客户端）

| 客户端 | 要点 |
|--------|------|
| **Claude Code** | `~/.claude/projects/**/*.jsonl` + 可选 `history.jsonl`；脚本用 **mtime** 落在本地日 |
| **Codex** | `history.jsonl` 行内 **`ts`**（Unix 秒）落在本地日 |
| **Cursor** | `workspaceStorage/<hash>/` 目录 **mtime** + `state.vscdb`；`--sqlite-keys` 仅列 key |

## 边界

路径与 DB key 随版本变化；未开启持久化或清理缓存可能导致无命中。只读；勿删改他人数据。
