#!/usr/bin/env node
const path = require('path');

const configLoader = require(path.join(__dirname, '..', 'lib', 'config-loader'));
const runtime = require('./runtime');

const DEFAULT_MODE = 'guarded';
const VALID_MODES = new Set(['off', 'pointer', 'guarded', 'strict']);

function normalizeMode(value) {
  if (typeof value !== 'string') return null;
  const mode = value.trim().toLowerCase();
  return VALID_MODES.has(mode) ? mode : null;
}

function loadWorkspaceConfig(cwd = process.cwd()) {
  return configLoader.loadConfigForWorkspace(cwd);
}

function getDefaultMode(cwd = process.cwd()) {
  const envMode = normalizeMode(process.env.SEMANTIC_LINTER_MODE || process.env.SEMANTIC_LINTER_DEFAULT_MODE);
  if (envMode) return envMode;

  const cfg = loadWorkspaceConfig(cwd);
  const cfgMode = normalizeMode(cfg.defaultMode);
  if (cfgMode) return cfgMode;

  return DEFAULT_MODE;
}

function getActiveMode(cwd = process.cwd()) {
  const persisted = normalizeMode(runtime.readMode());
  return persisted || getDefaultMode(cwd);
}

function shouldEnablePromptScan(mode, workspaceConfig) {
  if (mode === 'strict') return true;
  return Boolean(workspaceConfig && workspaceConfig.enablePromptScan);
}

function getRuleSource(workspaceConfig) {
  const value = workspaceConfig && typeof workspaceConfig.ruleSource === 'string'
    ? workspaceConfig.ruleSource.trim().toLowerCase()
    : '';
  return value === 'plugin-only' ? 'plugin-only' : 'project-first';
}

function getMaxFindingsPerHook(workspaceConfig) {
  const raw = workspaceConfig && workspaceConfig.maxFindingsPerHook;
  return Number.isInteger(raw) && raw > 0 ? raw : 3;
}

module.exports = {
  DEFAULT_MODE,
  VALID_MODES,
  getActiveMode,
  getDefaultMode,
  getMaxFindingsPerHook,
  getRuleSource,
  loadWorkspaceConfig,
  normalizeMode,
  shouldEnablePromptScan,
};
