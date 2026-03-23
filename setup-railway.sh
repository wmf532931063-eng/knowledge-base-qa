#!/bin/bash

# Railway部署快速设置脚本

set -e

echo "🚂 设置Railway部署..."
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}📋 检查项目配置...${NC}"

# 检查必要的文件
required_files=("package.json" "server/index.js" "client/package.json")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  缺少必要文件：${NC}"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    fi
    exit 1
fi

echo "✅ 项目文件检查通过"

echo -e "\n${GREEN}[1/5] 创建Railway配置文件...${NC}"

# 创建railway.toml
if [ ! -f "railway.toml" ]; then
    cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run server"
healthcheckPath = "/api/qa/health"
EOF
    echo "✅ railway.toml 创建完成"
else
    echo "✅ railway.toml 已存在"
fi

echo -e "\n${GREEN}[2/5] 创建环境变量模板...${NC}"

# 创建环境变量文件
if [ ! -f ".env.railway" ]; then
    cat > .env.railway << 'EOF'
# Railway 生产环境配置
# 在Railway控制台中设置这些变量

NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_API_KEY=你的通义千问API密钥
NEXT_PUBLIC_LLM_MODEL=qwen-turbo
PORT=3001
NODE_ENV=production

# 可选：腾讯云备用API
# TENCENT_SECRET_ID=your_secret_id
# TENCENT_SECRET_KEY=your_secret_key
# TENCENT_API_ENDPOINT=https://lkeap.tencentcloudapi.com
EOF
    echo "✅ .env.railway 创建完成"
else
    echo "✅ .env.railway 已存在"
fi

echo -e "\n${GREEN}[3/5] 更新package.json脚本...${NC}"

# 检查是否需要更新package.json
if [ -f "package.json" ]; then
    # 检查是否已有railway脚本
    if ! grep -q '"railway"' package.json; then
        echo "添加Railway相关脚本..."
        # 这里可以添加JSON操作，但为了简单，提供手动步骤
        echo -e "${YELLOW}手动添加以下脚本到package.json：${NC}"
        cat << 'EOF'

  "scripts": {
    ...原有脚本...
    "railway:deploy": "railway up",
    "railway:logs": "railway logs",
    "railway:status": "railway status"
  }
EOF
    else
        echo "✅ Railway脚本已配置"
    fi
fi

echo -e "\n${GREEN}[4/5] 创建部署检查脚本...${NC}"

# 创建部署检查脚本
cat > check-deployment.js << 'EOF'
const https = require('https');

console.log('🔍 检查部署配置...\n');

const checks = [
    {
        name: '项目结构',
        check: () => {
            const fs = require('fs');
            const required = ['package.json', 'server/index.js'];
            const missing = required.filter(file => !fs.existsSync(file));
            return missing.length === 0;
        },
        message: '项目文件完整'
    },
    {
        name: 'Node.js版本',
        check: () => {
            const version = process.version;
            const major = parseInt(version.replace('v', '').split('.')[0]);
            return major >= 18;
        },
        message: 'Node.js 18+ 支持'
    },
    {
        name: '环境变量',
        check: () => {
            const fs = require('fs');
            return fs.existsSync('.env') || fs.existsSync('.env.example');
        },
        message: '环境变量文件存在'
    },
    {
        name: '依赖包',
        check: () => {
            const fs = require('fs');
            return fs.existsSync('node_modules') && fs.existsSync('client/node_modules');
        },
        message: '依赖已安装'
    }
];

let allPassed = true;

checks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.name}...`);
    try {
        if (check.check()) {
            console.log(`   ✅ ${check.message}`);
        } else {
            console.log(`   ❌ 检查失败`);
            allPassed = false;
        }
    } catch (error) {
        console.log(`   ❌ 检查错误: ${error.message}`);
        allPassed = false;
    }
});

console.log('\n📋 部署检查结果:');
if (allPassed) {
    console.log('🎉 所有检查通过，可以部署！');
} else {
    console.log('⚠️  存在检查失败项，请修复后再部署');
}

console.log('\n🚀 下一步操作:');
console.log('  1. 确保代码已推送到GitHub');
console.log('  2. 访问 https://railway.app');
console.log('  3. 新建项目 → 从GitHub导入');
console.log('  4. 配置环境变量');
console.log('  5. 等待部署完成');
EOF

echo "✅ 检查脚本创建完成"

echo -e "\n${GREEN}[5/5] 创建一键部署命令...${NC}"

# 创建一键部署命令说明
cat > README-RAILWAY.md << 'EOF'
# Railway 一键部署命令

## 前提条件
1. 安装 Railway CLI（可选）：
   ```bash
   npm install -g @railway/cli
   ```

2. 登录 Railway：
   ```bash
   railway login
   ```

## 部署步骤

### 方法1：使用Railway网站（推荐）
1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. 配置环境变量
6. 等待部署完成

### 方法2：使用Railway CLI
```bash
# 初始化项目
railway init

# 链接到Railway项目
railway link

# 部署到生产环境
railway up
```

### 方法3：使用GitHub Actions（高级）
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - uses: railwayapp/action@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 环境变量配置

在Railway控制台中设置以下变量：

```env
NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_API_KEY=你的API密钥
NEXT_PUBLIC_LLM_MODEL=qwen-turbo
PORT=3001
NODE_ENV=production
```

## 访问地址

部署完成后，Railway会提供类似下面的地址：
```
https://your-project-name.up.railway.app
```

## 常用命令

```bash
# 查看部署状态
railway status

# 查看日志
railway logs

# 重启服务
railway restart

# 查看监控
railway metrics
```

## 故障排除

### 部署失败
1. 检查依赖是否正确安装
2. 验证环境变量
3. 查看部署日志

### 服务不可用
1. 检查健康检查端点
2. 验证端口配置
3. 查看服务状态

### API错误
1. 确认API密钥有效
2. 检查网络连接
3. 验证请求格式
```

echo "✅ 部署文档创建完成"

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}✅ Railway部署设置完成！${NC}"
echo -e "${BLUE}==========================================${NC}"

echo -e "\n📋 已创建的文件："
echo "  🚂 railway.toml - Railway部署配置"
echo "  🌿 .env.railway - 环境变量模板"
echo "  🔍 check-deployment.js - 部署检查脚本"
echo "  📚 README-RAILWAY.md - 部署指南"

echo -e "\n🎯 下一步操作："
echo "  1. ${YELLOW}将代码推送到GitHub${NC}"
echo "     git add ."
echo "     git commit -m '准备Railway部署'"
echo "     git push origin main"
echo ""
echo "  2. ${YELLOW}访问 https://railway.app${NC}"
echo "     - 注册/登录账号"
echo "     - 创建新项目"
echo "     - 从GitHub导入"
echo ""
echo "  3. ${YELLOW}配置环境变量${NC}"
echo "     - 在Railway控制台设置"
echo "     - 使用 .env.railway 中的变量"
echo ""
echo "  4. ${YELLOW}测试部署${NC}"
echo "     node check-deployment.js"
echo "     访问分配的域名"

echo -e "\n💰 费用说明："
echo "  ✅ Railway免费版包含："
echo "     每月500小时运行时间"
echo "     512MB内存"
echo "     5GB存储"
echo "     支持自定义域名"
echo "  ✅ 10人内测完全足够"

echo -e "\n⏱️  预计时间："
echo "  注册Railway: 2分钟"
echo "  导入项目: 1分钟"
echo "  配置变量: 2分钟"
echo "  等待部署: 2-5分钟"
echo "  总计: 7-10分钟"

echo -e "\n🔗 重要链接："
echo "  🚂 Railway官网: https://railway.app"
echo "  📚 Railway文档: https://docs.railway.app"
echo "  🛠️  CLI文档: https://docs.railway.app/guides/cli"

echo -e "\n💡 提示："
echo "  1. 首次部署后，服务需要约30秒冷启动"
echo "  2. 确保GitHub仓库为公开（免费版要求）"
echo "  3. 环境变量在Railway控制台中设置"
echo "  4. 免费版每月有500小时限制，足够内测使用"

echo -e "\n🚀 快速开始命令："
echo "  # 运行检查"
echo "  node check-deployment.js"
echo ""
echo "  # 部署到Railway"
echo "  # 访问 https://railway.app 手动部署"

echo -e "\n${GREEN}开始Railway部署吧！${NC}"
echo "完成后，你的后端API就可以通过公网访问了。"