# Agent导航站开发路线图

> 创建日期: 2026-03-08
> 目标: 打造APAC最大的AI Agent合规评分导航站

---

## 🎯 核心流量逻辑

```
用户搜 "best DeFi trading agents" / "crypto bot comparison"
    ↓
来到我们的Agent目录页
    ↓
看到：排名、合规评分、功能对比
    ↓
点击某个agent → 详情页（带affiliate/合作链接）
    ↓
收藏/订阅更新
```

**SEO优势：**
- 关键词池大10倍（每个agent名字都是关键词）
- 用户有理由回来（比价、看新agent）
- 变现清晰：agent付费listing、affiliate、广告位

---

## 📊 当前状态

| 模块 | 状态 | 数量 |
|------|------|------|
| Agent详情页 | ✅ 已生成 | 3381个 |
| data/agents.json | ✅ 已有 | 3378条 |
| 目录页index.html | ⚠️ 需改造 | hardcode 10个 |
| 每日自动同步 | ✅ cron已设置 | 05:00 Perth |
| 比较功能 | ❌ 待开发 | - |
| 邮箱订阅 | ❌ 待开发 | - |
| Affiliate链接 | ❌ 待开发 | - |

---

## 🗓️ 4周开发计划

### Week 1: 目录页改造 (2026-03-08 ~ 03-14)

- [ ] 修改 index.html 从 agents.json 动态加载
- [ ] 实现客户端搜索和筛选
- [ ] 添加分页（每页50个）
- [ ] 热门agent置顶功能
- [ ] 响应式优化

**关键任务：**
```javascript
// 从JSON加载数据
fetch('/data/agents.json')
  .then(res => res.json())
  .then(data => renderAgents(data.agents));
```

### Week 2: SEO优化详情页 (2026-03-15 ~ 03-21)

- [ ] 检查所有详情页meta tags
- [ ] 添加Schema.org结构化数据
- [ ] 优化Open Graph和Twitter Cards
- [ ] 添加内链（相关agent推荐）
- [ ] 完善canonical URLs

**SEO关键词示例：**
- `[Agent名] compliance score`
- `[Agent名] vs [Agent名]`
- `best [Category] agents 2026`
- `[Chain] AI agents`

### Week 3: 合规评分比较功能 (2026-03-22 ~ 03-28)

- [ ] 比较页面 /agents/compare/
- [ ] 最多选择3个agent对比
- [ ] 并排显示：评分、功能、链、TVL
- [ ] "Add to Compare" 按钮
- [ ] 分享比较结果链接

### Week 4: 变现功能 (2026-03-29 ~ 04-04)

- [ ] 邮箱订阅（新agent通知）
  - 接入现有leads系统
  - source=agent_directory
- [ ] Affiliate链接位置
  - 详情页"Visit Official Site"按钮
  - 支持追踪ref参数
- [ ] 付费listing方案设计
  - 置顶位
  - 特色标签
  - 广告位

---

## 📈 成功指标 (每日追踪)

| 指标 | 周目标 | M1目标 | M3目标 |
|------|--------|--------|--------|
| /agents/ UV | 500 | 5,000 | 20,000 |
| Agent详情页UV | 1,000 | 10,000 | 50,000 |
| 搜索使用率 | 20% | 30% | 40% |
| 邮箱订阅 | 10 | 100 | 500 |
| 跳出率 | <70% | <60% | <50% |
| 平均停留时间 | 1min | 2min | 3min |

## 📊 每日ROI追踪

**必须回答的问题：**
1. 今天/agents/有多少UV？
2. 哪些agent详情页最受欢迎？
3. 用户从哪些关键词来？
4. 邮箱订阅转化率？
5. 有什么数据支撑下一步动作？

**数据来源：**
- GA4: apacfinstab.com/agents/*
- Cloudflare Analytics
- Leads系统: source=agent_directory

**ROI拷打规则：**
- 无数据的功能开发 → 暂停
- 有数据支撑的优化 → 继续
- 连续3天无增长 → 复盘调整

---

## 🔧 技术架构

```
数据源 (DeFiLlama + CoinGecko + 手动维护)
    ↓
每日cron 05:00 Perth
    ↓
fetch-agents.js 抓取+生成
    ↓
data/agents.json + agents/[id]/index.html
    ↓
Cloudflare Pages 部署
    ↓
用户访问
```

---

*最后更新: 2026-03-08*
