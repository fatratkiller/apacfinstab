/**
 * MCP Discovery Module
 * Discovers MCP servers and their capabilities
 */

/**
 * Analyze tool capabilities and infer sensitivity
 * @param {Object} tool - MCP tool definition
 * @returns {Object} Analysis result
 */
function analyzeToolSensitivity(tool) {
  const name = (tool.name || '').toLowerCase();
  const description = (tool.description || '').toLowerCase();
  const combined = `${name} ${description}`;
  
  const sensitivityPatterns = {
    critical: ['delete', 'remove', 'drop', 'modify', 'update', 'write', 'execute'],
    high: ['customer', 'user', 'account', 'personal', 'transaction', 'payment', 'balance'],
    medium: ['read', 'query', 'search', 'list', 'get', 'fetch'],
    low: ['help', 'info', 'version', 'status', 'ping']
  };
  
  for (const [level, patterns] of Object.entries(sensitivityPatterns)) {
    if (patterns.some(p => combined.includes(p))) {
      return { level, matchedPattern: patterns.find(p => combined.includes(p)) };
    }
  }
  
  return { level: 'unknown', matchedPattern: null };
}

/**
 * Infer permission level from tool capabilities
 * @param {Array} tools - List of tools
 * @returns {string} Permission level
 */
function inferPermissionLevel(tools) {
  const writePatterns = ['write', 'update', 'delete', 'modify', 'create', 'set', 'put', 'post'];
  
  for (const tool of tools) {
    const name = (tool.name || '').toLowerCase();
    if (writePatterns.some(p => name.includes(p))) {
      return 'read-write';
    }
  }
  
  return 'read-only';
}

/**
 * Identify compliance flags based on tool analysis
 * @param {Array} tools - List of tools
 * @param {Array} jurisdictions - Jurisdiction config
 * @returns {Array} Compliance flags
 */
function identifyComplianceFlags(tools, jurisdictions = []) {
  const flags = new Set();
  
  // Check for PII handling
  const piiPatterns = ['customer', 'user', 'person', 'name', 'email', 'phone', 'address'];
  const financialPatterns = ['transaction', 'payment', 'balance', 'account', 'transfer'];
  const marketPatterns = ['price', 'trading', 'securities', 'market', 'quote'];
  
  for (const tool of tools) {
    const combined = `${tool.name} ${tool.description || ''}`.toLowerCase();
    
    if (piiPatterns.some(p => combined.includes(p))) {
      flags.add('Contains PII access capabilities');
    }
    if (financialPatterns.some(p => combined.includes(p))) {
      flags.add('Financial data access');
    }
    if (marketPatterns.some(p => combined.includes(p))) {
      flags.add('Market-sensitive information');
    }
  }
  
  return Array.from(flags);
}

/**
 * Identify relevant jurisdictions
 * @param {Array} tools - List of tools
 * @param {Array} jurisdictions - Jurisdiction config
 * @returns {Array} Relevant jurisdiction codes
 */
function identifyJurisdictions(tools, jurisdictions = []) {
  const relevant = new Set();
  
  for (const tool of tools) {
    const combined = `${tool.name} ${tool.description || ''}`.toLowerCase();
    
    for (const jurisdiction of jurisdictions) {
      if (jurisdiction.triggers && jurisdiction.triggers.some(t => combined.includes(t.toLowerCase()))) {
        relevant.add(jurisdiction.code);
      }
    }
  }
  
  return Array.from(relevant);
}

/**
 * Create a discovery report for an MCP server
 * @param {Object} serverInfo - Server connection info
 * @param {Object} capabilities - Server capabilities (tools, resources, prompts)
 * @param {Object} config - Sidecar config
 * @returns {Object} Discovery report
 */
export function createDiscoveryReport(serverInfo, capabilities, config = {}) {
  const tools = capabilities.tools || [];
  const resources = capabilities.resources || [];
  const prompts = capabilities.prompts || [];
  const jurisdictions = config.compliance?.jurisdictions || [];
  
  // Analyze tools
  const toolAnalysis = tools.map(tool => ({
    ...tool,
    sensitivity: analyzeToolSensitivity(tool)
  }));
  
  // Calculate overall data sensitivity
  const sensitivityLevels = { critical: 4, high: 3, medium: 2, low: 1, unknown: 0 };
  const maxSensitivity = toolAnalysis.reduce((max, tool) => {
    const level = sensitivityLevels[tool.sensitivity.level] || 0;
    return level > max.value ? { level: tool.sensitivity.level, value: level } : max;
  }, { level: 'low', value: 0 });
  
  return {
    server_id: serverInfo.id || 'unknown',
    name: serverInfo.name || 'Unknown Server',
    transport: serverInfo.transport || 'stdio',
    status: 'connected',
    discovered_at: new Date().toISOString(),
    capabilities: {
      tools: tools.map(t => t.name),
      resources: resources.map(r => r.uri || r.name),
      prompts: prompts.map(p => p.name)
    },
    tool_analysis: toolAnalysis,
    permission_level: inferPermissionLevel(tools),
    data_sensitivity: maxSensitivity.level,
    compliance_flags: identifyComplianceFlags(tools, jurisdictions),
    jurisdiction_relevance: identifyJurisdictions(tools, jurisdictions),
    risk_summary: {
      total_tools: tools.length,
      total_resources: resources.length,
      high_sensitivity_tools: toolAnalysis.filter(t => 
        ['critical', 'high'].includes(t.sensitivity.level)
      ).length,
      write_capable: inferPermissionLevel(tools) === 'read-write',
      compliance_concerns: identifyComplianceFlags(tools, jurisdictions).length
    }
  };
}

/**
 * Generate full environment discovery report
 * @param {Array} servers - List of discovered servers
 * @returns {Object} Full discovery report
 */
export function generateEnvironmentReport(servers) {
  return {
    discovered_at: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mcp_servers: servers,
    summary: {
      total_servers: servers.length,
      high_sensitivity: servers.filter(s => ['critical', 'high'].includes(s.data_sensitivity)).length,
      write_access: servers.filter(s => s.permission_level === 'read-write').length,
      total_compliance_concerns: servers.reduce((sum, s) => sum + (s.compliance_flags?.length || 0), 0)
    }
  };
}

export default {
  createDiscoveryReport,
  generateEnvironmentReport,
  analyzeToolSensitivity,
  identifyComplianceFlags,
  identifyJurisdictions
};
