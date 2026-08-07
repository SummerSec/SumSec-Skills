# Semantic-Linter Plugin

This directory packages [SummerSec/semantic-linter](https://github.com/SummerSec/semantic-linter) as a standalone plugin in the SumSec-Skills marketplace.

## Source And Sync

- Canonical upstream: `semantic-linter-upstream/`
- Synchronized components:
  - `skills/`
  - `hooks/`
  - `commands/`
  - `lib/`
  - `bin/`
  - `scripts/`
  - `references/`
- Root files copied from upstream on packaging updates:
  - `semantic-rules.md`
  - `package.json`
- Mapping: `.claude/skills/sync-skills/scripts/skill-map.json`

Do not edit synced component directories under `semantic-linter/` directly. Update the pinned submodule commit, re-copy root files if needed, and run the repository sync script instead.

## Plugin Metadata

- Claude Code: `.claude-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`
- Cursor: `.cursor-plugin/plugin.json`
- Upstream version source: `semantic-linter-upstream/package.json`

When the upstream inventory changes, synchronize the plugin directory and update the root README plus Claude, Codex, Cursor, OpenCode, OpenClaw, and Hermes discovery metadata in the same change.

## Runtime Notes

Semantic-Linter is more than skills:

- Hooks: SessionStart / SubagentStart / UserPromptSubmit / PreToolUse / PostToolUse
- Commands: `/stl-init`, `/stl-lexicon`, `/stl-rules`
- CLI: `node bin/scan.js` (package bin name `semantic-lint`)
- Default mode: `guarded`
