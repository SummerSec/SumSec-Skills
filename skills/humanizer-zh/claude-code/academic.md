# /academic — 学术论文 AIGC 降重

Reduce AIGC detection score for academic papers. Targets CNKI (知网), VIP (维普), Wanfang (万方).

## Usage

The user provides academic text or a file path. Run academic-specific rewriting.

## Steps

1. Save the input:
   ```bash
   cat > /tmp/academic_input.txt << 'ACAD_EOF'
   [user's text here]
   ACAD_EOF
   ```

2. Run academic rewriting with comparison:
   ```bash
   python $SKILL_DIR/scripts/academic_cn.py /tmp/academic_input.txt -o /tmp/academic_output.txt --compare
   ```

3. If score is still above 30, try aggressive mode:
   ```bash
   python $SKILL_DIR/scripts/academic_cn.py /tmp/academic_input.txt -o /tmp/academic_output.txt -a --compare
   ```

4. Show the user:
   - Original score → Rewritten score
   - The rewritten text
   - Remind them to review: check terminology accuracy and citation format

## What It Does

- Replaces AI academic clichés while keeping scholarly tone
- "本文旨在" → "本研究聚焦于"
- "被广泛应用" → "得到较多运用"
- "研究表明" → "前人研究发现" / "笔者认为"
- Injects hedging language ("可能", "在一定程度上")
- Breaks uniform paragraph structure
- Adds author subjectivity ("笔者倾向于认为")

## Example

```
/academic 本文旨在探讨人工智能对高等教育教学模式的影响，具有重要的理论意义和实践价值。研究表明，人工智能技术已被广泛应用于课堂教学、学生评估和个性化学习等多个方面。
```
