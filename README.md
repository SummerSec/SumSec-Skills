# SumSec-Skills

SummerSec 个人 **Agent Skills 集合**，按类别分插件管理。

## 仓库布局

```
SumSec-Skills/
├── writing-zh/              # 中文写作插件
│   └── skills/
│       ├── humanizer-zh/       去 AI 味润色
│       └── creating-blog-web-ppt/  文章转网页 PPT
├── media-tools/             # 媒体生成插件
│   └── skills/
│       ├── draw-image-generation/   AI 图片生成
│       └── remotion-best-practices/ Remotion 视频
├── dev-tools/               # 开发工具插件
│   └── skills/
│       ├── git-commit-pr/         Git 提交与 PR
│       └── agent-chat-history/    对话历史检索
├── agents-dev/              # Agent 开发生态插件
│   └── skills/
│       ├── skill-creator/         技能创建
│       ├── writing-rules/         Hook 编写
│       ├── agent-development/     Agent 开发
│       ├── command-development/   命令开发
│       ├── hook-development/      Hook 开发
│       ├── mcp-integration/       MCP 集成
│       ├── plugin-settings/       插件设置
│       ├── plugin-structure/      插件结构
│       ├── skill-development/     技能开发
│       ├── claude-md-improver/    CLAUDE.md 改进
│       ├── agent-sdk-dev/         Agent SDK 开发
│       ├── skill-optimizer/       Skill 审计优化
│       └── multi-platform-plugin-guide/  版本对齐
├── openclaw.plugin.json       # OpenClaw 插件清单
├── openclaw/                  # OpenClaw 插件入口 & skills
├── opencode/                  # OpenCode 插件入口 & rules
├── hermes/                    # Hermes skills & context
├── .claude-plugin/            # 根 marketplace
├── .cursor-plugin/
├── .codex-plugin/
├── .agents/plugins/
├── .cursor/rules/
├── AGENTS.md
├── README.md
├── package.json
└── plugin.json
```

## 安装

### Claude Code

```bash
/plugin marketplace add https://github.com/SummerSec/SumSec-Skills.git

/plugin install writing-zh@sumsec-skills
/plugin install media-tools@sumsec-skills
/plugin install dev-tools@sumsec-skills
/plugin install agents-dev@sumsec-skills
```

### 手动安装（软链接）

将 `<plugin>/skills/<skill-name>/` 链接到对应客户端 skill 目录：

```bash
ln -sf "$(pwd)/dev-tools/skills/git-commit-pr" ~/.claude/skills/git-commit-pr
```

| 客户端 | skill 目录/安装方式 |
|--------|-------------------|
| Claude Code | `/plugin install <plugin>@sumsec-skills` |
| Cursor | `.cursor-plugin/marketplace.json` 导入 |
| OpenAI Codex CLI | `.agents/plugins/marketplace.json` Git 安装 |
| OpenClaw | `openclaw.plugin.json` + `openclaw/` 插件加载 |
| OpenCode | `opencode/plugins/sumsec-skills.js` 插件注册 |
| Hermes | `hermes/skills/sumsec-skills/SKILL.md` 复制加载 |
| 通用 symlink | `~/.agents/skills/<name>/ -> <plugin>/skills/<name>/` |

## 技能一览

### writing-zh（中文写作）

| 技能 | 说明 |
|------|------|
| [humanizer-zh](writing-zh/skills/humanizer-zh/) | 去 AI 味：本地 CLI + 深度指南，反 AI 审查二遍工作流 |
| [creating-blog-web-ppt](writing-zh/skills/creating-blog-web-ppt/) | Markdown 文章转网页 PPT（slide-writer + blog-sumsec 主题） |

### media-tools（媒体生成）

| 技能 | 说明 |
|------|------|
| [draw-image-generation](media-tools/skills/draw-image-generation/) | 调用 Right.Codes API 生成 AI 图片 |
| [remotion-best-practices](media-tools/skills/remotion-best-practices/) | Remotion React 视频最佳实践 |

### dev-tools（开发工具）

| 技能 | 说明 |
|------|------|
| [git-commit-pr](dev-tools/skills/git-commit-pr/) | 安全完成 commit、push、PR/MR |
| [agent-chat-history](dev-tools/skills/agent-chat-history/) | 按日期查本机 Agent 历史对话 |
| [context7-cli](dev-tools/skills/context7-cli/) | context7 CLI：查询库文档 |
| [context7-mcp](dev-tools/skills/context7-mcp/) | context7 MCP 服务器集成 |
| [find-docs](dev-tools/skills/find-docs/) | 查找库文档（context7） |

### agents-dev（Agent 开发生态）

| 技能 | 来源 | 说明 |
|------|------|------|
| [skill-creator](agents-dev/skills/skill-creator/) | claude-plugins-official | 技能创建全流程 |
| [writing-rules](agents-dev/skills/writing-rules/) | hookify | Hook 编写与 rules 生成 |
| [agent-development](agents-dev/skills/agent-development/) | plugin-dev | Agent 开发 |
| [command-development](agents-dev/skills/command-development/) | plugin-dev | 命令开发 |
| [hook-development](agents-dev/skills/hook-development/) | plugin-dev | Hook 开发 |
| [mcp-integration](agents-dev/skills/mcp-integration/) | plugin-dev | MCP 集成 |
| [plugin-settings](agents-dev/skills/plugin-settings/) | plugin-dev | 插件设置 |
| [plugin-structure](agents-dev/skills/plugin-structure/) | plugin-dev | 插件结构 |
| [skill-development](agents-dev/skills/skill-development/) | plugin-dev | 技能开发 |
| [claude-md-improver](agents-dev/skills/claude-md-improver/) | claude-md-management | CLAUDE.md 改进 |
| [agent-sdk-dev](agents-dev/skills/agent-sdk-dev/) | claude-plugins-official | Agent SDK 开发 |
| [skill-optimizer](agents-dev/skills/skill-optimizer/) | 本仓库 | Skill 审计优化（路径 A 改 / 路径 B 只读八维） |
| [multi-platform-plugin-guide](agents-dev/skills/multi-platform-plugin-guide/) | 本仓库 | 多平台版本对齐与发布清单 |

## 许可

Apache-2.0
