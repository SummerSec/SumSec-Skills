#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const runtime = require('./runtime');
const config = require('./config');
const { readStdin, outputJson, recordDetection, computeEscalation } = require(path.join(__dirname, '..', 'lib', 'hook-utils'));
const fileDetector = require(path.join(__dirname, '..', 'lib', 'file-detector'));
const contentScanner = require(path.join(__dirname, '..', 'lib', 'content-scanner'));
const structuralAnalyzer = require(path.join(__dirname, '..', 'lib', 'structural-analyzer'));
const reportFormatter = require(path.join(__dirname, '..', 'lib', 'report-formatter'));
const configLoader = require(path.join(__dirname, '..', 'lib', 'config-loader'));

const input = readStdin();
const toolName = input.tool_name || '';
const toolInput = input.tool_input || {};
const filePath = toolInput.file_path || '';
const mode = config.getActiveMode(filePath ? path.dirname(path.resolve(filePath)) : process.cwd());

if (!filePath || mode === 'off' || mode === 'pointer') {
  outputJson({ continue: true });
}

if (!fileDetector.isInstructionFile(filePath)) {
  outputJson({ continue: true });
}

const absFile = path.resolve(filePath);
const workspaceConfig = configLoader.loadConfigForFile(absFile);
if (configLoader.shouldIgnoreFile(absFile, workspaceConfig)) {
  outputJson({ continue: true });
}

let content = '';
if (toolName === 'Write' && toolInput.content) {
  content = toolInput.content;
} else {
  try {
    content = fs.readFileSync(absFile, 'utf8');
  } catch {
    outputJson({ continue: true });
  }
}

if (!content.trim()) {
  outputJson({ continue: true });
}

let lexiconMatches = contentScanner.scan(content);
lexiconMatches = configLoader.applyConfig(lexiconMatches, [], workspaceConfig).lexiconMatches;
let structuralRisks = structuralAnalyzer.analyze(content, lexiconMatches);
structuralRisks = configLoader.applyConfig([], structuralRisks, workspaceConfig).structuralRisks;

const maxFindings = config.getMaxFindingsPerHook(workspaceConfig);
lexiconMatches = lexiconMatches.slice(0, maxFindings);
structuralRisks = structuralRisks.slice(0, maxFindings);

if (lexiconMatches.length + structuralRisks.length === 0) {
  outputJson({ continue: true });
}

for (const match of lexiconMatches) {
  recordDetection(path.join(__dirname, '..', 'lib'), match.trapId, match.word, absFile);
}

let report = reportFormatter.format(lexiconMatches, structuralRisks, absFile);
const escalation = computeEscalation(path.join(__dirname, '..', 'lib'));
if (escalation) {
  report = reportFormatter.appendEscalationToReport(
    report,
    reportFormatter.buildEscalation(escalation.level, escalation.sessionTraps),
  );
}

outputJson({ continue: true, systemMessage: report });
