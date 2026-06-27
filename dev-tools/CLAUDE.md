# Dev-Tools Plugin

Developer utilities plugin for this monorepo.

## Skills

| Skill | Path | Purpose |
|------|------|---------|
| `git-commit-pr` | `skills/git-commit-pr/SKILL.md` | Safe commit, push, and PR/MR workflows |
| `agent-chat-history` | `skills/agent-chat-history/SKILL.md` | Local agent conversation history lookup |
| `context7-cli` | `skills/context7-cli/SKILL.md` | Context7 CLI docs lookup |
| `context7-mcp` | `skills/context7-mcp/SKILL.md` | Context7 MCP integration guidance |
| `find-docs` | `skills/find-docs/SKILL.md` | Up-to-date library and API documentation lookup |
| `ponytail` | `skills/ponytail/SKILL.md` | Minimal-solution coding mode: YAGNI, reuse, stdlib, native first |
| `ponytail-review` | `skills/ponytail-review/SKILL.md` | Review diffs only for over-engineering |
| `ponytail-audit` | `skills/ponytail-audit/SKILL.md` | Repo-wide over-engineering audit |
| `ponytail-help` | `skills/ponytail-help/SKILL.md` | Quick reference for Ponytail modes and companion skills |
| `frontend-design` | `skills/frontend-design/SKILL.md` | High-quality frontend implementation |
| `baoyu-design` | `skills/baoyu-design/SKILL.md` | UI mockups, prototypes, and deck-style HTML deliverables |

## MCP

- `.mcp.json` registers the bundled `ponytail` stdio MCP server.
- `ponytail-mcp/` contains the zero-dependency MCP implementation.
- Exposed MCP capabilities:
  - prompt: `ponytail`
  - tool: `ponytail_instructions`
