# /humanize — 去除中文文本的 AI 痕迹

Rewrite Chinese text to remove AI fingerprints. Detect → Rewrite → Verify.

## Usage

The user provides Chinese text (directly or as a file path). Run the full pipeline: detect, rewrite, compare.

## Steps

1. Save the input text:
   ```bash
   cat > /tmp/humanize_input.txt << 'HUM_EOF'
   [user's text here]
   HUM_EOF
   ```

2. Run compare (detect + rewrite + score comparison in one step):
   ```bash
   python $SKILL_DIR/scripts/compare_cn.py /tmp/humanize_input.txt -a -o /tmp/humanize_output.txt
   ```

3. Show the user:
   - Original score → Rewritten score
   - The rewritten text
   - Key changes made

## Options

- Default mode is sufficient for most cases
- Use `-a` (aggressive) if the score is still above 25 after first pass
- Add `--style xiaohongshu` / `--style zhihu` etc. for platform-specific rewrites

## Available Styles

casual, zhihu, xiaohongshu, wechat, academic, literary, weibo

## Example

```
/humanize 本文旨在探讨人工智能对高等教育教学模式的影响，具有重要的理论意义和实践价值。
```
