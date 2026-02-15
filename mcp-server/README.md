# 🌏 APAC FINSTAB MCP Server

> **Crypto regulatory intelligence for AI agents** — Real-time policy tracking across 13 Asia-Pacific jurisdictions.

[![npm version](https://img.shields.io/npm/v/@apacfinstab/mcp-server.svg)](https://www.npmjs.com/package/@apacfinstab/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why This Exists

Crypto compliance in APAC is a maze. 13+ jurisdictions, each with different rules, licenses, and timelines. This MCP server gives AI agents direct access to:

- **Policy events** — What just changed? What's coming?
- **Region overviews** — Licensing, stablecoin rules, DeFi status
- **Cross-region comparison** — How does HK compare to SG?
- **Compliance checks** — Can I run an exchange in Japan?

## 🚀 Quick Start

### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apacfinstab": {
      "command": "npx",
      "args": ["@apacfinstab/mcp-server"]
    }
  }
}
```

Restart Claude Desktop. Done.

### For Other MCP Clients

```bash
# Install globally
npm install -g @apacfinstab/mcp-server

# Or run directly
npx @apacfinstab/mcp-server
```

## 🛠️ Available Tools

### `getLatestPolicies`

Get latest crypto policy events from APAC regions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | ISO code: HK, SG, JP, KR, AU, CN, IN, TH, ID, VN, PH, MY, TW |
| `topic` | string | No | Stablecoin, Exchange, DeFi, ETF, Licensing, Taxation, CBDC, Tokenization |
| `days` | number | No | Events from last N days (default: 30) |

**Example prompts:**
- "What crypto policies changed in Hong Kong this week?"
- "Show me stablecoin regulations across APAC in the last 30 days"

---

### `getRegionOverview`

Get comprehensive regulatory overview for a specific region.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | ISO region code |

**Example prompts:**
- "Give me a regulatory overview of Singapore"
- "What's the licensing situation in Japan?"

---

### `comparePolicies`

Compare policies across multiple regions for a specific topic.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `regions` | array | Yes | 2-5 region codes to compare |
| `topic` | string | Yes | Stablecoin, Exchange, DeFi, ETF, Licensing |

**Example prompts:**
- "Compare stablecoin regulations between Hong Kong, Singapore, and Japan"
- "Which country has easier exchange licensing - Korea or Australia?"

---

### `checkCompliance`

Check compliance requirements for a business model in specific regions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `businessType` | string | Yes | exchange, stablecoin_issuer, defi_protocol, custodian, payment_service |
| `targetRegions` | array | Yes | Target regions for compliance check |

**Example prompts:**
- "What do I need to run an exchange in Hong Kong and Singapore?"
- "Compliance requirements for a stablecoin issuer in Japan"

---

## 🌏 Supported Regions

| Code | Region | Primary Regulator |
|------|--------|-------------------|
| HK | Hong Kong | SFC |
| SG | Singapore | MAS |
| JP | Japan | FSA/JFSA |
| KR | South Korea | FSC |
| AU | Australia | ASIC |
| CN | China (Mainland) | PBOC/CSRC |
| IN | India | RBI/SEBI |
| TH | Thailand | SEC Thailand |
| ID | Indonesia | OJK/Bappebti |
| VN | Vietnam | SBV |
| PH | Philippines | BSP |
| MY | Malaysia | SC Malaysia |
| TW | Taiwan | FSC Taiwan |

## 📊 Data Source

All data is fetched in real-time from [apacfinstab.com](https://apacfinstab.com):

- **Policy events**: Updated daily from official sources, news, and regulatory announcements
- **Region overviews**: Updated on major regulatory changes
- **Coverage**: 13 APAC jurisdictions + select global events

## 🔌 Integration Examples

### With Claude

```
You: What are the latest crypto regulations in Hong Kong?

Claude: [Calls getLatestPolicies with region: "HK"]
Here are the recent policy developments in Hong Kong...
```

### With Custom Agents

```javascript
// Your agent can call these tools directly
const result = await mcpClient.callTool('getRegionOverview', { region: 'SG' });
```

## 🤝 Contributing

Found outdated data? Policy we missed? 

- Open an issue at [github.com/fatratkiller/apacfinstab](https://github.com/fatratkiller/apacfinstab)
- Or email: contact@apacfinstab.com

## 📜 License

MIT — Use freely, attribute kindly.

---

**Built by [APAC FINSTAB](https://apacfinstab.com)** — Regulatory intelligence for institutions and their agents. 🌏
