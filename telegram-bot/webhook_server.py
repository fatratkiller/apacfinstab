"""Stripe Webhook服务器

需要单独部署，用于接收Stripe回调
可以和Bot部署在同一服务器上，也可以分开
"""
import asyncio
from aiohttp import web
import payments
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 用于发送Telegram消息通知用户
BOT_INSTANCE = None


def set_bot_instance(bot):
    """设置Bot实例，用于发送通知"""
    global BOT_INSTANCE
    BOT_INSTANCE = bot


async def handle_stripe_webhook(request):
    """处理Stripe Webhook"""
    payload = await request.read()
    sig_header = request.headers.get("Stripe-Signature")
    
    if not sig_header:
        return web.Response(status=400, text="Missing signature")
    
    result = await payments.handle_webhook_event(payload, sig_header)
    
    if result.get("error"):
        logger.error(f"Webhook error: {result['error']}")
        return web.Response(status=400, text=result["error"])
    
    # 发送Telegram通知
    if result.get("success") and result.get("telegram_id"):
        await send_notification(
            result["telegram_id"],
            result.get("action", "unknown")
        )
    
    logger.info(f"Webhook processed: {result}")
    return web.Response(status=200, text="OK")


async def send_notification(telegram_id: int, action: str):
    """发送Telegram通知"""
    if not BOT_INSTANCE:
        logger.warning("Bot instance not set, skipping notification")
        return
    
    messages = {
        "upgraded": (
            "🎉 恭喜！您的 Pro 订阅已激活！\n\n"
            "现在可以使用所有高级功能：\n"
            "✅ 无限深度查询\n"
            "✅ 实时监管更新推送\n"
            "✅ 自定义关键词监控\n\n"
            "发送任何问题开始体验！"
        ),
        "renewed": (
            "✅ 您的 Pro 订阅已续费成功！\n\n"
            "感谢您的持续支持！"
        ),
        "cancelled": (
            "ℹ️ 您的 Pro 订阅已结束\n\n"
            "您仍可使用免费功能（每天3次查询）。\n"
            "随时欢迎重新订阅：/upgrade"
        ),
    }
    
    message = messages.get(action)
    if message:
        try:
            await BOT_INSTANCE.send_message(telegram_id, message)
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")


async def health_check(request):
    """健康检查端点"""
    return web.Response(status=200, text="OK")


def create_app():
    """创建Web应用"""
    app = web.Application()
    app.router.add_post("/webhook/stripe", handle_stripe_webhook)
    app.router.add_get("/health", health_check)
    return app


if __name__ == "__main__":
    app = create_app()
    web.run_app(app, port=8080)
