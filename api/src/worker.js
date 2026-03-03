/**
 * Cloudflare Workers入口
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '0.1.0' }));

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
    suggestedActions: flags.length > 0 ? flags.map(f => f.question) : ['无需额外操作']
  });
});

// ============ Token Launch Preflight ============

app.post('/v1/preflight/token-launch', async (c) => {
  const params = await c.req.json();
  const { tokenName, tokenSymbol, totalSupply, distribution, creatorJurisdiction, hasRevenue, hasGovernance } = params;
  
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
    timestamp: new Date().toISOString(),
    status,
    riskLevel,
    howeyScore,
    flags,
    references,
    input: { tokenName, tokenSymbol, creatorJurisdiction },
    suggestedActions: flags.length > 0 
      ? ['咨询证券法律师评估Token分类', `检查${creatorJurisdiction}的Token发行许可要求`]
      : ['基础检查通过']
  });
});

export default app;
