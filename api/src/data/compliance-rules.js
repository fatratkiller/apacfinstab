/**
 * 合规规则数据
 * 
 * 实际部署时应从数据库加载
 */

// 制裁名单（示例）
export const SANCTIONS_LIST = {
  addresses: [
    // OFAC SDN List 示例地址
    '0x1234567890123456789012345678901234567890',
    // 添加更多...
  ],
  lastUpdated: '2026-03-01'
};

// KYC阈值（按地区）
export const KYC_THRESHOLDS = {
  HK: {
    kycRequired: 8000,      // HKD 8000 ≈ USD 1000
    enhancedDueDiligence: 120000,
    currency: 'HKD'
  },
  SG: {
    kycRequired: 5000,      // SGD
    enhancedDueDiligence: 20000,
    currency: 'SGD'
  },
  JP: {
    kycRequired: 100000,    // JPY ≈ USD 700
    enhancedDueDiligence: 2000000,
    currency: 'JPY'
  },
  US: {
    kycRequired: 3000,      // USD
    enhancedDueDiligence: 10000,
    currency: 'USD'
  },
  DEFAULT: {
    kycRequired: 1000,      // USD equivalent
    enhancedDueDiligence: 10000,
    currency: 'USD'
  }
};

// 地区规则
export const JURISDICTION_RULES = {
  crossBorder: {
    HK: {
      question: '是否符合香港跨境支付规定？',
      references: ['HKMA Cross-Border Guidelines', 'AMLO']
    },
    CN: {
      question: '是否符合中国外汇管理规定？',
      references: ['SAFE Regulations', 'PBoC Guidelines']
    },
    SG: {
      question: '是否符合MAS跨境支付要求？',
      references: ['MAS Notice 626', 'PSA 2019']
    }
  },
  tokens: {
    USDT: {
      restricted: ['CN'],
      references: ['PBoC Crypto Ban 2021']
    },
    BTC: {
      restricted: ['CN'],
      references: ['PBoC Crypto Ban 2021']
    },
    ETH: {
      restricted: ['CN'],
      references: ['PBoC Crypto Ban 2021']
    }
  }
};

// 证券法规则（按地区）
export const SECURITIES_RULES = {
  HK: {
    requiresLicense: true,
    severity: 'high',
    message: '香港发行可能构成受监管活动，需SFC批准',
    question: '是否已评估SFO Schedule 1下的"证券"定义？',
    references: ['SFO Schedule 1', 'SFC Statement on ICOs (2017)', 'SFC VASP Guidelines']
  },
  SG: {
    requiresLicense: true,
    severity: 'high',
    message: '新加坡发行可能需要MAS批准',
    question: '是否已评估SFA下的资本市场产品定义？',
    references: ['SFA', 'MAS Guide to Digital Token Offerings']
  },
  US: {
    requiresLicense: true,
    severity: 'critical',
    message: '美国发行几乎确定需要SEC注册或豁免',
    question: '是否有Reg D/S/A+豁免方案？',
    references: ['Securities Act 1933', 'Howey Test', 'SEC Framework for Digital Assets']
  },
  JP: {
    requiresLicense: true,
    severity: 'high',
    message: '日本发行需要FSA/JFSA批准',
    question: '是否符合PSA/FIEA要求？',
    references: ['Payment Services Act', 'FIEA', 'JFSA Guidelines']
  }
};
