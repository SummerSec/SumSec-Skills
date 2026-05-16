# 各客户端本地存储路径（参考）

版本与安装方式会导致差异；下列为**常见默认布局**。`~` 表示当前用户主目录（POSIX：`$HOME`；Windows：`%USERPROFILE%`）。

## 先确认操作系统

| 系统 | 常用环境变量 / 约定 |
|------|---------------------|
| **Windows** | `%USERPROFILE%`、`%APPDATA%`（通常为 `C:\Users\<用户>\AppData\Roaming`） |
| **macOS** | `$HOME`，应用数据多在 `~/Library/Application Support/` |
| **Linux** | `$HOME`，XDG 下多为 `~/.config/`；少数发行版或 Flatpak 会偏离默认路径 |

**Flatpak / Snap 安装的 Cursor**：用户数据可能在 `~/.var/app/...` 或 `~/snap/...` 下，需在对应沙箱目录内再找 `Cursor/User/` 或等价结构。

---

## Claude Code

| 系统 | 默认根路径 |
|------|------------|
| Windows | `%USERPROFILE%\.claude\` |
| macOS | `~/.claude/` |
| Linux | `~/.claude/` |

常见内容：

- **`projects/<项目标识>/<session-id>.jsonl`**：按项目划分的会话日志（JSON Lines）。
- **`history.jsonl`**（若存在）：跨会话提示级历史，体积可能很大。

若设置了 **`CLAUDE_CONFIG_DIR`**，配置与部分状态可能改写到该目录；会话文件仍以官方文档与用户实际目录为准。

参考：[Claude directory 文档](https://code.claude.com/docs/en/claude-directory)。

---

## OpenAI Codex CLI

| 系统 | 默认根路径（`CODEX_HOME` 未设置时） |
|------|--------------------------------------|
| Windows | `%USERPROFILE%\.codex\` |
| macOS | `~/.codex/` |
| Linux | `~/.codex/` |

环境变量 **`CODEX_HOME`** 可覆盖上述根目录（三系统通用）。

常见文件：

- **`history.jsonl`**：一行一条 JSON；常含 **`ts`**（Unix 秒）与文本字段（以当前 Codex 版本为准）。

参考：[Codex 高级配置](https://developers.openai.com/codex/config-advanced)。

---

## Cursor IDE

### `workspaceStorage`（按工作区，内含 `state.vscdb`）

| 系统 | 路径 |
|------|------|
| Windows | `%APPDATA%\Cursor\User\workspaceStorage\` |
| macOS | `~/Library/Application Support/Cursor/User/workspaceStorage/` |
| Linux | `~/.config/Cursor/User/workspaceStorage/`（最常见；若使用其他 user-data-dir 则以实际为准） |

每个子目录（多为哈希名）对应一个工作区，其内常有 **`state.vscdb`**（SQLite）。

### `globalStorage`（全局扩展状态，部分版本/功能可能相关）

| 系统 | 路径 |
|------|------|
| Windows | `%APPDATA%\Cursor\User\globalStorage\` |
| macOS | `~/Library/Application Support/Cursor/User/globalStorage/` |
| Linux | `~/.config/Cursor/User/globalStorage/` |

键名与是否含聊天片段**随版本变化**；以本机 `ItemTable` 检索为准。

社区讨论（非官方）：[Where are cursor chats stored?](https://forum.cursor.com/t/where-are-cursor-chats-stored/77295)

---

## 便携 / 自定义用户数据目录

若通过 **`--user-data-dir`** 或安装器指定了**自定义数据目录**，则应在该目录下寻找：

`User/workspaceStorage/`、`User/globalStorage/`

Windows 下默认的 `%APPDATA%\Cursor` 不再适用；macOS / Linux 下默认的 `~/Library/...` 或 `~/.config/Cursor` 同样可能不适用。先询问用户启动方式，或检查快捷方式、**`.desktop`**、shell 别名中的 **`--user-data-dir`** 参数。
