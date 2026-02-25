#!/usr/bin/env python3
"""
SFC Hong Kong 法规数据爬取脚本
目标：获取VASP牌照相关法规、指引、执法案例
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

# 配置
BASE_URL = "https://www.sfc.hk"
OUTPUT_DIR = "../data/sfc"

# 目标页面
TARGETS = {
    "vasp_rules": "/en/Rules-and-standards/Virtual-assets/Virtual-asset-trading-platforms-operators",
    "circulars": "/en/Regulatory-functions/Intermediaries/Licensing/Circulars-and-FAQs",
    "enforcement": "/en/News-and-announcements/News/Enforcement-news",
    "guidelines": "/en/Rules-and-standards/Virtual-assets"
}

def fetch_page(url):
    """获取页面内容"""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; APACFinstabBot/1.0; +https://apacfinstab.com)"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_vasp_requirements(html):
    """解析VASP牌照要求页面"""
    soup = BeautifulSoup(html, 'html.parser')
    
    requirements = []
    
    # 查找主要内容区域
    content = soup.find('div', class_='content') or soup.find('main')
    if not content:
        return requirements
    
    # 提取各个section
    sections = content.find_all(['h2', 'h3'])
    for section in sections:
        req = {
            "title": section.get_text(strip=True),
            "content": [],
            "links": []
        }
        
        # 获取section后的内容
        sibling = section.find_next_sibling()
        while sibling and sibling.name not in ['h2', 'h3']:
            if sibling.name == 'p':
                req["content"].append(sibling.get_text(strip=True))
            elif sibling.name == 'ul':
                for li in sibling.find_all('li'):
                    req["content"].append(f"• {li.get_text(strip=True)}")
            
            # 提取链接
            for a in sibling.find_all('a', href=True):
                req["links"].append({
                    "text": a.get_text(strip=True),
                    "url": a['href'] if a['href'].startswith('http') else BASE_URL + a['href']
                })
            
            sibling = sibling.find_next_sibling()
        
        if req["content"]:
            requirements.append(req)
    
    return requirements

def parse_enforcement_news(html):
    """解析执法新闻"""
    soup = BeautifulSoup(html, 'html.parser')
    
    cases = []
    
    # 查找新闻列表
    news_items = soup.find_all('div', class_='news-item') or soup.find_all('article')
    
    for item in news_items[:20]:  # 限制数量
        title_elem = item.find(['h2', 'h3', 'a'])
        date_elem = item.find('time') or item.find(class_='date')
        
        if title_elem:
            case = {
                "title": title_elem.get_text(strip=True),
                "date": date_elem.get_text(strip=True) if date_elem else None,
                "url": title_elem.get('href', '') if title_elem.name == 'a' else None,
                "type": "enforcement"
            }
            
            # 尝试提取摘要
            summary_elem = item.find('p')
            if summary_elem:
                case["summary"] = summary_elem.get_text(strip=True)
            
            cases.append(case)
    
    return cases

def save_data(data, filename):
    """保存数据到JSON"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(data) if isinstance(data, list) else 'data'} to {filepath}")

def main():
    print("=" * 60)
    print("SFC Hong Kong 法规数据爬取")
    print(f"时间: {datetime.now().isoformat()}")
    print("=" * 60)
    
    all_data = {
        "meta": {
            "source": "SFC Hong Kong",
            "scraped_at": datetime.now().isoformat(),
            "version": "0.1"
        },
        "vasp_requirements": [],
        "enforcement_cases": [],
        "circulars": []
    }
    
    # 1. 爬取VASP要求
    print("\n[1/3] 爬取VASP牌照要求...")
    html = fetch_page(BASE_URL + TARGETS["vasp_rules"])
    if html:
        all_data["vasp_requirements"] = parse_vasp_requirements(html)
        print(f"    获取 {len(all_data['vasp_requirements'])} 条要求")
    
    # 2. 爬取执法案例
    print("\n[2/3] 爬取执法案例...")
    html = fetch_page(BASE_URL + TARGETS["enforcement"])
    if html:
        all_data["enforcement_cases"] = parse_enforcement_news(html)
        print(f"    获取 {len(all_data['enforcement_cases'])} 条案例")
    
    # 3. 保存数据
    print("\n[3/3] 保存数据...")
    save_data(all_data, "sfc-compliance-data.json")
    
    # 单独保存各类数据
    if all_data["vasp_requirements"]:
        save_data(all_data["vasp_requirements"], "vasp-requirements.json")
    if all_data["enforcement_cases"]:
        save_data(all_data["enforcement_cases"], "enforcement-cases.json")
    
    print("\n" + "=" * 60)
    print("✅ 爬取完成!")
    print("=" * 60)

if __name__ == "__main__":
    main()
