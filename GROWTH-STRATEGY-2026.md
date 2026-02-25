# APAC FINSTAB 2026流量增长策略

> **目标：月UV 30,000 by 2026-03-25**
> 策略调整时间：2026-02-25

---

## 🎯 优先级排序

| 优先级 | 策略 | 预期贡献 | 执行难度 |
|--------|------|----------|----------|
| **P0** | GEO (AI搜索优化) | 🔥🔥🔥 高 | 中 |
| **P1** | pSEO (规模化页面) | 🔥🔥🔥 高 | 中 |
| **P1** | DR提升 (目录提交) | 🔥🔥 中 | 低 |
| **P1** | LinkedIn (重点平台) | 🔥🔥🔥 高 | 中 |
| **P2** | X/Twitter | 🔥🔥 中 | 低 |
| **P3** | Medium/Substack | 🔥 辅助 | 低 |

---

## 📣 社交平台策略

### 🥇 LinkedIn (最高优先级)
**为什么重点做LinkedIn：** 全球企业/机构/非营利组织/监管机构/从业者最多的平台

**执行计划：**
- 每日发帖1条（政策解读/行业洞察）
- 互动评论（在KOL帖子下）
- 建立行业连接（合规官、监管人员、律师）
- 文章republish（从博客同步）

**内容方向：**
- 政策更新速报
- 地区对比分析
- 合规建议
- 行业趋势

### 🥈 X/Twitter
- 每日1条带链接
- Crypto圈热点跟进
- 与KOL互动

### 🥉 Medium/Substack
- 每周1-2篇深度文章
- SEO长尾流量
- 邮件订阅积累

---

## 🤖 P0: GEO (Generative Engine Optimization)

**目标：让AI搜索引擎引用APAC FINSTAB数据**

### 已完成
- [x] 结构化JSON数据 (policy-events.json)
- [x] WebMCP manifest
- [x] MCP Server设计

### 待执行
- [ ] **MCP Server部署到Cloudflare** — 让Agent能调用
- [ ] **提交到MCP工具目录** — Smithery、MCP Hub等
- [ ] **优化数据格式for AI** — FAQ式、问答式结构
- [ ] **Schema.org标记增强** — 帮助AI理解页面结构
- [ ] **测试AI搜索引用** — Perplexity、ChatGPT、Claude搜索

### GEO内容策略
- 每个页面开头用问答形式
- 关键数据用结构化格式
- 提供"AI-friendly"的摘要

---

## 📊 P1: pSEO (Programmatic SEO)

**核心逻辑：模板 × 结构化数据 × 自动化 = 规模化流量**

### 可规模化的主题矩阵

| 维度1 | 维度2 | 页面数 | 示例URL |
|-------|-------|--------|---------|
| 地区(12) | 主题(8) | 96页 | /hk/stablecoin-regulation/ |
| 地区(12) | 实体(10) | 120页 | /sg/binance-compliance/ |
| 主题(8) | 年份(3) | 24页 | /exchange-licensing/2026/ |

**潜在页面数：200+ 长尾关键词页面**

### 目标长尾关键词

**蓝海词（低竞争）：**
- "Hong Kong VASP license requirements 2026"
- "Singapore MAS crypto regulation update"
- "South Korea crypto exchange shareholder cap"
- "Japan stablecoin issuer license"
- "Australia ASIC crypto regulation"
- "[地区] + [主题] + regulation + 2026"

### 页面模板设计

```
/regions/{region}/
├── index.html          # 地区概览
├── exchanges.html      # 交易所监管
├── stablecoins.html    # 稳定币监管
├── licensing.html      # 牌照要求
└── timeline.html       # 政策时间线

/topics/{topic}/
├── index.html          # 主题概览
├── by-region.html      # 按地区对比
└── timeline.html       # 发展时间线
```

### 技术实现
- 数据源：policy-events.json + region-overviews.json
- 模板引擎：静态生成 (Hugo/11ty) 或 动态渲染
- 自动化：每周根据新数据更新页面
- **关键：每页必须有独特信息增量，不是伪原创**

---

## 🔗 P1: DR提升 (Domain Rating)

**逻辑：DR越高 → 搜索排名越高 → 流量越多**

### 目录网站提交计划

**免费目录（每天提交2-3个）：**
- [ ] Product Hunt
- [ ] Betalist
- [ ] AlternativeTo
- [ ] Slant
- [ ] G2
- [ ] Capterra
- [ ] SourceForge
- [ ] SaaSHub
- [ ] GetApp
- [ ] Software Advice

**Crypto/Fintech专业目录：**
- [ ] DeFi Pulse
- [ ] DappRadar
- [ ] State of the DApps
- [ ] CoinGecko Learn
- [ ] Messari

**付费批量提交（一次性）：**
- 考虑服务如 Submitjuice、Directory Maximizer
- 一次提交100+目录

### DR追踪
- 当前DR: [待查]
- 目标DR: 30+ (3个月内)
- 追踪工具: Ahrefs / Moz

---

## 🔄 P2: IFTTT自动化

**定位：辅助曝光，不是主力增长**

### 设置的Applet
- [ ] Ghost博客 → Twitter
- [ ] Ghost博客 → LinkedIn
- [ ] Ghost博客 → Medium
- [ ] 新Dashboard → Telegram频道

---

## 📅 执行时间表

### 本周 (2/25 - 3/3)
- [ ] MCP Server部署
- [ ] 开始目录提交（每天2-3个）
- [ ] pSEO模板设计

### 下周 (3/3 - 3/10)
- [ ] pSEO第一批页面上线（地区页）
- [ ] 提交到MCP工具目录
- [ ] 继续目录提交

### 第三周 (3/10 - 3/17)
- [ ] pSEO第二批页面（主题页）
- [ ] GEO效果评估
- [ ] DR检查

### 第四周 (3/17 - 3/25)
- [ ] 全渠道冲刺
- [ ] 达成30,000 UV目标

---

## 📊 KPI追踪

| 指标 | 当前 | 周目标 | 月目标 |
|------|------|--------|--------|
| UV | 3,650 | +50%/周 | 30,000 |
| DR | ? | +5/周 | 30+ |
| 索引页面数 | ~20 | +50/周 | 200+ |
| AI引用次数 | 0 | 开始追踪 | 可追踪 |

---

*创建时间: 2026-02-25*
*核心原则: GEO优先，pSEO规模化，DR持续提升*
