# 进度文件规范（模板）

> 此文件为模板。创建具体 skill 时，将 `{skill_name}` 替换为实际 skill 名称，调整路径生成脚本名。

---

## 创建路径（Step 1 生成）

```bash
progress_file_path=$(python3 "~/.claude/skills/{skill_name}/scripts/path_generator.py" "{param1}" "{param2}" --output-dir ~/reports)
echo "**Progress文件路径**: ${progress_file_path}"
```

## 跨 STEP 传递规则

- Agent 必须在工作记忆中保留 `{progress_file_path}`，所有 STEP 中使用此占位符时必须替换为实际路径
- 每个 STEP 开始前应验证路径与 Step 1 生成的一致
- 路径不一致将导致分析中断、进度丢失，须从头执行

## 文件内容规范

- 格式：Markdown，人类可读
- 编码：UTF-8
- 每 STEP 追加，不覆盖已有内容
- 使用 `=== STEP: STEP [n] - [STEP名称] (开始时间/完成时间) ===` 作为分隔标记

## 每个 STEP 的执行规范

每个 STEP 必须严格遵循 **"校验 → 执行 → 验证"** 三阶段：

**阶段 1 — 前置校验**：
1. Read 进度文件，检查末尾是否包含上一 STEP 的完成标记
2. Edit 追加：`=== STEP: STEP [n] - [STEP名称] (开始时间: [当前时间]) ===`

**阶段 2 — 执行与记录**：
1. Edit 追加执行命令记录：`**执行命令**: {具体命令}`
2. Bash 执行具体命令
3. Edit 追加分析结论：`**{分析名称}**: {分析结论}`

**阶段 3 — 后置校验**：
1. Read 进度文件末尾，检查关键产出是否已写入
2. Edit 追加：`=== STEP: STEP [n] - [STEP名称] (完成时间: [当前时间]) ===`

## 禁止行为

- 禁止使用"参考命令"代替实际命令执行
- 禁止跳过命令执行验证步骤
- 禁止省略命令执行记录 `**执行命令**: ...`
- 禁止不 Read 就假设文件内容

## 中断恢复

如分析中断，从进度文件最后一个 `完成时间` 标记之后恢复执行：
1. Read 进度文件全文
2. 找到最后一个 `=== STEP: STEP [n] ...完成时间:` 标记
3. 从 STEP n+1 继续执行