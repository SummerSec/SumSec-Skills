/**
 * 将语义陷阱检测结果格式化为结构化报告
 * Hook 输出为旁白式单行「STL：…」；CLI 仍为彩色终端格式
 *
 * @module report-formatter
 */

const path = require('path');
const lexicon = require('./lexicon-data');

const STL = 'STL：';

const ROLE_LABELS = {
  constraint_keyword: '约束关键词（高）',
  task_target: '任务目标（中）',
  auxiliary: '辅助描述（低）',
};

const TYPE_LABELS = {
  open_ended_verb: '开放式动词',
  adjective_target: '抽象化目标',
  modal_downgrade: '情态动词降级',
  missing_negation: '缺少否定清单',
};

// ANSI 颜色码（CLI 终端输出）
const ANSI = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  reset: '\x1b[0m',
};

/**
 * 词典条目的说明文案，用作「理由」
 * @param {string} word
 * @returns {string}
 */
function getLexiconReason(word) {
  const pair = lexicon.wideWordsZh.get(word) || lexicon.wideWordsEn.get(String(word).toLowerCase());
  if (pair && pair.scenario) return pair.scenario;
  return '该词语义边界过宽，在指令中易使模型输出超出预期范围。';
}

/**
 * 根据所有检测结果计算整体风险等级
 * @param {Array<Object>} lexiconMatches
 * @param {Array<Object>} structuralRisks
 * @returns {string}
 */
function computeOverallRisk(lexiconMatches, structuralRisks) {
  let maxLevel = 0;
  for (const m of lexiconMatches) {
    maxLevel = Math.max(maxLevel, lexicon.SEVERITY_ORDER[m.severity] || 0);
  }
  for (const r of structuralRisks) {
    maxLevel = Math.max(maxLevel, lexicon.SEVERITY_ORDER[r.severity] || 0);
  }
  const entry = Object.entries(lexicon.SEVERITY_ORDER).find(([, v]) => v === maxLevel);
  return entry ? entry[0].toUpperCase() : 'LOW';
}

/**
 * 旁白式替换建议（与 Hook 正文风格一致，供测试与复用）
 * @param {Array<Object>} lexiconMatches
 * @returns {string}
 */
function buildReplacements(lexiconMatches) {
  if (lexiconMatches.length === 0) return '';
  const lines = lexiconMatches.map((m) => {
    const reason = getLexiconReason(m.word);
    const lineHint = m.line > 0 ? `第${m.line}行` : '';
    return `${STL}建议将「${m.word}」改为「${m.replacement}」，理由：${reason}${lineHint ? `（${lineHint}）` : ''}`;
  });
  return lines.join(' ');
}

/**
 * @param {'pre'|'post'} mode
 * @param {string} fileName
 * @param {Array<Object>} lexiconMatches
 * @returns {string[]}
 */
function buildLexiconNarrationLines(mode, fileName, lexiconMatches) {
  return lexiconMatches.map((m) => {
    const reason = getLexiconReason(m.word);
    const lineHint = m.line > 0 ? `第${m.line}行` : '';
    if (mode === 'pre') {
      return `${STL}即将写入「${fileName}」${lineHint ? `${lineHint}` : ''}出现「${m.word}」，建议先改为「${m.replacement}」，理由：${reason}`;
    }
    return `${STL}「${fileName}」${lineHint ? `${lineHint}` : ''}仍含「${m.word}」，建议改为「${m.replacement}」，理由：${reason}`;
  });
}

/**
 * @param {string} fileName
 * @param {Array<Object>} structuralRisks
 * @returns {string[]}
 */
function buildStructuralNarrationLines(fileName, structuralRisks) {
  return structuralRisks.map((r) => {
    const typeLabel = TYPE_LABELS[r.type] || r.type;
    const loc = r.line > 0 ? `第${r.line}行` : '全文';
    return `${STL}「${fileName}」${loc}存在结构性「${typeLabel}」（${r.context}），建议${r.suggestion}，理由：此类表述易放宽任务边界。`;
  });
}

/**
 * PreToolUse 旁白式预警（单行串联）
 * @param {Array<Object>} lexiconMatches
 * @param {Array<Object>} structuralRisks
 * @param {string} filePath
 * @returns {string}
 */
function formatPre(lexiconMatches, structuralRisks, filePath) {
  const totalFindings = lexiconMatches.length + structuralRisks.length;
  if (totalFindings === 0) return '';

  const fileName = path.basename(filePath);
  const risk = computeOverallRisk(lexiconMatches, structuralRisks);
  const head = `${STL}写入前预警：「${fileName}」共 ${totalFindings} 处待处理（整体风险 ${risk}），请先向用户展示下列旁白建议并确认是否替换后再写入。`;
  const lexLines = buildLexiconNarrationLines('pre', fileName, lexiconMatches);
  const structLines = buildStructuralNarrationLines(fileName, structuralRisks);
  return [head, ...lexLines, ...structLines].join(' ');
}

/**
 * PostToolUse 旁白式确认（单行串联）
 * @param {Array<Object>} lexiconMatches
 * @param {Array<Object>} structuralRisks
 * @param {string} filePath
 * @returns {string}
 */
function format(lexiconMatches, structuralRisks, filePath) {
  const totalFindings = lexiconMatches.length + structuralRisks.length;
  if (totalFindings === 0) return '';

  const fileName = path.basename(filePath);
  const risk = computeOverallRisk(lexiconMatches, structuralRisks);
  const head = `${STL}写入后确认：「${fileName}」仍含 ${totalFindings} 处语义陷阱（整体风险 ${risk}），请向用户说明并询问是否按下列建议修复。`;
  const lexLines = buildLexiconNarrationLines('post', fileName, lexiconMatches);
  const structLines = buildStructuralNarrationLines(fileName, structuralRisks);
  return [head, ...lexLines, ...structLines].join(' ');
}

/**
 * 根据严重等级返回对应 ANSI 颜色
 * @param {string} severity
 * @returns {string}
 */
function severityColor(severity) {
  const level = lexicon.SEVERITY_ORDER[severity] || 0;
  return level >= 3 ? ANSI.red : ANSI.yellow;
}

/**
 * CLI 终端彩色报告
 * @param {Array<Object>} lexiconMatches
 * @param {Array<Object>} structuralRisks
 * @param {string} filePath
 * @returns {string}
 */
function formatCli(lexiconMatches, structuralRisks, filePath) {
  const totalFindings = lexiconMatches.length + structuralRisks.length;
  if (totalFindings === 0) {
    return `  ${ANSI.green}✔ 未发现语义陷阱${ANSI.reset}`;
  }

  const parts = [];

  for (const m of lexiconMatches) {
    const color = severityColor(m.severity);
    const role = ROLE_LABELS[m.contextRole] || m.contextRole;
    parts.push(`  ${color}✖ [${m.severity}] L${m.line}  "${m.word}" → "${m.replacement}"  (${m.trapId})${ANSI.reset}`);
    parts.push(`    ${ANSI.dim}${role}: ${m.context}${ANSI.reset}`);

    const pair = lexicon.wideWordsZh.get(m.word) || lexicon.wideWordsEn.get(m.word.toLowerCase());
    if (pair) {
      parts.push(`    ${ANSI.dim}→ ${pair.scenario}${ANSI.reset}`);
    }
    parts.push('');
  }

  for (const r of structuralRisks) {
    const color = severityColor(r.severity);
    const typeLabel = TYPE_LABELS[r.type] || r.type;
    const lineInfo = r.line > 0 ? `L${r.line}` : '全局';
    parts.push(`  ${color}⚠ [${r.severity}] ${lineInfo}  ${typeLabel}: ${r.context}${ANSI.reset}`);
    parts.push(`    ${ANSI.dim}→ ${r.suggestion}${ANSI.reset}`);
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * UserPromptSubmit：单行旁白，列出命中词与替换
 * @param {Array<Object>} lexiconMatches
 * @returns {string}
 */
function formatPromptWarning(lexiconMatches) {
  if (lexiconMatches.length === 0) return '';

  const detailLines = lexiconMatches.map((m) => {
    const reason = getLexiconReason(m.word);
    return `${STL}你的指令中出现「${m.word}」，建议改为「${m.replacement}」，理由：${reason}`;
  });
  const head = `${STL}用户消息中含 ${lexiconMatches.length} 处宽边界词；用于指令类文件时易使模型输出超出预期范围。`;
  return [head, ...detailLines].join(' ');
}

/**
 * 升级旁白（suffix 供 Hook 直接拼在 systemMessage 末尾；prefix 已废弃，恒为空以保持兼容）
 * @param {number} level - 0-3
 * @param {Object} sessionTraps - { trapId: { count, files } }
 * @returns {{ prefix: string, suffix: string }}
 */
function buildEscalation(level, sessionTraps) {
  if (!level || level <= 0) return { prefix: '', suffix: '' };

  const repeated = [];
  if (sessionTraps) {
    for (const [trapId, data] of Object.entries(sessionTraps)) {
      if (data.count >= 2) {
        repeated.push(`${trapId}（${data.count} 次）`);
      }
    }
  }
  const repeatedText = repeated.length > 0 ? repeated.join('、') : '（无统计）';

  if (level >= 3) {
    const fileCount = sessionTraps
      ? new Set(Object.values(sessionTraps).flatMap(d => d.files || [])).size
      : 0;
    return {
      prefix: '',
      suffix: ` ${STL}升级提示（持续）：陷阱词已在 ${fileCount} 个文件中出现：${repeatedText}，建议在项目级 CLAUDE.md 中增加词汇约定以减少复发。`,
    };
  }

  if (level >= 2) {
    return {
      prefix: '',
      suffix: ` ${STL}升级提示（重复）：本会话内以下陷阱词已出现 3 次及以上：${repeatedText}，请检查表述习惯并统一收窄用词。`,
    };
  }

  return {
    prefix: '',
    suffix: ` ${STL}升级提示（注意）：本会话内部分陷阱词已多次出现：${repeatedText}，建议优先替换为更窄的术语。`,
  };
}

/**
 * 将升级旁白拼接到 Hook 报告末尾（与 pre-tool-use / semantic-linter 行为一致，便于测试）
 * @param {string} report
 * @param {{ prefix: string, suffix: string }} esc
 * @returns {string}
 */
function appendEscalationToReport(report, esc) {
  if (!esc || !esc.suffix) return report;
  return report + esc.suffix;
}

module.exports = {
  ANSI,
  format,
  formatPre,
  formatCli,
  formatPromptWarning,
  buildReplacements,
  computeOverallRisk,
  buildEscalation,
  appendEscalationToReport,
  severityColor,
};
