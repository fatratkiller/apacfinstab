# 🚀 部署指南 - APACFINSTAB

## 自动部署流程

```
推送代码 → GitHub Actions 验证 → Cloudflare Pages 部署 → 健康检查
```

### PR流程（推荐）
1. 创建分支修改
2. 提交PR → 自动生成预览URL
3. 验证预览没问题 → 合并到main
4. 自动部署生产环境

### 直接推送
- 推送到 `main` 分支会直接触发生产部署
- 适合小改动，但有风险

---

## 🚨 紧急回滚

### 方法1：Cloudflare Dashboard（最快）
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages → apacfinstab → Deployments
3. 找到上一个正常版本 → 点击 "Rollback to this deployment"
4. **30秒内生效**

### 方法2：Git回滚
```bash
# 查看最近提交
git log --oneline -10

# 回滚到指定版本
git revert HEAD
git push origin main
```

---

## 📊 监控

### 自动监控
- GitHub Actions 每小时检查网站可用性
- 失败会在 Actions 页面显示红色告警

### 手动检查
```bash
# 本地快速检查
curl -I https://apacfinstab.com
```

### 推荐：UptimeRobot
1. 注册 [UptimeRobot](https://uptimerobot.com) (免费)
2. 添加监控：https://apacfinstab.com
3. 设置告警：邮件/Discord/Telegram

---

## 🔧 Secrets配置（一次性）

在 GitHub 仓库 Settings → Secrets and variables → Actions 添加：

| Secret名称 | 获取方式 |
|-----------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token → Edit Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → 右侧栏 Account ID |

---

## ✅ 部署检查清单

部署前确认：
- [ ] `index.html` 存在且正常
- [ ] `sitemap.xml` 已更新
- [ ] 本地测试过关键页面
- [ ] 大文件已排除（.git, node_modules等）

---

*最后更新：2026-03-12*
