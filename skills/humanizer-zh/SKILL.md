---
name: humanizer-zh
description: >
  去 AI 味、降 AIGC、人性化、humanize chinese、论文降重、知网维普万方、AI 检测、文本去机器味。
  有 Python 时优先用本 skill 内零依赖 CLI（评分、改写、学术、风格）；无 CLI 时在对话中按深度指南改稿。
  二十四类模式与长示例在 references 直链 Markdown 中，深度改稿前须打开 pattern-catalog。
---

# Humanizer-zh：中文 AI 文本去痕（CLI + 深度指南）

## 延伸阅读（按需打开）

- **模式类型学（深度改稿前必读）：** [references/pattern-catalog.md](references/pattern-catalog.md) — 核心速查、个性与灵魂、24 类模式与示例。
- **加长完整示例（初稿→审查→终稿）：** [references/example-anti-ai-review.md](references/example-anti-ai-review.md)
- **来源与版本：** [references/attribution.md](references/attribution.md)
- **建议开放工具：** [references/agent-environment.md](references/agent-environment.md)

## 能力概览

1. **本地 CLI**（`scripts/`，[humanize-chinese](https://github.com/voidborne-d/humanize-chinese)，MIT）：检测、改写、对比、风格与学术降重。
2. **深度指南**：对话内精修或 CLI 后的语义润色；识别与归类模式时**必须**对照 [references/pattern-catalog.md](references/pattern-catalog.md)。

**路径选择：** 需要分数、批量、`--seed` 复现 → 用 CLI。只能对话改写或需维基式细颗粒度核对 → 深度指南。CLI 完成后可再跑 `detect_cn.py -s` 复核。深度指南默认含「反 AI 审查」多步交付（见「处理流程」）。

## 本地 CLI 工具

在 **本 skill 根目录**（与 `scripts/` 同级的目录）下执行。要求 **Python 3**。

```bash
# 检测（20+ 维度，0-100 分）
python scripts/detect_cn.py text.txt
python scripts/detect_cn.py text.txt -v          # 详细 + 最可疑句子
python scripts/detect_cn.py text.txt -s          # 仅评分
python scripts/detect_cn.py text.txt -j          # JSON 输出

# 改写
python scripts/humanize_cn.py text.txt -o clean.txt
python scripts/humanize_cn.py text.txt --scene social -a
python scripts/humanize_cn.py text.txt --style xiaohongshu

# 风格转换
python scripts/style_cn.py text.txt --style zhihu -o out.txt

# 前后对比
python scripts/compare_cn.py text.txt --scene tech -a

# 学术论文 AIGC 降重
python scripts/academic_cn.py paper.txt -o clean.txt --compare
python scripts/academic_cn.py paper.txt -o clean.txt -a --compare
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
python scripts/detect_cn.py document.txt -v
python scripts/compare_cn.py document.txt -a -o clean.txt
python scripts/detect_cn.py clean.txt -s
python scripts/style_cn.py clean.txt --style zhihu -o final.txt   # 可选
```

改写后再跑 `detect_cn.py -s` 做快速验收；分数只是启发，**定稿前务必通读**，确认术语与引用未被误伤。

### 规则与词库

检测维度、替换表与权重集中在 `scripts/patterns_cn.json`。修改前建议复制备份。

### 斜杠命令模板（可选）

将 `claude-code/` 内 `.md` 复制到业务仓库 `.claude/commands/` 后，可按该目录说明使用 `/detect`、`/humanize` 等快捷指令（内容为命令说明文档，非可执行文件）。

---

## 深度指南（维基百科「AI 写作特征」向）

你是一位文字编辑，专门识别和去除 AI 生成文本的痕迹，使文字听起来更自然、更有人味。本小节基于维基百科的"AI 写作特征"页面，由 WikiProject AI Cleanup 维护。

除打开并遵循 [references/pattern-catalog.md](references/pattern-catalog.md) 外，交付时还推荐 **初稿 → 反 AI 审查 → 终稿**（详见「处理流程」「输出格式」与 [加长示例](references/example-anti-ai-review.md)）。

**深度指南文档版本 2.2.0**（与根目录 `package.json` 的 `version` 一致；反 AI 审查流程对齐 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)。）

## 你的任务

当收到需要人性化处理的文本时：

1. **识别 AI 模式** — 对照 [references/pattern-catalog.md](references/pattern-catalog.md) 扫描
2. **重写问题片段** — 用自然的替代方案替换 AI 痕迹
3. **保留含义** — 保持核心信息完整
4. **维持语调** — 匹配预期的语气（正式、随意、技术等）
5. **注入灵魂** — 不仅要去除不良模式，还要注入真实的个性
6. **最终反 AI 审查** — 对初稿自问：「下面这段文字有什么明显的 AI 生成痕迹？」简要列出残留；再自问：「现在把这些 AI 痕迹去掉。」并修订为终稿

若用户**明确只要单稿**、不要二遍审查，可省略第 6 步及「处理流程」中第 6–8 步，直接交付一版终稿，并在回复首句说明已按**单稿模式**处理。

**与「处理流程」的关系：** 上列为目标与检查项；**推荐执行顺序**见下节「处理流程」。

---

## 快速检查清单

在交付文本前，进行以下检查：

- ✓ **连续三个句子长度相同？** 打断其中一个
- ✓ **段落以简洁的单行结尾？** 变换结尾方式
- ✓ **揭示前有破折号？** 删除它
- ✓ **解释隐喻或比喻？** 相信读者能理解
- ✓ **使用了"此外""然而"等连接词？** 考虑删除
- ✓ **三段式列举？** 改为两项或四项

---

## 处理流程

（以下为推荐顺序，与「你的任务」对应；**单稿模式**下跳过 6–8。）

1. 仔细阅读输入文本
2. 识别模式实例（对照 [references/pattern-catalog.md](references/pattern-catalog.md)）
3. 重写每个有问题的部分
4. 确保修订后的文本：
   - 大声朗读时听起来自然
   - 自然地改变句子结构
   - 使用具体细节而不是模糊的主张
   - 为上下文保持适当的语气
   - 适当时使用简单的结构（是/有）
5. 呈现**初稿**人性化版本
6. 自问并写出：**「下面这段文字有什么明显的 AI 生成痕迹？」**（简要列举；若无则写「未发现明显残留」并说明依据）
7. 自问：**「现在把这些 AI 痕迹去掉。」** 据此再改一版
8. 呈现**终稿**（经过上述审查后修订）
9. （可选）附简短说明：相对输入，终稿做了哪些类型的删改

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

本技能基于 [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)，由 WikiProject AI Cleanup 维护。那里记录的模式来自对维基百科上数千个 AI 生成文本实例的观察。

加长示例与「初稿→审查→终稿」演示见 [references/example-anti-ai-review.md](references/example-anti-ai-review.md)。反 AI 审查输出结构对齐 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)，并与上文 CLI 小节配合使用。

关键见解：**"LLM 使用统计算法来猜测接下来应该是什么。结果倾向于适用于最广泛情况的统计上最可能的结果。"**
