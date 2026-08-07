#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const runtime = require('./runtime');

const RULES_FILENAME = 'semantic-rules.md';

function findNearestRulesFile(startDir) {
  let current = path.resolve(startDir || process.cwd());
  for (;;) {
    const candidate = path.join(current, RULES_FILENAME);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function getPluginRulesPath() {
  return path.join(runtime.getPluginRoot(), RULES_FILENAME);
}

function resolveRulesPath(options = {}) {
  const {
    cwd = process.cwd(),
    filePath = '',
    ruleSource = 'project-first',
  } = options;

  if (ruleSource !== 'plugin-only') {
    const startDir = filePath ? path.dirname(path.resolve(filePath)) : path.resolve(cwd);
    const projectRules = findNearestRulesFile(startDir);
    if (projectRules) {
      return { path: projectRules, source: 'project' };
    }
  }

  const pluginRules = getPluginRulesPath();
  if (fs.existsSync(pluginRules)) {
    return { path: pluginRules, source: 'plugin' };
  }

  return { path: null, source: 'none' };
}

module.exports = {
  RULES_FILENAME,
  findNearestRulesFile,
  getPluginRulesPath,
  resolveRulesPath,
};
