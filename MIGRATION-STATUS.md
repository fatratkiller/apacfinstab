# GitHub → GitLab 迁移状态

> 2026-03-01 GitHub账号被flagged事件

## 当前状态：观察期

**截止日期：2026-03-08（下周一）**

### 已完成
- [x] GitLab仓库创建：https://gitlab.com/kyleleo2018-group/apacfinstab
- [x] 代码同步到GitLab
- [x] Cloudflare Workers部署
- [x] 域名绑定：apacfinstab.com → Workers
- [x] 网站恢复运行
- [x] 4h轮询改为12h（08:00, 20:00）
- [x] 目录站提交cron暂停

### 待定决策

**情况A：GitHub解禁（下周一前）**
- 继续用GitHub为主
- 保持当前cron配置（已降频）
- GitLab作为备份

**情况B：GitHub未解禁（下周一后）**
- 切换GitLab为主
- 修改所有cron的git push命令
- GitHub仅用于MCP合作（手动操作）

## 教训总结

1. **降低自动化频率**：4h → 12h
2. **异步执行**：agent任务时间错开，避免短时间大量git操作
3. **多平台备份**：不依赖单一代码托管平台

## 涉及git push的cron任务

| 任务 | 时间 | 当前状态 |
|------|------|----------|
| apacfinstab-growth-12h-cycle | 08:00, 20:00 | ✅ 已降频 |
| apacfinstab-daily-seo | 10:00 | 待观察 |
| apacfinstab-blog-sync | 09:00 | 待观察 |

## 下一步

- [ ] 等待GitHub Support回复
- [ ] 2026-03-08 评估是否切换到GitLab
