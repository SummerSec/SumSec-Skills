# SumSec-Skills 仓库说明（供 Agent）

本仓库为 **个人 Agent Skills 集合**，与具体业务代码仓库分离，仅存放可复用的 `SKILL.md` 及附属资源。

## 发现与使用

- 所有 skill 按类别分组在插件目录下：**`<plugin>/skills/<skill-name>/`**。
- 每个 skill 的入口为 **`<plugin>/skills/<skill-name>/SKILL.md`**，顶部 YAML frontmatter 中的 **`description`** 用于判断是否与本任务相关。
- 当用户任务与某个 skill 的 `description` 匹配时：**先读取并遵循该 `SKILL.md`**，再按需读取其同目录下 **`references/`**、**`scripts/`**、**`assets/`**、**`rules/`** 等由 `SKILL.md` 直接链接的文件；不要在未阅读 skill 的情况下用通用流程替代。
- 执行 skill 时遵守其中的确认门槛、工作流顺序与输出格式要求。

## 布局约定

```
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
│       └── baoyu-design/SKILL.md
├── agents-dev/              # Agent 开发生态插件
│   ├── .claude-plugin/plugin.json
│   ├── CLAUDE.md
│   ├── README.md
│   └── skills/
│       ├── skill-creator/  (claude-plugins-official)
│       ├── writing-rules/  (hookify)
│       ├── agent-development/  (plugin-dev)
│       ├── command-development/  (plugin-dev)
│       ├── hook-development/  (plugin-dev)
│       ├── mcp-integration/  (plugin-dev)
│       ├── plugin-settings/  (plugin-dev)
│       ├── plugin-structure/  (plugin-dev)
│       ├── skill-development/  (plugin-dev)
│       ├── agent-sdk-dev/  (claude-plugins-official)
│       ├── skill-optimizer/  (本仓库)
│       └── multi-platform-plugin-guide/SKILL.md
├── openclaw.plugin.json       # OpenClaw 插件清单
├── openclaw/                  # OpenClaw 插件入口 & skills
├── opencode/                  # OpenCode 插件入口 & rules
├── hermes/                    # Hermes skills & context
├── .claude-plugin/            # 根 marketplace（注册所有插件）
│   ├── plugin.json
│   └── marketplace.json
├── .claude/skills/            # 项目级 skill（仓库自身工具）
│   └── sync-skills/           # submodule skill 同步管理
├── .cursor-plugin/
├── .codex-plugin/             # Codex 插件 manifest
├── .codex/                    # Codex 项目级配置 / hooks
├── .agents/plugins/           # Codex repo-scoped marketplace
├── .agents/skills/            # Codex repo-scoped skills
├── skills/                    # 通用 skill 聚合入口（symlink 到各插件 skills）
├── .cursor/rules/
├── khazix-skills/             # submodule: KKKKhazix/khazix-skills
├── AGENTS.md
├── README.md
├── package.json
└── plugin.json
```

## 插件元数据维护

- **发布新版本、调整插件名/描述、或新增/删除重要 skill** 时，同步检查下列清单（详见 `agents-dev/skills/multi-platform-plugin-guide/SKILL.md` 文末 *SumSec-Skills 发布清单*）：
  - `package.json`（根，`version`）
  - `plugin.json`（根）
  - `.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json`（含每个 `plugins[].version`）
  - `.cursor-plugin/plugin.json`、`.cursor-plugin/marketplace.json`（含每个条目 `version`）
  - `.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`（Codex 仓库级 marketplace；插件条目默认 `source: "local"` + 对应插件子目录 `path`，Git 来源由 `codex plugin marketplace add <repo> --ref <ref>` 管理）
  - `.codex/hooks.json`、`.codex/config.toml`（如存在；Codex 项目级 hook / 配置）
  - 每插件 `writing-zh/`、`media-tools/`、`dev-tools/`、`agents-dev/` 下的 `.claude-plugin/plugin.json`
  - `openclaw.plugin.json`、`opencode/plugins/sumsec-skills.mjs`、`hermes/skills/sumsec-skills/SKILL.md`（OpenClaw/OpenCode/Hermes 版本）
- 版本号、描述、关键词应与仓库当前插件列表与 README 技能表一致，避免脱节。
- 若本次改动不影响插件对外可见信息，可保持版本不变；若会影响安装、发现或插件说明，优先 bump 并全表对齐。

## Codex 规范补充

- Codex skill 使用开放 Agent Skills 结构：每个 skill 是一个含 `SKILL.md` 的目录，frontmatter 至少包含 `name` 与 `description`；Codex 根据 description 隐式匹配，或通过 `$skill-name` / `/skills` 显式调用。
- 仓库级本地 skill 放在 `.agents/skills/`；插件分发的 skill 放在每个插件根的 `skills/` 并由该插件目录下 `.codex-plugin/plugin.json` 的 `skills` 字段暴露；本仓根 `skills/` 是通用聚合入口，用 symlink 指向各插件目录下的真实 skill 源。
- `.codex-plugin/plugin.json` 是 Codex 插件 manifest；`name` 使用稳定 kebab-case，`skills` 路径相对插件根，例如 `"./"` 或 `"./skills/"`。
- `.agents/plugins/marketplace.json` 是 Codex marketplace 清单。Codex 解析 `source.path` 时相对 marketplace root，不是相对 `.agents/plugins/` 目录；本仓 Codex 条目与 Claude/Cursor 一样拆为多个插件，因此使用 `path: "./writing-zh"`、`path: "./media-tools"` 等子目录路径。
- Git 安装 marketplace 用 `codex plugin marketplace add SummerSec/SumSec-Skills --ref main`；不要在 marketplace 插件条目里写自定义 `source.url/ref` 当作 Git 安装语法。
- Codex hooks 从 `.codex/hooks.json` 或 `.codex/config.toml` 发现。事件名使用官方大小写，例如 `SessionStart`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStart`、`SubagentStop`、`Stop`。
- repo-local hook 命令优先从 git root 定位脚本，避免 Codex 从子目录启动时相对路径失效；非托管 hook 变更后需要在 Codex 中重新 review/trust。

## 当前插件一览

| 插件 | 目录 | 用途 |
|------|------|------|
| writing-zh | `writing-zh/` | 中文写作辅助：去 AI 味润色、文章转网页 PPT、卡兹克写作风格、SumSec 博客正文配图 |
| media-tools | `media-tools/` | 媒体生成：AI 图片、Remotion 视频 |
| dev-tools | `dev-tools/` | 开发工具：Git 操作、对话历史、文档检索、UI 设计稿生成 |
| agents-dev | `agents-dev/` | Agent 开发生态：skill-creator、plugin-dev、hookify、agent-sdk-dev、skill-optimizer、版本对齐 |

（随仓库增加插件时，维护者可在此表追加一行。）

## Git Submodule 与 Skill 同步

本仓库通过 git submodule 引用第三方 skill 源，再用同步脚本复制到对应插件目录（替代 symlink，确保跨机器可用）。

| Submodule | 路径 | 来源 |
|-----------|------|------|
| claude-plugins-official | `claude-plugins-official/` | `git@github.com:anthropics/claude-plugins-official.git` |
| context7 | `context7/` | `https://github.com/upstash/context7.git` |
| khazix-skills | `khazix-skills/` | `https://github.com/KKKKhazix/khazix-skills.git` |

**同步机制**：
- 映射表：`.claude/skills/sync-skills/scripts/skill-map.json`
- 同步脚本：`.claude/skills/sync-skills/scripts/sync-skills.py`
- 新机器 clone 后执行：`git submodule update --init --recursive && python .claude/skills/sync-skills/scripts/sync-skills.py`
- 添加新映射：`python .claude/skills/sync-skills/scripts/sync-skills.py --add "<source>" "<target>"`

同步产生的目标目录已在 `.gitignore` 中忽略，不提交副本。

### 新增 Skill 时必须同步更新的文件

无论是从 submodule 同步还是本仓库新建 skill，添加后都需要同步更新以下位置的说明：

1. **映射表**（仅 submodule skill）：`.claude/skills/sync-skills/scripts/skill-map.json`
2. **`.gitignore`**（仅 submodule skill）：追加目标目录忽略规则
3. **所属插件 `CLAUDE.md`**：如 `writing-zh/CLAUDE.md` 技能清单表
4. **所属插件 `.claude-plugin/plugin.json`**：更新 `description` 字段
5. **根 marketplace**：`.claude-plugin/marketplace.json` 对应插件的 `description`
6. **Cursor marketplace**：`.cursor-plugin/marketplace.json` 对应插件的 `description`
7. **`README.md`**：对应插件的技能一览表、布局树
8. **`AGENTS.md`**：布局约定树、当前插件一览表（如影响用途描述）

遗漏任何一处都会导致插件发现、安装文档与实际 skill 列表脱节。
