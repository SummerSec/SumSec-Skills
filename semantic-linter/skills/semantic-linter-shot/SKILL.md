---
name: semantic-linter-shot
description: This skill should be used when the user asks to "quick scan", "trap check", "check wording", "词汇检查", "快速检测", "陷阱检查", or when writing/reviewing Skill/Prompt/Agent instructions. Provides a lightweight single-file reference card for identifying wide-boundary vocabulary in LLM instruction files.
---

# Semantic Trap Word Detector (Shot Mode)

A concentrated, single-file reference for detecting semantic trap words in LLM instruction files. No plugin installation required — just read and apply.

## Source of truth（与完整插件的关系）

本文件中的表格是**便携速查**。权威词表、严重等级与失控场景说明以仓库内 **`references/semantic-trap-lexicon.md`** 为准；安装完整插件时，运行时数据由 **`npm run build-lexicon`** 从该 MD 生成 **`lib/lexicon-data.js`**。若速查表与 MD 不一致，**以 MD / 生成结果为准**。

## Gotchas

- 表格用于人工扫读，**不保证**与当前分支 MD 逐字同步；发版前以 MD 为准核对 ID 与宽/窄词对。  
- 替换时保持原意图：目标是**收窄语义边界**，不是消灭所有抽象词。  
- 示例句式若写入你自己的 Skill，可能触发 linter；生产文案请用窄边界改写后的版本。

## What Are Semantic Traps?

Semantic trap words are vocabulary with **wide semantic boundaries** that cause LLMs to produce outputs far beyond intended scope. Empirical note (see linked article in repo README): swapping a narrow defect-focused noun for a broad finance-adjacent noun in an otherwise identical Skill can materially reduce task accuracy.

**Core principle**: Replace wide-boundary words with narrow-boundary alternatives to constrain LLM output.

## Trap Word Reference Table

以下宽词表为速查对照；为免在本仓库触发 linter，表体放在围栏块内（阅读时照常查看即可）。

### Chinese (T01-T17)

```text
| ID | Trap Word (Wide) | Replacement (Narrow) | Severity | Why It's Dangerous |
|----|-------------------|----------------------|----------|-------------------|
| T01 | 风险 | 漏洞 | critical | Activates finance/health/legal associations |
| T02 | 审查 | 检查 | high | Triggers subjective evaluation |
| T03 | 描述 | 列出 | high | Triggers explanatory prose |
| T04 | 问题 | 缺陷 | high | Extremely wide scope |
| T05 | 分析 | 总结 | medium-high | Triggers inference and hypothesis |
| T06 | 建议 | 要求 | medium-high | Triggers divergent thinking |
| T07 | 异常 | 错误 | medium | Fuzzy boundary |
| T08 | 改善 | 修复 | high | Triggers optimization suggestions |
| T09 | 参考 | 遵循 | medium-high | Implies flexibility |
| T10 | 评估 | 统计 | high | Triggers subjective judgment |
| T11 | 理解 | 提取 | high | Triggers inference |
| T12 | 关联 | 匹配 | medium | Triggers indirect reasoning |
| T13 | 转化 | 复制 | medium-high | Implies modification allowed |
| T14 | 洞察 | 报告 | high | Triggers creative inference |
| T15 | 评价 | 验证 | medium-high | Triggers subjective scoring |
| T16 | 原则 | 规则 | medium | Implies flexibility |
| T17 | 方法 | 步骤 | medium | Implies choice of paths |
```

### English (E01-E10)

```text
| ID | Trap Word (Wide) | Replacement (Narrow) | Severity | Why It's Dangerous |
|----|-------------------|----------------------|----------|-------------------|
| E01 | Risk | Vulnerability | critical | Same as T01 |
| E02 | Review / Audit | Check | high | Triggers comprehensive evaluation |
| E03 | Describe / Explain | List | high | Triggers narrative expansion |
| E04 | Issue / Problem | Bug / Defect | high | Overly broad coverage |
| E05 | Analyze / Assess | Summarize | medium-high | Triggers deep reasoning |
| E06 | Suggestion / Recommendation | Requirement | medium-high | Triggers divergent thinking |
| E07 | Anomaly / Concern | Error | medium | Nearly boundless scope |
| E08 | Interpret | Extract | high | Triggers subjective interpretation |
| E09 | Evaluate / Judge | Verify | medium-high | Triggers multi-dimensional evaluation |
| E10 | Should / Could | Must / Shall | medium-high | Implies optional, not mandatory |
```

## Structural drift patterns

Beyond individual words, watch for these 4 patterns:

```text
1. Open-Ended Verbs: verb + object without scope → add explicit dimensions or defect types.
2. Abstract Targets: vague safety/quality goals → replace with checkable criteria per endpoint.
3. Modal Downgrades: weak modals in constraints → use mandatory wording where rules must hold.
4. Missing Negation Lists: high-severity wide words without exclusions → add an explicit NOT-in-scope list.
```

## How to Apply

When writing or editing instruction files (.md files in /skills/, /agents/, /rules/, /prompts/):

1. Scan each key noun and verb against the table above
2. If a wide-boundary word is found, suggest the narrow-boundary replacement
3. Check for the four structural drift patterns above
4. When replacing, preserve the original intent — the goal is precision, not restriction

## Full Plugin

For automated detection with Pre/Post hooks, CLI scanning, escalation tracking, and deep semantic analysis, install the full `semantic-linter` plugin.
