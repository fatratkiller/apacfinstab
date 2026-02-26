/**
 * APAC FINSTAB MCP Server - Cloudflare Workers Edition
 * 
 * Provides MCP-compatible HTTP endpoints for AI agents to query
 * APAC crypto regulatory intelligence.
 * 
 * Endpoints:
 * - GET /mcp.json - MCP manifest (for discovery)
 * - GET /tools - List available tools
 * - POST /call - Execute a tool
 */

interface Env {
  APACFINSTAB_BASE_URL: string;
}

interface ToolCall {
  name: string;
  arguments?: Record<string, unknown>;
}

interface MCPResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

// Tool definitions
const TOOLS = [
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
];

// MCP Manifest
const MCP_MANIFEST = {
  name: 'apacfinstab',
  version: '1.0.0',
  description: 'APAC FINSTAB - Crypto regulatory intelligence for Asia-Pacific regions',
  homepage: 'https://apacfinstab.com',
  capabilities: {
    tools: {}
  },
  tools: TOOLS
};

async function fetchPolicyEvents(baseUrl: string) {
  const res = await fetch(`${baseUrl}/data/policy-events.json`);
  return res.json() as Promise<{
    meta: { lastUpdated: string };
    events: Array<{
      date: string;
      regions: string[];
      topics: string[];
      [key: string]: unknown;
    }>;
  }>;
}

async function fetchRegionOverviews(baseUrl: string) {
  const res = await fetch(`${baseUrl}/data/region-overviews.json`);
  return res.json() as Promise<{
    regions: Record<string, {
      name: string;
      regulator: string;
      framework: string;
      status: string;
      stablecoinRules?: Record<string, unknown>;
      exchangeLicensing?: {
        required?: boolean;
        licenseType?: string;
        capitalRequirement?: string;
        timeline?: string;
      };
      retailAccess?: boolean;
      lastMajorUpdate?: string;
    }>;
  }>;
}

async function handleToolCall(name: string, args: Record<string, unknown> = {}, env: Env): Promise<MCPResponse> {
  const baseUrl = env.APACFINSTAB_BASE_URL;

  switch (name) {
    case 'getLatestPolicies': {
      const data = await fetchPolicyEvents(baseUrl);
      const { region, topic, days = 30 } = args as { region?: string; topic?: string; days?: number };
      
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
              events: events.slice(0, 20)
            }, null, 2)
          }
        ]
      };
    }

    case 'getRegionOverview': {
      const data = await fetchRegionOverviews(baseUrl);
      const { region } = args as { region: string };
      
      if (!region || !data.regions[region]) {
        return {
          content: [{ type: 'text', text: `Region "${region}" not found. Available: ${Object.keys(data.regions).join(', ')}` }],
          isError: true
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
      const data = await fetchRegionOverviews(baseUrl);
      const { regions, topic } = args as { regions: string[]; topic: string };
      
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
      const data = await fetchRegionOverviews(baseUrl);
      const { businessType, targetRegions } = args as { businessType: string; targetRegions: string[] };
      
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
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // MCP Manifest - for discovery
    if (path === '/mcp.json' || path === '/') {
      return new Response(JSON.stringify(MCP_MANIFEST, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // List tools
    if (path === '/tools') {
      return new Response(JSON.stringify({ tools: TOOLS }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // Execute tool call
    if (path === '/call' && request.method === 'POST') {
      try {
        const body = await request.json() as ToolCall;
        const result = await handleToolCall(body.name, body.arguments || {}, env);
        
        return new Response(JSON.stringify(result, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
          isError: true
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
          }
        });
      }
    }

    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', version: '1.0.0' }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found', availableEndpoints: ['/', '/mcp.json', '/tools', '/call', '/health'] }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }
};
