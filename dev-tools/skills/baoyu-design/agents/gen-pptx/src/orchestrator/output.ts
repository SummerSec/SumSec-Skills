// Write the .pptx Buffer to disk. Replaces the claude.ai host download (Ye) /
// connectrpc upload (Je/He/Xe).

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export async function writeOutput(
  buffer: Buffer,
  outDir: string,
  filename: string | undefined,
): Promise<string> {
  const name = `${(filename || "deck").replace(/[^\w-]/g, "_")}.pptx`;
  const dir = resolve(outDir);
  await mkdir(dir, { recursive: true });
  const path = join(dir, name);
  await writeFile(path, buffer);
  return path;
}
