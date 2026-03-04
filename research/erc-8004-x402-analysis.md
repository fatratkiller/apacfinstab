# ERC-8004 & x402 技术规范研究

> 研究日期: 2026-03-04
> 研究目的: 理解Agent链上声誉和支付基础设施，为Trust Score整合设计做准备

---

## 一、ERC-8004: Trustless Agents

### 1.1 概述

**状态**: DRAFT (2025-08-13发布)
**作者**: MetaMask, Ethereum Foundation, Google, Coinbase 联合提案
**目的**: 在无需预先信任的情况下发现、选择、与Agent交互，构建开放Agent经济

### 1.2 核心架构: 三个注册表

```
┌─────────────────────────────────────────────────────────────┐
│                    ERC-8004 架构                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Identity        │ Reputation      │ Validation              │
│ Registry        │ Registry        │ Registry                │
├─────────────────┼─────────────────┼─────────────────────────┤
│ - ERC-721标准   │ - 反馈信号接口  │ - 独立验证钩子          │
│ - 全局唯一ID    │ - 链上评分      │ - 支持多种验证模型      │
│ - URI指向注册文件│ - 链下聚合算法  │ - stake/zkML/TEE/法官   │
│ - 支持转移/委托 │ - 子图索引      │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 1.3 Identity Registry 详解

**Agent全局唯一标识**:
```
agentRegistry: {namespace}:{chainId}:{identityRegistry}
例: eip155:1:0x742d35Cc6634C0532925a3b844Bc9e7595f...

agentId: ERC-721 tokenId (递增分配)
```

**Agent注册文件结构**:
```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "myAgentName",
  "description": "Agent能力描述",
  "image": "https://example.com/agentimage.png",
  "services": [
    { "name": "A2A", "endpoint": "https://agent.example/.well-known/agent-card.json" },
    { "name": "MCP", "endpoint": "https://mcp.agent.eth/" }
  ],
  "x402Support": true,  // ← 支付能力声明
  "active": true,
  "supportedTrust": ["reputation", "crypto-economic", "tee-attestation"]
}
```

### 1.4 Reputation Registry 详解

**反馈结构**:
```solidity
function giveFeedback(
    uint256 agentId,
    int128 value,           // 评分值 (有符号)
    uint8 valueDecimals,    // 精度 (0-18)
    string tag1,            // 标签1 (如 "starred", "uptime")
    string tag2,            // 标签2
    string endpoint,        // 被评价的端点
    string feedbackURI,     // 链下详情URI
    bytes32 feedbackHash    // 内容哈希
)
```

**评分类型示例**:
| tag1 | 含义 | 示例值 | value | decimals |
|------|------|--------|-------|----------|
| starred | 质量评分 | 87/100 | 87 | 0 |
| uptime | 在线率 | 99.77% | 9977 | 2 |
| successRate | 成功率 | 89% | 89 | 0 |
| responseTime | 响应时间(ms) | 560ms | 560 | 0 |
| tradingYield | 收益率 | -3.2% | -32 | 1 |

**关键特性**:
- ✅ 任何人可给反馈（除了Agent所有者自己）
- ✅ 反馈可撤销 (revokeFeedback)
- ✅ 支持x402支付证明整合
- ✅ 链下文件支持MCP/A2A/OASF上下文

### 1.5 Validation Registry 详解

**验证模型（可插拔）**:
```
低风险任务 (如点外卖) → 纯Reputation信号即可
高风险任务 (如医疗诊断) → 需要额外验证:
  - Stake-secured re-execution (质押重跑)
  - zkML proofs (零知识ML证明)
  - TEE oracles (可信执行环境)
  - Trusted judges (可信裁判)
```

### 1.6 与APAC FINSTAB的整合点

```
┌──────────────────────────────────────────────────────────────┐
│                   整合架构                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent执行金融操作                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────┐                                         │
│  │ APAC FINSTAB    │                                         │
│  │ Preflight API   │ → 返回 compliance_context               │
│  └────────┬────────┘                                         │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐    ┌─────────────────────┐              │
│  │ 生成Trust Score │ →  │ 写入ERC-8004        │              │
│  │ (基于合规状态)  │    │ Reputation Registry │              │
│  └─────────────────┘    └─────────────────────┘              │
│                                                              │
│  可能的tag1: "compliance_check", "jurisdiction_cleared"      │
│  可能的tag2: "HK_SFC", "SG_MAS", "JP_FSA"                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 二、x402 Protocol

### 2.1 概述

**开发者**: Coinbase Developer Platform
**状态**: 生产可用
**目的**: HTTP原生支付协议，让AI Agent能自主微支付

### 2.2 核心机制

```
HTTP 402 Payment Required (1996年定义，终于有用了)

┌─────────┐                    ┌─────────┐                 ┌────────────┐
│  Buyer  │                    │ Seller  │                 │Facilitator │
│ (Agent) │                    │ (API)   │                 │ (Coinbase) │
└────┬────┘                    └────┬────┘                 └──────┬─────┘
     │  1. GET /api/resource        │                             │
     │ ─────────────────────────────>                             │
     │                              │                             │
     │  2. 402 Payment Required     │                             │
     │     PAYMENT-REQUIRED: {...}  │                             │
     │ <─────────────────────────────                             │
     │                              │                             │
     │  3. POST /api/resource       │                             │
     │     PAYMENT-SIGNATURE: {...} │                             │
     │ ─────────────────────────────>                             │
     │                              │  4. Verify & Settle         │
     │                              │ ─────────────────────────────>
     │                              │                             │
     │                              │  5. Confirmation            │
     │                              │ <─────────────────────────────
     │                              │                             │
     │  6. 200 OK + Response        │                             │
     │ <─────────────────────────────                             │
     │                              │                             │
```

### 2.3 支付细节

**支持网络**:
- Base (eip155:8453) - Coinbase L2
- Solana

**支付资产**: 稳定币 (USDC为主)

**费用**:
- 免费层: 1,000 tx/月
- 超出后: $0.001/tx

**结算速度**: <200ms完成微支付

### 2.4 关键特性

| 特性 | 说明 |
|------|------|
| **无账户** | 无需注册、session、复杂认证 |
| **微支付友好** | 低至$0.01的支付经济可行 |
| **Machine-to-Machine** | AI Agent自主支付，无需人工干预 |
| **按调用付费** | 真正的usage-based billing |

### 2.5 x402 + ERC-8004 整合

ERC-8004规范明确提到x402整合：

```json
// ERC-8004 Agent注册文件
{
  "x402Support": true,  // 声明支持x402支付
  ...
}

// ERC-8004 Reputation反馈
{
  "proofOfPayment": {  // x402支付证明可嵌入反馈
    "fromAddress": "0x00...",
    "toAddress": "0x00...",
    "chainId": "8453",
    "txHash": "0x00..."
  }
}
```

### 2.6 与APAC FINSTAB的整合点

```
┌──────────────────────────────────────────────────────────────┐
│              x402 支付合规检查                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent A 要支付 Agent B                                      │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────┐                         │
│  │ APAC FINSTAB Preflight          │                         │
│  │                                  │                         │
│  │ 检查:                           │                         │
│  │ - Agent B 是否在制裁名单?       │                         │
│  │ - 支付金额是否触发报告义务?     │                         │
│  │ - 跨境支付是否需要额外审批?     │                         │
│  │ - 该司法管辖区是否允许?         │                         │
│  └───────────────┬─────────────────┘                         │
│                  │                                           │
│                  ▼                                           │
│  { status: "CLEAR" | "NEEDS_REVIEW" | "BLOCKED" }           │
│                                                              │
│  若CLEAR → 继续x402支付流程                                  │
│  若NEEDS_REVIEW → 提示需要人工审核                           │
│  若BLOCKED → 阻止支付，记录原因                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 三、APAC FINSTAB整合战略

### 3.1 Trust Score → ERC-8004 写入方案

**Step 1: 定义合规专用tag**

```solidity
// 建议的tag1值
tag1 = "compliance_score"   // 合规评分
tag1 = "jurisdiction_check" // 司法管辖区检查
tag1 = "aml_screen"         // AML筛查结果

// 建议的tag2值 (司法管辖区)
tag2 = "HK_SFC"
tag2 = "SG_MAS"
tag2 = "JP_FSA"
tag2 = "KR_FSC"
```

**Step 2: 设计写入流程**

```
1. Agent调用Preflight API
2. 我们生成compliance_context
3. (可选) Agent同意后，我们代写入ERC-8004
4. Agent获得链上合规记录，可被其他方验证
```

**Step 3: 商业模式**

```
Free: 只提供Preflight检查
Pro: Preflight + 链上声誉写入 ($X/write)
Enterprise: 定制tag + 批量写入 + API整合
```

### 3.2 x402 支付合规Preflight设计

**Endpoint设计**:

```python
POST /v1/preflight/payment

{
  "from_agent": "eip155:8453:0x...:123",  # ERC-8004 agent ID
  "to_agent": "eip155:8453:0x...:456",
  "amount": 1000.00,
  "currency": "USDC",
  "network": "eip155:8453",  # Base
  "purpose": "api_access"
}

# Response
{
  "preflight_id": "pf_xxx",
  "status": "CLEAR",  # | NEEDS_REVIEW | BLOCKED
  "flags": [],
  "checks_performed": [
    "sanctions_screen",
    "jurisdiction_allowed",
    "amount_threshold"
  ],
  "valid_until": "2026-03-04T03:00:00Z"
}
```

### 3.3 Launchpad合规审计场景

**Token发行前的Preflight检查**:

```python
POST /v1/preflight/token-launch

{
  "issuer_agent": "eip155:1:0x...:789",
  "token_type": "utility",
  "target_jurisdictions": ["HK", "SG"],
  "fundraise_amount": 5000000,
  "investor_restrictions": "accredited_only"
}

# Response
{
  "preflight_id": "pf_launch_xxx",
  "status": "NEEDS_REVIEW",
  "flags": [
    {
      "jurisdiction": "HK",
      "issue": "May be classified as SFC-regulated CIS",
      "reference": "SFC FAQ on Security Token"
    }
  ],
  "recommended_structure": [
    "Consider excluding HK retail investors",
    "Apply for Type 1 license if proceeding"
  ]
}
```

---

## 四、行动项

### 4.1 Sprint 3B 任务映射

| 任务 | 本研究发现 | 下一步 |
|------|------------|--------|
| ERC-8004技术规范研究 | ✅ 完成 | 更新TRACKER |
| x402 Protocol分析 | ✅ 完成 | 更新TRACKER |
| Trust Score → ERC-8004写入方案 | 已设计初稿 | 淑芬开发 |
| x402支付合规Preflight设计 | 已设计初稿 | 待细化 |
| Bankrbot/Launchpad合规需求 | 有初步场景 | 待调研具体需求 |

### 4.2 技术实现优先级

1. **高优先级**: 定义合规专用tag并提交ERC-8004社区讨论
2. **中优先级**: 实现x402 payment preflight端点
3. **中优先级**: 实现Trust Score链上写入功能
4. **低优先级**: Launchpad场景细化

### 4.3 待解决问题

1. **Gas费用**: 谁为链上写入付费？ → 可能Agent付费或我们代付+收费
2. **写入权限**: 谁有权写入声誉？ → 需要某种授权机制
3. **数据隐私**: 合规检查结果是否应该公开？ → 可能只写hash
4. **跨链**: ERC-8004是per-chain的，跨链聚合如何处理？

---

## 五、附录

### A. 关键资源

- ERC-8004规范: https://eips.ethereum.org/EIPS/eip-8004
- ERC-8004讨论: https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098
- x402文档: https://docs.cdp.coinbase.com/x402/welcome
- x402 GitHub: https://github.com/coinbase/x402

### B. 相关ERC

- ERC-721: NFT标准 (Identity Registry基础)
- EIP-712: Typed structured data hashing (签名)
- ERC-1271: Smart contract签名验证

---

*研究完成: 2026-03-04 10:35 AWST*
