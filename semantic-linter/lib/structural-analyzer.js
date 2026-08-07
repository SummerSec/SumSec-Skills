/**
 * 检测大模型指令文本中的结构性风险模式
 * 基于语义陷阱理论的四种模式：
 * 1. 开放式动词（缺少范围限定）
 * 2. 抽象化目标（形容词化的任务对象）
 * 3. 情态动词降级（约束条件中使用弱情态词）
 * 4. 缺少否定清单（使用宽边界词但无排除项）
 *
 * @module structural-analyzer
 */

const lexicon = require('./lexicon-data');
const { stripCodeBlocks } = require('./content-scanner');

// --- 模式 1：开放式动词（缺少范围限定） ---

const ZH_OPEN_VERBS = ['分析', '审查', '评估', '检视', '评价', '审视'];
const ZH_SCOPE_LIMITERS = ['维度', '方面', '以下', '如下', '包括', '具体', '仅', '只', '限于', '范围'];

const EN_OPEN_VERB_RE = /\b(analyze|analyse|review|evaluate|assess|examine|inspect)\b/i;
const EN_SCOPE_LIMITER_RE = /\b(following|specifically|limited to|only|dimensions?|aspects?|including)\b/i;

/**
 * 检测缺少范围限定的开放式动词
 * @param {string[]} lines
 * @returns {Array<Object>}
 */
function detectOpenEndedVerbs(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 中文检测
    for (const verb of ZH_OPEN_VERBS) {
      if (line.includes(verb)) {
        const hasScope = ZH_SCOPE_LIMITERS.some(l => line.includes(l));
        if (!hasScope) {
          findings.push({
            type: 'open_ended_verb',
            severity: 'medium',
            line: i + 1,
            context: line.trim().substring(0, 80),
            suggestion: `"${verb}"后添加具体范围限定，如"${verb}...中的XX和YY"`,
          });
        }
        break;
      }
    }
    // 英文检测
    const enMatch = line.match(EN_OPEN_VERB_RE);
    if (enMatch) {
      if (!EN_SCOPE_LIMITER_RE.test(line)) {
        findings.push({
          type: 'open_ended_verb',
          severity: 'medium',
          line: i + 1,
          context: line.trim().substring(0, 80),
          suggestion: `在"${enMatch[1]}"后添加具体范围，如"${enMatch[1]} ... for X and Y"`,
        });
      }
    }
  }
  return findings;
}

// --- 模式 2：抽象化目标（形容词化的任务对象） ---

const ZH_ADJ_TARGET_RE = /(?:评估|检查|审查|分析)\S{1,6}(?:性|度|率|力)/;
const EN_ADJ_TARGET_RE = /\b(?:assess|evaluate|check|analyze)\s+(?:the\s+)?(\w+(?:ity|ness|ability|ibility))\b/i;

/**
 * 检测抽象化（形容词化）的任务目标
 * @param {string[]} lines
 * @returns {Array<Object>}
 */
function detectAdjectiveTargets(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (ZH_ADJ_TARGET_RE.test(line)) {
      const match = line.match(ZH_ADJ_TARGET_RE);
      findings.push({
        type: 'adjective_target',
        severity: 'medium',
        line: i + 1,
        context: line.trim().substring(0, 80),
        suggestion: `将"${match[0]}"替换为具体名词目标，如"检测XX漏洞"而非"评估安全性"`,
      });
    }
    const enMatch = line.match(EN_ADJ_TARGET_RE);
    if (enMatch) {
      findings.push({
        type: 'adjective_target',
        severity: 'medium',
        line: i + 1,
        context: line.trim().substring(0, 80),
        suggestion: `将抽象目标"${enMatch[1]}"替换为具体名词，如"检测X漏洞"而非"评估安全性"`,
      });
    }
  }
  return findings;
}

// --- 模式 3：情态动词降级 ---

const ZH_WEAK_MODALS = ['应该', '可以', '建议', '推荐', '尽量', '最好'];
const ZH_STRONG_MODALS = ['必须', '只能', '禁止', '不能', '不允许', '强制'];
const ZH_CONSTRAINT_CONTEXT_RE = /(?:规则|要求|约束|规定|标准|条件|限制)/;

const EN_WEAK_MODAL_RE = /\b(should|could|may|might|recommend|prefer|ideally)\b/i;
const EN_STRONG_MODAL_RE = /\b(must|shall|required|mandatory|only|never|always)\b/i;
const EN_CONSTRAINT_CONTEXT_RE = /\b(rule|requirement|constraint|condition|standard|limitation|must|shall)\b/i;

/**
 * 检测约束条件中的情态动词降级
 * @param {string[]} lines
 * @returns {Array<Object>}
 */
function detectModalDowngrades(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isConstraintContext = ZH_CONSTRAINT_CONTEXT_RE.test(line) || EN_CONSTRAINT_CONTEXT_RE.test(line);
    if (!isConstraintContext) continue;

    // 中文检测
    for (const weak of ZH_WEAK_MODALS) {
      if (line.includes(weak)) {
        const hasStrong = ZH_STRONG_MODALS.some(s => line.includes(s));
        if (!hasStrong) {
          findings.push({
            type: 'modal_downgrade',
            severity: 'medium-high',
            line: i + 1,
            context: line.trim().substring(0, 80),
            suggestion: `约束条件中"${weak}"应替换为"必须"或"只能"以增强约束力`,
          });
          break;
        }
      }
    }
    // 英文检测
    const enWeakMatch = line.match(EN_WEAK_MODAL_RE);
    if (enWeakMatch && !EN_STRONG_MODAL_RE.test(line)) {
      findings.push({
        type: 'modal_downgrade',
        severity: 'medium-high',
        line: i + 1,
        context: line.trim().substring(0, 80),
        suggestion: `约束条件中"${enWeakMatch[1]}"应替换为"must"或"shall"以增强约束力`,
      });
    }
  }
  return findings;
}

// --- 模式 4：缺少否定清单 ---

const ZH_NEGATION_MARKERS = ['不包括', '不属于', '排除', '不在范围', '以下不', '除外'];
const EN_NEGATION_MARKERS = [/\bexclud/i, /\bdoes not include/i, /\bout of scope/i, /\bnot covered/i, /\bnot in scope/i];

/**
 * 检测使用宽边界词但缺少否定清单的情况
 * @param {string} content - 完整内容（未按行拆分）
 * @param {Array<Object>} lexiconMatches - 由 content-scanner 发现的匹配项
 * @returns {Array<Object>}
 */
function detectMissingNegation(content, lexiconMatches) {
  if (lexiconMatches.length === 0) return [];

  const hasZhNegation = ZH_NEGATION_MARKERS.some(m => content.includes(m));
  const hasEnNegation = EN_NEGATION_MARKERS.some(re => re.test(content));

  if (hasZhNegation || hasEnNegation) return [];

  // 存在宽边界词但无否定清单
  const highSeverityTraps = lexiconMatches.filter(
    m => lexicon.SEVERITY_ORDER[m.severity] >= lexicon.SEVERITY_ORDER['high']
  );

  if (highSeverityTraps.length === 0) return [];

  const trapWords = highSeverityTraps.map(m => `"${m.word}"`).join('、');
  return [{
    type: 'missing_negation',
    severity: 'high',
    line: 0,
    context: `已使用宽边界词：${trapWords}`,
    suggestion: `添加否定清单，明确"以下不属于本Skill评估范围"的排除项`,
  }];
}

/**
 * 执行所有结构性风险分析
 * @param {string} content - 完整文件内容
 * @param {Array<Object>} lexiconMatches - 来自 content-scanner 的匹配结果
 * @returns {Array<Object>}
 */
function analyze(content, lexiconMatches) {
  if (!content) return [];
  const stripped = stripCodeBlocks(content);
  const lines = stripped.split('\n');

  const MAX_FINDINGS_PER_TYPE = 10;
  return dedupeStructural([
    ...detectOpenEndedVerbs(lines).slice(0, MAX_FINDINGS_PER_TYPE),
    ...detectAdjectiveTargets(lines).slice(0, MAX_FINDINGS_PER_TYPE),
    ...detectModalDowngrades(lines).slice(0, MAX_FINDINGS_PER_TYPE),
    ...detectMissingNegation(stripped, lexiconMatches || []),
  ]);
}

/**
 * 同一行同一类结构风险只保留一条，避免中英规则叠加刷屏
 * @param {Array<Object>} findings
 * @returns {Array<Object>}
 */
function dedupeStructural(findings) {
  const seen = new Set();
  const out = [];
  for (const f of findings) {
    const key = `${f.type}:${f.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

module.exports = { analyze };
