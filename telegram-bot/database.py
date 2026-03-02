"""数据库操作 - Supabase"""
from datetime import datetime, date
from typing import Optional
from supabase import create_client, Client
import config

# 初始化Supabase客户端
supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)


class UserTier:
    FREE = "free"
    PRO = "pro"


async def get_user(telegram_id: int) -> Optional[dict]:
    """获取用户信息"""
    response = supabase.table("users").select("*").eq("telegram_id", telegram_id).execute()
    return response.data[0] if response.data else None


async def create_user(telegram_id: int, username: str = None) -> dict:
    """创建新用户"""
    user_data = {
        "telegram_id": telegram_id,
        "username": username,
        "tier": UserTier.FREE,
        "daily_free_uses": config.DAILY_FREE_LIMIT,
        "last_reset_date": date.today().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
    }
    response = supabase.table("users").insert(user_data).execute()
    return response.data[0]


async def get_or_create_user(telegram_id: int, username: str = None) -> dict:
    """获取或创建用户"""
    user = await get_user(telegram_id)
    if not user:
        user = await create_user(telegram_id, username)
    return user


async def reset_daily_uses_if_needed(user: dict) -> dict:
    """如果是新的一天，重置免费次数"""
    last_reset = date.fromisoformat(user["last_reset_date"])
    today = date.today()
    
    if last_reset < today:
        response = supabase.table("users").update({
            "daily_free_uses": config.DAILY_FREE_LIMIT,
            "last_reset_date": today.isoformat()
        }).eq("telegram_id", user["telegram_id"]).execute()
        return response.data[0]
    return user


async def decrement_free_uses(telegram_id: int) -> int:
    """扣减免费次数，返回剩余次数"""
    user = await get_user(telegram_id)
    new_count = max(0, user["daily_free_uses"] - 1)
    
    supabase.table("users").update({
        "daily_free_uses": new_count
    }).eq("telegram_id", telegram_id).execute()
    
    return new_count


async def upgrade_to_pro(telegram_id: int, subscription_end: date, stripe_customer_id: str = None) -> dict:
    """升级到Pro"""
    response = supabase.table("users").update({
        "tier": UserTier.PRO,
        "subscription_end_date": subscription_end.isoformat(),
        "stripe_customer_id": stripe_customer_id,
    }).eq("telegram_id", telegram_id).execute()
    return response.data[0]


async def downgrade_to_free(telegram_id: int) -> dict:
    """降级到免费"""
    response = supabase.table("users").update({
        "tier": UserTier.FREE,
        "subscription_end_date": None,
    }).eq("telegram_id", telegram_id).execute()
    return response.data[0]


async def is_subscription_active(user: dict) -> bool:
    """检查订阅是否有效"""
    if user["tier"] != UserTier.PRO:
        return False
    if not user.get("subscription_end_date"):
        return False
    end_date = date.fromisoformat(user["subscription_end_date"])
    return end_date >= date.today()


async def log_usage(telegram_id: int, query_type: str, is_paid_feature: bool):
    """记录使用日志"""
    supabase.table("usage_logs").insert({
        "telegram_id": telegram_id,
        "query_type": query_type,
        "is_paid_feature": is_paid_feature,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()


async def log_payment(telegram_id: int, stripe_payment_id: str, amount: float, status: str):
    """记录支付日志"""
    supabase.table("payments").insert({
        "telegram_id": telegram_id,
        "stripe_payment_id": stripe_payment_id,
        "amount": amount,
        "status": status,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
