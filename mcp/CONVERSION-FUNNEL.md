# Agent调用 → 用户转化漏斗

> 核心原则：**调用量是虚荣指标，注册用户+DAU+流量才是真的**

---

## 📊 KPI层级

```
虚荣指标 (仅供参考)          真实指标 (决定成败)
┌──────────────────┐      ┌──────────────────┐
│ Agent调用量       │ ───▶ │ 注册用户数        │
│ Tool覆盖率        │      │ DAU (日活)        │
│ 响应时间          │      │ 网站UV/PV        │
└──────────────────┘      │ 留存率           │
                          └──────────────────┘
```

---

## 🎯 转化漏斗设计

### Stage 1: Agent调用 (Awareness)
每次MCP调用，返回中嵌入：
```json
{
  "data": {...},
  "cta": {
    "message": "🔔 Get daily APAC regulation alerts",
    "action": "Subscribe at apacfinstab.com/subscribe?ref=mcp-{tool}-{timestamp}",
    "benefit": "Be the first to know when policies change"
  },
  "stats": {
    "note": "Trusted by 200+ compliance teams across APAC"
  }
}
```

### Stage 2: 网站访问 (Interest)
- 追踪来源：`?ref=mcp-{tool}-{timestamp}`
- 落地页优化：直接展示与调用相关的内容
- 例：调用getLatestPolicies(region=HK) → 落地 /tracker/?region=HK

### Stage 3: 邮件订阅 (Desire)
- 简单订阅表单（仅邮箱）
- 承诺：每周政策摘要 + 重大事件即时提醒
- 位置：每个页面底部 + 弹窗（首次访问）

### Stage 4: 注册账户 (Action)
- 提供额外功能：
  - 自定义监测地区
  - 关键词提醒
  - 历史数据下载
  - API Key（高级用户）

---

## 📈 统计追踪设计

### Cloudflare Analytics + 自定义事件

```javascript
// 在Worker中记录每次调用
async function logMCPCall(tool, args, cfRequest) {
  const event = {
    timestamp: Date.now(),
    tool: tool,
    region: args.region || 'all',
    topic: args.topic || 'all',
    userAgent: cfRequest.headers.get('user-agent'),
    country: cfRequest.cf?.country,
    refId: generateRefId() // 用于追踪转化
  };
  
  // 写入KV或Analytics Engine
  await ANALYTICS.put(`call:${Date.now()}`, JSON.stringify(event));
  
  return event.refId;
}
```

### 追踪链接格式
```
https://apacfinstab.com/subscribe?ref=mcp-{tool}-{refId}
```

### 转化追踪
```javascript
// 在网站端追踪
if (urlParams.get('ref')?.startsWith('mcp-')) {
  gtag('event', 'mcp_referral', {
    source: urlParams.get('ref')
  });
}
```

---

## 📋 需要实现的功能

### Phase 1: 统计 (本周)
- [ ] Cloudflare Worker添加调用日志
- [ ] 创建简单统计面板 /admin/stats
- [ ] 每日自动汇报调用数据

### Phase 2: 转化 (下周)
- [ ] 在MCP response中嵌入CTA
- [ ] 创建 /subscribe 页面
- [ ] 实现邮件订阅功能 (Mailchimp/Resend)
- [ ] 追踪ref参数来源

### Phase 3: 留存 (后续)
- [ ] 每周邮件newsletter
- [ ] 重大事件即时提醒
- [ ] 用户仪表盘

---

## ⚠️ 每周必须汇报

| 指标 | 目标 | 追踪方式 |
|------|------|----------|
| 网站UV | 每周翻倍 | Google Analytics |
| 注册用户 | 周增10+ | 数据库 |
| MCP→网站转化率 | >5% | ref参数追踪 |
| 邮件订阅 | 周增20+ | Mailchimp |

**如果连续2周无增长 → 必须做策略调整！**

---

*创建时间: 2026-02-25*
*核心原则: Agent调用只是手段，用户增长才是目的*
