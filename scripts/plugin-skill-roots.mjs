/** Plugin Skill roots shared by DSH and Pi validators. Paths are relative to the repo root. */
export const PLUGIN_SKILL_ROOTS = [
  "writing-zh/skills",
  "dev-tools/skills",
  "agents-dev/skills",
  "plugin-dev/skills",
  "claude-md-management/skills",
  "hookify/skills",
  "cloudflare-email/skills",
  "taste-skill/skills",
  "semantic-linter/skills",
];

export const PI_SKILL_PATHS = PLUGIN_SKILL_ROOTS.map((root) => `./${root}`);
