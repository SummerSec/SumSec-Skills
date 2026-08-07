#!/usr/bin/env node
const runtime = require('./runtime');
const config = require('./config');
const { buildContext } = require('./session-start');
const rulesResolver = require('./rules-resolver');

const mode = config.getActiveMode();
if (mode === 'off') {
  runtime.writeHookOutput({ continueValue: true });
  process.exit(0);
}

const ruleSource = config.getRuleSource(config.loadWorkspaceConfig());
const resolved = rulesResolver.resolveRulesPath({ ruleSource });

runtime.writeHookOutput({
  continueValue: true,
  eventName: 'SubagentStart',
  additionalContext: buildContext(resolved.path, { mode, source: resolved.source }),
});
