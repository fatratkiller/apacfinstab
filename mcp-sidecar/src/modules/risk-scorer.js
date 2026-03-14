/**
 * MCP Risk Scorer Module
 * 5-factor risk scoring for MCP tool calls
 */

/**
 * Default risk scoring weights
 */
const DEFAULT_WEIGHTS = {
  data_sensitivity: 0.30,
  operation_type: 0.25,
  access_frequency: 0.15,
  injection_risk: 0.20,
  regulatory_relevance: 0.10
};

/**
 * Risk level thresholds
 */
const DEFAULT_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
  high: 0.8
};

/**
 * Calculate data sensitivity score
 * @param {Object} auditEntry - Audit log entry
 * @returns {Object} Factor score
 */
function calculateDataSensitivity(auditEntry) {
  const dataAccess = auditEntry.compliance_analysis?.data_access || {};
  let score = 0;
  
  // PII access adds to score
  if (dataAccess.accessed_pii) {
    score += 0.5;
    
    // Certain PII types are more sensitive
    const piiTypes = dataAccess.pii_types || [];
    if (piiTypes.some(t => ['ssn', 'customer_id', 'transaction_records'].includes(t))) {
      score += 0.3;
    }
  }
  
  // Market sensitive data
  const toolName = (auditEntry.call_details?.tool || '').toLowerCase();
  if (['price', 'trading', 'market', 'quote'].some(p => toolName.includes(p))) {
    score += 0.4;
  }
  
  // Financial data
  if (['balance', 'account', 'payment'].some(p => toolName.includes(p))) {
    score += 0.4;
  }
  
  return {
    score: Math.min(score, 1.0),
    reason: dataAccess.accessed_pii 
      ? `PII access: ${(dataAccess.pii_types || []).join(', ')}`
      : 'No sensitive data detected'
  };
}

/**
 * Calculate operation type score
 * @param {Object} auditEntry - Audit log entry
 * @returns {Object} Factor score
 */
function calculateOperationType(auditEntry) {
  const tool = (auditEntry.call_details?.tool || '').toLowerCase();
  
  // Delete/remove operations are highest risk
  if (['delete', 'remove', 'drop', 'truncate'].some(p => tool.includes(p))) {
    return { score: 1.0, reason: 'Delete/destructive operation' };
  }
  
  // Write/modify operations are high risk
  if (['write', 'update', 'modify', 'create', 'insert', 'set', 'put', 'post'].some(p => tool.includes(p))) {
    return { score: 0.8, reason: 'Write/modify operation' };
  }
  
  // Execute operations need review
  if (['execute', 'run', 'call', 'invoke'].some(p => tool.includes(p))) {
    return { score: 0.6, reason: 'Execute operation' };
  }
  
  // Read-only operations are lower risk
  return { score: 0.0, reason: 'Read-only operation' };
}

/**
 * Access frequency tracking (in-memory for MVP)
 */
const accessFrequencyTracker = new Map();

/**
 * Calculate access frequency score
 * @param {Object} auditEntry - Audit log entry
 * @param {Object} sessionStats - Session statistics
 * @returns {Object} Factor score
 */
function calculateAccessFrequency(auditEntry, sessionStats = {}) {
  const sessionId = auditEntry.session_id;
  const tool = auditEntry.call_details?.tool;
  const now = Date.now();
  
  // Track call frequency
  const key = `${sessionId}:${tool}`;
  const history = accessFrequencyTracker.get(key) || [];
  
  // Clean old entries (older than 1 hour)
  const recentHistory = history.filter(t => now - t < 3600000);
  recentHistory.push(now);
  accessFrequencyTracker.set(key, recentHistory);
  
  // Calculate frequency score
  const callsPerHour = recentHistory.length;
  
  if (callsPerHour > 100) {
    return { score: 0.8, reason: `Abnormally high frequency: ${callsPerHour} calls/hour` };
  }
  if (callsPerHour > 50) {
    return { score: 0.6, reason: `High frequency: ${callsPerHour} calls/hour` };
  }
  if (callsPerHour > 20) {
    return { score: 0.3, reason: `Elevated frequency: ${callsPerHour} calls/hour` };
  }
  
  return { score: 0.0, reason: `Normal frequency: ${callsPerHour} calls/hour` };
}

/**
 * Calculate injection risk score
 * @param {Object} auditEntry - Audit log entry
 * @returns {Object} Factor score
 */
function calculateInjectionRisk(auditEntry) {
  const injectionScan = auditEntry.compliance_analysis?.injection_scan || {};
  
  if (injectionScan.status === 'suspicious') {
    const patterns = injectionScan.detected_patterns || [];
    return {
      score: 1.0,
      reason: `Injection patterns detected: ${patterns.join(', ')}`
    };
  }
  
  return { score: 0.0, reason: 'No injection patterns detected' };
}

/**
 * Calculate regulatory relevance score
 * @param {Object} auditEntry - Audit log entry
 * @returns {Object} Factor score
 */
function calculateRegulatoryRelevance(auditEntry) {
  const jurisdictionTriggers = auditEntry.compliance_analysis?.jurisdiction_triggers || [];
  
  if (jurisdictionTriggers.length === 0) {
    return { score: 0.0, reason: 'No regulatory triggers' };
  }
  
  // Higher score for more jurisdictions triggered
  const score = Math.min(jurisdictionTriggers.length * 0.25, 1.0);
  const codes = jurisdictionTriggers.map(j => j.code).join(', ');
  
  return {
    score,
    reason: `Regulatory jurisdictions: ${codes}`
  };
}

/**
 * Determine risk level from score
 * @param {number} score - Risk score (0-1)
 * @param {Object} thresholds - Risk thresholds
 * @returns {string} Risk level
 */
function getRiskLevel(score, thresholds = DEFAULT_THRESHOLDS) {
  if (score >= thresholds.high) return 'CRITICAL';
  if (score >= thresholds.medium) return 'HIGH';
  if (score >= thresholds.low) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate risk recommendations
 * @param {Object} breakdown - Score breakdown
 * @param {string} riskLevel - Overall risk level
 * @returns {Array} Recommendations
 */
function generateRecommendations(breakdown, riskLevel) {
  const recommendations = [];
  
  // Data sensitivity recommendations
  if (breakdown.data_sensitivity.score > 0.5) {
    recommendations.push('Document data access purpose for compliance records');
  }
  
  // Operation type recommendations
  if (breakdown.operation_type.score > 0.7) {
    recommendations.push('Consider requiring human approval for destructive operations');
  }
  
  // Frequency recommendations
  if (breakdown.access_frequency.score > 0.5) {
    recommendations.push('Review access patterns - frequency is elevated');
  }
  
  // Injection recommendations
  if (breakdown.injection_risk.score > 0) {
    recommendations.push('URGENT: Review input for potential injection attack');
  }
  
  // Regulatory recommendations
  if (breakdown.regulatory_relevance.score > 0) {
    recommendations.push('Ensure regulatory compliance documentation is in place');
  }
  
  // General recommendations based on level
  if (riskLevel === 'CRITICAL') {
    recommendations.push('Immediate review required by compliance team');
  } else if (riskLevel === 'HIGH') {
    recommendations.push('Include in weekly compliance audit');
  }
  
  return recommendations;
}

/**
 * Generate flags for risk assessment
 * @param {Object} breakdown - Score breakdown
 * @returns {Array} Flags
 */
function generateFlags(breakdown) {
  const flags = [];
  
  if (breakdown.data_sensitivity.score > 0.5) {
    flags.push(breakdown.data_sensitivity.reason);
  }
  if (breakdown.operation_type.score > 0.5) {
    flags.push(breakdown.operation_type.reason);
  }
  if (breakdown.access_frequency.score > 0.3) {
    flags.push(breakdown.access_frequency.reason);
  }
  if (breakdown.injection_risk.score > 0) {
    flags.push(breakdown.injection_risk.reason);
  }
  if (breakdown.regulatory_relevance.score > 0) {
    flags.push(breakdown.regulatory_relevance.reason);
  }
  
  return flags;
}

/**
 * Calculate comprehensive risk assessment
 * @param {Object} auditEntry - Audit log entry
 * @param {Object} config - Risk scoring config
 * @returns {Object} Risk assessment
 */
export function calculateRiskAssessment(auditEntry, config = {}) {
  const weights = config.risk_scoring?.weights || DEFAULT_WEIGHTS;
  const thresholds = config.risk_scoring?.thresholds || DEFAULT_THRESHOLDS;
  
  // Calculate each factor
  const breakdown = {
    data_sensitivity: calculateDataSensitivity(auditEntry),
    operation_type: calculateOperationType(auditEntry),
    access_frequency: calculateAccessFrequency(auditEntry),
    injection_risk: calculateInjectionRisk(auditEntry),
    regulatory_relevance: calculateRegulatoryRelevance(auditEntry)
  };
  
  // Calculate weighted score
  let overallScore = 0;
  const weightedBreakdown = {};
  
  for (const [factor, data] of Object.entries(breakdown)) {
    const weight = weights[factor] || 0;
    const contribution = data.score * weight;
    overallScore += contribution;
    
    weightedBreakdown[factor] = {
      score: data.score,
      weight: weight,
      contribution: Math.round(contribution * 1000) / 1000,
      reason: data.reason
    };
  }
  
  // Round overall score
  overallScore = Math.round(overallScore * 1000) / 1000;
  
  // Determine risk level
  const riskLevel = getRiskLevel(overallScore, thresholds);
  
  // Generate recommendations and flags
  const flags = generateFlags(breakdown);
  const recommendations = generateRecommendations(breakdown, riskLevel);
  
  return {
    assessment_id: `assess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    session_id: auditEntry.session_id,
    
    risk_score: overallScore,
    risk_level: riskLevel,
    
    breakdown: weightedBreakdown,
    flags: flags,
    recommendations: recommendations,
    
    audit_reference: auditEntry.log_id
  };
}

/**
 * Check if risk level should trigger alert
 * @param {string} riskLevel - Risk level
 * @param {Array} triggerLevels - Levels that trigger alerts
 * @returns {boolean} Whether to alert
 */
export function shouldAlert(riskLevel, triggerLevels = ['HIGH', 'CRITICAL']) {
  return triggerLevels.includes(riskLevel);
}

/**
 * Create a risk summary for a session
 * @param {Array} assessments - List of risk assessments
 * @returns {Object} Session risk summary
 */
export function createSessionRiskSummary(assessments) {
  if (!assessments || assessments.length === 0) {
    return {
      total_calls: 0,
      avg_risk_score: 0,
      risk_distribution: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      high_risk_calls: []
    };
  }
  
  const distribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  let totalScore = 0;
  const highRiskCalls = [];
  
  for (const assessment of assessments) {
    distribution[assessment.risk_level] = (distribution[assessment.risk_level] || 0) + 1;
    totalScore += assessment.risk_score;
    
    if (['HIGH', 'CRITICAL'].includes(assessment.risk_level)) {
      highRiskCalls.push({
        assessment_id: assessment.assessment_id,
        risk_level: assessment.risk_level,
        risk_score: assessment.risk_score,
        flags: assessment.flags
      });
    }
  }
  
  return {
    total_calls: assessments.length,
    avg_risk_score: Math.round((totalScore / assessments.length) * 1000) / 1000,
    risk_distribution: distribution,
    high_risk_calls: highRiskCalls
  };
}

export default {
  calculateRiskAssessment,
  shouldAlert,
  createSessionRiskSummary,
  getRiskLevel
};
