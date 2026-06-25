# SumSec-Skills 仓库说明（供 Agent）

本仓库为 **SummerSec 个人 Agent Skills 集合**，与具体业务代码仓库分离，仅存放可复用的 `SKILL.md` 及附属资源。仓库以多插件 monorepo 结构管理，Skill 来源包括：

- 本仓库原创 skill。
- submodule 同步：`claude-plugins-official`、`context7`、`baoyu-design`。
- 外部 submodule 引用：`khazix-skills`。

## 默认 Git 规则

- 本仓默认提交目标分支为 **`master`**。
- 除非用户明确要求创建分支、提交 PR，或指定其他分支，否则维护性改动默认应提交并推送到 `master`。
- 如果当前不在 `master`，提交前先确认是否需要切回 `master`；不要把“默认新建 `codex/*` 分支”当成本仓默认行为。
- 暂存时只纳入本次任务相关文件，不要使用无差别 `git add .`。
- 不要提交无关未跟踪目录、临时输出或同步过程残留，除非本次任务明确要求。

## 发现与使用

- 所有 skill 按类别分组在插件目录下：`<plugin>/skills/<skill-name>/`。
- 每个 skill 的入口为 `<plugin>/skills/<skill-name>/SKILL.md`，顶部 YAML frontmatter 中的 `description` 用于判断是否与任务相关。
- 当用户任务与某个 skill 的 `description` 匹配时：**先读取并遵循该 `SKILL.md`**，再按需读取其同目录下 `references/`、`scripts/`、`assets/`、`rules/` 等由 `SKILL.md` 直接链接的文件。
- 执行 skill 时遵守其中的确认门槛、工作流顺序与输出格式要求；不要在未阅读 skill 的情况下用通用流程替代。

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

## 仓库布局

```text
SumSec-Skills/
├── writing-zh/              # 中文写作插件
│   ├── .claude-plugin/plugin.json
│   ├── CLAUDE.md
│   ├── README.md
│   └── skills/
│       ├── humanizer-zh/SKILL.md
│       ├── creating-blog-web-ppt/SKILL.md
│       ├── khazix-writer/SKILL.md  (khazix-skills)
│       └── sumsec-illustrations/SKILL.md
├── media-tools/             # 媒体生成插件
│   ├── .claude-plugin/plugin.json
│   ├── CLAUDE.md
│   ├── README.md
│   └── skills/
│       ├── draw-image-generation/SKILL.md
│       └── remotion-best-practices/SKILL.md
├── dev-tools/               # 开发工具插件
│   ├── .claude-plugin/plugin.json
│   ├── CLAUDE.md
│   ├── README.md
│   └── skills/
│       ├── git-commit-pr/SKILL.md
│       ├── agent-chat-history/SKILL.md
│       ├── frontend-design/SKILL.md
│       └── baoyu-design/SKILL.md
├── agents-dev/              # Agent 开发生态插件
│   ├── .claude-plugin/plugin.json
│   ├── CLAUDE.md
│   ├── README.md
│   └── skills/
│       ├── skill-creator/  (claude-plugins-official)
│       ├── writing-rules/  (hookify)
│       ├── agent-sdk-dev/  (claude-plugins-official)
│       ├── skill-optimizer/  (本仓库)
│       ├── multi-platform-plugin-guide/SKILL.md
│       └── workflow-skill-creator/SKILL.md
├── plugin-dev/              # 镜像：插件开发七件套
├── claude-md-management/    # 镜像：CLAUDE.md 维护
├── claude-code-setup/       # 镜像：Claude Code 自动化建议
├── hookify/                 # Hook 创建工具
├── openclaw.plugin.json     # OpenClaw 插件清单
├── openclaw/                # OpenClaw 插件入口 & skills
├── opencode/                # OpenCode 插件入口 & rules
├── hermes/                  # Hermes skills & context
├── .claude-plugin/          # 根 marketplace
├── .cursor-plugin/
├── .codex-plugin/
├── .agents/plugins/         # Codex repo-scoped marketplace
├── .agents/skills/          # Codex repo-scoped skills
├── skills/                  # 通用 skill 聚合入口
├── .cursor/rules/
├── khazix-skills/           # submodule: KKKKhazix/khazix-skills
├── AGENTS.md -> CLAUDE.md
├── CLAUDE.md
├── README.md
├── package.json
└── plugin.json
```

## 当前插件一览

| 插件 | 目录 | 用途 |
|------|------|------|
| writing-zh | `writing-zh/` | 中文写作辅助：去 AI 味润色、文章转网页 PPT、卡兹克写作风格、SumSec 博客正文配图 |
| media-tools | `media-tools/` | 媒体生成：AI 图片、Remotion 视频 |
| dev-tools | `dev-tools/` | 开发工具：Git 操作、对话历史、文档检索、前端界面实现、UI 设计稿生成 |
| agents-dev | `agents-dev/` | Agent 开发生态：skill-creator、plugin-dev、hookify、agent-sdk-dev、skill-optimizer、版本对齐 |
| plugin-dev | `plugin-dev/` | 插件开发七件套（agent/command/hook/skill/MCP/structure/settings） |
| claude-md-management | `claude-md-management/` | CLAUDE.md 维护 |
| claude-code-setup | `claude-code-setup/` | Claude Code 自动化建议 |
| hookify | `hookify/` | Hook 创建工具 |

## 同步机制

**映射表**：`.claude/skills/sync-skills/scripts/skill-map.json` 是唯一入口，记录所有 `source -> target` 关系。

两种粒度：

- **组件级**（`--add`）：同步单个子目录到目标插件，例如 `plugin-dev/skills/agent-development -> agents-dev/skills/agent-development`。
- **插件级**（`--add-plugin`）：同步整个插件目录，用于纯镜像插件。

同步产生的目标目录分两类处理：

- 可安装镜像插件（如 `claude-code-setup/`、`plugin-dev/`、`claude-md-management/`）需要提交到 git，因为 marketplace 条目会指向这些目录。
- 临时输出、未纳入安装入口的同步残留或本地实验目录不要随手提交；提交前必须看 `git status --short` 和 `git diff --stat`。

新机器初始化：

```bash
git clone --recurse-submodules https://github.com/SummerSec/SumSec-Skills.git
cd SumSec-Skills
python .claude/skills/sync-skills/scripts/sync-skills.py
```

## 新增 Skill 时必须同步更新

无论是从 submodule 同步还是本仓库新建 skill，添加后都需要同步检查：

1. 映射表（仅 submodule skill）：`.claude/skills/sync-skills/scripts/skill-map.json`
2. `.gitignore`（仅需要忽略同步副本或本地输出时）
3. 所属插件 `CLAUDE.md`
4. 所属插件 `.claude-plugin/plugin.json`
5. 根 marketplace：`.claude-plugin/marketplace.json`
6. Cursor marketplace：`.cursor-plugin/marketplace.json`
7. README 技能一览表与布局树
8. 本文件中的布局约定与插件一览表（如影响用途描述）

遗漏会导致插件发现、安装文档与实际 skill 列表脱节。

## 插件元数据维护

发布新版本、调整插件名/描述、或新增/删除重要 skill 时，同步检查下列清单。完整要求见 `agents-dev/skills/multi-platform-plugin-guide/SKILL.md` 文末 **SumSec-Skills 发布清单**。

| 文件 | 用途 |
|------|------|
| `package.json` | npm 包版本 |
| `plugin.json` | 根元数据 |
| `.claude-plugin/plugin.json` | Claude 根 marketplace manifest |
| `.claude-plugin/marketplace.json` | Claude marketplace 条目版本 |
| `.cursor-plugin/plugin.json` | Cursor manifest |
| `.cursor-plugin/marketplace.json` | Cursor marketplace 条目版本 |
| `.codex-plugin/plugin.json` | Codex 插件 manifest |
| `.agents/plugins/marketplace.json` | Codex repo-scoped marketplace |
| `<plugin>/.claude-plugin/plugin.json` | 各独立插件 manifest |
| `openclaw.plugin.json` | OpenClaw 清单 |
| `opencode/plugins/sumsec-skills.mjs` | OpenCode 插件入口 |
| `hermes/skills/sumsec-skills/SKILL.md` | Hermes 入口 |

版本号、描述、关键词应与仓库当前插件列表与 README 技能表一致。若本次改动不影响插件对外可见信息，可保持版本不变；若会影响安装、发现或插件说明，优先 bump 并全表对齐。

## Codex 规范补充

- Codex skill 使用开放 Agent Skills 结构：每个 skill 是一个含 `SKILL.md` 的目录，frontmatter 至少包含 `name` 与 `description`。
- 仓库级本地 skill 放在 `.agents/skills/`；插件分发的 skill 放在每个插件根的 `skills/` 并由该插件目录下 `.codex-plugin/plugin.json` 的 `skills` 字段暴露。
- 本仓根 `skills/` 是通用聚合入口，用 symlink 指向各插件目录下的真实 skill 源。
- `.codex-plugin/plugin.json` 是 Codex 插件 manifest；`name` 使用稳定 kebab-case，`skills` 路径相对插件根，例如 `"./"` 或 `"./skills/"`。
- `.agents/plugins/marketplace.json` 是 Codex marketplace 清单。Codex 解析 `source.path` 时相对 marketplace root，不是相对 `.agents/plugins/` 目录；本仓 Codex 条目与 Claude/Cursor 一样拆为多个插件，因此使用 `path: "./writing-zh"`、`path: "./media-tools"` 等子目录路径。
- Git 安装 marketplace 用 `codex plugin marketplace add SummerSec/SumSec-Skills --ref main`；不要在 marketplace 插件条目里写自定义 `source.url/ref` 当作 Git 安装语法。
- Codex hooks 从 `.codex/hooks.json` 或 `.codex/config.toml` 发现。事件名使用官方大小写，例如 `SessionStart`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStart`、`SubagentStop`、`Stop`。
- repo-local hook 命令优先从 git root 定位脚本，避免 Codex 从子目录启动时相对路径失效；非托管 hook 变更后需要在 Codex 中重新 review/trust。

## Submodule 来源

| Submodule | 远程 |
|-----------|------|
| `claude-plugins-official/` | `git@github.com:anthropics/claude-plugins-official.git` |
| `context7/` | `https://github.com/upstash/context7.git` |
| `khazix-skills/` | `https://github.com/KKKKhazix/khazix-skills.git` |
| `baoyu-design/` | `https://github.com/JimLiu/baoyu-design.git` |
