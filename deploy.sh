#!/bin/bash

# 知识库AI问答系统一键部署脚本
# 适用于Ubuntu 22.04系统

set -e

echo "🚀 开始部署知识库AI问答系统..."
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以root或sudo运行
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  建议使用sudo运行此脚本${NC}"
    echo -e "${YELLOW}请输入: sudo bash $0${NC}"
    read -p "是否继续? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤1: 更新系统
echo -e "\n${GREEN}[1/8] 更新系统包...${NC}"
apt update && apt upgrade -y

# 步骤2: 安装Node.js
echo -e "\n${GREEN}[2/8] 安装Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

# 步骤3: 安装PM2
echo -e "\n${GREEN}[3/8] 安装PM2进程管理器...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo "✅ PM2 已安装"
fi

# 步骤4: 安装Git
echo -e "\n${GREEN}[4/8] 安装Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
else
    echo "✅ Git 已安装: $(git --version | head -n1)"
fi

# 步骤5: 克隆或更新代码
echo -e "\n${GREEN}[5/8] 准备代码...${NC}"
if [ -d "knowledge-base-qa" ]; then
    echo "📂 代码目录已存在，更新代码..."
    cd knowledge-base-qa
    git pull origin main
else
    echo "📂 克隆代码仓库..."
    read -p "请输入GitHub仓库地址（直接回车使用当前目录）: " repo_url
    if [ -z "$repo_url" ]; then
        echo "📁 使用当前目录作为代码源"
        if [ -f "package.json" ]; then
            echo "✅ 当前目录包含项目文件"
        else
            echo -e "${RED}❌ 当前目录不是有效项目目录${NC}"
            exit 1
        fi
    else
        git clone "$repo_url" knowledge-base-qa
        cd knowledge-base-qa
    fi
fi

# 步骤6: 安装依赖
echo -e "\n${GREEN}[6/8] 安装项目依赖...${NC}"
if [ -f "package.json" ]; then
    # 检查是否有install:all脚本
    if npm run | grep -q "install:all"; then
        npm run install:all
    else
        npm install
        if [ -d "client" ] && [ -f "client/package.json" ]; then
            cd client && npm install && cd ..
        fi
    fi
    echo "✅ 依赖安装完成"
else
    echo -e "${RED}❌ package.json 文件不存在${NC}"
    exit 1
fi

# 步骤7: 构建前端
echo -e "\n${GREEN}[7/8] 构建前端应用...${NC}"
if [ -f "package.json" ] && npm run | grep -q "build"; then
    npm run build
    echo "✅ 前端构建完成"
else
    echo "ℹ️  未找到构建脚本，跳过构建"
fi

# 步骤8: 配置环境变量
echo -e "\n${GREEN}[8/8] 配置环境变量...${NC}"
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  请编辑 .env 文件配置API密钥:${NC}"
    echo -e "${YELLOW}  nano .env${NC}"
    echo -e "${YELLOW}然后重新运行此脚本${NC}"
    exit 0
elif [ -f ".env" ]; then
    echo "✅ 环境变量文件已存在"
fi

# 步骤9: 启动服务
echo -e "\n${GREEN}[+] 启动应用服务...${NC}"

# 检查服务是否已运行
if pm2 list | grep -q "knowledge-backend"; then
    echo "🔄 重启后端服务..."
    pm2 restart knowledge-backend
else
    echo "🚀 启动后端服务..."
    pm2 start "npm run server" --name "knowledge-backend"
fi

if pm2 list | grep -q "knowledge-frontend"; then
    echo "🔄 重启前端服务..."
    pm2 restart knowledge-frontend
else
    echo "🚀 启动前端服务..."
    pm2 start "npm run client" --name "knowledge-frontend"
fi

# 保存PM2配置
pm2 save
pm2 startup

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}==========================================${NC}"

# 显示访问信息
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "\n📊 部署信息："
echo -e "  🌐 前端地址: ${GREEN}http://${SERVER_IP}:5173${NC}"
echo -e "  🔧 后端API: ${GREEN}http://localhost:3001${NC}"
echo -e "  📡 健康检查: ${GREEN}http://localhost:3001/api/qa/health${NC}"

echo -e "\n🔧 管理命令："
echo -e "  查看服务状态: ${YELLOW}pm2 status${NC}"
echo -e "  查看日志: ${YELLOW}pm2 logs knowledge-backend${NC}"
echo -e "  停止服务: ${YELLOW}pm2 stop all${NC}"
echo -e "  重启服务: ${YELLOW}pm2 restart all${NC}"

echo -e "\n🔒 安全建议："
echo -e "  1. 配置防火墙"
echo -e "  2. 设置域名和SSL证书"
echo -e "  3. 定期备份数据"

echo -e "\n🎯 内测准备就绪！"
echo -e "  分享此链接给用户：${GREEN}http://${SERVER_IP}:5173${NC}"

# 测试API连接
echo -e "\n🧪 测试API连接..."
sleep 3
if curl -s http://localhost:3001/api/qa/health | grep -q "ok"; then
    echo -e "${GREEN}✅ API服务运行正常${NC}"
else
    echo -e "${YELLOW}⚠️  API服务未响应，请检查日志${NC}"
fi