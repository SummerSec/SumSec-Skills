/**
 * Load repo-local .semantic-linter.json by walking upward from a file or workspace directory.
 *
 * @module config-loader
 */

const fs = require('fs');
const path = require('path');

const CONFIG_NAME = '.semantic-linter.json';

function emptyConfig() {
  return {
    ignoreTrapIds: new Set(),
    ignorePathSubstrings: [],
    ignoreStructuralTypes: new Set(),
    defaultMode: '',
    ruleSource: '',
    enablePromptScan: false,
    maxFindingsPerHook: null,
  };
}

function findConfigFile(dir) {
  let current = path.resolve(dir);
  for (;;) {
    const candidate = path.join(current, CONFIG_NAME);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function parseConfigFile(configPath) {
  const out = emptyConfig();
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return out;
  }
  if (!raw || typeof raw !== 'object') return out;

  if (Array.isArray(raw.ignoreTrapIds)) {
    for (const id of raw.ignoreTrapIds) {
      if (typeof id === 'string' && id.trim()) out.ignoreTrapIds.add(id.trim());
    }
  }
  if (Array.isArray(raw.ignorePathSubstrings)) {
    out.ignorePathSubstrings = raw.ignorePathSubstrings.filter((s) => typeof s === 'string' && s.length > 0);
  }
  if (Array.isArray(raw.ignoreStructuralTypes)) {
    for (const type of raw.ignoreStructuralTypes) {
      if (typeof type === 'string' && type.trim()) out.ignoreStructuralTypes.add(type.trim());
    }
  }
  if (typeof raw.defaultMode === 'string') out.defaultMode = raw.defaultMode;
  if (typeof raw.ruleSource === 'string') out.ruleSource = raw.ruleSource;
  if (typeof raw.enablePromptScan === 'boolean') out.enablePromptScan = raw.enablePromptScan;
  if (Number.isInteger(raw.maxFindingsPerHook) && raw.maxFindingsPerHook > 0) {
    out.maxFindingsPerHook = raw.maxFindingsPerHook;
  }

  return out;
}

function loadConfigForFile(absoluteFilePath) {
  const dir = path.dirname(path.resolve(absoluteFilePath));
  const found = findConfigFile(dir);
  return found ? parseConfigFile(found) : emptyConfig();
}

function loadConfigForWorkspace(cwd = process.cwd()) {
  const found = findConfigFile(path.resolve(cwd));
  return found ? parseConfigFile(found) : emptyConfig();
}

function shouldIgnoreFile(absoluteFilePath, config) {
  if (!config.ignorePathSubstrings.length) return false;
  const norm = absoluteFilePath.replace(/\\/g, '/');
  return config.ignorePathSubstrings.some((sub) => norm.includes(sub.replace(/\\/g, '/')));
}

function applyConfig(lexiconMatches, structuralRisks, config) {
  let lex = lexiconMatches;
  let struct = structuralRisks;

  if (config.ignoreTrapIds.size > 0) {
    lex = lex.filter((match) => !config.ignoreTrapIds.has(match.trapId));
  }
  if (config.ignoreStructuralTypes.size > 0) {
    struct = struct.filter((risk) => !config.ignoreStructuralTypes.has(risk.type));
  }

  return { lexiconMatches: lex, structuralRisks: struct };
}

module.exports = {
  CONFIG_NAME,
  emptyConfig,
  loadConfigForFile,
  loadConfigForWorkspace,
  shouldIgnoreFile,
  applyConfig,
  findConfigFile,
};
