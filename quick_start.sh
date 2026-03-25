#!/bin/bash

# 知识库问答系统快速启动脚本
# 用法: ./quick_start.sh [action]
#   start    - 启动服务器
#   stop     - 停止服务器
#   status   - 检查状态
#   rebuild  - 重建知识库
#   test     - 测试连接

ACTION=${1:-status}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}✨ 知识库问答系统管理工具 ✨${NC}\n"

case $ACTION in
    start)
        echo -e "${GREEN}▶️  启动服务器...${NC}"
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${YELLOW}⚠️  服务器已经在运行 (端口: 3001)${NC}"
        else
            node server/index.js > server.log 2>&1 &
            SERVER_PID=$!
            echo -e "${GREEN}✅ 服务器已启动 (PID: $SERVER_PID)${NC}"
            echo -e "${BLUE}📊 查看日志: tail -f server.log${NC}"
        fi
        ;;
    
    stop)
        echo -e "${YELLOW}⏹️  停止服务器...${NC}"
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
            kill $(lsof -t -i:3001) 2>/dev/null
            echo -e "${GREEN}✅ 服务器已停止${NC}"
        else
            echo -e "${YELLOW}⚠️  服务器未运行${NC}"
        fi
        ;;
    
    status)
        echo -e "${BLUE}📊 系统状态检查${NC}"
        echo "========================="
        
        # 检查服务器
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${GREEN}✅ 服务器: 运行中 (端口: 3001)${NC}"
        else
            echo -e "${RED}❌ 服务器: 未运行${NC}"
        fi
        
        # 检查API连接
        echo -e "\n🔗 API连接测试:"
        if curl -s http://localhost:3001/api/qa/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ 问答API: 正常${NC}"
            
            # 检查知识库状态
            STATS=$(curl -s http://localhost:3001/api/knowledge/stats)
            DOC_COUNT=$(echo "$STATS" | grep -o '"documentCount":[0-9]*' | cut -d: -f2)
            if [[ $DOC_COUNT -gt 0 ]]; then
                echo -e "${GREEN}✅ 知识库: 已加载 ($DOC_COUNT 个文档片段)${NC}"
            else
                echo -e "${RED}❌ 知识库: 未加载${NC}"
            fi
        else
            echo -e "${RED}❌ 问答API: 无法连接${NC}"
        fi
        
        # 检查环境变量
        echo -e "\n⚙️  环境配置:"
        if [[ -f .env ]]; then
            echo -e "${GREEN}✅ 环境文件: 存在${NC}"
            
            # 检查API密钥
            if grep -q "NEXT_PUBLIC_LLM_API_KEY=" .env && ! grep -q "your_" .env; then
                echo -e "${GREEN}✅ API密钥: 已配置${NC}"
            else
                echo -e "${RED}❌ API密钥: 未配置或无效${NC}"
            fi
        else
            echo -e "${RED}❌ 环境文件: 不存在${NC}"
        fi
        ;;
    
    rebuild)
        echo -e "${YELLOW}🔄 重建知识库索引...${NC}"
        
        # 确保服务器运行
        if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${YELLOW}⚠️  启动服务器...${NC}"

            node server/index.js > server.log 2>&1 &
            SERVER_PID=$!
            echo -e "${GREEN}✅ 服务器已启动 (PID: $SERVER_PID)${NC}"
            sleep 3
        fi
        
        # 重建知识库
        echo -e "${BLUE}📚 开始重建知识库...${NC}"
        RESPONSE=$(curl -s -X POST http://localhost:3001/api/knowledge/rebuild -H "Content-Type: application/json" -d '{}')
        
        if echo "$RESPONSE" | grep -q '"success":true'; then
            DOC_COUNT=$(echo "$RESPONSE" | grep -o '"documentCount":[0-9]*' | cut -d: -f2)
            echo -e "${GREEN}✅ 知识库重建成功${NC}"
            echo -e "${BLUE}📊 索引文档片段: $DOC_COUNT${NC}"
        else
            echo -e "${RED}❌ 知识库重建失败${NC}"
            echo "响应: $RESPONSE"
        fi
        ;;
    
    test)
        echo -e "${BLUE}🧪 系统功能测试${NC}"
        echo "=================="
        
        # 1. 检查服务器
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${GREEN}✅ 服务器检查: 通过${NC}"
            
            # 2. 测试问答
            echo -e "\n🔍 测试问答功能..."
            RESPONSE=$(curl -s -X POST http://localhost:3001/api/qa/ask \
                -H "Content-Type: application/json" \
                -d '{"question": "你好，请简单回复测试成功"}')
            
            if echo "$RESPONSE" | grep -q '"answer"'; then
                ANSWER=$(echo "$RESPONSE" | grep -o '"answer":"[^"]*"' | cut -d: -f2- | tr -d '"' | head -c 100)

                echo -e "${GREEN}✅ 问答测试: 通过${NC}"
                echo -e "${BLUE}  回答: ${ANSWER}...${NC}"
            else

                echo -e "${RED}❌ 问答测试: 失败${NC}"
            fi
        else

            echo -e "${RED}❌ 服务器检查: 失败 (服务器未运行)${NC}"
        fi
        ;;
    
    *)
        echo -e "${RED}❌ 无效的操作: $ACTION${NC}"
        echo "可用操作:"
        echo "  start    - 启动服务器"
        echo "  stop     - 停止服务器"
        echo "  status   - 检查状态"
        echo "  rebuild  - 重建知识库"
        echo "  test     - 测试连接"
        exit 1
        ;;
esac

echo -e "\n${BLUE}💡 提示: 详细解决方案请参考 '大模型连接问题解决总结.md'${NC}"
echo -e "${BLUE}🔗 访问地址: http://localhost:3001${NC}"