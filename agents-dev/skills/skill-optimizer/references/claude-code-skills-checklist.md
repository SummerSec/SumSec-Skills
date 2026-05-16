# Claude Code Skills 专项检查表

用于 `skill-optimizer` 路径 A 的 **Step 5 Verify** 阶段，逐项核对 Claude Code 专有特性。审查前先通读 [review-checklist.md §5](review-checklist.md) 了解高层摘要，再用本表逐项打勾。

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
- [ ] 脚本路径使用 `${CLAUDE_SKILL_DIR}`，不写死绝对路径
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