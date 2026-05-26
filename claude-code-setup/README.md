# Claude Code Setup

分析代码库并推荐量身定制的 Claude Code 自动化方案。

## 功能

Claude 使用此技能扫描代码库并在以下类别中推荐 1-2 项自动化：

- **MCP 服务器** — 外部集成（context7 文档查询、Playwright 前端测试）
- **Skills** — 打包的专业知识（Plan agent、frontend-design）
- **Hooks** — 自动操作（自动格式化、自动 lint、阻止敏感文件）
- **Subagents** — 专业审查（安全、性能、无障碍）
- **Slash 命令** — 快速工作流（/test、/pr-review、/explain）

## 使用

```
"推荐此项目的自动化方案"
"帮我设置 Claude Code"
"应该使用哪些 hooks？"
```

## 作者

Isabella He (isabella@anthropic.com)