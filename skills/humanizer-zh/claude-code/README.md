# Humanize Chinese for Claude Code

## Installation

```bash
# Clone the repo
git clone https://github.com/voidborne-d/humanize-chinese.git

# Copy slash commands to your project
cp -r humanize-chinese/claude-code/*.md YOUR_PROJECT/.claude/commands/
```

Or install individual commands:

```bash
mkdir -p .claude/commands
cp humanize-chinese/claude-code/detect.md .claude/commands/
cp humanize-chinese/claude-code/humanize.md .claude/commands/
cp humanize-chinese/claude-code/academic.md .claude/commands/
cp humanize-chinese/claude-code/style.md .claude/commands/
```

## Commands

| Command | Description |
|---------|-------------|
| `/detect [text]` | Detect AI patterns, score 0-100 |
| `/humanize [text]` | Rewrite to remove AI fingerprints |
| `/academic [text]` | Academic paper AIGC reduction (CNKI/VIP/Wanfang) |
| `/style [style] [text]` | Transform to specific writing style (7 styles) |

## Note

Make sure the `scripts/` directory from humanize-chinese is accessible. The commands reference `$SKILL_DIR/scripts/` — if using as a standalone Claude Code project, update paths to point to your local copy.
