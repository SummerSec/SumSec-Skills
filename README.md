# SumSec-Skills

SummerSec 个人 **Agent Skills 集合**，按类别分插件管理。

## 仓库布局

```
SumSec-Skills/
├── writing-zh/              # 中文写作插件
│   └── skills/
│       ├── humanizer-zh/       去 AI 味润色
│       ├── creating-blog-web-ppt/  文章转网页 PPT
│       └── khazix-writer/      卡兹克写作风格 (khazix-skills)
├── media-tools/             # 媒体生成插件
│   └── skills/
│       ├── draw-image-generation/   AI 图片生成
│       └── remotion-best-practices/ Remotion 视频
├── dev-tools/               # 开发工具插件
│   └── skills/
│       ├── git-commit-pr/         Git 提交与 PR
│       └── agent-chat-history/    对话历史检索
├── agents-dev/              # Agent 开发生态插件（聚合）
│   └── skills/
│       ├── skill-creator/         技能创建（claude-plugins-official）
│       ├── writing-rules/         Hook rules 生成（hookify）
│       ├── agent-sdk-dev/         Agent SDK 开发
│       ├── skill-optimizer/       Skill 审计优化
│       ├── multi-platform-plugin-guide/  多平台版本对齐
│       └── workflow-skill-creator/       流程编排 Skill 设计
├── plugin-dev/              # 镜像：插件开发七件套（agent/command/hook/skill/MCP/structure/settings）
├── claude-md-management/    # 镜像：CLAUDE.md 维护
├── claude-code-setup/       # 镜像：Claude Code 自动化建议
├── hookify/                 # 原创：Hook 创建工具
├── openclaw.plugin.json       # OpenClaw 插件清单
├── openclaw/                  # OpenClaw 插件入口 & skills
├── opencode/                  # OpenCode 插件入口 & rules
├── hermes/                    # Hermes skills & context
├── .claude-plugin/            # 根 marketplace
├── .cursor-plugin/
├── .codex-plugin/
├── .agents/plugins/
├── .cursor/rules/
├── khazix-skills/             # submodule: KKKKhazix/khazix-skills
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
/plugin install plugin-dev@sumsec-skills
/plugin install claude-md-management@sumsec-skills
/plugin install claude-code-setup@sumsec-skills
/plugin install hookify@sumsec-skills
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

| 技能 | 来源 | 说明 |
|------|------|------|
| [humanizer-zh](writing-zh/skills/humanizer-zh/) | 本仓库 | 去 AI 味：本地 CLI + 深度指南，反 AI 审查二遍工作流 |
| [creating-blog-web-ppt](writing-zh/skills/creating-blog-web-ppt/) | 本仓库 | Markdown 文章转网页 PPT（slide-writer + blog-sumsec 主题） |
| [khazix-writer](writing-zh/skills/khazix-writer/) | khazix-skills | 卡兹克写作风格：用特定口吻和节奏写公众号长文 |

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
| [agent-sdk-dev](agents-dev/skills/agent-sdk-dev/) | claude-plugins-official | Agent SDK 开发 |
| [skill-optimizer](agents-dev/skills/skill-optimizer/) | 本仓库 | Skill 审计优化（路径 A 改 / 路径 B 只读八维） |
| [multi-platform-plugin-guide](agents-dev/skills/multi-platform-plugin-guide/) | 本仓库 | 多平台版本对齐与发布清单 |
| [workflow-skill-creator](agents-dev/skills/workflow-skill-creator/) | 本仓库 | 复杂流程编排 Skill 设计 |

> 插件开发七件套（agent/command/hook/skill/MCP/structure/settings）请安装 `plugin-dev`，已不在 `agents-dev` 内重复维护。

### plugin-dev（插件开发七件套）

| 技能 | 说明 |
|------|------|
| [agent-development](plugin-dev/skills/agent-development/) | Agent 开发 |
| [command-development](plugin-dev/skills/command-development/) | 命令开发 |
| [hook-development](plugin-dev/skills/hook-development/) | Hook 开发 |
| [mcp-integration](plugin-dev/skills/mcp-integration/) | MCP 集成 |
| [plugin-settings](plugin-dev/skills/plugin-settings/) | 插件设置 |
| [plugin-structure](plugin-dev/skills/plugin-structure/) | 插件结构 |
| [skill-development](plugin-dev/skills/skill-development/) | 技能开发 |

附带 3 个 agents（agent-creator、plugin-validator、skill-reviewer）和 `/plugin-dev:create-plugin` 引导式工作流。

### 其他镜像插件

| 插件 | 说明 |
|------|------|
| [claude-md-management](claude-md-management/) | 维护和改进 CLAUDE.md：质量审计 + 会话学习捕获 |
| [claude-code-setup](claude-code-setup/) | 分析代码库，推荐定制化的 Claude Code 自动化（hooks/skills/MCP/agents/commands） |
| [hookify](hookify/) | 通过对话模式分析创建 hooks，支持正则匹配与多事件类型 |

## Git Submodule 与 Skill 同步

本仓库通过 submodule 引用第三方 skill，用同步脚本复制到插件目录（替代 symlink）。

| Submodule | 来源 | 提供的 skill |
|-----------|------|-------------|
| claude-plugins-official | anthropics | skill-creator, plugin-dev 系列, hookify, agent-sdk-dev, claude-md-management, claude-code-setup |
| context7 | upstash | context7-cli, context7-mcp, find-docs |
| khazix-skills | KKKKhazix | khazix-writer |

```bash
# 新机器安装
git clone --recurse-submodules https://github.com/SummerSec/SumSec-Skills.git
cd SumSec-Skills
python .claude/skills/sync-skills/scripts/sync-skills.py
```

## 许可

Apache-2.0
