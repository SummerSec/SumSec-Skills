/**
 * Hook 公共工具：stdin 读取、升级系统、JSON 安全输出
 *
 * @module hook-utils
 */

const fs = require('fs');
const path = require('path');

/**
 * 从 stdin 读取并解析 JSON。
 * @returns {Object} 解析后的输入对象，失败返回 {}
 */
function readStdin() {
  try {
    const data = fs.readFileSync(0, 'utf8');
    if (data.trim()) return JSON.parse(data);
  } catch {
    // stdin 不可用或格式错误
  }
  return {};
}

/**
 * 输出 JSON 并退出（永不抛异常）。
 * @param {Object} obj
 */
function outputJson(obj) {
  try {
    console.log(JSON.stringify(obj));
  } catch {
    console.log(JSON.stringify({ continue: true }));
  }
  process.exit(0);
}

/**
 * 从 session 中读取升级信息。PreToolUse 不传 sessionTraps（不写记录），
 * PostToolUse 在 recordDetection 之后传入 session 数据。
 * @param {string} libDir - lib 目录的绝对路径
 * @returns {{ level: number, sessionTraps: Object }|null}
 */
function computeEscalation(libDir) {
  try {
    const stateManager = require(path.join(libDir, 'state-manager'));
    const level = stateManager.computeEscalationLevel();
    if (level > 0) {
      const session = stateManager.getSessionStats();
      return { level, sessionTraps: session.trapOccurrences };
    }
  } catch {
    // state-manager 不可用
  }
  return null;
}

/**
 * 记录一条检测到 state-manager（PostToolUse / UserPromptSubmit 使用）。
 * @param {string} libDir - lib 目录的绝对路径
 * @param {string} trapId
 * @param {string} word
 * @param {string} filePath
 */
function recordDetection(libDir, trapId, word, filePath) {
  try {
    const stateManager = require(path.join(libDir, 'state-manager'));
    stateManager.recordDetection(trapId, word, filePath);
  } catch {
    // state-manager 不可用
  }
}

module.exports = { readStdin, outputJson, computeEscalation, recordDetection };