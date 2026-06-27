const fs = require("fs");
const os = require("os");
const path = require("path");

const DEFAULT_MODE = "full";
const VALID_MODES = ["off", "lite", "full", "ultra", "review"];
const RUNTIME_MODES = ["off", "lite", "full", "ultra"];

function normalizeMode(mode) {
  if (typeof mode !== "string") return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

function normalizeConfigMode(mode) {
  if (typeof mode !== "string") return null;
  const normalized = mode.trim().toLowerCase();
  return VALID_MODES.includes(normalized) ? normalized : null;
}

function normalizePersistedMode(mode) {
  return normalizeMode(mode) || normalizeConfigMode(mode);
}

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, "ponytail");
  }
  if (process.platform === "win32") {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
      "ponytail"
    );
  }
  return path.join(os.homedir(), ".config", "ponytail");
}

function getConfigPath() {
  return path.join(getConfigDir(), "config.json");
}

function getDefaultMode() {
  const envMode = process.env.PONYTAIL_DEFAULT_MODE;
  if (envMode) {
    const normalized = normalizeConfigMode(envMode);
    if (normalized) return normalized;
  }

  try {
    const config = JSON.parse(fs.readFileSync(getConfigPath(), "utf8"));
    const normalized = normalizeConfigMode(config.defaultMode);
    if (normalized) return normalized;
  } catch {
    // fall through
  }

  return DEFAULT_MODE;
}

module.exports = {
  DEFAULT_MODE,
  normalizeMode,
  normalizePersistedMode,
  getDefaultMode,
};
