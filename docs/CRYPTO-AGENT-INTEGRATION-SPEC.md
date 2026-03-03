# Crypto Agent生态整合方案

> 2026-03-03 | 志玲

---

## 一、生态概览

### 关键协议/产品

| 协议 | 功能 | 我们的切入点 |
|------|------|-------------|
| **ERC-8004** | Agent链上身份+声誉 | Trust Score写入Reputation Registry |
| **x402** | Agent微支付标准 | 支付前合规Preflight |
| **Bankrbot** | 自主交易/发币 | Token发行合规检查 |
| **Launchpads** | 自然语言发Token | Pre-launch合规审计 |

---

## 二、ERC-8004 整合方案

### 协议结构

ERC-8004包含三个链上注册表：

```
┌─────────────────────────────────────────────────────┐
│                    ERC-8004                         │
├─────────────────┬─────────────────┬─────────────────┤
│ Identity        │ Reputation      │ Validation      │
│ Registry        │ Registry        │ Registry        │
├─────────────────┼─────────────────┼─────────────────┤
│ ERC-721 NFT     │ Feedback系统    │ 验证钩子        │
│ Agent身份       │ 任何人可提交    │ zkML/TEE/Stake  │
└─────────────────┴─────────────────┴─────────────────┘
```

### 我们的角色：Compliance Feedback Provider

```solidity
// 我们作为clientAddress调用giveFeedback
ReputationRegistry.giveFeedback(
    agentId: 22,
    value: 87,              // Compliance Score 0-100
    valueDecimals: 0,
    tag1: "compliance",     // 标识为合规评分
    tag2: "SFC",            // 监管机构
    endpoint: "https://api.agent.com/trade",
    feedbackURI: "ipfs://...",  // 详细合规报告
    feedbackHash: 0x...
);
```

### Off-chain Feedback File结构

```json
{
  "agentRegistry": "eip155:1:{identityRegistry}",
  "agentId": 22,
  "clientAddress": "0xAPACFINSTAB...",
  "createdAt": "2026-03-03T12:00:00Z",
  "value": 87,
  "valueDecimals": 0,
  "tag1": "compliance",
  "tag2": "SFC",
  
  "complianceDetails": {
    "jurisdiction": "HK",
    "regulator": "SFC",
    "checkType": "preflight",
    "riskLevel": "low",
    "flags": [],
    "references": ["SFC VASP Guidelines 4.2"],
    "preflightId": "pf_abc123"
  },
  
  "proofOfCheck": {
    "timestamp": "2026-03-03T11:59:00Z",
    "signedBy": "0xAPACFINSTAB...",
    "signature": "0x..."
  }
}
```

### 整合流程

```
Agent执行操作
    │
    ▼
调用APAC FINSTAB Preflight API
    │
    ▼
返回Compliance Check结果
    │
    ├─── CLEAR → 生成高分feedback
    │
    ├─── REVIEW_REQUIRED → 生成中分feedback + flags
    │
    └─── HIGH_RISK → 生成低分feedback + 详细报告
    │
    ▼
写入ERC-8004 Reputation Registry
    │
    ▼
Agent获得链上可验证的合规历史
```

### 商业价值

1. **对Agent**：积累合规声誉，更容易被雇佣
2. **对雇主**：查看Agent合规历史，降低风险
3. **对监管**：链上审计trail，可追溯
4. **对我们**：每次写入 = 收费机会

---

## 三、x402 整合方案

### x402协议简介

```
HTTP 402 Payment Required
    │
    ▼
x402: Agent微支付标准
    │
    ├── 支持$0.001级别微支付
    ├── Agent自主支付，无需人工
    ├── 与MCP集成
    └── 多链支持 (Base, Solana等)
```

### 合规切入点

x402支付可能触发的合规问题：

| 场景 | 合规风险 | Preflight检查 |
|------|----------|---------------|
| 跨境支付 | 外汇管制、SWIFT要求 | 目标地址的jurisdiction |
| 大额支付 | KYC/AML触发点 | 金额是否超过阈值 |
| 制裁相关 | OFAC/UN制裁名单 | 地址是否在黑名单 |
| Token类型 | 某些token在某些地区违法 | Token的监管状态 |

### x402 Compliance Preflight流程

```
Agent发起x402支付请求
    │
    ▼
[x402 Middleware / MCP Tool]
    │
    ▼
调用APAC FINSTAB Preflight
    │
    │  POST /v1/preflight/x402
    │  {
    │    "fromAddress": "0x...",
    │    "toAddress": "0x...",
    │    "amount": 100.00,
    │    "token": "USDC",
    │    "chain": "base"
    │  }
    │
    ▼
返回Preflight结果
    │
    ├─── CLEAR → 继续支付
    │
    ├─── REVIEW → 告警 + 继续（可配置）
    │
    └─── BLOCKED → 阻止支付 + 记录
```

### 集成方式

**选项A：MCP Tool**
```json
{
  "name": "compliance_preflight_x402",
  "description": "Check x402 payment compliance before execution",
  "inputSchema": {
    "fromAddress": "string",
    "toAddress": "string",
    "amount": "number",
    "token": "string",
    "chain": "string"
  }
}
```

**选项B：x402 Middleware**
```javascript
// 在x402请求前自动检查
const x402WithCompliance = wrapX402(x402Client, {
  preflightEndpoint: "https://api.apacfinstab.com/v1/preflight/x402",
  blockOnHighRisk: true,
  logAllChecks: true
});
```

---

## 四、Launchpad合规整合

### 场景

用户通过自然语言在Clawnch/Clanker/Moltlaunch发Token：
> "Launch a token called MEMECOIN with 1B supply"

### 问题

用户可能不知道：
- 这个Token在某些地区可能被视为证券
- 需要披露要求
- 可能触发AML规则

### Pre-launch Compliance Check

```
自然语言发Token
    │
    ▼
Launchpad解析参数
    │
    ▼
调用APAC FINSTAB Pre-launch Check
    │
    │  POST /v1/preflight/token-launch
    │  {
    │    "tokenName": "MEMECOIN",
    │    "totalSupply": 1000000000,
    │    "distribution": {...},
    │    "creatorJurisdiction": "HK"
    │  }
    │
    ▼
返回合规检查结果
    │
    ├─── flags: ["可能被SFC视为证券", "需要PI资格"]
    │
    └─── references: ["SFC Statement on ICO", "SFO Schedule 1"]
```

### 商业模式

- **免费层**：基础检查，通用警告
- **付费层**：地区特定分析，详细参考文献
- **企业层**：白标集成，自定义规则

---

## 五、技术实现优先级

### Phase 1 (03-07前)

| 任务 | 说明 |
|------|------|
| ERC-8004 Feedback格式设计 | 定义我们的tag结构 |
| x402 Preflight API spec | 设计端点和参数 |
| 研究ERC-8004合约地址 | 找到mainnet/testnet部署 |

### Phase 2 (03-14前)

| 任务 | 说明 |
|------|------|
| ERC-8004写入测试 | testnet上提交feedback |
| x402 MCP Tool原型 | 集成到我们的MCP Server |
| Launchpad合作BD | 联系Clawnch团队 |

### Phase 3 (03-21前)

| 任务 | 说明 |
|------|------|
| 主网部署 | ERC-8004 feedback写入mainnet |
| x402 middleware发布 | npm包 |
| 文档+案例 | 开发者指南 |

---

## 六、收入模型

| 产品 | 定价 | 目标客户 |
|------|------|----------|
| **ERC-8004 Feedback写入** | $0.10/次 | Agent开发者 |
| **x402 Preflight** | $0.01/检查 | x402集成方 |
| **Launchpad Pre-check** | $5/token发行 | Launchpad用户 |
| **批量订阅** | $99/月 (1000次) | 高频用户 |

---

## 七、差异化

```
现有合规工具：告诉你违规了，罚你钱
我们：在你违规前告诉你风险，帮你积累合规声誉

现有链上声誉：技术表现（uptime、latency）
我们：合规表现（监管合规度）

→ 唯一的"合规即声誉"提供商
```

---

*Created: 2026-03-03*
