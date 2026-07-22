---
name: sumsec-skills
description: "SummerSec personal Agent Skills collection. Contains reusable SKILL.md files organized by category. Use when you need skills from writing-zh, media-tools, dev-tools, agents-dev, cloudflare-email, or taste-skill plugins."
source: "https://github.com/SummerSec/SumSec-Skills.git"
---

# SumSec-Skills (OpenClaw)

A collection of reusable Agent Skills organized into plugin directories:

- **writing-zh/**: Chinese writing: humanizer-zh, khazix-writer, sumsec-illustrations
- **media-tools/**: Media generation: draw-image-generation, remotion-best-practices
- **dev-tools/**: Developer tools: git-commit-pr, agent-chat-history, context7-cli/mcp/find-docs, frontend-design, baoyu-design
- **agents-dev/**: Agent ecosystem: skill-creator, writing-rules, plugin-dev skills, agent-sdk-dev, skill-optimizer, multi-platform-plugin-guide
- **cloudflare-email/**: cf-temp-mail-agent-mail
- **taste-skill/**: frontend design taste, redesign, image-to-code, brand-kit, and visual-style skills

## Usage

Each skill lives at `<plugin>/skills/<name>/SKILL.md`. When a task matches a skill's `description` frontmatter, load it and follow its workflow instructions.
