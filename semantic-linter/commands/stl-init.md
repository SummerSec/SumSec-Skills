---
description: First-use setup for Semantic-Linter in the current project.
---

# Semantic-Linter Init

Use this command to bootstrap project-local semantic rules.

## Steps

1. Treat the current working directory as the target project.
2. Locate `scripts/build-rules.js` from one of these paths:
   - `${CODEX_PLUGIN_ROOT}/scripts/build-rules.js`
   - `${CLAUDE_PLUGIN_ROOT}/scripts/build-rules.js`
   - `./scripts/build-rules.js`
   - `$HOME/.claude/plugins/semantic-linter/scripts/build-rules.js`
3. Run:

```bash
node "<SCRIPT>" --existing "$(pwd)"
```

4. Tell the user which files were written:
   - `semantic-rules.md`
   - managed rules block in `AGENTS.md` and/or `CLAUDE.md`
5. Explain the runtime behavior:
   - Claude uses hooks plus the managed rules block.
   - Codex uses the managed rules block in `AGENTS.md`.
   - the default mode is `guarded`
   - the project rules file is preferred over the plugin fallback

## Notes

- Do not hand-write the managed rules block.
- Re-run `/stl-rules` after lexicon or wording policy changes.
