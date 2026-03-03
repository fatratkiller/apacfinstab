/**
 * APAC FINSTAB Compliance API
 * 
 * Endpoints:
 * - POST /v1/preflight/x402 - x402支付合规预检
 * - POST /v1/preflight/token-launch - Token发行合规检查
 * - POST /v1/feedback/erc8004 - 生成ERC-8004 Feedback数据
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { x402Preflight } from './preflight/x402.js';
import { tokenLaunchPreflight } from './preflight/token-launch.js';
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
