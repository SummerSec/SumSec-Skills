# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库概述

SumSec-Skills 是个人 Agent Skills 集合，以多插件 monorepo 结构管理。Skill 来自三个渠道：**本仓库原创**、**submodule 同步**（`claude-plugins-official`、`context7`）、**外部 submodule 引用**（`khazix-skills`）。

## 核心命令

```bash
# 同步 submodule skills 到插件目录
python .claude/skills/sync-skills/scripts/sync-skills.py
python .claude/skills/sync-skills/scripts/sync-skills.py --dry-run
python .claude/skills/sync-skills/scripts/sync-skills.py --clean

# 添加映射
python .claude/skills/sync-skills/scripts/sync-skills.py --add "<source>" "<target>"
python .claude/skills/sync-skills/scripts/sync-skills.py --add-plugin <plugin-name>
python .claude/skills/sync-skills/scripts/sync-skills.py --list

# npm scripts（等同上述命令）
npm run sync
npm run sync:dry
npm run sync:clean
```

## 插件分类

### 原创插件（直接提交到 git，无 submodule 同步）

| 插件 | 内容 |
|------|------|
| `writing-zh/` | humanizer-zh（去 AI 味）、creating-blog-web-ppt、khazix-writer |
| `media-tools/` | draw-image-generation、remotion-best-practices |
| `dev-tools/` | git-commit-pr、agent-chat-history 及 context7 系列 |
| `agents-dev/` | 聚合 13 个 skill（submodule 同步 + 原创：skill-optimizer、multi-platform-plugin-guide） |
| `hookify/` | Hook 创建工具（直接提交，含 Python 实现） |

### 镜像插件（gitignored，由 sync 脚本从 submodule 复制）

| 插件 | 源 |
|------|-----|
| `claude-md-management/` | `claude-plugins-official/plugins/claude-md-management` |
| `claude-code-setup/` | `claude-plugins-official/plugins/claude-code-setup` |
| `plugin-dev/` 的部分内容 | `claude-plugins-official/plugins/plugin-dev`（skills/agents/commands 组件级同步） |

## 同步机制

**映射表**：`.claude/skills/sync-skills/scripts/skill-map.json` 是唯一入口，记录所有 `source → target` 关系。

两种粒度：
- **组件级**（`--add`）：同步单个子目录到目标插件（如 `plugin-dev/skills/agent-development → agents-dev/skills/agent-development`）
- **插件级**（`--add-plugin`）：同步整个插件目录，用于纯镜像插件

**提交策略**：同步产生的目标目录**需要提交到 git**——marketplace.json 将这些插件注册为可安装项（`./claude-code-setup`、`./plugin-dev` 等），不提交会导致远端用户安装时拿到空目录。upstream submodule 升级后，重跑 sync 并提交 diff 即可。

**新机器初始化**：
```bash
git clone --recurse-submodules https://github.com/SummerSec/SumSec-Skills.git
cd SumSec-Skills
python .claude/skills/sync-skills/scripts/sync-skills.py   # 仅维护者升级 upstream 时需要；普通用户 clone 后直接装插件即可
```

## 多平台版本管理

版本号统一在多个 manifest / marketplace 中维护，发布 bump 时需把所有对外安装入口对齐到同一版本（例如 `1.0.34`），避免 marketplace 条目与插件自身 manifest 脱节：

| 文件 | 用途 |
|------|------|
| `package.json` | npm 包版本 |
| `plugin.json` | 根插件元数据 |
| `.claude-plugin/plugin.json` | Claude 根插件 manifest |
| `.claude-plugin/marketplace.json` | Claude marketplace，每个 `plugins[].version` |
| `.cursor-plugin/plugin.json` | Cursor 根插件 manifest |
| `.cursor-plugin/marketplace.json` | Cursor marketplace，每个条目 `version` |
| `.codex-plugin/plugin.json` | Codex 根插件 manifest |
| `.agents/plugins/marketplace.json` | Codex repo-scoped marketplace，每个条目 `version` |
| `<plugin>/.claude-plugin/plugin.json` | 各独立 Claude 插件 manifest |
| `<plugin>/.codex-plugin/plugin.json` | 各独立 Codex 插件 manifest |
| `opencode/plugins/sumsec-skills.mjs` | OpenCode 插件入口 |
| `openclaw.plugin.json` | OpenClaw 清单 |
| `hermes/skills/sumsec-skills/SKILL.md` | Hermes 入口 |

当前需要纳入版本对齐的独立插件包括 `writing-zh`、`media-tools`、`dev-tools`、`agents-dev`、`claude-code-setup`、`claude-md-management`、`hookify`、`plugin-dev`。版本 bump 的详细清单见 `agents-dev/skills/multi-platform-plugin-guide/SKILL.md`。

## 原创 Skill 约定

- 入口文件：`<plugin>/skills/<skill-name>/SKILL.md`，YAML frontmatter 中的 `description` 用于自动匹配触发
- 附属资源放在 skill 目录内的 `references/`、`scripts/`、`assets/`、`rules/` 子目录
- `.claude-plugin/plugin.json` 中 `name` 字段即为 marketplace 安装名

## Submodule 来源

| Submodule | 远程 |
|-----------|------|
| `claude-plugins-official/` | anthropics/claude-plugins-official |
| `context7/` | upstash/context7 |
| `khazix-skills/` | KKKKhazix/khazix-skills |
| `baoyu-design/` | JimLiu/baoyu-design |
