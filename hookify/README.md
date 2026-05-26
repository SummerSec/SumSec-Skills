# Hookify

通过分析对话模式或显式指令，轻松创建 Hook 规则防止不期望的行为。

## 功能

- 分析对话自动发现不期望的行为
- 简洁的 Markdown 配置文件 + YAML frontmatter
- 正则表达式模式匹配
- 无需编码 — 只需描述行为
- 无需重启即可启用/禁用

## 快速开始

```
/hookify Warn me when I use rm -rf commands
```

## 命令

| 命令 | 功能 |
|------|------|
| `/hookify` | 创建新规则（自动分析或显式指令） |
| `/hookify:list` | 列出所有规则 |
| `/hookify:configure` | 交互式启用/禁用规则 |
| `/hookify:help` | 获取帮助 |

## 事件类型

- `bash` — Bash 工具命令
- `file` — Edit/Write 文件操作
- `stop` — Claude 停止时
- `prompt` — 用户提交 prompt 时
- `all` — 所有事件

## 依赖

- Python 3.7+，无外部依赖

## 许可

MIT License