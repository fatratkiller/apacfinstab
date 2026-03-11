/**
 * Stablecoin Issuer Compliance Preflight
 * 
 * 稳定币发行商合规预检
 * 覆盖: 香港(HKMA)、新加坡(MAS)、日本(FSA)、澳洲(RBA/ASIC)
 * 
 * 苏格拉底式：不做判断，提出关键问题
 * 
 * @version 0.1.0
 * @lastUpdated 2026-03-11
 */

// ============ 稳定币类型定义 ============

export const STABLECOIN_TYPES = {
  fiat_backed: {
    name: 'Fiat-Backed Stablecoin',
    description: '法币支持型稳定币（如USDT、USDC）',
    riskLevel: 'low',
    regulatoryClarity: 'high',
    examples: ['USDT', 'USDC', 'FDUSD', 'HKDR']
  },
  crypto_backed: {
    name: 'Crypto-Backed Stablecoin',
    description: '加密资产抵押型稳定币（如DAI）',
    riskLevel: 'medium',
    regulatoryClarity: 'medium',
    examples: ['DAI', 'LUSD', 'sUSD']
  },
  algorithmic: {
    name: 'Algorithmic Stablecoin',
    description: '算法稳定币（UST式）',
    riskLevel: 'high',
    regulatoryClarity: 'low',
    examples: ['FRAX', 'RAI']
  },
  commodity_backed: {
    name: 'Commodity-Backed Stablecoin',
    description: '商品抵押型稳定币（黄金等）',
    riskLevel: 'medium',
    regulatoryClarity: 'medium',
    examples: ['PAXG', 'XAUT']
  }
};

// ============ 香港 HKMA 稳定币规则 ============

export const HK_STABLECOIN_RULES = {
  jurisdiction: 'HK',
  regulator: 'HKMA',
  framework: 'Stablecoins Ordinance (2025)',
  effectiveDate: '2025-03-01',
  licensingDeadline: '2026-03-01',

  // 准入要求
  eligibility: {
    entityType: {
      required: ['hong_kong_incorporated', 'foreign_with_hk_office'],
      prohibited: ['individual', 'unincorporated_partnership']
    },
    stablecoinType: {
      allowed: ['fiat_backed'],
      conditional: ['commodity_backed'],
      prohibited: ['algorithmic', 'crypto_backed']
    },
    pegCurrency: {
      primary: ['HKD', 'USD', 'CNH', 'EUR'],
      requiresApproval: ['other_currencies']
    }
  },

  // 资本要求
  capitalRequirements: {
    minimumCapital: {
      amount: 25000000,
      currency: 'HKD',
      type: 'paid_up'
    },
    liquidCapital: {
      amount: 10000000,
      currency: 'HKD',
      ongoing: true
    }
  },

  // 储备要求
  reserveRequirements: {
    ratio: 1.0,  // 1:1 全额储备
    eligibleAssets: [
      'cash',
      'central_bank_deposits',
      'short_term_government_bonds',  // 3个月内到期
      'high_grade_commercial_paper'   // AA-评级以上
    ],
    ineligibleAssets: [
      'crypto_assets',
      'corporate_bonds_below_aa',
      'equities',
      'real_estate'
    ],
    custody: {
      required: 'licensed_bank',
      segregation: true,
      location: 'hong_kong_preferred'
    },
    audit: {
      frequency: 'monthly',
      type: 'independent_attestation',
      publicDisclosure: 'quarterly'
    }
  },

  // 赎回要求
  redemptionRequirements: {
    guarantee: 'at_par',
    timeframe: {
      standard: '5_business_days',
      large_redemption: '10_business_days'
    },
    minimumAmount: null,  // 无最低赎回额
    fees: {
      allowed: true,
      maxPercentage: 0.002  // 0.2%
    }
  },

  // 治理要求
  governanceRequirements: {
    board: {
      independentDirectors: 2,
      localDirectors: 1
    },
    keyPersonnel: {
      ceo: { localPresence: true },
      cfo: { localPresence: true },
      complianceOfficer: { required: true },
      riskOfficer: { required: true }
    }
  },

  // AML/CFT要求
  amlRequirements: {
    kycAllHolders: false,  // 持有者无需KYC
    kycRedemption: true,   // 赎回需要KYC
    travelRule: {
      threshold: 8000,
      currency: 'HKD',
      applicable: true
    }
  },

  // 参考文献
  references: [
    { id: 'HKMA_STABLECOIN', name: 'HKMA Stablecoin Issuer Licensing Discussion Paper', url: 'https://www.hkma.gov.hk/eng/key-functions/banking/stablecoin-regulation/' },
    { id: 'STABLECOIN_ORD', name: 'Stablecoins Ordinance (2025)', url: 'https://www.elegislation.gov.hk/' },
    { id: 'HKMA_SANDBOX', name: 'HKMA Stablecoin Sandbox (2024)', url: 'https://www.hkma.gov.hk/eng/key-functions/banking/stablecoin-sandbox/' }
  ]
};

// ============ 新加坡 MAS 稳定币规则 ============

export const SG_STABLECOIN_RULES = {
  jurisdiction: 'SG',
  regulator: 'MAS',
  framework: 'Payment Services Act + SCS Framework',
  effectiveDate: '2023-08-01',

  // 准入要求
  eligibility: {
    licenseType: {
      primary: 'Major Payment Institution (MPI)',
      alternative: 'Bank License'
    },
    stablecoinType: {
      scs_framework: ['fiat_backed'],  // Single Currency Stablecoin
      other: ['conditional_mpi_approval']
    },
    pegCurrency: {
      scs_eligible: ['SGD', 'G10_currencies'],
      other: 'case_by_case'
    }
  },

  // 资本要求
  capitalRequirements: {
    mpi: {
      baseCapital: 250000,
      currency: 'SGD'
    },
    scs_specific: {
      minimum: 1000000,
      currency: 'SGD',
      percentageOfIssuance: 0.02  // 2% of outstanding
    }
  },

  // 储备要求 (SCS Framework)
  reserveRequirements: {
    ratio: 1.0,
    eligibleAssets: [
      'cash',
      'mas_deposits',
      'mas_bills',
      'singapore_government_securities',
      'g10_government_bonds'
    ],
    assetComposition: {
      cash_or_cash_equivalents: 0.50  // 至少50%
    },
    custody: {
      required: 'licensed_bank_or_trustee',
      segregation: true
    },
    audit: {
      frequency: 'monthly',
      publicDisclosure: 'weekly_reserve_composition'
    }
  },

  // 赎回要求
  redemptionRequirements: {
    guarantee: 'at_par',
    timeframe: '5_business_days',
    minimumAmount: null
  },

  // 零售限制
  retailRestrictions: {
    allowed: true,
    requirements: [
      'risk_disclosure',
      'clear_redemption_terms'
    ]
  },

  references: [
    { id: 'MAS_SCS', name: 'MAS Stablecoin Regulatory Framework', url: 'https://www.mas.gov.sg/-/media/mas/news-and-publications/consultation-papers/2022/consultation-paper-on-proposed-regulatory-measures-for-stablecoin-related-activities.pdf' },
    { id: 'PSA', name: 'Payment Services Act 2019', url: 'https://sso.agc.gov.sg/Act/PSA2019' }
  ]
};

// ============ 日本 FSA 稳定币规则 ============

export const JP_STABLECOIN_RULES = {
  jurisdiction: 'JP',
  regulator: 'FSA/JFSA',
  framework: 'Payment Services Act (Revised 2022)',
  effectiveDate: '2023-06-01',

  // 准入要求
  eligibility: {
    issuerType: {
      allowed: ['bank', 'trust_company', 'fund_transfer_service'],
      prohibited: ['unlicensed_entity']
    },
    stablecoinType: {
      allowed: ['fiat_backed'],
      prohibited: ['algorithmic', 'crypto_backed']
    },
    classification: 'Electronic Payment Instrument (EPI)'
  },

  // 发行商类型要求
  issuerRequirements: {
    bank: {
      type: 'Type I Stablecoin',
      backing: 'bank_deposits'
    },
    trust: {
      type: 'Type II Stablecoin',
      backing: 'trust_assets'
    },
    fundTransfer: {
      type: 'Fund Transfer Stablecoin',
      restrictions: ['domestic_only', 'amount_caps']
    }
  },

  // 资本要求
  capitalRequirements: {
    bank: 'bank_capital_requirements',
    trust: {
      minimum: 100000000,  // 1億円
      currency: 'JPY'
    },
    fundTransfer: {
      minimum: 10000000,   // 1000万円
      currency: 'JPY'
    }
  },

  // 储备要求
  reserveRequirements: {
    bankIssued: 'deposit_insurance',
    trustIssued: {
      ratio: 1.0,
      eligibleAssets: ['bank_deposits', 'government_bonds'],
      segregation: true
    }
  },

  // 分销商要求 (Intermediary)
  intermediaryRequirements: {
    registration: 'Electronic Payment Instrument Service Provider',
    amlCompliance: true,
    capitalRequirement: {
      minimum: 10000000,
      currency: 'JPY'
    }
  },

  // AML要求
  amlRequirements: {
    kycThreshold: {
      amount: 0,  // 所有交易需KYC
      currency: 'JPY'
    },
    travelRule: {
      applicable: true,
      threshold: 100000,
      currency: 'JPY'
    }
  },

  references: [
    { id: 'PSA_JP', name: 'Payment Services Act (Revised 2022)', url: 'https://www.japaneselawtranslation.go.jp/' },
    { id: 'FSA_GL', name: 'FSA Stablecoin Guidelines', url: 'https://www.fsa.go.jp/en/' }
  ]
};

// ============ 澳洲规则 (发展中) ============

export const AU_STABLECOIN_RULES = {
  jurisdiction: 'AU',
  regulator: 'RBA/ASIC/APRA',
  framework: 'Developing (Expected 2026)',
  status: 'in_development',

  // 当前状态
  currentState: {
    regulatoryClarity: 'low',
    consultation: {
      tokenMapping: true,
      paymentStablecoins: true
    },
    expectedTimeline: 'H2_2026'
  },

  // 预期要求
  expectedRequirements: {
    classification: 'Stored Value Facility or Financial Product',
    licensing: {
      possible: ['AFSL', 'ADI_License', 'New_Stablecoin_License']
    },
    reserveRequirements: {
      expected: '1:1_backing',
      eligibleAssets: ['aud_deposits', 'government_bonds']
    }
  },

  // 当前建议
  recommendations: [
    'await_regulatory_clarity',
    'engage_with_consultation',
    'consider_sandbox_if_available'
  ],

  references: [
    { id: 'TREASURY_TOKEN', name: 'Treasury Token Mapping Consultation', url: 'https://treasury.gov.au/consultation/c2023-341659' },
    { id: 'RBA_CBDC', name: 'RBA Digital Currency Research', url: 'https://www.rba.gov.au/payments-and-infrastructure/central-bank-digital-currency/' }
  ]
};

// ============ Preflight 检查逻辑 ============

/**
 * 生成稳定币发行Preflight检查
 */
export function generateStablecoinPreflight(params) {
  const {
    jurisdiction,
    stablecoinType,
    pegCurrency,
    expectedIssuance,
    entityType,
    hasLicense = false
  } = params;

  const results = {
    preflight_id: `stablecoin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    jurisdiction,
    scenario: 'stablecoin_issuance',
    status: 'NEEDS_REVIEW',
    confidence: 0,
    flags: [],
    questions: [],
    requirements: [],
    references: []
  };

  // 获取管辖区规则
  const rules = getJurisdictionRules(jurisdiction);
  if (!rules) {
    results.status = 'UNKNOWN_JURISDICTION';
    results.flags.push({
      severity: 'high',
      message: `未覆盖的管辖区: ${jurisdiction}，建议咨询当地法律顾问`
    });
    return results;
  }

  // 1. 稳定币类型检查
  const typeCheck = checkStablecoinType(rules, stablecoinType);
  results.flags.push(...typeCheck.flags);
  results.questions.push(...typeCheck.questions);

  // 2. 锚定货币检查
  const pegCheck = checkPegCurrency(rules, pegCurrency, jurisdiction);
  results.flags.push(...pegCheck.flags);
  results.questions.push(...pegCheck.questions);

  // 3. 牌照要求检查
  const licenseCheck = checkLicenseRequirements(rules, entityType, hasLicense);
  results.flags.push(...licenseCheck.flags);
  results.requirements.push(...licenseCheck.requirements);

  // 4. 资本要求检查
  const capitalCheck = checkCapitalRequirements(rules, expectedIssuance);
  results.flags.push(...capitalCheck.flags);
  results.requirements.push(...capitalCheck.requirements);

  // 5. 储备要求
  const reserveCheck = checkReserveRequirements(rules);
  results.requirements.push(...reserveCheck.requirements);
  results.questions.push(...reserveCheck.questions);

  // 计算置信度
  results.confidence = calculateConfidence(results.flags, rules);

  // 确定状态
  results.status = determineStatus(results.flags, results.confidence);

  // 添加参考文献
  results.references = rules.references || [];

  return results;
}

function getJurisdictionRules(jurisdiction) {
  const ruleMap = {
    'HK': HK_STABLECOIN_RULES,
    'SG': SG_STABLECOIN_RULES,
    'JP': JP_STABLECOIN_RULES,
    'AU': AU_STABLECOIN_RULES
  };
  return ruleMap[jurisdiction] || null;
}

function checkStablecoinType(rules, stablecoinType) {
  const flags = [];
  const questions = [];

  if (rules.eligibility?.stablecoinType) {
    const { allowed, conditional, prohibited } = rules.eligibility.stablecoinType;

    if (prohibited?.includes(stablecoinType)) {
      flags.push({
        severity: 'critical',
        message: `${stablecoinType} 类型稳定币在该管辖区被禁止或不受支持`
      });
    } else if (conditional?.includes(stablecoinType)) {
      flags.push({
        severity: 'high',
        message: `${stablecoinType} 类型稳定币需要特别审批`
      });
      questions.push(`您是否已与${rules.regulator}讨论过${stablecoinType}类型稳定币的监管路径？`);
    } else if (allowed?.includes(stablecoinType)) {
      flags.push({
        severity: 'info',
        message: `${stablecoinType} 类型稳定币在该管辖区有明确监管框架`
      });
    }
  }

  return { flags, questions };
}

function checkPegCurrency(rules, pegCurrency, jurisdiction) {
  const flags = [];
  const questions = [];

  if (rules.eligibility?.pegCurrency) {
    const { primary, scs_eligible, requiresApproval } = rules.eligibility.pegCurrency;
    const eligibleList = primary || scs_eligible;

    if (eligibleList && !eligibleList.includes(pegCurrency)) {
      flags.push({
        severity: 'medium',
        message: `${pegCurrency} 可能不是该管辖区的首选锚定货币`
      });
      questions.push(`为什么选择 ${pegCurrency} 而不是本地货币作为锚定？有没有考虑过本地货币版本？`);
    }

    // 特殊检查：香港HKD稳定币
    if (jurisdiction === 'HK' && pegCurrency === 'HKD') {
      flags.push({
        severity: 'info',
        message: '港元稳定币是HKMA重点关注领域，可能有优先审批通道'
      });
    }
  }

  return { flags, questions };
}

function checkLicenseRequirements(rules, entityType, hasLicense) {
  const flags = [];
  const requirements = [];

  if (!hasLicense) {
    flags.push({
      severity: 'high',
      message: `需要申请${rules.regulator}颁发的稳定币发行牌照`
    });
  }

  if (rules.eligibility?.entityType) {
    const { required, prohibited } = rules.eligibility.entityType;
    
    if (prohibited?.includes(entityType)) {
      flags.push({
        severity: 'critical',
        message: `${entityType} 类型实体不能申请稳定币发行牌照`
      });
    }

    if (required) {
      requirements.push({
        type: 'entity_structure',
        description: `需满足实体类型要求: ${required.join(' 或 ')}`
      });
    }
  }

  return { flags, requirements };
}

function checkCapitalRequirements(rules, expectedIssuance) {
  const flags = [];
  const requirements = [];

  if (rules.capitalRequirements) {
    const { minimumCapital, mpi, scs_specific } = rules.capitalRequirements;
    
    const capital = minimumCapital || mpi || scs_specific;
    if (capital) {
      requirements.push({
        type: 'capital',
        amount: capital.amount || capital.minimum || capital.baseCapital,
        currency: capital.currency,
        description: `最低资本要求: ${capital.currency} ${(capital.amount || capital.minimum || capital.baseCapital).toLocaleString()}`
      });
    }

    // 如果有发行规模相关的资本要求
    if (scs_specific?.percentageOfIssuance && expectedIssuance) {
      const variableCapital = expectedIssuance * scs_specific.percentageOfIssuance;
      if (variableCapital > (scs_specific.minimum || 0)) {
        requirements.push({
          type: 'variable_capital',
          amount: variableCapital,
          currency: scs_specific.currency,
          description: `基于发行规模的浮动资本要求: ${scs_specific.currency} ${variableCapital.toLocaleString()}`
        });
      }
    }
  }

  return { flags, requirements };
}

function checkReserveRequirements(rules) {
  const requirements = [];
  const questions = [];

  if (rules.reserveRequirements) {
    const reserve = rules.reserveRequirements;

    requirements.push({
      type: 'reserve_ratio',
      description: `储备比例要求: ${reserve.ratio * 100}%`
    });

    if (reserve.eligibleAssets) {
      requirements.push({
        type: 'eligible_assets',
        assets: reserve.eligibleAssets,
        description: `合格储备资产: ${reserve.eligibleAssets.join(', ')}`
      });
    }

    if (reserve.custody) {
      requirements.push({
        type: 'custody',
        description: `托管要求: ${reserve.custody.required}${reserve.custody.segregation ? '，需资产隔离' : ''}`
      });
    }

    if (reserve.audit) {
      requirements.push({
        type: 'audit',
        frequency: reserve.audit.frequency,
        description: `审计要求: ${reserve.audit.frequency}独立审计${reserve.audit.publicDisclosure ? `，${reserve.audit.publicDisclosure}公开披露` : ''}`
      });
    }

    // 苏格拉底式问题
    questions.push('您计划使用哪种类型的资产作为储备？是否已确认符合监管要求？');
    questions.push('是否已选定托管银行？是否了解托管合规要求？');
  }

  return { requirements, questions };
}

function calculateConfidence(flags, rules) {
  // 基础置信度
  let confidence = 0.7;

  // 根据管辖区监管明确度调整
  if (rules.status === 'in_development') {
    confidence -= 0.3;
  }

  // 根据标记严重程度调整
  flags.forEach(flag => {
    if (flag.severity === 'critical') confidence -= 0.2;
    else if (flag.severity === 'high') confidence -= 0.1;
    else if (flag.severity === 'medium') confidence -= 0.05;
  });

  return Math.max(0.1, Math.min(0.95, confidence));
}

function determineStatus(flags, confidence) {
  const hasCritical = flags.some(f => f.severity === 'critical');
  const hasHigh = flags.some(f => f.severity === 'high');

  if (hasCritical) return 'HIGH_RISK';
  if (hasHigh || confidence < 0.5) return 'NEEDS_REVIEW';
  if (confidence >= 0.8) return 'LIKELY_COMPLIANT';
  return 'NEEDS_REVIEW';
}

// ============ 导出场景列表 ============

export const STABLECOIN_SCENARIOS = {
  issue_stablecoin: {
    name: 'Issue Stablecoin',
    description: '发行新稳定币',
    handler: generateStablecoinPreflight
  },
  list_stablecoin: {
    name: 'List Stablecoin on Exchange',
    description: '在交易所上架稳定币',
    relatedScenario: 'hk_vasp'  // 关联VASP规则
  },
  accept_stablecoin_payment: {
    name: 'Accept Stablecoin as Payment',
    description: '接受稳定币支付',
    relatedScenario: 'payment_services'
  }
};
