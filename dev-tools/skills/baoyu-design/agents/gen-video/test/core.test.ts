import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFfmpegArgs } from "../src/orchestrator/encode.ts";
import { validate } from "../src/validate/validate.ts";

const common = { width: 1920, height: 1080, fps: 30, crf: 18, outPath: "/tmp/out" };

test("buildFfmpegArgs: mp4 (default)", () => {
  const args = buildFfmpegArgs({ ...common, format: "mp4", outPath: "/tmp/a.mp4" });
  assert.ok(args.includes("libx264"));
  assert.ok(args.includes("+faststart"));
  assert.ok(args.includes("yuv420p"));
  assert.ok(args.includes("scale=1920:1080:flags=lanczos"));
  assert.ok(args.includes("image2pipe"));
  assert.equal(args[args.length - 1], "/tmp/a.mp4");
});

test("buildFfmpegArgs: webm uses vp9", () => {
  const args = buildFfmpegArgs({ ...common, format: "webm", outPath: "/tmp/a.webm" });
  assert.ok(args.includes("libvpx-vp9"));
  assert.ok(!args.includes("libx264"));
});

test("buildFfmpegArgs: gif uses palette filters", () => {
  const args = buildFfmpegArgs({ ...common, format: "gif", outPath: "/tmp/a.gif" });
  const vf = args[args.indexOf("-vf") + 1];
  assert.ok(vf.includes("palettegen"));
  assert.ok(vf.includes("paletteuse"));
  assert.ok(!args.includes("libx264"));
});

test("buildFfmpegArgs: crf threads through", () => {
  const args = buildFfmpegArgs({ ...common, format: "mp4", crf: 23, outPath: "/tmp/a.mp4" });
  assert.equal(args[args.indexOf("-crf") + 1], "23");
});

const facts = {
  fontsReady: true,
  captureActive: true,
  hasFallback: false,
  duplicateFrames: 0,
  frameCount: 100,
  duration: 10,
};

test("validate: clean run → no flags", () => {
  assert.deepEqual(validate(facts), []);
});

test("validate: capture off with no fallback warns", () => {
  const flags = validate({ ...facts, captureActive: false, hasFallback: false });
  assert.ok(flags.some((f) => f.kind === "capture_mode_off"));
});

test("validate: capture off but fallback given → no capture_mode_off", () => {
  const flags = validate({ ...facts, captureActive: false, hasFallback: true });
  assert.ok(!flags.some((f) => f.kind === "capture_mode_off"));
});

test("validate: nearly-all duplicate frames warns (seeking broken)", () => {
  const flags = validate({ ...facts, duplicateFrames: 99, frameCount: 100 });
  assert.ok(flags.some((f) => f.kind === "duplicate_frames"));
});

test("validate: ~half duplicate frames is fine (paced explainer holds)", () => {
  const flags = validate({ ...facts, duplicateFrames: 52, frameCount: 100 });
  assert.ok(!flags.some((f) => f.kind === "duplicate_frames"));
});

test("validate: zero duration warns", () => {
  const flags = validate({ ...facts, duration: 0 });
  assert.ok(flags.some((f) => f.kind === "zero_duration"));
});

test("validate: fonts timeout warns", () => {
  const flags = validate({ ...facts, fontsReady: false });
  assert.ok(flags.some((f) => f.kind === "fonts_timeout"));
});
