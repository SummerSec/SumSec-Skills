/**
 * 工具版本号（与根目录 package.json 同步）
 * @module meta
 */

const path = require('path');

let _version;
function getToolVersion() {
  if (_version) return _version;
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json'); // lib -> repo root
    _version = JSON.parse(require('fs').readFileSync(pkgPath, 'utf8')).version;
  } catch {
    _version = '0.0.0';
  }
  return _version;
}

/** JSON 输出 schema 版本，仅在字段含义变更时递增 */
const JSON_SCHEMA_VERSION = 1;

module.exports = { getToolVersion, JSON_SCHEMA_VERSION };
