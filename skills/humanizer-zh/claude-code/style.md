# /style — 中文风格转换

Transform Chinese text into a specific writing style.

## Usage

```
/style xiaohongshu 在当今快节奏的生活中，时间管理具有至关重要的意义。
/style zhihu [text or file path]
/style weibo [text or file path]
```

## Steps

1. Parse the style name (first argument) and the text (rest).

2. Save and run:
   ```bash
   cat > /tmp/style_input.txt << 'STY_EOF'
   [user's text here]
   STY_EOF
   python $SKILL_DIR/scripts/style_cn.py /tmp/style_input.txt --style [STYLE] -o /tmp/style_output.txt
   ```

3. Show the transformed text.

## Available Styles

| Style | Description |
|-------|-------------|
| `casual` | 口语化，日常聊天 |
| `zhihu` | 知乎风格，理性分析 |
| `xiaohongshu` | 小红书风格，活泼种草 |
| `wechat` | 公众号风格，深度长文 |
| `academic` | 学术风格，严谨论述 |
| `literary` | 文艺风格，优美散文 |
| `weibo` | 微博风格，简短犀利 |

## Example

```
/style xiaohongshu 在当今快节奏的生活中，时间管理具有至关重要的意义。
```

Output:
> 姐妹们！说真的，时间管理这事我踩过太多坑了 😭
