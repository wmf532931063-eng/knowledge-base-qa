// Railway部署专用启动文件
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 检查依赖是否安装
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, using environment variables directly');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 健康检查端点
app.get('/api/qa/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'QA system is running',
    timestamp: new Date().toISOString()
  });
});

// 简单的测试端点
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Railway部署测试成功',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '知识库AI问答系统',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/qa/health',
      test: '/api/test'
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 知识库AI问答系统后端启动成功`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;