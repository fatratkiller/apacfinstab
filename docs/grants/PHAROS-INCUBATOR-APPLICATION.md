# Pharos Incubator Application - APAC FINSTAB

> Prepared: 2026-03-04
> Target: Pharos $10M Builder Incubation Program
> Track: RWA/Payments + Innovative Infra

---

## Executive Summary

**APAC FINSTAB** is a regulatory compliance intelligence layer for Web3, providing machine-readable APAC regulatory knowledge via MCP (Model Context Protocol) for AI agents and applications.

**Why Pharos?**
Pharos is building RealFi infrastructure for institutional RWA adoption. Institutions need **regulatory clarity** before tokenizing assets. APAC FINSTAB provides the compliance intelligence layer that makes institutional RWA adoption possible across Asia-Pacific.

---

## Problem Statement

**Institutional RWA Adoption Blockers:**
1. **Regulatory Uncertainty** — 12 APAC jurisdictions, 12 different frameworks
2. **Compliance Costs** — Legal research costs $50K-500K per jurisdiction
3. **No Machine-Readable Data** — AI agents can't programmatically check compliance
4. **Fragmented Knowledge** — No single source of truth for APAC crypto regulation

**Result:** Institutions hesitate, RWA adoption stalls, Pharos ecosystem growth limited.

---

## Solution: APAC FINSTAB

### Core Product

**MCP-Compliant Regulatory API** providing:
- Real-time APAC regulatory intelligence
- Jurisdiction comparison tools
- Compliance risk assessment
- License requirement lookups

### Technical Architecture

```
┌─────────────────────────────────────────────┐
│              Pharos dApps                    │
│         (RWA Issuers, DeFi, Payments)        │
└─────────────────┬───────────────────────────┘
                  │ MCP Protocol
┌─────────────────▼───────────────────────────┐
│            APAC FINSTAB API                  │
│  ┌─────────────────────────────────────┐    │
│  │  check_compliance_context()          │    │
│  │  get_license_requirements()          │    │
│  │  compare_jurisdictions()             │    │
│  └─────────────────────────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Regulatory Knowledge Graph           │
│  • 12 APAC jurisdictions                     │
│  • 500+ regulatory events                    │
│  • Confidence-scored rules                   │
└─────────────────────────────────────────────┘
```

### MCP Integration (Live)

```javascript
// AI agent query example
const result = await mcpClient.call("apacfinstab", {
  tool: "reg_lookup",
  params: {
    jurisdiction: "hong_kong",
    activity: "stablecoin_issuance",
    entity_type: "corporation"
  }
});

// Returns structured compliance guidance
// with confidence scores and risk flags
```

**Deployed:** `apacfinstab.com` (Cloudflare Workers)

---

## Value Proposition for Pharos Ecosystem

### For RWA Issuers
- **Pre-tokenization compliance check** — Know requirements before launching
- **Multi-jurisdiction planning** — Optimize structure across APAC
- **Ongoing monitoring** — Track regulatory changes affecting assets

### For DeFi Applications
- **Geo-compliant features** — Enable/disable features by jurisdiction
- **Risk disclosure automation** — Generate appropriate warnings
- **Institutional-grade compliance** — Meet institutional requirements

### For Pharos Network
- **Ecosystem differentiation** — "The compliant RWA chain"
- **Institutional attraction** — Remove compliance barrier to entry
- **Developer productivity** — Pre-built compliance tooling

---

## Roadmap

### Phase 1: Pharos Integration (Month 1-2)
- [ ] Deploy APAC FINSTAB as Pharos-native service
- [ ] Create Pharos-specific compliance templates
- [ ] Build example RWA compliance flows

### Phase 2: Deep Integration (Month 3-4)
- [ ] On-chain compliance attestation module
- [ ] Integration with RealFi Alliance standards
- [ ] Pharos SDK plugin

### Phase 3: Scale (Month 5-6)
- [ ] Automated compliance monitoring for Pharos dApps
- [ ] Compliance dashboard for Pharos ecosystem
- [ ] Case study: 3+ RWA projects using APAC FINSTAB

---

## Team

**Kyle Leo** — Founder
- Background: Blockchain infrastructure, APAC markets
- Location: Perth, Australia (APAC timezone)

**AI Development Partner** — 志玲 (TechMate)
- Full-stack development and automation
- Continuous CI/CD deployment

---

## Traction

- **86 SEO pages** covering 12 APAC jurisdictions
- **MCP Server deployed** on Cloudflare Workers
- **API endpoints active:** reg_lookup, compliance_check, jurisdiction_compare
- **Knowledge base:** 79+ regulatory events indexed

---

## Ask

**Funding Request:** $50,000 - $100,000

**Use of Funds:**
| Item | Amount | Purpose |
|------|--------|---------|
| API Infrastructure | $15K | Scale Cloudflare Workers, add edge caching |
| Knowledge Expansion | $20K | Cover remaining APAC jurisdictions in depth |
| Pharos Integration | $25K | Build native Pharos modules and SDK |
| Legal Review | $15K | Validate regulatory interpretations |
| Marketing | $15K | Developer outreach, documentation |

**Milestones:**
1. **M1 (30 days):** Pharos testnet integration live
2. **M2 (60 days):** 3 Pharos dApps using APAC FINSTAB
3. **M3 (90 days):** RealFi Alliance compliance module proposal
4. **M4 (120 days):** Production deployment + case study

---

## Why Now?

1. **Pharos mainnet launching** — Perfect timing for compliance tooling
2. **RealFi Alliance forming** — Standards being set NOW
3. **APAC regulatory clarity improving** — HK, SG, JP all active on crypto rules
4. **AI agent adoption** — MCP becoming standard for agentic apps

---

## Contact

- **Website:** https://apacfinstab.com
- **GitHub:** https://github.com/apacfinstab
- **Email:** [To be added]

---

## Appendix: APAC Coverage

| Jurisdiction | Status | Key Regulations |
|--------------|--------|-----------------|
| Hong Kong 🇭🇰 | ✅ Deep | SFC VATP, HKMA Stablecoin |
| Singapore 🇸🇬 | ✅ Deep | MAS DPT, PSA |
| Japan 🇯🇵 | ✅ Deep | FSA JVCEA |
| South Korea 🇰🇷 | ✅ Deep | FSC DABA |
| Australia 🇦🇺 | ✅ Deep | ASIC DCE |
| India 🇮🇳 | ✅ Covered | RBI, FIU-IND |
| Taiwan 🇹🇼 | ✅ Covered | FSC VASP Act |
| Thailand 🇹🇭 | ✅ Covered | SEC Thailand |
| Indonesia 🇮🇩 | ✅ Covered | OJK, Bappebti |
| Vietnam 🇻🇳 | ✅ Covered | SBV (emerging) |
| Philippines 🇵🇭 | ✅ Covered | BSP, SEC |
| Malaysia 🇲🇾 | ✅ Covered | SC Malaysia |

---

*Application prepared for Pharos Builder Incubation Program*
*https://docs.google.com/forms/d/e/1FAIpQLSeAH2AU2xSUMbU5bic8XQwlcszD8Gs6to7M0HTAImrhdcpH-g/viewform*
