# 🌏 APAC FINSTAB

**Asia-Pacific Cryptocurrency Regulatory Intelligence for AI Agents**

[![Website](https://img.shields.io/badge/Website-apacfinstab.com-blue)](https://apacfinstab.com)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

APAC FINSTAB is a Model Context Protocol (MCP) server providing real-time regulatory intelligence across 12+ Asia-Pacific cryptocurrency markets. Designed for AI agents helping with Web3 compliance decisions.

## 🎯 Features

- **Policy Tracking** - Latest regulatory updates from Hong Kong, Singapore, Japan, Korea, and more
- **Compliance Checking** - Requirements for exchanges, stablecoin issuers, DeFi protocols, custodians
- **Cross-Region Comparison** - Side-by-side policy analysis across jurisdictions
- **Risk Assessment** - Impact ratings and timeline tracking for regulatory changes

## 🔧 MCP Tools

| Tool | Description |
|------|-------------|
| `getLatestPolicies` | Get latest crypto policy events by region/topic |
| `getRegionOverview` | Regulatory overview for a specific APAC region |
| `comparePolicies` | Compare policies across multiple regions |
| `checkCompliance` | Check compliance requirements for business models |

## 🌐 Regions Covered

| Region | Regulator | Status |
|--------|-----------|--------|
| 🇭🇰 Hong Kong | SFC, HKMA | Active Framework |
| 🇸🇬 Singapore | MAS | Comprehensive |
| 🇯🇵 Japan | FSA, JFSA | Mature |
| 🇰🇷 South Korea | FSC, FIU | DABA Transition |
| 🇦🇺 Australia | ASIC, Treasury | Reform Underway |
| 🇨🇳 China | PBOC, CAC | Restricted |
| 🇮🇳 India | RBI, FIU-IND | Tax Framework |
| 🇹🇭 Thailand | SEC, BOT | Licensed |
| 🇮🇩 Indonesia | OJK, Bappebti | Transitioning |
| 🇻🇳 Vietnam | SBV | No Framework |
| 🇵🇭 Philippines | BSP, SEC | Licensed |
| 🇲🇾 Malaysia | SC | Licensed |
| 🇹🇼 Taiwan | FSC | VASP Act |

## 📊 Topics Tracked

- **Stablecoin** - Issuance, reserves, redemption rules
- **Exchange** - Licensing, custody, trading requirements  
- **DeFi** - Protocol governance, AMM regulations
- **ETF** - Spot/futures ETF approvals
- **Licensing** - Application processes, capital requirements
- **Taxation** - Capital gains, income classification
- **CBDC** - Digital currency pilots and rollouts
- **Tokenization** - RWA, security token frameworks

## 🚀 Quick Start

### WebMCP Integration

Add to your MCP-compatible AI agent:

```json
{
  "mcp_servers": [
    {
      "name": "apac-finstab",
      "url": "https://apacfinstab.com/webmcp.json"
    }
  ]
}
```

### Direct API

```bash
# Get latest Hong Kong policies
curl -X POST https://apacfinstab-mcp.kyleleo2018.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"method": "getLatestPolicies", "params": {"region": "HK", "days": 30}}'
```

## 📖 Documentation

- [WebMCP Manifest](https://apacfinstab.com/webmcp.json)
- [API Design Docs](docs/api/)
- [Confidence Rules](docs/rules/)

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│           AI Agent / LLM                 │
└──────────────────┬───────────────────────┘
                   │ MCP Protocol
┌──────────────────▼───────────────────────┐
│      APAC FINSTAB MCP Server             │
│      (Cloudflare Workers)                │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│      Policy Event Database               │
│      + Regulatory Knowledge Graph        │
└──────────────────────────────────────────┘
```

## 🔗 Links

- **Website:** https://apacfinstab.com
- **MCP Server:** https://apacfinstab-mcp.kyleleo2018.workers.dev
- **Twitter:** [@APACFinStab](https://twitter.com/APACFinStab)

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">
  <b>Built for the AI-native compliance stack</b>
  <br>
  🌏 Tracking APAC crypto regulation so AI agents don't have to
</div>
