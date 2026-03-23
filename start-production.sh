#!/bin/bash

# 知识库AI问答系统生产环境启动脚本
# 适用于本地测试或简单部署

set -e

echo "🚀 启动知识库AI问答系统（生产模式）..."
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查环境
echo -e "\n${GREEN}[1/5] 检查环境...${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    echo "请安装 Node.js 18+：https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# 检查NPM
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM 未安装${NC}"
    exit 1
fi
echo "✅ NPM: $(npm --version)"

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 未安装，正在安装...${NC}"
    npm install -g pm2
fi
echo "✅ PM2: $(pm2 --version | head -n1)"

# 检查依赖
echo -e "\n${GREEN}[2/5] 检查项目依赖...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 未找到 package.json${NC}"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
fi

if [ -d "client" ] && [ ! -d "client/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd client && npm install && cd ..
fi

# 构建前端
echo -e "\n${GREEN}[3/5] 构建前端应用...${NC}"
if npm run | grep -q "build"; then
    npm run build
    echo "✅ 前端构建完成"
else
    echo "ℹ️  未找到构建脚本，跳过构建"
fi

# 检查环境变量
echo -e "\n${GREEN}[4/5] 检查环境配置...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}⚠️  未找到 .env 文件，复制示例文件...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}请编辑 .env 文件配置API密钥：${NC}"
        echo -e "${YELLOW}  nano .env${NC}"
        echo -e "${YELLOW}或使用你喜欢的编辑器${NC}"
        echo -e "${YELLOW}按任意键继续...${NC}"
        read -n 1
    else
        echo -e "${RED}❌ 未找到环境配置文件${NC}"
        exit 1
    fi
fi

# 启动服务
echo -e "\n${GREEN}[5/5] 启动服务...${NC}"

# 停止已有服务
if pm2 list | grep -q "knowledge-backend"; then
    echo "⏸️  停止已有后端服务..."
    pm2 stop knowledge-backend
fi

if pm2 list | grep -q "knowledge-frontend"; then
    echo "⏸️  停止已有前端服务..."
    pm2 stop knowledge-frontend
fi

# 启动后端
echo "🚀 启动后端服务（端口: 3001）..."
pm2 start "npm run server" --name "knowledge-backend" --time

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端健康状态
if curl -s http://localhost:3001/api/qa/health | grep -q "ok"; then
    echo "✅ 后端服务运行正常"
else
    echo -e "${YELLOW}⚠️  后端服务启动较慢，继续等待...${NC}"
    sleep 5
fi

# 启动前端
echo "🚀 启动前端服务（端口: 5173）..."
pm2 start "npm run client" --name "knowledge-frontend" --time

# 保存PM2配置
pm2 save

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ 系统启动完成！${NC}"
echo -e "${GREEN}==========================================${NC}"

# 显示访问信息
echo -e "\n📊 访问信息："
echo -e "  🌐 前端界面: ${GREEN}http://localhost:5173${NC}"
echo -e "  🔧 后端API: ${GREEN}http://localhost:3001${NC}"
echo -e "  📡 健康检查: ${GREEN}http://localhost:3001/api/qa/health${NC}"

echo -e "\n🔧 管理命令："
echo -e "  查看服务状态: ${YELLOW}pm2 status${NC}"
echo -e "  查看后端日志: ${YELLOW}pm2 logs knowledge-backend${NC}"
echo -e "  查看前端日志: ${YELLOW}pm2 logs knowledge-frontend${NC}"
echo -e "  停止所有服务: ${YELLOW}pm2 stop all${NC}"
echo -e "  重启所有服务: ${YELLOW}pm2 restart all${NC}"
echo -e "  监控资源: ${YELLOW}pm2 monit${NC}"

echo -e "\n🧪 快速测试："
echo -e "  测试知识库: ${YELLOW}curl -X POST http://localhost:3001/api/qa/ask -H 'Content-Type: application/json' -d '{\"question\": \"什么是四柱预测学？\"}'${NC}"

echo -e "\n🔒 内测说明："
echo -e "  1. 在局域网内，其他用户可通过你的IP地址访问"
echo -e "  2. 你的本地IP: $(hostname -I | awk '{print $1}')"
echo -e "  3. 分享链接: ${GREEN}http://$(hostname -I | awk '{print $1}'):5173${NC}"
echo -e "  4. 确保防火墙允许端口 5173 和 3001"

echo -e "\n📝 下一步："
echo -e "  1. 测试所有功能是否正常"
echo -e "  2. 分享链接给内测用户"
echo -e "  3. 收集反馈进行优化"
echo -e "  4. 考虑域名和SSL证书（可选）"

# 设置脚本权限
chmod +x deploy.sh
chmod +x start-production.sh

echo -e "\n🎯 准备好开始内测了吗？访问上面的链接吧！"

# 打开浏览器（可选）
read -p "是否在浏览器中打开应用？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open http://localhost:5173
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:5173
    elif command -v start &> /dev/null; then
        start http://localhost:5173
    else
        echo "请手动打开浏览器访问: http://localhost:5173"
    fi
fi