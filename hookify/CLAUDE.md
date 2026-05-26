# Hookify

通过分析对话模式或显式指令创建 Hook 规则，防止不期望的行为。

## 技能清单

| 命令 | 技能/命令/Agent 目录 | 说明 |
|------|-------------------|------|
| `hookify` | `commands/hookify.md` | 创建 Hook 规则（自动分析对话或显式指令） |
| `hookify:list` | `commands/list.md` | 列出所有已配置的规则 |
| `hookify:configure` | `commands/configure.md` | 交互式启用/禁用规则 |
| `hookify:help` | `commands/help.md` | 获取 Hookify 帮助 |
| `writing-rules` | `skills/writing-rules/SKILL.md` | Hook 规则编写指南 |
| `conversation-analyzer` | `agents/conversation-analyzer.md` | 分析对话发现可预防的行为 |

## 安装

```bash
cc --plugin-dir hookify
```

## 依赖

- Python 3.7+
- 无外部依赖（仅使用标准库）