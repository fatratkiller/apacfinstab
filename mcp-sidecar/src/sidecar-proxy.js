/**
 * MCP Sidecar Proxy
 * Intercepts MCP communication for compliance monitoring
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { createAuditLogEntry, AuditLogStorage } from './modules/audit-log.js';
import { calculateRiskAssessment, shouldAlert } from './modules/risk-scorer.js';
import { createDiscoveryReport } from './modules/discovery.js';

/**
 * MCP Sidecar Proxy class
 * Proxies MCP stdio communication and logs all tool calls
 */
export class MCPSidecarProxy extends EventEmitter {
  constructor(config, db) {
    super();
    this.config = config;
    this.db = db;
    this.auditStorage = db ? new AuditLogStorage(db) : null;
    this.upstreamProcess = null;
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.pendingRequests = new Map();
    this.discoveryReport = null;
    this.inputBuffer = '';
    this.upstreamBuffer = '';
  }

  /**
   * Start the proxy
   * @param {Array} upstreamCommand - Command to spawn upstream MCP server
   */
  async start(upstreamCommand) {
    if (!upstreamCommand || upstreamCommand.length === 0) {
      throw new Error('No upstream command specified');
    }

    console.error(`[Sidecar] Starting proxy for: ${upstreamCommand.join(' ')}`);
    console.error(`[Sidecar] Session ID: ${this.sessionId}`);

    // Spawn upstream process
    this.upstreamProcess = spawn(upstreamCommand[0], upstreamCommand.slice(1), {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Handle upstream stdout (messages from server)
    this.upstreamProcess.stdout.on('data', (data) => {
      this.handleUpstreamMessage(data);
    });

    // Handle client stdin (messages from host)
    process.stdin.on('data', (data) => {
      this.handleClientMessage(data);
    });

    // Handle process exit
    this.upstreamProcess.on('exit', (code) => {
      console.error(`[Sidecar] Upstream process exited with code ${code}`);
      process.exit(code || 0);
    });

    process.stdin.on('end', () => {
      console.error('[Sidecar] Client disconnected');
      this.upstreamProcess?.kill();
    });

    console.error('[Sidecar] Proxy started successfully');
  }

  /**
   * Handle message from client (MCP host)
   * @param {Buffer} data - Raw message data
   */
  handleClientMessage(data) {
    this.inputBuffer += data.toString();
    
    // Try to parse complete JSON-RPC messages
    const messages = this.extractMessages(this.inputBuffer);
    this.inputBuffer = messages.remaining;
    
    for (const msg of messages.parsed) {
      this.processClientRequest(msg);
    }
  }

  /**
   * Handle message from upstream MCP server
   * @param {Buffer} data - Raw message data
   */
  handleUpstreamMessage(data) {
    this.upstreamBuffer += data.toString();
    
    // Try to parse complete JSON-RPC messages
    const messages = this.extractMessages(this.upstreamBuffer);
    this.upstreamBuffer = messages.remaining;
    
    for (const msg of messages.parsed) {
      this.processUpstreamResponse(msg);
    }
  }

  /**
   * Extract complete JSON-RPC messages from buffer
   * @param {string} buffer - Input buffer
   * @returns {Object} Parsed messages and remaining buffer
   */
  extractMessages(buffer) {
    const parsed = [];
    let remaining = buffer;
    
    // Try to parse line-delimited JSON
    const lines = remaining.split('\n');
    remaining = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Check if this is the last incomplete line
      if (i === lines.length - 1 && !buffer.endsWith('\n')) {
        remaining = line;
        continue;
      }
      
      try {
        const msg = JSON.parse(line);
        parsed.push(msg);
      } catch (e) {
        // Not valid JSON, might be incomplete
        remaining += line + '\n';
      }
    }
    
    return { parsed, remaining };
  }

  /**
   * Process a request from the client
   * @param {Object} message - JSON-RPC message
   */
  processClientRequest(message) {
    const startTime = Date.now();
    
    // Track request for correlation
    if (message.id !== undefined) {
      this.pendingRequests.set(message.id, {
        method: message.method,
        params: message.params,
        startTime
      });
    }

    // Log the request
    if (message.method === 'tools/call') {
      console.error(`[Sidecar] Tool call: ${message.params?.name}`);
    }

    // Forward to upstream
    this.upstreamProcess.stdin.write(JSON.stringify(message) + '\n');
  }

  /**
   * Process a response from upstream server
   * @param {Object} message - JSON-RPC message
   */
  processUpstreamResponse(message) {
    // Handle response correlation
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const request = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);
      
      const latencyMs = Date.now() - request.startTime;

      // Create audit log for tool calls
      if (request.method === 'tools/call') {
        this.logToolCall(request, message, latencyMs);
      }

      // Capture capabilities for discovery
      if (request.method === 'tools/list' && message.result) {
        this.captureTools(message.result.tools || []);
      }
      if (request.method === 'resources/list' && message.result) {
        this.captureResources(message.result.resources || []);
      }
    }

    // Forward to client
    process.stdout.write(JSON.stringify(message) + '\n');
  }

  /**
   * Log a tool call
   * @param {Object} request - Original request
   * @param {Object} response - Response from server
   * @param {number} latencyMs - Call latency
   */
  logToolCall(request, response, latencyMs) {
    const toolName = request.params?.name;
    const toolArgs = request.params?.arguments || {};
    const result = response.result;
    const error = response.error;

    // Create audit log entry
    const auditEntry = createAuditLogEntry({
      sessionId: this.sessionId,
      agentId: 'mcp-sidecar',
      serverId: 'upstream',
      tool: toolName,
      input: toolArgs,
      output: result,
      latencyMs,
      error: error?.message
    }, this.config);

    // Calculate risk assessment
    const riskAssessment = calculateRiskAssessment(auditEntry, this.config);
    auditEntry.risk_assessment = riskAssessment;

    // Save to database
    if (this.auditStorage) {
      try {
        this.auditStorage.save(auditEntry);
      } catch (e) {
        console.error(`[Sidecar] Failed to save audit log: ${e.message}`);
      }
    }

    // Emit events
    this.emit('toolCall', auditEntry);

    // Check for alerts
    if (shouldAlert(riskAssessment.risk_level, this.config.alerts?.trigger_levels)) {
      this.emit('alert', {
        type: 'high_risk_call',
        assessment: riskAssessment,
        auditEntry
      });
      console.error(`[Sidecar] ⚠️ HIGH RISK: ${toolName} - Score: ${riskAssessment.risk_score}`);
    }

    // Log summary
    console.error(`[Sidecar] Tool: ${toolName} | Risk: ${riskAssessment.risk_level} (${riskAssessment.risk_score}) | ${latencyMs}ms`);
  }

  /**
   * Capture tool capabilities for discovery
   * @param {Array} tools - List of tools
   */
  captureTools(tools) {
    this._tools = tools;
    this.updateDiscoveryReport();
  }

  /**
   * Capture resource capabilities for discovery
   * @param {Array} resources - List of resources
   */
  captureResources(resources) {
    this._resources = resources;
    this.updateDiscoveryReport();
  }

  /**
   * Update the discovery report
   */
  updateDiscoveryReport() {
    if (this._tools) {
      this.discoveryReport = createDiscoveryReport(
        { id: 'upstream', name: 'Upstream MCP Server', transport: 'stdio' },
        { tools: this._tools, resources: this._resources || [], prompts: [] },
        this.config
      );
      this.emit('discovery', this.discoveryReport);
    }
  }

  /**
   * Get the current discovery report
   * @returns {Object} Discovery report
   */
  getDiscoveryReport() {
    return this.discoveryReport;
  }

  /**
   * Stop the proxy
   */
  stop() {
    if (this.upstreamProcess) {
      this.upstreamProcess.kill();
      this.upstreamProcess = null;
    }
  }
}

export default MCPSidecarProxy;
