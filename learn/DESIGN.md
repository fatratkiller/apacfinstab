# /learn/ 学习中心 - 产品设计文档

> Education instead of Advocacy
> 让散户通过游戏了解APAC监管，为主站引流

## 🎯 核心定位

- **目标用户**：散户、crypto新手、对监管感兴趣的普通人
- **核心价值**：游戏化学习 → 了解监管 → 转化为主站用户
- **与主站关系**：独立入口，不影响机构用户体验

---

## 🎮 游戏系统设计

### 1. 角色系统 (Character)

用户选择身份，不同身份有不同的"属性"和"弱点"：

| 角色 | 属性加成 | 弱点 | 数据来源 |
|------|----------|------|----------|
| 🔷 Ethereum Builder | DeFi +20%, 去中心化 +30% | 合规速度 -10% | tracker |
| 🟣 Solana Degen | 速度 +30%, NFT +20% | 监管风险 +20% | tracker |
| 🟡 CEX Operator | 牌照 +40%, 合规 +30% | 灵活性 -20% | tracker |
| 🟢 Stablecoin Issuer | 储备信任 +30% | 监管压力 +40% | tracker |
| 🔴 DeFi Protocol | 创新 +40% | 法律风险 +30% | tracker |

### 2. 地图系统 (Jurisdiction Map)

每个地区是一个"区域"，有不同的难度和特性：

| 地区 | 难度 | 特性 | Boss |
|------|------|------|------|
| 🇭🇰 Hong Kong | ⭐⭐⭐ | "东方门户" - 牌照友好但要求高 | HKMA审批 |
| 🇸🇬 Singapore | ⭐⭐⭐⭐ | "狮城" - MAS严格但透明 | MAS合规审查 |
| 🇯🇵 Japan | ⭐⭐⭐⭐ | "日出之国" - 细节魔鬼 | FSA技术审计 |
| 🇰🇷 South Korea | ⭐⭐⭐⭐⭐ | "龙之半岛" - 政策多变 | 政策风暴 |
| 🇦🇺 Australia | ⭐⭐⭐ | "南十字" - 正在成型 | AFSL deadline |
| 🇨🇳 China | ☠️ | "禁区" - 高难度生存模式 | 全面禁令 |

### 3. 关卡系统 (Issues/Challenges)

每个关卡对应一个具体的监管议题：

**示例关卡：**
- Level 1: "什么是VASP？" (基础概念)
- Level 2: "Travel Rule 101" (中级知识)
- Level 3: "Stablecoin框架对比" (高级分析)
- Boss: "香港VASP牌照申请模拟" (实战)

### 4. Boss战 (Major Events)

重大监管事件作为Boss战：
- Luna崩盘 → 全球稳定币监管收紧
- FTX暴雷 → CEX合规要求升级
- 香港开放ETF → 政策窗口期

---

## 🕹️ 游戏化功能模块

### Module 1: Policy Quiz (每日问答)

- 每日5道题，限时答题
- 正确率影响排行榜
- 连续答对有streak奖励
- 题目来源：tracker数据 + blog文章

### Module 2: Region Roulette (地区转盘)

- 每日一次免费转盘
- 随机抽取地区，显示今日政策风险
- 特殊奖励：抽到"政策利好"地区获得徽章

### Module 3: Compliance Streak (签到系统)

- 连续登录解锁徽章
- 7天：Bronze Compliance Officer
- 30天：Silver Regulatory Expert
- 100天：Gold Policy Master
- 徽章可展示在排行榜

### Module 4: Leaderboard (排行榜)

- 全球排行 / 按角色排行 / 按地区排行
- 显示：用户名、角色、徽章、得分
- **重要**：进入排行榜Top 100需要订阅blog

### Module 5: Achievement System (成就系统)

- "First Blood" - 完成第一个Quiz
- "Region Master" - 通关一个地区所有关卡
- "Policy Nerd" - 连续30天登录
- "Boss Slayer" - 击败第一个Boss

---

## 🔗 引流机制

### 免费功能 (Free Tier)
- 每日Quiz (3题)
- 地区转盘 (1次/天)
- 基础排行榜查看
- 基础徽章

### 进阶功能 (需订阅Blog解锁)
- 无限Quiz
- Boss战挑战
- 完整排行榜
- 稀有徽章
- 角色自定义

### 订阅引导
- "订阅Blog解锁完整游戏体验"
- "成为Policy Master，订阅获取每周独家分析"

---

## 📊 数据联动

### 从Tracker获取
- 各地区政策事件
- 协议分类数据
- 风险评级

### 从Blog获取
- 文章内容 → 生成Quiz题目
- 热点事件 → 生成Boss战

---

## 🛠️ 技术实现

### 前端
- 纯静态HTML/CSS/JS
- LocalStorage存储用户进度
- 可选：接入简单后端存排行榜

### 数据
- policy-events.json 作为数据源
- 定期更新关卡内容

---

## 📅 开发路线

### Phase 1 (MVP)
- [ ] 基础页面框架
- [ ] 角色选择
- [ ] Policy Quiz (本地题库)
- [ ] 基础签到

### Phase 2
- [ ] 地区地图
- [ ] 排行榜
- [ ] Blog订阅解锁

### Phase 3
- [ ] Boss战
- [ ] 成就系统
- [ ] 社交分享

---

*Created: 2026-02-13*
*Author: 淑芬 + EF-Coach Brainstorm*
