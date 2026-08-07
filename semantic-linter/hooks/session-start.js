#!/usr/bin/env node
const config = require('./config');
const rulesResolver = require('./rules-resolver');
const runtime = require('./runtime');

function buildContext(rulesPath, options = {}) {
  const mode = options.mode || 'guarded';
  const source = options.source === 'project' ? 'project'
    : options.source === 'plugin' ? 'plugin'
      : 'fallback';

  if (!rulesPath) {
    return `STL：semantic-linter is active in ${mode} mode. No semantic-rules.md file was found, so narrow wide-boundary wording conservatively when editing skill / agent / command / prompt instruction files.`;
  }

  return `STL：semantic-linter is active in ${mode} mode. Current rules source: ${source} file ${rulesPath}. Before writing or editing skill / agent / command / prompt instruction files, open that file on demand and narrow wide-boundary wording; if a wide term must stay, apply its boundary-anchoring guidance.`;
}

module.exports = { buildContext };

if (require.main === module) {
  const workspaceConfig = config.loadWorkspaceConfig();
  const mode = config.getActiveMode();

  if (mode === 'off') {
    runtime.writeHookOutput({ continueValue: true });
    process.exit(0);
  }

  const resolved = rulesResolver.resolveRulesPath({
    cwd: process.cwd(),
    ruleSource: config.getRuleSource(workspaceConfig),
  });

  runtime.writeHookOutput({
    continueValue: true,
    eventName: 'SessionStart',
    additionalContext: buildContext(resolved.path, { mode, source: resolved.source }),
  });
}
