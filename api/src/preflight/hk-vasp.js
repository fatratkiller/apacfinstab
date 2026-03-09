/**
 * Hong Kong VASP Compliance Preflight
 * 
 * 香港虚拟资产服务提供商(VASP)合规预检
 * 基于SFC VASP Guidelines (2023-2026)
 * 
 * 苏格拉底式：不做判断，提出关键问题
 * 
 * @version 0.1.0
 * @lastUpdated 2026-03-09
 */

// ============ HK VASP 监管规则数据 ============

export const HK_VASP_RULES = {
  // 业务活动定义 - SFC认定的"虚拟资产活动"
  regulatedActivities: {
    // 明确需要牌照的活动
    licensed: [
      'crypto_exchange',           // 虚拟资产交易平台
      'crypto_trading',            // 虚拟资产交易
      'custody_service',           // 托管服务
      'va_advisory',               // 虚拟资产投资建议
      'va_fund_management',        // 虚拟资产基金管理
      'va_distribution',           // 虚拟资产基金分销
    ],
    // 可能需要牌照的活动
    mayRequire: [
      'otc_desk',                  // OTC交易台
      'va_lending',                // 虚拟资产借贷
      'staking_service',           // Staking服务
      'defi_aggregator',           // DeFi聚合器
    ],
    // 目前豁免的活动
    exempt: [
      'mining',                    // 挖矿
      'self_custody',              // 自托管
      'p2p_transfer',              // 点对点转账（无中介）
    ]
  },

  // 资本要求
  capitalRequirements: {
    paidUpCapital: {
      min: 5000000,                // HKD 500万
      currency: 'HKD'
    },
    liquidCapital: {
      base: 3000000,               // HKD 300万基础
      variable: 0.05,              // 客户资产的5%
      currency: 'HKD'
    }
  },

  // 管理人员要求
  managementRequirements: {
    responsibleOfficer: {
      min: 2,                      // 至少2名负责人员
      localPresence: true,         // 必须在港
      experience: 5,               // 5年相关经验
    },
    keyPersonnel: {
      mlro: true,                  // 必须有洗钱报告官
      complianceOfficer: true,     // 必须有合规官
      cro: true,                   // 建议有首席风险官
    }
  },

  // 客户限制
  clientRestrictions: {
    retailInvestors: {
      allowed: true,               // 2024起允许零售
      requirements: [
        'suitability_assessment',  // 适当性评估
        'risk_disclosure',         // 风险披露
        'cooling_off_period',      // 冷静期
        'investment_limit',        // 投资上限（知识测试前）
      ]
    },
    professionalInvestors: {
      allowed: true,
      requirements: [
        'pi_declaration',          // PI声明
        'documentation',           // 文件证明
      ]
    }
  },

  // 虚拟资产上架要求
  tokenListing: {
    criteria: [
      'market_cap_threshold',      // 市值门槛
      'liquidity_requirement',     // 流动性要求
      'regulatory_status',         // 监管状态（非证券）
      'security_audit',            // 安全审计
      'smart_contract_review',     // 智能合约审查
    ],
    prohibited: [
      'privacy_coins',             // 隐私币（Monero, Zcash等）
      'unregistered_securities',   // 未注册证券型代币
      'stablecoins_without_approval', // 未获批稳定币（2024后）
    ]
  },

  // AML/CFT要求
  amlRequirements: {
    kycThresholds: {
      simplified: null,            // 无简化程序
      standard: 0,                 // 所有客户需KYC
      enhanced: 120000,            // HKD 12万以上增强尽调
    },
    travelRule: {
      threshold: 8000,             // HKD 8000
      required: true,
    },
    transactionMonitoring: {
      realTime: true,
      suspiciousActivityReport: true,
    }
  },

  // 托管要求
  custodyRequirements: {
    segregation: true,             // 客户资产隔离
    coldStorage: {
      min: 0.98,                   // 98%冷存储
    },
    insurance: {
      required: true,
      coverage: 'full_client_assets',
    },
    thirdPartyCustody: {
      allowed: true,
      requirements: ['licensed', 'audited', 'insured']
    }
  },

  // 参考文献
  references: {
    primary: [
      { id: 'SFC_VASP_GL', name: 'SFC Guidelines for Virtual Asset Trading Platforms', url: 'https://www.sfc.hk/en/faqs/Intermediaries/Licensing/Virtual-asset-trading-platforms' },
      { id: 'AMLO', name: 'Anti-Money Laundering and Counter-Terrorist Financing Ordinance', url: 'https://www.elegislation.gov.hk/hk/cap615' },
      { id: 'SFO', name: 'Securities and Futures Ordinance', url: 'https://www.elegislation.gov.hk/hk/cap571' },
    ],
    secondary: [
      { id: 'SFC_CIRCULAR', name: 'SFC Circular on VATPs (2023)', url: 'https://apps.sfc.hk/edistributionWeb/gateway/EN/circular/doc?refNo=23EC35' },
      { id: 'SFC_RETAIL', name: 'SFC Policy Statement on Retail Access (2024)', url: 'https://www.sfc.hk/en/regulatory-functions/intermediaries/licensing/virtual-assets' },
    ]
  }
};

// ============ Preflight 函数 ============

/**
 * HK VASP 业务合规预检
 * 
 * @param {Object} params
 * @param {string} params.activityType - 业务活动类型
 * @param {Object} params.companyInfo - 公司信息
 * @param {Object} params.clientProfile - 目标客户类型
 * @param {Object} [params.tokenInfo] - 代币信息（如涉及上架）
 * @param {Object} [params.transactionInfo] - 交易信息（如涉及交易）
 */
export async function hkVaspPreflight(params) {
  const {
    activityType,
    companyInfo,
    clientProfile,
    tokenInfo,
    transactionInfo
  } = params;

  const preflightId = `pf_hkvasp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const flags = [];
  const references = [];
  let riskLevel = 'low';
  let status = 'CLEAR';
  let confidence = 0.9;

  // ============ 检查1: 活动类型分类 ============
  const activityCheck = checkActivityType(activityType);
  flags.push(...activityCheck.flags);
  references.push(...activityCheck.references);
  if (activityCheck.requiresLicense) {
    status = 'REVIEW_REQUIRED';
    riskLevel = activityCheck.riskLevel;
    confidence = Math.min(confidence, activityCheck.confidence);
  }

  // ============ 检查2: 公司资格（如提供） ============
  if (companyInfo) {
    const eligibilityCheck = checkCompanyEligibility(companyInfo);
    flags.push(...eligibilityCheck.flags);
    references.push(...eligibilityCheck.references);
    if (eligibilityCheck.gaps.length > 0) {
      status = 'GAPS_IDENTIFIED';
      riskLevel = Math.max(riskLevel, eligibilityCheck.riskLevel);
    }
  }

  // ============ 检查3: 客户类型 ============
  if (clientProfile) {
    const clientCheck = checkClientRestrictions(clientProfile);
    flags.push(...clientCheck.flags);
    references.push(...clientCheck.references);
    if (!clientCheck.allowed) {
      status = 'NOT_PERMITTED';
      riskLevel = 'high';
    }
  }

  // ============ 检查4: 代币上架检查（如涉及） ============
  if (tokenInfo) {
    const tokenCheck = checkTokenListing(tokenInfo);
    flags.push(...tokenCheck.flags);
    references.push(...tokenCheck.references);
    if (tokenCheck.prohibited) {
      status = 'PROHIBITED';
      riskLevel = 'critical';
    }
  }

  // ============ 检查5: 交易AML检查（如涉及） ============
  if (transactionInfo) {
    const amlCheck = checkAmlRequirements(transactionInfo);
    flags.push(...amlCheck.flags);
    references.push(...amlCheck.references);
    if (amlCheck.requiresEnhanced) {
      riskLevel = Math.max(riskLevel, 'medium');
    }
  }

  // ============ 生成结果 ============
  const result = {
    preflightId,
    timestamp,
    jurisdiction: 'HK',
    regulator: 'SFC',
    status,
    riskLevel,
    confidence,
    flags,
    references: [...new Set(references)], // 去重
    input: {
      activityType,
      hasCompanyInfo: !!companyInfo,
      hasClientProfile: !!clientProfile,
      hasTokenInfo: !!tokenInfo,
      hasTransactionInfo: !!transactionInfo
    },
    suggestedActions: generateSuggestedActions(flags, status),
    disclaimer: 'This preflight check provides regulatory context only. It does not constitute legal advice. Final compliance decisions should involve qualified legal counsel.'
  };

  console.log(`[HK VASP Preflight] ${preflightId} | ${status} | Risk: ${riskLevel}`);

  return result;
}

// ============ 子检查函数 ============

function checkActivityType(activityType) {
  const result = {
    flags: [],
    references: [],
    requiresLicense: false,
    riskLevel: 'low',
    confidence: 0.95
  };

  const rules = HK_VASP_RULES.regulatedActivities;

  if (rules.licensed.includes(activityType)) {
    result.requiresLicense = true;
    result.riskLevel = 'high';
    result.flags.push({
      code: 'VASP_LICENSE_REQUIRED',
      severity: 'high',
      message: `"${activityType}"属于SFC监管的虚拟资产活动，需要VASP牌照`,
      question: '是否已申请或持有SFC VASP牌照？'
    });
    result.references.push('SFC_VASP_GL', 'AMLO');
  } else if (rules.mayRequire.includes(activityType)) {
    result.requiresLicense = true;
    result.riskLevel = 'medium';
    result.confidence = 0.7;
    result.flags.push({
      code: 'VASP_LICENSE_MAY_REQUIRED',
      severity: 'medium',
      message: `"${activityType}"可能属于监管范围，需进一步评估`,
      question: '业务的具体模式是否会触发牌照要求？建议咨询SFC或法律顾问'
    });
    result.references.push('SFC_VASP_GL');
  } else if (rules.exempt.includes(activityType)) {
    result.flags.push({
      code: 'ACTIVITY_EXEMPT',
      severity: 'info',
      message: `"${activityType}"目前不在VASP牌照监管范围内`,
      question: '是否有计划扩展到其他可能受监管的业务？'
    });
  } else {
    result.confidence = 0.5;
    result.flags.push({
      code: 'ACTIVITY_UNKNOWN',
      severity: 'medium',
      message: `无法识别"${activityType}"的监管分类`,
      question: '请提供更详细的业务描述以便准确评估'
    });
  }

  return result;
}

function checkCompanyEligibility(companyInfo) {
  const result = {
    flags: [],
    references: [],
    gaps: [],
    riskLevel: 'low'
  };

  const rules = HK_VASP_RULES;

  // 资本检查
  if (companyInfo.paidUpCapital !== undefined) {
    if (companyInfo.paidUpCapital < rules.capitalRequirements.paidUpCapital.min) {
      result.gaps.push('INSUFFICIENT_PAID_UP_CAPITAL');
      result.flags.push({
        code: 'CAPITAL_GAP',
        severity: 'high',
        message: `实缴资本 ${companyInfo.paidUpCapital.toLocaleString()} HKD 低于最低要求 ${rules.capitalRequirements.paidUpCapital.min.toLocaleString()} HKD`,
        question: '是否有计划增资？预计时间线？'
      });
      result.riskLevel = 'high';
    }
  }

  if (companyInfo.liquidCapital !== undefined) {
    if (companyInfo.liquidCapital < rules.capitalRequirements.liquidCapital.base) {
      result.gaps.push('INSUFFICIENT_LIQUID_CAPITAL');
      result.flags.push({
        code: 'LIQUID_CAPITAL_GAP',
        severity: 'high',
        message: `流动资金 ${companyInfo.liquidCapital.toLocaleString()} HKD 低于基础要求 ${rules.capitalRequirements.liquidCapital.base.toLocaleString()} HKD`,
        question: '是否有足够流动性储备？'
      });
      result.riskLevel = 'high';
    }
  }

  // 管理人员检查
  if (companyInfo.responsibleOfficers !== undefined) {
    if (companyInfo.responsibleOfficers < rules.managementRequirements.responsibleOfficer.min) {
      result.gaps.push('INSUFFICIENT_RO');
      result.flags.push({
        code: 'RO_GAP',
        severity: 'high',
        message: `负责人员 ${companyInfo.responsibleOfficers} 人少于最低要求 ${rules.managementRequirements.responsibleOfficer.min} 人`,
        question: '是否有合适的候选人可以任命为负责人员？'
      });
      result.riskLevel = 'high';
    }
  }

  if (companyInfo.hasMLRO === false) {
    result.gaps.push('NO_MLRO');
    result.flags.push({
      code: 'MLRO_GAP',
      severity: 'high',
      message: '缺少洗钱报告主任(MLRO)',
      question: '是否有计划聘请具有AML经验的MLRO？'
    });
  }

  if (companyInfo.hasComplianceOfficer === false) {
    result.gaps.push('NO_CO');
    result.flags.push({
      code: 'CO_GAP',
      severity: 'high',
      message: '缺少合规主任',
      question: '是否有计划设立专职合规职能？'
    });
  }

  // 本地存在检查
  if (companyInfo.hkRegistered === false) {
    result.gaps.push('NOT_HK_REGISTERED');
    result.flags.push({
      code: 'REGISTRATION_GAP',
      severity: 'critical',
      message: '非香港注册公司无法直接申请VASP牌照',
      question: '是否计划在香港设立子公司？'
    });
    result.riskLevel = 'critical';
  }

  if (companyInfo.managementInHK === false) {
    result.flags.push({
      code: 'LOCAL_PRESENCE_CONCERN',
      severity: 'medium',
      message: 'SFC要求管理层在香港有实质存在',
      question: '关键管理人员是否计划驻港？'
    });
  }

  if (result.gaps.length > 0) {
    result.references.push('SFC_VASP_GL');
  }

  return result;
}

function checkClientRestrictions(clientProfile) {
  const result = {
    flags: [],
    references: [],
    allowed: true
  };

  const rules = HK_VASP_RULES.clientRestrictions;

  if (clientProfile.includesRetail) {
    result.flags.push({
      code: 'RETAIL_CLIENT_REQUIREMENTS',
      severity: 'medium',
      message: '服务零售投资者需要满足额外要求',
      question: '是否已建立适当性评估、风险披露、冷静期等机制？'
    });
    result.references.push('SFC_RETAIL');

    // 检查零售投资者保护措施
    const missingProtections = [];
    if (!clientProfile.hasSuitabilityAssessment) {
      missingProtections.push('适当性评估');
    }
    if (!clientProfile.hasRiskDisclosure) {
      missingProtections.push('风险披露');
    }
    if (!clientProfile.hasCoolingOff) {
      missingProtections.push('冷静期');
    }

    if (missingProtections.length > 0) {
      result.flags.push({
        code: 'RETAIL_PROTECTION_GAPS',
        severity: 'high',
        message: `缺少零售投资者保护措施: ${missingProtections.join(', ')}`,
        question: '如何确保零售客户得到充分保护？'
      });
    }
  }

  if (clientProfile.includesProfessional) {
    result.flags.push({
      code: 'PI_VERIFICATION_REQUIRED',
      severity: 'low',
      message: '需要验证专业投资者资格',
      question: '是否有PI资格验证流程？'
    });
  }

  return result;
}

function checkTokenListing(tokenInfo) {
  const result = {
    flags: [],
    references: [],
    prohibited: false
  };

  const rules = HK_VASP_RULES.tokenListing;

  // 检查禁止代币
  if (tokenInfo.isPrivacyCoin) {
    result.prohibited = true;
    result.flags.push({
      code: 'PRIVACY_COIN_PROHIBITED',
      severity: 'critical',
      message: '隐私币（如Monero, Zcash）在香港持牌平台禁止交易',
      question: null // 无问题，直接禁止
    });
    result.references.push('SFC_VASP_GL');
  }

  if (tokenInfo.isSecurityToken && !tokenInfo.isRegistered) {
    result.prohibited = true;
    result.flags.push({
      code: 'UNREGISTERED_SECURITY',
      severity: 'critical',
      message: '未注册的证券型代币不得上架',
      question: '是否已评估该代币在SFO下的分类？'
    });
    result.references.push('SFO');
  }

  if (tokenInfo.isStablecoin && !tokenInfo.hasStablecoinApproval) {
    result.flags.push({
      code: 'STABLECOIN_APPROVAL_REQUIRED',
      severity: 'high',
      message: '稳定币发行/上架需要额外监管批准（2024年后）',
      question: '该稳定币是否已获得HKMA批准？'
    });
    result.references.push('HKMA_STABLECOIN');
  }

  // 检查上架标准
  if (tokenInfo.marketCap !== undefined && tokenInfo.marketCap < 10000000) {
    result.flags.push({
      code: 'LOW_MARKET_CAP',
      severity: 'medium',
      message: '低市值代币可能不符合上架标准',
      question: '是否有充分的流动性和交易量支持？'
    });
  }

  if (!tokenInfo.hasSecurityAudit) {
    result.flags.push({
      code: 'NO_SECURITY_AUDIT',
      severity: 'medium',
      message: '缺少安全审计报告',
      question: '是否已完成智能合约/协议安全审计？'
    });
  }

  return result;
}

function checkAmlRequirements(transactionInfo) {
  const result = {
    flags: [],
    references: [],
    requiresEnhanced: false
  };

  const rules = HK_VASP_RULES.amlRequirements;

  // Travel Rule检查
  if (transactionInfo.amount >= rules.travelRule.threshold) {
    result.flags.push({
      code: 'TRAVEL_RULE_APPLIES',
      severity: 'medium',
      message: `交易金额 ${transactionInfo.amount.toLocaleString()} HKD 触发Travel Rule (阈值: ${rules.travelRule.threshold.toLocaleString()} HKD)`,
      question: '是否能获取并传递发送方/接收方信息？'
    });
    result.references.push('AMLO');
  }

  // 增强尽调检查
  if (transactionInfo.amount >= rules.kycThresholds.enhanced) {
    result.requiresEnhanced = true;
    result.flags.push({
      code: 'ENHANCED_DUE_DILIGENCE',
      severity: 'high',
      message: `交易金额 ${transactionInfo.amount.toLocaleString()} HKD 需要增强尽职调查`,
      question: '是否已完成对该客户的增强背景调查？'
    });
    result.references.push('AMLO');
  }

  // 高风险指标
  if (transactionInfo.isHighRiskJurisdiction) {
    result.requiresEnhanced = true;
    result.flags.push({
      code: 'HIGH_RISK_JURISDICTION',
      severity: 'high',
      message: '交易涉及高风险司法管辖区',
      question: '是否已进行额外的来源和目的验证？'
    });
  }

  if (transactionInfo.isPEP) {
    result.requiresEnhanced = true;
    result.flags.push({
      code: 'PEP_TRANSACTION',
      severity: 'high',
      message: '交易涉及政治公众人物(PEP)',
      question: '是否已获得高级管理层批准？'
    });
  }

  return result;
}

function generateSuggestedActions(flags, status) {
  const actions = [];

  // 根据状态生成总体建议
  switch (status) {
    case 'PROHIBITED':
      actions.push('⛔ 该活动/资产在香港明确禁止，请勿继续');
      break;
    case 'NOT_PERMITTED':
      actions.push('🚫 当前配置不符合监管要求，需重新评估业务模式');
      break;
    case 'GAPS_IDENTIFIED':
      actions.push('📋 已识别合规差距，建议制定整改计划');
      break;
    case 'REVIEW_REQUIRED':
      actions.push('⚠️ 需要进一步审查，建议咨询SFC或法律顾问');
      break;
  }

  // 根据具体flag生成建议
  const hasLicenseGap = flags.some(f => f.code === 'VASP_LICENSE_REQUIRED');
  const hasCapitalGap = flags.some(f => f.code.includes('CAPITAL_GAP'));
  const hasPersonnelGap = flags.some(f => ['RO_GAP', 'MLRO_GAP', 'CO_GAP'].includes(f.code));
  const hasRetailRequirements = flags.some(f => f.code === 'RETAIL_CLIENT_REQUIREMENTS');
  const hasAmlRequirements = flags.some(f => ['TRAVEL_RULE_APPLIES', 'ENHANCED_DUE_DILIGENCE'].includes(f.code));

  if (hasLicenseGap) {
    actions.push('📝 启动VASP牌照申请准备（预计12-18个月）');
  }

  if (hasCapitalGap) {
    actions.push('💰 制定增资计划以满足资本要求');
  }

  if (hasPersonnelGap) {
    actions.push('👥 招聘/任命合规团队关键人员');
  }

  if (hasRetailRequirements) {
    actions.push('🛡️ 建立零售投资者保护机制');
  }

  if (hasAmlRequirements) {
    actions.push('🔍 执行相关AML/KYC程序');
  }

  if (actions.length === 0) {
    actions.push('✅ 基础检查通过，建议定期监控监管动态');
  }

  return actions;
}

// ============ 导出快捷函数 ============

/**
 * 快速检查 - 是否需要VASP牌照
 */
export function quickLicenseCheck(activityType) {
  const rules = HK_VASP_RULES.regulatedActivities;
  
  if (rules.licensed.includes(activityType)) {
    return { required: true, certainty: 'definite', message: '需要VASP牌照' };
  } else if (rules.mayRequire.includes(activityType)) {
    return { required: true, certainty: 'possible', message: '可能需要VASP牌照，建议咨询' };
  } else if (rules.exempt.includes(activityType)) {
    return { required: false, certainty: 'likely', message: '目前豁免，但监管可能变化' };
  } else {
    return { required: null, certainty: 'unknown', message: '无法确定，请提供更多信息' };
  }
}

/**
 * 快速检查 - 代币是否可上架
 */
export function quickTokenCheck(tokenSymbol, tokenType) {
  const prohibited = ['XMR', 'ZEC', 'DASH', 'SCRT', 'BEAM', 'GRIN'];
  
  if (prohibited.includes(tokenSymbol.toUpperCase())) {
    return { allowed: false, reason: '隐私币，香港持牌平台禁止' };
  }
  
  if (tokenType === 'security' || tokenType === 'unregistered_security') {
    return { allowed: false, reason: '证券型代币需要额外注册' };
  }
  
  return { allowed: true, reason: '需要完成上架审核流程', requiresReview: true };
}

/**
 * 获取当前资本要求
 */
export function getCapitalRequirements() {
  return HK_VASP_RULES.capitalRequirements;
}

/**
 * 获取AML阈值
 */
export function getAmlThresholds() {
  return HK_VASP_RULES.amlRequirements;
}
