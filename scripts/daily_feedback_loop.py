#!/usr/bin/env python3
"""
每日正反馈闭环检查 - 18:00执行
找出"尖兵"和"躺平"的产品动作
"""

import warnings
warnings.filterwarnings('ignore')

import json
from datetime import datetime, timedelta
from pathlib import Path

# GA4 imports
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest, DateRange, Dimension, Metric, OrderBy
)

SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']
SERVICE_ACCOUNT_FILE = 'config/service-account.json'
PROPERTY_ID = '514166879'

def get_ga4_client():
    """Get GA4 client"""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return BetaAnalyticsDataClient(credentials=credentials)

def get_top_pages(client, days=7, limit=10):
    """获取Top页面 - 找尖兵"""
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[
            Metric(name="screenPageViews"),
            Metric(name="activeUsers"),
            Metric(name="averageSessionDuration")
        ],
        date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
        limit=limit
    )
    
    response = client.run_report(request)
    pages = []
    for row in response.rows:
        pages.append({
            'path': row.dimension_values[0].value,
            'pageviews': int(row.metric_values[0].value),
            'users': int(row.metric_values[1].value),
            'avg_duration': float(row.metric_values[2].value)
        })
    return pages

def get_traffic_sources(client, days=7):
    """获取流量来源"""
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="sessionSource")],
        metrics=[Metric(name="sessions")],
        date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
        limit=10
    )
    
    response = client.run_report(request)
    sources = []
    for row in response.rows:
        sources.append({
            'source': row.dimension_values[0].value,
            'sessions': int(row.metric_values[0].value)
        })
    return sources

def get_daily_trend(client, days=7):
    """获取每日趋势"""
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="date")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews")
        ],
        date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        order_bys=[OrderBy(dimension=OrderBy.DimensionOrderBy(dimension_name="date"), desc=False)]
    )
    
    response = client.run_report(request)
    trend = []
    for row in response.rows:
        trend.append({
            'date': row.dimension_values[0].value,
            'users': int(row.metric_values[0].value),
            'sessions': int(row.metric_values[1].value),
            'pageviews': int(row.metric_values[2].value)
        })
    return trend

def analyze_performance(top_pages, sources, trend):
    """分析表现，识别尖兵和躺平"""
    
    report = []
    report.append("=" * 60)
    report.append(f"📊 APAC FINSTAB 每日正反馈报告")
    report.append(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    report.append("=" * 60)
    
    # 总体趋势
    report.append("\n## 📈 7日趋势")
    total_users = sum(d['users'] for d in trend)
    total_sessions = sum(d['sessions'] for d in trend)
    total_pageviews = sum(d['pageviews'] for d in trend)
    
    # 计算增长
    if len(trend) >= 2:
        yesterday = trend[-1]
        day_before = trend[-2]
        user_change = yesterday['users'] - day_before['users']
        user_pct = (user_change / day_before['users'] * 100) if day_before['users'] > 0 else 0
        trend_emoji = "📈" if user_change > 0 else "📉" if user_change < 0 else "➡️"
        report.append(f"昨日vs前日: {trend_emoji} {user_change:+d} users ({user_pct:+.1f}%)")
    
    report.append(f"7日总计: {total_users} users | {total_sessions} sessions | {total_pageviews} pageviews")
    
    # 尖兵页面
    report.append("\n## 🏆 尖兵页面 (Top 5)")
    for i, page in enumerate(top_pages[:5], 1):
        status = "🔥" if page['pageviews'] > 10 else "✅" if page['pageviews'] > 5 else "📄"
        report.append(f"{i}. {status} {page['path']}")
        report.append(f"   PV: {page['pageviews']} | Users: {page['users']} | Avg Duration: {page['avg_duration']:.0f}s")
    
    # 躺平页面（如果有数据的话）
    report.append("\n## 😴 躺平页面 (需要关注)")
    low_performers = [p for p in top_pages if p['pageviews'] <= 2 and p['path'] != '/']
    if low_performers:
        for page in low_performers[:5]:
            report.append(f"- {page['path']} (仅 {page['pageviews']} PV)")
    else:
        report.append("- 暂无明显躺平页面（或数据不足）")
    
    # 流量来源
    report.append("\n## 🔗 流量来源")
    for src in sources[:5]:
        emoji = "🌐" if src['source'] == "(direct)" else "🔍" if "google" in src['source'].lower() else "📱"
        report.append(f"{emoji} {src['source']}: {src['sessions']} sessions")
    
    # 行动建议
    report.append("\n## 🎯 行动建议")
    
    if top_pages:
        best_page = top_pages[0]
        report.append(f"1. 【放大】{best_page['path']} 表现最好，分析原因并复制")
    
    google_traffic = sum(s['sessions'] for s in sources if 'google' in s['source'].lower())
    direct_traffic = sum(s['sessions'] for s in sources if 'direct' in s['source'].lower())
    
    if google_traffic < direct_traffic * 0.5:
        report.append("2. 【警告】Google流量过低，SEO需要加强")
    
    if total_users < 50:
        report.append("3. 【警告】总流量偏低，需要增加推广力度")
    
    report.append("\n" + "=" * 60)
    
    return "\n".join(report)

def main():
    """主函数"""
    try:
        client = get_ga4_client()
        
        # 获取数据
        top_pages = get_top_pages(client)
        sources = get_traffic_sources(client)
        trend = get_daily_trend(client)
        
        # 生成报告
        report = analyze_performance(top_pages, sources, trend)
        print(report)
        
        # 保存报告
        report_dir = Path("reports/daily")
        report_dir.mkdir(parents=True, exist_ok=True)
        
        today = datetime.now().strftime("%Y-%m-%d")
        report_file = report_dir / f"{today}-feedback.md"
        
        with open(report_file, 'w') as f:
            f.write(report)
        
        print(f"\n✅ 报告已保存: {report_file}")
        
        return report
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    main()
