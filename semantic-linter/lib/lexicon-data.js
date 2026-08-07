/**
 * 预编译语义陷阱词典数据
 * 数据来源: semantic-trap-lexicon.md (中文 T01-T17, 英文 E01-E10)
 * 生成: npm run build-lexicon
 *
 * @module lexicon-data
 */

// 中文词汇对 (T01-T17)
const zhPairs = [
  {"id":"T01","narrow":"漏洞","wide":"风险","narrowEn":"Vulnerability","wideEn":"Risk","severity":"critical","scenario":"\"风险\"激活代码质量、架构设计、性能等大量超范围联想"},
  {"id":"T02","narrow":"检查","wide":"审查","narrowEn":"Check","wideEn":"Review","severity":"high","scenario":"\"审查\"触发主观评价性意见，\"检查\"仅触发通过/不通过判定"},
  {"id":"T03","narrow":"列出","wide":"描述","narrowEn":"List","wideEn":"Describe","severity":"high","scenario":"\"描述\"触发解释和评论，\"列出\"仅产出结构化条目"},
  {"id":"T04","narrow":"缺陷","wide":"问题","narrowEn":"Defect","wideEn":"Issue","severity":"high","scenario":"\"问题\"范围极宽，改进建议都会被归类为\"问题\""},
  {"id":"T05","narrow":"总结","wide":"分析","narrowEn":"Summarize","wideEn":"Analyze","severity":"medium-high","scenario":"\"分析\"触发推理和假设，\"总结\"仅提炼已有信息"},
  {"id":"T06","narrow":"要求","wide":"建议","narrowEn":"Requirement","wideEn":"Suggestion","severity":"medium-high","scenario":"\"建议\"触发发散性思维，\"要求\"仅输出明确条件"},
  {"id":"T07","narrow":"错误","wide":"异常","narrowEn":"Error","wideEn":"Anomaly","severity":"medium","scenario":"\"异常\"边界模糊，轻微偏差都可能被纳入报告"},
  {"id":"T08","narrow":"修复","wide":"改善","narrowEn":"Fix","wideEn":"Improve","severity":"high","scenario":"\"改善\"触发优化建议、重构方案等超范围内容"},
  {"id":"T09","narrow":"遵循","wide":"参考","narrowEn":"Follow","wideEn":"Refer to","severity":"medium-high","scenario":"\"参考\"暗示可灵活解读，\"遵循\"要求严格执行"},
  {"id":"T10","narrow":"统计","wide":"评估","narrowEn":"Count","wideEn":"Evaluate","severity":"high","scenario":"\"评估\"触发主观判断和权重分配，\"统计\"仅输出数值"},
  {"id":"T11","narrow":"提取","wide":"理解","narrowEn":"Extract","wideEn":"Understand","severity":"high","scenario":"\"理解\"触发推断和解读，\"提取\"仅取出原文信息"},
  {"id":"T12","narrow":"匹配","wide":"关联","narrowEn":"Match","wideEn":"Associate","severity":"medium","scenario":"\"关联\"触发间接联系推理，\"匹配\"仅做精确对应"},
  {"id":"T13","narrow":"复制","wide":"转化","narrowEn":"Copy","wideEn":"Transform","severity":"medium-high","scenario":"\"转化\"暗示允许改动，\"复制\"要求保持原样"},
  {"id":"T14","narrow":"报告","wide":"洞察","narrowEn":"Report","wideEn":"Insight","severity":"high","scenario":"\"洞察\"触发创造性推断，\"报告\"仅陈述发现"},
  {"id":"T15","narrow":"验证","wide":"评价","narrowEn":"Verify","wideEn":"Judge","severity":"medium-high","scenario":"\"评价\"触发主观打分和点评，\"验证\"仅做二元判定"},
  {"id":"T16","narrow":"规则","wide":"原则","narrowEn":"Rule","wideEn":"Principle","severity":"medium","scenario":"\"原则\"暗示可灵活解读，\"规则\"要求严格遵守"},
  {"id":"T17","narrow":"步骤","wide":"方法","narrowEn":"Step","wideEn":"Method/Approach","severity":"medium","scenario":"\"方法\"暗示可选择多种路径，\"步骤\"要求按序执行"}
];

// 英文词汇对 (E01-E10)
const enPairs = [
  {"id":"E01","narrow":"Vulnerability","wide":"Risk","severity":"critical","scenario":"同T01"},
  {"id":"E02","narrow":"Check","wide":"Review","severity":"high","scenario":"\"Review\"和\"Audit\"触发全面评价","wideAlt":"Audit"},
  {"id":"E03","narrow":"List","wide":"Describe","severity":"high","scenario":"\"Describe\"触发叙述性展开","wideAlt":"Explain"},
  {"id":"E04","narrow":"Bug","wide":"Issue","severity":"high","scenario":"\"Issue\"覆盖面过宽","narrowAlt":"Defect","wideAlt":"Problem"},
  {"id":"E05","narrow":"Summarize","wide":"Analyze","severity":"medium-high","scenario":"\"Analyze\"触发深度推理","wideAlt":"Assess"},
  {"id":"E06","narrow":"Requirement","wide":"Suggestion","severity":"medium-high","scenario":"\"Recommendation\"触发发散","wideAlt":"Recommendation"},
  {"id":"E07","narrow":"Error","wide":"Anomaly","severity":"medium","scenario":"\"Concern\"几乎无边界","wideAlt":"Concern"},
  {"id":"E08","narrow":"Extract","wide":"Interpret","severity":"high","scenario":"\"Interpret\"触发主观解读"},
  {"id":"E09","narrow":"Verify","wide":"Evaluate","severity":"medium-high","scenario":"\"Evaluate\"触发多维评价","wideAlt":"Judge"},
  {"id":"E10","narrow":"Must","wide":"Should","severity":"medium-high","scenario":"\"Should\"暗示可选，\"Must\"要求强制","narrowAlt":"Shall","wideAlt":"Could"}
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
