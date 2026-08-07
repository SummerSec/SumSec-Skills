---
description: Generate or refresh semantic-rules.md plus managed project pointers.
---

# Refresh Semantic Rules

Generate or update the current project's rule file and managed pointers.

## Steps

1. Use the current working directory as the target project.
2. Locate `scripts/build-rules.js`.
3. Run:

```bash
node "<SCRIPT>" --existing "$(pwd)"
```

4. Verify:

```bash
node "<SCRIPT>" --check --existing "$(pwd)"
```

5. Report the written files and the verification result.

## Guardrails

- Always generate `semantic-rules.md` with the script.
- Do not move `semantic-rules.md` into `rules/`, `skills/`, or other instruction directories.
- Do not hand-edit the managed `<!-- STL:RULES:BEGIN -->` block.
