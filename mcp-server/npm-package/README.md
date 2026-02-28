# @apacfinstab/mcp-server

APAC FINSTAB MCP Server - Real-time regulatory intelligence for crypto businesses in Asia-Pacific.

## Installation

```bash
npm install -g @apacfinstab/mcp-server
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apacfinstab": {
      "command": "npx",
      "args": ["-y", "@apacfinstab/mcp-server"]
    }
  }
}
```

## Available Tools

### getLatestPolicies

Get latest crypto policy events from APAC regions.

**Parameters:**
- `region` (optional): ISO country code (HK, SG, JP, KR, AU, CN, IN, TH, ID, VN, PH, MY, TW)
- `topic` (optional): Policy topic (Stablecoin, Exchange, DeFi, ETF, Licensing, Taxation, CBDC, Tokenization)
- `days` (optional): Events from last N days (default: 30)

### getRegionOverview

Get comprehensive regulatory overview for a specific APAC region.

**Parameters:**
- `region` (required): ISO country code (HK, SG, JP, KR, AU)

### comparePolicies

Compare crypto policies across multiple APAC regions.

**Parameters:**
- `regions` (required): Array of region codes to compare (2-5 regions)
- `topic` (optional): Policy topic to compare

## Supported Regions

| Code | Region |
|------|--------|
| HK | Hong Kong |
| SG | Singapore |
| JP | Japan |
| KR | South Korea |
| AU | Australia |
| CN | China |
| IN | India |
| TH | Thailand |
| ID | Indonesia |
| VN | Vietnam |
| PH | Philippines |
| MY | Malaysia |
| TW | Taiwan |

## Data Source

All data is sourced from [APAC FINSTAB](https://apacfinstab.com) - the leading regulatory intelligence platform for Asia-Pacific crypto markets.

## License

MIT
