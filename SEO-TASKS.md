# APAC FinStab SEO 任务体系

> 最后更新: 2026-02-23
> 数据源: Google Search Console + GA4

---

## 📊 当前基线 (2026-02-23)

| 指标 | 数值 | 目标 (30天) |
|------|------|------------|
| Google点击 | 3/月 | 50/月 |
| 搜索展示 | ~10/月 | 500/月 |
| 已索引页面 | 2 | 20+ |
| 流量来源-搜索占比 | 6% | 30% |
| 关键词Top 10 | 0 | 5+ |

---

## 📅 每日任务 (Daily)

### 🔴 必做 (每天5分钟)

- [ ] **检查Search Console错误**
  - 运行: `python3 scripts/check_index_status.py`
  - 关注: 索引错误、抓取问题

- [ ] **新内容索引请求**
  - 每次更新dashboard后，提交URL索引请求
  - Search Console → URL Inspection → Request Indexing

### 🟡 可选 (有时间就做)

- [ ] **社交分享新内容**
  - Twitter发布dashboard更新
  - LinkedIn分享行业洞察

---

## 📅 每周任务 (Weekly)

### 周一: 数据复盘

- [ ] 运行 `python3 scripts/full_seo_report.py`
- [ ] 对比上周数据，记录变化
- [ ] 识别表现好/差的页面

### 周三: 内容优化

- [ ] 优化1个现有页面的SEO
  - Title优化 (包含目标关键词)
  - Meta Description优化
  - H1/H2结构检查
  - 内部链接添加

### 周五: 外链建设

- [ ] 发布1篇外链内容
  - Reddit r/cryptocurrency 或 r/defi
  - Hacker News (如有高质量内容)
  - 行业论坛/社区

### 周日: 技术SEO检查

- [ ] Core Web Vitals检查
- [ ] 移动端兼容性测试
- [ ] 死链检查

---

## 📅 每月任务 (Monthly)

### 第1周: 关键词研究

- [ ] 分析Search Console新出现的查询词
- [ ] 识别长尾关键词机会
- [ ] 更新目标关键词列表

### 第2周: 竞品分析

- [ ] 分析竞品排名关键词
- [ ] 识别内容差距
- [ ] 制定内容补充计划

### 第3周: 内容创作

- [ ] 创建1篇深度内容 (2000+字)
- [ ] 针对目标关键词优化
- [ ] 内部链接布局

### 第4周: 技术优化

- [ ] 网站速度优化
- [ ] Schema标记检查
- [ ] Sitemap更新

---

## 🎯 当前优先任务 (基于数据分析)

### P0 - 解决索引问题
**问题:** 只有2个页面被索引，大量dashboard未收录
**行动:**
1. 批量提交所有dashboard URL
2. 检查robots.txt是否阻止抓取
3. 确保内部链接结构合理

### P1 - 增加搜索可见性
**问题:** 搜索展示量极低
**行动:**
1. 优化首页Title/Description包含核心关键词
2. 创建 "APAC Crypto Regulation 2026" 专题页
3. 博客内容增加行业关键词

### P2 - 外链建设
**问题:** 域名权重低，缺乏外链
**行动:**
1. Guest post到FintechNews.sg
2. Reddit/HN社区参与
3. 行业目录提交

---

## 📈 目标关键词

### 主要关键词 (竞争)
- APAC crypto regulation
- Asia cryptocurrency policy
- Hong Kong stablecoin license
- Singapore MAS crypto

### 长尾关键词 (低竞争优先)
- APAC DeFi compliance 2026
- Asia Pacific fintech regulation tracker
- Hong Kong crypto exchange license requirements
- China digital yuan CBDC updates

---

## 📁 相关文件

| 文件 | 用途 |
|------|------|
| `scripts/full_seo_report.py` | 综合SEO报告 |
| `scripts/seo_report.py` | Search Console报告 |
| `scripts/check_index_status.py` | 索引状态检查 |
| `sitemap.xml` | 网站地图 |

---

## 📝 执行记录

### 2026-02-23
- ✅ 配置Google Search Console API
- ✅ 配置Google Analytics 4 API
- ✅ 创建自动化报告脚本
- ✅ 建立SEO任务体系
