# APAC FINSTAB Tickets

> Decision → Ticket → Track → CI/CD → Done

---

## 📋 Ticket状态说明

| 状态 | 含义 |
|------|------|
| 🔴 TODO | 待执行 |
| 🟡 IN_PROGRESS | 执行中 |
| 🟢 DONE | 已完成 |
| ⏸️ BLOCKED | 阻塞（需老板操作） |

---

## 🎫 Active Tickets

### TICKET-001: pSEO第二批页面（主题页）
- **状态:** 🟢 DONE
- **来源:** 2026-02-25 策略会议
- **描述:** 生成主题维度的pSEO页面（Stablecoin/Exchange/ETF等）
- **验收标准:** 8个主题页面上线 + sitemap更新
- **完成时间:** 2026-02-26 10:16
- **产出:** 8个主题页面（stablecoin/exchange/etf/defi/custody/taxation/cbdc/licensing） + sitemap.xml修复更新

### TICKET-002: MCP Server部署到Cloudflare
- **状态:** 🔴 TODO
- **来源:** 2026-02-25 GEO策略
- **描述:** 部署MCP Server让AI Agent能调用
- **验收标准:** WebMCP可访问 + 测试通过
- **截止:** 2026-02-28

### TICKET-003: 提交到MCP工具目录
- **状态:** 🔴 TODO
- **来源:** 2026-02-25 GEO策略
- **描述:** 提交到Smithery、MCP Hub等目录
- **依赖:** TICKET-002
- **验收标准:** 至少2个目录收录
- **截止:** 2026-03-03

### TICKET-004: Product Hunt发布
- **状态:** ⏸️ BLOCKED
- **来源:** 2026-02-25 平台策略
- **描述:** 在Product Hunt发布APAC FINSTAB
- **阻塞原因:** 需老板注册PH账号
- **验收标准:** PH页面上线
- **截止:** 待定

### TICKET-005: Indie Hackers发帖
- **状态:** ⏸️ BLOCKED
- **来源:** 2026-02-25 平台策略
- **描述:** 在IH发布介绍帖
- **阻塞原因:** 需老板注册IH账号
- **验收标准:** 帖子发布
- **截止:** 待定

### TICKET-006: Dev.to技术文章
- **状态:** ⏸️ BLOCKED
- **来源:** 2026-02-25 平台策略
- **描述:** 发布技术文章介绍APAC FINSTAB
- **阻塞原因:** 需老板注册Dev.to账号
- **验收标准:** 文章发布
- **截止:** 待定

### TICKET-007: GSC手动提交新页面索引
- **状态:** ⏸️ BLOCKED
- **来源:** 2026-02-25 SEO策略
- **描述:** 在Google Search Console提交新页面
- **阻塞原因:** 需老板操作GSC
- **验收标准:** 新页面提交请求已发送
- **截止:** 待定

### TICKET-008: IFTTT自动化配置
- **状态:** ⏸️ BLOCKED
- **来源:** 2026-02-25 自动化策略
- **描述:** 配置Ghost→LinkedIn/Medium/Telegram
- **阻塞原因:** 需老板在IFTTT配置
- **验收标准:** Applet创建并测试通过
- **截止:** 待定

### TICKET-009: 🔥 监管情境感知API设计文档
- **状态:** 🟢 DONE
- **来源:** 2026-02-26 产品定位讨论
- **优先级:** P0
- **描述:** 设计check_compliance_context() API规格
- **验收标准:** 
  - ✅ API接口定义完成 (Request/Response TypeScript接口)
  - ✅ confidence计算逻辑文档 (三层置信度 + 调整因子)
  - ✅ flags生成规则文档 (5类触发逻辑)
  - ✅ 示例响应文档 (香港稳定币发行完整示例)
- **完成时间:** 2026-02-26 14:12
- **产出:** `docs/api/check-compliance-context.md` (10KB完整API设计文档)

### TICKET-010: 置信度计算规则库
- **状态:** 🔴 TODO
- **来源:** 2026-02-26 产品定位讨论
- **依赖:** TICKET-009
- **描述:** 建立规则类型→置信度的映射规则
- **验收标准:**
  - 硬规则(0.9-1.0)分类完成
  - 阈值规则(0.8-0.95)分类完成
  - 原则性规则(0.5-0.7)分类完成
  - 至少覆盖香港SFC主要规则
- **截止:** 2026-03-03

---

## ✅ Completed Tickets

### TICKET-009: 监管情境感知API设计文档
- **状态:** 🟢 DONE
- **完成时间:** 2026-02-26 14:12
- **产出:** `docs/api/check-compliance-context.md` — 完整API规格文档，包含:
  - TypeScript接口定义 (Request/Response)
  - 置信度三层计算模型 (hard 0.9-1.0 / threshold 0.8-0.95 / principle 0.5-0.7)
  - 5类Flag触发规则
  - 香港稳定币发行完整示例响应

### TICKET-001: pSEO第二批页面（主题页）
- **状态:** 🟢 DONE
- **完成时间:** 2026-02-26 10:16
- **产出:** 8个主题页面（stablecoin/exchange/etf/defi/custody/taxation/cbdc/licensing） + sitemap.xml更新
- **页面URL:** /topics/{topic}.html

### TICKET-000: pSEO第一批页面（地区页）
- **状态:** 🟢 DONE
- **完成时间:** 2026-02-25
- **产出:** 12个地区页面 + 内链 + sitemap更新

---

## 📊 Dashboard

| 状态 | 数量 |
|------|------|
| 🔴 TODO | 3 |
| 🟡 IN_PROGRESS | 0 |
| 🟢 DONE | 3 |
| ⏸️ BLOCKED | 5 |

**🔥 下一优先执行:** TICKET-010 (置信度计算规则库) — 依赖TICKET-009已完成，可以开始

---

*最后更新: 2026-02-26 14:12*
