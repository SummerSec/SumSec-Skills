# Plugin Dev

Claude Code 插件开发工具箱，覆盖从设计到验证的完整链路。

## 技能 / Agent / 命令清单

| 类型 | 名称 | 文件 | 说明 |
|------|------|------|------|
| Command | `/plugin-dev:create-plugin` | `commands/create-plugin.md` | 引导式 8 阶段插件创建工作流 |
| Skill | `agent-development` | `skills/agent-development/SKILL.md` | 创建自治 Agent，含 AI 辅助生成 |
| Skill | `command-development` | `skills/command-development/SKILL.md` | 编写带 frontmatter / 参数的 Slash 命令 |
| Skill | `hook-development` | `skills/hook-development/SKILL.md` | 事件驱动自动化与 Hook API |
| Skill | `mcp-integration` | `skills/mcp-integration/SKILL.md` | Model Context Protocol 服务器集成 |
| Skill | `plugin-structure` | `skills/plugin-structure/SKILL.md` | 插件目录与 manifest 组织 |
| Skill | `plugin-settings` | `skills/plugin-settings/SKILL.md` | 使用 `.claude/plugin-name.local.md` 配置模式 |
| Skill | `skill-development` | `skills/skill-development/SKILL.md` | 渐进式披露与强触发的 Skill 编写指南 |
| Agent | `agent-creator` | `agents/agent-creator.md` | AI 辅助生成 Agent 配置 |
| Agent | `plugin-validator` | `agents/plugin-validator.md` | 校验插件结构与 manifest |
| Agent | `skill-reviewer` | `agents/skill-reviewer.md` | 审查 Skill 描述、触发词与渐进披露 |

## 安装

```bash
cc --plugin-dir plugin-dev
```

## 来源

组件通过 `sync-skills` 从 `claude-plugins-official/plugins/plugin-dev` submodule 同步，映射表见 `.claude/skills/sync-skills/scripts/skill-map.json`。
