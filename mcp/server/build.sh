#!/bin/bash
# 构建脚本：将数据嵌入worker.js

cd "$(dirname "$0")"

echo "📦 Building APAC FINSTAB MCP Worker..."

# 读取数据文件
POLICY_DATA=$(cat ../../data/policy-events.json | jq -c '.events')
REGION_DATA=$(cat ../../data/region-overviews.json | jq -c '.')

# 创建dist目录
mkdir -p dist

# 替换占位符生成最终文件
cat worker.js | \
  sed "s/var POLICY_DATA = \[\];/var POLICY_DATA = $POLICY_DATA;/" | \
  sed "s/var REGION_DATA = {};/var REGION_DATA = $REGION_DATA;/" \
  > dist/worker.js

# 复制配置
cp wrangler.toml dist/

echo "✅ Build complete! Output: dist/worker.js"
echo "📊 Policy events: $(echo $POLICY_DATA | jq length)"
echo ""
echo "Next steps:"
echo "  cd dist && wrangler deploy"
