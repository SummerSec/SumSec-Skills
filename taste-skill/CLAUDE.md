# Taste Skill Plugin

This directory packages [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) as a standalone plugin in the SumSec-Skills marketplace.

## Source And Sync

- Canonical upstream: `taste-skill-upstream/`
- Synchronized source: `taste-skill-upstream/skills/`
- Plugin target: `taste-skill/skills/`
- Mapping: `.claude/skills/sync-skills/scripts/skill-map.json`

Do not edit files under `taste-skill/skills/` directly. Update the pinned submodule commit and run the repository sync script instead.

## Plugin Metadata

- Claude Code: `.claude-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`
- Cursor: `.cursor-plugin/plugin.json`
- License: `LICENSE` (MIT, copied from upstream)

When the upstream skill inventory changes, synchronize the plugin directory and update the root README plus Claude, Codex, Cursor, OpenCode, OpenClaw, and Hermes discovery metadata in the same change.
