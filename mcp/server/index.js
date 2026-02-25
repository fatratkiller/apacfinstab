/**
 * APAC FINSTAB Compliance MCP Server
 * 免费版 - 目标：扩大网站流量
 * 
 * 数据源：
 * - /data/policy-events.json (61条政策事件)
 * - /data/region-overviews.json (18个地区概览)
 * - /data/compliance-requirements.json (合规要求)
 */

// MCP Server配置
const SERVER_INFO = {
  name: "apacfinstab-compliance",
  version: "0.1.0",
  description: "APAC Crypto Regulation Intelligence - Free MCP Server",
  website: "https://apacfinstab.com",
  capabilities: {
    tools: true,
    resources: true
  }
};

// 工具定义
const TOOLS = [
  {
    name: "getLatestPolicies",
    description: "获取最新的APAC加密货币监管政策事件",
    inputSchema: {
      type: "object",
      properties: {
        region: {
          type: "string",
          description: "地区代码 (HK/SG/JP/KR/AU等)，不填则返回全部",
          enum: ["HK", "SG", "JP", "KR", "CN", "AU", "IN", "TH", "ID", "VN", "PH", "MY", "TW"]
        },
        topic: {
          type: "string",
          description: "主题筛选 (Stablecoin/Exchange/ETF/DeFi等)"
        },
        days: {
          type: "number",
          description: "最近N天的事件，默认30",
          default: 30
        },
        limit: {
          type: "number",
          description: "返回数量限制，默认10",
          default: 10
        }
      }
    }
  },
  {
    name: "getRegionOverview",
    description: "获取特定地区的加密货币监管概览",
    inputSchema: {
      type: "object",
      properties: {
        region: {
          type: "string",
          description: "地区代码",
          enum: ["HK", "SG", "JP", "KR", "CN", "AU"]
        }
      },
      required: ["region"]
    }
  },
  {
    name: "comparePolicies",
    description: "比较多个地区的监管政策差异",
    inputSchema: {
      type: "object",
      properties: {
        regions: {
          type: "array",
          items: { type: "string" },
          description: "要比较的地区列表",
          minItems: 2,
          maxItems: 4
        },
        topic: {
          type: "string",
          description: "比较的主题 (Exchange/Stablecoin/ETF等)"
        }
      },
      required: ["regions"]
    }
  },
  {
    name: "askSocrates",
    description: "苏格拉底式监管趋势分析 - 提出问题而非给出答案",
    inputSchema: {
      type: "object",
      properties: {
        context: {
          type: "string",
          description: "当前关注的监管动态或问题"
        },
        region: {
          type: "string",
          description: "关注的地区"
        }
      },
      required: ["context"]
    }
  }
];

// 资源定义 (MCP Resources)
const RESOURCES = [
  {
    uri: "apacfinstab://policy-tracker",
    name: "APAC Policy Tracker",
    description: "实时政策追踪器 - 访问 apacfinstab.com/tracker/",
    mimeType: "text/html"
  },
  {
    uri: "apacfinstab://dashboard",
    name: "Weekly Dashboard",
    description: "每周监管动态仪表盘 - 访问 apacfinstab.com/#dashboard",
    mimeType: "text/html"
  },
  {
    uri: "apacfinstab://blog",
    name: "Deep Analysis Blog",
    description: "深度分析文章 - 访问 apacfinstab.com/blog.html",
    mimeType: "text/html"
  }
];

// 数据加载 (实际部署时从文件读取)
let policyEvents = [];
let regionOverviews = {};

function loadData() {
  // 在实际部署中，这里会从JSON文件加载
  // const fs = require('fs');
  // policyEvents = JSON.parse(fs.readFileSync('../data/policy-events.json')).events;
  // regionOverviews = JSON.parse(fs.readFileSync('../data/region-overviews.json'));
}

// 工具实现
const toolHandlers = {
  getLatestPolicies: async (args) => {
    let events = [...policyEvents];
    
    // 按地区筛选
    if (args.region) {
      events = events.filter(e => e.regions?.includes(args.region));
    }
    
    // 按主题筛选
    if (args.topic) {
      events = events.filter(e => e.topics?.includes(args.topic));
    }
    
    // 按时间筛选
    const days = args.days || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    events = events.filter(e => new Date(e.date) >= cutoff);
    
    // 限制数量
    const limit = args.limit || 10;
    events = events.slice(0, limit);
    
    return {
      count: events.length,
      events: events,
      source: "https://apacfinstab.com/tracker/",
      note: "For full data and real-time updates, visit apacfinstab.com"
    };
  },

  getRegionOverview: async (args) => {
    const overview = regionOverviews[args.region];
    if (!overview) {
      return { error: `Region ${args.region} not found` };
    }
    return {
      ...overview,
      source: `https://apacfinstab.com/tracker/?region=${args.region}`,
      note: "For detailed analysis, visit apacfinstab.com"
    };
  },

  comparePolicies: async (args) => {
    const comparison = {};
    for (const region of args.regions) {
      comparison[region] = regionOverviews[region] || { status: "No data" };
    }
    
    return {
      regions: args.regions,
      topic: args.topic || "General",
      comparison: comparison,
      source: "https://apacfinstab.com/tracker/",
      note: "For interactive comparison, visit apacfinstab.com"
    };
  },

  askSocrates: async (args) => {
    // 苏格拉底式 - 不给答案，只提问题
    const questions = [
      `If ${args.region || 'this region'} implements this policy, how might neighboring jurisdictions respond?`,
      `What historical precedents exist for similar regulatory moves in APAC?`,
      `Which stakeholders benefit and which lose from this development?`,
      `Is this a signal of tightening or loosening? What comes next?`
    ];
    
    return {
      context: args.context,
      questions: questions,
      historicalPatterns: "Visit apacfinstab.com/tracker/ for historical policy data",
      note: "I ask questions, not give answers. The judgment is yours.",
      source: "https://apacfinstab.com"
    };
  }
};

// MCP协议处理器
async function handleMCPRequest(request) {
  const { method, params } = request;
  
  switch (method) {
    case "initialize":
      return { serverInfo: SERVER_INFO };
    
    case "tools/list":
      return { tools: TOOLS };
    
    case "tools/call":
      const handler = toolHandlers[params.name];
      if (!handler) {
        return { error: `Unknown tool: ${params.name}` };
      }
      const result = await handler(params.arguments || {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    
    case "resources/list":
      return { resources: RESOURCES };
    
    default:
      return { error: `Unknown method: ${method}` };
  }
}

// 导出
module.exports = {
  SERVER_INFO,
  TOOLS,
  RESOURCES,
  handleMCPRequest,
  loadData
};

// 如果直接运行，启动测试服务器
if (require.main === module) {
  console.log("APAC FINSTAB MCP Server");
  console.log("Tools:", TOOLS.map(t => t.name).join(", "));
  console.log("Resources:", RESOURCES.map(r => r.name).join(", "));
  console.log("\nReady for MCP connections.");
}
