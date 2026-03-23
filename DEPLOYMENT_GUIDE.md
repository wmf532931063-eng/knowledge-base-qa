# 知识库AI问答系统部署指南

## 📋 系统要求
- Node.js 18+ 
- NPM 9+
- Git
- 云服务器（推荐）或部署平台

## 🚀 快速部署方案（10人内测）

### 方案A：腾讯云轻量应用服务器（推荐）

#### 1. 购买服务器（每月约¥24-48）
- 访问 [腾讯云轻量应用服务器](https://buy.cloud.tencent.com/lighthouse)
- 选择配置：2核2G/3M带宽/40GB SSD
- 系统镜像：Ubuntu 22.04 LTS

#### 2. 服务器初始化
```bash
# 1. 连接到服务器
ssh ubuntu@你的服务器IP

# 2. 更新系统
sudo apt update && sudo apt upgrade -y

# 3. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 安装PM2（进程管理器）
sudo npm install -g pm2

# 5. 安装Git
sudo apt install -y git

# 6. 安装Nginx（可选，用于域名访问）
sudo apt install -y nginx
```

#### 3. 部署应用
```bash
# 1. 克隆代码
git clone https://github.com/你的用户名/knowledge-base-qa.git
cd knowledge-base-qa

# 2. 安装依赖
npm run install:all

# 3. 构建前端
npm run build

# 4. 配置环境变量
cp .env.example .env
# 编辑.env文件，填入你的API密钥

# 5. 使用PM2启动应用
pm2 start "npm run server" --name "knowledge-backend"
pm2 start "npm run client" --name "knowledge-frontend"
pm2 save
pm2 startup
```

#### 4. 配置域名访问（可选）
```bash
# 配置Nginx
sudo nano /etc/nginx/sites-available/knowledge-base

# 添加以下配置
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/knowledge-base /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方案B：Vercel + Railway组合（全免费）

#### 1. 前端部署到Vercel
1. 访问 [Vercel](https://vercel.com) 并注册
2. 导入GitHub仓库
3. 配置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - 环境变量：设置 `VITE_API_URL` 为后端地址

#### 2. 后端部署到Railway
1. 访问 [Railway](https://railway.app) 并注册
2. 新建项目，选择"Deploy from GitHub"
3. 配置环境变量（与.env文件一致）
4. Railway会自动分配域名，如：`https://your-app.up.railway.app`

#### 3. 修改前端API地址
在 `client/.env.production` 中：
```
VITE_API_URL=https://your-app.up.railway.app
```

## 🔧 环境配置

### 1. 生产环境.env文件
创建 `.env.production`：
```env
# 通义千问配置
NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_API_KEY=你的API密钥
NEXT_PUBLIC_LLM_MODEL=qwen-turbo

# 服务器配置
PORT=3001
NODE_ENV=production

# 安全配置
SESSION_SECRET=生成一个随机字符串
CORS_ORIGIN=https://你的域名.com
```

### 2. 生成SESSION_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📁 项目结构优化

创建 `server/ecosystem.config.js` 用于PM2：
```javascript
module.exports = {
  apps: [{
    name: 'knowledge-backend',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

## 🔐 安全设置

### 1. 防火墙配置
```bash
# 允许必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # API端口
sudo ufw enable
```

### 2. SSL证书（免费）
```bash
# 使用Certbot获取免费SSL证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com
```

## 📊 监控与日志

### 1. PM2监控
```bash
# 查看应用状态
pm2 status
pm2 logs knowledge-backend

# 监控资源使用
pm2 monit
```

### 2. 设置日志轮转
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🚨 故障排除

### 常见问题：

#### 1. 应用无法启动
```bash
# 检查端口占用
sudo lsof -i :3001
sudo lsof -i :5173

# 检查依赖
npm list --depth=0
```

#### 2. 前端无法连接后端
```bash
# 检查CORS设置
curl -I http://localhost:3001/api/qa/health
```

#### 3. API密钥无效
```bash
# 测试Qwen连接
node test-qwen-connection.js
```

## 📈 内测阶段优化建议

### 1. 用户管理
- 添加简单的用户名/密码认证
- 使用环境变量存储用户名密码
- 限制访问IP（可选）

### 2. 监控
- 添加访问日志
- 监控API调用次数
- 设置API调用限制

### 3. 备份
```bash
# 创建备份脚本
mkdir -p ~/backups
cp -r knowledge-base-qa ~/backups/knowledge-base-qa-$(date +%Y%m%d)
```

## 📞 技术支持

### 快速测试命令
```bash
# 测试后端
curl http://localhost:3001/api/qa/health

# 测试前端
curl http://localhost:5173

# 测试知识库
curl -X POST http://localhost:3001/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是四柱预测学？"}'
```

## ⚡ 一键部署脚本

创建 `deploy.sh`：
```bash
#!/bin/bash

echo "🚀 开始部署知识库AI问答系统..."

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 安装PM2
sudo npm install -g pm2

# 克隆代码
git clone https://github.com/你的用户名/knowledge-base-qa.git
cd knowledge-base-qa

# 安装依赖
npm run install:all

# 构建前端
npm run build

# 启动服务
pm2 start "npm run server" --name "knowledge-backend"
pm2 start "npm run client" --name "knowledge-frontend"

echo "✅ 部署完成！"
echo "🌐 访问地址: http://服务器IP:5173"
echo "🔧 API地址: http://localhost:3001/api/qa/health"
```

## 🎯 下一步

1. **立即部署**：选择方案A或B，按步骤操作
2. **测试访问**：确保所有功能正常工作
3. **邀请用户**：分享访问链接给内测用户
4. **收集反馈**：根据用户反馈进行优化

---

**部署状态检查清单**：
- [ ] 服务器/平台准备就绪
- [ ] 代码克隆完成
- [ ] 依赖安装成功
- [ ] 环境变量配置正确
- [ ] 应用构建完成
- [ ] 服务启动正常
- [ ] 防火墙/安全设置
- [ ] 域名解析（可选）
- [ ] SSL证书（可选）
- [ ] 备份机制

如有问题，请查看故障排除部分或联系技术支持。