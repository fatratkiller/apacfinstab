#!/usr/bin/env python3
"""Test Google Analytics 4 API connection"""

import warnings
warnings.filterwarnings('ignore')

from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta

SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']
SERVICE_ACCOUNT_FILE = 'config/service-account.json'
PROPERTY_ID = '514166879'

def test_ga4():
    """Test GA4 Data API connection"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        
        # Use GA4 Data API
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import (
            RunReportRequest, DateRange, Dimension, Metric
        )
        
        client = BetaAnalyticsDataClient(credentials=credentials)
        
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[Dimension(name="date")],
            metrics=[
                Metric(name="activeUsers"),
                Metric(name="sessions"),
                Metric(name="screenPageViews")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
        )
        
        response = client.run_report(request)
        
        print("✅ Google Analytics 4 Connected!")
        print(f"📊 Property ID: {PROPERTY_ID}")
        print("\n📈 Last 7 Days Summary:")
        print("-" * 40)
        
        total_users = 0
        total_sessions = 0
        total_pageviews = 0
        
        for row in response.rows:
            date = row.dimension_values[0].value
            users = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)
            pageviews = int(row.metric_values[2].value)
            total_users += users
            total_sessions += sessions
            total_pageviews += pageviews
            print(f"   {date}: {users} users, {sessions} sessions, {pageviews} pageviews")
        
        print("-" * 40)
        print(f"   TOTAL: {total_users} users, {total_sessions} sessions, {total_pageviews} pageviews")
        
        return True
        
    except Exception as e:
        print(f"❌ GA4 Error: {e}")
        return False

if __name__ == '__main__':
    print("🔍 Testing Google Analytics 4 Connection...\n")
    test_ga4()
