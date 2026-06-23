---
name: multi-platform-plugin-guide
description: "用于维护 SumSec-Skills 多平台插件元数据与发布清单：package.json、plugin.json、Claude/Cursor/Codex manifest、marketplace JSON、版本号、描述、关键词、安装文档。"
---

# 多平台插件开发指南（AI Inner OS）

**本仓入口**：优先执行文末 **SumSec-Skills 发布清单（本仓）**。前半部分保留 AI Inner OS 多平台矩阵作为参考；本仓实际只落地 Claude / Cursor / Codex 相关 manifest。

**上游矩阵参考**：AI Inner OS 主仓根目录 `CLAUDE.md`。若本技能的通用平台说明与 AI Inner OS 主仓不一致，先更新上游矩阵，再同步本技能。

## 何时使用

- 修改 `hooks/hooks.json`、`.claude-plugin/`、`.codex-plugin/`、`.cursor-plugin/`、`.agents/plugins/marketplace.json`、根 `plugin.json`、`openclaw.plugin.json` 或 release 版本字段。
- 修改 `hooks/`、`codex/`、`cursor/` 下的 hook 适配器，或共享库 `hooks/lib/`。
- 更新必须和 manifest 保持一致的安装文档，例如 `cursor/README.md`、`docs/install-cursor.md`、`codex/README.md`、`docs/install-codex.md`。
- 准备跨平台 release、插件市场发布、插件缓存更新或多平台能力对齐。

## 官方文档优先

开发或审查任何平台适配前，先查看对应平台最新官方文档。本技能只记录本仓库当前约定；如果官方规范变化，以官方文档为准，再同步更新仓库实现、`CLAUDE.md` 和本技能。

| 平台 | 官方开发指南 |
|------|--------------|
| Claude Code | [Plugins reference](https://code.claude.com/docs/en/plugins-reference) |
| Codex | [Build plugins](https://developers.openai.com/codex/plugins/build) |
| Cursor | [Plugins Reference](https://cursor.com/docs/reference/plugins) |
| OpenClaw | [Building plugins](https://docs.openclaw.ai/plugins/building-plugins)、[Skills](https://docs.openclaw.ai/tools/skills) |
| OpenCode | [Plugins](https://open-code.ai/en/docs/plugins) |
| Hermes Agent | [Plugins](https://hermes-agent.nousresearch.com/docs/user-guide/features/plugins)、[Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) |

默认流程：

1. 读取对应平台最新官方指南。
2. 对照本仓库 `CLAUDE.md` 和现有实现。
3. 只实现官方已支持的 manifest 字段、hook 事件和路径规则。
4. 如果官方规范与仓库文档冲突，先修实现，再同步 README、安装文档、`CLAUDE.md` 和本技能。

## 插件注册地图

| Role | Path |
|------|------|
| Claude Code hook 注册 | `hooks/hooks.json` |
| Claude Code 插件清单 | `.claude-plugin/plugin.json` |
| Claude marketplace 入口 | `.claude-plugin/marketplace.json` |
| Codex 插件清单 | `.codex-plugin/plugin.json` |
| Codex 仓库级 marketplace | `.agents/plugins/marketplace.json` |
| Cursor 插件清单 | `.cursor-plugin/plugin.json` |
| Cursor marketplace 入口 | `.cursor-plugin/marketplace.json` |
| OpenClaw 插件清单 | `openclaw.plugin.json` |
| OpenClaw 插件入口 | `openclaw/index.js` |
| OpenCode 插件入口 | `opencode/plugins/inner-os.js` |
| Hermes Skill | `hermes/skills/inner-os/SKILL.md` |
| 仓库级元数据 | `plugin.json` |

## 版本同步清单

发布更新时，同步 bump 下列版本字段，否则 marketplace/cache 可能不会拉取新内容：

1. `package.json`
2. `plugin.json`
3. `.claude-plugin/plugin.json`
4. `.claude-plugin/marketplace.json`
5. `.codex-plugin/plugin.json`
6. `.cursor-plugin/plugin.json`
7. `.cursor-plugin/marketplace.json`
8. `openclaw.plugin.json`

## Claude Code 插件规范摘要

- `.claude-plugin/` 下只放 manifest 文件；组件目录留在插件根目录，例如 `commands/`、`skills/`、`agents/`、`hooks/hooks.json`、`.mcp.json`、`.lsp.json`、`output-styles/`、`themes/`、`monitors/`。
- `.claude-plugin/plugin.json` 中的自定义路径必须相对插件根目录，以 `./` 开头，不能使用 `..`。
- Hook 命令引用插件内文件时使用 `${CLAUDE_PLUGIN_ROOT}`；marketplace 安装后不能假设仓库 checkout 路径存在。
- 可变状态只写入 `${CLAUDE_PLUGIN_DATA}`，不要写入插件根目录或 cache 源码目录。
- 每次发布更新都要 bump `.claude-plugin/plugin.json` 的 `version`。
- 验证：`claude plugin validate .`，然后 `npm run check` 和 `npm test`。

## Cursor 插件规范摘要

- Manifest：`.cursor-plugin/plugin.json`、`.cursor-plugin/marketplace.json`。
- 本仓库 Cursor 组件目录是 `cursor/`，例如 `rules: "./cursor/rules/"`、`hooks: "./cursor/hooks.json"`。
- 路径必须相对仓库/插件根目录，不能使用 `..`。
- Rules 是带 YAML frontmatter 的 `.mdc` 文件；`cursor/rules/inner-os-protocol.mdc` 必须保留 `description` 和 `alwaysApply: true`。
- 本仓库 Cursor hook 事件名：`sessionStart`、`postToolUse`、`stop`，使用小写。
- Cursor hook 输出格式：顶层 `{ "additional_context": "..." }`。
- 不要把 Cursor `preToolUse` 用于上下文注入，因为它不能注入 `additional_context`。
- 保持 `cursor/README.md`、`docs/install-cursor.md` 与 `.cursor-plugin/plugin.json`、`cursor/hooks.json` 一致。

## Codex 插件规范摘要

- Manifest：`.codex-plugin/plugin.json`，该目录下只放 manifest；组件留在插件根目录。
- Marketplace：`.agents/plugins/marketplace.json`；repo-scoped marketplace 可被 `codex plugin marketplace add <repo> --ref <ref>` 作为 Git marketplace 添加。
- Marketplace 插件条目有三类官方 source：
  - local：`source.source = "local"` + `source.path = "./..."`，`path` 相对 marketplace root 解析，不是相对 `.agents/plugins/` 目录。
  - Git 根插件：`source.source = "url"` + `url` + 可选 `ref` / `sha`，用于插件位于 Git 仓库根目录。
  - Git 子目录插件：`source.source = "git-subdir"` + `url` + `path` + 可选 `ref` / `sha`，用于一个 Git 仓库中包含多个插件或插件不在根目录。
- 区分 **marketplace source** 与 **plugin entry source**：`codex plugin marketplace add <repo>` 管理 marketplace 本身从哪里来；`plugins[].source` 管理某个插件包从哪里加载。两者都可以涉及 Git，但字段语义不同。
- Skill 路径应使用 `./skills/`、`./skills/<name>/SKILL.md` 或 manifest 的 `skills` 字段；仓库级本地 skills 放在 `.agents/skills/`。
- Hook 路径：项目级 hook 使用 `.codex/hooks.json` 或 `.codex/config.toml`；插件可按官方插件打包规则携带默认 `hooks/hooks.json`。
- Hook 事件名使用官方大小写：`SessionStart`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStart`、`SubagentStop`、`Stop`。
- repo-local hook 命令优先从 git root 定位脚本，避免 Codex 从子目录启动时相对路径失效；非托管 hook 变更后需要重新 review/trust。
- 插件根可包含 `skills/`、`hooks/`、`.app.json`、`.mcp.json`、`assets/`；只有 `plugin.json` 放进 `.codex-plugin/`。Manifest 路径必须相对插件根、以 `./` 开头，并留在插件根内。
- 插件 hooks 默认文件是 `hooks/hooks.json`；若 `.codex-plugin/plugin.json` 写了 `hooks` 字段，则覆盖默认。插件 hook 命令可用 `PLUGIN_ROOT` / `PLUGIN_DATA`，Codex 也兼容 `CLAUDE_PLUGIN_ROOT` / `CLAUDE_PLUGIN_DATA`。
- 保持 `README.md`、`AGENTS.md` 与 `.codex-plugin/plugin.json`、`.agents/plugins/marketplace.json`、`.codex/hooks.json` 一致。

## Codex 与 Cursor：marketplace 的 `source` 与「从 Git 安装」

两家的 **marketplace 条目语法不同**，不要强行把 Codex 的写法套到 Cursor 上。

### Codex（`.agents/plugins/marketplace.json`）

- 官方支持 **Git marketplace source**：使用 `codex plugin marketplace add owner/repo --ref main`、HTTPS/SSH Git URL 或本地 marketplace root，让 Codex 安装并跟踪 marketplace 源。Git ref、sparse checkout 等属于 marketplace source 配置。
- marketplace 中每个插件条目可以指向本地路径，也可以直接指向 Git-backed plugin source：
  - **local**：`"source": { "source": "local", "path": "./plugins/my-plugin" }`。`path` 相对 marketplace root 解析，并应以 `./` 开头。
  - **url**：`"source": { "source": "url", "url": "https://github.com/owner/plugin.git", "ref": "main" }`。插件位于 Git 仓库根目录。
  - **git-subdir**：`"source": { "source": "git-subdir", "url": "https://github.com/owner/plugins.git", "path": "./plugins/my-plugin", "ref": "main" }`。插件位于 Git 仓库子目录。
- `ref` 和 `sha` 是 Git-backed plugin entry 的官方选择器；如果 Codex 解析不了某个 entry，会跳过该插件条目而不是让整个 marketplace 失败。
- **本地调试**：可以直接 `codex plugin marketplace add ./local-marketplace-root` 指向本地 marketplace root；若修改插件内容，需要刷新/重启 Codex 让本地安装拾取新文件。

### Cursor（`.cursor-plugin/marketplace.json`）

- 官方 schema 中，插件条目里的 **`source`** 字段表示 **当前已被 Cursor 作为 marketplace 来源纳入的那份 Git 工作副本里的相对路径**（多插件仓里常见为子目录名，如 `docker`；**单插件占满整仓根** 时为 **`"./"`**），用于在该路径下查找 **`.cursor-plugin/plugin.json`** 并与条目字段合并。见 [Plugins Reference — Multi-plugin repositories / How resolution works](https://cursor.com/docs/reference/plugins)。
- **没有** Codex 那种 **`source: { "source": "url" | "git-subdir", "url": "...", "ref": "..." }`** 插件条目。所谓「从 Git 安装」是指：用户或管理员 **用 GitHub 仓库 URL 导入整个 marketplace 仓库**（例如 Team marketplace Import）；导入后，`source: "./"` 自然指向**该次 Git 检出**的根目录，而不是在 JSON 里再写一遍 clone URL 当作 `source`。
- **推荐补强**：在 marketplace 的插件条目上增加官方支持的 **`repository`**（及 **`homepage`**）字符串，写明 canonical Git URL（如 `https://github.com/SummerSec/SumSec-Skills.git`），避免维护者误以为必须把 `source` 改成 URL 才算「对齐 Codex、默认从 Git」——语义上由 **导入来源 + `repository`** 共同表达即可。

## 跨平台 hook 行为摘要

- Hook 脚本应包裹 `try/catch`，失败时静默，不中断主会话。
- Claude Code：`PreToolUse` 使用 `hookSpecificOutput.additionalContext`；部分事件使用 stdout 文本，详见 `CLAUDE.md`。
- Cursor：支持事件使用顶层 `additional_context` JSON。
- Codex：`SessionStart` 输出 stdout；`PostToolUse` 使用 `hookSpecificOutput.additionalContext`；不使用 `PreToolUse` 注入上下文。
- Bash 命令目标摘要截断为 80 字符。

## OpenClaw 插件规范摘要

- 插件清单：`openclaw.plugin.json`，保持 `id`、`version`、`main`、`description` 对 OpenClaw 有效。
- 插件入口：`openclaw/index.js`，必须纳入 `npm run check`。
- Skill 内容：`openclaw/skills/inner-os/SKILL.md`，保持 AgentSkills 兼容。
- 插件分发的 skills 优先级低于 workspace、project、personal、managed 等位置；不要假设插件 skill 会覆盖用户或工作区 skill。
- 保持 `openclaw/README.md`、`docs/install-openclaw.md` 与 `openclaw.plugin.json`、`openclaw/index.js`、`openclaw/skills/inner-os/SKILL.md` 一致。

## OpenCode 插件规范摘要

- 插件入口：`opencode/plugins/inner-os.js`，这是独立插件，不复用 `hooks/lib/`。
- 静态指令：`opencode/inner-os-rules.md`；配置示例位于 `opencode/`。
- OpenCode 插件通常从 `.opencode/plugins/`、`~/.config/opencode/plugins/` 或 `opencode.json` 配置的 npm 包加载。
- OpenCode 插件代码应遵循官方 plugin API 和事件名；不要把 Claude/Codex 的 lifecycle hook 写成 OpenCode 行为。
- 保持 `opencode/README.md`、`docs/install-opencode.md`、`scripts/install.js` 与插件入口和指令文件路径一致。

## Hermes 插件规范摘要

- 当前仓库通过 `hermes/skills/inner-os/SKILL.md` 和 `hermes/hermes.md` 支持 Hermes。
- Hermes skill 应保留 Hermes 专用 frontmatter，例如 version、category、tags 等字段。
- `hermes/hermes.md` 是项目 context-file 变体，必须与 canonical protocol 和 persona markers 保持同步。
- 不要假设 Hermes 支持 Claude Code、Codex 或 Cursor 的 JavaScript hook 模型。
- 保持 `hermes/README.md`、`docs/install-hermes.md` 与 skill/context-file 安装路径一致。

## 共享维护提示

- **全局安装**：`scripts/install.js` 会把共享核心复制到 `~/.inner-os/` 并生成各平台配置，详见 `CLAUDE.md` 的 *Global Install Script*。
- **协议唯一来源**：`protocol/SKILL.md`。各平台静态副本需要手动同步，详见 `CLAUDE.md` 的 *Single Source of Truth*。

## SumSec-Skills 发布清单（本仓）

**SumSec-Skills** 为「多 plugin 源码集合」仓库，按类别分为四个插件目录，每插件有自己的 `.claude-plugin/plugin.json`。已落地的多平台 manifest **包含** OpenClaw / OpenCode / Hermes 专用文件（`openclaw.plugin.json`、`opencode/`、`hermes/`）。维护者 **bump 版本或调整对外描述** 时，请将下列文件中的 **`version`（及需要的 description / keywords）** 全部对齐：

1. `package.json`（根）
2. `plugin.json`（根）
3. `.claude-plugin/plugin.json`
4. `.claude-plugin/marketplace.json` → 每个 `plugins[].version`
5. `.cursor-plugin/plugin.json`
6. `.cursor-plugin/marketplace.json` → 每个条目 `version`
7. `.codex-plugin/plugin.json`
8. `writing-zh/.claude-plugin/plugin.json`
9. `media-tools/.claude-plugin/plugin.json`
10. `dev-tools/.claude-plugin/plugin.json`
11. `agents-dev/.claude-plugin/plugin.json`
12. `openclaw.plugin.json` — OpenClaw manifest
13. `opencode/plugins/sumsec-skills.mjs` — OpenCode plugin entry (inline `version`)
14. `hermes/skills/sumsec-skills/SKILL.md` — Hermes skill (inline `version`)


**Codex**：本仓 `.agents/plugins/marketplace.json` 当前采用 **`source.source: "local"`** + **`path: "./"`**，适合 repo-scoped marketplace 或通过 `codex plugin marketplace add SummerSec/SumSec-Skills --ref main` 拉取 marketplace 后从该 checkout 加载根插件。若未来维护单独 marketplace 仓库，或希望某个 entry 直接指向远端插件包，可使用官方 Git-backed entry：`source: "url"`（插件在仓库根）或 `source: "git-subdir"`（插件在仓库子目录），并配合 `url`、`ref` / `sha`。

**Cursor**：`.cursor-plugin/marketplace.json` 与 **「Codex 与 Cursor：marketplace 的 `source` 与『从 Git 安装』」** 一节保持一致（`source: "./"` + 条目级 `repository` 等）。**SumSec-Skills** 下可选规则在 `.cursor/rules/`，由 `.cursor-plugin/plugin.json` 的 `rules` 引用。

各平台字段语义、hooks 与完整矩阵仍以本文前半与 **AI Inner OS** 主仓 `CLAUDE.md` 为准；上表仅约束 **本仓库** 内实际存在的路径。
