# 会话审计：数据源、八维分析与报告模板

本文件承接 `SKILL.md` **路径 B（只读审计）** 的细则；执行路径 B 时必须跑满八维，不得省略；若缺少会话或目录权限，对应小节写 `N/A — insufficient session data`。

## Data Sources

按当前环境检测存在的目录，可并行扫描多个来源：

| Source | Claude Code | Codex | Shared |
|--------|-------------|-------|--------|
| Session transcripts | `~/.claude/projects/**/*.jsonl` | `~/.codex/sessions/**/*.jsonl` | — |
| Skill files | `~/.claude/skills/*/SKILL.md` | `~/.codex/skills/*/SKILL.md` | `~/.agents/skills/*/SKILL.md` |

**Platform detection:** 检查上述目录是否存在；用户可能同时安装 Claude Code 与 Codex，应对所有可用来源去重（同名 skill 多路径视为同一 skill）。

## Path B Workflow Detail

```
Identify target skills
        ↓
Collect session data（可用 python3 + Bash 扫描 JSONL）
        ↓
Run 8 analysis dimensions（本节下文）
        ↓
Compute composite scores
        ↓
Output report with P0 / P1 / P2
```

### Step 1: Identify Target Skills

扫描 skill 目录顺序：`~/.claude/skills/` → `~/.codex/skills/` → `~/.agents/skills/`。按 skill **name** 去重。对每个 `SKILL.md` 提取：

- `name`、`description`（YAML frontmatter）
- 触发关键词（来自 description）
- 工作流步骤（Step 1/2/3… 或 Workflow 下 ###）
- 字数

若用户指定 skill 名，仅保留这些。

### Step 2: Collect Session Data

使用 python3 脚本经 Bash 扫描会话 JSONL。

**Claude Code**（`~/.claude/projects/**/*.jsonl`）：

- `Skill` tool_use 调用（哪些 skill 被调用）
- 用户消息全文
- skill 调用后的 assistant / user 消息（工作流与反应分析）

**Codex**（`~/.codex/sessions/**/*.jsonl`）：

- `session_meta` → `base_instructions`（skill 加载证据）
- `response_item` → assistant 输出
- `event_msg` → 工具与 skill 相关事件
- `turn_context` → 用户消息

**注意：** Codex 将 skill 注入上下文，未必有显式 `Skill` 调用。**加载 ≠ 已按 skill 执行**。判定「已按某 skill 工作」时，应在同一会话的 `response_item` 中检索该 skill 定义的工作流标记（步骤标题、规定输出格式等）。

**汇总指标（按 skill）：**

- 调用次数、触发词在用户消息中的匹配次数
- 调用后用户反应
- 工作流步骤完成标记

### Step 3: Eight Dimensions（必须全部执行）

**不得跳过 4.2、4.3、4.5b、4.8**（无 skill 时最易被省略，但价值最高）。

#### 4.1 Trigger Rate

实际调用次数 vs 用户消息中触发词出现次数。

- **Claude Code：** 统计 transcripts 中 `Skill` tool_use。
- **Codex：** 统计「assistant 输出符合该 skill 工作流标记」的会话数（非仅 base_instructions 中出现）。

**诊断：** 从未触发；关键词匹配 ≫ 实际调用（欠触发）；高频核心 skill。

#### 4.2 Post-Invocation User Reaction

每次 skill 调用后，读用户**随后 3 条**消息，分类：

- **Negative**：no、wrong、never mind、not what I wanted、用户打断等
- **Correction**：用户重述意图、覆盖 skill 输出
- **Positive**：good、ok、continue、nice、用户跟随工作流
- **Silent switch**：用户完全换题（可能误触发）

输出按 skill 的满意度类统计。

#### 4.3 Workflow Completion Rate

对每个会话中的 skill 调用：

1. 从 SKILL.md 提取定义步骤
2. 在同会话 assistant 消息中搜步骤标记 / 规定格式
3. 计算完成到哪一步

报告示例：`{skill-name} (N steps): avg completed Step X/N (Y%)`。若某步频繁中断，单独标出。

#### 4.4 Static Quality Analysis

对每个 SKILL.md 做静态检查（14 条）：

| Check | Pass Criteria |
|-------|----------------|
| Frontmatter format | 仅 `name` + `description`，总长小于 1024 字符 |
| Name format | 字母、数字、连字符 |
| Description trigger | 以 "Use when..." 或有明确触发条件（中文 skill 可为「用于…当…」类等价表述） |
| Description workflow leak | description **不**概括正文工作流步骤（CSO 违规） |
| Description pushiness | 不过度「推销」使用场景 |
| Overview section | 有概述类区块（或等价标题） |
| Rules section | 有规则 / 约束类区块（或等价） |
| MUST/NEVER density | 统计全大写指令词；超过 5 个/100 英文词标出；建议改为可执行亮线规则 |
| Word count | SKILL.md 正文过长标出（如超过 500 英文词或明显臃肿） |
| Narrative anti-pattern | 避免「某次会话我们发现…」类叙事型 skill |
| YAML quoting safety | description 含 `: ` 时必须双引号包裹，否则 YAML 解析失败导致 skill 不可见 |
| Critical info position | 核心触发与主动作应在 SKILL.md 前约 20% 篇幅内（Lost in the Middle） |
| Description 250-char check | 主触发词宜落在 description **前 250 字符**内（多数客户端列表截断） |
| Trigger condition count | description 中触发条件宜 ≤2 条（IFEval：多约束易失效） |

#### 4.5a False Positive Rate (Overtrigger)

Skill 已调用但用户立即拒绝或忽略。

#### 4.5b Undertrigger Detection

从每个 skill 提取 **能力关键词**（能做什么，不仅是触发词）。扫描用户消息：任务匹配能力但 **未** 调用该 skill 的案例。

报告：应触发却未触发的**用户原句引用** + description 改写**建议**（建议口吻，非命令）。

**复合风险：** 连续多会话有相关任务但 0 触发 → 标为 compounding risk，欠触发 skill 难以从使用反馈中自愈，description 重写可标 P0。

#### 4.6 Cross-Skill Conflicts

两两比较：触发词重叠、工作流重叠、指导矛盾。

#### 4.7 Environment Consistency

从 skill 抽取路径、CLI、目录引用；检查存在性（`test -e`、`which` 等）。标出失效引用。

#### 4.8 Token Economics

按 skill：字数、触发频率、cost-effectiveness = 触发次数 / 字数；大且从未触发 → 建议压缩或移除。

**渐进披露：** Tier1 frontmatter；Tier2 SKILL 主体（如建议少于约 500 行量级）；Tier3 references 按需加载。正文塞满长文且不用 reference → 标 poor progressive disclosure。

### Step 4: Composite Score

5 分制综合分：

| Score | Meaning |
|-------|---------|
| 5 | 健康：触发高、反应正、工作流完整、静态干净 |
| 4 | 良好：1–2 维小问题 |
| 3 | 需关注：一维明显缺口或多维轻微缺口 |
| 2 | 问题大：从不触发、或负向反应、或静态严重问题 |
| 1 | 失效：不可用、引用缺失、或根本错配 |

**计分维度（加权）：** Trigger 25%；User reaction 20%；Workflow completion 15%；Static 15%；Undertrigger 15%；Token 10%。

**定性报告（不参与加权）：** 4.5a Overtrigger；4.6 Conflicts；4.7 Environment。

某维无数据 → 标 `N/A` 并说明权重如何处理（如均分剩余权重或注明未计入）。

## Report Format

输出报告使用下列骨架（中英文标题可随用户语言调整，维度须齐全）：

```markdown
# Skill Optimization Report
**Date**: {date}
**Scope**: {all / specified skills}
**Session data**: {N} sessions, {date range}

## Overview
| Skill | Triggers | Reaction | Completion | Static | Undertrigger | Token | Score |
|-------|----------|----------|------------|--------|--------------|-------|-------|
| example-skill | 2 | 100% | 86% | B+ | 1 miss | 486w | 4/5 |

## P0 Fixes (blocking usage)
1. ...

## P1 Improvements (better experience)
1. ...

## P2 Optional Optimizations
1. ...

## Per-Skill Diagnostics
### {skill-name}
#### 4.1 Trigger Rate
...
#### 4.2 User Reaction
...
（4.1–4.8 全部给出；无数据写 N/A — insufficient session data）
```

## Path B Rules（与 SKILL.md 一致处不重复）

- **Read-only**：路径 B **不得**修改任何 skill 文件，只输出报告。
- **八维齐全**：不得省略维度；无数据写 N/A。
- **量化**：优先给出次数、比例、日期范围，避免「经常」等模糊表述。
- **建议不命令**：description 改写用建议语气，并附依据（见下）。
- **证据**：欠触发须引用**真实用户原句**；改写建议须点明对应研究发现或静态规则条目。

## Research Background

- **Undertrigger**：Memento-Skills（arXiv:2603.18743）— 结构化 skill 依赖路由；未被检索则难以通过使用反馈自愈。
- **Description 质量**：MCP Description Quality（arXiv:2602.18914）— 良好描述可显著提高工具/技能被选率。
- **信息位置**：Lost in the Middle（Liu et al., TACL 2024）。
- **格式影响**：He et al.（arXiv:2411.10541）。
- **多约束**：IFEval（arXiv:2311.07911）。

上游参考：[hqhq1025/skill-optimizer](https://github.com/hqhq1025/skill-optimizer)（经 [xget 镜像](https://xget.sumsec.me/gh/hqhq1025/skill-optimizer/raw/refs/heads/main/skills/skill-optimizer/SKILL.md) 对齐）。
