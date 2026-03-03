# MCP安全生态竞对分析

> 2026-03-03 | 志玲

---

## 一、MCP安全事件时间线 (2025年4月-至今)

**关键发现：MCP安全问题已经爆发，不是"可能会有"，是"已经发生了"。**

| 时间 | 事件 | 影响 | 攻击类型 |
|------|------|------|----------|
| **2025.04** | WhatsApp MCP Exfiltration | 整个聊天记录泄漏 | Tool Poisoning |
| **2025.05** | GitHub MCP Prompt Injection | 私有仓库数据泄漏到公开PR | Prompt Injection |
| **2025.06** | Asana MCP Cross-Tenant | 跨租户数据可见 | 访问控制缺陷 |
| **2025.06** | Anthropic MCP Inspector RCE | 开发者工作站被完全控制 | 未认证RCE |
| **2025.07** | mcp-remote OS Injection (CVE-2025-6514) | 43.7万下载量，供应链后门 | 命令注入 |
| **2025.08** | Anthropic Filesystem MCP沙箱逃逸 | 任意文件访问 | 沙箱绕过 |
| **2025.09** | 恶意Postmark MCP Server | 所有邮件被BCC到攻击者 | 供应链攻击 |
| **2025.10** | Smithery Registry供应链攻击 | 3000+ MCP server被控制 | 路径遍历+供应链 |
| **2025.10** | Figma MCP RCE (CVE-2025-53967) | 任意命令执行 | 命令注入 |

**总结：9个月内至少9起重大安全事件。**

---

## 二、攻击模式分类

| 模式 | 描述 | 代表事件 |
|------|------|----------|
| **Tool Poisoning** | 恶意MCP server修改工具描述，诱导AI执行恶意操作 | WhatsApp |
| **Prompt Injection** | 通过自然语言注入控制AI调用MCP | GitHub |
| **Over-privileged Tokens** | OAuth token权限过大，一旦泄漏影响面巨大 | GitHub, Smithery |
| **供应链攻击** | 恶意包/registry被污染 | Postmark, Smithery |
| **沙箱逃逸** | MCP server突破隔离访问宿主 | Anthropic Filesystem |
| **跨租户访问** | 多租户隔离失效 | Asana |

---

## 三、现有玩家分析

### A. 安全研究机构（发现问题，不卖产品）

| 机构 | 贡献 | 商业化 |
|------|------|--------|
| **Invariant Labs** | 发现WhatsApp、GitHub MCP漏洞 | 无（研究为主） |
| **GitGuardian** | 发现Smithery供应链攻击 | Secret scanning产品（不专注MCP） |
| **Cymulate** | 发现Anthropic沙箱逃逸 | 攻击面管理（不专注MCP） |

**结论：都是安全研究公司，顺手发现MCP问题，没有专门做MCP合规/治理产品。**

### B. 现有安全厂商

| 厂商 | 可能的MCP布局 | 差距 |
|------|---------------|------|
| **Pillar Security** | 写过MCP安全分析博客 | 目前无MCP产品 |
| **eSentire** | 写过CISO指南 | MDR厂商，不专注MCP |
| **Palo Alto Unit42** | 研究MCP prompt injection | 企业安全，不做单独MCP工具 |
| **Red Hat** | 写过MCP安全控制指南 | 平台厂商，不做单独产品 |

**结论：大厂都在"观察和分析"阶段，没有推出专门的MCP治理产品。**

### C. API Gateway/DevSecOps厂商

| 厂商 | 状态 | 预测 |
|------|------|------|
| **Kong/Apigee** | 无MCP支持 | 可能6-12个月后支持 |
| **DataDog/Splunk** | 无MCP专门监控 | 可能加入日志收集 |
| **Snyk/Checkmarx** | 无MCP供应链扫描 | 可能加入npm审计 |

**结论：传统DevSecOps厂商还没动，但迟早会进入。我们的窗口期是6-12个月。**

---

## 四、市场空白分析

### 目前没人做的事情：

| 空白 | 描述 | 我们的机会 |
|------|------|-----------|
| **MCP连接发现** | "你的环境里接了哪些MCP server？" | ⭐⭐⭐⭐⭐ |
| **Token权限审计** | "这个MCP server请求的权限是否过大？" | ⭐⭐⭐⭐ |
| **调用日志** | "过去7天MCP调用了什么？" | ⭐⭐⭐⭐⭐ |
| **供应链风险评估** | "这个MCP包是否可信？" | ⭐⭐⭐ |
| **监管报告** | "给SFC/MAS的MCP使用报告" | ⭐⭐⭐⭐⭐ **独占** |

**最大差异化：监管报告。技术厂商不懂SFC要什么，这是我们的护城河。**

---

## 五、竞争定位

```
                    技术深度
                        │
        Palo Alto       │     
        Cymulate        │     [我们的目标位置]
                        │            ↗
        GitGuardian     │
                        │
        eSentire        │     Pillar Security
                        │
────────────────────────┼────────────────────────
                        │              监管理解
        Kong            │
        DataDog         │
                        │
                        │
```

**我们的定位：高监管理解 + 中等技术深度**

不需要比Palo Alto技术更强，需要比他们更懂SFC/MAS要什么。

---

## 六、MVP功能与竞品对比

| 功能 | GitGuardian | DataDog | Pillar | **我们** |
|------|-------------|---------|--------|----------|
| MCP连接发现 | ❌ | ❌ | ❌ | ✅ |
| 调用日志 | ❌ | ⚠️ 通用日志 | ❌ | ✅ MCP专用 |
| 风险评分 | ⚠️ Secret only | ❌ | ❌ | ✅ |
| Token审计 | ⚠️ Secret扫描 | ❌ | ❌ | ✅ |
| **监管报告** | ❌ | ❌ | ❌ | ✅ **独占** |

---

## 七、验证假设

基于以上分析，我们需要验证的假设：

| # | 假设 | 验证方法 |
|---|------|----------|
| 1 | 金融机构CTO/CISO担心MCP安全 | 博客发布后看反馈 |
| 2 | "不知道接了什么MCP"是真实痛点 | 早期用户访谈 |
| 3 | 监管会要求MCP披露 | 持续跟踪SFC/MAS政策 |
| 4 | 愿意付$800/月 | waitlist后询问预算 |

---

## 八、行动建议

### 立即行动（本周）

1. **写博客：** "MCP Security in Financial Services: What CISOs Need to Know"
   - 不提我们有产品
   - 纯分析+趋势+监管预测
   - 底部放email收集

2. **MVP Spec：** 基于空白分析调整功能优先级
   - P0: 连接发现 + 调用日志
   - P1: 风险评分
   - P2: 监管报告模板

### 中期（2-4周）

3. **技术调研：** Sidecar如何获取MCP调用数据
   - Hook MCP client？
   - 代理模式？
   - 日志收集？

4. **GTM：** 
   - LinkedIn发文（CTO/CISO受众）
   - 金融行业安全社区（ISACA HK？）

---

## 九、结论

**窗口期确认：6-12个月**

- 技术厂商还在观望
- 大厂没有专门产品
- 监管还没强制要求
- 但MCP安全事件已经在发生

**我们的优势：**
- 监管知识（SFC/MAS）
- 金融行业focus
- 速度（小团队，快速迭代）

**风险：**
- 大厂可能突然进入
- 监管可能比预期慢
- 市场教育成本

**下一步：先发博客建立话语权，同时build MVP。**

---

*完成于 2026-03-03*
