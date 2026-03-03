# APAC FINSTAB Compliance API

Agent合规预检 + ERC-8004声誉写入

## 🚀 快速开始

```bash
cd api
npm install
npm run dev
```

## 📡 API端点

### 1. x402 支付预检

```bash
POST /v1/preflight/x402
```

**请求：**
```json
{
  "fromAddress": "0x1234...",
  "toAddress": "0x5678...",
  "amount": 1000,
  "token": "USDC",
  "chain": "base",
  "fromJurisdiction": "HK",
  "toJurisdiction": "SG"
}
```

**响应：**
```json
{
  "preflightId": "pf_x402_1709...",
  "status": "CLEAR|REVIEW_REQUIRED|BLOCKED",
  "riskLevel": "low|medium|high|critical",
  "flags": [],
  "references": [],
  "suggestedActions": []
}
```

### 2. Token发行预检

```bash
POST /v1/preflight/token-launch
```

**请求：**
```json
{
  "tokenName": "MyToken",
  "tokenSymbol": "MTK",
  "totalSupply": 1000000000,
  "distribution": {
    "team": 20,
    "presale": 30,
    "public": 50
  },
  "creatorJurisdiction": "HK",
  "hasRevenue": false,
  "hasGovernance": true
}
```

**响应：**
```json
{
  "preflightId": "pf_launch_1709...",
  "status": "REVIEW_REQUIRED",
  "howeyScore": 2,
  "flags": [
    {
      "code": "SECURITIES_RISK_MEDIUM",
      "severity": "medium",
      "message": "Token有一定证券属性"
    }
  ],
  "references": ["SFO Schedule 1", "SFC Statement on ICOs"]
}
```

### 3. ERC-8004 Feedback生成

```bash
POST /v1/feedback/erc8004
```

**请求：**
```json
{
  "agentId": 22,
  "agentRegistry": "eip155:8453:0x...",
  "checkType": "x402",
  "preflightResult": { ... },
  "jurisdiction": "HK"
}
```

**响应：**
```json
{
  "feedbackId": "fb_1709...",
  "complianceScore": 87,
  "scoreInterpretation": {
    "level": "GOOD",
    "description": "合规表现良好"
  },
  "offChainFeedback": { ... },
  "onChainParams": { ... },
  "transaction": {
    "to": "0x...",
    "data": "0x..."
  }
}
```

## 🔗 MCP Tool集成

将Preflight作为MCP Tool暴露：

```json
{
  "name": "compliance_preflight",
  "description": "Check regulatory compliance before executing financial operations",
  "inputSchema": {
    "type": "object",
    "properties": {
      "checkType": { "enum": ["x402", "token-launch"] },
      "params": { "type": "object" }
    }
  }
}
```

## 📦 部署

### Cloudflare Workers

```bash
npx wrangler deploy
```

### 本地测试

```bash
curl -X POST http://localhost:8787/v1/preflight/x402 \
  -H "Content-Type: application/json" \
  -d '{"fromAddress":"0x1234","toAddress":"0x5678","amount":1000,"token":"USDC","chain":"base"}'
```

## 🔐 ERC-8004 集成

1. 调用Preflight API获取检查结果
2. 调用`/v1/feedback/erc8004`生成Feedback数据
3. 将`offChainFeedback`上传到IPFS
4. 使用`transaction.data`发送链上交易

## 📊 状态码说明

| Status | 含义 |
|--------|------|
| `CLEAR` | 无明显风险，可执行 |
| `REVIEW_REQUIRED` | 有风险点，需人工确认 |
| `HIGH_RISK` | 高风险，建议暂停 |
| `BLOCKED` | 明确违规，不应执行 |
