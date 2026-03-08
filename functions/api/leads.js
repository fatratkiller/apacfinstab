/**
 * APAC FINSTAB Leads API
 * Cloudflare Pages Function
 * 
 * 接收表单提交，发送到Discord并记录
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    let data;
    const contentType = request.headers.get('content-type') || '';
    
    // 支持JSON和FormData
    if (contentType.includes('application/json')) {
      const json = await request.json();
      data = {
        email: json.email,
        company: json.company || 'N/A',
        role: json.role || 'N/A',
        source: json.source || 'unknown',
        agent: json.agent || 'N/A',  // 新增：agent名称
        score: json.score || 'N/A',
        answers: json.answers || '{}',
        ref: json.ref || 'direct',
        timestamp: new Date().toISOString()
      };
    } else {
      const formData = await request.formData();
      data = {
        email: formData.get('email'),
        company: formData.get('company') || 'N/A',
        role: formData.get('role') || 'N/A',
        source: formData.get('source') || 'unknown',
        agent: formData.get('agent') || 'N/A',
        score: formData.get('score') || 'N/A',
        answers: formData.get('answers') || '{}',
        ref: formData.get('ref') || 'direct',
        timestamp: new Date().toISOString()
      };
    }
    
    // 验证邮箱
    if (!data.email || !data.email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
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
    
    // JSON请求返回JSON响应
    if (contentType.includes('application/json')) {
      return new Response(JSON.stringify({ success: true, message: 'Lead captured' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // FormData请求返回重定向
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
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
    'enterprise': '企业询价',
    'agent_score': '🤖 Agent合规评分',
    'agent_directory': '📚 Agent导航站'
  };
  
  const sourceName = sourceNames[data.source] || data.source;
  
  let msg = `🎉 **新Lead！**\n\n`;
  msg += `**来源**: ${sourceName}\n`;
  msg += `**邮箱**: \`${data.email}\`\n`;
  
  if (data.agent !== 'N/A') msg += `**Agent**: ${data.agent}\n`;
  if (data.company !== 'N/A') msg += `**公司**: ${data.company}\n`;
  if (data.role !== 'N/A') msg += `**角色**: ${data.role}\n`;
  if (data.score !== 'N/A') msg += `**评分**: ${data.score}%\n`;
  if (data.ref !== 'direct') msg += `**推荐**: ${data.ref}\n`;
  
  msg += `**时间**: ${new Date(data.timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
  
  return msg;
}
