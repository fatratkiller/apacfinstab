#!/usr/bin/env python3
"""
Batch URL index request via Search Console API
Request Google to crawl and index specific URLs
"""

import warnings
warnings.filterwarnings('ignore')

import os
import glob
from google.oauth2 import service_account
from googleapiclient.discovery import build

SERVICE_ACCOUNT_FILE = 'config/service-account.json'
SITE_URL = 'sc-domain:apacfinstab.com'

def get_all_pages():
    """Get all HTML pages that should be indexed"""
    pages = []
    
    # Main pages
    main_pages = [
        'https://apacfinstab.com/',
        'https://apacfinstab.com/index.html',
        'https://apacfinstab.com/blog.html',
        'https://apacfinstab.com/contact.html',
    ]
    pages.extend(main_pages)
    
    # Dashboard pages
    dashboard_files = glob.glob('dashboards/*.html')
    for f in dashboard_files:
        filename = os.path.basename(f)
        pages.append(f'https://apacfinstab.com/dashboards/{filename}')
    
    return pages

def check_url_status(service, url):
    """Check if URL is indexed"""
    try:
        result = service.urlInspection().index().inspect(
            body={
                'inspectionUrl': url,
                'siteUrl': SITE_URL
            }
        ).execute()
        
        status = result.get('inspectionResult', {}).get('indexStatusResult', {})
        verdict = status.get('verdict', 'UNKNOWN')
        coverage = status.get('coverageState', 'UNKNOWN')
        
        return {
            'url': url,
            'verdict': verdict,
            'coverage': coverage,
            'indexed': verdict == 'PASS'
        }
    except Exception as e:
        return {'url': url, 'error': str(e), 'indexed': False}

def main():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/webmasters']
    )
    service = build('searchconsole', 'v1', credentials=creds)
    
    pages = get_all_pages()
    
    print("=" * 60)
    print("📋 APAC FinStab URL Index Status Check")
    print("=" * 60)
    print(f"\n🔍 Checking {len(pages)} URLs...\n")
    
    indexed = []
    not_indexed = []
    errors = []
    
    for url in pages:
        result = check_url_status(service, url)
        if 'error' in result:
            errors.append(result)
            print(f"❓ {url[:50]}... - Error")
        elif result['indexed']:
            indexed.append(result)
            print(f"✅ {url[:50]}... - Indexed")
        else:
            not_indexed.append(result)
            print(f"⚠️ {url[:50]}... - Not Indexed ({result['coverage']})")
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"   ✅ Indexed:     {len(indexed)}")
    print(f"   ⚠️ Not Indexed: {len(not_indexed)}")
    print(f"   ❓ Errors:      {len(errors)}")
    
    if not_indexed:
        print("\n📝 URLs needing manual index request:")
        for item in not_indexed[:10]:
            print(f"   - {item['url']}")
        print("\n💡 Go to Search Console → URL Inspection → Request Indexing")

if __name__ == '__main__':
    main()
