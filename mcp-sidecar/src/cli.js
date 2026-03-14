#!/usr/bin/env node
/**
 * MCP Compliance Sidecar CLI
 */

import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
import { MCPSidecarProxy } from './sidecar-proxy.js';
import { AuditLogStorage } from './modules/audit-log.js';
import { createSessionRiskSummary } from './modules/risk-scorer.js';
import { generateEnvironmentReport, createDiscoveryReport } from './modules/discovery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

/**
 * Load configuration file
 * @param {string} configPath - Path to config file
 * @returns {Object} Configuration
 */
function loadConfig(configPath) {
  const defaultPath = join(process.cwd(), 'sidecar-config.yaml');
  const path = configPath || defaultPath;
  
  if (!existsSync(path)) {
    console.error(`Config file not found: ${path}`);
    console.error('Using default configuration...');
    return getDefaultConfig();
  }
  
  try {
    const content = readFileSync(path, 'utf8');
    return parseYaml(content);
  } catch (e) {
    console.error(`Failed to load config: ${e.message}`);
    return getDefaultConfig();
  }
}

/**
 * Get default configuration
 * @returns {Object} Default config
 */
function getDefaultConfig() {
  return {
    version: '1.0',
    proxy: { mode: 'stdio' },
    audit: {
      enabled: true,
      storage: 'sqlite',
      database_path: './sidecar-audit.db',
      retention_days: 90,
      redaction: { enabled: true, patterns: [] },
      injection_detection: { enabled: true, patterns: [] }
    },
    risk_scoring: {
      enabled: true,
      weights: {
        data_sensitivity: 0.30,
        operation_type: 0.25,
        access_frequency: 0.15,
        injection_risk: 0.20,
        regulatory_relevance: 0.10
      },
      thresholds: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    alerts: {
      enabled: true,
      trigger_levels: ['HIGH', 'CRITICAL']
    },
    compliance: {
      jurisdictions: [
        { code: 'HK-SFC', triggers: ['securities', 'trading'] },
        { code: 'HK-PDPO', triggers: ['customer', 'personal'] },
        { code: 'HK-AMLO', triggers: ['transaction', 'transfer'] }
      ]
    }
  };
}

/**
 * Initialize database
 * @param {string} dbPath - Database path
 * @returns {Database} SQLite database
 */
function initDatabase(dbPath) {
  try {
    const db = new Database(dbPath);
    return db;
  } catch (e) {
    console.error(`Failed to initialize database: ${e.message}`);
    return null;
  }
}

// Create CLI program
const program = new Command();

program
  .name('mcp-sidecar')
  .description('MCP Compliance Sidecar - Audit and risk scoring for MCP tool calls')
  .version(packageJson.version);

// Start command - run as proxy
program
  .command('start')
  .description('Start the sidecar proxy')
  .option('-c, --config <path>', 'Path to config file')
  .option('--upstream <command...>', 'Upstream MCP server command')
  .action(async (options) => {
    const config = loadConfig(options.config);
    
    // Get upstream command from options or config
    let upstreamCommand = options.upstream;
    if (!upstreamCommand && config.proxy?.upstream_command?.length > 0) {
      upstreamCommand = config.proxy.upstream_command;
    }
    
    if (!upstreamCommand || upstreamCommand.length === 0) {
      console.error('Error: No upstream command specified');
      console.error('Use --upstream <command> or set proxy.upstream_command in config');
      process.exit(1);
    }
    
    // Initialize database
    const dbPath = config.audit?.database_path || './sidecar-audit.db';
    const db = initDatabase(dbPath);
    
    // Create and start proxy
    const proxy = new MCPSidecarProxy(config, db);
    
    proxy.on('alert', (alert) => {
      // Write alerts to file if configured
      const alertChannels = config.alerts?.channels || [];
      for (const channel of alertChannels) {
        if (channel.type === 'file') {
          const alertLine = JSON.stringify({
            ...alert,
            timestamp: new Date().toISOString()
          }) + '\n';
          try {
            import('fs').then(fs => {
              fs.appendFileSync(channel.path, alertLine);
            });
          } catch (e) {
            // Ignore file write errors
          }
        }
      }
    });
    
    await proxy.start(upstreamCommand);
  });

// Discover command - analyze MCP servers
program
  .command('discover')
  .description('Discover MCP server capabilities')
  .option('-c, --config <path>', 'Path to config file')
  .option('-o, --output <path>', 'Output file for discovery report')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const config = loadConfig(options.config);
    
    // For standalone discovery, we'd need to connect to MCP servers
    // For MVP, show a sample report structure
    console.log('MCP Compliance Sidecar - Discovery Mode');
    console.log('=======================================\n');
    
    // Create sample discovery report
    const sampleTools = [
      { name: 'get_customer', description: 'Get customer details by ID' },
      { name: 'list_transactions', description: 'List recent transactions' },
      { name: 'execute_trade', description: 'Execute a securities trade' }
    ];
    
    const report = createDiscoveryReport(
      { id: 'sample', name: 'Sample MCP Server', transport: 'stdio' },
      { tools: sampleTools, resources: [], prompts: [] },
      config
    );
    
    const envReport = generateEnvironmentReport([report]);
    
    if (options.json) {
      console.log(JSON.stringify(envReport, null, 2));
    } else {
      console.log(`Discovered at: ${envReport.discovered_at}`);
      console.log(`Environment: ${envReport.environment}`);
      console.log(`\nServers found: ${envReport.summary.total_servers}`);
      console.log(`High sensitivity: ${envReport.summary.high_sensitivity}`);
      console.log(`Write access: ${envReport.summary.write_access}`);
      console.log(`Compliance concerns: ${envReport.summary.total_compliance_concerns}`);
      
      for (const server of envReport.mcp_servers) {
        console.log(`\n--- ${server.name} ---`);
        console.log(`  Status: ${server.status}`);
        console.log(`  Transport: ${server.transport}`);
        console.log(`  Permission: ${server.permission_level}`);
        console.log(`  Sensitivity: ${server.data_sensitivity}`);
        console.log(`  Tools: ${server.capabilities.tools.join(', ')}`);
        if (server.compliance_flags.length > 0) {
          console.log(`  Flags: ${server.compliance_flags.join('; ')}`);
        }
        if (server.jurisdiction_relevance.length > 0) {
          console.log(`  Jurisdictions: ${server.jurisdiction_relevance.join(', ')}`);
        }
      }
    }
    
    // Write to file if specified
    if (options.output) {
      writeFileSync(options.output, JSON.stringify(envReport, null, 2));
      console.log(`\nReport written to: ${options.output}`);
    }
  });

// Report command - generate audit report
program
  .command('report')
  .description('Generate audit report from logs')
  .option('-c, --config <path>', 'Path to config file')
  .option('-d, --database <path>', 'Path to audit database')
  .option('--since <date>', 'Start date (ISO format)')
  .option('--until <date>', 'End date (ISO format)')
  .option('--session <id>', 'Filter by session ID')
  .option('--risk <level>', 'Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)')
  .option('-o, --output <path>', 'Output file for report')
  .option('--json', 'Output as JSON')
  .option('--limit <n>', 'Limit number of entries', parseInt)
  .action((options) => {
    const config = loadConfig(options.config);
    const dbPath = options.database || config.audit?.database_path || './sidecar-audit.db';
    
    if (!existsSync(dbPath)) {
      console.error(`Database not found: ${dbPath}`);
      console.error('Run the sidecar first to generate audit logs.');
      process.exit(1);
    }
    
    const db = initDatabase(dbPath);
    const auditStorage = new AuditLogStorage(db);
    
    // Query logs
    const filters = {
      sessionId: options.session,
      riskLevel: options.risk,
      since: options.since,
      until: options.until,
      limit: options.limit || 100
    };
    
    const logs = auditStorage.query(filters);
    const summary = auditStorage.getSummary({ since: options.since });
    
    // Build report
    const report = {
      generated_at: new Date().toISOString(),
      filters: filters,
      summary: summary,
      risk_summary: createSessionRiskSummary(
        logs.map(l => l.risk_assessment).filter(Boolean)
      ),
      entries: logs
    };
    
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('MCP Compliance Sidecar - Audit Report');
      console.log('======================================\n');
      console.log(`Generated: ${report.generated_at}`);
      console.log(`\nSummary:`);
      console.log(`  Total calls: ${summary?.total_calls || 0}`);
      console.log(`  Unique sessions: ${summary?.unique_sessions || 0}`);
      console.log(`  Unique tools: ${summary?.unique_tools || 0}`);
      console.log(`  Avg latency: ${Math.round(summary?.avg_latency_ms || 0)}ms`);
      console.log(`  Injection alerts: ${summary?.injection_alerts || 0}`);
      console.log(`  High risk calls: ${summary?.high_risk_calls || 0}`);
      
      if (report.risk_summary.total_calls > 0) {
        console.log(`\nRisk Distribution:`);
        for (const [level, count] of Object.entries(report.risk_summary.risk_distribution)) {
          console.log(`  ${level}: ${count}`);
        }
        console.log(`  Average risk score: ${report.risk_summary.avg_risk_score}`);
      }
      
      if (logs.length > 0) {
        console.log(`\nRecent Entries (${logs.length}):`);
        for (const log of logs.slice(0, 10)) {
          const risk = log.risk_assessment;
          console.log(`  [${log.timestamp}] ${log.call_details?.tool} - ${risk?.risk_level || 'N/A'} (${risk?.risk_score || 'N/A'})`);
        }
        if (logs.length > 10) {
          console.log(`  ... and ${logs.length - 10} more entries`);
        }
      }
    }
    
    // Write to file if specified
    if (options.output) {
      writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(`\nReport written to: ${options.output}`);
    }
    
    db.close();
  });

// Init command - create config file
program
  .command('init')
  .description('Initialize a new sidecar config file')
  .option('-o, --output <path>', 'Output path for config', 'sidecar-config.yaml')
  .action((options) => {
    if (existsSync(options.output)) {
      console.error(`Config file already exists: ${options.output}`);
      process.exit(1);
    }
    
    // Read template from package
    const templatePath = join(__dirname, '../sidecar-config.yaml');
    if (existsSync(templatePath)) {
      const template = readFileSync(templatePath, 'utf8');
      writeFileSync(options.output, template);
      console.log(`Config file created: ${options.output}`);
    } else {
      console.error('Template config not found');
      process.exit(1);
    }
  });

// Parse and run
program.parse();
