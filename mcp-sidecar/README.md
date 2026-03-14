# MCP Compliance Sidecar

> Audit and risk scoring for MCP tool calls in financial services

**MCP Compliance Sidecar** helps financial institutions prove their AI Agent's MCP tool calls comply with regulatory requirements. Unlike security-focused tools that detect attacks, we generate **compliance evidence** for regulators.

## 🎯 What Problem Does This Solve?

| Existing Tools | MCP Compliance Sidecar |
|----------------|------------------------|
| "Is someone attacking our AI?" | **"Does our AI comply with regulations?"** |
| CTO/Security buyer | **Compliance Officer + CTO** |
| Security alerts | **Audit reports for regulators** |

## 📦 Features

### 1. MCP Server Discovery
Automatically discover MCP servers in your environment and analyze their capabilities:
- Tool and resource inventory
- Sensitivity classification
- Permission level inference
- Compliance flag identification
- Jurisdiction relevance mapping

### 2. Call-Level Audit Logging
Not just session-level — **every single tool call**:
- Full input/output capture (with optional redaction)
- Injection pattern scanning
- Data access analysis
- Jurisdiction trigger detection
- Latency tracking

### 3. 5-Factor Risk Scoring
Real-time risk assessment for each tool call:
- **Data Sensitivity** (30%) — PII, financial data, market-sensitive info
- **Operation Type** (25%) — Read/write/delete operations
- **Access Frequency** (15%) — Anomaly detection
- **Injection Risk** (20%) — SQL/prompt/path injection
- **Regulatory Relevance** (10%) — Jurisdiction triggers

Risk levels: 🟢 LOW | 🟡 MEDIUM | 🟠 HIGH | 🔴 CRITICAL

## 🚀 Quick Start

### Installation

```bash
npm install @apacfinstab/mcp-compliance-sidecar
```

Or use directly:
```bash
npx @apacfinstab/mcp-compliance-sidecar init
```

### Initialize Config

```bash
mcp-sidecar init
# Creates sidecar-config.yaml
```

### Run as Proxy

Instead of:
```
MCP Host → MCP Server
```

Run with sidecar:
```
MCP Host → Sidecar → MCP Server
```

Example:
```bash
mcp-sidecar start --upstream npx -y @modelcontextprotocol/server-filesystem /tmp
```

For Claude Desktop, modify `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@apacfinstab/mcp-compliance-sidecar",
        "start",
        "--upstream",
        "npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"
      ]
    }
  }
}
```

### Generate Reports

```bash
# View audit summary
mcp-sidecar report

# Export as JSON
mcp-sidecar report --json -o audit-report.json

# Filter by risk level
mcp-sidecar report --risk HIGH

# Filter by date range
mcp-sidecar report --since 2026-03-01 --until 2026-03-14
```

### Discover Capabilities

```bash
mcp-sidecar discover --json
```

## 📋 Configuration

See `sidecar-config.yaml` for full configuration options:

```yaml
# Proxy settings
proxy:
  mode: "stdio"
  upstream_command: ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"]

# Audit settings
audit:
  enabled: true
  storage: "sqlite"
  database_path: "./sidecar-audit.db"
  
  # Data redaction
  redaction:
    enabled: true
    patterns:
      - name: "credit_card"
        regex: "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b"

# Risk scoring
risk_scoring:
  enabled: true
  weights:
    data_sensitivity: 0.30
    operation_type: 0.25
    access_frequency: 0.15
    injection_risk: 0.20
    regulatory_relevance: 0.10

# Jurisdiction mapping
compliance:
  jurisdictions:
    - code: "HK-SFC"
      triggers: ["securities", "trading"]
    - code: "HK-PDPO"
      triggers: ["customer", "personal"]
```

## 🔒 Audit Log Format

Each tool call generates a log entry:

```json
{
  "log_id": "log-20260314103000-abc123",
  "timestamp": "2026-03-14T10:30:00.123Z",
  "session_id": "sess_abc123",
  
  "call_details": {
    "server_id": "crm-server",
    "tool": "get_customer",
    "input": { "customer_id": "CUST-001" },
    "output": { "status": "success", "data_hash": "sha256:e3b0c4..." },
    "latency_ms": 45
  },
  
  "compliance_analysis": {
    "injection_scan": { "status": "clean", "confidence": 0.98 },
    "data_access": {
      "accessed_pii": true,
      "pii_types": ["customer_id"]
    },
    "jurisdiction_triggers": [
      { "code": "HK-PDPO", "reason": "Detected pattern: customer" }
    ]
  },
  
  "risk_assessment": {
    "risk_score": 0.42,
    "risk_level": "MEDIUM",
    "flags": ["PII access: customer_id"],
    "recommendations": ["Document data access purpose"]
  }
}
```

## 🏛️ Supported Jurisdictions (APAC)

| Code | Regulator | Triggers |
|------|-----------|----------|
| HK-SFC | Hong Kong Securities and Futures Commission | securities, trading, futures |
| HK-PDPO | HK Personal Data Protection | customer, personal, name |
| HK-AMLO | HK Anti-Money Laundering | transaction, transfer, payment |
| SG-MAS | Monetary Authority of Singapore | payment, remittance |

## 📊 Reporting for Regulators

Generate compliance reports for regulatory audits:

```bash
# Monthly compliance report
mcp-sidecar report --since 2026-02-01 --until 2026-02-28 -o feb-2026-audit.json

# High-risk call analysis
mcp-sidecar report --risk HIGH --risk CRITICAL -o high-risk-review.json
```

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/apacfinstab/mcp-compliance-sidecar

# Install dependencies
npm install

# Run tests
npm test
```

## 📄 License

MIT

## 🔗 Related

- [APAC FINSTAB](https://apacfinstab.com) — AI Compliance Infrastructure
- [MCP Protocol](https://modelcontextprotocol.io) — Model Context Protocol
- [PolicyPedia MCP](https://apacfinstab.com/mcp) — Regulatory Data MCP Server

---

*Built by APAC FINSTAB — Making AI Agents Audit-Ready*
