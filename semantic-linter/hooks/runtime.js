#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const MODE_FILE = '.semantic-linter-mode';

function getPluginRoot() {
  return process.env.PLUGIN_ROOT
    || process.env.CODEX_PLUGIN_ROOT
    || process.env.CLAUDE_PLUGIN_ROOT
    || path.resolve(__dirname, '..');
}

function getPluginDataDir() {
  return process.env.PLUGIN_DATA
    || process.env.CODEX_PLUGIN_DATA
    || process.env.CLAUDE_PLUGIN_DATA
    || process.env.SEMANTIC_LINTER_STATE_DIR
    || path.join(process.env.HOME || process.env.USERPROFILE || os.homedir() || '.', '.semantic-linter');
}

function getModeFilePath() {
  return path.join(getPluginDataDir(), MODE_FILE);
}

function isCodex() {
  return Boolean(process.env.PLUGIN_ROOT || process.env.PLUGIN_DATA || process.env.CODEX_PLUGIN_ROOT);
}

function readMode() {
  try {
    return fs.readFileSync(getModeFilePath(), 'utf8').trim() || null;
  } catch {
    return null;
  }
}

function setMode(mode) {
  fs.mkdirSync(path.dirname(getModeFilePath()), { recursive: true });
  fs.writeFileSync(getModeFilePath(), String(mode || '').trim(), 'utf8');
}

function clearMode() {
  try {
    fs.unlinkSync(getModeFilePath());
  } catch {
    // best effort
  }
}

function writeHookOutput({ continueValue = true, systemMessage = '', eventName = '', additionalContext = '' } = {}) {
  const output = {};
  if (typeof continueValue === 'boolean') output.continue = continueValue;
  if (systemMessage) output.systemMessage = systemMessage;
  if (eventName || additionalContext) {
    output.hookSpecificOutput = {
      hookEventName: eventName,
      additionalContext,
    };
  }
  console.log(JSON.stringify(output));
}

module.exports = {
  clearMode,
  getModeFilePath,
  getPluginDataDir,
  getPluginRoot,
  isCodex,
  readMode,
  setMode,
  writeHookOutput,
};
