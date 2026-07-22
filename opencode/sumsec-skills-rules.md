# SumSec-Skills Rules

This repository contains reusable Agent Skills organized into plugin directories:

- `writing-zh/skills/<name>/SKILL.md`
- `dev-tools/skills/<name>/SKILL.md`
- `agents-dev/skills/<name>/SKILL.md`
- `cloudflare-email/skills/<name>/SKILL.md`
- `taste-skill/skills/<name>/SKILL.md`

When a user task matches a skill's `description` frontmatter, load the SKILL.md and follow its workflow.
Use `skills/` under each plugin directory as the primary lookup scope.
