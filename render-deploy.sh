#!/bin/bash

echo "🚀 开始部署到Render..."

# 确保有最新的代码
git pull origin main

# 提交修改
echo "📝 提交修改..."
git add .
git commit -m "修复Render API路由加载问题" || echo "没有新修改需要提交"

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

echo "✅ 代码已推送到GitHub，Render将自动开始部署..."
echo ""
echo "📊 部署监控:"
echo "1. 访问 https://dashboard.render.com/web/srv-xxxxx"
echo "2. 查看部署状态"
echo "3. 部署完成后测试: https://knowledge-base-qa.onrender.com/health"
echo "4. API测试: https://knowledge-base-qa.onrender.com/api/test"

echo ""
echo "⚠️ 注意:"
echo "- 等待Render自动构建完成（约2-3分钟）"
echo "- 首次部署可能较慢"
echo "- 免费套餐有休眠机制，首次访问可能较慢"