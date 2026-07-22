---
name: sumsec-skills
description: "SummerSec personal Agent Skills collection: writing-zh, dev-tools, agents-dev, cloudflare-email, taste-skill."
version: "1.0.41"
category: skills-collection
tags:
  - skills
  - plugins
  - agent-capabilities
source: "https://github.com/SummerSec/SumSec-Skills.git"
---

# SumSec-Skills (Hermes)

Reusable Agent Skills organized by plugin category. Each skill lives at `<plugin>/skills/<name>/SKILL.md`.

- **writing-zh/**: humanizer-zh, sumsec-illustrations
- **dev-tools/**: git-commit-pr, agent-chat-history, context7-cli/mcp/find-docs, frontend-design, baoyu-design
- **agents-dev/**: skill-creator, writing-rules, plugin-dev skills, agent-sdk-dev, skill-optimizer, multi-platform-plugin-guide
- **cloudflare-email/**: cf-temp-mail-agent-mail
- **taste-skill/**: frontend design taste, redesign, image-to-code, brand-kit, and visual-style skills

Load a skill's SKILL.md when the task matches its `description` frontmatter.
