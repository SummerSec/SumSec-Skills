const path = require("path");
const fs = require("fs");

const SKILL_DIRS = [
  "writing-zh",
  "media-tools",
  "dev-tools",
  "agents-dev",
];

function discoverSkills(root) {
  const results = [];
  for (const plugin of SKILL_DIRS) {
    const skillsDir = path.join(root, plugin, "skills");
    try {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
          if (fs.existsSync(skillFile)) {
            results.push({ plugin, name: entry.name, path: skillFile });
          }
        }
      }
    } catch {}
  }
  return results;
}

const plugin = {
  name: "sumsec-skills",
  version: "1.0.17",
  description: "SummerSec personal Agent Skills collection — writing-zh, media-tools, dev-tools, agents-dev.",
  onSessionStart({ projectRoot }) {
    const projectSkills = discoverSkills(projectRoot);
    const names = projectSkills.map(s => `${s.plugin}/${s.name}`).join(", ");
    return { additionalContext: `SumSec-Skills available: ${names || "none"}` };
  },
};

module.exports = plugin;
