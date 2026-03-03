/**
 * Token Launch Compliance Preflight
 * 
 * Launchpad发币前的合规检查
 */

import { SECURITIES_RULES, JURISDICTION_RULES } from '../data/compliance-rules.js';

/**
 * Token发行预检
 * @param {Object} params
 * @param {string} params.tokenName - Token名称
 * @param {string} params.tokenSymbol - Token符号
 * @param {number} params.totalSupply - 总供应量
 * @param {Object} params.distribution - 分配方案
 * @param {string} params.creatorJurisdiction - 创建者所在地区
 * @param {string} [params.useCase] - 用途描述
 * @param {boolean} [params.hasRevenue] - 是否承诺收益
 * @param {boolean} [params.hasGovernance] - 是否有治理权
 */
export async function tokenLaunchPreflight(params) {
  const {
    tokenName,
    tokenSymbol,
    totalSupply,
    distribution,
    creatorJurisdiction,
    useCase,
    hasRevenue,
    hasGovernance
  } = params;

  const preflightId = `pf_launch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const flags = [];
  const references = [];
  let riskLevel = 'low';
  let status = 'CLEAR';

  // ============ 检查1: Howey Test (证券属性) ============
  const howeyScore = calculateHoweyScore(params);
  
  if (howeyScore >= 3) {
    flags.push({
      code: 'SECURITIES_RISK_HIGH',
      severity: 'high',
      message: 'Token可能被视为证券 (Howey Test评分: ' + howeyScore + '/4)',
      question: '是否已评估证券法合规要求？'
    });
    riskLevel = 'high';
    status = 'REVIEW_REQUIRED';
    references.push('SEC v. W.J. Howey Co.', 'SEC Framework for Digital Assets');
  } else if (howeyScore >= 2) {
    flags.push({
      code: 'SECURITIES_RISK_MEDIUM',
      severity: 'medium',
      message: 'Token有一定证券属性 (Howey Test评分: ' + howeyScore + '/4)',
      question: '建议咨询法律顾问确认分类'
    });
    if (riskLevel === 'low') {
      riskLevel = 'medium';
      status = 'REVIEW_REQUIRED';
    }
  }

  // ============ 检查2: 地区特定规则 ============
  const jurisdictionRule = SECURITIES_RULES[creatorJurisdiction];
  if (jurisdictionRule) {
    if (jurisdictionRule.requiresLicense) {
      flags.push({
        code: 'LICENSE_REQUIRED',
        severity: jurisdictionRule.severity,
        message: jurisdictionRule.message,
        question: jurisdictionRule.question
      });
      if (jurisdictionRule.severity === 'high' && riskLevel !== 'critical') {
        riskLevel = 'high';
        status = 'REVIEW_REQUIRED';
      }
      references.push(...jurisdictionRule.references);
    }
  }

  // ============ 检查3: 分配方案风险 ============
  if (distribution) {
    if (distribution.team && distribution.team > 50) {
      flags.push({
        code: 'DISTRIBUTION_CONCENTRATED',
        severity: 'medium',
        message: `团队持有${distribution.team}%，可能引发中心化质疑`,
        question: '是否有锁仓/释放计划？'
      });
    }
    
    if (distribution.presale && distribution.presale > 30) {
      flags.push({
        code: 'PRESALE_HIGH',
        severity: 'medium',
        message: `预售占比${distribution.presale}%，可能触发证券法`,
        question: '预售是否符合当地豁免条件？'
      });
      references.push('Reg D', 'Reg S', 'Reg A+');
    }
  }

  // ============ 检查4: 名称/符号风险 ============
  const riskyTerms = ['bank', 'securities', 'investment', 'fund', 'yield', 'dividend'];
  const nameLower = (tokenName + ' ' + tokenSymbol).toLowerCase();
  
  for (const term of riskyTerms) {
    if (nameLower.includes(term)) {
      flags.push({
        code: 'RISKY_NAMING',
        severity: 'medium',
        message: `名称包含"${term}"，可能暗示金融产品属性`,
        question: '是否需要修改名称以避免误导？'
      });
      break;
    }
  }

  // ============ 生成结果 ============
  const result = {
    preflightId,
    timestamp,
    status,
    riskLevel,
    howeyScore,
    flags,
    references,
    input: {
      tokenName,
      tokenSymbol,
      creatorJurisdiction
    },
    suggestedActions: generateLaunchSuggestedActions(flags, creatorJurisdiction)
  };

  console.log(`[Token Launch Preflight] ${preflightId} | ${status} | Howey: ${howeyScore}/4`);

  return result;
}

/**
 * 计算Howey Test评分
 * 4项测试：投资金钱、共同企业、期待收益、来自他人努力
 */
function calculateHoweyScore(params) {
  let score = 0;
  
  // 1. Investment of money - 如果有presale/ICO
  if (params.distribution?.presale > 0 || params.distribution?.ico > 0) {
    score++;
  }
  
  // 2. Common enterprise - 如果有团队持有
  if (params.distribution?.team > 0) {
    score++;
  }
  
  // 3. Expectation of profits - 如果承诺收益
  if (params.hasRevenue) {
    score++;
  }
  
  // 4. Efforts of others - 如果有治理但用户不参与
  if (params.hasGovernance === false && params.distribution?.team > 20) {
    score++;
  }
  
  return score;
}

function generateLaunchSuggestedActions(flags, jurisdiction) {
  const actions = [];
  
  const hasSecuritiesRisk = flags.some(f => f.code.includes('SECURITIES'));
  const hasLicenseRequired = flags.some(f => f.code === 'LICENSE_REQUIRED');
  
  if (hasSecuritiesRisk) {
    actions.push('咨询证券法律师评估Token分类');
  }
  
  if (hasLicenseRequired) {
    actions.push(`检查${jurisdiction}的Token发行许可要求`);
  }
  
  if (flags.some(f => f.code === 'DISTRIBUTION_CONCENTRATED')) {
    actions.push('考虑添加团队Token锁仓计划');
  }
  
  return actions.length > 0 ? actions : ['基础检查通过，建议发布前再次确认'];
}
