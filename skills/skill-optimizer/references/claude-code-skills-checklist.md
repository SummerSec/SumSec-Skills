# Claude Code Skills 专项检查表

用于 `skill-optimizer` 审查面向 Claude Code 的 `SKILL.md`。只在目标 skill 使用 Claude Code 专有能力、命令迁移、插件分发或调用控制时读取。

官方来源：[Extend Claude with skills](https://code.claude.com/docs/en/skills)。本文件是该页的可执行审查清单，不替代官方文档；若官方文档更新，以官方文档为准。

## 1. 发现与存放

- skill 入口是 `SKILL.md`，目录名即 `/skill-name`。
- 创建 skill 的合理信号：反复粘贴同一套指令、checklist、多步骤流程，或 `CLAUDE.md` 中某段已经从事实变成过程。
- custom commands 已并入 skills；`.claude/commands/deploy.md` 与 `.claude/skills/deploy/SKILL.md` 都会创建 `/deploy`，同名时 skill 优先。
- built-in commands 与 bundled skills 应查 commands reference；不要把 `/help`、`/compact` 等内置命令误判为项目 skill。
- 位置语义清楚：personal、project、plugin、enterprise；同名覆盖关系不会造成误判。
- 项目或插件 skill 的支持文件均由 `SKILL.md` 直接链接，避免多层嵌套引用。
- nested `.claude/skills/` 或 `--add-dir` 中的 `.claude/skills/` 若被依赖，说明其发现条件。
- 新建顶层 skills 目录若会话启动时不存在，可能需要重启 Claude Code 才能被 watch。

## 2. Frontmatter

基础字段：

| Field | 检查点 |
|-------|--------|
| `name` | 可省略；若写出，须小写字母、数字、连字符，最长 64 字符，并与目录语义一致 |
| `description` | 把关键触发条件放前面；能说明做什么和何时用；避免泄漏完整工作流 |
| `when_to_use` | 只放额外触发语境；与 `description` 合计要能在截断前保留关键词 |
| `argument-hint` | 若用户常手动调用并传参，提示参数形状 |
| `arguments` | 若正文使用 `$name` 替换，声明位置参数名 |

Claude Code 扩展字段：

| Field | 适用场景 | 常见风险 |
|-------|----------|----------|
| `disable-model-invocation` | 只允许用户手动触发，如部署、提交、发消息 | 应该手动触发的高风险流程被模型自动运行 |
| `user-invocable` | 背景知识型 skill，不适合 `/` 菜单直接调用 | 用户看到不可行动的命令 |
| `allowed-tools` | 用户信任后预批准特定工具 | 误以为它会限制工具；实际只预批准，不屏蔽其他工具 |
| `model` / `effort` | 单次调用需要特定模型或推理强度 | 把长期偏好写进 skill，造成不可预期覆盖 |
| `context: fork` / `agent` | 明确任务可在隔离 subagent 中完成 | 只有背景规则没有任务，fork 后无事可做 |
| `hooks` | 生命周期内需要确定性自动化 | 用自然语言要求代替本该由 hook 强制的行为 |
| `paths` | 只在特定路径工作时自动触发 | glob 过窄导致欠触发，过宽导致误触发 |
| `shell` | 动态上下文命令必须用 PowerShell 等特定 shell | Windows 环境未说明 `powershell` 前提 |

检查 description 时同时确认：combined `description` + `when_to_use` 在技能列表中最多保留约 1,536 字符；最关键触发词应放在最前面。

## 3. 调用控制

- 默认：用户和 Claude 都能调用，description 会进入技能列表。
- `disable-model-invocation: true`：隐藏给模型，只能用户手动触发；适合有副作用或需人为授权的流程。
- `user-invocable: false`：模型可自动使用，但不在 `/` 菜单展示；适合背景知识。
- `skillOverrides` 可在设置中覆盖可见性；若用户说 skill 不显示或不触发，检查它是否被设为 `name-only`、`user-invocable-only` 或 `off`。
- 插件 skill 不受 `skillOverrides` 管理，应通过 `/plugin` 管理。

## 4. 参数与替换

- `$ARGUMENTS` 用于完整参数；若正文未出现，Claude Code 会把参数追加到技能内容末尾。
- `$ARGUMENTS[N]` / `$N` 用于位置参数；多词参数需由用户用 shell 风格引号包住。
- `$name` 依赖 frontmatter `arguments` 顺序。
- `${CLAUDE_SESSION_ID}`、`${CLAUDE_EFFORT}`、`${CLAUDE_SKILL_DIR}` 可用于日志、条件说明和稳定引用脚本。
- 若脚本路径写死为绝对路径，优先建议改为 `${CLAUDE_SKILL_DIR}/scripts/...`。

## 5. 动态上下文注入

- `` !`command` `` 与 ` ```! ` 代码块会在 skill 内容发送给模型前执行，模型只看到输出。
- 适合拉取实时 diff、环境版本、PR 信息等，不适合执行破坏性操作。
- 命令输出应可控，避免把大 diff、密钥或无关日志注入上下文。
- 若组织设置了 `"disableSkillShellExecution": true`，命令会替换为禁用提示；skill 应有降级说明。
- Windows / PowerShell 相关 skill 若依赖此能力，检查 `shell: powershell` 与环境前提是否写清。

## 6. 支持文件与脚本

- `SKILL.md` 是概览和导航；模板、示例、长参考、脚本应拆到同目录下并从 `SKILL.md` 直接链接。
- 对大参考文件，检查 `SKILL.md` 是否说明“什么时候读哪个文件”，而不是只把文件堆在目录里。
- 脚本默认应执行而不是读入上下文；说明里要写清“运行脚本”还是“阅读脚本作为参考”。
- 生成视觉输出、HTML 报告、依赖图等场景，可通过 `scripts/` 提供可执行脚本，并用 `${CLAUDE_SKILL_DIR}` 定位。
- 脚本不得依赖未说明的包、绝对路径或隐藏环境；确定性、易错操作优先脚本化。

## 7. Subagent

- `context: fork` 适合研究、审计、PR 总结等可隔离任务。
- fork skill 必须在正文中自带完整任务、输入来源和输出格式；不能只写“遵循这些约定”。
- `agent` 应指向合适的内置或自定义 agent；未指定时默认 general-purpose。
- 若目标是让某 subagent 长期带着知识工作，应考虑 subagent 的 `skills` 预加载，而不是把任务写成 fork skill。

## 8. 生命周期与上下文成本

- skill 一旦加载，渲染后的内容会留在会话中；正文要写成持续适用的 standing instructions。
- 自动压缩后只保留近期 skill 的前段内容；关键规则应靠前。
- `SKILL.md` 宜保持简短，长参考放 `references/`，脚本放 `scripts/` 执行而非读入。
- 若用户反馈“刚开始有效后来失效”，检查 description、正文前 20% 的关键信息、以及是否在压缩后丢失后半段。

## 9. 可见性与排障

- skill 不触发时，检查 description 关键词、`/skills` 可见性、`skillOverrides`、路径匹配、目录 watch、以及是否需要直接 `/skill-name` 调用。
- skill 触发过多时，收紧 description 或改为 `disable-model-invocation: true`。
- skill 描述被截断时，优先压缩低价值描述，或将低优先级 skill 设为 `name-only`。
- `disableSkillShellExecution` 会影响动态上下文；排障时要检查设置策略。

## 10. 分享与分发

- 项目内共享放 `.claude/skills/`；跨项目分发优先做 plugin。
- plugin skill 使用 `plugin-name:skill-name` 命名空间，不与 personal / project 同名冲突。
- 若 skill 改动影响对外描述、重要能力或安装发现，提醒同步插件 manifest 与 marketplace 元数据。
- 高风险项目 skill 若声明 `allowed-tools`，提醒用户需要先审查再信任工作区。
- managed skills 适合组织级分发；项目 skill 应提交 `.claude/skills/`；plugin skill 放在插件 `skills/` 目录。

## 11. 输出建议

审查 Claude Code 专有能力时，报告中至少说明：

- 当前 skill 是否需要自动触发、手动触发，还是隐藏给用户。
- frontmatter 扩展字段是否必要，是否有更低风险替代。
- 动态上下文或脚本是否会引入安全、上下文膨胀或平台兼容问题。
- 是否存在 command 到 skill 迁移、plugin 分发或可见性设置导致的触发问题。
- 官方文档相关判断应注明依据来自 `https://code.claude.com/docs/en/skills`，本地 checklist 只是执行化整理。
