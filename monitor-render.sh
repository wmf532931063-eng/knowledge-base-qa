#!/bin/bash

echo "🚀 Render部署监控脚本"
echo "======================"
echo ""

# 检查健康状态
echo "📊 当前服务状态:"
curl -s https://knowledge-base-qa.onrender.com/health | jq -r '.status'

echo ""
echo "🔍 检查API路由:"
echo "1. 测试路由:"
curl -s https://knowledge-base-qa.onrender.com/api/test 2>/dev/null | head -c 100
echo ""

echo "2. 根路径:"
curl -s https://knowledge-base-qa.onrender.com/ | jq -r '.name, .version, .status'

echo ""
echo "📈 部署状态:"
echo "- 代码已推送到GitHub: ✅ 完成"
echo "- Render自动部署: ⏳ 等待中"
echo "- 预计部署时间: 2-5分钟"
echo "- 部署完成后，API路由将正常工作"

echo ""
echo "💡 如何手动触发部署:"
echo "1. 访问 https://dashboard.render.com"
echo "2. 选择你的服务: knowledge-base-qa"
echo "3. 点击 'Manual Deploy'"
echo "4. 选择 'Deploy latest commit'"

echo ""
echo "🔧 环境变量检查:"
echo "确保Render有以下环境变量:"
echo "1. PORT=3001"
echo "2. NODE_ENV=production"
echo "3. NEXT_PUBLIC_LLM_API_KEY=你的API密钥"
echo "4. NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
echo "5. NEXT_PUBLIC_LLM_MODEL=qwen-turbo"
echo "6. EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2"