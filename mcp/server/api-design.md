# APAC FINSTAB Compliance MCP Server - API设计

> 托管版优先 — 所有调用经过我们的服务器，方便统计和变现

## 架构概览

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│  APAC FINSTAB MCP    │────▶│  数据层          │
│  (Claude/GPT)   │◀────│  Server (托管)        │◀────│  - 法规库        │
└─────────────────┘     │                      │     │  - 案例库        │
                        │  ┌────────────────┐  │     │  - 监管因果图谱  │
                        │  │ Rate Limiting  │  │     └─────────────────┘
                        │  │ Usage Tracking │  │
                        │  │ Auth (x402)    │  │
                        │  └────────────────┘  │
                        └──────────────────────┘
```

## Base URL

```
Production: https://mcp.apacfinstab.com/v1
Staging:    https://mcp-staging.apacfinstab.com/v1
```

## 认证方式

### Option 1: API Key (MVP阶段)
```
Authorization: Bearer apfs_sk_xxxxxxxxxxxx
```

### Option 2: x402 Payment (未来)
```
X-402-Payment: <payment_token>
```

## MCP协议端点

### 1. 工具发现
```
GET /mcp/tools
```

Response:
```json
{
  "tools": [
    {
      "name": "getComplianceRequirements",
      "description": "获取特定业务场景的合规要求清单",
      "inputSchema": {...},
      "pricing": {
        "perCall": 0.01,
        "currency": "USD"
      }
    }
  ],
  "serverInfo": {
    "name": "APAC FINSTAB Compliance MCP",
    "version": "0.1.0",
    "jurisdictions": ["HK", "SG", "JP", "KR", "AU"]
  }
}
```

### 2. 工具调用
```
POST /mcp/tools/{toolName}/call
Content-Type: application/json

{
  "arguments": {
    "businessType": "crypto_exchange",
    "jurisdiction": "HK"
  }
}
```

Response:
```json
{
  "result": {...},
  "usage": {
    "tokensProcessed": 1234,
    "costUSD": 0.01,
    "remainingCredits": 99.99
  },
  "metadata": {
    "requestId": "req_xxxxx",
    "latencyMs": 234
  }
}
```

### 3. 批量调用 (降低延迟)
```
POST /mcp/tools/batch
Content-Type: application/json

{
  "calls": [
    {"tool": "getComplianceRequirements", "arguments": {...}},
    {"tool": "searchEnforcementCases", "arguments": {...}}
  ]
}
```

## REST API端点 (非MCP客户端)

### 法规查询
```
GET /api/v1/regulations?jurisdiction=HK&topic=VASP
GET /api/v1/regulations/{regulationId}
```

### 案例搜索
```
GET /api/v1/cases?keywords=AML,KYC&from=2025-01-01
GET /api/v1/cases/{caseId}
```

### 合规评估
```
POST /api/v1/assess/eligibility
POST /api/v1/assess/gaps
```

### 申报辅助
```
GET /api/v1/filings/deadlines?licenseTypes=VASP
GET /api/v1/filings/checklist/{filingType}
POST /api/v1/filings/validate
```

## 定价Tier

| Tier | 价格 | 调用量 | 功能 |
|------|------|--------|------|
| Free | $0 | 100次/月 | 基础查询 |
| Pro | $99/月 | 5,000次/月 | + 案例搜索 + 趋势预测 |
| Enterprise | 联系销售 | Unlimited | + 私有部署 + 定制 |

## Rate Limiting

| Tier | 请求/秒 | 请求/天 |
|------|---------|---------|
| Free | 1 | 100 |
| Pro | 10 | 5,000 |
| Enterprise | 100 | Unlimited |

## 错误码

| Code | 含义 |
|------|------|
| 400 | 请求格式错误 |
| 401 | 认证失败 |
| 402 | 余额不足 |
| 429 | 超出速率限制 |
| 500 | 服务器错误 |

## SDK (计划中)

```python
# Python
from apacfinstab import ComplianceMCP

client = ComplianceMCP(api_key="apfs_sk_xxx")
result = client.tools.getComplianceRequirements(
    businessType="crypto_exchange",
    jurisdiction="HK"
)
```

```typescript
// TypeScript
import { ComplianceMCP } from '@apacfinstab/mcp';

const client = new ComplianceMCP({ apiKey: 'apfs_sk_xxx' });
const result = await client.tools.getComplianceRequirements({
  businessType: 'crypto_exchange',
  jurisdiction: 'HK'
});
```

## 下一步

- [ ] 实现MVP版本 (3个核心tool)
- [ ] 部署到Cloudflare Workers
- [ ] 接入Stripe计费
- [ ] 发布到MCP工具目录

---

*Created: 2026-02-25*
*Status: Design Phase*
