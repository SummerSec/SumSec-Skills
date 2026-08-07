#!/usr/bin/env node
const path = require('path');

const runtime = require('./runtime');
const config = require('./config');
const { readStdin, outputJson, recordDetection } = require(path.join(__dirname, '..', 'lib', 'hook-utils'));
const contentScanner = require(path.join(__dirname, '..', 'lib', 'content-scanner'));
const reportFormatter = require(path.join(__dirname, '..', 'lib', 'report-formatter'));

function extractPrompt(input) {
  return (input.user_message || input.prompt || '').trim();
}

function parseModeCommand(prompt) {
  const match = prompt.toLowerCase().match(/^[/@$]stl-mode\s+(off|pointer|guarded|strict)\s*$/);
  return match ? match[1] : null;
}

const input = readStdin();
const prompt = extractPrompt(input);
if (!prompt) outputJson({});

const modeCommand = parseModeCommand(prompt);
if (modeCommand) {
  if (modeCommand === 'off') runtime.clearMode();
  else runtime.setMode(modeCommand);
  outputJson({ continue: true, systemMessage: `STL：semantic-linter 模式已切换为 ${modeCommand}。` });
}

const workspaceConfig = config.loadWorkspaceConfig();
const mode = config.getActiveMode();
if (!config.shouldEnablePromptScan(mode, workspaceConfig)) {
  outputJson({});
}

let matches = contentScanner.scan(prompt);
const maxFindings = config.getMaxFindingsPerHook(workspaceConfig);
matches = matches.slice(0, maxFindings);
if (matches.length === 0) outputJson({});

for (const match of matches) {
  recordDetection(path.join(__dirname, '..', 'lib'), match.trapId, match.word, '__user_prompt__');
}

outputJson({ continue: true, systemMessage: reportFormatter.formatPromptWarning(matches) });
