# PolicyPedia ACP Agent

Virtuals ACP integration for APAC FINSTAB compliance services.

## Overview

This module implements a Virtuals ACP (Agent Commerce Protocol) agent that sells compliance services to other AI agents.

## Services

| Service | Price | Description |
|---------|-------|-------------|
| `reg_lookup` | $0.01 | Query APAC crypto regulations |
| `compliance_check` | $0.05 | Check activity compliance |
| `license_compare` | $0.02 | Compare licensing costs |

## Setup

### 1. Create Wallet

Create a dedicated wallet for ACP transactions:
```bash
# Use any wallet generator, but NEVER use your main wallet
# Recommend: Create new wallet in MetaMask for testing
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Register Agent (Sandbox)

1. Go to https://sandbox.game.virtuals.io/
2. Connect your dedicated wallet
3. Register as "PolicyPedia" agent
4. Note down your SESSION_ENTITY_KEY_ID
5. Add it to .env

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Agent

```bash
npm start
```

## Architecture

```
ACP Network
    │
    ▼
PolicyPedia Agent (this module)
    │
    ▼
APAC FINSTAB MCP API (Cloudflare Workers)
    │
    ▼
Regulatory Database
```

## Development

### Testing Locally

```bash
# Test service handlers without ACP connection
npm test
```

### Adding New Services

1. Define service in `SERVICES` object
2. Implement handler function
3. Add case in `handleNewTask` switch
4. Update pricing in docs

## Links

- [ACP Documentation](https://whitepaper.virtuals.io/builders-hub/acp-tech-playbook)
- [Node SDK](https://www.npmjs.com/package/@virtuals-protocol/acp-node)
- [Sandbox Registration](https://sandbox.game.virtuals.io/)
- [APAC FINSTAB MCP API](https://apacfinstab.kyleleo2018.workers.dev)

## Status

- [x] Service definitions
- [x] MCP API integration
- [ ] Sandbox registration
- [ ] ACP client connection
- [ ] Mainnet graduation
