# Sui DeFi Moonshots Application

> APAC FINSTAB: Regulatory Intelligence Layer for Institutional DeFi

**Application Link:** https://tally.so/r/MeRKJX
**Program:** Sui DeFi Moonshots (up to $500K)
**Status:** 📝 DRAFT - Ready for Review
**Last Updated:** 2026-03-05

---

## 1. Executive Summary

**What we're building:**
A regulatory intelligence layer that makes APAC compliance composable for DeFi protocols on Sui.

**Why it's category-defining:**
Current compliance solutions (Netki, Chainalysis) answer "Is this wallet clean?" 

We answer: "Can this transaction happen under Hong Kong SFC rules? What about Singapore MAS? Here's why, and here's what would need to change."

**The Gap:**
- $50B+ institutional capital sitting on sidelines due to regulatory uncertainty
- DeFi protocols losing APAC users to CeFi due to compliance friction
- No protocol-native way to understand cross-jurisdictional regulatory implications

---

## 2. Product Vision

### 2.1 Novel Financial Primitive: Composable Compliance Context

Not another KYC oracle. A **regulatory reasoning engine** that DeFi protocols can compose into their flows.

```move
// Example: Sui DEX integrating compliance context
public fun swap_with_compliance<CoinA, CoinB>(
    pool: &mut Pool<CoinA, CoinB>,
    coin_in: Coin<CoinA>,
    user_jurisdiction: String,
    ctx: &mut TxContext
): Coin<CoinB> {
    // Call APAC FINSTAB compliance module
    let compliance = apac_finstab::check_context(
        activity: "token_swap",
        jurisdiction: user_jurisdiction,
        asset_types: vector[type_name<CoinA>(), type_name<CoinB>()],
        amount: coin::value(&coin_in)
    );
    
    // Protocol decides how to handle
    assert!(compliance.confidence >= 0.8, E_COMPLIANCE_UNCERTAIN);
    
    // Log compliance context for audit trail
    emit_compliance_event(compliance);
    
    // Proceed with swap
    internal_swap(pool, coin_in, ctx)
}
```

### 2.2 Unique Value Props

| Feature | Netki/Others | APAC FINSTAB |
|---------|--------------|--------------|
| Wallet screening | ✅ | ✅ |
| **Why (not) compliant** | ❌ | ✅ Reasoning chain |
| **Multi-jurisdiction** | Single | 12 APAC jurisdictions |
| **Confidence scoring** | Binary | 0.0-1.0 + sources |
| **Regulatory updates** | Manual | Real-time MCP feeds |
| **Composability** | Off-chain API | **On-chain Move module** |

### 2.3 Technical Architecture on Sui

```
┌─────────────────────────────────────────────────────────────┐
│                    DeFi Protocols on Sui                     │
│  (DEXes, Lending, Stablecoin Issuers, RWA Tokenization)     │
└─────────────────────────┬───────────────────────────────────┘
                          │ compose
┌─────────────────────────▼───────────────────────────────────┐
│              APAC FINSTAB Compliance Module                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Check API   │  │ Confidence  │  │ Audit Trail Logger  │  │
│  │ (Move)      │  │ Calculator  │  │ (Sui Objects)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐ │
│  │           Regulatory Knowledge Graph (Off-chain)        │ │
│  │  Hong Kong SFC │ Singapore MAS │ Japan FSA │ Korea FSC  │ │
│  │  Taiwan FSC │ Australia ASIC │ Thailand SEC │ India RBI │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Sui-Native Advantages:**
1. **Object-centric compliance records** - Compliance context attached to Sui objects
2. **Parallel execution** - Compliance checks don't block transactions
3. **Programmable ownership** - Compliance states can be transferred/delegated
4. **DeepBook integration** - Native orderbook compliance for institutional trading

---

## 3. Net New Capital Thesis

### 3.1 Target Segments

| Segment | Capital Pool | Pain Point | Our Solution |
|---------|-------------|------------|--------------|
| **APAC Family Offices** | $500B+ | "Which chains are safe for HK/SG compliance?" | Jurisdiction-aware DeFi routing |
| **Institutional Traders** | DeepBook volume | "Can we trade these pairs under MAS rules?" | Real-time compliance context |
| **RWA Tokenizers** | $10B+ pipeline | "How do we structure for multi-jurisdiction?" | Cross-border compliance mapping |
| **Stablecoin Issuers** | APAC market entry | "HKMA vs MAS requirements?" | Regulatory gap analysis |

### 3.2 Why Now

1. **Hong Kong VASP regime** (June 2023) - First comprehensive crypto licensing in APAC
2. **Singapore MAS stablecoin framework** (August 2023) - Setting regional standards
3. **Japan STO regulation** (2024-2025) - Institutional rails opening
4. **Sui institutional momentum** - Native assets, DeepBook, TradFi partnerships

### 3.3 TAM/SAM/SOM

- **TAM:** $15B (global compliance software market)
- **SAM:** $800M (crypto compliance, APAC focus)
- **SOM (Y1):** $2M (Sui ecosystem DeFi protocols needing APAC compliance)

---

## 4. Team & Execution Credibility

### 4.1 Track Record

- **APAC Regulatory Expertise:** 10+ years in HK/SG financial services
- **Crypto Native:** Building in crypto since 2019
- **Technical Depth:** Full-stack web3 + Move development capability
- **Content Authority:** 50+ pSEO pages ranking for APAC crypto regulation keywords

### 4.2 What We've Shipped

| Asset | Status | Metrics |
|-------|--------|---------|
| apacfinstab.com | Live | 86 pages, GA tracking |
| MCP API Server | Deployed | Cloudflare Workers |
| Regulatory Knowledge Base | Live | 79 policy events, 12 jurisdictions |
| pSEO Infrastructure | Automated | Auto-generation pipeline |

### 4.3 Open Source Contributions

- MCP Server: Open protocol for AI agent integration
- Regulatory data: Structured JSON policy database
- Compare tools: Cross-jurisdiction analysis framework

---

## 5. Sui-Specific Roadmap

### Phase 1: Foundation (Month 1-2)
- [ ] Deploy Move compliance module to Sui Testnet
- [ ] Integrate with 1-2 existing Sui DEXes (Cetus, Turbos)
- [ ] Establish compliance oracle pattern for Sui

### Phase 2: Expansion (Month 3-4)
- [ ] DeepBook native integration
- [ ] Multi-jurisdiction support (HK, SG, JP initially)
- [ ] Compliance context attached to Sui NFTs/tokens

### Phase 3: Scale (Month 5-6)
- [ ] Full APAC 12-jurisdiction coverage
- [ ] Institutional dashboard for compliance monitoring
- [ ] SDK for Sui builders

### Milestones for Incentive Unlocks

| Milestone | Deliverable | Incentive Ask |
|-----------|-------------|---------------|
| Testnet Deploy | Move module + 2 DEX integrations | $100K |
| Mainnet Launch | Live compliance checks, 1K+ queries/day | $150K |
| Traction | 5+ protocol integrations, 10K+ queries/day | $150K |
| Scale | 12 jurisdictions, institutional adoption | $100K |
| **Total** | | **$500K** |

---

## 6. Why Moonshots (Not Regular Grants)

### Category-Defining Criteria Match

| Moonshots Criteria | Our Fit |
|--------------------|---------|
| **Novel primitive** | First regulatory reasoning engine (not KYC oracle) |
| **Capital efficiency** | Unlocks institutional capital blocked by compliance uncertainty |
| **Net new capital** | $500B+ APAC institutional market waiting for compliance clarity |
| **Composability** | Move module composable by any Sui DeFi protocol |

### What We're NOT

- ❌ Another KYC/AML tool (Netki exists)
- ❌ Incremental improvement to existing patterns
- ❌ Short-term TVL farming play

### What We ARE

- ✅ Infrastructure that makes APAC institutional DeFi possible
- ✅ Regulatory intelligence as a composable primitive
- ✅ Bridge between TradFi compliance requirements and DeFi innovation

---

## 7. Application Form Answers (Copy-Paste Ready)

### Team Name
APAC FINSTAB

### One-liner
Regulatory intelligence layer that makes APAC compliance composable for Sui DeFi protocols

### Website
https://apacfinstab.com

### What are you building?
We're building a regulatory reasoning engine for DeFi protocols on Sui. Unlike existing compliance tools that provide binary pass/fail answers, APAC FINSTAB delivers confidence-scored compliance context with explanatory reasoning chains across 12 APAC jurisdictions.

Our Move module allows any Sui protocol to compose compliance intelligence into their transaction flows—enabling institutional capital to enter DeFi with regulatory clarity.

Example: A DEX can check if a swap is compliant under Hong Kong SFC rules before execution, log the compliance context as a Sui object, and provide audit trails for institutional users.

### Why is this category-defining?
Current compliance tools answer "Is this wallet clean?" 

We answer "Can this transaction happen under Hong Kong SFC rules? What about Singapore MAS? Here's why, and here's what would need to change."

This shifts compliance from a binary checkpoint to an intelligence layer that DeFi protocols can reason with. It's the difference between a metal detector and a legal advisor.

### What makes your team credible?
- 10+ years APAC financial services experience (HK/SG)
- Already shipped: apacfinstab.com (86 pages), MCP API (Cloudflare Workers), regulatory knowledge base (79 policy events across 12 jurisdictions)
- Technical depth in Move development and web3 infrastructure
- Content ranking for APAC crypto regulation keywords

### What do you need from Moonshots?
1. **Capital** ($500K) for Move development, security audits, and go-to-market
2. **Technical collaboration** on Sui-native compliance patterns and DeepBook integration
3. **Ecosystem introductions** to DEXes, lending protocols, and RWA projects needing compliance layer

### Links
- Website: https://apacfinstab.com
- GitHub: [TBD - private repo]
- MCP API: https://apacfinstab.com/mcp

---

## 8. Next Steps

1. [ ] **老板审核** - Review and edit this document
2. [ ] **GitHub repo** - Create public/private Sui integration repo
3. [ ] **Move prototype** - Basic compliance check module
4. [ ] **Submit** - Fill out Tally form: https://tally.so/r/MeRKJX

---

## Appendix: Competitive Analysis

| Player | Focus | Sui Presence | Our Advantage |
|--------|-------|--------------|---------------|
| Netki DeFi Sentinel | KYC/AML oracle | ✅ Deployed | We do regulatory reasoning, not just screening |
| Chainalysis | Wallet screening | Indirect | We're APAC-specialized + protocol-native |
| Elliptic | Risk scoring | No | We provide jurisdiction-specific compliance |
| Merkle Science | Transaction monitoring | No | We're composable on-chain |

**Key Differentiator:** No one is doing **regulatory intelligence** (why + confidence + multi-jurisdiction) as a **composable primitive** on Sui.

---

*Prepared: 2026-03-05*
*Status: Ready for boss review*
