---
name: ponytail-help
description: >
  Quick reference for ponytail modes and companion skills. One-shot display,
  not a persistent mode. Use when the user asks how to use ponytail, which
  modes exist, or what ponytail commands/skills are available.
license: MIT
---

# Ponytail Help

Display this reference card when invoked. One-shot, do NOT change mode or
persist anything.

## Levels

| Level | Trigger | What changes |
|-------|---------|--------------|
| **Lite** | `/ponytail lite` | Build what's asked, but name the lazier alternative in one line. |
| **Full** | `/ponytail` | YAGNI -> reuse -> stdlib -> native -> one line -> minimum. Default. |
| **Ultra** | `/ponytail ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | Lazy mode itself. Simplest correct solution. |
| **ponytail-review** | `/ponytail-review` | Over-engineering review for a diff. |
| **ponytail-audit** | `/ponytail-audit` | Repo-wide over-engineering audit. |
| **ponytail-help** | `/ponytail-help` | This card. |

Codex commonly invokes these as `@ponytail`, `@ponytail-review`,
`@ponytail-audit`, and `@ponytail-help`.

## Deactivate

Say "stop ponytail" or "normal mode".

## Configure Default Mode

Environment variable:

```bash
export PONYTAIL_DEFAULT_MODE=ultra
```

Config file:

```json
{ "defaultMode": "lite" }
```

Resolution order: env var -> config file -> `full`.
