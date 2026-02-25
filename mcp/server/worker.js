/**
 * APAC FINSTAB Compliance MCP Server
 * Cloudflare Workers版本 - 免费部署
 * 
 * 目标：扩大网站流量
 */

// 内嵌数据 (从data/目录导入)
// 实际部署时会用构建脚本合并数据
const POLICY_EVENTS = POLICY_DATA || [];
const REGION_OVERVIEWS = REGION_DATA || {};

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

const TOOLS = [
  {
    name: "getLatestPolicies",
    description: "获取最新的APAC加密货币监管政策事件",
    inputSchema: {
      type: "object",
      properties: {
        region: {
          type: "string",
          description: "地区代码 (HK/SG/JP/KR/AU等)",
          enum: ["HK", "SG", "JP", "KR", "CN", "AU", "IN", "TH", "ID", "VN", "PH", "MY", "TW"]
        },
        topic: { type: "string", description: "主题筛选" },
        days: { type: "number", description: "最近N天", default: 30 },
        limit: { type: "number", description: "返回数量", default: 10 }
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
        regions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        topic: { type: "string" }
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
        context: { type: "string", description: "关注的监管动态" },
        region: { type: "string" }
      },
      required: ["context"]
    }
  }
];

const RESOURCES = [
  { uri: "apacfinstab://policy-tracker", name: "APAC Policy Tracker", mimeType: "text/html" },
  { uri: "apacfinstab://dashboard", name: "Weekly Dashboard", mimeType: "text/html" },
  { uri: "apacfinstab://blog", name: "Deep Analysis Blog", mimeType: "text/html" }
];

// 工具处理器
const toolHandlers = {
  getLatestPolicies: (args) => {
    let events = [...POLICY_EVENTS];
    if (args.region) events = events.filter(e => e.regions?.includes(args.region));
    if (args.topic) events = events.filter(e => e.topics?.includes(args.topic));
    const days = args.days || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    events = events.filter(e => new Date(e.date) >= cutoff);
    events = events.slice(0, args.limit || 10);
    return {
      count: events.length,
      events,
      source: "https://apacfinstab.com/tracker/",
      note: "For real-time updates, visit apacfinstab.com"
    };
  },

  getRegionOverview: (args) => {
    const overview = REGION_OVERVIEWS[args.region];
    if (!overview) return { error: `Region ${args.region} not found` };
    return {
      ...overview,
      source: `https://apacfinstab.com/tracker/?region=${args.region}`
    };
  },

  comparePolicies: (args) => {
    const comparison = {};
    for (const region of args.regions) {
      comparison[region] = REGION_OVERVIEWS[region] || { status: "No data" };
    }
    return { regions: args.regions, topic: args.topic || "General", comparison, source: "https://apacfinstab.com/tracker/" };
  },

  askSocrates: (args) => ({
    context: args.context,
    questions: [
      `If ${args.region || 'this region'} implements this policy, how might neighboring jurisdictions respond?`,
      `What historical precedents exist for similar regulatory moves in APAC?`,
      `Which stakeholders benefit and which lose from this development?`,
      `Is this a signal of tightening or loosening? What comes next?`
    ],
    note: "I ask questions, not give answers. The judgment is yours.",
    source: "https://apacfinstab.com"
  })
};

// MCP请求处理
function handleMCP(request) {
  const { method, params } = request;
  
  switch (method) {
    case "initialize":
      return { serverInfo: SERVER_INFO };
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      const handler = toolHandlers[params.name];
      if (!handler) return { error: `Unknown tool: ${params.name}` };
      const result = handler(params.arguments || {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    case "resources/list":
      return { resources: RESOURCES };
    default:
      return { error: `Unknown method: ${method}` };
  }
}

// Cloudflare Worker入口
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    // OPTIONS预检
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 根路径 - 显示服务信息
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(JSON.stringify({
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
        description: SERVER_INFO.description,
        website: SERVER_INFO.website,
        usage: "POST /mcp with MCP protocol requests",
        docs: "https://apacfinstab.com/docs/mcp"
      }, null, 2), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    // MCP端点
    if (url.pathname === "/mcp" && request.method === "POST") {
      try {
        const body = await request.json();
        const result = handleMCP(body);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }
    
    // 健康检查
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    return new Response("Not Found", { status: 404 });
  }
};

// 占位符 - 构建时替换为实际数据
var POLICY_DATA = [];
var REGION_DATA = {};
