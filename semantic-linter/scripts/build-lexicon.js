#!/usr/bin/env node
/**
 * 从 references/semantic-trap-lexicon.md 解析表格并生成 lib/lexicon-data.js
 *
 * 用法:
 *   node scripts/build-lexicon.js           写入 lexicon-data.js
 *   node scripts/build-lexicon.js --check   校验已生成文件与 Markdown 一致（不写盘）
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MD_PATH = path.join(ROOT, 'references', 'semantic-trap-lexicon.md');
const OUT_PATH = path.join(ROOT, 'lib', 'lexicon-data.js');

const ZH_SEV = { 极高: 'critical', 高: 'high', 中高: 'medium-high', 中: 'medium' };
const EN_SEV = {
  E01: 'critical',
  E02: 'high',
  E03: 'high',
  E04: 'high',
  E08: 'high',
  E05: 'medium-high',
  E06: 'medium-high',
  E09: 'medium-high',
  E10: 'medium-high',
  E07: 'medium',
};

function parseParenCell(cell) {
  const t = (cell || '').trim();
  const m = t.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return { text: m[1].trim(), en: m[2].trim() };
  return { text: t, en: undefined };
}

function splitSlash(s) {
  return String(s)
    .split(/\s*\/\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseZhRows(md) {
  const rows = [];
  for (const line of md.split('\n')) {
    if (!/^\|\s*T\d+\s*\|/.test(line)) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 6) continue;
    const id = cells[1];
    const narrow = parseParenCell(cells[2]);
    const wide = parseParenCell(cells[3]);
    const sevLabel = cells[4];
    const scenario = cells[5];
    rows.push({
      id,
      narrow: narrow.text,
      wide: wide.text,
      narrowEn: narrow.en,
      wideEn: wide.en,
      severity: ZH_SEV[sevLabel] || 'medium',
      scenario,
    });
  }
  rows.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return rows;
}

function parseEnRows(md) {
  const rows = [];
  for (const line of md.split('\n')) {
    if (!/^\|\s*E\d+\s*\|/.test(line)) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    const id = cells[1];
    const narrowCell = cells[2];
    const wideCell = cells[3];
    const scenario = cells[4];
    const np = splitSlash(narrowCell);
    const wp = splitSlash(wideCell);
    const obj = {
      id,
      narrow: np[0],
      wide: wp[0],
      severity: EN_SEV[id] || 'high',
      scenario,
    };
    if (np[1]) obj.narrowAlt = np[1];
    if (wp[1]) obj.wideAlt = wp[1];
    rows.push(obj);
  }
  rows.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return rows;
}

function stableStringifyZh(p) {
  return JSON.stringify({
    id: p.id,
    narrow: p.narrow,
    wide: p.wide,
    narrowEn: p.narrowEn,
    wideEn: p.wideEn,
    severity: p.severity,
    scenario: p.scenario,
  });
}

function stableStringifyEn(p) {
  const o = {
    id: p.id,
    narrow: p.narrow,
    wide: p.wide,
    severity: p.severity,
    scenario: p.scenario,
  };
  if (p.narrowAlt) o.narrowAlt = p.narrowAlt;
  if (p.wideAlt) o.wideAlt = p.wideAlt;
  return JSON.stringify(o);
}

function generateLexiconSource(zhPairs, enPairs) {
  const zhBlock = zhPairs.map((p) => `  ${stableStringifyZh(p)}`).join(',\n');
  const enBlock = enPairs.map((p) => `  ${stableStringifyEn(p)}`).join(',\n');
  return `/**
 * 预编译语义陷阱词典数据
 * 数据来源: semantic-trap-lexicon.md (中文 T01-T17, 英文 E01-E10)
 * 生成: npm run build-lexicon
 *
 * @module lexicon-data
 */

// 中文词汇对 (T01-T17)
const zhPairs = [
${zhBlock}
];

// 英文词汇对 (E01-E10)
const enPairs = [
${enBlock}
];

// 构建查找映射表，实现 O(1) 匹配
const wideWordsZh = new Map();
for (const pair of zhPairs) {
  wideWordsZh.set(pair.wide, pair);
}

const wideWordsEn = new Map();
for (const pair of enPairs) {
  wideWordsEn.set(pair.wide.toLowerCase(), pair);
  if (pair.wideAlt) {
    wideWordsEn.set(pair.wideAlt.toLowerCase(), pair);
  }
}

// 严重等级排序（用于比较）
const SEVERITY_ORDER = {
  'critical': 4,
  'high': 3,
  'medium-high': 2,
  'medium': 1,
  'low': 0,
};

module.exports = {
  zhPairs,
  enPairs,
  wideWordsZh,
  wideWordsEn,
  SEVERITY_ORDER,
};
`;
}

function loadFromMarkdown() {
  const md = fs.readFileSync(MD_PATH, 'utf8');
  return {
    zhPairs: parseZhRows(md),
    enPairs: parseEnRows(md),
  };
}

function loadFromBuiltModule() {
  delete require.cache[require.resolve(OUT_PATH)];
  return require(OUT_PATH);
}

function pairsEqual(a, b, kind) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (kind === 'zh' && stableStringifyZh(a[i]) !== stableStringifyZh(b[i])) return false;
    if (kind === 'en' && stableStringifyEn(a[i]) !== stableStringifyEn(b[i])) return false;
  }
  return true;
}

function main() {
  const check = process.argv.includes('--check');
  const { zhPairs, enPairs } = loadFromMarkdown();

  if (zhPairs.length !== 17) {
    console.error(`Expected 17 Chinese pairs, got ${zhPairs.length}`);
    process.exit(1);
  }
  if (enPairs.length !== 10) {
    console.error(`Expected 10 English pairs, got ${enPairs.length}`);
    process.exit(1);
  }

  if (check) {
    const built = loadFromBuiltModule();
    if (!pairsEqual(zhPairs, built.zhPairs, 'zh') || !pairsEqual(enPairs, built.enPairs, 'en')) {
      console.error('lexicon-data.js is out of sync with semantic-trap-lexicon.md. Run: npm run build-lexicon');
      process.exit(1);
    }
    console.log('OK: lexicon-data.js matches semantic-trap-lexicon.md');
    process.exit(0);
  }

  const out = generateLexiconSource(zhPairs, enPairs);
  fs.writeFileSync(OUT_PATH, out, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, OUT_PATH)}`);
}

main();
