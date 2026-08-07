---
name: lexicon-manager
description: 维护 Semantic-Linter 语义陷阱词典——在 Markdown 源表中增删改词汇对并生成运行时数据。当用户要添加/修改/删除陷阱词、调整严重等级、批量导入或查看词典时使用。
---

# 语义陷阱词典管理器

交互式维护词典：**权威来源**为 `references/semantic-trap-lexicon.md` 中的表格；`lib/lexicon-data.js` 由 `npm run build-lexicon` **自动生成**，不要作为手写主路径（避免与校验脚本不一致）。

## 数据文件与生成命令

| 角色 | 路径 |
|------|------|
| **权威源（人编辑）** | `references/semantic-trap-lexicon.md` |
| **生成物（勿手改为主流程）** | `lib/lexicon-data.js` |

```bash
# 修改 MD 表格后执行：重新生成 lexicon-data.js
npm run build-lexicon

# 校验已提交的 lexicon-data.js 与 MD 一致（不写盘）
npm run build-lexicon:check
```

## 词汇对数据结构（写入 MD / 心智模型）

字段需能在表格中表达；生成脚本会解析为下列结构（与 `lexicon-data.js` 中对象一致）。

### 中文词汇对 (zhPairs)

- `id`: `T01`–`T99`
- `narrow` / `wide`：窄边界 / 宽边界（中文）
- `narrowEn` / `wideEn`：括号内英文，与 MD 表格列一致
- `severity`：由 MD「语义宽度差」列映射为 `critical` / `high` / `medium-high` / `medium`
- `scenario`：失控场景（表格最后一列）

### 英文词汇对 (enPairs)

- `id`：`E01`–`E99`
- `narrow` / `wide`；可选 `narrowAlt` / `wideAlt`（MD 中用 ` / ` 分隔）
- `severity`：与仓库生成规则一致（由维护脚本映射）
- `scenario`

### 严重等级（severity）

`critical` > `high` > `medium-high` > `medium` > `low`

选择依据（摘录）：

- **critical**：替换后输出量或范围变化极大，或明显偏离任务目标
- **high**：明显主观判断或超范围联想
- **medium-high**：适度发散仍在相关域内
- **medium**：边界略模糊、影响有限
- **low**：理论有差、实际影响极小

## 维护工作流

### STEP 1：读取当前词典

1. 读取 `references/semantic-trap-lexicon.md` 中各表格，或 `require('./lib/lexicon-data.js')` 使用已生成的 `wideWordsZh` / `wideWordsEn` 向用户展示概览（二者应一致；若不一致先运行 `npm run build-lexicon:check` 定位）。

概览示例：

```
📖 当前词典概览
中文词汇对: T01–T17（以 MD 为准）
英文词汇对: E01–E10（以 MD 为准）
```

### STEP 2：确认操作

与用户确认操作类型：**添加** / **修改** / **删除**。

#### 操作 A：添加词汇对

逐项收集：

1. **语言**：中文 (T) 或英文 (E)
2. **wide / narrow**（及中文的 narrowEn、wideEn；英文的 narrowAlt、wideAlt 若需要）
3. **severity**（或对应 MD 语义宽度差文案）
4. **scenario**（失控说明，非空）

**ID**：新 ID = 同系列当前最大 ID + 1（如最大 T17 → T18）。**不随意重用已删除 ID**（保持历史稳定）。

**验证**：

- wide / narrow 非空；wide 不与已有行冲突
- severity 合法；scenario 非空

#### 操作 B：修改词汇对

1. 用户指定 ID（如 T05）
2. 展示当前表格行或生成条目中的字段
3. 确认新值后更新 **MD 表格对应行**

#### 操作 C：删除词汇对

1. 用户指定 ID，展示完整信息
2. 二次确认删除（降低检测覆盖）
3. 从 MD 表格**移除该行**；**不重新编号**已有 ID

### STEP 3：执行修改（仅改 MD → 生成）

1. **编辑** `references/semantic-trap-lexicon.md`  
   - 在「高危词汇对」「扩展词汇对」「英文环境高危词汇对」等对应表格中 **增/改/删** 行，列格式与现有行保持一致。  
   - 若变更影响说明，检查「LLM 语义敏感度矩阵」是否需同步调整。

2. **生成运行时词典**（在仓库根目录）：

```bash
npm run build-lexicon
```

3. 若曾误手改 `lexicon-data.js`，以 MD 为准重新执行上一步覆盖生成物。

### STEP 4：验证

```bash
npm test
npm run build-lexicon:check
npm run scan -- references/semantic-trap-lexicon.md
```

向用户展示命令输出与更新后的概览。

## 批量操作

1. 收集多条词汇对并逐条通过验证规则  
2. **一次性**更新 `semantic-trap-lexicon.md` 中多行  
3. 执行一次 `npm run build-lexicon`，再跑 STEP 4 全部命令  

## 注意事项

- **不要**把「手改 `lexicon-data.js`」作为常规流程；应以 MD + `build-lexicon` 为唯一真源链路。  
- 修改后必须 `npm test`；发布前亦可运行 `npm run build-lexicon:check`。  
- 新增 wide 词会被 Hook 检测；删除行会缩小覆盖，需谨慎。  
- 数组内条目顺序由 `scripts/build-lexicon.js` 按 ID 排序写出，无需手排。
