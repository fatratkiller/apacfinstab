"""Stripe支付集成"""
import stripe
from datetime import date, timedelta
from typing import Optional
import config
import database as db

stripe.api_key = config.STRIPE_SECRET_KEY


async def create_checkout_session(telegram_id: int, username: str = None) -> str:
    """
    创建Stripe Checkout会话
    
    Returns:
        Checkout页面URL
    """
    # 获取或创建Stripe客户
    user = await db.get_user(telegram_id)
    
    if user and user.get("stripe_customer_id"):
        customer_id = user["stripe_customer_id"]
    else:
        customer = stripe.Customer.create(
            metadata={
                "telegram_id": str(telegram_id),
                "username": username or "",
            }
        )
        customer_id = customer.id
    
    # 创建Checkout会话
    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{
            "price": config.STRIPE_PRICE_ID,
            "quantity": 1,
        }],
        mode="subscription",
        success_url=f"https://t.me/{config.BOT_USERNAME}?start=payment_success",
        cancel_url=f"https://t.me/{config.BOT_USERNAME}?start=payment_cancelled",
        metadata={
            "telegram_id": str(telegram_id),
        }
    )
    
    return session.url


async def handle_webhook_event(payload: bytes, sig_header: str) -> Optional[dict]:
    """
    处理Stripe Webhook事件
    
    Returns:
        处理结果或None
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, config.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return {"error": "Invalid payload"}
    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature"}
    
    # 处理不同事件类型
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        telegram_id = int(session["metadata"]["telegram_id"])
        customer_id = session["customer"]
        
        # 计算订阅结束日期（30天后）
        subscription_end = date.today() + timedelta(days=30)
        
        # 升级用户
        await db.upgrade_to_pro(telegram_id, subscription_end, customer_id)
        
        # 记录支付
        await db.log_payment(
            telegram_id=telegram_id,
            stripe_payment_id=session["payment_intent"],
            amount=session["amount_total"] / 100,
            status="completed"
        )
        
        return {"success": True, "telegram_id": telegram_id, "action": "upgraded"}
    
    elif event["type"] == "invoice.payment_succeeded":
        # 续费成功
        invoice = event["data"]["object"]
        customer_id = invoice["customer"]
        
        # 从customer metadata获取telegram_id
        customer = stripe.Customer.retrieve(customer_id)
        telegram_id = int(customer["metadata"].get("telegram_id", 0))
        
        if telegram_id:
            subscription_end = date.today() + timedelta(days=30)
            await db.upgrade_to_pro(telegram_id, subscription_end, customer_id)
            return {"success": True, "telegram_id": telegram_id, "action": "renewed"}
    
    elif event["type"] == "customer.subscription.deleted":
        # 订阅取消
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]
        
        customer = stripe.Customer.retrieve(customer_id)
        telegram_id = int(customer["metadata"].get("telegram_id", 0))
        
        if telegram_id:
            await db.downgrade_to_free(telegram_id)
            return {"success": True, "telegram_id": telegram_id, "action": "cancelled"}
    
    return {"success": True, "action": "ignored"}


async def cancel_subscription(telegram_id: int) -> bool:
    """取消订阅"""
    user = await db.get_user(telegram_id)
    if not user or not user.get("stripe_customer_id"):
        return False
    
    # 获取该客户的活跃订阅
    subscriptions = stripe.Subscription.list(
        customer=user["stripe_customer_id"],
        status="active"
    )
    
    for sub in subscriptions.data:
        stripe.Subscription.delete(sub.id)
    
    await db.downgrade_to_free(telegram_id)
    return True
