---
name: multi-platform-plugin-guide
description: 用于开发和审查 AI Inner OS 的多平台插件包装，覆盖 Claude Code、Codex、Cursor、OpenClaw、OpenCode、Hermes 以及仓库级 manifest。适用于修改版本号、hooks.json、marketplace JSON、插件清单或适配文档。若与仓库 CLAUDE.md 冲突，以 CLAUDE.md 为准。
---

# 多平台插件开发指南（AI Inner OS）

**权威来源**：仓库根目录 [`CLAUDE.md`](../../../CLAUDE.md)。重点参考其中 *Plugin Registration*、各平台插件规范、*Key Patterns*、*Global Install Script* 和 *OpenCode Plugin* 等章节。若本技能与 `CLAUDE.md` 不一致，优先更新 `CLAUDE.md`，再同步本技能。

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
- Marketplace：`.agents/plugins/marketplace.json`。
- Hook 路径：`./codex/hooks.json`；skill 路径应使用 `./skills/<name>/SKILL.md` 或 manifest 的 `skills` 字段。
- `codex/hooks.json` 中优先使用 `node ./codex/hooks/...` 这种插件根相对路径。
- 当前启用事件：`SessionStart`、`PostToolUse`、`Stop`。不要把未支持的 hook 写成已启用行为。
- 保持 `codex/README.md`、`docs/install-codex.md` 与 manifest 和 `codex/hooks.json` 一致。

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

**SumSec-Skills** 为「多 skill 源码集合」仓库，已落地的多平台 manifest **不含** OpenClaw / OpenCode / Hermes 专用文件（无 `openclaw.plugin.json`、`opencode/`、`hermes/` 等）。维护者 **bump 版本或调整对外描述** 时，请将下列文件中的 **`version`（及需要的 description / keywords）** 全部对齐：

1. `package.json`（根）
2. `plugin.json`（根）
3. `.claude-plugin/plugin.json`
4. `.claude-plugin/marketplace.json` → `plugins[0].version`
5. `.cursor-plugin/plugin.json`
6. `.cursor-plugin/marketplace.json` → `plugins[0].version`
7. `.codex-plugin/plugin.json`

**Codex**：`.agents/plugins/marketplace.json` 中 `source.path` 为 `./`（插件根即仓库根）；该文件通常无 `version` 字段，与 OpenAI 文档一致即可。

**Cursor**：可选规则位于 `.cursor/rules/`（`sumsec-skills-repo.mdc`），在 `.cursor-plugin/plugin.json` 中通过 `rules` 引用。

各平台字段语义、hooks 与完整矩阵仍以本文前半与 **AI Inner OS** 主仓 `CLAUDE.md` 为准；上表仅约束 **本仓库** 内实际存在的路径。
