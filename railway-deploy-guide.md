# 🚂 Railway部署步骤指南

## 第一步：登录Railway
1. 访问 https://railway.app
2. 使用GitHub账号登录
3. 完成邮箱验证（如果需要）

## 第二步：创建新项目
1. 点击顶部导航栏的 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 授权Railway访问你的GitHub账号（如果第一次使用）

## 第三步：选择仓库
1. 在仓库列表中，找到并选择 **"knowledge-base-qa"**
2. Railway会自动开始部署

## 第四步：配置环境变量
部署开始后，需要配置环境变量：

1. 在项目页面，点击 **"Variables"** 标签页
2. 添加以下环境变量：

```env
# 通义千问配置
NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_API_KEY=sk-4f671b53e09f4cec8bbff84c81ab7891
NEXT_PUBLIC_LLM_MODEL=qwen-turbo

# 服务器配置
PORT=3001
NODE_ENV=production

# 可选：其他配置
TZ=Asia/Shanghai
```

3. 点击 **"Save"**

## 第五步：等待部署完成
1. 查看 **"Deployments"** 标签页的部署状态
2. 等待状态变为 **"SUCCESS"** (约2-3分钟)

## 第六步：获取后端地址
部署完成后：

1. 在项目页面，找到 **"Domains"** 部分
2. 你会看到一个地址，格式如：
   ```
   https://your-project-name.up.railway.app
   ```
3. **复制这个地址**，后面部署前端时需要

## 第七步：测试后端
1. 访问你的后端健康检查地址：
   ```
   https://your-project-name.up.railway.app/api/qa/health
   ```
2. 应该看到：
   ```json
   {"status":"ok","timestamp":"..."}
   ```

## 常见问题

### 问题1：部署失败
- 检查环境变量是否正确
- 查看部署日志（点击失败的部署）
- 确保API密钥有效

### 问题2：服务无法访问
- 等待30秒（冷启动）
- 检查端口配置
- 查看服务日志

### 问题3：API密钥无效
- 确认密钥正确
- 检查账户余额
- 测试本地连接

## 重要提示
1. Railway免费版每月有500小时限制
2. 服务在无请求时会休眠，首次访问有延迟
3. 支持自定义域名（可选）
4. 可以设置自动部署（当GitHub有更新时）

## 完成标志
✅ Railway项目创建完成
✅ 环境变量配置完成  
✅ 部署状态显示SUCCESS
✅ 获得后端地址：https://xxx.up.railway.app
✅ 健康检查通过

**记下你的Railway地址，下一步部署前端需要！**