/**
 * 检测文件是否为大模型指令文件（Skill/Prompt/Agent）
 * 基于文件路径模式进行判定
 *
 * @module file-detector
 */

const path = require('path');

// 文件名精确匹配列表（不区分大小写）
const INSTRUCTION_BASENAMES = [
  'agents.md',
  'skill.md',
  'claude.md',
];

// 文件名后缀匹配列表
const INSTRUCTION_SUFFIXES = [
  '.prompt.md',
  '_definitions.md',
  '_examples.md',
];

// 目录匹配列表 —— 在这些目录下的文件视为指令文件
const INSTRUCTION_DIRS = [
  '/skills/',
  '/agents/',
  '/commands/',
  '/rules/',
  '/prompts/',
];

/**
 * 判断文件路径是否指向大模型指令文件
 * @param {string} filePath - 绝对路径或相对路径
 * @returns {boolean}
 */
function isInstructionFile(filePath) {
  if (!filePath) return false;

  // 仅检查 .md 文件
  if (!filePath.toLowerCase().endsWith('.md')) return false;

  const basename = path.basename(filePath).toLowerCase();
  const normalized = filePath.replace(/\\/g, '/');

  // 精确文件名匹配
  if (INSTRUCTION_BASENAMES.includes(basename)) return true;

  // 文件名后缀匹配
  for (const suffix of INSTRUCTION_SUFFIXES) {
    if (basename.endsWith(suffix)) return true;
  }

  // 目录路径匹配
  for (const dir of INSTRUCTION_DIRS) {
    if (normalized.includes(dir)) return true;
  }

  return false;
}

module.exports = { isInstructionFile };
