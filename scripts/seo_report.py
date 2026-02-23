#!/usr/bin/env python3
"""
APAC FinStab SEO Daily Report
Automated Search Console analytics
"""

import warnings
warnings.filterwarnings('ignore')

import json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SERVICE_ACCOUNT_FILE = 'config/service-account.json'
SITE_URL = 'sc-domain:apacfinstab.com'

def get_service():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build('searchconsole', 'v1', credentials=credentials)

def get_performance_data(service, days=7):
    """Get search performance data"""
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    # Overall metrics
    request = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': [],
    }
    
    try:
        response = service.searchanalytics().query(
            siteUrl=SITE_URL, body=request
        ).execute()
        
        if response.get('rows'):
            row = response['rows'][0]
            return {
                'clicks': row.get('clicks', 0),
                'impressions': row.get('impressions', 0),
                'ctr': row.get('ctr', 0) * 100,
                'position': row.get('position', 0)
            }
    except:
        pass
    
    return {'clicks': 0, 'impressions': 0, 'ctr': 0, 'position': 0}

def get_top_queries(service, limit=10):
    """Get top search queries"""
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
    
    request = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['query'],
        'rowLimit': limit
    }
    
    try:
        response = service.searchanalytics().query(
            siteUrl=SITE_URL, body=request
        ).execute()
        return response.get('rows', [])
    except:
        return []

def get_top_pages(service, limit=10):
    """Get top performing pages"""
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
    
    request = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['page'],
        'rowLimit': limit
    }
    
    try:
        response = service.searchanalytics().query(
            siteUrl=SITE_URL, body=request
        ).execute()
        return response.get('rows', [])
    except:
        return []

def get_country_data(service):
    """Get traffic by country"""
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
    
    request = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['country'],
        'rowLimit': 10
    }
    
    try:
        response = service.searchanalytics().query(
            siteUrl=SITE_URL, body=request
        ).execute()
        return response.get('rows', [])
    except:
        return []

def generate_report():
    """Generate full SEO report"""
    service = get_service()
    
    print("=" * 60)
    print("📊 APAC FINSTAB SEO REPORT")
    print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)
    
    # Overall Performance
    perf = get_performance_data(service)
    print("\n📈 OVERALL PERFORMANCE (Last 7 Days)")
    print("-" * 40)
    print(f"   Clicks:      {perf['clicks']}")
    print(f"   Impressions: {perf['impressions']}")
    print(f"   CTR:         {perf['ctr']:.2f}%")
    print(f"   Avg Position:{perf['position']:.1f}")
    
    # Top Queries
    queries = get_top_queries(service)
    print("\n🔍 TOP SEARCH QUERIES (Last 28 Days)")
    print("-" * 40)
    if queries:
        for i, row in enumerate(queries, 1):
            q = row['keys'][0]
            c = row.get('clicks', 0)
            imp = row.get('impressions', 0)
            pos = row.get('position', 0)
            print(f"   {i}. '{q[:40]}' - {c} clicks, {imp} impr, pos {pos:.1f}")
    else:
        print("   ⚠️ No search queries yet - site needs indexing")
    
    # Top Pages
    pages = get_top_pages(service)
    print("\n📄 TOP PAGES (Last 28 Days)")
    print("-" * 40)
    if pages:
        for i, row in enumerate(pages, 1):
            p = row['keys'][0].replace('https://apacfinstab.com', '')
            c = row.get('clicks', 0)
            imp = row.get('impressions', 0)
            print(f"   {i}. {p[:50]} - {c} clicks, {imp} impr")
    else:
        print("   ⚠️ No page data yet - site needs indexing")
    
    # Countries
    countries = get_country_data(service)
    print("\n🌍 TOP COUNTRIES (Last 28 Days)")
    print("-" * 40)
    if countries:
        for row in countries[:5]:
            country = row['keys'][0]
            clicks = row.get('clicks', 0)
            print(f"   {country}: {clicks} clicks")
    else:
        print("   ⚠️ No country data yet")
    
    print("\n" + "=" * 60)
    print("✅ Report complete!")
    
    return {
        'performance': perf,
        'queries': len(queries),
        'pages': len(pages),
        'countries': len(countries)
    }

if __name__ == '__main__':
    generate_report()
