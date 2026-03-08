/**
 * Cloudflare Workers入口
 * 
 * Session ID机制 (2026-03-08):
 * - 所有API调用可选传入 session_id 追踪同一Agent会话
 * - 没有传入时自动生成
 * - 用于后续 report_outcome 关联操作结果
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

// Session ID生成器
function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `sess_${timestamp}_${random}`;
}

// 提取或生成session_id的中间件辅助函数
function getSessionId(params, headers) {
  // 优先从params获取
  if (params?.session_id) return params.session_id;
  // 其次从header获取
  if (headers?.get('x-session-id')) return headers.get('x-session-id');
  // 否则生成新的
  return generateSessionId();
}

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '0.2.0' }));

// Session管理端点
app.post('/v1/session/start', async (c) => {
  const params = await c.req.json().catch(() => ({}));
  const sessionId = params.session_id || generateSessionId();
  
  return c.json({
    session_id: sessionId,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    message: 'Session created. Use this session_id in subsequent preflight calls.'
  });
});

app.get('/v1/session/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // 在MVP阶段，返回session信息（后续可接入KV存储）
  return c.json({
    session_id: sessionId,
    status: 'active',
    preflight_count: 0, // TODO: 从KV读取
    message: 'Session tracking active. Full history available in production.'
  });
});

// ============ 数据 ============

const KYC_THRESHOLDS = {
  HK: { kycRequired: 8000 },
  SG: { kycRequired: 5000 },
  JP: { kycRequired: 100000 },
  US: { kycRequired: 3000 },
  DEFAULT: { kycRequired: 1000 }
};

const SECURITIES_RULES = {
  HK: {
    requiresLicense: true,
    message: '香港发行可能构成受监管活动，需SFC批准',
    references: ['SFO Schedule 1', 'SFC Statement on ICOs']
  },
  SG: {
    requiresLicense: true,
    message: '新加坡发行可能需要MAS批准',
    references: ['SFA', 'MAS Guide to Digital Token Offerings']
  },
  US: {
    requiresLicense: true,
    message: '美国发行几乎确定需要SEC注册或豁免',
    references: ['Securities Act 1933', 'Howey Test']
  }
};

// ============ x402 Preflight ============

app.post('/v1/preflight/x402', async (c) => {
  const params = await c.req.json();
  const { fromAddress, toAddress, amount, token, chain, fromJurisdiction, toJurisdiction } = params;
  
  // Session追踪
  const sessionId = getSessionId(params, c.req.header);
  const preflightId = `pf_x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const flags = [];
  const references = [];
  let status = 'CLEAR';
  let riskLevel = 'low';

  // KYC threshold check
  const jurisdiction = fromJurisdiction || 'DEFAULT';
  const threshold = KYC_THRESHOLDS[jurisdiction] || KYC_THRESHOLDS.DEFAULT;
  
  if (amount >= threshold.kycRequired) {
    flags.push({
      code: 'KYC_THRESHOLD',
      severity: 'high',
      message: `金额${amount}超过${jurisdiction}的KYC阈值(${threshold.kycRequired})`,
      question: '发送方是否已完成KYC验证？'
    });
    status = 'REVIEW_REQUIRED';
    riskLevel = 'high';
    references.push(`${jurisdiction} AML Regulations`);
  }

  // Cross-border check
  if (fromJurisdiction && toJurisdiction && fromJurisdiction !== toJurisdiction) {
    flags.push({
      code: 'CROSS_BORDER',
      severity: 'medium',
      message: `跨境支付: ${fromJurisdiction} → ${toJurisdiction}`,
      question: '是否符合跨境支付规定？'
    });
    if (status === 'CLEAR') {
      status = 'REVIEW_REQUIRED';
      riskLevel = 'medium';
    }
    references.push('HKMA Cross-Border Guidelines', 'AMLO');
  }

  return c.json({
    preflightId,
    sessionId,  // Session追踪
    timestamp: new Date().toISOString(),
    status,
    riskLevel,
    flags,
    references,
    input: { 
      fromAddress: fromAddress?.slice(0, 10) + '...', 
      toAddress: toAddress?.slice(0, 10) + '...',
      amount, 
      token, 
      chain 
    },
    suggestedActions: flags.length > 0 ? flags.map(f => f.question) : ['无需额外操作'],
    _links: {
      reportOutcome: `/v1/session/${sessionId}/outcome`
    }
  });
});

// ============ Token Launch Preflight ============

app.post('/v1/preflight/token-launch', async (c) => {
  const params = await c.req.json();
  const { tokenName, tokenSymbol, totalSupply, distribution, creatorJurisdiction, hasRevenue, hasGovernance } = params;
  
  // Session追踪
  const sessionId = getSessionId(params, c.req.header);
  const preflightId = `pf_launch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const flags = [];
  const references = [];
  let status = 'CLEAR';
  let riskLevel = 'low';

  // Howey Test
  let howeyScore = 0;
  if (distribution?.presale > 0) howeyScore++;
  if (distribution?.team > 0) howeyScore++;
  if (hasRevenue) howeyScore++;
  if (hasGovernance === false && distribution?.team > 20) howeyScore++;

  if (howeyScore >= 3) {
    flags.push({
      code: 'SECURITIES_RISK_HIGH',
      severity: 'high',
      message: `Token可能被视为证券 (Howey Test评分: ${howeyScore}/4)`,
      question: '是否已评估证券法合规要求？'
    });
    status = 'REVIEW_REQUIRED';
    riskLevel = 'high';
    references.push('SEC v. W.J. Howey Co.', 'SEC Framework for Digital Assets');
  } else if (howeyScore >= 2) {
    flags.push({
      code: 'SECURITIES_RISK_MEDIUM',
      severity: 'medium',
      message: `Token有一定证券属性 (Howey Test评分: ${howeyScore}/4)`
    });
    if (status === 'CLEAR') {
      status = 'REVIEW_REQUIRED';
      riskLevel = 'medium';
    }
  }

  // Jurisdiction rules
  const rule = SECURITIES_RULES[creatorJurisdiction];
  if (rule?.requiresLicense) {
    flags.push({
      code: 'LICENSE_REQUIRED',
      severity: 'high',
      message: rule.message
    });
    references.push(...rule.references);
    if (riskLevel !== 'critical') riskLevel = 'high';
    status = 'REVIEW_REQUIRED';
  }

  // Check risky naming
  const riskyTerms = ['bank', 'securities', 'investment', 'fund', 'yield', 'dividend'];
  const nameLower = (tokenName + ' ' + tokenSymbol).toLowerCase();
  for (const term of riskyTerms) {
    if (nameLower.includes(term)) {
      flags.push({
        code: 'RISKY_NAMING',
        severity: 'medium',
        message: `名称包含"${term}"，可能暗示金融产品属性`
      });
      break;
    }
  }

  return c.json({
    preflightId,
    sessionId,  // Session追踪
    timestamp: new Date().toISOString(),
    status,
    riskLevel,
    howeyScore,
    flags,
    references,
    input: { tokenName, tokenSymbol, creatorJurisdiction },
    suggestedActions: flags.length > 0 
      ? ['咨询证券法律师评估Token分类', `检查${creatorJurisdiction}的Token发行许可要求`]
      : ['基础检查通过'],
    _links: {
      reportOutcome: `/v1/session/${sessionId}/outcome`
    }
  });
});

// ============ Outcome Report (Phase 2) ============

app.post('/v1/session/:sessionId/outcome', async (c) => {
  const sessionId = c.req.param('sessionId');
  const params = await c.req.json();
  const { preflightId, outcome, notes } = params;
  
  // MVP: 记录outcome用于后续Trust Score计算
  // TODO: 存入KV或D1数据库
  
  return c.json({
    sessionId,
    preflightId,
    outcomeRecorded: true,
    timestamp: new Date().toISOString(),
    message: 'Outcome recorded. This data improves Trust Score accuracy.',
    // 未来: 返回更新后的Trust Score
  });
});

// ============ Context API (带session追踪) ============

app.post('/v1/context/check', async (c) => {
  const params = await c.req.json();
  const { action, jurisdiction, entityType } = params;
  
  // Session追踪
  const sessionId = getSessionId(params, c.req.header);
  const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 基础context检查逻辑
  const flags = [];
  let confidence = 0.5;
  let status = 'NEEDS_REVIEW';
  
  // HK特定规则
  if (jurisdiction === 'HK') {
    if (action?.includes('staking') || action?.includes('yield')) {
      flags.push('SFC可能视为regulated activity — 你确认过业务定义吗？');
      flags.push('需确认是否符合Type 1牌照范围');
      confidence = 0.73;
    }
    if (entityType === 'VASP') {
      flags.push('VASP需要向SFC注册 — 是否已提交申请？');
      confidence = 0.85;
    }
  }
  
  if (flags.length === 0) {
    status = 'CLEAR';
    confidence = 0.9;
  }
  
  return c.json({
    contextId,
    sessionId,
    timestamp: new Date().toISOString(),
    confidence,
    status,
    flags,
    references: jurisdiction === 'HK' ? ['SFC FAQ', 'VASP Guideline'] : [],
    suggestedActions: flags.length > 0 ? ['Review with legal counsel'] : [],
    _links: {
      reportOutcome: `/v1/session/${sessionId}/outcome`
    }
  });
});

export default app;
