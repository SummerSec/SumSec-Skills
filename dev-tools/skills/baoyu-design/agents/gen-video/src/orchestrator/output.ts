// Compute the output path (sanitized basename + format extension) and ensure the
// directory exists. ffmpeg writes the file itself.

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { VideoFormat } from "../types.ts";

export async function resolveOutputPath(
  outDir: string,
  filename: string | undefined,
  format: VideoFormat,
): Promise<string> {
  const ext = format === "webm" ? "webm" : format === "gif" ? "gif" : "mp4";
  const name = `${(filename || "video").replace(/[^\w-]/g, "_")}.${ext}`;
  const dir = resolve(outDir);
  await mkdir(dir, { recursive: true });
  return join(dir, name);
}
