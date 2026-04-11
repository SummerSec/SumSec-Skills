---
name: skill-optimizer
description: "优化、审查或诊断 Agent Skills（SKILL.md）。路径A：先审查再规划，用户确认后改目标文件。路径B：只读会话审计（jsonl+静态八维），输出 P0/P1/P2 报告不改文件。触发：优化 skill、skill 质量、重构技能、/optimize-skill、/skill-audit、optimize skills、analyze skills、check my skills、skills 不触发、skill 没生效。默认若用户未说只读且指向具体 skill，走路径A并遵守确认门槛。"
---

# Skill Optimizer

## 路径选择

| 路径 | 行为 | 典型触发 |
|------|------|----------|
| **A — 结构化改写** | 读目标 skill → 诊断与计划 → **用户确认后**才改 `SKILL.md` / references / scripts | 用户附着或指定路径、说「改 description」「拆 references」「加确认步骤」 |
| **B — 会话审计** | 扫描本机 skill 目录与历史会话 jsonl，**只输出报告**，**绝不**写 skill 文件 | `/optimize-skill`、`/skill-audit`、「分析我所有 skills」「skill 从不触发」「只审计不要改」 |

**判定：** 用户明确「只分析 / 只出报告 / 不要改」→ **B**。用户点名要改某 skill 且未禁止写文件 → **A**（无确认仍不得改）。「先看全局再改」→ 先做 **B**，再在用户要求下对单项切 **A**。

## 共用规则

- **路径 B：只读。** 不得修改任何 skill 文件，只交付报告。
- **路径 A：确认门槛。** 不得把「审查结论」与「直接改文件」混为一步；未确认不得改目标 skill。
- **路径 B：八维齐全。** 不得跳过 [references/session-audit-dimensions.md](references/session-audit-dimensions.md) 中的 4.2、4.3、4.5b、4.8；缺数据写 `N/A — insufficient session data`。
- **量化与证据：** 报告用次数、比例、日期范围；欠触发须引用真实用户原句；description 改写用**建议**语气并点明依据（静态表条目或研究结论）。
- **范围克制：** 用户只要某一方向（如只改 description）时，围绕该方向计划，不擅自整 skill 重写；不要为了「全面」把无关 reference 全读进上下文。

## 路径 B 工作流（概要）

1. **锁定范围**：`/optimize-skill` 全量，或 `/optimize-skill a b` 指定多个 name。
2. **发现 skill**：按 [session-audit-dimensions.md](references/session-audit-dimensions.md) 中的目录顺序扫描并去重，读 frontmatter 与步骤结构。
3. **采集会话**：Claude Code / Codex jsonl 字段差异见该文档；Codex 注意「加载 ≠ 已按 skill 执行」。
4. **跑满八维 + 综合分**：表格、权重、报告骨架均见该文档。
5. **输出**：使用该文档中的 **Report Format**；P0 / P1 / P2 分级。

## 路径 A 工作流

复制并跟踪进度：

```text
优化进度：
- [ ] 步骤 1：Scope（确定范围）
- [ ] 步骤 2：Review（审查目标 skill）
- [ ] 步骤 3：Plan（输出优化计划并等待确认）
- [ ] 步骤 4：Implement（确认后实施）
- [ ] 步骤 5：Verify（校验结果）
```

### Step 1: Scope

确认目标 skill 与优化范围；目标不明时只问**一个**最短问题。

### Step 2: Review

先读目标 `SKILL.md`，再按需读其直接链接的 `references/`、`scripts/`、`assets/`。

- [references/review-checklist.md](references/review-checklist.md)
- [references/skill-design-review-framework.md](references/skill-design-review-framework.md)
- 需对照官方取舍时：[技能创作最佳实践 - Claude API Docs](<references/技能创作最佳实践 - Claude API Docs.md>)
- **可选加项**：用 [session-audit-dimensions.md](references/session-audit-dimensions.md) 的 **4.4 静态质量** 表做 CSO / YAML / 长度检查（无会话也可做）

Review 关注点保持与原 skill 一致：name、description、模式匹配、确认门槛、渐进披露、输出可执行性等。

### Step 3: Plan

先诊断再计划，**不改文件**。输出须包含「审查结论」（模式判断 + 高/中/低优先级问题）与「优化计划」（文件级变更、原因、是否用户指定方向），末句：**请确认是否按以上计划执行。**

### Step 4: Implement

用户确认后再改；小步、新增 reference 须在 `SKILL.md` 中直接链接。

### Step 5: Verify

- frontmatter 仅 `name`、`description`；`name` 与目录一致；`description` 可独立表达触发条件
- 正文更短更清晰；路径 A 的确认门槛仍在说明中写清
- 若借鉴了 4.4：description 含 `: ` 时 YAML 用双引号包裹等

汇报：已改文件、已落实方向、残留风险。

## 审查优先级（路径 A 快速裁定）

1. 触发失败、确认缺失、流程不可执行  
2. 结构臃肿、重复、资源组织混乱  
3. 措辞与示例润色  

## 与上游的关系

会话八维、评分与报告模板与 [xget 镜像的 SKILL.md](https://xget.sumsec.me/gh/hqhq1025/skill-optimizer/raw/refs/heads/main/skills/skill-optimizer/SKILL.md) 对齐，并压缩进 `references/session-audit-dimensions.md` 以降低 Tier2 体积。
