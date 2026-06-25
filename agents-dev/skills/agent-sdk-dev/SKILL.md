---
name: agent-sdk-dev
description: Use when creating, reviewing, or verifying Claude Agent SDK applications in Python or TypeScript, including new SDK app scaffolding guidance, SDK setup checks, verifier-agent style reviews, dependency/version checks, and best-practice audits.
---

# Agent SDK Development

Use this skill for Claude Agent SDK application development and verification. This directory mirrors the upstream Agent SDK Development plugin, including:

- `README.md` for the full workflow and troubleshooting guide.
- `commands/new-sdk-app.md` for the interactive app creation flow.
- `agents/agent-sdk-verifier-py.md` for Python application verification criteria.
- `agents/agent-sdk-verifier-ts.md` for TypeScript application verification criteria.

## Workflow

1. Read `README.md` to understand the available workflow and expected output.
2. For new app creation requests, read `commands/new-sdk-app.md` and adapt the flow to the user's environment.
3. For Python verification requests, read `agents/agent-sdk-verifier-py.md` and apply its checklist.
4. For TypeScript verification requests, read `agents/agent-sdk-verifier-ts.md` and apply its checklist.
5. Report concrete setup issues, missing files, version/dependency concerns, and documentation gaps before giving general recommendations.

Do not claim that Codex slash commands or Claude subagents are directly available unless the current environment exposes them. Treat the bundled command and agent files as implementation guidance when running under Codex.
