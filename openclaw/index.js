const path = require("path");
const fs = require("fs");

const SKILLS_ROOT = path.join(__dirname, "skills");

function findSkills(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillDir = path.join(dir, entry.name);
        const skillFile = path.join(skillDir, "SKILL.md");
        if (fs.existsSync(skillFile)) {
          results.push({ name: entry.name, path: skillFile });
        }
        results.push(...findSkills(skillDir));
      }
    }
  } catch {}
  return results;
}

module.exports = {
  name: "sumsec-skills",
  version: "1.0.17",
  description: "SummerSec personal Agent Skills collection",
  getSkills() {
    return findSkills(SKILLS_ROOT);
  },
};
