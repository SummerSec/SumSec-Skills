import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const expectedRoots = [
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

assert.equal(packageJson.dsh?.bundle?.patch, "./dsh/cordis.patch.yml");
assert.ok(packageJson.keywords?.includes("dsh"));
assert.ok(packageJson.keywords?.includes("deepseek-harness"));

const patchPath = path.join(root, packageJson.dsh.bundle.patch);
const patch = fs.readFileSync(patchPath, "utf8");
assert.match(patch, /^\s*#(?:.|\r?\n)*?\r?\n- id: skill-filesystem\r?\n/m);
assert.match(patch, /name: '@deepseek-ai\/dsh-skill-filesystem'/);
assert.match(patch, /providerName: filesystem/);
assert.match(patch, /includeDefaultRoots: true/);

for (const skillRoot of expectedRoots) {
  const absoluteRoot = path.join(root, skillRoot);
  assert.ok(fs.statSync(absoluteRoot).isDirectory(), `missing DSH skill root: ${skillRoot}`);
  const bundles = fs
    .readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(absoluteRoot, entry.name, "SKILL.md")));
  assert.ok(bundles.length > 0, `no one-level SKILL.md bundles in ${skillRoot}`);
  const expression = `new URL('../${skillRoot}/', baseUrl)`;
  assert.ok(patch.includes(expression), `DSH patch does not mount ${skillRoot}`);
}

const configuredRoots = [...patch.matchAll(/new URL\('\.\.\/([^']+\/skills)\/', baseUrl\)/g)].map(
  (match) => match[1],
);
assert.deepEqual(configuredRoots, expectedRoots);

console.log(`dsh validation ok: ${expectedRoots.length} plugin roots`);
