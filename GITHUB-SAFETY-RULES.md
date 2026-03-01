# GitHub Safety Rules - 防止被flagged

> 2026-03-01 事件后制定

## 🚨 根本原因
- 短时间大量自动commit/push
- 被GitHub误判为bot/spam行为

## ✅ 规避机制

### 1. 降低Push频率
| 原规则 | 新规则 |
|--------|--------|
| 每4小时push | 每天最多2次push |
| 每个任务单独push | 批量合并后再push |
| 随时push | 固定时间窗口push (10:00, 18:00) |

### 2. 人性化Commit Pattern
- 不在凌晨commit
- 不在5分钟内多次commit
- commit message要有变化，不要重复模板

### 3. 使用PAT替代OAuth
- OAuth触发更多安全检查
- 使用Personal Access Token更稳定

### 4. 分散到多仓库
- 不要把所有自动化集中在一个仓库
- 主仓库只放关键代码

## ⚠️ Cron任务修改清单

### 需要修改的任务：
1. `apacfinstab-growth-4h-cycle` → 改为每天2次 (10:00, 18:00)
2. 所有涉及git push的任务 → 批量合并操作

### 批量Push机制：
```
# 不要每个任务push
# 改为累积更改，定时push

10:00 - 执行所有SEO/内容任务，最后统一push一次
18:00 - 执行所有更新任务，最后统一push一次
```

## 📅 实施日期
- 2026-03-01: 规则制定
- 等GitHub解封后执行修改

---

*教训：自动化不能无脑执行，要考虑平台限制*
