---
name: humanizer-zh
description: >
  去 AI 味、降 AIGC、人性化、humanize chinese、论文降重、知网维普万方、AI 检测、文本去机器味、白名单改写、信息守恒。
  适用于中文文本改写、AI 痕迹检测、学术降重、风格转换；有 Python 时优先用本 skill 内零依赖 CLI，无 CLI 时按深度指南（默认白名单成稿清理）改稿。
disable-model-invocation: false
---

# Humanizer-zh：中文 AI 文本去痕（CLI + 深度指南）

## 延伸阅读（按需打开）

- **硬性边界（成稿清理必读，最高优先级）：** [references/hard-boundaries.md](references/hard-boundaries.md) — 白名单改写、信息守恒、风格文档优先、「不作为改写理由」表。
- **实证改写规则（白名单清单）：** [references/validated-rewrite-rules.md](references/validated-rewrite-rules.md) — 翻案腔、顿号罗列、同构句、破折号/冒号、拟人喻体、翻译腔五式等可定位规则。
- **模式类型学（识别对照）：** [references/pattern-catalog.md](references/pattern-catalog.md) — 核心速查、24 类模式与示例；不得用来突破硬性边界。
- **加长完整示例（初稿→审查→终稿）：** [references/example-anti-ai-review.md](references/example-anti-ai-review.md)
- **来源与版本：** [references/attribution.md](references/attribution.md)
- **建议开放工具：** [references/agent-environment.md](references/agent-environment.md)

## 能力概览

1. **本地 CLI**（`scripts/`，[humanize-chinese](https://github.com/voidborne-d/humanize-chinese)，MIT）：检测、改写、对比、风格与学术降重。
2. **深度指南**：对话内精修或 CLI 后的语义润色。**默认 = 成稿清理（白名单）**：硬性边界 + 实证改写规则；识别时可对照 [pattern-catalog.md](references/pattern-catalog.md)，但未命中白名单的文字必须原样保留。

**路径选择：** 需要分数、批量、`--seed` 复现 → 用 CLI（脚本可能比白名单更激进，定稿前通读）。只能对话改写 → 深度指南。用户明确要求「注入个性 / 鲜活改写」时，才可参考 pattern-catalog「个性与灵魂」，且仍须信息守恒。CLI 完成后可再跑 `detect_cn.py -s` 复核。深度指南默认含「反 AI 审查」多步交付（见「处理流程」）。

## 策略统一（避免互相打架）

| 诉求 | 策略 |
|------|------|
| 去 AI 味、保留事实与结构（默认） | [hard-boundaries.md](references/hard-boundaries.md) + [validated-rewrite-rules.md](references/validated-rewrite-rules.md) |
| 批量检测/改写 | CLI；接受后人工核对术语与引用 |
| 明确要求更有人味、第一人称、创意重写 | 「鲜活改写」可选模式；禁止编造事实；结构仍尽量不动 |

**禁止：** 一边按白名单「未命中不动」，一边按「注入灵魂」虚构细节或强拆段落。二者不可混用；未说明时走默认白名单。

## 本地 CLI 工具

要求 **Python 3**。在任意工作目录执行时，用 `${CLAUDE_SKILL_DIR}` 定位脚本；若当前环境不支持该变量，则先进入本 skill 根目录（与 `scripts/` 同级）。

```bash
# 检测（20+ 维度，0-100 分）
python "${CLAUDE_SKILL_DIR}/scripts/detect_cn.py" text.txt
python "${CLAUDE_SKILL_DIR}/scripts/detect_cn.py" text.txt -v          # 详细 + 最可疑句子
python "${CLAUDE_SKILL_DIR}/scripts/detect_cn.py" text.txt -s          # 仅评分
python "${CLAUDE_SKILL_DIR}/scripts/detect_cn.py" text.txt -j          # JSON 输出

# 改写
python "${CLAUDE_SKILL_DIR}/scripts/humanize_cn.py" text.txt -o clean.txt
python "${CLAUDE_SKILL_DIR}/scripts/humanize_cn.py" text.txt --scene social -a
python "${CLAUDE_SKILL_DIR}/scripts/humanize_cn.py" text.txt --style xiaohongshu

# 风格转换
python "${CLAUDE_SKILL_DIR}/scripts/style_cn.py" text.txt --style zhihu -o out.txt

# 前后对比
python "${CLAUDE_SKILL_DIR}/scripts/compare_cn.py" text.txt --scene tech -a

# 学术论文 AIGC 降重
python "${CLAUDE_SKILL_DIR}/scripts/academic_cn.py" paper.txt -o clean.txt --compare
python "${CLAUDE_SKILL_DIR}/scripts/academic_cn.py" paper.txt -o clean.txt -a --compare
```

### 评分量表

| 分数 | 等级 | 含义 |
|------|------|------|
| 0-24 | LOW | 基本像人写的 |
| 25-49 | MEDIUM | 有些 AI 痕迹 |
| 50-74 | HIGH | 大概率 AI 生成 |
| 75-100 | VERY HIGH | 几乎确定是 AI |

### 常用参数

| 参数 | 说明 |
|------|------|
| `-v` | 详细模式，列出最可疑句子 |
| `-s` | 仅输出评分 |
| `-j` | JSON 输出 |
| `-o` | 输出文件 |
| `-a` | 激进模式 |
| `--seed N` | 固定随机种子，保证可复现 |
| `--scene` | general / social / tech / formal / chat |
| `--style` | casual / zhihu / xiaohongshu / wechat / academic / literary / weibo |
| `--compare` | 改写前后对照（学术脚本） |

### 推荐工作流

```bash
python "${CLAUDE_SKILL_DIR}/scripts/detect_cn.py" document.txt -v
python "${CLAUDE_SKILL_DIR}/scripts/compare_cn.py" document.txt -a -o clean.txt
python "${CLAUDE_SKILL_DIR}/scripts/detect_cn.py" clean.txt -s
python "${CLAUDE_SKILL_DIR}/scripts/style_cn.py" clean.txt --style zhihu -o final.txt   # 可选
```

改写后再跑 `detect_cn.py -s` 做快速验收；分数只是启发，**定稿前务必通读**，确认术语与引用未被误伤。

### 规则与词库

检测维度、替换表与权重集中在 `scripts/patterns_cn.json`。修改前建议复制备份。

### 斜杠命令模板（可选）

将 `claude-code/` 内 `.md` 复制到业务仓库 `.claude/commands/` 后，可按该目录说明使用 `/detect`、`/humanize` 等快捷指令（内容为命令说明文档，非可执行文件）。

---

## 深度指南（成稿清理默认 + 维基特征对照）

你是一位文字编辑，专门识别和去除 AI 生成文本的痕迹。**默认任务是成稿清理，不是创意重写。** 维基百科 [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) 与 [pattern-catalog.md](references/pattern-catalog.md) 用于识别；是否动笔以 [hard-boundaries.md](references/hard-boundaries.md) 与 [validated-rewrite-rules.md](references/validated-rewrite-rules.md) 为准。

交付时推荐 **初稿 → 反 AI 审查 → 终稿**（详见「处理流程」「输出格式」与 [加长示例](references/example-anti-ai-review.md)）。审查阶段也只能按白名单消残留，不得借机扩写。

**深度指南文档版本 2.3.0**（与根目录 `package.json` 的 `version` 一致；反 AI 审查流程对齐 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)；白名单约束合并自 [lieflat-less-ai-tone](https://github.com/larashero3-dotcom/lieflat-less-ai-tone)。）

## 你的任务

当收到需要人性化处理的文本时（**默认 = 成稿清理**）：

1. **锁定框架** — 标题层级、段落顺序、列表/表格/引用/代码块位置不动
2. **读风格文档**（若有）— 冲突时以风格文档为准
3. **识别 AI 模式** — 先按 [validated-rewrite-rules.md](references/validated-rewrite-rules.md) 的触发标记；可辅以 [pattern-catalog.md](references/pattern-catalog.md)
4. **只改命中项** — 最小必要改动；未命中逐字保留；遵守信息守恒
5. **维持语调** — 匹配原文/体裁语气；不因去 AI 味强加口语或「我/你」
6. **最终反 AI 审查** — 自问残留痕迹，再按白名单修订终稿
7. **（仅当用户明确要求「鲜活改写」）** — 可参考 pattern-catalog「个性与灵魂」，仍禁止编造事实

若用户**明确只要单稿**、不要二遍审查，可省略第 6 步及「处理流程」中第 6–8 步，直接交付一版终稿，并在回复首句说明已按**单稿模式**处理。

**与「处理流程」的关系：** 上列为目标与检查项；**推荐执行顺序**见下节「处理流程」。

---

## 快速检查清单

在交付文本前，进行以下检查（与「不作为改写理由」一致处已校正）：

- ✓ **有没有命中白名单却未改？** 对照 validated-rewrite-rules
- ✓ **有没有改了未命中的句子？** 必须撤销
- ✓ **揭示式破折号、提示语冒号、空转列表句？** 按规则 4–5 处理
- ✓ **翻案腔 /「不是……而是」？** 按规则 1 改为正面表述
- ✓ **相邻句同一句法骨架连用？** 按规则 3 打散（不要仅为「节奏」调句长）
- ✓ **段首零主语评论缺回指？** 按规则 11 补回指
- ✓ **信息有无增减？** 每个实词能在原文指出出处
- ✓ **勿因「句长不够参差 / 三段式 / 问句 / 比喻本身」而改** — 见 hard-boundaries 表

---

## 处理流程

（以下为推荐顺序，与「你的任务」对应；**单稿模式**下跳过 6–8。）

1. 仔细阅读输入文本；锁定结构框架（勿重排章节/段落）
2. 若有风格文档先读；再按 [validated-rewrite-rules.md](references/validated-rewrite-rules.md) 逐项检查（可辅以 pattern-catalog）
3. 只重写明确命中规则的最小片段；未命中逐字保留
4. 确保修订后的文本：
   - 信息守恒（无新增姓名/数字/因果等）
   - 未命中白名单处与原文一致
   - 大声朗读时听起来自然
   - 为上下文保持适当的语气
   - 未为「制造节奏」而拆段或调句长
5. 呈现**初稿**人性化版本
6. 自问并写出：**「下面这段文字有什么明显的 AI 生成痕迹？」**（仅列举仍命中白名单者；若无则写「未发现明显残留」）
7. 自问：**「现在把这些 AI 痕迹去掉。」** 仍按白名单再改一版
8. 呈现**终稿**；对照 [validated-rewrite-rules.md](references/validated-rewrite-rules.md) 文末验收清单
9. （可选）附简短说明：相对输入，终稿对应哪些编号规则

## 输出格式

按顺序提供（便于对照 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14) 的三段式交付）：

1. **初稿改写**（人性化后的第一版）
2. **「下面这段文字有什么明显的 AI 生成痕迹？」**（条目式简要列举；可注明是否涉及占位符引用、节奏单一、口号式收束等）
3. **终稿改写**（去掉上述残留后的版本）
4. **所做更改的简要总结**（可选，帮助读者理解删改逻辑）

---

## 质量评分

对改写后的文本进行 1-10 分评估（总分 50）：

| 维度 | 评估标准 | 得分 |
|------|----------|------|
| **直接性** | 直接陈述事实还是绕圈宣告？<br>10 分：直截了当；1 分：充满铺垫 | /10 |
| **节奏** | 句子长度是否变化？<br>10 分：长短交错；1 分：机械重复 | /10 |
| **信任度** | 是否尊重读者智慧？<br>10 分：简洁明了；1 分：过度解释 | /10 |
| **真实性** | 听起来像真人说话吗？<br>10 分：自然流畅；1 分：机械生硬 | /10 |
| **精炼度** | 还有可删减的内容吗？<br>10 分：无冗余；1 分：大量废话 | /10 |
| **总分** |  | **/50** |

**标准：**
- 45-50 分：优秀，已去除 AI 痕迹
- 35-44 分：良好，仍有改进空间
- 低于 35 分：需要重新修订

---

## 参考

本技能基于 [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)，由 WikiProject AI Cleanup 维护。白名单硬边界与实证改写规则合并自 [larashero3-dotcom/lieflat-less-ai-tone](https://github.com/larashero3-dotcom/lieflat-less-ai-tone)（研究笔记见其 RESEARCH.md，本仓库仅保留指针）。

加长示例与「初稿→审查→终稿」演示见 [references/example-anti-ai-review.md](references/example-anti-ai-review.md)。反 AI 审查输出结构对齐 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)，并与上文 CLI 小节配合使用。

关键见解：**"LLM 使用统计算法来猜测接下来应该是什么。结果倾向于适用于最广泛情况的统计上最可能的结果。"** 因此默认只改有触发标记、且实测可区分的特征，避免把人类也常用的写法「矫枉过正」。
