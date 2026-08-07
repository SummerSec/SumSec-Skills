---
description: 维护 Semantic-Linter 陷阱词词典——增删改词汇对、调严重等级，并重新生成运行时数据
---

# 维护语义陷阱词词典

进入词典维护流程：在权威源 `references/semantic-trap-lexicon.md` 中增删改词汇对，再生成运行时数据。

## 执行步骤

委托 `lexicon-manager` skill 完成，核心约定：

1. **权威源**为 `references/semantic-trap-lexicon.md`；`lib/lexicon-data.js` 由 `npm run build-lexicon` 生成，**不手写**。
2. 与用户确认操作类型：添加 / 修改 / 删除词汇对。
3. 仅编辑 MD 表格，再运行：
   ```bash
   npm run build-lexicon
   npm test
   ```
4. 校验生成数据与 MD 一致：`npm run build-lexicon:check`。

## 注意

- 新增 ID 取同系列最大 ID + 1，不重用已删除 ID。
- 词典变更后，记得用 `/stl-rules` 在各项目重新生成规则文件以同步。
- 完整字段定义与批量流程见 `lexicon-manager` skill。
