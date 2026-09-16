# Humanizer-zh: AI 写作去痕工具（中文版）

> **声明：**
> - **深度编辑指南**（`SKILL.md` 主体）翻译自 [blader/humanizer](https://github.com/blader/humanizer/tree/main)，并参考 [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
> - 原项目基于维基百科的 [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) 指南
> - **本地 CLI**（`scripts/`、`examples/`、`evals/`、`claude-code/`）合并自 [voidborne-d/humanize-chinese](https://github.com/voidborne-d/humanize-chinese)（MIT，详见仓库内 [NOTICE](NOTICE)）
> - **「反 AI 审查」二遍流程**（初稿 → 自问残留痕迹 → 终稿）与加长示例，同步自 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)
> - **白名单硬边界 / 实证改写规则 /「不作为改写理由」** 合并自 [larashero3-dotcom/lieflat-less-ai-tone](https://github.com/larashero3-dotcom/lieflat-less-ai-tone)（MIT；见 `references/hard-boundaries.md`、`references/validated-rewrite-rules.md`）

---

## 项目简介

Humanizer-zh 用于去除文本中的 AI 生成痕迹，包含两条路径：

1. **Python CLI（零 pip 依赖）**：对中文文本做 0–100 评分、改写、学术降 AIGC、风格转换等，适合批量与可复现流程。
2. **Agent / 对话内指南**：按 `SKILL.md` 深度指南改写。**默认是成稿清理（白名单）**：只改有触发标记的实证规则，未命中原文逐字保留，信息守恒、结构不动；适合无法执行脚本或需要细颗粒度核对的场景。

对话内指南还强调 **最终「反 AI 审查」**：在人性化初稿之后，再问「仍有哪些明显的 AI 痕迹？」并据此修订为终稿。审查阶段同样受白名单约束，避免借机扩写或「注入」原文没有的细节。

适用场景包括：编辑审阅、论文/营销文案去「机器味」、成稿清理、学习常见 AI 句式等。

## 本地 CLI 速览

在 **`humanizer-zh` 目录**下执行（需本机已安装 **Python 3**）：

```bash
python scripts/detect_cn.py examples/sample_general.txt -s
python scripts/humanize_cn.py examples/sample_general.txt -o out.txt
python scripts/academic_cn.py examples/sample_academic.txt --compare
```

完整参数、工作流与评分含义见 `SKILL.md` 开头「本地 CLI 工具」一节；规则与词库在 `scripts/patterns_cn.json`。

## 安装

### 方法一：通过 npx 一键安装（推荐）

```bash
npx skills add https://github.com/op7418/Humanizer-zh.git
```

这是最简单的安装方式，会自动将技能安装到正确的目录。

### 方法二：通过 Git 克隆

```bash
# 克隆到 Claude Code 的 skills 目录
git clone https://github.com/op7418/Humanizer-zh.git ~/.claude/skills/humanizer-zh
```

### 方法三：手动安装

1. 下载本项目的 ZIP 文件或克隆到本地
2. 将 `Humanizer-zh` 文件夹复制到 Claude Code 的 skills 目录：
   - **macOS/Linux**: `~/.claude/skills/`
   - **Windows**: `%USERPROFILE%\.claude\skills\`

3. 确保文件夹结构如下（须保留整个目录，含 `references/` 与 `scripts/`）：
   ```
   ~/.claude/skills/humanizer-zh/
   ├── SKILL.md
   ├── README.md
   ├── references/
   ├── scripts/
   └── …
   ```

### 验证安装

重启 Claude Code 或重新加载 skills 后，在对话中输入：

```
/humanizer-zh
```

如果安装成功，该技能将被激活。

## 使用

### 基础用法

在 Claude Code 中，你可以通过以下方式使用 Humanizer：

#### 1. 直接调用技能

```
/humanizer-zh 请帮我人性化以下文本：

[粘贴你的 AI 生成文本]
```

#### 2. 在对话中使用

```
请用 humanizer 帮我改写这段话，让它更自然：

这个项目作为我们团队致力于创新的证明。此外，它展示了我们在不断演变的技术格局中的关键作用。
```

#### 3. 处理文件内容

```
/humanizer-zh 请人性化 article.md 文件中的内容
```

### 使用场景示例

#### 场景 1：改写营销文案

**输入：**
```
/humanizer-zh
坐落在风景如画的杭州市中心，这家咖啡馆拥有丰富的文化底蕴和令人叹为观止的装饰。它作为城市咖啡文化的焦点，为顾客提供无缝、直观和充满活力的体验。
```

**输出示例：**
> 这家咖啡馆在杭州市中心开了三年，以手冲咖啡和老建筑改造的空间出名。

#### 场景 2：改写学术摘要

**输入：**
```
/humanizer-zh
本研究深入探讨了机器学习在医疗诊断中的关键作用，突出了其在不断演变的医疗格局中的重要性。此外，它为该领域的未来发展奠定了坚实的基础。
```

**输出示例：**
> 本研究分析了机器学习在医疗诊断中的应用，重点是肺癌早期筛查。研究使用了 2019-2023 年间 5000 例病历数据。

#### 场景 3：改写博客文章

**输入：**
```
/humanizer-zh
人工智能不仅仅是一种技术，它是我们思考未来的方式的革命。行业专家认为这将对整个社会产生持久影响。
```

**输出示例：**
> 我一直在想 AI 会怎么改变我们的工作方式。上周和几个做产品的朋友聊，有人觉得很兴奋，有人担心失业，大概率真相在中间某个无聊的地方。

## 检测的 AI 写作模式

本工具能够识别并修复 **24 种** AI 写作痕迹，分为四大类：

### 📝 内容模式（6种）
1. 过度强调意义、遗产和更广泛的趋势
2. 过度强调知名度和媒体报道
3. 以 -ing 结尾的肤浅分析
4. 宣传和广告式语言
5. 模糊归因和含糊措辞
6. 提纲式的"挑战与未来展望"部分

### 🔤 语言和语法模式（6种）
7. 过度使用的"AI 词汇"
8. 避免使用"是"（系动词回避）
9. 否定式排比
10. 三段式法则过度使用
11. 刻意换词（同义词循环）
12. 虚假范围

### 🎨 风格模式（6种）
13. 破折号过度使用
14. 粗体过度使用
15. 内联标题垂直列表
16. 标题中的标题大写
17. 表情符号
18. 弯引号

### 💬 交流模式和填充词（6种）
19. 协作交流痕迹
20. 知识截止日期免责声明
21. 谄媚/卑躬屈膝的语气
22. 填充短语
23. 过度限定
24. 通用积极结论

## 文件说明

- **`SKILL.md`** - 技能入口：仅 `name` + `description` 的 frontmatter；CLI 与深度指南主流程；策略统一表；**必读链接**指向 `references/`
- **`references/hard-boundaries.md`** - 硬性边界、信息守恒、风格文档优先、「不作为改写理由」表（成稿清理最高优先级）
- **`references/validated-rewrite-rules.md`** - 实证改写规则白名单与验收清单（来自 lieflat-less-ai-tone）
- **`references/pattern-catalog.md`** - 核心速查、24 类模式与示例；「个性与灵魂」仅鲜活改写可选
- **`references/example-anti-ai-review.md`** - 加长「初稿→审查→终稿」完整示例
- **`references/attribution.md`** - 上游来源与文档版本
- **`references/agent-environment.md`** - 建议工具列表（原 YAML `allowed-tools`）
- **`README.md`** - 本说明文档
- **`scripts/`** - 检测、改写、学术、风格等 Python 脚本及 `patterns_cn.json`、`ngram_freq_cn.json`（未改）
- **`examples/`** - 示例输入文本
- **`evals/`** - 评测用数据
- **`claude-code/`** - 可复制到业务仓库 `.claude/commands/` 的斜杠命令说明
- **`package.json`** - 可选 `npm run detect|humanize|...` 快捷方式（底层仍为 `python scripts/...`）
- **`NOTICE`** - 第三方来源说明（humanize-chinese + lieflat-less-ai-tone）

**注：** 英文原版 humanizer 请参考 [blader/humanizer](https://github.com/blader/humanizer)

## 手动使用方法

### 基本流程（默认成稿清理）

1. **锁定框架** - 不重排标题/段落/列表等结构
2. **识别 AI 模式** - 先按 `references/validated-rewrite-rules.md` 触发标记；可辅以 pattern-catalog
3. **只改命中项** - 最小必要改动；未命中逐字保留
4. **信息守恒** - 不增删事实、数字、限定词
5. **维持适当语调** - 服从原体裁；不强加口语或「我/你」
6. **最终反 AI 审查** - 自问残留痕迹，仍按白名单修订终稿

用户**明确**要求「鲜活改写」时，才可参考 pattern-catalog「个性与灵魂」，且仍禁止编造事实。

### 关键原则

#### ✨ 默认要「干净且守恒」，鲜活是可选

成稿清理优先遵守硬性边界与「不作为改写理由」表（不要为节奏改句长、不要删问句/比喻本身、不要补虚词装人话）。

仅在用户要求鲜活改写时：

- **有观点** - 基于原文已有立场，不要捏造反应
- **句间同构才动** - 打散相邻句同一骨架；勿为参差而拆段
- **承认复杂性** - 保留原文的限定与让步
- **适当使用"我"** - 仅当体裁/用户允许
- **对感受要具体** - 只用原文已有的具体材料，禁止造细节

#### 示例对比（初稿 → 审查 → 终稿）

**改写前（AI 味道）：**
> 新的软件更新作为公司致力于创新的证明。此外，它提供了无缝、直观和强大的用户体验——确保用户能够高效地完成目标。这不仅仅是一次更新，而是我们思考生产力方式的革命。

**初稿改写（人性化）：**
> 软件更新添加了批处理、键盘快捷键和离线模式。来自测试用户的早期反馈是积极的，大多数报告任务完成速度更快。

**反 AI 审查：** 节奏仍偏匀整；「来自测试用户的早期反馈是积极的」带报告腔，略像模板句。

**终稿改写：**
> 这次更新加了批处理和键盘快捷键。测试用户说比之前快，主要是批处理省了重复操作的时间。

**变化：**
- 删除了夸大的象征意义（"作为……的证明"）
- 删除了 AI 词汇（"此外"、"无缝"）
- 删除了三段式法则（"无缝、直观和强大"）
- 删除了否定式排比（"不仅仅是……而是……"）
- 添加了具体功能和真实反馈
- 经二次审查去掉残留的报告腔与过匀节奏

更长、多模式叠合的完整示例见 `SKILL.md` 末尾「完整示例」一节。

## 版本历史

- **2.3.0** — 合并 [lieflat-less-ai-tone](https://github.com/larashero3-dotcom/lieflat-less-ai-tone)：硬性边界、信息守恒、「不作为改写理由」、实证改写规则白名单；默认成稿清理与「鲜活改写」策略分离；CLI 脚本未改
- **2.2.0+**（SumSec-Skills 内演进）— 按 skill-optimizer 路径 A：**frontmatter 仅 `name`/`description`**；24 类模式与长示例迁至 `references/`；工具与来源元数据迁至 `references/agent-environment.md`、`references/attribution.md`
- **2.2.0**（见 `SKILL.md` 深度指南与根目录 `package.json`）— 同步 [Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)：最终「反 AI 审查」+ 三段式交付（初稿 / 痕迹列举 / 终稿），加长完整示例
- **2.1.0** — 合并 [humanize-chinese](https://github.com/voidborne-d/humanize-chinese) 本地 CLI 与资源
- **1.x** — 基于 blader/humanizer 的深度指南中文改编

## 常见 AI 词汇警示列表

以下词汇在 AI 生成文本中出现频率异常高：

- 此外、至关重要、深入探讨、强调
- 持久的、增强、培养、获得
- 突出、相互作用、复杂/复杂性
- 格局（抽象名词）、关键性的、展示
- 织锦（抽象名词）、证明、强调
- 宝贵的、充满活力的

## 贡献

如果你发现翻译问题或想要改进文档，欢迎提交 Issue 或 Pull Request。

### 中文语境特殊性

在翻译和适配过程中，我们考虑了中文写作的特点：
- 某些英文模式在中文中表现不同（如标题大小写问题）
- 添加了适合中文语境的示例
- 调整了部分表达以符合中文习惯

## 参考资源

- [larashero3-dotcom/lieflat-less-ai-tone](https://github.com/larashero3-dotcom/lieflat-less-ai-tone) - 白名单硬边界与实证改写规则上游（含 RESEARCH.md）
- [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14) - 反 AI 审查工作流与示例的来源 PR
- [voidborne-d/humanize-chinese](https://github.com/voidborne-d/humanize-chinese) - 本目录 CLI 与配套资源的上游
- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) - 原始指南来源
- [WikiProject AI Cleanup](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup) - 维基百科 AI 清理项目
- [blader/humanizer](https://github.com/blader/humanizer) - 原始英文版项目
- [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) - 实用工具部分的灵感来源

## 许可

本翻译项目遵循原项目的许可协议。核心内容基于维基百科社区的观察和总结。

---

**提示：** 这个工具不是为了"欺骗" AI 检测器，而是为了真正提升写作质量。默认成稿清理强调信息守恒与可定位规则；需要鲜明个人声音时，请明确开启鲜活改写，并自己提供观点与材料。
