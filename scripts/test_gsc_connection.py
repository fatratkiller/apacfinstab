#!/usr/bin/env python3
"""Test Google Search Console API connection"""

import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Load credentials
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SERVICE_ACCOUNT_FILE = 'config/service-account.json'

def test_search_console():
    """Test Search Console API connection"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        service = build('searchconsole', 'v1', credentials=credentials)
        
        # List all sites
        site_list = service.sites().list().execute()
        
        print("✅ Search Console API Connected!")
        print(f"📊 Sites available: {len(site_list.get('siteEntry', []))}")
        
        for site in site_list.get('siteEntry', []):
            print(f"   - {site['siteUrl']} ({site['permissionLevel']})")
        
        return True
    except Exception as e:
        print(f"❌ Search Console Error: {e}")
        return False

def test_search_analytics():
    """Test fetching actual search data"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        service = build('searchconsole', 'v1', credentials=credentials)
        
        # Query last 7 days
        request = {
            'startDate': '2026-02-16',
            'endDate': '2026-02-23',
            'dimensions': ['query'],
            'rowLimit': 10
        }
        
        response = service.searchanalytics().query(
            siteUrl='sc-domain:apacfinstab.com',
            body=request
        ).execute()
        
        print("\n📈 Top Search Queries (Last 7 Days):")
        for row in response.get('rows', []):
            query = row['keys'][0]
            clicks = row.get('clicks', 0)
            impressions = row.get('impressions', 0)
            ctr = row.get('ctr', 0) * 100
            position = row.get('position', 0)
            print(f"   '{query}' - Clicks: {clicks}, Impr: {impressions}, CTR: {ctr:.1f}%, Pos: {position:.1f}")
        
        if not response.get('rows'):
            print("   (No search data yet - site may be new or not indexed)")
        
        return True
    except Exception as e:
        print(f"❌ Search Analytics Error: {e}")
        return False

if __name__ == '__main__':
    print("🔍 Testing Google Search Console Connection...\n")
    test_search_console()
    test_search_analytics()
    print("\n✅ Test complete!")
