# APAC FINSTAB MCP Server

MCP (Model Context Protocol) server for APAC crypto regulatory intelligence.

## 🚀 Quick Start

### Install

```bash
npm install @apacfinstab/mcp-server
```

### Run

```bash
npx @apacfinstab/mcp-server
```

### Configure with Claude Desktop

Add to `claude_desktop_config.json`:

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

## 🛠️ Available Tools

### `getLatestPolicies`
Get latest crypto policy events from APAC regions.

**Parameters:**
- `region` (optional): HK, SG, JP, KR, AU, CN, IN, TH, ID, VN, PH, MY, TW
- `topic` (optional): Stablecoin, Exchange, DeFi, ETF, Licensing, Taxation, CBDC, Tokenization
- `days` (optional): Events from last N days (default: 30)

**Example:**
```
Get Hong Kong stablecoin policies from the last 7 days
```

### `getRegionOverview`
Get comprehensive regulatory overview for a specific region.

**Parameters:**
- `region` (required): Region code

**Example:**
```
Get regulatory overview for Singapore
```

### `comparePolicies`
Compare policies across multiple regions.

**Parameters:**
- `regions` (required): Array of 2-5 region codes
- `topic` (required): Topic to compare

**Example:**
```
Compare exchange licensing between Hong Kong, Singapore, and Japan
```

### `checkCompliance`
Check compliance requirements for a business model.

**Parameters:**
- `businessType` (required): exchange, stablecoin_issuer, defi_protocol, custodian, payment_service
- `targetRegions` (required): Array of target regions

**Example:**
```
Check compliance requirements for running an exchange in Hong Kong and Singapore
```

## 🌏 Supported Regions

| Code | Region |
|------|--------|
| HK | Hong Kong |
| SG | Singapore |
| JP | Japan |
| KR | South Korea |
| AU | Australia |
| CN | China (Mainland) |
| IN | India |
| TH | Thailand |
| ID | Indonesia |
| VN | Vietnam |
| PH | Philippines |
| MY | Malaysia |
| TW | Taiwan |

## 🔗 Data Source

All data is fetched from [apacfinstab.com](https://apacfinstab.com):
- Policy events updated daily
- Region overviews updated on major regulatory changes

## 📜 License

MIT

---

Built by [APAC FINSTAB](https://apacfinstab.com) 🌏
