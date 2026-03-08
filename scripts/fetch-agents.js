#!/usr/bin/env node
/**
 * APAC FINSTAB Agent Auto-Collector
 * 
 * 数据源:
 * 1. DeFiLlama API - AI/Agent protocols
 * 2. CoinGecko API - AI coins category
 * 3. 手动维护的热门agent列表
 * 
 * 运行: node scripts/fetch-agents.js
 */

const fs = require('fs');
const path = require('path');

// ============ 配置 ============
const DATA_FILE = path.join(__dirname, '../data/agents.json');
const AGENTS_DIR = path.join(__dirname, '../agents');

// AI/Agent相关关键词
const AI_KEYWORDS = [
  'ai', 'agent', 'autonomous', 'gpt', 'llm', 'ml', 'machine learning',
  'neural', 'bot', 'automation', 'inference', 'compute'
];

// 手动维护的热门agent（确保收录）
const CURATED_AGENTS = [
  // ==================== Web3 Trading Agents ====================
  { id: 'virtuals-protocol', name: 'Virtuals Protocol', chain: 'Base', category: 'trading', hot: true },
  { id: 'ai16z', name: 'ai16z (Eliza)', chain: 'Solana', category: 'trading', hot: true },
  { id: 'griffain', name: 'Griffain', chain: 'Solana', category: 'trading', hot: true },
  { id: 'zerebro', name: 'Zerebro', chain: 'Solana', category: 'trading', hot: true },
  { id: 'arc-agent', name: 'ARC Agent', chain: 'Solana', category: 'trading' },
  { id: 'luna-ai', name: 'Luna AI', chain: 'Solana', category: 'social', hot: true },
  { id: 'aixbt', name: 'AIXBT', chain: 'Base', category: 'social' },
  { id: 'truth-terminal', name: 'Truth Terminal', chain: 'Solana', category: 'social', hot: true },
  
  // ==================== Web3 Infrastructure ====================
  { id: 'fetch-ai', name: 'Fetch.ai', chain: 'Cosmos', category: 'infrastructure', established: true },
  { id: 'singularitynet', name: 'SingularityNET', chain: 'Ethereum', category: 'infrastructure', established: true },
  { id: 'ocean-protocol', name: 'Ocean Protocol', chain: 'Ethereum', category: 'data', established: true },
  { id: 'bittensor', name: 'Bittensor', chain: 'Polkadot', category: 'infrastructure', hot: true },
  { id: 'autonolas', name: 'Autonolas (OLAS)', chain: 'Ethereum', category: 'infrastructure' },
  { id: 'morpheus-ai', name: 'Morpheus AI', chain: 'Ethereum', category: 'infrastructure' },
  { id: 'vana', name: 'Vana', chain: 'Ethereum', category: 'data', hot: true },
  { id: 'ritual', name: 'Ritual', chain: 'Ethereum', category: 'infrastructure' },
  { id: 'nillion', name: 'Nillion', chain: 'Ethereum', category: 'infrastructure' },
  { id: 'wayfinder', name: 'Wayfinder', chain: 'Solana', category: 'gaming' },
  { id: 'spectral-syntax', name: 'Spectral Syntax', chain: 'Ethereum', category: 'trading' },
  { id: 'myshell', name: 'MyShell', chain: 'BSC', category: 'social' },
  { id: 'goat', name: 'GOAT', chain: 'Solana', category: 'social', hot: true },
  { id: 'fartcoin', name: 'Fartcoin', chain: 'Solana', category: 'social', hot: true },
  { id: 'ai-rig-complex', name: 'AI Rig Complex', chain: 'Solana', category: 'infrastructure' },
  { id: 'swarms', name: 'Swarms', chain: 'Solana', category: 'infrastructure' },
  { id: 'sentient', name: 'Sentient', chain: 'Ethereum', category: 'infrastructure' },
  { id: 'phala-network', name: 'Phala Network', chain: 'Polkadot', category: 'infrastructure' },
  { id: 'akash-network', name: 'Akash Network', chain: 'Cosmos', category: 'infrastructure', established: true },
  { id: 'render', name: 'Render Network', chain: 'Solana', category: 'infrastructure', established: true },
  { id: 'nosana', name: 'Nosana', chain: 'Solana', category: 'infrastructure' },
  { id: 'io-net', name: 'io.net', chain: 'Solana', category: 'infrastructure', hot: true },
  
  // ==================== MCP/Claude 生态 (OpenClaw) ====================
  { id: 'clawdbot', name: 'Clawdbot (OpenClaw)', chain: 'MCP', category: 'infrastructure', hot: true, description: 'MCP-native AI agent orchestration platform. Gateway for Claude-powered agents with multi-channel deployment.' },
  { id: 'claude-computer-use', name: 'Claude Computer Use', chain: 'MCP', category: 'infrastructure', hot: true, established: true, description: 'Anthropic official computer control agent. Can browse, code, and interact with desktop.' },
  { id: 'mcp-filesystem', name: 'MCP Filesystem Server', chain: 'MCP', category: 'infrastructure', description: 'Official MCP server for local file system access.' },
  { id: 'mcp-github', name: 'MCP GitHub Server', chain: 'MCP', category: 'infrastructure', description: 'Official MCP server for GitHub API integration.' },
  { id: 'mcp-postgres', name: 'MCP PostgreSQL Server', chain: 'MCP', category: 'data', description: 'Official MCP server for PostgreSQL database access.' },
  { id: 'mcp-puppeteer', name: 'MCP Puppeteer Server', chain: 'MCP', category: 'infrastructure', description: 'Browser automation via Puppeteer for MCP agents.' },
  { id: 'mcp-slack', name: 'MCP Slack Server', chain: 'MCP', category: 'social', description: 'Slack integration for MCP-powered agents.' },
  { id: 'mcp-brave-search', name: 'MCP Brave Search', chain: 'MCP', category: 'infrastructure', description: 'Web search capabilities via Brave API for MCP agents.' },
  
  // ==================== LangChain 生态 ====================
  { id: 'langchain', name: 'LangChain', chain: 'Python', category: 'infrastructure', hot: true, established: true, description: 'Most popular framework for building LLM-powered applications and agents.' },
  { id: 'langgraph', name: 'LangGraph', chain: 'Python', category: 'infrastructure', hot: true, description: 'Framework for building stateful, multi-actor LLM applications with cycles.' },
  { id: 'langsmith', name: 'LangSmith', chain: 'Cloud', category: 'infrastructure', description: 'Platform for debugging, testing, evaluating, and monitoring LLM apps.' },
  { id: 'langserve', name: 'LangServe', chain: 'Python', category: 'infrastructure', description: 'Deploy LangChain runnables and chains as REST APIs.' },
  
  // ==================== AutoGPT 生态 ====================
  { id: 'autogpt', name: 'AutoGPT', chain: 'Python', category: 'infrastructure', hot: true, established: true, description: 'Autonomous GPT-4 agent that can self-prompt to achieve goals.' },
  { id: 'agentgpt', name: 'AgentGPT', chain: 'Web', category: 'infrastructure', hot: true, description: 'Browser-based autonomous AI agent. Deploy AI agents with no code.' },
  { id: 'babyagi', name: 'BabyAGI', chain: 'Python', category: 'infrastructure', established: true, description: 'Task-driven autonomous agent using OpenAI and vector databases.' },
  { id: 'superagi', name: 'SuperAGI', chain: 'Python', category: 'infrastructure', description: 'Dev-first open source autonomous AI agent framework.' },
  
  // ==================== CrewAI 生态 ====================
  { id: 'crewai', name: 'CrewAI', chain: 'Python', category: 'infrastructure', hot: true, description: 'Framework for orchestrating role-playing autonomous AI agents.' },
  { id: 'crewai-tools', name: 'CrewAI Tools', chain: 'Python', category: 'infrastructure', description: 'Collection of tools for CrewAI agents including web scraping, file ops.' },
  
  // ==================== OpenAI 生态 ====================
  { id: 'openai-assistants', name: 'OpenAI Assistants API', chain: 'Cloud', category: 'infrastructure', hot: true, established: true, description: 'OpenAI official API for building AI assistants with tools and memory.' },
  { id: 'openai-gpts', name: 'OpenAI GPTs', chain: 'Cloud', category: 'social', hot: true, established: true, description: 'Custom versions of ChatGPT that can be shared and monetized.' },
  { id: 'chatgpt-plugins', name: 'ChatGPT Plugins', chain: 'Cloud', category: 'infrastructure', established: true, description: 'Third-party plugins that extend ChatGPT capabilities.' },
  { id: 'openai-swarm', name: 'OpenAI Swarm', chain: 'Python', category: 'infrastructure', hot: true, description: 'OpenAI experimental framework for multi-agent orchestration.' },
  
  // ==================== Microsoft/Azure 生态 ====================
  { id: 'autogen', name: 'AutoGen (Microsoft)', chain: 'Python', category: 'infrastructure', hot: true, description: 'Microsoft framework for building multi-agent conversational systems.' },
  { id: 'semantic-kernel', name: 'Semantic Kernel', chain: 'Multi', category: 'infrastructure', description: 'Microsoft SDK for integrating AI into apps with plugins and planners.' },
  { id: 'copilot-studio', name: 'Microsoft Copilot Studio', chain: 'Cloud', category: 'infrastructure', established: true, description: 'Low-code platform for building custom copilots and AI agents.' },
  { id: 'azure-ai-agent', name: 'Azure AI Agent Service', chain: 'Cloud', category: 'infrastructure', description: 'Azure managed service for deploying AI agents at scale.' },
  
  // ==================== Google 生态 ====================
  { id: 'google-aistudio', name: 'Google AI Studio', chain: 'Cloud', category: 'infrastructure', established: true, description: 'Google platform for prototyping with Gemini models.' },
  { id: 'vertex-ai-agents', name: 'Vertex AI Agents', chain: 'Cloud', category: 'infrastructure', description: 'Google Cloud platform for building and deploying AI agents.' },
  { id: 'dialogflow-cx', name: 'Dialogflow CX', chain: 'Cloud', category: 'social', established: true, description: 'Google advanced conversational AI platform for virtual agents.' },
  
  // ==================== Hugging Face 生态 ====================
  { id: 'huggingface-agents', name: 'Hugging Face Agents', chain: 'Python', category: 'infrastructure', hot: true, description: 'Transformers Agents for building AI agents with HF models.' },
  { id: 'huggingface-spaces', name: 'Hugging Face Spaces', chain: 'Cloud', category: 'infrastructure', established: true, description: 'Platform for hosting and sharing ML demos and agents.' },
  { id: 'smolagents', name: 'smolagents (HF)', chain: 'Python', category: 'infrastructure', hot: true, description: 'Hugging Face lightweight library for building agents with code execution.' },
  
  // ==================== 其他热门框架 ====================
  { id: 'dify', name: 'Dify', chain: 'Web', category: 'infrastructure', hot: true, description: 'Open-source LLM app development platform with visual workflow builder.' },
  { id: 'flowise', name: 'Flowise', chain: 'Web', category: 'infrastructure', description: 'Drag & drop UI to build LLM flows using LangChain.' },
  { id: 'n8n-ai', name: 'n8n AI Agents', chain: 'Web', category: 'infrastructure', description: 'Workflow automation with AI agent capabilities.' },
  { id: 'haystack', name: 'Haystack', chain: 'Python', category: 'infrastructure', description: 'NLP framework for building search and QA systems with LLMs.' },
  { id: 'llama-index', name: 'LlamaIndex', chain: 'Python', category: 'infrastructure', hot: true, description: 'Data framework for LLM applications with RAG capabilities.' },
  { id: 'phidata', name: 'Phidata', chain: 'Python', category: 'infrastructure', description: 'Framework for building AI assistants with memory and knowledge.' },
  { id: 'taskweaver', name: 'TaskWeaver (Microsoft)', chain: 'Python', category: 'infrastructure', description: 'Code-first agent framework for data analytics tasks.' },
  
  // ==================== Coding Agents ====================
  { id: 'cursor', name: 'Cursor', chain: 'Desktop', category: 'infrastructure', hot: true, description: 'AI-first code editor with built-in coding agent.' },
  { id: 'github-copilot', name: 'GitHub Copilot', chain: 'Cloud', category: 'infrastructure', hot: true, established: true, description: 'AI pair programmer powered by OpenAI Codex.' },
  { id: 'codeium', name: 'Codeium', chain: 'Cloud', category: 'infrastructure', description: 'Free AI-powered code completion and chat.' },
  { id: 'tabnine', name: 'Tabnine', chain: 'Cloud', category: 'infrastructure', established: true, description: 'AI code assistant trained on your codebase.' },
  { id: 'aider', name: 'Aider', chain: 'CLI', category: 'infrastructure', hot: true, description: 'AI pair programming in your terminal with git integration.' },
  { id: 'continue', name: 'Continue', chain: 'IDE', category: 'infrastructure', description: 'Open-source AI code assistant for VS Code and JetBrains.' },
  { id: 'cline', name: 'Cline (Claude Dev)', chain: 'IDE', category: 'infrastructure', hot: true, description: 'Autonomous coding agent in VS Code using Claude.' },
  { id: 'codex-cli', name: 'Codex CLI', chain: 'CLI', category: 'infrastructure', description: 'OpenAI Codex-powered command line interface.' },
  { id: 'devin', name: 'Devin (Cognition)', chain: 'Cloud', category: 'infrastructure', hot: true, description: 'First AI software engineer. Autonomous coding agent.' },
  
  // ==================== Voice/Multimodal Agents ====================
  { id: 'elevenlabs-agents', name: 'ElevenLabs Conversational AI', chain: 'Cloud', category: 'social', hot: true, description: 'Build voice agents with realistic AI voices.' },
  { id: 'vapi', name: 'Vapi', chain: 'Cloud', category: 'social', hot: true, description: 'Platform for building voice AI agents and phone bots.' },
  { id: 'play-ai', name: 'PlayAI', chain: 'Cloud', category: 'social', description: 'Conversational AI agents with lifelike voices.' },
  { id: 'hume-ai', name: 'Hume AI', chain: 'Cloud', category: 'social', description: 'Emotionally intelligent voice AI agents.' },
  
  // ==================== Research/Autonomous Agents ====================
  { id: 'camel', name: 'CAMEL', chain: 'Python', category: 'infrastructure', description: 'Communicative agents for mind exploration of large-scale models.' },
  { id: 'metagpt', name: 'MetaGPT', chain: 'Python', category: 'infrastructure', hot: true, description: 'Multi-agent framework assigning different GPT roles for software company simulation.' },
  { id: 'chatdev', name: 'ChatDev', chain: 'Python', category: 'infrastructure', description: 'Communicative agents simulating software development company.' },
  { id: 'gpt-researcher', name: 'GPT Researcher', chain: 'Python', category: 'infrastructure', hot: true, description: 'Autonomous agent for comprehensive online research.' },
  { id: 'storm', name: 'STORM (Stanford)', chain: 'Python', category: 'infrastructure', description: 'Writing agent that generates Wikipedia-like articles.' },
];

// Category映射补充 (for web2 agents)
const WEB2_CATEGORIES = {
  'MCP': 'infrastructure',
  'Python': 'infrastructure', 
  'Web': 'infrastructure',
  'Cloud': 'infrastructure',
  'Desktop': 'infrastructure',
  'CLI': 'infrastructure',
  'IDE': 'infrastructure',
  'Multi': 'infrastructure'
};

// ============ 抓取函数 ============

async function fetchDeFiLlamaAgents() {
  console.log('📡 Fetching from DeFiLlama...');
  try {
    const res = await fetch('https://api.llama.fi/protocols');
    const protocols = await res.json();
    
    // 筛选AI相关协议
    const aiProtocols = protocols.filter(p => {
      const text = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
      return AI_KEYWORDS.some(kw => text.includes(kw));
    });
    
    console.log(`  Found ${aiProtocols.length} AI-related protocols`);
    
    return aiProtocols.map(p => ({
      id: p.slug,
      name: p.name,
      chain: p.chain,
      category: mapCategory(p.category),
      description: p.description,
      website: p.url,
      twitter: p.twitter ? `@${p.twitter}` : null,
      tvl: p.tvl ? formatTVL(p.tvl) : null,
      logo: p.logo,
      source: 'defillama'
    }));
  } catch (e) {
    console.error('  DeFiLlama fetch failed:', e.message);
    return [];
  }
}

async function fetchCoinGeckoAI() {
  console.log('📡 Fetching from CoinGecko...');
  try {
    // CoinGecko AI category
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=artificial-intelligence&order=market_cap_desc&per_page=50&page=1');
    const coins = await res.json();
    
    if (!Array.isArray(coins)) {
      console.log('  CoinGecko rate limited, skipping...');
      return [];
    }
    
    console.log(`  Found ${coins.length} AI coins`);
    
    return coins.map(c => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol?.toUpperCase(),
      category: 'infrastructure',
      marketCap: c.market_cap ? formatTVL(c.market_cap) : null,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      logo: c.image,
      source: 'coingecko'
    }));
  } catch (e) {
    console.error('  CoinGecko fetch failed:', e.message);
    return [];
  }
}

// ============ 辅助函数 ============

function stripProtocol(url) {
  if (!url) return '';
  return url.replace('https://', '').replace('http://', '');
}

function mapCategory(llamaCategory) {
  const map = {
    'AI': 'infrastructure',
    'Derivatives': 'trading',
    'Dexes': 'trading',
    'Lending': 'trading',
    'Yield': 'trading',
    'Gaming': 'gaming',
    'NFT': 'social',
    'Social': 'social',
    'Compute': 'infrastructure',
    'Storage': 'data'
  };
  return map[llamaCategory] || 'infrastructure';
}

function formatTVL(tvl) {
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(0)}M`;
  if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(0)}K`;
  return `$${tvl.toFixed(0)}`;
}

function generateComplianceScore(agent) {
  // 基础分数
  let score = 50;
  
  // 有官网加分
  if (agent.website) score += 5;
  
  // 有Twitter加分
  if (agent.twitter) score += 3;
  
  // Established项目加分
  if (agent.established) score += 15;
  
  // 热门项目（可能风险更高）
  if (agent.hot) score -= 10;
  
  // 按类别调整
  if (agent.category === 'infrastructure') score += 10;
  if (agent.category === 'data') score += 8;
  if (agent.category === 'trading') score -= 5;
  
  // 按链调整
  if (agent.chain === 'Ethereum') score += 5;
  if (agent.chain === 'Solana') score -= 3;
  
  // 限制范围
  return Math.max(20, Math.min(85, score));
}

function getRiskLevel(score) {
  if (score >= 70) return 'low';
  if (score >= 40) return 'medium';
  return 'high';
}

// ============ 详情页生成 ============

function generateAgentPage(agent) {
  const riskColors = {
    low: '#22c55e',
    medium: '#f59e0b', 
    high: '#ef4444'
  };
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PX174NJW6M"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-PX174NJW6M');
  </script>
  
  <title>${agent.name} Compliance Score - AI Agent Analysis | APAC FINSTAB</title>
  <meta name="description" content="${agent.name} compliance score and regulatory risk analysis. Chain: ${agent.chain}. Category: ${agent.category}. Get detailed compliance assessment.">
  <meta name="keywords" content="${agent.name}, ${agent.name} compliance, ${agent.name} regulation, AI agent compliance, ${agent.chain} agent">
  
  <link rel="canonical" href="https://apacfinstab.com/agents/${agent.id}/">
  
  <meta property="og:type" content="article">
  <meta property="og:title" content="${agent.name} Compliance Score | APAC FINSTAB">
  <meta property="og:description" content="Compliance score: ${agent.complianceScore}% (${agent.riskLevel} risk). Detailed regulatory analysis for ${agent.name}.">
  <meta property="og:url" content="https://apacfinstab.com/agents/${agent.id}/">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      line-height: 1.6;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    header {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
    }
    .logo span { color: #00d4ff; }
    nav a {
      color: #888;
      text-decoration: none;
      margin-left: 24px;
      font-size: 14px;
    }
    nav a:hover { color: #fff; }
    .breadcrumb {
      padding: 16px 0;
      font-size: 13px;
      color: #666;
    }
    .breadcrumb a { color: #888; text-decoration: none; }
    .breadcrumb a:hover { color: #00d4ff; }
    
    .agent-header {
      padding: 40px 0;
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }
    .agent-logo {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .agent-logo img {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      object-fit: cover;
    }
    .agent-info h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .agent-meta {
      display: flex;
      gap: 16px;
      color: #888;
      font-size: 14px;
    }
    .agent-meta span {
      background: rgba(255,255,255,0.05);
      padding: 4px 12px;
      border-radius: 4px;
    }
    
    .score-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
    }
    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .score-value {
      font-size: 64px;
      font-weight: 700;
      color: ${riskColors[agent.riskLevel]};
    }
    .score-label {
      font-size: 14px;
      color: #888;
    }
    .risk-badge {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      background: ${riskColors[agent.riskLevel]}20;
      color: ${riskColors[agent.riskLevel]};
      text-transform: uppercase;
    }
    
    .score-breakdown {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .breakdown-item {
      text-align: center;
    }
    .breakdown-value {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .breakdown-label {
      font-size: 12px;
      color: #666;
    }
    
    .section {
      margin-bottom: 32px;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #fff;
    }
    .section p {
      color: #aaa;
      margin-bottom: 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .info-item {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      color: #fff;
    }
    .info-value a {
      color: #00d4ff;
      text-decoration: none;
    }
    
    .cta-box {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(123, 47, 247, 0.1));
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin: 40px 0;
    }
    .cta-box h3 { font-size: 24px; margin-bottom: 12px; }
    .cta-box p { color: #888; margin-bottom: 20px; }
    .cta-btn {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(90deg, #00d4ff, #7b2ff7);
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
    
    .related {
      padding: 40px 0;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .related h3 {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .related-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
      text-decoration: none;
      color: inherit;
    }
    .related-card:hover {
      border-color: rgba(0, 212, 255, 0.3);
    }
    .related-name { font-weight: 600; margin-bottom: 4px; }
    .related-score { font-size: 14px; color: #888; }
    
    footer {
      padding: 40px 0;
      border-top: 1px solid rgba(255,255,255,0.05);
      text-align: center;
      font-size: 13px;
      color: #444;
    }
    footer a { color: #666; text-decoration: none; }
    
    @media (max-width: 768px) {
      .agent-header { flex-direction: column; }
      .score-breakdown { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
      .related-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-inner">
      <a href="/" class="logo">APAC <span>FINSTAB</span></a>
      <nav>
        <a href="/">Home</a>
        <a href="/agents/">Agents</a>
        <a href="/learn/">Learn</a>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <div class="breadcrumb">
      <a href="/">Home</a> → <a href="/agents/">Agents</a> → ${agent.name}
    </div>
    
    <div class="agent-header">
      <div class="agent-logo">
        ${agent.logo ? `<img src="${agent.logo}" alt="${agent.name}">` : '🤖'}
      </div>
      <div class="agent-info">
        <h1>${agent.name}</h1>
        <div class="agent-meta">
          <span>⛓️ ${agent.chain}</span>
          <span>📁 ${agent.category}</span>
          ${agent.tvl ? `<span>💰 ${agent.tvl} TVL</span>` : ''}
        </div>
      </div>
    </div>
    
    <div class="score-card">
      <div class="score-header">
        <div>
          <div class="score-value">${agent.complianceScore}%</div>
          <div class="score-label">Compliance Score</div>
        </div>
        <div class="risk-badge">${agent.riskLevel} Risk</div>
      </div>
      <div class="score-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-value">${agent.category === 'infrastructure' ? '72' : agent.category === 'trading' ? '45' : '58'}%</div>
          <div class="breakdown-label">Regulatory Clarity</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-value">${agent.established ? '85' : '52'}%</div>
          <div class="breakdown-label">Track Record</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-value">${agent.chain === 'Ethereum' ? '78' : '62'}%</div>
          <div class="breakdown-label">Chain Compliance</div>
        </div>
      </div>
    </div>
    
    <section class="section">
      <h2>Overview</h2>
      <p>${agent.description || `${agent.name} is a ${agent.category} agent operating on ${agent.chain}. Our compliance analysis evaluates regulatory risk across multiple jurisdictions in the APAC region.`}</p>
    </section>
    
    <section class="section">
      <h2>Agent Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Blockchain</div>
          <div class="info-value">${agent.chain}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Category</div>
          <div class="info-value">${agent.category.charAt(0).toUpperCase() + agent.category.slice(1)}</div>
        </div>
        ${agent.website ? `
        <div class="info-item">
          <div class="info-label">Website</div>
          <div class="info-value"><a href="${agent.website}" target="_blank" rel="noopener">${stripProtocol(agent.website)}</a></div>
        </div>
        ` : ''}
        ${agent.twitter ? `
        <div class="info-item">
          <div class="info-label">Twitter</div>
          <div class="info-value"><a href="https://twitter.com/${agent.twitter.replace('@', '')}" target="_blank" rel="noopener">${agent.twitter}</a></div>
        </div>
        ` : ''}
        ${agent.tvl ? `
        <div class="info-item">
          <div class="info-label">Total Value Locked</div>
          <div class="info-value">${agent.tvl}</div>
        </div>
        ` : ''}
      </div>
    </section>
    
    <section class="section">
      <h2>Regulatory Considerations</h2>
      <p>Based on our analysis, ${agent.name} operates in the ${agent.category} sector with ${agent.riskLevel} regulatory risk. Key considerations for APAC jurisdictions:</p>
      <ul style="color: #aaa; margin-left: 20px; margin-top: 16px;">
        <li style="margin-bottom: 8px;"><strong>Hong Kong:</strong> ${agent.category === 'trading' ? 'May require SFC Type 1/7 license for VA dealing' : 'Generally lower regulatory burden for infrastructure services'}</li>
        <li style="margin-bottom: 8px;"><strong>Singapore:</strong> ${agent.category === 'trading' ? 'Likely requires MAS Digital Payment Token license' : 'May fall under PSA exemptions'}</li>
        <li style="margin-bottom: 8px;"><strong>Japan:</strong> ${agent.category === 'trading' ? 'JFSA registration required for crypto asset exchange' : 'Depends on specific functionality'}</li>
      </ul>
    </section>
    
    <div class="cta-box">
      <h3>📋 Need a Full Compliance Report?</h3>
      <p>Get detailed regulatory analysis across 14 APAC jurisdictions for ${agent.name}.</p>
      <a href="/agent-score/?agent=${encodeURIComponent(agent.name)}" class="cta-btn">Request Full Report →</a>
    </div>
  </main>
  
  <footer>
    <div class="container">
      <a href="/">APAC FINSTAB</a> · Making Compliance a Competitive Advantage<br>
      <small style="margin-top: 8px; display: block;">Last updated: ${new Date().toISOString().split('T')[0]}</small>
    </div>
  </footer>
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${agent.name} Compliance Score - AI Agent Analysis",
    "description": "${agent.name} compliance score: ${agent.complianceScore}% (${agent.riskLevel} risk). Regulatory analysis for APAC jurisdictions.",
    "author": {
      "@type": "Organization",
      "name": "APAC FINSTAB"
    },
    "publisher": {
      "@type": "Organization",
      "name": "APAC FINSTAB",
      "url": "https://apacfinstab.com"
    },
    "datePublished": "${new Date().toISOString()}",
    "dateModified": "${new Date().toISOString()}"
  }
  </script>
</body>
</html>`;
}

// ============ 主函数 ============

async function main() {
  console.log('🚀 APAC FINSTAB Agent Collector\n');
  console.log('================================\n');
  
  // 1. 收集所有数据源
  const [llamaAgents, geckoAgents] = await Promise.all([
    fetchDeFiLlamaAgents(),
    fetchCoinGeckoAI()
  ]);
  
  // 2. 合并手动维护列表
  const allAgents = new Map();
  
  // 优先手动维护的agent
  for (const agent of CURATED_AGENTS) {
    const score = generateComplianceScore(agent);
    allAgents.set(agent.id, {
      ...agent,
      complianceScore: score,
      riskLevel: getRiskLevel(score),
      tags: [
        agent.hot ? 'hot' : null,
        agent.established ? 'established' : null,
        agent.category,
        agent.chain.toLowerCase()
      ].filter(Boolean)
    });
  }
  
  // 添加DeFiLlama数据
  for (const agent of llamaAgents) {
    if (!allAgents.has(agent.id)) {
      const score = generateComplianceScore(agent);
      allAgents.set(agent.id, {
        ...agent,
        complianceScore: score,
        riskLevel: getRiskLevel(score),
        tags: [agent.category, agent.chain?.toLowerCase()].filter(Boolean)
      });
    }
  }
  
  console.log(`\n📊 Total agents collected: ${allAgents.size}\n`);
  
  // 3. 保存到JSON
  const agentsArray = Array.from(allAgents.values());
  const data = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalAgents: agentsArray.length,
    agents: agentsArray,
    categories: [
      { id: 'trading', name: 'Trading Agents', icon: '📈' },
      { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️' },
      { id: 'data', name: 'Data & Privacy', icon: '🔐' },
      { id: 'gaming', name: 'Gaming', icon: '🎮' },
      { id: 'social', name: 'Social', icon: '💬' }
    ]
  };
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Saved to ${DATA_FILE}\n`);
  
  // 4. 生成详情页
  console.log('📝 Generating agent pages...\n');
  
  let generated = 0;
  for (const agent of agentsArray) {
    const agentDir = path.join(AGENTS_DIR, agent.id);
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    
    const html = generateAgentPage(agent);
    fs.writeFileSync(path.join(agentDir, 'index.html'), html);
    generated++;
  }
  
  console.log(`✅ Generated ${generated} agent pages\n`);
  
  // 5. 更新sitemap entries
  console.log('🗺️ Sitemap entries to add:');
  for (const agent of agentsArray) {
    console.log(`  <url><loc>https://apacfinstab.com/agents/${agent.id}/</loc></url>`);
  }
  
  console.log('\n🎉 Done!\n');
}

main().catch(console.error);
