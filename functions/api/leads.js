/**
 * APAC FINSTAB Leads API
 * Cloudflare Pages Function
 * 
 * 接收表单提交，发送到Discord
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    
    const data = {
      email: formData.get('email'),
      company: formData.get('company') || 'N/A',
      role: formData.get('role') || 'N/A',
      source: formData.get('source') || 'unknown',
      score: formData.get('score') || 'N/A',
      answers: formData.get('answers') || '{}',
      ref: formData.get('ref') || 'direct',
      timestamp: new Date().toISOString()
    };
    
    // 发送到Discord
    const discordWebhook = env.DISCORD_LEADS_WEBHOOK;
    
    if (discordWebhook) {
      const message = formatDiscordMessage(data);
      
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    }
    
    // 返回成功页面或重定向
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/vasp-advisor/thank-you.html'
      }
    });
    
  } catch (error) {
    console.error('Leads API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function formatDiscordMessage(data) {
  const sourceNames = {
    'vasp_test': 'VASP爆率测试',
    'mcp_call': 'MCP调用',
    'tracker_sub': 'Tracker订阅',
    'blog_sub': '博客订阅',
    'waitlist': 'Waitlist',
    'enterprise': '企业询价'
  };
  
  const sourceName = sourceNames[data.source] || data.source;
  
  let msg = `🎉 **新注册！**\n\n`;
  msg += `**来源**: ${sourceName}\n`;
  msg += `**邮箱**: ${data.email}\n`;
  
  if (data.company !== 'N/A') msg += `**公司**: ${data.company}\n`;
  if (data.role !== 'N/A') msg += `**角色**: ${data.role}\n`;
  if (data.score !== 'N/A') msg += `**评分**: ${data.score}%\n`;
  if (data.ref !== 'direct') msg += `**来源**: ${data.ref}\n`;
  
  msg += `**时间**: ${new Date(data.timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
  
  return msg;
}
