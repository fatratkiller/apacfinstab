#!/bin/bash
# 一键部署到Cloudflare Workers
set -e

echo "🚀 开始部署 apacfinstab..."

# 检查关键文件
for f in index.html sitemap.xml robots.txt; do
  if [ ! -f "$f" ]; then
    echo "❌ 缺少: $f"
    exit 1
  fi
done
echo "✅ 关键文件检查通过"

# 复制到干净目录（排除大文件）
echo "📦 准备部署文件..."
rm -rf /tmp/apacfinstab-deploy
mkdir -p /tmp/apacfinstab-deploy
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='*.md' \
  --exclude='*.sh' \
  --exclude='scripts' \
  --exclude='research' \
  --exclude='packages' \
  --exclude='.github' \
  --exclude='external-content' \
  --exclude='prompts' \
  --exclude='mcp' \
  --exclude='grants-opportunities' \
  --exclude='docs' \
  --exclude='arc-protocol' \
  --exclude='.wrangler' \
  . /tmp/apacfinstab-deploy/

# 复制wrangler配置
cp wrangler.jsonc /tmp/apacfinstab-deploy/

# 部署
cd /tmp/apacfinstab-deploy
npx wrangler deploy --config wrangler.jsonc

# 健康检查
echo "⏳ 等待部署生效..."
sleep 5
status=$(curl -s -o /dev/null -w "%{http_code}" "https://apacfinstab.com" --max-time 10)
if [ "$status" = "200" ]; then
  echo "✅ 部署成功！网站正常访问"
else
  echo "⚠️ 网站返回 $status，请检查"
fi
