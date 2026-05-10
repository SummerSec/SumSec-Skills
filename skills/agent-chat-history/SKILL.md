---
name: agent-chat-history
description: 在本地机器（Windows、macOS、Linux）上按指定日期检索 Claude Code、OpenAI Codex CLI、Cursor 等工具的对话与会话留存位置；支持脚本只输出用户输入提示词以省 token。适用于用户要查看某天历史、导出聊天、只抽提示词、排查记录丢失或做只读审计时。
---

# agent-chat-history：本地 Agent 历史对话按日检索（中文）

## 优先：固定日期用脚本（省 token）

**不要先把本文件整篇读进上下文。** 若用户已给出日期 `YYYY-MM-DD`，直接在仓库（或已安装的 skill 根目录）`agent-chat-history/` 下执行：

```bash
python scripts/query_history.py --date YYYY-MM-DD
python scripts/query_history.py --date YYYY-MM-DD --prompts-only --json
```

常用参数：

| 参数 | 含义 |
|------|------|
| `--prompts-only` | **只输出用户输入提示词**（Claude：`type=user` 且 `message.role=user`，跳过常见 hook 注入行；Codex：`text`/`role=user`；Cursor：对 `state.vscdb` 已知 key 做启发式抽取，**可能不全**） |
| `--include-claude-global-history` | 额外解析 `~/.claude/history.jsonl`（字段因版本而异，需行内 `ts`/ISO 时间在当日） |
| `--claude-scan` | `mtime`（默认）：只打开会话 jsonl 且文件 mtime 落在目标日；`all`：最多扫 `--max-claude-files` 个文件（慢，用于漏检） |
| `--mode all` | 默认：`--prompts-only` 时合并 Claude + Codex + Cursor |
| `--mode claude` / `codex` / `cursor` | 只跑一类 |
| `--json` | 输出 JSON，便于 Agent **只贴结果**、少复述 SKILL |
| `--max-prompts` | `--prompts-only` 合并后最多条数（默认 300） |
| `--max-codex N` | Codex 最多处理行数（默认 200） |
| `--max-cursor-blob-mb N` | Cursor 单条 SQLite value 体积上限（默认 8MB） |
| `--sqlite-keys` | **非** `--prompts-only` 时：列出 `state.vscdb` 中含 chat/composer 的 key |

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
