/**
 * State persistence for semantic-linter
 * Tracks detection statistics and session state in ~/.semantic-linter/
 *
 * @module state-manager
 */

const fs = require('fs');
const path = require('path');

const STATE_DIR = process.env.SEMANTIC_LINTER_STATE_DIR
  || path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.semantic-linter');

const STATS_FILE = path.join(STATE_DIR, 'stats.json');
const SESSION_FILE = path.join(STATE_DIR, 'session.json');

// Session auto-resets after 2 hours of inactivity
const SESSION_STALE_MS = 2 * 60 * 60 * 1000;

/**
 * Default empty stats structure.
 * @returns {Object}
 */
function defaultStats() {
  return {
    version: 1,
    totalDetections: 0,
    trapFrequency: {},
    wordFrequency: {},
  };
}

/**
 * Default empty session structure.
 * @returns {Object}
 */
function defaultSession() {
  const now = new Date().toISOString();
  return {
    version: 1,
    sessionId: now.replace(/[-:T.Z]/g, '').slice(0, 15),
    startedAt: now,
    updatedAt: now,
    detectionCount: 0,
    escalationLevel: 0,
    trapOccurrences: {},
    filesScanned: [],
  };
}

/**
 * Safely read and parse a JSON file.
 * @param {string} filePath
 * @param {Function} defaultFn
 * @returns {Object}
 */
function loadJson(filePath, defaultFn) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return defaultFn();
  }
}

/**
 * Safely write JSON to file.
 * @param {string} filePath
 * @param {Object} data
 */
function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Silent failure — never break the hook pipeline
  }
}

/**
 * Ensure state directory and files exist.
 */
function initState() {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    if (!fs.existsSync(STATS_FILE)) {
      saveJson(STATS_FILE, defaultStats());
    }
    if (!fs.existsSync(SESSION_FILE)) {
      saveJson(SESSION_FILE, defaultSession());
    }
  } catch {
    // Silent failure
  }
}

/**
 * Load session, auto-reset if stale (> 2h since last update).
 * @returns {Object}
 */
function loadSession() {
  const session = loadJson(SESSION_FILE, defaultSession);
  const updatedAt = new Date(session.updatedAt || 0).getTime();
  if (Date.now() - updatedAt > SESSION_STALE_MS) {
    const fresh = defaultSession();
    saveJson(SESSION_FILE, fresh);
    return fresh;
  }
  return session;
}

/**
 * Record a single trap word detection.
 * Updates both stats.json and session.json.
 * @param {string} trapId - e.g. 'T01'
 * @param {string} word - e.g. '风险'
 * @param {string} filePath - file where detected
 */
function recordDetection(trapId, word, filePath) {
  try {
    initState();

    // Update cumulative stats
    const stats = loadJson(STATS_FILE, defaultStats);
    stats.totalDetections = (stats.totalDetections || 0) + 1;
    if (!stats.trapFrequency) stats.trapFrequency = {};
    if (!stats.trapFrequency[trapId]) {
      stats.trapFrequency[trapId] = { count: 0, lastSeen: '' };
    }
    stats.trapFrequency[trapId].count++;
    stats.trapFrequency[trapId].lastSeen = new Date().toISOString();
    if (!stats.wordFrequency) stats.wordFrequency = {};
    stats.wordFrequency[word] = (stats.wordFrequency[word] || 0) + 1;
    saveJson(STATS_FILE, stats);

    // Update session state
    const session = loadSession();
    session.detectionCount = (session.detectionCount || 0) + 1;
    session.updatedAt = new Date().toISOString();
    if (!session.trapOccurrences) session.trapOccurrences = {};
    if (!session.trapOccurrences[trapId]) {
      session.trapOccurrences[trapId] = { count: 0, files: [] };
    }
    session.trapOccurrences[trapId].count++;
    if (filePath && !session.trapOccurrences[trapId].files.includes(filePath)) {
      session.trapOccurrences[trapId].files.push(filePath);
    }
    if (!session.filesScanned) session.filesScanned = [];
    if (filePath && !session.filesScanned.includes(filePath)) {
      session.filesScanned.push(filePath);
    }
    session.escalationLevel = computeEscalationLevel(session);
    saveJson(SESSION_FILE, session);
  } catch {
    // Silent failure
  }
}

/**
 * Return current session summary. Auto-resets if stale.
 * @returns {Object}
 */
function getSessionStats() {
  try {
    initState();
    return loadSession();
  } catch {
    return defaultSession();
  }
}

/**
 * Return top N most frequently detected traps from cumulative stats.
 * @param {number} n
 * @returns {Array<{trapId: string, count: number}>}
 */
function getTopTraps(n) {
  try {
    initState();
    const stats = loadJson(STATS_FILE, defaultStats);
    const freq = stats.trapFrequency || {};
    return Object.entries(freq)
      .map(([trapId, data]) => ({ trapId, count: data.count || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  } catch {
    return [];
  }
}

/**
 * Compute escalation level based on session state.
 * @param {Object} [sessionOverride] - optional session to use instead of loading
 * @returns {number} 0-3
 */
function computeEscalationLevel(sessionOverride) {
  try {
    const session = sessionOverride || loadSession();
    const occurrences = session.trapOccurrences || {};
    const filesScanned = session.filesScanned || [];
    const detectionCount = session.detectionCount || 0;

    // L3: traps across 3+ files AND 5+ total detections
    if (filesScanned.length >= 3 && detectionCount >= 5) return 3;

    // L2: same trap word detected 3+ times
    for (const data of Object.values(occurrences)) {
      if (data.count >= 3) return 2;
    }

    // L1: same trap word detected 2 times
    for (const data of Object.values(occurrences)) {
      if (data.count >= 2) return 1;
    }

    // L0: normal
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Clear session state (reset to fresh).
 */
function resetSession() {
  try {
    initState();
    saveJson(SESSION_FILE, defaultSession());
  } catch {
    // Silent failure
  }
}

module.exports = {
  initState,
  recordDetection,
  getSessionStats,
  getTopTraps,
  computeEscalationLevel,
  resetSession,
  // Exposed for testing
  STATE_DIR,
  STATS_FILE,
  SESSION_FILE,
};
