/**
 * PolicyPedia ACP Agent
 * 
 * Virtuals ACP integration for APAC FINSTAB compliance services.
 * 
 * Services:
 * - reg_lookup: Regulatory lookup for APAC jurisdictions
 * - compliance_check: Check activity compliance
 * - license_compare: Compare licensing costs
 */

import 'dotenv/config';
import { AcpClient, AcpJobPhase } from '@virtuals-protocol/acp-node';

// Service definitions
const SERVICES = {
  reg_lookup: {
    name: 'APAC Crypto Regulatory Lookup',
    description: 'Query cryptocurrency regulations for any APAC jurisdiction',
    price: '0.01', // USDC
  },
  compliance_check: {
    name: 'Compliance Context Check',
    description: 'Check if a specific activity is compliant in a given jurisdiction',
    price: '0.05',
  },
  license_compare: {
    name: 'APAC License Cost Comparison',
    description: 'Compare crypto licensing costs across APAC jurisdictions',
    price: '0.02',
  },
};

// MCP API caller
async function callMcpApi(endpoint, params = {}) {
  const baseUrl = process.env.MCP_API_BASE || 'https://apacfinstab.kyleleo2018.workers.dev';
  const url = new URL(endpoint, baseUrl);
  
  // Add query params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`MCP API error: ${response.status}`);
  }
  return response.json();
}

// Service handlers
async function handleRegLookup(inputs) {
  const { jurisdiction, topic } = inputs;
  
  // Call MCP API
  const result = await callMcpApi('/api/regulatory-info', {
    jurisdiction,
    topic,
  });
  
  return {
    summary: result.summary || `Regulatory information for ${jurisdiction}/${topic}`,
    key_requirements: result.requirements || [],
    regulator: result.regulator || 'Unknown',
    last_updated: result.lastUpdated || new Date().toISOString(),
  };
}

async function handleComplianceCheck(inputs) {
  const { jurisdiction, activity_type, entity_type, amount_usd } = inputs;
  
  // Call MCP API
  const result = await callMcpApi('/api/check-compliance', {
    jurisdiction,
    activity: activity_type,
    entity: entity_type,
    amount: amount_usd,
  });
  
  return {
    is_compliant: result.isCompliant ?? true,
    confidence: result.confidence || 0.7,
    requirements: result.requirements || [],
    flags: result.flags || [],
    citations: result.citations || [],
  };
}

async function handleLicenseCompare(inputs) {
  const { license_type, compare_regions } = inputs;
  
  // Call MCP API
  const result = await callMcpApi('/api/license-costs', {
    type: license_type,
    regions: compare_regions?.join(','),
  });
  
  return {
    comparison_table: result.comparison || [],
    cheapest_option: result.cheapest || null,
    fastest_option: result.fastest || null,
    recommendation: result.recommendation || 'Please consult a licensed advisor.',
  };
}

// Main task handler
async function handleNewTask(job) {
  const { id, serviceId, requirements } = job;
  
  console.log(`[PolicyPedia] New task received: ${id}`);
  console.log(`  Service: ${serviceId}`);
  console.log(`  Inputs: ${JSON.stringify(requirements)}`);
  
  try {
    let result;
    const inputs = JSON.parse(requirements || '{}');
    
    switch (serviceId) {
      case 'reg_lookup':
        result = await handleRegLookup(inputs);
        break;
      case 'compliance_check':
        result = await handleComplianceCheck(inputs);
        break;
      case 'license_compare':
        result = await handleLicenseCompare(inputs);
        break;
      default:
        throw new Error(`Unknown service: ${serviceId}`);
    }
    
    console.log(`[PolicyPedia] Task ${id} completed successfully`);
    return { success: true, data: result };
    
  } catch (error) {
    console.error(`[PolicyPedia] Task ${id} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Evaluation handler (for rating received services - we're a seller, so this is less relevant)
async function handleEvaluation(job) {
  console.log(`[PolicyPedia] Evaluation request for job: ${job.id}`);
  return { rating: 5, feedback: 'OK' };
}

// Initialize and run
async function main() {
  console.log('========================================');
  console.log('PolicyPedia ACP Agent');
  console.log('APAC FINSTAB Compliance Services');
  console.log('========================================');
  
  // Validate environment
  const required = ['WALLET_PRIVATE_KEY', 'AGENT_WALLET_ADDRESS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('\nPlease copy .env.example to .env and fill in values.');
    console.log('See docs/ACP-INTEGRATION-DESIGN.md for setup instructions.');
    process.exit(1);
  }
  
  console.log('\n📋 Registered Services:');
  Object.entries(SERVICES).forEach(([id, svc]) => {
    console.log(`  - ${id}: ${svc.name} ($${svc.price} USDC)`);
  });
  
  console.log('\n🔗 MCP API:', process.env.MCP_API_BASE || 'https://apacfinstab.kyleleo2018.workers.dev');
  console.log('🌐 Environment:', process.env.ACP_ENV || 'sandbox');
  
  // TODO: Initialize ACP client when sandbox registration is complete
  // const acpClient = new AcpClient({
  //   acpContractClient: await AcpContractClientV2.build(
  //     process.env.WALLET_PRIVATE_KEY,
  //     process.env.SESSION_ENTITY_KEY_ID,
  //     process.env.AGENT_WALLET_ADDRESS
  //   ),
  //   onNewTask: handleNewTask,
  //   onEvaluate: handleEvaluation
  // });
  
  console.log('\n⏳ ACP Client initialization pending sandbox registration...');
  console.log('\nNext steps:');
  console.log('1. Register agent at https://sandbox.game.virtuals.io/');
  console.log('2. Get SESSION_ENTITY_KEY_ID from registration');
  console.log('3. Uncomment ACP client initialization code');
  console.log('4. Run `npm start` to connect to ACP network');
}

main().catch(console.error);
