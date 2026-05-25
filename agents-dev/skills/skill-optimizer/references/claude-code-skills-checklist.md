# Claude Code Skills 专项检查表

用于 `skill-optimizer` 路径 A 的 **Step 5 Verify** 阶段，逐项核对 Claude Code 专有特性。审查前先通读 [`${CLAUDE_SKILL_DIR}/references/review-checklist.md`](review-checklist.md) §5 了解高层摘要，再用本表逐项打勾。

> ⚠️ 使用前提：已完成 SKILL.md Step 0 双轨流程——在线则 WebFetch `https://code.claude.com/docs/en/skills.md` 并覆盖缓存；离线则读 `${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`。本表只是补充清单，与官方规范冲突时以官方规范为准。

## 1. Frontmatter 字段

- [ ] `name`：小写字母/数字/连字符，≤64 字符，与目录语义一致
- [ ] `description`：关键触发词在最前面；与 `when_to_use` 合计 ≤ ~1536 字符
- [ ] `disable-model-invocation`：仅高风险/有副作用流程使用；是否有更低风险替代（如 `user-invocable: false`）
- [ ] `user-invocable`：背景知识型 skill 是否为 `false`；是否误隐藏了用户需要的命令
- [ ] `allowed-tools`：确认只预批准不屏蔽；用户是否知晓需审查后信任
- [ ] `model` / `effort`：是否把长期偏好写入 skill 造成意外覆盖
- [ ] `context: fork`：正文是否有完整任务+输入+输出格式，而非只有背景规则
- [ ] `context: agent`：是否指向合适的内置/自定义 agent
- [ ] `paths`：glob 是否过窄（欠触发）或过宽（误触发）
- [ ] `shell`：是否写明环境前提（如 Windows 需 PowerShell）
- [ ] `hooks`：是否用自然语言代替了本该由 hook 强制的行为
- [ ] `argument-hint` / `arguments`：手动调用+传参场景是否声明参数形状

## 2. 调用控制与可见性

- [ ] 有副作用/需授权流程 → `disable-model-invocation: true`
- [ ] 背景知识型 skill → `user-invocable: false`
- [ ] 触发异常时已排查：`skillOverrides`、`/skills` 可见性、目录 watch、description 截断
- [ ] 插件 skill 是否通过 `/plugin` 管理而非 `skillOverrides`

## 3. 动态上下文与脚本

- [ ] `` !`command` `` / ` ```! ` 只用于安全、可控、有限输出；无破坏性命令
- [ ] 脚本路径使用 `${CLAUDE_SKILL_DIR}`，不写死绝对路径（详见 §7）
- [ ] 若组织设了 `disableSkillShellExecution`，skill 有降级说明
- [ ] 脚本不依赖未说明的包或隐藏环境

## 4. Subagent

- [ ] fork skill 正文自带完整任务描述（不只是"遵循约定"）
- [ ] 若目标是长期带知识工作，用 subagent `skills` 预加载而非 fork skill

## 5. 分发与位置

- [ ] 位置与受众匹配：`.claude/skills/`（项目）、plugin `skills/`（跨项目）、managed（组织）
- [ ] 插件 skill 使用 `plugin-name:skill-name` 命名空间
- [ ] 改动影响对外描述/安装发现时，已同步插件 manifest 与 marketplace 元数据

## 6. 生命周期

- [ ] 关键规则在正文前 20%，压缩后不丢失
- [ ] `SKILL.md` 保持简短，长参考在 `references/`，脚本在 `scripts/` 执行而非读入

## 7. `${CLAUDE_SKILL_DIR}` 使用核查（默认必查）

> 任何引用 skill 自身资源（references / scripts / assets / 缓存数据）的位置都应使用 `${CLAUDE_SKILL_DIR}`。该变量由 Claude Code 自动注入，对 personal / project / plugin 三种安装位置都正确解析；写死路径会让 skill 在异地复制后失效。

### 7.1 应该用 `${CLAUDE_SKILL_DIR}` 的位置

- [ ] `` !`command` `` 与 ` ```! ` 动态注入块里的脚本/数据路径
- [ ] `allowed-tools: Bash(...)` 中允许的具体命令模板
- [ ] `SKILL.md` 正文里指引 Claude 调用 `Read` / `Write` / `Edit` 时的目标文件
- [ ] `scripts/*.sh` / `*.py` 内部互相引用同 skill 资源时
- [ ] 当本 skill 维护本地缓存（如 `official-spec-fetch.md`）时的覆盖目标
- [ ] markdown 链接旁的"实际工具调用路径"提示（保留相对链接以便点击，但显式标注 `${CLAUDE_SKILL_DIR}/...`）

### 7.2 常见反模式（命中即记 P0/P1）

- [ ] 写死 `~/.claude/skills/<name>/...` 或 `$HOME/.claude/skills/...`
- [ ] 写死 plugin 绝对路径（如 `/home/.../plugins/foo/skills/...`）
- [ ] 仓库相对路径（如 `agents-dev/skills/<name>/...`）出现在工具调用语义里
- [ ] `cd $(dirname "$0")` / 依赖"当前工作目录正好是 skill 目录"的脚本
- [ ] `${CLAUDE_SKILL_DIR}` 被错写为 `$CLAUDE_SKILL_DIR` 但出现在引号语境（部分 shell 解析失败）
- [ ] plugin 子 skill 用 plugin 根目录而非 skill 目录：注意官方规范明确"对 plugin skills，`${CLAUDE_SKILL_DIR}` 指向 skill 自身的子目录，而非 plugin 根"

### 7.3 优化建议（在 Step 3 Plan 给出的话术）

- 把硬编码路径替换为 `${CLAUDE_SKILL_DIR}/...`，并解释「该变量由 Claude Code 注入，跨 personal/project/plugin 安装都解析正确」
- 若 skill 本身需要落盘缓存（fetch 类、profile 类、log 类），明确以 `${CLAUDE_SKILL_DIR}` 为根并保留头部元信息（来源 / fetched_at / method）
- 对 markdown 引用，正文链接保留相对路径以便点击，工具调用旁加 `${CLAUDE_SKILL_DIR}/...` 提示，避免 Claude 误把链接当 cwd 相对路径解析