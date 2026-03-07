# DEEP Funding Application - APAC FINSTAB

> 准备日期: 2026-03-07  
> 目标: Deep Funding Round or RFP  
> 申请金额: $30,000 - $50,000 (分milestone)

---

## 📋 项目信息

### 项目名称
**APAC FINSTAB - Regulatory Reasoning Layer for Decentralized AI Agents**

### 一句话描述
> Enabling AI agents to understand **WHY** they are (or aren't) compliant with financial regulations across 12 APAC jurisdictions.

### 项目链接
- **Website**: https://apacfinstab.com
- **GitHub**: https://github.com/fatratkiller/apacfinstab
- **MCP Server**: https://apacfinstab.kyleleo2018.workers.dev

---

## 🎯 问题陈述

### 当前问题
现有的AI合规工具只回答"YES/NO"问题（如KYC检查），但无法解释：
- **为什么**某个操作不合规
- **哪条法规**被触发
- **怎样调整**才能合规

### 具体场景
1. DeFi协议想进入香港市场 → 不知道SFC的Type 1/7牌照要求
2. AI Agent想自动执行跨境交易 → 不知道各地AML/CFT义务
3. 稳定币发行商想覆盖APAC → 不知道各地储备金要求差异

### 为什么现在很重要
- ASI Alliance推动AGI发展，AGI需要在真实世界运行
- 金融是高监管领域，AGI必须懂监管逻辑
- APAC是全球最复杂的多司法管辖区，需要专门知识层

---

## 💡 解决方案

### 产品定位
**"Regulatory Reasoning Engine"** — 不是另一个KYC工具，是监管逻辑推理引擎

### 核心能力

1. **Jurisdiction Lookup**
   - 覆盖12个APAC地区
   - 监管机构、牌照类型、申请流程

2. **Compliance Reasoning**
   - 基于活动类型、实体类型、规模判断
   - 返回confidence score + 触发的具体法规
   - 苏格拉底式追问逻辑

3. **License Comparison**
   - 跨地区成本/时间/要求对比
   - 帮助agent做出最优选址决策

### 技术架构
```
[AI Agent] → [MCP Protocol] → [APAC FINSTAB API]
                                    ↓
                             [Regulatory Knowledge Graph]
                                    ↓
                             [Reasoning Engine]
                                    ↓
                             [Confidence + Citations]
```

---

## 🔗 与SingularityNET/ASI的契合

### 直接价值
1. **让AI Agent更可信** — 提供监管推理能力，减少合规风险
2. **AGI-Ready** — MCP协议原生，任何Agent都能调用
3. **开源知识** — 监管规则库公开，促进beneficial AI

### 潜在集成
- SingularityNET AI Marketplace: 作为合规层服务上架
- AI Publisher: 让用户查询APAC监管状态
- 与其他金融AI Agent协作

---

## 📅 Milestone Plan

### Milestone 1: Foundation (Month 1-2)
**资金请求**: $10,000

**交付物**:
- [ ] 完整的12地区监管规则知识图谱
- [ ] API v1.0: jurisdiction_lookup + basic_compliance_check
- [ ] 集成测试套件
- [ ] 文档 + 示例代码

**验收标准**:
- API可公开访问
- 覆盖12个APAC地区的核心规则
- 响应时间 <500ms

### Milestone 2: Reasoning Engine (Month 3-4)
**资金请求**: $15,000

**交付物**:
- [ ] Confidence scoring system (hard/threshold/principle rules)
- [ ] Flag generation logic (5类风险标志)
- [ ] Multi-factor reasoning (活动×实体×规模)
- [ ] Citation system (每个判断引用具体法条)

**验收标准**:
- Confidence score准确率 >80%
- 每个判断有法规citation
- 覆盖主要合规场景

### Milestone 3: Integration & Adoption (Month 5-6)
**资金请求**: $15,000

**交付物**:
- [ ] SingularityNET Marketplace listing
- [ ] 与3个AI Agent项目的集成demo
- [ ] 用户文档 + tutorial videos
- [ ] 社区反馈收集 + v2迭代

**验收标准**:
- Marketplace上架并有调用
- 3个demo集成完成
- 社区反馈报告

---

## 👥 团队

### Core Contributor
- **Kyle (fatratkiller)** — 技术架构、监管研究、产品设计
  - 背景: 跨境电商经验，熟悉APAC多地区运营
  - AI治理研究兴趣

### AI Collaborator
- **志玲 (TechMate)** — 自动化执行、文档生成、CI/CD
  - Clawdbot-based AI agent
  - 负责pSEO、内容生成、grant申请准备

---

## 📊 当前进展

### 已完成
- ✅ MCP Server部署 (Cloudflare Workers)
- ✅ 30+ pSEO页面 (地区/主题/对比)
- ✅ Compliance reasoning API设计文档
- ✅ 香港置信度规则库 (31条规则)
- ✅ GitLab CI/CD配置

### 下一步
- ⏳ 完善其他11个地区的规则库
- ⏳ 实现reasoning engine
- ⏳ 社区集成

---

## 💰 资金使用计划

| 用途 | 金额 | 说明 |
|------|------|------|
| 规则库构建 | $15,000 | 12地区法规研究、知识图谱构建 |
| 工程开发 | $15,000 | API、reasoning engine、测试 |
| 运营成本 | $5,000 | 服务器、域名、监控 |
| 社区建设 | $5,000 | 文档、教程、推广 |
| **总计** | **$40,000** | |

---

## 🔗 相关链接

- **Live Demo**: https://apacfinstab.com
- **GitHub**: https://github.com/fatratkiller/apacfinstab
- **API Docs**: https://apacfinstab.com/docs/
- **API Design**: [check-compliance-context.md](../api/check-compliance-context.md)
- **Rules Library**: [confidence-rules-hk.md](../rules/confidence-rules-hk.md)

---

## 📝 申请步骤 (需老板操作)

1. [ ] 访问 https://deep-projects.ai/ 并注册账号
2. [ ] 查看当前活跃的RFPs或Rounds
3. [ ] 选择最匹配的类别提交
4. [ ] 使用上述材料填写申请表

---

*准备日期: 2026-03-07 08:00 (Perth)*
