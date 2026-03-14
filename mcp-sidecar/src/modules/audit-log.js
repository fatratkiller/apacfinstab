/**
 * MCP Audit Log Module
 * Call-level audit logging for MCP tool calls
 */

import { createHash } from 'crypto';

/**
 * Generate a unique log ID
 * @returns {string} Log ID
 */
function generateLogId() {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `log-${timestamp}-${random}`;
}

/**
 * Hash sensitive data
 * @param {*} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashData(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return `sha256:${createHash('sha256').update(str).digest('hex').slice(0, 16)}...`;
}

/**
 * Redact sensitive patterns from text
 * @param {string} text - Text to redact
 * @param {Array} patterns - Redaction patterns from config
 * @returns {string} Redacted text
 */
function redactSensitiveData(text, patterns = []) {
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }
  
  let redacted = text;
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.regex, 'gi');
      redacted = redacted.replace(regex, `[REDACTED:${pattern.name}]`);
    } catch (e) {
      // Invalid regex, skip
    }
  }
  
  return redacted;
}

/**
 * Scan input/output for injection patterns
 * @param {*} data - Data to scan
 * @param {Array} patterns - Injection patterns from config
 * @returns {Object} Scan result
 */
export function scanForInjection(data, patterns = []) {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const detected = [];
  
  // Default patterns if none provided
  const defaultPatterns = [
    { name: 'sql_injection', regex: '(union\\s+select|drop\\s+table|;\\s*delete|\'\\s*or\\s*\'|--\\s*$)' },
    { name: 'prompt_injection', regex: '(ignore\\s+previous|disregard\\s+instructions|system\\s*prompt)' },
    { name: 'path_traversal', regex: '\\.\\.\\/|\\.\\.\\\\/|%2e%2e' }
  ];
  
  const patternsToCheck = patterns.length > 0 ? patterns : defaultPatterns;
  
  for (const pattern of patternsToCheck) {
    try {
      const regex = new RegExp(pattern.regex, 'gi');
      if (regex.test(text)) {
        detected.push(pattern.name);
      }
    } catch (e) {
      // Invalid regex, skip
    }
  }
  
  return {
    status: detected.length === 0 ? 'clean' : 'suspicious',
    patterns_checked: patternsToCheck.map(p => p.name),
    detected_patterns: detected,
    confidence: detected.length === 0 ? 0.98 : 0.85
  };
}

/**
 * Analyze data access patterns
 * @param {*} input - Tool input
 * @param {*} output - Tool output
 * @returns {Object} Data access analysis
 */
function analyzeDataAccess(input, output) {
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input || {});
  const outputStr = typeof output === 'string' ? output : JSON.stringify(output || {});
  const combined = `${inputStr} ${outputStr}`.toLowerCase();
  
  const piiPatterns = {
    customer_id: /customer[_\s]?id/i,
    email: /email/i,
    phone: /phone|mobile/i,
    name: /\b(first|last|full)[_\s]?name\b/i,
    address: /address/i,
    ssn: /ssn|social[_\s]?security/i,
    transaction_records: /transaction|payment|transfer/i
  };
  
  const detectedPii = [];
  for (const [type, pattern] of Object.entries(piiPatterns)) {
    if (pattern.test(combined)) {
      detectedPii.push(type);
    }
  }
  
  return {
    accessed_pii: detectedPii.length > 0,
    pii_types: detectedPii,
    purpose_declared: input?.purpose || null,
    purpose_match_confidence: input?.purpose ? 0.85 : 0.5
  };
}

/**
 * Identify jurisdiction triggers
 * @param {*} input - Tool input
 * @param {*} output - Tool output
 * @param {Array} jurisdictions - Jurisdiction config
 * @returns {Array} Triggered jurisdictions
 */
function identifyJurisdictionTriggers(input, output, jurisdictions = []) {
  const combined = JSON.stringify({ input, output }).toLowerCase();
  const triggers = [];
  
  for (const jurisdiction of jurisdictions) {
    const matched = jurisdiction.triggers?.find(t => combined.includes(t.toLowerCase()));
    if (matched) {
      triggers.push({
        code: jurisdiction.code,
        reason: `Detected pattern: ${matched}`,
        action_required: getActionRequired(jurisdiction.code)
      });
    }
  }
  
  return triggers;
}

function getActionRequired(code) {
  const actions = {
    'HK-PDPO': 'Ensure consent documented',
    'HK-AMLO': 'Verify transaction audit trail',
    'HK-SFC': 'Check licensing requirements',
    'SG-MAS': 'Verify regulatory compliance'
  };
  return actions[code] || 'Review compliance requirements';
}

/**
 * Create an audit log entry for a tool call
 * @param {Object} callDetails - Tool call details
 * @param {Object} config - Sidecar config
 * @returns {Object} Audit log entry
 */
export function createAuditLogEntry(callDetails, config = {}) {
  const {
    sessionId,
    agentId,
    serverId,
    tool,
    input,
    output,
    latencyMs,
    error
  } = callDetails;
  
  const redactionPatterns = config.audit?.redaction?.patterns || [];
  const injectionPatterns = config.audit?.injection_detection?.patterns || [];
  const jurisdictions = config.compliance?.jurisdictions || [];
  
  // Create sanitized versions of input/output
  const sanitizedInput = config.audit?.redaction?.enabled 
    ? JSON.parse(redactSensitiveData(JSON.stringify(input), redactionPatterns))
    : input;
  
  const injectionScan = scanForInjection(input, injectionPatterns);
  const dataAccess = analyzeDataAccess(input, output);
  const jurisdictionTriggers = identifyJurisdictionTriggers(input, output, jurisdictions);
  
  return {
    log_id: generateLogId(),
    timestamp: new Date().toISOString(),
    session_id: sessionId || 'unknown',
    agent_id: agentId || 'unknown',
    
    call_details: {
      server_id: serverId || 'unknown',
      tool: tool,
      input: sanitizedInput,
      output: {
        status: error ? 'error' : 'success',
        record_count: Array.isArray(output) ? output.length : (output ? 1 : 0),
        data_hash: hashData(output),
        error: error || null
      },
      latency_ms: latencyMs || 0
    },
    
    compliance_analysis: {
      injection_scan: injectionScan,
      data_access: dataAccess,
      jurisdiction_triggers: jurisdictionTriggers
    },
    
    // Risk assessment will be calculated by risk-scorer module
    risk_assessment: null
  };
}

/**
 * SQLite-based audit log storage
 */
export class AuditLogStorage {
  constructor(db) {
    this.db = db;
    this.initialized = false;
  }
  
  /**
   * Initialize the audit log table
   */
  init() {
    if (this.initialized) return;
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        session_id TEXT,
        agent_id TEXT,
        server_id TEXT,
        tool TEXT,
        input_hash TEXT,
        output_status TEXT,
        latency_ms INTEGER,
        injection_status TEXT,
        risk_level TEXT,
        risk_score REAL,
        full_entry TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_logs(session_id);
      CREATE INDEX IF NOT EXISTS idx_audit_risk ON audit_logs(risk_level);
    `);
    
    this.initialized = true;
  }
  
  /**
   * Save an audit log entry
   * @param {Object} entry - Audit log entry
   */
  save(entry) {
    this.init();
    
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (
        log_id, timestamp, session_id, agent_id, server_id, tool,
        input_hash, output_status, latency_ms, injection_status,
        risk_level, risk_score, full_entry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      entry.log_id,
      entry.timestamp,
      entry.session_id,
      entry.agent_id,
      entry.call_details?.server_id,
      entry.call_details?.tool,
      hashData(entry.call_details?.input),
      entry.call_details?.output?.status,
      entry.call_details?.latency_ms,
      entry.compliance_analysis?.injection_scan?.status,
      entry.risk_assessment?.risk_level,
      entry.risk_assessment?.overall_risk,
      JSON.stringify(entry)
    );
  }
  
  /**
   * Query audit logs
   * @param {Object} filters - Query filters
   * @returns {Array} Matching log entries
   */
  query(filters = {}) {
    this.init();
    
    let sql = 'SELECT full_entry FROM audit_logs WHERE 1=1';
    const params = [];
    
    if (filters.sessionId) {
      sql += ' AND session_id = ?';
      params.push(filters.sessionId);
    }
    
    if (filters.riskLevel) {
      sql += ' AND risk_level = ?';
      params.push(filters.riskLevel);
    }
    
    if (filters.since) {
      sql += ' AND timestamp >= ?';
      params.push(filters.since);
    }
    
    if (filters.until) {
      sql += ' AND timestamp <= ?';
      params.push(filters.until);
    }
    
    sql += ' ORDER BY timestamp DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params);
    
    return rows.map(row => JSON.parse(row.full_entry));
  }
  
  /**
   * Get summary statistics
   * @param {Object} filters - Query filters
   * @returns {Object} Summary stats
   */
  getSummary(filters = {}) {
    this.init();
    
    let whereClause = '1=1';
    const params = [];
    
    if (filters.since) {
      whereClause += ' AND timestamp >= ?';
      params.push(filters.since);
    }
    
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_calls,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT tool) as unique_tools,
        AVG(latency_ms) as avg_latency_ms,
        SUM(CASE WHEN injection_status = 'suspicious' THEN 1 ELSE 0 END) as injection_alerts,
        SUM(CASE WHEN risk_level IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as high_risk_calls
      FROM audit_logs
      WHERE ${whereClause}
    `);
    
    return stmt.get(...params);
  }
}

export default {
  createAuditLogEntry,
  scanForInjection,
  AuditLogStorage
};
