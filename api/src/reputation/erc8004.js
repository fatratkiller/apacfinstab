/**
 * ERC-8004 Reputation Feedback Generator
 * 
 * 生成可写入ERC-8004 Reputation Registry的反馈数据
 */

import { ethers } from 'ethers';

// ERC-8004 Reputation Registry ABI (关键函数)
const REPUTATION_REGISTRY_ABI = [
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external',
  'event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)'
];

// 已部署的Registry地址（需要更新为实际地址）
const REGISTRY_ADDRESSES = {
  mainnet: '0x0000000000000000000000000000000000000000', // TODO: 填入实际地址
  sepolia: '0x0000000000000000000000000000000000000000', // TODO: 填入测试网地址
  base: '0x0000000000000000000000000000000000000000'
};

/**
 * 生成ERC-8004 Feedback数据
 * @param {Object} params
 * @param {number} params.agentId - ERC-8004 Agent ID
 * @param {string} params.agentRegistry - Agent Registry地址
 * @param {string} params.checkType - 检查类型 (x402/token-launch/mcp)
 * @param {Object} params.preflightResult - Preflight检查结果
 * @param {string} params.jurisdiction - 检查涉及的监管地区
 */
export async function generateERC8004Feedback(params) {
  const {
    agentId,
    agentRegistry,
    checkType,
    preflightResult,
    jurisdiction
  } = params;

  // 根据preflight结果计算合规评分 (0-100)
  const complianceScore = calculateComplianceScore(preflightResult);
  
  // 生成feedback ID
  const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 构建链下feedback文件
  const offChainFeedback = {
    agentRegistry,
    agentId,
    clientAddress: 'APAC_FINSTAB_ADDRESS', // 实际部署时替换
    createdAt: new Date().toISOString(),
    value: complianceScore,
    valueDecimals: 0,
    tag1: 'compliance',
    tag2: jurisdiction || 'GLOBAL',
    
    complianceDetails: {
      checkType,
      jurisdiction,
      preflightId: preflightResult.preflightId,
      status: preflightResult.status,
      riskLevel: preflightResult.riskLevel,
      flagCount: preflightResult.flags?.length || 0,
      references: preflightResult.references || []
    },
    
    proofOfCheck: {
      timestamp: preflightResult.timestamp,
      version: '1.0.0',
      provider: 'APAC FINSTAB'
    }
  };

  // 计算feedback hash (用于链上验证)
  const feedbackJSON = JSON.stringify(offChainFeedback);
  const feedbackHash = ethers.keccak256(ethers.toUtf8Bytes(feedbackJSON));

  // 生成链上调用数据
  const onChainParams = {
    agentId,
    value: complianceScore,
    valueDecimals: 0,
    tag1: 'compliance',
    tag2: jurisdiction || 'GLOBAL',
    endpoint: preflightResult.input?.endpoint || '',
    feedbackURI: '', // 需要上传到IPFS后填入
    feedbackHash
  };

  // 生成ABI编码的调用数据
  const iface = new ethers.Interface(REPUTATION_REGISTRY_ABI);
  const calldata = iface.encodeFunctionData('giveFeedback', [
    onChainParams.agentId,
    onChainParams.value,
    onChainParams.valueDecimals,
    onChainParams.tag1,
    onChainParams.tag2,
    onChainParams.endpoint,
    onChainParams.feedbackURI,
    onChainParams.feedbackHash
  ]);

  return {
    feedbackId,
    complianceScore,
    scoreInterpretation: interpretScore(complianceScore),
    
    // 链下数据（上传到IPFS）
    offChainFeedback,
    
    // 链上参数
    onChainParams,
    
    // 调用数据
    transaction: {
      to: REGISTRY_ADDRESSES.base, // 默认用Base
      data: calldata,
      note: '调用ERC-8004 Reputation Registry.giveFeedback()'
    },
    
    // 下一步指引
    nextSteps: [
      '1. 将offChainFeedback上传到IPFS',
      '2. 用IPFS CID更新feedbackURI',
      '3. 发送transaction到Registry合约'
    ]
  };
}

/**
 * 根据Preflight结果计算合规评分
 */
function calculateComplianceScore(preflightResult) {
  if (!preflightResult) return 50;
  
  const { status, riskLevel, flags } = preflightResult;
  
  let score = 100;
  
  // 根据状态扣分
  switch (status) {
    case 'BLOCKED':
      score -= 70;
      break;
    case 'HIGH_RISK':
      score -= 50;
      break;
    case 'REVIEW_REQUIRED':
      score -= 30;
      break;
    case 'CLEAR':
      score -= 0;
      break;
  }
  
  // 根据flag数量扣分
  if (flags && flags.length > 0) {
    for (const flag of flags) {
      switch (flag.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 解释评分含义
 */
function interpretScore(score) {
  if (score >= 90) return { level: 'EXCELLENT', description: '合规表现优秀，无重大风险' };
  if (score >= 70) return { level: 'GOOD', description: '合规表现良好，有轻微风险点' };
  if (score >= 50) return { level: 'FAIR', description: '需要关注，存在中等风险' };
  if (score >= 30) return { level: 'POOR', description: '合规问题较多，需要改进' };
  return { level: 'CRITICAL', description: '严重合规问题，可能违规' };
}

/**
 * 提交Feedback到链上（需要私钥）
 */
export async function submitFeedbackOnChain(feedback, privateKey, network = 'base') {
  const provider = new ethers.JsonRpcProvider(getRpcUrl(network));
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const registry = new ethers.Contract(
    REGISTRY_ADDRESSES[network],
    REPUTATION_REGISTRY_ABI,
    wallet
  );
  
  const tx = await registry.giveFeedback(
    feedback.onChainParams.agentId,
    feedback.onChainParams.value,
    feedback.onChainParams.valueDecimals,
    feedback.onChainParams.tag1,
    feedback.onChainParams.tag2,
    feedback.onChainParams.endpoint,
    feedback.onChainParams.feedbackURI,
    feedback.onChainParams.feedbackHash
  );
  
  return tx;
}

function getRpcUrl(network) {
  const urls = {
    mainnet: 'https://eth.llamarpc.com',
    base: 'https://mainnet.base.org',
    sepolia: 'https://rpc.sepolia.org'
  };
  return urls[network] || urls.base;
}
