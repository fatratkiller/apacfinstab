#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Policy events data (embedded or fetched from remote)
const REMOTE_DATA_URL = "https://apacfinstab.com/data/policy-events.json";

interface PolicyEvent {
  id: string;
  date: string;
  title: string;
  region: string;
  topic: string;
  impact: string;
  summary: string;
  source?: string;
}

interface RegionOverview {
  region: string;
  name: string;
  regulator: string;
  framework: string;
  exchangeLicensing: string;
  stablecoinRules: string;
  lastMajorUpdate: string;
}

// Region overviews
const REGION_OVERVIEWS: Record<string, RegionOverview> = {
  HK: {
    region: "HK",
    name: "Hong Kong",
    regulator: "SFC / HKMA",
    framework: "VASP Licensing + Stablecoin Sandbox",
    exchangeLicensing: "Required - Type 1 or VASP License",
    stablecoinRules: "Sandbox framework launching 2026",
    lastMajorUpdate: "2026-02"
  },
  SG: {
    region: "SG",
    name: "Singapore",
    regulator: "MAS",
    framework: "Payment Services Act (PSA)",
    exchangeLicensing: "Required - MPI or SPI License",
    stablecoinRules: "MAS Stablecoin Framework effective Aug 2023",
    lastMajorUpdate: "2026-01"
  },
  JP: {
    region: "JP",
    name: "Japan",
    regulator: "FSA / JVCEA",
    framework: "Payment Services Act + FIEA",
    exchangeLicensing: "Required - CESB Registration",
    stablecoinRules: "Electronic Payment Instruments framework",
    lastMajorUpdate: "2026-01"
  },
  KR: {
    region: "KR",
    name: "South Korea",
    regulator: "FSC / FSS",
    framework: "Virtual Asset User Protection Act",
    exchangeLicensing: "Required - VASP Registration",
    stablecoinRules: "Under development",
    lastMajorUpdate: "2025-12"
  },
  AU: {
    region: "AU",
    name: "Australia",
    regulator: "ASIC / AUSTRAC",
    framework: "Corporations Act + AML/CTF Act",
    exchangeLicensing: "AFSL + DCE Registration required",
    stablecoinRules: "Treasury consultation ongoing",
    lastMajorUpdate: "2026-02"
  }
};

let cachedEvents: PolicyEvent[] = [];

async function fetchPolicyEvents(): Promise<PolicyEvent[]> {
  if (cachedEvents.length > 0) return cachedEvents;
  
  try {
    const response = await fetch(REMOTE_DATA_URL);
    const data = await response.json();
    cachedEvents = data.events || [];
    return cachedEvents;
  } catch (error) {
    console.error("Failed to fetch policy events:", error);
    return [];
  }
}

const server = new Server(
  {
    name: "apacfinstab",
    version: "1.0.0",
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
        name: "getLatestPolicies",
        description: "Get latest crypto policy events from APAC regions. Filter by region, topic, and time range.",
        inputSchema: {
          type: "object",
          properties: {
            region: {
              type: "string",
              description: "ISO country code (HK, SG, JP, KR, AU, CN, IN, TH, ID, VN, PH, MY, TW)",
              enum: ["HK", "SG", "JP", "KR", "AU", "CN", "IN", "TH", "ID", "VN", "PH", "MY", "TW"]
            },
            topic: {
              type: "string",
              description: "Policy topic filter",
              enum: ["Stablecoin", "Exchange", "DeFi", "ETF", "Licensing", "Taxation", "CBDC", "Tokenization", "Regulation"]
            },
            days: {
              type: "number",
              description: "Events from last N days (default: 30)",
              default: 30
            }
          }
        }
      },
      {
        name: "getRegionOverview",
        description: "Get comprehensive regulatory overview for a specific APAC region including licensing requirements, stablecoin rules, and compliance framework.",
        inputSchema: {
          type: "object",
          properties: {
            region: {
              type: "string",
              description: "ISO country code",
              enum: ["HK", "SG", "JP", "KR", "AU"]
            }
          },
          required: ["region"]
        }
      },
      {
        name: "comparePolicies",
        description: "Compare crypto policies across multiple APAC regions by topic.",
        inputSchema: {
          type: "object",
          properties: {
            regions: {
              type: "array",
              items: { type: "string" },
              description: "List of region codes to compare",
              minItems: 2,
              maxItems: 5
            },
            topic: {
              type: "string",
              description: "Policy topic to compare",
              enum: ["Stablecoin", "Exchange", "Licensing"]
            }
          },
          required: ["regions"]
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "getLatestPolicies": {
      const events = await fetchPolicyEvents();
      const { region, topic, days = 30 } = args as { region?: string; topic?: string; days?: number };
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      let filtered = events.filter(e => new Date(e.date) >= cutoffDate);
      if (region) filtered = filtered.filter(e => e.region === region);
      if (topic) filtered = filtered.filter(e => e.topic === topic);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              count: filtered.length,
              events: filtered.slice(0, 20),
              source: "APAC FINSTAB - https://apacfinstab.com"
            }, null, 2)
          }
        ]
      };
    }

    case "getRegionOverview": {
      const { region } = args as { region: string };
      const overview = REGION_OVERVIEWS[region];
      
      if (!overview) {
        return {
          content: [{ type: "text", text: `Region ${region} not found. Available: HK, SG, JP, KR, AU` }]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ...overview,
              source: "APAC FINSTAB - https://apacfinstab.com"
            }, null, 2)
          }
        ]
      };
    }

    case "comparePolicies": {
      const { regions, topic } = args as { regions: string[]; topic?: string };
      
      const comparison = regions.map(r => ({
        region: r,
        overview: REGION_OVERVIEWS[r] || { region: r, status: "Data not available" }
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              topic: topic || "General",
              comparison,
              source: "APAC FINSTAB - https://apacfinstab.com"
            }, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("APAC FINSTAB MCP Server running on stdio");
}

main().catch(console.error);
