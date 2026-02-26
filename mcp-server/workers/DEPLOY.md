# APAC FINSTAB MCP Server - Cloudflare Workers 部署指南

## 准备工作

✅ 代码已准备好
✅ 依赖已安装 (`npm install` 完成)

## 部署步骤

### 1. 登录 Cloudflare (一次性)

```bash
cd /Users/kyle/clawd/apacfinstab/mcp-server/workers
npx wrangler login
```

这会打开浏览器让你登录 Cloudflare 账号。

### 2. 部署 Worker

```bash
npx wrangler deploy
```

部署成功后会显示 Worker URL，格式如：
`https://apacfinstab-mcp.{your-subdomain}.workers.dev`

### 3. 测试端点

```bash
# 获取 MCP manifest
curl https://apacfinstab-mcp.{your-subdomain}.workers.dev/mcp.json

# 列出工具
curl https://apacfinstab-mcp.{your-subdomain}.workers.dev/tools

# 调用工具
curl -X POST https://apacfinstab-mcp.{your-subdomain}.workers.dev/call \
  -H "Content-Type: application/json" \
  -d '{"name":"getRegionOverview","arguments":{"region":"HK"}}'
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` 或 `/mcp.json` | GET | MCP manifest (工具目录发现) |
| `/tools` | GET | 列出所有可用工具 |
| `/call` | POST | 执行工具调用 |
| `/health` | GET | 健康检查 |

## 可用工具

1. **getLatestPolicies** - 获取最新政策事件
2. **getRegionOverview** - 获取地区监管概览
3. **comparePolicies** - 跨地区政策对比
4. **checkCompliance** - 合规要求检查

## 本地开发测试

```bash
cd /Users/kyle/clawd/apacfinstab/mcp-server/workers
npx wrangler dev
```

然后访问 `http://localhost:8787/mcp.json`

## 自定义域名 (可选)

部署后可在 Cloudflare Dashboard 添加自定义域名，如 `mcp.apacfinstab.com`
