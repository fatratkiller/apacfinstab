# 香港置信度规则库

> TICKET-010 | 置信度计算规则库 — 香港篇
> 
> 创建时间: 2026-02-26 18:01
> 依赖: TICKET-009 (check_compliance_context API设计)

---

## 1. 规则分类框架

根据API设计文档的置信度三层模型:

| 规则类型 | 置信度范围 | 特征 |
|---------|-----------|------|
| **Hard Rules** | 0.90 - 1.00 | 法定明文规定，无解释空间 |
| **Threshold Rules** | 0.80 - 0.95 | 金额/数量触发，边界清晰 |
| **Principle Rules** | 0.50 - 0.70 | 原则性规定，需要判断 |

---

## 2. 香港硬规则 (Hard Rules)

### 2.1 SFC牌照规则

| Rule ID | 规则描述 | 置信度 | 来源 |
|---------|---------|--------|------|
| `HK-SFC-001` | 经营虚拟资产交易平台须持有第1类和第7类牌照 | **0.95** | SFO Schedule 5 |
| `HK-SFC-002` | 虚拟资产基金管理须持有第9类牌照 | **0.95** | AMLO & SFC Guidelines |
| `HK-SFC-003` | 向零售投资者提供虚拟资产服务须获SFC批准 | **0.92** | VASP Regime 2023 |
| `HK-SFC-004` | 未经SFC批准不得向公众推广虚拟资产服务 | **0.95** | SFO s.103 |
| `HK-SFC-005` | 证券型代币发行须符合招股章程要求 | **0.90** | SFO Part II |

```yaml
HK-SFC-001:
  type: hard
  confidence: 0.95
  activity_types: [exchange_operation]
  entity_types: [licensed_exchange, unlicensed_exchange]
  trigger: "operating VA trading platform"
  requirement: "Type 1 + Type 7 SFC License"
  source:
    legislation: "Securities and Futures Ordinance"
    section: "Schedule 5"
    url: "https://www.elegislation.gov.hk/hk/cap571"
  enforcement_examples:
    - case: "JPEX Investigation 2023"
      outcome: "Criminal prosecution for unlicensed operation"
  adjustments:
    court_precedent: +0.05
```

### 2.2 HKMA稳定币规则 (草案)

| Rule ID | 规则描述 | 置信度 | 来源 |
|---------|---------|--------|------|
| `HK-HKMA-001` | 发行港元挂钩稳定币须获HKMA牌照 | **0.85** | Stablecoin Issuer Ordinance (Draft) |
| `HK-HKMA-002` | 稳定币发行人须维持100%储备 | **0.88** | HKMA Guidance |
| `HK-HKMA-003` | 向香港零售用户销售稳定币须注册 | **0.82** | Draft Ordinance |

```yaml
HK-HKMA-001:
  type: hard
  confidence: 0.85
  activity_types: [stablecoin_issuance]
  asset_class: [stablecoin]
  trigger: "issuing HKD-pegged stablecoin"
  requirement: "HKMA Stablecoin Issuer License"
  source:
    legislation: "Stablecoin Issuer Ordinance (Draft)"
    section: "Part 2"
    url: "https://www.hkma.gov.hk/..."
  adjustments:
    pending_legislation: -0.10  # 法案未通过
    clear_guidance: +0.05
```

### 2.3 AML/CFT规则

| Rule ID | 规则描述 | 置信度 | 来源 |
|---------|---------|--------|------|
| `HK-AML-001` | VASP须实施客户尽职调查(CDD) | **0.98** | AMLO |
| `HK-AML-002` | 可疑交易须报告JFIU | **0.98** | AMLO s.25A |
| `HK-AML-003` | 须保存交易记录至少6年 | **0.95** | AMLO |
| `HK-AML-004` | 跨境转账须遵守Travel Rule | **0.92** | FATF R.16 / AMLO |

```yaml
HK-AML-001:
  type: hard
  confidence: 0.98
  activity_types: [exchange_operation, custody_service, payment_service]
  trigger: "onboarding customer"
  requirement: "Customer Due Diligence"
  source:
    legislation: "Anti-Money Laundering and Counter-Terrorist Financing Ordinance"
    section: "Schedule 2"
    url: "https://www.elegislation.gov.hk/hk/cap615"
  adjustments:
    enforcement_action: +0.02  # JPEX案例
```

---

## 3. 香港阈值规则 (Threshold Rules)

### 3.1 金额阈值

| Rule ID | 阈值 | 触发要求 | 置信度 | 来源 |
|---------|------|---------|--------|------|
| `HK-THR-001` | HKD 8,000 | 强化CDD要求 | **0.92** | AMLO Schedule 2 |
| `HK-THR-002` | HKD 120,000 | 可疑交易报告门槛参考 | **0.80** | JFIU Guidelines |
| `HK-THR-003` | USD 10M | 稳定币季度审计要求 | **0.85** | HKMA Draft Guidance |
| `HK-THR-004` | USD 100M | 稳定币董事会审批要求 | **0.85** | HKMA Draft Guidance |

```yaml
HK-THR-001:
  type: threshold
  confidence: 0.92
  threshold:
    amount: 8000
    currency: HKD
    comparison: ">="
  trigger: "single transaction or related transactions"
  requirement: "Enhanced CDD required"
  activity_types: [exchange_operation, custody_service, payment_service]
  source:
    legislation: "AMLO"
    section: "Schedule 2, Section 2"
```

### 3.2 用户数量阈值

| Rule ID | 阈值 | 触发要求 | 置信度 | 来源 |
|---------|------|---------|--------|------|
| `HK-THR-010` | >100 零售用户 | 需申请完整VASP牌照 | **0.88** | SFC Guidelines |
| `HK-THR-011` | >10 专业投资者 | 简化注册要求 | **0.85** | SFC PI Definition |

---

## 4. 香港原则性规则 (Principle Rules)

### 4.1 适当性原则

| Rule ID | 规则描述 | 置信度 | 来源 |
|---------|---------|--------|------|
| `HK-PRI-001` | 向客户推荐VA须评估适当性 | **0.70** | SFC Code of Conduct |
| `HK-PRI-002` | 须确保VA产品"复杂性"披露充分 | **0.65** | SFC Guidelines |
| `HK-PRI-003` | 须"合理谨慎"管理客户资产 | **0.60** | Common Law + SFC |

```yaml
HK-PRI-001:
  type: principle
  confidence: 0.70
  activity_types: [exchange_operation, fund_management]
  trigger: "recommending VA products to customers"
  requirement: "Suitability assessment"
  interpretation_notes: |
    - "适当性"标准因客户类型而异
    - 专业投资者要求较低
    - 零售投资者需完整KYC+风险评估
  source:
    legislation: "SFC Code of Conduct"
    section: "Chapter 5.2"
  adjustments:
    explicit_guidance: +0.05  # SFC FAQ澄清
```

### 4.2 公平对待原则

| Rule ID | 规则描述 | 置信度 | 来源 |
|---------|---------|--------|------|
| `HK-PRI-010` | 须公平对待所有客户 | **0.55** | SFC Principles |
| `HK-PRI-011` | 利益冲突须妥善管理和披露 | **0.60** | SFC Code of Conduct |
| `HK-PRI-012` | 市场行为须符合"市场廉洁"原则 | **0.55** | SFO |

### 4.3 技术标准原则

| Rule ID | 规则描述 | 置信度 | 来源 |
|---------|---------|--------|------|
| `HK-PRI-020` | 须实施"适当"网络安全措施 | **0.65** | SFC Guidelines |
| `HK-PRI-021` | 冷钱包比例须"充足" | **0.58** | SFC FAQ (98%参考) |
| `HK-PRI-022` | 系统须具备"足够"容量和韧性 | **0.55** | SFC Guidelines |

```yaml
HK-PRI-021:
  type: principle
  confidence: 0.58
  activity_types: [custody_service, exchange_operation]
  trigger: "custody of client VA"
  requirement: "Adequate cold wallet storage"
  interpretation_notes: |
    - SFC FAQ提及98%冷钱包作为参考
    - 不是硬性要求，需综合评估
    - 考虑因素: 提款需求、安全架构
  source:
    legislation: "SFC VATP Guidelines"
    section: "Part IV"
  adjustments:
    conflicting_guidance: -0.10  # 不同从业者理解不同
```

---

## 5. 置信度调整因子库

### 5.1 正向调整 (提高置信度)

| 因子 | 调整值 | 适用条件 |
|------|--------|---------|
| `court_precedent` | +0.05 ~ +0.10 | 有法院判决支持 |
| `enforcement_action` | +0.10 ~ +0.15 | 有执法案例 (如JPEX) |
| `explicit_guidance` | +0.05 ~ +0.10 | SFC/HKMA发布明确指引 |
| `faq_clarification` | +0.03 ~ +0.05 | 官方FAQ澄清 |
| `industry_consensus` | +0.02 ~ +0.05 | 业界普遍理解一致 |

### 5.2 负向调整 (降低置信度)

| 因子 | 调整值 | 适用条件 |
|------|--------|---------|
| `pending_legislation` | -0.10 ~ -0.20 | 法案尚未通过 |
| `pending_consultation` | -0.10 ~ -0.15 | 正在咨询期 |
| `recent_amendment` | -0.05 ~ -0.10 | 近6个月修订 |
| `conflicting_guidance` | -0.10 ~ -0.20 | 指引存在冲突 |
| `no_enforcement` | -0.05 ~ -0.10 | 从未执法 |
| `international_variance` | -0.05 | 与国际标准不一致 |

---

## 6. 规则映射表

### 6.1 Activity → Rules 映射

```yaml
exchange_operation:
  hard_rules: [HK-SFC-001, HK-SFC-003, HK-SFC-004, HK-AML-001, HK-AML-002, HK-AML-003]
  threshold_rules: [HK-THR-001, HK-THR-010]
  principle_rules: [HK-PRI-001, HK-PRI-010, HK-PRI-020, HK-PRI-021]

stablecoin_issuance:
  hard_rules: [HK-HKMA-001, HK-HKMA-002, HK-HKMA-003]
  threshold_rules: [HK-THR-003, HK-THR-004]
  principle_rules: [HK-PRI-020]

custody_service:
  hard_rules: [HK-SFC-002, HK-AML-001, HK-AML-003]
  threshold_rules: [HK-THR-001]
  principle_rules: [HK-PRI-003, HK-PRI-020, HK-PRI-021]

fund_management:
  hard_rules: [HK-SFC-002, HK-SFC-005]
  threshold_rules: []
  principle_rules: [HK-PRI-001, HK-PRI-002, HK-PRI-010, HK-PRI-011]

token_listing:
  hard_rules: [HK-SFC-004, HK-SFC-005]
  threshold_rules: []
  principle_rules: [HK-PRI-002]
```

### 6.2 Entity Type → Rules 映射

```yaml
licensed_exchange:
  applicable_rules: [HK-SFC-003, HK-AML-001, HK-AML-002, HK-AML-003, HK-AML-004]
  exempted_rules: []
  enhanced_rules: [HK-PRI-001]  # 对零售客户更严格

unlicensed_exchange:
  applicable_rules: [HK-SFC-001]  # 首要问题是无牌
  critical_flags: ["license_required"]

stablecoin_issuer:
  applicable_rules: [HK-HKMA-001, HK-HKMA-002, HK-HKMA-003]
  threshold_rules: [HK-THR-003, HK-THR-004]
```

---

## 7. 使用示例

### 7.1 计算香港交易所运营置信度

```python
def calculate_confidence(activity_type: str, jurisdiction: str, context: dict) -> float:
    # 获取适用规则
    rules = get_rules_for_activity(activity_type, jurisdiction)
    
    for rule in rules:
        base = rule.base_confidence
        
        # 应用调整因子
        if context.get('recent_enforcement'):
            base += 0.10  # enforcement_action
        if context.get('pending_consultation'):
            base -= 0.15  # pending_consultation
        if context.get('sfc_faq_exists'):
            base += 0.05  # faq_clarification
            
        rule.final_confidence = clamp(base, 0.1, 1.0)
    
    # 整体置信度 = 最低单规则置信度 (保守原则)
    return min(r.final_confidence for r in rules)
```

### 7.2 查询示例输出

```json
{
  "query": {
    "jurisdiction": "HK",
    "activity_type": "exchange_operation",
    "entity_type": "unlicensed_exchange"
  },
  "applied_rules": [
    {
      "id": "HK-SFC-001",
      "type": "hard",
      "base_confidence": 0.95,
      "adjustments": [
        {"enforcement_action": "+0.05", "reason": "JPEX case 2023"}
      ],
      "final_confidence": 1.0,
      "flag": "license_required"
    }
  ],
  "overall_confidence": 1.0,
  "risk_level": "critical"
}
```

---

## 8. 待补充

- [ ] 新加坡MAS规则库
- [ ] 日本JFSA规则库
- [ ] 韩国FSC规则库
- [ ] 澳洲ASIC规则库
- [ ] 跨境规则矩阵

---

*文档版本: 0.1.0*
*最后更新: 2026-02-26 18:01*
