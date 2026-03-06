/**
 * APAC FINSTAB Leads Webhook Worker
 * 
 * 接收Tally表单提交，转发到Discord并记录到Google Sheets
 * 
 * 部署: Cloudflare Workers
 */

// Discord Webhook URLs
const DISCORD_LEADS_WEBHOOK = 'YOUR_DISCORD_WEBHOOK_URL'; // 📊 Leads汇总 thread

// Source名称映射
const SOURCE_NAMES = {
  'vasp_test': 'VASP爆率测试',
  'mcp_call': 'MCP调用',
  'tracker_sub': 'Tracker订阅',
  'blog_sub': '博客订阅',
  'waitlist': 'Waitlist',
  'enterprise': '企业询价',
  'leaderboard': '排行榜告警'
};

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      
      // 提取Tally表单数据
      const fields = data.data?.fields || [];
      const formData = {};
      
      fields.forEach(field => {
        formData[field.key] = field.value;
      });

      // 构建Discord消息
      const sourceName = SOURCE_NAMES[formData.source] || formData.source || '未知来源';
      const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      
      let message = `🎉 **新注册！**\n\n`;
      message += `**来源**: ${sourceName}\n`;
      message += `**邮箱**: ${formData.email || 'N/A'}\n`;
      
      if (formData.company) message += `**公司**: ${formData.company}\n`;
      if (formData.role) message += `**角色**: ${formData.role}\n`;
      if (formData.jurisdiction) message += `**地区**: ${formData.jurisdiction}\n`;
      if (formData.business_type) message += `**业务**: ${formData.business_type}\n`;
      if (formData.capital_range) message += `**资本**: ${formData.capital_range}\n`;
      if (formData.use_case) message += `**用途**: ${formData.use_case}\n`;
      if (formData.wallet_address) message += `**地址**: ${formData.wallet_address}\n`;
      
      message += `**时间**: ${timestamp}\n`;
      
      if (formData.ref) message += `**来源**: ${formData.ref}\n`;

      // 发送到Discord
      const discordResponse = await fetch(DISCORD_LEADS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });

      if (!discordResponse.ok) {
        console.error('Discord webhook failed:', await discordResponse.text());
      }

      // TODO: 添加Google Sheets API写入

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
