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
│       └── creating-blog-web-ppt/SKILL.md
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
│       └── agent-chat-history/SKILL.md
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
│       ├── claude-md-improver/  (claude-md-management)
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
├── .cursor-plugin/
├── .codex-plugin/
├── .agents/plugins/
├── .cursor/rules/
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
  - `.agents/plugins/marketplace.json`（Codex 仓库级 marketplace；**默认** Git `url` + `ref`；本地调试才用 `local`）
  - 每插件 `writing-zh/`、`media-tools/`、`dev-tools/`、`agents-dev/` 下的 `.claude-plugin/plugin.json`
  - `openclaw.plugin.json`、`opencode/plugins/sumsec-skills.mjs`、`hermes/skills/sumsec-skills/SKILL.md`（OpenClaw/OpenCode/Hermes 版本）
- 版本号、描述、关键词应与仓库当前插件列表与 README 技能表一致，避免脱节。
- 若本次改动不影响插件对外可见信息，可保持版本不变；若会影响安装、发现或插件说明，优先 bump 并全表对齐。

## 当前插件一览

| 插件 | 目录 | 用途 |
|------|------|------|
| writing-zh | `writing-zh/` | 中文写作辅助：去 AI 味润色、文章转网页 PPT |
| media-tools | `media-tools/` | 媒体生成：AI 图片、Remotion 视频 |
| dev-tools | `dev-tools/` | 开发工具：Git 操作、对话历史 |
| agents-dev | `agents-dev/` | Agent 开发生态：skill-creator、plugin-dev、hookify、claude-md-management、agent-sdk-dev、skill-optimizer、版本对齐 |

（随仓库增加插件时，维护者可在此表追加一行。）
