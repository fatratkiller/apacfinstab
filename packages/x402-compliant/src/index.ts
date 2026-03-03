/**
 * @apacfinstab/x402-compliant
 * 
 * x402 payment client with built-in regulatory compliance checks.
 * Wraps any x402 client to add automatic preflight compliance verification.
 * 
 * @example
 * ```typescript
 * import { wrapX402Client } from '@apacfinstab/x402-compliant';
 * 
 * const compliantClient = wrapX402Client(originalClient, {
 *   fromJurisdiction: 'HK',
 *   blockOnHighRisk: true
 * });
 * 
 * // Now all payments go through compliance check first
 * await compliantClient.pay(recipient, amount, token);
 * ```
 */

// ============ Types ============

export interface PreflightResult {
  preflightId: string;
  timestamp: string;
  status: 'CLEAR' | 'REVIEW_REQUIRED' | 'HIGH_RISK' | 'BLOCKED';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: PreflightFlag[];
  references: string[];
  suggestedActions: string[];
}

export interface PreflightFlag {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  question?: string;
}

export interface ComplianceOptions {
  /** Sender jurisdiction (ISO country code: HK, SG, US, etc.) */
  fromJurisdiction?: string;
  
  /** Block payment if risk level is high or critical */
  blockOnHighRisk?: boolean;
  
  /** Block payment if status is BLOCKED */
  blockOnBlocked?: boolean;
  
  /** Custom preflight API endpoint */
  preflightEndpoint?: string;
  
  /** Callback when preflight completes */
  onPreflight?: (result: PreflightResult) => void;
  
  /** Callback when payment is blocked */
  onBlocked?: (result: PreflightResult) => void;
  
  /** Skip preflight for amounts below this threshold */
  skipBelowAmount?: number;
  
  /** Enable verbose logging */
  verbose?: boolean;
}

export interface PaymentParams {
  toAddress: string;
  amount: number;
  token: string;
  chain?: string;
  toJurisdiction?: string;
  metadata?: Record<string, unknown>;
}

export interface X402Client {
  pay: (params: PaymentParams) => Promise<unknown>;
  [key: string]: unknown;
}

// ============ Constants ============

const DEFAULT_PREFLIGHT_ENDPOINT = 'https://apacfinstab-compliance-api.kyleleo2018.workers.dev/v1/preflight/x402';

// ============ Main Function ============

/**
 * Wrap an x402 client with compliance checks
 */
export function wrapX402Client<T extends X402Client>(
  client: T,
  options: ComplianceOptions = {}
): T & { preflight: (params: PaymentParams) => Promise<PreflightResult> } {
  const {
    fromJurisdiction,
    blockOnHighRisk = true,
    blockOnBlocked = true,
    preflightEndpoint = DEFAULT_PREFLIGHT_ENDPOINT,
    onPreflight,
    onBlocked,
    skipBelowAmount,
    verbose = false
  } = options;

  const log = verbose ? console.log.bind(console, '[x402-compliant]') : () => {};

  // Preflight function
  async function preflight(params: PaymentParams): Promise<PreflightResult> {
    const { toAddress, amount, token, chain = 'base', toJurisdiction } = params;

    log(`Preflight check: ${amount} ${token} to ${toAddress}`);

    const response = await fetch(preflightEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAddress: 'sender', // Will be filled by actual client
        toAddress,
        amount,
        token,
        chain,
        fromJurisdiction,
        toJurisdiction
      })
    });

    if (!response.ok) {
      throw new Error(`Preflight check failed: ${response.statusText}`);
    }

    const result: PreflightResult = await response.json();
    
    log(`Preflight result: ${result.status} (${result.riskLevel})`);
    
    if (onPreflight) {
      onPreflight(result);
    }

    return result;
  }

  // Wrapped pay function
  async function compliantPay(params: PaymentParams): Promise<unknown> {
    const { amount } = params;

    // Skip preflight for small amounts if configured
    if (skipBelowAmount && amount < skipBelowAmount) {
      log(`Skipping preflight: amount ${amount} below threshold ${skipBelowAmount}`);
      return client.pay(params);
    }

    // Run preflight check
    const result = await preflight(params);

    // Check if payment should be blocked
    if (blockOnBlocked && result.status === 'BLOCKED') {
      log('Payment BLOCKED by compliance check');
      if (onBlocked) onBlocked(result);
      throw new ComplianceBlockedError(result);
    }

    if (blockOnHighRisk && (result.riskLevel === 'high' || result.riskLevel === 'critical')) {
      log(`Payment BLOCKED due to ${result.riskLevel} risk`);
      if (onBlocked) onBlocked(result);
      throw new ComplianceBlockedError(result);
    }

    // Proceed with payment
    log('Compliance check passed, proceeding with payment');
    return client.pay(params);
  }

  // Return wrapped client
  return {
    ...client,
    pay: compliantPay,
    preflight
  } as T & { preflight: (params: PaymentParams) => Promise<PreflightResult> };
}

// ============ Error Classes ============

export class ComplianceBlockedError extends Error {
  public readonly preflightResult: PreflightResult;

  constructor(result: PreflightResult) {
    super(`Payment blocked by compliance check: ${result.status} (${result.riskLevel})`);
    this.name = 'ComplianceBlockedError';
    this.preflightResult = result;
  }
}

// ============ Standalone Functions ============

/**
 * Run a standalone preflight check without wrapping a client
 */
export async function checkCompliance(
  params: {
    fromAddress?: string;
    toAddress: string;
    amount: number;
    token: string;
    chain?: string;
    fromJurisdiction?: string;
    toJurisdiction?: string;
  },
  endpoint = DEFAULT_PREFLIGHT_ENDPOINT
): Promise<PreflightResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`Compliance check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if a payment would pass compliance
 */
export async function wouldPass(
  params: Parameters<typeof checkCompliance>[0],
  options: { allowHighRisk?: boolean } = {}
): Promise<boolean> {
  const result = await checkCompliance(params);
  
  if (result.status === 'BLOCKED') return false;
  if (!options.allowHighRisk && result.riskLevel === 'high') return false;
  if (result.riskLevel === 'critical') return false;
  
  return true;
}

// ============ Token Launch Check ============

export interface TokenLaunchParams {
  tokenName: string;
  tokenSymbol: string;
  totalSupply?: number;
  distribution?: {
    team?: number;
    presale?: number;
    public?: number;
  };
  creatorJurisdiction: string;
  hasRevenue?: boolean;
  hasGovernance?: boolean;
}

export interface TokenLaunchResult extends PreflightResult {
  howeyScore: number;
}

/**
 * Check compliance for token launch
 */
export async function checkTokenLaunch(
  params: TokenLaunchParams,
  endpoint = 'https://apacfinstab-compliance-api.kyleleo2018.workers.dev/v1/preflight/token-launch'
): Promise<TokenLaunchResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`Token launch check failed: ${response.statusText}`);
  }

  return response.json();
}
