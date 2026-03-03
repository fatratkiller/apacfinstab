# @apacfinstab/x402-compliant

x402 payment client with built-in regulatory compliance checks.

**Every payment automatically goes through compliance verification before execution.**

## Installation

```bash
npm install @apacfinstab/x402-compliant
```

## Quick Start

### Wrap an existing x402 client

```typescript
import { wrapX402Client } from '@apacfinstab/x402-compliant';
import { createX402Client } from 'x402'; // Your x402 client

const client = createX402Client({ ... });

// Wrap with compliance checks
const compliantClient = wrapX402Client(client, {
  fromJurisdiction: 'HK',  // Sender's jurisdiction
  blockOnHighRisk: true,   // Block high-risk payments
  verbose: true            // Enable logging
});

// Now all payments are compliance-checked!
try {
  await compliantClient.pay({
    toAddress: '0x...',
    amount: 1000,
    token: 'USDC'
  });
} catch (err) {
  if (err.name === 'ComplianceBlockedError') {
    console.log('Payment blocked:', err.preflightResult.flags);
  }
}
```

### Standalone compliance check

```typescript
import { checkCompliance, wouldPass } from '@apacfinstab/x402-compliant';

// Full check
const result = await checkCompliance({
  toAddress: '0x...',
  amount: 10000,
  token: 'USDC',
  fromJurisdiction: 'HK',
  toJurisdiction: 'SG'
});

console.log(result.status);      // 'CLEAR' | 'REVIEW_REQUIRED' | 'HIGH_RISK' | 'BLOCKED'
console.log(result.flags);       // [{ code: 'CROSS_BORDER', message: '...' }]
console.log(result.riskLevel);   // 'low' | 'medium' | 'high' | 'critical'

// Quick check
if (await wouldPass({ toAddress: '0x...', amount: 100, token: 'USDC' })) {
  console.log('Payment would pass compliance');
}
```

### Token launch compliance

```typescript
import { checkTokenLaunch } from '@apacfinstab/x402-compliant';

const result = await checkTokenLaunch({
  tokenName: 'MyToken',
  tokenSymbol: 'MTK',
  totalSupply: 1000000000,
  distribution: { team: 20, presale: 30, public: 50 },
  creatorJurisdiction: 'HK',
  hasRevenue: true
});

console.log(result.howeyScore);  // 0-4 (higher = more likely security)
console.log(result.flags);       // [{ code: 'SECURITIES_RISK_HIGH', ... }]
```

## Configuration Options

```typescript
wrapX402Client(client, {
  // Sender's jurisdiction (ISO code)
  fromJurisdiction: 'HK',
  
  // Block payments with high/critical risk
  blockOnHighRisk: true,
  
  // Block payments with BLOCKED status
  blockOnBlocked: true,
  
  // Skip preflight for small amounts
  skipBelowAmount: 100,
  
  // Custom API endpoint
  preflightEndpoint: 'https://your-api.com/preflight',
  
  // Callbacks
  onPreflight: (result) => console.log('Checked:', result),
  onBlocked: (result) => console.log('Blocked:', result),
  
  // Logging
  verbose: true
});
```

## What Gets Checked?

### x402 Payments
- ✅ KYC thresholds (by jurisdiction)
- ✅ Cross-border payment rules
- ✅ Sanctions list screening
- ✅ Token restrictions by region

### Token Launches
- ✅ Howey Test (securities classification)
- ✅ Jurisdiction-specific licensing requirements
- ✅ Distribution concentration risks
- ✅ Risky naming patterns

## Why Use This?

1. **Compliance-by-default**: Every payment is checked automatically
2. **Regulatory coverage**: APAC focus (HK, SG, JP, AU, etc.)
3. **Audit trail**: Every check generates a `preflightId` for records
4. **Non-blocking**: Can be configured to warn instead of block
5. **Future-proof**: When regulations tighten, you're already compliant

## API Reference

### `wrapX402Client(client, options)`
Wraps an x402 client with compliance checks.

### `checkCompliance(params)`
Runs a standalone compliance check.

### `wouldPass(params, options)`
Quick boolean check if payment would pass.

### `checkTokenLaunch(params)`
Check compliance for token issuance.

## License

MIT

## Links

- [APAC FINSTAB](https://apacfinstab.com)
- [API Documentation](https://apacfinstab.com/docs/api)
- [x402 Protocol](https://x402.org)
