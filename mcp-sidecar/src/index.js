/**
 * MCP Compliance Sidecar
 * Main module exports
 */

export { MCPSidecarProxy } from './sidecar-proxy.js';
export { 
  createAuditLogEntry, 
  scanForInjection, 
  AuditLogStorage 
} from './modules/audit-log.js';
export { 
  calculateRiskAssessment, 
  shouldAlert, 
  createSessionRiskSummary,
  getRiskLevel 
} from './modules/risk-scorer.js';
export { 
  createDiscoveryReport, 
  generateEnvironmentReport,
  analyzeToolSensitivity,
  identifyComplianceFlags,
  identifyJurisdictions 
} from './modules/discovery.js';

export default {
  MCPSidecarProxy
};
