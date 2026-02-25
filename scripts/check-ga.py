#!/usr/bin/env python3
"""
GA Tracking 检查脚本
确保所有HTML页面都有GA代码

运行方式: python3 scripts/check-ga.py
"""

import os
import glob
import sys

GA_ID = "G-PX174NJW6M"
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_ga_tracking():
    """检查所有HTML文件是否有GA tracking"""
    
    # 查找所有HTML文件
    html_files = []
    for pattern in ['*.html', '*/*.html', 'dashboards/*.html']:
        html_files.extend(glob.glob(os.path.join(ROOT_DIR, pattern)))
    
    missing_ga = []
    has_ga = []
    
    for filepath in html_files:
        # 跳过模板文件
        if 'template' in filepath.lower():
            continue
            
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        if GA_ID in content or 'gtag' in content:
            has_ga.append(filepath)
        else:
            missing_ga.append(filepath)
    
    # 输出结果
    print("=" * 60)
    print("🔍 GA TRACKING 检查报告")
    print("=" * 60)
    print(f"\n✅ 有GA代码的页面: {len(has_ga)}")
    
    if missing_ga:
        print(f"\n❌ 缺少GA代码的页面: {len(missing_ga)}")
        for f in missing_ga:
            rel_path = os.path.relpath(f, ROOT_DIR)
            print(f"   - {rel_path}")
        print("\n⚠️ 请立即修复上述页面！")
        return 1
    else:
        print("\n🎉 所有页面都有GA代码！")
        return 0

if __name__ == "__main__":
    sys.exit(check_ga_tracking())
