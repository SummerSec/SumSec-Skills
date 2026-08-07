# semantic-linter

Cross-platform wrapper for [SummerSec/semantic-linter](https://github.com/SummerSec/semantic-linter), a plugin and CLI that detects wide-boundary wording in LLM instruction files.

The canonical sources live in the `semantic-linter-upstream` git submodule and are synchronized into this plugin directory by the repository sync script.

## Install from SumSec-Skills

### Claude Code

```bash
/plugin marketplace add https://github.com/SummerSec/SumSec-Skills.git
/plugin install semantic-linter@sumsec-skills
```

### OpenAI Codex

```bash
codex plugin marketplace add SummerSec/SumSec-Skills --ref master
```

Then install `semantic-linter` from the SumSec Skills marketplace.

## Skills

| Skill | Description |
|-------|-------------|
| `semantic-analyzer` | Deep semantic triage beyond the fixed lexicon |
| `semantic-linter-shot` | Lightweight single-file trap-word reference |
| `lexicon-manager` | Maintain the semantic trap lexicon |
| `rules-installer` | Install project-local `semantic-rules.md` and managed instruction blocks |

## Upstream

- Repository: https://github.com/SummerSec/semantic-linter
- Version: see `package.json` in this directory
