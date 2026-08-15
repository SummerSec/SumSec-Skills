import path from "node:path";
import fs from "node:fs";

/**
 * @type {import("@opencode-ai/plugin").Plugin}
 */
export default async function sumsecSkillsPlugin() {
  const SKILL_DIRS = ["writing-zh", "dev-tools", "agents-dev", "cloudflare-email", "taste-skill", "semantic-linter"];
  const root = path.resolve(import.meta.dirname, "../..");

  function discoverSkills() {
    const results = [];
    for (const plugin of SKILL_DIRS) {
      const skillsDir = path.join(root, plugin, "skills");
      try {
        const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
            if (fs.existsSync(skillFile)) {
              results.push(path.join(skillsDir, entry.name));
            }
          }
        }
      } catch {}
    }
    return results;
  }

  return {
    name: "sumsec-skills",
    version: "1.0.44",
    config: (cfg) => {
      const skillPaths = discoverSkills();
      const existing = cfg.skills?.paths ?? [];
      cfg.skills = cfg.skills || {};
      cfg.skills.paths = [...existing, ...skillPaths];
    },
  };
}
