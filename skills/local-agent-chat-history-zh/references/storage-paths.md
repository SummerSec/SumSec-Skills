# 各客户端本地存储路径（参考）

版本与安装方式会导致差异；下列为常见默认布局。`~` 表示当前用户主目录。

## Claude Code

| 环境 | 路径 |
|------|------|
| Windows | `%USERPROFILE%\.claude\` |
| macOS / Linux | `~/.claude/` |

常见内容：

- **`projects/<项目标识>/<session-id>.jsonl`**：按项目划分的会话日志（JSON Lines）。
- **`history.jsonl`**（若存在）：跨会话提示级历史，体积极可能较大。

若设置了 **`CLAUDE_CONFIG_DIR`**，部分配置会改写到该目录，会话仍以官方文档为准；优先在用户主目录下搜索 `.claude`。

参考：[Claude directory 文档](https://code.claude.com/docs/en/claude-directory)。

## OpenAI Codex CLI

| 环境 | 路径 |
|------|------|
| Windows | `%USERPROFILE%\.codex\` |
| macOS / Linux | `~/.codex/` |

环境变量 **`CODEX_HOME`** 可覆盖默认根目录。

常见文件：

- **`history.jsonl`**：一行一条 JSON；常含 **`ts`**（Unix 秒）与对话文本字段（以当前 Codex 版本为准）。

参考：[Codex 高级配置](https://developers.openai.com/codex/config-advanced)。

## Cursor IDE

| 环境 | 路径 |
|------|------|
| Windows | `%APPDATA%\Cursor\User\workspaceStorage\` |
| macOS | `~/Library/Application Support/Cursor/User/workspaceStorage/` |
| Linux | `~/.config/Cursor/User/workspaceStorage/`（常见；若发行版不同以实际为准） |

每个子目录（多为哈希名）对应一个工作区，其内常有：

- **`state.vscdb`**：SQLite，内含工作台状态；历史上与 AI 聊天相关的数据可能出现在特定 key 的 JSON 中（键名随 Cursor 版本变化，需在库内检索）。

另可留意 **`globalStorage`** 下是否有与扩展或 Composer 相关的大文件（同样随版本变化）。

社区讨论（非官方）：[Where are cursor chats stored?](https://forum.cursor.com/t/where-are-cursor-chats-stored/77295)

## 便携 / 自定义用户数据目录

若用户以**便携模式**或**自定义 `--user-data-dir`** 启动 VS Code / Cursor 系产品，实际根路径会偏离 `%APPDATA%\Cursor`。应先问清启动参数，再在对应 `User/workspaceStorage` 下查找。
