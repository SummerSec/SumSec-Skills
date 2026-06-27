# Dev-Tools Plugin

Developer tooling plugin. Includes:

- **git-commit-pr** - safe commit, push, and PR/MR workflows
- **agent-chat-history** - search local agent history by date
- **context7-cli** - Context7 CLI docs lookup
- **context7-mcp** - Context7 MCP integration guidance
- **find-docs** - current library and API documentation lookup
- **ponytail** - minimal-solution coding mode: YAGNI, reuse, stdlib, native first
- **ponytail-review** - review diffs only for over-engineering
- **ponytail-audit** - repo-wide over-engineering audit
- **ponytail-help** - quick reference for Ponytail modes and companion skills
- **frontend-design** - high-quality frontend implementation
- **baoyu-design** - UI mockups, interactive prototypes, and HTML deck artifacts

## MCP

The plugin also bundles a **Ponytail MCP** server:

- server: `ponytail`
- prompt: `ponytail`
- tool: `ponytail_instructions`

This is a pull-based Ponytail context source for MCP-capable hosts. It is not
a replacement for always-on hooks.

## Install

```bash
/plugin install dev-tools@sumsec-skills
```
