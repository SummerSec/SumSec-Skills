---
name: sumsec-skills
description: "SummerSec personal Agent Skills collection. Contains reusable SKILL.md files organized by category. Use when you need to leverage skills from writing-zh, media-tools, dev-tools, or agents-dev plugins."
source: "https://github.com/SummerSec/SumSec-Skills.git"
---

# SumSec-Skills (OpenClaw)

A collection of reusable Agent Skills organized into four plugin directories:

- **writing-zh/** — Chinese writing: humanizer-zh (de-AI-fy text), creating-blog-web-ppt (markdown to web slides)
- **media-tools/** — Media generation: draw-image-generation (AI text-to-image), remotion-best-practices (React video)
- **dev-tools/** — Developer tools: git-commit-pr, agent-chat-history, context7-cli/mcp/find-docs
- **agents-dev/** — Agent ecosystem: skill-creator, writing-rules, plugin-dev skills, claude-md-improver, agent-sdk-dev, skill-optimizer, multi-platform-plugin-guide

## Usage

Each skill lives at `<plugin>/skills/<name>/SKILL.md`. When a task matches a skill's `description` frontmatter, load it and follow its workflow instructions.
