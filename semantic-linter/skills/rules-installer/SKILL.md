---
name: rules-installer
description: Install Semantic-Linter project rules into AGENTS.md and or CLAUDE.md so the model can load semantic guidance on demand while editing instruction files.
---

# Rules Installer

Install Semantic-Linter into the user's current project by generating two artifacts:

- `semantic-rules.md`: the full semantic guidance file
- a managed block in `AGENTS.md` and or `CLAUDE.md`: the lightweight always-present pointer

## What This Skill Must Do

1. Detect the current project directory with `pwd`.
2. Locate `scripts/build-rules.js` from the active plugin or local source checkout.
3. Run:

```bash
node "<SCRIPT>" --existing "$(pwd)"
```

4. Run:

```bash
node "<SCRIPT>" --check --existing "$(pwd)"
```

5. Tell the user:
   - which files were written
   - whether validation passed
   - that the default mode is `guarded`
   - that project-local `semantic-rules.md` is preferred over the plugin fallback

## Important Rules

- Never hand-write `semantic-rules.md`.
- Never hand-write the managed `<!-- STL:RULES:BEGIN -->` block.
- If both `AGENTS.md` and `CLAUDE.md` already exist, update both.
- If neither file exists, let `build-rules.js` create the host-appropriate default target.

## Runtime Model

Semantic-Linter is no longer pointer-only.

- Claude can use `SessionStart`, `SubagentStart`, `UserPromptSubmit`, `PreToolUse`, and `PostToolUse`.
- Codex relies on the managed project instruction file and on-demand rule loading.
- `pointer` mode keeps only the lightweight pointer.
- `guarded` mode adds write-time lint checks.
- `strict` mode also enables prompt scanning.

## When To Suggest Follow-up Commands

- `/stl-rules` after policy or lexicon changes
- `/stl-lexicon` when the user wants to add or refine trap pairs
- `npm run scan -- <file>` when the user wants an explicit one-off scan
