# MCP Compliance Sidecar — MVP技术规格

> **版本**: v1.0
> **创建日期**: 2026-03-06
> **负责人**: 志玲
> **状态**: ✅ 完成
> **Sprint**: 3 (截止 2026-03-17)

---

## 🎯 产品定位

**不是另一个MCP安全工具。**

| 维度 | 现有竞品 (Akto/Pillar/Invariant) | MCP Compliance Sidecar |
|------|----------------------------------|------------------------|
| 买家 | CTO/安全团队 | **合规官 + CTO** |
| 问题 | "有人在攻击我们的AI吗？" | **"我们的AI符合监管要求吗？"** |
| 价值 | 防攻击 | **生成合规证据** |
| 输出 | 安全告警 | **监管审计报告** |

### 核心声明

> "MCP Compliance Sidecar帮金融机构证明其AI Agent的MCP调用符合监管要求。"

---

## 📦 MVP核心功能 (3个)

### 功能1: MCP连接发现 (Discovery)

**问题**: "你的环境里有哪些MCP server？每个server有什么权限？"

**输出**:
```json
{
  "discovered_at": "2026-03-06T10:30:00Z",
  "environment": "production",
  "mcp_servers": [
    {
      "server_id": "mcp-bloomberg-data",
      "name": "Bloomberg Market Data",
      "transport": "stdio",
      "status": "connected",
      "capabilities": {
        "tools": ["query_price", "query_fundamentals", "query_news"],
        "resources": ["market_data/*", "company_profiles/*"],
        "prompts": []
      },
      "permission_level": "read-only",
      "data_sensitivity": "high",
      "compliance_flags": [
        "Contains PII (company beneficial owner data)",
        "Market-sensitive information"
      ],
      "jurisdiction_relevance": ["HK-SFC", "SG-MAS"]
    },
    {
      "server_id": "mcp-internal-crm",
      "name": "Internal CRM",
      "transport": "http",
      "status": "connected",
      "capabilities": {
        "tools": ["search_customer", "update_customer", "get_transactions"],
        "resources": ["customers/*", "transactions/*"],
        "prompts": []
      },
      "permission_level": "read-write",
      "data_sensitivity": "critical",
      "compliance_flags": [
        "PDPO applicable (HK customer PII)",
        "AMLO audit trail required"
      ],
      "jurisdiction_relevance": ["HK-PDPO", "HK-AMLO"]
    }
  ],
  "risk_summary": {
    "total_servers": 2,
    "high_sensitivity": 2,
    "write_access": 1,
    "compliance_concerns": 4
  }
}
```

**技术实现**:
1. 连接本地MCP Host（Claude Desktop、Cursor等）
2. 使用MCP Protocol的`list_tools`、`list_resources`获取能力
3. 基于tool/resource名称推断敏感度（规则引擎）
4. 映射到相关监管辖区

**MVP范围**:
- ✅ 支持stdio和http传输
- ✅ 自动发现已配置的MCP server
- ✅ 输出JSON格式发现报告
- ❌ 不做：自动修复/阻断

---

### 功能2: Call-Level审计日志 (Audit Log)

> **关键洞察 (2026-03-05)**: Session-level日志不够！监管机构需要每个tool call的详细证据。

**问题**: "每次AI调用了什么？输入输出是什么？有没有注入风险？"

**日志结构**:
```json
{
  "log_id": "log-2026030610300001",
  "timestamp": "2026-03-06T10:30:00.123Z",
  "session_id": "sess_abc123",
  "agent_id": "trading-assistant-v2",
  
  "call_details": {
    "server_id": "mcp-internal-crm",
    "tool": "get_transactions",
    "input": {
      "customer_id": "CUST-HK-88765",
      "date_range": "2026-02-01/2026-03-06"
    },
    "output": {
      "status": "success",
      "record_count": 47,
      "data_hash": "sha256:e3b0c44298fc..."
    },
    "latency_ms": 234
  },
  
  "compliance_analysis": {
    "injection_scan": {
      "status": "clean",
      "patterns_checked": ["sql_injection", "prompt_injection", "path_traversal"],
      "confidence": 0.98
    },
    "data_access": {
      "accessed_pii": true,
      "pii_types": ["customer_id", "transaction_records"],
      "purpose_declared": "portfolio_review",
      "purpose_match_confidence": 0.85
    },
    "jurisdiction_triggers": [
      {
        "code": "HK-PDPO",
        "reason": "Accessed HK customer PII",
        "action_required": "Ensure consent documented"
      }
    ]
  },
  
  "risk_assessment": {
    "overall_risk": "medium",
    "risk_factors": [
      {"factor": "pii_access", "weight": 0.4},
      {"factor": "cross_border_potential", "weight": 0.2},
      {"factor": "transaction_data_access", "weight": 0.3}
    ],
    "risk_score": 0.62
  }
}
```

**Session级别 vs Call级别对比**:

| 维度 | Session Level (竞品做法) | Call Level (我们做法) |
|------|--------------------------|----------------------|
| 颗粒度 | "Agent accessed CRM" | **"Agent queried customer CUST-HK-88765's 47 transactions"** |
| 可审计性 | ❌ 模糊 | ✅ **精确** |
| 注入检测 | ❌ Session结束后才知道 | ✅ **每次调用实时检测** |
| 合规证据 | ❌ 不够 | ✅ **监管机构可接受** |
| 回溯能力 | ❌ 只能说"用过" | ✅ **精确重放每步操作** |

**技术实现**:
1. **中间人代理模式**: Sidecar拦截MCP通信
2. **实时解析**: 解析每个JSON-RPC调用
3. **注入扫描**: 正则+ML检测常见攻击模式
4. **异步写入**: 日志写入本地文件/云存储
5. **数据脱敏**: 敏感字段可选哈希处理

**MVP范围**:
- ✅ 拦截stdio传输的MCP调用
- ✅ 记录tool调用的输入输出
- ✅ 基础注入模式检测（正则）
- ✅ 本地JSON日志文件
- ❌ 不做：ML注入检测（Phase 2）
- ❌ 不做：云端日志聚合（Phase 2）
- ❌ 不做：HTTP传输拦截（Phase 2）

---

### 功能3: 风险评分 (Risk Scoring)

**问题**: "这个AI操作的风险等级是什么？需要人工审批吗？"

**评分模型**:
```
总风险分 = Σ (因子权重 × 因子得分)

因子列表:
├── 数据敏感度 (30%)
│   ├── PII访问: +0.5
│   ├── 财务数据: +0.4
│   ├── 市场敏感信息: +0.3
│   └── 公开数据: +0.0
├── 操作类型 (25%)
│   ├── 写入/修改: +0.8
│   ├── 删除: +1.0
│   └── 只读: +0.0
├── 访问频率 (15%)
│   ├── 异常高频: +0.6
│   └── 正常: +0.0
├── 注入风险 (20%)
│   ├── 检测到可疑模式: +1.0
│   └── 清洁: +0.0
└── 监管相关性 (10%)
    ├── 涉及高监管辖区: +0.5
    └── 无特殊要求: +0.0
```

**风险等级定义**:
| 分数范围 | 等级 | 含义 | 建议操作 |
|----------|------|------|----------|
| 0.0-0.3 | 🟢 LOW | 常规操作 | 自动记录 |
| 0.3-0.6 | 🟡 MEDIUM | 需关注 | 记录+周报 |
| 0.6-0.8 | 🟠 HIGH | 敏感操作 | 实时告警 |
| 0.8-1.0 | 🔴 CRITICAL | 高风险 | 人工审批 |

**API响应**:
```json
{
  "assessment_id": "assess-2026030610300001",
  "timestamp": "2026-03-06T10:30:00Z",
  "session_id": "sess_abc123",
  
  "risk_score": 0.62,
  "risk_level": "MEDIUM",
  
  "breakdown": {
    "data_sensitivity": {"score": 0.5, "weight": 0.3, "contribution": 0.15},
    "operation_type": {"score": 0.0, "weight": 0.25, "contribution": 0.0},
    "access_frequency": {"score": 0.2, "weight": 0.15, "contribution": 0.03},
    "injection_risk": {"score": 0.0, "weight": 0.2, "contribution": 0.0},
    "regulatory_relevance": {"score": 0.5, "weight": 0.1, "contribution": 0.05}
  },
  
  "flags": [
    "PII accessed without declared purpose",
    "First access to this data category today"
  ],
  
  "recommendations": [
    "Document data access purpose for PDPO compliance",
    "Review access patterns in weekly audit"
  ],
  
  "audit_reference": "log-2026030610300001"
}
```

**MVP范围**:
- ✅ 5因子评分模型
- ✅ 4级风险分类
- ✅ 实时评分API
- ❌ 不做：机器学习异常检测（Phase 2）
- ❌ 不做：自定义评分权重（Phase 2）

---

## 🏗️ 技术架构

### 系统架构图

```
                    ┌─────────────────────────────────────────┐
                    │            MCP Host                      │
                    │   (Claude Desktop / Cursor / etc.)       │
                    └──────────────┬───────────────────────────┘
                                   │ MCP Protocol (JSON-RPC)
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                   MCP Compliance Sidecar                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Discovery  │  │ Audit Log   │  │    Risk     │              │
│  │   Module    │  │   Module    │  │   Scorer    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │  Storage  │                                 │
│                    │  (Local)  │                                 │
│                    └───────────┘                                 │
└──────────────────────────────────────────────────────────────────┘
                                   │ MCP Protocol (proxied)
                                   ▼
                    ┌─────────────────────────────────────────┐
                    │           MCP Server(s)                  │
                    │   (Bloomberg, Internal CRM, etc.)        │
                    └─────────────────────────────────────────┘
```

### 部署模式

**Phase 1 (MVP): Sidecar观察模式**

```
原始配置:
MCP Host → MCP Server

Sidecar配置:
MCP Host → Sidecar (proxy) → MCP Server
```

**为什么不做Gateway模式？**
> 金融机构不会接受流量过第三方云服务。
> Sidecar本地运行，数据不出客户环境。

### 技术栈

| 组件 | 技术选择 | 理由 |
|------|----------|------|
| Runtime | Node.js 20+ | MCP SDK原生支持 |
| MCP通信 | @modelcontextprotocol/sdk | 官方SDK |
| 日志存储 | SQLite (本地) | 零依赖，便携 |
| 配置 | JSON/YAML | 简单 |
| CLI | Commander.js | 标准工具 |

---

## 📋 MVP开发任务

### 里程碑分解

| 阶段 | 任务 | 预计工时 | 截止日期 |
|------|------|----------|----------|
| M1 | Sidecar代理框架 | 8h | 03-10 |
| M2 | Discovery模块 | 6h | 03-11 |
| M3 | Audit Log模块 | 8h | 03-13 |
| M4 | Risk Scorer模块 | 6h | 03-14 |
| M5 | CLI + 配置 | 4h | 03-15 |
| M6 | 测试 + 文档 | 4h | 03-17 |

**总计**: ~36小时

### 详细任务清单

#### M1: Sidecar代理框架
- [ ] stdio传输代理实现
- [ ] JSON-RPC消息解析
- [ ] 透明转发机制
- [ ] 配置文件解析

#### M2: Discovery模块
- [ ] list_tools调用实现
- [ ] list_resources调用实现
- [ ] capability解析
- [ ] 敏感度推断规则

#### M3: Audit Log模块
- [ ] 调用拦截hook
- [ ] 日志结构定义
- [ ] SQLite写入
- [ ] 基础注入检测（正则）

#### M4: Risk Scorer模块
- [ ] 5因子评分实现
- [ ] 风险等级分类
- [ ] 实时评分API
- [ ] 告警阈值配置

#### M5: CLI + 配置
- [ ] `sidecar start` 命令
- [ ] `sidecar discover` 命令
- [ ] `sidecar report` 命令
- [ ] 配置文件schema

#### M6: 测试 + 文档
- [ ] 单元测试
- [ ] 集成测试（mock MCP server）
- [ ] README文档
- [ ] 快速开始指南

---

## 🔧 配置示例

### sidecar-config.yaml

```yaml
# MCP Compliance Sidecar 配置
version: "1.0"

# 代理设置
proxy:
  mode: "stdio"  # stdio | http (Phase 2)
  upstream_command: ["npx", "-y", "@bloomberg/mcp-server"]
  
# 发现设置
discovery:
  auto_scan: true
  scan_interval_minutes: 60
  
# 审计日志设置
audit:
  enabled: true
  storage: "sqlite"
  database_path: "./sidecar-audit.db"
  retention_days: 90
  
  # 数据脱敏
  redaction:
    enabled: true
    patterns:
      - name: "credit_card"
        regex: "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b"
      - name: "hk_id"
        regex: "\\b[A-Z]{1,2}\\d{6}[0-9A-Z]\\b"
        
  # 注入检测
  injection_detection:
    enabled: true
    patterns:
      - sql_injection
      - prompt_injection
      - path_traversal
      
# 风险评分设置
risk_scoring:
  enabled: true
  weights:
    data_sensitivity: 0.30
    operation_type: 0.25
    access_frequency: 0.15
    injection_risk: 0.20
    regulatory_relevance: 0.10
  thresholds:
    low: 0.3
    medium: 0.6
    high: 0.8
    
# 告警设置
alerts:
  enabled: true
  channels:
    - type: "file"
      path: "./alerts.log"
    # - type: "webhook"  # Phase 2
    #   url: "https://..."
  trigger_levels:
    - "HIGH"
    - "CRITICAL"
    
# 监管映射 (APAC FINSTAB核心价值)
compliance:
  jurisdictions:
    - code: "HK-SFC"
      triggers:
        - pattern: "securities"
        - pattern: "trading"
    - code: "HK-PDPO"
      triggers:
        - pattern: "customer"
        - pattern: "personal"
    - code: "HK-AMLO"
      triggers:
        - pattern: "transaction"
        - pattern: "transfer"
```

---

## 📊 验收标准

### MVP Definition of Done

| 功能 | 验收标准 |
|------|----------|
| Discovery | 能发现至少1个MCP server并输出capabilities |
| Audit Log | 能记录tool调用的输入输出，保存到SQLite |
| Risk Score | 能输出0-1的风险分数和HIGH/MEDIUM/LOW等级 |
| CLI | `sidecar start`, `discover`, `report` 三个命令正常工作 |
| 文档 | README包含安装和快速开始 |

### 不在MVP范围

| 排除项 | 原因 | 计划阶段 |
|--------|------|----------|
| HTTP传输支持 | 复杂度高 | Phase 2 |
| ML注入检测 | 需要训练数据 | Phase 2 |
| 云端日志聚合 | 需要后端基础设施 | Phase 2 |
| Dashboard UI | MVP先验证核心价值 | Phase 2 |
| 自动阻断 | 金融机构不接受 | 可能不做 |

---

## 🔗 相关文档

- [MCP安全生态竞对分析](../research/mcp-security-competitive-analysis.md)
- [PRODUCT-TRACKER.md](../PRODUCT-TRACKER.md)
- [MCP in Financial Services Blog](../learn/mcp-financial-services.html)

---

## 📝 变更日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-03-06 | v1.0 | 初始版本 |

---

*Created by 志玲 | APAC FINSTAB*
