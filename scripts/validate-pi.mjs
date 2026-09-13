import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PLUGIN_SKILL_ROOTS, PI_SKILL_PATHS } from "./plugin-skill-roots.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.ok(packageJson.keywords?.includes("pi-package"), "package.json keywords must include pi-package");
assert.ok(packageJson.keywords?.includes("pi"), "package.json keywords must include pi");
assert.deepEqual(packageJson.pi?.skills, PI_SKILL_PATHS);

for (const skillRoot of PLUGIN_SKILL_ROOTS) {
  const absoluteRoot = path.join(root, skillRoot);
  assert.ok(fs.statSync(absoluteRoot).isDirectory(), `missing Pi skill root: ${skillRoot}`);
  const bundles = fs
    .readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(absoluteRoot, entry.name, "SKILL.md")));
  assert.ok(bundles.length > 0, `no one-level SKILL.md bundles in ${skillRoot}`);
}

const settingsPath = path.join(root, ".pi", "settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
assert.deepEqual(settings.packages, [".."]);
assert.ok(fs.existsSync(path.join(root, "pi", "README.md")), "missing pi/README.md");

console.log(`pi validation ok: ${PLUGIN_SKILL_ROOTS.length} plugin roots`);
