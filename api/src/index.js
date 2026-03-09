/**
 * APAC FINSTAB Compliance API
 * 
 * Endpoints:
 * - POST /v1/preflight/x402 - x402支付合规预检
 * - POST /v1/preflight/token-launch - Token发行合规检查
 * - POST /v1/preflight/hk-vasp - 香港VASP合规预检 (NEW)
 * - GET  /v1/preflight/hk-vasp/license-check?activity=xxx - 快速牌照检查
 * - GET  /v1/preflight/hk-vasp/token-check?symbol=xxx - 代币上架检查
 * - GET  /v1/preflight/hk-vasp/requirements?type=capital|aml - 获取要求
 * - POST /v1/feedback/erc8004 - 生成ERC-8004 Feedback数据
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { x402Preflight } from './preflight/x402.js';
import { tokenLaunchPreflight } from './preflight/token-launch.js';
import { hkVaspPreflight, quickLicenseCheck, quickTokenCheck, getCapitalRequirements, getAmlThresholds } from './preflight/hk-vasp.js';
import { generateERC8004Feedback } from './reputation/erc8004.js';

const app = new Hono();

// CORS
app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '0.1.0' }));

// ============ x402 Preflight ============
app.post('/v1/preflight/x402', async (c) => {
  const body = await c.req.json();
  const result = await x402Preflight(body);
  return c.json(result);
});

// ============ Token Launch Preflight ============
app.post('/v1/preflight/token-launch', async (c) => {
  const body = await c.req.json();
  const result = await tokenLaunchPreflight(body);
  return c.json(result);
});

// ============ HK VASP Preflight ============
app.post('/v1/preflight/hk-vasp', async (c) => {
  const body = await c.req.json();
  const result = await hkVaspPreflight(body);
  return c.json(result);
});

// HK VASP Quick checks
app.get('/v1/preflight/hk-vasp/license-check', (c) => {
  const activityType = c.req.query('activity');
  if (!activityType) {
    return c.json({ error: 'Missing activity parameter' }, 400);
  }
  const result = quickLicenseCheck(activityType);
  return c.json(result);
});

app.get('/v1/preflight/hk-vasp/token-check', (c) => {
  const symbol = c.req.query('symbol');
  const type = c.req.query('type') || 'utility';
  if (!symbol) {
    return c.json({ error: 'Missing symbol parameter' }, 400);
  }
  const result = quickTokenCheck(symbol, type);
  return c.json(result);
});

app.get('/v1/preflight/hk-vasp/requirements', (c) => {
  const type = c.req.query('type') || 'capital';
  if (type === 'capital') {
    return c.json(getCapitalRequirements());
  } else if (type === 'aml') {
    return c.json(getAmlThresholds());
  }
  return c.json({ error: 'Unknown requirement type' }, 400);
});

// ============ ERC-8004 Feedback ============
app.post('/v1/feedback/erc8004', async (c) => {
  const body = await c.req.json();
  const result = await generateERC8004Feedback(body);
  return c.json(result);
});

// Export for Cloudflare Workers
export default app;

// Local dev server
import { serve } from '@hono/node-server';

const port = process.env.PORT || 8787;
serve({
  fetch: app.fetch,
  port
});
console.log(`🚀 APAC FINSTAB API running on http://localhost:${port}`);
