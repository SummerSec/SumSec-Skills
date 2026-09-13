import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function skip(reason) {
  console.log(`sumsec-skills postinstall skipped: ${reason}`);
  process.exit(0);
}

if (process.env.PI_CODING_AGENT === "true" || process.env.AI_AGENT === "pi") {
  skip("Pi package install");
}

const submoduleGit = path.join(root, "claude-plugins-official", ".git");
if (!fs.existsSync(submoduleGit)) {
  skip("submodules not initialized");
}

const script = path.join(root, ".claude", "skills", "sync-skills", "scripts", "sync-skills.py");
const result = spawnSync("python", [script], { cwd: root, stdio: "inherit" });
process.exit(result.status ?? 1);
