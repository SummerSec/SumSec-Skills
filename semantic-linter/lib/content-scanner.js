/**
 * 核心扫描器：从指令文本中提取关键词，并与语义陷阱词典进行匹配
 *
 * @module content-scanner
 */

const lexicon = require('./lexicon-data');

/**
 * 去除围栏代码块和行内代码，防止示例代码产生误报
 * @param {string} content
 * @returns {string}
 */
function stripCodeBlocks(content) {
  // 去除围栏代码块 (``` ... ```)
  let stripped = content.replace(/```[\s\S]*?```/g, '');
  // 去除行内代码 (`...`)
  stripped = stripped.replace(/`[^`]+`/g, '');
  return stripped;
}

// 中文约束标记词（不含单独「不」，避免普通否定句误判为约束语境）
const ZH_CONSTRAINT_MARKERS = [
  '只', '仅', '必须', '禁止', '不能', '不允许', '只能', '严格', '强制',
  '不得', '不应', '不准', '切勿', '勿',
];
// 中文任务目标标记词
const ZH_TASK_MARKERS = ['请', '执行', '进行', '完成', '实施', '开展'];

// 英文约束标记词
const EN_CONSTRAINT_MARKERS = [/\bonly\b/i, /\bmust\b/i, /\bshall\b/i, /\bnot\b/i, /\bprohibit/i, /\bforbid/i, /\bstrictly\b/i, /\brequired\b/i];
// 英文任务目标标记词
const EN_TASK_MARKERS = [/\bplease\b/i, /\bperform\b/i, /\bexecute\b/i, /\bconduct\b/i, /\bcarry out\b/i];

/**
 * 根据上下文对匹配词汇的角色进行分类
 * @param {string} line - 包含匹配词的行
 * @returns {'constraint_keyword'|'task_target'|'auxiliary'}
 */
function classifyContextRole(line) {
  // 检查中文约束标记
  for (const marker of ZH_CONSTRAINT_MARKERS) {
    if (line.includes(marker)) return 'constraint_keyword';
  }
  // 检查英文约束标记
  for (const re of EN_CONSTRAINT_MARKERS) {
    if (re.test(line)) return 'constraint_keyword';
  }
  // 检查中文任务标记
  for (const marker of ZH_TASK_MARKERS) {
    if (line.includes(marker)) return 'task_target';
  }
  // 检查英文任务标记
  for (const re of EN_TASK_MARKERS) {
    if (re.test(line)) return 'task_target';
  }
  return 'auxiliary';
}

/**
 * 根据上下文角色调整实际严重等级
 * @param {string} baseSeverity - 基础严重等级
 * @param {string} role - 上下文角色
 * @returns {string}
 */
function effectiveSeverity(baseSeverity, role) {
  // constraint_keyword 和 task_target 保持原始等级
  if (role !== 'auxiliary') return baseSeverity;
  // 辅助性上下文：降低一个等级
  const order = lexicon.SEVERITY_ORDER;
  const level = order[baseSeverity] || 0;
  if (level <= 0) return 'low';
  const entries = Object.entries(order);
  const downgraded = entries.find(([, v]) => v === level - 1);
  return downgraded ? downgraded[0] : baseSeverity;
}

/**
 * 扫描文本内容中的语义陷阱词汇
 * @param {string} content - 完整文件内容
 * @returns {Array<Object>} 匹配结果数组
 */
function scan(content) {
  if (!content) return [];
  const stripped = stripCodeBlocks(content);
  const lines = stripped.split('\n');
  const matches = [];
  const seen = new Set(); // 去重：每个词只警告一次

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // --- 中文宽边界词匹配 ---
    for (const [wideWord, pair] of lexicon.wideWordsZh) {
      if (line.includes(wideWord) && !seen.has(pair.id + ':' + wideWord)) {
        seen.add(pair.id + ':' + wideWord);
        const role = classifyContextRole(line);
        matches.push({
          trapId: pair.id,
          word: wideWord,
          replacement: pair.narrow,
          replacementEn: pair.narrowEn,
          severity: effectiveSeverity(pair.severity, role),
          contextRole: role,
          line: i + 1,
          context: line.trim().substring(0, 80),
        });
      }
    }

    // --- 英文宽边界词匹配 ---
    const words = line.match(/\b[a-zA-Z]+\b/g);
    if (words) {
      for (const word of words) {
        const lower = word.toLowerCase();
        const pair = lexicon.wideWordsEn.get(lower);
        if (pair && !seen.has(pair.id + ':' + lower)) {
          seen.add(pair.id + ':' + lower);
          const role = classifyContextRole(line);
          matches.push({
            trapId: pair.id,
            word: word,
            replacement: pair.narrow,
            replacementEn: pair.narrowEn || pair.narrow,
            severity: effectiveSeverity(pair.severity, role),
            contextRole: role,
            line: i + 1,
            context: line.trim().substring(0, 80),
          });
        }
      }
    }
  }

  return matches;
}

module.exports = { scan, stripCodeBlocks };
