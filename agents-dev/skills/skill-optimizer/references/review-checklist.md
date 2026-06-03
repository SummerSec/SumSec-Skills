# Skill Review Checklist

按需审查，不必每次穷举所有项目。若用户已指定优化方向，先覆盖对应部分。本清单补充 `${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`（即 https://code.claude.com/docs/en/skills.md 的 live 抓取或本地缓存），不替代官方规范。

> ⚠️ 使用前提：必须先完成 SKILL.md 中的 Step 0（在线抓取 → 覆盖缓存；离线 → 读 `${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`）。本清单仅作为补充检查，遇冲突以官方规范为准。

## 1. Triggering

- `name` 是否只含小写字母、数字、连字符
- 目录名是否与 `name` 完全一致
- `description` 是否把关键触发条件放在前面，并让模型能判断“何时使用”
- `description` 是否避免泄漏完整工作流或替代正文执行步骤
- `description` 是否包含用户真实会说的关键词
- `description` 是否避免第一人称和空泛描述

常见优化：

- 把“适用场景”里的触发词回收到 `description`
- 去掉模糊描述，例如“帮助处理各种内容”
- 把技能边界写清楚，避免和相邻 skill 抢触发

## 2. Workflow

- 是否有明确顺序
- 是否存在必须确认却没有等待确认的步骤
- 是否说明输入、输出、落盘位置或交付格式
- 是否对失败场景给出降级策略
- 是否把“应该做”和“禁止做”写清楚

常见优化：

- 增加 checklist
- 把“先检查再执行”写成硬性门槛
- 为关键输出增加固定格式

## 3. Progressive Disclosure

- `SKILL.md` 是否只保留核心流程
- 详细规则、示例、长说明是否拆到 `references/`
- `references/` 是否都直接从 `SKILL.md` 链接
- 是否避免多层嵌套引用
- 是否避免在 `SKILL.md` 和 `references/` 重复大段内容

常见优化：

- 把大段示例、规则表、术语表移到 `references/`
- 在 `SKILL.md` 里只写“什么时候读哪个 reference”

## 4. Resource Strategy

- 是否存在反复手写且适合脚本化的操作
- 是否缺少稳定执行所需的模板、脚本或参考资料
- `assets/` 是否只放输出资源，不放说明文档
- 是否创建了不必要的 README、CHANGELOG 等噪音文件
- **路径是否一律使用 `${CLAUDE_SKILL_DIR}`**：脚本、动态上下文、Bash、`Read`/`Write` 目标、SKILL.md 内任何"工具调用语义"的资源引用都应使用，不写死绝对路径或仓库相对路径；细则见 [`${CLAUDE_SKILL_DIR}/references/claude-code-skills-checklist.md` §7](claude-code-skills-checklist.md)
- 若使用动态上下文注入，是否控制输出规模、避免破坏性命令，并说明 shell / policy 前提

常见优化：

- 把重复命令封装到 `scripts/`
- 删除与 skill 执行无关的辅助文档

## 5. Claude Code Feature Compatibility

面向 Claude Code 的 skill 默认检查本节；**Step 5 Verify 时用 [claude-code-skills-checklist.md](claude-code-skills-checklist.md) 逐项核对。**

- commands 兼容：若从 `.claude/commands/*.md` 迁移，同名 skill 优先级、调用方式和参数行为是否清楚
- frontmatter 扩展字段：`disable-model-invocation`、`user-invocable`、`allowed-tools`、`context`、`agent`、`paths`、`shell` 等是否都有明确必要性
- 调用控制：有副作用或高风险流程是否改为手动触发；背景知识型 skill 是否适合隐藏用户菜单
- 参数替换：`$ARGUMENTS`、`$N`、命名参数、`${CLAUDE_SKILL_DIR}` 是否使用正确
- 动态上下文：`` !`command` `` / ` ```! ` 是否只用于安全、有限、实时上下文
- Subagent：`context: fork` 是否包含完整任务与输出格式，而不只是背景规则
- 可见性排障：`skillOverrides`、路径匹配、目录 watch、description 截断是否会影响触发
- 分发：project / personal / plugin / managed 位置是否与目标受众匹配

## 6. Output Contract

- 输出是否可直接给用户或下游 agent 使用
- 是否区分“审查结论”“优化计划”“最终修改结果”
- 是否说明确认回复的触发条件，例如“确认”“开始修改”
- 是否在最终汇报中列出文件和剩余风险

常见优化：

- 固定 plan 模板
- 固定最终汇报模板
- 把用户可选回复写清楚

## 7. Prioritization

默认按这个顺序排序问题：

1. 高优先级：触发失败、确认缺失、工作流错误、明显冲突
2. 中优先级：结构臃肿、资源组织差、上下文浪费
3. 低优先级：措辞打磨、示例增强、展示优化

## 8. Pipeline Skill 专项（仅 Pipeline 主/次模式时启用）

目标 skill 被 `skill-design-review-framework.md` 判为 Pipeline，或满足 workflow-skill-creator 适用信号（≥3 顺序步骤 / 跨步骤状态 / 需脚本辅助 / 进度文件 / 强制顺序）时，在 §1–§7 之上叠加本节。**与 §1–§7 冲突时，本节为准**（编排专门规范优先于通用规范）。

- 进度文件驱动：单一 Markdown 贯穿全流程、追加不覆盖（详见 `${CLAUDE_SKILL_DIR}/../workflow-skill-creator/references/architecture_patterns.md` §1）
- 步骤框架分离：SKILL.md <200 行，每步独立 `references/step_frameworks/stepN_*.md`（§2）
- 三阶段执行：每步「前置校验 → 执行记录 → 后置校验」结构完整（§3）
- 脚本自动化：路径生成 / 数据匹配 / 格式转换等确定性任务有独立脚本，不让模型每次自由发挥（§4）
- 资源分层：L1 元数据 / L2 主体 / L3 步骤框架 / L4 参考资料 四层加载（§5）
- 路径一致性：全流程使用 `{progress_file_path}` 占位符，禁止步骤重新生成路径（§6）

完整自检对照 `${CLAUDE_SKILL_DIR}/../workflow-skill-creator/references/quality_checklist.md`（结构 / 进度文件 / 执行规范 / 前置门槛 / 依赖 / 触发 / 输出 七维）。
