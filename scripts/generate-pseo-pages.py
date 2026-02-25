#!/usr/bin/env python3
"""
pSEO页面批量生成脚本
基于policy-events.json生成长尾关键词页面
"""

import json
import os
from datetime import datetime

# 配置
DATA_DIR = '../data'
OUTPUT_DIR = '../regions'
TEMPLATE_DIR = '../templates'

# 地区配置
REGIONS = {
    'HK': {'name': 'Hong Kong', 'emoji': '🇭🇰', 'regulator': 'SFC/HKMA'},
    'SG': {'name': 'Singapore', 'emoji': '🇸🇬', 'regulator': 'MAS'},
    'JP': {'name': 'Japan', 'emoji': '🇯🇵', 'regulator': 'FSA/JFSA'},
    'KR': {'name': 'South Korea', 'emoji': '🇰🇷', 'regulator': 'FSC/FSS'},
    'CN': {'name': 'China', 'emoji': '🇨🇳', 'regulator': 'PBOC/CSRC'},
    'AU': {'name': 'Australia', 'emoji': '🇦🇺', 'regulator': 'ASIC'},
    'IN': {'name': 'India', 'emoji': '🇮🇳', 'regulator': 'RBI/SEBI'},
    'TH': {'name': 'Thailand', 'emoji': '🇹🇭', 'regulator': 'SEC/BOT'},
    'ID': {'name': 'Indonesia', 'emoji': '🇮🇩', 'regulator': 'OJK/BI'},
    'VN': {'name': 'Vietnam', 'emoji': '🇻🇳', 'regulator': 'SBV'},
    'PH': {'name': 'Philippines', 'emoji': '🇵🇭', 'regulator': 'BSP/SEC'},
    'MY': {'name': 'Malaysia', 'emoji': '🇲🇾', 'regulator': 'SC/BNM'},
}

# 主题配置
TOPICS = {
    'Stablecoin': {'title': 'Stablecoin Regulation', 'keywords': ['stablecoin', 'USDT', 'USDC']},
    'Exchange': {'title': 'Crypto Exchange Licensing', 'keywords': ['exchange', 'VASP', 'trading platform']},
    'ETF': {'title': 'Crypto ETF Approval', 'keywords': ['ETF', 'spot ETF', 'futures ETF']},
    'DeFi': {'title': 'DeFi Regulation', 'keywords': ['DeFi', 'decentralized finance']},
    'Custody': {'title': 'Crypto Custody Rules', 'keywords': ['custody', 'cold wallet', 'hot wallet']},
    'Taxation': {'title': 'Crypto Taxation', 'keywords': ['tax', 'capital gains']},
    'CBDC': {'title': 'CBDC Development', 'keywords': ['CBDC', 'digital currency', 'central bank']},
    'Licensing': {'title': 'Crypto Licensing Framework', 'keywords': ['license', 'registration']},
}

def load_policy_events():
    """加载政策事件数据"""
    with open(os.path.join(DATA_DIR, 'policy-events.json'), 'r') as f:
        data = json.load(f)
    return data.get('events', [])

def load_region_overviews():
    """加载地区概览数据"""
    try:
        with open(os.path.join(DATA_DIR, 'region-overviews.json'), 'r') as f:
            return json.load(f)
    except:
        return {}

def filter_events(events, region=None, topic=None):
    """筛选事件"""
    filtered = events
    if region:
        filtered = [e for e in filtered if region in e.get('regions', [])]
    if topic:
        filtered = [e for e in filtered if topic in e.get('topics', [])]
    return filtered

def generate_region_page(region_code, region_info, events, overview):
    """生成地区页面"""
    region_events = filter_events(events, region=region_code)
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{region_info['name']} Crypto Regulation 2026 | APAC FINSTAB</title>
    <meta name="description" content="Complete guide to {region_info['name']} cryptocurrency regulation in 2026. Track {region_info['regulator']} policies, VASP licensing, stablecoin rules, and more.">
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PX174NJW6M"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-PX174NJW6M');
    </script>
    
    <!-- Schema.org for AI -->
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{region_info['name']} Crypto Regulation Guide 2026",
        "description": "Comprehensive cryptocurrency regulation overview for {region_info['name']}",
        "author": {{"@type": "Organization", "name": "APAC FINSTAB"}},
        "publisher": {{"@type": "Organization", "name": "APAC FINSTAB"}},
        "dateModified": "{datetime.now().strftime('%Y-%m-%d')}"
    }}
    </script>
    
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e0e0e0; }}
        h1 {{ color: #00d9ff; }}
        h2 {{ color: #00ff88; border-bottom: 1px solid #333; padding-bottom: 10px; }}
        .faq {{ background: #1a1a2e; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .faq h3 {{ color: #00d9ff; margin-top: 0; }}
        .event {{ background: #16213e; padding: 15px; border-radius: 8px; margin: 10px 0; }}
        .event-date {{ color: #888; font-size: 0.9em; }}
        .cta {{ background: linear-gradient(90deg, #00d9ff, #00ff88); color: #000; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }}
        a {{ color: #00d9ff; }}
        .back {{ margin-bottom: 20px; }}
    </style>
</head>
<body>
    <div class="back"><a href="/">← Back to APAC FINSTAB</a></div>
    
    <h1>{region_info['emoji']} {region_info['name']} Crypto Regulation 2026</h1>
    
    <p><strong>Primary Regulator:</strong> {region_info['regulator']}</p>
    <p><strong>Policy Events Tracked:</strong> {len(region_events)}</p>
    <p><strong>Last Updated:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
    
    <!-- FAQ Section for AI/GEO -->
    <div class="faq">
        <h3>❓ Frequently Asked Questions</h3>
        
        <p><strong>Q: What is the current crypto regulatory status in {region_info['name']}?</strong></p>
        <p>A: {region_info['name']} is actively developing its cryptocurrency regulatory framework under {region_info['regulator']}. We track {len(region_events)} policy events for this jurisdiction.</p>
        
        <p><strong>Q: Do I need a license to operate a crypto exchange in {region_info['name']}?</strong></p>
        <p>A: Yes, most crypto-related activities in {region_info['name']} require licensing from {region_info['regulator']}. See our policy tracker for specific requirements.</p>
        
        <p><strong>Q: What are the latest regulatory developments?</strong></p>
        <p>A: See the timeline below for the most recent policy events affecting {region_info['name']}.</p>
    </div>
    
    <a href="/tracker/?region={region_code}" class="cta">🔍 View Full Policy Tracker →</a>
    
    <h2>📅 Recent Policy Events</h2>
'''
    
    # 添加最近的事件
    for event in sorted(region_events, key=lambda x: x.get('date', ''), reverse=True)[:10]:
        html += f'''
    <div class="event">
        <div class="event-date">{event.get('date', 'N/A')}</div>
        <h3>{event.get('title', 'Untitled')}</h3>
        <p>{event.get('summary', '')}</p>
    </div>
'''
    
    html += '''
    <h2>🔗 Related Resources</h2>
    <ul>
        <li><a href="/tracker/">Full APAC Policy Tracker</a></li>
        <li><a href="/blog.html">Deep Analysis Articles</a></li>
        <li><a href="/">APAC FINSTAB Dashboard</a></li>
    </ul>
    
    <div style="margin-top: 40px; padding: 20px; background: #1a1a2e; border-radius: 8px;">
        <h3>🔔 Stay Updated</h3>
        <p>Get notified when regulations change in this jurisdiction.</p>
        <a href="/subscribe" class="cta">Subscribe for Alerts →</a>
    </div>
    
    <footer style="margin-top: 40px; color: #666; text-align: center;">
        <p>© 2026 APAC FINSTAB | <a href="/">Home</a> | <a href="/tracker/">Policy Tracker</a></p>
    </footer>
</body>
</html>
'''
    return html

def main():
    print("=" * 60)
    print("pSEO页面批量生成")
    print("=" * 60)
    
    events = load_policy_events()
    overviews = load_region_overviews()
    
    print(f"\n加载了 {len(events)} 条政策事件")
    
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    generated = 0
    
    # 生成地区页面
    for region_code, region_info in REGIONS.items():
        output_path = os.path.join(OUTPUT_DIR, f'{region_code.lower()}.html')
        overview = overviews.get(region_code, {})
        
        html = generate_region_page(region_code, region_info, events, overview)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"✅ Generated: {output_path}")
        generated += 1
    
    print(f"\n✅ 生成了 {generated} 个页面")
    print("=" * 60)

if __name__ == '__main__':
    main()
