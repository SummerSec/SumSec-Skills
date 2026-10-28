# 来源与版本

- **深度指南**：翻译自 [blader/humanizer](https://github.com/blader/humanizer)（**对齐 v3.1.0**：26 类模式／A–F 六组，按强度与频率排序；旧 24 类编号对照见 [pattern-catalog.md](pattern-catalog.md) 文末）；参考 [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)；理论框架见维基百科 [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)。
- **废弃的模式**：上游 v3.0.0 起移除「刻意换词（同义词循环）」与「虚假范围」，维基百科已将它们归为人类习惯；本 skill 同步移除。
- **反 AI 审查工作流与三段式输出**：思路对齐 [op7418/Humanizer-zh#14](https://github.com/op7418/Humanizer-zh/pull/14)。
- **CLI 与 `scripts/`**：[voidborne-d/humanize-chinese](https://github.com/voidborne-d/humanize-chinese)；拷贝范围与许可见 [NOTICE](../NOTICE)；版本号亦见本 skill 根目录 `package.json`。
- **白名单硬边界 /「不作为改写理由」/ 实证改写规则**：合并自 [larashero3-dotcom/lieflat-less-ai-tone](https://github.com/larashero3-dotcom/lieflat-less-ai-tone)（MIT）。纳入内容为 `references/hard-boundaries.md` 与 `references/validated-rewrite-rules.md`；研究长文不入库，指针见上游 [RESEARCH.md](https://github.com/larashero3-dotcom/lieflat-less-ai-tone/blob/main/RESEARCH.md)。部分规范亦参考 [KKKKhazix/human-writing](https://github.com/KKKKhazix/human-writing)。

**文档版本 2.4.0**：与本 skill `package.json` 中的 `version` 字段一致。
