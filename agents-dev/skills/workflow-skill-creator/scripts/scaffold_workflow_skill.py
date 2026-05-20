#!/usr/bin/env python3
"""
Workflow Skill 脚手架生成器

根据用户参数一键生成遵循 biz-vul-security 架构模式的 skill 目录结构。

用法:
    python3 scaffold_workflow_skill.py --name my-skill --steps 5 --output ~/.claude/skills/my-skill/
    python3 scaffold_workflow_skill.py --name my-skill --steps 6 --step-names "参数收集,链路分析,参数追踪,接口分析,规则判定,报告生成"
"""

import argparse
import os
import sys
from datetime import datetime


STEP_FRAMEWORK_TEMPLATE = """# STEP {n}: {step_name}

**⚠️ 路径一致性要求**：本 STEP 中的所有 `{{{{progress_file_path}}}}` 占位符必须替换为 STEP 1 生成的实际 Progress 文件绝对路径。

## 1. 校验规则

**前置校验**：
{prev_check}
- ✅ （补充其他前置条件）

**后置校验**：
- ✅ （补充后置校验条件）

## 2. 核心执行流程

### 步骤 1: （子步骤名称）

**目标**：（一句话目标）

**执行命令**：
```bash
# 具体可执行的命令
```

**记录**：使用 Edit 工具在进度文件末尾追加命令和执行结果。

## 3. 完成标准与验收

**STEP {n} 完成标准**：
1. ✅ （完成标准 1）
2. ✅ （完成标准 2）

**失败处理**：
如果（失败条件），需要：
1. 在 Progress 文件中详细记录已尝试的操作
2. 分析可能的原因和下一步建议
---
"""


SKILL_MD_TEMPLATE = """---
name: {skill_name}
description: （待补充：触发描述 — 包含 what + when + 中文触发关键词）
metadata:
  author: （待补充）
  category: （待补充）
  role: （待补充）
  duty: （待补充）
---

# {skill_title}

## 核心角色

作为专家级的**（角色名）**，专注于（一句话核心任务）。

**核心原则**：（最重要的约束或原则）。

## 依赖

- **（依赖 skill 名）** skill：（用途说明）

## 前置门槛（强制执行）

**输入收集**：若用户未同时提供以下项，必须先询问补齐，禁止假设默认值：
- `{{param1}}` — （说明）
- `{{param2}}` — （说明）
- `{{param3}}` — （说明，默认值: xxx，需用户确认）

确认参数齐全后方可进入 Step 1。

## 快速启动：N步分析工作流（强制执行）

```
{steps_overview}
```

## 进度文件规范（强制执行）

进度文件是跨 STEP 传递分析状态的核心载体。创建路径、执行规范及禁止行为详见 **[进度文件规范](references/progress_file_spec.md)**。

关键约束：
- Step 1 使用 `scripts/path_generator.py` 生成 `{{{{progress_file_path}}}}`，所有后续 STEP 必须使用同一路径
- 每 STEP 必须追加 `=== STEP: STEP [n] - [名称] (开始/完成时间) ===` 标记
- 禁止用"参考命令"代替实际执行，禁止跳过命令验证

---

## 标准 N 步工作流

每个 Step 的详细命令和校验规则参见对应框架文件。

{step_summaries}

---

## 参考资源（按需读取）

### 核心参考文件
1. **[领域知识定义](references/domain_knowledge.md)** — （说明何时读取）
2. **[判定规则](references/judgment_rules.md)** — （说明何时读取）

### 输出模板
1. **[Progress 文件模板](assets/progress_template.md)** — 进度文件结构参考
2. **[最终输出模板](assets/output_template.md)** — 最终输出格式参考

---

**【分析结束】遵循 N 步工作法，已确保标准化输出。**
"""


PROGRESS_FILE_SPEC_TEMPLATE = """# 进度文件规范

## 创建路径（Step 1 生成）

```bash
progress_file_path=$(python3 "~/.claude/skills/{skill_name}/scripts/path_generator.py" "{{{{param1}}}}" "{{{{param2}}}}" --output-dir ~/reports)
echo "**Progress文件路径**: ${{{{progress_file_path}}}}"
```

## 跨 STEP 传递规则

- Agent 必须在工作记忆中保留 `{{{{progress_file_path}}}}`，所有 STEP 中使用此占位符时必须替换为实际路径
- 每个 STEP 开始前应验证路径与 Step 1 生成的一致
- 路径不一致将导致分析中断、进度丢失，须从头执行

## 每个 STEP 的执行规范

每个 STEP 必须严格遵循 **"校验 → 执行 → 验证"** 三阶段：

**阶段 1 — 前置校验**：
1. Read 进度文件，检查末尾是否包含上一 STEP 的完成标记
2. Edit 追加：`=== STEP: STEP [n] - [STEP名称] (开始时间: [当前时间]) ===`

**阶段 2 — 执行与记录**：
1. Edit 追加执行命令记录：`**执行命令**: {{具体命令}}`
2. Bash 执行具体命令
3. Edit 追加分析结论：`**{{分析名称}}**: {{分析结论}}`

**阶段 3 — 后置校验**：
1. Read 进度文件末尾，检查关键产出是否已写入
2. Edit 追加：`=== STEP: STEP [n] - [STEP名称] (完成时间: [当前时间]) ===`

## 禁止行为

- 禁止使用"参考命令"代替实际命令执行
- 禁止跳过命令执行验证步骤
- 禁止省略命令执行记录 `**执行命令**: ...`
"""


PROGRESS_TEMPLATE = """# {{任务名称}} - 分析进度文件

分析模型：{{model_name}}
---

## 基本信息
- **{{参数1名称}}**: {{{{param1}}}}
- **{{参数2名称}}**: {{{{param2}}}}
- **创建时间**: {{{{timestamp}}}}

---

## 任务规划
{steps_overview}

---

分析即将开始...
"""


PATH_GENERATOR_TEMPLATE = """\
#!/usr/bin/env python3
\"\"\"
{skill_name} 路径生成器

根据输入参数生成确定的进度文件路径。相同输入 → 相同输出。
\"\"\"

import argparse
import os
import re
import sys


def safe_filename(text: str, max_len: int = 30) -> str:
    \"\"\"将文本转为安全的文件名片段。\"\"\"
    text = text.strip()
    text = re.sub(r'[^\\w\\-]', '_', text)
    return text[:max_len]


def generate_path(param1: str, param2: str, output_dir: str = None) -> str:
    \"\"\"生成进度文件的绝对路径。\"\"\"
    output_dir = output_dir or os.path.join(os.path.expanduser("~"), "reports")
    os.makedirs(output_dir, exist_ok=True)

    p1 = safe_filename(param1)
    p2 = safe_filename(param2)
    filename = f"{{p1}}-{{p2}}_进度报告.md"

    return os.path.join(output_dir, filename)


def main():
    parser = argparse.ArgumentParser(description="{skill_name} 路径生成器")
    parser.add_argument("param1", help="参数1")
    parser.add_argument("param2", help="参数2")
    parser.add_argument("--output-dir", "-o", help="输出目录", default=None)

    args = parser.parse_args()
    path = generate_path(args.param1, args.param2, args.output_dir)

    # 创建空文件
    with open(path, 'w') as f:
        f.write('')

    print(path)


if __name__ == "__main__":
    main()
"""


def scaffold(args):
    """生成 workflow skill 目录结构。"""
    skill_dir = os.path.abspath(args.output)
    skill_name = args.name
    num_steps = args.steps

    # 步骤名称
    if args.step_names:
        step_names = [s.strip() for s in args.step_names.split(",")]
        if len(step_names) != num_steps:
            print(f"错误: --step-names 数量 ({len(step_names)}) 与 --steps ({num_steps}) 不匹配",
                  file=sys.stderr)
            sys.exit(1)
    else:
        step_names = [f"Step {i}" for i in range(1, num_steps + 1)]

    # 创建目录
    dirs = [
        skill_dir,
        os.path.join(skill_dir, "references", "step_frameworks"),
        os.path.join(skill_dir, "scripts"),
        os.path.join(skill_dir, "assets"),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # 创建步骤框架文件
    for i in range(num_steps):
        if i == 0:
            prev_check = "- ✅ 使用 Read 工具验证进度文件已创建且基本信息和任务规划已写入"
        else:
            prev_check = f"- ✅ 使用 Read 工具读取进度文件末尾，验证 STEP {i} 完成标记存在"
        framework_content = STEP_FRAMEWORK_TEMPLATE.format(
            n=i + 1,
            prev_check=prev_check,
            step_name=step_names[i],
        )
        step_filename = f"step{i + 1}_{step_names[i].lower().replace(' ', '_')}.md"
        step_path = os.path.join(skill_dir, "references", "step_frameworks", step_filename)
        with open(step_path, "w", encoding="utf-8") as f:
            f.write(framework_content)

    # 创建进度文件规范
    spec_path = os.path.join(skill_dir, "references", "progress_file_spec.md")
    with open(spec_path, "w", encoding="utf-8") as f:
        f.write(PROGRESS_FILE_SPEC_TEMPLATE.format(skill_name=skill_name))

    # 创建领域知识占位文件
    dk_path = os.path.join(skill_dir, "references", "domain_knowledge.md")
    with open(dk_path, "w", encoding="utf-8") as f:
        f.write(f"# 领域知识定义\n\n> 待补充：{skill_name} 的领域知识和核心概念定义。\n")

    # 创建判定规则占位文件
    jr_path = os.path.join(skill_dir, "references", "judgment_rules.md")
    with open(jr_path, "w", encoding="utf-8") as f:
        f.write(f"# 判定规则\n\n> 待补充：{skill_name} 的判定规则和流程。\n")

    # 创建 SKILL.md
    steps_overview = "\n".join(
        f"STEP {i + 1}: {name}" for i, name in enumerate(step_names)
    )
    step_summaries = "\n".join(
        f"""### STEP {i + 1}: {name}

**任务目标**：（待补充）

**框架文件**：[Step {i + 1} 详细框架](references/step_frameworks/step{i + 1}_{name.lower().replace(' ', '_')}.md)

---"""
        for i, name in enumerate(step_names)
    )

    skill_title = skill_name.replace("-", " ").title()
    skill_md = SKILL_MD_TEMPLATE.format(
        skill_name=skill_name,
        skill_title=skill_title,
        steps_overview=steps_overview,
        step_summaries=step_summaries,
    )
    skill_md_path = os.path.join(skill_dir, "SKILL.md")
    with open(skill_md_path, "w", encoding="utf-8") as f:
        f.write(skill_md)

    # 创建进度文件模板
    progress_tmpl = PROGRESS_TEMPLATE.format(steps_overview=steps_overview)
    progress_path = os.path.join(skill_dir, "assets", "progress_template.md")
    with open(progress_path, "w", encoding="utf-8") as f:
        f.write(progress_tmpl)

    # 创建输出模板占位文件
    output_tmpl_path = os.path.join(skill_dir, "assets", "output_template.md")
    with open(output_tmpl_path, "w", encoding="utf-8") as f:
        f.write(f"# 最终输出模板\n\n> 待补充：{skill_name} 的最终输出格式。\n")

    # 创建路径生成脚本
    pg_path = os.path.join(skill_dir, "scripts", "path_generator.py")
    with open(pg_path, "w", encoding="utf-8") as f:
        f.write(PATH_GENERATOR_TEMPLATE.format(skill_name=skill_name))
    os.chmod(pg_path, 0o755)

    # 汇总输出
    print(f"✅ Workflow Skill 目录已生成: {skill_dir}")
    print(f"   SKILL.md: {skill_md_path}")
    print(f"   步骤框架: {num_steps} 个文件 → references/step_frameworks/")
    print(f"   脚本: scripts/path_generator.py")
    print(f"   模板: assets/progress_template.md, assets/output_template.md")
    print(f"   参考: references/progress_file_spec.md, domain_knowledge.md, judgment_rules.md")
    print()
    print("📝 后续步骤:")
    print("   1. 填写 SKILL.md 的 frontmatter description 和核心角色")
    print("   2. 完善每个步骤框架文件的具体命令和校验规则")
    print("   3. 填写 domain_knowledge.md 和 judgment_rules.md")
    print("   4. 根据实际需求调整 path_generator.py 的参数")
    print("   5. 使用 workflow-skill-creator 的质量检查清单自检")


def main():
    parser = argparse.ArgumentParser(
        description="Workflow Skill 脚手架生成器 — 基于 biz-vul-security 架构模式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 %(prog)s --name code-audit --steps 5 --output ~/.claude/skills/code-audit/
  python3 %(prog)s --name data-pipeline --steps 4 \\
      --step-names "数据采集,数据清洗,特征提取,报告输出" \\
      --output ~/.claude/skills/data-pipeline/
        """,
    )
    parser.add_argument("--name", "-n", required=True, help="Skill 名称 (kebab-case)")
    parser.add_argument("--steps", "-s", type=int, required=True, help="步骤数量 (3-8)")
    parser.add_argument("--step-names", help="步骤名称，英文逗号分隔 (如: 参数收集,链路分析,报告生成)")
    parser.add_argument("--output", "-o", required=True, help="输出目录路径")

    args = parser.parse_args()

    if args.steps < 3 or args.steps > 8:
        print("错误: --steps 必须在 3-8 之间", file=sys.stderr)
        sys.exit(1)

    scaffold(args)


if __name__ == "__main__":
    main()