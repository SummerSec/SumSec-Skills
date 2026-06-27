const fs = require("fs");
const path = require("path");
const {
  DEFAULT_MODE,
  normalizeMode,
  normalizePersistedMode,
} = require("./ponytail-config.cjs");

const INDEPENDENT_MODES = new Set(["review"]);
const SKILL_PATH = path.join(__dirname, "..", "skills", "ponytail", "SKILL.md");

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || "").replace(/^---[\s\S]*?---\s*/, "");

  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join("\n");
}

function getFallbackInstructions(mode) {
  return (
    "PONYTAIL MODE ACTIVE - level: " +
    mode +
    "\n\n" +
    "You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.\n\n" +
    "Before any code, stop at the first rung that holds: YAGNI, reuse code already in the repo, use the standard library, use the native platform, use an already-installed dependency, make it one line if possible, and only then write the minimum code that works.\n\n" +
    "Never simplify away validation at trust boundaries, security measures, accessibility basics, or protections against data loss. Read the actual code path before picking the smallest fix."
  );
}

function getPonytailInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;

  if (INDEPENDENT_MODES.has(configuredMode)) {
    return (
      "PONYTAIL MODE ACTIVE - level: " +
      configuredMode +
      ". Behavior defined by ponytail-" +
      configuredMode +
      "."
    );
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;

  try {
    return (
      "PONYTAIL MODE ACTIVE - level: " +
      effectiveMode +
      "\n\n" +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, "utf8"), effectiveMode)
    );
  } catch {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = {
  filterSkillBodyForMode,
  getPonytailInstructions,
};
