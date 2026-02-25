#!/usr/bin/env node
/**
 * 构建脚本：将数据嵌入worker.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const distDir = path.join(__dirname, 'dist');

console.log('📦 Building APAC FINSTAB MCP Worker...');

// 读取数据
const policyEvents = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/policy-events.json'))).events;
const regionOverviews = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/region-overviews.json')));

console.log(`📊 Loaded ${policyEvents.length} policy events`);
console.log(`🌏 Loaded ${Object.keys(regionOverviews).length} region overviews`);

// 读取worker模板
let workerCode = fs.readFileSync(path.join(__dirname, 'worker.js'), 'utf8');

// 替换数据占位符
workerCode = workerCode.replace(
  'var POLICY_DATA = [];',
  `var POLICY_DATA = ${JSON.stringify(policyEvents)};`
);
workerCode = workerCode.replace(
  'var REGION_DATA = {};',
  `var REGION_DATA = ${JSON.stringify(regionOverviews)};`
);

// 创建dist目录
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 写入最终文件
fs.writeFileSync(path.join(distDir, 'worker.js'), workerCode);
fs.copyFileSync(path.join(__dirname, 'wrangler.toml'), path.join(distDir, 'wrangler.toml'));

const stats = fs.statSync(path.join(distDir, 'worker.js'));
console.log(`✅ Build complete! dist/worker.js (${(stats.size / 1024).toFixed(1)} KB)`);
console.log('');
console.log('🚀 Deploy steps:');
console.log('   1. cd mcp/server/dist');
console.log('   2. npx wrangler login   # 首次需要登录');
console.log('   3. npx wrangler deploy  # 部署到Cloudflare');
