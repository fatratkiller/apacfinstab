#!/usr/bin/env python3
"""Check indexing status and submit sitemap"""

import warnings
warnings.filterwarnings('ignore')

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/webmasters']
SERVICE_ACCOUNT_FILE = 'config/service-account.json'

def check_and_submit():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = build('searchconsole', 'v1', credentials=credentials)
    
    site_url = 'sc-domain:apacfinstab.com'
    
    # Check existing sitemaps
    print("📋 Checking Sitemaps...")
    try:
        sitemaps = service.sitemaps().list(siteUrl=site_url).execute()
        existing = sitemaps.get('sitemap', [])
        
        if existing:
            print(f"✅ Found {len(existing)} sitemap(s):")
            for sm in existing:
                print(f"   - {sm['path']}")
                print(f"     Last submitted: {sm.get('lastSubmitted', 'N/A')}")
                print(f"     Errors: {sm.get('errors', 0)}, Warnings: {sm.get('warnings', 0)}")
        else:
            print("⚠️ No sitemaps found!")
            
    except Exception as e:
        print(f"❌ Error checking sitemaps: {e}")
    
    # Submit sitemap
    print("\n📤 Submitting sitemap...")
    try:
        service.sitemaps().submit(
            siteUrl=site_url,
            feedpath='https://apacfinstab.com/sitemap.xml'
        ).execute()
        print("✅ Sitemap submitted: https://apacfinstab.com/sitemap.xml")
    except Exception as e:
        print(f"❌ Error submitting sitemap: {e}")

if __name__ == '__main__':
    check_and_submit()
