# /detect — 检测中文文本的 AI 痕迹

Detect AI-generated patterns in Chinese text. Score 0-100.

## Usage

The user provides Chinese text (directly or as a file path). Run detection and report results.

## Steps

1. If the user provided a file path, use it directly. Otherwise, save the text to a temp file first:
   ```bash
   cat > /tmp/detect_input.txt << 'DETECT_EOF'
   [user's text here]
   DETECT_EOF
   ```

2. Run detection with verbose mode:
   ```bash
   python $SKILL_DIR/scripts/detect_cn.py /tmp/detect_input.txt -v
   ```

3. Report the results clearly:
   - Overall score and level (LOW/MEDIUM/HIGH/VERY HIGH)
   - Top suspicious sentences
   - Key AI patterns found

## Score Reference

| Score | Level | Meaning |
|-------|-------|---------|
| 0–24  | 🟢 LOW | Reads like human-written |
| 25–49 | 🟡 MEDIUM | Some AI traces |
| 50–74 | 🟠 HIGH | Likely AI-generated |
| 75–100 | 🔴 VERY HIGH | Almost certainly AI |

## Example

```
/detect 综上所述，人工智能技术在教育领域具有重要的应用价值和广阔的发展前景。
```
