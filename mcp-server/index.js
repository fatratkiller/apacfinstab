#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Fetch data from APAC FINSTAB
async function fetchPolicyEvents() {
  const res = await fetch('https://apacfinstab.com/data/policy-events.json');
  return res.json();
}

async function fetchRegionOverviews() {
  const res = await fetch('https://apacfinstab.com/data/region-overviews.json');
  return res.json();
}

// ============ Preflight Functions ============

const KYC_THRESHOLDS = {
  HK: { kycRequired: 8000 },
  SG: { kycRequired: 5000 },
  JP: { kycRequired: 100000 },
  US: { kycRequired: 3000 },
  DEFAULT: { kycRequired: 1000 }
};

const SECURITIES_RULES = {
  HK: {
    requiresLicense: true,
    message: '香港发行可能构成受监管活动，需SFC批准',
    references: ['SFO Schedule 1', 'SFC Statement on ICOs']
  },
  SG: {
    requiresLicense: true,
    message: '新加坡发行可能需要MAS批准',
    references: ['SFA', 'MAS Guide to Digital Token Offerings']
  },
  US: {
    requiresLicense: true,
    message: '美国发行几乎确定需要SEC注册或豁免',
    references: ['Securities Act 1933', 'Howey Test']
  }
};

async function preflightX402(params) {
  const { fromAddress, toAddress, amount, token, chain, fromJurisdiction, toJurisdiction } = params;
  
  const preflightId = `pf_x402_${Date.now()}`;
  const flags = [];
  const references = [];
  let status = 'CLEAR';
  let riskLevel = 'low';

  // KYC threshold check
  const jurisdiction = fromJurisdiction || 'DEFAULT';
  const threshold = KYC_THRESHOLDS[jurisdiction] || KYC_THRESHOLDS.DEFAULT;
  
  if (amount >= threshold.kycRequired) {
    flags.push({
      code: 'KYC_THRESHOLD',
      severity: 'high',
      message: `金额${amount}超过${jurisdiction}的KYC阈值(${threshold.kycRequired})`,
      question: '发送方是否已完成KYC验证？'
    });
    status = 'REVIEW_REQUIRED';
    riskLevel = 'high';
  }

  // Cross-border check
  if (fromJurisdiction && toJurisdiction && fromJurisdiction !== toJurisdiction) {
    flags.push({
      code: 'CROSS_BORDER',
      severity: 'medium',
      message: `跨境支付: ${fromJurisdiction} → ${toJurisdiction}`,
      question: '是否符合跨境支付规定？'
    });
    if (status === 'CLEAR') {
      status = 'REVIEW_REQUIRED';
      riskLevel = 'medium';
    }
    references.push('Cross-Border Payment Guidelines');
  }

  return {
    preflightId,
    timestamp: new Date().toISOString(),
    status,
    riskLevel,
    flags,
    references,
    input: { fromAddress: fromAddress?.slice(0, 10) + '...', amount, token, chain },
    suggestedActions: flags.length > 0 ? flags.map(f => f.question) : ['无需额外操作']
  };
}

async function preflightTokenLaunch(params) {
  const { tokenName, tokenSymbol, totalSupply, distribution, creatorJurisdiction, hasRevenue, hasGovernance } = params;
  
  const preflightId = `pf_launch_${Date.now()}`;
  const flags = [];
  const references = [];
  let status = 'CLEAR';
  let riskLevel = 'low';

  // Howey Test
  let howeyScore = 0;
  if (distribution?.presale > 0) howeyScore++;
  if (distribution?.team > 0) howeyScore++;
  if (hasRevenue) howeyScore++;
  if (hasGovernance === false && distribution?.team > 20) howeyScore++;

  if (howeyScore >= 3) {
    flags.push({
      code: 'SECURITIES_RISK_HIGH',
      severity: 'high',
      message: `Token可能被视为证券 (Howey Test评分: ${howeyScore}/4)`,
      question: '是否已评估证券法合规要求？'
    });
    status = 'REVIEW_REQUIRED';
    riskLevel = 'high';
    references.push('SEC v. W.J. Howey Co.', 'SEC Framework for Digital Assets');
  } else if (howeyScore >= 2) {
    flags.push({
      code: 'SECURITIES_RISK_MEDIUM',
      severity: 'medium',
      message: `Token有一定证券属性 (Howey Test评分: ${howeyScore}/4)`
    });
    if (status === 'CLEAR') {
      status = 'REVIEW_REQUIRED';
      riskLevel = 'medium';
    }
  }

  // Jurisdiction rules
  const rule = SECURITIES_RULES[creatorJurisdiction];
  if (rule?.requiresLicense) {
    flags.push({
      code: 'LICENSE_REQUIRED',
      severity: 'high',
      message: rule.message
    });
    references.push(...rule.references);
    if (riskLevel !== 'critical') riskLevel = 'high';
    status = 'REVIEW_REQUIRED';
  }

  return {
    preflightId,
    timestamp: new Date().toISOString(),
    status,
    riskLevel,
    howeyScore,
    flags,
    references,
    input: { tokenName, tokenSymbol, creatorJurisdiction },
    suggestedActions: flags.length > 0 
      ? ['咨询证券法律师评估Token分类', `检查${creatorJurisdiction}的Token发行许可要求`]
      : ['基础检查通过']
  };
}

// Create MCP Server
const server = new Server(
  {
    name: 'apacfinstab',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'getLatestPolicies',
        description: 'Get latest crypto policy events from APAC regions. Returns policy news, regulatory changes, and compliance updates.',
        inputSchema: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              description: 'ISO country code (HK, SG, JP, KR, AU, CN, IN, TH, ID, VN, PH, MY, TW)',
              enum: ['HK', 'SG', 'JP', 'KR', 'AU', 'CN', 'IN', 'TH', 'ID', 'VN', 'PH', 'MY', 'TW']
            },
            topic: {
              type: 'string',
              description: 'Policy topic filter',
              enum: ['Stablecoin', 'Exchange', 'DeFi', 'ETF', 'Licensing', 'Taxation', 'CBDC', 'Tokenization', 'Regulation']
            },
            days: {
              type: 'number',
              description: 'Events from last N days (default: 30)',
              default: 30
            }
          }
        }
      },
      {
        name: 'getRegionOverview',
        description: 'Get comprehensive regulatory overview for a specific APAC region including licensing requirements, stablecoin rules, and compliance framework.',
        inputSchema: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              description: 'ISO country code',
              enum: ['HK', 'SG', 'JP', 'KR', 'AU', 'CN', 'IN', 'TH', 'ID', 'VN', 'PH', 'MY', 'TW']
            }
          },
          required: ['region']
        }
      },
      {
        name: 'comparePolicies',
        description: 'Compare crypto policies across multiple APAC regions for a specific topic.',
        inputSchema: {
          type: 'object',
          properties: {
            regions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of region codes to compare (2-5 regions)',
              minItems: 2,
              maxItems: 5
            },
            topic: {
              type: 'string',
              description: 'Topic to compare',
              enum: ['Stablecoin', 'Exchange', 'DeFi', 'ETF', 'Licensing']
            }
          },
          required: ['regions', 'topic']
        }
      },
      {
        name: 'checkCompliance',
        description: 'Check compliance requirements for a business model in specific APAC regions.',
        inputSchema: {
          type: 'object',
          properties: {
            businessType: {
              type: 'string',
              description: 'Type of crypto business',
              enum: ['exchange', 'stablecoin_issuer', 'defi_protocol', 'custodian', 'payment_service']
            },
            targetRegions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Target regions for compliance check'
            }
          },
          required: ['businessType', 'targetRegions']
        }
      },
      {
        name: 'preflightX402',
        description: 'Check x402 payment compliance before execution. Returns risk assessment, flags, and suggested actions.',
        inputSchema: {
          type: 'object',
          properties: {
            fromAddress: {
              type: 'string',
              description: 'Sender wallet address'
            },
            toAddress: {
              type: 'string',
              description: 'Recipient wallet address'
            },
            amount: {
              type: 'number',
              description: 'Payment amount'
            },
            token: {
              type: 'string',
              description: 'Token type (USDC, USDT, ETH, etc.)'
            },
            chain: {
              type: 'string',
              description: 'Blockchain (base, ethereum, solana)',
              default: 'base'
            },
            fromJurisdiction: {
              type: 'string',
              description: 'Sender jurisdiction (HK, SG, US, etc.)'
            },
            toJurisdiction: {
              type: 'string',
              description: 'Recipient jurisdiction'
            }
          },
          required: ['fromAddress', 'toAddress', 'amount', 'token']
        }
      },
      {
        name: 'preflightTokenLaunch',
        description: 'Check compliance for token launch/issuance. Includes Howey Test assessment and jurisdiction-specific requirements.',
        inputSchema: {
          type: 'object',
          properties: {
            tokenName: {
              type: 'string',
              description: 'Token name'
            },
            tokenSymbol: {
              type: 'string',
              description: 'Token symbol'
            },
            totalSupply: {
              type: 'number',
              description: 'Total token supply'
            },
            distribution: {
              type: 'object',
              description: 'Token distribution (team %, presale %, public %)',
              properties: {
                team: { type: 'number' },
                presale: { type: 'number' },
                public: { type: 'number' }
              }
            },
            creatorJurisdiction: {
              type: 'string',
              description: 'Creator jurisdiction (HK, SG, US, JP, etc.)'
            },
            hasRevenue: {
              type: 'boolean',
              description: 'Does token promise revenue/yield?'
            },
            hasGovernance: {
              type: 'boolean',
              description: 'Does token have governance rights?'
            }
          },
          required: ['tokenName', 'tokenSymbol', 'creatorJurisdiction']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'getLatestPolicies': {
        const data = await fetchPolicyEvents();
        const { region, topic, days = 30 } = args || {};
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        let events = data.events.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= cutoffDate;
        });
        
        if (region) {
          events = events.filter(e => e.regions.includes(region));
        }
        if (topic) {
          events = events.filter(e => e.topics.includes(topic));
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: events.length,
                lastUpdated: data.meta.lastUpdated,
                events: events.slice(0, 20) // Limit to 20 events
              }, null, 2)
            }
          ]
        };
      }

      case 'getRegionOverview': {
        const data = await fetchRegionOverviews();
        const { region } = args;
        
        if (!region || !data.regions[region]) {
          return {
            content: [{ type: 'text', text: `Region "${region}" not found. Available: ${Object.keys(data.regions).join(', ')}` }]
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data.regions[region], null, 2)
            }
          ]
        };
      }

      case 'comparePolicies': {
        const data = await fetchRegionOverviews();
        const { regions, topic } = args;
        
        const comparison = regions.map(region => {
          const info = data.regions[region];
          if (!info) return { region, error: 'Not found' };
          
          let topicData = {};
          switch (topic) {
            case 'Stablecoin':
              topicData = info.stablecoinRules || {};
              break;
            case 'Exchange':
            case 'Licensing':
              topicData = info.exchangeLicensing || {};
              break;
            default:
              topicData = { status: info.status, framework: info.framework };
          }
          
          return {
            region,
            name: info.name,
            regulator: info.regulator,
            ...topicData
          };
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ topic, comparison }, null, 2)
            }
          ]
        };
      }

      case 'checkCompliance': {
        const data = await fetchRegionOverviews();
        const { businessType, targetRegions } = args;
        
        const results = targetRegions.map(region => {
          const info = data.regions[region];
          if (!info) return { region, error: 'Not found' };
          
          const licensing = info.exchangeLicensing || {};
          
          return {
            region,
            name: info.name,
            regulator: info.regulator,
            framework: info.framework,
            status: info.status,
            licensingRequired: licensing.required,
            licenseType: licensing.licenseType,
            capitalRequirement: licensing.capitalRequirement,
            timeline: licensing.timeline,
            retailAccess: info.retailAccess,
            lastMajorUpdate: info.lastMajorUpdate
          };
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                businessType,
                regions: results
              }, null, 2)
            }
          ]
        };
      }

      case 'preflightX402': {
        const result = await preflightX402(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'preflightTokenLaunch': {
        const result = await preflightTokenLaunch(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('APAC FINSTAB MCP Server running on stdio');
}

main().catch(console.error);
