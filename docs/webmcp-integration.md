# APAC FINSTAB WebMCP Integration Guide

> **For AI Agent Developers**: How to integrate APAC regulatory intelligence into your agent.

## Quick Start

```javascript
// 1. Fetch the manifest
const manifest = await fetch('https://apacfinstab.com/webmcp.json').then(r => r.json());

// 2. Get available tools
console.log(manifest.tools.map(t => t.name));
// → ['getLatestPolicies', 'getRegionOverview', 'comparePolicies', 'checkCompliance']

// 3. Fetch policy events data
const data = await fetch('https://apacfinstab.com/data/policy-events.json').then(r => r.json());

// 4. Filter by your agent's needs
const hkPolicies = data.events.filter(e => 
  e.regions.includes('HK') && 
  e.topics.includes('Stablecoin')
);
```

## Available Tools

### 1. `getLatestPolicies`
Get latest crypto policy events from APAC regions.

**Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `region` | string | HK, SG, JP, KR, AU, CN, IN, TH, ID, VN, PH, MY, TW |
| `topic` | string | Stablecoin, Exchange, DeFi, ETF, Licensing, Taxation, CBDC, Tokenization |
| `days` | integer | Events from last N days (default: 30) |

**Example Implementation:**
```javascript
function getLatestPolicies({ region, topic, days = 30 }) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return events.filter(e => {
    const eventDate = new Date(e.date).getTime();
    const matchRegion = !region || e.regions.includes(region);
    const matchTopic = !topic || e.topics.includes(topic);
    return eventDate >= cutoff && matchRegion && matchTopic;
  });
}
```

### 2. `getRegionOverview`
Get regulatory overview for a specific APAC region.

**Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `region` | string (required) | HK, SG, JP, KR, AU, CN, IN, TH, ID |

**Data Source:** `/data/region-overviews.json`

### 3. `comparePolicies`
Compare crypto policies across multiple APAC regions.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `regions` | array | 2-5 region codes |
| `topic` | string | Stablecoin, Exchange, DeFi, ETF, Licensing |

### 4. `checkCompliance`
Check compliance requirements for a business model.

**Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `businessType` | string | exchange, stablecoin_issuer, defi_protocol, custodian, payment_service |
| `targetRegions` | array | Region codes |

---

## Data Schema

### Policy Event
```typescript
interface PolicyEvent {
  id: string;           // e.g., "evt-2026-0214-001"
  date: string;         // ISO date
  title: string;
  protocols: string[];  // BTC, ETH, USDT, etc.
  regions: string[];    // ISO codes
  topics: string[];     
  entities: string[];   // Companies involved
  summary: string;
  impact: "high" | "medium" | "low";
  source: string;       // Original source URL
}
```

### Dimensions Available
- **Regions:** HK, SG, JP, KR, CN, AU, IN, TH, ID, VN, PH, MY, TW, US, BR, RU, UK, PK
- **Topics:** Staking, ETF, DeFi, Regulation, Custody, Stablecoin, CBDC, Exchange, Taxation, Licensing, Conference, Tokenization
- **Protocols:** ETH, BTC, SOL, TON, BNB, USDT, USDC, XRP
- **Entities:** Binance, OKX, Coinbase, HashKey, OSL, Bybit, Huobi, and more

---

## Why APAC FINSTAB?

| Advantage | Description |
|-----------|-------------|
| **Exclusive Data** | Chinese, Japanese, Korean policy sources — what Western agents can't read |
| **Structured** | Machine-readable JSON, not scraped HTML |
| **Real-time** | Daily updates on policy changes |
| **Vertical Depth** | Focused on APAC crypto regulation, not generic news |

---

## Use Cases

1. **Compliance Agent** — Check if a DeFi protocol can operate in Singapore
2. **Research Agent** — Summarize latest stablecoin regulations across APAC
3. **Trading Agent** — Monitor regulatory events that may impact markets
4. **Legal Agent** — Compare licensing requirements across jurisdictions

---

## Chrome WebMCP Preview

This site is ready for the upcoming Chrome WebMCP standard:

```html
<link rel="webmcp-manifest" href="/webmcp.json" />
```

When Chrome's agent features go live, compatible agents will be able to directly invoke our tools through the browser.

**Join the preview:** [developer.chrome.com/docs/ai/join-early-preview](https://developer.chrome.com/docs/ai/join-early-preview)

---

## Contact

- Twitter: [@APACFinStab](https://x.com/APACFinStab)
- Website: [apacfinstab.com](https://apacfinstab.com)

*Built for the Agent era. 🤖*
