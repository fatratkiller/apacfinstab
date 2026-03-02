"""配置管理"""
import os
from dotenv import load_dotenv

load_dotenv()

# Telegram
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BOT_USERNAME = os.getenv("BOT_USERNAME", "apacfinstab_bot")

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID")

# 业务配置
DAILY_FREE_LIMIT = int(os.getenv("DAILY_FREE_LIMIT", "3"))
PRO_PRICE_MONTHLY = int(os.getenv("PRO_PRICE_MONTHLY", "19"))

# 功能定义
FREE_FEATURES = {
    "basic_query",      # 基础查询（限次数）
    "weekly_digest",    # 每周摘要
    "faq",              # FAQ查询
}

PRO_FEATURES = {
    "unlimited_query",      # 无限深度查询
    "realtime_alerts",      # 实时监管更新
    "custom_monitoring",    # 自定义关键词监控
    "cross_region_compare", # 跨地区对比
    "export_pdf",           # 导出PDF
    "history",              # 历史记录
}
