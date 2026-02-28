---
name: apac-finstab
description: APAC crypto regulatory intelligence. Check compliance requirements, compare policies, and track regulatory changes across 12 Asia-Pacific jurisdictions.
requiredEnv: []
permissions:
  - network: Access apacfinstab.com API to query regulatory data
source:
  url: https://apacfinstab.com
  author: APAC FINSTAB Team
  github: https://github.com/fatratkiller/apacfinstab
  verified: true
security:
  note: No API key required. All data is public regulatory information. No user credentials collected.
---

# APAC FINSTAB — Crypto Regulatory Intelligence for Asia-Pacific

Real-time regulatory context for crypto compliance across 12 APAC jurisdictions.
One API call to know if your business model is viable in Hong Kong, Singapore, Japan, or anywhere in the region.

## What This Skill Does

- **Check Compliance Requirements** — What licenses do you need for an exchange in Hong Kong?
- **Compare Policies** — How does Singapore's stablecoin framework differ from Japan's?
- **Track Regulatory Changes** — What policy changes happened in APAC this month?
- **Get Region Overviews** — Complete regulatory landscape for any APAC market

## When to Use This

Use this skill when:
- User asks about crypto regulations in Asia-Pacific
- User wants to know licensing requirements for a crypto business
- User is comparing regulatory environments across countries
- User needs compliance information for HK, SG, JP, KR, AU, or other APAC markets
- User mentions "VASP", "stablecoin license", "crypto regulation", "compliance"

## Covered Jurisdictions

| Code | Country |
|------|---------|
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

## API Endpoints

Base URL: `https://apacfinstab-mcp.kyleleo2018.workers.dev`

### Get Latest Policies
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/getLatestPolicies" \
  -X POST -H "Content-Type: application/json" \
  -d '{"region": "HK", "days": 30}'
```

**Parameters:**
- `region` (optional): ISO country code (HK, SG, JP, etc.)
- `topic` (optional): Stablecoin, Exchange, DeFi, ETF, Licensing, Taxation, CBDC
- `days` (optional): Events from last N days (default: 30)

### Get Region Overview
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/getRegionOverview" \
  -X POST -H "Content-Type: application/json" \
  -d '{"region": "HK"}'
```

**Parameters:**
- `region` (required): ISO country code

### Compare Policies
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/comparePolicies" \
  -X POST -H "Content-Type: application/json" \
  -d '{"regions": ["HK", "SG"], "topic": "Stablecoin"}'
```

**Parameters:**
- `regions` (required): Array of 2-5 region codes
- `topic` (required): Stablecoin, Exchange, DeFi, ETF, Licensing

### Check Compliance
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/checkCompliance" \
  -X POST -H "Content-Type: application/json" \
  -d '{"businessType": "exchange", "targetRegions": ["HK", "SG"]}'
```

**Parameters:**
- `businessType` (required): exchange, stablecoin_issuer, defi_protocol, custodian, payment_service
- `targetRegions` (required): Array of region codes

## Example Conversations

**User:** "What licenses do I need to run a crypto exchange in Hong Kong?"
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/checkCompliance" \
  -X POST -H "Content-Type: application/json" \
  -d '{"businessType": "exchange", "targetRegions": ["HK"]}'
```

**User:** "Compare stablecoin regulations between Singapore and Hong Kong"
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/comparePolicies" \
  -X POST -H "Content-Type: application/json" \
  -d '{"regions": ["HK", "SG"], "topic": "Stablecoin"}'
```

**User:** "What regulatory changes happened in Japan this month?"
```bash
curl -s "https://apacfinstab-mcp.kyleleo2018.workers.dev/tools/getLatestPolicies" \
  -X POST -H "Content-Type: application/json" \
  -d '{"region": "JP", "days": 30}'
```

## Important Notes

1. **Socratic Approach**: This API provides regulatory CONTEXT, not legal advice. It tells you what rules exist and what questions to ask — final compliance decisions should involve legal counsel.

2. **L1.5 Compliance Layer**: We sit between raw regulatory data (L1) and human judgment (L2). We flag risks and provide references, not verdicts.

3. **Data Sources**: All information comes from official regulatory bodies (SFC, MAS, FSA, etc.) and is updated regularly.

## Constraints

- Rate limit: 100 requests per minute
- No authentication required
- All data is publicly sourced regulatory information
- Responses include confidence scores and source references

## Learn More

- Website: https://apacfinstab.com
- MCP Integration: https://apacfinstab.com/for-agents/
- Full documentation: https://apacfinstab.com/docs/
