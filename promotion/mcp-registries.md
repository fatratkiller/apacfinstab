# MCP目录/注册表提交追踪

> **目标：** 被尽可能多的MCP目录收录，提升GEO效果

---

## 📊 提交状态总览

| 目录 | 状态 | 提交日期 | DA | 备注 |
|------|------|----------|-----|------|
| **Smithery** | ⏳ 待登录 | - | 高 | 需要 `npx @smithery/cli auth login` |
| **官方MCP Registry** | ⏳ 待npm发布 | - | 最高 | 需要 `mcp-publisher` + npm包 |
| **Glama** | 🔍 调研中 | - | 高 | 需确认提交方式 |
| **awesome-mcp-servers** | 📝 PR准备好 | - | 高 | GitHub PR |

---

## 1. Smithery (smithery.ai)

### 状态：⏳ 待老板登录

### 发布命令
```bash
# Step 1: 登录 (需要老板执行)
npx @smithery/cli auth login

# Step 2: 发布
npx @smithery/cli mcp publish "https://apacfinstab-mcp.kyleleo2018.workers.dev" -n apacfinstab/regulatory-intelligence
```

### 信息
- **名称**: apacfinstab/regulatory-intelligence
- **URL**: https://apacfinstab-mcp.kyleleo2018.workers.dev
- **描述**: APAC crypto regulatory intelligence for AI agents

---

## 2. 官方MCP Registry (registry.modelcontextprotocol.io)

### 状态：⏳ 需要npm发布

### 前置条件
1. npm账户
2. GitHub账户
3. 发布MCP server为npm包

### 发布流程
```bash
# 1. 安装mcp-publisher
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_darwin_arm64.tar.gz" | tar xz
sudo mv mcp-publisher /usr/local/bin/

# 2. 创建server.json
mcp-publisher init

# 3. 登录
mcp-publisher login

# 4. 发布
mcp-publisher publish
```

### package.json要求
```json
{
  "name": "@apacfinstab/mcp-server",
  "mcpName": "io.github.fatratkiller/apacfinstab"
}
```

---

## 3. Glama (glama.ai/mcp/servers)

### 状态：🔍 调研中

### 已知信息
- 目录URL: https://glama.ai/mcp/servers
- API: https://glama.ai/mcp/servers.json
- 可能自动抓取public MCP servers

### 待办
- [ ] 确认是否自动收录
- [ ] 如需手动提交，确认方式

---

## 4. awesome-mcp-servers (GitHub)

### 状态：📝 PR内容准备好

### PR文件
`/Users/kyle/clawd/apacfinstab/promotion/awesome-mcp-servers-pr.md`

### 执行步骤
1. Fork punkpeye/awesome-mcp-servers
2. 在Legal类别添加我们的server
3. 提交PR

---

## 🎯 优先级

1. **awesome-mcp-servers** - 最快，GitHub PR
2. **Smithery** - 流量大，需登录
3. **Glama** - 需调研
4. **官方Registry** - 最权威，需要发npm包

---

*创建时间: 2026-03-01*
