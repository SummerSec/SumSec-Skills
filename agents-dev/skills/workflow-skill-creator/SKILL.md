---
name: workflow-skill-creator
description: 当用户要求创建流程编排类 Skill、管线 Skill、工作流 Skill、多步骤分析 Skill，或提及流程编排、pipeline skill、workflow skill、步骤框架、进度文件、任务编排、审计流程、分析管线、复杂任务 skill时，应使用此技能。提取自 biz-vul-security 的六大架构模式（进度文件驱动、步骤框架分离、三阶段执行、脚本自动化、资源分层、路径一致性），提供从需求梳理到交付自检的完整方法论。
---

# Workflow Skill Creator

## 核心角色

将多步骤、有状态、需跨步骤传递数据的复杂任务转化为结构化的流程编排 Skill。

## 适用场景

**以下信号使用本 skill**（≥3 个即适用）：

- 任务需要 ≥3 个顺序步骤，步骤间有依赖关系
- 步骤间需传递和累积状态数据（中间分析结果）
- 需要确定性脚本辅助重复操作（路径生成、数据匹配、格式转换）
- 有明确判定规则和领域知识需引用
- 输出需标准化格式（报告模板、JSON 结构）
- 需强制执行顺序，跳步导致分析不完整

**不适用场景** — 使用普通 skill-creator：
- 单步操作（格式转换、代码生成）
- 无状态传递的简单指导
- 纯知识检索

## 六大架构模式

详细原理与反模式见 **[架构模式参考](references/architecture_patterns.md)**。

| 模式 | 核心思想 | 解决的问题 |
|------|---------|-----------|
| **1. 进度文件驱动** | 一个 Markdown 文件贯穿全流程，追加不覆盖 | 跨步骤状态丢失 |
| **2. 步骤框架分离** | SKILL.md <200行，每步详细框架独立文件 | SKILL.md 膨胀 |
| **3. 三阶段执行** | 每步：前置校验 → 执行记录 → 后置校验 | 跳步、结果不验证 |
| **4. 脚本自动化** | 确定性任务提取为独立脚本 | 输出不一致 |
| **5. 资源分层** | 元数据→主体→框架→参考 四级加载 | 上下文浪费 |
| **6. 路径一致性** | `{progress_file_path}` 占位符全程传递 | 路径断裂 |

---

## 创建流程（6 步）

详细操作指南见 **[创建流程详细指南](references/creation_workflow.md)**。

### Step A: 需求梳理与步骤分解

先收集具体示例（用户原句写法、典型场景、期望输出），再确认任务画像（输入/输出/步骤数）。将任务分解为 3-8 个有明确依赖关系的顺序步骤，识别需跨步骤传递的状态数据。

### Step B: 目录结构设计

使用脚手架脚本一键生成标准目录：

```bash
python3 ~/.claude/skills/workflow-skill-creator/scripts/scaffold_workflow_skill.py \
  --name {skill-name} \
  --steps {n} \
  --step-names "步骤1,步骤2,..." \
  --output ~/.claude/skills/{skill-name}/
```

脚本生成：SKILL.md 骨架、步骤框架文件、路径生成脚本、进度文件规范、模板文件。生成后逐文件填写具体内容。

### Step C: 撰写 SKILL.md

遵循 [Skill 模板](assets/skill_template.md)，保持主体 <200 行。核心区块：角色 → 场景 → 架构模式 → 步骤概要 → 资源索引。用祈使语气，解释"为什么"而非仅仅"必须"。

### Step D: 撰写步骤框架文件

每个 `references/step_frameworks/stepN_xxx.md` 遵循 [Step 框架模板](assets/step_framework_template.md)。必须包含：校验规则（前置+后置 checklist）、核心执行流程（可复制执行的命令）、完成标准与验收。开头必须有 `⚠️ 路径一致性要求` 警告块。

### Step E: 撰写脚本和模板

必建：路径生成脚本 — 根据输入参数生成确定性进度文件路径。可选：数据匹配脚本、格式转换脚本、校验脚本。模板：进度文件结构模板 + 最终输出模板。

### Step F: 迭代优化

创建完成后，用真实场景测试 skill，根据执行表现调整步骤粒度、校验规则和模板。详细方法见 [创建流程详细指南](references/creation_workflow.md) Step F。

---

## 参考资源

### 方法论文档
- **[架构模式详细说明](references/architecture_patterns.md)** — 六大模式的原理、实现方式和反模式。创建前通读，设计时对照参考。
- **[创建流程详细指南](references/creation_workflow.md)** — 五步流程的完整操作细节。执行 Step A-E 时按需读取对应章节。
- **[进度文件规范模板](references/progress_file_spec.md)** — 可复用的进度文件规范。Step B 后定制为目标 skill 的规范。
- **[质量检查清单](references/quality_checklist.md)** — 交付前逐项自检。Step E 完成后使用。

### 模板
- **[Skill 模板](assets/skill_template.md)** — SKILL.md 文件骨架，Step C 时参考
- **[Step 框架模板](assets/step_framework_template.md)** — 单步骤框架文件模板，Step D 时参考
- **[进度文件模板](assets/progress_template.md)** — 进度文件结构模板，Step E 时参考

### 脚本
- **`scripts/scaffold_workflow_skill.py`** — Step B 使用。`--name` `--steps` `--step-names` `--output` 四个参数，生成完整目录结构。`--help` 查看用法。
