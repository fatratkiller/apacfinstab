# check_compliance_context() API 设计文档

> TICKET-009 | P0 | 监管情境感知API规格
> 
> 创建时间: 2026-02-26 14:10
> 状态: DRAFT

---

## 1. 概述

`check_compliance_context()` 是APAC FINSTAB的核心API，作为L1.5合规层，为AI Agent提供监管情境感知能力。

### 1.1 设计哲学

- **苏格拉底式AI**: 不给答案，只给context和flags，让Agent自己做判断
- **置信度透明**: 每个判断都带confidence score，明确告诉Agent这个判断有多可靠
- **规则溯源**: 每个flag都链接到原始法规，Agent可以追溯

---

## 2. API接口定义

### 2.1 请求格式

```typescript
interface CheckComplianceRequest {
  // 必填参数
  jurisdiction: string;          // ISO 3166-1 alpha-2 国家代码 (HK, SG, JP, KR, AU等)
  activity_type: ActivityType;   // 业务活动类型
  
  // 可选参数
  entity_type?: EntityType;      // 实体类型 (exchange, stablecoin_issuer, defi_protocol等)
  asset_class?: AssetClass[];    // 涉及资产类别
  threshold?: {                  // 金额阈值（触发不同规则）
    amount: number;
    currency: string;
  };
  user_jurisdiction?: string;    // 用户所在地（跨境场景）
  timestamp?: string;            // ISO 8601 时间戳（用于时间敏感规则）
}

// 活动类型枚举
type ActivityType = 
  | 'token_listing'           // 代币上架
  | 'stablecoin_issuance'     // 稳定币发行
  | 'exchange_operation'      // 交易所运营
  | 'custody_service'         // 托管服务
  | 'defi_protocol_launch'    // DeFi协议上线
  | 'nft_trading'             // NFT交易
  | 'payment_service'         // 支付服务
  | 'fund_management'         // 基金管理
  | 'cross_border_transfer'   // 跨境转账
  | 'retail_offering';        // 零售销售

// 实体类型枚举
type EntityType =
  | 'licensed_exchange'       // 持牌交易所
  | 'unlicensed_exchange'     // 无牌交易所
  | 'stablecoin_issuer'       // 稳定币发行方
  | 'defi_protocol'           // DeFi协议
  | 'custodian'               // 托管商
  | 'payment_provider'        // 支付服务商
  | 'fund_manager'            // 基金管理人
  | 'individual';             // 个人

// 资产类别枚举
type AssetClass =
  | 'security_token'          // 证券型代币
  | 'utility_token'           // 功能型代币
  | 'stablecoin'              // 稳定币
  | 'nft'                     // NFT
  | 'cbdc'                    // 央行数字货币
  | 'wrapped_asset'           // 包装资产
  | 'lp_token';               // LP代币
```

### 2.2 响应格式

```typescript
interface CheckComplianceResponse {
  // 基础响应
  jurisdiction: string;
  activity_type: string;
  timestamp: string;              // 查询时间
  
  // 核心输出
  overall_risk_level: RiskLevel;  // 整体风险等级
  confidence: number;             // 0.0-1.0 整体置信度
  
  // 监管flags
  flags: ComplianceFlag[];
  
  // 上下文信息
  context: {
    regulatory_body: string;      // 主管机构
    primary_legislation: string;  // 主要法规
    recent_changes: RecentChange[]; // 近期变化
    pending_consultations: Consultation[]; // 待定咨询
  };
  
  // 参考链接
  references: Reference[];
  
  // 警告
  warnings: string[];
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'prohibited';

interface ComplianceFlag {
  id: string;                     // 唯一标识符
  type: FlagType;                 // flag类型
  severity: 'info' | 'warning' | 'critical';
  confidence: number;             // 0.0-1.0 该flag的置信度
  
  title: string;                  // 简短标题
  description: string;            // 详细描述
  
  rule: {
    type: RuleType;               // 规则类型
    source: string;               // 来源法规
    section: string;              // 条款编号
    url: string;                  // 原文链接
  };
  
  action_required?: string;       // 需要采取的行动（如有）
  deadline?: string;              // 相关截止日期（如有）
}

type FlagType =
  | 'license_required'            // 需要牌照
  | 'license_optional'            // 可选牌照
  | 'registration_required'       // 需要注册
  | 'notification_required'       // 需要通知
  | 'prohibited'                  // 禁止
  | 'restricted'                  // 受限
  | 'threshold_triggered'         // 触发阈值
  | 'pending_regulation'          // 待定监管
  | 'recent_change'               // 近期变化
  | 'cross_border_implication';   // 跨境影响

type RuleType = 'hard' | 'threshold' | 'principle';
```

---

## 3. 置信度计算逻辑

### 3.1 置信度分层

| 规则类型 | 置信度范围 | 说明 |
|---------|-----------|------|
| **Hard Rules (硬规则)** | 0.90 - 1.00 | 明确的法定要求，无模糊地带 |
| **Threshold Rules (阈值规则)** | 0.80 - 0.95 | 基于金额/数量的触发规则 |
| **Principle Rules (原则性规则)** | 0.50 - 0.70 | 需要解释的原则性规定 |

### 3.2 置信度调整因素

```
base_confidence = rule_type_base_confidence

调整因子:
- recent_amendment: -0.10 (近期修订，解释可能变化)
- pending_consultation: -0.15 (待定咨询，规则可能改变)
- conflicting_guidance: -0.20 (存在冲突的指引)
- court_precedent: +0.10 (有法院判例支持)
- explicit_guidance: +0.10 (监管明确指引)
- enforcement_action: +0.15 (有执法案例支持)

final_confidence = clamp(base_confidence + adjustments, 0.1, 1.0)
```

### 3.3 示例计算

**场景**: 香港上架新稳定币

```
基础规则: Stablecoin Issuer Ordinance (草案)
规则类型: threshold (预计2025年实施)
base_confidence: 0.85

调整:
- pending_legislation: -0.20 (法案尚未通过)
- clear_hkma_guidance: +0.10 (HKMA发布咨询文件)

final_confidence: 0.75

解读: 较高置信度表明方向明确，但因法案未通过，具体细节可能调整
```

---

## 4. Flags生成规则

### 4.1 Flag触发逻辑

```python
def generate_flags(request: CheckComplianceRequest) -> List[ComplianceFlag]:
    flags = []
    
    # 1. 检查牌照要求
    license_rules = get_license_rules(request.jurisdiction, request.activity_type)
    for rule in license_rules:
        if rule.applies_to(request):
            flags.append(create_license_flag(rule))
    
    # 2. 检查禁止事项
    prohibition_rules = get_prohibition_rules(request.jurisdiction)
    for rule in prohibition_rules:
        if rule.matches(request):
            flags.append(create_prohibition_flag(rule))
    
    # 3. 检查阈值触发
    if request.threshold:
        threshold_rules = get_threshold_rules(request.jurisdiction)
        for rule in threshold_rules:
            if rule.triggered_by(request.threshold):
                flags.append(create_threshold_flag(rule))
    
    # 4. 检查跨境影响
    if request.user_jurisdiction and request.user_jurisdiction != request.jurisdiction:
        cross_border_rules = get_cross_border_rules(request.jurisdiction, request.user_jurisdiction)
        for rule in cross_border_rules:
            flags.append(create_cross_border_flag(rule))
    
    # 5. 检查时间敏感规则
    time_sensitive_rules = get_time_sensitive_rules(request.jurisdiction)
    for rule in time_sensitive_rules:
        if rule.is_relevant_at(request.timestamp or now()):
            flags.append(create_time_sensitive_flag(rule))
    
    return flags
```

### 4.2 Flag优先级排序

```
排序规则 (降序):
1. severity: critical > warning > info
2. confidence: 高 > 低
3. deadline: 近 > 远 > 无
4. rule_type: hard > threshold > principle
```

---

## 5. 示例响应

### 5.1 香港稳定币发行查询

**请求:**
```json
{
  "jurisdiction": "HK",
  "activity_type": "stablecoin_issuance",
  "entity_type": "stablecoin_issuer",
  "asset_class": ["stablecoin"],
  "threshold": {
    "amount": 50000000,
    "currency": "USD"
  }
}
```

**响应:**
```json
{
  "jurisdiction": "HK",
  "activity_type": "stablecoin_issuance",
  "timestamp": "2026-02-26T14:15:00+08:00",
  
  "overall_risk_level": "high",
  "confidence": 0.82,
  
  "flags": [
    {
      "id": "HK-STAB-001",
      "type": "license_required",
      "severity": "critical",
      "confidence": 0.90,
      "title": "Stablecoin Issuer License Required",
      "description": "Under the Stablecoin Issuer Ordinance, any entity issuing stablecoins referencing HKD or marketing to HK retail investors must obtain a license from HKMA.",
      "rule": {
        "type": "hard",
        "source": "Stablecoin Issuer Ordinance (Draft)",
        "section": "Part 2, Section 8",
        "url": "https://www.hkma.gov.hk/..."
      },
      "action_required": "Apply for HKMA Stablecoin Issuer License",
      "deadline": "2026-06-01"
    },
    {
      "id": "HK-STAB-002",
      "type": "threshold_triggered",
      "severity": "warning",
      "confidence": 0.85,
      "title": "Reserve Audit Requirement Triggered",
      "description": "Issuance exceeding USD 10M requires quarterly third-party reserve audits.",
      "rule": {
        "type": "threshold",
        "source": "HKMA Stablecoin Guidance",
        "section": "Reserve Requirements, Para 4.2",
        "url": "https://www.hkma.gov.hk/..."
      }
    },
    {
      "id": "HK-STAB-003",
      "type": "pending_regulation",
      "severity": "info",
      "confidence": 0.65,
      "title": "Cross-border Settlement Rules Pending",
      "description": "HKMA is consulting on cross-border stablecoin settlement rules. Final rules expected Q3 2026.",
      "rule": {
        "type": "principle",
        "source": "HKMA Consultation Paper",
        "section": "Cross-border Framework",
        "url": "https://www.hkma.gov.hk/..."
      }
    }
  ],
  
  "context": {
    "regulatory_body": "Hong Kong Monetary Authority (HKMA)",
    "primary_legislation": "Stablecoin Issuer Ordinance (expected 2026)",
    "recent_changes": [
      {
        "date": "2025-12-15",
        "description": "Draft Stablecoin Issuer Ordinance published for consultation"
      }
    ],
    "pending_consultations": [
      {
        "title": "Cross-border Stablecoin Settlement Framework",
        "deadline": "2026-04-30",
        "url": "https://..."
      }
    ]
  },
  
  "references": [
    {
      "title": "HKMA Stablecoin Regulatory Framework",
      "url": "https://www.hkma.gov.hk/...",
      "type": "official"
    },
    {
      "title": "APAC FINSTAB HK Stablecoin Analysis",
      "url": "https://apacfinstab.com/regions/hk.html#stablecoin",
      "type": "analysis"
    }
  ],
  
  "warnings": [
    "Regulation is in draft stage - final requirements may differ",
    "This analysis is for informational purposes only, not legal advice"
  ]
}
```

---

## 6. 错误响应

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// 错误代码
// INVALID_JURISDICTION: 不支持的司法管辖区
// INVALID_ACTIVITY: 无效的活动类型
// INSUFFICIENT_DATA: 缺少必要参数
// RATE_LIMITED: 请求过于频繁
// INTERNAL_ERROR: 内部错误
```

---

## 7. 实现优先级

### Phase 1 (MVP)
- [ ] 香港SFC/HKMA规则覆盖
- [ ] 基础API端点
- [ ] 3种核心activity_type支持

### Phase 2
- [ ] 新加坡MAS规则覆盖
- [ ] 置信度计算引擎
- [ ] 跨境场景支持

### Phase 3
- [ ] 日本、韩国、澳洲规则
- [ ] 时间敏感规则引擎
- [ ] 历史规则追溯

---

## 8. 与现有系统集成

### 8.1 数据来源
- `policy-events.json` — 政策事件数据库
- `regulatory-entities.json` — 监管机构实体
- 各司法管辖区规则库 (待建)

### 8.2 MCP Server集成
- 作为新工具添加到 `webmcp.json`
- 可被外部AI Agent通过MCP协议调用

---

*文档版本: 0.1.0*
*最后更新: 2026-02-26*
