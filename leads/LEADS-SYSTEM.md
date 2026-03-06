# APAC FINSTAB 用户留存数据系统

> 创建日期: 2026-03-06
> 负责人: 淑芬

---

## 🏗️ 系统架构

```
各入口表单 (Tally)
    ↓
Webhook → Discord通知 + Google Sheets
    ↓
┌─────────────────────────────────────┐
│     Discord #淑芬-seo助手            │
├─────────────────────────────────────┤
│ └── 📊 Leads汇总 (thread)           │
│ └── 📈 转化追踪 (thread)            │
└─────────────────────────────────────┘
```

---

## 📊 Discord子区

| 子区 | Thread ID | 用途 |
|------|-----------|------|
| 📊 Leads汇总 | 1479291049691189271 | 新用户注册通知 |
| 📈 转化追踪 | 1479291094545203261 | 状态变更追踪 |

---

## 📝 数据收集字段

### 核心字段（所有入口必须）

| 字段 | 类型 | 说明 |
|------|------|------|
| email | string | 用户邮箱（唯一标识）|
| source | enum | 来源入口 |
| timestamp | datetime | 注册时间 |
| ref | string | 推荐来源/UTM |

### 来源枚举

```
vasp_test      - VASP爆率测试
mcp_call       - MCP调用转化
tracker_sub    - Tracker订阅
blog_sub       - 博客订阅
waitlist       - Waitlist
enterprise     - 企业询价
leaderboard    - 排行榜告警
other          - 其他
```

### 扩展字段（按入口）

| 入口 | 额外字段 |
|------|---------|
| vasp_test | company, role, jurisdiction, business_type, capital_range |
| mcp_call | use_case, integration_type, platform |
| tracker_sub | jurisdiction_interest |
| blog_sub | topic_interest |
| leaderboard | wallet_address |
| waitlist | role, company, use_case |
| enterprise | company, team_size, budget_range, timeline |

---

## 🔧 Tally表单配置

### VASP爆率测试表单

**Tally表单链接**: [待创建]

**字段配置**:
1. Email (必填, email验证)
2. Company Name (选填)
3. Your Role (单选: Founder/CEO, Compliance Officer, Developer, Legal, Other)
4. Target Jurisdiction (多选: Hong Kong, Singapore, Japan, Korea, Australia, Other)
5. Business Type (单选: Exchange, OTC, Custody, Wallet, DeFi, Other)
6. Capital Range (单选: <HKD 5M, 5M-30M, 30M-50M, >50M, Prefer not to say)
7. Hidden: source=vasp_test
8. Hidden: ref=[从URL参数读取]

### Waitlist表单

**字段配置**:
1. Email (必填)
2. Company Name (选填)
3. Your Role (单选)
4. What are you building? (文本)
5. Hidden: source=waitlist

### 博客订阅表单

**字段配置**:
1. Email (必填)
2. Topics of interest (多选: Stablecoin, Exchange, DeFi, CBDC, RWA, All)
3. Hidden: source=blog_sub

---

## 🔗 Webhook配置

### Tally → Discord

**Webhook URL**: [待配置]

**Payload格式**:
```json
{
  "content": "🎉 **新注册！**\n\n来源: {{source}}\n邮箱: {{email}}\n公司: {{company}}\n角色: {{role}}\n时间: {{timestamp}}"
}
```

### Tally → Google Sheets

**Sheet ID**: [待创建]

**Sheet结构**:
| Column | Field |
|--------|-------|
| A | timestamp |
| B | email |
| C | source |
| D | company |
| E | role |
| F | jurisdiction |
| G | business_type |
| H | capital_range |
| I | ref |
| J | status |
| K | notes |

---

## 📈 用户生命周期

```
状态流转:
new → contacted → qualified → trial → converted
 │        │           │                   │
 │        │           └─ disqualified     └─ churned
 │        └─ no_response (7天)
 └─ bounced (邮箱无效)
```

| 状态 | 定义 | 触发条件 |
|------|------|---------|
| new | 刚注册 | 提交表单 |
| contacted | 已联系 | 发送邮件 |
| qualified | 符合条件 | 确认有真实需求 |
| trial | 试用中 | 开始使用产品 |
| converted | 已转化 | 付费 |
| disqualified | 不符合 | 需求不匹配 |
| no_response | 无响应 | 7天未回复 |
| churned | 流失 | 停止付费 |

---

## 🚀 执行清单

- [x] 创建Discord Leads汇总 thread
- [x] 创建Discord转化追踪 thread
- [ ] 创建Tally VASP测试表单
- [ ] 创建Tally Waitlist表单
- [ ] 创建Tally博客订阅表单
- [ ] 配置Webhook→Discord
- [ ] 创建Google Sheets
- [ ] 配置Webhook→Sheets
- [ ] 嵌入表单到各页面
- [ ] 测试完整流程

---

## 📋 产品入口清单

| 入口 | 页面 | 表单 | 状态 |
|------|------|------|------|
| VASP爆率测试 | /vasp-advisor | vasp_test | 待创建 |
| MCP调用 | API返回 | mcp_call | 待设计 |
| Tracker订阅 | /tracker | tracker_sub | 待创建 |
| 博客订阅 | /blog.html | blog_sub | 待创建 |
| Waitlist | /waitlist | waitlist | 待创建 |
| 排行榜告警 | /leaderboard | leaderboard | 待创建 |
| 企业询价 | /contact | enterprise | 待创建 |

---

*最后更新: 2026-03-06 09:35*
