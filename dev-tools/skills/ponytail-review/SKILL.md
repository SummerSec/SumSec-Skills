---
name: ponytail-review
description: >
  Review code or diffs only for over-engineering. Finds what to delete,
  replace with stdlib/native features, inline, or shrink. Use when the user
  asks whether something is over-engineered, what can be deleted, how to
  simplify a diff, or explicitly invokes ponytail review.
license: MIT
---

Review diffs for unnecessary complexity. One line per finding: location, what
to cut, what replaces it. The best diff is a shorter diff.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for multi-file diffs.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library already ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

End with: `net: -<N> lines possible.`

If there is nothing to cut, say `Lean already. Ship.` and stop.

Scope: over-engineering only. Correctness, security, and performance are out of
scope here.
