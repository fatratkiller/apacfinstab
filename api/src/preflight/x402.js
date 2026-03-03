/**
 * x402 Payment Compliance Preflight
 * 
 * 检查Agent微支付是否触发合规要求
 */

import { SANCTIONS_LIST, KYC_THRESHOLDS, JURISDICTION_RULES } from '../data/compliance-rules.js';

/**
 * x402支付预检
 * @param {Object} params
 * @param {string} params.fromAddress - 发送方地址
 * @param {string} params.toAddress - 接收方地址
 * @param {number} params.amount - 金额
 * @param {string} params.token - Token类型 (USDC, USDT, ETH等)
 * @param {string} params.chain - 链 (base, ethereum, solana等)
 * @param {string} [params.fromJurisdiction] - 发送方所在地区
 * @param {string} [params.toJurisdiction] - 接收方所在地区
 */
export async function x402Preflight(params) {
  const {
    fromAddress,
    toAddress,
    amount,
    token,
    chain,
    fromJurisdiction,
    toJurisdiction
  } = params;

  const preflightId = `pf_x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const flags = [];
  const references = [];
  let riskLevel = 'low';
  let status = 'CLEAR';

  // ============ 检查1: 制裁名单 ============
  if (SANCTIONS_LIST.addresses.includes(toAddress.toLowerCase())) {
    flags.push({
      code: 'SANCTIONS_HIT',
      severity: 'critical',
      message: '目标地址在制裁名单中',
      question: '是否确认要向此地址付款？'
    });
    riskLevel = 'critical';
    status = 'BLOCKED';
    references.push('OFAC SDN List', 'UN Sanctions List');
  }

  // ============ 检查2: KYC阈值 ============
  const jurisdiction = fromJurisdiction || 'UNKNOWN';
  const threshold = KYC_THRESHOLDS[jurisdiction] || KYC_THRESHOLDS.DEFAULT;
  
  if (amount >= threshold.kycRequired) {
    flags.push({
      code: 'KYC_THRESHOLD',
      severity: 'high',
      message: `金额${amount} ${token}超过${jurisdiction}的KYC阈值(${threshold.kycRequired})`,
      question: '发送方是否已完成KYC验证？'
    });
    if (riskLevel !== 'critical') {
      riskLevel = 'high';
      status = 'REVIEW_REQUIRED';
    }
    references.push(`${jurisdiction} AML Regulations`);
  }

  // ============ 检查3: 跨境支付 ============
  if (fromJurisdiction && toJurisdiction && fromJurisdiction !== toJurisdiction) {
    const crossBorderRule = JURISDICTION_RULES.crossBorder[fromJurisdiction];
    if (crossBorderRule) {
      flags.push({
        code: 'CROSS_BORDER',
        severity: 'medium',
        message: `跨境支付: ${fromJurisdiction} → ${toJurisdiction}`,
        question: crossBorderRule.question
      });
      if (riskLevel === 'low') {
        riskLevel = 'medium';
        status = 'REVIEW_REQUIRED';
      }
      references.push(...crossBorderRule.references);
    }
  }

  // ============ 检查4: 特定Token限制 ============
  const tokenRules = JURISDICTION_RULES.tokens[token];
  if (tokenRules && tokenRules.restricted.includes(fromJurisdiction)) {
    flags.push({
      code: 'TOKEN_RESTRICTED',
      severity: 'high',
      message: `${token}在${fromJurisdiction}受限`,
      question: `是否确认${fromJurisdiction}允许此Token交易？`
    });
    if (riskLevel !== 'critical') {
      riskLevel = 'high';
      status = 'REVIEW_REQUIRED';
    }
    references.push(...tokenRules.references);
  }

  // ============ 生成结果 ============
  const result = {
    preflightId,
    timestamp,
    status,
    riskLevel,
    flags,
    references,
    input: {
      fromAddress: fromAddress.slice(0, 10) + '...',
      toAddress: toAddress.slice(0, 10) + '...',
      amount,
      token,
      chain
    },
    suggestedActions: generateSuggestedActions(flags)
  };

  // 记录日志（实际部署时写入数据库）
  console.log(`[x402 Preflight] ${preflightId} | ${status} | ${riskLevel}`);

  return result;
}

function generateSuggestedActions(flags) {
  const actions = [];
  
  for (const flag of flags) {
    switch (flag.code) {
      case 'SANCTIONS_HIT':
        actions.push('立即停止交易，咨询合规顾问');
        break;
      case 'KYC_THRESHOLD':
        actions.push('确认发送方KYC状态');
        break;
      case 'CROSS_BORDER':
        actions.push('检查跨境支付许可');
        break;
      case 'TOKEN_RESTRICTED':
        actions.push('确认Token在目标地区的合法性');
        break;
    }
  }
  
  return actions.length > 0 ? actions : ['无需额外操作'];
}
