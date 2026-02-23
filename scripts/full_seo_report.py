#!/usr/bin/env python3
"""
APAC FinStab Full SEO & Analytics Report
Combines Search Console + GA4 data
"""

import warnings
warnings.filterwarnings('ignore')

from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric

# Config
SERVICE_ACCOUNT_FILE = 'config/service-account.json'
GSC_SITE = 'sc-domain:apacfinstab.com'
GA4_PROPERTY = '514166879'

def get_gsc_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, 
        scopes=['https://www.googleapis.com/auth/webmasters.readonly']
    )
    return build('searchconsole', 'v1', credentials=creds)

def get_ga4_client():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/analytics.readonly']
    )
    return BetaAnalyticsDataClient(credentials=creds)

def gsc_performance(service, days=7):
    end = datetime.now().strftime('%Y-%m-%d')
    start = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    try:
        resp = service.searchanalytics().query(
            siteUrl=GSC_SITE,
            body={'startDate': start, 'endDate': end, 'dimensions': []}
        ).execute()
        if resp.get('rows'):
            r = resp['rows'][0]
            return {'clicks': r.get('clicks',0), 'impressions': r.get('impressions',0), 
                    'ctr': r.get('ctr',0)*100, 'position': r.get('position',0)}
    except: pass
    return {'clicks': 0, 'impressions': 0, 'ctr': 0, 'position': 0}

def gsc_top_queries(service, limit=10):
    end = datetime.now().strftime('%Y-%m-%d')
    start = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
    try:
        resp = service.searchanalytics().query(
            siteUrl=GSC_SITE,
            body={'startDate': start, 'endDate': end, 'dimensions': ['query'], 'rowLimit': limit}
        ).execute()
        return resp.get('rows', [])
    except: return []

def gsc_top_pages(service, limit=10):
    end = datetime.now().strftime('%Y-%m-%d')
    start = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
    try:
        resp = service.searchanalytics().query(
            siteUrl=GSC_SITE,
            body={'startDate': start, 'endDate': end, 'dimensions': ['page'], 'rowLimit': limit}
        ).execute()
        return resp.get('rows', [])
    except: return []

def ga4_traffic(client, days=7):
    try:
        resp = client.run_report(RunReportRequest(
            property=f"properties/{GA4_PROPERTY}",
            dimensions=[],
            metrics=[Metric(name="activeUsers"), Metric(name="sessions"), 
                     Metric(name="screenPageViews"), Metric(name="bounceRate")],
            date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")]
        ))
        if resp.rows:
            r = resp.rows[0]
            return {'users': int(r.metric_values[0].value), 
                    'sessions': int(r.metric_values[1].value),
                    'pageviews': int(r.metric_values[2].value),
                    'bounce_rate': float(r.metric_values[3].value)*100}
    except: pass
    return {'users': 0, 'sessions': 0, 'pageviews': 0, 'bounce_rate': 0}

def ga4_traffic_sources(client):
    try:
        resp = client.run_report(RunReportRequest(
            property=f"properties/{GA4_PROPERTY}",
            dimensions=[Dimension(name="sessionSource")],
            metrics=[Metric(name="sessions")],
            date_ranges=[DateRange(start_date="28daysAgo", end_date="today")]
        ))
        return [(r.dimension_values[0].value, int(r.metric_values[0].value)) for r in resp.rows]
    except: return []

def ga4_top_pages(client):
    try:
        resp = client.run_report(RunReportRequest(
            property=f"properties/{GA4_PROPERTY}",
            dimensions=[Dimension(name="pagePath")],
            metrics=[Metric(name="screenPageViews")],
            date_ranges=[DateRange(start_date="28daysAgo", end_date="today")]
        ))
        return [(r.dimension_values[0].value, int(r.metric_values[0].value)) for r in resp.rows[:10]]
    except: return []

def generate_report():
    print("=" * 70)
    print("📊 APAC FINSTAB - FULL SEO & ANALYTICS REPORT")
    print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 70)
    
    gsc = get_gsc_service()
    ga4 = get_ga4_client()
    
    # GA4 Traffic
    traffic = ga4_traffic(ga4)
    print("\n🌐 WEBSITE TRAFFIC (Last 7 Days) - GA4")
    print("-" * 50)
    print(f"   Users:       {traffic['users']}")
    print(f"   Sessions:    {traffic['sessions']}")
    print(f"   Pageviews:   {traffic['pageviews']}")
    print(f"   Bounce Rate: {traffic['bounce_rate']:.1f}%")
    
    # GSC Performance
    perf = gsc_performance(gsc)
    print("\n🔍 SEARCH PERFORMANCE (Last 7 Days) - GSC")
    print("-" * 50)
    print(f"   Clicks:      {perf['clicks']}")
    print(f"   Impressions: {perf['impressions']}")
    print(f"   CTR:         {perf['ctr']:.2f}%")
    print(f"   Avg Position:{perf['position']:.1f}")
    
    # Traffic Sources
    sources = ga4_traffic_sources(ga4)
    print("\n📡 TRAFFIC SOURCES (Last 28 Days)")
    print("-" * 50)
    if sources:
        for src, sess in sources[:5]:
            print(f"   {src}: {sess} sessions")
    else:
        print("   No data yet")
    
    # Top Search Queries
    queries = gsc_top_queries(gsc)
    print("\n🔑 TOP SEARCH QUERIES (Last 28 Days)")
    print("-" * 50)
    if queries:
        for i, row in enumerate(queries[:5], 1):
            q = row['keys'][0][:40]
            c = row.get('clicks', 0)
            pos = row.get('position', 0)
            print(f"   {i}. '{q}' - {c} clicks, pos {pos:.1f}")
    else:
        print("   ⚠️ No search queries yet - needs more indexing")
    
    # Top Pages by Traffic
    pages = ga4_top_pages(ga4)
    print("\n📄 TOP PAGES BY VIEWS (Last 28 Days)")
    print("-" * 50)
    if pages:
        for path, views in pages[:5]:
            print(f"   {path}: {views} views")
    else:
        print("   No data yet")
    
    print("\n" + "=" * 70)
    print("✅ Report complete!")
    print("=" * 70)

if __name__ == '__main__':
    generate_report()
