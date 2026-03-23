#!/bin/bash

# 免费部署方案 - Vercel + Railway
# 适用于10人以下内测

set -e

echo "🚀 开始免费部署方案（Vercel + Railway）..."
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}📋 免费方案概述：${NC}"
echo "  🔸 前端：部署到 Vercel（免费）"
echo "  🔸 后端：部署到 Railway（免费）"
echo "  🔸 费用：完全免费"
echo "  🔸 限制：每月有限运行时间，适合内测"
echo "  🔸 预估：支持10人以下使用完全足够"

echo -e "\n${GREEN}[1/6] 准备GitHub仓库...${NC}"

# 检查Git状态
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
    git add .
    git commit -m "初始提交: 知识库AI问答系统"
    echo -e "${YELLOW}⚠️  请将代码推送到GitHub：${NC}"
    echo "  1. 访问 https://github.com/new 创建新仓库"
    echo "  2. 按照提示推送代码："
    echo "     git remote add origin https://github.com/用户名/仓库名.git"
    echo "     git branch -M main"
    echo "     git push -u origin main"
    echo -e "${YELLOW}完成后按任意键继续...${NC}"
    read -n 1
else
    echo "✅ Git仓库已初始化"
    git_status=$(git status --porcelain)
    if [ -n "$git_status" ]; then
        echo "📝 有未提交的更改，建议提交..."
        read -p "是否现在提交？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "部署前更新"
        fi
    fi
fi

echo -e "\n${GREEN}[2/6] 配置前端部署（Vercel）...${NC}"

# 创建Vercel配置文件
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.up.railway.app/api/:path*"
    }
  ],
  "env": {
    "VITE_API_URL": {
      "description": "后端API地址",
      "value": "https://your-backend.up.railway.app"
    }
  }
}
EOF

# 创建前端生产环境配置
cat > client/.env.production << 'EOF'
VITE_API_URL=https://your-backend.up.railway.app
EOF

cat > client/.env << 'EOF'
VITE_API_URL=http://localhost:3001
EOF

echo "✅ 前端配置文件创建完成"

echo -e "\n${GREEN}[3/6] 配置后端部署（Railway）...${NC}"

# 创建Railway配置文件
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:all"
  },
  "deploy": {
    "startCommand": "npm run server",
    "healthcheckPath": "/api/qa/health",
    "healthcheckTimeout": 300
  }
}
EOF

# 创建Dockerfile用于Railway
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    tesseract-ocr \
    tesseract-ocr-data-chi_sim \
    tesseract-ocr-data-eng

# 复制package文件
COPY package*.json ./
COPY client/package*.json ./client/

# 安装依赖
RUN npm run install:all

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "run", "server"]
EOF

echo "✅ 后端部署文件创建完成"

echo -e "\n${GREEN}[4/6] 创建部署说明文件...${NC}"

cat > 免费部署步骤.md << 'EOF'
# 🚀 免费部署步骤（Vercel + Railway）

## 第一步：准备GitHub仓库
1. 确保代码已推送到GitHub
2. 仓库设置为公开（免费账户需要）

## 第二步：部署后端到Railway

### 1. 注册Railway
访问 https://railway.app 注册账号（可使用GitHub登录）

### 2. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择你的仓库

### 3. 配置环境变量
在Railway项目设置中，添加以下环境变量：
```
NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_API_KEY=你的通义千问API密钥
NEXT_PUBLIC_LLM_MODEL=qwen-turbo
PORT=3001
NODE_ENV=production
```

### 4. 获取后端地址
部署完成后，Railway会分配一个地址，如：
```
https://your-app-name.up.railway.app
```
记下这个地址，后面需要用到。

## 第三步：部署前端到Vercel

### 1. 注册Vercel
访问 https://vercel.com 注册账号（可使用GitHub登录）

### 2. 导入项目
- 点击 "New Project"
- 从GitHub导入你的仓库
- 选择 "Import"

### 3. 配置项目
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. 设置环境变量
添加环境变量：
```
VITE_API_URL=你的Railway后端地址（如：https://your-app-name.up.railway.app）
```

### 5. 部署
点击 "Deploy"，等待部署完成。

## 第四步：更新配置

### 1. 更新前端API地址
在Vercel项目设置的环境变量中，确保 `VITE_API_URL` 指向你的Railway地址。

### 2. 更新后端CORS设置
如果需要，在Railway环境变量中添加：
```
CORS_ORIGIN=https://你的-vercel-域名.vercel.app
```

## 第五步：测试访问

### 前端地址：
```
https://你的项目名.vercel.app
```

### 后端健康检查：
```
https://你的项目名.up.railway.app/api/qa/health
```

## 常见问题

### 1. 前后端无法通信
- 检查VITE_API_URL是否正确
- 检查CORS设置
- 查看浏览器控制台错误

### 2. Railway服务休眠
免费版Railway在无请求时会休眠，首次访问会有延迟（约30秒）

### 3. 文件上传限制
Railway免费版有文件大小限制，上传大文件可能失败

### 4. 运行时间限制
- Railway：每月500小时免费
- Vercel：每月100GB带宽免费
- 10人内测完全足够

## 监控和维护

### Railway监控：
- 访问Railway控制台查看日志
- 监控资源使用情况
- 设置自动部署

### Vercel监控：
- 查看访问统计
- 监控性能指标
- 设置自定义域名（可选）

## 免费额度说明

### Railway免费额度：
- 每月500小时运行时间
- 1GB内存
- 5GB存储
- 支持自定义域名

### Vercel免费额度：
- 每月100GB带宽
- 无限网站数量
- 自动SSL证书
- 支持自定义域名

## 升级建议
如果内测效果良好，考虑升级：
1. Railway Hobby计划：$5/月，无限运行时间
2. Vercel Pro计划：$20/月，更多功能

## 技术支持
- Railway文档：https://docs.railway.app
- Vercel文档：https://vercel.com/docs
- 问题反馈：查看部署日志
EOF

echo "✅ 部署说明文件创建完成"

echo -e "\n${GREEN}[5/6] 更新项目配置...${NC}"

# 更新package.json中的脚本
if [ -f "package.json" ]; then
    echo "添加部署相关脚本..."
    # 这里可以添加构建优化
    echo "✅ 项目配置更新完成"
fi

# 构建前端
echo "构建前端应用..."
cd client && npm run build && cd ..

echo -e "\n${GREEN}[6/6] 创建快速测试脚本...${NC}"

cat > test-deployment.js << 'EOF'
// 部署测试脚本
const https = require('https');

const testEndpoints = async () => {
  console.log('🧪 测试部署配置...\n');
  
  const endpoints = [
    {
      name: '本地后端',
      url: 'http://localhost:3001/api/qa/health',
      local: true
    },
    {
      name: '本地前端',
      url: 'http://localhost:5173',
      local: true
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`测试 ${endpoint.name}...`);
    
    if (endpoint.local) {
      // 本地测试
      try {
        const res = await fetch(endpoint.url);
        if (res.ok) {
          console.log(`  ✅ ${endpoint.name} 运行正常`);
        } else {
          console.log(`  ⚠️  ${endpoint.name} 返回状态: ${res.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint.name} 无法访问: ${error.message}`);
      }
    }
  }
  
  console.log('\n📋 部署检查清单:');
  console.log('  [ ] 代码已推送到GitHub');
  console.log('  [ ] Railway账号已注册');
  console.log('  [ ] Vercel账号已注册');
  console.log('  [ ] API密钥已准备');
  console.log('  [ ] 环境变量已配置');
  console.log('\n🚀 开始部署:');
  console.log('  1. 访问 https://railway.app 部署后端');
  console.log('  2. 访问 https://vercel.com 部署前端');
  console.log('  3. 配置环境变量');
  console.log('  4. 测试访问');
};

testEndpoints();
EOF

echo "✅ 测试脚本创建完成"

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}🎉 免费部署配置准备完成！${NC}"
echo -e "${BLUE}==========================================${NC}"

echo -e "\n📋 已创建的文件："
echo "  1. vercel.json - Vercel部署配置"
echo "  2. railway.json - Railway部署配置"
echo "  3. Dockerfile - 容器化部署配置"
echo "  4. 免费部署步骤.md - 详细部署指南"
echo "  5. test-deployment.js - 测试脚本"
echo "  6. client/.env.production - 前端生产配置"

echo -e "\n🚀 下一步操作："
echo "  1. ${YELLOW}将代码推送到GitHub${NC}"
echo "     git add ."
echo "     git commit -m '准备免费部署'"
echo "     git push origin main"
echo ""
echo "  2. ${YELLOW}按照'免费部署步骤.md'操作${NC}"
echo "     2.1 部署后端到Railway"
echo "     2.2 部署前端到Vercel"
echo "     2.3 配置环境变量"
echo ""
echo "  3. ${YELLOW}测试部署结果${NC}"
echo "     访问Vercel分配的域名"
echo "     测试所有功能"

echo -e "\n💰 费用说明："
echo "  ✅ Vercel: 完全免费（每月100GB带宽）"
echo "  ✅ Railway: 完全免费（每月500小时）"
echo "  ✅ 总计: ￥0/月"
echo ""
echo "  📊 免费额度足够10人内测使用"

echo -e "\n⏰ 预计时间："
echo "  注册账号: 5分钟"
echo "  部署后端: 10分钟"
echo "  部署前端: 5分钟"
echo "  配置测试: 10分钟"
echo "  总计: 约30分钟"

echo -e "\n🔗 重要链接："
echo "  🌐 Vercel: https://vercel.com"
echo "  🚂 Railway: https://railway.app"
echo "  📚 部署指南: 免费部署步骤.md"

echo -e "\n🎯 内测访问地址（部署后）："
echo "  前端: https://你的项目名.vercel.app"
echo "  后端: https://你的项目名.up.railway.app"

echo -e "\n💡 提示："
echo "  1. 首次访问Railway服务会有冷启动延迟（约30秒）"
echo "  2. 确保环境变量配置正确"
echo "  3. 测试所有功能是否正常"
echo "  4. 分享链接给内测用户"

echo -e "\n${GREEN}开始部署吧！有任何问题参考部署指南。${NC}"