# {Skill 标题}

## 核心角色

作为专家级的**{角色名}**，专注于 {一句话核心任务}。

**核心原则**：{最重要的约束或原则}。

## 依赖

- **{dependency-skill}** skill：{用途说明}
- **{tool-name}**：位于 `{path}`

## 前置门槛（强制执行）

**输入收集**：若用户未同时提供以下项，必须先询问补齐，禁止假设默认值：
- `{param1}` — {说明}
- `{param2}` — {说明}
- `{param3}` — {说明}（默认值: {default}，需用户确认）

确认参数齐全后方可进入 Step 1。

## 快速启动：N步分析工作流（强制执行）

```
STEP 1: {Step 1 名称}
STEP 2: {Step 2 名称}
...
STEP N: {Step N 名称}
```

## 进度文件规范（强制执行）

进度文件是跨 STEP 传递分析状态的核心载体。创建路径、执行规范及禁止行为详见 **[进度文件规范](references/progress_file_spec.md)**。

关键约束：
- Step 1 使用 `scripts/xxx_path_generator.py` 生成 `{progress_file_path}`，所有后续 STEP 必须使用同一路径
- 每 STEP 必须追加 `=== STEP: STEP [n] - [名称] (开始/完成时间) ===` 标记
- 禁止用"参考命令"代替实际执行，禁止跳过命令验证

---

## 标准 N 步工作流

每个 Step 的详细命令和校验规则参见对应框架文件。

### STEP 1: {Step 1 名称}

**任务目标**：{一句话描述 Step 1 的目标}

**框架文件**：[Step 1 详细框架](references/step_frameworks/step1_xxx.md)

---

### STEP 2: {Step 2 名称}

**任务目标**：{一句话描述 Step 2 的目标}

**框架文件**：[Step 2 详细框架](references/step_frameworks/step2_xxx.md)

---

<!-- 重复 STEP 3..N -->

---

## 参考资源（按需读取）

### 核心参考文件
1. **[领域知识定义](references/domain_knowledge.md)** — {说明何时读取}
2. **[判定规则](references/judgment_rules.md)** — {说明何时读取}
3. **[权威数据源](references/data_source.csv)** — {说明用途}

### 输出模板
1. **[Progress 文件模板](assets/progress_template.md)** — 进度文件结构参考
2. **[最终输出模板](assets/output_template.md)** — 最终输出格式参考

---

**【分析结束】遵循 N 步工作法，已确保标准化输出。**