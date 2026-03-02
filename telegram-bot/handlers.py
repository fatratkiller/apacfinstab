"""消息处理器"""
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
import database as db
from middleware import check_access, send_upgrade_prompt, AccessLevel
import payments


# ============ 命令处理 ============

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /start 命令"""
    user = update.effective_user
    
    # 处理支付回调
    if context.args:
        if context.args[0] == "payment_success":
            await update.message.reply_text(
                "🎉 付款成功！欢迎成为 Pro 会员！\n\n"
                "现在您可以享受：\n"
                "✅ 无限深度查询\n"
                "✅ 实时监管更新推送\n"
                "✅ 自定义关键词监控\n"
                "✅ 跨地区对比分析\n"
                "✅ PDF报告导出\n\n"
                "发送任何法规问题开始使用！"
            )
            return
        elif context.args[0] == "payment_cancelled":
            await update.message.reply_text(
                "❌ 付款已取消。\n\n"
                "如有任何问题，请联系我们。\n"
                "随时可以重新升级：/upgrade"
            )
            return
    
    # 正常欢迎消息
    await db.get_or_create_user(user.id, user.username)
    
    await update.message.reply_text(
        f"👋 你好 {user.first_name}！\n\n"
        "我是 APAC FINSTAB 合规助手，专注于亚太地区金融监管法规。\n\n"
        "🆓 **免费功能**\n"
        "• 基础法规查询（每天3次）\n"
        "• 每周合规摘要\n"
        "• 常见问题FAQ\n\n"
        "💎 **Pro功能** ($19/月)\n"
        "• 无限深度查询\n"
        "• 实时监管更新推送\n"
        "• 自定义关键词监控\n"
        "• 跨地区对比分析\n"
        "• PDF报告导出\n\n"
        "📝 直接发送问题开始查询！\n"
        "输入 /help 查看所有命令",
        parse_mode="Markdown"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /help 命令"""
    await update.message.reply_text(
        "📚 **命令列表**\n\n"
        "🔍 **查询**\n"
        "/query [问题] - 法规查询\n"
        "/compare [地区1] [地区2] - 地区对比 (Pro)\n\n"
        "📊 **监控**\n"
        "/monitor [关键词] - 添加监控 (Pro)\n"
        "/alerts - 查看告警 (Pro)\n\n"
        "👤 **账户**\n"
        "/status - 查看账户状态\n"
        "/upgrade - 升级到Pro\n"
        "/cancel - 取消订阅\n\n"
        "❓ **帮助**\n"
        "/faq - 常见问题\n"
        "/regions - 支持的地区",
        parse_mode="Markdown"
    )


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /status 命令"""
    user = await db.get_or_create_user(update.effective_user.id)
    
    if user["tier"] == db.UserTier.PRO:
        end_date = user.get("subscription_end_date", "未知")
        status_text = (
            "👤 **账户状态**\n\n"
            f"💎 等级: Pro\n"
            f"📅 到期日: {end_date}\n"
            f"✅ 无限查询\n"
            f"✅ 所有功能已解锁"
        )
    else:
        remaining = user["daily_free_uses"]
        status_text = (
            "👤 **账户状态**\n\n"
            f"🆓 等级: 免费\n"
            f"📊 今日剩余查询: {remaining}/3\n\n"
            "升级到 Pro 解锁全部功能 👇"
        )
        
    keyboard = None
    if user["tier"] != db.UserTier.PRO:
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("🚀 升级到 Pro", callback_data="upgrade_pro")]
        ])
    
    await update.message.reply_text(status_text, parse_mode="Markdown", reply_markup=keyboard)


async def upgrade_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /upgrade 命令"""
    user = await db.get_user(update.effective_user.id)
    
    if user and user["tier"] == db.UserTier.PRO:
        await update.message.reply_text("✅ 您已经是 Pro 会员！")
        return
    
    # 生成支付链接
    checkout_url = await payments.create_checkout_session(
        update.effective_user.id,
        update.effective_user.username
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("💳 立即订阅 $19/月", url=checkout_url)]
    ])
    
    await update.message.reply_text(
        "🚀 **升级到 Pro**\n\n"
        "解锁全部功能：\n"
        "✅ 无限深度查询\n"
        "✅ 实时监管更新推送\n"
        "✅ 自定义关键词监控\n"
        "✅ 跨地区对比分析\n"
        "✅ PDF报告导出\n"
        "✅ 历史查询记录\n\n"
        "💰 **$19/月**\n"
        "可随时取消",
        parse_mode="Markdown",
        reply_markup=keyboard
    )


async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /cancel 命令"""
    success = await payments.cancel_subscription(update.effective_user.id)
    
    if success:
        await update.message.reply_text(
            "✅ 订阅已取消\n\n"
            "您的 Pro 功能将在当前周期结束后停止。\n"
            "感谢您的使用，期待再次见到您！"
        )
    else:
        await update.message.reply_text(
            "ℹ️ 您当前没有活跃的订阅"
        )


async def faq_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /faq 命令 - 免费功能"""
    await update.message.reply_text(
        "❓ **常见问题**\n\n"
        "**Q: 支持哪些地区？**\n"
        "A: 香港、新加坡、日本、韩国、澳大利亚、泰国、印尼、菲律宾等亚太地区\n\n"
        "**Q: 数据多久更新一次？**\n"
        "A: 监管政策变更后24小时内更新\n\n"
        "**Q: Pro会员可以退款吗？**\n"
        "A: 订阅后7天内可全额退款\n\n"
        "**Q: 如何获取发票？**\n"
        "A: 付款成功后自动发送到注册邮箱\n\n"
        "更多问题请访问: apacfinstab.com/faq",
        parse_mode="Markdown"
    )


async def regions_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /regions 命令"""
    await update.message.reply_text(
        "🌏 **支持的地区**\n\n"
        "🇭🇰 香港 - SFC, HKMA\n"
        "🇸🇬 新加坡 - MAS\n"
        "🇯🇵 日本 - FSA, JFSA\n"
        "🇰🇷 韩国 - FSC, FSS\n"
        "🇦🇺 澳大利亚 - ASIC, AUSTRAC\n"
        "🇹🇭 泰国 - SEC Thailand\n"
        "🇮🇩 印尼 - OJK, Bappebti\n"
        "🇵🇭 菲律宾 - BSP, SEC PH\n"
        "🇲🇾 马来西亚 - SC, BNM\n"
        "🇻🇳 越南 - SBV, SSC\n"
        "🇹🇼 台湾 - FSC Taiwan\n\n"
        "💡 提示：使用 /compare HK SG 对比不同地区 (Pro)",
        parse_mode="Markdown"
    )


# ============ 消息处理 ============

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理普通消息（法规查询）"""
    # 检查访问权限
    access_level, user = await check_access(update, context, "basic_query")
    
    if access_level != AccessLevel.ALLOWED:
        await send_upgrade_prompt(update, access_level)
        return
    
    query = update.message.text
    
    # TODO: 调用实际的法规查询API
    # 这里先用模拟响应
    response = await mock_query_response(query)
    
    # 扣减免费次数（如果是免费用户）
    if user["tier"] == db.UserTier.FREE:
        remaining = await db.decrement_free_uses(update.effective_user.id)
        response += f"\n\n📊 今日剩余查询: {remaining}/3"
    
    # 记录使用
    await db.log_usage(update.effective_user.id, "basic_query", False)
    
    await update.message.reply_text(response, parse_mode="Markdown")


async def mock_query_response(query: str) -> str:
    """模拟查询响应 - TODO: 替换为实际API调用"""
    # 简单关键词匹配
    query_lower = query.lower()
    
    if "vasp" in query_lower or "牌照" in query_lower:
        return (
            "🔍 **关于VASP牌照**\n\n"
            "香港SFC的VASP牌照制度自2023年6月1日起实施。\n\n"
            "主要要求：\n"
            "• 实缴资本不低于500万港元\n"
            "• 至少2名负责人（RO）\n"
            "• 完善的AML/CFT制度\n\n"
            "📎 参考: SFC VASP Guidelines Chapter 4\n\n"
            "_如需更详细的信息，请升级到 Pro_"
        )
    elif "stablecoin" in query_lower or "稳定币" in query_lower:
        return (
            "🔍 **关于稳定币监管**\n\n"
            "香港HKMA正在制定稳定币发行人牌照框架。\n\n"
            "预计要求：\n"
            "• 储备金1:1全额支持\n"
            "• 定期审计和披露\n"
            "• 赎回机制保障\n\n"
            "📎 参考: HKMA Discussion Paper 2024\n\n"
            "_如需更详细的信息，请升级到 Pro_"
        )
    else:
        return (
            f"🔍 **查询: {query[:50]}...**\n\n"
            "正在搜索相关法规信息...\n\n"
            "目前该查询需要更详细的参数。\n"
            "建议：\n"
            "• 指定具体地区（如香港、新加坡）\n"
            "• 指定监管主题（如牌照、AML、稳定币）\n\n"
            "_升级到 Pro 获取AI智能分析_"
        )


# ============ 回调处理 ============

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理按钮回调"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "upgrade_pro":
        # 生成支付链接
        checkout_url = await payments.create_checkout_session(
            update.effective_user.id,
            update.effective_user.username
        )
        
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("💳 立即订阅 $19/月", url=checkout_url)]
        ])
        
        await query.edit_message_text(
            "🚀 **升级到 Pro**\n\n"
            "解锁全部功能，仅 $19/月\n"
            "可随时取消",
            parse_mode="Markdown",
            reply_markup=keyboard
        )
    
    elif query.data == "view_pro_features":
        await query.edit_message_text(
            "💎 **Pro 功能详情**\n\n"
            "**无限查询**\n"
            "不受每日3次限制，深度分析\n\n"
            "**实时推送**\n"
            "监管政策变更第一时间通知\n\n"
            "**自定义监控**\n"
            "设置关键词，自动追踪\n\n"
            "**对比分析**\n"
            "不同地区法规对比\n\n"
            "**报告导出**\n"
            "PDF格式，用于内部汇报\n\n"
            "💰 $19/月 | 可随时取消",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🚀 升级", callback_data="upgrade_pro")]
            ])
        )
