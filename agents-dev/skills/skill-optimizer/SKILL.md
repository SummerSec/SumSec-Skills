---
name: skill-optimizer
description: "优化、审查或诊断 Agent Skills（SKILL.md）。用于 skill 质量分析、重构技能、skills 不触发、skill 没生效、optimize skills、analyze skills、check my skills。"
disable-model-invocation: true
---

# Skill Optimizer

## 路径选择

| 路径 | 行为 | 典型触发 |
|------|------|----------|
| **A — 结构化改写** | 读目标 skill → 诊断与计划 → **用户确认后**才改 `SKILL.md` / references / scripts | 用户附着或指定路径、说「改 description」「拆 references」「加确认步骤」 |
| **B — 会话审计** | 扫描本机 skill 目录与历史会话 jsonl，**只输出报告**，**绝不**写 skill 文件 | `/optimize-skill`、`/skill-audit`、「分析我所有 skills」「skill 从不触发」「只审计不要改」 |

**判定：** 用户明确「只分析 / 只出报告 / 不要改」→ **B**。用户点名要改某 skill 且未禁止写文件 → **A**（无确认仍不得改）。「先看全局再改」→ 先做 **B**，再在用户要求下对单项切 **A**。

## 共用规则

- **官方规范优先（双轨）**：每次启动先执行下方 **Step 0 — Fetch Spec**（三级降级：代理 → 直连 → 本地缓存），未完成前禁止进入诊断、计划或改写阶段。
- **路径 B：只读。** 不得修改任何 skill 文件，只交付报告（Step 0 对缓存文件的覆盖**是允许的例外**，因为它属于 skill 自身的资产更新而非被审计 skill 的修改）。
- **路径 A：确认门槛。** 不得把「审查结论」与「直接改文件」混为一步；未确认不得改目标 skill。
- **路径 B：八维齐全。** 不得跳过 [references/session-audit-dimensions.md](references/session-audit-dimensions.md) 中的 4.2、4.3、4.5b、4.8；缺数据写 `N/A — insufficient session data`。
- **量化与证据：** 报告用次数、比例、日期范围；欠触发须引用真实用户原句；description 改写用**建议**语气并点明依据（静态表条目、官方规范条款或研究结论）。
- **范围克制：** 用户只要某一方向（如只改 description）时，围绕该方向计划，不擅自整 skill 重写；不要为了「全面」把无关 reference 全读进上下文。
- **路径统一用 `${CLAUDE_SKILL_DIR}`：** 任何「读 / 写 / 引用本 skill 资源」的动作（含脚本、Bash、`Read`、`Write`、`WebFetch` 后落盘）都使用 `${CLAUDE_SKILL_DIR}/...` 形式，不写死绝对路径，不写仓库相对路径。

## Pipeline 类 skill 的特别处理

当目标 skill 在 Step 2 Review 中被判定为 **Pipeline**（主模式或次模式），或满足 ≥3 个 workflow-skill-creator 适用信号（≥3 顺序步骤 / 跨步骤状态传递 / 需脚本辅助 / 需进度文件 / 强制顺序、跳步导致失败），按以下规则叠加评审基准：

- **必读资产**：`${CLAUDE_SKILL_DIR}/../workflow-skill-creator/references/architecture_patterns.md`（六大架构模式）与 `quality_checklist.md`（七维自检）
- **基准合并**：Step 5 Verify 须在 `review-checklist.md` 之上**叠加** workflow-skill-creator 的 quality_checklist；针对编排专门规范遇冲突时**以 workflow-skill-creator 为准**
- **Plan 输出义务**：Step 3 Plan 必须在末段写明「目标 skill 已识别为 Pipeline，对照 workflow-skill-creator 六大模式逐项核对」并列出未达标项
- **跨 skill 路径**：两 skill 同属 `agents-dev` plugin，故用 `${CLAUDE_SKILL_DIR}/../workflow-skill-creator/...` 引用；若日后被拆到不同 plugin，需改为目标 plugin 的解析路径

## 路径 B 工作流（概要）

1. **Step 0 — Fetch Spec**：执行下方「Step 0 详细流程」；本轮基准来自最新抓取或 `${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md` 缓存。
2. **锁定范围**：`/optimize-skill` 全量，或 `/optimize-skill a b` 指定多个 name。
3. **发现 skill**：按 [session-audit-dimensions.md](references/session-audit-dimensions.md) 中的目录顺序扫描并去重，读 frontmatter 与步骤结构。
4. **采集会话**：Claude Code / Codex jsonl 字段差异见该文档；Codex 注意「加载 ≠ 已按 skill 执行」。
5. **跑满八维 + 综合分**：表格、权重、报告骨架均见该文档；遇到与官方规范不一致处，须在报告中以「依据：官方规范 §X」标注。
6. **输出**：使用该文档中的 **Report Format**；P0 / P1 / P2 分级；报告首段写明「本轮使用的官方规范来源（live / cache）+ fetched_at」。

## 路径 A 工作流

复制并跟踪进度：

```text
优化进度：
- [ ] 步骤 0：Fetch Spec（拉取并阅读最新官方规范，必要时落盘缓存）
- [ ] 步骤 1：Scope（确定范围）
- [ ] 步骤 2：Review（审查目标 skill）
- [ ] 步骤 3：Plan（输出优化计划并等待确认）
- [ ] 步骤 4：Implement（确认后实施）
- [ ] 步骤 5：Verify（校验结果）
```

### Step 0: Fetch Spec（共用，路径 A / B 都执行）

按以下顺序执行，并在最终报告/汇报里写明走到了哪一支：

1. **尝试在线抓取（代理优先）**：调用 `WebFetch`，URL = `https://proxy.sumsec.me/https://code.claude.com/docs/en/skills.md`；若代理失败，再尝试直连 `WebFetch https://code.claude.com/docs/en/skills.md`。prompt 要求按官方原文返回完整 markdown（重点保留 frontmatter 字段表、调用控制、动态上下文、subagent、可见性、分发、字符串替换 `${CLAUDE_SKILL_DIR}` 等条款）。
2. **成功 → 覆盖缓存**：把抓取到的官方文档**整文件覆盖**到 `${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`，并保留头部注释块（来源、`fetched_at`、`method` 字段）。本轮以「live」为基准。
3. **失败 / 离线 / 用户要求离线** → **读缓存**：`Read ${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`，本轮以「cache」为基准；在最终汇报第一行用一句话标注：`⚠️ 使用本地缓存基准（fetched_at: <时间>）`。
4. **基准摘要**：从 live 或 cache 中摘录本轮要用到的条款（frontmatter 字段、调用控制、动态上下文、subagent、分发、新增/废弃项），作为 Step 2 / Step 3 / Step 5 的判定基准；保留官方原句中的关键术语，禁止改写。
5. **禁止事项**：禁止跳过 Step 0；禁止仅凭"SKILL.md 里曾经引用过官方文档链接"就视作完成；禁止把缓存文件改成与官方原文严重偏离的精简版（精简放到摘要里，不要污染缓存）。

### Step 1: Scope

确认目标 skill 与优化范围；目标不明时只问**一个**最短问题。

### Step 2: Review

先读目标 `SKILL.md`，再按需读其直接链接的 `references/`、`scripts/`、`assets/`。本 skill 自身的 references 一律通过 `${CLAUDE_SKILL_DIR}/references/<file>` 定位（下面的 markdown 链接是相对路径展示，实际工具调用请用 `${CLAUDE_SKILL_DIR}` 形式）：

- **Step 0 抓取/缓存的官方规范为最高基准**；本地 reference 用于补充执行细节，与官方规范冲突时以官方为准并在 Step 3 标注修订点。
- [`${CLAUDE_SKILL_DIR}/references/review-checklist.md`](references/review-checklist.md)（常规检查；面向 Claude Code 的 skill 默认覆盖新特性）
- [`${CLAUDE_SKILL_DIR}/references/skill-design-review-framework.md`](references/skill-design-review-framework.md)
- **官方基准回看**：[`${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`](references/official-spec-fetch.md)（Claude Code 官方规范缓存或 Step 0 live 抓取）；checklist 用于补充执行细节，不替代官方规范
- Claude Code skill 必读 [`${CLAUDE_SKILL_DIR}/references/claude-code-skills-checklist.md`](references/claude-code-skills-checklist.md) 了解检查维度，Step 5 Verify 时逐项核对
- **Pipeline 类按需读取**：若目标 skill 是 Pipeline（多步骤、跨步骤状态、需脚本/进度文件），读 `${CLAUDE_SKILL_DIR}/../workflow-skill-creator/references/architecture_patterns.md` 与 `quality_checklist.md`，作为 Step 3 Plan 与 Step 5 Verify 的叠加基准
- **可选加项**：用 [`${CLAUDE_SKILL_DIR}/references/session-audit-dimensions.md`](references/session-audit-dimensions.md) 的 **4.4 静态质量** 表做 CSO / YAML / 长度检查（无会话也可做）

Review 关注点保持与原 skill 一致：name、description、模式匹配、确认门槛、渐进披露、输出可执行性等。**额外固定关注：被审查 skill 是否正确使用 `${CLAUDE_SKILL_DIR}` 引用自身资源**——动态上下文、Bash 命令、脚本路径、`Read`/`Write` 目标、缓存落盘位置都必须用该变量；写死 `~/.claude/skills/...`、绝对路径、仓库相对路径属于反模式（详见 [`${CLAUDE_SKILL_DIR}/references/claude-code-skills-checklist.md` §7](references/claude-code-skills-checklist.md)）。

### Step 3: Plan

先诊断再计划，**不改文件**。输出须包含「审查结论」（模式判断 + 高/中/低优先级问题）与「优化计划」（文件级变更、原因、是否用户指定方向），末句：**请确认是否按以上计划执行。**

### Step 4: Implement

用户确认后再改；小步、新增 reference 须在 `SKILL.md` 中直接链接。

### Step 5: Verify

- 已对照 Step 0 抓取或缓存的官方规范条款逐条核对：`description` / 调用控制 / 动态上下文 / subagent / 分发等改动有据可循
- frontmatter 字段符合目标平台规范；`name` 与目录一致；`description` 可独立表达触发条件；额外字段均有明确意图
- 已按 [`${CLAUDE_SKILL_DIR}/references/official-spec-fetch.md`](references/official-spec-fetch.md)（或 Step 0 live 抓取摘要）校验技能位置、命令兼容、扩展 frontmatter、调用控制、动态上下文、subagent、可见性覆盖、分发要求与简洁性 / 渐进披露 / 命名 / description 等基础项
- `review-checklist.md` 已覆盖 Claude Code 新特性；必要时按 [`${CLAUDE_SKILL_DIR}/references/claude-code-skills-checklist.md`](references/claude-code-skills-checklist.md) 细查
- **若目标为 Pipeline 类**：已对照 `${CLAUDE_SKILL_DIR}/../workflow-skill-creator/references/quality_checklist.md` 七维（结构 / 进度文件 / 执行规范 / 前置门槛 / 依赖 / 触发 / 输出）自检；六大架构模式（进度文件驱动、步骤框架分离、三阶段执行、脚本自动化、资源分层、路径一致性）改造结果可追溯到 `architecture_patterns.md`
- 正文更短更清晰；路径 A 的确认门槛仍在说明中写清
- 若借鉴了 4.4：description 含 `: ` 时 YAML 用双引号包裹等
- 任何脚本 / Bash 引用本 skill 内文件，路径都形如 `${CLAUDE_SKILL_DIR}/...`，不写死本机绝对路径

汇报：已改文件、已落实方向、本轮基准来源（live `fetched_at` 或 cache `fetched_at`）、残留风险。

## 审查优先级（路径 A 快速裁定）

1. 触发失败、确认缺失、流程不可执行  
2. 结构臃肿、重复、资源组织混乱  
3. 措辞与示例润色  

## 与上游的关系

会话八维、评分与报告模板与 [xget 镜像的 SKILL.md](https://xget.sumsec.me/gh/hqhq1025/skill-optimizer/raw/refs/heads/main/skills/skill-optimizer/SKILL.md) 对齐，并压缩进 `references/session-audit-dimensions.md` 以降低 Tier2 体积。
