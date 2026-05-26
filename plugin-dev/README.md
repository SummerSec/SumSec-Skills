# Plugin Dev

Claude Code 插件开发工具箱：覆盖 Hook、MCP、Skill、Command、Agent 的端到端开发支持。

## 功能

- **7 个 Skill**：分别专注 agent / command / hook / skill / MCP / 插件结构 / 插件设置
- **3 个 Agent**：`agent-creator` 生成 Agent 配置、`plugin-validator` 校验插件、`skill-reviewer` 审查 Skill
- **1 个 Command**：`/plugin-dev:create-plugin` 引导式 8 阶段工作流（Discovery → Planning → Design → Structure → Implementation → Validation → Testing → Documentation）

## 快速开始

```bash
# 启动引导式创建
/plugin-dev:create-plugin

# 带描述启动
/plugin-dev:create-plugin A plugin for managing database migrations
```

## 适用场景

- 从零创建符合最佳实践的 Claude Code 插件
- 为现有插件补齐 Hook / MCP / Agent 等组件
- 校验插件目录结构与 manifest 字段
- 审查 Skill 的渐进披露与触发关键词质量

## 依赖

- Claude Code ≥ 最新发行版（支持 `.claude-plugin/plugin.json` 与 plugin-scoped command）

## 许可

MIT License（继承自 `claude-plugins-official`）
