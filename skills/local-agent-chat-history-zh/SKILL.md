---
name: local-agent-chat-history-zh
description: 在本地机器上按指定日期检索 Claude Code、OpenAI Codex CLI、Cursor 等工具的对话与会话留存位置；说明 JSONL、SQLite 与按文件时间筛选的做法。适用于用户要查看某天历史、导出聊天、排查记录丢失或做只读审计时。
---

# 本地 Agent 历史对话按日检索（中文）

## 目标

帮助用户在**本机**根据**指定日期**（通常按用户本地日历日）定位并阅读 **Claude Code**、**Codex CLI**、**Cursor** 等工具产生的历史对话相关文件。默认**只读**；不擅自删除、上传或修改他人隐私数据。

## 执行前确认

1. **客户端**：用户关心的是哪一种或哪几种（Claude Code / Codex / Cursor / 其他）。
2. **日期与时区**：按「用户本地日」还是 UTC；跨日午夜边界要说明假设。
3. **工作区**：Cursor 等与**具体工作区**绑定的数据需知道项目路径或允许在 `workspaceStorage` 中枚举排查。
4. **权限**：仅访问用户可见路径；若路径不存在，说明可能未安装、未启用历史或未在该机产生过会话。

## 工作流（按顺序）

1. 根据客户端打开 [存储路径总表](references/storage-paths.md)，确认 OS 对应根目录（Windows：`%USERPROFILE%` 等）。
2. **粗筛「落在目标日期」**  
   - **文件型（JSONL、目录）**：用文件**修改时间**或**创建时间**落在目标日作为第一近似（PowerShell `Get-ChildItem`、`*nix` `find`）。  
   - **行内带时间戳的 JSONL（Codex 等）**：按行解析 `ts` 等字段过滤目标日（见 [查询示例](references/query-examples.md)）。  
   - **Cursor `state.vscdb`**：SQLite 内 JSON 的时间字段或配合外层文件夹 `LastWriteTime`；具体 key 因版本而异，需打开库检索（见 [查询示例](references/query-examples.md)）。
3. **细读内容**：大文件用分页、`Select-String` / `rg` / `sqlite3` 限制输出；避免把整库二进制拖进对话。
4. **输出给用户**：列出**命中文件路径**、**判定依据**（mtime / 行内时间戳 / SQL 条件）、**如何自行打开**（VS Code / DB Browser / 复制路径）。

## 各客户端要点（摘要）

| 客户端 | 典型形态 | 按日检索思路 |
|--------|----------|----------------|
| **Claude Code** | `%USERPROFILE%\.claude\projects\...\*.jsonl`，另有全局 `history.jsonl` | 按文件时间或解析 JSONL 行内时间字段 |
| **Codex CLI** | `%USERPROFILE%\.codex\history.jsonl`（`CODEX_HOME` 可改） | 行内 `ts` 为 Unix 秒时，换算到用户时区后过滤日期 |
| **Cursor** | `%APPDATA%\Cursor\User\workspaceStorage\<hash>\state.vscdb`（SQLite） | 按 workspace 文件夹日期粗筛，再查库内与 Chat/Composer 相关的 key |

详细路径与变量见 [storage-paths.md](references/storage-paths.md)。

## 边界与免责声明

- 路径与内部 key **随产品版本变化**；以用户机器上实际目录为准，本 skill 只给**检索方法**与**常见位置**。
- **无法保证**「某一天的全部对话」都在上述文件中（未开启持久化、清理缓存、换机等）。
- 涉及他人电脑或共享设备时，提醒用户遵守公司与法律对日志访问的规定。

## 扩展

其他 CLI（如自有 Agent 将日志写到某目录）可沿用同一模式：**先定根目录 → 再定文件类型（JSONL/SQLite/纯文本）→ 再选 mtime 或行内时间戳**。
