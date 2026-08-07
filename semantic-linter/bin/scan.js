#!/usr/bin/env node
/**
 * CLI 扫描工具：主动扫描指令文件中的语义陷阱词汇
 *
 * 用法：
 *   node bin/scan.js <file>          扫描单个文件
 *   node bin/scan.js <directory>     递归扫描目录
 *   node bin/scan.js --all           扫描当前目录
 *   node bin/scan.js --json          JSON 输出
 *   node bin/scan.js --help          显示帮助
 */

const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, '..', 'lib');
const fileDetector = require(path.join(libDir, 'file-detector'));
const contentScanner = require(path.join(libDir, 'content-scanner'));
const structuralAnalyzer = require(path.join(libDir, 'structural-analyzer'));
const reportFormatter = require(path.join(libDir, 'report-formatter'));
const configLoader = require(path.join(libDir, 'config-loader'));
const { getToolVersion, JSON_SCHEMA_VERSION } = require(path.join(libDir, 'meta'));

const { ANSI } = reportFormatter;

const SKIP_DIRS = new Set(['node_modules', '.git', '.svn', '__pycache__', '.claude']);

function showHelp() {
  console.log(`
${ANSI.bold}semantic-linter${ANSI.reset} - 语义陷阱检测器 CLI

${ANSI.bold}用法:${ANSI.reset}
  semantic-lint <file>          扫描单个文件
  semantic-lint <directory>     递归扫描目录中的指令文件
  semantic-lint --all           扫描当前目录中的所有指令文件
  semantic-lint --json [target] JSON 格式输出

${ANSI.bold}选项:${ANSI.reset}
  --all         扫描当前工作目录（递归）
  --json        以 JSON 格式输出结果
  --help, -h    显示帮助信息

${ANSI.bold}退出码:${ANSI.reset}
  0   未发现语义陷阱
  1   发现语义陷阱
  2   参数错误或文件未找到

${ANSI.bold}检测的文件模式:${ANSI.reset}
  文件名: skill.md, claude.md
  后缀:   *.prompt.md, *_definitions.md, *_examples.md
  目录:   /skills/, /agents/, /commands/, /rules/, /prompts/
`);
}

/**
 * 递归查找目录中的指令文件
 * @param {string} dir
 * @returns {string[]}
 */
function findInstructionFiles(dir) {
  const results = [];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && fileDetector.isInstructionFile(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results.sort();
}

/**
 * 扫描单个文件并返回结果
 * @param {string} filePath
 * @returns {Object}
 */
function scanFile(filePath) {
  const abs = path.resolve(filePath);
  const cfg = configLoader.loadConfigForFile(abs);
  if (configLoader.shouldIgnoreFile(abs, cfg)) {
    return { filePath: abs, lexiconMatches: [], structuralRisks: [], skipped: true };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  let lexiconMatches = contentScanner.scan(content);
  lexiconMatches = configLoader.applyConfig(lexiconMatches, [], cfg).lexiconMatches;
  let structuralRisks = structuralAnalyzer.analyze(content, lexiconMatches);
  structuralRisks = configLoader.applyConfig([], structuralRisks, cfg).structuralRisks;
  return { filePath: abs, lexiconMatches, structuralRisks, skipped: false };
}

/**
 * 输出终端格式的扫描结果
 * @param {Array<Object>} results
 * @param {string} baseDir
 */
function outputTerminal(results, baseDir) {
  const ver = getToolVersion();
  console.log(`\n${ANSI.bold}semantic-linter v${ver}${ANSI.reset}\n`);

  let totalFindings = 0;
  const severityCounts = { critical: 0, high: 0, 'medium-high': 0, medium: 0, low: 0 };

  for (const { filePath, lexiconMatches, structuralRisks, skipped } of results) {
    const relativePath = path.relative(baseDir, filePath);
    const findings = lexiconMatches.length + structuralRisks.length;
    if (!skipped) totalFindings += findings;

    console.log(`${ANSI.bold}${ANSI.underline}━━━ ${relativePath} ━━━${ANSI.reset}\n`);

    if (skipped) {
      console.log(`${ANSI.dim}（已根据 ${configLoader.CONFIG_NAME} 的 ignorePathSubstrings 跳过）${ANSI.reset}\n`);
      continue;
    }

    const cliReport = reportFormatter.formatCli(lexiconMatches, structuralRisks, filePath);
    console.log(cliReport);
    console.log('');

    for (const m of lexiconMatches) {
      severityCounts[m.severity] = (severityCounts[m.severity] || 0) + 1;
    }
    for (const r of structuralRisks) {
      severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
    }
  }

  // 汇总
  console.log(`${ANSI.bold}━━━ 扫描结果 ━━━${ANSI.reset}`);
  console.log(`  文件数: ${results.length}`);

  if (totalFindings === 0) {
    console.log(`  ${ANSI.green}问题总数: 0${ANSI.reset}`);
  } else {
    const details = Object.entries(severityCounts)
      .filter(([, count]) => count > 0)
      .map(([severity, count]) => `${severity}: ${count}`)
      .join(', ');
    console.log(`  ${ANSI.red}问题总数: ${totalFindings}${ANSI.reset} (${details})`);
  }
  console.log('');
}

/**
 * 输出 JSON 格式的扫描结果
 * @param {Array<Object>} results
 * @param {string} baseDir
 */
function outputJson(results, baseDir) {
  const files = results.map(({ filePath, lexiconMatches, structuralRisks, skipped }) => ({
    path: path.relative(baseDir, filePath),
    skipped: !!skipped,
    lexiconMatches,
    structuralRisks,
    overallRisk: skipped ? null : reportFormatter.computeOverallRisk(lexiconMatches, structuralRisks),
  }));

  const totalFindings = results.reduce(
    (sum, r) => (r.skipped ? sum : sum + r.lexiconMatches.length + r.structuralRisks.length),
    0
  );

  const output = {
    schemaVersion: JSON_SCHEMA_VERSION,
    version: getToolVersion(),
    files,
    summary: {
      filesScanned: results.length,
      filesSkipped: results.filter((r) => r.skipped).length,
      totalFindings,
    },
  };

  console.log(JSON.stringify(output, null, 2));
}

// ===== 主流程 =====

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const jsonMode = args.includes('--json');
const allMode = args.includes('--all');
const positionalArgs = args.filter(a => !a.startsWith('--') && a !== '-h');

let targetPath;
if (allMode) {
  targetPath = process.cwd();
} else if (positionalArgs.length > 0) {
  targetPath = path.resolve(positionalArgs[0]);
} else {
  showHelp();
  process.exit(2);
}

// 检查目标是否存在
if (!fs.existsSync(targetPath)) {
  console.error(`${ANSI.red}错误: 路径不存在: ${targetPath}${ANSI.reset}`);
  process.exit(2);
}

const stat = fs.statSync(targetPath);
let filesToScan = [];
let baseDir;

if (stat.isFile()) {
  filesToScan = [targetPath];
  baseDir = path.dirname(targetPath);
} else if (stat.isDirectory()) {
  filesToScan = findInstructionFiles(targetPath);
  baseDir = targetPath;
} else {
  console.error(`${ANSI.red}错误: 不支持的路径类型: ${targetPath}${ANSI.reset}`);
  process.exit(2);
}

if (filesToScan.length === 0) {
  if (jsonMode) {
    console.log(JSON.stringify({
      schemaVersion: JSON_SCHEMA_VERSION,
      version: getToolVersion(),
      files: [],
      summary: { filesScanned: 0, filesSkipped: 0, totalFindings: 0 },
    }));
  } else {
    console.log(`\n${ANSI.yellow}未找到指令文件${ANSI.reset}\n`);
  }
  process.exit(0);
}

// 扫描所有文件
const results = filesToScan.map(f => scanFile(f));

// 输出结果
if (jsonMode) {
  outputJson(results, baseDir);
} else {
  outputTerminal(results, baseDir);
}

// 退出码（被配置跳过的文件不计入）
const totalFindings = results.reduce(
  (sum, r) => (r.skipped ? sum : sum + r.lexiconMatches.length + r.structuralRisks.length),
  0
);
process.exit(totalFindings > 0 ? 1 : 0);
