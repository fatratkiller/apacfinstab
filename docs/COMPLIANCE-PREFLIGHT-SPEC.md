# Compliance Preflight - 产品规格

> AI Agent的合规预检护栏

---

## 一、产品定位

**一句话：** 在AI Agent执行任何金融操作前，提供监管风险预检查。

**类比：**
- Milady App的"Smart preflight checks"检查wallet/gas/token
- 我们的"Compliance Preflight"检查jurisdiction/license/activity

**核心价值：** 让AI Agent公司有"尽职调查"的证据，出事时有据可查。

---

## 二、API设计

### 端点

```
POST /v1/preflight/check
```

### 请求

```json
{
  "action": "execute_swap",
  "action_category": "trading",
  "parameters": {
    "from_token": "USDT",
    "to_token": "BTC",
    "amount": 10000,
    "user_jurisdiction": "HK"
  },
  "agent_id": "milady-app-001",
  "session_id": "uuid-xxx"
}
```

### 响应

```json
{
  "preflight_id": "pf_abc123",
  "timestamp": "2026-03-02T10:00:00Z",
  "status": "REVIEW_REQUIRED",
  "risk_level": "medium",
  "flags": [
    {
      "code": "HK_VASP_LICENSE",
      "severity": "high",
      "message": "香港用户交易需确认平台持有VASP牌照",
      "question": "执行此交易的平台是否持有SFC VASP牌照？"
    },
    {
      "code": "HK_RETAIL_LIMIT",
      "severity": "medium",
      "message": "香港零售投资者有交易限制",
      "question": "用户是否为专业投资者(PI)？"
    }
  ],
  "references": [
    {"source": "SFC VASP Guidelines", "section": "4.2"},
    {"source": "SFC FAQ", "item": "Q15"}
  ],
  "suggested_actions": [
    "确认平台牌照状态",
    "验证用户PI资格"
  ],
  "audit_hash": "0x..."
}
```

### 状态码

| status | 含义 |
|--------|------|
| `CLEAR` | 未发现明显风险，可执行 |
| `REVIEW_REQUIRED` | 有风险点需人工确认 |
| `HIGH_RISK` | 高风险，建议暂停 |
| `BLOCKED` | 明确违规，不应执行 |
| `UNKNOWN` | 信息不足，无法判断 |

---

## 三、核心场景

### 场景1：交易执行前

```
用户: "帮我买1万USDT的BTC"
Agent: [调用Compliance Preflight]
API返回: REVIEW_REQUIRED + flags
Agent: "执行前需确认：您使用的平台是否持有香港VASP牌照？"
```

### 场景2：产品发布前

```
Agent: "准备在香港发布staking产品"
API返回: HIGH_RISK + flags
Agent: "检测到高风险：staking可能被SFC视为受监管活动，需先获得牌照批准"
```

### 场景3：跨境操作

```
Agent: "从新加坡向香港用户推广VASP服务"
API返回: REVIEW_REQUIRED + flags
Agent: "跨境合规提醒：香港SFC对境外VASP有持牌要求"
```

---

## 四、差异化卖点

| 竞品做法 | 我们的做法 |
|----------|-----------|
| 返回 true/false | 返回 flags + questions |
| 做判断 | 苏格拉底式提问 |
| 无审计 | preflight_id + audit_hash 可追溯 |
| 通用规则 | 场景化、地区化规则 |

**核心差异：我们不替你判断，我们帮你问对问题。**

---

## 五、商业模式

### 定价

| 层级 | 调用量 | 月费 |
|------|--------|------|
| Starter | 1,000次/月 | 免费 |
| Growth | 10,000次/月 | $99 |
| Scale | 100,000次/月 | $499 |
| Enterprise | 无限 | 联系销售 |

### 增值服务

- **Audit Report**: 月度合规检查报告 +$49
- **Custom Rules**: 自定义规则配置 +$199
- **On-chain Proof**: 检查结果上链存证 +$99

---

## 六、技术实现

### Phase 1 (MVP)

- [ ] 基础API端点
- [ ] HK场景规则（VASP、稳定币、零售限制）
- [ ] preflight_id生成和存储
- [ ] 调用日志记录

### Phase 2

- [ ] SG、JP场景规则
- [ ] 跨境场景检测
- [ ] 批量检查端点

### Phase 3

- [ ] On-chain audit hash
- [ ] Webhook回调
- [ ] SDK (Python/JS)

---

## 七、GTM策略

### 目标客户

1. **AI Agent项目** (Milady App, elizaOS生态)
2. **Crypto交易Bot** (需要合规护栏)
3. **DeFi协议** (跨境合规需求)

### 推广渠道

1. elizaOS社区 / AI Agent论坛
2. 与Agent项目BD合作
3. 案例研究：展示preflight如何避免合规风险

### 首批目标

- [ ] 联系Milady App团队
- [ ] 在elizaOS Discord发帖介绍
- [ ] 写一篇"Why AI Agents Need Compliance Preflight"博客

---

## 八、与现有产品整合

```
现有: Context API (情境感知)
      ↓
新增: Preflight API (操作前预检)
      ↓
未来: Report Outcome API (结果反馈)
```

**三者形成闭环：**
1. Context API: Agent了解监管环境
2. Preflight API: 执行前风险检查
3. Report Outcome API: 执行后结果反馈 → 改进未来预检

---

*Created: 2026-03-02*
