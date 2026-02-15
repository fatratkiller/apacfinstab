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
