# Railway部署配置指南

## 环境变量配置

在Railway的Variables页面设置以下环境变量：

### 必需的环境变量：
```
PORT=3001
NODE_ENV=production
```

### 可选的环境变量（用于完整功能）：
```
NEXT_PUBLIC_LLM_API_KEY=你的Qwen API密钥
NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_MODEL=qwen-turbo
```

## 启动命令配置

Railway会自动使用`npm start`命令启动应用，我们已经配置好。

如果遇到启动问题，可以在Railway的Settings中手动设置：

```
Start Command: node railway-start.js
```

## 健康检查

Railway会自动检查`/health`端点，确保返回200状态码。

## 常见问题解决

### 1. 服务器启动后立即停止
- 检查环境变量`PORT`是否正确设置
- 确保应用监听`0.0.0.0`而不是`localhost`

### 2. 内存不足
- Railway免费版有512MB内存限制
- 如果内存不足，可以：
  1. 简化应用
  2. 升级到付费计划
  3. 使用更轻量的依赖

### 3. 依赖安装失败
- 检查`package.json`依赖是否完整
- 确保依赖版本兼容

## 调试技巧

1. **查看部署日志**：在Railway的Deployments页面查看详细日志
2. **本地测试**：使用`node railway-start.js`在本地测试
3. **简化测试**：先部署最基本的功能，逐步添加

## 联系支持

如果问题持续，可以：
1. 查看Railway文档：https://docs.railway.app
2. 联系Railway支持
3. 考虑使用其他部署平台（如Render、Vercel Serverless）