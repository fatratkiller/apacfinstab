"""用户状态检查中间件"""
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
import database as db
import config


class AccessLevel:
    ALLOWED = "allowed"
    FREE_LIMIT_REACHED = "free_limit_reached"
    PRO_REQUIRED = "pro_required"
    SUBSCRIPTION_EXPIRED = "subscription_expired"


async def check_access(
    update: Update, 
    context: ContextTypes.DEFAULT_TYPE,
    feature: str
) -> tuple[str, dict]:
    """
    检查用户是否有权限访问功能
    
    Returns:
        (access_level, user_data)
    """
    telegram_id = update.effective_user.id
    username = update.effective_user.username
    
    # 获取或创建用户
    user = await db.get_or_create_user(telegram_id, username)
    
    # 重置每日额度（如果是新的一天）
    user = await db.reset_daily_uses_if_needed(user)
    
    # Pro功能检查
    if feature in config.PRO_FEATURES:
        if user["tier"] != db.UserTier.PRO:
            return AccessLevel.PRO_REQUIRED, user
        
        if not await db.is_subscription_active(user):
            return AccessLevel.SUBSCRIPTION_EXPIRED, user
        
        return AccessLevel.ALLOWED, user
    
    # 免费功能检查
    if feature in config.FREE_FEATURES:
        # Pro用户无限制
        if user["tier"] == db.UserTier.PRO and await db.is_subscription_active(user):
            return AccessLevel.ALLOWED, user
        
        # 免费用户检查额度
        if feature == "basic_query":
            if user["daily_free_uses"] <= 0:
                return AccessLevel.FREE_LIMIT_REACHED, user
        
        return AccessLevel.ALLOWED, user
    
    # 未知功能默认允许
    return AccessLevel.ALLOWED, user


def get_upgrade_keyboard() -> InlineKeyboardMarkup:
    """生成升级按钮"""
    keyboard = [
        [InlineKeyboardButton("🚀 升级到 Pro ($19/月)", callback_data="upgrade_pro")],
        [InlineKeyboardButton("📋 查看 Pro 功能", callback_data="view_pro_features")],
    ]
    return InlineKeyboardMarkup(keyboard)


async def send_upgrade_prompt(update: Update, reason: str):
    """发送升级提示"""
    messages = {
        AccessLevel.FREE_LIMIT_REACHED: (
            "⚠️ 今日免费查询已用完 (0/3)\n\n"
            "升级 Pro，享受：\n"
            "✅ 无限深度查询\n"
            "✅ 实时监管更新推送\n"
            "✅ 自定义关键词监控\n"
            "✅ 跨地区对比分析\n"
            "✅ PDF报告导出\n\n"
            "💰 仅 $19/月"
        ),
        AccessLevel.PRO_REQUIRED: (
            "🔒 此功能需要 Pro 订阅\n\n"
            "Pro 会员可享：\n"
            "✅ 无限深度查询\n"
            "✅ 实时监管更新推送\n"
            "✅ 自定义关键词监控\n"
            "✅ 跨地区对比分析\n"
            "✅ PDF报告导出\n\n"
            "💰 仅 $19/月"
        ),
        AccessLevel.SUBSCRIPTION_EXPIRED: (
            "⏰ 您的 Pro 订阅已到期\n\n"
            "续费继续享受全部功能：\n"
            "✅ 无限深度查询\n"
            "✅ 实时监管更新推送\n"
            "✅ 自定义关键词监控\n\n"
            "💰 $19/月"
        ),
    }
    
    message = messages.get(reason, "需要升级到 Pro")
    await update.message.reply_text(message, reply_markup=get_upgrade_keyboard())
