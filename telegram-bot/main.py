"""APAC FINSTAB Telegram Bot - 入口"""
import logging
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
)
import config
from handlers import (
    start_command,
    help_command,
    status_command,
    upgrade_command,
    cancel_command,
    faq_command,
    regions_command,
    handle_message,
    handle_callback,
)

# 配置日志
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def main():
    """启动Bot"""
    # 检查配置
    if not config.TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set!")
        return
    
    if not config.SUPABASE_URL or not config.SUPABASE_KEY:
        logger.error("Supabase credentials not set!")
        return
    
    # 创建Application
    app = Application.builder().token(config.TELEGRAM_BOT_TOKEN).build()
    
    # 注册命令处理器
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("status", status_command))
    app.add_handler(CommandHandler("upgrade", upgrade_command))
    app.add_handler(CommandHandler("cancel", cancel_command))
    app.add_handler(CommandHandler("faq", faq_command))
    app.add_handler(CommandHandler("regions", regions_command))
    
    # 注册回调处理器
    app.add_handler(CallbackQueryHandler(handle_callback))
    
    # 注册消息处理器（放最后，处理所有文本消息）
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # 启动
    logger.info("Bot starting...")
    app.run_polling(allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    main()
