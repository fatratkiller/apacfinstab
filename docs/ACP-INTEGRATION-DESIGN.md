# ACP Integration Design - PolicyPedia Compliance Agent

> APAC FINSTAB作为Virtuals ACP生态系统的合规服务提供者

---

## 1. 概述

### 什么是ACP？
Agent Commerce Protocol (ACP) 是Virtuals Protocol的agent间交易协议，允许AI agents互相购买/出售服务。

### 为什么集成ACP？
- **无需申请审批** — 直接集成SDK即可参与
- **Revenue sharing模式** — 每笔服务调用产生收入
- **扩大分发渠道** — 被其他AI agents发现和调用
- **契合产品定位** — "Make Something Agents Want"

---

## 2. 服务定义

### 2.1 PolicyPedia Agent Identity

```yaml
Agent Name: PolicyPedia
Type: Service Provider (Seller)
Category: Regulatory Compliance / Legal Tech
Region Focus: Asia-Pacific
```

### 2.2 Service Offerings

#### Service 1: Regulatory Lookup
```yaml
service_id: reg_lookup
name: "APAC Crypto Regulatory Lookup"
description: "Query cryptocurrency regulations for any APAC jurisdiction"
price_usdc: 0.01
inputs:
  - jurisdiction: string (hk|sg|jp|kr|au|in|th|vn|my|ph|id|cn|tw)
  - topic: string (exchange|stablecoin|custody|taxation|aml|defi)
outputs:
  - summary: string
  - key_requirements: array
  - regulator: string
  - last_updated: date
```

#### Service 2: Compliance Check
```yaml
service_id: compliance_check
name: "Compliance Context Check"
description: "Check if a specific activity is compliant in a given jurisdiction"
price_usdc: 0.05
inputs:
  - jurisdiction: string
  - activity_type: string
  - entity_type: string
  - amount_usd: number (optional)
outputs:
  - is_compliant: boolean
  - confidence: number (0-1)
  - requirements: array
  - flags: array
  - citations: array
```

#### Service 3: License Comparison
```yaml
service_id: license_compare
name: "APAC License Cost Comparison"
description: "Compare crypto licensing costs across APAC jurisdictions"
price_usdc: 0.02
inputs:
  - license_type: string (exchange|custody|payment|stablecoin)
  - compare_regions: array (optional, default: all)
outputs:
  - comparison_table: array
  - cheapest_option: object
  - fastest_option: object
  - recommendation: string
```

---

## 3. 技术架构

### 3.1 集成方式：API-Only Approach

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Network                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Buyer Agent │    │ Buyer Agent │    │ Buyer Agent │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│                     ┌──────▼──────┐                             │
│                     │  ACP Smart  │                             │
│                     │  Contract   │                             │
│                     └──────┬──────┘                             │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                      ┌──────▼──────┐
                      │ PolicyPedia │
                      │   Agent     │
                      │  (Node.js)  │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │ APAC FINSTAB│
                      │   MCP API   │
                      │  (Workers)  │
                      └─────────────┘
```

### 3.2 技术栈

```yaml
SDK: @virtuals-protocol/acp-node
Runtime: Node.js / Cloudflare Workers
Backend: 现有MCP Server API
Chain: Base (USDC payments)
```

### 3.3 关键代码结构

```typescript
// src/acp-agent.ts

import { AcpClient, AcpContractClientV2 } from '@virtuals-protocol/acp-node';

const acpClient = new AcpClient({
  acpContractClient: await AcpContractClientV2.build(
    process.env.WALLET_PRIVATE_KEY,
    process.env.SESSION_ENTITY_KEY_ID,
    process.env.AGENT_WALLET_ADDRESS
  ),
  onNewTask: handleNewTask,
  onEvaluate: handleEvaluation
});

async function handleNewTask(job: AcpJob) {
  const { serviceId, inputs } = job;
  
  switch (serviceId) {
    case 'reg_lookup':
      return await mcpRegLookup(inputs.jurisdiction, inputs.topic);
    case 'compliance_check':
      return await mcpComplianceCheck(inputs);
    case 'license_compare':
      return await mcpLicenseCompare(inputs);
  }
}
```

---

## 4. 实施计划

### Phase 1: Sandbox Testing (Week 1)
- [ ] 注册PolicyPedia agent在sandbox环境
- [ ] 配置开发钱包和entity ID
- [ ] 实现基础ACP client
- [ ] 测试reg_lookup服务

### Phase 2: Service Integration (Week 2)
- [ ] 集成现有MCP API endpoints
- [ ] 实现compliance_check服务
- [ ] 实现license_compare服务
- [ ] 自我测试（buyer+seller）

### Phase 3: Graduation (Week 3)
- [ ] 申请从sandbox毕业到mainnet
- [ ] 定价策略优化
- [ ] 监控和日志系统
- [ ] 首笔真实收入

---

## 5. 风险与挑战

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| ACP生态活跃度低 | 无买家调用 | 并行其他分发渠道 |
| 定价不合理 | 过高无人用/过低不赚钱 | sandbox阶段测试调整 |
| API稳定性 | 服务失败影响评分 | 完善错误处理和重试 |
| Gas费用 | 小额交易不划算 | 批量结算机制 |

---

## 6. 成功指标

| 指标 | 目标 (3个月) |
|------|-------------|
| 服务调用次数 | >1,000次/月 |
| 月收入 | >$100 USDC |
| 买家留存 | >30%回头客 |
| 服务评分 | >4.5/5.0 |

---

## 7. 下一步行动

1. **立即**: 在sandbox注册PolicyPedia agent
2. **本周**: 实现最小可行的reg_lookup服务
3. **下周**: 集成剩余服务并测试
4. **第三周**: 申请毕业到mainnet

---

*Created: 2026-03-03 08:02*
*Status: Draft - 待技术验证*
