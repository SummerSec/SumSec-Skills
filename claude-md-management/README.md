# CLAUDE.md Management

维护和改进 CLAUDE.md 文件的工具集。

## 功能

两个互补工具：

| | claude-md-improver (skill) | /revise-claude-md (command) |
|---|---|---|
| **用途** | 保持 CLAUDE.md 与代码库对齐 | 捕获会话学习 |
| **触发方式** | 代码库变更 | 会话结束时 |
| **使用场景** | 定期维护 | 会话中发现缺失上下文 |

## 使用

### Skill: claude-md-improver

审计 CLAUDE.md 文件与代码库当前状态：

```
"审计我的 CLAUDE.md 文件"
"检查我的 CLAUDE.md 是否最新"
```

### Command: /revise-claude-md

从当前会话捕获学习：

```
/revise-claude-md
```

## 作者

Isabella He (isabella@anthropic.com)