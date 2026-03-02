# APAC FINSTAB Telegram Bot

监管合规助手 — Freemium模式

## 功能分层

### 🆓 免费层
- 基础法规查询（每天3次，200字内回答）
- 每周合规摘要
- 常见问题FAQ

### 💎 Pro层 ($19/月)
- 无限深度查询
- 实时监管更新推送
- 自定义关键词监控
- 跨地区对比分析
- PDF报告导出
- 历史查询记录

## 技术栈

- **Bot框架**: python-telegram-bot v21+
- **数据库**: Supabase (PostgreSQL)
- **支付**: Stripe
- **部署**: Railway / Render

## 本地开发

```bash
# 1. 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入真实值

# 4. 运行
python main.py
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `TELEGRAM_BOT_TOKEN` | 从 @BotFather 获取 |
| `SUPABASE_URL` | Supabase项目URL |
| `SUPABASE_KEY` | Supabase anon key |
| `STRIPE_SECRET_KEY` | Stripe密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook密钥 |

## 部署

详见 `docs/deployment.md`
