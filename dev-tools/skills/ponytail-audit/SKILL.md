---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering. Scans the codebase and ranks what to
  delete, simplify, or replace with stdlib/native equivalents. Use when the
  user asks to audit a repo for bloat, unnecessary abstractions, redundant
  dependencies, or "what can I delete from this codebase".
license: MIT
---

`ponytail-review`, but repo-wide. Scan the whole tree instead of a diff. Rank
findings biggest cut first.

## Tags

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library already ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Hunt

Look for:

- dependencies the stdlib or platform already covers
- single-implementation interfaces
- factories with one product
- wrappers that only delegate
- dead flags and config
- hand-rolled stdlib

## Output

One line per finding, ranked: `<tag> <what to cut>. <replacement>. [path]`

End with: `net: -<N> lines, -<M> deps possible.`

If there is nothing to cut, say `Lean already. Ship.`

Scope: over-engineering only. Correctness, security, and performance are out of
scope.
