const { getDefaultMode, normalizeMode } = require("./ponytail-config.cjs");
const { getPonytailInstructions } = require("./ponytail-instructions.cjs");

const MODES = ["lite", "full", "ultra"];

function resolveMode(requested) {
  const asked = normalizeMode(requested);
  if (asked && asked !== "off") return asked;

  const fallback = normalizeMode(getDefaultMode());
  return fallback && fallback !== "off" ? fallback : "full";
}

function buildInstructions(requested) {
  return getPonytailInstructions(resolveMode(requested));
}

module.exports = {
  MODES,
  resolveMode,
  buildInstructions,
};
